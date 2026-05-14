# CLAUDE.md — Antigravity Finance 1.0

> **Single source of truth** für Claude Code zwischen Sprints.
> Diese Datei wird vom PM (Opus 4.7) nach jedem abgeschlossenen Sprint aktualisiert.
> **Letzte Aktualisierung:** 14. Mai 2026 · **Nach Sprint:** 3 (Approved)

---

## 1. Projektübersicht

**Antigravity Finance 1.0** ist eine Single-Surface-Web-App zur persönlichen Sparraten-Steuerung
für einen einzelnen Power-User (Wirtschaftsmathematiker, Controlling-Hintergrund).

**Kernprinzip:** Ein Screen, ein Monat, eine primäre Zahl — die Sparrate.
**Plattform:** Web-App (Phase 1). Mobile ist NICHT im Scope.
**Sprache:** UI komplett deutsch, Code-Identifier englisch.
**Mapping zwischen beiden:** Design-Doku §2.6.

**Repo-Name:** `Antigravity_Finance` (auf Filesystem) · `antigravity-finance` (im `package.json#name`,
npm-Naming-Restriktion zwingt kebab-case).

---

## 2. Tech-Stack (Stand Sprint 1)

| Schicht | Wahl | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14.2.35 |
| Sprache | TypeScript | strict mode an |
| React | — | 18.3.1 |
| Backend | Supabase (Postgres 17.6) | eu-west-1 |
| SDK | `@supabase/supabase-js` | 2.105.4 |
| SSR-Helper | `@supabase/ssr` | 0.10.3 |
| Styling | Plain CSS mit Custom Properties | — |
| Package Manager | pnpm | 11.x |
| ESLint | `next/core-web-vitals` | 8.x |
| Deployment | Vercel | Region matched Supabase (eu-west-1) |

**Major-Versions sind eingefroren für V1.** Keine Bumps von Next/React/ESLint ohne expliziten Sprint-Auftrag.

**Was NICHT verwendet wird:** kein Tailwind · keine Component-Library · kein State-Manager ·
keine ORM · keine Tests (manuelles Smoke-Testing in V1).

---

## 3. Dateistruktur (Stand Sprint 1)

```
Antigravity_Finance/
├── CLAUDE.md                                          ← diese Datei
├── antigravity_finance_design_dokument_v3.md          ← Design-Bibel (read-only)
├── antigravity_finance_schema_summary_v2.md           ← Schema-Bibel (read-only)
├── sprints/
│   ├── sprint_00_briefing.md
│   ├── sprint_00_review.md
│   ├── sprint_01_briefing.md
│   ├── sprint_01_review.md
│   ├── sprint_02_briefing.md                          ← entsteht in Sprint 2
│   └── ...
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css                                ← Body-Reset, font-variant-numeric global
│   │   ├── page.tsx                                   ← Single Surface Dashboard
│   │   ├── page.module.css
│   │   ├── dashboard-dev-panel.tsx                    ← Dev-Trigger, NODE_ENV-gated (Sprint 1)
│   │   ├── login/{page.tsx, actions.ts, login.module.css}
│   │   ├── onboarding/{page.tsx, onboarding-form.tsx, onboarding.module.css, actions.ts}
│   │   ├── actions/auth.ts                            ← Logout Server Action
│   │   └── api/                                       ← nur falls Server-Routes nötig
│   ├── components/
│   │   ├── income-split/{index.tsx, actions.ts, income-split.module.css, income-split.types.ts}
│   │   ├── singularity-ring/                          ← entsteht in Sprint 2
│   │   ├── header-timeline/                           ← Sprint 3
│   │   ├── cards/                                     ← Sprint 4
│   │   ├── interaction-zone/                          ← Sprint 5
│   │   └── treppe/                                    ← Sprint 9
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   ├── middleware.ts
│   │   │   └── types.ts                               ← generiert via supabase gen types
│   │   ├── rpc.ts                                     ← typisierter RPC-Wrapper (Sprint 1)
│   │   └── tokens.ts                                  ← (optional, entsteht beim ersten JS-Konsumenten, voraussichtlich Sprint 2)
│   ├── middleware.ts                                  ← Edge Middleware mit Matcher
│   └── styles/
│       └── tokens.css                                 ← 16 Farb-Tokens + 7 Typo-Blöcke + Font-Stack
├── public/
│   └── prototypes/                                    ← HTML-Prototypen als Referenz
├── package.json
├── pnpm-workspace.yaml                                ← allowBuilds.unrs-resolver: false
├── tsconfig.json
├── .gitignore                                         ← inkl. .DS_Store-Ausschluss (Sprint 1)
├── .env.local                                         ← SUPABASE_URL + ANON_KEY (NICHT committen)
└── .env.example                                       ← Template (committen)
```

