"use client";

import Link from "next/link";
import { eur, formatDatumLang } from "../format";
import {
  bestimmeZustand,
  kandidatenLabel,
  leerText,
  nachbarUnterzeile,
  offenZeile,
  pillenWort,
  positionsZaehler,
  stapelRest,
  uebernehmenText,
  vorschlagsLabel,
  VORSCHAU_ZEILEN,
} from "./zustand";
import type { NachbarMonat, OffeneZahlung, ZuordnenDaten } from "./zuordnen.types";
import styles from "./zuordnen.module.css";

/* Der Tab „Zuordnen" (Handoff-README §1). Eine Buchung im Fokus, der Vorschlag
 * als einziger gefüllter Knopf, darunter „Andere Karte …" und „Später".
 *
 * v3-02 P2: die LESENDE Fassung — Zustände normal und leer; die Knöpfe stehen,
 * schreiben aber noch nicht (P3: Übernehmen, Toast, Rückgängig, Später;
 * P4: Zweifelsfall und kein Vorschlag; P5: Sheet; P6: offline). */

type Props = {
  daten: ZuordnenDaten;
};

export function ZuordnenScreen({ daten }: Props) {
  const offene = daten.offene;
  const fokus: OffeneZahlung | null = offene[0] ?? null;
  const vorschau = offene.slice(1, 1 + VORSCHAU_ZEILEN);
  const sparrateText = daten.sparrate === null ? null : eur(daten.sparrate);

  return (
    <section className={styles.screen} aria-label="Zuordnen">
      <header className={styles.kopf}>
        <div className={styles.kopfLinks}>
          <div className={styles.label}>Sparrate · {daten.monatName}</div>
          <div className={styles.sparrate}>{sparrateText ?? "—"}</div>
        </div>
        <div className={styles.kopfRechts}>
          <div className={styles.offenZeile}>
            {offenZeile({ offen: offene.length, gesamt: daten.buchungenGesamt })}
          </div>
        </div>
      </header>

      <div className={styles.vorschau} aria-label="Danach im Stapel">
        <div className={`${styles.vorschauKopf} ${styles.label}`}>
          <span>Danach im Stapel</span>
          <span>{stapelRest({ offen: offene.length, vorschau: vorschau.length })}</span>
        </div>
        {vorschau.length === 0 ? (
          <div className={styles.vorschauLeer}>Nichts mehr danach</div>
        ) : (
          vorschau.map((z) => (
            <div key={z.id} className={styles.vorschauZeile}>
              <div className={styles.vorschauText}>
                <div className={styles.vorschauWer}>{z.empfaenger}</div>
                {z.zweck !== null && <div className={styles.vorschauWas}>{z.zweck}</div>}
              </div>
              <div className={styles.vorschauBetrag}>{eur(z.betrag, { plus: true })}</div>
            </div>
          ))
        )}
        <div className={styles.vorschauSchluss} />
      </div>

      <MonatsNavigation daten={daten} />

      {fokus === null ? (
        <Leer daten={daten} sparrateText={sparrateText} />
      ) : (
        <>
          <FokusKarte zahlung={fokus} daten={daten} />
          <Aktionsflaeche zahlung={fokus} />
        </>
      )}
    </section>
  );
}

// ── Monatsnavigation ─────────────────────────────────────────────────────────

