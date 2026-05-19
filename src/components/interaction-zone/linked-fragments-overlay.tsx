"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { formatAmount } from "@/lib/format";
import type { LinkedFragmentRow } from "./interaction-zone.types";
import { ejectFragment } from "./actions";
import styles from "./interaction-zone.module.css";

const DATE_FMT = new Intl.DateTimeFormat("de-DE", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

type LinkedFragmentsOverlayProps = {
  cardName: string;
  linkedFragments: LinkedFragmentRow[];
  onClose: () => void;
};

export function LinkedFragmentsOverlay({
  cardName,
  linkedFragments,
  onClose,
}: LinkedFragmentsOverlayProps) {
  // Lokaler Spiegel der Liste — wenn Eject erfolgt, Row sofort aus der UI
  // entfernen (server-Revalidate ist asynchron). Stolperfalle F5: bei
  // leerer Liste Overlay schließen.
  const [rows, setRows] = useState(linkedFragments);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Wenn extern (z. B. via Revalidate) Daten kommen, Liste übernehmen — aber
  // nur solange der User nicht mitten in einem Eject ist.
  useEffect(() => {
    if (!isPending) setRows(linkedFragments);
  }, [linkedFragments, isPending]);

  // F5: bei leerer Liste sauber schließen.
  useEffect(() => {
    if (rows.length === 0) onClose();
  }, [rows, onClose]);

  function handleEject(fragmentId: string) {
    setPendingId(fragmentId);
    startTransition(async () => {
      try {
        await ejectFragment(fragmentId);
        setRows((prev) => prev.filter((r) => r.fragmentId !== fragmentId));
      } finally {
        setPendingId(null);
      }
    });
  }

  return createPortal(
    <div
      className={styles.overlayBackdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
    >
      <div
        className={`${styles.overlayModal} ${styles.overlayWide}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="linked-title"
      >
        <div id="linked-title" className={styles.overlayTitle}>
          Verknüpfte Fragmente
        </div>
        <div className={styles.overlaySubtitle}>{cardName}</div>

        <div className={styles.linkedList}>
          {rows.map((row) => {
            const isPos = row.amount >= 0;
            const sign = isPos ? "+" : "−";
            const abs = Math.abs(row.amount);
            return (
              <div key={row.fragmentId} className={styles.linkedRow}>
                <div className={styles.linkedRowInfo}>
                  <div className={styles.linkedRowAmount}>
                    {sign}
                    {formatAmount(abs)} €
                  </div>
                  <div className={styles.linkedRowDesc} title={row.description}>
                    {row.description}
                  </div>
                  <div className={styles.linkedRowDate}>
                    {formatDateLong(row.transactionDate)}
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.ejectButton}
                  onClick={() => handleEject(row.fragmentId)}
                  disabled={pendingId !== null}
                  aria-label={`${row.description} zurücksetzen`}
                  title="Fragment zurücksetzen"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path
                      d="M3.5 3.5l7 7M10.5 3.5l-7 7"
                      stroke="rgba(255,69,58,.9)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        <div className={styles.overlayActions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isPending}
          >
            Schließen
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function formatDateLong(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return DATE_FMT.format(date);
}
