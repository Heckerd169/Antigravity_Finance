-- ============================================================================
-- Sprint v2-20 · KU-1, Teil 2 von 2 — der Papierkorb verschwindet aus der
-- Rechnung
--
-- Der Anlass (Befund B1, V2/befunde_2026-08-15_kuratierung-august.md):
-- Der Ordner „Urlaub" zeigte im August −559,85 €, die drei sichtbaren Karten
-- ergaben −914,85 €. Die Differenz von exakt 355,00 € war eine gelöschte
-- Einnahme-Karte: unsichtbar im Karussell, aber voll in der Rechnung. Die
-- Kachel verriet es sogar — sie sagte „4 Posten" bei drei Karten.
--
-- VIER Funktionen in EINER Migration. Das ist Absicht:
--   · nur die Ist-Funktion filtern  → Ist und Plan driften auseinander
--   · die Ordner-Funktion auslassen → Prüfanker 1 bricht
--   · die Treiber auslassen         → Prüfanker 2 (B2) bricht; sie erklärten
--                                     dann eine Karte, die nicht mehr zählt
-- Ein Zwischenzustand auf Produktion ist damit ausgeschlossen.
--
-- ── Warum das die Snapshot-Integrität (§2.1) NICHT verletzt ────────────────
--
-- §2.1 verbietet den `deleted_at`-Filter, damit historische Sparraten nicht
-- kippen. Genau das kann hier nicht eintreten: `card_delete_gate` lässt über
-- `HAS_PAST_PLAN` keine Karte löschen, die in einem vergangenen Monat aktiv
-- war. Eine Papierkorb-Karte beginnt frühestens im LAUFENDEN Monat — der
-- Filter wirkt also ausschließlich dort, wo der Nutzer gerade gelöscht hat.
--
-- Die bisherige Begründung im Code war zudem falsch:
--
--   „Papierkorb-Karten haben per Lösch-Gate weder Links noch States noch
--    Vergangenheits-Plan → delta = 0 → fallen ohnehin aus dem Ranking."
--
-- Das gilt für die TREIBER (delta = ist − plan = 0) und NICHT für die
-- SPARRATE (Beitrag = Plan, hier 355,00 €). Ein Schluss von einer Differenz
-- auf einen Absolutwert — dieselbe Fehlerklasse wie LL-23, und er fiel nicht
-- auf, weil keine Zahl offensichtlich falsch AUSSAH.
--
-- Voraussetzung: 20260815_v2_20_ku2_loesch_tor.sql
-- ============================================================================

-- ── 1 · Ist-Sparrate ────────────────────────────────────────────────────────

create or replace function public.calculate_sparrate_for_month(p_user_id uuid, p_month date)
returns numeric
language plpgsql
stable
as $function$
DECLARE
  v_net_base           numeric;
  v_sum_income_cards   numeric := 0;
  v_sum_fixed_cards    numeric := 0;
  v_sum_budget_cards   numeric := 0;
  v_card_amount        numeric;
  v_card               cards%ROWTYPE;
BEGIN
  v_net_base := get_net_monthly_for_month(p_user_id, 'ICH', p_month);
  IF v_net_base IS NULL THEN
    RETURN NULL;
  END IF;

  -- v2-19 (GE-1): „Realität gewinnt" — liegt für diesen Monat eine zugeordnete
  -- Gehaltszahlung vor, zählt sie; sonst der Plan.
  v_net_base := COALESCE(
    get_actual_net_for_month(p_user_id, 'ICH', p_month),
    v_net_base
  );

  -- v2-20 (KU-1): Karten im Papierkorb zählen NICHT mehr mit.
  -- Vorher stand hier der Hinweis „Aggregation IGNORIERT cards.deleted_at,
  -- Hide ist UI-Concern" — der stammte aus der Zeit des Verbergens, das in
  -- v2-05 ersatzlos gestrichen wurde. Seither ist `deleted_at` ausschließlich
  -- Papierkorb-Marker, und was im Papierkorb liegt, soll nicht mitrechnen.
  FOR v_card IN
    SELECT *
    FROM cards
    WHERE user_id = p_user_id
      AND deleted_at IS NULL
      AND first_active_month <= p_month
      AND (last_active_month IS NULL OR last_active_month >= p_month)
  LOOP
    IF NOT is_card_active_in_month(v_card.id, p_month) THEN
      CONTINUE;
    END IF;

    -- v2-13 (BF-4): liefert bei GEMEINSAM bereits den eigenen Anteil.
    v_card_amount := calculate_card_amount_for_month(v_card.id, p_month);

    IF v_card.type = 'INCOME' THEN
      v_sum_income_cards := v_sum_income_cards + v_card_amount;
    ELSIF v_card.type = 'FIXED_COST' THEN
      v_sum_fixed_cards  := v_sum_fixed_cards + v_card_amount;
    ELSIF v_card.type = 'BUDGET' THEN
      v_sum_budget_cards := v_sum_budget_cards + v_card_amount;
    END IF;
  END LOOP;

  RETURN round(
    (v_net_base + v_sum_income_cards) - v_sum_fixed_cards - v_sum_budget_cards,
    2
  );
