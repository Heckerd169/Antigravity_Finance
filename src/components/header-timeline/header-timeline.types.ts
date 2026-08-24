export type HeaderTimelineProps = {
  /** Aktuell angezeigter Monat als YYYY-MM. */
  targetMonth: string;
  /** Aktueller Monat (server time, YYYY-MM). Wird für Status-Pill-Logik gebraucht. */
  currentMonth: string;
  /** Sprint 5: Anzahl UNASSIGNED-Fragmente im Vormonat (linke-Flanke-Subzeile). */
  unassignedPreviousMonthCount: number;
  /** v2-28: Untere Navigationsschranke als YYYY-MM, abgeleitet aus den Daten
   *  (`deriveMinNavigableYm` in `@/lib/months`). Der Zurück-Pfeil ist
   *  deaktiviert, sobald der Vormonat davor läge.
   *
   *  **Absichtlich PFLICHT und absichtlich ein Prop.** Vorher war es eine
   *  Konstante, die diese Komponente selbst importierte — sie stand auf
   *  „1900-01" und hat den gebauten Deaktiviert-Pfad nie ausgelöst. Ein
   *  optionales Prop mit Vorgabewert hätte denselben Fehler wieder möglich
   *  gemacht: Wer die Komponente künftig woanders einbaut, soll vom Compiler
   *  gefragt werden, wo die Grenze herkommt — nicht stillschweigend eine
   *  bekommen. */
  minNavigableYm: string;
  /** v2-02 P4 (§6 M3): Ausreißer-Subzeile unter der Pill — z. B.
   *  "Autoversicherung 650 €". Die Zeilenhöhe ist permanent reserviert;
   *  null/undefined = unsichtbar (nur opacity schaltet, kein Layout-Sprung).
   *  Datenquelle (Ausreißer-Definition) ist weiterhin Architekten-TBD (§6). */
  outlierLabel?: string | null;
};

export type PillVariant = "running" | "past" | "future";
