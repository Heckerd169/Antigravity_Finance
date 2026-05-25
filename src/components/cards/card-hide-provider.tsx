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
import { hideCard, unhideCard } from "./actions";
import styles from "./card-hide.module.css";

/** Aufruf aus dem Karten-Kontextmenü: Karte verbergen + Rückgängig-Toast zeigen. */
type RequestHide = (cardId: string, cardName: string) => void;

const CardHideContext = createContext<RequestHide>(() => {});

export function useCardHide(): RequestHide {
  return useContext(CardHideContext);
}

type ToastState = {
  cardId: string;
  cardName: string;
  key: number;
  exiting: boolean;
};

/**
 * Client-Provider rund um die Karten-Surfaces. Hält den 5s-Rückgängig-Toast
 * (unten Mitte, A9) außerhalb der Karten-DOM — die verborgene Karte verschwindet
 * via revalidatePath, der Toast überlebt das, weil er hier oben gerendert wird.
 *
 * Der Provider umschließt server-gerenderte children (InteractionZone); der
 * Client-Context fließt durch sie hindurch zu den CardInteractive-Leaves.
 */
export function CardHideProvider({ children }: { children: React.ReactNode }) {
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

  const requestHide = useCallback<RequestHide>(
    (cardId, cardName) => {
      clearTimer();
      keyRef.current += 1;
      setToast({ cardId, cardName, key: keyRef.current, exiting: false });
      hideCard(cardId).catch((e) => console.error("hideCard fehlgeschlagen", e));
      // Nach 5 s Fade-out einleiten (§5), dann nach 200 ms Exit-Animation entfernen.
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
        unhideCard(cur.cardId).catch((e) =>
          console.error("unhideCard fehlgeschlagen", e),
        );
      }
      return null; // §5: Toast schließt sofort
    });
    clearTimer();
  }, [clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  return (
    <CardHideContext.Provider value={requestHide}>
      {children}
      {toast &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            key={toast.key}
            className={`${styles.toast} ${toast.exiting ? styles.toastExiting : ""}`}
            role="status"
          >
            <span className={styles.toastText}>
              Karte&nbsp;»{toast.cardName}«&nbsp;ausgeblendet
            </span>
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
    </CardHideContext.Provider>
  );
}
