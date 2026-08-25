import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// Wächter für die Vorschlagszeile in der Rohmasse (v2-29, `ZO-5` / `F2`).
//
// ANLASS: Der Kartenvorschlag wird seit v2-07 berechnet, seit v2-10 aber nicht
// mehr gezeichnet (`SHOW_SUGGESTION_BADGES = false`). Sichtbar war er nur im
// Schaufenster-Popup — also NACHDEM man eine Zahlung bereits angefasst hat. Das
// ist die falsche Reihenfolge: Der Vorschlag soll helfen zu entscheiden, welche
// Zahlung man anfasst. v2-29 macht ihn dort sichtbar, wo kuratiert wird.
//
// WARUM DIESER TEST DATEIEN LIEST STATT ZU RENDERN: Was hier schiefgehen kann,
// sind keine Rechenfehler — es sind Zusicherungen über Form und Bedingung, und
// die stehen in genau zwei Dateien. Ein Render-Test bräuchte einen angemeldeten
// Browser und passende Daten und würde trotzdem nur EINEN Zustand sehen. Die
// Zusicherungen hier gelten für ALLE.
//
// WAS ER FÄNGT — vier Fehlerklassen, die dieses Projekt teuer bezahlt hat:
//
//   ① Eine ZWEITE Bedingung neben `suggestedCardName` (LL-26). Die Regel, ob ein
//     Vorschlag gilt, hat genau eine Stelle: `istVorschlagSichtbar` in
//     `src/lib/suggestion.ts`. Wer hier `&& status === "..."` oder
//     `&& confidence > ...` ergänzt, formuliert dieselbe Regel ein zweites Mal —
//     und die zweite Fassung veraltet, sobald die erste sich ändert. Genau so
//     ist v2-19 (Kürzen), v2-20 (Nachbauen) und v2-23 (Filtern) entstanden.
//
//   ② Ein Umbruch. Ohne `nowrap` + `ellipsis` macht ein langer Kartenname die
//     Fragment-Karte höher — der längste im Bestand hat 105 Zeichen. Die
//     Rasterhöhe der Rohmasse darf nicht vom Kartennamen abhängen.
//
//   ③ Ein Farbtopf. Fläche, Rahmen oder ein `--badge-hue-*` würden den Vorschlag
//     aussehen lassen wie das TRANSFER-Kästchen — also wie etwas, das die App
//     WEISS statt vermutet (Design-Record Entscheidung 2, §8 AD5).
//
//   ④ Der Verlust der v2-10-Entscheidung `BF-1`. Die sechs Badge-Farbtöne werden
//     weder benutzt NOCH GELÖSCHT (User-Entscheid 04.08.2026, Punkt 4). Wer beim
//     Aufräumen `SHOW_SUGGESTION_BADGES` oder `BADGE_HUE_CLASSES` entfernt, nimmt
//     die Möglichkeit weg, die Kästchen je zurückzuholen — und niemand merkt es,
//     weil nichts kaputtgeht.
//
// Muster übernommen von doku-vollstaendigkeit.spec.ts (liest Dateien und prüft
// Zusicherungen) statt von suggestion-visibility.spec.ts (transpiliert Logik) —
// hier gibt es keine ausführbare Funktion, nur Form.

const WURZEL = path.join(__dirname, "..", "..");
const CSS = path.join(
  WURZEL, "src", "components", "interaction-zone", "interaction-zone.module.css",
);
const TSX = path.join(
  WURZEL, "src", "components", "interaction-zone", "fragment-card.tsx",
);
const TOKENS = path.join(WURZEL, "src", "styles", "tokens.css");

const css = fs.readFileSync(CSS, "utf8");
const tsx = fs.readFileSync(TSX, "utf8");
const tokens = fs.readFileSync(TOKENS, "utf8");

/** Inhalt eines CSS-Blocks `.name { … }` — ohne Kommentare, damit eine
 *  Erwähnung im Kommentar nicht als Deklaration durchgeht. */
