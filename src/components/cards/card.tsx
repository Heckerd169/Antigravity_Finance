import type {
  CardCategory,
  EnrichedCard,
  FixedCostState,
  IncomeState,
  BudgetState,
} from "./cards.types";
import { CardInteractive } from "./card-interactive";
import { formatEuro } from "@/lib/format";
import styles from "./cards.module.css";

/* K1.6: 2-Dezimalen-Formatter zentral in `lib/format.ts`. Ring (Sprint 2)
 * nutzt sein eigenes Format (0 Dezimalen + NBSP), bleibt unverändert. */

// ── Icon-SVGs ────────────────────────────────────────────────────────────────

function IconOpenCircle() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
      <circle cx="4" cy="4" r="2.5" fill="rgba(255,69,58,.55)" />
    </svg>
  );
}

function IconCheckmark() {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
      <path
        d="M2 4.5L3.8 6.5L7 3"
        stroke="rgba(62,207,175,.85)"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconGhostCircle() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
      <circle cx="4" cy="4" r="2.5" fill="rgba(255,255,255,.25)" />
    </svg>
  );
}

function IconOpenCircleTeal() {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden="true">
      <circle
        cx="4.5"
        cy="4.5"
        r="2.8"
        fill="none"
        stroke="rgba(62,207,175,.7)"
        strokeWidth="1.1"
      />
    </svg>
  );
}

function IconGhostCircleTeal() {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden="true">
      <circle
        cx="4.5"
        cy="4.5"
        r="2.8"
        fill="none"
        stroke="rgba(255,255,255,.2)"
        strokeWidth="1.1"
      />
    </svg>
  );
}

