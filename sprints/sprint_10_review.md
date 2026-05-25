# Sprint 10 — Review

> **Komponente:** Sparraten-Treppe (§9, V5'') + Soft-Delete-Karten (§2.4, V4'')
> **Branch:** `sprint/10-treppe-soft-delete`
> **Modell:** Opus 4.7 · **Datum:** 25. Mai 2026
> **Test-User:** `179cd2c1-bbc2-4fd0-954b-8735eb90f370`

---

## 1. Commits

| Commit | Inhalt |
|---|---|
| `e2ac78a` | `sprint-10 p1: sparraten-treppe background visualization (v5'')` |
| `aeda7cd` | `chore: regenerate supabase types after toggle_card_hidden RPC` |
| `141c2f8` | `sprint-10 p2: soft-delete cards via hide menu + 5s undo toast (v4'')` |
| (dieser) | `docs: sprint 10 review + doku/claude.md patches` |

Phasen-sequenziell gemäß LL-14: Phase 1 → Smoke → Commit → Phase 2 → Smoke →
Commit → Phase 3 (docs).

## 2. Sanity-Check-Output

```
tsc --noEmit   → No errors found (0)
next lint      → ✔ No ESLint warnings or errors
next build     → ✓ Compiled successfully, 0 Errors / 0 Warnings
Route /        → 26.2 kB (Sprint 9: 22.4 kB; +3.8 kB für SVG-Treppe + Toast-Provider)
First Load JS  → 178 kB
```

## 3. Smoke-Test-Tabelle (User-Browser)

### Phase 1 — Sparraten-Treppe

| # | Erwartung | Ergebnis |
|---|---|---|
| S1 | Ring + Treppe darunter, Gold-Vorjahres-Linie bei +21.600 € | ✓ |
| S2 | März-Tooltip: +55 % monatlich · IST kum. 7.090,03 € · Plan kum. 7.070,03 € | ✓ |
| S3 | Klick März-Dot → Abweichungszeile (Treiber-Hinweis V2); 2. Klick schließt | ✓ |
| S4 | kumuliert März = Jan+Feb+März (SQL) = 7.090,03 € | ✓ |
| S5 | `/?month=2027-01` (Zukunft) → keine Vorjahres-Linie | ✓ |

### Phase 2 — Soft-Delete

| # | Erwartung | Ergebnis |
|---|---|---|
| S6 | `/?month=2026-05` Karten sichtbar, `···` unsichtbar | ✓ |
| S7 | Hover Netflix → `···` sichtbar | ✓ |
| S8 | Klick `···` → Menü „Betrag anpassen" + „Verbergen" | ✓ |
| S9 | „Verbergen" → Netflix weg + Toast unten Mitte | ✓ |
| S10 | DB: `Netflix.deleted_at` NOT NULL | ✓ (per SQL bestätigt) |
| S11 | Ring Mai vor/nach Hide unverändert (2.182,01) | ✓ |
| S12 | Treppe März vor/nach Hide unverändert (7.090,03) | ✓ |
| S13 | „Rückgängig" < 5s → Netflix zurück, Toast weg, `deleted_at = NULL` | ✓ |
| S14 | Erneut verbergen, 6s → Toast fade-out, bleibt verborgen | ✓ |
| S15 | `/?month=2026-01` → Netflix nicht im Karussell | ✓ |
| S16 | `/?month=2026-04` → Netflix nicht im Karussell | ✓ |
| S17 | Past-Month-Hide: Tanken (Ghost) in Januar verbergen | ✓ (nach Ghost-Hide-Fix) |

