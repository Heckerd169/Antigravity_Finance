import type { Database } from "@/lib/supabase/types";

export type CardType = Database["public"]["Enums"]["card_type"];
export type CardAttribution = Database["public"]["Enums"]["card_attribution"];
export type CardFrequency = Database["public"]["Enums"]["card_frequency"];

export type FixedCostState = "open" | "paid" | "ghost";
export type IncomeState = "expected" | "received" | "ghost";
export type BudgetState = "running" | "over" | "done" | "ghost";

/** v2-05: Lösch-Tor fürs Kontextmenü — „Karte löschen" nur bei deletable=true,
 *  sonst ausgegraut mit Grund. Autoritativ prüft die RPC delete_card erneut. */
export type DeleteGate = {
  deletable: boolean;
  reasons: ("HAS_LINKS" | "HAS_STATES" | "HAS_PAST_PLAN")[];
};

/** Sprint 5: im targetMonth verknüpftes Fragment (für „Verknüpfte Fragmente"-Menüoption). */
export type LinkedFragmentRef = {
  fragmentId: string;
  amount: number;
  description: string;
  transactionDate: string;
};

export type EnrichedCard = {
  id: string;
  name: string;
  type: CardType;
  attribution: CardAttribution;
  frequency: CardFrequency;
  first_active_month: string;
  last_active_month: string | null;
  /** Anzeige-Betrag (RPC `calculate_card_amount_for_month`). Prioritätskette
   *  Realität → Anpassung → Plan, siehe Design-Doku §4.3. */
  amount: number;
  /** K1.4: Vergleichsbasis für Budget-Status + „Noch frei". RPC
   *  `get_effective_plan_for_month`: Adjustment falls gesetzt, sonst raw Plan
   *  via Forward-Inheritance. Immer ≥ 0; 0 bei inaktiver Karte. */
  effectivePlan: number;
  /** v2-13 (BF-4/E1): Haushaltsbetrag für die Zeile `von X €` unter dem eigenen
   *  Anteil — oder `null`, wenn die Zeile leer bleibt (ICH-Karte, Split-Faktor
   *  1,0, oder Plan 0). Die Entscheidung fällt SERVER-seitig im Loader
   *  (§7 Regel 15 / LL-17): die Karte bekommt das Ergebnis, nicht den
   *  Split-Faktor plus Schwelle. Die Zeilenhöhe ist immer reserviert. */
  householdAmount: number | null;
  /** v2-14/v2-15 (LQ-1): Tag im Monat, an dem die Karte fällig ist (1–31), oder
   *  `null` für „kein Termin". `null` ist ein Wert, keine Lücke — so bei
   *  BUDGET-Karten (ein Budget ist eine Erlaubnis ohne Termin, Befund L7) und bei
   *  Karten ohne Buchungshistorie. Die Klammerung auf die tatsächliche Monatslänge
   *  (Februar!) gehört in die Vorhersage-Logik von LQ-2, nicht hierher — der
   *  gespeicherte Wert bleibt der Soll-Tag. */
  dueDay: number | null;
  manuallyPaid: boolean;
  adjustedAmount: number | null;
  /** Sprint 5: im aktuellen Monat zugeordnete Fragmente (für „Verknüpfte
   *  Fragmente"-Menü + Budget-Verbrauch). */
  linkedFragments?: LinkedFragmentRef[];
  /** v2-05: vorberechnetes Lösch-Tor (Links/States über ALLE Monate +
   *  Vergangenheits-Plan). */
  deleteGate: DeleteGate;
  /** v2-17 (KAT-1): Kategorie der Karte, oder `null` für „Ohne Kategorie".
   *
   *  Eine EINFACHE Eigenschaft, keine Zeitreihe — die Zuordnung gilt rückwirkend
   *  in allen Monaten (Record A6, bewusst abweichend von Befund D3). `null` ist
   *  ein regulärer Zustand und kein Fehler: Beide Karten-Anlage-RPCs kennen
   *  keine Kategorie, jeder Klick auf den leeren Platz liefert also eine
   *  kategorielose Karte nach (Befund D12). */
  categoryId: string | null;
};

/** v2-17 (KAT-1): Ein Ordner, wie er in der Datenbank steht.
 *
 *  Ohne Betrag — die Zahl einer Kategorie ist IMMER die Summe ihrer Kinder und
 *  wird server-seitig gebildet (KAT-3, Arbeitsregel 1). Was hier fehlt, ist
 *  Absicht. */
export type CardCategory = {
  id: string;
  name: string;
  sortOrder: number;
};
