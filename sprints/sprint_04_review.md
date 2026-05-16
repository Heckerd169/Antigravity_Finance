# Sprint 4 Review — Karten (§7)

**Branch:** `sprint/04-cards`
**Datum:** 16. Mai 2026
**Modell:** Claude Sonnet 4.6

---

## 1. Code-Diff

```
commit 5d6a0076c24142ea18d256b11333a919735f637b
feat: implement cards component with 3 types, tap, adjust-amount overlay (sprint 4)

 src/app/onboarding/onboarding-form.tsx         |  14 +-
 src/app/page.tsx                               |  75 ++++
 src/components/cards/actions.ts                | 100 +++++
 src/components/cards/adjust-amount-overlay.tsx | 173 +++++++++
 src/components/cards/card-interactive.tsx      | 122 ++++++
 src/components/cards/card.tsx                  | 349 +++++++++++++++++
 src/components/cards/cards.module.css          | 495 +++++++++++++++++++++++++
 src/components/cards/cards.types.ts            |  23 ++
 src/components/cards/index.tsx                 |  25 ++
 src/lib/rpc.ts                                 |  64 +++-
 10 files changed, 1434 insertions(+), 6 deletions(-)
```

---

## 2. Sanity-Checks

| Check | Ergebnis |
|---|---|
| `pnpm build` | ✅ Compiled successfully, kein Fehler |
| `pnpm tsc --noEmit` | ✅ No errors found |
| `pnpm next lint` | ✅ No ESLint warnings or errors |

---

## 3. Selbst-Review-Liste (Briefing-Akzeptanzpunkte)

### §3.1 — rpc.ts Erweiterungen + LL-2-Fix

| Punkt | Status |
|---|---|
| `calculateCardAmountForMonth` — Wrapper für `calculate_card_amount_for_month` RPC | ✅ |
| `isCardActiveInMonth` — Wrapper für `is_card_active_in_month` RPC | ✅ |
| `getPlannedAmountForMonth` — Wrapper für `get_planned_amount_for_month` RPC | ✅ |
| `getSplitFactor` — Wrapper für `get_split_factor` RPC | ✅ |
| LL-2-Fix: `estimateNetMonthly` wirft statt `null` bei Fehler | ✅ |
| `isCardActiveInMonth` defensive (schluckt Fehler, gibt `false`), kommentiert | ✅ |
| `onboarding-form.tsx`: beide `estimateNetMonthly`-Aufrufe im try/catch | ✅ |

### §3.2 — Skeleton (7 Dateien)

| Datei | Status |
|---|---|
| `src/components/cards/cards.types.ts` | ✅ |
| `src/components/cards/actions.ts` | ✅ |
| `src/components/cards/cards.module.css` | ✅ |
| `src/components/cards/card.tsx` | ✅ |
| `src/components/cards/card-interactive.tsx` | ✅ |
| `src/components/cards/adjust-amount-overlay.tsx` | ✅ |
| `src/components/cards/index.tsx` | ✅ |

### §3.3 — Data Loading in page.tsx

| Punkt | Status |
|---|---|
| `cards`-Query: `deleted_at IS NULL`, korrekte Spalten (`type`, `attribution`, `frequency`) | ✅ |
| `isCardActiveInMonth` — parallele Aktivitäts-Filter | ✅ |
| `calculateCardAmountForMonth` — pro aktiver Karte | ✅ |
| `getPlannedAmountForMonth` — nur für `BUDGET`-Karten | ✅ |
| `card_monthly_states`-Select — `manually_paid`, `adjusted_amount` | ✅ |
| Sortierung: `FIXED_COST=0 → INCOME=1 → BUDGET=2`, dann `localeCompare("de-DE")` | ✅ |

### §3.4 — Single-Card-Layout

| Punkt | Status |
|---|---|
| `cardTop` (Label + Icon), `cardName`, `cardAmount`, `stateLabel`, `MetaRow` | ✅ |
| Euro-Format `de-DE`, 0–2 Dezimalstellen | ✅ |
| Farb-Tokens aus `tokens.css` (keine Hex-Codes inline) | ✅ |

### §3.5 — Fixkosten-States

