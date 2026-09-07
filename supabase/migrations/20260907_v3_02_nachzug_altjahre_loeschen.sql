-- ============================================================================
-- Nachzug zu v3-02 · Die Zahlungen aus 2023 und 2024 werden gelöscht
-- Entscheidung des Nutzers am 07.09.2026 („Lösche alle Datenbankeinträge aus
-- den Jahren 2023 und 2024"), Roadmap-Hausaufgabe V1.
--
-- WAS DA LAG (gemessen am 07.09.2026, vor dem Löschen):
--   fragments  2023: 384 Zeilen (42 Überträge)   2024: 183 Zeilen (49 Überträge)
--   zusammen 567 — davon 0 mit Karten-Link, 0 mit Netto-Link, 0 mit Vorschlag.
--   Keine andere Tabelle trägt Zeilen aus diesen Jahren (income_timeline,
--   card_planned_timeline, card_monthly_states, cards, beide Link-Tabellen:
--   je 0). Sie stammen aus dem Visa-Jahresexport vom 03.09.2026 (PF-8);
--   CLAUDE.md §9 führte die Altjahre als „noch nicht importiert" — ein Teil
--   war es doch.
--
-- WARUM DAS KEINE ZAHL BEWEGT:
--   Die App modelliert 2025 und 2026; in 2023/2024 ist keine Karte aktiv, und
--   nichts davon ist verknüpft. Trockenlauf (zurückgerollt): 567 gelöscht,
--   Sparrate September 2026 1.613,11 € und Januar 2025 −987,21 € vorher wie
--   nachher. Anker nachher: 24 Monate Ist und Plan, protokolliert in
--   sprints/doku_patch_2026-09-07_mobil-login-und-altjahre.md.
--
-- WAS DANACH ANDERS IST:
--   · Die Duplikat-Hashes dieser Zeilen sind weg — ein späterer Re-Import
--     derselben Zeilen wäre möglich, nicht mehr idempotent geblockt.
--   · Die Navigationsgrenze (früheste Karte 2025-01) war ohnehin die Grenze;
--     auf /mobil und am Schreibtisch waren diese Monate nicht erreichbar.
--
-- SICHERUNG: Der DELETE bricht ab, sobald auch nur eine der Zeilen verknüpft
-- ist — dann ist die Lage eine andere als gemessen, und niemand darf still
-- eine Zuordnung mitlöschen.
-- ============================================================================

DO $$
DECLARE
  v_links   integer;
  v_ilinks  integer;
  v_del     integer;
BEGIN
  SELECT count(*) INTO v_links
    FROM card_fragment_links l JOIN fragments f ON f.id = l.fragment_id
   WHERE f.transaction_date < '2025-01-01';
  SELECT count(*) INTO v_ilinks
    FROM income_fragment_links l JOIN fragments f ON f.id = l.fragment_id
   WHERE f.transaction_date < '2025-01-01';

  IF v_links > 0 OR v_ilinks > 0 THEN
    RAISE EXCEPTION 'Abbruch: % Karten-Links und % Netto-Links hängen an Zahlungen vor 2025 — erst prüfen, nicht löschen',
      v_links, v_ilinks USING ERRCODE = '23514';
  END IF;

  DELETE FROM public.fragments WHERE transaction_date < '2025-01-01';
  GET DIAGNOSTICS v_del = ROW_COUNT;

  IF v_del <> 567 THEN
    RAISE EXCEPTION 'Abbruch: % Zeilen statt der gemessenen 567 — Datenlage hat sich geändert', v_del
      USING ERRCODE = '23514';
  END IF;

  RAISE NOTICE 'Altjahre gelöscht: % Zahlungen vor 2025-01-01', v_del;
END $$;
