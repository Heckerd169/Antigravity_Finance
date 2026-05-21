"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { toggleCardManuallyPaid } from "@/lib/rpc";

export async function toggleCardTap(formData: FormData) {
  const cardId = formData.get("cardId") as string;
  const month = formData.get("month") as string; // "YYYY-MM-01"
  const supabase = createClient();
  await toggleCardManuallyPaid(supabase, { cardId, month });
  revalidatePath("/", "page");
}

export async function applyAdjustmentThisMonth(formData: FormData) {
  const cardId = formData.get("cardId") as string;
  const month = formData.get("month") as string; // "YYYY-MM-01"
  const newAmount = parseFloat(formData.get("newAmount") as string);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht authentifiziert");

  // UPSERT adjusted_amount in card_monthly_states (Defense-in-Depth)
  const { error } = await supabase
    .from("card_monthly_states")
    .upsert(
      {
        card_id: cardId,
        month,
        adjusted_amount: newAmount,
        user_id: user.id,
      },
      { onConflict: "card_id,month" },
    );

  if (error) throw error;

  revalidatePath("/", "page");
}

export async function applyAdjustmentForward(formData: FormData) {
  const cardId = formData.get("cardId") as string;
  const month = formData.get("month") as string; // effective_month "YYYY-MM-01"
  const newAmount = parseFloat(formData.get("newAmount") as string);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht authentifiziert");

  // UPSERT card_planned_timeline (Forward-Inheritance, analog income_timeline Sprint 1)
  const { error } = await supabase
    .from("card_planned_timeline")
    .upsert(
      {
        card_id: cardId,
        effective_month: month,
        planned_amount: newAmount,
        user_id: user.id,
      },
      { onConflict: "card_id,effective_month" },
    );

  if (error) throw error;

  // K4: Clear adjusted_amount for the effective_month itself. "Dauerhaft ab
  // diesem Monat" means the current month is part of the new baseline, so a
  // prior "Nur dieser Monat"-adjustment for exactly this month must not
  // override the new plan. Tap-status (manually_paid) and adjustments for
  // OTHER months stay untouched. UPDATE on missing row = 0 rows, no error.
  const { error: clearError } = await supabase
    .from("card_monthly_states")
    .update({ adjusted_amount: null })
    .eq("card_id", cardId)
    .eq("month", month);

  if (clearError) throw clearError;

  revalidatePath("/", "page");
}
