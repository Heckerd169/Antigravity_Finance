/*
 * v2-31 (M7 / KAT-4) — die Geometrie des Verlaufs, ohne DOM und ohne React.
 *
 * Dieses Modul ist bewusst rein: Es bekommt die Reihe aus der Datenbank und
 * gibt SVG-Pfade zurück. Damit kann der Wächter (`tests/e2e/verlauf.spec.ts`)
 * die ECHTE Quelldatei transpilieren und ausführen, statt die Regeln nachzubauen
 * — ein Nachbau driftet ab und gibt falsche Sicherheit. Dieselbe Bauart wie
 * `ring-subline.ts`, `liquidity.ts` und `drivers.ts`.
 *
 * ── Die drei Regeln, die hier haften (Design-Record 31.08., §2 rev. 03.09.2026) ─
 *
 * ① Die Ist-Linie endet am laufenden Monat. In Zukunftsmonaten liefert
 *    `calculate_card_amount_for_month` den Plan zurück; sie weiterzuzeichnen
 *    hieße, die Plan-Linie ein zweites Mal zu zeichnen und das Ergebnis „Ist"
 *    zu nennen. §9 sagt dasselbe für die Welle: Teal bis einschließlich
 *    laufender Monat, Grau ab dem ersten Zukunftsmonat.
 *
 * ② Ein inaktiver Monat läuft auf 0 €, er bricht die Linie NICHT.
 *
 *    ⚠️ **Das war bis zum 03.09.2026 umgekehrt geregelt, und die Umkehr ist
 *    begründet.** Die alte Fassung berief sich auf LL-20 („ein Referenzwert
 *    ohne Daten ist keine Anzeige, nicht 0") und ließ die Linie brechen. LL-20
 *    meint aber einen **fehlenden** Wert — etwa „Budget frei" in einem Monat
 *    ohne Budget-Karten, wo 0 eine Falschaussage wäre.
 *
 *    Hier ist es keine. Der Verlauf beantwortet „was hat mich das gekostet",
 *    und für einen Monat, in dem die Karte nicht fällig war, lautet die Antwort
 *    **null Euro** — das ist wahr, nicht geschätzt. Im Karussell wird die Karte
 *    in so einem Monat gar nicht gezeigt; über 24 Monate hinweg ist ihre
 *    Abwesenheit dagegen selbst eine Aussage über Geld.
 *
 *    Der Anlass war die Anschauung: Reihen mit vielen Lücken sahen zerhackt
 *    aus, und bei einer jährlichen Karte blieben zwei einsame Punkte übrig,
 *    aus denen sich der Rhythmus nicht lesen ließ. Jetzt zeigt dieselbe Karte
 *    eine flache Nulllinie mit zwei Ausschlägen — und genau das ist sie.
 *
 *    **Die Datenbank bleibt unverändert:** Beide Serien-Funktionen liefern
 *    weiterhin `null` bei `aktiv = false`. Die Unterscheidung geht also nicht
 *    verloren, sie wird hier bewusst zu einer Null verdichtet. Wer sie später
 *    braucht (etwa für einen Tooltip „nicht fällig"), findet sie in den
 *    Rohdaten.
 *
 * ③ Eine Reihe mit einem einzigen Knoten bekommt trotzdem eine sichtbare Marke.
 *    Ein SVG-Pfad aus einem einzelnen Punkt malt nichts. Das tritt nur noch am
 *    Rand auf — etwa wenn „heute" der erste Monat der Reihe ist.
 */

/** Ein Monat der Reihe, wie ihn `get_card_amount_series` /
 *  `get_category_amount_series` liefern. `ist`/`plan` sind `null`, wenn die
 *  Karte bzw. der Ordner im Monat nicht existiert — siehe Regel ② oben. */
export type VerlaufPunkt = {
  monthIndex: number;
  month: string;
  aktiv: boolean;
  ist: number | null;
  plan: number | null;
};

