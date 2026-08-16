/* Sichtbarkeit eines Kartenvorschlags — die eine Stelle, an der entschieden wird,
   ob eine offene Zahlung im Schaufenster einen Vorschlag zeigt.
 *
 * WARUM DAS HIER STEHT UND NICHT MEHR IN `page.tsx` (v2-22, `ZO-2`):
 * Die Regel war inline im `.map()` einer Server Component eingebettet und damit
 * nicht einzeln prüfbar — und genau dort saß in v2-21 ein Fehler, der den ganzen
 * Sprint entwertet hätte: Die Bedingung lautete
 * `conf >= badge && conf < auto_absorption`. Die Obergrenze war nie eine Aussage
 * über die Konfidenz, sondern ein STELLVERTRETER für „wurde bereits automatisch
 * verlinkt". Seit `refresh_fragment_suggestions` nachrechnet, ohne zu verlinken,
 * stimmt der Stellvertreter nicht mehr: Es gibt offene Zahlungen mit Konfidenz
 * ≥ 0,95 — gemessen 24 Stück allein in 2026, und es sind die treffsichersten.
 *
 * Es war die dritte Stelle dieser Art in vier Tagen (v2-19 `getTop3Drivers`,
 * v2-20 Lösch-Tor in `page.tsx`, v2-21 hier). Kein Anker und keine Prüfsumme
 * fängt so etwas: Alle Zahlen sind richtig, sie werden nur nicht gezeigt.
 * Deshalb ist die Regel jetzt eine reine Funktion mit eigener Spec.
 *
 * Die Auswertung bleibt SERVER-seitig (LL-17): Die Client-Komponente bekommt das
 * Ergebnis (`suggestedCardName`), nicht Rohwert plus Schwelle. */

/** Status einer Zahlung, wie ihn `fragments_with_status` liefert. Er ist die
 *  verlässliche Auskunft darüber, ob bereits verlinkt wurde — abgeleitet aus dem
 *  tatsächlichen Link, nicht aus einer Schwelle. */
export type FragmentStatus = string;

export type VorschlagEingabe = {
  /** `fragments.suggested_card_id` — ohne Karte kein Vorschlag. */
  suggestedCardId: string | null;
  /** `fragments.confidence`, bereits als Zahl. */
  confidence: number | null;
  /** Status aus `fragments_with_status`. */
  status: FragmentStatus;
  /** `app_config.confidence.badge_threshold` — nie hartcodiert (Regel 5). */
  badgeThreshold: number;
};

/**
 * Soll für diese Zahlung ein Kartenvorschlag angezeigt werden?
 *
 * Vier Bedingungen, alle notwendig:
 *  1. Es gibt überhaupt eine vorgeschlagene Karte.
 *  2. Es gibt einen Konfidenzwert.
 *  3. Der Wert erreicht die Badge-Schwelle.
 *  4. Die Zahlung ist noch offen (`UNASSIGNED`).
 *
 * Bewusst KEINE Obergrenze: Ein hoher Wert ist ein Grund, den Vorschlag zu
 * zeigen, nie einer, ihn zu verbergen. Ob bereits verlinkt wurde, sagt der
 * Status.
 */
export function istVorschlagSichtbar({
  suggestedCardId,
  confidence,
  status,
  badgeThreshold,
}: VorschlagEingabe): boolean {
  if (suggestedCardId === null) return false;
  if (confidence === null) return false;
  if (!Number.isFinite(confidence)) return false;
  if (confidence < badgeThreshold) return false;
  return status === "UNASSIGNED";
}
