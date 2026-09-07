import { expect, test } from "@playwright/test";

// Läuft ohne Credentials — verifiziert Middleware-Guard + Login-Render.

test("unauthentifiziert: / leitet auf /login um", async ({ page }) => {
  await page.goto("/");
  await page.waitForURL("**/login**");
  await expect(page.getByRole("heading", { name: "Anmeldung" })).toBeVisible();
});

test("login-seite rendert das formular", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator("#email")).toBeVisible();
  await expect(page.locator("#password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Anmelden" })).toBeVisible();
});

// v3-02 (/mobil): Die Middleware schützt die neue Route wie das Dashboard —
// Prüfschritt S1 des Briefings. Unangemeldet gibt es weder Stapel noch Sparrate.
test("unauthentifiziert: /mobil/zuordnen leitet auf /login um", async ({ page }) => {
  await page.goto("/mobil/zuordnen");
  await page.waitForURL("**/login**");
  await expect(page.getByRole("heading", { name: "Anmeldung" })).toBeVisible();
});
