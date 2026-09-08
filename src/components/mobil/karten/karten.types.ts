import type { KartenGruppe } from "../zuordnen/gruppen";
import type { PunktFarbe } from "./regeln";

/* Tab „Karten" auf /mobil (Handoff §5).
 *
 * Der Server entscheidet, der Bildschirm zeigt (§7 Regel 15 / LL-17): Jede
 * Zeile kommt mit fertigem Statuswort, fertigem Betragstext, fertiger
 * Punktfarbe und fertigem Balkenanteil. Der Client filtert und klappt auf —
 * mehr nicht. */

export type BuchungsZeile = {
  id: string;
  empfaenger: string;
  /** Bereits formatiert, mit Vorzeichen. */
  betragText: string;
};

export type KartenZeile = {
  cardId: string;
  name: string;
  /** Die Gruppe entscheidet, welche Filter-Pille die Zeile zeigt — dieselbe
   *  Einteilung wie im Sheet „Karte wählen" (`gruppen.ts`), inklusive
   *  „Einmalig". Die drei Kacheln der Übersicht gruppieren gröber, nach
   *  `cards.type`. */
  gruppe: KartenGruppe;
  punkt: PunktFarbe;
  balken: PunktFarbe;
  /** 0..1 — wie weit der Balken gefüllt ist. */
  anteil: number;
  /** Der Anzeige-Betrag der Karte, rechts in Zeile 1. */
  ausgegebenText: string;
  /** „Budget · 3 Buchungen" — Typ und Status in einem. */
  statusText: string;
  /** „von 240,00 €" · „erwartet" · „eingegangen". */
  rechtsText: string;
  buchungen: BuchungsZeile[];
};

export type KartenDaten = {
  /** „YYYY-MM". */
  monat: string;
  /** „September 2026". */
  monatLabel: string;
  zeilen: KartenZeile[];
  /** Offene Zahlungen des Monats — für das Badge der Tab-Leiste. */
  offen: number;
};
