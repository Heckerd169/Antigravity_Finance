/*
 * DKB-CSV-Parser — Sprint 8 (§11 CSV-Import / Distiller, L1).
 *
 * Pure, framework-frei. Parst einen DKB-Giro-CSV-Export zu Distiller-Zeilen.
 * Reihenfolge: Format-Heuristik → Header-Anker → Datenzeilen → Feld-Mapping.
 * Atomar: schlägt eine Datenzeile fehl, wird die ganze Datei verworfen
 * (errorClass = "corrupt") — kein partielles Ergebnis (§11 / Briefing §3).
 *
 * description_raw (DD-approved Bank-Adapter): "{Zahlungsempfänger*in} | {Verwendungszweck}"
 * — beide Felder byte-exakt aus der CSV-Quelle, ohne Trimming, ohne Normalisierung.
 * Hash-Determinismus bleibt erhalten (Server bildet den SHA-256 daraus).
 */

/** Eine geparste, an die RPC `process_csv_import` übergebbare Zeile. */
export type DkbCsvRow = {
  /** ISO "YYYY-MM-DD". */
  transaction_date: string;
  /** Numerisch, Vorzeichen erhalten (Ausgang negativ, Eingang positiv). */
  amount: number;
  /** "{Zahlungsempfänger*in} | {Verwendungszweck}", byte-exakt. */
  description: string;
  /** Gegen-IBAN (Spalte "IBAN"). Leerer Wert -> null (Sprint 9 P0, Briefing §4).
   *  NICHT Hash-Bestandteil; Re-Import füllt sie per ON CONFLICT DO UPDATE nach. */
  counterparty_iban: string | null;
};

/** Fehler-Klassifikation gemäß Briefing §3 → Portal-State (§11). */
export type DkbParseError = "format" | "empty" | "corrupt";

export type DkbParseResult =
  | {
      ok: true;
      rows: DkbCsvRow[];
      /** v2-04 P7: Zeilen mit Status ≠ "Gebucht" (z. B. "Vorgemerkt"), die
       *  übersprungen wurden — vorgemerkte Umsätze können ihren Hash nach
       *  Buchung ändern (Duplikat-Risiko, Architekten-Freigabe 07/2026). */
      skippedPendingCount: number;
    }
  | { ok: false; errorClass: DkbParseError };

const HEADER_FIRST_FIELD = "Buchungsdatum";
const COL_PAYEE = "Zahlungsempfänger*in";
const COL_PURPOSE = "Verwendungszweck";
const COL_AMOUNT = "Betrag (€)";
const COL_IBAN = "IBAN";
const COL_STATUS = "Status";
/** Format-Heuristik prüft nur die ersten N Zeilen auf den Header-Anker. */
const HEADER_SCAN_LINES = 8;

/**
 * Parst einen DKB-CSV-Text. Gibt entweder die Zeilen oder eine Fehler-Klasse
 * zurück — wirft nie (Fehler werden klassifiziert, nicht geworfen).
 */
