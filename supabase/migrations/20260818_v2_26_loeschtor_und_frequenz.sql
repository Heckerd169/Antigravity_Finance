-- ============================================================================
-- Sprint v2-26 · Zwei Nachbesserungen aus der Benutzung von v2-25
--
-- ANLASS: Der Nutzer hat nach dem Merge von v2-25 die Karte `Privathaftpflicht`
-- angelegt und konnte sie nicht mehr loeschen — obwohl der Vergangenheits-Riegel
-- in v2-25 gefallen ist.
--
-- ── 1 · WARUM SIE TROTZDEM GESPERRT WAR ─────────────────────────────────────
--
-- `card_delete_gate` meldete `HAS_STATES`. Die Karte hatte GENAU EINE Zeile in
-- `card_monthly_states`, fuer April 2026:
--
--     manually_paid = false · adjusted_amount = NULL
--
-- Diese Zeile sagt NICHTS aus. Sie ist der Rueckstand eines Tap, der wieder
-- zurueckgenommen wurde: Der erste Tap legt die Zeile mit `true` an, der zweite
-- setzt `false` — und die Zeile bleibt liegen. `toggle_card_manually_paid`
-- loescht sie bewusst nicht (§6 Stolperfalle 3: in derselben Zeile kann eine
-- Betragsanpassung stehen).
--
-- `HAS_STATES` soll bedeuten „die Karte TRAEGT vergangene Monate". Eine leere
-- Zeile traegt nichts. Sie sperrte trotzdem — und zwar dauerhaft, weil es
-- keinen Weg gibt, sie wieder loszuwerden.
--
-- Das ist dieselbe Verfeinerung wie v2-20 (KU-2), eine Ebene tiefer: Damals
-- wurde von „irgendein Zustand" auf „Zustand aus einem VERGANGENEN Monat"
-- eingegrenzt. Jetzt auf „Zustand, der tatsaechlich etwas AUSSAGT".
--
-- ⚠️ `src/app/page.tsx` bildet dieses Tor nach — beide Seiten muessen dieselbe
--    Regel fuehren, sonst graut das Menue aus, was die Datenbank erlaubt
--    (LL-26; in v2-20 real fast passiert). Waechter: tests/e2e/loesch-tor.spec.ts
--
-- ── 2 · WARUM DIE FREQUENZ AENDERBAR WERDEN MUSS ────────────────────────────
--
-- Die Karte steht auf MONTHLY, obwohl der Nutzer sie quartalsweise anlegen
-- wollte — und es gibt KEINEN Weg, das zu korrigieren. Weder Kontextmenue noch
-- Overlay kennen die Frequenz nach der Anlage. Deshalb wollte er ueberhaupt
-- loeschen: nicht weil die Karte falsch ist, sondern weil sie unkorrigierbar
-- war.
--
-- `set_card_frequency` schliesst diese Luecke. Sie misst ihre eigene Wirkung
-- wie `delete_card` seit v2-25 — vorher/nachher in DERSELBEN Transaktion, mit
-- zwei Aufrufen der echten Rechenfunktion. Eine Frequenz-Aenderung bewegt die
-- Sparrate erheblich: monatlich -> jaehrlich nimmt elf Monate heraus.
--
-- ⚠️ CONSTRAINT `once_is_single_month`: Bei ONCE muss
--    `last_active_month = first_active_month` sein. Der Wechsel ZU once setzt
--    das Ende deshalb mit, der Wechsel DAVON WEG raeumt es ab — sonst bliebe
--    eine Karte zurueck, die im Monat ihrer Entstehung endet.
--
-- DIESE MIGRATION BEWEGT KEINE ZAHL. `card_delete_gate` ist STABLE und
-- entscheidet nur ueber Erlaubnis; `set_card_frequency` aendert nur, was ein
-- KUENFTIGER Klick schreibt. Belegt ueber die Pruefsummen der vier
-- Rechenfunktionen: identisch vor und nach der Migration.
--
-- Briefing: sprints/sprint_v2-26_briefing.md
-- ============================================================================