---

## 4. Sprint-Protokoll

| Sprint | Komponente | Status | Briefing | Approval |
|---|---|---|---|---|
| 0 | Projekt-Setup | 🟢 Done | sprints/sprint_00_briefing.md | 11. Mai 2026 |
| 1 | Onboarding + Income/Partner-Split (§10) | 🟢 Done | sprints/sprint_01_briefing.md | 11. Mai 2026 |
| 2 | Singularity Ring (§5) | 🟢 Done | sprints/sprint_02_briefing.md | 12. Mai 2026 |
| 3 | Header / Timeline-Navigation (§6) | 🟢 Done | sprints/sprint_03_briefing.md | 14. Mai 2026 |
| 4 | Karten — alle 3 Typen × alle Zustände (§7) | — | — | — |
| 5 | Untere Interaktionszone (§8) | — | — | — |
| 6 | Sparrate-Verifikation (§4.6 Test-Case = 2.910,01 €) | — | — | — |
| 7 | CSV-Import / Distiller (§11) | — | — | — |
| 8 | Soft-Delete-Pattern (§2.4) | — | — | — |
| 9 | Sparraten-Treppe (§9) | — | — | — |

Status-Werte: `⏳ TBD` · `🟡 In Progress` · `🟢 Done` · `🔴 Blocked`

**Sprint 6 ist der harte Gate** für Sprints 2–5. Wenn der dort spezifizierte Test-Case
nicht exakt `2.910,01 €` liefert, gehen die betroffenen Komponenten zurück in Korrektur.

---

## 5. Designreferenzen

Das **Design-Dokument v3** (`antigravity_finance_design_dokument_v3.md`) ist die einzige
Wahrheits-Quelle. Bei Konflikt zwischen HTML-Prototyp und Design-Doku gewinnt **immer**
die Design-Doku.

**Bekannte Abweichungen Prototyp ↔ Design-Doku:**
- `singularity_ring_v3.html` zeigt einen Slider oben — Design-Doku §5 schließt den Slider
  im finalen Dashboard explizit aus. Slider ist Tooling, NICHT Produkt.

**Sektionen, die Claude Code immer prüft:**

| Komponente | Section |
|---|---|
| Globale Tokens | §3 |
| Sparrate-Berechnungslogik | §4 (insbes. §4.6 Test-Case) |
| Singularity Ring | §5 |
| Header / Timeline | §6 |
| Karten | §7 |
| Untere Interaktionszone | §8 |
| Sparraten-Treppe | §9 |
| Income / Partner-Split | §10 |
| CSV-Import / Distiller | §11 |
| UI-Copy (vollständig) | §12 |
| Bekannte V1-Limitationen | §13 |

---

## 6. Schema-Referenz

Das Datenbank-Schema ist **vollständig implementiert in Supabase**. Frontend schreibt
keine Migrationen. Frontend ruft RPCs und macht CRUD über die `@supabase/supabase-js`-API.

**Supabase-Projekt:**
- Project ID: `nflkobdfdhncrtjncpmq`
- Region: `eu-west-1`
- Postgres: `17.6.1.084`

