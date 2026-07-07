import type { FragmentRow } from "./interaction-zone.types";
import { formatAmount } from "@/lib/format";
import { AssetReallocationToggle } from "./asset-reallocation-toggle";
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

  // Sprint 9: INTERNAL_TRANSFER schlägt alle anderen Stati (§6.1). Eigenes
  // Dimming (0.45) + TRANSFER-Badge, kein Drag/Tap. Höchste Status-Priorität,
  // daher VOR dem isLocked-Styling und vor dem KI-Vorschlag-Badge geprüft.
  const isTransfer = fragment.status === "INTERNAL_TRANSFER";
  const stateClass = isTransfer
    ? styles.fragmentCardTransfer
    : isLocked
      ? styles.fragmentCardLocked
      : "";

  return (
    <div
      className={`${styles.fragmentCard} ${stateClass}`}
      draggable={!isLocked && !isTransfer}
      data-fragment-id={fragment.id}
      aria-label={
        isTransfer
          ? `${fragment.description} (Transfer zwischen eigenen Konten)`
          : isLocked
            ? `${fragment.description} (zugeordnet)`
            : `${fragment.description}, ${sign}${formatAmount(abs)} Euro`
      }
    >
      <div className={styles.fragmentTop}>
        <div
          className={`${styles.fragmentAmount} ${
            isPos ? styles.fragmentAmountPos : styles.fragmentAmountNeg
          }`}
        >
          {sign}
          {formatAmount(abs)} €
        </div>
        {isTransfer ? (
          <div className={`${styles.fragmentBadge} ${styles.fragmentBadgeTransfer}`}>
            Transfer
          </div>
        ) : (
          fragment.suggestedCardName && (
            <div className={styles.fragmentBadge}>
              KI-Vorschlag: {fragment.suggestedCardName}
            </div>
          )
        )}
      </div>
      <div className={styles.fragmentDesc} title={fragment.description}>
        {fragment.description}
      </div>
      <div className={styles.fragmentDate}>{formatDateShort(fragment.transaction_date)}</div>
      {/* v2-04 ② Interim: Markier-Auslösung. Setzen aus UNASSIGNED (Broker-
          Eingang, F3) oder INTERNAL_TRANSFER (Scalable-Fall, E2); Rücknahme
          aus ASSET_REALLOCATION. Verlinkte Fragmente (ASSIGNED/AUTO_ABSORBED)
          bekommen keinen Trigger — die RPC würde per OQ-B mit 23514 verweigern
          (Zuordnung zuerst lösen). Finale Geste = DD (Briefing §7). */}
      {fragment.status === "UNASSIGNED" ||
      fragment.status === "INTERNAL_TRANSFER" ? (
        <AssetReallocationToggle fragmentId={fragment.id} set />
      ) : fragment.status === "ASSET_REALLOCATION" ? (
        <AssetReallocationToggle fragmentId={fragment.id} set={false} />
      ) : null}
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
