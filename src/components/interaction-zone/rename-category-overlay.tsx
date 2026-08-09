"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { renameCardCategoryAction } from "@/components/cards/actions";
import styles from "@/components/cards/cards.module.css";

type RenameCategoryOverlayProps = {
  categoryId: string;
  currentName: string;
  onClose: () => void;
};

/** v2-17 (KAT-2): „Kategorie umbenennen …" aus dem ⋯-Menü der Ordner-Kachel.
 *
 *  Die Unterzeile sagt `wirkt in allen Monaten`, weil die Kategorie eine
 *  einfache Eigenschaft ist und keine Zeitreihe (Record A6): Ein neuer Name
 *  steht auch im Januar. Der Präzedenzfall ist `cards.name` — auch eine
 *  Karten-Umbenennung wirkt rückwirkend, und das stört niemanden. Was sich
 *  ändert, ist ausschließlich die Gliederung, nie eine Zahl, die rechnet.
 *
 *  Portal nach `document.body` und Escape-Handler von Anfang an — dieselben
 *  zwei Vorkehrungen wie in allen Overlays seit v2-10 (LL-6). */
export function RenameCategoryOverlay({
  categoryId,
  currentName,
  onClose,
}: RenameCategoryOverlayProps) {
  const [value, setValue] = useState(currentName);
  const [inputError, setInputError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleApply() {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      setInputError("Bitte einen Namen eingeben");
      return;
    }
    if (trimmed === currentName) {
      onClose();
      return;
    }
    setInputError(null);
    startTransition(async () => {
      await renameCardCategoryAction(categoryId, trimmed);
      onClose();
    });
  }

  return createPortal(
    <div
      className={styles.overlayBackdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.overlayModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.overlayTitle}>Kategorie umbenennen</div>

        <div className={styles.overlayCurrentValue}>
          {currentName} · wirkt in allen Monaten
        </div>

        <div className={styles.overlayInputWrap}>
          <label className={styles.overlayInputLabel} htmlFor="rename-category-input">
            Neuer Name
          </label>
          <input
            id="rename-category-input"
            ref={inputRef}
            type="text"
            maxLength={40}
            className={`${styles.overlayInput}${inputError ? ` ${styles.overlayInputError}` : ""}`}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (inputError) setInputError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApply();
              }
            }}
            aria-invalid={!!inputError}
            aria-describedby={inputError ? "rename-category-error" : undefined}
          />
          {inputError && (
            <span id="rename-category-error" className={styles.overlayInputErrorText}>
              {inputError}
            </span>
          )}
        </div>

        <div className={styles.overlayActions}>
          <button
            type="button"
            className={styles.overlayActionButton}
            onClick={handleApply}
            disabled={isPending}
          >
            Übernehmen
          </button>
        </div>

        <button
          type="button"
          className={styles.overlayCancelButton}
          onClick={onClose}
          disabled={isPending}
        >
          Abbrechen
        </button>
      </div>
    </div>,
    document.body,
  );
}
