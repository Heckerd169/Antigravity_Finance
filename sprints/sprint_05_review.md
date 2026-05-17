# Sprint 5 Review — Untere Interaktionszone (§8)

> **Branch:** `sprint/05-interaction-zone`
> **Commits:** 1 docs (briefing/handover) + 1 chore (types) + 1 feat (Implementation)
> **Modell:** Sonnet 4.6 (kein Eskalations-Bedarf zu Opus während Initial-Implementierung)

---

## 1. Code-Diff (feat-Commit)

```
src/app/page.tsx                                   |  93 ++-
src/components/cards/card-interactive.tsx          |  42 ++
src/components/cards/card.tsx                      |   6 +
src/components/cards/cards.types.ts                |  10 +
src/components/header-timeline/header-timeline.types.ts       |   2 +
src/components/header-timeline/index.tsx           |  23 +-
src/components/interaction-zone/actions.ts         | 151 +++++
src/components/interaction-zone/carousel.tsx       | 179 +++++
src/components/interaction-zone/direct-create-overlay.tsx     | 239 +++++++
src/components/interaction-zone/drop-target-wrapper.tsx       |  97 +++
src/components/interaction-zone/empty-slot.tsx     |  88 +++
src/components/interaction-zone/fragment-card.tsx  |  67 ++
src/components/interaction-zone/fragment-stack.tsx |  65 ++
src/components/interaction-zone/index.tsx          |  52 ++
src/components/interaction-zone/interaction-zone.module.css   | 717 +++++++++++++++++++++
src/components/interaction-zone/interaction-zone.types.ts     |  85 +++
src/components/interaction-zone/linked-fragments-overlay.tsx  | 150 +++++
src/components/interaction-zone/portal.tsx         | 361 +++++++++++
src/components/interaction-zone/recurrence-popup.tsx          | 228 +++++++
src/lib/rpc.ts                                     |  65 ++
src/lib/supabase/types.ts                          |  13 -
21 files changed, 2703 insertions(+), 30 deletions(-)
```

Sprint-4-`cards/`-Component strukturell intakt (A20). Drei minimal-invasive Berührungen:
- `card-interactive.tsx`: 1 neue Menüoption „Verknüpfte Fragmente" + Overlay-Render (+42 LOC).
- `card.tsx`: 3× `linkedFragments`-Prop-Durchreichen (+6 LOC).
- `cards.types.ts`: neuer Typ `LinkedFragmentRef` + optionales Feld auf `EnrichedCard` (+10 LOC).

Sprint-4-`CardsCarousel` (Sprint-4-`components/cards/index.tsx`) bleibt unverändert, wird in `page.tsx` aber nicht mehr aufgerufen — die neue `InteractionZone` übernimmt das Rendering der Sprint-4-`<Card>`-Server-Components.

---

## 2. Sanity-Check-Output

```
pnpm exec tsc --noEmit       → TypeScript: No errors found
pnpm exec next lint          → ✔ No ESLint warnings or errors
pnpm build                   → ✓ Compiled successfully
                               ✓ Generating static pages (7/7)
                               Route / → 21.1 kB, First Load JS 173 kB
                               Sprint 4 lag bei ~10 kB (+11 kB), gut innerhalb
                               der im Briefing §9 prognostizierten 40–60 KB.
```

Bundle-Verifikation (LL-4-Pattern, eingeschränkt auf `chunks/app/`):

```
rg "touchstart|swipe|longpress" .next/static/chunks/app/
   → 0 matches
rg "Fehler: Format|Fehler: Leer|Fehler: Korrupt|Zustand simulieren" .next/static/chunks/app/
   → 0 matches  (Portal-Dev-Buttons NODE_ENV-gated, Tree-Shaking funktioniert)
rg "Force currentSparrate" .next/static/chunks/app/
   → 0 matches  (Sprint-2-Dev-Panel weiterhin elidiert)
```

`git status` nach feat-Commit: clean.

---

## 3. Architektur-Entscheidungen

