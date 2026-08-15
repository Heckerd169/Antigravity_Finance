"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  deleteCardAction,
  endCardAction,
  restoreCardAction,
  toggleCardTap,
} from "./actions";
import { useCardActionToast } from "./card-action-toast-provider";
import { AdjustAmountOverlay } from "./adjust-amount-overlay";
import { CategoryOverlay } from "./category-overlay";
import { DueDayOverlay } from "./due-day-overlay";
import { EndCardOverlay } from "./end-card-overlay";
import { LinkedFragmentsOverlay } from "@/components/interaction-zone/linked-fragments-overlay";
import type {
  CardCategory,
  CardType,
  DeleteGate,
  LinkedFragmentRef,
} from "./cards.types";
import styles from "./cards.module.css";

/** v2-05: Grund-Codes des Lösch-Tors in Klartext (ausgegrauter Menüpunkt).
 *
 *  v2-20 (KU-2): Die Texte sagen jetzt, was zu TUN ist, statt nur zu benennen,
 *  was im Weg steht — und sie stehen für sich, ohne den pauschalen Zusatz
 *  „Stattdessen »Karte beenden…«". Der erschien vorher IMMER, auch wenn es den
 *  Menüpunkt gar nicht gibt: „Karte beenden…" existiert nur bei wiederkehrenden
 *  Karten. Bei einer einmaligen Karte war das eine Sackgasse mit Wegweiser
 *  ins Leere — und Karten aus einer Zahlung sind typischerweise einmalig.
 *
 *  `HAS_STATES` meint seit v2-20 nur noch Zustände aus VERGANGENEN Monaten;
 *  der Text nennt deshalb den Grund und nicht mehr die Mechanik. */
const GATE_REASON_TEXT: Record<DeleteGate["reasons"][number], string> = {
  HAS_LINKS: "Erst die zugeordnete Zahlung lösen",
  HAS_STATES: "Sie trägt vergangene Monate",
  HAS_PAST_PLAN: "Sie war in vergangenen Monaten eingeplant",
};

type CardInteractiveProps = {
  cardId: string;
  cardName: string;
  month: string; // "YYYY-MM-01"
  currentAmount: number;
  tappable: boolean;
  ariaLabel: string;
  /** Sprint 5: im aktuellen Monat verknüpfte Fragmente. Wenn länger 0,
   *  erscheint die Menüoption „Verknüpfte Fragmente". */
  linkedFragments?: LinkedFragmentRef[];
  /** v2-05 (vormals hideOnly): Ghost/Forecast-Karten — Menü zeigt nur die
   *  Lebenszyklus-Verben (Beenden/Löschen), kein Tap-Catcher, kein
   *  „Betrag anpassen". Hält die Affordance auf jeder Karte (L2.1). */
  endDeleteOnly?: boolean;
  /** v2-05: false bei ONCE-Karten (haben per Constraint ein festes Ende). */
  canEnd: boolean;
  /** v2-05: aktuelles Karten-Ende (für Undo + „Ende aufheben"). */
  currentLastMonth: string | null;
  /** v2-05: vorberechnetes Lösch-Tor; die RPC prüft autoritativ erneut. */
  deleteGate: DeleteGate;
  /** v2-15 (LQ-1): steuert, ob „Fällig am …" im Menü erscheint — auf
   *  BUDGET-Karten nicht (ein Budget ist eine Erlaubnis ohne Termin, L7). */
  cardType: CardType;
  /** v2-15 (LQ-1): aktueller Fälligkeitstag, Vorbelegung des Overlays. */
  currentDueDay: number | null;
  /** v2-17 (KAT-1): aktuelle Kategorie der Karte, `null` = „Ohne Kategorie". */
  currentCategoryId: string | null;
  /** v2-17 (KAT-1): alle Ordner des Nutzers, in Anzeige-Reihenfolge (C2). */
  categories: CardCategory[];
};

