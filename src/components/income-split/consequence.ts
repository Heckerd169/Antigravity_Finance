/* v2-16 (PA-1) — die Rechnung der Konsequenz-Anzeige, bewusst OHNE Importe.
 *
 * Warum eine eigene Datei: Hier treffen zwei Regeln aufeinander, die beide
 * schon einmal teuer waren — das Vorzeichen gemeinsamer Einnahmen (§10) und
 * die Rundungs-Reihenfolge (LL-24). Eine Regel, die im Bauteil eingebettet ist,
 * lässt sich nicht einzeln prüfen; genau daran hat `BF-2` zwei Sprints
 * überlebt. Regressions-Wächter: `tests/e2e/consequence.spec.ts`.
 *
 * Keine Imports — sonst ließe sich die Datei im Test nicht transpilieren. */

/** Eine Zeile der Konsequenz-Anzeige — ein gemeinsamer Posten.
 *  Alle Beträge UNGERUNDET; gerundet wird erst bei der Anzeige. */
export type SplitConsequenceItem = {
  cardId: string;
  name: string;
  /** Eigener Plan-Anteil mit dem bisherigen Split-Faktor. */
  before: number;
  /** Eigener Plan-Anteil mit dem neuen Split-Faktor. */
  after: number;
  /** Wirkung auf die Sparrate: bei einer Ausgabe `after − before`, bei einer
   *  gemeinsamen EINNAHME das Gegenteil. */
  impact: number;
  /** true bei einer gemeinsamen Einnahme. */
  isIncome: boolean;
};

/** Das Ergebnis einer Gehaltsänderung, wie es der zweite Popup-Zustand zeigt
 *  (Design-Doku §10). */
export type SplitConsequence = {
  /** ICH-Anteil vor der Änderung, 0…1. */
  factorBefore: number;
  /** ICH-Anteil nach der Änderung, 0…1. */
  factorAfter: number;
  /** Geltungsmonat "YYYY-MM-01" — die Aussage gilt VORWÄRTS
   *  (Forward-Inheritance), nicht für diesen einen Monat. */
  effectiveMonth: string;
  items: SplitConsequenceItem[];
  totalBefore: number;
  totalAfter: number;
  /** Σ impact — die Held-Zahl. Positiv = es wird teurer, die Sparrate sinkt. */
  totalImpact: number;
};

/** Ein gemeinsamer Posten, wie ihn die Server-Action einsammelt. `plan` ist der
 *  effektive Plan (`get_effective_plan_for_month`) — der ROH-Wert ohne Split. */
export type SharedCardPlan = {
  cardId: string;
  name: string;
  plan: number;
  isIncome: boolean;
};

/** Unter einem halben Cent würde die Held-Zahl als „+0,00 €" erscheinen. Das
 *  ist der leere Fall in Zahlen und fällt unter dieselbe Regel wie der
 *  unveränderte Faktor: „keine Anzeige", nicht 0 (LL-20). */
export const IMPACT_EPSILON = 0.005;

/** §4.5: Der Split wirkt nur auf Beträge aus Plan oder Anpassung, nie auf einen
 *  realen Umsatz. Basis ist deshalb der Roh-Plan — NICHT
 *  `calculate_card_amount_for_month`, die den Anteil seit v2-13 bereits in sich
 *  trägt (CLAUDE.md §6 Stolperfalle 11). Ihn hier erneut anzuwenden wäre exakt
 *  der Doppel-Abzug, gegen den `BF-4` geschrieben wurde.
 *
 *  Posten ohne Plan (Karte im Monat inaktiv → `get_effective_plan_for_month`
 *  liefert 0) fallen heraus: An ihnen ändert sich nichts. */
