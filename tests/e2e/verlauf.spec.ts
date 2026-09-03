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
  rasterY: number[];
  yMarken: { wert: number; y: number }[];
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

test.describe("Verlauf: inaktive Monate laufen auf 0, die Linie bricht NICHT (v2-31 §2, rev. 03.09.2026)", () => {
  // ⚠️ Diese vier Tests prüften bis zum 03.09.2026 das GEGENTEIL — dass eine
  // Lücke den Pfad bricht. Die Umkehr ist eine Design-Entscheidung des Nutzers
  // mit Begründung: Der Verlauf beantwortet „was hat mich das gekostet", und
  // für einen Monat ohne Fälligkeit lautet die Antwort null Euro. Das ist wahr,
  // nicht geschätzt — anders als der FEHLENDE Referenzwert, den LL-20 meint.
  // Die alte Fassung berief sich auf LL-20 und hat ihn dabei überdehnt.

  test("eine jährliche Karte ergibt EINE durchgehende Linie mit zwei Ausschlägen", () => {
    // ADAC Mitgliedschaft: aktiv in 10/2025 (Index 9) und 10/2026 (Index 21).
    const g = baueGeometrie(
      reihe(() => ({ ist: 99, plan: 99 }), [9, 21]),
      2026,
      AUGUST_2026,
    );
    expect(anzahlAbschnitte(g.planPfad)).toBe(1);
    expect(g.planPfad).toContain("L");
    // 24 Koordinaten statt zwei — jeder Monat ist gezeichnet.
    expect((g.planPfad.match(/[ML]/g) ?? []).length).toBe(MONATE_GESAMT);
    // Keine Einzelpunkte mehr: Die Linie trägt die Aussage.
    expect(g.planPunkte).toHaveLength(0);
  });

  test("die inaktiven Monate liegen auf der Nulllinie, die aktiven darüber", () => {
    const g = baueGeometrie(
      reihe(() => ({ ist: 99, plan: 99 }), [9, 21]),
      2026,
      AUGUST_2026,
    );
    const yNull = g.yMarken.find((m) => m.wert === 0)!.y;
    // Alle Koordinaten einsammeln und nach Höhe trennen.
    const ys = g.planPfad
      .split(/[ML]/)
      .filter(Boolean)
      .map((s) => Number(s.split(",")[1]));
    const aufNull = ys.filter((v) => Math.abs(v - yNull) < 0.05).length;
    expect(aufNull).toBe(22); // 24 minus die beiden Oktober
    expect(ys.filter((v) => v < yNull - 0.05)).toHaveLength(2);
  });

  test("eine Lücke in der Mitte teilt die Linie NICHT mehr", () => {
    const aktive = [0, 1, 2, 3, 4, 10, 11, 12];
    const g = baueGeometrie(
      reihe(() => ({ ist: 50, plan: 50 }), aktive),
      2026,
      AUGUST_2026,
    );
    expect(anzahlAbschnitte(g.planPfad)).toBe(1);
  });

  test("eine durchgehende Reihe hat genau einen Abschnitt", () => {
    const g = baueGeometrie(reihe(() => ({ ist: 50, plan: 50 })), 2026, AUGUST_2026);
    expect(anzahlAbschnitte(g.planPfad)).toBe(1);
    expect(g.planPunkte).toHaveLength(0);
  });

  test("eine Reihe ohne einen einzigen aktiven Monat bleibt zeichenbar", () => {
    const g = baueGeometrie(reihe(() => ({ ist: 0, plan: 0 }), []), 2026, AUGUST_2026);
    expect(anzahlAbschnitte(g.planPfad)).toBe(1);
    expect(g.top).toBeGreaterThan(0); // keine Division durch null
  });
});