function Chevron({ richtung }: { richtung: "links" | "rechts" }) {
  return (
    <span className={styles.chevron} aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d={richtung === "links" ? "M9 11L5 7L9 3" : "M5 3L9 7L5 11"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function Nachbar({
  nachbar,
  richtung,
}: {
  nachbar: NachbarMonat | null;
  richtung: "links" | "rechts";
}) {
  const klasse = `${styles.nachbar} ${richtung === "rechts" ? styles.nachbarRechts : ""}`;
  if (nachbar === null) {
    // Ohne Nachbar: Opacity .3, kein Handler (Handoff §1 Monatsnavigation).
    return (
      <span className={`${klasse} ${styles.nachbarOhne}`} aria-disabled="true">
        <Chevron richtung={richtung} />
      </span>
    );
  }
  return (
    <Link
      href={`/mobil/zuordnen?month=${nachbar.ym}`}
      className={klasse}
      aria-label={`${richtung === "links" ? "Zurück zu" : "Weiter zu"} ${nachbar.name}`}
    >
      <Chevron richtung={richtung} />
      <span className={styles.nachbarText}>
        <span className={styles.nachbarName}>{nachbar.name}</span>
        <span className={styles.nachbarUnter}>{nachbarUnterzeile(nachbar)}</span>
      </span>
    </Link>
  );
}

function MonatsNavigation({ daten }: { daten: ZuordnenDaten }) {
  return (
    <nav className={styles.monatsNav} aria-label="Monat">
      <Nachbar nachbar={daten.zurueck} richtung="links" />
      <div className={styles.monatMitte}>
        <span className={styles.monatName}>{daten.monatLabel}</span>
        <span className={styles.pille}>{pillenWort(daten.status)}</span>
      </div>
      <Nachbar nachbar={daten.vor} richtung="rechts" />
    </nav>
  );
}

// ── Fokus-Karte ──────────────────────────────────────────────────────────────

function FokusKarte({ zahlung, daten }: { zahlung: OffeneZahlung; daten: ZuordnenDaten }) {
  return (
    <article className={styles.fokus} aria-label="Buchung im Fokus">
      <div className={`${styles.fokusKopf} ${styles.label}`}>
        <span className={styles.fokusDatum}>Buchung · {formatDatumLang(zahlung.datum)}</span>
        <span className={styles.fokusPosition}>
          {positionsZaehler({ zugeordnet: daten.zugeordnet, gesamt: daten.buchungenGesamt })}
        </span>
      </div>
      <div className={styles.fokusBetrag}>{eur(zahlung.betrag, { plus: true })}</div>
      <div className={styles.fokusWer}>{zahlung.empfaenger}</div>
      {zahlung.zweck !== null && <div className={styles.fokusWas}>{zahlung.zweck}</div>}
    </article>
  );
}

// ── Aktionsfläche ────────────────────────────────────────────────────────────

function Haken() {
  return (
    <svg className={styles.haken} width="12" height="12" viewBox="0 0 9 9" fill="none" aria-hidden="true">
      <path
        d="M2 4.5L3.8 6.5L7 3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Aktionsflaeche({ zahlung }: { zahlung: OffeneZahlung }) {
  const zustand = bestimmeZustand(zahlung);

  return (
    <div className={styles.aktionen}>
      {zustand === "normal" && zahlung.vorschlag !== null && (
        <>
          <div className={`${styles.label} ${styles.aktionenLabel}`}>
            {vorschlagsLabel(zahlung.vorschlag)}
          </div>
          <button
            type="button"
            className={`${styles.knopf} ${styles.uebernehmen}`}
            aria-label={`Übernehmen: ${zahlung.vorschlag.name}`}
          >
            <Haken />
            <span className={styles.uebernehmenName}>{zahlung.vorschlag.name}</span>
          </button>
        </>
      )}

      {zustand === "mehrdeutig" && (
        <>
          <div className={`${styles.label} ${styles.aktionenLabelZeile}`}>
            <span>{kandidatenLabel(zahlung.kandidaten.length, zahlung.empfaenger)}</span>
            <span>Nicht eindeutig</span>
          </div>
          {zahlung.kandidaten.map((k) => (
            <div key={k.cardId} className={styles.kandidat}>
              <span className={styles.kandidatName}>{k.name}</span>
              <span className={styles.kandidatZaehler}>{k.treffer} × zuvor</span>
            </div>
          ))}
          <button
            type="button"
            className={`${styles.knopf} ${styles.uebernehmen} ${styles.uebernehmenGesperrt}`}
            aria-disabled="true"
          >
            {uebernehmenText(null)}
          </button>
        </>
      )}

      {zustand === "keinVorschlag" && (
        <div className={`${styles.label} ${styles.aktionenLabel}`}>Kein Vorschlag</div>
      )}

      <button type="button" className={`${styles.knopf} ${styles.andereKarte}`}>
        Andere Karte …
      </button>

      <div className={styles.spaeterZeile}>
        <button type="button" className={`${styles.knopf} ${styles.spaeter}`}>
          Später
        </button>
      </div>
    </div>
  );
}

// ── Leer ─────────────────────────────────────────────────────────────────────

function Leer({ daten, sparrateText }: { daten: ZuordnenDaten; sparrateText: string | null }) {
  const t = leerText({ status: daten.status, monatName: daten.monatName, sparrateText });
  return (
    <div className={styles.leer}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="20" cy="20" r="18" stroke="var(--color-teal)" strokeWidth="1.5" />
        <path
          d="M12 20.5L17.5 26L28 15"
          stroke="var(--color-teal)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className={styles.leerTitel}>{t.titel}</div>
      <div className={styles.leerText}>{t.text}</div>
    </div>
  );
}
