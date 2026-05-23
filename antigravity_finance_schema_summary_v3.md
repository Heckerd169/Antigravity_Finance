# Antigravity Finance 1.0 — Schema-Zusammenfassung

**Version:** 3.0
**Status:** Datenbankseitig vollständig implementiert (Sprint 0–8)
**Datum:** 23. Mai 2026
**Iterationen bis hierher:** Phase 1 (4 Iterationen Logik-Klärung) + Phase 2 (9 Migrations-Blöcke) + Phase 3 (Sprint 0–8 mit 6 weiteren RPC-/Spalten-Erweiterungen)
**Referenz-Dokument für Frontend- und Distiller-Phase**

**Änderungen ggü. v2 (Phase-3-Delta):**

- `fragments`: +3 Spalten — `confidence numeric NULL`, `suggested_card_id uuid NULL`, `imported_at timestamptz NOT NULL`
- `cards`: +1 Spalte — `deleted_at timestamptz NULL` (Soft-Delete-Marker)
- `card_monthly_states`: +2 Spalten — `adjustment_scope text` (default `'THIS_MONTH'`, Werte `THIS_MONTH | FORWARD`), `closed_at timestamptz NULL` (in v2 reserviert, in v3 erstmals von `toggle_card_manually_paid` als "eingefroren"-Schutz konsumiert)
- 5 neue RPCs: `create_card_direct`, `create_card_from_fragment`, `get_effective_plan_for_month`, `toggle_card_manually_paid`, `process_csv_import`, `calculate_planned_sparrate_for_month`
- 1 neuer Trigger: `card_monthly_states_set_updated_at` (BEFORE UPDATE → `set_updated_at()`)
- View `fragments_with_status`: zusätzlicher Status-Wert `AUTO_ABSORBED` (Distiller-Output), neue Spalten `confidence`, `suggested_card_id`, `imported_at`
- `link_origin`-Enum-Wert (in v2 nicht ausgeschrieben): **`AUTO_ABSORBED`** (Past Tense, konsistent mit `MANUAL_DROP`)
- Constraint-Klarstellung: `card_planned_timeline.positive_planned` ist `≥ 0`, nicht `> 0`
- Section 9: `closed_at` ist nicht mehr reserviert — siehe Punkt zu `toggle_card_manually_paid` unten

---

## 1. Was gebaut wurde

10 Tabellen, 1 View, **19 App-RPCs** (+ 5 Trigger-Funktionen), **5 Trigger** (+ 1 Event-Trigger), vollständige RLS, Seed-Daten für Steuerklassen 1–6 und globale Konstanten.

```
   IDENTITÄT          EINKOMMEN              KARTEN                   FRAGMENTE
   ─────────          ─────────              ──────                   ─────────
   profiles           income_timeline        cards                    fragments
                      net_estimation_        card_planned_timeline    card_fragment_links
                      brackets               card_monthly_states      fragments_with_status (View)

   INFRASTRUKTUR
   ─────────────
   app_config          → globale Konstanten (Schwellen, Gewichte, Retention)
   deleted_entities    → Trash für Rückgängig-Pattern
```

---

## 2. Beziehungs-Diagramm

```
auth.users (Supabase Auth)
    │
    │ 1:1
    ▼
profiles ─────────────────────────────────┐
    │                                     │
    │ 1:n                                 │
    ▼                                     │
income_timeline                           │
                                          │
                                          │ owner ⤴
profiles                                  │
    │ 1:n                                 │
    ▼                                     │
cards ────────────────────────────────────┤
    │                                     │
    ├─ 1:n ─→ card_planned_timeline      │
    │         (Plan-Zeitreihe)           │
    │                                     │
    ├─ 1:n ─→ card_monthly_states        │
    │         (Sparse Pro-Monat-State)   │
    │                                     │
    └─ 1:n ─→ card_fragment_links ←──┐   │
                  │                  │   │
                  │ n:1              │   │
                  ▼                  │   │
              fragments              │   │
                  │  ▲               │   │
                  │  │ UNIQUE(fragment_id)─┘
                  │  │
                  │  │ fragments.suggested_card_id ⤴ cards
                  │
                  │ owner ⤴
              profiles

deleted_entities  ── owner ──→ profiles
net_estimation_brackets  (global, kein Owner)
app_config              (global, read-only für User)
```

