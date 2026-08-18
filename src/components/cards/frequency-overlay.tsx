"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { setCardFrequencyAction } from "./actions";
import type { CardFrequency } from "./cards.types";
import type { FrequencyEffect } from "@/lib/rpc";
import styles from "./cards.module.css";

/** Dieselbe Reihenfolge und dieselben Wörter wie beim Anlegen (§12.4) — ein
 *  zweiter Wortschatz für denselben Begriff wäre genau die Art Abweichung, die
 *  man erst bemerkt, wenn jemand danach sucht. */
const FREQUENCY_LABELS: Record<CardFrequency, string> = {
  MONTHLY: "Monatlich",
  QUARTERLY: "Quartalsweise",
  SEMIANNUAL: "Halbjährlich",
  ANNUAL: "Jährlich",
  ONCE: "Einmalig",
};

const REIHENFOLGE: CardFrequency[] = [
  "MONTHLY",
  "QUARTERLY",
  "SEMIANNUAL",
  "ANNUAL",
  "ONCE",
];

type FrequencyOverlayProps = {
  cardId: string;
  cardName: string;
  currentFrequency: CardFrequency;
  /** "YYYY-MM-01" — bestimmt das Jahr, über das die Wirkung gemessen wird. */
  month: string;
  /** Meldet die Sparraten-Wirkung zurück, damit der Aufrufer sie im Toast
   *  zeigen kann. `months === 0` heißt „keine Bewegung" — dann bleibt der Toast
   *  einzeilig (§7 Regel 17 / LL-20). */
  onDone: (effect: FrequencyEffect) => void;
  onClose: () => void;
};

/** v2-26: „Wiederholung ändern …" — die Frequenz einer bestehenden Karte.
 *
 *  ── WARUM ES DAS GEBEN MUSS ────────────────────────────────────────────────
 *
 *  Bis v2-26 war die Frequenz nach dem Anlegen ENDGÜLTIG. Wer sich vertat — und
 *  der Default ist „Monatlich", man vertut sich also durch Nichtstun —, konnte
 *  die Karte nur löschen und neu anlegen. Genau das ist dem Nutzer mit
 *  `Privathaftpflicht` passiert: quartalsweise gewollt, monatlich gespeichert,
 *  und beim Löschversuch sperrte zusätzlich ein leerer Monats-Zustand. Zwei
 *  Sackgassen hintereinander für eine Karte, die nur falsch stand.
 *
 *  ── WARUM EIN OVERLAY UND KEIN UNTERMENÜ ───────────────────────────────────
 *
 *  Die Änderung BEWEGT DIE SPARRATE, und zwar erheblich: monatlich → jährlich
 *  nimmt elf Monate aus dem Jahr. Das gehört gezeigt, bevor es passiert —
 *  deshalb `…` im Menüpunkt (in dieser App das Zeichen für „öffnet einen
 *  Dialog", §12.4) und deshalb der Toast mit der Wirkung danach.
 *
 *  ── WAS SIE NICHT IST ──────────────────────────────────────────────────────
 *
 *  Keine Zeitreihe. `cards.frequency` gilt IMMER, rückwirkend wie künftig —
 *  dieselbe Eigenschaft wie `due_day` und `category_id`, und derselbe Grund für
 *  ein eigenes Overlay statt eines Platzes in „Betrag anpassen", wo alles
 *  entweder *nur dieser Monat* oder *dauerhaft ab diesem Monat* ist. */
export function FrequencyOverlay({
  cardId,
  cardName,
  currentFrequency,
  month,
  onDone,
  onClose,
}: FrequencyOverlayProps) {
  const [selected, setSelected] = useState<CardFrequency>(currentFrequency);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Escape schließt — wie bei allen Overlays seit v2-16.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleApply(e: React.MouseEvent) {
    e.stopPropagation();
    if (selected === currentFrequency) {
      onClose();
      return;
    }
    setError(null);
    const year = Number(month.slice(0, 4));
    startTransition(async () => {
      try {
        const effect = await setCardFrequencyAction(cardId, selected, year);
        onDone(effect);
        onClose();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Wiederholung konnte nicht geändert werden.",
        );
      }
    });
  }

  return createPortal(
    <div
      className={styles.overlayBackdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
    >
      <div
        className={styles.overlayModal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.overlayTitle}>Wiederholung</div>

        {/* Wie bei „Fällig am": Die Unterzeile beantwortet die Frage, bevor sie
            entsteht. Eine Frequenz gilt nicht ab diesem Monat — sie gilt. */}
        <div className={styles.overlayCurrentValue}>
          {cardName} · gilt für alle Monate
        </div>

        <div className={styles.overlayFrequencyGrid}>
          {REIHENFOLGE.map((f) => (
            <button
              key={f}
              type="button"
              className={`${styles.overlayFrequencyButton}${
                selected === f ? ` ${styles.overlayFrequencyButtonSelected}` : ""
              }`}
              onClick={() => setSelected(f)}
              disabled={isPending}
              aria-pressed={selected === f}
            >
              {FREQUENCY_LABELS[f]}
            </button>
          ))}
        </div>

        {/* Ehrlichkeit vor Beruhigung: Die Änderung wirkt rückwirkend, und das
            ist bei einer Karte mit Vergangenheit eine spürbare Bewegung. Wie
            groß, sagt der Toast danach — hier steht nur, DASS es passiert. */}
        <div className={styles.overlayHint}>
          Gilt auch für vergangene Monate. Wie sich die Sparrate dadurch ändert,
          steht gleich in der Meldung.
        </div>

        {error && <div className={styles.overlayInputErrorText}>{error}</div>}

        <div className={styles.overlayActions}>
          <button
            type="button"
            className={styles.overlayActionButton}
            onClick={handleApply}
            disabled={isPending}
          >
            Übernehmen
          </button>
        </div>

        <button
          type="button"
          className={styles.overlayCancelButton}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          disabled={isPending}
        >
          Abbrechen
        </button>
      </div>
    </div>,
    document.body,
  );
}