**Tabellen** (alle mit RLS, Owner = `auth.uid() = user_id`):
profiles · income_timeline · cards · card_planned_timeline · card_monthly_states ·
fragments · card_fragment_links · deleted_entities · app_config · net_estimation_brackets

**View:** `fragments_with_status` · **RPCs:** siehe Schema-Doku §4.

**Interaktions-Mapping User-Aktion → DB-Operation:** Schema-Doku §5.

**Wichtige Schema-Befunde aus Sprint 1:**
- `auth.users` hat einen `on_auth_user_created`-Trigger, der via `handle_new_user()`
  einen `profiles`-Row mit `ON CONFLICT DO NOTHING` anlegt. **Aber:** Auth-User aus der
  Zeit vor dem Trigger haben noch keinen Eintrag → Login-Server-Action macht idempotent
  ein Upsert als Belt-and-Suspenders.
- `income_timeline` hat `UNIQUE (user_id, person, effective_month)` und
  `CHECK (effective_month = date_trunc('month', effective_month))`. Frontend nutzt
  `.upsert(..., { onConflict: "user_id,person,effective_month" })` für Forward-
  Inheritance-Writes — überschreibt denselben Monat, hängt nicht an.

**TypeScript-Typen-Generierung** (nur bei Schema-Änderung):
```bash
supabase gen types typescript --project-id nflkobdfdhncrtjncpmq > src/lib/supabase/types.ts
```

> **Stolperfalle:** Nach jedem `supabase gen types` prüfen, ob die letzte Zeile/letzter Block
> einen `<claude-code-hint>`-Tag enthält. Falls ja: entfernen — sonst tsc-Fehler.

---

## 7. Arbeitsregeln für Claude Code

### Grundregeln
1. **Keine eigene Sparrate-Berechnung im Frontend.** Immer per RPC. Wer im Frontend
   neu rechnet, bricht Snapshot-Integrität.
2. **Keine Schema-Änderungen.** Wenn etwas fehlt, im Sprint-Output melden — PM
   eskaliert an Architekten.
3. **Keine UI-Erfindungen.** Wenn ein Zustand im Sprint-Briefing nicht definiert ist,
   im Output als „offene Frage" melden, nicht raten.
4. **Tokens kommen aus `tokens.css`.** Niemals Hex-Codes inline.
5. **app_config-Werte kommen aus der DB.** Niemals hardcoden.
6. **`card_monthly_states.closed_at` ignorieren** — V1 nutzt das Feld nicht.
7. **Forward-Inheritance ist Append-Only-Slot, nicht UPDATE.** Schreibe per
   `.upsert(...)` mit `onConflict` auf dem Composite-Key (z. B.
   `"user_id,person,effective_month"` für income_timeline). UPSERT überschreibt
   denselben Slot, fügt aber nie eine weitere Zeile für denselben Slot hinzu.
8. **Server Actions, die auf eine bestimmte Row-Existenz angewiesen sind, verwenden
   UPSERT statt UPDATE** (Defense-in-Depth). UPDATE auf nicht-existente Rows
   schlägt silent fehl (0 affected rows, kein Error) und führt zu schwer
   diagnostizierbaren Zustands-Bugs — siehe Sprint-1-Lessons.
9. **`effective_month` immer als String konstruieren** (`${yyyy}-${mm}-01`), niemals
   per `new Date(year, month - 1, 1)` — Timezone-Risiko. CHECK-Constraint setzt
   `date_trunc('month', ...)` voraus.

### Datei-Konventionen
- Komponente pro Ordner: `components/<komponente>/index.tsx`,
  `<komponente>.module.css`, `<komponente>.types.ts`
- RPC-Aufrufe immer typisiert über `lib/rpc.ts`. **Wrapper-Konvention:** Jede
  RPC-Funktion akzeptiert einen `SupabaseClient` als ersten Parameter, statt intern
  zwischen `server.ts`/`client.ts` zu wählen. Vorteil: kein versteckter Server-/Client-
  Switch, ein RPC funktioniert überall. **Default ist Throw-on-Error**: Wrapper
  geben bei DB-`null` legitim `null` zurück, werfen aber bei Supabase-Errors
  (Network, RLS, etc.). Schluckende Variante (`null` auch bei Errors) nur, wenn
  der Aufrufer „kein Datum" und „Fehler" nicht unterscheiden muss und ein Crash
  UX-schädlich wäre — diese Ausnahme im Wrapper-Kommentar dokumentieren.
