# Sprint v2-01 — Review (Bug-Sprint N1–N4a)

> **Von:** Claude Code (Implementierungs-Chat)
> **An:** PM-Chat V2 (Opus 4.7)
> **Branch:** `sprint/v2-01-bugfix-n1-n4`
> **Datum:** 26. Juni 2026 · **Modell:** Opus 4.8 (Sonnet-4.6-Komfortzone laut §8, ohne Eskalation gelöst)
> **Option A:** reine UI-/Loader-Fixes, kein Schema-Eingriff, direkt gegen Prod.

---

## 1. Sanity-Output (A0)

| Check | Ergebnis |
|---|---|
| `npx tsc --noEmit` | ✅ No errors found |
| `pnpm lint` (`next lint`) | ✅ No issues found |
| `pnpm build` | ✅ Compiled successfully · 7/7 static pages |
| Route `/` Bundle | **26.2 kB / 178 kB First Load** — **unverändert** ggü. Sprint-10-Baseline (26.2 kB / 178 kB) |

Kein Schema-Eingriff, keine RPC-Berührung, keine Migration (A3 eingehalten).

## 2. Commits (LL-14, phasen-sequenziell, 1 Commit/Phase)

```
0fe1085 docs: sprint v2-01 doku patches (n1 §8 month-scope, n3 §7 name overflow)
a10c59e sprint-v2-01 p4: de-duplicate +/- sign in ring %-subline (n4a)
6f8f42c sprint-v2-01 p3: clip long card name within card bounds (n3)
1bffbc3 sprint-v2-01 p2: pin carousel card slot to 136px (n2)
5a7ae11 sprint-v2-01 p1: month-filter fragment stack by transaction_date (n1)
```

Diff gesamt (vs. Branch-Basis `59ee20d`): **5 Dateien, +106 / −3**
(4× `src/`, 1× `sprints/` Doku-Patch). `git status` nach Commits: nur die
untracked V2-Referenz-Artefakte des PM (Design-Doku v3.1, Briefing, Welle-
Prototypen) — keine davon ist Teil dieses Sprints.

---

## 3. Code-Lokalisierungs-Notiz pro Bug (LL-11)

### N1 — Fragment-Stack-Monatsfilter · `src/app/page.tsx`

- **Lokalisierung:** Der Stack-Loader lud `fragments_with_status` ohne
  `targetMonth`-Filter (alle Monate). Sprint-5-E5 hatte „Rohmasse = alle Monate"
  als Interpretation von §8 gesetzt; N1 korrigiert auf Single-Surface „ein Monat".
- **Fix:** Neue abgeleitete Liste
  `monthFragments = fragments.filter(f => f.transaction_date.slice(0,7) === targetMonth)`,
  die an `<InteractionZone>` (Stack **und** Karussell-Overlay) übergeben wird.
  String-Vergleich `"YYYY-MM"` → timezone-stabil, keine `new Date()`-Konstruktion
  (Regel 9).
- **Bewusste Abweichung vom Briefing-Vorschlag (query-level `date_trunc`):** Die
  **volle** `fragments`-Liste bleibt für `linkedByCardId` erhalten. Ein
  query-seitiger `transaction_date`-Filter hätte Cross-Monat-Links zerstört
  (Fragment mit `assigned_month = targetMonth`, aber `transaction_date` in
  anderem Monat → §4.7) und damit den **visuellen** Bezahlt-/Erhalten-Status
  betroffener Karten (Sprint-6-K1: `manuallyPaid || hasFragment`). Der JS-Filter
  trifft nur die Anzeige der Rohmasse, nicht die Karten-Verknüpfung. **Sparrate
  unberührt** — die RPCs lesen `card_fragment_links`, nicht den Stack.

### N2 — Karten-Slot-Breite · `src/components/interaction-zone/interaction-zone.module.css`

- **Lokalisierung:** Flex-Item ist `.dropTargetWrap` (umhüllt jede `.card`), bisher
  nur `flex-shrink: 0` ohne fixe Basis. `.card` selbst ist `width: 136px`, aber
  der Wrapper hatte keine harte Breite.
- **Fix:** `.dropTargetWrap { flex: 0 0 136px }` (grow 0 / shrink 0 / basis 136px).
  Der Slot kann bei langem Inhalt weder wachsen noch schrumpfen; Design §7 „Breite
  136px" technisch erzwungen.

