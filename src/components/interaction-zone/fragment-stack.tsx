"use client";

import { useEffect, useState } from "react";
import { FragmentCard } from "./fragment-card";
import { FragmentShowcaseOverlay } from "./fragment-showcase-overlay";
import {
  DRAG_MIME,
  isTransferFragment,
  type FragmentRow,
} from "./interaction-zone.types";
import styles from "./interaction-zone.module.css";

type FragmentStackProps = {
  fragments: FragmentRow[];
  /** "YYYY-MM" — bei Wechsel wird Drag-Source-ID zurückgesetzt (LL-5). */
  targetMonth: string;
};

export function FragmentStack({ fragments, targetMonth }: FragmentStackProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  /* v2-07 C1: Übertrags-Fragmente (INTERNAL_TRANSFER + ASSET_REALLOCATION)
     sind aus der Arbeitsfläche ausgeblendet und nur über diesen Schalter
     sichtbar. Standard „aus" (Briefing §3.2).
     Bewusst KEIN LL-5-Reset auf targetMonth: LL-5 verlangt den Reset für
     Client-State, der monatsspezifisch ist. Eine Ansichts-Vorliebe ist das
     nicht — wer Überträge sehen will, will sie auch im Nachbarmonat sehen.
     Ein Neuladen der Seite setzt auf „aus" zurück. Keine localStorage-
     Persistierung (CLAUDE.md §7 „Was Claude Code NIE macht"). */
  const [showTransfers, setShowTransfers] = useState(false);
  /* v2-16 (RM-2): id des Fragments, dessen Schaufenster-Popup offen ist. */
  const [showcaseId, setShowcaseId] = useState<string | null>(null);

  // LL-5: bei Soft-Navigation State zurücksetzen. Der Monatswechsel tauscht die
  // Fragment-Liste komplett aus — ein offenes Popup zeigte danach eine Buchung,
  // die im neuen Monat gar nicht mehr im Stack steht.
  useEffect(() => {
    setDraggingId(null);
    setShowcaseId(null);
  }, [targetMonth]);

  /* Zähler beschreibt den Übertrags-Bestand des angezeigten Monats und ist
     deshalb von der Schalterstellung unabhängig (AC-C1.3). Der Filter ändert
     keine Reihenfolge — bei eingeschaltetem Schalter steht die Liste exakt so
     da wie vor v2-07 (AC-C1.4). */
  const transferCount = fragments.filter(isTransferFragment).length;
  const visibleFragments = showTransfers
    ? fragments
    : fragments.filter((f) => !isTransferFragment(f));

  function handleDragStart(e: React.DragEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    const card = target.closest<HTMLElement>("[data-fragment-id]");
    if (!card) return;
    const id = card.getAttribute("data-fragment-id");
    if (!id) return;
    // Sicherheits-Check: wenn die Karte als nicht-draggable gerendert wurde
    // (isLocked), nicht starten — Browser respektiert draggable=false bereits,
    // aber Defense-in-Depth.
    if (card.getAttribute("draggable") === "false") {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData(DRAG_MIME, id);
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(id);
  }

  function handleDragEnd() {
    setDraggingId(null);
  }

  /* v2-16 (RM-2): Klick auf ein Fragment öffnet das Schaufenster-Popup — für
     JEDES Fragment, auch für zugeordnete und Überträge. Bis v2-16 waren die
     beiden per `pointer-events: none` tot gestellt; diese Sperre ist aufgehoben
     (§8 „Klickbarkeit des Stacks", §11).
     Aufgehoben ist AUSSCHLIESSLICH die Klick-Sperre. Die Drag-Sperre hängt
     unverändert an `draggable={false}` in fragment-card.tsx plus dem
     Sicherheits-Check in handleDragStart, die Daten-Invariante am Trigger
     `trg_oqb_no_transfer_links`. Klickbar ≠ ziehbar ≠ verlinkbar.
     Delegation wie beim Drag-Start, damit FragmentCard eine Server-Component
     ohne eigene Handler bleiben kann. */
  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    /* Der Umschichtungs-Knopf trägt einen eigenen Handler und liegt INNERHALB
       der Karte — ohne diese Ausnahme öffnete jedes Markieren zusätzlich das
       Popup. */
    if (target.closest("button")) return;
    const card = target.closest<HTMLElement>("[data-fragment-id]");
    if (!card) return;
    const id = card.getAttribute("data-fragment-id");
    if (id) setShowcaseId(id);
  }

  const showcaseFragment =
    showcaseId !== null
      ? visibleFragments.find((f) => f.id === showcaseId) ?? null
      : null;

  return (
    <div className={styles.fragmentColumn}>
      {/* v2-07 C1: Schalter sitzt in derselben Zeile wie die Zonen-Überschrift,
          damit die Oberkanten der drei Zonen auf gleicher Höhe bleiben. Er wird
          nur gerendert, wenn der Monat überhaupt Überträge enthält (AC-C1.2) —
          sonst wäre er reines Rauschen. */}
      <div className={styles.fragmentZoneHeader}>
        <div className={`${styles.zoneLabel} ${styles.zoneLabelInline}`}>
          Rohmasse
        </div>
        {transferCount > 0 && (
          <label className={styles.transferToggle}>
            <input
              type="checkbox"
              className={styles.transferToggleInput}
              checked={showTransfers}
              onChange={(e) => setShowTransfers(e.target.checked)}
            />
            <span className={styles.transferToggleBox} aria-hidden="true" />
            <span>Überträge anzeigen ({transferCount})</span>
          </label>
        )}
      </div>
      <div
        className={styles.fragmentStack}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
      >
        {visibleFragments.length === 0 ? (
          /* v2-18: Die Spalte reserviert ihre Höhe jetzt immer (siehe
             `.fragmentStack` im CSS), damit die Ansicht beim Monatswechsel
             nicht springt. Eine große leere Fläche unter der Überschrift
             „ROHMASSE" sähe dadurch aus wie ein Ladefehler — dieser Satz sagt,
             dass alles in Ordnung ist.

             Er gilt bewusst für die ANGEZEIGTE Liste, nicht für den Bestand:
             Sind alle Umsätze des Monats Überträge und der Schalter steht auf
             „aus", ist die Liste ebenfalls leer, und derselbe Satz ist richtig.
             Der Schalter darüber nennt in dem Fall die Zahl und führt weiter. */
          <div className={styles.stackEmpty}>Keine offenen Umsätze</div>
        ) : (
          visibleFragments.map((f) => (
            <div
              key={f.id}
              className={
                draggingId === f.id ? styles.fragmentCardDragging : undefined
              }
            >
              <FragmentCard fragment={f} isLocked={f.status !== "UNASSIGNED"} />
            </div>
          ))
        )}
      </div>

      {showcaseFragment !== null && (
        <FragmentShowcaseOverlay
          fragment={showcaseFragment}
          onClose={() => setShowcaseId(null)}
        />
      )}
    </div>
  );
}
