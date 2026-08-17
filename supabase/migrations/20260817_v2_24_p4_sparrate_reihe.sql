-- ═══════════════════════════════════════════════════════════════════════════
-- v2-24 · P4 — die Jahres-Reihe der Sparrate in EINER Netzrunde
-- Befund: V2/befunde_2026-08-16_performance.md §2, §7 (U3)
-- Plan:   sprints/sprint_v2-24_briefing.md, Phase 4
-- ═══════════════════════════════════════════════════════════════════════════
--
-- WAS DAS PROBLEM WAR
-- `components/welle/loader.ts` holte 12× Ist und 12× Plan in 24 EINZELNEN
-- Netzrunden. In der Datenbank kostet dieselbe Schleife gemessen **54,6 ms**;
-- über die Leitung waren es in Produktion im Schnitt 1.298 ms (Ist) bzw.
-- 1.305 ms (Plan) — je Aufruf.
--
-- Nachgezählt im Produktions-Log: `calculate_sparrate_for_month` stand bei
-- exakt **25 Aufrufen je Dashboard-Aufbau** (12 aktives Jahr + 12 Vorjahr +
-- 1 Ring), `calculate_planned_sparrate_for_month` bei exakt **13** (12 + 1).
-- Nach v2-24 P2 sind die 12 Vorjahres-Aufrufe aus dem kritischen Pfad heraus;
-- diese Migration räumt die verbleibenden 24 ab.
--
-- WAS DIESE FUNKTION TUT — UND WAS SIE AUSDRÜCKLICH NICHT TUT
-- Sie **ruft** `calculate_sparrate_for_month` und
-- `calculate_planned_sparrate_for_month` auf. Sie **rechnet nicht selbst**.
--
-- Das ist hier besonders scharf, weil beide Funktionen **einmal ganz am Ende
-- über alles runden** (§6 Stolperfalle 13 / LL-25). Jede eigene Summierung oder
-- Zwischenrundung in dieser Funktion würde die Sparrate um Cent-Beträge
-- verschieben — und damit den schärfsten Regressions-Wächter des Projekts
-- (LL-24). Deshalb wird hier nichts summiert: Die Kumulation bleibt dort, wo sie
-- war, nämlich im Loader über die zurückgegebenen Monatswerte.
--
-- `NULL` BLEIBT `NULL`
-- Beide RPCs liefern `NULL`, wenn für den Monat kein Gehalt hinterlegt ist. Das
-- ist etwas anderes als 0,00 € — „keine Anzeige" ist nicht „nichts gespart"
-- (LL-20). Die Funktion gibt `NULL` deshalb unverändert weiter; erst der Loader
-- macht beim Kumulieren `null = 0` daraus, genau wie vorher.
--
-- KEIN SCHEMA-EINGRIFF
-- Keine Tabelle, keine Spalte, kein Constraint, kein Trigger. Nur eine neue
-- LESENDE Funktion. `STABLE` verbietet ihr schreibende Anweisungen.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_sparrate_series(
  p_user_id uuid,
  p_year    int
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
BEGIN
  IF p_year < 1900 OR p_year > 2200 THEN
    RAISE EXCEPTION 'p_year muss zwischen 1900 und 2200 liegen: %', p_year
      USING ERRCODE = '22023';
  END IF;

  RETURN (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'month_index', s.month_index,
          -- Kein round(), kein sum() — die Werte kommen so heraus, wie die
          -- Rechenfunktionen sie liefern. Begründung im Kopf dieser Datei.
          'ist',         s.ist,
          'plan',        s.plan
        )
        ORDER BY s.month_index
      ), '[]'::jsonb)
    FROM (
      SELECT g.i - 1                                                     AS month_index,
             calculate_sparrate_for_month(
               p_user_id, make_date(p_year, g.i, 1))                     AS ist,
             calculate_planned_sparrate_for_month(
               p_user_id, make_date(p_year, g.i, 1))                     AS plan
        FROM generate_series(1, 12) AS g(i)
    ) s
  );
END;
$function$;
