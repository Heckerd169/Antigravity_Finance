"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  cleanupExpiredCardTrash,
  createCategoryForCard,
  deleteCard,
  deleteCardCategory,
  endCard,
  getCardAmountSeries,
  getCategoryAmountSeries,
  renameCardCategory,
  restoreCard,
  restoreCardCategory,
  setCardCategory,
  toggleCardManuallyPaid,
} from "@/lib/rpc";
import { setCardFrequency } from "@/lib/rpc";
import type {
  AmountSeriesPoint,
  DeleteEffect,
  DeletedCategoryPayload,
  FrequencyEffect,
} from "@/lib/rpc";
import type { VerlaufPunkt } from "./verlauf";

export async function toggleCardTap(formData: FormData) {
  const cardId = formData.get("cardId") as string;
  const month = formData.get("month") as string; // "YYYY-MM-01"
  const supabase = createClient();
  await toggleCardManuallyPaid(supabase, { cardId, month });
  revalidatePath("/", "page");
}

// ── v2-31 (M7 / KAT-4): der Verlauf wird erst beim Öffnen geladen ───────────

/** Was das Verlaufs-Overlay zum Zeichnen braucht.
 *
 *  `heuteIso` kommt vom SERVER, nicht aus dem Browser. Die Grenze zwischen
 *  Teal und Grau liegt am Kalender-„jetzt" (§9) — käme sie vom Client, könnte
 *  eine falsch gestellte Uhr die Ist-Linie in die Zukunft verlängern. Dasselbe
 *  Muster wie in `loadWelleExtras`, wo das laufende Jahr server-seitig
 *  bestimmt wird. */
export type VerlaufDaten = {
  punkte: VerlaufPunkt[];
  /** ISO-Zeitpunkt des Servers, aus dem der Client `heuteIndex` bildet. */
  heuteIso: string;
};

/** Prüft das Jahr, das aus dem Browser kommt.
 *
 *  Eine Server Action ist ein von außen erreichbarer Endpunkt. RLS schützt die
 *  Daten (es sind ohnehin nur die eigenen), aber ein unplausibler Wert löste
 *  sinnlose Datenbank-Arbeit aus — bei der Ordner-Reihe immerhin 24 innere
 *  Aufrufe. Die Prüfung ist damit eine Lastschranke, kein Datenschutz.
 *  Wortgleich zu `loadWelleExtras`. */
function pruefeJahr(jahr: number): void {
  if (!Number.isInteger(jahr) || jahr < 1900 || jahr > 2200) {
    throw new Error(`Unplausibles Jahr: ${jahr}`);
  }
}

/** 24 Monate Ist und Plan einer Karte — Vorjahr und `jahr`. */
export async function loadCardVerlauf(
  cardId: string,
  jahr: number,
): Promise<VerlaufDaten> {
  pruefeJahr(jahr);
  const supabase = createClient();
  const reihe = await getCardAmountSeries(supabase, { cardId, year: jahr });
  return { punkte: reihe.map(zuPunkt), heuteIso: new Date().toISOString() };
}

/** 24 Monate Ist und Plan eines Ordners — dieselbe Fläche, eine Ebene höher. */
export async function loadCategoryVerlauf(
  categoryId: string,
  jahr: number,
): Promise<VerlaufDaten> {
  pruefeJahr(jahr);
  const supabase = createClient();
  const reihe = await getCategoryAmountSeries(supabase, { categoryId, year: jahr });
  return { punkte: reihe.map(zuPunkt), heuteIso: new Date().toISOString() };
}

/** `AmountSeriesPoint` → `VerlaufPunkt`. Die beiden Formen sind fast gleich;
 *  getrennt bleiben sie, weil `verlauf.ts` bewusst nichts über die Datenbank
 *  weiß und dadurch ohne Supabase testbar ist.
 *
 *  ⚠️ `null` bleibt `null`. Es aus Bequemlichkeit auf 0 zu ziehen, machte aus
 *  „die Karte gibt es in diesem Monat nicht" ein „sie kostete null Euro" —
 *  und zeichnete eine jährliche Karte in elf Monaten auf die Nulllinie
 *  (§7 Regel 17 / LL-20). */
