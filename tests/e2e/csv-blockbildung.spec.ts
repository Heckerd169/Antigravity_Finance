import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// Regressions-Wächter für die Blockbildung des CSV-Imports (03.09.2026).
// Prüft die ECHTE Quelldatei — transpiliert und ausgeführt, kein Nachbau.
// Muster übernommen von suggestion-visibility.spec.ts.
//
// ANLASS: Der Visa-Jahresexport vom 01.09.2026 (2.535 Zeilen, davon 2.031 vor
// 2025 und damit neu) lief in das `statement_timeout` von 8 s der Rolle
// `authenticated`. Gemessen im Trockenlauf auf Produktion: 92,85 ms je Zeile,
// hochgerechnet ~188 s. Seither wird die Datei in Blöcken importiert.
//
// WAS HIER SCHIEFGEHEN KANN, UND ZWAR STILL:
// `process_csv_import` nummeriert byte-identische Zeilen INNERHALB von `p_rows`
// durch — `row_number() OVER (PARTITION BY date, amount, description)` — und
// hängt ab dem 2. Vorkommen `|#N` an den Hash. Fällt eine solche Gruppe auf zwei
// Blöcke, zählen beide bei 1 los, beide Zeilen bekommen denselben Hash, und die
// zweite wird als Duplikat verworfen. Eine echte Zahlung verschwindet — ohne
// Fehlermeldung, und die Sparrate des Monats ist danach still falsch.
//
// Kein Anker dieses Projekts fängt das: Anker 1 und Anker 2 prüfen die
// Konsistenz der Rechnung, nicht die Vollständigkeit der Daten. Die Sparrate
// wäre in sich stimmig — nur um eine Zahlung zu hoch. Dieselbe Familie wie
// LL-28/LL-34/LL-37: jede Zahl richtig, nur fehlt eine.
//
// GEGENPROBE NACH LL-40 (Regel 27): Der Wächter wurde einmal gegen eine naive
// `slice`-Blockbildung laufen gelassen und war dabei ROT — Testfall
// „Gruppe an der Blockgrenze" schlug an. Ohne diesen Nachweis wäre ein grüner
// Lauf nur eine Zusicherung.

const SRC = path.join(__dirname, "..", "..", "src", "lib", "csv-batches.ts");

const js = ts.transpileModule(fs.readFileSync(SRC, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2019,
  },
}).outputText;

type Zeile = {
  transaction_date: string;
  amount: number;
  description: string;
};

function laden(): {
  buildImportBatches: (rows: Zeile[], maxSize?: number) => Zeile[][];
  IMPORT_BATCH_SIZE: number;
} {
  const module = { exports: {} as Record<string, unknown> };
  new Function("exports", "module", js)(module.exports, module);
  return {
    buildImportBatches: module.exports.buildImportBatches as (
      rows: Zeile[],
      maxSize?: number,
    ) => Zeile[][],
    IMPORT_BATCH_SIZE: module.exports.IMPORT_BATCH_SIZE as number,
  };
}

const { buildImportBatches, IMPORT_BATCH_SIZE } = laden();

/** Derselbe Schlüssel wie die PARTITION-BY-Klausel der RPC. */
function schluessel(z: Zeile): string {
  return `${z.transaction_date}|${z.amount}|${z.description}`;
}

function zeile(tag: string, betrag: number, text: string): Zeile {
  return { transaction_date: `2023-06-${tag}`, amount: betrag, description: text };
}

/** Erzeugt n unterscheidbare Zeilen (kein Duplikat untereinander). */
function verschiedeneZeilen(n: number): Zeile[] {
  return Array.from({ length: n }, (_, i) =>
    zeile("01", -(i + 1), `Buchung ${i}`),
  );
}

