-- ═══════════════════════════════════════════════════════════════════════════
-- v2-17 · KAT-3 — die Zahl eines Ordners, server-seitig
-- Record: V2/design_direktor_2026-08-07_kategorien.md §A4, §B5, Teil C1
-- ═══════════════════════════════════════════════════════════════════════════
--
-- WAS DIE ZAHL IST
-- Der vorzeichenrichtige Beitrag der enthaltenen Karten zur Sparrate des
-- Monats — dieselbe Summierung, die der Ring ohnehin macht, nur gefiltert.
-- KEIN eigener Plan. Dadurch erbt der Ordner Vorzeichen, Partner-Anteil und
-- alle §4.3-Sonderfälle, statt sie nachzubauen; die Befunde D2 (Vorzeichen)
-- und D5 (Split-Faktor) können strukturell nicht auftreten.
--
-- WARUM SERVER-SEITIG
-- Im Browser wäre es eine zweite Sparraten-Rechnung (Arbeitsregel 1). Und der
-- heutige Ladeweg feuert bereits drei Aufrufe pro Karte (Befund D14) — eine
-- Runde je Ordner obendrauf wüchse multiplikativ. Diese Funktion liefert alle
-- Ordner in EINEM Aufruf.
--
-- ⚠️ DER CENT (Teil C1, gemessen am 08.08.2026 gegen Produktion)
-- `calculate_sparrate_for_month` rundet EINMAL ganz am Schluss über alles.
-- Elf einzeln gerundete Ordner können das nicht nachbilden: Im Juli 2026 ist
-- der exakte Kartenwert −4.487,8556895729755…, die Sparrate landet dadurch auf
-- −322,75 €, die Summe der gerundeten Ordner aber auf −322,74 €. Die Lücke
-- besteht in ALLEN ZWÖLF MONATEN, nicht nur im Juli.
--
-- Die naheliegende Abhilfe („ungerundet summieren, erst am Ende runden") ist
-- notwendig, aber NICHT hinreichend — sie behebt die Rundung INNERHALB eines
-- Ordners, der Cent geht aber ZWISCHEN den Ordnern verloren.
--
-- Deshalb: Restverteilung. Die Kartenordner werden so bemessen, dass ihre
-- Summe exakt `Sparrate − Einkommens-Ordner` ergibt; die verbleibende Differenz
-- wandert auf den betragsgrößten Ordner. Die Spalte geht damit per Konstruktion
-- auf, nicht per Zufall.
--
-- Das Ziel wird aus `calculate_sparrate_for_month` GEHOLT, nicht hergeleitet.
-- Man könnte zeigen, dass `round(Σ exakt, 2)` dasselbe ergibt — aber genau
-- solche Herleitungen sind das, wovor LL-22 warnt. Der Aufruf kostet einen
-- zweiten Durchlauf über die Karten des Monats und macht die Zusage prüfbar.
--
-- SIGNATUR MIT p_user_id, wie die beiden Sparrate-RPCs. CLAUDE.md §6
-- Stolperfalle 4 behauptet das Gegenteil und ist an dieser Stelle falsch —
-- die Korrektur läuft als eigener Patch mit User-Freigabe.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_category_amounts_for_month(
  p_user_id uuid,
  p_month   date
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
DECLARE
  v_month    date := date_trunc('month', p_month)::date;
  v_net      numeric;
  v_sparrate numeric;
  v_ziel     numeric;   -- was die Kartenordner zusammen ergeben MÜSSEN
BEGIN
  v_net := get_net_monthly_for_month(p_user_id, 'ICH', v_month);

  -- Ohne Gehalt gibt es keine Sparrate und damit auch keine Aufstellung.
  -- `calculate_sparrate_for_month` liefert dann NULL; eine Aufstellung, die
  -- sich zu NULL summiert, wäre eine Falschaussage — „keine Anzeige" ist die
  -- richtige Antwort, nicht 0 (LL-20).
  IF v_net IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;

  v_sparrate := calculate_sparrate_for_month(p_user_id, v_month);
  v_ziel     := v_sparrate - v_net;

  RETURN (
    -- Vorfilter über die Aktiv-Fenster-Spalten (Index-freundlich, analog zur
    -- Schleife in calculate_sparrate_for_month), Feinprüfung über die RPC
    -- (Frequenz-Raster QUARTERLY/SEMIANNUAL/ANNUAL/ONCE).
    --
    -- Wie die Sparrate IGNORIERT auch diese Aggregation `cards.deleted_at`
    -- (Snapshot-Integrität §2.1) — sonst zeigte die Aufstellung eine andere
    -- Kartenmenge als der Ring, und genau das darf nicht passieren.
    WITH aktive AS (
      SELECT c.category_id,
             CASE WHEN c.type = 'INCOME' THEN 1 ELSE -1 END
               * calculate_card_amount_for_month(c.id, v_month) AS beitrag
        FROM cards c
       WHERE c.user_id = p_user_id
         AND c.first_active_month <= v_month
         AND (c.last_active_month IS NULL OR c.last_active_month >= v_month)
         AND is_card_active_in_month(c.id, v_month)
    ),
    -- `category_id IS NULL` bildet den Behälter „Ohne Kategorie" (Befund D12:
    -- ein Zufluss, kein Restbestand — beide Anlage-RPCs kennen keine
    -- Kategorie und liefern laufend welche nach).
    ordner AS (
      SELECT a.category_id,
             sum(a.beitrag)            AS exakt,
             round(sum(a.beitrag), 2)  AS gerundet,
             count(*)::int             AS posten
        FROM aktive a
       GROUP BY a.category_id
    ),
    -- Träger des Rundungsrests: der betragsgrößte Ordner. Er wechselt selten,
    -- und die relative Verzerrung ist dort am kleinsten — ein Cent auf 1.148 €
    -- sind 0,0009 %. Tiebreaker über die Kategorie-ID, damit das Ergebnis
    -- deterministisch ist und nicht von der Zeilenreihenfolge abhängt.
    rest AS (
      SELECT
        v_ziel - COALESCE((SELECT sum(gerundet) FROM ordner), 0) AS delta,
        (SELECT o.category_id
           FROM ordner o
          ORDER BY abs(o.exakt) DESC, o.category_id NULLS LAST
          LIMIT 1)                                              AS traeger_id
    ),
    kartenordner AS (
      SELECT
        CASE WHEN o.category_id IS NULL THEN 'UNCATEGORIZED' ELSE 'CATEGORY' END AS key,
        o.category_id,
        COALESCE(k.name, 'Ohne Kategorie')  AS name,
        -- „Ohne Kategorie" steht hinten, unmittelbar vor dem leeren Platz (B6).
        -- 32000 statt eines Magic-Werts wie 999: `sort_order` ist smallint, und
        -- 32000 liegt sicher über jedem realistisch vergebenen Wert.
        COALESCE(k.sort_order, 32000)::int  AS sort_order,
        o.gerundet
          + CASE WHEN o.category_id IS NOT DISTINCT FROM r.traeger_id
                 THEN r.delta ELSE 0 END    AS amount,
        o.posten
      FROM ordner o
      CROSS JOIN rest r
      LEFT JOIN card_categories k
        ON k.id = o.category_id AND k.user_id = p_user_id
    ),
    -- Der Einkommens-Ordner ist KEINE Kartensumme: Das Netto ist keine Karte
    -- und steht heute gar nicht im Karussell. Ohne ihn fehlte in der
    -- Aufstellung genau dieser Betrag und die Rechnung ginge nicht auf (A4).
    -- Er trägt den Wert unverändert — `income_timeline.net_monthly` ist
    -- numeric(12,2) und hat deshalb keinen Rundungsrest.
    alle AS (
      SELECT 'INCOME'::text AS key, NULL::uuid AS category_id,
             'Einkommen'::text AS name, (-1000)::int AS sort_order,
             v_net AS amount, 1 AS posten
      UNION ALL
      SELECT key, category_id, name, sort_order, amount, posten
        FROM kartenordner
    )
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'key',         a.key,
          'category_id', a.category_id,
          'name',        a.name,
          'sort_order',  a.sort_order,
          'amount',      a.amount,
          'posten',      a.posten
        )
        ORDER BY a.sort_order, a.name
      ), '[]'::jsonb)
      FROM alle a
  );
END;
$function$;
