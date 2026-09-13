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

// v3-03: `/mobil` ist jetzt die Übersicht (Handoff §4, Tab 1). Bis v3-02 führte
// die Route auf „Zuordnen", weil es den einzigen Tab gab.
test("/mobil leitet auf die Übersicht", async ({ page }) => {
  await page.goto("/mobil");
  await expect(page).toHaveURL(/\/mobil\/uebersicht/);
});

// ── Die drei Sichten aus v3-03 (MB-6) ─────────────────────────────────────
//
// Auch hier gilt: Was der Smoke SIEHT, hängt vom Datenstand ab. Geprüft wird
// der Rahmen — dass die Seite steht, die Tab-Leiste da ist und die tragenden
// Stücke gerendert sind. Der Browser-Smoke des Users am iPhone bleibt der
// eigentliche Gate.

test("mobil/uebersicht rendert: Ring vor der Welle, drei Kacheln, Einstieg", async ({
  page,
}) => {
  await page.goto("/mobil/uebersicht");

  await expect(page.getByRole("navigation", { name: "Bereiche" })).toBeVisible();
  // Der Ring bringt sein eigenes aria-label mit — er wird BENUTZT, nicht
  // nachgebaut (LL-26).
  await expect(page.getByRole("img", { name: /Singularity Ring/ })).toBeVisible();
  await expect(page.getByText("SPARRATE", { exact: true })).toBeVisible();

  for (const titel of ["FIXKOSTEN", "BUDGET", "EINNAHMEN"]) {
    await expect(page.getByText(titel, { exact: true })).toBeVisible();
  }

  const offen = page.getByText(/\d+ Ums(atz|ätze) zuordnen/);
  const fertig = page.getByText("Alles zugeordnet", { exact: true });
  await expect(offen.or(fertig).first()).toBeVisible();

  // Der Bogen wächst über eine Transition von 0,72 s aus dem Leeren heraus
  // (`singularity-ring.module.css`). Ein Screenshot davor zeigt einen Stummel
  // und sieht aus wie ein Fehler — genau so ist er beim optischen Smoke dieses
  // Sprints einmal falsch gelesen worden. Gewartet wird auf das Ende der
  // Animation, nicht auf eine Zahl: Der Zielwert hängt an den Live-Daten.
  await page
    .locator("svg circle")
    .first()
    .evaluate((el) =>
      Promise.all(
        el.getAnimations({ subtree: true }).map((a) => a.finished.catch(() => null)),
      ).then(() => undefined),
    );
  await page.waitForTimeout(150);

  await page.screenshot({ path: "test-results/mobil-uebersicht.png", fullPage: true });
});

test("mobil/karten rendert: Filter-Pillen und die Liste des Monats", async ({ page }) => {
  await page.goto("/mobil/karten");

  await expect(page.getByRole("navigation", { name: "Bereiche" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^Karten ·/ })).toBeVisible();
  for (const pille of ["Alle", "Fixkosten", "Budget", "Einmalig", "Einnahmen"]) {
    await expect(page.getByRole("tab", { name: pille })).toBeVisible();
  }
  // „Alle" ist die Vorbelegung — der Nutzer sieht zuerst alles.
  await expect(page.getByRole("tab", { name: "Alle" })).toHaveAttribute(
    "aria-selected",
    "true",
  );

  await page.screenshot({ path: "test-results/mobil-karten.png", fullPage: true });
});

test("mobil/verlauf rendert: sechs Balken, Durchschnitt, Detailkarte", async ({ page }) => {
  await page.goto("/mobil/verlauf");

  await expect(page.getByRole("navigation", { name: "Bereiche" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Verlauf" })).toBeVisible();
  await expect(page.getByText("Sparrate, 6 Monate")).toBeVisible();
  await expect(page.getByText("Ø je Monat")).toBeVisible();
  // Sechs Monate, keiner mehr und keiner weniger.
  await expect(page.locator("button[aria-pressed]")).toHaveCount(6);
  // Genau einer ist gewählt, und seine Detailkarte steht darunter.
  await expect(page.locator('button[aria-pressed="true"]')).toHaveCount(1);
  await expect(page.getByText(/^SPARRATE · /)).toBeVisible();

  await page.screenshot({ path: "test-results/mobil-verlauf.png", fullPage: true });
});

test("mobil: die Tab-Leiste trägt den Monat in ALLE vier Ziele", async ({ page }) => {
  // Ohne `?month=` spränge ein Tab-Wechsel zurück auf den laufenden Monat, und
  // der Nutzer verlöre beim Blättern durch alte Monate seinen Platz.
  await page.goto("/mobil/uebersicht?month=2026-03");
  for (const [label, pfad] of [
    ["Übersicht", "uebersicht"],
    ["Zuordnen", "zuordnen"],
    ["Karten", "karten"],
    ["Verlauf", "verlauf"],
  ]) {
    await expect(page.getByRole("link", { name: label })).toHaveAttribute(
      "href",
      `/mobil/${pfad}?month=2026-03`,
    );
  }
});

// v3-04 (`MB-7`): Der Gegenstück-Wächter zu `mobil-vollbild.spec.ts`. Jener liest
// Quelldateien; dieser hier prüft, was TATSÄCHLICH ausgeliefert wird — die
// gerenderten Tab-Ziele gegen das über HTTP geholte Manifest. Damit hängt er an
// keinem Muster in einer Datei, sondern am fertigen Ergebnis.
//
// Was er NICHT beweist: dass iOS sich an den Zugehörigkeitsbereich hält. Das kann
// Chromium nicht zeigen; der Beweis ist die Abnahme am Gerät.
test("mobil: jedes ausgelieferte Tab-Ziel liegt im Zugehörigkeitsbereich des Manifests", async ({
  page,
}) => {
  await page.goto("/mobil/uebersicht?month=2026-03");

  const verweis = await page
    .locator("link[rel='manifest']")
    .getAttribute("href");
  expect(verweis, "Die Seite trägt keinen Manifest-Verweis").toBeTruthy();

  const antwort = await page.request.get(verweis!);
  expect(
    antwort.status(),
    "Das Manifest ist nicht erreichbar — läuft die Middleware darauf?",
  ).toBe(200);
  const manifest = (await antwort.json()) as { scope: string; start_url: string };

  const ziele = await page
    .getByRole("navigation", { name: "Bereiche" })
    .getByRole("link")
    .evaluateAll((as) => as.map((a) => new URL((a as HTMLAnchorElement).href).pathname));

  expect(ziele.length, "Keine Tab-Ziele gerendert").toBe(4);
  for (const pfad of ziele) {
    expect(
      pfad.startsWith(manifest.scope),
      `Tab-Ziel ${pfad} liegt außerhalb von scope "${manifest.scope}" — iOS öffnet es im Browser-Rahmen`,
    ).toBe(true);
  }
  expect(manifest.start_url.startsWith(manifest.scope)).toBe(true);
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
