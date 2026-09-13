/* Erzeugt die beiden Symbol-PNGs aus `app-symbol.svg`.
 *
 * Aufruf aus dem Projekt-Wurzelverzeichnis:
 *   node design-system/handoff/mobile/symbol/erzeuge-png.mjs
 *
 * Warum ein Skript und nicht zwei eingecheckte Bilder ohne Quelle: Ein PNG ist im
 * Diff nicht lesbar. Die Figur steht deshalb im SVG daneben, und die PNGs sind
 * daraus jederzeit neu erzeugbar — wer die Figur ändern will, ändert das SVG.
 *
 * Ziele:
 *   src/app/mobil/apple-icon.png  180 × 180 — das Home-Symbol, der Weg den iOS nimmt
 *   public/mobil-icon-512.png     512 × 512 — das `icons`-Feld des Manifests
 *
 * Ohne Alpha-Kanal gerendert (`omitBackground: false`): iOS füllt Transparenz in
 * Home-Symbolen mit Schwarz, und die Fläche ist ohnehin deckend --bg-primary. */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const HIER = path.dirname(new URL(import.meta.url).pathname);
const WURZEL = path.resolve(HIER, "../../../..");
const svg = fs.readFileSync(path.join(HIER, "app-symbol.svg"), "utf8");

const ZIELE = [
  { pfad: path.join(WURZEL, "src/app/mobil/apple-icon.png"), groesse: 180 },
  { pfad: path.join(WURZEL, "public/mobil-icon-512.png"), groesse: 512 },
];

const browser = await chromium.launch();
for (const { pfad, groesse } of ZIELE) {
  const page = await browser.newPage({
    viewport: { width: groesse, height: groesse },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    `<style>html,body{margin:0;padding:0;background:#0D0D0F}
     svg{display:block;width:${groesse}px;height:${groesse}px}</style>${svg}`,
  );
  fs.mkdirSync(path.dirname(pfad), { recursive: true });
  await page.screenshot({ path: pfad, omitBackground: false });
  await page.close();
  console.log(`${groesse} × ${groesse} → ${path.relative(WURZEL, pfad)}`);
}
await browser.close();
