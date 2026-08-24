-- ============================================================================
-- Sprint v2-28 · P3a — Die Händler-Regel: Mobilität ordnet sich selbst zu
-- ============================================================================
--
-- ANLASS
--
--   Tankstellen und Nahverkehr tauchen in der Rohmasse unter ständig neuen
--   Namen auf und mussten bisher jeden Monat von Hand auf die Karte „Tanken"
--   gezogen werden. Der Nutzer hat das **75-mal** getan. Eine Regel, die das
--   übernimmt, spart genau diese Arbeit — und zwar dauerhaft, nicht einmalig.
--
-- ⚠️ WAS HIER NICHT PASSIERT
--
--   Diese Migration verlinkt NICHTS. Sie legt die Regel an und lehrt
--   `calculate_match_confidence`, sie zu lesen. Die Nachverlinkung des
--   Bestands ist P3b — bewusst getrennt, aus einem inhaltlichen Grund:
--
--   **P3b ruft diese Funktion auf, statt die Wortliste im Migrations-SQL
--   nachzubauen.** Ein Nachbau wäre die Form „Nachbauen" aus LL-26 — zwei
--   Formulierungen derselben Regel, die auseinanderlaufen, sobald jemand die
--   eine pflegt und die andere vergisst. Deshalb diese Reihenfolge.
--
-- WIE DIE REGEL WIRKT
--
--   `calculate_match_confidence` kennt bereits genau dieses Muster:
--   `history_match` liefert 1 oder 0, und die Konfidenz wird dann auf einen
--   konfigurierten Wert **hochgezogen** (`GREATEST(v_score, 0.94)`). Die
--   Händler-Regel setzt sich daneben, mit einem höheren Wert.
--
--   Der Wert ist **0,96** und liegt damit über der Auto-Absorptions-Schwelle
--   von 0,95. Das ist der ganze Mechanismus: `process_csv_import` verlinkt ab
--   dieser Schwelle von allein. **An `process_csv_import` ist deshalb NICHTS
--   zu ändern** — die Regel greift beim nächsten Import ohne weiteres Zutun.
--
--   Beide Zahlen stehen in `app_config`, nicht im Code (§7 Regel 5 und 15).
--   Wer die Regel schärfer oder weicher stellen will, ändert eine Zeile Daten.
--
-- DIE LISTE IST ZWEISTUFIG, UND DAS IST DER KERN
--
--   Stufe 1 — eindeutig. Ein Wortreffer genügt:
--     aral · agip · esso · shell · omv · avia · hem · orlen · allguth ·
--     calpam · pinoil · westfalen · raiffeisen · bft · tankstelle · station
--     dazu Nahverkehr: rmv · rhein-main-verkehrsverbund
--
--   Stufe 2 — mehrdeutig. Wortreffer PLUS zweites Signal:
--     jet · total · star · team · classic · sprint · q1 · elan
--     „Total" steht in Rechnungstexten, „JET" steckt in „Projekt",
--     „Star"/„Team"/„Classic" sind Alltagswörter.
--
--   Die Wortgrenzen macht `af_word_in_text` (v2-21) — kein neuer Code.
--
-- ⚠️ DAS ZWEITE SIGNAL PRÜFT ABSICHTLICH OHNE WORTGRENZE
--
--   `zweitsignal_woerter` wird per `strpos` gesucht, nicht per
--   `af_word_in_text`. Das ist kein Versehen. Die Wortgrenzen-Variante würde
--   „tank" in „Tankstelle" NICHT finden — die Regex verlangt hinter dem Wort
--   ein Nicht-Alphanumerisches, und dort steht ein „s“. Ausgerechnet
--   „JET Tankstelle", der Fall, für den Stufe 2 gebaut ist, fiele durch.
--   Bei einem Teilwort-Signal ist Teilwort-Suche das Richtige.
--
-- ⚠️ `DB Vertrieb` GEHÖRT NICHT IN DIE LISTE
--
--   Gemessen liegt derselbe Händler auf VIER Karten: Deutschlandticket und
--   Deutschlandticket Mama (63,00 € Abo), Privates Budget (62,24 €) und
--   Tanken (5,50 € Einzelticket). Eine pauschale Regel würde
--   Deutschlandticket-Abos auf „Tanken" umleiten. Eine Betragsschwelle wäre
--   denkbar, ist aber Raten. Entschieden: weglassen.
--
-- GEGENGEMESSEN — mit Richtig UND Falsch (§7 Regel 25 / LL-27)
--
--   Die Regel wurde gegen die Handzuordnungen des Nutzers gehalten, nicht nur
--   gegen die offenen Zahlungen:
--
--     auf „Tanken", vom Nutzer selbst gezogen   75 Treffer   ✅ Regel stimmt zu
--     auf „Privates Budget"                      2 Treffer   ❌ Regel widerspricht
--     noch offen                                65 Treffer   → das ist P3b
--
--   **97,4 % Übereinstimmung mit den eigenen Entscheidungen des Nutzers.**
--   Kein einziges Deutschlandticket ist dabei — die Auslassung von
--   `DB Vertrieb` wirkt.
--
--   Die zwei Widersprüche (ein „Agip" über 29,82 € im Januar 2026, ein
--   „RMV-HANDYTICKET" über 7,75 € im August 2026) liegen beide bereits auf
--   „Privates Budget" und werden NICHT angefasst. Für künftige Importe würde
--   die Regel solche Fälle nach „Tanken" schicken. Das ist bekannt und
--   hingenommen; rückgängig macht es ein Zug mit der Maus.
--
-- WAS DIESE MIGRATION NICHT ANFASST
--
--   Die neun Rechenfunktionen bleiben byte-identisch — `calculate_match_-
--   confidence` gehört nicht dazu, sie ordnet zu und rechnet keine Sparrate.
--   Bestehende Zuordnungen bleiben unberührt.
--
-- ============================================================================

-- ── 1 · Die Regel als Daten ─────────────────────────────────────────────────
--
-- Geschlüsselt nach KARTENNAME, nicht nach `card_id`. Eine UUID in einer
-- Konfigurationstabelle ist für einen Menschen nicht lesbar und überlebt
-- keinen Neuaufbau. Der Preis: Wird die Karte umbenannt, greift die Regel
-- still nicht mehr. Das ist in der Beschreibung vermerkt, damit es beim
-- Umbenennen auffällt.

INSERT INTO app_config (key, value, description) VALUES (
  'matching.merchant_rules',
  jsonb_build_object(
    'Tanken', jsonb_build_object(
      'eindeutig', jsonb_build_array(
        'aral','agip','esso','shell','omv','avia','hem','orlen','allguth',
        'calpam','pinoil','westfalen','raiffeisen','bft','tankstelle','station',
        'rmv','rhein-main-verkehrsverbund'),
      'mehrdeutig', jsonb_build_array(
        'jet','total','star','team','classic','sprint','q1','elan'),
      'zweitsignal_woerter', jsonb_build_array('tank','station'),
      'zweitsignal_betrag_min', 10,
      'zweitsignal_betrag_max', 150
    )
  ),
  'Händler-Wortlisten je KARTENNAME. Trifft ein Wort aus "eindeutig", gilt die '
  'Karte als erkannt; bei "mehrdeutig" braucht es zusätzlich ein Wort aus '
  '"zweitsignal_woerter" (Teilwort-Suche) oder einen Betrag im angegebenen '
  'Bereich. ACHTUNG: Der Schlüssel ist der Kartenname — wird die Karte '
  'umbenannt, greift die Regel still nicht mehr.'
) ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value, description = EXCLUDED.description;

INSERT INTO app_config (key, value, description) VALUES (
  'confidence.merchant_rule_score',
  '0.96'::jsonb,
  'Konfidenz, auf die eine Zahlung mit Händler-Treffer angehoben wird. Liegt '
  'bewusst ÜBER confidence.auto_absorption_threshold (0.95) — dadurch verlinkt '
  'process_csv_import solche Zahlungen beim Import von allein. Absenken unter '
  '0.95 macht daraus einen bloßen Vorschlag.'
) ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value, description = EXCLUDED.description;

-- ── 2 · Die Regel als Funktion ──────────────────────────────────────────────
--
-- Rückgabe 1.00 / 0.00 wie `history_match` — die Umrechnung in eine Konfidenz
-- macht der Aufrufer. So bleibt die Regel selbst prüfbar, ohne dass man die
-- Gewichtung mitdenken muss.

CREATE OR REPLACE FUNCTION public.merchant_rule_match(
  p_fragment_id uuid,
  p_card_id     uuid
)
RETURNS numeric
LANGUAGE plpgsql
STABLE
AS $function$
DECLARE
  v_desc      text;
  v_amount    numeric;
  v_transfer  text;
  v_card_name text;
  v_regel     jsonb;
  v_signal    boolean;
BEGIN
  SELECT af_normalize_text(f.description), f.amount, f.transfer_type
    INTO v_desc, v_amount, v_transfer
    FROM fragments f WHERE f.id = p_fragment_id;
  IF NOT FOUND THEN RETURN 0; END IF;

  -- §6 Stolperfalle 7: Ein Übertrag wird NIE an eine Karte verlinkt. Die
  -- Prüfung hier ist die dritte Absicherung neben RPC-Filter und Trigger —
  -- eine Regel, die Überträge hochstuft, wäre der bequemste Weg, diese
  -- Zusicherung zu unterlaufen.
  IF v_transfer IS NOT NULL THEN RETURN 0; END IF;

  SELECT c.name INTO v_card_name
    FROM cards c WHERE c.id = p_card_id AND c.deleted_at IS NULL;
  IF NOT FOUND THEN RETURN 0; END IF;

  SELECT value -> v_card_name INTO v_regel
    FROM app_config WHERE key = 'matching.merchant_rules';
  IF v_regel IS NULL OR jsonb_typeof(v_regel) <> 'object' THEN RETURN 0; END IF;

  -- Stufe 1 — ein Wortreffer genügt.
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(
                    COALESCE(v_regel -> 'eindeutig', '[]'::jsonb)) w
     WHERE af_word_in_text(w, v_desc)
  ) THEN
    RETURN 1.00;
  END IF;

  -- Stufe 2 — Wortreffer PLUS zweites Signal.
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(
                    COALESCE(v_regel -> 'mehrdeutig', '[]'::jsonb)) w
     WHERE af_word_in_text(w, v_desc)
  ) THEN
    -- Teilwort, NICHT Wortgrenze — siehe Kopfkommentar.
    v_signal := EXISTS (
      SELECT 1 FROM jsonb_array_elements_text(
                      COALESCE(v_regel -> 'zweitsignal_woerter', '[]'::jsonb)) w
       WHERE strpos(v_desc, w) > 0
    );

    IF NOT v_signal
       AND v_regel ? 'zweitsignal_betrag_min'
       AND v_regel ? 'zweitsignal_betrag_max' THEN
      v_signal := abs(v_amount)
                  BETWEEN (v_regel ->> 'zweitsignal_betrag_min')::numeric
                      AND (v_regel ->> 'zweitsignal_betrag_max')::numeric;
    END IF;

    IF v_signal THEN RETURN 1.00; END IF;
  END IF;

  RETURN 0.00;
