# Architekten-Auftrag — Init-1: Test-Daten-Strategie (Option C)

> **Vom:** PM-Chat V2 (Opus 4.7)
> **An:** Architekten-Chat (kennt Schema v3.1 + alle 21 RPCs)
> **Datum:** 04. Juni 2026
> **Anlass:** V1→V2-Handover §3.1 + V2-Roadmap Init-1/Init-2. User-Entscheidung 04.06.2026: **Option C** (separates Supabase-Test-Projekt, Free-Tier).
> **Status:** Freigegeben — Init-1 startet hiermit.

---

## 0. Auftrag — eine Zeile

Ein vom Live-Betrieb vollständig getrenntes Supabase-Test-Projekt aufsetzen, Schema v3.1 darin reproduzieren, ein deterministisches Seed mit neuem Verifikations-Anker (Init-2) liefern und den Schema-Sync-Workflow Test↔Live dokumentieren.

---

## 1. Test-Projekt-Setup (Option C)

| # | Lieferung |
|---|---|
| L1.1 | Neues Supabase-Projekt (Free-Tier), Region `eu-west-1` (Latenz-Parität zum Live-Projekt) |
| L1.2 | Schema v3.1 vollständig reproduzieren: 10 Tabellen, View `fragments_with_status`, 21 App-RPCs, 5 Trigger + Event-Trigger `rls_auto_enable`, vollständige RLS (Owner = `auth.uid()`), Seed für Steuerklassen 1–6 + `app_config`-Konstanten |
| L1.3 | Quelle der Reproduktion: die versionierten Migrationen. Falls J1 (Sprint-5–8-Migrationen in `0002_…` konsolidieren) noch offen ist, hier als Vorarbeit mitziehen oder den aktuellen Live-Stand per `pg_dump --schema-only` ableiten — Entscheidung dokumentieren |
| L1.4 | Bestätigen, dass `rls_auto_enable` im Test-Projekt aktiv ist (Audit via `pg_tables` analog Go-Live-Verifikation) |

**Live-DB bleibt unberührt** — kein einziger Eingriff im Live-Projekt `nflkobdfdhncrtjncpmq`. Keine Live-Daten ins Test-Projekt kopieren (DSGVO + Snapshot-Reinheit); das Seed ist synthetisch.

---

## 2. Seed-Daten + Init-2-Verifikations-Anker

| # | Lieferung |
|---|---|
| L2.1 | Deterministisches Seed-SQL (idempotent re-runnbar), das einen repräsentativen Single-User-Zustand erzeugt: ein Test-Profil mit `own_ibans`, Income-Timeline (ICH + PARTNER), eine Karten-Mischung über alle drei Typen × Frequenzen, `card_planned_timeline`-Vererbung, einzelne `card_monthly_states`, Fragmente inkl. verlinkter + `INTERNAL_TRANSFER`-markierter |
| L2.2 | **Init-2-Anker definieren:** ein fixer Monat M mit `calculate_sparrate_for_month(test_user, M) = <Wert>` und `calculate_planned_sparrate_for_month(test_user, M) = <Wert>`, byte-genau dokumentiert. Ersetzt den toten V1-Anker `2910.01`. Anker muss über Seed-Re-Runs stabil bleiben |
| L2.3 | Test-User-UUID wird beim Seed vergeben (nicht die Live-UUID) und im Rückgabe-Dokument festgehalten. **Nicht** in `src/` hardcoden (Anti-Drift A8) |

---

## 3. N1–N5-Repro-Fixtures (kritisch für Sprint v2-01)

Das Seed **muss** die fünf V1-Bugs reproduzierbar machen — sonst lässt sich v2-01 nicht smoke-testen (LL-15: Smoke gegen Test-Daten-Eigenschaften prüfen).

| Bug | Benötigte Fixture im Seed |
|---|---|
| N1 (Rohmasse zeigt Fremd-Monate) | Unzugeordnete Fragmente über **mindestens drei verschiedene `transaction_date`-Monate** verteilt, sodass ein Monatsfilter sichtbar greifen/fehlschlagen kann |
| N2 (Karten-Größen-Inkonsistenz) | Eine Karte mit langem Namen (z. B. „Deutschlandticket Mama …", analog Image 2) |
| N3 (Text-Overflow) | Eine Karte mit Name nahe/über der 136px-Breite (z. B. „Reisekrankenversicherung — DKV", analog Image 3) |
| N4 (Ring `+− 358,1 %`) | Ein Monat mit **sehr kleinem Plan-Nenner** (≈ 73,80 €, analog Mai-Befund) bei deutlich höherer realer Sparrate → erzeugt den >200%-/Vorzeichen-Grenzfall |
| N5 (Farbtöne Fragmente/Transfers) | Im selben Monat nebeneinander: ein **zugeordnetes** Fragment (Opacity 0.22) und ein **`INTERNAL_TRANSFER`**-Fragment (Opacity 0.45) — damit die Differenz sichtbar ist |

---

## 4. Schema-Sync-Workflow (Doku-Lieferung)

| # | Lieferung |
|---|---|
| L4.1 | Kurz-Doku: künftige Migrationen werden **zuerst** auf das Test-Projekt deployed, dort verifiziert (inkl. Init-2-Anker stabil), **dann** auf Live. Reihenfolge verbindlich für jeden V2-Sprint mit Schema-Eingriff |
| L4.2 | Befehl/Skript-Snippet, wie der Frontend-`types.ts`-Stand zwischen Test- und Live-Projekt gehalten wird (zwei Project-IDs, ein generierter Typ-Stand — Drift-Vermeidung) |
| L4.3 | Hinweis, ob/wie `.env`-Umschaltung Test↔Live im lokalen Setup erfolgt (z. B. `.env.test.local`) — nur Doku, kein Eingriff ins Repo |

---

## 5. Rückgabe an PM

| Output | Form |
|---|---|
| Test-Projekt-ID + Region | Klartext |
| Seed-SQL | Datei, idempotent |
| Init-2-Anker | `(Monat, Ist-Wert, Plan-Wert)` byte-genau |
| Test-User-UUID | Klartext (für Briefing-Referenz, nicht für `src/`) |
| N1–N5-Fixture-Bestätigung | Tabelle: Bug → Fixture vorhanden ✓ |
| Schema-Sync-Doku | Abschnitt für CLAUDE.md-Aufnahme (PM wendet an) |

---

## 6. Anti-Drift

| # | Regel |
|---|---|
| 1 | Live-Projekt `nflkobdfdhncrtjncpmq` bleibt komplett unberührt |
| 2 | Keine Live-Daten ins Test-Seed — synthetisch + deterministisch |
| 3 | Schema-Doku NICHT editieren (LL-16) — Sync-Doku als separater Abschnitt liefern, PM wendet an |
| 4 | Init-2-Anker ist ab Lieferung der V2-Regressionsschutz (analog V1 §4.6) — über Seed-Re-Runs stabil halten |

---

*Architekten-Auftrag Init-1 · Antigravity Finance 2.0 · 04. Juni 2026*
