-- ============================================================================
-- Sprint v2-28 · P1 — Die 2025-Pläne auf die tatsächlich gezahlten Beträge
-- ============================================================================
--
-- ANLASS — der Mittelwert war sauber gebildet und trotzdem nie richtig
--
--   v2-27 hat für jede zurückdatierte Karte GENAU EINE Plan-Zeile für 2025
--   gesetzt, gebildet als Jahresdurchschnitt der tatsächlichen Zahlungen. Das
--   ist an zwei Stellen zu grob: bei **Ausreißern** und bei echten
--   **Preiswechseln**. Die Jahressumme stimmt in beiden Fällen — die
--   Monatswerte nicht.
--
--   Dieselbe Fehlerklasse wie LL-34 („jede Zahl richtig, nur im falschen
--   Monat"), nur aus einem anderen Grund: dort verschob das Zurückdatieren den
--   Rhythmus, hier glättet ein Mittelwert einen Sprung, den es wirklich gab.
--
-- WAS GEMESSEN IST (Produktion, 24.08.2026 — nicht geschätzt)
--
--   NETFLIX — Preissenkung im November 2025
--     Jan–Okt  19,99 · Nov+Dez  13,99
--     (10 × 19,99 + 2 × 13,99) / 12 = 227,88 / 12 = 18,99 EXAKT.
--     Der Mittelwert ist rechnerisch tadellos — und in KEINEM Monat der
--     gezahlte Betrag. 18,99 € kommt in den Daten nicht ein einziges Mal vor.
--
--   SPOTIFY — Preiserhöhung im Dezember 2025
--     Jan–Nov  10,99 · Dez  12,99
--     (11 × 10,99 + 12,99) / 12 = 133,88 / 12 = 11,15666… → gerundet 11,16.
--     Auch dieser Betrag wurde nie gezahlt.
--
--   HANDYVERTRAG — zwei Ausreißer verschieben den Schnitt
--     Zehn von zwölf Monaten exakt 33,00; August 33,40, Dezember 33,44.
--     (10 × 33,00 + 33,40 + 33,44) / 12 = 396,84 / 12 = 33,07 exakt.
--     Der typische Monat ist 33,00 — der Schnitt bildet ihn nicht ab.
--
--   FRISEUR — die Karte reichte nicht nach 2025 zurück
--     first_active_month stand auf 2026-01. Wird auf 2025-01 zurückdatiert.
--
-- ⚠️ ZWEI PREISWECHSEL WAREN SCHON IN DER DATENBANK — IM FALSCHEN JAHR
--
--   Netflix trägt für 2026-01 bereits 13,99, Spotify bereits 12,99. Die neuen
--   2025-Zeilen dieser Migration treffen also EXAKT die Beträge, die ohnehin ab
--   Januar 2026 gelten. Der Sprung war erfasst — nur um Monate versetzt.
--
-- ⚠️ DIE FRISEUR-RÜCKDATIERUNG STELLT PLAN OHNE REALITÄT HER
--
--   Es gibt KEINE Belege für Friseurbesuche 2025. Der Salon (`Zeil 57`) taucht
--   in der gesamten Rohmasse erstmals am 05.01.2026 auf; 2025 gibt es nur
--   Bargeld-Abhebungen. Der Nutzer hat entschieden, trotzdem zurückzudatieren,
--   und ordnet die passenden Abhebungen bei der Kuratierung der FRISEUR-Karte
--   zu statt dem Privaten Budget.
--
--   **Tut er das nicht, zählt dasselbe Geld zweimal.** Das ist eine
--   Folgepflicht, keine Nebenbemerkung.
--
-- ⚠️ WARUM `first_active_month` UND PLAN-ZEILE IN EINER TRANSAKTION STEHEN
--
--   `cards_assert_initial_plan` ist ein DEFERRABLE INITIALLY DEFERRED
--   Constraint-Trigger. Er verlangt eine Plan-Zeile mit
--   `effective_month <= first_active_month`. Die vorhandene Zeile des Friseurs
--   liegt auf 2026-01 und erfüllt das nach der Rückdatierung NICHT mehr.
--   Zwei getrennte Aufrufe scheitern deshalb am zwischenzeitlichen Commit
--   (§6 Stolperfalle 5). Diese Migration ist ein einziger DO-Block.
--
-- WAS DIESE MIGRATION NICHT TUT
--
--   Sie fasst keine Rechenfunktion an. Die neun Prüfsummen bleiben
--   byte-identisch — vorher und nachher geprüft.
--   Sie hebt keine bestehende Zuordnung auf.
--   Sie berührt 2026 nicht: Alle drei bestehenden Karten tragen bereits eine
--   eigene Plan-Zeile zum 2026-01, an der die Forward-Inheritance aus 2025
--   endet. Die Friseur-Zeile 2026-01 = 45,00 bleibt stehen; sie ist nach der
--   Rückdatierung redundant, aber wertgleich mit der geerbten und damit
--   wirkungslos.
--
-- ERWARTETE BEWEGUNG — VOR dem Eingriff festgeschrieben, im Trockenlauf
-- bestätigt (`sprints/sprint_v2-28_anker.md` §3)
--
--   Bei FIXED_COST gewinnt die Realität: Ein Monat mit VERLINKTER Zahlung ist
--   gegen Plan-Änderungen immun. Ist und Plan bewegen sich deshalb
--   unterschiedlich.
--
--     Karte          | verlinkt 2025 | Ist       | Plan
--     ---------------|---------------|-----------|----------
--     Handyvertrag   | kein Monat    |   + 0,84  |  + 0,84
--     Netflix        | nur Januar    |   + 1,00  |    0,00
--     Spotify        | Jan–Nov       |   − 1,83  |  + 0,04
--     Friseur        | kein Monat    |  −540,00  | −540,00
--     ---------------|---------------|-----------|----------
--     Summe 2025     |               |  −539,99  | −539,12
--
--   2026: 0,00 € in allen zwölf Monaten, Ist und Plan.
--   Jahressumme 2025 Ist: 22.316,32 → 21.776,33 €.
--
-- ============================================================================

DO $$
DECLARE
  v_user    uuid;
  v_handy   uuid;
  v_netflix uuid;
  v_spotify uuid;
  v_friseur uuid;
  v_alt     date;
BEGIN
  -- --------------------------------------------------------------------------
  -- Die vier Karten auflösen. `INTO STRICT` ist die Selbstprüfung: Es muss
  -- GENAU EINE Karte je Name geben. Null Treffer (NO_DATA_FOUND) und mehrere
  -- Treffer (TOO_MANY_ROWS) brechen beide ab — die Migration rät nicht.
  -- Keine fest verdrahteten UUIDs: die überleben keinen Neuaufbau.
  -- --------------------------------------------------------------------------
  SELECT id, user_id INTO STRICT v_netflix, v_user
    FROM cards WHERE name = 'Netflix'      AND deleted_at IS NULL;
  SELECT id            INTO STRICT v_handy
    FROM cards WHERE name = 'Handyvertrag' AND deleted_at IS NULL AND user_id = v_user;
  SELECT id            INTO STRICT v_spotify
    FROM cards WHERE name = 'Spotify'      AND deleted_at IS NULL AND user_id = v_user;
  SELECT id, first_active_month INTO STRICT v_friseur, v_alt
    FROM cards WHERE name = 'Friseur'      AND deleted_at IS NULL AND user_id = v_user;

  -- --------------------------------------------------------------------------
  -- Die Plan-Zeilen. UPSERT auf (card_id, effective_month) — ein Slot, kein
  -- Anhängen (§7 Regel 6). Ein blankes INSERT würde am UNIQUE scheitern; ein
  -- blankes UPDATE würde die beiden NEUEN Zeilen still verfehlen (§7 Regel 7).
  -- --------------------------------------------------------------------------
  INSERT INTO card_planned_timeline (user_id, card_id, effective_month, planned_amount)
  VALUES
    -- Handyvertrag: der typische Monat statt des Schnitts aus zwei Ausreißern
    (v_user, v_handy,   DATE '2025-01-01', 33.00),
    -- Netflix: 19,99 ab Januar, Preissenkung auf 13,99 ab November
    (v_user, v_netflix, DATE '2025-01-01', 19.99),
    (v_user, v_netflix, DATE '2025-11-01', 13.99),
    -- Spotify: 10,99 ab Januar, Preiserhöhung auf 12,99 ab Dezember
    (v_user, v_spotify, DATE '2025-01-01', 10.99),
    (v_user, v_spotify, DATE '2025-12-01', 12.99),
    -- Friseur: die Zeile, die der Constraint-Trigger nach der Rückdatierung
    -- verlangt. Muss VOR dem UPDATE stehen? Nein — der Trigger ist DEFERRED
    -- und prüft beim Commit. Die Reihenfolge ist hier also frei; die Nähe zum
    -- UPDATE ist Absicht, damit beim Lesen niemand die Kopplung übersieht.
    (v_user, v_friseur, DATE '2025-01-01', 45.00)
  ON CONFLICT (card_id, effective_month)
    DO UPDATE SET planned_amount = EXCLUDED.planned_amount;

  -- --------------------------------------------------------------------------
  -- Die Rückdatierung. MONTHLY ist gegen die LL-34-Falle immun:
  -- `is_card_active_in_month` gibt für MONTHLY bedingungslos `true` zurück,
  -- der Rhythmus zählt also nicht ab `first_active_month` neu. Im
  -- Funktionsrumpf nachgelesen, nicht angenommen.
  -- --------------------------------------------------------------------------
  UPDATE cards
     SET first_active_month = DATE '2025-01-01'
   WHERE id = v_friseur;

  RAISE NOTICE 'v2-28 P1: Friseur % → 2025-01-01, 6 Plan-Zeilen gesetzt.', v_alt;
END $$;
