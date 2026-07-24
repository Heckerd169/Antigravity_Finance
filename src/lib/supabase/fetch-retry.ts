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
