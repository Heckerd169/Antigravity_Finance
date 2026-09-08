"use client";

import { useEffect, useRef, useState } from "react";
import { drawWave, readWaveOpacity } from "@/components/welle/draw";
import { SingularityRing } from "@/components/singularity-ring";
import type { WellenDaten } from "./uebersicht.types";
import styles from "./uebersicht.module.css";

/* Die Bühne der Übersicht (Handoff §4, Record #10): die Jahres-Welle im
 * Hintergrund, davor der Singularity Ring mit deckender Innenfläche.
 *
 * ── Was hier NICHT passiert ────────────────────────────────────────────────
 * Es wird **kein zweiter Ring** gebaut und **kein zweiter Zeichencode** für die
 * Welle. `singularity-ring/` trägt die Maße des Handoffs bereits (248 × 248,
 * r 98, Strich 9) und die Bogen-Regel aus Design-Doku §5; `drawWave` trägt die
 * Geometrie (Padding 18 links und rechts ergibt bei 430 px genau die
 * Punktabstände des Entwurfs) und die Farben. Ein Nachbau wäre LL-26 in der
 * Form „Nachbauen" — in v2-20 hat genau so einer eine Datenbank-Entscheidung
 * still aufgehoben.
 *
 * ── Die drei Unterschiede zum Schreibtisch, alle als Parameter ─────────────
 * · **kein Marker-Kreis** (`showActiveMarker: false`) — der Ring steht davor.
 * · **kein senkrechter Strich** — den zeichnet nicht `drawWave`, sondern die
 *   Schreibtisch-Hülle `welle/index.tsx`. Diese Bühne ruft `drawWave` direkt.
 * · **kein Scrubbing, kein Popup** — auf `/mobil` wird nicht gezogen.
 *
 * ── Warum das Feld 282 px hoch ist und nicht 260 ───────────────────────────
 * Der Entwurf zeichnet die Welle 260 px hoch und setzt die Monatsbeschriftung
 * darunter auf 262. `drawWave` zeichnet die Beschriftung selbst, innerhalb des
 * Felds (`h - 6`). Ein 260er Feld legte sie damit auf 254 — mitten unter den
 * Ring, der bis 254 reicht. Das Feld ist deshalb so hoch wie die Bühne; die
 * Beschriftung sitzt dann bei 276, also dort, wo der Entwurf sie zeigt. */

const BUEHNE_H = 282;
const RING_PX = 248;

export function Buehne({
  welle,
  sparrate,
  planSparrate,
}: {
  welle: WellenDaten;
  sparrate: number | null;
  planSparrate: number | null;
}) {
  const feldRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [breite, setBreite] = useState(0);

  // Die Breite kommt vom Gerät, nicht aus einer Konstante: 430 px ist das
  // Artboard, ein iPhone SE hat 375. Die Welle skaliert mit; ihre Paddings
  // bleiben bei 18, wie am Schreibtisch.
  useEffect(() => {
    const feld = feldRef.current;
    if (!feld) return;
    const messen = () => setBreite(feld.clientWidth);
    messen();
    const ro = new ResizeObserver(messen);
    ro.observe(feld);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const cv = canvasRef.current;
    const feld = feldRef.current;
    if (!cv || !feld || breite === 0) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    cv.width = breite * dpr;
    cv.height = BUEHNE_H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    drawWave(ctx, {
      width: breite,
      height: BUEHNE_H,
      values: welle.values,
      realizedIndex: welle.realizedIndex,
      activeIndex: welle.activeIndex,
      opacity: readWaveOpacity(feld),
      showActiveMarker: false,
    });
  }, [welle, breite]);

  return (
    <div className={styles.buehne} ref={feldRef}>
      <canvas
        ref={canvasRef}
        className={styles.welleCanvas}
        style={{ width: "100%", height: `${BUEHNE_H}px` }}
        aria-hidden="true"
      />
      <div className={styles.ringWrap} style={{ width: RING_PX, height: RING_PX }}>
        {/* Deckende Innenfläche r 94 — sie schneidet die Welle aus dem Ring
            aus (Record #10). Eine Hülle UM die Komponente, keine Änderung AN
            ihr: Der Ring selbst weiß nichts davon. */}
        <div className={styles.ringMaske} aria-hidden="true" />
        <SingularityRing currentSparrate={sparrate} plannedSparrate={planSparrate} />
      </div>
    </div>
  );
}
