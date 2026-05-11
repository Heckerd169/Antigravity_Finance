# Sprint 1 — Review

> **Sprint:** 1 — Onboarding + Income / Partner-Split
> **Branch:** `sprint/01-income`
> **Datum:** 11. Mai 2026
> **Modell:** Opus 4.7
> **Status:** 🟡 IN PROGRESS — wartet auf Browser-Smoke-Test durch User

---

## 1. Code-Diff (git status nach feat:-Commit)

```
$ git status
* sprint/01-income...origin/sprint/01-income [ahead 1]
clean — nothing to commit
```

`feat:`-Commit `c54ab1c`:

```
src/app/dashboard-dev-panel.tsx                       (neu)
src/app/login/actions.ts                              (mod)
src/app/onboarding/actions.ts                         (neu)
src/app/onboarding/onboarding-form.tsx                (neu)
src/app/onboarding/onboarding.module.css              (neu)
src/app/onboarding/page.tsx                           (neu)
src/app/page.module.css                               (mod)
src/app/page.tsx                                      (mod)
src/components/income-split/actions.ts                (neu)
src/components/income-split/income-split.module.css   (neu)
src/components/income-split/income-split.types.ts     (neu)
src/components/income-split/index.tsx                 (neu)
src/lib/rpc.ts                                        (neu)
src/lib/supabase/middleware.ts                        (mod)
```

14 Dateien · +1537 / −10.

## 2. `tree src/`

```
src/
├── app/
│   ├── actions/
│   │   └── auth.ts
│   ├── dashboard-dev-panel.tsx        (neu)
│   ├── globals.css
│   ├── layout.tsx
│   ├── login/
│   │   ├── actions.ts                 (mod — profiles upsert)
│   │   ├── login.module.css
│   │   └── page.tsx
│   ├── onboarding/                    (neu — komplett)
│   │   ├── actions.ts
│   │   ├── onboarding-form.tsx
│   │   ├── onboarding.module.css
│   │   └── page.tsx
│   ├── page.module.css                (mod)
│   └── page.tsx                       (mod)
├── components/
│   └── income-split/                  (neu — komplett)
│       ├── actions.ts
│       ├── income-split.module.css
│       ├── income-split.types.ts
│       └── index.tsx
├── lib/
│   ├── rpc.ts                         (neu)
│   └── supabase/
│       ├── client.ts
│       ├── middleware.ts              (mod — Onboarding-Guard)
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
 ✓ Generating static pages (7/7)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                              Size     First Load JS
┌ ƒ /                                    3.51 kB         155 kB
├ ○ /_not-found                          873 B          88.2 kB
├ ƒ /login                               298 B          87.6 kB
└ ○ /onboarding                          2.81 kB         155 kB
+ First Load JS shared by all            87.3 kB

ƒ Middleware                             81.6 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

Anmerkung: `/onboarding` ist als `○` (statisch) ausgegeben, weil die Page-Komponente
selbst kein Server-Data-Fetching macht — der Form-Inhalt wird komplett im Client
geladen via Browser-Supabase-Client. Funktional korrekt: Auth-Guard läuft in der
Middleware, bevor die Page überhaupt gerendert wird.

## 4. Schema-Verifikation (Supabase MCP, Pre-Implementation)

Vor der Implementierung gemacht, um Annahmen aus dem Briefing zu verifizieren:

```sql
-- Brackets fuer 2026 verfuegbar
SELECT tax_year, tax_class, COUNT(*) FROM net_estimation_brackets
WHERE tax_year IN (2025, 2026) GROUP BY tax_year, tax_class;
-- → 6 Steuerklassen × {4..6} Brackets fuer 2026 vorhanden.

-- Trigger auf auth.users
SELECT tgname, pg_get_triggerdef(oid) FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass AND NOT tgisinternal;
-- → on_auth_user_created EXISTIERT, ruft public.handle_new_user() auf
-- → INSERT INTO public.profiles (user_id) ON CONFLICT DO NOTHING;

-- Constraints income_timeline
SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint
WHERE conrelid = 'public.income_timeline'::regclass;
-- → UNIQUE (user_id, person, effective_month) ⚠ siehe Open Question #1
-- → CHECK (effective_month = date_trunc('month', effective_month))
-- → CHECK (gross_annual >= 0 AND net_monthly >= 0)

