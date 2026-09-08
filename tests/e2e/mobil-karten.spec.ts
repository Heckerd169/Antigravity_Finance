import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// Regressions-Wächter über den Tab „Karten" auf /mobil (v3-03).
// Prüft die ECHTE Quelldatei — transpiliert und ausgeführt, kein Nachbau.
//
// WARUM: Kein Bruch hier macht eine Zahl falsch. Anker, Prüfsummen und beide
// Invarianten blieben grün — eine laufende Karte trüge nur einen roten Punkt,
// eine Fixkosten-Karte einen halb gefüllten Balken, oder „überschritten"
// erschiene an einem Kartentyp, den es dort nicht gibt (LL-12, LL-26).
//
// Quelle der Erwartungen: Handoff-README §5, v3 Regel 2 („Rot bedeutet
// ausschließlich Abweichung"), Design-Doku §4.3.

const REPO = path.join(__dirname, "..", "..");

function laden(rel: string): Record<string, unknown> {
  const src = fs.readFileSync(path.join(REPO, rel), "utf8");
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
  }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function("exports", "module", js)(mod.exports, mod);
  return mod.exports;
}

type Zustand =
  | { typ: "FIXED_COST"; zustand: "ghost" | "paid" | "open" }
  | { typ: "INCOME"; zustand: "ghost" | "received" | "expected" }
  | { typ: "BUDGET"; zustand: "ghost" | "done" | "over" | "running" };

type Filter = "alle" | "fixkosten" | "budget" | "einmalig" | "einnahmen";

const r = laden("src/components/mobil/karten/regeln.ts") as {
  FILTER_REIHENFOLGE: readonly Filter[];
  filterTitel: (f: Filter) => string;
  punktFarbe: (k: Zustand) => "neutral" | "teal" | "rot";
  statusWort: (k: Zustand, buchungen: number) => string;
  typWort: (t: "FIXED_COST" | "BUDGET" | "INCOME") => string;
  balkenAnteil: (z: { zustand: Zustand; verbraucht: number; plan: number }) => number;
  balkenFarbe: (k: Zustand, anteil: number) => "neutral" | "teal" | "rot";
  rechtsUnten: (k: Zustand, planText: string) => string;
  KEINE_BUCHUNG: string;
};

/** Alle Zustände aller drei Typen — die Grundlage der Vollständigkeits-Prüfungen. */
const ALLE: Zustand[] = [
  { typ: "FIXED_COST", zustand: "ghost" },
  { typ: "FIXED_COST", zustand: "paid" },
  { typ: "FIXED_COST", zustand: "open" },
  { typ: "INCOME", zustand: "ghost" },
  { typ: "INCOME", zustand: "received" },
  { typ: "INCOME", zustand: "expected" },
  { typ: "BUDGET", zustand: "ghost" },
  { typ: "BUDGET", zustand: "done" },
  { typ: "BUDGET", zustand: "over" },
  { typ: "BUDGET", zustand: "running" },
];

test.describe("Karten auf /mobil — Rot bedeutet ausschließlich Abweichung", () => {
  test("nur „überschritten“ punktet rot — sonst nichts", () => {
    const rote = ALLE.filter((k) => r.punktFarbe(k) === "rot");
    expect(rote).toEqual([{ typ: "BUDGET", zustand: "over" }]);
  });

  test("„offen“ und „laufend“ sind neutral, nicht rot", () => {
    // v3 Regel 2 in ihrer teuersten Form: Beide sind der Normalzustand der
    // meisten Karten an den meisten Tagen. Rot wäre ein Daueralarm.
    expect(r.punktFarbe({ typ: "FIXED_COST", zustand: "open" })).toBe("neutral");
    expect(r.punktFarbe({ typ: "BUDGET", zustand: "running" })).toBe("neutral");
    expect(r.punktFarbe({ typ: "INCOME", zustand: "expected" })).toBe("neutral");
  });

  test("erledigt punktet türkis — bei allen drei Typen", () => {
    expect(r.punktFarbe({ typ: "FIXED_COST", zustand: "paid" })).toBe("teal");
    expect(r.punktFarbe({ typ: "INCOME", zustand: "received" })).toBe("teal");
    expect(r.punktFarbe({ typ: "BUDGET", zustand: "done" })).toBe("teal");
  });
});

test.describe("Karten auf /mobil — das Statuswort", () => {
  test("jeder Zustand jedes Typs hat ein Wort, keiner fällt durch", () => {
    for (const k of ALLE) {
      const wort = r.statusWort(k, 0);
      expect(wort, `${k.typ}/${k.zustand}`).toBeTruthy();
      expect(typeof wort).toBe("string");
    }
  });

  test("„überschritten“ gibt es NUR bei Budget", () => {
    // LL-12: Der Zustand existiert bei Fixkosten und Einnahmen nicht. Ein Wort,
    // das dort auftauchte, wäre eine Erwartung, die die Logik nie erfüllt.
    const mitUeberschritten = ALLE.filter(
      (k) => r.statusWort(k, 0) === "überschritten",
    );
    expect(mitUeberschritten).toEqual([{ typ: "BUDGET", zustand: "over" }]);
  });

  test("eine laufende Budget-Karte zählt ihre Buchungen", () => {
    const k: Zustand = { typ: "BUDGET", zustand: "running" };
    expect(r.statusWort(k, 0)).toBe("offen");
    expect(r.statusWort(k, 1)).toBe("1 Buchung");
    expect(r.statusWort(k, 3)).toBe("3 Buchungen");
  });

  test("ein Zukunftsmonat behauptet weder Erledigung noch offene Arbeit", () => {
    for (const typ of ["FIXED_COST", "INCOME", "BUDGET"] as const) {
      expect(r.statusWort({ typ, zustand: "ghost" } as Zustand, 0)).toBe("geplant");
    }
  });

  test("der Typ steht auf Deutsch davor", () => {
    expect(r.typWort("FIXED_COST")).toBe("Fixkosten");
    expect(r.typWort("BUDGET")).toBe("Budget");
    expect(r.typWort("INCOME")).toBe("Einnahme");
  });
});