export type VerlaufMasse = {
  width: number;
  height: number;
  padLeft: number;
  padRight: number;
  padTop: number;
  padBottom: number;
};

/** Maße der Zeichenfläche im 680-px-Overlay (§9-Popup: 680 − 26 − 26 = 628). */
export const VERLAUF_MASSE: VerlaufMasse = {
  width: 628,
  height: 200,
  padLeft: 52,
  padRight: 12,
  padTop: 16,
  padBottom: 26,
};

export const MONATE_GESAMT = 24;

export type VerlaufGeometrie = {
  /** Obergrenze der Y-Achse in Euro (immer positiv). */
  top: number;
  /** SVG-Pfad der Ist-Linie, `""` wenn nichts zu zeichnen ist. */
  istPfad: string;
  /** SVG-Pfad der Plan-Linie. */
  planPfad: string;
  /** Nur belegt, wenn die Linie aus einem einzigen Knoten besteht (Regel ③). */
  istPunkte: { x: number; y: number }[];
  planPunkte: { x: number; y: number }[];
  /** Waagerechte Rasterlinien — eine je Achsen-Schritt. */
  rasterY: number[];
  /** Beschriftete Y-Marken: Betrag und Position. */
  yMarken: { wert: number; y: number }[];
  /** Beschriftete X-Marken: Label und Position. */
  xMarken: { label: string; x: number }[];
  /** X-Position der Jahresgrenze (zwischen Index 11 und 12). */
  jahrGrenzeX: number;
  /** X-Position der `heute`-Marke, `null` wenn sie außerhalb der Reihe liegt. */
  heuteX: number | null;
};

/** `01/25` — das vom Nutzer gewählte Format (Design-Record §6). */
export function monatsLabel(monthIndex: number, jahr: number): string {
  const jahrDesPunkts = monthIndex < 12 ? jahr - 1 : jahr;
  const monat = (monthIndex % 12) + 1;
  return `${String(monat).padStart(2, "0")}/${String(jahrDesPunkts % 100).padStart(2, "0")}`;
}

/**
 * Der Index des laufenden Monats innerhalb der 24er-Reihe.
 *
 * Die Reihe deckt `jahr - 1` und `jahr` ab. Liegt „heute" davor, ist die ganze
 * Reihe Zukunft (`-1`); liegt es dahinter, ist sie ganz Vergangenheit (`23`).
 *
 * ⚠️ Die Grenze hängt am KALENDER, nicht am angezeigten Monat — §9 sagt das
 * ausdrücklich für die Welle: „Die Grenze liegt fix am Kalender-‚jetzt' und ist
 * unabhängig vom Header-aktiven Monat." Wer hier den angezeigten Monat einsetzt,
 * lässt die teale Linie beim Blättern wandern, ohne dass sich Daten ändern.
 */
export function heuteIndex(jahr: number, heute: Date): number {
  const abstandJahre = heute.getUTCFullYear() - (jahr - 1);
  const idx = abstandJahre * 12 + heute.getUTCMonth();
  if (idx < 0) return -1;
  if (idx > MONATE_GESAMT - 1) return MONATE_GESAMT - 1;
  return idx;
}

/**
 * Runde Schrittweiten für die Y-Achse. Bewusst ohne 25 und 250 — eine Achse
 * mit 0/25/50/75 liest sich unruhiger als eine mit 0/20/40/60, und der Gewinn
 * an Genauigkeit ist keiner.
 */
const SCHRITTE = [
  1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000,
];

/** Höchstens so viele Abschnitte zwischen 0 und der Obergrenze. */
const MAX_ABSCHNITTE = 6;

