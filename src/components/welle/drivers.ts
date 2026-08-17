/*
 * B2-Abweichungs-Treiber (Sprint v2-06) — ersetzt den Platzhalter-Stub aus v2-02.
 *
 * Der UI-Kontrakt ist unverändert: `DriverEntry { label, isPlaceholder }`,
 * Top-1 im Welle-Hover-Tooltip (§9), Top-3 im Popup-Monatsklick (§9). Neu ist
 * allein die Datenquelle: die Jahres-RPC `get_year_deviation_drivers` liefert
 * beim Welle-Load EINEN Datensatz für alle 12 Monate (Konzept-Papier Option c),
 * der Loader legt ihn in `WelleData.drivers` ab.
 *
 * Die Heuristik selbst lebt vollständig in der RPC (keine Betragslogik im
 * Frontend, CLAUDE.md §7 Regel 1). Dieses Modul formatiert nur.
 *
 * `delta` ist die WIRKUNG AUF DIE SPARRATE (User-Entscheid 25.07.2026):
 * negativ = der Monat ist um diesen Betrag schlechter als geplant; bei
 * GEMEINSAM-Karten bereits auf den eigenen Anteil heruntergerechnet.
 */

import { formatAmount } from "@/lib/format";

const NBSP = " ";
const MINUS = "−";

export type DriverEntry = {
  label: string;
  /** true = kein echter Treiber (leerer Monat / Ladefehler) → gedimmte Darstellung. */
  isPlaceholder: boolean;
};

/** Ein Treiber, wie ihn die RPC liefert. */
export type DeviationDriver = {
  /** `null` bei der Gehalts-Zeile (v2-19, GE-2): Sie ist der erste Treiber, hinter
   *  dem KEINE Karte steht. Genau deshalb ist sie auch nicht anklickbar
   *  (Record, Entscheidung B) — eine Zeile, die aussieht wie die anderen, wäre
   *  ein Versprechen, das ins Leere führt. */
  cardId: string | null;
  cardName: string;
  /** FIXED_COST | INCOME | BUDGET — `null` bei der Gehalts-Zeile. */
  cardType: string | null;
  /** ICH | GEMEINSAM — `null` bei der Gehalts-Zeile. */
  attribution: string | null;
  /** Karten-Ist-Betrag des Monats (roh, wie auf der Karte). */
  ist: number;
  /** Karten-Plan des Monats (adjustment-aware, roh, wie auf der Karte). */
  plan: number;
  /** Angewandter Anteil: 1 bei ICH, Split-Faktor bei GEMEINSAM. */
  share: number;
  /** Wirkung auf die Sparrate, vorzeichenbehaftet und anteilig. */
  delta: number;
};

/** Treiber je Monatsindex 0..11. Fehlender Key = Monat ohne Abweichung. */
export type DriversByMonth = Partial<Record<number, DeviationDriver[]>>;

const NO_DEVIATION: DriverEntry = {
  label: "Keine Abweichungen",
  isPlaceholder: true,
};

const NOT_LOADED: DriverEntry = {
  label: "Treiber nicht verfügbar",
  isPlaceholder: true,
};

/**
 * Dritter Zustand, neu mit v2-24 P2: die Treiber sind noch nicht angefordert
 * oder gerade unterwegs.
 *
 * **Warum es diesen Zustand geben MUSS.** Seit v2-24 werden die Treiber erst beim
 * Anfassen der Welle geladen. In dem Moment, in dem der Tooltip erscheint, sind
 * sie unter Umständen noch nicht da. Beide bisherigen Platzhalter wären dann eine
 * **falsche Aussage**: „Keine Abweichungen" behauptet einen geprüften Befund,
 * „Treiber nicht verfügbar" behauptet ein Scheitern. Zutreffend ist keins von
 * beidem — es ist einfach noch nichts gefragt worden.
 *
 * ⚠️ **Dieser Wortlaut ist neue UI-Copy und gehört nach §12.** Die Design-Doku
 * kennt bisher keinen Ladezustand; der Text ist an den beiden bestehenden
 * Platzhaltern ausgerichtet (gleiche Satzform, gedimmte Darstellung) und
 * ausdrücklich zur Freigabe gestellt. Kein Auslassungszeichen: `…` bedeutet in
 * dieser Anwendung durchgängig „öffnet einen Dialog" (§12.3/§12.4).
 */
const LOADING: DriverEntry = {
  label: "Treiber werden geladen",
  isPlaceholder: true,
};

/** `−40,00 €` / `+12,50 €` — 2 Dezimalen (Karten-Format), NBSP wie im Tooltip. */
function fmtDelta(delta: number): string {
  const sign = delta >= 0 ? "+" : MINUS;
  return `${sign}${formatAmount(Math.abs(delta))}${NBSP}€`;
}

