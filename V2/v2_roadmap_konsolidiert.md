# V2-Roadmap — Konsolidierte Themen-Übersicht

> **Vom:** PM-Chat Zwischenphase (Opus 4.7)
> **An:** V2-PM-Chat
> **Datum:** 01. Juni 2026
> **Anlass:** Master-Roadmap für V2, vollständig konsolidiert aus V1→V2-Handover, Schema-Doku v3.1, Sprint-10-Artefakten, Repo-Cleanup-Befunden und App-Nutzungs-Erkenntnissen des Users.
> **Status:** Festgeschrieben. Diese Datei ist die Quelle für die Sprint-Priorisierung im V2-PM-Chat.

---

## 0. Übersicht

Die Roadmap umfasst **54 Themen** in 14 Kategorien sowie 4 Initial-Aufgaben, die vor dem ersten Feature-Sprint zu erledigen sind. Die Bugs aus der V1-Nutzung (Kategorie N) werden gemäß User-Entscheidung **nicht als separater V1.1-Hotfix** geführt, sondern vollständig in den V2-Sprint-Backlog integriert.

Klassifikations-Verteilung:

| Klasse | Anzahl | Bedeutung |
|---|---|---|
| Feature | 41 | Neue Funktionalität oder Erweiterung |
| Bug | 5 | V1-Defekt, in V2 zu beheben |
| Strategie | 1 | Entwicklungs-Vorgehen |
| Diskussion | 7 | Spec offen, Rücksprache erforderlich |

Davon erfordern **acht Punkte eine Rücksprache mit dem Design-Direktor** vor Spec-Festschreibung (Abschnitt 17). Mehrere Punkte stehen in Konsolidierungs- oder Überschreibungs-Beziehungen zueinander (Abschnitt 18).

---

## 1. Initial-Aufgaben vor erstem Feature-Sprint

| # | Punkt | Quelle |
|---|---|---|
| Init-1 | Test-Daten-Strategie etablieren (Empfehlung Option C: separates Supabase-Test-Projekt) | Handover §3.1 |
| Init-2 | Neuen deterministischen Verifikations-Ankerwert in Test-DB definieren (analog `§4.6 = 2910.01` aus V1) | Handover §10 Regel 5 |
| Init-3 | Sprint-Naming-Konvention `sprint/v2-NN-<feature>` einführen | Handover §3.2 |
| Init-4 | CLAUDE.md §4 um Sprint-Protokoll-Tabelle V2 erweitern, mit V1.x-Hinweis-Spalte | Handover §3.3 |

---

## 2. M0 — Strategie / Entwicklungs-Setup

| # | Punkt | Klassifikation | Bemerkung |
|---|---|---|---|
| M0 | Automatisierte E2E-Tests mit Playwright als Ersatz für manuelle Smoke-Test-Tabellen | Strategie | Ersetzt den ursprünglich angedachten Claude-Agent-Team-Ansatz. Pro Sprint werden Akzeptanzkriterien zusätzlich als Playwright-Skripte hinterlegt. Persona-Setup (PM, Architekt, Design-Direktor, Claude-Code-Implementierer) bleibt unverändert. |

---

## 3. Kategorie A — Karten-System

| # | Punkt | Klassifikation | Schema-Eingriff | Bemerkung |
|---|---|---|---|---|
| A1 | Karten-spezifische Badge-Farben (`cards.color`-Spalte oder deterministischer Hash-zu-Farb-Mapping) | Feature | Ja, bei Color-Spalte | Sprint 8 OQ1 |
| A2 | UI-Pfad „Versteckte Karten verwalten und wieder einblenden" in Settings oder Overlay | Feature | Nein | **Möglicherweise obsolet**, abhängig von M2-Entscheidung |
| A3 | Bestätigungs-Dialog vor Verbergen-Klick | Feature | Nein | **Möglicherweise obsolet**, abhängig von M2-Entscheidung |
| A4 | Soft-Delete-Pattern Trash-Variante mit `CARD_HIDE`-Enum und 60s-Cleanup | Feature | Ja, ENUM-Erweiterung | **Erweitert durch M1** (vollständige Löschbarkeit) |

