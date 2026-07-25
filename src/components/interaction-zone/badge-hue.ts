/* ============================================================
   v2-07 A1 — deterministische Zuordnung Kartenname → Badge-Farbton.
   Schließt Sprint-8-OQ1 („karten-spezifische Badge-Farben", bis v2-06 als
   V2-C / V3'' vorgemerkt).

   Warum ein Hash und keine Spalte: das Datenmodell bleibt unangetastet
   (Auftragsvorgabe v2-07). Einziger Eingabewert ist der Kartenname — damit
   ist der Farbton stabil über Renders, Sitzungen und Geräte hinweg und
   unabhängig von Anzahl, Reihenfolge oder Anlage-Zeitpunkt der Karten
   (AC-A1.2). Eine Karte behält ihre Farbe auch dann, wenn andere Karten
   gelöscht oder angelegt werden.

   Warum FNV-1a und keine Quersumme: eine Quersumme über die Zeichencodes
   liefert für Anagramme identische Werte und verteilt bei kurzen Namen
   schlecht — bei einem Namensraum wie „Miete" / „Strom" / „Netflix" mit
   sechs Eimern wäre die Häufung sichtbar. FNV-1a ist klein, ohne
   Abhängigkeit und gut durchmischend.
   ============================================================ */

/** Anzahl der Farbtöne. Muss zur Token-Reihe --badge-hue-1..N in
 *  `src/styles/tokens.css` und zur Klassen-Reihe in `fragment-card.tsx`
 *  passen. Sechs ist ein User-Entscheid (E2, 25.07.2026): genug Trennschärfe,
 *  ohne dass die Rohmasse bunt wirkt. */
export const BADGE_HUE_COUNT = 6;

/**
 * Liefert den Farbton-Index `0 … BADGE_HUE_COUNT-1` für einen Kartennamen.
 *
 * Normalisierung vor der Berechnung: Randleerzeichen und Groß-/Kleinschreibung
 * dürfen den Farbton nicht ändern (AC-A1.3) — „Netflix", „netflix" und
 * „ Netflix " ergeben denselben Ton.
 */
export function badgeHueIndex(cardName: string): number {
  const key = cardName.trim().toLowerCase();

  let hash = 0x811c9dc5; // FNV-1a-Offset-Basis (32 Bit)
  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i);
    // FNV-Primzahl 16777619. Math.imul multipliziert 32-Bit-genau — der
    // normale `*`-Operator würde ab 2^53 Genauigkeit verlieren und das
    // Ergebnis plattformabhängig machen.
    hash = Math.imul(hash, 0x01000193);
  }

  // >>> 0 macht aus dem vorzeichenbehafteten 32-Bit-Wert einen
  // vorzeichenlosen — sonst könnte % ein negatives Ergebnis liefern.
  return (hash >>> 0) % BADGE_HUE_COUNT;
}
