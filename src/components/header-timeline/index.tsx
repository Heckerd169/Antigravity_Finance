import Link from "next/link";
import {
  MAX_NAVIGABLE_YM,
  MIN_NAVIGABLE_YM,
  addMonths,
  compareMonths,
  formatMonthLabel,
} from "@/lib/months";
import type { HeaderTimelineProps, PillVariant } from "./header-timeline.types";
import styles from "./header-timeline.module.css";

function pillVariantFor(target: string, current: string): PillVariant {
  const cmp = compareMonths(target, current);
  if (cmp === 0) return "running";
  if (cmp < 0) return "past";
  return "future";
}

const PILL_LABEL: Record<PillVariant, string> = {
  running: "Laufend",
  past: "Abgeschlossen",
  future: "Forecast",
};

const PILL_CLASS: Record<PillVariant, string> = {
  running: styles.pillRunning,
  past: styles.pillPast,
  future: styles.pillFuture,
};

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M9 11L5 7L9 3"
        stroke="var(--chev-stroke)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M5 3L9 7L5 11"
        stroke="var(--chev-stroke)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeaderTimeline({ targetMonth, currentMonth }: HeaderTimelineProps) {
  const prevYm = addMonths(targetMonth, -1);
  const nextYm = addMonths(targetMonth, 1);

  // V1: Schranken sind absurd weit (months.ts), die Disabled-Pfade werden
  // nie getriggert. Code-Pfad existiert trotzdem zwecks Design-Doku §6
  // Spec-Konformität (Sprint 3 §3.4 / Stolperfalle 7).
  const prevDisabled = compareMonths(prevYm, MIN_NAVIGABLE_YM) < 0;
  const nextDisabled = compareMonths(nextYm, MAX_NAVIGABLE_YM) > 0;

  const variant = pillVariantFor(targetMonth, currentMonth);

  return (
    <div className={styles.headerTimeline}>
      <Flank
        side="left"
        ym={prevYm}
        disabled={prevDisabled}
        sublabel={
          // TODO Sprint 7: ersetzen durch COUNT auf fragments_with_status
          // WHERE status='UNASSIGNED' für targetMonth − 1; Label-Varianten:
          // "Alles erledigt" | "1 Fragment offen" | "[N] Fragmente offen"
          "Alles erledigt"
        }
      />

      <div className={styles.center}>
        <div key={targetMonth} className={styles.monthLabel}>
          {formatMonthLabel(targetMonth)}
        </div>
        <span className={`${styles.pill} ${PILL_CLASS[variant]}`}>
          {PILL_LABEL[variant]}
        </span>
      </div>

      <Flank
        side="right"
        ym={nextYm}
        disabled={nextDisabled}
        sublabel={
          // TODO post-Sprint-4 (Architekten-Auftrag offen): Definition Ausreißer
          // gemäß Design-Doku §6 ("Karte mit Frequenz nicht-monatlich und Plan > 200 €"
          // funktional ableitbar, Schwellwert tunbar). RPC oder client-seitiger Filter
          // über cards + card_planned_timeline. Label-Varianten:
          // "Kein Ausreißer" | "[Bezeichnung] [Betrag]" (z.B. "Autoversicherung 650 €")
          "Kein Ausreißer"
        }
      />
    </div>
  );
}

type FlankProps = {
  side: "left" | "right";
  ym: string;
  disabled: boolean;
  sublabel: string;
};

function Flank({ side, ym, disabled, sublabel }: FlankProps) {
  const className = `${styles.flank} ${side === "left" ? styles.left : styles.right} ${
    disabled ? styles.flankDisabled : ""
  }`;

  const chev = side === "left" ? <ChevronLeftIcon /> : <ChevronRightIcon />;
  const textBlock = (
    <div className={styles.flankText}>
      <div className={styles.flankMonth}>{formatMonthLabel(ym)}</div>
      <div className={styles.flankSub}>{sublabel}</div>
    </div>
  );

  const content =
    side === "left" ? (
      <>
        <div className={styles.chev}>{chev}</div>
        {textBlock}
      </>
    ) : (
      <>
        {textBlock}
        <div className={styles.chev}>{chev}</div>
      </>
    );

  if (disabled) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link className={className} href={`/?month=${ym}`}>
      {content}
    </Link>
  );
}
