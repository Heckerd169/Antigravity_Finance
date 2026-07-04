"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { drawWave } from "./draw";
import type { WelleStageProps } from "./welle.types";
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

  useLayoutEffect(() => {
    const el = fieldRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Redraw bei Daten-/Monats-/Größen-Wechsel. LL-5: Soft-Navigation un-mountet
  // nicht — der aktive-Monat-Kreis wandert allein über den Prop-Change.
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

    drawWave(ctx, {
      width: size.w,
      height: size.h,
      values: data.points.map((p) => p.istMonthly ?? 0),
      realizedIndex: realizedMonthIndex,
      activeIndex: activeMonthIndex,
      opacity: readWaveOpacity(field),
    });
  }, [data, size, activeMonthIndex, realizedMonthIndex]);

  return (
    <div className={styles.field} ref={fieldRef}>
      {data && <canvas ref={canvasRef} className={styles.canvas} />}

      <div className={`${styles.split} ${styles.splitLeft}`}>{leftSlot}</div>

      {/* Glass-Backdrop hinter der Ring-Mitte (Port aus welle_v1.html .ring-glass):
          hält die Ring-Zahl über der Welle lesbar. */}
      <div className={styles.ringGlass} aria-hidden="true" />
      <div className={styles.ringSlot}>{ringSlot}</div>

      <div className={`${styles.split} ${styles.splitRight}`}>{rightSlot}</div>
    </div>
  );
}
