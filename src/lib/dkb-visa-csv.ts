/*
 * DKB-Visa-CSV-Parser (Kreditkarte) — Sprint v2-04 (§11 CSV-Import, ①).
 *
 * Pure, framework-frei. Parst einen DKB-Visa-Kreditkarten-Export zu Distiller-
 * Zeilen (gleiches Output-Schema wie DKB-Giro/Cortal). Reihenfolge:
 * Format-Heuristik → Header-Anker → Datenzeilen → Feld-Mapping. Atomar:
 * schlägt eine Datenzeile fehl, wird die ganze Datei verworfen
 * (errorClass = "corrupt") — kein partielles Ergebnis.
 *
 * Parser-Vertrag (bindend, Migrations-Entwurf §2):
 *  - description = Spalte "Beschreibung" UNVERÄNDERT (byte-exakt, kein
 *    Composite) — die KK-Klassifikation der RPC (Einzahlung/Ausgleich
 *    Kreditkarte, Betrag > 0 → INTERNAL_TRANSFER) hängt am Prefix-Match.
 *  - counterparty_iban = null (der Visa-Export führt keine Gegen-IBAN).
 *  - Vorzeichen wie im Export (Käufe negativ, Einzahlung/Ausgleich positiv).
 *  - Zeilen in Dateireihenfolge — der Duplikat-Hash-Fix (④, Laufnummer
 *    byte-identischer Zeilen) hängt an der Ordinalität des Batches.
 *
 * Format (echter Export, verifiziert 07.07.2026): 4 Vor-Header-Zeilen
 * ("Karte";… / "" / "Saldo vom …" / ""), Header ab Zeile 5, Felder gequotet,
 * ";"-Separator, Datum "DD.MM.YY", Beträge deutsch, teils ohne
 * Dezimalstellen ("150", "-10").
 */

/** Eine geparste, an die RPC `process_csv_import` übergebbare Zeile. */
export type DkbVisaCsvRow = {
  /** ISO "YYYY-MM-DD" (aus "Belegdatum"). */
  transaction_date: string;
  /** Numerisch, Vorzeichen erhalten (Käufe negativ, Aufladungen positiv). */
  amount: number;
  /** Spalte "Beschreibung", byte-exakt, unverändert. */
  description: string;
  /** Immer null — der DKB-Visa-Export führt keine Gegen-IBAN. */
  counterparty_iban: null;
};

export type DkbVisaParseError = "format" | "empty" | "corrupt";

export type DkbVisaParseResult =
  | {
      ok: true;
      rows: DkbVisaCsvRow[];
      /** v2-04 P7: Zeilen mit Status ≠ "Gebucht" (z. B. "Vorgemerkt"), die
       *  übersprungen wurden — vorgemerkte Umsätze können ihren Hash nach
       *  Buchung ändern (Duplikat-Risiko, Architekten-Freigabe 07/2026). */
      skippedPendingCount: number;
    }
  | { ok: false; errorClass: DkbVisaParseError };

const HEADER_FIRST_FIELD = "Belegdatum";
const COL_DESCRIPTION = "Beschreibung";
const COL_AMOUNT = "Betrag (€)";
const COL_STATUS = "Status";
/** Format-Heuristik prüft nur die ersten N Zeilen auf den Header-Anker. */
const HEADER_SCAN_LINES = 8;

/**
 * Parst einen DKB-Visa-CSV-Text. Gibt entweder die Zeilen oder eine
 * Fehler-Klasse zurück — wirft nie (Fehler werden klassifiziert, nicht geworfen).
 */
export function parseDkbVisaCsv(text: string): DkbVisaParseResult {
  const rawLines = stripBom(text).split(/\r\n|\r|\n/);

  // ── Format-Heuristik: Header-Zeile in den ersten 8 Zeilen finden ──────────
  // (Separator ";" + erste Spalte == "Belegdatum" — distinkt zum Giro-Export,
  // dessen erste Header-Spalte "Buchungsdatum" heißt.)
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
  const idxDescription = header.indexOf(COL_DESCRIPTION);
  const idxAmount = header.indexOf(COL_AMOUNT);
  // Status ist additiv (P7): fehlt die Spalte, wird nicht gefiltert.
  const idxStatus = header.indexOf(COL_STATUS);
  if (idxDate === -1 || idxDescription === -1 || idxAmount === -1) {
    return { ok: false, errorClass: "format" };
  }

  // ── Datenzeilen: alles nach dem Header, leere Zeilen verworfen ────────────
  const dataLines = rawLines
    .slice(headerIdx + 1)
    .filter((l) => l.trim() !== "");
  if (dataLines.length === 0) return { ok: false, errorClass: "empty" };

  // ── Feld-Mapping (atomar: erste fehlerhafte Zeile → komplett verwerfen) ───
  // Dateireihenfolge bleibt erhalten (Parser-Vertrag ④).
  const rows: DkbVisaCsvRow[] = [];
  let skippedPendingCount = 0;
  for (const raw of dataLines) {
    const fields = tokenizeLine(raw);

    // P7: Status ≠ "Gebucht" (z. B. "Vorgemerkt") → Zeile überspringen,
    // BEVOR Felder validiert werden — eine unfertige vorgemerkte Zeile darf
    // den Import nicht als corrupt kippen.
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

    // Byte-exakt: Beschreibung unverändert übernehmen (Parser-Vertrag ①).
    const description = fields[idxDescription] ?? "";
    rows.push({
      transaction_date: transactionDate,
      amount,
      description,
      counterparty_iban: null,
    });
  }

  // P7: Datei bestand ausschließlich aus vorgemerkten Zeilen → wie "keine
  // Transaktionen" behandeln (nichts Importierbares).
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
 * Deutscher Betrag ("-50,91" / "1.200,00" / "150" / "-10") → numeric.
 * Tausender-"." entfernen, Dezimal-"," → ".". Gibt null bei unparsbarem
 * Betrag (→ corrupt).
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
