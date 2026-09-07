/* Datenmodell des Tabs „Zuordnen" auf `/mobil` (v3-02).
 *
 * Alles hier ist SERVER-seitig fertig entschieden (§7 Regel 15 / LL-17): Der
 * Bildschirm bekommt Ergebnisse — welche Karte der Vorschlag ist, wie oft sie
 * so zugeordnet wurde, wer die Kandidaten sind — und keine Rohwerte plus
 * Schwelle. Die Zustandsentscheidung selbst (normal · mehrdeutig · kein
 * Vorschlag) steht als reine Funktion in `zustand.ts`. */

import type { Database } from "@/lib/supabase/types";

export type KartenTyp = Database["public"]["Enums"]["card_type"];

export type KandidatenKarte = {
  cardId: string;
  name: string;
  /** Der Toast unterscheidet Einnahme und Ausgabe („Einnahme · im Plan"). */
  typ: KartenTyp;
  /** Manuelle Zuordnungen desselben Händlers zu dieser Karte — „N × zuvor". */
  treffer: number;
};

export type Vorschlag = {
  cardId: string;
  name: string;
  typ: KartenTyp;
  /** „N × so zugeordnet"; 0, wenn der Vorschlag aus Händler-Regel oder
   *  Ähnlichkeit stammt und nie von Hand so lag. */
  treffer: number;
  /** `fragments.confidence` 0…1 — für das Label, wenn `treffer` 0 ist. */
  konfidenz: number;
};

export type OffeneZahlung = {
  id: string;
  /** „YYYY-MM-DD" */
  datum: string;
  betrag: number;
  empfaenger: string;
  zweck: string | null;
  vorschlag: Vorschlag | null;
  /** Karten, auf denen derselbe Händler von Hand lag — nur im Monat aktive.
   *  Zwei oder mehr → Zweifelsfall. */
  kandidaten: KandidatenKarte[];
};

/** Eine Zeile im Sheet „Karte wählen" — nur im Monat aktive Karten. Die
 *  rechte Spalte ist SERVER-seitig aus den Zustandsregeln der Karten gebildet
 *  (`card-state.ts`), der Client zeigt den Text. */
export type SheetKarte = {
  cardId: string;
  name: string;
  typ: KartenTyp;
  gruppe: "fixkosten" | "budget" | "einmalig" | "einnahmen";
  /** „1.180,00 € unbezahlt" · „bezahlt" · „62,24 € frei" · „Einnahme" */
  rechts: string;
};

export type MonatsStatus = "laufend" | "vorbei" | "forecast";

export type NachbarMonat = {
  /** „YYYY-MM" */
  ym: string;
  /** „August" */
  name: string;
  offen: number;
  status: MonatsStatus;
};

export type ZuordnenDaten = {
  /** „YYYY-MM" — der angezeigte Monat. */
  monat: string;
  /** „September 2026" */
  monatLabel: string;
  /** „September" */
  monatName: string;
  status: MonatsStatus;
  /** `calculate_sparrate_for_month`; `null` = kein Wert (LL-20), nicht 0. */
  sparrate: number | null;
  /** Buchungen des Monats ohne Überträge — der Nenner von „{i} von {n}". */
  buchungenGesamt: number;
  /** Davon bereits auf einer Karte (von Hand oder automatisch). */
  zugeordnet: number;
  /** Der Stapel, in Lieferreihenfolge. */
  offene: OffeneZahlung[];
  zurueck: NachbarMonat | null;
  vor: NachbarMonat | null;
  /** Für das Sheet „Karte wählen": alle im Monat aktiven Karten, gruppiert. */
  karten: SheetKarte[];
  /** ISO-Zeitstempel des Server-Aufbaus — „Stand von HH:MM" im Offline-Fall. */
  geladenUm: string;
};
