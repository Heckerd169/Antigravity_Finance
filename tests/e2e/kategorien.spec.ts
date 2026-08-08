import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// Regressions-Wächter für die Gruppierung des Karussells (v2-17, `KAT-2`).
//
// Prüft die ECHTEN Quelldateien — transpiliert und ausgeführt, kein Nachbau.
// Muster übernommen von liquidity.spec.ts (v2-15) und ring-subline.spec.ts
// (v2-12). Ein Nachbau driftet vom Original ab und gibt falsche Sicherheit.
//
// Warum ausgerechnet diese Regeln bewacht werden: Sie sind allesamt
// **unsichtbar falsch**, wenn sie kippen. Ein Ordner, der im Januar erscheint,
// obwohl er leer ist, sieht aus wie ein Ordner. Ein „erledigt" im
// Zukunftsmonat sieht aus wie eine korrekte Aussage. Genau diese Fehlerklasse
// hat die Befunde vom 04.08.2026 erzeugt.
//
// Der Test braucht weder Zugangsdaten noch Live-Daten noch den dev-Server.

const SRC_DIR = path.join(__dirname, "..", "..", "src");

function transpile(rel: string): string {
  return ts.transpileModule(fs.readFileSync(path.join(SRC_DIR, rel), "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
    },
  }).outputText;
}

type CardType = "FIXED_COST" | "INCOME" | "BUDGET";

type LinkedFragment = {
  fragmentId: string;
  amount: number;
  description: string;
  transactionDate: string;
};

type Card = {
  id: string;
  name: string;
  type: CardType;
  categoryId: string | null;
  amount: number;
  effectivePlan: number;
  manuallyPaid: boolean;
  linkedFragments: LinkedFragment[];
};

type Category = { id: string; name: string; sortOrder: number };

type Amount = {
  key: "INCOME" | "CATEGORY" | "UNCATEGORIZED";
  category_id: string | null;
  name: string;
  sort_order: number;
  amount: number;
  posten: number;
};

type Group = {
  kind: "INCOME" | "CATEGORY" | "UNCATEGORIZED";
  key: string;
  categoryId: string | null;
  name: string;
  sortOrder: number;
  amount: number | null;
  posten: number;
  offen: number | null;
  isGhost: boolean;
  cards: Card[];
};

type BuildArgs = {
  cards: Card[];
  categories: Category[];
  amounts: Amount[];
  isFuture: boolean;
  isPast: boolean;
};

/** Lädt `category-groups.ts` samt seiner einen echten Abhängigkeit
 *  (`card-state.ts`). Der `require`-Schim reicht das transpilierte Modul
 *  durch — so laufen die ZUSTANDS-Regeln der Karten im Test mit, statt
 *  nachgebaut zu werden. `@/lib/rpc` wird nur als Typ importiert und ist nach
 *  dem Transpilieren verschwunden. */
function load(): (args: BuildArgs) => Group[] {
  const cardState = { exports: {} as Record<string, unknown> };
  new Function("exports", "module", transpile("components/cards/card-state.ts"))(
    cardState.exports,
    cardState,
  );

  const mod = { exports: {} as Record<string, unknown> };
  const requireShim = (id: string) => {
    if (id.includes("card-state")) return cardState.exports;
    return {};
  };
  new Function(
    "exports",
    "module",
    "require",
    transpile("components/interaction-zone/category-groups.ts"),
  )(mod.exports, mod, requireShim);

  return mod.exports.buildCategoryGroups as (a: BuildArgs) => Group[];
}

const buildCategoryGroups = load();

// ── Hilfen ──────────────────────────────────────────────────────────────────

let idCounter = 0;

function karte(
  type: CardType,
  categoryId: string | null,
  extra: Partial<Card> = {},
): Card {
  idCounter += 1;
  return {
    id: `card-${idCounter}`,
    name: `Karte ${idCounter}`,
    type,
    categoryId,
    amount: 100,
    effectivePlan: 100,
    manuallyPaid: false,
    linkedFragments: [],
    ...extra,
  };
}

function fragment(amount: number): LinkedFragment {
  return {
    fragmentId: "f",
    amount,
    description: "x",
    transactionDate: "2026-07-01",
  };
}

