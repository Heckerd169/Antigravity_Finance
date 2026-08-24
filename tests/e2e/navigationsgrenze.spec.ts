import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// Regressions-Wächter für die untere Navigationsschranke (v2-28, Phase 2).
// Prüft die ECHTE Quelldatei — transpiliert und ausgeführt, kein Nachbau der
// Logik. Muster übernommen von suggestion-visibility.spec.ts.
//
// ANLASS: Die Schranke war von Sprint 3 bis zum 24.08.2026 eine Konstante
// `MIN_NAVIGABLE_YM = "1900-01"`, im Code selbst als „absurd weit" markiert.
// Der Deaktiviert-Pfad in `header-timeline` war gebaut, kommentiert und
// funktionsfähig — und wurde in über einem Jahr **kein einziges Mal
// ausgelöst**. Der Zurück-Pfeil führte über Jahrzehnte in eine leere Bühne.
//
// Kein Anker, keine Prüfsumme und kein Test hat das gefunden, weil nichts
// falsch WAR: Jede Zahl stimmte, es gab nur keine. Dieselbe Blindstelle wie
// LL-26 — ein Frontend, das etwas anderes tut, als die Daten hergeben.
//
// Warum ein Wächter auf einer Funktion und nicht auf der Komponente: Genau das
// ist die Lehre aus `ZO-2` (v2-22). Eine Regel, die inline in einer
// Server Component steht, ist nicht einzeln prüfbar — und dort saß der Fehler
// aus v2-21. Deshalb ist die Ableitung eine reine Funktion.

const SRC = path.join(__dirname, "..", "..", "src", "lib", "months.ts");

const js = ts.transpileModule(fs.readFileSync(SRC, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2019,
  },
}).outputText;

function load() {
  const module = { exports: {} as Record<string, unknown> };
  new Function("exports", "module", js)(module.exports, module);
  return {
    deriveMinNavigableYm: module.exports.deriveMinNavigableYm as (
      months: readonly (string | null | undefined)[],
      fallback: string,
    ) => string,
    MAX_NAVIGABLE_YM: module.exports.MAX_NAVIGABLE_YM as string,
    compareMonths: module.exports.compareMonths as (
      a: string,
      b: string,
    ) => -1 | 0 | 1,
    addMonths: module.exports.addMonths as (ym: string, d: number) => string,
  };
}

const { deriveMinNavigableYm, MAX_NAVIGABLE_YM, compareMonths, addMonths } =
  load();

const HEUTE = "2026-08";

test.describe("Untere Navigationsschranke (v2-28 P2)", () => {
  test("das Minimum gewinnt, unabhängig von der Reihenfolge", () => {
    expect(deriveMinNavigableYm(["2026-01-01", "2025-01-01"], HEUTE)).toBe(
      "2025-01",
    );
    expect(deriveMinNavigableYm(["2025-01-01", "2026-01-01"], HEUTE)).toBe(
      "2025-01",
    );
  });

  test("YYYY-MM-DD wird auf YYYY-MM gekürzt", () => {
    expect(deriveMinNavigableYm(["2025-03-17"], HEUTE)).toBe("2025-03");
  });

  test("ein bereits gekürzter Wert überlebt unverändert", () => {
    expect(deriveMinNavigableYm(["2025-03"], HEUTE)).toBe("2025-03");
  });

  test("ohne Karten gilt der Rückfallwert — nicht 1900", () => {
    expect(deriveMinNavigableYm([], HEUTE)).toBe(HEUTE);
  });

  // Das ist der eigentliche Regressions-Schutz: Ein Rückfall auf einen
  // absurd weiten Wert hätte den alten Zustand wiederhergestellt, ohne dass
  // irgendetwas rot geworden wäre.
  test("der Rückfallwert ist NICHT absurd weit", () => {
    const grenze = deriveMinNavigableYm([], HEUTE);
    expect(compareMonths(grenze, "1900-01")).toBe(1);
    expect(compareMonths(grenze, "2000-01")).toBe(1);
  });

  test("null, undefined und Unsinn werden übersprungen, nicht geraten", () => {
    expect(
      deriveMinNavigableYm(
        [null, undefined, "", "kaputt", "2025-13-01", "2025-00-01", "2025-06-01"],
        HEUTE,
      ),
    ).toBe("2025-06");
  });

  test("ausschließlich unbrauchbare Einträge → Rückfallwert", () => {
    expect(deriveMinNavigableYm([null, "kaputt", "2025-13"], HEUTE)).toBe(HEUTE);
  });

  test("Jahreswechsel: Dezember schlägt Januar des Folgejahres", () => {
    expect(deriveMinNavigableYm(["2026-01-01", "2025-12-01"], HEUTE)).toBe(
      "2025-12",
    );
  });

  // Die Schranke ist nur dann eine Schranke, wenn der Vormonat des ersten
  // Datenmonats davor liegt — genau darauf prüft `header-timeline`.
  test("am ersten Datenmonat ist der Zurück-Pfeil tot, einen Monat später nicht", () => {
    const grenze = deriveMinNavigableYm(["2025-01-01"], HEUTE);

    expect(compareMonths(addMonths("2025-01", -1), grenze)).toBe(-1); // deaktiviert
    expect(compareMonths(addMonths("2025-02", -1), grenze)).toBe(0); // erlaubt
    expect(compareMonths(addMonths("2025-03", -1), grenze)).toBe(1); // erlaubt
  });

  test("die Obergrenze bleibt absurd weit — der Forecast ist blätterbar", () => {
    expect(MAX_NAVIGABLE_YM).toBe("2999-12");
    expect(compareMonths(addMonths("2030-01", 1), MAX_NAVIGABLE_YM)).toBe(-1);
  });
});
