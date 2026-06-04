# Sprint 6 Briefing — Sparrate-Verifikation §4.6

> **Sprint:** 6
> **Komponente:** End-to-End-Verifikation Sparrate-Berechnung gegen §4.6-Test-Case (2.910,01 €, März 2026)
> **Branch:** `sprint/06-sparrate-verification`
> **Modell-Empfehlung:** Claude Sonnet 4.6 (Begründung in §0.6)
> **Status vor Start:** 🟢 alle Voraussetzungen erfüllt — Pre-Sprint-Architekten-Auftrag durchgelaufen, Sprint kann starten
> **Sprint-Charakter:** **Verifikations-Sprint, kein Feature-Sprint.** Bei grünem Smoke = harter Gate für Sprints 2–5 erfüllt, keine Code-Änderungen. Bei rotem Smoke = Bug-Eskalation an PM, keine Eigen-Patches.

---

## 0. Voraussetzungen

### 0.1 Repo-Stand
- `main` enthält Sprints 0–5 grün gemerged
- `main` enthält Design-Doku-Klarstellung §4.6 als eigener `docs:`-Commit (Tanken-Zeile: „manuell getappt" ergänzt)
- Backup-Pointer: `sprint/05-interaction-zone` bleibt für Rollback (Pattern wie Sprint 4)

### 0.2 Architekten-Vorarbeit — abgeschlossen vor Sprint-Start
- **Stufe 1** Sandbox-Verifikation: grün, RPC liefert cent-genau `2910.01`
- **Stufe 2** Reset+Seed echter Test-User: durchgelaufen, Test-User-Tabellen entsprechen §4.6
- **Architekt-MCP-Cross-Check (read-only)** verifiziert: alle 5 Einzel-Karten-Beträge + Split + Ist-Sparrate + Plan-Sparrate korrekt

### 0.3 Test-User-State (§4.6-Setup, post-Reset durch Architekt am 19. Mai 2026)

**Test-User-UUID:** `179cd2c1-bbc2-4fd0-954b-8735eb90f370`
**Login-Credentials:** beim User (außerhalb dieses Briefings)

| Tabelle | Inhalt |
|---|---|
| `profiles` | 1 Row, `onboarded_at` gesetzt |
| `income_timeline` | 2 Rows, beide `effective_month = 2026-01-01`: ICH Brutto 60k / Netto 3.100, PARTNER Brutto 40k / Netto 2.200 |
| `cards` | 5 Karten: Miete · Strom · Netflix · Tanken · Steuerrückzahlung |
| `card_planned_timeline` | 5 Plan-Zeilen, jeweils `effective_month = first_active_month` |
| `card_monthly_states` | 2 Rows für `2026-03-01`: Netflix `manually_paid=true`, **Tanken `manually_paid=true`** |
| `fragments` | 3 Rows mit `transaction_date` in März 2026: Miete −1.200 · Tanken −180 · Steuerrückzahlung +800 |
| `card_fragment_links` | 3 Links, alle `month = 2026-03-01`, `origin = 'MANUAL_DROP'` |

### 0.4 Karten-Detail-Spezifikation

| Name | type | attribution | frequency | first_active | last_active | planned_amount |
|---|---|---|---|---|---|---|
| Miete | FIXED_COST | GEMEINSAM | MONTHLY | 2026-01-01 | NULL | 1200.00 |
| Strom | FIXED_COST | GEMEINSAM | MONTHLY | 2026-01-01 | NULL | 120.00 |
| Netflix | FIXED_COST | ICH | MONTHLY | 2026-01-01 | NULL | 17.99 |
| Tanken | BUDGET | ICH | MONTHLY | 2026-01-01 | NULL | 200.00 |
| Steuerrückzahlung | INCOME | ICH | ONCE | 2026-03-01 | 2026-03-01 | 800.00 |

### 0.5 RPC-Erwartungs-Werte (durch Architekt-MCP-Cross-Check verifiziert)

| RPC | Argument | Erwarteter Output |
|---|---|---|
| `calculate_sparrate_for_month(user, '2026-03-01')` | — | **`2910.01`** (Ist-Sparrate, §4.6-Zielwert) |
| `calculate_planned_sparrate_for_month(user, '2026-03-01')` | — | **`2890.01`** (Plan-Sparrate) |
| `get_split_factor(user, '2026-03-01')` | — | `0.60` |
| `calculate_card_amount_for_month(<miete-id>, '2026-03-01')` | — | `1200.00` |
| `calculate_card_amount_for_month(<strom-id>, '2026-03-01')` | — | `120.00` |
| `calculate_card_amount_for_month(<netflix-id>, '2026-03-01')` | — | `17.99` |
| `calculate_card_amount_for_month(<tanken-id>, '2026-03-01')` | — | **`180.00`** (Tap + Fragmente, §4.3.3) |
| `calculate_card_amount_for_month(<steuer-id>, '2026-03-01')` | — | `800.00` |

### 0.6 Modell-Empfehlung
**Claude Sonnet 4.6.** Abweichend von CLAUDE.md §9 (Opus): §4-Konflikte sind vorab geklärt (Pre-Sprint-Spec-Klarstellung §4.6), Pre-Sprint-Architekten-Verifikation grün, Sprint ist reiner Frontend-Smoke ohne offene Bug-Verdachte. Eskalation zu Opus 4.7 bei rotem Smoke-Befund (analog Sprint-4-Eskalations-Heuristik).

### 0.7 Was NICHT Sprint-Scope ist
- Keine Code-Änderungen bei grünem Smoke (Sprint ist Verifikation, kein Feature-Sprint)
- Keine BUDGET-Tap-UI-Geste — V1-Vormerkung Sprint 7+
- Keine Schema-Doku-Pflege v2→v3 — Architekten-Parallel-Auftrag, nicht Sprint-6-Scope
- Kein Sprint-4-`CardsCarousel`-Orphan-Cleanup (V2) — eigener Mini-Sprint später
- Kein Bulk-RPC `get_cards_with_effective_plan_for_month` (V3) — bedingt, abhängig von Latenz-Befund in S19
- Keine Touch/Swipe/Mobile (CLAUDE.md §7)
- Keine eigene Sparrate-Berechnung im Frontend (CLAUDE.md §7 Regel 1)

---

## 1. Pflicht-Lese-Reihenfolge

1. **`CLAUDE.md`** — komplett inkl. LL-1 bis LL-12
2. **`antigravity_finance_design_dokument_v3.md`:**
   - **§4 Sparrate** (insbesondere §4.3 Berechnungstabellen + §4.6 Test-Case mit klargestellter Tanken-Tap-Zeile)
   - §5 Singularity Ring (Visual + Zentrumszahl-Farblogik)
   - §6 Header / Timeline-Navigation (Status-Pill, Cross-Fade)
   - §7 Karten (alle Zustände/Typen, Konflikte 1–6)
   - §10 Income/Partner-Split-Popup (60/40-Anzeige)
   - §3 Tokens
3. **`antigravity_finance_schema_summary_v2.md`** §3, §4, §5 — Karten, RPCs, Mapping
4. **`sprints/sprint_05_briefing.md`** + **`sprints/sprint_05_review.md`** — Sprint-5-Kontext, K1+K2-Iterations-Lessons
5. **`sprints/sprint_04_briefing.md`** + **`sprints/sprint_04_review.md`** — Karten-Komponenten-Detail (insbesondere Tap-Pfad, Adjustment-Pattern, BUDGET-Visual-Spec)

---

## 2. Ziel

End-to-End-Verifikation der Sparrate-Berechnung gegen §4.6-Test-Case durch Browser-Smoke gegen den vom Architekten ge-seedeten §4.6-State. Bei grünem Befund: harter Gate für Sprints 2–5 erfüllt, Sprint-Approval möglich.

**Kernbedingung:** Frontend-Werte müssen mit Architekt-RPC-Werten konsistent sein. Cent-genaue Cross-Check via SQL-Editor parallel zum Browser.

---

## 3. Aufgaben

### 3.1 Pre-Smoke-Setup (am Sprint-Start)
1. `git status` clean prüfen, `main` auf neuestem Stand mit Design-Doku-§4.6-Update
2. Sprint-Branch erstellen: `git checkout -b sprint/06-sparrate-verification`
3. Dieses Briefing nach `sprints/sprint_06_briefing.md` kopieren
4. **`docs: sprint 6 briefing`-Commit** auf Sprint-Branch (Initial-Commit, analog Sprint-5-Pattern)
5. `pnpm install` (Sicherheits-Check) + `pnpm dev` startet ohne Errors
6. `pnpm build`, `pnpm tsc --noEmit`, `pnpm next lint` — alle clean (Baseline-Check)

### 3.2 Browser-Smoke gegen März 2026
Login (User stellt Credentials bereit). Navigation zu `/?month=2026-03`. Vollständige Smoke-Sequenz §5 durchlaufen. Tabelle mit ✓/✗ pro Schritt.

### 3.3 Cross-Check via SQL Editor
Parallel im Supabase SQL Editor (User runt, Claude Code instruiert):

```sql
-- Ist-Sparrate
SELECT calculate_sparrate_for_month('179cd2c1-bbc2-4fd0-954b-8735eb90f370', '2026-03-01');
-- Erwartet: 2910.01

-- Plan-Sparrate
SELECT calculate_planned_sparrate_for_month('179cd2c1-bbc2-4fd0-954b-8735eb90f370', '2026-03-01');
-- Erwartet: 2890.01

-- Einzel-Karten-Beträge (Diagnostik bei rotem Smoke)
SELECT name, calculate_card_amount_for_month(id, '2026-03-01') AS betrag
FROM cards
WHERE user_id = '179cd2c1-bbc2-4fd0-954b-8735eb90f370'
ORDER BY type, name;
```

Diese Werte werden im Review als Cross-Check-Tabelle dokumentiert.

### 3.4 Bei rotem Smoke (eskalieren statt patchen)
Wenn Frontend-Werte abweichen von Architekt-SQL:
- Diagnose-Sammlung: welche Karte, welcher Wert, Frontend-vs.-SQL-Differenz
- **Eskalation an PM** im Sprint-Output — KEIN Eigen-Patch
- PM koordiniert Patch-Pfad mit Architekt (Frontend-Bug? RPC-Bug? Setup-Bug?)
- Sprint-Approval blockiert bis Bug behoben (LL-11)

### 3.5 Sprint-Review schreiben
`sprints/sprint_06_review.md` gemäß Format §6. Bei grünem Smoke: keine weiteren Commits außer dem Review-`docs:`-Commit.

---

## 4. Akzeptanz-Kriterien

| # | Kriterium | Erwartung |
|---|---|---|
| A1 | Ring-Zentrumszahl im März 2026 | **2.910 €** (gerundet, K1.6 — `formatEuroRing` ohne Cent) |
| A2 | Ring-Zentrumszahl-Farbe | grün/teal `#3ECFAF` (Ist 2.910 > Plan 2.890 → §5 Farblogik) |
| A3 | Ring-Arc-Füllung | voll-gefüllt-plus-Indikator (Ist > Plan → §5 positiver Arc) |
| A4 | Status-Pill im März 2026 | `Abgeschlossen` (März < heute=Mai, §6) |
| A5 | Header-Subzeile linke Flanke (Februar-Vormonat) | `Alles erledigt` (keine Februar-Fragmente im §4.6-Setup) |
| A6 | Miete-Karte | Anzeige **1.200,00 €** · Fixkosten · GEMEINSAM · Status `Bezahlt` (durch Fragment §7) |
| A7 | Strom-Karte | Anzeige **120,00 €** · Fixkosten · GEMEINSAM · Status `Offen` (kein Fragment, kein Tap) |
| A8 | Netflix-Karte | Anzeige **17,99 €** · Fixkosten · ICH · Status `Bezahlt` (manueller Tap §7) |
| A9 | Tanken-Karte | Anzeige **180,00 €** (NICHT 200 €!) · Budget · ICH · Status `Laufend` · Untertext `Noch 20 € frei` · BUDGET-Tap-Visual fehlt (V1-erwartet — siehe A5 Anti-Drift) |
| A10 | Steuerrückzahlung-Karte | Anzeige **800,00 €** · Einnahme · ICH · Status `Erhalten` (durch Fragment §7) |
| A11 | Karten-Sortierung im Karussell | FIXED → INCOME → BUDGET, alphabetisch innerhalb Typ → `Miete · Netflix · Strom · Steuerrückzahlung · Tanken` |
| A12 | Fragment-Stack rechts | 3 ASSIGNED-März-Fragmente sichtbar, optisch gedimmt (Sprint-5-View `fragments_with_status`-Pattern) |
| A13 | Income-Split-Popup (ICH-Klick oder PARTNER-Klick) | Split-Anzeige **60 % / 40 %** entsprechend Brutto 60k/40k |
| A14 | Cross-Monat April 2026 (`?month=2026-04`) | Steuerrückzahlung NICHT sichtbar (ONCE-März) · Tanken zeigt **200 €** Plan (kein Tap, kein Fragment im April) · Ring zeigt reduzierte Sparrate |
| A15 | Cross-Monat Februar 2026 (`?month=2026-02`) | Tanken zeigt 200 € Plan (kein Tap, kein Fragment) · Steuer-Karte NICHT sichtbar · Sparrate ohne Bonus |
| A16 | Cross-Check via SQL Editor | `SELECT calculate_sparrate_for_month(...)` = `2910.01` ↔ Ring-Wert (gerundet 2.910) konsistent |
| A17 | Sanity-Checks Baseline | `pnpm build`, `tsc --noEmit`, `next lint` alle clean — keine Regressions durch Test-User-Wechsel |
| A18 | Production-Build-Greps (LL-4) | `grep -r "touchstart\|swipe\|longpress" .next/static/chunks/app/ \| wc -l` = 0 |

---

## 5. Smoke-Test-Sequenz (User-Smoke mit Claude-Code-Begleitung)

| # | Schritt | Erwartung | A-Bezug |
|---|---|---|---|
| S1 | Login mit Test-User-Credentials, `/` öffnet Dashboard | Default-Render Mai 2026 (heute), Ring zeigt aktuellen Mai-Wert | — |
| S2 | Header-Chevron links bis März 2026 (`?month=2026-03`) | März-Ansicht rendert, Cross-Fade-Animation | — |
| S3 | Ring-Zentrum visuell | `2.910 €` (gerundet), grün-teal Farbe | A1, A2 |
| S4 | Ring-Arc visuell | Voller Arc + Überfüllt-Indikator gemäß §5 | A3 |
| S5 | Status-Pill rechts vom Monat | `Abgeschlossen` | A4 |
| S6 | Subzeile linke Flanke | `Alles erledigt` | A5 |
| S7 | Karte Miete | 1.200,00 € · Bezahlt · GEMEINSAM-Dot | A6 |
| S8 | Karte Strom | 120,00 € · Offen · GEMEINSAM-Dot | A7 |
| S9 | Karte Netflix | 17,99 € · Bezahlt · ICH-Dot | A8 |
| S10 | Karte Tanken | **180,00 €** · Laufend · `Noch 20 € frei` · ICH-Dot · KEIN Tap-Visual (V1-erwartet) | A9 |
| S11 | Karte Steuerrückzahlung | 800,00 € · Erhalten · ICH-Dot | A10 |
| S12 | Karten-Sortierung im Karussell | Miete → Netflix → Strom → Steuerrückzahlung → Tanken | A11 |
| S13 | Fragment-Stack rechts | 3 gedimmte ASSIGNED-Fragmente | A12 |
| S14 | ICH-Klick im Ring-Bereich (Split-Popup) | Popup öffnet, 60 % / 40 % Anzeige, ICH=60% | A13 |
| S15 | PARTNER-Klick (analog) | Popup öffnet, 60 % / 40 % Anzeige, PARTNER=40% | A13 |
| S16 | Cross-Check: SQL Editor parallel laufen lassen, RPC `calculate_sparrate_for_month` aufrufen | Output `2910.01`, Frontend-Ring `2.910 €` (Cent durch Rundung gekürzt — konsistent) | A16 |
| S17 | Cross-Check: einzel-RPC `calculate_card_amount_for_month` pro Karte | Werte stimmen mit Karten-Anzeige überein | A16 |
| S18 | Navigation zu `?month=2026-04` | Steuer-Karte weg, Tanken zeigt 200 € Plan, Sparrate niedriger | A14 |
| S19 | Navigation zu `?month=2026-02` | Steuer weg, Tanken 200 € Plan, Sparrate ohne Bonus | A15 |
| S20 | Soft-Navigation-Latenz Q1 (aus Sprint 5 Beobachtung) | Erstes Mal Wechsel: spürbar oder im Rahmen? **Notieren für V3-Entscheidung** | — |
| S21 | Production-Build-Grep | Touch/Swipe-Strings in `chunks/app/` = 0 | A18 |
| S22 | `pnpm build`, `tsc --noEmit`, `next lint` Sanity nach Smoke | Alle clean | A17 |

---

## 6. Sprint-Output-Format (`sprints/sprint_06_review.md`)

1. **Header:** Sprint, Branch, Datum, Modell
2. **Pre-Sprint-Architekten-Verifikations-Status** — Bestätigung Stufe 1+2 grün (Referenz auf PM-Brief `pm_brief_pre_sprint_06_vollzug.md`)
3. **Sanity-Check-Output** — Baseline `pnpm build` / `tsc` / `lint`
4. **Smoke-Test-Tabelle S1–S22** mit ✓/✗ + Bemerkung
5. **Cross-Check-Tabelle** — Architekt-SQL-Werte ↔ Frontend-Werte (8 Zeilen pro Tabelle 0.5)
6. **Beobachtete Quirks** — z. B. BUDGET-Tap-Visual-Fehl-Anzeige (V1-erwartet, dokumentieren als „expected gap")
7. **Latenz-Beobachtung Q1 (S20)** — Wert für V3-Entscheidung im Sprint-7-PM-Briefing
8. **Bundle-Grep-Output** (LL-4 Pattern, `chunks/app/`)
9. **Offene Fragen an PM** (z. B. wenn Quirks unklar zu kategorisieren sind)
10. **Vorschläge zur CLAUDE.md-Aktualisierung** — als Vorschlag, nicht Ausführung. Erwartet: Sprint 6 auf 🟢, Modell-Empfehlung §9 korrigiert (Sonnet statt Opus mit Begründung), LL-13 für „Pre-Sprint-Spec-Klärung als PM-Verifikations-Pflicht" (siehe §10 dieses Briefings)

### Commit-Reihenfolge (CLAUDE.md §7 verbindlich)
1. `docs: sprint 6 briefing` — Initial-Commit auf Sprint-Branch (in §3.1 erledigt)
2. **Falls keine Code-Änderungen (erwartet bei grünem Smoke):** direkt zu Schritt 4
3. **Falls Code-Änderungen (nur bei rotem Smoke nach PM-Genehmigung):** `fix:`-Commit + Sanity-Checks clean
4. `docs: sprint 6 review` — Review-Datei committen
5. Push auf Remote
6. Am Sessions-Ende: `git status` clean, keine `??` oder `M`

---

## 7. Anti-Drift-Liste

| # | Regel | Begründung |
|---|---|---|
| A1 | **Keine eigene Sparrate-Berechnung im Frontend.** Sparrate kommt nur per RPC. | CLAUDE.md §7 Regel 1 |
| A2 | **Smoke-only.** Wenn alles grün → keine Code-Änderungen. Sprint endet mit zwei `docs:`-Commits (Briefing + Review). | Pfad A Scope, Verifikations-Sprint-Charakter |
| A3 | **Bei rotem Smoke: eskalieren statt patchen.** Diagnose-Sammlung → PM-Eskalation → PM koordiniert mit Architekt. | LL-11, Verifikations-Sprint = harter Gate |
| A4 | **Karten-Typ in Erwartungen explizit nennen** + §4.3-Sub-Tabelle (4.3.1 FIXED / 4.3.2 INCOME / 4.3.3 BUDGET) referenzieren. | LL-12 |
| A5 | **BUDGET-Tap-Visual fehlt — Tanken zeigt `Laufend`-Status, NICHT `Bezahlt`.** Das ist V1-erwartet, nicht Bug. | Sprint 4 Briefing Zeile 60 + Pre-Sprint-6-Architekt-Befund B1 |
| A6 | **Ring zeigt 2.910 € ohne Cent.** Cent-Verifikation via SQL-Cross-Check, nicht Ring-Visual. | K1.6 Cent-Format-Konvention |
| A7 | **Test-User-UUID `179cd2c1-...` ist temporäre Sprint-6-Variable.** Nicht ins Repo committen, nicht in Code hardcoden. | V1 Single-User-Setup |
| A8 | **Keine BUDGET-Tap-UI-Geste implementieren.** Sprint 7+ Vormerkung. | V1-Scope |
| A9 | **Keine Schema-Doku v2→v3 nebenbei.** Architekten-Parallel-Auftrag, nicht Sprint-6-Scope. | Architekt-Befund B2 |
| A10 | **K1.4 ist erledigt seit Sprint 5** — keine Wieder-Refactor-Versuche, falls in alten Notizen anders vermerkt. | Sprint-5-Review CLAUDE.md §10 |
| A11 | **Keine destruktiven DB-Operationen.** §4.6-Setup ist Sprint-6-Verifikations-State und muss intakt bleiben. | Sprint-Stabilität |

---

## 8. Stolperfallen

| # | Stolperfalle | Vermeidung |
|---|---|---|
| F1 | **Tanken-Erwartung 180 €, NICHT 200 €.** Tanken hat `manually_paid=true` UND Fragmente 180 € → §4.3.3 Zeile „Manueller Tap + Fragmente ≤ Plan = Realität" → 180 €. Wer 200 € (Plan) erwartet, hat die §4.6-Klarstellung übersehen. | A4 + A5 + §0.5 expliziter Erwartungs-Wert |
| F2 | **Cent-Diskrepanz Ring vs. RPC (2.910 € vs. 2910.01)** ist Rundung im `formatEuroRing` (Sprint 5 K1.6), nicht Bug. Cent-Verifikation = Cross-Check via SQL. | A6 |
| F3 | **März < heute=Mai** → Status-Pill `Abgeschlossen`, Cross-Fade-Animation bei Navigation. Bei Bug-Diagnose nicht mit Sprint-3-Status-Logik kollidieren. | LL-5, Sprint-3-Spec |
| F4 | **Forward-Inheritance Income-Timeline** — ICH 60k/3.100 und PARTNER 40k/2.200 sind beide `effective_month = 2026-01-01`, gelten via Forward-Inheritance für März 2026. Falls Render falschen Wert nutzt → Forward-Inheritance-Bug (Sprint 1 LL-Bereich). | §6 Schema, Sprint 1 Patterns |
| F5 | **Karussell-Chevrons:** Bei 5 Karten + Empty-Slot wahrscheinlich kein Scroll nötig → Chevrons hidden gemäß Sprint-5-LL-X1 Pattern. Kein Bug. | Sprint 5 §2.3 |
| F6 | **Soft-Navigation-Latenz Q1 (Sprint 5):** erstes Mal Wechsel ~3 s erwartet, Folge-Navigationen <1 s. Nicht als Bug, sondern beobachten und an PM melden (S20) für V3-Entscheidung in Sprint 7. | Sprint 5 Q1 |
| F7 | **Test-User-Credentials:** Hat der User vorrätig. Falls Login-Probleme → an User eskalieren, nicht selbst Auth-Setup anpassen. | A11 |
| F8 | **Cross-Check-Reihenfolge:** Erst Browser-Smoke abschließen, dann SQL-Cross-Check — sonst Verwirrung über Was-Habe-Ich-Wo-Gesehen. | Smoke-Disziplin |
| F9 | **Ghost-Cards in April/Februar (S18, S19):** Tanken und Strom sind MONTHLY, also auch im April + Februar **aktiv** (nicht Ghost). Steuerrückzahlung ist ONCE-März, also nur in März sichtbar. Auto-Versicherung gibt es im §4.6-Setup nicht. | §7 Frequenz-Tabelle |

---

## 9. Wichtige Hintergrund-Kontexte

### 9.1 Warum Sprint 6 jetzt klein ist
CLAUDE.md §4 markiert Sprint 6 als „harter Gate für Sprints 2–5" mit dem Test-Case 2.910,01 €. Ursprünglich war Opus 4.7 vorgesehen wegen potentieller §4-Konflikte. Im PM-Pre-Sprint-Lesen wurde aber ein Spec-Konsistenz-Problem §4.3.3 ↔ §4.6 entdeckt und vorab geklärt (Tanken im §4.6 ist jetzt explizit getappt, Design-Doku entsprechend gepatcht). Architekt hat per MCP-Cross-Check verifiziert dass die RPC den korrekten Wert liefert. Damit ist Sprint 6 effektiv ein End-to-End-Smoke zur Verifikation, dass das Frontend die korrekten RPC-Werte korrekt darstellt — kein Bug-Hunt-Sprint.

### 9.2 §4.6-Tabelle Quick-Reference
```
ICH-Netto                    = 3.100,00 €  (Forward-Inheritance Januar)
+ Steuerrückzahlung (Realität, ICH 100%) = 800,00 €
= Mein Netto                 = 3.900,00 €

Fixkosten:
- Miete (Realität 1.200 × Split 60%)  = 720,00 €
- Strom (Plan 120 × Split 60%)        =  72,00 €
- Netflix (Plan, ICH 100%)            =  17,99 €
= Σ Fixkosten                         = 809,99 €

Budget:
- Tanken (Tap+Fragmente, Realität 180 €, 100%) = 180,00 €

Sparrate = 3.900,00 − 809,99 − 180,00 = 2.910,01 €

Plan-Sparrate (ohne Realität-Pfade):
= Mein Netto (3.100, kein Steuer-Plan)
  − Σ Fixkosten Plan (1.200×0.6 + 120×0.6 + 17,99 = 809,99)
  − Tanken Plan (200)
= 3.100 − 809,99 − 200 = 2.090,01 €

Hmm — Architekt sagte 2.890,01 €. Differenz: 800 €.

→ Bei Plan-Pfad rechnet Steuerrückzahlung als Plan-INCOME mit (800 €).
  Damit: 3.100 + 800 − 809,99 − 200 = 2.890,01 € ✓
```

**Hinweis:** Plan-Pfad inkludiert geplante INCOME-Karten (Steuerrückzahlung 800 € Plan). Realität-Pfad nutzt das Steuer-Fragment (auch 800 €). Differenz Plan ↔ Ist: nur Tanken (Plan 200 vs. Realität 180) → 20 € → 2.910,01 − 2.890,01 = 20 € ✓

### 9.3 BUDGET-Tap-Visual-Fehlanzeige (V1-erwartet)
Tanken hat `manually_paid=true`. §7 spezifiziert für BUDGET nur 3 Zustände: Laufend / Überschritten / Ghost — **kein Bezahlt-Visual**. Das Frontend zeigt Tanken im März 2026 als `Laufend, 180 €, Noch 20 € frei`. Der Tap-Zustand ist im Read-Pfad korrekt verarbeitet (`calculate_card_amount_for_month` gibt 180 zurück = Realität, da Tap+Fragmente ≤ Plan), aber visuell ist kein Tap-Indikator (z. B. Checkmark) sichtbar. Das ist erwartete V1-Lücke — BUDGET-Tap-UI-Geste ist Sprint-7+ Vormerkung.

### 9.4 Modell-Empfehlung-Begründung
CLAUDE.md §9 nennt Opus 4.7 für Sprint 6. Diese Empfehlung galt unter Annahme offener §4-Konflikte. Da diese vorab geklärt sind (Pre-Sprint-Phase) und der Sprint reine Verifikation ist, ist Sonnet 4.6 ausreichend. Eskalations-Trigger: rotes Smoke-Befund mit unklarer Frontend↔RPC-Diskrepanz → Opus 4.7 (analog Sprint-4-K2-Pattern).

---

## 10. Lesson Learned für CLAUDE.md (Vorschlag im Sprint-Review)

**LL-13 (Vorschlag):** *Pre-Sprint-PM-Spec-Verifikation bei Test-Case-Sprints.* Wenn ein Sprint einen konkreten Test-Case verifiziert (wie §4.6 → 2.910,01 €), muss der PM in der Pre-Sprint-Phase die zugrundeliegende Spec auf Konsistenz mit allen referenzierten Sub-Spezifikationen prüfen (im Sprint-6-Fall: §4.6 vs. §4.3.3). Spec-Lapsus müssen vor dem Architekten-Auftrag mit User/Design-Direktor geklärt werden, nicht währenddessen. Damit vermeidet man Reset-Risiken und Schleifen-Klärung mitten im Sprint.

→ Sprint-6-Erfahrung: PM hat den Spec-Konflikt §4.6 (Tanken implizit getappt?) durch Detail-Lesen entdeckt und vorab geklärt. Architekten-Stufe-0-Schritt wurde damit obsolet, Sprint blieb klein.

---

## 11. PM-Übergabe-Notiz

Sprint 6 ist primär **Verifikation, kein Feature-Sprint**. Erwarteter Ablauf:

1. Branch + Briefing committen (3.1)
2. Login + Browser-Smoke gegen März 2026 (3.2)
3. SQL-Cross-Check (3.3)
4. Review schreiben (3.5)
5. PM reviewt → Approval

**Bei grünem Smoke:** zwei `docs:`-Commits (Briefing + Review), null Code, Sprint approved.

**Bei rotem Smoke:** Diagnose-Sammlung → PM-Eskalation → PM koordiniert mit Architekt. **KEIN Eigen-Patch.** Sprint blockiert bis PM-Genehmigung. (LL-11)

**Latenz-Beobachtung S20** ist sprint-übergreifend wichtig: Wenn Q1 spürbar bleibt, entscheidet PM in Sprint-7-Vorbereitung über V3-Bulk-RPC-Auftrag.

Viel Erfolg.

---

*Sprint 6 Briefing | Antigravity Finance 1.0 | 19. Mai 2026*