test.describe("Karten auf /mobil — der Balken", () => {
  test("eine Budget-Karte füllt sich anteilig", () => {
    const zustand: Zustand = { typ: "BUDGET", zustand: "running" };
    expect(r.balkenAnteil({ zustand, verbraucht: 120, plan: 240 })).toBeCloseTo(0.5, 5);
    expect(r.balkenAnteil({ zustand, verbraucht: 0, plan: 240 })).toBe(0);
  });

  test("über dem Plan bleibt der Balken voll, statt überzulaufen", () => {
    const zustand: Zustand = { typ: "BUDGET", zustand: "over" };
    expect(r.balkenAnteil({ zustand, verbraucht: 400, plan: 240 })).toBe(1);
  });

  test("ein Plan von 0 € teilt nicht durch null", () => {
    const zustand: Zustand = { typ: "BUDGET", zustand: "running" };
    const anteil = r.balkenAnteil({ zustand, verbraucht: 50, plan: 0 });
    expect(Number.isFinite(anteil)).toBe(true);
    expect(anteil).toBe(0);
  });

  test("Fixkosten und Einnahmen kennen kein Teilweise", () => {
    // Sie sind bezahlt oder nicht. Ein Balken bei 60 % behauptete einen
    // Verlauf, den es dort nicht gibt.
    expect(
      r.balkenAnteil({
        zustand: { typ: "FIXED_COST", zustand: "open" },
        verbraucht: 30,
        plan: 100,
      }),
    ).toBe(0);
    expect(
      r.balkenAnteil({
        zustand: { typ: "FIXED_COST", zustand: "paid" },
        verbraucht: 30,
        plan: 100,
      }),
    ).toBe(1);
    expect(
      r.balkenAnteil({
        zustand: { typ: "INCOME", zustand: "received" },
        verbraucht: 0,
        plan: 4000,
      }),
    ).toBe(1);
  });

  test("die Balkenfarbe folgt dem Punkt", () => {
    expect(r.balkenFarbe({ typ: "BUDGET", zustand: "over" }, 1)).toBe("rot");
    expect(r.balkenFarbe({ typ: "FIXED_COST", zustand: "paid" }, 1)).toBe("teal");
    expect(r.balkenFarbe({ typ: "BUDGET", zustand: "running" }, 0.4)).toBe("neutral");
  });

  test("eine laufende Karte, die den Plan genau trifft, ist fertig — nicht rot", () => {
    expect(r.balkenFarbe({ typ: "BUDGET", zustand: "running" }, 1)).toBe("teal");
  });
});

test.describe("Karten auf /mobil — die rechte Spalte und die Filter", () => {
  test("Ausgaben zeigen den Plan, Einnahmen einen Zustand", () => {
    expect(r.rechtsUnten({ typ: "BUDGET", zustand: "running" }, "240,00 €")).toBe(
      "von 240,00 €",
    );
    expect(r.rechtsUnten({ typ: "FIXED_COST", zustand: "open" }, "45,00 €")).toBe(
      "von 45,00 €",
    );
    expect(r.rechtsUnten({ typ: "INCOME", zustand: "expected" }, "4.165,11 €")).toBe(
      "erwartet",
    );
    expect(r.rechtsUnten({ typ: "INCOME", zustand: "received" }, "4.165,11 €")).toBe(
      "eingegangen",
    );
  });

  test("bei Einnahmen taucht der Betrag rechts NICHT auf", () => {
    // Record #11: Einnahmen tragen kein „frei" und keinen Rest, sondern den
    // Zustand — sonst läse sich eine erwartete Einnahme wie ein Restbudget.
    expect(r.rechtsUnten({ typ: "INCOME", zustand: "expected" }, "4.165,11 €")).not.toContain(
      "4.165",
    );
  });

  test("die fünf Filter stehen in der Reihenfolge des Entwurfs", () => {
    expect([...r.FILTER_REIHENFOLGE]).toEqual([
      "alle",
      "fixkosten",
      "budget",
      "einmalig",
      "einnahmen",
    ]);
    expect(r.FILTER_REIHENFOLGE.map((f) => r.filterTitel(f))).toEqual([
      "Alle",
      "Fixkosten",
      "Budget",
      "Einmalig",
      "Einnahmen",
    ]);
  });

  test("der leere Aufklapp-Bereich sagt, dass er leer ist", () => {
    expect(r.KEINE_BUCHUNG).toBe("Noch keine Buchung in diesem Monat");
  });
});
