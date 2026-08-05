-- ─────────────────────────────────────────────────────────────────────────────
-- Sprint v2-11 · BF-5 — Testreihe auf der ÜBUNGS-Datenbank (qyjuzzgqxowqiiwqcahd)
--
-- NIEMALS auf Produktion ausführen. Der Block legt Testdaten an.
--
-- Verfahren: LL-18 / Fähigkeit `db-eingriff` Schritt 4 — alles läuft in EINER
-- Transaktion, die am Ende per RAISE EXCEPTION zurückgerollt wird. Das Ergebnis
-- verlässt den Block in der Fehlermeldung. Der Fehler IST der Erfolgsfall.
--
-- Die Falle aus der Fähigkeit: mutieren und verifizieren nie im selben Aufruf.
-- Hier ist das unkritisch, weil ALLES zurückgerollt werden SOLL — es gibt keine
-- gewollte Mutation, die der Rollback mitnehmen könnte.
--
-- Testdaten liegen bewusst in je EIGENEN Monaten (April…Oktober), damit sich die
-- Fälle nicht gegenseitig beeinflussen und der Anker-Monat März unberührt bleibt.
--
-- Erwartungswerte sind VOR dem Lauf festgelegt.
--
-- ── ERGEBNIS (05.08.2026, Übungs-DB qyjuzzgqxowqiiwqcahd) ────────────────────
--
-- Die Reihe wurde ZWEIMAL gefahren: einmal gegen die unveränderte Funktion
-- (Baseline) und einmal nach der Migration. Nur so ist belegt, dass die
-- Migration genau das ändert, was sie ändern soll — und sonst nichts.
--
--   Test                              vorher      nachher     Urteil
--   ────────────────────────────────────────────────────────────────────────
--   T1  Anker März (vor Tests)        2200.00     2200.00     unverändert ✓
--   T2  FIX, nur Ausgaben             1000.00     1000.00     unverändert ✓
--   T3  FIX, gemischt                 1300.00      700.00     verrechnet   ✓
--   T4  FIX, Gutschrift überwiegt      130.00      -30.00     E2, keine Kappung ✓
--   T5  INCOME, nur Eingänge           200.00      200.00     unverändert ✓
--   T6  INCOME, gemischt               400.00      200.00     verrechnet   ✓
--   T7  BUDGET, „Aline-Fall"          1968.11      168.11     verrechnet   ✓
--   T8  BUDGET, Gutschrift überwiegt   150.00      150.00     Plan gewinnt §4.3.2 ✓
--   T9  ohne Fragmente                1000.00     1000.00     unverändert ✓
--   T10 Anker März (nach Tests)       2200.00     2200.00     unverändert ✓
--   T11 Sparrate April                2200.00     2200.00     unverändert ✓
--   T12 Sparrate Juni (E2-Wirkung)    3070.00     3230.00     +160.00      ✓
--   T13 Transfer-Link                 abgewiesen  abgewiesen  Trigger 23514 ✓
--
--   Nach beiden Läufen: 2 Karten, 0 Fragmente, 0 Links, Anker 2200.00 —
--   der Rollback hat vollständig gegriffen.
--
--   T2/T5/T9 sind die REGRESSIONSFÄLLE: Karten, deren Fragmente alle in
--   dieselbe Richtung zeigen, dürfen sich nicht bewegen. Sie tun es nicht.
--   Das ist der eigentliche Beweis, dass die Änderung eng ist.
-- ─────────────────────────────────────────────────────────────────────────────
DO $probe$
DECLARE
  v_user uuid := '00000000-0000-4000-8000-000000000001';
  v_fix  uuid;
  v_inc  uuid;
  v_bud  uuid;
  r      jsonb := '{}'::jsonb;
