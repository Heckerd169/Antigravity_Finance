import type { MonatsStatus } from "../zuordnen/zuordnen.types";

/* Tab „Übersicht" auf /mobil (Handoff §4, Record #10).
 *
 * Der Server entscheidet alles, der Bildschirm zeigt nur (§7 Regel 15 / LL-17):
 * Die Kacheln bekommen fertige Zeilen, nicht Rohwerte plus Regel; der Ring
 * bekommt Ist und Plan und rechnet selbst nichts. */

/** Eine der drei Kacheln unter der Bühne. Die Gruppierung folgt `cards.type` —
 *  eine einmalige Ausgabe zählt dort mit, wo ihr Typ steht, weil der Typ
 *  bestimmt, WIE gerechnet wird (§4.3). Die Filter-Pillen im Tab „Karten"
 *  gruppieren feiner (`kartenGruppe`, vier Gruppen inklusive „Einmalig"). */
export type Kachel = {
  /** „FIXKOSTEN" · „BUDGET" · „EINNAHMEN" — schon in Großbuchstaben. */
  titel: string;
  /** Plansumme des Typs im Monat, formatiert. */
  plan: string;
  /** „1.593,00 € unbezahlt" · „412,00 € frei" · „erwartet" · „eingegangen". */
  unten: string;
};

/** Die zwölf Monatswerte hinter der Bühne. `values` ist bereits auf Zahlen
 *  aufgelöst (kein Wert → 0, wie am Schreibtisch beim Kumulieren). */
export type WellenDaten = {
  values: number[];
  /** Letzter realisierter Monat im gezeigten Jahr; −1 = keiner, 11 = alle. */
  realizedIndex: number;
  /** Der angezeigte Monat 0..11 — hebt die Beschriftung hervor. */
  activeIndex: number;
};

export type UebersichtDaten = {
  /** „YYYY-MM" des angezeigten Monats. */
  monat: string;
  /** „September 2026". */
  monatLabel: string;
  status: MonatsStatus;
  /** Ist-Sparrate des Monats. `null` = keine Anzeige, nicht 0 (LL-20). */
  sparrate: number | null;
  /** Plan-Sparrate desselben Monats — der Ring braucht beides. */
  planSparrate: number | null;
  welle: WellenDaten;
  kacheln: Kachel[];
  /** Offene Zahlungen des Monats — Einstiegskarte und Tab-Badge. */
  offen: number;
  /** Zuletzt zugeordnete Zahlung dieses Monats, für die Fußzeile. */
  zuletzt: { empfaenger: string; karte: string } | null;
};
