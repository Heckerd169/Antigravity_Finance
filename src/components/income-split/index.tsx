"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { estimateNetMonthly } from "@/lib/rpc";
import { formatAmount } from "@/lib/format";
import { saveIncomeChange, unlinkIncomeFragmentAction } from "./actions";
import type { IncomeSplitProps, SplitConsequence } from "./income-split.types";
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

/** "2026-07-28" → "28.07." — dasselbe kurze Format, das die Rohmasse benutzt.
 *  Bewusst aus dem String geschnitten statt über `new Date()`: Ein
 *  Datums-Objekt aus "YYYY-MM-DD" ist UTC-Mitternacht und rutscht in
 *  westlichen Zeitzonen auf den Vortag (§7, `effective_month` als String). */
const formatDayMonth = (isoDate: string): string => {
  const [, month, day] = isoDate.split("-");
  return `${day}.${month}.`;
};

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
  assignment,
}: IncomeSplitProps) {
  const supabase = useMemo(() => createClient(), []);
  const [isUnlinking, setIsUnlinking] = useState(false);

  /** Lösen schließt das Fenster: Der Wert, den es anzeigt, ändert sich dadurch
   *  hinter der Oberfläche (`revalidatePath`), und ein Fenster, das noch die
   *  alte Zahl trägt, wäre irreführend. */
  async function handleUnlink() {
    if (!assignment) return;
    setIsUnlinking(true);
    try {
      await unlinkIncomeFragmentAction(assignment.fragmentId);
      onClose();
    } finally {
      setIsUnlinking(false);
    }
  }

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
  /* v2-16 (PA-1): Ist das gesetzt, zeigt DASSELBE Popup seinen zweiten Zustand —
     die Konsequenz-Anzeige statt der Eingabefelder (§10). */
  const [consequence, setConsequence] = useState<SplitConsequence | null>(null);

  /* v2-16: Escape-Handler — bis hierher war dieses Popup als EINZIGES von acht
     Overlays ohne (sprints/sprint_v2-10_offene_fragen.md §6, Altbestand seit
     Sprint 1). Muster identisch zu den sieben anderen. Gilt in beiden
     Zuständen: im Ergebnis-Zustand ist Schließen die einzige Handlung, die
     überhaupt noch offensteht. */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

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
        /* v2-16 (PA-1): Ändert die Gehaltsänderung den Split, tauscht das Popup
           seinen Inhalt statt zu schließen — Ursache und Wirkung an einem Ort.
           Im leeren Fall (nur das Netto angepasst, oder keine gemeinsamen
           Posten) liefert die Action `null` und es bleibt beim bisherigen
           Verhalten: speichern und schließen, ohne Zwischenbildschirm (LL-20). */
        if (res.consequence !== null) {
          setConsequence(res.consequence);
        } else {
          onClose();
        }
      } else {
        setFormError(res.error);
      }
    });
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  /* v2-10 P1 (BF-3): Portal nach document.body — dasselbe Muster wie bei den
     uebrigen sechs Overlays der App (LL-6; das Karten-Kontextmenu ist die
     bewusste Ausnahme, der Rueckgaengig-Toast kein Overlay). Die Labels tragen in
     welle.module.css `.splitLeft/.splitRight { transform: translateY(-50%) }`;
     ein Vorfahre mit `transform` wird nach CSS-Spezifikation zum Bezugsrahmen
     fuer `position: fixed`-Nachfahren. Dadurch meinte `inset: 0` bisher das
     rund 80 px breite Label statt des Fensters — `width: 100%` ergab 80 px,
     `max-width: 480px` griff nie. Die Zentrierung in `.backdrop` ist richtig
     und bleibt unveraendert; erst der Portal-Hop gibt ihr den Bezug zurueck.
     Die Portal-Falle aus Sprint-5 K2.1 greift hier nicht: income-split.module.css
     definiert keine eigenen Custom-Properties, sondern liest ausschliesslich
     :root-Tokens aus tokens.css — die vererben ueber document.body weiter. */
  return createPortal(
    /* v2-10 P6: `data-wave-block` muss jetzt am Backdrop selbst haengen.
       `welle/index.tsx` oeffnet das Jahres-Popup bei jedem Klick, ausser
       `e.target.closest("[data-wave-block]")` findet einen Treffer — und das
       ist eine Suche im **echten DOM**. Bis zum Portal-Fix war das Popup ein
       Nachfahre von `.splitLeft`/`.splitRight`, die den Marker tragen, also
       griff der Schutz von allein. Seit dem Portal haengt das Markup unter
       `document.body`, waehrend React den Klick weiterhin durch den
       **React-Baum** nach oben reicht (Portale bleiben React-Kinder) — die
       Suche lief damit ins Leere und jeder Klick im Popup riss zusaetzlich
       die Jahres-Welle auf. Der Marker hier stellt genau die Absicht wieder
       her, die der Kommentar in `welle/index.tsx` beschreibt: „Income-Labels
       inkl. deren Overlays … triggern nicht." */
    <div
      className={styles.backdrop}
      onMouseDown={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      data-wave-block
    >
      {consequence !== null ? (
        <ConsequenceView consequence={consequence} onClose={onClose} />
      ) : (
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

        {/* v2-19 (GE-1, Record E): Die zugeordnete Gehaltszahlung — und der
            einzige Ort, an dem sie sich lösen lässt. Sie steht unmittelbar
            unter dem Netto-Feld, weil sie genau dieses Feld für DIESEN Monat
            außer Kraft setzt: Solange sie liegt, rechnet der Monat mit ihr
            statt mit dem Plan darüber.

            Nur bei ICH — das Partner-Netto ist nicht ablegbar. */}
        {person === "ICH" && assignment && (
          <div className={styles.assignment}>
            <span className={styles.label}>Zugeordnete Zahlung</span>
            <div className={styles.assignmentRow}>
              <span className={styles.assignmentText}>
                {formatDayMonth(assignment.transactionDate)} ·{" "}
                {eurExact.format(assignment.amount)}
              </span>
              <button
                type="button"
                className={styles.buttonSecondary}
                disabled={isUnlinking}
                onClick={handleUnlink}
              >
                {isUnlinking ? "Wird gelöst …" : "Lösen"}
              </button>
            </div>
            <span className={styles.assignmentHint}>
              Dieser Monat rechnet mit dem überwiesenen Betrag. Nach dem Lösen
              gilt wieder der Plan.
            </span>
          </div>
        )}

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
      )}
    </div>,
    document.body,
  );
}

