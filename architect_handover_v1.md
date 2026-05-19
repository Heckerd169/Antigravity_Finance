# Architect Handover v1 — Antigravity Finance 1.0

**Stand:** 16. Mai 2026, nach Sprint-4-Test-Daten-Approval
**Zweck:** Einstiegs-Wissen für nachfolgenden Architekten-Chat (Token-Reset)
**Statische Begleitdokumente (bereits beim Nachfolger):** `antigravity_finance_design_dokument_v3.md`, `antigravity_finance_schema_summary_v2.md`, `persona_architect.md`

---

## 1. Supabase-Projekt-Anbindung

| Eigenschaft | Wert |
|---|---|
| Project ID | `nflkobdfdhncrtjncpmq` |
| PostgreSQL-Version | 17.6 (aarch64-linux) |
| Timezone | UTC |
| Region | nicht direkt MCP-abfragbar — vermutlich `eu-central-1` (Frankfurt); im Dashboard prüfen wenn relevant |
| Repo | `Heckerd169/Antigravity_Finance` |

**Zugriffsweg:** Supabase MCP-Server (`Supabase:execute_sql`, `Supabase:apply_migration`). Aufrufe brauchen User-Approval pro Call — meist klappt es im ersten Anlauf, gelegentlich „No approval received" → erneut feuern oder User um SQL-Editor-Run bitten.

**RLS-Kontext:** MCP läuft mit **Service-Role** — RLS wird bypassed. Bei Verifikations-Queries, die das Verhalten gegen RLS testen sollen, muss explizit eine Test-User-Session simuliert werden (z. B. via `SET LOCAL ROLE authenticated; SET LOCAL "request.jwt.claims" = '{"sub":"..."}'`). Bisher nicht nötig gewesen.

---

## 2. Aktueller DB-Stand (Delta zur Schema-Doku v2)

### 2.1 Tabellen

10 Base-Tabellen, **identisch zu Schema-Doku v2**:

```
app_config              card_planned_timeline   fragments
card_fragment_links     cards                   income_timeline
card_monthly_states     deleted_entities        net_estimation_brackets
                                                profiles
```

**Delta zu Schema-Doku v2 — `fragments`-Tabelle hat drei zusätzliche Spalten**, die in v2 nicht dokumentiert sind (vermutlich vom PM/User direkt nachgezogen oder waren schon in der ursprünglichen Block-6-Migration ohne dass v2 sie aufnahm — egal woher: sie sind live):

| Spalte | Typ | Nullable | Default | Zweck (vermutet) |
|---|---|---|---|---|
| `confidence` | `numeric` | ja | NULL | Vom Distiller berechneter Match-Score zur `suggested_card_id` |
| `suggested_card_id` | `uuid` | ja | NULL | Distiller-Vorschlag, ohne dass ein verbindlicher Link erstellt wird |
| `imported_at` | `timestamptz` | nein | `now()` | Import-Zeitpunkt (für Sortierung im Stack) |

→ **Action für Nachfolger:** Beim nächsten Schema-Doku-Update (v3?) diese drei Spalten in Section 5 ergänzen. Sind für Sprint 7 (Distiller-Pipeline) relevant.

### 2.2 View `fragments_with_status` — Pflichtdokumentation für Sprint 5