END;
$function$;

-- ── 2 · Plan-Sparrate ───────────────────────────────────────────────────────
--
-- Sie MUSS mitziehen. Bliebe der Plan bei der gelöschten Karte, während das
-- Ist sie verliert, entstünde eine Abweichung aus dem Nichts — und die
-- Treiber-Liste müsste sie erklären, obwohl es die Karte nicht mehr gibt.

create or replace function public.calculate_planned_sparrate_for_month(p_user_id uuid, p_month date)
returns numeric
language plpgsql
stable
as $function$
DECLARE
  v_month              date;
  v_net_base           numeric;
  v_split_factor       numeric;
  v_sum_income_cards   numeric := 0;
  v_sum_fixed_cards    numeric := 0;
  v_sum_budget_cards   numeric := 0;
  v_card_amount        numeric;
  v_adjusted           numeric;
  v_planned            numeric;
  v_card               cards%ROWTYPE;
BEGIN
  v_month := date_trunc('month', p_month)::date;

  -- v2-19 (GE-1): BEWUSST der Plan aus der Zeitreihe, nicht das gemessene
  -- Netto. Ein Eingriff hier verschöbe beide Seiten der Differenz gleich weit
  -- und machte die Abweichung unsichtbarer als vorher (LL-23).
  v_net_base := get_net_monthly_for_month(p_user_id, 'ICH', v_month);
  IF v_net_base IS NULL THEN
    RETURN NULL;
  END IF;

  v_split_factor := get_split_factor(p_user_id, v_month);

  -- v2-20 (KU-1): Papierkorb-Karten zählen nicht mehr mit.
  FOR v_card IN
    SELECT *
    FROM cards
    WHERE user_id = p_user_id
      AND deleted_at IS NULL
      AND first_active_month <= v_month
      AND (last_active_month IS NULL OR last_active_month >= v_month)
  LOOP
    IF NOT is_card_active_in_month(v_card.id, v_month) THEN
      CONTINUE;
    END IF;

    SELECT adjusted_amount INTO v_adjusted
    FROM card_monthly_states
    WHERE card_id = v_card.id AND month = v_month;

    v_planned := get_planned_amount_for_month(v_card.id, v_month);

    v_card_amount := COALESCE(v_adjusted, v_planned, 0);

    IF v_card.attribution = 'GEMEINSAM' THEN
      v_card_amount := v_card_amount * v_split_factor;
    END IF;

    IF v_card.type = 'INCOME' THEN
      v_sum_income_cards := v_sum_income_cards + v_card_amount;
    ELSIF v_card.type = 'FIXED_COST' THEN
      v_sum_fixed_cards := v_sum_fixed_cards + v_card_amount;
    ELSIF v_card.type = 'BUDGET' THEN
      v_sum_budget_cards := v_sum_budget_cards + v_card_amount;
    END IF;
  END LOOP;

  RETURN round(
    (v_net_base + v_sum_income_cards) - v_sum_fixed_cards - v_sum_budget_cards,
    2
  );
END;
$function$;

-- ── 3 · Ordner-Spalte ───────────────────────────────────────────────────────
--
-- Sie MUSS mitziehen, sonst bricht Prüfanker 1 (Summe der Ordner == Sparrate).
-- Zusätzlich stimmt danach die Posten-Zahl wieder mit dem überein, was
-- aufgeklappt darunter steht — die Kachel sagte „4 Posten" bei drei Karten.

create or replace function public.get_category_amounts_for_month(p_user_id uuid, p_month date)
returns jsonb
language plpgsql
stable
set search_path to 'public'
as $function$
DECLARE
  v_month    date := date_trunc('month', p_month)::date;
  v_net_plan numeric;
  v_net      numeric;
  v_sparrate numeric;
  v_ziel     numeric;
