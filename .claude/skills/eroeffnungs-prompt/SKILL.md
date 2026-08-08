---
name: eroeffnungs-prompt
description: Schreibt den Eröffnungsprompt für eine NEUE Claude-Code-Sitzung in Antigravity Finance — Bau-Sprint, Gestaltungsrunde oder Nachzug. Laden, sobald der User eine Sitzung woanders starten will („gib mir einen Prompt für…", „ich mache das in einem zweiten Chat"). Holt den Stand frisch aus Roadmap und CLAUDE.md, wählt die Fallen aus, die zu genau diesem Thema gehören, und empfiehlt Modell und Denkaufwand. NICHT laden, um einen Sprint zu planen — das ist `sprint-start` und passiert in der neuen Sitzung, nicht hier.
---

# Eröffnungsprompt schreiben

Diese Fähigkeit hat **eine** Aufgabe: eine fremde Sitzung so ausstatten, dass sie nicht
in eine Falle läuft, die dieses Projekt schon einmal bezahlt hat.

Der Prompt ist kein Auftragszettel. Er ist die **einzige** Gelegenheit, Wissen in eine
Sitzung zu bringen, die weder diesen Chat noch das Projekt-Gedächtnis kennt.

> **Die Erfahrung, aus der das hier entstanden ist (07.08.2026):** Zwei parallel
> eröffnete Sitzungen — Bau-Sprint `RM-2`+`PA-1` und die Gestaltungsrunde zu Paket 4 —
> liefen beide durch, ohne dass die bekannte `pointer-events`-Falle jemanden gekostet
> hat. Sie stand im Prompt. Das ist der ganze Trick.

---

## Ablauf

### ① Den Stand FRISCH holen — nicht aus dem Gedächtnis

Immer nachschlagen, nie erinnern. Drei Quellen, in dieser Reihenfolge:

| Quelle | Wofür |
|---|---|
| `V2/v2_roadmap_konsolidiert.md` | Was ist offen? Hängt das Thema an einer Entscheidung? §0 nennt den Stand, die Paket-Tabelle die Warnungen am Punkt selbst |
| `CLAUDE.md` §9 | Letzter Sprint, Doku-Versionen, **Prüfanker** |
| das Projekt-Gedächtnis | was gerade parallel läuft, offene Nachzüge |

Ist das Thema in der Roadmap als **nicht schneidbar** markiert, ist der Bau-Prompt der
falsche — dann braucht es zuerst eine Gestaltungsrunde.

### ② Die Sorte bestimmen

| Sorte | Fähigkeit in der neuen Sitzung | Endet bei |
|---|---|---|
| **Bau** | `sprint-start` | fertigem Pull Request |
| **Gestaltung** | `design-direktor` | Beschluss-Record unter `V2/` |
| **Nachzug** (Doku, kleiner Fix, Aufräumen) | keine, oder `sprint-abschluss` | Pull Request |

Die drei unterscheiden sich in **Quellen** und **Stopp-Punkt** — sonst in nichts. Alles
Übrige unten gilt für alle.

### ③ Die acht Punkte füllen

Das ist der Kern. Fehlt einer, fehlt er später in der Sitzung.

**1 · Fähigkeit zuerst.** Wörtlich: *„ERSTER SCHRITT: Fähigkeit `X` laden. Nicht aus dem
Gedächtnis planen."* Ohne diesen Satz arbeitet die neue Sitzung aus ihrem Modellwissen
statt aus dem Projektverfahren.

**2 · Eigener Worktree.** Immer. Bei Parallelbetrieb zusätzlich die
**Zuständigkeits-Trennung nach Ordnern** — siehe unten.

**3 · Was gebaut wird UND dass nichts neu gestaltet wird.** Der wichtigste Halbsatz
lautet: *„Alles ist bereits entschieden — nichts neu gestalten."* Dazu die Fundstellen:
Beschluss-Record mit §, Design-Doku mit §, Entwurfsseite unter `design-system/`.
Ergänzt um: *„Taucht eine Frage auf, die dort NICHT beantwortet ist: nicht raten.
Melden und `design-direktor` ziehen"* (§7 Regel 3).

**4 · Die Fallen dieses Themas.** Nicht alle Fallen — die zu **diesem** Thema. Woher sie
kommen, steht in ④.

