import type { ActiveMonth, Person } from "@/components/income-split/income-split.types";

export type IncomeLabelProps = {
  person: Person;
  splitPercent: number;
  initialGrossAnnual?: number;
  initialNetMonthly?: number;
  counterpartGrossAnnual?: number;
  activeMonth: ActiveMonth;
  taxClass: number;
  taxYear: number;
};
