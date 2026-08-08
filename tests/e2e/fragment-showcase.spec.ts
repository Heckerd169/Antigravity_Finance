import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// v2-16 (RM-2) — Regressions-Wächter für die Textregeln des Schaufenster-Popups.
// Prüft die ECHTE Quelldatei (transpiliert und ausgeführt), kein Nachbau — ein
// Nachbau driftet ab und gibt falsche Sicherheit. Muster von
// ring-subline.spec.ts, das dasselbe mit der Ring-Subzeile tut.
//
// Warum es diesen Wächter gibt: Die Aufteilung „erster Teil = Empfänger" ist
// eine Annahme über drei Bankformate mit unterschiedlich vielen Teilen. §11
// nennt sie ausdrücklich als Schwäche der gewählten Variante — die verworfene
// Rohtext-Variante hatte genau das offengelegt. Eine stille Fehlaufteilung
// sähe im Popup völlig unauffällig aus.
//
// Deterministisch, keine Live-Daten, kein Browser.

const SRC = path.join(
  __dirname, "..", "..", "src", "components", "interaction-zone", "fragment-showcase.ts",
);

const js = ts.transpileModule(fs.readFileSync(SRC, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2019,
  },
}).outputText;

type Split = { main: string; purpose: string | null };

function load() {
  const module = { exports: {} as Record<string, unknown> };
  new Function("exports", "module", js)(module.exports, module);
  return {
    splitDescription: module.exports.splitDescription as (r: string) => Split,
    shortenIban: module.exports.shortenIban as (r: string) => string,
  };
}

const { splitDescription, shortenIban } = load();

// ── Die drei Importformate ─────────────────────────────────────────────────
// Regel-basiert formuliert (LL-19), nicht an konkrete Buchungen gebunden.

test("DKB Visa (kein Trennzeichen): alles in der Hauptzeile, Zweck-Zeile entfällt", () => {
  const r = splitDescription("SP SCICON SPORTS");
  expect(r.main).toBe("SP SCICON SPORTS");
  // null heißt: die Zeile wird gar nicht gerendert (§11).
  expect(r.purpose).toBeNull();
});

test("DKB Giro (zwei Teile): Empfänger führt, Zweck steht darunter", () => {
  const r = splitDescription("Hausverwaltung Reinhardt GmbH | Miete (Domi) August 2026");
  expect(r.main).toBe("Hausverwaltung Reinhardt GmbH");
  expect(r.purpose).toBe("Miete (Domi) August 2026");
});

test("Cortal (drei Teile): Teil 1 führt, der REST bleibt vollständig erhalten", () => {
  const r = splitDescription("Scalable Capital | SEPA-Überweisung | Sparplan Juli");
  expect(r.main).toBe("Scalable Capital");
  // §11 verlangt den Zweck ungekürzt — es darf nichts wegfallen.
  expect(r.purpose).toBe("SEPA-Überweisung · Sparplan Juli");
});

test("das Trennzeichen der Bank taucht nirgends im Ergebnis auf", () => {
  for (const raw of [
    "A | B",
    "A | B | C",
    "A|B|C|D",
    "SP SCICON SPORTS",
  ]) {
    const r = splitDescription(raw);
    expect(r.main).not.toContain("|");
    expect(r.purpose ?? "").not.toContain("|");
  }
});

// ── Randfälle aus dem echten Bestand ───────────────────────────────────────

test("leerer letzter Teil: die Zweck-Zeile entfällt, statt leer dazustehen", () => {
  // Genau ein Fragment im Bestand sieht so aus (RM-1-Kommentar, 05.08.2026).
  const r = splitDescription("Burschen- und Maedchenschaft | ");
  expect(r.main).toBe("Burschen- und Maedchenschaft");
  expect(r.purpose).toBeNull();
});

test("leerer erster Teil: Rückfall auf den Rohtext, nie eine leere Hauptzeile", () => {
  const r = splitDescription(" | Nur ein Zweck");
  expect(r.main).not.toBe("");
  expect(r.main).toContain("Nur ein Zweck");
});

test("Randleerzeichen werden getrimmt, der Text selbst bleibt unangetastet", () => {
  const r = splitDescription("  Mainova AG  |  Strom (Domi) 08/2026  ");
  expect(r.main).toBe("Mainova AG");
  expect(r.purpose).toBe("Strom (Domi) 08/2026");
});

// ── IBAN-Verkürzung ────────────────────────────────────────────────────────

test("IBAN: Anfang und letzte vier Stellen bleiben, die Mitte wird gepunktet", () => {
  const short = shortenIban("DE02120300000012347291");
  expect(short).toBe("DE02 1203 ···· 7291");
});

test("IBAN: bereits gruppierte Schreibweise ergibt dasselbe Ergebnis", () => {
  expect(shortenIban("DE02 1203 0000 0012 3472 91")).toBe(
    shortenIban("DE02120300000012347291"),
  );
});

test("IBAN: die vollständige Nummer steht nie im verkürzten Ergebnis", () => {
  const raw = "DE02120300000012347291";
  expect(shortenIban(raw)).not.toContain(raw);
});

test("IBAN: zu kurze Werte bleiben unverändert, statt irreführend gekürzt zu werden", () => {
  expect(shortenIban("DE0212")).toBe("DE0212");
});
