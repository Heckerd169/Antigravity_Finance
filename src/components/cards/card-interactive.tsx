"use client";

import { useEffect, useRef, useState } from "react";
import { toggleCardTap } from "./actions";
import { AdjustAmountOverlay } from "./adjust-amount-overlay";
import styles from "./cards.module.css";

type CardInteractiveProps = {
  cardId: string;
  month: string; // "YYYY-MM-01"
  currentAmount: number;
  tappable: boolean;
  ariaLabel: string;
};

export function CardInteractive({
  cardId,
  month,
  currentAmount,
  tappable,
  ariaLabel,
}: CardInteractiveProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const iconRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <>
      {/* Unsichtbarer Tap-Button über die gesamte Karte (nur für tappable Karten) */}
      {tappable && (
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

      {/* Kontext-Menü (position: fixed — verhindert Clipping durch Carousel overflow) */}
      {menuOpen && menuPos && (
        <div
          ref={menuRef}
          className={styles.contextMenu}
          style={{ position: "fixed", top: menuPos.top, left: menuPos.left }}
          role="menu"
        >
          <button
            type="button"
            className={styles.contextMenuItem}
            onClick={handleAdjustClick}
            role="menuitem"
          >
            Betrag anpassen
          </button>
        </div>
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
    </>
  );
}
