# Projekt-Historie — Antigravity Finance

> **Was das hier ist:** der vollständige Sprint- und Meilenstein-Log des Projekts,
> von der Initialisierung am 3. Mai 2026 bis heute. Bis zum 04.08.2026 stand er als
> Abschnitt 10 in `CLAUDE.md` und wuchs dort auf 1.293 Zeilen — 70 % einer Datei,
> die **jede** Sitzung vollständig lädt. Seit dem Struktur-Sprint v2-08 liegt er hier
> und wird nur noch gelesen, wenn jemand etwas Bestimmtes nachschlägt.
>
> **Regel:** append-only. Bestehende Einträge werden nicht umgeschrieben — auch dann
> nicht, wenn sich später herausstellt, dass eine Annahme falsch war. Die Korrektur
> kommt als neuer Eintrag. Der Wert dieses Logs liegt darin, dass er zeigt, was man
> **damals** wusste.
>
> **Wann du hier nachschlägst:**
> - Eine Regel in `CLAUDE.md §7` ist knapp formuliert und du willst wissen, welcher
>   konkrete Vorfall sie erzeugt hat (jede Lesson Learned nennt ihren Sprint).
> - Du brauchst einen historischen Prüfwert der Sparrate oder einen alten DB-Stand.
> - Du willst wissen, warum eine Entscheidung so und nicht anders gefallen ist.
>
> **Wo die Kurzform steht:** `CLAUDE.md §7` (Regeln, in Kraft) und `CLAUDE.md §8`
> (Lessons-Learned-Register, eine Zeile je Regel mit Verweis hierher).
>
> **Was hier NICHT steht:** der aktuelle Stand. Der steht in `CLAUDE.md §9`, die
> offenen Themen in `V2/v2_roadmap_konsolidiert.md`.

---


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
  Wrappers, sonst bleibt stehen. **In Sprint 4 mitgefixt** — alle Wrapper jetzt
  konsistent Throw-on-Error außer `isCardActiveInMonth` (dokumentierte Ausnahme).
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

### Sprint 4 · APPROVED 16. Mai 2026
**Komponente:** Karten — Fixkosten, Einnahmen, Budget (Design-Doku §7).
Drei Karten-Typen × drei Zustände, Tap-Interaktion (Fixkosten + Einnahmen),
Kontextmenü mit „Betrag anpassen" (zwei Pfade: nur dieser Monat /
dauerhaft ab diesem Monat). Karussell-Sortierung FIXED_COST → INCOME →
BUDGET. **Bewusster Scope-Cut:** destruktive Kontextmenü-Aktionen
(„Letzte Zahlung in Monat X" + „Karte löschen") nach Sprint 8 verschoben,
da sie Soft-Delete-Pattern + Toast-UI voraussetzen.

**Voraussetzungen erfüllt:** Sprint 3 grün auf `main`. Architekten-Sanity-
Check 16. Mai 2026 bestätigt: alle 4 Karten-Hot-Path-RPCs
(`calculate_card_amount_for_month`, `is_card_active_in_month`,
`get_planned_amount_for_month`, `get_split_factor`) live, spec-konform,
keine Migration nötig. Test-Daten via Architekten-SQL applied am 16. Mai
2026: 7 Karten (Miete/Strom GEMEINSAM, Netflix/Auto-Vers./Steuer/Tanken/
Essen ICH), 8 `card_planned_timeline`-Zeilen (Strom hat 2 für Forward-
Inheritance-Test ab Mai), 3 `card_monthly_states`-Zeilen (Strom paid Mai,
Steuer received März, Tanken adj 250 € Mai), 1 `fragment` (Edeka 360 €
Mai) + 1 `card_fragment_link` zur Essen-Budget-Karte für Überschritten-
Visual-Test. Branch `sprint/04-cards`.

**Implementierung (Initial-feat-Commit + 3 Korrektur-Iterationen, gesamt
~1500 LOC netto):**
- `src/lib/rpc.ts` (MODIFIED) — 4 neue Wrapper für Karten-Hot-Path-RPCs,
  alle Throw-on-Error. **LL-2-Fix umgesetzt:** `estimateNetMonthly` wirft
  jetzt konsistent (vorher: schluckte Errors). `onboarding-form.tsx` mit
  try/catch um die beiden Aufrufer-Stellen ergänzt, damit UI nicht crasht.
- `src/components/cards/` (NEU, 7 Dateien): `index.tsx` (Karussell-Wrapper),
  `card.tsx` (Server-Component Single-Card-Render alle 3 Typen),
  `card-interactive.tsx` (Client, Tap + Kontextmenü), `adjust-amount-overlay.tsx`
  (Client, Overlay mit zwei Pfaden), `actions.ts` (Server Actions
  `toggleCardTap`, `applyAdjustmentThisMonth`, `applyAdjustmentForward`),
  `cards.module.css` (Layout + alle Karten-Styles + Overlay), `cards.types.ts`.
- `src/app/page.tsx` (MODIFIED) — Cards-Loading-Pipeline: `cards`-SELECT
  → `isCardActiveInMonth` parallel → Beträge + Plan + Monthly-State via
  `Promise.all` → Sortierung FIXED→INCOME→BUDGET, dann
  `localeCompare("de-DE")`.

**Architektur-Entscheidungen:**
- **E1** Schema-Spaltennamen-Korrektur: Die Spalten in `cards` heißen
  `type`, `attribution`, `frequency` (ohne `card_`-Präfix). Briefing-
  Skeleton hatte fälschlich `card_type` etc. → siehe LL-7 unten.
- **E2** Kontextmenü als `position: fixed` via `getBoundingClientRect()`:
  `overflow-x: auto` am Karussell-Container erzwingt per CSS-Spec
  `overflow-y: non-visible` → absolut positionierte Kinder würden geclipt.
  → siehe LL-6 unten.
- **E3** Kein `overflow: hidden` auf `.card`: würde CardInteractive-
  Overlays (Kontext-Icon als `position: absolute`) clippen.
- **E4** Budget-Attribution hardcoded `"ICH"` im `MetaRow`-Render statt
  aus DB-Spalte. Begründung: §7 + DB-Constraint garantieren immer `ICH`.
  Code kommuniziert die Absicht explizit.
- **E5** `isCardActiveInMonth` schluckt Errors (gibt `false` bei DB-Fehler
  statt zu werfen). Einzige RPC-Wrapper-Ausnahme zur LL-2-Regel. Begründung
  im Wrapper-Kommentar dokumentiert: Ein RLS-/Netz-Fehler bei einer
  einzelnen Karte soll nicht den gesamten Karten-Render blockieren.

**Korrekturen während Sprint (3 Iterationen):**
- **K1** (Sonnet 4.6): Outside-Click-Handler in `card-interactive.tsx`
  schloss das Kontextmenü bevor das Click-Event auf einem Menü-Item feuern
  konnte — der `mousedown`-Handler prüfte nur `iconRef.current.contains(target)`,
  und das Menü-Element ist DOM-seitig kein Kind des ⋯-Icons. Fix: `menuRef`
  als zweiter `useRef` hinzugefügt, Outside-Check prüft jetzt sowohl
  Icon- als auch Menu-Ref.
- **K2** (Opus 4.7 — Eskalation nach unvollständigem Sonnet-K1): CSS/DOM-
  Coupling — Kontextmenü-Sichtbarkeit war an `.card:hover`-Selektoren in
  `cards.module.css` gekoppelt, sodass das Menü zwar via `useState(isOpen)`
  gerendert wurde, aber CSS-seitig nur bei Karten-Hover sichtbar war.
  Klick auf ⋯ ohne Cursor-Bewegung → Menü unsichtbar. Diagnose über
  4 User-Screenshots (Cursor in 4 Positionen). Fix: Sichtbarkeits-Coupling
  vollständig entkoppelt (Details im `sprint_04_review.md` K2-Append).
  → siehe LL-6 unten.
- **K3** (Opus 4.7): „Dauerhaft ab diesem Monat" hat existierende
  `card_monthly_states.adjusted_amount` für den aktuellen Monat nicht
  geclear-t. Prioritätskette §4 (Realität → Anpassung → Plan) ließ die
  alte Anpassung gewinnen, sodass der neue Plan nicht sichtbar wurde.
  User-Intent war aber „neue Baseline ab jetzt". PM-Entscheidung:
  `applyAdjustmentForward` setzt zusätzlich `adjusted_amount = NULL` für
  `effective_month` (nur diesen Monat, nicht zukünftige; Tap-Status
  `manually_paid` unberührt). → siehe LL-8 unten.

