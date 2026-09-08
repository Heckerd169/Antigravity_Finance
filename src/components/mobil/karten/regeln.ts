/* Die Regeln des Tabs „Karten" auf /mobil (Handoff §5) — Wortlaute, Statuspunkt
 * und Balken, ohne Importe.
 *
 * Importfrei, damit der Wächter DIESE Datei transpiliert und ausführt, statt
 * die Regel nachzubauen (CLAUDE.md §2, Muster `zuordnen/zustand.ts`).
 *
 * ── Was hier NICHT entschieden wird ────────────────────────────────────────
 * Ob eine Karte offen, bezahlt oder überschritten ist, sagt `card-state.ts` —
 * dieselben Resolver wie am Schreibtisch. Diese Datei übersetzt deren Ergebnis
 * nur in Wort, Punktfarbe und Balkenanteil. Eine zweite Zustandsregel wäre
 * LL-26 in der Form „Nachbauen"; sie liefe genau so lange synchron, bis jemand
 * eine der beiden ändert. */

export type KartenFilter = "alle" | "fixkosten" | "budget" | "einmalig" | "einnahmen";

export const FILTER_REIHENFOLGE: readonly KartenFilter[] = [
  "alle",
  "fixkosten",
  "budget",
  "einmalig",
  "einnahmen",
];

export function filterTitel(f: KartenFilter): string {
  switch (f) {
    case "alle":
      return "Alle";
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

/** Der aufgelöste Zustand einer Karte, wie ihn `card-state.ts` liefert.
 *  Die drei Typen haben verschiedene Zustandsmengen — deshalb steht der Typ
 *  daneben und wird nicht aus dem Zustand erraten (LL-12). */
export type KartenZustand =
  | { typ: "FIXED_COST"; zustand: "ghost" | "paid" | "open" }
  | { typ: "INCOME"; zustand: "ghost" | "received" | "expected" }
  | { typ: "BUDGET"; zustand: "ghost" | "done" | "over" | "running" };

export type PunktFarbe = "neutral" | "teal" | "rot";

/** Die Farbe des 6-px-Punkts in Zeile 1 (Handoff §5).
 *
 *  v3 Regel 2: **Rot bedeutet ausschließlich Abweichung.** „Offen" und
 *  „Laufend" sind der Normalzustand der meisten Karten an den meisten Tagen und
 *  bekommen deshalb Neutral — nicht Rot. Rot trägt allein „überschritten", und
 *  das gibt es nur bei BUDGET (LL-12). */
export function punktFarbe(k: KartenZustand): PunktFarbe {
  if (k.typ === "FIXED_COST") return k.zustand === "paid" ? "teal" : "neutral";
  if (k.typ === "INCOME") return k.zustand === "received" ? "teal" : "neutral";
  if (k.zustand === "over") return "rot";
  return k.zustand === "done" ? "teal" : "neutral";
}

/** Das Statuswort in Zeile 3 (Handoff §5).
 *
 *  `buchungen` ist die Zahl der in diesem Monat zugeordneten Zahlungen. Sie
 *  erscheint nur bei einer laufenden Budget-Karte: Dort ist „offen" zwar nicht
 *  falsch, sagt aber weniger als „3 Buchungen".
 *
 *  `ghost` heißt: Der Monat liegt in der Zukunft, es ist noch nichts fällig.
 *  Der Handoff kennt den Fall nicht (Annahme B12) — „geplant" behauptet weder
 *  Erledigung noch offene Arbeit. */
export function statusWort(k: KartenZustand, buchungen: number): string {
  if (k.typ === "FIXED_COST") {
    switch (k.zustand) {
      case "ghost":
        return "geplant";
      case "paid":
        return "erledigt";
      case "open":
        return "offen";
    }
  }
  if (k.typ === "INCOME") {
    switch (k.zustand) {
      case "ghost":
        return "geplant";
      case "received":
        return "erledigt";
      case "expected":
        return "offen";
    }
  }
  switch (k.zustand) {
    case "ghost":
      return "geplant";
    case "done":
      return "erledigt";
    case "over":
      return "überschritten";
    case "running":
      if (buchungen <= 0) return "offen";
      return buchungen === 1 ? "1 Buchung" : `${buchungen} Buchungen`;
  }
}

/** Die Beschriftung des Kartentyps in Zeile 3, links vor dem Statuswort. */
export function typWort(typ: "FIXED_COST" | "BUDGET" | "INCOME"): string {
  switch (typ) {
    case "FIXED_COST":
      return "Fixkosten";
    case "BUDGET":
      return "Budget";
    case "INCOME":
      return "Einnahme";
  }
}

/** Der Anteil, den der 3-px-Balken füllt — zwischen 0 und 1.
 *
 *  **Zwei verschiedene Fragen, zwei verschiedene Antworten** (LL-12):
 *  · Eine BUDGET-Karte füllt sich mit dem, was ausgegeben wurde. Der Balken
 *    zeigt den Verbrauch gegen den Plan und ist bei Überschreitung voll.
 *  · Eine FIXKOSTEN- oder EINNAHMEN-Karte kennt kein Teilweise: Sie ist bezahlt
 *    oder nicht. Ein Balken bei 60 % behauptete dort einen Verlauf, den es
 *    nicht gibt.
 *
 *  Ein Plan von 0 € ergibt keinen Anteil — dann bleibt der Balken leer, statt
 *  durch Null zu teilen. */
export function balkenAnteil(z: {
  zustand: KartenZustand;
  verbraucht: number;
  plan: number;
}): number {
  if (z.zustand.typ === "BUDGET") {
    if (z.plan <= 0) return 0;
    return Math.max(0, Math.min(1, z.verbraucht / z.plan));
  }
  return punktFarbe(z.zustand) === "teal" ? 1 : 0;
}

/** Die Füllfarbe des Balkens. Sie folgt dem Punkt — eine Karte, die rot punktet,
 *  hat keinen türkisen Balken. */
export function balkenFarbe(k: KartenZustand, anteil: number): PunktFarbe {
  const punkt = punktFarbe(k);
  if (punkt === "rot") return "rot";
  if (punkt === "teal") return "teal";
  // Eine laufende Budget-Karte, die den Plan genau trifft, ist fertig — aber
  // nicht überschritten.
  return anteil >= 1 ? "teal" : "neutral";
}

/** Die rechte Spalte in Zeile 3: „von {Plan}" bei Ausgaben, ein Zustandswort
 *  bei Einnahmen (Handoff §5, Record #11). */
export function rechtsUnten(k: KartenZustand, planText: string): string {
  if (k.typ === "INCOME") {
    return k.zustand === "received" ? "eingegangen" : "erwartet";
  }
  return `von ${planText}`;
}

/** Der Text im aufgeklappten Bereich, wenn dort nichts liegt. */
export const KEINE_BUCHUNG = "Noch keine Buchung in diesem Monat";
