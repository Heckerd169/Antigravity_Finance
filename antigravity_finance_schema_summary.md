# Antigravity Finance 1.0 — Schema-Zusammenfassung

**Version:** 3.4
**Status:** Datenbankseitig vollständig implementiert (Sprint 0–9 + Pre-Sprint-10-Patches + Sprint v2-04 Mehrkonten Stufe 1 + Sprint v2-05 Karten-Lebenszyklus + Sprint v2-06 B2-Treiber)
**Datum:** 25. Juli 2026
**Datei-Konvention (23.07.2026):** Stabiler Dateiname `antigravity_finance_schema_summary.md` — Version nur noch im Header.
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

**Änderungen v3 → v3.1 (Sprint-9-Stufe-1 + Pre-Sprint-10):**

- `profiles`: +1 Spalte — `own_ibans text[] NOT NULL DEFAULT '{}'` (Liste eigener IBANs für Cross-Account-Transfer-Erkennung)
- `fragments`: +2 Spalten — `counterparty_iban text NULL`, `transfer_type text NULL` (CHECK: NULL oder `'INTERNAL_TRANSFER'`)
- 1 neuer Partial-Index: `idx_fragments_transfer_type` auf `(user_id, transfer_type) WHERE transfer_type IS NOT NULL`
- `process_csv_import`-Signatur erweitert: zweiter Parameter `p_format_hint text DEFAULT 'DKB'` (Future-Proof-Slot für format-spezifische Logik, in Stufe 1 nicht aktiv im Body); `p_rows`-Zeilen dürfen optional `counterparty_iban` enthalten; Return-JSON um `iban_backfilled_count`, `internal_transfers_count`, `links_removed_for_transfers_count` erweitert
- 1 neue RPC: `toggle_card_hidden(card_id, hidden)` für UI-Soft-Delete-Toggle (Sprint 10 V4'')
- View `fragments_with_status`: +2 Spalten am Ende (`counterparty_iban`, `transfer_type`); zusätzlicher Status-Wert `'INTERNAL_TRANSFER'` (höchste Priorität, schlägt alle anderen Stati)
- **Snapshot-Integritäts-Patch (Pre-Sprint-10):** `is_card_active_in_month` filtert nicht mehr auf `deleted_at` — die zwei Sparrate-RPCs aggregieren jetzt korrekt über hidden Karten. Hide ist UI-Concern, nicht Berechnungs-Concern. Konsumenten mit echtem Hide-Bedarf (`process_csv_import`-Match-Loop, `toggle_card_manually_paid`-Ownership-Check) filtern explizit
- **Defense-in-Depth-Patch (Pre-Sprint-10):** `calculate_card_amount_for_month` Fragment-Aggregation filtert hart auf **`transfer_type IS NULL`** — deckt `INTERNAL_TRANSFER`, `ASSET_REALLOCATION` und etwaige künftige Transfer-Typen automatisch ab. `calculate_sparrate_for_month` ist transitiv geschützt (liest Fragmente ausschließlich über diese Funktion)
- Sprint-9-OQ-A/B/C-Pattern dokumentiert (siehe Section 7 + Section 9)

