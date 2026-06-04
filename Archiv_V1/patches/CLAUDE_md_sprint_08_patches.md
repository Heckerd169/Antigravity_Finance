# CLAUDE.md — Sprint-8-Patches (zum Einpflegen)

> **PM-Output für Sprint-8-Closing.** Patches auf die bestehende `CLAUDE.md`
> anzuwenden. Drei Stellen: §4 Sprint-Protokoll, §7 Lessons, §10 Sprint-Verlauf.

---

## Patch 1 — §4 Sprint-Protokoll

Sprint-8-Zeile auf grün setzen.

| Sprint | Status | Approval-Datum |
|---|---|---|
| 0–6 | 🟢 | bis 20.05.2026 |
| 7 | 🟢 | 21.05.2026 |
| **8** | **🟢** | **23.05.2026** |

---

## Patch 2 — §7 Lessons Learned (zwei neue Lessons anfügen)

### LL-16 — Doku-Patch-Auslieferung

Claude Code editiert die Design-Doku und die Schema-Doku **nie** selbst.
Wenn ein Briefing Doku-Patches fordert (AC5-Pattern), liefert Claude Code
diese ausschließlich als separate Patch-Datei
`sprints/sprint_NN_doku_patches.md` mit Anker + Patch-Satz pro Stelle. Der PM
verifiziert die Patches und gibt sie zur Anwendung frei. Etabliert in
Sprint 8.

### LL-17 — `app_config`-Schwellen im Server-Code lesen, nicht hardcoden

Konfigurierbare Schwellen (Konfidenz, Badge, Auto-Absorb) werden **server-seitig**
aus `app_config` gelesen und das State-Gating dort vorgenommen. Client-Components
erhalten nur aufgelöste Werte (z. B. `suggestedCardName` statt rohem
`confidence` + Schwelle). Spec-Defaults dürfen nur als Defense-in-Depth-Fallback
hartcodiert sein. Hält Regel 5 (`app_config` als Single-Source-of-Truth) ein und
vermeidet Schwellen-Drift zwischen DB-Logik und UI-Logik. Etabliert in Sprint 8 P4.

---

## Patch 3 — §10 Sprint-Verlauf (Sprint-8-Block anhängen, Append-only-Log)

### Sprint 8 — CSV-Import + Distiller (DKB-only) + Konflikt-6-Cleanup + Stack-Sortierung + Avatar (Closed: 23.05.2026)

**Sprint-Ziel:** Den Sprint-5-Portal-Stub durch die echte DKB-CSV-Import-Pipeline
ersetzen (Parser → Hash → atomare Distiller-RPC → Fragment-Stack-Refresh), plus
Mini-Cleanup INCOME-Tap-Catcher (DD-Konflikt 6) und Mini-Patches Stack-Sortierung
+ Income-Split-Avatar.

**Phasen-Lieferung (7 Commits):**

| Phase | Commit | Inhalt |
|---|---|---|
| P0 | `666a23b` | INCOME-Tap-Catcher rendert nur ohne Fragment-Link |
| P1 | `45dccc3` | DKB-CSV-Parser mit Format-Erkennung + Fehler-Klassifikation |
| — | `62a24c6` | `chore`: Supabase-Typen regeneriert (`process_csv_import`) |
| P2 | `a7cca34` | Portal-Live-Verkabelung + RPC-Call + State-Machine |
| P3 | `f020f36` | Fragment-Stack-Refresh via `revalidatePath` |
| P4 | `4ee03ed` | KI-Vorschlag-Badge-Rendering (`badge_threshold` ≤ confidence < `auto_absorption_threshold`) |
| P5 | (TBD) | Fragment-Stack-Sortierung (unzugeordnet zuerst, `transaction_date ASC`, `imported_at ASC`, `description ASC` de-DE) |
| P6 | (TBD) | Income-Split-Avatar-Icon (inline-SVG aus Prototyp, ICH + PARTNER) |

**Architekt-Lieferung:** RPC `process_csv_import(p_rows jsonb) RETURNS jsonb`
LIVE in V2-Stand (V1 hatte PL/pgSQL-Pitfall `INSERT...ON CONFLICT DO NOTHING
RETURNING INTO v_var` → Architekt-seitig via CTE-Pattern gefixt). Distiller-RPC-Bausteine
(`calculate_match_confidence`, `name_similarity`, `amount_match`, `frequency_match`)
LIVE und §11-konform aus Pre-Sprint-Inventur.

**Schema-Doku v3** als Architekten-Lieferung am Sprint-8-Close abgeschlossen
(23.05.2026). Ersetzt v2 als aktiven Snapshot. Dokumentiert alle 6 neuen RPCs der
Sprints 2–8, drei neue `fragments`-Spalten (`confidence`, `suggested_card_id`,
`imported_at`), `cards.deleted_at` (Soft-Delete-Marker), `card_monthly_states.adjustment_scope`
+ `closed_at`, View `fragments_with_status` mit `AUTO_ABSORBED`-Status, und neue
Section 11 mit 13 funktionalen Indexes. v2 bleibt als historischer Snapshot.

**Pre-Sprint-8-Test-Daten:** Karte „Nebenjob" (INCOME / MONTHLY / `first_active_month
= 2026-05-01` / `planned_amount = 200,00 €` / ohne Fragment-Link) für INCOME-Tap-Smoke
angelegt. §4.6-Anker (`calculate_sparrate_for_month` für März 2026) = `2910.01`
intakt.

**Doku-Patches:** 4 Patches in `sprints/sprint_08_doku_patches.md`:
- §7 Konflikt 6 — INCOME-Spezialregel (Tap-Catcher nicht gerendert wenn `hasFragment`)
- §11 Hash-Algorithmus — Bank-Adapter (DKB-Format, Pipe-Separator)
- §11 Schwellwert — Mehrfach-Match-Tiebreaker (höchster Score, alphabetisch)
- §10 Fragment-Stack — Sortier-Regel (4-stufiger Schlüssel)

**Akzeptanz-Kriterien:** AC1–AC6 sowie Sprint-8-Patches AC-Sort-1/2/3 + AC-Avatar-1/2/3
alle grün.

**OQ-Entscheidungen:**
- OQ1 — Badge-Farbe: generisches Yellow-Soft `rgba(255,200,60,.5)` für alle KI-Badges. Karten-spezifische Farben = V2-C.
- OQ2/OQ3 — Mehrfach-Match: höchster Score gewinnt, Tie → alphabetisch erster Karten-Name. In §11 gepatcht.

**Cross-Sprint-Konflikt-Beobachtungen:**
- Konflikt 6 (Manuell bezahlt + Eject) für INCOME implementiert wie DD-Spec — kein neuer Konflikt.
- §4.6-Anker hält. März-2026 berührt keine Sprint-8-Logik.

**Bundle:** Route `/` → 22.4 kB, First Load JS 174 kB (Sprint 7: 21.4 kB / 173 kB; +1 kB für Parser-Modul + Avatar-SVG, im Budget).

**Branch-Stand:**
- `sprint/08-csv-import` mit P0–P6 fertig, bereit zum Merge in `main`
- `sprint/07-ui-completion` als Backup-Pointer behalten

**Lessons aus diesem Sprint:** LL-16 + LL-17 (siehe §7).

---

*PM-Patches Sprint 8 · 23. Mai 2026*
