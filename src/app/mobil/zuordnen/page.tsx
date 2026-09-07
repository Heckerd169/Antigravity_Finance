import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  calculateSparrateForMonth,
  getCardsForMonth,
  getOpenFragmentCandidates,
} from "@/lib/rpc";
import type { CardMonthValues, FragmentCandidate } from "@/lib/rpc";
import { istVorschlagSichtbar } from "@/lib/suggestion";
import { splitDescription } from "@/lib/description";
import {
  MAX_NAVIGABLE_YM,
  addMonths,
  compareMonths,
  deriveMinNavigableYm,
  formatMonthLabel,
  formatMonthNameOnly,
  getCurrentMonthYM,
  parseMonthParam,
  ymToDbDate,
} from "@/lib/months";
import {
  isLinkedToCard,
  isTransferFragment,
} from "@/components/interaction-zone/interaction-zone.types";
import type { FragmentRow } from "@/components/interaction-zone/interaction-zone.types";
import { ZuordnenScreen } from "@/components/mobil/zuordnen";
import { monatsStatus } from "@/components/mobil/zuordnen/zustand";
import type {
  KandidatenKarte,
  NachbarMonat,
  OffeneZahlung,
  ZuordnenDaten,
} from "@/components/mobil/zuordnen/zuordnen.types";
import { MobilTabBar } from "@/components/mobil/tab-bar";

type Props = {
  searchParams: { month?: string | string[] };
};

/* Tab „Zuordnen" auf /mobil — der Server-Lader.
 *
 * ZEHN Netzrunden je Aufbau, gezählt (§9 Anker 3; Schreibtisch: ~18):
 * Anmeldung 1 · profiles + cards 2 · Sparrate 1 · Stapel 1 · Kandidaten 1 ·
 * get_cards_for_month 1 · app_config 1 · Nachbar-Zähler 2.
 *
 * Alles, was der Bildschirm entscheidet, wird HIER entschieden (§7 Regel 15 /
 * LL-17): Welche Karte der Vorschlag ist, wie oft der Händler so lag, wer die
 * Kandidaten sind. Der Client bekommt Ergebnisse, keine Rohwerte plus Schwelle. */
