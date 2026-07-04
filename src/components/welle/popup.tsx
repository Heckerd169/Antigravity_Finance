"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { MONTHS_FULL, drawPopupStair, fmtSignedEuro, type WavePoint } from "./draw";
import { getTop3Drivers } from "./drivers-stub";
import type { WelleData } from "./welle.types";
import styles from "./welle.module.css";

const POPUP_CHART_HEIGHT = 200;
/** Monatsklick-Toleranz in px (Port-Vorlage: bd < 40). */
const CLICK_TOLERANCE = 40;

type WellePopupProps = {
  data: WelleData;
  onClose: () => void;
};

/**
 * Das Popup der kumulierten Treppe (§9): Single-Surface-Overlay, dismissible
 * per Klick-außen + Escape, KEIN Tooling/Slider. Inhalt: kumulierte Treppe
 * IST (teal) + Plan (grau), Jahressumme als Held, B6-Vorjahres-Linie,
 * Monatsklick → Top-3-Treiber (B2-Platzhalter, Briefing §4).
 */
export function WellePopup({ data, onClose }: WellePopupProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chartWidth, setChartWidth] = useState<number>(0);
  const [pts, setPts] = useState<WavePoint[]>([]);
  const [selIdx, setSelIdx] = useState<number>(-1);

  // Escape schließt (§9 dismissible) — Listener lebt nur solange das Popup gemountet ist.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useLayoutEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const measure = () => setChartWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || chartWidth === 0) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    cv.width = chartWidth * dpr;
    cv.height = POPUP_CHART_HEIGHT * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const nextPts = drawPopupStair(ctx, {
      width: chartWidth,
      height: POPUP_CHART_HEIGHT,
      istCum: data.points.map((p) => p.istCumulative),
      planCum: data.points.map((p) => p.planCumulative),
      prevYearEnd: data.prevYearEndCumulative,
      selectedIndex: selIdx,
    });
    setPts(nextPts);
  }, [data, chartWidth, selIdx]);

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>): void {
    if (pts.length === 0) return;
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
    if (bestDist < CLICK_TOLERANCE) {
      setSelIdx((cur) => (cur === best ? -1 : best));
    }
  }

  const yearTotal = data.points[11]?.istCumulative ?? 0;
  const drivers = selIdx >= 0 ? getTop3Drivers(selIdx) : [];

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Kumulierte Sparrate ${data.activeYear}`}
    >
      <div className={styles.popup}>
        <button
          type="button"
          className={styles.popupClose}
          onClick={onClose}
          aria-label="Popup schließen"
        >
          ✕
        </button>
        <div className={styles.popupKicker}>Kumulierte Sparrate {data.activeYear}</div>
        {/* B3 (Rot bei kumulativ negativer Sparrate) = offener Cluster-3-Slot —
            der Held bleibt bewusst teal, auch bei negativer Jahressumme. */}
        <div className={styles.popupHero}>{fmtSignedEuro(yearTotal)}</div>
        <div className={styles.popupSub}>
          IST (teal), Plan (grau), Vorjahr (gold) · Klick auf einen Monat zeigt die
          drei Treiber
        </div>

        <div className={styles.popupChart} ref={chartRef}>
          <canvas
            ref={canvasRef}
            className={styles.popupCanvas}
            onClick={handleCanvasClick}
          />
        </div>

        {selIdx >= 0 && (
          <div className={styles.popupDrivers}>
            <strong>
              {MONTHS_FULL[selIdx]} {data.activeYear}
            </strong>
            {" · Top-3-Treiber: "}
            {drivers.map((d, i) => (
              <span
                key={`${d.label}-${i}`}
                className={d.isPlaceholder ? styles.popupDriverPlaceholder : undefined}
              >
                {i > 0 && " · "}
                {d.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
