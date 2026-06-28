# Sprint v2-01 — Bug-Sprint N1–N4a + Test-DB/Playwright-Querschnitt — ENTWURF v0.2

> **Adressiert an:** Claude Code (Implementierungs-Chat)
> **Vom:** PM-Chat V2 (Opus 4.7)
> **Datum:** 04. Juni 2026 (OQ-Update nach User-Entscheidung)
> **Branch:** `sprint/v2-01-bugfix-n1-n4` (Init-3-Konvention)
> **Modell-Empfehlung:** Sonnet 4.6 (siehe §8)
> **Status:** **ENTWURF — fast freigabereif.** OQ-1/OQ-2/OQ-3 sind geklärt (§4). Verbleibende Blocker: (a) Init-1-Test-Projekt + Init-2-Anker live, (b) N1–N4-Repro-Fixtures geseedet, (c) Scope-Entscheidung „jetzt mit 4 Bugs starten" (§2).

---

## 0. Sprint-Ziel — eine Zeile

Die vier DD-unabhängigen V1-Bugs N1, N2, N3, N4a beheben und als Querschnitt das Init-1-Test-Projekt anbinden + die Playwright-E2E-Pipeline (M0) bootstrappen — jeder Fix mit Playwright-Spec als wiederholbarem Akzeptanznachweis.

---

## 1. Scope (phasen-sequenziell, LL-14)

### Phase 0 — Querschnitt: Test-DB + Playwright-Harness (M0)

| # | Lieferung |
|---|---|
| L0.1 | Lokales Setup gegen das Init-1-Test-Projekt (`.env.test.local`, kein Eingriff in Live-Config) |
| L0.2 | Playwright installiert + Basis-Harness (`tests/e2e/`), Auth-Helper für den geseedeten Test-User, Run gegen Test-DB |
| L0.3 | Smoke-Baseline: Init-2-Anker als erster E2E-Assertion-Test — dient ab jetzt als Regressionswächter |

### Phase 1–4 — Bug-Fixes (je eigener Commit)

| Phase | Bug | In-Scope-Fix |
|---|---|---|
| P1 | **N1** | Monatsfilter im Fragment-Stack-Loader (Rohmasse) — zeigt **alle** Fragmente des angezeigten Monats (siehe §3, OQ-1 geklärt) |
| P2 | **N2** | Karten-Breite auf Spec-`136px` erzwingen, langer Name darf die Karte nicht strecken |
| P3 | **N3** | Text-Overflow auf Karte abfangen (Truncation/Wrap innerhalb der Karten-Begrenzung) |
| P4 | **N4a** | `+−`-Vorzeichen-Glyph der Ring-%-Anzeige korrigieren — **nur der Anzeige-Bug** |

### Phase 5 — Doku-Patches (LL-16)

| # | Lieferung |
|---|---|
| L5.1 | `sprints/sprint_v2-01_doku_patches.md` — falls ein Fix eine Spec präzisiert (v. a. N1 Monats-Scope-Regel in §8, N2/N3 Karten-Layout-Invariante in §7) |
| L5.2 | `CLAUDE_md_sprint_v2-01_patches.md` — §4 Sprint-Protokoll V2 (v2-01 Done), §10 v2-01-Block, M0-Playwright-Workflow-Notiz, Schema-Sync-Doku-Aufnahme aus Init-1 |

### Explizit NICHT in v2-01 (verschoben in den Design-Direktor-Block 1)

| # | Verschoben | Begründung |
|---|---|---|
| **N5** | Rohmasse-Farbton-Vereinheitlichung | User-Entscheidung 04.06.2026: mit DD besprechen — berührt die bewusste Sprint-9-AD5-Differenzierung Transfer (0.45) ↔ zugeordnet (0.22) |
| **N4b** | Cap-/Vorzeichen-/Darstellungs-Strategie bei winzigem Plan-Nenner | design-abhängig, §17 — im DD-Block neben M10 |

---

## 2. Vorbedingungen + offene Scope-Entscheidung

| Vorbedingung | Quelle |
|---|---|
| Init-1-Test-Projekt live, Schema v3.1 reproduziert | Architekten-Auftrag Init-1 |
| Init-2-Anker definiert + dokumentiert | Init-1 §2 |
| N1–N4-Repro-Fixtures geseedet | Init-1 §3 |

**Scope-Entscheidung (User):** Da N5 in den DD-Block gewandert ist, ist v2-01 von der DD-Runde **entkoppelt**. Empfehlung: v2-01 startet, sobald Init-1 geliefert ist — nicht auf das DD-Onboarding warten. N5 kommt in einem Folge-Schritt nach DD-Block-1.

---

## 3. Bug-Lokalisierung + Fix-Richtung (Diagnose-Hilfe, LL-11)

| Bug | Vermutete Quelle | Fix-Richtung | Spec-Anker |
|---|---|---|---|
| N1 | Fragment-Stack-Loader in `page.tsx` lädt Fragmente ohne `targetMonth`-Filter | **Alle** Fragmente des angezeigten Monats laden: Filter `date_trunc('month', transaction_date) = targetMonth` (unzugeordnet oben, zugeordnet/Transfer gedimmt unten — Sortierung §8 unverändert) | Schema §5; Design §8; Single-Surface „ein Monat" (CLAUDE.md §1) |
| N2 | Karussell-Flex lässt Karte bei langem Inhalt wachsen | `width:136px` + `flex: 0 0 136px` o. ä. fixieren | Design §7 Gemeinsame Basis (`Breite 136px`) |
| N3 | Karten-Name ohne Overflow-Behandlung | `text-overflow`/`overflow-wrap` innerhalb der Karte, kein Bruch der Begrenzung | Design §7 |
| N4a | `computeRingState`/Ring-Subtext: Vorzeichen-Präfix erzeugt `+−` (doppeltes Zeichen bei negativ-formatierter Zahl) | Vorzeichen-Formatierung de-duplizieren; reines Anzeige-Fix, **keine** Berechnungs-Änderung. DOM-Stelle vor Patch lokalisieren (LL-11) | Design §5 Farblogik/Grenzwert |

