import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// Regressions-Wächter für die Frage „liegt dieses Fragment auf einer Karte?"
// (v2-23, `ZU-1`). Prüft die ECHTE Quelldatei — transpiliert und ausgeführt,
// kein Nachbau. Muster von ring-subline.spec.ts und suggestion-visibility.spec.ts.
//
// ANLASS, gemeldet vom Nutzer am 16.08.2026: Die Spotify-Karte zeigte „Offen"
// und keine verknüpfte Zahlung — obwohl in `card_fragment_links` ein sauberer
// Link stand, der Link-Monat stimmte und die Sparrate den Betrag mitrechnete.
//
// URSACHE: `page.tsx:507` filterte mit `f.status === "ASSIGNED"`. Die View
// `fragments_with_status` kennt aber ZWEI zugeordnete Zustände — `ASSIGNED`
// (der Nutzer hat gezogen) und `AUTO_ABSORBED` (die App hat ab 95 % Konfidenz
// selbst zugeordnet). Die vier automatisch absorbierten Spotify-Zahlungen
// (Mai–August 2026) fielen durch, `card.linkedFragments` blieb leer, und
// `card-state.ts:26` entschied genau daran auf „Offen".
//
// Der Fehler stammt aus v2-07 P0 (25.07.2026) und lag drei Wochen unentdeckt,
// weil es im ganzen Bestand nur diese vier automatischen Zuordnungen gibt —
// alle 128 übrigen Verknüpfungen hat der Nutzer selbst gezogen.
//
// VIERTER FALL VON LL-26 / §6 Stolperfalle 16: Die Datenbank entscheidet
// richtig, das Frontend zeigt es nicht. Kein Anker, keine Prüfsumme und kein
// bestehender Test hätte es gefunden — die Sparrate war die ganze Zeit korrekt.

const SRC = path.join(
  __dirname, "..", "..", "src", "components", "interaction-zone",
  "interaction-zone.types.ts",
);

// `import type`-Zeilen werden beim Transpilieren elidiert; die Datei ist danach
// frei von Requires und direkt ausführbar.
const js = ts.transpileModule(fs.readFileSync(SRC, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2019,
  },
}).outputText;

type Pruefling = { status: string };

function load(): {
  isLinkedToCard: (f: Pruefling) => boolean;
  isTransferFragment: (f: Pruefling) => boolean;
} {
  const mod = { exports: {} as Record<string, unknown> };
  new Function("exports", "module", js)(mod.exports, mod);
  return {
    isLinkedToCard: mod.exports.isLinkedToCard as (f: Pruefling) => boolean,
    isTransferFragment: mod.exports.isTransferFragment as (f: Pruefling) => boolean,
  };
}

const { isLinkedToCard, isTransferFragment } = load();

/** Alle Status-Werte, die `fragments_with_status` liefern kann. Steht als
 *  Union im Typ `FragmentRow` — hier als Liste, damit der Test merkt, wenn ein
 *  sechster dazukommt und niemand die Prädikate nachzieht. */
const ALLE_STATUS = [
  "UNASSIGNED",
  "ASSIGNED",
  "AUTO_ABSORBED",
  "INTERNAL_TRANSFER",
  "ASSET_REALLOCATION",
] as const;

test.describe("Zuordnung: beide zugeordneten Zustände zählen (v2-23 ZU-1)", () => {
  test("vom Nutzer gezogen (ASSIGNED) → liegt auf einer Karte", () => {
    expect(isLinkedToCard({ status: "ASSIGNED" })).toBe(true);
  });

  test("automatisch erkannt (AUTO_ABSORBED) → liegt auf einer Karte", () => {
    // ── DER FALL, DER DEN FEHLER AUSMACHTE. ────────────────────────────────
    // Vor v2-23 lieferte die Filterbedingung hier `false`, und die Karte blieb
    // dadurch „Offen" — obwohl die Zahlung verlinkt war und in der Sparrate
    // mitzählte. Genau vier Zahlungen im Bestand waren betroffen (Spotify,
    // Mai–August 2026).
    expect(isLinkedToCard({ status: "AUTO_ABSORBED" })).toBe(true);
  });

  test("offen (UNASSIGNED) → liegt auf keiner Karte", () => {
    expect(isLinkedToCard({ status: "UNASSIGNED" })).toBe(false);
  });

  test("Überträge liegen nie auf einer Karte", () => {
    // §6 Stolperfalle 7: `transfer_type IS NOT NULL` ist nie verlinkbar,
    // dreifach abgesichert (RPC-Filter, Trigger, Link-Auflösung beim Import).
    // Das Prädikat muss dieselbe Aussage treffen.
    expect(isLinkedToCard({ status: "INTERNAL_TRANSFER" })).toBe(false);
    expect(isLinkedToCard({ status: "ASSET_REALLOCATION" })).toBe(false);
  });

  test("jeder Status ist genau einer Gruppe zugeordnet — keine Lücke, keine Dublette", () => {
    // Der eigentliche Wächter: Käme ein sechster Status dazu, ohne dass jemand
    // die Prädikate nachzieht, fiele er hier durch alle Raster. Genau so ist
    // `AUTO_ABSORBED` in v2-07 durchgerutscht.
    for (const status of ALLE_STATUS) {
      const verlinkt = isLinkedToCard({ status });
      const uebertrag = isTransferFragment({ status });
      const offen = status === "UNASSIGNED";

      const treffer = [verlinkt, uebertrag, offen].filter(Boolean).length;
      expect(
        treffer,
        `Status "${status}" ist ${treffer} Gruppen zugeordnet — erwartet genau 1. ` +
          `verlinkt=${verlinkt} übertrag=${uebertrag} offen=${offen}`,
      ).toBe(1);
    }
  });

  test("die Status-Liste im Test deckt sich mit dem Typ in der Quelldatei", () => {
    // Sonst prüft der Test oben eine veraltete Liste und bleibt grün, während
    // ein neuer Status unbeachtet bleibt.
    const quelle = fs.readFileSync(SRC, "utf8");
    const block = /status:\s*((?:\s*\|\s*"[A-Z_]+")+)/.exec(quelle)?.[1] ?? "";
    const imTyp = Array.from(block.matchAll(/"([A-Z_]+)"/g)).map((m) => m[1]);

    expect(imTyp.length, "Status-Union in FragmentRow nicht gefunden").toBeGreaterThan(0);
    expect([...imTyp].sort()).toEqual([...ALLE_STATUS].sort());
  });
});
