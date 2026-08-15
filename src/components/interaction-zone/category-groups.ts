import { isCardOpen } from "@/components/cards/card-state";
import type { CardCategory, EnrichedCard } from "@/components/cards/cards.types";
import type { CategoryAmount } from "@/lib/rpc";

/* v2-17 (KAT-2): Aus Karten, Ordnern und Beträgen wird die Reihe des Karussells.
 *
 * Bewusst eine REINE Funktion ohne React: Die Regeln, nach denen ein Ordner
 * erscheint, verschwindet und sich einordnet, sind das Herz dieses Sprints —
 * und sie sind einzeln prüfbar (`tests/e2e/kategorien.spec.ts`), statt nur im
 * Rendern zu existieren. Dasselbe Muster wie `liquidity.ts` (v2-15) und
 * `ring-subline.ts` (v2-12).
 *
 * Die BETRÄGE kommen von der Datenbank (KAT-3) und werden hier nur zugeordnet,
 * nie gerechnet — im Browser wäre das eine zweite Sparraten-Rechnung
 * (Arbeitsregel 1). Die GRUPPIERUNG dagegen entsteht hier, aus genau den
 * Karten, die auch gerendert werden. So kann die Kachel nicht behaupten, sie
 * enthalte etwas anderes als das, was aufgeklappt darunter steht. */

export type CategoryGroupKind = "INCOME" | "CATEGORY" | "UNCATEGORIZED";

export type CategoryGroup = {
  kind: CategoryGroupKind;
  /** Stabiler Schlüssel für React und für den Aufklapp-Zustand. Bei echten
   *  Ordnern die Kategorie-ID, sonst die Art — beides überlebt den
   *  Monatswechsel, was `B7` voraussetzt. */
  key: string;
  /** `null` beim Einkommens- und beim Unsortiert-Behälter: Beides sind keine
   *  Zeilen in `card_categories`, sondern Sammelbecken der Anzeige. */
  categoryId: string | null;
  name: string;
  sortOrder: number;
  /** Vorzeichenrichtiger Beitrag zur Sparrate. `null`, wenn die Datenbank
   *  keinen Wert geliefert hat — dann bleibt die Kachel ohne Zahl, statt eine
   *  zu erfinden. */
  amount: number | null;
  /** Wie viele Karten in diesem Monat in diesem Ordner liegen. Beim
   *  Einkommens-Ordner immer 1 (das Netto). */
  posten: number;
  /** v2-19 (GE-1): Der Planwert — nur beim Einkommens-Ordner gesetzt. Weicht er
   *  von `amount` ab, liegt eine zugeordnete Gehaltszahlung vor, und die Kachel
   *  zeigt beide Werte übereinander (Record, Entscheidung D). */
  planned: number | null;
  /** Wie viele davon noch offen sind — `null` im Zukunftsmonat (Record C3). */
  offen: number | null;
  /** Zukunftsmonat: alle Kinder sind Forecast, also ist es der Ordner auch. */
  isGhost: boolean;
  /** Die Karten dieses Ordners, in der Reihenfolge, in der sie hereinkamen
   *  (Fixkosten → Einnahmen → Budget, dann Name — die Sortierung des Loaders
   *  bleibt INNERHALB des Ordners erhalten). Beim Einkommens-Ordner leer: Das
   *  Netto ist keine Karte und wird eigens gerendert. */
  cards: EnrichedCard[];
};

/** Sortiernummer des Einkommens-Ordners. Er steht vorn (Record A4) — weit
 *  genug vor allem anderen, dass keine vom User vergebene Nummer davor rutschen
 *  kann. Muss mit der Funktion `get_category_amounts_for_month` übereinstimmen. */
export const INCOME_SORT_ORDER = -1000;

/** Sortiernummer von „Ohne Kategorie". Er steht hinten, unmittelbar vor dem
 *  leeren Platz (Record B6). `sort_order` ist `smallint`; 32000 liegt sicher
 *  über jedem realistisch vergebenen Wert. */
export const UNCATEGORIZED_SORT_ORDER = 32000;

export const UNCATEGORIZED_NAME = "Ohne Kategorie";
export const INCOME_NAME = "Einkommen";

type BuildArgs = {
  /** Die aktiven Karten des Monats, bereits sortiert (Loader-Reihenfolge). */
  cards: EnrichedCard[];
  /** Alle Ordner des Nutzers, nach `sortOrder` sortiert. */
  categories: CardCategory[];
  /** Beträge aus `get_category_amounts_for_month`. */
  amounts: CategoryAmount[];
  isFuture: boolean;
  isPast: boolean;
};

