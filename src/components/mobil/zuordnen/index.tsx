"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ymToDbDate } from "@/lib/months";
import { rueckgaengigAction, zuordnenAction } from "@/app/mobil/zuordnen/actions";
import { eur, formatDatumLang, formatUhrzeit } from "../format";
import { useOnline } from "../use-online";
import {
  bestimmeZustand,
  kandidatenLabel,
  leerText,
  nachbarUnterzeile,
  offenZeile,
  offlineHinweis,
  offlinePille,
  pillenWort,
  positionsZaehler,
  stapelReihenfolge,
  stapelRest,
  toastZeile,
  uebernehmenText,
  vorschlagsLabel,
  VORSCHAU_ZEILEN,
} from "./zustand";
import { MobilToast, useMobilToast } from "./toast";
import { KartenSheet } from "./karten-sheet";
import type {
  KartenTyp,
  NachbarMonat,
  OffeneZahlung,
  SheetKarte,
  ZuordnenDaten,
} from "./zuordnen.types";
import styles from "./zuordnen.module.css";

/* Der Tab „Zuordnen" (Handoff-README §1). Eine Buchung im Fokus, der Vorschlag
 * als einziger gefüllter Knopf, darunter „Andere Karte …" und „Später".
 *
 * v3-02 P3: Übernehmen schreibt (Server Action, Link `MANUAL_DROP`), der Toast
 * zeigt das echte Δ der Sparrate, „Rückgängig" löst den Link fünf Sekunden
 * lang, „Später" schiebt die Zahlung lokal ans Stapelende.
 * P4: Zweifelsfall — Kandidaten als Konturen, nichts vorbelegt, Übernehmen
 * gesperrt bis zur Wahl; „kein Vorschlag" ohne gefüllten Knopf (A1).
 * P5: Sheet „Karte wählen".
 * P6: offline — neutrale Pille „Stand von HH:MM · offline", Schreibknöpfe
 * gesperrt (Opacity .4, kein Handler), „Später" bleibt (Record #4). */

type Props = {
  daten: ZuordnenDaten;
};

/** Eine Karte, auf die zugeordnet wird — aus Vorschlag, Kandidat oder Sheet. */
export type Zielkarte = { cardId: string; name: string; typ: KartenTyp };

export function ZuordnenScreen({ daten }: Props) {
  // „Später": lokal, in Reihenfolge der Rückstellung. Monatswechsel setzt
  // zurück — Soft-Navigation un-mountet den Bildschirm nicht (LL-5), und ein
  // im August zurückgestellter Stapel gehört nicht in den September.
  const [spaeter, setSpaeter] = useState<string[]>([]);
  useEffect(() => {
    setSpaeter([]);
  }, [daten.monat]);

  const [laufend, setLaufend] = useState(false);
  const [sheetOffen, setSheetOffen] = useState(false);
  const { toast, zeigen, schliessen } = useMobilToast();
  const online = useOnline();
  const standUhrzeit = formatUhrzeit(daten.geladenUm);

  const offene = stapelReihenfolge(daten.offene, spaeter);
  const fokus: OffeneZahlung | null = offene[0] ?? null;
  const vorschau = offene.slice(1, 1 + VORSCHAU_ZEILEN);
  const sparrateText = daten.sparrate === null ? null : eur(daten.sparrate);
  const monthDb = ymToDbDate(daten.monat);

  const zuordnen = useCallback(
    async (zahlung: OffeneZahlung, karte: Zielkarte) => {
      if (laufend) return;
      setLaufend(true);
      try {
        const erg = await zuordnenAction({
          fragmentId: zahlung.id,
          cardId: karte.cardId,
          month: monthDb,
        });
        // Die Zeile kommt aus dem ECHTEN Δ — beide Werte aus der Datenbank.
        // Fehlt einer, bleibt sie weg (keine Null-Zeile, LL-20).
        const zeile =
          erg.vorher !== null && erg.nachher !== null
            ? toastZeile({
                delta: erg.nachher - erg.vorher,
                monatName: daten.monatName,
                istEinnahme: karte.typ === "INCOME",
                deltaText: eur(erg.nachher - erg.vorher, { plus: true }),
              })
            : null;
        zeigen({
          titel: `Zugeordnet · ${karte.name}`,
          zeile,
          rueckgaengig: () => {
            rueckgaengigAction({ fragmentId: zahlung.id, month: monthDb }).catch((e) =>
              console.error("Rückgängig fehlgeschlagen", e),
            );
          },
        });
      } catch (e) {
        console.error("Zuordnen fehlgeschlagen", e);
        zeigen({ titel: "Zuordnen fehlgeschlagen", zeile: null, rueckgaengig: null });
      } finally {
        setLaufend(false);
      }
    },
    [laufend, monthDb, daten.monatName, zeigen],
  );

  const spaeterLegen = useCallback(
    (zahlung: OffeneZahlung) => {
      setSpaeter((prev) => (prev.includes(zahlung.id) ? prev : [...prev, zahlung.id]));
      zeigen({
        titel: `Zurückgestellt · ${zahlung.empfaenger}`,
        zeile: { text: "Steht jetzt am Ende des Stapels", ton: "neutral" },
        rueckgaengig: null,
      });
    },
    [zeigen],
  );

  const rueckgaengig = useCallback(() => {
    toast?.rueckgaengig?.();
    schliessen();
  }, [toast, schliessen]);

  return (
    <section className={styles.screen} aria-label="Zuordnen">
      <header className={styles.kopf}>
        <div className={styles.kopfLinks}>
          <div className={styles.label}>Sparrate · {daten.monatName}</div>
          <div className={styles.sparrate}>{sparrateText ?? "—"}</div>
        </div>
        <div className={styles.kopfRechts}>
          {!online && <span className={styles.pille}>{offlinePille(standUhrzeit)}</span>}
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
          <Aktionsflaeche
            key={fokus.id}
            zahlung={fokus}
            laufend={laufend}
            online={online}
            standUhrzeit={standUhrzeit}
            onZuordnen={(karte) => zuordnen(fokus, karte)}
            onAndereKarte={() => setSheetOffen(true)}
            onSpaeter={() => spaeterLegen(fokus)}
          />
          <KartenSheet
            offen={sheetOffen}
            karten={daten.karten}
            kontext={`${fokus.empfaenger} · ${eur(fokus.betrag, { plus: true })}`}
            onSchliessen={() => setSheetOffen(false)}
            onWahl={(k: SheetKarte) => {
              setSheetOffen(false);
              void zuordnen(fokus, { cardId: k.cardId, name: k.name, typ: k.typ });
            }}
          />
        </>
      )}

      <MobilToast toast={toast} onRueckgaengig={rueckgaengig} />
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

