# CLAUDE.md — Patch-Entwurf (Sprint v2-01 + Init-4-Anlauf)

> **Vom:** PM-Chat V2 · **Datum:** 26. Juni 2026
> **An:** User wendet an (committed). Mit Claude Codes Review-Vorschlag abgleichen, falls dieser zusätzliche Punkte nennt.
> **Ziel-Datei:** `CLAUDE.md`

---

## Patch 1 — §4: V2-Sprint-Protokoll anlegen (Init-4)

**Anker:** §4 „Sprint-Protokoll", direkt nach der Zeile `Status-Werte: …` und vor der Sprint-6-Gate-Notiz — als neuer Unterblock.

**Einzufügen:**

> ### Sprint-Protokoll V2
>
> | Sprint | Thema | Status | Briefing | Approval |
> |---|---|---|---|---|
> | v2-01 | Bug-Sprint N1–N4a (direkt auf Prod, Option A) | 🟢 Done | sprints/sprint_v2-01_briefing.md | 26.06.2026 |
>
> **Doku-Stand nach v2-01:** Design-Doku **v3.1.1** (M3 Welle/Popup + v2-01-Patches), Schema-Doku v3.1.
> **N4b / N5:** bewusst offen → Design-Direktor Cluster 3 (nicht in v2-01 entschieden).

---

## Patch 2 — §4: Option-A-Test-Projekt-Gate als stehende V2-Regel

**Anker:** unmittelbar unter der neuen V2-Tabelle.

**Einzufügen:**

> **V2-Test-Projekt-Gate (Option A, 26.06.2026):** Reine UI-/Loader-Sprints ohne Schema-Eingriff laufen direkt auf Prod mit manuellem Browser-Smoke (Sparrate-Vorher/Nachher als Wächter). Der **erste** Sprint mit Schema-/RPC-Eingriff **oder** mit automatisierten, daten-mutierenden E2E-Läufen stellt zuerst ein Free-Tier-Test-Projekt auf (Init-1/Init-2: Schema-Reproduktion + deterministischer Anker) und fährt Migrationen erst als Dry-Run dort, dann auf Live. **Migration nie blind auf Prod** — Zwei-Personen-Prinzip + §2.1 nicht verhandelbar.

---

## Nicht-Patches

- Keine neue Lesson Learned aus v2-01 — die etablierten LL-11/LL-13/LL-14/LL-16 haben gegriffen (JS-Filter-Lokalisierung statt naivem Query-Filter, N4b/N5 nicht eigenmächtig entschieden, Doku-Patch als Datei).
- Bundle-Quirk (Dev-Panel nicht tree-geshaked) ist **pre-existing**, kein v2-01-Regress → eigener K-Mini-Cleanup-Sprint, nicht hier.

---

*CLAUDE.md-Patch v2-01 · Antigravity Finance 2.0 · 26. Juni 2026*