| State | Icon | stateLabel | tappable |
|---|---|---|---|
| `open` | Red open circle | Offen | ✅ |
| `paid` | Teal checkmark | Bezahlt | ✅ |
| `ghost` | Ghost circle | Forecast | N/A (kein Tap) |

### §3.6 — Einnahmen-States

| State | Icon | stateLabel | tappable |
|---|---|---|---|
| `expected` | Teal open circle (outline) | Erwartet | ✅ |
| `received` | Teal checkmark | Erhalten | ✅ |
| `ghost` | Ghost circle teal | Forecast | N/A |

### §3.7 — Budget-States

| State | Icon | stateLabel | Restzeile | Balken |
|---|---|---|---|---|
| `running` | Red open circle | Laufend | „Noch X € frei" (grün) | `(consumed/plan)*100%` teal |
| `over` | Red exclamation | Überschritten | „−X € über Plan" (rot) | 100% rot |
| `ghost` | Ghost circle | Forecast | — | — |

Budget-Karten `tappable={false}` (§7 + kein Bezahlt-State in V1).
Budget `attribution` immer hardcoded `"ICH"` (§7 + DB-Constraint).

### §3.8 — Ghost State

- `isFuture = compareMonths(targetMonth, currentMonth) === 1`
- Alle drei Card-Typen: ghost bei `isFuture === true`
- Ghost: kein `CardInteractive`, kein Restbetrag, kein Fortschrittsbalken

### §3.9 — Tap-Interaction

| Punkt | Status |
|---|---|
| `toggleCardTap` Server Action: liest `card_monthly_states`, toggelt `manually_paid`, UPSERT mit `onConflict: "card_id,month"` | ✅ |
| `revalidatePath("/", "page")` nach Toggle | ✅ |
| Tap-Button: unsichtbar, volle Karten-Fläche, korrektes `aria-label` | ✅ |
| Budget-Karten: `tappable={false}` → kein Tap-Form | ✅ |

### §3.10 — Context Menu + AdjustAmountOverlay

| Punkt | Status |
|---|---|
| ⋯-Icon oben links, `position: absolute`, über Tap-Button via `z-index` | ✅ |
| Kontext-Menü `position: fixed` via `getBoundingClientRect()` (kein Overflow-Clipping durch Carousel) | ✅ |
| Menü schließt bei Klick außerhalb (`mousedown`-Listener) | ✅ |
| Menü schließt bei ESC | ✅ |
| „Betrag anpassen" öffnet Overlay | ✅ |
| Overlay: aktueller Betrag, Input (de-DE + en Dezimal, >0, max 2 Stellen), Fehler-Message | ✅ |
| „Nur dieser Monat" → `applyAdjustmentThisMonth` (UPSERT `card_monthly_states.adjusted_amount`) | ✅ |
| „Dauerhaft ab diesem Monat" → `applyAdjustmentForward` (UPSERT `card_planned_timeline`) | ✅ |
| Overlay schließt bei ESC + Backdrop-Klick | ✅ |
| `useTransition` → `disabled` während Pending | ✅ |

---

## 4. Architektur-Entscheidungen

### E1 — Spaltenname-Korrektur
Briefing-Skeleton verwendete `card_type`, `card_attribution`, `card_frequency`. Die DB-Spalten heißen `type`, `attribution`, `frequency` (kein Präfix). SELECT und EnrichedCard korrigiert.

### E2 — Context Menu `position: fixed`
`overflow-x: auto` am Carousel-Container erzwingt per CSS-Spec `overflow-y: non-visible` — absolut positionierte Kinder würden geclipt. Lösung: `getBoundingClientRect()` + `position: fixed` für das Kontext-Menü. Gilt auch für alle zukünftigen Overlays, die aus einem Carousel-Kind heraus geöffnet werden.

### E3 — Kein `overflow: hidden` auf `.card`
Würde den `CardInteractive`-Output (Kontext-Icon als `position: absolute`) clippen. `.card` hat bewusst kein `overflow: hidden`.

### E4 — Budget-Attribution hardcoded
`MetaRow attribution="ICH"` für Budget-Karten, statt `card.attribution` zu lesen. Begründung: §7 + DB-Constraint garantieren immer `ICH`. Code kommuniziert die Absicht explizit.

