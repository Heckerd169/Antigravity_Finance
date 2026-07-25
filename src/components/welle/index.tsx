"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  MONTHS_FULL,
  drawWave,
  fmtSignedEuro,
  graS,
  redS,
  tealS,
  type WavePoint,
} from "./draw";
import { getTop1Driver } from "./drivers";
import { WellePopup } from "./popup";
import type { WelleData, WelleStageProps } from "./welle.types";
import styles from "./welle.module.css";

const DEFAULT_WAVE_OPACITY = 0.8;

/** Liest das Token --wave-opacity vom Feld (§9); Fallback nur Defense-in-Depth. */
function readWaveOpacity(el: HTMLElement): number {
  const raw = getComputedStyle(el).getPropertyValue("--wave-opacity");
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : DEFAULT_WAVE_OPACITY;
}

/**
 * Die Bühne der M3-Komposition (§9): monatliche EUR-Welle (Canvas) als
 * Hintergrund, davor der interaktions-transparente Ring (§5) und die
 * Income-Labels (§10). Die Welle färbt nach der D1-Regime-Grenze
 * (realizedMonthIndex) — der Header-aktive Monat steuert nur den einen Kreis.
 *
 * Scrubbing (§9 Verdeckung): Monatswahl ist positions-basiert über die volle
 * Feldbreite (nächster Monat zur Cursor-X-Position, nicht punkt-genau) — der
 * Ring ist pointer-events:none, damit auch die Jahresmitte hinter ihm voll
 * erreichbar ist. Führungslinie + Tooltip rendern ÜBER dem Ring.
 *
 * Klick auf die Welle öffnet das Popup mit der kumulierten Treppe (§9);
 * interaktive Kind-Elemente (Income-Labels, Dev-Panel) sind über
 * data-wave-block vom Popup-Trigger ausgenommen.
 */