function betrag(
  key: Amount["key"],
  categoryId: string | null,
  amount: number,
): Amount {
  return {
    key,
    category_id: categoryId,
    name: key,
    sort_order: 0,
    amount,
    posten: 1,
  };
}

const WOHNEN: Category = { id: "cat-w", name: "Wohnen", sortOrder: 10 };
const HOBBY: Category = { id: "cat-h", name: "Hobby", sortOrder: 60 };
const URLAUB: Category = { id: "cat-u", name: "Urlaub", sortOrder: 70 };
const ALLE = [WOHNEN, HOBBY, URLAUB];

function bauen(over: Partial<BuildArgs> = {}): Group[] {
  return buildCategoryGroups({
    cards: [],
    categories: ALLE,
    amounts: [],
    isFuture: false,
    isPast: false,
    ...over,
  });
}

// ── A8 · Sichtbarkeit ───────────────────────────────────────────────────────

test("ordner: ein leerer ordner erscheint im monat gar nicht (A8)", () => {
  const groups = bauen({
    cards: [karte("FIXED_COST", WOHNEN.id)],
    amounts: [betrag("CATEGORY", WOHNEN.id, -100)],
  });
  expect(groups.map((g) => g.name)).toEqual(["Wohnen"]);
});

test("ordner: der schnitt atmet mit dem jahr — urlaub nur, wenn urlaub ansteht", () => {
  const ohne = bauen({ cards: [karte("FIXED_COST", WOHNEN.id)] });
  const mit = bauen({
    cards: [karte("FIXED_COST", WOHNEN.id), karte("BUDGET", URLAUB.id)],
  });
  expect(ohne.some((g) => g.name === "Urlaub")).toBe(false);
  expect(mit.some((g) => g.name === "Urlaub")).toBe(true);
});

// ── A4 / B6 · Die beiden Sammelbecken ───────────────────────────────────────

test("einkommen: steht vorn und nur, wenn die datenbank einen betrag liefert (A4)", () => {
  const mit = bauen({
    cards: [karte("FIXED_COST", WOHNEN.id)],
    amounts: [betrag("INCOME", null, 4165.11), betrag("CATEGORY", WOHNEN.id, -100)],
  });
  expect(mit[0].kind).toBe("INCOME");
  expect(mit[0].name).toBe("Einkommen");
  expect(mit[0].amount).toBe(4165.11);

  // Ohne hinterlegtes Gehalt gibt es keine Sparrate — dann fehlt der Ordner,
  // statt 0 zu behaupten (LL-20).
  const ohne = bauen({ cards: [karte("FIXED_COST", WOHNEN.id)] });
  expect(ohne.some((g) => g.kind === "INCOME")).toBe(false);
});

test("ohne kategorie: steht hinten und nur, wenn er nicht leer ist (B6)", () => {
  const leer = bauen({ cards: [karte("FIXED_COST", WOHNEN.id)] });
  expect(leer.some((g) => g.kind === "UNCATEGORIZED")).toBe(false);

  const voll = bauen({
    cards: [karte("FIXED_COST", WOHNEN.id), karte("FIXED_COST", null)],
  });
  expect(voll[voll.length - 1].kind).toBe("UNCATEGORIZED");
  expect(voll[voll.length - 1].name).toBe("Ohne Kategorie");
});

test("ohne kategorie: steht auch hinter einem ordner mit hoher sortiernummer", () => {
  const groups = bauen({
    cards: [karte("BUDGET", URLAUB.id), karte("FIXED_COST", null)],
  });
  expect(groups.map((g) => g.kind)).toEqual(["CATEGORY", "UNCATEGORIZED"]);
});

// ── C2 · Reihenfolge ────────────────────────────────────────────────────────

test("reihenfolge: sortiernummer schlaegt alphabet (C2)", () => {
  const groups = bauen({
    cards: [
      karte("FIXED_COST", HOBBY.id),
      karte("FIXED_COST", WOHNEN.id),
      karte("BUDGET", URLAUB.id),
    ],
  });
  // Alphabetisch waere Hobby, Urlaub, Wohnen — die Nummern sagen etwas anderes.
  expect(groups.map((g) => g.name)).toEqual(["Wohnen", "Hobby", "Urlaub"]);
});