**Berechnung darf sich nicht ändern:** N1 und N4a berühren Sparrate-nahe Surfaces, aber kein Fix verändert einen Sparrate-Wert. Init-2-Anker muss vor/nach jeder Phase identisch sein.

---

## 4. Geklärte Fragen (ehem. OQ)

| OQ | Frage | Entscheidung (User 04.06.2026) |
|---|---|---|
| OQ-1 (N1) | Monats-Scope des Stacks | **Alle** Fragmente des angezeigten Monats anzeigen, Filter auf `transaction_date`-Monat = `targetMonth` |
| OQ-2 (N4) | N4a vs. N4b-Aufteilung | Bestätigt: v2-01 fixt nur N4a (Glyph); N4b → DD-Block |
| OQ-3 (N5) | Vereinheitlichung Rohmasse-Farbtöne | N5 komplett aus v2-01 → DD-Block (mit Differenzierungs-Frage) |

---

## 5. Akzeptanzkriterien

| # | Kriterium | Nachweis |
|---|---|---|
| A0.1 | `pnpm build` + `tsc --noEmit` + `next lint` clean | Output |
| A0.2 | Playwright-Harness läuft gegen Test-DB, Init-2-Anker-Assertion grün | Playwright-Report |
| A1 | N1: in einem Monat mit Fremd-Monats-Fragmenten zeigt der Stack genau die Fragmente dieses Monats (unzugeordnet + zugeordnet/Transfer gedimmt) | Playwright + Screenshot |
| A2 | N2: Karte mit langem Namen behält `136px`-Breite (DevTools Computed) | Playwright/Screenshot |
| A3 | N3: langer Karten-Text bleibt innerhalb der Karten-Begrenzung | Screenshot |
| A4 | N4a: Ring-%-Anzeige zeigt korrektes einzelnes Vorzeichen (kein `+−`) im kleinen-Nenner-Monat | Screenshot |
| A5 | **Regressionswächter:** Init-2-Anker (Ist + Plan) vor/nach allen Phasen identisch | Playwright + SQL |
| A6 | Doku-Patches als Datei (LL-16) | Datei-Review |
| A7 | Bundle-Hygiene: keine neuen Dev-Helper-Strings in `chunks/app/` | Grep |

## 6. Smoke-Sequenz (User-Browser, ergänzend zu Playwright)

| # | Aktion | Erwartung |
|---|---|---|
| S1 | Multi-Monats-Fragment-Monat öffnen | Stack zeigt genau diesen Monat, alle zugehörigen Fragmente (N1) |
| S2 | Monat mit Langname-Karte | Karte normal breit, Text abgeschnitten/umbrochen (N2/N3) |
| S3 | Kleiner-Nenner-Monat, Ring betrachten | korrektes Vorzeichen (N4a) |
| S4 | Init-2-Anker-Monat vor/nach Fixes | unverändert (A5) |

---

## 7. Anti-Drift

| # | Regel | Begründung |
|---|---|---|
| A1 | LL-14 sequenziell: P0 → P1 → … → P5, eigener Commit pro Phase | LL-14 |
| A2 | **Keine Sparrate-Berechnung im Frontend ändern** — Fixes sind UI/Loader-only | §2.1 + CLAUDE.md §7.1 |
| A3 | **Kein Schema-Eingriff** — falls ein Fix doch einen vermutet, STOP + PM-Eskalation (Architekt) | V2-Anti-Drift #1 |
| A4 | **Keine Spontan-Spec-Patches** — N4b/N5-Design NICHT eigenmächtig entscheiden | LL-13 |
| A5 | Doku-Patches als separate Datei | LL-16 |
| A6 | Init-2-Anker-Cross-Check nach jeder Phase | Init-2 / V2-Anti-Drift #5 |
| A7 | Test-User-UUID nicht in `src/` hardcoden | Anti-Drift A8 |
| A8 | Migrationen (falls je nötig) zuerst Test-DB, dann Live | Init-1 §4 |

---

## 8. Modell-Empfehlung-Begründung

**Sonnet 4.6** — reine UI-/Loader-Bugs mit klaren Specs, kein Schema-Eingriff. **Eskalation auf Opus 4.7** nach einem erfolglosen Fix-Versuch bei diagnostisch unklarem CSS/DOM-Coupling (N2/N3-Risiko, analog Sprint-4-K2-Episode). N4a-Diagnose und N1-Loader-Filter sind Sonnet-Komfortzone.

---

## 9. PM-Übergabe-Notiz

**Freigabe, sobald Init-1/Init-2 geliefert sind** — keine DD-Abhängigkeit mehr (N5 ist raus). Dann: Branch anlegen, Claude Code frisch instanziieren mit CLAUDE.md + Design-Doku v3 + Schema-Doku v3.1 + diesem Briefing.

**Was Claude Code im Review zurückgibt:** Sanity-Output, Playwright-Report, Smoke-Tabelle S1–S4, Code-Lokalisierungs-Notiz pro Bug, Doku-Patches-Datei, CLAUDE.md-Patch-Vorschlag, offene Quirks.

---

*Sprint v2-01 Briefing-ENTWURF v0.2 · Antigravity Finance 2.0 · 04. Juni 2026*
