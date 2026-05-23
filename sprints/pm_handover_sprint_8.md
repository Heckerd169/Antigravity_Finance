# PM-Handover Sprint 8 → 9

> **Vom:** PM-Chat Sprint 8 (Opus 4.7, geschlossen 23.05.2026)
> **An:** PM-Chat Sprint 9 (neuer Chat)
> **Datum:** 23. Mai 2026

---

## 0. KRITISCHE ARBEITSREGEL — TOKEN-DISZIPLIN (vor allem anderen)

Aus PM-Handover 7→8 übernommen und in Sprint 8 sauber gelebt. Verbindlich für den Sprint-9-PM:

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

## 1. Stand auf `main` nach Sprint 8

| Sprint | Status | Approval |
|---|---|---|
| 0–6 | 🟢 | bis 20.05.2026 |
| 7 | 🟢 | 21.05.2026 |
| 8 | 🟢 | 23.05.2026 |

Bundle `/ → 22.4 kB`, First Load JS 174 kB. §4.6-Anker (`calculate_sparrate_for_month` März 2026 = `2910.01`) intakt nach Sprint-8-Browser-Smoke.

CLAUDE.md + Design-Doku v3 sind mit Sprint-8-Patches aktualisiert (siehe Outputs `CLAUDE_md_sprint_08_patches.md` + `sprint_08_doku_patches.md`).

**Schema-Doku v3** liegt als Architekten-Lieferung im Projekt-Knowledge (`antigravity_finance_schema_summary_v3.md`) und löst v2 als aktiven Snapshot ab. v2 bleibt als historischer Snapshot bestehen (Versionierungs-Prinzip wie bei der Design-Doku). v3 dokumentiert: alle 6 neuen RPCs (`calculate_planned_sparrate_for_month`, `create_card_direct`, `create_card_from_fragment`, `get_effective_plan_for_month`, `toggle_card_manually_paid`, `process_csv_import`), `link_origin`-Werte (`AUTO_ABSORBED` / `MANUAL_DROP`), Sprint-8-Erweiterungen auf `fragments` (`confidence`, `suggested_card_id`, `imported_at`), `cards.deleted_at` (Soft-Delete-Marker), `card_monthly_states.adjustment_scope` + `closed_at`, View `fragments_with_status` erweitert um `AUTO_ABSORBED`-Status, und Section 11 mit 13 funktionalen Indexes.

**Branch-Stand:**
- `main` mit Sprints 0–8 gemerged
- `sprint/08-csv-import` als Backup-Pointer behalten
- `sprint/07-ui-completion` nach Sprint-8-Merge gelöscht (rotierende Backup-Logik)

**Test-User:** `179cd2c1-bbc2-4fd0-954b-8735eb90f370`

| Karte | Type | Attribution | Frequency | first_active | Stand Mai 2026 |
|---|---|---|---|---|---|
| Miete | FIXED_COST | GEMEINSAM | MONTHLY | 2026-01-01 | aktiv |
| Netflix | FIXED_COST | ICH | MONTHLY | 2026-01-01 | aktiv |
| Steuerrückzahlung | INCOME | ICH | ONCE | 2026-03-01 | nur März, Fragment-verlinkt, `manually_paid=true` |
| Tanken | BUDGET | ICH | MONTHLY | 2026-01-01 | aktiv |
| Hobby | BUDGET | ICH | MONTHLY | 2026-05-01 | aktiv, keine Fragmente |
| Auswärts Essen | BUDGET | ICH | MONTHLY | 2026-05-01 | aktiv, Σ 120 € Fragmente bei Plan 80 € |
| Nebenjob | INCOME | ICH | MONTHLY | 2026-05-01 | Pre-Sprint-8-Test, keine Fragmente — ermöglicht INCOME-Tap-Toggle |

Plus die im Sprint-8-Smoke importierten Mai-2026-DKB-Fragmente (echtes User-CSV + Synthetic-CSVs). Genaue Anzahl im DB-State.

