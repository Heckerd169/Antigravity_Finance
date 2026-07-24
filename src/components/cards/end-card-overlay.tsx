"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./cards.module.css";

/* v2-05: „Karte beenden…" — Monatswahl-Overlay (Interim-UI bis DD-Feinschliff,
 * analog AR-Button-Pattern v2-04). Default = angezeigter Monat; Bestätigen
 * übergibt "YYYY-MM-01" an den Aufrufer (der Toast + Server-Action steuert). */

type EndCardOverlayProps = {
  cardName: string;
  /** "YYYY-MM-01" — angezeigter Monat als Vorbelegung. */
  month: string;
  onConfirm: (lastMonth: string) => void;
  onClose: () => void;
};

export function EndCardOverlay({
  cardName,
  month,
  onConfirm,
  onClose,
}: EndCardOverlayProps) {
  const [value, setValue] = useState(month.slice(0, 7)); // "YYYY-MM"

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isValid = /^\d{4}-\d{2}$/.test(value);

  return createPortal(
    <div
      className={styles.overlayBackdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.overlayModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.overlayTitle}>Karte beenden</div>

        <div className={styles.overlayCurrentValue}>
          »{cardName}« läuft bis einschließlich:
        </div>

        <div className={styles.overlayInputWrap}>
          <label className={styles.overlayInputLabel} htmlFor="end-card-month">
            Letzter aktiver Monat
          </label>
          <input
            id="end-card-month"
            type="month"
            className={styles.overlayInput}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>

        <div className={styles.overlayActions}>
          <button
            type="button"
            className={styles.overlayActionButton}
            disabled={!isValid}
            onClick={() => {
              if (isValid) onConfirm(`${value}-01`);
            }}
          >
            Beenden
          </button>
        </div>

        <button
          type="button"
          className={styles.overlayCancelButton}
          onClick={onClose}
        >
          Abbrechen
        </button>
      </div>
    </div>,
    document.body,
  );
}
