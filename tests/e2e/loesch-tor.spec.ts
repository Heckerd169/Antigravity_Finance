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

// v2-25 (KJ-1): Maßgeblich ist die JÜNGSTE Migration, die `card_delete_gate`
// neu schreibt — sie ist die Fassung, die in der Datenbank steht. Die
// v2-20-Datei bleibt als Historie liegen, prüft aber nichts mehr über den
// heutigen Zustand.
const MIGRATION = fs.readFileSync(
  path.join(ROOT, "supabase", "migrations", "20260817_v2_25_kj1_loeschriegel.sql"),
  "utf8",
);
const PAGE = fs.readFileSync(path.join(ROOT, "src", "app", "page.tsx"), "utf8");
const CARD_INTERACTIVE = fs.readFileSync(
  path.join(ROOT, "src", "components", "cards", "card-interactive.tsx"),
  "utf8",
);
const CARDS_TYPES = fs.readFileSync(
  path.join(ROOT, "src", "components", "cards", "cards.types.ts"),
  "utf8",
);

/** Nur der Rumpf von `card_delete_gate` — `delete_card` steht in derselben
 *  Datei und darf hier nicht mitgelesen werden. */
const GATE_FN = MIGRATION.slice(
  MIGRATION.indexOf("function public.card_delete_gate"),
  MIGRATION.indexOf("drop function if exists public.delete_card"),
);

/** Kommentare raus, bevor auf ein VERSCHWUNDENES Konstrukt geprüft wird.
 *
 *  Sonst prüft der Test das Gegenteil dessen, was er soll: Eine gute Erklärung,
 *  WARUM etwas entfallen ist, nennt zwangsläufig den entfallenen Namen — und
 *  ließe den Wächter rot werden, obwohl der Code sauber ist. Beim ersten Lauf
 *  in v2-25 ist genau das passiert.
 *
 *  Bewusst simpel: `//`-Zeilen, `/* … *\/`-Blöcke und `--`-SQL-Kommentare. Es
 *  geht nicht um einen Parser, sondern darum, dass Prosa nicht als Code zählt. */
function ohneKommentare(quelle: string): string {
  return quelle
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((z) => z.replace(/\/\/.*$/, "").replace(/--.*$/, ""))
    .join("\n");
}

const GATE_FN_CODE = ohneKommentare(GATE_FN);
const PAGE_CODE = ohneKommentare(PAGE);
const CARDS_TYPES_CODE = ohneKommentare(CARDS_TYPES);

