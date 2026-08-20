import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/*
 * Regressions-Wächter: Das Einkommen wird MONATSBEZOGEN geladen (v2-27).
 *
 * DER VORFALL
 *
 * Der Nutzer öffnete am 19.08.2026 das Einkommens-Popup im Januar 2025 und sah
 * ein Jahresbrutto von 92.400 € — seinen Wert von 2026. In der Datenbank stehen
 * für Januar 2025 aber 90.000 € (Netto 4.037,11 €). Auch der Split-Kasten zeigte
 * 57 % statt der für Januar 2025 gültigen 58,8 %.
 *
 * Die Ursache stand in `page.tsx`: Beide `income_timeline`-Abfragen holten mit
 * `.order("effective_month", desc).limit(1)` IMMER die neueste Zeile — ohne
 * jeden Bezug zum angezeigten Monat. Die Variablen hießen entsprechend
 * `ichLatest` / `partnerLatest`.
 *
 * WARUM DAS TEUER IST, OBWOHL KEINE ZAHL FALSCH GERECHNET WURDE
 *
 * Die Sparrate war NIE betroffen: Sie entsteht in der Datenbank, und
 * `get_split_factor` wie `get_net_monthly_for_month` filtern selbst auf
 * `effective_month <= p_month`. Falsch war ausschließlich die ANZEIGE.
 *
 * Das ist LL-26 in einer VIERTEN Gestalt. Die bekannten drei waren Kürzen
 * (`slice(0,3)`), Nachbauen (`card_delete_gate` in `page.tsx`) und Filtern auf
 * einen Wert (`status === "ASSIGNED"`). Hier wird der Monatsbezug schlicht
 * WEGGELASSEN — jede Zahl bleibt für sich richtig, sie gehört nur zum falschen
 * Monat. Kein Anker, keine Prüfsumme und keine Invariante schlägt dabei an.
 *
 * WARUM DIESER TEST KOMMENTARE ENTFERNT (LL-32)
 *
 * Die Fundstelle in `page.tsx` trägt einen ausführlichen Kommentar, der den
 * gesuchten Ausdruck `.lte("effective_month", …)` zwangsläufig NENNT. Ein
 * Wächter, der den Rohtext durchsucht, wäre allein dadurch grün — und bliebe es
 * auch, wenn jemand den Filter aus dem Code entfernte und den Kommentar
 * stehenließe. Geprüft wird deshalb der Quelltext OHNE Kommentare.
 */

const ROOT = path.join(__dirname, "..", "..");
const PAGE_RAW = fs.readFileSync(path.join(ROOT, "src", "app", "page.tsx"), "utf8");

/** Entfernt Zeilen- und Blockkommentare. Ohne diesen Schritt prüft der Test
 *  seine eigene Erklärung statt des Codes (LL-32). */
function ohneKommentare(quelle: string): string {
  return quelle
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

const PAGE = ohneKommentare(PAGE_RAW);

/** Die beiden Abfrage-Blöcke auf `income_timeline`, jeweils vom Tabellennamen
 *  bis zum abschließenden `.limit(1)`. */
function abfrageBloecke(quelle: string): string[] {
  const bloecke: string[] = [];
  let ab = 0;
  for (;;) {
    const start = quelle.indexOf('.from("income_timeline")', ab);
    if (start === -1) break;
    const ende = quelle.indexOf(".limit(", start);
    if (ende === -1) break;
    bloecke.push(quelle.slice(start, ende));
    ab = ende + 1;
  }
  return bloecke;
}

test.describe("Einkommen wird monatsbezogen geladen (v2-27)", () => {
  test("der Test prüft Code, nicht seinen eigenen Kommentar", () => {
    // Selbstprüfung: Die Erklärung oben nennt den Ausdruck — nach dem Entfernen
    // der Kommentare darf genau diese Erwähnung verschwunden sein.
    expect(PAGE_RAW).toContain("vierten Gestalt".slice(0, 6));
    expect(PAGE).not.toContain("Gemeldet vom Nutzer");
  });

  test("es gibt genau zwei income_timeline-Abfragen (ICH und PARTNER)", () => {
    expect(abfrageBloecke(PAGE)).toHaveLength(2);
  });

  test("JEDE income_timeline-Abfrage grenzt auf den angezeigten Monat ein", () => {
    for (const block of abfrageBloecke(PAGE)) {
      expect(block).toContain('.lte("effective_month"');
      // Der Vergleich muss gegen den ZIELMONAT laufen, nicht gegen den heutigen.
      expect(block).toMatch(/\.lte\("effective_month",\s*targetDbDate\s*\)/);
    }
  });

  test("die Eingrenzung steht server-seitig, nicht als nachgelagerter JS-Filter (LL-21)", () => {
    for (const block of abfrageBloecke(PAGE)) {
      expect(block).toContain('.eq("user_id"');
      expect(block).toContain('.order("effective_month"');
    }
  });

  test("die Variablennamen tragen den Monatsbezug — `Latest` war Teil des Fehlers", () => {
    // `ichLatest` verspricht genau das, was falsch war: den neuesten Wert.
    // Als Prop-Name des Dev-Panels darf er stehen bleiben; als lokale Variable
    // der Seite nicht mehr.
    expect(PAGE).toContain("const ichForMonth");
    expect(PAGE).toContain("const partnerForMonth");
    expect(PAGE).not.toContain("const ichLatest");
    expect(PAGE).not.toContain("const partnerLatest");
  });

  test("der Split-Faktor holt denselben Monat wie die Einkommenszeilen", () => {
    // Beide müssen `targetDbDate` benutzen. Liefen sie auseinander, zeigte das
    // Popup Prozentwerte, die nicht zu seinen eigenen Beträgen passen — genau
    // das war im Januar 2025 der Fall (57 % zu 92.400 €).
    const splitAufruf = PAGE.slice(
      PAGE.indexOf("getSplitFactor(supabase"),
      PAGE.indexOf("getSplitFactor(supabase") + 200,
    );
    expect(splitAufruf).toContain("targetDbDate");
  });
});