function zuPunkt(p: AmountSeriesPoint): VerlaufPunkt {
  return {
    monthIndex: p.month_index,
    month: p.month,
    aktiv: p.aktiv,
    ist: p.ist,
    plan: p.plan,
  };
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

/** v2-26: Die Wiederholung einer bestehenden Karte ändern.
 *
 *  Bis zu diesem Sprint gab es dafür KEINEN Weg — die Frequenz war nach dem
 *  Anlegen endgültig, und der Default ist „Monatlich". Wer sich vertat, musste
 *  löschen und neu anlegen; genau das wollte der Nutzer bei `Privathaftpflicht`
 *  und scheiterte dann auch noch am Lösch-Tor.
 *
 *  Gibt die Sparraten-Wirkung zurück — gemessen in der Datenbank, nicht hier
 *  (Arbeitsregel 1). `year` ist das Kalenderjahr des angezeigten Monats. */
export async function setCardFrequencyAction(
  cardId: string,
  frequency: string,
  year: number,
): Promise<FrequencyEffect> {
  const supabase = createClient();
  const effect = await setCardFrequency(supabase, { cardId, frequency, year });
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

/* ── v2-25 (KJ-2): „Diesen Monat nicht angefallen" und die Rücknahme ─────────
 *
 * Beide schreiben GENAU DAS, was „Betrag anpassen auf 0 €, nur diesen Monat"
 * heute schon schreibt — es ist eine Abkürzung, keine neue Rechenregel. An
 * `calculate_card_amount_for_month` ändert sich nichts, die Prioritätskette
 * Realität → Anpassung → Plan bleibt unberührt.
 *
 * Deshalb auch keine eigene RPC: Es ist nichts zu rechnen und nichts zu
 * entscheiden, was die Datenbank besser wüsste. Dasselbe Muster wie
 * `applyAdjustmentThisMonth` oben.
 *
 * Die GEGENRICHTUNG von Entscheidung 4 („wer abhakt, hebt die Anpassung auf")
 * sitzt dagegen in der Datenbank, in `toggle_card_manually_paid` — dort geht es
 * um zwei Felder, die sich widersprechen können, und der Widerspruch bewegt die
 * Sparrate. Migration: 20260817_v2_25_kj2_haekchen_und_anpassung.sql */

/** „Diesen Monat nicht angefallen" — Betrag auf 0 für genau diesen Monat.
 *
 *  Setzt in EINEM Upsert `adjusted_amount = 0` UND `manually_paid = false`:
 *  „ist bezahlt" gegen „fiel nicht an" ist ein Widerspruch (Entscheidung 4).
 *  Zwei getrennte Schreibvorgänge könnten dazwischen scheitern und genau den
 *  Zustand hinterlassen, den die Entscheidung ausschließt. */
export async function setMonthNotIncurred(cardId: string, month: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht authentifiziert");

  const { error } = await supabase
    .from("card_monthly_states")
    .upsert(
      {
        card_id: cardId,
        month,
        adjusted_amount: 0,
        manually_paid: false,
        user_id: user.id,
      },
      { onConflict: "card_id,month" },
    );

  if (error) throw error;

  revalidatePath("/", "page");
}

/** „Wieder mitzählen" — hebt JEDE Anpassung dieses Monats auf, nicht nur die 0.
 *
 *  Der Wortlaut beschreibt, was hinterher gilt („die Karte zählt wieder mit
 *  ihrem Plan"), nicht wovon man kommt (Entscheidung 5). Ein zweiter Wortlaut
 *  für den allgemeinen Fall wäre eine Unterscheidung, die der Nutzer im Menü
 *  treffen müsste, ohne sie treffen zu wollen.
 *
 *  UPDATE auf NULL, NIEMALS DELETE: In derselben Zeile steht `manually_paid`,
 *  und das soll bleiben (§6 Stolperfalle 3). UPDATE auf eine nicht existierende
 *  Zeile betrifft 0 Zeilen und wirft nicht — das ist hier richtig, denn ohne
 *  Zustandszeile gibt es auch keine Anpassung aufzuheben. */
export async function resumeCountingThisMonth(cardId: string, month: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("card_monthly_states")
    .update({ adjusted_amount: null })
    .eq("card_id", cardId)
    .eq("month", month);

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