-- ── 1 · Das Tor zaehlt nur noch Zustaende, die etwas aussagen ───────────────

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

  -- v2-20 (KU-2): nur Zustaende aus VERGANGENEN Monaten.
  -- v2-26: und nur solche, die tatsaechlich etwas AUSSAGEN.
  --
  -- Eine Zeile mit `manually_paid = false` und `adjusted_amount IS NULL` ist
  -- der Rueckstand eines zurueckgenommenen Tap. Sie traegt keine Historie —
  -- sie sperrte die Karte aber dauerhaft, ohne dass es einen Weg gab, sie
  -- loszuwerden. Genau das ist dem Nutzer mit `Privathaftpflicht` passiert.
  IF EXISTS (
    SELECT 1 FROM card_monthly_states
     WHERE card_id = p_card_id
       AND month < date_trunc('month', now())::date
       AND (manually_paid OR adjusted_amount IS NOT NULL)
  ) THEN
    v_reasons := array_append(v_reasons, 'HAS_STATES');
  END IF;

  -- v2-25 (KJ-1): `HAS_PAST_PLAN` ist entfernt. Eine Karte, die in einem
  -- vergangenen Monat eingeplant war, ist loeschbar; die Wirkung auf die
  -- Sparraten jener Monate zeigt `delete_card` im Toast.

  RETURN jsonb_build_object(
    'deletable', cardinality(v_reasons) = 0,
    'reasons',   to_jsonb(v_reasons)
  );
END;
$function$;


-- ── 2 · Die Wiederholung laesst sich aendern ────────────────────────────────

create or replace function public.set_card_frequency(
  p_card_id   uuid,
  p_frequency card_frequency,
  p_year      integer default null
)
returns jsonb
language plpgsql
set search_path to 'public'
as $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_card    cards%ROWTYPE;

  v_year    integer := coalesce(p_year, extract(year from now())::integer);
  v_before  numeric[] := array_fill(0::numeric, ARRAY[12]);
  v_month   date;
  v_i       integer;
  v_diff    numeric;
  v_total   numeric := 0;
  v_months  integer := 0;
  v_single  date := NULL;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized' USING ERRCODE = '28000';
  END IF;

  IF p_card_id IS NULL OR p_frequency IS NULL THEN
    RAISE EXCEPTION 'p_card_id und p_frequency duerfen nicht NULL sein'
      USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_card
    FROM cards
   WHERE id = p_card_id AND user_id = v_user_id AND deleted_at IS NULL
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'card not found, not owned or im papierkorb: %', p_card_id
      USING ERRCODE = '42704';
  END IF;

  -- Keine Aenderung, keine Messung — und vor allem kein Toast, der eine
  -- Bewegung von 0,00 EUR ankuendigt (LL-20).
  IF v_card.frequency = p_frequency THEN
    RETURN jsonb_build_object(
      'card_id',   p_card_id,
      'frequency', p_frequency,
      'unchanged', true,
      'sparrate_effect', jsonb_build_object('months', 0, 'total', 0, 'single_month', NULL)
    );
  END IF;

  -- ── VORHER ────────────────────────────────────────────────────────────────
  FOR v_i IN 1..12 LOOP
    v_before[v_i] := coalesce(
      calculate_sparrate_for_month(v_user_id, make_date(v_year, v_i, 1)), 0);
  END LOOP;

  -- CONSTRAINT `once_is_single_month`: ONCE verlangt last = first. Beim Wechsel
  -- davon WEG muss das Ende fallen, sonst endet die Karte im Monat ihrer
  -- Entstehung und die neue Frequenz waere wirkungslos.
  UPDATE cards
     SET frequency = p_frequency,
         last_active_month = CASE
           WHEN p_frequency = 'ONCE' THEN first_active_month
           WHEN v_card.frequency = 'ONCE' THEN NULL
           ELSE last_active_month
         END
   WHERE id = p_card_id;

  -- ── NACHHER ───────────────────────────────────────────────────────────────
  -- Dieselbe Mechanik wie `delete_card` seit v2-25: Die Sparrate-Funktion ist
  -- STABLE, sieht aber die Aenderung derselben Transaktion (Command-ID-Regel,
  -- auf der Uebungs-DB belegt). Sie wird AUFGERUFEN, nicht nachgebaut.
  FOR v_i IN 1..12 LOOP
    v_month := make_date(v_year, v_i, 1);
    v_diff  := coalesce(calculate_sparrate_for_month(v_user_id, v_month), 0)
               - v_before[v_i];

    IF v_diff <> 0 THEN
      v_months := v_months + 1;
      v_total  := v_total + v_diff;
      v_single := v_month;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'card_id',   p_card_id,
    'frequency', p_frequency,
    'unchanged', false,
    'sparrate_effect', jsonb_build_object(
      'months',       v_months,
      'total',        v_total,
      'single_month', CASE WHEN v_months = 1 THEN to_char(v_single, 'YYYY-MM') END
    )
  );
END;
$function$;
