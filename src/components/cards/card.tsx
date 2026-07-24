import type { EnrichedCard, FixedCostState, IncomeState, BudgetState } from "./cards.types";
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
 *  auch Adjustment oder Plan zurückgeben kann. */
function sumLinkedFragments(card: EnrichedCard): number {
  return (card.linkedFragments ?? []).reduce(
    (acc, f) => acc + Math.abs(f.amount),
    0,
  );
}

// ── Sub-Components ───────────────────────────────────────────────────────────

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
}: {
  card: EnrichedCard;
  state: FixedCostState;
  month: string;
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
      <div className={styles.stateLabel}>{stateLabel}</div>
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
}: {
  card: EnrichedCard;
  state: IncomeState;
  month: string;
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
      <div className={styles.stateLabel}>{stateLabel}</div>
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
}: {
  card: EnrichedCard;
  state: BudgetState;
  fragmentSum: number;
  month: string;
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
      ? Math.min((fragmentSum / effectivePlan) * 100, 100)
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
};

export function Card({ card, isFuture, isPast, month }: CardProps) {
  if (card.type === "FIXED_COST") {
    const state = resolveFixedCostState(card, isFuture);
    return <FixedCostCard card={card} state={state} month={month} />;
  }

  if (card.type === "INCOME") {
    const state = resolveIncomeState(card, isFuture);
    return <IncomeCard card={card} state={state} month={month} />;
  }

  // BUDGET
  const fragmentSum = sumLinkedFragments(card);
  const state = resolveBudgetState(card, isFuture, isPast, fragmentSum);
  return <BudgetCard card={card} state={state} fragmentSum={fragmentSum} month={month} />;
}
