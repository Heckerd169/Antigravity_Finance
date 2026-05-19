"use client";

import { useEffect, useRef, useState } from "react";
import { DRAG_MIME } from "./interaction-zone.types";
import styles from "./interaction-zone.module.css";

type EmptySlotProps = {
  /** "YYYY-MM" — bei Wechsel wird Drag-Visual zurückgesetzt (LL-5). */
  targetMonth: string;
  /** Direktklick → Direct-Create-Overlay öffnen. */
  onClick: () => void;
  /** Fragment-Drop → Recurrence-Popup öffnen. */
  onFragmentDrop: (fragmentId: string) => void;
};

export function EmptySlot({
  targetMonth,
  onClick,
  onFragmentDrop,
}: EmptySlotProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    dragCounter.current = 0;
    setIsDragOver(false);
  }, [targetMonth]);

  function isFragmentDrag(e: React.DragEvent<HTMLButtonElement>): boolean {
    const types = e.dataTransfer?.types;
    if (!types) return false;
    for (let i = 0; i < types.length; i += 1) {
      if (types[i] === DRAG_MIME) return true;
    }
    return false;
  }

  function handleDragEnter(e: React.DragEvent<HTMLButtonElement>) {
    if (!isFragmentDrag(e)) return;
    e.preventDefault();
    dragCounter.current += 1;
    if (dragCounter.current === 1) setIsDragOver(true);
  }

  function handleDragOver(e: React.DragEvent<HTMLButtonElement>) {
    if (!isFragmentDrag(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  function handleDragLeave(e: React.DragEvent<HTMLButtonElement>) {
    if (!isFragmentDrag(e)) return;
    e.preventDefault();
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent<HTMLButtonElement>) {
    if (!isFragmentDrag(e)) return;
    e.preventDefault();
    e.stopPropagation();
    const fragmentId = e.dataTransfer.getData(DRAG_MIME);
    dragCounter.current = 0;
    setIsDragOver(false);
    if (!fragmentId) return;
    onFragmentDrop(fragmentId);
  }

  return (
    <button
      type="button"
      className={`${styles.emptySlot} ${
        isDragOver ? styles.emptySlotDrag : ""
      }`}
      onClick={onClick}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-label="Neue Karte erstellen"
    >
      <div className={styles.slotPlus} aria-hidden="true">
        +
      </div>
      <div className={styles.slotLabel}>Neue Karte</div>
    </button>
  );
}
