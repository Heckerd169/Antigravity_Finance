import { createClient } from "@/lib/supabase/server";
import {
  calculatePlannedSparrateForMonth,
  calculateSparrateForMonth,
  calculateCardAmountForMonth,
  isCardActiveInMonth,
  getPlannedAmountForMonth,
} from "@/lib/rpc";
import {
  getCurrentMonthYM,
  parseMonthParam,
  ymToDbDate,
} from "@/lib/months";
import { DashboardRingStage } from "@/components/dashboard-ring-stage";
import { HeaderTimeline } from "@/components/header-timeline";
import { CardsCarousel } from "@/components/cards";
import type { EnrichedCard } from "@/components/cards/cards.types";
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

  // ── Karten-Loading (§3.3) ────────────────────────────────────────────────

  // 1. Alle Karten des Users laden (deleted_at IS NULL = nicht soft-deleted)
  const { data: rawCards } = await supabase
    .from("cards")
    .select("id, name, type, attribution, frequency, first_active_month, last_active_month")
    .is("deleted_at", null)
    .order("type", { ascending: true })
    .order("name", { ascending: true });

  let enrichedCards: EnrichedCard[] = [];

  if (rawCards && rawCards.length > 0) {
    // 2. Aktivitäts-Filter (parallel)
    const activeFlags = await Promise.all(
      rawCards.map((c) =>
        isCardActiveInMonth(supabase, { cardId: c.id, month: targetDbDate }),
      ),
    );
    const activeCards = rawCards.filter((_, i) => activeFlags[i]);

    // 3. Beträge + Monthly-State (parallel pro Karte)
    enrichedCards = await Promise.all(
      activeCards.map(async (c) => {
        const [amount, planned, stateRow] = await Promise.all([
          calculateCardAmountForMonth(supabase, { cardId: c.id, month: targetDbDate }),
          c.type === "BUDGET"
            ? getPlannedAmountForMonth(supabase, { cardId: c.id, month: targetDbDate })
            : Promise.resolve(null),
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
          planned,
          manuallyPaid: stateRow?.manually_paid ?? false,
          adjustedAmount: stateRow?.adjusted_amount ?? null,
        } satisfies EnrichedCard;
      }),
    );

    // 4. Sortieren: FIXED_COST → INCOME → BUDGET, alphabetisch innerhalb
    const typeOrder: Record<string, number> = { FIXED_COST: 0, INCOME: 1, BUDGET: 2 };
    enrichedCards.sort(
      (a, b) =>
        (typeOrder[a.type] ?? 99) - (typeOrder[b.type] ?? 99) ||
        a.name.localeCompare(b.name, "de-DE"),
    );
  }

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

      <HeaderTimeline targetMonth={targetMonth} currentMonth={currentMonth} />

      <DashboardRingStage realCurrent={realCurrent} realPlanned={realPlanned} />

      <CardsCarousel
        cards={enrichedCards}
        targetMonth={targetMonth}
        currentMonth={currentMonth}
        dbMonth={targetDbDate}
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
