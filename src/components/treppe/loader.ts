import {
  calculatePlannedSparrateForMonth,
  calculateSparrateForMonth,
  type AppSupabaseClient,
} from "@/lib/rpc";
import type { TreppeData, TreppeMonthPoint } from "./treppe.types";

/** "YYYY-MM-01" für (year, monthIndex 0..11). Kein new Date() — Timezone-Risiko (§7 Regel 9). */
function dbDate(year: number, monthIndex: number): string {
  const mm = String(monthIndex + 1).padStart(2, "0");
  return `${year}-${mm}-01`;
}

/**
 * Lädt die 12 Monats-Sparraten (Ist + Plan) des aktiven Jahres und — sofern das
 * Vorjahr abgeschlossen ist — den kumulierten Jahresendwert des Vorjahres
 * (Σ Jan–Dez X-1) als gold-gestrichelte Referenzlinie (§9, kumulierte Lesart
 * vom PM bestätigt 24.05.2026).
 *
 * Vorjahres-Referenz-Regel (§9): Linie nur, wenn das Vorjahr vollständig in der
 * Vergangenheit liegt — also `activeYear <= currentCalendarYear`. Im Zukunftsjahr
 * (activeYear > currentCalendarYear) ist das Vorjahr (= laufendes Jahr) noch nicht
 * abgeschlossen → keine Linie.
 *
 * Sparrate-RPCs werden bewusst OHNE deleted_at-Filter aufgerufen (snapshot-integer
 * seit Pre-Sprint-10-C.2, CLAUDE.md §2.1 + Briefing A2).
 */
export async function loadTreppeData(
  client: AppSupabaseClient,
  args: {
    userId: string;
    activeYear: number;
    currentCalendarYear: number;
    netMonthly: number | null;
  },
): Promise<TreppeData> {
  const { userId, activeYear, currentCalendarYear, netMonthly } = args;
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
  const points: TreppeMonthPoint[] = istMonthly.map((ist, i) => {
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

  // Vorjahres-Endwert nur, wenn das Vorjahr abgeschlossen ist UND überhaupt Daten
  // hat. Liefern alle 12 RPCs null (kein Income/keine Basis — z. B. Test-User vor
  // 2026), gibt es keine sinnvolle Referenz → keine Linie. Eine Gold-Linie bei 0 €
  // wäre irreführend (suggeriert „nichts gespart" statt „keine Daten"). Ein echtes
  // Teiljahr mit einzelnen null-Monaten summiert dagegen normal (null = 0).
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
    netMonthly,
  };
}