export function buildConsequenceItems(
  cards: SharedCardPlan[],
  factorBefore: number,
  factorAfter: number,
): SplitConsequenceItem[] {
  const items: SplitConsequenceItem[] = [];
  for (const card of cards) {
    if (!(card.plan > 0)) continue;
    const before = card.plan * factorBefore;
    const after = card.plan * factorAfter;
    items.push({
      cardId: card.cardId,
      name: card.name,
      before,
      after,
      /* §10: Gemeinsame Einnahmen zählen in DERSELBEN Liste mit, „mit dem
         Vorzeichen, das ihnen zusteht". Ein größerer Anteil an einer
         gemeinsamen Einnahme ENTLASTET — ohne die Umkehr stimmte der Satz
         „Die Sparrate sinkt um denselben Betrag" nicht mehr. Heute existiert
         keine solche Karte (Befund L4); die Regel steht, damit sie nicht
         stillschweigend fehlt, wenn die erste angelegt wird. */
      impact: card.isIncome ? before - after : after - before,
      isIncome: card.isIncome,
    });
  }
  return items;
}

/** Auf volle Cent — die Genauigkeit, in der die Anzeige spricht. */
function cents(n: number): number {
  return Math.round(n * 100) / 100;
}

/** LL-24 — Runden ist eine Entscheidung, und hier ist sie zweigeteilt.
 *
 *  Die drei Spalten lassen sich nicht gleichzeitig zum Aufgehen bringen: Die
 *  Differenz zweier gerundeter Zahlen ist nicht die gerundete Differenz. Eine
 *  Ungereimtheit bleibt zwangsläufig übrig — die Frage ist nur, welche.
 *
 *  Am belegten Beispiel (v2-10 §5):
 *
 *      Posten     Bisher    Künftig   Diff.
 *      Miete      1.089,26  1.107,02  +17,76
 *      Strom         36,04     36,63   +0,59
 *      Internet      22,87     23,25   +0,37
 *      Rechtsschutz  15,45     15,70   +0,25
 *      ────────────────────────────────────
 *      Zusammen   1.163,62  1.182,60  +18,98
 *
 *  · `totalBefore` / `totalAfter` summieren die GERUNDETEN Zeilenwerte. Das
 *    sind genau die Zahlen, die der Nutzer vor sich sieht — wer die Spalte
 *    nachaddiert, bekommt die Summe heraus, die darunter steht. Ungerundet
 *    summiert stünde dort 1.163,63 und die Spalte ginge nicht auf.
 *    (Der Nutzer ist Wirtschaftsmathematiker mit Controlling-Hintergrund. Der
 *    addiert nach.)
 *  · `totalImpact` — die HELD-Zahl — summiert dagegen UNGERUNDET und wird erst
 *    am Ende gerundet: 18,98. Genau so steht sie im Entscheidungs-Record vom
 *    06.08.2026, in Design-Doku §10 und in §12.7. Sie ist zugleich die Differenz
 *    der beiden Spaltensummen (1.182,60 − 1.163,62 = 18,98), die Summenzeile
 *    bleibt also in sich stimmig.
 *
 *  Übrig bleibt: Die Diff.-SPALTE addiert sich fürs Auge auf 18,97. Das ist die
 *  unauffälligste der drei möglichen Abweichungen und bewusst gewählt.
 *
 *  Anker-Wirkung hat nichts davon — hier wird nichts persistiert, und keine
 *  Vergleichsfunktion rechnet dagegen. Die Sparrate selbst kommt unverändert
 *  aus `calculate_sparrate_for_month`. */
export function totalsOf(items: SplitConsequenceItem[]): {
  totalBefore: number;
  totalAfter: number;
  totalImpact: number;
} {
  return {
    totalBefore: items.reduce((s, i) => s + cents(i.before), 0),
    totalAfter: items.reduce((s, i) => s + cents(i.after), 0),
    totalImpact: items.reduce((s, i) => s + i.impact, 0),
  };
}

/** Der leere Fall (§10): kein Posten, oder eine Wirkung unter einem halben
 *  Cent. Dann speichert das Popup und schließt wie bisher — kein
 *  Zwischenbildschirm, keine Null-Zeile. */
export function isEmptyConsequence(
  items: SplitConsequenceItem[],
  totalImpact: number,
): boolean {
  return items.length === 0 || Math.abs(totalImpact) < IMPACT_EPSILON;
}