**5 · Prüfanker.** Welche Zahl sich bewegen darf und welche nicht. Bei reinen
Anzeige-Sprints ist *„kein Zahlenwert bewegt sich"* das Ergebnis, kein fehlendes.
Immer die konkreten Werte aus `CLAUDE.md` §9 mitgeben, plus die Erwartung der
Prüfstrecke (`tsc` 0 · Lint 0/0 · Build 0 · `test:visual` N/N).

**6 · Deine Verfügbarkeit.** ⚠️ **Der Punkt, der am leichtesten vergessen wird und am
meisten kostet.** Die App ist Desktop-only, die Entwurfsseiten sind für 1440 px gebaut.
Ist der User unterwegs oder am Handy, kann er **weder den Browser-Smoke machen noch
Gestaltungs-Entwürfe beurteilen** — dann muss die Sitzung ausdrücklich **vor** der
Abnahme anhalten, statt auf eine Freigabe zu warten, die nicht kommen kann.
Bei einer Gestaltungsrunde zusätzlich: erst im Dialog klären, Entwürfe später ansehen,
und **keine Entscheidung als gefallen protokollieren, die der User nur beschrieben und
nicht gesehen hat.**

**7 · Modell und Denkaufwand** — siehe ⑤.

**8 · Wo Schluss ist.** *„Kein Merge, kein Deploy."* Zwei-Personen-Prinzip, §4.

### ④ Die Fallen auswählen

Nicht erfinden, nachschlagen. Vier Quellen:

| Quelle | Was dort steht |
|---|---|
| `CLAUDE.md` §6 | die Stolperfallen des Datenmodells |
| `CLAUDE.md` §7/§8 | die Arbeitsregeln und das LL-Register |
| Roadmap, am Punkt selbst | themenspezifische Warnungen (oft die wertvollsten) |
| das Projekt-Gedächtnis | die teuren Fallen aus dem Betrieb |

**Faustregel: zwei bis vier Fallen, jede mit dem Vorfall dahinter.** Eine Falle ohne
ihren Vorfall wird als Floskel gelesen und überflogen. Mit Vorfall wird sie geglaubt.

*Beispiel, das getragen hat:* Statt „Vorsicht bei Portalen" stand im v2-16-Prompt, dass
in v2-10 nach einem Portal-Wechsel jeder Klick im Einkommens-Popup zusätzlich die
Jahres-Welle aufriss — **und die komplette Prüfstrecke dabei grün blieb**. Der zweite
Halbsatz ist der, der wirkt.

### ⑤ Modell und Aufwand empfehlen

| Sorte | Empfehlung | Warum |
|---|---|---|
| **Bau**, mehrere Komponenten oder eine bekannte Falle | Opus 5 · hoher Denkaufwand | §-Treue und Fallen-Vermeidung sind Urteilsarbeit |
| **Gestaltung** | Opus 5 · maximaler Denkaufwand | verschränkte Fragen, oft gegen die Verfassung; die anspruchsvollste Arbeit im Projekt |
| **Nachzug**, mechanisch | Sonnet 5 · mittlerer Aufwand | wenig Urteil, viel Sorgfalt |

**Zum Wort `ultrathink`:** Es hebt das Denkbudget, **wenn** die Sitzung nicht ohnehin auf
`max` läuft. Bei `max` ist es wirkungslos — max ist der Deckel. Und es wirkt nur für den
**einen Turn**, in dem es steht, während der Effort-Schalter für die **ganze Sitzung**
gilt. Für lange Dialoge (Gestaltungsrunden) ist deshalb der Schalter das richtige
Instrument; das Wort ist bestenfalls eine Betonung beim Einstieg.

### ⑥ Vorlegen und nachjustieren

Der Prompt geht als **ein zusammenhängender Block** heraus, damit er sich in einem Zug
kopieren lässt — auch vom Handy. Darüber zwei bis drei Sätze, warum Modell und Aufwand
so gewählt sind.

