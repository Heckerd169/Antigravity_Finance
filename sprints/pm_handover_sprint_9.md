# PM-Handover Sprint 9 → 10

> **Vom:** PM-Chat Sprint 9 (Opus 4.7, geschlossen 24.05.2026)
> **An:** PM-Chat Sprint 10 (neuer Chat)
> **Datum:** 24. Mai 2026

---

## 0. KRITISCHE ARBEITSREGEL — TOKEN-DISZIPLIN (vor allem anderen)

Aus PM-Handover 8→9 übernommen und in Sprint 9 sauber gelebt. Verbindlich für den Sprint-10-PM:

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

## 1. Stand auf `main` nach Sprint 9

| Sprint | Status | Approval |
|---|---|---|
| 0–7 | 🟢 | bis 21.05.2026 |
| 8 | 🟢 | 23.05.2026 |
| 9 | 🟢 | 24.05.2026 |

Sprint-9-Branch `sprint/09-cortal-transfer` als Backup-Pointer behalten, `sprint/08-csv-import` rotiert gelöscht.

**Bundle-Stand:** 10 Dateien geändert, +403 / −24 LOC. Zwei neue Module (`src/lib/cortal-csv.ts`, `src/lib/csv-format-router.ts`). `tsc`/`lint`/`build` clean. §4.6-Anker (`calculate_sparrate_for_month` März 2026 = `2910.01`) intakt nach echter Browser-Smoke + DB-Verifikation.

**Doku-Stand:**
- CLAUDE.md auf Sprint-9-Patch-Stand (LL-18, LL-19, neue Schema-Befunde, gepatchte Modell-Empfehlungs-Tabelle)
- Design-Doku v3 auf Sprint-9-Patch-Stand (§11 Cortal-Adapter, §11 INTERNAL_TRANSFER-Pipeline, §8 Stack-Rendering-Regel, §8 Backfill-Toast)
- **Schema-Doku v3 nicht synchronisiert** — Sprint-9-Stufe-1-Änderungen fehlen. V6'' aktiv vorgemerkt für Architekten-Pflege-Turn

**Test-User:** `179cd2c1-bbc2-4fd0-954b-8735eb90f370`

| Karte | Type | Attribution | Frequency | first_active | Stand Mai 2026 |
|---|---|---|---|---|---|
| Miete | FIXED_COST | GEMEINSAM | MONTHLY | 2026-01-01 | aktiv |
| Netflix | FIXED_COST | ICH | MONTHLY | 2026-01-01 | aktiv |
| Steuerrückzahlung | INCOME | ICH | ONCE | 2026-03-01 | nur März, Fragment-verlinkt, `manually_paid=true` |
| Tanken | BUDGET | ICH | MONTHLY | 2026-01-01 | aktiv |
| Hobby | BUDGET | ICH | MONTHLY | 2026-05-01 | aktiv, keine Fragmente |
| Auswärts Essen | BUDGET | ICH | MONTHLY | 2026-05-01 | aktiv, Σ 120 € Fragmente bei Plan 80 € |
| Nebenjob | INCOME | ICH | MONTHLY | 2026-05-01 | Pre-Sprint-8-Test, keine Fragmente |

**Fragment-State nach Sprint 9:** 54 DKB-Mai/April-Fragmente (alle mit `counterparty_iban` durch Re-Import-Backfill) + 8 neue Cortal-Mai-Fragmente + ARAL-Test-Fragment (Sprint-9-Stufe-1-Beifang, unverlinkt). 14 davon als `INTERNAL_TRANSFER` markiert (7 DKB-Seite + 7 Cortal-Seite). `own_ibans = {DE13120300001051422572 (DKB), DE84760300800853562991 (Cortal)}`.

---

## 2. Sprint-9-OQs (Entscheidungen)

| # | Frage | Entscheidung |
|---|---|---|
| OQ1 | Cortal-Description-Adapter — drei Felder mit Pipe-Separator? | Ja, byte-exakt, `n/a`-Literal belassen. In §11 dokumentiert |
| OQ2 | Nicht-EUR-Währung in Cortal-Spalte 12 | `error-corrupt`, gesamter Import verworfen. Cross-Currency out of scope V1 |
| OQ3 | Backfill-Toast-Position | Direkt unter dem Portal (Drop-Zone) — Toast ist Pipeline-Feedback. In §8 dokumentiert |
| OQ4 | Cortal-Header Trailing-Space — trim-tolerant oder strikt? | Strikt byte-exakt. Format-Drift = V2-Vormerkung |

**Architekten-OQs (Pre-Sprint-9 Stufe 1):**

