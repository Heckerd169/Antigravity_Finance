-- Init-2: deterministischer Seed für die Übungs-Datenbank (NUR Test-Projekt!).
-- Legt einen synthetischen Nutzer + Einkommen + 2 Karten über die produktiven
-- RPCs an und prüft den Anker. Keine Echtdaten. Idempotent NICHT nötig —
-- bei Bedarf Projekt-Reset statt Wiederholung.
--
-- ANKER: calculate_sparrate_for_month(test-user, '2026-03-01') = 2200.00
--        (3.000 Netto − 1.000 Fixkosten + 200 Einnahme)

-- 1) Synthetischer Auth-Nutzer (Trigger on_auth_user_created legt das Profil an)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-4000-8000-000000000001',
  'authenticated', 'authenticated', 'seed@test.local', '',
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb
);

-- 2) Seed unter der Identität des Test-Nutzers (RPCs prüfen auth.uid())
DO $seed$
DECLARE
  v_user uuid := '00000000-0000-4000-8000-000000000001';
  v_fix  uuid;
  v_inc  uuid;
  v_anker numeric;
BEGIN
  PERFORM set_config('request.jwt.claims',
    '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}', true);

  -- Einkommen ab Januar 2026 (nur ICH — Split-Faktor damit 1.0)
  INSERT INTO income_timeline (user_id, person, effective_month, gross_annual, net_monthly)
  VALUES (v_user, 'ICH', '2026-01-01', 48000, 3000)
  ON CONFLICT (user_id, person, effective_month) DO UPDATE SET net_monthly = EXCLUDED.net_monthly;

  -- Karten über die produktive RPC (testet zugleich den atomaren Anlage-Pfad)
  v_fix := create_card_direct('Seed-Fixkosten', 'FIXED_COST', 'ICH', 'MONTHLY', '2026-01-01', NULL, 1000);
  v_inc := create_card_direct('Seed-Einnahme',  'INCOME',     'ICH', 'MONTHLY', '2026-01-01', NULL, 200);

  -- Anker prüfen — Abbruch mit Fehlermeldung bei Abweichung
  v_anker := calculate_sparrate_for_month(v_user, '2026-03-01');
  IF v_anker IS DISTINCT FROM 2200.00 THEN
    RAISE EXCEPTION 'INIT-2-ANKER VERLETZT: erwartet 2200.00, erhalten %', v_anker;
  END IF;

  RAISE NOTICE 'Init-2 ok — Anker 2026-03 = % (Karten % / %)', v_anker, v_fix, v_inc;
END
$seed$;
