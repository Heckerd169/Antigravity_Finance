-- ═══════════════════════════════════════════════════════════════════════════
-- Sprint v2-21 · Phase 3 — Vorschläge nachrechnen, ohne zu verlinken
--
-- BEFUND: `calculate_match_confidence` hat im gesamten Schema genau einen
-- Aufrufer — `process_csv_import` — und steht dort hinter
-- `IF v_was_inserted AND NOT v_is_internal`. Sie läuft also ausschließlich für
-- NEU EINGEFÜGTE Zeilen. Es gibt keine Funktion, die einen Vorschlag später
-- erneuert.
--
-- Folge: Wer nach dem Import eine Karte anlegt, bekommt für ältere Zahlungen
-- nie einen Vorschlag. 20 der 51 Karten sind nach dem Großimport vom 25.07.
-- entstanden. In den Daten: 1.590 Fragmente, davon 1.567 ohne Konfidenz — und
-- die 23 mit Konfidenz sind exakt dieselben 23 mit Vorschlag.
--
-- ───────────────────────────────────────────────────────────────────────────
-- ⚠️ DIE SCHARFE KANTE DIESES SPRINTS
--
--   `suggested_card_id` und `confidence` zu setzen bewegt KEINE Zahl —
--   das ist reine Anzeige.
--   `card_fragment_links` zu schreiben bewegt SOFORT die Sparrate.
--
-- Ein rückwirkendes Nachrechnen über 1.567 Zahlungen ist im ersten Fall
-- harmlos und im zweiten potenziell dramatisch. Der User hat am 15.08.2026
-- entschieden: erst sehen, dann entscheiden. Diese Funktion verlinkt deshalb
-- NICHT — auch nicht ab 0.95.
--
-- DIE ZUSAGE IST NICHT NUR BEHAUPTET, SIE IST ERZWUNGEN. Die Funktion zählt
-- die Verknüpfungen vor und nach ihrem Lauf und bricht mit einer Exception ab,
-- wenn sich die Zahl geändert hat. Wer sie später erweitert und dabei
-- versehentlich verlinkt, bekommt keinen stillen Fehler, sondern einen
-- Abbruch samt Rollback.
-- ───────────────────────────────────────────────────────────────────────────
--
-- AUTH: liest `auth.uid()` selbst, statt einen `p_user_id`-Parameter zu
-- nehmen — dasselbe Muster wie alle anderen mutierenden RPCs dieses Projekts
-- (`unauthorized` / 28000). §6 Stolperfalle 4 gilt für aggregierende
-- Lese-RPCs, nicht hier.
--
-- ÜBERTRÄGE: `transfer_type IS NOT NULL` bleibt unangetastet (§6 Stolperfalle
-- 7). Solche Zeilen sind nie an eine Karte verlinkbar und bekommen deshalb
-- auch keinen Vorschlag.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.refresh_fragment_suggestions(
  p_from_month date,
  p_to_month   date
)
 RETURNS jsonb
 LANGUAGE plpgsql
 VOLATILE