**Lese-Hilfe:**

- Jede Tabelle mit Owner kaskadiert auf `auth.users`-Löschung (DSGVO-Konformität)
- `card_fragment_links` hat den `UNIQUE(fragment_id)`-Constraint → ein Fragment kann maximal einer Karte zugewiesen sein → keine Doppelverbuchung möglich
- `fragments.suggested_card_id` → `cards` ist eine **schwache** Referenz (`ON DELETE SET NULL`): wenn die vorgeschlagene Karte gelöscht wird, verliert das Fragment nur den Vorschlag, nicht sich selbst
- Cascading: Karte gelöscht → States + Links weg, Fragmente bleiben (sie sind unabhängig)

---

## 3. Datenbasis der Sparrate — die Wahrheits-Quellen

Die Sparrate ist nirgends gespeichert. Sie wird zur Laufzeit aus diesen vier Quellen berechnet:

| Quelle | Was sie liefert | Forward-Inheritance? |
|---|---|---|
| `income_timeline` | Brutto + Netto pro Person | Ja — neuester Eintrag ≤ Monat M |
| `card_planned_timeline` | Geplanter Wert pro Karte | Ja — neuester Eintrag ≤ Monat M |
| `card_monthly_states` | Tap-Status, einmalige Anpassung (`adjusted_amount`), `adjustment_scope`, `closed_at` | Nein — exakter Monat |
| `card_fragment_links` + `fragments` | Realer Geldfluss pro Karte | Nein — exakter Monat |

Damit sind **alle drei Zeiträume** (Vergangenheit, Gegenwart, Forecast) durch dieselbe Funktion abgedeckt — der Unterschied ergibt sich automatisch aus dem Daten-Inhalt.

**Plan vs. effective Plan vs. Anzeige-Betrag** — drei verschiedene Begriffe:

| Begriff | RPC | Quelle | Zweck |
|---|---|---|---|
| **Plan** | `get_planned_amount_for_month` | `card_planned_timeline` Forward-Inheritance | Roh-Plan ohne Monats-Anpassung |
| **Effective Plan** | `get_effective_plan_for_month` | `COALESCE(adjusted_amount, plan)` | „Soll-Wert für diesen Monat" — Vergleichsbasis für Status-Labels |
| **Anzeige-Betrag** | `calculate_card_amount_for_month` | §4.3-Prioritätskette Realität → Anpassung → Plan | Was auf der Karte steht |

---

## 4. Funktionen — was das Frontend per RPC ruft

### Im Hot-Path (bei jedem Render)

| Funktion | Wofür | Returns |
|---|---|---|
| `calculate_sparrate_for_month(user_id, month)` | Ring-Zentrum-Wert (Ist) | `numeric` (NULL falls Onboarding offen) |
| `calculate_planned_sparrate_for_month(user_id, month)` | Plan-Sparrate (ohne Realität) | `numeric` |
| `calculate_card_amount_for_month(card_id, month)` | Wert auf Karte (Realität → Anpassung → Plan) | `numeric` (immer ≥ 0) |
| `get_effective_plan_for_month(card_id, month)` | „Soll-Wert" für UI-Vergleiche (`adjusted ∨ plan`) | `numeric` |
| `is_card_active_in_month(card_id, month)` | Karte rendern oder nicht? | `boolean` |
| `get_planned_amount_for_month(card_id, month)` | Roher Plan ohne Adjustment | `numeric` |
| `get_net_monthly_for_month(user_id, person, month)` | Netto-Anzeige | `numeric` |
| `get_split_factor(user_id, month)` | "ICH 60%" / "PARTNER 40%"-Anzeige | `numeric` (0..1) |

### Beim Karten-CRUD (Sprint 5)

Atomare Multi-INSERT-Pfade, die ohne RPC am `cards_assert_initial_plan` DEFERRED-Trigger scheitern würden:

