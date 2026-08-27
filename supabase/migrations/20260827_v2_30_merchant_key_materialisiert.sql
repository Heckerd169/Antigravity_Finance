-- ═══════════════════════════════════════════════════════════════════════════
-- v2-30 · Der Händler-Schlüssel wird eine Spalte statt eines Ausdrucks
-- ═══════════════════════════════════════════════════════════════════════════
--
-- ANLASS
--   Der Nutzer konnte am 27.08.2026 seine Monatsabzüge nicht mehr importieren.
--   Der Import reißt den `statement_timeout` der Rolle `authenticated` (8 s):
--   23.938 ms für 17 neue Zahlungen, also 1.408 ms je Zahlung, dreifach über
--   dem Limit. Diagnose: V2/befunde_2026-08-27_import-zeitlimit.md (PF-6).
--
-- DER FUND — ein Ausdrucks-Index ist gegen Inlining nicht robust
--   `idx_fragments_merchant_key` steht auf `af_merchant_key(description)`.
--   `af_merchant_key` ist eine SQL-Funktion, also **inlined der Planer sie**.
--   Im Plan steht danach nicht mehr der Funktionsaufruf, sondern sein Rumpf:
--
--     Filter: btrim(regexp_replace(replace(translate(lower(COALESCE(
--               description,'')),'äöüÄÖÜ','aouaou'),'ß','ss'),'[^a-z]+',' ','g'))
--               = 'paypal felix augustin'
--     Rows Removed by Filter: 1628        ← Seq Scan über ALLE Fragmente
--
--   Der Index trägt den Aufruf, die Abfrage den Rumpf — sie treffen sich nie.
--   Und weil `history_match` **je Karte** aufgerufen wird, passiert das je
--   Zahlung **28-mal**.
--
--   ⚠️ Der Index ist nicht kaputt und war nie überflüssig: `pg_stat_user_indexes`
--   weist 88.107 Scans aus, er greift also anderswo. Genau das macht den Fall
--   teuer — die Statistik sagt „wird benutzt", der Plan sagt „hier nicht".
--
-- ZWEI NAHELIEGENDE FIXES SIND GEMESSEN UND VERWORFEN
--   ① Policies auf `(select auth.uid())` umstellen (PF-3, Supabase-Empfehlung):
--      274 ms → 289 ms. **Kein Effekt.**
--   ② `af_merchant_key` auf `LANGUAGE plpgsql` umstellen, damit sie nicht mehr
--      inlinebar ist: 285 ms → 367 ms. **Schlechter** — der Planer wählt dann
--      einen Seq Scan über `card_fragment_links` und zahlt den Funktionsaufruf
--      je Zeile.
--   Beides steht hier, damit die nächste Sitzung es nicht erneut probiert.
--
-- DIE LÖSUNG
--   Der Schlüssel wird eine **materialisierte Spalte** mit einem gewöhnlichen
--   B-Tree-Index. Ein normaler Spalten-Index ist gegen Inlining immun, weil
--   nichts mehr zu expandieren ist.
--
--   Gemessen: `history_match` über 28 Karten **326 ms → 12 ms, Faktor 27**.
--
--   **Kein Nachbau (§6 Stolperfalle 16):** Die Spalte ruft `af_merchant_key`
--   auf, statt deren Logik zu wiederholen. Es gibt weiterhin genau EINE
--   Definition des Schlüssels. Ändert sie sich, rechnet Postgres die Spalte
--   selbst neu.
--
-- WAS DIESE MIGRATION NICHT TUT
--   Der alte Ausdrucks-Index `idx_fragments_merchant_key` **bleibt**. Er hat
--   88.107 Scans, und welcher Aufrufer sie verursacht, ist nicht ermittelt.
--   Ihn hier mitzunehmen wäre eine zweite Verschiebung im selben Sprint —
--   dieselbe Begründung, aus der v2-29 `ZO-8` liegen ließ. Kosten des
--   Behaltens: ein Anteil an den 8,9 ms, die ein INSERT mit allen sechs
--   Indizes braucht.
--
-- ANKER
--   Diese Migration darf **keine** Zahl bewegen. Geprüft vor dem Einspielen,
--   im zurückgerollten Trockenlauf:
--     · Spalte gegen Ausdruck, alle 1.628 Zeilen  → 0 Abweichungen
--     · history_match alt gegen neu, 231 Paare    → 0 Unterschiede
--   Nach dem Einspielen zusätzlich: Sparrate 24 Monate, Anker 1, Anker 2.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1 · Die Spalte ──────────────────────────────────────────────────────────
--
-- GENERATED ALWAYS … STORED verlangt eine IMMUTABLE-Funktion; af_merchant_key
-- ist es (provolatile = 'i'). Der Wert wird beim Schreiben berechnet, nicht
-- beim Lesen — genau deshalb ist er indizierbar.

ALTER TABLE public.fragments
  ADD COLUMN IF NOT EXISTS merchant_key text
  GENERATED ALWAYS AS (public.af_merchant_key(description)) STORED;

