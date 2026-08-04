---
name: sprint-start
description: Startpunkt jedes Sprints in Antigravity Finance — Nachbohren, dann Planen, dann Freigabe. Laden, sobald ein neuer Sprint beginnt, auch bei „was ist eigentlich dran?". Fragt erst die Annahmen auseinander, schneidet dann den Umfang, zieht bei Gestaltungsfragen `design-direktor` und bei Datenbank-Berührung `db-eingriff` hinzu, und legt am Ende einen Plan zur Freigabe vor. Ersetzt die frühere Fähigkeit `sprint-briefing` — deren Prüfungen laufen hier mit.
---

# Sprint starten

Diese Fähigkeit hat **eine** Aufgabe: verhindern, dass gebaut wird, bevor klar ist,
was Erfolg bedeutet.

Die Reihenfolge ist verbindlich und nicht abkürzbar:

> **① Nachbohren → ② Schneiden → ③ Plan vorlegen → ④ Freigabe abwarten**

Der häufigste Fehler ist, ① zu überspringen, weil der Auftrag klar *klingt*. Er
klingt fast immer klar. Die Annahmen, die auseinandergehen, zeigen sich erst beim
Nachfragen — oder eben im Review.

---

## Phase ① · Nachbohren

**Bevor irgendetwas geplant wird.** Keine Lösung, keine Aufwands-Einschätzung. Nur
klären — so lange, bis die Antworten zusammenpassen.

### Wie gefragt wird — drei Regeln, die über allem stehen

Diese drei entscheiden, ob das Nachbohren hilft oder nur anstrengt. Sie stammen aus
`grilling` (Matt Pocock, 749.000 Installationen), abgeglichen am 04.08.2026 gegen die
erste Fassung dieser Fähigkeit — die alle drei verletzt hat.

**① Eine Frage nach der anderen. Antwort abwarten.**
Mehrere Fragen auf einmal sind verwirrend und liefern oberflächliche Antworten auf
alle statt einer guten auf eine. Die sechs Punkte unten sind **kein Fragebogen**,
den man am Stück vorlegt — sie sind eine Liste dessen, was am Ende geklärt sein muss.

**② Zu jeder Frage die eigene empfohlene Antwort mitliefern.**
Nicht „Welchen Prüfanker nehmen wir?", sondern „Ich schlage als Prüfanker vor: Juli-Ist
von −1.222,75 auf −322,75, alle anderen Monate unverändert. Passt das?" Aus einem
Verhör wird ein Vorschlag, den der User bestätigen oder korrigieren kann — das ist
schneller und erheblich weniger ermüdend.

**③ Fakten selbst nachschlagen. Nur Entscheidungen vorlegen.**
Was im Code, in der Datenbank oder in der Doku steht, wird **nachgesehen**, nicht
gefragt. Welcher Kartentyp betroffen ist, wie der heutige Wert lautet, wo eine Funktion
liegt — das ist Recherche, keine Entscheidung. Gefragt wird nur, was der User
entscheiden **muss**. Wer Nachschlagbares abfragt, macht das Nachbohren zur Last und
bekommt dafür zu Recht kurze Antworten.

**Reihenfolge:** den Entscheidungsbaum Ast für Ast abgehen. Hängt Frage B an der
Antwort auf A, kommt A zuerst — sonst wird B zweimal gestellt.

### Was am Ende geklärt sein muss

Sechs Punkte. **Nicht als Block abfragen** — siehe Regel ① — und jeden weglassen,
den du dir selbst beantworten kannst (Regel ③).

**1 · Was genau soll danach anders sein?**
In einem Satz, aus Sicht des Benutzers. Passt es nicht in einen Satz, ist der Sprint
zu groß geschnitten. Nachfassen, bis der Satz steht.

**2 · Was fassen wir ausdrücklich NICHT an?**
Die wichtigste Frage überhaupt. Bei jedem Thema fallen benachbarte Baustellen auf —
wenn sie nicht vorher ausgeschlossen werden, wandern sie unbemerkt in den Sprint und
die Prüfung passt am Ende nicht mehr zum Umfang.

**3 · Woran erkennen wir Erfolg? Welche Zahl darf sich bewegen — und welche nicht?**
Bei allem, was rechnet, ist das der Prüfanker. Bei reinen Darstellungssachen lautet
die Antwort: **kein Zahlenwert bewegt sich** — und das ist ein vollwertiges Ergebnis,
kein fehlendes.
*Muster für einen brauchbaren Anker:* „Juli-Ist −1.222,75 € → **−322,75 €**, exakt
+900,00 €, alle anderen Monate unverändert."

