import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// Deterministische Canvas-Pixel-Checks der §9-Farbregeln gegen das ECHTE
// draw.ts — synthetische Fixtures, kein Auth, keine Live-Daten (die Nulllinie
// wandert mit echten Monatswerten; nur feste Eingaben geben exakte Geometrie).
// Anlass: Welle-Rot-Lücke vom 23.07.2026 — der Bezier-Overshoot am
// Minimums-Monat entkam dem Rot-Clip an der Plot-Unterkante. Fixture 1 ist
// exakt diese Konstellation und hält die Regression dauerhaft fest.

const DRAW_TS = path.join(
  __dirname, "..", "..", "src", "components", "welle", "draw.ts",
);
const drawJs = ts.transpileModule(fs.readFileSync(DRAW_TS, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2019,
  },
}).outputText;

/** Screenshot-Zustand 23.07.2026: Mai als einziger Negativ-Monat (= Skalen-
 *  Minimum, liegt exakt auf der Plot-Unterkante) zwischen hohen Nachbarn. */
const WAVE_REGRESSION = [
  4165.11, 4165.11, 4165.11, 4165.11, -130.98,
  1886.97, 1886.97, 1886.97, 1886.97, 1886.97, 1886.97, 1886.97,
];

const WAVE_ALL_POSITIVE = [
  1800, 2100, 1950, 2400, 60, 1886.97, 2000, 1700, 2200, 1900, 2300, 2050,
];

/** Kumulierte IST-Kurve mit Unter-Null-Abschnitt (Jan–Apr) und Aufstieg. */
const STAIR_IST_CUM = [
  -500, -800, -600, -200, 300, 700, 1100, 1500, 1900, 2300, 2700, 3100,
];
const STAIR_PLAN_CUM = [
  200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400,
];

type ProbeArgs = {
  code: string;
  mode: "wave" | "stair";
  values: number[];
  planCum?: number[];
};

type ProbeResult = {
  y0: number;
  /** Strich-Unterkanten-Farbe pro Spalte unterhalb der Nulllinie (nur wave). */
  tealColumnsBelowZero: number;
  redColumnsBelowZero: number;
  /** Grobraster über die volle Fläche (beide Modi). */
  redPixelsTotal: number;
  tealPixelsBelowZero: number;
  redPixelsBelowZero: number;
};

/** Rendert draw.ts in einer leeren Seite und vermisst die Pixel per Raster-
 *  bzw. Spalten-Sonde (Klassifikation über die Token-Farben Teal/Rot). */
