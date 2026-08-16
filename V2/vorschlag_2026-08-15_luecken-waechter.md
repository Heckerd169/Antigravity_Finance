# Vorschlag: wie die Historie-Lücke nicht wiederkommt

> **Datum:** 15. August 2026 · **Anlass:** Die Projekt-Historie endete bei v2-07;
> fünfzehn Sprints fehlten (nachgetragen in PR #33).
> **Status:** ✅ **angenommen und umgesetzt am 15.08.2026.** Alle drei Punkte sind
> gebaut — siehe §9 unten, inklusive dessen, was der Wächter beim ersten Lauf sofort
> gefunden hat.

---

## 1 · Die Ursache — belegt, nicht vermutet

**`sprint-abschluss` kennt die Projekt-Historie nicht als Arbeitsschritt.**

Die Fähigkeit hat neun Schritte und eine zehnzeilige Abhakliste. Die Historie kommt in
**keinem** davon vor. Ihre einzige Erwähnung ist eine Nebenbemerkung *über* sie, im
Begründungssatz zu Schritt 5:

> *„Ohne diese Routine muss der Stand in jeder neuen Sitzung aus der Historie
> rekonstruiert werden."*

Das ist eine Aussage über ihren Nutzen — kein Auftrag, sie zu pflegen.

**Wie es dazu kam:** Sprint **v2-08** hat die Datei erzeugt, indem er 1.293 Zeilen aus
`CLAUDE.md` auslagerte. Er hat sie byte-genau übertragen, mit Prüfsumme belegt und eine
Lese-Anleitung in den Kopf geschrieben. **Was er nicht getan hat: ihre Fortschreibung im
Ablauf verankern.** Derselbe Sprint hat drei Fähigkeiten angelegt — die Historie kam in
keiner vor.

Das ist ein wiedererkennbares Muster: *Wer eine Datei anlegt, denkt an ihren Inhalt,
nicht an ihre Pflege.* Ab v2-09 hat dann niemand mehr etwas vermisst, weil nichts danach
fragte.

---

## 2 · Warum ein zusätzlicher Punkt auf der Liste nicht reicht

Die naheliegende Antwort — „dann schreiben wir es eben in die Checkliste" — hat dieses
Projekt bereits widerlegt.

**Schritt 5 (Roadmap-Stand) steht seit v2-08 in der Fähigkeit.** Er ist dort sogar
besonders hervorgehoben: *„← der vergessene Schritt"*, mit der Begründung, er sei
**zweimal vergessen** worden und habe drei Nachzugs-Commits gekostet. Er steht so weit
oben wie möglich.

**Trotzdem** ist die Historie durchgerutscht — eine Datei, die gar nicht erst auf der
Liste stand. Ein zehnter Punkt auf einer Liste, deren fünfter zweimal übersehen wurde,
ist keine Abhilfe. Er ist eine Zusicherung.

> **Der Maßstab, den dieses Projekt selbst gesetzt hat:** In v2-11 wurde LL-22 geboren,
> weil eine Doku-Zusage über Rechenverhalten nie gegen die Wirklichkeit geprüft worden
> war. Dieselbe Logik gilt hier. Eine Checklisten-Zeile ist eine Zusage. **Ein Test ist
> eine Prüfung.**

---

## 3 · Der Vorschlag: ein Wächter, der die Lücke unmöglich macht

Eine neue Spezifikation `tests/e2e/doku-vollstaendigkeit.spec.ts` im
**`visual`**-Projekt. Sie prüft **Dateien im Repo**, nicht Verhalten im Browser —
braucht also weder Zugangsdaten noch Datenbank und läuft in Millisekunden.

**Das Muster gibt es hier schon.** v2-20 hat `loesch-tor.spec.ts` genau so gebaut, mit
ausdrücklicher Begründung:

> *„Die neue Spec prüft Quelltext, nicht Verhalten. Ungewöhnlich für dieses Projekt, und
> hier bewusst: Die Lösch-Regel existiert an zwei Orten."*

Hier ist es dieselbe Bauart: Eine Tatsache existiert an zwei Orten (Review und Historie)
und muss übereinstimmen.

### Was der Wächter prüft — drei Regeln

**① Jeder Sprint mit Review hat einen Eintrag in der Historie.**

```
für jede Datei sprints/sprint_v2-NN_review.md
    muss sprints/projekt_historie.md die Zeile "### Sprint v2-NN" enthalten
```

Das ist die Regel, die die gefundene Lücke verhindert hätte — und zwar **beim ersten
Mal**, in v2-08, nicht fünfzehn Sprints später.

**② Jeder Lessons-Learned-Ursprung ist in der Historie auffindbar.**

`CLAUDE.md §8` führt je Zeile einen Ursprungs-Sprint (`v2-13`, `v2-21`, …). Für jeden
davon muss die Historie einen Eintrag haben. **Das ist die Regel, die dem eigentlichen
Schaden gilt** — nicht der fehlenden Datei, sondern dem gebrochenen Versprechen:

> *„Die Langfassung mit dem Vorfall, der sie erzeugt hat, steht in
> `sprints/projekt_historie.md` beim genannten Sprint."*

Für LL-21 bis LL-27 war dieser Satz unwahr. Regel ② macht ihn prüfbar.

**③ Die Nummernfolge der Historie ist lückenlos.**

Fängt den Fall, dass jemand einen Eintrag anlegt, aber einen älteren Sprint überspringt
— Regel ① sieht das nur, wenn für den übersprungenen Sprint auch ein Review existiert.

*(Beim Bauen so umgesetzt; der ursprüngliche Entwurf lautete „der letzte Eintrag ist der
letzte Sprint mit Review" — das wäre eine Dublette zu ① gewesen und hätte keine Lücke in
der Mitte gefunden.)*

### Was der Wächter kostet

Eine Datei, rund 60 Zeilen, ein Eintrag in `playwright.config.ts` unter `testMatch`.
Laufzeit im Millisekundenbereich, keine Zugangsdaten, keine Datenbank. Er läuft in
jeder Prüfstrecke mit, ohne dass jemand daran denken muss.

---

## 4 · Was er NICHT leistet — und das gehört dazu

**Er prüft Existenz, nicht Qualität.** Ein Eintrag `### Sprint v2-23` mit einem einzigen
Satz macht ihn grün. Gegen einen inhaltsleeren Eintrag hilft kein Test, sondern nur die
Gliederung in der Fähigkeit.

**Er wird im laufenden Sprint rot, sobald der Review geschrieben ist und der
Historie-Eintrag noch fehlt.** Das ist **gewollt**, aber es ändert die Reihenfolge im
Ablauf: Review und Historie-Eintrag entstehen ab dann **zusammen**. Das ist ohnehin der
richtige Moment — der Eintrag ist eine Verdichtung des Reviews, und der Kontext ist
frisch. Wer beides trennt, schreibt den zweiten Text aus dem Gedächtnis.

**Er sagt nichts über den Zeitpunkt.** Ein Sprint, dessen Review am Montag entsteht und
dessen Historie-Eintrag am Freitag nachgereicht wird, ist für ihn in Ordnung.

---

## 5 · Zusätzlich, weil es zusammengehört: der Schritt in der Fähigkeit

Der Wächter ersetzt den Checklisten-Punkt nicht, er sichert ihn ab. **Beides zusammen:**

**Vorschlag für `sprint-abschluss`, neuer Schritt zwischen 4 (Review) und 5 (Roadmap):**

> ### 4b · Historie-Eintrag schreiben
>
> `sprints/projekt_historie.md` bekommt einen Eintrag `### Sprint v2-NN · DONE <Datum>`
> — **append-only**, direkt im Anschluss an den Review, aus dem er verdichtet wird.
>
> Gliederung: **Komponente** (was war der Auftrag) · die tragenden Entscheidungen **mit
> Begründung** · **Verifikation** (Prüfstrecke und Anker mit Zahlen) · **Offen nach
> v2-NN**.
>
> **Was hier hineingehört und sonst verloren geht:** die Stellen, an denen sich eine
> Annahme als falsch erwiesen hat. Ein Log, der nur Erfolge verzeichnet, wird nicht
> gelesen — die Lessons Learned verweisen auf genau diese Stellen.
>
> Bestehende Einträge werden **nie** umgeschrieben, auch nicht bei späterer besserer
> Erkenntnis. Die Korrektur kommt als neuer Eintrag.
>
> *Der Wächter `doku-vollstaendigkeit.spec.ts` prüft, dass dieser Schritt passiert ist.*

Und eine Zeile in der Abhakliste:

> - [ ] **Historie-Eintrag geschrieben** (Schritt 4b) — der Wächter prüft es

---

## 6 · Die zweite Lücke derselben Bauart

**`design-system/` steht ebenfalls in keinem Schritt von `sprint-abschluss`** — obwohl
`CLAUDE.md §4` es ausdrücklich verlangt:

> *„Ändert sich etwas an Tokens oder Komponenten, gehören die Seiten mit nachgezogen,
> sonst zeigen sie beim nächsten Mal einen überholten Stand."*

**Sie ist heute noch nicht real:** `design-system/` und `src/components/` wurden beide
zuletzt am 13.08.2026 in v2-19 angefasst. Die Seiten sind synchron.

**Aber ihre Pflege hängt am Erinnerungsvermögen**, und das ist derselbe Mechanismus, der
bei der Historie fünfzehn Sprints gekostet hat. In v2-16 stand sie schon einmal als
offener Punkt im Review („`design-system/entwuerfe/` enthält weiterhin zwei Seiten, die
nach der Regel des Records fällig wären — nicht angefasst").

**Vorschlag:** Ein Satz in `sprint-abschluss` bei Schritt 6, keine eigene Prüfung.
Ein maschineller Wächter wäre hier schwer zu bauen — „hat sich die Formensprache
geändert?" ist keine Frage, die ein Test beantworten kann. Anders als bei der Historie,
wo die Regel exakt ist.

---

## 7 · Eine Alternative, die ich abgewogen und verworfen habe

**Die Historie abschaffen und `CLAUDE.md §8` direkt auf die Reviews verweisen lassen.**

Dafür spräche einiges: Die Reviews existieren ohnehin und sind vollständig, es gäbe eine
Datei weniger zu pflegen, und die Lücke könnte per Konstruktion nicht mehr entstehen.

**Dagegen spricht mehr:**

- **Die Verdichtung ist der Wert.** Die fünfzehn Reviews umfassen rund 3.700 Zeilen; die
  Historie-Einträge dafür 717. Wer einer Lessons-Learned-Spur folgt, will den Vorfall in
  zehn Zeilen, nicht den vollständigen Sprint-Bericht.
- **Chronologie.** Die Historie ist die einzige Stelle, an der man das Projekt am Stück
  lesen kann. Fünfzehn Einzeldateien in Dateinamen-Reihenfolge sind kein Log.
- **Append-only.** Reviews werden im Sprint noch korrigiert; die Historie hält bewusst
  fest, was man **damals** wusste. Das ist eine andere Eigenschaft, und sie ist genau
  bei den falschen Annahmen wertvoll.

---

## 8 · Was ich empfehle

| # | Was | Aufwand | Wirkung |
|---|---|---|---|
| **1** | Wächter `doku-vollstaendigkeit.spec.ts` mit den drei Regeln | eine Datei, ~60 Zeilen | Die Lücke kann strukturell nicht mehr entstehen |
| **2** | Schritt **4b** in `sprint-abschluss` + Zeile in der Abhakliste | ein Absatz | Sagt, *wie* der Eintrag aussieht — das kann kein Test |
| **3** | Ein Satz zu `design-system/` bei Schritt 6 | eine Zeile | Schließt die zweite, noch latente Lücke |

**Reihenfolge:** 1 und 2 gehören zusammen und sollten in einem Zug kommen — der Wächter
ohne die Anleitung erzeugt leere Einträge, die Anleitung ohne den Wächter wird vergessen.
Punkt 3 ist unabhängig und kann mitlaufen.

**Umfang:** ein kleiner Sprint oder ein Doku-Nachzug mit einer Test-Datei. Kein
Datenbank-Eingriff, keine Zahl bewegt sich, kein Browser-Smoke nötig — die neue Spec
läuft ohne Zugangsdaten.

---

## 9 · Umgesetzt am 15.08.2026 — und was dabei passiert ist

Alle drei Punkte sind gebaut:

| # | Was | Wo |
|---|---|---|
| 1 | Wächter mit den drei Regeln | `tests/e2e/doku-vollstaendigkeit.spec.ts`, eingetragen in `playwright.config.ts` |
| 2 | Schritt **4b** + Zeile in der Abhakliste | `.claude/skills/sprint-abschluss/SKILL.md` |
| 3 | `design-system/`-Satz bei Schritt 6 + Abhakliste | ebenda |

### Der Wächter war beim ersten Lauf sofort rot — und das ist sein bester Beleg

```
Diese Sprints haben einen Review, aber keinen Eintrag in
sprints/projekt_historie.md: v2-01
```

**`sprint_v2-01_review.md` existiert seit dem 26. Juni 2026. Ein Historie-Eintrag nie.**
Die Datei begann bei v2-02.

Das ist die **sechzehnte** Lücke — und ich hatte die anderen fünfzehn von Hand gesucht
und diese dabei übersehen. Der Test brauchte drei Sekunden.

**Noch schärfer:** Das Review von v2-01 trägt in seinem §8 einen **fertigen Vorschlag
für genau diesen Eintrag**, formuliert vom damaligen Sprint selbst. Er wurde nie
angewendet, und in vierzehn Monaten ist es niemandem aufgefallen. Genau dafür ist ein
Test da: Er stellt die Frage bei **jedem** Lauf, nicht nur wenn jemand daran denkt.

v2-01 ist nachgetragen (Nachtrag ② in der Historie). Der Eintrag steht chronologisch an
der falschen Stelle — am Ende statt vor v2-02 —, weil die Append-only-Regel keine
Einfügungen vorsieht. Das ist der Preis, und er ist im Nachtrag benannt.

### Gegenprobe gefahren

Ein Wächter, der auch ohne den Fehler grün bliebe, wäre wertlos. Deshalb geprüft:

| Lauf | Ergebnis |
|---|---|
| Historie vollständig | **3/3 grün** |
| ein Eintrag testweise unkenntlich gemacht (`v2-15`) | **Regel ① und ③ fallen um**, ② bleibt grün |

Dass ② grün bleibt, ist richtig: v2-15 ist kein Lessons-Learned-Ursprung. Die drei
Regeln prüfen tatsächlich Verschiedenes und sind keine Dubletten.

### Ein Fund am eigenen Code

`tsc` hat die erste Fassung des Wächters abgelehnt: `matchAll` in einer `for…of`-Schleife
verlangt `downlevelIteration` (TS2802). Umgebaut auf `Array.from(...).forEach(...)`.

Bemerkenswert daran: **`ring-subline.spec.ts` warnt seit v2-12 im Kommentar vor genau
dieser Falle** („Bewusst ohne `new Set(...)`-Spread: Die tsconfig zielt auf ein Ziel,
das Iteration über ein Set nicht ohne `downlevelIteration` erlaubt"). Ich bin trotzdem
hineingelaufen — die Prüfstrecke hat es gefangen, so wie sie soll.

### Prüfstrecke nach der Umsetzung

`tsc` 0 · ESLint 0/0 · Build 0 · `test:visual` **78/78** (75 auf `main`-Stand plus die
drei neuen Regeln). Keine Zahl bewegt, kein Datenbank-Eingriff, kein Browser-Smoke nötig.
