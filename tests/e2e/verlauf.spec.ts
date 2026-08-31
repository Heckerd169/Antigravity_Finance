import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// Regressions-Wächter für den Verlauf je Karte und je Ordner (v2-31, M7/KAT-4).
// Prüft die ECHTE Quelldatei — transpiliert und ausgeführt, kein Nachbau.
// Muster von zuordnung.spec.ts und ring-subline.spec.ts.
//
// ── WAS HIER GESCHÜTZT WIRD ────────────────────────────────────────────────
//
// Drei Regeln aus dem Design-Record vom 31.08.2026, die alle drei die
// Eigenschaft haben, dass ihr Bruch KEINE Zahl falsch macht:
//
// ① Die Ist-Linie endet am laufenden Monat. In Zukunftsmonaten liefert
//    `calculate_card_amount_for_month` den Plan zurück — gemessen am
//    31.08.2026 sind in Sep–Dez 2026 ALLE 22 aktiven Karten reine Plan-Kopien,
//    in den 20 vergangenen Monaten KEINE einzige. Zeichnete man dort weiter,
//    wäre die teale Linie eine zweite Plan-Linie mit falschem Namen.
//
// ② Ein inaktiver Monat bricht die Linie, er fällt nicht auf null. Die
//    Datenbank liefert `null`; würde das hier auf 0 verschliffen, zeigte eine
//    jährliche Karte in 22 von 24 Monaten „null Euro ausgegeben" statt „gibt
//    es in diesem Monat nicht" (§7 Regel 17 / LL-20).
//
// ③ Ein Wert ohne aktive Nachbarn wird als Punkt gezeichnet. Ohne das ist
//    `ADAC Mitgliedschaft` (2 von 24 Monaten aktiv) UNSICHTBAR: Zwei
//    Pfad-Knoten ohne Verbindung malen nichts.
//
// Dazu die Menü-Regel: `Verlauf …` erscheint NICHT bei `ONCE` — das betrifft
// 142 der 178 Karten, und ein Menüpunkt, der einen einzelnen Punkt zeigt, ist
// ein Versprechen ins Leere.
//
// ── WARUM ES DIESEN WÄCHTER BRAUCHT ────────────────────────────────────────
//
// Keine der drei Regeln bewegt eine Zahl. Anker 1, Anker 2 und alle neun
// Prüfsummen bleiben grün, wenn sie brechen — genau die Fehlerklasse, die
// dieses Projekt am teuersten bezahlt hat (LL-26, sechs Vorfälle).

const SRC = path.join(__dirname, "..", "..", "src", "components", "cards", "verlauf.ts");
const MENUE_SRC = path.join(
  __dirname, "..", "..", "src", "components", "cards", "card-interactive.tsx",
);

const js = ts.transpileModule(fs.readFileSync(SRC, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2019,
  },
}).outputText;

type Punkt = {
  monthIndex: number;
  month: string;
  aktiv: boolean;
  ist: number | null;
  plan: number | null;
};

type Geometrie = {
  top: number;
  istPfad: string;
  planPfad: string;
  istPunkte: { x: number; y: number }[];
  planPunkte: { x: number; y: number }[];
  xMarken: { label: string; x: number }[];
  heuteX: number | null;
  jahrGrenzeX: number;
};

function load() {
  const mod = { exports: {} as Record<string, unknown> };
  new Function("exports", "module", js)(mod.exports, mod);
  return {
    heuteIndex: mod.exports.heuteIndex as (jahr: number, heute: Date) => number,
    baueGeometrie: mod.exports.baueGeometrie as (
      punkte: Punkt[], jahr: number, heute: Date,
    ) => Geometrie,
    jahresSummen: mod.exports.jahresSummen as (
      punkte: Punkt[], jahr: number, heute: Date,
    ) => { vorjahr: number; jahr: number },
    monatsLabel: mod.exports.monatsLabel as (i: number, jahr: number) => string,
    MONATE_GESAMT: mod.exports.MONATE_GESAMT as number,
  };
}

const { heuteIndex, baueGeometrie, jahresSummen, monatsLabel, MONATE_GESAMT } = load();

/** Eine Reihe bauen. `aktiveIndizes = null` heißt: alle 24 aktiv. */
function reihe(
  werte: (i: number) => { ist: number; plan: number },
  aktiveIndizes: number[] | null = null,
): Punkt[] {
  const punkte: Punkt[] = [];
  for (let i = 0; i < MONATE_GESAMT; i++) {
    const aktiv = aktiveIndizes === null || aktiveIndizes.includes(i);
    const w = werte(i);
    punkte.push({
      monthIndex: i,
      month: `2025-${String((i % 12) + 1).padStart(2, "0")}-01`,
      aktiv,
      ist: aktiv ? w.ist : null,
      plan: aktiv ? w.plan : null,
    });
  }
  return punkte;
}