-- RPC-Signatur
SELECT pg_get_function_arguments('estimate_net_monthly'::regproc);
-- → p_gross_annual numeric, p_tax_class smallint, p_tax_year smallint
```

## 5. DB-Verifikations-Block (nach Smoke-Test durch User auszuführen)

```sql
SELECT user_id, person, effective_month, gross_annual, net_monthly
FROM income_timeline
ORDER BY effective_month, person;

SELECT user_id, onboarded_at, tax_class, tax_year FROM profiles;
```

→ **Output bitte nach Smoke-Test einfügen.** Erwartet:
- Mindestens 1 Row in `income_timeline` für ICH (Onboarding)
- `profiles.onboarded_at` ≠ NULL, `tax_class` gesetzt, `tax_year = 2026`

## 6. Selbst-Review-Checkliste A1–A18

| #   | Kriterium | Status | Anmerkung |
|---|---|---|---|
| A1  | `pnpm install` + `pnpm build` fehlerfrei | ✅ | Keine neuen Deps. Build clean. |
| A2  | `tsc --noEmit` ohne Fehler | ✅ | „No errors found." |
| A3  | Frisch eingeloggter User mit `onboarded_at = NULL` → `/onboarding` | 🟡 | Code-seitig in `middleware.ts` implementiert. Browser-Smoke-Test offen. |
| A4  | `/onboarding` enthält alle Pflichtfelder (§10) | 🟡 | Steuerklasse 1–6, Brutto-Slider, Netto-Pflichtfeld, Partner optional. Visuell offen. |
| A5  | Brutto-Slider 20.000–150.000, Step 100 | ✅ | Konstanten in beiden Forms identisch. |
| A6  | Live-Vorschau Netto-Schätzung | ✅ | useEffect mit 150 ms Debounce auf grossAnnual/taxClass/taxYear. |
| A7  | Manuell überschreiben → „Manuell angepasst" Teal | ✅ | `netState === "manual"` zeigt `styles.hintTeal`. |
| A8  | Leeren + Blur → Vorschlag kehrt zurück | ✅ | `handleNetBlur()` setzt netInput auf `formatNetForInput(estimate)`, state „restored". |
| A9  | „Übernehmen" disabled bei leerem Netto | ✅ | `submitDisabled = ... || netNumber === null || netNumber <= 0`. |
| A10 | Submit → DB-Zustand korrekt | 🟡 | Code-seitig korrekt. SQL-Verifikation nach Smoke-Test (§5). |
| A11 | Nach Submit: Redirect /, kein erneuter Onboarding-Loop | ✅ | Server Action `redirect("/")` + Middleware-Guard. |
| A12 | Auf / sind die zwei Dev-Trigger sichtbar | 🟡 | `process.env.NODE_ENV === "development"`-Gate. Visuell offen. |
| A13 | Klick „[DEV] ICH bearbeiten" öffnet Popup mit Initialwerten | ✅ | `page.tsx` lädt latest income_timeline pro Person, übergibt an `DashboardDevPanel`. |
| A14 | Klick „[DEV] PARTNER bearbeiten" öffnet Popup ohne Steuerklasse-Sektion | ✅ | `isFirstIncomeEntry={openPerson === "ICH" ? isFirstIncomeForIch : false}` → für PARTNER immer false → Steuerklasse-Block nicht gerendert. |
| A15 | RPC `estimate_net_monthly` typsicher via `lib/rpc.ts` | ✅ | Beide Forms importieren `estimateNetMonthly` aus `@/lib/rpc`. Kein direkter `.rpc()` außerhalb. (Verifizierbar: `grep -r '\.rpc(' src/` liefert nur `src/lib/rpc.ts`.) |
| A16 | `font-variant-numeric` greift in Brutto-/Netto-Zahlen | ✅ | Global in `globals.css` auf `body` (Sprint-0-Erbe). Inputs setzen explizit `font-variant-numeric: tabular-nums` für Sicherheit. |
| A17 | Vergangener `activeMonth` → Popup gesperrt + gelbe Warnung | ✅ | `isPast()` in `income-split/index.tsx`, `forcePastMonth`-Prop am DevPanel als auskommentierter Test-Hook. Visuell offen. |
| A18 | RLS funktioniert (`auth.uid()` respektiert) | ✅ | Alle DB-Operationen laufen über `createClient()` aus `@/lib/supabase/server` → bringt User-Cookie → RLS-Policies greifen. Kein direkter Service-Role-Zugriff. |

**Visuell zu verifizieren durch User-Browser-Smoke-Test (analog Sprint 0):**
A3, A4, A12, A17 — und vor allem die Smoke-Test-Sequenz §5 des Briefings.
A10 hängt am SQL-Output nach Schritt 6 der Smoke-Sequenz.

## 7. Antwort auf §3.2-Frage (profiles-Auto-Creation)

**Befund per Supabase MCP:** Der Trigger `on_auth_user_created AFTER INSERT ON
auth.users` existiert und ruft `public.handle_new_user()`, die einen
`INSERT INTO public.profiles (user_id) ON CONFLICT (user_id) DO NOTHING`
ausführt.

**Aber:** Der Test-User `dominik.hecker.92@gmail.com` (erstellt 28.03.2026) hat
**keinen** `profiles`-Eintrag. Erklärung: Der Trigger wurde nach dem 28.03.2026
hinzugefügt — Alt-User aus der Zeit vor dem Trigger sind nicht abgedeckt.

**Implementierung (PM-Entscheidung Option 2, vorab im PM-Chat):**
Idempotenter `upsert` in `src/app/login/actions.ts` nach erfolgreichem
`signInWithPassword`. Inline-Kommentar verweist auf Briefing §3.2 und erklärt
die Belt-and-Suspenders-Begründung (Trigger primär, Login-Upsert sekundär).

```ts
await supabase
  .from("profiles")
  .upsert({ user_id: data.user.id }, { onConflict: "user_id", ignoreDuplicates: true });
