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

// v2-10 P6 — Regressions-Wächter. Der Portal-Fix aus P1 hatte den
// data-wave-block-Schutz der Welle ausgehebelt: Das Einkommens-Popup hängt seither
// unter document.body, während React den Klick weiterhin durch den React-Baum nach
// oben reicht. `closest("[data-wave-block]")` in welle/index.tsx lief damit ins
// Leere und jeder Klick im Popup riss zusätzlich das Jahres-Popup auf.
// Strikt read-only: öffnen, klicken, über "Abbrechen" schließen — nie "Übernehmen".
test("einkommens-popup: klick darin öffnet nicht die jahres-welle", async ({ page }) => {
  await page.goto("/");

  const wellePopupClose = page.getByRole("button", { name: "Popup schließen" });
  const incomeDialog = page.locator('[role="dialog"][aria-modal="true"]');

  for (const label of [/Ich — Jahresbrutto/, /Partner — Jahresbrutto/]) {
    await page.getByRole("button", { name: label }).click();
    await expect(incomeDialog).toBeVisible();
    await expect(wellePopupClose).toBeHidden();

    // Klick auf die Überschrift im Popup — ein Element ohne eigenen Handler.
    // Genau dieser Fall riss vorher die Welle auf.
    await incomeDialog.locator("h2").click();
    await expect(wellePopupClose).toBeHidden();

    await page.getByRole("button", { name: "Abbrechen" }).click();
    await expect(incomeDialog).toBeHidden();
    await expect(wellePopupClose).toBeHidden();
  }

  // Gegenprobe: Der Wächter darf nicht zu viel blockieren — ein Klick auf die
  // Welle selbst muss das Jahres-Popup weiterhin öffnen.
  const canvas = page.locator("canvas").first();
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Welle-Canvas ohne BoundingBox");
  await page.mouse.click(box.x + box.width * 0.38, box.y + box.height * 0.82);
  await expect(wellePopupClose).toBeVisible();
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
