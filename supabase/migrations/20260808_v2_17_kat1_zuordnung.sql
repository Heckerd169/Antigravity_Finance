-- ═══════════════════════════════════════════════════════════════════════════
-- v2-17 · KAT-1 — Erstzuordnung der Bestandskarten
-- Quelle: V2/design_direktor_2026-08-07_kategorien.md §A3
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Der Schnitt stammt vom User selbst, in zwei Runden nachgeschärft. Er ist
-- NICHT zu erraten und NICHT abzuleiten — die Liste unten ist die Liste aus
-- dem Record, gegen den Kartenbestand vom 08.08.2026 abgeglichen.
--
-- Beschluss der Ideen-Runde (04.08.2026): „Wer erstellt den initialen
-- Kategorien-Vorschlag? Der Arbeits-Agent im Chat, aus drei Monaten Umsätzen —
-- NICHT ein Algorithmus in der App." Deshalb steht die Zuordnung hier als
-- Datenmigration und nicht als Heuristik im Code.
--
-- ZEHN Kategorien, nicht elf. „Einkommen" aus §A3 trägt ausschließlich das
-- Nettogehalt, und das ist keine Karte — es ist ein Sammelbecken der Anzeige,
-- genau wie „Ohne Kategorie" (A4 / B6). Beide sind bewusst KEINE Tabellenzeile:
-- Eine leere Kategorie soll gar nicht erst entstehen können (B8).
--
-- IDEMPOTENT: Kategorien über ON CONFLICT, Karten nur dort, wo noch keine
-- Zuordnung steht. Ein zweiter Lauf überschreibt also keine Handarbeit.
--
-- Läuft über ALLE Profile statt gegen eine feste user_id — die App hat einen
-- Nutzer, aber eine eingebrannte UUID in einer Migration ist ein Fehler, der
-- erst beim zweiten Nutzer auffällt.
-- ═══════════════════════════════════════════════════════════════════════════

DO $migration$
DECLARE
  v_user     record;
  v_kat      record;
  v_zuordnung_gesamt int := 0;
  v_zuordnung_user   int;

  -- C2: die Reihenfolge aus §A3. Zehnerschritte, damit später etwas
  -- dazwischenpasst, ohne alles neu zu nummerieren.
  c_kategorien constant text[][] := ARRAY[
    ['Wohnen',                  '10'],
    ['Lebensmittel',            '20'],
    ['Mobilität',               '30'],
    ['Abos & Mitgliedschaften', '40'],
    ['Versicherungen',          '50'],
    ['Hobby',                   '60'],
    ['Urlaub',                  '70'],
    ['Geschenke & Anlässe',     '80'],
    ['Persönliches',            '90'],
    ['Rückflüsse',             '100']
  ];
