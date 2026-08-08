"use client";

import { useState } from "react";
import { IncomeSplitPopup } from "@/components/income-split";
import { formatEuro } from "@/lib/format";
import type { IncomeSlotProps } from "./interaction-zone.types";
import cardStyles from "@/components/cards/cards.module.css";
import styles from "./interaction-zone.module.css";

type NettoTileProps = {
  /** Das Nettogehalt des Monats — derselbe Wert, den der Einkommens-Ordner
   *  oben trägt. Kommt aus `get_category_amounts_for_month`, damit Kachel und
   *  Ordner nicht auseinanderlaufen können. */
  amount: number;
  isGhost: boolean;
  income: IncomeSlotProps;
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
 *  Die Kachel ist ein einfacher Knopf, der ein Fenster öffnet. */
export function NettoTile({ amount, isGhost, income }: NettoTileProps) {
  const [isOpen, setIsOpen] = useState(false);

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
            durchgehende Unterkante behält. */}
        <div className={cardStyles.householdAmount} />
        <div className={cardStyles.stateRow}>
          <span className={cardStyles.stateLabel}>
            {isGhost ? "Forecast" : "Monatlich"}
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
      />
    </>
  );
}
