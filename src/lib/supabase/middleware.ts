import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { createTimeoutFetch } from "./fetch-retry";
import type { Database } from "./types";

/**
 * Zeitlimit je Auth-Versuch (v2-24 Phase 1).
 *
 * ── Wie diese Zahl zustande kommt ───────────────────────────────────────────
 *
 * Sie ist gegen zwei Fehler gleichzeitig gerichtet, und die ziehen in
 * entgegengesetzte Richtungen:
 *
 *   zu HOCH → Vercel kappt die Edge-Middleware nach 25 s und liefert
 *             `504 MIDDLEWARE_INVOCATION_TIMEOUT` — eine Fehlerseite ohne Ausweg.
 *             Das war der Ausfall vom 16.08.2026.
 *   zu NIEDRIG → eine langsame, aber erfolgreiche Anmeldung wird abgeschnitten
 *             und der Nutzer auf `/login` geschickt, obwohl seine Sitzung gültig
 *             ist. Ärgerlich und unnötig.
 *
 * Gemessen in Produktion über 24 Stunden: `/auth/v1/user` im Schnitt 329 ms,
 * p95 1.081 ms, **Maximum 5.205 ms**. Der erste Entwurf stand auf 4 s und hätte
 * genau diesen Maximalfall abgeschnitten — aufgefallen ist das, weil ein
 * Prüfstrecken-Lauf unter Last auf der Anmeldeseite endete.
 *
 * 8 s liegt damit über allem, was je gemessen wurde, und bleibt mit dem
 * Wiederholversuch (~16 s im schlechtesten Fall) klar unter 25 s. Der
 * Wiederholversuch greift ausschließlich bei einem netzwerk-toten Versuch, und
 * der scheitert sofort statt erneut die Frist auszuschöpfen.
 */
const AUTH_TIMEOUT_MS = 8000;

/**
 * Auth-Gate vor jeder Anfrage.
 *
 * ── Was diese Funktion seit v2-24 NICHT mehr tut ────────────────────────────
 *
 * Sie fragt **nicht mehr `profiles.onboarded_at` ab**. Das war eine zweite,
 * eigenständige Netzrunde — auf **jeder** Anfrage der ganzen App, also auch auf
 * jedem Server-Action-POST und jedem RSC-Nachladen. Bezahlt wurde damit eine
 * Information, die `src/app/page.tsx` in derselben `profiles`-Zeile **ohnehin
 * schon lädt** (dort stehen `tax_class` und `tax_year`); `onboarded_at` ist jetzt
 * einfach die dritte Spalte desselben Selects.
 *
 * Der Wächter ist dadurch nicht schwächer geworden, nur umgezogen — er sitzt jetzt
 * in `app/page.tsx` und `app/onboarding/page.tsx`, jeweils als `redirect()` **vor**
 * jeder Ausgabe. Was wegfällt, ist ausschließlich die doppelte Abfrage.
 *
 * ── Warum ein Zeitlimit, und warum der Ausweg /login heißt ──────────────────
 *
 * Vorher hatte diese Funktion 71 Zeilen und kein einziges `try`, `catch` oder
 * `AbortSignal`. War die Datenbank langsam, wartete sie — bis Vercel nach 25 s
 * abschnitt und eine Fehlerseite zeigte, aus der der Nutzer nicht herauskam.
 *
 * Jetzt endet ein nicht feststellbarer Anmeldezustand auf `/login`. Das ist
 * bewusst gewählt und hat einen unangenehmen Rand: Ist die Anmeldung eigentlich
 * gültig und nur der Auth-Dienst gerade nicht erreichbar, landet der Nutzer
 * trotzdem auf der Anmeldeseite. Die Alternative wäre, die Anfrage durchzulassen —
 * dann müsste die Seite selbst den Anmeldezustand klären, könnte es aus demselben
 * Grund ebenfalls nicht, und würde entweder hängen oder hierher zurückverweisen.
 *
 * **Eine Anfrage, deren Anmeldung nicht feststellbar ist, darf das Dashboard nicht
 * erreichen.** Deshalb `/login` — erklärbar und wiederholbar, statt einer
 * Fehlerseite ohne Ausgang.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // v2-24: Zeitlimit je Versuch. Der Server-Client nimmt `fetchWithRetry`
      // (siehe `server.ts`) — hier braucht es zusätzlich die Frist, weil eine
      // Edge-Middleware ohne Frist zur Fehlerseite führt.
      global: { fetch: createTimeoutFetch(AUTH_TIMEOUT_MS) },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const pathname = request.nextUrl.pathname;
  const isLoginRoute = pathname === "/login";

  const redirectTo = (target: string) => {
    const url = request.nextUrl.clone();
    url.pathname = target;
    return NextResponse.redirect(url);
  };

  let user: Awaited<
    ReturnType<typeof supabase.auth.getUser>
  >["data"]["user"] = null;

  try {
    ({
      data: { user },
    } = await supabase.auth.getUser());
  } catch (err) {
    // Zeitlimit oder Netz-Fehler. `user` bleibt null → derselbe Weg wie „nicht
    // angemeldet". Der Unterschied steht nur im Log, damit die beiden Fälle
    // auseinanderzuhalten sind.
    console.warn(
      "[middleware] Anmeldezustand nicht feststellbar:",
      err instanceof Error ? err.message : err,
    );
  }

  if (!user) {
    // Auf der Anmeldeseite selbst darf niemand im Kreis geschickt werden.
    return isLoginRoute ? supabaseResponse : redirectTo("/login");
  }

  // Angemeldet — die Anmeldeseite ist nicht mehr erreichbar. Der Gegenpart für
  // `/onboarding` liegt seit v2-24 in der Seite selbst (Begründung oben).
  if (isLoginRoute) return redirectTo("/");

  return supabaseResponse;
}
