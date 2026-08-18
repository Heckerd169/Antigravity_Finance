import type {
  BudgetState,
  EnrichedCard,
  FixedCostState,
  IncomeState,
} from "./cards.types";

/* Zustands-Auflösung der drei Kartentypen (Design-Doku §7 / §4.3).
 *
 * v2-17 (KAT-2): Aus `card.tsx` HERAUSGELÖST, nicht neu geschrieben. Die
 * Kategorie-Kachel muss zählen, wie viele ihrer Karten offen sind — und sie
 * darf diese Regeln nicht ein zweites Mal formulieren. Eine zweite Fassung
 * liefe genau so lange synchron, bis jemand eine der beiden ändert.
 *
 * Die Funktionen sind unverändert übernommen; einzige Ergänzung ist
 * `isCardOpen` am Ende. */

/** v2-26: „Nicht angefallen" ist ein ERLEDIGTER Zustand.
 *
 *  Eine Karte, bei der in diesem Monat nichts anfiel, ist nicht „Offen" — an ihr
 *  ist nichts mehr zu tun. Sie trug bis v2-26 trotzdem den offenen Zustand: rot,
 *  und im Ordner darüber zählte sie als eine der offenen Karten. Der Nutzer sah
 *  ein „3 offen", von denen zwei gar nicht mehr offen waren.
 *
 *  `adjustedAmount === 0` ist die Bedingung, NICHT `amount === 0`: Eine Karte
 *  kann aus anderen Gründen 0 anzeigen (Plan 0, kein Fragment), und die ist
 *  weiterhin offen. Nur die BEWUSSTE Null zählt (§6 Stolperfalle 3 — `null` und
 *  `0` sind verschiedene Aussagen).
 *
 *  Die Statuszeile sagt weiterhin `nicht angefallen` statt „Bezahlt": Die Karte
 *  sieht erledigt aus und nennt trotzdem den Grund. Ohne das wären „bezahlt" und
 *  „fiel nicht an" wieder ununterscheidbar — genau die Verwechslung, die KJ-3
 *  in v2-25 behoben hat. */
export function isNotIncurred(card: EnrichedCard): boolean {
  return card.adjustedAmount === 0;
}

export function resolveFixedCostState(
  card: EnrichedCard,
  isFuture: boolean,
): FixedCostState {
  if (isFuture) return "ghost";
  // §7 Konflikt 6: Fragment-Link und manually_paid sind unabhängige Indikatoren —
  // entweder reicht für Bezahlt-Status (Sprint 6 K1).
  const hasFragment = (card.linkedFragments?.length ?? 0) > 0;
  return card.manuallyPaid || hasFragment || isNotIncurred(card) ? "paid" : "open";
}

export function resolveIncomeState(
  card: EnrichedCard,
  isFuture: boolean,
): IncomeState {
  if (isFuture) return "ghost";
  // §7 Konflikt 6: Fragment-Link und manually_paid sind unabhängige Indikatoren —
  // entweder reicht für Erhalten-Status (Sprint 6 K1).
  const hasFragment = (card.linkedFragments?.length ?? 0) > 0;
  // v2-26: „nicht angefallen" gilt auch hier als erledigt — eine erwartete
  // Einnahme, die der Nutzer als ausgefallen markiert hat, ist nicht mehr
  // „Erwartet".
  return card.manuallyPaid || hasFragment || isNotIncurred(card)
    ? "received"
    : "expected";
}

export function resolveBudgetState(
  card: EnrichedCard,
  isFuture: boolean,
  isPast: boolean,
  fragmentSum: number,
): BudgetState {
  if (isFuture) return "ghost";
  // §3.4.4 Sprint-7-Spec (Briefing): vollständige State-Maschine
  if (isPast && !card.manuallyPaid && fragmentSum === 0) return "ghost";
  if (card.manuallyPaid) return "done";
  if (fragmentSum > card.effectivePlan) return "over";
  return "running";
}

/** K1.2/K1.4: „Spent" = Summe der Fragmentwerte (Realität). Getrennt von
 *  `card.amount`, das per §4.3.3 Priorisierung (Realität → Anpassung → Plan)
 *  auch Adjustment oder Plan zurückgeben kann.
 *
 *  v2-11 (BF-5): Netto-ABFLUSS statt Summe der Betragshöhen. Vorher stand hier
 *  `Math.abs(f.amount)` — dieselbe Fehlerklasse wie in der Rechenfunktion, nur
 *  im Frontend. Solange die Datenbank ebenfalls mit ABS summierte, waren beide
 *  gleich falsch und damit wenigstens konsistent. Nach der Migration liefert die
 *  Datenbank den verrechneten Wert; bliebe es hier bei ABS, zeigte die Karte für
 *  „Aline Geburtstag" oben 168,11 € und darunter „918,11 € über Plan".
 *
 *  Wird ausschliesslich fuer BUDGET-Karten aufgerufen, deshalb genügt die eine
 *  Richtung (Ausgaben sind negative Fragmente → Verbrauch positiv). Das Ergebnis
 *  entspricht damit exakt dem, was `calculate_card_amount_for_month` intern
 *  bildet — die Karte rechnet §4.3 weiterhin NICHT nach (§7 Regel 1), sie
 *  braucht den Wert nur fuer Balken und Restbudget-Text. */
export function sumLinkedFragments(card: EnrichedCard): number {
  return -(card.linkedFragments ?? []).reduce((acc, f) => acc + f.amount, 0);
}

/** v2-17 (KAT-2): Zählt diese Karte für das `[N] offen` auf der Ordner-Kachel?
 *
 *  „Offen" heißt: an dieser Karte ist in diesem Monat noch etwas zu tun. Das
 *  sind genau die Zustände `open` (Fixkosten), `expected` (Einnahmen) sowie
 *  `running` und `over` (Budget).
 *
 *  v2-26: Eine Karte mit „nicht angefallen" zählt NICHT mehr mit. Das folgt
 *  automatisch aus den drei Resolver oben — genau deshalb liegen sie hier und
 *  nicht ein zweites Mal in der Kachel. Wer die Regel ändern will, ändert sie an
 *  EINER Stelle, und Karte wie Ordner ziehen zusammen mit.
 *
 *  Ghost zählt NICHT — und das ist der Grund für die Regel aus Record C3: Im
 *  Zukunftsmonat sind alle Kinder Ghost, die Zahl wäre also 0, und ein Ordner,
 *  der daraus „erledigt" ableitet, behauptete etwas Falsches über einen Monat,
 *  in dem noch gar nichts fällig war. Deshalb zeigt der Ordner dort weder
 *  `[N] offen` noch `erledigt`.
 *
 *  Bewusst NICHT identisch mit der Kopfzeile „noch fällig" (LQ-2): Die zählt den
 *  Zustand nicht, sondern macht eine Vorhersage und lässt Posten weg, deren
 *  Termin verstrichen ist. Am 6. August kann „Wohnen" deshalb `3 offen` zeigen,
 *  während die Miete in der Kopfzeile nicht mehr mitzählt. Bestehendes Verhalten
 *  seit v2-15, in Record B9 ausdrücklich in Kauf genommen. */
export function isCardOpen(
  card: EnrichedCard,
  isFuture: boolean,
  isPast: boolean,
): boolean {
  if (card.type === "FIXED_COST") {
    return resolveFixedCostState(card, isFuture) === "open";
  }
  if (card.type === "INCOME") {
    return resolveIncomeState(card, isFuture) === "expected";
  }
  const state = resolveBudgetState(card, isFuture, isPast, sumLinkedFragments(card));
  return state === "running" || state === "over";
}
