"use client";

import { useState } from "react";
import { IncomeSplitPopup } from "@/components/income-split";
import { formatEuro } from "@/lib/format";
import type { IncomeAssignment, IncomeSlotProps } from "./interaction-zone.types";
import cardStyles from "@/components/cards/cards.module.css";
import styles from "./interaction-zone.module.css";

type NettoTileProps = {
  /** Das Nettogehalt des Monats — derselbe Wert, den der Einkommens-Ordner
   *  oben trägt. Kommt aus `get_category_amounts_for_month`, damit Kachel und
   *  Ordner nicht auseinanderlaufen können.
   *
   *  Seit v2-19 ist das der TATSÄCHLICH überwiesene Betrag, sobald eine Zahlung
   *  zugeordnet ist — sonst weiterhin der Plan. */
  amount: number;
  /** Der Planwert des Monats. Weicht er von `amount` ab, liegt eine Zuordnung
   *  vor und die Kachel zeigt beide Werte übereinander (Record, Entscheidung D). */
  planned: number | null;
  isGhost: boolean;
  income: IncomeSlotProps;
  /** Die zugeordnete Zahlung, falls es eine gibt — fürs Lösen im
   *  Einkommens-Fenster (Record, Entscheidung E). */
  assignment: IncomeAssignment | null;
};

/** v2-17 (KAT-2): Das Nettogehalt als Kachel im Ordner „Einkommen".
 *
 *  Warum es das überhaupt gibt (Record A4): Nach §4.2 ist
 *  `Sparrate = Netto + Einnahmen − Fixkosten − Budgets`. Die Kategorien decken
 *  ausschließlich Karten ab; das Netto ist KEINE Karte und stand bis heute gar
 *  nicht im Karussell. Ohne diesen Ordner fehlte in der Aufstellung genau
 *  dieser Betrag, und die Summen ergäben nicht die Sparrate — was der User
 *  ausdrücklich zur Bedingung gemacht hat.
 *
 *  Nebeneffekt, nicht gesucht: Das Gehalt wird zum ersten Mal überhaupt im
 *  Karussell sichtbar.
 *
 *  Die Geste bleibt einheitlich — Ordner klappt auf, Element öffnet Details.
 *  Ein Klick öffnet das BESTEHENDE Einkommens-Fenster, dasselbe, das auch an
 *  den Flanken der Welle hängt. Kein zweiter Ort, kein zweites Formular.
 *
 *  Kein Tap-Catcher, kein `manually_paid`: Das Netto hat keinen Bezahlt-Status.
 *  Die Kachel ist ein einfacher Knopf, der ein Fenster öffnet.
 *
 *  v2-19 (GE-1, Record A/D): Sie ist jetzt zusätzlich ABLAGEZIEL. Der Wrapper
 *  darum liegt in `carousel.tsx` — die Hervorhebung beim Ziehen ist dieselbe
 *  wie bei einer Karte, weil es dieselbe Komponente ist. Die Kachel wird
 *  dadurch KEINE Karte: kein Kontextmenü, kein Lebenszyklus, kein
 *  „Betrag anpassen". Der Klick öffnet weiterhin das Einkommens-Fenster.
 *
 *  Liegt eine Zuordnung vor, trägt die Zeile unter dem Betrag den Planwert.
 *  Sie ist derselbe Höhen-Platzhalter, den die Fixkosten-Karte für
 *  `von 1.904,00 €` benutzt — deshalb bleibt die Reihe gleich hoch, ob
 *  zugeordnet oder nicht. „geplant" statt „von", weil „von" beim
 *  Haushaltsanteil bereits etwas anderes bedeutet. */
export function NettoTile({
  amount,
  planned,
  isGhost,
  income,
  assignment,
}: NettoTileProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Die Plan-Zeile erscheint nur, wenn die Wirklichkeit vom Plan abweicht.
  // Bei Gleichstand — Januar bis Juni 2026 etwa, wo exakt der Planbetrag
  // überwiesen wurde — stünde sonst zweimal dieselbe Zahl untereinander.
  const showsPlanned =
    planned !== null && Math.abs(planned - amount) >= 0.005;

  return (
    <>
      <button
        type="button"
        className={`${cardStyles.card} ${
          isGhost ? cardStyles.ghost : cardStyles.expected
        } ${styles.nettoTile}`}
        onClick={() => setIsOpen(true)}
        aria-label="Nettogehalt bearbeiten"
      >
        <div className={cardStyles.cardTop}>
          <div className={cardStyles.cardLabel}>Einkommen</div>
        </div>
        <div className={cardStyles.cardName}>Nettogehalt</div>
        <div className={cardStyles.cardAmount}>{formatEuro(amount)}</div>
        {/* Höhen-Platzhalter wie auf jeder Karte, damit die Reihe eine
            durchgehende Unterkante behält — seit v2-19 trägt er den Planwert,
            sobald eine Zahlung zugeordnet ist. */}
        <div className={cardStyles.householdAmount}>
          {showsPlanned ? `geplant ${formatEuro(planned as number)}` : null}
        </div>
        <div className={cardStyles.stateRow}>
          <span className={cardStyles.stateLabel}>
            {isGhost ? "Forecast" : assignment ? "Zugeordnet" : "Monatlich"}
          </span>
        </div>
        <div className={cardStyles.cardMeta}>
          <div className={`${cardStyles.metaDot} ${cardStyles.metaDotIch}`} />
          <div className={cardStyles.metaText}>Ich</div>
        </div>
      </button>

      <IncomeSplitPopup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        person="ICH"
        activeMonth={income.activeMonth}
        isFirstIncomeEntry={false}
        taxClass={income.taxClass}
        taxYear={income.taxYear}
        initialGrossAnnual={income.initialGrossAnnual}
        initialNetMonthly={income.initialNetMonthly}
        counterpartGrossAnnual={income.counterpartGrossAnnual}
        assignment={assignment}
      />
    </>
  );
}