COMMENT ON COLUMN public.fragments.merchant_key IS
  'v2-30: af_merchant_key(description), materialisiert. Existiert NICHT als '
  'zweite Definition des Schlüssels — die Spalte ruft die Funktion auf. Grund '
  'für die Materialisierung ist ausschließlich der Index: ein Ausdrucks-Index '
  'über eine SQL-Funktion wird durch Inlining unbrauchbar, ein Spalten-Index '
  'nicht.';

-- ── 2 · Der Index ───────────────────────────────────────────────────────────
--
-- user_id steht vorne, weil jede Abfrage zuerst danach filtert (§6 Stolperfalle 4).

CREATE INDEX IF NOT EXISTS idx_fragments_merchant_key_stored
  ON public.fragments (user_id, merchant_key);

COMMENT ON INDEX public.idx_fragments_merchant_key_stored IS
  'v2-30: trägt Stufe 1 von history_match. Ersetzt funktional den '
  'Ausdrucks-Index idx_fragments_merchant_key, der durch Inlining nie griff '
  '(Seq Scan über 1.628 Zeilen, 28-mal je Zahlung). Gemessen 326 ms -> 12 ms.';

-- ── 3 · history_match liest die Spalte ──────────────────────────────────────
--
-- ⚠️ Der Rumpf ist bis auf ZWEI Zeilen wortgleich mit v2-29:
--     · das SELECT holt zusätzlich f.merchant_key statt v_key zu berechnen
--     · Stufe 1 vergleicht f.merchant_key statt af_merchant_key(f.description)
--   Alles andere — Kommentare eingeschlossen — bleibt unverändert, weil
--   `pg_get_functiondef` Kommentare einschließt und jedes „Aufräumen" die
--   Prüfsumme bewegt, ohne das Verhalten zu ändern (Lehre aus v2-25/v2-29).
--
-- Die drei Filter sind NICHT VERHANDELBAR und stehen unverändert:
--   l.origin = 'MANUAL_DROP'   nur aus dem lernen, was der Nutzer selbst zog
--   f.transfer_type IS NULL    ein Übertrag wird nie verlinkt
--   f.id <> p_fragment_id      Leave-one-out (§7 Regel 25)

CREATE OR REPLACE FUNCTION public.history_match(p_fragment_id uuid, p_card_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  v_desc    text;
  v_user_id uuid;
  v_key     text;
  v_karten  integer;
  v_treffer integer;
BEGIN
  -- v2-30: merchant_key kommt aus der Spalte statt aus dem Ausdruck.
  SELECT f.description, f.user_id, f.merchant_key
    INTO v_desc, v_user_id, v_key
    FROM fragments f WHERE f.id = p_fragment_id;
  IF NOT FOUND THEN RETURN 0; END IF;

  -- Stufe 1 — derselbe Händler, und zwar EINDEUTIG.
  -- Beide Zahlen kommen aus EINER Abfrage: wie viele verschiedene Karten der
  -- Händler trägt, und ob die gefragte darunter ist.
  IF v_key <> '' THEN
    SELECT count(DISTINCT l.card_id),
           count(*) FILTER (WHERE l.card_id = p_card_id)
      INTO v_karten, v_treffer
      FROM fragments f
      JOIN card_fragment_links l ON l.fragment_id = f.id
     WHERE f.user_id       = v_user_id
       AND f.merchant_key  = v_key
       AND f.id           <> p_fragment_id
       AND f.transfer_type IS NULL
       AND l.origin        = 'MANUAL_DROP'::link_origin;

    IF v_karten = 1 THEN
      RETURN CASE WHEN v_treffer > 0 THEN 1.00 ELSE 0.00 END;
    END IF;

    -- Mehr als eine Karte: SCHWEIGEN und auf Stufe 2 durchfallen. Gemessen
    -- liegt die Trefferquote bei mehrdeutigen Händlern bei 52,7 % — ein
    -- Münzwurf. Häufigster Grund: Bei Überweisungen steht vorne der Absender,
    -- nicht der Händler; "Dominik Hecker" liegt auf zwölf Karten.
  END IF;

  -- Stufe 2 — wortgleich, unverändert seit v2-21 P2.
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
  'v2-30: Wurde dieser HÄNDLER schon einmal VON HAND dieser Karte zugeordnet? '
  'Stufe 1 vergleicht fragments.merchant_key (materialisiert, indiziert) und '
  'antwortet nur, wenn der Händler auf genau EINER Karte liegt; sonst fällt sie '
  'auf den wortgleichen Vergleich aus v2-21 zurück. Verhalten identisch zu '
  'v2-29 — belegt über 231 Paare und die Spalten-Äquivalenz aller 1.628 Zeilen. '
  'Geändert wurde ausschließlich das Tempo: 326 ms -> 12 ms je Zahlung über 28 '
  'Karten, weil der Ausdrucks-Index durch Inlining nie griff. '
  'Lernt weiterhin nicht aus AUTO_ABSORBED (Selbstverstärkung), nicht aus '
  'Überträgen und nicht aus dem geprüften Fragment selbst.';
