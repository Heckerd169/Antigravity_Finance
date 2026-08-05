# Doku-Patch 05.08.2026 — CLAUDE.md nach Sprint v2-13 (`BF-4`)

**Verfahren:** LL-16 / §7 Regel 14 — Anker + Patch-Satz je Stelle, keine direkte
Bearbeitung. Für CLAUDE.md zusätzlich mit **ausdrücklicher User-Freigabe**.

**Freigabe:** Dominik, 05.08.2026 — *„zieh die drei CLAUDE.md-Vorschläge nach,
freigegeben"*. Bezieht sich auf `sprints/sprint_v2-13_review.md` §7, Vorschläge ① ② ③.

**Nummern-Stand vor dem Patch:** §6 Stolperfallen bis **10** · §7 Grundregeln bis
**22** · §8 Register bis **LL-22**. Neu vergeben werden also Stolperfalle **11**,
Regeln **23/24** und **LL-23/LL-24**.

> **Nicht Teil dieses Patches:** §9 (Aktueller Stand / Prüfanker). Vorschlag ⑥ des
> Reviews war eine Bestätigung der Werte, keine der drei freigegebenen Änderungen —
> er braucht eine eigene Freigabe. Ebenso die beiden Fähigkeits-Korrekturen
> (Vorschläge ④ und ⑤), die nicht CLAUDE.md betreffen.

---

## C1 · §6 — neue Stolperfalle 11

**Anker** (letzte Zeile der Stolperfallen-Liste):

```
10. **`card_monthly_states.closed_at` ignorieren** — wird nicht genutzt.
```

**Patch-Satz** — ersetzt den Anker:

```markdown
10. **`card_monthly_states.closed_at` ignorieren** — wird nicht genutzt.
11. **Der Split-Anteil wird genau EINMAL angewandt** — in
    `calculate_card_amount_for_month`, und dort **nur auf Plan/Anpassung**.
    Fragment-Summen sind bereits der überwiesene Anteil und bleiben unangetastet.
    Wer einen neuen Aufrufer baut, darf den Anteil **nicht erneut** anwenden.
    Einzige Ausnahme: `calculate_planned_sparrate_for_month` rechnet auf dem
    Roh-Plan und wendet ihn deshalb weiterhin selbst an. (v2-13, LL-23)
```

---

## C2 · §7 — neue Grundregel 23

**Anker** (Ende von Regel 22):

```
    Aufwands-Entscheidung, die auf einer solchen ungeprüften Zusage aufbaut, ist
    genauso ungeprüft. (LL-22)
```

**Patch-Satz** — ersetzt den Anker:

```markdown
    Aufwands-Entscheidung, die auf einer solchen ungeprüften Zusage aufbaut, ist
    genauso ungeprüft. (LL-22)
23. **Wandert ein Faktor aus einer Aggregation in eine Basis-Funktion, ist jede
    Formel zu prüfen, die beide Seiten einer Differenz benutzt.** Aus
    `f × (a − b)` wird dann `(a − b × f)` — die Klammer ist **gemischt**, ein
    Faktor außen würde die bereits umgerechnete Seite ein zweites Mal kürzen.
    Das fällt nicht auf, weil keine Zahl offensichtlich falsch *aussieht*.
    Wächter ist die B2-Invariante (§6 Stolperfalle 9), und sie ist in **allen
    zwölf** Monaten zu prüfen, nicht stichprobenartig. (LL-23)
24. **Runden ist eine Entscheidung mit Anker-Wirkung.** Eine Zwischengröße je
    Karte zu runden, während die Vergleichsfunktion erst die Endsumme rundet,
    bewegt die Sparrate um Cent-Beträge — und damit den schärfsten
    Regressions-Wächter des Projekts. Vor jedem neuen `round()` prüfen, ob die
    **Gegenseite genauso rundet**. Im Zweifel nicht runden: die Aufrufer runden
    ohnehin am Ende. (LL-24)
```

---

## C3 · §8 — zwei neue Register-Zeilen

**Anker** (letzte Zeile des Registers):

```
| LL-22 | Eine Doku-Zusage über Rechenverhalten ist keine Prüfung — gegen die Funktion belegen, nicht aus dem Zweck erschließen | §7 Regel 22 | v2-11 (BF-5) |
```

**Patch-Satz** — ersetzt den Anker:

```markdown
| LL-22 | Eine Doku-Zusage über Rechenverhalten ist keine Prüfung — gegen die Funktion belegen, nicht aus dem Zweck erschließen | §7 Regel 22 | v2-11 (BF-5) |
| LL-23 | Wandert ein Faktor in eine Basis-Funktion, wird aus `f × (a − b)` ein `(a − b × f)` — gemischte Klammer, B2 in allen zwölf Monaten prüfen | §7 Regel 23 · §6 Stolperfalle 11 | v2-13 (BF-4) |
| LL-24 | Runden ist eine Entscheidung mit Anker-Wirkung — prüfen, ob die Gegenseite genauso rundet | §7 Regel 24 | v2-13 (BF-4) |
```

---

## C4 · Kopf — „Letzte Aktualisierung" nachziehen

**Anker:**

```
> **Letzte Aktualisierung:** 05. August 2026 · **nach:** v2-11 (Juli-Anker auf
> −322,75 € nach der `BF-5`-Migration, **neue Regel 22 / LL-22**, §9-Lage nachgezogen —
> nächster Sprint ist `BF-2`). Davor v2-10 (Prüfanker auf den gemessenen Stand, LL-6
> um die Portal-Kehrseite ergänzt) und die Entscheidung E2.
```

**Patch-Satz:**

```markdown
> **Letzte Aktualisierung:** 05. August 2026 · **nach:** v2-13 (`BF-4` — der
> Split-Anteil wird genau einmal angewandt; **neue Stolperfalle 11**, **neue Regeln
> 23/24 mit LL-23/LL-24**). Damit ist **Paket 1 vollständig**: alle fünf Befunde vom
> 04.08. sind erledigt. **§9 ist in diesem Patch NICHT nachgezogen** — die Prüfanker
> stehen weiterhin auf dem v2-11-Stand und brauchen eine eigene Freigabe.
> Davor v2-11 (Juli-Anker auf
> −322,75 € nach der `BF-5`-Migration, **neue Regel 22 / LL-22**, §9-Lage nachgezogen).
> Davor v2-10 (Prüfanker auf den gemessenen Stand, LL-6
> um die Portal-Kehrseite ergänzt) und die Entscheidung E2.
```

---

## Was bewusst NICHT geändert wurde

| Stelle | Warum |
|---|---|
| **§9 Aktueller Stand / Prüfanker** | Nicht unter den drei freigegebenen Vorschlägen. Die Werte sind nach v2-13 unverändert gültig — der Nachzug ist trotzdem eine eigene Entscheidung. |
| **§4 Fähigkeiten-Tabelle** | Die Korrekturen an `sprint-abschluss` (ESLint) und `db-eingriff` (Restore-Timing, Prüfsummen) betreffen die Fähigkeits-Dateien, nicht CLAUDE.md. |
| **§2 Tech-Stack** | Unberührt. |
| **§8 LL-6** | Der Portal-Merksatz aus v2-10 steht weiterhin als unfreigegebener Vorschlag im v2-10-Review. |

---

*Doku-Patch · Antigravity Finance · 05. August 2026*
