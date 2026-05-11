export type Person = "ICH" | "PARTNER";

export type ActiveMonth = {
  year: number;
  month: number; // 1..12
};

export type IncomeSplitProps = {
  isOpen: boolean;
  onClose: () => void;
  person: Person;
  activeMonth: ActiveMonth;
  isFirstIncomeEntry: boolean;
  taxClass: number; // aus profiles.tax_class — fuer Estimation-RPC
  taxYear: number;
  initialGrossAnnual?: number;
  initialNetMonthly?: number;
  // Counterpart-Brutto (jeweils der ANDERE) zur Live-Split-Vorschau
  counterpartGrossAnnual?: number;
};
