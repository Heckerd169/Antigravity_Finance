export type HeaderTimelineProps = {
  /** Aktuell angezeigter Monat als YYYY-MM. */
  targetMonth: string;
  /** Aktueller Monat (server time, YYYY-MM). Wird für Status-Pill-Logik gebraucht. */
  currentMonth: string;
  /** Sprint 5: Anzahl UNASSIGNED-Fragmente im Vormonat (linke-Flanke-Subzeile). */
  unassignedPreviousMonthCount: number;
};

export type PillVariant = "running" | "past" | "future";
