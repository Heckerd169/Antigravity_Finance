"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  createCategoryForCardAction,
  setCardCategoryAction,
} from "./actions";
import type { CardCategory } from "./cards.types";
import styles from "./cards.module.css";

type CategoryOverlayProps = {
  cardId: string;
  cardName: string;
  /** Aktuelle Kategorie der Karte, oder `null` für „Ohne Kategorie". */
  currentCategoryId: string | null;
  /** Alle Ordner des Nutzers, bereits in Anzeige-Reihenfolge (C2). */
  categories: CardCategory[];
  onClose: () => void;
};

/** v2-17 (KAT-1): „Kategorie ändern …" — der EINZIGE Ort, an dem eine Karte
 *  ihren Ordner wechselt und an dem neue Ordner entstehen.
 *
 *  Warum nicht durch Ziehen (Record B8): Es wäre die natürlichere Geste,
 *  kollidiert aber hart mit dem Tap-Catcher. Über jeder tappbaren Karte liegt
 *  ein unsichtbarer Vollflächen-Button, der „bezahlt" umschaltet; die App
 *  müsste auf derselben Fläche zwischen „kurz klicken" und „ziehen"
 *  unterscheiden, und ein missratener Zug schriebe stumm `manually_paid` und
 *  bewegte die Sparrate (Befund U3). Zwei Klicks sind leicht genug für etwas,
 *  das man pro Karte einmal tut — und leicht MUSS es sein, weil manche Karte in
 *  zwei Kategorien passt (Fitnessstudio ist Sport und kündbares Abo).
 *
 *  Warum kein Einstellungs-Bereich: §10 schließt einen separaten Screen aus,
 *  und er wäre der erste Ort der App, der nicht das Dashboard ist (Befund U14).
 *  Eine Kategorie entsteht deshalb ausschließlich hier — dadurch, dass man ihr
 *  eine Karte gibt. Eine leere Kategorie kann so gar nicht erst entstehen.
 *
 *  Die Unterzeile sagt `gilt für alle Monate`, weil die Zuordnung rückwirkend
 *  wirkt (A6). Sie beantwortet die Frage, bevor sie entsteht — dasselbe Muster
 *  wie im Fällig-am-Overlay (v2-15).
 *
 *  Portal nach `document.body` (LL-6): Der `.card`-Vorfahre trägt beim Hover
 *  ein `transform` und würde damit zum Containing-Block für das
 *  `position: fixed`-Backdrop. */
export function CategoryOverlay({
  cardId,
  cardName,
  currentCategoryId,
  categories,
  onClose,
}: CategoryOverlayProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreating) inputRef.current?.focus();
  }, [isCreating]);

  // Escape-Handler von Anfang an — der Rückstand aus Sprint 1 soll sich nicht
  // fortpflanzen (sprints/sprint_v2-10_offene_fragen.md §6).
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handlePick(categoryId: string | null) {
    if (categoryId === currentCategoryId) {
      onClose();
      return;
    }
    startTransition(async () => {
      await setCardCategoryAction(cardId, categoryId);
      onClose();
    });
  }

  function handleCreate() {
    const trimmed = newName.trim();
    if (trimmed.length === 0) {
      setInputError("Bitte einen Namen eingeben");
      return;
    }
    setInputError(null);
    startTransition(async () => {
      await createCategoryForCardAction(cardId, trimmed);
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
        <div className={styles.overlayTitle}>Kategorie ändern</div>

        <div className={styles.overlayCurrentValue}>
          {cardName} · gilt für alle Monate
        </div>

        <div className={styles.categoryList} role="listbox">
          {categories.map((cat) => {
            const isActive = cat.id === currentCategoryId;
            return (
              <button
                key={cat.id}
                type="button"
                role="option"
                aria-selected={isActive}
                className={`${styles.categoryItem}${isActive ? ` ${styles.categoryItemActive}` : ""}`}
                onClick={() => handlePick(cat.id)}
                disabled={isPending}
              >
                <span className={styles.categoryItemName}>{cat.name}</span>
                {isActive && (
                  <span className={styles.categoryItemMark} aria-hidden="true">
                    ✓
                  </span>
                )}
              </button>
            );
          })}

          {/* „Ohne Kategorie" ist ein vollwertiger Behälter, kein Fehlerzustand
              (Befund D12) — deshalb steht er hier als reguläre Wahl und nicht
              als „entfernen". Er steht unten, wie im Karussell (B6). */}
          <button
            type="button"
            role="option"
            aria-selected={currentCategoryId === null}
            className={`${styles.categoryItem}${currentCategoryId === null ? ` ${styles.categoryItemActive}` : ""}`}
            onClick={() => handlePick(null)}
            disabled={isPending}
          >
            <span className={styles.categoryItemName}>Ohne Kategorie</span>
            {currentCategoryId === null && (
              <span className={styles.categoryItemMark} aria-hidden="true">
                ✓
              </span>
            )}
          </button>
        </div>

        {isCreating ? (
          <div className={styles.overlayInputWrap}>
            <label
              className={styles.overlayInputLabel}
              htmlFor="new-category-input"
            >
              Name der neuen Kategorie
            </label>
            <input
              id="new-category-input"
              ref={inputRef}
              type="text"
              maxLength={40}
              className={`${styles.overlayInput}${inputError ? ` ${styles.overlayInputError}` : ""}`}
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                if (inputError) setInputError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreate();
                }
              }}
              placeholder="Unterhaltung"
              aria-invalid={!!inputError}
              aria-describedby={inputError ? "new-category-error" : undefined}
            />
            {inputError && (
              <span
                id="new-category-error"
                className={styles.overlayInputErrorText}
              >
                {inputError}
              </span>
            )}
          </div>
        ) : null}

        <div className={styles.overlayActions}>
          {isCreating ? (
            <button
              type="button"
              className={styles.overlayActionButton}
              onClick={handleCreate}
              disabled={isPending}
            >
              Anlegen und einräumen
            </button>
          ) : (
            <button
              type="button"
              className={styles.overlayActionButton}
              onClick={() => setIsCreating(true)}
              disabled={isPending}
            >
              Neue Kategorie …
            </button>
          )}
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
