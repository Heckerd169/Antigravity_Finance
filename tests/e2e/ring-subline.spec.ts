import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// Regressions-Wächter für die Ring-Subzeile im Degenerations-Modus (§5 N4b).
// Prüft die ECHTE Quelldatei — transpiliert und ausgeführt, kein Nachbau der
// Logik. Ein Nachbau driftet vom Original ab und gibt falsche Sicherheit.
// Muster übernommen von visual-pixel.spec.ts, das dasselbe mit welle/draw.ts tut.
//
// Anlass (v2-12, BF-2): Der Sonderfall verzweigte am Vorzeichen des PLANS statt
// an der Differenz. Bei kleinem positivem Plan und negativem Ist stand dort
// „Plan fast 0 € — −1.223 € gespart". Man spart keine minus 1.223 €.
// Der Fehler hat zwei Sprints überlebt, weil die Kombination bis zur
// Juli-Kuratierung nicht erreichbar war — und weil die Regel im Bauteil
// eingebettet und damit nicht einzeln prüfbar war. Beides ist jetzt behoben.

const SRC = path.join(
  __dirname, "..", "..", "src", "components", "singularity-ring", "ring-subline.ts",
);

const js = ts.transpileModule(fs.readFileSync(SRC, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2019,
  },
}).outputText;

type Subline = { text: string; color: "red" | "teal" | "muted" };

function load(): (current: number, plan: number) => Subline {
  const module = { exports: {} as Record<string, unknown> };
  new Function("exports", "module", js)(module.exports, module);
  return module.exports.degenerateSubline as (c: number, p: number) => Subline;
}

const degenerateSubline = load();

// Vor dem € steht ein GESCHÜTZTES Leerzeichen (U+00A0), damit Betrag und
// Einheit nie umbrechen. Hier explizit gebaut statt eingefügt — ein unsichtbares
// Zeichen in einer Testerwartung ist beim Lesen nicht von einem normalen
// Leerzeichen zu unterscheiden und kostet sonst jedes Mal eine Fehlersuche.
const NBSP = " ";
const eur = (betrag: string) => `${betrag}${NBSP}€`;

/** current · plan · erwarteter Text · erwartete Farbe */
const FAELLE: Array<[string, number, number, string, Subline["color"]]> = [
  // Der Fall, der den Befund ausgelöst hat — mit der Juli-Zahl NACH BF-5.
  ["Juli 2026 (Plan 55,44 · Ist negativ)", -322.75, 55.44, `${eur("−378")} unter Plan`, "red"],
  // Dieselbe Konstellation mit der Zahl VOR BF-5 — so stand es im Befund.
  ["Juli 2026 vor BF-5", -1222.75, 55.44, `${eur("−1.278")} unter Plan`, "red"],
  // Negativer Plan: war schon vor v2-12 vorzeichensicher, muss es bleiben.
  ["negativer Plan, besser als geplant", -50, -200, `${eur("+150")} über Plan`, "teal"],
  ["negativer Plan, schlechter", -300, -200, `${eur("−100")} unter Plan`, "red"],
  // E3: eigene Formulierung statt „+0 € über Plan".
  ["exakt auf Plan", 55.44, 55.44, "genau nach Plan", "muted"],
  ["30 Cent daneben (rundet auf 0)", 55.74, 55.44, "genau nach Plan", "muted"],
  ["60 Cent daneben (rundet auf 1)", 56.04, 55.44, `${eur("+1")} über Plan`, "teal"],
  // Kleiner positiver Plan mit positivem Ist — der Zweig, der früher „gespart" sagte.
  ["kleiner Plan, Ist positiv", 400, 55.44, `${eur("+345")} über Plan`, "teal"],
];

for (const [name, current, plan, erwText, erwColor] of FAELLE) {
  test(`ring-subzeile: ${name}`, () => {
    const r = degenerateSubline(current, plan);
    expect(r.text).toBe(erwText);
    expect(r.color).toBe(erwColor);
  });
}

test("ring-subzeile: gespart und fast-0 kommen nirgends mehr vor", () => {
  for (const [, current, plan] of FAELLE) {
    expect(degenerateSubline(current, plan).text).not.toContain("gespart");
    expect(degenerateSubline(current, plan).text).not.toContain("fast 0");
  }
});