---

## 4. Kategorie B — Sparraten-Treppe (UX-Polish)

| # | Punkt | Klassifikation | Bemerkung |
|---|---|---|---|
| B1 | Multi-Year-Rolling-Window (12 Monate gleitend statt Kalenderjahr) | Feature | **Im Welle-Kontext (M3) neu zu definieren** |
| B2 | Abweichungs-Treiber-Heuristik im Backend (Top-3 Treiber pro Monat) | Feature | Bleibt im neuen Welle-Kontext relevant |
| B3 | Rot-Spec bei negativer Kumulation (§9 nennt Verhalten, keine Farb-Spec in V1) | Feature | Bleibt im neuen Welle-Kontext relevant |
| B4 | Monatsgenauer `%-monatlich`-Nenner statt jüngster Income-Slot | Feature | Bleibt im neuen Welle-Kontext relevant |
| B5 | Performance-Optimierung Bulk-RPC `get_yearly_sparrate_curves(p_user_id, p_year)` | Feature | Bleibt, ähnliche Datenmenge in M3 |
| B6 | UX-Entscheidung Vorjahres-Linie bei datenlosem Vorjahr (0-€-Linie + Label vs. Linie entfällt) | Diskussion | **Möglicherweise obsolet**, falls M3 keine Vorjahres-Linie führt. Design-Direktor-Rücksprache |

---

## 5. Kategorie C — Transfer-System (UX-Polish)

| # | Punkt | Klassifikation | Bemerkung |
|---|---|---|---|
| C1 | `INTERNAL_TRANSFER`-Fragmente aus Karten-Stack ausblenden (Reiter oder Toggle) | Feature | Sprint 9 V8'' |
| C2 | Backfill-Toast-UX-Verbesserung bei hohem Migrations-Counter | Feature | Sprint 9 V9'' |

---

## 6. Kategorie D — Settings und Onboarding-Erweiterungen

| # | Punkt | Klassifikation | Schema-Eingriff |
|---|---|---|---|
| D1 | UI zur Verwaltung von `own_ibans` | Feature | Nein |
| D2 | Steuerklasse-Wechsel via UI | Feature | Nein |
| D3 | Settings-Bereich allgemein, Routing und Layout | Feature | Nein |

---

## 7. Kategorie E — Income und Fairness

| # | Punkt | Klassifikation | Schema-Eingriff |
|---|---|---|---|
| E1 | Rückwirkende Gehaltskorrektur mit Fairness-Delta zwischen ICH und PARTNER | Feature | Ja, neue Tabelle `fairness_deltas` |
| E2 | Periodenabgrenzung (z. B. Dezember-Gehalt am 30.11. bezahlt = Januar-Periode) | Feature | Nein |

---

## 8. Kategorie F — Distiller und Import-Erweiterungen

| # | Punkt | Klassifikation | Schema-Eingriff | Bemerkung |
|---|---|---|---|---|
| F1 | Konfidenz-Verbesserung (Embeddings, Levenshtein, ML-Klassifikator) | Feature | Evtl., Score-Spalten | **Konsolidiert unter M6** |
| F2 | Kategorie-Vorhersage pro User (eigenes Modell) | Feature | Ja | **Konsolidiert unter M6** |
| F3 | Fragment-Clustering (manuelle Zuordnung verbessern) | Feature | Nein | **Konsolidiert unter M6** |
| F4 | IBAN-Format-Validierung in der DB (CHECK-Constraint via Regex) | Feature | Ja, Constraint | |
| F5 | Paired-Fragment-Verlinkung (`paired_fragment_id`) für Multi-Account-Reconciliation | Feature | Ja | **Konkretisiert durch M9** |
| F6 | Cross-Currency-Cortal-Importe (V1 verwirft mit `error-corrupt`) | Feature | Ja | Sprint 9 OQ2 |
| F7 | PDF/Excel-Import als Application-Layer-Adapter | Feature | Nein | |

---

## 9. Kategorie G — Lifecycle und Backend-Infrastruktur