END;
$function$;

COMMENT ON FUNCTION public.merchant_rule_match(uuid, uuid) IS
  'v2-28 P3a: Zweistufige Händler-Wortliste aus app_config. 1.00 = die Karte '
  'ist am Händler erkannt, 0.00 = nicht. Die Umrechnung in eine Konfidenz macht '
  'calculate_match_confidence.';

-- ── 3 · Der Anschluss an die Konfidenz ──────────────────────────────────────
--
-- Wortgleich die bestehende Funktion, ergänzt um DREI Stellen: zwei Variablen,
-- ein Konfigurations-Lesen und den GREATEST-Block. Sonst ist nichts verändert —
-- `pg_get_functiondef` schließt Kommentare ein, deshalb wird hier nicht
-- "aufgeräumt" (Lehre aus v2-25).

CREATE OR REPLACE FUNCTION public.calculate_match_confidence(p_fragment_id uuid, p_card_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  v_fragment    fragments%ROWTYPE;
  v_card        cards%ROWTYPE;
  v_planned     numeric;
  v_w_name      numeric;
  v_w_amount    numeric;
  v_w_freq      numeric;
  v_min_thresh  numeric;
  v_hist_score  numeric;
  v_merch_score numeric;
  v_name_sim    numeric;
  v_amount_sim  numeric;
  v_freq_sim    numeric;
  v_hist        numeric;
  v_merch       numeric;
  v_score       numeric;
BEGIN
  SELECT * INTO v_fragment FROM fragments WHERE id = p_fragment_id;
  IF NOT FOUND THEN RETURN 0; END IF;

  SELECT * INTO v_card FROM cards WHERE id = p_card_id;
  IF NOT FOUND THEN RETURN 0; END IF;
  IF v_card.deleted_at IS NOT NULL THEN RETURN 0; END IF;

  SELECT (value::text)::numeric INTO v_w_name
    FROM app_config WHERE key = 'confidence.weight_name';
  SELECT (value::text)::numeric INTO v_w_amount
    FROM app_config WHERE key = 'confidence.weight_amount';
  SELECT (value::text)::numeric INTO v_w_freq
    FROM app_config WHERE key = 'confidence.weight_frequency';
  SELECT (value::text)::numeric INTO v_min_thresh
    FROM app_config WHERE key = 'confidence.minimum_match_threshold';
  SELECT (value::text)::numeric INTO v_hist_score
    FROM app_config WHERE key = 'confidence.history_score';
  SELECT (value::text)::numeric INTO v_merch_score
    FROM app_config WHERE key = 'confidence.merchant_rule_score';

  v_w_name      := COALESCE(v_w_name,     0.50);
  v_w_amount    := COALESCE(v_w_amount,   0.30);
  v_w_freq      := COALESCE(v_w_freq,     0.20);
  v_min_thresh  := COALESCE(v_min_thresh, 0.20);
  v_hist_score  := COALESCE(v_hist_score, 0.94);
  v_merch_score := COALESCE(v_merch_score, 0.96);

  v_planned := get_planned_amount_for_month(
    p_card_id,
    date_trunc('month', v_fragment.transaction_date)::date
  );

  v_name_sim   := name_similarity_scoped(v_fragment.description, p_card_id);
  v_amount_sim := amount_match(v_fragment.amount, v_planned);
  v_freq_sim   := frequency_match(v_fragment.transaction_date, p_card_id);

  v_score := v_w_name * v_name_sim
           + v_w_amount * v_amount_sim
           + v_w_freq * v_freq_sim;

  v_hist := history_match(p_fragment_id, p_card_id);
  IF v_hist > 0 THEN
    v_score := GREATEST(v_score, v_hist_score);
  END IF;

  -- v2-28 P3a: die Händler-Regel. Steht bewusst NACH der Historie und benutzt
  -- dasselbe GREATEST — die Reihenfolge ist damit ohne Wirkung, es gewinnt
  -- schlicht der höchste Wert. Beide heben nur an und senken nie: Eine Regel,
  -- die eine gute Namensübereinstimmung nach unten zieht, wäre eine
  -- Verschlechterung, die niemand suchen würde.
  v_merch := merchant_rule_match(p_fragment_id, p_card_id);
  IF v_merch > 0 THEN
    v_score := GREATEST(v_score, v_merch_score);
  END IF;

  IF v_score < v_min_thresh THEN
    RETURN 0;
  END IF;

  RETURN round(v_score, 4);
END;
$function$;
