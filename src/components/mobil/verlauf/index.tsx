"use client";

import { useState } from "react";
import { KOPF_RECHTS } from "./regeln";
import type { VerlaufDaten } from "./verlauf.types";
import styles from "./verlauf.module.css";

/* Tab „Verlauf" — der Bildschirm (Handoff §6).
 *
 * Client-Komponente allein wegen der Auswahl: Ein Tipp auf einen Balken
 * wechselt die Detailkarte. Es wird nichts nachgeladen und nichts gerechnet —
 * jeder Monat bringt seine Texte fertig mit. */

const FELD_H = 190;

export function VerlaufScreen({ daten }: { daten: VerlaufDaten }) {
  const [gewaehlt, setGewaehlt] = useState(daten.gewaehlt);
  const aktiv =
    daten.monate.find((m) => m.ym === gewaehlt) ?? daten.monate[daten.monate.length - 1];

  return (
    <main className={styles.screen}>
      <div className={styles.kopf}>
        <h1 className={styles.titel}>Verlauf</h1>
        <span className={styles.kopfRechts}>{KOPF_RECHTS}</span>
      </div>

      <section className={styles.panel}>
        <div className={styles.held}>
          <span className={styles.heldWert}>{daten.durchschnittText ?? "—"}</span>
          <span className={styles.heldLabel}>Ø je Monat</span>
        </div>

        <div className={styles.feld} style={{ height: `${FELD_H}px` }}>
          {aktiv?.planHoehe !== null && aktiv?.planHoehe !== undefined ? (
            <div
              className={styles.planLinie}
              style={{ bottom: `${aktiv.planHoehe}px` }}
              aria-hidden="true"
            >
              <span className={styles.planText}>{aktiv.planText}</span>
            </div>
          ) : null}

          <div className={styles.balken}>
            {daten.monate.map((m) => {
              const ist = m.ym === gewaehlt;
              return (
                <button
                  key={m.ym}
                  type="button"
                  className={styles.saeuleKnopf}
                  aria-pressed={ist}
                  aria-label={`${m.kurz}: ${m.wertText}`}
                  onClick={() => setGewaehlt(m.ym)}
                >
                  <span className={styles.saeuleWert} data-ton={m.ton}>
                    {m.balkenText}
                  </span>
                  <span
                    className={styles.saeule}
                    data-ton={m.ton}
                    data-gewaehlt={ist ? "true" : "false"}
                    style={{ height: `${m.hoehe}px` }}
                  />
                  <span className={styles.saeuleLabel} data-gewaehlt={ist ? "true" : "false"}>
                    {m.kurz}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {aktiv ? (
        <section className={styles.detail}>
          <div className={styles.detailTitel}>{aktiv.detailTitel}</div>
          <div className={styles.detailWert} data-ton={aktiv.ton}>
            {aktiv.wertText}
          </div>
          <div className={styles.detailUnten} data-ton={aktiv.unterzeileTon}>
            {aktiv.unterzeile}
          </div>
        </section>
      ) : null}
    </main>
  );
}
