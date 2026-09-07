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
test("unauthentifiziert: /mobil/zuordnen leitet auf /login um — und merkt sich das Ziel", async ({ page }) => {
  await page.goto("/mobil/zuordnen?month=2026-08");
  await page.waitForURL("**/login**");
  await expect(page.getByRole("heading", { name: "Anmeldung" })).toBeVisible();
  // Nachzug 07.09.2026: Das Ziel samt Monat steht als `next` an der Anmeldeseite
  // und als verstecktes Feld im Formular — nach dem Anmelden geht es dorthin.
  expect(new URL(page.url()).searchParams.get("next")).toBe("/mobil/zuordnen?month=2026-08");
  await expect(page.locator('input[name="next"]')).toHaveValue("/mobil/zuordnen?month=2026-08");
});

test("unauthentifiziert: / bekommt KEIN next — das Dashboard ist das Standardziel", async ({ page }) => {
  await page.goto("/");
  await page.waitForURL("**/login**");
  expect(new URL(page.url()).searchParams.has("next")).toBe(false);
});

test("/mobile (englisch) landet auf /mobil — vor der Middleware umgeleitet", async ({ page }) => {
  await page.goto("/mobile");
  await page.waitForURL("**/login**");
  expect(new URL(page.url()).searchParams.get("next")).toBe("/mobil");
});
