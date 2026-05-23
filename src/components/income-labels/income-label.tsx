"use client";

import { useState } from "react";
import { IncomeSplitPopup } from "@/components/income-split";
import type { IncomeLabelProps } from "./income-labels.types";
import styles from "./income-labels.module.css";

// Person-Silhouette — inline-SVG 1:1 aus Prototyp income_split_final.html (.av).
function PersonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="4.8" r="2.2" stroke="rgba(255,255,255,.45)" strokeWidth="1" />
      <path
        d="M2 13c0-2.76 2.24-5 5-5s5 2.24 5 5"
        stroke="rgba(255,255,255,.45)"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IncomeLabel({
  person,
  splitPercent,
  initialGrossAnnual,
  initialNetMonthly,
  counterpartGrossAnnual,
  activeMonth,
  taxClass,
  taxYear,
}: IncomeLabelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const displayName = person === "ICH" ? "Ich" : "Partner";

  return (
    <>
      <button
        type="button"
        className={`${styles.label} ${isOpen ? styles.labelActive : ""}`}
        onClick={() => setIsOpen(true)}
        aria-label={`${displayName} — Jahresbrutto bearbeiten`}
      >
        <div className={styles.avatar}>
          <PersonIcon />
        </div>
        <div className={styles.percent}>{splitPercent} %</div>
        <div className={styles.name}>{displayName}</div>
      </button>

      <IncomeSplitPopup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        person={person}
        activeMonth={activeMonth}
        isFirstIncomeEntry={false}
        taxClass={taxClass}
        taxYear={taxYear}
        initialGrossAnnual={initialGrossAnnual}
        initialNetMonthly={initialNetMonthly}
        counterpartGrossAnnual={counterpartGrossAnnual}
      />
    </>
  );
}
