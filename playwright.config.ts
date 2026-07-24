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
    { name: "visual", testMatch: /visual-pixel\.spec\.ts/, use: DESKTOP },
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
