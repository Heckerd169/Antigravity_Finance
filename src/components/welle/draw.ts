/*
 * Canvas-Zeichenlogik der Jahres-Welle (Design-Doku §9) — Port aus
 * public/prototypes/welle_v1.html (Port-Vorlage, Briefing v2-02).
 * Pure Funktionen ohne React-/DOM-State; der Aufrufer besitzt Canvas + Kontext.
 *
 * Farb-Triplets spiegeln tokens.css (--color-teal #3ECFAF, --color-red #FF453A);
 * Canvas-Fill/Stroke kann keine CSS-Custom-Properties lesen — etabliertes
 * Pattern seit Sprint 10 (Treppe).
 */

export type WavePoint = { x: number; y: number; val: number };

export const MONTHS_SHORT = [
  "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
  "Jul", "Aug", "Sep", "Okt", "Nov", "Dez",
] as const;

export const MONTHS_FULL = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
] as const;

// Plot-Padding (1:1 Prototyp) — auch für Führungslinie/Tooltip-Grenzen (P2).
export const WAVE_PAD_L = 18;
export const WAVE_PAD_R = 18;
export const WAVE_PAD_T = 30;
export const WAVE_PAD_B = 34;

const TEAL = "62,207,175"; // --color-teal
const RED = "255,69,58"; // --color-red (negativer Monat, §9 M10)
const GRAY = "255,255,255"; // Forecast-Grau (Ghost-Analogie, §9)

const GOLD = "255,200,60"; // --color-gold-Basis (Vorjahr, B6)

export const tealS = (a: number): string => `rgba(${TEAL},${a})`;
export const redS = (a: number): string => `rgba(${RED},${a})`;
export const graS = (a: number): string => `rgba(${GRAY},${a})`;
export const goldS = (a: number): string => `rgba(${GOLD},${a})`;

const NBSP = " ";
const MINUS = "−";

/** Vorzeichen-explizites EUR-Format ohne Dezimalen (analog Ring/Port-Vorlage).
 *  Lebt in draw.ts, weil auch Canvas-Text (B6-Gutter-Betrag) es braucht. */
export function fmtSignedEuro(v: number): string {
  const sign = v >= 0 ? "+" : MINUS;
  return `${sign}${Math.abs(Math.round(v)).toLocaleString("de-DE")}${NBSP}€`;
}

export type WaveParams = {
  /** CSS-Pixel-Breite/-Höhe des Felds (DPR-Transform macht der Aufrufer). */
  width: number;
  height: number;
  /** 12 monatliche Ist-Sparraten in EUR (null bereits zu 0 aufgelöst). */
  values: number[];
  /** D1: letzter realisierter Monat (-1 = keiner, 11 = alle) → Teal/Grau-Grenze. */
  realizedIndex: number;
  /** Header-aktiver Monat 0..11 → genau EIN Kreis (§9). */
  activeIndex: number;
  /** Token --wave-opacity (0.80). */
  opacity: number;
};

/** Catmull-Rom-artige Bezier-Segmente durch alle Punkte (Prototyp `smoothInto`). */
function smoothSegments(ctx: CanvasRenderingContext2D, pts: WavePoint[]): void {
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? pts[i + 1];
    ctx.bezierCurveTo(
      p1.x + (p2.x - p0.x) / 6,
      p1.y + (p2.y - p0.y) / 6,
      p2.x - (p3.x - p1.x) / 6,
      p2.y - (p3.y - p1.y) / 6,
      p2.x,
      p2.y,
    );
  }
}

/** Kurvenpfad inkl. moveTo auf den ersten Punkt (Prototyp `smooth`). */
function smoothPath(ctx: CanvasRenderingContext2D, pts: WavePoint[]): void {
  ctx.moveTo(pts[0].x, pts[0].y);
  smoothSegments(ctx, pts);
}

/**
 * Horizontaler Regime-Gradient Teal→Grau (§9 D1). Die Grenze liegt zwischen
 * realizedIndex und realizedIndex+1 — fix, unabhängig vom aktiven Monat.
 */
function regimeGradient(
  ctx: CanvasRenderingContext2D,
  x0: number,
  x1: number,
  alpha: number,
  realizedIndex: number,
): CanvasGradient {
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  if (realizedIndex >= 11) {
    g.addColorStop(0, tealS(alpha));
    g.addColorStop(1, tealS(alpha));
  } else if (realizedIndex < 0) {
    g.addColorStop(0, graS(alpha));
    g.addColorStop(1, graS(alpha));
  } else {
    const tEnd = realizedIndex / 11;
    const gStart = Math.min(1, (realizedIndex + 1) / 11);
    g.addColorStop(0, tealS(alpha));
    g.addColorStop(tEnd, tealS(alpha));
    g.addColorStop(gStart, graS(alpha));
    g.addColorStop(1, graS(alpha));
  }
  return g;
}

/**
 * Zeichnet die 12-Monats-EUR-Welle und liefert die Monats-Punktkoordinaten
 * (CSS-Pixel) zurück — Grundlage für Scrub/Führungslinie/Tooltip (P2).
 */
