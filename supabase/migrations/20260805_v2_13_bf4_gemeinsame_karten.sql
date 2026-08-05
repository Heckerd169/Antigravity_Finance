-- ─────────────────────────────────────────────────────────────────────────────
-- Sprint v2-13 · BF-4 — gemeinsame Karten: der Anteil wird genau EINMAL angewandt
--
-- Befund:       V2/befunde_2026-08-04_fehler_und_entscheidungen.md §5
-- Entscheidung: E1 (Dominik, 05.08.2026), ebenda §7 — „die Zahlung ist mein Anteil"
-- Gestaltung:   V2/design_direktor_gemeinsame_karte.md
-- Konzept:      sprints/sprint_v2-13_konzept.md
--
-- ── DER FEHLER ───────────────────────────────────────────────────────────────
--
-- calculate_sparrate_for_month multipliziert ALLES mit dem Split-Faktor, was die
-- Kartenfunktion liefert — auch eine Fragment-Summe, die den Anteil bereits
-- enthält, weil real genau der Anteil überwiesen wurde:
--
--     v_card_amount := calculate_card_amount_for_month(v_card.id, p_month);
--     IF v_card.attribution = 'GEMEINSAM' THEN
--       v_card_amount := v_card_amount * v_split_factor;   -- zweiter Abzug
--
-- Gemessen an der Miete (Plan 1.904,00 €, Faktor 0,5721):
--
--     Karte plant (Haushalt)            1.904,00 €
--     tatsächlich überwiesen            1.089,26 €   ← ist schon der Anteil
--     „Realität gewinnt" → Karte        1.089,26 €
--     Sparrate zieht nochmals 57,21 %     623,17 €   ← FALSCH
--
--   → rund 466 € pro Monat zu gut, lautlos und ohne Fehlermeldung.
--
-- Beweislage für E1 (gemessen 05.08.2026 gegen Produktion): bei ALLEN VIER
-- gemeinsamen Karten entspricht der überwiesene Betrag dem rechnerischen Anteil
-- auf den Cent — in Mai, Juni UND Juli. Die Daueraufträge stehen bereits auf dem
-- Fairness-Anteil.
--
-- ── DIE LEITREGEL ────────────────────────────────────────────────────────────
--
--   Ein Betrag wird genau EINMAL anteilig gemacht — an der Stelle, an der er den
--   Haushalt verlässt und zur eigenen Zahl wird.
--
-- Fragment-Summen haben diesen Schritt hinter sich (sie SIND der überwiesene
-- Anteil). Plan-Werte nicht (sie sind die Haushaltsrechnung).
--
-- ── WARUM ALLE FUNKTIONEN IN EINER MIGRATION STEHEN ──────────────────────────
--
-- Drei der vier Funktionen wenden den Split heute selbst an. Würde man
-- calculate_card_amount_for_month zuerst ausliefern und die Aufrufer später,
-- wäre die Sparrate dazwischen DOPPELT anteilig — der Fehler wäre größer als
-- vorher. Diese Datei ist deshalb nicht teilbar und läuft in EINER Transaktion.
--
-- calculate_planned_sparrate_for_month ist inhaltlich UNVERÄNDERT und hier nur
-- deshalb wortgleich enthalten, damit die Datei den vollständigen Soll-Zustand
-- aller vier Funktionen beschreibt (Konzept §8 Schritt 2). Der Nachweis, dass
-- sie sich nicht verändert hat, läuft über den Vergleich der Plan-Sparrate in
-- allen zwölf Monaten vorher/nachher — sie muss auf den Cent identisch bleiben.
--
-- ── SOLL-ZUSTAND ─────────────────────────────────────────────────────────────
--
--   Funktion                              rechnet mit        Anteil?   Änderung
--   ─────────────────────────────────────────────────────────────────────────
--   calculate_card_amount_for_month       Fragmenten         nein      —
--     "                                   Plan/Adjustment    JA        NEU
--   calculate_sparrate_for_month          Kartenfunktion     nein      entfällt
--   calculate_planned_sparrate_for_month  Roh-Plan           JA        keine
--   get_year_deviation_drivers            ist=Anteil         gemischt  Umbau
--                                         plan=Haushalt
--
-- ── DIE FALLE BEI DEN TREIBERN ───────────────────────────────────────────────
--
-- Bisher:  delta = vorzeichen × anteil × ( ist − plan )
-- Neu:     delta = vorzeichen × ( ist − plan × anteil )
--
-- Wird `ist` vorab anteilig, `plan` aber nicht, ist die Klammer GEMISCHT und der
-- Anteil darf nicht mehr außen stehen. Wird das übersehen, laufen Welle-Tooltip
-- und Ring auseinander, OHNE dass eine Zahl offensichtlich falsch aussieht.
--
-- Wächter ist die B2-Invariante — sie muss in ALLEN ZWÖLF Monaten halten:
--
--     Σ delta(alle aktiven Karten, M)
--       = calculate_sparrate_for_month(M) − calculate_planned_sparrate_for_month(M)
--
-- Herleitung (deshalb hält sie):
--     Ist  = netto + Σ sign × ist_c            mit ist_c bereits anteilig
--     Plan = netto + Σ sign × (base_c × share) mit base_c = Haushalt
--     ⇒ Ist − Plan = Σ sign × ( ist_c − base_c × share ) = Σ delta   ∎
--   (bis auf Rundung je Karte — delta rundet pro Karte, die Sparraten am Ende)
--
-- ── PRÜFANKER (VOR der Anwendung festgelegt) ─────────────────────────────────
--
-- Auf Produktion bewegt sich NICHTS. Keine einzige gemeinsame Karte hat heute
-- ein verknüpftes Fragment (über alle Monate geprüft, 05.08.2026):
--
--     Jan–Apr  1.931,18 €   Mai  −86,77 €   Jun  4.208,76 €   Jul  −322,75 €
--     Aug      1.761,08 €   Sep–Dez  1.824,08 €
--
--   ALLE zwölf Monate unverändert, Ist wie Plan.
--
-- ACHTUNG — die Tücke dieses Sprints: Ein grüner Anker beweist hier NICHTS über
-- die Richtigkeit der neuen Logik. Er beweist nur, dass nichts kaputtging. Der
-- Beweis kommt aus der Übungs-Datenbank, mit einer eigens angelegten
-- GEMEINSAM-Karte, einem Partner-Einkommen (sonst ist der Faktor 1 und der Test
-- misst nichts) und künstlich verlinkten Fragmenten.
--
-- NICHT GEÄNDERT: die drei CASE-Zweige je Kartenart, die Vorzeichen-Behandlung
-- der Fragmente (v2-11/BF-5), die manually_paid-Logik, der Transfer-Filter
-- (v2-04 ③), Volatilität (STABLE), Rechte, Signaturen.
-- ─────────────────────────────────────────────────────────────────────────────

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1 · calculate_card_amount_for_month — HIER wird der Anteil angewandt
--
-- Sie ist die EINZIGE Stelle, die weiß, ob der Betrag aus Fragmenten oder aus
-- dem Plan stammt. Nur hier lässt sich „genau einmal anteilig" korrekt
-- entscheiden; ein Aufrufer weiter oben sieht nur noch eine Zahl.
--
-- Nebenwirkung, ausdrücklich gewollt (E1): Die Karte im Frontend liest denselben
-- Wert und zeigt damit automatisch den eigenen Anteil. Es braucht KEINE
-- Frontend-Rechnung — CLAUDE.md §7 Regel 1 bleibt gewahrt.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.calculate_card_amount_for_month(p_card_id uuid, p_month date)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  v_card           cards%ROWTYPE;
  v_state          card_monthly_states%ROWTYPE;
  v_planned        numeric;
  v_base_amount    numeric;
  v_fragment_net   numeric;   -- v2-11 (BF-5): Summe MIT Vorzeichen
  v_fragment_sum   numeric;   -- daraus abgeleitet: Betrag in Kartenart-Richtung
  v_fragment_count int;
