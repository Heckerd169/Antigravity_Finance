"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createCardDirect,
  createCardFromFragment,
  type CreateCardDirectArgs,
  type CreateCardFromFragmentArgs,
} from "@/lib/rpc";
import type {
  CardAttribution,
  CardFrequency,
  CardType,
} from "./interaction-zone.types";

// ── Drop Fragment auf existierende Karte ────────────────────────────────────

/** UPSERT card_fragment_links: ON CONFLICT(fragment_id) → re-assign auf neue
 *  Karte. month = aktuell angezeigter Monat (Konflikt 4 §7 / A19). */
export async function linkFragmentToCard(
  fragmentId: string,
  cardId: string,
  month: string, // "YYYY-MM-01"
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht authentifiziert");

  const { error } = await supabase
    .from("card_fragment_links")
    .upsert(
      {
        user_id: user.id,
        fragment_id: fragmentId,
        card_id: cardId,
        month,
        origin: "MANUAL_DROP",
      },
      { onConflict: "fragment_id" },
    );

  if (error) throw error;

  revalidatePath("/", "page");
}

// ── Eject Fragment ──────────────────────────────────────────────────────────

export async function ejectFragment(fragmentId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht authentifiziert");

  const { error } = await supabase
    .from("card_fragment_links")
    .delete()
    .eq("fragment_id", fragmentId);

  if (error) throw error;

  revalidatePath("/", "page");
}

// ── Direktklick — neue Karte ────────────────────────────────────────────────

type CreateCardInput = {
  name: string;
  type: CardType;
  attribution: CardAttribution;
  frequency: CardFrequency;
  firstActiveMonth: string; // "YYYY-MM-01"
  plannedAmount: number;
};

export async function createCardDirectAction(
  input: CreateCardInput,
): Promise<{ cardId: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht authentifiziert");

  const args: CreateCardDirectArgs = {
    name: input.name.trim(),
    type: input.type,
    attribution: normalizeAttribution(input.type, input.attribution),
    frequency: input.frequency,
    firstActiveMonth: input.firstActiveMonth,
    lastActiveMonth:
      input.frequency === "ONCE" ? input.firstActiveMonth : null,
    plannedAmount: input.plannedAmount,
  };

  const cardId = await createCardDirect(supabase, args);

  revalidatePath("/", "page");
  return { cardId };
}

// ── Fragment-Drop auf Empty-Slot — neue Karte + Link ────────────────────────

type CreateCardFromFragmentInput = CreateCardInput & {
  fragmentId: string;
  linkMonth: string; // = aktuell angezeigter Monat (Konflikt 4 §7)
};

export async function createCardFromFragmentAction(
  input: CreateCardFromFragmentInput,
): Promise<{ cardId: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht authentifiziert");

  const args: CreateCardFromFragmentArgs = {
    name: input.name.trim(),
    type: input.type,
    attribution: normalizeAttribution(input.type, input.attribution),
    frequency: input.frequency,
    firstActiveMonth: input.firstActiveMonth,
    lastActiveMonth:
      input.frequency === "ONCE" ? input.firstActiveMonth : null,
    plannedAmount: input.plannedAmount,
    fragmentId: input.fragmentId,
    linkMonth: input.linkMonth,
  };

  const cardId = await createCardFromFragment(supabase, args);

  revalidatePath("/", "page");
  return { cardId };
}

// ── Helper ──────────────────────────────────────────────────────────────────

/** §7 + DB-Constraint: BUDGET-Karten haben immer attribution=ICH. UI versteckt
 *  die Auswahl — hier als Defense-in-Depth zusätzlich erzwungen. */
function normalizeAttribution(
  type: CardType,
  attribution: CardAttribution,
): CardAttribution {
  if (type === "BUDGET") return "ICH";
  return attribution;
}
