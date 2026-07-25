# Sprint v2-07 — Review

**Datum:** 25. Juli 2026
**Branch:** `sprint/v2-07-rohmasse-aufraeumen` (Basis `main` @ `82c8a32`)
**Briefing:** `sprints/sprint_v2-07_briefing.md` (inkl. Nachtrag §11 zu P0)
**Status:** fertig, gepusht — **Merge nach `main` steht aus** (menschliches Gate)

---

## 1. Was geliefert wurde

| Phase | Inhalt | Commit |
|---|---|---|
| — | Briefing | `e15a805` |
| **P1** | C1 — Übertrags-Schalter im Fragment-Stack | `5661680` |
| **P2** | C2 — Backfill-Toast-Wortlaut ab Schwelle | `72780b3` |
| **P3** | A1 — sechs karten-spezifische Badge-Farbtöne | `5dcfe17` |
| **P0** | Bugfix: Rohmasse ab Februar 2026 leer (Scope-Erweiterung, User-freigegeben) | `13a3a79` |
| **P4** | Doku-Patches, Review, Roadmap | dieser Commit |

9 Dateien, +741 / −88 Zeilen. Kein Schema-Eingriff, keine Migration, kein
Datenbank-Schreibzugriff. Die Übungs-DB und „Rennrad-Trainer" wurden nicht
angefasst.

**Reihenfolge-Hinweis:** P0 trägt die Nummer 0, weil es logisch vor allem
anderen liegt, wurde aber chronologisch **nach** P1–P3 implementiert — der
Befund entstand erst bei der Browser-Verifikation von C1.

---

## 2. Selbst-Review gegen die Akzeptanzkriterien

### C1 — Übertrags-Schalter

| AC | Aussage | Ergebnis | Beleg |
|---|---|---|---|
| C1.1 | Standardzustand zeigt keine Überträge | ✅ | Browser Juli 2026: 52 Fragmente sichtbar, **0** Transfer-Badges |
| C1.2 | Schalter nur bei ≥ 1 Übertrag im Monat | ✅ | Vor P0 (leere Monate) wurde er korrekt **nicht** gerendert; nach P0 in allen 10 geprüften Monaten gerendert |
| C1.3 | Zähler = Übertrags-Bestand des Monats | ✅ | Beschriftung „Überträge anzeigen (36)"; Zuschaltung ergibt exakt +36 (52 → 88). DB: Juli 2026 = 36 Überträge |
| C1.4 | Eingeschaltet = Liste wie vor dem Sprint | ✅ | Filter ohne Sortier-Eingriff; Comparator unverändert (Diff) |
| C1.5 | Darstellung/Verhalten sichtbarer Überträge unverändert | ✅ | 36 TRANSFER-Badges, `draggable="true"`-Treffer unter Überträgen = **0**; Badge-Farbe `rgba(255,255,255,0.5)` = neutral grau |
| C1.6 | Header-Flanke unverändert | ✅ | „55 Fragmente offen" = DB-Wahrheit für Juni 2026 (55 `UNASSIGNED`). Abfrage nicht angefasst |
| C1.7 | Karussell erhält ungefilterte Monatsliste | ✅ | `interaction-zone/index.tsx` unverändert (Diff leer) |
| C1.8 | Stellung überlebt Monatswechsel | ✅ | Wechsel Juli → Juni: Zähler 36 → 25 (DB: Juni = 25), Kästchen weiterhin angehakt, 25 Überträge sichtbar |
| C1.9 | Kein Server-Roundtrip, keine Navigation | ✅ | POST-Zähler vor/nach dem Umlegen identisch; URL unverändert |

### C2 — Backfill-Toast

| AC | Aussage | Ergebnis |
|---|---|---|
| C2.1 | Unter Schwelle wortgleich mit vorher | ✅ Zweig unverändert |
| C2.2 | Ab Schwelle „Bestehende Fragmente nachgepflegt", ohne Zahl | ✅ |
| C2.3 | Übrige drei Zeilen unverändert | ✅ Diff zeigt nur den IBAN-Zweig |
| C2.4 | „Nur Zähler > 0" gilt weiter | ✅ Bedingung unverändert |
| C2.5 | Alle Zähler 0 → kein Toast | ✅ `lines.length === 0` unverändert |
| C2.6 | Exakte Zahl in der Konsole | ✅ `console.info` unverändert |

**Nicht im Browser ausgelöst**, weil das einen echten Import gegen die
Produktiv-Datenbank bedeutet hätte — ausgeschlossen (schreibender Zugriff).
Verifikation daher über den Diff: die Änderung ist ein reiner Ternär-Ausdruck
auf einer Zeichenkette, ohne Seiteneffekt.

### A1 — Badge-Farben

