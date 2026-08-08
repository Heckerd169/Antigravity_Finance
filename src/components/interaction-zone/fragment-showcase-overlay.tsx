"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { formatAmount } from "@/lib/format";
import { isTransferFragment, type FragmentRow } from "./interaction-zone.types";
import { shortenIban, splitDescription } from "./fragment-showcase";
import styles from "./interaction-zone.module.css";

/* v2-16 (RM-2) — das Schaufenster-Popup.
 *
 * Ein reines ANZEIGE-Popup: keine Zuordnung, kein Eject, keine Korrektur, keine
 * Knöpfe (§11 „Schaufenster-Popup"). Es ist die Gegenleistung dafür, dass RM-1
 * der Fragment-Karte den Empfänger genommen hat — seit v2-10 zeigt sie den
 * Verwendungszweck, der Empfänger ist damit nirgends sonst mehr sichtbar.
 *
 * Aufbau nach §11: Datum in der Kopfzeile · Empfänger als Hauptzeile mit dem
 * Betrag rechts daneben · Verwendungszweck ungekürzt darunter · unter dem Strich
 * die Rangfolge „erst was immer gilt, dann was den Zustand erklärt, dann was
 * selten vorkommt".
 *
 * Nicht im Popup (§11 ausdrücklich): Duplikat-Hash und Import-Zeitpunkt. */

