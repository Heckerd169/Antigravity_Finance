---
name: sprint-briefing
description: Vorlage und Prüfregeln für ein Sprint-Briefing in Antigravity Finance — Ziel, Vorbedingungen, Phasenplan, Akzeptanzkriterien, Anti-Drift-Liste, Smoke-Sequenz, Verifikationsplan. Laden, bevor ein neuer Sprint geschnitten wird, und immer dann, wenn aus einem Befund oder Konzeptpapier Arbeit werden soll. Enthält die Prüfungen, die vor der Freigabe zu laufen haben (LL-12, LL-15, LL-19, LL-20).
---

# Sprint-Briefing schreiben

**16 Briefings sind geschrieben worden, zwölf Abschnitte wiederholen sich darin —
und eine Vorlage gab es nie.** Folge: v2-07 bricht aus der Form aus, und für v2-05
und v2-06 wurde gar kein Briefing mehr geschrieben (die Konzeptpapiere aus `V2/`
haben die Rolle übernommen). Das hat funktioniert, war aber Zufall, nicht Methode.

Ein Briefing ist kein Selbstzweck. Es zwingt dazu, **vorher** zu sagen, woran man
Erfolg erkennt — und genau daran sind in diesem Projekt mehrere Sprints
entlanggeschrammt.

---

## Wann ein eigenes Briefing, wann nicht

| Lage | Vorgehen |
|---|---|
| Mehrere Themen, mehrere Phasen | eigenes Briefing, Vorlage unten |
| Ein Konzeptpapier in `V2/` beschreibt die Arbeit bereits vollständig | Papier **ist** das Briefing — in `CLAUDE.md` und im Review ausdrücklich so benennen (Muster v2-05, v2-06) |
| Ein Befund-Dokument nennt Diagnose, Vorschlag und Prüfanker | Briefing kann sich auf Zuschnitt, Phasen und Akzeptanzkriterien beschränken und für das Fachliche verweisen |
| Ein einzelner kleiner Fix | kein Briefing — Commit-Nachricht plus Review-Absatz reichen |

Der häufigste Fehler ist nicht das fehlende Briefing, sondern das **stillschweigend**
fehlende. Wenn keins entsteht, gehört das in den Review.

---

## Vorlage

```markdown
# Sprint v2-NN — <Thema>

> **Datum** · **Branch** `sprint/v2-NN-<thema>` · **Quelle** <Roadmap-ID / Befund / Papier>

## 0. Ziel — ein Satz
Was nach diesem Sprint anders ist. Wenn das nicht in einen Satz passt,
ist der Sprint zu groß geschnitten.

## 1. Vorbedingungen
Was fertig sein muss, bevor Phase 1 startet: gemergte Sprints, vorliegende
Entscheidungen, angelegte Testdaten, freigegebene Migrationen. Jede offene
Entscheidung hier namentlich nennen (z. B. „hängt an E1").

## 2. Umfang je Phase
Phasen-sequenziell (LL-14), ein Commit je Phase. Je Phase:
- was gebaut wird
- welche Dateien voraussichtlich berührt werden
- ob die Datenbank berührt wird (dann Fähigkeit `db-eingriff` einplanen)

## 3. Akzeptanzkriterien
Tabelle A1…An. **Regel-basiert formulieren, nicht instanz-basiert** (LL-19):
„alle Eigen-Konto-Transfers werden markiert", nicht „diese drei Buchungen".
Jedes Kriterium muss nachprüfbar sein — Messwert, Datei:Zeile oder Screenshot.

## 4. Anti-Drift — was dieser Sprint NICHT tut
Ebenso wichtig wie der Umfang. Benachbarte Baustellen, die auffallen werden,
hier ausdrücklich ausschließen, mit Verweis auf ihre Roadmap-ID.

## 5. Prüfanker
Welche Zahl darf sich bewegen, welche nicht — mit dem erwarteten Wert.
Reine Darstellungs-Sprints: „kein Zahlenwert bewegt sich."

## 6. Smoke-Sequenz
S1…Sn: Schritt, Erwartung, betroffener § der Design-Doku.

## 7. Stolperfallen
Bekannte Fallen aus früheren Sprints, die in diesem Umfang wieder greifen —
mit LL-Nummer.

## 8. Offene Fragen
Was vor oder während des Sprints entschieden werden muss. Leer lassen ist
ein Warnzeichen, kein gutes Zeichen.
```

---

## Prüfungen vor der Freigabe

Diese vier Prüfungen haben in der Vergangenheit jeweils einen halben Sprint gerettet
oder gekostet. Alle vier durchgehen, bevor das Briefing steht.

**1 · Kartentyp in jeder Erwartung genannt? (LL-12)**
„Realität gewinnt" gilt **nur** für FIXED_COST und INCOME. BUDGET zeigt den Plan,
solange Fragmente ≤ Plan. Wer eine Erwartung ohne Kartentyp formuliert, formuliert
mit einiger Wahrscheinlichkeit die falsche. Der Status „ÜBERSCHRITTEN" existiert
ausschließlich bei BUDGET — taucht er in einer Erwartung auf, ist der Typ zu prüfen.

**2 · Jeder Smoke-Schritt gegen die bestehenden Regeln geprüft? (LL-15)**
Nicht nur gegen die Spec, sondern gegen die **Testdaten**. Ein Beispiel, das real
passiert ist: ein Smoke-Schritt erwartete einen Zustandswechsel per Tap auf einer
Einnahmen-Karte, an der ein Fragment hing — die bestehende Logik verhindert dort
jeden sichtbaren Wechsel. Der Schritt war nicht erfüllbar, der Diagnoseaufwand
umsonst. Also prüfen: hat diese Karte in diesem Monat ein verlinktes Fragment?

**3 · Akzeptanzkriterien regel-basiert? (LL-19)**
Gilt die Regel über die Testdaten hinaus, muss das Kriterium die Regel nennen.
Sonst schlägt korrektes Verhalten fälschlich als Fehler an.

**4 · Widerspricht ein Aufwands-Budget der Spec? (LL-20)**
Beschreibt das Briefing eine Berechnung sowohl fachlich als auch über ein
Performance-Budget („12×2+1 Aufrufe"), und passen die beiden nicht zusammen, gewinnt
die fachliche Beschreibung. Das Budget ist beschreibend, der § ist normativ.
Nicht raten — klären, bevor gebaut wird.

---

## Woher der Umfang kommt

- `V2/v2_roadmap_konsolidiert.md` Abschnitt 0.1 — Stand und Reihenfolge-Vorschlag
- `V2/befunde_*.md` — diagnostizierte Fehler mit fertigen Prüfankern
- offene Entscheidungen des Design-Direktors — siehe Roadmap Abschnitt 17

Ein Sprint zieht sich seinen Umfang **aus der Roadmap**, nicht aus dem Gefühl. Steht
ein Thema nicht dort, gehört es zuerst dorthin.
