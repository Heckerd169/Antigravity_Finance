"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Person } from "./income-split.types";

export type SaveIncomeChangeResult =
  | { ok: true }
  | { ok: false; error: string; code?: "PAST_MONTH" | "OTHER" };

export async function saveIncomeChange(input: {
  person: Person;
  effectiveMonth: { year: number; month: number };
  grossAnnual: number;
  netMonthly: number;
  // Nur relevant beim allerersten Income-Eintrag fuer ICH (siehe §10).
  taxClassToPersist?: number;
  taxYearToPersist?: number;
}): Promise<SaveIncomeChangeResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Nicht angemeldet.", code: "OTHER" };

  if (!Number.isFinite(input.grossAnnual) || input.grossAnnual < 0) {
    return { ok: false, error: "Jahresbrutto ungueltig.", code: "OTHER" };
  }
  if (!Number.isFinite(input.netMonthly) || input.netMonthly < 0) {
    return { ok: false, error: "Monatliches Netto ungueltig.", code: "OTHER" };
  }

  // Past-Month-Guard server-seitig (Belt-and-Suspenders zur UI-Sperre — kein
  // Trust auf Client-State). Briefing Korrektur K1.
  if (isPastMonth(input.effectiveMonth)) {
    return {
      ok: false,
      error: "Vergangene Monate sind eingefroren.",
      code: "PAST_MONTH",
    };
  }

  const effectiveMonth = `${input.effectiveMonth.year}-${String(input.effectiveMonth.month).padStart(2, "0")}-01`;

  // UPSERT (Korrektur K1): UNIQUE(user_id, person, effective_month) definiert
  // einen Slot pro Monat-Person; Re-Save desselben Monats fuer dieselbe Person
  // ueberschreibt den Slot. Snapshot-Integritaet bleibt gewahrt, weil
  // vergangene Monate ueber den Past-Month-Guard oben gesperrt sind.
  const { error } = await supabase
    .from("income_timeline")
    .upsert(
      {
        user_id: user.id,
        person: input.person,
        effective_month: effectiveMonth,
        gross_annual: input.grossAnnual,
        net_monthly: input.netMonthly,
      },
      { onConflict: "user_id,person,effective_month" },
    );

  if (error) {
    return { ok: false, error: `Speichern fehlgeschlagen: ${error.message}`, code: "OTHER" };
  }

  if (input.taxClassToPersist != null) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        tax_class: input.taxClassToPersist,
        tax_year: input.taxYearToPersist ?? new Date().getUTCFullYear(),
      })
      .eq("user_id", user.id);
    if (profileError) {
      return {
        ok: false,
        error: `Income gespeichert, aber Steuerklasse konnte nicht persistiert werden: ${profileError.message}`,
        code: "OTHER",
      };
    }
  }

  revalidatePath("/");
  return { ok: true };
}

function isPastMonth(am: { year: number; month: number }): boolean {
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth() + 1;
  if (am.year < currentYear) return true;
  if (am.year > currentYear) return false;
  return am.month < currentMonth;
}
