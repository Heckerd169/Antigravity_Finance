# Sprint v2-03 — Display: N5 + N4b + B3 — v1.0

> **Adressiert an:** Claude Code (Implementierungs-Chat)
> **Vom:** PM-Chat V2 (Opus 4.7)
> **Datum:** 04. Juli 2026
> **Branch:** `sprint/v2-03-display-n5-n4b-b3` (von `main` **nach** v2-02-Merge)
> **Modell-Empfehlung:** Sonnet 4.6 (§8)
> **Wahrheit:** Design-Doku **v3.1.2** (§8 N5, §5 N4b, §9-Popup B3)
> **Status:** Freigabereif, sobald v2-02 gemergt + v3.1.2 gesynct ist.

---

## 0. Sprint-Ziel — eine Zeile

Die drei Block-1-Cluster-3-Darstellungspunkte umsetzen: Rohmasse-Grundton vereinheitlichen (N5), Ring-%-Subzeile + Degenerations-Modus + neutraler Arc (N4b), kumulativ-negativ-Rot im Popup (B3). Reine UI, **kein Schema**.

---

## 1. Scope (phasen-sequenziell, LL-14 · Commit + Push pro Phase)

| Phase | Punkt | Lieferung |
|---|---|---|
| **P0** | git | Branch von aktuellem `main` (v2-02 enthalten) anlegen, pushen |
| **P1** | **N5** (§8) | Gemeinsamer Grau-Grundton-Token `--fragment-hue` für **alle** Rohmasse-Fragmente (zugeordnet + Transfer). Unterscheidung bleibt **nur** über Opacity (`0.22`/`0.45`) + „TRANSFER"-Badge (Grau-Soft). Zweiten abweichenden Grau-Hue entfernen. Yellow-Soft bleibt für Transfer ausgeschlossen (AD5) |
| **P2** | **N4b** (§5) | **a)** Cap: ab > 200 % Subzeile „> 200 % von Plan" (arc-gekoppelt). **b)** Degenerations-Modus `Plan < 100 €` (inkl. jedem negativen Plan): EUR-Aussage statt %, **Subzeilen-Farbe folgt dem Differenz-Vorzeichen** (nicht dem absoluten IST); Prozent hier nie zeigen. **c)** Neutraler Arc im Degenerations-Modus (nur Spur/Track, keine Füllung) |
| **P3** | **B3** (§9-Popup) | Kumulierte Kurve abschnittsweise: < 0 → `#FF453A` (Fläche + Linie), ≥ 0 → teal, **nicht global**. Held (Jahressumme) folgt **Endwert**-Vorzeichen (rot wenn Endwert < 0). Vorjahres-Goldlinie unberührt. Füllt den in v2-02 offen gelassenen B3-Slot |
| **P4** | Doku/Review | Doku-Patches (falls Präzisierung, LL-16) + Review + git-Push |

### N4b-Testfälle (aus DD-Festlegung, als AC-Referenz)
- Plan −500 €, IST −400 € → Held „−400 €" (rot) · Subzeile „+100 € über Plan" (**teal**)
- Plan −500 €, IST −700 € → Held „−700 €" (rot) · Subzeile „−200 € unter Plan" (**rot**)
- Plan fast 0 € (positiv) → „Plan fast 0 € — +X € gespart"

---

## 2. Vorbedingungen

| Vorbedingung | Quelle |
|---|---|
| v2-02 gemergt (Popup existiert auf `main`) | Prod-Gate |
| Design-Doku **v3.1.2** gesynct | Block-1-Abschluss |

---

## 3. Datenquelle / Schema

**Kein Schema-, kein RPC-Eingriff.** N4b nutzt den bereits vorhandenen Plan-Wert des Rings; B3 nutzt die in v2-02 gebaute kumulierte Kurve; N5 ist reine Token-/CSS-Änderung. Falls ein Punkt einen Datenbedarf jenseits des Vorhandenen vermuten lässt → STOP + PM-Eskalation.

---

## 4. Akzeptanzkriterien

