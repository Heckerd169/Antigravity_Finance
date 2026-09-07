/* Die Regeln des Tabs „Zuordnen" auf `/mobil` — als reine Funktionen, ohne
 * Importe, damit `tests/e2e/mobil-zuordnen.spec.ts` die ECHTE Datei
 * transpiliert und ausführt (Muster `lib/suggestion.ts`, `card-state.ts`).
 *
 * Warum eine eigene Datei: Jede dieser Regeln entscheidet, was der Nutzer
 * sieht, und keine davon macht eine Zahl falsch, wenn sie bricht. Anker,
 * Prüfsummen und Invarianten blieben grün (LL-26). Deshalb steht jede Regel
 * hier einzeln prüfbar, statt im JSX eingebettet.
 *
 * Quelle der Wortlaute: Handoff-README §1 und Design-Record 07.09.2026.
 * Wo der Record eine Lücke hat, steht die Annahme aus dem Briefing daneben. */

import type {
  KandidatenKarte,
  MonatsStatus,
  Vorschlag,
} from "./zuordnen.types";

export type AktionsZustand = "mehrdeutig" | "normal" | "keinVorschlag";

/** Welche Aktionsfläche eine offene Zahlung bekommt.
 *
 *  1. Zwei oder mehr Kandidaten → **mehrdeutig** — auch dann, wenn die
 *     Datenbank einen Vorschlag trägt. Die alphabetische Vorbelegung
 *     (`ORDER BY card_name`, `ZO-8`) gilt auf /mobil nicht (Record #2).
 *  2. Sonst ein sichtbarer Vorschlag → **normal**.
 *  3. Sonst → **kein Vorschlag** (Briefing A1 — im Record nicht definiert). */
export function bestimmeZustand(z: {
  vorschlag: Vorschlag | null;
  kandidaten: KandidatenKarte[];
}): AktionsZustand {
  if (z.kandidaten.length >= 2) return "mehrdeutig";
  if (z.vorschlag !== null) return "normal";
  return "keinVorschlag";
}

/** Label über dem gefüllten Knopf. „7 × so zugeordnet", wenn der Händler von
 *  Hand so lag; sonst die Konfidenz in Prozent — wie das Schaufenster am
 *  Schreibtisch (Briefing A3; Record-Offenpunkt `MB-H1`). Die Schreibweise in
 *  Großbuchstaben macht das CSS. */
export function vorschlagsLabel(v: { treffer: number; konfidenz: number }): string {
  if (v.treffer >= 1) return `Vorschlag · ${v.treffer} × so zugeordnet`;
  const prozent = Math.round(Math.max(0, Math.min(1, v.konfidenz)) * 100);
  return `Vorschlag · ${prozent} %`;
}

/** Das erste Wort des Empfängers — „REWE" aus „REWE Frankfurt Bockenheim",
 *  „DB" aus „DB Vertrieb GmbH". Auf ihm beruht der Treffer (Händler-Schlüssel);
 *  der Nutzer soll sehen, worauf die Kandidaten sich beziehen. */
export function erstesWort(empfaenger: string): string {
  const w = empfaenger.trim().split(/\s+/)[0];
  return w ?? "";
}

/** Linkes Label im Zweifelsfall: „2 Kandidaten · Treffer auf »REWE«". */
export function kandidatenLabel(anzahl: number, empfaenger: string): string {
  return `${anzahl} Kandidaten · Treffer auf »${erstesWort(empfaenger)}«`;
}

/** Text des Übernehmen-Knopfs im Zweifelsfall: ohne Wahl „Übernehmen", mit
 *  Wahl „Übernehmen · {Karte}". */
export function uebernehmenText(gewaehlt: { name: string } | null): string {
  return gewaehlt ? `Übernehmen · ${gewaehlt.name}` : "Übernehmen";
}

/** Laufend · Vorbei · Forecast — gemessen am laufenden Monat des Servers,
 *  beide als „YYYY-MM" (lexikografisch = chronologisch, wie `months.ts`). */
export function monatsStatus(ym: string, laufend: string): MonatsStatus {
  if (ym === laufend) return "laufend";
  return ym < laufend ? "vorbei" : "forecast";
}

export function pillenWort(status: MonatsStatus): string {
  return status === "laufend" ? "Laufend" : status === "vorbei" ? "Vorbei" : "Forecast";
}

/** Unterzeile eines Nachbarmonats: „3 offen" | „erledigt" | Pillenwort des
 *  Zielmonats, wenn der noch Forecast ist. */
export function nachbarUnterzeile(n: { offen: number; status: MonatsStatus }): string {
  if (n.status === "forecast") return pillenWort(n.status);
  return n.offen > 0 ? `${n.offen} offen` : "erledigt";
}

/** Rechte Zeile im Kopf: „vorläufig · 12 nicht zugeordnet" | „alle 15
 *  zugeordnet" | „noch keine Umsätze". */
