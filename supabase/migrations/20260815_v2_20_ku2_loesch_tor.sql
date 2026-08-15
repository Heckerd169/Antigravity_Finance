-- ============================================================================
-- Sprint v2-20 · KU-2, Teil 1 von 2 — das Lösch-Tor schützt nur noch die
-- Vergangenheit
--
-- Der Anlass ist eine Sackgasse aus der Nutzung (Befund B3,
-- V2/befunde_2026-08-15_kuratierung-august.md):
--
--   Der User legt aus einer Zahlung eine Karte an, passt den Betrag an, löst
--   die Zahlung wieder — und kommt an die Karte nicht mehr heran. Löschen ist
--   gesperrt („hat Monats-Änderungen"), und der Hinweis verweist auf
--   »Karte beenden…«, das es bei EINMALIGEN Karten gar nicht gibt. Karten aus
--   einer Zahlung sind aber typischerweise einmalig.
--
-- Was `HAS_STATES` eigentlich schützen soll, ist die HISTORIE: Eine Karte, die
-- in vergangenen Monaten Beträge beigesteuert hat, darf nicht verschwinden,
-- sonst kippen alte Sparraten. Bei einer Karte, die im laufenden Monat
-- entstanden ist, gibt es diese Historie nicht — dort ist der Monats-Zustand
-- entweder eine Betragsanpassung oder ein Bezahlt-Haken, beides gehört zur
-- Karte und stirbt mit ihr.
--
-- ⚠️ WAS SICH NICHT ÄNDERT:
--   · `HAS_LINKS`     — eine verknüpfte Zahlung blockiert weiterhin. Erst
--                       lösen, dann löschen.
--   · `HAS_PAST_PLAN` — eine Karte, die in einem vergangenen Monat aktiv war,
--                       bleibt unlöschbar. Das ist der eigentliche
--                       Historien-Schutz, und er trägt weiter.
--
-- Diese Migration BEWEGT KEINE ZAHL. `card_delete_gate` ist `STABLE` und
-- entscheidet nur über Erlaubnis. Belegt über die Prüfsummen der vier
-- Rechenfunktionen: identisch vor und nach.
--
-- Briefing: sprints/sprint_v2-20_briefing.md
-- ============================================================================

create or replace function public.card_delete_gate(p_card_id uuid)
returns jsonb
language plpgsql
stable
set search_path to 'public'
as $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_card    cards%ROWTYPE;
  v_reasons text[] := '{}';
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized' USING ERRCODE = '28000';
  END IF;

  SELECT * INTO v_card FROM cards WHERE id = p_card_id AND user_id = v_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'card not found or not owned: %', p_card_id USING ERRCODE = '42704';
  END IF;

  IF EXISTS (SELECT 1 FROM card_fragment_links WHERE card_id = p_card_id) THEN
    v_reasons := array_append(v_reasons, 'HAS_LINKS');
  END IF;

  -- v2-20 (KU-2): NUR NOCH Zustände aus VERGANGENEN Monaten blockieren.
  --
  -- Bisher blockierte jeder Monats-Zustand — auch einer aus dem laufenden
  -- Monat. Das machte jede frisch angelegte Karte unlöschbar, sobald man
  -- einmal den Betrag angepasst oder auf „bezahlt" getippt hatte, und es gab
  -- keinen Weg zurück: „Beenden" existiert bei einmaligen Karten nicht.
  --
  -- Der Historien-Schutz bleibt vollständig erhalten. Ein Zustand im
  -- laufenden Monat beschreibt genau den Monat, in dem der Nutzer gerade
  -- arbeitet — er ist Teil der Karte, nicht ihrer Vergangenheit.
  IF EXISTS (
    SELECT 1 FROM card_monthly_states
     WHERE card_id = p_card_id
       AND month < date_trunc('month', now())::date
  ) THEN
    v_reasons := array_append(v_reasons, 'HAS_STATES');
  END IF;

  IF v_card.first_active_month < date_trunc('month', now())::date THEN
    v_reasons := array_append(v_reasons, 'HAS_PAST_PLAN');
  END IF;

  RETURN jsonb_build_object(
    'deletable', cardinality(v_reasons) = 0,
    'reasons',   to_jsonb(v_reasons)
  );
END;
$function$;
