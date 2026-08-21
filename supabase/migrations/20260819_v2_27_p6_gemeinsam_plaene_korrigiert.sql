-- ============================================================================
-- Sprint v2-27 · P6 — Die Pläne der GEMEINSAM-Karten auf die echten Beträge
-- ============================================================================
--
-- ANLASS — eine Korrektur des Nutzers, die einen Konstruktionsfehler aufdeckte
--
--   Der Nutzer meldete am 19.08.2026: „Die Gesamtmiete ist falsch. Wir haben
--   gemeinsam gezahlt: 01/25 1.820 € · 02/25–01/26 1.861 € · ab 02/26 1.904 €."
--
--   Er hatte recht, und der Fehler war grundsätzlicher als die Miete.
--
-- WAS IN P2 FALSCH GEMACHT WURDE
--
--   Die Migration `20260819_v2_27_da1_karten_2025.sql` bildete den Plan als
--   **Jahresdurchschnitt des eigenen Anteils geteilt durch den Split-Faktor**.
--   Das hielt den Anteil über zwölf Monate konstant — und erfand dafür einen
--   Haushaltsbetrag, den es nie gab: 1.817,49 € (Jan–Mär) und 1.888,91 €
--   (ab April). Der echte Betrag war **1.820 €** und dann **1.861 €**.
--
--   **Die Rückrechnung beweist es.** Zahlung ÷ Split-Faktor des Monats ergibt
--   für Mai–Dez 2025 **exakt 1.861,00 €** — Monat für Monat, ohne Rest. Und für
--   Februar bis August 2026 exakt **1.904,00 €**, also genau den heute
--   gültigen Plan. Eine Methode, die den bekannten Wert reproduziert, ist der
--   bessere Schätzer für den unbekannten.
--
--   **Derselbe Fehler steckte in allen fünf GEMEINSAM-Karten**, nicht nur in
--   der Miete. Er fiel dort nur auf, weil es die größte Position des Jahres ist.
--
-- ⚠️ DER NEBENBEFUND: DER JANUAR-2026-PLAN WAR SCHON VORHER FALSCH
--
--   Die Zahlungen zeigen, dass der eigene Anteil bis **einschließlich Januar
--   2026** mit dem alten Faktor 0,565636 berechnet wurde; erst ab Februar 2026
--   gilt 0,572090. Der Haushaltsbetrag stieg ebenfalls erst zum Februar.
--
--   Die Plan-Zeile `2026-01` trug aber bereits den neuen Betrag — bei Miete,
--   Rechtsschutz und Strom. **Das ist ein Fehler aus der Zeit vor diesem
--   Sprint.** Er wird hier mitkorrigiert: `2026-01` bekommt den Wert, der im
--   Januar galt, und eine neue Zeile `2026-02` trägt den heutigen.
--
--   **Die Ist-Sparrate 2026 bewegt sich dadurch NICHT** — für alle fünf Karten
--   ist die Januar-Zahlung verlinkt, und bei Fixkosten gewinnt die Realität.
--   Bewegt wird nur die **Plan**-Sparrate des Januar 2026: 1.465,36 → 1.489,96 €.
--
-- WAS DIESE MIGRATION NICHT TUT
--
--   Sie fasst keine Rechenfunktion an. Die neun Prüfsummen bleiben
--   byte-identisch — geprüft vorher und nachher.
--
-- ============================================================================

DO $$
DECLARE
  v_user   uuid;
  r        record;
  v_card   uuid;
  v_zeilen int := 0;
  v_weg    int := 0;
