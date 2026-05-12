"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { estimateNetMonthly } from "@/lib/rpc";
import { saveIncomeChange } from "./actions";
import type { IncomeSplitProps } from "./income-split.types";
import styles from "./income-split.module.css";

const TAX_CLASSES = [1, 2, 3, 4, 5, 6] as const;
const GROSS_MIN = 20000;
const GROSS_MAX = 150000;
const GROSS_STEP = 100;

type NetState = "default" | "manual" | "empty" | "restored" | "no_estimate";

const eur = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const eurExact = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const monthLabel = (year: number, month: number) =>
  new Date(year, month - 1, 1).toLocaleDateString("de-DE", { month: "long", year: "numeric" });

export function IncomeSplitPopup(props: IncomeSplitProps) {
  if (!props.isOpen) return null;
  return <PopupBody {...props} />;
}

function PopupBody({
  onClose,
  person,
  activeMonth,
  isFirstIncomeEntry,
  taxClass: initialTaxClass,
  taxYear,
  initialGrossAnnual,
  initialNetMonthly,
  counterpartGrossAnnual,
}: IncomeSplitProps) {
  const supabase = useMemo(() => createClient(), []);

  const [taxClass, setTaxClass] = useState<number>(initialTaxClass || 1);
  const [grossAnnual, setGrossAnnual] = useState<number>(
    initialGrossAnnual ?? (person === "ICH" ? 60000 : 40000),
  );
  const [estimate, setEstimate] = useState<number | null>(null);
  const [netInput, setNetInput] = useState<string>(
    initialNetMonthly != null ? formatNetForInput(initialNetMonthly) : "",
  );
  const [netState, setNetState] = useState<NetState>("default");
  const manualOverride = useRef<boolean>(initialNetMonthly != null);

  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isPastMonth = useMemo(() => isPast(activeMonth), [activeMonth]);

  // Steuerklasse fuer Schaetzung: bei ICH die ausgewaehlte Steuerklasse,
  // bei PARTNER ist Steuerklasse nicht erfasst — Fallback 1 (Design-Doku §10).
  const estimationTaxClass = person === "ICH" ? taxClass : 1;

  const lastEstimateReq = useRef(0);
  useEffect(() => {
    if (isPastMonth) return;
    const reqId = ++lastEstimateReq.current;
    const t = window.setTimeout(async () => {
      const result = await estimateNetMonthly(supabase, {
        grossAnnual,
        taxClass: estimationTaxClass,
        taxYear,
      });
      if (reqId !== lastEstimateReq.current) return;
      setEstimate(result);
      // K2 (Briefing-Korrektur): bei manualOverride bleibt der Estimate nur
      // im Hint sichtbar — das Netto-Feld wird nicht ueberschrieben.
      if (manualOverride.current) return;
      if (result === null) {
        setNetInput("");
        setNetState("no_estimate");
      } else {
        setNetInput(formatNetForInput(result));
        setNetState("default");
      }
    }, 150);
    return () => window.clearTimeout(t);
  }, [supabase, grossAnnual, estimationTaxClass, taxYear, isPastMonth]);

  // K4 (Briefing-Korrektur #2): Split-Labels explizit person-orientiert
  // zuordnen. Vorher wurde im PARTNER-Popup doppelt invertiert
  // (Slider-Wert galt als ICH-Anteil), Labels waren gespiegelt.
  const ichGrossForSplit = person === "ICH" ? grossAnnual : (counterpartGrossAnnual ?? 0);
  const partnerGrossForSplit = person === "PARTNER" ? grossAnnual : (counterpartGrossAnnual ?? 0);
  const splitTotal = ichGrossForSplit + partnerGrossForSplit;
  const ichRatio = splitTotal > 0 ? ichGrossForSplit / splitTotal : 1;
  const ichPercent = Math.round(ichRatio * 100);
  const partnerPercent = 100 - ichPercent;

  const netNumber = parseGermanNumber(netInput);
  const submitDisabled = isPastMonth || pending || netNumber === null || netNumber <= 0;

  function handleNetChange(value: string) {
    setNetInput(value);
    if (value.trim() === "") {
      setNetState("empty");
      manualOverride.current = false;
      return;
    }
    const parsed = parseGermanNumber(value);
    if (parsed === null) {
      setNetState("empty");
      return;
    }
    if (estimate !== null && Math.abs(parsed - estimate) < 0.5) {
      setNetState("default");
      manualOverride.current = false;
    } else {
      setNetState("manual");
      manualOverride.current = true;
    }
  }

  function handleNetBlur() {
    if (netInput.trim() === "" || parseGermanNumber(netInput) === null) {
      if (estimate !== null) {
        setNetInput(formatNetForInput(estimate));
        setNetState("restored");
        manualOverride.current = false;
      } else {
        setNetState("no_estimate");
      }
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (netNumber === null || netNumber <= 0) {
      setFormError("Monatliches Netto fehlt.");
      return;
    }
    startTransition(async () => {
      const res = await saveIncomeChange({
        person,
        effectiveMonth: { year: activeMonth.year, month: activeMonth.month },
        grossAnnual,
        netMonthly: netNumber,
        taxClassToPersist:
          isFirstIncomeEntry && person === "ICH" ? taxClass : undefined,
        taxYearToPersist:
          isFirstIncomeEntry && person === "ICH" ? taxYear : undefined,
      });
      if (res.ok) {
        onClose();
      } else {
        setFormError(res.error);
      }
    });
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className={styles.backdrop} onMouseDown={handleBackdropClick} role="dialog" aria-modal="true">
      <form className={styles.dialog} onSubmit={handleSubmit}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {person === "ICH" ? "Ich" : "Partner"} — Jahresbrutto
          </h2>
          <span className={styles.activeMonth}>{monthLabel(activeMonth.year, activeMonth.month)}</span>
        </div>

        {isPastMonth && (
          <div className={styles.pastWarning}>
            Vergangener Monat — Werte sind eingefroren.
          </div>
        )}

        {isFirstIncomeEntry && person === "ICH" && (
          <div className={styles.section}>
            <span className={styles.label}>Steuerklasse</span>
            <div className={styles.taxClassRow} role="radiogroup" aria-label="Steuerklasse">
              {TAX_CLASSES.map((tc) => (
                <button
                  key={tc}
                  type="button"
                  role="radio"
                  aria-checked={taxClass === tc}
                  disabled={isPastMonth}
                  className={`${styles.taxClassButton} ${taxClass === tc ? styles.taxClassButtonActive : ""}`}
                  onClick={() => setTaxClass(tc)}
                >
                  {tc}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.section}>
          <span className={styles.label}>Jahresbrutto</span>
          <span className={styles.sliderValue}>{eur.format(grossAnnual)}</span>
          <input
            className={styles.slider}
            type="range"
            min={GROSS_MIN}
            max={GROSS_MAX}
            step={GROSS_STEP}
            value={grossAnnual}
            disabled={isPastMonth}
            onChange={(e) => setGrossAnnual(Number(e.target.value))}
            aria-label="Jahresbrutto"
          />
          <span className={styles.sliderMeta}>
            {estimate !== null
              ? `Schätzung: ${eurExact.format(estimate)}`
              : "Schätzung für dieses Steuerjahr noch nicht verfügbar — Netto bitte selbst eintragen."}
          </span>
        </div>

        {counterpartGrossAnnual != null && (
          <div className={styles.splitPreview}>
            <span className={styles.splitPreviewLine}>
              ICH {ichPercent} % · PARTNER {partnerPercent} %
            </span>
            <span className={styles.splitPreviewIllustrative}>
              Beispiel: gemeinsame Fixkosten 1.200 € → ICH-Anteil {eur.format(1200 * ichPercent / 100)} (nur illustrativ)
            </span>
          </div>
        )}

        <div className={styles.section}>
          <label className={styles.label} htmlFor="income-net-monthly">
            Monatliches Netto — Pflichtfeld
          </label>
          <input
            id="income-net-monthly"
            className={`${styles.input} ${
              netState === "manual" ? styles.inputManual :
              netState === "empty" ? styles.inputError :
              ""
            }`}
            type="text"
            inputMode="decimal"
            value={netInput}
            disabled={isPastMonth}
            onChange={(e) => handleNetChange(e.target.value)}
            onBlur={handleNetBlur}
            placeholder={estimate !== null ? formatNetForInput(estimate) : ""}
          />
          <NetHint state={netState} taxClass={estimationTaxClass} />
        </div>

        <div className={styles.inheritanceBadge}>
          Gilt ab {monthLabel(activeMonth.year, activeMonth.month)} für alle Folgemonate bis zur nächsten Änderung.
        </div>

        {formError && <p className={styles.formError}>{formError}</p>}

        <div className={styles.actions}>
          <button type="button" className={styles.buttonSecondary} onClick={onClose}>
            Abbrechen
          </button>
          <button type="submit" className={styles.buttonPrimary} disabled={submitDisabled}>
            Übernehmen
          </button>
        </div>
      </form>
    </div>
  );
}

function NetHint({ state, taxClass }: { state: NetState; taxClass: number }) {
  switch (state) {
    case "manual":
      return <span className={styles.hintTeal}>Manuell angepasst</span>;
    case "empty":
      return <span className={styles.hintError}>Pflichtfeld — Vorschlag kehrt beim Verlassen zurück</span>;
    case "restored":
      return <span className={styles.hintDefault}>Vorschlag wiederhergestellt · Änderbar</span>;
    case "no_estimate":
      return <span className={styles.hintDefault}>Schätzung für dieses Steuerjahr noch nicht verfügbar — Netto bitte selbst eintragen.</span>;
    case "default":
    default:
      return <span className={styles.hintDefault}>Vorschlag basiert auf Steuerklasse {taxClass} · Änderbar</span>;
  }
}

function isPast(am: { year: number; month: number }): boolean {
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth() + 1;
  if (am.year < currentYear) return true;
  if (am.year > currentYear) return false;
  return am.month < currentMonth;
}

function parseGermanNumber(input: string): number | null {
  const trimmed = input.trim();
  if (trimmed === "") return null;
  const normalized = trimmed.replace(/\./g, "").replace(/,/g, ".");
  const num = Number(normalized);
  if (!Number.isFinite(num)) return null;
  return num;
}

function formatNetForInput(value: number): string {
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