BEGIN
  PERFORM set_config('request.jwt.claims',
    '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}', true);

  SELECT id INTO v_fix FROM cards WHERE user_id = v_user AND name = 'Seed-Fixkosten';
  SELECT id INTO v_inc FROM cards WHERE user_id = v_user AND name = 'Seed-Einnahme';

  IF v_fix IS NULL OR v_inc IS NULL THEN
    RAISE EXCEPTION 'SEED FEHLT — Übungs-DB nicht im erwarteten Zustand';
  END IF;

  -- T1 · Anker VOR jeder Testdaten-Anlage (erwartet: 2200.00)
  r := r || jsonb_build_object('T1_anker_maerz_vor_tests',
             calculate_sparrate_for_month(v_user, '2026-03-01'));

  -- ── Hilfs-Insert (inline, da DO-Block keine lokalen Funktionen kennt) ──────
  -- T2 · FIXED_COST, nur Ausgaben: −400, −600  → Verbrauch 1000.00
  --      Regressionsfall: muss sich gegenüber dem alten ABS-Verhalten NICHT ändern.
  INSERT INTO fragments (user_id, amount, description, transaction_date, hash)
  VALUES (v_user, -400, 'T2a', '2026-04-05', 'h-t2a'), (v_user, -600, 'T2b', '2026-04-06', 'h-t2b');
  INSERT INTO card_fragment_links (user_id, card_id, fragment_id, month, origin)
  SELECT v_user, v_fix, f.id, '2026-04-01', 'MANUAL_DROP'
  FROM fragments f WHERE f.hash IN ('h-t2a','h-t2b');
  r := r || jsonb_build_object('T2_fix_nur_ausgaben',
             calculate_card_amount_for_month(v_fix, '2026-04-01'));

  -- T3 · FIXED_COST, gemischt: −1000, +300  → Netto-Abfluss 700.00
  --      Alt (ABS): 1300.00. Das ist der Kern des Fehlers.
  INSERT INTO fragments (user_id, amount, description, transaction_date, hash)
  VALUES (v_user, -1000, 'T3a', '2026-05-05', 'h-t3a'), (v_user, 300, 'T3b', '2026-05-06', 'h-t3b');
  INSERT INTO card_fragment_links (user_id, card_id, fragment_id, month, origin)
  SELECT v_user, v_fix, f.id, '2026-05-01', 'MANUAL_DROP'
  FROM fragments f WHERE f.hash IN ('h-t3a','h-t3b');
  r := r || jsonb_build_object('T3_fix_gemischt',
             calculate_card_amount_for_month(v_fix, '2026-05-01'));

  -- T4 · E2-KERNFALL · FIXED_COST, Gutschriften ÜBERSTEIGEN: −50, +80
  --      → −30.00. KEINE Kappung bei 0 (Beschluss E2, 05.08.2026).
  INSERT INTO fragments (user_id, amount, description, transaction_date, hash)
  VALUES (v_user, -50, 'T4a', '2026-06-05', 'h-t4a'), (v_user, 80, 'T4b', '2026-06-06', 'h-t4b');
  INSERT INTO card_fragment_links (user_id, card_id, fragment_id, month, origin)
  SELECT v_user, v_fix, f.id, '2026-06-01', 'MANUAL_DROP'
  FROM fragments f WHERE f.hash IN ('h-t4a','h-t4b');
  r := r || jsonb_build_object('T4_fix_gutschrift_ueberwiegt_E2',
             calculate_card_amount_for_month(v_fix, '2026-06-01'));

  -- T5 · INCOME, nur Eingänge: +150, +50  → Zufluss 200.00 (Regressionsfall)
  INSERT INTO fragments (user_id, amount, description, transaction_date, hash)
  VALUES (v_user, 150, 'T5a', '2026-07-05', 'h-t5a'), (v_user, 50, 'T5b', '2026-07-06', 'h-t5b');
  INSERT INTO card_fragment_links (user_id, card_id, fragment_id, month, origin)
  SELECT v_user, v_inc, f.id, '2026-07-01', 'MANUAL_DROP'
  FROM fragments f WHERE f.hash IN ('h-t5a','h-t5b');
  r := r || jsonb_build_object('T5_income_nur_eingaenge',
             calculate_card_amount_for_month(v_inc, '2026-07-01'));

  -- T6 · INCOME, gemischt: +300, −100  → Netto-Zufluss 200.00   (alt: 400.00)
  INSERT INTO fragments (user_id, amount, description, transaction_date, hash)
  VALUES (v_user, 300, 'T6a', '2026-08-05', 'h-t6a'), (v_user, -100, 'T6b', '2026-08-06', 'h-t6b');
  INSERT INTO card_fragment_links (user_id, card_id, fragment_id, month, origin)
  SELECT v_user, v_inc, f.id, '2026-08-01', 'MANUAL_DROP'
  FROM fragments f WHERE f.hash IN ('h-t6a','h-t6b');
  r := r || jsonb_build_object('T6_income_gemischt',
             calculate_card_amount_for_month(v_inc, '2026-08-01'));

  -- ── BUDGET-Karte für T7/T8 anlegen (Plan 150) ─────────────────────────────
  -- WICHTIG: erst ab September aktiv. Beim ersten Baseline-Lauf stand hier
  -- '2026-01-01' — dadurch war die Karte auch im März und April aktiv und zog
  -- den Anker von 2200.00 auf 2050.00. Das war ein Fehler im TESTAUFBAU, nicht
  -- in der Rechenfunktion; er ist nur aufgefallen, weil die Testreihe zuerst
  -- gegen die UNVERÄNDERTE Funktion gefahren wurde. Der Anker muss über den
  -- ganzen Block unberührt bleiben, sonst prüft T10 nichts.
  v_bud := create_card_direct('T-Budget', 'BUDGET', 'ICH', 'MONTHLY', '2026-09-01', NULL, 150);

  -- T7 · BUDGET, „Aline-Fall": gemischt, Netto −168.11 → Verbrauch 168.11
  --      > Plan 150 ⇒ überschritten, Karte zeigt 168.11.   (alt: 1068.11)
  INSERT INTO fragments (user_id, amount, description, transaction_date, hash)
  VALUES (v_user, -1068.11, 'T7a', '2026-09-05', 'h-t7a'), (v_user, 900.00, 'T7b', '2026-09-06', 'h-t7b');
  INSERT INTO card_fragment_links (user_id, card_id, fragment_id, month, origin)
  SELECT v_user, v_bud, f.id, '2026-09-01', 'MANUAL_DROP'
  FROM fragments f WHERE f.hash IN ('h-t7a','h-t7b');
  r := r || jsonb_build_object('T7_budget_ueberschritten',
             calculate_card_amount_for_month(v_bud, '2026-09-01'));

  -- T8 · BUDGET, Gutschriften überwiegen: −50, +80 → Netto-Verbrauch −30.
  --      §4.3.2 (LL-12): der Plan gilt, solange die Fragmente ihn nicht
  --      übersteigen ⇒ Karte zeigt 150.00, NICHT −30. Der negative Wert
  --      erreicht die Sparrate bei BUDGET also gar nicht. Bestehende Semantik,
  --      hier bewusst NICHT geändert — der Test hält sie fest.
  INSERT INTO fragments (user_id, amount, description, transaction_date, hash)
  VALUES (v_user, -50, 'T8a', '2026-10-05', 'h-t8a'), (v_user, 80, 'T8b', '2026-10-06', 'h-t8b');
  INSERT INTO card_fragment_links (user_id, card_id, fragment_id, month, origin)
  SELECT v_user, v_bud, f.id, '2026-10-01', 'MANUAL_DROP'
  FROM fragments f WHERE f.hash IN ('h-t8a','h-t8b');
  r := r || jsonb_build_object('T8_budget_gutschrift_ueberwiegt',
             calculate_card_amount_for_month(v_bud, '2026-10-01'));

  -- T9 · Karte ohne Fragmente → Plan unverändert (Dezember) → 1000.00
  r := r || jsonb_build_object('T9_ohne_fragmente',
             calculate_card_amount_for_month(v_fix, '2026-12-01'));

  -- T10 · Anker März INNERHALB der Transaktion — Testdaten liegen in anderen
  --       Monaten, März muss unberührt sein → 2200.00
  r := r || jsonb_build_object('T10_anker_maerz_nach_tests',
             calculate_sparrate_for_month(v_user, '2026-03-01'));

  -- T11 · Sparrate April: 3000 netto + 200 Einnahme − 1000 Fixkosten = 2200.00
  --       (T2 setzt den Fixkosten-Verbrauch auf exakt den Plan von 1000)
  r := r || jsonb_build_object('T11_sparrate_april',
             calculate_sparrate_for_month(v_user, '2026-04-01'));

  -- T12 · Sparrate Juni — der E2-Fall wirkt sich aus:
  --       3000 + 200 − (−30) = 3230.00. Beleg, dass ein negativer Verbrauch
  --       die Sparrate tatsächlich VERBESSERT statt verschluckt zu werden.
  r := r || jsonb_build_object('T12_sparrate_juni_E2',
             calculate_sparrate_for_month(v_user, '2026-06-01'));

  RAISE EXCEPTION 'RESULT=%', r::text;   -- rollt ALLES zurück
