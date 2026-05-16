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
