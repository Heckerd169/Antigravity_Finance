"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Person } from "./income-split.types";

export type SaveIncomeChangeResult =
  | { ok: true }
  | { ok: false; error: string; code?: "DUPLICATE_MONTH" | "OTHER" };

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

  const effectiveMonth = `${input.effectiveMonth.year}-${String(input.effectiveMonth.month).padStart(2, "0")}-01`;

  const { error } = await supabase.from("income_timeline").insert({
    user_id: user.id,
    person: input.person,
    effective_month: effectiveMonth,
    gross_annual: input.grossAnnual,
    net_monthly: input.netMonthly,
  });

  if (error) {
    // Postgres unique_violation = 23505. Schema hat
    // UNIQUE(user_id, person, effective_month).
    // §8.2 des Briefings: "Falls Constraint vorhanden ist und blockt: in
    // Review als offene Frage melden". Kein UPDATE-Pfad in V1 (Schema §6:
    // append-only).
    if (error.code === "23505") {
      return {
        ok: false,
        error: "Für diesen Monat und diese Person existiert bereits ein Eintrag. (V1: keine Korrektur über die UI möglich — siehe Sprint-1-Review §8.2.)",
        code: "DUPLICATE_MONTH",
      };
    }
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
