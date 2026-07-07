/*
 * CSV-Format-Router — Sprint 9 (§11 CSV-Import, L3).
 *
 * Pure, framework-frei. Bekommt den rohen CSV-Text, erkennt das Bank-Format
 * und ruft den passenden Parser. Gibt die geparsten Zeilen + den p_format_hint
 * für die RPC zurück — oder eine Fehler-Klasse.
 *
 * Reihenfolge (Briefing §5): Cortal-Heuristik VOR DKB-Heuristik prüfen — beide
 * nutzen ";"-Separator, aber Cortal hat keine Anführungszeichen und einen
 * distinkten Header. Erst-Cortal stabilisiert die Erkennung.
 * Sprint v2-04 ①: DKB-Visa (Kreditkarte) als drittes Format — Header-Anker
 * "Belegdatum" ist distinkt zum Giro-Anker "Buchungsdatum", die Reihenfolge
 * Visa-vor-Giro ist daher nur Konvention (spezifischeres Format zuerst).
 *
 * Semantik der Fehler-Klassen: Ein Parser meldet "format", wenn sein Header-
 * Anker nicht gefunden wird (= dieses Format passt nicht -> nächsten probieren).
 * Meldet er "empty" oder "corrupt", hat das Format gepasst, aber die Daten sind
 * fehlerhaft -> kein Fall-Through, der Fehler wird durchgereicht.
 */

import { parseCortalCsv } from "./cortal-csv";
import { parseDkbCsv } from "./dkb-csv";
import { parseDkbVisaCsv } from "./dkb-visa-csv";

/** p_format_hint-Werte der RPC `process_csv_import`. */
export type CsvFormatHint = "DKB" | "CORTAL_CONSORS" | "DKB_VISA";

/** Vereinheitlichte Parser-Ausgabe — Shape von DkbCsvRow == CortalCsvRow. */
export type ParsedCsvRow = {
  transaction_date: string; // ISO "YYYY-MM-DD"
  amount: number;
  description: string; // byte-exakt, Bank-Adapter-Format
  counterparty_iban: string | null;
};

export type CsvRouteError = "format" | "empty" | "corrupt";

export type CsvRouteResult =
  | { ok: true; formatHint: CsvFormatHint; rows: ParsedCsvRow[] }
  | { ok: false; errorClass: CsvRouteError };

/**
 * Erkennt das Format und parst. Cortal zuerst, dann DKB-Visa, dann DKB-Giro,
 * sonst "format".
 */
export function routeAndParseCsv(text: string): CsvRouteResult {
  // ── 1) Cortal-Heuristik ────────────────────────────────────────────────────
  const cortal = parseCortalCsv(text);
  if (cortal.ok) {
    return { ok: true, formatHint: "CORTAL_CONSORS", rows: cortal.rows };
  }
  // Format passte (Header gefunden), aber Daten fehlerhaft -> durchreichen.
  if (cortal.errorClass !== "format") {
    return { ok: false, errorClass: cortal.errorClass };
  }

  // ── 2) DKB-Visa-Heuristik (Kreditkarte, Sprint v2-04 ①) ────────────────────
  const visa = parseDkbVisaCsv(text);
  if (visa.ok) {
    return { ok: true, formatHint: "DKB_VISA", rows: visa.rows };
  }
  if (visa.errorClass !== "format") {
    return { ok: false, errorClass: visa.errorClass };
  }

  // ── 3) DKB-Giro-Heuristik ──────────────────────────────────────────────────
  const dkb = parseDkbCsv(text);
  if (dkb.ok) {
    return { ok: true, formatHint: "DKB", rows: dkb.rows };
  }
  if (dkb.errorClass !== "format") {
    return { ok: false, errorClass: dkb.errorClass };
  }

  // ── 4) Keines erkannt ──────────────────────────────────────────────────────
  return { ok: false, errorClass: "format" };
}
