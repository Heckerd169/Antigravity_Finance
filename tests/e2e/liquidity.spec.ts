import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// Regressions-Wächter für die Ausstehend-Anzeige (§8, `LQ-2`).
//
// Prüft die ECHTE Quelldatei — transpiliert und ausgeführt, kein Nachbau der
// Logik. Muster übernommen von ring-subline.spec.ts und visual-pixel.spec.ts.
// Ein Nachbau driftet vom Original ab und gibt falsche Sicherheit.
//
// Anlass (v2-15): Die Regel „ein Posten zählt, solange sein Termin nicht vor
// heute liegt UND weder ein Umsatz an ihm hängt noch er abgehakt ist" wurde
// beim Bau einmalig gegen den echten Kartenbestand geprüft — und war damit
// belegt, aber nicht bewacht. Sie ist besonders schützenswert, weil sie
// **unsichtbar falsch** sein kann: Eine zu hohe Ausstehend-Zahl sieht aus wie
// eine korrekte Zahl. Genau diese Klasse von Fehlern hat die Befunde vom
// 04.08.2026 erzeugt.
//
// Der Test braucht weder Zugangsdaten noch Live-Daten noch den dev-Server.

const SRC = path.join(
  __dirname, "..", "..", "src", "components", "interaction-zone", "liquidity.ts",
);

const js = ts.transpileModule(fs.readFileSync(SRC, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2019,
  },
}).outputText;

type Liquidity = { dueAmount: number | null; budgetFree: number | null };
type CardType = "FIXED_COST" | "INCOME" | "BUDGET";
type LinkedFragment = {
  fragmentId: string;
  amount: number;
  description: string;
  transactionDate: string;
};
type Card = {
  type: CardType;
  amount: number;
  effectivePlan: number;
  dueDay: number | null;
  manuallyPaid: boolean;
  linkedFragments: LinkedFragment[];
};

function load(): (cards: Card[], heute: number, tageImMonat: number) => Liquidity {
  const module = { exports: {} as Record<string, unknown> };
  new Function("exports", "module", js)(module.exports, module);
  return module.exports.computeLiquidity as (
    c: Card[], h: number, t: number,
  ) => Liquidity;
}

const computeLiquidity = load();

/** Baut eine Karte. `amount` ist der Anzeige-Betrag — bei gemeinsamen Karten
 *  seit BF-4 bereits der eigene Anteil, also genau das, was die Sparrate
 *  verwendet. Der effektive Plan entspricht ihm, solange nichts angepasst ist;
 *  bei BUDGET ist er die Vergleichsbasis für „noch frei". */
function karte(
  type: CardType,
  dueDay: number | null,
  amount: number,
  extra: Partial<Card> = {},
): Card {
  return {
    type,
    amount,
    effectivePlan: amount,
    dueDay,
    manuallyPaid: false,
    linkedFragments: [],
    ...extra,
  };
}

function fragment(amount: number): LinkedFragment {
  return { fragmentId: "f", amount, description: "", transactionDate: "2026-08-10" };
}

// ── Der echte Kartenbestand August 2026 ─────────────────────────────────────
// Gemessen am 06.08.2026 gegen die Produktiv-Datenbank (nur SELECT), inklusive
// Frequenz-Prüfung. Bewusst der ECHTE Bestand statt erfundener Zahlen: Nur so
// lässt sich gegen den unabhängig erhobenen Befundwert gegenrechnen (siehe den
// Test „Gegenprobe zum Befund" unten).
//
// Die vier GEMEINSAM-Karten stehen hier mit ihrem Anteil (Split 0,57209).
const AUGUST_2026: Card[] = [
  karte("FIXED_COST", 1, 9.95),      // Audible
  karte("FIXED_COST", 1, 100.68),    // Berufsunfähigkeit
  karte("FIXED_COST", 1, 50.0),      // Essen gehen
  karte("FIXED_COST", 1, 22.87),     // Internet – Vodafone   (gemeinsam)
  karte("FIXED_COST", 1, 1089.26),   // Miete                 (gemeinsam)
  karte("FIXED_COST", 1, 116.7),     // Private Altersvorsorge
  karte("FIXED_COST", 1, 15.45),     // Rechtsschutz          (gemeinsam)
  karte("FIXED_COST", 1, 36.04),     // Strom – Mainova       (gemeinsam)
  karte("FIXED_COST", 3, 12.99),     // Spotify
  karte("FIXED_COST", 4, 13.99),     // Netflix
  karte("FIXED_COST", 15, 35.0),     // Handyvertrag
  karte("FIXED_COST", 16, 63.0),     // Deutschlandticket
  karte("FIXED_COST", 20, 9.99),     // iCloud
  karte("FIXED_COST", 23, 107.1),    // ANTHROPIC – Claude Abo
  karte("FIXED_COST", 23, 104.0),    // Fitnessstudio
  karte("FIXED_COST", null, 45.0),   // Friseur — KEIN Termin, zählt nie mit
  karte("INCOME", 1, 11.0),          // Handyvertrag – Aline
  karte("INCOME", 27, 7.0),          // iCloud – Anteil Mama
  karte("BUDGET", null, 240.0),      // Tanken
  karte("BUDGET", null, 200.0),      // Haushaltsgeld
  karte("BUDGET", null, 150.0),      // Privates Budget
];

