import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// Regressions-Wächter über die Regeln des Tabs „Zuordnen" auf /mobil (v3-02).
// Prüft die ECHTEN Quelldateien — transpiliert und ausgeführt, kein Nachbau
// (Muster ring-subline.spec.ts, suggestion-visibility.spec.ts, zuordnung.spec.ts).
//
// WARUM: Keine dieser Regeln macht eine Zahl falsch, wenn sie bricht. Anker,
// Prüfsummen und beide Invarianten blieben grün — der Nutzer sähe nur einen
// vorbelegten Zweifelsfall, ein falsches Label oder einen Stapel in falscher
// Reihenfolge (LL-26). Deshalb steht jede Regel einzeln prüfbar in
// `zustand.ts`, und dieser Test hält sie fest.
//
// Quelle der Erwartungen: Handoff-README §1, Design-Record 07.09.2026,
// Annahmen A1–A4 im Briefing v3-02.

const REPO = path.join(__dirname, "..", "..");

/** Transpiliert eine importfreie TS-Datei zu CommonJS und führt sie aus.
 *  `import type` wird dabei elidiert — die Datei braucht keine Requires. */
function laden(rel: string): Record<string, unknown> {
  const src = fs.readFileSync(path.join(REPO, rel), "utf8");
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
  }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function("exports", "module", js)(mod.exports, mod);
  return mod.exports;
}

type Kandidat = { cardId: string; name: string; treffer: number };
type Vorschlag = { cardId: string; name: string; treffer: number; konfidenz: number };
type Status = "laufend" | "vorbei" | "forecast";

const z = laden("src/components/mobil/zuordnen/zustand.ts") as {
  bestimmeZustand: (x: { vorschlag: Vorschlag | null; kandidaten: Kandidat[] }) => string;
  vorschlagsLabel: (v: { treffer: number; konfidenz: number }) => string;
  erstesWort: (s: string) => string;
  kandidatenLabel: (n: number, e: string) => string;
  uebernehmenText: (g: { name: string } | null) => string;
  monatsStatus: (ym: string, laufend: string) => Status;
  pillenWort: (s: Status) => string;
  nachbarUnterzeile: (n: { offen: number; status: Status }) => string;
  offenZeile: (x: { offen: number; gesamt: number }) => string;
  positionsZaehler: (x: { zugeordnet: number; gesamt: number }) => string;
  stapelRest: (x: { offen: number; vorschau: number }) => string;
  VORSCHAU_ZEILEN: number;
  leerText: (x: { status: Status; monatName: string; sparrateText: string | null }) => {
    titel: string;
    text: string;
  };
  stapelReihenfolge: <T extends { id: string }>(offene: T[], spaeter: string[]) => T[];
  toastZeile: (x: {
    delta: number;
    monatName: string;
    istEinnahme: boolean;
    deltaText: string;
  }) => { text: string; ton: string };
};

const d = laden("src/lib/description.ts") as {
  splitDescription: (raw: string) => { empfaenger: string; zweck: string | null };
};

const g = laden("src/components/mobil/zuordnen/gruppen.ts") as {
  GRUPPEN_REIHENFOLGE: string[];
  gruppenTitel: (x: string) => string;
  kartenGruppe: (typ: string, rhythmus: string) => string;
};

const A: Kandidat = { cardId: "a", name: "Haushaltsgeld", treffer: 6 };
const B: Kandidat = { cardId: "b", name: "Privates Budget", treffer: 4 };
const V: Vorschlag = { cardId: "a", name: "Haushaltsgeld", treffer: 6, konfidenz: 0.94 };

