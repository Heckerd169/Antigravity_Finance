import type { EnrichedCard } from "@/components/cards/cards.types";

/** v2-15 (`LQ-2`): die zwei Beträge der Kopfzeile „Planung".
 *
 *  `null` an einem der Felder heißt „keine Anzeige", nicht 0 (§7 Regel 17 /
 *  LL-20): Es gibt in diesem Monat keine Karte der jeweiligen Art. Ein Wert von
 *  `0` ist dagegen eine echte Aussage — „es steht nichts mehr aus". */
export type Liquidity = {
  /** Netto-Abfluss der festen Posten, die noch bevorstehen. */
  dueAmount: number | null;
  /** Summe der noch nicht verbrauchten Budgets. */
  budgetFree: number | null;
};

/** Der Verbrauch einer BUDGET-Karte: Netto-Abfluss ihrer verknüpften Fragmente.
 *
 *  Identisch zu `sumLinkedFragments` in `cards/card.tsx` — Ausgaben sind
 *  negative Fragmente, der Verbrauch ist positiv. Bewusst dieselbe Rechnung wie
 *  auf der Karte, damit Kopfzeile und Restbudget-Text nie auseinanderlaufen.
 *  Seit v2-11 (BF-5) wird verrechnet und nicht mehr über Beträge summiert. */
function budgetSpent(card: EnrichedCard): number {
  return -(card.linkedFragments ?? []).reduce((acc, f) => acc + f.amount, 0);
}

/**
 * Rechnet die Ausstehend-Anzeige aus den bereits geladenen Karten.
 *
 * **Server-seitig und ohne eigene Abfrage.** Die Funktion bekommt genau die
 * Karten, die das Karussell ohnehin rendert — samt Anteilsbetrag, effektivem
 * Plan, Bezahlt-Häkchen und verknüpften Fragmenten. Damit ist die
 * 1000-Zeilen-Grenze aus §7 Regel 18 (LL-21) strukturell unerreichbar: Gezählt
 * wird über `cards` (zweistellig), nicht über die mitwachsende Rohmasse, und es
 * gibt keinen nachgelagerten JS-Filter über eine gekappte Liste.
 *
 * **Die Aussage ist eine Vorhersage, keine Feststellung** (§8). Sie entsteht aus
 * dem Fälligkeitstag, nicht aus einem Bezahlt-Häkchen — Letzteres wurde in der
 * gesamten Historie nie gesetzt (Befund L6). Eine Karte kann deshalb „Offen"
 * sein und trotzdem nicht mehr zählen, weil ihr Termin verstrichen ist.
 *
 * **Ein fester Posten zählt genau dann, wenn** er eine Fixkosten- oder
 * Einnahmen-Karte mit Termin ist, dieser Termin nicht vor dem heutigen Tag
 * liegt, und weder ein Umsatz an ihr hängt noch sie abgehakt ist
 * (Entscheidung 06.08.2026, `sprints/sprint_v2-15_briefing.md`).
 *
 * Einnahmen **mindern** den Betrag: Die Zahl beantwortet „wie viel geht netto
 * noch vom Konto", und eine erwartete Einnahme geht nicht ab, sie kommt.
 *
 * Fixkosten und Budgets werden **nie** zu einer Zahl addiert (Befund L7): Der
 * eine Betrag sind Termine, der andere ist eine Erlaubnis. Ein Budget lässt sich
 * zurückhalten, ein Dauerauftrag nicht.
 *
 * @param cards   Die aktiven Karten des angezeigten Monats.
 * @param heute   Heutiger Tag im Monat (1–31). Als Zahl statt als `Date`, damit
 *                die Rechnung ohne Zeitzonen-Annahme prüfbar bleibt; der
 *                Aufrufer stellt sicher, dass der angezeigte Monat der laufende
 *                ist.
 * @param daysInMonth Länge des Monats — klammert `due_day` (ein Dauerauftrag zum
 *                31. ist im Februar am 28. fällig). Die Klammerung gehört
 *                hierher und nicht in die Spalte, sonst wäre der gespeicherte
 *                Wert bereits eine Interpretation (v2-14-Migration).
 */
export function computeLiquidity(
  cards: EnrichedCard[],
  heute: number,
  daysInMonth: number,
): Liquidity {
  let dueAmount = 0;
  let hasDueCards = false;
  let budgetFree = 0;
  let hasBudgetCards = false;

  for (const card of cards) {
    if (card.type === "BUDGET") {
      hasBudgetCards = true;
      // Ein abgehaktes Budget ist beendet — die Erlaubnis gilt nicht mehr.
      // Ein überschrittenes hat nichts mehr frei; `Math.max` fängt beides ab,
      // damit ein Minus nicht die anderen Budgets auffrisst.
      if (!card.manuallyPaid) {
        budgetFree += Math.max(0, card.effectivePlan - budgetSpent(card));
      }
      continue;
    }

    // Ohne Termin keine Vorhersage — die Karte zählt nicht mit (§8 „mit
    // Termin"). Betrifft heute den Friseur; die Zahl ist dadurch, wie schon
    // durch die Kreditkarten-Abrechnung (L5), leicht zu optimistisch.
    if (card.dueDay === null) continue;

    hasDueCards = true;

    if (Math.min(card.dueDay, daysInMonth) < heute) continue;
    if (card.manuallyPaid) continue;
    if ((card.linkedFragments?.length ?? 0) > 0) continue;

    // `card.amount` ist derselbe Betrag, den auch die Sparrate verwendet — bei
    // gemeinsamen Karten seit BF-4 der eigene Anteil. Keine zweite Rechenart
    // (Befund L4): Die Daueraufträge stehen auf den Cent genau darauf.
    dueAmount += card.type === "INCOME" ? -card.amount : card.amount;
  }

  return {
    dueAmount: hasDueCards ? dueAmount : null,
    budgetFree: hasBudgetCards ? budgetFree : null,
  };
}
