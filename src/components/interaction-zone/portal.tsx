"use client";

import { useEffect, useRef, useState } from "react";
import { buildImportBatches } from "@/lib/csv-batches";
import { routeAndParseCsv } from "@/lib/csv-format-router";
import type { CsvImportResult } from "@/lib/rpc";
import { processCsvImportAction } from "./actions";
import styles from "./interaction-zone.module.css";

/* ============================================================
   Portal — Design-Doku §8 + §11. Sprint 8: Live-Pipeline.
   Drop/File-Picker → FileReader (UTF-8) → DKB-Parser → RPC
   process_csv_import → State-Machine (processing → success/error).
   Fehler-Klassen (format/empty/corrupt) kommen aus dem Parser bzw. einem
   RPC-Fehler. Die Dev-Buttons (NODE_ENV-gated) simulieren Visuals ohne Datei.

   03.09.2026: Die RPC wird BLOCKWEISE gerufen (`lib/csv-batches.ts`), weil sie
   als ein Statement gegen ein statement_timeout von 8 s läuft. Der Import ist
   damit über die ganze Datei nicht mehr atomar — je Block schon. Begründung und
   Messwerte stehen bei `runImport`.
   ============================================================ */

type PortalState =
  | "default"
  | "drag-over"
  | "processing"
  | "success"
  | "error-format"
  | "error-empty"
  | "error-corrupt"
  /** 03.09.2026: Ein Block ist durchgelaufen, ein späterer nicht. Anders als die
   *  drei anderen Fehler ist hier etwas ANGEKOMMEN — „Datei fehlerhaft" wäre an
   *  dieser Stelle schlicht unwahr und würde den Nutzer von der einzig richtigen
   *  Reaktion abhalten: dieselbe Datei noch einmal einwerfen. Nutzt bewusst
   *  dieselben Visuals wie die übrigen Fehlerzustände (Rahmen, Glyph); neu sind
   *  nur die Worte. Der Wortlaut ist nicht durch die Design-Doku gedeckt und
   *  gehört bei nächster Gelegenheit vor den Design-Direktor (§7 Regel 3). */
  | "error-partial";

const SUCCESS_MS = 1500;
const PROCESSING_MS = 2000;
const ERROR_MS = 4000;
const TOAST_MS = 4000;

/** Eine Backfill-Toast-Instanz. `id` erzwingt Remount → Animation-Restart bei
 *  sukzessiven Importen (jeder Toast zeigt nur die Counter seines Imports). */
type BackfillToast = { id: number; lines: string[] };

type PortalProps = {
  /** "YYYY-MM" — bei Wechsel wird der Portal-State zurückgesetzt (LL-5). */
  targetMonth: string;
};

