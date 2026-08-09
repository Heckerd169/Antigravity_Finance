"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DropTargetWrapper } from "./drop-target-wrapper";
import { EmptySlot } from "./empty-slot";
import { RecurrencePopup } from "./recurrence-popup";
import { DirectCreateOverlay } from "./direct-create-overlay";
import { CategoryTile } from "./category-tile";
import { NettoTile } from "./netto-tile";
import type { CategoryGroup } from "./category-groups";
import type { Liquidity } from "./liquidity";
import {
  DRAG_MIME,
  type FragmentRow,
  type IncomeSlotProps,
} from "./interaction-zone.types";
import { formatEuroRounded } from "@/lib/format";
import styles from "./interaction-zone.module.css";

type CarouselCardItem = {
  id: string;
  node: React.ReactNode;
};

/** Ein Ordner samt seiner fertig gerenderten Karten-Nodes. Die Karten selbst
 *  sind Server-Komponenten und werden hier nur durchgereicht (unverändertes
 *  Muster seit Sprint 4). */
export type CarouselGroup = CategoryGroup & {
  items: CarouselCardItem[];
};

type CarouselProps = {
  groups: CarouselGroup[];
  /** Wenn true, sind alle Karten Ghost-Cards (Forecast) — Drop-Target deaktiviert. */
  isFuture: boolean;
  targetMonth: string; // "YYYY-MM"
  targetDbMonth: string; // "YYYY-MM-01"
  /** Fragmente, sodass beim Empty-Slot-Drop das passende Fragment-Objekt für
   *  das Recurrence-Popup gefunden werden kann. */
  fragments: FragmentRow[];
  /** v2-15 (LQ-2): Ausstehend-Anzeige der Kopfzeile. `null` außerhalb des
   *  laufenden Monats — dort wird die Zeile gar nicht gerendert. */
  liquidity: Liquidity | null;
  /** v2-17 (KAT-2): für die Netto-Kachel im Ordner „Einkommen". */
  incomeSlot: IncomeSlotProps;
};

const SCROLL_STEP = 146; // 136 Karten-Breite + 10 Gap

