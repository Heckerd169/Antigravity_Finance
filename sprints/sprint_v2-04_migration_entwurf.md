# Sprint v2-04 — Migrations- & RPC-Entwurf (Pre-Sprint-Lieferung des Architekten) — v1.0

> **Vom:** Architekten-Chat (Schema v3.1, Live-Introspektion 06.07.2026)
> **An:** Dominik (Freigabe) · danach Claude Code (App-Layer, Repo-Ablage)
> **Grundlage:** Sprint-v2-04-Briefing v1.2 (freigegeben 06.07.2026) · Beschluss-Nachtrag §3 „Stufe 1"
> **Status:** **ENTWURF — Anwendung erst nach expliziter Freigabe durch Dominik.**
> Anwendung dann durch den Architekten selbst (Ausnahme 2, bestätigt 06.07.2026), gefolgt von SQL-Verifikation.
> **Introspektions-Basis:** `process_csv_import`, `calculate_card_amount_for_month`, `calculate_sparrate_for_month`, `create_card_from_fragment`, View `fragments_with_status`, Constraint `transfer_type_valid`, Trigger-Bestand `card_fragment_links` (leer), `own_ibans` (Stufe 0 verifiziert: 4 Einträge korrekt).

---

## 0. Anwendungsplan

Eine einzige Migrationsdatei, **transaktional** (alle Schritte in einem `BEGIN…COMMIT`; PostgreSQL-DDL ist transaktional — bei Fehler bleibt nichts Halbes zurück). Repo-Pfad (Claude Code, P-git): `supabase/migrations/20260706_v2-04_mehrkonten_stufe1.sql`.

Reihenfolge: **M0** Wipe → **M1** CHECK → **M2** Markier-RPC → **M3** Filter/View/Trigger → **M4** `process_csv_import` (① + ④).

**Wipe-Umfang (M0, Live-Stand):** 33 `card_fragment_links`, 55 `fragments`, 3 `card_monthly_states` (alle drei `manually_paid`-Testzustände, keine `adjusted_amount`-Einträge). **Unberührt:** 31 Karten, `card_planned_timeline`, `income_timeline`, `net_estimation_brackets`, `profiles` (inkl. Stufe-0-`own_ibans`), `app_config`, `deleted_entities`.

---

## 1. Die Migration (vollständig)