/** Label-Format laut Konzept §2: `{Kartenname} {±Betrag} €`. */
function toEntry(driver: DeviationDriver): DriverEntry {
  return {
    label: `${driver.cardName} ${fmtDelta(driver.delta)}`,
    isPlaceholder: false,
  };
}

/**
 * Wandelt das jsonb der RPC in die Monats-Map. Defensiv gegen unerwartete
 * Formen (die RPC ist typisiert `Json`), damit ein Datenfehler die Welle nicht
 * zerlegt — im Zweifel bleibt der Monat ohne Treiber.
 */
export function parseYearDrivers(raw: unknown): DriversByMonth {
  if (!Array.isArray(raw)) return {};
  const byMonth: DriversByMonth = {};

  for (const monthEntry of raw) {
    if (typeof monthEntry !== "object" || monthEntry === null) continue;
    const row = monthEntry as Record<string, unknown>;
    const monthIndex = Number(row.month_index);
    if (!Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) continue;
    if (!Array.isArray(row.drivers)) continue;

    const drivers: DeviationDriver[] = [];
    for (const d of row.drivers) {
      if (typeof d !== "object" || d === null) continue;
      const rec = d as Record<string, unknown>;
      const delta = Number(rec.delta);
      if (!Number.isFinite(delta)) continue;
      drivers.push({
        // v2-19: `null` bleibt `null` — vorher wurde es zu "" verschliffen.
        // Sichtbar ist das nirgends (die Anzeige benutzt nur Name und Betrag),
        // aber „keine Karte" und „Karte mit leerer ID" sind verschiedene
        // Aussagen, und die Unterscheidung ist der Grund, warum diese Zeile
        // nicht anklickbar ist.
        cardId: rec.card_id == null ? null : String(rec.card_id),
        cardName: String(rec.card_name ?? ""),
        cardType: rec.card_type == null ? null : String(rec.card_type),
        attribution: rec.attribution == null ? null : String(rec.attribution),
        ist: Number(rec.ist ?? 0),
        plan: Number(rec.plan ?? 0),
        share: Number(rec.share ?? 1),
        delta,
      });
    }
    if (drivers.length > 0) byMonth[monthIndex] = drivers;
  }

  return byMonth;
}

/** Top-1-Treiber für den Welle-Hover-Tooltip (§9).
 *
 *  Drei Eingangszustände, drei verschiedene Aussagen (v2-24 P2):
 *    `undefined` → noch nicht angefordert/unterwegs → „werden geladen"
 *    `null`      → angefordert und gescheitert      → „nicht verfügbar"
 *    Map        → da; leerer Monat                 → „Keine Abweichungen" */
export function getTop1Driver(
  drivers: DriversByMonth | null | undefined,
  monthIndex: number,
): DriverEntry {
  if (drivers === undefined) return LOADING;
  if (drivers === null) return NOT_LOADED;
  const first = drivers[monthIndex]?.[0];
  return first ? toEntry(first) : NO_DEVIATION;
}

/** Wie viele Zeilen das Popup höchstens zeigt.
 *
 *  ⚠️ Seit v2-19 sind es VIER, nicht drei. Die RPC begrenzt die
 *  KARTEN-Treiber auf `p_limit` (= 3) und hängt die Gehalts-Zeile danach an —
 *  sie erscheint immer, wenn das Netto abweicht, und verdrängt bewusst keinen
 *  Karten-Treiber (Record, Entscheidung C). Stünde hier weiterhin 3, schnitte
 *  dieser slice genau die Zeile ab, um die es in diesem Sprint geht: Im Juli
 *  2026 liegt „Gehalt" mit −15,57 € an vierter Stelle, weil die drei
 *  Budget-Treiber größer sind.
 *
 *  Mehr als vier kann es nicht werden — drei Karten plus höchstens ein
 *  Gehalt. */
const MAX_POPUP_DRIVERS = 4;

/** Die größten Treiber für den Popup-Monatsklick (§9). Die Begrenzung macht
 *  bereits die RPC — der slice ist Defense-in-Depth. */
export function getTop3Drivers(
  drivers: DriversByMonth | null | undefined,
  monthIndex: number,
): DriverEntry[] {
  if (drivers === undefined) return [LOADING];
  if (drivers === null) return [NOT_LOADED];
  const monthDrivers = drivers[monthIndex];
  if (!monthDrivers || monthDrivers.length === 0) return [NO_DEVIATION];
  return monthDrivers.slice(0, MAX_POPUP_DRIVERS).map(toEntry);
}
