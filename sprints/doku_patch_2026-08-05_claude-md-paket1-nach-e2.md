# Doku-Patch 05.08.2026 — CLAUDE.md §9 nach der Entscheidung E2

**Ziel-Dokument:** `CLAUDE.md` (die Verfassung)
**Anlass:** E2 ist am 05.08.2026 entschieden. Der §9-Absatz aus dem Nachzug von
heute Vormittag (`sprints/doku_patch_2026-08-05_claude-md-nachzug-v2-10.md`,
Patch 5) sagt seither zu viel: Er erklärt Paket 1 für **vollständig** blockiert und
den 900-€-Rechenfehler für entscheidungs-gebunden. Beides gilt für `BF-5` nicht mehr.
**Freigabe:** Dominik, 05.08.2026 — *„Ja, zieh die Zeile nach"*, auf die Rückfrage,
ob §9 nachgezogen werden soll.
**Verfahren:** §7 Regel 14 / LL-16 — Anker + Patch-Satz, danach angewendet. Für
CLAUDE.md zusätzlich mit ausdrücklicher User-Freigabe, siehe oben.
**Status:** ✅ angewendet am 05.08.2026. Der Anker war vorher per Volltextsuche als
eindeutig bestätigt (genau ein Treffer).

**Umfang:** eine Stelle. Die Prüfanker-Tabelle, LL-6 und der Rest von §9 bleiben
unberührt — die sind heute Vormittag nachgezogen worden und weiterhin gültig.

---

## Patch 1 — §9: Lage von Paket 1 nach E2

**Anker:**

```
**Paket 1 ist seit v2-10 blockiert, nicht der nächste Arbeitsvorrat.** Die beiden
sofort umsetzbaren Befunde sind erledigt (`BF-3`, `BF-1`); die verbleibenden drei —
`BF-5`, `BF-2`, `BF-4` — hängen **ausnahmslos** an den Entscheidungen **E1/E2/E3**
(alle drei mit fertiger Empfehlung in
`V2/befunde_2026-08-04_fehler_und_entscheidungen.md` §7). Auch der Rechenfehler mit
**900 € Wirkung** auf die Juli-Sparrate wartet damit auf eine Entscheidung, nicht auf
freie Kapazität.
```

**Patch — ersetzen durch:**

```markdown
**Nächster Sprint: `BF-5`.** Von den fünf Befunden sind zwei erledigt (`BF-3`, `BF-1`,
beide in v2-10). Mit **E2** ist am 05.08.2026 die Entscheidung gefallen, die `BF-5`
blockiert hat — *„ehrlich rechnen"*: Der Netto-Betrag einer Karte zählt so, wie er
ist, **auch unter null**; keine Kappung bei 0. Damit ist `BF-5` **vollständig
baubar** und holt **900 €** in die Juli-Sparrate zurück (−1.222,75 → −322,75 €).

> **`BF-5` ist kein Anzeige-Sprint.** Er fasst eine Rechenfunktion an → Fähigkeit
> **`db-eingriff`**, Trockenlauf und Anker vorher/nachher sind Pflicht (§7 Regel 20).
> Die **Übungs-Datenbank steht pausiert** und muss vorher geweckt werden. Zusätzlich
> ist **Design-Doku §11** mitzukorrigieren: Der Erstattungs-Leitfaden dort beschreibt
> ein Verhalten, das es nie gab.

In Paket 1 bleiben danach nur noch zwei entscheidungs-gebundene Punkte: `BF-2` wartet
auf **E3**, `BF-4` auf **E1** (beide mit fertiger Empfehlung in
`V2/befunde_2026-08-04_fehler_und_entscheidungen.md` §7). `BF-2` ist ohnehin erst
**nach** `BF-5` sinnvoll, weil die Juli-Zahl dann stimmt und der neue Text am echten
Fall zu sehen ist.
```

**Begründung:** `V2/befunde_2026-08-04_fehler_und_entscheidungen.md` §7 (E2-Record) und
`V2/v2_roadmap_konsolidiert.md` §0. Der bisherige Absatz hätte beim nächsten
Sitzungsstart dazu geführt, dass der einzige sofort baubare — und mit Abstand
lohnendste — Punkt aus Paket 1 als blockiert gilt.

---

## Nicht angefasst

- **Prüfanker-Tabelle in §9** — heute Vormittag nachgezogen, unverändert gültig. Der
  dort notierte Hinweis, dass Juni und Juli sich mit `BF-5` noch einmal bewegen,
  bekommt durch diesen Patch seinen Anschluss.
- **LL-6 in §7 und §8** — unverändert.
- **Der Absatz „Ohne Entscheidung baubar"** direkt darunter — bleibt richtig: Paket 3
  und die `design-direktor`-Runde sind weiterhin ohne jede Entscheidung baubar.

---

*Doku-Patch · Antigravity Finance · 05. August 2026*
