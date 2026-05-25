"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toggleCardTap } from "./actions";
import { useCardHide } from "./card-hide-provider";
import { AdjustAmountOverlay } from "./adjust-amount-overlay";
import { LinkedFragmentsOverlay } from "@/components/interaction-zone/linked-fragments-overlay";
import type { LinkedFragmentRef } from "./cards.types";
import styles from "./cards.module.css";

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
  /** Sprint 10: Ghost/Forecast-Karten — Menü zeigt NUR „Verbergen", kein
   *  Tap-Catcher, kein „Betrag anpassen". Hält das Hide-Affordance auf jeder
   *  Karte (L2.1) ohne Ghost-Karten sonst interaktiv zu machen. */
  hideOnly?: boolean;
};

export function CardInteractive({
  cardId,
  cardName,
  month,
  currentAmount,
  tappable,
  ariaLabel,
  linkedFragments,
  hideOnly = false,
}: CardInteractiveProps) {
  const effectiveTappable = tappable && !hideOnly;
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [linkedOverlayOpen, setLinkedOverlayOpen] = useState(false);
  const iconRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const hasLinkedFragments = (linkedFragments?.length ?? 0) > 0;
  const requestHide = useCardHide();

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

  function handleLinkedClick(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpen(false);
    setLinkedOverlayOpen(true);
  }

  function handleHideClick(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpen(false);
    requestHide(cardId, cardName);
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
          {!hideOnly && hasLinkedFragments && (
            <button
              type="button"
              className={styles.contextMenuItem}
              onClick={handleLinkedClick}
              role="menuitem"
            >
              Verknüpfte Fragmente
            </button>
          )}
          {!hideOnly && (
            <button
              type="button"
              className={styles.contextMenuItem}
              onClick={handleAdjustClick}
              role="menuitem"
            >
              Betrag anpassen
            </button>
          )}
          <button
            type="button"
            className={styles.contextMenuItem}
            onClick={handleHideClick}
            role="menuitem"
          >
            Verbergen
          </button>
        </div>,
        document.body
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

      {/* Verknüpfte-Fragmente-Overlay (Sprint 5) */}
      {linkedOverlayOpen && hasLinkedFragments && (
        <LinkedFragmentsOverlay
          cardName={cardName}
          linkedFragments={linkedFragments!}
          onClose={() => setLinkedOverlayOpen(false)}
        />
      )}
    </>
  );
}
