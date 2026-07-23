# Doku-Patch 23.07.2026 — Struktur-Stabilisierung (Dateinamen + Ablage)

> **Quelle:** User-Freigabe „Struktur-Vorschlag: Go" (23.07.2026) auf den PM-Vorschlag
> aus dem Onboarding-Statusbild. **Anwendung:** Claude Code (PM-Rolle), LL-16-konform.
> **Motivation:** Versionsnummern in Bibel-Dateinamen erzwingen pro Patch-Bump ein
> Datei-Rename → hängende Renames + tote Referenzen (am 23.07.2026 konkret erlebt:
> 1 uncommitteter Rename, 6 veraltete Referenzen in CLAUDE.md). Beschluss-Papiere
> lagen zweigeteilt (sprints/ vs. V2/).

## A. Struktur-Maßnahmen (git mv)

| # | Von | Nach |
|---|---|---|
| A1 | `antigravity_finance_design_dokument_v3_1_3.md` | `antigravity_finance_design_dokument.md` |
| A2 | `antigravity_finance_schema_summary_v3_2.md` | `antigravity_finance_schema_summary.md` |
| A3 | `sprints/architekt_beschluss_nachtrag_mehrkonten_7_fragen.md` | `V2/architekt_beschluss_nachtrag_mehrkonten_7_fragen.md` |

**Neue Konvention:** Die Version der beiden Bibeln wird ausschließlich im Dokument-Header
(+ Changelog) geführt; Datei-Renames pro Versions-Bump entfallen. Major-Rotationen
(z. B. v3 → v4) erzeugen weiterhin eine Archiv-Kopie (wie bisher `Archiv_V1/`).
`V2/` ist die einzige Heimat für Entscheidungs-/Konzeptdokumente; `sprints/` enthält
nur sprint-gebundene Artefakte (Briefings, Reviews, Doku-Patches, Migrations-Entwürfe).

## B. Referenz-Patches (lebende Dokumente)

### B1 — `CLAUDE.md` (4× Design-Doku-Dateiname, 3× Schema-Doku-Dateiname)
- **Anker:** alle Vorkommen von `antigravity_finance_design_dokument_v3_1_3.md`
  (V2-Tabellen-Fußnote, §3-Baum, §5 Designreferenzen, §8 Sprint-Start-Liste)
  → **Patch:** `antigravity_finance_design_dokument.md`
- **Anker:** alle Vorkommen von `antigravity_finance_schema_summary_v3_2.md`
  (V2-Tabellen-Fußnote, §3-Baum, §8 Sprint-Start-Liste)
  → **Patch:** `antigravity_finance_schema_summary.md`
- Versionsangaben im Fließtext („Design-Doku v3.1.3", „Schema-Doku v3.2") bleiben —
  sie bezeichnen Dokument-Versionen, keine Dateinamen.

### B2 — Design-Doku (Datei aus A1)
- **Anker:** beide Vorkommen von `antigravity_finance_schema_summary_v2.md`
  (Header-Hinweis Z. 8, §-Text Z. 197) → **Patch:** `antigravity_finance_schema_summary.md`
- **Anker:** Ende des Header-Changelog-Blocks (nach dem Changelog-v3.1.3-Eintrag)
  → **Patch (Einfügung):** `> **Datei-Konvention (23.07.2026):** Stabiler Dateiname
  antigravity_finance_design_dokument.md — Version nur noch im Header/Changelog,
  Datei-Renames pro Patch-Level entfallen.`

### B3 — Schema-Doku (Datei aus A2)
- **Anker:** Header-Zeile `**Datum:** 06. Juli 2026` → **Patch (Einfügung danach):**
  `**Datei-Konvention (23.07.2026):** Stabiler Dateiname antigravity_finance_schema_summary.md — Version nur noch im Header.`

### B4 — `.claude/agents/docs-maintainer.md`
- **Anker:** Dokumentliste (`antigravity_finance_design_dokument_v3_*.md` /
  `antigravity_finance_schema_summary_v*.md`) → **Patch:** stabile Dateinamen.
- **Anker:** Workflow-Punkt 4, Satz „Bei Versionswechsel im Dateinamen der bisherigen
  Konvention folgen (Umbenennung nur, wenn der Auftrag es vorsieht)." → **Patch:**
  „Dateinamen der Bibeln sind stabil (Version nur im Header/Changelog) — keine
  Datei-Renames bei Versions-Bumps; Major-Rotationen erzeugen eine Archiv-Kopie."

## C. Bewusst NICHT angefasst

Alle historischen Artefakte referenzieren weiterhin die damals gültigen Dateinamen:
`sprints/`-Briefings/Reviews/Doku-Patches (inkl. der heutigen Nachzug-Patch-Datei),
`V2/`-Entscheidungs-Records und Setup-/Cleanup-Protokolle (`projekt_v2_setup.md`,
`repo_cleanup_v1_to_v2.md`), gesamtes `Archiv_V1/`.
