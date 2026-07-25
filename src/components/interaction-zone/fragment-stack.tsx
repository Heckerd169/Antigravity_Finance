"use client";

import { useEffect, useState } from "react";
import { FragmentCard } from "./fragment-card";
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

  // LL-5: bei Soft-Navigation State zurücksetzen.
  useEffect(() => {
    setDraggingId(null);
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
      >
        {visibleFragments.map((f) => (
          <div
            key={f.id}
            className={
              draggingId === f.id ? styles.fragmentCardDragging : undefined
            }
          >
            <FragmentCard fragment={f} isLocked={f.status !== "UNASSIGNED"} />
          </div>
        ))}
      </div>
    </div>
  );
}