END
$probe$;

-- ─────────────────────────────────────────────────────────────────────────────
-- T13 · Transfer-Fragmente (separater Aufruf, mit Absicht)
--
-- Der Filter `f.transfer_type IS NULL` in der Funktion ist Defense-in-Depth. Der
-- eigentliche Schutz ist der Trigger `trg_oqb_no_transfer_links`, der eine solche
-- Verlinkung bereits beim INSERT verweigert. Genau deshalb steht dieser Fall NICHT
-- im Block oben: Der Trigger hätte dort die ganze Transaktion abgebrochen und alle
-- übrigen Ergebnisse mitgerissen, bevor das RAISE sie hätte ausgeben können.
--
-- Erwartung: Der INSERT scheitert. Der Fehler IST das Ergebnis.
-- ─────────────────────────────────────────────────────────────────────────────
DO $t13$
DECLARE
  v_user uuid := '00000000-0000-4000-8000-000000000001';
  v_fix  uuid;
  v_frag uuid;
BEGIN
  PERFORM set_config('request.jwt.claims',
    '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}', true);

  SELECT id INTO v_fix FROM cards WHERE user_id = v_user AND name = 'Seed-Fixkosten';

  INSERT INTO fragments (user_id, amount, description, transaction_date, hash, transfer_type)
  VALUES (v_user, -777, 'T13-transfer', '2026-11-05', 'h-t13', 'INTERNAL_TRANSFER')
  RETURNING id INTO v_frag;

  BEGIN
    INSERT INTO card_fragment_links (user_id, card_id, fragment_id, month, origin)
    VALUES (v_user, v_fix, v_frag, '2026-11-01', 'MANUAL_DROP');
    RAISE EXCEPTION 'RESULT=T13 FEHLGESCHLAGEN — Transfer-Link wurde AKZEPTIERT, Trigger greift nicht';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%RESULT=T13 FEHLGESCHLAGEN%' THEN RAISE; END IF;
    RAISE EXCEPTION 'RESULT=T13 ok — Trigger hat abgewiesen: % (%)', SQLERRM, SQLSTATE;
  END;
END
$t13$;