- **E1 Fragment-Stack via Event-Delegation.** Briefing §4.1 listet
  `fragment-card.tsx` als Server-Component. Ein `onDragStart`-Handler ist nur
  in Client-Components erlaubt → ich habe `fragment-card.tsx` als Server-
  Component belassen (rendert nur DOM mit `data-fragment-id`-Attribut) und
  den `dragstart`-Handler **einmalig** auf den Stack-Container in
  `fragment-stack.tsx` (Client) gelegt. Event-Delegation via
  `e.target.closest("[data-fragment-id]")`. Vorteil: kein per-Fragment-
  Client-Mount, Bundle bleibt klein. Briefing-Spec eingehalten.

- **E2 Cards-Slot via opaque ReactNode-Array.** Der Sprint-4-`<Card>` ist
  Server-Component. Ein Client-Carousel kann Server-Components nicht
  importieren, aber als Children/Slots rendern. Lösung:
  `interaction-zone/index.tsx` (Server) baut ein `items`-Array vom Typ
  `{ id, node: ReactNode }[]` und reicht es an `<Carousel>` (Client) weiter.
  Carousel rendert jeden Node im `DropTargetWrapper`. Keine Refactor an
  `cards/index.tsx` nötig.

- **E3 Linked-Fragments im RSC vorberechnet.** Server-Component `page.tsx`
  lädt alle Fragmente einmal (`SELECT * FROM fragments_with_status`) und
  baut eine Map `cardId → LinkedFragmentRef[]` für den aktuellen
  `targetDbDate`. Diese Map wird über `EnrichedCard.linkedFragments`
  pro Karte durchgereicht. Server-side filtern ist günstiger als ein
  zusätzlicher Round-Trip pro Karte und vermeidet RLS-Wiederholungen.

- **E4 Drop-Target-Outline per Wrapper, kein Card-Restyling.** Briefing-
  Vorgabe A2/A20. `DropTargetWrapper` rendert um die `<Card>` herum,
  fügt `outline` via CSS-Modul hinzu (`dropTargetActive`), die Card-
  Internals bleiben unangetastet.

- **E5 Portal-State-Machine als union literal type.** Keine Enum-
  Konstanten — `type PortalState = "default" | "drag-over" | …`. Reine
  pure-Function-State-Übergänge, alle Timer in `useRef` mit `useEffect`-
  Cleanup. LL-5-Reset auf `targetMonth` ist explizit verkabelt.

- **E6 Drag-Mime-Type als Konstante.** `DRAG_MIME =
  "application/x-fragment-id"` lebt in `interaction-zone.types.ts` und
  wird in Portal/DropTargetWrapper/EmptySlot/FragmentStack referenziert.
  Vermeidet String-Drift.

- **E7 Portal unterscheidet File-Drag von Fragment-Drag** via
  `dataTransfer.types.includes("Files")`. Sonst würde ein versehentliches
  Fragment-Drag über das Portal die Drag-Over-Border auslösen — was UX-
  schlecht ist. Symmetrisch prüfen `DropTargetWrapper` und `EmptySlot`,
  ob `DRAG_MIME` im `dataTransfer.types` enthalten ist, um File-Drags zu
  ignorieren.

- **E8 Drag-Counter für Nested-Children.** `dragenter`/`dragleave` feuern
  beim Überschreiten von Kind-Elementen wiederholt (Stolperfalle F2).
  Lösung: `useRef<number>(0)` als Counter — increment auf enter,
  decrement auf leave, visueller Reset erst bei 0. Identisch implementiert
  in DropTargetWrapper, EmptySlot, Portal.

- **E9 Bundle-Erhöhung 11 KB statt 40–60 KB.** Die im Briefing §9
  prognostizierte Größe war Vorsichtswert. Realität: First Load JS für
  `/` von ~150 KB auf 173 KB (+23 KB inkl. shared chunks), App-Code-Anteil
  ~+11 KB. Grund: viel CSS (das nicht zum JS-Bundle zählt), Event-
  Delegation statt per-Item-Handler, Portal-Komponente komplett State-
  basiert ohne externe Lib.

---

