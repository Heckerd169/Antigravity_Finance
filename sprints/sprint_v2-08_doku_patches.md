# Sprint v2-08 — Doku-Patches (Nachtrag)

**Erzeugt von:** docs-maintainer (LL-16 — Design-/Schema-Doku werden nie direkt editiert)
**Ziel-Dokument:** `antigravity_finance_schema_summary.md` (aktuell v3.4)
**Datum:** 04. August 2026
**Auftrag/Quelle:** Befund `sprints/sprint_v2-08_review.md` §6 Punkt F4
(„Doppelte Abschnittsnummer in der Schema-Doku"), ausdrücklich beauftragt vom
User am 04.08.2026.
**Status:** ✅ **ANGEWENDET** — alle drei Patch-Stellen sind in der Schema-Doku
eingespielt, Version steht auf **3.4.1**. Diese Datei ist ab jetzt reines
Archiv (Nachvollziehbarkeit); die maßgebliche Quelle ist die Schema-Doku
selbst.

**Hinweis:** Sprint v2-08 selbst hatte keine Doku-Patch-Datei, weil er die
Design-/Schema-Bibeln inhaltlich nicht angefasst hat (siehe Sprint-Review).
Dies ist ein eigenständiger Nachtrag, ausgelöst durch einen beim Review
gefundenen reinen Doku-Fehler (F4) — keine inhaltliche Sprint-Änderung, kein
Schema-/Code-Eingriff.

**Design-Doku:** kein Patch — F4 betrifft ausschließlich die Schema-Doku.

---

## Patch 1 — Doppelte Abschnittsnummer „## 13." auflösen

**Anker:** exakte Zeile (zweites Vorkommen von „## 13." in der Datei)

```
## 13. Betriebsnotiz — v2-04 (einmalig, kein Dauerzustand)
```

Das erste Vorkommen, `## 13. Globale Konstanten — \`app_config\``, ist NICHT
Gegenstand dieses Patches und bleibt unverändert.

**Patch:**

alt:
```
## 13. Betriebsnotiz — v2-04 (einmalig, kein Dauerzustand)
```

neu:
```
## 15. Betriebsnotiz — v2-04 (einmalig, kein Dauerzustand)
```

**Quelle/Begründung:** Sprint-v2-08-Review §6 F4. Die Datei zählt Abschnitte
1–14 fortlaufend (§1 „Was gebaut wurde" … §14 „Verbleibender Notiz-Zettel aus
Phase 1"); der unnummerierte Fazit-Block „Was du jetzt hast" danach bleibt
bewusst unnummeriert (kein Sachabschnitt). Der zweite „## 13."-Block folgt
danach und muss „## 15." lauten, da 13 und 14 bereits vergeben sind. Keine
Querverweise auf „Schema-Doku §13" im Repo (vom Auftraggeber vorab geprüft) —
die Umnummerierung ist folgenlos für andere Dokumente.

---

## Patch 2 — Versions-/Changelog-Bump im Header

**Anker A** (exakte Zeile, Header):

```
**Version:** 3.4
```

**Patch A:**

alt: `**Version:** 3.4`
neu: `**Version:** 3.4.1`

**Anker B** (exakte Textstelle — Ende des bestehenden
„Änderungen v3.3 → v3.4"-Blocks, unmittelbar vor dem `transfer_type`-
Klarstellungs-Block):

```
- Keine Tabellen-, Spalten-, Index-, Trigger- oder Enum-Änderung.

**`transfer_type` — Wertemenge + Semantik (v3.2):**
```

**Patch B:** zwischen den beiden Zeilen einen neuen Änderungs-Block einfügen:

```markdown
- Keine Tabellen-, Spalten-, Index-, Trigger- oder Enum-Änderung.

**Änderungen v3.4 → v3.4.1 (Doku-Patch, 04.08.2026):**

- Abschnittsnummerierung korrigiert: zweites Vorkommen „## 13." (vormals
  „Betriebsnotiz — v2-04") zu „## 15." umnummeriert — Abschnitt 13 war bereits
  durch „Globale Konstanten — `app_config`" belegt. Keine schema- oder
  datenseitige Änderung, reine Nummerierungskorrektur (Sprint-v2-08-Review
  §6 F4).

**`transfer_type` — Wertemenge + Semantik (v3.2):**
```

**Quelle/Begründung:** CLAUDE.md §7-Arbeitsablauf (LL-16): jede angewendete
Patch-Datei bumpt die Versionsnummer im Header (Patch-Level, da reiner
Doku-Fix ohne Schema-/Verhaltens-Änderung: 3.4 → 3.4.1) und ergänzt den
Changelog-Eintrag. Die Datei führt einen informellen Changelog in Form der
„Änderungen vX → vY"-Bullet-Blöcke im Header-Bereich — dieser Block wird
fortgeführt statt eines neuen, separaten „Changelog"-Abschnitts.

---

## Anwendungsreihenfolge

1. Patch 1 — Anker-Fix `## 13.` → `## 15.` (Zeile 507)
2. Patch 2B — Changelog-Block einfügen (Header-Bereich)
3. Patch 2A — Versionsnummer 3.4 → 3.4.1 (Header, Zeile 3)

Reihenfolge ist unkritisch (drei disjunkte, nicht überlappende Textstellen);
hier die tatsächliche Bearbeitungsreihenfolge dokumentiert.

---

*Doku-Patches Sprint v2-08 (Nachtrag) · Antigravity Finance · 04. August 2026*
