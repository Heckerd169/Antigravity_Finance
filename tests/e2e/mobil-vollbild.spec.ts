import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * Wächter über die Vollbild-Zusage von `/mobil` (v3-04, `MB-7`).
 *
 * ── Was diese Datei beweist — und was NICHT ─────────────────────────────────
 *
 * **Kein Test dieses Projekts kann den gemeldeten Fehler sehen.** Playwright läuft
 * in Chromium; den Vollbild-Modus einer Home-Bildschirm-App, die Prüfung der
 * Zugehörigkeit und den Wechsel in den eingebetteten Browser gibt es dort nicht.
 * v3-03 hatte 301 grüne Tests, darunter elf Render-Prüfungen bei exakt 430 × 932 —
 * und genau dieser Fehler ist durchgerutscht.
 *
 * Diese Wächter prüfen deshalb nicht das Verhalten von iOS, sondern die **Aussage,
 * die wir iOS geben**: dass sie vorhanden, vollständig und erreichbar ist. Ob iOS
 * sich daran hält, beweist allein die Abnahme am Gerät. Das steht hier, damit die
 * nächste Sitzung einen grünen Lauf nicht für mehr hält, als er ist (LL-40).
 *
 * Alle Prüfungen lesen die **echten** Dateien — die Manifest-Datei, die echte
 * Tab-Leiste, den echten matcher aus der Middleware. Keine Regel wird nachgebaut;
 * ein Nachbau driftet ab und gibt falsche Sicherheit.
 *
 * Wächter 1 und 4 wurden beim Bauen je einmal absichtlich rot gesehen (LL-40):
 * ein Tab-Ziel auf `/handy/...` gelegt, und `webmanifest` aus dem matcher entfernt.
 */

const WURZEL = path.resolve(__dirname, "../..");

function lies(rel: string): string {
  return fs.readFileSync(path.join(WURZEL, rel), "utf8");
}

/** Alle Treffer der ersten Gruppe. Bewusst als Schleife statt `matchAll` mit
 *  Spread — das braucht ein höheres Compile-Ziel, als dieses Projekt setzt. */
function alleTreffer(text: string, muster: RegExp): string[] {
  const regex = new RegExp(muster.source, muster.flags.includes("g") ? muster.flags : muster.flags + "g");
  const gefunden: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) gefunden.push(m[1]);
  return gefunden;
}

const manifest = JSON.parse(lies("public/mobil.webmanifest")) as {
  scope: string;
  start_url: string;
  display: string;
  name: string;
  short_name: string;
  background_color: string;
  theme_color: string;
  icons: { src: string; sizes: string; type: string }[];
};

/** Die Regel, nach der ein Gerät entscheidet, ob eine Adresse noch zur App gehört:
 *  reiner Zeichen-Präfix auf dem Pfad. Bewusst hier formuliert und nicht importiert —
 *  sie stammt aus der Manifest-Spezifikation, nicht aus unserem Code. */
function imZugehoerigkeitsbereich(pfad: string, scope: string): boolean {
  return pfad.startsWith(scope);
}

