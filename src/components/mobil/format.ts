/* Formatierung für `/mobil` — setzt auf `lib/format.ts` auf, statt Zahlen ein
 * zweites Mal zu formatieren. Was hier dazukommt, ist nur die Zusammensetzung:
 * Vorzeichen als typografisches Minus (U+2212), Plus nur auf Wunsch, und das
 * geschützte Leerzeichen vor dem €, damit das Zeichen nie allein umbricht
 * (Handoff-README „Rahmen": „Minus als typografisches −, Euro mit geschütztem
 * Leerzeichen, de-DE-Format"). */

import { formatAmount } from "@/lib/format";

const NBSP = " ";
const MINUS = "−";

/** „−47,83 €" · mit `plus`: „+2.658,00 €" für Zugänge · 0 → „0,00 €".
 *  Ohne `plus` trägt ein positiver Betrag kein Vorzeichen — so steht die
 *  Sparrate im Kopf („812,40 €"), so steht ein Rest im Sheet. */
export function eur(n: number, opts: { plus?: boolean } = {}): string {
  const abs = formatAmount(Math.abs(n));
  const sign = n < 0 ? MINUS : n > 0 && opts.plus ? "+" : "";
  return `${sign}${abs}${NBSP}€`;
}

/** „1.593 €" — ohne Cent, für Stellen, an denen der Platz sie nicht trägt.
 *
 *  **Warum es das gibt, obwohl `eur()` die Regel ist:** Drei Kacheln teilen sich
 *  die Breite des Bildschirms, jede bekommt rund 105 px. „2.841,87 € unbezahlt"
 *  misst dort etwa 130 px und würde mit einer Ellipse enden — ausgerechnet auf
 *  der Ziffer. Der Entwurf rechnet an diesen Stellen deshalb in ganzen Euro, und
 *  der Design-Record hat gegen ganze Euro gemessen („1.593 € unbezahlt bei 11 px
 *  passt einzeilig in 105 px"). Dasselbe im Verlauf: Sechs Werte über sechs
 *  Balken teilen sich 430 px.
 *
 *  **Nur für Übersichts-Flächen.** Wo eine einzelne Zahl steht — Kopf-Sparrate,
 *  Fokus-Karte, Kartenliste, Detailkarte, Toast — bleibt es bei `eur()` mit
 *  Cent. Der Nutzer rechnet damit; eine gerundete Zahl an einer Stelle, wo Platz
 *  ist, wäre ein Verlust ohne Gegenwert. (v3-03, LL-31/LL-45) */
export function eurGanz(n: number): string {
  const sign = n < 0 ? MINUS : "";
  const abs = Math.abs(Math.round(n)).toLocaleString("de-DE");
  return `${sign}${abs}${NBSP}€`;
}

const DATUM_LANG = new Intl.DateTimeFormat("de-DE", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** „2026-09-01" → „1. September 2026". UTC-Date, das Ergebnis geht nur ins
 *  UI (§7 Regel 8 gilt für Werte Richtung Datenbank). */
export function formatDatumLang(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return DATUM_LANG.format(
    new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))),
  );
}

const UHRZEIT = new Intl.DateTimeFormat("de-DE", {
  hour: "2-digit",
  minute: "2-digit",
});

/** ISO-Zeitstempel → „14:32" in der Zeitzone des Geräts — für die
 *  Offline-Pille „Stand von 14:32". */
export function formatUhrzeit(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : UHRZEIT.format(d);
}