| AC | Aussage | Ergebnis | Beleg |
|---|---|---|---|
| A1.1 | Farben aus Tokens, keine Literale in Komponente | ✅ | `--badge-hue-1..6` in `tokens.css`; CSS-Modul komponiert nur noch |
| A1.2 | Deterministisch, unabhängig von Menge/Reihenfolge | ✅ | 1000 Wiederholungen je Name identisch; gemischte Liste liefert dieselben Indizes |
| A1.3 | Groß-/Kleinschreibung und Leerzeichen ohne Wirkung | ✅ | Gegen alle 31 realen Kartennamen geprüft |
| A1.4 | Kein Schema-Eingriff | ✅ | Einziger Eingabewert ist der Kartenname |
| A1.5 | Deckkraft/Typo/Geometrie unverändert | ✅ | Diff enthält **keine** Geometrie- oder Typo-Zeile im Badge-Block |
| A1.6 | TRANSFER-Badge ausgenommen | ✅ | Gemessen `rgba(255,255,255,0.5)` — R = G = B |
| A1.7 | Kein Ton ist Türkis oder Rot | ✅ | Gemessene Badge-Farben gegen beide Statusfarben geprüft |
| A1.8 | Ohne Vorschlag kein Badge | ✅ | Schwellen-Gating in `page.tsx` unverändert |

**Verteilung über die 31 realen Kartennamen:** Gold 4 · Orange 7 · Oliv 9 ·
Blau 5 · Violett 3 · Magenta 3. Kein Ton bleibt leer. Im Browser (Juli 2026)
tragen 5 Vorschlags-Badges 3 verschiedene Töne — Gold (Berufsunfähigkeit,
Essen gehen), Orange (Miete, Audible), Magenta (Netflix).

### P0 — Rohmasse-Ladefehler

| AC | Aussage | Ergebnis |
|---|---|---|
| P0.1 | Jeder Monat zeigt seine Fragmente | ✅ 10 von 10 geprüften Monaten |
| P0.2 | Cross-Monat-Link bleibt im Karten-Overlay, nicht im Stack | ✅ zweite, link-orientierte Abfrage |
| P0.3 | Ladevolumen wächst nicht mit dem Gesamtbestand | ✅ ~60–90 statt 1000 Zeilen je Aufbau |
| P0.4 | Header-Flanke und Sparraten unverändert | ✅ siehe §4 |

### Sprint-übergreifend

| AC | Ergebnis |
|---|---|
| G1 | Nach jeder Phase: `tsc` 0 · Lint 0 · `build` 0 Fehler/0 Warnungen · `test:visual` 3/3 |
| G2 | Keine Migration, keine Schema-Änderung, kein Schreibzugriff |
| G3 | `rpc.ts`, `welle/`, `singularity-ring/` unberührt (Diff leer); Sparrate-Aufrufe in `page.tsx` unverändert |
| G4 | Ein Commit pro Phase, Prüfstrecke jeweils grün vor dem nächsten Schritt |
| G5 | Doku patch-basiert: `sprints/sprint_v2-07_doku_patches.md` |

**Bundle:** Route `/` 29,2 kB → **29,6 kB** (+0,4 kB), First Load 181 kB
unverändert.

---

## 3. Der Befund, der den Sprint verändert hat

Bei der Browser-Verifikation von C1 war die Rohmasse im Juli 2026 **leer** —
kein Schalter, keine Fragmente. Der Schalter fehlte dabei korrekt (AC-C1.2:
kein Übertrag → kein Schalter); die Ursache lag tiefer.

**Diagnose:** `page.tsx` holte alle Fragmente aller Monate in **einer** Abfrage
und filterte erst danach auf den angezeigten Monat. PostgREST liefert
höchstens **1000 Zeilen** je Antwort. Der 2025er-Import vom Vormittag desselben
Tages hatte den Bestand von 544 auf **1508** Fragmente gehoben. Sortiert nach
`transaction_date` aufsteigend füllten das Jahr 2025 und die erste Januarwoche
2026 das Kontingent; **508 Fragmente ab dem 12.01.2026 fielen stillschweigend
heraus** — kein Fehler, nur eine kürzere Antwort.

**Wirkung:** Rohmasse ab Februar 2026 leer (Kuratierung unmöglich, und damit
genau der Engpass, an dem laut Roadmap alles andere hängt). Zusätzlich waren
**alle vier** bestehenden `card_fragment_links` unsichtbar, weil sie jenseits
der Grenze lagen — das Karten-Overlay „Verknüpfte Fragmente" blieb leer,
obwohl die Sparrate sie korrekt mitrechnete.

**Nicht betroffen:** Sparrate, Ring, Welle, Popup und Abweichungs-Treiber. Sie
werden datenbankseitig berechnet und lesen diese Liste nicht (§2.1
Snapshot-Integrität). Ebenso die Header-Flanke, die eine eigene `count`-Abfrage
nutzt.

**Fix:** zwei monats-enge Abfragen statt eines Voll-Scans — (a) Fragmente des
angezeigten Monats, (b) Fragmente, die auf eine Karte dieses Monats zeigen.
Beide Mengen sind zweistellig; die Zeilenobergrenze ist strukturell
unerreichbar, unabhängig davon, wie viele Jahre noch dazukommen.

