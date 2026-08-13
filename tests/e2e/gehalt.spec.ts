import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

/*
 * Regressions-Wächter für die Gehalts-Treiberzeile (v2-19, GE-2).
 *
 * Prüft die ECHTE Quelldatei — transpiliert und ausgeführt, kein Nachbau.
 * Muster übernommen von `ring-subline.spec.ts` und `kategorien.spec.ts`.
 *
 * WORUM ES GEHT — und warum genau das ein eigener Test ist:
 *
 * Die Datenbank liefert seit v2-19 bis zu VIER Treiber je Monat: die drei
 * größten Karten-Treiber plus „Gehalt", sobald das tatsächlich überwiesene
 * Netto vom Plan abweicht. Die Gehalts-Zeile wird bewusst NICHT gegen die
 * Karten gerankt (Record `V2/design_direktor_2026-08-13_gehalt.md`,
 * Entscheidung C) — sie kommt hinzu, statt eine zu verdrängen.
 *
 * Im Frontend stand dem eine Zeile entgegen: `getTop3Drivers` schnitt hart auf
 * drei ab. Mit den echten Juli-Zahlen liegt „Gehalt" mit −15,57 € an VIERTER
 * Stelle, weil die drei Budget-Treiber (+303,23 · −302,58 · +57,75) größer
 * sind. Der Sprint hätte also die Zahl korrekt berechnet, in die Sparrate
 * gerechnet, die B2-Invariante erfüllt — und der Nutzer hätte sie trotzdem nie
 * gesehen. Ein stiller Fehlschlag, den weder Prüfsumme noch Anker fangen.
 *
 * Deshalb prüft dieser Test die Grenze selbst, nicht ihre Begründung.
 */

const SRC_DIR = path.join(__dirname, "..", "..", "src");

function transpile(rel: string): string {
  return ts.transpileModule(fs.readFileSync(path.join(SRC_DIR, rel), "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
    },
  }).outputText;
}

type DriverEntry = { label: string; isPlaceholder: boolean };
type DriversByMonth = Record<number, unknown[]>;

/** Lädt `welle/drivers.ts` samt seiner einen echten Abhängigkeit
 *  (`lib/format.ts`) — so läuft die echte Zahlenformatierung mit, statt
 *  nachgebaut zu werden. */
function load() {
  const format = { exports: {} as Record<string, unknown> };
  new Function("exports", "module", transpile("lib/format.ts"))(
    format.exports,
    format,
  );

  const mod = { exports: {} as Record<string, unknown> };
  const requireShim = (id: string) => {
    if (id.includes("format")) return format.exports;
    return {};
  };
  new Function(
    "exports",
    "module",
    "require",
    transpile("components/welle/drivers.ts"),
  )(mod.exports, mod, requireShim);

  return {
    parseYearDrivers: mod.exports.parseYearDrivers as (r: unknown) => DriversByMonth,
    getTop1Driver: mod.exports.getTop1Driver as (
      d: DriversByMonth | null,
      i: number,
    ) => DriverEntry,
    getTop3Drivers: mod.exports.getTop3Drivers as (
      d: DriversByMonth | null,
      i: number,
    ) => DriverEntry[],
  };
}

const { parseYearDrivers, getTop1Driver, getTop3Drivers } = load();

// ── Fixtures: die echten Juli-2026-Zahlen aus der Produktiv-Datenbank ────────

const karte = (name: string, delta: number) => ({
  card_id: `id-${name}`,
  card_name: name,
  card_type: "BUDGET",
  attribution: "ICH",
  ist: 0,
  plan: 0,
  share: 1,
  delta,
});

const gehalt = (delta: number) => ({
  card_id: null,
  card_name: "Gehalt",
  card_type: null,
  attribution: null,
  ist: 4149.54,
  plan: 4165.11,
  share: 1,
  delta,
});

/** Wie die RPC antwortet: ein Eintrag je Monat, `drivers` bereits nach
 *  |delta| absteigend sortiert. */
const jahr = (monthIndex: number, drivers: unknown[]) => [
  { month_index: monthIndex, month: "2026-07-01", drivers },
];

const JULI = 6;

