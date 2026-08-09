/*
 * Geld-Formatierung — zentralisiert, K1.6.
 * Karten + Overlays + Fragment-Stack: 2 Dezimalstellen (Pflicht).
 * Ring: eigenes Format (0 Dezimalen + NBSP), bleibt in singularity-ring/index.tsx.
 */

const EUR_FMT_2 = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Roher Geldbetrag mit 2 Dezimalen, ohne €-Suffix.
 *  Beispiel: `formatAmount(28.9)` → `"28,90"`. */
export function formatAmount(amount: number): string {
  return EUR_FMT_2.format(amount);
}

/** Geldbetrag mit 2 Dezimalen + Leerzeichen + €.
 *  Beispiel: `formatEuro(28.9)` → `"28,90 €"`. */
export function formatEuro(amount: number): string {
  return EUR_FMT_2.format(amount) + " €";
}

/** v2-17 (KAT-2): Geldbetrag MIT Vorzeichen, 2 Dezimalen, typografisches Minus.
 *  Beispiel: `formatEuroSigned(-374.02)` → `"−374,02 €"`,
 *            `formatEuroSigned(69.51)`   → `"+69,51 €"`.
 *
 *  Nur für Kategorie-Kacheln. Eine KARTE trägt kein Vorzeichen, weil ihr Typ die
 *  Richtung transportiert — „Fixkosten" heißt Abgang, „Einnahmen" heißt Zugang.
 *  Ein ORDNER hat keinen Typ und kann beides mischen: In „Abos &
 *  Mitgliedschaften" liegen acht Ausgaben und zwei Erstattungen. Ohne Vorzeichen
 *  wäre nicht lesbar, wohin die 374,02 € wirken (Record B5).
 *
 *  Bei exakt 0 steht kein Vorzeichen: „+0,00 €" behauptete eine Richtung, die es
 *  nicht gibt. Das typografische Minus (U+2212) statt des Bindestrichs ist
 *  dieselbe Wahl wie in `formatEuroRounded` und im Ring. */
export function formatEuroSigned(amount: number): string {
  if (amount === 0) return "0,00 €";
  const sign = amount > 0 ? "+" : "−";
  return `${sign}${EUR_FMT_2.format(Math.abs(amount))} €`;
}

const NBSP = " ";

/** Geldbetrag auf ganze Euro gerundet, mit geschütztem Leerzeichen vor dem €.
 *  Beispiel: `formatEuroRounded(1814.02)` → `"1.814 €"`.
 *
 *  v2-15 (LQ-2) für die Ausstehend-Anzeige: Sie ist eine Vorhersage — Cent
 *  suggerierten eine Genauigkeit, die der abgeleitete Fälligkeitstag nicht
 *  hergibt. Dieselbe Wahl wie im Ring (`singularity-ring/ring-subline.ts`),
 *  inklusive NBSP, damit das €-Zeichen nie allein umbricht. Anders als dort
 *  ohne aufgezwungenes Vorzeichen: „+" gehört zu einer Abweichung, nicht zu
 *  einem Bestand. Das typografische Minus bleibt bei negativen Werten. */
export function formatEuroRounded(amount: number): string {
  const rounded = Math.round(amount);
  // −0 vermeiden: Math.round(-0.4) ist -0 und formatierte als „-0 €".
  const safe = Object.is(rounded, -0) ? 0 : rounded;
  return `${safe.toLocaleString("de-DE", { maximumFractionDigits: 0 }).replace("-", "−")}${NBSP}€`;
}
