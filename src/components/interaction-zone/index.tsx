import { Card } from "@/components/cards/card";
import type { EnrichedCard } from "@/components/cards/cards.types";
import { compareMonths } from "@/lib/months";
import { Portal } from "./portal";
import { Carousel } from "./carousel";
import { FragmentStack } from "./fragment-stack";
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

  const items = cards.map((card: EnrichedCard) => ({
    id: card.id,
    node: (
      <Card
        key={card.id}
        card={card}
        isFuture={isFuture}
        month={targetDbMonth}
      />
    ),
  }));

  // Fragmente, die im aktuell angezeigten Monat eine Karte zugeordnet haben,
  // werden hier nicht weiter benötigt; die Drop-Outlines + Empty-Slot-Logik
  // reicht der vollständige fragments-Stream ins Karussell durch.
  const fragmentsForOverlay: FragmentRow[] = fragments;

  return (
    <div className={styles.interactionZone}>
      <Portal targetMonth={targetMonth} />
      <Carousel
        items={items}
        isFuture={isFuture}
        targetMonth={targetMonth}
        targetDbMonth={targetDbMonth}
        fragments={fragmentsForOverlay}
      />
      <FragmentStack fragments={fragments} targetMonth={targetMonth} />
    </div>
  );
}