BEGIN
  FOR v_user IN SELECT user_id FROM profiles LOOP

    -- ── Die zehn Ordner anlegen ────────────────────────────────────────────
    FOR i IN 1 .. array_length(c_kategorien, 1) LOOP
      INSERT INTO card_categories (user_id, name, sort_order)
      VALUES (
        v_user.user_id,
        c_kategorien[i][1],
        c_kategorien[i][2]::smallint
      )
      ON CONFLICT (user_id, lower(name)) DO NOTHING;
    END LOOP;

    -- ── Karten zuordnen, ausschließlich über den exakten Namen ─────────────
    -- Zwei Karten heißen gleich und werden beide getroffen — das ist gewollt:
    --   · „Fahrradzubehör" existiert zweimal (34,69 € und 305,45 €) → Hobby
    --   · „Inspektion Auto - Aline" existiert als FIXED_COST und als INCOME
    --     → beide nach Mobilität, denn §A3 sagt „Inspektion Auto (+ Erstattung)"
    --
    -- A5: Erstattungen liegen bei ihrer Ausgabe, nicht in „Rückflüsse".
    -- „Handyvertrag - Aline" und „iCloud - Anteil Mama" gehören deshalb nach
    -- Abos & Mitgliedschaften — der Ordner zeigt den Saldo. In „Rückflüsse"
    -- bleibt nur, was zu keiner Ausgabe gehört.
    WITH mapping(card_name, kategorie) AS (
      VALUES
        ('Miete',                                            'Wohnen'),
        ('Strom - Mainova',                                  'Wohnen'),
        ('Internet - Vodafone',                              'Wohnen'),

        ('Haushaltsgeld',                                    'Lebensmittel'),

        ('Deutschlandticket',                                'Mobilität'),
        ('Tanken',                                           'Mobilität'),
        ('Autoreifen',                                       'Mobilität'),
        ('Inspektion Auto',                                  'Mobilität'),
        ('Inspektion Auto - Aline',                          'Mobilität'),

        ('ANTHROPIC - CLAUDE Abo',                           'Abos & Mitgliedschaften'),
        ('Audible',                                          'Abos & Mitgliedschaften'),
        ('iCloud',                                           'Abos & Mitgliedschaften'),
        ('Netflix',                                          'Abos & Mitgliedschaften'),
        ('Spotify',                                          'Abos & Mitgliedschaften'),
        ('Handyvertrag',                                     'Abos & Mitgliedschaften'),
        ('Fitnessstudio',                                    'Abos & Mitgliedschaften'),
        ('ADAC Mitgliedsbeitrag',                            'Abos & Mitgliedschaften'),
        ('Handyvertrag - Aline',                             'Abos & Mitgliedschaften'),
        ('iCloud - Anteil Mama',                             'Abos & Mitgliedschaften'),

        ('Berufsunfähigkeit - Alte Leipziger',               'Versicherungen'),
        ('Private Altersvorsorge - Nürnberger',              'Versicherungen'),
        ('Rechtsschutz - Adam Riese',                        'Versicherungen'),
        ('Reisekrankenversicherung - DKV',                   'Versicherungen'),

        ('Fahrradzubehör',                                   'Hobby'),
        ('Radbrille - Glas',                                 'Hobby'),
        ('Bikefitting',                                      'Hobby'),

        ('Urlaub Frankreich (Vogesen)',                      'Urlaub'),
        ('Urlaub Österreich (Salden) - Bergtour Ausrüstung', 'Urlaub'),

        ('Aline Geschenk 30ter',                             'Geschenke & Anlässe'),
        ('Geschenk Aline 30ter - Anteil Aline',              'Geschenke & Anlässe'),
        ('Konfirmation Geschenk',                            'Geschenke & Anlässe'),
        ('Hotel Konfirmation',                               'Geschenke & Anlässe'),
        ('Hotel Konfirmation - Anteil Aline',                'Geschenke & Anlässe'),
        ('Geschenk Parfüm - Mama',                           'Geschenke & Anlässe'),
        ('Aline Geburtstag',                                 'Geschenke & Anlässe'),
        -- Nachgetragen am 08.08.2026 nach User-Entscheid. §A3 ordnete diese
        -- Karte nicht zu — „Deutschlandticket" dort meint die eigene
        -- Monatskarte. Mobilität (Verkehrsmittel) und Geschenke (für Mama)
        -- waren beide plausibel; der User hat Geschenke gewählt.
        -- Der Name trägt Leerzeichen und einen Abo-Vermerk aus dem Import,
        -- deshalb hier vollständig und unverändert.
        ('Deutschlandticket Mama                                  Europa-Allee 70-76 | Abo 101627874 zum 01.05.2026',
                                                             'Geschenke & Anlässe'),

        ('Privates Budget',                                  'Persönliches'),
        ('Friseur',                                          'Persönliches'),
        ('Essen gehen',                                      'Persönliches'),
        ('Kauf iPhone 15ProMax',                             'Persönliches'),

        ('Steuererstattung 2025',                            'Rückflüsse'),
        ('Kleinanzeigen',                                    'Rückflüsse'),
        ('Verkauf Kleinanzeigen',                            'Rückflüsse'),
        ('Einzahlung Münzen',                                'Rückflüsse')
    )
    UPDATE cards c
       SET category_id = k.id
      FROM mapping m
      JOIN card_categories k
        ON k.user_id = v_user.user_id AND k.name = m.kategorie
     WHERE c.user_id = v_user.user_id
       AND c.name = m.card_name
       AND c.category_id IS NULL;

    GET DIAGNOSTICS v_zuordnung_user = ROW_COUNT;
    v_zuordnung_gesamt := v_zuordnung_gesamt + v_zuordnung_user;

    RAISE NOTICE 'Nutzer %: % Karten zugeordnet', v_user.user_id, v_zuordnung_user;
  END LOOP;

  RAISE NOTICE 'Erstzuordnung abgeschlossen: % Karten insgesamt', v_zuordnung_gesamt;

  -- Sichtbar machen, was NICHT zugeordnet wurde, statt es zu verschweigen.
  FOR v_kat IN
    SELECT c.name, c.type::text AS typ
      FROM cards c
     WHERE c.category_id IS NULL
     ORDER BY c.name
  LOOP
    RAISE NOTICE 'ohne Kategorie: % (%)', left(v_kat.name, 60), v_kat.typ;
  END LOOP;
END;
$migration$;

-- ───────────────────────────────────────────────────────────────────────────
-- Erwartung beim Lauf gegen Produktion (Bestand 08.08.2026, 46 Karten):
--   ALLE 46 Karten zugeordnet, keine bleibt ohne.
--
-- Der Weg dorthin ist bewusst zweistufig gewesen: Beim ersten Lauf blieb
-- „Deutschlandticket Mama … | Abo 101627874 zum 01.05.2026" (ONCE, Mai 2026)
-- offen, weil §A3 sie nicht zuordnet und Mobilität wie Geschenke plausibel
-- waren — es wurde NICHT geraten (Arbeitsregel 3). Der User hat am 08.08.2026
-- „Geschenke & Anlässe" entschieden; die Zeile steht seither oben mit drin.
--
-- Sichtbare Folge: „Ohne Kategorie" erscheint in KEINEM Monat mehr. Das ist
-- kein Fehler, sondern die Sichtbarkeits-Regel B6 — der Behälter zeigt sich
-- genau dann, wenn es etwas zu tun gibt. Der Mai fällt dadurch von zehn auf
-- neun Ordner.
--
-- Anker nach der Zuordnung: alle zwölf Monate um 0,00 € bewegt, die
-- Ordner-Spalte ergibt in allen zwölf weiterhin exakt die Sparrate.
-- ───────────────────────────────────────────────────────────────────────────