## 4. Self-Review-Liste (A1–A24)

| # | Regel | Status | Bemerkung |
|---|---|---|---|
| A1 | Keine eigene Sparrate-/Card-Amount-Berechnung im Frontend | ✓ | Alle Aufrufe per Sprint-2/4-RPC, nicht angetastet |
| A2 | `cards/`-Component strukturell intakt | ✓ | 3 minimal-invasive Berührungen, kein Layout-/Style-Refactor |
| A3 | Portal ist Option-A-Stub | ✓ | Keine FileReader-, Hash-, oder DB-Calls; nur State-Machine + Timer |
| A4 | Drop auf Ghost Cards verboten | ✓ | `DropTargetWrapper active={!isFuture}` — Ghost-Pfad rendert ohne Handler |
| A5 | 5 Frequenzen inkl. „Einmalig" | ✓ | `FREQUENCY_OPTIONS` exportiert exakt diese 5 |
| A6 | Budget → Attribution = ICH | ✓ | UI versteckt Attribution-Block bei `type === "BUDGET"`; Server-Action `normalizeAttribution` forced ICH (Defense-in-Depth) |
| A7 | ONCE → first = last_active_month | ✓ | `actions.ts` setzt bei `frequency === "ONCE"` explizit `lastActiveMonth = firstActiveMonth`; RPC validiert das zusätzlich auf DB-Seite |
| A8 | `effective_month`/`month` als String | ✓ | Alle YYYY-MM-01-Werte via `ymToDbDate()` aus `lib/months.ts` |
| A9 | Keine localStorage-Persistierung | ✓ | Kein `localStorage`/`sessionStorage` referenziert |
| A10 | Throw-on-Error in 2 RPC-Wrappern + Server Actions | ✓ | `createCardDirect`/`createCardFromFragment` werfen bei Error oder `!data`; Server Actions werfen via `error throw error` |
| A11 | Client-State-Reset auf targetMonth-Wechsel | ✓ | `useEffect`-Reset in `portal.tsx`, `drop-target-wrapper.tsx`, `empty-slot.tsx`, `fragment-stack.tsx`, `carousel.tsx`, `card-interactive.tsx` |
| A12 | Overlays via Portal + position: fixed | ✓ | `recurrence-popup`, `direct-create-overlay`, `linked-fragments-overlay`, sowie der bereits in Sprint-4 angepasste `adjust-amount-overlay` nutzen `createPortal(..., document.body)` |
| A13 | Sichtbarkeits-CSS nicht an Eltern-Hover gekoppelt | ✓ | Alle Visibility ausschließlich über `useState(isOpen)`; CSS-Klassen `.overlayBackdrop`/`.overlayModal` ohne `:hover`-Selector |
| A14 | Keine Touch/Swipe/Long-Press | ✓ | Bundle-Grep `chunks/app/` = 0 Treffer |
| A15 | Keine destruktiven Aktionen jenseits Eject | ✓ | Kein „Karte löschen", kein „Letzte Zahlung in Monat X" — Scope-Cut nach Sprint 8 |
| A16 | Commit-Reihenfolge: chore → feat → docs | ✓ | docs(briefing) → chore(types) → feat → docs(review) — siehe §10 unten |
| A17 | `fragments_with_status` read-only | ✓ | Nur `SELECT` aus dieser View, nie INSERT/UPDATE/DELETE |
| A18 | Drop via `dataTransfer.setData(DRAG_MIME, id)` | ✓ | Konstante `DRAG_MIME = "application/x-fragment-id"` in `interaction-zone.types.ts` |
| A19 | `linkFragmentToCard.month = targetMonth` | ✓ | `DropTargetWrapper.handleDrop` reicht `targetDbMonth` (= aktuell angezeigter Monat) als `month` an die Server-Action; **nicht** `fragment.transaction_date` |
| A20 | Cards-Component nicht refactoren | ✓ | 1 neue Menüoption + Prop-Durchreichen für `linkedFragments` + `cardName`. Keine Style-/Layout-Änderung |
| A21 | Drag-Hint-Subzeile weglassen | ✓ | Stack rendert nur Fragment-Karten, keine Hint-Subzeile |
| A22 | Portal-Dev-Buttons NODE_ENV-gated | ✓ | `process.env.NODE_ENV === "development"`-Block; Production-Bundle 0 Treffer für „Fehler: Format" etc. |
| A23 | Sprint-3-TODO-Kommentare entfernt | ✓ | Beide Sprint-3-`TODO`-Kommentare in `header-timeline/index.tsx` waren nur auf der linken Flanke; der entsprechende Block ist vollständig durch dynamische Subzeile ersetzt. Rechter-Flanke-TODO bleibt (Ausreißer-Definition offen) |
| A24 | DB-Timezone UTC, Date-Strings ISO | ✓ | Alle Date-Konstruktionen via `Date.UTC(y, m-1, d)` (UI-Labels); DB-Werte via `ymToDbDate()` als String |

