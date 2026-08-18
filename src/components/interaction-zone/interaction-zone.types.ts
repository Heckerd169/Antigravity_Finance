import type { Database } from "@/lib/supabase/types";
import type { CardCategory, EnrichedCard } from "@/components/cards/cards.types";
import type { CategoryAmount } from "@/lib/rpc";

/** v2-17 (KAT-2): Die Angaben, die das bestehende Einkommens-Fenster braucht.
 *  Identisch mit dem, was `IncomeLabel` an den Flanken der Welle übergibt — es
 *  ist dasselbe Fenster, nur ein zweiter Auslöser (Record A4). */
export type IncomeSlotProps = {
  initialGrossAnnual: number | undefined;
  initialNetMonthly: number | undefined;
  counterpartGrossAnnual: number | undefined;
  activeMonth: { year: number; month: number };
  taxClass: number;
  taxYear: number;
};

/** v2-19 (GE-1): Die zugeordnete Gehaltszahlung. Definiert wird sie beim
 *  Einkommens-Fenster, weil sie fachlich dorthin gehört und dort gelöst wird
 *  (Record, Entscheidung E); hier nur weitergereicht, damit die bestehende
 *  Import-Richtung interaction-zone → income-split erhalten bleibt. */
import type { IncomeAssignment } from "@/components/income-split/income-split.types";
export type { IncomeAssignment };

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
  /** v2-04: Die View liefert bei gesetztem transfer_type den konkreten Typ —
   *  'INTERNAL_TRANSFER' oder 'ASSET_REALLOCATION' (beide UI-seitig wie
   *  Transfer behandelt: ausgegraut + Badge, nicht drop-fähig). */
  status:
    | "UNASSIGNED"
    | "ASSIGNED"
    | "AUTO_ABSORBED"
    | "INTERNAL_TRANSFER"
    | "ASSET_REALLOCATION";
  assigned_card_id: string | null;
  assigned_month: string | null; // "YYYY-MM-01"
  /** Sprint 8 P5: Import-Zeitpunkt (ISO-Timestamp) — deterministischer
   *  Tiebreaker für die Stack-Sortierung bei gleichem transaction_date. */
  importedAt: string | null;
  /** Sprint 8: aufgelöster KI-Vorschlag-Karten-Name, falls confidence im
   *  Badge-Bereich [badge_threshold, auto_absorption_threshold) liegt und ein
   *  suggested_card_id gesetzt ist. Sonst null → kein Badge. Die Schwellen-
   *  Gating erfolgt server-seitig in page.tsx (app_config-getrieben). */
  suggestedCardName: string | null;
  /** v2-16 (RM-2): Sicherheit des KI-Vorschlags als Anteil 0…1 — nur gesetzt,
   *  wenn auch `suggestedCardName` gesetzt ist (dieselbe Schwellen-Prüfung,
   *  LL-17: die Auswertung bleibt server-seitig). Das Schaufenster-Popup zeigt
   *  daraus „[Karte] · [N] %"; die Fragment-Karte zeigt ihn NICHT. */
  suggestionConfidence: number | null;
  /** v2-16 (RM-2): Name der Karte, auf der dieses Fragment liegt — aufgelöst
   *  aus `assigned_card_id`. Null, wenn nicht zugeordnet oder die Karte
   *  gelöscht wurde. Nur im Schaufenster-Popup sichtbar. */
  assignedCardName: string | null;
  /** v2-16 (RM-2): Gegenkonto eines Übertrags (`fragments.counterparty_iban`).
   *  Nur im Schaufenster-Popup und nur bei gesetztem `transfer_type` sichtbar. */
  counterpartyIban: string | null;
};

/** v2-07 C1: Beide Übertrags-Typen verhalten sich UI-seitig identisch — sie
 *  können per Daten-Invariante (Trigger `trg_oqb_no_transfer_links`) nie an
 *  eine Karte gelinkt werden und gehören deshalb nicht auf die Arbeitsfläche
 *  der Rohmasse. Ein Prädikat für beide Konsumenten: den Stack-Filter
 *  (fragment-stack) und die Darstellungs-Hierarchie (fragment-card). */
