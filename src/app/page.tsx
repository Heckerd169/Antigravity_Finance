import { createClient } from "@/lib/supabase/server";
import {
  calculatePlannedSparrateForMonth,
  calculateSparrateForMonth,
} from "@/lib/rpc";
import {
  getCurrentMonthYM,
  parseMonthParam,
  ymToDbDate,
} from "@/lib/months";
import { DashboardRingStage } from "@/components/dashboard-ring-stage";
import { HeaderTimeline } from "@/components/header-timeline";
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
