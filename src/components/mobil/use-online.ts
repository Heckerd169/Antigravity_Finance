"use client";

import { useEffect, useState } from "react";

/* Netzstatus des Geräts (Handoff „Zustände & Regeln · Offline", Record #4).
 *
 * Auf dem Server und beim ersten Rendern gilt „online" — sonst blitzte die
 * Offline-Pille bei jedem Aufbau kurz auf. Danach folgt der Wert dem Browser:
 * `navigator.onLine` plus die Ereignisse `online`/`offline`. Das ist eine
 * Aussage über die Verbindung des Geräts, nicht über die Erreichbarkeit der
 * Datenbank — für den Zweck hier („Zuordnen braucht Netz") reicht sie. */
export function useOnline(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const lesen = () => setOnline(typeof navigator === "undefined" ? true : navigator.onLine);
    lesen();
    window.addEventListener("online", lesen);
    window.addEventListener("offline", lesen);
    return () => {
      window.removeEventListener("online", lesen);
      window.removeEventListener("offline", lesen);
    };
  }, []);

  return online;
}
