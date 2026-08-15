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

/** v2-19 (GE-1): Eine dem Netto zugeordnete Gehaltszahlung.
 *
 *  Sie wird in diesem Fenster angezeigt und kann hier gelöst werden — Record,
 *  Entscheidung E. Die Netto-Kachel bekommt bewusst KEIN Kontextmenü (das
 *  schließt Entscheidung A aus), und das Fenster öffnet sich beim Klick auf die
 *  Kachel ohnehin. Damit gibt es genau einen Ort für alles, was das Netto
 *  betrifft, statt zwei. */
export type IncomeAssignment = {
  fragmentId: string;
  /** "YYYY-MM-DD" — das Buchungsdatum, nicht der Zuordnungs-Monat. */
  transactionDate: string;
  description: string;
  amount: number;
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
  /** v2-19 (GE-1): die zugeordnete Gehaltszahlung dieses Monats, falls es eine
   *  gibt. Nur bei `person === "ICH"` relevant — das Partner-Netto ist nicht
   *  ablegbar (Nicht-Ziel des Sprints). */
  assignment?: IncomeAssignment | null;
};