BEGIN
  SELECT user_id INTO v_user FROM cards WHERE name = 'Miete' AND deleted_at IS NULL;
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'v2-27 P6: Karte "Miete" nicht gefunden.';
  END IF;

  ---------------------------------------------------------------------------
  -- Die Konstruktions-Zeilen aus P2 entfernen.
  --
  -- `2025-04` existierte NUR, weil der Split-Faktor dort wechselt und der
  -- konstruierte Haushaltsbetrag mitwandern musste. Mit echten Beträgen ist
  -- sie gegenstandslos: Der Haushaltsbetrag ändert sich nicht, wenn sich das
  -- Verhältnis der Einkommen ändert — nur der Anteil tut das, und den rechnet
  -- `calculate_card_amount_for_month` selbst.
  --
  -- ⚠️ DIE FÜNF KARTEN STEHEN NAMENTLICH DA, UND DAS IST KEIN STILFRAGE.
  --    Ein Filter auf `attribution = 'GEMEINSAM'` hätte SECHS Zeilen getroffen:
  --    Die **Privathaftpflicht** beginnt selbst im April 2025, ihre 2025-04-Zeile
  --    ist keine Konstruktion, sondern ihre EINZIGE. Sie zu löschen hätte die
  --    Karte ohne Planwert zurückgelassen.
  --
  --    Der Constraint-Trigger hätte das NICHT gefangen: `cards_assert_initial_plan`
  --    hängt an INSERT/UPDATE auf `cards`, nicht an DELETE auf
  --    `card_planned_timeline`. Gefunden hat es der Trockenlauf, weil dort sechs
  --    statt fünf gelöschte Zeilen gemeldet wurden.
  ---------------------------------------------------------------------------
  DELETE FROM card_planned_timeline
  WHERE effective_month = '2025-04-01'
    AND card_id IN (SELECT id FROM cards
                     WHERE deleted_at IS NULL
                       AND name IN ('Miete', 'Internet - Vodafone',
                                    'Rechtsschutz - Adam Riese', 'Strom - Mainova',
                                    'Rundfunkbeitrag'));
  GET DIAGNOSTICS v_weg = ROW_COUNT;

  IF v_weg <> 5 THEN
    RAISE EXCEPTION 'v2-27 P6: % Konstruktions-Zeilen statt 5 entfernt. Abbruch.', v_weg;
  END IF;

  ---------------------------------------------------------------------------
  -- Die echten Haushaltsbeträge.
  --
  -- Miete: vom Nutzer genannt (01/25 · 02/25 · 02/26).
  -- Die übrigen vier: aus den tatsächlichen Zahlungen zurückgerechnet, nach
  -- ausdrücklicher Freigabe. Belegt dadurch, dass dieselbe Rechnung ab
  -- Februar 2026 die heute gültigen Pläne exakt trifft.
  ---------------------------------------------------------------------------
  FOR r IN
    SELECT * FROM (VALUES
      --  Karte                        Monat            Betrag
      ('Miete',                     '2025-01-01'::date, 1820.00::numeric),
      ('Miete',                     '2025-02-01'::date, 1861.00::numeric),
      ('Miete',                     '2026-01-01'::date, 1861.00::numeric),
      ('Miete',                     '2026-02-01'::date, 1904.00::numeric),

      ('Internet - Vodafone',       '2025-01-01'::date,   34.84::numeric),
      ('Internet - Vodafone',       '2025-05-01'::date,   39.98::numeric),
      -- 2026-01 steht bereits auf 39,98 und ist damit richtig.

      ('Rechtsschutz - Adam Riese', '2025-01-01'::date,   25.02::numeric),
      ('Rechtsschutz - Adam Riese', '2025-05-01'::date,   25.12::numeric),
      ('Rechtsschutz - Adam Riese', '2026-01-01'::date,   25.12::numeric),
      ('Rechtsschutz - Adam Riese', '2026-02-01'::date,   27.01::numeric),

      ('Strom - Mainova',           '2025-01-01'::date,   50.78::numeric),
      ('Strom - Mainova',           '2025-05-01'::date,   51.00::numeric),
      ('Strom - Mainova',           '2026-01-01'::date,   51.00::numeric),
      ('Strom - Mainova',           '2026-02-01'::date,   63.00::numeric),

      -- Rundfunkbeitrag ist QUARTERLY (aktiv 01/04/07/10). Die Mai-Zeile
      -- greift deshalb erst im Juli; April behält den Januar-Wert. Die
      -- Differenz beträgt dort 0,24 € auf ein Quartal.
      ('Rundfunkbeitrag',           '2025-01-01'::date,   54.84::numeric),
      ('Rundfunkbeitrag',           '2025-05-01'::date,   55.08::numeric)
      -- 2026-01 steht bereits auf 55,08 und ist damit richtig.
    ) AS t(name, monat, betrag)
  LOOP
    SELECT id INTO v_card FROM cards WHERE name = r.name AND deleted_at IS NULL;
    IF v_card IS NULL THEN
      RAISE EXCEPTION 'v2-27 P6: Karte nicht gefunden: %', r.name;
    END IF;

    INSERT INTO card_planned_timeline (user_id, card_id, effective_month, planned_amount)
    VALUES (v_user, v_card, r.monat, r.betrag)
    ON CONFLICT (card_id, effective_month)
      DO UPDATE SET planned_amount = EXCLUDED.planned_amount;
    v_zeilen := v_zeilen + 1;
  END LOOP;

  SET CONSTRAINTS ALL IMMEDIATE;

  RAISE NOTICE 'v2-27 P6: % Konstruktions-Zeilen entfernt, % Plan-Zeilen gesetzt.',
    v_weg, v_zeilen;
END $$;