BEGIN
  SELECT * INTO v_card FROM cards WHERE id = p_card_id;
  IF NOT FOUND THEN RETURN 0; END IF;
  IF NOT is_card_active_in_month(p_card_id, p_month) THEN RETURN 0; END IF;

  SELECT * INTO v_state
  FROM card_monthly_states
  WHERE card_id = p_card_id AND month = p_month;

  v_planned := get_planned_amount_for_month(p_card_id, p_month);
  IF v_planned IS NULL THEN
    v_planned := 0;
  END IF;

  -- Fragment-Summe — Transfer-Fragmente jeder Art ausgeschlossen
  -- (v2-04 ③: IS NULL; Defense-in-Depth zusätzlich zu OQ-B + Link-Trigger)
  -- v2-11 (BF-5): SUM(f.amount) statt SUM(ABS(f.amount)). Gutschriften und
  -- Ausgaben werden dadurch verrechnet statt addiert.
  SELECT COALESCE(SUM(f.amount), 0), COUNT(*)
  INTO v_fragment_net, v_fragment_count
  FROM card_fragment_links l
  JOIN fragments f ON f.id = l.fragment_id
  WHERE l.card_id = p_card_id
    AND l.month   = p_month
    AND f.transfer_type IS NULL;

  -- v2-11 (BF-5): Richtung EINMAL je Kartenart. Ergebnis ist der Betrag in der
  -- natürlichen Richtung der Karte (Kosten als positive Zahl) — genau die
  -- Konvention, die calculate_sparrate_for_month erwartet.
  -- Kein GREATEST(…, 0): E2 (05.08.2026) verlangt ausdrücklich KEINE Kappung.
  --
  -- v2-13 (BF-4): Diese Summe bleibt UNANGETASTET. Sie ist der real überwiesene
  -- Betrag und damit bereits der eigene Anteil — ein zweiter Abzug wäre genau
  -- der Fehler, den dieser Sprint behebt.
  v_fragment_sum := CASE v_card.type
    WHEN 'INCOME' THEN  v_fragment_net    -- Netto-Zufluss
    ELSE               -v_fragment_net    -- Netto-Abfluss (FIXED_COST, BUDGET)
  END;

  v_base_amount := COALESCE(v_state.adjusted_amount, v_planned);

  -- v2-13 (BF-4), E1: Plan und Anpassung sind die HAUSHALTS-Rechnung. Genau hier
  -- verlässt der Betrag den Haushalt und wird zur eigenen Zahl — also genau hier
  -- wird der Anteil angewandt, und nirgends sonst.
  --
  -- get_split_factor NUR bei GEMEINSAM aufrufen: die Funktion wird pro Karte und
  -- Monat ausgewertet (get_year_deviation_drivers ruft sie 12 × N mal auf), und
  -- bei ICH-Karten wäre das Ergebnis ohnehin wirkungslos.
  --
  -- get_split_factor ist die bekannte Ausnahme mit explizitem p_user_id
  -- (CLAUDE.md §6 Stolperfalle 4) — der Wert kommt aus der Kartenzeile selbst,
  -- nicht aus auth.uid(), damit die Funktion auch für Service-Rollen-Aufrufe und
  -- im Aggregat über fremde Karten korrekt bleibt.
  IF v_card.attribution = 'GEMEINSAM' THEN
    v_base_amount := v_base_amount * get_split_factor(v_card.user_id, p_month);
  END IF;

  RETURN CASE v_card.type
    WHEN 'FIXED_COST' THEN
      CASE
        WHEN v_fragment_count > 0                    THEN v_fragment_sum
        WHEN COALESCE(v_state.manually_paid, false)  THEN v_base_amount
        ELSE                                              v_base_amount
      END
    WHEN 'INCOME' THEN
      CASE
        WHEN v_fragment_count > 0                    THEN v_fragment_sum
        WHEN COALESCE(v_state.manually_paid, false)  THEN v_base_amount
        ELSE                                              v_base_amount
      END
    -- BUDGET kann per CHECK-Constraint `budget_never_shared` nie GEMEINSAM sein.
    -- Der Vergleich Fragment ↔ Plan bleibt damit faktisch unberührt; wäre es je
    -- anders, stünden nach dem Block oben beide Seiten korrekt im Anteils-Raum.
    WHEN 'BUDGET' THEN
      CASE
        WHEN v_fragment_count > 0 AND v_fragment_sum > v_base_amount
                                                     THEN v_fragment_sum
        WHEN COALESCE(v_state.manually_paid, false) AND v_fragment_count > 0
                                                     THEN v_fragment_sum
        WHEN COALESCE(v_state.manually_paid, false) AND v_fragment_count = 0
                                                     THEN 0
        WHEN v_fragment_count > 0                    THEN v_base_amount
        ELSE                                              v_base_amount
      END
  END;
