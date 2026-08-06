# Doku-Patch 06.08.2026 — CLAUDE.md §9, Zeile „Doku-Versionen"

**Verfahren:** LL-16 / §7 Regel 14 — Anker + Patch-Satz, keine direkte Bearbeitung.
Für CLAUDE.md zusätzlich mit **ausdrücklicher User-Freigabe**.

**Freigabe:** Dominik, 06.08.2026 — über den Koordinator übermittelt: *„Der User hat die
Freigabe für den CLAUDE.md-Patch ausdrücklich erteilt."* Sie deckt **ausschließlich die
Zeile „Doku-Versionen"**. Alles andere in §9 bleibt unberührt (siehe „Bewusst NICHT
geändert" unten).

**Bewusst eine eigene Datei.** Die Design-Doku-Patches dieses Tages liegen in
`sprints/doku_patch_2026-08-06_dd-runde.md`. CLAUDE.md ist eine andere Bibel mit einem
eigenen Freigabe-Gate; die Stelle muss **einzeln zurücknehmbar** bleiben.

**Kein Versions-Bump.** CLAUDE.md führt keine eigene Versionsnummer — nur die Zeile
„Letzte Aktualisierung" im Kopfblock (dazu unten V1).

---

## V0 · §9 — Zeile „Doku-Versionen"

**Anker** (CLAUDE.md Zeile 561):

```
**Doku-Versionen:** Design-Doku **v3.2.0** · Schema-Doku **v3.4.3**.
```

**Patch-Satz** — ersetzt den Anker:

```markdown
**Doku-Versionen:** Design-Doku **v3.3.0** · Schema-Doku **v3.4.4**.
```

**Warum, je Zahl belegt:**

| Zahl | Beleg |
|---|---|
| Design-Doku `v3.2.0` → **`v3.3.0`** | Header-Zeile 3 von `antigravity_finance_design_dokument.md` nach dem heutigen Bump; Changelog-Absatz v3.3.0 (06.08.2026, DD-Runde · `LQ-2` `LQ-1` `RM-2` `PA-1`). Patch-Beleg: `sprints/doku_patch_2026-08-06_dd-runde.md` E1/E2. |
| Schema-Doku `v3.4.3` → **`v3.4.4`** | Header-Zeile 3 von `antigravity_finance_schema_summary.md`; Changelog v3.4.4 (06.08.2026, Sprint v2-14 · `LQ-1` — `cards.due_day`). **Von mir nicht geschrieben**, nur abgelesen. |

---

## V1 · Kopfblock — „Letzte Aktualisierung"

**Geprüft, Ergebnis: kein Patch.** Die Zeile trägt nach dem Verfahren Datum **und
Anlass** des letzten Patches; sie steht auf *„05. August 2026 · nach: v2-13"* und endet
mit dem ausdrücklichen Vermerk, §9 sei damals **nicht** nachgezogen worden und brauche
eine eigene Freigabe. Genau diese Freigabe ist heute für **einen Teil** von §9 erteilt
worden — für die Doku-Versionen, nicht für die Prüfanker und nicht für „Letzter Sprint".

Eine Fortschreibung der Kopfzeile müsste diesen Unterschied mit tragen („§9 nur in der
Zeile Doku-Versionen nachgezogen; Prüfanker und Sprint-Stand weiterhin offen"). Das ist
eine **zweite** inhaltliche Aussage über den Stand der Verfassung und damit über die
erteilte Freigabe hinaus. Deshalb hier **nicht** angefasst, sondern dem Koordinator als
Vorschlag gemeldet — zusammen mit der v2-14-Frage, die ohnehin zur Entscheidung ansteht.
Beides gehört in **eine** Freigabe, nicht in zwei halbe.

---

## Bewusst NICHT geändert

| Stelle | Warum |
|---|---|
| §9 „**Letzter Sprint:** v2-13 …" | v2-14 (`LQ-1`, `cards.due_day`, Commit `576ea43`) fehlt dort. Ausdrücklich **nicht** von der Freigabe gedeckt; im Bericht als eigener Vorschlag formuliert. |
| §9 Prüfanker-Tabelle + Erläuterungs-Block | Werte vom 05.08.2026. Keine der heutigen Änderungen berührt eine Rechenfunktion (der Record hält ausdrücklich fest: **kein Datenbank-Eingriff** in allen vier Themen), die Tabelle ist also nicht falsch geworden. Ein Nachzug bräuchte trotzdem eine eigene Messung **und** eine eigene Freigabe. |
| §9 „Offene Themen" / „Ohne Entscheidung baubar" | Durch die DD-Runde teilweise überholt; gemeldet, nicht geändert. |
| §5 „Die zwei Bibeln" (§-Themen-Tabelle der Design-Doku) | Ein Eintrag für den neuen §12.9 wäre konsequent, ist aber nicht Teil der Freigabe. |
| Alles außerhalb §9 | Nicht Gegenstand. |

---

*Doku-Patch · Antigravity Finance · 06. August 2026 · Subagent `docs-maintainer`*
