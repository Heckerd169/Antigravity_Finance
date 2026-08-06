import { Card } from "@/components/cards/card";
import type { EnrichedCard } from "@/components/cards/cards.types";
import {
  compareMonths,
  getCurrentDayOfMonth,
  getDaysInMonth,
} from "@/lib/months";
import { Portal } from "./portal";
import { Carousel } from "./carousel";
import { FragmentStack } from "./fragment-stack";
import { computeLiquidity } from "./liquidity";
import type { FragmentRow, InteractionZoneProps } from "./interaction-zone.types";
import styles from "./interaction-zone.module.css";

/* Server Component — Trinity-Layout. Rendert die Sprint-4-Card-Server-Components
   und reicht sie als opaque ReactNodes ins Client-Carousel weiter. */

export function InteractionZone({
  fragments,
  cards,
  targetMonth,
  targetDbMonth,
  currentMonth,
}: InteractionZoneProps) {
  const isFuture = compareMonths(targetMonth, currentMonth) === 1;
  const isPast = compareMonths(targetMonth, currentMonth) === -1;

  const items = cards.map((card: EnrichedCard) => ({
    id: card.id,
    node: (
      <Card
        key={card.id}
        card={card}
        isFuture={isFuture}
        isPast={isPast}
        month={targetDbMonth}
      />
    ),
  }));

  // Fragmente, die im aktuell angezeigten Monat eine Karte zugeordnet haben,
  // werden hier nicht weiter benötigt; die Drop-Outlines + Empty-Slot-Logik
  // reicht der vollständige fragments-Stream ins Karussell durch.
  const fragmentsForOverlay: FragmentRow[] = fragments;

  /* v2-15 (LQ-2): Die Ausstehend-Anzeige erscheint AUSSCHLIESSLICH im laufenden
     Monat (Entscheidung 06.08.2026).
     · Im Zukunftsmonat gibt es kein „heute", gegen das gerechnet werden könnte —
       alles stünde aus, und die Zahl wäre in Wahrheit die Monatslast. Das ist
       eine andere Aussage, die sich als Liquiditätsaussage tarnte.
     · Im vergangenen Monat sind alle Termine verstrichen, die Zahl wäre dauerhaft
       0 € — und ein Referenzwert ohne Daten ist „keine Anzeige", nicht 0
       (§7 Regel 17 / LL-20).
     Gerechnet wird server-seitig auf den bereits geladenen Karten; es gibt keine
     zusätzliche Abfrage und keinen nachgelagerten JS-Filter (§7 Regel 18). */
  const liquidity =
    compareMonths(targetMonth, currentMonth) === 0
      ? computeLiquidity(
          cards,
          getCurrentDayOfMonth(),
          getDaysInMonth(targetMonth),
        )
      : null;

  return (
    <div className={styles.interactionZone}>
      <Portal targetMonth={targetMonth} />
      <Carousel
        items={items}
        isFuture={isFuture}
        targetMonth={targetMonth}
        targetDbMonth={targetDbMonth}
        fragments={fragmentsForOverlay}
        liquidity={liquidity}
      />
      <FragmentStack fragments={fragments} targetMonth={targetMonth} />
    </div>
  );
}
