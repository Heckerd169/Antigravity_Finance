# Sprint v2-02 — Review: Jahres-Welle + Popup (§9)

> **Von:** Claude Code (Implementierungs-Chat, Fable 5)
> **An:** PM (V2)
> **Datum:** 4. Juli 2026
> **Branch:** `sprint/v2-02-welle-popup` (gepusht, aktuell zu `main`)
> **Basis:** Design-Doku v3.1.1 §9 · Briefing `sprint_v2-02_briefing.md` v1.0
> **Merge/Deploy:** liegt beim User (Prod-Gate, Zwei-Personen-Prinzip)

---

## 1. Sanity (A0)

| Check | Ergebnis |
|---|---|
| `tsc --noEmit` | ✅ 0 Errors (nach jeder Phase) |
| `next lint` | ✅ 0 Warnings / 0 Errors |
| `pnpm build` | ✅ 0 Errors / 0 Warnings |
| Bundle Route `/` | 27.5 kB (Sprint 10: 26.2 kB → +1.3 kB netto: −Treppe, +Welle/Popup/Scrub) |
| First Load JS `/` | 179 kB (Sprint 10: 178 kB) |
| Bundle-Hygiene (LL-4, `chunks/app/`) | ✅ 0 Treffer „Force Ring/Force currentSparrate/Force zurücksetzen" · 0 Treffer `touchstart` |

## 2. git-Log (A10)

Ein Commit pro Phase, jeweils direkt gepusht; `main` hat sich während des Sprints nicht bewegt (Branch aktuell):

```
60d3e31 v2-02 P0: sprint briefing + CLAUDE.md git-workflow-sync (PM-Lieferung)
21f7c49 v2-02 P1: Welle-Canvas — 12-Monats-EUR-Welle hinter dem Ring          (8 Dateien, +560/−35)
10c85b0 v2-02 P2: Scrub durch den Ring — Führungslinie + Tooltip über dem Ring (4 Dateien, +278/−9)
bd6fd23 v2-02 P3: Popup — kumulierte Treppe IST+Plan, Jahressumme als Held    (4 Dateien, +472/−43)
02dbcf5 v2-02 P4: §6 Header — Ausreißer-Subzeile mit reservierter Zeilenhöhe  (3 Dateien, +35)
0426a6d v2-02 P5: V1-Inline-Treppe retired                                    (5 Dateien, +5/−699)
+ P6: dieser Review + Doku-Patches (docs-Commit)
```

## 3. A8-Regression — Sparrate Vorher/Nachher

**Wichtiger Befund vor Sprint-Start:** Die DB ist seit Go-Live im Echtbetrieb. Der historische §4.6-Anker (März 2026 = 2.910,01 €) existiert nicht mehr — `income_timeline` startet live erst am **2026-05-01** (ICH + PARTNER), daher liefert die RPC für Jan–Apr 2026 legitim `NULL`. Als Referenz dienten stattdessen die Live-Monate (LL-18-Pattern, RAISE-Rollback, read-only):

| Referenzmonat | Vorher (vor P0) | Nachher (nach P5) | |
|---|---|---|---|
| Mai 2026 (IST) | 338.12 | 338.12 | ✅ unverändert |
| Juni 2026 (IST) | 1886.97 | 1886.97 | ✅ unverändert |
| Juli 2026 (IST) | 1886.97 | 1886.97 | ✅ unverändert |
| Juli 2026 (Plan) | 1886.97 | 1886.97 | ✅ unverändert |

Erwartungskonform: v2-02 ist ein reiner UI-/Loader-Sprint (A9: kein Schema-/RPC-Eingriff — Diff enthält ausschließlich `src/`-Frontend + `sprints/`-Doku). Kumulierte Werte = reine Aufsummierung der Monats-RPC-Ergebnisse im Welle-Loader (A3/A8).

## 4. Smoke-Tabelle S1–S7 (Browser-Smoke durch User auf Preview/Prod)

