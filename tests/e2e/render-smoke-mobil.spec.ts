import { expect, test } from "@playwright/test";

// Render-Smoke für /mobil (v3-02) — strikt READ-ONLY, wie render-smoke.spec.ts:
// Seitenaufruf, Monatsnavigation, keine Server Actions. Läuft im Projekt
// `render-smoke-mobil` bei 430 × 932 (iPhone 15 Pro Max), angemeldet über
// denselben storageState wie der Schreibtisch-Smoke.
//
// Was er sieht, hängt vom Datenstand ab: Heute (07.09.2026) ist in jedem
// Monat 2026 alles zugeordnet, also der Zustand „leer". Deshalb prüft der Test
// den Rahmen und akzeptiert jeden der drei Zustände der Fläche — er ist ein
// Filter vor dem Browser-Smoke des Users, kein Ersatz dafür.

test("mobil/zuordnen rendert: Kopf, Monat, Tab-Leiste, eine Fläche", async ({ page }) => {
  await page.goto("/mobil/zuordnen");

  await expect(page.getByText(/^Sparrate ·/).first()).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Monat" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Bereiche" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Zuordnen" })).toBeVisible();
  await expect(page.getByText("Danach im Stapel")).toBeVisible();

  const leer = page.getByText("Alles zugeordnet", { exact: true });
  const forecast = page.getByText("Noch keine Umsätze", { exact: true });
  const fokus = page.getByText(/^Buchung ·/);
  await expect(leer.or(forecast).or(fokus).first()).toBeVisible();

  await page.screenshot({ path: "test-results/mobil-zuordnen.png", fullPage: true });
});

test("mobil: Monatsnavigation trägt den Monat in der URL und die Tab-Leiste behält ihn", async ({
  page,
}) => {
  await page.goto("/mobil/zuordnen");
  const zurueck = page.getByRole("link", { name: /^Zurück zu/ });
  await expect(zurueck).toBeVisible();
  await zurueck.click();
  await expect(page).toHaveURL(/\/mobil\/zuordnen\?month=\d{4}-\d{2}$/);
  const monat = new URL(page.url()).searchParams.get("month");
  await expect(page.getByRole("link", { name: "Zuordnen" })).toHaveAttribute(
    "href",
    `/mobil/zuordnen?month=${monat}`,
  );
});

test("/mobil leitet auf den Tab Zuordnen", async ({ page }) => {
  await page.goto("/mobil");
  await expect(page).toHaveURL(/\/mobil\/zuordnen/);
});
