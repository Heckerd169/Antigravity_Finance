import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// Wächter gegen das stille Zuwachsen der Verfassung (v2-29, 27.08.2026).
//
// ANLASS: CLAUDE.md stand bei 1.712 Zeilen. Ihr eigener Kopf sagt seit v2-08, hier
// stehe „ausschließlich das, was immer gilt", und Historie gehöre nach
// `sprints/projekt_historie.md` — der Vorspann erzählte trotzdem 19 Sprints nach,
// §9 noch einmal 20. **v2-08 hatte die Datei von 1.857 auf 434 Zeilen gebracht.**
// Sie war also nach 21 Sprints fast wieder dort, wo sie vor jener Kürzung stand.
//
// WAS DIESE FEHLERKLASSE BESONDERS MACHT: Sie entsteht ausschließlich aus RICHTIGEN
// Entscheidungen. Jede einzelne Ergänzung war begründet und wurde freigegeben; keine
// davon fällt beim Treffen als falsch auf. Nur die Summe ist der Fehler — und Summen
// bemerkt niemand beim Hinschreiben.
//
// WARUM EIN TEST UND NICHT NUR EIN SCHRITT IN DER FÄHIGKEIT: Genau dieselbe Frage
// stellte sich `doku-vollstaendigkeit.spec.ts` in v2-28, und die Antwort gilt hier
// unverändert — der „vergessene Schritt" stand seit v2-08 als solcher MARKIERT in
// `sprint-abschluss` und wurde trotzdem ZWEIMAL übersehen. Nach LL-40 ist eine
// Checklisten-Zeile eine Zusicherung; ein Test ist eine Prüfung. Die Fähigkeit
// `claude-md-pflege` sagt, was bei Rot zu tun ist — dieser Test sagt, DASS.
//
// ⚠️ DREI GRENZEN, WEIL EINE NICHT REICHT
//
//   Eine reine Zeilenzahl misst das Symptom, nicht die Ursache. Bei 1.712 Zeilen war
//   nicht die Länge das Problem, sondern 443 Zeilen Historie am falschen Ort. Eine
//   Zeilengrenze allein hätte zwei Dinge falsch beurteilt:
//
//     · Sie schlägt an, wenn die Datei aus lauter REGELN wächst — dann wäre Kürzen
//       falsch. Belegt: §6+§7+§8 sind in v2-29 von 657 auf 701 Zeilen GEWACHSEN,
//       während die Datei um 294 Zeilen schrumpfte.
//     · Sie schlägt NICHT an, wenn jemand 80 Zeilen Historie einfügt und 80 Zeilen
//       Regeln streicht — der schlimmste denkbare Fall.
//
//   Deshalb misst dieser Test zusätzlich, WO die Zeilen stehen und WIE VIEL davon
//   Regel ist.
//
// GRENZE, bewusst: Der Test prüft Umfang und Verteilung, nicht QUALITÄT. Ein Absatz
// voller Füllwörter in §6 zählt als Regel. Dagegen hilft nur das Lesen.

const REPO = path.join(__dirname, "..", "..");
const CLAUDE_MD = path.join(REPO, "CLAUDE.md");
const zeilen = fs.readFileSync(CLAUDE_MD, "utf8").split("\n");

/** Zeilenindex der Überschrift `## <n>.` — mit sprechendem Fehler, falls jemand die
 *  Nummerierung ändert. Der Test soll dann nicht kryptisch scheitern, sondern sagen,
 *  dass seine Landmarken nicht mehr stimmen. */
function abschnitt(n: number): number {
  const i = zeilen.findIndex((z) => z.startsWith(`## ${n}.`));
  expect(
    i,
    `Landmarke "## ${n}." nicht gefunden. Wurde CLAUDE.md umnummeriert? ` +
      `Dann gehören die Grenzen in diesem Test mit angepasst — nicht der Test gelöscht.`,
  ).toBeGreaterThan(-1);
  return i;
}

const iVorspannEnde = abschnitt(1);
const i6 = abschnitt(6);
const i9 = abschnitt(9);

const iAnker = zeilen.findIndex((z) => z.startsWith("### Die Prüfanker"));
expect(
  iAnker,
  'Landmarke "### Die Prüfanker" in §9 nicht gefunden — sie trennt die Lagebeschreibung ' +
    "von den dauerhaft gültigen Ankern.",
).toBeGreaterThan(i9);

const gesamt = zeilen.length;
const vorspann = iVorspannEnde;
const neunKopf = iAnker - i9;
const erzaehlzone = vorspann + neunKopf;
const regeln = i9 - i6; // §6 + §7 + §8
const regelAnteil = (100 * regeln) / gesamt;

// ── Die drei Grenzen ────────────────────────────────────────────────────────
// Stand bei Einführung (27.08.2026): 1.419 Zeilen · Erzählzone 99 · Regelanteil 49 %.
// Jede Grenze lässt bewusst Luft — sie soll den Trend fangen, nicht jeden Sprint
// blockieren.
const MAX_ZEILEN = 1600; // ~6 Sprints Luft ab 1.419
const MAX_ERZAEHLZONE = 150; // vor v2-29 waren es 443
const MIN_REGELANTEIL = 45; // heute 49 %

