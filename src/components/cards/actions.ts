"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  cleanupExpiredCardTrash,
  createCategoryForCard,
  deleteCard,
  deleteCardCategory,
  endCard,
  renameCardCategory,
  restoreCard,
  restoreCardCategory,
  setCardCategory,
  toggleCardManuallyPaid,
} from "@/lib/rpc";
import type { DeleteEffect, DeletedCategoryPayload } from "@/lib/rpc";

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

/** Karte in den Papierkorb (nur bei grünem Lösch-Gate, sonst RPC-23514).
 *
 *  v2-25 (KJ-1): Gibt zurück, was die Löschung mit der Sparrate gemacht hat —
 *  gemessen in der Datenbank, nicht hier (Arbeitsregel 1). `year` ist das
 *  Kalenderjahr des angezeigten Monats und bestimmt das Messfenster.
 *
 *  Seit dem Fall des Vergangenheits-Riegels kann eine Löschung die Sparrate
 *  VERGANGENER Monate bewegen. Das ist gewollt — sie korrigiert eine irrtümlich
 *  angelegte Karte, statt die Vergangenheit zu konservieren. Sichtbar wird es
 *  im Toast (§7 „Die Folge des Löschens"). */
export async function deleteCardAction(
  cardId: string,
  year: number,
): Promise<DeleteEffect> {
  const supabase = createClient();
  await opportunisticTrashCleanup(supabase);
  const effect = await deleteCard(supabase, { cardId, year });
  revalidatePath("/", "page");
  return effect;
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

/** v2-15 (LQ-1): Fälligkeitstag setzen (1–31) oder entfernen (`null`).
 *
 *  Bewusst KEIN Monats-Parameter. `cards.due_day` gilt **immer** und kennt keine
 *  Monatsabgrenzung — genau deshalb sitzt die Änderung in einem eigenen
 *  Menüpunkt und nicht in „Betrag anpassen", wo alles entweder *nur dieser
 *  Monat* oder *dauerhaft ab diesem Monat* ist (§7 „Fällig am …").
 *
 *  Direkter Tabellen-Schreibzugriff wie `detachAllCardLinks`: keine RPC nötig,
 *  weil nichts zu rechnen ist. RLS greift über `auth.uid()`; ohne Session
 *  aktualisiert der UPDATE schlicht 0 Zeilen.
 *
 *  Die Bereichsprüfung hier ist die erste Verteidigungslinie — der CHECK
 *  `cards_due_day_range` aus der v2-14-Migration ist die zweite. Die Klammerung
 *  auf die tatsächliche Monatslänge gehört NICHT hierher: ein Dauerauftrag zum
 *  31. existiert, und der gespeicherte Wert soll der Soll-Tag bleiben, keine
 *  Interpretation (so steht es in 20260806_v2_14_lq1_faelligkeitstag.sql). */
export async function setCardDueDay(
  cardId: string,
  dueDay: number | null,
): Promise<void> {
  if (
    dueDay !== null &&
    (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31)
  ) {
    throw new Error(`Ungültiger Fälligkeitstag: ${dueDay}`);
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("cards")
    .update({ due_day: dueDay })
    .eq("id", cardId);

  if (error) throw error;

  revalidatePath("/", "page");
}

/* ── v2-17 (KAT-1): Kategorien ──────────────────────────────────────────────
 *
 * Alle vier Aktionen berühren ausschließlich `cards.category_id` und
 * `card_categories`. Keine davon bewegt eine Zahl, die rechnet: Die Sparrate
 * aggregiert kategorie-blind über alle Karten des Monats, und die Kategorie ist
 * keine der fünf von §2.1 geschützten Ebenen (Gehalt, Karten-Plan,
 * Karten-Lebensdauer, Fragmente, Sparrate). Deshalb darf die Zuordnung auch
 * rückwirkend gelten (Record A6). */

/** Karte in eine bestehende Kategorie legen — oder mit `null` herauslösen. */
export async function setCardCategoryAction(
  cardId: string,
  categoryId: string | null,
): Promise<void> {
  const supabase = createClient();
  await setCardCategory(supabase, { cardId, categoryId });
  revalidatePath("/", "page");
}

/** Neue Kategorie anlegen und die Karte hineinlegen — ein Aufruf, eine
 *  Transaktion. Getrennte Schritte („erst anlegen, dann zuordnen") könnten bei
 *  einem Abbruch dazwischen eine leere Kategorie hinterlassen, und genau die
 *  soll es nicht geben (B8). */
export async function createCategoryForCardAction(
  cardId: string,
  name: string,
): Promise<void> {
  const supabase = createClient();
  await createCategoryForCard(supabase, { cardId, name });
  revalidatePath("/", "page");
}

/** Kategorie umbenennen (aus dem ⋯-Menü der Kategorie-Kachel). */
export async function renameCardCategoryAction(
  categoryId: string,
  name: string,
): Promise<void> {
  const supabase = createClient();
  await renameCardCategory(supabase, { categoryId, name });
  revalidatePath("/", "page");
}

/** Kategorie löschen. Gibt den Wiederherstellungs-Bausatz zurück, damit der
 *  Toast ihn fünf Sekunden lang festhalten kann.
 *
 *  Anders als beim Karten-Löschen gibt es hier KEINEN Papierkorb — der kann
 *  eine Kategorie nicht tragen (Befund D7). Der Bausatz IST die Rücknahme, und
 *  er lebt nur im Browser, bis der Toast verschwindet. Danach ist die Kategorie
 *  endgültig weg; die Karten sind es nie (sie werden nur kategorielos). */
export async function deleteCardCategoryAction(
  categoryId: string,
): Promise<DeletedCategoryPayload> {
  const supabase = createClient();
  const payload = await deleteCardCategory(supabase, { categoryId });
  revalidatePath("/", "page");
  return payload;
}

/** Rücknahme aus dem Toast. */
export async function restoreCardCategoryAction(
  payload: DeletedCategoryPayload,
): Promise<void> {
  const supabase = createClient();
  await restoreCardCategory(supabase, payload);
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
