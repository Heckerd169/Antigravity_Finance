/*
 * Einmal-Retry für netzwerk-tote Supabase-Fetches im Server-Client (24.07.2026).
 *
 * Anlass: Der Dashboard-Render feuert ~130 parallele REST-Calls; unter dem
 * Burst stirbt sporadisch eine Keep-Alive-Verbindung mit ECONNRESET, bevor
 * eine HTTP-Antwort existiert (`TypeError: fetch failed`). Der Throw-on-Error-
 * Wrapper (LL-2) wirft dann, die Server-Component crasht (Error-Digest
 * 3736018080).
 *
 * Retry-Regel — bewusst eng, damit nichts doppelt mutiert:
 *  - NUR wenn gar keine HTTP-Antwort vorliegt (TypeError; ein 4xx/5xx ist eine
 *    Antwort und wird nie wiederholt),
 *  - NUR für idempotente Lese-Pfade: GET/HEAD (PostgREST-Selects) sowie die
 *    Lese-RPCs, deren Namen die Whitelist unten matcht. Mutierende RPCs
 *    (process_csv_import, toggle_*, create_*, set_*) werden NIE wiederholt —
 *    eine nach Versand gestorbene Verbindung könnte serverseitig bereits
 *    ausgeführt worden sein.
 */

/** Lese-RPCs der App (Stand 24.07.2026): calculate_* / get_* / is_* /
 *  estimate_* + die drei Konfidenz-Helfer. */
const READONLY_RPC_PATH =
  /\/rest\/v1\/rpc\/(calculate_|get_|is_|estimate_|name_similarity|amount_match|frequency_match)/;

function urlOf(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

/** Entscheidet, ob ein netzwerk-toter Request gefahrlos wiederholbar ist. */
export function isRetriableRequest(
  input: RequestInfo | URL,
  init?: RequestInit,
): boolean {
  const method = (
    init?.method ??
    (input instanceof Request ? input.method : "GET")
  ).toUpperCase();
  if (method === "GET" || method === "HEAD") return true;
  return READONLY_RPC_PATH.test(urlOf(input));
}

/** fetch mit genau einem Retry nach Netz-Fehler auf idempotenten Lese-Pfaden. */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (err) {
    if (!(err instanceof TypeError) || !isRetriableRequest(input, init)) {
      throw err;
    }
    console.warn(
      "[supabase-fetch] Netz-Fehler, wiederhole Lese-Request:",
      urlOf(input).split("?")[0],
      err instanceof Error ? (err.cause ?? err.message) : err,
    );
    return fetch(input, init);
  }
}

/*
 * ── Zeitlimit-Variante für die Middleware (v2-24 Phase 1) ────────────────────
 *
 * Warum die Middleware ein anderes Verhalten braucht als der Server-Client:
 * Vercel kappt eine Edge-Middleware nach 25 Sekunden und liefert dann
 * `504 MIDDLEWARE_INVOCATION_TIMEOUT` — eine Fehlerseite, aus der der Nutzer sich
 * nicht herausklicken kann. Am 16.08.2026 ist genau das passiert: `/auth/v1/user`
 * brauchte im Median 6,5 s, `/rest/v1/profiles` 14,2 s, beide nacheinander.
 * Beleg und Messung: `V2/befunde_2026-08-16_performance.md` §4.
 *
 * Die Lehre daraus: **Im Auth-Gate ist Hängenbleiben teurer als Scheitern.** Aus
 * einem Fehler lässt sich ein Redirect machen, aus einer Zeitüberschreitung nicht.
 *
 * Bewusst NICHT über `AbortSignal.timeout()` gebaut, sondern über einen eigenen
 * `AbortController`. Zwei Gründe:
 *   1. Das Zeitlimit muss PRO VERSUCH neu gestellt werden — ein bereits abgelaufenes
 *      Signal im wiederverwendeten `init` würde den Wiederholversuch sofort
 *      mit-abbrechen, und der Retry wäre wirkungslos.
 *   2. Ein `signal`, das der Aufrufer selbst mitgibt, bleibt so erhalten, statt
 *      überschrieben zu werden.
 */

/** Baut ein `fetch` mit hartem Zeitlimit je Versuch — plus demselben Einmal-Retry
 *  wie `fetchWithRetry` (nur auf idempotenten Lese-Pfaden, siehe oben). */
export function createTimeoutFetch(
  timeoutMs: number,
): (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> {
  return async function timeoutFetch(input, init) {
    const attempt = async (): Promise<Response> => {
      const controller = new AbortController();
      const timer = setTimeout(() => {
        controller.abort(new Error(`Zeitlimit ${timeoutMs} ms überschritten`));
      }, timeoutMs);

      // Ein vom Aufrufer mitgegebenes Signal weiterreichen, statt es zu verlieren.
      const outer = init?.signal;
      const onOuterAbort = () => controller.abort(outer?.reason);
      outer?.addEventListener("abort", onOuterAbort, { once: true });

      try {
        return await fetch(input, { ...init, signal: controller.signal });
      } finally {
        clearTimeout(timer);
        outer?.removeEventListener("abort", onOuterAbort);
      }
    };

    try {
      return await attempt();
    } catch (err) {
      // Nur ein netzwerk-toter Versuch wird wiederholt — eine abgelaufene Frist
      // NICHT. Ein zweiter Anlauf würde die Wartezeit verdoppeln, und genau die
      // soll begrenzt werden.
      if (!(err instanceof TypeError) || !isRetriableRequest(input, init)) {
        throw err;
      }
      console.warn(
        "[supabase-fetch] Netz-Fehler in der Middleware, ein Wiederholversuch:",
        urlOf(input).split("?")[0],
      );
      return attempt();
    }
  };
}