END;
$function$;

COMMENT ON FUNCTION public.calculate_card_amount_for_month(uuid, date) IS
  'Ist-Betrag einer Karte im Monat nach §4.3 (Realität → Anpassung → Plan). '
  'v2-11: Fragmente vorzeichenrichtig verrechnet. '
  'v2-13 (BF-4/E1): Bei GEMEINSAM wird der Split-Anteil auf Plan/Anpassung '
  'angewandt, NICHT auf Fragment-Summen — die sind bereits der überwiesene '
  'Anteil. Der Rückgabewert ist damit stets die EIGENE Zahl; Aufrufer dürfen '
  'den Anteil nicht erneut anwenden.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2 · calculate_sparrate_for_month — die Multiplikation ENTFÄLLT
--
-- Der Anteil steckt ab jetzt schon in dem, was die Kartenfunktion liefert.
-- v_split_factor wird dadurch gegenstandslos und ist samt Aufruf entfernt —
-- eine tote Variable stehen zu lassen lädt dazu ein, die Multiplikation später
-- „versehentlich wieder scharf zu schalten".
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.calculate_sparrate_for_month(p_user_id uuid, p_month date)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
AS $function$
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

COMMENT ON FUNCTION public.calculate_sparrate_for_month(uuid, date) IS
  'Ist-Sparrate eines Monats (§4.2). v2-13 (BF-4/E1): wendet den Split-Anteil '
  'NICHT mehr selbst an — calculate_card_amount_for_month liefert bereits die '
  'eigene Zahl. Doppelte Anwendung war der Fehler BF-4.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3 · calculate_planned_sparrate_for_month — WORTGLEICH, inhaltlich unverändert
