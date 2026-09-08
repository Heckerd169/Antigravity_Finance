/* Die Regeln des Tabs „Übersicht" — Wortlaute und Zustände, ohne Importe.
 *
 * Importfrei aus demselben Grund wie `zuordnen/zustand.ts`: Der Wächter
 * transpiliert DIESE Datei und führt sie aus, statt die Regel nachzubauen. Ein
 * Nachbau driftet ab und gibt falsche Sicherheit (CLAUDE.md §2).
 *
 * Die Wortlaute stammen aus Record #11 und sind nicht verhandelbar: Ein Rest
 * auf einer Fixkosten-Karte heißt **„unbezahlt"**, nie „frei" — „frei" würde
 * eine Wahl behaupten, die es bei einer Fixkostenzahlung nicht gibt. */

export type KachelTyp = "fixkosten" | "budget" | "einnahmen";

/** Die Reihenfolge der drei Kacheln — **Fixkosten · Einnahmen · Budget**.
 *
 *  So zeigt es der Entwurf (`screenshots/01-uebersicht.png`), und der Handoff
 *  ist ausdrücklich „high-fidelity, Nachbau pixelgenau". Die Aufzählung im
 *  README-Text („Fixkosten … Budget … Einnahmen") nennt die drei **Wortlaute**,
 *  nicht ihre Anordnung — das Bild ist an dieser Stelle die einzige Aussage über
 *  die Reihenfolge.
 *
 *  **Bewusst anders als das Sheet „Karte wählen"**, das nach Fixkosten · Budget ·
 *  Einmalig · Einnahmen gruppiert. Dort sucht man ein Ziel und geht die Liste
 *  von oben durch; hier stehen drei Kacheln nebeneinander, und die mittlere ist
 *  die, auf die der Blick zuerst fällt. */
export const KACHEL_REIHENFOLGE: readonly KachelTyp[] = [
  "fixkosten",
  "einnahmen",
  "budget",
];

/** Kartentyp → Kachel. Drei Typen, drei Kacheln, kein `else`. */
export function kachelTyp(
  typ: "FIXED_COST" | "BUDGET" | "INCOME",
): KachelTyp {
  if (typ === "INCOME") return "einnahmen";
  if (typ === "BUDGET") return "budget";
  return "fixkosten";
}

export function kachelTitel(k: KachelTyp): string {
  switch (k) {
    case "fixkosten":
      return "FIXKOSTEN";
    case "budget":
      return "BUDGET";
    case "einnahmen":
      return "EINNAHMEN";
  }
}

/** Die Unterzeile einer Kachel (Handoff §4, Record #11).
 *
 *  `restText` ist der bereits formatierte Rest („1.593,00 €"); die
 *  Formatierung bleibt bei `format.ts`, damit sie nicht zweimal im Repo steht.
 *  Bei den Einnahmen gibt es keinen Rest, sondern einen Zustand: „eingegangen"
 *  erst, wenn **jede** Einnahmen-Karte des Monats eingegangen ist — sonst
 *  behauptete die Kachel Vollständigkeit, die nicht da ist. */
export function kachelUnterzeile(z: {
  kachel: KachelTyp;
  restText: string;
  alleEingegangen: boolean;
}): string {
  switch (z.kachel) {
    case "fixkosten":
      return `${z.restText} unbezahlt`;
    case "budget":
      return `${z.restText} frei`;
    case "einnahmen":
      return z.alleEingegangen ? "eingegangen" : "erwartet";
  }
}

/** Titel der Einstiegskarte: „3 Umsätze zuordnen" | „1 Umsatz zuordnen" |
 *  „Alles zugeordnet". */
export function einstiegTitel(offen: number): string {
  if (offen <= 0) return "Alles zugeordnet";
  return offen === 1 ? "1 Umsatz zuordnen" : `${offen} Umsätze zuordnen`;
}

/** Die Zeile darunter — sie sagt, was das für die Sparrate bedeutet. */
export function einstiegUnterzeile(offen: number): string {
  return offen > 0
    ? "Die Sparrate ist vorläufig, bis der Stapel leer ist"
    : "Die Sparrate ist endgültig";
}

/** Fußzeile. Ohne Zuordnung in diesem Monat bleibt sie bei der Formulierung
 *  des Entwurfs — sie sagt „hier ist noch nichts passiert", nicht „es gibt
 *  nichts". */
export function fusszeile(z: { empfaenger: string; karte: string } | null): string {
  return z === null
    ? "noch nichts in dieser Sitzung"
    : `Zuletzt zugeordnet: ${z.empfaenger} → ${z.karte}`;
}

/** Der letzte realisierte Monat im gezeigten Jahr — die Teal/Grau-Grenze der
 *  Welle (§9 D1).
 *
 *  Liegt das gezeigte Jahr vor dem laufenden, sind alle zwölf Monate
 *  realisiert; liegt es danach, keiner. Im laufenden Jahr ist es der laufende
 *  Monat selbst: Er ist angebrochen und trägt bereits Buchungen. */
export function realisierterIndex(jahr: number, laufendYm: string): number {
  const lj = Number(laufendYm.slice(0, 4));
  const lm = Number(laufendYm.slice(5, 7));
  if (jahr < lj) return 11;
  if (jahr > lj) return -1;
  return lm - 1;
}
