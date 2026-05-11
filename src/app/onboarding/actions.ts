"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type OnboardingResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitOnboarding(input: {
  taxClass: number;
  taxYear: number;
  grossAnnual: number;
  netMonthly: number;
  partner?: { grossAnnual: number; netMonthly: number };
}): Promise<OnboardingResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Nicht angemeldet." };

  if (!Number.isFinite(input.netMonthly) || input.netMonthly <= 0) {
    return { ok: false, error: "Monatliches Netto muss > 0 sein." };
  }
  if (!Number.isFinite(input.grossAnnual) || input.grossAnnual <= 0) {
    return { ok: false, error: "Jahresbrutto muss > 0 sein." };
  }
  if (![1, 2, 3, 4, 5, 6].includes(input.taxClass)) {
    return { ok: false, error: "Steuerklasse ungueltig." };
  }

  const effectiveMonth = firstOfCurrentMonth();

  // UPSERT (Korrektur K1): wenn ein vorheriger Onboarding-Versuch
  // unvollstaendig abgebrochen wurde (z. B. ICH inserted, profiles-Update
  // failed), laeuft der zweite Versuch sauber durch — der Slot
  // (user_id, person, effective_month) wird ueberschrieben.
  const { error: incomeError } = await supabase.from("income_timeline").upsert(
    {
      user_id: user.id,
      person: "ICH",
      effective_month: effectiveMonth,
      gross_annual: input.grossAnnual,
      net_monthly: input.netMonthly,
    },
    { onConflict: "user_id,person,effective_month" },
  );
  if (incomeError) {
    return { ok: false, error: `Einkommen ICH konnte nicht gespeichert werden: ${incomeError.message}` };
  }

  if (input.partner) {
    const { error: partnerError } = await supabase.from("income_timeline").upsert(
      {
        user_id: user.id,
        person: "PARTNER",
        effective_month: effectiveMonth,
        gross_annual: input.partner.grossAnnual,
        net_monthly: input.partner.netMonthly,
      },
      { onConflict: "user_id,person,effective_month" },
    );
    if (partnerError) {
      return { ok: false, error: `Einkommen Partner konnte nicht gespeichert werden: ${partnerError.message}` };
    }
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      tax_class: input.taxClass,
      tax_year: input.taxYear,
      onboarded_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);
  if (profileError) {
    return { ok: false, error: `Profil konnte nicht aktualisiert werden: ${profileError.message}` };
  }

  redirect("/");
}

function firstOfCurrentMonth(): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}-01`;
}
