import type { ReactNode } from "react";
import type { DriversByMonth } from "./drivers";

/** Ein Monatspunkt der Jahres-Welle + kumulierten Popup-Treppe (Design-Doku §9). */
export type WelleMonthPoint = {
  /** 0 = Januar … 11 = Dezember. */
  monthIndex: number;
  /** Monatliche Ist-Sparrate (calculate_sparrate_for_month). null = RPC lieferte null. */
  istMonthly: number | null;
  /** Monatliche Plan-Sparrate (calculate_planned_sparrate_for_month). */
  planMonthly: number | null;
  /** Kumuliert Jan→Monat (Teal-Treppe im Popup). null-Monate zählen als 0. */
  istCumulative: number;
  /** Kumuliert Jan→Monat (Grau-Treppe im Popup). */
  planCumulative: number;
};

/** Vollständige Datengrundlage der Welle für ein Kalenderjahr (B1). */
export type WelleData = {
  /** Aktives Kalenderjahr (= Jahr des targetMonth, §9 „aktives Jahr aus month-Param"). */
  activeYear: number;
  /** Vorjahr (activeYear − 1) — für das Legenden-Label „Vorjahr (gold)". */
  prevYear: number;
  /** 12 Punkte Jan…Dez. */
  points: WelleMonthPoint[];
  /** B6: kumulierter Jahresendwert des Vorjahres (Σ Jan–Dez X-1).
   *  null = Vorjahr nicht abgeschlossen ODER komplett datenlos → Linie entfällt. */
  prevYearEndCumulative: number | null;
  /** B2 (v2-06): Abweichungs-Treiber je Monat aus `get_year_deviation_drivers`.
   *  null = Treiber-Load fehlgeschlagen (die Welle rendert trotzdem). */
  drivers: DriversByMonth | null;
};

export type WelleStageProps = {
  /** null = Daten-Load fehlgeschlagen/Onboarding offen → Stage rendert ohne Welle. */
  data: WelleData | null;
  /** 0..11 — der im Header gewählte aktive Monat (steuert NUR den einen Kreis, §9). */
  activeMonthIndex: number;
  /** D1: letzter realisierter Monat („jetzt"), fix und unabhängig vom Header-Monat.
   *  -1 = kein Monat des Fensters realisiert (Zukunftsjahr) · 11 = ganzes Jahr (Vergangenheitsjahr). */
  realizedMonthIndex: number;
  /** Income-Label ICH (links vom Ring). */
  leftSlot: ReactNode;
  /** Singularity Ring (grafisch vor der Welle, interaktions-transparent §5). */
  ringSlot: ReactNode;
  /** Income-Label PARTNER (rechts vom Ring). */
  rightSlot: ReactNode;
};