async function probe(
  page: import("@playwright/test").Page,
  args: ProbeArgs,
): Promise<ProbeResult> {
  await page.setContent("<body></body>");
  return page.evaluate((a: ProbeArgs) => {
    const exports: Record<string, unknown> = {};
    // eslint-disable-next-line no-eval
    eval(a.code);
    const ex = exports as {
      drawWave: (ctx: CanvasRenderingContext2D, p: unknown) => unknown;
      drawPopupStair: (ctx: CanvasRenderingContext2D, p: unknown) => unknown;
      WAVE_PAD_L: number; WAVE_PAD_R: number; WAVE_PAD_T: number; WAVE_PAD_B: number;
      POP_PAD_L: number; POP_PAD_R: number; POP_PAD_T: number; POP_PAD_B: number;
    };

    const W = 1200;
    const H = 360;
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    document.body.appendChild(cv);
    const ctx = cv.getContext("2d");
    if (!ctx) throw new Error("kein 2d-Kontext");

    let padL: number, padR: number, padT: number, padB: number;
    let scaleValues: number[];
    if (a.mode === "wave") {
      ex.drawWave(ctx, {
        width: W, height: H, values: a.values,
        realizedIndex: 6, activeIndex: 6, opacity: 0.8,
      });
      padL = ex.WAVE_PAD_L; padR = ex.WAVE_PAD_R;
      padT = ex.WAVE_PAD_T; padB = ex.WAVE_PAD_B;
      scaleValues = [...a.values, 0];
    } else {
      ex.drawPopupStair(ctx, {
        width: W, height: H, istCum: a.values,
        planCum: a.planCum ?? [], prevYearEnd: null, selectedIndex: -1,
      });
      padL = ex.POP_PAD_L; padR = ex.POP_PAD_R;
      padT = ex.POP_PAD_T; padB = ex.POP_PAD_B;
      scaleValues = [...a.values, ...(a.planCum ?? []), 0];
    }

    // Geometrie exakt wie draw.ts nachrechnen → Nulllinie y0.
    const cW = W - padL - padR;
    const cH = H - padT - padB;
    const mn = Math.min(...scaleValues);
    const mx = Math.max(...scaleValues);
    const rng = mx - mn || 1;
    const y0 = padT + cH - ((0 - mn) / rng) * cH;

    const img = ctx.getImageData(0, 0, W, H);
    const classify = (x: number, y: number): "ROT" | "TEAL" | null => {
      const idx = (Math.round(y) * W + Math.round(x)) * 4;
      const r = img.data[idx];
      const g = img.data[idx + 1];
      const aCh = img.data[idx + 3];
      if (aCh < 60) return null;
      if (r > 150 && g < 130) return "ROT";
      if (g > 120 && r < 130) return "TEAL";
      return null;
    };

    // Spalten-Sonde (wave): Strich-Unterkante = erster Treffer von unten.
    let tealColumnsBelowZero = 0;
    let redColumnsBelowZero = 0;
    if (a.mode === "wave") {
      for (let x = padL; x <= padL + cW; x += 2) {
        for (let y = H - 1; y > y0 + 1.5; y -= 1) {
          const c = classify(x, y);
          if (c === "ROT") { redColumnsBelowZero += 1; break; }
          if (c === "TEAL") { tealColumnsBelowZero += 1; break; }
        }
      }
    }

    // Grobraster: Rot gesamt + Teal/Rot unterhalb der Nulllinie.
    let redPixelsTotal = 0;
    let tealPixelsBelowZero = 0;
    let redPixelsBelowZero = 0;
    for (let y = 0; y < H; y += 2) {
      for (let x = padL; x <= padL + cW; x += 2) {
        const c = classify(x, y);
        if (c === "ROT") {
          redPixelsTotal += 1;
          if (y > y0 + 1.5) redPixelsBelowZero += 1;
        } else if (c === "TEAL" && y > y0 + 1.5) {
          tealPixelsBelowZero += 1;
        }
      }
    }

    return {
      y0, tealColumnsBelowZero, redColumnsBelowZero,
      redPixelsTotal, tealPixelsBelowZero, redPixelsBelowZero,
    };
  }, args);
}

test.describe("§9-Pixel-Checks (draw.ts, synthetische Fixtures)", () => {
  test("welle: unterhalb der nulllinie durchgehend rot (overshoot-regression)", async ({ page }) => {
    const p = await probe(page, {
      code: drawJs, mode: "wave", values: WAVE_REGRESSION,
    });
    // Kern-Assertion: KEINE Spalte mit tealer Strich-Unterkante unter der
    // Nulllinie — genau die Lücke vom 23.07.2026 (Overshoot unter der
    // Plot-Unterkante blieb teal, Strich flackerte rot/teal/rot).
    expect(p.tealColumnsBelowZero).toBe(0);
    // Der Rot-Pfad muss tatsächlich gegriffen haben (Dip ist ~35px breit).
    expect(p.redColumnsBelowZero).toBeGreaterThan(10);
  });

  test("welle: keine rot-pixel, wenn kein monat negativ ist", async ({ page }) => {
    const p = await probe(page, {
      code: drawJs, mode: "wave", values: WAVE_ALL_POSITIVE,
    });
    expect(p.redPixelsTotal).toBe(0);
  });

  test("popup-treppe: unter-null-abschnitte rot, kein teal unter der nulllinie (B3)", async ({ page }) => {
    const p = await probe(page, {
      code: drawJs, mode: "stair",
      values: STAIR_IST_CUM, planCum: STAIR_PLAN_CUM,
    });
    expect(p.tealPixelsBelowZero).toBe(0);
    expect(p.redPixelsBelowZero).toBeGreaterThan(50);
  });
});