function IconOverExclamation() {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
      <path
        d="M4.5 2v3M4.5 6.5v.5"
        stroke="#FF453A"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── State-Resolution ─────────────────────────────────────────────────────────

function resolveFixedCostState(card: EnrichedCard, isFuture: boolean): FixedCostState {
  if (isFuture) return "ghost";
  // §7 Konflikt 6: Fragment-Link und manually_paid sind unabhängige Indikatoren —
  // entweder reicht für Bezahlt-Status (Sprint 6 K1).
  const hasFragment = (card.linkedFragments?.length ?? 0) > 0;
  return card.manuallyPaid || hasFragment ? "paid" : "open";
}

function resolveIncomeState(card: EnrichedCard, isFuture: boolean): IncomeState {
  if (isFuture) return "ghost";
  // §7 Konflikt 6: Fragment-Link und manually_paid sind unabhängige Indikatoren —
  // entweder reicht für Erhalten-Status (Sprint 6 K1).
  const hasFragment = (card.linkedFragments?.length ?? 0) > 0;
  return card.manuallyPaid || hasFragment ? "received" : "expected";
}

function resolveBudgetState(
  card: EnrichedCard,
  isFuture: boolean,
  isPast: boolean,
  fragmentSum: number,
): BudgetState {
  if (isFuture) return "ghost";
  // §3.4.4 Sprint-7-Spec (Briefing): vollständige State-Maschine
  if (isPast && !card.manuallyPaid && fragmentSum === 0) return "ghost";
  if (card.manuallyPaid) return "done";
  if (fragmentSum > card.effectivePlan) return "over";
  return "running";
}

/** K1.2/K1.4: „Spent" = Summe der Fragmentwerte (Realität). Getrennt von
 *  `card.amount`, das per §4.3.3 Priorisierung (Realität → Anpassung → Plan)
 *  auch Adjustment oder Plan zurückgeben kann.
 *
 *  v2-11 (BF-5): Netto-ABFLUSS statt Summe der Betragshöhen. Vorher stand hier
 *  `Math.abs(f.amount)` — dieselbe Fehlerklasse wie in der Rechenfunktion, nur
 *  im Frontend. Solange die Datenbank ebenfalls mit ABS summierte, waren beide
 *  gleich falsch und damit wenigstens konsistent. Nach der Migration liefert die
 *  Datenbank den verrechneten Wert; bliebe es hier bei ABS, zeigte die Karte für
 *  „Aline Geburtstag" oben 168,11 € und darunter „918,11 € über Plan".
 *
 *  Wird ausschliesslich fuer BUDGET-Karten aufgerufen, deshalb genügt die eine
 *  Richtung (Ausgaben sind negative Fragmente → Verbrauch positiv). Das Ergebnis
 *  entspricht damit exakt dem, was `calculate_card_amount_for_month` intern
 *  bildet — die Karte rechnet §4.3 weiterhin NICHT nach (§7 Regel 1), sie
 *  braucht den Wert nur fuer Balken und Restbudget-Text. */
function sumLinkedFragments(card: EnrichedCard): number {
  return -(card.linkedFragments ?? []).reduce((acc, f) => acc + f.amount, 0);
}

// ── Sub-Components ───────────────────────────────────────────────────────────

/** v2-13 (BF-4/E1): Der Haushaltsbetrag unter dem eigenen Anteil — `von 1.904,00 €`.
 *
 *  Wortlaut ohne neues Substantiv: laut vorgelesen ergibt sich der richtige Satz
 *  („1.089,26 € VON 1.904,00 €"). „Haushalt" ist bewusst verworfen — das Wort
 *  kommt in der Design-Doku genau einmal vor, als Verneinung in §10.
 *
 *  Die Zeilenhöhe ist auf JEDER Karte permanent reserviert (`min-height`), auf
 *  ICH-Karten bleibt sie leer. Es schaltet ausschließlich der Inhalt, nie die
 *  Höhe — alle Karten behalten dieselben Maße. Kein neues Muster: §6 (M3)
 *  schreibt das für die Ausreißer-Subzeile im Header bereits so fest.
 *
 *  Ob die Zeile Inhalt bekommt, entscheidet der Loader (§7 Regel 15 / LL-17);
 *  hier wird nur noch gerendert. Gestaltungsrunde: V2/design_direktor_gemeinsame_karte.md */
function HouseholdRow({ householdAmount }: { householdAmount: number | null }) {
  return (
    <div className={styles.householdAmount}>
      {householdAmount !== null ? `von ${formatEuro(householdAmount)}` : null}
    </div>
  );
}

/** v2-15 (LQ-1): Die Statuszeile mit zwei Enden — links der Zustand, rechts der
 *  Termin. `Offen ····· am 1.`
 *
 *  Getrennt wird durch die POSITION, nicht durch ein Trennzeichen: Zustand und
 *  Termin sind zwei Aussagen über dieselbe Karte, und der Weißraum dazwischen
 *  sagt das deutlicher als ein „·".
 *
 *  KEINE neue Zeile, KEINE zusätzliche Kartenhöhe (§7 „Fälligkeitstag-Anzeige").
 *  Anders als bei der Haushaltsbetrag-Zeile ist hier deshalb auch nichts zu
 *  reservieren — fehlt der Tag, bleibt rechts schlicht nichts stehen.
 *
 *  Der Tag bleibt in JEDEM Zustand stehen, auch bei „Bezahlt"/„Erhalten": er ist
 *  eine Eigenschaft der Karte, kein Zustand. Verschwände er beim Bezahlen,
 *  spränge die Zeile — und der Wert wäre genau dann nicht mehr prüfbar, wenn man
 *  ihn gegen den echten Umsatz hält.
 *
 *  Nur FIXED_COST und INCOME rufen das auf. BUDGET hat per Migration kein
 *  `due_day` (ein Budget ist eine Erlaubnis ohne Termin, Befund L7) und behält
 *  seine bisherige einzeilige Darstellung samt Teal-/Rot-Varianten.
 *
 *  Gestaltungsrunde: V2/design_direktor_2026-08-06_liquiditaet_fragment_split.md §2 */
function StateRow({
  stateLabel,
  dueDay,
}: {
  stateLabel: string;
  dueDay: number | null;
}) {
  return (
    <div className={styles.stateRow}>
      <span className={styles.stateLabel}>{stateLabel}</span>
      {dueDay !== null && <span className={styles.dueDay}>am {dueDay}.</span>}
    </div>
  );
}

function MetaRow({ attribution }: { attribution: "ICH" | "GEMEINSAM" }) {
  const isGem = attribution === "GEMEINSAM";
  return (
    <div className={styles.cardMeta}>
      <div
        className={`${styles.metaDot} ${isGem ? styles.metaDotGem : styles.metaDotIch}`}
      />
      <div className={styles.metaText}>{isGem ? "Gemeinsam" : "Ich"}</div>
    </div>
  );
}

// ── Fixkosten-Karte ──────────────────────────────────────────────────────────

function FixedCostCard({
  card,
  state,
  month,
  categories,
}: {
  card: EnrichedCard;
  state: FixedCostState;
  month: string;
  categories: CardCategory[];
}) {
  const stateClass = styles[state];
  const isGhost = state === "ghost";

  const iconEl =
    state === "paid" ? (
      <div className={`${styles.icon} ${styles.iconPaid}`}>
        <IconCheckmark />
      </div>
    ) : isGhost ? (
      <div className={`${styles.icon} ${styles.iconGhost}`}>
        <IconGhostCircle />
      </div>
    ) : (
      <div className={`${styles.icon} ${styles.iconOpen}`}>
        <IconOpenCircle />
      </div>
    );

  const stateLabel = state === "paid" ? "Bezahlt" : isGhost ? "Forecast" : "Offen";

  return (
    <div className={`${styles.card} ${stateClass}`}>
      <div className={styles.cardTop}>
        <div className={styles.cardLabel}>Fixkosten</div>
        {iconEl}
      </div>
      <div className={styles.cardName}>{card.name}</div>
      <div className={styles.cardAmount}>{formatEuro(card.amount)}</div>
      <HouseholdRow householdAmount={card.householdAmount} />
      <StateRow stateLabel={stateLabel} dueDay={card.dueDay} />
      <MetaRow attribution={card.attribution} />

      <CardInteractive
        cardId={card.id}
        cardName={card.name}
        month={month}
        currentAmount={card.amount}
        tappable
        endDeleteOnly={isGhost}
        canEnd={card.frequency !== "ONCE"}
        currentLastMonth={card.last_active_month}
        deleteGate={card.deleteGate}
        cardType={card.type}
        currentDueDay={card.dueDay}
        currentCategoryId={card.categoryId}
        categories={categories}
        linkedFragments={card.linkedFragments}
        ariaLabel={state === "paid" ? `${card.name} als offen markieren` : `${card.name} als bezahlt markieren`}
      />
    </div>
  );
}

// ── Einnahmen-Karte ──────────────────────────────────────────────────────────

function IncomeCard({
  card,
  state,
  month,
  categories,
}: {
  card: EnrichedCard;
  state: IncomeState;
  month: string;
  categories: CardCategory[];
}) {
  const stateClass = styles[state];
  const isGhost = state === "ghost";
  // §7 Konflikt 6 (Sprint 8 P0): Bei Fragment-Link wird der Tap-Catcher nicht
  // gerendert (manually_paid nicht über die UI schreibbar) und der Cursor bleibt
  // default. Der Erhalten-Status kommt ohnehin schon aus dem Fragment.
  const hasFragment = (card.linkedFragments?.length ?? 0) > 0;
  const tappable = !hasFragment;

  const iconEl =
    state === "received" ? (
      <div className={`${styles.icon} ${styles.iconPaid}`}>
        <IconCheckmark />
      </div>
    ) : isGhost ? (
      <div className={`${styles.icon} ${styles.iconGhost}`}>
        <IconGhostCircleTeal />
      </div>
    ) : (
      <div className={`${styles.icon} ${styles.iconExpected}`}>
        <IconOpenCircleTeal />
      </div>
    );

  const stateLabel = state === "received" ? "Erhalten" : isGhost ? "Forecast" : "Erwartet";

  return (
    <div
      className={`${styles.card} ${stateClass} ${
        !isGhost && !tappable ? styles.notTappable : ""
      }`}
    >
      <div className={styles.cardTop}>
        <div className={styles.cardLabel}>Einnahmen</div>
        {iconEl}
      </div>
      <div className={styles.cardName}>{card.name}</div>
      <div className={styles.cardAmount}>{formatEuro(card.amount)}</div>
      <HouseholdRow householdAmount={card.householdAmount} />
      <StateRow stateLabel={stateLabel} dueDay={card.dueDay} />
      <MetaRow attribution={card.attribution} />

      <CardInteractive
        cardId={card.id}
        cardName={card.name}
        month={month}
        currentAmount={card.amount}
        tappable={tappable}
        endDeleteOnly={isGhost}
        canEnd={card.frequency !== "ONCE"}
        currentLastMonth={card.last_active_month}
        deleteGate={card.deleteGate}
        cardType={card.type}
        currentDueDay={card.dueDay}
        currentCategoryId={card.categoryId}
        categories={categories}
        linkedFragments={card.linkedFragments}
        ariaLabel={state === "received" ? `${card.name} als erwartet markieren` : `${card.name} als erhalten markieren`}
      />
    </div>
  );
}

// ── Budget-Karte ─────────────────────────────────────────────────────────────

function BudgetCard({
  card,
  state,
  fragmentSum,
  month,
  categories,
}: {
  card: EnrichedCard;
  state: BudgetState;
  fragmentSum: number;
  month: string;
  categories: CardCategory[];
}) {
  const isGhost = state === "ghost";
  const isDone = state === "done";
  const effectivePlan = card.effectivePlan;

  // Balken-Berechnung: für alle sichtbaren Zustände (§9.1)
  const diff = effectivePlan - fragmentSum;
  const barWidth =
    state === "over" || (isDone && diff < 0)
      ? 100
      : effectivePlan > 0
      ? // v2-11 (BF-5/E2): untere Klammer bei 0. Übersteigen die Gutschriften die
        // Ausgaben, ist `fragmentSum` negativ — ohne die Klammer ergäbe sich eine
        // negative Balkenbreite. „Nichts verbraucht" ist der einzige sinnvolle
        // Balken dafür; ein eigener Kartenzustand entsteht dadurch nicht.
        Math.max(0, Math.min((fragmentSum / effectivePlan) * 100, 100))
      : 0;
  const barIsOver = state === "over" || (isDone && diff < 0);

  // Restbudget-Text (DD-D2: kein Minuszeichen bei Überschritten, §9.1)
  let restText: string | null = null;
  if (!isGhost) {
    if (isDone) {
      if (diff > 0) restText = `${formatEuro(diff)} nicht verbraucht`;
      else if (diff < 0) restText = `${formatEuro(Math.abs(diff))} über Plan`;
      // diff === 0 → kein Sub-Text (§9.1)
    } else if (state === "over") {
      restText = `${formatEuro(Math.abs(diff))} über Plan`;
    } else {
      restText = `Noch ${formatEuro(Math.max(0, diff))} frei`;
    }
  }

  const iconEl =
    isDone ? (
      <div className={`${styles.icon} ${styles.iconPaid}`}>
        <IconCheckmark />
      </div>
    ) : state === "over" ? (
      <div className={`${styles.icon} ${styles.iconOver}`}>
        <IconOverExclamation />
      </div>
    ) : isGhost ? (
      <div className={`${styles.icon} ${styles.iconGhost}`}>
        <IconGhostCircle />
      </div>
    ) : (
      <div className={`${styles.icon} ${styles.iconOpen}`}>
        <IconOpenCircle />
      </div>
    );

  const stateLabel =
    isDone ? "Abgeschlossen" :
    state === "over" ? "Überschritten" :
    isGhost ? "Forecast" :
    "Laufend";

  const stateLabelClass =
    isDone ? styles.stateLabelTeal :
    state === "over" ? styles.stateLabelRed :
    styles.stateLabel;

  const cardClass = isDone
    ? `${styles.card} ${styles.done} ${styles.cardBudget}`
    : `${styles.card} ${styles[state]} ${styles.cardBudget}`;

  return (
    <div className={cardClass}>
      <div className={styles.cardTop}>
        <div className={styles.cardLabel}>Budget</div>
        {iconEl}
      </div>
      <div className={styles.cardName}>{card.name}</div>
      <div className={styles.cardAmount}>{formatEuro(card.amount)}</div>
      {/* BUDGET ist per DB-Constraint `budget_never_shared` nie GEMEINSAM — die
          Zeile bleibt hier immer leer. Sie wird trotzdem gerendert, damit ALLE
          Karten dieselben Maße behalten (Gestaltungsrunde, Punkt 5). */}
      <HouseholdRow householdAmount={card.householdAmount} />
      <div className={stateLabelClass}>{stateLabel}</div>

      {!isGhost && restText && (
        <div
          className={`${styles.restAmount} ${
            (state === "over") || (isDone && diff < 0)
              ? styles.restAmountNeg
              : styles.restAmountPos
          }`}
        >
          {restText}
        </div>
      )}

      {/* Attribution: Budget ist immer ICH (§7 + DB-Constraint) */}
      <MetaRow attribution="ICH" />

      {!isGhost && (
        <div className={styles.progressWrap}>
          <div
            className={`${styles.progressBar} ${
              barIsOver ? styles.progressBarOver : styles.progressBarNorm
            }`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      )}

      {/* Sprint 7: BUDGET ist jetzt tappable (§3.4.3). Ghost: nur Verbergen-Menü,
          kein Tap-Catcher (Sprint 10 hideOnly). */}
      <CardInteractive
        cardId={card.id}
        cardName={card.name}
        month={month}
        currentAmount={card.amount}
        tappable
        endDeleteOnly={isGhost}
        canEnd={card.frequency !== "ONCE"}
        currentLastMonth={card.last_active_month}
        deleteGate={card.deleteGate}
        cardType={card.type}
        currentDueDay={card.dueDay}
        currentCategoryId={card.categoryId}
        categories={categories}
        linkedFragments={card.linkedFragments}
        ariaLabel={isDone ? `${card.name} als nicht abgeschlossen markieren` : `${card.name} als abgeschlossen markieren`}
      />
    </div>
  );
}

// ── Public Card Component ────────────────────────────────────────────────────

type CardProps = {
  card: EnrichedCard;
  isFuture: boolean;
  isPast: boolean;
  month: string; // "YYYY-MM-01"
  /** v2-17 (KAT-1): alle Ordner des Nutzers — Auswahlliste für „Kategorie
   *  ändern …". Einmal geladen und an alle Karten durchgereicht, statt je Karte
   *  nachzufragen (der Loader feuert ohnehin schon drei Aufrufe pro Karte,
   *  Befund D14). */
  categories: CardCategory[];
};

export function Card({ card, isFuture, isPast, month, categories }: CardProps) {
  if (card.type === "FIXED_COST") {
    const state = resolveFixedCostState(card, isFuture);
    return (
      <FixedCostCard
        card={card}
        state={state}
        month={month}
        categories={categories}
      />
    );
  }

  if (card.type === "INCOME") {
    const state = resolveIncomeState(card, isFuture);
    return (
      <IncomeCard
        card={card}
        state={state}
        month={month}
        categories={categories}
      />
    );
  }

  // BUDGET
  const fragmentSum = sumLinkedFragments(card);
  const state = resolveBudgetState(card, isFuture, isPast, fragmentSum);
  return (
    <BudgetCard
      card={card}
      state={state}
      fragmentSum={fragmentSum}
      month={month}
      categories={categories}
    />
  );
}
