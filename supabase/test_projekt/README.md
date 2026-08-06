# Übungs-Datenbank (Test-Projekt) — Aufbau-Runbook

> Stand 24.07.2026. Beschluss ①E4 (Stufe-1-Papier Karten-Löschen): Vor jeder
> Schema-/RPC-Änderung wird zuerst eine isolierte Übungs-Kopie der Datenbank
> aufgebaut und die Änderung dort geprobt. **Blocker bei Erstellung:** Das
> Free-Projekt-Limit des Accounts war mit „Antigravity-Finance" (Prod) +
> „Rennrad-Trainer" belegt (2/2) — sobald ein Platz frei ist (Rennrad-Trainer
> pausieren oder Upgrade), dauert der Aufbau nach diesem Runbook wenige Minuten.

## Schritt 1 — Projekt anlegen

Supabase-Projekt `antigravity-finance-test`, Region `eu-west-1`, Free Tier,
Organisation „Heckos". (Per MCP: get_cost → confirm_cost → create_project;
danach get_project bis Status ACTIVE_HEALTHY.)

## Schritt 2 — Schema aus Prod generieren

`extract_queries.sql` enthält die Generator-Abfragen. Sie laufen **read-only
gegen Prod** (`nflkobdfdhncrtjncpmq`) und liefern fertige DDL-Texte zurück.
Das Repo speichert bewusst den **Generator, nicht den Output** — so ist der
Snapshot immer aktuell zum Prod-Stand am Ausführungstag.

## Schritt 3 — Auf dem Test-Projekt einspielen (apply_migration, diese Reihenfolge)

1. **Extensions:** `CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;`
   `CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;`
   `CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;`
   (pg_trgm liegt in Prod in `public` — unqualifizierte `similarity()`-Aufrufe
   in `name_similarity` hängen daran.)
2. **Enums** (Q1-Output)
3. **Tabellen** (Q2-Output)
4. **Constraints** (Q3-Output — PK/UNIQUE/CHECK vor FK, ist im Output so sortiert)
5. **Funktionen** (Q4-Output) — **Filter:** alle `LANGUAGE c`-Funktionen
   überspringen (kommen mit pg_trgm) und `rls_auto_enable` nur versuchen
   (Event-Trigger-Anlage kann am Rechte-Modell scheitern — unkritisch, weil
   Schritt 7 RLS explizit aktiviert).
6. **View + Trigger** (Q5/Q6-Output; enthält den `auth.users`-Trigger
   `on_auth_user_created` und den DEFERRABLE-Constraint-Trigger
   `cards_assert_initial_plan`)
7. **RLS + Policies** (Q7-Output)
8. **Zusatz-Indizes** (Q8-Output)
9. **Seeds:** `app_config` (Q9-Output) + `net_estimation_brackets` (Q10-Output,
   33 Zeilen)

## Schritt 4 — Init-2: deterministischer Seed + Anker

`init2_seed.sql` auf dem **Test-Projekt** ausführen. Er legt einen synthetischen
Nutzer + Einkommen + 2 Karten über die produktiven RPCs an und prüft den Anker:

> **Anker: `calculate_sparrate_for_month(test-user, '2026-03-01') = 2200.00`**
> (3.000 Netto − 1.000 Fixkosten + 200 Einnahme). Jeder Migrations-Dry-Run
> muss diesen Wert vorher wie nachher liefern (außer die Migration ändert ihn
> beabsichtigt — dann neuen Anker im Runbook dokumentieren).

## Schritt 5 — Strukturvergleich Prod ↔ Test

Q11 (`extract_queries.sql`, letzter Block) auf BEIDEN Projekten ausführen und
die Ergebnisse diffen: Tabellen-/Spalten-/Funktions-/Policy-/Trigger-/Index-
Zählungen und -Namen müssen identisch sein (bis auf bewusste Ausnahmen aus
Schritt 3, Filter).

## Grundsätze

- Test-Projekt enthält **niemals Echtdaten** — nur den synthetischen Seed.
- Migrationen laufen IMMER zuerst hier (Dry-Run), dann auf Prod (User-Go).
- Nach jeder Live-Migration: Prod-Anker prüfen — **alle zwölf Monate**, Ist **und**
  Plan, unverändert sofern nicht beabsichtigt geändert.

  > **Maßgeblich ist `CLAUDE.md` §9, nicht diese Datei.** Hier stand bis zum
  > 06.08.2026 „Juni 2026 = 4.545,32 €“ — ein Wert, der schon durch den
  > 2025er-Import überholt war (4.589,53 €) und seit der Juli-Kuratierung erneut
  > (**4.208,76 €**). Zweimal veraltet, zweimal unbemerkt: einen Anker an einer
  > zweiten Stelle zu pflegen funktioniert nicht. Deshalb steht hier jetzt **kein
  > Zahlenwert** mehr, sondern nur noch der Verweis.
