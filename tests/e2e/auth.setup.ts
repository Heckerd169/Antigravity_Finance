import { expect, test as setup } from "@playwright/test";

const STORAGE_STATE = "playwright/.auth/user.json";

// Option A (User-Entscheid 23.07.2026): einmal pro Lauf über die echte
// /login-Seite anmelden und die Session als storageState speichern — kein
// Nachbau der @supabase/ssr-Cookie-Interna, Login-Pfad wird mitgesmoked.
// Schlägt der Login fehl, bleibt die URL auf /login (?error=1) und der
// waitForURL unten läuft in den Timeout — Fehlerbild ist dann eindeutig.
setup("login via ui, session als storageState speichern", async ({ page }) => {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;
  if (!email || !password) {
    throw new Error("E2E_TEST_EMAIL / E2E_TEST_PASSWORD fehlen (.env.e2e.local)");
  }

  await page.goto("/login");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Anmelden" }).click();

  await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
    timeout: 30_000,
  });
  await expect(
    page.getByText("SPARRATE", { exact: true }).first()
  ).toBeVisible();

  await page.context().storageState({ path: STORAGE_STATE });
});
