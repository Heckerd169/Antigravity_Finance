"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { TreppeProps } from "./treppe.types";
import styles from "./treppe.module.css";

const MONTHS_SHORT = [
  "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
  "Jul", "Aug", "Sep", "Okt", "Nov", "Dez",
];
const MONTHS_FULL = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

// Geometrie-Konstanten (1:1 aus Prototyp sparrate_treppe_final_v2.html).
const H = 210;
const PAD_L = 8;
const PAD_T = 20;
const PAD_B = 24;
const N = 12;
const DOT_R = 2.5;
const DOT_R_ACTIVE = 5;
const SELECT_RING_R = 7;

const TEAL = "62,207,175";
const GRAY = "255,255,255";
const GOLD = "255,200,60";
const OP_IST = 0.5; // §4 Visual-Spec Teal
const OP_PLAN = 0.3; // §4 Visual-Spec Grau

const NBSP = " ";

function fmtSignedEuro(v: number): string {
  const sign = v >= 0 ? "+" : "−";
  const abs = Math.abs(Math.round(v)).toLocaleString("de-DE");
  return `${sign}${abs}${NBSP}€`;
}

type Geo = {
  W: number;
  cW: number;
  cH: number;
  padR: number;
  stepX: number;
  minV: number;
  range: number;
  xOf: (i: number) => number;
  yOf: (v: number) => number;
};

function buildGeo(W: number, istCum: number[], planCum: number[], prevEnd: number | null): Geo {
  const all = [...istCum, ...planCum, 0];
  if (prevEnd !== null) all.push(prevEnd);
  const minV = Math.min(...all);
  const maxV = Math.max(...all);
  const range = maxV - minV || 1;

  const padR = prevEnd !== null ? 106 : 16;
  const cW = W - PAD_L - padR;
  const cH = H - PAD_T - PAD_B;
  const stepX = cW / (N - 1);

  return {
    W,
    cW,
    cH,
    padR,
    stepX,
    minV,
    range,
    xOf: (i) => PAD_L + i * stepX,
    yOf: (v) => PAD_T + cH - ((v - minV) / range) * cH,
  };
}

/** Step-Pfad (Wert wird bis zum nächsten Monat gehalten, dann vertikaler Sprung). */
function staircasePath(geo: Geo, cum: number[]): string {
  let d = `M ${geo.xOf(0)} ${geo.yOf(cum[0])}`;
  for (let i = 1; i < N; i++) {
    d += ` L ${geo.xOf(i)} ${geo.yOf(cum[i - 1])} L ${geo.xOf(i)} ${geo.yOf(cum[i])}`;
  }
  return d;
}

/** Gefüllte Fläche unter der Treppe (bis zur Nulllinie geschlossen). */
function staircaseFillPath(geo: Geo, cum: number[]): string {
  const y0 = geo.yOf(0);
  let d = `M ${geo.xOf(0)} ${y0} L ${geo.xOf(0)} ${geo.yOf(cum[0])}`;
  for (let i = 1; i < N; i++) {
    d += ` L ${geo.xOf(i)} ${geo.yOf(cum[i - 1])} L ${geo.xOf(i)} ${geo.yOf(cum[i])}`;
  }
  d += ` L ${geo.xOf(N - 1)} ${y0} Z`;
  return d;
}

