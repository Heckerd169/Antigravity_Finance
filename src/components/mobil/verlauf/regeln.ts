/* Die Regeln des Tabs „Verlauf" auf /mobil (Handoff §6) — Skala, Farben und
 * Wortlaute, ohne Importe.
 *
 * Importfrei, damit der Wächter DIESE Datei transpiliert und ausführt, statt
 * die Regel nachzubauen (CLAUDE.md §2).
 *
 * ── Was hier NICHT passiert ────────────────────────────────────────────────
 * Es wird keine Sparrate gerechnet (§7 Regel 1). Die sechs Werte kommen aus
 * `get_sparrate_series`, Ist und Plan je Monat, und werden hier nur in Höhen,
 * Farben und Sätze übersetzt. Auch der Durchschnitt ist kein Nachrechnen einer
 * Sparrate, sondern ein Mittelwert über gelieferte Zahlen. */

export type BalkenTon = "neutral" | "teal" | "rot";

/** Die sichtbare Höhe eines Balkens in Pixeln (Handoff §6: `|v|/max · 150`,
 *  mindestens 4).
 *
 *  **Gemessen wird im Betragsraum.** Ein Monat mit −987 € ist ein großer
 *  Ausschlag, kein kleiner; seine Farbe sagt die Richtung, seine Höhe die
 *  Größe. Ohne den Betrag ständen Defizit-Monate als Stummel neben hohen
 *  Sparmonaten, und der teuerste Monat des Jahres wäre der unauffälligste.
 *
 *  Die Mindesthöhe von 4 px gilt auch für die Null: Ein Monat ohne Ausschlag
 *  bekommt einen Strich, keine Lücke — sonst sähe er aus wie ein fehlender
 *  Monat, und das ist etwas anderes (LL-20). */
export function balkenHoehe(wert: number, maxBetrag: number, feldHoehe = 150): number {
  if (!Number.isFinite(wert)) return 4;
  if (maxBetrag <= 0) return 4;
  return Math.max(4, (Math.abs(wert) / maxBetrag) * feldHoehe);
}

/** Der Bezugswert der Skala: der größte Betrag unter allen Werten UND allen
 *  Plänen der gezeigten Monate.
 *
 *  Die Pläne gehören hinein, weil die Planlinie im selben Feld liegt. Bliebe
 *  ein Plan draußen, liefe seine Linie über den Rand hinaus und wäre
 *  unsichtbar — eine Planlinie, die man nicht sieht, ist keine.
 *
 *  **Und zwar ALLE Pläne, nicht nur der des gewählten Monats.** Sonst
 *  skalierte sich das Feld bei jedem Tippen neu, und dieselbe Säule wäre je
 *  nach Auswahl verschieden hoch. Die Auswahl darf hervorheben, nicht
 *  umrechnen. */
export function skalenMaximum(
  werte: (number | null)[],
  plaene: (number | null)[],
): number {
  const betraege = [...werte, ...plaene]
    .filter((v): v is number => v !== null && Number.isFinite(v))
    .map((v) => Math.abs(v));
  return betraege.length > 0 ? Math.max(...betraege) : 0;
}

/** Die Farbe eines Balkens (Handoff §6).
 *
 *  v3 Regel 2: Rot bedeutet Abweichung — hier eine negative Sparrate, also ein
 *  Monat, in dem mehr abgeflossen als hereingekommen ist. Türkis bedeutet: auf
 *  oder über Plan. Alles dazwischen bleibt neutral, denn „etwas unter Plan" ist
 *  der Normalfall und kein Alarm. */
export function balkenTon(wert: number | null, plan: number | null): BalkenTon {
  if (wert === null) return "neutral";
  if (wert < 0) return "rot";
  if (plan !== null && wert >= plan) return "teal";
  return "neutral";
}

/** Der Held über dem Feld: der Durchschnitt der gezeigten Monate.
 *
 *  Monate ohne Wert zählen NICHT in den Nenner — „kein Wert" ist nicht „0 €"
 *  (LL-20). Gibt es gar keinen Wert, gibt es keinen Durchschnitt: `null`, nicht
 *  eine Null, die Sicherheit vortäuscht. */
export function durchschnitt(werte: (number | null)[]): number | null {
  const echte = werte.filter((v): v is number => v !== null && Number.isFinite(v));
  if (echte.length === 0) return null;
  return echte.reduce((a, b) => a + b, 0) / echte.length;
}

/** Die Unterzeile der Detailkarte (Handoff §6).
 *
 *  Drei Aussagen, und die Reihenfolge ist die Regel: Ein **Defizit** wird als
 *  Defizit benannt, auch wenn es über Plan liegt — ein Monat mit −8,84 € gegen
 *  einen Plan von −96,40 € ist besser als geplant und trotzdem ein Minus. Das
 *  zu verschweigen wäre die teuerste Höflichkeit der App.
 *
 *  `betragText` und `abstandText` kommen bereits formatiert herein; die
 *  Formatierung bleibt bei `format.ts`, damit sie nicht zweimal im Repo steht. */
export function detailUnterzeile(z: {
  ist: number | null;
  plan: number | null;
  abstandText: string;
}): { text: string; ton: BalkenTon } {
  if (z.ist === null) return { text: "keine Angabe für diesen Monat", ton: "neutral" };
  if (z.ist < 0) {
    return { text: `Defizit — ${z.abstandText} gegen Plan`, ton: "rot" };
  }
  if (z.plan === null) return { text: "kein Plan für diesen Monat", ton: "neutral" };
  if (z.ist >= z.plan) {
    return { text: `${z.abstandText} über Plan`, ton: "teal" };
  }
  return { text: `${z.abstandText} unter Plan`, ton: "neutral" };
}

/** Die Farbe des großen Werts in der Detailkarte. Sie folgt derselben Regel wie
 *  der Balken, damit Zahl und Säule nie Verschiedenes behaupten. */
export function detailTon(ist: number | null, plan: number | null): BalkenTon {
  return balkenTon(ist, plan);
}

/** Wie viele Monate der Verlauf zeigt (Handoff §6: „Sparrate, 6 Monate"). */
export const MONATE = 6;

export const KOPF_RECHTS = "Sparrate, 6 Monate";
