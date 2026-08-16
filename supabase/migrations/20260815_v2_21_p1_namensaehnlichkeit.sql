-- ═══════════════════════════════════════════════════════════════════════════
-- Sprint v2-21 · Phase 1 — die Namensfunktion lernt Wörter lesen
--
-- BEFUND (gemessen 15.08.2026 gegen Produktion, nicht erschlossen):
-- `name_similarity` nimmt das Maximum aus (a) `similarity()` über die GANZEN
-- Strings und (b) 0.80, falls der VOLLSTÄNDIGE Kartenname als Substring in der
-- Beschreibung steht. Beides versagt bei langen Buchungstexten gegen kurze
-- Kartennamen:
--
--   'Nurnberger Lebensversicherung Akti…' vs 'Private Altersvorsorge - Nürnberger'
--       → 0.139   (Umlaut im Kartennamen, keiner im Kontoauszug)
--   'Alte Leipziger Lebensversicherung…'  vs 'Berufsunfähigkeit - Alte Leipziger'
--       → 0.344
--   'Vodafone GmbH | Kundennummer 123'    vs 'Internet - Vodafone'
--       → 0.225
--
-- Alle drei sind für einen Menschen offensichtliche Treffer. Mit wortweisem
-- Vergleich und Umlaut-Normalisierung liefern sie 1.000.
--
-- ⚠️ DIE NAIVE FASSUNG IST SCHLECHTER ALS GAR KEINE. Gegen die 101 Hand-
-- zuordnungen aus Juli/August gemessen, stieg die Zahl RICHTIGER Vorschläge
-- über der Badge-Schwelle von 14 auf 27 — die Zahl FALSCHER aber von 1 auf 18.
-- Zwei Ursachen, beide hier behoben:
--
--   ① Der Vorname. Jede gemeinsame Überweisung trägt "Dominik Hecker und Aline
--      Nünninghoff" im Verwendungszweck. Das Wort 'aline' steht in SIEBEN
--      Kartennamen ('Handyvertrag - Aline', 'Aline Geburtstag', …) und traf
--      deshalb überall mit 1.00. 13 der 18 Falschtreffer kamen von hier.
--   ② Die Substring-Falle. `LIKE '%wort%'` trifft auch Wortteile:
--      'Doug|las' traf 'Radbrille - Glas', 'Kauf|land' traf 'Kauf iPhone'.
--
-- DIE ABHILFE braucht keine gepflegte Namensliste — sie ist datengetrieben:
-- Ein Kartenwort, das in MEHREREN Kartennamen desselben Nutzers vorkommt, kann
-- diese Karten nicht unterscheiden und wird durch ihre Zahl geteilt. Gemessen:
--
--   'aline'      → 7 Kartennamen → Gewicht 1/7
--   'nurnberger' → 1 Kartenname  → Gewicht 1/1
--   'leipziger'  → 1 Kartenname  → Gewicht 1/1
--
-- ERGEBNIS auf dem 101er-Prüfset: richtig ab 0.60 von 14 → 30,
-- falsch ab 0.60 von 1 → 3, falsch ab 0.95 unverändert 0.
--
-- BEWEGT KEINE ZAHL. `name_similarity` hat im gesamten Schema genau einen
-- Aufrufer (`calculate_match_confidence`), und die genau einen
-- (`process_csv_import`). Der Zuordnungs-Pfad ist von den Sparraten-Funktionen
-- vollständig isoliert — belegt über pg_proc, nicht angenommen.
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────
-- 1 · Normalisierung — Umlaute und ß
--
-- Der Kontoauszug schreibt 'Nurnberger', der Kartenname 'Nürnberger'. Ohne
-- diesen Schritt ist der Treffer unerreichbar. `unaccent` ist auf diesem
-- Projekt NICHT installiert (geprüft), deshalb translate/replace von Hand.
-- ───────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.af_normalize_text(p_text text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 PARALLEL SAFE
AS $function$
  SELECT replace(
           translate(lower(COALESCE(p_text, '')), 'äöüÄÖÜ', 'aouaou'),
           'ß', 'ss')
$function$;

COMMENT ON FUNCTION public.af_normalize_text(text) IS
  'v2-21 P1: kleinschreiben, Umlaute auflösen, ß→ss. Beide Seiten eines '
  'Namensvergleichs müssen hier durch, sonst scheitert Nürnberger↔Nurnberger.';

-- ───────────────────────────────────────────────────────────────────────────
-- 2 · Wortgrenzen-Treffer
--
-- `LIKE '%glas%'` trifft 'douglas'. Diese Funktion nicht: sie verlangt vor und
-- hinter dem Wort ein Nicht-Alphanumerisches oder den String-Rand.
--
-- Zum Regex-Escaping: p_word stammt IMMER aus einer Zerlegung an
-- `[^a-z0-9]+` und kann deshalb nur [a-z0-9] enthalten — es gibt nichts zu
-- escapen. Wer die Funktion anderswo aufruft, muss das sicherstellen.
-- ───────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.af_word_in_text(p_word text, p_text text)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE
 PARALLEL SAFE
AS $function$
  SELECT COALESCE(p_text ~ ('(^|[^a-z0-9])' || p_word || '([^a-z0-9]|$)'), false)
$function$;

COMMENT ON FUNCTION public.af_word_in_text(text, text) IS
  'v2-21 P1: Wort-Treffer MIT Wortgrenze. Ersetzt LIKE %wort%, das '
  'Douglas→Glas und Kaufland→Kauf zu Treffern machte. Erwartet p_word '
  'rein alphanumerisch (aus regexp_split_to_array an [^a-z0-9]+).';

-- ───────────────────────────────────────────────────────────────────────────
-- 3 · Namensähnlichkeit mit Karten-Kontext
--
-- Braucht die Karte statt nur ihres Namens, weil die Entwertung wissen muss,
-- in wie vielen Kartennamen DESSELBEN NUTZERS ein Wort vorkommt.
-- (§6 Stolperfalle 4: wer über den Nutzer aggregiert, braucht den Nutzer —
-- hier über cards.user_id aufgelöst, nicht als Parameter.)
--
-- Die alte `name_similarity` bleibt unverändert bestehen und wird als
-- UNTERGRENZE mitgeführt: Das Ergebnis kann nie schlechter werden als heute.
-- ───────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.name_similarity_scoped(
  p_description text,
  p_card_id     uuid
)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  v_user_id   uuid;
  v_card_name text;
  v_desc      text;
  v_wort      text;
  v_df        integer;
  v_treffer   numeric;
  v_ws        real;
  v_best      numeric := 0;
BEGIN
  SELECT c.user_id, c.name INTO v_user_id, v_card_name
    FROM cards c WHERE c.id = p_card_id;
  IF NOT FOUND THEN RETURN 0; END IF;

  v_desc := af_normalize_text(p_description);

  FOR v_wort IN
    SELECT DISTINCT w
      FROM unnest(regexp_split_to_array(af_normalize_text(v_card_name), '[^a-z0-9]+')) AS w
     WHERE length(w) >= 4
  LOOP
    -- Treffer: als ganzes Wort, sonst unscharf — aber erst ab 0.7, damit
    -- Trigram-Zufallstreffer ('glas' in 'douglas dglde…') nicht durchrutschen.
    IF af_word_in_text(v_wort, v_desc) THEN
      v_treffer := 1.00;
    ELSE
      v_ws := word_similarity(v_wort, v_desc);
      v_treffer := CASE WHEN v_ws >= 0.7 THEN v_ws::numeric ELSE 0 END;
    END IF;

    IF v_treffer > 0 THEN
      -- Entwertung: in wie vielen Kartennamen dieses Nutzers steht das Wort?
      SELECT count(*) INTO v_df
        FROM cards c
       WHERE c.user_id = v_user_id
         AND c.deleted_at IS NULL
         AND af_word_in_text(v_wort, af_normalize_text(c.name));

      IF v_df < 1 THEN v_df := 1; END IF;   -- kann nur bei Race auftreten
      v_best := GREATEST(v_best, v_treffer / v_df);
    END IF;
  END LOOP;

  -- Nie schlechter als der bisherige Weg.
  RETURN LEAST(1.00, GREATEST(v_best, name_similarity(p_description, v_card_name)));
END;
$function$;

COMMENT ON FUNCTION public.name_similarity_scoped(text, uuid) IS
  'v2-21 P1: wortweiser Namensvergleich mit Umlaut-Normalisierung, echten '
  'Wortgrenzen und Entwertung mehrdeutiger Kartenwörter (Gewicht 1/df über '
  'die Kartennamen des Nutzers). Führt die alte name_similarity als '
  'Untergrenze mit — das Ergebnis kann nie schlechter werden als vorher.';

-- ───────────────────────────────────────────────────────────────────────────
-- 4 · Einhängen
--
-- Einzige Änderung an `calculate_match_confidence`: die Namens-Komponente
-- kommt jetzt aus `name_similarity_scoped`. Gewichte, Cut-Off und Rundung
-- bleiben Wort für Wort wie zuvor.
-- ───────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.calculate_match_confidence(p_fragment_id uuid, p_card_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  v_fragment    fragments%ROWTYPE;
  v_card        cards%ROWTYPE;
  v_planned     numeric;
  v_w_name      numeric;
  v_w_amount    numeric;
  v_w_freq      numeric;
  v_min_thresh  numeric;
  v_name_sim    numeric;
  v_amount_sim  numeric;
  v_freq_sim    numeric;
  v_score       numeric;
BEGIN
  SELECT * INTO v_fragment FROM fragments WHERE id = p_fragment_id;
  IF NOT FOUND THEN RETURN 0; END IF;

  SELECT * INTO v_card FROM cards WHERE id = p_card_id;
  IF NOT FOUND THEN RETURN 0; END IF;
  IF v_card.deleted_at IS NOT NULL THEN RETURN 0; END IF;

  -- Gewichte aus app_config (mit Fallback auf Defaults)
  SELECT (value::text)::numeric INTO v_w_name
    FROM app_config WHERE key = 'confidence.weight_name';
  SELECT (value::text)::numeric INTO v_w_amount
    FROM app_config WHERE key = 'confidence.weight_amount';
  SELECT (value::text)::numeric INTO v_w_freq
    FROM app_config WHERE key = 'confidence.weight_frequency';
  SELECT (value::text)::numeric INTO v_min_thresh
    FROM app_config WHERE key = 'confidence.minimum_match_threshold';

  v_w_name     := COALESCE(v_w_name,     0.50);
  v_w_amount   := COALESCE(v_w_amount,   0.30);
  v_w_freq     := COALESCE(v_w_freq,     0.20);
  v_min_thresh := COALESCE(v_min_thresh, 0.20);

  -- Karten-Plan zum Zeitpunkt des Fragments
  v_planned := get_planned_amount_for_month(
    p_card_id,
    date_trunc('month', v_fragment.transaction_date)::date
  );

  -- Drei Komponenten berechnen
  -- v2-21 P1: Namens-Komponente wortweise, mit Entwertung mehrdeutiger Wörter.
  v_name_sim   := name_similarity_scoped(v_fragment.description, p_card_id);
  v_amount_sim := amount_match(v_fragment.amount, v_planned);
  v_freq_sim   := frequency_match(v_fragment.transaction_date, p_card_id);

  -- Gewichteter Score
  v_score := v_w_name * v_name_sim
           + v_w_amount * v_amount_sim
           + v_w_freq * v_freq_sim;

  -- Cut-Off: schwache Matches auf 0 zurücksetzen
  IF v_score < v_min_thresh THEN
    RETURN 0;
  END IF;

  RETURN round(v_score, 4);
END;
$function$;