export function drawWave(
  ctx: CanvasRenderingContext2D,
  params: WaveParams,
): WavePoint[] {
  const { width: w, height: h, values, realizedIndex, activeIndex, opacity } = params;
  ctx.clearRect(0, 0, w, h);

  const cW = w - WAVE_PAD_L - WAVE_PAD_R;
  const cH = h - WAVE_PAD_T - WAVE_PAD_B;
  const all = [...values, 0];
  const mn = Math.min(...all);
  const mx = Math.max(...all);
  const rng = mx - mn || 1;
  const stepX = cW / 11;
  const xOf = (i: number): number => WAVE_PAD_L + i * stepX;
  const yOf = (v: number): number => WAVE_PAD_T + cH - ((v - mn) / rng) * cH;
  const y0 = yOf(0);

  const pts: WavePoint[] = values.map((val, i) => ({ x: xOf(i), y: yOf(val), val }));

  // Nulllinie
  ctx.beginPath();
  ctx.moveTo(WAVE_PAD_L, y0);
  ctx.lineTo(WAVE_PAD_L + cW, y0);
  ctx.strokeStyle = graS(0.07);
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Fläche — Teal (realisiert) → Grau (Forecast); Alphas skalieren mit --wave-opacity.
  const fillAlpha = opacity * 0.3;
  const strokeAlpha = opacity * 0.92;
  const areaPath = (): void => {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, y0);
    ctx.lineTo(pts[0].x, pts[0].y);
    smoothSegments(ctx, pts);
    ctx.lineTo(pts[11].x, y0);
    ctx.closePath();
  };
  areaPath();
  ctx.fillStyle = regimeGradient(ctx, xOf(0), xOf(11), fillAlpha, realizedIndex);
  ctx.fill();

  // Negativer Bereich → Ausgaben-Rot #FF453A (§9 M10: Fläche + Linie unter Null)
  if (mn < 0) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(WAVE_PAD_L, y0, cW, WAVE_PAD_T + cH - y0);
    ctx.clip();
    areaPath();
    ctx.fillStyle = redS(opacity * 0.4);
    ctx.fill();
    ctx.restore();
  }

  // Linie — Regime-Farbe; negativer Abschnitt rot überzeichnet
  ctx.beginPath();
  smoothPath(ctx, pts);
  ctx.strokeStyle = regimeGradient(ctx, xOf(0), xOf(11), strokeAlpha, realizedIndex);
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.stroke();
  if (mn < 0) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(WAVE_PAD_L, y0, cW, WAVE_PAD_T + cH - y0);
    ctx.clip();
    ctx.beginPath();
    smoothPath(ctx, pts);
    ctx.strokeStyle = redS(strokeAlpha);
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.restore();
  }

  // Aktiver-Monat-Marker — genau EIN Kreis (§9, kein Hover-Punkt, kein Ereignis-Kreis)
  const ap = pts[activeIndex];
  if (ap) {
    ctx.beginPath();
    ctx.arc(ap.x, ap.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = graS(0.9);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ap.x, ap.y, 9, 0, Math.PI * 2);
    ctx.strokeStyle = graS(0.25);
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Monats-Labels
  for (let i = 0; i < 12; i++) {
    ctx.font = "500 8px system-ui";
    ctx.fillStyle = i === activeIndex ? graS(0.5) : graS(0.18);
    ctx.textAlign = "center";
    ctx.fillText(MONTHS_SHORT[i], xOf(i), h - 6);
  }

  return pts;
}

/* ── Popup: kumulierte Treppe (§9, Port aus welle_v1.html drawPop) ────────── */

export type PopupStairParams = {
  /** CSS-Pixel-Maße der Plotfläche (DPR-Transform macht der Aufrufer). */
  width: number;
  height: number;
  /** Kumulierte IST-Werte Jan→Dez (Teal-Treppe). */
  istCum: number[];
  /** Kumulierte Plan-Werte Jan→Dez (Grau-Treppe). */
  planCum: number[];
  /** B6: kumulierter Vorjahres-Jahresendwert; null → Linie entfällt komplett. */
  prevYearEnd: number | null;
  /** Ausgewählter Monat (Top-3-Treiber) oder -1. */
  selectedIndex: number;
};

// Rechter Gutter (58px) reserviert den Platz für den B6-Betrag AUSSERHALB der
// Plotfläche (§9: „Betrag steht im rechten Gutter").
const POP_PAD_L = 8;
const POP_PAD_R = 58;
const POP_PAD_T = 14;
const POP_PAD_B = 22;

/**
 * Zeichnet die kumulierte IST/Plan-Treppe des Popups und liefert die
 * IST-Punktkoordinaten (CSS-Pixel) für den Monatsklick zurück.
 */
