import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// Regressions-Wächter über den Tab „Übersicht" auf /mobil (v3-03).
// Prüft die ECHTEN Quelldateien — transpiliert und ausgeführt, kein Nachbau
// (Muster: mobil-zuordnen.spec.ts, visual-pixel.spec.ts).
//
// WARUM: Keine dieser Regeln macht eine Zahl falsch, wenn sie bricht. Anker,
// Prüfsummen und beide Invarianten blieben grün — der Nutzer läse nur „frei"
// auf einer Fixkosten-Karte, sähe einen Marker-Punkt hinter dem Ring oder eine
// Welle, die den falschen Monat als realisiert färbt (LL-26).
//
// Quelle der Erwartungen: Handoff-README §4, Design-Record 07.09.2026 #10/#11,
// Annahmen B1–B11 im Briefing v3-03.

const REPO = path.join(__dirname, "..", "..");

/** Transpiliert eine importfreie TS-Datei zu CommonJS und führt sie aus. */
function laden(rel: string): Record<string, unknown> {
  const src = fs.readFileSync(path.join(REPO, rel), "utf8");
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
  }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function("exports", "module", js)(mod.exports, mod);
  return mod.exports;
}

type KachelTyp = "fixkosten" | "budget" | "einnahmen";

const r = laden("src/components/mobil/uebersicht/regeln.ts") as {
  KACHEL_REIHENFOLGE: readonly KachelTyp[];
  kachelTyp: (t: "FIXED_COST" | "BUDGET" | "INCOME") => KachelTyp;
  kachelTitel: (k: KachelTyp) => string;
  kachelUnterzeile: (z: {
    kachel: KachelTyp;
    restText: string;
    alleEingegangen: boolean;
  }) => string;
  einstiegTitel: (offen: number) => string;
  einstiegUnterzeile: (offen: number) => string;
  fusszeile: (z: { empfaenger: string; karte: string } | null) => string;
  realisierterIndex: (jahr: number, laufendYm: string) => number;
};

test.describe("Übersicht auf /mobil — die Regeln der Kacheln", () => {
  test("jeder Kartentyp landet in genau einer Kachel", () => {
    const typen: ("FIXED_COST" | "BUDGET" | "INCOME")[] = [
      "FIXED_COST",
      "BUDGET",
      "INCOME",
    ];
    const getroffen = new Set(typen.map((t) => r.kachelTyp(t)));
    // Drei Typen, drei Kacheln, keine Sammelgruppe: Fällt ein vierter Typ
    // still in ein `else`, zeigt diese Prüfung es (LL-26, Form „Filtern").
    expect(getroffen.size).toBe(3);
    expect(Array.from(getroffen).sort()).toEqual([...r.KACHEL_REIHENFOLGE].sort());
  });

  test("die Reihenfolge ist Fixkosten · Einnahmen · Budget — wie im Entwurf", () => {
    // `screenshots/01-uebersicht.png` ist die einzige Aussage über die
    // Anordnung; die Aufzählung im README-Text nennt die Wortlaute, nicht die
    // Reihenfolge. Bewusst anders als das Sheet „Karte wählen".
    expect([...r.KACHEL_REIHENFOLGE]).toEqual(["fixkosten", "einnahmen", "budget"]);
    expect(r.KACHEL_REIHENFOLGE.map((k) => r.kachelTitel(k))).toEqual([
      "FIXKOSTEN",
      "EINNAHMEN",
      "BUDGET",
    ]);
  });

  test("ein Rest auf Fixkosten heißt „unbezahlt“, NIE „frei“", () => {
    const zeile = r.kachelUnterzeile({
      kachel: "fixkosten",
      restText: "1.593,00 €",
      alleEingegangen: false,
    });
    expect(zeile).toBe("1.593,00 € unbezahlt");
    // Record #11: „frei" würde eine Wahl behaupten, die es bei einer
    // Fixkostenzahlung nicht gibt.
    expect(zeile).not.toContain("frei");
  });

  test("ein Rest auf Budget heißt „frei“", () => {
    expect(
      r.kachelUnterzeile({ kachel: "budget", restText: "412,00 €", alleEingegangen: false }),
    ).toBe("412,00 € frei");
  });

  test("Einnahmen zeigen einen Zustand, keinen Rest", () => {
    const offen = r.kachelUnterzeile({
      kachel: "einnahmen",
      restText: "4.165,11 €",
      alleEingegangen: false,
    });
    const fertig = r.kachelUnterzeile({
      kachel: "einnahmen",
      restText: "4.165,11 €",
      alleEingegangen: true,
    });
    expect(offen).toBe("erwartet");
    expect(fertig).toBe("eingegangen");
    // Der Betrag darf hier nicht auftauchen — die Kachel sagt den Zustand.
    expect(offen).not.toContain("4.165");
    expect(fertig).not.toContain("4.165");
  });

  test("„eingegangen“ erst, wenn KEINE Einnahmen-Karte mehr offen ist", () => {
    // Eine einzige offene Einnahme genügt für „erwartet" — sonst behauptete
    // die Kachel Vollständigkeit, die nicht da ist.
    expect(
      r.kachelUnterzeile({ kachel: "einnahmen", restText: "0,00 €", alleEingegangen: false }),
    ).toBe("erwartet");
  });
});

