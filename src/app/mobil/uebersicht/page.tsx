import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCardsForMonth, getSparrateSeries } from "@/lib/rpc";
import type { CardMonthValues, SparrateSeriesPoint } from "@/lib/rpc";
import { splitDescription } from "@/lib/description";
import {
  addMonths,
  formatMonthLabel,
  getCurrentMonthYM,
  parseMonthParam,
  ymToDbDate,
} from "@/lib/months";
import { isLinkedToCard } from "@/components/interaction-zone/interaction-zone.types";
import type { FragmentRow } from "@/components/interaction-zone/interaction-zone.types";
import {
  resolveFixedCostState,
  resolveIncomeState,
  sumLinkedFragments,
} from "@/components/cards/card-state";
import type { EnrichedCard } from "@/components/cards/cards.types";
import { MobilTabBar } from "@/components/mobil/tab-bar";
import { eurGanz } from "@/components/mobil/format";
import { monatsStatus } from "@/components/mobil/zuordnen/zustand";
import { UebersichtScreen } from "@/components/mobil/uebersicht";
import {
  KACHEL_REIHENFOLGE,
  kachelTitel,
  kachelTyp,
  kachelUnterzeile,
  realisierterIndex,
} from "@/components/mobil/uebersicht/regeln";
import type { KachelTyp } from "@/components/mobil/uebersicht/regeln";
import type { Kachel, UebersichtDaten } from "@/components/mobil/uebersicht/uebersicht.types";

type Props = {
  searchParams: { month?: string | string[] };
};

/* Tab „Übersicht" auf /mobil — der Server-Lader (Handoff §4).
 *
 * ACHT Netzrunden je Aufbau, gezählt (§9 Anker 3; Zuordnen: 11, Schreibtisch: ~18):
 * Anmeldung 1 · profiles 1 · cards 1 · get_sparrate_series 1 ·
 * get_cards_for_month 1 · verknüpfte Zahlungen des Monats 1 · offene Zahlungen 1 ·
 * letzte Zuordnung 1.
 *
 * `get_sparrate_series` trägt hier DREI Aufgaben in einem Aufruf: die zwölf
 * Werte der Welle, die Ist-Sparrate für die Ringmitte und die Plan-Sparrate für
 * den Bogen. Ein eigener `calculate_sparrate_for_month` wäre eine Netzrunde für
 * eine Zahl, die schon da ist (LL-29).
 *
 * Gerechnet wird hier nichts, was die Datenbank rechnet (§7 Regel 1). Summiert
 * werden nur Plan-Werte je Kartentyp für die drei Kacheln — und dort **ohne**
 * Rundungs-Ausgleich: Die Summe der drei Kacheln erscheint nirgends als
 * Sparrate, also gäbe es nichts auszugleichen (LL-43). */
