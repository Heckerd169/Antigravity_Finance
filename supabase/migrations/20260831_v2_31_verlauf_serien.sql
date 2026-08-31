-- ============================================================================
-- v2-31 · „Verlauf" je Karte und je Ordner  (M7 + KAT-4, Roadmap-Paket 10)
--
-- Zwei REIN LESENDE Serien-Funktionen. Sie legen nichts an, ändern nichts und
-- rufen ausschließlich bestehende Funktionen auf — sie können deshalb keinen
-- Zahlenwert bewegen. Beide STABLE, beide SECURITY INVOKER (wie alle anderen
-- Rechenfunktionen dieses Projekts), damit RLS für den Aufrufer greift.
--
-- ── WARUM ES SIE GIBT ──────────────────────────────────────────────────────
--
-- Die Roadmap führte M7 als „datenseitig bereits abgedeckt —
-- get_year_deviation_drivers liefert je Karte ist und plan pro Monat".
-- Gemessen am 31.08.2026 stimmt das nicht: Jene Funktion trägt die Zeile
--     WHERE round(delta_roh, 2) <> 0
-- und liefert deshalb AUSSCHLIESSLICH Karten, die vom Plan abweichen.
-- Netflix läuft zwölf Monate exakt auf Plan und erscheint in KEINEM Monat;
-- für September bis Dezember 2026 liefert sie gar nichts (0 von 22 aktiven
-- Karten). Ein Verlauf auf dieser Grundlage hätte Löcher, die wie fehlende
-- Daten aussehen und in Wahrheit „lief wie geplant" bedeuten. (LL-22)
--
-- ── EINE ANFRAGE STATT 36 ──────────────────────────────────────────────────
--
-- Ohne diese Funktionen bräuchte ein Verlauf je Karte 36 Netzrunden
-- (3 Einzel-RPCs × 12 Monate × 2 Jahre) oder 24 über get_cards_for_month.
-- Gemessen kostet die ganze Reihe in der Datenbank rund 21 ms; teuer ist
-- ausschließlich der Weg. Dasselbe Argument wie bei get_sparrate_series
-- (v2-24, PF-4): aus 24 Netzrunden wurde eine. Anker 3 zählt die Anfragen je
-- Dashboard-Aufbau — ein Feature, das je Geste 36 davon kostet, arbeitet
-- gegen ihn. (LL-29)
-- ============================================================================


