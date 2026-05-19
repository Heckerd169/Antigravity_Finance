# Sprint 5 Briefing — Untere Interaktionszone (§8)

> **Sprint:** 5
> **Komponente:** Untere Interaktionszone (Portal · Karussell-Erweiterung · Fragment-Stack)
> **Branch:** `sprint/05-interaction-zone`
> **Modell-Empfehlung:** Claude Sonnet 4.6 mit Opus-4.7-Eskalation bei DnD-/CSS-Bugs (Sprint-4-Pattern, LL-6)
> **Status vor Start:** ⏳ wartet auf Architekten-Lieferung zweier RPCs (siehe §0.2)

---

## 0. Voraussetzungen

### 0.1 Repo-Stand
- `main` enthält Sprints 0–4 grün
- Backup-Pointer: `sprint/04-cards` bleibt für Rollback
- Test-Daten vom 16. Mai 2026 + Sprint-5-Seed vom 17. Mai 2026 in DB:
  - 7 Karten, 8 Plan-Zeilen, 3 Monthly-States, 1 Fragment+Link aus Sprint 4
  - **+6 unzugeordnete Fragmente** (4 Mai 2026 / 1 April / 1 März)

### 0.2 Architekten-Vorarbeit (PFLICHT vor Sprint-Start)

Zwei neue Postgres-Funktionen müssen live sein, **vom Architekten zu liefern**:

| RPC | Zweck | Wo verwendet |
|---|---|---|
| `create_card_direct(p_name, p_type, p_attribution, p_frequency, p_first_active_month, p_last_active_month, p_planned_amount)` returns `uuid` | Atomic Card+Plan-Insert | Direktklick auf Empty-Slot |
| `create_card_from_fragment(p_name, p_type, p_attribution, p_frequency, p_first_active_month, p_last_active_month, p_planned_amount, p_fragment_id, p_link_month)` returns `uuid` | Atomic Card+Plan+Link-Insert | Fragment-Drop auf Empty-Slot |

Begründung: `cards_assert_initial_plan` ist DEFERRED. Nackter Card-INSERT aus JS-Client fails. Beide INSERTs müssen in einer Postgres-Transaktion sein → RPC.

Architekten-Lieferung: ausführungsfertiges SQL-Skript + Test-Cases. Sobald deployed, `pnpm dlx supabase gen types typescript` neu generieren + committen (ein eigener `chore:`-Commit).

### 0.3 Read-Modell
- View `fragments_with_status` ist live, Struktur dokumentiert in `architect_handover_v1.md` §2.2. Wichtig: `status` ist `text`, nicht ENUM. Werte: `'UNASSIGNED'` / `'ASSIGNED'` / `'AUTO_ABSORBED'`. RLS erbt über LEFT JOIN von `fragments` + `card_fragment_links`.

### 0.4 Was NICHT gebaut wird
- Echter CSV-Parser, Hash-Generierung, Distiller-Pipeline → **Sprint 7**
- KI-Vorschlags-Badge (`KI-Vorschlag: [Karten-Name]` auf Fragmenten) → **Sprint 7**
- Soft-Delete-Pattern + Toast + `schedule_deletion` → **Sprint 8**
- Mobile-/Touch-/Swipe-Anpassungen → **Phase 2**
- Optimistic UI (Sprint 4 hat 1s Latenz akzeptiert — bleibt V1-Standard)
- Eigene Sparrate-Berechnung — alles per RPC

---

## 1. Pflicht-Lese-Reihenfolge

1. `CLAUDE.md` — komplett, inkl. LL-1 bis LL-8 + Modell-Empfehlungen §9
2. `antigravity_finance_design_dokument_v3.md`:
   - **§8 Untere Interaktionszone** (Kernkapitel)
   - **§11 CSV-Import / Drop & Distill** (Portal-Visuals + Fehlertexte)
   - §7 Karten (Drop-Target-Verhalten + Konflikt 1–6)
   - §4.3 Anzeige-Betrag-Logik (was passiert wenn Realität dazu kommt)
   - §2.5 Modell 1 (Karten als Templates + ONCE-Frequenz)
   - §3 Tokens
