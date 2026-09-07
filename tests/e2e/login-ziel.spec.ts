import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// Regressions-Wächter über das Ziel nach dem Anmelden (Nachzug 07.09.2026 zu
// v3-02). Prüft die ECHTE Quelldatei `src/lib/next-path.ts` — transpiliert und
// ausgeführt, kein Nachbau (Muster suggestion-visibility.spec.ts).
//
// ANLASS: Wer am Handy /mobil aufrief, landete nach dem Anmelden auf dem
// Dashboard — die Middleware kannte kein Ziel. Jetzt trägt sie `?next=` mit.
//
// WARUM EIN WÄCHTER: Ein `next`, das nicht geprüft wird, ist ein offenes
// Weiterleitungs-Ziel. Keine Zahl würde falsch; der Nutzer landete nach dem
// Anmelden nur auf einer fremden Seite. Genau die Sorte Fehler, die Anker und
// Prüfsummen nie sehen (LL-26).

const SRC = path.join(__dirname, "..", "..", "src", "lib", "next-path.ts");

const js = ts.transpileModule(fs.readFileSync(SRC, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
}).outputText;

function load(): { safeNextPath: (raw: unknown) => string | null } {
  const mod = { exports: {} as Record<string, unknown> };
  new Function("exports", "module", js)(mod.exports, mod);
  return { safeNextPath: mod.exports.safeNextPath as (raw: unknown) => string | null };
}

const { safeNextPath } = load();

test.describe("Login-Ziel: nur interne Pfade kommen durch", () => {
  test("interne Pfade, auch mit Suchanfrage, bleiben erhalten", () => {
    expect(safeNextPath("/mobil")).toBe("/mobil");
    expect(safeNextPath("/mobil/zuordnen?month=2026-08")).toBe("/mobil/zuordnen?month=2026-08");
    expect(safeNextPath("/")).toBe("/");
    expect(safeNextPath("  /mobil  ")).toBe("/mobil");
  });

  test("fremde Ziele fallen weg: protokoll-relativ, absolut, Rückstrich", () => {
    expect(safeNextPath("//evil.com")).toBeNull();
    expect(safeNextPath("//evil.com/mobil")).toBeNull();
    expect(safeNextPath("https://evil.com")).toBeNull();
    expect(safeNextPath("http://evil.com/")).toBeNull();
    expect(safeNextPath("/\\evil.com")).toBeNull();
    expect(safeNextPath("/mobil\\..\\x")).toBeNull();
    expect(safeNextPath("javascript:alert(1)")).toBeNull();
    expect(safeNextPath("mobil")).toBeNull();
  });

  test("die Anmeldeseite selbst ist kein Ziel — sonst ein Kreis", () => {
    expect(safeNextPath("/login")).toBeNull();
    expect(safeNextPath("/login?next=/mobil")).toBeNull();
    expect(safeNextPath("/login/")).toBeNull();
    // aber ein Pfad, der nur so BEGINNT, ist erlaubt
    expect(safeNextPath("/loginbuch")).toBe("/loginbuch");
  });

  test("leer, zu lang, Steuerzeichen, falscher Typ → null", () => {
    expect(safeNextPath("")).toBeNull();
    expect(safeNextPath("   ")).toBeNull();
    expect(safeNextPath(null)).toBeNull();
    expect(safeNextPath(undefined)).toBeNull();
    expect(safeNextPath(42)).toBeNull();
    expect(safeNextPath("/a b")).toBeNull();
    expect(safeNextPath("/a\nb")).toBeNull();
    expect(safeNextPath("/" + "x".repeat(600))).toBeNull();
  });
});