/* ── v2-16 (PA-1): der zweite Zustand des Popups ─────────────────────────────
 *
 * Design-Doku §10 „Konsequenz-Anzeige nach dem Speichern". Held ist NICHT die
 * Liste, sondern die Summe: was die Gehaltsänderung pro Monat kostet. Die
 * Zeilen darunter belegen sie nur — die Summe beantwortet die Frage sofort,
 * die Liste die Rückfrage „bei welchen?".
 *
 * §4.5-Rahmung: Was hier steht, ist der künftige PLAN-Anteil, also praktisch
 * die Antwort auf „auf welchen Betrag stelle ich den Dauerauftrag um?". Es ist
 * keine Buchhaltungs-Quittung, sondern eine Handlungsliste.
 */
function ConsequenceView({
  consequence,
  onClose,
}: {
  consequence: SplitConsequence;
  onClose: () => void;
}) {
  const { totalImpact, factorBefore, factorAfter, effectiveMonth } = consequence;
  /* Steigt der eigene Anteil, wird es teurer und die Sparrate sinkt — die Zahl
     ist dann ROT. Sinkt er, ist sie türkis. Das ist exakt die bestehende
     Palette-Bedeutung (Rot = Belastung, Türkis = positiv); es kommt keine Farbe
     hinzu. Den Gegenfall hat der Entwurf bereits als Klassen-Variante angelegt,
     nur seine Worte waren offen — sie sind am 07.08.2026 entschieden worden
     (Rolle design-direktor): gleicher Aufbau, drei Wörter drehen. */
  const isMore = totalImpact > 0;
  const abs = Math.abs(totalImpact);

  /* Nach Wirkung absteigend — der Posten, der am meisten ausmacht, zuerst. */
  const rows = [...consequence.items].sort(
    (a, b) => Math.abs(b.impact) - Math.abs(a.impact),
  );

  return (
    <div className={styles.dialog}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Dein Anteil {isMore ? "steigt" : "sinkt"}
        </h2>
      </div>
      <span className={styles.consequenceSubtitle}>
        Split {formatPercent(factorBefore)} → {formatPercent(factorAfter)} · ab{" "}
        {monthLabelFromIso(effectiveMonth)}
      </span>

      <div
        className={`${styles.consequenceHero} ${
          isMore ? styles.consequenceHeroUp : styles.consequenceHeroDown
        }`}
      >
        {isMore ? "+" : "−"}
        {formatAmount(abs)} €
      </div>
      <p className={styles.consequenceCaption}>
        {isMore ? "mehr" : "weniger"} pro Monat für{" "}
        <b>{postenPhrase(rows.length)}</b>. Die Sparrate{" "}
        {isMore ? "sinkt" : "steigt"} um denselben Betrag.
      </p>

      <div className={styles.consequenceTable}>
        <div className={styles.consequenceHead}>
          <div className={styles.consequenceName}>Posten</div>
          <div className={styles.consequenceCol}>Bisher</div>
          <div className={styles.consequenceCol}>Künftig</div>
          <div className={styles.consequenceCol}>Diff.</div>
        </div>
        {rows.map((item) => (
          <div key={item.cardId} className={styles.consequenceRow}>
            <div className={styles.consequenceName} title={item.name}>
              {item.name}
            </div>
            <div className={`${styles.consequenceCol} ${styles.consequenceOld}`}>
              {formatAmount(item.before)}
            </div>
            <div className={`${styles.consequenceCol} ${styles.consequenceNew}`}>
              {formatAmount(item.after)}
            </div>
            {/* Die Diff.-Spalte zeigt die WIRKUNG auf dich, nicht die nackte
                Differenz der beiden Spalten daneben. Bei einer gemeinsamen
                Einnahme sind das verschiedene Vorzeichen (§10) — nur so
                summiert sich die Spalte sichtbar zur Held-Zahl. */}
            <div
              className={`${styles.consequenceCol} ${
                item.impact > 0 ? styles.consequenceDiffUp : styles.consequenceDiffDown
              }`}
            >
              {item.impact > 0 ? "+" : "−"}
              {formatAmount(Math.abs(item.impact))}
            </div>
          </div>
        ))}
        <div className={`${styles.consequenceRow} ${styles.consequenceSum}`}>
          <div className={styles.consequenceName}>Zusammen</div>
          <div className={`${styles.consequenceCol} ${styles.consequenceOld}`}>
            {formatAmount(consequence.totalBefore)}
          </div>
          <div className={`${styles.consequenceCol} ${styles.consequenceNew}`}>
            {formatAmount(consequence.totalAfter)}
          </div>
          <div
            className={`${styles.consequenceCol} ${
              isMore ? styles.consequenceDiffUp : styles.consequenceDiffDown
            }`}
          >
            {isMore ? "+" : "−"}
            {formatAmount(abs)}
          </div>
        </div>
      </div>

      {/* §10: EIN Knopf. „Abbrechen" wäre sinnlos — es gibt nichts mehr
          abzubrechen; „Übernehmen" ist bereits geschehen.
          Bewusst `buttonSecondary` und nicht die Gold-Variante aus dem
          Entwurfsbild: Gold ist in der schmalen Palette der Vorjahres-Linie
          vorbehalten (§9 B6), und der Record vom 06.08. hält ausdrücklich
          fest, dass keine Farbe ihre Bedeutung ändert. */}
      <div className={styles.actions}>
        <button type="button" className={styles.buttonSecondary} onClick={onClose}>
          Schließen
        </button>
      </div>
    </div>
  );
}

/** Split-Faktor als Prozent mit einer Nachkommastelle: `0.572090` → `57,2 %`.
 *  Eine Stelle reicht, um die Bewegung zu zeigen, ohne eine Genauigkeit zu
 *  behaupten, die für die Aussage keine Rolle spielt. */
function formatPercent(factor: number): string {
  return `${(factor * 100).toLocaleString("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} %`;
}

/** „vier gemeinsame Posten" — im Fließsatz wird das Zahlwort ausgeschrieben
 *  (so auch im Entscheidungs-Record und im Entwurf). Ab dreizehn wird es
 *  unhandlich, dort steht die Ziffer. */
const ZAHLWORT = [
  "null", "ein", "zwei", "drei", "vier", "fünf", "sechs",
  "sieben", "acht", "neun", "zehn", "elf", "zwölf",
];

function postenPhrase(n: number): string {
  if (n === 1) return "einen gemeinsamen Posten";
  const wort = n < ZAHLWORT.length ? ZAHLWORT[n] : String(n);
  return `${wort} gemeinsame Posten`;
}

/** "2026-08-01" → "August 2026". */
function monthLabelFromIso(iso: string): string {
  const m = /^(\d{4})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return monthLabel(Number(m[1]), Number(m[2]));
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
