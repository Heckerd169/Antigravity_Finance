import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * v3-01 — Rot heisst ausschliesslich „Abweichung" (v3 Regel 2).
 *
 * WARUM ES DIESEN WAECHTER GIBT.
 * In Sprint v3-01 wurden die Kartenzustaende von der Flaeche in den Statuspunkt
 * verlegt. Der Punkt selbst wurde korrekt umgebaut: leerer Ring fuer „noch
 * nicht", gefuellt tuerkis fuer „erledigt", gefuellt rot fuer „ueberschritten".
 *
 * Uebersehen wurde, dass INNERHALB des Rings noch ein zweites SVG steckt —
 * `IconOpenCircle` in card.tsx mit `fill="rgba(255,69,58,.55)"`, also exakt
 * --color-red, hartkodiert. „Offen" (jede Fixkosten-Karte) und „Laufend" (jede
 * Budget-Karte) zeigten damit weiterhin einen roten Punkt: der Normalzustand
 * von rund 80 % aller Karten an 80 % aller Tage, in derselben Farbe wie
 * „Budget ueberschritten".
 *
 * DIE PRUEFSTRECKE WAR DABEI 183/183 GRUEN. Kein Anker, keine Pruefsumme und
 * keine Invariante beruehrt eine Farbe — jede Zahl blieb richtig. Gefunden hat
 * es der Blick auf einen Screenshot.
 *
 * Dieser Waechter ist einmal absichtlich rot gesehen worden, bevor er gruen
 * gemeldet wurde (§7 Regel 27 / LL-40).
 */

const WURZEL = path.resolve(__dirname, "..", "..");
const CSS = fs.readFileSync(
  path.join(WURZEL, "src", "components", "cards", "cards.module.css"),
  "utf-8",
);

/** Liefert den Rumpf einer Regel, deren Selektorliste `sel` enthaelt. */
function block(css: string, sel: string): string {
  const i = css.indexOf(sel);
  if (i === -1) return "";
  const auf = css.indexOf("{", i);
  const zu = css.indexOf("}", auf);
  return auf === -1 || zu === -1 ? "" : css.slice(auf + 1, zu);
}

/** Entfernt Kommentare — sonst schlaegt der Waechter an, wenn ein Kommentar
 *  erklaert, WARUM eine Farbe verschwunden ist (LL-32, die Kehrseite). */
function ohneKommentare(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

test.describe("v3 · Rot heisst ausschliesslich Abweichung", () => {
  test("① die Zustaende „noch nicht“ zeigen keinen inneren Glyph", () => {
    const regel = block(CSS, ".iconOpen svg");

    expect(
      regel,
      "Offen/Erwartet/Forecast tragen einen LEEREN Kreis — der Ring allein ist " +
        "das Zeichen. Steckt darin noch ein SVG, traegt es seine hartkodierte " +
        "Farbe aus card.tsx und macht den Normalzustand farbig.",
    ).toMatch(/display:\s*none/);

    const selektoren = CSS.slice(
      CSS.indexOf(".iconOpen svg"),
      CSS.indexOf("{", CSS.indexOf(".iconOpen svg")),
    );
    for (const zustand of ["iconExpected", "iconGhost"]) {
      expect(
        selektoren,
        `${zustand} gehoert zur selben Gruppe „noch nicht" und muss mit ` +
          `ausgeblendet werden — sonst bleibt genau ein Zustand farbig zurueck`,
      ).toContain(zustand);
    }
  });

  test("② nur „erledigt“ und „ueberschritten“ haben eine gefuellte Flaeche", () => {
    const rein = ohneKommentare(CSS);

    expect(
      block(rein, ".iconPaid {"),
      "Erledigt ist die einzige tuerkis gefuellte Flaeche",
    ).toMatch(/background:\s*var\(--color-teal\)/);

    expect(
      block(rein, ".iconOver {"),
      "Ueberschritten ist der EINZIGE rote Kartenzustand",
    ).toMatch(/background:\s*var\(--color-red\)/);

    const nochNicht = block(rein, ".iconOpen,");
    expect(
      nochNicht,
      "Offen und Erwartet duerfen keine Flaeche haben — ein gefuellter Punkt " +
        "heisst „erledigt“, und das sind sie nicht",
    ).toMatch(/background:\s*none/);
    expect(nochNicht, "der Ring traegt die neutrale Textstufe").toMatch(
      /border:\s*1\.5px solid var\(--text-tertiary\)/,
    );
  });

  test("③ kein Zustands-Selektor faerbt mehr die Kartenflaeche", () => {
    const rein = ohneKommentare(CSS);

    for (const zustand of [".open", ".paid", ".expected", ".received", ".running", ".over"]) {
      const i = rein.indexOf(`\n${zustand} {`);
      if (i === -1) continue;
      const rumpf = rein.slice(rein.indexOf("{", i) + 1, rein.indexOf("}", i));
      expect(
        rumpf,
        `${zustand} darf keine eigene Flaeche mehr setzen — v3 Regel 1: die ` +
          `Zustandsfarbe verlaesst die Flaeche`,
      ).not.toMatch(/background/);
    }
  });

  test("④ die Karte traegt keine Container-Deckkraft mehr", () => {
    const rein = ohneKommentare(CSS);
    const karte = block(rein, ".card {");

    expect(
      karte,
      "v3 Regel 3: opacity auf dem Container multipliziert sich mit jeder " +
        "Deckkraft darin — gedimmt wird am Text, nie an der Box",
    ).not.toMatch(/opacity/);
  });
});
