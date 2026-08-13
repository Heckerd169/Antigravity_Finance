-- ============================================================================
-- Sprint v2-19 · GE-1/GE-2, Teil 2 von 2 — „Realität gewinnt" auch für das Netto
--
-- Drei Funktionen in EINER Migration. Das ist Absicht, kein Bündeln aus
-- Bequemlichkeit: Zwischen „Ist-Sparrate rechnet mit dem echten Wert" und
-- „Ordner-Spalte zieht mit" ist Prüfanker 1 gebrochen (die Summe der Ordner
-- ergibt dann nicht mehr die Sparrate). Getrennt ausgeliefert gäbe es auf
-- Produktion ein Zeitfenster, in dem das gilt.
--
-- ⚠️ WAS HIER BEWUSST *NICHT* STEHT: `get_net_monthly_for_month` und
-- `calculate_planned_sparrate_for_month`.
--
-- Der naheliegende Eingriff wäre gewesen, die Wirklichkeit direkt in
-- `get_net_monthly_for_month` einzubauen — eine Zeile, alle Aufrufer erledigt.
-- Genau das wäre der Fehler: Sie wird von BEIDEN Sparraten-Funktionen gelesen.
-- Ist und Plan verschöben sich dann um denselben Betrag, die Differenz bliebe
-- unverändert, und die Abweichung, um die es hier geht, wäre danach
-- UNSICHTBARER als vorher. Das ist das Muster von LL-23 (v2-13): Eine Formel,
-- die beide Seiten einer Differenz benutzt, verträgt keinen Faktor an der
-- falschen Stelle — und es fällt nicht auf, weil keine Zahl offensichtlich
-- falsch AUSSIEHT.
--
-- Der Eingriff gehört ausschließlich in die IST-Funktion. Die Plan-Funktion
-- liest weiter die Zeitreihe. Belegt wird das über die Prüfsumme
-- `md5(pg_get_functiondef(...))`, die vor und nach dieser Migration identisch
-- sein MUSS (§7 Regel 22 / LL-22 — eine Zusage ist keine Prüfung).
--
-- Voraussetzung: 20260813_v2_19_ge1_ist_netto.sql
-- ============================================================================

-- ── 1 · Die Ist-Sparrate bevorzugt den echten Wert ─────────────────────────
--
-- Zwei Zeilen, und die Reihenfolge ist Absicht: Erst wird der Plan geholt und
-- der NULL-Fall abgefangen (Onboarding offen → die Sparrate ist NICHT
-- berechenbar, wie bisher). Erst danach überschreibt der Ist-Wert. Umgekehrt
-- gebaut, würde ein zugeordnetes Gehalt eine Sparrate liefern, wo bisher
-- bewusst NULL stand.

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

  -- v2-19 (GE-1): „Realität gewinnt" — dieselbe Regel, die für Fixkosten und
  -- Einnahmen längst gilt (§4.3), jetzt auch für das Netto. Liegt für diesen
  -- Monat eine zugeordnete Gehaltszahlung vor, zählt sie; sonst der Plan.
  -- Der PLAN bleibt unangetastet: `calculate_planned_sparrate_for_month`
  -- kennt diese Zeile nicht.
  v_net_base := COALESCE(
    get_actual_net_for_month(p_user_id, 'ICH', p_month),
    v_net_base
  );

  -- Snapshot-Integrität §2.1: Aggregation IGNORIERT cards.deleted_at.
  -- Hide ist UI-Concern, nicht Berechnungs-Concern.
  FOR v_card IN
    SELECT *
    FROM cards
    WHERE user_id = p_user_id
      AND first_active_month <= p_month
      AND (last_active_month IS NULL OR last_active_month >= p_month)
  LOOP
    IF NOT is_card_active_in_month(v_card.id, p_month) THEN
      CONTINUE;
    END IF;

    -- v2-13 (BF-4): liefert bei GEMEINSAM bereits den eigenen Anteil.
    -- KEINE Multiplikation mit dem Split-Faktor mehr — genau die war der Fehler.
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

