import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type AppSupabaseClient = SupabaseClient<Database>;

export async function estimateNetMonthly(
  client: AppSupabaseClient,
  args: { grossAnnual: number; taxClass: number; taxYear: number },
): Promise<number | null> {
  const { data, error } = await client.rpc("estimate_net_monthly", {
    p_gross_annual: args.grossAnnual,
    p_tax_class: args.taxClass,
    p_tax_year: args.taxYear,
  });

  // LL-2-Fix (Sprint 4): Throw-on-Error als Konvention für alle Wrapper.
  // Aufrufer (onboarding-form.tsx) fängt den Fehler und zeigt keinen Schätzwert.
  if (error) throw error;

  return data;
}

export async function calculateSparrateForMonth(
  client: AppSupabaseClient,
  args: { userId: string; month: string },
): Promise<number | null> {
  const { data, error } = await client.rpc("calculate_sparrate_for_month", {
    p_user_id: args.userId,
    p_month: args.month,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function calculatePlannedSparrateForMonth(
  client: AppSupabaseClient,
  args: { userId: string; month: string },
): Promise<number | null> {
  const { data, error } = await client.rpc("calculate_planned_sparrate_for_month", {
    p_user_id: args.userId,
    p_month: args.month,
  });

  if (error) {
    throw error;
  }

  return data;
}

/** Anzeige-Betrag einer Karte für einen bestimmten Monat (Prioritätskette Realität → Anpassung → Plan).
 *  Returns 0 falls Karte im Monat inaktiv oder kein Plan. Throws bei DB-Errors. */
export async function calculateCardAmountForMonth(
  client: AppSupabaseClient,
  args: { cardId: string; month: string },
): Promise<number> {
  const { data, error } = await client.rpc("calculate_card_amount_for_month", {
    p_card_id: args.cardId,
    p_month: args.month,
  });
  if (error) throw error;
  return data ?? 0;
}

/** Aktivitäts-Filter — soll die Karte im Monat gerendert werden?
 *  Defensive Variante: bei fehlender Session / DB-Error → false (kein Crash, kein UI-Artefakt).
 *  Schluckt Errors bewusst, weil "kein Datum" und "Fehler" für den Aufrufer äquivalent sind. */
export async function isCardActiveInMonth(
  client: AppSupabaseClient,
  args: { cardId: string; month: string },
): Promise<boolean> {
  const { data, error } = await client.rpc("is_card_active_in_month", {
    p_card_id: args.cardId,
    p_month: args.month,
  });
  if (error) return false;
  return data ?? false;
}

/** Roh-Plan aus card_planned_timeline (Forward-Inheritance, ohne Adjustment).
 *  Returns null falls kein Plan-Eintrag für diesen Monat existiert. Throws bei DB-Errors. */
export async function getPlannedAmountForMonth(
  client: AppSupabaseClient,
  args: { cardId: string; month: string },
): Promise<number | null> {
  const { data, error } = await client.rpc("get_planned_amount_for_month", {
    p_card_id: args.cardId,
    p_month: args.month,
  });
  if (error) throw error;
  return (data as number | null) ?? null;
}

/** Split-Faktor ICH-Anteil (0..1) zum Monat M.
 *  1.0 falls Partner unbekannt. Throws bei DB-Errors. */
export async function getSplitFactor(
  client: AppSupabaseClient,
  args: { userId: string; month: string },
): Promise<number> {
  const { data, error } = await client.rpc("get_split_factor", {
    p_user_id: args.userId,
    p_month: args.month,
  });
  if (error) throw error;
  return data ?? 1.0;
}

// ── Sprint 5: Atomic Card-Creation-RPCs ──────────────────────────────────────

export type CreateCardDirectArgs = {
  name: string;
  type: Database["public"]["Enums"]["card_type"];
  attribution: Database["public"]["Enums"]["card_attribution"];
  frequency: Database["public"]["Enums"]["card_frequency"];
  firstActiveMonth: string; // "YYYY-MM-01"
  lastActiveMonth: string | null; // null außer bei ONCE
  plannedAmount: number;
};

/** Atomic: INSERT cards + INSERT card_planned_timeline in einer Transaktion.
 *  Notwendig wegen DEFERRED-Constraint cards_assert_initial_plan. Returns Card-ID.
 *  Wirft bei DB-Validation-Fehlern (Name leer, Betrag ≤ 0, ONCE-Konflikt, etc.). */
export async function createCardDirect(
  client: AppSupabaseClient,
  args: CreateCardDirectArgs,
): Promise<string> {
  // p_last_active_month akzeptiert NULL (offene Laufzeit für nicht-ONCE-Karten).
  // Die generierten Typen markieren ihn als `string`, aber die Funktion hat
  // DEFAULT NULL — Cast zu unknown nötig, um null durchzureichen.
  const rpcArgs = {
    p_name: args.name,
    p_type: args.type,
    p_attribution: args.attribution,
    p_frequency: args.frequency,
    p_first_active_month: args.firstActiveMonth,
    p_last_active_month: args.lastActiveMonth as unknown as string,
    p_planned_amount: args.plannedAmount,
  };
  const { data, error } = await client.rpc("create_card_direct", rpcArgs);
  if (error) throw error;
  if (!data) throw new Error("create_card_direct returned no card id");
  return data;
}

export type CreateCardFromFragmentArgs = CreateCardDirectArgs & {
  fragmentId: string;
  linkMonth: string; // "YYYY-MM-01" — Periodenabgrenzung gemäß Konflikt 4 §7
};

/** Atomic: INSERT cards + INSERT card_planned_timeline + INSERT card_fragment_links. */
export async function createCardFromFragment(
  client: AppSupabaseClient,
  args: CreateCardFromFragmentArgs,
): Promise<string> {
  // Gleiches NULL-Verhalten für p_last_active_month wie in createCardDirect.
  const rpcArgs = {
    p_name: args.name,
    p_type: args.type,
    p_attribution: args.attribution,
    p_frequency: args.frequency,
    p_first_active_month: args.firstActiveMonth,
    p_last_active_month: args.lastActiveMonth as unknown as string,
    p_planned_amount: args.plannedAmount,
    p_fragment_id: args.fragmentId,
    p_link_month: args.linkMonth,
  };
  const { data, error } = await client.rpc("create_card_from_fragment", rpcArgs);
  if (error) throw error;
  if (!data) throw new Error("create_card_from_fragment returned no card id");
  return data;
}