| # | Punkt | Klassifikation | Quelle |
|---|---|---|---|
| G1 | Cleanup-Edge-Function für `deleted_entities` (Trash nach 60s räumen) | Feature | Schema-Doku §10.1 |
| G2 | Manueller Monatsabschluss-UI (setzt `card_monthly_states.closed_at`) | Feature | Schema-Doku §9 |

---

## 10. Kategorie H — Tooling

| # | Punkt | Klassifikation | Quelle |
|---|---|---|---|
| H1 | Vercel Coding Agent Plugin evaluieren | Feature | Go-Live-Phase 3 |

---

## 11. Kategorie I — Domain und Hosting

| # | Punkt | Klassifikation | Quelle |
|---|---|---|---|
| I1 | Eigene Domain für die App (V1 nutzt Vercel-Subdomain) | Feature | Handover §2.1 |

---

## 12. Kategorie J — Doku- und Migrations-Hausaufgaben

| # | Punkt | Klassifikation | Quelle |
|---|---|---|---|
| J1 | Sprint 5 bis 8-Migrationen in versionierte Datei `supabase/migrations/0002_…` zusammenfassen | Feature | Schema-Doku §10.2 |
| J2 | RPC-Wrapper im Frontend regenerieren via `supabase gen types typescript` | Feature | Schema-Doku §10.3 |

---

## 13. Kategorie K — Aus Zwischenphase

| # | Punkt | Klassifikation | Bemerkung |
|---|---|---|---|
| K1 | Dev-Panel-Sichtbarkeit prüfen (`src/app/dashboard-dev-panel.tsx` im Production-Build deaktiviert?) | Feature | Repo-Cleanup-Befund |
| K2 | Eventuelle Git-History-Bereinigung der `supabase/.temp/linked-project.json` und ggf. Schlüssel-Rotation | Feature | Repo-Cleanup-Befund |

---

## 14. Kategorie L — Dauerhaft Out of Scope

| # | Punkt | Begründung |
|---|---|---|
| L1 | Partner-only-Karten | UI-Lärm, keine Sparrate-Relevanz |

---

## 15. Kategorie M — Aus App-Nutzung (neue Features und Diskussionen)

| # | Punkt | Klassifikation | Schema-Eingriff | Bemerkung |
|---|---|---|---|---|
| M1 | Vollständige Karten-Löschung mit Konsequenz-Diskussion für verknüpfte Fragmente | Diskussion | Ja, möglicherweise | **Erweitert A4**. Frage: Was passiert mit Fragmenten? Soft-Detach, Cascade, Verbot bei vorhandenen Fragmenten? Design-Direktor- und Architekt-Rücksprache |
| M2 | Verbergen-Funktion grundsätzlich überdenken im Licht von M1 | Diskussion | Nein | **Beeinflusst A2 und A3**. Entweder Verbergen entfällt zugunsten Löschen, oder bewusste Doppel-Geste mit klarer Sprache. Design-Direktor-Rücksprache |
| M3 | Welle (monatliche IST + Plan) hinter dem Ring auf gleicher Höhe; Klick öffnet Treppen-Popup mit kumulierter Sparrate | Diskussion | Nein | **Ersetzt V1-Treppen-Layout** (siehe Image 1 der User-Erkenntnisse). Treiber-Hinweise-Positionierung offen. Design-Direktor-Rücksprache |
| M4 | Globaler Karten-Opacity-Schieber in der Dev-Umgebung (NODE_ENV-gated, nicht in Production) | Feature | Nein | Konsistent mit Sprint-10-Regel „Tooling ≠ Produkt", analog Sprint-2-Pattern für Ring-Dev-Strings |
| M5 | Karten-Anordnung fix: Budget → Fixkosten → Einnahmen | Feature | Nein | Heutige Reihenfolge vor Spec verifizieren |
| M6 | Verbesserte automatische Fragment-zu-Karten-Zuordnung | Feature | Evtl. | **Konsolidiert F1, F2, F3** als gemeinsame Klammer |
| M7 | „Verlauf"-Submenu im Karten-Kontextmenü mit Jan-Dez-Liniendiagramm IST vs Plan pro Karte | Feature | Nein | Pro Karte ein Detail-Popup mit Liniendiagramm |
| M8 | Chat-Window für Claude-Rückfragen zu allen App-Daten | Feature | Nein, API-Layer | Großes Feature, eigene Sprint-Phase. Anthropic-API-Integration. Sicherheits- und Datenschutz-Konzept erforderlich (welche Daten werden an die API gesendet, RLS-Beachtung) |
| M9 | Kreditkarten-Import + Multi-Account-Reconciliation für Überweisungsketten (Cortal → Giro → Kreditkarte = 1 Ausgabe) | Feature | Ja | **Konkretisiert F5** (`paired_fragment_id`). User stellt drei Excel-Files für Mai 2026 zur Validierung bereit |
| M10 | UX-Entscheidung Darstellung negativer kumulierter Plan-Sparrate (Ring, Welle, Treppen-Popup) | Diskussion | Nein | Design-Direktor-Rücksprache |
| M11 | Hell-/Dunkel-Modus-Umschaltung | Feature | Nein | Niedrige Priorität. CSS-Variablen-Layer-Erweiterung auf Basis von `src/styles/tokens.css` |