-- ── 2 · Die Ordner-Spalte zieht mit ────────────────────────────────────────
--
-- Prüfanker 1 („Summe der Ordner == Sparrate, in allen zwölf Monaten") hält
-- hier PER KONSTRUKTION, nicht durch Nachrechnen: Das Ziel für die
-- Karten-Ordner ist `v_sparrate − v_net`, geholt aus der Rechenfunktion. Wenn
-- `v_net` derselbe Wert ist, den auch `calculate_sparrate_for_month` benutzt,
-- geht die Summe zwangsläufig auf.
--
-- Das ist genau die Lehre aus LL-25 (v2-17): Wer eine Aggregation über
-- Teilmengen selbst zusammenrechnet, bildet die Schlussrundung nicht nach und
-- landet 0,01 € daneben — in allen zwölf Monaten. Deshalb wird das Ziel
-- GEHOLT und der Rest verteilt, statt hergeleitet.
--
-- Neu ist allein `planned`: der Planwert des Monats, damit die Netto-Kachel
-- „geplant 4.165,11 €" zeigen kann, ohne eine zweite Quelle zu befragen
-- (Record, Entscheidung D). Bei Karten-Ordnern ist das Feld `null`.

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
  -- Liefe hier der Plan und dort der Ist-Wert, bräche Prüfanker 1 sofort.
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

-- ── 3 · Die Treiber bekommen eine Zeile ohne Karte ─────────────────────────
--
-- Bisher wurden die Treiber AUSSCHLIESSLICH aus Karten gebaut — jede Zeile
-- trug einen Kartennamen und meinte eine Karte, die es gibt. Weicht das Netto
-- ab, entsteht die erste Zeile, hinter der keine Karte steht.
--
-- Ohne diese Erweiterung bräche die B2-Invariante `Σ delta = Ist − Plan`
-- (§6 Stolperfalle 9) genau in dem Moment, in dem ein Gehalt zugeordnet wird:
-- Die Sparrate bewegte sich, die Treiber erklärten die Bewegung nicht. Ein
-- Sprint, der die Sparrate korrekt bewegt und die Treiber stehen lässt, ist
-- rot — dann erklärte das Jahres-Popup eine Abweichung mit Gründen, die sie
-- nicht ergeben.
--
-- Record, Entscheidung C: „Gehalt" erscheint IMMER, wenn es abweicht —
-- zusätzlich zu den drei Karten-Treibern und an seiner Rangposition nach
-- Betrag. Deshalb wird `p_limit` auf die KARTEN angewandt und die
-- Gehalts-Zeile erst danach hinzugefügt: Sie verdrängt keinen Karten-Treiber
-- und drängelt sich auch nicht nach vorn. Im Juli 2026 steht sie mit
-- −15,57 € hinten; bei einer Nachzahlung stünde sie oben.
--
-- Record, Entscheidung B: nicht anklickbar. Das Frontend trägt das bereits —
-- `DriverEntry` kennt nur `label` und `isPlaceholder`, keine Zeile ist heute
-- klickbar, und `parseYearDrivers` fängt `card_id: null` über `?? ""` ab.

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
    -- v2-13 (BF-4): `share` steht INNEN am Plan-Teil, nicht mehr außen vor der
    -- Klammer. `ist` ist bereits anteilig, `plan` ist der Haushaltsbetrag — eine
    -- gemischte Klammer, die einen Faktor außen nicht mehr verträgt.
    -- Wächter: B2-Invariante Σ delta = Ist-Sparrate − Plan-Sparrate.
    SELECT cm.*,
           round(
             cm.sparrate_sign * (COALESCE(cm.ist, 0) - COALESCE(cm.plan, 0) * cm.share),
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
  salary AS (
    -- v2-19 (GE-2): die Gehalts-Abweichung je Monat. `plan` ist die
    -- Einkommens-Zeitreihe, `ist` die Summe der zugeordneten Zahlungen
    -- (Fachregel G: mehrere summieren sich). Ohne Zuordnung ist `ist` NULL —
    -- dann gibt es keine Abweichung und keine Zeile.
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
    -- Erst die Karten auf `p_limit` kürzen, DANN das Gehalt dazu: So bleiben
    -- es drei Karten-Treiber, und die Gehalts-Zeile kommt hinzu statt eine zu
    -- verdrängen (Entscheidung C).
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
