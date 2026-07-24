# Doku-Patch 24.07.2026 (abends) — Beschlüsse Lösch/B2/Erstattungen + Steuererstattungs-Karte + Test-Projekt-Vorbereitung

> **Rolle:** docs-maintainer (Claude Code, LL-16-Verfahren)
> **Datum:** 24.07.2026 (abends)
> **Ziel-Dateien (vier):** `V2/architekt_stufe1_karten_loeschen_m1_m2.md` ·
> `V2/architekt_konzept_b2_treiber_heuristik.md` · `V2/optionspapier_erstattungen.md` ·
> `antigravity_finance_design_dokument.md` · `CLAUDE.md`
> **Nicht angefasst:** Schema-Doku, Code, git
> **Zweck:** Doku-Nachzug zu den User-Beschlüssen vom 24.07.2026 („① alles ja · ② ja ·
> ③ ja, Karte legst du an" auf die drei V2-Papiere) + Sprint-Abschluss-Doku
> (Steuererstattungs-Karte, Test-Projekt-Vorbereitungsstand).
> **Quelle für alle Patch-Stellen:** User-Entscheidung im Chat vom 24.07.2026 auf die
> drei V2-Papiere (`architekt_stufe1_karten_loeschen_m1_m2.md`,
> `architekt_konzept_b2_treiber_heuristik.md`, `optionspapier_erstattungen.md`) +
> Ausführungs-Fakten aus derselben Session (Karten-Anlage, Test-Projekt-Blocker).
> Kein separates Sprint-Review vorhanden — Entscheidungs-/Ops-Nachtrag, kein Feature-Sprint.

Jede Patch-Stelle: Ziel-Datei · Anker (exaktes Zitat) · Patch (alt → neu / Einfügetext) · Quelle.
Nummerierung P1–P5 folgt dem Auftrag, mit Unter-Buchstaben für einzelne Anker innerhalb
einer Stelle (P4, P5).

---

## Patch-Stelle 1 (P1) — Status-Zeile Lösch-Papier

**Ziel-Datei:** `V2/architekt_stufe1_karten_loeschen_m1_m2.md`

**Anker** (exaktes Zitat, Zeile 6):
```
> **Status:** ENTWURF — reine Analyse + Vorschlag, kein Schema-Eingriff, keine Migration
```

**Patch (alt → neu):**
```
> **Status:** ENTSCHIEDEN 24.07.2026 — E1 (Drei-Verben-Modell + Gate) ja · E2 (Verbergen streichen) ja · E3 (Hard-Delete opportunistisch) ja · E4 (Test-Projekt) freigegeben, Anlage aktuell durch Free-Projekt-Limit blockiert (2/2 Slots belegt, siehe Runbook `supabase/test_projekt/README.md`). Umsetzung im Folge-Sprint (neue Session).
```

**Quelle:** User-Entscheidung im Chat vom 24.07.2026 auf das Lösch-Papier
(„① alles ja") + Session-Fakt Test-Projekt-Free-Tier-Limit (2/2 Slots belegt).

---

## Patch-Stelle 2 (P2) — Status-Zeile B2-Konzeptpapier

**Ziel-Datei:** `V2/architekt_konzept_b2_treiber_heuristik.md`

**Anker** (exaktes Zitat, Zeile 6):
```
> **Status:** ENTWURF — Konzept, kein Code, kein Schema-Eingriff
```

**Patch (alt → neu):**
```
> **Status:** ENTSCHIEDEN 24.07.2026 — E1 (Δ-Definition) ja · E2 (Jahres-RPC) ja · E3 (Sequenz nach Lösch-Sprint) ja · E4 (Rohmasse-Pseudo-Treiber) als offene DD-Frage mitgenommen.
```

**Quelle:** User-Entscheidung im Chat vom 24.07.2026 auf das B2-Konzeptpapier („② ja").

---

## Patch-Stelle 3 (P3) — Status-Zeile Erstattungs-Optionspapier

**Ziel-Datei:** `V2/optionspapier_erstattungen.md`

**Anker** (exaktes Zitat, Zeile 6):
```
> **Status:** ENTWURF — Optionen + Empfehlung, kein Schema-Eingriff nötig
```

**Patch (alt → neu):**
```
> **Status:** ENTSCHIEDEN 24.07.2026 — E1 (Leitfaden O1+O2, Schwelle 100 €) ja · E2: ONCE-INCOME-Karte „Steuererstattung 2025" (Juni, +2.658,35 €) am 24.07.2026 durch den Arbeits-Agenten per `create_card_from_fragment` angelegt und mit dem Erstattungs-Fragment verlinkt (Juni-Sparrate verifiziert: 4.545,32 €) · E3 (kein Schema-Weg) ja. Design-Doku-Leitfaden-Patch: siehe P4 dieser Patch-Datei.
```

**Quelle:** User-Entscheidung im Chat vom 24.07.2026 auf das Erstattungs-Optionspapier
(„③ ja, Karte legst du an") + Ausführungs-Fakt (Karten-Anlage + Sparrate-Verifikation
in derselben Session).

---

## Patch-Stelle 4 (P4) — Design-Doku: Kurations-Leitfaden §11 + Versions-Bump

**Ziel-Datei:** `antigravity_finance_design_dokument.md`

### 4a — Neuer Absatz am Ende von §11 (vor dem Section-Trenner zu §12)

**Anker** (exaktes Zitat, letzte inhaltliche Zeile von §11 + folgender Trenner):
```
- Keine Kategorie-Vorhersage in V1 (Karten-Zuordnung reicht)

---
```

**Patch (alt → neu — neuer Unterabschnitt zwischen letztem §11-Punkt und Trenner):**
```
- Keine Kategorie-Vorhersage in V1 (Karten-Zuordnung reicht)

### Behandlung von Erstattungen — Kurations-Leitfaden (Beschluss 24.07.2026)

Positive Fragmente ohne Transfer-Charakter werden nach vier Regeln kuratiert:
1. **Retouren/Erstattungen mit Kosten-Bezug** → per Drag auf die verursachende
   Karte (Verrechnung; `calculate_card_amount_for_month` summiert verlinkte
   Fragmente vorzeichen-agnostisch — bei BUDGET senkt die Gutschrift den
   Verbrauch, bei FIXED_COST die Realität).
2. **Wiederkehrende Erstattungs-Quellen** → eigene MONTHLY-INCOME-Karte.
3. **Einmal-Zuwendungen ab 100 €** (Erheblichkeits-Schwelle) → ONCE-INCOME-Karte
   im betreffenden Monat.
4. **Unter der Schwelle** → bewusst unzugeordnet in der Rohmasse (die Sparrate
   bleibt insoweit konservativ).

Ein Schema-/RPC-Eingriff ist dafür nicht nötig und wurde bewusst verworfen
(Kern-Invariante §4.2: Karten sind die einzige Realitäts-Quelle der Sparrate).

---
```

**Quelle:** `V2/optionspapier_erstattungen.md` §4 (Empfehlung O1+O2) + User-Entscheidung
E1 im Chat vom 24.07.2026 („③ ja").

### 4b — Versions-Bump im Header + Changelog-Eintrag

**Anker** (exaktes Zitat, Zeile 3 — Version-Zeile):
```
**Version:** 3.1.3 (V2 · v2-02 Doku-Nachzug)
```

**Patch (alt → neu):**
```
**Version:** 3.1.4 (V2 · v2-02 Doku-Nachzug)
```

**Anker 2** (exaktes Zitat — Ende des bestehenden Changelog-Blocks, zwei zusammenhängende Zeilen):
```
> **Changelog v3.1.3 (06.07.2026, v2-02-Doku-Nachzug):** §9 Regime-Grenze inkl. laufendem Monat (teal bis einschließlich aktueller Monat, grau ab erstem Zukunftsmonat); NULL-Monate = 0 € auf Welle/Tooltip; Treiber-Slots zeigen „B2-Heuristik offen" bis B2.
>
> **Datei-Konvention (23.07.2026):**
```

**Patch (alt → neu — neuer Changelog-Eintrag eingefügt, Muster der bestehenden Einträge):**
```
> **Changelog v3.1.3 (06.07.2026, v2-02-Doku-Nachzug):** §9 Regime-Grenze inkl. laufendem Monat (teal bis einschließlich aktueller Monat, grau ab erstem Zukunftsmonat); NULL-Monate = 0 € auf Welle/Tooltip; Treiber-Slots zeigen „B2-Heuristik offen" bis B2.
>
> **Changelog v3.1.4 (24.07.2026):** §11 um Kurations-Leitfaden „Behandlung von Erstattungen" ergänzt (Beschluss Optionspapier Erstattungen, 24.07.2026).
>
> **Datei-Konvention (23.07.2026):**
```

**Quelle:** CLAUDE.md §7 Grundregel 4 (Versions-/Changelog-Bump-Pflicht bei Doku-Patches) +
Auftrags-Vorgabe (exakter Changelog-Text).

---

## Patch-Stelle 5 (P5) — CLAUDE.md

**Ziel-Datei:** `CLAUDE.md`

### 5a — Header „Letzte Aktualisierung"

**Anker** (exaktes Zitat, Zeile 5 — einzige Stelle mit dieser Kopfzeile):
```
> **Letzte Aktualisierung:** 24. Juli 2026 · **Nach:** v2-04 + Go-Live-Initial-Import 2026 + Smoke-Infrastruktur (M0, Pixel-Checks, smoke-agent)
```

**Patch (alt → neu):**
```
> **Letzte Aktualisierung:** 24. Juli 2026 (abends) · **Nach:** Beschlüsse Lösch/B2/Erstattungen + Steuererstattungs-Karte + Test-Projekt-Vorbereitung
```

**Quelle:** CLAUDE.md §7 Grundregel 4 (Header-Datum-Pflege bei jedem Doku-Patch-Lauf).

### 5b — „Doku-Stand nach v2-04"-Zeile: Versionsangabe

**Anker** (exaktes Zitat, vollständige Zeile):
```
**Doku-Stand nach v2-04:** Design-Doku v3.1.3 (`antigravity_finance_design_dokument.md`), Schema-Doku v3.2 (`antigravity_finance_schema_summary.md`). **N4b / N5 / B3:** durch DD-Cluster 3 entschieden (04.07.2026), umgesetzt in v2-03.
```

**Patch (alt → neu — nur die Versionsangabe geändert, Rest identisch):**
```
**Doku-Stand nach v2-04:** Design-Doku v3.1.4 (`antigravity_finance_design_dokument.md`), Schema-Doku v3.2 (`antigravity_finance_schema_summary.md`). **N4b / N5 / B3:** durch DD-Cluster 3 entschieden (04.07.2026), umgesetzt in v2-03.
```

**Quelle:** Folgepatch aus P4b dieser Datei (Design-Doku-Versions-Bump v3.1.3 → v3.1.4).

### 5c — Neuer Append-Eintrag ans Dateiende

**Anker** (exaktes Zitat, letzte Zeile der Datei — Ende des Sprint-v2-04-Blocks /
Go-Live-Nachtrags):
```
  Bulk-RPC `get_cards_with_effective_plan_for_month` (V3-Vormerkung Sprint 5) bleibt
  vorgemerkt, falls Latenz spürbar bleibt.
```

**Patch (Einfügetext, nach dieser Zeile angehängt):**
```
### Beschlüsse Lösch/B2/Erstattungen + Test-Projekt-Vorbereitung · 24. Juli 2026 (abends)

**User-Entscheidungen** („① alles ja · ② ja · ③ ja, Karte legst du an") auf die drei
V2-Papiere vom selben Tag:
- **Lösch-Sprint (M1/M2):** Drei-Verben-Modell (Beenden/Löschen mit Gate/Detach)
  angenommen; Verbergen wird ersatzlos gestrichen; Hard-Delete-Vollzug
  opportunistisch; Test-Projekt freigegeben.
- **B2:** Δ-Heuristik (displayed − effective_plan, Ranking |Δ|) + Jahres-RPC
  angenommen; Sequenz nach dem Lösch-Sprint; Rohmasse-Pseudo-Treiber = offene DD-Frage.
- **Erstattungen:** Kurations-Leitfaden O1+O2 mit 100-€-Schwelle angenommen
  (Design-Doku §11-Patch → v3.1.4); Schema-Weg (O4) verworfen.

**Ausgeführt am 24.07.:** ONCE-INCOME-Karte „Steuererstattung 2025" (Juni 2026,
+2.658,35 €) per `create_card_from_fragment` angelegt und mit dem
Steuererstattungs-Fragment verlinkt — Juni-Ist-Sparrate seither 4.545,32 €
(vorher 1.886,97 €, cent-exakt verifiziert).

**Test-Projekt (Übungs-Datenbank):** Anlage blockiert — das Free-Projekt-Limit
des Accounts ist mit „Antigravity-Finance" (Prod) + „Rennrad-Trainer" erschöpft
(2/2). Vollständige Schema-Extraktion aus Prod ist erfolgt (10 Tabellen, 6 Enums,
~20 eigene Funktionen, View, 6 Trigger inkl. auth-Trigger, RLS-Policies,
14 Zusatz-Indizes, app_config-Seeds); Wiederaufbau-Anleitung + Generator-Queries +
deterministischer Init-2-Seed (Anker 2.200,00 €) liegen in
`supabase/test_projekt/`. Offene User-Entscheidung: Slot freimachen
(„Rennrad-Trainer" pausieren) oder Upgrade — danach ist der Aufbau in wenigen
Minuten ausführbar (erster Schritt der Folge-Session).
```

**Quelle:** User-Entscheidung im Chat vom 24.07.2026 (alle drei V2-Papiere) +
Ausführungs-Fakten aus derselben Session (Karten-Anlage, Test-Projekt-Blocker-Status).

---

## Anwendungs-Hinweis

Alle Anker wurden vor Anwendung einzeln per Grep auf Eindeutigkeit im jeweiligen
Ziel-Dokument geprüft (je genau ein Treffer). `supabase/test_projekt/README.md` +
`extract_queries.sql` + `init2_seed.sql` existieren im Repo (verifiziert), die
P1-Statuszeile referenziert damit einen realen Runbook-Pfad. Schema-Doku ist von
diesem Auftrag nicht betroffen — keine der drei Entscheidungen erforderte einen
Schema-/RPC-Eingriff (E3 im Lösch-Papier bzw. E3 im Erstattungspapier bestätigen das
explizit). Relative Datumsangaben aus dem Auftrag sind bereits absolut (24.07.2026
aus der Session).
