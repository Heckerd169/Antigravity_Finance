-- ─────────────────────────────────────────────────────────────────────────────
-- Sprint v2-06 · B2 Abweichungs-Treiber (Welle-Tooltip Top-1 + Popup Top-3)
--
-- Konzept: V2/architekt_konzept_b2_treiber_heuristik.md (E1/E2/E3 entschieden
-- 24.07.2026; E4 Rohmasse-Pseudo-Treiber bleibt offene DD-Frage — NICHT hier).
--
-- Datenpfad Option (c): EIN Jahres-Call speist Tooltip UND Popup, statt 12–62
-- Einzel-Calls pro Render (RPC-Burst-Vermeidung, siehe ECONNRESET-Befund 24.07.).
--
-- Heuristik (E1, mit User-Entscheid 25.07.2026 zu Vorzeichen + Anteil):
--   roh   := calculate_card_amount_for_month(karte, M)   -- §4.3-konformer Ist-Betrag
--          − get_effective_plan_for_month(karte, M)      -- Adjustment-aware Plan
--   delta := round(vorzeichen × anteil × roh, 2)
--            vorzeichen = +1 für INCOME, −1 für FIXED_COST/BUDGET
--            anteil     = get_split_factor(M) für GEMEINSAM, sonst 1
--
-- delta ist damit die WIRKUNG AUF DIE SPARRATE: negativ = der Monat ist um
-- diesen Betrag schlechter als geplant. Weil calculate_sparrate_for_month und
-- calculate_planned_sparrate_for_month über exakt dieselbe Kartenmenge, denselben
-- Split-Faktor und dieselben Vorzeichen aggregieren, gilt die Invariante
--   Σ delta(alle aktiven Karten, M) = IST-Sparrate(M) − Plan-Sparrate(M)
-- (bis auf Rundung pro Karte) — die Treiber erklären also genau die Differenz,
-- die der Welle-Tooltip darüber ausweist.
--
-- Keine eigene Betragslogik (CLAUDE.md §7 Regel 1): die Funktion ruft
-- ausschließlich die bestehenden §4.3-kompletten Basis-RPCs auf.
--
-- Snapshot-Integrität §2.1: KEIN cards.deleted_at-Filter — identisch zu den
-- Sparrate-RPCs, deren Kurve die Treiber erklären. (Papierkorb-Karten haben per
-- Lösch-Gate weder Links noch States noch Vergangenheits-Plan → delta = 0 →
-- fallen ohnehin aus dem Ranking.)
--
-- Read-only, STABLE, SECURITY INVOKER (RLS greift), Signatur ohne p_user_id
-- (auth.uid()-basiert) — Konvention der Hot-Path-RPCs.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_year_deviation_drivers(
  p_year  integer,
  p_limit integer DEFAULT 3
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
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
    -- Split-Faktor einmal pro Monat (nicht pro Karte) auflösen.
    SELECT m.month_index,
           m.month,
           get_split_factor(v_user_id, m.month) AS split_factor
    FROM months m
  ),
  card_month AS (
    -- Vorfilter über die Aktiv-Fenster-Spalten (Index-freundlich, analog zur
    -- Schleife in calculate_sparrate_for_month), Feinprüfung über die RPC
    -- (Frequenz-Raster QUARTERLY/SEMIANNUAL/ANNUAL/ONCE).
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
     AND c.first_active_month <= m.month
     AND (c.last_active_month IS NULL OR c.last_active_month >= m.month)
    WHERE is_card_active_in_month(c.id, m.month)
  ),
  scored AS (
    SELECT cm.*,
           round(
             cm.sparrate_sign * cm.share * (COALESCE(cm.ist, 0) - COALESCE(cm.plan, 0)),
             2
           ) AS delta
    FROM card_month cm
  ),
  ranked AS (
    -- Ranking |delta| absteigend; Tiebreaker Kartenname aufsteigend (de-facto
    -- deterministisch, analog zur §11-Mehrfach-Match-Regel aus Sprint 8).
    SELECT s.*,
           row_number() OVER (
             PARTITION BY s.month_index
             ORDER BY abs(s.delta) DESC, s.card_name ASC
           ) AS rn
    FROM scored s
    WHERE s.delta <> 0
  ),
  per_month AS (
    SELECT r.month_index,
           jsonb_agg(
             jsonb_build_object(
               'card_id',     r.card_id,
               'card_name',   r.card_name,
               'card_type',   r.card_type,
               'attribution', r.attribution,
               'ist',         round(COALESCE(r.ist, 0), 2),   -- Karten-Rohbetrag wie auf der Karte
               'plan',        round(COALESCE(r.plan, 0), 2),  -- Karten-Rohplan wie auf der Karte
               'share',       round(r.share, 6),              -- 1 oder Split-Faktor (GEMEINSAM)
               'delta',       r.delta                         -- Wirkung auf die Sparrate
             )
             ORDER BY r.rn
           ) AS drivers
    FROM ranked r
    WHERE r.rn <= p_limit
    GROUP BY r.month_index
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
  'B2 (v2-06): Top-N Abweichungs-Treiber je Monat eines Kalenderjahres. '
  'delta = Wirkung auf die Sparrate (negativ = schlechter als geplant), '
  'inkl. Split-Anteil bei GEMEINSAM. Read-only, auth.uid()-basiert.';
