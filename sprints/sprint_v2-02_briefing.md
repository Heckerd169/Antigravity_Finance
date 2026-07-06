# Sprint v2-02 — Jahres-Welle + Popup (§9) — v1.0

> **Adressiert an:** Claude Code (Implementierungs-Chat)
> **Vom:** PM-Chat V2 (Opus 4.7)
> **Datum:** 26. Juni 2026
> **Branch:** `sprint/v2-02-welle-popup`
> **Modell-Empfehlung:** Sonnet 4.6 (§9)
> **Referenz:** `public/prototypes/welle_v1.html` (Port-Vorlage) · **Wahrheit:** Design-Doku **v3.1.1 §9**
> **Status:** Freigabereif, sobald v3.1.1 im Projekt-Knowledge gesynct ist.

---

## 0. Sprint-Ziel — eine Zeile

Das neue §9 aus v3.1.1 bauen: eine **monatliche EUR-Welle hinter dem Ring** + ein **Klick-Popup mit kumulierter Treppe**, portiert aus `welle_v1.html` — und das **V1-Inline-Treppen-Layout retiren**. Kein Schema-Eingriff.

---

## 1. Scope (phasen-sequenziell, LL-14 · je eigener Commit + Push)

| Phase | Lieferung |
|---|---|
| **P0** | Branch `sprint/v2-02-welle-popup` von aktuellem `main` anlegen, pushen (git-Workflow §8) |
| **P1** | **Welle-Rendering (Canvas):** 12-Monats-EUR-Welle, Y = monatliche Sparrate €, Opacity `0.80` (`--wave-opacity`). Teal = realisiert, Grau = Forecast, Rot `#FF453A` = negativer Monat. **Regime-Grenze = letzter realisierter (abgeschlossener) Monat, unabhängig vom Header-aktiven Monat** (D1). Genau **ein** aktiver-Monat-Kreis. Datenquelle: Loop (§3) |
| **P2** | **Scrub-durch-den-Ring:** Ring `pointer-events:none`; Monatswahl = positions-basiertes Scrubbing über volle Breite; Führungslinie + Tooltip **über** dem Ring. Hover-Tooltip: Monat, IST €, Plan €, **Top-1-Treiber (Platzhalter, §4)** |
| **P3** | **Popup:** Single-Surface-Overlay, dismissible per Klick-außen/Escape, **kein Tooling/Slider**. Kumulierte Treppe IST(teal)+Plan(grau), **Jahressumme als Held**, **B6** gold-gestrichelte Vorjahres-Linie (rechter Gutter, datenlos → entfällt), **B1** Kalenderjahr, Monatsklick → **Top-3-Treiber (Platzhalter, §4)** |
| **P4** | **§6 Header:** Ausreißer-Subzeile mit **permanent reservierter Zeilenhöhe** (`min-height`) → kein Layout-Sprung beim Monatswechsel |
| **P5** | **V1-Inline-Treppe retiren:** altes Treppen-Layout hinter dem Ring entfernen; die kumulierte Rechenlogik wandert in das Popup (P3), nicht doppelt halten |
| **P6** | Doku-Patches (LL-16, falls ein Detail die Spec präzisiert) + Review + git-Push |

### Explizit NICHT in v2-02

| # | Grund |
|---|---|
| **B2** echte Treiber-Heuristik | eigener Backend-Sprint; hier nur Platzhalter-Anzeige |
| **B5** Bulk-RPC `get_yearly_sparrate_curves` | Schema-/RPC-Addition → würde das Test-Projekt-Gate auslösen; **nicht** in diesem Prod-direkten UI-Sprint. Datenquelle bleibt der Loop (§3) |
| **N4b** Ring-%-Subzeile-Cap | Cluster 3, Ring-only |
| **B3** kumulativ-negativ-Rot im Popup | Cluster 3. Der §9-Popup-Slot ist in v3.1.1 markiert. Falls Cluster 3 vor Sprint-Start entschieden ist, fällt B3 in P3; sonst Fast-Follow-Patch |

