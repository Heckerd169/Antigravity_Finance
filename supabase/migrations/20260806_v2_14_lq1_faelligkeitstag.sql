-- ─────────────────────────────────────────────────────────────────────────────
-- Sprint v2-14 · LQ-1 — Fälligkeitstag je Karte
--
-- Befund:  V2/befunde_2026-08-05_liquiditaet.md §L2 („Karten haben keinen
--          Fälligkeitstag", dort als BLOCKER für die Liquiditäts-Idee geführt)
-- Roadmap: Paket 3 · LQ-1
--
-- ── WARUM ────────────────────────────────────────────────────────────────────
--
-- `cards` trägt Frequenz und ersten aktiven Monat — das legt den MONAT fest, nie
-- den TAG. Die Frage „was ist bis zum Stichtag noch fällig?" ist damit heute
-- nicht formulierbar. Gemessen für August 2026: 1.814,02 € feste Abbuchungen
-- stehen aus, bei zuletzt bekanntem Kontostand von 254,97 €.
--
-- Diese Migration legt das Feld an UND füllt es aus der Buchungshistorie. Die
-- Anzeige (LQ-2) und eine Oberfläche zum Ändern sind ausdrücklich NICHT Teil
-- dieses Sprints — sie hängen an einer offenen Gestaltungsfrage.
--
-- ── WIE DIE WERTE ENTSTANDEN SIND ────────────────────────────────────────────
--
-- Nicht geschätzt, sondern aus `fragments` abgeleitet (Messung 06.08.2026):
-- je Karte die Verteilung der Buchungstage über die gesamte Historie. Für die
-- vier GEMEINSAM-Karten stammen die Belege aus der noch unzugeordneten Rohmasse
-- (sie haben per BF-4-Befund keine verknüpften Fragmente), eindeutig über den
-- Verwendungszweck „(Domi)" identifiziert.
--
-- ZWEI ENTSCHEIDUNGEN, die in den Zahlen stecken:
--
-- ① Gespeichert wird der SOLL-Tag, nicht der Median der Buchungstage.
--    Sieben Karten zeigen über 19 Monate exakt dasselbe Muster: gebucht am 1.,
--    2., 3. oder 4. — NIE früher. Das ist ein Dauerauftrag zum Ersten, der auf
--    den nächsten Bankarbeitstag rutscht. Der Fälligkeitstag ist die 1.
--
-- ② Bei Streuung gewinnt der FRÜHERE Tag (Modus, nicht Median). Für eine
--    Liquiditätsfrage ist die vorsichtige Annahme die, bei der das Geld früher
--    abfließt.
--
-- ── WARUM BUDGET-KARTEN LEER BLEIBEN ─────────────────────────────────────────
--
--    Tanken           17 Belege, Spanne 1.–31.
--    Privates Budget  28 Belege, Spanne 1.–28.
--    Haushaltsgeld     3 Belege, Spanne 1.–29.
--
-- Das ist kein verrauschter Termin, sondern keiner. Deckt sich mit Befund L7:
-- ein Dauerauftrag ist ein Termin, ein Budget eine Erlaubnis ohne Termin.
-- `due_day` bleibt dort NULL — und NULL ist hier ein Wert, keine Lücke.
--
-- ── PRÜFANKER (VOR der Anwendung festgelegt) ─────────────────────────────────
--
-- KEINE Zahl darf sich bewegen. Eine neue Spalte plus Werte berührt keine
-- Rechenfunktion; alle zwölf Monate 2026 müssen vorher wie nachher identisch
-- sein, Ist UND Plan:
--
--   Jan–Apr 1.931,18 · Mai −86,77 · Jun 4.208,76 (Plan 4.220,53)
--   Jul −322,75 (Plan 55,44) · Aug 1.761,08 · Sep–Dez 1.824,08
--
-- Bewegt sich etwas → zurückrollen, nicht erklären.
--
-- NICHT GEÄNDERT: keine Rechenfunktion, keine RPC, keine bestehende Spalte,
-- kein Constraint an anderer Stelle, keine Zeile außerhalb von `cards.due_day`.
-- ─────────────────────────────────────────────────────────────────────────────

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1 · Die Spalte
--
-- NULL ist ausdrücklich erlaubt und der richtige Zustand für: Budget-Karten,
-- Karten ohne Datengrundlage (heute: Friseur) und jede künftige Karte, deren
-- Rhythmus noch unbekannt ist.
--
-- Grenze 1–31, nicht 1–28: Ein Dauerauftrag zum 31. existiert. Die Klammerung
-- auf die tatsächliche Monatslänge (Februar!) gehört in die Vorhersage-Logik
-- von LQ-2, nicht in die Spalte — sonst wäre der gespeicherte Wert bereits eine
-- Interpretation.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS due_day smallint;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.cards'::regclass AND conname = 'cards_due_day_range'
  ) THEN
    ALTER TABLE public.cards ADD CONSTRAINT cards_due_day_range
      CHECK (due_day IS NULL OR (due_day BETWEEN 1 AND 31));
  END IF;
