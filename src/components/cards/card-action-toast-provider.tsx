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

/** v2-25 (KJ-1): eine zweite Zeile, die erst NACH der Aktion feststeht.
 *
 *  Der Toast erscheint sofort mit seinem Titel; was die Aktion bewirkt hat,
 *  weiß erst die Datenbank. `run` darf deshalb eine Nachlieferung zurückgeben,
 *  die dann unter dem Titel erscheint.
 *
 *  Der TEXT entsteht beim Aufrufer, nicht hier. Der Provider kennt weder
 *  Sparraten noch Monate — er weiß nur, dass eine Zeile nachkommen kann und
 *  welchen Ton sie hat. Dieselbe Trennung wie bei `text`. */
export type CardActionToastFollowUp = {
  text: string;
  /** `positive` = türkis (Entlastung), `negative` = rot (Belastung). Die
   *  Farbregel stammt aus §10 und ist in §7 für das Löschen übernommen. */
  tone: "positive" | "negative";
};

/** v2-05: generalisierter Aktions-Toast (vorher Verbergen-only, Sprint 10).
 *  Eine Lebenszyklus-Aktion (Löschen/Beenden) wird sofort ausgeführt und
 *  bekommt 5 s lang einen Rückgängig-Knopf. */
export type CardActionToastRequest = {
  /** Toast-Text, fertig formuliert (inkl. Kartenname). */
  text: string;
  /** Die eigentliche Server-Action — wird sofort gestartet. Gibt sie eine
   *  Nachlieferung zurück, erscheint diese als zweite Zeile; `void` lässt den
   *  Toast einzeilig. Der leere Fall zeigt bewusst NICHTS statt einer
   *  Null-Zeile (§7 Regel 17 / LL-20). */
  run: () => Promise<CardActionToastFollowUp | void>;
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
  followUp: CardActionToastFollowUp | null;
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
      const myKey = keyRef.current;
      setToast({ text, undo, key: myKey, exiting: false, followUp: null });
      run()
        .then((followUp) => {
          if (!followUp) return;
          // v2-25 (KJ-1): Die Nachlieferung darf NUR den Toast treffen, der sie
          // ausgelöst hat. Dazwischen kann der Nutzer „Rückgängig" gedrückt
          // (Toast null) oder eine zweite Karte gelöscht haben (neuer Key) —
          // in beiden Fällen gehörte die Zeile zu einem Vorgang, den es nicht
          // mehr gibt. Die Messung dauert rund 400 ms, das Fenster ist real.
          setToast((cur) => (cur && cur.key === myKey ? { ...cur, followUp } : cur));
        })
        .catch((e) => console.error("Karten-Aktion fehlgeschlagen", e));
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
            {/* v2-25 (KJ-1): Titel und Folge stehen untereinander, `Rückgängig`
                bleibt rechts daneben. Die zweite Zeile kommt erst nach der
                Messung dazu — der Toast wächst dann um eine Zeile nach oben,
                statt beim Erscheinen auf sie zu warten. */}
            <div className={styles.toastLines}>
              <span className={styles.toastText}>{toast.text}</span>
              {toast.followUp && (
                <span
                  className={`${styles.toastEffect} ${
                    toast.followUp.tone === "positive"
                      ? styles.toastEffectPositive
                      : styles.toastEffectNegative
                  }`}
                >
                  {toast.followUp.text}
                </span>
              )}
            </div>
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
