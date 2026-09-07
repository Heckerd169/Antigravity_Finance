"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ToastTon } from "./zustand";
import styles from "./zuordnen.module.css";

/* Der Danach-Moment (Handoff §3): Nach dem Zuordnen erscheint über der
 * Tab-Leiste ein Toast mit „Zugeordnet · {Karte}" und der Wirkung auf die
 * Sparrate; „Rückgängig" gilt fünf Sekunden. „Später" bekommt denselben Toast
 * ohne Rückgängig.
 *
 * Der Toast lebt als Zustand im Bildschirm, nicht im Fokus-Element: Die
 * zugeordnete Zahlung verschwindet beim Neuaufbau nach `revalidatePath`, der
 * Toast überlebt das (Muster `CardActionToastProvider`). */

export type ToastInhalt = {
  titel: string;
  /** Zweite Zeile; `null` = nur der Titel (keine Null-Zeile, LL-20). */
  zeile: { text: string; ton: ToastTon } | null;
  /** `null` = ohne Rückgängig („Später"). */
  rueckgaengig: (() => void) | null;
};

type ToastZustand = ToastInhalt & { key: number; aus: boolean };

const SICHTBAR_MS = 5000;
const AUSBLENDEN_MS = 200;

export function useMobilToast() {
  const [toast, setToast] = useState<ToastZustand | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ausTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keyRef = useRef(0);

  const aufraeumen = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    if (ausTimer.current) clearTimeout(ausTimer.current);
    timer.current = null;
    ausTimer.current = null;
  }, []);

  const zeigen = useCallback(
    (inhalt: ToastInhalt) => {
      aufraeumen();
      keyRef.current += 1;
      setToast({ ...inhalt, key: keyRef.current, aus: false });
      timer.current = setTimeout(() => {
        setToast((cur) => (cur ? { ...cur, aus: true } : null));
        ausTimer.current = setTimeout(() => setToast(null), AUSBLENDEN_MS);
      }, SICHTBAR_MS);
    },
    [aufraeumen],
  );

  const schliessen = useCallback(() => {
    aufraeumen();
    setToast(null);
  }, [aufraeumen]);

  useEffect(() => aufraeumen, [aufraeumen]);

  return { toast, zeigen, schliessen };
}

export function MobilToast({
  toast,
  onRueckgaengig,
}: {
  toast: ToastZustand | null;
  onRueckgaengig: () => void;
}) {
  if (!toast) return null;
  const tonKlasse =
    toast.zeile?.ton === "rot"
      ? styles.toastRot
      : toast.zeile?.ton === "teal"
        ? styles.toastTeal
        : styles.toastNeutral;
  return (
    <div
      key={toast.key}
      className={`${styles.toast} ${toast.aus ? styles.toastAus : ""}`}
      role="status"
    >
      <div className={styles.toastZeilen}>
        <span className={styles.toastTitel}>{toast.titel}</span>
        {toast.zeile && (
          <span className={`${styles.toastZeile} ${tonKlasse}`}>{toast.zeile.text}</span>
        )}
      </div>
      {toast.rueckgaengig && (
        <button
          type="button"
          className={`${styles.knopf} ${styles.toastRueckgaengig}`}
          onClick={onRueckgaengig}
        >
          Rückgängig
        </button>
      )}
    </div>
  );
}
