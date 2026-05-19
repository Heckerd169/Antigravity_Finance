"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DropTargetWrapper } from "./drop-target-wrapper";
import { EmptySlot } from "./empty-slot";
import { RecurrencePopup } from "./recurrence-popup";
import { DirectCreateOverlay } from "./direct-create-overlay";
import type { FragmentRow } from "./interaction-zone.types";
import styles from "./interaction-zone.module.css";

type CarouselCardItem = {
  id: string;
  node: React.ReactNode;
};

type CarouselProps = {
  items: CarouselCardItem[];
  /** Wenn true, sind alle Karten Ghost-Cards (Forecast) — Drop-Target deaktiviert. */
  isFuture: boolean;
  targetMonth: string; // "YYYY-MM"
  targetDbMonth: string; // "YYYY-MM-01"
  /** Fragmente, sodass beim Empty-Slot-Drop das passende Fragment-Objekt für
   *  das Recurrence-Popup gefunden werden kann. */
  fragments: FragmentRow[];
};

const SCROLL_STEP = 146; // 136 Karten-Breite + 10 Gap

export function Carousel({
  items,
  isFuture,
  targetMonth,
  targetDbMonth,
  fragments,
}: CarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  });
  const [recurrenceFragment, setRecurrenceFragment] = useState<FragmentRow | null>(
    null,
  );
  const [directCreateOpen, setDirectCreateOpen] = useState(false);

  // LL-5: Overlays bei Monatswechsel schließen.
  useEffect(() => {
    setRecurrenceFragment(null);
    setDirectCreateOpen(false);
  }, [targetMonth]);

  const recomputeScrollState = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const canLeft = vp.scrollLeft > 0;
    const canRight = vp.scrollLeft + vp.clientWidth < vp.scrollWidth - 1;
    setScrollState((prev) =>
      prev.canScrollLeft === canLeft && prev.canScrollRight === canRight
        ? prev
        : { canScrollLeft: canLeft, canScrollRight: canRight },
    );
  }, []);

  useEffect(() => {
    recomputeScrollState();
    const vp = viewportRef.current;
    if (!vp) return;
    const onScroll = () => recomputeScrollState();
    vp.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => recomputeScrollState();
    window.addEventListener("resize", onResize);
    return () => {
      vp.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
    // items.length triggert Re-Compute, falls neue Karte hinzukommt
  }, [recomputeScrollState, items.length]);

  function scrollByStep(delta: number) {
    viewportRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  function handleEmptySlotDrop(fragmentId: string) {
    const fragment = fragments.find((f) => f.id === fragmentId);
    if (!fragment) return;
    setRecurrenceFragment(fragment);
  }

  return (
    <div className={styles.carouselColumn}>
      <div className={styles.zoneLabel}>Planung</div>
      <div className={styles.carouselRow}>
        <button
          type="button"
          className={styles.chevButton}
          onClick={() => scrollByStep(-SCROLL_STEP)}
          disabled={!scrollState.canScrollLeft}
          aria-label="Vorherige Karten"
        >
          <ChevronLeft />
        </button>

        <div ref={viewportRef} className={styles.cardsViewport}>
          {items.map((item) => (
            <DropTargetWrapper
              key={item.id}
              cardId={item.id}
              active={!isFuture}
              targetDbMonth={targetDbMonth}
              targetMonth={targetMonth}
            >
              {item.node}
            </DropTargetWrapper>
          ))}
          <EmptySlot
            targetMonth={targetMonth}
            onClick={() => setDirectCreateOpen(true)}
            onFragmentDrop={handleEmptySlotDrop}
          />
        </div>

        <button
          type="button"
          className={styles.chevButton}
          onClick={() => scrollByStep(SCROLL_STEP)}
          disabled={!scrollState.canScrollRight}
          aria-label="Nächste Karten"
        >
          <ChevronRight />
        </button>
      </div>

      {recurrenceFragment && (
        <RecurrencePopup
          fragment={recurrenceFragment}
          targetMonth={targetMonth}
          targetDbMonth={targetDbMonth}
          onClose={() => setRecurrenceFragment(null)}
        />
      )}

      {directCreateOpen && (
        <DirectCreateOverlay
          targetMonth={targetMonth}
          targetDbMonth={targetDbMonth}
          onClose={() => setDirectCreateOpen(false)}
        />
      )}
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M7.5 9.5L4.5 6.5L7.5 3.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M4.5 3.5L7.5 6.5L4.5 9.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