**Änderungen v3.1 → v3.2 (Sprint v2-04 „Mehrkonten Stufe 1"):**

- v2-04 Mehrkonten Stufe 1: `transfer_type`-Erweiterung, Markier-RPC, OQ-B-Trigger, DKB_VISA-Format, Duplikat-Hash-Fix.

**Änderungen v3.2 → v3.3 (Sprint v2-05 „Karten-Lebenszyklus"):**

- v2-05 Karten-Lebenszyklus: 5 neue RPCs (`end_card`, `card_delete_gate`, `delete_card`, `restore_card`, `cleanup_expired_card_trash`), `toggle_card_hidden` per DROP entfernt (Beschluss E2), `cards.deleted_at` semantisch von Verbergen- zu Papierkorb-Marker gewechselt, Trash-Flow (`schedule_deletion`/`restore_deletion`) für Karten erstmals verdrahtet.

**Änderungen v3.3 → v3.4 (Sprint v2-06 „B2 Abweichungs-Treiber"):**

- 1 neue Lese-RPC: `get_year_deviation_drivers(p_year integer, p_limit integer DEFAULT 3)` — Top-N Abweichungs-Treiber je Monat eines Kalenderjahres, EIN Call für Welle-Tooltip (Top-1) und Popup (Top-3). Additiv, read-only, keine Schema- oder Daten-Änderung.
- Keine Tabellen-, Spalten-, Index-, Trigger- oder Enum-Änderung.

**`transfer_type` — Wertemenge + Semantik (v3.2):**

> `transfer_type text NULL` — CHECK `transfer_type_valid`: `NULL` | `'INTERNAL_TRANSFER'` | `'ASSET_REALLOCATION'`.
> - `INTERNAL_TRANSFER`: automatisch beim Import gesetzt (IBAN-Erkennung gegen `own_ibans` **oder** DKB_VISA-Heuristik).
> - `ASSET_REALLOCATION`: **ausschließlich manuell** via `set_fragment_asset_reallocation` — Vermögensumschichtungen (z. B. Broker→Topf), die strukturell nicht von Sparüberweisungen unterscheidbar sind (Beschluss F3). Verhält sich in allen Berechnungs- und Link-Pfaden identisch zu `INTERNAL_TRANSFER`.
> - Semantik-Invariante (OQ-B, erweitert): Fragmente mit `transfer_type IS NOT NULL` sind nie an Karten verlinkbar und zählen nie in Karten-Beträge oder Sparrate.

**View `fragments_with_status` — Status (v3.2):**

> `status`-Spalte liefert bei gesetztem `transfer_type` jetzt den **konkreten Typ** (`'INTERNAL_TRANSFER'` oder `'ASSET_REALLOCATION'`) statt pauschal `'INTERNAL_TRANSFER'`. Frontend-Interim (bis DD-Geste): beide Werte wie den bisherigen Transfer-Status behandeln (ausgegraut + Badge).

---

## 1. Was gebaut wurde

10 Tabellen, 1 View, **26 App-RPCs** (+ 6 Trigger-Funktionen; v2-05: +5 Lebenszyklus-RPCs, −`toggle_card_hidden`), **6 Trigger** (+ 1 Event-Trigger), vollständige RLS, Seed-Daten für Steuerklassen 1–6 und globale Konstanten.

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

### Bei der Jahres-Welle (Sprint v2-06)

| Funktion | Wofür | Returns |
|---|---|---|
| `get_year_deviation_drivers(p_year integer, p_limit integer DEFAULT 3)` | B2-Abweichungs-Treiber je Monat — EIN Call speist Welle-Tooltip (Top-1) und Popup-Monatsklick (Top-3). `STABLE`, `SECURITY INVOKER`, `SET search_path TO 'public'`, **ohne** `p_user_id` (auth.uid()-basiert, Hot-Path-Konvention) + expliziter `cards.user_id`-Filter als Defense-in-Depth. Auth-Pflicht 28000; `p_year` außerhalb 1900–2999 und `p_limit` außerhalb 1–50 → 22023 | `jsonb` |

**Return-Form** — immer genau 12 Einträge (auch ohne Treiber), aufsteigend nach Monat:

```jsonc
[{ "month_index": 0, "month": "2026-01-01",
   "drivers": [{ "card_id": "…", "card_name": "Tanken", "card_type": "BUDGET",
                 "attribution": "ICH", "ist": 187.20, "plan": 150.00,
                 "share": 1.000000, "delta": -37.20 }] }, …]
```

**Heuristik (Konzept-Papier E1 + User-Entscheid 25.07.2026):**

```
delta := round( vorzeichen × anteil × ( calculate_card_amount_for_month(karte, M)
                                      − get_effective_plan_for_month(karte, M) ), 2)
         vorzeichen = +1 für INCOME, −1 für FIXED_COST/BUDGET
         anteil     = get_split_factor(M) bei GEMEINSAM, sonst 1
```

- `delta` ist damit die **Wirkung auf die Sparrate**: negativ = der Monat ist um diesen Betrag schlechter als geplant. `ist`/`plan` bleiben die **rohen** Kartenwerte (wie auf der Karte sichtbar), `share` weist den angewandten Anteil aus.
- **Invariante:** `Σ delta(alle aktiven Karten, M) = calculate_sparrate_for_month(M) − calculate_planned_sparrate_for_month(M)`. Beide Sparrate-RPCs aggregieren über exakt dieselbe Kartenmenge, denselben Split-Faktor und dieselben Vorzeichen — die Treiber erklären also genau die IST/Plan-Differenz, die der Tooltip darüber ausweist. Auf der Übungs-DB und auf Prod (alle 12 Monate 2026) verifiziert.
- Ranking `|delta|` absteigend, Tiebreaker Kartenname aufsteigend (deterministisch, analog §11-Mehrfach-Match). `delta = 0` fällt raus; Monat ohne Abweichung → `"drivers": []`.
- **Keine eigene Betragslogik** (§7 Regel 1): ausschließlich Aufrufe der bestehenden §4.3-kompletten Basis-RPCs. Transfer-Fragmente sind dadurch transitiv ausgeschlossen.
- **Snapshot-Integrität §2.1:** KEIN `cards.deleted_at`-Filter — identisch zu den Sparrate-RPCs, deren Kurve die Treiber erklären. Papierkorb-Karten haben per Lösch-Gate weder Links noch States noch Vergangenheits-Plan → `delta = 0` → fallen ohnehin aus dem Ranking.
- **Sichtbarkeits-Grenze (bewusst, Konzept §2):** B2 sieht nur Karten-Realität. Unzugeordnete Rohmasse ist unsichtbar; die Qualität wächst mit der Kuratierung. E4 (Rohmasse-Pseudo-Treiber) bleibt offene DD-Frage und ist **nicht** umgesetzt.

### Beim Karten-Lebenszyklus (Sprint v2-05)

**`toggle_card_hidden(card_id, hidden boolean)` — ENTFERNT (Sprint v2-05, Beschluss E2):** per DROP entfernt, ersatzlos gestrichen (0 versteckte Karten im Bestand zum Migrationszeitpunkt). Ersetzt durch die fünf RPCs unten — alle `SECURITY INVOKER`, `SET search_path TO 'public'`, Auth-Pflicht (28000).

| Funktion | Wofür | Returns |
|---|---|---|
| `end_card(p_card_id uuid, p_last_month date)` | Setzt `cards.last_active_month`. `p_last_month = NULL` hebt das Ende auf. Validierung: Monatserster (22023), `≥ first_active_month` (22023); ONCE-Karten werden abgelehnt (22023, first=last-Constraint). Ownership-Verstoß 42704 | `jsonb` |
| `card_delete_gate(p_card_id uuid)` | STABLE. Lösch-Gate-Prüfung fürs UI (ausgegrauter Lösch-Menüpunkt mit Klartext-Grund). Grund-Codes `HAS_LINKS` (Fragment-Links in irgendeinem Monat), `HAS_STATES` (`card_monthly_states` existiert), `HAS_PAST_PLAN` (`first_active_month` in der Vergangenheit) | `jsonb` (`{deletable boolean, reasons text[]}`) |
| `delete_card(p_card_id uuid)` | Prüft `card_delete_gate` (Verstoß → 23514 mit Gründen), setzt `deleted_at = now()`, legt via bestehendem `schedule_deletion('CARD', id, row-snapshot)` den `deleted_entities`-Eintrag an (`expires_at = now() + trash.retention_seconds`) | `jsonb` (`{card_id, trash_id, expires_at}`) |
| `restore_card(p_card_id uuid)` | Findet den jüngsten offenen Trash-Eintrag der Karte, validiert über bestehendes `restore_deletion` (Ablauf/Row-Lock), setzt `deleted_at = NULL` | `boolean` |
| `cleanup_expired_card_trash()` | Opportunistischer Hard-Delete-Vollzug (Beschluss E3 Option b), vom Frontend vor jeder Lebenszyklus-Aktion aufgerufen: löscht abgelaufene, nicht wiederhergestellte eigene Trash-Karten hart (DB-Kaskade entfernt `card_planned_timeline`/`card_monthly_states`/`card_fragment_links`; Fragmente bleiben, `suggested_card_id` → `NULL`) und entfernt die vollzogenen Trash-Zeilen; wiederhergestellte Trash-Zeilen bleiben dauerhaft (§2.4) | `integer` (Anzahl hart gelöschter Karten) |

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

### Beim CSV-Import (Sprint 8 + Sprint 9)

| Funktion | Wofür | Returns |
|---|---|---|
| `process_csv_import(p_rows jsonb, p_format_hint text DEFAULT 'DKB')` | Atomare Distiller-Pipeline: SHA-256-Hash → UPSERT mit ON CONFLICT DO UPDATE (IBAN-Backfill bei bestehendem Hash und leerem `counterparty_iban`) → Transfer-Erkennung via `counterparty_iban = ANY(own_ibans)` (mit OQ-B-Link-Auflösung) → Confidence-Loop nur für echte INSERTs ohne Transfer → Auto-Absorption (Score ≥ 0,95) oder Suggestion (Score ≥ 0,60). Eine Transaktion, ein Round-Trip. `p_format_hint` jetzt **aktiv**: `'DKB'` (Default) | `'CORTAL_CONSORS'` | `'DKB_VISA'`. Bei `'DKB_VISA'` greift zusätzlich zur IBAN-Erkennung die KK-Klassifikation: Zeilen mit `amount > 0` **und** Beschreibung `ILIKE 'Einzahlung%'` **oder** `ILIKE 'Ausgleich Kreditkarte%'` → `INTERNAL_TRANSFER` (inkl. OQ-B-Link-Auflösung), da der DKB-Visa-Export keine Gegen-IBAN führt. `p_rows`-Zeilen dürfen optional `counterparty_iban` enthalten | `jsonb` (`{inserted_count, skipped_duplicates_count, iban_backfilled_count, auto_absorbed_count, internal_transfers_count, links_removed_for_transfers_count, fragment_ids[]}`) |
| `calculate_match_confidence(fragment_id, card_id)` | Best-Match-Score, gewichtete Summe aus den drei Sub-Scores | `numeric` (0..1) |
| `name_similarity(description, card_name)` | Trigram + Substring-Boost (`0.80`) | `numeric` |
| `amount_match(fragment_amount, planned)` | Bracket-Score (`<1%→1.00`, `<5%→0.85`, `<15%→0.60`, `<30%→0.30`, sonst `0.00`) | `numeric` |
| `frequency_match(date, card_id)` | Binär `0/1` basierend auf `is_card_active_in_month` | `numeric` |

### Beim Transfer-Markieren (Sprint v2-04)

| Funktion | Wofür | Returns |
|---|---|---|
| `set_fragment_asset_reallocation(p_fragment_id uuid, p_set boolean DEFAULT true)` | Schreib-RPC. Auth-Pflicht (28000), expliziter Ownership-Check zusätzlich zu RLS (42501). Setzen (`p_set=true`): erlaubt aus `NULL` und `INTERNAL_TRANSFER`→`ASSET_REALLOCATION`; verweigert mit 23514, wenn das Fragment einer Karte zugeordnet ist (Zuordnung zuerst lösen — kein stilles Entkoppeln); räumt `suggested_card_id`/`confidence`. Rücknahme (`p_set=false`): nur aus `ASSET_REALLOCATION`, setzt `NULL`; war das Fragment IBAN-erkennbar, stellt der nächste Re-Import `INTERNAL_TRANSFER` automatisch wieder her | `jsonb` (`{fragment_id, transfer_type}`) |

### Beim Onboarding und Income-Editing

| Funktion | Wofür | Returns |
|---|---|---|
| `estimate_net_monthly(gross_annual, tax_class, tax_year)` | Netto-Vorschlag im Income-Popup | `numeric` (NULL falls keine Bracket passt) |

### Beim Lösch-Pattern

| Funktion | Wofür | Returns |
|---|---|---|
| `schedule_deletion(entity_type, entity_id, payload)` | Aktion in Trash legen mit auto-berechnetem `expires_at` | `uuid` (Trash-ID) |
| `restore_deletion(trash_id)` | "Rückgängig"-Klick | `boolean` |

**RPC-Inventur-Summe:** 22 App-RPCs, alle `SECURITY INVOKER` außer den beiden Service-Hooks `handle_new_user` und `rls_auto_enable`, die DEFINER sind. Alle Read-Path-RPCs sind `STABLE` (Cache-fähig pro Transaktion), Schreib-RPCs sind `VOLATILE`.

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
| **CSV-Import (DKB)** | RPC `process_csv_import(p_rows, 'DKB')` — atomar, eine Transaktion |
| **CSV-Import (Cortal Consors)** | RPC `process_csv_import(p_rows, 'CORTAL_CONSORS')` — selbe RPC, andere Format-Hint, identische Pipeline |
| **Karte beenden / Ende aufheben** (v2-05) | RPC `end_card(card_id, last_month)` — `NULL` hebt das Ende auf; wirkt nicht auf vergangene Monate |
| **Karte löschen / Rückgängig** (v2-05, ersetzt Verbergen) | RPC `delete_card(card_id)` (nur bei grünem `card_delete_gate`) → Papierkorb; `restore_card(card_id)`; Vollzug via `cleanup_expired_card_trash()` |
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
| **cards** | Drei Pfade (seit v2-05): (a) **Beenden** über `last_active_month` (RPC `end_card`, inkl. Aufheben) — bleibt historisch sichtbar. (b) **Löschen mit Lösch-Gate** (RPC `delete_card`: nur ohne Links/States/Vergangenheits-Plan) über den §2.4-Papierkorb (`deleted_at` + `deleted_entities`, Vollzug `cleanup_expired_card_trash` mit Cascade auf alle Children). (c) **Soft-Detach** der Links (Eject/Bulk) als bewusste User-Korrektur. Das Sprint-10-Verbergen ist ersatzlos entfallen. **Wichtig:** `deleted_at`-Filterung ist UI-Concern, nicht Berechnungs-Concern — Sparraten-RPCs (`calculate_sparrate_for_month`, `calculate_planned_sparrate_for_month`) ignorieren `deleted_at` (§2.1 Snapshot-Integrität). Nur Surfaces, die UI-Sicht produzieren, filtern explizit über `WHERE deleted_at IS NULL` (Karten-Karussell, Detail-Overlay, Stack-Suggestion, KI-Vorschlag-Badge sowie der Match-Loop in `process_csv_import` und der Ownership-Check in `toggle_card_manually_paid`). Funktionaler Index `idx_cards_user_active (user_id) WHERE deleted_at IS NULL` beschleunigt diese UI-Queries. |
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
| **Cross-Account-Transfers** | `fragments.transfer_type = 'INTERNAL_TRANSFER'` markiert Bewegungen zwischen eigenen Konten (`counterparty_iban = ANY(profiles.own_ibans)`). Solche Fragmente werden in `calculate_card_amount_for_month` explizit aus dem Aggregat ausgeschlossen — Sparrate spiegelt nur echte Einnahmen/Ausgaben. OQ-B-Daten-Invariante: bei Transfer-Markierung wird ein eventuell bestehender `card_fragment_link` gelöst (Counter `links_removed_for_transfers_count` im RPC-Return) und Suggestion-State (`confidence`/`suggested_card_id`) zurückgesetzt |
| **UI-Hide ändert keine Aggregation** | `cards.deleted_at IS NOT NULL` schließt eine Karte aus allen UI-Monatsansichten aus, hat aber **keinen Effekt** auf `calculate_sparrate_for_month` / `calculate_planned_sparrate_for_month`. Historische Sparraten bleiben unverändert, auch wenn der User eine Karte verbirgt, die in Vergangenheit Beträge beigesteuert hat |
| **Fragmente** | Sind Geldflüsse — können in der Zeit nicht "verschoben" werden. Eject ist DELETE des Links, nicht des Fragments. `imported_at` dokumentiert Import-Zeitpunkt |
| **CSV-Re-Imports** | `fragments.hash` = SHA-256 über `transaction_date || '|' || amount_fixed || '|' || description_raw`; **byte-identische Zeilen innerhalb eines Import-Batches erhalten ab dem 2. Vorkommen das deterministische Suffix `|#N`** (N = Vorkommens-Index in Dateireihenfolge; erstes Vorkommen = alte Formel, abwärtskompatibel; Re-Import → gleiche Indizes → gleiche Hashes, idempotent). Bekannte Grenze: identische Buchungen über zwei Teil-Exporte desselben Monats deduplizieren weiterhin — Monats-Exporte vollständig importieren. `counterparty_iban` ist **bewusst nicht** Hash-Bestandteil (siehe OQ-A) — Re-Imports treffen den existierenden Hash und backfillen die IBAN-Spalte via `ON CONFLICT (user_id, hash) DO UPDATE SET counterparty_iban = EXCLUDED.counterparty_iban WHERE fragments.counterparty_iban IS NULL`. UNIQUE-Constraint auf `(user_id, hash)` macht Re-Imports deterministisch idempotent |
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
| Paired-Fragment-Verlinkung (`paired_fragment_id`) | Stufe-1-Cross-Account-Erkennung kommt mit Single-Side-Markierung aus — kein Spiegel-Paar nötig | Mögliche V2-Erweiterung wenn Multi-Account-Reconciliation gefragt |
| IBAN-Format-Validierung in der DB | Stufe-1 vertraut Frontend-Validierung (Sprint 9 Cortal-Parser) | Optionale CHECK-Constraint über regex_match in V2 |
| UI für Verwaltung von `own_ibans` | Aktuell nur via Service-Role oder Migration setzbar | Settings-Bereich in V2 oder Sprint-9-Folge-Sprint |
| ~~Hide-Rückgängig-UI ("Verborgene Karten anzeigen")~~ | **Obsolet seit v2-05** — Verbergen ist ersatzlos entfallen; Rückgängig läuft über den Papierkorb (`restore_card` innerhalb der Retention) | — |

**Schema-Hinweis V3 — `card_monthly_states.closed_at`:** In v2 war das Feld reserviert und ungenutzt. In v3 wird es erstmals konsumiert: `toggle_card_manually_paid` verweigert die Mutation, wenn die Row für diesen Monat `closed_at IS NOT NULL` hat. Damit hat das Feld eine erste echte Semantik („dieser Monat ist abgeschlossen, kein weiterer Toggle erlaubt"). Geschrieben wird `closed_at` aktuell von keiner Frontend-Operation — das bleibt für eine zukünftige Edge-Function oder Settings-UI offen.

**Schema-Hinweis V3 — `card_monthly_states.adjustment_scope`:** Default `'THIS_MONTH'`. Werte: `THIS_MONTH | FORWARD`. Aktuell dokumentiert die Spalte die ursprüngliche User-Intention für ein Adjustment (siehe Design-Doku §7 „Betrag anpassen, nur diesen Monat" vs. „… ab nächstem Monat"). Die `FORWARD`-Semantik wird vom Anzeige-Pfad **nicht** ausgewertet — eine zukünftige UI-Erweiterung könnte die Werte für „künftige Monate noch nicht überschritten" o. ä. nutzen.

**Schema-Hinweis V3.1 — Cross-Account-Pattern (Sprint 9 OQ-A/B/C):**

- **OQ-A — Backfill bestehender Fragmente:** User-getriebener Re-Import via `ON CONFLICT (user_id, hash) DO UPDATE SET counterparty_iban = EXCLUDED.counterparty_iban WHERE fragments.counterparty_iban IS NULL`. Hash-Formel unverändert zu Sprint 8 (`transaction_date || '|' || amount_fixed || '|' || description_raw`), damit Re-Import den vorhandenen Eintrag deterministisch trifft. `counterparty_iban` ist explizit kein Hash-Bestandteil.
- **OQ-B — Konflikt Transfer + bestehender Karten-Link:** Bei Transfer-Markierung wird ein eventuell bestehender `card_fragment_link` gelöst, `confidence`/`suggested_card_id` werden zurückgesetzt, Counter `links_removed_for_transfers_count` im RPC-Return getrackt. `manually_paid` bleibt orthogonal unberührt.
- **OQ-C — Hash-Adapter:** Hash-Logik im RPC, nicht im Frontend (Single-Source-of-Truth für Idempotenz). `p_format_hint` ist Future-Proof-Slot ohne aktive Logik in Stufe 1 — wenn künftige Bank-Formate format-spezifische Description-Normalisierung brauchen, wird das hier eingehängt.

**Schema-Hinweis V3.1 — `is_card_active_in_month` ohne Hide-Concern:**

Die Funktion ist seit Pre-Sprint-10 strikt Frequenz/Range-Check. Sie filtert `cards.deleted_at` **nicht** mehr. Konsumenten, die hidden Karten ausschließen müssen, filtern explizit über `cards.deleted_at IS NULL` in ihrer eigenen Query — diese Konsumenten sind aktuell `process_csv_import` (Match-Loop) und `toggle_card_manually_paid` (Ownership-Check). Die Sparrate-RPCs **dürfen nicht filtern** (§2.1 Snapshot-Integrität).

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

**Hinweis V3.1:** Soft-Delete von Karten (`cards.deleted_at`) läuft **nicht** über die Cleanup-Edge-Function. Hide ist explizit reversibel (5s-Toast-„Rückgängig" via `toggle_card_hidden(card_id, false)`) und ohne Retention-Limit — der User soll die Karte selbst entscheiden, ob sie verborgen bleibt. Ein User-Pfad zum Wieder-Einblenden ist V2-Vormerkung.

**Hinweis v2-05 (löst Hinweis V3.1 ab):** Der Trash-Flow für Karten ist seit Sprint v2-05 tatsächlich verdrahtet — `delete_card` nutzt das bestehende `schedule_deletion('CARD', id, row-snapshot)`, `restore_card` nutzt das bestehende `restore_deletion(trash_id)`, und `cleanup_expired_card_trash()` vollzieht den Hard-Delete opportunistisch beim nächsten App-Zugriff (Option b aus dem Architekt-Stufe-1-Papier) statt über eine Cleanup-Edge-Function. `cards.deleted_at` ist damit **kein** Verbergen-Marker mehr, sondern ausschließlich Papierkorb-Marker: gesetzt nur von `delete_card`, nur bei grünem `card_delete_gate` (also nie für Karten mit Vergangenheits-Links/-States/-Plan). Die RPC `toggle_card_hidden` ist per DROP entfernt (Beschluss E2) — Hinweis V3.1 oben beschreibt damit einen abgelösten Zustand.

### 10.2 Migration als versionierte Datei ablegen

Die Migrationen in `supabase/migrations/` reproduzierbar halten. Sprint 5–8 hat 6 zusätzliche RPCs / Spalten / Trigger eingeführt, die in einer eigenen 0002…-Migrationsdatei zusammengefasst werden sollten.

### 10.3 RPC-Wrapper im Frontend regenerieren

Nach Sprint 5–8-Erweiterungen einmal:

```bash
supabase gen types typescript --project-id <id> > src/lib/supabase-types.ts
```

Damit kennen die TS-Typen alle neuen RPCs der letzten Sprints (`create_card_direct`, `create_card_from_fragment`, `get_effective_plan_for_month`, `toggle_card_manually_paid`, `process_csv_import`, `calculate_planned_sparrate_for_month`, `toggle_card_hidden`), die neuen Fragment-Spalten (`confidence`, `suggested_card_id`, `imported_at`, `counterparty_iban`, `transfer_type`), die neue `profiles.own_ibans`-Spalte und die erweiterte `process_csv_import`-Signatur mit zwei Parametern.

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
| `fragments` | `idx_fragments_transfer_type` (partial, `WHERE transfer_type IS NOT NULL`) | Schneller Filter für Transfer-Sicht in UI |
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
| `trg_oqb_no_transfer_links` | `card_fragment_links` | BEFORE INSERT OR UPDATE OF `fragment_id` | `enforce_no_transfer_fragment_links()` | Weist Links auf Fragmente mit `transfer_type IS NOT NULL` mit 23514 ab. Schließt „direktes Client-INSERT unter RLS" und `create_card_from_fragment`. OQ-B damit dreischichtig |
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

*Architekt-Persona | Antigravity Finance 1.0 | 24. Mai 2026*

---

## 13. Betriebsnotiz — v2-04 (einmalig, kein Dauerzustand)

> Im Zuge von v2-04 wurden am 06.07.2026 alle importierten Daten sowie drei `manually_paid`-Testzustände gelöscht (Ausnahme 1, pre-go-live Wegwerf-Zustand). Karten (31) und Plan-Zeitreihen blieben unberührt. Option-A-/Zwei-Personen-Ausnahmen dieses Sprints sind **nicht** fortgeltend; ab vorhandenen Echtdaten gelten Test-Projekt-Gate und Zwei-Personen-Prinzip wieder uneingeschränkt (Briefing §0a).