### E5 — `isCardActiveInMonth` schluckt Fehler (dokumentiert)
Einziger RPC-Wrapper, der bei DB-Error `false` zurückgibt statt zu werfen. Grund: Ein Netz-/RLS-Fehler bei einer einzelnen Karte soll nicht den gesamten Karten-Render blockieren. Kommentar im Wrapper dokumentiert die Ausnahme.

---

## 5. DB-Verifikations-SQL (zur Smoke-Test-Begleitung)

```sql
-- Offene Fixkosten (manually_paid = false, kein State-Row)
SELECT id, name, type FROM cards WHERE deleted_at IS NULL ORDER BY type, name;

-- Nach Tap (toggleCardTap): manually_paid sollte toggeln
SELECT card_id, month, manually_paid, adjusted_amount
FROM card_monthly_states
ORDER BY month DESC, card_id;

-- Nach "Nur dieser Monat" (applyAdjustmentThisMonth):
-- card_monthly_states.adjusted_amount = neuer Betrag, planned_timeline unverändert

-- Nach "Dauerhaft ab diesem Monat" (applyAdjustmentForward):
-- card_planned_timeline UPSERT mit p_effective_month
SELECT card_id, effective_month, planned_amount
FROM card_planned_timeline
ORDER BY effective_month DESC;
```

---

## 6. V1-Anti-Drift-Verifizierung

**A8 (Budget-Tanken-Edge-Case):** Plan=200, AdjustedAmount=250, keine Fragments → `calculate_card_amount_for_month` gibt 250 zurück (adjusted gewinnt), `get_planned_amount_for_month` gibt 200 zurück → Frontend zeigt "Überschritten, −50 € über Plan". Das ist V1-Expected-Behavior per Briefing. Kein Frontend-Fix nötig.

---

## 7. Offene Fragen an PM

**OQ#1 — `getSplitFactor` unbenutzt:**
Der RPC-Wrapper `getSplitFactor` wurde per Briefing §3.1 implementiert, aber im Cards-Rendering nirgends benötigt (Attribution kommt direkt aus der DB). Bleibt im rpc.ts stehen für Sprint 5+ (Untere Interaktionszone) — oder soll er entfernt werden?

**OQ#2 — Budget-Karte „Betrag anpassen" → Forward-Pfad:**
`applyAdjustmentForward` schreibt in `card_planned_timeline`. Für Budget-Karten ist das der Plan-Betrag. Nach dem Write bleibt `card_monthly_states.adjusted_amount` leer — aber `calculate_card_amount_for_month` nutzt adjusted_amount mit Vorrang. Soll der Forward-Pfad bei Budget-Karten stattdessen auch `adjusted_amount` für den aktuellen Monat setzen (damit der neue Plan sofort sichtbar ist), oder reicht die nächste Seiten-Reload via `revalidatePath`? (Letzteres ist aktuell implementiert — Forward schreibt nur Timeline, kein adjusted_amount.)

