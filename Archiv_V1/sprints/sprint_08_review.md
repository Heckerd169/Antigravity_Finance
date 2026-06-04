# Sprint 8 Review — PM-Perspektive

> **Vom:** PM-Chat Sprint 8
> **Datum:** 23. Mai 2026
> **Sprint-Scope:** CSV-Import + Distiller (DKB-only) + Konflikt-6-Cleanup INCOME + 2 PM-Mini-Patches (Stack-Sort, Avatar)

---

## 1. Status

| Aspekt | Ergebnis |
|---|---|
| Phasen P0–P6 | 7 Commits, sequenziell, je eigener Commit (LL-14-konform) |
| Akzeptanz-Kriterien AC1–AC6 | alle grün |
| AC-Sort-1/2/3 (Patch P5) | alle grün |
| AC-Avatar-1/2/3 (Patch P6) | alle grün |
| Browser-Smoke S1.1/S1.2/S2.x/S3.1–S3.4/S4.x/S5.1 | alle grün (User-Verifikation) |
| §4.6-Anker (`calculate_sparrate_for_month`, März 2026) | `2910.01` ✓ |
| Sanity (`tsc`, `lint`, `build`) | grün |
| Bundle | Route `/` 22.4 kB (+1.0 kB ggü. Sprint 7), First Load 174 kB (+1 kB) |

---

## 2. Lieferungen vs. Briefing

| Briefing-Item | Lieferung |
|---|---|
| L1 DKB-CSV-Parser | `src/lib/dkb-csv.ts`, 14/14 Unit-Tests grün, framework-frei |
| L2 RPC `process_csv_import` | Architekt-Lieferung, LIVE V2-Stand, Smokes 1–5 grün |
| L3 Portal-Live-Verkabelung | Stub raus, echte Pipeline, State-Machine §11-konform |
| L4 Fragment-Stack-Refresh | via `revalidatePath` (Server-Action-Pattern statt Realtime) |
| L5 Badge-Rendering | `KI-Vorschlag: {Name}` mit Yellow-Soft-Akzent |
| L6 Konflikt-6-Cleanup INCOME | `renderTapCatcher = !hasFragment`, DD-Spec wortwörtlich |
| L7 Doku-Patches | `sprint_08_doku_patches.md` (4 Patches) |

Zusätzlich (PM-genehmigte Scope-Expansionen):

| Mini-Patch | Trigger |
|---|---|
| P5 Stack-Sortierung | Spec-Lücke beim Browser-Smoke entdeckt (S3.3 ohne erkennbares Muster) |
| P6 Avatar-Icon | User-Beobachtung pre-existing Gap im Income-Split-Component |

---

## 3. Spec-Patches durch diesen Sprint

| Patch | Sektion | Quelle |
|---|---|---|
| §7 Konflikt 6 INCOME-Spezialregel | Design-Doku v3 | DD-Approval 22.05.2026 |
| §11 Bank-Adapter DKB-Format | Design-Doku v3 | DD-Approval 22.05.2026 |
| §11 Mehrfach-Match-Tiebreaker | Design-Doku v3 | PM-Entscheidung OQ2/OQ3 |
| §10 Stack-Sortierung (4-stufig) | Design-Doku v3 | PM-Entscheidung + P5-Browser-Smoke-Befund |

Alle 4 Patches als Sätze + Anker in `sprints/sprint_08_doku_patches.md`,
PM-approved unverändert.

---

## 4. Architekt-Lieferungen

| Lieferung | Stand |
|---|---|
| `process_csv_import(p_rows jsonb)` RPC | LIVE V2 |
| `card_fragment_links.origin` Enum-Klarstellung | `'AUTO_ABSORBED'` (Past Tense, konsistent mit `'MANUAL_DROP'`) |
| RPC-Inventur (4 RPCs + `app_config`) | LIVE + §11-konform bestätigt |
| Pre-Sprint-8-Test-Karte „Nebenjob" | angelegt |
| §4.6-Anker | `2910.01` ✓ |
| Schema-Doku v3 (Section 1–13) | delivered 23.05.2026, ersetzt v2 als aktiven Snapshot |

