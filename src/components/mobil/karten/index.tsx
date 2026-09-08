"use client";

import { useState } from "react";
import { FILTER_REIHENFOLGE, KEINE_BUCHUNG, filterTitel } from "./regeln";
import type { KartenFilter } from "./regeln";
import type { KartenDaten } from "./karten.types";
import styles from "./karten.module.css";

/* Tab „Karten" — der Bildschirm (Handoff §5).
 *
 * Client-Komponente, weil zwei Dinge im Browser passieren: die Filter-Pille und
 * das Aufklappen einer Karte. Beides ist reine Ansicht; es wird nichts
 * geschrieben und nichts nachgerechnet.
 *
 * Der aufgeklappte Zustand ist bewusst EIN Wert und keine Menge: Zwei offene
 * Karten übereinander machen die Liste unlesbar, und der Prototyp klappt
 * ebenfalls nur eine auf. */
export function KartenScreen({ daten }: { daten: KartenDaten }) {
  const [filter, setFilter] = useState<KartenFilter>("alle");
  const [offeneKarte, setOffeneKarte] = useState<string | null>(null);

  const sichtbar =
    filter === "alle" ? daten.zeilen : daten.zeilen.filter((z) => z.gruppe === filter);

  return (
    <main className={styles.screen}>
      <div className={styles.kopf}>
        <h1 className={styles.titel}>Karten · {daten.monatLabel}</h1>
        <span className={styles.zaehler}>
          {daten.zeilen.length === 1 ? "1 Karte" : `${daten.zeilen.length} Karten`}
        </span>
      </div>

      <div className={styles.pillen} role="tablist" aria-label="Kartenfilter">
        {FILTER_REIHENFOLGE.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            className={styles.pille}
            data-aktiv={filter === f ? "true" : "false"}
            onClick={() => setFilter(f)}
          >
            {filterTitel(f)}
          </button>
        ))}
      </div>

      <div className={styles.liste}>
        {sichtbar.length === 0 ? (
          <p className={styles.leer}>Keine Karte in dieser Gruppe</p>
        ) : (
          sichtbar.map((z) => {
            const auf = offeneKarte === z.cardId;
            return (
              <div key={z.cardId} className={styles.karte}>
                <button
                  type="button"
                  className={styles.karteKopf}
                  aria-expanded={auf}
                  onClick={() => setOffeneKarte(auf ? null : z.cardId)}
                >
                  <span className={styles.zeile1}>
                    <span className={styles.punkt} data-farbe={z.punkt} aria-hidden="true" />
                    <span className={styles.name}>{z.name}</span>
                    <span className={styles.ausgegeben}>{z.ausgegebenText}</span>
                  </span>

                  <span className={styles.balkenTrack} aria-hidden="true">
                    <span
                      className={styles.balkenFuellung}
                      data-farbe={z.balken}
                      style={{ width: `${Math.round(z.anteil * 100)}%` }}
                    />
                  </span>

                  <span className={styles.zeile3}>
                    <span className={styles.status}>{z.statusText}</span>
                    <span className={styles.rechts}>{z.rechtsText}</span>
                  </span>
                </button>

                {auf ? (
                  <div className={styles.aufgeklappt}>
                    {z.buchungen.length === 0 ? (
                      <p className={styles.keineBuchung}>{KEINE_BUCHUNG}</p>
                    ) : (
                      z.buchungen.map((b) => (
                        <p key={b.id} className={styles.buchung}>
                          <span className={styles.buchungName}>{b.empfaenger}</span>
                          <span className={styles.buchungBetrag}>{b.betragText}</span>
                        </p>
                      ))
                    )}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
