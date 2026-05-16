import type { EnrichedCard } from "./cards.types";
import { Card } from "./card";
import { compareMonths } from "@/lib/months";
import styles from "./cards.module.css";

type CardsCarouselProps = {
  cards: EnrichedCard[];
  targetMonth: string; // "YYYY-MM"
  currentMonth: string; // "YYYY-MM"
  dbMonth: string; // "YYYY-MM-01"
};

export function CardsCarousel({ cards, targetMonth, currentMonth, dbMonth }: CardsCarouselProps) {
  if (cards.length === 0) return null;

  const isFuture = compareMonths(targetMonth, currentMonth) === 1;

  return (
    <div className={styles.carousel} aria-label="Karten">
      {cards.map((card) => (
        <Card key={card.id} card={card} isFuture={isFuture} month={dbMonth} />
      ))}
    </div>
  );
}
