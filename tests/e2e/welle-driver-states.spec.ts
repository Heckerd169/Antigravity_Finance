import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// Regressions-Wächter für die DREI Zustände der Treiber-Anzeige (v2-24 P2).
// Prüft die ECHTE Quelldatei — transpiliert und ausgeführt, kein Nachbau der
// Logik. Muster übernommen von suggestion-visibility.spec.ts.
//
// ANLASS: Bis v2-24 kannte `getTop1Driver` zwei Eingangszustände — Treiber da
// oder `null`. Seit die Treiber erst beim Anfassen der Welle geladen werden, gibt
// es einen dritten: noch gar nicht gefragt. Die beiden alten Platzhalter wären
// dafür beide eine FALSCHE Aussage — „Keine Abweichungen" behauptet einen
// geprüften Befund, „Treiber nicht verfügbar" behauptet ein Scheitern.
//
// Warum das einen eigenen Wächter verdient: Die Verwechslung von „noch nicht
// geladen" und „nichts da" ist der klassische Weg, aus einem Ladezustand eine
// stille Falschaussage zu machen — und sie fällt in keiner Zahl auf. Der Anker
// misst die Sparrate, die Prüfsummen den Funktionsrumpf, die B2-Invariante die
// Summe. Alle drei bleiben grün, während der Tooltip behauptet, es gäbe keine
// Abweichung. Dieselbe Fehlerklasse wie LL-26, nur eine Ebene weiter oben.
//
// Zusätzlich festgenagelt: `getTop3Drivers` schneidet bei VIER, nicht bei drei
// (LL-26 / §6 Stolperfalle 16 — im Juli 2026 liegt „Gehalt" auf Platz 4).

const SRC_DRIVERS = path.join(
  __dirname, "..", "..", "src", "components", "welle", "drivers.ts",
);
const SRC_FORMAT = path.join(__dirname, "..", "..", "src", "lib", "format.ts");

function transpile(file: string): string {
  return ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
    },
  }).outputText;
}

/** Lädt ein transpiliertes Modul mit einem winzigen `require`-Ersatz.
 *
 *  `drivers.ts` importiert `formatAmount` aus `@/lib/format` — anders als die
 *  bisherigen Wächter-Ziele ist es also nicht importfrei. Der Ersatz lädt die
 *  ECHTE `format.ts` (ebenfalls transpiliert), statt die Formatierung
 *  nachzubauen: Ein Nachbau würde beim ersten Formatwechsel auseinanderlaufen
 *  und dann falsche Sicherheit geben. */
function load(file: string, deps: Record<string, unknown> = {}) {
  const module = { exports: {} as Record<string, unknown> };
  const fakeRequire = (id: string): unknown => {
    if (id in deps) return deps[id];
    throw new Error(`Unerwarteter Import im Wächter: ${id}`);
  };
  new Function("exports", "module", "require", transpile(file))(
    module.exports, module, fakeRequire,
  );
  return module.exports;
}

const format = load(SRC_FORMAT);
const drivers = load(SRC_DRIVERS, { "@/lib/format": format });

type DriverEntry = { label: string; isPlaceholder: boolean };
type DeviationDriver = {
  cardId: string | null;
  cardName: string;
  cardType: string | null;
  attribution: string | null;
  ist: number;
  plan: number;
  share: number;
  delta: number;
};
type DriversByMonth = Partial<Record<number, DeviationDriver[]>>;

const getTop1Driver = drivers.getTop1Driver as (
  d: DriversByMonth | null | undefined,
  monthIndex: number,
) => DriverEntry;

const getTop3Drivers = drivers.getTop3Drivers as (
  d: DriversByMonth | null | undefined,
  monthIndex: number,
) => DriverEntry[];

const parseYearDrivers = drivers.parseYearDrivers as (
  raw: unknown,
) => DriversByMonth;

/** Geschütztes Leerzeichen vor dem €-Zeichen — `fmtDelta` setzt bewusst U+00A0,
 *  damit Betrag und Einheit nicht umbrechen. Hier explizit ausgeschrieben, weil ein
 *  normales Leerzeichen im Test optisch identisch aussähe und der Wächter damit
 *  eine Eigenschaft prüfte, die er nicht prüft. */
const NBSP = " ";

/** Ein Treiber mit sinnvollen Vorgaben — jeder Test überschreibt nur das Nötige. */
const treiber = (teil: Partial<DeviationDriver> = {}): DeviationDriver => ({
  cardId: "11111111-2222-3333-4444-555555555555",
  cardName: "Tanken",
  cardType: "BUDGET",
  attribution: "ICH",
  ist: 172.59,
  plan: 240,
  share: 1,
  delta: 67.41,
  ...teil,
});