export function parseDkbCsv(text: string): DkbParseResult {
  const rawLines = stripBom(text).split(/\r\n|\r|\n/);

  // ── Format-Heuristik: Header-Zeile in den ersten 8 Zeilen finden ──────────
  // (Separator ";" + erste Spalte == "Buchungsdatum".)
  let headerIdx = -1;
  for (let i = 0; i < Math.min(HEADER_SCAN_LINES, rawLines.length); i += 1) {
    const line = rawLines[i];
    if (line.includes(";") && tokenizeLine(line)[0] === HEADER_FIRST_FIELD) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) return { ok: false, errorClass: "format" };

  const header = tokenizeLine(rawLines[headerIdx]);
  const idxDate = header.indexOf(HEADER_FIRST_FIELD);
  const idxPayee = header.indexOf(COL_PAYEE);
  const idxPurpose = header.indexOf(COL_PURPOSE);
  const idxAmount = header.indexOf(COL_AMOUNT);
  // IBAN ist additiv (Sprint 9): fehlt die Spalte (älterer Export), bleibt
  // counterparty_iban null — kein Format-Fehler, damit Sprint-8-CSVs weiter laufen.
  const idxIban = header.indexOf(COL_IBAN);
  // Status ist additiv (v2-04 P7): fehlt die Spalte, wird nicht gefiltert.
  const idxStatus = header.indexOf(COL_STATUS);
  if (idxDate === -1 || idxPayee === -1 || idxPurpose === -1 || idxAmount === -1) {
    return { ok: false, errorClass: "format" };
  }

  // ── Datenzeilen: alles nach dem Header, leere Zeilen verworfen ────────────
  const dataLines = rawLines
    .slice(headerIdx + 1)
    .filter((l) => l.trim() !== "");
  if (dataLines.length === 0) return { ok: false, errorClass: "empty" };

  // ── Feld-Mapping (atomar: erste fehlerhafte Zeile → komplett verwerfen) ───
  const rows: DkbCsvRow[] = [];
  let skippedPendingCount = 0;
  for (const raw of dataLines) {
    const fields = tokenizeLine(raw);

    // v2-04 P7: Status ≠ "Gebucht" (z. B. "Vorgemerkt") → Zeile überspringen,
    // BEVOR Felder validiert werden — eine unfertige vorgemerkte Zeile darf
    // den Import nicht als corrupt kippen. Vorgemerkte Umsätze können ihren
    // Hash nach Buchung ändern → Duplikat-Risiko beim Folge-Import.
    if (idxStatus !== -1 && fields[idxStatus] !== undefined && fields[idxStatus] !== "Gebucht") {
      skippedPendingCount += 1;
      continue;
    }

    const dateField = fields[idxDate];
    const amountField = fields[idxAmount];
    if (dateField === undefined || amountField === undefined) {
      return { ok: false, errorClass: "corrupt" };
    }

    const transactionDate = parseGermanDate(dateField);
    const amount = parseGermanAmount(amountField);
    if (transactionDate === null || amount === null) {
      return { ok: false, errorClass: "corrupt" };
    }

    // Byte-exakt: keine Transformation der Beschreibungs-Felder.
    const payee = fields[idxPayee] ?? "";
    const purpose = fields[idxPurpose] ?? "";
    // Gegen-IBAN: leerer / fehlender Wert -> null (Briefing §4).
    const ibanRaw = idxIban === -1 ? "" : (fields[idxIban] ?? "");
    rows.push({
      transaction_date: transactionDate,
      amount,
      description: `${payee} | ${purpose}`,
      counterparty_iban: ibanRaw === "" ? null : ibanRaw,
    });
  }

  // v2-04 P7: Datei bestand ausschließlich aus vorgemerkten Zeilen → wie
  // "keine Transaktionen" behandeln (nichts Importierbares).
  if (rows.length === 0) return { ok: false, errorClass: "empty" };

  return { ok: true, rows, skippedPendingCount };
}

// ── Tokenizer ─────────────────────────────────────────────────────────────

/**
 * Zerlegt eine CSV-Zeile (Separator ";") in Felder. Respektiert in Quotes
 * eingebettete Semikolons und entwertet `""` → `"`. Trimmt NICHT — Feldwerte
 * bleiben byte-exakt (nur die umschließenden Quotes als CSV-Syntax fallen weg).
 */
function tokenizeLine(line: string): string[] {
  const fields: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ";") {
      fields.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  fields.push(cur);
  return fields;
}

// ── Feld-Parser ─────────────────────────────────────────────────────────────

/**
 * "DD.MM.YY" (oder "DD.MM.YYYY") → ISO "YYYY-MM-DD". Zweistellige Jahre:
 * < 50 → 20YY, sonst 19YY. Gibt null bei unparsbarem Datum (→ corrupt).
 */
function parseGermanDate(raw: string): string | null {
  const m = /^(\d{2})\.(\d{2})\.(\d{2}|\d{4})$/.exec(raw.trim());
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  let year = Number(m[3]);
  if (m[3].length === 2) year = year < 50 ? 2000 + year : 1900 + year;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

/**
 * Deutscher Betrag ("-50,91" / "1.200,00") → numeric. Tausender-"." entfernen,
 * Dezimal-"," → ".". Gibt null bei unparsbarem Betrag (→ corrupt).
 */
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
