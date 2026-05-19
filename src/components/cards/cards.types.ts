import type { Database } from "@/lib/supabase/types";

export type CardType = Database["public"]["Enums"]["card_type"];
export type CardAttribution = Database["public"]["Enums"]["card_attribution"];
export type CardFrequency = Database["public"]["Enums"]["card_frequency"];

export type FixedCostState = "open" | "paid" | "ghost";
export type IncomeState = "expected" | "received" | "ghost";
export type BudgetState = "running" | "over" | "ghost";

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
  manuallyPaid: boolean;
  adjustedAmount: number | null;
  /** Sprint 5: im aktuellen Monat zugeordnete Fragmente (für „Verknüpfte
   *  Fragmente"-Menü + Budget-Verbrauch). */
  linkedFragments?: LinkedFragmentRef[];
};
