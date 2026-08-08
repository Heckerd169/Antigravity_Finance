import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// v2-16 (PA-1) — Regressions-Wächter für die Rechnung der Konsequenz-Anzeige.
// Prüft die ECHTE Quelldatei (transpiliert und ausgeführt), kein Nachbau.
// Muster von ring-subline.spec.ts.
//
// Hier treffen zwei Regeln aufeinander, die beide schon einmal teuer waren:
//   · §10 — gemeinsame EINNAHMEN wirken umgekehrt auf die Sparrate. Ohne die
//     Umkehr stimmte der Satz „Die Sparrate sinkt um denselben Betrag" nicht.
//     Heute existiert keine solche Karte (Befund L4) — der Fall ist also
//     ausschließlich hier prüfbar, sonst nirgends.
//   · LL-24 — Runden ist eine Entscheidung. Summiert wird ungerundet.
//
// Referenz ist die am 05.08.2026 gegen die Produktiv-Datenbank belegte
// Rechnung (sprints/sprint_v2-10_offene_fragen.md §5).
// Deterministisch, keine Live-Daten, kein Browser.

const SRC = path.join(
  __dirname, "..", "..", "src", "components", "income-split", "consequence.ts",
);

const js = ts.transpileModule(fs.readFileSync(SRC, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2019,
  },
}).outputText;

type Item = {
  cardId: string;
  name: string;
  before: number;
  after: number;
  impact: number;
  isIncome: boolean;
};
type Plan = { cardId: string; name: string; plan: number; isIncome: boolean };

function load() {
  const module = { exports: {} as Record<string, unknown> };
  new Function("exports", "module", js)(module.exports, module);
  return {
    buildConsequenceItems: module.exports.buildConsequenceItems as (
      c: Plan[], fb: number, fa: number,
    ) => Item[],
    totalsOf: module.exports.totalsOf as (i: Item[]) => {
      totalBefore: number; totalAfter: number; totalImpact: number;
    },
    isEmptyConsequence: module.exports.isEmptyConsequence as (
      i: Item[], t: number,
    ) => boolean,
  };
}

const { buildConsequenceItems, totalsOf, isEmptyConsequence } = load();

// Die vier gemeinsamen Posten des Bestands, alle FIXED_COST — Roh-Pläne, wie
// `get_effective_plan_for_month` sie liefert (am 07.08.2026 gegen Produktion
// nachgemessen).
const VIER_POSTEN: Plan[] = [
  { cardId: "a", name: "Miete", plan: 1904.0, isIncome: false },
  { cardId: "b", name: "Strom - Mainova", plan: 63.0, isIncome: false },
  { cardId: "c", name: "Internet - Vodafone", plan: 39.98, isIncome: false },
  { cardId: "d", name: "Rechtsschutz - Adam Riese", plan: 27.01, isIncome: false },
];

// ICH-Brutto 92.400 → 96.000 bei Partner-Brutto 69.113.
const F_ALT = 92400 / (92400 + 69113);
const F_NEU = 96000 / (96000 + 69113);

const cents = (n: number) => Math.round(n * 100) / 100;

// ── Der belegte Fall ───────────────────────────────────────────────────────

test("der belegte Fall: vier Posten, Summe +18,98 € (Beleg v2-10 §5)", () => {
  const items = buildConsequenceItems(VIER_POSTEN, F_ALT, F_NEU);
  const t = totalsOf(items);

  expect(items).toHaveLength(4);
  // Exakt die Zahlen aus dem Beleg und aus dem Entwurfsbild.
  expect(cents(t.totalBefore)).toBe(1163.62);
  expect(cents(t.totalAfter)).toBe(1182.6);
  // Die Held-Zahl der Design-Doku §10 und des Records vom 06.08.2026.
  expect(cents(t.totalImpact)).toBe(18.98);
});

test("die Spalten Bisher und Künftig gehen für den auf, der sie nachaddiert", () => {
  const items = buildConsequenceItems(VIER_POSTEN, F_ALT, F_NEU);
  const t = totalsOf(items);

  // Genau die Zahlen, die in der Tabelle stehen — von Hand addiert.
  const sichtbarBefore = items.reduce((s, i) => s + cents(i.before), 0);
  const sichtbarAfter = items.reduce((s, i) => s + cents(i.after), 0);
  expect(cents(sichtbarBefore)).toBe(cents(t.totalBefore));
  expect(cents(sichtbarAfter)).toBe(cents(t.totalAfter));

  // Und die Summenzeile bleibt in sich stimmig: Künftig − Bisher = Diff.
  expect(cents(t.totalAfter - t.totalBefore)).toBe(cents(t.totalImpact));
});

test("die Miete allein macht +17,76 € aus", () => {
  const items = buildConsequenceItems(VIER_POSTEN, F_ALT, F_NEU);
  const miete = items.find((i) => i.name === "Miete");
  expect(cents(miete!.before)).toBe(1089.26);
  expect(cents(miete!.after)).toBe(1107.02);
  expect(cents(miete!.impact)).toBe(17.76);
});

// ── LL-24: die Rundungs-Reihenfolge ────────────────────────────────────────

