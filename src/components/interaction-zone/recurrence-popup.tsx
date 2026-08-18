"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { formatMonthLabel } from "@/lib/months";
import { formatAmount, formatEuro, parseAmount } from "@/lib/format";
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
  /** v2-26: Anteil des Nutzers am Haushalt (§4.5). Nur für die VORSCHAU des
   *  eigenen Anteils bei GEMEINSAM — gerechnet wird weiterhin ausschließlich
   *  in der Datenbank (§7 Regel 1). 1,0 heißt „kein Partner-Einkommen". */
  splitFactor: number;
  onClose: () => void;
};

export function RecurrencePopup({
  fragment,
  targetMonth,
  targetDbMonth,
  splitFactor,
  onClose,
}: RecurrencePopupProps) {
  const [name, setName] = useState(fragment.description);
  /* v2-26: Der Betrag ist EINGEBBAR, vorbelegt mit dem Zahlungsbetrag.
   *
   * Vorher stand hier `Math.abs(fragment.amount)` fest verdrahtet — bei einer
   * GEMEINSAM-Karte war das falsch und nicht korrigierbar: Der Plan einer
   * gemeinsamen Karte ist der HAUSHALTSBETRAG, die Zahlung dagegen bereits der
   * eigene Anteil. Wer 28,88 € überweist und daraus eine gemeinsame Karte
   * macht, bekam 28,88 € als Plan — und der Anteil wurde beim Rechnen ein
   * ZWEITES Mal abgezogen (§6 Stolperfalle 11). Genau dieser Fall stand im
   * Befund vom 17.08.2026 zur Privathaftpflicht: 53,25 € Haushalt, 28,88 €
   * abgebucht. */
  const [amountStr, setAmountStr] = useState(
    formatAmount(Math.abs(fragment.amount)),
  );
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

  const plannedAmount = parseAmount(amountStr);
  const isNameValid = name.trim().length > 0;
  const isValid = isNameValid && plannedAmount !== null;

  /* v2-26: Vorschau des eigenen Anteils. Reine ANZEIGE — die verbindliche
   * Rechnung macht `calculate_card_amount_for_month` (§7 Regel 1). Sie steht
   * nur bei GEMEINSAM und nur, wenn es einen Partner gibt: Bei Split-Faktor 1,0
   * wären Anteil und Haushalt identisch, und die Zeile erklärte nichts —
   * dieselbe Regel, nach der die Karte selbst die `von X €`-Zeile leer lässt. */
  const zeigeAnteil =
    type !== "BUDGET" &&
    attribution === "GEMEINSAM" &&
    splitFactor < 1 &&
    plannedAmount !== null;

  function handleSubmit() {
    if (!isValid || plannedAmount === null) {
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
          {fragment.description} · {formatAmount(plannedAmount ?? 0)} € ·{" "}
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
          <label className={styles.overlayFieldLabel} htmlFor="recur-amount">
            Betrag (€)
          </label>
          <input
            id="recur-amount"
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

        {/* v2-26: Bei GEMEINSAM ist der Plan der HAUSHALTSBETRAG, nicht der
            eigene Anteil — sonst wird der Anteil beim Rechnen ein zweites Mal
            abgezogen (§6 Stolperfalle 11). Das stand nirgends, und man konnte
            es der Eingabemaske nicht ansehen. Die Vorschau ist reine ANZEIGE;
            verbindlich rechnet die Datenbank (§7 Regel 1). */}
        {zeigeAnteil && (
          <div className={styles.overlayMetaLine}>
            Voller Haushaltsbetrag — dein Anteil davon:{" "}
            <b>{formatEuro((plannedAmount ?? 0) * splitFactor)}</b>
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