export default async function UebersichtPage({ searchParams }: Props) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Wie `app/page.tsx` und `mobil/zuordnen`: Die Seite verlässt sich nicht
  // blind auf die Middleware (v2-24).
  if (!user) redirect("/login");

  const currentMonth = getCurrentMonthYM();
  const targetMonth = parseMonthParam(searchParams?.month);
  const targetDbDate = ymToDbDate(targetMonth);
  const nextDbDate = ymToDbDate(addMonths(targetMonth, 1));
  const jahr = Number(targetMonth.slice(0, 4));
  const monatsIndex = Number(targetMonth.slice(5, 7)) - 1;

  const [{ data: profile }, { data: rawCards }] = await Promise.all([
    supabase
      .from("profiles")
      .select("onboarded_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("cards")
      .select("id, name, type")
      .is("deleted_at", null),
  ]);

  if (!profile?.onboarded_at) redirect("/onboarding");

  const cards = rawCards ?? [];
  const cardById = new Map(cards.map((c) => [c.id, c]));

  const [
    serie,
    monthValues,
    { data: linkedRows },
    { count: offenRaw },
    { data: letzteLinks },
  ] = await Promise.all([
    // Fällt die Serie aus, bleibt die Bühne leer und die Seite steht — dieselbe
    // Haltung wie bei `categoryAmounts` in `app/page.tsx`.
    getSparrateSeries(supabase, { userId: user.id, year: jahr }).catch(
      (err: unknown): SparrateSeriesPoint[] => {
        console.error("Sparraten-Serie fehlgeschlagen", err);
        return [];
      },
    ),
    getCardsForMonth(supabase, { userId: user.id, month: targetDbDate }).catch(
      (err: unknown): CardMonthValues[] => {
        console.error("Karten-Monatswerte fehlgeschlagen", err);
        return [];
      },
    ),
    // Was in DIESEM Monat auf einer Karte liegt — auch Zahlungen aus einem
    // anderen Buchungsmonat (§6 Stolperfalle 6). Daraus entstehen die Reste
    // in den Kacheln; nach Buchungsdatum zu schneiden wäre LL-26 in der Form
    // „Monatsbezug".
    supabase
      .from("fragments_with_status")
      .select("id, amount, description, transaction_date, status, assigned_card_id")
      .eq("assigned_month", targetDbDate),
    // Dieselbe Zählung wie im Tab „Zuordnen" — die Zahl steuert dasselbe Badge.
    supabase
      .from("fragments_with_status")
      .select("*", { count: "exact", head: true })
      .eq("status", "UNASSIGNED")
      .gte("transaction_date", targetDbDate)
      .lt("transaction_date", nextDbDate),
    // Fußzeile „Zuletzt zugeordnet". Der Zeitpunkt der ZUORDNUNG steht in
    // `card_fragment_links.created_at`; die View kennt nur `imported_at` des
    // Fragments, was etwas anderes ist.
    supabase
      .from("card_fragment_links")
      .select("card_id, fragment_id, created_at")
      .eq("month", targetDbDate)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const punkt = serie.find((p) => p.month_index === monatsIndex);
  const welleValues =
    serie.length === 12
      ? serie
          .slice()
          .sort((a, b) => a.month_index - b.month_index)
          .map((p) => p.ist ?? 0)
      : new Array(12).fill(0);

  // ── Kacheln: Plansumme und Rest je Kartentyp ────────────────────────────
  const asStatus = (s: string) => ({ status: s as FragmentRow["status"] });
  const linkedByCard = new Map<
    string,
    { fragmentId: string; amount: number; description: string; transactionDate: string }[]
  >();
  for (const l of linkedRows ?? []) {
    if (!l.assigned_card_id || l.id === null || l.amount === null) continue;
    if (!isLinkedToCard(asStatus(l.status ?? ""))) continue;
    const arr = linkedByCard.get(l.assigned_card_id) ?? [];
    arr.push({
      fragmentId: l.id,
      amount: Number(l.amount),
      description: l.description ?? "",
      transactionDate: l.transaction_date ?? "",
    });
    linkedByCard.set(l.assigned_card_id, arr);
  }

  const istZukunft = targetMonth > currentMonth;

  type Sammler = { plan: number; rest: number; einnahmenOffen: number };
  const summen = new Map<KachelTyp, Sammler>(
    KACHEL_REIHENFOLGE.map((k) => [k, { plan: 0, rest: 0, einnahmenOffen: 0 }]),
  );

  for (const v of monthValues) {
    const card = cardById.get(v.card_id);
    if (!card) continue;
    const k = kachelTyp(card.type);
    const s = summen.get(k);
    if (!s) continue;

    // Die Resolver lesen nur diese vier Felder — dieselbe Verkürzung wie im
    // Sheet des Tabs „Zuordnen".
    const wieKarte = {
      manuallyPaid: v.manually_paid,
      adjustedAmount: v.adjusted_amount,
      linkedFragments: linkedByCard.get(v.card_id) ?? [],
      effectivePlan: v.effective_plan,
    } as unknown as EnrichedCard;

    s.plan += v.effective_plan;

    if (k === "fixkosten") {
      // Offen heißt: noch nicht bezahlt. Die Regel dafür steht in
      // `card-state.ts` und wird hier nicht ein zweites Mal formuliert (LL-26).
      if (resolveFixedCostState(wieKarte, istZukunft) !== "paid") s.rest += v.amount;
    } else if (k === "budget") {
      s.rest += Math.max(0, v.effective_plan - sumLinkedFragments(wieKarte));
    } else if (resolveIncomeState(wieKarte, istZukunft) !== "received") {
      s.einnahmenOffen += 1;
    }
  }

  const kacheln: Kachel[] = KACHEL_REIHENFOLGE.map((k) => {
    const s = summen.get(k) ?? { plan: 0, rest: 0, einnahmenOffen: 0 };
    return {
      titel: kachelTitel(k),
      // Ganze Euro: Drei Kacheln teilen sich die Breite, jede bekommt rund
      // 105 px. Mit Cent endete die Zeile in einer Ellipse — ausgerechnet auf
      // der Ziffer (LL-31, gemessen im Design-Record).
      plan: eurGanz(s.plan),
      unten: kachelUnterzeile({
        kachel: k,
        restText: eurGanz(s.rest),
        alleEingegangen: s.einnahmenOffen === 0,
      }),
    };
  });

  // ── Fußzeile ────────────────────────────────────────────────────────────
  const letzter = (letzteLinks ?? [])[0];
  const letztesFragment = letzter
    ? (linkedRows ?? []).find((f) => f.id === letzter.fragment_id)
    : undefined;
  const letzteKarte = letzter ? cardById.get(letzter.card_id) : undefined;
  const zuletzt =
    letztesFragment && letzteKarte
      ? {
          empfaenger: splitDescription(letztesFragment.description ?? "").empfaenger,
          karte: letzteKarte.name,
        }
      : null;

  const daten: UebersichtDaten = {
    monat: targetMonth,
    monatLabel: formatMonthLabel(targetMonth),
    status: monatsStatus(targetMonth, currentMonth),
    sparrate: punkt?.ist ?? null,
    planSparrate: punkt?.plan ?? null,
    welle: {
      values: welleValues,
      realizedIndex: realisierterIndex(jahr, currentMonth),
      activeIndex: monatsIndex,
    },
    kacheln,
    offen: offenRaw ?? 0,
    zuletzt,
  };

  return (
    <>
      <UebersichtScreen daten={daten} />
      <MobilTabBar aktiv="uebersicht" offen={daten.offen} monat={targetMonth} />
    </>
  );
}
