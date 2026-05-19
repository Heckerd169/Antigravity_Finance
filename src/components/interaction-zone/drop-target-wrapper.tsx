"use client";

import { useEffect, useRef, useState } from "react";
import { DRAG_MIME } from "./interaction-zone.types";
import { linkFragmentToCard } from "./actions";
import styles from "./interaction-zone.module.css";

type DropTargetWrapperProps = {
  cardId: string;
  /** false → kein Drop-Handler (Ghost-Card, Konflikt 3 §7). */
  active: boolean;
  /** "YYYY-MM-01" — wird als link_month gesetzt (A19 / Konflikt 4 §7). */
  targetDbMonth: string;
  /** "YYYY-MM" — bei Wechsel wird Drag-State zurückgesetzt (LL-5). */
  targetMonth: string;
  children: React.ReactNode;
};

export function DropTargetWrapper({
  cardId,
  active,
  targetDbMonth,
  targetMonth,
  children,
}: DropTargetWrapperProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  /** dragenter feuert auch auf Kinder → Counter (Stolperfalle F2). */
  const dragCounter = useRef(0);

  // LL-5: bei targetMonth-Wechsel Drag-Visual zurücksetzen.
  useEffect(() => {
    dragCounter.current = 0;
    setIsDragOver(false);
  }, [targetMonth]);

  if (!active) {
    // Ghost-Cards rendern direkt ohne Drop-Handler (Konflikt 3 §7).
    return <div className={styles.dropTargetWrap}>{children}</div>;
  }

  function isFragmentDrag(e: React.DragEvent<HTMLDivElement>): boolean {
    const types = e.dataTransfer?.types;
    if (!types) return false;
    for (let i = 0; i < types.length; i += 1) {
      if (types[i] === DRAG_MIME) return true;
    }
    return false;
  }

  function handleDragEnter(e: React.DragEvent<HTMLDivElement>) {
    if (!isFragmentDrag(e)) return;
    e.preventDefault();
    dragCounter.current += 1;
    if (dragCounter.current === 1) setIsDragOver(true);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    if (!isFragmentDrag(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    if (!isFragmentDrag(e)) return;
    e.preventDefault();
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) setIsDragOver(false);
  }

  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    if (!isFragmentDrag(e)) return;
    e.preventDefault();
    e.stopPropagation();
    const fragmentId = e.dataTransfer.getData(DRAG_MIME);
    dragCounter.current = 0;
    setIsDragOver(false);
    if (!fragmentId) return;
    // Server Action — bei Fehler nicht in der UI hängen lassen, sondern werfen
    // (LL-2). Next.js zeigt den Error im Dev-Overlay; im Prod sieht der User
    // einfach kein Update, was hier akzeptabel ist (keine destruktive Aktion).
    await linkFragmentToCard(fragmentId, cardId, targetDbMonth);
  }

  return (
    <div
      className={`${styles.dropTargetWrap} ${
        isDragOver ? styles.dropTargetActive : ""
      }`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
}