| # | Frage | Entscheidung |
|---|---|---|
| OQ-A | Backfill bestehender Fragmente | Variante (i) — User-getriebener Re-Import mit `ON CONFLICT DO UPDATE WHERE counterparty_iban IS NULL`. Hash bleibt V2-Formel |
| OQ-B | Konflikt Transfer + bestehender Karten-Link | Variante (ii) — Link gelöst, Counter getrackt, Suggestion zurückgesetzt |
| OQ-C | Hash-Adapter im RPC oder Frontend? | Im RPC (Konsistenz V2 + Single-Source-of-Truth) |

**Stufe-1-Klärungs-Episode:**

| Punkt | Klärung |
|---|---|
| B1 | `fragments.counterparty_iban` als neue Spalte aufgenommen (war im Briefing ohne Schema-Basis vorausgesetzt) |
| B2 | `profiles.user_id` (nicht `.id`) — Naming-Drift im Briefing korrigiert |
| B3 | `fragments.hash` (nicht `.external_hash`) — Naming-Drift korrigiert |

---

## 3. Sprint-10-Vormerkungen V3''–V9''

| # | Vormerkung | Typ | Aufwand |
|---|---|---|---|
| V3'' | **Karten-spezifische Badge-Farben** — Karten-Farb-Spalte oder deterministische Hash-zu-Farb-Mapping. Aus Sprint-8-OQ1 fortgeschrieben | mittelfristig | mittel |
| V4'' | **Soft-Delete-Pattern Karten (§2.4)** — UX-Lücke „Karte aus Vergangenheit löschen". `cards.deleted_at` existiert bereits. Pre-Sprint-8/9 als Kandidat gelistet, nicht gewählt | Sprint-Kandidat | mittel |
| V5'' | **Sparraten-Treppe (§9)** — UI-Komponente, klare Visual-Spec im Prototyp `sparrate_treppe_final_v2.html`. Pre-Sprint-8/9 als Kandidat gelistet, nicht gewählt | Sprint-Kandidat | mittel |
| V6'' | **Schema-Doku v3 → v3.1 pflegen** — `own_ibans`, `counterparty_iban`, `transfer_type` + CHECK + Index, `process_csv_import`-Signatur, View-Erweiterung, OQ-A/B/C-Pattern. Architekten-Pflege-Turn | Architekt-Task | klein, parallel |
| V7'' | **Defense-in-Depth-Patch `calculate_card_amount_for_month`** — `AND f.transfer_type IS DISTINCT FROM 'INTERNAL_TRANSFER'`. Aktuell durch OQ-B-Daten-Invariante abgesichert, explizit > implizit. Architekten-Lieferung | Architekt-Task | klein, parallel |
| V8'' | **V2-Web-App: `INTERNAL_TRANSFER` aus Stack ausblenden** — eigener Reiter / Settings-Toggle. V1 nutzt Variante (b) gedimmt+Badge | V2-Web-App | — |
| V9'' | **Backfill-Toast-UX-Verbesserung** — bei hohem Migrations-Counter (z. B. „54 Fragmente mit IBAN ergänzt") Formulierung „alle Fragmente nachgepflegt". V1 zeigt exakte Zahl | mittelfristig | klein |

V8''/V9'' sind explizit V2-Web-App-Vormerkungen (nicht Sprint-10-Kandidaten).

---

## 4. Sprint-10-Scope — Kandidaten-Empfehlung

| Kandidat | Begründung | Modell-Empfehlung |
|---|---|---|
| **V4'' Soft-Delete-Pattern Karten** | UX-Lücke, klare Spec, kein Schema-Eingriff über `cards.deleted_at` hinaus | Sonnet 4.6 |
| **V5'' Sparraten-Treppe** | UI-Komponente, klare Visual-Spec im Prototyp, eigener neuer Komponente-Ordner `src/components/treppe/` (in CLAUDE.md §3 schon angekündigt) | Sonnet 4.6 |
| **V3'' Karten-spezifische Badge-Farben** | Kleinerer UI-Refactor, Schema-Erweiterung mit Karten-Farb-Spalte ODER Hash-Adapter (Entscheidung Pre-Sprint nötig) | Sonnet 4.6 |

**Vor-PM-Empfehlung an Sprint-10-PM:** Mit User klären. Drei reine UI-Sprints zur Auswahl, alle Sonnet-tauglich. Tempo wäre möglich.

**Parallele Architekten-Tasks (sprint-unabhängig):**

| Task | Empfehlung |
|---|---|
| V6'' Schema-Doku v3 → v3.1 | Vor oder zu Beginn von Sprint 10 anstoßen — entkoppelt vom Sprint-Scope |
| V7'' Defense-in-Depth-Patch | Klein, kann parallel laufen oder mit V6'' zusammen geliefert werden |

---

## 5. PM-Lessons (für Sprint-10-PM erfahrungsrelevant)

| LL | Kurzform |
|---|---|
| LL-13 (Sprint 6) | Spontane Frontend-Spec-Patches verboten, PM-Freigabe erforderlich |
| LL-14 (Sprint 7) | Multi-Komponenten-Sprints sequenziell, eigene Commits pro Phase |
| LL-15 (Sprint 7) | PM prüft Smoke-Tests gegen aktive §7-Konflikte + Sprint-K-Logiken + Test-Daten-Eigenschaften vor Briefing-Approval |
| LL-16 (Sprint 8) | Claude Code editiert Design-/Schema-Doku NIE — Doku-Patches als separate File, PM wendet sie an |
| LL-17 (Sprint 8) | `app_config`-Schwellen server-seitig lesen, Client erhält nur aufgelöste Werte |
| LL-18 (Sprint 9) | Live-RPC-E2E ohne Persistenz via RAISE-Rollback-Dry-Run als nicht-destruktive E2E-Verifikations-Technik |
| LL-19 (Sprint 9) | AC regel-basiert, nicht instanz-basiert formulieren, sofern die Regel über Test-Daten hinaus gilt |

**Sprint-9-Konkret-Erfahrungen für Sprint-10-PM:**

| Erfahrung | Konsequenz |
|---|---|
| Stufe-1-Architekten-Brief enthielt drei Spec-Drifts gegen DB-Realität (Spalte, PK, Hash-Name) | Vor Architekten-Brief Schema-Doku v3 spaltenscharf prüfen — LL-15 deckt das prinzipiell ab, Sprint 9 bestätigt die Regel |
| Backfill-Pattern via `ON CONFLICT DO UPDATE` ist neues Idempotenz-Tool | Für Sprint 10 wahrscheinlich irrelevant, aber als Pattern im Repertoire |
| AC4-Narrative-Drift (3 erwartet, 7 gemarkt) | LL-19 anwenden — AC regel-basiert formulieren wenn die Regel über Beispiele hinaus gilt |
| RAISE-Rollback-Dry-Run (LL-18) als Smoke-Technik | Bei Sprint 10 mit reinen UI-Sprints vermutlich nicht nötig, aber verfügbar |

---

## 6. Architekten-Chat-Status

- Architekten-Chat ist weiter benutzbar
- Pre-Sprint-9 Stufe 1 (Schema-Erweiterung + RPC V3) abgeschlossen 24.05.2026
- Sandbox 10/10 TCs grün dokumentiert
- **Offene Architekten-Backlog-Tasks für Pre-Sprint-10:**
  - V6'' Schema-Doku v3 → v3.1 (siehe §3) — sollte bei Sprint-10-Start angestoßen werden
  - V7'' Defense-in-Depth-Patch `calculate_card_amount_for_month` — klein, parallel
- Sprint-10-spezifische Vorbereitungs-Aufgaben hängen vom gewählten Scope ab:
  - V4'' Soft-Delete: keine Schema-Änderungen über `cards.deleted_at` hinaus (existiert)
  - V5'' Sparraten-Treppe: vermutlich keine Schema-Änderungen, Berechnungslogik existiert in §4.6
  - V3'' Badge-Farben: ggf. Schema-Erweiterung `cards.color` oder Hash-Adapter — als Pre-Sprint-10-Stufe 1 anlegen, falls V3'' gewählt

---

## 7. Empfohlene Phase-0-Reihenfolge für Sprint-10-PM

1. **Dieses Handover** — vollständig
2. **CLAUDE.md** (post-Sprint-9-Patch-Stand) — vor allem §10 Sprint-9-Block, neue LLs 18/19, gepatchte Modell-Empfehlung
3. **Sprint-9-Briefing + Review** — als Vorlage für Briefing-Stil + Smoke-Plan-Detailtiefe, insbesondere LL-18-Anwendung
4. **Design-Doku v3** (post-Patch-Stand) — bei V4''/V5'' sind §2.4 (Soft-Delete) bzw. §9 (Sparraten-Treppe) die zentralen Sektionen; bei V3'' §11 KI-Vorschlag-Badge
5. **Schema-Doku v3** (V6'' noch ausstehend) — Section 3 (Tabellen-Details) wenn Schema-Eingriff geplant
6. **Falls V5'' der Sprint-10-Scope wird:** Prototyp `sparrate_treppe_final_v2.html` durchgehen, §4.6-Berechnungslogik re-lesen

---

## 8. Modell-Empfehlung Sprint-10-PM-Chat selbst

**Sonnet 4.6** für den PM-Chat, falls V4'' oder V5'' als Sprint-10-Scope. Beide sind reine UI-Sprints mit klaren Specs, keine koordinative Komplexität, keine parallele Architekten-Vorlauf-Koordination (V6''/V7'' laufen entkoppelt).

**Opus 4.7** nur, falls V3'' gewählt wird (Schema-Eingriff oder Hash-Adapter-Architektur-Entscheidung) — analog zur Sprint-9-Begründung.

---

*PM-Handover Sprint 9 → 10 · 24. Mai 2026*
