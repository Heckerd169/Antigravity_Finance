-- ─────────────────────────────────────────────────────────────────────────────
-- Sprint v2-11 · BF-5 — Fragmente wurden ohne Vorzeichen addiert
--
-- Befund: V2/befunde_2026-08-04_fehler_und_entscheidungen.md §6
-- Entscheidung E2 (Dominik, 05.08.2026): dort §7 — „ehrlich rechnen".
--
-- FEHLER. Die Fragment-Aggregation in calculate_card_amount_for_month lautete:
--
--     SELECT COALESCE(SUM(ABS(f.amount)), 0), COUNT(*)
--
-- ABS wirft bei JEDEM Fragment das Vorzeichen weg, für alle drei Kartenarten.
-- Das fällt nicht auf, solange alle Fragmente einer Karte in dieselbe Richtung
-- zeigen — eine Fixkosten-Karte hat nur Abbuchungen, eine Einnahmen-Karte nur
-- Eingänge. Sobald sich beide Richtungen mischen, werden sie ADDIERT statt
-- verrechnet.
--
-- Gemessen (Juli 2026, Budget-Karte „Aline Geburtstag", 13 Fragmente):
--     6 Gutschriften / 7 Ausgaben
--     Summe MIT  Vorzeichen  =   −168,11 €   ← tatsächlich ausgegeben
--     Summe OHNE Vorzeichen  =  1.068,11 €   ← was die Karte zeigte
--     Plan                    =    150,00 €
--   Wirkung auf die Juli-Sparrate: 900,00 € zu schlecht.
--
-- KEIN SPEC-PROBLEM. Design-Doku §11 (Erstattungs-Leitfaden, Beschluss
-- 24.07.2026) beschreibt das Sollverhalten bereits wörtlich: „bei BUDGET senkt
-- die Gutschrift den Verbrauch, bei FIXED_COST die Realität". Im selben Absatz
-- wurde geschlossen, ein Eingriff in die Rechenfunktion sei nicht nötig — auf
-- Basis der ungeprüften Annahme, sie summiere vorzeichenrichtig. Der Leitfaden
-- beschrieb also ein Verhalten, das es nie gab. §11 wird mit korrigiert.
--
-- FIX. Signierte Summe bilden und die Richtung EINMAL je Kartenart auswerten,
-- statt das Vorzeichen wegzuwerfen:
--
--     INCOME              → Netto-ZUFLUSS   = +SUM(amount)
--     FIXED_COST, BUDGET  → Netto-ABFLUSS   = −SUM(amount)
--
-- Die Anzeige-Konvention bleibt damit exakt wie bisher: die Funktion liefert
-- einen POSITIVEN Betrag in der natürlichen Richtung der Kartenart. Das
-- Vorzeichen setzt weiterhin der Aufrufer — calculate_sparrate_for_month
-- rechnet unverändert (netto + income) − fixed − budget. An dieser Funktion
-- wird NICHTS geändert.
--
-- E2 — keine Kappung bei null. Übersteigen die Gutschriften die Ausgaben, wird
-- der Netto-Betrag NEGATIV zurückgegeben und verbessert die Sparrate
-- entsprechend. Bewusst kein GREATEST(…, 0): Eine Zahl zu verschlucken ist
-- genau die Art stiller Ungenauigkeit, die zu den Befunden vom 04.08. geführt
-- hat (vgl. LL-20: ein fehlender Wert heißt „keine Anzeige", nicht 0).
--
--   Hinweis zur Reichweite von E2: Bei BUDGET greift zusätzlich die
--   §4.3.2-Regel „der Plan gilt, solange die Fragmente ihn nicht übersteigen"
--   (LL-12). Ein negativer Netto-Verbrauch ist damit stets ≤ Plan und die Karte
--   zeigt den Plan — der negative Wert erreicht die Sparrate bei BUDGET also
--   gar nicht. Wirksam wird E2 damit bei FIXED_COST (dort gewinnt immer die
--   Realität) und bei INCOME. Das ist Folge der bestehenden §4.3-Semantik und
--   wird hier NICHT geändert.
--
-- NICHT GEÄNDERT: die drei CASE-Zweige je Kartenart, die manually_paid-Logik,
-- der Transfer-Filter (v2-04 ③), Volatilität (STABLE), Rechte. Der einzige
-- inhaltliche Unterschied ist die Vorzeichen-Behandlung der Fragment-Summe.
--
-- Prüfanker (VOR der Anwendung festgelegt, Befund §8):
--     Juli 2026 Ist-Sparrate  −1.222,75 €  →  −322,75 €   (exakt +900,00 €)
--     ALLE anderen Monate 2026 unverändert.
-- Bewegt sich ein anderer Monat, ist etwas falsch → zurückrollen, nicht erklären.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.calculate_card_amount_for_month(p_card_id uuid, p_month date)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  v_card           cards%ROWTYPE;
  v_state          card_monthly_states%ROWTYPE;
  v_planned        numeric;
  v_base_amount    numeric;
  v_fragment_net   numeric;   -- v2-11 (BF-5): Summe MIT Vorzeichen
  v_fragment_sum   numeric;   -- daraus abgeleitet: Betrag in Kartenart-Richtung
  v_fragment_count int;
BEGIN
  SELECT * INTO v_card FROM cards WHERE id = p_card_id;
  IF NOT FOUND THEN RETURN 0; END IF;
  IF NOT is_card_active_in_month(p_card_id, p_month) THEN RETURN 0; END IF;

  SELECT * INTO v_state
  FROM card_monthly_states
  WHERE card_id = p_card_id AND month = p_month;

  v_planned := get_planned_amount_for_month(p_card_id, p_month);
  IF v_planned IS NULL THEN
    v_planned := 0;
  END IF;

  -- Fragment-Summe — Transfer-Fragmente jeder Art ausgeschlossen
  -- (v2-04 ③: IS NULL; Defense-in-Depth zusätzlich zu OQ-B + Link-Trigger)
  -- v2-11 (BF-5): SUM(f.amount) statt SUM(ABS(f.amount)). Gutschriften und
  -- Ausgaben werden dadurch verrechnet statt addiert.
  SELECT COALESCE(SUM(f.amount), 0), COUNT(*)
  INTO v_fragment_net, v_fragment_count
  FROM card_fragment_links l
  JOIN fragments f ON f.id = l.fragment_id
  WHERE l.card_id = p_card_id
    AND l.month   = p_month
    AND f.transfer_type IS NULL;

  -- v2-11 (BF-5): Richtung EINMAL je Kartenart. Ergebnis ist der Betrag in der
  -- natürlichen Richtung der Karte (Kosten als positive Zahl) — genau die
  -- Konvention, die calculate_sparrate_for_month erwartet.
  -- Kein GREATEST(…, 0): E2 (05.08.2026) verlangt ausdrücklich KEINE Kappung.
  v_fragment_sum := CASE v_card.type
    WHEN 'INCOME' THEN  v_fragment_net    -- Netto-Zufluss
    ELSE               -v_fragment_net    -- Netto-Abfluss (FIXED_COST, BUDGET)
  END;

  v_base_amount := COALESCE(v_state.adjusted_amount, v_planned);

  RETURN CASE v_card.type
    WHEN 'FIXED_COST' THEN
      CASE
        WHEN v_fragment_count > 0                    THEN v_fragment_sum
        WHEN COALESCE(v_state.manually_paid, false)  THEN v_base_amount
        ELSE                                              v_base_amount
      END
    WHEN 'INCOME' THEN
      CASE
        WHEN v_fragment_count > 0                    THEN v_fragment_sum
        WHEN COALESCE(v_state.manually_paid, false)  THEN v_base_amount
        ELSE                                              v_base_amount
      END
    WHEN 'BUDGET' THEN
      CASE
        WHEN v_fragment_count > 0 AND v_fragment_sum > v_base_amount
                                                     THEN v_fragment_sum
        WHEN COALESCE(v_state.manually_paid, false) AND v_fragment_count > 0
                                                     THEN v_fragment_sum
        WHEN COALESCE(v_state.manually_paid, false) AND v_fragment_count = 0
                                                     THEN 0
        WHEN v_fragment_count > 0                    THEN v_base_amount
        ELSE                                              v_base_amount
      END
  END;
END;
$function$;
