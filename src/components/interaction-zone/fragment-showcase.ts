/* v2-16 (RM-2) — die Textregeln des Schaufenster-Popups, bewusst OHNE Importe.
 *
 * Warum eine eigene Datei: Beide Funktionen sind reine Regeln, und eine Regel,
 * die im Bauteil eingebettet ist, lässt sich nicht einzeln prüfen. Genau daran
 * hat `BF-2` zwei Sprints überlebt (v2-12) — die Lehre daraus ist das Muster
 * von `singularity-ring/ring-subline.ts`: Logik raus aus der Komponente, dann
 * einen Regressions-Wächter direkt auf die Quelldatei setzen
 * (`tests/e2e/fragment-showcase.spec.ts`).
 *
 * Keine Imports, kein React, kein CSS — sonst ließe sich die Datei im Test
 * nicht transpilieren und ausführen. */

export type SplitDescription = {
  /** Hauptzeile des Popups — der Empfänger. */
  main: string;
  /** Verwendungszweck; `null` heißt: die Zeile entfällt (§11, DKB Visa). */
  purpose: string | null;
};

/** §11: Die Hauptzeile trägt den EMPFÄNGER — den ERSTEN durch `|` getrennten
 *  Teil —, der Verwendungszweck steht ungekürzt darunter.
 *
 *  Das ist die bewusste Umkehrung von `displayDescription()` in
 *  `fragment-card.tsx` (RM-1, v2-10: dort der LETZTE Teil). Die Karte zeigt den
 *  Zweck, das Popup den Empfänger — zusammen zeigen beide den vollen Text, und
 *  genau das ist die Daseinsberechtigung des Popups (§11: „der einzige Ort, an
 *  dem steht, wer das Geld bekommen hat").
 *
 *  Die drei Importformate (am 05.08.2026 gegen den Bestand gemessen):
 *
 *    DKB Visa  „SP SCICON SPORTS"                1 Teil  → alles in main,
 *                                                          purpose = null
 *    DKB Giro  „Empfänger | Zweck"               2 Teile → main / purpose
 *    Cortal    „Sender | Buchungstext | Zweck"   3 Teile → main / Rest
 *
 *  Bei drei Teilen bleibt der Rest ZUSAMMEN, verbunden mit einem Mittelpunkt:
 *  §11 verlangt den Zweck „ungekürzt", es darf also nichts wegfallen. Der `|`
 *  selbst ist ein Bank-Artefakt — §11 verwirft die Rohtext-Variante
 *  ausdrücklich, weil das Trennzeichen nicht ins Bild gehört.
 *
 *  Zwei Randfälle aus dem echten Bestand:
 *  · leerer letzter Teil („… | ") → `purpose` bleibt null, die Zeile entfällt
 *  · leerer erster Teil („ | Zweck") → Rückfall auf den Rohtext als Hauptzeile,
 *    weil eine leere Hauptzeile das Popup kopflos machte */
export function splitDescription(raw: string): SplitDescription {
  const parts = raw.split("|").map((p) => p.trim());
  if (parts.length < 2) return { main: raw.trim(), purpose: null };

  const main = parts[0];
  if (main === "") return { main: raw.trim(), purpose: null };

  const rest = parts.slice(1).filter((p) => p !== "");
  return { main, purpose: rest.length > 0 ? rest.join(" · ") : null };
}

/** Verkürzt die IBAN auf `DE02 1203 ···· 7291` — Anfang und Ende, Mitte
 *  gepunktet (Entscheidung 07.08.2026, Rolle `design-direktor`).
 *
 *  Begründung: Die Frage beim Klick lautet „welches meiner Konten war das?",
 *  nicht „wie lautet die Nummer?". Anfang (Land + Bankleitzahl) und die letzten
 *  vier Stellen beantworten sie; die vollen 22 Zeichen wären der längste
 *  Eintrag eines Popups, das sonst aus ganzen Sätzen besteht.
 *
 *  Werte unter zwölf Zeichen bleiben unverändert stehen: Aus ihnen ließe sich
 *  keine sinnvolle Kurzform bilden, und ein zusammengestrichenes Fragment wäre
 *  irreführender als der Rohwert. */
export function shortenIban(raw: string): string {
  const compact = raw.replace(/\s+/g, "").toUpperCase();
  if (compact.length < 12) return raw.trim();
  return `${compact.slice(0, 4)} ${compact.slice(4, 8)} ···· ${compact.slice(-4)}`;
}
