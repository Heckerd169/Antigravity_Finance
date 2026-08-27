import { defineConfig, devices } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// Lädt E2E_-Variablen aus .env.e2e.local (durch .env*.local gitignored).
// Bewusst minimaler Parser statt dotenv-Dependency — nur E2E_-Keys.
const envFile = path.join(__dirname, ".env.e2e.local");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = /^\s*(E2E_[A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const hasCreds = Boolean(
  process.env.E2E_TEST_EMAIL && process.env.E2E_TEST_PASSWORD
);

if (!hasCreds) {
  console.warn(
    "[e2e] E2E_TEST_EMAIL / E2E_TEST_PASSWORD fehlen (.env.e2e.local) — es läuft nur das unauth-Projekt."
  );
}

const DESKTOP = {
  ...devices["Desktop Chrome"],
  viewport: { width: 1440, height: 900 },
};

export default defineConfig({
  testDir: "tests/e2e",
  outputDir: "test-results",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    navigationTimeout: 30_000,
    trace: "retain-on-failure",
  },
  // M0-Kontrakt: Der dev-Server läuft mit .env.local gegen die Prod-Supabase.
  // Alle Tests sind strikt RENDER-ONLY (keine Taps/Drops/Imports/Mutationen).
  // Daten-mutierende E2E laufen erst gegen das isolierte Test-Projekt (V2-Gate).
  webServer: {
    command: "pnpm dev",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 90_000,
  },
  projects: [
    // Schicht-1-Pixel-Checks: rendern draw.ts in einer leeren Seite —
    // brauchen weder Creds noch den dev-Server (der startet config-global mit,
    // bleibt hier aber ungenutzt).
    // ⚠️ FESTE DATEILISTE. Eine neue *.spec.ts läuft NICHT von allein mit — sie
    // muss hier eingetragen werden, sonst bleibt sie unbemerkt liegen und die
    // Gesamtzahl der Prüfungen verrät den Unterschied nicht.
    // v2-17: `kategorien` kommt dazu (Gruppierungs-Regeln aus KAT-2).
    // v2-24: `welle-driver-states` kommt dazu (die drei Zustände der
    //        Treiber-Anzeige, seit die Treiber erst auf Anfrage geladen werden).
    // v2-28: `navigationsgrenze` kommt dazu (die untere Schranke, die seit
    //        Sprint 3 nie ausgelöst wurde). Die Warnung oben hat beim Bauen
    //        dieses Sprints sofort zugeschlagen: Die neue Datei lag da, war
    //        grün — und lief nicht. Aufgefallen ist es nur, weil die
    //        Gesamtzahl sich nicht bewegt hat. Genau deshalb steht hier eine
    //        Zahl im Review.
    // v2-29: `vorschlagszeile` kommt dazu (die leise Zeile unter der
    //        Beschreibung — dass sie an genau EINER Bedingung hängt, die
    //        Karte nicht höher macht und kein Kästchen wird).
    // v2-29 (Nachzug): `claude-md-umfang` kommt dazu — der Wächter gegen das
    //        stille Zuwachsen der Verfassung. Er misst Gesamtumfang,
    //        Erzählzone und Regelanteil. Anlass: CLAUDE.md war nach 21
    //        Sprints von 434 auf 1.712 Zeilen zurückgewachsen, ohne dass es
    //        jemand bemerkt hat — aus lauter richtigen Entscheidungen.
    { name: "visual", testMatch: /(visual-pixel|ring-subline|liquidity|fragment-showcase|consequence|kategorien|gehalt|loesch-tor|suggestion-visibility|doku-vollstaendigkeit|zuordnung|welle-driver-states|einkommen-monatsbezug|navigationsgrenze|vorschlagszeile|claude-md-umfang)\.spec\.ts/, use: DESKTOP },
    { name: "unauth", testMatch: /unauth\.spec\.ts/, use: DESKTOP },
    ...(hasCreds
      ? [
          { name: "setup", testMatch: /auth\.setup\.ts/, use: DESKTOP },
          {
            name: "render-smoke",
            testMatch: /render-smoke\.spec\.ts/,
            dependencies: ["setup"],
            use: { ...DESKTOP, storageState: "playwright/.auth/user.json" },
          },
        ]
      : []),
  ],
});