**4 · Welcher Kartentyp ist betroffen?**
Sobald Karten im Spiel sind. „Realität gewinnt" gilt **nur** für Fixkosten und
Einnahmen — Budget zeigt den Plan, solange die Ausgaben darunter liegen. Wer den Typ
nicht nennt, formuliert mit einiger Wahrscheinlichkeit eine Erwartung, die gar nicht
eintreten kann. Taucht „überschritten" in einer Erwartung auf, ist der Typ zu prüfen:
den Zustand gibt es nur bei Budget-Karten. *(LL-12)*

**5 · Steckt eine Gestaltungsfrage drin?**
Ist etwas zu entscheiden, das man **sehen** kann — Farbe, Anordnung, Wortlaut, Geste?
→ Dann Fähigkeit **`design-direktor`**, und zwar **bevor** geplant wird.
Steht das Sollverhalten schon in der Design-Doku, ist es keine Gestaltungsfrage,
sondern ein Bauauftrag.

**6 · Wird die Datenbank berührt?**
Migration, neue oder geänderte Datenbank-Funktion, Änderung an einer Rechenfunktion,
verändernder Testlauf? → Dann Fähigkeit **`db-eingriff`** in den Plan einbauen, mit
Übungs-Datenbank-Probe. Im Zweifel ja.

### Nachhaken, wo es weich wird

Die Pflichtfragen holen die Struktur. Die Substanz kommt aus dem Nachhaken. Vier
Muster, an denen sich fast immer noch etwas verbirgt:

| Wenn du hörst … | … dann frag |
|---|---|
| „das sollte einfach mal besser funktionieren" | Woran merkst du beim Benutzen, dass es *nicht* funktioniert? Gib mir den letzten konkreten Fall. |
| „so wie bei X" | Was genau an X ist das Richtige — und was daran ausdrücklich nicht? |
| „das ist doch klar" | Dann sag mir bitte den Satz, den ich in die Prüfung schreibe. |
| eine Lösung statt eines Problems | Welches Problem löst das? Gibt es einen zweiten Weg dorthin? |

**Und drei Fragen, die selten gestellt werden und oft etwas zutage fördern:**

- **Was passiert, wenn wir es gar nicht bauen?** Manchmal ist die ehrliche Antwort
  „nichts Schlimmes" — dann gehört das Thema nach hinten, nicht in diesen Sprint.
- **Wer oder was hängt daran?** Entsperrt es andere Pakete, oder steht es allein?
- **Was ist der teuerste Irrtum, den wir hier machen können?** Meist ist das die
  Stelle, an der der Prüfanker gebraucht wird.

### Wann Phase ① fertig ist

Wenn du den Sprint in **drei Sätzen** wiedergeben kannst — Ziel, Nicht-Ziel, Anker —
und der User bei allen dreien nickt. Vorher nicht.

Widersprechen sich zwei Antworten: **anhalten und den Widerspruch benennen**, nicht
eine Lesart auswählen. Das hat sich bewährt — die Freigabe kommt danach schnell.

---

## Phase ② · Schneiden

### Umfang kommt aus der Roadmap

`V2/v2_roadmap_konsolidiert.md` ist die Quelle. Sie ist nach **Sprint-Paketen**
geordnet; ein Paket ist ein planbarer Sprint.

**Steht das Thema nicht dort, gehört es zuerst dorthin.** Sonst konkurriert eine
unscharfe Idee unsichtbar mit allem anderen — und gewinnt gegen das, was gerade
lauter ist, statt gegen das, was wichtiger ist.

Prüfen: Hängt das Paket an einer offenen Entscheidung? Paket 1 etwa hängt an E1, E2
und E3 aus dem Befund-Papier. Ist die Antwort nicht da, kann der Teil nicht gebaut
werden — der Rest oft schon.

### Phasen bilden

Ein Commit je Phase, Phase N+1 startet erst nach grüner Phase N. *(LL-14)*

Gute Phasengrenzen liegen dort, wo eine Phase **allein zurücknehmbar** wäre. Faustregel:
zuerst das Entschiedene und Unabhängige, dann das Abhängige, zuletzt das
Konzeptionelle. Alles, was die Datenbank berührt, bekommt eine eigene Phase.