/** Vorwarnung, BEVOR der Test rot wird — damit die Kürzung geplant werden kann, statt
 *  einen laufenden Sprint zu blockieren.
 *
 *  Ober- und Untergrenzen brauchen dabei unterschiedliche Nähe-Begriffe, und der erste
 *  Entwurf hatte das falsch: Er meldete für den Regelanteil „zu 107 % ausgeschöpft" —
 *  eine Zahl, die bei einer MINDESTgrenze nichts bedeutet — und hätte beim heutigen
 *  Stand (49 % gegen 45 %) dauerhaft gelärmt. Eine Warnung, die immer kommt, wird
 *  weggelesen; danach ist auch die echte unsichtbar. */
function warnenWennKnapp(was: string, ist: number, grenze: number, richtung: "max" | "min") {
  if (richtung === "max") {
    if (ist >= grenze * 0.9) {
      console.warn(
        `[CLAUDE.md] ${was}: ${ist} von höchstens ${grenze} — ` +
          `${Math.round((100 * ist) / grenze)} % ausgeschöpft. ` +
          "Fähigkeit `claude-md-pflege` einplanen.",
      );
    }
    return;
  }
  // Untergrenze: warnen, wenn weniger als 5 % Luft nach unten bleibt.
  if (ist <= grenze * 1.05) {
    console.warn(
      `[CLAUDE.md] ${was}: ${ist} — nur noch ${(ist - grenze).toFixed(0)} über dem ` +
        `Mindestwert ${grenze}. Fähigkeit \`claude-md-pflege\` einplanen.`,
    );
  }
}

test.describe("CLAUDE.md bleibt die Verfassung und wird kein Archiv", () => {
  test("① die Datei bleibt unter der Obergrenze", () => {
    warnenWennKnapp("Zeilen gesamt", gesamt, MAX_ZEILEN, "max");
    expect(
      gesamt,
      `CLAUDE.md hat ${gesamt} Zeilen (Grenze ${MAX_ZEILEN}). Sie wird in JEDER Sitzung ` +
        `vollständig geladen — jede Zeile kostet dauerhaft. Fähigkeit \`claude-md-pflege\` ` +
        `laden und auslagern, statt die Grenze anzuheben. Wer sie doch anhebt, schreibt ` +
        `die Begründung in denselben Commit.`,
    ).toBeLessThanOrEqual(MAX_ZEILEN);
  });

  test("② die Erzählzone bleibt schlank — dort wächst der Ballast", () => {
    warnenWennKnapp("Erzählzone", erzaehlzone, MAX_ERZAEHLZONE, "max");
    expect(
      erzaehlzone,
      `Vorspann (${vorspann}) + §9 bis "Die Prüfanker" (${neunKopf}) = ${erzaehlzone} Zeilen ` +
        `(Grenze ${MAX_ERZAEHLZONE}). Genau hier sind zwischen v2-08 und v2-28 die 443 Zeilen ` +
        `Sprint-Nacherzählung entstanden. Was ein einzelner Sprint gebracht hat, gehört nach ` +
        `sprints/projekt_historie.md; hierher gehört nur, was für die NÄCHSTE Sitzung gilt.`,
    ).toBeLessThanOrEqual(MAX_ERZAEHLZONE);
  });

  test("③ der Regelanteil bleibt hoch — sonst verwässert die Verfassung", () => {
    warnenWennKnapp("Regelanteil", Math.round(regelAnteil), MIN_REGELANTEIL, "min");
    expect(
      Math.round(regelAnteil),
      `§6+§7+§8 machen ${Math.round(regelAnteil)} % der Datei aus (${regeln} von ${gesamt} ` +
        `Zeilen, Mindestwert ${MIN_REGELANTEIL} %). Diese Zahl ist der eigentliche Wächter: ` +
        `Sie bestraft nicht das Wachsen, sondern das VERWÄSSERN. Wächst die Datei durch neue ` +
        `Stolperfallen und Regeln, bleibt der Anteil stabil und der Test grün — das ist ` +
        `gewollt. Fällt er, ist Ballast dazugekommen.`,
    ).toBeGreaterThanOrEqual(MIN_REGELANTEIL);
  });

  test("④ die Grenzen selbst bleiben nachvollziehbar", () => {
    // Ein Wächter, dessen Grenzen jemand still hochsetzt, ist keiner mehr. Diese
    // Prüfung hält fest, dass die drei Zahlen zusammen zum heutigen Stand passen —
    // wer sie ändert, muss auch hier vorbei und begründet es im Commit.
    expect(MAX_ERZAEHLZONE, "die Erzählzone darf nie mehr als ein Zehntel der Datei sein")
      .toBeLessThanOrEqual(MAX_ZEILEN / 10);
    expect(MIN_REGELANTEIL, "unter 40 % wäre die Datei kein Regelwerk mehr")
      .toBeGreaterThanOrEqual(40);
  });
});