Sprint 5 (Header-Subzeile „X Fragmente offen") liest aus diesem View. Vollständige Live-Definition:

```sql
CREATE VIEW public.fragments_with_status AS
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
            WHEN l.origin = 'AUTO_ABSORBED'::link_origin THEN 'AUTO_ABSORBED'::text
            WHEN l.origin = 'MANUAL_DROP'::link_origin   THEN 'ASSIGNED'::text
            ELSE                                              'UNASSIGNED'::text
        END AS status,
        l.card_id AS assigned_card_id,
        l.month   AS assigned_month
   FROM fragments f
   LEFT JOIN card_fragment_links l ON l.fragment_id = f.id;
```

**Wichtig:**
- `status` ist `text`, kein Enum
- Drei mögliche Status-Werte: `'AUTO_ABSORBED'`, `'ASSIGNED'`, `'UNASSIGNED'`
- `assigned_card_id` und `assigned_month` sind NULL bei `status = 'UNASSIGNED'`
- View ist **read-only**, erbt RLS von `fragments` und `card_fragment_links` (Owner-Filter via `auth.uid()`)

**Sprint-5-Query-Pattern für Subzeile „X Fragmente offen":**
```sql
SELECT COUNT(*)::int
FROM fragments_with_status
WHERE status = 'UNASSIGNED'
  AND date_trunc('month', transaction_date) = '2026-04-01'::date;
```
(Beispiel-Filter: April-Vormonat im Mai-Render.)

### 2.3 RPCs — 17 Stück (16 aus v2 + 1 neu)

Alle `SECURITY INVOKER` außer `handle_new_user`. Vollständige Live-Signaturen:

| Funktion | Args | Returns | RLS-Modell |
|---|---|---|---|
| `amount_match` | `p_fragment_amount numeric, p_planned_amount numeric` | `numeric` | reine Rechenfunktion, keine RLS |
| `assert_card_has_initial_plan` | — | `trigger` | nur intern |
| `calculate_card_amount_for_month` | `p_card_id uuid, p_month date` | `numeric` | RLS implizit (auth.uid) |
| `calculate_match_confidence` | `p_fragment_id uuid, p_card_id uuid` | `numeric` | RLS implizit |
| **`calculate_planned_sparrate_for_month`** ✨ | `p_user_id uuid, p_month date` | `numeric` (NULL falls Onboarding offen) | explizit p_user_id |
| `calculate_sparrate_for_month` | `p_user_id uuid, p_month date` | `numeric` (NULL falls Onboarding offen) | explizit p_user_id |
| `estimate_net_monthly` | `p_gross_annual numeric, p_tax_class smallint, p_tax_year smallint` | `numeric` (NULL falls keine Bracket passt) | keine RLS (liest nur `net_estimation_brackets`) |
| `frequency_match` | `p_transaction_date date, p_card_id uuid` | `numeric` | RLS implizit |
| `get_net_monthly_for_month` | `p_user_id uuid, p_person person_role, p_month date` | `numeric` (NULL falls kein Eintrag ≤ Monat) | explizit p_user_id |
| `get_planned_amount_for_month` | `p_card_id uuid, p_month date` | `numeric` (NULL falls kein Plan-Eintrag) | RLS implizit |
| `get_split_factor` | `p_user_id uuid, p_month date` | `numeric` 0..1, nie NULL (Edge: 1.0 falls Partner unbekannt) | explizit p_user_id |
| `handle_new_user` | — | `trigger` | **`SECURITY DEFINER`** — nur intern |
| `is_card_active_in_month` | `p_card_id uuid, p_month date` | `boolean`, nie NULL | RLS implizit |
| `name_similarity` | `p_description text, p_card_name text` | `numeric` | reine Rechenfunktion |
| `restore_deletion` | `p_id uuid` | `boolean` | RLS implizit |
| `schedule_deletion` | `p_entity_type deleted_entity_type, p_entity_id uuid, p_payload jsonb` | `uuid` | RLS implizit |
| `set_updated_at` | — | `trigger` | nur intern |

✨ = neu seit Schema-Doku v2 (Pre-Sprint-2)

**Throw-Verhalten:** Keine der Funktionen `RAISES EXCEPTION` außer `restore_deletion` (wirft bei abgelaufenem oder doppelt-restored Trash). Alle anderen geben NULL / 0 / false bei fehlenden Daten zurück — kein Fehler.

### 2.4 Trigger — 5 Stück

| Trigger | Tabelle | Funktion | Timing | Deferrable |
|---|---|---|---|---|
| `on_auth_user_created` | `auth.users` | `handle_new_user` | AFTER INSERT | nein |
| `cards_assert_initial_plan` | `cards` | `assert_card_has_initial_plan` | AFTER INSERT/UPDATE | **JA — DEFERRED** |
| `cards_set_updated_at` | `cards` | `set_updated_at` | BEFORE UPDATE | nein |
| `card_monthly_states_set_updated_at` | `card_monthly_states` | `set_updated_at` | BEFORE UPDATE | nein |
| `profiles_set_updated_at` | `profiles` | `set_updated_at` | BEFORE UPDATE | nein |

**`cards_assert_initial_plan` ist deferred** — feuert beim COMMIT, nicht beim INSERT. Heißt: Card-Insert ohne sofortigen Plan-Insert ist OK, solange beide in derselben Transaktion sitzen. Das war der Grund, warum der Sprint-4-Seed mit DO-Block + INSERT-INTO-cards + INSERT-INTO-card_planned_timeline funktioniert.

---

## 3. Sprint-Beiträge des Architekten (chronologisch)

### Pre-Sprint-2 (Mai 2026)

**Anlass:** PM bereitete Sprint 2 (Singularity Ring) vor. Im Design-Doku v3 §5 visualisiert der Ring per Arc das Verhältnis Ist-Sparrate zu Plan-Sparrate. Ist-RPC `calculate_sparrate_for_month` existierte, **Plan-RPC fehlte**. Im Frontend rechnen wäre Snapshot-Integritäts-Bruch gewesen.

**Lieferung:**
- Migration `add_calculate_planned_sparrate_for_month` deployed
- Logik: identisch zur Ist-RPC, aber Fragment-Pfad weggenommen. Prio pro Karte: `adjusted_amount → planned_amount`. Inline implementiert (kein gemeinsamer Helper — bewusst als PM-Decision offen gelassen)
- Verifikation: TC1–TC4 alle PASS (TC2 mit mathematischer Korrektur 2830.01 statt der Auftrag-Spec 2854.01 — Spec-Lapsus im PM-Auftrag)
- Schema-Doku-Diff: Zeile in §4-„Im-Hot-Path"-Tabelle ergänzen (PM-Aufgabe, noch offen ob durchgeführt — Schema-Doku v2 listet die Funktion nicht, aber sie ist live)

**Bewährte Pattern aus diesem Sprint:**
- `BEGIN; SET LOCAL app.test_user_id = '...'; DO $$...$$; COMMIT;` — eine zentrale UUID-Stelle, lesbar in DO-Block und Verifikations-SELECTs
- Verify-Resultate **nicht** über `RAISE NOTICE` (im Supabase SQL Editor unsichtbar), sondern TEMP TABLE + finales SELECT vor ROLLBACK

### Sprint 4 (16. Mai 2026) — Karten-Komponente

**Anlass:** PM bereitete Sprint 4 vor (Karten-Komponente, Design-Doku §7). Karten konnten in V1 noch nicht via UI erzeugt werden (Direkt-Click kommt erst Sprint 5, Fragment-Drop Sprint 7), brauchten aber Seed-Daten für Smoke-Tests.

**Lieferung 1 — RPC-Verfügbarkeitsprüfung (Pre-Sprint-4):**
Sanity-Check der 4 Karten-Hot-Path-RPCs (`calculate_card_amount_for_month`, `is_card_active_in_month`, `get_planned_amount_for_month`, `get_split_factor`) gegen Schema-Doku v2 §4. Alle ✅ live + spec-konform. Keine Nacharbeit nötig.

**Lieferung 2 — Test-Daten-SQL:**
Idempotentes Seed-Skript mit 7 Karten (Miete/Strom/Netflix/Auto-Versicherung/Steuerrückzahlung/Tanken/Essen), 8 Plan-Timeline-Zeilen, 3 Monthly States (Strom Mai bezahlt, Steuerrückzahlung März bezahlt, Tanken Mai Anpassung 250 €), 1 Fragment (Edeka -360 €) + 1 Link (auf Essen für Überschritten-Test). Erfolgreich vom User approved und applied.

### Sonstiges

- Konsistenz-Check der Schema-Doku v2 gegen Live-DB (siehe §2 oben — 3-Spalten-Delta auf `fragments` identifiziert)
- View `fragments_with_status` live verifiziert (R3, siehe §2.2)

---

## 4. Datenbank-Eigenheiten / Stolperfallen

Sammlung aller nicht-offensichtlichen Details. Lesen, bevor man irgendwo eingreift.

### Spalten- und Naming-Eigenheiten

- **`cards`-Spalten ohne `card_`-Präfix:** Die Spalten heißen `type`, `attribution`, `frequency` — nicht `card_type` usw. Die zugehörigen ENUMs heißen aber `card_type`, `card_attribution`, `card_frequency`. Beim Casten: `'FIXED_COST'::card_type`.
- **`person_role`-Enum** für `income_timeline.person`: Werte sind `'ICH'` / `'PARTNER'`. UPPERCASE, sonst Cast-Error.
- **`link_origin`-Enum** für `card_fragment_links.origin`: `'AUTO_ABSORBED'` / `'MANUAL_DROP'`.
- **`deleted_entity_type`-Enum**: `'CARD'` / `'CARD_END'` / `'CARD_FRAGMENT_LINK'` / `'FRAGMENT'` — letzte zwei in V1 ungenutzt.
- **`adjustment_scope`-Enum** in `card_monthly_states`: bisher nur `'THIS_MONTH'` gesehen. Pflicht wenn `adjusted_amount IS NOT NULL`, sonst NULL.

### Constraint-Stolperfallen

- **`cards.last_after_first`:** Wenn man eine Karte mit `first_active_month = '2026-03-01'` anlegt und später `last_active_month = '2026-02-01'` setzen will, gibt's Constraint-Verletzung. Workaround in Sprint-2-Verify: Karte mit früherem `first_active_month` (z. B. `'2025-01-01'`) anlegen, dann ist Feb 2026 als Endmonat OK.
- **`cards.once_is_single_month`:** Frequenz `'ONCE'` zwingt `first_active_month = last_active_month`. Sonst Insert-Fehler.
- **`cards.budget_never_shared`:** `type = 'BUDGET'` darf nicht `attribution = 'GEMEINSAM'` sein. Design-Doku §7 sagt das auch.
- **`income_timeline` UNIQUE auf `(user_id, person, effective_month)`** plus CHECK `effective_month = date_trunc('month', effective_month)::date` — alle Income-Monatswerte müssen Erster des Monats sein. Gleiche Constraint auch auf `card_planned_timeline.effective_month` und `card_monthly_states.month`.
- **`card_fragment_links` UNIQUE auf `(fragment_id)`** — ein Fragment kann nie zwei Karten zugeordnet sein. Re-Assign = DELETE + neuer INSERT.

### Trigger-Reihenfolge

- `cards_assert_initial_plan` ist **DEFERRED** — feuert beim COMMIT. Heißt: Im selben DO-Block erst Card, dann Plan einfügen ist OK. Aber: bei `apply_migration` ohne expliziten Transaktions-Wrapper kann das überraschen, falls Statement-Auto-COMMIT eingreift.
- `on_auth_user_created` (`SECURITY DEFINER`) → erzeugt automatisch eine `profiles`-Zeile. Beim Test-User-Insert in `auth.users` ist die `profiles`-Zeile danach garantiert da. UPDATE darauf (Steuerklasse setzen etc.) statt INSERT.

### RPC-Stolperfallen

- **Drei der vier Karten-Hot-Path-RPCs nehmen *kein* `p_user_id`:** `calculate_card_amount_for_month`, `is_card_active_in_month`, `get_planned_amount_for_month`. RLS-Filter läuft implizit über `auth.uid()` auf den referenzierten Tabellen. **Konsequenz:** Bei fehlender Auth-Session geben sie **still** NULL / `false` / `0` zurück — kein Fehler. Frontend muss defensiv prüfen. Bei MCP-Tests aus dem Architekten-Chat (Service-Role) ist das egal — RLS wird bypassed.
- **`calculate_sparrate_for_month` und `calculate_planned_sparrate_for_month` nehmen `p_user_id` explizit** — aber prüfen nicht gegen `auth.uid()`. Service-Role kann fremde user_ids einsetzen. Das ist beabsichtigt für Architekten/Admin-Tools.
- **Hash-Konvention** für `fragments.hash`: SHA-256(`transaction_date_iso` + `"|"` + `amount_2dp` + `"|"` + `description_raw`). Roh, kein Trimming. In SQL: `encode(digest('2026-05-15|-360.00|Edeka', 'sha256'), 'hex')`. Idempotenz im Seed-Skript: UNIQUE(`user_id`, `hash`) → `ON CONFLICT DO NOTHING`.

### View-Stolperfallen

- **`fragments_with_status.status` ist `text`**, nicht ENUM. Vergleich also `WHERE status = 'UNASSIGNED'` (String), kein Cast.
- View ist über LEFT JOIN gebaut → ein Fragment ohne Link erscheint mit `status = 'UNASSIGNED'`, `assigned_card_id IS NULL`, `assigned_month IS NULL`. Das ist der Standardfall direkt nach Distiller-Lauf für Fragmente unter Auto-Absorption-Schwelle.

### Sonstiges

- **Timezone der DB ist UTC.** `current_date` etc. liefern UTC-Datum. Wenn das Frontend mit lokalen Daten arbeitet (Europe/Berlin = UTC+1/+2), kann das an Tag-Grenzen abweichen. Bisher nicht problematisch, weil die App auf Monats-Granularität läuft.
- **Numeric-Präzision für Geldbeträge:** `numeric(12,2)` überall — 10 Vorkomma-Stellen reichen für ~10 Mio. €. Frontend muss die zwei Nachkommastellen erzwingen.

---

## 5. Aktueller Test-User-State (Stand nach Sprint 4 Approval)

**Test-User-UUID:** dem Architekten nicht bekannt. Im Sprint-4-Seed-SQL als Platzhalter `<TEST_USER_UUID>` mit `SET LOCAL app.test_user_id = ...` umgesetzt — der User trägt sie selbst ein. Nachfolger sollte das Pattern fortsetzen.

**DB-Inhalt (PM-Angabe, vom Architekten nicht live verifiziert):**

| Tabelle | Anzahl | Inhalt |
|---|---|---|
| `profiles` | 1 | Auto-erzeugt durch `handle_new_user`-Trigger; `tax_class` und `onboarded_at` vom User gesetzt |
| `income_timeline` | 1 | `effective_month = 2026-01-01`, Person `ICH`, Brutto 75.000 €, Netto 3.200 €/Monat. (Kein PARTNER-Eintrag) |
| `cards` | 7 | Miete (FIXED_COST/GEMEINSAM/MONTHLY), Strom (FIXED_COST/GEMEINSAM/MONTHLY), Netflix (FIXED_COST/ICH/MONTHLY), Auto-Versicherung (FIXED_COST/ICH/ANNUAL), Steuerrückzahlung (INCOME/ICH/ONCE), Tanken (BUDGET/ICH/MONTHLY), Essen (BUDGET/ICH/MONTHLY) |
| `card_planned_timeline` | 8 | Je 1 Eintrag pro Karte + 2 für Strom (100 € ab Januar, 110 € ab Mai 2026) |
| `card_monthly_states` | 3 | Strom-Mai bezahlt, Steuerrückzahlung-März bezahlt, Tanken-Mai Anpassung 250 € |
| `fragments` | 1 | Edeka Wocheneinkauf, `-360,00 €`, `2026-05-15` |
| `card_fragment_links` | 1 | Edeka-Fragment → Essen-Karte → Monat `2026-05-01`, `origin = 'MANUAL_DROP'` |

**Implikation für Sprint 5:** Beim Render von Mai 2026 würde die Sparrate-Berechnung greifen, das Karussell hat alle 7 Karten in unterschiedlichen Zuständen, das Edeka-Fragment ist zugeordnet → der Fragment-Stack ist **leer**. Sprint 5 braucht unzugeordnete Fragmente, sonst keine sichtbaren Inhalte im Stack — das ist exakt der Punkt für R4 unten.

**Achtung — Partner-Daten fehlen:** Keine `PARTNER`-Zeile in `income_timeline`. Das heißt: `get_split_factor` liefert `1.0`, alle gemeinsamen Karten zählen voll auf ICH (Miete 1.200 €, nicht 720 €). Im Frontend sichtbar als Split-Anzeige „ICH 100 % / PARTNER 0 %". Falls Sprint 5 den Split-Render testen will, muss PM/User eine PARTNER-Zeile nachseeden.

---

## 6. Pending Architekten-Aufgaben für Sprint 5

### R3 — `fragments_with_status` verifiziert ✅

Erledigt in §2.2 dieses Dokuments. Nachfolger braucht nicht erneut zu prüfen, nur in Schema-Doku v3 übernehmen falls relevant.

### R4 — Test-Daten-Anreicherung: 5–8 unzugeordnete Fragmente

**Designentscheidungen:**
- 6 Fragmente (im Range 5–8 mittig)
- 4 in Mai 2026, 1 in April 2026, 1 in März 2026
- Beträge zwischen 15 € und 85 €, alle als Ausgaben (negativ, Banken-CSV-Konvention)
- Plausible deutsche Händler (Aral, Rewe, Stadtwerke, dm)
- Alle **unzugeordnet** (keine `card_fragment_links`-Einträge) → erscheinen im Stack
- Bestehendes Edeka-Fragment **bleibt unberührt**
- Hash spec-konform (SHA-256, Pipe-Separator, kein Trimming)
- Idempotent via `ON CONFLICT (user_id, hash) DO NOTHING`

**Verwendung durch den Nachfolger:** Bei grünem Licht vom PM kopierbar 1:1 dem User ausgeben.

```sql
-- =========================================================================
-- TEST-DATEN-ANREICHERUNG SPRINT 5
-- 6 unzugeordnete Fragmente (Mai/April/März 2026) für Header-Subzeile +
-- Fragment-Stack-Tests. Idempotent. Bestehendes Edeka-Fragment bleibt unberührt.
--
-- BEDIENUNG:
--   1. <TEST_USER_UUID> unten EINMAL durch die echte User-UUID ersetzen
--   2. Skript komplett im Supabase SQL Editor ausführen
--   3. Verifikations-Tabelle am Ende prüfen
-- =========================================================================

BEGIN;

SET LOCAL app.test_user_id = '<TEST_USER_UUID>';

DO $SEED$
DECLARE
  v_user_id  uuid := current_setting('app.test_user_id')::uuid;
BEGIN

  -- Fragment 1: Aral Mai 2026
  INSERT INTO fragments (user_id, hash, description, amount, transaction_date)
  VALUES (
    v_user_id,
    encode(digest('2026-05-03|-42.80|Aral Tankstelle Hauptstr', 'sha256'), 'hex'),
    'Aral Tankstelle Hauptstr',
    -42.80,
    '2026-05-03'
  )
  ON CONFLICT (user_id, hash) DO NOTHING;

  -- Fragment 2: Rewe Mai 2026
  INSERT INTO fragments (user_id, hash, description, amount, transaction_date)
  VALUES (
    v_user_id,
    encode(digest('2026-05-08|-67.45|REWE SAGT DANKE 1234', 'sha256'), 'hex'),
    'REWE SAGT DANKE 1234',
    -67.45,
    '2026-05-08'
  )
  ON CONFLICT (user_id, hash) DO NOTHING;

  -- Fragment 3: Stadtwerke Wasser Mai 2026
  INSERT INTO fragments (user_id, hash, description, amount, transaction_date)
  VALUES (
    v_user_id,
    encode(digest('2026-05-12|-28.90|Stadtwerke Frankfurt Wasser', 'sha256'), 'hex'),
    'Stadtwerke Frankfurt Wasser',
    -28.90,
    '2026-05-12'
  )
  ON CONFLICT (user_id, hash) DO NOTHING;

  -- Fragment 4: dm Drogerie Mai 2026
  INSERT INTO fragments (user_id, hash, description, amount, transaction_date)
  VALUES (
    v_user_id,
    encode(digest('2026-05-20|-15.30|dm-drogerie markt sagt Danke', 'sha256'), 'hex'),
    'dm-drogerie markt sagt Danke',
    -15.30,
    '2026-05-20'
  )
  ON CONFLICT (user_id, hash) DO NOTHING;

  -- Fragment 5: Aral April 2026 (Cross-Monat)
  INSERT INTO fragments (user_id, hash, description, amount, transaction_date)
  VALUES (
    v_user_id,
    encode(digest('2026-04-18|-55.20|Aral Tankstelle A5', 'sha256'), 'hex'),
    'Aral Tankstelle A5',
    -55.20,
    '2026-04-18'
  )
  ON CONFLICT (user_id, hash) DO NOTHING;

  -- Fragment 6: Rewe März 2026 (Cross-Monat)
  INSERT INTO fragments (user_id, hash, description, amount, transaction_date)
  VALUES (
    v_user_id,
    encode(digest('2026-03-25|-82.15|REWE SAGT DANKE 1234', 'sha256'), 'hex'),
    'REWE SAGT DANKE 1234',
    -82.15,
    '2026-03-25'
  )
  ON CONFLICT (user_id, hash) DO NOTHING;

END $SEED$;

-- VERIFIKATION
SELECT 'fragments total'         AS tabelle, COUNT(*)::int AS zeilen, '7 (1 alt + 6 neu)' AS erwartet
  FROM fragments              WHERE user_id = current_setting('app.test_user_id')::uuid
UNION ALL
SELECT 'fragments unassigned',     COUNT(*)::int, '6'
  FROM fragments_with_status  WHERE user_id = current_setting('app.test_user_id')::uuid
                                AND status = 'UNASSIGNED'
UNION ALL
SELECT 'fragments Mai 2026 unassigned', COUNT(*)::int, '4'
  FROM fragments_with_status  WHERE user_id = current_setting('app.test_user_id')::uuid
                                AND status = 'UNASSIGNED'
                                AND date_trunc('month', transaction_date) = '2026-05-01'
UNION ALL
SELECT 'fragments April 2026 unassigned', COUNT(*)::int, '1'
  FROM fragments_with_status  WHERE user_id = current_setting('app.test_user_id')::uuid
                                AND status = 'UNASSIGNED'
                                AND date_trunc('month', transaction_date) = '2026-04-01'
UNION ALL
SELECT 'fragments März 2026 unassigned', COUNT(*)::int, '1'
  FROM fragments_with_status  WHERE user_id = current_setting('app.test_user_id')::uuid
                                AND status = 'UNASSIGNED'
                                AND date_trunc('month', transaction_date) = '2026-03-01'
UNION ALL
SELECT 'card_fragment_links',     COUNT(*)::int, '1 (unverändert)'
  FROM card_fragment_links    WHERE user_id = current_setting('app.test_user_id')::uuid
ORDER BY tabelle;

COMMIT;
```

**Sprint-5-Render-Erwartung mit diesen Daten:**
- Header-Subzeile linke Flanke „April 2026": `1 Fragment offen`
- Header-Subzeile linke Flanke „März 2026": `1 Fragment offen`
- Fragment-Stack im Mai 2026: 4 sichtbare Fragmente (Aral 42,80 · REWE 67,45 · Stadtwerke 28,90 · dm 15,30)

---

## 7. Vorgemerkt für spätere Sprints

| Sprint | Thema | Architekten-Vorarbeit nötig? |
|---|---|---|
| 6 | Helper-RPC-Refactor `get_effective_plan_for_month` | **Möglicherweise.** PM hat in Sprint 4 den Tanken-Adjustment-Edge-Case als Auslöser notiert. Funktional: `COALESCE(card_monthly_states.adjusted_amount, get_planned_amount_for_month(...))`. Aktuell inline in zwei RPCs (`calculate_card_amount_for_month` und `calculate_planned_sparrate_for_month`) — Refactor zu gemeinsamem Helper möglich. Pre-Sprint-2-Notiz: Architekt hatte den Refactor damals bewusst nicht gemacht, weil er `calculate_card_amount_for_month` mit-anfasst hätte. |
| 7 | Distiller-Pipeline (`calculate_match_confidence` + Auto-Absorption) | **Wahrscheinlich.** Funktion existiert (siehe §2.3), aber `fragments.confidence` und `fragments.suggested_card_id` werden vom Distiller geschrieben — Pattern muss durchgesprochen werden (write durch Distiller-Edge-Function? oder durch Frontend-Postprocess-Call?). |
| 8 | `schedule_deletion` / `restore_deletion` + Edge-Function `cleanup_deleted_entities` | **Ja.** RPCs existieren, Edge-Function fehlt komplett. Schema-Doku §10.1 hat den Pseudocode — der wird realer Code. Architekt prüft, ob die RPCs in der heutigen Form für alle ENUM-Werte funktionieren oder ob V2-only-ENUM-Werte (`CARD_FRAGMENT_LINK`, `FRAGMENT`) ausgeschlossen werden müssen. |

**Pre-Sprint-2-Pattern fortführen:** Architekt liefert Schema- und RPC-Anpassungen **vor** dem entsprechenden Sprint-Briefing, nicht währenddessen. Hat sich bei Sprint 2 und 4 bewährt — verhindert Schleifen-Klärung mitten im Sprint.

---

## 8. Arbeitsweise mit dem User (PM-Workflow)

| Aspekt | Stand |
|---|---|
| PM-Modell | Claude Opus 4.7 (separater Chat, eröffnet Sprint-Briefings) |
| Architekt-Rolle | Pre-Sprint-Vorklärungen, Sanity-Checks, SQL-Migrationen, Test-Daten-Seeds |
| Persona | `persona_architect.md` (vom Nachfolger gelesen) |
| Output-Format | SQL-Code-Blöcke + knapper deutscher Begleittext, kein Fließtext-Filler |
| Bestätigungs-Pattern | User approved Migrationen/Seeds **manuell** über Supabase SQL Editor (PM-Workflow-Vorgabe) — Architekt liefert das SQL, **führt nicht selbst aus** außer für Read-only-Verifikationen via MCP |
| Read-only via MCP | OK ohne Approval-Reibung — `pg_catalog`, `information_schema` und View-Reads sind unkritisch |
| DDL/DML via MCP | Vermeiden — User soll selbst approven und runnen |

**Klärungs-Stil:** Direkte Befunde am Anfang der Antwort (Konstanten-Inkonsistenzen, Constraint-Konflikte, etc.) — dann erst Lieferung. Hat sich beim TC2-Mathematikfehler und TC4-Constraint-Konflikt in Sprint 2 bewährt.

**Schreib-Sprache:** Deutsch, knapp, präzise. User ist Wirtschaftsmathematiker — mathematische Korrektheit wird erwartet. „Beifang"-Hinweise (z. B. RLS-Konsistenz aus Pre-Sprint-4) sind willkommen, müssen aber klar als solche markiert sein und nicht den Kern-Auftrag verwässern.

---

*Architekt v1 → Architekt v2 | Antigravity Finance 1.0 | 16. Mai 2026*
