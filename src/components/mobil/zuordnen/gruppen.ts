/* Die vier Gruppen des Sheets „Karte wählen" auf /mobil (Handoff §2, Record
 * #7): Fixkosten · Budget · Einmalig · Einnahmen — in dieser Reihenfolge.
 *
 * „Einmalig" ist KEIN Kartentyp. Die Datenbank kennt drei Typen (FIXED_COST,
 * BUDGET, INCOME) und fünf Rhythmen; der Prototyp führt „Einmalig" als vierte
 * Spalte, weil eine einmalige Ausgabe („Autoreifen 480 €") im Sheet neben den
 * Monatsposten nichts zu suchen hat. Regel (Briefing A6): eine Ausgaben-Karte
 * mit Rhythmus ONCE ist „einmalig"; eine einmalige EINNAHME bleibt bei den
 * Einnahmen — so steht es auch im Prototyp („Steuererstattung 2025" unter E).
 *
 * Ein benanntes Prädikat mit Vollständigkeits-Test (LL-26): Jede Kombination
 * aus Typ und Rhythmus landet in GENAU einer Gruppe — der Wächter zählt das
 * nach, damit ein sechster Rhythmus oder ein vierter Typ nicht still durch
 * ein `else` fällt. Keine Importe, damit die Datei transpilierbar bleibt. */

export type KartenGruppe = "fixkosten" | "budget" | "einmalig" | "einnahmen";

export const GRUPPEN_REIHENFOLGE: readonly KartenGruppe[] = [
  "fixkosten",
  "budget",
  "einmalig",
  "einnahmen",
];

export function gruppenTitel(g: KartenGruppe): string {
  switch (g) {
    case "fixkosten":
      return "Fixkosten";
    case "budget":
      return "Budget";
    case "einmalig":
      return "Einmalig";
    case "einnahmen":
      return "Einnahmen";
  }
}

/** Typ und Rhythmus → Gruppe. Die Reihenfolge der Prüfungen ist die Regel:
 *  Einnahme schlägt Rhythmus, Rhythmus ONCE schlägt den Ausgaben-Typ. */
export function kartenGruppe(
  typ: "FIXED_COST" | "BUDGET" | "INCOME",
  rhythmus: "MONTHLY" | "QUARTERLY" | "SEMIANNUAL" | "ANNUAL" | "ONCE",
): KartenGruppe {
  if (typ === "INCOME") return "einnahmen";
  if (rhythmus === "ONCE") return "einmalig";
  if (typ === "BUDGET") return "budget";
  return "fixkosten";
}
