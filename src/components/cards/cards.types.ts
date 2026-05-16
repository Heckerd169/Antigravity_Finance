import type { Database } from "@/lib/supabase/types";

export type CardType = Database["public"]["Enums"]["card_type"];
export type CardAttribution = Database["public"]["Enums"]["card_attribution"];
export type CardFrequency = Database["public"]["Enums"]["card_frequency"];

export type FixedCostState = "open" | "paid" | "ghost";
export type IncomeState = "expected" | "received" | "ghost";
export type BudgetState = "running" | "over" | "ghost";

export type EnrichedCard = {
  id: string;
  name: string;
  type: CardType;
  attribution: CardAttribution;
  frequency: CardFrequency;
  first_active_month: string;
  last_active_month: string | null;
  amount: number;
  planned: number | null;
  manuallyPaid: boolean;
  adjustedAmount: number | null;
};
