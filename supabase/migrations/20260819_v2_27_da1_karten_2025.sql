-- ============================================================================
-- Sprint v2-27 · DA-1 — Die wiederkehrenden Karten reichen nach 2025 zurück
-- ============================================================================
--
-- ANLASS
--   Bis heute rechnet die App für das gesamte Jahr 2025 mit NULL Kosten. Die
--   Ist-Sparrate steht dort in allen zwölf Monaten auf exakt 4.037,11 € — dem
--   vollen Netto. Die Vorjahres-Goldlinie in der Jahres-Welle (48.445,32 €) ist
--   damit technisch richtig und inhaltlich wertlos, und sie ist die einzige
--   Vergleichsgröße, die es überhaupt gibt.
--
--   Keine der 85 Karten reicht nach 2025 zurück. Deshalb steht dort auch die
--   Zuordnung bei null: 751 offene Zahlungen, kein einziges Ablageziel.
--
-- WAS DIESE MIGRATION TUT — UND WAS AUSDRÜCKLICH NICHT
--   Sie ändert ausschließlich NUTZDATEN: `cards.first_active_month`, Zeilen in
--   `card_planned_timeline` und sechs Lücken-Markierungen für Audible.
--
--   Sie fasst KEINE Rechenfunktion an. Die neun Prüfsummen aus
--   `sprints/sprint_v2-27_anker.md` müssen vorher und nachher byte-identisch
--   sein — das ist ein Prüfanker dieses Sprints, kein Nebeneffekt.
--
-- DIE ZAHL, DIE ALLES ENTSCHEIDET
--   2025 Jahressumme Ist:  48.445,32 €  →  22.461,00 €
--   2026, alle zwölf Monate, Ist UND Plan:  unverändert.
--
--   Gemessen im RAISE-Rollback-Trockenlauf am 19.08.2026 (LL-18), nicht
--   geschätzt. Begründung, warum ohne Übungs-Datenbank geprobt wurde:
--   `sprints/sprint_v2-27_briefing.md` §7.
--
-- ============================================================================
-- DREI FALLEN, DIE IN DIESER DATEI ABGESICHERT SIND
-- ============================================================================
--
-- ① DER SPLIT-ANTEIL WAR 2025 EIN ANDERER — UND WECHSELTE MITTEN IM JAHR.
--    Jan–Mär 2025 = 0,587863 · Apr–Dez 2025 = 0,565636 · 2026 = 0,572090.
--
--    Bei einer GEMEINSAM-Karte ist der Plan der HAUSHALTSBETRAG, die Zahlung
--    dagegen bereits der eigene Anteil (§6 Stolperfalle 11). Wer den Zahlbetrag
--    als Plan einträgt, lässt den Anteil ein ZWEITES Mal abziehen: Die Miete
--    landete bei rund 604 € statt 1.068 €, und KEINE Zahl sähe dabei falsch aus.
--
--    Deshalb steht unten die JAHRESSUMME DES ANTEILS, und die Migration teilt
--    selbst durch `get_split_factor(...)`. Der Plan wird nicht abgeschrieben,
--    sondern gerechnet.
--
-- ② DER FAKTOR GEHÖRT AN DEN STARTMONAT DER ZEILE, NICHT PAUSCHAL AN DEN JANUAR.
--    Genau daran ist der erste Trockenlauf dieses Sprints gescheitert: Die
--    Privathaftpflicht beginnt im April, bekam aber den Januar-Faktor — 50,49 €
--    statt 52,47 €. Falle ① in Miniatur, im eigenen Prüfcode.
--
-- ③ DER RHYTHMUS ZÄHLT AB `first_active_month`.
--    `is_card_active_in_month` rechnet den Abstand zum ersten aktiven Monat und
--    prüft `% 12 = 0` (ANNUAL) bzw. `% 3 = 0` (QUARTERLY). Zurückdatieren
--    verschiebt damit, in welchen Monaten die Karte 2026 AKTIV IST.
--
--    Eine jährliche Karte, die um neun Monate zurückwandert, ist 2026 in einem
--    anderen Monat fällig — und wieder sähe keine Zahl falsch aus, nur zwei
--    Monatssparraten wären vertauscht. Der schärfste Anker dieses Sprints
--    („2026 bewegt sich nicht") würde still brechen.
--
--    Die Migration prüft das SELBST und bricht ab, statt es zuzulassen.
--    Deshalb ist der ADAC-Mitgliedsbeitrag NICHT dabei: Er startet 2026-07,
--    gezahlt wurde 2025 aber im Oktober — Abstand 9, und 9 % 12 ≠ 0.
--
-- ============================================================================
-- WAS NICHT ZURÜCKREICHT UND WARUM
-- ============================================================================
--   CLAUDE.AI · Gemini · Friseur · Deutschlandticket
--       2025 nachweislich NULL Zahlungen. Zurückdatieren würde Kosten erfinden.
--   ADAC Mitgliedsbeitrag
--       Rhythmus-Konflikt (Falle ③). 99 € rechtfertigen keinen Ankerbruch.
--       Die zweite ADAC-Buchung 2025 (212,10 € am 05.12.) ist ein
--       Fahrsicherheitstraining und gehört ohnehin nicht an diese Karte.
--   Mitgliedschaftsbeitrag BuMs-NDQ · Aline Geburtstag · Urlaub Frankreich
--       keine 2025-Zahlungen.
--   MOBILE SUICA APPLE V
--       15 Zahlungen, 79,45 € im Jahr, aber KEINE Karte — bewusst nicht
--       angelegt, das wäre eine neue Karte und nicht Rückdatierung.
--   Die 55 ONCE-Karten
--       Einmal-Karten reichen nicht zurück.
--
-- ============================================================================

DO $$
DECLARE
  v_user      uuid;
  r           record;
  v_card      cards%ROWTYPE;
  v_faktor    numeric;
  v_plan      numeric;
  v_diff      int;
  v_karten    int := 0;
  v_zeilen    int := 0;
BEGIN
  ---------------------------------------------------------------------------
  -- Die Karten und ihre 2025-Belege.
  --
  -- `jahressumme` ist die Summe der TATSÄCHLICHEN Zahlungen 2025 — bei
  -- GEMEINSAM-Karten also der eigene ANTEIL, nicht der Haushaltsbetrag.
  -- `perioden` ist die Zahl der Fälligkeiten im Jahr (12 monatlich, 4
  -- quartalsweise, 1 jährlich, 6 bei Audible).
  --
  -- Bei den drei BUDGET-Karten steht dort der heutige Plan × 12: Sie zeigen
  -- ihren Plan, solange die Ausgaben darunter liegen (§4.3, LL-12), und der
  -- Nutzer hat entschieden, sie mit den heutigen Werten zurückreichen zu
  -- lassen (Briefing §3, E3).
  ---------------------------------------------------------------------------
  FOR r IN
    SELECT * FROM (VALUES
      --  name                                   ab             jahressumme  perioden  zweite_zeile_april
      ('Miete',                               '2025-01-01'::date, 12821.24::numeric, 12, true ),
      ('Internet - Vodafone',                 '2025-01-01'::date,   273.00::numeric, 12, true ),
      ('Rechtsschutz - Adam Riese',           '2025-01-01'::date,   173.42::numeric, 12, true ),
      ('Strom - Mainova',                     '2025-01-01'::date,   352.03::numeric, 12, true ),
      ('Rundfunkbeitrag',                     '2025-01-01'::date,   125.72::numeric,  4, true ),
      ('Privathaftpflicht',                   '2025-04-01'::date,    29.68::numeric,  1, false),
      ('Netflix',                             '2025-01-01'::date,   227.88::numeric, 12, false),
      ('Spotify',                             '2025-01-01'::date,   133.88::numeric, 12, false),
      ('iCloud',                              '2025-01-01'::date,   119.88::numeric, 12, false),
      ('Essen gehen',                         '2025-01-01'::date,   600.00::numeric, 12, false),
      ('Kreditkartenkosten',                  '2025-01-01'::date,    29.88::numeric, 12, false),
      ('Private Altersvorsorge - Nürnberger', '2025-01-01'::date,  1373.20::numeric, 12, false),
      ('Berufsunfähigkeit - Alte Leipziger',  '2025-01-01'::date,  1146.11::numeric, 12, false),
      ('Fitnessstudio',                       '2025-01-01'::date,  1248.00::numeric, 12, false),
      ('Handyvertrag',                        '2025-01-01'::date,   396.84::numeric, 12, false),
      ('Audible',                             '2025-01-01'::date,    59.70::numeric,  6, false),
      ('Reisekrankenversicherung - DKV',      '2025-05-01'::date,     9.90::numeric,  1, false),
      ('Handyvertrag - Aline',                '2025-01-01'::date,   132.00::numeric, 12, false),
      ('iCloud - Anteil Mama',                '2025-01-01'::date,    84.00::numeric, 12, false),
      ('Privates Budget',                     '2025-01-01'::date,  1800.00::numeric, 12, false),
      ('Haushaltsgeld',                       '2025-01-01'::date,  2400.00::numeric, 12, false),
      ('Tanken',                              '2025-01-01'::date,  2880.00::numeric, 12, false)
    ) AS t(name, start_m, jahressumme, perioden, zwei_zeilen)
  LOOP
    SELECT * INTO v_card FROM cards WHERE name = r.name AND deleted_at IS NULL;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'v2-27: Karte nicht gefunden oder gelöscht: %', r.name;
    END IF;
    v_user := v_card.user_id;

    -------------------------------------------------------------------------
    -- FALLE ③ — Rhythmus-Wächter.
    -- Zurückdatieren darf den 2026-Fälligkeitsmonat nicht verschieben.
    -------------------------------------------------------------------------
    v_diff := EXTRACT(YEAR  FROM age(v_card.first_active_month, r.start_m))::int * 12
            + EXTRACT(MONTH FROM age(v_card.first_active_month, r.start_m))::int;

    IF (v_card.frequency = 'ANNUAL'     AND v_diff % 12 <> 0)
    OR (v_card.frequency = 'QUARTERLY'  AND v_diff %  3 <> 0)
    OR (v_card.frequency = 'SEMIANNUAL' AND v_diff %  6 <> 0) THEN
      RAISE EXCEPTION
        'v2-27: RHYTHMUS-BRUCH bei "%" — % Monate zurück bei Frequenz %. '
        'Das würde den Fälligkeitsmonat 2026 verschieben. Abbruch.',
        r.name, v_diff, v_card.frequency;
    END IF;

    IF r.start_m > v_card.first_active_month THEN
      RAISE EXCEPTION 'v2-27: "%" soll NACH ihrem heutigen Start beginnen (% > %). Abbruch.',
        r.name, r.start_m, v_card.first_active_month;
    END IF;

    -------------------------------------------------------------------------
    -- Plan-Zeile zum Startmonat.
    -- FALLE ① + ②: Der Haushaltsbetrag wird GERECHNET, mit dem Faktor des
    -- jeweiligen Startmonats — nicht abgeschrieben und nicht pauschal Januar.
    -------------------------------------------------------------------------
    v_faktor := CASE WHEN v_card.attribution::text = 'GEMEINSAM'
                     THEN get_split_factor(v_user, r.start_m)
                     ELSE 1 END;
    v_plan   := round((r.jahressumme / r.perioden) / v_faktor, 2);

    -- FALLE ②: Forward-Inheritance ist ein SLOT, kein Anhängen (§7 Regel 6).
    -- UPSERT auf dem Composite-Key. Die 2026-01-Zeile bleibt unberührt und
    -- gilt ab Januar 2026 weiter — genau deshalb bewegt sich 2026 nicht.
    INSERT INTO card_planned_timeline (user_id, card_id, effective_month, planned_amount)
    VALUES (v_user, v_card.id, r.start_m, v_plan)
    ON CONFLICT (card_id, effective_month)
      DO UPDATE SET planned_amount = EXCLUDED.planned_amount;
    v_zeilen := v_zeilen + 1;

    -- Zweite Zeile zum April: der Split-Faktor wechselt dort von 0,587863
    -- auf 0,565636. Der Haushaltsbetrag steigt entsprechend, damit der
    -- eigene Anteil über alle zwölf Monate konstant bleibt.
    IF r.zwei_zeilen THEN
      v_faktor := CASE WHEN v_card.attribution::text = 'GEMEINSAM'
                       THEN get_split_factor(v_user, '2025-04-01')
                       ELSE 1 END;
      v_plan   := round((r.jahressumme / r.perioden) / v_faktor, 2);

      INSERT INTO card_planned_timeline (user_id, card_id, effective_month, planned_amount)
      VALUES (v_user, v_card.id, '2025-04-01', v_plan)
      ON CONFLICT (card_id, effective_month)
        DO UPDATE SET planned_amount = EXCLUDED.planned_amount;
      v_zeilen := v_zeilen + 1;
    END IF;

    -- Erst jetzt zurückdatieren. Der Constraint-Trigger
    -- `cards_assert_initial_plan` ist DEFERRABLE INITIALLY DEFERRED und
    -- verlangt eine Plan-Zeile <= first_active_month; sie steht oben bereits.
    UPDATE cards SET first_active_month = r.start_m WHERE id = v_card.id;
    v_karten := v_karten + 1;
  END LOOP;

  ---------------------------------------------------------------------------
  -- Audible: sechs Monate ohne Zahlung als „nicht angefallen" markieren.
  --
  -- Gezahlt wurde 2025 in Januar, Mai, Juni, Juli, November und Dezember —
  -- sechsmal 9,95 €, kein durchgehendes Abo. Eine Karte ohne Lücken würde
  -- 119,40 € planen statt 59,70 €, also mehr als das Doppelte.
  --
  -- „Nicht angefallen" ist seit v2-25 `adjusted_amount = 0` (KJ-2/KJ-3);
  -- die Null schlägt in `calculate_card_amount_for_month` den Plan.
  ---------------------------------------------------------------------------
  INSERT INTO card_monthly_states (user_id, card_id, month, adjusted_amount, adjustment_scope)
  SELECT c.user_id, c.id, m::date, 0, 'THIS_MONTH'
  FROM cards c,
       unnest(ARRAY['2025-02-01','2025-03-01','2025-04-01',
                    '2025-08-01','2025-09-01','2025-10-01']) m
  WHERE c.name = 'Audible' AND c.deleted_at IS NULL
  ON CONFLICT (card_id, month) DO UPDATE SET adjusted_amount = 0;

  -- Den DEFERRED-Constraint JETZT prüfen, nicht erst beim COMMIT: So bricht
  -- die Migration an der Stelle ab, an der man den Fehler noch zuordnen kann.
  SET CONSTRAINTS ALL IMMEDIATE;

  RAISE NOTICE 'v2-27 DA-1: % Karten zurückdatiert, % Plan-Zeilen geschrieben, 6 Audible-Lücken.',
    v_karten, v_zeilen;
END $$;