/** Zählt, wie oft ein Pfad neu ansetzt. 1 = durchgehend, >1 = mit Lücken. */
function anzahlAbschnitte(pfad: string): number {
  return (pfad.match(/M/g) ?? []).length;
}

const AUGUST_2026 = new Date(Date.UTC(2026, 7, 15));

test.describe("Verlauf: die Ist-Linie endet am laufenden Monat (v2-31 §1)", () => {
  test("August 2026 liegt bei Index 19 der Reihe 2025–2026", () => {
    expect(heuteIndex(2026, AUGUST_2026)).toBe(19);
  });

  test("Januar des Vorjahres ist Index 0", () => {
    expect(heuteIndex(2026, new Date(Date.UTC(2025, 0, 3)))).toBe(0);
  });

  test("liegt heute VOR der Reihe, gibt es keine Ist-Linie", () => {
    expect(heuteIndex(2026, new Date(Date.UTC(2024, 11, 31)))).toBe(-1);
  });

  test("liegt heute NACH der Reihe, ist sie ganz Vergangenheit", () => {
    expect(heuteIndex(2026, new Date(Date.UTC(2028, 5, 1)))).toBe(MONATE_GESAMT - 1);
  });

  test("die Ist-Linie hört im August auf, die Plan-Linie läuft bis Dezember", () => {
    const g = baueGeometrie(
      reihe(() => ({ ist: 240, plan: 240 })),
      2026,
      AUGUST_2026,
    );
    // 20 Punkte (Index 0..19) ergeben 1× "M" und 19× "L".
    expect((g.istPfad.match(/L/g) ?? []).length).toBe(19);
    // 24 Punkte ergeben 1× "M" und 23× "L".
    expect((g.planPfad.match(/L/g) ?? []).length).toBe(23);
  });

  test("die heute-Marke steht dort, wo die Ist-Linie endet", () => {
    const g = baueGeometrie(reihe(() => ({ ist: 1, plan: 1 })), 2026, AUGUST_2026);
    expect(g.heuteX).not.toBeNull();
    // Sie muss zwischen Jahresgrenze (Mitte) und rechtem Rand liegen — August
    // 2026 ist der 20. von 24 Monaten.
    expect(g.heuteX!).toBeGreaterThan(g.jahrGrenzeX);
  });

  test("die Grenze hängt am Kalender, nicht am angezeigten Monat", () => {
    // Dieselbe Reihe, zweimal dasselbe „heute" — der einzige Unterschied wäre
    // ein anderer angezeigter Monat, den die Funktion gar nicht kennt. §9:
    // „Die Grenze liegt fix am Kalender-‚jetzt'."
    const a = baueGeometrie(reihe(() => ({ ist: 5, plan: 5 })), 2026, AUGUST_2026);
    const b = baueGeometrie(reihe(() => ({ ist: 5, plan: 5 })), 2026, AUGUST_2026);
    expect(a.istPfad).toBe(b.istPfad);
  });
});

test.describe("Verlauf: inaktive Monate brechen die Linie (v2-31 §2, LL-20)", () => {
  test("eine jährliche Karte ergibt zwei isolierte Punkte, keine Linie", () => {
    // ADAC Mitgliedschaft: aktiv in 10/2025 (Index 9) und 10/2026 (Index 21).
    const g = baueGeometrie(
      reihe(() => ({ ist: 99, plan: 99 }), [9, 21]),
      2026,
      AUGUST_2026,
    );
    // Plan: beide Monate, beide ohne Nachbarn → zwei Punkte, keine Verbindung.
    expect(g.planPunkte).toHaveLength(2);
    expect(g.planPfad).not.toContain("L");
    // Ist: nur Index 9 liegt vor „heute" (19); Index 21 ist Zukunft.
    expect(g.istPunkte).toHaveLength(1);
  });

  test("kein inaktiver Monat landet auf der Nulllinie", () => {
    const g = baueGeometrie(
      reihe(() => ({ ist: 99, plan: 99 }), [9, 21]),
      2026,
      AUGUST_2026,
    );
    // 24 Monate, 2 aktiv → höchstens 2 Koordinaten je Pfad. Würden inaktive
    // Monate auf 0 gezogen, stünden hier 24.
    const koordinaten = (g.planPfad.match(/[ML]/g) ?? []).length;
    expect(koordinaten).toBe(2);
  });

  test("eine Lücke in der Mitte teilt die Linie in zwei Abschnitte", () => {
    const aktive = [0, 1, 2, 3, 4, 10, 11, 12];
    const g = baueGeometrie(
      reihe(() => ({ ist: 50, plan: 50 }), aktive),
      2026,
      AUGUST_2026,
    );
    expect(anzahlAbschnitte(g.planPfad)).toBe(2);
  });

  test("eine durchgehende Reihe hat genau einen Abschnitt", () => {
    const g = baueGeometrie(reihe(() => ({ ist: 50, plan: 50 })), 2026, AUGUST_2026);
    expect(anzahlAbschnitte(g.planPfad)).toBe(1);
    expect(g.planPunkte).toHaveLength(0);
  });
});