### Die vier Prüfungen vor der Freigabe

Aus der früheren Fähigkeit `sprint-briefing` übernommen. Jede hat schon einmal einen
halben Sprint gekostet.

**1 · Kartentyp in jeder Erwartung genannt?** *(LL-12)* — siehe Pflichtfrage 4.

**2 · Jeder Prüfschritt gegen die bestehenden Regeln UND die Testdaten geprüft?**
*(LL-15)* Real passiert: Ein Prüfschritt erwartete einen Zustandswechsel per Tippen
auf einer Einnahmen-Karte, an der ein Kontoumsatz hing — die bestehende Logik
verhindert dort jeden sichtbaren Wechsel. Der Schritt war nicht erfüllbar, der
Diagnoseaufwand umsonst. Also prüfen: Hat diese Karte in diesem Monat einen
zugeordneten Umsatz?

**3 · Akzeptanzkriterien regel-basiert, nicht instanz-basiert?** *(LL-19)*
„Alle Eigen-Konto-Überträge werden markiert", nicht „diese drei Buchungen". Sonst
schlägt korrektes Verhalten fälschlich als Fehler an.

**4 · Widerspricht ein Aufwands-Budget der Spezifikation?** *(LL-20)* Wenn ja,
gewinnt die Spezifikation. Das Budget ist beschreibend, der § ist normativ. Nicht
raten — klären.

---

## Phase ③ · Plan vorlegen

Über den **Planungsmodus**, damit der User ihn annehmen oder ändern kann.

Der Plan enthält, knapp:

```
Ziel (ein Satz)
Nicht-Ziel — was ausdrücklich nicht angefasst wird
Prüfanker — welche Zahl sich bewegen darf, welche nicht
Phasen — je Phase: was, welche Dateien, Datenbank ja/nein
Prüfschritte — S1…Sn mit Erwartung und § der Design-Doku
Offene Fragen — leer ist ein Warnzeichen, kein gutes Zeichen
```

### Wann zusätzlich eine Briefing-Datei entsteht

**Nicht immer.** Der freigegebene Plan reicht für die meisten Sprints.

Eine eigene Datei `sprints/sprint_v2-NN_briefing.md` entsteht, wenn **eines** zutrifft:

- Die Datenbank wird berührt
- Mehr als drei Phasen
- Der Sprint erstreckt sich über mehrere Sitzungen
- Es hängt eine Entscheidung daran, die schriftlich festgehalten werden muss

Der Grund für die Ausnahme: Was über eine Sitzung hinausreicht, muss in einer Datei
stehen — ein Chat-Verlauf wird von der nächsten Sitzung nicht gelesen.

---

## Phase ④ · Freigabe

**Erst nach dem ausdrücklichen Ja des Users wird gebaut.** Nicht „klingt sinnvoll",
nicht ein Nebensatz — eine Freigabe.

Danach beginnt Phase 2 des Sprints. Am Ende: Fähigkeit **`sprint-abschluss`**.

---

## Abhakliste

- [ ] **Eine Frage nach der anderen** gestellt, nicht als Block
- [ ] **Zu jeder Frage die eigene Empfehlung** mitgeliefert
- [ ] **Nachschlagbares nachgeschlagen**, nicht abgefragt
- [ ] Alle sechs Punkte geklärt — durch Nachsehen oder durch Fragen
- [ ] Wo es weich wurde, nachgehakt — nicht die erste Antwort genommen
- [ ] Ziel, Nicht-Ziel und Anker in drei Sätzen, vom User bestätigt
- [ ] Gestaltungsfrage geklärt (`design-direktor`) oder ausgeschlossen
- [ ] Datenbank-Berührung geklärt (`db-eingriff`) oder ausgeschlossen
- [ ] Thema steht in der Roadmap — sonst zuerst dorthin
- [ ] Blockierende Entscheidungen geprüft
- [ ] Phasen gebildet, jede einzeln zurücknehmbar
- [ ] Die vier Prüfungen durchgegangen (LL-12, LL-15, LL-19, LL-20)
- [ ] Plan über den Planungsmodus vorgelegt
- [ ] Briefing-Datei angelegt, falls eines der vier Kriterien zutrifft
- [ ] **Freigabe eingeholt** — vorher wird nichts gebaut