test("LL-24: die Summe entsteht UNGERUNDET — je Zeile gerundet käme 18,97 heraus", () => {
  const items = buildConsequenceItems(VIER_POSTEN, F_ALT, F_NEU);
  const t = totalsOf(items);

  const summeAusGerundeten = items.reduce((s, i) => s + cents(i.impact), 0);
  // Die sichtbare Cent-Differenz ist bekannt und gewollt: Die Diff.-SPALTE
  // addiert sich fürs Auge auf 18,97, in der Summenzeile steht 18,98. Drei
  // Spalten lassen sich nicht gleichzeitig zum Aufgehen bringen — dies ist die
  // unauffälligste der drei möglichen Abweichungen, und die Held-Zahl bleibt
  // die belegte. Schlüge dieser Test um, wäre die Reihenfolge gekippt.
  expect(cents(summeAusGerundeten)).toBe(18.97);
  expect(cents(t.totalImpact)).toBe(18.98);
});

// ── §10: gemeinsame Einnahmen ──────────────────────────────────────────────

test("§10: eine gemeinsame EINNAHME wirkt umgekehrt — sie entlastet", () => {
  const einnahme: Plan[] = [
    { cardId: "e", name: "Gemeinsame Miet-Einnahme", plan: 1000, isIncome: true },
  ];
  const [item] = buildConsequenceItems(einnahme, F_ALT, F_NEU);

  // Der eigene ANTEIL steigt wie bei einer Ausgabe …
  expect(item.after).toBeGreaterThan(item.before);
  // … die WIRKUNG auf die Sparrate ist aber die entgegengesetzte.
  expect(item.impact).toBeLessThan(0);
  expect(cents(item.impact)).toBe(cents(item.before - item.after));
});

test("§10: Einnahme und Ausgabe stehen in DERSELBEN Liste und heben sich auf", () => {
  const gemischt: Plan[] = [
    { cardId: "a", name: "Ausgabe", plan: 1000, isIncome: false },
    { cardId: "b", name: "Einnahme", plan: 1000, isIncome: true },
  ];
  const items = buildConsequenceItems(gemischt, F_ALT, F_NEU);
  const t = totalsOf(items);

  expect(items).toHaveLength(2);
  // Gleicher Betrag, entgegengesetzte Wirkung → unterm Strich null.
  expect(cents(t.totalImpact)).toBe(0);
  // Und damit greift der leere Fall: Es gibt nichts zu berichten.
  expect(isEmptyConsequence(items, t.totalImpact)).toBe(true);
});

// ── Der leere Fall (§10, LL-20) ────────────────────────────────────────────

test("leerer Fall: unveränderter Faktor ergibt keine Anzeige, keine Null-Zeile", () => {
  const items = buildConsequenceItems(VIER_POSTEN, F_ALT, F_ALT);
  const t = totalsOf(items);
  expect(cents(t.totalImpact)).toBe(0);
  expect(isEmptyConsequence(items, t.totalImpact)).toBe(true);
});

test("leerer Fall: keine gemeinsamen Posten", () => {
  const items = buildConsequenceItems([], F_ALT, F_NEU);
  const t = totalsOf(items);
  expect(isEmptyConsequence(items, t.totalImpact)).toBe(true);
});

test("leerer Fall: eine Wirkung unter einem halben Cent zählt als nichts", () => {
  // Winzige Faktor-Änderung an einem kleinen Posten.
  const winzig: Plan[] = [
    { cardId: "a", name: "Klein", plan: 10, isIncome: false },
  ];
  const items = buildConsequenceItems(winzig, 0.5, 0.5001);
  const t = totalsOf(items);
  expect(Math.abs(t.totalImpact)).toBeLessThan(0.005);
  expect(isEmptyConsequence(items, t.totalImpact)).toBe(true);
});

// ── Randfälle ──────────────────────────────────────────────────────────────

test("eine im Monat inaktive Karte (Plan 0) fällt aus der Liste", () => {
  const mitInaktiver: Plan[] = [
    ...VIER_POSTEN,
    { cardId: "x", name: "Jahres-Karte, hier inaktiv", plan: 0, isIncome: false },
  ];
  const items = buildConsequenceItems(mitInaktiver, F_ALT, F_NEU);
  expect(items).toHaveLength(4);
  expect(items.map((i) => i.name)).not.toContain("Jahres-Karte, hier inaktiv");
});

test("sinkender Anteil: die Wirkung dreht das Vorzeichen, die Beträge bleiben", () => {
  const items = buildConsequenceItems(VIER_POSTEN, F_NEU, F_ALT);
  const t = totalsOf(items);
  // Spiegelbild des belegten Falls.
  expect(cents(t.totalImpact)).toBe(-18.98);
  expect(cents(t.totalBefore)).toBe(1182.6);
  expect(cents(t.totalAfter)).toBe(1163.62);
  expect(isEmptyConsequence(items, t.totalImpact)).toBe(false);
});

test("Partner unbekannt (Faktor 1,0): der eigene Anteil ist der volle Plan", () => {
  const items = buildConsequenceItems(VIER_POSTEN, F_ALT, 1.0);
  const miete = items.find((i) => i.name === "Miete");
  expect(cents(miete!.after)).toBe(1904.0);
});