/** Vor dem Euro steht ein GESCHÜTZTES Leerzeichen (`drivers.ts`, `NBSP`),
 *  damit Betrag und Währung nie umbrechen.
 *
 *  Bewusst als Escape-Sequenz " " statt als hineinkopiertes Zeichen: Beim
 *  Schreiben dieses Tests stand hier zuerst ein normales Leerzeichen. Der
 *  Vergleich schlug fehl — und die Fehlermeldung zeigte zweimal
 *  "Gehalt −15,57 €", sichtbar identisch, tatsächlich verschieden. */
const NBSP = " ";
const eur = (betrag: string) => `${betrag}${NBSP}€`;

const JULI_ECHT = [
  karte("Urlaub Frankreich (Vogesen)", 303.23),
  karte("Privates Budget", -302.58),
  karte("Tanken", 57.75),
  gehalt(-15.57),
];

test.describe("Gehalts-Treiberzeile (v2-19, GE-2)", () => {
  test("die vierte Zeile überlebt — Gehalt wird NICHT abgeschnitten", () => {
    const parsed = parseYearDrivers(jahr(JULI, JULI_ECHT));
    const entries = getTop3Drivers(parsed, JULI);

    // Der eigentliche Wächter. Stünde in `drivers.ts` wieder `slice(0, 3)`,
    // wären es hier drei — und „Gehalt" wäre lautlos verschwunden.
    expect(entries).toHaveLength(4);
    expect(entries[3].label).toBe(eur("Gehalt −15,57"));
    expect(entries[3].isPlaceholder).toBe(false);
  });

  test("ohne Gehaltsabweichung bleiben es die drei Karten-Treiber", () => {
    const parsed = parseYearDrivers(jahr(JULI, JULI_ECHT.slice(0, 3)));
    expect(getTop3Drivers(parsed, JULI)).toHaveLength(3);
  });

  test("mehr als vier liefert die Datenbank nicht — und mehr zeigen wir nicht", () => {
    // Defense-in-Depth: Käme die RPC je mit einem höheren `p_limit` daher,
    // bliebe die Anzeige bei vier statt die Liste aufzublähen.
    const zuviele = [
      karte("A", 500),
      karte("B", 400),
      karte("C", 300),
      karte("D", 200),
      gehalt(-15.57),
    ];
    expect(getTop3Drivers(parseYearDrivers(jahr(JULI, zuviele)), JULI)).toHaveLength(4);
  });

  test("card_id bleibt null und wird nicht zu einem leeren String verschliffen", () => {
    const parsed = parseYearDrivers(jahr(JULI, JULI_ECHT));
    const zeilen = parsed[JULI] as Array<{ cardId: string | null; cardName: string }>;

    const gehaltszeile = zeilen.find((d) => d.cardName === "Gehalt");
    expect(gehaltszeile?.cardId).toBeNull();

    // Die Karten daneben behalten ihre ID — sonst wäre die Unterscheidung
    // wertlos.
    expect(zeilen.find((d) => d.cardName === "Tanken")?.cardId).toBe("id-Tanken");
  });

  test("ist das Gehalt der größte Treiber, führt es auch den Tooltip an", () => {
    // Der Fall einer Nachzahlung: +784,43 € schlägt jeden Budget-Treiber.
    // Die Reihenfolge kommt aus der RPC; hier wird geprüft, dass das Frontend
    // sie nicht umsortiert und die Zeile nicht besonders behandelt.
    const mitNachzahlung = [gehalt(784.43), ...JULI_ECHT.slice(0, 3)];
    const parsed = parseYearDrivers(jahr(JULI, mitNachzahlung));

    expect(getTop1Driver(parsed, JULI).label).toBe(eur("Gehalt +784,43"));
    expect(getTop3Drivers(parsed, JULI)).toHaveLength(4);
  });

  test("ein Monat ohne Abweichung bleibt bei seiner Platzhalter-Zeile", () => {
    // Januar bis Juni 2026 tragen exakt den Planbetrag (4.165,11 €) — dort
    // entsteht gar keine Gehalts-Zeile, und das ist richtig so.
    const parsed = parseYearDrivers(jahr(JULI, []));
    const entries = getTop3Drivers(parsed, JULI);
    expect(entries).toHaveLength(1);
    expect(entries[0].isPlaceholder).toBe(true);
  });
});