test.describe("Zuordnen-Zustand: mehrdeutig schlägt Vorschlag (Record #2, ZO-8)", () => {
  test("zwei Kandidaten → mehrdeutig, auch wenn die Datenbank einen Vorschlag trägt", () => {
    expect(z.bestimmeZustand({ vorschlag: V, kandidaten: [A, B] })).toBe("mehrdeutig");
  });

  test("ein Kandidat und sichtbarer Vorschlag → normal", () => {
    expect(z.bestimmeZustand({ vorschlag: V, kandidaten: [A] })).toBe("normal");
  });

  test("kein Kandidat, aber Vorschlag (Händler-Regel/Ähnlichkeit) → normal", () => {
    expect(z.bestimmeZustand({ vorschlag: { ...V, treffer: 0 }, kandidaten: [] })).toBe("normal");
  });

  test("weder Vorschlag noch Kandidaten → kein Vorschlag (A1)", () => {
    expect(z.bestimmeZustand({ vorschlag: null, kandidaten: [] })).toBe("keinVorschlag");
  });

  test("ein einzelner Kandidat ohne sichtbaren Vorschlag ist KEIN Zweifelsfall", () => {
    // Genau ein Treffer ist eindeutig — die Datenbank hätte ihn als Vorschlag
    // geliefert; fehlt er (Karte inaktiv, Schwelle), gibt es keinen Knopf.
    expect(z.bestimmeZustand({ vorschlag: null, kandidaten: [A] })).toBe("keinVorschlag");
  });
});

test.describe("Labels (Handoff §1, A3)", () => {
  test("Vorschlag mit Handzuordnungen: „N × so zugeordnet“", () => {
    expect(z.vorschlagsLabel({ treffer: 7, konfidenz: 0.94 })).toBe(
      "Vorschlag · 7 × so zugeordnet",
    );
  });

  test("Vorschlag ohne Handzuordnung: Konfidenz in Prozent, gerundet", () => {
    expect(z.vorschlagsLabel({ treffer: 0, konfidenz: 0.96 })).toBe("Vorschlag · 96 %");
    expect(z.vorschlagsLabel({ treffer: 0, konfidenz: 0.605 })).toBe("Vorschlag · 61 %");
    // außerhalb 0…1 wird geklemmt, nie „140 %"
    expect(z.vorschlagsLabel({ treffer: 0, konfidenz: 1.4 })).toBe("Vorschlag · 100 %");
  });

  test("erstes Wort des Empfängers trägt den Treffer", () => {
    expect(z.erstesWort("REWE Frankfurt Bockenheim")).toBe("REWE");
    expect(z.erstesWort("  DB Vertrieb GmbH")).toBe("DB");
    expect(z.erstesWort("")).toBe("");
  });

  test("Kandidaten-Label und Übernehmen-Text", () => {
    expect(z.kandidatenLabel(2, "REWE Frankfurt Bockenheim")).toBe(
      "2 Kandidaten · Treffer auf »REWE«",
    );
    expect(z.uebernehmenText(null)).toBe("Übernehmen");
    expect(z.uebernehmenText({ name: "Haushaltsgeld" })).toBe("Übernehmen · Haushaltsgeld");
  });
});