```sql
BEGIN;

-- ============================================================
-- M0 — Daten-Wipe (Ausnahme 1, User-Entscheidung 06.07.2026)
-- Importierte Daten + Test-Monatszustände. Karten & Pläne bleiben.
-- ============================================================
DELETE FROM card_fragment_links;
DELETE FROM fragments;
DELETE FROM card_monthly_states;

-- ============================================================
-- M1 — Baustein ②a: CHECK-Erweiterung transfer_type
-- ============================================================
ALTER TABLE fragments DROP CONSTRAINT transfer_type_valid;
ALTER TABLE fragments ADD CONSTRAINT transfer_type_valid
  CHECK (
    transfer_type IS NULL
    OR transfer_type IN ('INTERNAL_TRANSFER', 'ASSET_REALLOCATION')
  );

-- ============================================================
-- M2 — Baustein ②b: Markier-RPC (manuell, Ownership-Check)
-- Transitionen: NULL→AR, INTERNAL_TRANSFER→AR (Scalable-Fall),
-- Rücknahme nur AR→NULL. Setzen verweigert bei bestehendem
-- Karten-Link (OQ-B; Zuordnung zuerst lösen).
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_fragment_asset_reallocation(
  p_fragment_id uuid,
  p_set         boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id  uuid := auth.uid();
  v_fragment fragments%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentifizierung erforderlich' USING ERRCODE = '28000';
  END IF;

  IF p_fragment_id IS NULL THEN
    RAISE EXCEPTION 'p_fragment_id darf nicht NULL sein' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_fragment
    FROM fragments
   WHERE id = p_fragment_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Fragment % nicht gefunden oder nicht zugänglich', p_fragment_id
      USING ERRCODE = '42704';
  END IF;

  -- Expliziter Ownership-Check (Briefing A2) — zusätzlich zu RLS
  IF v_fragment.user_id <> v_user_id THEN
    RAISE EXCEPTION 'Fragment % gehört nicht dem aktuellen User', p_fragment_id
      USING ERRCODE = '42501';
  END IF;

  IF p_set THEN
    -- OQ-B: verlinkte Fragmente werden nicht still entkoppelt — explizit lösen
    IF EXISTS (SELECT 1 FROM card_fragment_links WHERE fragment_id = p_fragment_id) THEN
      RAISE EXCEPTION 'Fragment % ist einer Karte zugeordnet — Zuordnung zuerst lösen (OQ-B)',
        p_fragment_id USING ERRCODE = '23514';
    END IF;

    UPDATE fragments
       SET transfer_type     = 'ASSET_REALLOCATION',
           suggested_card_id = NULL,
           confidence        = NULL
     WHERE id = p_fragment_id;
  ELSE
    IF v_fragment.transfer_type IS DISTINCT FROM 'ASSET_REALLOCATION' THEN
      RAISE EXCEPTION 'Fragment % trägt keine ASSET_REALLOCATION-Markierung (aktuell: %)',
        p_fragment_id, COALESCE(v_fragment.transfer_type, 'NULL')
        USING ERRCODE = '22023';
    END IF;

    -- Rücknahme → NULL. War das Fragment ursprünglich IBAN-erkannt,
    -- setzt der nächste Re-Import INTERNAL_TRANSFER automatisch neu.
    UPDATE fragments
       SET transfer_type = NULL
     WHERE id = p_fragment_id;
  END IF;

  RETURN jsonb_build_object(
    'fragment_id',   p_fragment_id,
    'transfer_type', (SELECT transfer_type FROM fragments WHERE id = p_fragment_id)
  );
END;
$function$;

-- ============================================================
-- M3 — Baustein ③: Defense-in-Depth auf transfer_type IS NULL
-- ============================================================

-- ③a Karten-Aggregation: Filter verallgemeinert (deckt beide Typen
--    und künftige Werte). Sparrate-RPC ist transitiv abgedeckt —
--    calculate_sparrate_for_month liest Fragmente ausschließlich
--    über diese Funktion (introspektiv verifiziert, keine Änderung dort).
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
  v_fragment_sum   numeric;
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
  -- (v2-04 ③: IS NULL statt IS DISTINCT FROM 'INTERNAL_TRANSFER';
  -- Defense-in-Depth zusätzlich zu OQ-B-Invariante + Link-Trigger)
  SELECT COALESCE(SUM(ABS(f.amount)), 0), COUNT(*)
  INTO v_fragment_sum, v_fragment_count
  FROM card_fragment_links l
  JOIN fragments f ON f.id = l.fragment_id
  WHERE l.card_id = p_card_id
    AND l.month   = p_month
    AND f.transfer_type IS NULL;

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

-- ③b View: Status trägt den konkreten Transfer-Typ
--    (Interim-Verdrahtung ②: Frontend behandelt beide Werte wie
--    den bisherigen Transfer-Status — grau + Badge; finale Geste = DD)
CREATE OR REPLACE VIEW public.fragments_with_status AS
 SELECT f.id,
    f.user_id,
    f.amount,
    f.description,
    f.transaction_date,
    f.hash,
    f.confidence,
    f.suggested_card_id,
    f.imported_at,
    f.created_at,
        CASE
            WHEN f.transfer_type IS NOT NULL THEN f.transfer_type
            WHEN l.origin = 'AUTO_ABSORBED'::link_origin THEN 'AUTO_ABSORBED'::text
            WHEN l.origin = 'MANUAL_DROP'::link_origin THEN 'ASSIGNED'::text
            ELSE 'UNASSIGNED'::text
        END AS status,
    l.card_id AS assigned_card_id,
    l.month AS assigned_month,
    f.counterparty_iban,
    f.transfer_type
   FROM fragments f
     LEFT JOIN card_fragment_links l ON l.fragment_id = f.id;

-- ③c Link-Trigger: DB-seitige Durchsetzung der Karten-Link-Eignung.
--    Schließt zugleich die introspektiv gefundene Lücke, dass weder
--    Client-Drops (direktes INSERT unter RLS) noch
--    create_card_from_fragment den transfer_type prüfen.
CREATE OR REPLACE FUNCTION public.enforce_no_transfer_fragment_links()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF EXISTS (
    SELECT 1 FROM fragments f
     WHERE f.id = NEW.fragment_id
       AND f.transfer_type IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'OQ-B: Fragment % ist als Transfer markiert (%) und kann keiner Karte zugeordnet werden',
      NEW.fragment_id,
      (SELECT transfer_type FROM fragments WHERE id = NEW.fragment_id)
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_oqb_no_transfer_links ON card_fragment_links;
CREATE TRIGGER trg_oqb_no_transfer_links
  BEFORE INSERT OR UPDATE OF fragment_id ON card_fragment_links
  FOR EACH ROW EXECUTE FUNCTION enforce_no_transfer_fragment_links();

-- ============================================================
-- M4 — Bausteine ① + ④: process_csv_import
--   ① p_format_hint 'DKB_VISA': Einzahlung/Ausgleich (>0) → INTERNAL_TRANSFER
--   ④ Duplikat-Hash-Fix: deterministische Laufnummer identischer
--     Zeilen im Batch; 1. Vorkommen behält die alte Hash-Formel
-- ============================================================
CREATE OR REPLACE FUNCTION public.process_csv_import(p_rows jsonb, p_format_hint text DEFAULT 'DKB'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  v_user_id           uuid := auth.uid();
  v_own_ibans         text[];
  v_auto_threshold    numeric;
  v_badge_threshold   numeric;
  v_row               record;
  v_amount_fixed      text;
  v_hash_input        text;
  v_hash              text;
  v_iban              text;
  v_fragment_id       uuid;
  v_was_inserted      boolean;
  v_is_internal       boolean;
  v_is_kk_transfer    boolean;
  v_unlinked_rows     int;
  v_best_card_id      uuid;
  v_best_score        numeric;
  v_inserted          int := 0;
  v_skipped           int := 0;
  v_iban_backfilled   int := 0;
  v_auto_absorbed     int := 0;
  v_internal_transfers int := 0;
  v_links_removed     int := 0;
  v_fragment_ids      uuid[] := ARRAY[]::uuid[];
  v_link_month        date;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized' USING ERRCODE = '28000';
  END IF;

  IF p_rows IS NULL OR jsonb_typeof(p_rows) <> 'array' THEN
    RAISE EXCEPTION 'p_rows muss ein JSONB-Array sein' USING ERRCODE = '22023';
  END IF;

  -- v2-04 ①: 'DKB_VISA' als drittes Format zugelassen
  IF p_format_hint IS NOT NULL
     AND p_format_hint NOT IN ('DKB', 'CORTAL_CONSORS', 'DKB_VISA') THEN
    RAISE EXCEPTION 'p_format_hint unbekannt: %', p_format_hint
      USING ERRCODE = '22023';
  END IF;

  SELECT (value::text)::numeric INTO v_auto_threshold
    FROM app_config WHERE key = 'confidence.auto_absorption_threshold';
  SELECT (value::text)::numeric INTO v_badge_threshold
    FROM app_config WHERE key = 'confidence.badge_threshold';
  v_auto_threshold  := COALESCE(v_auto_threshold,  0.95);
  v_badge_threshold := COALESCE(v_badge_threshold, 0.60);

  SELECT own_ibans INTO v_own_ibans
    FROM profiles WHERE user_id = v_user_id;
  v_own_ibans := COALESCE(v_own_ibans, ARRAY[]::text[]);

  -- v2-04 ④: Ordinalität + Vorkommens-Index byte-identischer Zeilen.
  -- Partitionierung über die TYPISIERTEN Werte (= Hash-Input-Äquivalenz),
  -- Reihenfolge = Dateireihenfolge → deterministisch → Re-Import-idempotent.
  FOR v_row IN
    SELECT (e.elem->>'transaction_date')::date AS transaction_date,
           (e.elem->>'amount')::numeric        AS amount,
           (e.elem->>'description')            AS description,
           (e.elem->>'counterparty_iban')      AS counterparty_iban,
           row_number() OVER (
             PARTITION BY (e.elem->>'transaction_date')::date,
                          (e.elem->>'amount')::numeric,
                          (e.elem->>'description')
             ORDER BY e.ord
           )                                   AS occurrence_idx
    FROM jsonb_array_elements(p_rows) WITH ORDINALITY AS e(elem, ord)
    ORDER BY e.ord
  LOOP
    IF v_row.transaction_date IS NULL
       OR v_row.amount IS NULL
       OR v_row.description IS NULL THEN
      RAISE EXCEPTION 'Zeile mit NULL-Pflichtfeld: (date=%, amount=%, desc=%)',
        v_row.transaction_date, v_row.amount, v_row.description
        USING ERRCODE = '22023';
    END IF;

    -- IBAN normalisieren: leerer String → NULL
    v_iban := NULLIF(trim(v_row.counterparty_iban), '');

    -- Hash: 1. Vorkommen = V2-Formel unverändert (Abwärtskompatibilität,
    -- counterparty_iban weiterhin NICHT im Hash — OQ-A-Backfill).
    -- Ab 2. Vorkommen deterministisches Suffix '|#N'.
    v_amount_fixed := to_char(v_row.amount, 'FM999990.00');
    v_hash_input   := v_row.transaction_date::text
                      || '|' || v_amount_fixed
                      || '|' || v_row.description
                      || CASE WHEN v_row.occurrence_idx > 1
                              THEN '|#' || v_row.occurrence_idx::text
                              ELSE '' END;
    v_hash := encode(digest(v_hash_input, 'sha256'), 'hex');

    -- Defense gegen Variable-Leak
    v_fragment_id    := NULL;
    v_was_inserted   := NULL;
    v_best_card_id   := NULL;
    v_best_score     := NULL;
    v_is_internal    := false;
    v_is_kk_transfer := false;

    WITH ins AS (
      INSERT INTO fragments (
        user_id, transaction_date, amount, description, hash, counterparty_iban
      ) VALUES (
        v_user_id, v_row.transaction_date, v_row.amount, v_row.description,
        v_hash, v_iban
      )
      ON CONFLICT (user_id, hash) DO UPDATE
        SET counterparty_iban = EXCLUDED.counterparty_iban
        WHERE fragments.counterparty_iban IS NULL
          AND EXCLUDED.counterparty_iban  IS NOT NULL
      RETURNING id, (xmax = 0) AS was_inserted
    )
    SELECT id, was_inserted INTO v_fragment_id, v_was_inserted FROM ins;

    IF v_fragment_id IS NULL THEN
      v_skipped := v_skipped + 1;
      CONTINUE;
    END IF;

    IF v_was_inserted THEN
      v_inserted     := v_inserted + 1;
      v_fragment_ids := v_fragment_ids || v_fragment_id;
    ELSE
      v_iban_backfilled := v_iban_backfilled + 1;
    END IF;

    -- v2-04 ①: KK-Klassifikation (nur Format 'DKB_VISA'; KK-Export
    -- hat keine IBAN-Spalte → Heuristik über Beschreibung + Vorzeichen)
    v_is_kk_transfer := (
      p_format_hint = 'DKB_VISA'
      AND v_row.amount > 0
      AND (   v_row.description ILIKE 'Einzahlung%'
           OR v_row.description ILIKE 'Ausgleich Kreditkarte%')
    );

    -- Transfer-Erkennung: IBAN-Pfad (INSERT + Backfill) ODER KK-Heuristik
    IF (v_iban IS NOT NULL AND v_iban = ANY(v_own_ibans))
       OR v_is_kk_transfer THEN
      UPDATE fragments
         SET transfer_type = 'INTERNAL_TRANSFER'
       WHERE id = v_fragment_id;

      -- OQ-B: bestehende Links lösen
      WITH deleted AS (
        DELETE FROM card_fragment_links
         WHERE fragment_id = v_fragment_id
        RETURNING 1
      )
      SELECT count(*) INTO v_unlinked_rows FROM deleted;
      v_links_removed := v_links_removed + COALESCE(v_unlinked_rows, 0);

      UPDATE fragments
         SET suggested_card_id = NULL,
             confidence        = NULL
       WHERE id = v_fragment_id
         AND (suggested_card_id IS NOT NULL OR confidence IS NOT NULL);

      v_internal_transfers := v_internal_transfers + 1;
      v_is_internal := true;
    END IF;

    -- Confidence-Loop NUR für echte INSERTs ohne Transfer-Markierung
    IF v_was_inserted AND NOT v_is_internal THEN
      SELECT cm.card_id, cm.score
        INTO v_best_card_id, v_best_score
      FROM (
        SELECT c.id   AS card_id,
               c.name AS card_name,
               calculate_match_confidence(v_fragment_id, c.id) AS score
        FROM cards c
        WHERE c.user_id = v_user_id
          AND c.deleted_at IS NULL
          AND is_card_active_in_month(
                c.id, date_trunc('month', v_row.transaction_date)::date)
      ) cm
      WHERE cm.score > 0
      ORDER BY cm.score DESC, cm.card_name ASC
      LIMIT 1;

      IF v_best_card_id IS NULL THEN
        CONTINUE;
      END IF;

      IF v_best_score >= v_auto_threshold THEN
        v_link_month := date_trunc('month', v_row.transaction_date)::date;
        INSERT INTO card_fragment_links (
          user_id, card_id, fragment_id, month, origin
        ) VALUES (
          v_user_id, v_best_card_id, v_fragment_id, v_link_month,
          'AUTO_ABSORBED'::link_origin
        );
        v_auto_absorbed := v_auto_absorbed + 1;

      ELSIF v_best_score >= v_badge_threshold THEN
        UPDATE fragments
           SET suggested_card_id = v_best_card_id,
               confidence        = v_best_score
         WHERE id = v_fragment_id;
      END IF;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'inserted_count',                  v_inserted,
    'skipped_duplicates_count',        v_skipped,
    'iban_backfilled_count',           v_iban_backfilled,
    'auto_absorbed_count',             v_auto_absorbed,
    'internal_transfers_count',        v_internal_transfers,
    'links_removed_for_transfers_count', v_links_removed,
    'fragment_ids',                    COALESCE(to_jsonb(v_fragment_ids), '[]'::jsonb)
  );
END;
$function$;

COMMIT;
```