---

## 2. Sprint-8-OQs (Entscheidungen)

| # | Frage | Entscheidung |
|---|---|---|
| OQ1 | Karten-spezifische Badge-Farbe | V1 = generisches Yellow-Soft. V2-C-Vormerkung für Karten-Farben |
| OQ2 | Mehrfach-Match Badge-Range | Höchster Score gewinnt, Tie → alphabetisch erster Karten-Name. In §11 gepatcht |
| OQ3 | Mehrfach-Match Auto-Absorb-Range | dieselbe Regel wie OQ2, in §11 gepatcht |

---

## 3. Sprint-9-Vormerkungen V1''–V5''

| # | Vormerkung | Typ | Aufwand |
|---|---|---|---|
| V1'' | **V2-A (Cortal-Consors-Parser):** Anderes CSV-Format (12 Vor-Header-Zeilen, `DD.MM.YYYY`-Datum, getrennte Betrags-/Währungs-Spalte). Eigener Parser, Format-Erkennung als Heuristik-Erweiterung | Sprint-Kandidat | mittel |
| V2'' | **V2-B (IBAN-Filter / Cross-Account-Transfer-Erkennung):** Schema-Erweiterung `profiles.own_ibans[]`, Fragmente mit eigener IBAN auf Gegenseite werden als `INTERNAL_TRANSFER` markiert und nicht in Sparrate gerechnet | Sprint-Kandidat | hoch (Schema + UI) |
| V3'' | **V2-C (Karten-spezifische Badge-Farben):** Karten-Farb-Spalte oder deterministische Hash-zu-Farb-Mapping. Visuelle Differenzierung im Stack | mittelfristig | mittel |
| V4'' | **Soft-Delete-Pattern Karten (§2.4):** UX-Lücke „Karte aus Vergangenheit löschen". Pre-Sprint-8 schon einmal als Kandidat gelistet, nicht gewählt | Sprint-Kandidat | mittel |
| V5'' | **Sparraten-Treppe (§9):** UI-Komponente, klare Visual-Spec im Prototyp `sparrate_treppe_final_v2.html` | Sprint-Kandidat | mittel |

V1''/V2'' sind direkt aus Sprint-8-V2-Vormerkungen abgeleitet. V4''/V5'' bleiben aus Sprint-8-Kandidatenliste übrig.

---

## 4. Sprint-9-Scope — Kandidaten-Empfehlung

Vor-PM-Empfehlung-Reihenfolge:

| Kandidat | Begründung | Modell-Empfehlung |
|---|---|---|
| **Cortal-Consors-Parser + Cross-Account-Erkennung (V1''+V2'' kombiniert)** | Komplettiert die CSV-Import-Story. Cross-Account-Erkennung ist semantisch nötig, sobald Cortal-Daten reinkommen (sonst Sparrate-Verzerrung). Größerer Sprint mit Schema-Erweiterung | **Opus 4.7** |
| **Soft-Delete-Pattern Karten (V4'')** | UX-Lücke, klare Spec, kein Schema-Eingriff über Soft-Delete-Spalte hinaus | Sonnet 4.6 |
| **Sparraten-Treppe (V5'')** | UI-Komponente, klare Visual-Spec im Prototyp | Sonnet 4.6 |

**Vor-PM-Empfehlung an Sprint-9-PM:** Mit User klären. Wenn der User Cortal-Daten regelmäßig nutzt (was er in der Sprint-8-Vorbereitung erwähnt hat), ist V1''+V2'' zusammen der wertvollste, aber auch der größte Kandidat — gut für Opus. Soft-Delete oder Sparraten-Treppe sind „leichter Sprint 9" mit Sonnet, falls Tempo gewünscht.

---

## 5. PM-Lessons (für Sprint-9-PM erfahrungsrelevant)

