export type Person = "ICH" | "PARTNER";

/** v2-16 (PA-1): Die Typen der Konsequenz-Anzeige leben in `consequence.ts` —
 *  zusammen mit der Rechnung, und dort ohne Importe, damit der
 *  Regressions-Wächter die Quelldatei direkt laden kann. Hier nur
 *  weitergereicht, damit die bestehenden Importpfade gültig bleiben. */
export type {
  SplitConsequence,
  SplitConsequenceItem,
} from "./consequence";

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
