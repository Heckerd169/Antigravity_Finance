# PM-Handover V1 → V2

> **Vom:** PM-Chat V1 (Opus 4.7, geschlossen 25.05.2026)
> **An:** V2-PM-Chat (neuer Chat)
> **Datum:** 25. Mai 2026
> **Anlass:** V1-Go-Live abgeschlossen, App produktiv

---

## 0. KRITISCHE ARBEITSREGEL — TOKEN-DISZIPLIN (vor allem anderen)

Aus V1 über 11 Sprints konsequent gelebt. Verbindlich für den V2-PM:

- Prägnant antworten — nur was die Antwort wirklich braucht.
- Tabellen statt Fließtext, Listen statt Sätze.
- Keine Wiederholungen des User-Verständnisses.
- Keine ungebetenen Zusammenfassungen am Ende.
- Keine „falls du noch X willst..."-Optionen-Listen, wenn der User nichts gefragt hat.
- Lange Strukturen (Briefings, Handover, SQL-Aufträge) gehören in **Dateien**, nicht in den Chat.
- Bei Bestätigung („merged", „OK", „passt") → kurze Quittung + nächster Schritt.
- Bei einer Frage des Users → eine Antwort. Nicht eine Antwort + drei Folgefragen.

Wenn mehr als ~10 Zeilen: prüfen, ob etwas streichbar ist. Mehr als zwei Tabellen: prüfen, ob eine streichbar ist.

---

## 1. V1-Closure — Stand auf `main`

| Sprint | Komponente | Approval |
|---|---|---|
| 0 | Projekt-Setup | 11.05.2026 |
| 1 | Onboarding + Income/Partner-Split | 11.05.2026 |
| 2 | Singularity Ring | 12.05.2026 |
| 3 | Header / Timeline-Navigation | 14.05.2026 |
| 4 | Karten (alle 3 Typen × alle Zustände) | 16.05.2026 |
| 5 | Untere Interaktionszone | 17.05.2026 |
| 6 | Sparrate-Verifikation (§4.6-Anker `2910.01`) | 20.05.2026 |
| 7 | UI-Komplettierung (V1 BUDGET-Tap + V6 Income-Split + V2 Cleanup) | 21.05.2026 |
| 8 | CSV-Import / Distiller (DKB) | 23.05.2026 |
| 9 | Cortal-Consors-Parser + Cross-Account-Transfer | 24.05.2026 |
| 10 | Sparraten-Treppe + Soft-Delete-Karten | 25.05.2026 |
| **Go-Live** | Vercel-Deployment + DB-Reset für Produktiv-Nutzung | **25.05.2026** |

**11 Sprints in 14 Tagen, alle 🟢 grün auf `main` gemerged.**

---

## 2. V1-Live-Setup — was wo läuft

### 2.1 Live-URL + Hosting

| Komponente | Wert |
|---|---|
| **Live-URL** | `https://antigravity-finance-sigma.vercel.app` (persistente Vercel-Domain) |
| Hosting | Vercel (Hobby-Plan, GitHub-Auto-Deploy bei `main`-Push) |
| Backend | Supabase (Free/Pro je nach DB-Stand) |
| Browser-Bookmark | gesetzt |
| Eigene Domain | nicht V1 — Vercel-Subdomain reicht; V2-Vormerkung |

**Wichtig zur URL-Konvention:** Vercel vergibt `<project-name>.vercel.app` nach First-Come-First-Serve. Da `antigravity-finance.vercel.app` global belegt war, hat dieses Projekt das Suffix `-sigma` bekommen. Bei künftigen Vercel-Setups: URL aus Dashboard → Project → Domains lesen, **nicht** aus dem Projekt-Namen ableiten.

### 2.2 Auto-Deploy-Workflow

Jeder Push auf `main` triggert ~90s Vercel-Build → automatisches Production-Deployment. Branches/PRs bekommen Preview-Deployments unter `antigravity-finance-sigma-<branch>-<…>.vercel.app`.

### 2.3 Environment-Variablen in Vercel

| Variable | Scope | Wert |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production + Preview | aus Supabase-Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production + Preview | dito |

Lokale Entwicklung nutzt `.env.local` (gitignored, nicht im Repo). `.env.example` dokumentiert die zwei Variablen.

### 2.4 Supabase-Auth-Konfiguration

| Feld | Wert |
|---|---|
| Site URL | `https://antigravity-finance-sigma.vercel.app` |
| Redirect URLs | `https://antigravity-finance-sigma.vercel.app/**` + `http://localhost:3000/**` |
| Auth-Provider | nur E-Mail (V1) |

### 2.5 Live-User-Identität

| Feld | Wert |
|---|---|
| User-UUID | `179cd2c1-bbc2-4fd0-954b-8735eb90f370` |
| `own_ibans` | `["DE13120300001051422572", "DE84760300800853562991"]` (DKB + Cortal) |
| Status | **produktiv genutzt seit 25.05.2026** — nicht mehr Test-User |

**Konsequenz:** Der V1-Test-Anker `calculate_sparrate_for_month(uuid, '2026-03-01') = 2910.01` ist nach dem Go-Live-Daten-Reset **nicht mehr gültig**. Live-Daten weichen ab. V2 braucht eine eigene Test-Strategie (siehe §3.1).

### 2.6 RLS

Alle 10 User-Tabellen haben `✓ RLS on` (verifiziert 25.05.2026 via `pg_tables`-Audit). Event-Trigger `rls_auto_enable` aktiviert RLS automatisch auf neuen Tabellen.

---

## 3. V2-Initial-Aufgaben (vor erstem Feature-Sprint zu klären)

### 3.1 Test-Daten-Strategie (kritisch — Architekten-Klärung)

V1 hatte einen festen `§4.6-Anker = 2910.01` als deterministische Verifikations-Kennzahl. Der ist jetzt weg. V2 muss eine neue Strategie etablieren:

| Option | Vor / Nachteil |
|---|---|
| A) Lokale Supabase-Instanz mit Seed-Daten | komplette Trennung, Setup-Aufwand mittel |
| B) Branch-Datenbanken via Supabase Pro | Pro-Plan-Upgrade nötig, beste Workflow-Integration |
| C) Separater Supabase-Test-Projekt (zweiter Free-Tier) | kostenlos, manuelle Schema-Sync |
| D) Test-User-Account in Live-DB | minimaler Aufwand, Risiko von Test-Daten in Produktion |

