"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleCardTap(formData: FormData) {
  const cardId = formData.get("cardId") as string;
  const month = formData.get("month") as string; // "YYYY-MM-01"

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht authentifiziert");

  // Aktuellen Tap-Status lesen
  const { data: existing } = await supabase
    .from("card_monthly_states")
    .select("manually_paid")
    .eq("card_id", cardId)
    .eq("month", month)
    .maybeSingle();

  const currentPaid = existing?.manually_paid ?? false;

  // UPSERT mit toggled manually_paid (Defense-in-Depth: kein UPDATE, CLAUDE.md §7 Regel 8)
  const { error } = await supabase
    .from("card_monthly_states")
    .upsert(
      {
        card_id: cardId,
        month,
        manually_paid: !currentPaid,
        user_id: user.id,
      },
      { onConflict: "card_id,month" },
    );

  if (error) throw error;

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

  revalidatePath("/", "page");
}
