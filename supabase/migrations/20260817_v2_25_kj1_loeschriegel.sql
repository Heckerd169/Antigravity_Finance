-- ============================================================================
-- Sprint v2-25 · KJ-1 — Der Löschriegel fällt, und das Löschen sagt, was es tut
--
-- ANLASS (V2/befunde_2026-08-17_kuratierung-2026.md, Abschnitt 1):
--
--   Der Nutzer hat alle Monate 2026 kuratiert und konnte anschließend
--   PRAKTISCH NICHTS mehr löschen. Gemessen am 17.08.2026: von 82 Karten
--   waren NULL löschbar. `HAS_PAST_PLAN` greift, sobald `first_active_month`
--   vor dem laufenden Monat liegt — nach der Kuratierung von Januar bis Juli
--   trifft das auf alles zu, was er angelegt hat. Darunter neun Karten namens
--   „Fahrradteile", die je Zahlung einzeln entstanden sind.
--
-- WARUM DER RIEGEL TROTZDEM NICHT SINNLOS WAR:
--
--   `delete_card` ist ein Soft-Delete, und seit v2-20 (KU-1) filtern alle vier
--   Rechenfunktionen `deleted_at IS NULL`. Eine gelöschte Karte fällt damit aus
--   den Sparraten ALLER Monate, in denen sie aktiv war — auch der vergangenen.
--   Der Riegel schützte die Snapshot-Integrität (§2.1).
--
--   Bei einer IRRTÜMLICH angelegten Karte ist genau diese Änderung aber
--   richtig: Sie korrigiert die Vergangenheit, statt sie zu verfälschen. Der
--   Schutz wandert deshalb von einer Sperre zu einer ANZEIGE — die App sagt,
--   was passiert, statt es zu verhindern (Entscheidung 1 des Records vom
--   17.08.2026, Design-Doku v3.9.0 §7).
--
-- ⚠️ WAS SICH NICHT ÄNDERT — und das ist eine bewusste Nutzer-Entscheidung:
--
--   · `HAS_LINKS`  — eine verknüpfte Zahlung blockiert weiterhin. Sie ist mit
--                    79 von 82 Karten die GRÖSSERE Sperre; nach dieser
--                    Migration sind genau 3 Karten löschbar, nicht 78.
--                    Begründung: Wer eine Karte löscht, an der eine echte
--                    Zahlung hängt, muss entscheiden, wohin die Zahlung
--                    gehört. Bei den neun „Fahrradteilen" ist genau das die
--                    eigentliche Arbeit — sie sollen umziehen, nicht
--                    verschwinden. Weg dafür: „Verknüpfte Fragmente → Alle
--                    Verknüpfungen lösen", danach löschen.
--   · `HAS_STATES` — Zustände aus vergangenen Monaten blockieren weiterhin
--                    (v2-20). Betrifft 9 Karten, alle davon zusätzlich durch
--                    `HAS_LINKS` gesperrt.
--
-- ⚠️ DIE REGEL LEBT AN ZWEI ORTEN. `src/app/page.tsx` bildet `card_delete_gate`
--    nach, damit das Kontextmenü ohne 82 RPC-Aufrufe ausgrauen kann. Wer nur
--    hier ändert, hebt die Änderung stillschweigend auf: Das Menü zeigte
--    weiter einen ausgegrauten Punkt, den die Datenbank längst durchließe.
--    In v2-20 real passiert (LL-26 / §6 Stolperfalle 16). Wächter:
--    `tests/e2e/loesch-tor.spec.ts` — er prüft BEIDE Seiten auf dieselbe Regel.
--
-- DIESE MIGRATION BEWEGT KEINE ZAHL. `card_delete_gate` ist `STABLE` und
-- entscheidet nur über Erlaubnis; `delete_card` misst zusätzlich, ändert am
-- Rechenweg aber nichts. Belegt über die Prüfsummen der vier Rechenfunktionen:
-- identisch vor und nach der Migration.
--
-- Briefing: sprints/sprint_v2-25_briefing.md
-- ============================================================================


-- ── 1 · Das Tor: `HAS_PAST_PLAN` entfällt ───────────────────────────────────

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

  -- v2-20 (KU-2): NUR Zustände aus VERGANGENEN Monaten blockieren. Ein Zustand
  -- im laufenden Monat beschreibt den Monat, in dem der Nutzer gerade arbeitet
  -- — er ist Teil der Karte, nicht ihrer Vergangenheit.
  IF EXISTS (
    SELECT 1 FROM card_monthly_states
     WHERE card_id = p_card_id
       AND month < date_trunc('month', now())::date
  ) THEN
    v_reasons := array_append(v_reasons, 'HAS_STATES');
  END IF;

  -- v2-25 (KJ-1): `HAS_PAST_PLAN` ist HIER ENTFERNT. Eine Karte, die in einem
  -- vergangenen Monat eingeplant war, ist ab jetzt löschbar — die Wirkung auf
  -- die Sparrate dieser Monate zeigt `delete_card` unten im Toast an, statt
  -- das Löschen zu verhindern.
  --
  -- Wer diesen Block wieder einführen will, liest zuerst Abschnitt 1 des
  -- Befunds: Mit ihm waren NULL von 82 Karten löschbar.

  RETURN jsonb_build_object(
    'deletable', cardinality(v_reasons) = 0,
    'reasons',   to_jsonb(v_reasons)
  );
