"use client";

import { useState, useTransition } from "react";
import { setFragmentAssetReallocationAction } from "./actions";
import styles from "./interaction-zone.module.css";

/* Sprint v2-04 ② — Interim-Auslösung der Umschichtungs-Markierung.
   Bewusst schlicht: kleiner Text-Button auf der Fragment-Karte. Die finale
   Markier-Geste (Kontextmenü? Badge-Interaktion?) ist Design-Direktor-
   Territorium (Briefing §7) — diese Komponente ist der minimale Träger,
   damit der RPC-Fluss End-to-End läuft und der Scalable-Fall (E2:
   INTERNAL_TRANSFER → ASSET_REALLOCATION) markierbar ist. */

type AssetReallocationToggleProps = {
  fragmentId: string;
  /** true → Markierung setzen (aus UNASSIGNED oder INTERNAL_TRANSFER),
   *  false → Rücknahme (nur aus ASSET_REALLOCATION). */
  set: boolean;
};

export function AssetReallocationToggle({
  fragmentId,
  set,
}: AssetReallocationToggleProps) {
  const [isPending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    // Klick darf weder einen Fragment-Drag anstoßen noch andere
    // Karten-Handler treffen.
    e.preventDefault();
    e.stopPropagation();
    setFailed(false);
    startTransition(async () => {
      try {
        await setFragmentAssetReallocationAction(fragmentId, set);
      } catch (err) {
        // Kein Modal (§11-Linie); Fehlerzustand inline am Button.
        console.error("Umschichtungs-Markierung fehlgeschlagen", err);
        setFailed(true);
      }
    });
  }

  const label = failed
    ? "Fehler — erneut versuchen"
    : set
      ? "Als Umschichtung markieren"
      : "Umschichtung zurücknehmen";

  return (
    <button
      type="button"
      className={styles.arToggle}
      onClick={handleClick}
      disabled={isPending}
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      title="Interim-Auslösung — finale Geste folgt (DD)"
    >
      {isPending ? "…" : label}
    </button>
  );
}
