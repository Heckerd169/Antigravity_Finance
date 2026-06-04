# Sprint 10 — Sparraten-Treppe + Soft-Delete-Karten

> **Adressiert an:** Claude Code (Implementierungs-Chat)
> **Vom:** PM-Chat Sprint 10
> **Datum:** 24. Mai 2026
> **Test-User:** `179cd2c1-bbc2-4fd0-954b-8735eb90f370`
> **Branch:** `sprint/10-treppe-soft-delete`
> **Modell-Empfehlung:** Sonnet 4.6

---

## 0. Sprint-Ziel — eine Zeile

Sparraten-Treppe (Hintergrund-Visualisierung) und Soft-Delete-Geste für Karten (UI-Hide via `deleted_at`) als zwei sequenzielle Phasen liefern (LL-14).

---

## 1. Scope

### Phase 1 — V5'' Sparraten-Treppe (§9 Design-Doku)

| # | Lieferung |
|---|---|
| L1.1 | Neue Komponente `src/components/treppe/` mit Canvas-basiertem Rendering (Prototyp ist Canvas — wenn React/SVG einfacher passt, alternativ — Visual-Output muss identisch sein) |
| L1.2 | Daten-Loader: 12 Monate × (`calculate_sparrate_for_month` + `calculate_planned_sparrate_for_month`) via `Promise.all`, plus Vorjahres-Dezember-Wert |
| L1.3 | Vorjahres-Endwert-Linie (gold, gestrichelt) — Dezember-Wert des Vorjahres |
| L1.4 | Hover-Tooltip (Monatsname + % monatlich + Ist kumuliert + Plan kumuliert + ⚠ falls Ereignis) |
| L1.5 | Klick auf Teal-Punkt: kompakte Abweichungs-Erklärungszeile unter Chart (V1: bis zu 3 Treiber; falls keine Treiber-Heuristik im Backend, dann „Treiber-Hinweis: V2") |
| L1.6 | Visual-Spec aus §9 (siehe §4 dieses Briefings) |
| L1.7 | Position: Hintergrund-Element der Hauptseite, unter dem Singularity Ring |

### Phase 2 — V4'' Soft-Delete-Karten (§2.4 erweitert + neue UI-Geste)

| # | Lieferung |
|---|---|
| L2.1 | Dreipunkt-Menü (`⋯`) rechts oben in jeder Karte, sichtbar bei Karten-Hover |
| L2.2 | Drop-Menü mit Eintrag „Verbergen" (in V1 der einzige Eintrag; UI-Strukturierung erweiterbar in V2) |
| L2.3 | Klick „Verbergen" → Server-Action ruft RPC `toggle_card_hidden(card_id, true)` + `revalidatePath` |
| L2.4 | 5s-Rückgängig-Toast unten Mitte: `Karte »<name>« ausgeblendet — Rückgängig` |
| L2.5 | Rückgängig-Klick innerhalb 5s → Server-Action `toggle_card_hidden(card_id, false)` + `revalidatePath`, Toast schließt sofort |
| L2.6 | UI-Filter `WHERE deleted_at IS NULL` an allen Karten-Surfaces (siehe §3) |
| L2.7 | Past-Month-Verbergen ist erlaubt, keine Sperre |

### Phase 3 — Doku-Patches (LL-16)

| # | Lieferung |
|---|---|
| L3.1 | `sprints/sprint_10_doku_patches.md` — Patches für Design-Doku §2.4 (Soft-Delete-UI-Hide-Erweiterung) + §7 (Dreipunkt-Menü an Karten) + §9 (falls Treppen-Implementierung Spec-Punkte präzisiert) |
| L3.2 | `CLAUDE_md_sprint_10_patches.md` — Patches für CLAUDE.md §10 (Sprint-10-Block) + §9 (Modell-Empfehlung-Befund) |

### Out of Scope (V2-Vormerkungen)

| # | Verschoben |
|---|---|
| V2 | „Versteckte Karten verwalten / wieder einblenden"-UI-Pfad (Settings, Overlay) — bewusst V2 |
| V2 | Bestätigungs-Dialog vor dem Verbergen — bewusst V1 = direkt + 5s-Rückgängig |
| V2 | Treppe-Multi-Year-Rolling-Window — V1 zeigt Kalenderjahr |
| V2 | Treppen-Klick-Abweichungs-Treiber-Heuristik im Backend (falls nicht implementiert) |

---

## 2. Architekten-Vorbedingung — LIVE seit 24.05.2026

| Lieferung | Stand |
|---|---|
| V7'' Defense-in-Depth-Patch `calculate_card_amount_for_month` | ✓ live (INTERNAL_TRANSFER ausgeschlossen) |
| C.2-Migration `calculate_sparrate_for_month` | ✓ live (kein `deleted_at`-Filter — snapshot-integer) |
| C.2-Migration `calculate_planned_sparrate_for_month` | ✓ live (analog) |
| C.2-Migration `is_card_active_in_month` | ✓ live (kein Hide-Concern mehr, strikt Frequenz/Range-Check) |
| C.3 RPC `toggle_card_hidden(p_card_id uuid, p_hidden boolean) RETURNS boolean` | ✓ live, idempotent, RLS via `auth.uid()` |
| §4.6-Anker | ✓ stabil bei `2910.01` über 4 Migrationen |

**Sandbox 6/6 TCs PASS dokumentiert.**

Schema-Doku v3 → v3.1 Patch-File `schema_doku_patch_v3_zu_v3_1.md` wird vom PM auf v3 angewendet **vor** Sprint-Start.

---

## 3. UI-Filterungs-Anker (für Phase 2)

**Filter ergänzen** (`WHERE deleted_at IS NULL`):

| Surface | Erwarteter Code-Pfad |
|---|---|
| Karten-Karussell-Loader auf Hauptseite | `src/lib/cards.ts` (oder vergleichbar) — `loadCardsForMonth` / `getCardsWithEffectivePlan` |
| KI-Vorschlag-Badge-Loader (Sprint 8) | `src/lib/distiller.ts` oder Fragment-Status-Loader |
| Stack-Suggestion-Resolver bei CSV-Import-Match (Sprint 8/9) | analog Distiller-Pfad |
| Detail-Overlay-Loader (falls implementiert, sonst entfällt) | Karten-Detail-Komponente |

**Filter NICHT ergänzen** (Sparrate-Surfaces):

| Surface | Begründung |
|---|---|
| Singularity Ring (`calculate_sparrate_for_month` + `calculate_planned_sparrate_for_month`) | RPCs sind selbst snapshot-integer — Filter würde §2.1 brechen |
| Sparraten-Treppe (dito) | analog |
| Plan-Linie / Vorjahres-Linie | analog |

**Code-Grep-Pflicht:** Vor Phase-2-Commit `rg "from cards" src/` und `rg "deleted_at" src/` zur Verifikation. Anker-Tabelle in Review reflektieren.

---

## 4. Visual-Spec V5'' Sparraten-Treppe (§9 autoritativ)

| Eigenschaft | Wert |
|---|---|
| Opacity Teal (Standard) | `0.50` |
| Opacity Grau (Standard) | `0.30` |
| Stroke-Width | `1.5px` |
| Dot-Radius normal | `2.5px` |
| Dot-Radius hover/selected | `5px` |
| Nulllinie | `rgba(255,255,255,.08)`, `0.5px` |
| Vorjahres-Linie | `rgba(255,200,60,.3)`, `1px`, gestrichelt `[4,4]` |
| Vorjahres-Label | Nur Betrag (kein Jahresname) · `rgba(255,200,60,0.75)` |
| Teal-/Grau-Treppe Jahresend-Labels | KEINE (verhindert Überlagerung) |
| Ereignis-Annotation | ⚠ in Gold am Dot des betroffenen Monats |

**Berechnung:**

```
geplant kumuliert (Grau)     = Σ_{m=Jan..M}  calculate_planned_sparrate_for_month(user_id, m)
tatsächlich kumuliert (Teal) = Σ_{m=Jan..Dez} calculate_sparrate_for_month(user_id, m)
```

Beide RPCs liefern automatisch das richtige Verhalten je nach Vergangenheit/Gegenwart/Zukunft.

**Vorjahres-Referenz:**

| Aktives Jahr | Linie |
|---|---|
| Jahr X (aktuell) | Jahresendwert X-1 |
| Jahr X-1 (Vergangenheit) | Jahresendwert X-2 |
| Jahr X+1 (Zukunft) | keine Linie, kein Label |

Statisch innerhalb eines Kalenderjahres.

**Prototyp:** `sparrate_treppe_final_v2.html` als Referenz-Implementierung (Canvas + JS). Bei Konflikt zwischen Prototyp und §9 gewinnt **§9**.

---

## 5. Visual-Spec V4'' Dreipunkt + Toast

### Dreipunkt-Menü

| Aspekt | Spec |
|---|---|
| Position | rechts oben in der Karte, links neben dem bestehenden Status-Symbol (Punkt/Checkmark/Ausrufezeichen) der §7-Karten-Zustände |
| Symbol | `⋯` (drei Punkte, dezent) |
| Sichtbarkeit Default | `opacity: 0` |
| Sichtbarkeit Karten-Hover | `opacity: 0.6` |
| Sichtbarkeit Dreipunkt-Hover | `opacity: 1` |
| Klick-Verhalten | Drop-Menü öffnet sich unterhalb des Dreipunkts (analog Apple ContextMenu) |
| Menü-Eintrag (V1) | „Verbergen" |

### Toast

| Aspekt | Spec |
|---|---|
| Position | unten Mitte, analog Sprint-9-Backfill-Toast |
| Text | `Karte »<name>« ausgeblendet` |
| Action-Button | rechts: `Rückgängig` |
| Dauer | 5 Sekunden, danach Fade-out |
| Klick „Rückgängig" innerhalb 5s | Server-Action `toggle_card_hidden(card_id, false)`, Toast schließt sofort, Karte erscheint via revalidatePath |
| Nach 5s ohne Klick | Toast schließt, `deleted_at` bleibt gesetzt — keine UI-Wiederherstellung in V1 |

**V1-Limitation:** einmal verborgen, bleibt verborgen (außer 5s-Toast-Rückgängig). „Versteckte Karten verwalten"-Pfad ist V2.

---

## 6. Akzeptanz-Kriterien

### Phase 1 — V5'' Sparraten-Treppe

| # | Kriterium | Wie geprüft |
|---|---|---|
| A1.1 | `pnpm build` + `tsc --noEmit` + `next lint` clean | Output |
| A1.2 | Treppe rendert auf Hauptseite unter dem Singularity Ring | Screenshot |
| A1.3 | 12 Monate Jan–Dez des aktiven Jahres dargestellt | Screenshot |
| A1.4 | Grau-Treppe Opacity 0.30, Teal-Treppe Opacity 0.50 | DevTools Computed |
| A1.5 | Vorjahres-Linie (gold, gestrichelt) + Betrag-Label rechts | Screenshot |
| A1.6 | Hover auf Teal-Dot → Tooltip mit Monatsname + % monatlich + Ist kumuliert + Plan kumuliert | Screenshot |
| A1.7 | Klick Teal-Dot → Abweichungs-Erklärung unter Chart (V1: einfacher Hinweis akzeptabel falls Treiber-Heuristik nicht im Backend) | Screenshot |
| A1.8 | §4.6-Anker-Cross-Check: kumulierter Teal-Wert März 2026 muss konsistent mit `calculate_sparrate_for_month(Jan)+Feb+März` sein, wobei März `2910.01` ist | SQL + Tooltip-Wert |
| A1.9 | Initial-Load-Latenz < 1,5s bei 24 parallelen RPC-Calls (12×2 + 1 Vorjahres) | DevTools Network |

### Phase 2 — V4'' Soft-Delete

| # | Kriterium | Wie geprüft |
|---|---|---|
| A2.1 | `pnpm build` + `tsc --noEmit` + `next lint` clean | Output |
| A2.2 | Dreipunkt nur auf Karten-Hover sichtbar, sonst `opacity: 0` | DevTools + Screenshot |
| A2.3 | Klick Dreipunkt → Drop-Menü mit Eintrag „Verbergen" | Screenshot |
| A2.4 | Klick „Verbergen" auf Netflix → Karte verschwindet aus Mai-Karussell sofort + Toast unten Mitte | Screenshot |
| A2.5 | DB-Check: `SELECT deleted_at FROM cards WHERE name = 'Netflix' AND user_id = '<test-user>'` → NOT NULL | SQL |
| A2.6 | Klick „Rückgängig" innerhalb 5s → Karte wieder sichtbar, Toast weg, `deleted_at = NULL` | Screenshot + SQL |
| A2.7 | Toast nach 5s ohne Klick → Fade-out, Karte bleibt verborgen | Screenshot |
| A2.8 | Navigation Januar 2026 (Netflix war dort aktiv) → Netflix **nicht sichtbar** | Screenshot |
| A2.9 | **Snapshot-Integrität:** Ring-Wert März 2026 mit Netflix verborgen = Ring-Wert ohne Netflix verborgen (= `2910.01`) | SQL + Screenshot |
| A2.10 | **Snapshot-Integrität:** Treppen-Wert März 2026 unverändert nach Netflix-Hide | Screenshot vor/nach |
| A2.11 | Code-Grep `rg "deleted_at" src/`: UI-Surfaces filtern, Sparrate-Surfaces filtern NICHT | Grep-Output in Review |
| A2.12 | Past-Month-Verbergen funktioniert: Navigation zu Januar 2026, dort Netflix verbergen — gleiches Verhalten | Screenshot |

### Phase 3 — Doku-Patches

| # | Kriterium | Wie geprüft |
|---|---|---|
| A3.1 | `sprints/sprint_10_doku_patches.md` enthält Anker + Patch-Sätze für Design-Doku §2.4 + §7 (+ §9 falls präzisiert) | Datei-Review |
| A3.2 | `CLAUDE_md_sprint_10_patches.md` enthält Patches für CLAUDE.md §10 + §9 | Datei-Review |
| A3.3 | Bundle-Hygiene clean: `rg "TODO Sprint 10 dev" .next/static/chunks/app/` = 0 (falls Dev-Helper) | Grep-Output |

---

## 7. Smoke-Test-Sequenz (User-Browser)

Nach jeder Phase Browser-Smoke gegen Test-User.

### Phase 1 Smoke

| # | Aktion | Erwartung |
|---|---|---|
| S1 | `/?month=2026-03` öffnen | Ring sichtbar, Treppe rendert darunter |
| S2 | Hover über März-Dot | Tooltip mit Monatsname, Ist kumuliert, Plan kumuliert |
| S3 | Klick März-Dot | Abweichungs-Erklärungszeile unter Chart erscheint |
| S4 | Treppe-Werte vergleichen mit `SELECT calculate_sparrate_for_month(...)` Jan/Feb/März | kumulierter Teal-Wert März = Jan + Feb + März-Werte aus SQL |
| S5 | Navigation zu `/?month=2027-01` (Zukunft) | Treppe rendert für 2027, keine Vorjahres-Linie (2026 noch nicht abgeschlossen) |

### Phase 2 Smoke

| # | Aktion | Erwartung |
|---|---|---|
| S6 | `/?month=2026-05` | Karten sichtbar, Dreipunkt unsichtbar (kein Hover) |
| S7 | Hover über Netflix-Karte | Dreipunkt rechts oben mit Opacity 0.6 sichtbar |
| S8 | Klick Dreipunkt | Drop-Menü mit „Verbergen" öffnet sich |
| S9 | Klick „Verbergen" | Netflix verschwindet sofort, Toast unten Mitte: `Karte »Netflix« ausgeblendet — Rückgängig` |
| S10 | DB-Check `cards.deleted_at` für Netflix | NOT NULL |
| S11 | Ring-Wert Mai 2026 vor/nach Hide | unverändert (Snapshot-Integrität) |
| S12 | Treppen-Wert März 2026 vor/nach Hide | unverändert |
| S13 | Klick „Rückgängig" innerhalb 5s | Netflix wieder im Karussell, Toast weg, `deleted_at = NULL` |
| S14 | Erneut verbergen, 6s warten | Toast weg, Netflix bleibt verborgen |
| S15 | Navigation `/?month=2026-01` | Netflix nicht im Januar-Karussell |
| S16 | Navigation `/?month=2026-04` zurück | Netflix nicht im April-Karussell |
| S17 | Past-Month-Hide: andere Karte (z. B. Tanken) in Januar verbergen | analog S9 (Toast, sofortiges Verschwinden), `deleted_at` gesetzt |

---

## 8. Anti-Drift-Regeln

| # | Regel | Begründung |
|---|---|---|
| A1 | **LL-14 sequenziell:** Phase 1 → eigener Commit → Phase 2 → eigener Commit → Phase 3 → eigener Commit | LL-14 |
| A2 | **Sparrate-RPCs NICHT mit `deleted_at`-Filter aufrufen** — Backend ist seit Pre-Sprint-10 snapshot-integer | §2.1 + Pre-Sprint-10-C.2 |
| A3 | **Keine Schema-Änderungen** — alle DB-Vorbedingungen sind erfüllt | Pre-Sprint-10 abgeschlossen |
| A4 | **Keine spontanen Spec-Patches** — bei Unklarheit PM-Eskalation, kein Eigen-Patch | LL-13 |
| A5 | **Claude Code editiert Design-/Schema-Doku NIE** — Patches als separate Datei in `sprints/sprint_10_doku_patches.md` | LL-16 |
| A6 | **Prototyp `sparrate_treppe_final_v2.html` ist Referenz**, §9 gewinnt bei Konflikt | Konsistenz |
| A7 | **§4.6-Anker `2910.01` für März 2026 muss stabil bleiben** — Cross-Check nach jeder Phase | Verifikation |
| A8 | **Test-User-UUID nicht hardcoden** im src/ | V1-Pragma |
| A9 | **Toast unten Mitte, NICHT oben** — Sprint-9-Backfill-Toast war oben (Pipeline-Feedback), Hide-Toast ist Action-Quittung mit Rückgängig — Pattern bewusst anders positioniert | Spec |
| A10 | **Bundle-Hygiene:** Dev-Helper (falls verwendet) müssen aus Production-Bundle elidiert sein | Sprint-1-Pattern |
| A11 | **Server-Action über `lib/rpc.ts`** für `toggle_card_hidden` (Wrapper-Konvention, throw-on-error) | CLAUDE.md §7 |

---

## 9. Wichtige Hintergrund-Kontexte

### 9.1 Snapshot-Integrität (Architekten-α-Patch)

`calculate_sparrate_for_month` / `calculate_planned_sparrate_for_month` / `is_card_active_in_month` haben seit Pre-Sprint-10 **keinen** `deleted_at`-Filter mehr. Das ist kritisch für §2.1 — versteckte Karten zählen weiter in die Sparrate, weil eine spätere Hide-Aktion keine historische Sparrate ändern darf.

### 9.2 §4.6 Quick-Reference (Anker-Test)

```
März 2026 Sparrate (calculate_sparrate_for_month) = 2.910,01 €
März 2026 Plan-Sparrate                            = 2.890,01 €
```

Über alle 4 Pre-Sprint-10-Migrationen stabil verifiziert.

### 9.3 RPC-Vertrag `toggle_card_hidden`

```sql
toggle_card_hidden(
  p_card_id uuid,
  p_hidden  boolean
) RETURNS boolean  -- neuer hidden-Zustand (deleted_at IS NOT NULL)
```

- `p_hidden = true` → `deleted_at = now()`, idempotent (re-set → neuer Timestamp)
- `p_hidden = false` → `deleted_at = NULL`
- Fremduser-Aufruf → RAISES `card not found or not owned`
- Wrapper-Konvention: throw-on-error

### 9.4 Performance-Hinweis Treppe

24 parallele RPC-Calls (12 × 2) + 1 Vorjahres-Call beim Initial-Load. Bei Test-User keine Latenz-Probleme erwartet (Sprint-5/6 zeigten Karten-Pipeline < 1s mit ~20 parallelen Calls).

Falls Latenz spürbar wird (z. B. >1,5s): Diagnose dokumentieren, keine Eigen-Patches. V2-Vormerkung für Bulk-RPC `get_yearly_sparrate_curves(p_user_id, p_year)`.

### 9.5 Modell-Empfehlung-Begründung

CLAUDE.md §9 + PM-Handover Sprint-9 → 10 §8: Sonnet 4.6 für reine UI-Sprints mit klaren Specs. Eskalations-Trigger:
- Canvas-Performance-Quirks bei großen Datasets
- ContextMenu-Cross-Browser-Inkonsistenz
- Snapshot-Integritäts-Regression in A2.9/A2.10 (sollte nicht passieren, da Backend sauber)

---

## 10. PM-Übergabe-Notiz

**Voraussetzung:** Schema-Doku-Patch L1 (`schema_doku_patch_v3_zu_v3_1.md`) wird vom PM **vor** Sprint-Start auf v3 angewendet und committet. Backend-Migrationen L2/L4 + RPC L5 sind bereits live.

**Phase-Sequenz strikt:** Phase 1 → Smoke → Commit → Phase 2 → Smoke → Commit → Phase 3 → Commit. Bei rotem Smoke einer Phase: Diagnose → PM-Eskalation. Keine Cross-Phase-Spontan-Patches.

**Bei Unklarheit:**
- Treppe-Visual: §9 + Prototyp (§9 gewinnt bei Konflikt)
- Hide-Toast-UX: dieses Briefing + §2.4 + Sprint-9-Toast-Pattern (Position-Override unten Mitte)
- Filter-Reichweite: §3 dieses Briefings (UI vs Sparrate)

**Was Claude Code im Review zurückgibt:**

| Output | Form |
|---|---|
| Sanity-Check-Output | `pnpm build` / `tsc` / `lint` |
| Smoke-Test-Tabelle | S1–S17 mit ✓/✗ + Bemerkung |
| Code-Grep-Output | `rg "deleted_at" src/` mit Filter-Lokalisierung |
| Schema-Doku-Patches | `sprints/sprint_10_doku_patches.md` |
| CLAUDE.md-Patches | `CLAUDE_md_sprint_10_patches.md` |
| Bundle-Grep-Output | `rg "TODO" .next/static/chunks/app/` (falls Dev-Helper) |
| Offene Fragen / Quirks | im Review-Dokument |
| Vorschlag CLAUDE.md-§10-Sprint-10-Block | Inhalt für PM-Anwendung |

---

*Sprint 10 Briefing | Antigravity Finance 1.0 | 24. Mai 2026*