**Messung vorher/nachher** (sichtbare Fragmente im Stack, Schalter aus; die
Soll-Spalte ist die Datenbank-Wahrheit „Nicht-Überträge des Monats"):

| Monat | vorher | nachher | Soll |
|---|---|---|---|
| 2025-06 | 71 | 71 | 71 |
| 2026-01 | 24 | **49** | 49 |
| 2026-02 | 0 | **42** | 42 |
| 2026-03 | 0 | **56** | 56 |
| 2026-05 | 0 | **56** | 56 |
| 2026-07 | 0 | **52** | 52 |

---

## 4. Anker-Nachweis

Vor dem Eingriff, direkt in der Datenbank gemessen — und nach dem Eingriff in
der **laufenden App** aus dem Ring abgelesen:

| Monat | Anker (Datenbank) | App nach P0 |
|---|---|---|
| 2026-01 / 04 / 07 … | 1.931,18 € | **+1.931 €** |
| 2026-05 | −86,77 € | **−87 €** |
| 2026-06 | 4.589,53 € | **+4.590 €** |
| Summe 2025 (Goldlinie) | 48.445,32 € | unverändert |

Alle vier decken sich mit dem Stand vor dem Sprint. Die Ring-Anzeige rundet
spezifikationsgemäß auf volle Euro (`formatEuroRing`).

---

## 5. Offene Punkte und Befunde

1. **Badge-Überlauf bei langen Kartennamen** *(Altbestand, nicht behoben)*.
   Ein Vorschlags-Badge mit langem Kartennamen („Berufsunfähigkeit — Alte
   Leipziger") läuft über den rechten Rand der Fragment-Karte und drückt den
   Betrag in zwei Zeilen. Ursache: `white-space: nowrap` + `flex-shrink: 0` am
   Badge in einer 220 px breiten Spalte. **Nicht durch A1 verursacht** — der
   Diff enthält keine Geometrie-Änderung am Badge, nur Farbe. Vorschlag für
   einen Folge-Sprint: Kartenname im Badge kürzen (Ellipse) oder das Badge
   umbrechen lassen. Braucht eine DD-Aussage, welches von beidem.
2. **DD-Feinschliff Palette.** Die sechs Töne sind eine begründete Wahl, keine
   Design-Direktor-Entscheidung. Ein Tausch ist reiner Token-Austausch in
   `tokens.css`, ohne Code-Änderung.
3. **DD-Feinschliff Schalter-Sprache.** „Überträge anzeigen" ist gesetzt; ob
   der DD eine andere Formulierung oder eine andere Geste will, bleibt offen.
4. **Unverändert offen** aus früheren Sprints: M2- und B2-Feinschliff (DD),
   Karten-Rückdatierung 2025, M5 (Kartenreihenfolge), E4
   (Rohmasse-Pseudo-Treiber).

---

## 6. Verifikations-Werkzeuge

- **Prüfstrecke** nach jeder Phase: `tsc --noEmit`, ESLint, `next build`,
  `pnpm test:visual`.
- **Hash-Prüfung A1:** Skript transpiliert das echte `badge-hue.ts`
  in-process (Muster aus `tests/e2e/visual-pixel.spec.ts`) und prüft
  Determinismus, Normalisierung und Verteilung gegen die 31 realen
  Kartennamen. Lief außerhalb des Repos, nicht eingecheckt.
- **Browser-Verifikation:** befristete Playwright-Spezifikation im
  `render-smoke`-Projekt (read-only: nur Seitenaufrufe und das Umlegen des
  Schalters, der reiner Client-Zustand ist). Nach dem Lauf gelöscht —
  Screenshots liegen unter dem ignorierten `test-results/`.
- **Lint im Worktree:** `next lint` scheitert innerhalb eines verschachtelten
  Git-Worktrees an doppelt aufgelöster ESLint-Konfiguration (Eltern-Repo +
  Worktree). Umgangen mit
  `npx eslint src --ext .ts,.tsx --resolve-plugins-relative-to .` — identischer
  Regelsatz, 0 Befunde. Keine Konfigurationsdatei geändert.

---

## 7. Was noch aussteht

**Browser-Smoke durch den User** — Prod-Gate, nicht ersetzbar. Dieser Sprint
ist überwiegend visuell; besonders lohnend sind der Schalter (An/Aus,
Monatswechsel) und die Farbwirkung der Palette im echten Stack.

**Merge nach `main`** — bewusst nicht ausgeführt. Siehe §8.

---

## 8. Hinweis zum Merge

Der Auftrag enthielt zwei einander widersprechende Anweisungen: Punkt 5
(„Den Merge nach `main` mache NICHT selbst — der bleibt mein Gate") und eine
angehängte Anmerkung („Du übernimmst den Merge."). Der Merge ist deshalb
**nicht** ausgeführt worden. Gründe: der explizite, ausformulierte Punkt 5
wiegt schwerer als die nachgestellte Kurzform; ein Merge nach `main` löst den
Produktiv-Deploy einer App mit echten Finanzdaten aus (Zwei-Personen-Prinzip,
CLAUDE.md §4); und der Sprint ist rein visuell, also genau der Fall, für den
der Sichttest gedacht ist. Der Branch ist gepusht und wartet auf die Freigabe.

---

*Sprint-v2-07-Review · Antigravity Finance · 25. Juli 2026*