```

**Begründung gegen Option 3 (Middleware-Upsert):** Profile-Creation gehört zum
Auth-Flow, nicht zur Edge-Middleware. Upsert läuft genau einmal pro Login statt
bei jedem Page-Load. Middleware bleibt reine Read+Redirect-Logik. Trotzdem
defensive Behandlung in der Middleware: `maybeSingle()` + `if (!profile?.onboarded_at)`
behandelt fehlenden Profile-Eintrag identisch zu „nicht onboarded".

## 8. Offene Fragen an den PM

### Open Question #1 — UNIQUE-Constraint blockiert Re-Save desselben Monats

**Befund:** Schema hat `UNIQUE (user_id, person, effective_month)` auf
`income_timeline`. Briefing §8.2 sagt explizit: „Falls Constraint vorhanden ist
und blockt: in Review als offene Frage melden". Genau das passiert hier.

**Konsequenz für Smoke-Test:** Schritt 9–10 der Smoke-Sequenz (Brutto-Slider
ändern auf 70.000 → erneut „Übernehmen" → erwartet zweite Row für ICH im
**selben** Mai-2026) ist ohne manuelles SQL-Cleanup oder Monatswechsel
**nicht durchführbar** — der zweite Insert wird mit Friendly-Error
„Für diesen Monat … existiert bereits ein Eintrag" geblockt.

**Implementiert wurde:** Reiner INSERT, Conflict (`code === "23505"`) wird
abgefangen und als deutsche User-Meldung im Popup zurückgegeben. **Kein**
UPDATE-Pfad, keine ON-CONFLICT-DO-UPDATE-Logik (wäre eine Schema-/Architektur-
Entscheidung).

**Drei Lösungsoptionen für PM:**

| Option | Beschreibung | Implikation |
|---|---|---|
| A | Status quo: INSERT-only, Friendly-Error. Smoke-Test 9–10 nur mit SQL-Reset zwischen Versuchen. | Streng konform mit „append-only in V1". User muss verstehen, dass eine Korrektur erst ab dem Folgemonat möglich ist. |
| B | UPSERT erlauben (`ON CONFLICT (user_id, person, effective_month) DO UPDATE`). Sprich: „Re-Save desselben Monats vor Verstreichen der Zeit überschreibt den Eintrag". | Verletzt strikt „append-only", ist aber UX-intuitiv. Snapshot-Integrität bleibt für vergangene Monate gewahrt (nur der noch laufende Monat kann modifiziert werden). |
| C | UNIQUE-Constraint im Schema fallenlassen + im Frontend nichts ändern (würde dann zwei Rows für denselben Monat erzeugen, der „neueste ≤ M"-Lookup gewinnt). | Schema-Eingriff (Architekt). Append-only im Wortsinn, aber Daten-Hygiene leidet. |

**Empfehlung Claude Code:** Option B. Die UNIQUE-Spalten-Kombination definiert
einen logischen Slot — eine Korrektur des laufenden Monats ist eine
„noch-nicht-eingefrorenen" Operation und sollte erlaubt sein.

### Open Question #2 — Partner-Steuerklasse für Schätzung

**Befund:** §10 sagt explizit, dass Steuerklasse nur beim ersten ICH-Eintrag
erfasst wird. Für PARTNER-Schätzungen wird im Code derzeit `taxClass: 1` als
Fallback verwendet (Klasse 1 = Single-Default).

**Frage:** Ist das so gewollt, oder soll die Schätzung für PARTNER bei
Verheirateten besser auf Klasse 4 oder 5 fallen, abgeleitet aus
`profiles.tax_class` (z. B. ICH=3 → PARTNER=5)? Erfordert Spec, ist aber
außerhalb von Sprint 1.

**Workaround:** Partner-Netto ist ohnehin überschreibbar — die Schätzung ist
nur Komfort. Funktional kein Blocker.

### Open Question #3 — Bracket-Konsistenz „kein Vorschlag" vs. „Vorschlag"

**Befund:** Bei `estimate_net_monthly` → null wird das Netto-Feld geleert und
der Hinweistext zeigt „Schätzung … nicht verfügbar". Wenn der User dann
zurück auf einen Brutto-Wert schiebt, für den ein Bracket existiert, wird das
Feld neu vorbefüllt. Wenn er **vorher** einen manuellen Wert eingegeben hatte
(z. B. weil das Jahr nicht abgedeckt war), wird `manualOverride` durch den
neuen Estimate **überschrieben** — der manuelle Wert ist weg.

**Frage:** Akzeptabel? Alternative wäre: einmal `manualOverride = true`
gesetzt, bleibt es das, bis der User das Feld bewusst leert. Aktuelles
Verhalten ist „Estimate gewinnt, sobald verfügbar", was für die Onboarding-
Erstnutzung (Brutto-Slider hin und her) intuitiver ist. Für die
Re-Edit-Sequenz (vorbefüllt aus DB, dann Brutto ändern) eventuell nicht.

**Implementiert:** Aktuelles Verhalten = „Estimate gewinnt, sobald !manualOverride".
Wenn die Antwort lautet „manueller Wert immer behalten bis explizit gelöscht",
ist die Änderung minimal (eine Codezeile in beiden useEffects).

## 9. Vorschläge zur CLAUDE.md-Aktualisierung (Lessons Learned)

### LL-1: Sprint-Output muss vor `sprint_NN_review.md` committet sein

Im PM-Chat besprochene neue Regel — bitte in §7 „Sprint-Output-Format" aufnehmen:

> Reihenfolge am Sprint-Ende:
> 1. Code implementieren
> 2. Sanity-Checks (`pnpm build`, `tsc --noEmit`, `next lint`)
> 3. **`feat:`-Commit für Code** auf `sprint/NN-<komponente>`
> 4. `sprints/sprint_NN_review.md` schreiben (referenziert `git status` *nach* Commit = clean + Datei-Liste aus dem Commit)
> 5. **`docs:`-Commit für die Review-Datei**
> 6. Am Sessions-Ende: `git status` clean, keine `??`/`M`-Einträge.

### LL-2: `on_auth_user_created`-Trigger existiert aber Alt-User sind nicht abgedeckt

Vorschlag für CLAUDE.md §6 „Schema-Referenz" — Hinweis ergänzen:

> **Hinweis:** `auth.users` hat einen `on_auth_user_created`-Trigger, der
> via `handle_new_user()` einen `profiles`-Row mit `ON CONFLICT DO NOTHING`
> anlegt. Auth-User aus der Zeit vor dem Trigger haben noch keinen Eintrag —
> der Login-Server-Action macht daher idempotent ein Upsert (siehe
> `src/app/login/actions.ts`).

### LL-3: `income_timeline.UNIQUE(user_id, person, effective_month)`

Vorschlag — entweder unter §6 oder unter §7 Grundregeln:

> **Stolperfalle:** `income_timeline` hat einen UNIQUE-Constraint auf
> `(user_id, person, effective_month)`. Re-Save desselben Monats für dieselbe
> Person schlägt mit `23505` fehl. Frontend muss dies entweder mit
> Friendly-Error abfangen (Status quo Sprint 1) oder bewusst per
> ON-CONFLICT-DO-UPDATE handhaben (PM-Entscheidung offen — siehe Open
> Question #1).

### LL-4: `effective_month` muss Tag 1 sein

Vorschlag — unter §7:

> **Stolperfalle:** `income_timeline.effective_month` hat einen
> CHECK-Constraint `effective_month = date_trunc('month', …)`. Frontend muss
> immer `YYYY-MM-01` schreiben — `new Date(year, month - 1, 1)` reicht nicht
> wegen Timezone-Risiken; sicherer ist String-Konstruktion
> `${yyyy}-${mm}-01`.

### LL-5: RPC-Wrapper-Signatur

Empfehlung für `lib/rpc.ts` ab Sprint 2: alle Wrapper akzeptieren explizit
einen `SupabaseClient` als ersten Parameter, statt intern zwischen
`server.ts`/`client.ts` zu wählen. Vorteil: kein versteckter Server-/Client-
Switch, ein RPC funktioniert überall. Wurde so in Sprint 1 für
`estimateNetMonthly` umgesetzt — falls PM zustimmt, als Konvention in CLAUDE.md
§7 Datei-Konventionen festhalten.

---

## 10. Korrektur-Notiz (post-review · `fix:`-Commit `2245673`)

PM-Antwort auf §8 Open Questions als Korrektur-Briefing-Append in
`sprints/sprint_01_briefing.md` (PM-Commit `282cc67`). Umgesetzt im
`fix:`-Commit `2245673` auf `sprint/01-income`.

- **K1 — UPSERT statt INSERT (Option B).** `income_timeline`-Writes laufen
  jetzt in `src/components/income-split/actions.ts` und
  `src/app/onboarding/actions.ts` als `.upsert(..., { onConflict:
  "user_id,person,effective_month" })`. Friendly-23505-Error obsolet und
  entfernt. Beide Server Actions tragen jetzt einen serverseitigen
  Past-Month-Guard (Belt-and-Suspenders zur UI-Sperre). Smoke-Test
  Schritt 9–10 funktioniert jetzt ohne SQL-Reset.

- **K2 — `manualOverride` no-op im useEffect.** Beide Forms (Onboarding +
  Popup) bekommen `if (manualOverride.current) return;` direkt nach
  `setEstimate(result)`. Der Schätzungs-Hint bleibt damit beim
  Brutto-Wechsel aktuell, das Netto-Feld behält den manuellen Wert. State
  wird weiter nur durch zwei User-Aktionen umgeschaltet: manuelle Eingabe
  → true, Selbstheilung (Leeren + Blur) → false.

- **K2-Folgewirkung Popup-Default:** `manualOverride.current` startet im
  Popup `true`, wenn `initialNetMonthly` aus der DB vorbefüllt ist — d. h.
  der gespeicherte Wert bleibt auch beim Brutto-Verschieben erhalten,
  bis der User entweder leert (→ Estimate wieder aktiv) oder einen Wert
  tippt, der ≈ Estimate ist (→ override false). Das ist konsistent mit
  K2-Intent und §10 §Forward-Inheritance: gespeicherte Werte werden nicht
  unbeabsichtigt überschrieben.

- **Open Question #2:** keine Code-Änderung. `taxClass: 1` als Fallback
  für PARTNER-Schätzung bleibt V1-Verhalten, V2-Backlog.

- **Sanity-Checks nach Korrektur:** `tsc --noEmit` clean ·
  `next lint` clean · `pnpm build` clean.

---

**Ende des Sprint-1-Review.**