test("reihenfolge: bei gleicher nummer entscheidet der name, nicht der zufall", () => {
  const a: Category = { id: "a", name: "Zebra", sortOrder: 50 };
  const b: Category = { id: "b", name: "Amsel", sortOrder: 50 };
  const groups = buildCategoryGroups({
    cards: [karte("FIXED_COST", "a"), karte("FIXED_COST", "b")],
    categories: [a, b],
    amounts: [],
    isFuture: false,
    isPast: false,
  });
  expect(groups.map((g) => g.name)).toEqual(["Amsel", "Zebra"]);
});

// ── C3 · Zukunftsmonat ──────────────────────────────────────────────────────

test("zukunft: der ordner ist blass und meldet WEDER offen NOCH erledigt (C3)", () => {
  const groups = bauen({
    cards: [karte("FIXED_COST", WOHNEN.id)],
    isFuture: true,
  });
  expect(groups[0].isGhost).toBe(true);
  // `null` und nicht 0 — genau das ist der Punkt: 0 wuerde in der Kachel als
  // „erledigt" gelesen, und das waere eine Falschaussage ueber einen Monat, in
  // dem noch gar nichts faellig war.
  expect(groups[0].offen).toBeNull();
});

test("gegenwart: derselbe bestand meldet sehr wohl, was offen ist", () => {
  const groups = bauen({ cards: [karte("FIXED_COST", WOHNEN.id)] });
  expect(groups[0].isGhost).toBe(false);
  expect(groups[0].offen).toBe(1);
});

// ── Offen-Zählung: benutzt die ECHTE Zustands-Maschine der Karten ───────────

test("offen: bezahlt, erhalten und abgeschlossen zaehlen nicht mit", () => {
  const groups = bauen({
    cards: [
      karte("FIXED_COST", WOHNEN.id),                                   // offen
      karte("FIXED_COST", WOHNEN.id, { manuallyPaid: true }),           // bezahlt
      karte("FIXED_COST", WOHNEN.id, { linkedFragments: [fragment(-5)] }), // bezahlt
      karte("INCOME", WOHNEN.id),                                       // erwartet
      karte("INCOME", WOHNEN.id, { manuallyPaid: true }),               // erhalten
      karte("BUDGET", WOHNEN.id),                                       // laufend
      karte("BUDGET", WOHNEN.id, { manuallyPaid: true }),               // abgeschlossen
    ],
  });
  expect(groups[0].posten).toBe(7);
  expect(groups[0].offen).toBe(3);
});

test("offen: eine ueberschrittene budget-karte zaehlt als offen", () => {
  const groups = bauen({
    cards: [
      karte("BUDGET", WOHNEN.id, {
        effectivePlan: 100,
        linkedFragments: [fragment(-150)],
      }),
    ],
  });
  expect(groups[0].offen).toBe(1);
});

test("offen: in der vergangenheit ist eine unberuehrte budget-karte ghost, nicht offen", () => {
  const groups = bauen({
    cards: [karte("BUDGET", WOHNEN.id)],
    isPast: true,
  });
  expect(groups[0].offen).toBe(0);
});

// ── Beträge: zugeordnet, NIE gerechnet (Arbeitsregel 1) ─────────────────────

test("betraege: kommen unveraendert aus der datenbank, die gruppierung rechnet nicht", () => {
  const groups = bauen({
    cards: [karte("FIXED_COST", WOHNEN.id), karte("BUDGET", HOBBY.id)],
    amounts: [
      betrag("INCOME", null, 4165.11),
      // Bewusst NICHT die Summe der Kartenbetraege (100 + 100): Die Zahl kommt
      // aus `get_category_amounts_for_month` und traegt dort den
      // Rundungsrest (Record C1). Wuerde die Gruppierung selbst rechnen, kaeme
      // hier -100 heraus — und die Spalte ginge nicht mehr auf.
      betrag("CATEGORY", WOHNEN.id, -1148.18),
      betrag("CATEGORY", HOBBY.id, -369.14),
    ],
  });
  expect(groups.map((g) => g.amount)).toEqual([4165.11, -1148.18, -369.14]);
});

test("betraege: fehlt einer, bleibt die kachel ohne zahl statt eine zu erfinden", () => {
  const groups = bauen({
    cards: [karte("FIXED_COST", WOHNEN.id)],
    amounts: [],
  });
  expect(groups[0].amount).toBeNull();
});