export function WelleStage({
  data,
  activeMonthIndex,
  realizedMonthIndex,
  leftSlot,
  ringSlot,
  rightSlot,
}: WelleStageProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [pts, setPts] = useState<WavePoint[]>([]);
  const [hovIdx, setHovIdx] = useState<number>(-1);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

  useLayoutEffect(() => {
    const el = fieldRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // LL-5: Soft-Navigation un-mountet nicht — Hover- und Popup-State beim
  // Jahres-/Datenwechsel explizit zurücksetzen.
  useEffect(() => {
    setHovIdx(-1);
    setIsPopupOpen(false);
  }, [data]);

  // Redraw bei Daten-/Monats-/Größen-Wechsel. Der aktive-Monat-Kreis wandert
  // allein über den Prop-Change; die Regime-Grenze (D1) bleibt dabei fix.
  useEffect(() => {
    const cv = canvasRef.current;
    const field = fieldRef.current;
    if (!cv || !field || !data || size.w === 0 || size.h === 0) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    cv.width = size.w * dpr;
    cv.height = size.h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const nextPts = drawWave(ctx, {
      width: size.w,
      height: size.h,
      values: data.points.map((p) => p.istMonthly ?? 0),
      realizedIndex: realizedMonthIndex,
      activeIndex: activeMonthIndex,
      opacity: readWaveOpacity(field),
    });
    setPts(nextPts);
  }, [data, size, activeMonthIndex, realizedMonthIndex]);

  // Positions-basiertes Scrubbing: nächster Monatspunkt zur Cursor-X-Position.
  // Events aus Kind-Elementen bubblen hierher, damit die volle Breite inkl.
  // Income-Label-Zonen scrubbt; durch den Ring fallen sie dank
  // pointer-events:none direkt auf Canvas/Feld durch.
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>): void {
    if (!data || pts.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    let best = -1;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < pts.length; i++) {
      const dd = Math.abs(pts[i].x - mx);
      if (dd < bestDist) {
        bestDist = dd;
        best = i;
      }
    }
    if (best !== hovIdx) setHovIdx(best);
  }

  // Klick auf die Welle → Popup (§9). Interaktive Kind-Elemente (Income-Labels
  // inkl. deren Overlays, Dev-Panel) tragen data-wave-block und triggern nicht.
  function handleClick(e: React.MouseEvent<HTMLDivElement>): void {
    if (!data) return;
    const target = e.target as HTMLElement;
    if (target.closest("[data-wave-block]")) return;
    setIsPopupOpen(true);
  }

  const hovPoint = hovIdx >= 0 ? pts[hovIdx] : undefined;

  return (
    <>
      <div
        className={`${styles.field} ${data ? styles.fieldInteractive : ""}`}
        ref={fieldRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovIdx(-1)}
        onClick={handleClick}
      >
        {data && <canvas ref={canvasRef} className={styles.canvas} />}

        <div className={`${styles.split} ${styles.splitLeft}`} data-wave-block>
          {leftSlot}
        </div>

        {/* Glass-Backdrop hinter der Ring-Mitte (Port aus welle_v1.html .ring-glass):
            hält die Ring-Zahl über der Welle lesbar. */}
        <div className={styles.ringGlass} aria-hidden="true" />
        <div className={styles.ringSlot} data-wave-block>
          {ringSlot}
        </div>

        <div className={`${styles.split} ${styles.splitRight}`} data-wave-block>
          {rightSlot}
        </div>

        {/* Führungslinie + Tooltip ÜBER dem Ring (§9 Verdeckung) */}
        {data && hovPoint && (
          <>
            <div className={styles.guide} style={{ left: hovPoint.x }} />
            <WelleTooltip
              data={data}
              idx={hovIdx}
              point={hovPoint}
              fieldWidth={size.w}
              realizedMonthIndex={realizedMonthIndex}
            />
          </>
        )}
      </div>

      {/* Popup als Sibling — Klicks im Popup bubblen nicht in den Feld-Handler. */}
      {data && isPopupOpen && (
        <WellePopup data={data} onClose={() => setIsPopupOpen(false)} />
      )}
    </>
  );
}

type TooltipProps = {
  data: WelleData;
  idx: number;
  point: WavePoint;
  fieldWidth: number;
  realizedMonthIndex: number;
};

// Tooltip-Geometrie (Port-Vorlage): rechts neben der Führungslinie, kippt am
// rechten Feldrand nach links; oberhalb des Punkts, unterhalb wenn zu hoch.
const TT_W = 220;

function WelleTooltip({ data, idx, point, fieldWidth, realizedMonthIndex }: TooltipProps) {
  const monthPoint = data.points[idx];
  const ist = monthPoint.istMonthly ?? 0;
  const plan = monthPoint.planMonthly ?? 0;
  const realized = realizedMonthIndex >= 0 && idx <= realizedMonthIndex;
  const driver = getTop1Driver(data.drivers, idx);

  const valueColor = ist < 0 ? redS(1) : realized ? tealS(1) : graS(0.65);

  let left = point.x + 16;
  if (left + TT_W > fieldWidth - 8) left = point.x - TT_W - 16;
  if (left < 8) left = 8;
  let top = Math.max(8, point.y - 150);
  if (point.y < 150) top = point.y + 24;

  return (
    <div className={styles.tooltip} style={{ left, top }}>
      <div className={styles.ttMonth}>
        {MONTHS_FULL[idx]} {data.activeYear} · {realized ? "IST" : "Forecast"}
      </div>
      <div className={styles.ttValue} style={{ color: valueColor }}>
        {fmtSignedEuro(ist)}
      </div>
      <div className={styles.ttRow}>
        <span className={styles.ttLabel}>IST</span>
        <span className={styles.ttNum}>{fmtSignedEuro(ist)}</span>
      </div>
      <div className={styles.ttRow}>
        <span className={styles.ttLabel}>Plan</span>
        <span className={styles.ttNum}>{fmtSignedEuro(plan)}</span>
      </div>
      <div className={styles.ttDivider} />
      <div className={styles.ttDriver}>
        <span className={styles.ttDriverTag}>Treiber</span>
        <span className={driver.isPlaceholder ? styles.ttDriverPlaceholder : undefined}>
          {driver.label}
        </span>
      </div>
      <div className={styles.ttHint}>Klick öffnet die kumulierte Treppe</div>
    </div>
  );
}