END $$;

COMMENT ON COLUMN public.cards.due_day IS
  'Tag im Monat, an dem die Karte fällig ist (1–31). NULL = kein Termin — so bei '
  'BUDGET-Karten (ein Budget ist eine Erlaubnis ohne Termin, Befund L7) und bei '
  'Karten ohne Buchungshistorie. Gespeichert wird der SOLL-Tag, nicht der reale '
  'Buchungstag: Daueraufträge zum Ersten rutschen auf den nächsten Bankarbeitstag. '
  'v2-14 (LQ-1).';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2 · Die Werte aus der Historie
--
-- Idempotent über `due_day IS NULL`: Ein zweiter Lauf überschreibt nichts, und
-- eine spätere Korrektur von Hand bleibt stehen.
--
-- Abgleich über Name UND Typ — „Handyvertrag" (FIXED_COST) und „Handyvertrag -
-- Aline" (INCOME) sowie „iCloud" und „iCloud - Anteil Mama" sind verschiedene
-- Karten mit ähnlichen Namen.
--
-- Auf der Übungs-Datenbank trifft keiner dieser Namen zu — dort aktualisiert
-- der Block 0 Zeilen. Das ist gewollt: geprüft wird die Mechanik, nicht der
-- Inhalt.
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE public.cards c
   SET due_day = v.tag
  FROM (VALUES
    -- ── Das Dauerauftrags-Bündel zum Ersten ──────────────────────────────────
    -- Alle sieben zeigen über 19 Monate exakt dieselben Buchungsdaten
    -- (1./2./3./4., nie früher) — ein Lastlauf, der aufs Bankarbeitstag rutscht.
    ('Miete',                               'FIXED_COST',  1),  -- 19 Belege, 1.–4.
    ('Strom - Mainova',                     'FIXED_COST',  1),  -- 19 Belege, 1.–4.
    ('Internet - Vodafone',                 'FIXED_COST',  1),  -- 19 Belege, 1.–4.
    ('Rechtsschutz - Adam Riese',           'FIXED_COST',  1),  -- 19 Belege, 1.–4.
    ('Berufsunfähigkeit - Alte Leipziger',  'FIXED_COST',  1),  -- 19 Belege, 1.–4.
    ('Private Altersvorsorge - Nürnberger', 'FIXED_COST',  1),  -- 19 Belege, 1.–4.
    ('Essen gehen',                         'FIXED_COST',  1),  -- 19 Belege, 1.–4.

    -- ── Abos mit festem Abbuchungstag ────────────────────────────────────────
    ('Audible',                             'FIXED_COST',  1),  -- 10 Belege, 1.–2.
    ('Spotify',                             'FIXED_COST',  3),  -- 19 Belege, 3.–5.
    ('Netflix',                             'FIXED_COST',  4),  -- 19 Belege, ausnahmslos 4.
    ('iCloud',                              'FIXED_COST', 20),  --  2 Belege, beide 20.

    -- ── Schwankend — Modus gewählt, frühester plausibler Tag ─────────────────
    ('Handyvertrag',                        'FIXED_COST', 15),  -- 19 Belege, 13.–17. (congstar, rechnungsgetrieben)
    ('ANTHROPIC - CLAUDE Abo',              'FIXED_COST', 23),  --  3 Belege, 23.–27.
    ('Fitnessstudio',                       'FIXED_COST', 23),  -- 19 Belege, 23.–30.

    -- ── Dünn belegt — bewusst gesetzt, bei Bedarf von Hand korrigieren ───────
    ('Deutschlandticket',                   'FIXED_COST', 16),  --  1 Beleg (16.07.2026); DB-Abo, Termin nicht unabhängig bestätigt

    -- ── Einnahmen ───────────────────────────────────────────────────────────
    ('Handyvertrag - Aline',                'INCOME',      1),  --  2 Belege, beide 1.
    ('iCloud - Anteil Mama',                'INCOME',     27)   --  2 Belege, 27. und 29.

    -- NICHT gesetzt:
    --   Friseur (FIXED_COST) — 0 Belege. Ein geratener Tag wäre schlechter als
    --     kein Tag; sobald eine Buchung zugeordnet ist, nachtragbar.
    --   Tanken · Privates Budget · Haushaltsgeld (BUDGET) — kein Termin, s. o.
  ) AS v(kartenname, kartentyp, tag)
 WHERE c.name = v.kartenname
   AND c.type::text = v.kartentyp
   AND c.deleted_at IS NULL
   AND c.due_day IS NULL;

COMMIT;
