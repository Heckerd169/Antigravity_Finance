"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { loadCardVerlauf, loadCategoryVerlauf, type VerlaufDaten } from "./actions";
import {
  MONATE_GESAMT,
  VERLAUF_MASSE,
  baueGeometrie,
  jahresSummen,
  type VerlaufPunkt,
} from "./verlauf";
import { formatEuro, formatEuroRounded } from "@/lib/format";
import styles from "./cards.module.css";


/** Woher die Reihe kommt. Die Fläche ist dieselbe — das ist der ganze Punkt
 *  von Befund `U5`: Karten- und Kategorie-Verlauf sind dieselbe Fläche mit zwei
 *  Ebenen, und getrennt zu bauen hieße, sie zweimal anzufassen. */
export type VerlaufQuelle =
  | { art: "karte"; cardId: string }
  | { art: "ordner"; categoryId: string };

type VerlaufOverlayProps = {
  quelle: VerlaufQuelle;
  /** Kartenname bzw. Ordnername — der Held des Overlays. */
  name: string;
  /** Zeile unter dem Namen: Typ, Frequenz, Zuordnung bzw. Postenzahl. */
  unterzeile: string;
  /** Das RECHTE Jahr der Reihe; gezeigt werden `jahr - 1` und `jahr`. */
  jahr: number;
  onClose: () => void;
};

/**
 * v2-31 (M7 / KAT-4) — „Verlauf …": 24 Monate Ist gegen Plan.
 *
 * ── WARUM ES DIESE FLÄCHE GIBT ─────────────────────────────────────────────
 *
 * Die Frage „wie lief diese Karte übers Jahr?" war bis v2-31 nur beantwortbar,
 * indem man zwölfmal den Monat wechselte. Der Verlauf zeigt sie in einem Bild —
 * und beantwortet dabei eine Frage mit, an der v2-28 gescheitert ist: Netflix'
 * Preissenkung im November 2025 verschwand im Jahresmittel 18,99 €, das in
 * keinem einzigen Monat gezahlt wurde (LL-37). Auf dieser Fläche ist die Stufe
 * nicht zu übersehen.
 *
 * ── WARUM ZENTRIERT UND PER PORTAL ─────────────────────────────────────────
 *
 * §7 legt fest: Alle Overlays der App erscheinen mittig, an derselben Stelle;
 * sie unterscheiden sich in der Größe, nie im Ort. Die einzige Ausnahme ist das
 * Karten-Kontextmenü selbst, das am ⋯-Icon hängt. Der Verlauf ist ein Overlay
 * und damit kein Sonderfall.
 *
 * ⚠️ Das Portal repariert den LAYOUT-Bezug (das Karussell ist ein
 * Clipping-Container mit `overflow-x: auto`) und zerreißt im selben Zug jede
 * Logik, die sich auf DOM-Nähe verlässt — `closest()`, `contains()`,
 * CSS-Nachfahren-Selektoren, Eltern-Hover. Das Event-Bubbling läuft dabei
 * UNVERÄNDERT weiter, weil Portale React-Kinder bleiben. In v2-10 riss danach
 * jeder Klick im Einkommens-Popup zusätzlich die Jahres-Welle auf, und die
 * komplette Prüfstrecke blieb dabei grün — gefunden hat es erst der optische
 * Smoke (LL-6). Deshalb stoppt der Backdrop unten die Ausbreitung.
 *
 * ── WAS DIESE FLÄCHE NICHT IST ─────────────────────────────────────────────
 *
 * Keine kumulierte Sicht. §9 erklärt das Welle-Popup zur EINZIGEN Heimat der
 * kumulierten Treppe. Hier steht je Monat der Wert DIESES Monats — die
 * Darstellungsform der Welle, nicht die des Popups. Wer hier eine Treppe
 * einbaut („Ausgaben seit Januar"), verletzt §9 an einer Stelle, an der es
 * niemandem auffiele: Die Zahlen blieben richtig, es wäre nur die falsche
 * Heimat.
 */
