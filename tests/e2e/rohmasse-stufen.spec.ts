import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * Design-Doku §8 — DIE DREI STUFEN DER ROHMASSE (neu gefasst in v3-01).
 *
 * §8 schreibt sie ausdruecklich als INVARIANTE fest:
 *
 *   arbeitsfaehig   volle Flaeche, Betrag primaer
 *   Uebertrag       volle Flaeche, Text sekundaer, Etikett
 *   zugeordnet      KEINE Flaeche (Kontur), Text tertiaer, Wort „· zugeordnet"
 *
 *   „Diese drei Stufen sind invariant; ihre Mittel sind Flaeche und Textstufe,
 *    nicht Deckkraft."
 *
 * Bis v3-01 lautete dieselbe Aussage `opacity: .72 / .45 / .22`, und sie war
 * seit v2-16 als Invariante geschuetzt — allerdings nur im Text der Doku, nicht
 * durch eine Pruefung. Diese Datei holt das nach.
 *
 * WARUM DIE PLATZIERUNG DES WORTES MITGEPRUEFT WIRD: Der v3-Entwurf zeigt
 * „· zugeordnet" hinter der Beschreibung. Gemessen mit dem echten
 * Schriftstapel hat die Fragment-Karte 192 px Inhaltsbreite, und drei von fuenf
 * echten Buchungstexten sind schon OHNE den Zusatz zu lang. Die Ellipse schnitt
 * damit genau das Wort ab, das die Kontur erklaert — sichtbar war es nur bei
 * kurzen Texten wie dem erfundenen „Miete August" des Entwurfs.
 *
 * Jede Pruefung hier ist einmal absichtlich rot gesehen worden (§7 Regel 27).
 */

const WURZEL = path.resolve(__dirname, "..", "..");
const CSS = fs.readFileSync(
  path.join(WURZEL, "src", "components", "interaction-zone", "interaction-zone.module.css"),
  "utf-8",
);
const TSX = fs.readFileSync(
  path.join(WURZEL, "src", "components", "interaction-zone", "fragment-card.tsx"),
  "utf-8",
);

function block(css: string, sel: string): string {
  const i = css.search(new RegExp("^\\" + sel + "\\s*\\{", "m"));
  if (i === -1) return "";
  const auf = css.indexOf("{", i);
  const zu = css.indexOf("}", auf);
  return auf === -1 || zu === -1 ? "" : css.slice(auf + 1, zu);
}

const ohneKommentare = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

test.describe("§8 · Die drei Stufen der Rohmasse", () => {
  test("① zugeordnet hat KEINE Flaeche — Kontur statt Deckkraft", () => {
    const b = block(ohneKommentare(CSS), ".fragmentCardLocked");

    expect(b, "die leiseste Stufe traegt keine Flaeche").toMatch(
      /background:\s*transparent/,
    );
    expect(b, "sie wird durch ihre Kontur erkennbar").toMatch(
      /border-color:\s*var\(--border-ghost\)/,
    );
    expect(
      b,
      "v3 Regel 3: die Abstufung laeuft ueber Flaeche und Textstufe, NICHT " +
        "ueber eine Container-Deckkraft — bei .22 x gedimmtem Text landet die " +
        "Beschreibung unter jeder Lesbarkeitsgrenze",
    ).not.toMatch(/opacity/);
  });

  test("② die Rangfolge der drei Stufen steht", () => {
    const rein = ohneKommentare(CSS);

    expect(
      block(rein, ".fragmentCard"),
      "die Arbeitsflaeche traegt die volle Kartenflaeche",
    ).toMatch(/background:\s*var\(--frag-bg\)/);

    expect(
      block(rein, ".fragmentCard"),
      "und keine Container-Deckkraft mehr",
    ).not.toMatch(/opacity/);

    expect(
      block(rein, ".fragmentCardTransfer"),
      "der Uebertrag behaelt seine Flaeche und wird nur im Text leiser",
    ).not.toMatch(/background|opacity/);
  });

  test("③ das Wort steht NICHT auf der abschneidenden Zeile", () => {
    // Die Beschreibung ist einzeilig mit Ellipsis — dort verschwindet jeder
    // Zusatz, sobald der Buchungstext laenger als ~115 px ist.
    expect(
      block(ohneKommentare(CSS), ".fragmentDesc"),
      "Voraussetzung dieser Pruefung: .fragmentDesc kuerzt mit Ellipsis",
    ).toMatch(/text-overflow:\s*ellipsis/);

    const zusatz = /["'`]\s*·\s*zugeordnet\s*["'`]/;
    const stelle = TSX.search(zusatz);
    expect(stelle, "das Wort „· zugeordnet“ muss gerendert werden").toBeGreaterThan(-1);

    // Welches Element umschliesst es? Das zuletzt davor geoeffnete.
    const davor = TSX.slice(0, stelle);
    const letzteDesc = davor.lastIndexOf("styles.fragmentDesc");
    const letztesDatum = davor.lastIndexOf("styles.fragmentDate");

    expect(
      letztesDatum,
      "das Wort gehoert auf die Datumszeile — sie bricht nicht ab",
    ).toBeGreaterThan(letzteDesc);

    expect(
      block(ohneKommentare(CSS), ".fragmentDate"),
      "und diese Zeile darf selbst nicht kuerzen, sonst ist nichts gewonnen",
    ).not.toMatch(/text-overflow/);
  });

  test("④ der Uebertrag behaelt sein Etikett, der zugeordnete das Wort", () => {
    expect(
      TSX,
      "die beiden leisen Stufen sind unterscheidbar: Etikett gegen Wort",
    ).toMatch(/isTransfer/);
    expect(
      TSX,
      "das Wort gilt nur fuer zugeordnete, nicht fuer Uebertraege — die haben " +
        "ihr TRANSFER-Etikett",
    ).toMatch(/isLocked\s*&&\s*!isTransfer/);
  });
});