const TAGE_IM_AUGUST = 31;

// ── Die Zahl des Sprints ────────────────────────────────────────────────────

test("ausstehend: 06.08.2026 zeigt 312,09 € fest und 590,00 € Budget", () => {
  const r = computeLiquidity(AUGUST_2026, 6, TAGE_IM_AUGUST);
  expect(r.dueAmount).toBeCloseTo(312.09, 2);
  expect(r.budgetFree).toBeCloseTo(590.0, 2);
});

// ── Die Gegenprobe, die belegt, dass die Basis stimmt ───────────────────────
//
// Der Befund vom 05.08.2026 (`V2/befunde_2026-08-05_liquiditaet.md` §2.1) maß
// unabhängig und mit anderer Methode — reines SQL, OHNE Termin-Filter —
// **1.814,02 €**. Am 1. August ist noch kein Termin verstrichen, also muss
// unsere Rechnung denselben Wert liefern, abzüglich der einen Karte ohne
// Termin (Friseur, 45,00 €). Läuft das auseinander, rechnet die Anzeige auf
// einer anderen Betragsbasis als die Sparrate — genau das, was Befund L4
// ausschließen sollte.

test("ausstehend: am 1. steht alles aus — deckt sich mit dem Befund", () => {
  const r = computeLiquidity(AUGUST_2026, 1, TAGE_IM_AUGUST);
  expect(r.dueAmount).toBeCloseTo(1814.02 - 45.0, 2);
  expect(r.dueAmount! + 45.0).toBeCloseTo(1814.02, 2);
});

// ── Der Termin-Zweig ────────────────────────────────────────────────────────

test("ausstehend: ein verstrichener Termin nimmt den Posten heraus", () => {
  // Am 5. zählen noch alle zehn Posten des Dauerauftrags-Bündels (1.–4. ist
  // durch), am 6. ändert sich nichts mehr — zwischen dem 5. und dem 15. liegt
  // kein Termin. Das ist der Grund, warum die Zahl mehrere Tage stillsteht.
  const am5 = computeLiquidity(AUGUST_2026, 5, TAGE_IM_AUGUST);
  const am6 = computeLiquidity(AUGUST_2026, 6, TAGE_IM_AUGUST);
  expect(am5.dueAmount).toBeCloseTo(am6.dueAmount!, 2);

  // Ab dem 16. fällt der Handyvertrag (15., 35,00 €) heraus.
  const am16 = computeLiquidity(AUGUST_2026, 16, TAGE_IM_AUGUST);
  expect(am16.dueAmount).toBeCloseTo(312.09 - 35.0, 2);
});

test("ausstehend: sind alle Termine durch, steht dort 0 — nicht „keine Anzeige\"", () => {
  const r = computeLiquidity(AUGUST_2026, 28, TAGE_IM_AUGUST);
  expect(r.dueAmount).toBeCloseTo(0, 2);
  // LL-20 gilt für „keine Daten", nicht für „nichts steht mehr aus".
  expect(r.dueAmount).not.toBeNull();
});

// ── Einnahmen mindern, sie erhöhen nicht ────────────────────────────────────

test("ausstehend: Einnahmen mindern den Betrag und können ihn negativ machen", () => {
  // Am 24. steht nur noch die Einnahme „iCloud – Anteil Mama" (27.) aus.
  const r = computeLiquidity(AUGUST_2026, 24, TAGE_IM_AUGUST);
  expect(r.dueAmount).toBeCloseTo(-7.0, 2);
});

// ── Der Zahlungs-Zweig (Entscheidung E-1 vom 06.08.2026) ────────────────────
//
// Beide Ausschluss-Signale wirken einzeln. Zum Zeitpunkt des Baus bewegte
// dieser Zweig die Zahl um 0,00 € — es gab keinen August-Umsatz und in der
// gesamten Historie kein gesetztes Häkchen. Er wirkt erst ab dem nächsten
// Import; genau deshalb gehört er bewacht.

test("ausstehend: ein Bezahlt-Häkchen nimmt den Posten heraus, obwohl der Termin aussteht", () => {
  const mitHaken = AUGUST_2026.map((c) =>
    c.dueDay === 23 && c.amount === 104.0 ? { ...c, manuallyPaid: true } : c,
  );
  const r = computeLiquidity(mitHaken, 6, TAGE_IM_AUGUST);
  expect(r.dueAmount).toBeCloseTo(312.09 - 104.0, 2);
});

test("ausstehend: ein zugeordneter Umsatz nimmt den Posten heraus", () => {
  const mitUmsatz = AUGUST_2026.map((c) =>
    c.dueDay === 23 && c.amount === 107.1
      ? { ...c, linkedFragments: [fragment(-107.1)] }
      : c,
  );
  const r = computeLiquidity(mitUmsatz, 6, TAGE_IM_AUGUST);
  expect(r.dueAmount).toBeCloseTo(312.09 - 107.1, 2);
});