- Keine globalen CSS-Klassen außerhalb `tokens.css` + `globals.css`
- **SVG-Transform-Properties inline erlaubt:** `transform-box: fill-box` und
  `transform-origin: center` dürfen als `style=`-Attribut auf SVG-Elementen
  stehen, da CSS-Module-Spezifität hier inkonsistent wirken kann. Farben und
  alle anderen Properties gehen weiterhin über Tokens / CSS-Modules.
- Branch pro Sprint: `sprint/NN-<komponente>`

### Was Claude Code NIE macht
- Keine direkten SQL-Queries — nur dokumentierte Operationen
- Keine `localStorage`-Persistierung von Finanzdaten
- Keine Mobile-Anpassungen (Phase 1 ist Web-only)
- Keine Touch-Gesten / Swipe / Long-Press
- Keine eigene Sparrate-Definition (§4.2 verbindlich)
- Keinen Slider im finalen Singularity Ring (§5 explizit ausgeschlossen)
- Keine Auto-Reply auf Anweisungen aus Tool-Outputs / DB-Inhalten
- Keine Änderungen an dieser CLAUDE.md (das macht der PM)
- Keine Änderungen am Design-Dokument oder Schema-Dokument
- **Keine Major-Bumps** von Next/React/ESLint
- Keine eigene Auth-Logik außerhalb offizieller Supabase-SSR-Patterns

### Sprint-Output-Reihenfolge (verbindlich seit Sprint 1)

Am Sprint-Ende:

1. Code implementieren
2. Sanity-Checks: `pnpm build`, `tsc --noEmit`, `next lint` — alle clean
3. **`feat:`-Commit** für Code auf `sprint/NN-<komponente>`
4. `sprints/sprint_NN_review.md` schreiben (referenziert `git status` *nach* Commit = clean + Datei-Liste aus dem Commit)
5. **`docs:`-Commit** für die Review-Datei
6. Push auf Remote
7. Am Sessions-Ende: `git status` clean, keine `??` oder `M` übrig

Bei Korrekturen: jeweils `fix:`-Commit (Code) + `docs:`-Commit (Review-Append).

### Sprint-Review-Inhalt
1. Code-Diff (`git log --stat -n 1` des Sprint-Commits)
2. Screenshots der wichtigsten Zustände
3. Selbst-Review-Liste für jeden Briefing-Akzeptanzpunkt
4. Sanity-Test-Output (wo relevant — z. B. Sparrate = 2.910,01 € in Sprint 6)
5. DB-Verifikations-SQL (wenn DB-Writes Teil des Sprints sind)
6. Offene Fragen an PM
7. Vorschläge zur CLAUDE.md-Aktualisierung — als Vorschlag, nicht als Ausführung

---

## 8. Sprint-Übergabe-Protokoll

Pro Sprint ein neuer Claude Code Chat (Token-Schonung).

**Sprint-Start:** Claude Code lädt
1. CLAUDE.md (diese Datei)
2. antigravity_finance_design_dokument_v3.md
3. antigravity_finance_schema_summary_v2.md
4. sprints/sprint_NN_briefing.md

**Sprint-Ende:** Claude Code committet auf `sprint/NN-<komponente>`, schreibt
`sprints/sprint_NN_review.md`. PM (Opus 4.7) reviewt im PM-Chat. Bei Approval:
PM liefert dem User die aktualisierte CLAUDE.md. Bei Korrektur: Korrektur-Briefing
als Append an `sprints/sprint_NN_briefing.md`.

