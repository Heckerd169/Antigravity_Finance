# V2-Roadmap — Konsolidierte Themen-Übersicht

> **Vom:** PM-Chat Zwischenphase (Opus 4.7)
> **An:** V2-PM-Chat
> **Datum:** 01. Juni 2026 · **Status-Stand nachgetragen:** 25. Juli 2026
> **Anlass:** Master-Roadmap für V2, vollständig konsolidiert aus V1→V2-Handover, Schema-Doku v3.1, Sprint-10-Artefakten, Repo-Cleanup-Befunden und App-Nutzungs-Erkenntnissen des Users.
> **Status:** Festgeschrieben. Diese Datei ist die Quelle für die Sprint-Priorisierung im V2-PM-Chat.
> **Pflege (ab 25.07.2026):** Die Spalte **Stand** wird am Ende jedes Sprints mitgezogen — zusammen mit Schema-Doku und CLAUDE.md (CLAUDE.md §7 „Sprint-Output-Reihenfolge"). Ohne diese Routine veraltet die Datei innerhalb von zwei Sprints wieder.

**Legende der Spalte „Stand":**

| Zeichen | Bedeutung |
|---|---|
| ✅ | erledigt (Sprint in Klammern) |
| 🟡 | teilweise erledigt — Restumfang in der Bemerkung |
| ⬜ | offen |
| ⊘ | hinfällig geworden (Begründung in der Bemerkung) |
| 🔎 | Status unsicher — vor Sprint-Schnitt verifizieren |

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

## 0.1 Stand nach Sprint v2-06 (25. Juli 2026)

**Abgeschlossen sind:** alle 4 Initial-Aufgaben · M0 (Playwright) · alle 5 V1-Bugs (N1–N5) ·
die Welle inklusive Popup (M3, B3, B6, M10) · die Abweichungs-Treiber (B2) ·
der Karten-Lebenszyklus (M1, A4; M2 backend-seitig) · Mehrkonten Stufe 1 (Teil von M9).

**Zahlen:** die Themen-Tabellen dieser Datei führen zusammen **54 Zeilen**
(die 4 Initial-Aufgaben, M0 und den Out-of-Scope-Punkt L1 eingeschlossen).
Davon **19 erledigt ✅**, **4 teilweise 🟡**, **4 hinfällig ⊘**, **27 offen ⬜**.

> *Zähl-Hinweis:* Der Kopftext von Abschnitt 0 spricht von „54 Themen **sowie**
> 4 Initial-Aufgaben", die Statistik in Abschnitt 19 summiert die Initial-Aufgaben
> aber **in** die 54 hinein. Diese Unschärfe stammt aus der Urfassung vom
> 01.06.2026 und wurde nicht rückwirkend geglättet, um die Themen-IDs stabil zu
> halten. Maßgeblich ist die Zeilen-Zählung oben.

Der Abgleich erfolgte gegen die Sprint-Tabelle in CLAUDE.md §4 sowie die
Sprint-Reviews v2-01 bis v2-06.

### Vorgeschlagene Reihenfolge (Vorschlag, kein Beschluss)

Priorisieren bleibt User-Entscheidung — die Reihenfolge ändert sich erfahrungsgemäß
mit dem, was beim Benutzen auffällt. Stand heute lautet die Empfehlung:

| Rang | Paket | Themen | Begründung |
|---|---|---|---|
| 1 | **DD-Feinschliff** | M2 (Rest), B2-Feinschliff | Klein, blockiert aber die Endabnahme zweier fertiger Sprints. Wartet auf den Design-Direktor. |
| 2 | **M6 — bessere Auto-Zuordnung** | M6 (= F1+F2+F3) | Der aktuelle Engpass ist die Kuratierung von Hand. Jede Verbesserung hier senkt den Aufwand für **alle** nachgelagerten Themen (Treiber-Qualität, Sparraten-Genauigkeit, 2025). |
| 3 | **Kleinkram-Sammelsprint** | M5, A1, C1, C2, M4 | Viele kleine Ärgernisse, zusammen ein spürbarer Unterschied. Kein Schema-Eingriff. |
| 4 | **Einstellungen** | D1, D2, D3 | Erster echter Settings-Bereich; D1 (eigene IBANs) ist heute nur per SQL pflegbar. |
| 5 | **M9 Stufe 2** | M9 (Rest), F5 | Erst sinnvoll, wenn ein Monat sauber kuratiert ist — sonst fehlt die Vergleichsbasis für die Verkettung. Schema-Eingriff. |
| 6 | **M7 — Kartenverlauf** | M7 | Eigenständiges UI-Feature, gut isolierbar. |
| 7 | **Welle-Rest** | B1, B4, B5 | B5 nur bei spürbarer Latenz — nicht auf Verdacht optimieren. |
| 8 | **Import-Erweiterungen** | F4, F6, F7 | Bedarfsgetrieben; erst wenn eine Quelle real gebraucht wird. |
| 9 | **Lifecycle** | G1 (Rest), G2 | G1 ist für Karten bereits gelöst, offen sind die übrigen Entitäten. |
| 10 | **Große eigene Phasen** | E1/E2, M8, M11 | Bewusst nach hinten: alle drei werden besser, wenn die Datenbasis sauber ist. M8 braucht zusätzlich ein Datenschutz-Konzept. |
| — | **Hausaufgaben (nebenher)** | J1, I1, H1 | Ohne eigenen Sprint, an passende Sprints anhängen. |

---

## 1. Initial-Aufgaben vor erstem Feature-Sprint

| # | Punkt | Quelle | Stand |
|---|---|---|---|
| Init-1 | Test-Daten-Strategie etablieren (Empfehlung Option C: separates Supabase-Test-Projekt) | Handover §3.1 | ✅ (v2-05) Übungs-DB `antigravity-finance-test`, Runbook in `supabase/test_projekt/` |
| Init-2 | Neuen deterministischen Verifikations-Ankerwert in Test-DB definieren (analog `§4.6 = 2910.01` aus V1) | Handover §10 Regel 5 | ✅ (v2-05) Anker `2.200,00` |
| Init-3 | Sprint-Naming-Konvention `sprint/v2-NN-<feature>` einführen | Handover §3.2 | ✅ |
| Init-4 | CLAUDE.md §4 um Sprint-Protokoll-Tabelle V2 erweitern, mit V1.x-Hinweis-Spalte | Handover §3.3 | ✅ |

---

## 2. M0 — Strategie / Entwicklungs-Setup

| # | Punkt | Klassifikation | Stand | Bemerkung |
|---|---|---|---|---|
| M0 | Automatisierte E2E-Tests mit Playwright als Ersatz für manuelle Smoke-Test-Tabellen | Strategie | ✅ (v2-01 / 23.07.) | Render-Smoke + §9-Pixel-Checks (`pnpm test:visual`) + `smoke-agent`. Daten-mutierende E2E weiterhin nur gegen die Übungs-DB; der menschliche Prod-Smoke bleibt Gate. |

---

## 3. Kategorie A — Karten-System

| # | Punkt | Klassifikation | Schema-Eingriff | Stand | Bemerkung |
|---|---|---|---|---|---|
| A1 | Karten-spezifische Badge-Farben (`cards.color`-Spalte oder deterministischer Hash-zu-Farb-Mapping) | Feature | Ja, bei Color-Spalte | ⬜ | Sprint 8 OQ1, seither als V2-C/V3'' verschoben. Kandidat für den Kleinkram-Sprint. |
| A2 | UI-Pfad „Versteckte Karten verwalten und wieder einblenden" in Settings oder Overlay | Feature | Nein | ⊘ | Hinfällig: Verbergen wurde in v2-05 ersatzlos gestrichen (Beschluss E2). |
| A3 | Bestätigungs-Dialog vor Verbergen-Klick | Feature | Nein | ⊘ | Hinfällig, gleiche Begründung wie A2. Beim Löschen übernehmen Lösch-Gate + 5-s-Undo diese Rolle. |
| A4 | Soft-Delete-Pattern Trash-Variante mit `CARD_HIDE`-Enum und 60s-Cleanup | Feature | Ja, ENUM-Erweiterung | ✅ (v2-05) | Umgesetzt in der erweiterten M1-Form (Papierkorb über `deleted_entities`, 60-s-Retention, opportunistischer Vollzug). `CARD_HIDE` wurde nicht gebraucht. |

---

## 4. Kategorie B — Sparraten-Treppe (UX-Polish)

| # | Punkt | Klassifikation | Stand | Bemerkung |
|---|---|---|---|---|
| B1 | Multi-Year-Rolling-Window (12 Monate gleitend statt Kalenderjahr) | Feature | ⬜ | Im Welle-Kontext (M3) neu zu definieren — die Welle führt heute das Kalenderjahr. |
| B2 | Abweichungs-Treiber-Heuristik im Backend (Top-3 Treiber pro Monat) | Feature | ✅ (v2-06) | `get_year_deviation_drivers`. Label-Format und Leer-Wortlaut sind noch DD-Feinschliff; E4 (Rohmasse-Pseudo-Treiber) bewusst offen. |
| B3 | Rot-Spec bei negativer Kumulation (§9 nennt Verhalten, keine Farb-Spec in V1) | Feature | ✅ (v2-03) | Popup-Treppe abschnittsweise rot, Held folgt dem Endwert-Vorzeichen. |
| B4 | Monatsgenauer `%-monatlich`-Nenner statt jüngster Income-Slot | Feature | ⬜ | |
| B5 | Performance-Optimierung Bulk-RPC `get_yearly_sparrate_curves(p_user_id, p_year)` | Feature | ⬜ | Nur bei spürbarer Latenz umsetzen. Der v2-06-Jahres-Call ist der erste Baustein in diese Richtung. |
| B6 | UX-Entscheidung Vorjahres-Linie bei datenlosem Vorjahr (0-€-Linie + Label vs. Linie entfällt) | Diskussion | ✅ (v2-02) | Entschieden: bei datenlosem Vorjahr entfällt die Linie (0 € wäre irreführend). |

---

## 5. Kategorie C — Transfer-System (UX-Polish)

| # | Punkt | Klassifikation | Stand | Bemerkung |
|---|---|---|---|---|
| C1 | `INTERNAL_TRANSFER`-Fragmente aus Karten-Stack ausblenden (Reiter oder Toggle) | Feature | ⬜ | Sprint 9 V8''. Heute Variante (b): gedimmt + Badge. Mit 363 Transfer-Fragmenten im Bestand zunehmend relevant. |
| C2 | Backfill-Toast-UX-Verbesserung bei hohem Migrations-Counter | Feature | ⬜ | Sprint 9 V9''. |

---

## 6. Kategorie D — Settings und Onboarding-Erweiterungen

| # | Punkt | Klassifikation | Schema-Eingriff | Stand | Bemerkung |
|---|---|---|---|---|---|
| D1 | UI zur Verwaltung von `own_ibans` | Feature | Nein | ⬜ | Heute nur per SQL pflegbar — bei jedem neuen Konto ein manueller Eingriff. |
| D2 | Steuerklasse-Wechsel via UI | Feature | Nein | ⬜ | |
| D3 | Settings-Bereich allgemein, Routing und Layout | Feature | Nein | ⬜ | Klammer für D1 + D2. |

---

## 7. Kategorie E — Income und Fairness

| # | Punkt | Klassifikation | Schema-Eingriff | Stand |
|---|---|---|---|---|
| E1 | Rückwirkende Gehaltskorrektur mit Fairness-Delta zwischen ICH und PARTNER | Feature | Ja, neue Tabelle `fairness_deltas` | ⬜ |
| E2 | Periodenabgrenzung (z. B. Dezember-Gehalt am 30.11. bezahlt = Januar-Periode) | Feature | Nein | ⬜ |

---

## 8. Kategorie F — Distiller und Import-Erweiterungen

| # | Punkt | Klassifikation | Schema-Eingriff | Stand | Bemerkung |
|---|---|---|---|---|---|
| F1 | Konfidenz-Verbesserung (Embeddings, Levenshtein, ML-Klassifikator) | Feature | Evtl., Score-Spalten | ⬜ | **Konsolidiert unter M6** |
| F2 | Kategorie-Vorhersage pro User (eigenes Modell) | Feature | Ja | ⬜ | **Konsolidiert unter M6** |
| F3 | Fragment-Clustering (manuelle Zuordnung verbessern) | Feature | Nein | ⬜ | **Konsolidiert unter M6** |
| F4 | IBAN-Format-Validierung in der DB (CHECK-Constraint via Regex) | Feature | Ja, Constraint | ⬜ | |
| F5 | Paired-Fragment-Verlinkung (`paired_fragment_id`) für Multi-Account-Reconciliation | Feature | Ja | ⬜ | **Konkretisiert durch M9** — offen in Stufe 2 |
| F6 | Cross-Currency-Cortal-Importe (V1 verwirft mit `error-corrupt`) | Feature | Ja | ⬜ | Sprint 9 OQ2 |
| F7 | PDF/Excel-Import als Application-Layer-Adapter | Feature | Nein | ⬜ | |

---

## 9. Kategorie G — Lifecycle und Backend-Infrastruktur

| # | Punkt | Klassifikation | Quelle | Stand | Bemerkung |
|---|---|---|---|---|---|
| G1 | Cleanup-Edge-Function für `deleted_entities` (Trash nach 60s räumen) | Feature | Schema-Doku §10.1 | 🟡 | Für **Karten** in v2-05 gelöst (`cleanup_expired_card_trash`, opportunistisch vor jeder Lebenszyklus-Aktion). Offen: die übrigen Entitäten (Fragmente, Links) und die Frage, ob eine echte Edge-Function nötig ist oder das opportunistische Muster reicht. |
| G2 | Manueller Monatsabschluss-UI (setzt `card_monthly_states.closed_at`) | Feature | Schema-Doku §9 | ⬜ | |

---

## 10. Kategorie H — Tooling

| # | Punkt | Klassifikation | Quelle | Stand |
|---|---|---|---|---|
| H1 | Vercel Coding Agent Plugin evaluieren | Feature | Go-Live-Phase 3 | ⬜ |

---

## 11. Kategorie I — Domain und Hosting

| # | Punkt | Klassifikation | Quelle | Stand |
|---|---|---|---|---|
| I1 | Eigene Domain für die App (V1 nutzt Vercel-Subdomain) | Feature | Handover §2.1 | ⬜ |

---

## 12. Kategorie J — Doku- und Migrations-Hausaufgaben

| # | Punkt | Klassifikation | Quelle | Stand | Bemerkung |
|---|---|---|---|---|---|
| J1 | Sprint 5 bis 8-Migrationen in versionierte Datei `supabase/migrations/0002_…` zusammenfassen | Feature | Schema-Doku §10.2 | 🟡 | Seit v2-04 werden neue Migrationen als Dateien abgelegt (`20260706_v2_04_…`, `20260725_v2_06_…`). Die Altbestände der Sprints 5–8 liegen weiterhin nur in Supabase. |
| J2 | RPC-Wrapper im Frontend regenerieren via `supabase gen types typescript` | Feature | Schema-Doku §10.3 | ✅ | Feste Routine bei jeder Schema-Änderung, zuletzt v2-06. |

---

## 13. Kategorie K — Aus Zwischenphase

| # | Punkt | Klassifikation | Quelle | Stand | Bemerkung |
|---|---|---|---|---|---|
| K1 | Dev-Panel-Sichtbarkeit prüfen (`src/app/dashboard-dev-panel.tsx` im Production-Build deaktiviert?) | Feature | Repo-Cleanup-Befund | ✅ | Mehrfach per Bundle-Grep verifiziert (Sprints 2, 5, 8): NODE_ENV-Gating greift, das Production-Bundle enthält die Dev-Strings nicht. Die Datei bleibt bewusst im Repo. |
| K2 | Eventuelle Git-History-Bereinigung der `supabase/.temp/linked-project.json` und ggf. Schlüssel-Rotation | Feature | Repo-Cleanup-Befund | ⊘ | Geprüft 25.07.2026: die Datei taucht in **keinem** Commit der History auf (`git log --all -- …` leer). Keine Bereinigung und keine Schlüssel-Rotation nötig. |

---

## 14. Kategorie L — Dauerhaft Out of Scope

| # | Punkt | Begründung | Stand |
|---|---|---|---|
| L1 | Partner-only-Karten | UI-Lärm, keine Sparrate-Relevanz | ⊘ dauerhaft out of scope |

---

## 15. Kategorie M — Aus App-Nutzung (neue Features und Diskussionen)

| # | Punkt | Klassifikation | Schema-Eingriff | Stand | Bemerkung |
|---|---|---|---|---|---|
| M1 | Vollständige Karten-Löschung mit Konsequenz-Diskussion für verknüpfte Fragmente | Diskussion | Ja, möglicherweise | ✅ (v2-05) | Entschieden als Drei-Verben-Modell: Beenden / Löschen mit Gate / Bulk-Detach. Fragmente überleben, `suggested_card_id` → NULL. |
| M2 | Verbergen-Funktion grundsätzlich überdenken im Licht von M1 | Diskussion | Nein | 🟡 (v2-05) | Backend entschieden und umgesetzt: Verbergen ersatzlos gestrichen. **Offen:** DD-Feinschliff der Verben-Sprache und Gesten (Interim-UI steht). |
| M3 | Welle (monatliche IST + Plan) hinter dem Ring auf gleicher Höhe; Klick öffnet Treppen-Popup mit kumulierter Sparrate | Diskussion | Nein | ✅ (v2-02) | Ersetzt das V1-Treppen-Layout; `components/treppe/` entfernt. |
| M4 | Globaler Karten-Opacity-Schieber in der Dev-Umgebung (NODE_ENV-gated, nicht in Production) | Feature | Nein | ⬜ | |
| M5 | Karten-Anordnung fix: Budget → Fixkosten → Einnahmen | Feature | Nein | ⬜ 🔎 | Heutige Sortierung ist FIXED_COST → INCOME → BUDGET (seit Sprint 4). Vor dem Sprint-Schnitt bestätigen, ob die gewünschte Reihenfolge weiterhin Budget → Fixkosten → Einnahmen lautet. |
| M6 | Verbesserte automatische Fragment-zu-Karten-Zuordnung | Feature | Evtl. | ⬜ | **Konsolidiert F1, F2, F3.** Empfehlung: nächster echter Feature-Sprint — senkt den Kuratierungs-Aufwand, an dem alles andere hängt. |
| M7 | „Verlauf"-Submenu im Karten-Kontextmenü mit Jan-Dez-Liniendiagramm IST vs Plan pro Karte | Feature | Nein | ⬜ | Datenseitig bereits abgedeckt: `get_year_deviation_drivers` liefert je Karte `ist`/`plan` pro Monat. |
| M8 | Chat-Window für Claude-Rückfragen zu allen App-Daten | Feature | Nein, API-Layer | ⬜ | Großes Feature, eigene Sprint-Phase. Sicherheits- und Datenschutz-Konzept erforderlich. |
| M9 | Kreditkarten-Import + Multi-Account-Reconciliation für Überweisungsketten (Cortal → Giro → Kreditkarte = 1 Ausgabe) | Feature | Ja | 🟡 (v2-04) | **Stufe 1 erledigt:** DKB-Visa-Parser, `ASSET_REALLOCATION`, Transfer-Erkennung. **Stufe 2 offen:** echte Verkettung über `paired_fragment_id` (= F5). |
| M10 | UX-Entscheidung Darstellung negativer kumulierter Plan-Sparrate (Ring, Welle, Treppen-Popup) | Diskussion | Nein | ✅ (v2-02 / v2-03) | Rot-Regime in Welle und Popup, Ring-Degeneration bei kleinem Plan-Nenner (N4b). |
| M11 | Hell-/Dunkel-Modus-Umschaltung | Feature | Nein | ⬜ | Niedrige Priorität. CSS-Variablen-Layer auf Basis von `src/styles/tokens.css`. |

---

## 16. Kategorie N — V1-Bugs aus App-Nutzung

| # | Punkt | Klassifikation | Visueller Beleg | Stand |
|---|---|---|---|---|
| N1 | Rohmasse zeigt Fragmente aus anderen Monaten — Monatsfilter im Fragment-Loader fehlt oder ist defekt | Bug | — | ✅ (v2-01) |
| N2 | Karten-Größen-Inkonsistenz: „Deutschlandticket Mama …"-Karte deutlich gestreckt | Bug | Image 2 | ✅ (v2-01) |
| N3 | Text-Overflow auf Karte „Reisekrankenversicherung — DKV" — Text läuft über die Karten-Begrenzung hinaus | Bug | Image 3 | ✅ (v2-01) |
| N4 | Ring-Anzeige `+− 358,1 %`: Vorzeichen-Anzeige-Bug. Berechnung selbst plausibel (Mai-Plan-Nenner ≈ 73,80 €). Zusätzlich: Cap-Strategie bei kleinem Plan-Nenner überdenken | Bug | Image 4 | ✅ (N4a v2-01 · N4b v2-03) |
| N5 | Farbtöne zwischen verknüpften Fragmenten und Transfers in der Rohmasse vereinheitlichen | Bug | — | ✅ (v2-03) |

---

## 17. Punkte mit Design-Direktor-Rücksprache vor Spec-Festschreibung

Folgende acht Punkte erfordern vor der Sprint-Briefing-Erstellung eine Klärung mit dem Design-Direktor. Sie sind in der V2-Roadmap als „Diskussion" klassifiziert.

| # | Klärungsbedarf | Stand |
|---|---|---|
| B6 | Vorjahres-Linie bei datenlosem Vorjahr — Fortbestand und Darstellung im Welle-Kontext | ✅ geklärt (v2-02) |
| M1 | Konsequenzen vollständiger Karten-Löschung für verknüpfte Fragmente | ✅ geklärt (Beschluss 24.07.) |
| M2 | Verbergen-Funktion: ersetzen durch Löschen oder als eigene Geste behalten | 🟡 Grundsatz geklärt (entfällt), Sprache + Gesten offen |
| M3 | Welle-Konzeption: Positionierung hinter Ring, monatliche IST + Plan, Klick-zu-Treppen-Popup, Position der Treiber-Hinweise | ✅ geklärt (DD-Cluster 2) |
| M5 | Karten-Anordnung: Verifikation heutiger Stand und Spec für gewünschte Reihenfolge | ⬜ offen |
| M10 | Darstellung negativer kumulierter Plan-Sparrate in Ring, Welle, Treppen-Popup | ✅ geklärt (DD-Cluster 3) |
| M11 | Hell-/Dunkel-Modus: visuelle Spec und Token-Mapping | ⬜ offen |
| N4 | Ring-Anzeige bei kleinem Plan-Nenner: Cap-Strategie, Vorzeichen-Logik, alternative Darstellung | ✅ geklärt (DD-Cluster 3 → N4b) |

**Zusätzlich seit v2-06 offen (nicht Teil der ursprünglichen Acht):** B2-Feinschliff —
Label-Format der Treiber-Zeilen, Wortlaut bei Monaten ohne Abweichung, und die
Entscheidung über E4 (Pseudo-Treiber „n € unzugeordnet in M" für die Rohmasse).

---

## 18. Konsolidierungs- und Überschreibungs-Hinweise

Damit Doppelarbeit im V2-Sprint-Backlog vermieden wird, sind die folgenden Beziehungen zwischen Themen beim Sprint-Schnitt zu beachten.

**M3 ersetzt das V1-Treppen-Layout.** Folgende B-Punkte werden dadurch transformiert: B1 wird im Welle-Kontext neu definiert; B5 bleibt relevant (ähnliche Datenmenge); B6 ist möglicherweise obsolet, falls die Welle keine Vorjahres-Linie führt. B2, B3 und B4 bleiben im neuen Kontext anwendbar.
→ *Nachtrag 25.07.: eingetreten. Die Welle führt eine Vorjahres-Linie, B6 wurde daher entschieden statt gestrichen; B2 und B3 sind umgesetzt, B1 und B4 bleiben offen.*

**M6 konsolidiert F1, F2, F3.** Alle drei Punkte adressieren die Verbesserung der automatischen Fragment-zu-Karten-Zuordnung und können als gemeinsamer Themen-Block unter M6 geführt werden. F4 (IBAN-Validierung), F5 (`paired_fragment_id`), F6 (Cross-Currency) und F7 (PDF/Excel) bleiben eigenständig.

**M1 erweitert A4.** Die Trash-Variante mit `CARD_HIDE`-Enum aus A4 wird durch das vollständig löschbare Karten-Modell aus M1 erweitert. A4 allein ist nicht mehr ausreichend; M1 ist die übergreifende Spec, A4 ein Implementierungs-Detail.
→ *Nachtrag 25.07.: in v2-05 gemeinsam umgesetzt; `CARD_HIDE` wurde nicht gebraucht.*

**M9 konkretisiert F5.** Die `paired_fragment_id`-Verlinkung aus F5 ist die technische Voraussetzung für die Multi-Account-Reconciliation aus M9. Beide Themen werden vermutlich gemeinsam in einem Sprint umgesetzt.
→ *Nachtrag 25.07.: M9 wurde in zwei Stufen geschnitten. Stufe 1 (v2-04) kam ohne F5 aus; F5 gehört zu Stufe 2.*

**M2-Entscheidung beeinflusst A2 und A3.** Wenn die Verbergen-Geste zugunsten von Löschen entfällt, werden A2 (Versteckte-Karten-Verwaltungs-UI) und A3 (Bestätigungs-Dialog vor Verbergen) obsolet. Falls Verbergen bleibt, sind A2 und A3 weiterhin relevant.
→ *Nachtrag 25.07.: eingetreten — Verbergen ist gestrichen, A2 und A3 sind hinfällig.*

---

## 19. Statistik nach Kategorie

| Kategorie | Themen | Klassifikations-Mix | Stand (25.07.2026) |
|---|---|---|---|
| Initial | 4 | 4 Setup-Aufgaben | 4 ✅ |
| M0 (Strategie) | 1 | 1 Strategie | 1 ✅ |
| A — Karten-System | 4 | 4 Features | 1 ✅ · 2 ⊘ · 1 ⬜ |
| B — Sparraten-Treppe | 6 | 5 Features, 1 Diskussion | 3 ✅ · 3 ⬜ |
| C — Transfer-System | 2 | 2 Features | 2 ⬜ |
| D — Settings und Onboarding | 3 | 3 Features | 3 ⬜ |
| E — Income und Fairness | 2 | 2 Features | 2 ⬜ |
| F — Distiller und Import | 7 | 7 Features | 7 ⬜ (F1–F3 unter M6, F5 unter M9) |
| G — Lifecycle und Backend | 2 | 2 Features | 1 🟡 · 1 ⬜ |
| H — Tooling | 1 | 1 Feature | 1 ⬜ |
| I — Domain und Hosting | 1 | 1 Feature | 1 ⬜ |
| J — Doku und Migrations | 2 | 2 Features | 1 ✅ · 1 🟡 |
| K — Aus Zwischenphase | 2 | 2 Features | 1 ✅ · 1 ⊘ |
| L — Out of Scope | 1 | — | 1 ⊘ dauerhaft |
| M — Aus App-Nutzung | 11 | 7 Features, 4 Diskussionen | 3 ✅ · 2 🟡 · 6 ⬜ |
| N — V1-Bugs | 5 | 5 Bugs | 5 ✅ |
| **Summe Zeilen** | **54** | Initial-Aufgaben, M0 und L1 in dieser Summe enthalten (siehe Zähl-Hinweis in 0.1) | **19 ✅ · 4 🟡 · 4 ⊘ · 27 ⬜** |

---

## 20. Hinweise zum weiteren Vorgehen für den V2-PM

Diese Roadmap ist die konsolidierte Quelle, aus der der V2-PM-Chat die Sprint-Priorisierung ableitet. Die Priorisierung selbst ist nicht Teil dieser Datei und wird gemeinsam mit dem User im V2-PM-Chat erarbeitet.
→ *Nachtrag 25.07.2026: Der aktuelle Priorisierungs-**Vorschlag** steht jetzt in Abschnitt 0.1. Er ersetzt die User-Entscheidung nicht — er macht sie nur schneller treffbar.*

Empfohlene erste Schritte im V2-PM-Chat:

1. **Phase-0-Reading-Order** aus dem V1→V2-Handover §7 abarbeiten (CLAUDE.md, Schema-Doku v3.1, Design-Doku v3.0, Sprint-Reviews 8 bis 10, Stilreferenz-Handover). *(erledigt)*
2. **Initial-Aufgaben Init-1 bis Init-4** als Pre-Sprint-1-Block erledigen. *(erledigt)*
3. **Design-Direktor-Runde** für die acht in Abschnitt 17 gelisteten Diskussions-Punkte ansetzen, bevor erste Briefings für die betroffenen Themen erstellt werden. *(5 von 8 geklärt; offen: M2-Rest, M5, M11 — plus B2-Feinschliff)*
4. **M0 (E2E-Tests mit Playwright)** als querliegendes Strategie-Thema in jeden Sprint einplanen, beginnend mit Sprint 1. *(erledigt, läuft mit)*
5. Anschließend thematische Sprint-Bündelung anhand der Konsolidierungs-Hinweise aus Abschnitt 18. *(Vorschlag in Abschnitt 0.1)*

---

*V2-Roadmap konsolidiert · Antigravity Finance · Zwischenphase V1 → V2 · 01. Juni 2026 · Status-Stand 25. Juli 2026 (nach Sprint v2-06)*
