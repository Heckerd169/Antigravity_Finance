"use client";

import { useEffect, useState } from "react";
import { FragmentCard } from "./fragment-card";
import { DRAG_MIME, type FragmentRow } from "./interaction-zone.types";
import styles from "./interaction-zone.module.css";

type FragmentStackProps = {
  fragments: FragmentRow[];
  /** "YYYY-MM" — bei Wechsel wird Drag-Source-ID zurückgesetzt (LL-5). */
  targetMonth: string;
};

export function FragmentStack({ fragments, targetMonth }: FragmentStackProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // LL-5: bei Soft-Navigation State zurücksetzen.
  useEffect(() => {
    setDraggingId(null);
  }, [targetMonth]);

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
      <div className={styles.zoneLabel}>Rohmasse</div>
      <div
        className={styles.fragmentStack}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {fragments.map((f) => (
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
