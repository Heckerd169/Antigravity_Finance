-- ═══════════════════════════════════════════════════════════════════════════
-- Sprint v2-22 · Phase 1 — die Treiber-Summe stimmt wieder auf den Cent (B2-R)
--
-- BEFUND (gemessen 15.08.2026 gegen Produktion):
-- `get_year_deviation_drivers` rundet das Delta JE KARTE auf zwei Stellen. Die
-- Sparraten-Funktionen runden dagegen erst am Ende über alles. Die B2-Invariante
-- `Σ delta = Ist-Sparrate − Plan-Sparrate` läuft dadurch auseinander:
--
--   Monat   Karten ungerundet   je Zeile gerundet   Gehalt    Ziel (Ist − Plan)
--   Juni       −11,7700             −11,77           0,00        −11,77  ✅
--   Juli       −17,2036             −17,21         −15,57        −32,77  ❌ +0,01
--   August     −74,9943             −75,00           0,00        −74,99  ❌ +0,01
--
-- Ungerundet summiert stimmt jeder Monat. Das ist §6 Stolperfalle 13 / LL-25 —
-- dieselbe Fehlerklasse wie bei den Kategorien in v2-17, eine Ebene tiefer.
--
-- ZWEI DINGE, DIE DIE MESSUNG WIDERLEGT HAT:
--
-- ① **Das Gehalt ist unschuldig.** Es wird separat gerundet
--    (`round(ist_net - plan_net, 2)`), und die Vermutung lag nahe, dass es
--    beiträgt. Sein Delta ist in beiden betroffenen Monaten exakt (−15,57 €
--    im Juli, 0,00 € im August). Der Abstand entsteht vollständig in den Karten.
--
-- ② **Die Zeilen, die den Fehler verursachen, sind gar nicht sichtbar.** Ein
--    Delta von 0,0022 € rundet auf 0,00 und wird von `WHERE delta <> 0`
--    gefiltert — es steht in keiner Anzeige, verschiebt aber die Summe. Wer nur
--    auf die angezeigten Zeilen schaut, findet die Ursache nie.
--
-- ───────────────────────────────────────────────────────────────────────────
-- DIE ABHILFE — und warum sie das Ziel HOLT statt es herzuleiten
--
-- Naheliegend wäre `round(Σ delta_roh, 2)` als Zielwert; er stimmt in allen drei
-- geprüften Monaten. Aber `Ist − Plan` ist die Differenz **zweier getrennt
-- gerundeter** Summen, und die muss nicht gleich der gerundeten Differenz sein.
-- LL-25 sagt dazu wörtlich: *Ziel aus der Rechenfunktion **holen**, nicht
-- herleiten.* Genau daran ist die erste Fassung dieser Fehlerklasse gescheitert.
--
-- Also:
--   1. Deltas UNGERUNDET berechnen.
--   2. Ziel je Monat aus `calculate_sparrate_for_month` und
--      `calculate_planned_sparrate_for_month` holen.
--   3. Das Gehalts-Delta abziehen — es ist eine eigene, exakte Zeile.
--   4. Rest = Karten-Ziel − Σ(gerundete sichtbare Deltas), auf die
--      **betragsgrößte** Kartenzeile legen. Sie hat `rn = 1` und überlebt jeden
--      `p_limit`-Schnitt, der Rest kann also nicht wegfallen.
--
-- BEWEGT KEINE SPARRATE. Die Funktion ist reine Auswertung; sie schreibt nichts
-- und wird von keiner Rechenfunktion aufgerufen. Erwartung: Ist und Plan in allen
-- zwölf Monaten unverändert, B2 in allen zwölf Monaten **exakt 0,00**.
--
-- BEKANNTE GRENZE, bewusst so gelassen: Gäbe es in einem Monat gar keine sichtbare
-- Kartenzeile (alle Deltas unter einem halben Cent), während die Summe dennoch
-- einen Cent ergibt, hätte der Rest keinen Träger. Der Fall ist konstruierbar,
-- aber nicht real: Er verlangt, dass sich Sub-Cent-Beträge über viele Karten zu
-- einem vollen Cent addieren, ohne dass eine einzige Karte einen Cent erreicht.
-- Die B2-Prüfung in `db-eingriff` würde ihn anzeigen.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_year_deviation_drivers(
  p_year  integer,
  p_limit integer DEFAULT 3
)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_result  jsonb;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Nicht authentifiziert' USING ERRCODE = '28000';
  END IF;

  IF p_year IS NULL OR p_year < 1900 OR p_year > 2999 THEN
    RAISE EXCEPTION 'p_year ausserhalb des gueltigen Bereichs: %', p_year
      USING ERRCODE = '22023';
  END IF;

  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 50 THEN
    RAISE EXCEPTION 'p_limit muss zwischen 1 und 50 liegen: %', p_limit
      USING ERRCODE = '22023';
  END IF;

  WITH months AS (
    SELECT gs.i                            AS month_index,
           make_date(p_year, gs.i + 1, 1)  AS month
    FROM generate_series(0, 11) AS gs(i)
  ),
  months_split AS (
    SELECT m.month_index,
           m.month,
           get_split_factor(v_user_id, m.month) AS split_factor
    FROM months m
  ),
  card_month AS (
    SELECT m.month_index,
           m.month,
           c.id                AS card_id,
           c.name              AS card_name,
           c.type::text        AS card_type,
           c.attribution::text AS attribution,
           CASE WHEN c.attribution = 'GEMEINSAM' THEN m.split_factor ELSE 1 END AS share,
           CASE WHEN c.type = 'INCOME' THEN 1 ELSE -1 END                       AS sparrate_sign,
           calculate_card_amount_for_month(c.id, m.month) AS ist,
           get_effective_plan_for_month(c.id, m.month)    AS plan
    FROM months_split m
    JOIN cards c
      ON c.user_id = v_user_id                      -- Defense-in-Depth zusätzlich zu RLS
     AND c.deleted_at IS NULL                       -- v2-20 (KU-1)
     AND c.first_active_month <= m.month
     AND (c.last_active_month IS NULL OR c.last_active_month >= m.month)
    WHERE is_card_active_in_month(c.id, m.month)
  ),
  scored AS (
    -- v2-13 (BF-4): `share` steht INNEN am Plan-Teil, nicht außen vor der Klammer.
    -- v2-22 (B2-R): hier wird NICHT mehr gerundet. Das Runden je Zeile war die
    -- Ursache des Cent-Abstands — Σ round(x) ≠ round(Σ x).
    SELECT cm.*,
           cm.sparrate_sign * (COALESCE(cm.ist, 0) - COALESCE(cm.plan, 0) * cm.share)
             AS delta_roh
    FROM card_month cm
  ),
  sichtbar AS (
    -- Gerundet wird erst für die Anzeige. Zeilen unter einem halben Cent fallen
    -- heraus — ihr Beitrag kommt über den Rest zurück, siehe unten.
    SELECT s.*, round(s.delta_roh, 2) AS delta_ger
    FROM scored s
    WHERE round(s.delta_roh, 2) <> 0
  ),
  salary AS (
    -- v2-19 (GE-2): die Gehalts-Abweichung je Monat.
    SELECT m.month_index,
           get_net_monthly_for_month(v_user_id, 'ICH', m.month) AS plan_net,
           get_actual_net_for_month(v_user_id, 'ICH', m.month)  AS ist_net
    FROM months m
  ),
  salary_scored AS (
    SELECT s.month_index,
           s.ist_net,
           s.plan_net,
           round(s.ist_net - s.plan_net, 2) AS delta
    FROM salary s
    WHERE s.ist_net  IS NOT NULL
      AND s.plan_net IS NOT NULL
      AND round(s.ist_net - s.plan_net, 2) <> 0
  ),
  ziel AS (
    -- v2-22 (B2-R): Das Ziel wird GEHOLT, nicht hergeleitet (LL-25). `Ist − Plan`
    -- ist die Differenz zweier getrennt gerundeter Summen und muss nicht gleich
    -- der gerundeten Differenz sein.
    SELECT m.month_index,
           calculate_sparrate_for_month(v_user_id, m.month)
         - calculate_planned_sparrate_for_month(v_user_id, m.month) AS gesamt
    FROM months m
  ),
  rest AS (
    -- Was den sichtbaren Kartenzeilen zum Ziel fehlt, nachdem das Gehalt als
    -- eigene, exakte Zeile abgezogen ist.
    SELECT z.month_index,
           z.gesamt
             - COALESCE(ss.delta, 0)
             - COALESCE((SELECT sum(v.delta_ger)
                           FROM sichtbar v
                          WHERE v.month_index = z.month_index), 0) AS betrag
    FROM ziel z
    LEFT JOIN salary_scored ss ON ss.month_index = z.month_index
  ),
  ranked AS (
    SELECT v.*,
           row_number() OVER (
             PARTITION BY v.month_index
             ORDER BY abs(v.delta_ger) DESC, v.card_name ASC
           ) AS rn
    FROM sichtbar v
  ),
  korrigiert AS (
    -- Der Rest geht auf die betragsgrößte Zeile. Sie trägt `rn = 1` und überlebt
    -- damit jeden `p_limit`-Schnitt.
    SELECT r.*,
           CASE WHEN r.rn = 1 THEN r.delta_ger + COALESCE(rst.betrag, 0)
                ELSE r.delta_ger END AS delta
    FROM ranked r
    LEFT JOIN rest rst ON rst.month_index = r.month_index
  ),
  alle AS (
    -- Erst die Karten auf `p_limit` kürzen, DANN das Gehalt dazu (Record C).
    SELECT k.month_index, k.card_id, k.card_name, k.card_type, k.attribution,
           k.ist, k.plan, k.share, k.delta
      FROM korrigiert k
     WHERE k.rn <= p_limit
    UNION ALL
    SELECT ss.month_index,
           NULL::uuid     AS card_id,
           'Gehalt'::text AS card_name,
           NULL::text     AS card_type,
           NULL::text     AS attribution,
           ss.ist_net     AS ist,
           ss.plan_net    AS plan,
           1::numeric     AS share,
           ss.delta
      FROM salary_scored ss
  ),
  per_month AS (
    SELECT a.month_index,
           jsonb_agg(
             jsonb_build_object(
               'card_id',     a.card_id,
               'card_name',   a.card_name,
               'card_type',   a.card_type,
               'attribution', a.attribution,
               'ist',         round(COALESCE(a.ist, 0), 2),
               'plan',        round(COALESCE(a.plan, 0), 2),
               'share',       round(a.share, 6),
               'delta',       a.delta
             )
             ORDER BY abs(a.delta) DESC, a.card_name ASC
           ) AS drivers
    FROM alle a
    GROUP BY a.month_index
  )
  SELECT jsonb_agg(
           jsonb_build_object(
             'month_index', m.month_index,
             'month',       to_char(m.month, 'YYYY-MM-DD'),
             'drivers',     COALESCE(pm.drivers, '[]'::jsonb)
           )
           ORDER BY m.month_index
         )
    INTO v_result
    FROM months m
    LEFT JOIN per_month pm ON pm.month_index = m.month_index;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$function$;

COMMENT ON FUNCTION public.get_year_deviation_drivers(integer, integer) IS
  'Treiber der Jahres-Abweichung je Monat. v2-22 (B2-R): rundet nicht mehr je '
  'Zeile, sondern holt das Ziel aus den Sparrate-Funktionen und legt den Rest '
  'auf die betragsgrößte Kartenzeile (LL-25). Damit gilt die B2-Invariante '
  'Σ delta = Ist − Plan in allen zwölf Monaten exakt.';
