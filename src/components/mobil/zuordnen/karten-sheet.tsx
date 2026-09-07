"use client";

import { useEffect } from "react";
import { GRUPPEN_REIHENFOLGE, gruppenTitel } from "./gruppen";
import type { SheetKarte } from "./zuordnen.types";
import styles from "./zuordnen.module.css";

/* Sheet „Karte wählen" (Handoff §2, Record #7): von unten, auf --bg-elevated,
 * Karten nach Typ gruppiert, rechts der Rest — „unbezahlt" bei Fixkosten,
 * „frei" bei Budget und Einmalig, „Einnahme" bei Einnahmen (Record #11). Ein
 * Tipp auf eine Zeile ordnet zu; Scrim-Tipp, „Abbrechen" und Escape schließen.
 *
 * Nur Karten, die im Monat aktiv sind — die Liste kommt fertig vom Server.
 * Keine Kartenanlage auf /mobil (Record #8). */

type Props = {
  offen: boolean;
  karten: SheetKarte[];
  kontext: string;
  onSchliessen: () => void;
  onWahl: (karte: SheetKarte) => void;
};

export function KartenSheet({ offen, karten, kontext, onSchliessen, onWahl }: Props) {
  useEffect(() => {
    if (!offen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSchliessen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [offen, onSchliessen]);

  if (!offen) return null;

  const gruppen = GRUPPEN_REIHENFOLGE.map((g) => ({
    id: g,
    titel: gruppenTitel(g),
    karten: karten.filter((k) => k.gruppe === g),
  })).filter((g) => g.karten.length > 0);

  return (
    <>
      <div className={styles.scrim} onClick={onSchliessen} aria-hidden="true" />
      <div className={styles.sheet} role="dialog" aria-modal="true" aria-label="Karte wählen">
        <div className={styles.griff} aria-hidden="true" />
        <div className={styles.sheetKopf}>
          <span className={styles.sheetTitel}>Karte wählen</span>
          <button
            type="button"
            className={`${styles.knopf} ${styles.sheetAbbrechen}`}
            onClick={onSchliessen}
          >
            Abbrechen
          </button>
        </div>
        <div className={styles.sheetKontext}>{kontext}</div>
        <div className={styles.sheetListe}>
          {gruppen.length === 0 && (
            <div className={styles.sheetLeer}>Keine Karte in diesem Monat aktiv</div>
          )}
          {gruppen.map((g) => (
            <div key={g.id}>
              <div className={`${styles.label} ${styles.sheetGruppe}`}>{g.titel}</div>
              {g.karten.map((k) => (
                <button
                  key={k.cardId}
                  type="button"
                  className={`${styles.knopf} ${styles.sheetZeile}`}
                  onClick={() => onWahl(k)}
                >
                  <span className={styles.sheetName}>{k.name}</span>
                  <span className={styles.sheetRechts}>{k.rechts}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