test.describe("Vollbild-Zusage von /mobil (MB-7)", () => {
  test("① jedes Ziel der echten Tab-Leiste liegt im Zugehörigkeitsbereich", () => {
    const quelle = lies("src/components/mobil/tab-bar/index.tsx");

    // Aus der echten Komponente gezogen, nicht nachgebaut.
    const ids = alleTreffer(quelle, /\bid:\s*"([a-z]+)"/g);
    const ziele = alleTreffer(quelle, /\bhref:\s*`([^`]+)`/g);

    // Ohne diese Zeile wäre der Wächter bei einer umgeschriebenen Tab-Leiste still
    // grün — er fände schlicht nichts mehr und prüfte eine leere Menge.
    expect(
      ziele.length,
      "Kein Tab-Ziel in tab-bar/index.tsx gefunden — die Datei ist umgebaut und dieser Wächter prüft nichts mehr",
    ).toBeGreaterThan(0);
    expect(
      ziele.length,
      "Anzahl der Tab-Ziele passt nicht zur Anzahl der Tab-Kennungen",
    ).toBe(ids.length);

    for (const ziel of ziele) {
      const pfad = ziel.split("?")[0];
      expect(
        imZugehoerigkeitsbereich(pfad, manifest.scope),
        `Tab-Ziel ${pfad} liegt außerhalb von scope "${manifest.scope}" — iOS öffnet es im Browser-Rahmen`,
      ).toBe(true);
    }
  });

  test("② die Startadresse liegt im eigenen Zugehörigkeitsbereich und ist eine echte Route", () => {
    expect(
      imZugehoerigkeitsbereich(manifest.start_url, manifest.scope),
      `start_url "${manifest.start_url}" liegt außerhalb von scope "${manifest.scope}"`,
    ).toBe(true);

    // Der Schrägstrich am Ende ist die Falle: "/mobil/" deckt "/mobil" NICHT ab,
    // und "/mobil" ist die Startadresse. Ein Zeichen mehr legt den Einstieg der App
    // nach draußen.
    expect(
      manifest.scope.endsWith("/") && manifest.scope.length > 1,
      'scope darf nicht auf "/" enden — sonst fällt die Startadresse /mobil heraus',
    ).toBe(false);

    const route = manifest.start_url.replace(/^\//, "");
    expect(
      fs.existsSync(path.join(WURZEL, "src/app", route, "page.tsx")),
      `Zu start_url "${manifest.start_url}" gibt es keine Seite`,
    ).toBe(true);
  });

  test("③ der Vollbild-Modus ist überhaupt angefordert, und die Startfläche ist die der App", () => {
    expect(manifest.display).toBe("standalone");

    // Die Fläche, in die die Seite beim Start hineinwächst. Ein anderer Wert
    // erzeugt einen sichtbaren Farbsprung. Wert aus tokens.css, nicht geraten.
    const tokens = lies("src/styles/tokens.css");
    const bgPrimary = /--bg-primary:\s*(#[0-9A-Fa-f]{6})/.exec(tokens)?.[1];
    expect(bgPrimary, "--bg-primary nicht in tokens.css gefunden").toBeTruthy();
    expect(manifest.background_color.toUpperCase()).toBe(bgPrimary!.toUpperCase());
    expect(manifest.theme_color.toUpperCase()).toBe(bgPrimary!.toUpperCase());

    expect(manifest.short_name).toBe("Antigravity");
  });

  test("④ der echte Middleware-matcher lässt die Manifest-Datei durch", () => {
    const quelle = lies("src/middleware.ts");
    const muster = /matcher:\s*\[\s*"([^"]+)"/.exec(quelle)?.[1];
    expect(muster, "matcher-Muster nicht in src/middleware.ts gefunden").toBeTruthy();

    // Der ECHTE Regex aus der Middleware, nicht eine Nachbildung davon.
    const regex = new RegExp(`^${muster!.replace(/\\\\/g, "\\")}$`);

    // Gegenprobe zuerst: Der Regex muss überhaupt greifen, sonst prüft die Zeile
    // darunter nichts.
    expect(
      regex.test("/mobil/uebersicht"),
      "Der matcher greift nicht einmal auf einer normalen Seite — das Muster wurde falsch gelesen",
    ).toBe(true);

    expect(
      regex.test("/mobil.webmanifest"),
      "Die Middleware läuft auf der Manifest-Datei — das Gerät bekäme die Anmeldeseite als HTML statt des Manifests",
    ).toBe(false);

    for (const icon of manifest.icons) {
      expect(
        regex.test(icon.src),
        `Die Middleware läuft auf ${icon.src} — das Symbol käme nie an`,
      ).toBe(false);
    }
  });

  test("⑤ das Mobil-Layout verweist auf die Manifest-Datei, und die gibt es", () => {
    const layout = lies("src/app/mobil/layout.tsx");
    const verweis = /manifest:\s*"([^"]+)"/.exec(layout)?.[1];
    expect(verweis, "Kein manifest-Verweis in src/app/mobil/layout.tsx").toBeTruthy();
    expect(
      fs.existsSync(path.join(WURZEL, "public", verweis!.replace(/^\//, ""))),
      `Der Verweis ${verweis} zeigt ins Leere`,
    ).toBe(true);

    // Der Verweis gehört NUR unter /mobil. Die Schreibtisch-Ansicht ist kein
    // Handy-Programm und soll auch keines behaupten.
    expect(
      lies("src/app/layout.tsx").includes("manifest"),
      "Das Wurzel-Layout trägt einen Manifest-Verweis — dann behauptet auch die Schreibtisch-Ansicht, eine App zu sein",
    ).toBe(false);
  });

  test("⑥ die Symbole liegen da und haben die Maße, die sie behaupten", () => {
    /** Breite und Höhe aus dem PNG-Kopf (IHDR, Bytes 16–23, big-endian). */
    function masse(rel: string): { breite: number; hoehe: number } {
      const b = fs.readFileSync(path.join(WURZEL, rel));
      return { breite: b.readUInt32BE(16), hoehe: b.readUInt32BE(20) };
    }

    // 180 × 180 ist das Maß, das iOS für das Home-Symbol nimmt.
    const apple = masse("src/app/mobil/apple-icon.png");
    expect(apple).toEqual({ breite: 180, hoehe: 180 });

    for (const icon of manifest.icons) {
      const rel = path.join("public", icon.src.replace(/^\//, ""));
      expect(fs.existsSync(path.join(WURZEL, rel)), `${icon.src} fehlt`).toBe(true);
      const [b, h] = icon.sizes.split("x").map(Number);
      expect(
        masse(rel),
        `${icon.src} hat nicht die im Manifest angegebene Größe ${icon.sizes}`,
      ).toEqual({ breite: b, hoehe: h });
    }
  });
});