Claude Code hat keinen Browser — programmatisch verifiziert sind Build, Datenpfad und der A8-Anker. Erwartungen mit Live-Daten-Kontext (Juli 2026, Income ab Mai 2026):

| # | Aktion | Erwartung mit Live-Daten | Status |
|---|---|---|---|
| S1 | Aktuellen Monat (Juli 2026) öffnen | Welle: Jan–Apr auf der Nulllinie (NULL→0), Mai leicht positiv (338 €), Jun–Jul deutlich (1.887 €); **Teal bis einschließlich Juli** (Regime-Grenze = laufender Monat, Doku-Patch 1), Aug–Dez grau; Opacity 0.80; genau ein Kreis auf Juli | ⏳ User |
| S2 | In Zukunftsmonat blättern (z. B. Okt 2026) | Welle färbt NICHT um (D1) — nur Ring-Zahl + Kreis wandern auf Okt | ⏳ User |
| S3 | Über die Welle scrubben, auch Jahresmitte hinter dem Ring | Führungslinie + Tooltip (Monat · IST/Forecast, IST €, Plan €, Treiber-Zeile „B2-Heuristik offen") folgen über dem Ring; Ring blockt nichts (pointer-events:none) | ⏳ User |
| S4 | Welle anklicken | Popup: kumulierte Treppe IST (teal) + Plan (grau), Jahressumme als Held, Legende-Unterzeile; dismissible per ✕, Klick-außen, Escape; Monatsklick → Top-3-Box (Platzhalter) | ⏳ User |
| S5 | Vorjahr vorhanden vs. nicht | **Nur der „entfällt"-Pfad ist live smokebar:** 2025 ist komplett datenlos → keine Goldlinie (korrekt, §9 B6). Der „vorhanden"-Pfad bräuchte einen PM-approved 2025-Income-Seed (analog Sprint 10 A1.5) — nicht eigenmächtig gesetzt | ⏳ User / ⊘ teilweise |
| S6 | Monatswechsel im Header | Kein Layout-Sprung — Ausreißer-Subzeile reserviert ihre Zeilenhöhe permanent (P4) | ⏳ User |
| S7 | Referenzmonat-Sparrate vor/nach | ✅ programmatisch verifiziert (Tabelle §3) — im Browser: Ring Juli 2026 zeigt weiterhin +1.887 € | ✅ / ⏳ User |

## 5. Port-Notiz (Mockup `welle_v1.html` → React/Next)

**1:1 übernommen:** Canvas-Wellen-Mathematik (Bezier-Smoothing, Flächen-/Linien-Pfade, Regime-Gradient, Rot-Clipping unter Null, aktiver-Monat-Doppelkreis, Monats-Labels), Scrub-Logik (nächster Monat zur Cursor-X über volle Breite), Tooltip-Kipp-Geometrie, Popup-Treppe (Stufen-Pfade, vertikale Gradients, B6-Goldlinie `[5,4]` + Gutter-Betrag, Klick-Toleranz 40 px), Glass-Backdrop hinter der Ring-Mitte, Feld-Höhe 392 px, Wellen-Paddings.

**Angepasst:**
- React-Integration: Refs + State statt globaler Variablen; `ResizeObserver` statt `window.resize`; Redraw über `useEffect` auf Daten-/Monats-/Größen-Props; LL-5-Reset (Hover + Popup) bei Datenwechsel.
- Der Ring bleibt die bestehende Sprint-2-SVG-Komponente (Mockup hat eigenes Inline-SVG); Interaktions-Transparenz via `pointer-events:none` auf Ring-Slot + Ring-Stage-Wrapper, Dev-Force-Panel re-aktiviert sie lokal und hängt jetzt absolut unter dem Ring (Zentrierungs-Stabilität).
- Income-Labels sind bei uns klickbar (Income-Split-Trigger §10) — `data-wave-block`-Guard nimmt sie (und das Dev-Panel) vom Popup-Trigger aus; Scrubbing läuft trotzdem über ihre Zone (Event-Bubbling).
- Popup rendert als Sibling der Stage, nicht als Kind — sonst würde der Backdrop-Klick ins Feld bubbeln und das Popup sofort wieder öffnen.
- Treiber-Stub zeigt durchgängig „B2-Heuristik offen" statt der fiktiven Mockup-Beispieldaten (Doku-Patch 3); Struktur/Styling der Anzeige 1:1.
- NICHT portiert (Tooling ≠ Produkt bzw. Spec-Ausschluss): Dev-Panel des Mockups, Opacity-Slider, „OFFEN"-Legende, B-Marker-Fußzeile im Popup, `hpt`-Hover-Punkt (§9 „kein Hover-Punkt" — im Mockup ohnehin toter Code).
- `--wave-opacity` lebt als komponent-lokales CSS-Token auf `.field` (Pattern Sprint-3-E2); `draw.ts` liest es zur Laufzeit via `getComputedStyle` (Canvas kann keine CSS-Vars).

