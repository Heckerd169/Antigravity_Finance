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

// Regressions-Wächter für einen Fehler, der durch die GESAMTE Prüfstrecke von
// v2-17 gerutscht ist (gemeldet 11.08.2026).
//
// Das ⋯-Icon der Ordner-Kachel benutzte die Klasse aus `cards.module.css`. Die
// steht auf `opacity: 0` und wird von genau EINER Regel sichtbar gemacht:
// `.card:hover .contextIcon`. Die Kachel liegt aber in `.catWrap` — der Selektor
// griff nie, der Knopf blieb dauerhaft unsichtbar, und „Kategorie umbenennen …"
// wie „Kategorie löschen" waren nicht erreichbar (LL-6, Phantom-Sichtbarkeit).
//
// WARUM NICHTS DAVON AUFFIEL: tsc, ESLint und Build sehen CSS-Selektoren nicht.
// Die 21 neuen Prüfungen testen `category-groups.ts` — reine Logik, kein DOM.
// Und die Screenshots beim Bauen zeigten die Kachel zwar, aber niemand ist mit
// der Maus darübergefahren. Ein unsichtbarer Knopf sieht auf einem Standbild
// exakt aus wie eine Kachel ohne Knopf.
//
// Deshalb prüft dieser Test die EINE Eigenschaft, die gekippt war: Wird das Icon
// beim Überfahren der Kachel sichtbar? Read-only — es wird gehovert, nicht
// geklickt; das Menü bleibt zu, keine Server Action läuft.
test("kategorie-kachel: das ⋯-menü wird beim überfahren sichtbar", async ({ page }) => {
  await page.goto("/");

  // Bewusst NICHT „die erste Kachel": Das ist „Einkommen", und die hat gar kein
  // Menü — sie ist ein Sammelbecken der Anzeige, keine Zeile in der Datenbank.
  // Deshalb vom Menü-Knopf aus rückwärts auf seine Kachel schließen.
  const menueKnopf = page.getByRole("button", { name: /^Optionen für / }).first();
  await expect(menueKnopf).toBeAttached();

  // Vor dem Hover unsichtbar — das ist der beabsichtigte Ruhezustand.
  await expect(menueKnopf).toHaveCSS("opacity", "0");

  // Der Wrapper `.catWrap` ist der Eltern-Knoten, an dem der Hover hängt.
  // Genau diese Beziehung war gebrochen, deshalb wird sie hier geprüft.
  await menueKnopf.locator("xpath=..").hover();

  await expect(menueKnopf).toHaveCSS("opacity", "1");
});

// Regressions-Wächter gegen das Springen der Ansicht beim Monatswechsel
// (gemeldet 13.08.2026, behoben in v2-18).
//
// Die drei Spalten der Interaktionszone stehen auf `align-items: stretch`; die
// Zone ist also so hoch wie ihre höchste Spalte. Solange die Rohmasse ihre Höhe
// vom Bestand ableitete, fiel die Zone in Monaten ohne Umsätze zusammen — und
// die Welle darüber (`page.module.css .stage`, `flex: 1 1 280px`) bekam die
// frei gewordene Höhe geschenkt. Gemessen: 341 px gegen 215 px, also 126 px
// Sprung zwischen Juli und August.
//
// Der Test prüft die URSACHE, nicht das Symptom: Die Zonenhöhe darf nicht vom
// Monat abhängen. Bewusst über MEHRERE Monate statt an einem Einzelfall — sonst
// hinge er daran, dass ausgerechnet der August leer ist (LL-19).
//
// Läuft gegen den dev-Server, und das ist hier richtig: Geprüft wird die Zone,
// nicht die Welle. Der Sprung der WELLE ist gegen den dev-Server nicht sichtbar,
// weil das Entwickler-Panel sie in beiden Monaten auf ihr Minimum drückt.
test("layout: die höhe der interaktionszone hängt nicht vom monat ab", async ({ page }) => {
  const monate = ["2026-06", "2026-07", "2026-08", "2026-09"];
  const hoehen: { monat: string; hoehe: number; umsaetze: number }[] = [];

  for (const monat of monate) {
    await page.goto(`/?month=${monat}`);
    await expect(page.locator('[class*="interactionZone"]')).toBeVisible();
    // Auf die Karten warten, sonst wird gemessen, bevor das Karussell steht.
    await expect(page.getByText("Ordner").first()).toBeVisible();

    const gemessen = await page.evaluate(() => {
      const zone = document.querySelector('[class*="interactionZone"]');
      return {
        hoehe: zone ? Math.round(zone.getBoundingClientRect().height) : -1,
        umsaetze: document.querySelectorAll('[class*="fragmentCard"]').length,
      };
    });
    hoehen.push({ monat, ...gemessen });
  }

  // Aussagekraft sichern: Wären alle vier Monate gleich voll, bewiese der Test
  // nichts. Mindestens einer muss Umsätze haben und mindestens einer keine.
  const mitUmsaetzen = hoehen.filter((h) => h.umsaetze > 0).length;
  const ohneUmsaetze = hoehen.filter((h) => h.umsaetze === 0).length;
  expect(
    mitUmsaetzen > 0 && ohneUmsaetze > 0,
    `Der Test braucht beide Fälle. Gemessen: ${JSON.stringify(hoehen)}`,
  ).toBe(true);

  // Bewusst ohne `new Set(...)`-Spread: Die tsconfig zielt auf ein Ziel, das
  // Iteration über ein Set nicht ohne `downlevelIteration` erlaubt.
  const eindeutig = hoehen
    .map((h) => h.hoehe)
    .filter((h, i, alle) => alle.indexOf(h) === i);
  expect(
    eindeutig.length,
    `Zonenhöhe schwankt zwischen den Monaten: ${JSON.stringify(hoehen)}`,
  ).toBe(1);
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