Dann warten. Fast immer kommt noch etwas („nur RM-2", „kürzer", „ich bin unterwegs").
**Genau deshalb ist das hier eine Fähigkeit und kein Subagent** — nachjustieren ist ein
Gespräch, kein neuer Auftrag.

---

## Parallelbetrieb — zwei Sitzungen gleichzeitig

Zulässig und erprobt (07.08.2026), aber es braucht eine **Zuständigkeits-Trennung nach
Ordnern**, sonst überschreiben sich die beiden:

| | gehört der Bau-Sitzung | gehört der Gestaltungsrunde |
|---|---|---|
| Code | `src/`, `tests/` | — |
| Doku | Design-Doku, Schema-Doku, Roadmap | — |
| Papiere | `sprints/` | `V2/` |
| Design-System | `komponenten/` | `entwuerfe/` |

Beide **immer in eigenen Worktrees**. Wer zuerst fertig ist, merged zuerst; der andere
zieht nach. Beide Prompts müssen die Trennung nennen — es genügt nicht, sie einer der
beiden Sitzungen zu sagen.

> **Nebenwirkung, die man einplanen muss:** Gehört ein Ordner der anderen Sitzung, bleibt
> dort liegen, was eigentlich fällig wäre. Nach v2-16 blieben die Entwurfsseiten
> `rm2-schaufenster.html` und `pa1-konsequenz.html` stehen, obwohl die Regel ihr Löschen
> vorsah — der Ordner gehörte der parallelen Runde. Das ist richtig so, gehört aber als
> offener Punkt in den Review, sonst fällt es niemandem mehr auf.

---

## Das Gerüst

```
<Sorte> für Antigravity Finance — <Thema>.
Bitte die gesamte Unterhaltung auf Deutsch führen.

ERSTER SCHRITT: Fähigkeit `<sprint-start | design-direktor>` laden.
Nicht aus dem Gedächtnis planen.

ARBEITE IN EINEM EIGENEN WORKTREE. [Bei Parallelbetrieb: Trennung nennen.]

WAS <GEBAUT | ENTSCHIEDEN> WIRD
· <Thema 1 — in einem Satz, aus Sicht des Benutzers>
· <Thema 2>

ALLES IST BEREITS ENTSCHIEDEN — nichts neu gestalten.   [nur bei Bau]
Record: <V2/…> §N · Design-Doku: §N · Entwurf: design-system/entwuerfe/<…>.html
Taucht eine Frage auf, die dort NICHT beantwortet ist: nicht raten.
Melden und `design-direktor` ziehen (§7 Regel 3).

DIE FALLEN
1. <Falle mit dem Vorfall dahinter>
2. <…>

DATENLAGE
<DB-Eingriff ja/nein · was schon existiert · was NICHT nachgerechnet wird>

PRÜFANKER
<welche Zahl unbewegt bleiben muss · Erwartung der Prüfstrecke>

ABLAUF
Phasen-sequenziell, ein Commit je Phase (§7 Regel 11).

WICHTIG ZUM ABSCHLUSS
<Verfügbarkeit des Users · wo die Sitzung anhält>
Kein Merge, kein Deploy.
```

---

## Was hier NICHT hineingehört

**Der Sprint-Plan.** Diese Fähigkeit läuft im **steuernden** Chat und produziert einen
Prompt. `sprint-start` läuft in der **neuen** Sitzung und produziert einen Plan. Wandert
das Nachbohren in den Prompt, beginnt die Bau-Sitzung mit fertigen Antworten statt mit
eigenen Fragen — und die Prüfungen aus `sprint-start` (LL-12, LL-15, LL-19, LL-20)
laufen nie.

Der Prompt sagt **was** und **wovor man sich hüten muss**. Er sagt nicht **wie**.

---

## Abhakliste

- [ ] Stand frisch aus Roadmap, `CLAUDE.md` §9 und Gedächtnis geholt — nicht erinnert
- [ ] Geprüft, ob das Thema laut Roadmap überhaupt schneidbar ist
- [ ] Sorte bestimmt, passende Fähigkeit und Stopp-Punkt gesetzt
- [ ] Alle acht Punkte enthalten
- [ ] Zwei bis vier Fallen, **jede mit ihrem Vorfall**
- [ ] Prüfanker mit konkreten Zahlen
- [ ] **Verfügbarkeit des Users berücksichtigt** — kann er abnehmen oder nicht?
- [ ] Modell und Aufwand begründet
- [ ] Bei Parallelbetrieb: Zuständigkeits-Trennung in **beiden** Prompts
- [ ] Als ein kopierbarer Block vorgelegt
- [ ] „Kein Merge, kein Deploy" steht drin
