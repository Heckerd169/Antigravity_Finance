"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getEffectivePlanForMonth, getSplitFactor } from "@/lib/rpc";
import {
  buildConsequenceItems,
  isEmptyConsequence,
  totalsOf,
  type SharedCardPlan,
  type SplitConsequence,
} from "./consequence";
import type { Person } from "./income-split.types";

export type SaveIncomeChangeResult =
  | {
      ok: true;
      /** v2-16 (PA-1): Was die Änderung kostet — oder `null` für den leeren
       *  Fall (Split unverändert bzw. keine gemeinsamen Posten). Dann schließt
       *  das Popup wie bisher (§10, LL-20). */
      consequence: SplitConsequence | null;
    }
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

  /* v2-16 (PA-1): Der Split-Faktor VOR der Änderung — echt aus der Datenbank
     gelesen, nicht aus dem Brutto nachgerechnet. Das Frontend bildet für die
     Live-Vorschau zwar dasselbe Verhältnis, aber eine Anzeige, die sagt „so
     war es vorher", muss den Wert von dort holen, wo er herkommt (§7 Regel 1
     im Geist, LL-22: eine Zusicherung über Rechenverhalten ist keine Prüfung). */
  const factorBefore = await getSplitFactor(supabase, {
    userId: user.id,
    month: effectiveMonth,
  });

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

  const consequence = await buildSplitConsequence(
    supabase,
    user.id,
    effectiveMonth,
    factorBefore,
  );

  revalidatePath("/");
  return { ok: true, consequence };
}

/** v2-16 (PA-1) — die Konsequenz-Anzeige (Design-Doku §10).
 *
 *  Läuft NACH dem Speichern, damit `get_split_factor` den neuen Faktor liefert.
 *  Gibt `null` zurück, sobald die Anzeige nichts zu sagen hätte — dann schließt
 *  das Popup wie bisher (LL-20: ein Referenzwert ohne Daten ist „keine
 *  Anzeige", nicht 0).
 *
 *  §4.5-Rahmung: Der Split wirkt NUR auf Beträge aus Plan oder Anpassung, nie
 *  auf einen realen Umsatz. Die Liste zeigt deshalb den künftigen PLAN-Anteil —
 *  praktisch: auf welchen Betrag ein Dauerauftrag zu stellen ist. Basis ist
 *  darum `get_effective_plan_for_month` (Roh-Soll, ungesplittet) und NICHT
 *  `calculate_card_amount_for_month`: Letztere trägt den Anteil seit v2-13
 *  bereits in sich (CLAUDE.md §6 Stolperfalle 11) — sie hier zu nehmen und den
 *  Faktor erneut anzuwenden wäre exakt der Doppel-Abzug, gegen den `BF-4`
 *  geschrieben wurde. Und sie zeigt bei verknüpftem Fragment die Realität, die
 *  sich durch einen neuen Split gar nicht ändert.
 *
 *  Fehler schlucken wir hier bewusst: Das Einkommen IST gespeichert. Eine
 *  fehlgeschlagene Zusatz-Anzeige darf den Erfolg nicht in einen Fehler
 *  verwandeln — dann entfällt eben die Anzeige. */
async function buildSplitConsequence(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  effectiveMonth: string,
  factorBefore: number,
): Promise<SplitConsequence | null> {
  try {
    const factorAfter = await getSplitFactor(supabase, {
      userId,
      month: effectiveMonth,
    });

    /* Nur das Netto geändert → Faktor unverändert → gar keine Anzeige. Der
       Vergleich läuft über die WIRKUNG weiter unten, nicht nur über den
       Faktor: eine Änderung in der zwölften Nachkommastelle bewegt keinen
       einzigen Cent und wäre trotzdem „≠". */

    /* LL-21: `cards` wächst mit, deshalb server-seitig eingegrenzt statt
       nachgelagert gefiltert. Gemeinsame, nicht gelöschte Karten sind im
       Bestand vier Stück — die 1000-Zeilen-Grenze ist hier strukturell
       unerreichbar. */
    const { data: sharedCards, error } = await supabase
      .from("cards")
      .select("id, name, type")
      .eq("attribution", "GEMEINSAM")
      .is("deleted_at", null);

    if (error || !sharedCards || sharedCards.length === 0) return null;

    /* `get_effective_plan_for_month` liefert bereits 0 für eine im Monat
       INAKTIVE Karte (Auflösungs-Ordnung Punkt 1) — ein separater
       Aktivitäts-Check erübrigt sich damit. Eine Jahres-Karte außerhalb ihres
       Monats fällt so von allein aus der Liste. */
    const plans: SharedCardPlan[] = await Promise.all(
      sharedCards.map(async (card) => ({
        cardId: card.id,
        name: card.name,
        plan: await getEffectivePlanForMonth(supabase, {
          cardId: card.id,
          month: effectiveMonth,
        }),
        isIncome: card.type === "INCOME",
      })),
    );

    const items = buildConsequenceItems(plans, factorBefore, factorAfter);
    const { totalBefore, totalAfter, totalImpact } = totalsOf(items);
    if (isEmptyConsequence(items, totalImpact)) return null;

    return {
      factorBefore,
      factorAfter,
      effectiveMonth,
      items,
      totalBefore,
      totalAfter,
      totalImpact,
    };
  } catch {
    return null;
  }
}

function isPastMonth(am: { year: number; month: number }): boolean {
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth() + 1;
  if (am.year < currentYear) return true;
  if (am.year > currentYear) return false;
  return am.month < currentMonth;
}