export function isTransferFragment(f: Pick<FragmentRow, "status">): boolean {
  return (
    f.status === "INTERNAL_TRANSFER" || f.status === "ASSET_REALLOCATION"
  );
}

/** v2-23 (`ZU-1`): Liegt dieses Fragment auf einer Karte?
 *
 *  **Es gibt ZWEI zugeordnete Zustände**, und genau daran ist `page.tsx` drei
 *  Wochen lang gescheitert: `ASSIGNED` (der Nutzer hat gezogen) und
 *  `AUTO_ABSORBED` (die App hat ab 95 % Konfidenz selbst zugeordnet, §11).
 *  Die Unterscheidung ist für die **Herkunft** gedacht — das Schaufenster-Popup
 *  schreibt „automatisch erkannt" —, nicht für die Frage, **ob** verknüpft ist.
 *
 *  **Der Vorfall:** `page.tsx:507` filterte die verknüpften Fragmente je Karte
 *  mit `f.status === "ASSIGNED"`. Die vier automatisch zugeordneten
 *  Spotify-Zahlungen (Mai–August 2026) fielen durch, `card.linkedFragments`
 *  blieb leer, und `card-state.ts` entschied daran „Offen" — obwohl die Zahlung
 *  in der Datenbank sauber verlinkt war und in jeder Sparrate mitzählte.
 *  Gemeldet vom Nutzer am 16.08.2026, nachdem die App die Karte als offen
 *  auswies und zugleich keine Zahlung an ihr zeigte.
 *
 *  **Warum ein Prädikat und kein zweiter `||`-Vergleich:** Dieselbe Frage wird
 *  an mehreren Stellen gestellt, und ein Einzelwert-Vergleich ist genau die
 *  Bauart, die den Fehler erzeugt hat. Ein benanntes Prädikat lässt sich
 *  einzeln prüfen (`zuordnung.spec.ts`) und wächst mit, falls je ein dritter
 *  zugeordneter Zustand dazukommt. Muster von `isTransferFragment` darüber. */
export function isLinkedToCard(f: Pick<FragmentRow, "status">): boolean {
  return f.status === "ASSIGNED" || f.status === "AUTO_ABSORBED";
}

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
  /** v2-17 (KAT-1): alle Ordner des Nutzers, in Anzeige-Reihenfolge (C2).
   *  Wird an jede Karte durchgereicht — die Auswahlliste für „Kategorie
   *  ändern …" ist für alle Karten dieselbe. */
  categories: CardCategory[];
  /** v2-17 (KAT-3): die Beträge der Ordner, server-seitig gebildet. Ihre Summe
   *  ergibt exakt die Sparrate des Monats (Record C1). */
  categoryAmounts: CategoryAmount[];
  /** v2-17 (KAT-2): was die Netto-Kachel im Ordner „Einkommen" braucht, um das
   *  bestehende Einkommens-Fenster zu öffnen. */
  incomeSlot: IncomeSlotProps;
  /** v2-19 (GE-1): die diesem Monat zugeordnete Gehaltszahlung, falls es eine
   *  gibt. `null` heißt: Es gilt der Plan. */
  incomeAssignment: IncomeAssignment | null;
  /** v2-26: Anteil des Nutzers am Haushalt (§4.5) — ausschließlich für die
   *  Vorschau „dein Anteil davon" in den beiden Anlage-Overlays. Gerechnet wird
   *  weiterhin nur in der Datenbank (§7 Regel 1). */
  splitFactor: number;
  /** "YYYY-MM" — der aktuell angezeigte Monat. */
  targetMonth: string;
  /** "YYYY-MM-01" — Datenbank-Variante für RPC-Aufrufe / link_month. */
  targetDbMonth: string;
  /** "YYYY-MM" — server-time-Vergleichsmonat (für Ghost-Detection). */
  currentMonth: string;
};

/** MIME-Type fürs dataTransfer beim Fragment-Drag. */
export const DRAG_MIME = "application/x-fragment-id";
