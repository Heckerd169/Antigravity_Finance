"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { estimateNetMonthly } from "@/lib/rpc";
import { submitOnboarding } from "./actions";
import styles from "./onboarding.module.css";

const TAX_CLASSES = [1, 2, 3, 4, 5, 6] as const;
const GROSS_MIN = 20000;
const GROSS_MAX = 150000;
const GROSS_STEP = 100;

type NetState = "default" | "manual" | "empty" | "restored" | "no_estimate";

const eur = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const eurExact = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function OnboardingForm() {
  const supabase = useMemo(() => createClient(), []);
  const taxYear = new Date().getUTCFullYear();

  const [taxClass, setTaxClass] = useState<number>(1);
  const [grossAnnual, setGrossAnnual] = useState<number>(60000);
  const [estimate, setEstimate] = useState<number | null>(null);
  const [netInput, setNetInput] = useState<string>("");
  const [netState, setNetState] = useState<NetState>("default");
  const ichManualOverride = useRef(false);

  const [partnerActive, setPartnerActive] = useState<boolean>(false);
  const [partnerGross, setPartnerGross] = useState<number>(40000);
  const [partnerEstimate, setPartnerEstimate] = useState<number | null>(null);
  const [partnerNetInput, setPartnerNetInput] = useState<string>("");
  const partnerManualOverride = useRef(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const lastIchReq = useRef(0);
  useEffect(() => {
    const reqId = ++lastIchReq.current;
    const t = window.setTimeout(async () => {
      const result = await estimateNetMonthly(supabase, { grossAnnual, taxClass, taxYear });
      if (reqId !== lastIchReq.current) return;
      setEstimate(result);
      // K2 (Briefing-Korrektur): bei manualOverride bleibt der Estimate nur
      // im Hint sichtbar — das Netto-Feld wird nicht ueberschrieben.
      if (ichManualOverride.current) return;
      if (result === null) {
        setNetInput("");
        setNetState("no_estimate");
      } else {
        setNetInput(formatNetForInput(result));
        setNetState("default");
      }
    }, 150);
    return () => window.clearTimeout(t);
  }, [supabase, grossAnnual, taxClass, taxYear]);

  const lastPartnerReq = useRef(0);
  useEffect(() => {
    if (!partnerActive) return;
    const reqId = ++lastPartnerReq.current;
    // Steuerklasse Partner: V1 erfasst keine Partner-Steuerklasse — Fallback 1.
    const t = window.setTimeout(async () => {
      const result = await estimateNetMonthly(supabase, { grossAnnual: partnerGross, taxClass: 1, taxYear });
      if (reqId !== lastPartnerReq.current) return;
      setPartnerEstimate(result);
      // K2: manualOverride sperrt das Schreiben ins Feld.
      if (partnerManualOverride.current) return;
      setPartnerNetInput(result === null ? "" : formatNetForInput(result));
    }, 150);
    return () => window.clearTimeout(t);
  }, [supabase, partnerActive, partnerGross, taxYear]);

  const splitFactor =
    !partnerActive || partnerGross + grossAnnual === 0
      ? 1
      : grossAnnual / (grossAnnual + partnerGross);
  const ichPercent = Math.round(splitFactor * 100);
  const partnerPercent = 100 - ichPercent;

  const netNumber = parseGermanNumber(netInput);
  const partnerNetNumber = parseGermanNumber(partnerNetInput);
  const submitDisabled =
    pending ||
    netNumber === null ||
    netNumber <= 0 ||
    (partnerActive && (partnerNetNumber === null || partnerNetNumber <= 0));

  function handleNetChange(value: string) {
    setNetInput(value);
    if (value.trim() === "") {
      setNetState("empty");
      ichManualOverride.current = false;
      return;
    }
    const parsed = parseGermanNumber(value);
    if (parsed === null) {
      setNetState("empty");
      return;
    }
    if (estimate !== null && Math.abs(parsed - estimate) < 0.5) {
      setNetState("default");
      ichManualOverride.current = false;
    } else {
      setNetState("manual");
      ichManualOverride.current = true;
    }
  }

  function handleNetBlur() {
    if (netInput.trim() === "" || parseGermanNumber(netInput) === null) {
      if (estimate !== null) {
        setNetInput(formatNetForInput(estimate));
        setNetState("restored");
        ichManualOverride.current = false;
      } else {
        setNetState("no_estimate");
      }
    }
  }

  function handlePartnerNetChange(value: string) {
    setPartnerNetInput(value);
    const parsed = parseGermanNumber(value);
    if (parsed === null) {
      partnerManualOverride.current = false;
      return;
    }
    if (partnerEstimate !== null && Math.abs(parsed - partnerEstimate) < 0.5) {
      partnerManualOverride.current = false;
    } else {
      partnerManualOverride.current = true;
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
      const partner = partnerActive && partnerNetNumber !== null && partnerNetNumber > 0
        ? { grossAnnual: partnerGross, netMonthly: partnerNetNumber }
        : undefined;
      const res = await submitOnboarding({
        taxClass,
        taxYear,
        grossAnnual,
        netMonthly: netNumber,
        partner,
      });
      if (res && res.ok === false) {
        setFormError(res.error);
      }
    });
  }

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      <h1 className={styles.title}>Onboarding — Einkommen</h1>

      <div className={styles.section}>
        <span className={styles.label}>Steuerklasse</span>
        <div className={styles.taxClassRow} role="radiogroup" aria-label="Steuerklasse">
          {TAX_CLASSES.map((tc) => (
            <button
              key={tc}
              type="button"
              role="radio"
              aria-checked={taxClass === tc}
              className={`${styles.taxClassButton} ${taxClass === tc ? styles.taxClassButtonActive : ""}`}
              onClick={() => setTaxClass(tc)}
            >
              {tc}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <span className={styles.label}>Jahresbrutto (Ich)</span>
        <span className={styles.sliderValue}>{eur.format(grossAnnual)}</span>
        <input
          className={styles.slider}
          type="range"
          min={GROSS_MIN}
          max={GROSS_MAX}
          step={GROSS_STEP}
          value={grossAnnual}
          onChange={(e) => setGrossAnnual(Number(e.target.value))}
          aria-label="Jahresbrutto Ich"
        />
        <span className={styles.sliderMeta}>
          {estimate !== null
            ? `Schätzung: ${eurExact.format(estimate)}`
            : "Schätzung für dieses Steuerjahr noch nicht verfügbar — Netto bitte selbst eintragen."}
        </span>
      </div>

      <div className={styles.netSection}>
        <label className={styles.label} htmlFor="net-monthly">
          Monatliches Netto (Ich) — Pflichtfeld
        </label>
        <input
          id="net-monthly"
          className={`${styles.input} ${
            netState === "manual" ? styles.inputManual :
            netState === "empty" ? styles.inputError :
            ""
          }`}
          type="text"
          inputMode="decimal"
          value={netInput}
          onChange={(e) => handleNetChange(e.target.value)}
          onBlur={handleNetBlur}
          placeholder={estimate !== null ? formatNetForInput(estimate) : ""}
        />
        <NetHint state={netState} taxClass={taxClass} />
      </div>

      <label className={styles.partnerToggle}>
        <input
          type="checkbox"
          checked={partnerActive}
          onChange={(e) => setPartnerActive(e.target.checked)}
        />
        Partner-Brutto angeben (optional)
      </label>

      {partnerActive && (
        <div className={styles.partnerBlock}>
          <div className={styles.section}>
            <span className={styles.label}>Jahresbrutto (Partner)</span>
            <span className={styles.sliderValue}>{eur.format(partnerGross)}</span>
            <input
              className={styles.slider}
              type="range"
              min={GROSS_MIN}
              max={GROSS_MAX}
              step={GROSS_STEP}
              value={partnerGross}
              onChange={(e) => setPartnerGross(Number(e.target.value))}
              aria-label="Jahresbrutto Partner"
            />
            <span className={styles.sliderMeta}>
              {partnerEstimate !== null
                ? `Schätzung: ${eurExact.format(partnerEstimate)}`
                : "Schätzung nicht verfügbar — Netto bitte selbst eintragen."}
            </span>
          </div>

          <div className={styles.netSection}>
            <label className={styles.label} htmlFor="partner-net">
              Monatliches Netto (Partner)
            </label>
            <input
              id="partner-net"
              className={styles.input}
              type="text"
              inputMode="decimal"
              value={partnerNetInput}
              onChange={(e) => handlePartnerNetChange(e.target.value)}
              placeholder={partnerEstimate !== null ? formatNetForInput(partnerEstimate) : ""}
            />
          </div>

          <span className={styles.sliderMeta}>
            Split: ICH {ichPercent} % · PARTNER {partnerPercent} % <em>(nur illustrativ)</em>
          </span>
        </div>
      )}

      {formError && <p className={styles.formError}>{formError}</p>}

      <div className={styles.actions}>
        <button className={styles.button} type="submit" disabled={submitDisabled}>
          Übernehmen
        </button>
      </div>
    </form>
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