### N3 — Kartenname-Overflow · `src/components/cards/cards.module.css`

- **Lokalisierung:** `.cardName` hatte keine Overflow-Behandlung → langer Name
  lief horizontal über den Kartenrand bzw. brach mehrzeilig um.
- **Fix:** `.cardName { white-space: nowrap; overflow: hidden; text-overflow: ellipsis }`
  — eine Zeile, Ellipsis, identisch zum etablierten `.fragmentDesc`/`.linkedRowDesc`-
  Pattern. **`overflow` bleibt auf `.cardName` beschränkt — NICHT auf `.card`**
  (Sprint-4 E3: `overflow:hidden` auf `.card` würde Kontext-Icon + Tap-Catcher
  clippen).
- **Zusammenspiel N2+N3:** Slot fix 136px (N2) + Name einzeilig geklippt (N3) →
  die Karte streckt sich weder horizontal noch vertikal.

### N4a — Ring-%-Subzeile Vorzeichen · `src/components/singularity-ring/index.tsx`

- **Lokalisierung:** `computeRingState`, „über Plan"-Zweig:
  `` `+${formatPct((pct - 1) * 100)} % über Plan` ``. Bei **negativem Plan-Nenner**
  (`plan < 0 ≤ current` → `current > plan`, aber `pct < 1`) wird `(pct-1)*100`
  negativ; `formatPct` hängt dann ein `−` an → Anzeige `+−X %` (doppeltes Vorzeichen).
- **Fix:** `` `+${formatPct(Math.abs((pct - 1) * 100))} % über Plan` `` — das Prefix
  `+` ist die einzige Vorzeichen-Quelle. Konsistent mit dem Defizit-Zweig, der
  bereits `MINUS + Math.abs(...)` nutzt. **Reines Anzeige-Fix, keine Berechnungs-
  Änderung.**
- **N4b NICHT entschieden (A4):** Ob bei winzigem/negativem Plan-Nenner gecappt
  oder anders dargestellt wird, bleibt Cluster 3 (Design-Direktor) vorbehalten.

---

## 4. Regressionswächter (A5) — Sparrate unverändert

**By construction:** Keiner der vier Fixes berührt eine Sparrate-Quelle —
N1/N4a sind Anzeige (Stack-Filter / Anzeige-String), N2/N3 sind CSS. Die Sparrate
kommt ausschließlich aus den RPCs `calculate_sparrate_for_month` /
`calculate_planned_sparrate_for_month` (server-seitig, in diesem Sprint nicht
angefasst). Der §4.6-Anker (`2910.01` für März 2026) und alle Monats-Sparraten
sind damit per Konstruktion stabil.

> **Browser-Wächter (User, auf Prod):** Bitte S0/S4 unten ausführen — Sparrate
> aktueller Monat + ein abgeschlossener Monat **vorher** notieren, nach allen
> Fixes erneut prüfen → muss identisch sein.

## 5. Smoke-Sequenz (Browser, User, direkt auf Prod)

| # | Aktion | Erwartung | Sparrate vorher | Sparrate nachher | ✓/✗ |
|---|---|---|---|---|---|
| S0 | Sparrate aktueller Monat + ein abgeschlossener Monat notieren | Referenzwerte | ___ / ___ | — | — |
| S1 | Monat mit Fremd-Monats-Fragmenten öffnen | Stack zeigt **nur** diesen Monat (alle zugehörigen Fragmente, unzugeordnet oben / gedimmt unten) | — | — | ☐ |
| S2 | Monat mit Langname-Karte | Karte exakt 136px (DevTools Computed), Name 1 Zeile + Ellipsis | — | — | ☐ |
| S3 | Monat mit kleinem/negativem Plan-Nenner, Ring betrachten | Subzeile zeigt **ein** Vorzeichen (kein `+−`) | — | — | ☐ |
| S4 | Referenzmonate aus S0 erneut prüfen | Sparrate **unverändert** | (S0) | ___ / ___ | ☐ |