| Funktion | Wofür | Returns |
|---|---|---|
| `create_card_direct(name, type, attribution, frequency, first, last, planned)` | Empty-Slot-Direktklick → neue Karte ohne Fragment-Verknüpfung | `uuid` (Card-ID) |
| `create_card_from_fragment(...same..., fragment_id, link_month)` | Fragment-Drop auf Empty-Slot → neue Karte + Plan + Link | `uuid` (Card-ID) |

### Beim Tap (Sprint 7)

| Funktion | Wofür | Returns |
|---|---|---|
| `toggle_card_manually_paid(card_id, month)` | Karte als „bezahlt" markieren oder zurücknehmen. Idempotent in der Hinsicht, dass mehrfacher Aufruf deterministisch togglet. Verweigert Toggle, wenn `card_monthly_states.closed_at IS NOT NULL` | `boolean` (Wert **nach** dem Toggle) |

### Beim CSV-Import (Sprint 8)

| Funktion | Wofür | Returns |
|---|---|---|
| `process_csv_import(p_rows jsonb)` | Atomare Distiller-Pipeline: SHA-256-Hash → INSERT mit ON CONFLICT → Match-Loop → Auto-Absorption (Score ≥ 0,95) oder Suggestion (Score ≥ 0,60). Eine Transaktion, ein Round-Trip. | `jsonb` (`{inserted_count, skipped_duplicates_count, auto_absorbed_count, fragment_ids[]}`) |
| `calculate_match_confidence(fragment_id, card_id)` | Best-Match-Score, gewichtete Summe aus den drei Sub-Scores | `numeric` (0..1) |
| `name_similarity(description, card_name)` | Trigram + Substring-Boost (`0.80`) | `numeric` |
| `amount_match(fragment_amount, planned)` | Bracket-Score (`<1%→1.00`, `<5%→0.85`, `<15%→0.60`, `<30%→0.30`, sonst `0.00`) | `numeric` |
| `frequency_match(date, card_id)` | Binär `0/1` basierend auf `is_card_active_in_month` | `numeric` |

### Beim Onboarding und Income-Editing

| Funktion | Wofür | Returns |
|---|---|---|
| `estimate_net_monthly(gross_annual, tax_class, tax_year)` | Netto-Vorschlag im Income-Popup | `numeric` (NULL falls keine Bracket passt) |

### Beim Lösch-Pattern

| Funktion | Wofür | Returns |
|---|---|---|
| `schedule_deletion(entity_type, entity_id, payload)` | Aktion in Trash legen mit auto-berechnetem `expires_at` | `uuid` (Trash-ID) |
| `restore_deletion(trash_id)` | "Rückgängig"-Klick | `boolean` |

**RPC-Inventur-Summe:** 19 App-RPCs, alle `SECURITY INVOKER` außer den beiden Service-Hooks `handle_new_user` und `rls_auto_enable`, die DEFINER sind. Alle Read-Path-RPCs sind `STABLE` (Cache-fähig pro Transaktion), Schreib-RPCs sind `VOLATILE`.

---

## 5. Interaktions-Mapping — User-Aktion → DB-Operation

Die kompakte Referenz für die Frontend-Implementierung — aktualisiert für Sprint-5–8-Pfade:

