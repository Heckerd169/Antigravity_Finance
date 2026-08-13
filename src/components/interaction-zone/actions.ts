"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createCardDirect,
  createCardFromFragment,
  linkFragmentToIncome,
  processCsvImport,
  setFragmentAssetReallocation,
  type AssetReallocationResult,
  type CreateCardDirectArgs,
  type CreateCardFromFragmentArgs,
  type CsvFormatHint,
  type CsvImportRow,
  type CsvImportResult,
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

// ── v2-19 (GE-1): Drop einer Zahlung auf die Netto-Kachel ───────────────────

/** Ordnet eine Zahlung dem Netto des angezeigten Monats zu.
 *
 *  Anders als `linkFragmentToCard` läuft das über eine RPC statt über einen
 *  UPSERT: Das Vorzeichen muss geprüft werden, sonst ließe sich eine Ausgabe
 *  aufs Gehalt ziehen. Die Prüfung gehört in die Datenbank, nicht hierher —
 *  sonst gäbe es zwei Wahrheiten (§7 Regel 15).
 *
 *  Der Monat ist der ANGEZEIGTE, nicht das Buchungsdatum der Zahlung — dieselbe
 *  Periodenabgrenzung wie beim Karten-Drop (§6 Stolperfalle 6). Ein Gehalt, das
 *  am 30.06. für Juli kommt, gehört damit in den Juli. */
export async function linkFragmentToIncomeAction(
  fragmentId: string,
  month: string, // "YYYY-MM-01"
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht authentifiziert");

  await linkFragmentToIncome(supabase, { fragmentId, month });

  revalidatePath("/", "page");
}

/* Das Gegenstück — das LÖSEN — liegt bewusst nicht hier, sondern in
   `income-split/actions.ts`: Gelöst wird im Einkommens-Fenster (Record,
   Entscheidung E), und dorthin gehört die Aktion auch im Code. Sie hier zu
   lassen hieße, dass das Fenster aus dem Karussell importiert — eine
   Import-Richtung, die es bisher nicht gibt und die einen Zyklus schafft
   (`netto-tile` → `income-split` → `interaction-zone/actions`). */

// ── CSV-Import (Sprint 8) ────────────────────────────────────────────────────

/** Ruft die atomare Distiller-RPC und revalidiert das Dashboard. Der
 *  revalidatePath liefert dem aufrufenden Client-Component das aktualisierte
 *  RSC-Payload zurück → Fragment-Stack zeigt neue Fragmente, ohne Reload (P3). */
export async function processCsvImportAction(
  rows: CsvImportRow[],
  formatHint: CsvFormatHint,
): Promise<CsvImportResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht authentifiziert");

  const result = await processCsvImport(supabase, rows, formatHint);

  revalidatePath("/", "page");
  return result;
}

// ── ASSET_REALLOCATION-Markierung (Sprint v2-04 ②, Interim-Verdrahtung) ─────

/** Setzt/entfernt die manuelle Umschichtungs-Markierung eines Fragments.
 *  Ownership-Check + Transitions-Validierung liegen in der RPC (42501/23514/
 *  22023). Die finale Markier-Geste ist DD-Territorium — dies ist nur die
 *  minimale Verdrahtung (Briefing §7). */
export async function setFragmentAssetReallocationAction(
  fragmentId: string,
  set: boolean,
): Promise<AssetReallocationResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht authentifiziert");

  const result = await setFragmentAssetReallocation(supabase, {
    fragmentId,
    set,
  });

  revalidatePath("/", "page");
  return result;
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
