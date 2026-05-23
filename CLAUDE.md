# CLAUDE.md — Antigravity Finance 1.0

> **Single source of truth** für Claude Code zwischen Sprints.
> Diese Datei wird vom PM (Opus 4.7) nach jedem abgeschlossenen Sprint aktualisiert.
> **Letzte Aktualisierung:** 17. Mai 2026 · **Nach Sprint:** 5 (Approved)

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
| 4 | Karten — alle 3 Typen × alle Zustände (§7) | 🟢 Done | sprints/sprint_04_briefing.md | 16. Mai 2026 |
| 5 | Untere Interaktionszone (§8) | 🟢 Done | sprints/sprint_05_briefing.md | 17. Mai 2026 |
| 6 | Sparrate-Verifikation (§4.6 Test-Case = 2.910,01 €) | 🟢 Done | sprints/sprint_06_briefing.md | 20. Mai 2026 |
| 7 | UI-Komplettierung (V1 BUDGET-Tap + V6 §10 Income-Split-Trigger + V2 Cleanup) | 🟢 Done | sprints/sprint_07_briefing.md | 21. Mai 2026 |
| 8 | CSV-Import / Distiller (§11) |  🟢 Done | sprints/sprint_08_briefing.md | 23.05.2026 |
| 9 | Soft-Delete-Pattern (§2.4) | — | — | — |
| 10 | Sparraten-Treppe (§9) | — | — | — |
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
- `karten_final_v4.html` zeigt eine Budget-Karte mit „Gemeinsam"-Attribution („Essen 260 €")
  — Design-Doku §7 verbietet das explizit (Budget = immer ICH, datenbankseitig durch
  Constraint abgesichert). Prototyp-Visual ignorieren.
- ~~`karten_final_v4.html` zeigt einen Budget-Zustand „Abgeschlossen" mit „X € nicht
  verbraucht" — Design-Doku §7 spezifiziert für Budget nur 3 Zustände~~
  → **Aufgehoben durch Sprint 7 (21.05.2026):** Budget-Karten haben ab Sprint 7
  vier Zustände inkl. „Abgeschlossen". Design-Doku §7 in diesem Patch-Lauf
  aktualisiert. Prototyp-Visual ist jetzt produktiv.

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

**Wichtige Schema-Befunde aus Sprint 4 (Karten):**
- Spalten in `cards` heißen `type`, `attribution`, `frequency` — **ohne** `card_`-
  Präfix (LL-7). Werte sind die ENUM-Strings aus Design-Doku §2.6 (`FIXED_COST`,
  `INCOME`, `BUDGET`; `ICH`, `GEMEINSAM`; `MONTHLY`, `QUARTERLY`, `SEMIANNUAL`,
  `ANNUAL`, `ONCE`).
- `card_monthly_states` Composite-Key ist `(card_id, month)`. UPSERTs nutzen
  `onConflict: "card_id,month"`. Row kann existieren wegen `manually_paid=true`
  ohne `adjusted_amount`, oder umgekehrt. Beim Clearen eines Felds: `UPDATE ...
  SET adjusted_amount = NULL`, NICHT `DELETE` (sonst geht `manually_paid` mit verloren).
- `card_planned_timeline` Composite-Key ist `(card_id, effective_month)`. Forward-
  Inheritance erfolgt durch `.upsert(..., { onConflict: "card_id,effective_month" })`
  — analog zum Income-Timeline-Pattern aus Sprint 1.
- Hot-Path-RPCs (`calculate_card_amount_for_month`, `is_card_active_in_month`,
  `get_planned_amount_for_month`) nehmen **kein** `p_user_id` — RLS über
  `auth.uid()` auf den referenzierten Tabellen. Bei fehlender Session: stilles
  NULL/`false`/`0`, kein Error. Defensiver Wrapper-Check pflicht.
- `get_split_factor` ist die einzige Karten-bezogene Hot-Path-RPC, die `p_user_id`
  erwartet (greift auf `income_timeline` zu, das nicht über Card-FK gefiltert wird).