export function Treppe({ data }: TreppeProps) {
  const { points, prevYearEndCumulative, prevYear, activeYear, netMonthly } = data;

  const istCum = points.map((p) => p.istCumulative);
  const planCum = points.map((p) => p.planCumulative);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(0);
  const [hovIdx, setHovIdx] = useState<number>(-1);
  const [selIdx, setSelIdx] = useState<number>(-1);

  // LL-5: monatsspezifischer Client-State muss bei Navigation zurückgesetzt
  // werden — Soft-Navigation un-mountet die Komponente nicht.
  useEffect(() => {
    setHovIdx(-1);
    setSelIdx(-1);
  }, [activeYear]);

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ready = width > 0;
  const geo = ready
    ? buildGeo(width, istCum, planCum, prevYearEndCumulative)
    : null;

  return (
    <section
      className={styles.treppe}
      aria-label={`Sparraten-Treppe ${activeYear} — kumulierte Sparrate über das Jahr`}
    >
      <div className={styles.legend}>
        <span className={styles.legItem}>
          <span className={styles.legDot} style={{ background: `rgba(${TEAL},.8)` }} />
          <span className={styles.legLabel}>Tatsächlich kumuliert</span>
        </span>
        <span className={styles.legItem}>
          <span className={styles.legDot} style={{ background: `rgba(${GRAY},.5)` }} />
          <span className={styles.legLabel}>Geplant kumuliert</span>
        </span>
        {prevYearEndCumulative !== null && (
          <span className={styles.legItem}>
            <span className={styles.legDot} style={{ background: `rgba(${GOLD},.6)` }} />
            <span className={styles.legLabel} style={{ color: `rgba(${GOLD},.6)` }}>
              Vorjahr {prevYear}
            </span>
          </span>
        )}
      </div>

      <div className={styles.chartArea} ref={wrapperRef}>
        {geo && (
          <svg
            className={styles.svg}
            width={geo.W}
            height={H}
            viewBox={`0 0 ${geo.W} ${H}`}
            role="img"
            onMouseLeave={() => setHovIdx(-1)}
          >
            <defs>
              <linearGradient id="treppeFillIst" x1="0" y1={PAD_T} x2="0" y2={PAD_T + geo.cH} gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor={`rgba(${TEAL},${(OP_IST * 0.35).toFixed(2)})`} />
                <stop offset="1" stopColor={`rgba(${TEAL},0.01)`} />
              </linearGradient>
              <linearGradient id="treppeFillPlan" x1="0" y1={PAD_T} x2="0" y2={PAD_T + geo.cH} gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor={`rgba(${GRAY},${(OP_PLAN * 0.35).toFixed(2)})`} />
                <stop offset="1" stopColor={`rgba(${GRAY},0.01)`} />
              </linearGradient>
            </defs>

            {/* Nulllinie */}
            <line
              x1={PAD_L}
              y1={geo.yOf(0)}
              x2={PAD_L + geo.cW}
              y2={geo.yOf(0)}
              stroke={`rgba(${GRAY},.08)`}
              strokeWidth={0.5}
            />

            {/* Vorjahres-Linie (gold, gestrichelt) + Betrag-Label */}
            {prevYearEndCumulative !== null && (
              <>
                <line
                  x1={PAD_L}
                  y1={geo.yOf(prevYearEndCumulative)}
                  x2={PAD_L + geo.cW}
                  y2={geo.yOf(prevYearEndCumulative)}
                  stroke={`rgba(${GOLD},.3)`}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <text
                  className={styles.prevLabel}
                  x={geo.xOf(N - 1) + 10}
                  y={geo.yOf(prevYearEndCumulative) + 3}
                  fill={`rgba(${GOLD},0.75)`}
                >
                  {fmtSignedEuro(prevYearEndCumulative)}
                </text>
              </>
            )}

            {/* Grau-Treppe (Plan) zuerst, darunterliegend */}
            <path d={staircaseFillPath(geo, planCum)} fill="url(#treppeFillPlan)" />
            <path
              d={staircasePath(geo, planCum)}
              fill="none"
              stroke={`rgba(${GRAY},${OP_PLAN})`}
              strokeWidth={1.5}
              strokeLinejoin="round"
            />

            {/* Teal-Treppe (Ist) darüber */}
            <path d={staircaseFillPath(geo, istCum)} fill="url(#treppeFillIst)" />
            <path
              d={staircasePath(geo, istCum)}
              fill="none"
              stroke={`rgba(${TEAL},${OP_IST})`}
              strokeWidth={1.5}
              strokeLinejoin="round"
            />

            {/* Plan-Dots */}
            {planCum.map((v, i) => {
              const active = i === hovIdx;
              return (
                <circle
                  key={`p${i}`}
                  cx={geo.xOf(i)}
                  cy={geo.yOf(v)}
                  r={active ? DOT_R_ACTIVE : DOT_R}
                  fill={`rgba(${GRAY},${active ? Math.min(OP_PLAN + 0.35, 1) : OP_PLAN})`}
                />
              );
            })}

            {/* Ist-Dots (Hover + Selektion) */}
            {istCum.map((v, i) => {
              const active = i === hovIdx || i === selIdx;
              return (
                <g key={`i${i}`}>
                  {i === selIdx && (
                    <circle
                      cx={geo.xOf(i)}
                      cy={geo.yOf(v)}
                      r={SELECT_RING_R}
                      fill="none"
                      stroke={`rgba(${TEAL},0.35)`}
                      strokeWidth={1}
                    />
                  )}
                  <circle
                    cx={geo.xOf(i)}
                    cy={geo.yOf(v)}
                    r={active ? DOT_R_ACTIVE : DOT_R}
                    fill={`rgba(${TEAL},${active ? Math.min(OP_IST + 0.35, 1) : OP_IST})`}
                  />
                </g>
              );
            })}

            {/* Monats-Labels */}
            {MONTHS_SHORT.map((m, i) => (
              <text
                key={`m${i}`}
                className={styles.monthLabel}
                x={geo.xOf(i)}
                y={H - 5}
                fill={`rgba(${GRAY},.18)`}
                textAnchor="middle"
              >
                {m}
              </text>
            ))}

            {/* Transparente Spalten-Hitzonen für Hover/Klick */}
            {points.map((_, i) => (
              <rect
                key={`h${i}`}
                x={geo.xOf(i) - geo.stepX / 2}
                y={0}
                width={geo.stepX}
                height={H}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHovIdx(i)}
                onClick={() => setSelIdx((cur) => (cur === i ? -1 : i))}
              />
            ))}
          </svg>
        )}

        {geo && hovIdx >= 0 && (
          <TreppeTooltip
            geo={geo}
            idx={hovIdx}
            istMonthly={points[hovIdx].istMonthly}
            istCum={istCum[hovIdx]}
            planCum={planCum[hovIdx]}
            netMonthly={netMonthly}
            activeYear={activeYear}
          />
        )}
      </div>

      {selIdx >= 0 && (
        <div className={styles.deviationBox}>
          <span className={styles.devIcon}>↘</span>
          <span className={styles.devText}>
            <strong>{MONTHS_FULL[selIdx]} {activeYear}</strong>
            {NBSP}·{NBSP}Treiber-Hinweis: V2 — die Top-3-Abweichungstreiber sind ein
            Analytics-Feature für eine spätere Version (§9).
          </span>
        </div>
      )}
    </section>
  );
}

