-- ============================================================================
-- Sprint v2-27 · ZO-3 — Rückwirkend verlinken, was sicher ist (2025)
-- ============================================================================
--
-- ANLASS
--   `ZO-3` stand seit v2-21 offen, mit der ausdrücklichen Vorgabe: erst sehen,
--   dann entscheiden. Für 2026 hat sich die Frage inzwischen erledigt — dort ist
--   alles von Hand zugeordnet. Für 2025 war sie bis zu diesem Sprint gar nicht
--   stellbar: Es gab keine aktive Karte, also nichts vorzuschlagen.
--
--   Erst DA-1 (Migration 20260819_v2_27_da1_karten_2025.sql) schafft die Ziele.
--   Deshalb steht DA-1 in der Roadmap vor ZO-3.
--
-- DIE MESSUNG, DIE DIESEN EINGRIFF TRÄGT
--   Vollständig in `sprints/sprint_v2-27_zuordnung.md`. Kurz:
--
--   Kreuzvalidierung gegen die 411 von Hand verlinkten Zahlungen aus 2026 —
--   für 2025 selbst gibt es keine Wahrheit, dort ist nichts zugeordnet:
--
--     ab 0,60   230 Vorschläge   181 richtig / 49 falsch   78,7 %
--     ab 0,95    48 Vorschläge    48 richtig /  0 falsch    100 %
--
--   Der Leave-One-Out-Ausschluss (§7 Regel 25 / LL-27) ist eingebaut, nicht
--   nachgerüstet: `history_match` filtert selbst mit `f.id <> p_fragment_id`
--   und zählt ausschließlich `origin = 'MANUAL_DROP'`.
--
--   Die 41 Kandidaten für 2025 sind zusätzlich einzeln geprüft — vier Karten
--   mit unverwechselbaren Gläubigernamen, 41 von 41 richtig:
--     Berufsunfähigkeit – Alte Leipziger   12   −1.146,11 €
--     Private Altersvorsorge – Nürnberger  12   −1.373,20 €
--     Spotify                              11     −120,89 €
--     Audible                               6      −59,70 €
--
-- ⚠️ DIE ZAHL, DIE MAN NICHT VERWECHSELN DARF
--   Die 41 Zahlungen summieren sich auf −2.699,90 €.
--   Die Sparrate bewegt sich um +1,84 € auf das ganze Jahr.
--
--   Das ist kein Widerspruch, sondern „Realität gewinnt": Bei Fixkosten wirkt
--   nur die DIFFERENZ zwischen Plan und tatsächlicher Zahlung — und der Plan ist
--   seit DA-1 der Jahresdurchschnitt genau dieser Zahlungen. Übrig bleibt die
--   Streuung innerhalb des Jahres.
--
--   Wer beide Zahlen verwechselt, hält einen harmlosen Eingriff für einen
--   gefährlichen. Dieselbe Warnung steht in der Roadmap bei ZO-3 für 2026
--   (dort: −1.296,87 € Zahlungen gegen +4,79 € Sparrate).
--
-- ZWEI ENTSCHEIDUNGEN, DIE IN DER ROADMAP OFFEN WAREN
--   ① `origin = 'AUTO_ABSORBED'` — NICHT `MANUAL_DROP`. Sonst lernte
--      `history_match` aus den eigenen Vermutungen und verstärkte einen Irrtum
--      bei jedem weiteren Lauf.
--   ② Link-Monat = Buchungsmonat (§6 Stolperfalle 6). Die gemessene Wirkung
--      von +1,84 € gilt für genau diese Wahl; eine andere ergäbe eine andere Zahl.
--
-- WAS AUSDRÜCKLICH NICHT GESCHIEHT
--   Kein automatisches Verlinken unterhalb von 0,95. Bei 0,60 wäre jede fünfte
--   Zuordnung falsch (49 von 230), und ein falscher Link geht rückwirkend in die
--   Sparrate ein. Die 253 Vorschläge dort gehören angezeigt, nicht ausgeführt.
--
-- ============================================================================

DO $$
DECLARE
  v_vorher int;
  v_nachher int;
  v_neu int;
BEGIN
  SELECT count(*) INTO v_vorher FROM card_fragment_links;

  WITH offen AS (
    -- Nur was heute noch offen ist: macht die Migration wiederholbar.
    SELECT f.id AS frag_id, f.user_id, f.transaction_date
    FROM fragments f
    LEFT JOIN (SELECT DISTINCT fragment_id FROM card_fragment_links) l
           ON l.fragment_id = f.id
    WHERE f.transaction_date >= '2025-01-01'
      AND f.transaction_date <  '2026-01-01'
      AND f.transfer_type IS NULL      -- §6 Stolperfalle 7: nie verlinkbar
      AND l.fragment_id IS NULL
  ),
  kandidaten AS (
    SELECT o.frag_id, o.user_id, o.transaction_date, c.id AS kand,
           calculate_match_confidence(o.frag_id, c.id) AS konf
    FROM offen o
    CROSS JOIN cards c
    WHERE c.deleted_at IS NULL
      AND is_card_active_in_month(c.id, date_trunc('month', o.transaction_date)::date)
  ),
  bester AS (
    -- Je Zahlung genau ein Vorschlag: der mit der höchsten Konfidenz.
    SELECT DISTINCT ON (frag_id)
           frag_id, user_id, transaction_date, kand AS vorschlag, konf
    FROM kandidaten
    WHERE konf > 0
    ORDER BY frag_id, konf DESC, kand
  )
  INSERT INTO card_fragment_links (user_id, card_id, fragment_id, month, origin)
  SELECT user_id, vorschlag, frag_id,
         date_trunc('month', transaction_date)::date,
         'AUTO_ABSORBED'::link_origin
  FROM bester
  WHERE konf >= 0.95;

  GET DIAGNOSTICS v_neu = ROW_COUNT;
  SELECT count(*) INTO v_nachher FROM card_fragment_links;

  IF v_nachher - v_vorher <> v_neu THEN
    RAISE EXCEPTION 'v2-27 ZO-3: Link-Zahl inkonsistent (% vorher, % nachher, % eingefügt).',
      v_vorher, v_nachher, v_neu;
  END IF;

  RAISE NOTICE 'v2-27 ZO-3: % Zahlungen aus 2025 rückwirkend verlinkt (% → % Links).',
    v_neu, v_vorher, v_nachher;
END $$;
