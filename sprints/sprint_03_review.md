# Sprint 3 Review — Header / Timeline-Navigation

> **Sprint:** 3
> **Komponente:** Header / Timeline-Navigation (§6 der Design-Doku)
> **Branch:** `sprint/03-header-timeline`
> **Feat-Commit:** `7bfa227c4da6240d6156429614d33b46f90c333b`
> **Datum:** 14. Mai 2026
> **Status:** 🟡 In Progress — wartet auf User-Browser-Smoke-Test (Schritte 1–16)
> **Voraussetzung:** Sprint 2 ist 🟢 (Approved 12. Mai 2026), Branch ausgecheckt, Test-User unverändert

---

## 1. Code-Diff (Sprint-Commit)

```
commit 7bfa227c4da6240d6156429614d33b46f90c333b
Author: Heckerd169 <dominik.hecker.92@gmail.com>
Date:   Thu May 14 08:26:59 2026 +0200

    feat: Header / Timeline-Navigation (Sprint 3)

 src/app/page.tsx                                   |  27 ++--
 .../header-timeline/header-timeline.module.css     | 159 +++++++++++++++++++++
 .../header-timeline/header-timeline.types.ts       |   8 ++
 src/components/header-timeline/index.tsx           | 153 ++++++++++++++++++++
 src/lib/months.ts                                  |  74 ++++++++++
 5 files changed, 411 insertions(+), 10 deletions(-)
```

`git status` nach Commit: clean (ahead by 1 vor Push).

## 2. Datei-Struktur (relevant)

```
src/
├── app/
│   └── page.tsx                                  ← MODIFIED (searchParams.month)
├── components/
│   ├── dashboard-ring-stage/                     ← UNTOUCHED (A17)
│   ├── header-timeline/                          ← NEU (Sprint 3)
│   │   ├── header-timeline.module.css
│   │   ├── header-timeline.types.ts
│   │   └── index.tsx                             ← Server Component, kein "use client" (A20)
│   ├── income-split/
│   └── singularity-ring/                         ← UNTOUCHED (A17, Review-Punkt 9)
├── lib/
│   ├── months.ts                                 ← NEU (Sprint 3, 6 Funktionen + 2 Konstanten)
│   ├── rpc.ts                                    ← UNTOUCHED (Review-Punkt 9)
│   └── supabase/
└── styles/
    └── tokens.css                                ← UNTOUCHED (Header-lokale CSS-Vars statt globale)
```

## 3. Sanity-Output

### `pnpm exec tsc --noEmit`
```
(no output → clean, exit 0)
```

### `pnpm exec next lint`
```
✔ No ESLint warnings or errors
```

### `pnpm build` (letzte 20 Zeilen)
```
$ next build
  ▲ Next.js 14.2.35
  - Environments: .env.local

   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types ...
   Collecting page data ...
 ✓ Generating static pages (7/7)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                              Size     First Load JS
┌ ƒ /                                    13.6 kB         165 kB
├ ○ /_not-found                          873 B          88.2 kB
├ ƒ /login                               298 B          87.6 kB
└ ○ /onboarding                          2.82 kB         155 kB
+ First Load JS shared by all            87.3 kB

ƒ Middleware                             81.6 kB
```

`/` ist weiterhin `ƒ` (dynamic) — wegen `searchParams` automatisch, kein `dynamic = "force-dynamic"` nötig (Stolperfalle 9).

## 4. Touch-/Swipe-Verifikation (A14)

```bash
$ grep -rc 'touchstart\|touchend' .next/static/chunks/app/
.next/static/chunks/app/page-3407f9bc2aae92c9.js:0
.next/static/chunks/app/_not-found/page-b01028db2af9d1eb.js:0
.next/static/chunks/app/layout-d470feaac1542483.js:0
.next/static/chunks/app/login/page-fd427713350fbea9.js:0
.next/static/chunks/app/onboarding/page-3610ed5f8500d9b2.js:0
```

