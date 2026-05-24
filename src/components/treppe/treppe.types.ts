/** Ein Monatspunkt der Sparraten-Treppe (Design-Doku §9). */
export type TreppeMonthPoint = {
  /** 0 = Januar … 11 = Dezember. */
  monthIndex: number;
  /** Monatliche Ist-Sparrate (calculate_sparrate_for_month). null = RPC lieferte null. */
  istMonthly: number | null;
  /** Monatliche Plan-Sparrate (calculate_planned_sparrate_for_month). */
  planMonthly: number | null;
  /** Kumuliert Jan→Monat (Teal-Treppe). null-Monate zählen als 0. */
  istCumulative: number;
  /** Kumuliert Jan→Monat (Grau-Treppe). */
  planCumulative: number;
};

/** Vollständige Datengrundlage der Treppe für ein Kalenderjahr. */
export type TreppeData = {
  /** Aktives Kalenderjahr (= Jahr des targetMonth). */
  activeYear: number;
  /** Vorjahr (activeYear − 1) — nur für das Legenden-Label „Vorjahr [Jahr]". */
  prevYear: number;
  /** 12 Punkte Jan…Dez. */
  points: TreppeMonthPoint[];
  /** Kumulierter Jahresendwert des Vorjahres (Σ Jan–Dez X-1). null im Zukunftsjahr
   *  (Vorjahr noch nicht abgeschlossen — §9 Vorjahres-Referenz-Tabelle). */
  prevYearEndCumulative: number | null;
  /** Haushalts-Netto/Monat als Nenner für die „% monatlich"-Tooltip-Zeile.
   *  null/0 → Tooltip fällt auf den €-Monatswert zurück. */
  netMonthly: number | null;
};

export type TreppeProps = {
  data: TreppeData;
};
