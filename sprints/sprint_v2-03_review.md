# Sprint v2-03 — Review: Display N5 + N4b + B3

> **Von:** Claude Code (Implementierungs-Chat, Fable 5)
> **An:** PM (V2)
> **Datum:** 6. Juli 2026
> **Branch:** `sprint/v2-03-display-n5-n4b-b3` (gepusht, aktuell zu `main`)
> **Basis:** Design-Doku v3.1.2 (§8 N5, §5 N4b, §9-Popup B3) · Briefing v1.0
> **Merge/Deploy:** liegt beim User (Prod-Gate, Zwei-Personen-Prinzip)

---

## 1. Sanity (A0)

| Check | Ergebnis |
|---|---|
| `tsc --noEmit` | ✅ 0 Errors (nach jeder Phase) |
| `next lint` | ✅ 0 Warnings / 0 Errors |
| `pnpm build` | ✅ 0 Errors |
| Bundle Route `/` | 27.7 kB (v2-02: 27.5 kB → +0.2 kB) · First Load 179 kB unverändert |
| Bundle-Hygiene (`chunks/app/`) | ✅ 0 Treffer Dev-Panel-Strings |

## 2. git-Log (A8)

Ein Commit pro Phase, jeweils direkt gepusht:

```
88f94ea v2-03 P0: sprint briefing
6ba25a1 v2-03 P1 (N5): gemeinsamer Grau-Grundton-Token --fragment-hue (2 Dateien, +21/−9)
f8c556d v2-03 P2 (N4b): Ring-Subzeile — >200%-Cap, Degenerations-Modus, neutraler Arc (1 Datei, +41/−13)
5cd5853 v2-03 P3 (B3): Popup-Kurve abschnittsweise rot, Held folgt Endwert (3 Dateien, +51/−11)
+ P4: Doku-Patches + dieser Review (docs-Commit)
```

## 3. A6-Regression — Sparrate Vorher/Nachher (LL-18, read-only)

| Referenzmonat | Vorher (vor P0) | Nachher (nach P3 + Build) | |
|---|---|---|---|
| Mai 2026 (IST) | 338.12 | 338.12 | ✅ |
| Juni 2026 (IST) | 1886.97 | 1886.97 | ✅ |
| Juli 2026 (IST) | 1886.97 | 1886.97 | ✅ |

A7 erfüllt: Diff enthält ausschließlich `src/`-Frontend (CSS/TSX) + `sprints/` — kein Schema-/RPC-Eingriff, keine Berechnungs-Änderung.

## 4. Umsetzung je Punkt

**P1 — N5 (§8):** Neues globales Token `--fragment-hue: 255, 255, 255` (RGB-Triplet, [tokens.css](../src/styles/tokens.css)). Alle Grau-Werte der Rohmasse-Fragmente (`--frag-border`/`-desc`/`-date` + TRANSFER-Badge-Triplet) basieren jetzt darauf — der abweichende Sprint-9-Hue `rgba(140,140,140,…)` des TRANSFER-Badges entfällt (das waren die „zwei leicht abweichenden Grau-Töne nebeneinander"). Alphas unverändert; Unterscheidung zugeordnet (0.22) vs. Transfer (0.45) + Badge bleibt exakt erhalten (Anti-Drift A4); Yellow-Soft bleibt für Transfer ausgeschlossen (AD5).

**P2 — N4b (§5):** In `computeRingState` ([singularity-ring/index.tsx](../src/components/singularity-ring/index.tsx)):
- **a)** `pct > 2` → Subzeile „> 200 % von Plan" (teal), arc-gekoppelt (Arc schließt weiterhin bei 200 %).
- **b)** `Plan < 100 €` (inkl. negativ) → Degenerations-Modus, Prozent wird nie gezeigt. Plan negativ → Differenz-Sprache; Plan 0–100 → „Plan fast 0 € — +X € gespart". **Subzeilen-Farbe = Differenz-Vorzeichen** (IST − Plan ≥ 0 teal, sonst rot). DD-Testfälle: Plan −500/IST −400 → Held „−400 €" rot · „+100 € über Plan" teal ✓; Plan −500/IST −700 → Held „−700 €" rot · „−200 € unter Plan" rot ✓.
- **c)** Neutraler Arc: beide Arc-Offsets auf C (nur Track). Der alte `plan === 0`-Sonderfall geht im Degenerations-Modus auf.

**P3 — B3 (§9):** `drawPopupStair` färbt die IST-Treppe abschnittsweise: unter der Null-Linie Ausgaben-Rot `#FF453A` (Fläche + Linie) via Clip-Rechteck — identische Technik wie der M10-Negativ-Monat auf der Welle; über Null teal. Monats-Punkte folgen ihrem Abschnitt (Doku-Patch 1). Held folgt dem **Endwert**-Vorzeichen (rot < 0, sonst teal), nicht dem tiefsten Zwischenstand. Goldlinie (B6) unberührt. Der v2-02-B3-Slot ist damit gefüllt.

