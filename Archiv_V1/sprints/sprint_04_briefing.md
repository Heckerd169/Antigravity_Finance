# Sprint 4 — Karten (Render + Tap + „Betrag anpassen")

> **Sprint-Nummer:** 4
> **Komponente:** Karten — Fixkosten, Einnahmen, Budget (§7 der Design-Doku)
> **Dauer-Schätzung:** 1–2 Sessions, ~2–3 Stunden Implementierung
> **Modell-Empfehlung:** Sonnet 4.6 (Routine gegen klare Spec, CLAUDE.md §9)
> **Branch:** `sprint/04-cards`
> **Datum erstellt:** 16. Mai 2026
> **Voraussetzung:** Sprint 3 ist 🟢 (Approved 14. Mai 2026); RPC-Sanity-Check durch Architekt bestätigt (alle 4 Karten-Hot-Path-RPCs live, keine Migration nötig); Test-Daten in DB angelegt (7 Karten + 3 Monthly States + 1 Fragment-Link)

---

## 0. Pflicht-Lese-Reihenfolge für Claude Code

Beim Start dieser Session lese in dieser Reihenfolge:

1. `CLAUDE.md` (Repo-Root) — insbesondere §4 (Sprint-Status), §6 (Schema-Referenz), §7 (Arbeitsregeln), §10 Sprint-2/3-Einträge (LL-1 bis LL-5)
2. `antigravity_finance_design_dokument_v3.md` — insbesondere **§7 Karten** (Kernkapitel mit allen Zuständen + Kontextmenü), **§3 Tokens** (Farb-/Typo-Referenz), **§4.1–4.3** (Anzeige-Betrag-Logik pro Karten-Typ), **§2.5 Modell 1** (Karte als Template + Pro-Monat-State), **§2.3 Modell α** (Vergangenheits-Behandlung), **§12.3 UI-Copy** (alle Strings)
3. `antigravity_finance_schema_summary_v2.md` — §3 (Datenbasis), §4 Hot-Path-RPCs (4 neue Wrapper in Sprint 4), §5 Interaktions-Mapping (UPSERT-Patterns für Tap + Adjustment)
4. Diese Datei (`sprints/sprint_04_briefing.md`)
5. **Referenz-Prototypen** (visuelles Soll, `public/prototypes/`):
   - `karten_final_v4.html` + `karten_final_v4.png` — Haupt-Referenz
   - `einnahmen_karte_alle_zustaende.html` + `.png` — Einnahmen-Vertiefung
   - `budget_karte_fragment_drop.html` + `.png` — Budget-Vertiefung (Drop-Mechanik ist Sprint 7, aber Visual-Spec der Karte ist Sprint 4)

> ⚠️ **Stolperfallen Prototyp:** Die HTML-Prototypen enthalten Elemente, die **nicht** ins finale Produkt gehören:
> 1. **Budget mit „Gemeinsam"-Attribution** (`karten_final_v4.html` Zeile 163, Karte „Essen"): Design-Doku §7 ist explizit — *„Budget-Karten sind immer Karte allein (ICH) — niemals gemeinsam."* Datenbankseitig durch Constraint ausgeschlossen. Im Code kommt diese Kombination nie vor.
> 2. **Budget-Zustand „Abgeschlossen"** mit „X € nicht verbraucht" (`karten_final_v4.html` Zeile 174): Design-Doku §7 spezifiziert nur 3 Budget-Zustände: Laufend, Überschritten, Ghost. **Kein** „Abgeschlossen". Visual nicht implementieren.
> 3. **Inline-`onclick`-JS-Handler** im Prototyp: V1-Implementation nutzt React + Server Actions, keine direkten Inline-Handler.
> 4. **Tap-Hint-Tooltips** (`Tap = Bezahlt`-Subtitel): rein illustrativ für den Prototyp. UI-Copy §12.3 enthält keine solchen Hints — weglassen.

---

## 1. Ziel

Am Ende dieses Sprints existieren vier Dinge:

1. **Funktionierende Karten-Komponente** unter `src/components/cards/`, vollständig gemäß Design-Doku §7:
   - Fixkosten-Karte mit 3 Zuständen (Offen / Bezahlt / Ghost)
   - Einnahmen-Karte mit 3 Zuständen (Erwartet / Erhalten / Ghost — gespiegelte Farblogik zu Fixkosten)
   - Budget-Karte mit 3 Zuständen (Laufend / Überschritten / Ghost — Fortschrittsbalken + Restbudget-Anzeige, immer ICH)
   - Karussell-Sortierung: Fixkosten → Einnahmen → Budget (§7 Gemeinsame Basis)

2. **Karten-Liste integriert in `src/app/page.tsx`**: Server-Component lädt alle Karten des Users, filtert auf `is_card_active_in_month(card_id, targetMonth)`, ruft pro aktiver Karte `calculate_card_amount_for_month` (und bei Budget zusätzlich `get_planned_amount_for_month`) parallel via `Promise.all`. Resultierende Liste wird in fester Sortierung an die Karussell-Komponente übergeben.

3. **RPC-Wrapper-Erweiterung** in `src/lib/rpc.ts` um vier neue Funktionen plus LL-2-Fix (siehe §3.1).

4. **Tap- + „Betrag anpassen"-Interaktionen** funktional:
   - Tap auf Fixkosten/Einnahmen → Server Action toggelt `card_monthly_states.manually_paid`
   - ⋯-Kontextmenü auf Hover → Overlay mit zwei Pfaden („Nur dieser Monat" UPSERT `adjusted_amount` / „Dauerhaft ab diesem Monat" INSERT in `card_planned_timeline`)

**Was NICHT in diesem Sprint passiert** (Scope-Cut bestätigt vom User):