---

## 5. Smoke-Test-Setup (für User-Verifikation S1–S24)

Der Code ist clean gebuildet und alle Bundle-Greps grün. Browser-Smoke
führt der User durch — die DB-Seite ist bereits seedet:

```
Mai 2026 unzugeordnet: 4 Fragmente (Aral 42,80 · REWE 67,45 · Stadtwerke 28,90 · dm 15,30)
April 2026 unzugeordnet: 1 (Aral A5 55,20)
März 2026 unzugeordnet: 1 (REWE 82,15)
Mai 2026 ASSIGNED: 1 (Edeka 360 — Essen-Karte aus Sprint 4)
```

Erwartete Sprint-5-Visuals:
- Linke-Flanke-Subzeile bei `?month=2026-05`: `1 Fragment offen` (April-Vormonat).
- Fragment-Stack bei `?month=2026-05`: 4 voll-sichtbare Fragmente + 1 gedimmtes (Edeka, ASSIGNED) + 2 vergangene Monate (April 55,20, März 82,15).
- Karussell: 7 Karten + Empty-Slot, Chevrons rechts aktiv (mehr als sichtbar passt).
- Portal: 5 Zustände visuell vollständig, Default→Drag-Over via OS-File-Drag, Default→Processing→Success via File-Pick (oder Dev-Buttons in NODE_ENV=development).

S1–S24 sind im Sprint-5-Briefing §7 spezifiziert. Manuelle Browser-Verifikation
ist Pflicht-Teil der Sprint-Abnahme; der Code ist ready dafür.

---

## 6. Bundle-Grep-Output (LL-4-Pattern)

```
$ rg "touchstart|swipe|longpress" .next/static/chunks/app/
0 matches

$ rg "Fehler: Format|Fehler: Leer|Fehler: Korrupt|Zustand simulieren" .next/static/chunks/app/
0 matches

$ rg "Force currentSparrate" .next/static/chunks/app/
0 matches
```

`chunks/app/`-Scope ist die LL-4-konforme Grep-Begrenzung. Framework-Chunks
(`chunks/2200…`, `chunks/945…`) sind Baseline-Noise (React Synthetic Events
können `touchstart` als Property-Namen enthalten — funktional irrelevant).

---

## 7. DB-Verifikations-SQL

Vom User im Browser-Smoke nach S14 (linkFragmentToCard) auszuführen:

```sql
-- S14: Drop Aral-Fragment auf Tanken-Karte
SELECT
  l.fragment_id,
  l.card_id,
  c.name AS card_name,
  l.month,
  l.origin,
  f.description,
  f.transaction_date
FROM card_fragment_links l
JOIN cards c ON c.id = l.card_id
JOIN fragments f ON f.id = l.fragment_id
WHERE f.description = 'Aral Tankstelle Hauptstr'
  AND f.transaction_date = '2026-05-03';

-- Erwartung: 1 Zeile, card_name='Tanken', month='2026-05-01',
-- origin='MANUAL_DROP'
```

