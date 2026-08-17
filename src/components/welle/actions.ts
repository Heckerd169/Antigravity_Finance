"use server";

import { createClient } from "@/lib/supabase/server";
import {
  calculateSparrateForMonth,
  getYearDeviationDrivers,
} from "@/lib/rpc";
import { parseYearDrivers } from "./drivers";
import { dbDate } from "./loader";
import type { WelleExtras } from "./welle.types";

/** Top-N je Monat — Tooltip zeigt 1, Popup 3 plus ggf. die Gehalts-Zeile (§9). */
const DRIVER_LIMIT = 3;

/**
 * Lädt nach, was die Welle erst beim Anfassen zeigt (v2-24 P2): die
 * Abweichungs-Treiber je Monat und den kumulierten Vorjahres-Endwert für die
 * gold-gestrichelte B6-Linie.
 *
 * ── Warum das eine Server Action ist und KEIN Aufruf aus dem Browser ────────
 *
 * `get_year_deviation_drivers` nimmt **kein** `p_user_id`. Sie liest `auth.uid()`
 * selbst und wirft `28000` ohne Session (§6 Stolperfalle 4). Ein Aufruf über den
 * Browser-Client träfe damit auf eine Funktion, die ihre eigene Sitzung erwartet —
 * hier läuft sie über den Server-Client, der das Sitzungs-Cookie mitführt.
 *
 * ── Warum das Jahr geprüft wird ─────────────────────────────────────────────
 *
 * Eine Server Action ist ein von außen erreichbarer Endpunkt; `activeYear` kommt
 * vom Browser. RLS schützt die Daten (es sind ohnehin nur die eigenen), aber ein
 * unplausibler Wert würde 12 sinnlose Datenbank-Aufrufe auslösen. Die Prüfung ist
 * damit kein Datenschutz, sondern eine Lastschranke.
 *
 * ── Fehler-Haltung ──────────────────────────────────────────────────────────
 *
 * Ein Treiber-Fehler darf die Welle nicht mitreißen — dieselbe Haltung wie vorher
 * im Loader: er landet als `null` in `drivers`, die Kurve steht weiter, und der
 * Tooltip sagt „Treiber nicht verfügbar" statt zu schweigen.
 */
export async function loadWelleExtras(activeYear: number): Promise<WelleExtras> {
  if (!Number.isInteger(activeYear) || activeYear < 1900 || activeYear > 2200) {
    throw new Error(`Unplausibles Jahr: ${activeYear}`);
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht authentifiziert");

  // Das laufende Jahr wird SERVER-seitig bestimmt, nicht vom Browser
  // übernommen — sonst entscheidet der Aufrufer mit, ob eine Vorjahres-Linie
  // gezeichnet wird. Identisch zu dem, was `page.tsx` vorher übergab.
  const currentCalendarYear = new Date().getUTCFullYear();

  // Vorjahres-Referenz-Regel (§9 B6): Linie nur, wenn das Vorjahr vollständig in
  // der Vergangenheit liegt. Im Zukunftsjahr ist das Vorjahr (= laufendes Jahr)
  // noch nicht abgeschlossen → keine Linie.
  const hasPrevYear = activeYear <= currentCalendarYear;
  const prevYear = activeYear - 1;

  const driversPromise = getYearDeviationDrivers(supabase, {
    year: activeYear,
    limit: DRIVER_LIMIT,
  })
    .then(parseYearDrivers)
    .catch((err: unknown) => {
      console.error("B2-Treiber-Load fehlgeschlagen", err);
      return null;
    });

  // 12 Einzelaufrufe — bewusst vorerst so gelassen: Sie liegen jetzt außerhalb des
  // kritischen Pfads und laufen nur noch auf Anfrage. Phase 4 bündelt sie
  // zusammen mit den 24 Aufrufen der Kurve zu einer einzigen Netzrunde.
  const prevPromise: Promise<(number | null)[]> = hasPrevYear
    ? Promise.all(
        Array.from({ length: 12 }, (_, i) =>
          calculateSparrateForMonth(supabase, {
            userId: user.id,
            month: dbDate(prevYear, i),
          }),
        ),
      )
    : Promise.resolve([]);

  const [drivers, prevIstMonthly] = await Promise.all([
    driversPromise,
    prevPromise,
  ]);

  // B6 (§9): Vorjahres-Endwert nur, wenn das Vorjahr abgeschlossen ist UND
  // überhaupt Daten hat. Liefern alle 12 RPCs null → keine Referenz → keine Linie.
  // Eine Gold-Linie bei 0 € wäre irreführend („nichts gespart" ≠ „keine Daten").
  // Ein echtes Teiljahr mit einzelnen null-Monaten summiert dagegen normal.
  const prevHasData = prevIstMonthly.some((v) => v !== null);
  const prevYearEndCumulative =
    hasPrevYear && prevHasData
      ? prevIstMonthly.reduce<number>((sum, v) => sum + (v ?? 0), 0)
      : null;

  return { prevYearEndCumulative, drivers };
}
