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

  if (error) {
    console.error("estimate_net_monthly RPC failed", error);
    return null;
  }

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
