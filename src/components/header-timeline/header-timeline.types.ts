export type HeaderTimelineProps = {
  /** Aktuell angezeigter Monat als YYYY-MM. */
  targetMonth: string;
  /** Aktueller Monat (server time, YYYY-MM). Wird für Status-Pill-Logik gebraucht. */
  currentMonth: string;
  /** Sprint 5: Anzahl UNASSIGNED-Fragmente im Vormonat (linke-Flanke-Subzeile). */
  unassignedPreviousMonthCount: number;
  /** v2-02 P4 (§6 M3): Ausreißer-Subzeile unter der Pill — z. B.
   *  "Autoversicherung 650 €". Die Zeilenhöhe ist permanent reserviert;
   *  null/undefined = unsichtbar (nur opacity schaltet, kein Layout-Sprung).
   *  Datenquelle (Ausreißer-Definition) ist weiterhin Architekten-TBD (§6). */
  outlierLabel?: string | null;
};

export type PillVariant = "running" | "past" | "future";