| LL | Kurzform |
|---|---|
| LL-13 (Sprint 6) | Spontane Frontend-Spec-Patches verboten, PM-Freigabe erforderlich |
| LL-14 (Sprint 7) | Multi-Komponenten-Sprints sequenziell, eigene Commits pro Phase |
| LL-15 (Sprint 7) | PM prüft Smoke-Tests gegen aktive §7-Konflikte + Sprint-K-Logiken + Test-Daten-Eigenschaften vor Briefing-Approval |
| LL-16 (Sprint 8) | Claude Code editiert Design-/Schema-Doku NIE — Doku-Patches als separate File, PM wendet sie an |
| LL-17 (Sprint 8) | `app_config`-Schwellen server-seitig lesen, Client erhält nur aufgelöste Werte |

**Sprint-8-Konkret-Erfahrungen für Sprint-9-PM:**

| Erfahrung | Konsequenz |
|---|---|
| Spec-Lücken bei „Sortierung" / „Tiebreaker" / „Mehrfach-Match" kommen erst im Browser-Smoke auf | Pre-Briefing systematisch nach diesen Spec-Patterns im Sprint-Scope scannen |
| PL/pgSQL `RETURNING INTO` bei `ON CONFLICT DO NOTHING` ist Variable-Leak-Pitfall | Architekt kennt es jetzt — für künftige RPCs CTE-Pattern bevorzugen |
| Same-Day + Same-Import-Charge Fragmente haben identisches `transaction_date` UND `imported_at` | Sortier-Tiebreaker brauchen mindestens 3-4 Schlüssel, nicht 2 |

---

## 6. Architekten-Chat-Status

- Architekten-Chat ist weiter benutzbar
- Pre-Sprint-8-Stufen 1 + 2 abgeschlossen (Nebenjob-Karte LIVE + RPC-Inventur)
- Sprint-8-Stufe (`process_csv_import` V2) abgeschlossen
- **Schema-Doku v2 → v3 abgeschlossen 23.05.2026** — Architekt-Lieferung mit vollständigem read-only-MCP-Scan. Format-Treue zu v2 erhalten, 13 Sections (Original 1–11 + neue 11–13 für Indexes / Trigger / Globale Konstanten)
- Architekten-Backlog für Pre-Sprint-9: keine offenen Aufgaben aus Sprint-8-Linie. Sprint-9-spezifische Vorbereitungs-Aufgaben hängen vom gewählten Scope ab (insbesondere V2'' Cortal+Cross-Account würde Schema-Erweiterungen `profiles.own_ibans[]` und ggf. `fragments.transfer_type` benötigen — als Pre-Sprint-9-Stufe 1 anlegen, falls V2'' gewählt)

---

## 7. Empfohlene Phase-0-Reihenfolge für Sprint-9-PM

1. **Dieses Handover** — vollständig
2. **CLAUDE.md** (post-Sprint-8-Patch-Stand) — vor allem §10 Sprint-8-Block + neue LLs 16/17
3. **Sprint-8-Briefing + Review** — als Vorlage für Briefing-Stil + Smoke-Plan-Detailtiefe
4. **Design-Doku v3** (post-Patch-Stand) — §7 Konflikt 6, §10 Stack-Sortierung, §11 (Hash-Adapter + Mehrfach-Match)
5. **Schema-Doku v3** — vor allem Section 3 (Tabellen-Details), Section 4 (RPCs, jetzt vollständig), Section 9 (Verhaltens-Notes inkl. `closed_at`)
6. **Falls V1''+V2'' der Sprint-9-Scope wird:** §11 CSV-Import komplett re-lesen, Cortal-CSV-Sample, Pfad-A-Logik aus Sprint 8

---

## 8. Modell-Empfehlung Sprint-9-PM-Chat selbst

**Opus 4.7** für den PM-Chat. Sprint-9-Scope-Entscheidung steht aus, gleichzeitig potentiell parallele Architekten-Vorlauf-Koordination (V2'' bedeutet Schema-Erweiterung). Koordinative Komplexität rechtfertigt Opus.

---

*PM-Handover Sprint 8 → 9 · 23. Mai 2026*
