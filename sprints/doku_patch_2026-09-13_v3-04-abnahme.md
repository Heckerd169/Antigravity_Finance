# Doku-Patch 13.09.2026 — v3-04 ist abgenommen und gemergt

> **Verfahren:** §7 Regel 14 / LL-16 — Anker + Patch-Satz, **mit ausdrücklicher Freigabe
> des Users**. Alle Anker vor der Anwendung einzeln auf Eindeutigkeit geprüft.
>
> **Anlass:** Der Nutzer hat v3-04 am 13.09.2026 gemergt (`b0597c3`) und am iPhone
> abgenommen — **alle vier Tabs bleiben im Vollbild**, und Versatz wie tote Tab-Leiste
> sind mit verschwunden. §9 behauptet noch, der Sprint liege als Pull Request vor.
>
> **Umfang:** rein redaktionell, **netto ±0 Zeilen**. Es kommt keine Regel dazu —
> Stolperfalle 34 und LL-47 stehen bereits und bleiben unverändert richtig.

---

## P1 · §9 — der Sprint liegt nicht mehr als PR vor

**Anker:**

```
**Alles bis einschließlich v3-03 ist in `main`**
```

**Patch-Satz** — ersetzt den Absatz bis einschließlich
`Abnahme am iPhone als Pull Request vor.`:

```markdown
**Alles bis einschließlich v3-04 ist in `main`** (PR #61, `b0597c3`), dazu die Nachzüge
vom 07.09.2026 und die Fixes vom 03.09.2026. Geprüft **gegen den Baum**, **nicht** gegen
den PR-Status — der beantwortet eine andere Frage. **v3-04 ist am 13.09.2026 am iPhone
abgenommen:** alle vier Tabs bleiben im Vollbild.
```

---

## P2 · §9 — der Kasten sagt „noch nicht abgenommen"

**Zwei minimale Eingriffe statt eines Kasten-Tauschs** — der Kasten ist inhaltlich
richtig, nur seine Überschrift ist überholt.

**P2a · Anker** (ersetzt genau diese eine Zeile):

```
> **`/mobil` ist vollständig und noch nicht abgenommen.** v3-03 hat die drei fehlenden
```

**Patch-Satz:**

```markdown
> **`/mobil` ist vollständig und abgenommen.** v3-03 hat die drei fehlenden
```

**P2b · Anker** (der neue Absatz wird **danach** eingefügt):

```
> darunter elf Render-Prüfungen bei exakt 430 × 932 — und der Fehler war trotzdem da.
```

**Patch-Satz** — angehängt an den Kasten:

```markdown
>
> **Die Abnahme hat zusätzlich eine Schnitt-Entscheidung bestätigt:** v3-04 hat von drei
> Symptomen bewusst nur **eines** behandelt und die beiden anderen als Folgen — sie sind
> mit verschwunden, ohne dass an `.frame`, `100dvh` oder den Safe Areas etwas geändert
> wurde. Drei Pflaster hätten genau dort angesetzt, wo `position: fixed` bricht (LL-6).
```

---

## P3 · §9 — „Nächste Arbeit" ist nicht mehr die Abnahme

**Anker:**

```
| **Nächste Arbeit** | **Die Abnahme von v3-04 am iPhone**
```

**Patch-Satz** — ersetzt die Zelle:

```markdown
| **Nächste Arbeit** | Frei wählbar — **`/mobil` ist fertig und abgenommen**. Naheliegend: das Re-Design (Paket 19) oder `ZO-7` (die App kennt den Händler und zeigt ihn nicht). |
```

---

## Was ausdrücklich NICHT geändert wird

- **§6 Stolperfalle 34 und §8 LL-47** bleiben unverändert. Die Abnahme bestätigt sie,
  sie ändert nichts an ihnen.
- **Die drei Prüfanker, die Messregel und die Momentaufnahme** bleiben unangetastet.
- **Keine neue Regel aus der Abnahme.** Die Lehre „mehrere Symptome, eines zuerst — die
  anderen als Folgen behandeln und das messen" ist im Review und in der Historie
  festgehalten. Sie ist eine gute Beobachtung, aber **sie gilt nicht immer**: Ob
  Symptome zusammenhängen, entscheidet sich am Einzelfall. Nach der Regel aus
  `claude-md-pflege` gehört sie damit nicht in die Verfassung.
