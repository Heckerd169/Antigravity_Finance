import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSparrateSeries } from "@/lib/rpc";
import type { SparrateSeriesPoint } from "@/lib/rpc";
import { addMonths, parseMonthParam, ymToDbDate } from "@/lib/months";
import { MONTHS_SHORT } from "@/components/welle/draw";
import { MobilTabBar } from "@/components/mobil/tab-bar";
import { eur, eurGanz } from "@/components/mobil/format";
import { VerlaufScreen } from "@/components/mobil/verlauf";
import {
  MONATE,
  balkenHoehe,
  balkenTon,
  detailTon,
  detailUnterzeile,
  durchschnitt,
  skalenMaximum,
} from "@/components/mobil/verlauf/regeln";
import type { VerlaufDaten, VerlaufMonat } from "@/components/mobil/verlauf/verlauf.types";

type Props = {
  searchParams: { month?: string | string[] };
};

const FELD_H = 150;

/* Tab „Verlauf" auf /mobil — der Server-Lader (Handoff §6).
 *
 * FÜNF Netzrunden je Aufbau, sechs an einer Jahresgrenze (§9 Anker 3;
 * Zuordnen: 11, Übersicht: 8, Karten: 6):
 * Anmeldung 1 · profiles 1 · cards 0 (nicht nötig) · get_sparrate_series 1–2 ·
 * offene Zahlungen 1.
 *
 * `get_sparrate_series` liefert zwölf Monate Ist UND Plan in einem Aufruf. Die
 * sechs gezeigten Monate liegen in einem Jahr oder in zweien — mehr als zwei
 * Aufrufe kann es nicht geben. 24 Einzelaufrufe lagen in Produktion bei rund
 * 1.300 ms je Stück (LL-29).
 *
 * Gerechnet wird hier keine Sparrate (§7 Regel 1): Die Werte kommen aus der
 * Datenbank und werden nur in Höhen, Töne und Sätze übersetzt. Der Durchschnitt
 * ist ein Mittelwert über gelieferte Zahlen, keine zweite Sparraten-Formel. */
export default async function VerlaufPage({ searchParams }: Props) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Ohne `?month=` fällt `parseMonthParam` auf den laufenden Monat zurück; der
  // Verlauf zeigt seine sechs Monate relativ zum ANGEZEIGTEN.
  const targetMonth = parseMonthParam(searchParams?.month);
  const targetDbDate = ymToDbDate(targetMonth);
  const nextDbDate = ymToDbDate(addMonths(targetMonth, 1));

  // Der angezeigte Monat und die fünf davor (Annahme B5).
  const fenster: string[] = [];
  for (let i = MONATE - 1; i >= 0; i--) fenster.push(addMonths(targetMonth, -i));
  const jahre = Array.from(new Set(fenster.map((ym) => Number(ym.slice(0, 4)))));

  const [{ data: profile }, serien, { count: offenRaw }] = await Promise.all([
    supabase
      .from("profiles")
      .select("onboarded_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    Promise.all(
      jahre.map((jahr) =>
        getSparrateSeries(supabase, { userId: user.id, year: jahr })
          .then((punkte) => ({ jahr, punkte }))
          .catch((err: unknown) => {
            console.error("Sparraten-Serie fehlgeschlagen", err);
            return { jahr, punkte: [] as SparrateSeriesPoint[] };
          }),
      ),
    ),
    supabase
      .from("fragments_with_status")
      .select("*", { count: "exact", head: true })
      .eq("status", "UNASSIGNED")
      .gte("transaction_date", targetDbDate)
      .lt("transaction_date", nextDbDate),
  ]);

  if (!profile?.onboarded_at) redirect("/onboarding");

  // „YYYY-MM" → { ist, plan }. Fehlt ein Monat, bleibt er `null` — das ist
  // etwas anderes als 0 € und wird auch so gezeigt (LL-20).
  const werte = new Map<string, { ist: number | null; plan: number | null }>();
  for (const { jahr, punkte } of serien) {
    for (const p of punkte) {
      const mm = String(p.month_index + 1).padStart(2, "0");
      werte.set(`${jahr}-${mm}`, { ist: p.ist, plan: p.plan });
    }
  }

  const istWerte = fenster.map((ym) => werte.get(ym)?.ist ?? null);
  const planWerte = fenster.map((ym) => werte.get(ym)?.plan ?? null);
  // Ein Maximum über ALLE sechs Monate — die Auswahl hebt hervor, sie rechnet
  // die Skala nicht um.
  const max = skalenMaximum(istWerte, planWerte);

  const monate: VerlaufMonat[] = fenster.map((ym) => {
    const w = werte.get(ym) ?? { ist: null, plan: null };
    const index = Number(ym.slice(5, 7)) - 1;
    const jahr = ym.slice(0, 4);
    const ton = balkenTon(w.ist, w.plan);
    const abstand =
      w.ist !== null && w.plan !== null ? Math.abs(w.ist - w.plan) : 0;
    const unten = detailUnterzeile({
      ist: w.ist,
      plan: w.plan,
      abstandText: eur(abstand),
    });

    return {
      ym,
      kurz: MONTHS_SHORT[index] ?? ym,
      detailTitel: `SPARRATE · ${MONTHS_SHORT[index] ?? ""} ${jahr}`,
      hoehe: w.ist === null ? 4 : balkenHoehe(w.ist, max, FELD_H),
      ton,
      // Über dem Balken ganze Euro — sechs Werte teilen sich 430 px, mit Cent
      // überlappen sie einander. In der Detailkarte darunter steht derselbe
      // Wert mit Cent, denn dort ist Platz.
      balkenText: w.ist === null ? "—" : eurGanz(w.ist),
      wertText: w.ist === null ? "—" : eur(w.ist),
      planHoehe: w.plan === null ? null : balkenHoehe(w.plan, max, FELD_H),
      planText: w.plan === null ? null : `Plan ${eurGanz(w.plan)}`,
      unterzeile: unten.text,
      unterzeileTon: unten.ton,
    };
  });

  // Der Ton des großen Werts folgt derselben Regel wie der Balken — Zahl und
  // Säule dürfen nie Verschiedenes behaupten.
  for (const m of monate) {
    const w = werte.get(m.ym) ?? { ist: null, plan: null };
    m.ton = detailTon(w.ist, w.plan);
  }

  const schnitt = durchschnitt(istWerte);

  const daten: VerlaufDaten = {
    gewaehlt: targetMonth,
    monate,
    durchschnittText: schnitt === null ? null : eur(schnitt),
    offen: offenRaw ?? 0,
  };

  return (
    <>
      <VerlaufScreen daten={daten} />
      <MobilTabBar aktiv="verlauf" offen={daten.offen} monat={targetMonth} />
    </>
  );
}