3. `antigravity_finance_schema_summary_v2.md` §3, §4, §5 — `fragments`, `card_fragment_links`, View
4. `architect_handover_v1.md` — **Pflicht**, insbesondere §2.2 View-Schema, §4 Stolperfallen, §6 Test-Daten-Bestand
5. `sprints/sprint_04_briefing.md` + `sprints/sprint_04_review.md` — Karten-Komponente-Stand (wird in Sprint 5 erweitert, nicht ersetzt)
6. HTML-Prototypen unter `public/prototypes/`:
   - **`untere_interaktionszone.html`** (Haupt-Referenz, kritisch lesen — siehe §3 Anti-Drift)
   - `recurrence_popup_mit_abbrechen.html` (Recurrence-Popup-Layout)
   - `csv_import_drop_distill.html` (5 Portal-Zustände als Visual-Referenz — die linke „Zustand simulieren"-Spalte ist Dev-Tooling, NICHT ins Produkt)

---

## 2. Ziel

Am Ende dieses Sprints existieren sechs Dinge:

1. **Neue Komponente `src/components/interaction-zone/`** mit Portal + Karussell-Erweiterung + Fragment-Stack, integriert unter dem Ring + Karten-Bereich in `src/app/page.tsx`.

2. **Portal (Option A — bewusster Stub):**
   - 5 Zustände visuell vollständig (Default / Drag-Over / Verarbeitung / Erfolg / Fehler) gemäß §8 + §11
   - Klick öffnet File-Picker; Drop akzeptiert eine Datei
   - Sequenz bei Drop oder Filepick: 2 s „Verarbeitung" → 1.5 s „Erfolg" → Reset
   - **Kein DB-Read, kein Parser, keine Fragment-Erzeugung** — das ist explizit Sprint 7
   - Fehlertexte exakt nach §8 (Format / Leer / Korrupt), 4 s sichtbar → Auto-Reset

3. **Karussell-Erweiterung gegenüber Sprint 4:**
   - Chevron-Navigation (links/rechts, am Karussell-Rand)
   - Empty-Slot am Ende (immer sichtbar)
   - Drop-Outlines pro aktiver Karte beim Drag-Over eines Fragments
   - Empty-Slot empfängt zwei Pfade: Direktklick → Direktklick-Overlay · Fragment-Drop → Recurrence-Popup
   - Sprint-4-Funktionalität (Tap, ⋯-Adjust-Overlay, Sprint-4-Zustandsrendering) bleibt **unverändert intakt**

4. **Fragment-Stack rechts:**
   - Eigener vertikaler Scroll-Container
   - Liest aus View `fragments_with_status` für den eingeloggten User, **alle Monate**, sortiert nach `transaction_date` desc
   - Fragment-Karte: Betrag (groß, teal bei positiv / rot bei negativ), Beschreibung, Datum
   - `UNASSIGNED` voll sichtbar (Drag-Quelle); `ASSIGNED` + `AUTO_ABSORBED` opacity `0.22`, `pointer-events: none`
   - Drag-Hint-Subzeile darunter: **weglassen** (siehe Anti-Drift)

5. **Eject-Flow:**
   - Neue Kontextmenü-Option **„Verknüpfte Fragmente"** im ⋯-Menü der Karte
   - Sichtbar nur wenn die Karte mind. 1 verknüpftes Fragment im aktuellen `targetMonth` hat
   - Klick öffnet Detail-Overlay mit Liste aller im `targetMonth` verknüpften Fragmente (Betrag · Beschreibung · ×-Eject-Button)
   - Klick auf × → DELETE FROM `card_fragment_links` WHERE `fragment_id = $1`; Fragment springt sofort in den Stack zurück
   - Wenn die letzte Eject das Overlay leer macht → automatisch schließen

6. **Bonus-Scope: Subzeile linke Flanke im Header wiren** (überfällige TODO aus Sprint 3, jetzt sinnvoll weil Test-Fragmente da)
   - Hardcoded `Alles erledigt` ersetzen durch dynamischen Count aus `fragments_with_status`
   - Filter: `user_id = auth.uid()` AND `status = 'UNASSIGNED'` AND `date_trunc('month', transaction_date) = addMonths(targetMonth, -1)`
   - Labels:
     - 0 Fragmente → `Alles erledigt`
     - 1 Fragment → `1 Fragment offen`
     - n>1 → `n Fragmente offen`
   - Klein, abgegrenzt: 1 Server-Read + 1 String-Replace in `header-timeline/index.tsx`. **Sprint-7-TODO-Kommentar entfernen.**
   - Rechte Flanke (Ausreißer) bleibt hardcoded — Definition noch offen.

---

## 3. Anti-Drift zum Prototyp

| # | Prototyp-Element | Verhalten in V1 |
|---|---|---|
| AD1 | Inline `onclick=`-Handler in beiden Prototypen | React + Server Actions + `useState` — keine Inline-Handler |
| AD2 | `csv_import_drop_distill.html` linke „Zustand simulieren"-Spalte | Dev-Werkzeug, NICHT ins Produkt |
| AD3 | Drag-Hint-Subzeile `Fragmente auf Karten ziehen · Bereits zugeordnet: gedimmt` unter Stack | Weglassen (UI-Copy §12 hat keinen solchen Hint) |
| AD4 | Recurrence-Popup im Prototyp ohne „Einmalig"-Option (`recurrence_popup_mit_abbrechen.html`) | **Alle 5 Frequenzen** gemäß §8 inkl. „Einmalig" — Design-Doku gewinnt |
| AD5 | Empty-Slot-Visual im Prototyp: zentriertes „+"-Icon | Frei umsetzbar; visuell dezent passend zur Karten-Größe |
| AD6 | Karussell-Layout im Prototyp ist statisches Grid | V1 nutzt horizontalen Scroll-Container (Sprint-4-Pattern) erweitert um Chevrons |
| AD7 | Detail-Overlay-Trigger im Prototyp via direktem Klick auf Karte | V1 nutzt **Kontextmenü-Option**, nicht direkten Card-Klick (kollidiert sonst mit Tap-Toggle, siehe §2.5) |

---

## 4. Implementierungs-Details

### 4.1 Komponenten-Skeleton

```
src/components/interaction-zone/
├── index.tsx                          — Server Component, lädt Fragments, rendert Trinity-Layout
├── portal.tsx                         — Client Component, 5 Zustände + Drop-Handler (Stub)
├── carousel.tsx                       — Client Component, erweitert Sprint-4-Karten + Chevrons + Empty-Slot
├── empty-slot.tsx                     — Client Component, Click-Handler + Drop-Target
├── fragment-stack.tsx                 — Client Component, Drag-Quellen + vertical scroll
├── fragment-card.tsx                  — Server Component, ein Fragment-Item (Betrag + Beschr + Datum)
├── drop-target-wrapper.tsx            — Client Component, Drop-Outline für Sprint-4-Karten ohne deren Internals zu touchen
├── recurrence-popup.tsx               — Client Component, Drop-auf-Slot → 5 Frequenz-Options + Type + Attribution
├── direct-create-overlay.tsx          — Client Component, Click-auf-Slot → Name + Betrag + Type + Frequenz + Attribution
├── linked-fragments-overlay.tsx       — Client Component, Detail-Overlay mit Eject
├── actions.ts                         — Server Actions (5 Stück, siehe §4.7)
├── interaction-zone.module.css        — Layout + alle Sub-Styles
└── interaction-zone.types.ts          — CardCreateInput, FragmentRow, FrequencyOption, …
```

**Karten-Komponente NICHT umbauen.** Sprint 4 (`src/components/cards/`) bleibt unverändert intakt. Die Drop-Target-Outline wird über einen **Wrapper-Component** außen herum gelegt (`<DropTargetWrapper cardId={card.id} active={!isGhost}><Card ... /></DropTargetWrapper>`). Das hält Sprint 4 stabil und vermeidet Refactor-Risiko.

**Karussell-Erweiterung:** Die Chevron-Navigation + Empty-Slot kommen in `carousel.tsx`, das die existierende `<CardsCarousel>`-Komponente von Sprint 4 wraps/ersetzt. Falls dafür `src/components/cards/index.tsx` minimal-invasiv geöffnet werden muss (z. B. um Children-Slots zu erlauben): erlaubt, aber dokumentieren im Sprint-Output.

### 4.2 Daten-Loading in `page.tsx`

**Reihenfolge** (alles in der Server Component):

1. Sprint-3-Setup unverändert (`searchParams.month` → `targetMonth` → `dbDate`)
2. Sprint-4-Karten-Loading unverändert
3. **Neu: Fragmente laden** — `SELECT * FROM fragments_with_status WHERE user_id = auth.uid() ORDER BY transaction_date DESC`
4. **Neu: Linke-Flanke-Count laden** — `SELECT COUNT(*)::int FROM fragments_with_status WHERE user_id = auth.uid() AND status = 'UNASSIGNED' AND date_trunc('month', transaction_date) = addMonths(targetMonth, -1)::date`
5. Props an `<InteractionZone>` und `<HeaderTimeline>` durchreichen

**Performance-Hinweis:** Bei wenigen Fragmenten (V1 typisch <50) ist das Single-SELECT ausreichend. Bei >500 Fragmenten in V2 → Stack mit Limit + „mehr laden"-Pagination, jetzt aus Scope.

### 4.3 Portal — die 5 Zustände

**State-Machine in `portal.tsx`:**

```ts
type PortalState =
  | { kind: "default" }
  | { kind: "drag-over" }
  | { kind: "processing" }
  | { kind: "success" }
  | { kind: "error-format" }
  | { kind: "error-empty" }
  | { kind: "error-corrupt" }
```

**Übergänge (Option A):**

```
default ──drop file / file-picker change──▶ processing (2 s) ──▶ success (1.5 s) ──▶ default
default ──dragenter──▶ drag-over
drag-over ──dragleave──▶ default
processing ──[nicht erreichbar in V1: error-states]
```

Fehler-States sind in V1 nicht von Code-Logik triggerbar, weil Option A keinen echten Parser hat. **Trotzdem: alle 3 Fehler-Visuals müssen implementiert sein** (Border-Color, Background, Icon, Label, Sub-Label, 4-Sek-Timer-Reset). Manueller Trigger erfolgt im Browser-Smoke-Test über die DevTools (z. B. State-Variable temporär setzen oder Storybook-ähnlicher Bypass). Pragmatischer Vorschlag: **NODE_ENV-gated Dev-Buttons** unterhalb des Portals, analog Sprint-2-Force-Override. Production-Bundle muss diese Buttons elidieren (Tree-Shaking-Test im Sprint-Output).

**Drop-Handler:**
- `preventDefault` + `stopPropagation` auf beide `dragover` und `drop`
- Akzeptiert beliebige Datei — keine Dateityp-Prüfung (Stub)
- Setzt `processing`-State, startet `setTimeout(..., 2000)` → `success`, `setTimeout(..., 1500 nach success)` → `default`
- Kein Zugriff auf File-Bytes, kein `FileReader` — bewusst nicht (kein Lying)

**Auto-Reset-Cleanup:** Bei Unmount alle Timer aufräumen, sonst Memory-Leak. Bei `targetMonth`-Wechsel (LL-5) Portal-State zurück auf `default`.

**LL-6-Hinweis:** Portal selbst nicht in Clipping-Container — Subpopup-Fehlertext ist Teil des Portals, kein Overlay → kein Portal-/Fixed-Position-Bedarf.

### 4.4 Karussell — Erweiterung

**Chevron-Navigation:**
- Zwei Buttons (`«` `»`) am rechten Rand der Karussell-Row (analog Prototyp)
- Klick scrollt Karussell um Karten-Breite (smooth scroll via `scrollBy`)
- Disabled-Zustand wenn Scroll-Position am Anfang/Ende
- ARIA-Labels: „Vorherige Karten" / „Nächste Karten"

**Empty-Slot:**
- Immer letzte Position im Karussell
- Visuell: dünne dashed-Border-Box gleicher Größe wie Karten, zentriertes „+"-Icon (rgba(255,255,255,.15) o. ä.), Label `Neue Karte`
- Hover: Border-Color teal-Tönung (Drop-Hint-Antizipation)
- Click → `<DirectCreateOverlay open={true} targetMonth={targetMonth} />`
- Drop → `<RecurrencePopup fragment={draggedFragment} open={true} targetMonth={targetMonth} />`

**Drop-Outlines pro Karte:**
- `DropTargetWrapper` rendert um die Sprint-4-`<Card>` herum, fügt `onDragOver` + `onDrop` hinzu
- Bei Drag-Over: Outline (CSS `outline: 1px solid var(--color-teal-soft); outline-offset: 2px;`) — **kein** internes Restyling der Card
- Ghost Cards: kein Drop-Target (Konflikt 3 §7) — Wrapper rendert direkt die Card ohne Handler
- Drop → Server Action `linkFragmentToCard(fragmentId, cardId, month)` → revalidate

### 4.5 Fragment-Stack

**Render-Logik:**

```tsx
{fragments.map(f => (
  <FragmentCard
    key={f.id}
    fragment={f}
    isLocked={f.status !== "UNASSIGNED"}
  />
))}
```

**`<FragmentCard>`:**
- Wenn `isLocked`: `opacity: .22`, `pointer-events: none`, `draggable={false}`
- Sonst: `draggable={true}`, `onDragStart` setzt `dataTransfer.setData("application/x-fragment-id", f.id)`
- Visuell: Betrag in Top-Row (teal wenn positiv, rot wenn negativ — § farbtokens), Beschreibung in Sub-Row, Datum klein darunter
- Datum-Format: `formatMonthLabel` aus `lib/months.ts` reicht nicht (Tag-genau nötig) → neue Helper `formatDateShort(iso)` → `15. März 2026`
- Sortierung im SQL (`ORDER BY transaction_date DESC`) übernommen

**Edge-Cases:**
- 0 Fragmente: Stack ist leer — kein Placeholder-Text
- Fragmente in zukünftigen Monaten (CSV-Backdating): werden angezeigt, sortiert nach Datum desc
- Cross-Monat-Drop: User kann z. B. ein März-Fragment auf eine Mai-Karte droppen — `link_month` wird vom Frontend gleich `targetMonth` gesetzt (= Mai), nicht dem Fragment-Monat. Das ist semantisch das richtige Verhalten gemäß Konflikt 4 §7

### 4.6 Recurrence-Popup + Direct-Create-Overlay

**Gemeinsame Felder:**

| Feld | Direktklick | Fragment-Drop | Pflicht | Default |
|---|---|---|---|---|
| Karten-Name | leer, editierbar | aus `fragment.description`, editierbar | ja | — |
| Betrag | Euro-Input | aus `Math.abs(fragment.amount)`, **read-only** Anzeige | ja im Direktfall | — |
| Karten-Typ | Fixkosten / Einnahmen / Budget | dito | ja | Fixkosten |
| Frequenz | 5 Optionen | 5 Optionen (inkl. Einmalig) | ja | Monatlich |
| Attribution | ICH / GEMEINSAM (versteckt bei Budget) | dito | ja | ICH |
| Gilt ab | Anzeige `targetMonth`, nicht editierbar | Anzeige `targetMonth`, nicht editierbar | — | aktueller `targetMonth` |
| Datum (nur Drop) | — | aus `fragment.transaction_date`, read-only | — | — |

**Validation:**
- Frequenz `ONCE` → setzt `last_active_month = first_active_month` (Constraint `cards.once_is_single_month`)
- Typ `BUDGET` → erzwingt `attribution = 'ICH'` (Constraint `cards.budget_never_shared`), Attribution-Auswahl versteckt
- Betrag muss > 0 (UI-Validation)
- Karten-Name muss nicht-leer (UI-Validation)

**Submit-Verhalten:**
- Direktklick → Server Action `createCardDirect(input)` → RPC `create_card_direct(...)` → returns `cardId` → revalidate
- Drop → Server Action `createCardFromFragment(input, fragmentId, linkMonth)` → RPC `create_card_from_fragment(...)` → revalidate
- Bei Error: rote Fehlernotiz im Overlay, Overlay bleibt offen
- Bei Success: Overlay schließt, neue Karte erscheint im Karussell, Fragment (falls Drop) verschwindet aus Stack (jetzt ASSIGNED → gedimmt)

**LL-6:** Beide Overlays nutzen `position: fixed` + Backdrop, NICHT im Karussell-Container — Clipping verhindert. Sichtbarkeit ausschließlich über `useState(isOpen)`, NIEMALS an Eltern-Hover gekoppelt (Sprint-4-K2-Vermeidung).

### 4.7 Server Actions in `actions.ts`

Fünf neue Server Actions. Alle mit `"use server"`-Direktive, Default-Throw-on-Error (LL-2):

```ts
// 1. Drop Fragment auf existierende Karte
linkFragmentToCard(fragmentId: string, cardId: string, month: string /* "YYYY-MM-01" */): Promise<void>
  → INSERT INTO card_fragment_links (user_id, fragment_id, card_id, month, origin)
    VALUES (auth.uid(), $1, $2, $3, 'MANUAL_DROP')
    ON CONFLICT (fragment_id) DO UPDATE SET card_id = $2, month = $3, origin = 'MANUAL_DROP'
  → revalidatePath("/")

// 2. Eject Fragment
ejectFragment(fragmentId: string): Promise<void>
  → DELETE FROM card_fragment_links WHERE fragment_id = $1
  → revalidatePath("/")

// 3. Direktklick — neue Karte
createCardDirect(input: CardCreateInput): Promise<{ cardId: string }>
  → supabase.rpc('create_card_direct', { ... }) → returns cardId
  → revalidatePath("/")

// 4. Fragment-Drop auf Empty-Slot — neue Karte + Link
createCardFromFragment(input: CardCreateInput, fragmentId: string, linkMonth: string): Promise<{ cardId: string }>
  → supabase.rpc('create_card_from_fragment', { ..., p_fragment_id: $1, p_link_month: $2 }) → returns cardId
  → revalidatePath("/")

// 5. Portal-Stub (Option A — kein DB-Call)
// Nicht als Server Action implementiert — reine Client-Animation.
```

**ON CONFLICT bei `linkFragmentToCard`:** `card_fragment_links` hat `UNIQUE(fragment_id)`. Wenn das Fragment bereits einer anderen Karte zugeordnet ist (sollte bei dimmed `pointer-events: none` nicht möglich sein — Defense-in-Depth), wird der Link auf die neue Karte umgehängt. Das ist semantisch korrekt: ein Fragment kann nicht zwei Karten gehören, und der User-Intent ist klar.

**RPC-Wrapper in `lib/rpc.ts`:** 2 neue Funktionen wrappen `create_card_direct` + `create_card_from_fragment`. Throw-on-Error-Default. Bei `null`-Rückgabe (sollte nicht passieren, RPC returnt `uuid` immer) → Error werfen.

### 4.8 Subzeile linke Flanke wiren (Bonus-Scope)

**`page.tsx` Erweiterung:**
```ts
const previousMonth = addMonths(targetMonth, -1);
const previousMonthDbDate = ymToDbDate(previousMonth);
const { count: unassignedPreviousMonthCount } = await supabase
  .from("fragments_with_status")
  .select("*", { count: "exact", head: true })
  .eq("status", "UNASSIGNED")
  .gte("transaction_date", previousMonthDbDate)
  .lt("transaction_date", ymToDbDate(targetMonth));
```

**`header-timeline/index.tsx` Erweiterung:**
- Prop `unassignedPreviousMonthCount: number` durchreichen
- Label-Logik:
  ```tsx
  const label = count === 0 ? "Alles erledigt"
              : count === 1 ? "1 Fragment offen"
              : `${count} Fragmente offen`;
  ```
- TODO-Kommentar aus Sprint 3 entfernen
- Boundary-Check: an `MIN_NAVIGABLE_YM` ist `previousMonth` nicht existent → defensive `null`-Handling, Subzeile zeigt `Alles erledigt`

---

## 5. Sprint-Output-Format

Im Sprint-Review `sprints/sprint_05_review.md`:

1. **Code-Diff** (`git log --stat -n 1` des Sprint-Commits)
2. **Sanity-Check-Output**: `pnpm build`, `tsc --noEmit`, `next lint` — alle clean
3. **Architektur-Entscheidungen** (E1, E2, …): Bewusste Wahlen, die im Briefing nicht zu 100% spezifiziert waren
4. **Selbst-Review-Liste**: Alle A1–A24 abhaken (siehe §7)
5. **Smoke-Test-Ergebnisse**: Tabelle S1–S20 mit ✓/✗ + Bemerkung (siehe §8)
6. **Bundle-Grep-Output**: `chunks/app/`-Resultat (LL-4-Pattern) — keine Touch-/Swipe-Strings
7. **Production-Build-Check für Portal-Dev-Buttons** (falls implementiert): 0 Treffer in Production-Bundle
8. **DB-Verifikations-SQL** für S15 (linkFragmentToCard) + S18 (createCardFromFragment)
9. **Offene Fragen an PM**
10. **Vorschläge zur CLAUDE.md-Aktualisierung** (als Vorschlag, nicht als Ausführung)

**Commit-Reihenfolge (CLAUDE.md §7 verbindlich):**

1. Architekten-RPCs → `pnpm dlx supabase gen types typescript` → **`chore: regenerate supabase types after sprint 5 RPCs`-Commit auf `sprint/05-interaction-zone`** (separater Commit BEVOR feat-Commit)
2. Code-Implementation
3. Sanity-Checks (build, tsc, lint) — alle clean
4. **`feat: implement interaction zone with portal stub, drop flows, fragment stack (sprint 5)`-Commit**
5. Sprint-Review-Datei schreiben
6. **`docs: sprint 5 review`-Commit**
7. Push beider Commits
8. Am Session-Ende: `git status` clean, keine `??` oder `M`

---

## 6. Anti-Drift-Liste

| # | Regel | Begründung |
|---|---|---|
| A1 | **Keine eigene Sparrate- oder Card-Amount-Berechnung im Frontend.** | CLAUDE.md §7 Regel 1 |
| A2 | **Karten-Komponente (`src/components/cards/`) bleibt strukturell intakt.** Erweiterungen nur über Wrapper. | Sprint-4-Stabilität, Refactor-Risiko |
| A3 | **Portal ist Option-A-Stub.** Keine echte CSV-Verarbeitung, kein Hash, kein Distiller-Call. | Scope §0.4, Sprint 7 |
| A4 | **Drop auf Ghost Cards verboten.** `DropTargetWrapper` mit `active={false}`. | Konflikt 3 §7 |
| A5 | **5 Frequenzen inkl. „Einmalig".** | §8 explizit |
| A6 | **Budget → Attribution = ICH erzwungen.** UI versteckt die Wahl. | Constraint `budget_never_shared` |
| A7 | **ONCE → `first = last_active_month`.** | Constraint `once_is_single_month` |
| A8 | **`effective_month` und `month` immer als String** (`YYYY-MM-01`) — niemals via `new Date()`. | CLAUDE.md §7 Regel 9 |
| A9 | **Keine `localStorage`-Persistierung** von Drag-State, Portal-State, Overlay-State. | CLAUDE.md §7 |
| A10 | **Throw-on-Error in allen 2 neuen RPC-Wrappern + Server Actions.** | LL-2 |
| A11 | **Drag-State im Client mit `useEffect`-Reset auf `targetMonth`-Wechsel.** | LL-5 |
| A12 | **Overlays via `position: fixed` oder React-Portal.** Sichtbarkeit ausschließlich `useState(isOpen)`. | LL-6 |
| A13 | **Keine Sichtbarkeits-CSS an Eltern-Hover gekoppelt.** | LL-6 + Sprint-4-K2 |
| A14 | **Keine Touch/Swipe/Long-Press.** | CLAUDE.md §7 Regel 8 |
| A15 | **Keine destruktiven Aktionen jenseits Eject.** Kein Karten-Löschen, kein Forward-Beenden. | Sprint 8 |
| A16 | **Sprint-Output-Reihenfolge:** chore-types → feat → docs. | CLAUDE.md §7 |
| A17 | **`fragments_with_status` ist read-only View.** Keine INSERT-Versuche darauf. | Schema |
| A18 | **Drop wird via `dataTransfer.setData("application/x-fragment-id", id)`** — kein globaler State, keine Refs. | DnD-Best-Practice, browser-clean |
| A19 | **`linkFragmentToCard.month` = `targetMonth`**, NICHT `fragment.transaction_date`. | Konflikt 4 §7 (Periodenabgrenzung) |
| A20 | **Cards-Component nicht refactoren.** `card-interactive.tsx` darf max. 1 neue Menu-Option bekommen (Verknüpfte Fragmente). | Stabilität |
| A21 | **Drag-Hint-Subzeile unter Stack:** weglassen. | AD3 |
| A22 | **Portal-Dev-Buttons (falls implementiert):** NODE_ENV-gated, Bundle-Verifikation pflicht. | Sprint-2-Pattern |
| A23 | **Bonus-Scope linke Flanke:** TODO-Kommentare aus Sprint 3 entfernen wenn implementiert. | Saubere Code-History |
| A24 | **DB-Timezone ist UTC.** Datum-String-Konstruktion immer als `YYYY-MM-DD` (ISO), kein `Date.toString()`. | Handover §4 Sonstiges |

---

## 7. Smoke-Test-Sequenz

Browser-Smoke nach Sprint-Implementation. Test-User unverändert.

| # | Aktion | Erwartung |
|---|---|---|
| S1 | `/?month=2026-05` öffnen | Portal links, Karussell mitte mit 7 Karten + Empty-Slot, Stack rechts mit 4 sichtbaren Fragmenten (Aral 42,80 · Rewe 67,45 · Stadtwerke 28,90 · dm 15,30) + Edeka 360 € (gedimmt) |
| S2 | Linke Flanke prüfen | `April 2026 · 1 Fragment offen` (Bonus-Scope) |
| S3 | Portal: Datei via Filepicker auswählen | Sequenz: 2 s „Verarbeitung" → 1.5 s „Erfolg" → Reset zu Default |
| S4 | Portal: Datei drag&drop | Drag-Over-Visual aktiv beim Hovern; nach Drop Sequenz wie S3 |
| S5 | Portal-Dev-Buttons (falls implementiert): Klick auf „Fehler: Format" | Visual zeigt „Format nicht erkannt — bitte CSV verwenden", 4 s → Reset |
| S6 | Karussell-Chevron rechts klicken | Karten scrollen smooth um Karten-Breite |
| S7 | Karussell-Chevron rechts wiederholt klicken bis Ende | Chevron-rechts wird disabled |
| S8 | Empty-Slot klicken | Direct-Create-Overlay öffnet sich |
| S9 | Im Overlay: Typ = Budget wählen | Attribution-Auswahl verschwindet (Budget = immer ICH) |
| S10 | Im Overlay: Frequenz = Einmalig wählen, Name `Testkarte`, Betrag 50, Submit | Overlay schließt, neue „Testkarte" im Karussell sichtbar (Budget/ICH/Mai), Karussell-Sortierung: BUDGET am Ende, alphabetisch |
| S11 | Im Juni 2026 navigieren (`?month=2026-06`) | „Testkarte" mit Frequenz „Einmalig" verschwindet (nur Mai aktiv) |
| S12 | Zurück zu Mai. Fragment Aral 42,80 € draggen | Cursor wird `grabbing`, Fragment-Card dimmt leicht |
| S13 | Aral-Fragment auf Tanken-Karte droppen | Outline-Highlight beim Drag-Over, nach Drop: Tanken-Karte zeigt 42,80 € als Realität, Aral-Fragment im Stack gedimmt |
| S14 | DB-Check: `SELECT * FROM card_fragment_links WHERE fragment_id = '<aral-id>'` | 1 Row, `month = '2026-05-01'`, `origin = 'MANUAL_DROP'` |
| S15 | Tanken-Karte → ⋯-Menü öffnen | Menü zeigt: „Verknüpfte Fragmente" (neu), „Betrag anpassen" |
| S16 | „Verknüpfte Fragmente" klicken | Detail-Overlay zeigt Aral-Fragment mit ×-Button |
| S17 | × klicken | Overlay schließt (war 1 Fragment, jetzt leer), Aral-Fragment springt zurück in Stack, Tanken-Karte fällt auf Plan-Wert zurück |
| S18 | Stadtwerke-Fragment auf Empty-Slot droppen | Recurrence-Popup öffnet sich: Name vorbefüllt „Stadtwerke Frankfurt Wasser", Betrag 28,90 € read-only, Datum 12. März 2026 read-only |
| S19 | Im Popup: Typ = Fixkosten, Frequenz = Monatlich, Attribution = GEMEINSAM, Name editiert auf `Wasser`, Submit | Popup schließt, neue Karte „Wasser" im Karussell (Fixkosten/Gemeinsam/Mai-aktiv), Stadtwerke-Fragment gedimmt |
| S20 | DB-Check: `SELECT c.name, p.planned_amount, l.fragment_id FROM cards c JOIN card_planned_timeline p ON p.card_id = c.id LEFT JOIN card_fragment_links l ON l.card_id = c.id WHERE c.name = 'Wasser'` | 1 Card-Row mit `name='Wasser'`, `type='FIXED_COST'`, `attribution='GEMEINSAM'`, `frequency='MONTHLY'`, `first_active_month='2026-05-01'`; Plan-Row 28.90 €; Link-Row vorhanden |
| S21 | Navigation zu April 2026 + Mai 2026 + April + Mai (Soft-Navigation × 4) | Portal-State bleibt `default` jedes Mal (LL-5), kein hängender „Verarbeitung"-Zustand |
| S22 | Bundle-Grep: `rg "touchstart\|swipe\|longpress" .next/static/chunks/app/` | 0 Treffer |
| S23 | Bundle-Grep nach Force-Override-Strings (falls Portal-Dev-Buttons): `rg "Fehler: Format" .next/static/chunks/app/` | 0 Treffer in Production-Build |
| S24 | Production-Build mit `pnpm build && pnpm start`, Visual-Check Portal | Dev-Buttons nicht sichtbar |

---

## 8. Stolperfallen

| # | Hinweis | Mitigation |
|---|---|---|
| F1 | **DragEvent `dataTransfer` ist null auf Server-Komponenten.** | Drop-Handler nur in Client Components (`"use client"`). Server Components rendern Drop-Targets, Client-Wrapper hängt Event-Handler an. |
| F2 | **`dragenter` feuert auch auf Child-Elements** → Border flackert. | `useRef`-Counter für nested drag — increment auf enter, decrement auf leave, nur visuell aktiv wenn counter > 0 |
| F3 | **`preventDefault` MUSS auf `dragover` aufgerufen werden**, sonst feuert `drop` nicht. | In jedem Drop-Target-Handler `e.preventDefault()` zuerst |
| F4 | **`useState` für Drag-Source-ID überlebt Soft-Navigation** (LL-5). | `useEffect(() => setDragSource(null), [targetMonth])` |
| F5 | **Linked-Fragments-Overlay schließt zu früh bei letztem Eject.** | Wenn `linkedFragments.length === 0` nach Eject → Server Action returnt → revalidate → Re-Render mit count=0 → Menüpunkt „Verknüpfte Fragmente" wird ausgeblendet. Overlay sollte sich dann sauber schließen ohne mid-render Crash. |
| F6 | **Recurrence-Popup-Submit ohne Architekt-RPC** → Konstrukt fehlt. | Sprint-Start ist blockiert bis RPCs live + Types regeneriert. |
| F7 | **Karussell-Scroll mit Empty-Slot:** Empty-Slot ist 8. Karte, evtl. weiter rechts → muss in den Scroll-Bereich integriert sein, nicht außerhalb fixiert. | Empty-Slot ist genauso Flex/Grid-Child wie Karten, scrollt mit. Chevron-Disable-Logik berücksichtigt Empty-Slot als Item. |
| F8 | **Fragment-Stack vertikal scrollen vs. Drag** kollidieren auf Trackpad. | Scrollbar dezent (`3px`, §8); `draggable=true` deaktiviert nicht das Scrollen. Test bei vielen Fragmenten. |
| F9 | **Card-Wrapper-Component (`DropTargetWrapper`) ändert DOM-Hierarchie** → CSS-Selektoren in `cards.module.css` könnten brechen. | Wrapper als Server-Component-fähiges Inline-Element (`display: contents`) ODER bewusst eigener Block-Container ohne Style-Konflikte. Sprint-4-Visuals visuell prüfen nach Integration. |
| F10 | **Cross-Monat-Drop**: User in Mai-View, Fragment aus März wird auf Mai-Karte gedroppt — `link_month` muss `2026-05-01` sein, nicht `2026-03-01`. | A19 verbindlich; Tests in S13/S14. |
| F11 | **`fragments_with_status.status`-Vergleich:** String, nicht Cast. | `eq("status", "UNASSIGNED")` direkt, kein `eq("status", { type: "enum" })` |
| F12 | **`addMonths(targetMonth, -1)` an MIN_NAVIGABLE_YM-Boundary** → liefert was? | `lib/months.ts` Verhalten in Sprint 3 für Boundary geprüft, defensive `null`-Check im linke-Flanke-Render |

---

## 9. Hinweise zur Bundle-Größe

Sprint 5 fügt eine größere Client-Component-Familie hinzu (Portal, Karussell-Erweiterung, Stack, 3 Overlays). Erwartete Bundle-Erhöhung: ~40–60 KB minified. Falls deutlich höher (z. B. >100 KB): wahrscheinlich versehentlicher Server-Component-Import in Client-File oder duplicate React-Mounts. Build-Output prüfen.

---

## 10. PM-Übergabe-Notiz

**Blockierung bis Architekten-RPCs live:** Sprint 5 darf NICHT starten, bevor `create_card_direct` und `create_card_from_fragment` deployed sind und die Supabase-Types neu generiert wurden. Architekten-Auftrag wurde parallel zum Briefing erteilt.

**Wenn beim Sprint-Start beide RPCs in der Live-DB existieren UND `pnpm dlx supabase gen types typescript --project-id nflkobdfdhncrtjncpmq > src/lib/supabase/types.ts` die Funktionen sauber typed, sind die Voraussetzungen erfüllt und Sprint 5 kann starten.**

Bei Unklarheit zur §8-Spec, zur Drop-/Eject-Mechanik oder zur Recurrence-Popup-Validierung: Frage im Sprint-Output an PM eskalieren, nicht raten.

Modell-Empfehlung Sonnet 4.6. Eskalation zu Opus 4.7 wahrscheinlich bei (a) komplexen Drag&Drop-Layered-States oder (b) erneutem CSS/DOM-Coupling-Verhalten in den Overlays (LL-6/K2-Pattern).
