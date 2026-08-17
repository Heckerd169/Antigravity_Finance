import { getSparrateSeries, type AppSupabaseClient } from "@/lib/rpc";
import type { WelleData, WelleMonthPoint } from "./welle.types";

/**
 * Lädt die Datengrundlage der Jahres-Welle (§9): 12× Ist + 12× Plan des aktiven
 * Jahres. Die kumulierten Treppen-Werte sind reine Aufsummierung der
 * Monats-RPC-Ergebnisse (§2.1: keine eigene Sparrate-Berechnung; null = 0 beim
 * Summieren).
 *
 * ── Was sich in v2-24 geändert hat, in zwei Schritten ───────────────────────
 *
 * **P2 — was hier nicht mehr geladen wird.** Weder die Abweichungs-Treiber noch
 * die zwölf Vorjahres-Werte. Beides liegt in `loadWelleExtras` und wird erst
 * geholt, wenn der Nutzer die Welle anfasst. `get_year_deviation_drivers` kostet
 * gemessen **357 ms** — rund drei Viertel der gesamten Rechenzeit eines
 * Dashboard-Aufbaus — und wurde bei jeder Geste bezahlt, auch wenn das Popup zu
 * war.
 *
 * **P4 — wie die verbleibenden Werte kommen.** Vorher waren es 24 einzelne
 * Netzrunden (12× Ist, 12× Plan). Jetzt ist es **eine**: `get_sparrate_series`.
 * In der Datenbank kostet die Schleife 50,3 ms; über die Leitung lagen die
 * Einzelaufrufe in Produktion bei durchschnittlich rund 1.300 ms **je Aufruf**.
 *
 * Aus 37 Netzrunden dieses Loaders ist damit **eine** geworden.
 *
 * ── Was bewusst UNVERÄNDERT bleibt ──────────────────────────────────────────
 *
 * Die Kumulation. Sie läuft weiter hier, über die zurückgegebenen Monatswerte,
 * und nicht in der Datenbank. Grund: Beide Sparrate-Funktionen runden **einmal
 * ganz am Ende über alles** (§6 Stolperfalle 13 / LL-25). Eine Summierung in der
 * RPC hätte eine zweite Rundungsstelle eingeführt und die Sparrate um
 * Cent-Beträge verschoben — genau die Fehlerklasse, die LL-24 beschreibt.
 * `null = 0` gilt weiterhin nur beim Kumulieren, nicht im Monatswert selbst
 * (LL-20).
 *
 * Beleg und Messung: `V2/befunde_2026-08-16_performance.md` §2, §6 ①.
 */
export async function loadWelleData(
  client: AppSupabaseClient,
  args: {
    userId: string;
    activeYear: number;
  },
): Promise<WelleData> {
  const { userId, activeYear } = args;

  const series = await getSparrateSeries(client, { userId, year: activeYear });

  // Über den Index adressiert statt über die Array-Position: Die RPC sortiert
  // zwar (`ORDER BY month_index`), aber eine Anzeige, die zwölf Monate zeigt,
  // soll nicht davon abhängen. Fehlt ein Index, bleibt der Monat leer statt
  // einen fremden Wert zu erben.
  const byIndex = new Map(series.map((p) => [p.month_index, p]));

  let istCum = 0;
  let planCum = 0;
  const points: WelleMonthPoint[] = Array.from({ length: 12 }, (_, i) => {
    const p = byIndex.get(i);
    const ist = p?.ist ?? null;
    const plan = p?.plan ?? null;
    istCum += ist ?? 0;
    planCum += plan ?? 0;
    return {
      monthIndex: i,
      istMonthly: ist,
      planMonthly: plan,
      istCumulative: istCum,
      planCumulative: planCum,
    };
  });

  return {
    activeYear,
    prevYear: activeYear - 1,
    points,
  };
}
