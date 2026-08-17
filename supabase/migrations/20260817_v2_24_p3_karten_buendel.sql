-- ═══════════════════════════════════════════════════════════════════════════
-- v2-24 · P3 — der Karten-Lader in EINER Netzrunde
-- Befund: V2/befunde_2026-08-16_performance.md §2, §7 (U1)
-- Plan:   sprints/sprint_v2-24_briefing.md, Phase 3
-- ═══════════════════════════════════════════════════════════════════════════
--
-- WAS DAS PROBLEM WAR
-- `src/app/page.tsx` lud alle 77 nicht-gelöschten Karten, rief dann
-- `is_card_active_in_month` EINZELN für jede davon, warf 43 Antworten weg und
-- feuerte für die verbleibenden 34 je DREI weitere Aufrufe (Betrag, wirksamer
-- Plan, Monatszustand). Zusammen 179 der 233 Netzrunden eines
-- Dashboard-Aufbaus — für gemessene 17 ms Rechenarbeit.
--
-- Der Kommentar an der Stelle nannte die Annahme, die längst gebrochen war:
--   „N+1-Pragmatik: bei <20 Karten in V1 akzeptable Latenz (Briefing §K1.4)."
-- Es sind 77. Und die 34 Einzelabfragen auf `card_monthly_states` trafen eine
-- Tabelle mit insgesamt 26 Zeilen.
--
-- Gemessene Kosten der Einzelaufrufe: `is_card_active_in_month` braucht 0,089 ms
-- in der Datenbank und im Produktionsschnitt 899 ms über die Leitung — Faktor
-- ~10.000. Nichts davon ist Rechnen.
--
-- WAS DIESE FUNKTION TUT — UND WAS SIE AUSDRÜCKLICH NICHT TUT
-- Sie **ruft** `is_card_active_in_month`, `calculate_card_amount_for_month` und
-- `get_effective_plan_for_month` auf. Sie **baut sie nicht nach**.
--
-- Das ist keine Stilfrage, sondern die ganze Sicherheit dieses Eingriffs:
-- `calculate_card_amount_for_month` wendet den Split-Anteil einer
-- GEMEINSAM-Karte GENAU EINMAL an (§6 Stolperfalle 11). Ein Nachbau der
-- Prioritätskette würde ihn ein zweites Mal anwenden — „Miete" zeigte dann
-- 619 € statt 1.089 €, und das sieht nicht falsch aus. Genau dieser Fehler war
-- v2-13 (`BF-4`).
--
-- Belegt wird das über die Prüfsummen in `sprints/sprint_v2-24_anker.md`: Alle
-- neun bestehenden Rechenfunktionen müssen nach dieser Migration
-- BYTE-IDENTISCH sein. Diese Datei fasst keine von ihnen an.
--
-- WARUM DER MONATSBEREICH ZUSÄTZLICH ALS VORFILTER STEHT
-- `is_card_active_in_month` erzwingt den Bereich selbst (`p_month <
-- first_active_month` → false, `p_month > last_active_month` → false) und
-- verengt danach über die Frequenz. Der inline-Vorfilter ist damit eine echte
-- Obermenge und kann nichts ausschließen, was die Funktion einschließen würde —
-- er erlaubt nur den Index-Zugriff, statt die Funktion 77-mal aufzurufen.
--
-- Rein lesend gegen Produktion belegt, nicht angenommen: über alle 24 Monate
-- 2025+2026 liefern „alle nicht-gelöschten Karten, dann is_card_active_in_month"
-- und „mit Vorfilter" **304 gegen 304 Zeilen, 0 Unterschied in beide
-- Richtungen**. Dasselbe Muster benutzt `get_category_amounts_for_month` seit
-- v2-17, und dessen Invariante (Σ Ordner == Sparrate) hält exakt.
--
-- WARUM DER LEFT JOIN NICHT DOPPELN KANN
-- `card_monthly_states` trägt `UNIQUE (card_id, month)` (§6 Stolperfalle 2) —
-- geprüft über `pg_constraint`, nicht angenommen.
--
-- KEIN SCHEMA-EINGRIFF
-- Keine Tabelle, keine Spalte, kein Constraint, kein Trigger. Nur eine neue
-- LESENDE Funktion. `STABLE` verbietet ihr schreibende Anweisungen; sie kann
-- strukturell nichts verändern.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_cards_for_month(
  p_user_id uuid,
  p_month   date
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
DECLARE
  v_month date := date_trunc('month', p_month)::date;
BEGIN
  RETURN (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'card_id',         x.id,
          -- Anzeige-Betrag, Prioritätskette Realität → Anpassung → Plan,
          -- fragment-aware inkl. aller §4.3-Sonderfälle. Bei GEMEINSAM bereits
          -- der EIGENE Anteil (v2-13/BF-4).
          'amount',          x.amount,
          -- Vergleichsbasis für Budget-Status und „Noch frei": Anpassung >
          -- Roh-Plan. Bleibt bewusst die VOLLE Haushaltsrechnung — die Karte
          -- rechnet §4.3 nicht nach (§7 Regel 1).
          'effective_plan',  x.effective_plan,
          'manually_paid',   x.manually_paid,
          'adjusted_amount', x.adjusted_amount
        )
        ORDER BY x.id
      ), '[]'::jsonb)
    FROM (
      SELECT c.id,
             calculate_card_amount_for_month(c.id, v_month) AS amount,
             get_effective_plan_for_month(c.id, v_month)     AS effective_plan,
             -- `false` statt NULL, damit der Aufrufer keinen Vorgabewert
             -- kennen muss — dieselbe Lesart wie `stateRow?.manually_paid ??
             -- false` im heutigen Frontend.
             COALESCE(s.manually_paid, false)                AS manually_paid,
             -- Hier bleibt NULL NULL: „keine Anpassung" und „Anpassung auf 0 €"
             -- sind verschiedene Aussagen (§6 Stolperfalle 3).
             s.adjusted_amount
        FROM cards c
        LEFT JOIN card_monthly_states s
               ON s.card_id = c.id
              AND s.month    = v_month
       WHERE c.user_id = p_user_id
         AND c.deleted_at IS NULL          -- Papierkorb bleibt draußen (v2-20/KU-1)
         -- Vorfilter, Begründung im Kopf dieser Datei:
         AND c.first_active_month <= v_month
         AND (c.last_active_month IS NULL OR c.last_active_month >= v_month)
         -- ... und die autoritative Entscheidung, inkl. Frequenz-Rhythmus:
         AND is_card_active_in_month(c.id, v_month)
    ) x
  );
END;
$function$;