test.describe("Verlauf: die Y-Achse rastert in runden Schritten (v2-31, 03.09.2026)", () => {
  // Anlass, gemessen am Ordner „Versicherungen": 18 von 24 Monaten liegen
  // zwischen 223 und 262 €, der Dezember 2026 bei 597,36 €. Die Achse MUSS bis
  // dorthin reichen — vorher stand zwischen 0 und 600 aber nichts, und das
  // dichte Band bei 38 % Höhe war nicht ablesbar.

  test("Versicherungen: 100er-Schritte, sieben beschriftete Marken", () => {
    const werte = [511.86, 224.32, 224.32, 253.64, 233.30, 223.40, 223.40, 223.40,
      226.80, 226.80, 440.80, 592.30, 226.80, 232.83, 232.83, 261.71, 257.63,
      232.83, 232.83, 232.83, 236.33, 231.86, 307.79, 597.36];
    const g = baueGeometrie(
      reihe((i) => ({ ist: werte[i], plan: werte[i] })),
      2026,
      AUGUST_2026,
    );
    expect(g.top).toBe(600);
    expect(g.yMarken.map((m) => m.wert)).toEqual([0, 100, 200, 300, 400, 500, 600]);
    // Jede Marke trägt eine Rasterlinie — nicht nur die erste und die letzte.
    expect(g.rasterY).toHaveLength(g.yMarken.length);
  });

  test("die Schrittweite passt sich der Größenordnung an", () => {
    const faelle: { max: number; top: number; schritte: number }[] = [
      { max: 13.99, top: 15, schritte: 5 },     // Netflix
      { max: 99, top: 100, schritte: 20 },      // ADAC
      { max: 259.36, top: 300, schritte: 50 },  // Tanken
      { max: 1120.33, top: 1200, schritte: 200 }, // Miete
      { max: 2592.82, top: 3000, schritte: 500 }, // Wohnen
    ];
    for (const f of faelle) {
      const g = baueGeometrie(
        reihe(() => ({ ist: f.max, plan: f.max })),
        2026,
        AUGUST_2026,
      );
      expect(g.top, `max ${f.max}`).toBe(f.top);
      const marken = g.yMarken.map((m) => m.wert);
      expect(marken[1] - marken[0], `Schritt bei max ${f.max}`).toBe(f.schritte);
    }
  });

  test("die Achse trägt nie mehr als sieben Marken", () => {
    for (const max of [1, 7, 42, 99, 260, 597, 1120, 2593, 9999, 45000]) {
      const g = baueGeometrie(reihe(() => ({ ist: max, plan: max })), 2026, AUGUST_2026);
      expect(g.yMarken.length, `max ${max}`).toBeLessThanOrEqual(7);
      expect(g.yMarken.length, `max ${max}`).toBeGreaterThanOrEqual(2);
    }
  });

  test("die Obergrenze schneidet nie einen Wert ab", () => {
    for (const max of [0.4, 13.99, 99, 259.36, 597.36, 2592.82]) {
      const g = baueGeometrie(reihe(() => ({ ist: max, plan: max })), 2026, AUGUST_2026);
      expect(g.top, `max ${max}`).toBeGreaterThanOrEqual(max);
    }
  });

  test("die Marken sind runde Zahlen, keine krummen Zwischenwerte", () => {
    const g = baueGeometrie(reihe(() => ({ ist: 597.36, plan: 597.36 })), 2026, AUGUST_2026);
    for (const m of g.yMarken) expect(Number.isInteger(m.wert)).toBe(true);
  });

  test("keine zwei Marken tragen dieselbe gerundete Beschriftung", () => {
    // Die Y-Labels runden auf ganze Euro (`formatEuroRounded`, wie im Ring).
    // Ein Schritt unter 1 € ergäbe deshalb zwei Marken mit demselben Text —
    // im Bestand gibt es Karten mit einem Platzhalter-Plan von 1,00 €.
    for (const max of [0.4, 1, 1.5, 2, 3, 4.99]) {
      const g = baueGeometrie(reihe(() => ({ ist: max, plan: max })), 2026, AUGUST_2026);
      const labels = g.yMarken.map((m) => Math.round(m.wert));
      expect(new Set(labels).size, `max ${max}`).toBe(labels.length);
    }
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
