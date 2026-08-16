-- ═══════════════════════════════════════════════════════════════════════════
-- Sprint v2-21 · Phase 2 — die eigene Historie wird zur vierten Komponente
--
-- BEFUND: Juli und August sind zu 100 % von Hand zugeordnet. Das sind 101
-- Entscheidungen des Nutzers darüber, welche Zahlung zu welcher Karte gehört —
-- und bisher liest sie niemand aus. Von 284 offenen Zahlungen aus 2026 tragen
-- 86 (30 %) eine Beschreibung, die schon einmal zugeordnet wurde.
--
-- VERLÄSSLICHKEIT, gemessen statt vermutet:
--   · 108 gelernte Beschreibungen, davon 106 EINDEUTIG auf eine Karte
--     (nur 2 zeigen auf mehrere — 128 Zuordnungen gegen 4).
--   · Kreuzvalidierung: nur aus Juli gelernt, gegen August geprüft →
--     9 von 9 richtig, 0 falsch.
--
-- ERGEBNIS auf dem 101er-Prüfset (fair gemessen: das jeweils geprüfte Fragment
-- ist aus seiner eigenen Lernmenge ausgeschlossen, sonst lernt die Formel die
-- Antwort auswendig):
--
--   richtig ab 0.60:  30 (nach P1)  →  42
--   falsch  ab 0.60:   3 (nach P1)  →   4
--   Sieger richtig:   41 (nach P1)  →  50 von 101
--
-- Gegenüber dem Stand VOR diesem Sprint: 14 → 42 richtige Vorschläge,
-- 1 → 4 falsche. Präzision 91 %, Abdeckung verdreifacht.
--
-- ───────────────────────────────────────────────────────────────────────────
-- ZWEI ENTSCHEIDUNGEN, die hier festgehalten sind, weil sie nicht offensicht-
-- lich sind:
--
-- ① GELERNT WIRD NUR AUS `MANUAL_DROP`, nicht aus `AUTO_ABSORBED`.
--    Eine automatische Zuordnung ist keine Zustimmung des Nutzers — sie ist
--    eine Vermutung der App. Würde sie mitgelernt, verstärkte sich ein
--    Automatik-Fehler bei jedem weiteren Import selbst. Heute stünde das
--    theoretisch (4 von 132 Verknüpfungen sind automatisch), aber genau
--    deshalb ist jetzt der billige Zeitpunkt, es auszuschließen.
--
-- ② DIE WIEDERERKENNUNG IST GEDECKELT — auf `confidence.history_score`
--    = 0.94, also KNAPP UNTER der Auto-Absorptions-Schwelle von 0.95.
--    Damit erzeugt sie einen sichtbaren Vorschlag, aber niemals eine
--    automatische Verknüpfung. Das ist die Zusage dieses Sprints: Der Nutzer
--    sieht die Vorschläge erst und entscheidet danach, ob automatisch
--    verlinkt werden darf (User-Entscheid 15.08.2026).
--    Der Wert steht in `app_config` und nicht im Code — er lässt sich später
--    ohne Migration anheben (CLAUDE.md §7 Regel 5).
--
-- SIE WIRKT ALS UNTERGRENZE, NICHT ALS SUMMAND. Ein vierter gewichteter
-- Anteil hätte alle Scores gesenkt, bei denen keine Historie vorliegt — und
-- das sind die meisten. `GREATEST` kann nur heben, nie senken; die bestehenden
-- Gewichte bleiben dadurch unangetastet und summieren sich weiter auf 1.0.
--
-- BEWEGT KEINE ZAHL: `history_match` liest `card_fragment_links`, schreibt
-- aber nichts. Der einzige Aufrufer bleibt `calculate_match_confidence`.
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────
-- 1 · Der Deckel als Konfigurationswert
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO app_config (key, value)
VALUES ('confidence.history_score', '0.94'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ───────────────────────────────────────────────────────────────────────────
-- 2 · Die Wiedererkennung
--
-- „Wurde eine Zahlung mit genau dieser Beschreibung schon einmal von Hand
--  dieser Karte zugeordnet?"
--
-- Das Fragment selbst ist ausgeschlossen (`f.id <> p_fragment_id`) — sonst
-- bestätigte eine bereits zugeordnete Zahlung sich selbst.
-- Überträge bleiben außen vor (§6 Stolperfalle 7): sie sind nie an eine Karte
-- verlinkbar und dürfen deshalb auch nichts über Karten aussagen.
-- ───────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.history_match(p_fragment_id uuid, p_card_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  v_desc    text;
  v_user_id uuid;
  v_treffer integer;
BEGIN
  SELECT f.description, f.user_id INTO v_desc, v_user_id
    FROM fragments f WHERE f.id = p_fragment_id;
  IF NOT FOUND THEN RETURN 0; END IF;

  SELECT count(*) INTO v_treffer
    FROM fragments f
    JOIN card_fragment_links l ON l.fragment_id = f.id
   WHERE f.user_id       = v_user_id
     AND f.description   = v_desc
     AND f.id           <> p_fragment_id
     AND f.transfer_type IS NULL
     AND l.card_id       = p_card_id
     AND l.origin        = 'MANUAL_DROP'::link_origin;

  RETURN CASE WHEN v_treffer > 0 THEN 1.00 ELSE 0.00 END;
END;
$function$;

COMMENT ON FUNCTION public.history_match(uuid, uuid) IS
  'v2-21 P2: Wurde diese Beschreibung schon einmal VON HAND dieser Karte '
  'zugeordnet? Lernt bewusst nicht aus AUTO_ABSORBED (Selbstverstärkung) und '
  'nicht aus Überträgen. Kreuzvalidierung Juli→August: 9/9 richtig, 0 falsch.';

-- ───────────────────────────────────────────────────────────────────────────
-- 3 · Einhängen
--
-- Die Wiedererkennung hebt den Score auf `confidence.history_score`, wenn sie
-- greift — und lässt ihn sonst unberührt. Der Cut-Off unterhalb der Mindest-
-- schwelle greift danach nicht mehr: Eine wiedererkannte Zahlung ist ein
-- Treffer, auch wenn Name und Betrag nichts hergeben. Genau das ist ihr Zweck.
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
  v_hist_score  numeric;
  v_name_sim    numeric;
  v_amount_sim  numeric;
  v_freq_sim    numeric;
  v_hist        numeric;
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
  SELECT (value::text)::numeric INTO v_hist_score
    FROM app_config WHERE key = 'confidence.history_score';

  v_w_name     := COALESCE(v_w_name,     0.50);
  v_w_amount   := COALESCE(v_w_amount,   0.30);
  v_w_freq     := COALESCE(v_w_freq,     0.20);
  v_min_thresh := COALESCE(v_min_thresh, 0.20);
  v_hist_score := COALESCE(v_hist_score, 0.94);

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

  -- v2-21 P2: Wiedererkennung als UNTERGRENZE — sie hebt, sie senkt nie.
  -- Gedeckelt unter der Auto-Absorptions-Schwelle: sichtbarer Vorschlag,
  -- niemals eine automatische Verknüpfung.
  v_hist := history_match(p_fragment_id, p_card_id);
  IF v_hist > 0 THEN
    v_score := GREATEST(v_score, v_hist_score);
  END IF;

  -- Cut-Off: schwache Matches auf 0 zurücksetzen
  IF v_score < v_min_thresh THEN
    RETURN 0;
  END IF;

  RETURN round(v_score, 4);
END;
$function$;
