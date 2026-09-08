import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCardsForMonth } from "@/lib/rpc";
import type { CardMonthValues } from "@/lib/rpc";
import { splitDescription } from "@/lib/description";
import {
  addMonths,
  compareMonths,
  formatMonthNameOnly,
  getCurrentMonthYM,
  parseMonthParam,
  ymToDbDate,
} from "@/lib/months";
import { isLinkedToCard } from "@/components/interaction-zone/interaction-zone.types";
import type { FragmentRow } from "@/components/interaction-zone/interaction-zone.types";
import {
  resolveBudgetState,
  resolveFixedCostState,
  resolveIncomeState,
  sumLinkedFragments,
} from "@/components/cards/card-state";
import type { EnrichedCard } from "@/components/cards/cards.types";
import { MobilTabBar } from "@/components/mobil/tab-bar";
import { eur } from "@/components/mobil/format";
import { kartenGruppe } from "@/components/mobil/zuordnen/gruppen";
import { KartenScreen } from "@/components/mobil/karten";
import {
  balkenAnteil,
  balkenFarbe,
  punktFarbe,
  rechtsUnten,
  statusWort,
  typWort,
} from "@/components/mobil/karten/regeln";
import type { KartenZustand } from "@/components/mobil/karten/regeln";
import type { KartenDaten, KartenZeile } from "@/components/mobil/karten/karten.types";

type Props = {
  searchParams: { month?: string | string[] };
};

/* Tab „Karten" auf /mobil — der Server-Lader (Handoff §5).
 *
 * SECHS Netzrunden je Aufbau, gezählt (§9 Anker 3; Zuordnen: 11, Übersicht: 8):
 * Anmeldung 1 · profiles 1 · cards 1 · get_cards_for_month 1 ·
 * verknüpfte Zahlungen des Monats 1 · offene Zahlungen 1.
 *
 * Welche Karten im Monat aktiv sind, sagt `get_cards_for_month` — in EINEM
 * Aufruf, nicht 178-mal einzeln (LL-28/LL-29). Ob eine Karte offen, bezahlt
 * oder überschritten ist, sagt `card-state.ts`; diese Seite formuliert die
 * Regel nicht ein zweites Mal (LL-26). */
export default async function KartenPage({ searchParams }: Props) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const currentMonth = getCurrentMonthYM();
  const targetMonth = parseMonthParam(searchParams?.month);
  const targetDbDate = ymToDbDate(targetMonth);
  const nextDbDate = ymToDbDate(addMonths(targetMonth, 1));

  const [{ data: profile }, { data: rawCards }] = await Promise.all([
    supabase
      .from("profiles")
      .select("onboarded_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("cards")
      .select("id, name, type, frequency")
      .is("deleted_at", null),
  ]);

  if (!profile?.onboarded_at) redirect("/onboarding");

  const cards = rawCards ?? [];
  const cardById = new Map(cards.map((c) => [c.id, c]));

  const [monthValues, { data: linkedRows }, { count: offenRaw }] = await Promise.all([
    getCardsForMonth(supabase, { userId: user.id, month: targetDbDate }).catch(
      (err: unknown): CardMonthValues[] => {
        console.error("Karten-Monatswerte fehlgeschlagen", err);
        return [];
      },
    ),
    // Die Zahlungen, die in DIESEM Monat auf einer Karte liegen — auch solche
    // aus einem anderen Buchungsmonat (§6 Stolperfalle 6). Sie füllen den
    // aufgeklappten Bereich und die Balken.
    supabase
      .from("fragments_with_status")
      .select("id, amount, description, transaction_date, status, assigned_card_id")
      .eq("assigned_month", targetDbDate),
    supabase
      .from("fragments_with_status")
      .select("*", { count: "exact", head: true })
      .eq("status", "UNASSIGNED")
      .gte("transaction_date", targetDbDate)
      .lt("transaction_date", nextDbDate),
  ]);

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

  const istZukunft = compareMonths(targetMonth, currentMonth) > 0;
  const istVergangen = compareMonths(targetMonth, currentMonth) < 0;

  const zeilen: KartenZeile[] = monthValues
    .map((v): KartenZeile | null => {
      const card = cardById.get(v.card_id);
      if (!card) return null;

      const verknuepft = linkedByCard.get(v.card_id) ?? [];
      const wieKarte = {
        type: card.type,
        manuallyPaid: v.manually_paid,
        adjustedAmount: v.adjusted_amount,
        linkedFragments: verknuepft,
        effectivePlan: v.effective_plan,
      } as unknown as EnrichedCard;

      const verbraucht = sumLinkedFragments(wieKarte);

      // Der Zustand kommt aus `card-state.ts` — je Typ der passende Resolver,
      // mit dem Typ daneben. „Realität gewinnt" gilt nur für Fixkosten und
      // Einnahmen; „überschritten" gibt es nur bei Budget (LL-12).
      let zustand: KartenZustand;
      if (card.type === "FIXED_COST") {
        zustand = { typ: "FIXED_COST", zustand: resolveFixedCostState(wieKarte, istZukunft) };
      } else if (card.type === "INCOME") {
        zustand = { typ: "INCOME", zustand: resolveIncomeState(wieKarte, istZukunft) };
      } else {
        zustand = {
          typ: "BUDGET",
          zustand: resolveBudgetState(wieKarte, istZukunft, istVergangen, verbraucht),
        };
      }

      const anteil = balkenAnteil({ zustand, verbraucht, plan: v.effective_plan });

      return {
        cardId: card.id,
        name: card.name,
        gruppe: kartenGruppe(card.type, card.frequency),
        punkt: punktFarbe(zustand),
        balken: balkenFarbe(zustand, anteil),
        anteil,
        ausgegebenText: eur(v.amount),
        statusText: `${typWort(card.type)} · ${statusWort(zustand, verknuepft.length)}`,
        rechtsText: rechtsUnten(zustand, eur(v.effective_plan)),
        buchungen: verknuepft
          .slice()
          .sort((a, b) => a.transactionDate.localeCompare(b.transactionDate))
          .map((f) => ({
            id: f.fragmentId,
            empfaenger: splitDescription(f.description).empfaenger,
            betragText: eur(f.amount, { plus: true }),
          })),
      };
    })
    .filter((z): z is KartenZeile => z !== null)
    .sort((a, b) => a.name.localeCompare(b.name, "de-DE"));

  const daten: KartenDaten = {
    monat: targetMonth,
    // Nur der Monatsname, ohne Jahr — so zeigt es der Entwurf („Karten ·
    // September"). Das Jahr steht auf der Übersicht, und der Kopf hier teilt
    // sich die Zeile mit dem Kartenzähler.
    monatLabel: formatMonthNameOnly(targetMonth),
    zeilen,
    offen: offenRaw ?? 0,
  };

  return (
    <>
      <KartenScreen daten={daten} />
      <MobilTabBar aktiv="karten" offen={daten.offen} monat={targetMonth} />
    </>
  );
}
