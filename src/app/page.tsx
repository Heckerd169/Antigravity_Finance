import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  calculatePlannedSparrateForMonth,
  calculateSparrateForMonth,
  calculateCardAmountForMonth,
  isCardActiveInMonth,
  getCategoryAmountsForMonth,
  getEffectivePlanForMonth,
  getSplitFactor,
} from "@/lib/rpc";
import type { CategoryAmount } from "@/lib/rpc";
import { istVorschlagSichtbar } from "@/lib/suggestion";
import {
  addMonths,
  getCurrentMonthYM,
  parseMonthParam,
  ymToDbDate,
} from "@/lib/months";
import { DashboardRingStage } from "@/components/dashboard-ring-stage";
import { WelleStage } from "@/components/welle";
import { loadWelleData } from "@/components/welle/loader";
import type { WelleData } from "@/components/welle/welle.types";
import { IncomeLabel } from "@/components/income-labels/income-label";
import { HeaderTimeline } from "@/components/header-timeline";
import type {
  CardCategory,
  EnrichedCard,
  LinkedFragmentRef,
} from "@/components/cards/cards.types";
import { InteractionZone } from "@/components/interaction-zone";
import { CardActionToastProvider } from "@/components/cards/card-action-toast-provider";
import type {
  FragmentRow,
  IncomeAssignment,
} from "@/components/interaction-zone/interaction-zone.types";
import { isLinkedToCard } from "@/components/interaction-zone/interaction-zone.types";
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

  // v2-24 Phase 1: Die Middleware prüft die Anmeldung weiterhin, hat seit diesem
  // Sprint aber ein Zeitlimit und damit einen Ausweichpfad. Diese Seite darf sich
  // deshalb nicht mehr blind darauf verlassen, dass `user` existiert — vorher stand
  // hier siebenmal `user.id`, und ein durchgelassener anonymer Aufruf hätte die
  // Server-Komponente zum Absturz gebracht statt umzuleiten.
  if (!user) redirect("/login");

  // v2-24 Phase 1: Der Onboarding-Wächter ist aus der Middleware hierher gewandert.
  // Er kostete dort eine EIGENE Netzrunde auf jeder Anfrage der ganzen App — für
  // eine Information, die in genau dieser `profiles`-Zeile ohnehin schon geladen
  // wird. `onboarded_at` ist jetzt die dritte Spalte desselben Selects und damit
  // gratis. Begründung im Detail: `src/lib/supabase/middleware.ts`.
  const [{ data: profile }, { data: ichRows }, { data: partnerRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("tax_class, tax_year, onboarded_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("income_timeline")
      .select("gross_annual, net_monthly, effective_month")
      .eq("user_id", user.id)
      .eq("person", "ICH")
      .order("effective_month", { ascending: false })
      .limit(1),
    supabase
      .from("income_timeline")
      .select("gross_annual, net_monthly, effective_month")
      .eq("user_id", user.id)
      .eq("person", "PARTNER")
      .order("effective_month", { ascending: false })
      .limit(1),
  ]);

  // v2-24 Phase 1: der zweite Teil des umgezogenen Wächters. Bewusst HIER und nicht
  // weiter unten: Ein noch nicht eingerichteter Nutzer verlässt die Funktion, bevor
  // irgendeine der teuren Ladungen anläuft.
  if (!profile?.onboarded_at) redirect("/onboarding");

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
  let splitFactor = 1.0;
  try {
    [realCurrent, realPlanned, splitFactor] = await Promise.all([
      calculateSparrateForMonth(supabase, { userId: user.id, month: targetDbDate }),
      calculatePlannedSparrateForMonth(supabase, { userId: user.id, month: targetDbDate }),
      getSplitFactor(supabase, { userId: user.id, month: targetDbDate }),
    ]);
  } catch (err) {
    console.error("Sparrate-RPCs fehlgeschlagen", err);
  }

  const ichPercent = Math.round(splitFactor * 100);
  const partnerPercent = 100 - ichPercent;
  const [tmYear, tmMonth] = targetMonth.split("-").map(Number);
  const targetActiveMonth = { year: tmYear, month: tmMonth };

  // ── Jahres-Welle (§9, v2-02) — Loop über bestehende RPCs (Briefing §3).
  // Ersetzt seit v2-02 P5 das V1-Inline-Treppen-Layout: die kumulierte Sicht
  // lebt ausschließlich im Welle-Popup (§9), die Rechenlogik (Aufsummierung
  // der Monats-RPC-Werte) einmalig im Welle-Loader. Sparrate-RPCs bleiben
  // snapshot-integer (kein deleted_at-Filter, Pre-Sprint-10-C.2). ──────────
  // D1: Regime-Grenze Teal→Grau = letzter realisierter Monat („jetzt"), fix
  // pro Kalenderjahr-Fenster und unabhängig vom Header-aktiven targetMonth:
  // Vergangenheitsjahr → ganz Teal (11), Zukunftsjahr → ganz Grau (-1), im
  // laufenden Jahr → Index des aktuellen Kalendermonats (Port-Vorlage REALIZED).
  const [curYear, curMonthNum] = currentMonth.split("-").map(Number);
  const realizedMonthIndex =
    tmYear < curYear ? 11 : tmYear > curYear ? -1 : curMonthNum - 1;
  const activeMonthIndex = tmMonth - 1;

  let welleData: WelleData | null = null;
  try {
    // v2-24 P2: `currentCalendarYear` entfällt hier. Es diente allein der Frage,
    // ob die Vorjahres-Goldlinie gezeichnet wird — und die wird jetzt erst beim
    // Öffnen des Popups beantwortet, server-seitig in `welle/actions.ts`.
    welleData = await loadWelleData(supabase, {
      userId: user.id,
      activeYear: tmYear,
    });
  } catch (err) {
    console.error("Welle-Daten-Load fehlgeschlagen", err);
  }

  // ── Karten-Loading (Sprint 4, unverändert in der Struktur) ───────────────

  // v2-17 (KAT-1): `category_id` kommt dazu. Eine EINFACHE Spalte, keine
  // Zeitreihe — die Zuordnung gilt rückwirkend in allen Monaten (Record A6).
  const { data: rawCards } = await supabase
    .from("cards")
    .select(
      "id, name, type, attribution, frequency, first_active_month, last_active_month, due_day, category_id",
    )
    .is("deleted_at", null)
    .order("type", { ascending: true })
    .order("name", { ascending: true });

  // v2-17 (KAT-1): Die Ordner selbst. EINE Abfrage für alle Karten, nicht eine
  // je Karte — der Loader feuert ohnehin schon drei Aufrufe pro Karte
  // (Befund D14), und die Auswahlliste ist für alle Karten dieselbe.
  //
  // Sortiert nach `sort_order`, dann Name: Die Reihenfolge steht in der
  // Datenbank und nicht im Code, damit `M5` später einen Ort hat, ohne dass
  // eine Migration nötig wird (Record C2). Der Name ist der Tiebreaker, damit
  // gleiche Sortiernummern nicht zufällig ausgehen.
  //
  // Kein Limit nötig und trotzdem unbedenklich (§7 Regel 18): Die Tabelle
  // wächst mit der Zahl der Lebensbereiche, nicht mit der Zahl der Buchungen —
  // sie kann die 1000-Zeilen-Grenze strukturell nicht erreichen.
  const { data: rawCategories } = await supabase
    .from("card_categories")
    .select("id, name, sort_order")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  const categories: CardCategory[] = (rawCategories ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    sortOrder: c.sort_order,
  }));

  // v2-17 (KAT-3): Die Beträge der Ordner. EIN Aufruf für alle — die Zahl darf
  // nach Arbeitsregel 1 nicht im Browser entstehen, und ein Aufruf je Ordner
  // wüchse multiplikativ auf den ohnehin schon drei Aufrufen pro Karte
  // (Befund D14).
  //
  // Die Summe dieser Beträge ergibt exakt die Sparrate — dafür sorgt die
  // Restverteilung in der Funktion (Record C1). Fällt der Aufruf aus, bleiben
  // die Ordner ohne Betrag; das Karussell rendert dann weiter, nur ohne Zahl
  // auf der Kachel. Ein Fehler hier darf nicht das ganze Dashboard mitreißen —
  // dieselbe Haltung wie beim Welle-Loader oben.
  let categoryAmounts: CategoryAmount[] = [];
  try {
    categoryAmounts = await getCategoryAmountsForMonth(supabase, {
      userId: user.id,
      month: targetDbDate,
    });
  } catch (err) {
    console.error("Kategorie-Beträge fehlgeschlagen", err);
  }

  // v2-19 (GE-1): die diesem Monat zugeordnete Gehaltszahlung — für den
  // Lösen-Block im Einkommens-Fenster (Record, Entscheidung E).
  //
  // Monats-eng abgefragt, nicht als Voll-Scan: PostgREST liefert höchstens 1000
  // Zeilen, ohne Fehler und ohne Warnung (§7 Regel 18 / LL-21). Hier wären es
  // zwar auf Jahre hinaus zwölf pro Jahr — aber die Gewohnheit ist der
  // eigentliche Schutz, nicht die Schätzung.
  //
  // Der ANGEZEIGTE Wert der Kachel kommt NICHT von hier, sondern aus
  // `categoryAmounts`. Zwei Quellen für dieselbe Zahl könnten auseinanderlaufen;
  // diese Abfrage liefert nur Datum und Beschreibung, die es dort nicht gibt.
  const { data: incomeLinkRows } = await supabase
    .from("income_fragment_links")
    .select("fragment_id, fragments(transaction_date, description, amount)")
    .eq("month", targetDbDate)
    .eq("person", "ICH");

  const incomeAssignment: IncomeAssignment | null = (() => {
    const row = (incomeLinkRows ?? [])[0];
    const f = row?.fragments;
    if (!row || !f || f.transaction_date === null || f.amount === null) return null;
    return {
      fragmentId: row.fragment_id,
      transactionDate: f.transaction_date,
      description: f.description ?? "",
      amount: Number(f.amount),
    };
  })();

  const nowMonthDb = ymToDbDate(currentMonth);

  // v2-05 Lösch-Tor-Vorberechnung: zwei kleine Selects statt 31 RPC-Calls.
  // Autoritativ prüft `delete_card` server-seitig erneut.
  //
  // ⚠️ Diese Vorberechnung BILDET `card_delete_gate` NACH. Ändert sich die
  // Regel dort, muss sie hier mit — sonst zeigt das Menü einen ausgegrauten
  // Punkt, den die Datenbank längst durchließe (LL-26: ein Frontend-Nachbau
  // hebt eine Datenbank-Entscheidung stillschweigend auf).
  //
  // v2-20 (KU-2): Zustände zählen nur noch, wenn sie in einem VERGANGENEN
  // Monat liegen — server-seitig gefiltert, nicht nachgelagert in JS
  // (§7 Regel 18). Vorher lud die Abfrage alle Zustände über alle Monate und
  // machte damit jede frisch angepasste Karte unlöschbar.
  const [{ data: linkCardRows }, { data: stateCardRows }] = await Promise.all([
    supabase.from("card_fragment_links").select("card_id"),
    supabase.from("card_monthly_states").select("card_id").lt("month", nowMonthDb),
  ]);
  const cardsWithLinks = new Set((linkCardRows ?? []).map((r) => r.card_id));
  const cardsWithStates = new Set((stateCardRows ?? []).map((r) => r.card_id));

  // Name-Lookup über ALLE nicht-gelöschten Karten (auch monats-inaktive) —
  // ein suggested_card_id kann auf eine Karte zeigen, die im targetMonth nicht
  // aktiv ist. Für die Badge-Auflösung (§6) brauchen wir den Namen trotzdem.
  const cardNameById = new Map<string, string>(
    (rawCards ?? []).map((c) => [c.id, c.name]),
  );

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
          // v2-13 (BF-4/E1): Seit der Migration liefert `amount` bei GEMEINSAM
          // den EIGENEN ANTEIL. Der Haushaltsbetrag daneben ist `effectivePlan`
          // — er bleibt bewusst die volle Haushaltsrechnung und wird hier NICHT
          // umgerechnet (die Karte rechnet §4.3 nicht nach, §7 Regel 1).
          //
          // Die Entscheidung, OB die Zeile Inhalt bekommt, fällt server-seitig
          // (§7 Regel 15 / LL-17) — die Karte erhält das Ergebnis, nicht den
          // Split-Faktor plus Schwelle. Drei Fälle bleiben leer:
          //   · ICH-Karte             → es gibt keinen Haushaltsanteil
          //   · Split-Faktor 1,0      → Anteil und Haushalt wären identisch,
          //     die Zeile erklärte nichts (User-Entscheid 05.08.2026; in der
          //     Gestaltungsrunde ausdrücklich offen gelassen)
          //   · Plan 0                → „von 0,00 €" wäre eine Falschaussage
          householdAmount:
            c.attribution === "GEMEINSAM" && splitFactor < 1 && effectivePlan > 0
              ? effectivePlan
              : null,
          // v2-15 (LQ-1): Der Fälligkeitstag wandert unverändert durch — er ist
          // eine Eigenschaft der Karte, kein Monats-Zustand, und wird deshalb
          // weder pro Monat aufgelöst noch geklammert (das tut erst LQ-2).
          dueDay: c.due_day,
          // v2-17 (KAT-1): wandert unverändert durch — eine Eigenschaft der
          // Karte, kein Monats-Zustand. `null` ist ein regulärer Wert
          // („Ohne Kategorie"), keine Lücke (Befund D12).
          categoryId: c.category_id,
          manuallyPaid: stateRow?.manually_paid ?? false,
          adjustedAmount: stateRow?.adjusted_amount ?? null,
          deleteGate: {
            deletable:
              !cardsWithLinks.has(c.id) &&
              !cardsWithStates.has(c.id) &&
              c.first_active_month >= nowMonthDb,
            reasons: [
              ...(cardsWithLinks.has(c.id) ? (["HAS_LINKS"] as const) : []),
              ...(cardsWithStates.has(c.id) ? (["HAS_STATES"] as const) : []),
              ...(c.first_active_month < nowMonthDb
                ? (["HAS_PAST_PLAN"] as const)
                : []),
            ],
          },
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

  // ── Vorschlags-Schwelle aus app_config (§11, CLAUDE.md Regel 5: nicht
  // hardcoden). Fallback auf den Spec-Default nur als Defense-in-Depth,
  // falls die Zeile fehlt.
  //
  // v2-21 P4: `confidence.auto_absorption_threshold` wird hier NICHT mehr
  // gelesen. Sie diente allein der Obergrenze weiter unten, und die ist
  // entfallen — ob eine Zahlung bereits verlinkt ist, sagt jetzt der Status,
  // nicht die Konfidenz (ausführliche Begründung an der Fundstelle).
  // Die Schwelle selbst bleibt in `app_config` und in Gebrauch: die
  // Auto-Absorption in `process_csv_import` liest sie weiterhin. ────────────

  const { data: thresholdRows } = await supabase
    .from("app_config")
    .select("key, value")
    .in("key", ["confidence.badge_threshold"]);

  const thresholdByKey = new Map(
    (thresholdRows ?? []).map((r) => [r.key, Number(r.value)]),
  );
  const badgeThreshold = thresholdByKey.get("confidence.badge_threshold") ?? 0.6;

  // ── Fragmente ────────────────────────────────────────────────────────────
  // v2-07 P0 (Bugfix): zwei monats-enge Abfragen statt eines Voll-Scans.
  //
  // Der frühere Voll-Scan über `fragments_with_status` lief seit dem
  // 2025er-Import vom 25.07.2026 (Bestand 544 → 1508 Fragmente) in die
  // PostgREST-Zeilenobergrenze von 1000: sortiert nach transaction_date ASC
  // füllten das Jahr 2025 plus die erste Januarwoche 2026 das Kontingent,
  // alles ab dem 12.01.2026 fiel stillschweigend heraus (kein Fehler, nur
  // eine kürzere Antwort). Sichtbare Folge: Rohmasse ab Februar 2026 leer,
  // und alle vier bestehenden card_fragment_links im Overlay „Verknüpfte
  // Fragmente" unsichtbar.
  // Die Sparrate war nie betroffen — sie wird RPC-seitig aus
  // card_fragment_links berechnet und liest diese Liste nicht (§2.1).
  //
  //   (a) stackRows  — Fragmente mit transaction_date im angezeigten Monat.
  //                    Exakt der §8-Monats-Scope (N1, v2-01), jetzt server-
  //                    seitig statt nachgelagert in JS.
  //   (b) linkedRows — Fragmente, die auf eine Karte DIESES Monats zeigen
  //                    (assigned_month = targetMonth), auch wenn ihr
  //                    transaction_date in einem anderen Monat liegt. Ohne
  //                    diese zweite Abfrage verschwänden Cross-Monat-Links
  //                    aus dem Karten-Overlay.
  //
  // Beide Mengen sind pro Monat zweistellig — die Zeilenobergrenze ist damit
  // strukturell unerreichbar, unabhängig vom Gesamtbestand.

  const nextMonthDbDate = ymToDbDate(addMonths(targetMonth, 1));
  // v2-16 (RM-2): `counterparty_iban` kommt für das Schaufenster-Popup dazu —
  // es ist die einzige Stelle der App, an der das Gegenkonto eines Übertrags
  // sichtbar wird (§11). Die Spalte liegt seit Sprint 9 in der View.
  const FRAGMENT_COLS =
    "id, amount, description, transaction_date, status, assigned_card_id, assigned_month, confidence, suggested_card_id, imported_at, counterparty_iban";

  const [{ data: stackRows }, { data: linkedRows }] = await Promise.all([
    supabase
      .from("fragments_with_status")
      .select(FRAGMENT_COLS)
      .gte("transaction_date", targetDbDate)
      .lt("transaction_date", nextMonthDbDate)
      .order("transaction_date", { ascending: true })
      .order("imported_at", { ascending: true })
      .order("description", { ascending: true }),
    supabase
      .from("fragments_with_status")
      .select(FRAGMENT_COLS)
      .eq("assigned_month", targetDbDate)
      .order("transaction_date", { ascending: true }),
  ]);

  type RawFragment = NonNullable<typeof stackRows>[number];

  /** View-Spalten sind nullable (LEFT JOIN) — Kern-Felder defensiv prüfen,
   *  dann auf den UI-Typ mappen. Identisch für beide Abfragen. */
  const toFragmentRows = (rows: RawFragment[] | null): FragmentRow[] =>
    (rows ?? [])
      .filter(
        (f): f is RawFragment & {
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
      .map((f) => {
        /* Vorschlag: Die Regel selbst steht in `@/lib/suggestion` und ist dort
           mit einer eigenen Spec abgedeckt (v2-22, `ZO-2`) — sie war bis dahin
           hier inline eingebettet und damit nicht einzeln prüfbar, und genau an
           dieser Stelle saß in v2-21 ein Fehler, der den ganzen Sprint entwertet
           hätte. Die Begründung im Detail steht in der Lib-Datei.

           Hier bleibt nur, was von der Datenlage abhängt: der Karten-Lookup.
           Zeigt `suggested_card_id` ins Leere (Karte gelöscht), bleibt der Name
           null und das Popup lässt die Zeile weg. Die Schwellen-Auswertung
           bleibt server-seitig (LL-17). */
        const conf = f.confidence != null ? Number(f.confidence) : null;
        const suggestedCardName =
          f.suggested_card_id != null &&
          istVorschlagSichtbar({
            suggestedCardId: f.suggested_card_id,
            confidence: conf,
            status: f.status,
            badgeThreshold,
          })
            ? cardNameById.get(f.suggested_card_id) ?? null
            : null;

        return {
          id: f.id,
          amount: Number(f.amount),
          description: f.description,
          transaction_date: f.transaction_date,
          status: f.status as FragmentRow["status"],
          assigned_card_id: f.assigned_card_id,
          assigned_month: f.assigned_month,
          suggestedCardName,
          /* v2-16 (RM-2): der Prozentwert hängt an DERSELBEN Schwellen-Prüfung
             wie der Name — nie ein Wert ohne Karte, nie eine Karte ohne Wert.
             Die Auswertung der Schwelle bleibt hier server-seitig (LL-17); das
             Popup bekommt das Ergebnis, nicht die Rohwerte plus Schwelle. */
          suggestionConfidence: suggestedCardName !== null ? conf : null,
          /* v2-16 (RM-2): zeigt die Zuordnung ins Leere (Karte gelöscht),
             bleibt der Name null und das Popup lässt die Zeile weg. */
          assignedCardName:
            f.assigned_card_id != null
              ? cardNameById.get(f.assigned_card_id) ?? null
              : null,
          counterpartyIban: f.counterparty_iban,
          importedAt: f.imported_at,
        };
      });

  const monthFragments = toFragmentRows(stackRows);

  // P5: Stack-Sortierung (§10/§11) — unzugeordnete Fragmente zuerst (Arbeits-
  // fläche oben), zugeordnete/gedimmte unten. Innerhalb beider Gruppen:
  // transaction_date ASC, dann imported_at ASC. Finaler Tiebreaker: Beschreibung
  // alphabetisch aufsteigend (de-DE) — nötig, weil Same-Day-Buchungen aus
  // derselben Import-Charge identisches imported_at haben (PM-Entscheidung
  // 22.05.2026; sichert AC-Sort-3 Reproduzierbarkeit). ISO-Strings → lexikografisch.
  const cmpStr = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);
  monthFragments.sort((a, b) => {
    const ga = a.status === "UNASSIGNED" ? 0 : 1;
    const gb = b.status === "UNASSIGNED" ? 0 : 1;
    if (ga !== gb) return ga - gb;
    const dateCmp = cmpStr(a.transaction_date, b.transaction_date);
    if (dateCmp !== 0) return dateCmp;
    const impCmp = cmpStr(a.importedAt ?? "", b.importedAt ?? "");
    if (impCmp !== 0) return impCmp;
    return a.description.localeCompare(b.description, "de-DE");
  });

  // ── Linked-Fragments pro Karte für den targetMonth berechnen ─────────────

  // v2-07 P0: speist sich aus der zweiten, link-orientierten Abfrage — sie
  // umfasst auch Fragmente, deren transaction_date außerhalb des angezeigten
  // Monats liegt. Die assigned_month-Bedingung ist bereits server-seitig
  // gesetzt; der Check bleibt als Defense-in-Depth stehen.
  // v2-23 (`ZU-1`): `isLinkedToCard` statt `f.status === "ASSIGNED"`. Es gibt
  // ZWEI zugeordnete Zustände — automatisch absorbierte Zahlungen fielen hier
  // durch, die Karte blieb dadurch „Offen" und zeigte keine Zahlung, obwohl
  // beides in der Datenbank stand. Begründung an der Funktion.
  const linkedByCardId = new Map<string, LinkedFragmentRef[]>();
  for (const f of toFragmentRows(linkedRows)) {
    if (
      isLinkedToCard(f) &&
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

  // N1 (v2-01) — Rohmasse zeigt nur den angezeigten Monat: seit v2-07 P0 durch
  // die Monatsgrenzen der Abfrage (a) erledigt, nicht mehr durch einen
  // JS-Nachfilter. Der Cross-Monat-Link erscheint weiterhin ausschließlich als
  // verknüpftes Fragment auf der Karte (Abfrage b), nicht im Stack.

  // ── Linke-Flanke-Count: UNASSIGNED-Fragmente im Vormonat ─────────────────
  // v2-07: unverändert. Zählt server-seitig per count-Abfrage und ist von der
  // Zeilenobergrenze nie betroffen gewesen (head:true liefert nur die Zahl).

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

      <div className={styles.stage}>
        <WelleStage
          data={welleData}
          activeMonthIndex={activeMonthIndex}
          realizedMonthIndex={realizedMonthIndex}
          leftSlot={
            <IncomeLabel
              person="ICH"
              splitPercent={ichPercent}
              initialGrossAnnual={ichLatest?.grossAnnual}
              initialNetMonthly={ichLatest?.netMonthly}
              counterpartGrossAnnual={partnerLatest?.grossAnnual}
              activeMonth={targetActiveMonth}
              taxClass={taxClass}
              taxYear={taxYear}
            />
          }
          ringSlot={
            <DashboardRingStage realCurrent={realCurrent} realPlanned={realPlanned} />
          }
          rightSlot={
            <IncomeLabel
              person="PARTNER"
              splitPercent={partnerPercent}
              initialGrossAnnual={partnerLatest?.grossAnnual}
              initialNetMonthly={partnerLatest?.netMonthly}
              counterpartGrossAnnual={ichLatest?.grossAnnual}
              activeMonth={targetActiveMonth}
              taxClass={taxClass}
              taxYear={taxYear}
            />
          }
        />
      </div>

      <CardActionToastProvider>
        <InteractionZone
          fragments={monthFragments}
          cards={enrichedCards}
          categories={categories}
          categoryAmounts={categoryAmounts}
          targetMonth={targetMonth}
          targetDbMonth={targetDbDate}
          currentMonth={currentMonth}
          /* v2-17 (KAT-2): Dieselben Angaben, die auch `IncomeLabel` an den
             Flanken der Welle bekommt — es ist dasselbe Fenster, nur ein
             zweiter Auslöser (Record A4). Kein zweites Formular. */
          incomeSlot={{
            initialGrossAnnual: ichLatest?.grossAnnual,
            initialNetMonthly: ichLatest?.netMonthly,
            counterpartGrossAnnual: partnerLatest?.grossAnnual,
            activeMonth: targetActiveMonth,
            taxClass,
            taxYear,
          }}
          incomeAssignment={incomeAssignment}
        />
      </CardActionToastProvider>

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