**Empfehlung:** Option C als kostenneutraler Mittelweg, falls Pro-Upgrade noch nicht gewünscht. Architekt soll Seed-SQL aus V1-Snapshots ableiten + dokumentieren, wie Schema-Sync zwischen Live und Test läuft (z. B. Migrationen werden zuerst auf Test-DB deployed).

V2-PM sollte das als erste Aufgabe mit Architekt klären, bevor V2-Sprints mit DB-Eingriff starten.

### 3.2 Sprint-Naming-Konvention V2

V1 hatte `sprint/00` bis `sprint/10`. Empfehlung für V2:

| Schema | Beispiel |
|---|---|
| `sprint/v2-NN-<feature>` | `sprint/v2-01-card-color`, `sprint/v2-02-iban-settings` |

Klare Trennung von V1, alphabetisch sortierbar, kompatibel mit der Backup-Pointer-Rotation.

### 3.3 CLAUDE.md §4 Sprint-Protokoll-Tabelle

Bei V2-Start neue Sub-Tabelle anlegen („Sprint-Protokoll V2") und die Spalte `V1.x`-Hinweis ergänzen für historischen Kontext.

---

## 4. V2-Backlog — alles offen vorgemerkt

Sortiert nach thematischen Gruppen. Vom V2-PM mit dem User priorisieren.

### A — Karten-System (kurzfristig)

| # | Vormerkung | Quelle | Schema-Eingriff? |
|---|---|---|---|
| A1 | **Karten-spezifische Badge-Farben** (ehemals V3'') — `cards.color`-Spalte ODER deterministischer Hash-zu-Farb-Mapping | Sprint 8 OQ1 → Sprint 9/10 verschoben → V2 | ja (bei Color-Spalte) |
| A2 | „Versteckte Karten verwalten / wieder einblenden"-Pfad in Settings oder Overlay | Sprint 10 §2.4-Patch | nein (RPC `toggle_card_hidden` existiert bereits) |
| A3 | Bestätigungs-Dialog vor Verbergen-Klick | Sprint 10 — bewusst auf 5s-Toast-Undo verzichtet in V1 | nein |
| A4 | Soft-Delete-Pattern Karten — Trash-Variante (i) mit `CARD_HIDE`-Enum + 60s-Cleanup-Edge-Function | Sprint 10 K2 — Variante (iii) gewählt, (i) als Konsistenz-Verbesserung möglich | ja (ENUM-Erweiterung) |

### B — Sparraten-Treppe (UX-Polish)

| # | Vormerkung | Quelle |
|---|---|---|
| B1 | Multi-Year-Rolling-Window (12 Monate gleitend statt Kalenderjahr) | Sprint 10 Out of Scope |
| B2 | Abweichungs-Treiber-Heuristik im Backend (Top-3 Treiber pro Monat) | Sprint 10 — V1 hat statischen Hinweis |
| B3 | Rot-Spec bei negativer Kumulation (§9 nennt Verhalten, keine Farb-Spec in V1) | Sprint 10 Quirk 2 |
| B4 | Monatsgenauer `%-monatlich`-Nenner (statt jüngster Income-Slot) | Sprint 10 Quirk |
| B5 | Performance-Optimierung — Bulk-RPC `get_yearly_sparrate_curves(p_user_id, p_year)` statt 24×2 parallele Calls | Sprint 10 §9.4 Hinweis |

### C — Transfer-System (UX-Polish)

| # | Vormerkung | Quelle |
|---|---|---|
| C1 | `INTERNAL_TRANSFER`-Fragmente aus Karten-Stack ausblenden (eigener Reiter oder Settings-Toggle); ehemals V8'' | Sprint 9 V8'' |
| C2 | Backfill-Toast-UX-Verbesserung bei hohem Migrations-Counter (`"alle X Fragmente nachgepflegt"` statt exakte Zahl); ehemals V9'' | Sprint 9 V9'' |

### D — Settings / Onboarding-Erweiterungen

| # | Vormerkung | Quelle | Schema-Eingriff? |
|---|---|---|---|
| D1 | UI zur Verwaltung von `own_ibans` (aktuell nur Service-Role / Migration) | Schema-Doku §9 | nein (Tabelle vorhanden) |
| D2 | Steuerklasse-Wechsel via UI | Schema-Doku §9 | nein |
| D3 | Settings-Bereich allgemein — Routing + Layout | abgeleitet aus D1/D2/A2 | nein |

### E — Income & Fairness

| # | Vormerkung | Quelle | Schema-Eingriff? |
|---|---|---|---|
| E1 | Rückwirkende Gehaltskorrektur mit Fairness-Delta zwischen ICH/PARTNER | Schema-Doku §9 | ja (neue Tabelle `fairness_deltas`) |
| E2 | Periodenabgrenzung (z. B. Dezember-Gehalt am 30.11. bezahlt → Januar-Periode) | Schema-Doku §9 | nein (`card_fragment_links.month` ist separat) |

### F — Distiller / Import-Erweiterungen

| # | Vormerkung | Quelle | Schema-Eingriff? |
|---|---|---|---|
| F1 | Konfidenz-Verbesserung (Embeddings, Levenshtein, ML-Klassifikator) | Schema-Doku §9 | evtl. (Score-Spalten) |
| F2 | Kategorie-Vorhersage pro User (eigenes Modell) | Schema-Doku §9 | ja |
| F3 | Fragment-Clustering (manuelle Zuordnung verbessern) | Schema-Doku §9 | nein |
| F4 | IBAN-Format-Validierung in der DB (CHECK-Constraint via Regex) | Schema-Doku §9 | ja (Constraint) |
| F5 | Paired-Fragment-Verlinkung (`paired_fragment_id`) für Multi-Account-Reconciliation | Schema-Doku §9 | ja |
| F6 | Cross-Currency-Cortal-Importe (V1 verwirft mit `error-corrupt`) | Sprint 9 OQ2 | ja |
| F7 | PDF/Excel-Import — Application-Layer-Adapter | Schema-Doku §9 | nein |

### G — Lifecycle / Backend-Infrastruktur

| # | Vormerkung | Quelle |
|---|---|---|
| G1 | Cleanup-Edge-Function für `deleted_entities` (Trash nach 60s räumen) | Schema-Doku §10.1 — bisher manuell |
| G2 | Manueller Monatsabschluss-UI (setzt `card_monthly_states.closed_at`) | Schema-Doku §9 |

### H — Tooling

| # | Vormerkung | Quelle |
|---|---|---|
| H1 | Vercel Coding Agent Plugin evaluieren (`npx plugins add vercel/vercel-plugin`) | Go-Live-Phase 3, User-Idee |

### I — Dauerhaft Out of Scope (kein V2-Backlog)

| # | Punkt | Begründung |
|---|---|---|
| I1 | Partner-only-Karten | UI-Lärm, keine Sparrate-Relevanz (Schema-Doku §9) |

### Vom User bei V2-Chat-Start eingebrachte Ideen

Der User hat am 25.05.2026 angekündigt, weitere V2-Ideen direkt im V2-PM-Chat einzubringen, kurzfristig umzusetzen + perspektivisch. Diese sind hier noch nicht erfasst — V2-PM soll sie aufnehmen, mit dem obigen Backlog A–H abgleichen (möglicherweise Duplikate) und gemeinsam mit dem User priorisieren.

---

## 5. Persona-Chat-Stati

| Chat | Status für V2 |
|---|---|
| **PM-Chat V1** | geschlossen (dieser hier) |
| **PM-Chat V2** | neu zu eröffnen — Phase-0-Reading nach §7 unten |
| **Architekten-Chat** | weiter benutzbar — kennt Schema v3.1, alle Pre-Sprint-OQ-Pattern, alle 21 RPCs |
| **Design-Direktor-Chat** | weiter benutzbar — kennt Design-Doku v3 (Sprint-10-Stand) |
| **Claude Code** | per Sprint frisch instanziieren (Konvention seit V1) |

Falls Architekten- oder Design-Direktor-Chat token-voll wird: dann frisch eröffnen mit den jeweiligen Persona-Files (`persona_architect.md`, `persona_jobs.md`) als Eintrittspunkt + Verweis auf die finalen Doku-Stände.

---

## 6. Architektur-/Doku-Stand auf `main`

| Datei | Version | Status |
|---|---|---|
| `antigravity_finance_schema_summary_v3.md` | **v3.1** (Sprint-9-Stufe-1 + Pre-Sprint-10-Snapshot-Integrität) | aktuell |
| `antigravity_finance_design_dokument_v3.md` | **v3.0** (Sprint-10-Stand) | aktuell |
| `CLAUDE.md` | Sprint-10-Patches integriert, LL-20 in §7 Grundregel 18, Sprint-10-Block in §10 | aktuell |
| `persona_architect.md` | unverändert seit V1-Start | nutzbar |
| `persona_jobs.md` | unverändert seit V1-Start | nutzbar |

**Schema-Stand:** 10 Tabellen, 1 View (`fragments_with_status`), 21 App-RPCs, 5 Trigger + 1 Event-Trigger (`rls_auto_enable`).

**Design-Stand:** Singularity Ring (§5), Header/Timeline (§6), Karten alle drei Typen × Zustände (§7), Untere Interaktionszone (§8), Sparraten-Treppe (§9), Onboarding (§10), Distiller + CSV-Import (§11), Soft-Delete-UI-Hide (§2.4 erweitert).

---

## 7. V2-PM-Phase-0-Reading-Order

Empfohlene Reihenfolge für den ersten V2-PM-Chat:

1. **Dieses Handover** — vollständig
2. **CLAUDE.md** (post-Sprint-10-Patch-Stand) — vor allem §7 Grundregeln 1–18, §9 Modell-Empfehlung, §10 Sprint-10-Block
3. **`antigravity_finance_schema_summary_v3.md`** — Section 3 (Sparrate-Wahrheits-Quellen) + Section 4 (RPC-Inventar)
4. **`antigravity_finance_design_dokument_v3.md`** — §2.1 Snapshot-Integrität + Sprint-10-Patches in §2.4/§7/§9
5. **Sprint-Reviews 8–10** (`sprints/sprint_08_review.md`, `sprint_09_review.md`, `sprint_10_review.md`) — als Stilreferenz für Briefing/Review-Detailtiefe + um die LL-Origin-Stories zu kennen
6. **PM-Handover Sprint 9 → 10** als Vorlage für Handover-Stil

---

## 8. Lessons Learned (LL-1 bis LL-20) — Quick-Reference

Alle in CLAUDE.md §7 kodifiziert oder in einzelnen Sprint-Reviews dokumentiert. Hier nur die Kurzform für den V2-PM:

| LL | Kurzform | Ursprungs-Sprint |
|---|---|---|
| LL-1 bis LL-12 | V1-Frühphasen-Lessons (Routing, Forward-Inheritance, Sparse-Pattern, etc.) | Sprints 1–5 |
| LL-13 | Spontane Frontend-Spec-Patches verboten, PM-Freigabe erforderlich | Sprint 6 |
| LL-14 | Multi-Komponenten-Sprints sequenziell, eigene Commits pro Phase | Sprint 7 |
| LL-15 | PM prüft Smoke-Tests gegen aktive §7-Konflikte + Sprint-K-Logiken + Test-Daten-Eigenschaften vor Briefing-Approval | Sprint 7 |
| LL-16 | Claude Code editiert Design-/Schema-Doku NIE — Patches als separate File, PM wendet sie an | Sprint 8 |
| LL-17 | `app_config`-Schwellen server-seitig lesen, Client erhält nur aufgelöste Werte | Sprint 8 |
| LL-18 | Live-RPC-E2E ohne Persistenz via RAISE-Rollback-Dry-Run als nicht-destruktive Verifikations-Technik | Sprint 9 |
| LL-19 | AC regel-basiert, nicht instanz-basiert formulieren, sofern die Regel über Test-Daten hinaus gilt | Sprint 9 |
| LL-20 | Spec-Mehrdeutigkeit Perf-Budget vs. Semantik — §-Semantik ist normativ, PM-Klärung vor Implementierung; datenlose Referenz-Werte ≠ 0 | Sprint 10 |

---

## 9. Modell-Empfehlung V2-PM-Chat selbst

| Sprint-Charakter | Modell |
|---|---|
| Reine UI-Sprints mit eindeutiger Spec (z. B. A2 Settings-Pfad, C1 Stack-Reiter) | Sonnet 4.6 |
| Schema-Eingriffe (A1 Color-Spalte, E1 Fairness-Delta, F2 Kategorie-Modell, F4 IBAN-Constraint) | Opus 4.7 |
| Hash-/Pipeline-Sensitivität (F1 Konfidenz, F5 Paired-Linking, F6 Cross-Currency) | Opus 4.7 |
| Backend-Infrastruktur (G1 Cleanup-Edge-Function) | Opus 4.7 (Edge-Runtime-Quirks) |

Default für V2-PM-Chat selbst: **Opus 4.7**, weil V2-Strategie-Phase mehrere Sprint-Pfade abwägen muss und Schema-Architektur-Entscheidungen ansteht.

---

## 10. Anti-Drift-Regeln spezifisch für V2

| # | Regel | Begründung |
|---|---|---|
| 1 | **Live-DB ist produktiv** — kein DB-Eingriff ohne Branch-/Staging-DB-Verifikation | siehe §3.1 |
| 2 | **§2.1 Snapshot-Integrität bleibt heilig** — neue Filter-Mechanismen müssen analog Sprint-10-C.2-Audit gegen historische Sparraten geprüft werden | Sprint 10 |
| 3 | **CLAUDE.md §10 ist append-only** — V2-Sprint-Blöcke kommen unten dran, kein Edit historischer Blöcke | seit Sprint 0 |
| 4 | **OQ-Pattern weiter** — vor Briefing-Approval offene Spec-Punkte als „OQ" sammeln, durch User klären, dokumentiert ins Briefing übernehmen | seit Sprint 1 |
| 5 | **Test-Anker definieren** — V2 braucht eigenen deterministischen Verifikations-Ankerwert in der Test-DB (siehe §3.1), analog `§4.6 = 2910.01` aus V1 | abgeleitet aus V1 |
| 6 | **Sprint-Branch-Backup-Rotation** weiter wie V1: nur die letzten zwei Sprint-Backups remote behalten | seit Sprint 0 |
| 7 | **Doku-Patches als separate Files** (LL-16), PM wendet an — gilt auch für V2 | LL-16 |

---

## 11. Erste Schritte für den V2-PM-Chat

Empfohlene Eröffnung im V2-PM-Chat:

1. Dieses Handover als Input geben
2. User-Begrüßung + Bestätigung der Token-Disziplin
3. User bringt seine V2-Ideen ein
4. V2-PM kategorisiert: welche Ideen in welche Backlog-Gruppe (A–H), welche sind neu
5. Mit User priorisieren: was ist V2-Sprint-01-Kandidat
6. **Vor erstem Sprint-Briefing:** Architekten-Chat um §3.1-Test-Daten-Strategie bitten (Architekten-Brief schreiben)
7. Falls V2-Sprint-01 Schema-Eingriff hat: Architekten-Pre-Sprint-Stufe-1 analog Sprint-9-Pattern

---

## 12. Anhang — User-Repo-Setup-Details (V2-PM-relevant)

| Detail | Wert |
|---|---|
| GitHub-Repo | `Heckerd169/Antigravity_Finance` |
| Vercel-Team | `Heckerd's projects` (Hobby) |
| Vercel-Projekt | `antigravity-finance` |
| Production-Branch | `main` |
| Lokales Setup | macOS (zsh), kein `rg` installiert → grep statt ripgrep verwenden |
| Lokaler Repo-Pfad (User-Konvention) | `<repo>` Platzhalter (User-Pfad nicht im Handover dokumentiert) |
| Stack | Next.js 15, React 19, Tailwind, Supabase JS, TypeScript, pnpm |
| Build-Pipeline | `tsc --noEmit` + `next lint` + `next build` als Sanity-Trio |

---

*PM-Handover V1 → V2 · Antigravity Finance 1.0 → 2.0 · 25. Mai 2026*