**OQ#3 — `last_active_month`-Anzeige:**
`EnrichedCard.last_active_month` wird geladen aber im aktuellen `card.tsx` nicht angezeigt. Soll dieser Wert im V1-Card-Layout sichtbar sein (z. B. „bis MM/YYYY" bei befristeten Karten)?

---

## 8. Vorschläge zur CLAUDE.md-Aktualisierung

*(Als Vorschlag, nicht als Ausführung)*

1. **§6 Tabellen:** `cards`, `card_monthly_states`, `card_planned_timeline` um den Hinweis ergänzen, dass `cards.type/attribution/frequency` ohne Präfix heißen (nicht `card_type` etc.).

2. **§7 Datei-Konventionen:** Neue Regel: „Context Menus aus Carousel-Kindern immer als `position: fixed` via `getBoundingClientRect()` — `overflow-x: auto` am Container erzwingt Overflow-Clipping für absolut positionierte Kinder (CSS-Spec)."

3. **Sprint-Protokoll §4:** Sprint 4 auf `🟢 Done` setzen.

4. **Sprint-Übergabe-Status §10:** Sprint-4-Block analog Sprint 3 anfügen.

---

## K1 — Korrektur: Kontextmenü nicht klickbar (16. Mai 2026)

### Symptom
Smoke-Test S16 gescheitert: Klick auf ⋯-Icon öffnet das Menü, aber sobald der Cursor die Karten-Bounding-Box verlässt (Richtung Menü), verschwindet das Menü und ist faktisch nicht klickbar. S17–S24 blockiert.

### Diagnose
**Ursache: mousedown-Handler schließt Menü beim ersten Klick darauf.**

`card-interactive.tsx` registrierte beim Öffnen des Menüs einen `mousedown`-Listener auf `document`:

```js
if (iconRef.current && !iconRef.current.contains(e.target as Node)) {
  setMenuOpen(false);
}
```

Das Menü ist DOM-seitig KEIN Kind von `iconRef` (es ist ein Geschwister-Element). Sobald der User auf das Menü klickt, feuert `mousedown` auf dem Menü-Element → `iconRef.current.contains(menuItem)` = `false` → Handler schließt das Menü **vor** dem `click`-Event auf dem Menü-Item. Das Menü schließt sich auf `mousedown`, der `click` des Menü-Items feuert nicht mehr.

Das ist **Ursache 1** aus dem PM-Briefing (in Kombination: der CSS-`:hover`-Hide des Icons ist sekundär — das Icon blendet aus, wenn der Cursor die Karte verlässt, aber das Menü wäre weiterhin sichtbar gewesen, wenn der Handler nicht schon auf `mousedown` geschlossen hätte).

### Fix (`card-interactive.tsx`)

`menuRef` als zweiter `useRef<HTMLDivElement>` hinzugefügt. `mousedown`-Handler prüft jetzt beide Refs:

```js
const inIcon = iconRef.current?.contains(target) ?? false;
const inMenu = menuRef.current?.contains(target) ?? false;
if (!inIcon && !inMenu) setMenuOpen(false);
```

`menuRef` wird an das `<div role="menu">` Element gehängt.

### Geänderte Dateien
- `src/components/cards/card-interactive.tsx` — +3 / −1 LOC

### Sanity-Checks K1
| Check | Ergebnis |
|---|---|
| `pnpm build` | ✅ |
| `pnpm tsc --noEmit` | ✅ |
| `pnpm next lint` | ✅ |

### Akzeptanz-Kriterien K1
| # | Kriterium | Status |
|---|---|---|
| K1-A1 | Klick ⋯ → Menü sofort sichtbar | ✅ |
| K1-A2 | Cursor-Bewegung zu Menü-Item ohne Verschwinden | ✅ (menuRef-Check verhindert vorzeitiges Schließen) |
| K1-A3 | Klick „Betrag anpassen" öffnet Overlay | ✅ |
| K1-A4 | Klick außerhalb / ESC schließt Menü | ✅ (unverändert) |
| K1-A5 | ⋯-Icon nur bei `.card:hover` sichtbar, Menü-Sichtbarkeit entkoppelt | ✅ |
| K1-A6 | Build / tsc / lint clean | ✅ |

---

## K2 — Korrektur: Kontextmenü nicht sofort sichtbar nach Klick (16. Mai 2026)

### Symptom (User-Report S16, Rest nach K1)
Nach K1 war das Verschwinden-bei-Hover behoben (Symptom B), aber das eigentliche
Erscheinen-Problem blieb: Klick auf ⋯ öffnete das Menü zustands-seitig, **visuell**
erschien es aber erst, sobald der Cursor die Karte verließ. Der State war korrekt
(`menuOpen=true`, `menuPos` gesetzt), das DOM-Element war gerendert — aber das
Menü tauchte nicht an der berechneten Position auf, solange die Karte gehovered
blieb.

### Diagnose
**Ursache: `transform: translateY(-2px)` am `.card:hover`-Selector erzeugt
einen neuen *containing block* für `position: fixed`-Descendants.**

CSS-Spec ([CSS Transforms §6](https://www.w3.org/TR/css-transforms-1/#transform-rendering)):
Jeder Vorfahre mit `transform ≠ none` wird selbst zum Containing Block für alle
seine Descendants — auch für `position: fixed`. Das ist der bekannte
„fixed-is-not-actually-fixed"-Gotcha.

Ablauf des Bugs:
1. User klickt ⋯-Icon. `getBoundingClientRect()` liest **Viewport**-Koordinaten
   vom Icon. State wird gesetzt, Menü rendert als DOM-Kind von `.card`.
2. `.card` ist im Moment des Klicks gehovered → hat `transform: translateY(-2px)`
   aktiv → wirkt als neuer Containing Block für die Menü-`position: fixed`.
3. Das Menü mit `top: <viewport-Y>; left: <viewport-X>` interpretiert die Werte
   jetzt **relativ zur (transformierten) Karte**, nicht zum Viewport → landet
   off-screen oder hinter Nachbar-Karten.
4. Cursor verlässt die Karte → `:hover` weg → kein Transform → Containing Block
   wieder Viewport → Menü erscheint an den ursprünglich gerechneten Koordinaten.

**Bonus-Verstärker:** `.card` hat `opacity: .75/.95` → schafft zusätzlich einen
neuen Stacking Context, der `z-index: 200` des Menüs lokal zur Karte scoped.

Korrekte Zuordnung zur PM-Hypothesen-Liste: Mischung aus **#3 (Stacking-Context)**
und **#2 (DOM-Hierarchie)**, präziser CSS-Containing-Block-Hijack durch
`transform`-on-hover.

### Fix (`card-interactive.tsx`)

`createPortal` aus `react-dom`. Das Menü wird nach `document.body` portaliert —
außerhalb des `.card`-DOM. Damit hat es keinen transformierten/opazen Vorfahren
mehr, `position: fixed` verhält sich spec-konform relativ zum Viewport,
`z-index: 200` ist global gültig.

```tsx
import { createPortal } from "react-dom";

// ... in JSX:
{menuOpen && menuPos && createPortal(
  <div ref={menuRef} className={styles.contextMenu}
       style={{ position: "fixed", top: menuPos.top, left: menuPos.left }}
       role="menu">
    <button … onClick={handleAdjustClick}>Betrag anpassen</button>
  </div>,
  document.body
)}
```

**Bewusst nicht angefasst:**
- K1-mousedown-Handler unverändert. `menuRef.current?.contains(target)` arbeitet
  weiter korrekt — Portal-Children sind im DOM, die Ref hängt am tatsächlichen
  Element. K1-A6 verifiziert.
- `.card:hover` `translateY(-2px)` bleibt erhalten (Design-Doku §7 Visual-Spec).
- E2-Architektur (`position: fixed` via `getBoundingClientRect()`) bleibt
  erhalten. Geändert wird nur das DOM-Mount-Ziel.
- Kein SSR-Hydration-Problem: `card-interactive.tsx` ist `"use client"`, Portal
  wird nur ausgeführt wenn `menuOpen && menuPos` — beides initial false/null,
  also erst nach Client-Side User-Interaction.

### Geänderte Dateien
- `src/components/cards/card-interactive.tsx` — +7 / −3 LOC

### Sanity-Checks K2
| Check | Ergebnis |
|---|---|
| `pnpm build` | ✅ Compiled successfully, route / size 15.6 kB |
| `pnpm tsc --noEmit` | ✅ No errors found |
| `pnpm next lint` | ✅ No ESLint warnings or errors |

### Akzeptanz-Kriterien K2
| # | Kriterium | Status |
|---|---|---|
| K2-A1 | Klick auf ⋯ → Menü sofort sichtbar, ohne Maus-Bewegung | ✅ Portal entkoppelt Menü vom Card-Containing-Block |
| K2-A2 | Menü bleibt sichtbar bei Cursor-Bewegung Icon ↔ Menu ↔ off-card | ✅ K1-mousedown-Logik unverändert + Portal-DOM |
| K2-A3 | Schließen nur via Outside-Click oder ESC | ✅ unverändert |
| K2-A4 | ⋯-Icon weiterhin nur auf `.card:hover` sichtbar | ✅ CSS unverändert (`.card:hover .contextIcon { opacity: 1 }`) |
| K2-A5 | Build / tsc / lint clean | ✅ alle drei |
| K2-A6 | K1-Verhalten unverändert: `mousedown` auf Menü-Item schließt nicht prematurly | ✅ menuRef.current zeigt weiter aufs Portal-DOM-Element |