export default async function ZuordnenPage({ searchParams }: Props) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Die Middleware prüft die Anmeldung mit Zeitlimit und Ausweichpfad — diese
  // Seite verlässt sich nicht blind darauf (v2-24, wie `app/page.tsx`).
  if (!user) redirect("/login");

  const currentMonth = getCurrentMonthYM();
  const targetMonth = parseMonthParam(searchParams?.month);
  const targetDbDate = ymToDbDate(targetMonth);
  const prevMonth = addMonths(targetMonth, -1);
  const nextMonth = addMonths(targetMonth, 1);
  const prevDbDate = ymToDbDate(prevMonth);
  const nextDbDate = ymToDbDate(nextMonth);
  const nextNextDbDate = ymToDbDate(addMonths(targetMonth, 2));

  const [{ data: profile }, { data: rawCards }] = await Promise.all([
    supabase
      .from("profiles")
      .select("onboarded_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    // Alle nicht gelöschten Karten — für Namen (auch monats-inaktiver, ein
    // Vorschlag kann dorthin zeigen), Typ und die untere Navigationsgrenze.
    supabase
      .from("cards")
      .select("id, name, type, first_active_month")
      .is("deleted_at", null),
  ]);

  // Der Onboarding-Wächter sitzt seit v2-24 in der Seite, nicht in der
  // Middleware — hier, bevor irgendeine teure Ladung anläuft.
  if (!profile?.onboarded_at) redirect("/onboarding");

  const cards = rawCards ?? [];
  const cardById = new Map(cards.map((c) => [c.id, c]));
  // Untere Grenze aus den Karten, wie am Schreibtisch (v2-28) — die 476 offenen
  // Zahlungen aus 2023–2024 liegen davor und sind hier ebenso unerreichbar.
  const minNavigableYm = deriveMinNavigableYm(
    cards.map((c) => c.first_active_month),
    currentMonth,
  );

  // Monats-eng (§7 Regel 18 / LL-21): der Stapel ist je Monat zweistellig.
  const FRAGMENT_COLS =
    "id, amount, description, transaction_date, status, confidence, suggested_card_id, imported_at";

  const countOpen = (from: string, to: string) =>
    supabase
      .from("fragments_with_status")
      .select("*", { count: "exact", head: true })
      .eq("status", "UNASSIGNED")
      .gte("transaction_date", from)
      .lt("transaction_date", to);

  const [
    sparrate,
    { data: stackRows },
    kandidatenRows,
    monthValues,
    { data: thresholdRow },
    { count: prevOpenRaw },
    { count: nextOpenRaw },
  ] = await Promise.all([
    calculateSparrateForMonth(supabase, { userId: user.id, month: targetDbDate }).catch(
      (err: unknown) => {
        console.error("Sparrate fehlgeschlagen", err);
        return null;
      },
    ),
    supabase
      .from("fragments_with_status")
      .select(FRAGMENT_COLS)
      .gte("transaction_date", targetDbDate)
      .lt("transaction_date", nextDbDate)
      .order("transaction_date", { ascending: true })
      .order("imported_at", { ascending: true })
      .order("description", { ascending: true }),
    // Fällt der Aufruf aus, bleibt der Zähler leer und die Seite steht —
    // dieselbe Haltung wie bei `categoryAmounts` in `app/page.tsx`.
    getOpenFragmentCandidates(supabase, { userId: user.id, month: targetDbDate }).catch(
      (err: unknown): FragmentCandidate[] => {
        console.error("Kandidaten fehlgeschlagen", err);
        return [];
      },
    ),
    getCardsForMonth(supabase, { userId: user.id, month: targetDbDate }).catch(
      (err: unknown): CardMonthValues[] => {
        console.error("Karten-Monatswerte fehlgeschlagen", err);
        return [];
      },
    ),
    // Vorschlags-Schwelle aus app_config (§7 Regel 5) — Spec-Default nur als
    // Notnagel, falls die Zeile fehlt.
    supabase
      .from("app_config")
      .select("value")
      .eq("key", "confidence.badge_threshold")
      .maybeSingle(),
    countOpen(prevDbDate, targetDbDate),
    countOpen(nextDbDate, nextNextDbDate),
  ]);

  const badgeThreshold =
    thresholdRow?.value != null ? Number(thresholdRow.value) : 0.6;

  // Aktiv ist genau, was die RPC zurückgibt — kein Nachbau (LL-26).
  const activeCardIds = new Set(monthValues.map((v) => v.card_id));

  const kandidatenByFragment = new Map<string, KandidatenKarte[]>();
  for (const k of kandidatenRows) {
    const card = cardById.get(k.card_id);
    if (!card) continue;
    const arr = kandidatenByFragment.get(k.fragment_id) ?? [];
    arr.push({ cardId: k.card_id, name: card.name, treffer: k.treffer });
    kandidatenByFragment.set(k.fragment_id, arr);
  }

  type RawFragment = NonNullable<typeof stackRows>[number];
  const rows = (stackRows ?? []).filter(
    (
      f,
    ): f is RawFragment & {
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
  );

  const asStatus = (s: string) => ({ status: s as FragmentRow["status"] });
  // Überträge zählen nirgends mit — weder im Nenner noch im Stapel (§6
  // Stolperfalle 7, Prädikat aus `interaction-zone.types.ts`).
  const buchungen = rows.filter((f) => !isTransferFragment(asStatus(f.status)));
  const zugeordnet = buchungen.filter((f) => isLinkedToCard(asStatus(f.status))).length;

  const offene: OffeneZahlung[] = buchungen
    .filter((f) => f.status === "UNASSIGNED")
    .map((f) => {
      const { empfaenger, zweck } = splitDescription(f.description);
      const kandidaten = (kandidatenByFragment.get(f.id) ?? [])
        .slice()
        .sort(
          (a, b) => b.treffer - a.treffer || a.name.localeCompare(b.name, "de-DE"),
        );
      const konfidenz = f.confidence != null ? Number(f.confidence) : null;
      const suggestedId = f.suggested_card_id;
      // Sichtbar nach der einen Regel in `lib/suggestion.ts` — und nur, wenn
      // die Karte im angezeigten Monat aktiv ist: Eine Zuordnung an eine
      // inaktive Karte zählte in keiner Sparrate, und das Sheet bietet sie
      // ebenfalls nicht an.
      const sichtbar =
        suggestedId != null &&
        activeCardIds.has(suggestedId) &&
        istVorschlagSichtbar({
          suggestedCardId: suggestedId,
          confidence: konfidenz,
          status: f.status,
          badgeThreshold,
        });
      const suggestedCard = sichtbar && suggestedId != null ? cardById.get(suggestedId) : undefined;
      const vorschlag =
        suggestedCard !== undefined && suggestedId != null
          ? {
              cardId: suggestedId,
              name: suggestedCard.name,
              treffer: kandidaten.find((k) => k.cardId === suggestedId)?.treffer ?? 0,
              konfidenz: konfidenz ?? 0,
            }
          : null;

      return {
        id: f.id,
        datum: f.transaction_date,
        betrag: Number(f.amount),
        empfaenger,
        zweck,
        vorschlag,
        kandidaten,
      };
    });

  const nachbar = (ym: string, offen: number | null): NachbarMonat => ({
    ym,
    name: formatMonthNameOnly(ym),
    offen: offen ?? 0,
    status: monatsStatus(ym, currentMonth),
  });

  const daten: ZuordnenDaten = {
    monat: targetMonth,
    monatLabel: formatMonthLabel(targetMonth),
    monatName: formatMonthNameOnly(targetMonth),
    status: monatsStatus(targetMonth, currentMonth),
    sparrate,
    buchungenGesamt: buchungen.length,
    zugeordnet,
    offene,
    zurueck:
      compareMonths(targetMonth, minNavigableYm) > 0 ? nachbar(prevMonth, prevOpenRaw) : null,
    vor:
      compareMonths(targetMonth, MAX_NAVIGABLE_YM) < 0 ? nachbar(nextMonth, nextOpenRaw) : null,
    geladenUm: new Date().toISOString(),
  };

  return (
    <>
      <ZuordnenScreen daten={daten} />
      <MobilTabBar aktiv="zuordnen" offen={offene.length} monat={targetMonth} />
    </>
  );
}
