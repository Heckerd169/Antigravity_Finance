import type { FragmentRow } from "./interaction-zone.types";
import { formatAmount } from "@/lib/format";
import styles from "./interaction-zone.module.css";

/* Server-Component: ein Fragment-Item ohne Event-Handler. Drag-Start wird
   per Event-Delegation in der FragmentStack-Client-Component gefangen
   (Lookup über `data-fragment-id`-Attribut). */

const DATE_FMT = new Intl.DateTimeFormat("de-DE", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

type FragmentCardProps = {
  fragment: FragmentRow;
  isLocked: boolean;
};

export function FragmentCard({ fragment, isLocked }: FragmentCardProps) {
  const isPos = fragment.amount >= 0;
  const sign = isPos ? "+" : "−";
  const abs = Math.abs(fragment.amount);

  return (
    <div
      className={`${styles.fragmentCard} ${
        isLocked ? styles.fragmentCardLocked : ""
      }`}
      draggable={!isLocked}
      data-fragment-id={fragment.id}
      aria-label={
        isLocked
          ? `${fragment.description} (zugeordnet)`
          : `${fragment.description}, ${sign}${formatAmount(abs)} Euro`
      }
    >
      <div
        className={`${styles.fragmentAmount} ${
          isPos ? styles.fragmentAmountPos : styles.fragmentAmountNeg
        }`}
      >
        {sign}
        {formatAmount(abs)} €
      </div>
      <div className={styles.fragmentDesc} title={fragment.description}>
        {fragment.description}
      </div>
      <div className={styles.fragmentDate}>{formatDateShort(fragment.transaction_date)}</div>
    </div>
  );
}

function formatDateShort(iso: string): string {
  // "2026-05-15" → "15. Mai 2026"
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return DATE_FMT.format(date);
}