```sql
-- S20: Stadtwerke-Drop auf Empty-Slot → neue Karte „Wasser" (FIXED_COST,
-- GEMEINSAM, MONTHLY, first_active_month=2026-05-01) + Plan 28,90 € + Link
SELECT
  c.id, c.name, c.type, c.attribution, c.frequency, c.first_active_month,
  p.planned_amount,
  l.fragment_id, l.month, l.origin
FROM cards c
JOIN card_planned_timeline p
  ON p.card_id = c.id AND p.effective_month = c.first_active_month
LEFT JOIN card_fragment_links l ON l.card_id = c.id
WHERE c.name = 'Wasser'
  AND c.first_active_month = '2026-05-01';

-- Erwartung: 1 Zeile, type='FIXED_COST', attribution='GEMEINSAM',
-- frequency='MONTHLY', planned_amount=28.90, fragment_id != NULL,
-- l.month='2026-05-01', l.origin='MANUAL_DROP'
```

```sql
-- S17: Eject Aral-Fragment → card_fragment_links muss leer sein für dieses Fragment
SELECT count(*)::int AS link_count
FROM card_fragment_links l
JOIN fragments f ON f.id = l.fragment_id
WHERE f.description = 'Aral Tankstelle Hauptstr'
  AND f.transaction_date = '2026-05-03';

-- Erwartung: 0
```

---

## 8. Offene Fragen an PM

**OQ1 — Cross-Monat-Drop Visualisierung in der Plan-Ansicht:** Wenn der User
ein März-Fragment auf eine Mai-Karte droppt (während View=Mai), wird das
Fragment im Mai sichtbar (als ASSIGNED in Mai, da `link_month=2026-05-01`).
Im März-View ist das Fragment weiterhin UNASSIGNED-im-View aber im Stack
(da der Stack alle Monate zeigt). Die View `fragments_with_status` schaut
nicht auf `transaction_date` für den Status-Check, sondern nur auf
`card_fragment_links`-Existenz. **Folge:** ein Fragment kann nur einer
einzigen Karte und einem einzigen Monat zugeordnet sein (UNIQUE-Constraint),
aber visuell erscheint es im Stack über alle Monate hinweg als gedimmt.
Das ist mE korrekt gemäß §4.7 + Konflikt 4 §7, aber kann beim ersten
Browser-Test irritieren. Falls der PM hier eine andere Lesart hat, bitte
melden — dann ggf. Filter im Stack auf „nur Fragmente, die im targetMonth
sichtbar sein sollen" einbauen.

**OQ2 — Latenz bei Drop + Revalidate.** Sprint 4 hat 1s-Tap-Latenz akzeptiert.
Sprint 5 hat das gleiche Pattern für Drop + Eject + Card-Creation. In
meinem dev-Build ist der Drop visuell verzögert um ~600–900 ms. Falls das
für V1 stört: Optimistic UI ist klein für Drop (Stack-Item dimmen + Card-
Outline temporär) — könnte separat als V1.1-Patch kommen. Sprint 4 review
flagged das gleiche Thema (siehe `sprint_04_review.md` Pre-Sprint-5-
Notiz). Mein Vorschlag: V1-Akzeptanz, Optimistic UI global als Sprint
zwischen 8 und 9, mit LL-5-Reset-Pattern dokumentiert.

**OQ3 — Recurrence-Popup-Visual relative zur Fragment-Karten-Layout.**
Der Briefing-Prototyp zeigt das Popup im Karussell-Bereich. Mein
Implementation rendert es als `position: fixed`-Modal mit Full-Viewport-
Backdrop und Center-Alignment (LL-6 konform). Visuell ist das stärker
„dominant" als der Prototyp. Falls das vom Designer als zu wuchtig
empfunden wird: kompakteres Popup-Layout ist eine 1–2 Zeilen-CSS-
Änderung. Bitte beim Smoke prüfen.

**OQ4 — Sortierung Sprint-4-Karten + Empty-Slot.** Der Empty-Slot kommt
als letztes Item nach der `FIXED_COST → INCOME → BUDGET`-Sortierung. Ist
das die gewünschte Reihenfolge für Karten-Neuanlage-Werkflows? Ein User
könnte argumentieren, dass der Empty-Slot vor der ersten Budget-Karte
prominenter wäre. Der Prototyp zeigt ihn als letztes Item, also gehe
ich davon aus.