/**
 * Wählt Schrittweite und Obergrenze der Y-Achse.
 *
 * ⚠️ **Die Achse trägt Rasterlinien in RUNDEN Schritten, nicht nur 0 und das
 * Maximum** — seit dem 03.09.2026, und der Anlass ist gemessen. Der Ordner
 * `Versicherungen` liegt in **18 von 24 Monaten zwischen 223 und 262 €**, hat
 * aber im Dezember 2026 eine Jahresprämie von **597,36 €**. Die Achse muss
 * dorthin reichen — sonst wäre die Anzeige schlicht falsch —, und damit lag das
 * dichte Band bei 38 % der Höhe, ohne dass sich sein Wert ablesen ließ.
 *
 * **Die Obergrenze war nicht das Problem** (600 statt 597,36 sind 0,4 % Luft).
 * Das Problem war, dass zwischen 0 und 600 nichts stand. Jetzt sind es
 * 0/100/…/600 mit Beschriftung an jeder Linie, und die Frage „liegt die Linie
 * bei 230?" beantwortet sich durch Hinsehen.
 *
 * Der Schritt wächst mit der Größenordnung: Netflix bekommt 5er-Schritte,
 * Wohnen 500er. Höchstens sechs Abschnitte, damit die Fläche nicht zum Raster
 * wird — „Ruhe vor Betonung".
 *
 * **Der kleinste Schritt ist 1 €, nicht 0,50 €** — die Beschriftung rundet auf
 * ganze Euro (`formatEuroRounded`, wie im Ring), und ein halber Schritt ergäbe
 * bei einer Karte über 1,00 € zwei Marken mit demselben Text. Karten mit einem
 * Plan von 1,00 € gibt es im Bestand (Platzhalter-Pläne aus dem Import).
 */
function achse(werte: number[]): { top: number; schritt: number } {
  const max = Math.max(0, ...werte.map((v) => Math.abs(v)));
  if (max === 0) return { top: SCHRITTE[0], schritt: SCHRITTE[0] };

  for (const schritt of SCHRITTE) {
    if (max / schritt <= MAX_ABSCHNITTE) {
      return { top: Math.ceil(max / schritt) * schritt, schritt };
    }
  }
  // Jenseits der Tabelle: gröbster Schritt, Obergrenze aufgerundet.
  const schritt = SCHRITTE[SCHRITTE.length - 1];
  return { top: Math.ceil(max / schritt) * schritt, schritt };
}

/**
 * Baut aus einer Reihe den Pfad. Die Reihe ist **durchgehend** — inaktive
 * Monate stehen bereits auf 0 (Regel ②), es gibt also keine Lücken mehr.
 *
 * `bis` begrenzt die Reihe nach rechts: für die Ist-Linie der laufende Monat
 * (Regel ①), für die Plan-Linie das Ende der Reihe.
 *
 * `punkte` trägt den Randfall aus Regel ③ — ein Pfad aus einem einzigen Knoten
 * malt nichts, deshalb bekommt er eine Marke.
 */
function pfadUndPunkte(
  werte: number[],
  x: (i: number) => number,
  y: (v: number) => number,
  bis: number,
): { pfad: string; punkte: { x: number; y: number }[] } {
  let pfad = "";
  const knoten: { x: number; y: number }[] = [];

  for (let i = 0; i <= bis && i < werte.length; i++) {
    const px = x(i);
    const py = y(werte[i]);
    pfad += `${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`;
    knoten.push({ x: px, y: py });
  }

  return { pfad, punkte: knoten.length === 1 ? knoten : [] };
}

/**
 * Die vollständige Geometrie einer Verlaufs-Reihe.
 *
 * `jahr` ist das RECHTE Jahr (die Reihe zeigt `jahr - 1` und `jahr`).
 * `heute` wird übergeben statt intern gelesen, damit der Wächter sie festnageln
 * kann — eine Funktion, die `new Date()` selbst aufruft, ist nicht prüfbar.
 */
