import type { RingSubtextColor } from "./singularity-ring.types";

/* ============================================================================
   Subzeile im Degenerations-Modus (§5 N4b) — als eigene, reine Funktion.
   Herausgelöst in v2-12 (BF-2), aus einem konkreten Anlass:

   Der Fehler saß genau hier und hat zwei Sprints überlebt, weil er im
   Bauteil eingebettet und damit nicht einzeln prüfbar war. Die
   §9-Pixel-Checks halten es seit v2-01 genauso (`welle/draw.ts`) — reine
   Logik liegt in einer eigenen Datei und wird direkt getestet, statt über
   die Oberfläche.

   Prüfung: `tests/e2e/ring-subline.spec.ts` transpiliert DIESE Datei und
   fährt alle Verzweigungen ab. Kein Nachbau der Logik im Test — ein Nachbau
   driftet und gibt falsche Sicherheit.
   ========================================================================= */

const NBSP = " ";
const MINUS = "−";

/** Ab wann gilt „genau nach Plan"? Bewusst die ANZEIGE-Schwelle und nicht
 *  `diff === 0`: `formatEur` rundet auf ganze Euro, eine Abweichung von 0,30 €
 *  stünde sonst als „+0 € über Plan" da — genau der Text, den die Entscheidung
 *  E3 (05.08.2026) abschaffen sollte. Unterhalb eines halben Euro rundet die
 *  Anzeige ohnehin auf 0; „genau nach Plan" ist dort die ehrlichere von zwei
 *  ungenauen Aussagen. */
export const ON_PLAN_EPSILON = 0.5;

export function formatEur(n: number): string {
  const sign = n >= 0 ? "+" : MINUS;
  const abs = Math.abs(n).toLocaleString("de-DE", { maximumFractionDigits: 0 });
  return `${sign}${abs}${NBSP}€`;
}

export type RingSubline = { text: string; color: RingSubtextColor };

/** §5 N4b, Fassung v2-12 (BF-2 + Entscheidung E3).
 *
 *  EINE Regel, unabhängig vom Vorzeichen des Plans:
 *    besser als geplant   → `+X € über Plan`    · teal
 *    schlechter          → `−X € unter Plan`   · rot
 *    genau auf Plan      → `genau nach Plan`   · neutral
 *
 *  Vorher verzweigte der Sonderfall am **Vorzeichen des Plans**: bei negativem
 *  Plan vorzeichensicher, bei positivem Plan aber „Plan fast 0 € — X € gespart",
 *  was ein positives Ist unterstellt. Juli 2026 (Plan 55,44 €, Ist negativ) las
 *  sich dadurch als „−1.223 € gespart". Man spart keine minus 1.223 €.
 *
 *  Die Kombination kleiner positiver Plan + negatives Ist war bis zur
 *  Juli-Kuratierung nicht erreichbar, weil Ist und Plan in jedem Monat
 *  identisch waren — deshalb hat der Fehler v2-03 (N4b) überlebt.
 *
 *  Der Zusatz „Plan fast 0 €" entfällt ersatzlos: ohnehin ungenau (55 € sind
 *  nicht fast 0), und die Euro-Aussage erklärt sich selbst. */
export function degenerateSubline(current: number, plan: number): RingSubline {
  const diff = current - plan;

  if (Math.abs(diff) < ON_PLAN_EPSILON) {
    return { text: "genau nach Plan", color: "muted" };
  }
  return diff > 0
    ? { text: `${formatEur(diff)} über Plan`, color: "teal" }
    : { text: `${formatEur(diff)} unter Plan`, color: "red" };
}
