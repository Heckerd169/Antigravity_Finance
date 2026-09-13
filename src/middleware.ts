import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

/* Der Auth-Gate läuft auf allem, was nicht hier ausgenommen ist.
 *
 * ⚠️ **`webmanifest` kam am 13.09.2026 dazu (v3-04, `MB-7`) und muss bleiben.**
 * Ein Web-App-Manifest wird vom Gerät geholt, bevor irgendetwas über den
 * Anmeldezustand feststeht — lief es durch den Gate, bekäme das Gerät die
 * **Anmeldeseite als HTML** statt des Manifests. Das Symbol startete dann ohne
 * jede Zugehörigkeits-Angabe, also genau so kaputt wie vorher, und der Fehler
 * sähe aus wie „das Manifest wirkt nicht" statt wie „das Manifest kommt nie an".
 *
 * Die Bild-Endungen decken `mobil-icon-512.png` bereits ab; `.webmanifest` stand
 * in keiner Liste, weil es vor v3-04 keine solche Datei gab.
 * Wächter: `tests/e2e/mobil-vollbild.spec.ts`. */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest)$).*)",
  ],
};