export function drawPopupStair(
  ctx: CanvasRenderingContext2D,
  params: PopupStairParams,
): WavePoint[] {
  const { width: w, height: h, istCum, planCum, prevYearEnd, selectedIndex } = params;
  ctx.clearRect(0, 0, w, h);

  const cW = w - POP_PAD_L - POP_PAD_R;
  const cH = h - POP_PAD_T - POP_PAD_B;
  const stepX = cW / 11;
  const all = [...istCum, ...planCum, 0];
  if (prevYearEnd !== null) all.push(prevYearEnd);
  const mn = Math.min(...all);
  const mx = Math.max(...all);
  const rng = mx - mn || 1;
  const xOf = (i: number): number => POP_PAD_L + i * stepX;
  const yOf = (v: number): number => POP_PAD_T + cH - ((v - mn) / rng) * cH;

  const pts: WavePoint[] = istCum.map((val, i) => ({ x: xOf(i), y: yOf(val), val }));

  // Nulllinie
  ctx.beginPath();
  ctx.moveTo(POP_PAD_L, yOf(0));
  ctx.lineTo(POP_PAD_L + cW, yOf(0));
  ctx.strokeStyle = graS(0.07);
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Stufen-Treppe: Wert wird bis zum Folgemonat gehalten, dann vertikaler Sprung.
  const stairFillPath = (cum: number[]): void => {
    ctx.beginPath();
    ctx.moveTo(xOf(0), yOf(0));
    ctx.lineTo(xOf(0), yOf(cum[0]));
    for (let i = 1; i < 12; i++) {
      ctx.lineTo(xOf(i), yOf(cum[i - 1]));
      ctx.lineTo(xOf(i), yOf(cum[i]));
    }
    ctx.lineTo(xOf(11), yOf(0));
    ctx.closePath();
  };
  const stairLinePath = (cum: number[]): void => {
    ctx.beginPath();
    ctx.moveTo(xOf(0), yOf(cum[0]));
    for (let i = 1; i < 12; i++) {
      ctx.lineTo(xOf(i), yOf(cum[i - 1]));
      ctx.lineTo(xOf(i), yOf(cum[i]));
    }
  };
  const stair = (cum: number[], fillTop: string, fillBottom: string, stroke: string): void => {
    stairFillPath(cum);
    const g = ctx.createLinearGradient(0, POP_PAD_T, 0, POP_PAD_T + cH);
    g.addColorStop(0, fillTop);
    g.addColorStop(1, fillBottom);
    ctx.fillStyle = g;
    ctx.fill();
    stairLinePath(cum);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  // Plan (grau, kumuliert) hinter IST (teal, kumuliert)
  stair(planCum, graS(0.09), graS(0.01), graS(0.45));
  stair(istCum, tealS(0.28), tealS(0.02), tealS(0.85));

  // B3 (§9 v3.1.2): Abschnitte der IST-Kurve unter der Null-Linie werden
  // Ausgaben-Rot (Fläche + Linie) — abschnittsweise via Clip unterhalb y0,
  // gleiche Behandlung wie der negative Monat auf der Welle (M10). Steigt
  // die Kurve wieder über Null, bleibt sie dort teal. Die Vorjahres-
  // Goldlinie (unten) bleibt unberührt: Gold = Referenz, Rot = Ist-Zustand.
  if (Math.min(...istCum) < 0) {
    const y0 = yOf(0);
    ctx.save();
    ctx.beginPath();
    ctx.rect(POP_PAD_L, y0, cW, POP_PAD_T + cH - y0);
    ctx.clip();
    stairFillPath(istCum);
    ctx.fillStyle = redS(0.26);
    ctx.fill();
    stairLinePath(istCum);
    ctx.strokeStyle = redS(0.85);
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.restore();
  }

  // B6: Vorjahres-Linie gold-gestrichelt [5,4]; Betrag rechts NEBEN der Linie im
  // Gutter, außerhalb der Plotfläche. Datenloses Vorjahr → entfällt komplett.
  if (prevYearEnd !== null) {
    const yp = yOf(prevYearEnd);
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(POP_PAD_L, yp);
    ctx.lineTo(POP_PAD_L + cW, yp);
    ctx.strokeStyle = goldS(0.55);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
    const ly = Math.max(POP_PAD_T + 6, Math.min(POP_PAD_T + cH - 6, yp));
    ctx.font = "600 9px system-ui";
    ctx.fillStyle = goldS(0.85);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(fmtSignedEuro(prevYearEnd), POP_PAD_L + cW + 8, ly);
    ctx.textBaseline = "alphabetic";
  }

  // IST-Punkte + Monats-Labels; ausgewählter Monat hervorgehoben.
  // B3: Punkte folgen dem Abschnitt, in dem sie liegen (< 0 → rot, sonst teal).
  for (let i = 0; i < 12; i++) {
    const sel = i === selectedIndex;
    const dotColor = istCum[i] < 0 ? redS : tealS;
    ctx.beginPath();
    ctx.arc(xOf(i), yOf(istCum[i]), sel ? 5 : 2.4, 0, Math.PI * 2);
    ctx.fillStyle = dotColor(sel ? 1 : 0.7);
    ctx.fill();
    ctx.font = "500 8px system-ui";
    ctx.fillStyle = graS(0.18);
    ctx.textAlign = "center";
    ctx.fillText(MONTHS_SHORT[i], xOf(i), h - 5);
  }

  return pts;
}