const DATE_FMT = new Intl.DateTimeFormat("de-DE", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const MONTH_FMT = new Intl.DateTimeFormat("de-DE", {
  month: "long",
  year: "numeric",
});

type FragmentShowcaseOverlayProps = {
  fragment: FragmentRow;
  onClose: () => void;
};

export function FragmentShowcaseOverlay({
  fragment,
  onClose,
}: FragmentShowcaseOverlayProps) {
  /* §11 „Ort und Schließen": Escape-Handler von Anfang an — anders als das
     Einkommens-Popup, das ihn bis v2-16 als einziges von acht Overlays nicht
     hatte (sprints/sprint_v2-10_offene_fragen.md §6). */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isTransfer = isTransferFragment(fragment);
  const isReallocation = fragment.status === "ASSET_REALLOCATION";
  const { main, purpose } = splitDescription(fragment.description);

  const isPos = fragment.amount >= 0;
  const sign = isPos ? "+" : "−";
  const abs = Math.abs(fragment.amount);

  /* Kopfzeilen-Wort: der Zustand steht hier, damit er nicht zusätzlich als
     Zeile unter dem Strich auftaucht. „Umschichtung" ist bewusst ein eigenes
     Wort und nicht „Übertrag" — sie ist vom User selbst markiert worden, ein
     INTERNAL_TRANSFER dagegen beim Import automatisch erkannt (Entscheidung
     07.08.2026, Rolle design-direktor). */
  const kicker = isReallocation
    ? "Umschichtung"
    : fragment.status === "INTERNAL_TRANSFER"
      ? "Übertrag"
      : "Buchung";

  const shortIban = fragment.counterpartyIban
    ? shortenIban(fragment.counterpartyIban)
    : null;

  return createPortal(
    /* Portal + `data-wave-block` — dasselbe Muster wie bei den übrigen Overlays
       (LL-6). Der Marker ist hier strukturell nicht nötig, weil die
       Interaktionszone ein GESCHWISTER der Welle ist und nicht ihr Nachfahre;
       ein Klick im Popup erreicht `welle/index.tsx` also gar nicht erst. Er
       steht trotzdem, weil er nichts kostet und die Absicht festhält, falls die
       Zonen je zusammenwandern. Genau diese Annahme („liegt ja woanders") ist
       in v2-10 einmal teuer geworden. */
    <div
      className={styles.overlayBackdrop}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      data-wave-block
    >
      <div
        className={styles.showcaseModal}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="showcase-main"
      >
        <div className={styles.showcaseKicker}>
          {kicker} · {formatDateLong(fragment.transaction_date)}
        </div>

        <div className={styles.showcaseHeroRow}>
          <div id="showcase-main" className={styles.showcaseWho}>
            {main}
          </div>
          <div
            className={`${styles.showcaseAmount} ${
              isPos ? styles.showcaseAmountPos : styles.showcaseAmountNeg
            }`}
          >
            {sign}
            {formatAmount(abs)} €
          </div>
        </div>

        {/* §11: Enthält die Beschreibung kein Trennzeichen (DKB Visa liefert ein
            einziges Feld), steht der gesamte Text in der Hauptzeile und DIESE
            ZEILE ENTFÄLLT. Bewusst kein zweites Layout — eine wegfallende Zeile
            ist ruhiger als ein springender Aufbau. */}
        {purpose !== null && (
          <div className={styles.showcasePurpose}>{purpose}</div>
        )}

        <div className={styles.showcaseRule} />

        {/* Rangfolge §11: Datum (oben) → Status bzw. zugeordnete Karte →
            Gegenkonto (nur Übertrag) → KI-Vorschlag (nur unzugeordnet). */}
        {!isTransfer &&
          (fragment.status === "UNASSIGNED" ? (
            <ShowcaseRow label="Status" value="Nicht zugeordnet" />
          ) : fragment.assignedCardName !== null ? (
            <ShowcaseRow
              label="Zugeordnet"
              value={fragment.assignedCardName}
              emphasis
              /* AUTO_ABSORBED: ab 95 % Konfidenz ordnet die App selbst zu (§11).
                 Diese Zuordnung hat der User nie getroffen — das Popup ist der
                 einzige Ort, an dem er davon erfährt (Entscheidung 07.08.2026). */
              hint={
                fragment.status === "AUTO_ABSORBED"
                  ? "automatisch erkannt"
                  : undefined
              }
            />
          ) : null)}

        {!isTransfer && fragment.assigned_month !== null && (
          <ShowcaseRow
            label="Im Monat"
            value={formatMonth(fragment.assigned_month)}
          />
        )}

        {isTransfer && (
          <>
            {shortIban !== null && (
              <ShowcaseRow label="Gegenkonto" value={shortIban} />
            )}
            {/* Der Hinweis trägt die eigentliche Aussage und steht deshalb auch
                dann, wenn keine IBAN hinterlegt ist (im Bestand 109 von 378
                Überträgen) — LL-20: der fehlende Wert entfällt, die Aussage
                nicht. */}
            <div className={styles.showcaseNote}>
              {isReallocation
                ? "Von dir als Umschichtung markiert — zählt nicht in die Sparrate"
                : "Eigenes Konto — zählt nicht in die Sparrate"}
            </div>
          </>
        )}

        {fragment.status === "UNASSIGNED" &&
          fragment.suggestedCardName !== null && (
            <ShowcaseRow
              label="Vorschlag"
              value={
                fragment.suggestionConfidence !== null
                  ? `${fragment.suggestedCardName} · ${Math.round(
                      fragment.suggestionConfidence * 100,
                    )} %`
                  : fragment.suggestedCardName
              }
              teal
            />
          )}
      </div>
    </div>,
    document.body,
  );
}

function ShowcaseRow({
  label,
  value,
  hint,
  emphasis,
  teal,
}: {
  label: string;
  value: string;
  hint?: string;
  emphasis?: boolean;
  teal?: boolean;
}) {
  return (
    <div className={styles.showcaseRow}>
      <div className={styles.showcaseRowKey}>{label}</div>
      <div className={styles.showcaseRowValueGroup}>
        <div
          className={`${styles.showcaseRowValue} ${
            emphasis ? styles.showcaseRowValueOn : ""
          } ${teal ? styles.showcaseRowValueTeal : ""}`}
        >
          {value}
        </div>
        {hint !== undefined && (
          <div className={styles.showcaseRowHint}>{hint}</div>
        )}
      </div>
    </div>
  );
}

function formatDateLong(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return DATE_FMT.format(date);
}

function formatMonth(iso: string): string {
  const m = /^(\d{4})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, 1));
  return MONTH_FMT.format(date);
}