**Wichtige Schema-Befunde aus Sprint 5 (Untere Interaktionszone):**
- DEFERRED-Constraint `cards_assert_initial_plan` erzwingt: jede neue `cards`-Row
  muss in derselben Postgres-Transaktion eine korrespondierende
  `card_planned_timeline`-Row haben. **Konsequenz:** Card-Anlage aus dem
  Supabase-JS-Client kann NICHT als zwei sequentielle INSERTs erfolgen — der
  zwischenzeitliche implizite COMMIT triggert den Constraint. Lösung: atomare
  RPCs (`create_card_direct`, `create_card_from_fragment`) — siehe RPC-Block unten.
- `card_fragment_links.month` ist semantisch das **Link-Month** (Periodenabgrenzung),
  NICHT das Transaction-Date des Fragments. Beim Cross-Monat-Drop (User in
  Mai-View, Fragment aus März auf Mai-Karte) setzt das Frontend `month = targetMonth`,
  nicht `fragment.transaction_date`. Konflikt 4 §7.
- View `fragments_with_status` ist live, `SECURITY INVOKER`-tunneled. Spalte
  `status` ist `text` (nicht ENUM), Werte: `'UNASSIGNED'` / `'ASSIGNED'` /
  `'AUTO_ABSORBED'`. RLS erbt über LEFT JOIN von `fragments` + `card_fragment_links`.
- `calculate_card_amount_for_month` ist seit V1 vollständig **Fragment-aware**
  inkl. aller §4.3-Edge-Cases (FIXED_COST/INCOME: Realität→Anpassung→Plan;
  BUDGET: Plan zählt solange Fragmente ≤ Plan, sonst Realität; Tap-Kombinationen
  §4.3.3 alle kodiert). Frontend ruft die RPC und vertraut dem Output — keine
  Frontend-seitige Re-Implementierung der §4.3-Logik.
