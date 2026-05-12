"use client";

import { useState } from "react";
import { IncomeSplitPopup } from "@/components/income-split";
import type { Person } from "@/components/income-split/income-split.types";
import styles from "./page.module.css";

type LatestIncome = {
  grossAnnual: number;
  netMonthly: number;
} | null;

type Props = {
  ichLatest: LatestIncome;
  partnerLatest: LatestIncome;
  isFirstIncomeForIch: boolean;
  taxClass: number;
  taxYear: number;
  activeMonth: { year: number; month: number };
  // Optional: testweise einen vergangenen Monat erzwingen (siehe A17).
  forcePastMonth?: { year: number; month: number };
};

// TODO Sprint 2/3: Diese Trigger durch Klick auf Ring-Avatare (ICH/PARTNER-Label
// rund um den Singularity Ring) ersetzen — siehe Design-Doku §10. Bis dahin
// dient dieses Panel als reines Dev-Hilfsmittel zum Oeffnen der Popup-
// Komponente.
export function DashboardDevPanel({
  ichLatest,
  partnerLatest,
  isFirstIncomeForIch,
  taxClass,
  taxYear,
  activeMonth,
  forcePastMonth,
}: Props) {
  const [openPerson, setOpenPerson] = useState<Person | null>(null);

  const monthForPopup = openPerson != null && forcePastMonth ? forcePastMonth : activeMonth;

  return (
    <>
      <div className={styles.devPanel}>
        <span className={styles.devLabel}>DEV</span>
        <button
          type="button"
          className={styles.devButton}
          onClick={() => setOpenPerson("ICH")}
        >
          [DEV] ICH bearbeiten
        </button>
        <button
          type="button"
          className={styles.devButton}
          onClick={() => setOpenPerson("PARTNER")}
        >
          [DEV] PARTNER bearbeiten
        </button>
      </div>

      {openPerson && (
        <IncomeSplitPopup
          isOpen={true}
          onClose={() => setOpenPerson(null)}
          person={openPerson}
          activeMonth={monthForPopup}
          isFirstIncomeEntry={openPerson === "ICH" ? isFirstIncomeForIch : false}
          taxClass={taxClass}
          taxYear={taxYear}
          initialGrossAnnual={
            openPerson === "ICH" ? ichLatest?.grossAnnual : partnerLatest?.grossAnnual
          }
          initialNetMonthly={
            openPerson === "ICH" ? ichLatest?.netMonthly : partnerLatest?.netMonthly
          }
          counterpartGrossAnnual={
            openPerson === "ICH" ? partnerLatest?.grossAnnual : ichLatest?.grossAnnual
          }
        />
      )}
    </>
  );
}