test.describe("Verlauf: Beträge stehen als Höhe (v2-31 §8)", () => {
  test("ein Ausgaben-Ordner wird nicht unter die Nulllinie gezeichnet", () => {
    // Negative Beiträge (Ausgaben) und positive ergeben dieselbe Geometrie —
    // das Vorzeichen trägt die Unterzeile, nicht die Kurve. Rot ist in dieser
    // App „offen/Defizit" (§3), nicht „Ausgabe".
    const negativ = baueGeometrie(
      reihe(() => ({ ist: -1148.17, plan: -1148.17 })),
      2026,
      AUGUST_2026,
    );
    const positiv = baueGeometrie(
      reihe(() => ({ ist: 1148.17, plan: 1148.17 })),
      2026,
      AUGUST_2026,
    );
    expect(negativ.istPfad).toBe(positiv.istPfad);
    expect(negativ.top).toBe(positiv.top);
  });
});

test.describe("Verlauf: die X-Achse (v2-31 §6)", () => {
  test("beschriftet ist jeder dritte Monat — acht Marken über 24", () => {
    const g = baueGeometrie(reihe(() => ({ ist: 1, plan: 1 })), 2026, AUGUST_2026);
    expect(g.xMarken).toHaveLength(8);
  });

  test("das Format ist MM/JJ und beginnt im Vorjahr", () => {
    expect(monatsLabel(0, 2026)).toBe("01/25");
    expect(monatsLabel(11, 2026)).toBe("12/25");
    expect(monatsLabel(12, 2026)).toBe("01/26");
    expect(monatsLabel(23, 2026)).toBe("12/26");
  });

  test("die Marken sitzen auf Januar, April, Juli und Oktober beider Jahre", () => {
    const g = baueGeometrie(reihe(() => ({ ist: 1, plan: 1 })), 2026, AUGUST_2026);
    expect(g.xMarken.map((m) => m.label)).toEqual([
      "01/25", "04/25", "07/25", "10/25",
      "01/26", "04/26", "07/26", "10/26",
    ]);
  });
});

test.describe("Verlauf: die Jahressummen (v2-31 §7)", () => {
  test("Zukunftsmonate zählen nicht mit", () => {
    const s = jahresSummen(reihe(() => ({ ist: 100, plan: 100 })), 2026, AUGUST_2026);
    expect(s.vorjahr).toBe(1200); // 12 × 100
    expect(s.jahr).toBe(800); // Januar bis August, 8 × 100
  });

  test("inaktive Monate tragen nichts bei", () => {
    const s = jahresSummen(
      reihe(() => ({ ist: 99, plan: 99 }), [9, 21]),
      2026,
      AUGUST_2026,
    );
    expect(s.vorjahr).toBe(99);
    expect(s.jahr).toBe(0); // Index 21 ist Zukunft
  });
});

test.describe("Verlauf: der Menüpunkt (v2-31 §5)", () => {
  // Kommentare werden ENTFERNT, bevor geprüft wird. Sonst schlüge dieser Test
  // an, sobald ein Kommentar `ONCE` erwähnt — und bestrafte damit gute
  // Erklärungen (LL-32, die Kehrseite von `pg_get_functiondef`).
  const menueQuelle = fs
    .readFileSync(MENUE_SRC, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

  test("Verlauf-Menuepunkt haengt an einer Bedingung gegen ONCE", () => {
    expect(menueQuelle).toContain('currentFrequency !== "ONCE"');
  });

  test("die Bedingung steht unmittelbar vor dem Menüpunkt, nicht irgendwo", () => {
    // Ohne diese Prüfung wäre der Test oben erfüllt, sobald `ONCE` IRGENDWO in
    // der Datei vorkommt — auch in einem ganz anderen Zusammenhang. Genau so
    // lief der v2-29-Wächter beim ersten Versuch grün, weil sein Muster die
    // falsche Stelle traf (LL-40).
    const stelle = menueQuelle.indexOf('currentFrequency !== "ONCE"');
    expect(stelle).toBeGreaterThan(-1);
    const danach = menueQuelle.slice(stelle, stelle + 400);
    expect(danach).toContain("handleVerlaufClick");
    expect(danach).toContain("Verlauf …");
  });

  test("der Menüpunkt hängt NICHT an endDeleteOnly — Ghost-Karten haben ihn", () => {
    // Anders als „Betrag anpassen" und „Fällig am …", aus demselben Grund wie
    // „Kategorie ändern …": Der Verlauf ist eine Eigenschaft der Karte über die
    // Zeit, kein Monats-Zustand.
    const stelle = menueQuelle.indexOf('currentFrequency !== "ONCE"');
    const davor = menueQuelle.slice(Math.max(0, stelle - 120), stelle);
    expect(davor).not.toContain("!endDeleteOnly &&");
  });
});
