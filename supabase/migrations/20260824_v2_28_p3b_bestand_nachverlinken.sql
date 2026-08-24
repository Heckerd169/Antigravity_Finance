-- ============================================================================
-- Sprint v2-28 · P3b — Den Bestand 2025 nachverlinken
-- ============================================================================
--
-- WAS HIER PASSIERT
--
--   P3a hat die Händler-Regel angelegt und `calculate_match_confidence`
--   beigebracht, sie zu lesen. Ab dem nächsten CSV-Import verlinkt
--   `process_csv_import` solche Zahlungen von allein — für das, was bereits
--   in der Rohmasse liegt, tut es das nicht. Diese Migration holt das nach.
--
--   **Gemessen: 65 offene Zahlungen aus 2025, zusammen 1.520,22 €.**
--   Die Rohmasse 2025 wird damit um rund ein Zehntel leichter.
--
-- ⚠️ WARUM DIESE MIGRATION DIE FUNKTION AUFRUFT, STATT DIE LISTE ZU WIEDERHOLEN
--
--   Die Auswahl steht hier NICHT als Wortliste, sondern als
--   `calculate_match_confidence(f.id, v_tanken) >= <Schwelle aus app_config>`.
--
--   Eine zweite Formulierung derselben Regel wäre die Form „Nachbauen" aus
--   LL-26 — genau das, was in v2-20 passiert ist, als `page.tsx` das Lösch-Tor
--   nachbaute und streng blieb, während die Datenbank großzügiger wurde. Wer
--   die Liste später pflegt, pflegt sie an EINER Stelle.
--
--   Nebenwirkung, die man kennen muss: Diese Migration ist damit **nicht
--   reproduzierbar ohne P3a**. Das ist gewollt — sie gehört hinter sie.
--
-- ⚠️ DIE ZAHL 65 STEHT ALS RIEGEL IM CODE, NICHT ALS BEMERKUNG
--
--   Weicht die tatsächliche Trefferzahl ab, bricht die Migration mit Rollback
--   ab, statt „irgendetwas" zu verlinken. Der Nutzer kuratiert weiter; zwischen
--   Messung und Anwendung können Zahlungen zugeordnet worden sein. Dann ist
--   Anhalten und neu messen richtig — nicht stillschweigend eine andere Menge
--   anfassen. Dieselbe Haltung wie bei der Anker-Messregel: gegen den eigenen
--   Vorher-Wert prüfen, nicht gegen eine Tabelle von letzter Woche.
--
-- WAS UNBERÜHRT BLEIBT
--
--   Nur Zahlungen OHNE bestehende Verknüpfung werden angefasst — weder eine
--   Karten- noch eine Einkommens-Zuordnung wird aufgehoben. Die neun
--   RMV-Fahrten, die der Nutzer selbst auf „Tanken" gezogen hat, bleiben
--   `MANUAL_DROP`. Die zwei Zahlungen, die er bewusst auf „Privates Budget"
--   gelegt hat, bleiben dort. 2026 wird nicht berührt — und das ist hier
--   ohnehin gegenstandslos: Es gibt in 2026 **keine einzige** offene Zahlung,
--   auf die die Regel passt.
--
-- ⚠️ DIE SPARRATE BEWEGT SICH NICHT — UND DAS IST EINE AUSSAGE ÜBER BUDGET
--
--   „Tanken" ist eine **BUDGET**-Karte. Sie zeigt den Plan, solange die
--   Ausgaben darunter liegen (Design-Doku §4.3.2 · LL-12). Der Plan steht bei
--   240,00 € je Monat.
--
--   Nach der Verlinkung ergeben sich diese Monatssummen:
--
--     01  129,56    04  149,43    07  239,21    10  126,93
--     02  174,24    05  112,21    08  218,73    11  159,50
--     03  157,35    06   72,91    09  191,94    12  209,36
--
--   **Kein Monat überschreitet 240,00 €** — die Karte bleibt in allen zwölf
--   Monaten beim Plan, die Sparrate bewegt sich um 0,00 €.
--
--   **Der Juli ist dabei knapper, als das Briefing annahm: 239,21 € gegen
--   240,00 €, also 79 Cent Luft.** Das Briefing nannte 199,21 € — es rechnete
--   ohne die 40,00-€-RMV-Fahrt vom 02.07., weil der Nahverkehr erst nach jener
--   Messung dazukam. Die Aussage „bewegt keine Zahl" hält; der Spielraum ist
--   nur klein. Eine einzige nachträglich zugeordnete Tankfüllung im Juli kippt
--   den Monat in ÜBERSCHRITTEN — und DANN bewegt sich die Sparrate.
--
-- ============================================================================

DO $$
DECLARE
  v_user    uuid;
  v_tanken  uuid;
  v_auto    numeric;
  v_anzahl  int;
  v_erwartet CONSTANT int := 65;
BEGIN
  SELECT id, user_id INTO STRICT v_tanken, v_user
    FROM cards WHERE name = 'Tanken' AND deleted_at IS NULL;

  -- Die Schwelle kommt aus der Konfiguration, nicht aus dem Code (§7 Regel 5).
  -- Wer `confidence.merchant_rule_score` unter die Auto-Schwelle senkt, will
  -- KEINE automatische Verlinkung — dann darf diese Migration auch nichts
  -- verlinken, und genau das passiert dann von allein.
  SELECT (value::text)::numeric INTO v_auto
    FROM app_config WHERE key = 'confidence.auto_absorption_threshold';
  v_auto := COALESCE(v_auto, 0.95);

  INSERT INTO card_fragment_links (user_id, card_id, fragment_id, month, origin)
  SELECT v_user,
         v_tanken,
         f.id,
         -- §6 Stolperfalle 6: `month` ist das Link-Month, die
         -- Periodenabgrenzung. Für eine Nachverlinkung ohne Nutzer-Geste ist
         -- der Buchungsmonat der einzig vertretbare Wert — und es ist genau
         -- der, den `process_csv_import` beim Auto-Absorbieren setzt.
         date_trunc('month', f.transaction_date)::date,
         'AUTO_ABSORBED'::link_origin
    FROM fragments f
   WHERE f.user_id = v_user
     AND f.transaction_date >= DATE '2025-01-01'
     AND f.transaction_date <  DATE '2026-01-01'
     AND f.transfer_type IS NULL
     AND NOT EXISTS (SELECT 1 FROM card_fragment_links   l  WHERE l.fragment_id  = f.id)
     AND NOT EXISTS (SELECT 1 FROM income_fragment_links il WHERE il.fragment_id = f.id)
     AND calculate_match_confidence(f.id, v_tanken) >= v_auto;

  GET DIAGNOSTICS v_anzahl = ROW_COUNT;

  IF v_anzahl <> v_erwartet THEN
    RAISE EXCEPTION
      'v2-28 P3b: % Zahlungen getroffen, erwartet waren %. Abgebrochen und '
      'zurückgerollt — zwischen Messung und Anwendung hat sich der Bestand '
      'geändert. Neu messen, Erwartung anpassen, dann erneut anwenden.',
      v_anzahl, v_erwartet;
  END IF;

  RAISE NOTICE 'v2-28 P3b: % Zahlungen aus 2025 auf "Tanken" verlinkt.', v_anzahl;
END $$;
