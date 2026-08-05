# Doku-Patch 05.08.2026 — CLAUDE.md nach Sprint v2-11

**Ziel-Dokument:** `CLAUDE.md` (die Verfassung) · zusätzlich Fähigkeit
`.claude/skills/db-eingriff/SKILL.md`
**Freigabe:** Dominik, 05.08.2026 — *„Ja, zieh die Juli-Zeile nach — und LL-22 und
db-eingriff auch"*
**Verfahren:** §7 Regel 14 / LL-16, Anker + Patch-Satz je Stelle. Die Fähigkeit ist
formal nicht von Regel 14 erfasst (sie gilt für die zwei Bibeln und CLAUDE.md); sie
wird hier trotzdem mitgeführt, damit der Vorgang an einer Stelle nachlesbar ist.
**Status:** ✅ angewendet am 05.08.2026. Alle Anker vorher als eindeutig bestätigt.

---

## Patch 1 — §9: Juli-Anker auf den Stand nach der Migration

**Anker:**

```
| **Juli** | **−1.222,75 €** |
```

**Patch — ersetzen durch:**

```markdown
| **Juli** | **−322,75 €** |
```

---

## Patch 2 — §9: der Hinweis darunter ist eingelöst

**Anker:**

```
> **Juli und Juni bewegen sich noch.** `BF-5` (Fragmente werden ohne Vorzeichen
> addiert) ist diagnostiziert, aber nicht behoben — er hängt an Entscheidung **E2**.
> Sein Prüfanker steht fest: Juli-Ist **−1.222,75 → −322,75 €**, alle anderen Monate
> unverändert. Erst danach ist die Tabelle wieder für längere Zeit stabil.
```

**Patch — ersetzen durch:**

```markdown
> **Der Juli-Wert ist seit v2-11 neu.** `BF-5` (Fragmente wurden ohne Vorzeichen
> addiert) ist am 05.08.2026 behoben und die Migration auf Produktion angewendet:
> Juli-Ist **−1.222,75 → −322,75 €**, exakt die vorab festgelegten +900,00 €, alle
> übrigen elf Monate um 0,00 € bewegt. Zusätzlich verifiziert: die
> B2-Treiber-Invariante `Σ delta = Ist − Plan` hält in allen zwölf Monaten.
> Die Tabelle ist damit wieder für längere Zeit stabil — der nächste Wert, der sich
> planmäßig bewegen wird, hängt an `BF-4` (Entscheidung **E1**, gemeinsame Karten).
```

---

## Patch 3 — §9: Doku-Versionen

**Anker:**

```
**Doku-Versionen:** Design-Doku **v3.1.7** · Schema-Doku **v3.4.1**.
```

**Patch — ersetzen durch:**

```markdown
**Doku-Versionen:** Design-Doku **v3.1.8** · Schema-Doku **v3.4.2**.
```

---

## Patch 4 — §9: „Nächster Sprint" ist nicht mehr `BF-5`

**Anker:** der Absatz, der mit `**Nächster Sprint: \`BF-5\`.**` beginnt, samt dem
eingerückten Kasten darunter und dem Folgeabsatz zu `BF-2`/`BF-4`.

**Patch — ersetzen durch:**

```markdown
**Nächster Sprint: `BF-2`.** Von den fünf Befunden sind **drei erledigt** — `BF-3`
und `BF-1` (v2-10) sowie `BF-5` (v2-11, Migration angewendet und verifiziert). Paket 1
besteht damit nur noch aus zwei entscheidungs-gebundenen Punkten: **`BF-2` wartet auf
E3**, `BF-4` auf **E1**.

`BF-2` (sinnloser Hinweis unter dem Ring bei negativer Sparrate) ist der
naheliegendste nächste Schritt: **E3** ist die kleinste der drei Entscheidungen, und
der Punkt ist erst jetzt sinnvoll — seit v2-11 stimmt die Juli-Zahl, der neue Text
wäre also am echten Fall zu sehen statt an einer erfundenen Situation.
```

---