| User-Aktion | DB-Operation |
|---|---|
| **Onboarding: erstes Gehalt** | INSERT `income_timeline` (ICH); UPDATE `profiles.onboarded_at = now()` |
| **Gehalt ändern (vorwärts)** | INSERT neue Zeile in `income_timeline` |
| **Karte anlegen (Direktklick)** | RPC `create_card_direct(...)` |
| **Karte anlegen (Fragment-Drop)** | RPC `create_card_from_fragment(...)` |
| **Karte als „bezahlt" tappen / Tap zurücknehmen** | RPC `toggle_card_manually_paid(card_id, month)` |
| **Fragment auf Karte droppen** | INSERT `card_fragment_links` mit `origin='MANUAL_DROP'` |
| **Fragment ejecten** | DELETE FROM `card_fragment_links WHERE fragment_id=$1` |
| **Betrag anpassen, nur dieser Monat** | UPSERT `card_monthly_states (adjusted_amount, adjustment_scope='THIS_MONTH')` |
| **Betrag anpassen, dauerhaft ab Monat X** | INSERT neue Zeile in `card_planned_timeline` mit `effective_month=X` |
| **Letzte Zahlung in Monat X** | RPC `schedule_deletion('CARD_END', card_id, {...})` |
| **Karte hard-löschen (nie genutzt)** | RPC `schedule_deletion('CARD', card_id, {})` |
| **Rückgängig-Klick** | RPC `restore_deletion(trash_id)` |
| **CSV-Import** | RPC `process_csv_import(p_rows jsonb)` — atomar, eine Transaktion |
| **Sparrate für Ring (Ist)** | RPC `calculate_sparrate_for_month(user_id, month)` |
| **Sparrate Plan-Linie** | RPC `calculate_planned_sparrate_for_month(user_id, month)` |
| **„Soll-Wert" für Status-Label / „Noch X frei"** | RPC `get_effective_plan_for_month(card_id, month)` |
| **Sparraten-Treppe** | Schleife über 12 Monate, je RPC `calculate_sparrate_for_month` + `calculate_planned_sparrate_for_month` |
| **Subzeile "X Fragmente offen"** | SELECT COUNT FROM `fragments_with_status WHERE status='UNASSIGNED' AND date_trunc(...) = $month` |

---

## 6. Lösch-Logik — explizit pro Entität

| Entität | Lösch-Pfad |
|---|---|
| **profiles** | Cascade über `auth.users`-Löschung — DSGVO-Vollbereinigung |
| **income_timeline** | Append-only in V1. Kein Lösch-Pfad im Frontend |
| **cards** | Drei Pfade: (a) **Hard-Delete** wenn nie genutzt — Cascade auf alle Children. (b) **Soft-End** über `last_active_month` — bleibt historisch sichtbar. (c) **Soft-Delete** via `deleted_at`-Spalte (UI-Hide ohne Hard-Delete). Hot-Path-Queries filtern via `WHERE deleted_at IS NULL` (auch funktionaler Index `idx_cards_user_active`) |
| **card_planned_timeline** | Cascade-Delete bei Karten-Hard-Delete. Sonst append-only |
| **card_monthly_states** | Cascade-Delete bei Karten-Hard-Delete. State-Reset (= DELETE) nach UI-Logik möglich |
| **card_fragment_links** | DELETE bei Eject. Cascade bei Karten- oder Fragment-Hard-Delete |
| **fragments** | Hard-Delete erlaubt. Cascade entfernt Links automatisch. `suggested_card_id` ist `ON DELETE SET NULL` |
| **deleted_entities** | Cleanup-Job nach `expires_at`. Restored-Zeilen bleiben dauerhaft |
| **app_config / net_estimation_brackets** | Nur über Service-Role änderbar |

---

## 7. Snapshot-Integrität — wie sie technisch garantiert ist

Das Architekten-Kernprinzip „Daten sind unveränderlich, Ereignisse nicht" wird auf drei Ebenen durchgesetzt:

| Ebene | Mechanismus |
|---|---|
| **Gehaltsänderungen** | Append-only über `income_timeline`. Lookup nimmt neuesten Eintrag ≤ M → vergangene Monate sehen weiterhin den damaligen Stand |
| **Plan-Anpassungen einer Karte** | Append-only über `card_planned_timeline`. Forward-Inheritance ohne Modifikation alter Werte |
| **Karten-Lebensdauer** | `last_active_month` setzt das Ende, ohne historische Monate zu beeinflussen |
| **Monats-Anpassungen** | `card_monthly_states.adjusted_amount` wirkt nur in dem einen Monat, `adjustment_scope` dokumentiert die ursprüngliche User-Intention |
| **Eingefrorene Monate** | `card_monthly_states.closed_at IS NOT NULL` blockiert weitere Mutationen über `toggle_card_manually_paid` |
| **Fragmente** | Sind Geldflüsse — können in der Zeit nicht "verschoben" werden. Eject ist DELETE des Links, nicht des Fragments. `imported_at` dokumentiert Import-Zeitpunkt |
| **CSV-Re-Imports** | `fragments.hash` = SHA-256 über `transaction_date || '|' || amount_fixed || '|' || description_raw`. UNIQUE-Constraint auf `(user_id, hash)` macht Re-Imports deterministisch idempotent |
| **Sparrate** | Niemals als Spalte gespeichert. Funktion liest deterministisch aus den eingefrorenen Quellen |