-- ---------------------------------------------------------------------------
-- get_card_amount_series — 24 Monate Ist und Plan für EINE Karte
-- ---------------------------------------------------------------------------
--
-- p_year ist das RECHTE Jahr der Reihe; geliefert werden p_year-1 und p_year.
--
-- KEIN p_user_id: Diese Funktion löst eine EINZELNE Karte auf, sie aggregiert
-- nicht über den Nutzer (§6 Stolperfalle 4). Die user_id kommt aus der Karte
-- selbst; RLS auf `cards` sorgt dafür, dass eine fremde Karte gar nicht erst
-- gefunden wird — dann kommt `[]` zurück, kein Fehler und keine Zeile.
--
-- ⚠️ DER SPLIT-ANTEIL WIRD GENAU EINMAL ANGEWANDT, UND NUR AUF DEN PLAN.
-- `ist` kommt aus calculate_card_amount_for_month und ist bei GEMEINSAM
-- BEREITS der überwiesene Anteil (§6 Stolperfalle 11). Der Plan dagegen ist
-- der volle Haushaltsbetrag und muss heruntergerechnet werden, sonst stünden
-- zwei Größen mit verschiedener Basis nebeneinander: Bei der Miete wären das
-- 1.089,26 € gegen 1.904,00 € — 43 % Abstand in JEDEM Monat, und keiner davon
-- eine Abweichung. Wer hier einen zweiten Faktor einzieht, kürzt die bereits
-- umgerechnete Seite ein zweites Mal (LL-23).
--
-- ⚠️ INAKTIVE MONATE LIEFERN NULL, NICHT 0.
-- is_card_active_in_month sagt false, und beide Betragsfunktionen liefern dann
-- 0.00 — aber „nicht fällig" und „null Euro ausgegeben" sind verschiedene
-- Aussagen. Die Unterscheidung gehört hierher und nicht ins Frontend: Sonst
-- entscheidet die Anzeige, was ein fehlender Wert bedeutet, und zeichnet eine
-- jährliche Karte in elf Monaten auf die Nulllinie. (§7 Regel 15 · LL-20)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_card_amount_series(
  p_card_id uuid,
  p_year    integer
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id      uuid;
  v_attribution  text;
  v_result       jsonb;
BEGIN
  IF p_year IS NULL OR p_year < 1900 OR p_year > 2999 THEN
    RAISE EXCEPTION 'p_year ausserhalb des gueltigen Bereichs: %', p_year
      USING ERRCODE = '22023';
  END IF;

  -- RLS entscheidet hier: eine fremde Karte wird nicht gefunden.
  SELECT c.user_id, c.attribution::text
    INTO v_user_id, v_attribution
    FROM public.cards c
   WHERE c.id = p_card_id
     AND c.deleted_at IS NULL;

  IF v_user_id IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;

  WITH months AS (
    SELECT gs.i AS month_index,
           (make_date(p_year - 1, 1, 1) + (gs.i || ' month')::interval)::date AS month
      FROM generate_series(0, 23) AS gs(i)
  ),
  reihe AS (
    SELECT m.month_index,
           m.month,
           public.is_card_active_in_month(p_card_id, m.month)      AS aktiv,
           public.calculate_card_amount_for_month(p_card_id, m.month) AS ist,
           public.get_effective_plan_for_month(p_card_id, m.month)    AS plan_roh,
           CASE WHEN v_attribution = 'GEMEINSAM'
                THEN public.get_split_factor(v_user_id, m.month)
                ELSE 1 END                                          AS share
      FROM months m
  )
  SELECT jsonb_agg(
           jsonb_build_object(
             'month_index', r.month_index,
             'month',       to_char(r.month, 'YYYY-MM-DD'),
             'aktiv',       r.aktiv,
             'ist',   CASE WHEN r.aktiv THEN round(COALESCE(r.ist, 0), 2)                 END,
             'plan',  CASE WHEN r.aktiv THEN round(COALESCE(r.plan_roh, 0) * r.share, 2)  END
           )
           ORDER BY r.month_index
         )
    INTO v_result
    FROM reihe r;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$function$;

COMMENT ON FUNCTION public.get_card_amount_series(uuid, integer) IS
  'v2-31 (M7): 24 Monate Ist und Plan einer Karte, p_year-1 bis p_year. '
  'Rein lesend. Split genau einmal auf die Plan-Seite; inaktive Monate '
  'liefern NULL statt 0 (LL-20).';


-- ---------------------------------------------------------------------------
-- get_category_amount_series — 24 Monate Ist und Plan für EINEN Ordner
-- ---------------------------------------------------------------------------
--
-- ⚠️ DER IST-WERT WIRD GEHOLT, NICHT NACHGERECHNET — und das ist der heikelste
-- Punkt dieser Migration.
--
-- get_category_amounts_for_month legt den Rundungs-Rest des Monats auf den
-- BETRAGSGRÖSSTEN Ordner, damit Anker 1 (Σ Ordner == Sparrate) exakt gilt.
-- Wer stattdessen die Karten des Ordners direkt summiert, bekommt in genau den
-- Monaten einen anderen Wert, in denen dieser Ordner den Rest trägt.
--
-- Das ist keine theoretische Sorge: Gemessen am 31.08.2026 über 24 Monate
-- trägt in den vier Zukunftsmonaten (Sep–Dez 2026) jeweils EIN Ordner einen
-- Ausgleich von 0,01 €. Der Verlauf zeigte dort einen Cent weniger als die
-- Kachel im Karussell daneben — und KEINE ZAHL SÄHE DABEI FALSCH AUS.
-- Genau diese Fehlerklasse hat in v2-17 einen halben Sprint gekostet.
-- (§6 Stolperfalle 13 · LL-25 · LL-26 „Nachbauen")
--
-- Der Preis dafür sind 24 interne Aufrufe von get_category_amounts_for_month.
-- Sie rechnet jedes Mal ALLE Ordner des Monats — nötig, weil sich erst daraus
-- ergibt, wer den Rest trägt. Gemessen und im Sprint-Review belegt.
--
-- DIE PLAN-SEITE BEKOMMT BEWUSST KEINEN AUSGLEICH — und der Unterschied zur
-- Ist-Seite ist eine Messung wert, weil er beim ersten Hinsehen wie ein Fehler
-- aussieht.
--
-- Ungerundet über ALLE Karten summiert gilt exakt:
--   Σ (Karten-Plan × Anteil) + Netto-Plan == calculate_planned_sparrate_for_month
-- Differenz 0,00 € in allen 24 Monaten (gemessen 31.08.2026).
--
-- Summiert man dagegen die HIER ZURÜCKGEGEBENEN, je Ordner gerundeten Werte,
-- weicht das Ergebnis in 12 der 24 Monate um ±0,01 € ab. Das ist LL-25 Wort für
-- Wort: „Ungerundet summieren, erst am Ende runden" behebt die Rundung
-- INNERHALB einer Gruppe — der Cent geht ZWISCHEN den Gruppen verloren.
-- Innerhalb eines Ordners wird hier sauber gerechnet (sum() ungerundet, round()
-- einmal am Ende); die Abweichung entsteht erst beim Addieren der Ordner.
--
-- Das bleibt so, mit Absicht: Es gibt keine Anzeige, die Ordner-PLÄNE summiert.
-- get_category_amounts_for_month liefert `planned` für Karten-Ordner hart als
-- NULL — eine Plan-Spalte im Karussell existiert nicht. Anker 1 erzwingt den
-- Ausgleich auf der IST-Seite, weil dort eine sichtbare Summe stimmen muss; auf
-- der Plan-Seite gibt es keine solche Summe. Ein Ausgleich verschöbe den Plan
-- EINES Ordners um fremde Rundungsreste, damit eine Zahl stimmt, die niemand
-- sieht — und der Verlauf zeigt genau einen Ordner.
--
-- ⚠️ Wer das später ändert, braucht zuerst den Ort, an dem die Summe sichtbar
-- wird. Ohne den ist der Ausgleich keine Korrektur, sondern eine Verfälschung.
--
-- `aktiv` heißt hier: Der Ordner kommt in diesem Monat überhaupt vor, hat also
-- mindestens eine aktive Karte. Ein Ordner ohne aktive Karten wird im Karussell
-- nicht angezeigt (§8 „Der Schnitt atmet mit dem Jahr") — im Verlauf ist er
-- deshalb eine Lücke, keine Null.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_category_amount_series(
  p_category_id uuid,
  p_year        integer
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_result  jsonb;
BEGIN
  IF p_year IS NULL OR p_year < 1900 OR p_year > 2999 THEN
    RAISE EXCEPTION 'p_year ausserhalb des gueltigen Bereichs: %', p_year
      USING ERRCODE = '22023';
  END IF;

  -- RLS entscheidet: ein fremder Ordner wird nicht gefunden.
  SELECT k.user_id INTO v_user_id
    FROM public.card_categories k
   WHERE k.id = p_category_id;

  IF v_user_id IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;

  WITH months AS (
    SELECT gs.i AS month_index,
           (make_date(p_year - 1, 1, 1) + (gs.i || ' month')::interval)::date AS month
      FROM generate_series(0, 23) AS gs(i)
  ),
  -- Der Ist-Wert kommt aus derselben Funktion, die auch die Kachel speist.
  ordner AS (
    SELECT m.month_index,
           m.month,
           public.get_category_amounts_for_month(v_user_id, m.month) AS alle
      FROM months m
  ),
  treffer AS (
    SELECT o.month_index,
           o.month,
           t.wert
      FROM ordner o
      LEFT JOIN LATERAL (
        SELECT e AS wert
          FROM jsonb_array_elements(o.alle) e
         WHERE e->>'category_id' IS NOT NULL
           AND (e->>'category_id')::uuid = p_category_id
         LIMIT 1
      ) t ON true
  ),
  -- Die Plan-Seite: ungerundet summieren, einmal am Ende runden (LL-25).
  plan_je_monat AS (
    SELECT m.month_index,
           sum(
             CASE WHEN c.type = 'INCOME' THEN 1 ELSE -1 END
             * COALESCE(public.get_effective_plan_for_month(c.id, m.month), 0)
             * CASE WHEN c.attribution = 'GEMEINSAM'
                    THEN public.get_split_factor(v_user_id, m.month)
                    ELSE 1 END
           ) AS plan
      FROM months m
      JOIN public.cards c
        ON c.user_id      = v_user_id
       AND c.category_id  = p_category_id
       AND c.deleted_at   IS NULL
       AND c.first_active_month <= m.month
       AND (c.last_active_month IS NULL OR c.last_active_month >= m.month)
     WHERE public.is_card_active_in_month(c.id, m.month)
     GROUP BY m.month_index
  )
  SELECT jsonb_agg(
           jsonb_build_object(
             'month_index', t.month_index,
             'month',       to_char(t.month, 'YYYY-MM-DD'),
             'aktiv',       (t.wert IS NOT NULL),
             'ist',    CASE WHEN t.wert IS NOT NULL
                            THEN round((t.wert->>'amount')::numeric, 2) END,
             'plan',   CASE WHEN t.wert IS NOT NULL
                            THEN round(COALESCE(p.plan, 0), 2) END,
             'posten', CASE WHEN t.wert IS NOT NULL
                            THEN (t.wert->>'posten')::int END
           )
           ORDER BY t.month_index
         )
    INTO v_result
    FROM treffer t
    LEFT JOIN plan_je_monat p ON p.month_index = t.month_index;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$function$;

COMMENT ON FUNCTION public.get_category_amount_series(uuid, integer) IS
  'v2-31 (KAT-4): 24 Monate Ist und Plan eines Ordners, p_year-1 bis p_year. '
  'Rein lesend. Der Ist-Wert wird aus get_category_amounts_for_month GEHOLT, '
  'nicht nachgerechnet - dort sitzt der Rest-Ausgleich, den Anker 1 erzwingt '
  '(LL-25/LL-26). Der Plan wird direkt summiert und je Ordner einmal gerundet; '
  'die Summe ueber ALLE Ordner weicht deshalb um bis zu 0,01 EUR von '
  'calculate_planned_sparrate_for_month ab (gemessen: 12 von 24 Monaten). Das '
  'ist gewollt - es gibt keine Anzeige, die Ordner-Plaene summiert. Wer das '
  'aendert, braucht zuerst den Ort, an dem diese Summe sichtbar wird.';
