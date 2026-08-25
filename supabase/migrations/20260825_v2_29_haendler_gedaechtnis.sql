-- ============================================================================
-- Sprint v2-29 — Die App merkt sich, was du entschieden hast
-- ============================================================================
--
-- ANLASS
--
--   `history_match` erkennt eine frühere Handzuordnung nur bei WORTGLEICHER
--   Beschreibung. Bei Kartenzahlungen steht das Buchungsdatum im Text:
--
--     'Agip | VISA Debitkartenumsatz vom 28.01.2026'
--     'Agip | VISA Debitkartenumsatz vom 09.02.2026'
--
--   Es sind also nie zwei gleich, und die eigenen Entscheidungen des Nutzers
--   übertragen sich nie. 303 Fragmente im Bestand tragen dieses Muster.
--
--   Dieselbe Wirkung hat jede wechselnde Kennung, auch ohne Datum:
--   'Audible Gmbh*YG4WQ1N95' · 'MPREIS FIL 8198' ·
--   'Vers-Nr:00008386058-Ihr Beitrag:06.26'.
--
-- WIE DER HÄNDLER GEWONNEN WIRD — GEMESSEN, NICHT GERATEN
--
--   Fünf Wege wurden gegen DIESELBE Messung gehalten: Leave-one-out über die
--   568 Handzuordnungen des Nutzers, mit Richtig UND Falsch (§7 Regel 25):
--
--     Text vor dem ersten '|'                      147 richtig / 17 falsch
--     Text vor dem ersten '|', nur Buchstaben      152 / 21
--     ganzer Text, alle Ziffern raus       -->     257 / 24   (91,5 %)
--     dito, Wörter unter 3 Zeichen raus            262 / 26   (91,0 %)
--     erste 3 bzw. 5 Wörter                        203 / 22 · 202 / 22
--
--   Gewonnen hat die EINFACHSTE Regel, und zwar auf beiden Achsen zugleich.
--   Sie muss nichts über Datumsformate wissen: Das Datum verschwindet, weil es
--   aus Ziffern besteht — und mit ihm jede Kundennummer und jede
--   Transaktions-ID. Die naheliegende Variante "Text vor dem ersten |"
--   scheitert an genau den Fällen ohne '|'.
--
--   Die Variante mit 262 Treffern braucht zusätzlich eine Wortlängen-Grenze,
--   für die es keine Begründung gibt außer dem Messwert — und sie ist ungenauer.
--   Eine Regel, deren Schwelle niemand erklären kann, wird beim nächsten Mal
--   falsch gepflegt.
--
-- ⚠️ ERGÄNZEN, NICHT ERSETZEN — UND DIE ZAHL, DIE ES ENTSCHEIDET
--
--   Die reine Händler-Regel ist deutlich genauer (91,5 % gegen 77,4 %). Sie
--   allein einzusetzen wäre trotzdem falsch gewesen:
--
--     131 der 136 heute sichtbaren 2025-Vorschläge kommen aus der Historie
--     35 davon haben mit dem GRÖBEREN Schlüssel keinen eindeutigen Treffer mehr
--
--   Der Händler-Schlüssel fasst mehr Buchungen zusammen und wird dadurch öfter
--   mehrdeutig. Ein ersatzloser Austausch hätte die Zahl im Prüfanker erst
--   GESENKT, bevor sie steigt. Deshalb zwei Stufen:
--
--                    richtig   falsch   Regression   2025 sichtbar
--     heute            180       76         —            136
--     nur Händler      257       24        17           ~160
--     BEIDE            274       80         0            195
--
--   Von den 80 Fehlern sind 76 schon heute da. Der Sprint verschlechtert nichts.
--
-- ⚠️ WARUM STUFE 2 NICHT GEPRÜFT WIRD, WENN STUFE 1 GREIFT
--
--   Wenn der Händler eindeutig auf Karte A zeigt, liegen ALLE anderen Fragmente
--   dieses Händlers auf A. Ein wortgleicher Text ist eine Teilmenge davon, kann
--   also nie eine andere Karte liefern. Die Reihenfolge verliert damit nichts —
--   sie spart nur eine Abfrage.
--
-- ⚠️ WAS DIESE MIGRATION NICHT ANFASST
--
--   `calculate_match_confidence` bleibt BYTE-IDENTISCH (belegt: Prüfsumme
--   defa3e43f468e51946362a15ee943c9f vor und nach dieser Migration). Sie ruft
--   `history_match` unverändert auf und zieht die Konfidenz mit demselben
--   GREATEST hoch wie bisher — auf `confidence.history_score` = 0,94 und damit
--   bewusst UNTER der Auto-Absorptions-Schwelle 0,95. Es wird NICHTS
--   automatisch verlinkt.
--
--   Ebenso unberührt: `frequency_match` (ZO-1 bleibt offen — sie zu ändern
--   verschiebt alle Scores gleichzeitig, und zwei Verschiebungen in einem Sprint
--   lassen sich hinterher nicht auseinanderhalten), `merchant_rule_match` aus
--   v2-28 und alle neun Rechenfunktionen. Gemessen: 18 von 19 Prüfsummen
--   identisch, nur `history_match` bewegt sich.
--
-- ============================================================================

