/*
 * Monats-Helper — reine String- und Intl-Funktionen.
 * KEIN `new Date(year, month-1, 1)` zur DB-Wert-Konstruktion (CLAUDE.md §7
 * Regel 9, Timezone-Risiko). Intl.DateTimeFormat ist OK für UI-Labels, weil
 * das Ergebnis nie zur DB wandert.
 */

const YM_REGEX = /^(\d{4})-(\d{2})$/;

/** Obere Navigationsschranke — bewusst weit. Der Forecast SOLL blätterbar sein;
 *  nach vorn endet die Bühne nicht an den Daten, sondern an der Rechenbarkeit.
 *  (v2-28: die untere Schranke ist dynamisch geworden, diese hier nicht.) */
export const MAX_NAVIGABLE_YM = "2999-12";

/**
 * Untere Navigationsschranke, abgeleitet aus den Daten.
 *
 * ANLASS (v2-28): Hier stand bis zum 24.08.2026 ein Gegenstück
 * `MIN_NAVIGABLE_YM = "1900-01"` — ein als „absurd weit" markierter
 * V1-Platzhalter aus Sprint 3, der nie nachgezogen wurde. Der Deaktiviert-Pfad
 * in `header-timeline` war gebaut und funktionsfähig und wurde **nie
 * ausgelöst**: Der Zurück-Pfeil führte über Jahrzehnte in eine leere Bühne —
 * Sparrate `null`, null Zahlungen, null Karten. Kein Fehler, aber ein
 * Versprechen ohne Inhalt.
 *
 * WARUM ABGELEITET UND NICHT FEST VERDRAHTET: Ein fester Wert `"2025-01"` wäre
 * heute richtig und nach dem nächsten Import älterer Auszüge still falsch —
 * dieselbe Klasse wie die Mengen-Annahme aus LL-28, die mit ihrer Begründung
 * veraltet, ohne dass jemand es merkt. Die abgeleitete Grenze korrigiert sich
 * selbst.
 *
 * WARUM AUS DEN KARTEN UND NICHT AUS DEN ZAHLUNGEN: `page.tsx` lädt die Karten
 * ohnehin, samt `first_active_month`. Das Minimum daraus kostet **keine
 * zusätzliche Netzrunde** — und nach LL-29 zählt man bei Trägheit Netzrunden,
 * erzeugt also am besten gar keine. Gemessen am 24.08.2026: früheste Karte
 * 2025-01, früheste Zahlung 02.01.2025, frühestes Einkommen 2025-01. Die Karten
 * sind also tatsächlich die äußere Grenze. **Sollten je Zahlungen VOR der
 * ersten Karte liegen, ist diese Funktion die Stelle, an der das auffallen
 * muss** — dann braucht es eine zweite Quelle, nicht einen größeren Puffer.
 *
 * @param firstActiveMonths `cards.first_active_month` als `YYYY-MM-DD` (oder
 *        bereits `YYYY-MM`). Unbrauchbare Einträge werden übersprungen, nicht
 *        geraten.
 * @param fallbackYm Grenze, wenn es keine einzige verwertbare Karte gibt —
 *        sinnvollerweise der aktuelle Monat. Ohne Karten gibt es nichts, wohin
 *        man zurückblättern könnte.
 */
export function deriveMinNavigableYm(
  firstActiveMonths: readonly (string | null | undefined)[],
  fallbackYm: string,
): string {
  let min: string | null = null;

  for (const raw of firstActiveMonths) {
    if (typeof raw !== "string") continue;
    // `YYYY-MM-DD` → `YYYY-MM`; ein bereits gekürzter Wert überlebt das
    // unverändert. Reine String-Arbeit, kein `new Date()` (§7 Regel 8).
    const ym = raw.slice(0, 7);
    if (!isValidYM(ym)) continue;
    // Nullgepolsterte YYYY-MM-Strings sind lexikografisch == chronologisch —
    // dieselbe Annahme, auf der `compareMonths` unten steht.
    if (min === null || ym < min) min = ym;
  }

  return min ?? fallbackYm;
}

/** Aktueller Monat in YYYY-MM, basierend auf Server-Zeit. */
export function getCurrentMonthYM(): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

/** Heutiger Tag im Monat (1–31), Server-Zeit in UTC — wie getCurrentMonthYM().
 *  v2-15 (LQ-2): Stichtag der Ausstehend-Anzeige. */
export function getCurrentDayOfMonth(): number {
  return new Date().getUTCDate();
}

/** Anzahl Tage eines YYYY-MM-Monats (28–31).
 *  v2-15 (LQ-2): klammert den Fälligkeitstag — ein Dauerauftrag zum 31. ist im
 *  Februar am 28. fällig. UTC-Date, das Ergebnis geht nie in die DB. */
export function getDaysInMonth(ym: string): number {
  const m = YM_REGEX.exec(ym);
  if (!m) throw new Error(`getDaysInMonth: invalid input "${ym}"`);
  const year = Number(m[1]);
  const month = Number(m[2]);
  // Tag 0 des Folgemonats = letzter Tag dieses Monats.
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
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

const MONTH_NAME_FORMATTER = new Intl.DateTimeFormat("de-DE", { month: "long" });

/** UI-Label ohne Jahr: "2026-01" → "Januar" (de-DE).
 *
 *  v2-25 (KJ-1) für die Folgen-Zeile im Lösch-Toast: `Sparrate Januar · −53,70 €`.
 *  Das Jahr fehlt bewusst — die Wirkung wird über das Kalenderjahr des gerade
 *  angezeigten Monats gemessen, es kann also gar kein anderes sein. Ein „2026"
 *  dahinter wäre eine Angabe ohne Unterscheidungswert in einer Zeile, die kurz
 *  genug bleiben muss, um in fünf Sekunden gelesen zu werden. */
export function formatMonthNameOnly(ym: string): string {
  const m = YM_REGEX.exec(ym);
  if (!m) return ym;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, 1));
  return MONTH_NAME_FORMATTER.format(date);
}
