import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// Regressions-Wächter für die Sichtbarkeit eines Kartenvorschlags (v2-22, `ZO-2`).
// Prüft die ECHTE Quelldatei — transpiliert und ausgeführt, kein Nachbau der
// Logik. Muster übernommen von ring-subline.spec.ts, das dasselbe mit der
// Ring-Subzeile tut.
//
// ANLASS: Die Regel stand bis v2-22 inline im `.map()` einer Server Component
// (`src/app/page.tsx`) und war damit nicht einzeln prüfbar. Genau dort saß in
// v2-21 ein Fehler, der den ganzen Sprint entwertet hätte:
//
//   Die Bedingung lautete `conf >= badge && conf < auto_absorption`.
//   Die OBERGRENZE war nie eine Aussage über die Konfidenz — sie war ein
//   Stellvertreter für „wurde bereits automatisch verlinkt". Seit
//   `refresh_fragment_suggestions` nachrechnet OHNE zu verlinken, gibt es offene
//   Zahlungen mit Konfidenz ≥ 0,95. Gemessen: 24 allein in 2026, und es sind die
//   treffsichersten. Sie wären unsichtbar geblieben.
//
// Kein Anker und keine Prüfsumme fängt so etwas — alle Zahlen sind richtig, sie
// werden nur nicht gezeigt. Es war die dritte Stelle dieser Art in vier Tagen
// (v2-19 getTop3Drivers, v2-20 Lösch-Tor, v2-21 hier). Deshalb dieser Test.

const SRC = path.join(__dirname, "..", "..", "src", "lib", "suggestion.ts");

const js = ts.transpileModule(fs.readFileSync(SRC, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2019,
  },
}).outputText;

type Eingabe = {
  suggestedCardId: string | null;
  confidence: number | null;
  status: string;
  badgeThreshold: number;
};

function load(): (e: Eingabe) => boolean {
  const module = { exports: {} as Record<string, unknown> };
  new Function("exports", "module", js)(module.exports, module);
  return module.exports.istVorschlagSichtbar as (e: Eingabe) => boolean;
}

const istVorschlagSichtbar = load();

const KARTE = "11111111-2222-3333-4444-555555555555";
const BADGE = 0.6;

/** Kurzschreibweise mit sinnvollen Vorgaben — jeder Test überschreibt nur das,
 *  worum es ihm geht. */
const eingabe = (teil: Partial<Eingabe> = {}): Eingabe => ({
  suggestedCardId: KARTE,
  confidence: 0.75,
  status: "UNASSIGNED",
  badgeThreshold: BADGE,
  ...teil,
});

test.describe("Vorschlags-Sichtbarkeit (v2-22 ZO-2)", () => {
  test("keine vorgeschlagene Karte → kein Vorschlag", () => {
    expect(istVorschlagSichtbar(eingabe({ suggestedCardId: null }))).toBe(false);
  });

  test("kein Konfidenzwert → kein Vorschlag", () => {
    expect(istVorschlagSichtbar(eingabe({ confidence: null }))).toBe(false);
  });

  test("unter der Badge-Schwelle → kein Vorschlag", () => {
    expect(istVorschlagSichtbar(eingabe({ confidence: 0.59 }))).toBe(false);
  });

  test("exakt auf der Badge-Schwelle → Vorschlag", () => {
    // Die Schwelle ist einschließend: `>= badge`, nicht `> badge`.
    expect(istVorschlagSichtbar(eingabe({ confidence: BADGE }))).toBe(true);
  });

  test("im Band zwischen Badge und Auto-Schwelle → Vorschlag", () => {
    expect(istVorschlagSichtbar(eingabe({ confidence: 0.75 }))).toBe(true);
  });

  test("ÜBER der Auto-Schwelle und noch offen → Vorschlag", () => {
    // ── Der Fall, der in v2-21 gefehlt hätte. ──────────────────────────────
    // Vor v2-21 P4 galt `conf < auto_absorption_threshold`, und dieser Fall
    // lieferte deshalb `false`. Seit nachgerechnet wird, ohne zu verlinken,
    // ist er der WICHTIGSTE: 24 offene Zahlungen aus 2026 liegen hier, und es
    // sind die treffsichersten des ganzen Sprints.
    expect(istVorschlagSichtbar(eingabe({ confidence: 0.99 }))).toBe(true);
    expect(istVorschlagSichtbar(eingabe({ confidence: 1.0 }))).toBe(true);
  });

  test("bereits zugeordnet → kein Vorschlag, egal wie hoch die Konfidenz", () => {
    // Der Status entscheidet, nicht die Zahl. Er kommt aus
    // `fragments_with_status` und wird dort aus dem tatsächlichen Link
    // abgeleitet.
    for (const status of ["ASSIGNED", "AUTO_ABSORBED"]) {
      expect(istVorschlagSichtbar(eingabe({ status, confidence: 1.0 }))).toBe(
        false,
      );
      expect(istVorschlagSichtbar(eingabe({ status, confidence: 0.75 }))).toBe(
        false,
      );
    }
  });

  test("Übertrag → kein Vorschlag", () => {
    // `transfer_type` gewinnt in der View vor der Link-Herkunft (§6
    // Stolperfalle 7). Ein Übertrag ist nie an eine Karte verlinkbar und darf
    // deshalb auch keinen Vorschlag tragen.
    for (const status of ["INTERNAL_TRANSFER", "ASSET_REALLOCATION"]) {
      expect(istVorschlagSichtbar(eingabe({ status, confidence: 1.0 }))).toBe(
        false,
      );
    }
  });

  test("die Schwelle kommt von außen, ist nicht eingebaut", () => {
    // CLAUDE.md Regel 5: `app_config`-Werte werden gelesen, nie hartcodiert.
    // Bei angehobener Schwelle muss derselbe Wert durchfallen.
    expect(istVorschlagSichtbar(eingabe({ confidence: 0.7, badgeThreshold: 0.6 })))
      .toBe(true);
    expect(istVorschlagSichtbar(eingabe({ confidence: 0.7, badgeThreshold: 0.8 })))
      .toBe(false);
  });

  test("NaN als Konfidenz → kein Vorschlag", () => {
    // `Number(null)` ergibt 0, `Number("")` ebenfalls — aber `Number(undefined)`
    // ergibt NaN, und NaN-Vergleiche sind immer false. Ohne die explizite
    // Prüfung liefe das durch die Schwellen-Prüfung und wäre erst am leeren
    // Kartennamen aufgefallen.
    expect(istVorschlagSichtbar(eingabe({ confidence: Number.NaN }))).toBe(false);
  });
});
