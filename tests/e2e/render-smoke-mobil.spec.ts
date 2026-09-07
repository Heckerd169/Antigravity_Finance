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

// Nachzug 07.09.2026: Angemeldet ist die Anmeldeseite nicht erreichbar — mit
// einem geprüften Ziel führt sie dorthin, ohne Ziel aufs Dashboard.
test("angemeldet: /login?next=/mobil/zuordnen führt zum Ziel", async ({ page }) => {
  await page.goto("/login?next=%2Fmobil%2Fzuordnen");
  await expect(page).toHaveURL(/\/mobil\/zuordnen$/);
  await expect(page.getByText(/^Sparrate ·/).first()).toBeVisible();
});

test("angemeldet: /login?next=//evil.com wird verworfen — Dashboard", async ({ page }) => {
  await page.goto("/login?next=%2F%2Fevil.com");
  await expect(page).toHaveURL(/\/$/);
});

// 07.09.2026: Das Sheet „Karte wählen" — geöffnet, fotografiert, über „Abbrechen"
// geschlossen. Strikt read-only: kein Tipp auf eine Karte. Läuft nur, wenn der
// Monat eine offene Zahlung hat (sonst gibt es keinen Knopf „Andere Karte …").
// Anlass: Am iPhone war die Kontextzeile unter dem Titel abgeschnitten — das
// Flex-Layout drückte Kopf und Kontext zusammen, sobald die Liste die Höhe
// sprengte.
test("sheet „Karte wählen“: Kopf und Kontextzeile bleiben vollständig sichtbar", async ({ page }) => {
  await page.goto("/mobil/zuordnen");
  const andere = page.getByRole("button", { name: "Andere Karte …" });
  if ((await andere.count()) === 0) {
    test.skip(true, "keine offene Zahlung im laufenden Monat — kein Sheet zu öffnen");
  }
  await andere.click();
  const sheet = page.getByRole("dialog", { name: "Karte wählen" });
  await expect(sheet).toBeVisible();

  // Titel und Kontextzeile müssen ihre volle Höhe haben — nicht eingedrückt.
  const titel = sheet.getByText("Karte wählen", { exact: true });
  const kontext = sheet.locator("div").filter({ hasText: /·/ }).first();
  const tBox = await titel.boundingBox();
  const kBox = await kontext.boundingBox();
  expect(tBox?.height ?? 0).toBeGreaterThanOrEqual(18);
  expect(kBox?.height ?? 0).toBeGreaterThanOrEqual(17);
  // und die Kontextzeile liegt vollständig UNTER dem Titel, ohne Überlappung
  expect((kBox?.y ?? 0) >= (tBox?.y ?? 0) + (tBox?.height ?? 0) - 1).toBe(true);

  await page.screenshot({ path: "test-results/mobil-sheet.png", fullPage: false });
  await sheet.getByRole("button", { name: "Abbrechen" }).click();
  await expect(sheet).toBeHidden();
});