function block(quelle: string, selektor: string): string {
  const ohneKommentare = quelle.replace(/\/\*[\s\S]*?\*\//g, "");
  const treffer = new RegExp(
    `\\${selektor}\\s*\\{([^}]*)\\}`,
  ).exec(ohneKommentare);
  expect(treffer, `CSS-Block ${selektor} nicht gefunden`).not.toBeNull();
  return treffer![1];
}

test.describe("v2-29 · die Vorschlagszeile", () => {
  test("① hängt an GENAU EINER Bedingung — dem Namen, sonst nichts", () => {
    // Die Zeile trägt `styles.fragmentSuggestion`. Direkt davor muss die
    // vollständige Render-Bedingung stehen — und die ist genau eine Null-Prüfung.
    //
    // Der Test greift bewusst am CSS-Klassennamen an und nicht an
    // `suggestedCardName`: Der Name kommt in dieser Datei mehrfach vor (auch im
    // aria-label), die Klasse genau einmal. Das ist der stabilere Anker.
    const ohneJsxKommentare = tsx.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "");

    const vorkommen = ohneJsxKommentare.split("styles.fragmentSuggestion").length - 1;
    expect(
      vorkommen,
      "die Vorschlagszeile darf genau einmal gerendert werden",
    ).toBe(1);

    expect(
      ohneJsxKommentare,
      "Die Render-Bedingung ist nicht mehr die reine Null-Prüfung " +
        "`{fragment.suggestedCardName && (<div className={styles.fragmentSuggestion}`. " +
        "Steht dort eine zweite Bedingung, ist die Regel aus src/lib/suggestion.ts " +
        "ein zweites Mal formuliert — genau die Fehlerklasse aus LL-26.",
    ).toMatch(
      /\{\s*fragment\.suggestedCardName\s*&&\s*\(\s*<div\s+className=\{styles\.fragmentSuggestion\}/,
    );
  });

  test("① die Sichtbarkeitsregel wird nicht ein zweites Mal formuliert", () => {
    // In fragment-card.tsx darf weder die Badge-Schwelle noch der
    // UNASSIGNED-Status als Bedingung für den Vorschlag auftauchen.
    const codeOhneKommentare = tsx
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");

    expect(
      codeOhneKommentare,
      "badgeThreshold gehört nach page.tsx (server-seitig, LL-17)",
    ).not.toMatch(/badgeThreshold|badge_threshold/);
    expect(
      codeOhneKommentare,
      "confidence gehört nicht in die Fragment-Karte — sie bekommt das Ergebnis, " +
        "nicht den Rohwert (LL-17)",
    ).not.toMatch(/suggestionConfidence/);
  });

  test("② kann die Fragment-Karte nicht höher machen", () => {
    const b = block(css, ".fragmentSuggestion");
    expect(b, "ohne nowrap bricht ein langer Kartenname um").toMatch(
      /white-space:\s*nowrap/,
    );
    expect(b, "ohne ellipsis wird der Name hart abgeschnitten").toMatch(
      /text-overflow:\s*ellipsis/,
    );
    expect(b, "ellipsis wirkt nur mit overflow: hidden").toMatch(
      /overflow:\s*hidden/,
    );
  });

  test("③ ist leise — Ghost-Ton, keine Fläche, kein Rahmen, kein Farbtopf", () => {
    const b = block(css, ".fragmentSuggestion");

    expect(b, "der Vorschlag trägt --text-ghost, den schwächsten Ton im System")
      .toMatch(/color:\s*var\(--text-ghost\)/);
    expect(tokens, "--text-ghost muss in tokens.css definiert sein (Regel 4)")
      .toMatch(/--text-ghost:/);

    expect(b, "eine Fläche macht daraus ein Kästchen").not.toMatch(/background/);
    expect(b, "ein Rahmen macht daraus ein Kästchen").not.toMatch(/border/);
    expect(b, "die Badge-Farbtöne sind dem Kästchen vorbehalten (BF-1)")
      .not.toMatch(/--badge-hue/);
    expect(
      b,
      "Versalien sind die Formensprache von Etiketten (TRANSFER), nicht von " +
        "Halbsätzen — Design-Record Entscheidung 3",
    ).not.toMatch(/text-transform:\s*uppercase/);
  });

  test("③ bleibt kleiner als die Beschreibung darüber", () => {
    const gr = (sel: string) => {
      const m = /font-size:\s*([\d.]+)px/.exec(block(css, sel));
      expect(m, `font-size in ${sel} nicht gefunden`).not.toBeNull();
      return Number(m![1]);
    };
    expect(
      gr(".fragmentSuggestion"),
      "die Vermutung darf nicht lauter sein als die Auskunft",
    ).toBeLessThan(gr(".fragmentDesc"));
  });

  test("④ die v2-10-Entscheidung BF-1 bleibt unangetastet", () => {
    // Weder benutzt noch gelöscht — User-Entscheid 04.08.2026, Punkt 4.
    expect(tsx, "SHOW_SUGGESTION_BADGES darf nicht entfernt werden").toMatch(
      /const SHOW_SUGGESTION_BADGES: boolean = false;/,
    );
    expect(tsx, "die Klassentabelle der sechs Farbtöne bleibt in Gebrauch")
      .toMatch(/BADGE_HUE_CLASSES/);
    expect(tsx, "badgeHueIndex bleibt in Gebrauch").toMatch(/badgeHueIndex/);
  });

  test("④ der Betrag behält sein Umbruch-Verbot (die BF-1-Fehlerklasse)", () => {
    // v2-10: Kästchen und Betrag teilten sich eine Zeile, das Euro-Zeichen
    // rutschte in die zweite. Die Vorschlagszeile steht jetzt woanders — das
    // nowrap bleibt trotzdem, es schützt auch das TRANSFER-Kästchen.
    expect(block(css, ".fragmentAmount")).toMatch(/white-space:\s*nowrap/);
  });
});