-- ── 1 · Der Händler-Schlüssel ───────────────────────────────────────────────
--
-- Setzt auf `af_normalize_text` (v2-21) auf: kleinschreiben, Umlaute auflösen,
-- ß→ss. Danach wird jede Folge von Nicht-Buchstaben zu EINEM Leerzeichen.
--
-- Warum ein einziges regexp_replace genügt: '[^a-z]+' erfasst maximale Folgen,
-- und ein Leerzeichen ist selbst ein Nicht-Buchstabe. Es können also gar keine
-- doppelten Leerzeichen entstehen, die man hinterher zusammenziehen müsste.
-- Gegen den vollen Bestand geprüft: 0 Abweichungen zur zweistufigen Messfassung
-- über alle 1.599 Fragmente.
--
-- IMMUTABLE ist hier keine Kosmetik, sondern Voraussetzung: Ohne sie lässt sich
-- der Ausdrucks-Index unten nicht anlegen.
--
-- ⚠️ `public.` vor `af_normalize_text` ist PFLICHT, nicht Stilfrage.
--
--   Beim Anlegen des Index bettet Postgres diese SQL-Funktion in den
--   Index-Ausdruck ein (Inlining) — und wertet sie dabei unter einem anderen
--   `search_path` aus als im normalen Betrieb. Ohne Schema-Qualifizierung
--   scheitert das Anlegen mit `42883: function af_normalize_text(text) does
--   not exist`, obwohl die Funktion existiert und jeder direkte Aufruf
--   funktioniert. Genau so ist es im Trockenlauf zu diesem Sprint passiert —
--   und genau dafür gibt es ihn.