| # | Kriterium | Nachweis |
|---|---|---|
| A0 | `tsc` / `lint` / `build` clean | Output |
| A1 | N5: alle Rohmasse-Fragmente ein Grundton; zugeordnet vs. Transfer weiter via Opacity + Badge unterscheidbar; kein zweiter Grau-Hue | Screenshot |
| A2 | N4b-a: > 200 % → „> 200 % von Plan" statt Zahl | Screenshot |
| A3 | N4b-b: `Plan < 100 €` → EUR-Aussage; Subzeilen-Farbe folgt Differenz-Vorzeichen (beide Negativ-Beispiele) | Screenshots |
| A4 | N4b-c: neutraler Arc (nur Spur) im Degenerations-Modus | Screenshot |
| A5 | B3: kumulierte Kurve abschnittsweise rot < 0 / teal ≥ 0; Held folgt Endwert; Goldlinie unberührt | Screenshot |
| A6 | **Regression:** Live-Referenzmonate Mai 338.12 / Juni 1886.97 / Juli 1886.97 vor/nach identisch; kein Sparrate-Wert geändert | read-only, LL-18 |
| A7 | **Kein Schema-/RPC-Eingriff** | Diff |
| A8 | git: Branch + Commit/Push pro Phase | git log |

## 5. Smoke-Sequenz (Browser)

| # | Aktion | Erwartung |
|---|---|---|
| S1 | Rohmasse mit zugeordnetem + Transfer-Fragment | ein Grundton, weiter unterscheidbar (N5) |
| S2 | Monat mit kleinem Plan-Nenner (live z. B. Mai) | EUR-Aussage statt %, neutraler Arc (N4b) |
| S3 | Über-Plan-Monat > 200 % | „> 200 % von Plan" (N4b-a) |
| S4 | Popup öffnen | Kurve teal/rot abschnittsweise, Held-Farbe = Endwert (B3) |
| S5 | Referenzmonate vor/nach | Sparrate unverändert (A6) |

**Verifikations-Grenze:** Ein kumulativ-negatives Jahr existiert im Live-Bestand evtl. nicht → B3-Negativpfad ggf. nur code-seitig prüfbar (analog B6-„vorhanden"-Pfad in v2-02). Im Review vermerken.

---

## 6. Anti-Drift

| # | Regel |
|---|---|
| A1 | LL-14 sequenziell, Commit + Push pro Phase (git-Regel) |
| A2 | **Kein Schema-/RPC-Eingriff**, keine Sparrate-Berechnung ändern |
| A3 | **Doku v3.1.2 gewinnt** bei Konflikt mit dem Mockup |
| A4 | N5: die bewusste Sprint-9-AD5-Differenzierung (Transfer heller + Grau-Badge) **erhalten** — nur den Grundton angleichen, nicht die Semantik |
| A5 | Doku-Patches als separate Datei (LL-16) |
| A6 | Test-User-UUID nicht in `src/` |

---

## 7. git-Workflow (stehende Regel)

Branch von `main`, Commit + Push pro Phase, Branch aktuell halten. **Kein** Merge/Deploy, **kein** Force-Push/History-Rewrite, **keine** Secrets. Merge → `main` (Prod-Deploy) macht der User nach grünem Smoke.

---

## 8. Modell-Empfehlung-Begründung

**Sonnet 4.6** — drei klar spezifizierte UI-Punkte. **Eskalation auf Opus 4.7**, falls die N4b-Degenerationslogik (Vorzeichen-Farb-Kopplung + Arc-Entkopplung) nach einem Fix-Versuch nicht sauber greift.

---

## 9. PM-Übergabe-Notiz

Claude Code frisch instanziieren mit CLAUDE.md (git-Regel) + Design-Doku **v3.1.2** + Schema-Doku v3.1 + `welle_v1.html` (B3-Port-Kontext) + diesem Briefing.

**Rückgabe im Review:** Sanity, Smoke S1–S5 mit Sparrate-Vorher/Nachher, git-Log, Verifikations-Grenzen (B3-Negativpfad), ggf. Doku-Patches, offene Quirks.

---

*Sprint v2-03 Briefing v1.0 · Antigravity Finance 2.0 · 04. Juli 2026*