export function VerlaufOverlay({
  quelle,
  name,
  unterzeile,
  jahr,
  onClose,
}: VerlaufOverlayProps) {
  const [daten, setDaten] = useState<VerlaufDaten | null>(null);
  const [fehler, setFehler] = useState(false);

  // Escape schließt — wie bei allen Overlays seit v2-16.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Erst beim Öffnen laden. Der Ordner-Verlauf kostet gemessen 254 ms, weil er
  // den Rest-Ausgleich aus `get_category_amounts_for_month` mitnimmt statt ihn
  // nachzubauen (LL-25) — das gehört nicht in den Dashboard-Aufbau (Anker 3).
  useEffect(() => {
    let abgebrochen = false;
    const laden =
      quelle.art === "karte"
        ? loadCardVerlauf(quelle.cardId, jahr)
        : loadCategoryVerlauf(quelle.categoryId, jahr);

    laden
      .then((d) => {
        if (!abgebrochen) setDaten(d);
      })
      .catch(() => {
        if (!abgebrochen) setFehler(true);
      });

    return () => {
      abgebrochen = true;
    };
  }, [quelle, jahr]);

  return createPortal(
    <div
      className={styles.overlayBackdrop}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={styles.verlaufModal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Verlauf ${name}`}
      >
        <button
          type="button"
          className={styles.verlaufClose}
          onClick={onClose}
          aria-label="Schließen"
        >
          ×
        </button>

        <div className={styles.verlaufKicker}>Verlauf</div>
        <div className={styles.verlaufHero}>{name}</div>
        <div className={styles.verlaufSub}>{unterzeile}</div>

        <div className={styles.verlaufChart}>
          {daten ? (
            <VerlaufZeichnung punkte={daten.punkte} jahr={jahr} heuteIso={daten.heuteIso} />
          ) : (
            <div className={styles.verlaufPlatzhalter}>
              {fehler ? "Verlauf nicht verfügbar" : "Verlauf wird geladen"}
            </div>
          )}
        </div>

        <div className={styles.verlaufFuss}>
          <div className={styles.verlaufLegende}>
            <span>
              <i className={styles.verlaufLegendeIst} />
              Ist
            </span>
            <span>
              <i className={styles.verlaufLegendePlan} />
              Plan
            </span>
          </div>
          {daten && (
            <div className={styles.verlaufSummen}>
              <Summen punkte={daten.punkte} jahr={jahr} heuteIso={daten.heuteIso} />
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** Die Jahressummen des Ist. Zukunftsmonate zählen nicht mit — die Ist-Linie
 *  endet dort, und eine Summe, die weiterläuft, widerspräche ihr. */
function Summen({
  punkte,
  jahr,
  heuteIso,
}: {
  punkte: VerlaufPunkt[];
  jahr: number;
  heuteIso: string;
}) {
  const s = useMemo(
    () => jahresSummen(punkte, jahr, new Date(heuteIso)),
    [punkte, jahr, heuteIso],
  );
  return (
    <>
      {`${jahr - 1} ${formatEuro(Math.abs(s.vorjahr))} · ${jahr} ${formatEuro(Math.abs(s.jahr))}`}
    </>
  );
}

/**
 * Die Zeichenfläche. Farben und Strichstärken sind 1:1 aus `welle/draw.ts`
 * übernommen: Ist teal bei 2 px, Plan grau `rgba(255,255,255,.25)` bei 1 px,
 * Raster `.07` bei 0,5 px. **Kein neuer Farbtopf** — beide Werte sind seit §9
 * für genau diese Bedeutung vergeben.
 *
 * Die Geometrie kommt vollständig aus `verlauf.ts`; hier wird nur gemalt. Das
 * ist Absicht: So kann der Wächter die Regeln an der echten Quelldatei prüfen,
 * ohne einen DOM zu brauchen.
 */
function VerlaufZeichnung({
  punkte,
  jahr,
  heuteIso,
}: {
  punkte: VerlaufPunkt[];
  jahr: number;
  heuteIso: string;
}) {
  const g = useMemo(
    () => baueGeometrie(punkte, jahr, new Date(heuteIso)),
    [punkte, jahr, heuteIso],
  );
  const { width, height, padLeft, padRight, padTop, padBottom } = VERLAUF_MASSE;

  if (punkte.length === 0) {
    return <div className={styles.verlaufPlatzhalter}>Keine Daten für diesen Zeitraum</div>;
  }

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      className={styles.verlaufSvg}
      role="img"
      aria-label={`Verlauf ${jahr - 1} bis ${jahr}, Ist gegen Plan`}
    >
      {g.rasterY.map((y, i) => (
        <line
          key={`r${i}`}
          x1={padLeft}
          y1={y.toFixed(1)}
          x2={width - padRight}
          y2={y.toFixed(1)}
          className={styles.verlaufRaster}
        />
      ))}

      {g.yMarken.map((m) => (
        <text
          key={`y${m.wert}`}
          x={padLeft - 8}
          y={(m.y + 3).toFixed(1)}
          textAnchor="end"
          className={styles.verlaufYLabel}
        >
          {formatEuroRounded(m.wert)}
        </text>
      ))}

      <line
        x1={g.jahrGrenzeX.toFixed(1)}
        y1={padTop - 5}
        x2={g.jahrGrenzeX.toFixed(1)}
        y2={height - padBottom + 4}
        className={styles.verlaufJahrGrenze}
      />

      {/* Die `heute`-Marke erklärt, warum die teale Linie endet. Ohne sie ist
          eine Linie, die im August aufhört, von fehlenden Daten nicht zu
          unterscheiden — sie ist kein Schmuck (Design-Record §2). */}
      {g.heuteX !== null && (
        <>
          <line
            x1={g.heuteX.toFixed(1)}
            y1={padTop - 5}
            x2={g.heuteX.toFixed(1)}
            y2={height - padBottom + 4}
            className={styles.verlaufHeuteLinie}
          />
          <text
            x={g.heuteX.toFixed(1)}
            y={padTop - 8}
            textAnchor="middle"
            className={styles.verlaufHeuteLabel}
          >
            heute
          </text>
        </>
      )}

      <path d={g.planPfad} className={styles.verlaufPlanLinie} />
      {g.planPunkte.map((p, i) => (
        <circle key={`pp${i}`} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={2.4} className={styles.verlaufPlanPunkt} />
      ))}

      <path d={g.istPfad} className={styles.verlaufIstLinie} />
      {g.istPunkte.map((p, i) => (
        <circle key={`ip${i}`} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={2.4} className={styles.verlaufIstPunkt} />
      ))}

      {g.xMarken.map((m) => (
        <text
          key={m.label}
          x={m.x.toFixed(1)}
          y={height - 10}
          textAnchor="middle"
          className={styles.verlaufXLabel}
        >
          {m.label}
        </text>
      ))}
    </svg>
  );
}

/** Für den Wächter erreichbar, ohne die Komponente zu mounten. */
export { MONATE_GESAMT };
