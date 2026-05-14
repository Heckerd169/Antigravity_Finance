/*
 * Monats-Helper — reine String- und Intl-Funktionen.
 * KEIN `new Date(year, month-1, 1)` zur DB-Wert-Konstruktion (CLAUDE.md §7
 * Regel 9, Timezone-Risiko). Intl.DateTimeFormat ist OK für UI-Labels, weil
 * das Ergebnis nie zur DB wandert.
 */

const YM_REGEX = /^(\d{4})-(\d{2})$/;

/** V1-Boundary-Konstanten — absurd weit gesetzt (Sprint 3 §3.4, Stolperfalle 7). */
export const MIN_NAVIGABLE_YM = "1900-01";
export const MAX_NAVIGABLE_YM = "2999-12";

/** Aktueller Monat in YYYY-MM, basierend auf Server-Zeit. */
export function getCurrentMonthYM(): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

function isValidYM(s: string): boolean {
  const m = YM_REGEX.exec(s);
  if (!m) return false;
  const month = Number(m[2]);
  return month >= 1 && month <= 12;
}

/** Validiert + parst einen URL-Param-String. Fallback bei null/invalid: getCurrentMonthYM(). */
export function parseMonthParam(input: string | string[] | undefined): string {
  if (typeof input !== "string") return getCurrentMonthYM();
  if (!isValidYM(input)) return getCurrentMonthYM();
  return input;
}

/** Addiert ±N Monate auf einem YYYY-MM-String, ohne Date-Objekt. */
export function addMonths(ym: string, delta: number): string {
  const m = YM_REGEX.exec(ym);
  if (!m) throw new Error(`addMonths: invalid input "${ym}"`);
  const year = Number(m[1]);
  const month = Number(m[2]);
  const total = year * 12 + (month - 1) + delta;
  const newYear = Math.floor(total / 12);
  const newMonth = ((total % 12) + 12) % 12 + 1;
  return `${String(newYear).padStart(4, "0")}-${String(newMonth).padStart(2, "0")}`;
}

/** Vergleicht zwei YYYY-MM-Strings: -1 (a < b), 0 (a == b), 1 (a > b). */
export function compareMonths(a: string, b: string): -1 | 0 | 1 {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/** Konvertiert YYYY-MM zu YYYY-MM-01 für RPC-Aufrufe. */
export function ymToDbDate(ym: string): string {
  return `${ym}-01`;
}

const MONTH_FORMATTER = new Intl.DateTimeFormat("de-DE", {
  month: "long",
  year: "numeric",
});

/** UI-Label: "2026-05" → "Mai 2026" (de-DE). */
export function formatMonthLabel(ym: string): string {
  const m = YM_REGEX.exec(ym);
  if (!m) return ym;
  const year = Number(m[1]);
  const month = Number(m[2]);
  // UTC-Date verhindert TZ-bedingten Monatswechsel, das Ergebnis geht nur ins UI.
  const date = new Date(Date.UTC(year, month - 1, 1));
  return MONTH_FORMATTER.format(date);
}