---

## 16. Kategorie N — V1-Bugs aus App-Nutzung

| # | Punkt | Klassifikation | Visueller Beleg |
|---|---|---|---|
| N1 | Rohmasse zeigt Fragmente aus anderen Monaten — Monatsfilter im Fragment-Loader fehlt oder ist defekt | Bug | — |
| N2 | Karten-Größen-Inkonsistenz: „Deutschlandticket Mama …"-Karte deutlich gestreckt | Bug | Image 2 |
| N3 | Text-Overflow auf Karte „Reisekrankenversicherung — DKV" — Text läuft über die Karten-Begrenzung hinaus | Bug | Image 3 |
| N4 | Ring-Anzeige `+− 358,1 %`: Vorzeichen-Anzeige-Bug. Berechnung selbst plausibel (Mai-Plan-Nenner ≈ 73,80 €). Zusätzlich: Cap-Strategie bei kleinem Plan-Nenner überdenken | Bug | Image 4 |
| N5 | Farbtöne zwischen verknüpften Fragmenten und Transfers in der Rohmasse vereinheitlichen | Bug | — |

---

## 17. Punkte mit Design-Direktor-Rücksprache vor Spec-Festschreibung

Folgende acht Punkte erfordern vor der Sprint-Briefing-Erstellung eine Klärung mit dem Design-Direktor. Sie sind in der V2-Roadmap als „Diskussion" klassifiziert.

| # | Klärungsbedarf |
|---|---|
| B6 | Vorjahres-Linie bei datenlosem Vorjahr — Fortbestand und Darstellung im Welle-Kontext |
| M1 | Konsequenzen vollständiger Karten-Löschung für verknüpfte Fragmente |
| M2 | Verbergen-Funktion: ersetzen durch Löschen oder als eigene Geste behalten |
| M3 | Welle-Konzeption: Positionierung hinter Ring, monatliche IST + Plan, Klick-zu-Treppen-Popup, Position der Treiber-Hinweise |
| M5 | Karten-Anordnung: Verifikation heutiger Stand und Spec für gewünschte Reihenfolge |
| M10 | Darstellung negativer kumulierter Plan-Sparrate in Ring, Welle, Treppen-Popup |
| M11 | Hell-/Dunkel-Modus: visuelle Spec und Token-Mapping |
| N4 | Ring-Anzeige bei kleinem Plan-Nenner: Cap-Strategie, Vorzeichen-Logik, alternative Darstellung |

---

## 18. Konsolidierungs- und Überschreibungs-Hinweise

Damit Doppelarbeit im V2-Sprint-Backlog vermieden wird, sind die folgenden Beziehungen zwischen Themen beim Sprint-Schnitt zu beachten.

**M3 ersetzt das V1-Treppen-Layout.** Folgende B-Punkte werden dadurch transformiert: B1 wird im Welle-Kontext neu definiert; B5 bleibt relevant (ähnliche Datenmenge); B6 ist möglicherweise obsolet, falls die Welle keine Vorjahres-Linie führt. B2, B3 und B4 bleiben im neuen Kontext anwendbar.