BEGIN
  v_net_plan := get_net_monthly_for_month(p_user_id, 'ICH', v_month);

  IF v_net_plan IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;

  -- v2-19 (GE-1): derselbe Wert wie in `calculate_sparrate_for_month`.
  v_net := COALESCE(get_actual_net_for_month(p_user_id, 'ICH', v_month), v_net_plan);

  v_sparrate := calculate_sparrate_for_month(p_user_id, v_month);
  v_ziel     := v_sparrate - v_net;

  RETURN (
    WITH aktive AS (
      SELECT c.category_id,
             CASE WHEN c.type = 'INCOME' THEN 1 ELSE -1 END
               * calculate_card_amount_for_month(c.id, v_month) AS beitrag
        FROM cards c
       WHERE c.user_id = p_user_id
         AND c.deleted_at IS NULL          -- v2-20 (KU-1)
         AND c.first_active_month <= v_month
         AND (c.last_active_month IS NULL OR c.last_active_month >= v_month)
         AND is_card_active_in_month(c.id, v_month)
    ),
    ordner AS (
      SELECT a.category_id,
             sum(a.beitrag)            AS exakt,
             round(sum(a.beitrag), 2)  AS gerundet,
             count(*)::int             AS posten
        FROM aktive a
       GROUP BY a.category_id
    ),
    rest AS (
      SELECT
        v_ziel - COALESCE((SELECT sum(gerundet) FROM ordner), 0) AS delta,
        (SELECT o.category_id
           FROM ordner o
          ORDER BY abs(o.exakt) DESC, o.category_id NULLS LAST
          LIMIT 1)                                              AS traeger_id
    ),
    kartenordner AS (
      SELECT
        CASE WHEN o.category_id IS NULL THEN 'UNCATEGORIZED' ELSE 'CATEGORY' END AS key,
        o.category_id,
        COALESCE(k.name, 'Ohne Kategorie')  AS name,
        COALESCE(k.sort_order, 32000)::int  AS sort_order,
        o.gerundet
          + CASE WHEN o.category_id IS NOT DISTINCT FROM r.traeger_id
                 THEN r.delta ELSE 0 END    AS amount,
        o.posten,
        NULL::numeric                       AS planned
      FROM ordner o
      CROSS JOIN rest r
      LEFT JOIN card_categories k
        ON k.id = o.category_id AND k.user_id = p_user_id
    ),
    alle AS (
      SELECT 'INCOME'::text AS key, NULL::uuid AS category_id,
             'Einkommen'::text AS name, (-1000)::int AS sort_order,
             v_net AS amount, 1 AS posten, v_net_plan AS planned
      UNION ALL
      SELECT key, category_id, name, sort_order, amount, posten, planned
        FROM kartenordner
    )
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'key',         a.key,
          'category_id', a.category_id,
          'name',        a.name,
          'sort_order',  a.sort_order,
          'amount',      a.amount,
          'posten',      a.posten,
          'planned',     a.planned
        )
        ORDER BY a.sort_order, a.name
      ), '[]'::jsonb)
      FROM alle a
  );
END;
$function$;

-- ── 4 · Abweichungs-Treiber ────────────────────────────────────────────────
--
-- Sie MÜSSEN mitziehen, sonst bricht Prüfanker 2 (B2-Invariante
-- `Σ delta = Ist − Plan`): Die Treiber erklärten eine Karte, die in keiner der
-- beiden Sparraten mehr vorkommt.

create or replace function public.get_year_deviation_drivers(p_year integer, p_limit integer DEFAULT 3)
returns jsonb
language plpgsql
stable
set search_path to 'public'
as $function$
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
    -- v2-13 (BF-4): `share` steht INNEN am Plan-Teil, nicht mehr außen vor der
    -- Klammer. Wächter: B2-Invariante Σ delta = Ist-Sparrate − Plan-Sparrate.
    SELECT cm.*,
           round(
             cm.sparrate_sign * (COALESCE(cm.ist, 0) - COALESCE(cm.plan, 0) * cm.share),
             2
           ) AS delta
    FROM card_month cm
  ),
  ranked AS (
    SELECT s.*,
           row_number() OVER (
             PARTITION BY s.month_index
             ORDER BY abs(s.delta) DESC, s.card_name ASC
           ) AS rn
    FROM scored s
    WHERE s.delta <> 0
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
  alle AS (
    -- Erst die Karten auf `p_limit` kürzen, DANN das Gehalt dazu (Record C).
    SELECT r.month_index, r.card_id, r.card_name, r.card_type, r.attribution,
           r.ist, r.plan, r.share, r.delta
      FROM ranked r
     WHERE r.rn <= p_limit
    UNION ALL
    SELECT ss.month_index,
           NULL::uuid    AS card_id,
           'Gehalt'::text AS card_name,
           NULL::text    AS card_type,
           NULL::text    AS attribution,
           ss.ist_net    AS ist,
           ss.plan_net   AS plan,
           1::numeric    AS share,
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