**Repro-Hinweis (Briefing §2):** Falls S1 (kein Fremd-Monats-Fragment im aktuellen
Datenstand) oder S3 (kein Monat mit negativem Plan-Nenner) auf Prod nicht
auslösbar ist → gegen den Code-Pfad verifiziert (siehe §3), im Smoke als „n/a —
Code-Pfad" markieren.

---

## 6. Offene Quirks / PM-Hinweise

1. **Cross-Monat-Drop entfällt (N1-Folge — PM-Bestätigung erbeten).** Mit der
   Monatsskopierung des Stacks ist der **manuelle** Drag eines Fremd-Monats-
   Fragments auf eine Karte des angezeigten Monats (Sprint-5 E5 / §7 Konflikt 4)
   nicht mehr möglich — Fremd-Monats-Fragmente stehen nicht mehr im Stack. Die
   **Auto-Absorption** beim CSV-Import (§4.7, server-seitig) bleibt voll funktional.
   Details + Spec-Anker in `sprint_v2-01_doku_patches.md` (Patch 1). Falls der
   manuelle Cross-Monat-Drop erhalten bleiben soll → eigener Design-Direktor-Punkt.

2. **Pre-existing Bundle-Quirk (NICHT v2-01, kein Regress).** Der Sprint-1-
   `DashboardDevPanel` (`src/app/dashboard-dev-panel.tsx`, NODE_ENV-gated via
   `{showDevTriggers && …}` in `page.tsx`) wird **nicht** aus dem Production-Bundle
   tree-geshaked — `chunks/app/page-*.js` enthält die `[DEV] ICH/PARTNER`-Buttons.
   Verifiziert: Import + Gating + Strings existieren **byte-gleich** an der Branch-
   Basis `59ee20d`; v2-01 ändert die Dev-Panel-Verkabelung nicht (A7: **keine
   neuen** Dev-Helper-Strings ✅). Die historischen „0-Treffer"-Greps galten den
   *Portal*-Dev-Buttons (Interaction-Zone, korrekt tree-geshaked) und dem Ring-
   Force-Override (`Force currentSparrate` → 0 Treffer, weiterhin sauber), nicht
   dem Dashboard-Dev-Panel. **Empfehlung:** eigener Mini-Cleanup-Sprint (Server-
   Component-DCE des Dashboard-Dev-Panels), nicht in v2-01-Scope.

3. **N4b / N5 bewusst offen (A4).** N4b (Cap-/Darstellungs-Strategie bei winzigem
   Plan-Nenner) und N5 (Rohmasse-Farbton) bleiben Design-Direktor Cluster 3 —
   nicht eigenmächtig entschieden.

---

## 7. Doku-Patches (LL-16, A6)

`sprints/sprint_v2-01_doku_patches.md` — 2 Patches als Anker + Patch-Satz:
- **Patch 1** §8 Fragment-Stack: Monats-Scope (`transaction_date` = angezeigter
  Monat) + Konsequenz Cross-Monat-Drop.
- **Patch 2** §7 Gemeinsame Basis: Kartenname-Overflow (einzeilig, Ellipsis,
  innerhalb 136px).

Claude Code hat die Design-Doku **nicht** selbst editiert (Regel 14).

---

## 8. Vorschlag CLAUDE.md-Aktualisierung (Vorschlag, keine Ausführung)

> §4 / V2-Sprint-Log um Eintrag ergänzen:

```
### Sprint v2-01 · (Status: Review) 26. Juni 2026
Komponente: Bug-Sprint N1–N4a (Option A, kein Schema-Eingriff). Branch
sprint/v2-01-bugfix-n1-n4. 5 Phase-Commits (P1 N1 Stack-Monatsfilter, P2 N2
Karten-Slot 136px, P3 N3 Kartenname-Ellipsis, P4 N4a Ring-Vorzeichen-De-Dup,
P5 Doku-Patches). tsc/lint/build clean, Bundle 26.2 kB unverändert, Sparrate
by-construction stabil (RPCs unberührt). Offen: Cross-Monat-Drop-Entfall
(N1-Folge, PM-Bestätigung), pre-existing Dashboard-Dev-Panel-Bundle-Quirk
(eigener Cleanup), N4b/N5 → Cluster 3.
```

Eskalations-Heuristik §9: nicht ausgelöst — Fixes diagnostisch klar, kein
zweiter Fix-Versuch nötig.
