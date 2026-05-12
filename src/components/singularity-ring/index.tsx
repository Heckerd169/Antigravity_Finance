"use client";

import { useEffect, useRef, useState } from "react";
import type {
  RingCenterColor,
  RingState,
  SingularityRingProps,
} from "./singularity-ring.types";
import styles from "./singularity-ring.module.css";

const R = 98;
const STROKE_WIDTH = 9;
const C = 2 * Math.PI * R;
const HC = C / 2;

const CX = 124;
const CY = 124;
const DOT_R = 3.5;
const DOT_TOP_Y = 26;
const DOT_BOTTOM_Y = 222;

const POS_ARC_TRANSFORM = "rotate(90deg)";
const NEG_ARC_TRANSFORM = "scaleX(-1) rotate(90deg)";

const ARC_STYLE_BASE = {
  transformBox: "fill-box" as const,
  transformOrigin: "center" as const,
};

const NBSP = " ";
const MINUS = "−";

const NEUTRAL_STATE: RingState = {
  posOffset: C,
  negOffset: C,
  centerColor: "white",
  subtext: null,
  subtextColor: "muted",
};

function formatPct(n: number): string {
  return n.toLocaleString("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function formatEur(n: number): string {
  const sign = n >= 0 ? "+" : MINUS;
  const abs = Math.abs(n).toLocaleString("de-DE", { maximumFractionDigits: 0 });
  return `${sign}${abs}${NBSP}€`;
}

function computeRingState(current: number, plan: number): RingState {
  if (plan === 0) {
    return {
      posOffset: C,
      negOffset: C,
      centerColor: "white",
      subtext: null,
      subtextColor: "muted",
    };
  }

  const pct = current / plan;

  const centerColor: RingCenterColor =
    current < 0 ? "red" : current <= plan ? "white" : "teal";

  if (current >= 0) {
    const fill = Math.min(pct * HC, C - 0.5);
    const posOffset = C - fill;
    if (current > plan) {
      return {
        posOffset,
        negOffset: C,
        centerColor,
        subtext: `+${formatPct((pct - 1) * 100)}${NBSP}% über Plan`,
        subtextColor: "teal",
      };
    }
    return {
      posOffset,
      negOffset: C,
      centerColor,
      subtext: `${formatPct(pct * 100)}${NBSP}% von Plan`,
      subtextColor: "muted",
    };
  }

  const fill = Math.min(Math.abs(pct), 1) * HC;
  const negOffset = C - fill;
  return {
    posOffset: C,
    negOffset,
    centerColor,
    subtext: `${MINUS}${formatPct(Math.abs(pct) * 100)}${NBSP}% Defizit`,
    subtextColor: "red",
  };
}

export function SingularityRing({ currentSparrate, plannedSparrate }: SingularityRingProps) {
  const isEmpty = currentSparrate === null || plannedSparrate === null;

  const target: RingState = isEmpty
    ? NEUTRAL_STATE
    : computeRingState(currentSparrate, plannedSparrate);

  const [posOffset, setPosOffset] = useState<number>(C);
  const [negOffset, setNegOffset] = useState<number>(C);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      setPosOffset(target.posOffset);
      setNegOffset(target.negOffset);
      rafRef.current = null;
    });
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [target.posOffset, target.negOffset]);

  const centerText = isEmpty ? "—" : formatEur(currentSparrate);

  return (
    <div className={styles.ringStage}>
      <svg
        className={styles.svg}
        viewBox="0 0 248 248"
        role="img"
        aria-label="Singularity Ring — Sparrate des aktuellen Monats"
      >
        <circle
          className={styles.track}
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          strokeWidth={STROKE_WIDTH}
        />
        <circle
          className={`${styles.arc} ${styles.arcNeg}`}
          cx={CX}
          cy={CY}
          r={R}
          strokeDasharray={C}
          strokeDashoffset={negOffset}
          style={{ ...ARC_STYLE_BASE, transform: NEG_ARC_TRANSFORM }}
        />
        <circle
          className={`${styles.arc} ${styles.arcPos}`}
          cx={CX}
          cy={CY}
          r={R}
          strokeDasharray={C}
          strokeDashoffset={posOffset}
          style={{ ...ARC_STYLE_BASE, transform: POS_ARC_TRANSFORM }}
        />
        <circle className={styles.dot} cx={CX} cy={DOT_BOTTOM_Y} r={DOT_R} />
        <circle className={styles.dot} cx={CX} cy={DOT_TOP_Y} r={DOT_R} />
      </svg>

      <div className={styles.center}>
        <div className={styles.centerValue} data-color={target.centerColor}>
          {centerText}
        </div>
        <div className={styles.label}>SPARRATE</div>
        <div className={styles.subtext} data-color={target.subtextColor}>
          {target.subtext ?? ""}
        </div>
      </div>
    </div>
  );
}
