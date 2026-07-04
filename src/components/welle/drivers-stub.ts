/*
 * B2-Platzhalter-Treiber (Briefing v2-02 §4): Das DISPLAY (Top-1 im Welle-Tooltip,
 * Top-3 im Popup-Monatsklick) ist entschieden — die HEURISTIK (B2) nicht. Dieser
 * Stub liefert eine feste, klar als Platzhalter erkennbare Struktur; die echte
 * B2-Heuristik ersetzt später ausschließlich dieses Modul, ohne UI-Änderung.
 *
 * Bewusste Port-Abweichung von welle_v1.html: Das Mockup zeigt für drei Monate
 * fiktive Beispiel-Treiber („Miete 1.200 €"). Neben echten Finanzdaten wären
 * erfundene Beträge irreführend — der Stub zeigt deshalb überall den offenen
 * B2-Status (das Mockup tut dasselbe für alle Nicht-Beispiel-Monate).
 */

export type DriverEntry = {
  label: string;
  /** true = B2-Stub; die echte Heuristik liefert false + echte Kartendaten. */
  isPlaceholder: boolean;
};

const PLACEHOLDER: DriverEntry = {
  label: "B2-Heuristik offen",
  isPlaceholder: true,
};

/** Monats-Map analog zur Mockup-Struktur `drivers={…}` — im Stub bewusst leer;
 *  die B2-Heuristik füllt sie später pro Monat mit echten Top-3-Einträgen. */
const DRIVERS_BY_MONTH: Partial<Record<number, DriverEntry[]>> = {};

/** Top-1-Treiber für den Welle-Hover-Tooltip (§9). */
export function getTop1Driver(monthIndex: number): DriverEntry {
  return DRIVERS_BY_MONTH[monthIndex]?.[0] ?? PLACEHOLDER;
}

/** Top-3-Treiber für den Popup-Monatsklick (§9). */
export function getTop3Drivers(monthIndex: number): DriverEntry[] {
  return DRIVERS_BY_MONTH[monthIndex] ?? [PLACEHOLDER];
}