export function Portal({ targetMonth }: PortalProps) {
  const [state, setState] = useState<PortalState>("default");
  /** Nur gesetzt, solange ein Import über MEHRERE Blöcke läuft. Bei einer
   *  Monatsdatei (ein Block) bleibt es `null` und die Anzeige ist wie bisher. */
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  const [toast, setToast] = useState<BackfillToast | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastIdRef = useRef(0);
  /** dragenter feuert auch auf Kinder → Counter, damit Border nicht flackert. */
  const dragCounter = useRef(0);

  // LL-5: Bei targetMonth-Wechsel hartes Reset (Timer + State + Toast).
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    dragCounter.current = 0;
    setState("default");
    setProgress(null);
    setToast(null);
  }, [targetMonth]);

  // Cleanup beim Unmount — vermeidet Memory-Leak.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  /** Backfill-Report-Toast (§6.2): zeigt nur Counter > 0, 4 s, dann Fade-Out. */
  function showBackfillToast(lines: string[]) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    if (lines.length === 0) {
      setToast(null);
      return;
    }
    toastIdRef.current += 1;
    setToast({ id: toastIdRef.current, lines });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, TOAST_MS);
  }

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  /** Dev-only Visual-Simulation (kein echter Import). */
  function runFakeSuccessSequence() {
    clearTimer();
    setState("processing");
    timerRef.current = setTimeout(() => {
      enterSuccess();
    }, PROCESSING_MS);
  }

  function enterSuccess() {
    clearTimer();
    setState("success");
    timerRef.current = setTimeout(() => {
      setState("default");
      timerRef.current = null;
    }, SUCCESS_MS);
  }

  function runErrorSequence(kind: "format" | "empty" | "corrupt" | "partial") {
    clearTimer();
    setProgress(null);
    setState(`error-${kind}` as PortalState);
    timerRef.current = setTimeout(() => {
      setState("default");
      timerRef.current = null;
    }, ERROR_MS);
  }

  /** Echte Import-Pipeline (Briefing §4). „processing" hält für die tatsächliche
   *  Dauer von Lesen + Parsen + RPC; danach Erfolg (1.5 s) oder Fehler (4 s).
   *
   *  Seit dem 03.09.2026 geht der Import blockweise (`lib/csv-batches.ts`). Die
   *  RPC läuft als EIN Statement gegen ein `statement_timeout` von 8 s und
   *  rechnet je neuer Zahlung gegen jede aktive Karte — gemessen 92,85 ms je
   *  Zeile. Eine Jahresdatei mit 2.031 neuen Zeilen bräuchte ~188 s und lief
   *  deshalb ausnahmslos in den Timeout; der Nutzer sah „Datei fehlerhaft",
   *  obwohl der Parser die Datei in 4 ms vollständig verarbeitet.
   *
   *  Damit ist der Import NICHT MEHR ATOMAR. Das ist bewusst und in der Sache
   *  besser: Bei ~100 Blöcken über mehrere Minuten wäre „alles oder nichts" die
   *  schlechtere Zusage — ein Abbruch im 99. Block würfe 98 gelungene Blöcke weg.
   *  Tragfähig ist das nur, weil der Import über den Hash idempotent ist:
   *  Dieselbe Datei erneut einwerfen setzt fort, was fehlt, und überspringt den
   *  Rest als Duplikat. Genau dafür muss die Blockbildung deterministisch sein. */
  async function runImport(file: File) {
    clearTimer();
    setProgress(null);
    setState("processing");

    let text: string;
    try {
      text = await file.text();
    } catch {
      runErrorSequence("corrupt");
      return;
    }

    const parsed = routeAndParseCsv(text);
    if (!parsed.ok) {
      runErrorSequence(parsed.errorClass);
      return;
    }

    const batches = buildImportBatches(parsed.rows);
    const gesamtZeilen = parsed.rows.length;
    const summe = leeresImportErgebnis();
    let uebertragen = 0;

    for (let i = 0; i < batches.length; i += 1) {
      const batch = batches[i];
      const istLetzterBlock = i === batches.length - 1;

      try {
        // Nur der letzte Block revalidiert — sonst baut jeder einzelne Block das
        // gesamte Dashboard neu auf (siehe Kommentar in `actions.ts`).
        const result = await processCsvImportAction(
          batch,
          parsed.formatHint,
          istLetzterBlock,
        );
        addiereImportErgebnis(summe, result);
      } catch (err) {
        console.error(
          `CSV-Import-RPC fehlgeschlagen in Block ${i + 1}/${batches.length} ` +
            `(${uebertragen} von ${gesamtZeilen} Zeilen übertragen)`,
          err,
        );
        // Was vor diesem Block lief, steht in der Datenbank. Das dem Nutzer zu
        // verschweigen wäre der teuerste Teil des Fehlers.
        showBackfillToast([
          `${uebertragen} von ${gesamtZeilen} Zahlungen übernommen`,
          "Dieselbe Datei erneut einwerfen setzt fort",
        ]);
        runErrorSequence("partial");
        return;
      }

      uebertragen += batch.length;
      // Der letzte Block braucht keine Fortschrittszahl mehr — direkt danach
      // übernimmt der Erfolgszustand.
      if (!istLetzterBlock && batches.length > 1) {
        setProgress({ done: uebertragen, total: gesamtZeilen });
      }
    }

    console.info(
      `CSV-Import (${parsed.formatHint}, ${batches.length} Block/Blöcke, ` +
        `${gesamtZeilen} Zeilen): ${summe.inserted_count} neu, ` +
        `${summe.skipped_duplicates_count} Duplikate, ` +
        `${summe.auto_absorbed_count} auto-absorbiert, ` +
        `${summe.iban_backfilled_count} IBAN-Backfill, ` +
        `${summe.internal_transfers_count} Transfers, ` +
        `${summe.links_removed_for_transfers_count} Links gelöst, ` +
        `${parsed.skippedPendingCount} vorgemerkt übersprungen`,
    );
    showBackfillToast(buildBackfillLines(summe, parsed.skippedPendingCount));

    setProgress(null);
    enterSuccess();
  }

  function handleDragEnter(e: React.DragEvent<HTMLDivElement>) {
    // Nur CSV-/File-Drags reagieren — Fragment-Drags haben unseren MIME-Type.
    if (!hasFileTransfer(e)) return;
    e.preventDefault();
    dragCounter.current += 1;
    if (state === "default") setState("drag-over");
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    // dragover muss preventDefault() rufen, damit drop feuert.
    if (!hasFileTransfer(e)) return;
    e.preventDefault();
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    if (!hasFileTransfer(e)) return;
    e.preventDefault();
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0 && state === "drag-over") {
      setState("default");
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    if (!hasFileTransfer(e)) return;
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    const file = e.dataTransfer.files?.[0];
    if (!file) {
      setState("default");
      return;
    }
    void runImport(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Eingabewert leeren, damit derselbe Filename erneut ausgewählt werden kann.
    e.target.value = "";
    void runImport(file);
  }

  const stateClass = stateClassNameFor(state);
  const isLocked = state !== "default" && state !== "drag-over";
  const showPulse = state === "processing";
  const { label, subLabel } = visualLabelsFor(state, progress);

  return (
    <div className={styles.portalColumn}>
      <div className={styles.zoneLabel}>Import</div>
      <div
        className={`${styles.portal} ${stateClass}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-live="polite"
      >
        <input
          type="file"
          accept=".csv"
          className={`${styles.portalFileInput} ${
            isLocked ? styles.portalFileInputLocked : ""
          }`}
          onChange={handleFileChange}
          aria-label="CSV-Datei auswählen"
          tabIndex={isLocked ? -1 : 0}
        />
        <div
          className={`${styles.portalIcon} ${
            showPulse ? styles.portalPulsing : ""
          }`}
        >
          <PortalGlyph state={state} />
        </div>
        <div className={styles.portalLabel}>{label}</div>
        <div className={styles.portalSubLabel}>{subLabel}</div>
      </div>

      {toast && (
        <div
          key={toast.id}
          className={styles.backfillToast}
          role="status"
          aria-live="polite"
        >
          {toast.lines.map((line, i) => (
            <div key={i} className={styles.backfillToastLine}>
              {line}
            </div>
          ))}
        </div>
      )}

      {process.env.NODE_ENV === "development" && (
        <PortalDevButtons
          onTriggerError={runErrorSequence}
          onTriggerSuccess={runFakeSuccessSequence}
        />
      )}
    </div>
  );
}

// ── Visuals ─────────────────────────────────────────────────────────────────

function stateClassNameFor(s: PortalState): string {
  switch (s) {
    case "drag-over":
      return styles.portalDragOver;
    case "processing":
      return styles.portalProcessing;
    case "success":
      return styles.portalSuccess;
    case "error-format":
    case "error-empty":
    case "error-corrupt":
    case "error-partial":
      return styles.portalError;
    default:
      return "";
  }
}

function visualLabelsFor(
  s: PortalState,
  progress: { done: number; total: number } | null,
): { label: string; subLabel: string } {
  switch (s) {
    case "drag-over":
      return { label: "Loslassen zum Import", subLabel: "CSV wird erkannt" };
    case "processing":
      // Ein Jahresexport braucht Minuten (siehe `runImport`). Ohne eine Zahl,
      // die sich bewegt, ist „Wird verarbeitet…" von „hängt" nicht zu
      // unterscheiden — und der Nutzer lädt neu, mitten im Import.
      return {
        label: "Wird verarbeitet…",
        subLabel: progress
          ? `${progress.done.toLocaleString("de-DE")} von ` +
            `${progress.total.toLocaleString("de-DE")} Zahlungen`
          : "Fragmente werden erkannt",
      };
    case "success":
      return {
        label: "Import erfolgreich",
        subLabel: "Fragmente erscheinen im Stack",
      };
    case "error-format":
      return {
        label: "Format nicht erkannt",
        subLabel: "Bitte CSV-Datei verwenden",
      };
    case "error-empty":
      return {
        label: "Keine Transaktionen",
        subLabel: "Datei enthält keine Einträge",
      };
    case "error-corrupt":
      return {
        label: "Datei fehlerhaft",
        subLabel: "Datei konnte nicht gelesen werden",
      };
    case "error-partial":
      return {
        label: "Import unvollständig",
        subLabel: "Dieselbe Datei erneut einwerfen",
      };
    default:
      return {
        label: "CSV ablegen oder klicken",
        subLabel: "Kontoauszug importieren",
      };
  }
}

function PortalGlyph({ state }: { state: PortalState }) {
  if (state === "success") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path
          d="M5 9l3 3 5-5"
          stroke="rgba(62,207,175,.9)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (
    state === "error-format" ||
    state === "error-empty" ||
    state === "error-corrupt" ||
    state === "error-partial"
  ) {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path
          d="M9 5v5M9 12.5v.5"
          stroke="rgba(255,99,88,.85)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (state === "processing") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle
          cx="9"
          cy="9"
          r="5"
          stroke="rgba(255,255,255,.35)"
          strokeWidth="1.3"
          strokeDasharray="20"
        />
      </svg>
    );
  }
  if (state === "drag-over") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path
          d="M9 2v10M6 8l3-3 3 3"
          stroke="rgba(62,207,175,.8)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 13h12"
          stroke="rgba(62,207,175,.5)"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  // default
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M9 3v9M6 9l3-3 3 3"
        stroke="rgba(255,255,255,.4)"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 13h12"
        stroke="rgba(255,255,255,.22)"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Dev-Buttons (NODE_ENV === "development") ────────────────────────────────

function PortalDevButtons({
  onTriggerError,
  onTriggerSuccess,
}: {
  onTriggerError: (kind: "format" | "empty" | "corrupt" | "partial") => void;
  onTriggerSuccess: () => void;
}) {
  return (
    <>
      <div className={styles.devButtonLabel}>Zustand simulieren</div>
      <div className={styles.devButtons}>
        <button
          type="button"
          className={styles.devButton}
          onClick={onTriggerSuccess}
        >
          Erfolg
        </button>
        <button
          type="button"
          className={styles.devButton}
          onClick={() => onTriggerError("format")}
        >
          Fehler: Format
        </button>
        <button
          type="button"
          className={styles.devButton}
          onClick={() => onTriggerError("empty")}
        >
          Fehler: Leer
        </button>
        <button
          type="button"
          className={styles.devButton}
          onClick={() => onTriggerError("corrupt")}
        >
          Fehler: Korrupt
        </button>
        <button
          type="button"
          className={styles.devButton}
          onClick={() => onTriggerError("partial")}
        >
          Fehler: Teil-Import
        </button>
      </div>
    </>
  );
}

// ── Helper ──────────────────────────────────────────────────────────────────

/** v2-07 C2 (Sprint 9 V9''): Ab dieser Höhe verliert die IBAN-Backfill-Zeile
 *  ihre Zahl. Ein Re-Import über den Gesamtbestand meldet sonst Zeilen wie
 *  „544 Fragmente mit IBAN ergänzt" — fachlich korrekt, in der Wirkung aber
 *  ein Großereignis, während nur ein berechnungs-irrelevantes Feld
 *  nachgetragen wurde.
 *  Bewusst NICHT in `app_config`: CLAUDE.md §7 Regel 5 schützt Schwellen, die
 *  auch die DB-Logik kennt (Konfidenz, Auto-Absorb). Hier gibt es kein
 *  DB-Gegenstück — reine Anzeige-Sprache ohne Rechenwirkung. Eine
 *  app_config-Zeile würde eine Kopplung vortäuschen, die nicht existiert. */
const IBAN_BACKFILL_SUMMARY_THRESHOLD = 50;

/* Blockweiser Import (03.09.2026): Die RPC antwortet je Block. Der Toast und die
   Konsolen-Zeile sollen aber den GESAMTEN Import beschreiben — sonst meldete ein
   Jahresexport hundertmal winzige Zahlen statt einmal der Wahrheit.

   Die beiden Helfer sind bewusst getrennt von `buildBackfillLines`: Dort geht es
   um Wortlaut, hier ums Addieren. Wer der RPC ein Feld hinzufügt, muss es an
   GENAU einer Stelle nachtragen — `addiereImportErgebnis`. */

function leeresImportErgebnis(): CsvImportResult {
  return {
    inserted_count: 0,
    skipped_duplicates_count: 0,
    auto_absorbed_count: 0,
    fragment_ids: [],
    iban_backfilled_count: 0,
    internal_transfers_count: 0,
    links_removed_for_transfers_count: 0,
  };
}

/** Addiert das Ergebnis eines Blocks auf die laufende Summe (mutierend). */
function addiereImportErgebnis(
  summe: CsvImportResult,
  block: CsvImportResult,
): void {
  summe.inserted_count += block.inserted_count;
  summe.skipped_duplicates_count += block.skipped_duplicates_count;
  summe.auto_absorbed_count += block.auto_absorbed_count;
  summe.iban_backfilled_count += block.iban_backfilled_count;
  summe.internal_transfers_count += block.internal_transfers_count;
  summe.links_removed_for_transfers_count +=
    block.links_removed_for_transfers_count;
  summe.fragment_ids.push(...block.fragment_ids);
}

/** §6.2: Backfill-Toast-Zeilen — nur Counter > 0, in fester Reihenfolge.
 *  v2-04 P7: weist zusätzlich übersprungene vorgemerkte Zeilen aus.
 *  v2-07 C2: nur die IBAN-Zeile wird ab der Schwelle entschärft. Die drei
 *  übrigen behalten Wortlaut und Zahl — dort ist die Zahl inhaltlich
 *  relevant (User-Entscheid E3, 25.07.2026). Die exakte Zahl bleibt in der
 *  Konsolen-Ausgabe des Aufrufers erhalten. */
function buildBackfillLines(
  r: CsvImportResult,
  skippedPendingCount: number,
): string[] {
  const lines: string[] = [];
  if (r.iban_backfilled_count > 0) {
    lines.push(
      r.iban_backfilled_count >= IBAN_BACKFILL_SUMMARY_THRESHOLD
        ? "Bestehende Fragmente nachgepflegt"
        : `${r.iban_backfilled_count} Fragmente mit IBAN ergänzt`,
    );
  }
  if (r.internal_transfers_count > 0) {
    lines.push(`${r.internal_transfers_count} Bewegungen als Transfer erkannt`);
  }
  if (r.links_removed_for_transfers_count > 0) {
    lines.push(`${r.links_removed_for_transfers_count} Karten-Zuordnungen gelöst`);
  }
  if (skippedPendingCount > 0) {
    lines.push(`${skippedPendingCount} vorgemerkte Umsätze übersprungen`);
  }
  return lines;
}

/** dataTransfer.types enthält "Files" wenn ein OS-File gezogen wird.
 *  Fragmente nutzen unseren MIME-Type, deshalb hier explizit auf "Files"
 *  prüfen — sonst würde der Portal-Drag-Over auch bei Fragment-Drag triggern. */
function hasFileTransfer(e: React.DragEvent<HTMLDivElement>): boolean {
  const types = e.dataTransfer?.types;
  if (!types) return false;
  for (let i = 0; i < types.length; i += 1) {
    if (types[i] === "Files") return true;
  }
  return false;
}