type TooltipProps = {
  geo: Geo;
  idx: number;
  istMonthly: number | null;
  istCum: number;
  planCum: number;
  netMonthly: number | null;
  activeYear: number;
};

function TreppeTooltip({ geo, idx, istMonthly, istCum, planCum, netMonthly, activeYear }: TooltipProps) {
  const dotX = geo.xOf(idx);
  const dotY = geo.yOf(istCum);

  // Primärzeile: % monatlich (falls Netto bekannt), sonst €-Monatswert als Fallback.
  const monthly = istMonthly ?? 0;
  let primary: string;
  let primaryNegative: boolean;
  if (netMonthly && netMonthly > 0) {
    const pct = Math.round((monthly / netMonthly) * 100);
    primary = `${pct >= 0 ? "+" : "−"}${Math.abs(pct)}${NBSP}% monatlich`;
    primaryNegative = pct < 0;
  } else {
    primary = `${fmtSignedEuro(monthly)} monatlich`;
    primaryNegative = monthly < 0;
  }

  // Position: rechts neben dem Dot, ggf. nach links kippen am rechten Rand.
  const TT_W = 200;
  let left = dotX + 14;
  if (left + TT_W > geo.W - 8) left = dotX - TT_W - 14;
  if (left < 0) left = 4;
  let top = dotY - 85;
  if (top < 0) top = 4;

  return (
    <div className={styles.tooltip} style={{ left, top }}>
      <div className={styles.ttMonth}>
        {MONTHS_FULL[idx]} {activeYear}
      </div>
      <div
        className={styles.ttPct}
        style={{ color: primaryNegative ? "var(--color-red)" : `rgba(62,207,175,.9)` }}
      >
        {primary}
      </div>
      <div className={styles.ttDiv} />
      <div className={styles.ttRow}>
        <span className={styles.ttLabel}>IST kumuliert</span>
        <span className={styles.ttVal} style={{ color: `rgba(62,207,175,.9)` }}>
          {fmtSignedEuro(istCum)}
        </span>
      </div>
      <div className={styles.ttRow}>
        <span className={styles.ttLabel}>Plan kumuliert</span>
        <span className={styles.ttVal} style={{ color: `rgba(255,255,255,.45)` }}>
          {fmtSignedEuro(planCum)}
        </span>
      </div>
    </div>
  );
}
