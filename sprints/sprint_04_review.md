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