test.describe("Übersicht auf /mobil — Einstiegskarte und Fußzeile", () => {
  test("die Einstiegskarte zählt im Singular und im Plural", () => {
    expect(r.einstiegTitel(0)).toBe("Alles zugeordnet");
    expect(r.einstiegTitel(1)).toBe("1 Umsatz zuordnen");
    expect(r.einstiegTitel(7)).toBe("7 Umsätze zuordnen");
  });

  test("die Unterzeile sagt, was der Stapel für die Sparrate bedeutet", () => {
    expect(r.einstiegUnterzeile(3)).toBe(
      "Die Sparrate ist vorläufig, bis der Stapel leer ist",
    );
    expect(r.einstiegUnterzeile(0)).toBe("Die Sparrate ist endgültig");
  });

  test("ein negativer Zähler zählt wie null — die Karte behauptet nichts", () => {
    expect(r.einstiegTitel(-1)).toBe("Alles zugeordnet");
    expect(r.einstiegUnterzeile(-1)).toBe("Die Sparrate ist endgültig");
  });

  test("die Fußzeile nennt Empfänger und Karte", () => {
    expect(r.fusszeile({ empfaenger: "REWE Markt", karte: "Haushaltsgeld" })).toBe(
      "Zuletzt zugeordnet: REWE Markt → Haushaltsgeld",
    );
    expect(r.fusszeile(null)).toBe("noch nichts in dieser Sitzung");
  });
});

// ── Die Kachel-Breite: gemessen, nicht geschätzt (LL-31 / LL-45) ──────────
//
// Drei Kacheln teilen sich 430 px minus Seitenränder minus zwei Lücken; jede
// bekommt rund 105 px Inhaltsbreite. Der Design-Record hat gegen **ganze Euro**
// gemessen („1.593 € unbezahlt bei 11 px passt einzeilig in 105 px") — mit Cent
// stimmt die Rechnung nicht mehr, und die Ellipse fräße ausgerechnet die Ziffer.
//
// Dieser Test misst mit dem echten Font-Stack im Browser, nicht mit einer
// Schätzung. Er ist der Grund, warum `eurGanz` existiert.

const KACHEL_INHALT_PX = 105;

test.describe("Übersicht auf /mobil — die Kacheln passen in ihre Breite", () => {
  test("ganze Euro passen in 105 px, Cent-Beträge nicht", async ({ page }) => {
    await page.setContent("<body></body>");
    const messung = await page.evaluate(() => {
      const stack =
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
      const cv = document.createElement("canvas");
      const ctx = cv.getContext("2d");
      if (!ctx) throw new Error("kein 2d-Kontext");
      ctx.font = `11px ${stack}`;
      const messen = (s: string) => ctx.measureText(s).width;
      return {
        ganz: messen("2.842 € unbezahlt"),
        mitCent: messen("2.841,87 € unbezahlt"),
        grossGanz: messen("12.842 € unbezahlt"),
      };
    });

    // Der reale Fall aus Produktion: Fixkosten-Plansumme im September 2026.
    expect(messung.ganz).toBeLessThanOrEqual(KACHEL_INHALT_PX);
    // Und der Beleg, dass die Entscheidung nötig war — nicht bloß hübsch.
    expect(messung.mitCent).toBeGreaterThan(KACHEL_INHALT_PX);
    // Auch eine fünfstellige Summe bleibt einzeilig.
    expect(messung.grossGanz).toBeLessThanOrEqual(KACHEL_INHALT_PX);
  });
});

test.describe("Übersicht auf /mobil — die Teal/Grau-Grenze der Welle", () => {
  test("ein vergangenes Jahr ist vollständig realisiert", () => {
    expect(r.realisierterIndex(2025, "2026-09")).toBe(11);
  });

  test("ein künftiges Jahr ist es gar nicht", () => {
    expect(r.realisierterIndex(2027, "2026-09")).toBe(-1);
  });

  test("im laufenden Jahr endet die Grenze beim laufenden Monat", () => {
    // September = Index 8. Der laufende Monat ist angebrochen und trägt
    // bereits Buchungen — er gehört auf die realisierte Seite.
    expect(r.realisierterIndex(2026, "2026-09")).toBe(8);
    expect(r.realisierterIndex(2026, "2026-01")).toBe(0);
    expect(r.realisierterIndex(2026, "2026-12")).toBe(11);
  });
});

