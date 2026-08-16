import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/*
 * Regressions-Wächter für das Lösch-Tor (v2-20, KU-2).
 *
 * WARUM DIESER TEST ANDERS AUSSIEHT ALS DIE ÜBRIGEN:
 *
 * Die Lösch-Regel existiert an ZWEI Orten — in `card_delete_gate` (autoritativ)
 * und als Vorberechnung in `page.tsx`, damit das Kontextmenü den Punkt sofort
 * ausgrauen kann, ohne 31 RPC-Aufrufe zu feuern. Beide müssen dasselbe sagen.
 *
 * Genau das ist in v2-20 fast schiefgegangen: Die Datenbank ließ eine Karte
 * bereits durch, während das Frontend sie weiter als „nicht löschbar" zeichnete,
 * weil es alle Monats-Zustände lud statt nur die vergangenen. Der Nutzer hätte
 * einen ausgegrauten Menüpunkt gesehen, obwohl das Löschen erlaubt war — ein
 * stiller Widerspruch, den keine Zahl und keine Prüfsumme aufdeckt (LL-26).
 *
 * Der Test prüft deshalb den QUELLTEXT beider Seiten auf die gemeinsame Regel,
 * statt Verhalten nachzubauen. Ein Nachbau hätte hier gar keinen Wert: Er wäre
 * die dritte Kopie derselben Regel.
 */

const ROOT = path.join(__dirname, "..", "..");

const MIGRATION = fs.readFileSync(
  path.join(ROOT, "supabase", "migrations", "20260815_v2_20_ku2_loesch_tor.sql"),
  "utf8",
);
const PAGE = fs.readFileSync(path.join(ROOT, "src", "app", "page.tsx"), "utf8");
const CARD_INTERACTIVE = fs.readFileSync(
  path.join(ROOT, "src", "components", "cards", "card-interactive.tsx"),
  "utf8",
);

test.describe("Lösch-Tor (v2-20, KU-2)", () => {
  test("die Datenbank blockiert nur Zustände aus vergangenen Monaten", () => {
    // Der Kern der Migration: `card_monthly_states` wird gegen den Monatsanfang
    // geprüft. Fällt diese Bedingung weg, ist die Sackgasse zurück.
    const gate = MIGRATION.slice(MIGRATION.indexOf("card_monthly_states"));
    expect(gate).toContain("month < date_trunc('month', now())::date");
  });

  test("das Frontend bildet dieselbe Regel ab — sonst grauen wir aus, was erlaubt ist", () => {
    // Die Vorberechnung MUSS server-seitig auf vergangene Monate einschränken.
    // Ohne `.lt("month", …)` lädt sie alle Zustände und widerspricht der
    // Datenbank (LL-26).
    expect(PAGE).toMatch(
      /from\("card_monthly_states"\)[\s\S]{0,80}\.lt\("month",\s*nowMonthDb\)/,
    );
  });

  test("die Einschränkung steht server-seitig, nicht als JS-Filter (LL-21)", () => {
    // Ein nachgelagerter Filter sähe nur, was PostgREST übrig ließ — bei
    // höchstens 1000 Zeilen ohne Fehler und ohne Warnung.
    const abfrage = PAGE.slice(
      PAGE.indexOf('from("card_monthly_states")'),
      PAGE.indexOf('from("card_monthly_states")') + 120,
    );
    expect(abfrage).toContain(".lt(");
  });

  test("der Verweis auf »Karte beenden…« hängt an canEnd", () => {
    // Der eigentliche Befund B3: Der Verweis stand bedingungslos da, den
    // Menüpunkt gibt es aber nur bei wiederkehrenden Karten. Bei einer
    // einmaligen Karte zeigte er auf etwas, das dort nie existiert.
    expect(CARD_INTERACTIVE).toContain('canEnd && " Stattdessen »Karte beenden…«."');
    expect(CARD_INTERACTIVE).toContain('!canEnd && " Sie bleibt als Beleg erhalten."');
  });

  test("die drei Sperrgründe nennen jeweils einen Grund oder eine Handlung", () => {
    // Reine Mechanik-Begriffe („hat Monats-Änderungen") sagen dem Nutzer nicht,
    // was er tun soll. Nach v2-20 tun sie das.
    expect(CARD_INTERACTIVE).toContain('HAS_LINKS: "Erst die zugeordnete Zahlung lösen"');
    expect(CARD_INTERACTIVE).toContain('HAS_STATES: "Sie trägt vergangene Monate"');
    expect(CARD_INTERACTIVE).toContain(
      'HAS_PAST_PLAN: "Sie war in vergangenen Monaten eingeplant"',
    );
  });
});

test.describe("Papierkorb-Filter (v2-20, KU-1)", () => {
  const PAPIERKORB = fs.readFileSync(
    path.join(ROOT, "supabase", "migrations", "20260815_v2_20_ku1_papierkorb.sql"),
    "utf8",
  );

  test("alle vier Rechenfunktionen filtern deleted_at — keine darf fehlen", () => {
    // Fehlt eine, bricht eine Invariante: Ist/Plan driften auseinander,
    // Anker 1 (Ordner == Sparrate) oder Anker 2 (Σ delta = Ist − Plan).
    const funktionen = [
      "calculate_sparrate_for_month",
      "calculate_planned_sparrate_for_month",
      "get_category_amounts_for_month",
      "get_year_deviation_drivers",
    ];

    for (const fn of funktionen) {
      const start = PAPIERKORB.indexOf(`function public.${fn}`);
      expect(start, `${fn} fehlt in der Migration`).toBeGreaterThan(-1);

      // Bis zum Beginn der nächsten Funktion (oder Dateiende) suchen.
      const naechste = funktionen
        .map((f) => PAPIERKORB.indexOf(`function public.${f}`))
        .filter((i) => i > start);
      const ende = naechste.length > 0 ? Math.min(...naechste) : PAPIERKORB.length;

      expect(
        PAPIERKORB.slice(start, ende),
        `${fn} filtert deleted_at nicht`,
      ).toMatch(/deleted_at IS NULL/);
    }
  });
});