- Helper-RPC `get_effective_plan_for_month(p_card_id, p_month)` (additiv, aus
  Sprint 6 vorgezogen in Sprint 5 K1.4): liefert den Monats-Soll-Wert für
  Vergleichs-Logik (Status-Label, „Noch frei"-Berechnung). Returns `0` falls
  Karte inaktiv, sonst `card_monthly_states.adjusted_amount` falls gesetzt,
  sonst `get_planned_amount_for_month(...)`. Frontend nutzt diese als
  Vergleichsbasis statt `cards.planned_amount` (Roh-Plan).

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
10. **Karten-Typ in Sprint-Erwartungs-Tabellen explizit nennen** + §4.3-Sub-
    Tabelle (4.3.1 FIXED_COST / 4.3.2 INCOME / 4.3.3 BUDGET) referenzieren.
    Die Faustregel „Realität gewinnt" gilt nur für FIXED_COST/INCOME. BUDGET-
    Karten zeigen Plan, solange Fragmente ≤ Plan (§4.3.3). Sichtbares Symptom
    „ÜBERSCHRITTEN"-Status = BUDGET-only — Signal zur Typ-Verifikation bei
    Briefing-Erstellung. (LL-12)
11. **PM-Architekten-Verifikations-Reihenfolge bei Frontend↔RPC-Diskrepanzen:**
    Bei vermuteter RPC-Logik-Bug muss der PM die Bug-Lokalisierung beim
    Architekten verifizieren lassen, **bevor** ein RPC-Patch-Auftrag formuliert
    wird. Beobachtetes RPC-Output ist nicht hinreichend für Schuldzuweisung —
    die RPC könnte intern korrekt arbeiten und das Frontend könnte sie falsch
    interpretieren. Sequenz: Diagnose-Sammlung → Architekt-Sanity-Check (mit
    DB-Live-Zugriff) → Patch-Pfad-Entscheidung. (LL-11)
    Gleiches gilt für Frontend↔Spec-Diskrepanzen: PM prüft den Spec-Bezug
    (mit Design-Doku-Referenz), bevor ein Patch-Auftrag formuliert wird.
    Spontane Patches ohne PM-Freigabe bleiben verboten — auch wenn die Spec
    eindeutig scheint. (LL-13)
    12. **Phasen-sequenzielle Multi-Komponenten-Sprints.** Wenn ein Sprint mehrere
    unabhängige Komponenten umfasst (Sprint 7 = V1 BUDGET-Tap + V6 Income-Split-
    Trigger + V2 Cleanup), ist eine sequenzielle Phasen-Struktur mit eigenen
    Commits pro Phase verbindlich. Phase N+1 startet erst nach grünem Smoke +
    Commit von Phase N. Vorteile: Diagnose-Klarheit bei Bug-Befunden (rote Phase
    blockiert nicht die anderen), atomare Reverts via einzelnen Phase-Commit,
    Smoke-Disziplin pro Phase erzwingt schrittweise Verifikation. Anti-Pattern:
    drei Phasen in einem Riesen-Commit zu mischen — bei Bug nicht reversibel.
    (LL-14)
13. **PM-Smoke-Test-Plans gegen Cross-Sprint-Konflikt-Regeln prüfen.** Vor
    Sprint-Briefing-Approval prüft der PM jeden Smoke-Schritt explizit gegen
    alle aktiven §7-Konflikte und Sprint-K-Logiken aus früheren Sprints, um
    keine inhärent unmögliche Erwartung zu spec'n. Sprint-7-K1-Episode: S22
    erwartete Tap-Toggle auf einer Fragment-verlinkten INCOME-Karte → Sprint-
    6-K1-Logik (`manuallyPaid || hasFragment`) verhindert visuellen Wechsel.
    Diagnose-Aufwand wäre vermeidbar gewesen durch Cross-Check beim Briefing-
    Entwurf. Auch: PM-Smoke-Tests müssen die Test-Daten-Eigenschaften
    (insbesondere `card_fragment_links`-Status pro Karte/Monat) explizit
    berücksichtigen — nicht nur den Card-Type. (LL-15)
14. **Doku-Patches durch Claude Code als separate Patch-Datei.** Claude Code
    editiert die Design-Doku und die Schema-Doku NIE selbst (siehe „Was Claude
    Code NIE macht"). Wenn ein Briefing Doku-Patches fordert (AC5-Pattern),
    liefert Claude Code diese ausschließlich als separate Patch-Datei
    `sprints/sprint_NN_doku_patches.md` mit Anker + Patch-Satz pro Stelle. Der
    PM verifiziert die Patches und gibt sie zur Anwendung frei. Etabliert in
    Sprint 8. (LL-16)
15. **`app_config`-Schwellen server-seitig lesen + State-Gating dort.**
    Konfigurierbare Schwellen (Konfidenz, Badge, Auto-Absorb, etc.) werden
    server-seitig aus `app_config` gelesen und das State-Gating dort
    vorgenommen. Client-Components erhalten nur aufgelöste Werte (z. B.
    `suggestedCardName` statt rohem `confidence` + Schwelle). Spec-Defaults
    dürfen nur als Defense-in-Depth-Fallback hartcodiert sein. Hält Regel 5
    (`app_config` als Single-Source-of-Truth) ein und vermeidet Schwellen-Drift
    zwischen DB-Logik und UI-Logik. Etabliert in Sprint 8 P4. (LL-17)

### Datei-Konventionen
- Komponente pro Ordner: `components/<komponente>/index.tsx`,
  `<komponente>.module.css`, `<komponente>.types.ts`
- RPC-Aufrufe immer typisiert über `lib/rpc.ts`. **Wrapper-Konvention:** Jede
  RPC-Funktion akzeptiert einen `SupabaseClient` als ersten Parameter, statt intern
  zwischen `server.ts`/`client.ts` zu wählen. Vorteil: kein versteckter Server-/Client-
  Switch, ein RPC funktioniert überall. **Default ist Throw-on-Error**: Wrapper
  geben bei DB-`null` legitim `null` zurück, werfen aber bei Supabase-Errors
  (Network, RLS, etc.). Schluckende Variante (`null`/`false`/`0` auch bei Errors) nur,
  wenn der Aufrufer „kein Datum" und „Fehler" nicht unterscheiden muss und ein Crash
  UX-schädlich wäre — diese Ausnahme im Wrapper-Kommentar dokumentieren.
  (Bekannte Ausnahme Sprint 4: `isCardActiveInMonth` schluckt — Begründung im
  Wrapper-Kommentar; verhindert dass eine einzelne Karte den gesamten Karten-Render
  blockiert.)
- Keine globalen CSS-Klassen außerhalb `tokens.css` + `globals.css`
- **SVG-Transform-Properties inline erlaubt:** `transform-box: fill-box` und
  `transform-origin: center` dürfen als `style=`-Attribut auf SVG-Elementen
  stehen, da CSS-Module-Spezifität hier inkonsistent wirken kann. Farben und
  alle anderen Properties gehen weiterhin über Tokens / CSS-Modules.
- **Overlays / Kontextmenüs / Tooltips in Clipping-Containern** (Eltern mit
  `overflow-x: auto`, `overflow: hidden`, `overflow-y: scroll`): müssen entweder
  via `position: fixed` (mit `getBoundingClientRect()` zur Positionsbestimmung)
  **oder** via React Portal aus dem Clipping-Container ausgelagert werden — sonst
  werden sie geclipt. **Zusätzlich:** Sichtbarkeits-CSS (Opacity, Visibility,
  Display) NIE an Eltern-Hover-Selektoren koppeln, wenn das Element via
  `useState(isOpen)` gesteuert wird → sonst „Phantom-Sichtbarkeit" (DOM präsent,
  aber Cursor-Position macht es unsichtbar). Diagnose-Pattern: Sprint 4 K2.
  (LL-6)
- **HTML5 Drag&Drop — Event-Delegation:** Drag-Quellen übertragen Identität via
  `dataTransfer.setData("application/x-<typ>-id", id)` mit Custom-MIME-Type
  statt globaler State-Variablen oder Refs. Drop-Targets prüfen den MIME-Type
  via `dataTransfer.types.includes(...)` beim `dragover`, nicht den Source-State.
  Erlaubt mehrere parallele Drag-Quellen ohne Cross-Talk. Drop-Targets MÜSSEN
  `preventDefault()` auf `dragover` aufrufen — sonst feuert `drop` nicht. (LL-9)
- **HTML5 Drag&Drop — Nested-Drag-Flackern:** `dragenter` feuert auch auf
  Child-Elemente innerhalb des Drop-Targets, was Outline-Border flackern lässt.
  Lösung: `useRef`-Counter — increment auf `dragenter`, decrement auf `dragleave`,
  Outline aktiv wenn `counter > 0`, Counter-Reset auf `drop`. (LL-10)
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
| Sprint 4 (Karten) | ~~Sonnet 4.6 + Opus 4.7 (für K2/K3)~~ ✓ erledigt |
| Sprint 5 (Untere Interaktionszone) | ~~Sonnet 4.6~~ ✓ erledigt |
| Sprint 6 (Sparrate-Verifikation) | ~~Opus 4.7 → Sonnet 4.6~~ ✓ erledigt (→ LL-13) |
| Sprint 7 (UI-Komplettierung V1+V6+V2) | ~~Sonnet 4.6~~ ✓ erledigt — Briefing klar spec'd, kein Opus-Eskalations-Bedarf |
| Sprint 8 (CSV-Import / Distiller) | **Opus 4.7** — Konfidenz-Logik, Hash-Determinismus |
| Sprint 9 (Soft-Delete-Pattern) | **Sonnet 4.6** — Routine gegen klare Spec |
| Sprint 10 (Sparraten-Treppe) | **Sonnet 4.6** — UI-Komponente |

**Eskalations-Heuristik:** Wenn Sonnet 4.6 bei einer Korrektur nach einem
erfolglosen Fix-Versuch immer noch nicht alle Symptome löst, direkt auf Opus 4.7
eskalieren statt zu iterieren. Erfahrung aus Sprint 4 K2: diagnostisch unklare
Bugs (insbesondere mit CSS/DOM-Coupling) lohnen den Modell-Switch.

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