test.describe("Welle-Treiber: die drei Zustände (v2-24 P2)", () => {
  test("noch nicht geladen → sagt, dass geladen wird", () => {
    const e = getTop1Driver(undefined, 5);
    expect(e.isPlaceholder).toBe(true);
    expect(e.label).toBe("Treiber werden geladen");
  });

  test("geladen und gescheitert → sagt, dass nichts verfügbar ist", () => {
    const e = getTop1Driver(null, 5);
    expect(e.isPlaceholder).toBe(true);
    expect(e.label).toBe("Treiber nicht verfügbar");
  });

  test("geladen, Monat ohne Abweichung → sagt genau das", () => {
    const e = getTop1Driver({}, 5);
    expect(e.isPlaceholder).toBe(true);
    expect(e.label).toBe("Keine Abweichungen");
  });

  test("geladen, Treiber da → Name und Betrag, kein Platzhalter", () => {
    const e = getTop1Driver({ 5: [treiber()] }, 5);
    expect(e.isPlaceholder).toBe(false);
    expect(e.label).toBe(`Tanken +67,41${NBSP}€`);
  });

  test("die drei Platzhalter-Texte sind PAARWEISE VERSCHIEDEN", () => {
    // Der eigentliche Punkt dieses Wächters: Würde einer der drei Zustände auf
    // den Text eines anderen zurückfallen, wäre die Anzeige eine stille
    // Falschaussage — und keine Zahl im Projekt würde sich bewegen.
    const texte = [
      getTop1Driver(undefined, 0).label,
      getTop1Driver(null, 0).label,
      getTop1Driver({}, 0).label,
    ];
    expect(new Set(texte).size).toBe(3);
  });

  test("kein Platzhalter trägt ein Auslassungszeichen", () => {
    // `…` bedeutet in dieser Anwendung durchgängig „öffnet einen Dialog"
    // (§12.3/§12.4). Ein Ladezustand ist kein Dialog.
    for (const d of [undefined, null, {}] as (DriversByMonth | null | undefined)[]) {
      expect(getTop1Driver(d, 0).label).not.toContain("…");
    }
  });

  test("negatives Delta wird mit dem typografischen Minus gesetzt", () => {
    const e = getTop1Driver({ 3: [treiber({ delta: -249.97 })] }, 3);
    expect(e.label).toBe(`Tanken −249,97${NBSP}€`);
    expect(e.label).not.toContain("-249");
  });
});

test.describe("Welle-Treiber: das Popup schneidet bei VIER (LL-26)", () => {
  test("noch nicht geladen → eine Zeile, die es sagt", () => {
    expect(getTop3Drivers(undefined, 5)).toEqual([
      { label: "Treiber werden geladen", isPlaceholder: true },
    ]);
  });

  test("vier Treiber bleiben vier — die Gehalts-Zeile wird nicht abgeschnitten", () => {
    // §6 Stolperfalle 16: Im Juli 2026 liegt „Gehalt" mit −15,57 € auf Platz 4,
    // weil die Budget-Treiber größer sind. Stünde hier 3, wäre die Zahl korrekt
    // berechnet, in die Sparrate gerechnet, B2-konform — und nie sichtbar.
    const vier = [
      treiber({ cardName: "Privates Budget", delta: -249.97 }),
      treiber({ cardName: "Tanken", delta: 67.41 }),
      treiber({ cardName: "Miete", delta: 36.61 }),
      treiber({ cardName: "Gehalt", cardId: null, cardType: null, delta: -15.57 }),
    ];
    const e = getTop3Drivers({ 6: vier }, 6);
    expect(e).toHaveLength(4);
    expect(e[3].label).toBe(`Gehalt −15,57${NBSP}€`);
  });

  test("mehr als vier werden bei vier gekappt", () => {
    const fuenf = Array.from({ length: 5 }, (_, i) =>
      treiber({ cardName: `Karte ${i}` }),
    );
    expect(getTop3Drivers({ 0: fuenf }, 0)).toHaveLength(4);
  });
});

test.describe("Welle-Treiber: das Parsen bleibt unverändert (v2-24 berührt es nicht)", () => {
  test("die Form der RPC wird in die Monats-Map übersetzt", () => {
    // Feldnamen wie in der echten Antwort von get_year_deviation_drivers.
    const map = parseYearDrivers([
      {
        month: "2026-01-01",
        month_index: 0,
        drivers: [
          {
            card_id: "abc",
            card_name: "Privates Budget",
            card_type: "BUDGET",
            attribution: "ICH",
            ist: 399.98,
            plan: 150,
            share: 1,
            delta: -249.97,
          },
        ],
      },
    ]);
    expect(map[0]).toHaveLength(1);
    expect(map[0]![0].delta).toBe(-249.97);
    expect(map[0]![0].cardName).toBe("Privates Budget");
  });

  test("die Gehalts-Zeile behält cardId null — nicht leerer String", () => {
    // v2-19: „keine Karte" und „Karte mit leerer ID" sind verschiedene Aussagen,
    // und die Unterscheidung ist der Grund, warum die Zeile nicht anklickbar ist.
    const map = parseYearDrivers([
      {
        month_index: 6,
        drivers: [{ card_id: null, card_name: "Gehalt", delta: -15.57 }],
      },
    ]);
    expect(map[6]![0].cardId).toBeNull();
  });

  test("Unfug führt zu einer leeren Map, nicht zu einem Absturz", () => {
    expect(parseYearDrivers(null)).toEqual({});
    expect(parseYearDrivers("nein")).toEqual({});
    expect(parseYearDrivers([{ month_index: 99, drivers: [] }])).toEqual({});
    expect(parseYearDrivers([{ month_index: 0, drivers: "keins" }])).toEqual({});
  });
});
