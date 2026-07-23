import { expect, test } from "@playwright/test";

// M0 Render-Smoke — strikt READ-ONLY (dev-Server zeigt auf die Prod-DB):
// nur Seitenaufrufe, Popup öffnen/schließen und Header-Navigation.
// KEINE Karten-Taps, keine Drops, keine Imports, keine Server Actions.

function ymOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

test("dashboard rendert: ring, welle-canvas, header-pill", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("img", { name: /Singularity Ring/ })
  ).toBeVisible();
  await expect(page.getByText("SPARRATE", { exact: true }).first()).toBeVisible();
  await expect(page.locator("canvas").first()).toBeVisible();
  await expect(page.getByText("Laufend", { exact: true }).first()).toBeVisible();
});

test("welle-popup öffnet per klick und schließt per escape", async ({ page }) => {
  await page.goto("/");
  const canvas = page.locator("canvas").first();
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Welle-Canvas ohne BoundingBox");

  const closeButton = page.getByRole("button", { name: "Popup schließen" });

  // Roher Maus-Klick (ohne Actionability-Wartezeit), unten im Feld — dort
  // liegen keine data-wave-block-Zonen (Income-Labels/Ring-Slot). Zweite
  // Position als Layout-Toleranz.
  const candidates = [
    { x: box.x + box.width * 0.38, y: box.y + box.height * 0.82 },
    { x: box.x + box.width * 0.18, y: box.y + box.height * 0.6 },
  ];
  for (const pos of candidates) {
    await page.mouse.click(pos.x, pos.y);
    try {
      await closeButton.waitFor({ state: "visible", timeout: 3_000 });
      break;
    } catch {
      // nächste Kandidaten-Position probieren
    }
  }
  await expect(closeButton).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(closeButton).toBeHidden();
});

test("monatsnavigation: vor und zurück über die header-flanken", async ({ page }) => {
  const now = new Date();
  const current = ymOf(now);
  const next = ymOf(new Date(now.getFullYear(), now.getMonth() + 1, 1));

  await page.goto("/");
  await expect(page.getByText("Laufend", { exact: true }).first()).toBeVisible();

  await page.locator(`a[href="/?month=${next}"]`).click();
  await page.waitForURL(`**/?month=${next}`);
  await expect(page.getByText("Forecast", { exact: true }).first()).toBeVisible();

  await page.locator(`a[href="/?month=${current}"]`).click();
  await page.waitForURL(`**/?month=${current}`);
  await expect(page.getByText("Laufend", { exact: true }).first()).toBeVisible();
});
