# Sprint 7 — UI-Komplettierung (V1 BUDGET-Tap + V6 Income-Split-Trigger + V2 Cleanup)

> **Sprint:** 7
> **Komponenten:** V1 BUDGET-Tap-UI · V6 §10 Income-Split-Popup-Dashboard-Trigger · V2 Sprint-4-`CardsCarousel`-Orphan-Cleanup
> **Branch:** `sprint/07-ui-completion`
> **Modell-Empfehlung:** Claude Sonnet 4.6 (Begründung §0.5)
> **Sprint-Charakter:** Feature-Sprint mit **drei sequenziellen Phasen** und drei separaten Commits (1 chore + 2 feat) plus 1 docs.
> **Status vor Start:** ⏳ **blockiert** auf Architekten-Stufe-2 (Test-Daten-Anreicherung) — siehe §0.2 + Anhang A

---

## 0. Voraussetzungen

### 0.1 Repo-Stand
- `main` enthält Sprints 0–6 grün gemerged
- Sprint-6-Backup-Pointer `sprint/06-sparrate-verification` bleibt erhalten (Backup-Strategie)
- Letzter Sprint-5-Pointer wurde nach Sprint-6-Merge gelöscht — analog Pattern für Sprint 7 (Sprint-6-Pointer wird gelöscht **nach** Sprint-7-Merge, Sprint-7-Pointer bleibt erhalten)

### 0.2 Architekten-Vorarbeit

**Stufe 1 — RPC `toggle_card_manually_paid` (bereits LIVE, 20. Mai 2026):**

| Aspekt | Befund |
|---|---|
| Signatur | `toggle_card_manually_paid(p_card_id uuid, p_month date) returns boolean` |
| Verhalten | Idempotenter Toggle. No-Row → `manually_paid=true`, true → false, false → true. Returns den **neuen** Status. |
| Ownership-Check | `card.user_id = auth.uid()` — RAISES bei foreign card_id |
| Month-Range-Check | RAISES wenn `p_month < first_active_month` oder `> last_active_month` (falls gesetzt) |
| Day-Normalization | `p_month` wird intern auf `date_trunc('month', ...)` gemappt — Frontend darf auch `2026-04-15` schicken, DB normalisiert |
| Past-Month-Policy | **B (vergangene Monate erlaubt)** — kein Frontend-side Past-Block nötig |
| Test-Cases | 7/7 PASS (tc1–tc7, Architekt-Sandbox-Verifikation 20. Mai 2026) |

→ TypeScript-Types müssen vor Sprint-Start neu generiert werden:
```bash
pnpm dlx supabase gen types typescript --project-id nflkobdfdhncrtjncpmq > src/lib/supabase/types.ts
```
(eigener `chore:`-Commit auf Sprint-Branch BEVOR Code-Implementation startet — Sprint-5-Pattern.)

**Stufe 2 — Test-Daten-Anreicherung (PFLICHT vor Sprint-Start):**

Aktueller Test-User-State (§4.6-Setup) deckt nur **eine** BUDGET-Karte ab (Tanken, `manually_paid=true`, Fragmente 180 € bei Plan 200 € — März 2026). Für vollständigen V1-Smoke (Phase 3) brauchen wir zusätzlich:

- Eine BUDGET-Karte **ohne Tap, ohne Fragmente** im Test-Monat — für „Tap-On → Abgeschlossen, X € nicht verbraucht teal mit Balken Plan-%"
- Eine BUDGET-Karte **ohne Tap, mit Fragmenten > Plan** im Test-Monat — für „Überschritten → Tap → Abgeschlossen, X € über Plan rot mit Balken 100% rot"

**Test-Monat ist Mai 2026** (nicht März), um den §4.6-Test-Case in März unverändert zu lassen (Sprint-6-Gate-Schutz). Tanken ist MONTHLY und in Mai aktiv — ohne `card_monthly_states`-Row für Mai → defaultet auf „Laufend ohne Tap" → für Tap-On-Test sofort nutzbar.

Konkretes SQL-Skript siehe **Anhang A**. Architekt-Approval + Run + Verifikations-SELECT pflicht vor Sprint-Start.

### 0.3 §7-Patch-Vormerkung (Design-Doku-Update nach Sprint-7-Approval)

Design-Direktor hat am 21. Mai 2026 entschieden: **BUDGET-Karten haben ab Sprint 7 vier Zustände** statt drei. Neuer Zustand: `Abgeschlossen` (analog FIXED_COST-Bezahlt-Visual, mit BUDGET-spezifischen Modifikationen).

Damit revidiert sich:
- **CLAUDE.md §5** „Bekannte Abweichungen Prototyp ↔ Design-Doku" Eintrag 3 ist teilweise hinfällig — `karten_final_v4.html` zeigt einen „Abgeschlossen"-Zustand mit „X € nicht verbraucht", was bisher als §7-Verstoß markiert war. Der Visual-Hinweis ist jetzt rehabilitiert (Wording wird aber präzisiert, siehe §9.1).
- **Design-Doku §7** Sektion „Budget-Karte — 3 Zustände" wird zu „Budget-Karte — 4 Zustände".

**Doku-Patch passiert NACH Sprint-7-Approval** durch den PM, nicht im Sprint. Sprint 7 implementiert gegen die in §9.1 dieses Briefings autoritativ spezifizierten Visual-Werte.

### 0.4 Read-Modell + Berechnung-Konsistenz

Wichtige Hot-Path-RPCs bleiben unverändert nutzbar:

| RPC | Verhalten |
|---|---|
| `calculate_card_amount_for_month(p_card_id, p_month)` | **Bereits §4.3.3-konform und Fragment-aware** (Sprint 5 Schema-Befund). Liefert für BUDGET mit `manually_paid=true`: `fragment_sum` (Realität), unabhängig ob ≤ oder > Plan. Bei `manually_paid=false`: Plan wenn `fragment_sum ≤ plan`, sonst `fragment_sum`. |
| `get_effective_plan_for_month(p_card_id, p_month)` | Sprint-5-K1.4-Helper. Liefert den Monats-Soll-Wert (Adjustment-aware Plan). |
| `is_card_active_in_month(p_card_id, p_month)` | unverändert |

Frontend ruft diese RPCs und vertraut den Outputs. **Keine Frontend-seitige Re-Berechnung von §4.3.3.**

### 0.5 Modell-Empfehlung

**Claude Sonnet 4.6.** Begründung:
- V2 (Cleanup) ist trivial — eine Datei löschen.
- V6 (Income-Split-Trigger) ist UI-Refactor mit klarem Code-Pattern aus Sprint 1 (`src/components/income-split/index.tsx` existiert und ist funktional).
- V1 (BUDGET-Tap-UI) ist Refactor des Sprint-4-Tap-Pfads + neuer Visual-Zustand — spec'd klar in §9.1, RPC-Signatur bekannt.

Eskalations-Trigger zu Opus 4.7 (CLAUDE.md §9 Eskalations-Heuristik):
- Wenn eine Korrektur-Iteration in Phase 3 (BUDGET-Visual) nach erstem Fix-Versuch nicht alle Symptome löst (CSS/DOM-Coupling-Risiko analog Sprint-4-K2)
- Wenn die `toggleCardTap`-Server-Action-Vereinheitlichung versteckte Regression in FIXED_COST/INCOME-Tap einführt

### 0.6 Was NICHT Sprint-Scope ist

