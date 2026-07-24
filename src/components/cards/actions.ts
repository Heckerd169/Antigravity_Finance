"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  cleanupExpiredCardTrash,
  deleteCard,
  endCard,
  restoreCard,
  toggleCardManuallyPaid,
} from "@/lib/rpc";

export async function toggleCardTap(formData: FormData) {
  const cardId = formData.get("cardId") as string;
  const month = formData.get("month") as string; // "YYYY-MM-01"
  const supabase = createClient();
  await toggleCardManuallyPaid(supabase, { cardId, month });
  revalidatePath("/", "page");
}

/* ── v2-05: Karten-Lebenszyklus (ersetzt das Sprint-10-Verbergen) ──────────── */

/** Opportunistischer Papierkorb-Vollzug (Beschluss E3b): abgelaufene eigene
 *  Trash-Karten werden bei jeder Lebenszyklus-Aktion endgültig entfernt.
 *  Darf die eigentliche Aktion nie blockieren. */
async function opportunisticTrashCleanup(
  supabase: ReturnType<typeof createClient>,
): Promise<void> {
  try {
    await cleanupExpiredCardTrash(supabase);
  } catch (e) {
    console.error("Papierkorb-Cleanup fehlgeschlagen (nicht blockierend)", e);
  }
}

/** Karte beenden (last_active_month) bzw. Ende aufheben (lastMonth=null). */
export async function endCardAction(
  cardId: string,
  lastMonth: string | null,
): Promise<void> {
  const supabase = createClient();
  await opportunisticTrashCleanup(supabase);
  await endCard(supabase, { cardId, lastMonth });
  revalidatePath("/", "page");
}

/** Karte in den Papierkorb (nur bei grünem Lösch-Gate, sonst RPC-23514). */
export async function deleteCardAction(cardId: string): Promise<void> {
  const supabase = createClient();
  await opportunisticTrashCleanup(supabase);
  await deleteCard(supabase, { cardId });
  revalidatePath("/", "page");
}

/** Rückgängig aus dem Papierkorb (vom Undo-Toast, innerhalb der Retention). */
export async function restoreCardAction(cardId: string): Promise<void> {
  const supabase = createClient();
  await restoreCard(supabase, { cardId });
  revalidatePath("/", "page");
}

/** Alle Fragment-Verknüpfungen einer Karte lösen (ALLE Monate) — bewusste
 *  Vergangenheits-Korrektur vor einem gewollten Löschen (Soft-Detach,
 *  Stufe-1-Papier §2). Fragmente fallen verlustfrei in die Rohmasse zurück. */
export async function detachAllCardLinks(cardId: string): Promise<void> {
  const supabase = createClient();
  await opportunisticTrashCleanup(supabase);
  const { error } = await supabase
    .from("card_fragment_links")
    .delete()
    .eq("card_id", cardId);
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