## 6. Selbst-Review Akzeptanzkriterien

| AC | Status |
|---|---|
| A0 build/tsc/lint clean | ✅ (§1) |
| A1 12 Monate EUR, Grenze am letzten realisierten Monat, Zukunfts-Navigation färbt nicht um | ✅ implementiert (D1: `realizedMonthIndex` server-berechnet aus Kalender-„jetzt", nicht aus targetMonth) · Screenshot beim User-Smoke |
| A2 Opacity 0.80 · negativ `#FF453A` · genau ein Kreis | ✅ implementiert (Token `--wave-opacity`; Rot-Overlay; nur aktiver Monat) |
| A3 Scrubbing volle Breite inkl. Jahresmitte, Tooltip + Linie über Ring | ✅ implementiert (Ring pointer-events:none; Guide z-5 / Tooltip z-7) |
| A4 Popup öffnet, dismissible, Treppe IST+Plan, Jahressumme-Held | ✅ implementiert |
| A5 B6 Goldlinie + Gutter-Betrag; datenlos → entfällt | ✅ implementiert · Live nur „entfällt"-Pfad smokebar (§4 S5) |
| A6 Header ohne Layout-Sprung | ✅ implementiert (min-height, nur opacity schaltet) |
| A7 V1-Treppe entfernt, keine doppelte Logik | ✅ `src/components/treppe/` gelöscht (−699 LOC); Kumulation existiert einmalig im Welle-Loader |
| A8 Regression Sparrate unverändert | ✅ (§3) |
| A9 Kein Schema-/RPC-Eingriff | ✅ Diff = nur `src/` + `sprints/`; Loop-only |
| A10 git-Workflow | ✅ (§2) |

## 7. Offene Quirks / Hinweise

1. **B3-Slot bleibt offen** (Cluster 3 nicht zurück): Popup-Held ist fix teal, auch bei kumulativ negativer Jahressumme — Kommentar im Code markiert die Stelle (`popup.tsx`).
2. **N4b** unberührt (Ring-only, Cluster 3).
3. **Regime-Grenze-Lesart:** laufender Monat = realisiert (teal) — mockup-konform implementiert, aber als Doku-Patch 1 zur PM-Bestätigung vorgelegt; Gegenlesart wäre ein Ein-Zeilen-Fix.
4. **NULL-Monate = 0 €** in Welle + Tooltip (Doku-Patch 2) — auf Prod sichtbar als Nulllinie Jan–Apr 2026.
5. **Loop-Perf:** pro Dashboard-Render 36 Sparrate-RPC-Calls (12 IST + 12 Plan + 12 Vorjahr, parallel via `Promise.all`). Beim Build/SSR unauffällig; falls der User-Smoke spürbare Latenz zeigt → PM-Eskalation (B5-Gate), nicht selbst optimieren.
6. **Dev-Panel (nur `NODE_ENV=development`)** hängt unter dem Ring und überlappt dort die Welle — Production-Bundle elidiert es (Hygiene-Grep §1).
7. **Scrubbing über Income-Label-Zonen** zeigt Tooltip/Führungslinie auch dort (volle Breite, bewusst); Klick auf Label öffnet weiterhin nur den Income-Split (Guard).
8. **S5 „Vorjahr vorhanden":** falls gewünscht, PM-Auftrag für einen 2025-Income-Seed (analog Sprint-10 A1.5 inkl. Anker-Dry-Run) — Claude Code hat bewusst nicht geseedet.

## 8. Vorschläge zur CLAUDE.md-Aktualisierung (Vorschlag, keine Ausführung)

- §3 Dateistruktur: `components/treppe/` → entfällt; neu `components/welle/` (index, popup, draw, loader, drivers-stub, types, module.css).
- §4-Protokoll V2: v2-02-Zeile auf 🟢 nach Approval; Hinweis „§4.6-Anker (2910.01) existiert auf Prod-Live-Daten nicht mehr — Referenzmonat-Pattern (Mai/Juni 2026) verwenden".
- Neuer Befund für §7-Wissen: Popup-Overlays, die von einem klick-sensitiven Feld getriggert werden, als Sibling rendern (Event-Bubbling-Falle) — Kandidat für LL-Kodifizierung.

---

## K1 — Korrektur nach User-Smoke (4. Juli 2026)

**Symptome (3 User-Screenshots):** Welle riesig statt hinter dem Ring, überlagert die Karten, nur Jan–Jun sichtbar, Seite scrollt horizontal + vertikal.

**Root Cause 1 (Port-Bug):** `<canvas>` ist ein **Replaced Element** — bei `position:absolute` stretcht `inset:0` nicht auf die Containergröße; `width/height:auto` = intrinsische **Bitmap**-Größe. Da die Bitmap auf `Feldgröße × devicePixelRatio` gesetzt wird, war das Canvas-Element auf Retina (dpr 2) **doppelt so groß wie das Feld**, ankerte oben links und lief nach rechts unten über die ganze Seite. Die Port-Vorlage setzt `cv.style.width/height` explizit im JS — genau diese Zeile war beim Port durch das (für Divs korrekte, für Canvas wirkungslose) `inset:0` ersetzt worden. **Fix:** `.canvas { width:100%; height:100% }`.

**Root Cause 2 (Single Surface):** `main` war seit V1 `min-height:100dvh` — die Seite durfte höher werden als der Viewport. Auf User-Anweisung (Ein Screen ohne Scrollen, §1) jetzt viewport-gebunden: `main { height:100dvh; overflow-y:auto }` (Fallback nur für degenerierte Fenster), Gaps 24→14 / Padding gestrafft, Welle-Stage als flexibles Element (`flex:1 1 280px`, Floor 280px = Ring 248 + Luft) — die Welle adaptiert über den bestehenden ResizeObserver. Header + Welle/Ring + Interaktionszone teilen sich exakt einen Viewport. Hinweis: Im Development-Modus können die NODE_ENV-gated Dev-Panels die Seite über den Viewport drücken (dann greift der Fallback-Scroll); Production ist davon frei.

**Verifikation (Claude Code, Headless Chrome 1437×807 @2x):** Repro-Datei mit beiden Varianten — die Bug-Variante reproduziert die User-Screenshots exakt (Beweis der Diagnose), die Fix-Variante zeigt die Welle im Feld hinter dem Ring, alle 12 Monats-Labels, kein Scroll. `tsc`/`lint`/`build` clean, Bundle unverändert 27.5 kB.

**Commit:** `v2-02 K1: fix — Canvas auf Feldgröße begrenzt + Single-Viewport-Layout`.

**Lesson für CLAUDE.md (Vorschlag):** Replaced Elements (`<canvas>`, `<img>`, `<video>`) in absoluten Overlay-/Hintergrund-Positionen brauchen IMMER explizite `width/height` (CSS oder `style=`) — `inset:0` allein genügt nur für normale Elemente. Verwandt mit LL-6 (Overlay-Clipping), aber eigener Mechanismus.

---

*Sprint v2-02 Review · Antigravity Finance 2.0 · 4. Juli 2026 (K1-Append)*
