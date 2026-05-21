"use client";

import { useState } from "react";
import { IncomeSplitPopup } from "@/components/income-split";
import type { IncomeLabelProps } from "./income-labels.types";
import styles from "./income-labels.module.css";

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
        <div className={styles.avatar} />
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
