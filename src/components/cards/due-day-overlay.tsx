"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { setCardDueDay } from "./actions";
import styles from "./cards.module.css";

type DueDayOverlayProps = {
  cardId: string;
  cardName: string;
  /** Aktueller Fälligkeitstag (1–31) oder `null` für „kein fester Tag". */
  currentDueDay: number | null;
  onClose: () => void;
};

/** v2-15 (LQ-1): „Fällig am …" — der Fälligkeitstag einer Karte.
 *
 *  Eigenes Overlay, NICHT Teil von „Betrag anpassen". Das ist keine Platz-,
 *  sondern eine Bedeutungsfrage: Dort gilt alles entweder *nur dieser Monat*
 *  oder *dauerhaft ab diesem Monat*. `cards.due_day` gilt dagegen **immer** und
 *  kennt keine Monatsabgrenzung — ein Feld dazwischen erzeugte die Frage „gilt
 *  der neue Tag nur für August?", die die Oberfläche nicht beantwortet.
 *
 *  Genau deshalb trägt die Unterzeile hier `gilt für alle Monate`: Sie beantwortet
 *  die Frage, bevor sie entsteht (Entwurfsseite lq1-faelligkeitstag.html, Caption
 *  „Das kleine Overlay").
 *
 *  Portal nach `document.body` wie bei AdjustAmountOverlay (K3-Fix): Backdrop
 *  (`position: fixed; inset: 0`) und Modal dürfen nicht vom `.card`-Vorfahren
 *  eingesperrt werden, der beim Hover ein `transform` trägt und damit zum
 *  Containing-Block würde (LL-6).
 *
 *  Escape-Handler von Anfang an — das Einkommens-Popup hat als einziges der
 *  Overlays keinen, und das soll sich nicht fortpflanzen
 *  (sprints/sprint_v2-10_offene_fragen.md §6).
 *
 *  Gestaltung: V2/design_direktor_2026-08-06_liquiditaet_fragment_split.md §2.3 */
export function DueDayOverlay({
  cardId,
  cardName,
  currentDueDay,
  onClose,
}: DueDayOverlayProps) {
  const [inputValue, setInputValue] = useState(
    currentDueDay !== null ? String(currentDueDay) : "",
  );
  const [inputError, setInputError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  // ESC schließt Overlay
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  /** Ganze Zahl 1–31. Die obere Grenze ist bewusst 31 und nicht 28: Ein
   *  Dauerauftrag zum 31. existiert. Die Klammerung auf die tatsächliche
   *  Monatslänge (Februar!) passiert erst in der Vorhersage-Logik von LQ-2 —
   *  der gespeicherte Wert bleibt der Soll-Tag, keine Interpretation. */
  function parseInput(raw: string): number | null {
    const trimmed = raw.trim();
    if (!/^\d{1,2}$/.test(trimmed)) return null;
    const n = Number(trimmed);
    if (!Number.isInteger(n) || n < 1 || n > 31) return null;
    return n;
  }

  const parsedDay = parseInput(inputValue);
  const isValid = parsedDay !== null;

  function handleApply(e: React.MouseEvent) {
    e.stopPropagation();
    if (!isValid) {
      setInputError("Bitte einen Tag zwischen 1 und 31 eingeben");
      return;
    }
    setInputError(null);
    startTransition(async () => {
      await setCardDueDay(cardId, parsedDay);
      onClose();
    });
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    startTransition(async () => {
      await setCardDueDay(cardId, null);
      onClose();
    });
  }

  function handleCancel(e: React.MouseEvent) {
    e.stopPropagation();
    onClose();
  }

  return createPortal(
    <div
      className={styles.overlayBackdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.overlayModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.overlayTitle}>Fällig am</div>

        <div className={styles.overlayCurrentValue}>
          {cardName} · gilt für alle Monate
        </div>

        <div className={styles.overlayInputWrap}>
          <label className={styles.overlayInputLabel} htmlFor="due-day-input">
            Tag im Monat
          </label>
          <input
            id="due-day-input"
            ref={inputRef}
            type="text"
            inputMode="numeric"
            maxLength={2}
            className={`${styles.overlayInput}${inputError ? ` ${styles.overlayInputError}` : ""}`}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (inputError) setInputError(null);
            }}
            placeholder="1"
            aria-invalid={!!inputError}
            aria-describedby={inputError ? "due-day-error" : undefined}
          />
          {inputError && (
            <span id="due-day-error" className={styles.overlayInputErrorText}>
              {inputError}
            </span>
          )}
        </div>

        {/* Ehrlichkeit über einen geratenen Wert: Die 17 Tage sind aus der
            Buchungshistorie ABGELEITET, nie bestätigt. Bewusst ohne Zahlen —
            die Herleitung („19 Monate, immer am 1. bis 4.") steht nur als
            Kommentar in der Migration und ist zur Laufzeit nicht verfügbar;
            sie zu rekonstruieren hieße, die gesamte Historie je Karte zu lesen
            (LL-21). Der Satz bleibt außerdem richtig, nachdem der Tag von Hand
            gesetzt wurde. */}
        <div className={styles.overlayHint}>
          Die Tage stammen aus deiner Buchungshistorie — abgeleitet, nicht
          bestätigt.
        </div>

        <div className={styles.overlayActions}>
          <button
            type="button"
            className={styles.overlayActionButton}
            onClick={handleApply}
            disabled={isPending || !isValid}
          >
            Übernehmen
          </button>
          <button
            type="button"
            className={styles.overlayActionButton}
            onClick={handleClear}
            disabled={isPending || currentDueDay === null}
          >
            Kein fester Tag
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
    document.body,
  );
}
