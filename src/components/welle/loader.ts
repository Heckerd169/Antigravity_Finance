import {
  calculatePlannedSparrateForMonth,
  calculateSparrateForMonth,
  type AppSupabaseClient,
} from "@/lib/rpc";
import type { WelleData, WelleMonthPoint } from "./welle.types";

/** "YYYY-MM-01" für (year, monthIndex 0..11). Kein new Date() — Timezone-Risiko (§7 Regel 9).
 *
 *  Exportiert seit v2-24 P2: `actions.ts` baut die Vorjahres-Monate nach derselben
 *  Regel. Zwei Fassungen derselben Datums-Bildung wären genau die Art von Dublette,
 *  die irgendwann auseinanderläuft. */
export function dbDate(year: number, monthIndex: number): string {
  const mm = String(monthIndex + 1).padStart(2, "0");
  return `${year}-${mm}-01`;
}

/**
 * Lädt die Datengrundlage der Jahres-Welle (§9): 12× Ist + 12× Plan des aktiven
 * Jahres. Die kumulierten Treppen-Werte sind reine Aufsummierung der
 * Monats-RPC-Ergebnisse (§2.1: keine eigene Sparrate-Berechnung; null = 0 beim
 * Summieren).
 *
 * ── Was diese Funktion seit v2-24 P2 NICHT mehr tut ─────────────────────────
 *
 * Sie lädt **weder die Abweichungs-Treiber noch die zwölf Vorjahres-Werte**.
 * Beides wandert in `loadWelleExtras` und wird erst geholt, wenn der Nutzer die
 * Welle anfasst.
 *
 * Der Grund ist gemessen, nicht vermutet: `get_year_deviation_drivers` kostet
 * **357 ms** in der Datenbank — rund **drei Viertel** der gesamten Rechenzeit
 * eines Dashboard-Aufbaus. Gebraucht wird das Ergebnis ausschließlich im
 * Hover-Tooltip und im Popup. Beim Ziehen einer Zahlung auf eine Karte ist das
 * Popup zu, und `revalidatePath` löst trotzdem den vollständigen Neu-Aufbau aus —
 * es wurde also bei jeder Geste bezahlt und nie angesehen. Die zwölf
 * Vorjahres-Aufrufe speisen allein die gold-gestrichelte Linie im Popup.
 *
 * Beleg und Messung: `V2/befunde_2026-08-16_performance.md` §6 ①.
 *
 * Aus 37 Netzrunden werden damit 24 — und die 357 ms verlassen den kritischen
 * Pfad vollständig. Die verbleibenden 24 bündelt Phase 4 zu einer.
 */
export async function loadWelleData(
  client: AppSupabaseClient,
  args: {
    userId: string;
    activeYear: number;
  },
): Promise<WelleData> {
  const { userId, activeYear } = args;

  const activeDates = Array.from({ length: 12 }, (_, i) => dbDate(activeYear, i));

  const [istMonthly, planMonthly] = await Promise.all([
    Promise.all(
      activeDates.map((month) =>
        calculateSparrateForMonth(client, { userId, month }),
      ),
    ),
    Promise.all(
      activeDates.map((month) =>
        calculatePlannedSparrateForMonth(client, { userId, month }),
      ),
    ),
  ]);

  let istCum = 0;
  let planCum = 0;
  const points: WelleMonthPoint[] = istMonthly.map((ist, i) => {
    const plan = planMonthly[i];
    istCum += ist ?? 0;
    planCum += plan ?? 0;
    return {
      monthIndex: i,
      istMonthly: ist,
      planMonthly: plan,
      istCumulative: istCum,
      planCumulative: planCum,
    };
  });

  return {
    activeYear,
    prevYear: activeYear - 1,
    points,
  };
}
