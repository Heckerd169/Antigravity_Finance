import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// Wächter gegen Lücken in der Projekt-Historie (Vorschlag vom 15.08.2026,
// `V2/vorschlag_2026-08-15_luecken-waechter.md`, vom User angenommen).
//
// ANLASS: Die Historie endete bei v2-07. Die Sprints v2-08 bis v2-22 waren gebaut,
// abgenommen und in eigenen Review-Dateien dokumentiert — aber nie übertragen.
// Fünfzehn Sprints, und niemand hat es bemerkt.
//
// Das war mehr als Unordnung: `CLAUDE.md §8` verspricht zu JEDER Lesson Learned die
// Langfassung "in sprints/projekt_historie.md beim genannten Sprint". Für LL-21 bis
// LL-27 war das schlicht nicht wahr — die Verweise liefen ins Leere. Ein Register,
// dessen Verweise nicht auflösen, ist schlimmer als keines: Man sucht und hört auf
// zu suchen.
//
// URSACHE, belegt: `sprint-abschluss` kannte die Historie NICHT als Arbeitsschritt.
// Neun Schritte, zehnzeilige Abhakliste — sie kam in keinem davon vor. Sprint v2-08
// hat die Datei erzeugt, aber ihre Fortschreibung nie verankert.
//
// WARUM EIN TEST UND NICHT NUR EIN CHECKLISTEN-PUNKT: Schritt 5 (Roadmap) steht seit
// v2-08 in der Fähigkeit, ist dort ausdrücklich als "der vergessene Schritt"
// hervorgehoben — und wurde trotzdem ZWEIMAL übersehen. Nach dem Maßstab von LL-22
// ist eine Checklisten-Zeile eine Zusage; ein Test ist eine Prüfung.
//
// BAUART: prüft Dateien im Repo, nicht Verhalten im Browser — dasselbe Muster wie
// `loesch-tor.spec.ts` aus v2-20. Braucht weder Zugangsdaten noch Datenbank.
//
// GRENZE, bewusst: Der Test prüft EXISTENZ, nicht QUALITÄT. Ein Eintrag mit einem
// einzigen Satz macht ihn grün. Dagegen hilft nur die Gliederung in Schritt 4b von
// `sprint-abschluss` — Test und Anleitung gehören zusammen.

const REPO = path.join(__dirname, "..", "..");
const SPRINTS_DIR = path.join(REPO, "sprints");
const HISTORIE = path.join(SPRINTS_DIR, "projekt_historie.md");
const CLAUDE_MD = path.join(REPO, "CLAUDE.md");

const historie = fs.readFileSync(HISTORIE, "utf8");
const claudeMd = fs.readFileSync(CLAUDE_MD, "utf8");

/** Alle Sprints, die einen Review haben — `sprint_v2-NN_review.md`. */
function sprintsMitReview(): string[] {
  return fs
    .readdirSync(SPRINTS_DIR)
    .map((f) => /^sprint_(v2-\d{2})_review\.md$/.exec(f)?.[1])
    .filter((s): s is string => Boolean(s))
    .sort();
}

/** Alle Sprints, die in der Historie eine Überschrift haben. */
function sprintsInHistorie(): string[] {
  const treffer = historie.matchAll(/^### Sprint (v2-\d{2}) /gm);
  return Array.from(treffer, (m) => m[1]).sort();
}

/**
 * Die Ursprungs-Sprints aus dem Lessons-Learned-Register (§8).
 * Nur `v2-NN` — die älteren Einträge nennen „Sprint 4 K2" und Ähnliches, das
 * V1-Sprints meint; die stehen unter anderer Überschrift in der Historie.
 */
function llUrspruenge(): { ll: string; sprint: string }[] {
  const zeilen = claudeMd.split("\n").filter((z) => z.startsWith("| LL-"));
  const raus: { ll: string; sprint: string }[] = [];
  for (const zeile of zeilen) {
    const ll = /^\| (LL-\d+)/.exec(zeile)?.[1];
    if (!ll) continue;
    // Die Ursprungs-Spalte ist die letzte gefüllte; ein Eintrag kann mehrere
    // Sprints nennen (LL-6: „Sprint 4 K2 · erweitert v2-10").
    //
    // Bewusst `Array.from` statt `for…of` über den Iterator: Die tsconfig zielt
    // auf ein Ziel, das die direkte Iteration ohne `downlevelIteration` nicht
    // erlaubt (TS2802). Dieselbe Rücksicht nimmt `ring-subline.spec.ts` bei Sets.
    Array.from(zeile.matchAll(/\b(v2-\d{2})\b/g)).forEach((m) => {
      raus.push({ ll, sprint: m[1] });
    });
  }
  return raus;
}

test.describe("Doku-Vollständigkeit: die Projekt-Historie hat keine Lücken", () => {
  test("① jeder Sprint mit Review steht in der Historie", () => {
    const mitReview = sprintsMitReview();
    const inHistorie = new Set(sprintsInHistorie());

    // Aussagekraft sichern: Wären es null Reviews, bewiese der Test nichts.
    expect(
      mitReview.length,
      "Es wurde keine einzige Review-Datei gefunden — der Test prüft dann nichts.",
    ).toBeGreaterThan(10);

    const fehlend = mitReview.filter((s) => !inHistorie.has(s));

    expect(
      fehlend,
      `Diese Sprints haben einen Review, aber keinen Eintrag in ` +
        `sprints/projekt_historie.md: ${fehlend.join(", ")}\n\n` +
        `Schritt 4b in der Fähigkeit sprint-abschluss sagt, wie der Eintrag ` +
        `aussieht. Er wird aus dem Review verdichtet und ist append-only.`,
    ).toEqual([]);
  });

  test("② jeder Lessons-Learned-Ursprung ist in der Historie auffindbar", () => {
    // Das ist die Regel, die dem eigentlichen Schaden gilt. CLAUDE.md §8
    // verspricht: „Die Langfassung mit dem Vorfall, der sie erzeugt hat, steht in
    // sprints/projekt_historie.md beim genannten Sprint." Dieser Satz war für
    // LL-21 bis LL-27 unwahr — hier wird er prüfbar.
    const inHistorie = new Set(sprintsInHistorie());
    const urspruenge = llUrspruenge();

    expect(
      urspruenge.length,
      "Im LL-Register wurde kein einziger v2-Ursprung gefunden — Format geändert?",
    ).toBeGreaterThan(5);

    const tot = urspruenge.filter((u) => !inHistorie.has(u.sprint));

    expect(
      tot.map((u) => `${u.ll} → ${u.sprint}`),
      `CLAUDE.md §8 verweist auf Sprints, die in der Historie fehlen. ` +
        `Wer der Spur folgt, findet nichts.`,
    ).toEqual([]);
  });

  test("③ die Historie hat keine Lücke in der Nummernfolge", () => {
    // Fängt den Fall, dass jemand einen Eintrag anlegt, aber einen älteren
    // Sprint überspringt — Regel ① sieht das nur, wenn ein Review existiert.
    const nummern = sprintsInHistorie()
      .map((s) => Number(s.slice(3)))
      .sort((a, b) => a - b);

    expect(nummern.length).toBeGreaterThan(10);

    const luecken: string[] = [];
    for (let n = nummern[0]; n <= nummern[nummern.length - 1]; n++) {
      if (!nummern.includes(n)) {
        luecken.push(`v2-${String(n).padStart(2, "0")}`);
      }
    }

    expect(
      luecken,
      `In der Nummernfolge der Historie fehlen: ${luecken.join(", ")}`,
    ).toEqual([]);
  });
});
