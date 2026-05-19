import type { EnrichedCard, FixedCostState, IncomeState, BudgetState } from "./cards.types";
import { CardInteractive } from "./card-interactive";
import { formatAmount, formatEuro } from "@/lib/format";
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
  return card.manuallyPaid ? "paid" : "open";
}

function resolveIncomeState(card: EnrichedCard, isFuture: boolean): IncomeState {
  if (isFuture) return "ghost";
  return card.manuallyPaid ? "received" : "expected";
}

function resolveBudgetState(card: EnrichedCard, isFuture: boolean): BudgetState {
  if (isFuture) return "ghost";
  // K1.4: Vergleich gegen effectivePlan (Adjustment > Plan), nicht raw Plan.
  // Tanken (Plan 200, Adj 250, kein Fragment) → amount=250, effectivePlan=250
  // → 250 > 250 = false → "running" (vorher fälschlich "over").
  return card.amount > card.effectivePlan ? "over" : "running";
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

      {!isGhost && (
        <CardInteractive
          cardId={card.id}
          cardName={card.name}
          month={month}
          currentAmount={card.amount}
          tappable
          linkedFragments={card.linkedFragments}
          ariaLabel={state === "paid" ? `${card.name} als offen markieren` : `${card.name} als bezahlt markieren`}
        />
      )}
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
    <div className={`${styles.card} ${stateClass}`}>
      <div className={styles.cardTop}>
        <div className={styles.cardLabel}>Einnahmen</div>
        {iconEl}
      </div>
      <div className={styles.cardName}>{card.name}</div>
      <div className={styles.cardAmount}>{formatEuro(card.amount)}</div>
      <div className={styles.stateLabel}>{stateLabel}</div>
      <MetaRow attribution={card.attribution} />

      {!isGhost && (
        <CardInteractive
          cardId={card.id}
          cardName={card.name}
          month={month}
          currentAmount={card.amount}
          tappable
          linkedFragments={card.linkedFragments}
          ariaLabel={state === "received" ? `${card.name} als erwartet markieren` : `${card.name} als erhalten markieren`}
        />
      )}
    </div>
  );
}

// ── Budget-Karte ─────────────────────────────────────────────────────────────

function BudgetCard({
  card,
  state,
  month,
}: {
  card: EnrichedCard;
  state: BudgetState;
  month: string;
}) {
  const stateClass = styles[state];
  const isGhost = state === "ghost";
  // K1.4: Vergleichsbasis ist effectivePlan (Adjustment > Plan).
  // K1.2: Spent ist Summe der Fragmentwerte — getrennt vom Anzeige-Betrag.
  const effectivePlan = card.effectivePlan;
  const spent = sumLinkedFragments(card);
  const overshoot = Math.max(0, spent - effectivePlan);
  const consumed = Math.min(spent, effectivePlan);
  const barWidth =
    state === "over"
      ? 100
      : effectivePlan > 0
      ? (consumed / effectivePlan) * 100
      : 0;

  const restText =
    state === "over"
      ? `−${formatAmount(overshoot)} € über Plan`
      : `Noch ${formatAmount(Math.max(0, effectivePlan - spent))} € frei`;

  const iconEl =
    state === "over" ? (
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

  const stateLabel = state === "over" ? "Überschritten" : isGhost ? "Forecast" : "Laufend";

  return (
    <div className={`${styles.card} ${stateClass} ${styles.cardBudget}`}>
      <div className={styles.cardTop}>
        <div className={styles.cardLabel}>Budget</div>
        {iconEl}
      </div>
      <div className={styles.cardName}>{card.name}</div>
      <div className={styles.cardAmount}>{formatEuro(card.amount)}</div>
      <div className={styles.stateLabel}>{stateLabel}</div>

      {!isGhost && (
        <div
          className={`${styles.restAmount} ${
            state === "over" ? styles.restAmountNeg : styles.restAmountPos
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
              state === "over" ? styles.progressBarOver : styles.progressBarNorm
            }`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      )}

      {/* Budget-Karten sind nicht tappable in Sprint 4 (kein Bezahlt-State in §7) */}
      {!isGhost && (
        <CardInteractive
          cardId={card.id}
          cardName={card.name}
          month={month}
          currentAmount={card.amount}
          tappable={false}
          linkedFragments={card.linkedFragments}
          ariaLabel={card.name}
        />
      )}
    </div>
  );
}

// ── Public Card Component ────────────────────────────────────────────────────

type CardProps = {
  card: EnrichedCard;
  isFuture: boolean;
  month: string; // "YYYY-MM-01"
};

export function Card({ card, isFuture, month }: CardProps) {
  if (card.type === "FIXED_COST") {
    const state = resolveFixedCostState(card, isFuture);
    return <FixedCostCard card={card} state={state} month={month} />;
  }

  if (card.type === "INCOME") {
    const state = resolveIncomeState(card, isFuture);
    return <IncomeCard card={card} state={state} month={month} />;
  }

  // BUDGET
  const state = resolveBudgetState(card, isFuture);
  return <BudgetCard card={card} state={state} month={month} />;
}