test.describe("Monat, Nachbarn, Zähler", () => {
  test("Laufend · Vorbei · Forecast am laufenden Monat gemessen", () => {
    expect(z.monatsStatus("2026-09", "2026-09")).toBe("laufend");
    expect(z.monatsStatus("2026-08", "2026-09")).toBe("vorbei");
    expect(z.monatsStatus("2026-10", "2026-09")).toBe("forecast");
    expect(z.pillenWort("forecast")).toBe("Forecast");
  });

  test("Nachbar-Unterzeile: N offen | erledigt | Forecast", () => {
    expect(z.nachbarUnterzeile({ offen: 3, status: "vorbei" })).toBe("3 offen");
    expect(z.nachbarUnterzeile({ offen: 0, status: "vorbei" })).toBe("erledigt");
    expect(z.nachbarUnterzeile({ offen: 0, status: "laufend" })).toBe("erledigt");
    expect(z.nachbarUnterzeile({ offen: 0, status: "forecast" })).toBe("Forecast");
  });

  test("Kopfzeile rechts", () => {
    expect(z.offenZeile({ offen: 12, gesamt: 15 })).toBe("vorläufig · 12 nicht zugeordnet");
    expect(z.offenZeile({ offen: 0, gesamt: 15 })).toBe("alle 15 zugeordnet");
    expect(z.offenZeile({ offen: 0, gesamt: 0 })).toBe("noch keine Umsätze");
  });

  test("„{i} von {n}“ zählt über alle Buchungen des Monats (A4)", () => {
    expect(z.positionsZaehler({ zugeordnet: 0, gesamt: 12 })).toBe("1 von 12");
    expect(z.positionsZaehler({ zugeordnet: 12, gesamt: 15 })).toBe("13 von 15");
    // nie über n hinaus
    expect(z.positionsZaehler({ zugeordnet: 15, gesamt: 15 })).toBe("15 von 15");
  });

  test("Stapel-Rest: N weitere | letzte | leer", () => {
    expect(z.VORSCHAU_ZEILEN).toBe(3);
    expect(z.stapelRest({ offen: 12, vorschau: 3 })).toBe("8 weitere");
    expect(z.stapelRest({ offen: 4, vorschau: 3 })).toBe("letzte");
    expect(z.stapelRest({ offen: 2, vorschau: 1 })).toBe("letzte");
    expect(z.stapelRest({ offen: 1, vorschau: 0 })).toBe("");
  });

  test("leerer Zustand: Forecast gegen alles zugeordnet", () => {
    expect(z.leerText({ status: "forecast", monatName: "Oktober", sparrateText: null })).toEqual({
      titel: "Noch keine Umsätze",
      text: "Oktober ist Forecast. Die Buchungen kommen, wenn der Monat läuft.",
    });
    expect(
      z.leerText({ status: "laufend", monatName: "September", sparrateText: "1.613,11 €" }),
    ).toEqual({
      titel: "Alles zugeordnet",
      text: "Sparrate September steht bei 1.613,11 €. Der Ring in der Übersicht zeigt sie.",
    });
  });
});

test.describe("Später: ans Ende, Reihenfolge bleibt (Record #6)", () => {
  const offene = [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }];

  test("zurückgestellte Zahlungen stehen hinten, in Reihenfolge der Rückstellung", () => {
    expect(z.stapelReihenfolge(offene, ["2"]).map((x) => x.id)).toEqual(["1", "3", "4", "2"]);
    expect(z.stapelReihenfolge(offene, ["3", "1"]).map((x) => x.id)).toEqual(["2", "4", "3", "1"]);
  });

  test("eine inzwischen zugeordnete ID wird ignoriert, nichts wird erfunden", () => {
    expect(z.stapelReihenfolge(offene, ["9", "4"]).map((x) => x.id)).toEqual(["1", "2", "3", "4"]);
  });

  test("ohne Rückstellung: die gelieferte Reihenfolge", () => {
    expect(z.stapelReihenfolge(offene, []).map((x) => x.id)).toEqual(["1", "2", "3", "4"]);
  });
});

test.describe("Toast-Zeile: Rot nur bei echter Abweichung (v3 Regel 2, A2)", () => {
  test("Δ < 0 → rot mit Monat und Betrag", () => {
    expect(
      z.toastZeile({ delta: -106.13, monatName: "September", istEinnahme: false, deltaText: "−106,13 €" }),
    ).toEqual({ text: "Sparrate September −106,13 €", ton: "rot" });
  });

  test("Δ = 0 → im Plan, neutral — Einnahme mit eigenem Wortlaut", () => {
    expect(
      z.toastZeile({ delta: 0, monatName: "September", istEinnahme: false, deltaText: "0,00 €" }),
    ).toEqual({ text: "Sparrate unverändert · im Plan", ton: "neutral" });
    expect(
      z.toastZeile({ delta: 0.004, monatName: "September", istEinnahme: true, deltaText: "0,00 €" }),
    ).toEqual({ text: "Einnahme · im Plan", ton: "neutral" });
  });

  test("Δ > 0 → türkis (A2), nie rot", () => {
    expect(
      z.toastZeile({ delta: 12, monatName: "September", istEinnahme: false, deltaText: "+12,00 €" }),
    ).toEqual({ text: "Sparrate September +12,00 €", ton: "teal" });
  });
});

