import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// Regressions-Wächter über den Tab „Verlauf" auf /mobil (v3-03).
// Prüft die ECHTE Quelldatei — transpiliert und ausgeführt, kein Nachbau.
//
// WARUM: Kein Bruch hier macht eine Zahl falsch. Anker, Prüfsummen und beide
// Invarianten blieben grün — ein Defizit-Monat stände nur als Stummel neben
// hohen Balken, die Planlinie liefe aus dem Bild, oder ein Monat ohne Wert
// zählte als 0 € in den Durchschnitt (LL-20, LL-26).
//
// Quelle der Erwartungen: Handoff-README §6, v3 Regel 2, Briefing v3-03 B5–B7.

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

type Ton = "neutral" | "teal" | "rot";

const r = laden("src/components/mobil/verlauf/regeln.ts") as {
  MONATE: number;
  KOPF_RECHTS: string;
  balkenHoehe: (wert: number, maxBetrag: number, feldHoehe?: number) => number;
  skalenMaximum: (werte: (number | null)[], plaene: (number | null)[]) => number;
  balkenTon: (wert: number | null, plan: number | null) => Ton;
  durchschnitt: (werte: (number | null)[]) => number | null;
  detailUnterzeile: (z: {
    ist: number | null;
    plan: number | null;
    abstandText: string;
  }) => { text: string; ton: Ton };
  detailTon: (ist: number | null, plan: number | null) => Ton;
};

test.describe("Verlauf auf /mobil — die Skala", () => {
  test("der Verlauf zeigt sechs Monate", () => {
    expect(r.MONATE).toBe(6);
    expect(r.KOPF_RECHTS).toBe("Sparrate, 6 Monate");
  });

  test("ein Defizit ist ein großer Ausschlag, kein kleiner", () => {
    // Im Betragsraum gemessen: −987,21 € ist der größte Ausschlag unter diesen
    // sechs Monaten und muss den höchsten Balken bekommen. Würde das Vorzeichen
    // in die Höhe eingehen, wäre der teuerste Monat des Jahres der
    // unauffälligste.
    const werte = [-987.21, 169.35, 682.5, 87.55, 894.6, 341.36];
    const max = r.skalenMaximum(werte, [null]);
    expect(max).toBeCloseTo(987.21, 2);
    const hoehen = werte.map((v) => r.balkenHoehe(v, max, 150));
    expect(Math.max(...hoehen)).toBeCloseTo(150, 5);
    expect(hoehen[0]).toBeCloseTo(150, 5);
  });

  test("die Pläne gehören in die Skala, sonst läuft ihre Linie aus dem Bild", () => {
    const werte = [100, 200, 300];
    const plaene = [100, 200, 3800];
    expect(r.skalenMaximum(werte, plaene)).toBe(3800);
    // Mit dem größten Plan als Maximum liegt seine Linie genau am oberen Rand,
    // nicht darüber.
    expect(r.balkenHoehe(3800, 3800, 150)).toBeCloseTo(150, 5);
  });

  test("ein Monat ohne Ausschlag bekommt einen Strich, keine Lücke", () => {
    // Null ist ein Messwert. Eine Lücke sähe aus wie ein fehlender Monat, und
    // das ist etwas anderes (LL-20).
    expect(r.balkenHoehe(0, 2000, 150)).toBe(4);
  });

  test("ohne jeden Wert wird nicht durch null geteilt", () => {
    expect(r.skalenMaximum([null, null], [null])).toBe(0);
    const h = r.balkenHoehe(500, 0, 150);
    expect(Number.isFinite(h)).toBe(true);
    expect(h).toBe(4);
  });
});