- Keine Karten-Erzeugung (Direktklick + Fragment-Drop = Sprint 5 / Sprint 7)
- Keine destruktiven Kontextmenü-Aktionen (`Letzte Zahlung in Monat X` + `Karte löschen` = Sprint 8 mit Soft-Delete-Pattern)
- Keine Toast-UI (Sprint 8)
- Kein Fragment-Drop, kein Fragment-Eject (Sprint 7)
- Keine Untere Interaktionszone (Sprint 5)
- Keine eigene Sparrate-Berechnung — alles per RPC
- Keine Klick-Interaktion auf Budget-Karten (Visual hat nur 3 Zustände, kein „Bezahlt"-Pendant; Schema unterstützt es technisch, aber §7 surfaces es nicht)
- Keine Mobile-/Touch-Anpassungen (CLAUDE.md §7)
- Kein neuer RPC, keine Migration (Architekt-Sanity-Check bestätigt: alle 4 nötigen RPCs live)

---

## 2. Voraussetzungen (vor Sprint-Start, durch User erledigt — Bestätigung im Sprint-Output)

| # | Aufgabe | Wer | Kontrolle |
|---|---|---|---|
| V1 | Sprint 3 ist approved und auf `main` gemerged | User | CLAUDE.md §4 Sprint 3 = 🟢 |
| V2 | Architekt-Sanity-Check: `calculate_card_amount_for_month`, `is_card_active_in_month`, `get_planned_amount_for_month`, `get_split_factor` sind alle live und spec-konform | User | Architekt-Antwort vom 16. Mai 2026 dokumentiert (siehe PM-Chat-Übergabe) |
| V3 | `src/lib/supabase/types.ts` enthält die 4 RPCs in `Database["public"]["Functions"]`, `tsc --noEmit` clean | User / Claude Code im Sprint-Start | Bestätigung im Sprint-Output |
| V4 | Branch `sprint/04-cards` erstellt + ausgecheckt | User | `git status` |
| V5 | Test-Daten in DB angelegt (per Architekt-SQL applied am 16. Mai 2026): 7 Karten, 8 `card_planned_timeline`-Zeilen (Strom hat 2), 3 `card_monthly_states`-Zeilen, 1 `fragment` + 1 `card_fragment_link` | User | Bestätigt durch Verifikations-SELECTs |
| V6 | Keine neue Migration, keine Architekten-Vorarbeit erforderlich | — | RPC-Sanity bestätigt |

**Test-Daten-Matrix (zur Smoke-Test-Planung):**

| Karte | Typ | Attribution | Frequenz | first_active | last_active | Plan | Monthly State |
|---|---|---|---|---|---|---|---|
| Miete | FIXED_COST | GEMEINSAM | MONTHLY | 2026-01 | NULL | 1.200,00 € ab Jan | — |
| Strom | FIXED_COST | GEMEINSAM | MONTHLY | 2026-01 | NULL | 100,00 ab Jan / 110,00 ab Mai | Mai: paid |
| Netflix | FIXED_COST | ICH | MONTHLY | 2026-01 | NULL | 17,99 € ab Jan | — |
| Auto-Versicherung | FIXED_COST | ICH | ANNUAL | 2026-01 | NULL | 650,00 € ab Jan | — |
| Steuerrückzahlung | INCOME | ICH | ONCE | 2026-03 | 2026-03 | 800,00 € ab März | März: received |
| Tanken | BUDGET | ICH | MONTHLY | 2026-01 | NULL | 200,00 € ab Jan | Mai: adjustment = 250,00 € |
| Essen | BUDGET | ICH | MONTHLY | 2026-01 | NULL | 300,00 € ab Jan | — (aber: 1 Fragment 360 € im Mai → Überschritten) |

**Zustände, die mit dieser Test-Matrix abdeckbar sind:**

- Fixkosten-Offen: Miete im Mai (alle Monate ab Jan ohne Tap)
- Fixkosten-Bezahlt: Strom im Mai (manually_paid = true)
- Einnahmen-Erwartet: Steuerrückzahlung im Mai NICHT sichtbar (ONCE-Frequenz, nur März), für Erwartet-Visual müsste ein anderer März-State ohne Tap getestet werden — siehe Smoke-Test
- Einnahmen-Erhalten: Steuerrückzahlung im März
- Budget-Laufend: Tanken im Mai (Plan 200 + Adj 250, keine Fragmente → Anzeige-Betrag = 250, Restbudget = 0/250)
- Budget-Überschritten: Essen im Mai (Fragmente 360 > Plan 300 → Anzeige 360, „−60 € über Plan")
- Ghost (Forecast): Alle Karten in Juni/Juli/+
- ANNUAL-Frequenz: Auto-Versicherung nur im Januar sichtbar
- ONCE-Frequenz: Steuerrückzahlung nur im März sichtbar

> Hinweis: Die Budget-Adjustment-Logik (Tanken Mai 250 € adj. auf 200 € Plan, ohne Fragmente) hat einen V1-Sonderfall — siehe Anti-Drift A8.

---

## 3. Aufgaben (in dieser Reihenfolge ausführen)

### 3.1 RPC-Wrapper erweitern + LL-2 mitfixen

**Datei:** `src/lib/rpc.ts`

Vier neue Funktionen analog `calculateSparrateForMonth` / `calculatePlannedSparrateForMonth` aus Sprint 2. Konvention: SupabaseClient als erster Parameter, camelCase → snake_case-Mapping im Wrapper, **Throw-on-Error** als Default (CLAUDE.md §7 LL-2).

```ts
/** Anzeige-Betrag einer Karte für einen bestimmten Monat.
 *  Returns 0 falls Karte im Monat inaktiv (kombinieren mit isCardActiveInMonth als Render-Gate).
 *  Throws bei DB-Errors. */
export async function calculateCardAmountForMonth(
  supabase: SupabaseClient<Database>,
  args: { cardId: string; month: string /* "YYYY-MM-01" */ }
): Promise<number> {
  // .rpc("calculate_card_amount_for_month", { p_card_id, p_month })
  // Bei null aus der DB: 0 zurückgeben (RPC liefert per Spec immer numeric ≥ 0)
}

/** Aktivitäts-Filter: Soll diese Karte im angegebenen Monat gerendert werden?
 *  Returns false bei: gelöscht, vor first_active_month, nach last_active_month, Frequenz-Mismatch.
 *  Niemals NULL — Wrapper gibt im Defensive-Fall (z. B. session expired) false zurück. */
export async function isCardActiveInMonth(
  supabase: SupabaseClient<Database>,
  args: { cardId: string; month: string }
): Promise<boolean>;

/** Geplanter Betrag aus card_planned_timeline (Forward-Inheritance, ignoriert Adjustment).
 *  Returns null falls für diesen Monat kein Plan-Eintrag existiert. */
export async function getPlannedAmountForMonth(
  supabase: SupabaseClient<Database>,
  args: { cardId: string; month: string }
): Promise<number | null>;

/** Split-Faktor ICH-Anteil zum Monat M (0..1).
 *  Niemals NULL. 1.0 falls Partner unbekannt, 0.0 falls ICH unbekannt. */
export async function getSplitFactor(
  supabase: SupabaseClient<Database>,
  args: { userId: string; month: string }
): Promise<number>;
```

**Wichtig zur RPC-Sicherheits-Konsistenz** (aus Architekt-PM-Notiz):
Funktionen 1–3 nehmen **keinen** `p_user_id`-Parameter, sondern verlassen sich auf `auth.uid()` via RLS. Bei fehlender Session liefern sie still NULL/false/0 ohne Error. Frontend muss defensiv prüfen.

**LL-2-Fix:** `estimateNetMonthly` aus Sprint 1 schluckt aktuell DB-Errors und liefert dann null. Per LL-2 ist Throw-on-Error die Konvention. Umstellen — sodass alle 5 Wrapper (4 neu + estimateNetMonthly) konsistent Throw-on-Error sind. **Auswirkung prüfen:** `onboarding-form.tsx` ruft `estimateNetMonthly` im Live-Schätz-Pfad — bei Error muss die UI weiterhin nicht crashen. Aufrufer-seitig im try/catch wrappen falls noch nicht der Fall.

### 3.2 Komponenten-Skeleton

**Neue Ordner-Struktur:**

```
src/components/cards/
├── index.tsx                       — Server Component, Karussell-Wrapper, lädt + filtert Karten-Liste
├── card.tsx                        — Server Component, Single-Card-Render (alle 3 Typen)
├── card-interactive.tsx            — Client Component, Wrapper für Tap + Hover + Kontextmenü
├── adjust-amount-overlay.tsx       — Client Component, Overlay mit zwei Pfaden
├── actions.ts                      — Server Actions (toggleCardTap, applyAdjustmentThisMonth, applyAdjustmentForward)
├── cards.module.css                — Karussell-Layout + alle Karten-Styles + Overlay
└── cards.types.ts                  — Typen (CardData, CardType, CardState, ...)
```

**Top-Level-API:**

```tsx
// page.tsx
import { CardsCarousel } from "@/components/cards"

<CardsCarousel
  targetMonth={targetMonth}       // "YYYY-MM"
  currentMonth={currentMonth}     // "YYYY-MM"
  cards={cardsList}               // typisiert, bereits geladen + gefiltert
/>
```

### 3.3 Daten-Loading in `page.tsx`

**Reihenfolge:**

1. `searchParams.month` → `parseMonthParam` → `targetMonth` (bereits aus Sprint 3)
2. `getCurrentMonthYM()` → `currentMonth`
3. `ymToDbDate(targetMonth)` → DB-Date-Format für RPCs
4. **Karten-Liste laden** (SELECT FROM `cards` WHERE `user_id = auth.uid()` — RLS schützt automatisch)
5. **Aktivitäts-Filter:** `Promise.all` über alle Karten → `isCardActiveInMonth(card.id, dbDate)` → filter auf `true`
6. **Beträge laden:** `Promise.all` über aktive Karten → für jede Karte:
   - `calculateCardAmountForMonth(card.id, dbDate)` (immer)
   - Falls `card.card_type === "BUDGET"`: zusätzlich `getPlannedAmountForMonth(card.id, dbDate)`
   - Zusätzlich für Adjustment-Anzeige: direkter SELECT auf `card_monthly_states` WHERE `card_id = ?` AND `month = ?` (für `manually_paid` und `adjusted_amount`)
7. **Sortieren:** FIXED_COST zuerst, dann INCOME, dann BUDGET. Innerhalb gleicher Typen: alphabetisch nach `name` (deterministisch für Smoke-Test).

**Performance-Hinweis:** Bei den 7 Test-Karten sind das maximal ~22 parallele RPC-Calls + 1 SELECT. Promise.all parallelisiert das in einem Roundtrip. Akzeptabel für V1. Falls in V2 die Karten-Anzahl wächst, ist ein gebündelter Karten-Hot-Path-RPC denkbar — Anmerkung an PM, falls Claude Code das im Sprint-Output erwähnen will (kein Action Item Sprint 4).

**Code-Skelett:**

```tsx
// page.tsx (Auszug)
const supabase = await createClient()
const targetMonth = parseMonthParam(searchParams.month)
const currentMonth = getCurrentMonthYM()
const dbDate = ymToDbDate(targetMonth)

// 1. Karten-Liste
const { data: rawCards } = await supabase
  .from("cards")
  .select("id, name, card_type, card_attribution, card_frequency, first_active_month, last_active_month")
  .order("card_type", { ascending: true })
  .order("name", { ascending: true })

// 2. Aktivitäts-Filter
const activeFlags = await Promise.all(
  rawCards.map(c => isCardActiveInMonth(supabase, { cardId: c.id, month: dbDate }))
)
const activeCards = rawCards.filter((_, i) => activeFlags[i])

// 3. Beträge + Monthly-State
const enriched = await Promise.all(activeCards.map(async (c) => {
  const [amount, planned, stateRow] = await Promise.all([
    calculateCardAmountForMonth(supabase, { cardId: c.id, month: dbDate }),
    c.card_type === "BUDGET"
      ? getPlannedAmountForMonth(supabase, { cardId: c.id, month: dbDate })
      : Promise.resolve(null),
    supabase
      .from("card_monthly_states")
      .select("manually_paid, adjusted_amount")
      .eq("card_id", c.id)
      .eq("month", dbDate)
      .maybeSingle()
      .then(r => r.data)
  ])
  return { ...c, amount, planned, manuallyPaid: stateRow?.manually_paid ?? false, adjustedAmount: stateRow?.adjusted_amount ?? null }
}))

// 4. Sortieren (FIXED_COST → INCOME → BUDGET)
const typeOrder = { FIXED_COST: 0, INCOME: 1, BUDGET: 2 }
enriched.sort((a, b) => typeOrder[a.card_type] - typeOrder[b.card_type] || a.name.localeCompare(b.name, "de-DE"))
```

### 3.4 Single-Card-Layout (gemeinsame Basis)

**Datei:** `src/components/cards/card.tsx` (Server Component) + `cards.module.css`

**Geometrie aus §7 Gemeinsame Basis:**

| Eigenschaft | Wert |
|---|---|
| Breite | `136px` |
| Border-Radius | `14px` |
| Padding | `14px 13px 12px` |
| Opacity (aktiv) | `0.75` |
| Opacity (Ghost) | `0.65` |
| Hover Opacity | `0.95` (nur wenn nicht Ghost) |
| Hover Transform | `translateY(-2px)` |
| Active Transform | `scale(0.97)` |
| Padding-Bottom Budget | `18px` (für Fortschrittsbalken-Platz) |

**Struktur (alle 3 Typen identisch im DOM, Varianten via CSS-Klassen):**

```
<div class="card card--{type} card--{state}">
  <div class="cardTop">
    <div class="cardLabel">FIXKOSTEN | EINNAHMEN | BUDGET</div>
    <div class="cardIcon icon--{state}"> /* SVG */ </div>
  </div>
  <div class="cardName">Miete</div>
  <div class="cardAmount">1.200 €</div>
  <div class="cardStateLabel">Offen | Bezahlt | Erwartet | Erhalten | Laufend | Überschritten | Forecast</div>
  /* BUDGET only: */
  <div class="restAmount restAmount--{pos|neg}">Noch 153 € frei | −60 € über Plan</div>
  /* alle Typen: */
  <div class="cardMeta">
    <div class="metaDot metaDot--{ich|gemeinsam}"></div>
    <div class="metaText">Ich | Gemeinsam</div>
  </div>
  /* BUDGET only: */
  <div class="progressWrap"><div class="progressBar progressBar--{norm|over}" style="width: X%"></div></div>
  /* Hover-overlay, alle Typen (nur wenn nicht Ghost): */
  <CardInteractive cardId={...} ... />
</div>
```

**Tokens & RGBA-Werte:**

Vorhandene Tokens aus `tokens.css` nutzen wo möglich: `--bg-card-open`, `--bg-card-paid`, `--bg-card-over`, `--bg-card-ghost`, `--color-teal`, `--color-red`, `--text-primary`, `--text-muted`, `--text-ghost`, `--border-subtle`, `--border-teal`, `--border-red`, `--color-blue-dot`.

**Komponenten-lokale CSS-Custom-Properties** am `.card`-Root (analog Sprint-2-Ring-/Sprint-3-Header-Pattern für komponentenspezifische Farben), z. B.:

```css
.card {
  --meta-dot-ich: rgba(255,255,255,.22);
  --meta-dot-gemeinsam: rgba(100,168,240,.38);
  --meta-text: rgba(255,255,255,.20);
  /* Budget-spezifisch */
  --rest-pos: rgba(62,207,175,.40);
  --rest-neg: rgba(255,69,58,.65);
  --progress-norm: rgba(62,207,175,.45);
  --progress-over: #FF453A;
  /* Einnahmen-spezifisch */
  --income-bg-erwartet: #0D1A16;
  --income-border-erwartet: rgba(62,207,175,.18);
  --income-label-fg: rgba(62,207,175,.45);
  /* ... etc. */
}
```

Vollständige RGBA-Tabelle in §7 Design-Doku — 1:1 übernehmen.

**Typographie aus §3:**

| Element | Spec |
|---|---|
| Kartenname | `13px / 500 / -0.2px` |
| Kartenbetrag | `22px / 200 / -1.2px` |
| Status-Label | `9px / 600 / 1.0px / uppercase` |
| Karten-Typ-Label | `9px / 600 / 1.0px / uppercase` |
| Restbudget | `11px / 500` |
| Meta-Text | `10px / 500` |

### 3.5 Fixkosten-Karte — Zustände

Per Design-Doku §7:

| Zustand | Background | Border | Name + Betrag | Status-Label | Icon | Tap |
|---|---|---|---|---|---|---|
| Offen | `#160D0D` | `rgba(255,69,58,.18)` | `rgba(255,255,255,.45)` | `Offen` / rot | Roter gefüllter Kreis | Tap → Bezahlt |
| Bezahlt | `#0A140E` | `rgba(62,207,175,.22)` | `#ffffff` | `Bezahlt` / teal | Teal-Checkmark | Tap → Offen |
| Ghost | `#181818` | `rgba(255,255,255,.10)` + opacity 0.65 | gedimmt | `Forecast` | Grauer Kreis | keine Interaktion, cursor default |

**Icon-SVGs** aus dem Prototyp `karten_final_v4.html` 1:1 übernehmen (Zeilen 102/114/126 für Fixkosten, jeweils 8×8 viewBox).

**Zustand-Resolution** (Server-Component):

```ts
function resolveFixedCostState(card, isFuture): "open" | "paid" | "ghost" {
  if (isFuture) return "ghost"
  return card.manuallyPaid ? "paid" : "open"
}
```

> Hinweis: Modell α (§2.3) — vergangene Karten ohne Tap und ohne Fragment werden für die Sparrate-Berechnung als „Plan zahlt" gerechnet, aber visuell zeigen sie weiterhin `Offen`. Das ist konsistent mit „User-Agency": er kann jederzeit nachträglich tappen.

### 3.6 Einnahmen-Karte — Zustände

Gespiegelte Farblogik zu Fixkosten — Teal statt Rot für „offen/wartend", da eine Einnahme positiv ist (§7 Einnahmen-Karte „Designprinzip").

| Zustand | Background | Border | Name + Betrag | Status-Label | Icon | Tap |
|---|---|---|---|---|---|---|
| Erwartet | `#0D1A16` | `rgba(62,207,175,.18)` | `rgba(255,255,255,.45)` | `Erwartet` / teal | Offener Teal-Kreis (kein Fill) | Tap → Erhalten |
| Erhalten | `#0A140E` | `rgba(62,207,175,.22)` | `#ffffff` | `Erhalten` / teal | Teal-Checkmark | Tap → Erwartet |
| Ghost | identisch Fixkosten-Ghost | | | `Forecast` | | keine |

**Karten-Typ-Label-Farbe:** `rgba(62,207,175,.45)` (teal, nicht weiß) — auch im Erwartet-Zustand. Das ist die einzige strukturelle Abweichung zu Fixkosten (dort: rot bei Offen).

**Icon-SVGs:**
- Erwartet: Offener Kreis `<circle cx="4" cy="4" r="3" stroke="rgba(62,207,175,.7)" stroke-width="1.2" fill="none"/>` (aus `einnahmen_karte_alle_zustaende.html`)
- Erhalten: Identisch zu Fixkosten-Bezahlt-Checkmark
- Ghost: Identisch zu Fixkosten-Ghost

**Zustand-Resolution:**

```ts
function resolveIncomeState(card, isFuture): "expected" | "received" | "ghost" {
  if (isFuture) return "ghost"
  return card.manuallyPaid ? "received" : "expected"
}
```

### 3.7 Budget-Karte — Zustände

Zusätzlich zur Fixkosten-Basis: Fortschrittsbalken `3px` an Unterkante + Restbudget-Anzeige + `padding-bottom: 18px`.

**Wichtig:** Budget-Karten sind **immer ICH** (§7 + DB-Constraint). `card_attribution === "GEMEINSAM"` darf für Budget nie auftreten.

| Zustand | Background | Border | Name + Betrag | Status-Label | Restbudget | Balken |
|---|---|---|---|---|---|---|
| Laufend | `#160D0D` | `rgba(255,69,58,.18)` | `rgba(255,255,255,.45)` | `Laufend` / rot | `Noch X € frei` in teal | teal, Breite = `consumed/plan` |
| Überschritten | `#160A08` | `rgba(255,69,58,.35)` | Name weiß, Betrag rot `#FF453A` | `Überschritten` / rot | `−X € über Plan` in rot | rot, 100% |
| Ghost | identisch Fixkosten-Ghost | | | `Forecast` | nicht anzeigen | — |

**Zustand-Resolution + Balken-Math:**

```ts
function resolveBudgetState(card, isFuture): "running" | "over" | "ghost" {
  if (isFuture) return "ghost"
  // amount kommt aus calculate_card_amount; planned aus get_planned_amount
  // Edge: planned könnte null sein, dann state = "running", planned fallback 0
  const plan = card.planned ?? 0
  return card.amount > plan ? "over" : "running"
}

// Restbudget + Bar
const overshoot = Math.max(0, card.amount - plan)
const consumed  = Math.min(card.amount, plan)
const restText  = state === "over"
  ? `−${formatEuro(overshoot)} über Plan`
  : `Noch ${formatEuro(plan - card.amount)} € frei`
const barWidth  = state === "over" ? 100 : (plan > 0 ? (consumed / plan) * 100 : 0)
```

> ⚠️ **V1-Sonderfall Adjustment** (Anti-Drift A8): `get_planned_amount_for_month` liefert den **Roh-Plan** aus `card_planned_timeline`, ohne Adjustment. `calculate_card_amount_for_month` liefert dagegen den Plan-plus-Adjustment-Wert (Prioritätskette Realität → Anpassung → Plan). Bei der Tanken-Test-Karte im Mai (Roh-Plan 200, Adjustment 250, keine Fragmente) bedeutet das: `amount = 250`, `planned = 200`, `amount > planned` → State `Überschritten`, „−50 € über Plan". Das ist V1-Verhalten und im Briefing **bewusst zugelassen**. Sprint 6 oder eine V2-RPC-Erweiterung (`get_effective_plan_for_month`) löst das. **Nicht im Frontend per Heuristik fixen.** Im Smoke-Test wird dieser Zustand als „erwartet" markiert.

**Fortschrittsbalken-Styling:**

```css
.progressWrap {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background: rgba(255,255,255,.04);
  border-radius: 0 0 14px 14px;
  overflow: hidden;
}
.progressBar {
  height: 100%;
  transition: width .3s ease;
}
.progressBar--norm { background: var(--progress-norm); }
.progressBar--over { background: var(--progress-over); }
```

### 3.8 Ghost-Zustand (alle 3 Typen)

`isFuture = compareMonths(targetMonth, currentMonth) === 1`. Pro Karte als Boolean-Prop weitergeben.

Im Ghost-Zustand:
- Background: `#181818`
- Border: `rgba(255,255,255,.10)` solid (KEINE gestrichelte Border)
- Opacity 0.65
- Name: `rgba(255,255,255,.35)`
- Betrag: `rgba(255,255,255,.32)`
- Status-Label: `Forecast` in `rgba(255,255,255,.20)`
- Karten-Typ-Label: `rgba(255,255,255,.25)`
- Icon: Grauer Kreis (analog `karten_final_v4.html` Zeile 126)
- Cursor: `default`
- Keine Hover-Effekte (kein `translateY`, keine Opacity-Änderung)
- KEINE Interaktions-Komponente (Tap, Kontextmenü, Overlay alle deaktiviert)
- Bei Budget: Restbudget + Bar **nicht** anzeigen

Implementations-Hinweis: Wenn `isFuture`, gar nicht erst `<CardInteractive>` rendern.

### 3.9 Tap-Interaktion (Fixkosten + Einnahmen)

**Server Action in `actions.ts`:**

```ts
"use server"
export async function toggleCardTap(formData: FormData) {
  const cardId = formData.get("cardId") as string
  const month = formData.get("month") as string  // "YYYY-MM-01"
  // 1. SELECT vorhandenen State (oder null)
  // 2. UPSERT card_monthly_states mit toggled manually_paid
  //    onConflict: "card_id,month"
  //    Defense-in-Depth: UPSERT, nicht UPDATE (CLAUDE.md §7 Regel 8)
  // 3. revalidatePath("/", "page") oder revalidatePath aktueller URL — damit Ring + Cards neu rendern
}
```

**UI-Integration:** In `card-interactive.tsx`:

```tsx
"use client"
<form action={toggleCardTap}>
  <input type="hidden" name="cardId" value={cardId} />
  <input type="hidden" name="month" value={month} />
  <button type="submit" className={styles.tapButton} aria-label={...}>
    {/* unsichtbarer Klick-Catcher über der gesamten Karte */}
  </button>
</form>
```

**Wichtig zur LL-5-Resistenz:**
Die Empfehlung ist **keine optimistic UI** in Sprint 4. Server Action → Page-Revalidate → neue Server-Render. Das ist langsamer (1 DB-Roundtrip), aber:
- Kein Client-State, der bei Monatswechsel via Sprint-3-Soft-Navigation überlebt
- Keine Race-Conditions zwischen Tap-Animation und Server-Antwort
- Konsistente Datenquelle

Falls Claude Code **doch** optimistic UI implementieren möchte (z. B. via `useOptimistic` für sofortiges Visual-Feedback), muss das mit einem `useEffect` auf `targetMonth`-Prop-Wechsel den Optimistic-State zurücksetzen (LL-5). Im Sprint-Output begründen, warum die Komplexität gerechtfertigt war.

**Budget-Karten sind nicht tappable in Sprint 4** (kein „Bezahlt"-Zustand in §7). Keine Tap-Button-Komponente rendern.

### 3.10 Kontextmenü + „Betrag anpassen"-Overlay

**Sichtbarkeit ⋯-Icon:**
- Default `opacity: 0`
- `.card:hover .contextIcon` → `opacity: 1`
- Position: oben links, `top: 8px; left: 8px`, `22×22px`, `border-radius: 50%`, Background `rgba(255,255,255,.05)` on hover

**Menü-Inhalt (Sprint-4-Scope):**

| Option | Aktion |
|---|---|
| Betrag anpassen | Öffnet Overlay (siehe unten) |

Genau **eine** Option. Die destruktiven Aktionen `Letzte Zahlung in Monat X` + `Karte löschen` kommen in Sprint 8 — nicht als Disabled-Stub anzeigen, einfach weglassen. Wenn nur eine Option im Menü ist, ist das stilistisch OK; ein Dropdown mit einem Eintrag wirkt nicht falsch.

**Menü-Styling:** Schwebt unter dem ⋯-Icon, leichter Shadow + backdrop-filter blur(20px), Background `rgba(28,28,30,.92)`, Border `.5px solid rgba(255,255,255,.1)`, Border-Radius `10px`, Padding `4px 0`. Optionen `12px / 500`, Padding `8px 14px`, Hover `rgba(255,255,255,.05)`.

**„Betrag anpassen"-Overlay** (`adjust-amount-overlay.tsx`):

```tsx
"use client"
// Modal-style, zentriert
// 1. Aktueller Betrag im Read-Only-Label
// 2. Neues-Betrag-Eingabefeld (number-typ, decimals erlaubt)
// 3. Zwei Aktions-Buttons:
//    a) "Nur dieser Monat" → ruft applyAdjustmentThisMonth-Server-Action
//    b) "Dauerhaft ab diesem Monat" → ruft applyAdjustmentForward-Server-Action
// 4. "Abbrechen"-Button
// 5. ESC schließt
```

**Server Actions:**

```ts
"use server"

export async function applyAdjustmentThisMonth(formData: FormData) {
  const cardId = formData.get("cardId") as string
  const month = formData.get("month") as string
  const newAmount = parseFloat(formData.get("newAmount") as string)
  // UPSERT card_monthly_states.adjusted_amount
  // onConflict: "card_id,month"
  // Defense-in-Depth: UPSERT (Regel 8)
  // revalidate
}

export async function applyAdjustmentForward(formData: FormData) {
  const cardId = formData.get("cardId") as string
  const month = formData.get("month") as string  // = effective_month
  const newAmount = parseFloat(formData.get("newAmount") as string)
  // UPSERT card_planned_timeline (effective_month = month)
  // onConflict: "card_id,effective_month"
  // Defense-in-Depth: UPSERT statt INSERT — falls bereits eine Zeile mit diesem
  // effective_month existiert, wird sie überschrieben (analog income_timeline-Pattern aus Sprint 1, LL-K1)
  // revalidate
}
```

**Validierung (Client + Server):**
- `newAmount > 0`
- Maximal 2 Dezimalstellen
- Keine wissenschaftliche Notation
- Bei Fehler: dezente rote Subzeile unter dem Input, Submit-Button disabled

**UX-Copy (§12.3, deutsch):**

| Element | Text |
|---|---|
| Overlay-Titel | `Betrag anpassen` |
| Aktueller Wert (Read-only) | `Aktuell: 200,00 €` |
| Input-Label | `Neuer Betrag` |
| Button 1 | `Nur dieser Monat` |
| Button 2 | `Dauerhaft ab diesem Monat` |
| Cancel | `Abbrechen` |

> Hinweis: §12.3 der Design-Doku enthält ggf. nicht alle Strings exakt — bei Lücke pragmatisch wählen, im Sprint-Output als offene Frage an PM markieren.

---

## 4. Akzeptanz-Kriterien

| # | Kriterium | Wie geprüft |
|---|---|---|
| A1 | `src/components/cards/` enthält alle 7 erwarteten Dateien | `ls src/components/cards/` |
| A2 | `src/lib/rpc.ts` enthält 4 neue Wrapper + LL-2-Fix in `estimateNetMonthly` | `grep "throw" src/lib/rpc.ts` (alle 5 Wrapper werfen bei DB-Error) |
| A3 | `pnpm build` clean (keine TypeScript-Errors, keine ESLint-Errors) | Build-Log |
| A4 | `tsc --noEmit` clean | Direkt-Aufruf |
| A5 | `next lint` clean | Direkt-Aufruf |
| A6 | Mai 2026 Default-Render: Genau 6 Karten sichtbar (Miete, Strom, Netflix, Tanken, Essen — Auto-Versicherung NICHT, Steuerrückzahlung NICHT) | Browser, `/` aufrufen |
| A7 | Strom Mai zeigt Plan 110 € (nicht 100 €) — Forward-Inheritance funktional | Browser-Visual |
| A8 | Strom Mai zeigt Bezahlt-Zustand (Teal-Checkmark, Hintergrund `#0A140E`) | Browser-Visual |
| A9 | Essen Mai zeigt Überschritten (`260 € + 100€ Fragment-Δ = 360 €`, „−60 € über Plan", roter Balken 100 %) — *Hinweis: 260€-Wert ist erwartet wenn Plan 300 minus 40 ein Visual-Beispiel ist; konkret hier 360 € (Plan 300, Fragmente 360, Realität gewinnt > Plan)* | Browser-Visual |
| A10 | Tanken Mai zeigt 250 € (Adj.) und ist im V1-Modus **Überschritten** mit „−50 € über Plan" — siehe Anti-Drift A8 | Browser-Visual, **erwartetes V1-Verhalten** |
| A11 | Navigation zu März 2026 zeigt Steuerrückzahlung als Erhalten (Teal-Checkmark, 800 €) | Browser, `?month=2026-03` |
| A12 | Navigation zu Januar 2026 zeigt Auto-Versicherung (650 €, Offen, jährliche Frequenz) | Browser, `?month=2026-01` |
| A13 | Navigation zu Juni 2026 (Future): ALLE Karten als Ghost (`#181818`, Status `Forecast`, keine Hover-Effekte, ⋯-Icon nicht erscheinbar) | Browser, `?month=2026-06` |
| A14 | Tap auf Miete (Mai) → wechselt zu Bezahlt, Page revalidiert, Sparrate-Ring unverändert (Plan zählt sowohl Offen als auch Bezahlt) | Browser-Klick |
| A15 | Tap erneut auf Miete → wechselt zurück zu Offen (Rückgängig-Pfad) | Browser-Klick |
| A16 | ⋯-Icon hover-sichtbar (nicht im Ghost-Zustand) | Browser-Hover |
| A17 | Klick auf ⋯ → Menü öffnet mit einer Option „Betrag anpassen" | Browser-Klick |
| A18 | „Betrag anpassen" auf Netflix → Overlay mit 17,99 € als aktuell. Eingabe 20 €, „Nur dieser Monat" klicken → schließt + Karte zeigt 20 € | Browser-Klick + DB-Verifikation |
| A19 | „Betrag anpassen" auf Netflix → 25 €, „Dauerhaft ab diesem Monat" → DB-INSERT in `card_planned_timeline`, ab nächster Monatsnavigation zeigt Netflix 25 € | Browser + DB |
| A20 | Bundle-Grep nach Touch-Strings auf **`chunks/app/*.js`** (LL-4-Pattern): 0 Treffer für `touchstart`, `touchend`, `swipe`, `longpress` | `grep -r "touchstart\|swipe" .next/static/chunks/app/` nach `pnpm build` |
| A21 | Soft-Navigation (URL-Param-Wechsel): Tap-Status persistiert korrekt (kein „stale state" durch Client-State, LL-5) | Browser: tap auf Mai-Karte, navigiere Juni, navigiere Mai zurück — Status weiterhin Bezahlt |
| A22 | `git status` nach allen Commits clean (`feat:` + `docs:`) | Terminal |

---

## 5. Smoke-Test-Sequenz (Browser-basiert, vom User durchgeführt)

Erwartete Dauer: 15–20 Minuten.

| # | Schritt | Erwartung |
|---|---|---|
| S1 | App starten (`pnpm dev`), als Test-User einloggen, Dashboard öffnen | URL `/`, kein 404, Sprint-2-Ring + Sprint-3-Header sichtbar |
| S2 | Karussell unter dem Ring sichtbar | 5 Karten in einer Reihe: Miete, Netflix, Strom, Essen, Tanken (FIXED → INCOME wäre dran, INCOME hier leer, → BUDGET) |
| S3 | Sortierung verifizieren | Reihenfolge: Miete · Netflix · Strom · Essen · Tanken (Fixkosten alphabetisch zuerst, dann Budget alphabetisch) |
| S4 | Miete-Karte: Offen, 1.200 €, roter Punkt, „Gemeinsam"-Dot blau | Visual |
| S5 | Strom-Karte: Bezahlt, **110 €** (neuer Plan ab Mai), Teal-Checkmark, weißer Text | Visual |
| S6 | Netflix: Offen, 17,99 €, „Ich"-Dot grau | Visual |
| S7 | Essen: Überschritten, 360 €, „−60 € über Plan", roter Balken 100 % | Visual |
| S8 | Tanken: **Überschritten**, 250 €, „−50 € über Plan" (V1-Adjustment-Edge-Case A8) | Visual — als bekannter V1-Sonderfall markieren, kein Bug |
| S9 | `?month=2026-03` aufrufen | Steuerrückzahlung erscheint zusätzlich (3. Position vor Budget): Erhalten, 800 €, Teal-Checkmark, „Ich" |
| S10 | `?month=2026-01` aufrufen | Auto-Versicherung erscheint (Fixkosten-Reihe): Offen, 650 €, „Ich" |
| S11 | `?month=2026-02` aufrufen | Auto-Versicherung **NICHT** sichtbar (ANNUAL, nur Januar) |
| S12 | `?month=2026-06` aufrufen | Alle Karten Ghost: `#181818`-Background, „Forecast"-Status, Cursor default beim Hover |
| S13 | Im Mai: Hover auf Miete → ⋯-Icon erscheint oben links | Visual |
| S14 | Klick auf Miete-Hauptbereich (nicht ⋯) → Karte wechselt zu Bezahlt | Sparrate-Ring im Zentrum unverändert (Plan-Logik) |
| S15 | Klick erneut auf Miete → zurück zu Offen | Visual |
| S16 | Klick auf ⋯ bei Netflix → Menü mit „Betrag anpassen" | Visual |
| S17 | „Betrag anpassen" → Overlay öffnet, aktueller Wert 17,99 € | Visual |
| S18 | Eingabe 20,00 €, „Nur dieser Monat" klicken | Overlay schließt, Netflix zeigt 20,00 € |
| S19 | DB-Verifikation: `SELECT * FROM card_monthly_states WHERE card_id = <netflix-id> AND month = '2026-05-01'` | Eintrag mit `adjusted_amount = 20.00` vorhanden |
| S20 | „Betrag anpassen" auf Netflix erneut, 25,00 €, „Dauerhaft ab diesem Monat" | Overlay schließt, Netflix zeigt 25,00 € |
| S21 | DB-Verifikation: `SELECT * FROM card_planned_timeline WHERE card_id = <netflix-id> ORDER BY effective_month` | Neue Zeile mit `effective_month = '2026-05-01'`, `amount = 25.00` |
| S22 | Soft-Navigation: `?month=2026-06` (Juni-Ghost), zurück zu `?month=2026-05` | Netflix zeigt 25,00 € (war: 20,00 € adj. von S18, jetzt überschrieben durch Forward-Inheritance ab Mai mit 25,00 €) |
| S23 | `?month=2026-04` aufrufen | Netflix zeigt 17,99 € (Forward-Inheritance: April hat noch alten Plan) |
| S24 | Production-Build-Grep: `pnpm build` → `grep -r "touchstart\|swipe\|longpress" .next/static/chunks/app/ \| wc -l` | Ergebnis: 0 |

---

## 6. Sprint-Output-Format (`sprints/sprint_04_review.md`)

Analog Sprint 2/3:

1. **Header** mit Sprint-Nummer, Branch, Commit-Hashes, Datum
2. **Voraussetzungs-Bestätigung** (V1–V6)
3. **Code-Diff-Statistik**: `git log --stat -n 1 sprint/04-cards` (Code-Commit + Doc-Commit)
4. **Implementierungs-Übersicht**:
   - Neue Dateien (mit LOC)
   - Modifizierte Dateien (mit LOC ±)
   - RPC-Wrapper-Liste mit Signaturen
   - LL-2-Fix kurz dokumentieren
5. **Architektur-Entscheidungen** (E1, E2, ... — analog Sprint 3):
   - Z. B. „Tap-Pattern ohne optimistic UI" oder „Adjustment via direktem SELECT auf card_monthly_states statt neuem RPC"
6. **Selbst-Review-Liste**: Alle A1–A22 abhaken
7. **Smoke-Test-Ergebnisse**: Tabelle S1–S24 mit ✓/✗ + Bemerkung
8. **Bundle-Grep-Output**: `chunks/app/`-Resultat (LL-4-Pattern)
9. **DB-Verifikations-SQL** für S19 + S21
10. **Offene Fragen an PM** (z. B.: Budget-Adjustment-Edge-Case eskalieren? UI-Copy-Lücken? Soll Sprint 6 Helper-RPC-Refactor mit `get_effective_plan_for_month` ergänzt werden?)
11. **Vorschläge zur CLAUDE.md-Aktualisierung** (als Vorschlag, nicht als Ausführung)

**Commit-Reihenfolge (CLAUDE.md §7 verbindlich):**

1. Code-Implementation: `feat: implement cards component with 3 types, tap, adjust-amount overlay (sprint 4)`
2. Sanity-Checks (build, tsc, lint) — alle clean
3. Sprint-Review-Datei schreiben (referenziert `git status` clean nach feat-Commit)
4. Review-Commit: `docs: sprint 4 review`
5. Push beider Commits
6. Am Session-Ende: `git status` clean, keine `??` oder `M`

---

## 7. Anti-Drift-Liste

| # | Regel | Begründung |
|---|---|---|
| A1 | **Keine eigene Sparrate- oder Card-Amount-Berechnung im Frontend.** Immer RPC. | CLAUDE.md §7 Regel 1; Snapshot-Integrität |
| A2 | **Keine destruktiven Kontextmenü-Aktionen.** „Letzte Zahlung in Monat X" + „Karte löschen" sind explizit Sprint 8. | Scope-Cut bestätigt vom User; setzt Toast-UI + `schedule_deletion`-Wrapper voraus |
| A3 | **Budget-Karten nicht klickbar** (kein „Bezahlt"-Visual-Zustand in §7). | Design-Doku §7 listet nur 3 Budget-Zustände |
| A4 | **Budget-Karten haben immer `card_attribution = "ICH"`.** Falls eine GEMEINSAM-Budget in der DB auftaucht (Constraint-Bug), defensiv mit „Ich" rendern + im Sprint-Output melden. | DB-Constraint sollte das verhindern |
| A5 | **Keine Touch-/Swipe-/Mobile-Anpassungen.** | CLAUDE.md §7 Regel 8 |
| A6 | **`closed_at` in `card_monthly_states` ignorieren** (V1 nutzt nicht). | §2.7 |
| A7 | **UPSERT statt UPDATE** bei allen Server Actions auf `card_monthly_states` und `card_planned_timeline`. | CLAUDE.md §7 Regel 7 + 8 (Defense-in-Depth, LL-K1) |
| A8 | **Adjustment-Edge-Case nicht im Frontend per Heuristik fixen.** Tanken-Test-Karte (Plan 200, Adj 250, keine Fragmente) wird in V1 als „Überschritten −50 € über Plan" gerendert. Das ist erwartet und vom PM bestätigt. Sprint 6 oder ein neuer RPC (`get_effective_plan_for_month`) löst es sauber. | Verhindert Spec-Drift; saubere V2-Migration |
| A9 | **`effective_month` als String** (`YYYY-MM-01`) — niemals via `new Date()`. | CLAUDE.md §7 Regel 9 |
| A10 | **Keine `localStorage`-Persistierung** von Karten-States oder UI-State. | CLAUDE.md §7 |
| A11 | **Throw-on-Error für alle 5 RPC-Wrapper** (4 neu + LL-2-Fix in `estimateNetMonthly`). | LL-2 |
| A12 | **Optimistic UI optional, aber dann mit `useEffect`-Reset auf `targetMonth`-Wechsel.** | LL-5 |
| A13 | **Touch-Grep auf `chunks/app/*.js`, nicht `chunks/*.js`.** Framework-Chunks enthalten React-Synthetic-Event-Strings als Noise. | LL-4 |
| A14 | **Keine UI-Erfindungen.** Bei undefiniertem Zustand: im Sprint-Output als offene Frage melden, nicht raten. | CLAUDE.md §7 Regel 3 |
| A15 | **Tokens aus `tokens.css`**, keine Hex-Codes inline. Komponentenspezifische RGBA als komponente-lokale Custom Properties (analog Sprint 2/3). | CLAUDE.md §7 Regel 4 |

---

## 8. Stolperfallen

| # | Falle | Vermeidung |
|---|---|---|
| F1 | Prototyp zeigt Budget mit „Gemeinsam" — DB-Constraint verbietet das | A4: GEMEINSAM-Budget = Constraint-Bug; defensive ICH-Rendering |
| F2 | Prototyp zeigt Budget-Zustand „Abgeschlossen" — nicht in Design-Doku | Nicht implementieren |
| F3 | `get_planned_amount_for_month` returns NULL falls kein Plan-Eintrag — defensiv fallback auf 0 in Budget-Math | Spec-konform, siehe Architekt-Notiz |
| F4 | 3 von 4 RPCs nehmen kein `p_user_id` (RLS via `auth.uid()`) — bei fehlender Session stilles NULL/`false`/0, kein Error | Wrapper-Tests sicherstellen, dass authentifizierte Session beim Aufruf besteht |
| F5 | Forward-Inheritance: Mehrere `card_planned_timeline`-Zeilen pro Karte sind erlaubt und erwartet (siehe Strom mit 2 Einträgen) | `get_planned_amount_for_month` löst das per RPC korrekt |
| F6 | `card_monthly_states` Composite-Key ist `(card_id, month)` — UPSERT muss diesen explizit angeben | `onConflict: "card_id,month"` |
| F7 | `card_planned_timeline` Composite-Key ist `(card_id, effective_month)` — UPSERT für „Dauerhaft anpassen" muss das angeben | `onConflict: "card_id,effective_month"` |
| F8 | Sprint-3-LL-5: Client-State (z. B. `useState` für Overlay-Open) überlebt Soft-Navigation. Overlay-Open ist OK (User kann selbst zu-machen), aber Tap-Optimistic-State wäre nicht OK ohne Reset | Overlay-Open in Client-Component lassen; KEIN Optimistic-Tap |
| F9 | `tsc --noEmit` schlägt fehl wenn `<claude-code-hint>`-Tag in `types.ts` durch RPC-Regenerierung wieder reinkommt (nicht erwartet, da keine neue Migration) | Bei tsc-Fehler: `head -5 src/lib/supabase/types.ts` prüfen, Tag entfernen |
| F10 | Page-Revalidate nach Server Action: `revalidatePath("/", "page")` invalidiert nur die Root-Page. Da Sprint 3 Suchparam-basiert ist, ist der Card mit anderem `?month=` ggf. noch gecached | Test: nach Tap navigieren, dann zurück — Status muss persistiert sein. Falls Issue: `revalidatePath("/", "layout")` oder spezifischer Path-Pattern |
| F11 | Karten-Liste ist möglicherweise leer (z. B. bei neuem User ohne Karten) — UI muss leer-Zustand robust handhaben (kein Crash, kein leeres Karussell-Border) | Conditional Render: `cards.length === 0 ? null : <Carousel>` (oder Placeholder-Subzeile — PM-Entscheidung im Sprint-Output) |
| F12 | Karussell-Overflow: bei vielen Karten muss horizontal gescrollt werden — Sprint 4 hat 7 Test-Karten, easy. Für V1: `overflow-x: auto` mit `scroll-snap-type: x mandatory` ausreichend | Browser-Smoke Schritt S2 mit allen sichtbaren Karten verifiziert |

---

## 9. Hinweise zur Bundle-Größe

Sprint 4 ist die erste UI-Komponente mit substantieller Interaktivität (Tap, Overlay, Kontextmenü). Erwartete Bundle-Erhöhung im Browser-Chunk: ~20–40 KB minified.

Falls die Größe deutlich höher liegt: möglicherweise wurde versehentlich eine Library importiert, die schon in `package.json` als Dev-Dep markiert sein sollte. Build-Output prüfen.

---

## 10. PM-Übergabe-Notiz

Dieses Briefing setzt die Architekt-Verifikation vom 16. Mai 2026 voraus (alle 4 RPCs live, spec-konform) und die Test-Daten-Anlage durch SQL-Run im Supabase SQL-Editor (7 Karten, 8 Plan-Zeilen, 3 Monthly-States, 1 Fragment + Link).

Wenn beim Sprint-Start `is_card_active_in_month` für `'<test-user-uuid>'` und `'2026-05-01'` mit allen 7 Karten-IDs `true|false`-Werte gemäß Frequenz-Logik liefert, sind die Voraussetzungen erfüllt und Sprint 4 kann starten.

Bei Unklarheit zu §7-Spec oder §4.3-Logik: Frage im Sprint-Output an PM eskalieren, nicht raten.