- Keine Schema-Doku v2 → v3 Pflege (Architekten-Parallel-Auftrag, optional)
- Keine destruktiven Karten-Aktionen („Karte löschen", „Letzte Zahlung in Monat X") — Sprint 8 mit Soft-Delete-Pattern
- Keine optimistic UI (Sprint 4 hat 1s-Latenz akzeptiert, bleibt V1-Standard)
- Keine Touch/Swipe/Long-Press (CLAUDE.md §7)
- Kein CSV-Import / Distiller (Sprint 8+)
- Keine Sparraten-Treppe (Sprint 9)
- Keine BUDGET-Tap-Animation jenseits CSS-Transitions (kein neuer Animation-Stack)
- Keine Änderung der `card_monthly_states`-Schreibwege außerhalb der neuen RPC (UPSERT-Pattern für FIXED/INCOME-Tap aus Sprint 4 wird auf RPC vereinheitlicht — siehe §3.4.2; **keine** Beibehaltung dualer Schreibwege)
- Keine eigene Sparrate-Berechnung im Frontend (CLAUDE.md §7 Regel 1)
- Kein Bulk-RPC `get_cards_with_effective_plan_for_month` (V3, post-Sprint-8 Reevaluation)

---

## 1. Pflicht-Lese-Reihenfolge

