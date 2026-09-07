-- ============================================================================
-- v3-02 · /mobil — Kandidaten für das Zuordnen ohne Ziehen  (MB-2, Roadmap-Paket 20)
--
-- EINE REIN LESENDE Funktion. Sie legt nichts an, ändert nichts und ruft für
-- die Aktiv-Entscheidung die bestehende Funktion is_card_active_in_month auf —
-- sie kann deshalb keinen Zahlenwert bewegen. STABLE, SECURITY INVOKER (wie
-- alle anderen Lesefunktionen dieses Projekts), damit RLS für den Aufrufer
-- greift.
--
-- ── WARUM ES SIE GIBT ──────────────────────────────────────────────────────
--
-- /mobil zeigt je offener Zahlung, auf welchen Karten DERSELBE HÄNDLER bisher
-- VON HAND lag — als Zähler im Vorschlag („7 × so zugeordnet") und als Liste
-- im Zweifelsfall (Design-Record 07.09.2026, Entscheidung 2). history_match
-- kennt diese Frage bereits (Stufe 1, v2-29/v2-30), beantwortet sie aber nur
-- mit Ja/Nein für EINE Karte — und SCHWEIGT, sobald der Händler auf mehreren
-- Karten liegt. Genau diesen Fall soll das Handy zeigen, nicht verschweigen:
-- Gemessen am 07.09.2026 liegt bei 121 von 476 offenen Zahlungen der Händler
-- auf zwei oder drei Karten.
--
-- ── DIESELBE REGEL WIE history_match STUFE 1 — bewusst wortgleich ──────────
--
--   · gleicher Nutzer, gleicher merchant_key (materialisierte Spalte, v2-30)
--   · nur Verknüpfungen mit origin = 'MANUAL_DROP' — nie AUTO_ABSORBED, sonst
--     verstärkt sich ein Automatik-Fehler selbst
--   · keine Überträge (transfer_type IS NULL)
--   · nie das geprüfte Fragment selbst
--
-- Wer eine dieser vier Bedingungen dort ändert, ändert sie hier mit — sonst
-- zeigt das Handy andere Kandidaten, als die Wiedererkennung kennt (LL-26,
-- Form „Nachbauen"). Die Gleichheit ist im Trockenlauf belegt (Testreihe T7,
-- sprints/sprint_v3-02_anker.md).
--
-- ── EIN AUFRUF JE AUFBAU ───────────────────────────────────────────────────
--
-- Liefert die Kandidaten ALLER offenen Zahlungen eines Monats in einer
-- Antwort. Ein Aufruf je Zahlung wäre ein N+1 mit heute 12–30 Netzrunden je
-- Aufbau und morgen mehr (LL-28/LL-29, CLAUDE.md §9 Anker 3). Der Stapel je
-- Monat ist zweistellig, die Antwort klein.
--
-- ── NUR KARTEN, DIE IM ANGEZEIGTEN MONAT AKTIV SIND ────────────────────────
--
-- Eine Zuordnung an eine im Monat inaktive Karte zählte in keiner Sparrate —
-- der Schreibtisch bietet als Ziel deshalb nur aktive Karten an, /mobil
-- ebenso. Die Entscheidung trifft is_card_active_in_month, nicht ein Nachbau.
-- Im Text steht die Prüfung NACH der Gruppierung; der Planer schiebt sie
-- trotzdem an die Verknüpfungs-Zeilen vor (STABLE-Funktion auf einem
-- Gruppierungs-Schlüssel, das darf er). Gemessen am 07.09.2026 unter der
-- App-Rolle: 11 offene Zahlungen, 211 Verknüpfungs-Zeilen, 4 ms — beide
-- Indizes greifen (idx_fragments_user_date, idx_fragments_merchant_key_stored).
-- Die Zusage „einmal je (Zahlung, Karte)" stand hier bis zur Messung und war
-- falsch (LL-22); sie ist gestrichen, nicht erzwungen — 4 ms brauchen keinen
-- MATERIALIZED-Umweg.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_open_fragment_candidates(
  p_user_id uuid,
  p_month   date
)
RETURNS TABLE (
  fragment_id uuid,
  card_id     uuid,
  treffer     integer
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
  WITH offen AS (
    -- „offen" heißt: kein Link und kein Übertrag — dieselbe Definition wie
    -- fragments_with_status (status = 'UNASSIGNED'), hier über die View
    -- gelesen, nicht nachgebaut.
    SELECT s.id, f.merchant_key
      FROM fragments_with_status s
      JOIN fragments f ON f.id = s.id
     WHERE s.user_id = p_user_id
       AND s.status = 'UNASSIGNED'
       AND s.transaction_date >= date_trunc('month', p_month)::date
       AND s.transaction_date <  (date_trunc('month', p_month) + interval '1 month')::date
       -- Ein Text ohne Buchstaben hat keinen Händler; darauf wird nie
       -- verglichen (af_merchant_key, v2-29).
       AND f.merchant_key <> ''
  ),
  treffer AS (
    SELECT o.id AS fragment_id,
           l.card_id,
           count(*)::integer AS treffer
      FROM offen o
      JOIN fragments f2
        ON f2.user_id       = p_user_id
       AND f2.merchant_key  = o.merchant_key
       AND f2.id           <> o.id
       AND f2.transfer_type IS NULL
      JOIN card_fragment_links l
        ON l.fragment_id = f2.id
       AND l.origin      = 'MANUAL_DROP'::link_origin
      JOIN cards c
        ON c.id = l.card_id
       AND c.deleted_at IS NULL          -- Papierkorb bleibt draußen (v2-20/KU-1)
     GROUP BY o.id, l.card_id
  )
  SELECT t.fragment_id, t.card_id, t.treffer
    FROM treffer t
   WHERE is_card_active_in_month(t.card_id, date_trunc('month', p_month)::date)
   ORDER BY t.fragment_id, t.treffer DESC, t.card_id
$function$;

COMMENT ON FUNCTION public.get_open_fragment_candidates(uuid, date) IS
  'v3-02: Auf welchen Karten lag derselbe Händler bisher VON HAND? Je offener '
  'Zahlung eines Monats eine Zeile pro Karte mit Zähler — dieselbe Regel wie '
  'history_match Stufe 1 (merchant_key, MANUAL_DROP, kein Übertrag, nicht das '
  'Fragment selbst), nur als Liste statt als Ja/Nein. Nur Karten, die im '
  'Monat aktiv sind (is_card_active_in_month). Rein lesend, ein Aufruf je '
  'Aufbau von /mobil.';
