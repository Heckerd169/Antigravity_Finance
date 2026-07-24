"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import styles from "./card-action-toast.module.css";

/** v2-05: generalisierter Aktions-Toast (vorher Verbergen-only, Sprint 10).
 *  Eine Lebenszyklus-Aktion (Löschen/Beenden) wird sofort ausgeführt und
 *  bekommt 5 s lang einen Rückgängig-Knopf. */
export type CardActionToastRequest = {
  /** Toast-Text, fertig formuliert (inkl. Kartenname). */
  text: string;
  /** Die eigentliche Server-Action — wird sofort gestartet. */
  run: () => Promise<void>;
  /** Rückgängig-Server-Action für den Undo-Knopf. */
  undo: () => Promise<void>;
};

type ShowToast = (req: CardActionToastRequest) => void;

const CardActionToastContext = createContext<ShowToast>(() => {});

export function useCardActionToast(): ShowToast {
  return useContext(CardActionToastContext);
}

type ToastState = {
  text: string;
  undo: () => Promise<void>;
  key: number;
  exiting: boolean;
};

/**
 * Client-Provider rund um die Karten-Surfaces. Hält den 5s-Rückgängig-Toast
 * (unten Mitte, Sprint-10-Pattern) außerhalb der Karten-DOM — die betroffene
 * Karte verschwindet via revalidatePath, der Toast überlebt das hier oben.
 */
export function CardActionToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keyRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  }, []);

  const showToast = useCallback<ShowToast>(
    ({ text, run, undo }) => {
      clearTimer();
      keyRef.current += 1;
      setToast({ text, undo, key: keyRef.current, exiting: false });
      run().catch((e) => console.error("Karten-Aktion fehlgeschlagen", e));
      // Nach 5 s Fade-out einleiten, dann nach 200 ms Exit-Animation entfernen.
      timerRef.current = setTimeout(() => {
        setToast((cur) => (cur ? { ...cur, exiting: true } : null));
        exitTimerRef.current = setTimeout(() => setToast(null), 200);
        timerRef.current = null;
      }, 5000);
    },
    [clearTimer],
  );

  const handleUndo = useCallback(() => {
    setToast((cur) => {
      if (cur) {
        cur.undo().catch((e) => console.error("Rückgängig fehlgeschlagen", e));
      }
      return null; // Toast schließt sofort
    });
    clearTimer();
  }, [clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  return (
    <CardActionToastContext.Provider value={showToast}>
      {children}
      {toast &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            key={toast.key}
            className={`${styles.toast} ${toast.exiting ? styles.toastExiting : ""}`}
            role="status"
          >
            <span className={styles.toastText}>{toast.text}</span>
            <button
              type="button"
              className={styles.undoButton}
              onClick={handleUndo}
            >
              Rückgängig
            </button>
            <span className={styles.progress} />
          </div>,
          document.body,
        )}
    </CardActionToastContext.Provider>
  );
}