---

## 2. Vorbedingungen

| Vorbedingung | Quelle |
|---|---|
| Design-Doku **v3.1.1** gesynct (§9 Welle/Popup) | v2-01-Abschluss |
| CLAUDE.md mit git-Workflow-Regel gesynct | dieser Sprint |
| `welle_v1.html` im Repo (`public/prototypes/`) als Port-Vorlage | DD-Lieferung |

---

## 3. Datenquelle — Loop (Option A, kein Schema)

Die Welle + das Popup brauchen pro Jahr: 12× monatliche IST-Sparrate, 12× geplante Sparrate, die kumulierten Summen, und den Vorjahres-Jahresendwert.

- **Loop über bestehende RPCs:** `calculate_sparrate_for_month(user, M)` und `calculate_planned_sparrate_for_month(user, M)` für M = Jan–Dez (Section 4). Vorjahres-Endwert = Σ `calculate_sparrate_for_month` Jan–Dez des Vorjahres.
- **Kumulierte Treppe = Summe** dieser Monatswerte — **keine neue Berechnung**, nur Aufsummierung vorhandener RPC-Ergebnisse.
- **Kein neuer RPC.** B5 (Bulk) ist eine spätere Performance-Optimierung im ersten ohnehin schema-tragenden Sprint. Für einen Single-User ist der Loop unkritisch.

---

## 4. Platzhalter-Treiber

Top-1 (Hover) und Top-3 (Popup-Monatsklick) werden mit **Stub-Daten** verdrahtet (wie im Mockup). Das **Display** ist entschieden, die **Heuristik** (B2) nicht. Der Stub liefert eine feste, klar als Platzhalter erkennbare Struktur; die echte Heuristik ersetzt sie später ohne UI-Änderung.

---

## 5. Akzeptanzkriterien

| # | Kriterium | Nachweis |
|---|---|---|
| A0 | `pnpm build` + `tsc --noEmit` + `next lint` clean | Output |
| A1 | Welle rendert 12 Monate in EUR; Teal→Grau-Grenze am **letzten realisierten Monat**; Navigation in einen Zukunftsmonat färbt **nicht** um (D1) | Screenshot je Zustand |
| A2 | Opacity 0.80; negativer Monat rot `#FF453A`; genau ein aktiver-Monat-Kreis | Screenshot |
| A3 | Scrubbing über volle Breite inkl. **Jahresmitte hinter dem Ring**; Tooltip + Führungslinie über dem Ring | Screenshot |
| A4 | Popup öffnet, dismissible per Klick-außen + Escape; kumulierte Treppe IST+Plan; Jahressumme als Held | Screenshot |
| A5 | B6: gold-gestrichelte Vorjahres-Linie, Betrag im rechten Gutter; **datenloses Vorjahr → Linie entfällt** | zwei Screenshots (mit/ohne Vorjahr) |
| A6 | §6 Header: kein Layout-Sprung beim Monatswechsel (Subzeile reserviert) | Screenshot Monatswechsel |
| A7 | V1-Inline-Treppe entfernt; keine doppelte kumulierte Logik | Diff |
| A8 | **Regression:** kumulierte Treppe = Σ der Monats-Sparraten; ein Referenzmonat (Sparrate €) vor/nach unverändert; **kein Sparrate-Wert geändert** | Vorher/Nachher-Notiz |
| A9 | **Kein Schema-/RPC-Eingriff** (Loop only) | Diff |
| A10 | git: Branch angelegt, ein Commit + Push pro Phase, Branch aktuell zu `main` | git log/status |

## 6. Smoke-Sequenz (Browser)