---

## 2. Getroffene Entwurfs-Entscheidungen (Veto-Punkte für Dominik)

| # | Entscheidung | Begründung |
|---|---|---|
| E1 | **Markier-RPC verweigert bei verlinktem Fragment** statt still zu entkoppeln | Manuelle Aktion soll keine versteckten Nebenwirkungen haben; der Import-Pfad darf auto-lösen (Batch-Semantik), eine bewusste Einzelgeste nicht |
| E2 | **`INTERNAL_TRANSFER` → `ASSET_REALLOCATION` erlaubt** | Dein Scalable-Übertrag (Giro→Cortal) wird IBAN-seitig automatisch als `INTERNAL_TRANSFER` erkannt — die Umschichtungs-Markierung muss ihn überschreiben können |
| E3 | **Rücknahme setzt `NULL`**, nicht den Vorzustand | Kein Zustands-Gedächtnis nötig; war das Fragment IBAN-erkennbar, stellt der nächste Re-Import `INTERNAL_TRANSFER` automatisch wieder her |
| E4 | **Erstes Vorkommen behält die alte Hash-Formel**, nur Vorkommen ≥ 2 erhalten Suffix `\|#N` | Maximale Abwärtskompatibilität, identisches Verhalten für 99 % aller Zeilen; Re-Import-Idempotenz bleibt beweisbar (Dateireihenfolge → gleiche Indizes → gleiche Hashes) |
| E5 | **③ zusätzlich als DB-Trigger** auf `card_fragment_links` | Introspektiv gefundene Lücke: Client-Drops (direktes INSERT unter RLS) und `create_card_from_fragment` prüfen `transfer_type` heute nicht — der Trigger schließt beide Pfade mit einem Objekt |
| E6 | **`card_monthly_states` im Wipe enthalten** (3 Zeilen, alle `manually_paid`-Testzustände, keine `adjusted_amount`) | Verwaiste Test-Flags würden nach dem Go-Live-Import Monatswerte verfälschen; echte Plan-Anpassungen existieren nicht |
| E7 | **Sparrate-RPC unverändert** | Liest Fragmente ausschließlich transitiv über `calculate_card_amount_for_month` (verifiziert) — dort sitzt der neue `IS NULL`-Filter |