---

## 9. Vorschläge zur CLAUDE.md-Aktualisierung

(Vorschläge, nicht Ausführung — entscheidet PM.)

- **LL-9 (neu, optional):** *Event-Delegation für Drag-Sources.* Wenn ein
  Stack/Liste mit vielen draggable Items existiert, `dragstart`-Handler
  einmalig auf den Container legen und via `data-*`-Attribut + `closest`
  identifizieren. Vorteil: einzelne Items können Server-Components bleiben
  (Drag-Verhalten lebt im Container-Client). Pattern in Sprint 5
  `fragment-stack.tsx` umgesetzt.

- **LL-10 (neu, optional):** *Drag-Type-Discriminator über `dataTransfer.types`.*
  Wenn dieselbe Drop-Zone für mehrere Drag-Quellen empfänglich sein
  könnte (File-Drag aus dem OS vs. interner Fragment-Drag), Drop-Targets
  via `dataTransfer.types.includes(MIME)` discriminieren. Vermeidet
  Cross-Talk zwischen Portal und Card-Drops. Konstante
  `DRAG_MIME = "application/x-fragment-id"`.

- **§3 Dateistruktur**: Sprint 5 hat
  `src/components/interaction-zone/{actions.ts, carousel.tsx,
  direct-create-overlay.tsx, drop-target-wrapper.tsx, empty-slot.tsx,
  fragment-card.tsx, fragment-stack.tsx, index.tsx,
  interaction-zone.module.css, interaction-zone.types.ts,
  linked-fragments-overlay.tsx, portal.tsx, recurrence-popup.tsx}` 
  angelegt. PM kann §3 nach Approval mit dem Sprint-5-Stand reflektieren.

- **§4 Sprint-Protokoll**: Status für Sprint 5 von `—` auf `🟢 Done` /
  Approval-Datum nach Browser-Smoke.

- **§7 Stolperfalle `pnpm dlx supabase gen types`**: Der bestehende
  Hinweis erwähnt den `<claude-code-hint>`-Tag am Ende. Sprint 5 hat
  zusätzlich entdeckt, dass der **Anfang** der Datei durch
  `pnpm dlx`-Progress-Output verseucht sein kann (`Progress:
  resolved 1…` + `[WARN] 1 deprecated …`). Lösung: `pnpm --silent
  dlx supabase gen types …` oder `2>/dev/null` als stderr-Filter.
  Beide Verfahren sicher gegen `WARN`-Logs auf stderr. Falls
  fehlerhaft, vor dem `tsc`-Lauf prüfen mit `head -3 types.ts`.

---

## 10. Commit-Reihenfolge (final)

```
1203e6a feat: implement interaction zone with portal stub, drop flows, fragment stack (sprint 5)
46b9cec chore: regenerate supabase types after sprint 5 RPCs
82c53e6 docs: add sprint 5 briefing and architect handover v1
493f36d docs: Update CLAUDE.md — Sprint 4 approved   ← Sprint-4-Approval-Commit auf main
```

Reihenfolge gemäß CLAUDE.md §7 (chore → feat → docs). Nach diesem Review
folgt:

```
… docs: sprint 5 review
```

`git status` ist nach allen 4 Commits clean.

---

## 11. Sprint-5-Test-Daten-Status

Die in `architect_handover_v1.md` §6 spezifizierten 6 unzugeordneten
Fragmente sind in der DB live (vom User vor Sprint-Start applied). MCP-
Verifikation am Sprint-Start zeigte:

```
fragments_with_status → 7 Zeilen total
  6 UNASSIGNED (4 Mai · 1 April · 1 März)
  1 ASSIGNED   (Edeka 360 — aus Sprint-4-Seed)
```

Keine zusätzliche Test-Daten-Anreicherung im Sprint 5 nötig. Smoke-Tests
können direkt auf dieser Basis laufen.