END;
$function$;


-- ── 2 · Das Löschen misst seine eigene Wirkung ──────────────────────────────
--
-- Die alte Ein-Parameter-Fassung wird EXPLIZIT entfernt. `create or replace`
-- mit geänderter Signatur legt sonst eine ÜBERLADUNG an: Beide Fassungen
-- existierten nebeneinander, PostgREST könnte weiter die alte treffen, und der
-- Unterschied fiele niemandem auf.
drop function if exists public.delete_card(uuid);

create or replace function public.delete_card(
  p_card_id uuid,
  p_year    integer default null
)
returns jsonb
language plpgsql
set search_path to 'public'
as $function$
DECLARE
  v_user_id  uuid := auth.uid();
  v_card     cards%ROWTYPE;
  v_gate     jsonb;
  v_trash_id uuid;

  -- v2-25 (KJ-1): Messung der Sparraten-Wirkung.
  v_year     integer := coalesce(p_year, extract(year from now())::integer);
  v_before   numeric[] := array_fill(0::numeric, ARRAY[12]);
  v_month    date;
  v_i        integer;
  v_diff     numeric;
  v_total    numeric := 0;
  v_months   integer := 0;
  v_single   date := NULL;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized' USING ERRCODE = '28000';
  END IF;

  SELECT * INTO v_card
    FROM cards
   WHERE id = p_card_id AND user_id = v_user_id AND deleted_at IS NULL
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'card not found, not owned or already im papierkorb: %', p_card_id
      USING ERRCODE = '42704';
  END IF;

  v_gate := card_delete_gate(p_card_id);
  IF NOT (v_gate->>'deletable')::boolean THEN
    RAISE EXCEPTION 'Lösch-Gate verletzt für Karte %: %', v_card.name, v_gate->>'reasons'
      USING ERRCODE = '23514';
  END IF;

  -- ── VORHER ────────────────────────────────────────────────────────────────
  -- Bewusst NACH dem Gate: Bei gesperrter Karte wird gar nicht erst gemessen.
  -- Und bewusst NACH dem `FOR UPDATE`: Die Zeile ist gesperrt, zwischen den
  -- beiden Messungen kann sich an DIESER Karte nichts mehr ändern.
  FOR v_i IN 1..12 LOOP
    v_before[v_i] := coalesce(
      calculate_sparrate_for_month(v_user_id, make_date(v_year, v_i, 1)), 0);
  END LOOP;

  UPDATE cards SET deleted_at = now() WHERE id = p_card_id;
  v_trash_id := schedule_deletion('CARD', p_card_id, to_jsonb(v_card));

  -- ── NACHHER ───────────────────────────────────────────────────────────────
  -- Die Sparrate-Funktion ist `STABLE`, wird hier aber NACH dem UPDATE in
  -- DERSELBEN Transaktion aufgerufen und sieht dessen Wirkung: Eine
  -- STABLE-Funktion nutzt den Snapshot des aufrufenden Statements, und
  -- Änderungen früherer Anweisungen derselben Transaktion sind darin sichtbar
  -- (Command-ID-Regel). Das ist auf der Übungs-Datenbank belegt, nicht
  -- angenommen (LL-22).
  --
  -- WARUM SO UND NICHT GERECHNET: Die Wirkung einer Löschung über N Monate ist
  -- eine Sparraten-Rechnung. Arbeitsregel 1 verbietet die im Frontend, und ein
  -- Nachbau hier wäre dasselbe eine Ebene tiefer — er müsste die
  -- Prioritätskette, den Split-Anteil (§6 Stolperfalle 11) und die
  -- Schlussrundung (LL-25) nachbilden, und keine Zahl sähe dabei falsch aus.
  -- Stattdessen wird die echte Funktion zweimal AUFGERUFEN.
  --
  -- KOSTEN: 24 Aufrufe, gemessen ~370 ms — in EINER Netzrunde und nur beim
  -- Löschen, nicht beim Rendern (LL-29).
  FOR v_i IN 1..12 LOOP
    v_month := make_date(v_year, v_i, 1);
    v_diff  := coalesce(calculate_sparrate_for_month(v_user_id, v_month), 0)
               - v_before[v_i];

    IF v_diff <> 0 THEN
      v_months := v_months + 1;
      v_total  := v_total + v_diff;
      v_single := v_month;   -- nur aussagekräftig, wenn v_months am Ende 1 ist
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'card_id',    p_card_id,
    'trash_id',   v_trash_id,
    'expires_at', (SELECT expires_at FROM deleted_entities WHERE id = v_trash_id),
    -- Nicht gerundet: Beide Summanden kommen bereits gerundet aus
    -- `calculate_sparrate_for_month`, ihre Differenz ist exakt. Eine
    -- zusätzliche Rundungsstelle wäre genau das, wovor LL-24 warnt.
    'sparrate_effect', jsonb_build_object(
      'months',       v_months,
      'total',        v_total,
      -- Genau ein betroffener Monat wird BENANNT — das ist nützlicher als
      -- „in 1 Monat" (Record, Entscheidung 1).
      'single_month', CASE WHEN v_months = 1 THEN to_char(v_single, 'YYYY-MM') END
    )
  );
END;
$function$;