// ── Der Marker-Punkt: ein echter Pixel-Test, kein Quelltext-Blick ──────────
//
// Record #10 verlangt die Welle auf /mobil „ohne Marker-Punkt": Der Ring steht
// davor, ein zweiter Blickfang daneben wäre einer zu viel. Der Parameter
// `showActiveMarker` schaltet ihn ab — und dass er das WIRKLICH tut, lässt sich
// nur am gezeichneten Bild sehen (LL-40: ein Wächter, von dem niemand weiß, ob
// er auslösen kann, ist eine Zusicherung, keine Prüfung).

const DRAW_TS = path.join(REPO, "src", "components", "welle", "draw.ts");
const drawJs = ts.transpileModule(fs.readFileSync(DRAW_TS, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
}).outputText;

/** Zwölf ruhige Werte — die Kurve läuft flach durch den aktiven Punkt, sodass
 *  der Marker der einzige Unterschied im Messfenster ist. */
const RUHIGE_WERTE = [
  1800, 1810, 1820, 1830, 1840, 1850, 1860, 1870, 1880, 1890, 1900, 1910,
];

test.describe("Übersicht auf /mobil — die Welle zeichnet keinen Marker", () => {
  test("showActiveMarker: false entfernt den Punkt, und nur ihn", async ({ page }) => {
    await page.setContent("<body></body>");
    const messung = await page.evaluate(
      (a: { code: string; values: number[] }) => {
        const exports: Record<string, unknown> = {};
        // eslint-disable-next-line no-eval
        eval(a.code);
        const ex = exports as {
          drawWave: (ctx: CanvasRenderingContext2D, p: unknown) => unknown;
          WAVE_PAD_L: number;
          WAVE_PAD_R: number;
        };

        const W = 430;
        const H = 282;
        const AKTIV = 8;

        const zeichnen = (marker: boolean): ImageData => {
          const cv = document.createElement("canvas");
          cv.width = W;
          cv.height = H;
          const ctx = cv.getContext("2d");
          if (!ctx) throw new Error("kein 2d-Kontext");
          ex.drawWave(ctx, {
            width: W,
            height: H,
            values: a.values,
            realizedIndex: AKTIV,
            activeIndex: AKTIV,
            opacity: 0.8,
            showActiveMarker: marker,
          });
          return ctx.getImageData(0, 0, W, H);
        };

        const mit = zeichnen(true);
        const ohne = zeichnen(false);

        // Der aktive Punkt liegt bei x = padL + i * (cW / 11).
        const cW = W - ex.WAVE_PAD_L - ex.WAVE_PAD_R;
        const xAktiv = Math.round(ex.WAVE_PAD_L + AKTIV * (cW / 11));
        const xFern = Math.round(ex.WAVE_PAD_L + 1 * (cW / 11));

        /** Zählt Pixel, die sich zwischen beiden Bildern unterscheiden. */
        const anders = (xm: number): number => {
          let n = 0;
          for (let y = 0; y < H; y++) {
            for (let x = xm - 12; x <= xm + 12; x++) {
              if (x < 0 || x >= W) continue;
              const i = (y * W + x) * 4;
              if (
                mit.data[i] !== ohne.data[i] ||
                mit.data[i + 1] !== ohne.data[i + 1] ||
                mit.data[i + 2] !== ohne.data[i + 2] ||
                mit.data[i + 3] !== ohne.data[i + 3]
              ) {
                n++;
              }
            }
          }
          return n;
        };

        return { amPunkt: anders(xAktiv), fernab: anders(xFern) };
      },
      { code: drawJs, values: RUHIGE_WERTE },
    );

    // Am aktiven Punkt muss sich etwas ändern — sonst wirkt der Parameter
    // nicht, und die Welle trüge auf /mobil weiterhin ihren Marker.
    // Der Kreis hat r 5 gefüllt plus Ring r 9, also deutlich über 100 Pixel.
    expect(messung.amPunkt).toBeGreaterThan(100);
    // Und sonst NIRGENDS: Kurve, Fläche, Nulllinie und Beschriftung bleiben
    // Zeichen für Zeichen gleich. Ein Parameter, der mehr abschaltet als den
    // Punkt, fiele hier auf.
    expect(messung.fernab).toBe(0);
  });
});