1. **`CLAUDE.md`** — komplett, insbesondere LL-1 bis LL-13, §7 Arbeitsregeln, §9 Modell-Empfehlungen, §10 Sprint-Übergabe-Log
2. **`antigravity_finance_design_dokument_v3.md`:**
   - **§7 Karten** — alle Zustände, Konflikte 1–6, BUDGET-Spec (mit Vermerk: §7 wird durch dieses Briefing §9.1 für Sprint 7 erweitert um 4. Zustand „Abgeschlossen")
   - **§10 Income / Partner-Split** — Labels, Popup-Felder, Forward-Inheritance, Sonderfälle (Partner unbekannt / 0 €)
   - §4 Sparrate (insbes. §4.3.3 BUDGET-Berechnungslogik + §4.6 Test-Case-Referenz)
   - §3 Tokens
   - §12 UI-Copy (Status-Labels)
3. **`antigravity_finance_schema_summary_v2.md`** §3 + §4 + §5 — `card_monthly_states`-Struktur, Hot-Path-RPCs, Interaktions-Mapping
4. **`architect_handover_v1.md`** — §1 Anbindung, §2.3 RPC-Inventur, §4 Stolperfallen
5. **`sprints/sprint_04_briefing.md` + `sprints/sprint_04_review.md`** — Karten-Komponente, Tap-Pfad-Implementation in `card-interactive.tsx` + `actions.ts`, K2-Lesson (LL-6)
6. **`sprints/sprint_05_briefing.md` + `sprints/sprint_05_review.md`** — Karussell + Sprint-4-Cards-Erweiterung über Wrapper, K1.4 Frontend-Daten-Refactor (drei Daten-Punkte pro Karte: `displayed_amount`, `effective_plan`, `fragment_sum`)
7. **`sprints/sprint_01_briefing.md` + `sprints/sprint_01_review.md`** — Income-Split-Modal-Code, `src/components/income-split/`, DEV-Trigger in `src/app/dashboard-dev-panel.tsx`
8. **`sprints/sprint_06_briefing.md` + `sprints/sprint_06_review.md`** — Sparrate-Verifikations-Kontext, K1 Frontend-Status-Fragment-Fix-Diff als Referenz
9. **HTML-Prototypen** unter `public/prototypes/`:
   - **`karten_final_v4.html`** + `.png` — BUDGET-Abgeschlossen-Visual als visuelle Inspiration; Wording-Abweichung siehe §9.1
   - **`income_split_final.html`** + `.png` — V6-Visual-Referenz
   - `singularity_ring_v3.html` — für Phase 2 Label-Positionierung neben dem Ring

---

## 2. Ziel — drei Phasen, drei Commits

Am Ende des Sprints existieren:

1. **Phase 1 — V2 CardsCarousel-Cleanup** (`chore:`-Commit)
   - Sprint-4-Komponente `src/components/cards/cards-carousel.tsx` (oder analoger Pfad) wird gelöscht, sofern sie nach Sprint 5 nicht mehr referenziert ist. `pnpm build` + `tsc` + `next lint` clean.

2. **Phase 2 — V6 §10 Income-Split-Popup-Dashboard-Trigger** (`feat:`-Commit)
   - Klickbare ICH/PARTNER-Labels neben dem Singularity Ring (Position gemäß §10)
   - Klick öffnet das bestehende `src/components/income-split/index.tsx` Popup mit korrekt vorbefüllten Werten aus DB (latest `income_timeline`-Row für `person`)
   - `isFirstIncomeEntry` ist **immer `false`** im Dashboard-Trigger-Pfad (Onboarding-Pfad bleibt unverändert mit `isFirstIncomeEntry=true`)
   - Sonderfall „PARTNER unbekannt" (keine Row in `income_timeline` für PARTNER): Label sichtbar mit 0 %, Klick öffnet Popup mit leerem Brutto, neue Row wird beim Submit angelegt
   - DEV-Buttons in `dashboard-dev-panel.tsx` bleiben **erhalten** (NODE_ENV-gated, Production-Build elidiert sie ohnehin — kein Aufräum-Pflicht hier; Sunset wenn sie organisch obsolet werden)

3. **Phase 3 — V1 BUDGET-Tap-UI** (`feat:`-Commit)
   - Server Action `toggleCardTap` umgestellt auf RPC `toggle_card_manually_paid`
   - BUDGET-Karten sind ab jetzt **tappable** wie FIXED_COST/INCOME — Click-Catcher gerendert auch für BUDGET
   - Neuer Visual-Zustand `Abgeschlossen` für BUDGET-Karten (Visual-Spec §9.1)
   - Karten-Status-Logik im Frontend erweitert: BUDGET-Status-Bestimmung berücksichtigt `manually_paid` zusätzlich zu `fragment_sum vs. effective_plan`
   - Regressions-Test pflicht: FIXED_COST + INCOME-Tap funktional unverändert

**Phasen-Reihenfolge ist verbindlich.** Jede Phase wird mit eigenem Commit auf demselben Branch abgeschlossen, bevor die nächste startet. Smoke-Test der Phase muss grün sein bevor zur nächsten gewechselt wird.


---

## 3. Implementierungs-Details

### 3.1 Pre-Sprint-Setup

1. `git status` clean prüfen, `main` auf neuestem Stand
2. Sprint-Branch erstellen: `git checkout -b sprint/07-ui-completion`
3. Dieses Briefing nach `sprints/sprint_07_briefing.md` kopieren
4. **`docs: sprint 7 briefing`-Commit** auf Sprint-Branch (Initial-Commit, Sprint-5/6-Pattern)
5. Architekten-Stufe-2 verifizieren: `SELECT name, type, planned_amount FROM cards WHERE user_id = '<test-user>' AND type = 'BUDGET'` zeigt **drei** BUDGET-Karten (Tanken + Hobby + Auswärts Essen). Verifikations-SELECT aus Anhang A grün.
6. TypeScript-Types regenerieren:
   ```bash
   pnpm dlx supabase gen types typescript --project-id nflkobdfdhncrtjncpmq > src/lib/supabase/types.ts
   ```
   `<claude-code-hint>`-Tag bei Bedarf entfernen (CLAUDE.md §8). `tsc --noEmit` clean.
7. **`chore: regenerate supabase types after toggle_card_manually_paid RPC`-Commit** auf Sprint-Branch
8. `pnpm install` + `pnpm dev` startet ohne Errors
9. `pnpm build`, `pnpm tsc --noEmit`, `pnpm next lint` — alle clean (Baseline-Check)

---

### 3.2 Phase 1 — V2 `CardsCarousel`-Orphan-Cleanup

**Hintergrund:** Sprint 5 hat eigenen Karussell-Code in `src/components/interaction-zone/carousel.tsx` gebaut (siehe Sprint-5-Review). Sprint-4-Komponente, die ursprünglich für das Karten-Karussell gedacht war, wird nicht mehr von `page.tsx` referenziert.

**Aufgaben:**

1. Sprint-4-Karussell-Datei lokalisieren. Wahrscheinlich Kandidaten:
   - `src/components/cards/index.tsx` als Karussell-Wrapper (siehe Sprint-4-Review: „`index.tsx` (Karussell-Wrapper)")
   - ODER eine eigene Datei wie `src/components/cards/cards-carousel.tsx`
2. **Vor dem Löschen prüfen:** `rg "from .*components/cards.*" src/` und `rg "import.*Cards" src/` — wenn die Datei noch importiert wird, NICHT löschen. Das ist ein Bug-Indikator, an PM eskalieren statt zu raten.
3. Wenn keine Importe mehr existieren: Datei löschen.
4. `pnpm build`, `tsc --noEmit`, `next lint` — alle clean nach Löschung (kein Type-Bruch).
5. **`chore: remove orphaned sprint-4 cards carousel wrapper`-Commit**

**Akzeptanz:**
- Datei-Diff zeigt nur Löschungen (keine Modifikationen anderer Dateien)
- Sanity-Checks alle clean
- Phase-1-Commit ist der zweite Commit auf dem Branch (nach dem Briefing-Commit aus §3.1)

**Falls Sprint-4-`index.tsx` weiterhin als Card-Render-Wrapper benötigt wird** (Server-Component, die `Card` rendert mit Sortierung) und nur die *Karussell-spezifischen* Teile orphan sind: bitte präzise im Sprint-Review dokumentieren, was gelöscht wurde und was bleibt, und warum. PM kann das nicht aus dem Briefing eindeutig bestimmen — Claude-Code-Diagnose nötig.

---

### 3.3 Phase 2 — V6 §10 Income-Split-Popup-Dashboard-Trigger

**Hintergrund:** Sprint 1 hat das Popup als Komponente unter `src/components/income-split/` gebaut. Trigger war ein DEV-Button in `src/app/dashboard-dev-panel.tsx`, NODE_ENV-gated. §10 Design-Doku fordert: **„Zwei klickbare Labels (ICH / PARTNER) flankieren den Ring."**

#### 3.3.1 Komponenten-Struktur

Neue / modifizierte Dateien (vorgeschlagen — Claude Code darf abweichen, im Review dokumentieren):

```
src/components/income-labels/                    NEU
├── index.tsx                                    Server-Component, lädt Income + Split-Faktor
├── income-label.tsx                             Client, Button + Popup-State
├── income-labels.module.css                     Styling
└── income-labels.types.ts                       Props
```

ODER: Direktes Integrieren in `src/components/dashboard-ring-stage/` (Sprint 2), wenn der Author das übersichtlicher findet — beides akzeptabel. Im Review dokumentieren.

#### 3.3.2 Daten-Loading

Server-Component braucht pro Person (ICH / PARTNER) den **aktuell gültigen** Brutto + Netto für `targetMonth`. Forward-Inheritance-Lookup-Pattern (Sprint 1):

```sql
SELECT person, gross_annual, net_monthly
FROM income_timeline
WHERE user_id = auth.uid()
  AND effective_month <= '<targetMonth>'::date
ORDER BY effective_month DESC
LIMIT 1 PER person
```

In SQL-API: zwei Queries (eine pro `person`), oder ein Query mit `DISTINCT ON (person)`.

**Split-Faktor:** `get_split_factor(user_id, targetMonth)` RPC — bestehend, Sprint 1. Liefert ICH-Anteil als Dezimalzahl (z. B. `0.60` für 60%).

**Sonderfall „PARTNER unbekannt"** (keine Row in `income_timeline` für `person='PARTNER'`):
- Label dennoch sichtbar, Prozentsatz `0 %`
- Klick öffnet Popup mit `person='PARTNER'`, leerem Brutto-Slider (oder min-Wert 20.000 €), neue Row beim Submit
- `get_split_factor` sollte in dem Fall `1.0` (ICH = 100%) zurückgeben — Verhalten ist Sprint-1-bewährt

#### 3.3.3 Label-Visual (§10)

| Eigenschaft | Wert |
|---|---|
| Avatar | `32×32px`, `border-radius: 50%`, `border: 1px solid rgba(255,255,255,.12)` |
| Prozentsatz | `13px`, `font-weight: 500` |
| Name | `9px`, `font-weight: 600`, `letter-spacing: .8px`, uppercase |
| Hover | `border-color: rgba(255,255,255,.3)` |
| Aktiv (Popup offen) | `border-color: rgba(255,255,255,.4)`, `background: rgba(255,255,255,.06)` |

**Positionierung:** Labels flankieren den Ring **links (ICH)** und **rechts (PARTNER)** auf gleicher vertikaler Höhe wie das Ring-Zentrum. Layout via Flex oder absolute Positionierung — Claude Code wählt Pattern. `income_split_final.html` als visuelle Referenz, NICHT als Code-Vorlage (HTML-Prototyp ist illustrativ).

#### 3.3.4 Popup-Integration

Bestehende `src/components/income-split/index.tsx` wiederverwenden. Wichtige Props-Hinweise:

| Prop | Wert im Dashboard-Trigger |
|---|---|
| `isFirstIncomeEntry` | **`false`** (Onboarding bereits abgeschlossen) → Steuerklasse-Sektion versteckt |
| `person` | `"ICH"` oder `"PARTNER"` je nach geklicktem Label |
| `activeMonth` | `targetMonth` aus URL-Param (Sprint 3) |
| `initialGross` | Aus DB-Lookup (s. 3.3.2) — bei PARTNER-unbekannt `undefined` oder Default |
| `initialNet` | Aus DB-Lookup |
| `initialTaxClass` | Aus `profiles.tax_class` (read-only-Anzeige im Header laut §10) |

**Past-Month-Sperre:** Sprint-1-`income-split/index.tsx` hat `isPast()`-Check. Bleibt unverändert. Bei vergangenem `targetMonth` zeigt Popup die gelbe Warnung und disabled Felder.

#### 3.3.5 Akzeptanz Phase 2

- ICH-Label sichtbar links vom Ring mit korrektem `%` aus `get_split_factor`
- PARTNER-Label sichtbar rechts vom Ring (auch wenn PARTNER unbekannt → 0 %)
- Klick auf ICH öffnet Popup vorbefüllt mit ICH-Werten + Steuerklasse versteckt
- Klick auf PARTNER öffnet Popup vorbefüllt mit PARTNER-Werten + Steuerklasse versteckt
- Klick auf PARTNER bei unbekanntem PARTNER öffnet leeres PARTNER-Popup
- Submit schreibt neue Row in `income_timeline` per UPSERT (Sprint-1-Pattern, `onConflict: "user_id,person,effective_month"`)
- Ring + Karten + Sparrate revalidaten nach Submit (Server Action revalidatePath)
- Vergangener `targetMonth` → Popup gesperrt mit gelber Warnung (Sprint-1-Verhalten unverändert)
- Tastatur-Bedienung: Tab/Enter funktional, Escape schließt Popup

**`feat: wire income-split popup to dashboard click trigger (v6)`-Commit**

---

### 3.4 Phase 3 — V1 BUDGET-Tap-UI

**Hintergrund:** Sprint 4 hat den Tap-Pfad für FIXED_COST + INCOME gebaut. BUDGET war in Sprint 4 explizit NICHT tappable (Sprint-4-Briefing §3.9: „Budget-Karten sind nicht tappable in Sprint 4 — kein „Bezahlt"-Zustand in §7. Keine Tap-Button-Komponente rendern."). Phase 3 erweitert das auf BUDGET + vereinheitlicht den Schreibpfad auf die neue RPC.

#### 3.4.1 RPC-Wrapper-Erweiterung

`src/lib/rpc.ts` um eine neue Funktion ergänzen:

```ts
export async function toggleCardManuallyPaid(
  supabase: SupabaseClient,
  args: { cardId: string; month: string }  // month als "YYYY-MM-01"
): Promise<boolean> {
  const { data, error } = await supabase.rpc("toggle_card_manually_paid", {
    p_card_id: args.cardId,
    p_month: args.month,
  })
  if (error) throw error  // Throw-on-Error per LL-2
  return data as boolean
}
```

#### 3.4.2 Server Action `toggleCardTap` Refactor

`src/components/cards/actions.ts` (Sprint 4) hat aktuell:
- SELECT vorhandenen State
- UPSERT `card_monthly_states` mit toggled `manually_paid`
- `revalidatePath`

**Neu:** Direkt RPC-Aufruf, RPC handelt Toggle-Logik atomar:

```ts
"use server"
export async function toggleCardTap(formData: FormData) {
  const cardId = formData.get("cardId") as string
  const month = formData.get("month") as string  // "YYYY-MM-01"
  const supabase = await createServerClient()  // Sprint-Pattern
  await toggleCardManuallyPaid(supabase, { cardId, month })
  revalidatePath("/", "page")
}
```

**Wichtige Konsequenzen:**
- Schreibpfad ist jetzt **einheitlich** über RPC für alle drei Card-Types (FIXED_COST, INCOME, BUDGET).
- RPC handelt Ownership + Month-Range + Day-Normalization intern.
- Bei Foreign card_id oder out-of-range month → RPC raises → Server Action wirft → Next.js zeigt Standard-Error-Boundary. Das ist akzeptabel als V1-Verhalten (kein User-Workflow führt dahin).
- Sprint-4-K3-Logik (`applyAdjustmentForward` cleart `adjusted_amount` für `effective_month`) ist **unberührt** — separater Code-Pfad.

#### 3.4.3 BUDGET-Card-Interactivity aktivieren

`src/components/cards/card-interactive.tsx` (Sprint 4) rendert aktuell den unsichtbaren Tap-Catcher-Button **nicht** für BUDGET. Phase 3 entfernt diesen Conditional-Block.

**Refactor-Punkte:**
- Tap-Button-Render: kein Card-Type-Filter mehr (FIXED_COST / INCOME / **BUDGET** alle drei rendern den Catcher)
- Kontextmenü: BUDGET hat auch `Betrag anpassen` (Sprint 4 hatte das schon, unverändert)
- Visual-Layer (siehe 3.4.4) ist separater Diff

#### 3.4.4 BUDGET-Card-Visual: Abgeschlossen-Zustand

Autoritative Visual-Spec siehe **§9.1** dieses Briefings.

**Daten-Inputs (pro Karte, bereits in Sprint 5 K1.4 geladen):**

| Feld | Quelle |
|---|---|
| `displayed_amount` | `calculate_card_amount_for_month(card_id, month)` |
| `effective_plan` | `get_effective_plan_for_month(card_id, month)` |
| `fragment_sum` | direktes Aggregat aus `card_fragment_links` × `fragments` |
| `manually_paid` | aus `card_monthly_states` SELECT |

**Status-Bestimmung für BUDGET (Frontend-Logik):**

```
if (isPast && !manuallyPaid && fragment_sum == 0)  → Ghost
else if (manuallyPaid)                              → Abgeschlossen
else if (fragment_sum > effective_plan)             → Überschritten
else                                                → Laufend
```

**Sub-Variante Abgeschlossen (Restbudget-Text + Balken-Farbe):**

```
diff = effective_plan - fragment_sum

if (diff > 0)   → "X € nicht verbraucht" in teal, Balken (fragment_sum/effective_plan)*100% in teal
if (diff < 0)   → "X € über Plan" in rot,        Balken 100% in rot
if (diff == 0)  → kein Restbudget-Sub-Text,      Balken 100% in teal
```

`X` ist `Math.abs(diff)`, formatiert mit `formatEuro` (2 Nachkommastellen, Sprint-5-Konvention).

#### 3.4.5 Smoke-Regressions-Pflicht

Phase 3 darf **keine** Regression in FIXED_COST/INCOME-Tap einführen. Smoke-Sequenz §5 testet daher Tap auf allen drei Card-Types, nicht nur BUDGET. Insbesondere:

- Miete (FIXED_COST, GEMEINSAM) Tap in Mai 2026
- Steuerrückzahlung (INCOME, ONCE) in März 2026 — Tap-Test (existiert im Test-User, kann re-getoggled werden)
- Tanken (BUDGET, ICH) in Mai 2026 — Tap-On
- Hobby (BUDGET, ICH) in Mai 2026 — Tap-On (leer)
- Auswärts Essen (BUDGET, ICH) in Mai 2026 — Tap-On bei Überschritten-State

**`feat: enable budget card tap with abgeschlossen visual state (v1)`-Commit**

---

## 4. Akzeptanzkriterien (Selbst-Review-Checkliste)

### Phase 1 — V2 Cleanup

| # | Akzeptanz |
|---|---|
| A1 | Orphan-Datei identifiziert via `rg`-Search (keine Importe von außen) |
| A2 | Datei gelöscht, Diff zeigt nur Löschung |
| A3 | `pnpm build` + `tsc --noEmit` + `next lint` clean nach Löschung |
| A4 | Commit-Message folgt Pattern `chore: remove orphaned sprint-4 cards carousel wrapper` |

### Phase 2 — V6 Income-Split-Popup-Dashboard-Trigger

| # | Akzeptanz |
|---|---|
| A5 | ICH-Label sichtbar links vom Ring, Prozentsatz aus `get_split_factor(user, targetMonth)` |
| A6 | PARTNER-Label sichtbar rechts vom Ring, auch bei unbekanntem PARTNER (Anzeige `0 %`) |
| A7 | Klick auf ICH-Label öffnet Popup vorbefüllt mit aktuellem ICH-Gehalt (latest income_timeline-Row) |
| A8 | Klick auf PARTNER-Label öffnet Popup vorbefüllt mit aktuellem PARTNER-Gehalt |
| A9 | Bei unbekanntem PARTNER: Klick öffnet Popup mit leeren oder Default-Werten, Submit legt neue income_timeline-Row an |
| A10 | `isFirstIncomeEntry={false}` im Dashboard-Trigger-Pfad → Steuerklasse-Sektion ausgeblendet |
| A11 | Submit revalidiert Page → Ring/Karten/Sparrate aktualisieren |
| A12 | UPSERT mit `onConflict: "user_id,person,effective_month"` (Sprint-1-Pattern) — keine Duplikate bei Mehrfach-Submit desselben Monats |
| A13 | Vergangener `targetMonth` → Popup sperrt sich (gelbe Warnung, Felder disabled) — Sprint-1-Verhalten unverändert |
| A14 | Escape-Taste + Backdrop-Klick schließen Popup ohne Submit |
| A15 | Label-Hover + Aktiv-State (Border-Color-Wechsel) gemäß §10 Tabelle |
| A16 | DEV-Buttons in `dashboard-dev-panel.tsx` weiterhin funktional (Production-Build elidiert sie) |

### Phase 3 — V1 BUDGET-Tap-UI

| # | Akzeptanz |
|---|---|
| A17 | RPC-Wrapper `toggleCardManuallyPaid` in `src/lib/rpc.ts` mit Throw-on-Error (LL-2) |
| A18 | Server Action `toggleCardTap` ruft RPC-Wrapper, nicht mehr direktes UPSERT |
| A19 | Tap-Catcher-Button wird für **alle drei** Card-Types gerendert (FIXED_COST + INCOME + BUDGET) — keine Card-Type-Filter mehr |
| A20 | BUDGET-Karte „Hobby" (Mai 2026, kein Tap, keine Fragmente) zeigt Initial-Visual `Laufend`, Balken 0% teal, „Noch 100,00 € frei" |
| A21 | Tap auf „Hobby" → Visual wechselt auf `Abgeschlossen`, Balken 0% teal (`fragment_sum/effective_plan = 0/100 = 0%`), Restbudget „100,00 € nicht verbraucht" teal, Teal-Checkmark-Icon, Card-Background `#0A140E` |
| A22 | BUDGET-Karte „Auswärts Essen" (Mai 2026, kein Tap, Fragmente Σ 120 € bei Plan 80 €) zeigt Initial-Visual `Überschritten`, Balken 100% rot, „40,00 € über Plan" rot |
| A23 | Tap auf „Auswärts Essen" → Visual wechselt auf `Abgeschlossen`, Balken 100% rot (diff < 0), Restbudget „40,00 € über Plan" rot, Teal-Checkmark-Icon, Card-Background `#0A140E` |
| A24 | BUDGET-Karte „Tanken" (Mai 2026, kein Mai-State, keine Mai-Fragmente) zeigt initial `Laufend`, Tap → `Abgeschlossen` „200,00 € nicht verbraucht" teal |
| A25 | Erneuter Tap auf eine ABGESCHLOSSEN-Karte → Visual zurück zu Laufend / Überschritten je nach `fragment_sum vs. effective_plan` |
| A26 | FIXED_COST-Tap-Regression: Miete (Mai 2026) Tap → Bezahlt, erneuter Tap → Offen (kein Bruch durch RPC-Refactor) |
| A27 | INCOME-Tap-Regression: Steuerrückzahlung (März 2026, bereits Tap=true) Tap → Erwartet, erneuter Tap → Erhalten |
| A28 | Past-Month-Tap (z. B. März 2026 mit Mai als Heute): Tap auf Tanken-Karte (BUDGET) funktional, kein Frontend-Block (Past-Month-Policy B) |
| A29 | Ring + Sparrate revalidaten nach Tap (Server Action revalidatePath) |
| A30 | Sub-Daten pro Karte aus Sprint 5 K1.4 (`displayed_amount`, `effective_plan`, `fragment_sum`) werden für Visual-Bestimmung genutzt — keine Frontend-Re-Berechnung von §4.3.3 |

---

## 5. Smoke-Test-Sequenz

Browser-Smoke nach jeder Phase. Test-User unverändert, mit Stufe-2-Test-Daten (Anhang A applied).

### Phase 1 Smoke

| # | Aktion | Erwartung |
|---|---|---|
| S1 | `pnpm build` + `tsc` + `lint` nach Cleanup | Alle clean |
| S2 | `/?month=2026-05` öffnen | Dashboard rendert unverändert, alle Karten sichtbar |

### Phase 2 Smoke

| # | Aktion | Erwartung |
|---|---|---|
| S3 | `/?month=2026-05` | Ring + ICH-Label (60 %) + PARTNER-Label (40 %) sichtbar |
| S4 | Klick auf ICH-Label | Popup öffnet, Brutto-Slider auf 60.000, Netto vorbefüllt 3.100 €, Steuerklasse-Sektion **nicht sichtbar** |
| S5 | Slider auf 80.000 ziehen, Submit | Popup schließt, Ring revalidiert, neue Sparrate sichtbar (höher), Split-Faktor neu berechnet |
| S6 | DB-Check: `SELECT * FROM income_timeline WHERE user_id = '<test-user>' AND person = 'ICH' ORDER BY effective_month DESC LIMIT 2` | 2 Rows: neue Mai-Row (80.000 / neues Netto), alte Januar-Row (60.000 / 3.100) — beide bleiben, UPSERT auf eigenem effective_month |
| S7 | Klick auf PARTNER-Label | Popup öffnet, Brutto-Slider auf 40.000, Netto vorbefüllt 2.200 |
| S8 | Escape-Taste | Popup schließt ohne Submit, DB unverändert |
| S9 | Backdrop-Klick außerhalb Popup | Popup schließt ohne Submit |
| S10 | Navigation zu `/?month=2025-12` (Past-Month) + Klick auf ICH-Label | Popup öffnet, gelbe Warnung sichtbar, alle Felder disabled, Submit-Button disabled |
| S11 | (Optional) DEV-Buttons in `dashboard-dev-panel.tsx` testen | Funktional unverändert, Production-Build elidiert sie (Bundle-Grep) |

### Phase 3 Smoke

| # | Aktion | Erwartung |
|---|---|---|
| S12 | `/?month=2026-05` öffnen | Drei BUDGET-Karten sichtbar in Karussell (Tanken, Hobby, Auswärts Essen, alphabetisch nach FIXED+INCOME sortiert) |
| S13 | Hobby-Karte Initial-Render | Visual `Laufend`, Balken 0%, „Noch 100,00 € frei" teal, Background `#160D0D` |
| S14 | Tap auf Hobby | Wechsel auf `Abgeschlossen`, Balken 0% teal, „100,00 € nicht verbraucht" teal, Teal-Checkmark, Background `#0A140E` |
| S15 | DB-Check: `SELECT manually_paid FROM card_monthly_states WHERE card_id = '<hobby-id>' AND month = '2026-05-01'` | 1 Row, `manually_paid = true` |
| S16 | Erneuter Tap auf Hobby | Zurück zu `Laufend`, „Noch 100,00 € frei" |
| S17 | Auswärts Essen Initial-Render | Visual `Überschritten`, Balken 100% rot, „40,00 € über Plan" rot, Background `#160A08` |
| S18 | Tap auf Auswärts Essen | Wechsel auf `Abgeschlossen`, Balken 100% rot, „40,00 € über Plan" rot, **Teal-Checkmark** (nicht roter Indikator!), Background `#0A140E` |
| S19 | Tap auf Tanken (Mai, kein State) | Wechsel auf `Abgeschlossen`, Balken 0% teal, „200,00 € nicht verbraucht" teal |
| S20 | Regression-Test: Tap auf Miete (FIXED_COST, Mai) | Wechsel auf `Bezahlt`, Teal-Checkmark, Background `#0A140E` (Sprint-4-Visual unverändert) |
| S21 | Erneuter Tap auf Miete | Zurück zu `Offen`, rot |
| S22 | Navigation zu März 2026 (`/?month=2026-03`), Tap auf Steuerrückzahlung (INCOME, bereits `manually_paid=true`) | Wechsel auf `Erwartet` (Tap toggelt zu false) |
| S23 | Erneuter Tap | Zurück zu `Erhalten` |
| S24 | Navigation zurück zu Mai 2026, Sparrate-Ring beobachten | Sparrate hat sich durch die Phase-3-Taps geändert (mehrere Karten getoggled — Wert ändert sich konsistent, keine NULL-Werte) |
| S25 | Past-Month-Tap-Test: Navigation zu März 2026, Tap auf Tanken (March-State `manually_paid=true`) | Wechsel auf nicht-getappt (toggle), funktional (Policy B) |
| S26 | Erneuter Tap auf Tanken in März | Zurück zu Tap=true, §4.6-Sparrate-Wert verifizierbar via SQL `calculate_sparrate_for_month(<user>, '2026-03-01')` = `2910.01` |
| S27 | Bundle-Grep: `rg "touchstart\|swipe\|longpress" .next/static/chunks/app/` | 0 Treffer (LL-4-Pattern) |
| S28 | Production-Build mit `pnpm build && pnpm start`, Visual-Check | DEV-Buttons aus `dashboard-dev-panel.tsx` nicht sichtbar |

---

## 6. Sprint-Output-Format

Im Sprint-Review `sprints/sprint_07_briefing.md` → `sprints/sprint_07_review.md`:

1. **Code-Diff** (`git log --stat` der 3 Sprint-Commits + chore-types-Commit + Briefing-Commit + Review-Commit)
2. **Sanity-Check-Output** pro Phase: `pnpm build`, `tsc --noEmit`, `next lint` — alle clean
3. **Architektur-Entscheidungen** (E1, E2, …): Bewusste Wahlen, die im Briefing nicht zu 100% spezifiziert waren (z. B. Income-Labels eigene Komponente vs. Integration in dashboard-ring-stage)
4. **Selbst-Review-Liste**: A1–A30 abhaken (§4)
5. **Smoke-Test-Ergebnisse**: Tabelle S1–S28 mit ✓/✗ + Bemerkung (§5)
6. **DB-Verifikations-SQL** für S6 (income_timeline UPSERT), S15 (manually_paid Hobby), S26 (Sparrate March 2.910,01 € unverändert)
7. **Bundle-Grep-Output** (`chunks/app/`)
8. **Production-Build-Check**: Bundle-Grep für DEV-Buttons-Strings (0 Treffer in `chunks/app/`)
9. **§4.6-Regressions-Check**: `SELECT calculate_sparrate_for_month('<test-user>', '2026-03-01')` muss weiterhin `2910.01` liefern (Anti-Drift-Anchor)
10. **Offene Fragen an PM**
11. **Vorschläge zur CLAUDE.md-Aktualisierung** (als Vorschlag, nicht Ausführung): Sprint 7 auf 🟢, ggf. LL-Update für RPC-vereinheitlichten Tap-Pfad, §7-Karten-Patch-Reminder

**Commit-Reihenfolge (verbindlich):**

1. `docs: sprint 7 briefing` (Initial-Commit Sprint-Branch — Schritt 3.1.4)
2. `chore: regenerate supabase types after toggle_card_manually_paid RPC` (3.1.7)
3. `chore: remove orphaned sprint-4 cards carousel wrapper` (Phase 1)
4. `feat: wire income-split popup to dashboard click trigger (v6)` (Phase 2)
5. `feat: enable budget card tap with abgeschlossen visual state (v1)` (Phase 3)
6. Sprint-Review-Datei schreiben → `docs: sprint 7 review`
7. Push aller Commits
8. Am Session-Ende: `git status` clean, keine `??` oder `M`

Bei Korrekturen pro Phase: `fix:`-Commit + `docs:`-Append.

---

## 7. Anti-Drift-Liste

| # | Regel | Begründung |
|---|---|---|
| AD1 | **Keine eigene Sparrate- oder Card-Amount-Berechnung im Frontend.** Alle Werte aus RPCs. | CLAUDE.md §7 Regel 1 |
| AD2 | **Schreibpfad einheitlich über RPC.** Nach Phase 3 ist `toggleCardTap` der einzige Schreibweg auf `manually_paid` — kein duales Pattern. | DRY + Architekt-RPC-Validation |
| AD3 | **BUDGET-Status-Bestimmung wie spec'd in §3.4.4.** `manually_paid` hat Vorrang über `fragment_sum vs. effective_plan` (außer im Ghost-Fall). | §9.1 + DD-Klärung 21.05.2026 |
| AD4 | **Teal-Checkmark auch bei „X € über Plan" rot.** Beim ABGESCHLOSSEN-State mit `diff < 0` ist das Icon teal, der Sub-Text rot. Visuell „Konflikt" aber semantisch korrekt: User hat die Überschreitung akzeptiert. | DD-Klärung D3 + §9.1 |
| AD5 | **`isFirstIncomeEntry={false}` im Dashboard-Trigger.** Onboarding-Pfad bleibt unverändert mit `isFirstIncomeEntry={true}` — kein Cross-Talk. | §10 + Sprint-1-Logik |
| AD6 | **Past-Month-Sperre im Income-Split-Popup bleibt.** §10 ist explizit: vergangene Monate gesperrt. Past-Month-Policy B des Tap-RPC ändert das NICHT für Income-Split (unterschiedliche Komponenten, unterschiedliche Policies). | §10 + Architekt-RPC-Policy isoliert |
| AD7 | **`effective_month` und `month` immer als String** (`YYYY-MM-01`) — niemals via `new Date()`. | CLAUDE.md §7 Regel 9 |
| AD8 | **Throw-on-Error in `toggleCardManuallyPaid`-Wrapper.** | LL-2 |
| AD9 | **Keine Touch/Swipe/Long-Press.** | CLAUDE.md §7 |
| AD10 | **Keine destruktiven Aktionen.** Kein Karten-Löschen, keine Soft-Delete-Versuche. | Sprint 8 |
| AD11 | **Sprint-4-Tap-Pfad-Regression vermeiden:** Smoke S20–S23 müssen grün sein. | §4.6-Test-Case-Anchor |
| AD12 | **§4.6-Anchor unverändert:** Sparrate-Berechnung für März 2026 muss weiterhin 2.910,01 € liefern. | Sprint-6-Gate-Schutz |
| AD13 | **Income-Labels-Position links/rechts vom Ring.** Nicht oben/unten — §10 ist explizit „flankieren". | §10 |
| AD14 | **DEV-Buttons in `dashboard-dev-panel.tsx` werden NICHT entfernt.** Bleiben NODE_ENV-gated, Production-Build elidiert sie ohnehin. | Refactor-Risiko minimieren, V6 ist isoliert |
| AD15 | **Forward-Inheritance-Schreibweg über UPSERT `onConflict: "user_id,person,effective_month"`.** | CLAUDE.md §7 Regel 7 + Sprint-1-Pattern |
| AD16 | **Karten-Komponente `src/components/cards/`-Internals bleiben minimal-invasiv geändert.** Nur `card-interactive.tsx` (Tap-Catcher für BUDGET) + Card-Visual-Layer (Abgeschlossen-State). Keine API-Refactors. | Stabilität, Sprint-5-Wrapper-Pattern |
| AD17 | **Phase-Sequenz strikt sequenziell:** Phase N+1 startet erst nach grünem Smoke + Commit von Phase N. | Diagnose-Klarheit bei Bug-Befunden |

---

## 8. Stolperfallen

| # | Hinweis | Mitigation |
|---|---|---|
| F1 | **Sprint-4-`index.tsx` als Karten-Karussell-Wrapper:** Sprint 4 hat `src/components/cards/index.tsx` (siehe Sprint-4-Review). Es ist nicht zu 100% klar ob das der V2-Orphan ist oder weiterhin als Card-Render-Wrapper für Sprint 5 verwendet wird. Vor Löschung **`rg`-Search auf `from .*cards["']` UND `from .*cards/index`** — wenn referenziert, NICHT löschen, im Sprint-Review als „Phase 1 no-op" dokumentieren. | §3.2 Akzeptanz-Hinweis |
| F2 | **`get_split_factor` bei unbekanntem PARTNER:** Sprint-1-Verhalten testen — vermutlich liefert die RPC `1.0` (ICH = 100%). Falls die RPC `NULL` liefert, im Frontend mit `?? 1.0` defensiven Default. | Sprint-1-Code prüfen |
| F3 | **Income-Label-Position vs. Ring-Bounding-Box:** Ring ist SVG mit fixer Größe (Sprint-2-`R=98`). Labels müssen außerhalb des SVG positioniert werden, sonst Clipping. Layout-Container ist `dashboard-ring-stage`. | Layout via Flexbox in `dashboard-ring-stage` ODER absolute Positionierung relativ zum Ring-Container |
| F4 | **`tsc`-Bruch nach types-Regeneration:** `<claude-code-hint>`-Tag am Datei-Ende entfernen. | CLAUDE.md §8 |
| F5 | **Tap-Catcher-Button für BUDGET kollidiert mit Drop-Target-Wrapper aus Sprint 5:** BUDGET-Karten sind sowohl Tap-Ziel als auch Drop-Target (Fragmente). Tap-Event vs. Drop-Event-Reihenfolge im DOM checken. | Tap-Catcher als `<button>` mit `pointer-events: auto` + Drop-Outline am Wrapper darunter via `pointer-events: none` wenn nicht drag-aktiv. ODER explizite `e.stopPropagation()` im Tap-Handler — aber das blockiert nicht Drag. Test in S12+. |
| F6 | **`fragment_sum` direkt aus DB aggregieren:** Sprint 5 K1.4 hat das pro Karte parallel gemacht. Phase 3 nutzt denselben Aggregat-Pfad — kein neuer Query. | Sprint-5-Code-Pattern wiederverwenden |
| F7 | **Balken-Rendering bei ABGESCHLOSSEN + `diff == 0`:** Edge-Case. Spec sagt: kein Sub-Text, Balken 100% teal. Test mit synthetischem Setup (z. B. via DB-Edit, oder akzeptieren als V1-Edge-Case ohne expliziten Test). | Akzeptiert als „kein expliziter Smoke-Schritt" — im Code aber spec'd |
| F8 | **Past-Month-Tap-Race-Condition:** Wenn User in einem Past-Month tappt und gleichzeitig zur aktuellen Monatsansicht navigiert (Soft-Navigation), kann der `revalidatePath` mit dem alten Monat kollidieren. | Sprint-3-LL-5-Pattern: Server Action revalidiert `/`, Next.js handelt das. Kein Optimistic-State. |
| F9 | **`income-split/index.tsx` Past-Month-Sperre:** Sprint-1-`isPast()` nutzt vermutlich `new Date()` — pflegen wenn nötig auf String-basiertes Pattern (Sprint-3-`lib/months.ts`). Falls funktional in Sprint 1, NICHT refactoren. | Stabilität, nur lesen |
| F10 | **Karussell-Sortierung mit drei BUDGET-Karten:** Bisher 1 BUDGET (Tanken), jetzt 3. Sprint-4-Sortierung ist FIXED → INCOME → BUDGET, dann `localeCompare("de-DE")`. Erwartet alphabetisch: Auswärts Essen → Hobby → Tanken. | Sprint-4-`page.tsx`-Sortier-Code unverändert; Smoke verifiziert Reihenfolge |
| F11 | **Tap auf Tanken (BUDGET) in März 2026 mit existierendem `manually_paid=true`:** Toggle macht `false`. Sparrate-Ring zeigt neuen Wert (Tanken zählt jetzt mit Plan 200 € statt Realität 180 € → Sparrate ≠ 2.910,01 €). Erneut tappen zurück auf true → §4.6 wiederhergestellt. | S25/S26 |
| F12 | **`income-split/index.tsx` Trigger-Aufruf von zwei Stellen** (DEV-Buttons + neue Income-Labels): zwei parallel rendernde Popups möglich? | `useState(isOpen)` pro Trigger separat → zwei Popups gleichzeitig theoretisch möglich, aber visuell + UX praktisch egal (V1). Falls Bug, im Review dokumentieren. |

---

## 9. Wichtige Hintergrund-Kontexte

### 9.1 §7 BUDGET-Karte — Visual-Spec für Sprint 7 (autoritativ)

Diese Sektion ersetzt für Sprint 7 die Design-Doku §7 „Budget-Karte — 3 Zustände". Post-Sprint-Approval wird die Design-Doku entsprechend gepatcht.

**Budget-Karte hat ab Sprint 7 vier Zustände.** Zusätzlich zu den Fixkosten-Eigenschaften: Fortschrittsbalken (`3px`) an Unterkante + Restbudget-Anzeige + Padding-Bottom `18px`. Budget-Karten sind **immer** ICH (DB-Constraint).

**Laufend (unverändert zu §7 v3):**
- Background: `#160D0D` · Border: `rgba(255,69,58,.18)`
- Kartenname + Betrag: `rgba(255,255,255,.45)`
- Status-Label: `Laufend` · Restbudget: `Noch X € frei` in `rgba(62,207,175,.40)`
- Balken: `rgba(62,207,175,.45)` · Breite = `(fragment_sum / effective_plan) * 100%`

**Überschritten (unverändert zu §7 v3):**
- Background: `#160A08` · Border: `rgba(255,69,58,.35)`
- Kartenname: `#ffffff` · Betrag: `#FF453A`
- Status-Label: `Überschritten` · Restbudget: `X € über Plan` in `rgba(255,69,58,.65)` *(Note: Sprint 6 K1 hatte „−X € über Plan" — Sprint 7 vereinheitlicht ohne Minuszeichen gemäß DD-D2-Klärung; Bestands-Code anpassen!)*
- Balken: `#FF453A` · Breite = 100%

**Abgeschlossen (NEU in Sprint 7):**
- Background: `#0A140E` (analog FIXED_COST-Bezahlt)
- Border: `rgba(62,207,175,.22)` (analog FIXED_COST-Bezahlt)
- Kartenname + Betrag: `#ffffff`
- Status-Label: `Abgeschlossen` in Teal `rgba(62,207,175,.55)`
- Icon: Teal-Checkmark `rgba(62,207,175,.85)` auf `rgba(62,207,175,.1)` bg, Border `rgba(62,207,175,.28)` (analog FIXED_COST-Bezahlt)
- **Balken bleibt sichtbar.** Farbe + Breite je nach Sub-Variante:
  - `fragment_sum < effective_plan`: Balken teal `rgba(62,207,175,.45)`, Breite = `(fragment_sum / effective_plan) * 100%`
  - `fragment_sum > effective_plan`: Balken rot `#FF453A`, Breite 100%
  - `fragment_sum == effective_plan`: Balken teal, Breite 100%
- **Restbudget-Text** (formatiert mit `formatEuro` = 2 Nachkommastellen):
  - `diff = effective_plan - fragment_sum`
  - `diff > 0` → `X € nicht verbraucht` in teal `rgba(62,207,175,.55)`, X = `diff`
  - `diff < 0` → `X € über Plan` in rot `rgba(255,69,58,.65)`, X = `Math.abs(diff)`
  - `diff == 0` → kein Sub-Text (nur Status-Label sichtbar)

**Ghost (unverändert):** Identisch zu Fixkosten-Ghost.

**Interaktions-Trigger Tap:**
- Tap auf Laufend → Abgeschlossen
- Tap auf Überschritten → Abgeschlossen (Icon teal, Balken bleibt rot, Sub-Text bleibt rot)
- Tap auf Abgeschlossen → zurück zu Laufend / Überschritten (je nach `fragment_sum vs. effective_plan`)
- Tap auf Ghost: Sprint-4-Verhalten unverändert (`isFuture` rendert keinen Tap-Catcher — bleibt so)

### 9.2 §4.3.3-Recap (Berechnung BUDGET mit Tap)

| `manually_paid` | `fragment_sum` vs. `plan` | Anzeige-Betrag (für Sparrate) |
|---|---|---|
| false | `≤ plan` | `plan` (Plan zählt) |
| false | `> plan` | `fragment_sum` (Realität zählt) |
| true | `≤ plan` | `fragment_sum` (Realität zählt, inkl. 0) |
| true | `> plan` | `fragment_sum` (Realität zählt) |
| true | `= 0` (kein Fragment) | `0` (User hat „nicht gebraucht" signalisiert) |

`calculate_card_amount_for_month` ist bereits konform. Frontend ruft und vertraut.

### 9.3 Modell-Empfehlung-Begründung

CLAUDE.md §9 listet Sprint 7 ursprünglich als „CSV-Import / Distiller" mit Opus 4.7. Sprint-7-Scope wurde im PM-Handover Sprint 6 → 7 (20.05.2026) umdefiniert auf „UI-Komplettierung" (V1 + V6 + V2). Damit ist Sonnet 4.6 ausreichend:

- V2 ist Datei-Löschung
- V6 ist Re-Verkabelung von Sprint-1-Komponente
- V1 ist Refactor + neuer Visual-Zustand, alles klar spec'd

CLAUDE.md §9 wird im Sprint-7-Review-Vorschlag entsprechend gepatcht: Sprint 7 (UI-Komplettierung) = Sonnet 4.6; CSV-Import / Distiller verschoben auf Sprint 8 = Opus 4.7.

---

## 10. Lesson Learned (Vorschlag für CLAUDE.md im Review)

**LL-14 (Vorschlag):** *Phasen-sequenzielle Multi-Komponenten-Sprints.* Wenn ein Sprint mehrere unabhängige Komponenten umfasst (Sprint 7 = V1 + V6 + V2), ist eine sequenzielle Phasen-Struktur mit eigenen Commits pro Phase sauberer als parallele Implementation. Vorteile:
- Diagnose-Klarheit bei Bug-Befunden: rote Phase blockiert nicht die anderen
- Atomare Reverts via einzelnen Phase-Commit, ohne den Sprint-Branch komplett zu verlieren
- Smoke-Disziplin pro Phase erzwingt schrittweise Verifikation

Anti-Pattern: drei Phasen in einem Riesen-Commit zu mischen — bei Bug nicht reversibel ohne den ganzen Sprint zu verlieren.

---

## 11. PM-Übergabe-Notiz

**Blockierung bis Architekten-Stufe-2:** Sprint 7 darf NICHT starten, bevor das Anhang-A-SQL vom Architekten approved + auf der Live-DB ausgeführt wurde. Verifikations-SELECT in §3.1.5 grün.

Sobald Stufe 2 grün und `pnpm dlx supabase gen types typescript` clean typed (insbesondere `toggle_card_manually_paid` in `Database["public"]["Functions"]`) → Voraussetzungen erfüllt, Sprint 7 kann starten.

**Phase-Sequenz:** strikt 1 → 2 → 3. Jede Phase eigener Commit. Bei rotem Smoke einer Phase: Diagnose-Sammlung → PM-Eskalation, nicht weiter zur nächsten Phase.

Bei Unklarheit zur §10-Spec, zur §9.1-Visual-Logik oder zur RPC-Wrapper-Konvention: Frage im Sprint-Output an PM eskalieren, nicht raten.

**Modell-Empfehlung Sonnet 4.6.** Eskalation zu Opus 4.7 wahrscheinlich bei (a) CSS/DOM-Coupling-Verhalten in Phase 3 (Visual-Layer-Konflikt mit Sprint-5-Drop-Wrapper) oder (b) Sprint-1-Income-Split-Komponenten-Refactor-Regression.

---

## Anhang A — SQL-Skript für Architekt-Stufe-2 (Test-Daten-Anreicherung)

**Adressiert an:** Architekten-Chat (Pre-Sprint-7, Stufe 2)
**Test-User:** `179cd2c1-bbc2-4fd0-954b-8735eb90f370`
**Test-Monat:** Mai 2026 (`2026-05-01`)
**Ziel:** Zwei zusätzliche BUDGET-Karten + 2 Fragmente + 2 Links für V1-Smoke (Phase 3)

**Spec (Architekt nutzt eigene Sandbox / RPC-Pattern für atomare INSERTs):**

| Karte | type | attribution | frequency | first_active | last_active | planned_amount | Test-Pfad |
|---|---|---|---|---|---|---|---|
| `Hobby` | BUDGET | ICH | MONTHLY | `2026-05-01` | NULL | `100.00` | Tap-On bei leer → „100 € nicht verbraucht" teal |
| `Auswärts Essen` | BUDGET | ICH | MONTHLY | `2026-05-01` | NULL | `80.00` | Überschritten → Tap → „40 € über Plan" rot |

**Fragmente (nur für `Auswärts Essen` zu linken):**

| description | amount | transaction_date | linked_card | link_month |
|---|---|---|---|---|
| `Lieferando` | `-70.00` | `2026-05-10` | Auswärts Essen | `2026-05-01` |
| `Restaurant Da Pino` | `-50.00` | `2026-05-15` | Auswärts Essen | `2026-05-01` |

**`Hobby`** bekommt keine Fragmente und keinen `card_monthly_states`-Eintrag — defaults sind ausreichend.

**Constraints/Hinweise:**
- `cards_assert_initial_plan` ist DEFERRED → Card+Plan-Insert pro Karte atomar via `create_card_direct` RPC (Sprint 5) ODER innerhalb einer Transaktion mit `SET CONSTRAINTS ALL DEFERRED`.
- Fragment-Hash gemäß Sprint-5-Pattern (z. B. `encode(sha256(...), 'hex')` auf `description|date|amount`-Konkat oder Architekten-bewährtes Pattern).
- `card_fragment_links.origin = 'MANUAL_DROP'`.
- `card_fragment_links.month = '2026-05-01'` (semantisches Link-Month, nicht `transaction_date`).
- Idempotenz: Hash-Constraint auf `fragments` verhindert doppeltes Anlegen — bei erneutem Run kein Reset nötig.

**Verifikations-SELECT (PM + Claude Code führen beim Sprint-Start aus):**

```sql
SELECT
  c.name,
  c.type,
  c.attribution,
  c.frequency,
  c.first_active_month,
  c.planned_amount AS plan_initial,
  get_effective_plan_for_month(c.id, '2026-05-01') AS effective_plan_may,
  calculate_card_amount_for_month(c.id, '2026-05-01') AS displayed_amount_may,
  COALESCE((
    SELECT SUM(ABS(f.amount))
    FROM card_fragment_links cfl
    JOIN fragments f ON f.id = cfl.fragment_id
    WHERE cfl.card_id = c.id AND cfl.month = '2026-05-01'
  ), 0) AS fragment_sum_may,
  EXISTS(
    SELECT 1 FROM card_monthly_states cms
    WHERE cms.card_id = c.id AND cms.month = '2026-05-01'
  ) AS has_state_may
FROM cards c
WHERE c.user_id = '179cd2c1-bbc2-4fd0-954b-8735eb90f370'
  AND c.type = 'BUDGET'
ORDER BY c.name;
```

**Erwartetes Ergebnis (3 Rows):**

| name | plan_initial | effective_plan_may | displayed_amount_may | fragment_sum_may | has_state_may |
|---|---|---|---|---|---|
| Auswärts Essen | 80.00 | 80.00 | 120.00 (Realität, fragments > plan) | 120.00 | false |
| Hobby | 100.00 | 100.00 | 100.00 (Plan, kein State, keine Fragmente) | 0.00 | false |
| Tanken | 200.00 | 200.00 | 200.00 (Plan, kein Mai-State, keine Mai-Fragmente) | 0.00 | false |

**Zusatz-Check §4.6-Anker (Sprint-6-Gate bleibt grün):**
```sql
SELECT calculate_sparrate_for_month('179cd2c1-bbc2-4fd0-954b-8735eb90f370', '2026-03-01');
-- Erwartet: 2910.01 (UNVERÄNDERT — die neuen Mai-Karten dürfen März nicht beeinflussen)
```

---

*Sprint 7 Briefing | Antigravity Finance 1.0 | 21. Mai 2026*