| # | Aktion | Erwartung |
|---|---|---|
| S1 | Aktuellen Monat öffnen, Welle betrachten | Teal bis heute, Grau danach, Opacity stimmt |
| S2 | In einen Zukunftsmonat blättern | Welle färbt NICHT um; nur Ring-Zahl + Kreis wandern (D1) |
| S3 | Über die Welle scrubben, auch Jahresmitte hinter dem Ring | Tooltip folgt, Führungslinie über Ring |
| S4 | Welle anklicken → Popup | Treppe IST+Plan, Jahressumme, dismissible |
| S5 | Vorjahr vorhanden vs. nicht | Goldlinie da / entfällt |
| S6 | Monatswechsel im Header | kein Sprung |
| S7 | Referenzmonat-Sparrate vor/nach | unverändert |

---

## 7. Anti-Drift

| # | Regel | Begründung |
|---|---|---|
| A1 | LL-14 sequenziell P0→P6, Commit + Push pro Phase | LL-14 + git-Regel §8 |
| A2 | **Kein Schema-/RPC-Eingriff.** B5 NICHT bauen. Falls Perf drückt → STOP + PM-Eskalation (dann Test-Projekt-Gate) | Option-A-Gate |
| A3 | **Keine Sparrate-Berechnung ändern** — kumuliert = Summe vorhandener RPC-Ergebnisse | §2.1 |
| A4 | **Doku v3.1.1 gewinnt** bei Konflikt mit dem Mockup | DD-Grundsatz |
| A5 | **B3/N4b nicht eigenmächtig entscheiden**; Treiber sind Platzhalter, **B2 nicht bauen** | LL-13 |
| A6 | Doku-Patches als separate Datei | LL-16 |
| A7 | Test-User-UUID nicht in `src/` | Anti-Drift A8 |

---

## 8. git-Workflow (NEU — stehende Regel ab v2-02)

Claude Code hält das Repo **selbst aktuell**:

| Claude Code macht | Claude Code macht NICHT |
|---|---|
| Branch von `main` anlegen | **kein Merge** `Feature → main` |
| Ein Commit pro Phase, klare Message (`v2-02 P1: Welle-Canvas …`) | **kein Deploy** auf Prod |
| Branch pushen, aktuell zu `main` halten (pull/rebase bei Bedarf) | **kein Force-Push / History-Rewrite** auf geteilten Branches |
| Branch-Preview über Vercel entsteht automatisch | keine Secrets/`.env` committen |

**Warum die Grenze:** Merge → `main` löst den Vercel-Prod-Deploy aus. Der finale Smoke ist der **menschliche Prod-Gate** (Zwei-Personen-Prinzip). Ablauf: Claude Code pusht den Branch → du smokest die **Preview** (oder Prod unter Option A) → **du** mergest + deployst. Willst du, dass Claude Code auch mergt/deployt, ist das eine bewusste Override-Entscheidung von dir — Standard ist: Merge/Deploy bleibt bei dir.

---

## 9. Modell-Empfehlung-Begründung

**Sonnet 4.6** — der Prototyp `welle_v1.html` hat die harten Teile (Canvas-Mathematik, Scrub, Verdeckung, Popup) bereits gelöst; der Sprint ist überwiegend ein **Port** nach React/Next, kein Neuentwurf. **Eskalation auf Opus 4.7**, falls die Canvas-in-React-Integration (Ref-Handling, Re-Render bei Monatswechsel) oder das Retiren der V1-Treppe (P5) Kopplung offenlegt, die nach einem Fix-Versuch nicht sauber ist.

---

## 10. PM-Übergabe-Notiz

Claude Code frisch instanziieren mit CLAUDE.md (git-Regel-Stand) + Design-Doku **v3.1.1** + Schema-Doku v3.1 + `welle_v1.html` + diesem Briefing.

**Was Claude Code im Review zurückgibt:** Sanity-Output, Smoke-Tabelle S1–S7 mit Sparrate-Vorher/Nachher, git-Log (Branch + Commits + Push), Port-Notiz (was aus dem Mockup übernommen, was angepasst), ggf. Doku-Patches-Datei, offene Quirks. **B3-Slot** offen lassen, falls Cluster 3 noch nicht zurück ist.

---

*Sprint v2-02 Briefing v1.0 · Antigravity Finance 2.0 · 26. Juni 2026*
