/*
 * v2-31 (M7 / KAT-4) — die Geometrie des Verlaufs, ohne DOM und ohne React.
 *
 * Dieses Modul ist bewusst rein: Es bekommt die Reihe aus der Datenbank und
 * gibt SVG-Pfade zurück. Damit kann der Wächter (`tests/e2e/verlauf.spec.ts`)
 * die ECHTE Quelldatei transpilieren und ausführen, statt die Regeln nachzubauen
 * — ein Nachbau driftet ab und gibt falsche Sicherheit. Dieselbe Bauart wie
 * `ring-subline.ts`, `liquidity.ts` und `drivers.ts`.
 *
 * ── Die drei Regeln, die hier haften (Design-Record 31.08.2026) ─────────────
 *
 * ① Die Ist-Linie endet am laufenden Monat. In Zukunftsmonaten liefert
 *    `calculate_card_amount_for_month` den Plan zurück; sie weiterzuzeichnen
 *    hieße, die Plan-Linie ein zweites Mal zu zeichnen und das Ergebnis „Ist"
 *    zu nennen. §9 sagt dasselbe für die Welle: Teal bis einschließlich
 *    laufender Monat, Grau ab dem ersten Zukunftsmonat.
 *
 * ② Ein inaktiver Monat bricht die Linie, er fällt nicht auf null. Die
 *    Datenbank liefert dafür `null` statt 0 — „nicht fällig" und „null Euro
 *    ausgegeben" sind verschiedene Aussagen (§7 Regel 17 / LL-20). Hier wird
 *    daraus eine Lücke im Pfad.
 *
 * ③ Ein Wert ohne aktive Nachbarn wird als Punkt gezeichnet. Ohne das ist eine
 *    jährliche Karte unsichtbar: `ADAC Mitgliedschaft` ist in 2 von 24 Monaten
 *    aktiv, und zwei isolierte Pfad-Knoten ohne Verbindung malen nichts.
 *    Eine Linie ZWISCHEN ihnen wäre die falsche Alternative — sie behauptete
 *    eine Entwicklung, die es nicht gibt.
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
  /** Isolierte Ist-Werte, die sonst unsichtbar wären. */
  istPunkte: { x: number; y: number }[];
  planPunkte: { x: number; y: number }[];
  /** Waagerechte Rasterlinien (0, Hälfte, Maximum). */
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

/** Rundet die Y-Obergrenze auf einen halben Zehnerschritt auf. */
function obergrenze(werte: number[]): number {
  const max = Math.max(0, ...werte.map((v) => Math.abs(v)));
  if (max === 0) return 1;
  const schritt = Math.pow(10, Math.floor(Math.log10(max)));
  return Math.ceil(max / (schritt / 2)) * (schritt / 2) || 1;
}

/**
 * Baut aus einer Reihe die Pfade. `null` bricht den Pfad (Regel ②); ein Wert
 * ohne aktive Nachbarn wandert in `punkte` (Regel ③).
 *
 * `bis` begrenzt die Reihe nach rechts — für die Ist-Linie der laufende Monat
 * (Regel ①), für die Plan-Linie das Ende der Reihe.
 */
function pfadUndPunkte(
  werte: (number | null)[],
  x: (i: number) => number,
  y: (v: number) => number,
  bis: number,
): { pfad: string; punkte: { x: number; y: number }[] } {
  let pfad = "";
  let offen = false;
  const punkte: { x: number; y: number }[] = [];

  for (let i = 0; i <= bis && i < werte.length; i++) {
    const v = werte[i];
    if (v == null) {
      offen = false;
      continue;
    }
    const px = x(i);
    const py = y(v);
    pfad += `${offen ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`;

    const vorher = i === 0 ? null : werte[i - 1];
    const nachher = i === bis ? null : werte[i + 1];
    if (vorher == null && nachher == null) punkte.push({ x: px, y: py });

    offen = true;
  }

  return { pfad, punkte };
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
  const istWerte: (number | null)[] = [];
  const planWerte: (number | null)[] = [];
  for (let i = 0; i < MONATE_GESAMT; i++) {
    const p = nachIndex.get(i);
    istWerte.push(p?.aktiv ? p.ist : null);
    planWerte.push(p?.aktiv ? p.plan : null);
  }

  // Beträge als HÖHE: Ein Ausgaben-Ordner wird nicht unter die Nulllinie
  // gezeichnet und nicht rot eingefärbt — Rot ist in dieser App
  // „offen / Defizit" (§3), nicht „Ausgabe". Das Vorzeichen trägt die
  // Unterzeile des Overlays (Design-Record §8).
  const alle = [...istWerte, ...planWerte].filter((v): v is number => v != null);
  const top = obergrenze(alle);

  const x = (i: number): number => padLeft + (i / (MONATE_GESAMT - 1)) * flaecheB;
  const y = (v: number): number => padTop + flaecheH - (Math.abs(v) / top) * flaecheH;

  const istBis = heuteIndex(jahr, heute);
  const ist = istBis < 0 ? { pfad: "", punkte: [] } : pfadUndPunkte(istWerte, x, y, istBis);
  const plan = pfadUndPunkte(planWerte, x, y, MONATE_GESAMT - 1);

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
    rasterY: [0, top / 2, top].map(y),
    yMarken: [
      { wert: 0, y: y(0) },
      { wert: top, y: y(top) },
    ],
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