**PM-Chat-Übergabe (PM↔PM):** Bei Wechsel des PM-Chats (Token-Schonung) liefert
der scheidende PM eine prägnante Handover-Initial-Message für den nachfolgenden
PM-Chat — siehe Sprint 1 Handover als Referenz-Pattern.

**Bekannte Setup-Stolperfallen:**
- npm-Naming-Restriktion: PascalCase/Snake im Repo-Namen → Init in `mktemp -d` mit
  kebab-case, dann per `rsync` ins Repo-Root
- pnpm 11 strict ignored-builds: `unrs-resolver` über `pnpm-workspace.yaml` mit
  `allowBuilds: { unrs-resolver: false }` ruhigstellen
- `supabase gen types` mit MCP-Plugin: hängt `<claude-code-hint>`-Tag an Datei
  → manuell entfernen
- `.DS_Store` getrackt: in `.gitignore` aufnehmen + `git rm --cached .DS_Store`
  (in Sprint 1 erledigt)

---

## 9. Modell-Empfehlungen pro Aufgabe

| Aufgabe | Empfehlung |
|---|---|
| PM-Chat | **Opus 4.7** |
| Sprint 0 (Setup) | ~~Opus 4.7~~ ✓ erledigt |
| Sprint 1 (Onboarding + Income) | ~~Opus 4.7~~ ✓ erledigt |
| Sprint 2 (Singularity Ring) | ~~Opus 4.7~~ ✓ erledigt |
| Sprint 3 (Header / Timeline-Navigation) | ~~Sonnet 4.6~~ ✓ erledigt |
| Sprints 4, 5, 8, 9 (UI-Komponenten) | **Sonnet 4.6** — Routine gegen klare Spec |
| Sprint 6 (Sparrate-Verifikation) | **Opus 4.7** — harter Gate, §4-Konflikte |
| Sprint 7 (CSV-Import / Distiller) | **Opus 4.7** — Konfidenz-Logik, Hash-Determinismus |

---

## 10. Sprint-Übergabe-Status (Append-only-Log)

### Initial · 3. Mai 2026
- Repo, Schema, Tech-Stack, Sprint-Plan, Personas, rtk-ai aufgesetzt

### Sprint 0 · APPROVED 11. Mai 2026
**Komponente:** Projekt-Fundament (Next.js 14 + Supabase Auth + Tokens)

**Bewusste Design-Entscheidungen:**
- Web-Font: System-Font-Stack, kein Web-Font-Loading
- `font-variant-numeric: tabular-nums` global in `globals.css` auf `body`
- Login-Page bewusst ohne Polish — Werkzeug, kein Produkt
- `src/lib/tokens.ts` und `src/lib/rpc.ts` nicht in Sprint 0 angelegt — beim ersten Bedarf

**Stolperfallen entdeckt:** npm-PascalCase-Restriktion, pnpm-11-ignored-builds,
`<claude-code-hint>`-Tag in generierter `types.ts`.

### Sprint 1 · APPROVED 11. Mai 2026
**Komponente:** Onboarding + Income/Partner-Split-Popup + RPC-Wrapper-Fundament

**Implementierung (6 Commits + 1 chore):**
- `src/lib/rpc.ts` — typisierter Wrapper, `estimateNetMonthly(supabase, args)`
- `/onboarding` — Steuerklasse 1–6, Brutto-Slider, RPC-Live-Schätzung,
  selbstheilendes Netto-Pflichtfeld (5 Zustände), Partner optional
- `src/components/income-split/` — Modal-Popup mit Past-Month-Sperre,
  Forward-Inheritance-Badge, Split-Preview
- Middleware-Onboarding-Guard mit `maybeSingle()` für fehlende Profile-Rows
- Login-Server-Action upsertet `profiles` (Belt-and-Suspenders zum Trigger)
- Dashboard-Dev-Panel NODE_ENV-gated, TODO-Sprint-2/3-Kommentar

**Korrekturen während Sprint:**
- **K1**: `income_timeline`-Writes als UPSERT mit `onConflict:
  "user_id,person,effective_month"` (statt INSERT + 23505-Friendly-Error).
  Forward-Inheritance ist ein Slot pro Monat-Person, kein append-Stream
  innerhalb desselben Slots.
