import type { Database } from "@/lib/supabase/types";
import type { EnrichedCard } from "@/components/cards/cards.types";

export type CardType = Database["public"]["Enums"]["card_type"];
export type CardAttribution = Database["public"]["Enums"]["card_attribution"];
export type CardFrequency = Database["public"]["Enums"]["card_frequency"];

/** Eine Fragment-Row aus der View `fragments_with_status`. View-Spalten sind
 *  nullable (LEFT JOIN), aber für UNASSIGNED-Fragmente sind die Kern-Felder
 *  immer gesetzt. */
export type FragmentRow = {
  id: string;
  amount: number;
  description: string;
  transaction_date: string; // ISO "YYYY-MM-DD"
  status: "UNASSIGNED" | "ASSIGNED" | "AUTO_ABSORBED";
  assigned_card_id: string | null;
  assigned_month: string | null; // "YYYY-MM-01"
};

/** Karten-Erstellungs-Input (Direct + Drop teilen Felder). */
export type CardCreateInput = {
  name: string;
  type: CardType;
  attribution: CardAttribution;
  frequency: CardFrequency;
  /** YYYY-MM-01 — Gilt ab. Standardisiert auf den aktuell angezeigten Monat. */
  firstActiveMonth: string;
  /** null für offene Laufzeit; gleich firstActiveMonth bei ONCE. */
  lastActiveMonth: string | null;
  plannedAmount: number;
};

/** Frequenz-Option für das Recurrence-Popup. */
export type FrequencyOption = {
  value: CardFrequency;
  label: string;
};

export const FREQUENCY_OPTIONS: ReadonlyArray<FrequencyOption> = [
  { value: "MONTHLY", label: "Monatlich" },
  { value: "QUARTERLY", label: "Quartalsweise" },
  { value: "SEMIANNUAL", label: "Halbjährlich" },
  { value: "ANNUAL", label: "Jährlich" },
  { value: "ONCE", label: "Einmalig" },
];

export const TYPE_OPTIONS: ReadonlyArray<{ value: CardType; label: string }> = [
  { value: "FIXED_COST", label: "Fixkosten" },
  { value: "INCOME", label: "Einnahmen" },
  { value: "BUDGET", label: "Budget" },
];

export const ATTRIBUTION_OPTIONS: ReadonlyArray<{
  value: CardAttribution;
  label: string;
}> = [
  { value: "ICH", label: "Ich" },
  { value: "GEMEINSAM", label: "Gemeinsam" },
];

/** Im linked-fragments-overlay angezeigt: ein im targetMonth verknüpftes Fragment. */
export type LinkedFragmentRow = {
  fragmentId: string;
  amount: number;
  description: string;
  transactionDate: string;
};

/** Props der oberen Interaktionszone-Komponente. */
export type InteractionZoneProps = {
  /** Alle Fragmente des Users (alle Monate, sortiert DESC nach transaction_date). */
  fragments: FragmentRow[];
  /** Aktive Karten im targetMonth — gleicher Shape wie Sprint 4. */
  cards: EnrichedCard[];
  /** "YYYY-MM" — der aktuell angezeigte Monat. */
  targetMonth: string;
  /** "YYYY-MM-01" — Datenbank-Variante für RPC-Aufrufe / link_month. */
  targetDbMonth: string;
  /** "YYYY-MM" — server-time-Vergleichsmonat (für Ghost-Detection). */
  currentMonth: string;
};

/** MIME-Type fürs dataTransfer beim Fragment-Drag. */
export const DRAG_MIME = "application/x-fragment-id";
