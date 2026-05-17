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
