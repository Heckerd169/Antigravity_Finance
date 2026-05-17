"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./interaction-zone.module.css";

/* ============================================================
   Portal (Option-A-Stub) — Design-Doku §8 + §11.
   5 Zustände sichtbar; nur 3 davon (default, drag-over, processing→success)
   sind in V1 von Code-Logik triggerbar. Die 3 Fehler-Varianten sind nur
   über NODE_ENV-gated Dev-Buttons erreichbar.

   Kein File-Parser, kein DB-Call, kein FileReader (bewusst — Sprint 7).
   ============================================================ */

type PortalState =
  | "default"
  | "drag-over"
  | "processing"
  | "success"
  | "error-format"
  | "error-empty"
  | "error-corrupt";

const SUCCESS_MS = 1500;
const PROCESSING_MS = 2000;
const ERROR_MS = 4000;

type PortalProps = {
  /** "YYYY-MM" — bei Wechsel wird der Portal-State zurückgesetzt (LL-5). */
  targetMonth: string;
};

export function Portal({ targetMonth }: PortalProps) {
  const [state, setState] = useState<PortalState>("default");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** dragenter feuert auch auf Kinder → Counter, damit Border nicht flackert. */
  const dragCounter = useRef(0);

  // LL-5: Bei targetMonth-Wechsel hartes Reset (Timer + State).
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    dragCounter.current = 0;
    setState("default");
  }, [targetMonth]);

  // Cleanup beim Unmount — vermeidet Memory-Leak.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function runSuccessSequence() {
    clearTimer();
    setState("processing");
    timerRef.current = setTimeout(() => {
      setState("success");
      timerRef.current = setTimeout(() => {
        setState("default");
        timerRef.current = null;
      }, SUCCESS_MS);
    }, PROCESSING_MS);
  }

  function runErrorSequence(kind: "format" | "empty" | "corrupt") {
    clearTimer();
    setState(`error-${kind}` as PortalState);
    timerRef.current = setTimeout(() => {
      setState("default");
      timerRef.current = null;
    }, ERROR_MS);
  }

  function handleDragEnter(e: React.DragEvent<HTMLDivElement>) {
    // Nur CSV-/File-Drags reagieren — Fragment-Drags haben unseren MIME-Type.
    if (!hasFileTransfer(e)) return;
    e.preventDefault();
    dragCounter.current += 1;
    if (state === "default") setState("drag-over");
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    // dragover muss preventDefault() rufen, damit drop feuert.
    if (!hasFileTransfer(e)) return;
    e.preventDefault();
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    if (!hasFileTransfer(e)) return;
    e.preventDefault();
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0 && state === "drag-over") {
      setState("default");
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    if (!hasFileTransfer(e)) return;
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    runSuccessSequence();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Eingabewert leeren, damit derselbe Filename erneut ausgewählt werden kann.
    e.target.value = "";
    runSuccessSequence();
  }

  const stateClass = stateClassNameFor(state);
  const isLocked = state !== "default" && state !== "drag-over";
  const showPulse = state === "processing";
  const { label, subLabel } = visualLabelsFor(state);

  return (
    <div className={styles.portalColumn}>
      <div className={styles.zoneLabel}>Import</div>
      <div
        className={`${styles.portal} ${stateClass}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-live="polite"
      >
        <input
          type="file"
          accept=".csv"
          className={`${styles.portalFileInput} ${
            isLocked ? styles.portalFileInputLocked : ""
          }`}
          onChange={handleFileChange}
          aria-label="CSV-Datei auswählen"
          tabIndex={isLocked ? -1 : 0}
        />
        <div
          className={`${styles.portalIcon} ${
            showPulse ? styles.portalPulsing : ""
          }`}
        >
          <PortalGlyph state={state} />
        </div>
        <div className={styles.portalLabel}>{label}</div>
        <div className={styles.portalSubLabel}>{subLabel}</div>
      </div>

      {process.env.NODE_ENV === "development" && (
        <PortalDevButtons
          onTriggerError={runErrorSequence}
          onTriggerSuccess={runSuccessSequence}
        />
      )}
    </div>
  );
}

// ── Visuals ─────────────────────────────────────────────────────────────────

function stateClassNameFor(s: PortalState): string {
  switch (s) {
    case "drag-over":
      return styles.portalDragOver;
    case "processing":
      return styles.portalProcessing;
    case "success":
      return styles.portalSuccess;
    case "error-format":
    case "error-empty":
    case "error-corrupt":
      return styles.portalError;
    default:
      return "";
  }
}

function visualLabelsFor(s: PortalState): { label: string; subLabel: string } {
  switch (s) {
    case "drag-over":
      return { label: "Loslassen zum Import", subLabel: "CSV wird erkannt" };
    case "processing":
      return { label: "Wird verarbeitet…", subLabel: "Fragmente werden erkannt" };
    case "success":
      return {
        label: "Import erfolgreich",
        subLabel: "Fragmente erscheinen im Stack",
      };
    case "error-format":
      return {
        label: "Format nicht erkannt",
        subLabel: "Bitte CSV-Datei verwenden",
      };
    case "error-empty":
      return {
        label: "Keine Transaktionen",
        subLabel: "Datei enthält keine Einträge",
      };
    case "error-corrupt":
      return {
        label: "Datei fehlerhaft",
        subLabel: "Datei konnte nicht gelesen werden",
      };
    default:
      return {
        label: "CSV ablegen oder klicken",
        subLabel: "Kontoauszug importieren",
      };
  }
}

function PortalGlyph({ state }: { state: PortalState }) {
  if (state === "success") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path
          d="M5 9l3 3 5-5"
          stroke="rgba(62,207,175,.9)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (
    state === "error-format" ||
    state === "error-empty" ||
    state === "error-corrupt"
  ) {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path
          d="M9 5v5M9 12.5v.5"
          stroke="rgba(255,99,88,.85)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (state === "processing") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle
          cx="9"
          cy="9"
          r="5"
          stroke="rgba(255,255,255,.35)"
          strokeWidth="1.3"
          strokeDasharray="20"
        />
      </svg>
    );
  }
  if (state === "drag-over") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path
          d="M9 2v10M6 8l3-3 3 3"
          stroke="rgba(62,207,175,.8)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 13h12"
          stroke="rgba(62,207,175,.5)"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  // default
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M9 3v9M6 9l3-3 3 3"
        stroke="rgba(255,255,255,.4)"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 13h12"
        stroke="rgba(255,255,255,.22)"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Dev-Buttons (NODE_ENV === "development") ────────────────────────────────

function PortalDevButtons({
  onTriggerError,
  onTriggerSuccess,
}: {
  onTriggerError: (kind: "format" | "empty" | "corrupt") => void;
  onTriggerSuccess: () => void;
}) {
  return (
    <>
      <div className={styles.devButtonLabel}>Zustand simulieren</div>
      <div className={styles.devButtons}>
        <button
          type="button"
          className={styles.devButton}
          onClick={onTriggerSuccess}
        >
          Erfolg
        </button>
        <button
          type="button"
          className={styles.devButton}
          onClick={() => onTriggerError("format")}
        >
          Fehler: Format
        </button>
        <button
          type="button"
          className={styles.devButton}
          onClick={() => onTriggerError("empty")}
        >
          Fehler: Leer
        </button>
        <button
          type="button"
          className={styles.devButton}
          onClick={() => onTriggerError("corrupt")}
        >
          Fehler: Korrupt
        </button>
      </div>
    </>
  );
}

// ── Helper ──────────────────────────────────────────────────────────────────

/** dataTransfer.types enthält "Files" wenn ein OS-File gezogen wird.
 *  Fragmente nutzen unseren MIME-Type, deshalb hier explizit auf "Files"
 *  prüfen — sonst würde der Portal-Drag-Over auch bei Fragment-Drag triggern. */
function hasFileTransfer(e: React.DragEvent<HTMLDivElement>): boolean {
  const types = e.dataTransfer?.types;
  if (!types) return false;
  for (let i = 0; i < types.length; i += 1) {
    if (types[i] === "Files") return true;
  }
  return false;
}