**Architekt-Bug-Recovery:** V1 hatte PL/pgSQL-Pitfall `INSERT ... ON CONFLICT
DO NOTHING RETURNING id INTO v_fragment_id` (Variable bleibt NULL bei Conflict-Pfad
trotz INSERT-Erfolg). Architekt diagnostiziert via MCP, V2-Fix mit CTE-Pattern.
Frontend war nicht betroffen.

---

## 5. PM-Beobachtungen (Lessons-Vorlage für CLAUDE.md §7)

| LL | Inhalt | Quelle |
|---|---|---|
| LL-16 | Claude Code editiert Design-/Schema-Doku NIE selbst — Doku-Patches als `sprints/sprint_NN_doku_patches.md`, PM wendet sie an | Sprint-8-Pattern |
| LL-17 | Konfidenz-/Badge-Schwellen server-seitig aus `app_config` lesen + State-Gating dort, Client erhält nur aufgelöste Werte | Sprint 8 P4 |

In `CLAUDE_md_sprint_08_patches.md` als §7-Patch enthalten.

---

## 6. Was im Sprint sauber lief

- Pre-Sprint-Phase: Architekten-Auftrag + DD-Klärung als parallele Files, deterministisch verarbeitet
- K-A/K-B/K-C-Frühklärung verhinderte Mid-Sprint-Spec-Friktionen
- Architekten-Bug wurde in der Vorbereitungs-Phase entdeckt, nicht im Sprint-Smoke → Frontend ungestört
- LL-14 (sequenzielle Commits) durchgehend eingehalten
- Browser-Smoke deckte Spec-Lücken auf (Sortier-Regel) → schneller PM-Entscheid + Patch (LL-13-konform)
- Doku-Patches als separates Output-File (LL-16 etabliert)

## 7. Was den nächsten Sprint vereinfachen würde

- Spec-Lücken-Vorab-Check: Vor Sprint-Start systematischer Scan der vorgesehenen Komponenten gegen Design-Doku-Sektionen auf „Sortierung", „Tiebreaker", „Mehrfach-Match", „Tap-Verhalten bei X". P5/OQ2/OQ3 waren je eine 5-Minuten-Klärung, die im Briefing hätte stehen können.
- Visuelle Smoke-Screenshots als Standard: Bei UI-Patches (wie P6 Avatar) ist ein Side-by-Side Prototyp/Live-Render in der Review nützlicher als textuelle Bestätigung.

(Beide Punkte als Vormerkungen für Sprint 9+, keine LL-Würde.)

---

## 8. Nächste Schritte (User-Aktionen)

1. `sprint_08_doku_patches.md` (Claude-Code-Output) auf Design-Doku anwenden
2. `CLAUDE_md_sprint_08_patches.md` auf CLAUDE.md anwenden
3. Beide Doku-Änderungen committen (auf `sprint/08-csv-import` oder direkt auf `main` nach Merge — PM-agnostisch)
4. Merge `sprint/08-csv-import` → `main`
5. `sprint/07-ui-completion` als Backup behalten, `sprint/06-sparrate-verification` ist nach Sprint-7-Merge bereits gelöscht
6. Sprint-9-Scope-Entscheidung im PM-Chat

---

## Anhang — Commits (P0–P6, Branch `sprint/08-csv-import`)

| Phase | Commit(s) | Message |
|---|---|---|
| P0 | `666a23b` | income tap-catcher only renders when no fragment linked |
| P1 | `45dccc3` | dkb csv parser with format detection and error classification |
| — | `62a24c6` | chore: regenerate supabase types after process_csv_import rpc |
| P2 | `a7cca34` | wire portal to process_csv_import rpc with full state machine |
| P3 | `f020f36` | fragment stack refresh after import |
| P4 | `4ee03ed` | ai suggestion badge rendering on fragment cards |
| — | `30b243a` | docs: sprint 8 review |
| P5 | `0c42f65`, `13e3cac` | fragment stack sort order + alphabetical description tiebreaker |
| — | `910a47c`, `d8e0f6e` | docs: sprint 8 review (P5 append + tiebreaker follow-up) |
| P6 | `78ba06c` | income split avatar icon (person silhouette) |
| — | `27805cc` | docs: sprint 8 review p6 append |

---

*Sprint-8 Review (PM) · 23. Mai 2026*