--
-- Sie rechnet mit dem ROH-Plan (get_planned_amount_for_month / adjusted_amount),
-- also mit der Haushaltsrechnung — nicht über calculate_card_amount_for_month.
-- Der Anteil gehört hier deshalb WEITERHIN angewandt, sonst wäre die
-- Plan-Sparrate zu niedrig und die B2-Invariante bräche.
--
-- Nur zur Vollständigkeit der Datei enthalten (Konzept §8): der Soll-Zustand
-- aller vier Funktionen steht damit an einer Stelle. Nachweis der
-- Unverändertheit: Plan-Sparrate aller zwölf Monate vorher/nachher identisch.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.calculate_planned_sparrate_for_month(p_user_id uuid, p_month date)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
AS $function$
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

  v_net_base := get_net_monthly_for_month(p_user_id, 'ICH', v_month);
  IF v_net_base IS NULL THEN
    RETURN NULL;
  END IF;

  v_split_factor := get_split_factor(p_user_id, v_month);

  -- Snapshot-Integrität §2.1: Aggregation IGNORIERT cards.deleted_at.
  FOR v_card IN
    SELECT *
    FROM cards
    WHERE user_id = p_user_id
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 4 · get_year_deviation_drivers — der Anteil wandert IN die Klammer
--
--   vorher:  sign × share × ( ist − plan )
--   nachher: sign × ( ist − plan × share )
--
-- `ist`  kommt aus calculate_card_amount_for_month und ist ab v2-13 bei
--        GEMEINSAM bereits anteilig.
-- `plan` kommt aus get_effective_plan_for_month und ist WEITERHIN der
--        Haushaltsbetrag — bewusst, denn genau diesen Betrag zeigt die Karte in
--        ihrer neuen Zeile „von X €".
--
-- Die JSON-Felder `ist`, `plan` und `share` behalten damit ihre Bedeutung
-- „so, wie es auf der Karte steht": `ist` ist die große Zahl, `plan` die Zeile
-- darunter. Das Frontend zeigt ohnehin nur Kartenname + `delta`
-- (components/welle/drivers.ts) — es gibt keine gemischte Darstellung.
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
  per_month AS (
    SELECT r.month_index,
           jsonb_agg(
             jsonb_build_object(
               'card_id',     r.card_id,
               'card_name',   r.card_name,
               'card_type',   r.card_type,
               'attribution', r.attribution,
               'ist',         round(COALESCE(r.ist, 0), 2),   -- wie auf der Karte: die große Zahl (ab v2-13 der eigene Anteil)
               'plan',        round(COALESCE(r.plan, 0), 2),  -- wie auf der Karte: die Zeile „von X €" (Haushalt)
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
  'delta = Wirkung auf die Sparrate (negativ = schlechter als geplant). '
  'v2-13 (BF-4): delta = sign × (ist − plan × share); `ist` ist bei GEMEINSAM '
  'bereits anteilig, `plan` ist der Haushaltsbetrag. Read-only, auth.uid()-basiert.';

COMMIT;