function Aktionsflaeche({
  zahlung,
  laufend,
  online,
  standUhrzeit,
  onZuordnen,
  onAndereKarte,
  onSpaeter,
}: {
  zahlung: OffeneZahlung;
  laufend: boolean;
  online: boolean;
  standUhrzeit: string;
  onZuordnen: (karte: Zielkarte) => void;
  onAndereKarte: () => void;
  onSpaeter: () => void;
}) {
  const zustand = bestimmeZustand(zahlung);
  // Offline: Schreiben gesperrt — Opacity .4 und KEIN Handler (Record #4).
  // „Später" ist lokal und bleibt.
  const schreibenGesperrt = !online;
  const sperrKlasse = schreibenGesperrt ? styles.gesperrt : "";
  // Zweifelsfall: NICHTS vorbelegt (Record #2). Der Aufrufer setzt `key` auf die
  // Zahlung — mit der nächsten Buchung beginnt die Auswahl wieder bei null.
  const [gewaehltId, setGewaehltId] = useState<string | null>(null);
  const gewaehlt = zahlung.kandidaten.find((k) => k.cardId === gewaehltId) ?? null;

  return (
    <div className={styles.aktionen}>
      {zustand === "normal" && zahlung.vorschlag !== null && (
        <>
          <div className={`${styles.label} ${styles.aktionenLabel}`}>
            {vorschlagsLabel(zahlung.vorschlag)}
          </div>
          <button
            type="button"
            className={`${styles.knopf} ${styles.uebernehmen} ${sperrKlasse}`}
            aria-label={`Übernehmen: ${zahlung.vorschlag.name}`}
            aria-disabled={schreibenGesperrt || undefined}
            aria-busy={laufend || undefined}
            onClick={
              schreibenGesperrt
                ? undefined
                : () => {
                    const v = zahlung.vorschlag;
                    if (v) onZuordnen({ cardId: v.cardId, name: v.name, typ: v.typ });
                  }
            }
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
          {zahlung.kandidaten.map((k) => {
            const istGewaehlt = k.cardId === gewaehltId;
            return (
              <button
                key={k.cardId}
                type="button"
                className={`${styles.knopf} ${styles.kandidat} ${istGewaehlt ? styles.kandidatGewaehlt : ""}`}
                aria-pressed={istGewaehlt}
                // erneutes Tippen hebt die Auswahl auf (Handoff §1 mehrdeutig)
                onClick={() => setGewaehltId(istGewaehlt ? null : k.cardId)}
              >
                <span className={styles.kandidatName}>{k.name}</span>
                <span className={styles.kandidatZaehler}>{k.treffer} × zuvor</span>
              </button>
            );
          })}
          <button
            type="button"
            className={`${styles.knopf} ${styles.uebernehmen} ${gewaehlt && !schreibenGesperrt ? "" : styles.uebernehmenGesperrt}`}
            aria-disabled={gewaehlt && !schreibenGesperrt ? undefined : "true"}
            aria-busy={laufend || undefined}
            onClick={
              schreibenGesperrt
                ? undefined
                : () => {
                    if (gewaehlt) onZuordnen({ cardId: gewaehlt.cardId, name: gewaehlt.name, typ: gewaehlt.typ });
                  }
            }
          >
            {uebernehmenText(gewaehlt)}
          </button>
        </>
      )}

      {zustand === "keinVorschlag" && (
        <div className={`${styles.label} ${styles.aktionenLabel}`}>Kein Vorschlag</div>
      )}

      {schreibenGesperrt && (
        <div className={styles.hinweis}>{offlineHinweis(standUhrzeit)}</div>
      )}

      <button
        type="button"
        className={`${styles.knopf} ${styles.andereKarte} ${sperrKlasse}`}
        aria-disabled={schreibenGesperrt || undefined}
        onClick={schreibenGesperrt ? undefined : onAndereKarte}
      >
        Andere Karte …
      </button>

      <div className={styles.spaeterZeile}>
        <button type="button" className={`${styles.knopf} ${styles.spaeter}`} onClick={onSpaeter}>
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