## Patch 5 — §7 Grundregeln: neue Regel 22 (LL-22)

**Anker:**

```
21. **Vor und nach jedem Eingriff die Sparrate messen.** Der Anker ist der schärfste
```

**Patch:** Nach dem vollständigen Punkt 21 einen neuen Punkt 22 anfügen:

```markdown
22. **Eine Doku-Zusage über Rechenverhalten ist keine Prüfung.** Wo ein Papier
    beschreibt, *was* eine Rechenfunktion tut, gehört die Aussage **gegen die
    Funktion belegt** — nicht aus ihrem Zweck erschlossen. Und eine
    Aufwands-Entscheidung, die auf einer solchen ungeprüften Zusage aufbaut, ist
    genauso ungeprüft. (LL-22)
```

---

## Patch 6 — §8 Register: LL-22 eintragen

**Anker:**

```
| LL-21 | Unlimitierte Selects gegen wachsende Tabellen sind verdächtig (1000-Zeilen-Grenze) | §7 Regel 18 | v2-07 P0 |
```

**Patch:** Neue Zeile darunter:

```markdown
| LL-22 | Eine Doku-Zusage über Rechenverhalten ist keine Prüfung — gegen die Funktion belegen, nicht aus dem Zweck erschließen | §7 Regel 22 | v2-11 (BF-5) |
```

**Vorfall, der die Regel erzeugt hat:** Der Erstattungs-Leitfaden (Design-Doku §11,
Beschluss 24.07.2026) hielt fest, `calculate_card_amount_for_month` summiere
vorzeichenrichtig — und schloss daraus, ein RPC-Eingriff sei „nicht nötig und wurde
bewusst verworfen". Die Funktion summierte mit `SUM(ABS(...))`. Beides stand zwölf
Tage lang in einem freigegebenen Dokument; aufgefallen ist es erst, als eine Karte
zum ersten Mal gemischte Vorzeichen bekam — mit **900 €** Wirkung auf die
Juli-Sparrate.

**Abgrenzung zu LL-11/LL-13:** Dort geht es um *Diagnose vor dem Patchen* — beobachtetes
Verhalten sagt nicht, wo die Ursache liegt. LL-22 sitzt eine Ebene früher: Dort hat
**die Spezifikation selbst** eine ungeprüfte Behauptung über die Implementierung
aufgestellt und daraus eine Nicht-Handlung abgeleitet.

---

## Patch 7 — Fähigkeit `db-eingriff`: die Testreihe zweimal fahren

**Anker:** `.claude/skills/db-eingriff/SKILL.md`, Ende von Abschnitt „3 · Migration
auf der Übungs-DB proben", exaktes Zitat:

```
> v2-05 hat auf diesem Weg **einen echten Fehler im Entwurf gefunden** (falscher
> Append-Operator auf `text[]`), bevor er Produktion erreichte. Das ist der ganze
> Zweck des Schritts.
```

**Patch:** Darunter anfügen:

```markdown
> **Die Reihe zweimal fahren — einmal VOR der Migration.** Der Baseline-Lauf gegen
> die unveränderte Funktion kostet nichts (alles rollt ohnehin zurück) und liefert
> zwei Dinge, die der Nachher-Lauf allein nicht kann: Er belegt, dass die Migration
> **genau** das ändert, was sie ändern soll — und er entlarvt Fehler im Testaufbau.
>
> In v2-11 hat er beides getan: Eine Budget-Testkarte war versehentlich ab Januar
> aktiv und zog den Anker innerhalb der Transaktion von 2.200 auf 2.050. Das sah aus
> wie eine Wirkung der Migration, war aber ein Fehler in der Probe. Ohne den
> Vorher-Lauf wäre er als Migrationsfehler missdeutet worden — oder schlimmer, als
> akzeptable Abweichung durchgewinkt.
>
> Faustregel: **Die Zeilen, die sich NICHT bewegen dürfen, sind der eigentliche
> Beweis.** Ohne Vorher-Wert kann man sie nicht zeigen.
```

---

*Doku-Patch · Antigravity Finance · 05. August 2026*