→ **Eine Plan-Anpassung im April 2026 ändert niemals die Sparrate vom Februar 2026.** Garantiert durch das Schema selbst, nicht durch Anwendungslogik.

---

## 8. RLS — Sicherheits-Modell

| Tabelle | Read | Write |
|---|---|---|
| `profiles` | Owner | Owner |
| `income_timeline` | Owner | Owner |
| `cards` | Owner | Owner |
| `card_planned_timeline` | Owner | Owner |
| `card_monthly_states` | Owner | Owner |
| `fragments` | Owner | Owner |
| `card_fragment_links` | Owner | Owner |
| `deleted_entities` | Owner | Owner |
| `fragments_with_status` (View) | Erbt von `fragments` + `card_fragment_links` | (View, nicht beschreibbar) |
| `app_config` | Alle authentifizierten | Nur Service-Role |
| `net_estimation_brackets` | Alle authentifizierten | Nur Service-Role |

**Owner = `auth.uid() = user_id`**. Keine Cross-User-Sichtbarkeit. Service-Role (Migrations, Admin-Tools) umgeht RLS.

**Event-Trigger `rls_auto_enable`:** stellt sicher, dass jede neue public-Tabelle automatisch RLS aktiviert bekommt — Sicherheitsnetz gegen vergessene RLS-Aktivierungen bei zukünftigen Migrationen.

---

## 9. Was bewusst NICHT gebaut wurde

| Feature | Warum nicht V1 | Wo es später ansetzt |
|---|---|---|
| Periodenabgrenzung | Komplexität | `card_fragment_links.month` ist bereits separates Feld — entkoppelt vom `transaction_date` |
| Rückwirkende Gehaltskorrektur mit Fairness-Delta | Konzeptuelle Komplexität | Neue Tabelle `fairness_deltas` |
| PDF/Excel-Import | Out of scope | Application-Layer, kein Schema-Eingriff nötig (Frontend könnte aber CSV-Adapter für DKB hinaus erweitern) |
| Fragment-Clustering | Manuelle Zuordnung gewollt | Application-Layer |
| Top-3-Abweichungs-Treiber | Analytics-Feature | Materialisierte View über `card_monthly_states` + Vergleichsmonate |
| Partner-only-Karten | Sinnlos für Sparrate-Logik | UI-Lärm — keine technische Lücke |
| Cleanup-Edge-Function für Trash | Out of scope der DB-Migration | Supabase Edge Function `cleanup_deleted_entities` |
| Konfidenz-Verbesserung | Trigram reicht für V1 | Embeddings, Levenshtein, ML-Klassifikator |
| Kategorie-Vorhersage | Karten-Zuordnung reicht für V1 | Eigenes Modell pro User |
| Steuerklasse-Wechsel via UI | Aufwand vs. Nutzen | Settings-Bereich in V2, ändert `profiles.tax_class` |
| Manueller Monatsabschluss-UI | Wird vom Distiller-Workflow nicht benötigt | `card_monthly_states.closed_at` ist als Block-Mechanik bereits da (siehe `toggle_card_manually_paid`-RPC) — UI dazu kann später beliebig kommen |