**M6 konsolidiert F1, F2, F3.** Alle drei Punkte adressieren die Verbesserung der automatischen Fragment-zu-Karten-Zuordnung und können als gemeinsamer Themen-Block unter M6 geführt werden. F4 (IBAN-Validierung), F5 (`paired_fragment_id`), F6 (Cross-Currency) und F7 (PDF/Excel) bleiben eigenständig.

**M1 erweitert A4.** Die Trash-Variante mit `CARD_HIDE`-Enum aus A4 wird durch das vollständig löschbare Karten-Modell aus M1 erweitert. A4 allein ist nicht mehr ausreichend; M1 ist die übergreifende Spec, A4 ein Implementierungs-Detail.

**M9 konkretisiert F5.** Die `paired_fragment_id`-Verlinkung aus F5 ist die technische Voraussetzung für die Multi-Account-Reconciliation aus M9. Beide Themen werden vermutlich gemeinsam in einem Sprint umgesetzt.

**M2-Entscheidung beeinflusst A2 und A3.** Wenn die Verbergen-Geste zugunsten von Löschen entfällt, werden A2 (Versteckte-Karten-Verwaltungs-UI) und A3 (Bestätigungs-Dialog vor Verbergen) obsolet. Falls Verbergen bleibt, sind A2 und A3 weiterhin relevant.

---

## 19. Statistik nach Kategorie

| Kategorie | Themen | Klassifikations-Mix |
|---|---|---|
| Initial | 4 | 4 Setup-Aufgaben |
| M0 (Strategie) | 1 | 1 Strategie |
| A — Karten-System | 4 | 4 Features |
| B — Sparraten-Treppe | 6 | 5 Features, 1 Diskussion |
| C — Transfer-System | 2 | 2 Features |
| D — Settings und Onboarding | 3 | 3 Features |
| E — Income und Fairness | 2 | 2 Features |
| F — Distiller und Import | 7 | 7 Features |
| G — Lifecycle und Backend | 2 | 2 Features |
| H — Tooling | 1 | 1 Feature |
| I — Domain und Hosting | 1 | 1 Feature |
| J — Doku und Migrations | 2 | 2 Features |
| K — Aus Zwischenphase | 2 | 2 Features |
| L — Out of Scope | 1 | — |
| M — Aus App-Nutzung | 11 | 7 Features, 4 Diskussionen |
| N — V1-Bugs | 5 | 5 Bugs |
| **Summe Themen** | **54** | zuzüglich 4 Initial-Aufgaben und 1 Out-of-Scope-Punkt |

---

## 20. Hinweise zum weiteren Vorgehen für den V2-PM

Diese Roadmap ist die konsolidierte Quelle, aus der der V2-PM-Chat die Sprint-Priorisierung ableitet. Die Priorisierung selbst ist nicht Teil dieser Datei und wird gemeinsam mit dem User im V2-PM-Chat erarbeitet.

Empfohlene erste Schritte im V2-PM-Chat:

1. **Phase-0-Reading-Order** aus dem V1→V2-Handover §7 abarbeiten (CLAUDE.md, Schema-Doku v3.1, Design-Doku v3.0, Sprint-Reviews 8 bis 10, Stilreferenz-Handover).
2. **Initial-Aufgaben Init-1 bis Init-4** als Pre-Sprint-1-Block erledigen.
3. **Design-Direktor-Runde** für die acht in Abschnitt 17 gelisteten Diskussions-Punkte ansetzen, bevor erste Briefings für die betroffenen Themen erstellt werden.
4. **M0 (E2E-Tests mit Playwright)** als querliegendes Strategie-Thema in jeden Sprint einplanen, beginnend mit Sprint 1.
5. Anschließend thematische Sprint-Bündelung anhand der Konsolidierungs-Hinweise aus Abschnitt 18.

---

*V2-Roadmap konsolidiert · Antigravity Finance · Zwischenphase V1 → V2 · 01. Juni 2026*