test.describe("Verlauf auf /mobil — die Farben", () => {
  test("eine negative Sparrate ist rot", () => {
    expect(r.balkenTon(-239.1, -96.4)).toBe("rot");
    expect(r.balkenTon(-8.84, 21.44)).toBe("rot");
  });

  test("auf oder über Plan ist türkis", () => {
    expect(r.balkenTon(1753.14, 1729.58)).toBe("teal");
    expect(r.balkenTon(1766.56, 1766.56)).toBe("teal");
  });

  test("etwas unter Plan ist neutral, nicht rot", () => {
    // v3 Regel 2: Rot bedeutet Abweichung, und „etwas unter Plan" ist der
    // Normalfall der meisten Monate.
    expect(r.balkenTon(1613.11, 1695.09)).toBe("neutral");
  });

  test("ohne Wert gibt es keine Farbaussage", () => {
    expect(r.balkenTon(null, 1000)).toBe("neutral");
  });

  test("Zahl und Säule behaupten nie Verschiedenes", () => {
    for (const [ist, plan] of [
      [-239.1, -96.4],
      [1753.14, 1729.58],
      [1613.11, 1695.09],
    ] as [number, number][]) {
      expect(r.detailTon(ist, plan)).toBe(r.balkenTon(ist, plan));
    }
  });
});

test.describe("Verlauf auf /mobil — der Durchschnitt", () => {
  test("Monate ohne Wert zählen nicht in den Nenner", () => {
    // „Kein Wert" ist nicht „0 €" (LL-20). Zählte der leere Monat mit, sänke
    // der Durchschnitt, ohne dass ein einziger Monat schlechter geworden wäre.
    const mitLuecke = r.durchschnitt([1000, null, 2000]);
    expect(mitLuecke).toBeCloseTo(1500, 5);
    expect(r.durchschnitt([1000, 0, 2000])).toBeCloseTo(1000, 5);
  });

  test("ohne jeden Wert gibt es keinen Durchschnitt, nicht null Euro", () => {
    expect(r.durchschnitt([null, null])).toBeNull();
    expect(r.durchschnitt([])).toBeNull();
  });

  test("negative Monate ziehen den Durchschnitt herunter, wie sie sollen", () => {
    expect(r.durchschnitt([-987.21, 1813.37])).toBeCloseTo(413.08, 2);
  });
});

test.describe("Verlauf auf /mobil — die Detailkarte", () => {
  test("ein Defizit heißt Defizit, auch wenn es über Plan liegt", () => {
    // Juli 2026 ist der echte Fall: Ist −8,84 € gegen Plan +21,44 €. Der Monat
    // liegt unter Plan UND im Minus. Und selbst wenn er über Plan läge, bliebe
    // es ein Minus — das zu verschweigen wäre die teuerste Höflichkeit der App.
    const u = r.detailUnterzeile({ ist: -8.84, plan: -96.4, abstandText: "87,56 €" });
    expect(u.text).toBe("Defizit — 87,56 € gegen Plan");
    expect(u.ton).toBe("rot");
    expect(u.text).not.toContain("über Plan");
  });

  test("über Plan ist türkis und trägt das Wort", () => {
    const u = r.detailUnterzeile({ ist: 1753.14, plan: 1729.58, abstandText: "23,56 €" });
    expect(u.text).toBe("23,56 € über Plan");
    expect(u.ton).toBe("teal");
  });

  test("unter Plan ist neutral, nicht rot", () => {
    const u = r.detailUnterzeile({ ist: 1613.11, plan: 1695.09, abstandText: "81,98 €" });
    expect(u.text).toBe("81,98 € unter Plan");
    expect(u.ton).toBe("neutral");
  });

  test("genau auf Plan zählt als über Plan, nicht als darunter", () => {
    const u = r.detailUnterzeile({ ist: 1766.56, plan: 1766.56, abstandText: "0,00 €" });
    expect(u.text).toBe("0,00 € über Plan");
    expect(u.ton).toBe("teal");
  });

  test("fehlende Werte behaupten nichts", () => {
    expect(r.detailUnterzeile({ ist: null, plan: 1000, abstandText: "0,00 €" }).text).toBe(
      "keine Angabe für diesen Monat",
    );
    expect(r.detailUnterzeile({ ist: 1000, plan: null, abstandText: "0,00 €" }).text).toBe(
      "kein Plan für diesen Monat",
    );
  });
});