export function CardInteractive({
  cardId,
  cardName,
  month,
  currentAmount,
  tappable,
  ariaLabel,
  linkedFragments,
  endDeleteOnly = false,
  canEnd,
  currentLastMonth,
  deleteGate,
  cardType,
  currentDueDay,
  currentCategoryId,
  categories,
}: CardInteractiveProps) {
  const effectiveTappable = tappable && !endDeleteOnly;
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [dueDayOverlayOpen, setDueDayOverlayOpen] = useState(false);
  const [categoryOverlayOpen, setCategoryOverlayOpen] = useState(false);
  const [endOverlayOpen, setEndOverlayOpen] = useState(false);
  const [linkedOverlayOpen, setLinkedOverlayOpen] = useState(false);
  const iconRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const hasLinkedFragments = (linkedFragments?.length ?? 0) > 0;
  const showToast = useCardActionToast();

  // LL-5: Wenn der Monat wechselt (month-Prop ändert sich) oder die letzte
  // Verknüpfung weg ist, das Linked-Overlay schließen — sonst zeigt es Daten
  // aus dem vorherigen Monat / Zustand.
  useEffect(() => {
    setLinkedOverlayOpen(false);
  }, [month, hasLinkedFragments]);

  // Schließe Menü bei Klick außerhalb (Icon UND Menü)
  useEffect(() => {
    if (!menuOpen) return;
    function handleMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      const inIcon = iconRef.current?.contains(target) ?? false;
      const inMenu = menuRef.current?.contains(target) ?? false;
      if (!inIcon && !inMenu) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [menuOpen]);

  // ESC schließt Menü
  useEffect(() => {
    if (!menuOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  function handleContextIconClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      // Menü erscheint unterhalb des Icons (position: fixed)
      setMenuPos({ top: rect.bottom + 4, left: rect.left });
    }
    setMenuOpen(true);
  }

  function handleAdjustClick(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpen(false);
    setOverlayOpen(true);
  }

  function handleDueDayClick(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpen(false);
    setDueDayOverlayOpen(true);
  }

  function handleCategoryClick(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpen(false);
    setCategoryOverlayOpen(true);
  }

  function handleLinkedClick(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpen(false);
    setLinkedOverlayOpen(true);
  }

  function handleEndClick(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpen(false);
    setEndOverlayOpen(true);
  }

  /** Beenden bestätigt: Aktion sofort + 5s-Undo (setzt das vorherige Ende zurück). */
  function handleEndConfirm(lastMonth: string) {
    setEndOverlayOpen(false);
    const prev = currentLastMonth;
    showToast({
      text: `Karte »${cardName}« endet im ${lastMonth.slice(5, 7)}/${lastMonth.slice(0, 4)}`,
      run: () => endCardAction(cardId, lastMonth),
      undo: () => endCardAction(cardId, prev),
    });
  }

  function handleUnendClick(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpen(false);
    const prev = currentLastMonth;
    showToast({
      text: `Ende von »${cardName}« aufgehoben`,
      run: () => endCardAction(cardId, null),
      undo: () => endCardAction(cardId, prev),
    });
  }

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!deleteGate.deletable) return;
    setMenuOpen(false);
    showToast({
      text: `Karte »${cardName}« gelöscht`,
      run: () => deleteCardAction(cardId),
      undo: () => restoreCardAction(cardId),
    });
  }

  return (
    <>
      {/* Unsichtbarer Tap-Button über die gesamte Karte (nur für tappable Karten) */}
      {effectiveTappable && (
        <form action={toggleCardTap}>
          <input type="hidden" name="cardId" value={cardId} />
          <input type="hidden" name="month" value={month} />
          <button type="submit" className={styles.tapButton} aria-label={ariaLabel} />
        </form>
      )}

      {/* ⋯-Kontext-Icon (position: absolute, oben links, über dem Tap-Button via z-index) */}
      <button
        ref={iconRef}
        type="button"
        className={styles.contextIcon}
        onClick={handleContextIconClick}
        aria-label="Kartenoptionen"
        aria-expanded={menuOpen}
      >
        ···
      </button>

      {/* Kontext-Menü (Portal nach document.body — entkoppelt vom .card-DOM,
          damit transform/opacity am Vorfahren keinen neuen Containing-Block
          bzw. Stacking-Context für das position:fixed-Menü erzeugt. K2-Fix.) */}
      {menuOpen && menuPos && createPortal(
        <div
          ref={menuRef}
          className={styles.contextMenu}
          style={{ position: "fixed", top: menuPos.top, left: menuPos.left }}
          role="menu"
        >
          {!endDeleteOnly && hasLinkedFragments && (
            <button
              type="button"
              className={styles.contextMenuItem}
              onClick={handleLinkedClick}
              role="menuitem"
            >
              Verknüpfte Fragmente
            </button>
          )}
          {!endDeleteOnly && (
            <button
              type="button"
              className={styles.contextMenuItem}
              onClick={handleAdjustClick}
              role="menuitem"
            >
              Betrag anpassen
            </button>
          )}
          {/* v2-15 (LQ-1): „Fällig am …" — eigener Eintrag, NICHT in „Betrag
              anpassen". Dort hat alles Monats-Semantik, `cards.due_day` gilt
              immer (§7). Auf BUDGET-Karten erscheint er nicht: ein Budget ist
              eine Erlaubnis ohne Termin (Befund L7). Auf Ghost-Karten ebenso
              wenig — sie zeigen nur die Lebenszyklus-Verben (v2-05). */}
          {!endDeleteOnly && cardType !== "BUDGET" && (
            <button
              type="button"
              className={styles.contextMenuItem}
              onClick={handleDueDayClick}
              role="menuitem"
            >
              Fällig am …
            </button>
          )}
          {/* v2-17 (KAT-1): „Kategorie ändern …" — der einzige Ort, an dem eine
              Karte ihren Ordner wechselt und an dem neue Ordner entstehen
              (Record B8). Bewusst NICHT durch Ziehen: Das kollidierte mit dem
              Tap-Catcher, und ein missratener Zug schriebe stumm
              `manually_paid` (Befund U3).
              Auch auf Ghost-Karten sichtbar, anders als „Betrag anpassen" und
              „Fällig am …": Die Kategorie ist eine Eigenschaft der Karte, kein
              Monats-Zustand — man ordnet eine künftige Karte genauso ein wie
              eine laufende, und im Zukunftsmonat ist die Kartenmenge oft die
              vollständigste. */}
          <button
            type="button"
            className={styles.contextMenuItem}
            onClick={handleCategoryClick}
            role="menuitem"
          >
            Kategorie ändern …
          </button>
          {canEnd && (
            <button
              type="button"
              className={styles.contextMenuItem}
              onClick={handleEndClick}
              role="menuitem"
            >
              Karte beenden…
            </button>
          )}
          {canEnd && currentLastMonth !== null && (
            <button
              type="button"
              className={styles.contextMenuItem}
              onClick={handleUnendClick}
              role="menuitem"
            >
              Ende aufheben
            </button>
          )}
          <button
            type="button"
            className={`${styles.contextMenuItem}${deleteGate.deletable ? "" : ` ${styles.contextMenuItemDisabled}`}`}
            onClick={handleDeleteClick}
            role="menuitem"
            aria-disabled={!deleteGate.deletable}
            disabled={!deleteGate.deletable}
          >
            Karte löschen
          </button>
          {!deleteGate.deletable && (
            <div className={styles.contextMenuReason}>
              Nicht löschbar. {deleteGate.reasons.map((r) => GATE_REASON_TEXT[r]).join(" · ")}.
              {/* v2-20 (KU-2): Der Verweis auf „Karte beenden…" erscheint NUR,
                  wenn es den Menüpunkt oben tatsächlich gibt. Er hing vorher an
                  keiner Bedingung und schickte den Nutzer bei einmaligen Karten
                  zu etwas, das dort nie existiert. */}
              {canEnd && " Stattdessen »Karte beenden…«."}
              {!canEnd && " Sie bleibt als Beleg erhalten."}
            </div>
          )}
        </div>,
        document.body
      )}

      {/* Beenden-Overlay (v2-05) */}
      {endOverlayOpen && (
        <EndCardOverlay
          cardName={cardName}
          month={month}
          onConfirm={handleEndConfirm}
          onClose={() => setEndOverlayOpen(false)}
        />
      )}

      {/* Betrag-anpassen-Overlay */}
      {overlayOpen && (
        <AdjustAmountOverlay
          cardId={cardId}
          month={month}
          currentAmount={currentAmount}
          onClose={() => setOverlayOpen(false)}
        />
      )}

      {/* Fällig-am-Overlay (v2-15, LQ-1) */}
      {dueDayOverlayOpen && (
        <DueDayOverlay
          cardId={cardId}
          cardName={cardName}
          currentDueDay={currentDueDay}
          onClose={() => setDueDayOverlayOpen(false)}
        />
      )}

      {/* Kategorie-Overlay (v2-17, KAT-1) */}
      {categoryOverlayOpen && (
        <CategoryOverlay
          cardId={cardId}
          cardName={cardName}
          currentCategoryId={currentCategoryId}
          categories={categories}
          onClose={() => setCategoryOverlayOpen(false)}
        />
      )}

      {/* Verknüpfte-Fragmente-Overlay (Sprint 5) */}
      {linkedOverlayOpen && hasLinkedFragments && (
        <LinkedFragmentsOverlay
          cardName={cardName}
          cardId={cardId}
          linkedFragments={linkedFragments!}
          onClose={() => setLinkedOverlayOpen(false)}
        />
      )}
    </>
  );
}
