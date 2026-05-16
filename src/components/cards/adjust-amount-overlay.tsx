"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { applyAdjustmentThisMonth, applyAdjustmentForward } from "./actions";
import styles from "./cards.module.css";

const EUR_FMT = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

type AdjustAmountOverlayProps = {
  cardId: string;
  month: string; // "YYYY-MM-01"
  currentAmount: number;
  onClose: () => void;
};

export function AdjustAmountOverlay({
  cardId,
  month,
  currentAmount,
  onClose,
}: AdjustAmountOverlayProps) {
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Input auf Fokus setzen beim Öffnen
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ESC schließt Overlay
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Eingabe-Validierung: > 0, max. 2 Dezimalstellen, keine Wissenschaftsnotation
  function parseInput(raw: string): number | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    // Erlaube deutsches Format (Komma) + englisches Format (Punkt)
    const normalized = trimmed.replace(/\./g, "").replace(/,/g, ".");
    // Keine Wissenschaftsnotation
    if (/e/i.test(normalized)) return null;
    const n = Number(normalized);
    if (!Number.isFinite(n) || n <= 0) return null;
    // Max. 2 Dezimalstellen
    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
    return n;
  }

  const parsedAmount = parseInput(inputValue);
  const isValid = parsedAmount !== null;

  function validate(): boolean {
    if (!isValid) {
      setInputError("Bitte einen gültigen Betrag > 0 eingeben (max. 2 Dezimalstellen)");
      return false;
    }
    setInputError(null);
    return true;
  }

  function buildFormData(): FormData {
    const fd = new FormData();
    fd.append("cardId", cardId);
    fd.append("month", month);
    fd.append("newAmount", String(parsedAmount));
    return fd;
  }

  function handleThisMonth(e: React.MouseEvent) {
    e.stopPropagation();
    if (!validate()) return;
    startTransition(async () => {
      await applyAdjustmentThisMonth(buildFormData());
      onClose();
    });
  }

  function handleForward(e: React.MouseEvent) {
    e.stopPropagation();
    if (!validate()) return;
    startTransition(async () => {
      await applyAdjustmentForward(buildFormData());
      onClose();
    });
  }

  function handleCancel(e: React.MouseEvent) {
    e.stopPropagation();
    onClose();
  }

  // Portal nach document.body, damit Backdrop (position: fixed; inset: 0) und
  // Modal (width: 300px) nicht vom .card-Vorfahren (transform on hover →
  // Containing-Block-Hijack) eingesperrt werden. K3-Fix, gleiche Mechanik wie K2.
  return createPortal(
    <div
      className={styles.overlayBackdrop}
      onClick={(e) => {
        // Klick auf Backdrop schließt Overlay
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.overlayModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.overlayTitle}>Betrag anpassen</div>

        <div className={styles.overlayCurrentValue}>
          Aktuell: {EUR_FMT.format(currentAmount)} €
        </div>

        <div className={styles.overlayInputWrap}>
          <label className={styles.overlayInputLabel} htmlFor="adjust-amount-input">
            Neuer Betrag
          </label>
          <input
            id="adjust-amount-input"
            ref={inputRef}
            type="text"
            inputMode="decimal"
            className={`${styles.overlayInput}${inputError ? ` ${styles.overlayInputError}` : ""}`}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (inputError) setInputError(null);
            }}
            placeholder="0,00"
            aria-invalid={!!inputError}
            aria-describedby={inputError ? "adjust-error" : undefined}
          />
          {inputError && (
            <span id="adjust-error" className={styles.overlayInputErrorText}>
              {inputError}
            </span>
          )}
        </div>

        <div className={styles.overlayActions}>
          <button
            type="button"
            className={styles.overlayActionButton}
            onClick={handleThisMonth}
            disabled={isPending || !isValid}
          >
            Nur dieser Monat
          </button>
          <button
            type="button"
            className={styles.overlayActionButton}
            onClick={handleForward}
            disabled={isPending || !isValid}
          >
            Dauerhaft ab diesem Monat
          </button>
        </div>

        <button
          type="button"
          className={styles.overlayCancelButton}
          onClick={handleCancel}
          disabled={isPending}
        >
          Abbrechen
        </button>
      </div>
    </div>,
    document.body
  );
}