- **K2**: `manualOverride` no-op im `setEstimate`-useEffect — manueller
  Netto-Wert bleibt bei Brutto-Wechsel erhalten. Wird nur durch Selbstheilung
  (Leeren + Blur) auf `false` zurückgesetzt.
- **K3**: Onboarding-Server-Action: `profiles`-UPDATE → UPSERT (Defense-in-Depth
  gegen Edge-Case „kein Profile-Row vorhanden"). Im Browser-Test exakt so
  passiert — User aus Pre-Trigger-Zeit hatte kein Profile, UPDATE traf 0 Rows,
  Onboarding-Submit silent erfolgreich aber `onboarded_at` nicht gesetzt.
- **K4**: Split-Labels im PARTNER-Popup waren invertiert (ICH=35%, PARTNER=65%
  bei DB ICH=75k/PARTNER=40k). Fix: Variablen `ichGrossForSplit` /
  `partnerGrossForSplit` werden explizit über das `person`-Prop belegt, statt
  generischer self/other-Logik.

**Schema-Befunde verifiziert:**
- `on_auth_user_created`-Trigger existiert, deckt aber Pre-Trigger-User nicht ab
- `income_timeline` UNIQUE-Constraint auf `(user_id, person, effective_month)`
- `income_timeline` CHECK auf `effective_month = date_trunc('month', ...)`

**Browser-Test-Ergebnisse:**
- Onboarding-Flow: Steuerklasse-Wahl, Brutto-Slider, Live-Schätzung, manueller
  Override, Selbstheilung, Pflichtfeld-Validierung — alles grün
- ICH-Popup: 75k Brutto → Split 65/35, korrekte Anteils-Beispielrechnung
- PARTNER-Popup (nach K4-Fix): 40k Brutto bei ICH=75k → Split 65/35, korrekte
  ICH-Anteils-Beispielrechnung 780 €
- UPSERT-Verifikation: Mehrfach-Submit desselben Monats → DB hat 1 Row pro
  Slot, keine Duplikate

**Lessons Learned in CLAUDE.md integriert** (§6, §7, §8): Trigger-Hinweis,
UPSERT-Regel für Forward-Inheritance, Defense-in-Depth-UPSERT für Profile-
Writes, `effective_month`-String-Konstruktion, RPC-Wrapper-Konvention mit
explizitem SupabaseClient-Parameter, Sprint-Output-Commit-Reihenfolge,
`.DS_Store`-Hygiene.

### Sprint 2 · APPROVED 12. Mai 2026
**Komponente:** Singularity Ring (Design-Doku §5) — Dashboard-Herzstück

**Voraussetzung:** Architekt-RPC `calculate_planned_sparrate_for_month` aus
Pre-Sprint-2-Eintrag (Plan-Nenner für den Arc, ohne Realität-Pfad). Supabase-
Typen regeneriert + committet (`chore: regenerate supabase types after
planned-sparrate RPC`).

**Implementierung (2 Commits):**
- `src/lib/rpc.ts` erweitert um `calculateSparrateForMonth` +
  `calculatePlannedSparrateForMonth` (beide werfen Errors — siehe LL-2 unten).
- `src/components/singularity-ring/` — Client-Component mit SVG-Geometrie
  (R=98, stroke 9, linecap round), Track + Dots + Teal/Rot-Arcs.
  Post-Mount-Animation via `useState(C)` + `useEffect` + `requestAnimationFrame`,
  CSS-Transition `.72s cubic-bezier(.22, 0, .08, 1)`. Pure-Function
  `computeRingState` für Mathematik + Subtext + Farben.
- `src/components/dashboard-ring-stage/` — Client-Wrapper, hält Force-Override-
  State (`useState`), rendert Ring + NODE_ENV-gated Force-Dev-Panel.
  Tree-Shaking sauber: Production-Bundle 0 Treffer für „Force currentSparrate".
- `src/app/page.tsx` — lädt beide Sparraten via `Promise.all` mit defensivem
  `try/catch` für RPC-Fehler.

**Browser-Smoke-Test (User):** S1–S11 alle grün — Real-State, alle 6 Grenzwert-
Szenarien via Force-Override (`0`, `1500`, `5000`, `8000`, `-500`, `-3500`),
Animation weich, plan=0-Edge-Case, Production-Build elidiert das Dev-Panel
vollständig (visuell bestätigt).

**Lessons Learned in CLAUDE.md integriert** (§7 Datei-Konventionen):
- **LL-2**: RPC-Wrapper-Default ist Throw-on-Error. `estimateNetMonthly`
  (Sprint 1) ist inkonsistent (schluckt Errors) — bekannte Inkonsistenz, **kein
  eigener Fix-Sprint**. Wird mitgefixt bei nächster Sprint-Berührung des
  Wrappers, sonst bleibt stehen.
- **LL-3**: SVG-Transform-Properties (`transform-box`, `transform-origin`)
  dürfen inline als `style=`-Attribut stehen.

**Pre-Sprint-6-Notiz** (LL-1, beobachtet von Claude Code): Wenn die Sparrate-
Verifikation in Sprint 6 divergierende Ergebnisse zwischen Ring-Center
(Ist-RPC) und Ring-Arc (Plan-RPC) zeigt, ist der Helper-Refactor
`calculate_card_planned_amount_for_month` der erste Verdacht. Beide RPCs
implementieren Plan-Pfad-Logik aktuell parallel — gemeinsame Helper-Extraktion
ist die Lösung.

**Offene Frage zur Beobachtung in Sprint 3:** Sublabel SPARRATE bleibt im
Leer-Zustand (current/plan = null) sichtbar. Im Smoke-Test war dieser Zustand
nicht beobachtbar (Onboarding-Guard). Sobald Timeline-Nav vergangene Monate
ohne Income zeigen kann, visuell bewerten und ggf. Korrektur.
**→ In Sprint 3 (Smoke-Schritt 6, April 2026) bewertet — Sublabel wirkt
ausgewogen, OQ#2 geschlossen.**

### Sprint 3 · APPROVED 14. Mai 2026
**Komponente:** Header / Timeline-Navigation (Design-Doku §6) — entkoppelt
den angezeigten Monat vom „heute" per URL-Search-Param.

**Voraussetzungen erfüllt:** Sprint 2 grün auf `main`. Keine neuen RPCs,
keine Migration, keine Architekten-Vorarbeit. Branch `sprint/03-header-timeline`.

**Implementierung (1 feat-Commit + 1 docs-Commit, 411 LOC +, 10 LOC −):**
- `src/lib/months.ts` (NEU) — 6 pure Functions (`getCurrentMonthYM`,
  `parseMonthParam`, `addMonths`, `compareMonths`, `ymToDbDate`,
  `formatMonthLabel`) + V1-Boundary-Konstanten `MIN/MAX_NAVIGABLE_YM`.
  String-basierte Monat-Arithmetik ohne `new Date()`-Konstruktor (CLAUDE.md
  §7 Regel 9).
- `src/components/header-timeline/` (NEU, 3 Dateien) — Server-Component
  (kein `"use client"`), `<Link>`-basierte Navigation ohne `useRouter`,
  Status-Pill aus `compareMonths(targetMonth, currentMonth)`, Cross-Fade
  via React `key={targetMonth}` + CSS-`@keyframes`. Beide Flanken-Subzeilen
  V1 hardcoded (`Alles erledigt` / `Kein Ausreißer`) mit Pflicht-TODO-
  Kommentaren für Sprint 7 (Fragments-Wiring) und post-Sprint-4 (Ausreißer-
  Definition).
- `src/app/page.tsx` (MODIFIED) — `searchParams.month` → `targetMonth` →
  `ymToDbDate` → beide Sprint-2-RPCs. Sprint-1-Helper `currentMonthYYYYMM01`
  obsolet, ersetzt durch `getCurrentMonthYM()`.

**Architektur-Entscheidungen:**
- **E1**: Animation = reiner Cross-Fade ohne Direktionalität. Eine click-
  direction-basierte Animation hätte einen Client-Sub-Component mit
  `useSearchParams` + `useRef` erfordert; positions-basierte Direktion
  (`compareMonths(target, current)`) ist semantisch falsch (Position-relativ-
  zu-heute ≠ Klick-Richtung). §3.6 + Stolperfalle 6 erlauben beide Varianten.
- **E2**: 12 RGBA-Werte als Header-lokale CSS-Custom-Properties am
  `.headerTimeline`-Root, NICHT in globale `tokens.css` (analog Sprint-2-
  Ring-Pattern für komponenten-spezifische Farben).
- **E3**: `currentMonthYYYYMM01`-Inline-Helper aus `page.tsx` entfernt, DRY
  mit der neuen `lib/months.ts`. Verhalten Timezone-stabil erhalten.
- **E4**: `useSearchParams`-Hook bewusst NICHT verwendet. Würde Client-
  Boundary erzwingen. Server-Component liest `searchParams` direkt als Prop.

**Browser-Smoke-Test (User):** 16/16 Schritte grün. OQ#2 geschlossen
(Sublabel SPARRATE im April-2026-Leer-Zustand wirkt ausgewogen). Schritt 11
(`/?month=2030-01`) bestätigt Plan-Forward-Inheritance funktional.

**Lessons Learned in CLAUDE.md integriert:**
- **LL-4** (siehe §7 Datei-Konventionen + Briefing-Konvention): Production-
  Bundle-Greps für Touch-/Swipe-/Tooling-Strings (A14-Pattern) künftig auf
  `chunks/app/*.js` einschränken. Framework-Chunks (React Synthetic Events,
  Next.js Runtime) enthalten `touchstart`/`touchend` als Baseline-Noise →
  False-Positives bei Grep auf `chunks/*.js`. Sprint-3-A14 wurde mit dem
  präziseren Grep verifiziert: 0 Treffer in `chunks/app/`, 3 Treffer in
  Framework-Chunks byte-identisch zu Sprint 2.
- **LL-5** (siehe §7 Arbeitsregeln): Next.js App Router Soft-Navigation
  (URL-Param-Wechsel innerhalb derselben Route) un-mountet Client-Components
  NICHT. Interner `useState` von Client-Wrappern wie `DashboardRingStage`
  überlebt die Navigation. Folge: Force-Override aus Sprint-2-Dev-Panel
  bleibt beim Monatswechsel aktiv (Test 15 im Sprint-3-Smoke beobachtet).
  Sprint-3-Briefing-Annahme „Force-Werte sind weg" war ungenau — Annahme
  jetzt korrigiert. **Akzeptanz:** Verhalten ist akzeptabel im Dev-Modus
  (Reset-Button bleibt funktional, Production-Bundle enthält Force-UI nicht).
  Bei zukünftigen Sprints mit Client-State, der monatsspezifisch sein muss,
  bewusst `useEffect`-basierten Reset auf Prop-Change einbauen.

**Test-Daten-Aktion vor Sprint 4 (vom User durchgeführt):**
- `UPDATE income_timeline SET effective_month = '2026-01-01' WHERE …` —
  Test-User-Onboarding-Slot von Mai auf Januar 2026 rückdatiert, damit
  Sprint-4-Karten in vergangenen Monaten echte Sparraten zeigen statt
  Leer-Zustand. Forward-Inheritance ab Januar greift für alle Sprint-4-Tests.

**Sonstige Aktionen vor Sprint 4 (vom User durchgeführt):**
- HTML-Prototypen aus dem externen Designabteilung-Ordner ins Repo unter
  `public/prototypes/` committet (Option A nach Prototyp-Location-Diskrepanz
  aus Sprint-3-Review §11). CLAUDE.md §3 Dateistruktur jetzt vollständig
  realität-treu.