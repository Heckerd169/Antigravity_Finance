# Sprint 2 — Review

> **Sprint:** 2 — Singularity Ring
> **Branch:** `sprint/02-ring`
> **Datum:** 12. Mai 2026
> **Modell:** Opus 4.7
> **Status:** 🟡 IN PROGRESS — wartet auf Browser-Smoke-Test durch User

---

## 1. Code-Diff (git status nach `feat:`-Commit)

```
$ git status
* sprint/02-ring...origin/sprint/02-ring [ahead 1]
clean — nothing to commit
```

`feat:`-Commit `9d1a2f3`:

```
src/app/page.tsx                                                  (mod)
src/components/dashboard-ring-stage/dashboard-ring-stage.module.css  (neu)
src/components/dashboard-ring-stage/index.tsx                     (neu)
src/components/singularity-ring/index.tsx                         (neu)
src/components/singularity-ring/singularity-ring.module.css       (neu)
src/components/singularity-ring/singularity-ring.types.ts         (neu)
src/lib/rpc.ts                                                    (mod)
```

7 Dateien · +551 / −1.

## 2. `tree src/`

```
src/
├── app/
│   ├── actions/
│   │   └── auth.ts
│   ├── dashboard-dev-panel.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── login/
│   │   ├── actions.ts
│   │   ├── login.module.css
│   │   └── page.tsx
│   ├── onboarding/
│   │   ├── actions.ts
│   │   ├── onboarding-form.tsx
│   │   ├── onboarding.module.css
│   │   └── page.tsx
│   ├── page.module.css
│   └── page.tsx                                                  (mod)
├── components/
│   ├── dashboard-ring-stage/                                     (neu)
│   │   ├── dashboard-ring-stage.module.css
│   │   └── index.tsx
│   ├── income-split/
│   │   ├── actions.ts
│   │   ├── income-split.module.css
│   │   ├── income-split.types.ts
│   │   └── index.tsx
│   └── singularity-ring/                                         (neu)
│       ├── index.tsx
│       ├── singularity-ring.module.css
│       └── singularity-ring.types.ts
├── lib/
│   ├── rpc.ts                                                    (mod)
│   └── supabase/
│       ├── client.ts
│       ├── middleware.ts
│       ├── server.ts
│       └── types.ts
├── middleware.ts
└── styles/
    └── tokens.css
```

## 3. Build- und Typecheck-Output

### `pnpm exec tsc --noEmit`

```
TypeScript: No errors found
```

### `pnpm exec next lint`

```
✔ No ESLint warnings or errors
```

### `pnpm build` (letzte 20 Zeilen)

```
   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/7) ...
   Generating static pages (1/7)
   Generating static pages (3/7)
   Generating static pages (5/7)
 ✓ Generating static pages (7/7)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                              Size     First Load JS
┌ ƒ /                                    4.66 kB         156 kB
├ ○ /_not-found                          873 B          88.2 kB
├ ƒ /login                               298 B          87.6 kB
└ ○ /onboarding                          2.82 kB         155 kB
+ First Load JS shared by all            87.3 kB

ƒ Middleware                             81.6 kB
```

Dashboard-Bundle ist von 3.51 kB (Sprint 1) auf 4.66 kB gewachsen (+1.15 kB
für Ring + Stage + Force-Dev-Panel). Production-Build elidiert das Dev-Panel
sauber — siehe §5 A13.

## 4. RPC-Wrapper-Beleg

[src/lib/rpc.ts](src/lib/rpc.ts) — neu hinzugefügt:

```ts
export async function calculateSparrateForMonth(
  client: AppSupabaseClient,
  args: { userId: string; month: string },
): Promise<number | null> {
  const { data, error } = await client.rpc("calculate_sparrate_for_month", {
    p_user_id: args.userId,
    p_month: args.month,
  });
  if (error) throw error;
  return data;
}

export async function calculatePlannedSparrateForMonth(
  client: AppSupabaseClient,
  args: { userId: string; month: string },
): Promise<number | null> {
  const { data, error } = await client.rpc("calculate_planned_sparrate_for_month", {
    p_user_id: args.userId,
    p_month: args.month,
  });
  if (error) throw error;
  return data;
}
```