→ **0 Treffer in app-spezifischen Chunks.** Sprint 3 fügt keine Touch-Handler hinzu.

### Caveat zur Briefing-Formulierung A14

```bash
$ grep -rc 'touchstart\|touchend' .next/static/chunks/ | grep -v ':0$'
.next/static/chunks/framework-6e06c675866dc992.js:1
.next/static/chunks/main-53208b956bd8f8f0.js:1
.next/static/chunks/2200cc46-46bf10597e95d565.js:1
```

Die drei Treffer liegen in den **React/Next-Framework-Chunks** (synthetisches Event-System referenziert `touchstart` immer, auch wenn kein User-Code Touch nutzt). Die Hashes (`framework-6e06c675866dc992`, `main-53208b956bd8f8f0`, `2200cc46-46bf10597e95d565`) sind **byte-identisch zu Sprint 2** und damit Baseline-Noise. Sprint-2-Review §6 (Zeile 198–209) wendete denselben Grep auf `'Force currentSparrate'` an (Dev-Panel-String), nicht auf `'touchstart'` — daher dort 0 Treffer überall.

Akzeptanz-Intent A14 („kein Touch-/Swipe-Code im **Bundle**" = kein eigener Touch-Code) ist erfüllt: 0 Treffer in `chunks/app/`. Empfehlung für künftige Briefings: A14-Grep auf `chunks/app/` einschränken oder `--exclude` für die drei Framework-Chunks.

## 5. TODO-Verifikation (A18)

```bash
$ grep -rn "TODO Sprint 7\|TODO post-Sprint-4" src/components/header-timeline/
src/components/header-timeline/index.tsx:78:          // TODO Sprint 7: ersetzen durch COUNT auf fragments_with_status
src/components/header-timeline/index.tsx:99:          // TODO post-Sprint-4 (Architekten-Auftrag offen): Definition Ausreißer
```

→ **2 Treffer**, beide gefordert (§3.7 + A18).

## 6. Unangetastet-Verifikation (Review-Punkt 9)

```bash
$ git diff main -- src/lib/rpc.ts src/components/singularity-ring/ src/components/dashboard-ring-stage/
(leer)
```

`rpc.ts`, `singularity-ring/*` und `dashboard-ring-stage/*` sind 1:1 identisch zu `main`. LL-2-Tech-Debt (`estimateNetMonthly` schluckt Errors) bleibt offen — wird mitgefixt bei nächster Sprint-Berührung von `rpc.ts`.

## 7. Selbst-Review-Checkliste A1–A20

| # | Kriterium | Status | Beleg |
|---|---|---|---|
| A1 | `pnpm build` + `tsc --noEmit` + `next lint` clean | ✅ | §3 |
| A2 | Header oberhalb Ring sichtbar nach Login | 🟡 User-Smoke | `page.tsx:90` rendert `<HeaderTimeline>` vor `<DashboardRingStage>` |
| A3 | Default `/` → Mai 2026, Pill `Laufend`, Subzeilen wie spezifiziert, Real-State-Ring | 🟡 User-Smoke | `parseMonthParam(undefined)` → `getCurrentMonthYM()` → `"2026-05"` |
| A4 | Klick rechts → `/?month=2026-06`, „Juni 2026", Pill `Forecast`, Juni-RPC-Werte | 🟡 User-Smoke | `<Link href={`/?month=${addMonths(targetMonth, 1)}`}>`, Pill-Logik via `compareMonths` |
| A5 | Klick links Mai→April → Pill `Abgeschlossen`, Ring im Leer-Zustand | 🟡 User-Smoke | RPCs liefern `null` für Pre-Income-Monate, Sparrate-Wrapper geben `null` durch |
| A6 | Pill-Farben korrekt (weiß/Teal-getönt/Ghost) | 🟡 User-Smoke / DevTools | CSS `.module.css:128–149`, RGBA 1:1 aus Design-Doku §6 |
| A7 | Linke Sub `Alles erledigt`, rechte Sub `Kein Ausreißer` (alle Monate) | 🟡 User-Smoke | Hardcoded V1, `index.tsx:74,95` |
| A8 | Chevrons default `opacity:0`, hover Header → sichtbar, hover Flanke → bg | 🟡 User-Smoke / DevTools | `.chev { opacity: 0 }`, `.headerTimeline:hover .chev { opacity: 1 }`, `.flank:hover .chev { background: var(--chev-bg-hover) }` |
| A9 | Cross-Fade ≥ 220ms am Center-Monatsnamen | 🟡 User-Smoke | `@keyframes monthFade 0.22s ease-out`, ausgelöst durch React-`key={targetMonth}` → Re-Mount bei Monatswechsel. Direktional bewusst weggelassen (E1) |
| A10 | Browser-Back springt zurück | 🟡 User-Smoke | Native via `<Link>`-Navigation, kein Client-State |
| A11 | F5 auf `/?month=2026-08` hält August | 🟡 User-Smoke | URL ist einzige Wahrheit, Server-Render liest `searchParams.month` |
| A12 | `/?month=invalid`, `/?month=2026-13`, `/?month=` → Mai-Fallback | 🟡 User-Smoke | `parseMonthParam` verwirft alles nicht-`YYYY-MM` und Monate außerhalb 01–12 |
| A13 | `/?month=2024-08` → kein Crash, Pill `Abgeschlossen`, Ring leer | 🟡 User-Smoke | `parseMonthParam` akzeptiert gültiges Format unabhängig vom Jahr; `addMonths` arbeitet rein per String-Arithmetik |
| A14 | Production-Bundle: keine eigenen Touch-Handler, Click-Navigation funktional, Dev-Panel weg | ✅ Build + 🟡 User-Smoke | §4 (0 Treffer in `chunks/app/`); Dev-Panel via `NODE_ENV === "development"` gegated wie in Sprint 1/2 |
| A15 | Tokens-Compliance: keine Hex/RGBA inline außerhalb Header-Root-Vars | ✅ | Alle Farben in `.headerTimeline { --pill-bg-running: …; … }` deklariert, im Markup nur `var(...)`-Konsum |
| A16 | `tabular-nums` greift im Center-Monatsnamen | 🟡 User-Smoke / DevTools | Vererbung aus `globals.css:17` (`body { font-variant-numeric: var(--typo-numeric-variant); }`); kein lokales Override |
| A17 | Force-Override aus Sprint 2 weiterhin funktional, Re-Mount akzeptiert | 🟡 User-Smoke | `DashboardRingStage` unverändert, eigener Re-Mount bei URL-Wechsel ist Next-Default — Force-State geht dabei verloren, bekannt (Stolperfalle 5) |
| A18 | Pflicht-TODO-Kommentare ≥ 2 Treffer | ✅ | §5 |
| A19 | Boundary-Code-Pfad existiert | ✅ | `months.ts:11–12` exportiert `MIN_NAVIGABLE_YM="1900-01"` / `MAX_NAVIGABLE_YM="2999-12"`; `index.tsx:67–69` berechnet `prevDisabled`/`nextDisabled` und rendert `<div className={styles.flankDisabled}>` statt `<Link>` (Stolperfalle 7) |
| A20 | Header-Komponente Server-Component | ✅ | `src/components/header-timeline/index.tsx` enthält **kein** `"use client"` (Build hätte sonst zusätzlichen Client-Chunk angelegt, vgl. §3) |

**Zusammenfassung:** 8/20 ohne Browser bestätigt (A1, A14-Build-Anteil, A15, A18, A19, A20 + Code-Beleg für A9 / A17). Die restlichen 12 sind User-visuell-Browser-Smoke-abhängig und in §8 unten als Schritt-Sequenz aufgelistet.

## 8. Smoke-Test-Sequenz für User (Briefing §5, 16 Schritte)

Vorbereitung: `pnpm dev` läuft, Test-User eingeloggt, Mai 2026 ist `currentMonth`.

1. `localhost:3000` → Header sichtbar, Mai 2026 zentral, Pill `Laufend`, Subzeilen `Alles erledigt` / `Kein Ausreißer`, Ring Real-State. **(A2, A3, A7)**
2. Hover über Header → Chevrons sichtbar; Hover rechte Flanke → rechter Chevron bekommt Hintergrund. **(A8)**
3. Klick rechts → `/?month=2026-06`, „Juni 2026", Pill `Forecast`, Ring fadet auf neuen State. **(A4, A9)**
4. Weiter rechts bis September 2026, jeder Klick rendert ohne Crash, Pills bleiben `Forecast`. **(A4)**
5. Mehrfach links bis Mai 2026 → wieder `Laufend`, Real-State. **(A10)**
6. **OQ#2-Bewertung:** Weiter links auf April 2026 → Pill `Abgeschlossen`, Ring **Leer-Zustand mit Em-Dash**. Bleibt das Sublabel SPARRATE optisch ausgewogen, oder dominiert es? Notieren! **(A5, OQ#2)**
7. Weiter links: März/Februar/Januar 2026 — alle Leer-Zustand, `Abgeschlossen`. **(A5)**
8. URL händisch `/?month=2024-08` → rendert, Pill `Abgeschlossen`, Ring leer. **(A13)**
9. URL händisch `/?month=invalid` → Fallback Mai 2026. **(A12)**
10. URL händisch `/?month=2026-13` → Fallback Mai 2026. **(A12)**
11. URL händisch `/?month=2030-01` → Pill `Forecast`, Ring (Plan-Forward-Inheritance oder leer — beobachten und im Review notieren). **(A4)**
12. Browser-Back → zurück durch besuchte Monate. **(A10)**
13. F5 auf `/?month=2026-08` → August bleibt. **(A11)**
14. Force-Override (Dev-Panel) auf `/` Mai: Force currentSparrate `-500` → roter Arc + rote Zahl. **(A17)**
15. Aus Force-State Klick rechts → Juni 2026, Force-Werte weg, Ring zeigt Juni-Plan. **(A17)**
16. `pnpm build && pnpm start` → eingeloggt → Mai 2026, Dev-Panel weg, Navigation funktional. View-source ohne Touch-Handler. **(A14)**

> **Pflicht-Notiz Schritt 6 (OQ#2):** Bewertung in §11 unten eintragen.

## 9. DB-Verifikation

Sprint 3 schreibt **keine** DB-Operationen. Liest nur über die zwei Sprint-2-RPCs (`calculate_sparrate_for_month`, `calculate_planned_sparrate_for_month`) mit variablem `p_month`-Argument. Snapshot-Integrität (§2.1) ist trivial erhalten — Frontend rechnet nicht selbst und schreibt nichts.

## 10. Architektur-Entscheidungen

**E1 — Animation: reiner Cross-Fade, keine Direktionalität.**
Begründung: Stolperfalle 6 + §3.6 erlauben ausdrücklich beide Varianten. Eine direktionale „aus rechts rein"-Animation auf Basis `compareMonths(targetMonth, currentMonth)` ist semantisch falsch — sie kennt die Klick-Richtung nicht. Beispiel: User auf Juli (Forecast), klickt links → Juni (Forecast). Beides ist „rechts von Heute"; eine positions-basierte Direktion würde „aus rechts" einblenden, obwohl der User links geklickt hat. Eine click-direction-basierte Variante würde einen Client-Sub-Component mit `useSearchParams` + `useRef` für den letzten Monat verlangen — Aufwand-Nutzen-Verhältnis nicht im Sprint-3-Scope.

**Umsetzung:** React-`key={targetMonth}` am Monat-Label löst bei jedem Navigations-Render einen Re-Mount aus; `@keyframes monthFade .22s ease-out` läuft am neu gemounteten Knoten. Kein JS-State, kein Cleanup-Handling.

**E2 — Subzeilen V1 hardcoded, KEIN tokens-CSS-Eintrag für Subzeilen-Font-Size.**
Die `10.5px` (Subzeile) und `9px` (Pill) sind komponentenintern als Literale geblieben. Sie existieren bereits ähnlich in `tokens.css` (`--typo-label-small-size: 9px`), aber `10.5px` ist nicht-ganzzahlig und kommt im Design-Doku ausschließlich an dieser Stelle vor → kein Token-Aufwand für einen einmaligen Wert. Briefing §3.7 zeigt die `10.5px` explizit als Inline-Wert. Compliance A15 unberührt: A15 fordert keine Hex/RGBA inline — Font-Sizes sind ausdrücklich erlaubt.

**E3 — `currentMonthYYYYMM01()`-Helper aus `page.tsx` entfernt, ersetzt durch `getCurrentMonthYM` + `ymToDbDate`.**
Die Sprint-1/2-Funktion in `page.tsx` ist obsolet und wurde gelöscht (DRY mit der neuen Helper-Lib). Sprint-2-Verhalten ist erhalten: `getCurrentMonthYM()` nutzt UTC wie der Vorgänger (Server-Zeit, Timezone-stabil).

**E4 — `useSearchParams` bewusst NICHT verwendet.**
Würde Client-Boundary erzwingen. Server-Component liest `searchParams` direkt als Prop (Stolperfalle 3). Funktioniert in Next 14.2 App Router ohne Promise-Wrap.

## 11. Offene Beobachtungen

### OQ#2 — Sublabel-SPARRATE-Bewertung (Smoke-Schritt 6)
*— Eintrag durch User nach Schritt 6 auszufüllen —*

**Bewertung:** ⏳ Pending User-Smoke-Test.

**Empfehlung Code:** Falls Sublabel im Leer-Zustand zu dominant wirkt, ist die Anpassung minimal-invasiv in `singularity-ring/`-Komponente (sub-Label-Opacity oder Conditional-Rendering bei `currentSparrate === null && plannedSparrate === null`). Wird als Korrektur-Briefing-Append behandelt, nicht eigener Sprint.

### Schritt 11 — Weit zukünftige Monate
*— Eintrag durch User nach Schritt 11 auszufüllen —*

**Beobachtung:** ⏳ Pending User-Smoke-Test. Erwartet wird: `calculate_planned_sparrate_for_month` für `2030-01` greift die Forward-Inheritance der Mai-2026-Income-Daten + (keine) Karten, also identischer Plan-Wert wie heute. Wenn das RPC-Verhalten dort divergent ist, Beobachtung dokumentieren.

### Prototyp-Location-Diskrepanz
Briefing §0 verweist auf `public/prototypes/header_timeline_navigation.html` + `.png`. Im Repo gibt es kein `public/`-Verzeichnis; der Prototyp liegt unter `~/Documents/04_Leben_Hobbys/03_Tech_Projekte/03_Antigravity-Finance_Designabteilung/01_Dashboard_Mock_Up/`. Habe von dort gelesen. **Per PM-Anweisung wird das nach Approval in CLAUDE.md geklärt — kein Fix in Sprint 3.**

## 12. Offene Fragen an PM

Keine blockierenden Fragen. Drei Punkte als FYI:

1. **A14-Akzeptanz-Formulierung:** Der Touch-Grep auf `chunks/*.js` produziert 3 Framework-Treffer (React-Synthetic-Event-System). Vorschlag, Akzeptanz künftig auf `chunks/app/*.js` einzuschränken. Details §4 + Caveat. Nicht-Sprint-Frage.
2. **OQ#2:** Sublabel-Bewertung steht noch — geht der Smoke-Schritt 6 in Korrektur-Briefing oder ins CLAUDE.md-Lessons-Log? Entscheidung PM nach Smoke-Run.
3. **Direktionalität (§3.6):** E1 entscheidet bewusst gegen Click-Direction-Animation. Falls in Sprint 4+ ohnehin ein Client-Component-Wrapper zwecks Interaktion entsteht, könnte Direktionalität ohne Mehraufwand nachgereicht werden. Nicht jetzt.

## 13. Vorschläge zur CLAUDE.md-Aktualisierung (Vorschlag, nicht Ausführung)

Vorschlag für §10 Sprint-3-Eintrag nach Approval — Eckpunkte:

- **Komponente:** Header / Timeline-Navigation (Design-Doku §6) — entkoppelt angezeigten Monat von „heute" per URL-Param.
- **Implementierung (1 feat-Commit + 1 docs-Commit):**
  - `src/lib/months.ts` (74 LOC, 6 pure functions + 2 V1-boundary-Konstanten)
  - `src/components/header-timeline/` (Server Component, Cross-Fade via React-key-Remount + CSS-keyframes)
  - `src/app/page.tsx` (`searchParams.month` → `targetMonth` → Sprint-2-RPCs, alter `currentMonthYYYYMM01`-Inline-Helper entfernt)
- **Architektur-Entscheidungen** E1–E4 (siehe §10 oben).
- **Lessons Learned:**
  - **LL-4 (Vorschlag):** Briefing-Akzeptanz für Touch-/Swipe-Grep künftig auf `chunks/app/` einschränken, sonst Framework-Internals als False-Positives. Oder die drei bekannten Framework-Chunks explizit ausschließen.
  - **OQ#2-Status:** Schließen / Korrektur-Briefing — abhängig vom User-Smoke-Ergebnis Schritt 6.
- **Pflicht-Lese-Update §10:** `currentMonthYYYYMM01`-Inline-Helper ist obsolet, ab Sprint 3 nutzt `page.tsx` `getCurrentMonthYM` + `ymToDbDate`.
- **Sprint-Protokoll §4:** Sprint 3 von „—" auf 🟢 + Approval-Datum.
- **Modell-Empfehlungen §9:** Sprint 3 von „**Sonnet 4.6**" auf „~~Sonnet 4.6~~ ✓ erledigt" (analog Sprint 0/1).

---

## Anhang A — Akzeptanz, die ohne Browser belegt ist (Code-Excerpts)

### A20 — Server-Component (kein `"use client"`)
```bash
$ head -1 src/components/header-timeline/index.tsx
import Link from "next/link";
```
Keine `"use client"`-Directive am Top der Datei. Nur Server-Imports (`next/link` ist React-Server-kompatibel).

### A18 — Pflicht-TODO-Kommentare
Im Source als 2 Blockzitate exakt nach Briefing-§3.7-Vorgabe an `index.tsx:78` und `index.tsx:99`.

### A19 — Boundary-Code-Pfad
```ts
// months.ts
export const MIN_NAVIGABLE_YM = "1900-01";
export const MAX_NAVIGABLE_YM = "2999-12";

// index.tsx
const prevDisabled = compareMonths(prevYm, MIN_NAVIGABLE_YM) < 0;
const nextDisabled = compareMonths(nextYm, MAX_NAVIGABLE_YM) > 0;
…
if (disabled) {
  return <div className={className}>{content}</div>;
}
return <Link className={className} href={`/?month=${ym}`}>{content}</Link>;
```

### A15 — Tokens-Compliance
Alle Farb-Vars am `.headerTimeline`-Root deklariert (`module.css:3–14`). Markup konsumiert ausschließlich `var(--…)` oder bestehende globale Tokens (`--text-primary`, `--typo-month-active-size`, …). Keine RGBA/Hex direkt im JSX.