export function baueGeometrie(
  punkte: VerlaufPunkt[],
  jahr: number,
  heute: Date,
  masse: VerlaufMasse = VERLAUF_MASSE,
): VerlaufGeometrie {
  const { width, height, padLeft, padRight, padTop, padBottom } = masse;
  const flaecheB = width - padLeft - padRight;
  const flaecheH = height - padTop - padBottom;

  // Über den Index adressiert, nicht über die Array-Position: Fehlt ein Index,
  // bleibt der Monat leer, statt einen fremden Wert zu erben. Dasselbe Muster
  // wie im Welle-Loader (v2-24).
  const nachIndex = new Map(punkte.map((p) => [p.monthIndex, p]));
  const istWerte: number[] = [];
  const planWerte: number[] = [];
  for (let i = 0; i < MONATE_GESAMT; i++) {
    const p = nachIndex.get(i);
    // Inaktiver Monat → 0 €, keine Lücke (Regel ②). Ein fehlender Index wird
    // genauso behandelt: adressiert wird über den Index, nicht über die
    // Array-Position, damit ein Loch keinen fremden Wert erbt.
    istWerte.push(p?.aktiv ? (p.ist ?? 0) : 0);
    planWerte.push(p?.aktiv ? (p.plan ?? 0) : 0);
  }

  // Beträge als HÖHE: Ein Ausgaben-Ordner wird nicht unter die Nulllinie
  // gezeichnet und nicht rot eingefärbt — Rot ist in dieser App
  // „offen / Defizit" (§3), nicht „Ausgabe". Das Vorzeichen trägt die
  // Unterzeile des Overlays (Design-Record §8).
  const { top, schritt } = achse([...istWerte, ...planWerte]);

  const x = (i: number): number => padLeft + (i / (MONATE_GESAMT - 1)) * flaecheB;
  const y = (v: number): number => padTop + flaecheH - (Math.abs(v) / top) * flaecheH;

  const istBis = heuteIndex(jahr, heute);
  const ist = istBis < 0 ? { pfad: "", punkte: [] } : pfadUndPunkte(istWerte, x, y, istBis);
  const plan = pfadUndPunkte(planWerte, x, y, MONATE_GESAMT - 1);

  // Eine Marke je Schritt, jede beschriftet. Vorher waren es drei Rasterlinien
  // und zwei Beschriftungen — zu wenig, um einen Wert in der Mitte abzulesen.
  const marken: number[] = [];
  for (let v = 0; v <= top + 1e-9; v += schritt) marken.push(+v.toFixed(6));

  // Jeder dritte Monat beschriftet — acht Marken mit je rund 50 px Luft.
  // 24 Marken passten rechnerisch (23,5 px je Marke bei ~20 px Labelbreite),
  // waren am Entwurf aber zu dicht (Design-Record §6).
  const xMarken: { label: string; x: number }[] = [];
  for (let i = 0; i < MONATE_GESAMT; i += 3) {
    xMarken.push({ label: monatsLabel(i, jahr), x: x(i) });
  }

  return {
    top,
    istPfad: ist.pfad,
    planPfad: plan.pfad,
    istPunkte: ist.punkte,
    planPunkte: plan.punkte,
    rasterY: marken.map(y),
    yMarken: marken.map((wert) => ({ wert, y: y(wert) })),
    xMarken,
    jahrGrenzeX: (x(11) + x(12)) / 2,
    heuteX: istBis >= 0 && istBis <= MONATE_GESAMT - 1 ? x(istBis) : null,
  };
}

/** Jahressummen für die Fußzeile. Zukunftsmonate zählen NICHT mit — die
 *  Ist-Linie endet dort, und eine Summe, die weiterläuft, widerspräche ihr. */
export function jahresSummen(
  punkte: VerlaufPunkt[],
  jahr: number,
  heute: Date,
): { vorjahr: number; jahr: number } {
  const bis = heuteIndex(jahr, heute);
  let vorjahrSumme = 0;
  let jahrSumme = 0;
  for (const p of punkte) {
    if (!p.aktiv || p.ist == null) continue;
    if (p.monthIndex > bis) continue;
    if (p.monthIndex < 12) vorjahrSumme += p.ist;
    else jahrSumme += p.ist;
  }
  return { vorjahr: vorjahrSumme, jahr: jahrSumme };
}