**Browser-Smoke-Test (User):** 24/24 Schritte grün nach K3, plus Bonus-
Test eines kreativen User-Szenarios („Dauerhaft 25 → Nur dieser Monat 100
→ Dauerhaft 25" — Karte zeigt 25 €). S5 (Forward-Inheritance Strom Mai
110 €) bestätigt. S8 (Tanken-Adjustment-Edge-Case: Plan 200 + Adj 250
ohne Fragmente → „Überschritten −50 €") als erwartetes V1-Verhalten
akzeptiert. 1s-Tap-Latenz beobachtet und für V1 akzeptiert (Server
Action + revalidate ohne optimistic UI — bewusste LL-5-Vermeidung).

**Lessons Learned in CLAUDE.md integriert:**
- **LL-6** (§7 Datei-Konventionen): Overlays / Kontextmenüs / Tooltips
  innerhalb eines Clipping-Containers (`overflow-x: auto`, `overflow:
  hidden`) brauchen entweder `position: fixed` mit
  `getBoundingClientRect()`-Positionierung oder React-Portal-Extraktion.
  **Zusätzlich:** Sichtbarkeits-CSS (Opacity, Visibility, Display) NIE
  an Eltern-Hover-Selektoren koppeln, wenn das Element via
  `useState(isOpen)` gesteuert wird — sonst Phantom-Sichtbarkeit.
  Diagnose-Pattern: vier Screenshots in vier Cursor-Positionen (Hover ⋯
  / direkt nach Click / Karten-Mitte / off-card) reichen typischerweise
  zur Differential-Diagnose.
- **LL-7** (§6 Schema-Referenz): `cards`-Spalten heißen `type`,
  `attribution`, `frequency` ohne `card_`-Präfix. Briefings dürfen das
  nicht als `card_type` etc. spezifizieren — Schema-Doku ist Quelle.
  Bei Diskrepanz: zur Schema-Doku gehen, nicht zur Briefing-Annahme.
- **LL-8** (§10 dieser Eintrag, K3-Block): „Dauerhaft ab diesem Monat = X"
  via `card_planned_timeline`-UPSERT clear-t zusätzlich
  `card_monthly_states.adjusted_amount` für `effective_month` selbst.
  Begründung: User-Intent ist „neue Baseline ab jetzt", nicht „Plan
  ändern aber alte Anpassung als Override behalten". Tap-Status
  (`manually_paid`) bleibt unberührt. Zukünftige Monats-Adjustments
  werden nicht geclear-t (nicht-destruktiv für andere User-Intents).

**Modell-Empfehlung-Befund:** Sprint 4 erforderte 1× Sonnet 4.6
(Initial-Implementation + K1) und 1× Opus 4.7 (K2 + K3). Switch zu
Opus war notwendig, nachdem Sonnet bei K2 nur eines von zwei Symptomen
gelöst hatte. Konsequenz: §9 Modell-Empfehlungen um Eskalations-
Heuristik ergänzt.

**Test-Daten-Lebenszyklus:** Die in Sprint 4 angelegten Test-Karten +
Plan-Timeline + Monthly States + Fragment-Link bleiben in der DB.
Sprint 5 (Untere Interaktionszone) und Sprint 6 (Sparrate-Verifikation)
bauen darauf auf — Pre-Sprint-SQL-Aufträge dort werden ggf. nur kleinere
Anreicherungen benötigen statt komplettem Reset.

**Offene Frage zur Beobachtung in Sprint 5/6:** Die Sprint-4-Tap-
Interaktion hat eine ~1s-Latenz wegen Server Action + Revalidate.
Wenn Sprint 5 die Untere Interaktionszone (Fragments) baut und sich
ähnliche Latenzen bei Drag&Drop zeigen, ist optimistic UI ein
sinnvoller V1.1-Refactor — dann global, nicht ad-hoc. Bei Implementierung:
LL-5-Reset-Pattern (`useEffect` auf `targetMonth`-Prop) pflichten, sonst
überlebt optimistic State die Monatsnavigation falsch.

### Sprint 5 · APPROVED 17. Mai 2026
**Komponente:** Untere Interaktionszone (Design-Doku §8) — Portal links
(CSV-Stub) / Karussell-Erweiterung mitte (Chevrons + Empty-Slot + Drop-
Targets) / Fragment-Stack rechts (HTML5-DnD-Quellen aus
`fragments_with_status`-View). Plus Eject-Flow über Kontextmenü-Option
„Verknüpfte Fragmente" auf den Karten. Plus Bonus-Scope: linke-Flanke-
Subzeile im Header gewired auf `fragments_with_status`-Count (Sprint-7-
TODO aus Sprint 3 erledigt).

**Voraussetzungen erfüllt:** Sprint 4 grün auf `main`. Architekt-Pre-
Sprint-Vorarbeit am 17. Mai 2026 (zwei atomic Multi-INSERT-RPCs für
DEFERRED-Constraint-Umgehung): `create_card_direct(p_name, p_type,
p_attribution, p_frequency, p_first_active_month, p_last_active_month,
p_planned_amount)` returns `uuid`, und `create_card_from_fragment(...
plus p_fragment_id, p_link_month)` returns `uuid`. Beide
`SECURITY INVOKER`, atomare Card+Plan-Inserts (+ Link bei der zweiten),
defensive Server-Side-Validation (ONCE → first=last, BUDGET → ICH erzwingt).
Test-Daten-Anreicherung via Architekten-SQL: 6 unzugeordnete Fragmente
(4 Mai 2026 / 1 April / 1 März, idempotent via `ON CONFLICT (user_id,
hash) DO NOTHING`) seedet, plus bestehendes Sprint-4-Edeka-Fragment
unverändert. Branch `sprint/05-interaction-zone`.

**Implementierung (9 Commits total: 1 chore + 1 feat + 3 fix + 4 docs):**
- `src/lib/supabase/types.ts` (regenerated) — neue RPCs typed.
- `src/lib/rpc.ts` (MODIFIED) — Wrapper für `create_card_direct`,
  `create_card_from_fragment`, `get_effective_plan_for_month`. Alle
  Throw-on-Error (LL-2).
- `src/components/interaction-zone/` (NEU, ~12 Dateien) — `index.tsx`
  (Server, Trinity-Layout + Data-Loading), `portal.tsx` (Client, 5-State
  Machine mit Stub-Sequenz 2s Verarbeitung → 1.5s Erfolg → Reset),
  `carousel.tsx` (Chevrons mit hide-when-not-scrollable + Empty-Slot),
  `empty-slot.tsx` (Click + Drop-Target), `fragment-stack.tsx`,
  `fragment-card.tsx`, `drop-target-wrapper.tsx` (wraps Sprint-4-Karten
  ohne deren Internals zu touchen — A2-konform), `recurrence-popup.tsx`,
  `direct-create-overlay.tsx`, `linked-fragments-overlay.tsx`,
  `actions.ts` (5 Server Actions), `interaction-zone.module.css`,
  `interaction-zone.types.ts`.
- `src/components/cards/card-interactive.tsx` (MODIFIED, minimal) — neue
  Kontextmenü-Option „Verknüpfte Fragmente" — conditional sichtbar nur
  wenn ≥1 verknüpftes Fragment im `targetMonth`.
- `src/components/cards/cards.module.css` (MODIFIED, minimal) — `min-height`
  für Karten-Gleichgrößigkeit (K1.1).
- `src/components/header-timeline/index.tsx` (MODIFIED) — Subzeile
  linke Flanke aus Prop `unassignedPreviousMonthCount: number`, Labels
  `Alles erledigt` / `1 Fragment offen` / `n Fragmente offen`.
- `src/lib/format.ts` (NEU) — `formatEuro` mit 2 Nachkommastellen für
  Karten, `formatEuroRing` ohne Dezimalen für Ring (K1.6).
- `src/app/page.tsx` (MODIFIED) — Fragment-Loading, linke-Flanke-Count,
  pro-Karte 3 Daten-Punkte (`displayed_amount`, `effective_plan`,
  `fragment_sum`) via `Promise.all`.

**Architektur-Entscheidungen:**
- **E1** Chevron-Navigation hide-when-not-scrollable: Briefing-Spec war
  „disabled wenn nicht scrollbar", User-Smoke akzeptierte „hidden" (UX-
  Standard). Pragma-Pattern für UI-Navigation.
- **E2** `DropTargetWrapper` als äußere Komponente um Sprint-4-Card —
  hält Sprint 4 strukturell intakt (A2). Drop-Handler + Outline am
  Wrapper, Card-Internals unberührt.
- **E3** Portal-Dev-Buttons NODE_ENV-gated (analog Sprint-2-Force-
  Override). Production-Bundle-Grep verifiziert 0 Treffer.
- **E4** Drag-Type-Discriminator via `dataTransfer.types` + Custom-MIME
  `application/x-fragment-id`. Erlaubt zukünftige Drag-Quellen (z. B.
  Karten-Drag in Sprint 9) ohne Cross-Talk. → LL-9, LL-10.
- **E5** Fragment-Stack zeigt alle Monate (nicht monatsgefiltert) —
  Spec-konform mit §8 „Rohmasse". Cross-Monat-Drop setzt `link_month =
  targetMonth`, nicht `fragment.transaction_date` (Konflikt 4 §7).
- **E6** Overlays via `position: fixed` + Backdrop, harmonisiertes
  CSS-Pattern mit Sprint-4-`adjust-amount-overlay`. Visibility
  ausschließlich `useState(isOpen)`, keine Hover-Kopplung (LL-6).

**Korrekturen während Sprint (2 Iterationen):**
- **K1** (Sonnet 4.6) — fünf-Punkte-Korrektur nach Browser-Smoke:
  K1.1 Karten-Größen via `min-height` vereinheitlicht.
  K1.3 Drop-Outline von Teal auf Grau (Token-Variable für Drop-Outline
  ergänzt).
  K1.4 (kritisch) Frontend-Refactor: Vergleichsbasis ist nicht mehr
  `cards.planned_amount` (Roh-Plan), sondern `get_effective_plan_for_month`
  (Adjustment-aware). Status-Logik, „Noch frei"-Formel und
  Fortschrittsbalken-Math nutzen `effective_plan` statt `planned_amount`.
  Pro Karte 3 Daten-Werte: `displayed_amount` (aus
  `calculate_card_amount_for_month`), `effective_plan` (neu), `fragment_sum`
  (direktes Aggregat). N+1-Query-Pattern via `Promise.all` parallelisiert,
  V1-Pragma; Bulk-RPC `get_cards_with_effective_plan_for_month` Sprint-6-
  Vormerkung bei Latenz-Problem. → LL-11, LL-12.
  K1.5 Overlay-Layout-Harmonisierung: drei neue Overlays übernehmen
  Sprint-4-`adjust-amount-overlay`-Pattern (Modal-Box, Input-Stack,
  Button-Stack, Titel-Hierarchie, Backdrop). Gemeinsame CSS-Klassen
  extrahiert.
  K1.6 `formatEuro` mit 2 Nachkommastellen für alle Karten + Sub-Texte +
  Stack-Fragmente + Overlays. Ring nutzt eigene `formatEuroRing`-Variante
  ohne Dezimalen.
- **K2** (Sonnet 4.6) — Overlay-Background-Harmonisierung: K1.5 hatte
  Layout korrigiert, aber Background-Color + Backdrop-Filter wichen vom
  Sprint-4-Pattern ab (transparenter Hintergrund, Ring sichtbar). K2 hat
  Background + Backdrop konsolidiert. Alle vier Overlays visuell identisch.

**PM-Briefing-Korrektur K1.4 (LL-11-Trigger):** Initial-Briefing K1.4 v1
formulierte einen RPC-Patch-Auftrag an den Architekten. Architekt
verifizierte: `calculate_card_amount_for_month` ist seit V1 Fragment-aware
und §4.3-konform; der Bug war Frontend-side (Roh-Plan-Vergleich statt
Adjustment-aware-Vergleich). PM hat K1.4 v2 als Frontend-Refactor
re-formuliert, Architekt hat additiv die Helper-RPC
`get_effective_plan_for_month` aus Sprint 6 vorgezogen geliefert. Lesson:
PM darf bei Frontend↔RPC-Diskrepanzen keinen Patch-Auftrag formulieren
bevor Architekt die Bug-Lokalisierung verifiziert hat. → LL-11.

**Smoke-Test-Korrektur K2 (LL-12-Trigger):** PM-Briefing K1.4 v2 hatte
in der Akzeptanz-Tabelle für Tanken (BUDGET-Karte, Plan 200, Adj 250,
Aral-Fragment 42,80) erwartet: `42,80 € · OFFEN`. Korrekt gemäß §4.3.3:
`250 € · LAUFEND · Noch 207,20 € frei` — bei BUDGET zählt Plan, solange
Fragmente ≤ Plan. PM hatte §4.3.1-Faustregel „Realität gewinnt"
unzulässig auf BUDGET projiziert. Code war trotzdem korrekt, weil
`calculate_card_amount_for_month` selbst BUDGET-aware ist. Lesson:
Karten-Typ in Briefing-Erwartungs-Tabellen explizit nennen + §4.3-Sub-
Tabelle referenzieren. → LL-12.

**Browser-Smoke-Test (User):** S1–S24 alle grün nach K2. Sprint-5-Code-
Diff ~2.700 LOC in 21 Files, Bundle +11 KB minified (deutlich unter
Briefing-Prognose 40–60 KB). Production-Build-Greps clean (0 Touch/
Swipe-Strings in `chunks/app/`, 0 Dev-Buttons-Strings).

**Lessons Learned in CLAUDE.md integriert:**
- **LL-9** (§7 Datei-Konventionen): Drag-Quellen via
  `dataTransfer.setData("application/x-<typ>-id", id)`, Drop-Targets
  prüfen MIME-Type via `dataTransfer.types`. Custom-MIME-Discriminator
  statt globalem State. Drop-Targets MÜSSEN `preventDefault` auf
  `dragover` aufrufen.
- **LL-10** (§7 Datei-Konventionen): `useRef`-Counter gegen nested-
  `dragenter`-Flackern auf Drop-Targets.
- **LL-11** (§7 Grundregel 11): PM-Architekten-Verifikations-Reihenfolge
  bei Frontend↔RPC-Diskrepanzen — Architekt-Sanity-Check vor Patch-Auftrag.
- **LL-12** (§7 Grundregel 10): Karten-Typ in Briefing-Erwartungen
  explizit nennen, §4.3-Sub-Tabelle referenzieren. „Realität gewinnt"
  gilt nicht universell — BUDGET zeigt Plan solange Fragmente ≤ Plan.
- **LL-13** (§7 Grundregel 11, Sprint 6 K1): Frontend↔Spec-Diskrepanzen
  folgen derselben PM-Verifikations-Reihenfolge wie Frontend↔RPC-
  Diskrepanzen. PM prüft Spec-Bezug (mit Design-Doku-Referenz) bevor ein
  Patch-Auftrag formuliert wird. Erst nach PM-Freigabe darf Claude Code den
  Patch ausführen — auch wenn die Spec eindeutig scheint. Sprint-6-Beispiel:
  §7-Konflikt-6 (fragment-link allein reicht für Bezahlt-Status) war in der
  Spec klar, aber der Patch-Auftrag kam korrekt erst nach PM-Freigabe.

**Test-Daten-Lebenszyklus nach Sprint 5:** 7 Fragmente in DB (1 Sprint-
4-Edeka + 6 Sprint-5-Seed); davon mindestens 2 ASSIGNED (Edeka ↔ Essen,
Stadtwerke ↔ Wasser); ggf. 1 weiteres (Aral ↔ Tanken je nach Smoke-
Endstand). 9 Karten (Sprint-4-Bestand + Sprint-5-Smoke-Anlagen „Wasser"
FIXED_COST/GEMEINSAM/MONTHLY und ggf. „Testkarte" BUDGET/ICH/ONCE Mai
2026). Inventur-SQL für Sprint-6-PM in `pm_handover_sprint_5.md` §3.

**Sprint-6-Vormerkungen aus Sprint 5:**
- **V1 BUDGET-Tap-Geste** — Read-Pfad ready
  (`calculate_card_amount_for_month` ist §4.3.3-konform), Write-Pfad
  offen. PM-Empfehlung: neue Architekten-RPC `toggle_card_manually_paid`
  (analog FIXED_COST-Tap-Pfad).
- **V2 Sprint-4-`CardsCarousel`-Orphan-Cleanup** — Sprint 5 nutzt eigenes
  Karussell, Sprint-4-Komponente nicht mehr aufgerufen.
- **V3 Bulk-RPC `get_cards_with_effective_plan_for_month`** — bedingt,
  nur falls N+1-Query-Latenz beim User-Smoke spürbar.
- **V4 Sprint-7-Distiller-Architekten-Vorklärung** — optional als
  parallel-Architekten-Auftrag.

**Modell-Empfehlung-Befund:** Sonnet 4.6 durchgehend, keine Opus-
Eskalation nötig. K1+K2 waren CSS + Number-Format + Status-Logik-
Refactor — Sonnet-Komfortzone.

### Sprint 6 · APPROVED 20. Mai 2026
**Komponente:** Sparrate-Verifikation (Design-Doku §4.6) — harter Gate-Sprint,
kein Feature-Sprint. Ziel: Frontend zeigt genau 2.910,01 € Sparrate für März
2026 beim Test-User (UUID `179cd2c1-bbc2-4fd0-954b-8735eb90f370`). Branch
`sprint/06-sparrate-verification`.

**Voraussetzungen erfüllt:** Sprint 5 grün auf `main`. Architekt-Pre-Sprint-
Verifikation bestätigt: alle §4.6-RPCs liefern cent-exakte Werte (Ist-Sparrate
2910.01 €, Plan-Sparrate 2890.01 €). Keine RPC-Migration nötig.

**Implementierung (1 fix-Commit + 3 docs-Commits):**
- `src/components/cards/card.tsx` (MODIFIED, K1) — `resolveFixedCostState`
  und `resolveIncomeState` prüfen jetzt zusätzlich
  `(card.linkedFragments?.length ?? 0) > 0` als Bezahlt-Indikator gem.
  §7 Konflikt 6. Vorher: nur `manuallyPaid`. `resolveBudgetState` unberührt
  (K1-Anti-Drift-Regel D1).

**Korrekturen während Sprint (1 Iteration):**
- **K1** (Sonnet 4.6, nach PM-Freigabe LL-13): Frontend-Status-Bug —
  `resolveFixedCostState` und `resolveIncomeState` ignorierten
  `card_fragment_links` als Bezahlt-Signal. §7 Konflikt 6: fragment-link
  allein (ohne manually_paid=true) reicht für Bezahlt-/Erhalten-Status.
  Betroffene Karten im Smoke: Miete (FIXED_COST, Fragment vorhanden →
  sollte BEZAHLT, zeigte OFFEN) und Steuerrückzahlung (INCOME, Fragment
  vorhanden → sollte ERHALTEN, zeigte ERWARTET). Fix: `hasFragment`-Check
  in beiden State-Resolvern ergänzt, Condition `card.manuallyPaid` →
  `card.manuallyPaid || hasFragment`. Kein n+1: `card.linkedFragments`
  war bereits monatsgefiltert im `EnrichedCard`-Typ aus der
  `page.tsx`-Loading-Pipeline. Re-Smoke R1–R12: alle grün.

**Browser-Smoke-Test (User):** S1–S22 nach K1 alle grün. Sparrate-
Anzeige im Ring: `2.910 €` (formatEuroRing, 0 Dezimalen). RPC-Wert
2910.01, Plan-Sparrate 2890.01. Tanken: 180 € · LAUFEND (BUDGET, Tap +
Aral-Fragment 42,80 € ≤ Plan 200 → Realität per §4.3.3, d. h.
180 € = 200 − 42,80 − ⌊Tap-Malus⌋ nein — §4.3.3 Realität = Σ Fragmente
solange Fragmente ≤ Plan, hier 42,80 ≤ 200 → Plan displayed; RPC liefert
180 aus Tap+Fragment-Kombination §4.3.3 Zeile 4).

**V1-Lücken (nicht gefixt, V1-expected):**
- BUDGET-Tap-Visual: Tanken ist manually_paid=true, zeigt weiterhin
  LAUFEND (roter Status) — §7 definiert nur 3 BUDGET-Zustände
  (Laufend/Überschritten/Ghost), kein Bezahlt-Visual für Budget-Karten.
  BUDGET-Tap-Write-Pfad (Sprint-5-Vormerkung V1) nicht in Sprint 6 gelandet.
- Income-Split-Popup: Briefing S21 hatte Popup-Test spezifiziert, aber
  §10-Komponente ist im `/onboarding`-Flow — ohne separaten Dashboard-
  Navigations-Entry für Test-User nicht erreichbar. Briefing-Lücke, kein
  Code-Bug.

**Lessons Learned in CLAUDE.md integriert:**
- **LL-13** (§7 Grundregel 11, Sprint 6 K1): PM-Freigabe vor Frontend-
  Spec-Patch — auch bei eindeutiger Spec. Keine Selbst-Patches.

**Modell-Empfehlung-Befund:** Sonnet 4.6 durchgehend. Opus 4.7 war als
Gate-Modell vorgesehen, aber K1 war eine klare Spec↔Frontend-Diskrepanz
ohne CSS/DOM-Diagnosekomplexität — Sonnet-Komfortzone. §9 aktualisiert.

### Sprint 7 · APPROVED 21. Mai 2026
**Komponente:** UI-Komplettierung — V1 BUDGET-Tap-UI (neuer §7-Zustand
„Abgeschlossen") + V6 §10 Income-Split-Popup-Dashboard-Trigger (klickbare
ICH/PARTNER-Labels neben dem Ring) + V2 `CardsCarousel`-Orphan-Cleanup. Drei
sequenzielle Phasen, Phasen-eigene Commits gemäß LL-14. Branch
`sprint/07-ui-completion`.

**Voraussetzungen erfüllt:** Sprints 0–6 grün auf `main`. Architekt-Pre-
Sprint-7 Stufe 1 (RPC `toggle_card_manually_paid` 7/7 PASS, idempotenter
Toggle, Past-Month-Policy B). Architekt-Stufe 2 (Test-Daten Mai 2026:
Hobby + Auswärts Essen + 2 Fragmente) liefert verifiziert §4.6-Anker
unangetastet.

**Implementierung (6 Commits auf `sprint/07-ui-completion`):**
- `docs: sprint 7 briefing`
- `chore: regenerate supabase types after toggle_card_manually_paid RPC` —
  `src/lib/supabase/types.ts` mit neuer RPC-Signatur typisiert
- `chore: remove orphaned sprint-4 cards carousel wrapper` —
  `src/components/cards/index.tsx` (Phase 1, V2-Cleanup)
- `feat: wire income-split popup to dashboard click trigger (v6)` — neue
  Komponente `src/components/income-labels/` (Label-Avatare + Klick-Trigger),
  `src/app/page.tsx` rendert Ring-Row in Flex mit ICH/PARTNER-Labels;
  bestehende `src/components/income-split/`-Komponente unverändert,
  Dashboard-Trigger nutzt `isFirstIncomeEntry={false}` → Steuerklasse-
  Sektion versteckt (Phase 2, V6)
- `feat: enable budget card tap with abgeschlossen visual state (v1)` —
  RPC-Wrapper `toggleCardManuallyPaid` in `src/lib/rpc.ts` (Throw-on-Error);
  Server Action `toggleCardTap` refactored auf RPC, einheitlicher Schreibpfad
  für alle 3 Card-Types; Tap-Catcher für BUDGET aktiviert; neuer §7-Zustand
  `Abgeschlossen` für BUDGET in `src/components/cards/card.tsx` +
  `cards.module.css` (Phase 3, V1)
- `docs: sprint 7 review` mit K1-Diagnose-Append (kein Code-Patch)

**Korrekturen während Sprint:** keine. K1 (siehe unten) war Diagnose-only.

**K1 — Diagnose-only, kein Code-Bug:** User-Smoke S22/S23 schlugen fehl
(Tap auf Steuerrückzahlung INCOME März → kein visueller Wechsel). Tiefen-
Diagnose ergab: DB-Toggle funktional (D2-VOR `false`, NACH `true`), aber
Sprint-6-K1-Logik (`resolveIncomeState`: `card.manuallyPaid || hasFragment`)
verhindert visuellen Statuswechsel bei Fragment-verlinkter Karte. Sprint-
7-Code unverändert in `resolveIncomeState`. PM-Smoke-Test-Spec-Fehler,
nicht Sprint-7-Regression. PM-Entscheidung 21.05.2026: kein Patch, S22/S23
als ⊘ markiert. → LL-15.

**Browser-Smoke-Test (User):** 19/22 grün. Alle BUDGET-Visual-Pfade (S13/S14/
S17/S18/S19 inkl. neue ABGESCHLOSSEN-Sub-Varianten für `diff > 0` teal und
`diff < 0` rot mit Teal-Checkmark), Income-Split-Dashboard-Trigger (S3/S4/S7/
S8/S10), FIXED_COST-Tap-Regression (S20/S21), BUDGET-Past-Month-Toggle
(S25/S26 → §4.6-Anker `2910.01` bestätigt). 1× ✗ S5 (PM-Spec-Fehler in
Briefing-Erwartung; tatsächliches Verhalten korrekt — bei höherem Brutto
ohne Netto-Änderung sinkt die Sparrate erwartungskonform). 2× ⊘ S22/S23
(K1, siehe oben).

**V1-Lücken / Sprint-8-Vorlauf:**
- INCOME-Tap auf Fragment-verlinkter Karte ist visueller NoOp (Sprint-6-K1-
  Logik). Reevaluation §7 Konflikt 6 für INCOME mit Design-Direktor in
  Sprint 8 — soll Tap-Catcher visuell NoOp bleiben oder gar nicht rendern?
- Test-User-Setup hat keine MONTHLY-INCOME-Karte ohne Fragment-Link →
  INCOME-Tap-Toggle-Pfad ist nicht sinnvoll smoke-bar. Architekt-Auftrag
  Pre-Sprint-8: MONTHLY-INCOME-Karte anlegen (z. B. „Lohn ICH" 3.100 €
  net, MONTHLY, first_active Januar 2026, keine Fragmente).
- BUDGET-Ghost-Bedingung (`isPast && !manuallyPaid && fragment_sum == 0`)
  ist spec-konform implementiert, aber nicht im Standard-Smoke testbar
  (Test-Daten-Lücke). Optional Sprint-8-Erweiterung.
- DEV-Buttons in `dashboard-dev-panel.tsx` bleiben NODE_ENV-gated. Production-
  Bundle elidiert sie via Tree-Shaking — bewusste Sprint-7-Entscheidung
  zur Refactor-Risiko-Minimierung.

**Lessons Learned in CLAUDE.md integriert:**
- **LL-14** (§7 Grundregel 12, Sprint 7 PM-Pattern): Phasen-sequenzielle
  Multi-Komponenten-Sprints.
- **LL-15** (§7 Grundregel 13, Sprint 7 K1): PM-Smoke-Test-Plans gegen
  Cross-Sprint-Konflikt-Regeln prüfen.

**Schreibpfad-Vereinheitlichung:** `toggle_card_manually_paid` ist seit
Sprint 7 der **einzige** Schreibweg auf `card_monthly_states.manually_paid`
für alle Card-Types (FIXED_COST, INCOME, BUDGET). Kein dualer UPSERT-Pfad
mehr in `src/components/cards/actions.ts`. AD2 Sprint 7.

**Design-Doku §7-Patch:** Sektion „Budget-Karte — 3 Zustände" zu
„4 Zustände" aktualisiert (separater Doku-Patch durch PM nach Sprint-7-
Approval). §5 Bekannte Abweichungen Eintrag 3 als aufgehoben markiert.

**Modell-Empfehlung-Befund:** Sonnet 4.6 durchgehend. Briefing-Spec war
klar genug, keine CSS/DOM-Diagnose-Komplexität. Eskalations-Heuristik §9
nicht ausgelöst. Sprint 7 bestätigt LL-14 + Spec-präzise Briefings als
verlässliche Sonnet-Komfortzone für UI-Komplettierungs-Sprints.

### Sprint 8 · APPROVED 23. Mai 2026
**Komponente:** CSV-Import + Distiller (§11) DKB-only + Konflikt-6-Cleanup
INCOME-Tap-Catcher + Mini-Patches Fragment-Stack-Sortierung (§10 Spec-Lücke)
und Income-Split-Avatar-Icon (pre-existing Gap). Sieben sequenzielle Phasen,
Phasen-eigene Commits gemäß LL-14. Branch `sprint/08-csv-import`.

**Voraussetzungen erfüllt:** Sprints 0–7 grün auf `main`. Architekt-Pre-Sprint-8
Stufe 1 (Test-Karte „Nebenjob" — INCOME / MONTHLY / `first_active_month
2026-05-01` / `planned_amount 200,00 €` / ohne Fragment-Link) erfüllt
Sprint-7-V1-Lücke. Architekt-Pre-Sprint-8 Stufe 2 (Distiller-Architektur-
Entscheidungen + RPC-Inventur): K-B/K-C atomare RPC + DB-seitiger Hash via
`pgcrypto.digest`, RPCs `calculate_match_confidence` / `name_similarity` /
`amount_match` / `frequency_match` LIVE + §11-konform. §4.6-Anker (`2910.01`)
intakt.

**Architekt-Sprint-Lieferung:** RPC `process_csv_import(p_rows jsonb)
RETURNS jsonb` LIVE in V2-Stand. V1 hatte PL/pgSQL-Pitfall `INSERT ... ON
CONFLICT DO NOTHING RETURNING id INTO v_var` (Variable bleibt NULL bei
Conflict-Pfad trotz INSERT-Erfolg) — Architekt-seitig via CTE-Pattern gefixt.
Frontend nicht betroffen. Enum-Klarstellung: `card_fragment_links.origin`
nutzt `'AUTO_ABSORBED'` (Past Tense, konsistent mit `'MANUAL_DROP'`).

**Implementierung (7 Commits auf `sprint/08-csv-import`):**
- `sprint-8 p0: income tap-catcher only renders when no fragment linked` —
  `IncomeCard` (`card.tsx`): `tappable = !hasFragment`, `renderTapCatcher`
  per DD-Spec. `cards.module.css`: `.notTappable { cursor: default }` +
  Hover-Lift-Suppression. State-Resolution unverändert. (Phase P0)
- `sprint-8 p1: dkb csv parser with format detection and error classification`
  — neues framework-freies Modul `src/lib/dkb-csv.ts`. Format-Heuristik
  (Header `"Buchungsdatum"` in ersten 8 Zeilen + `;`-Separator), CSV-Tokenizer
  byte-exakt (kein Trimming), Feld-Mapping `DD.MM.YY` → ISO / deutscher Betrag
  / DKB-Bank-Adapter `description = "{Empfänger} | {Verwendungszweck}"`.
  14/14 interne Unit-Tests grün. (Phase P1)
- `chore: regenerate supabase types for process_csv_import` —
  `src/lib/supabase/types.ts`
- `sprint-8 p2: wire portal to process_csv_import rpc with full state machine`
  — `processCsvImport`-Wrapper in `rpc.ts` (Throw-on-Error), Server-Action
  `processCsvImportAction`, `portal.tsx`-Stub raus, echte Pipeline-State-Machine
  gemäß §11. Dev-Buttons NODE_ENV-gated, Tree-Shaking intakt. (Phase P2)
- `sprint-8 p3: fragment stack refresh after import` — `processCsvImportAction`
  ruft `revalidatePath("/", "page")` nach RPC, RSC-Refetch-Pattern statt
  Realtime-Subscription. (Phase P3)
- `sprint-8 p4: ai suggestion badge rendering on fragment cards` —
  `FragmentRow` um `suggestedCardName` erweitert, Server-seitige Schwellen-
  Lesung via `app_config` (`badge_threshold` / `auto_absorption_threshold`),
  Badge-Text `KI-Vorschlag: {Name}` mit generischem Yellow-Soft-Akzent
  `rgba(255,200,60,.5)` (OQ1-Default). (Phase P4)
- `sprint-8 p5: fragment stack sort order (unassigned first, transaction_date asc)`
  — `FragmentRow` um `importedAt` erweitert, Comparator in `page.tsx`
  (4-stufig: Gruppe UNASSIGNED zuerst, dann `transaction_date ASC`,
  `imported_at ASC`, finaler Tiebreaker `description ASC` de-DE).
  PM-Patch-Auftrag wegen §10/§11-Spec-Lücke. (Phase P5)
- `sprint-8 p6: income split avatar icon (lucide User)` — inline-SVG
  Person-Silhouette in `.avatar`-Container für ICH + PARTNER, 1:1 aus Prototyp
  `income_split_final.html`. PM-Scope-Expansion wegen pre-existing Gap. (Phase P6)
- `docs: sprint 8 design-doc + claude.md patches` + `docs: sprint 8 closing artifacts`

**Doku-Patches (PM-Anwendung nach Sprint-Approval):**
- Design-Doku §7 Konflikt 6: INCOME-Spezialregel (Tap-Catcher nicht gerendert
  wenn `hasFragment === true`, Cursor `default`, `manually_paid` nicht
  UI-schreibbar). DD-Approval 22.05.2026.
- Design-Doku §11 Hash-Algorithmus: Bank-Adapter (DKB-Format, Pipe-Separator).
- Design-Doku §11 Schwellwert: Mehrfach-Match-Tiebreaker (höchster Score
  gewinnt, Tie → alphabetisch erster Karten-Name) — Sprint-8-OQ2/OQ3.
- Design-Doku §10 Fragment-Stack: Sortier-Regel (4-stufig) — Sprint-8-P5
  Spec-Lücke.

**Schema-Doku-Rotation:** Schema-Doku v2 → v3 als Architekten-Lieferung am
Sprint-8-Close abgeschlossen (23.05.2026). Ersetzt v2 als aktiven Snapshot.
Dokumentiert alle 6 neuen RPCs der Sprints 2–8, drei neue `fragments`-Spalten
(`confidence`, `suggested_card_id`, `imported_at`), `cards.deleted_at`
(Soft-Delete-Marker), `card_monthly_states.adjustment_scope` + `closed_at`-
Semantik aktualisiert (von `toggle_card_manually_paid` genutzt), View
`fragments_with_status` mit `AUTO_ABSORBED`-Status, neue Section 11 mit 13
funktionalen Indexes. v2 bleibt als historischer Snapshot.

**Browser-Smoke-Test (User):** S1.1/S1.2 grün (Konflikt-6-Cleanup INCOME),
S2.1–S2.4 grün (Parser intern, via Claude Code), S3.1/S3.2/S3.4/S5.1 grün
(echter DKB-CSV: Import / Re-Import-Dedup / Cross-Account-Pfad-A /
§4.6-Anker = `2910.01`). S3.3 (Stack-Sortierung) initial undefiniert →
PM-Patch P5 → grün. S4 (Badge + Auto-Absorb mit synthetischer CSV) im
realen Smoke organisch erfüllt durch echtes DKB-CSV — `KI-Vorschlag`-Badge
+ Auto-Absorb beobachtet.

**OQ-Entscheidungen:**
- OQ1 (Badge-Farbe): generisches `rgba(255,200,60,.5)` Yellow-Soft für alle
  KI-Badges. Karten-spezifische Farben = V2-C-Vormerkung.
- OQ2/OQ3 (Mehrfach-Match): höchster Score gewinnt, Tie → alphabetisch
  erster Karten-Name. In §11 dokumentiert (Doku-Patch oben), RPC-seitig in
  `process_csv_import` deterministisch implementiert.

**PM-Mini-Patches:**
- P5 (Sortier-Regel): Spec-Lücke in §10/§11, beim Browser-Smoke aufgefallen
  (S3.3 zeigte kein erkennbares Muster). PM-Entscheidung mit empirischer
  Referenz aus Prototyp `csv_import_drop_distill.html`. Tiebreaker-Erweiterung
  am Same-Day + Same-Import-Charge-Befund: `description ASC` (de-DE) als
  4. Schlüssel ergänzt.
- P6 (Avatar-Icon): pre-existing Gap im Income-Split-Component (Kreis leer,
  Avatar fehlte für ICH + PARTNER). User-Beobachtung beim S3.3-Smoke. PM-
  approved als Scope-Expansion.

**V1-Lücken / Sprint-9-Vorlauf:**
- V2-A: Cortal-Consors-Parser (anderes Format, 12 Vor-Header-Zeilen,
  `DD.MM.YYYY`, getrennte Betrags-/Währungs-Spalte). Sprint-Kandidat.
- V2-B: IBAN-Filter / `INTERNAL_TRANSFER`-Status für Cross-Account-Bewegungen.
  Aktuell Pfad A (User lässt Cross-Account-Fragmente unzugeordnet). Schema-
  Erweiterung `profiles.own_ibans[]` + `fragments.transfer_type` nötig.
  Sprint-Kandidat, ggf. zusammen mit V2-A.
- V2-C: Karten-spezifische Badge-Farben.
- V2-D: Drag-&-Drop von Fragmenten auf Karten — Existenz-Status prüfen.
- Soft-Delete-Pattern Karten (§2.4) — UX-Lücke „Karte aus Vergangenheit
  löschen", Sprint-9-Kandidat.
- Sparraten-Treppe (§9) — UI-Komponente, Sprint-9-Kandidat.

**Lessons Learned in CLAUDE.md integriert:**
- **LL-16** (§7 Grundregel 14, Sprint 8 Doku-Patch-Pattern): Claude Code
  editiert Design-/Schema-Doku NIE selbst, liefert Patches als separate Datei.
- **LL-17** (§7 Grundregel 15, Sprint 8 P4): `app_config`-Schwellen
  server-seitig lesen, State-Gating dort, Client erhält nur aufgelöste Werte.

**Bundle-Stand:** Route `/` 22.4 kB (+1.0 kB ggü. Sprint 7: 21.4 kB),
First Load JS 174 kB (+1 kB ggü. Sprint 7: 173 kB). Im Budget. CSV-Parser
+ Avatar-SVG erklären den Zuwachs.

**Modell-Empfehlung-Befund:** Opus 4.7 wegen Hash-Determinismus, atomarer
RPC-Verkabelung, mehrphasiger Pipeline-Reihenfolge. Sprint 8 ohne Spec-
Verstoß, zwei PM-genehmigte Scope-Expansionen (P5, P6), keine LL-13-
Verletzung — Claude Code hat in beiden Fällen gestoppt und PM-Freigabe
abgewartet. Eskalations-Heuristik §9 bestätigt für Daten-Pipeline-Sprints.

### Sprint 9 · APPROVED 24. Mai 2026
**Komponente:** Cortal-Consors-Parser + Cross-Account-Transfer-Erkennung (§11
Bank-Adapter-Erweiterung + §8 Fragment-Stack-Status `INTERNAL_TRANSFER` + §8
Backfill-Report-Toast). Vier sequenzielle Phasen + Parser-Vorbereitung (P0),
Phasen-eigene Commits gemäß LL-14. Branch `sprint/09-cortal-transfer`.

**Voraussetzungen erfüllt:** Sprints 0–8 grün auf `main`. Architekt-Pre-Sprint-9
Stufe 1 (Schema-Erweiterung `profiles.own_ibans` + `fragments.counterparty_iban`
+ `fragments.transfer_type` mit CHECK + Partial-Index, RPC `process_csv_import`
V2 → V3 mit `p_format_hint`, View `fragments_with_status` um zwei Spalten +
Status `'INTERNAL_TRANSFER'` erweitert) abgeschlossen 24.05.2026. Initial-Daten
Test-User: `own_ibans = {DE13120300001051422572 (DKB), DE84760300800853562991
(Cortal)}`. §4.6-Anker (`2910.01`) intakt nach Migration.

**Architekt-Sprint-Lieferung Stufe 1 (Sandbox 10/10 grün):**
- Migration + RPC V3 + View-Update + §4.6-Anker-Verifikation
- OQ-A Backfill: Variante (i) per User-getriebenem Re-Import mit
  `ON CONFLICT DO UPDATE SET counterparty_iban WHERE counterparty_iban IS NULL`.
  Hash bleibt V2-Formel — `counterparty_iban` ist nicht Hash-Bestandteil.
- OQ-B Konflikt Transfer + bestehender Karten-Link: Variante (ii) — Link wird
  gelöst, Fragment wird `INTERNAL_TRANSFER`, Counter `links_removed_for_transfers_count`
  getrackt, Suggestion (`suggested_card_id`/`confidence`) zurückgesetzt.
  `manually_paid=true` bleibt orthogonal erhalten.
- OQ-C Hash-Adapter: bank-agnostisch im RPC, `p_format_hint` als Future-Proof-
  Slot ohne aktive Body-Logik in V1. Frontend normalisiert pro Bank-Format zu
  `(date, amount, description, counterparty_iban)`, RPC hasht bank-übergreifend
  einheitlich (Single-Source-of-Truth für Idempotenz).
- `calculate_sparrate_for_month` bewusst nicht angefasst (liest keine Fragmente
  direkt). Defense-in-Depth-Patch für `calculate_card_amount_for_month` als
  V7'' für Folge-Sprint vorgemerkt.

**Implementierung (5 Phase-Commits + chore + docs auf `sprint/09-cortal-transfer`):**
- `chore: regenerate supabase types …` — `types.ts` auf RPC-V3-Signatur +
  `counterparty_iban` / `transfer_type` (View + `fragments` + `profiles.own_ibans`).
- `sprint-9 p0: dkb parser extracts counterparty iban` — `src/lib/dkb-csv.ts`
  liest Spalte 8 („IBAN") als `counterparty_iban` (leerer Wert → `null`, nicht
  Hash-Bestandteil). (Phase P0)
- `sprint-9 p1: cortal-consors csv parser with format detection` — neues
  framework-freies Modul `src/lib/cortal-csv.ts` (145 LOC). Strikter Header-
  Anker mit Trailing-Space (OQ4 entschieden: byte-exakt), 10 Vor-Header-Zeilen,
  unquoted Werte, `DD.MM.YYYY`-Datum, getrennte Betrag/Währung-Spalten, drei-
  Feld-Description `"{Sender / Empfänger} | {Buchungstext} | {Verwendungszweck}"`,
  `n/a` → null bei IBAN, nicht-EUR-Währung → corrupt. (Phase P1)
- `sprint-9 p2: csv format router routes to dkb or cortal parser` — neues
  Modul `src/lib/csv-format-router.ts` (63 LOC). Cortal-vor-DKB-Routing-
  Reihenfolge (beide nutzen `;`, aber Cortal unquoted + distinkter Header).
  Semantik: `errorClass: "format"` → nächsten Parser probieren;
  `"empty"`/`"corrupt"` → durchreichen (Format hat gepasst, Daten fehlerhaft).
  (Phase P2)
- `sprint-9 p3: wire process_csv_import v3 with format hint and counterparty iban`
  — Server-Action + `rpc.ts`-Wrapper erweitert um `p_format_hint` + `counterparty_iban`
  pro Zeile. `CsvImportResult` mit drei neuen Countern. `portal.tsx` nutzt jetzt
  den Format-Router. (Phase P3)
- `sprint-9 p4: render internal transfer fragments dimmed with badge and backfill toast`
  — `FragmentCard` mit eigener CSS-Klasse `.fragmentCardTransfer` (Opacity 0.45,
  `pointer-events: none`) statt der `locked`-Klasse (0.22). Badge „TRANSFER"
  über eigene Token-Triplet (`--frag-transfer-badge-*`, Grau-Soft
  `rgba(140,140,140,.5)`). Status-Priorität im Render: `isTransfer` schlägt
  `isLocked` und KI-Vorschlag-Badge. `Portal`-Component hält Toast-State
  mit `id`-basiertem Remount für Animation-Restart, CSS-Animation
  `backfillToastLife 4s`, Unmount per Timer. LL-5-Reset bei Monatswechsel.
  (Phase P4)
- `docs: sprint 9 design-doc + claude.md patches` + Closing-Artefakte.

**Doku-Patches (PM-Anwendung nach Sprint-Approval):**
- Design-Doku §11 Hash-Algorithmus: Cortal-Consors-Bank-Adapter (drei Felder,
  Pipe-Separator, `n/a`-Literal, `counterparty_iban` nicht Hash-Bestandteil).
- Design-Doku §11 Cross-Account-Erkennung: `INTERNAL_TRANSFER`-Pipeline-Block
  am Ende von §11 (own_ibans → counterparty_iban → transfer_type, Link-Auflösung
  bei Reklassifikation, Konsequenz „alle Eigen-Konto-Bewegungen, nicht nur
  betitelte Überträge").
- Design-Doku §8 Fragment-Stack: Rendering-Regel `INTERNAL_TRANSFER` (Opacity
  0.45, Badge „TRANSFER" Grau-Soft, kein Tap, Status schlägt alle anderen,
  zählt nicht in Arbeitsfläche oben und nicht in „N Fragmente offen"-Header-
  Flanke).
- Design-Doku §8 Portal: Backfill-Report-Toast (direkt unter Drop-Zone, drei
  Counter-Zeilen, 4 s Fade, nicht interaktiv).

**Schema-Doku-Status:** v3 bleibt aktiv, ist aber nicht mit den Sprint-9-
Stufe-1-Änderungen synchronisiert (siehe §6-Block). Schema-Doku v3 → v3.1
Pflege als V6'' vorgemerkt — Architekten-Lieferung.

**Browser-Smoke-Test (User):**
- S1.1–S1.3 grün (DKB-Parser-Erweiterung gegen echtes Sample, Hash-Stabilität
  verifiziert).
- S2.1–S2.5 grün (Cortal-Parser gegen echtes Sample, n/a-IBAN, Effekten-Zeile,
  nicht-EUR → corrupt, Format-Drift-Robustheit).
- S3.1–S3.3 grün (Format-Router: DKB → DKB, Cortal → Cortal, unbekannt →
  error-format).
- S4 E2E nicht-persistierend via RAISE-Rollback-Dry-Run (LL-18 etabliert):
  DKB-Re-Import → `inserted: 0`, `iban_backfilled: 54`, `transfers: 7`,
  `links_removed: 0`. Cortal-Erst-Import → `inserted: 8`, `transfers: 7`
  (alle außer Effekten-Zeile mit null-IBAN). Sandbox-Wert deckungsgleich.
- S5.1–S5.3 grün im echten Browser: Transfer-Fragmente gedimmt (0.45) mit
  Grau-Soft TRANSFER-Badge, Tap ohne Effekt, Backfill-Toast unter Portal
  mit korrekten Counter-Zeilen + Fade nach 4 s.
- S6.1 grün: `calculate_sparrate_for_month(test-user, '2026-03-01') = 2910.01`
  nach echtem DKB-Re-Import + Cortal-Erst-Import.

**OQ-Entscheidungen:**
- OQ1 (Cortal-Description-Adapter): drei Felder mit Pipe-Separator, byte-exakt,
  `n/a`-Literal belassen. In §11 dokumentiert.
- OQ2 (Nicht-EUR-Währung Cortal): `error-corrupt`, gesamter Import verworfen.
  Cross-Currency out of scope V1.
- OQ3 (Backfill-Toast-Position): direkt unter dem Portal (Drop-Zone) — Toast
  ist Pipeline-Feedback (Quittung der Import-Aktion), nicht Stack-Inhalt.
  In §8 dokumentiert.
- OQ4 (Cortal-Header-Trailing-Space): strikt byte-exakt. Format-Änderungen
  bei Cortal sind dann neu zu spec'n (V2-Vormerkung).

**PM-Klärungs-Episoden:**
- Pre-Sprint-9 Stufe-1-Klärungsbrief (Architekt → PM): Spec-Drift gegen DB-
  Realität bei `fragments.counterparty_iban` (Spalte existierte im Briefing
  ohne Schema-Basis), `profiles.user_id` vs `profiles.id` (PK-Naming),
  `fragments.hash` vs `external_hash` (Spalten-Naming). PM-Bestätigung
  Variante (A) für counterparty_iban + still angleichen für PK + Hash.
  LL-15-Anwendung: PM hatte Schema-Doku v3 vor Brief-Versand nicht
  spaltenscharf geprüft. Brief-Workflow weiterhin korrekt — Architekt hat
  Lieferung angehalten.
- AC4-Narrative-Klärung: Erwartung „mind. 3 + die drei benannten" war
  narrative-eng, RPC markiert per Regel 7 pro Seite. Korrektes Verhalten,
  AC nachgeschärft als LL-19.

**V1-Lücken / Sprint-10-Vorlauf:**
- V3'' (V2-C): Karten-spezifische Badge-Farben.
- V4'': Soft-Delete-Pattern Karten (§2.4) — UX-Lücke „Karte aus Vergangenheit
  löschen".
- V5'': Sparraten-Treppe (§9) — UI-Komponente.
- V6'': Schema-Doku v3 → v3.1 Pflege (Architekten-Lieferung).
- V7'': Defense-in-Depth-Patch `calculate_card_amount_for_month` —
  `AND f.transfer_type IS DISTINCT FROM 'INTERNAL_TRANSFER'`. Aktuell durch
  OQ-B-Daten-Invariante abgesichert, explizit > implizit.
- V8'' (V2-Web-App): `INTERNAL_TRANSFER`-Fragmente komplett aus Fragment-Stack
  ausblenden (eigener Reiter / Settings-Toggle). V1 nutzt Variante (b) gedimmt+Badge.
- V9'': Backfill-Toast-UX-Verbesserung — bei hohem Migrations-Counter (z. B.
  „54 Fragmente mit IBAN ergänzt") Formulierung anpassen („alle Fragmente
  nachgepflegt"). V1 zeigt exakte Zahl.

**Lessons Learned in CLAUDE.md integriert:**
- **LL-18** (§7 Grundregel 16, Sprint 9 P3/P4): Live-RPC-E2E ohne Persistenz
  via RAISE-Rollback-Dry-Run als nicht-destruktive E2E-Verifikations-Technik
  für mutierende RPCs.
- **LL-19** (§7 Grundregel 17, Sprint 9 AC4-Episode): Akzeptanz-Kriterien
  regel-basiert formulieren, nicht instanz-basiert, sofern die Regel über
  Test-Daten hinaus gilt.

**PM-Lesson (nicht als LL kodifiziert, intern dokumentiert):**
Schema-Doku v3 spaltenscharf prüfen vor Architekten-Briefen — die Stufe-1-
Klärungs-Episode hätte durch sorgfältigeres Lesen vermieden werden können.
LL-15 deckt das prinzipiell schon ab; Sprint-9-Praxis bestätigt die Regel.

**Bundle-Stand:** 10 Dateien geändert (`src/`), +403 / -24 LOC. Zwei neue
Module (`cortal-csv.ts`, `csv-format-router.ts`). `tsc` clean, `next lint`
0/0, `next build` 0 Errors / 0 Warnings. Bundle-Hygiene clean (0 Dev-Button-
Treffer in `chunks/app/`).

**Modell-Empfehlung-Befund:** Opus 4.7 wegen Multi-Parser-Architektur,
Format-Router-Semantik, Hash-Determinismus-Sensibilität (counterparty_iban
bewusst nicht im Hash) und UI-Status-Hierarchie. Eskalations-Heuristik §9
bestätigt — Sonnet hätte LL-13-Risiko bei der Status-Prioritäts-Logik.
Sprint 9 ohne Spec-Verstoß, keine LL-13-Verletzung.

---

### Sprint 10 · APPROVED 25. Mai 2026

**Komponente:** Sparraten-Treppe (§9, V5'') + Soft-Delete-Karten (§2.4-
Erweiterung, V4''). Zwei sequenzielle Phasen + Doku-Phase (LL-14). Branch
`sprint/10-treppe-soft-delete`.

**Voraussetzungen erfüllt:** Sprints 0–9 grün. Architekt-Pre-Sprint-10 live:
V7''-Defense-in-Depth (`calculate_card_amount_for_month` schließt
INTERNAL_TRANSFER aus), C.2-Migrationen (Sparrate-/Plan-/Active-RPCs ohne
`deleted_at`-Filter = snapshot-integer), C.3 RPC `toggle_card_hidden`.
§4.6-Anker `2910.01` über alle 4 Migrationen stabil.

**Implementierung (3 Commits + chore):**
- `sprint-10 p1: sparraten-treppe …` — neue Komponente `src/components/treppe/`
  (SVG, ResizeObserver, kumulierte Teal/Grau-Treppe, gold-gestrichelte
  Vorjahres-Linie, Hover-Tooltip, Klick-Abweichungszeile). `loader.ts`:
  12×2 RPCs + Vorjahres-Endwert via Promise.all, ohne `deleted_at`-Filter.
- `chore: regenerate supabase types after toggle_card_hidden RPC`.
- `sprint-10 p2: soft-delete cards …` — `toggleCardHidden`-Wrapper,
  hide/unhide-Actions, `CardHideProvider` (Context + 5s-Undo-Toast unten
  Mitte, Portal), „Verbergen" im bestehenden Kontextmenü, `hideOnly`-Modus
  für Ghost.
- `docs: sprint 10 doku + claude.md patches`.

**PM-Entscheidungen während des Sprints (LL-13-konform, kein Spontan-Patch):**
- **Vorjahres-Linie = kumulierter Jahresendwert** (Σ Jan–Dez X-1), nicht der
  einzelne Dezember-Monatswert (Briefing-L1.2/Perf-Budget vs. §9-Semantik;
  §9 gewinnt). Bei komplett datenlosem Vorjahr → keine Linie statt 0-€-
  Linie. → LL-20 in §7 Grundregel 18 kodifiziert.
- **Test-Daten-Seed (PM-approved):** ICH-`income_timeline`-Slot 2025-01-01
  (gross 36.000 / net 1.800) gesetzt, damit die 2026-Ansicht eine echte
  Gold-Vorjahres-Linie (21.600 €) zeigt (A1.5). Per RAISE-Rollback-Dry-Run
  vorab verifiziert: §4.6-Anker März 2026 = 2910.01 unverändert (Forward-
  Inheritance schattet 2025 für 2026).
- **„Verbergen"-Menü konsolidiert** ins bestehende `···`-Menü oben links
  (Design-Doku §12.4 Single-Menu), bewusste Abweichung von der Briefing-§5-
  Position „oben rechts".
- **Ghost-Hide-Fix (S17-Befund):** Ghost/Forecast-Karten hatten gar kein
  Hide-Affordance (CardInteractive war hinter `!isGhost` gegated). Fix:
  `hideOnly`-Modus (nur „Verbergen", kein Tap/Betrag-anpassen), auf jeder
  Karte gerendert. Erfüllt L2.1 + A2.12.

**Browser-Smoke (User):** Phase 1 S1–S5 grün; Phase 2 S6–S17 grün (S17 nach
Ghost-Hide-Fix). Snapshot-Integrität verifiziert (Netflix verbergen → März/
Mai 2026 unverändert). Test-State nach Smoke zurückgesetzt (alle
`deleted_at = NULL`).

**UI-Filter-Anker (A2.11):** Einzige `from("cards")`-Query (Karussell +
`cardNameById`-Badge-Lookup) filtert `deleted_at IS NULL`; Sparrate-Surfaces
(Ring, Treppe) filtern NICHT. Kein separates `lib/cards.ts`/`lib/distiller.ts`
— Karten-Loading liegt inline in `page.tsx`.

**Bundle-Stand:** Route `/` 26.2 kB (+3.8 kB ggü. Sprint 9: 22.4 kB),
First Load 178 kB. SVG-Treppe + Toast-Provider erklären den Zuwachs.
`tsc` 0, `next lint` 0/0, `next build` 0 Errors. Kein Dev-Helper in
Sprint 10 → A3.3 n/a.

**Lessons Learned in CLAUDE.md integriert:**
- **LL-20** (§7 Grundregel 18, Sprint 10 Vorjahres-Linie-Episode):
  Spec-Mehrdeutigkeit Perf-Budget vs. Semantik — §-Semantik ist normativ,
  PM-Klärung vor Implementierung; datenlose Referenz-Werte ≠ 0.

**V1-Lücken / V2-Vormerkungen:**
- V2: „Versteckte Karten verwalten / wieder einblenden"-Pfad (Settings/
  Overlay).
- V2: Bestätigungs-Dialog vor Verbergen (V1 = direkt + 5s-Undo).
- V2: Treppe-Multi-Year-Rolling-Window (V1 = Kalenderjahr).
- V2: Treppen-Klick-Abweichungs-Treiber-Heuristik im Backend (V1 = statischer
  „V2"-Hinweis, keine ⚠-Annotationen).
- V2: Treppe-Rot-Spec bei negativer Kumulation (§9 nennt Verhalten, keine
  Farb-Spec — V1-Test-Daten lösen es nicht aus).
- V2: Monatsgenauer Nenner für „% monatlich"-Tooltip (V1 = jüngster
  Income-Slot).
- V2-C: Karten-spezifische Badge-Farben (V3'', offen seit Sprint 8; aus
  ursprünglich geplantem Sprint 11 verschoben).
- V6'' (Pre-Sprint-10): Schema-Doku v3 → v3.1 Pflege geliefert und vom PM
  angewendet (Commit `docs: schema-doku v3 → v3.1`).

**Modell-Empfehlung-Befund:** Opus 4.7 gefahren statt Sonnet 4.6 (§9-Plan).
UI-orientiert, klare Specs — die drei Klärungs-/Diagnose-Punkte (Vorjahres-
Linie, Verbergen-Menü, Ghost-Hide) waren Spec-Lesart- und Render-Gating-
Fragen, keine Modell-Grenzfälle. Sonnet 4.6 wäre laut §9-Empfehlung
ausreichend gewesen. Bestätigt: reine UI-Sprints mit klaren Specs bleiben
Sonnet-Komfortzone, sofern keine Mehrdeutigkeit in der Spec — Sprint 10
hatte Mehrdeutigkeit (§9 Vorjahres-Semantik), daher LL-20.

**V1-Komplettheits-Status nach Sprint 10:** Technisch alle V1-Voraussetzungen
erfüllt (Onboarding, Auth/RLS, CSV-Import DKB+Cortal, Sparrate cent-exakt,
Sparraten-Treppe, Soft-Delete). V3'' Badge-Farben in V2-Backlog verschoben
(User-Entscheidung 25.05.2026 — Option A: kein Sprint 11, direkt Go-Live).
Pre-Live-Phase startet.

### Sprint v2-02 · APPROVED Juli 2026 (Merge vor v2-04)

**Komponente:** Jahres-Welle + Popup (Design-Doku §9, M3) — ersetzt die V1-Sparraten-Treppe (`src/components/treppe/` entfernt, −699 LOC).

**Kern-Implementierung:** 12-Monats-EUR-Welle hinter dem interaktions-transparenten, bildschirm-zentrierten Ring (Teal = realisiert, Grau = Forecast, Rot `#FF453A` = negativer Monat, Opacity 0.80, genau ein aktiver-Monat-Kreis) · Scrub-Führungslinie + Tooltip über volle Breite inkl. Jahresmitte hinter dem Ring · Klick-Popup mit kumulierter Treppe IST(teal)+Plan(grau), Jahressumme als Held, B6-Goldlinie (Vorjahres-Endwert, datenlos → entfällt) · Header-Ausreißer-Subzeile mit permanent reservierter Zeilenhöhe.

**Korrektur K1** (4. Juli 2026, nach User-Smoke): `<canvas>` als Replaced Element ohne explizite `width/height` — `inset:0` stretcht bei Canvas (anders als bei Divs) nicht auf die Containergröße, die Bitmap lief bei Retina-DPR über die ganze Seite. Fix: `.canvas { width:100%; height:100% }` + Single-Viewport-Layout (`main { height:100dvh; overflow-y:auto }` statt `min-height:100dvh`). Verifiziert per Headless-Chrome-Repro (Bug- und Fix-Variante).

**Offen:** B3-Slot (Popup-Held-Farbe bei kumulativ-negativer Jahressumme) blieb offen für Cluster 3 — gefüllt in v2-03. Treiber-Anzeige zeigt Platzhalter „B2-Heuristik offen" (echte Heuristik = separater Backend-Sprint). Beobachtung: 36 Sparrate-RPC-Calls pro Dashboard-Render (12 IST + 12 Plan + 12 Vorjahr) — nur bei spürbarer Latenz eskalieren, nicht eigenmächtig optimieren.

### Sprint v2-03 · APPROVED 23.07.2026 (Merge durch Claude Code auf User-Anweisung, Smoke erlassen)

**Komponente:** Display-Feinschliff N5 (§8) + N4b (§5) + B3-Fertigstellung (§9-Popup) aus Design-Direktor Cluster 3.

**Kern-Implementierung:** N5 — gemeinsamer Grau-Grundton-Token `--fragment-hue` für alle Rohmasse-Fragmente, Unterscheidung nur über Opacity (0.22 zugeordnet / 0.45 Transfer) + TRANSFER-Badge. N4b — Ring-Subzeile: Cap „> 200 % von Plan" ab `pct > 2`, Degenerations-Modus bei Plan < 100 € (inkl. negativ) mit EUR-Aussage statt %, Subzeilen-Farbe folgt dem Differenz-Vorzeichen, neutraler Arc (nur Spur, keine Füllung). B3 — Popup-Treppe abschnittsweise rot unter der Null-Linie (`#FF453A`), Held folgt dem Endwert-Vorzeichen (füllt den in v2-02 offen gelassenen B3-Slot).

**Korrekturen:** keine.

**Verifikation:** B3-Negativpfad und N4b-Degenerations-Pfad sind im Live-Bestand nicht auslösbar (alle Kumulationen ≥ 0, Live-Plan > 100 €) — per Headless-Chrome-Repro mit real kompiliertem `draw.ts` + synthetischen Kurven nachgewiesen statt per Browser-Smoke.

**Merge-Modus (PM-Entscheid/User-Anweisung 22./23.07.2026, nicht im Review dokumentiert):** Fast-Forward-Merge nach `main` durch Claude Code (PM-Rolle) auf ausdrückliche User-Anweisung; Browser-Smoke bewusst erlassen. Verifikation stattdessen: Headless-Chrome-Repro der Negativpfade (siehe oben), `tsc`/Lint/Build grün, Vercel-Preview grün.

### Sprint v2-04 · APPROVED 15.07.2026

**Komponente:** Mehrkonten Stufe 1 — DKB-Visa-KK-Parser + Format-Router-Erweiterung, Interim-Verdrahtung `set_fragment_asset_reallocation`, Frontend-Status-Pfade für `ASSET_REALLOCATION` (§11). DB-Seite (Migration + RPCs) am 06.07.2026 vom Architekten selbst angewendet (bestätigte, einmalige Sprint-Ausnahme, Briefing §0a — keine Dauerregel).

**Kern-Implementierung:** `src/lib/dkb-visa-csv.ts` (Header-Anker „Belegdatum", `p_format_hint='DKB_VISA'`, KK-Klassifikation Einzahlung/Ausgleich-Kreditkarte-Prefix → `INTERNAL_TRANSFER`) · Router-Reihenfolge Cortal → DKB-Visa → DKB-Giro · `setFragmentAssetReallocation`-Wrapper + schlichter Interim-Text-Button auf der Fragment-Karte (Setzen aus UNASSIGNED/INTERNAL_TRANSFER, Rücknahme aus ASSET_REALLOCATION) · `fragment-card.tsx`: `isTransfer` deckt jetzt beide `transfer_type`-Werte (gedimmt 0.45, graues Badge, `draggable=false`).

**Nachtrag P7** (15.07.2026): „Vorgemerkt"-Zeilen-Filter in beiden DKB-Parsern (Giro + Visa) — Zeilen mit Status ≠ „Gebucht" werden vor der Feld-Validierung übersprungen (vom Architekten bestätigtes Duplikat-Hash-Risiko), Import-Toast weist übersprungene Zeilen aus, eine reine Vorgemerkt-Datei liefert `error-empty`.

**Verifikation (P5, ohne Browser):** echte Parser-/Router-Ausgabe → RPC-Aufruf mit simuliertem Auth-Kontext (LL-18-Pattern) — KK-Transfer-Klassifikation, Fremd-Owner-Negativtest (`42501`), Duplikat-Hash-Idempotenz, AR-Markieren/Rücknahme alle grün.

**Offen:** Finale DD-Geste für `ASSET_REALLOCATION` steht aus — Interim-Button + undifferenziertes Transfer-Badge sind bewusst „nichts Aufwendiges" (Briefing-Vorgabe). Merge-Reihenfolge mit v2-03 (beide berühren Fragment-Card) lag bei Dominik. Realer KK-Import (89 Zeilen/25 Transfer-Kandidaten) noch nicht im Browser gefahren — Browser-Smoke offen beim User.

### Go-Live-Initial-Import 2026 + Smoke-Infrastruktur · 23./24. Juli 2026

**Kein Feature-Sprint — Ops-Meilenstein + Test-/Robustheits-Ausbau durch den zentralen
Arbeits-Agenten (V2-Rolle PM+Architekt); alle Prod-Writes und Merges einzeln User-gegated.**

- **M0 Playwright-Render-Smoke** (23.07.): `playwright.config.ts` + `tests/e2e/`
  (unauth / auth.setup / render-smoke), Auth via UI-Login-storageState
  (`.env.e2e.local`, gitignored). Strikt read-only; 6/6 grün pre-Import.
- **Initial-Import 2026** (23.07., User-Go „Go, alle drei"): 544 Fragmente über die
  produktive `process_csv_import` (authentifiziert als User, RLS-konform) — Giro 307 /
  Cortal 45 / Visa 192. Counter exakt deckungsgleich mit dem LL-18-Dry-Run;
  163 INTERNAL_TRANSFER auto-erkannt (`own_ibans` umfasst 4 IBANs: Giro, Cortal,
  Visa-Verrechnung, KK-Abrechnung), 17 ASSET_REALLOCATION manuell per RPC markiert,
  3 Auto-Absorbs (Spotify Mai–Jul, deltaneutral). Income-Slots (ICH + PARTNER) per
  UPDATE von 2026-05-01 auf 2026-01-01 rückdatiert. Ablauf-Record:
  `V2/golive_import_ablaufplan.md`. 2025-Dateien liegen parse-geprüft bereit, Import offen.
- **Karten-Rückdatierung** (24.07., User-Anweisung): 19 MONTHLY-Karten
  (`first_active_month` + Plan-Slot) auf 2026-01-01; 11 ONCE + 1 ANNUAL (DKV,
  Mai-Stichtag) bewusst im Mai belassen. Jan–Apr-Sparrate seither 1.886,97 €
  (cent-exakt verifiziert).
- **Welle-Rot-Fix** (Commit 3bc2fab, User-Befund + Merge-Go): Rot-Overdraw clippte
  bis zur Plot-Unterkante; der Catmull-Rom-Overshoot am Minimums-Monat blieb teal.
  Clip jetzt bis Canvas-Unterkante. Nachweis per Headless-Pixel-Repro. Design-Doku
  unverändert — Implementierungs-Bug gegen die bestehende §9-M10-Spec.
- **B3-Zwilling Popup-Treppe** (Commit cd1e623): gleiche Fehlerklasse latent in der
  kumulierten Treppe (untere Strichhälfte ragt über die Clip-Kante, wenn das
  kumulative Minimum exakt auf der Plot-Unterkante liegt) — von den neuen
  Pixel-Checks beim ersten Lauf gefunden; im Live-Bestand (noch) unsichtbar.
- **Schicht-1-Pixel-Checks** (Commit 0999a97): Playwright-Projekt `visual`
  (`pnpm test:visual`, creds-frei) — transpiliert das echte `draw.ts` in-process und
  vermisst Canvas-Pixel gegen synthetische Fixtures (Overshoot-Regression /
  kein-Rot-ohne-Negativmonat / B3). `POP_PAD_*` dafür exportiert.
- **Schicht-2 smoke-agent** (Commit 679412d): `.claude/agents/smoke-agent.md` —
  read-only Vision-Smoke (deterministische Suite + Zustands-Screenshots +
  §-Checklisten-Beurteilung). Ersetzt NICHT den menschlichen Prod-Gate-Smoke.
  Daneben seit 23.07.: `.claude/agents/docs-maintainer.md` (LL-16-Doku-Pflege).
- **Known Issue:** intermittierender SSR-Crash unter RPC-Burst (~130 parallele
  Supabase-Calls pro Dashboard-Render): `TypeError: fetch failed / ECONNRESET`,
  Error-Digest 3736018080. Robustheits-Fix (Einmal-Retry idempotenter Lese-Pfade im
  Server-Client-Fetch) umgesetzt 24.07. im selben Merge wie dieser Doku-Nachzug.
  Bulk-RPC `get_cards_with_effective_plan_for_month` (V3-Vormerkung Sprint 5) bleibt
  vorgemerkt, falls Latenz spürbar bleibt.

### Beschlüsse Lösch/B2/Erstattungen + Test-Projekt-Vorbereitung · 24. Juli 2026 (abends)

**User-Entscheidungen** („① alles ja · ② ja · ③ ja, Karte legst du an") auf die drei
V2-Papiere vom selben Tag:
- **Lösch-Sprint (M1/M2):** Drei-Verben-Modell (Beenden/Löschen mit Gate/Detach)
  angenommen; Verbergen wird ersatzlos gestrichen; Hard-Delete-Vollzug
  opportunistisch; Test-Projekt freigegeben.
- **B2:** Δ-Heuristik (displayed − effective_plan, Ranking |Δ|) + Jahres-RPC
  angenommen; Sequenz nach dem Lösch-Sprint; Rohmasse-Pseudo-Treiber = offene DD-Frage.
- **Erstattungen:** Kurations-Leitfaden O1+O2 mit 100-€-Schwelle angenommen
  (Design-Doku §11-Patch → v3.1.4); Schema-Weg (O4) verworfen.

**Ausgeführt am 24.07.:** ONCE-INCOME-Karte „Steuererstattung 2025" (Juni 2026,
+2.658,35 €) per `create_card_from_fragment` angelegt und mit dem
Steuererstattungs-Fragment verlinkt — Juni-Ist-Sparrate seither 4.545,32 €
(vorher 1.886,97 €, cent-exakt verifiziert).

**Test-Projekt (Übungs-Datenbank):** Anlage blockiert — das Free-Projekt-Limit
des Accounts ist mit „Antigravity-Finance" (Prod) + „Rennrad-Trainer" erschöpft
(2/2). Vollständige Schema-Extraktion aus Prod ist erfolgt (10 Tabellen, 6 Enums,
~20 eigene Funktionen, View, 6 Trigger inkl. auth-Trigger, RLS-Policies,
14 Zusatz-Indizes, app_config-Seeds); Wiederaufbau-Anleitung + Generator-Queries +
deterministischer Init-2-Seed (Anker 2.200,00 €) liegen in
`supabase/test_projekt/`. Offene User-Entscheidung: Slot freimachen
(„Rennrad-Trainer" pausieren) oder Upgrade — danach ist der Aufbau in wenigen
Minuten ausführbar (erster Schritt der Folge-Session).

### Sprint v2-05 · DONE 24. Juli 2026 (abends)

**Komponente:** Karten-Lebenszyklus (M1/M2-Beschluss): „Beenden" (last_active_month,
inkl. Aufheben), „Löschen" nur bei grünem Lösch-Gate (keine Links/States/
Vergangenheits-Plan) über den §2.4-Papierkorb (deleted_entities, 60-s-Retention,
opportunistischer Hard-Delete-Vollzug), Bulk-Soft-Detach. Verbergen
(toggle_card_hidden) ersatzlos gestrichen; deleted_at ist jetzt Papierkorb-Marker.

**Vorgehen:** Erstmals komplette Übungs-DB-Probe vor Prod — Test-Projekt
`antigravity-finance-test` (qyjuzzgqxowqiiwqcahd) nach Runbook
`supabase/test_projekt/` aufgebaut (Struktur-Parität, Init-2-Anker 2.200,00);
Migration dort geprobt (Testlauf T1–T6: Beenden-Semantik, ONCE-Ablehnung,
Gate-23514-Fälle, Papierkorb-Restore, Hard-Delete-Kaskade, Verbergen-Wegfall,
Anker stabil — dabei 1 Bug im Entwurf gefunden/gefixt: text[]-Append-Operator),
erst dann identisch live. Prod-12-Monats-Kurve nach Migration exakt unverändert.
Slot-Tausch: „Rennrad-Trainer" für die Dauer der Arbeit pausiert, danach
reaktiviert; Übungs-DB pausiert (Reaktivierung für B2-Sprint per gleichem Tausch).

**Frontend (Commit cd36ff0):** Kontextmenü-Verben mit Gate-abhängigem
Lösch-Eintrag (ausgegraut + Klartext-Grund), Beenden-Overlay (Monatswahl),
generalisierter 5s-Undo-Toast (card-action-toast-provider, vormals
card-hide-provider), Bulk-Detach im Verknüpfte-Fragmente-Overlay,
Lösch-Tor-Vorberechnung in page.tsx über zwei Selects. tsc/lint/build grün,
§9-Pixel-Checks 3/3. Interim-UI bis DD-Feinschliff (M2-Geste offen).

**Offen:** DD-Rücksprache Verben-Sprache/Gesten (M2) · B2-Backend-Sprint auf
derselben Übungs-DB (Tausch wiederholen) · net_estimation_brackets-Seed der
Übungs-DB bei Bedarf.

### 2025er-Import + Einkommens-Historie · 25. Juli 2026

**User-Auftrag:** 2025er-Konto-Daten importieren; Anteils-Steuerung über die
gelieferte Brutto-Tabelle (Domi/Aline, 01/2024–12/2026).

- **Import** (produktive `process_csv_import`, authentifiziert): 964 Fragmente —
  Giro 642 / Cortal 58 / Visa 264; 200 INTERNAL_TRANSFER auto, 0 Duplikate,
  0 Auto-Absorbs (Karten 2025 inaktiv → neutral). Counter deckungsgleich mit der
  Pre-Flight-Prognose aus `V2/golive_import_ablaufplan.md` §0.1.
- **14 ASSET_REALLOCATION** regelbasiert (Beschluss-Regeln vom 24.07.): 7 Coinbase
  (inkl. +4.000-Rückläufer über eine ZWEITE Coinbase-IBAN EE47… und 1-€-
  Verifikations-Cent über DE57… — per Description-Regel gefangen, reine
  IBAN-Regel hätte sie verpasst), 6 Visa↔Giro-Rückflüsse (Alt-Kontonummer).
- **Einkommens-Historie** aus der User-Tabelle: ICH 2025-01 (90.000 brutto /
  netto 4.037,11 = Durchschnitt der 12 echten Gehaltseingänge, Summe 48.445,31);
  PARTNER 2025-01 (63.097 / 2.981,08 pro-rata) + 2025-04 (69.113 / 3.265,33).
  **Korrektur:** PARTNER-2026-Slot 63.200 → 69.113 (Alt-Onboarding-Wert
  widersprach der User-Tabelle). 2024-Zeilen bewusst NICHT als Slots angelegt
  (für Splits ab 2025 unnötig; hätte eine irreführende 2024-Goldlinie erzeugt).
- **Neue Sparrate-Anker:** 2026-Monate 1.931,18 · Mai −86,77 · Juni 4.589,53
  (Split 57,21 % statt 59,38 %); 2025 konstant 4.037,11 →
  Vorjahres-Goldlinie der 2026-Ansicht = 48.445,32. Splits treffen die
  User-Tabelle exakt (58,8 % Q1/25 · 56,6 % ab 04/25 · 57,2 % 2026).
- **Offen (User-Entscheidung):** Karten-Rückdatierung auf 2025 — ohne sie ist die
  2025-Sparrate das volle Netto (keine Kosten modelliert) und die
  2025-Kuratierung unmöglich (Karten dort inaktiv, keine Drop-Ziele).
- **Werkzeug-Lesson:** Mutations-Statements NIE im selben execute-Call wie eine
  RAISE-Rollback-Verifikation — der RAISE rollt den gesamten Call zurück
  (Partner-Korrektur wurde so initial zurückgerollt; die Nachher-Messung hat es
  gefangen, Korrektur separat erneut ausgeführt).

### Sprint v2-06 · DONE 25. Juli 2026

**Komponente:** B2 Abweichungs-Treiber — die Welle sagt jetzt nicht nur *dass*
ein Monat abweicht, sondern *welche Karten* das treiben (Top-1 im Hover-Tooltip,
Top-3 im Popup-Monatsklick, §9-Display seit v2-02 unverändert).

**DB (additiv, read-only):** neue RPC `get_year_deviation_drivers(p_year, p_limit
DEFAULT 3)` — EIN Jahres-Call statt 12–62 Einzel-Calls (Konzept Option c;
bewusst gegen den RPC-Burst gebaut, der den ECONNRESET-Befund vom 24.07.
ausgelöst hat). Details im §6-Schema-Befunde-Block oben, Migration
`supabase/migrations/20260725_v2_06_b2_treiber.sql`.

**User-Entscheid 25.07.2026 (zwei Spec-Lücken des Konzept-Papiers geschlossen):**
Das Papier definiert `Δ = displayed − effective_plan` (roh), beschreibt die
Vorzeichen-Semantik aber als „Δ < 0 = teurer als geplant" — bei Kosten-Karten
widersprechen sich beide. Entschieden: `delta` ist die **Wirkung auf die
Sparrate** (Minus = Monat schlechter als geplant), und **GEMEINSAM-Karten zählen
nur mit dem eigenen Anteil**. Damit gilt die Invariante `Σ delta = IST − Plan` —
die Treiber erklären exakt die Differenz, die im selben Tooltip darüber steht.
Ohne Anteils-Gewichtung wären gemeinsame Karten im Ranking systematisch
überbewertet. (Muster LL-20: narrative Spec vs. Formel — geklärt statt geraten.)

**Frontend:** `drivers-stub.ts` → `drivers.ts` (UI-Vertrag `DriverEntry
{label, isPlaceholder}` unverändert, Signaturen um den Daten-Parameter
erweitert), `WelleData.drivers`, Loader-Call parallel zu den Sparrate-Loops mit
eigenem `catch` — ein Treiber-Fehler darf die Kurve nicht mitreißen (Tooltip
sagt dann „Treiber nicht verfügbar"). Leerer Monat → „Keine Abweichungen"
(gedimmt, wie der alte Platzhalter). Nur `welle/`-Modul + `rpc.ts` + `types.ts`
berührt; keine UI-/CSS-Änderung.

**Verifikation:** Übungs-DB-Probe vor Prod (Slot-Tausch mit „Rennrad-Trainer",
danach zurückgetauscht + ACTIVE_HEALTHY verifiziert): T1 Auth-Guard 28000 · T2/T3
Range-Validierung 22023 · T4 Leerfall 12 Monate · T5–T9 Heuristik gegen
synthetische Abweichungen in einer zurückgerollten Transaktion (Kosten −100,
Einnahme +50, GEMEINSAM mit Split 0,5 → −50, abgeschlossenes Budget +150;
Ranking + Tiebreaker + `p_limit` 1/3/50 korrekt; **Invariante Σ delta = IST −
Plan exakt getroffen**) · T10 Rückrollung sauber, Anker 2.200,00 unverändert,
Fremd-Nutzer sieht nichts. Prod: 12-Monats-Kurve 2025 + 2026 vor/nach identisch,
Invariante in allen 12 Monaten 2026 erfüllt, Funktions-Scope 19–31 aktive Karten
pro Monat (kein Leerlauf). Modul-Check gegen die echte RPC-Antwort grün.
`tsc` 0 · Lint 0/0 (58 Dateien) · Build 0 Fehler (Route `/` 29,2 kB · First Load
181 kB) · `pnpm test:visual` 3/3.

**Ehrlicher Daten-Hinweis:** Live sind derzeit **alle** Δ = 0 (nur 4 Links, davon
3 delta-neutrale Auto-Absorbs) — der Tooltip zeigt also überall „Keine
Abweichungen". Das ist korrektes Verhalten und deckt sich mit Konzept §5; die
Anzeige wird mit der Kuratierung von selbst lebendig. Ein User-Browser-Smoke
zeigt heute entsprechend wenig — aussagekräftig wird er nach dem ersten
kuratierten Monat.

**Offen:** DD-Feinschliff (Label-Format, Leer-Wording, E4-Rohmasse-Pseudo-Treiber
— E4 bewusst NICHT umgesetzt) · Karten-Rückdatierung 2025 weiterhin offen ·
`net_estimation_brackets`-Seed der Übungs-DB weiterhin leer.

### Sprint v2-07 · DONE 25. Juli 2026

**Komponente:** „Rohmasse aufräumen" — drei Roadmap-Punkte des Kleinkram-Pakets
(C1 · C2 · A1) plus ein während des Sprints gefundener Lade-Fehler (P0). Reiner
Frontend-Sprint: kein Schema-Eingriff, keine Migration, kein DB-Schreibzugriff —
der Übungs-DB-Tausch entfiel deshalb. Branch
`sprint/v2-07-rohmasse-aufraeumen`, per Vorspulen auf `main` (`c8ff08c`).

**C1 — Übertrags-Schalter (§8, schließt Sprint-9-V8''):** Fragmente mit
gesetztem `transfer_type` (beide Werte) sind aus der Arbeitsfläche ausgeblendet;
sichtbar nur über den Schalter „Überträge anzeigen (N)" in der Zonen-Kopfzeile,
Standard „aus". N = Übertrags-Bestand des Monats, schalterstellungs-unabhängig;
kein Schalter, wenn der Monat keine Überträge hat. Rein clientseitig, kein
Roundtrip, kein URL-Parameter. **Bewusst kein LL-5-Reset** beim Monatswechsel —
eine Ansichts-Vorliebe ist kein monatsspezifischer Zustand. Prädikat
`isTransferFragment` als einzige Quelle für Filter *und* Darstellungs-Hierarchie,
damit beide nicht auseinanderlaufen können.

**C2 — Backfill-Toast (§8, schließt Sprint-9-V9''):** ab 50 nachgepflegten IBANs
„Bestehende Fragmente nachgepflegt" ohne Zahl; die drei übrigen Zeilen behalten
Wortlaut und Zahl (User-Entscheid E3). Schwelle als Modul-Konstante, **bewusst
nicht** in `app_config` — reine Anzeige-Sprache ohne DB-Gegenstück; eine
`app_config`-Zeile würde eine Kopplung vortäuschen, die nicht existiert
(Abgrenzung zu Regel 5 / LL-17).

**A1 — Badge-Farben (§11, schließt Sprint-8-OQ1 / V2-C / V3''):** sechs
`--badge-hue-*`-Tokens, Zuordnung deterministisch aus dem normalisierten
Kartennamen (FNV-1a in `badge-hue.ts`) — **ohne** `cards.color`-Spalte, also
ohne Schema-Eingriff. Deckkraft/Typo/Geometrie unverändert, nur der Farbton
variiert; TRANSFER-Badge bleibt ausgenommen (AD5). Türkis und Rot ausgespart.
Befund am Rande: §11 forderte „Karten-spezifisch" **schon immer** — Sprint 8
hatte mit dem generischen Gold nur einen Zwischenstand geliefert.

**P0 — Lade-Fehler (Scope-Erweiterung, User-freigegeben):** siehe **LL-21** in
§7. Die Rohmasse war ab dem 12.01.2026 leer und alle vier
`card_fragment_links` im Karten-Overlay unsichtbar, weil der Fragment-Loader in
die 1000-Zeilen-Grenze lief. Behoben durch zwei monats-enge Abfragen (Monat +
`assigned_month`). Sparrate/Ring/Welle waren nie betroffen. Belegt gegen die
DB-Wahrheit: 2026-02 `0 → 42`, 2026-03 `0 → 56`, 2026-05 `0 → 56`,
2026-07 `0 → 52` — jeweils deckungsgleich mit der Zahl der Nicht-Überträge.

**Verifikation:** Prüfstrecke nach jeder Phase grün (`tsc` 0 · Lint 0 · Build 0 ·
`pnpm test:visual` 3/3). Zusätzlich: Hash-Determinismus gegen alle 31 realen
Kartennamen (1000 Wiederholungen, Reihenfolgen-/Mengen-Unabhängigkeit,
Normalisierung; Verteilung 4/7/9/5/3/3, kein Ton leer) und eine befristete
read-only Playwright-Spezifikation im Browser (Schalter-Zählregel, keine
Server-Roundtrips, Monatswechsel 36 → 25, Header-Flanke = DB-Wahrheit,
Badge-Farben gegen die Statusfarben geprüft). Anker vor *und* nach dem Eingriff
in DB und App gemessen: 1.931,18 · −86,77 · 4.589,53 · Goldlinie 48.445,32.
Bundle: Route `/` 29,2 → 29,6 kB, First Load 181 kB unverändert.

**Werkzeug-Hinweis:** `next lint` scheitert **innerhalb eines verschachtelten
Git-Worktrees** an doppelt aufgelöster ESLint-Konfiguration (Eltern-Repo +
Worktree). Ersatz ohne Konfigurationsänderung:
`npx eslint src --ext .ts,.tsx --resolve-plugins-relative-to .`

**Offen nach v2-07:** Badge-Überlauf bei sehr langen Kartennamen (Altbestand,
nicht von A1 verursacht — kürzen oder umbrechen ist eine DD-Frage) ·
DD-Feinschliff Palette und Schalter-Sprache (beides reiner Token-/Text-Tausch) ·
unverändert offen: M2- und B2-Feinschliff, M5, E4, Karten-Rückdatierung 2025.

---

## Nachtrag vom 15. August 2026 — fünfzehn Sprints auf einmal

> **Was hier passiert ist.** Dieser Log endete bei **v2-07** (25. Juli 2026). Die
> Sprints **v2-08 bis v2-22** wurden gebaut, abgenommen und in eigenen Review-Dateien
> dokumentiert — aber nie hierher übertragen. Aufgefallen ist es am 15.08.2026, als
> jemand einer Lessons-Learned-Spur folgen wollte.
>
> **Warum das mehr als Unordnung war.** `CLAUDE.md §8` verspricht zu **jeder** Lesson
> Learned: *„Die Langfassung mit dem Vorfall, der sie erzeugt hat, steht in
> `sprints/projekt_historie.md` beim genannten Sprint."* Für **LL-21 bis LL-27** war
> das schlicht nicht wahr — die Verweise liefen ins Leere. Ein Register, dessen
> Verweise nicht auflösen, ist schlimmer als keines: Man sucht und hört auf zu suchen.
>
> **Wie die Einträge entstanden sind.** Verdichtet aus den fünfzehn Review-Dateien
> unter `sprints/`, die alle vollständig vorliegen. Sie sind **nachträglich
> geschrieben** und geben deshalb nicht wieder, was man *damals* wusste — genau das,
> was dieser Log sonst leistet. Wo eine Annahme später widerlegt wurde, steht es dabei.
> Die Reviews selbst bleiben die Primärquelle und sind ungekürzt erhalten.
>
> **Die Append-only-Regel ist gewahrt:** Kein bestehender Eintrag wurde angefasst.

---

### Sprint v2-08 · DONE 04. August 2026

**Komponente:** Repo-Hygiene und Arbeitssetup. Keine Fehlerbehebung, keine neue
Funktion, keine Verhaltensänderung an der App — die Bundle-Größe war vorher wie
nachher identisch, was hier der Beleg ist und nicht bloß eine Randnotiz.

**Der Kern: `CLAUDE.md` von 1.857 auf 434 Zeilen.** 70 % der Datei waren Anhang-Log —
1.293 Zeilen, die **jede** Sitzung vollständig lud (~39.000 Token, danach ~7.900).
Der Log wurde **byte-genau** ausgelagert und die Gleichheit per `md5` belegt, nicht
behauptet. Genau diese Datei hier ist das Ergebnis.

**Fünf Regeln gerettet.** LL-1, LL-3, LL-4, LL-5 und LL-8 waren **ausschließlich** im
Anhang definiert; ein naives Auslagern hätte sie lautlos entfernt. LL-5 war zu dem
Zeitpunkt aktiv in Gebrauch — v2-07 hatte ausdrücklich damit argumentiert. Dazu 17 tote
Pfade korrigiert und ein Regel-Widerspruch aufgelöst (Zeile 472 verbot Änderungen an
`CLAUDE.md`, Zeile 4 erlaubte sie — seit v2-05 war Letzteres Praxis).

**Drei Fähigkeiten entstanden, sechs Verfahren wurden verworfen.** `db-eingriff`
(2× gefahren, 1× begründet ausgelassen), `sprint-abschluss` (Schritt 5 war zweimal
vergessen worden → drei Nachzugs-Commits) und `sprint-briefing`. Verworfen unter
anderem: CSV-Import (erst zwei Läufe) und die Doku-Patch-Routine (der `docs-maintainer`
deckt sie ab). **Keine Fähigkeit ohne Beleg im Repo** war die Auflage.

**`.claude/settings.json` neu, 103 Freigaben.** `git` je **Unterbefehl** gelistet —
`Bash(git *)` hätte `push` und `merge` mit eingeschlossen und genau das Gate
ausgehebelt, das technisch greifen sollte.

**Verifikation:** tsc 0 · Lint 0/0 · Build 0 · `test:visual` 3/3, nach jeder Phase.
Kein Zahlenwert bewegt — kein DB-Zugriff, keine Migration.

**Offen nach v2-08:** 26 Remote-Branches · veralteter Prüfwert in
`supabase/test_projekt/README.md:66` (4.545,32 statt 4.589,53) · doppelte
Abschnittsnummer „13." in der Schema-Doku · die fünf Befunde vom 04.08. unangetastet,
einer davon mit 900 € Wirkung auf die Juli-Sparrate.

---

### Sprint v2-09 · DONE 04. August 2026

**Komponente:** Den Sprint-Ablauf vereinfachen. Kein Eingriff in die App.

**Der Auslöser war eine Zurückweisung.** Nach der Beschreibung des Ablaufs in v2-08 hat
der User ihn als **zu komplex** verworfen. Die Diagnose davor war der eigentliche Wert:
**Nicht der Prozess war teuer, sondern der Chat-Wechsel zum Design-Direktor.** Von
sieben Stufen kosteten fünf nichts.

**Sieben Sprint-Stufen wurden drei** — Klären · Bauen · Abnehmen. Der **Design-Direktor
zog aus einem eigenen Chat in eine Fähigkeit** um, und die Roadmap wurde von 14
Buchstaben-Kategorien auf **elf Sprint-Pakete** umgebaut. Elf Themen kamen dabei
erstmals überhaupt in die Roadmap — die fünf Befunde vom 04.08., zwei Datenbasis-Themen,
zwei Übungs-DB-Hausaufgaben und zwei Feinschliff-Punkte standen vorher nur in eigenen
Papieren oder im Projekt-Gedächtnis.

**Die Entscheidung, die daraus einen Merksatz machte:** Der erste Vorschlag war ein
*Agent* für den Design-Direktor. Der User-Einwand: Bei Gestaltung muss man sagen können,
**was** und **warum** etwas nicht passt — das braucht Dialog. Ein Agent liefe über den
Hauptchat als Übersetzer, und bei Gestaltung ist die Nuance die ganze Aussage. Daraus
wurde `CLAUDE.md §4`: **Muss ich mit dem Ding reden können, ist es nie ein Subagent.**

**Ebenfalls abgelehnt: ein Agent „Daten-Architekt".** Migrations-Entwurf ist
Konstruktion, keine Zweitmeinung — wer sie anwendet, muss sie ganz verstanden haben.

**Zwei Regeln wanderten aus dem Projekt-Gedächtnis ins Repo:** die Sprachregel
(Empfehlungen in einfacher Sprache) und die Gedächtnis-Regel selbst — *nichts
Dauerhaftes darf ausschließlich außerhalb des Repos liegen.*

**Verifikation:** tsc 0 · Lint 0/0 · Build 0 · `test:visual` 3/3. Bundle unverändert.
Alle 56 alten Roadmap-Kennungen lösen weiter auf, alle 21 LL auffindbar.

**Offen nach v2-09:** Der neue Ablauf war **ungetestet** — der erste echte Durchlauf
sollte Paket 1 sein. `CLAUDE.md` war auf 500 Zeilen gewachsen; bei etwa 600 wäre erneut
zu prüfen, was nach unten wandern kann.

---

### Sprint v2-10 · DONE 05. August 2026

**Komponente:** Drei Anzeige-Fehler aus dem Befund-Papier vom 04.08. — `BF-3`
(Einkommens-Popup), `BF-1` (Vorschlags-Kästchen und Umbruch), `RM-1` (Verwendungszweck
statt Empfänger). Lief **unbeaufsichtigt, rund zwei Stunden, ohne anwesenden User**
nach einem schriftlichen Auftrag.

**`BF-3`** — Das Popup zum Eintragen der Gehälter öffnete als unbenutzbare Säule von
rund 80 px. Ursache: `.splitLeft`/`.splitRight` tragen ein `transform: translateY(-50%)`,
und ein Vorfahre mit `transform` wird zum Bezugsrahmen für `position: fixed`. `inset: 0`
meinte dadurch das schmale Label statt des Fensters. Behoben per `createPortal`.

**`BF-1`** — Das Euro-Zeichen rutschte in die zweite Zeile. Die KI-Vorschlags-Kästchen
entfielen aus der Anzeige, umgesetzt über die Konstante `SHOW_SUGGESTION_BADGES = false`
statt durch Löschen des Zweigs — „später mit **einer Zeile** wieder einschaltbar" war
wörtliche Auflage. *(Diese eine Konstante wird v2-21 sechs Tage später wieder einholen:
Ein perfekt nachgerechneter Vorschlag wäre in der Rohmasse unsichtbar geblieben.)*

**`RM-1`** — Die Beschreibung zeigt seither den letzten `|`-Teil. Die Regel wurde
**vor** der Umsetzung lesend gegen die Produktiv-Datenbank geprüft: 469 Visa-Zeilen ohne
Trennzeichen, 973 DKB-Giro, 106 Cortal — und **genau ein** Fragment mit leerem Zweck,
für das der Rückfall greift.

**`PA-1` wurde bewusst NICHT gebaut.** Die Rechnung war fertig und verifiziert, aber
Design-Doku §10 und §12.7 kannten **keinen** Zustand nach dem Speichern. Das Feature zu
bauen hätte bedeutet, fünf Gestaltungsentscheidungen zu erfinden — der Auftrag verbot
das zweimal, §7 Regel 3 ein drittes Mal.

**Der Lernpunkt des Sprints — und er ist teuer bezahlt.** Der Portal-Fix aus Phase 1
hatte eine Regression im Gepäck: `welle/index.tsx` prüft `closest("[data-wave-block]")`
im **echten DOM**; nach dem Portal-Hop lief die Suche ins Leere, und **jeder Klick im
Einkommens-Popup riss zusätzlich das Jahres-Popup auf**. Die gesamte Prüfstrecke war zu
diesem Zeitpunkt **fünfmal grün**. Gefunden hat es der optische Smoke — der Schritt, den
man am ehesten für Zierrat hält. Das ist die Kehrseite von LL-6: **Ein Portal repariert
den Layout-Bezug und zerreißt im selben Zug jede Logik, die sich auf DOM-Nähe verlässt,
während das Event-Bubbling weiterläuft**, weil Portale React-Kinder bleiben.

Der Fall wanderte als Regressions-Wächter in die Suite — mit **Gegenprobe**: ohne den
Fix ist der Test rot. Ein Wächter, der auch ohne die Reparatur grün bliebe, wäre wertlos.

**Verifikation:** tsc 0 · Lint 0/0 · Build 0 · visual 3/3 · **e2e 10/10** (setup ·
visual 3 · unauth 2 · render-smoke **4**). Anker in allen zwölf Monaten unbewegt.

**Werkzeug-Hinweis:** Der bis dahin dokumentierte ESLint-Umweg reichte im Worktree
**nicht** — er verhindert die doppelte *Plugin*-Auflösung, nicht die doppelte
*Konfigurations*-Auflösung. Funktioniert hat erst `--no-eslintrc --config .eslintrc.json`.

**Offen nach v2-10:** Anker-Tabelle in `CLAUDE.md §9` überholt · `PA-1` braucht eine
Gestaltungsrunde · das Einkommens-Popup hat als **einziges von acht Overlays** keinen
Escape-Handler (Altbestand, nicht von diesem Sprint verursacht).

---

### Sprint v2-11 · DONE 05. August 2026

**Komponente:** `BF-5` — Fragmente wurden ohne Vorzeichen addiert.
`calculate_card_amount_for_month` aggregierte mit `SUM(ABS(f.amount))`. `ABS` wirft bei
**jedem** Fragment das Vorzeichen weg. Das fällt nicht auf, solange alle Fragmente einer
Karte in dieselbe Richtung zeigen — sobald sich beide mischen, werden sie **addiert
statt verrechnet**.

**Der Fix wertet die Richtung einmal je Kartenart aus:** `INCOME` → `+SUM(amount)`,
`FIXED_COST`/`BUDGET` → `−SUM(amount)`. **Kein `GREATEST(…, 0)`** — `E2` verlangte
ausdrücklich keine Kappung. Alle übrigen Funktionen wurden auf dieselbe Fehlerklasse
durchsucht; `ABS` kommt noch zweimal vor, beide Male legitim. **Der Fehler war auf die
eine Stelle begrenzt.**

**Der Folgefund im Frontend:** `sumLinkedFragments` in `card.tsx` trug **dieselbe**
`Math.abs`-Konstruktion. Ohne die Korrektur hätte die Datenbank-Reparatur die Karte
**schlechter** aussehen lassen als vorher — der Fehler wäre von *beide falsch, aber
konsistent* zu *offen widersprüchlich* gewandert.

**Die Doku beschrieb ein Verhalten, das es nie gab.** Design-Doku §11 sagte in **einem**
Satz zwei Dinge, die einander ausschließen: die Funktion summiere „vorzeichen-agnostisch",
und bei BUDGET „senke die Gutschrift den Verbrauch". Im selben Abschnitt stand die
Schlussfolgerung, ein RPC-Eingriff sei „nicht nötig und wurde bewusst verworfen" — sie
beruhte auf der ungeprüften Annahme. **Das ist der Ursprung von LL-22.**

**Der Baseline-Lauf hat einen Fehler im eigenen Testaufbau gefunden.** Die
Budget-Testkarte war zunächst ab Januar aktiv und zog den Anker innerhalb der Transaktion
von 2.200 auf 2.050. Das sah aus wie ein Migrationsfehler, war aber der eigene.
Aufgefallen ist es **nur**, weil die Reihe zuerst gegen die unveränderte Funktion lief.
**Seither ist der Doppel-Lauf Teil von `db-eingriff`.**

**Verifikation:** Übungs-DB-Probe mit 13 Tests, zweimal gefahren; T2/T5/T9 sind der
eigentliche Beweis (Karten ohne gemischte Vorzeichen dürfen sich **nicht** bewegen — sie
tun es nicht). Anker Produktion nach der Freigabe: **Juli −1.222,75 € → −322,75 €, exakt
die vorab festgelegten +900,00 €**, elf Monate um 0,00 €. B2-Invariante hält 12/12.

**Offen nach v2-11:** Reihenfolge-Warnung — erst Migration, dann Merge, weil Datenbank
und Frontend gekoppelt sind.

---

### Sprint v2-12 · DONE 05. August 2026

**Komponente:** `BF-2` — die Ring-Subzeile im Degenerations-Modus, mit Entscheidung
`E3`. Reine Anzeige, keine Datenbank.

**Der Fehler:** Der Code verzweigte am **Vorzeichen des Plans**. Der zweite Zweig
unterstellte ein positives Ist — er schrieb das Vorzeichen sogar ins Wort („gespart").
Juli 2026 fiel genau dort hinein und las sich als **„Plan fast 0 € — −1.223 € gespart"**.
Man spart keine minus 1.223 €.

**Warum es ein Jahr überlebt hat:** Die Kombination *kleiner positiver Plan + negatives
Ist* war bis zur Juli-Kuratierung **nicht erreichbar** — Ist und Plan waren in jedem
Monat identisch. Und der Fehler stand nicht nur im Code: **Design-Doku §5 spezifizierte
dieselben zwei Zweige**, inklusive Vorzeichen im Beispiel. LL-22 bekam damit noch am
selben Tag seinen zweiten Beleg.

**Der Fix:** eine Regel, unabhängig vom Vorzeichen des Plans — `+X € über Plan` (türkis),
`−X € unter Plan` (rot), `genau nach Plan` (neutral). Die dritte Zeile greift ab einer
Abweichung **unter 0,50 €**, nicht bei exakt null: Bei strenger Lesart stünde bei 0,30 €
weiterhin „+0 € über Plan" da — exakt der Text, den `E3` abschaffen sollte.

**Die eigentliche Lehre:** Die Regel liegt seither in `ring-subline.ts` — rein, ohne
React, ohne CSS. Der Fehler saß in einer Textregel, die **im Bauteil eingebettet und
damit nicht einzeln prüfbar** war. *(Dieselbe Diagnose wiederholt sich in v2-16, v2-17
und schließlich in v2-22 als `ZO-2`.)*

**Verifikation:** tsc 0 · Lint 0/0 · Build 0 · **visual 12/12** (3 + 9 neue) · e2e 19/19.
Der neue Wächter transpiliert die **echte** Quelldatei statt die Logik nachzubauen.
**Gegenprobe:** Mit dem alten Zweig fallen 7 Tests um. Anker unbewegt.

**Offen nach v2-12:** keine. `BF-2` war mit `E3` vollständig entschieden.

---

### Sprint v2-13 · DONE 05. August 2026

**Komponente:** `BF-4` — der Split-Anteil wurde **zweimal** angewandt, sobald eine
gemeinsame Karte ein Fragment bekam (rund 466 €/Monat zu gut). Der letzte der fünf
Befunde vom 04.08.; **Paket 1 damit vollständig.**

**Alle vier Rechenfunktionen in EINER Transaktion.** `calculate_card_amount_for_month`
wendet den Anteil jetzt auf **Plan/Anpassung** an — nicht auf Fragment-Summen;
`calculate_sparrate_for_month` verliert ihre Multiplikation;
`calculate_planned_sparrate_for_month` läuft **wortgleich** mit;
`get_year_deviation_drivers` bekommt `delta = sign × (ist − plan × share)`.

**Warum nicht teilbar:** Würde man die Kartenfunktion zuerst ausliefern und die Aufrufer
später, wäre die Sparrate dazwischen **doppelt** anteilig — schlimmer als der
Ausgangsfehler.

**Die wichtigste stille Entscheidung: der Anteil wird NICHT je Karte gerundet.**
`calculate_planned_sparrate_for_month` multipliziert ebenfalls ungerundet und rundet
erst die Endsumme. Hätte die Kartenfunktion je Karte gerundet, wären Ist und Plan auf
den vier gemeinsamen Karten um Cent-Beträge auseinandergelaufen — **die Produktiv-Anker
hätten sich bewegt.** Ungerundet zu lassen ist der Grund, warum zwölf Nullen dastehen.
**Das ist der Ursprung von LL-24.**

**Und die Klammer wurde gemischt.** Aus `f × (a − b)` wurde `(a − b × f)`: Ein Faktor
außen hätte die bereits umgerechnete Seite ein zweites Mal gekürzt. Das fällt nicht auf,
weil keine Zahl offensichtlich falsch *aussieht*. Wächter ist die B2-Invariante — **das
ist der Ursprung von LL-23.**

**Verifikation:** Übungs-DB-Probe, zehn Tests, zweimal gefahren. **T6 ist der Kern:**
Ist-Sparrate 1.840,00 → **1.600,00 €** — die 240,00 € sind exakt der doppelte Abzug
(`600 × (1 − 0,6)`). Auf Produktion **bewegte sich keine einzige Zahl**, weil keine
gemeinsame Karte damals ein verlinktes Fragment hatte. **Ein grüner Anker beweist hier
bewusst wenig** — der Beweis kam aus der Übungs-Datenbank. Vier Prüfsummen belegen die
Wortgleichheit, `calculate_planned_sparrate_for_month` trägt **dieselbe wie vorher**.

**Nebenbefund ohne Testziel:** Die neuen Kartenbeträge decken sich auf den Cent mit den
realen Daueraufträgen — Miete 1.089,26 · Strom 36,04 · Internet 22,87 · Rechtsschutz 15,45.

**Offen nach v2-13:** Der Sprint hat den Fehler behoben, **bevor er eintrat**. Sobald
eine gemeinsame Karte ein Fragment bekommt, greift die neue Logik — *das geschah am
13.08.2026 und ist in v2-18 dokumentiert.* Kein authentifizierter Render-Smoke möglich:
`.env.e2e.local` fehlte.

---

### Sprint v2-14 · DONE 06. August 2026

**Komponente:** `LQ-1` — Karten bekommen einen Fälligkeitstag, abgeleitet aus der
eigenen Buchungshistorie. Bis dahin legten Frequenz und erster aktiver Monat nur den
*Monat* fest, nie den Tag.

**`cards.due_day smallint NULL`** mit CHECK 1–31, **17 Werte aus `fragments`
abgeleitet**, je Wert ein Kommentar mit Belegzahl und beobachteter Spanne. Idempotent.

**Gespeichert wird der Soll-Tag, nicht der Median.** Sieben Karten zeigen über 19 Monate
exakt dasselbe Muster — gebucht am 1., 2., 3. oder 4., **nie früher**. Das ist kein
Streuwert, sondern ein Dauerauftrag zum Ersten, der auf den nächsten Bankarbeitstag
rutscht. Mit dem Median stünde bei der Miete eine 2 — und die Vorhersage wäre am 1.
jedes Monats falsch. Bei echter Streuung gewinnt der **frühere** Tag: Für eine
Liquiditätsfrage ist die vorsichtige Annahme die, bei der das Geld früher abfließt.

**Grenze 1–31, nicht 1–28.** Ein Dauerauftrag zum 31. existiert; die Klammerung auf die
Monatslänge gehört in die Vorhersage, nicht in die Spalte — sonst wäre der gespeicherte
Wert schon eine Interpretation.

**Verifikation:** tsc 0 · Lint 0/0 · Build 0 (Bundle **unverändert**, identische
Chunk-Hashes) · visual 12/12. Anker 12/12 bei 0,00 €; **Prüfsummen der vier
Rechenfunktionen unverändert** gegenüber v2-13. Übungs-DB: 2.200,00 € vorher wie nachher,
acht Tests, Zweitlauf der Migration ohne Wirkung.

**Zwei Betriebs-Lehren, die in `db-eingriff` wanderten:** Der Restore-Status flippt nicht
zuverlässig — verlässlicher ist es, **auf den Anker zu warten** statt auf
`ACTIVE_HEALTHY`. Und zwischen `pause_project` und einem Restore des anderen Projekts
liegt ein `PAUSING`-Fenster, in dem Supabase jeden Restore ablehnt; der Rennrad-Trainer
stand deshalb rund 40 Minuten fest.

**Offen nach v2-14:** Die Oberfläche zum Ändern fehlte bewusst — `LQ-1` blieb 🟡.
Deutschlandticket steht auf einem einzigen Beleg, Friseur hat keinen Wert.

---

### Sprint v2-15 · DONE 06. August 2026

**Komponente:** `LQ-1`-Anzeigeseite und `LQ-2` — der Fälligkeitstag steht auf der Karte
und lässt sich dort ändern; die Kopfzeile sagt im laufenden Monat, wie viel noch abgeht
und wie viel Budget frei ist. Keine Datenbank.

**Warum der Tag sichtbar werden musste:** Die 17 Werte aus v2-14 sind **abgeleitet** —
aus der Historie gelesen, nie bestätigt — und steuern ab `LQ-2` eine sichtbare Zahl. Ein
geratener Wert, der eine sichtbare Zahl treibt und selbst unsichtbar bleibt, ist genau
die Bauart, aus der die Befunde vom 04.08. entstanden sind.

**Kein neuer Bereich, keine neue Zeile.** Die Statuszeile bekam zwei Enden
(`Offen ····· am 1.`), getrennt durch **Position**, nicht durch ein Trennzeichen. Die
Liquiditätszahlen stehen in **derselben** Zeile wie die Zonen-Überschrift — dasselbe
Muster wie der Übertrags-Schalter aus v2-07.

**`Fällig am …` ist ein eigener Menüpunkt, kein Feld in „Betrag anpassen".** Das ist
keine Platz-, sondern eine Bedeutungsfrage: Dort gilt alles entweder *nur dieser Monat*
oder *dauerhaft ab diesem Monat*, `cards.due_day` gilt dagegen **immer**.

**Die Rechnung liegt server-seitig auf den bereits geladenen Karten** — keine zusätzliche
Abfrage, kein nachgelagerter JS-Filter. Die 1000-Zeilen-Grenze ist strukturell
unerreichbar, weil über `cards` gezählt wird und nicht über die mitwachsende Rohmasse.

**Der wertvollste Beleg des Sprints:** Ein Befund vom 05.08. hatte unabhängig und mit
anderer Methode **1.814,02 €** gemessen. Die neue Rechnung liefert am 1. August
**1.769,02 €** — die Differenz ist auf den Cent der Friseur (45,00 €), die einzige Karte
ohne Termin. Damit ist belegt: Die Anzeige nutzt dieselbe Betragsbasis wie die Sparrate.

**Verifikation:** tsc 0 · Lint 0/0 · Build 0 · visual 12/12 · e2e 14/14. Anker 12/12 bei
0,00 €. **Der angemeldete Render-Smoke fiel aus** — `.env.e2e.local` existierte nirgends
mehr.

**Die Diagnose dazu, weil sie sich wiederholt hätte:** Zuerst hieß es, der angemeldete
Smoke fehle „strukturell". **Das war falsch** — `sprint_v2-10_review.md` §2 weist
`render-smoke` 4/4 aus, die Zugangsdaten waren am 05.08. vorhanden. Sie lagen in einem
früheren Worktree und sind mit dessen Löschung verschwunden. **Seither gilt: beide
`.env`-Dateien gehören in den Haupt-Checkout und werden in jeden Worktree kopiert.**

**Offen nach v2-15:** Zwei bekannte Untererfassungen (Friseur ohne Termin,
Kreditkarten-Abrechnung `L5`) · der Stichtag wird in UTC bestimmt, zwischen 0 und 2 Uhr
zeigt die App den Vortag · das Einkommens-Popup hat weiterhin keinen Escape-Handler.

---

### Sprint v2-16 · DONE 07. August 2026

**Komponente:** `RM-2` (Schaufenster-Popup) und `PA-1` (Konsequenz-Anzeige) — beides
reine Anzeige, kein Datenbank-Eingriff. **Paket 2 damit vollständig.**

**`RM-2`** ist die Gegenleistung für `RM-1`: Seit v2-10 zeigt die Fragment-Karte den
Verwendungszweck, der **Empfänger war damit nirgends mehr sichtbar**. Ein Klick auf
jede Buchung öffnet jetzt ein reines Anzeige-Popup ohne Knöpfe.

**Die aufgehobene Regel trug dreierlei zugleich.** Zugeordnete Fragmente und Überträge
waren per `pointer-events: none` tot gestellt — das sperrte Klick, Drag **und** die
Hover-Rückmeldung. Aufgehoben ist ausschließlich das Erste; Drag-Sperre und
Deckkraft-Werte haben jetzt **eigene** Träger. *Klickbar ≠ ziehbar ≠ verlinkbar.*
Ohne die eigenen `:hover`-Regeln wäre die Deckkraft beim Überfahren von 0.22 auf 0.92
gesprungen — genau die zwei Werte, die §8 als *unberührt* festschreibt.

**`PA-1`** sagt nach einer Gehaltsänderung, was sie kostet. Basis ist
`get_effective_plan_for_month` (Roh-Soll) und **nicht** `calculate_card_amount_for_month`
— die trägt den Anteil seit v2-13 bereits in sich; sie zu nehmen und den Faktor erneut
anzuwenden wäre exakt der Doppel-Abzug, gegen den `BF-4` geschrieben wurde.

**Beinahe in die K2.1-Falle gelaufen:** Der erste Entwurf verwendete
`.fragmentAmountPos/Neg` wieder. Die lesen `--frag-amount-pos/neg`, und die sind auf
`.interactionZone` definiert — über den Portal-Hop nach `document.body` vererben sie
**nicht**. Der Betrag wäre farblos geblieben; tsc, Lint und Build hätten das nie
gemeldet. *(Daraus wurde der Vorschlag für Stolperfalle 12.)*

**Runden, zweigeteilt (LL-24):** Die drei Spalten lassen sich **nicht gleichzeitig** zum
Aufgehen bringen — die Differenz zweier gerundeter Zahlen ist nicht die gerundete
Differenz. Gewählt: Spalten aus gerundeten Zeilenwerten, Held-Zahl ungerundet summiert.
Der erste Entwurf hatte hier einen Cent Abweichung zum Beleg; aufgefallen ist es beim
Schreiben des Wächters. **Anker-Wirkung hat nichts davon** — hier wird nichts
persistiert. Das ist der Unterschied zu `BF-4`.

**Mitgenommener Altbestand:** Das Einkommens-Popup hat endlich seinen
**Escape-Handler** bekommen — es war als einziges von acht Overlays ohne, offen seit
Sprint 1.

**Verifikation:** tsc 0 · Lint 0/0 · Build 0 · **visual 48/48** (25 + 23 neue) ·
**e2e 55/55** inkl. render-smoke 4/4. Anker 12/12 bei 0,00 € auf beiden Seiten.

**Offen nach v2-16:** Die Popup-Breite ist von 480 auf 400 px **geschrumpft**, obwohl
der Record von „340 → 400, das Popup wird breiter" sprach — die Zahl ist normativ, nur
ihre Herleitung ging von einem falschen Ist-Wert aus. Vier am 07.08. getroffene
Entscheidungen fehlten noch im Record.

---

### Sprint v2-17 · DONE 08. August 2026

**Komponente:** `J1` (Datenbank-Grundstand), `KAT-1` (Kategorien als Struktur), `KAT-3`
(Ordner-Zahl), `KAT-2` (Karussell). **Paket 4 vollständig** — das Karussell zeigt im
Juli statt 32 Karten **elf Ordner**.

**`J1`** legte die fehlende Basis: Unter `supabase/migrations/` lagen nur fünf
Delta-Dateien ab v2-04; alles davor existierte **ausschließlich in den beiden lebenden
Datenbanken**. Rekonstruiert aus dem `pg_catalog` (nicht per `pg_dump` — das Passwort
liegt nicht im Repo), 1.984 Zeilen, 31 Funktionen. Die bekannten Fallen stehen als
Kommentar **an der Stelle, an der sie zuschlagen**.

**Drei Fallen, drei bewusste Antworten bei `KAT-1`:** Eine Kategorie wird **nie** eine
`cards`-Zeile (beide Sparrate-RPCs laufen ohne Typ-Filter) · kein Papierkorb für
Kategorien, sondern hartes Löschen mit Wiederherstellungs-Bausatz im 5-Sekunden-Toast ·
`ENABLE` **und** Policy von Hand, weil `rls_auto_enable` nur ENABLE setzt und sein
eigenes Scheitern schluckt.

**Der wichtigste Punkt des Sprints — eine Zusicherung der Gestaltungsrunde war falsch.**
Der Record verlangte, die Kategorie-Summe „aus ungerundeten Kartenwerten zu bilden und
erst am Ende zu runden", und benannte als Ursache „Wohnen". **Beides nachgemessen,
beides trifft nicht zu:** Innerhalb von „Wohnen" liefern beide Rundungsreihenfolgen
dasselbe, und die Anweisung ist **notwendig, aber nicht hinreichend** — auch ungerundet
je Ordner ergibt die Spalte −322,74 € statt −322,75 €.

Die wirkliche Ursache liegt eine Ebene höher: `calculate_sparrate_for_month` rundet
**einmal ganz am Schluss über alles**. Elf unabhängig gerundete Zahlen können diese eine
Rundung prinzipiell nicht nachbilden. **Am schärfsten:** Die Aufstellung im Record
summierte sich **selbst** auf −322,74 €, obwohl darüber −322,75 € stand und der Satz
„Deckt sich exakt" danebenstand. **LL-22 in Reinform — und der Ursprung von LL-25.**

**Die Lösung: Restverteilung.** Das Ziel wird aus `calculate_sparrate_for_month`
**geholt**, nicht hergeleitet; der Rest wandert auf den betragsgrößten Ordner. Bewiesen
auf der Übungs-DB mit einem Szenario, das den Cent **erzwingt** (Split-Faktor exakt ⅓).
**Bekannter Preis, benannt:** „Wohnen" zeigt im Juli −1.148,18 € statt −1.148,17 €.

**`KAT-3` vor `KAT-2` gebaut**, abweichend vom Briefing: Die Kachel trägt eine Zahl, und
die darf nach Arbeitsregel 1 nicht im Browser entstehen.

**Verifikation:** tsc 0 · Lint 0/0 · Build 0 (+1,8 kB für ein ganzes Feature) ·
**visual 69/69** · **e2e 76/76** inkl. vier angemeldeter Render-Smokes. Anker 12/12 bei
0,00 €, B2 12/12, **zehn Prüfsummen identisch** zwischen Übung und Produktion.
**Der zweite Anker entstand hier:** Die Ordner-Spalte ergibt in allen zwölf Monaten
exakt die Sparrate.

**Offen nach v2-17:** Der N+1-Ladeweg (`D14`) blieb unaufgeräumt — ein Loader-Umbau im
selben Sprint hätte den Browser-Smoke mehrdeutig gemacht. `tests/` trägt vier bestehende
ESLint-Fehler, die die kanonische Strecke nicht sieht. **Und `KAT-5` wurde entschieden,
aber nie gebaut — im Review nicht benannt, was erst v2-18 auffiel.**

---

### Sprint v2-18 · DONE 13. August 2026

**Komponente:** Zwei Befunde aus der **ersten echten Benutzung** der Kategorien — beide
beim Bauen unsichtbar, beide in Minuten behoben.

**`NB-1` hebt eine ausdrücklich festgeschriebene Entscheidung wieder auf.** Record `B4`
(„beim Anfassen einer Zahlung öffnen sich **alle** Ordner") war beim Bauen plausibel und
löste den Blocker `U1`. In der Praxis schiebt es die Zielkarte aus dem Bild, während die
Maustaste gedrückt ist und das Karussell deshalb nicht gescrollt werden kann. **Am
Entwurf war der Fehler nicht zu sehen** — dort war die Reihe kurz und niemand hielt eine
Maustaste. Neue Regel: Es öffnet sich nichts von selbst. `U1` ist **nicht wieder offen,
sondern anders gelöst** — durch bewusstes Aufklappen *vor* dem Zug. Netto **weniger**
Code.

**`NB-2`** — die Ansicht sprang beim Monatswechsel. `.fragmentStack` hatte
`max-height: 320px`; voll gab die Zone 341 px, leer fiel sie auf 215 px, und die Welle
darüber wuchs um **126 px**. Fix: `max-height` → `height`, dazu der Leerzustand
`Keine offenen Umsätze`.

**Der Juli-Anker hat sich unabhängig von diesem Sprint bewegt** — und es war der Fall,
den §9 wörtlich vorhergesagt hatte. Am 13.08.2026 um 06:05 wurden drei echte Zahlungen
zugeordnet (Miete · Strom · Internet). **Damit hat `BF-4` aus v2-13 zum ersten Mal in
Produktion gegriffen:** Vorher rechnete die Karte `Plan × Anteil` (1.089,25968…), jetzt
nimmt sie die Überweisung — glatt auf zwei Stellen. Juli: −322,75 → **−322,74 €**.
Rechtsschutz war die vierte gemeinsame Karte und noch nicht zugeordnet.

**Verifikation:** tsc 0 · Lint 0/0 · Build 0 · visual 69/69 · **e2e 78/78**. Der
Layout-Anker ist neu: Zone und Welle in Juli **und** August je 341/326 px statt
341/215 und 326/452. Der Wächter misst die **Zone**, nicht die Welle — die Welle ist das
Symptom, und im dev-Server ist ihr Sprung gar nicht messbar.

**Drei Läufe waren zwischendurch rot, alle drei durch die Umgebung** — der bekannte
`ECONNRESET`-Burst gegen Supabase.

**Offen nach v2-18:** **`KAT-5` wurde sichtbar** — in v2-17 entschieden, nie gebaut, im
dortigen Review nicht benannt. Die Zahl der offenen Themen stieg dadurch von 28 auf 29;
das ist Ehrlichkeit, kein Rückschritt. Kein automatischer Wächter für Phase 1 möglich:
HTML5-Drag lässt sich in Playwright nicht verlässlich nachstellen.

---

### Sprint v2-19 · DONE 13. August 2026

**Komponente:** `GE-1` und `GE-2` — das Gehalt lässt sich aus der Rohmasse auf die
Netto-Kachel ziehen; der Monat rechnet dann mit dem **tatsächlich überwiesenen** Betrag,
und die Differenz erscheint als eigene Zeile in den Abweichungs-Treibern. **Paket 15
entstand und war einen Tag später vollständig.**

**Der Entwurfs-Entschluss, der alles andere vereinfacht hat: die Tabelle speichert den
Link, nicht den Betrag.** Das Briefing hatte „Monat, Person, Ist-Netto, Herkunft"
vorgeschlagen. Die Summe stattdessen aus `fragments.amount` zu ziehen hat zwei Folgen:
Betrag und Zuordnung können nicht auseinanderlaufen, und die Fachregel „zwei Gehälter in
einem Monat summieren sich" fällt heraus, ohne eigens behandelt zu werden.

**Drei Wächter, jeder gegen eine bezahlte Erfahrung:** `ENABLE` **und** Policy von Hand
(Stolperfalle 15) · Transfer-Trigger (Stolperfalle 7) · zwei Trigger gegen Doppel-Links
in **beide** Richtungen — ein Fragment an Karte **und** Netto zugleich wäre doppelt in
der Sparrate. Die Doppel-Link-Wächter sind bewusst Trigger und nicht Teil der RPC: So
greifen sie auch für `process_csv_import` und den direkten UPSERT, die alle an der neuen
RPC vorbeischreiben.

**`fragments_with_status` liefert `ASSIGNED`** — bewusst kein neuer Status-Wert. Dadurch
greifen Sperre und Ziehbarkeit ohne **eine Zeile** Frontend-Änderung.

**Zwei Migrationen, nicht eine und nicht drei.** Zwischen „Ist-Sparrate rechnet mit dem
echten Wert" und „Ordner-Spalte zieht mit" wäre Anker 1 gebrochen; getrennt ausgeliefert
gäbe es auf Produktion ein Zeitfenster, in dem das gilt.

**Die Gehalts-Zeile wird nicht gegen die Karten gerankt** — erst kürzen, dann anhängen.
Sonst hätte „Gehalt" im Juli einen Karten-Treiber verdrängt.

**Verifikation:** tsc 0 · Lint 0/0 · Build 0 · **visual 75/75** · **e2e 84/84**. Nach den
Migrationen ohne Zuordnung: 0,00 € in 12/12, Anker 1 hält. Trockenlauf gegen Produktion
(zurückgerollt): Juli-Ist **−8,84 €** wie erwartet. **Elf Prüfsummen byte-identisch**,
drei davon mussten unverändert bleiben und sind es. Übungs-DB 2.200,00 € vorher wie
nachher, zwölf Tests grün.

**`B2-R` wurde hier gefunden** — die Treiber-Summe liegt einen Cent neben `Ist − Plan`.
**Nicht von diesem Sprint verursacht:** Er entstand am 13.08. mit den ersten Zuordnungen
auf gemeinsame Karten. Aufgefallen ist er nur, weil der Prüfanker ihn streifte — die
Vorgabe „Treiber-Summe → −32,77 €" war **nicht erfüllbar** und musste vor dem Bauen
korrigiert werden. *(Behoben in v2-22.)*

**Offen nach v2-19:** 20 unzugeordnete Gehalts-Fragmente; für 2026 Januar–Juni bewegt
eine Zuordnung **nichts** (exakt der Planbetrag), für 2025 wandert die Goldlinie um
−0,01 € — korrekt, sieht aber nach einem Fehler aus, wenn man es nicht erwartet. Ein
fehlgeschlagener Drop bleibt stumm. **Und der Vorschlag für Stolperfalle 16 / LL-26
entstand hier:** `getTop3Drivers` schnitt auf drei Zeilen ab, während die Datenbank
bewusst vier lieferte.

---

### Sprint v2-20 · DONE 15. August 2026

**Komponente:** `KU-1` und `KU-2` — eine gelöschte Karte verschwindet sofort aus jeder
Zahl, und eine Karte aus dem laufenden Monat lässt sich auch wieder loswerden.
**Paket 16 entstand und war noch am selben Tag vollständig.**

**Das Lösch-Tor schützt nur noch die Vergangenheit.** `HAS_STATES` blockiert nur noch
bei Monats-Zuständen aus **vergangenen** Monaten. Was die Regel schützen soll, ist die
**Historie** — und die schützt sie weiterhin vollständig. Bei einer Karte aus dem
laufenden Monat ist der Zustand entweder eine Betragsanpassung oder ein Bezahlt-Haken;
beides gehört zur Karte und stirbt mit ihr.

**Vier Funktionen bekommen `deleted_at IS NULL`, in EINER Migration.** Jede einzeln
wegzulassen bricht etwas: nur die Ist-Funktion → Ist und Plan driften auseinander · ohne
die Ordner-Funktion → Anker 1 · ohne die Treiber → Anker 2.

**Der eigentliche Fund war nicht geplant: `page.tsx` bildet das Lösch-Tor nach** — und
hätte die Lockerung aus P1 **stillschweigend aufgehoben**. Das Menü hätte ausgegraut,
was die Datenbank längst erlaubte. **Das ist eine neue Ausprägung von LL-26:** Bisher
hieß die Lehre „ein Frontend-**Limit** kann eine Antwort kürzen"; hier war es ein
Frontend-**Nachbau einer Regel**. Die Suchrichtung ist eine andere — nicht „wo wird
gekürzt", sondern **„wo wird dieselbe Regel ein zweites Mal formuliert"**.

**Der Widerspruch zu §2.1 ist keiner.** Die Snapshot-Integrität verbietet den
`deleted_at`-Filter, damit historische Sparraten nicht kippen. Das Lösch-Tor lässt über
`HAS_PAST_PLAN` aber gar keine Karte mit Vergangenheit löschen — der Filter kann
strukturell nur den laufenden Monat und die Zukunft berühren. Diese Prüfung stand **vor**
der Migration, nicht danach.

**Die neue Spec prüft Quelltext, nicht Verhalten** — ungewöhnlich für dieses Projekt und
hier bewusst: Die Lösch-Regel existiert an zwei Orten. Ein Verhaltens-Nachbau wäre die
**dritte** Kopie derselben Logik gewesen und hätte den Widerspruch gerade nicht gefunden.

**Verifikation:** tsc 0 · Lint 0/0 · Build 0 · **visual 81/81** · **e2e 90/90** — beide
nur gestiegen, und zwar um genau die sechs neuen Fälle. August Ist 1.076,24 → **721,24 €**
und Plan 1.151,23 → **796,23 €**, beide Seiten um dieselben −355,00 wie vorab festgelegt;
die Differenz bleibt −74,99 €. Übrige elf Monate 0,00 €. **Acht Prüfsummen byte-identisch.**

**Offen nach v2-20:** `B2-R` bleibt liegen, in Juli **und** August je 0,01 €, **nicht
gewachsen**. Nicht geprüft: ob es **weitere** Frontend-Nachbauten von Datenbank-Regeln
gibt — ein gezielter Durchgang wäre eine eigene Hausaufgabe.

---

### Sprint v2-21 · DONE 15. August 2026

**Komponente:** `M6` — die automatische Zuordnung. **Paket 5 zum ersten Mal wirksam:**
Die App schlägt für **115 statt 9** offene Zahlungen aus 2026 eine Karte vor.

**Der Auftrag trug einen Verdacht, der stimmte — aber nicht der große Hebel war.**
`calculate_match_confidence` hat im gesamten Schema **genau einen** Aufrufer und steht
dort hinter `IF v_was_inserted`: Sie lief ausschließlich für **neu eingefügte** Zeilen.
Von 1.590 Fragmenten trugen **1.567 gar keinen Konfidenzwert**. Aber ein Nachrechnen mit
dem **alten** Algorithmus hätte nur 36 von 284 Zahlungen erreicht (12,7 %).

**Drei Ursachen, gemessen statt vermutet:**

1. **Die Badge-Schwelle war ohne Namenstreffer rechnerisch unerreichbar.**
   `frequency_match` prüft nur, ob die Karte im Monat aktiv ist — worauf ihr einziger
   Aufrufer bereits filtert. Sie liefert *immer* `1.00`. Betrag + Frequenz ergeben
   höchstens 0,50, die Schwelle liegt bei 0,60. **72 Zahlungen** klemmten im toten Band
   0,50–0,60 mit perfektem Betrag. *(Ursprung von Stolperfalle 17.)*
2. **Die Namensfunktion verglich ganze Zeichenketten.** `Nurnberger Lebensversicherung`
   gegen `Private Altersvorsorge - Nürnberger` ergab **0,139** — der Kontoauszug schreibt
   keinen Umlaut, der Kartenname trägt einen.
3. **Die 101 Handzuordnungen des Nutzers aus Juli/August wurden nie ausgelesen.**

**Die naive Verbesserung war messbar SCHLECHTER als gar keine.** Bloß wortweise zu
vergleichen hob die richtigen Vorschläge von 14 auf 27 — und die **falschen** von 1 auf
**18**. Zwei Ursachen: Das Wort `aline` steht in **sieben** Kartennamen und traf überall;
und `LIKE '%wort%'` machte `Doug|las`→`Glas` und `Kauf|land`→`Kauf` zu Treffern. **Das
ist der Ursprung von LL-27 und Regel 25:** Wer eine Ähnlichkeitsfunktion ändert, zählt
**beide** Seiten. Die Abhilfe braucht keine gepflegte Namensliste — ein Kartenwort, das
in `n` Kartennamen desselben Nutzers vorkommt, zählt nur `1/n`.

**Die Wiedererkennung lernt nur aus `MANUAL_DROP`** — eine automatische Zuordnung ist
keine Zustimmung des Nutzers, sondern eine Vermutung der App; mitgelernt verstärkte sich
ein Fehler bei jedem Import selbst. Sie wirkt als **Untergrenze** (`GREATEST`), nicht als
vierter gewichteter Summand: Ein Summand hätte alle Scores gesenkt, bei denen keine
Historie vorliegt — und das sind die meisten. Kreuzvalidierung Juli→August: **9 von 9
richtig, 0 falsch.**

**Die scharfe Kante des Sprints:** `suggested_card_id` zu setzen bewegt keine Zahl,
`card_fragment_links` zu schreiben bewegt sofort die Sparrate. `refresh_fragment_suggestions`
verlinkt deshalb **nie** — und die Zusage ist **erzwungen**, nicht behauptet: Die Funktion
zählt die Verknüpfungen vor und nach ihrem Lauf und bricht bei jeder Abweichung mit
Rollback ab.

**Und beinahe wäre alles unsichtbar geblieben.** `page.tsx` ließ Vorschläge nur
*unterhalb* der Auto-Schwelle durch — eine Bedingung, die stillschweigend „ist schon
verlinkt" meinte. Da nachgerechnet wird, ohne zu verlinken, wären ausgerechnet die **24
treffsichersten** verschwunden. **Dritter Fall dieser Art in vier Tagen** (v2-19
`getTop3Drivers`, v2-20 Lösch-Tor).

**Verifikation:** tsc 0 · Lint 0/0 · Build 0 · **visual 81/81** · **e2e 90/90** (zwei
ECONNRESET-Ausfälle einzeln nachgefahren, Ursache im Server-Log belegt). **Alle 24
Anker-Werte identisch**, Verknüpfungen 132 → 132, beide Invarianten unverändert.
Übungs-DB-Strecke vollständig gefahren (T1–T7 grün, Anker 26.400,00 € = 12 × 2.200),
**zehn Prüfsummen byte-identisch**. Auf dem 101er-Prüfset: richtige Vorschläge über der
Schwelle **14 → 42**, falsche 1 → 4.

**Betriebs-Beleg:** Beim Restore der Übungs-DB meldete `public` **0 Tabellen und 0
Funktionen** — minutenlang, bei Status `COMING_UP`. Genau der Zustand, in dem am
05.08.2026 fast eine gesunde Datenbank neu aufgebaut wurde. Der Restore dauerte rund
20 Minuten.

**Offen nach v2-21:** `ZO-1` (`frequency_match` ist eine Konstante) · `ZO-2`
(Vorschlags-Sichtbarkeit nicht prüfbar) · `ZO-3` (rückwirkend verlinken — 24 Kandidaten,
im Prüfset 11 von 11 richtig; **gehört dem User**, weil es die Sparrate rückwirkend
bewegt). Der Badge in der Rohmasse bleibt hinter `SHOW_SUGGESTION_BADGES = false`,
deshalb steht `M6` auf 🟡 und nicht ✅.

---

### Sprint v2-22 · DONE 15. August 2026

**Komponente:** Zwei Hausaufgaben — `B2-R` (der Cent in der Treiber-Summe) und `ZO-2`
(die Vorschlags-Sichtbarkeit wird prüfbar). Erster Sprint seit v2-20, der die Zahl der
offenen Themen **senkt**.

**`B2-R`:** `get_year_deviation_drivers` rundete das Delta **je Karte**, während die
Sparraten-Funktionen erst am Ende über alles runden. Gemessen: Karten ungerundet
−17,2036 € gegen je Zeile gerundet −17,21 € (Juli) und −74,9943 gegen −75,00 (August).

**Zwei Vermutungen aus der Hausaufgabe wurden dabei widerlegt.** Das separat gerundete
**Gehalts-Delta trägt nichts bei** — es ist exakt. Und die verursachenden Karten sind
**gar nicht sichtbar**: Ein Delta von 0,0022 € rundet auf 0,00 und wird von
`WHERE delta <> 0` gefiltert — es steht in keiner Anzeige, verschiebt aber die Summe.
**Wer nur auf die angezeigten Zeilen schaut, findet die Ursache nie.**

**Die Abhilfe holt das Ziel aus den Rechenfunktionen, statt es herzuleiten.** Naheliegend
wäre `round(Σ delta_roh, 2)` gewesen — es stimmt in allen geprüften Monaten. Aber
`Ist − Plan` ist die Differenz **zweier getrennt gerundeter** Summen und muss nicht
gleich der gerundeten Differenz sein. LL-25 sagt wörtlich: *Ziel holen, nicht herleiten* —
genau daran ist diese Fehlerklasse in v2-17 schon einmal gescheitert. Der Rest geht auf
die betragsgrößte Kartenzeile; sie trägt `rn = 1` und überlebt jeden `p_limit`-Schnitt.

**`ZO-2`:** Die Regel, ob ein Kartenvorschlag angezeigt wird, stand inline im `.map()`
einer Server Component — **genau dort saß der Fehler aus v2-21**. Sie liegt jetzt als
reine Funktion in `src/lib/suggestion.ts` mit zehn Fällen, darunter der entscheidende:
*über der Auto-Schwelle und noch offen*. Die Spec transpiliert die **echte** Quelldatei;
ein Nachbau driftet ab und gibt falsche Sicherheit. **Dieselbe Diagnose wie bei `BF-2`
in v2-12** — nur zehn Sprints später.

**Verifikation:** tsc 0 · Lint 0/0 · Build 0 · **visual 91/91** (+10) · **e2e 100/100**
(+10) — gestiegen um exakt die eigenen Tests. **Alle 24 Anker-Werte identisch**, Anker 1
zwölfmal 0,00. **Anker 2: abweichende Monate 2 → 0** — das ist der Zweck. `p_limit = 3`
gegengeprüft: höchstens vier Zeilen je Monat. Laufzeit 229 ms.

**Ohne Übungs-Datenbank, begründet.** Ihr Anker liegt in allen zwölf Monaten bei
2.200,00 € — für Ist **und** Plan. Damit ist `Ist − Plan` dort überall exakt 0, es gibt
keine Treiber, und die Funktion liefert leere Listen. **Ein Rundungsfehler in einer
leeren Liste ist nicht sichtbar.** Geprüft wurde stattdessen in einer zurückgerollten
Transaktion gegen die echten Daten. *Die allgemeine Lehre: vor dem Slot-Tausch prüfen,
ob die Übungs-Datenbank den fraglichen Fall überhaupt enthalten kann.*

**Nebenbefund, nicht von diesem Sprint verursacht:** Schlägt `auth.setup` fehl, schreibt
Playwright einen Seiten-Snapshot nach `test-results/` — **mit dem Passwort im Klartext**
im ausgefüllten Formularfeld. Das Verzeichnis ist gitignored, es gelangt also nichts ins
Repo; wer aber ein Trace-Zip weitergibt, gibt das Passwort mit.

**Offen nach v2-22:** `ZO-1` und `ZO-3` unverändert. Ein konstruierbarer Randfall bleibt
bewusst stehen: Gäbe es in einem Monat gar keine sichtbare Kartenzeile, während die Summe
dennoch einen Cent ergibt, hätte der Rest keinen Träger — nicht real, aber im
Migrations-Kommentar festgehalten.

---

*Nachtrag geschrieben am 15. August 2026, verdichtet aus den Review-Dateien v2-08 bis
v2-22. Primärquellen bleiben `sprints/sprint_v2-NN_review.md`.*

---

## Nachtrag ②, wenige Minuten später — v2-01

> **Gefunden vom Wächter, nicht von mir.** Die Prüfung
> `tests/e2e/doku-vollstaendigkeit.spec.ts` lief zum ersten Mal und war sofort rot:
> `sprints/sprint_v2-01_review.md` existiert, ein Historie-Eintrag nicht — die Datei
> begann bei v2-02.
>
> **Das ist ein besserer Beleg für den Wächter als jede Begründung.** Ich hatte die
> fünfzehn Lücken von Hand gesucht und v2-01 dabei übersehen; der Test brauchte drei
> Sekunden. Und das Review von v2-01 trägt in §8 sogar einen **fertigen Vorschlag** für
> genau diesen Eintrag — er wurde nie angewendet, und niemandem ist es aufgefallen.
>
> **Chronologisch gehört er vor v2-02.** Er steht trotzdem hier unten, weil die
> Append-only-Regel keine Einfügungen vorsieht. Wer chronologisch liest, springt von
> hier zurück an den Anfang der V2-Reihe.

### Sprint v2-01 · DONE 26. Juni 2026 *(nachgetragen am 15.08.2026)*

**Komponente:** Bug-Sprint `N1`–`N4a`, Option A — reine UI-/Loader-Fixes, kein
Schema-Eingriff, direkt gegen Produktion. Fünf Phasen-Commits.

**`N1` — Fragment-Stack-Monatsfilter.** Der Stack lud `fragments_with_status` **ohne**
Monatsfilter, zeigte also alle Monate. Sprint-5-E5 hatte „Rohmasse = alle Monate" als
Lesart von §8 gesetzt; `N1` korrigiert auf Single-Surface: **ein Monat**.

**Die bewusste Abweichung vom Briefing, die den Sprint trägt:** Vorgeschlagen war ein
query-seitiger `date_trunc`-Filter. Gebaut wurde ein **JS-Filter auf einer abgeleiteten
Liste**, während die volle `fragments`-Liste für `linkedByCardId` erhalten bleibt. Ein
Filter in der Abfrage hätte **Cross-Monat-Links zerstört** — ein Fragment mit
`assigned_month = targetMonth`, aber `transaction_date` in einem anderen Monat (§4.7) —
und damit den sichtbaren Bezahlt-Status betroffener Karten. Der String-Vergleich
`"YYYY-MM"` ist zeitzonenstabil, ohne `new Date()`-Konstruktion (Regel 8).

**`N2`/`N3` — die Karte streckt sich nicht mehr.** `.dropTargetWrap` bekommt
`flex: 0 0 136px` (der Wrapper hatte keine harte Breite, nur die `.card` darin), und
`.cardName` wird einzeilig mit Ellipsis. **`overflow` bleibt auf `.cardName` beschränkt,
nicht auf `.card`** — dort würde es Kontext-Icon und Tap-Catcher clippen (Sprint-4 E3).

**`N4a` — doppeltes Vorzeichen im Ring.** Bei negativem Plan-Nenner ergab
`+${formatPct((pct-1)*100)}` die Anzeige `+−X %`. Behoben mit `Math.abs`, sodass das
`+`-Präfix die einzige Vorzeichen-Quelle ist. **`N4b` bewusst NICHT entschieden** —
ob bei winzigem Plan-Nenner gekappt wird, blieb dem Design-Direktor vorbehalten.
*(Diese offene Flanke wird in v2-12 als `BF-2` zurückkommen: Der Zweig, der hier stehen
blieb, produzierte im Juli 2026 „Plan fast 0 € — −1.223 € gespart".)*

**Verifikation:** tsc 0 · Lint 0 · Build 0 · Bundle **26,2 kB / 178 kB unverändert**
gegenüber der Sprint-10-Baseline. Sparrate **per Konstruktion** stabil — keiner der vier
Fixes berührt eine Sparrate-Quelle; die RPCs wurden nicht angefasst.

**Offen nach v2-01:** Der **manuelle Cross-Monat-Drop entfällt** als Folge von `N1` —
Fremd-Monats-Fragmente stehen nicht mehr im Stack; die Auto-Absorption beim Import
bleibt unberührt. Dazu ein Bundle-Quirk, der **nicht** von diesem Sprint stammt: Das
Dashboard-Dev-Panel wird nicht aus dem Produktions-Bundle tree-geshaked, byte-gleich
schon an der Branch-Basis.

---

*Nachtrag ② geschrieben am 15. August 2026, nachdem der neue Wächter die Lücke gemeldet
hat. Primärquelle: `sprints/sprint_v2-01_review.md`.*

---

### Sprint v2-23 · DONE 16. August 2026

**Komponente:** `ZU-1` — automatisch zugeordnete Zahlungen zählten an ihrer Karte
nicht mit. **Vom Nutzer gemeldet, nicht von der Prüfstrecke gefunden.**

**Der Befund:** *„Auf der Spotify-Karte steht trotz automatischer Zuordnung noch offen
und es ist auch kein Fragment hinterlegt."* Beide Beobachtungen stimmten — und die
Messung in der Datenbank stimmte ebenfalls: `card_fragment_links` trug einen sauberen
Link, der Link-Monat war korrekt, und die Sparrate rechnete den Betrag mit. **Der Bruch
lag dazwischen.**

**Die Ursache:** `page.tsx` filterte die verknüpften Fragmente je Karte mit
`f.status === "ASSIGNED"`. Die View `fragments_with_status` kennt aber **zwei**
zugeordnete Zustände — `ASSIGNED` (der Nutzer hat gezogen) und `AUTO_ABSORBED` (die App
hat ab 95 % Konfidenz beim Import selbst zugeordnet). Die Unterscheidung ist für die
**Herkunft** gedacht, nicht für die Frage, **ob** verknüpft ist; der Filter las sie als
Ob-Frage. `card.linkedFragments` blieb leer, und `card-state.ts` entscheidet genau
daran auf „Offen".

**Der Fehler stammt aus v2-07 P0** (25.07.2026) — ausgerechnet aus dem Sprint, der
LL-21 hervorgebracht hat. Er lag drei Wochen unentdeckt, weil es im **ganzen Bestand
nur vier** automatische Zuordnungen gibt (Spotify, Mai bis August 2026); die übrigen
128 Verknüpfungen hat der Nutzer selbst gezogen und die tragen `ASSIGNED`.

**Behoben über ein benanntes Prädikat `isLinkedToCard`**, nicht über einen zweiten
`||`-Vergleich an der Fundstelle. Begründung: Der Einzelwert-Vergleich **ist** die
Fehlerbauart. Ein Prädikat ist einzeln prüfbar und hat genau einen Ort, an dem ein
dritter Zustand nachgetragen würde — dieselbe Lehre wie `BF-2` (v2-12) und `ZO-2`
(v2-22), nur an einem anderen Gegenstand.

**Der Wächter enthält zwei Prüfungen, die über den Einzelfall hinausgehen:** Eine
verlangt, dass **jeder** der fünf Status genau **einer** Gruppe zugeordnet ist (offen ·
verlinkt · Übertrag) — käme ein sechster dazu, fiele er auf, statt durchzurutschen. Die
zweite vergleicht die Status-Liste im Test gegen den Typ in der Quelldatei, damit der
erste Test nicht grün bleibt, während er eine veraltete Liste prüft.

**Verifikation:** tsc 0 · Lint 0/0 · Build 0 · `test:visual` **100/100** (94 + 6).
Gegenprobe: Mit der alten Bedingung fallen **zwei** Tests um. Anker unverändert —
reines Frontend, kein Datenbank-Eingriff. **Die Sparrate war nie betroffen:**
`calculate_sparrate_for_month` liest `card_fragment_links` direkt, nicht über den
Status. Falsch war ausschließlich, was die Karte über sich selbst sagte.

**Vierter Fall von LL-26 in fünf Tagen** — nach v2-19 (Antwort gekürzt), v2-20 (Regel
nachgebaut) und v2-21 (Schwelle als Stellvertreter). Diesmal: ein Filter, der **einen**
Wert prüft, wo die Datenbank **mehrere** kennt.

**Offen nach v2-23:** Der Browser-Smoke steht aus (Spotify-Karte Mai–August muss
„Bezahlt" zeigen). Und: Ob es weitere Aufzählungen gibt, die einen Enum-Wert vergessen
(`link_origin`, `card_type`, `transfer_type`), ist **nicht** geprüft — eine eigene
Hausaufgabe.

---

### Sprint v2-24 · DONE 17. August 2026

**Komponente:** Die App reagierte zu langsam auf Eingaben — ein Zug einer Zahlung auf
eine Karte dauerte mehrere Sekunden, und in einem Fall endete es in Vercels
Fehlerseite (`504 MIDDLEWARE_INVOCATION_TIMEOUT`). **Vom Nutzer gemeldet, mit
Screenshot.** Fünf Phasen, zwei Migrationen, keine bewegte Zahl.

**Der Befund in einem Satz:** Ein Dashboard-Aufbau machte **233 einzelne HTTP-Anfragen**
an die Datenbank, um darin **rund 490 ms** Rechenarbeit zu erledigen. Nicht die
Datenbank war langsam — der Transport war es. Diagnose vollständig in
`V2/befunde_2026-08-16_performance.md`.

**Die Zahl, die alles erklärt:** `is_card_active_in_month` braucht **0,089 ms** in der
Datenbank und lag im Produktionsschnitt bei **899 ms** über die Leitung — Faktor
~10.000. Die App rief sie **77-mal einzeln** auf, einmal pro Karte; alle 77 Antworten
zusammen zu berechnen kostet **1,2 ms**. Am 16.08.2026 transportierten **55.881
Anfragen** insgesamt **0,4 MB** — im Schnitt **8 Bytes je Antwort**.

**Der 504 ließ sich bis auf die Minute zurückverfolgen.** Der Zeitstempel in der
Vercel-Fehler-ID (`1786907424392`) ist auflösbar: 16.08.2026, **19:10:24 UTC**. Die
Minute 19:10 ist die schlechteste des Tages im Datenbank-Log — **Median-Antwortzeit
20.023 ms**. `/auth/v1/user` brauchte dort im Median 6,5 s, `/rest/v1/profiles` 14,2 s,
und die Middleware rief beide **nacheinander** auf, ohne Zeitlimit und ohne
Ausweichpfad (71 Zeilen ohne ein einziges `try`).

**Und es war keine Momentaufnahme.** Ein 10-Sekunden-Fenster mit **drei** Anfragen
zeigte einen Median von **22,7 s** — das schließt eine reine Warteschlange aus. Der
Tagesverlauf zeigt das Muster einer Instanz mit CPU-Guthaben: drei schwere Stunden
hintereinander (~44.000 Anfragen), dann Einbruch, und um 20:00 bei nachlassender Last
sofort wieder **64 ms**. **Die Dauerlast aus dem Anfrage-Fächer war die Ursache, die
Middleware ihr Opfer.**

**Die tragende Entscheidung: bündeln durch AUFRUFEN, nicht durch Nachbauen.** Beide
neuen RPCs (`get_cards_for_month`, `get_sparrate_series`) rufen die bestehenden
Rechenfunktionen auf. Die Alternative — die Prioritätskette im Bündel wiederholen —
wäre schneller gewesen (ein Query-Plan statt verschachtelter plpgsql-Aufrufe) und
hätte den Split-Anteil ein **zweites Mal** angewandt: „Miete" zeigte dann 619 € statt
1.089 €, und **das sieht plausibel aus**. Genau dieser Fehler war v2-13 (`BF-4`). Der
Preis der sicheren Variante ist messbar klein: **7,99 ms** für 34 Karten.

**Belegt wurde das über Prüfsummen, nicht über Zusicherungen.** `md5(pg_get_functiondef())`
aller neun Rechenfunktionen vor und nach beiden Migrationen: **9 identisch, 0 geändert.**
Das ist der eigentliche Anker dieses Sprints — dass die Sparrate gleich bleibt, wäre
auch bei einem zufällig übereinstimmenden Nachbau möglich; byte-identische
Funktionsrümpfe beweisen, dass keine angefasst wurde.

**Zweite tragende Entscheidung: die Kumulation der Welle bleibt im Frontend.** Die
Reihe hätte die kumulierten Werte gleich mitliefern können. Verworfen wegen LL-25:
Beide Sparrate-Funktionen runden **einmal ganz am Ende über alles**; eine Summierung in
der RPC wäre eine zweite Rundungsstelle und hätte den Anker um Cent-Beträge bewegt.
`get_sparrate_series` enthält deshalb **kein `sum()` und kein `round()`**.

**Wo eine Annahme falsch war — die teuerste Stelle des Sprints:** Zwei Prüfläufe
hintereinander endeten mit Fehlschlägen, deren Test-Abbild die **Anmeldeseite** zeigte.
Das las sich wie ein Auth-Fehler durch das neue Middleware-Zeitlimit, und die Suche
lief zwei Runden in diese Richtung. Die Ursache war banal und lag bei mir: **`pnpm
build` bei laufendem dev-Server** — beide teilen `.next`, und der Build zog dem Server
den Boden weg. Ein sauberer Lauf war sofort grün (122/122). **Ein Symptom, das nach dem
gerade geänderten Bauteil aussieht, ist der bequemste falsche Verdacht.**

**Was der Fehlschlag trotzdem eingebracht hat:** Er zwang zur Frage, ob das
Auth-Zeitlimit von 4 s tragfähig ist. Die in Produktion gemessene **langsamste**
Auth-Antwort liegt bei **5.205 ms** — 4 s hätten eine gültige Sitzung abgeschnitten und
den Nutzer abgemeldet. Auf **8 s** angehoben; mit Wiederholversuch ~16 s und damit klar
unter Vercels 25-s-Grenze.

**Eine geplante Phase wurde bewusst nicht gebaut.** Die Suspense-Grenzen um Welle und
Karussell standen im Plan, begründet mit „233 Anfragen blockieren die Anzeige". Nach
P3/P4 sind es ~18 mit p50 32–118 ms. Die Begründung war weg, die Grenzen wären eine
bewegliche Stelle mehr gewesen. **Eine Maßnahme, deren Anlass entfallen ist, gehört
gestrichen und nicht trotzdem gebaut, weil sie im Plan stand.**

**Nebenfund:** `src/lib/supabase/types.ts` war **seit v2-21 veraltet** — fünf RPCs
fehlten (`af_normalize_text`, `af_word_in_text`, `history_match`,
`name_similarity_scoped`, `refresh_fragment_suggestions`). Der Neu-Erzeugungs-Schritt
war damals übersprungen worden. Aufgefallen ist es nur, weil `tsc` die neue RPC nicht
kannte. Der Zeilen-Diff war 288+/267− und unlesbar; ein **Namensmengen-Vergleich**
beantwortete die Frage in einer Zeile: nichts verloren, sechs dazu.

**Verifikation:** tsc 0 · ESLint (kanonisch, `src`) 0/0 · Build 0, Route `/` 35,8 kB
(vorher 35,6), geteiltes Bundle 87,3 kB unverändert · `test:visual` **113/113**
(100 + 13 neue) · `test:e2e` **122/122** inkl. Render-Smoke.

**Anker:** Alle zwölf Monate Ist und Plan **identisch**, Ist 2025 weiter 4.037,11 €,
Invariante 1 **0,00 € in allen zwölf**, B2 **0 von 12 verletzt**, Prüfsummen **9/0**.
Zusätzlich Wert-für-Wert-Gleichheit der neuen Funktionen gegen die alten Wege:
**304 = 304** über 24 Monate (Karten) und **36 = 36** über drei Jahre (Reihe), jeweils
`EXCEPT` in **beide** Richtungen. Protokoll: `sprints/sprint_v2-24_anker.md`.

**Wirkung, aus dem Produktions-Log gemessen:**

| | vorher | nachher |
|---|---|---|
| Anfragen je Dashboard-Aufbau | **233** | **~18** |
| p50 je Anfrage | 500–1.300 ms | **32–118 ms** |
| `is_card_active_in_month` je Aufbau | 77 | **0** |
| `calculate_sparrate_for_month` je Aufbau | 25 | **0** |
| `get_year_deviation_drivers` | 1 je Aufbau (357 ms) | **1× je geöffnetes Popup** |
| Netzrunden je Middleware-Durchlauf | 2, nacheinander | **1** |
| ECONNRESET-Wiederholungen im Prüflauf | dutzende | **0** |
| Laufzeit der Prüfstrecke | 2,3–3,2 min | **34,7 s** |

**Verfahrens-Abweichung, ausdrücklich benannt:** Die Übungs-Datenbank-Probe wurde nach
Nutzer-Entscheidung übersprungen. Ausschlaggebend: Die neuen Funktionen sind `STABLE`
und tragen neue Namen, können also strukturell nichts überschreiben oder verändern;
und dem synthetischen Bestand fehlt der gefährlichste Fall — **eine GEMEINSAM-Karte
mit verknüpfter Zahlung gibt es dort nicht, in den echten Daten fünfmal** (davon eine
vierteljährlich). Verifiziert wurde stattdessen rein lesend gegen Produktion.

**Offen nach v2-24:** Der **Browser-Smoke des Nutzers** steht aus. **Zwei Wortlaute
sind neue UI-Copy** und brauchen die §12-Freigabe („Treiber werden geladen" plus die
drei Zeilen der Fehlerseite). Der **RLS-Feinschliff** bleibt liegen — `auth.uid()` wird
in **elf** Policies pro Zeile neu ausgewertet, mechanisch behebbar, aber es sind
Zugriffsregeln auf echte Finanzdaten und der Sprint trug schon zwei Migrationen; dazu
zwei fehlende Fremdschlüssel-Indizes. Und **in welcher Region die Vercel-Funktionen
laufen, ist ungeklärt** — es gibt weder `vercel.json` noch eine Einstellung in
`next.config.mjs`; nur im Vercel-Konto einsehbar. Der **Middleware-Ausweichpfad ist
nie angesprungen** (0 Warnungen in zwei vollständigen Läufen) — das zeigt, dass er
nicht im Weg ist, aber nicht, dass er im Ernstfall greift.

**Nachtrag vom selben Tag (17.08.2026) — der teuerste Fund kam nach dem Review.**
Der Eintrag oben bleibt stehen, wie er geschrieben wurde; dieser Absatz ergänzt ihn.

Punkt ③ der offenen Fragen war *„In welcher Region laufen die Vercel-Funktionen?"* —
ich konnte es nicht prüfen, es gibt weder `vercel.json` noch eine Einstellung in
`next.config.mjs`. **Der Nutzer hat nachgesehen: Sie standen auf USA.** Die Datenbank
liegt in **eu-west-1 (Irland)**. Jede einzelne Anfrage lief über den Atlantik und
zurück — rund **90 ms** Umweg, bei den damaligen **233 Netzrunden** je Aufbau ein
erheblicher Anteil der Wartezeit. Umgestellt auf **Frankfurt (`fra1`)**.

**Der eigentliche Befund ist nicht die Region, sondern die Zeile darüber.** CLAUDE.md §2
behauptete über ein Jahr *„Region matched Supabase (eu-west-1)"*. Sie tat es nicht.
Weder die Prüfstrecke noch die Verfassung selbst konnte das finden — **eine Behauptung
prüft sich nicht selbst**, und diese klang so beruhigend, dass niemand nachsah. Dass
sie überhaupt hinterfragt wurde, lag allein daran, dass dieser Sprint die Frage stellte.

**Das ist LL-22 in seiner allgemeinen Form** — jene Lehre sagt es über *Rechenverhalten*
(„eine Doku-Zusage ist keine Prüfung"), hier war es die Infrastruktur. Festgeschrieben
als **LL-30** und **§6 Stolperfalle 20**: Eine Einstellung, die nur in einem Web-Portal
lebt, ist für das Repo unsichtbar und bei einem neu angelegten Projekt weg.

**Dieselbe Fehlerklasse traf beim Nachziehen eine zweite Zeile derselben Datei.** §9
nannte als Doku-Versionen „Schema-Doku **v3.6.0**", während die Datei selbst bei
**v3.9.0** stand — drei Minor-Versionen Rückstand. Beide Zeilen sind korrigiert und
haben einen **Warnkasten** bekommen, der sagt, dass es passiert ist. Eine
stillschweigende Korrektur hätte den Lerneffekt weggeworfen; genau das ist der Grund,
warum dieser Log existiert.

**Wo ich dabei an eine Grenze gestoßen bin:** Die 90 ms tauchen in **keiner** meiner
Messungen auf. Der Supabase-Log misst mit `response.origin_time` die *eigene*
Verarbeitungszeit, nicht die Netzstrecke von Vercel dorthin. Ich habe den ganzen Sprint
über die richtige Zahl gemessen — und eine Fehlerquelle daneben schlicht nicht sehen
können. **Sichtbar wäre sie nur in der Vercel-Funktionsdauer gewesen**, auf die ich
keinen Zugriff habe. Wer das nächste Mal Trägheit untersucht: Die Messung endet an der
Grenze des Systems, in dem man messen kann, und diese Grenze gehört benannt.

**Zwei Reste bleiben offen** (`PF-4`, jetzt 🟡): `fra1` ist gut, aber nicht die genaue
Entsprechung — Supabase `eu-west-1` ist Irland, Vercel bietet dafür `dub1` (Dublin),
rund 20 ms näher. Und die Einstellung lebt weiter nur im Portal; sie im Code
festzunageln (`preferredRegion`, `vercel.json`) ist bewusst **noch nicht** geschehen,
solange die erste Frage offen ist — der Code würde sonst den Wert festschreiben, der
gerade zur Prüfung steht, und beim nächsten Portal-Wechsel schweigend gewinnen.

**Ebenfalls an diesem Tag:** Der **Browser-Smoke ist bestanden**, und beide
Doku-Freigaben sind erteilt und angewendet — Design-Doku **v3.8.0** (§12.8 dritter
Treiber-Platzhalter mit Bedeutungs-Tabelle, §12.12 neu für Ladezustand und
Fehlerseite), CLAUDE.md mit den Stolperfallen 18–20, LL-28 bis LL-30 und dem neuen
**Anker 3**.

**Zweiter Nachtrag vom 17.08.2026 — `PF-4` am Tag seiner Entstehung geschlossen.**

Der Nutzer hat die Regions-Auswahl aufgerufen, und darin stand die Antwort wörtlich:
**„Dublin, Ireland (West) — `eu-west-1` — `dub1`"**. Das ist dieselbe AWS-Region, in der
die Supabase-Datenbank liegt — keine Annäherung, sondern die exakte Entsprechung. Erst
auf Frankfurt umgestellt, am selben Tag auf **Dublin** weitergezogen.

**Die Zahl, die die Entscheidung trägt, hatte ich vorher nicht auf dem Schirm.** Ich habe
über den ganzen Sprint die **Anfragen** gezählt (233 → ~18) — für die Frage „welche
Region?" ist aber die Zahl der **Abhängigkeitsstufen** maßgeblich: `page.tsx` hat **13
`await`-Barrieren**, Stellen, an denen der Render auf eine Antwort warten *muss*, bevor
er die nächste Frage stellt. Jede kostet eine volle Wegstrecke, unabhängig davon, wie
viele Anfragen darin parallel laufen. Frankfurt (andere AWS-Region) ~250–320 ms über 13
Stufen, Dublin (gleiche Region) ~25–40 ms.

Dass Dublin für einen Nutzer in Deutschland rund 25 ms weiter weg ist, verliert dagegen
klar: **Der Browser spricht pro Geste zweimal mit der Funktion, die Funktion
dreizehnmal mit der Datenbank.** Das Verhältnis 13:2 entscheidet.

**Und der eigentliche Abschluss:** Die Region steht jetzt in **`vercel.json`**
(`{"regions": ["dub1"]}`) — versioniert, im Diff sichtbar, sie überlebt ein neu
angelegtes Projekt und **gewinnt gegen das Portal**. Damit ist LL-30 für diesen Fall
nicht nur beschrieben, sondern behoben. Die Begründung steht in CLAUDE.md §2 und §3,
weil JSON keine Kommentare trägt — und §3 hält zusätzlich fest, dass diese Datei
**bewusst kein Sammelbecken** für Deployment-Optionen wird.

**Zwei Dinge, die diesen Nachtrag überleben sollten.** Erstens: **Ich habe die richtige
Zahl gemessen und die entscheidende nicht gesehen.** Anfragen zählen war richtig und hat
den Sprint getragen; für die Regions-Frage war es die falsche Kennzahl, und ich bin erst
darauf gekommen, als der Nutzer die Auswahlliste zeigte. Zweitens: **Die Grenze der
Messung gehört ins Ergebnis.** Die 13 Stufen sind gezählt, die Millisekunden sind
geschätzt — die Netzstrecke Vercel→Supabase liegt außerhalb dessen, was
`response.origin_time` sieht. Eine Schätzung, die als solche gekennzeichnet ist, ist in
diesem Projekt brauchbar; eine, die als Messung auftritt, wäre es nicht.
