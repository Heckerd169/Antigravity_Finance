/*
 * B2-Abweichungs-Treiber (Sprint v2-06) — ersetzt den Platzhalter-Stub aus v2-02.
 *
 * Der UI-Kontrakt ist unverändert: `DriverEntry { label, isPlaceholder }`,
 * Top-1 im Welle-Hover-Tooltip (§9), Top-3 im Popup-Monatsklick (§9). Neu ist
 * allein die Datenquelle: die Jahres-RPC `get_year_deviation_drivers` liefert
 * beim Welle-Load EINEN Datensatz für alle 12 Monate (Konzept-Papier Option c),
 * der Loader legt ihn in `WelleData.drivers` ab.
 *
 * Die Heuristik selbst lebt vollständig in der RPC (keine Betragslogik im
 * Frontend, CLAUDE.md §7 Regel 1). Dieses Modul formatiert nur.
 *
 * `delta` ist die WIRKUNG AUF DIE SPARRATE (User-Entscheid 25.07.2026):
 * negativ = der Monat ist um diesen Betrag schlechter als geplant; bei
 * GEMEINSAM-Karten bereits auf den eigenen Anteil heruntergerechnet.
 */

import { formatAmount } from "@/lib/format";

const NBSP = " ";
const MINUS = "−";

export type DriverEntry = {
  label: string;
  /** true = kein echter Treiber (leerer Monat / Ladefehler) → gedimmte Darstellung. */
  isPlaceholder: boolean;
};

/** Ein Treiber, wie ihn die RPC liefert. */
export type DeviationDriver = {
  cardId: string;
  cardName: string;
  /** FIXED_COST | INCOME | BUDGET. */
  cardType: string;
  /** ICH | GEMEINSAM. */
  attribution: string;
  /** Karten-Ist-Betrag des Monats (roh, wie auf der Karte). */
  ist: number;
  /** Karten-Plan des Monats (adjustment-aware, roh, wie auf der Karte). */
  plan: number;
  /** Angewandter Anteil: 1 bei ICH, Split-Faktor bei GEMEINSAM. */
  share: number;
  /** Wirkung auf die Sparrate, vorzeichenbehaftet und anteilig. */
  delta: number;
};

/** Treiber je Monatsindex 0..11. Fehlender Key = Monat ohne Abweichung. */
export type DriversByMonth = Partial<Record<number, DeviationDriver[]>>;

const NO_DEVIATION: DriverEntry = {
  label: "Keine Abweichungen",
  isPlaceholder: true,
};

const NOT_LOADED: DriverEntry = {
  label: "Treiber nicht verfügbar",
  isPlaceholder: true,
};

/** `−40,00 €` / `+12,50 €` — 2 Dezimalen (Karten-Format), NBSP wie im Tooltip. */
function fmtDelta(delta: number): string {
  const sign = delta >= 0 ? "+" : MINUS;
  return `${sign}${formatAmount(Math.abs(delta))}${NBSP}€`;
}

/** Label-Format laut Konzept §2: `{Kartenname} {±Betrag} €`. */
function toEntry(driver: DeviationDriver): DriverEntry {
  return {
    label: `${driver.cardName} ${fmtDelta(driver.delta)}`,
    isPlaceholder: false,
  };
}

/**
 * Wandelt das jsonb der RPC in die Monats-Map. Defensiv gegen unerwartete
 * Formen (die RPC ist typisiert `Json`), damit ein Datenfehler die Welle nicht
 * zerlegt — im Zweifel bleibt der Monat ohne Treiber.
 */
export function parseYearDrivers(raw: unknown): DriversByMonth {
  if (!Array.isArray(raw)) return {};
  const byMonth: DriversByMonth = {};

  for (const monthEntry of raw) {
    if (typeof monthEntry !== "object" || monthEntry === null) continue;
    const row = monthEntry as Record<string, unknown>;
    const monthIndex = Number(row.month_index);
    if (!Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) continue;
    if (!Array.isArray(row.drivers)) continue;

    const drivers: DeviationDriver[] = [];
    for (const d of row.drivers) {
      if (typeof d !== "object" || d === null) continue;
      const rec = d as Record<string, unknown>;
      const delta = Number(rec.delta);
      if (!Number.isFinite(delta)) continue;
      drivers.push({
        cardId: String(rec.card_id ?? ""),
        cardName: String(rec.card_name ?? ""),
        cardType: String(rec.card_type ?? ""),
        attribution: String(rec.attribution ?? ""),
        ist: Number(rec.ist ?? 0),
        plan: Number(rec.plan ?? 0),
        share: Number(rec.share ?? 1),
        delta,
      });
    }
    if (drivers.length > 0) byMonth[monthIndex] = drivers;
  }

  return byMonth;
}

/** Top-1-Treiber für den Welle-Hover-Tooltip (§9). */
export function getTop1Driver(
  drivers: DriversByMonth | null,
  monthIndex: number,
): DriverEntry {
  if (drivers === null) return NOT_LOADED;
  const first = drivers[monthIndex]?.[0];
  return first ? toEntry(first) : NO_DEVIATION;
}

/** Top-3-Treiber für den Popup-Monatsklick (§9). Die Begrenzung auf 3 macht
 *  bereits die RPC (p_limit) — der slice ist Defense-in-Depth. */
export function getTop3Drivers(
  drivers: DriversByMonth | null,
  monthIndex: number,
): DriverEntry[] {
  if (drivers === null) return [NOT_LOADED];
  const monthDrivers = drivers[monthIndex];
  if (!monthDrivers || monthDrivers.length === 0) return [NO_DEVIATION];
  return monthDrivers.slice(0, 3).map(toEntry);
}
