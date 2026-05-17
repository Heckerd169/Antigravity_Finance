"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { formatMonthLabel } from "@/lib/months";
import { formatAmount } from "@/lib/format";
import {
  ATTRIBUTION_OPTIONS,
  FREQUENCY_OPTIONS,
  TYPE_OPTIONS,
  type CardAttribution,
  type CardFrequency,
  type CardType,
  type FragmentRow,
} from "./interaction-zone.types";
import { createCardFromFragmentAction } from "./actions";
import styles from "./interaction-zone.module.css";

const DATE_FMT = new Intl.DateTimeFormat("de-DE", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

type RecurrencePopupProps = {
  fragment: FragmentRow;
  /** "YYYY-MM" angezeigter Monat → gilt-ab + link_month. */
  targetMonth: string;
  /** "YYYY-MM-01" für Server Action. */
  targetDbMonth: string;
  onClose: () => void;
};

export function RecurrencePopup({
  fragment,
  targetMonth,
  targetDbMonth,
  onClose,
}: RecurrencePopupProps) {
  const [name, setName] = useState(fragment.description);
  const [type, setType] = useState<CardType>("FIXED_COST");
  const [frequency, setFrequency] = useState<CardFrequency>("MONTHLY");
  const [attribution, setAttribution] = useState<CardAttribution>("ICH");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // ESC schließt Overlay (LL-6: Visibility via state, nicht via Eltern-Hover).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Budget erzwingt Attribution = ICH (§7 Constraint).
  useEffect(() => {
    if (type === "BUDGET" && attribution !== "ICH") {
      setAttribution("ICH");
    }
  }, [type, attribution]);

  const plannedAmount = Math.abs(fragment.amount);
  const isNameValid = name.trim().length > 0;
  const isValid = isNameValid && plannedAmount > 0;

  function handleSubmit() {
    if (!isValid) {
      setSubmitError("Bitte Kartennamen angeben.");
      return;
    }
    setSubmitError(null);
    startTransition(async () => {
      try {
        await createCardFromFragmentAction({
          name: name.trim(),
          type,
          attribution: type === "BUDGET" ? "ICH" : attribution,
          frequency,
          firstActiveMonth: targetDbMonth,
          plannedAmount,
          fragmentId: fragment.id,
          linkMonth: targetDbMonth,
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
        aria-labelledby="recur-title"
      >
        <div id="recur-title" className={styles.overlayTitle}>
          Neue Karte erstellen
        </div>
        {/* K1.5a: einzeilige Kopf-Sub-Zeile <Beschr> · <Betrag> · <Datum>. */}
        <div className={styles.overlayMetaLine}>
          {fragment.description} · {formatAmount(plannedAmount)} € ·{" "}
          {formatDateLong(fragment.transaction_date)}
        </div>

        <div className={styles.overlayFieldGroup}>
          <label className={styles.overlayFieldLabel} htmlFor="recur-name">
            Karten-Name
          </label>
          <input
            id="recur-name"
            type="text"
            className={styles.overlayInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
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

function formatDateLong(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return DATE_FMT.format(date);
}
