/*
 * Cortal-Consors-CSV-Parser — Sprint 9 (§11 CSV-Import, L2).
 *
 * Pure, framework-frei. Parst einen Cortal-Consors-Umsatz-Export zu Distiller-
 * Zeilen (gleiches Output-Schema wie der DKB-Parser, inkl. counterparty_iban).
 * Reihenfolge: Format-Heuristik (strikter Header-Anker) -> Datenzeilen ->
 * Feld-Mapping. Atomar: schlägt eine Datenzeile fehl, wird die ganze Datei
 * verworfen (errorClass = "corrupt") — kein partielles Ergebnis (Briefing §3).
 *
 * Unterschiede zu DKB:
 *  - 10 Vor-Header-Zeilen, Header ab Zeile 11 (1-based), Daten ab Zeile 12.
 *  - Werte NICHT in Anführungszeichen -> einfacher Split auf ";".
 *  - Datum vierstellig (DD.MM.YYYY), kein YY-Window.
 *  - Description aus drei Feldern (Sender/Empfänger | Buchungstext | Verwendungszweck).
 *  - Zusätzlicher Korrupt-Trigger: nicht-EUR-Währung (Spalte 12).
 *
 * §11-Adapter (DD-approved): description_raw = "{Sender / Empfänger} | {Buchungstext}
 * | {Verwendungszweck}", alle drei Felder byte-exakt, ohne Trimming/Normalisierung,
 * "n/a" wird als Literal belassen. counterparty_iban ist NICHT Hash-Bestandteil.
 */

/** Eine geparste, an die RPC `process_csv_import` übergebbare Zeile. */
export type CortalCsvRow = {
  /** ISO "YYYY-MM-DD". */
  transaction_date: string;
  /** Numerisch, Vorzeichen erhalten. */
  amount: number;
  /** "{Sender / Empfänger} | {Buchungstext} | {Verwendungszweck}", byte-exakt. */
  description: string;
  /** Gegen-IBAN (Spalte 4). "n/a" oder leer -> null (Briefing §3). */
  counterparty_iban: string | null;
};

export type CortalParseError = "format" | "empty" | "corrupt";

export type CortalParseResult =
  | { ok: true; rows: CortalCsvRow[] }
  | { ok: false; errorClass: CortalParseError };

/** Strikter Header-Anker (OQ4: byte-exakt inkl. Trailing-Space nach "Buchung"). */
const HEADER_ANCHOR =
  "Buchung ;Valuta;Sender / Empfänger;IBAN;BIC;Buchungstext;Verwendungszweck;Kategorie;Stichwörter;Umsatz geteilt;Betrag;Währung";
/** Format-Heuristik prüft nur die ersten N Zeilen auf den Header-Anker. */
const HEADER_SCAN_LINES = 12;

// Spalten-Indizes (0-based) gemäß Header-Reihenfolge.
const IDX_DATE = 0; // Buchung (DD.MM.YYYY)
const IDX_IBAN = 3; // IBAN
const IDX_SENDER = 2; // Sender / Empfänger
const IDX_BOOKING_TEXT = 5; // Buchungstext
const IDX_PURPOSE = 6; // Verwendungszweck
const IDX_AMOUNT = 10; // Betrag
const IDX_CURRENCY = 11; // Währung
const MIN_FIELDS = 12;

/**
 * Parst einen Cortal-Consors-CSV-Text. Gibt entweder die Zeilen oder eine
 * Fehler-Klasse zurück — wirft nie (Fehler werden klassifiziert, nicht geworfen).
 */
export function parseCortalCsv(text: string): CortalParseResult {
  const rawLines = stripBom(text).split(/\r\n|\r|\n/);

  // ── Format-Heuristik: strikter Header-Match in den ersten 12 Zeilen ────────
  let headerIdx = -1;
  for (let i = 0; i < Math.min(HEADER_SCAN_LINES, rawLines.length); i += 1) {
    if (rawLines[i] === HEADER_ANCHOR) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) return { ok: false, errorClass: "format" };

  // ── Datenzeilen: alles nach dem Header, leere Zeilen verworfen ─────────────
  const dataLines = rawLines
    .slice(headerIdx + 1)
    .filter((l) => l.trim() !== "");
  if (dataLines.length === 0) return { ok: false, errorClass: "empty" };

  // ── Feld-Mapping (atomar: erste fehlerhafte Zeile -> komplett verwerfen) ────
  const rows: CortalCsvRow[] = [];
  for (const raw of dataLines) {
    // Cortal-Werte sind nicht gequotet -> einfacher Split auf ";".
    const fields = raw.split(";");
    if (fields.length < MIN_FIELDS) {
      return { ok: false, errorClass: "corrupt" };
    }

    const transactionDate = parseCortalDate(fields[IDX_DATE]);
    const amount = parseGermanAmount(fields[IDX_AMOUNT]);
    if (transactionDate === null || amount === null) {
      return { ok: false, errorClass: "corrupt" };
    }

    // Währung muss EUR sein (Briefing §3 / OQ2). Cross-Currency ist out of scope.
    if (fields[IDX_CURRENCY].trim() !== "EUR") {
      return { ok: false, errorClass: "corrupt" };
    }

    // Byte-exakt: drei Felder mit Pipe-Separator, "n/a" als Literal belassen.
    const sender = fields[IDX_SENDER] ?? "";
    const bookingText = fields[IDX_BOOKING_TEXT] ?? "";
    const purpose = fields[IDX_PURPOSE] ?? "";
    const ibanRaw = fields[IDX_IBAN] ?? "";
    rows.push({
      transaction_date: transactionDate,
      amount,
      description: `${sender} | ${bookingText} | ${purpose}`,
      counterparty_iban:
        ibanRaw === "" || ibanRaw === "n/a" ? null : ibanRaw,
    });
  }

  return { ok: true, rows };
}

// ── Feld-Parser ─────────────────────────────────────────────────────────────

/** "DD.MM.YYYY" -> ISO "YYYY-MM-DD". Vierstelliges Jahr. null bei unparsbar. */
function parseCortalDate(raw: string): string | null {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(raw.trim());
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

/** Deutscher Betrag ("-1.940,00" / "2.700,00") -> numeric. null bei unparsbar. */
function parseGermanAmount(raw: string): number | null {
  const cleaned = raw.trim().replace(/\./g, "").replace(",", ".");
  if (!/^[+-]?\d+(\.\d+)?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

// ── Helper ────────────────────────────────────────────────────────────────

function stripBom(s: string): string {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}