test.describe("Buchungstext → Empfänger und Zweck (lib/description.ts)", () => {
  test("DKB Giro: Empfänger | Zweck", () => {
    expect(d.splitDescription("Mainova AG | Abrechnung 30.06.2026 siehe Anlage")).toEqual({
      empfaenger: "Mainova AG",
      zweck: "Abrechnung 30.06.2026 siehe Anlage",
    });
  });

  test("Kartenumsatz: der Händler steht VOR dem Trenner, das Datum dahinter", () => {
    expect(d.splitDescription("Aral | VISA Debitkartenumsatz vom 02.09.2026")).toEqual({
      empfaenger: "Aral",
      zweck: "VISA Debitkartenumsatz vom 02.09.2026",
    });
  });

  test("ohne Trenner: nur Empfänger, kein Zweck", () => {
    expect(d.splitDescription("SP SCICON SPORTS")).toEqual({
      empfaenger: "SP SCICON SPORTS",
      zweck: null,
    });
  });

  test("drei Teile (Cortal) werden verbunden, leere Teile fallen weg", () => {
    expect(d.splitDescription("n/a | Effekten | SPARPLAN Kauf")).toEqual({
      empfaenger: "n/a",
      zweck: "Effekten · SPARPLAN Kauf",
    });
    expect(d.splitDescription("Burschenschaft | ")).toEqual({
      empfaenger: "Burschenschaft",
      zweck: null,
    });
  });

  test("leerer erster Teil fällt auf den ganzen Text zurück", () => {
    expect(d.splitDescription(" | Zweck").empfaenger).toBe("| Zweck");
  });
});

test.describe("Sheet-Gruppen: jede (Typ, Rhythmus)-Kombination genau EINE Gruppe (A6, LL-26)", () => {
  const TYPEN = ["FIXED_COST", "BUDGET", "INCOME"];
  const RHYTHMEN = ["MONTHLY", "QUARTERLY", "SEMIANNUAL", "ANNUAL", "ONCE"];

  test("Reihenfolge und Titel wie im Handoff", () => {
    expect(g.GRUPPEN_REIHENFOLGE).toEqual(["fixkosten", "budget", "einmalig", "einnahmen"]);
    expect(g.GRUPPEN_REIHENFOLGE.map(g.gruppenTitel)).toEqual([
      "Fixkosten",
      "Budget",
      "Einmalig",
      "Einnahmen",
    ]);
  });

  test("Vollständigkeit: 15 Kombinationen, jede in einer der vier Gruppen", () => {
    const gesehen = new Map<string, number>();
    for (const t of TYPEN) {
      for (const r of RHYTHMEN) {
        const gr = g.kartenGruppe(t, r);
        expect(g.GRUPPEN_REIHENFOLGE).toContain(gr);
        gesehen.set(gr, (gesehen.get(gr) ?? 0) + 1);
      }
    }
    // 3 × 5 = 15 — und keine Gruppe bleibt leer
    expect(Array.from(gesehen.values()).reduce((a, b) => a + b, 0)).toBe(15);
    expect(gesehen.size).toBe(4);
  });

  test("Einnahme schlägt Rhythmus, ONCE schlägt den Ausgaben-Typ", () => {
    expect(g.kartenGruppe("INCOME", "ONCE")).toBe("einnahmen");
    expect(g.kartenGruppe("FIXED_COST", "ONCE")).toBe("einmalig");
    expect(g.kartenGruppe("BUDGET", "ONCE")).toBe("einmalig");
    expect(g.kartenGruppe("BUDGET", "MONTHLY")).toBe("budget");
    expect(g.kartenGruppe("FIXED_COST", "ANNUAL")).toBe("fixkosten");
  });
});
