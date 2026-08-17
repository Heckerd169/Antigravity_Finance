-- ============================================================================
-- Sprint v2-25 · KJ-2 — Das Bezahlt-Häkchen und „nicht angefallen" schließen
--                       sich aus
--
-- ANLASS (Record vom 17.08.2026, Entscheidung 4):
--
--   „Ist bezahlt" gegen „fiel nicht an" ist ein Widerspruch. Wer „nicht
--   angefallen" setzt, verliert das Häkchen — das schreibt die neue Aktion
--   selbst, in EINEM Upsert. Die umgekehrte Richtung folgt daraus: Wer danach
--   abhakt, hebt die Anpassung auf. Sonst stünde ein Häkchen an einer Karte,
--   die 0,00 € zeigt — genau die Falschaussage, die KJ-3 gerade verhindert.
--
-- WARUM IN DER DATENBANK UND NICHT IN DER SERVER ACTION:
--
--   Es geht um zwei Felder, die sich widersprechen können, und der Widerspruch
--   BEWEGT DIE SPARRATE: `manually_paid` ändert nur die Anzeige, aber
--   `adjusted_amount = 0` schlägt in `calculate_card_amount_for_month` den
--   Plan. Ein Häkchen an einer 0,00-€-Karte wäre also nicht nur hässlich,
--   sondern eine Karte, die als bezahlt gilt und nichts beiträgt.
--
--   `applyAdjustmentForward` räumt vergleichbar in der Server Action auf
--   (K4, cards/actions.ts) — dort geht es aber nicht um einen
--   widersprüchlichen Zustand, sondern um eine überschattete Anpassung. Hier
--   muss beides in EINER Transaktion fallen.
--
-- ⚠️ NUR die 0 wird aufgehoben, keine andere Anpassung. Eine Karte mit
--    `adjusted_amount = 504,95` behält ihren Wert, wenn man sie abhakt — das
--    ist kein Widerspruch, sondern „dieser Monat kostet ausnahmsweise mehr,
--    und ich habe es bezahlt".
--
-- ⚠️ `manually_paid` bleibt in derselben Zeile UNBERÜHRT vom Leeren
--    (§6 Stolperfalle 3: Feld leeren heißt `SET x = NULL`, niemals `DELETE`).
--    Genau deshalb steht hier ein UPDATE mit CASE und kein DELETE.
--
-- DIESE MIGRATION BEWEGT KEINE ZAHL. Sie ändert nur, was ein KÜNFTIGER
-- Nutzer-Klick schreibt; kein Bestandsdatum wird angefasst. Die vier
-- Rechenfunktionen sind unberührt (Prüfsummen identisch).
--
-- Briefing: sprints/sprint_v2-25_briefing.md
-- ============================================================================

create or replace function public.toggle_card_manually_paid(
  p_card_id uuid,
  p_month   date
)
returns boolean
language plpgsql
set search_path to 'public'
as $function$
DECLARE
  v_user_id          uuid := auth.uid();
  v_card             cards%ROWTYPE;
  v_month_normalized date  := date_trunc('month', p_month)::date;
  v_state            card_monthly_states%ROWTYPE;
  v_new_value        boolean;
BEGIN
  -- Auth ---------------------------------------------------------------
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized' USING ERRCODE = '28000';
  END IF;

  IF p_card_id IS NULL OR p_month IS NULL THEN
    RAISE EXCEPTION 'p_card_id und p_month dürfen nicht NULL sein'
      USING ERRCODE = '22023';
  END IF;

  -- Card-Ownership ----------------------------------------------------
  SELECT * INTO v_card
    FROM cards
   WHERE id = p_card_id
     AND user_id = v_user_id
     AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'card not found or not owned: %', p_card_id
      USING ERRCODE = '42704';
  END IF;

  -- Active-Range-Check (inkl. Frequenz via is_card_active_in_month) ----
  IF NOT is_card_active_in_month(p_card_id, v_month_normalized) THEN
    RAISE EXCEPTION 'month outside card active range: card=% month=%',
      p_card_id, v_month_normalized
      USING ERRCODE = '22023';
  END IF;

  -- Existierende State-Row holen
  SELECT * INTO v_state
    FROM card_monthly_states
   WHERE card_id = p_card_id
     AND month   = v_month_normalized;

  -- Eingefroren-Schutz: closed_at gesetzt → kein Toggle
  IF FOUND AND v_state.closed_at IS NOT NULL THEN
    RAISE EXCEPTION 'month is closed (frozen): card=% month=% closed_at=%',
      p_card_id, v_month_normalized, v_state.closed_at
      USING ERRCODE = '55000';  -- object_not_in_prerequisite_state
  END IF;

  -- Toggle / Insert ---------------------------------------------------
  IF FOUND THEN
    v_new_value := NOT v_state.manually_paid;

    UPDATE card_monthly_states
       SET manually_paid   = v_new_value,
           -- v2-25 (KJ-2, Entscheidung 4): Wer abhakt, hebt „nicht angefallen"
           -- auf. Die Bedingung greift ausschließlich, wenn das Häkchen
           -- GESETZT wird (`v_new_value`) UND dort eine echte 0 steht.
           --
           -- `v_state.adjusted_amount = 0` ist bei NULL selbst NULL, nicht
           -- false — der CASE fällt dann korrekt in den ELSE-Zweig und lässt
           -- die Spalte, wie sie ist. Eine Anpassung auf einen anderen Wert
           -- bleibt ebenfalls unberührt.
           adjusted_amount = CASE
             WHEN v_new_value AND v_state.adjusted_amount = 0 THEN NULL
             ELSE card_monthly_states.adjusted_amount
           END,
           updated_at      = now()
     WHERE card_id = p_card_id
       AND month   = v_month_normalized;
  ELSE
    v_new_value := true;

    -- Kein Zustand vorhanden heißt: keine Anpassung vorhanden. Nichts
    -- aufzuheben.
    INSERT INTO card_monthly_states (user_id, card_id, month, manually_paid)
    VALUES (v_user_id, p_card_id, v_month_normalized, true);
  END IF;

  RETURN v_new_value;
END;
$function$;