**Schema-Hinweis V3 — `card_monthly_states.closed_at`:** In v2 war das Feld reserviert und ungenutzt. In v3 wird es erstmals konsumiert: `toggle_card_manually_paid` verweigert die Mutation, wenn die Row für diesen Monat `closed_at IS NOT NULL` hat. Damit hat das Feld eine erste echte Semantik („dieser Monat ist abgeschlossen, kein weiterer Toggle erlaubt"). Geschrieben wird `closed_at` aktuell von keiner Frontend-Operation — das bleibt für eine zukünftige Edge-Function oder Settings-UI offen.

**Schema-Hinweis V3 — `card_monthly_states.adjustment_scope`:** Default `'THIS_MONTH'`. Werte: `THIS_MONTH | FORWARD`. Aktuell dokumentiert die Spalte die ursprüngliche User-Intention für ein Adjustment (siehe Design-Doku §7 „Betrag anpassen, nur diesen Monat" vs. „… ab nächstem Monat"). Die `FORWARD`-Semantik wird vom Anzeige-Pfad **nicht** ausgewertet — eine zukünftige UI-Erweiterung könnte die Werte für „künftige Monate noch nicht überschritten" o. ä. nutzen.

---

## 10. Was direkt anschließend zu tun ist

### 10.1 Cleanup-Edge-Function für `deleted_entities`

Pseudocode für die Edge Function (alle 30 Sekunden ausgeführt):

```typescript
const expired = await supabase
  .from('deleted_entities')
  .select('*')
  .lte('expires_at', new Date().toISOString())
  .is('restored_at', null);

for (const row of expired.data) {
  switch (row.entity_type) {
    case 'CARD_END':
      await supabase.from('cards')
        .update({ last_active_month: row.payload.new_last_active_month })
        .eq('id', row.entity_id);
      break;
    case 'CARD':
      await supabase.from('cards').delete().eq('id', row.entity_id);
      break;
    case 'CARD_FRAGMENT_LINK':
      await supabase.from('card_fragment_links').delete().eq('id', row.entity_id);
      break;
    case 'FRAGMENT':
      await supabase.from('fragments').delete().eq('id', row.entity_id);
      break;
  }
  await supabase.from('deleted_entities').delete().eq('id', row.id);
}
```

**Hinweis V1:** Aktuell genutzte ENUM-Werte sind `CARD_END` und `CARD`. `CARD_FRAGMENT_LINK` und `FRAGMENT` bleiben für V2 reserviert (Eject und Fragment-Delete laufen direkt ohne Trash-Umweg).

### 10.2 Migration als versionierte Datei ablegen

Die Migrationen in `supabase/migrations/` reproduzierbar halten. Sprint 5–8 hat 6 zusätzliche RPCs / Spalten / Trigger eingeführt, die in einer eigenen 0002…-Migrationsdatei zusammengefasst werden sollten.

### 10.3 RPC-Wrapper im Frontend regenerieren

Nach Sprint 5–8-Erweiterungen einmal:

```bash
supabase gen types typescript --project-id <id> > src/lib/supabase-types.ts
```

Damit kennen die TS-Typen die fünf neuen RPCs (`create_card_direct`, `create_card_from_fragment`, `get_effective_plan_for_month`, `toggle_card_manually_paid`, `process_csv_import`, `calculate_planned_sparrate_for_month`) und die drei neuen Fragment-Spalten (`confidence`, `suggested_card_id`, `imported_at`).

---

## 11. Indexes — Hot-Path-Beschleunigung

Sechs funktionale / partielle Indexes über die v2-PK/UK-Indexes hinaus:

| Tabelle | Index | Zweck |
|---|---|---|
| `cards` | `idx_cards_user_active` (partial, `WHERE deleted_at IS NULL`) | Hot-Path-Karten-Listing pro User |
| `cards` | `idx_cards_active_range` (partial) | `is_card_active_in_month`-Lookup |
| `card_planned_timeline` | `idx_card_planned_lookup (card_id, effective_month DESC)` | Forward-Inheritance-Lookup |
| `card_monthly_states` | `idx_states_card_month`, `idx_states_user_month` | Monats-State-Lookup |
| `card_fragment_links` | `idx_links_card_month`, `idx_links_user_month` | Realitäts-Sum-Lookup |
| `fragments` | `idx_fragments_user_date`, `idx_fragments_description_trgm` (GIN auf `description gin_trgm_ops`) | Roh-Liste + Distiller-Trigram-Score |
| `income_timeline` | `idx_income_timeline_lookup (user_id, person, effective_month DESC)` | Netto-Forward-Inheritance |
| `net_estimation_brackets` | `idx_brackets_lookup (tax_class, tax_year, gross_annual_min)` | Bracket-Lookup |
| `deleted_entities` | `idx_deleted_pending`, `idx_deleted_user_pending` (beide partial `WHERE restored_at IS NULL`) | Cleanup-Edge-Function-Polling |

---

## 12. Trigger-Übersicht

| Trigger | Tabelle | Timing | Funktion | Zweck |
|---|---|---|---|---|
| `on_auth_user_created` | `auth.users` (extern) | AFTER INSERT | `handle_new_user()` (DEFINER) | Auto-INSERT `profiles`-Row |
| `cards_assert_initial_plan` | `cards` | AFTER (DEFERRABLE INITIALLY DEFERRED, CONSTRAINT) | `assert_card_has_initial_plan()` | Erzwingt: jede `cards`-Row hat mindestens eine `card_planned_timeline`-Zeile am Transaktions-Ende |
| `cards_set_updated_at` | `cards` | BEFORE UPDATE | `set_updated_at()` | Auto-`updated_at = now()` |
| `card_monthly_states_set_updated_at` | `card_monthly_states` | BEFORE UPDATE | `set_updated_at()` | Auto-`updated_at = now()` |
| `profiles_set_updated_at` | `profiles` | BEFORE UPDATE | `set_updated_at()` | Auto-`updated_at = now()` |
| `rls_auto_enable` (Event-Trigger) | (DB-global) | DDL `CREATE TABLE` | `rls_auto_enable()` (DEFINER) | Aktiviert RLS automatisch auf jede neue Tabelle |

---

## 13. Globale Konstanten — `app_config`

| Key | Wert | Bedeutung |
|---|---|---|
| `confidence.weight_name` | `0.50` | Gewicht Trigram-Namensähnlichkeit |
| `confidence.weight_amount` | `0.30` | Gewicht Betrag-Bracket |
| `confidence.weight_frequency` | `0.20` | Gewicht Frequenz-Aktiv |
| `confidence.minimum_match_threshold` | `0.20` | Unter dieser Schwelle: Score wird auf 0 zurückgesetzt |
| `confidence.badge_threshold` | `0.60` | Über dieser Schwelle: Suggestion-Badge im Frontend |
| `confidence.auto_absorption_threshold` | `0.95` | Über dieser Schwelle: Auto-Absorb via Distiller-Pipeline |
| `trash.retention_seconds` | `60` | UI versteckt Trash-Zeile nach 5 s, Edge-Function löscht final nach diesem Wert |

Alle Werte als JSONB gespeichert (`value` Spalte). Read-Path: `(value::text)::numeric` oder `(value->>0)` je nach Cast.

---

## 14. Verbleibender Notiz-Zettel aus Phase 1

Eine offene Doku-Aufgabe (Phase 1, Frage 5):
Section 3.2 des ursprünglichen Design-Dokuments schreibt „Σ Planwerte aller Fixkosten (Ich-Anteil)" — bei Budget-Karten fehlt das „Ich-Anteil". In der Implementierung ist das korrekt behandelt (Budget-Karten sind durch `budget_never_shared`-Constraint nie GEMEINSAM, also implizit immer ICH-Anteil = 100 %). Diese Inkonsistenz ist im überarbeiteten Design-Dokument v2 behoben.

---

## Was du jetzt hast

Eine vollständig instrumentierte Datenbank für Antigravity Finance 1.0 — inklusive Sprint-5-Card-CRUD, Sprint-6-Sparrate-Gate, Sprint-7-BUDGET-Tap, Sprint-8-Distiller-Pipeline. Jede Sparrate ist deterministisch berechenbar aus eingefrorenen Quellen. Jede User-Aktion hat genau eine definierte DB-Operation. Jede Lösch-Operation hat einen Pfad, ein Limit und ein Rückgängig-Fenster. Snapshot-Integrität ist nicht eine Anwendungs-Regel — sie ist eine Schema-Eigenschaft. CSV-Import ist atomar und re-import-deterministisch.

---

*Architekt-Persona | Antigravity Finance 1.0 | 23. Mai 2026*