**S17-Korrektur (Diagnose → PM-Freigabe → Fix):** Ghost/Forecast-Karten hatten
gar kein Hide-Affordance — `CardInteractive` war in [card.tsx](../src/components/cards/card.tsx)
hinter `{!isGhost && …}` gegated. Tanken ist im Januar 2026 ein Past-BUDGET-Ghost
(`isPast && !manuallyPaid && fragmentSum===0`). Fix nach PM-Freigabe: `hideOnly`-
Modus (nur „Verbergen", kein Tap/Betrag-anpassen), `CardInteractive` auf jeder
Karte gerendert. Re-Smoke S17a–d grün.

## 4. Snapshot-Integrität (A2.9 / A2.10) — DB-verifiziert

RAISE-Rollback-Dry-Run (LL-18), Netflix `deleted_at` gesetzt:

```
mar_before=2910.01  mar_after=2910.01   (März 2026 unverändert)
may_before=2182.01  may_after=2182.01   (Mai 2026 unverändert)
```

`calculate_sparrate_for_month` ignoriert `deleted_at` per Konstruktion
(„Aggregation IGNORIERT cards.deleted_at" im RPC-Body). §4.6-Anker stabil.

## 5. UI-Filter-Anker (A2.11) — `rg "deleted_at" src/`

| Surface | Filter? | Lokalisierung |
|---|---|---|
| Karten-Karussell-Loader | **JA** `WHERE deleted_at IS NULL` | `page.tsx` (einzige `from("cards")`-Query) |
| KI-Vorschlag-Badge (`cardNameById`) | **JA** (leitet aus gefilterter Query ab) | `page.tsx` |
| Singularity Ring (Sparrate-RPCs) | **NEIN** (snapshot-integer) | `page.tsx` / `rpc.ts` |
| Sparraten-Treppe (Sparrate-RPCs) | **NEIN** (snapshot-integer) | `treppe/loader.ts` |

Kein separates `lib/cards.ts`/`lib/distiller.ts` — Karten-Loading liegt inline in
`page.tsx`. Es existiert genau **eine** `from("cards")`-Query.

## 6. Bundle-Hygiene (A3.3)

`rg "TODO Sprint 10 dev|DEV ·|Force " .next/static/chunks/app/` → **0 Treffer.**
Sprint 10 fügt keinen Dev-Helper hinzu. Die NODE_ENV-gated Ring-Dev-Panel-Strings
(Sprint 2) bleiben aus dem Production-Bundle elidiert.

## 7. Doku-Patches (LL-16)

- `sprints/sprint_10_doku_patches.md` — Design-Doku §2.4 (UI-Hide via
  `deleted_at`), §7 (Verbergen-Menü + Ghost-Hide), §9 (Vorjahres-Endwert =
  kumuliert / alle-NULL → keine Linie, Treiber V2, % monatlich Nenner, Tooling-
  Ausschluss).
- `CLAUDE_md_sprint_10_patches.md` — §4 (Sprint-10 Done), §9 (Modell-Befund),
  §10 (Sprint-10-Block), optional LL-20.

## 8. Test-Daten-Aktionen (PM-approved)

- **2025-Income-Seed:** ICH `income_timeline` 2025-01-01 (gross 36.000 / net
  1.800) — ermöglicht die Gold-Vorjahres-Linie (21.600 €) für 2026 (A1.5).
  Forward-Inheritance schattet 2025 für 2026 → §4.6-Anker unberührt (Dry-Run
  bestätigt). **Bleibt in der DB** (Sprint-11-relevant für Treppe-Tests).
- **Hide-Test-Cleanup:** nach dem Smoke alle `cards.deleted_at = NULL`
  zurückgesetzt (8/8 Karten sauber).

## 9. Offene Fragen / Quirks

1. **Treppe `%-monatlich`-Nenner** = Haushalts-Netto des jüngsten Income-Slots
   (nicht monatsgenau). V1-Vereinfachung, in §9-Patch dokumentiert. Falls
   monatsgenauer Nenner gewünscht → V2.
2. **„Treppe wird rot bei negativer Kumulation"** (§9) ist **nicht** implementiert:
   §9 nennt das Verhalten, gibt aber keine Opacity/Farb-Spec, und der Prototyp
   implementiert es nicht. Mit den Test-Daten nicht auslösbar (Kumulation immer
   positiv). Bewusst ausgelassen statt geraten (A4) — PM-Entscheidung für V1.1
   offen.
3. **Vorjahres-Linie bei datenlosem Vorjahr:** entfällt (keine 0-€-Linie). Falls
   der PM lieber eine 0-€-Linie + Label „keine Vorjahresdaten" möchte → kurzer
   Folge-Patch.

## 10. Vorschlag CLAUDE.md-§10-Block

Siehe `CLAUDE_md_sprint_10_patches.md` Patch C (vollständig formuliert).

---

*Sprint 10 Review · Antigravity Finance 1.0 · 25. Mai 2026*