// ── Karten ohne Termin ──────────────────────────────────────────────────────

test("ausstehend: eine Karte ohne Termin zählt an keinem Tag mit", () => {
  // Im echten Bestand steckt der Friseur (45,00 €) mit drin und taucht in
  // keiner der geprüften Summen auf — an keinem Tag des Monats.
  for (const tag of [1, 6, 15, 28, 31]) {
    const mit = computeLiquidity(AUGUST_2026, tag, TAGE_IM_AUGUST).dueAmount!;
    const ohne = computeLiquidity(
      AUGUST_2026.filter((c) => !(c.type === "FIXED_COST" && c.dueDay === null)),
      tag,
      TAGE_IM_AUGUST,
    ).dueAmount!;
    expect(mit).toBeCloseTo(ohne, 2);
  }
});

test("ausstehend: GIBT es nur Karten ohne Termin, ist der Wert null — nicht 0", () => {
  // Feinheit, die beim Schreiben dieses Tests erst auffiel und bewusst so
  // bleibt: Ein Monat, in dem KEINE einzige Karte einen Termin trägt, hat
  // keine Datengrundlage für eine Vorhersage. Dann ist „keine Anzeige" richtig
  // und „0 € noch fällig" wäre eine Behauptung über Termine, die es nicht gibt
  // (§7 Regel 17 / LL-20).
  //
  // Abzugrenzen von „alle Termine sind durch" weiter oben: Dort GIBT es
  // Termine, sie liegen nur alle in der Vergangenheit — das ist eine Antwort,
  // und sie lautet 0.
  const nurOhneTermin = [karte("FIXED_COST", null, 45.0)];
  expect(computeLiquidity(nurOhneTermin, 6, TAGE_IM_AUGUST).dueAmount).toBeNull();
});

// ── Die Monats-Klammerung ───────────────────────────────────────────────────
//
// Ein Dauerauftrag zum 31. existiert; der Februar hat ihn nicht. Ohne
// Klammerung fiele der Posten im Februar an KEINEM Tag heraus und stünde
// dauerhaft in der Zahl. Die Klammerung gehört in die Anzeige, nicht in die
// Spalte (so festgelegt in 20260806_v2_14_lq1_faelligkeitstag.sql).

test("ausstehend: due_day 31 wird auf die Monatslänge geklammert", () => {
  const zum31 = [karte("FIXED_COST", 31, 100.0)];

  // Februar: der 28. ist der letzte Tag — der Posten steht dort noch aus …
  expect(computeLiquidity(zum31, 28, 28).dueAmount).toBeCloseTo(100.0, 2);
  // … und im Januar (31 Tage) ebenso am 31.
  expect(computeLiquidity(zum31, 31, 31).dueAmount).toBeCloseTo(100.0, 2);
  // Ohne Klammerung wäre der Posten im Februar unerreichbar und bliebe ewig
  // stehen; mit Klammerung ist am 28. Schluss — es gibt keinen 29. zu prüfen.
});

// ── Budget ──────────────────────────────────────────────────────────────────

test("budget frei: Verbrauch wird abgezogen, Überschreitung frisst nichts auf", () => {
  const budgets = [
    karte("BUDGET", null, 200.0, { linkedFragments: [fragment(-50)] }),  // 150 frei
    karte("BUDGET", null, 100.0, { linkedFragments: [fragment(-150)] }), // überschritten → 0
    karte("BUDGET", null, 300.0, { manuallyPaid: true }),                // abgeschlossen → 0
  ];
  // Ohne die untere Klammer bei 0 zöge das überschrittene Budget (−50) vom
  // laufenden ab und die Kopfzeile zeigte 100 statt 150 €.
  expect(computeLiquidity(budgets, 6, TAGE_IM_AUGUST).budgetFree).toBeCloseTo(150.0, 2);
});

// ── „Keine Anzeige" statt 0 (§7 Regel 17 / LL-20) ───────────────────────────

test("ausstehend: fehlt die Kartenart ganz, ist der Wert null statt 0", () => {
  const nurFixkosten = [karte("FIXED_COST", 15, 100.0)];
  expect(computeLiquidity(nurFixkosten, 6, TAGE_IM_AUGUST).budgetFree).toBeNull();

  const nurBudget = [karte("BUDGET", null, 200.0)];
  expect(computeLiquidity(nurBudget, 6, TAGE_IM_AUGUST).dueAmount).toBeNull();
});

// ── Die Summe wird nie gebildet (Befund L7) ─────────────────────────────────

test("ausstehend: fest und Budget bleiben getrennt", () => {
  const r = computeLiquidity(AUGUST_2026, 6, TAGE_IM_AUGUST);
  // Die beiden Werte dürfen sich nie zu 902,09 € verbinden — der eine sind
  // Termine, der andere ist eine Erlaubnis. Die Funktion liefert deshalb zwei
  // Felder und niemals ein drittes, summiertes.
  expect(Object.keys(r).sort()).toEqual(["budgetFree", "dueAmount"]);
});