CREATE OR REPLACE FUNCTION public.af_merchant_key(p_text text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 PARALLEL SAFE
AS $function$
  SELECT btrim(regexp_replace(public.af_normalize_text(p_text), '[^a-z]+', ' ', 'g'))
$function$;

COMMENT ON FUNCTION public.af_merchant_key(text) IS
  'v2-29: Der stabile Teil eines Buchungstextes. Alle Ziffern und Sonderzeichen '
  'werden zu Leerzeichen, der Rest ist der Händler. Damit fallen Buchungsdatum, '
  'Kundennummer und Transaktions-ID von selbst weg, ohne dass die Regel ein '
  'Format kennen muss. Gemessen gegen 568 Handzuordnungen: 91,5 % richtig.';

-- ── 2 · Der Index ───────────────────────────────────────────────────────────
--
-- ⚠️ OHNE DIESEN INDEX IST DIE FUNKTION UNBENUTZBAR.
--
--   Der Schlüssel ist ein berechneter Ausdruck. Ohne Index kostet EIN Aufruf
--   14,9 ms — ein Seq Scan über 1.599 Fragmente, der für jede Zeile ein
--   regexp_replace ausführt. `refresh_fragment_suggestions` ruft
--   `calculate_match_confidence` für jede offene Zahlung × jede aktive Karte
--   auf; bei 480 × ~30 wären das rund 14.000 Aufrufe und über drei Minuten.
--
--   Gemessen NACH dem Index: 0,208 ms je Aufruf. Faktor 72.
--
--   Das ist LL-29 in seiner allgemeinen Form: erst zählen, wie oft gefragt
--   wird, dann die Frage optimieren.
--
--   `user_id` steht vorne, weil die Abfrage zuerst danach filtert (§6
--   Stolperfalle 4: wer über den Nutzer aggregiert, braucht den Nutzer).

CREATE INDEX IF NOT EXISTS idx_fragments_merchant_key
  ON public.fragments (user_id, public.af_merchant_key(description));

COMMENT ON INDEX public.idx_fragments_merchant_key IS
  'v2-29: trägt Stufe 1 von history_match. Ohne ihn kostet ein Aufruf 14,9 ms '
  'statt Bruchteilen davon — bei ~14.000 Aufrufen je Nachrechnen-Lauf ist das '
  'der Unterschied zwischen Sekunden und Minuten.';

-- ── 3 · Die Wiedererkennung, zweistufig ─────────────────────────────────────
--
-- Die drei Filter der bisherigen Fassung bleiben in BEIDEN Stufen erhalten und
-- sind nicht verhandelbar:
--
--   l.origin = 'MANUAL_DROP'   Es wird ausschließlich aus dem gelernt, was der
--                              Nutzer SELBST gezogen hat. 110 Verknüpfungen
--                              sind automatisch gesetzt, 65 davon hat v2-28
--                              gerade erst auf „Tanken" gelegt. Lernte die
--                              Funktion daraus, verstärkte die Automatik ihre
--                              eigene Vermutung, und der Fehler wüchse mit
--                              jedem Import. v2-27 hat aus genau diesem Grund
--                              bewusst mit AUTO_ABSORBED geschrieben.
--
--   f.transfer_type IS NULL    Ein Übertrag wird nie an eine Karte verlinkt
--                              (§6 Stolperfalle 7).
--
--   f.id <> p_fragment_id      Das geprüfte Fragment gehört nicht in seine
--                              eigene Lernmenge — sonst schlüge die Funktion
--                              jedem verlinkten Fragment seine eigene Karte
--                              vor. Derselbe Ausschluss macht die
--                              Leave-one-out-Messung überhaupt erst ehrlich
--                              (§7 Regel 25).
--
-- ⚠️ Der Funktionsrumpf unten steht WORTGLEICH so in Produktion — Kommentare
--    eingeschlossen. `pg_get_functiondef` schließt sie ein, also verändert
--    jedes nachträgliche "Aufräumen" hier die Prüfsumme, ohne dass sich das
--    Verhalten ändert (Lehre aus v2-25). Wer etwas ergänzen will, spielt die
--    Datei danach erneut ein und vergleicht die Prüfsumme.
--    Stand nach dieser Migration: 99aa12b889a18691917c7c7e93f191f6

CREATE OR REPLACE FUNCTION public.history_match(p_fragment_id uuid, p_card_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  v_desc    text;
  v_user_id uuid;
  v_key     text;
  v_karten  integer;
  v_treffer integer;
BEGIN
  SELECT f.description, f.user_id INTO v_desc, v_user_id
    FROM fragments f WHERE f.id = p_fragment_id;
  IF NOT FOUND THEN RETURN 0; END IF;

  -- Stufe 1 — derselbe Händler, und zwar EINDEUTIG.
  -- Beide Zahlen kommen aus EINER Abfrage: wie viele verschiedene Karten der
  -- Händler trägt, und ob die gefragte darunter ist.
  v_key := af_merchant_key(v_desc);

  IF v_key <> '' THEN
    SELECT count(DISTINCT l.card_id),
           count(*) FILTER (WHERE l.card_id = p_card_id)
      INTO v_karten, v_treffer
      FROM fragments f
      JOIN card_fragment_links l ON l.fragment_id = f.id
     WHERE f.user_id       = v_user_id
       AND af_merchant_key(f.description) = v_key
       AND f.id           <> p_fragment_id
       AND f.transfer_type IS NULL
       AND l.origin        = 'MANUAL_DROP'::link_origin;

    IF v_karten = 1 THEN
      RETURN CASE WHEN v_treffer > 0 THEN 1.00 ELSE 0.00 END;
    END IF;

    -- Mehr als eine Karte: SCHWEIGEN und auf Stufe 2 durchfallen. Gemessen
    -- liegt die Trefferquote bei mehrdeutigen Händlern bei 52,7 % — ein
    -- Münzwurf. Häufigster Grund: Bei Überweisungen steht vorne der Absender,
    -- nicht der Händler; "Dominik Hecker" liegt auf zwölf Karten.
  END IF;

  -- Stufe 2 — wortgleich, unverändert seit v2-21 P2.
  SELECT count(*) INTO v_treffer
    FROM fragments f
    JOIN card_fragment_links l ON l.fragment_id = f.id
   WHERE f.user_id       = v_user_id
     AND f.description   = v_desc
     AND f.id           <> p_fragment_id
     AND f.transfer_type IS NULL
     AND l.card_id       = p_card_id
     AND l.origin        = 'MANUAL_DROP'::link_origin;

  RETURN CASE WHEN v_treffer > 0 THEN 1.00 ELSE 0.00 END;
END;
$function$;

COMMENT ON FUNCTION public.history_match(uuid, uuid) IS
  'v2-29: Wurde dieser HÄNDLER schon einmal VON HAND dieser Karte zugeordnet? '
  'Stufe 1 vergleicht af_merchant_key und antwortet nur, wenn der Händler auf '
  'genau EINER Karte liegt; sonst fällt sie auf den wortgleichen Vergleich aus '
  'v2-21 zurück. Lernt weiterhin nicht aus AUTO_ABSORBED (Selbstverstärkung), '
  'nicht aus Überträgen und nicht aus dem geprüften Fragment selbst. '
  'Leave-one-out über 568 Handzuordnungen: 274 richtig / 80 falsch, keine '
  'Regression gegenüber der bisherigen Fassung.';