export function Carousel({
  groups,
  isFuture,
  targetMonth,
  targetDbMonth,
  fragments,
  liquidity,
  incomeSlot,
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

  /* v2-17 (KAT-2), Record B7: Der Aufklapp-Zustand ÜBERLEBT den Monatswechsel.
   *
   * Das ist die bewusste Gegenentscheidung zu LL-5: Overlays werden per
   * `useEffect` auf `targetMonth` zurückgesetzt, weil sie Daten eines bestimmten
   * Monats zeigen. Der Aufklapp-Zustand zeigt keine Daten — er ist eine
   * Ansichts-Vorliebe, wie der Übertrags-Schalter (v2-07 C1), und der überlebt
   * ebenfalls. Wer an „Abos" arbeitet und Januar bis Juli durchgeht, will nicht
   * siebenmal neu aufklappen.
   *
   * Beim LADEN der Seite ist alles zu — der Startzustand ist das Versprechen:
   * elf Ordner statt 32 Karten. Deshalb keine Persistierung.
   *
   * Die Sorge aus Befund U10 („eine im August geöffnete Kategorie kann im
   * September leer sein") entschärft sich von selbst: Ein leerer Ordner wird
   * nach A8 gar nicht angezeigt, der Schlüssel läuft ins Leere und richtet
   * nichts an. */
  const [openKeys, setOpenKeys] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );

  /* Record B4: Beim Anfassen einer Zahlung öffnen sich ALLE Ordner, beim
   * Loslassen kehren sie in den vorherigen Zustand zurück.
   *
   * Das löst Befund U1 (BLOCKER): Ein Drop braucht eine Karten-ID, eine
   * zugeklappte Kategorie hat keine. HTML5-Drag kennt keinen Zustandswechsel
   * während des Ziehens — außer man macht ihn selbst, und genau das passiert
   * hier. `openKeys` bleibt dabei unangetastet, deshalb ist die Rückkehr
   * automatisch und braucht kein Gedächtnis.
   *
   * Beim Arbeiten ist alles offen, beim Ansehen ist es aufgeräumt. */
  const [dragActive, setDragActive] = useState(false);

  // LL-5: Overlays bei Monatswechsel schließen. `openKeys` bleibt bewusst
  // stehen (B7), `dragActive` wird zurückgesetzt — ein Zug kann einen
  // Monatswechsel nicht überdauern.
  useEffect(() => {
    setRecurrenceFragment(null);
    setDirectCreateOpen(false);
    setDragActive(false);
  }, [targetMonth]);

  useEffect(() => {
    function isFragmentDrag(e: DragEvent): boolean {
      const types = e.dataTransfer?.types;
      if (!types) return false;
      for (let i = 0; i < types.length; i += 1) {
        if (types[i] === DRAG_MIME) return true;
      }
      return false;
    }
    function handleDragStart(e: DragEvent) {
      // Der Handler der Fragment-Karte hat die Daten beim Hochblubbern schon
      // gesetzt — hier ist der MIME-Typ also bereits lesbar.
      if (isFragmentDrag(e)) setDragActive(true);
    }
    function handleDragEnd() {
      setDragActive(false);
    }
    document.addEventListener("dragstart", handleDragStart);
    // `dragend` feuert an der Quelle, `drop` am Ziel — beide werden gebraucht:
    // Ein Drop außerhalb eines gültigen Ziels löst nur `dragend` aus.
    document.addEventListener("dragend", handleDragEnd);
    document.addEventListener("drop", handleDragEnd);
    return () => {
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("dragend", handleDragEnd);
      document.removeEventListener("drop", handleDragEnd);
    };
  }, []);

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
    // Auf- und Zuklappen ändert die Gesamtbreite genauso wie eine neue Karte —
    // sonst blieben die Pfeile fälschlich deaktiviert.
  }, [recomputeScrollState, groups.length, openKeys, dragActive]);

  function scrollByStep(delta: number) {
    viewportRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  function toggleGroup(key: string) {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleEmptySlotDrop(fragmentId: string) {
    const fragment = fragments.find((f) => f.id === fragmentId);
    if (!fragment) return;
    setRecurrenceFragment(fragment);
  }

  return (
    <div className={styles.carouselColumn}>
      {/* v2-15 (LQ-2): Die Ausstehend-Anzeige sitzt in DERSELBEN Zeile wie die
          Zonen-Überschrift — dasselbe Muster wie der Übertrags-Schalter der
          Rohmasse (v2-07, C1), damit die Oberkanten der drei Zonen bündig
          bleiben und kein vierter waagerechter Bereich entsteht (§8).
          Nie eine Summe: Der eine Betrag sind Termine, der andere ist eine
          Erlaubnis (Befund L7). Deshalb auch zwei verschiedene Wörter — mit
          demselben Wort darüber lüden zwei Zahlen nebeneinander zum Addieren
          ein.

          v2-17 (Record B9): Diese Zeile bleibt von den Kategorien UNBERÜHRT.
          Sie summiert über alle aktiven Karten des Monats — ob eine Karte
          sichtbar ist oder in einem zugeklappten Ordner steckt, spielt keine
          Rolle. Sie ist eine Aussage über den MONAT, nicht über die ANSICHT. */}
      <div className={styles.carouselZoneHeader}>
        <div className={`${styles.zoneLabel} ${styles.zoneLabelInline}`}>
          Planung
        </div>
        {liquidity &&
          (liquidity.dueAmount !== null || liquidity.budgetFree !== null) && (
            <div className={styles.liquidityLine}>
              {liquidity.dueAmount !== null && (
                <div className={styles.liquidityGroup}>
                  <span className={styles.liquidityNum}>
                    {formatEuroRounded(liquidity.dueAmount)}
                  </span>
                  <span className={styles.liquidityWord}>noch fällig</span>
                </div>
              )}
              {liquidity.dueAmount !== null &&
                liquidity.budgetFree !== null && (
                  <div className={styles.liquiditySep} aria-hidden="true" />
                )}
              {liquidity.budgetFree !== null && (
                <div className={styles.liquidityGroup}>
                  <span className={styles.liquidityNum}>
                    {formatEuroRounded(liquidity.budgetFree)}
                  </span>
                  <span className={styles.liquidityWord}>Budget frei</span>
                </div>
              )}
            </div>
          )}
      </div>
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
          {groups.map((group) => {
            const isOpen = dragActive || openKeys.has(group.key);
            return (
              <div key={group.key} className={styles.catBlock}>
                <CategoryTile
                  group={group}
                  isOpen={isOpen}
                  onToggle={() => toggleGroup(group.key)}
                />

                {/* Record B5: Ein offener Ordner steht in einer KLAMMER — eine
                    durchgehende Grundlinie unter seinen Karten. Ohne sie
                    verliert man beim Weiterscrollen die Zuordnung: „Abos" ist
                    mit zehn Karten fast zwei Bildschirmbreiten lang, die Kachel
                    ist dann längst aus dem Bild. */}
                {isOpen && (
                  <div
                    className={`${styles.childGroup}${
                      group.offen !== null && group.offen > 0
                        ? ` ${styles.childGroupOpen}`
                        : ""
                    }`}
                  >
                    {group.kind === "INCOME" ? (
                      <NettoTile
                        amount={group.amount ?? 0}
                        isGhost={group.isGhost}
                        income={incomeSlot}
                      />
                    ) : (
                      group.items.map((item) => (
                        <DropTargetWrapper
                          key={item.id}
                          cardId={item.id}
                          active={!isFuture}
                          targetDbMonth={targetDbMonth}
                          targetMonth={targetMonth}
                        >
                          {item.node}
                        </DropTargetWrapper>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