test.describe("CSV-Blockbildung", () => {
  test("gibt alle Zeilen genau einmal und in Dateireihenfolge zurück", () => {
    const zeilen = verschiedeneZeilen(97);
    const bloecke = buildImportBatches(zeilen, 10);
    const flach = bloecke.flat();

    expect(flach).toHaveLength(zeilen.length);
    // Reihenfolge ist Parser-Vertrag ④ — die Laufnummer hängt daran.
    expect(flach).toEqual(zeilen);
  });

  test("hält die Blockgröße ein, solange keine Gruppe im Weg ist", () => {
    const bloecke = buildImportBatches(verschiedeneZeilen(100), 25);
    expect(bloecke).toHaveLength(4);
    for (const b of bloecke) expect(b.length).toBe(25);
  });

  test("zerschneidet KEINE Gruppe byte-identischer Zeilen", () => {
    // Die Gruppe liegt exakt auf der Grenze: bei maxSize 10 fiele sie ohne
    // Sonderbehandlung auf Block 1 und Block 2 — genau der stille Datenverlust.
    const zeilen = [
      ...verschiedeneZeilen(9),
      zeile("02", -9.99, "Spotify"),
      zeile("02", -9.99, "Spotify"),
      ...verschiedeneZeilen(20),
    ];
    const bloecke = buildImportBatches(zeilen, 10);

    pruefeKeineGruppeGetrennt(bloecke);
    expect(bloecke.flat()).toEqual(zeilen);
  });

  test("hält auch weit auseinanderliegende Gruppen zusammen", () => {
    // In der auslösenden Datei lag die größte Spannweite bei 7 Positionen.
    // Hier bewusst größer, damit die Zusicherung nicht an jener Datei klebt.
    const zeilen = [
      zeile("03", -5, "Bäcker"),
      ...verschiedeneZeilen(8),
      zeile("03", -5, "Bäcker"),
      ...verschiedeneZeilen(30),
    ];
    const bloecke = buildImportBatches(zeilen, 5);

    pruefeKeineGruppeGetrennt(bloecke);
    expect(bloecke.flat()).toEqual(zeilen);
  });

  test("ist deterministisch — dieselbe Datei ergibt dieselben Blöcke", () => {
    // Das ist die Bedingung dafür, dass ein abgebrochener Import durch erneutes
    // Einwerfen derselben Datei fortgesetzt werden kann: Nur bei identischer
    // Blockbildung entstehen dieselben Hashes, und nur dann werden die bereits
    // geschriebenen Zeilen als Duplikat erkannt statt doppelt angelegt.
    const zeilen = [
      ...verschiedeneZeilen(40),
      zeile("04", -12.5, "Kiosk"),
      zeile("04", -12.5, "Kiosk"),
      zeile("04", -12.5, "Kiosk"),
      ...verschiedeneZeilen(15),
    ];
    const a = buildImportBatches(zeilen, 13);
    const b = buildImportBatches(zeilen, 13);
    expect(b).toEqual(a);
  });

  test("Randfälle: leer, eine Zeile, Gruppe größer als der Block", () => {
    expect(buildImportBatches([], 25)).toEqual([]);

    const eine = [zeile("05", -1, "X")];
    expect(buildImportBatches(eine, 25)).toEqual([eine]);

    // Eine Gruppe, die länger ist als maxSize, DARF den Block sprengen — die
    // Alternative wäre, sie zu trennen, und das verlöre still eine Zahlung.
    const gross = Array.from({ length: 7 }, () => zeile("06", -3, "Automat"));
    const bloecke = buildImportBatches(gross, 3);
    expect(bloecke).toHaveLength(1);
    expect(bloecke[0]).toHaveLength(7);
    pruefeKeineGruppeGetrennt(bloecke);
  });

  test("die Blockgröße bleibt unter der gemessenen Timeout-Grenze", () => {
    // 92,85 ms je Zeile (Trockenlauf 03.09.2026) gegen statement_timeout 8 s.
    // Wer die Konstante anhebt, muss diese Rechnung neu machen — der Test sagt,
    // ab wann sie nicht mehr aufgeht.
    const MS_JE_ZEILE = 92.85;
    const TIMEOUT_MS = 8000;
    expect(IMPORT_BATCH_SIZE * MS_JE_ZEILE).toBeLessThan(TIMEOUT_MS / 2);
  });
});

/** Keine Gruppe byte-identischer Zeilen darf in mehr als einem Block vorkommen. */
function pruefeKeineGruppeGetrennt(bloecke: Zeile[][]): void {
  const bereitsGesehen = new Map<string, number>();
  bloecke.forEach((block, index) => {
    const imBlock = new Set<string>();
    for (const z of block) imBlock.add(schluessel(z));
    for (const k of Array.from(imBlock)) {
      const frueher = bereitsGesehen.get(k);
      expect(
        frueher,
        `Gruppe "${k}" liegt in Block ${frueher} UND Block ${index} — ` +
          "die Laufnummer der RPC zählt je Block neu, die zweite Zeile ginge " +
          "als vermeintliches Duplikat verloren.",
      ).toBeUndefined();
      bereitsGesehen.set(k, index);
    }
  });
}
