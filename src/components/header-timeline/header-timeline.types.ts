export type HeaderTimelineProps = {
  /** Aktuell angezeigter Monat als YYYY-MM. */
  targetMonth: string;
  /** Aktueller Monat (server time, YYYY-MM). Wird für Status-Pill-Logik gebraucht. */
  currentMonth: string;
};

export type PillVariant = "running" | "past" | "future";