test("betraege: der unsortiert-behaelter bekommt seinen eigenen wert", () => {
  const groups = bauen({
    cards: [karte("FIXED_COST", null)],
    amounts: [betrag("UNCATEGORIZED", null, -44.75)],
  });
  expect(groups[0].kind).toBe("UNCATEGORIZED");
  expect(groups[0].amount).toBe(-44.75);
});

// ── Gruppierung selbst ──────────────────────────────────────────────────────

test("gruppierung: zwei gleichnamige karten landen beide im selben ordner", () => {
  const groups = bauen({
    cards: [
      karte("FIXED_COST", HOBBY.id, { name: "Fahrradzubehör", amount: 34.69 }),
      karte("FIXED_COST", HOBBY.id, { name: "Fahrradzubehör", amount: 305.45 }),
    ],
  });
  expect(groups[0].posten).toBe(2);
  expect(groups[0].cards.map((c) => c.name)).toEqual([
    "Fahrradzubehör",
    "Fahrradzubehör",
  ]);
});

test("gruppierung: die reihenfolge der karten INNERHALB eines ordners bleibt erhalten", () => {
  const a = karte("FIXED_COST", WOHNEN.id, { name: "Internet" });
  const b = karte("FIXED_COST", WOHNEN.id, { name: "Miete" });
  const c = karte("FIXED_COST", WOHNEN.id, { name: "Strom" });
  const groups = bauen({ cards: [a, b, c] });
  expect(groups[0].cards.map((x) => x.name)).toEqual([
    "Internet",
    "Miete",
    "Strom",
  ]);
});

test("gruppierung: die kachel zaehlt genau die karten, die aufgeklappt darunter stehen", () => {
  const groups = bauen({
    cards: [
      karte("FIXED_COST", WOHNEN.id),
      karte("FIXED_COST", WOHNEN.id),
      karte("BUDGET", HOBBY.id),
      karte("FIXED_COST", null),
    ],
    amounts: [betrag("INCOME", null, 3000)],
  });
  for (const g of groups) {
    if (g.kind === "INCOME") continue;
    expect(g.posten).toBe(g.cards.length);
  }
});

test("einkommen: traegt keine karten — das netto ist keine karte", () => {
  const groups = bauen({
    cards: [karte("FIXED_COST", WOHNEN.id)],
    amounts: [betrag("INCOME", null, 3000)],
  });
  expect(groups[0].kind).toBe("INCOME");
  expect(groups[0].cards).toEqual([]);
  expect(groups[0].posten).toBe(1);
});

// ── B5 · Der Ordner trägt ein Vorzeichen, die Karte nicht ───────────────────

test("vorzeichen: der ordner zeigt die richtung, weil er keinen typ hat (B5)", () => {
  const mod = { exports: {} as Record<string, unknown> };
  new Function("exports", "module", transpile("lib/format.ts"))(
    mod.exports,
    mod,
  );
  const fmt = mod.exports.formatEuroSigned as (n: number) => string;

  // Typografisches Minus (U+2212), nicht der Bindestrich — dieselbe Wahl wie
  // im Ring und in `formatEuroRounded`.
  expect(fmt(-374.02)).toBe("−374,02 €");
  expect(fmt(69.51)).toBe("+69,51 €");
  expect(fmt(-1148.18)).toBe("−1.148,18 €");
  // Bei exakt 0 gibt es keine Richtung — also auch kein Vorzeichen.
  expect(fmt(0)).toBe("0,00 €");
});

test("schluessel: bleiben ueber monate stabil, damit der aufklapp-zustand ueberlebt (B7)", () => {
  const juli = bauen({
    cards: [karte("FIXED_COST", WOHNEN.id), karte("FIXED_COST", null)],
    amounts: [betrag("INCOME", null, 3000)],
  });
  const august = bauen({
    cards: [karte("FIXED_COST", WOHNEN.id), karte("FIXED_COST", null)],
    amounts: [betrag("INCOME", null, 3000)],
  });
  expect(juli.map((g) => g.key)).toEqual(august.map((g) => g.key));
  expect(juli.map((g) => g.key)).toEqual(["INCOME", WOHNEN.id, "UNCATEGORIZED"]);
});
