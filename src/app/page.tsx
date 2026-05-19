import { createClient } from "@/lib/supabase/server";
import {
  calculatePlannedSparrateForMonth,
  calculateSparrateForMonth,
  calculateCardAmountForMonth,
  isCardActiveInMonth,
  getEffectivePlanForMonth,
} from "@/lib/rpc";
import {
  addMonths,
  getCurrentMonthYM,
  parseMonthParam,
  ymToDbDate,
} from "@/lib/months";
import { DashboardRingStage } from "@/components/dashboard-ring-stage";
import { HeaderTimeline } from "@/components/header-timeline";
import type { EnrichedCard, LinkedFragmentRef } from "@/components/cards/cards.types";
import { InteractionZone } from "@/components/interaction-zone";
import type { FragmentRow } from "@/components/interaction-zone/interaction-zone.types";
import { logout } from "./actions/auth";
import { DashboardDevPanel } from "./dashboard-dev-panel";
import styles from "./page.module.css";

type HomeProps = {
  searchParams: { month?: string | string[] };
};

export default async function Home({ searchParams }: HomeProps) {
  const supabase = createClient();
  const currentMonth = getCurrentMonthYM();
  const targetMonth = parseMonthParam(searchParams?.month);
  const targetDbDate = ymToDbDate(targetMonth);
  const previousMonth = addMonths(targetMonth, -1);
  const previousDbDate = ymToDbDate(previousMonth);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Onboarding-Guard liegt in der Middleware — hier vertrauen wir darauf, dass
  // user und profiles existieren.
  const [{ data: profile }, { data: ichRows }, { data: partnerRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("tax_class, tax_year")
      .eq("user_id", user!.id)
      .maybeSingle(),
    supabase
      .from("income_timeline")
      .select("gross_annual, net_monthly, effective_month")
      .eq("user_id", user!.id)
      .eq("person", "ICH")
      .order("effective_month", { ascending: false })
      .limit(1),
    supabase
      .from("income_timeline")
      .select("gross_annual, net_monthly, effective_month")
      .eq("user_id", user!.id)
      .eq("person", "PARTNER")
      .order("effective_month", { ascending: false })
      .limit(1),
  ]);

  const ichLatest = ichRows && ichRows.length > 0
    ? { grossAnnual: Number(ichRows[0].gross_annual), netMonthly: Number(ichRows[0].net_monthly) }
    : null;
  const partnerLatest = partnerRows && partnerRows.length > 0
    ? { grossAnnual: Number(partnerRows[0].gross_annual), netMonthly: Number(partnerRows[0].net_monthly) }
    : null;

  const now = new Date();
  const activeMonth = { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
  const taxYear = profile?.tax_year ?? activeMonth.year;
  const taxClass = profile?.tax_class ?? 1;

  let realCurrent: number | null = null;
  let realPlanned: number | null = null;
  try {
    [realCurrent, realPlanned] = await Promise.all([
      calculateSparrateForMonth(supabase, { userId: user!.id, month: targetDbDate }),
      calculatePlannedSparrateForMonth(supabase, { userId: user!.id, month: targetDbDate }),
    ]);
  } catch (err) {
    console.error("Sparrate-RPCs fehlgeschlagen", err);
  }

  // ── Karten-Loading (Sprint 4, unverändert in der Struktur) ───────────────

  const { data: rawCards } = await supabase
    .from("cards")
    .select("id, name, type, attribution, frequency, first_active_month, last_active_month")
    .is("deleted_at", null)
    .order("type", { ascending: true })
    .order("name", { ascending: true });

  let enrichedCards: EnrichedCard[] = [];

  if (rawCards && rawCards.length > 0) {
    const activeFlags = await Promise.all(
      rawCards.map((c) =>
        isCardActiveInMonth(supabase, { cardId: c.id, month: targetDbDate }),
      ),
    );
    const activeCards = rawCards.filter((_, i) => activeFlags[i]);

    enrichedCards = await Promise.all(
      activeCards.map(async (c) => {
        // K1.4: 3 parallele Werte pro Karte —
        //   1) `amount` (Display, RPC-Prioritätskette Realität→Anpassung→Plan)
        //   2) `effectivePlan` (Vergleichsbasis für Budget-Status + „Noch frei",
        //      via neue RPC get_effective_plan_for_month: Adjustment > Roh-Plan)
        //   3) Monthly-State-Row (manually_paid + adjusted_amount).
        // N+1-Pragmatik: bei <20 Karten in V1 akzeptable Latenz (Briefing §K1.4).
        const [amount, effectivePlan, stateRow] = await Promise.all([
          calculateCardAmountForMonth(supabase, { cardId: c.id, month: targetDbDate }),
          getEffectivePlanForMonth(supabase, { cardId: c.id, month: targetDbDate }),
          supabase
            .from("card_monthly_states")
            .select("manually_paid, adjusted_amount")
            .eq("card_id", c.id)
            .eq("month", targetDbDate)
            .maybeSingle()
            .then((r) => r.data),
        ]);

        return {
          id: c.id,
          name: c.name,
          type: c.type,
          attribution: c.attribution,
          frequency: c.frequency,
          first_active_month: c.first_active_month,
          last_active_month: c.last_active_month,
          amount,
          effectivePlan,
          manuallyPaid: stateRow?.manually_paid ?? false,
          adjustedAmount: stateRow?.adjusted_amount ?? null,
        } satisfies EnrichedCard;
      }),
    );

    const typeOrder: Record<string, number> = { FIXED_COST: 0, INCOME: 1, BUDGET: 2 };
    enrichedCards.sort(
      (a, b) =>
        (typeOrder[a.type] ?? 99) - (typeOrder[b.type] ?? 99) ||
        a.name.localeCompare(b.name, "de-DE"),
    );
  }

  // ── Fragmente (alle Monate, sortiert DESC) ───────────────────────────────

  const { data: rawFragments } = await supabase
    .from("fragments_with_status")
    .select(
      "id, amount, description, transaction_date, status, assigned_card_id, assigned_month",
    )
    .order("transaction_date", { ascending: false });

  const fragments: FragmentRow[] = (rawFragments ?? [])
    .filter(
      (f): f is typeof f & {
        id: string;
        amount: number;
        description: string;
        transaction_date: string;
        status: string;
      } =>
        f.id !== null &&
        f.amount !== null &&
        f.description !== null &&
        f.transaction_date !== null &&
        f.status !== null,
    )
    .map((f) => ({
      id: f.id,
      amount: Number(f.amount),
      description: f.description,
      transaction_date: f.transaction_date,
      status: f.status as FragmentRow["status"],
      assigned_card_id: f.assigned_card_id,
      assigned_month: f.assigned_month,
    }));

  // ── Linked-Fragments pro Karte für den targetMonth berechnen ─────────────

  const linkedByCardId = new Map<string, LinkedFragmentRef[]>();
  for (const f of fragments) {
    if (
      f.status === "ASSIGNED" &&
      f.assigned_card_id &&
      f.assigned_month === targetDbDate
    ) {
      const arr = linkedByCardId.get(f.assigned_card_id) ?? [];
      arr.push({
        fragmentId: f.id,
        amount: f.amount,
        description: f.description,
        transactionDate: f.transaction_date,
      });
      linkedByCardId.set(f.assigned_card_id, arr);
    }
  }
  for (const card of enrichedCards) {
    card.linkedFragments = linkedByCardId.get(card.id) ?? [];
  }

  // ── Linke-Flanke-Count: UNASSIGNED-Fragmente im Vormonat ─────────────────

  const { count: unassignedPreviousCountRaw } = await supabase
    .from("fragments_with_status")
    .select("*", { count: "exact", head: true })
    .eq("status", "UNASSIGNED")
    .gte("transaction_date", previousDbDate)
    .lt("transaction_date", targetDbDate);

  const unassignedPreviousMonthCount = unassignedPreviousCountRaw ?? 0;

  const showDevTriggers = process.env.NODE_ENV === "development";

  return (
    <main className={styles.main}>
      <div className={styles.topRow}>
        <p className={styles.email}>{user?.email}</p>
        <form action={logout}>
          <button className={styles.logout} type="submit">
            Abmelden
          </button>
        </form>
      </div>

      <HeaderTimeline
        targetMonth={targetMonth}
        currentMonth={currentMonth}
        unassignedPreviousMonthCount={unassignedPreviousMonthCount}
      />

      <DashboardRingStage realCurrent={realCurrent} realPlanned={realPlanned} />

      <InteractionZone
        fragments={fragments}
        cards={enrichedCards}
        targetMonth={targetMonth}
        targetDbMonth={targetDbDate}
        currentMonth={currentMonth}
      />

      {showDevTriggers && (
        <DashboardDevPanel
          ichLatest={ichLatest}
          partnerLatest={partnerLatest}
          isFirstIncomeForIch={ichLatest === null}
          taxClass={taxClass}
          taxYear={taxYear}
          activeMonth={activeMonth}
          // Setze hier z. B. { year: 2026, month: 2 } um A17 (Past-Month-Sperre)
          // zu testen. Kein UI fuer den Past-Toggle in V1.
          // forcePastMonth={{ year: 2026, month: 2 }}
        />
      )}
    </main>
  );
}