test.describe("Lösch-Tor (v2-20, KU-2)", () => {
  test("die Datenbank blockiert nur Zustände aus vergangenen Monaten", () => {
    // Der Kern der Migration: `card_monthly_states` wird gegen den Monatsanfang
    // geprüft. Fällt diese Bedingung weg, ist die Sackgasse zurück.
    const gate = GATE_FN.slice(GATE_FN.indexOf("card_monthly_states"));
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

  test("die verbliebenen Sperrgründe nennen jeweils einen Grund oder eine Handlung", () => {
    // Reine Mechanik-Begriffe („hat Monats-Änderungen") sagen dem Nutzer nicht,
    // was er tun soll. Nach v2-20 tun sie das.
    // v2-25 (KJ-1): Es sind noch ZWEI — `HAS_PAST_PLAN` ist gefallen.
    expect(CARD_INTERACTIVE).toContain('HAS_LINKS: "Erst die zugeordnete Zahlung lösen"');
    expect(CARD_INTERACTIVE).toContain('HAS_STATES: "Sie trägt vergangene Monate"');
  });
});

/*
 * v2-25 (KJ-1): Der Riegel ist gefallen — und zwar auf BEIDEN Seiten.
 *
 * Die drei Tests hier sind das Gegenstück zu denen oben: Dort wird geprüft, dass
 * die verbliebenen Regeln übereinstimmen, hier, dass die gefallene wirklich
 * überall gefallen ist. Bliebe sie an einer Stelle stehen, wäre der Widerspruch
 * genau der, den v2-20 schon einmal fast produziert hätte — nur in die andere
 * Richtung: Die Datenbank ließe durch, was das Menü ausgraut (LL-26).
 *
 * Gemessen am 17.08.2026 waren mit dem Riegel NULL von 82 Karten löschbar.
 */
test.describe("Der Vergangenheits-Riegel ist gefallen (v2-25, KJ-1)", () => {
  test("die Datenbank kennt HAS_PAST_PLAN nicht mehr als Sperrgrund", () => {
    // Der Name darf im Kommentar-Kopf vorkommen — er erklärt, was entfiel.
    // Im CODE darf er nirgends mehr stehen.
    expect(GATE_FN_CODE).not.toContain("HAS_PAST_PLAN");
  });

  test("das Frontend vergleicht first_active_month nicht mehr gegen den Monatsanfang", () => {
    // Der Nachbau in `page.tsx` muss dieselbe Regel führen wie die Datenbank.
    // Bliebe der Vergleich stehen, zeigte das Menü einen ausgegrauten Punkt,
    // den `card_delete_gate` längst durchlässt.
    expect(PAGE_CODE).not.toContain("first_active_month >= nowMonthDb");
    expect(PAGE_CODE).not.toContain("first_active_month < nowMonthDb");
    expect(PAGE_CODE).not.toContain("HAS_PAST_PLAN");
  });

  test("der Typ lässt HAS_PAST_PLAN gar nicht mehr zu", () => {
    // Der Compiler ist hier der eigentliche Wächter: Solange der Wert im Typ
    // steht, kann ihn jede neue Stelle wieder setzen, ohne aufzufallen.
    expect(CARDS_TYPES_CODE).not.toContain("HAS_PAST_PLAN");
  });
});

/*
 * v2-25 (KJ-1): Die Folge des Löschens wird GEMESSEN, nicht gerechnet.
 *
 * Die Wirkung einer Löschung über N Monate ist eine Sparraten-Rechnung, und
 * Arbeitsregel 1 verbietet die im Frontend. Ein Nachbau in der Datenbank wäre
 * dasselbe eine Ebene tiefer: Er müsste Prioritätskette, Split-Anteil (§6
 * Stolperfalle 11) und Schlussrundung (LL-25) nachbilden — und keine Zahl sähe
 * dabei falsch aus. Genau diese Fehlerklasse hat v2-13 gekostet.
 */
test.describe("Die Folge des Löschens (v2-25, KJ-1)", () => {
  const DELETE_FN = MIGRATION.slice(
    MIGRATION.indexOf("drop function if exists public.delete_card"),
  );

  test("delete_card RUFT die Sparrate-Funktion auf, statt sie nachzubauen", () => {
    expect(DELETE_FN).toContain("calculate_sparrate_for_month(v_user_id");
    // Zweimal: einmal vor, einmal nach dem UPDATE. Nur ein Aufruf hieße, dass
    // eine der beiden Seiten der Differenz gerechnet statt geholt wird.
    const aufrufe = DELETE_FN.match(/calculate_sparrate_for_month\(/g) ?? [];
    expect(aufrufe.length).toBe(2);
  });

  test("die alte Ein-Parameter-Signatur wird explizit entfernt", () => {
    // `create or replace` mit neuer Signatur legt sonst eine ÜBERLADUNG an:
    // Beide Fassungen existierten nebeneinander und PostgREST könnte weiter
    // die alte treffen, ohne dass es auffällt.
    expect(DELETE_FN).toContain("drop function if exists public.delete_card(uuid)");
  });

  test("der Frontend-Text kennt alle drei Fälle aus §12.5", () => {
    // Mehrere Monate, genau einer (benannt), und keiner — der dritte zeigt
    // NICHTS statt einer Null-Zeile (LL-20).
    expect(CARD_INTERACTIVE).toContain("Sparrate in ${effect.months} Monaten · zusammen");
    expect(CARD_INTERACTIVE).toContain("formatMonthNameOnly(effect.singleMonth)");
    expect(CARD_INTERACTIVE).toMatch(/effect\.months === 0\)\s*return undefined/);
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