export function buildCategoryGroups({
  cards,
  categories,
  amounts,
  isFuture,
  isPast,
}: BuildArgs): CategoryGroup[] {
  const amountByCategoryId = new Map<string, number>();
  let incomeAmount: number | null = null;
  let incomePlanned: number | null = null;
  let uncategorizedAmount: number | null = null;

  for (const a of amounts) {
    if (a.key === "INCOME") {
      incomeAmount = Number(a.amount);
      incomePlanned = a.planned === null || a.planned === undefined
        ? null
        : Number(a.planned);
    } else if (a.key === "UNCATEGORIZED") uncategorizedAmount = Number(a.amount);
    else if (a.category_id) amountByCategoryId.set(a.category_id, Number(a.amount));
  }

  // Karten je Ordner sammeln. `null` ist ein regulärer Schlüssel, kein Fehler:
  // Beide Karten-Anlage-RPCs kennen keine Kategorie und liefern laufend
  // kategorielose Karten nach (Befund D12).
  const byCategory = new Map<string | null, EnrichedCard[]>();
  for (const card of cards) {
    const arr = byCategory.get(card.categoryId) ?? [];
    arr.push(card);
    byCategory.set(card.categoryId, arr);
  }

  const countOpen = (list: EnrichedCard[]): number | null =>
    // Record C3: Im Zukunftsmonat wird NICHT gezählt. Alle Kinder sind dort
    // Forecast, die Zahl wäre also 0 — und eine Kachel, die daraus „erledigt"
    // ableitet, behauptete etwas Falsches über einen Monat, in dem noch gar
    // nichts fällig war.
    isFuture ? null : list.filter((c) => isCardOpen(c, isFuture, isPast)).length;

  const groups: CategoryGroup[] = [];

  // ── Einkommen — vorn, und nur wenn es überhaupt ein Gehalt gibt ───────────
  // Das Netto ist keine Karte und steht heute gar nicht im Karussell. Ohne
  // diesen Ordner fehlte in der Aufstellung genau dieser Betrag, und die Summe
  // ergäbe nicht die Sparrate (Record A4).
  if (incomeAmount !== null) {
    groups.push({
      kind: "INCOME",
      key: "INCOME",
      categoryId: null,
      name: INCOME_NAME,
      sortOrder: INCOME_SORT_ORDER,
      amount: incomeAmount,
      posten: 1,
      planned: incomePlanned,
      offen: null,
      isGhost: isFuture,
      cards: [],
    });
  }

  // ── Echte Ordner — nur dort, wo sie in diesem Monat belegt sind (A8) ──────
  // Ohne diese Regel stünden im Januar zehn Behälter, von denen vier leer sind.
  // Mit ihr atmet der Schnitt mit dem Jahr: „Urlaub" existiert in elf von zwölf
  // Monaten nicht und erscheint nur, wenn Urlaub ansteht.
  for (const cat of categories) {
    const list = byCategory.get(cat.id);
    if (!list || list.length === 0) continue;
    groups.push({
      kind: "CATEGORY",
      key: cat.id,
      categoryId: cat.id,
      name: cat.name,
      sortOrder: cat.sortOrder,
      amount: amountByCategoryId.get(cat.id) ?? null,
      posten: list.length,
      planned: null,
      offen: countOpen(list),
      isGhost: isFuture,
      cards: list,
    });
  }

  // ── „Ohne Kategorie" — hinten, und nur wenn er nicht leer ist (B6) ────────
  // Er soll keine dauerhafte Mängelliste sein, sondern genau dann da, wenn es
  // etwas zu tun gibt. Und er steht dort, wo kategorielose Karten entstehen:
  // unmittelbar neben dem leeren Platz.
  const lose = byCategory.get(null);
  if (lose && lose.length > 0) {
    groups.push({
      kind: "UNCATEGORIZED",
      key: "UNCATEGORIZED",
      categoryId: null,
      name: UNCATEGORIZED_NAME,
      sortOrder: UNCATEGORIZED_SORT_ORDER,
      amount: uncategorizedAmount,
      posten: lose.length,
      planned: null,
      offen: countOpen(lose),
      isGhost: isFuture,
      cards: lose,
    });
  }

  // Reihenfolge: Sortiernummer, dann Name. Die Nummer steht in der Datenbank
  // (Record C2), damit `M5` später einen Ort hat, ohne dass eine Migration
  // nötig wird. Der Name ist der Tiebreaker, damit gleiche Nummern nicht
  // zufällig ausgehen.
  groups.sort(
    (a, b) =>
      a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "de-DE"),
  );

  return groups;
}
