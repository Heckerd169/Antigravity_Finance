import type { BalkenTon } from "./regeln";

/* Tab „Verlauf" auf /mobil (Handoff §6).
 *
 * Jeder Monat bringt alles mit, was seine Auswahl zeigen würde — Balkenhöhe,
 * Ton, Werttext, Planlinie und die beiden Zeilen der Detailkarte. Der Client
 * wählt nur aus; er rechnet nichts nach und lädt nichts nach (§7 Regel 15). */

export type VerlaufMonat = {
  /** „YYYY-MM". */
  ym: string;
  /** „Sep" — die Beschriftung unter dem Balken. */
  kurz: string;
  /** „SPARRATE · Sep 2026" — der Kopf der Detailkarte. */
  detailTitel: string;
  /** Höhe des Balkens in Pixeln. */
  hoehe: number;
  ton: BalkenTon;
  /** Der Wert **über dem Balken** — ganze Euro. Sechs davon teilen sich 430 px;
   *  mit Cent überlappen sie einander (gemessen in v3-03). */
  balkenText: string;
  /** Derselbe Wert **groß in der Detailkarte** — dort ist Platz, dort steht er
   *  mit Cent. */
  wertText: string;
  /** Höhe der Planlinie in Pixeln — `null`, wenn es für den Monat keinen Plan
   *  gibt. Dann wird auch keine Linie gezeichnet. */
  planHoehe: number | null;
  /** „Plan 1.695,09 €". */
  planText: string | null;
  /** „+82,00 € über Plan" · „82,00 € unter Plan" · „Defizit — 105,24 € gegen Plan". */
  unterzeile: string;
  unterzeileTon: BalkenTon;
};

export type VerlaufDaten = {
  /** Der zunächst gewählte Monat — der aus der Adresse. */
  gewaehlt: string;
  monate: VerlaufMonat[];
  /** Der Durchschnitt über die gezeigten Monate. `null`, wenn kein einziger
   *  Monat einen Wert hat — dann steht dort ein Strich, keine Null. */
  durchschnittText: string | null;
  /** Offene Zahlungen des Monats — für das Badge der Tab-Leiste. */
  offen: number;
};
