"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { formatMonthLabel } from "@/lib/months";
import {
  ATTRIBUTION_OPTIONS,
  FREQUENCY_OPTIONS,
  TYPE_OPTIONS,
  type CardAttribution,
  type CardFrequency,
  type CardType,
} from "./interaction-zone.types";
import { createCardDirectAction } from "./actions";
import styles from "./interaction-zone.module.css";

type DirectCreateOverlayProps = {
  targetMonth: string; // "YYYY-MM"
  targetDbMonth: string; // "YYYY-MM-01"
  onClose: () => void;
};

export function DirectCreateOverlay({
  targetMonth,
  targetDbMonth,
  onClose,
}: DirectCreateOverlayProps) {
  const [name, setName] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [type, setType] = useState<CardType>("FIXED_COST");
  const [frequency, setFrequency] = useState<CardFrequency>("MONTHLY");
  const [attribution, setAttribution] = useState<CardAttribution>("ICH");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (type === "BUDGET" && attribution !== "ICH") {
      setAttribution("ICH");
    }
  }, [type, attribution]);

  const parsedAmount = parseAmount(amountStr);
  const isNameValid = name.trim().length > 0;
  const isAmountValid = parsedAmount !== null;
  const isValid = isNameValid && isAmountValid;

  function handleSubmit() {
    if (!isValid || parsedAmount === null) {
      setSubmitError(
        !isNameValid
          ? "Bitte Kartennamen angeben."
          : "Bitte gültigen Betrag > 0 eingeben.",
      );
      return;
    }
    setSubmitError(null);
    startTransition(async () => {
      try {
        await createCardDirectAction({
          name: name.trim(),
          type,
          attribution: type === "BUDGET" ? "ICH" : attribution,
          frequency,
          firstActiveMonth: targetDbMonth,
          plannedAmount: parsedAmount,
        });
        onClose();
      } catch (err) {
        setSubmitError(
          err instanceof Error ? err.message : "Karte konnte nicht erstellt werden.",
        );
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
        className={styles.overlayModal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="direct-create-title"
      >
        <div id="direct-create-title" className={styles.overlayTitle}>
          Neue Karte erstellen
        </div>

        <div className={styles.overlayFieldGroup}>
          <label className={styles.overlayFieldLabel} htmlFor="direct-name">
            Karten-Name
          </label>
          <input
            id="direct-name"
            ref={nameRef}
            type="text"
            className={styles.overlayInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            placeholder="z. B. Miete"
          />
        </div>

        <div className={styles.overlayFieldGroup}>
          <label className={styles.overlayFieldLabel} htmlFor="direct-amount">
            Betrag (€)
          </label>
          <input
            id="direct-amount"
            type="text"
            inputMode="decimal"
            className={styles.overlayInput}
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            disabled={isPending}
            placeholder="0,00"
          />
        </div>

        <div className={styles.overlayFieldGroup}>
          <div className={styles.overlayFieldLabel}>Karten-Typ</div>
          <div className={styles.optionGrid}>
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`${styles.optionButton} ${
                  type === opt.value ? styles.optionButtonSelected : ""
                }`}
                onClick={() => setType(opt.value)}
                disabled={isPending}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.overlayFieldGroup}>
          <div className={styles.overlayFieldLabel}>Wiederholung</div>
          <div className={styles.optionGrid}>
            {FREQUENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`${styles.optionButton} ${
                  frequency === opt.value ? styles.optionButtonSelected : ""
                }`}
                onClick={() => setFrequency(opt.value)}
                disabled={isPending}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {type !== "BUDGET" && (
          <div className={styles.overlayFieldGroup}>
            <div className={styles.overlayFieldLabel}>Attribution</div>
            <div className={styles.optionGrid}>
              {ATTRIBUTION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`${styles.optionButton} ${
                    attribution === opt.value ? styles.optionButtonSelected : ""
                  }`}
                  onClick={() => setAttribution(opt.value)}
                  disabled={isPending}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.overlayMetaLine}>
          Gilt ab {formatMonthLabel(targetMonth)}
        </div>

        {submitError && <div className={styles.errorText}>{submitError}</div>}

        <div className={styles.overlayActions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleSubmit}
            disabled={isPending || !isValid}
          >
            Karte erstellen
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isPending}
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** Akzeptiert deutsches ("1.234,56") und englisches Format ("1234.56").
 *  Returns null bei ungültiger Eingabe oder ≤ 0. */
function parseAmount(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(/\./g, "").replace(/,/g, ".");
  if (/e/i.test(normalized)) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const n = Number(normalized);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}
