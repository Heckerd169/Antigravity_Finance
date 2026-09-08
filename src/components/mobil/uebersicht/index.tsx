import Link from "next/link";
import { pillenWort } from "../zuordnen/zustand";
import { Buehne } from "./buehne";
import { einstiegTitel, einstiegUnterzeile, fusszeile } from "./regeln";
import type { UebersichtDaten } from "./uebersicht.types";
import styles from "./uebersicht.module.css";

/* Tab „Übersicht" — der Bildschirm (Handoff §4).
 *
 * Eine SERVER-Komponente: Sie zeigt nur, was der Lader entschieden hat. Nur die
 * Bühne ist ein Client-Inseln, weil Canvas einen Browser braucht. Das hält die
 * Seite klein und spart dem Handy die Hydration für Text, der sich nicht
 * bewegt. */

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path
        d="M9 5l7 7-7 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function UebersichtScreen({ daten }: { daten: UebersichtDaten }) {
  const leer = daten.offen <= 0;

  return (
    <main className={styles.screen}>
      <div className={styles.kopf}>
        <h1 className={styles.monat}>{daten.monatLabel}</h1>
        <span className={styles.pille}>{pillenWort(daten.status)}</span>
      </div>

      <Buehne
        welle={daten.welle}
        sparrate={daten.sparrate}
        planSparrate={daten.planSparrate}
      />

      <div className={styles.kacheln}>
        {daten.kacheln.map((k) => (
          <div key={k.titel} className={styles.kachel}>
            <div className={styles.kachelTitel}>{k.titel}</div>
            <div className={styles.kachelPlan}>{k.plan}</div>
            <div className={styles.kachelUnten}>{k.unten}</div>
          </div>
        ))}
      </div>

      <Link
        href={`/mobil/zuordnen?month=${daten.monat}`}
        className={styles.einstieg}
        data-leer={leer ? "true" : "false"}
      >
        <span className={styles.einstiegText}>
          <span className={styles.einstiegTitel}>{einstiegTitel(daten.offen)}</span>
          <span className={styles.einstiegUnten}>
            {einstiegUnterzeile(daten.offen)}
          </span>
        </span>
        <span className={styles.einstiegKreis} aria-hidden="true">
          <Chevron />
        </span>
      </Link>

      <p className={styles.fuss}>{fusszeile(daten.zuletzt)}</p>
    </main>
  );
}