## 5. Verifikations-Grenzen + Nachweis B3

Ein kumulativ-negatives Jahr existiert im Live-Bestand nicht (Income ab Mai 2026, alle Kumulationen ≥ 0) → der B3-Negativpfad ist im Browser-Smoke **nicht** auslösbar (Briefing §5 hatte das antizipiert). Nachweis stattdessen: **Headless-Chrome-Repro mit dem real kompilierten `draw.ts`** (tsc-Emit, ungepatcht) und synthetischen Kurven:
- Fall 1 (Dip unter Null → Erholung, Endwert +3.900 €): rote Abschnitte Jan–Mai (Fläche/Linie/Punkte), Übergang exakt an der Null-Linie, ab Jun teal; Held teal; Goldlinie bei +1.500 € unberührt; Selektions-Punkt rot vergrößert.
- Fall 2 (durchgehend negativ, Endwert −2.300 €): Kurve komplett rot, Held rot, Plan-Treppe grau unberührt.
Beide Screenshots im Scratchpad erstellt und visuell verifiziert (abschnittsweise ✓, nicht global ✓).

## 6. Smoke-Tabelle S1–S5 (Browser-Smoke durch User auf Preview)

| # | Aktion | Erwartung | Status |
|---|---|---|---|
| S1 | Rohmasse mit zugeordnetem + Transfer-Fragment | Ein Grau-Grundton; Unterscheidung weiter klar via Opacity (0.22/0.45) + TRANSFER-Badge; Badge minimal heller als vorher (Hue-Angleich bei gleichen Alphas) | ⏳ User |
| S2 | Monat mit kleinem/negativem Plan-Nenner | EUR-Aussage statt %, neutraler Arc (nur Spur). **Live-Hinweis:** Mai 2026 hat Plan 338,12 € (> 100 €) → S2 ist live ggf. NICHT auslösbar; prüfbar per Dev-Force-Panel (Force plannedSparrate z. B. `50` oder `-500`) im Dev-Modus | ⏳ User |
| S3 | Über-Plan-Monat > 200 % | „> 200 % von Plan" statt Zahl (Dev-Force: current `5000`, planned `1000`) | ⏳ User |
| S4 | Popup öffnen | Kurve abschnittsweise teal/rot, Held-Farbe = Endwert. Live-Bestand: alles ≥ 0 → durchgehend teal ist das korrekte Ergebnis; Negativpfad siehe §5-Nachweis | ⏳ User / ✅ Repro |
| S5 | Referenzmonate vor/nach | ✅ programmatisch verifiziert (§3) | ✅ |

## 7. Offene Quirks / Hinweise

1. **S2/S3 live kaum auslösbar:** Der Live-Plan (≈1.887 €, Mai 338 €) liegt über der 100-€-Schwelle und unter 200 %-Überschreitung. Für den visuellen Smoke der N4b-Pfade das NODE_ENV-gated Dev-Force-Panel nutzen (Force-Werte siehe Tabelle) — Production-Verhalten ist identisch (reine `computeRingState`-Logik).
2. **N4b-Subzeile bei „Plan fast 0" mit negativem IST** ergibt Wortlaut wie „Plan fast 0 € — −180 € gespart" — Spec-Wortlaut mit vorzeichenbehaftetem X umgesetzt; falls der PM hier eine eigene Formulierung will, ist es ein Ein-Zeilen-Patch.
3. **Doku-Patches** (3 Präzisierungen, keine Abweichungen): B3-Punkte folgen Abschnitt · „Plan fast 0 €"-Wortlaut für ganzen Bereich 0–100 € · Differenz = 0 → „+0 € über Plan" (teal). Siehe `sprint_v2-03_doku_patches.md`.
4. **N5-Sichtprüfung:** Der Hue-Angleich des TRANSFER-Badges (140→255-Basis bei gleichen Alphas) macht das Badge geringfügig heller; wirkt durch die 0.45-Karten-Opacity gedämpft. Falls es dem PM zu hell erscheint: Alpha-Feintuning im Token-Block, kein Struktur-Thema.

## 8. Vorschläge zur CLAUDE.md-Aktualisierung (Vorschlag, keine Ausführung)

- §4-Protokoll V2: v2-03-Zeile ergänzen (Status nach Approval).
- Verifikations-Pattern-Notiz: „Nicht live auslösbare Render-Pfade (B6-vorhanden, B3-negativ, N4b-degeneriert) via Headless-Chrome-Repro mit real kompiliertem Modul-Code verifizieren" — etabliert in v2-02 K1 + v2-03 P3; Kandidat für LL-Kodifizierung.

---

*Sprint v2-03 Review · Antigravity Finance 2.0 · 6. Juli 2026*