export function offenZeile(z: { offen: number; gesamt: number }): string {
  if (z.gesamt === 0) return "noch keine Umsätze";
  if (z.offen > 0) return `vorläufig · ${z.offen} nicht zugeordnet`;
  return `alle ${z.gesamt} zugeordnet`;
}

/** „{i} von {n}" auf der Fokus-Karte. n = alle Buchungen des Monats (ohne
 *  Überträge), i = die bereits zugeordneten plus eins — stabil über jeden
 *  Neuaufbau, kein Sitzungszustand (Briefing A4). */
export function positionsZaehler(z: { zugeordnet: number; gesamt: number }): string {
  return `${Math.min(z.zugeordnet + 1, Math.max(z.gesamt, 1))} von ${z.gesamt}`;
}

/** Rechts über der Stapel-Vorschau: „8 weitere" | „letzte" | „" (leer, dann
 *  steht darunter „Nichts mehr danach"). `offen` zählt inklusive Fokus. */
export function stapelRest(z: { offen: number; vorschau: number }): string {
  const rest = z.offen - 1 - z.vorschau;
  if (rest > 0) return `${rest} weitere`;
  if (z.vorschau > 0) return "letzte";
  return "";
}

/** Wie viele Zeilen die Stapel-Vorschau zeigt (Handoff: 3, tweakbar 1–4). */
export const VORSCHAU_ZEILEN = 3;

/** Der leere Zustand — Forecast oder alles zugeordnet (Handoff §1 „leer"). */
export function leerText(z: {
  status: MonatsStatus;
  monatName: string;
  sparrateText: string | null;
}): { titel: string; text: string } {
  if (z.status === "forecast") {
    return {
      titel: "Noch keine Umsätze",
      text: `${z.monatName} ist Forecast. Die Buchungen kommen, wenn der Monat läuft.`,
    };
  }
  return {
    titel: "Alles zugeordnet",
    text:
      z.sparrateText !== null
        ? `Sparrate ${z.monatName} steht bei ${z.sparrateText}. Der Ring in der Übersicht zeigt sie.`
        : `Sparrate ${z.monatName} steht. Der Ring in der Übersicht zeigt sie.`,
  };
}

/** „Später" schiebt eine Zahlung ans Ende des Stapels. Die Reihenfolge der
 *  übrigen bleibt die gelieferte; mehrfach zurückgestellte reihen sich in der
 *  Reihenfolge der Rückstellung. Unbekannte IDs (die Zahlung ist inzwischen
 *  zugeordnet) werden ignoriert. */
export function stapelReihenfolge<T extends { id: string }>(
  offene: readonly T[],
  spaeter: readonly string[],
): T[] {
  const rang = new Map<string, number>();
  spaeter.forEach((id, i) => rang.set(id, i));
  const vorn = offene.filter((z) => !rang.has(z.id));
  const hinten = offene
    .filter((z) => rang.has(z.id))
    .sort((a, b) => (rang.get(a.id) ?? 0) - (rang.get(b.id) ?? 0));
  return [...vorn, ...hinten];
}

export type ToastTon = "rot" | "teal" | "neutral";

/** Die zweite Zeile des Toasts nach dem Zuordnen — aus dem ECHTEN Δ der
 *  Sparrate (nachher − vorher, beides aus `calculate_sparrate_for_month`).
 *
 *  Rot nur bei echter Abweichung nach unten (v3 Regel 2). Δ = 0 heißt „im
 *  Plan" — bei einer Einnahmen-Karte „Einnahme · im Plan". Δ > 0 ist im
 *  Record nicht definiert; Briefing A2: dieselbe Zeile in Türkis, weil Türkis
 *  in v3 „über Plan" bedeutet. Der Betrag wird vom Aufrufer formatiert; hier
 *  steht nur die Entscheidung. */
export function toastZeile(z: {
  delta: number;
  monatName: string;
  istEinnahme: boolean;
  deltaText: string;
}): { text: string; ton: ToastTon } {
  if (Math.abs(z.delta) < 0.005) {
    return {
      text: z.istEinnahme ? "Einnahme · im Plan" : "Sparrate unverändert · im Plan",
      ton: "neutral",
    };
  }
  return {
    text: `Sparrate ${z.monatName} ${z.deltaText}`,
    ton: z.delta < 0 ? "rot" : "teal",
  };
}

/** Offline (Record #4): neutrale Pille oben rechts — „Stand von 14:32 ·
 *  offline" — NICHT rot; und die Hinweiszeile unter den gesperrten Knöpfen.
 *  `uhrzeit` ist der Zeitpunkt des letzten Aufbaus („HH:MM"). */
export function offlinePille(uhrzeit: string): string {
  return `Stand von ${uhrzeit} · offline`;
}

export function offlineHinweis(uhrzeit: string): string {
  return `Zuordnen braucht Netz. Der Stapel ist der von ${uhrzeit}.`;
}