Beide folgen der in Sprint 1 etablierten Wrapper-Konvention
(CLAUDE.md §7): `SupabaseClient` als erster Parameter, args-Objekt
zweiter, camelCase → snake_case-Mapping inline. `month` wird als
`"YYYY-MM-01"`-String von der Page übergeben (CLAUDE.md §7 Regel 9).

**Bewusste Abweichung von `estimateNetMonthly` (Sprint 1):** Die neuen
Wrapper werfen Errors statt sie zu schlucken — Briefing §3.1 schreibt
das explizit so vor („Wrapper schluckt keine Errors"). `page.tsx`
umschließt die Aufrufe mit `try/catch` und fällt im Fehlerfall auf
`{ realCurrent: null, realPlanned: null }` zurück (defensiver Pfad gemäß
Briefing §8.4).

## 5. Selbst-Review-Checkliste A1–A17

| #   | Kriterium | Status | Beleg |
|---|---|---|---|
| A1  | `pnpm build` + `tsc --noEmit` + `next lint` clean | ✅ | §3 |
| A2  | Ring unter `/` sichtbar nach Login | 🟡 | Visuelles Smoke. Code-Pfad: `page.tsx` → `<DashboardRingStage>` → `<SingularityRing>`. |
| A3  | Real-State (Test-User keine Karten): voller Teal-Arc bis 12 Uhr, weiße Zahl `+3.200 €`, Subtext „100,0 % von Plan" muted | 🟡 | Visuelles Smoke. Mathematik: `current=plan=3200` → `pct=1` → `fill=HC` → posOffset=`C−HC`=HC (= halber Kreis sichtbar, 6→12 Uhr CCW). centerColor `current <= plan → white`. Subtext `100,0 %`. |
| A4  | Force currentSparrate = `0` → kein Arc, weiße `+0 €`, Subtext „0,0 % von Plan" muted | 🟡 | Visuelles Smoke. Mathematik: `current=0`, `plan=3200` → `pct=0`, `fill=0`, `posOffset=C` (kein Arc). centerColor white. Subtext `0,0 %`. |
| A5  | Force currentSparrate = `1500`, plan = `3200`: Teal-Arc ca. 47% CCW (zwischen 6 und 9 Uhr), weiße Zahl, Subtext „46,9 % von Plan" muted | 🟡 | Visuelles Smoke. `pct=0.46875` → `46,9`. |
| A6  | Force currentSparrate = `5000`, plan = `3200`: Teal-Arc > 12 Uhr (~78% Vollkreis), teal Zahl `+5.000 €`, Subtext „+56,3 % über Plan" teal | 🟡 | Visuelles Smoke. `pct=1.5625` → `(pct−1)*100=56.25` → `56,3`. centerColor `current > plan → teal`. |
| A7  | Force currentSparrate = `8000`, plan = `3200`: Teal-Arc bei `C − 0.5` (visuell quasi voll), teal Zahl `+8.000 €`, Subtext „+150,0 % über Plan" teal | 🟡 | Visuelles Smoke. `pct=2.5`, `fill=Math.min(2.5*HC, C-0.5)=C-0.5` (Cap greift, da `2.5*HC > C`). Subtext: `+150,0 %`. |
| A8  | Force currentSparrate = `−500`, plan = `3200`: roter Arc CW (ca. 15%), rote Zahl `−500 €`, Subtext „−15,6 % Defizit" rot | 🟡 | Visuelles Smoke. `current<0`-Branch: `|pct|=0.15625`, `fill=0.15625*HC`, `negOffset=C-fill`. centerColor red. Subtext mit U+2212 Minus. |
| A9  | Force currentSparrate = `−3500`, plan = `3200`: roter Arc gecappt bei 12 Uhr (genau `HC`), rote Zahl `−3.500 €`, Subtext „−109,4 % Defizit" rot | 🟡 | Visuelles Smoke. `|pct|=1.09375`, `Math.min(|pct|, 1)=1`, `fill=HC` (Cap), Subtext `109,4 %`. |
| A10 | Force plannedSparrate = `0`, currentSparrate = `850`: kein Arc, weiße Zahl `+850 €`, kein Subtext | 🟡 | Visuelles Smoke. `plan===0`-Branch in `computeRingState` → beide Offsets `C`, subtext `null`. centerText `formatEur(850)` → `+850 €`. |
| A11 | Animation: weicher Übergang ~700 ms | 🟡 | Visuelles Smoke. CSS: `transition: stroke-dashoffset .72s cubic-bezier(.22,0,.08,1)` auf `.arc`. useState initialisiert mit `C`, useEffect setzt Zielwert via `requestAnimationFrame`. |
| A12 | Kein Slider im finalen Ring-DOM (`<input type="range">` nur im Dev-Panel) | ✅ | `grep -rn 'type="range"' src/components/singularity-ring/` → 0 Treffer. Ring-DOM enthält nur `<svg>` + Center-Texte. |
| A13 | Production-Build: Dev-Panel-Markup nicht im Bundle | ✅ | `grep -rc 'Force currentSparrate' .next/static/` → alle Dateien 0 Treffer. Detail siehe §6. |
| A14 | RPC-Aufrufe nur via `lib/rpc.ts` | ✅ | `grep -rn 'rpc("calculate_' src/app src/components` → 0 Treffer (Wrapper sind die einzige Stelle, vgl. §4). |
| A15 | Keine Hex/RGBA inline außer in den drei Ring-lokalen Custom-Properties am `.ringStage`-Root | ✅ | `grep -rE '#[0-9a-fA-F]{3,8}\|rgba?\(' src/components/singularity-ring/` → genau die drei dokumentierten `--ring-track`, `--ring-label`, `--ring-subtext-muted` (Briefing §3.7 explizit erlaubt). |
| A16 | Email + Logout sichtbar, aber dezent | 🟡 | Visuelles Smoke. `page.module.css` aus Sprint 1 unverändert: `.topRow` mit `space-between`, Email 13px, Logout dezenter Ghost-Button. |
| A17 | `font-variant-numeric: tabular-nums` greift in Zentrumszahl + Subtext | ✅ | `singularity-ring.module.css`: `.centerValue` und `.subtext` setzen `font-variant-numeric: var(--typo-numeric-variant)` explizit. Global auch im `body` via `globals.css`. |

**Visuell zu verifizieren durch User-Browser-Smoke-Test (analog Sprint 1):**
A2–A11, A16 — und die Smoke-Test-Sequenz §5 des Briefings.

## 6. Produktion-Build-Verifikation A13

```
$ grep -rc 'Force currentSparrate' .next/static/
.next/static/css/99db5676e613eef0.css:0
.next/static/css/7e14e4cf2a3eadd3.css:0
.next/static/css/b65756104b2ecdfd.css:0
.next/static/css/9ef59d8485b7aa8b.css:0
.next/static/chunks/e3e101b0-cffae8109b1e252a.js:0
.next/static/chunks/framework-6e06c675866dc992.js:0
.next/static/chunks/app/page-ed4032b872e43ba6.js:0
.next/static/chunks/app/_not-found/page-b01028db2af9d1eb.js:0
.next/static/chunks/app/layout-d470feaac1542483.js:0
.next/static/chunks/app/login/page-fd427713350fbea9.js:0
.next/static/chunks/app/onboarding/page-3610ed5f8500d9b2.js:0
.next/static/chunks/945-4a5ec71744defc55.js:0
.next/static/chunks/webpack-a5155af832c47f4b.js:0
.next/static/chunks/main-53208b956bd8f8f0.js:0
.next/static/chunks/main-app-a17adfbda1d30929.js:0
.next/static/chunks/999-86e13b3a44d8e348.js:0
.next/static/chunks/2200cc46-46bf10597e95d565.js:0
.next/static/chunks/pages/_error-a647cd2c75dc4dc7.js:0
.next/static/chunks/pages/_app-0c3037849002a4aa.js:0
.next/static/chunks/polyfills-42372ed130431b0a.js:0
```

Alle Chunks 0 Treffer. Webpack/Terser eliminieren den `<RingForceDevPanel>`-
Aufruf hinter dem `process.env.NODE_ENV === "development" && …`-Guard sowie
die ungenutzte Funktions-Definition. Smoke-Test §5 Schritt 11 (User-seitig:
`pnpm start` + view-source) sollte das DOM-seitig bestätigen.

## 7. Voraussetzungs-Bestätigung (V1–V6)

| #  | Status | Beleg |
|----|---|---|
| V1 | ✅ | CLAUDE.md §4 zeigt Sprint 1 = 🟢, Approval 11. Mai 2026. |
| V2 | ✅ | `src/lib/supabase/types.ts` enthält `calculate_planned_sparrate_for_month` mit signature `{ p_month: string, p_user_id: string }, Returns: number`. |
| V3 | ✅ | `tsc --noEmit` clean (§3). Kein `<claude-code-hint>`-Tag in `types.ts` (gegrept). |
| V4 | ➖ | Claude-Code-seitig nicht prüfbar (kein SQL-Zugriff erlaubt). User-Verantwortung — Trust. |
| V5 | ✅ | `git status` zeigt `sprint/02-ring`. |
| V6 | 🟡 | Wird im Smoke-Test verifiziert. |

## 8. Architektur-Entscheidungen

### E1 — DashboardRingStage als separater Wrapper

Briefing §3.10 erlaubt entweder das bestehende `DashboardDevPanel`
(Sprint 1) zu erweitern oder einen neuen Wrapper einzuführen. Ich habe
einen neuen Wrapper [src/components/dashboard-ring-stage/index.tsx](src/components/dashboard-ring-stage/index.tsx)
gebaut, in dem auch der Force-Dev-Panel-Body lebt. Begründung:

- **Ring-Force-Override-State gehört zum Ring**, nicht zum Income-Split-Panel.
  Bundling der beiden würde State-Logik mischen.
- **Sprint-1-Dev-Trigger bleiben unverändert** in
  [src/app/dashboard-dev-panel.tsx](src/app/dashboard-dev-panel.tsx) sichtbar.
  `page.tsx` rendert beide Panels nebeneinander (Ring-Stage oben, Income-Trigger
  separat darunter), Briefing §3.10 hält das fest: „Dev-Trigger neben den
  Force-Inputs lassen".
- **Tree-Shaking läuft sauberer**, weil der Force-Panel-Body in einer
  einzigen Branch hinter `process.env.NODE_ENV === "development" && (…)`
  sitzt. Production-Grep §6 belegt das.

### E2 — Try/catch im Page-Code für RPC-Errors

Briefing §8.4 markiert das als **optional**. Ich habe es eingebaut, weil
der Aufwand minimal ist (4 Zeilen) und der UX-Vorteil signifikant: bei
einem RLS-Drift oder DB-Outage rendert die Page weiterhin, statt mit
einem 500er zu crashen. Bei Error wird `realCurrent`/`realPlanned`
auf `null` gesetzt → Ring rendert Leer-Zustand mit „—".

### E3 — Force-Inputs nehmen Text + parsen mit Komma-Tolerant

Force-Inputs sind `type="text"` mit `inputMode="decimal"`, geparst über
`Number(raw.replace(",", "."))`. Begründung: Briefing-Akzeptanz-Werte
sind teils ganzzahlig (`0`, `1500`), teils mit Minus (`-500`). Number-
Inputs in `de-DE`-Locale verhalten sich beim Komma-Trennzeichen
inkonsistent zwischen Browsern; Text + manuelles Parse ist
deterministischer. Da das Panel nur dev-intern ist, ist die
nicht-typisierte Input-Validierung akzeptabel.

### E4 — `currentMonthYYYYMM01` inline in `page.tsx`

Statt eines neuen `src/lib/date.ts` ist der Helper als pure-function
am Top des Page-Files. Begründung: einziger Konsument, eine Zeile.
CLAUDE.md §7 Regel 9 (String-Konstruktion statt `new Date(...)`) ist
befolgt. Wenn Sprint 3 Header/Timeline weitere Monats-Helper braucht,
extrahiere ich dann.

## 9. Offene Fragen an den PM

### Open Question #1 — Subtext-Höhen-Stabilität bei Leer-/Plan-0-Zustand

Im Leer-Zustand (eine der beiden Sparraten ist `null`) und im
`plan === 0`-Zustand zeige ich Center `—` bzw. Center mit Wert,
aber **kein Subtext**. Damit das Layout nicht springt, hat
`.subtext` ein `min-height: 11px`. Wechselt der User zwischen
Force-Werten mit/ohne Subtext, bleibt die vertikale Position
des Sublabels konstant.

**Frage:** Soll das so bleiben, oder soll im Leer-Zustand ein
ausdrücklicher Platzhalter-String dort stehen (z. B. `—` als
Subtext-Pendant, oder „kein Plan"-Hinweis bei plan=0)?
Briefing §3.11 / §3.6 sagt explizit „leer oder absent", ich habe
„leer mit reservierter Höhe" gewählt.

### Open Question #2 — Sublabel „SPARRATE" im Leer-Zustand

Briefing §3.6 erste Zeile sagt im Leer-Zustand: „Sublabel SPARRATE
bleibt". Aktuell bleibt es. Aber: ohne erkennbare Zentrumszahl
(`—`) ist das Sublabel optisch dominanter als die Zahl. Beobachtung
aus dem visuellen Smoke-Test wird zeigen, ob das stört.
**Vorgehensweise:** Status quo lassen, im Smoke-Test bewerten,
ggf. Korrektur-Briefing.

### Open Question #3 — Browser-Smoke-Test ohne Real-Server

A2–A11 / A16 sind alle visuelle Akzeptanzpunkte. Smoke-Test
benötigt `pnpm dev` + Browser durch User. Ich habe diese alle
auf 🟡 gestellt — sie sind code-seitig vollständig implementiert,
aber nicht von mir selbst beobachtet. Sprint-1-Pattern war
identisch.

## 10. Vorschläge zur CLAUDE.md-Aktualisierung

### LL-1: Tech-Debt zum Plan-Pfad-Helper

Pre-Sprint-2-Log-Eintrag im CLAUDE.md §10 erwähnt bereits, dass
`calculate_planned_sparrate_for_month` und `calculate_sparrate_for_month`
einen gemeinsamen Helper `calculate_card_planned_amount_for_month`
gebrauchen könnten. Sprint 2 hat keinen DB-Anlass dafür geschaffen,
aber Sprint 6 (Sparrate-Verifikation) ist der natürliche Anlass:
falls dort divergierende Ergebnisse zwischen Ring-Arc und
Center-Zahl auftreten, ist der Helper-Refactor der erste Verdacht.

→ Vorschlag: in CLAUDE.md §10 nach Sprint-2-Approval als
„Pre-Sprint 6"-Erinnerung notieren.

### LL-2: Wrapper-Error-Verhalten ist nicht einheitlich

`estimateNetMonthly` (Sprint 1) schluckt Errors und gibt `null`
zurück; `calculateSparrateForMonth` / `calculatePlannedSparrateForMonth`
(Sprint 2) werfen. Beides ist briefing-konform, aber inkonsistent.

→ Vorschlag: CLAUDE.md §7 ergänzen — Default sollte sein, dass
Wrapper Errors werfen. Schluckende Variante nur, wenn der
Aufrufer keine Unterscheidung zwischen „kein Datum" und „Fehler"
braucht und der Wrapper an einer Stelle aufgerufen wird, an der
ein Crash UX-schädlich wäre. Oder: `estimateNetMonthly` an
Sprint-2-Konvention angleichen, falls PM das wünscht (mini-fix).

### LL-3: SVG-Transform-Inline-Style ist OK

Briefing §8.1 erlaubte mir explizit, `transform-box: fill-box` und
`transform-origin: center` als inline-`style`-Attribut zu setzen,
falls CSS-Module-Spezifität nicht greift. Ich habe das vorsorglich
inline gemacht — funktioniert, sauberer Code, kein Browser-Bug
beobachtet. Empfehlung für künftige SVG-Komponenten: gleicher
Pattern.

→ Vorschlag: CLAUDE.md §7 unter „Datei-Konventionen" als kleine
Ausnahme von „keine Hex/RGBA inline" — SVG-`transform-box` /
`transform-origin` dürfen inline, alle Farben gehen weiterhin
über CSS-Modules.

---

**Ende des Sprint-2-Review.**
