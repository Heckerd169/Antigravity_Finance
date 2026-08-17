"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { MONTHS_FULL, drawPopupStair, fmtSignedEuro, type WavePoint } from "./draw";
import { getTop3Drivers } from "./drivers";
import type { WelleData, WelleExtras } from "./welle.types";
import styles from "./welle.module.css";

const POPUP_CHART_HEIGHT = 200;
/** Monatsklick-Toleranz in px (Port-Vorlage: bd < 40). */
const CLICK_TOLERANCE = 40;

type WellePopupProps = {
  data: WelleData;
  /** v2-24 P2: Goldlinie und Treiber-Zeile kommen nachgeladen.
   *  `null` = noch unterwegs — die Treppe zeichnet dann ohne Vorjahres-Linie und
   *  füllt sie nach, sobald die Daten da sind. Die Treppe selbst ist vollständig;
   *  es fehlt nur die Referenz. */
  extras: WelleExtras | null;
  onClose: () => void;
};

/**
 * Das Popup der kumulierten Treppe (§9): Single-Surface-Overlay, dismissible
 * per Klick-außen + Escape, KEIN Tooling/Slider. Inhalt: kumulierte Treppe
 * IST (teal) + Plan (grau), Jahressumme als Held, B6-Vorjahres-Linie,
 * Monatsklick → Top-3-Treiber (B2-Platzhalter, Briefing §4).
 */
export function WellePopup({ data, extras, onClose }: WellePopupProps) {
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
      // v2-24 P2: `null` solange nicht geladen — `drawPopupStair` behandelt das
      // bereits als „keine Referenz, keine Linie" (§9 B6). Kommen die Daten an,
      // ändert sich `extras` und dieser Effekt zeichnet die Linie nach; deshalb
      // steht `extras` in der Abhängigkeitsliste.
      prevYearEnd: extras?.prevYearEndCumulative ?? null,
      selectedIndex: selIdx,
    });
    setPts(nextPts);
  }, [data, extras, chartWidth, selIdx]);

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
  // Drei Zustände wie im Tooltip: `undefined` = noch nicht geladen,
  // `null` = geladen und gescheitert, Map = echte Treiber (v2-24 P2).
  const drivers =
    selIdx >= 0
      ? getTop3Drivers(extras === null ? undefined : extras.drivers, selIdx)
      : [];

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
        {/* B3 (§9 v3.1.2): Held folgt der §5-Ring-Logik — rot, wenn der
            ENDWERT negativ ist (Jahresergebnis, nicht der tiefste
            Zwischenstand), sonst teal. */}
        <div
          className={`${styles.popupHero} ${yearTotal < 0 ? styles.popupHeroNegative : ""}`}
        >
          {fmtSignedEuro(yearTotal)}
        </div>
        {/* v2-19 (GE-2, Record F): „die drei Treiber" → „die größten Treiber".
            Seit dieser Runde kann eine vierte Zeile dazukommen — „Gehalt"
            erscheint immer, wenn das Netto abweicht, zusätzlich zu den drei
            Karten-Treibern. Eine Zahl im Text, die die App brechen kann, ist
            eine Zusage zu viel. */}
        <div className={styles.popupSub}>
          IST (teal), Plan (grau), Vorjahr (gold) · Klick auf einen Monat zeigt die
          größten Treiber
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
