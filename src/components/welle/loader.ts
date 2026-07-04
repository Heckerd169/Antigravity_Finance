import {
  calculatePlannedSparrateForMonth,
  calculateSparrateForMonth,
  type AppSupabaseClient,
} from "@/lib/rpc";
import type { WelleData, WelleMonthPoint } from "./welle.types";

/** "YYYY-MM-01" für (year, monthIndex 0..11). Kein new Date() — Timezone-Risiko (§7 Regel 9). */
function dbDate(year: number, monthIndex: number): string {
  const mm = String(monthIndex + 1).padStart(2, "0");
  return `${year}-${mm}-01`;
}

/**
 * Lädt die Datengrundlage der Jahres-Welle + Popup-Treppe (§9) über den
 * bestehenden RPC-Loop (Briefing v2-02 §3, Option A — KEIN neuer RPC/B5):
 * 12× Ist + 12× Plan des aktiven Jahres, plus — sofern das Vorjahr abgeschlossen
 * ist — den kumulierten Vorjahres-Jahresendwert (Σ Jan–Dez X-1) für die
 * gold-gestrichelte B6-Linie im Popup.
 *
 * Die kumulierten Treppen-Werte sind reine Aufsummierung der Monats-RPC-Ergebnisse
 * (§2.1: keine eigene Sparrate-Berechnung; null = 0 beim Summieren).
 *
 * Vorjahres-Referenz-Regel (§9 B6): Linie nur, wenn das Vorjahr vollständig in der
 * Vergangenheit liegt — also `activeYear <= currentCalendarYear`. Im Zukunftsjahr
 * (activeYear > currentCalendarYear) ist das Vorjahr (= laufendes Jahr) noch nicht
 * abgeschlossen → keine Linie.
 */
export async function loadWelleData(
  client: AppSupabaseClient,
  args: {
    userId: string;
    activeYear: number;
    currentCalendarYear: number;
  },
): Promise<WelleData> {
  const { userId, activeYear, currentCalendarYear } = args;
  const hasPrevYear = activeYear <= currentCalendarYear;
  const prevYear = activeYear - 1;

  const activeDates = Array.from({ length: 12 }, (_, i) => dbDate(activeYear, i));
  const prevDates = hasPrevYear
    ? Array.from({ length: 12 }, (_, i) => dbDate(prevYear, i))
    : [];

  const [istMonthly, planMonthly, prevIstMonthly] = await Promise.all([
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
    Promise.all(
      prevDates.map((month) =>
        calculateSparrateForMonth(client, { userId, month }),
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

  // B6 (§9): Vorjahres-Endwert nur, wenn das Vorjahr abgeschlossen ist UND überhaupt
  // Daten hat. Liefern alle 12 RPCs null → keine Referenz → keine Linie. Eine
  // Gold-Linie bei 0 € wäre irreführend („nichts gespart" ≠ „keine Daten").
  // Ein echtes Teiljahr mit einzelnen null-Monaten summiert dagegen normal (null = 0).
  const prevHasData = prevIstMonthly.some((v) => v !== null);
  const prevYearEndCumulative =
    hasPrevYear && prevHasData
      ? prevIstMonthly.reduce<number>((sum, v) => sum + (v ?? 0), 0)
      : null;

  return {
    activeYear,
    prevYear,
    points,
    prevYearEndCumulative,
  };
}