AS $function$
DECLARE
  v_user_id        uuid := auth.uid();
  v_badge_thresh   numeric;
  v_links_vorher   integer;
  v_links_nachher  integer;
  v_geprueft       integer := 0;
  v_gesetzt        integer := 0;
  v_geleert        integer := 0;
  v_bis            date;
  r                record;
  v_best_card_id   uuid;
  v_best_score     numeric;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentifizierung erforderlich' USING ERRCODE = '28000';
  END IF;

  IF p_from_month IS NULL OR p_to_month IS NULL THEN
    RAISE EXCEPTION 'Zeitraum darf nicht leer sein' USING ERRCODE = '22023';
  END IF;

  IF p_to_month < p_from_month THEN
    RAISE EXCEPTION 'Zeitraum ungueltig: % liegt vor %', p_to_month, p_from_month
      USING ERRCODE = '22023';
  END IF;

  -- Obergrenze, damit ein Vertipper nicht versehentlich über Jahrzehnte läuft.
  IF (p_to_month - p_from_month) > 1830 THEN     -- ~5 Jahre
    RAISE EXCEPTION 'Zeitraum zu gross (hoechstens 5 Jahre)' USING ERRCODE = '22023';
  END IF;

  SELECT (value::text)::numeric INTO v_badge_thresh
    FROM app_config WHERE key = 'confidence.badge_threshold';
  v_badge_thresh := COALESCE(v_badge_thresh, 0.60);

  -- Der Wächter, erste Hälfte.
  SELECT count(*) INTO v_links_vorher
    FROM card_fragment_links WHERE user_id = v_user_id;

  -- Bis einschließlich des letzten Tages von p_to_month.
  v_bis := (date_trunc('month', p_to_month) + interval '1 month')::date;

  FOR r IN
    SELECT f.id, f.transaction_date
      FROM fragments f
      LEFT JOIN card_fragment_links l ON l.fragment_id = f.id
     WHERE f.user_id        = v_user_id
       AND f.transfer_type IS NULL          -- Überträge nie (Stolperfalle 7)
       AND l.id            IS NULL          -- nur wirklich offene Zahlungen
       AND f.transaction_date >= date_trunc('month', p_from_month)::date
       AND f.transaction_date <  v_bis
     ORDER BY f.transaction_date
  LOOP
    v_geprueft := v_geprueft + 1;

    -- Beste Karte unter denen, die im Monat der Zahlung aktiv sind —
    -- derselbe Filter, den `process_csv_import` benutzt.
    SELECT cm.card_id, cm.score
      INTO v_best_card_id, v_best_score
    FROM (
      SELECT c.id   AS card_id,
             c.name AS card_name,
             calculate_match_confidence(r.id, c.id) AS score
        FROM cards c
       WHERE c.user_id = v_user_id
         AND c.deleted_at IS NULL
         AND is_card_active_in_month(
               c.id, date_trunc('month', r.transaction_date)::date)
    ) cm
    WHERE cm.score >= v_badge_thresh
    ORDER BY cm.score DESC, cm.card_name ASC
    LIMIT 1;

    IF v_best_card_id IS NOT NULL THEN
      UPDATE fragments
         SET suggested_card_id = v_best_card_id,
             confidence        = v_best_score
       WHERE id = r.id
         AND (suggested_card_id IS DISTINCT FROM v_best_card_id
              OR confidence     IS DISTINCT FROM v_best_score);
      IF FOUND THEN v_gesetzt := v_gesetzt + 1; END IF;
    ELSE
      -- Kein Kandidat mehr über der Schwelle: alten Vorschlag zurücknehmen,
      -- damit Anzeige und Rechnung nicht auseinanderlaufen.
      UPDATE fragments
         SET suggested_card_id = NULL,
             confidence        = NULL
       WHERE id = r.id
         AND (suggested_card_id IS NOT NULL OR confidence IS NOT NULL);
      IF FOUND THEN v_geleert := v_geleert + 1; END IF;
    END IF;

    v_best_card_id := NULL;
    v_best_score   := NULL;
  END LOOP;

  -- Der Wächter, zweite Hälfte. Diese Funktion darf die Sparrate nicht
  -- bewegen können — und `card_fragment_links` ist der einzige Weg dorthin.
  SELECT count(*) INTO v_links_nachher
    FROM card_fragment_links WHERE user_id = v_user_id;

  IF v_links_nachher <> v_links_vorher THEN
    RAISE EXCEPTION
      'INVARIANTE VERLETZT: Verknuepfungen haben sich geaendert (% -> %). '
      'refresh_fragment_suggestions darf ausschliesslich Anzeige-Spalten '
      'schreiben. Lauf abgebrochen und zurueckgerollt.',
      v_links_vorher, v_links_nachher
      USING ERRCODE = 'P0001';
  END IF;

  RETURN jsonb_build_object(
    'geprueft',           v_geprueft,
    'vorschlag_gesetzt',  v_gesetzt,
    'vorschlag_geleert',  v_geleert,
    'links_unveraendert', v_links_vorher,
    'badge_threshold',    v_badge_thresh
  );
END;
$function$;

COMMENT ON FUNCTION public.refresh_fragment_suggestions(date, date) IS
  'v2-21 P3: rechnet Kartenvorschläge für OFFENE Zahlungen eines Zeitraums neu '
  'und schreibt ausschliesslich suggested_card_id/confidence. Verlinkt '
  'NIEMALS — auch nicht ab der Auto-Absorptions-Schwelle. Die Zusage ist '
  'erzwungen: Die Funktion zählt card_fragment_links vor und nach dem Lauf '
  'und bricht bei jeder Abweichung mit Rollback ab.';

GRANT EXECUTE ON FUNCTION public.refresh_fragment_suggestions(date, date) TO authenticated;