**Bekannte, akzeptierte Grenze (④):** Die Laufnummer wirkt **pro Import-Batch**. Zwei identische *echte* Buchungen, die auf zwei verschiedene Teil-Exporte desselben Monats verteilt sind, würden weiterhin dedupliziert. Praxisregel: Monats-Exporte vollständig importieren (dein geplanter monatsweiser Ganzjahres-Import erfüllt das per Konstruktion).

**Vertrag an Claude Code (①):** Der KK-Parser muss die Spalte *Beschreibung* unverändert als `description` liefern (z. B. „Einzahlung", „Ausgleich Kreditkarte gem") und `counterparty_iban` leer lassen; Vorzeichen wie im Export. Re-Importe von KK-Dateien laufen als reine Skips (kein IBAN-Backfill möglich) — erwartetes, idempotentes Verhalten.

---

## 3. Verifikationsplan des Architekten (nach Anwendung, vor Übergabe)

Auth-Kontext wird in der SQL-Session simuliert (`set_config('request.jwt.claims', '{"sub":"<user_id>","role":"authenticated"}', true)` innerhalb einer Transaktion); MCP läuft als Service-Rolle an RLS vorbei, weshalb die expliziten Ownership-Checks (A2) unabhängig prüfbar sind.

| Kriterium | Test |
|---|---|
| A1 (①) | Fixture aus deiner echten KK-CSV: 2 „Einzahlung" (>0), 1 „Ausgleich Kreditkarte gem" (+8,47), 2 echte Käufe (negativ), 1 „Entgelt" (−2,49) → erwartet: 3× `INTERNAL_TRANSFER`, 3× `NULL` |
| A2 (②) | Positiv: Giro→Cortal-Fixture „Übertrag Scalable" importieren (wird IBAN-erkannt) → RPC setzt `ASSET_REALLOCATION`. Negativ: RPC mit fremder `sub`-UUID → `42501`. Rücknahme-Pfad: AR → NULL. CHECK: direkter `UPDATE` auf ungültigen Wert → Constraint-Fehler |
| A3 (③) | Link-INSERT auf Transfer-Fragment → Trigger `23514`. Filter-Kern: in Testtransaktion Trigger kurz deaktivieren, Link auf Transfer-Fragment erzwingen → `calculate_card_amount_for_month` ignoriert es, Sparrate unverändert → Rollback |
| A4 (④) | Fixture mit 2× byte-identischer Zeile (`PAYPAL −10,00`) → 2 Fragmente, verschiedene Hashes. Denselben Batch erneut importieren → `inserted=0`, `skipped=2`, Bestand unverändert |

Ergebnis geht als Verifikations-Tabelle in die P5/P6-Übergabe; der Schema-Doku-Patch (LL-16, separate Datei) folgt nach grüner Verifikation.

---

*Sprint v2-04 Migrations-/RPC-Entwurf v1.0 · Antigravity Finance 2.0 · 06. Juli 2026 · Anwendung erst nach Freigabe*
