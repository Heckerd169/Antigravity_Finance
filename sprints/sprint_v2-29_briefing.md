# Sprint v2-29 · Briefing

## Die App merkt sich, was du entschieden hast

**Datum:** 25. August 2026 · **Basis:** `main` @ `a04d387` (Merge PR #45, nach v2-28)
**Branch:** `sprint/v2-29-haendler-gedaechtnis`
**Roadmap:** Paket 5 — `ZO-5` (und der offene Teil `F2` aus `M6`)

> **Warum es diese Datei gibt:** Die Datenbank wird berührt und der Sprint hat mehr
> als drei Phasen — zwei der vier Kriterien aus `sprint-start` §③. Sie werden hier
> ausdrücklich benannt statt stillschweigend geprüft, weil eine stillschweigende
> Prüfung von einer vergessenen nicht unterscheidbar ist (v2-17).

---

## 1 · Ziel und Nicht-Ziel

**Ziel, in einem Satz:** Die App erkennt eine frühere Handzuordnung künftig am
**Händler** wieder statt nur am wortgleichen Buchungstext — und zeigt den Vorschlag
dort, wo kuratiert wird: in der Rohmasse.

**Nicht angefasst:**

| Was | Warum |
|---|---|
| `frequency_match` (`ZO-1`) | Sie zu ändern verschiebt **alle** Scores gleichzeitig. Zwei Verschiebungen in einem Sprint lassen sich hinterher nicht auseinanderhalten — dieselbe Begründung, mit der v2-21 sie liegen ließ. |
| `calculate_match_confidence` | Sie ruft `history_match` unverändert auf. Ihre Prüfsumme muss **byte-identisch** bleiben. |
| Die sechs Badge-Farbtöne aus v2-07 | Weder benutzt noch gelöscht (Beschluss `BF-1` vom 04.08.2026, Punkt 4). |
| Die Kuratierung selbst · 2026 | 2026 ist vollständig zugeordnet (0 offene Zahlungen). |
| `process_csv_import` | Der Wert bleibt bei 0,94 und damit unter der Auto-Schwelle 0,95. Es darf **nichts** automatisch verlinkt werden. |

---

## 2 · Der Befund

`history_match` erkennt eine frühere Handzuordnung **nur bei wortgleicher
Beschreibung**:

```sql
AND f.description = v_desc     -- exakter Zeichenketten-Vergleich
```

Bei Kartenzahlungen steht das **Buchungsdatum im Text**:

```
Agip | VISA Debitkartenumsatz vom 28.01.2026
Zeil.57/F.KONSTABL | VISA Debitkartenumsatz vom 03.01.2026
```

Es sind also nie zwei gleich — die eigenen Entscheidungen des Nutzers übertragen
sich nie. **303 Fragmente im Bestand tragen dieses Muster.**

Dieselbe Wirkung hat jede wechselnde Kennung im Text, auch ohne Datum:
`Audible Gmbh*YG4WQ1N95` · `MPREIS FIL 8198` ·
`Vers-Nr:00008386058-Ihr Beitrag:06.26`.

---

## 3 · Wie der Händler gewonnen wird — gemessen, nicht geraten

Wie der stabile Teil des Textes vom veränderlichen getrennt wird, war **nicht**
entschieden. Fünf Wege, alle gegen **dieselbe** Messung gehalten: Leave-one-out über
die **568 Handzuordnungen** des Nutzers, mit Richtig **und** Falsch (§7 Regel 25 /
LL-27). Das jeweils geprüfte Fragment ist aus seiner eigenen Lernmenge
ausgeschlossen — sonst misst man Auswendiglernen statt Vorhersage.

| Weg | richtig | falsch | Genauigkeit |
|---|---|---|---|
| Text vor dem ersten `\|` | 147 | 17 | 89,6 % |
| Text vor dem ersten `\|`, nur Buchstaben | 152 | 21 | 87,9 % |
| **ganzer Text, alle Ziffern und Sonderzeichen raus** | **257** | **24** | **91,5 %** |
| ganzer Text, Wörter unter 3 Zeichen zusätzlich raus | 262 | 26 | 91,0 % |
| erste 3 Wörter · erste 5 Wörter | 203 · 202 | 22 · 22 | 90,2 % |

**Gewonnen hat die einfachste Regel** — und zwar auf **beiden** Achsen gleichzeitig,
was selten ist:

```
af_merchant_key(text) = alle Ziffern und Sonderzeichen zu Leerzeichen,
                        mehrfache Leerzeichen zusammen, trimmen,
                        aufsetzend auf af_normalize_text (v2-21)
```

```
'Agip | VISA Debitkartenumsatz vom 28.01.2026'  ->  'agip visa debitkartenumsatz vom'
'Audible Gmbh*YG4WQ1N95'                        ->  'audible gmbh yg wq n'
'12345 / 67-89'                                 ->  ''   (leer -> Stufe 1 schweigt)
```

*(Die drei Beispiele sind im Trockenlauf gegen die echte Funktion geprüft, nicht
von Hand ausgerechnet.)*

**Sie muss nichts über Datumsformate wissen.** Das Datum verschwindet, weil es aus
Ziffern besteht — und mit ihm jede Kundennummer, jede Transaktions-ID, jede
Filialnummer. Die naheliegende Variante „Text vor dem ersten `|`" scheitert an
genau den Fällen ohne `|`: `Audible Gmbh*YG4WQ1N95` bliebe unverändert.

> **Warum nicht die Variante mit 262 Treffern?** Sie braucht zusätzlich eine
> Wortlängen-Grenze (`>= 3`), für die es keine Begründung gibt außer dem Messwert —
> und sie ist um 0,5 Punkte **ungenauer**. Fünf Treffer mehr sind das nicht wert:
> Eine Regel, deren Schwelle niemand erklären kann, wird beim nächsten Mal falsch
> gepflegt.

---

## 4 · Die Bauweise — ergänzen, nicht ersetzen

**Freigegeben am 25.08.2026.** `history_match` bekommt eine **zweite Stufe**, die
erste bleibt unverändert:

```
Stufe 1   Händler-Schlüssel eindeutig?   ->  diese Karte
Stufe 2   sonst: wortgleicher Text        ->  wie heute
```

**Warum nicht ersetzen — und die Zahl, die es entscheidet.** Die reine Händler-Regel
ist deutlich genauer (91,5 % gegen 77,4 %), aber:

- **131 der 136** heute sichtbaren 2025-Vorschläge kommen aus der Historie
  (Konfidenz 0,9400)
- **35 davon** haben mit dem gröberen Händler-Schlüssel **keinen eindeutigen
  Treffer mehr** — der Schlüssel fasst mehr Buchungen zusammen und wird dadurch
  öfter mehrdeutig

Ein ersatzloser Austausch würde die Zahl im Prüfanker also erst **senken**, bevor
sie steigt. Gegenübergestellt:

| | richtig | falsch | Regression | 2025 sichtbar |
|---|---|---|---|---|
| heute | 180 | 76 | — | 136 |
| nur Händler *(verworfen)* | 257 | 24 | **17** | ~160 |
| **Händler + wortgleich als Rückfall** | **274** | **80** | **0** | **195** |

**Von den 80 Fehlern sind 76 schon heute da.** Der Sprint verschlechtert nichts; er
fügt 94 richtige Vorschläge hinzu und verliert keinen.

> **Die Frage, ob der wortgleiche Pfad seine Mehrdeutigkeit behalten soll, ist
> damit nicht beantwortet, sondern vertagt.** Er schlägt bei mehrdeutigem Text
> mehrere Karten gleichzeitig vor; welche gewinnt, entscheidet
> `refresh_fragment_suggestions` über `ORDER BY score DESC, card_name ASC` — also
> **alphabetisch**. Das ist ein Münzwurf mit Alphabet und der Grund, warum die
> heutige Regel nur auf 70,3 % kommt. Gehört als eigener Punkt in die Roadmap,
> nicht in diesen Sprint: **ein Sprint, eine Verschiebung.**

---

## 5 · Die 24 Fehler — und warum es fast keine sind

Die reine Händler-Regel liefert im Leave-one-out 24 falsche Vorschläge.
Aufgeschlüsselt:

| Klasse | Fälle | Was es ist |
|---|---|---|
| **Zweier-Spiegel** | 16 | Händler mit genau **zwei** Buchungen auf zwei Karten. Lässt man eine weg, sieht die Messung nur die andere und hält sie für eindeutig. Im Betrieb sind beide da → mehrdeutig → kein Vorschlag. |
| **Namensdopplung** | 2 | Zwei **verschiedene** Karten mit demselben Namen („Fahrradteile" gibt es neunmal). Der Vorschlag ist für den Nutzer nicht von der richtigen Karte zu unterscheiden. |
| **echte Fehler** | 6 | Der Nutzer hat denselben Händler einmal anders eingeordnet — `agip` und `db vertrieb` auf „Privates Budget" statt „Tanken", `aldi sued` auf „Privates Budget" statt „Haushaltsgeld". |

> **Alle 24 betreffen Händler, die in der vollen Datenmenge mehrdeutig sind.** Im
> Betrieb schweigt die Regel dort. **Die 24 sind eine Obergrenze der Messmethode,
> kein Betriebsrisiko** — die Leave-one-out-Messung macht Mehrdeutigkeit unsichtbar,
> indem sie ein Element entfernt. Das ist der Preis dafür, dass sie überhaupt gegen
> echte Entscheidungen misst; er ist es wert, aber er gehört benannt.

---

## 6 · Die Fallen

**① `history_match` lernt AUSSCHLIESSLICH aus `origin = 'MANUAL_DROP'`.**
110 Verknüpfungen sind automatisch gesetzt, **65 davon hat v2-28 gerade erst auf
„Tanken" gelegt**. Lernte die Funktion daraus, verstärkte die Automatik ihre eigene
Vermutung, und der Fehler wüchse mit jedem Import. v2-27 hat aus genau diesem Grund
bewusst mit `AUTO_ABSORBED` geschrieben. Überträge bleiben ausgeschlossen (§6
Stolperfalle 7), das geprüfte Fragment selbst ebenfalls (`f.id <> p_fragment_id`).
**Die drei Filter stehen heute schon in der Funktion — sie sind beim Umbau zu
erhalten, nicht neu zu erfinden.**

**② Mit Richtig UND Falsch messen, vorher und nachher.** §7 Regel 25 / LL-27. In
v2-21 hob der wortweise Namensvergleich die richtigen Vorschläge von 14 auf 27 — und
die **falschen** von 1 auf 18. Die Trefferzahl allein hätte die Verschlechterung als
Erfolg ausgewiesen.

**③ Die Regel, OB ein Vorschlag sichtbar ist, hat genau EINE Stelle.**
`src/lib/suggestion.ts` → `istVorschlagSichtbar`, mit eigenem Wächter
(`suggestion-visibility.spec.ts`). Genau dort saß der Fehler aus v2-21, als die
Regel noch inline im `.map()` einer Server Component stand — die **dritte** Stelle
dieser Art in vier Tagen (LL-26). **Keine zweite Stelle bauen, die dasselbe noch
einmal entscheidet.**

**④ Das `visual`-Projekt hat eine FESTE Dateiliste.** In v2-28 lag ein neuer Wächter
fertig und grün da — und lief nicht. Aufgefallen ist es ausschließlich daran, dass
die Gesamtzahl bei 127 stehen blieb. **Jede neue `*.spec.ts` in
`playwright.config.ts` eintragen und die Testzahl gegen v2-28 vergleichen: visual
137, e2e 146.**

**⑤ NEU in diesem Sprint — der Ausdruck braucht einen Index.** Der Händler-Schlüssel
ist ein berechneter Ausdruck; ohne Index kostet **ein** Aufruf **14,9 ms** (Seq Scan
über 1.599 Fragmente mit zwei `regexp_replace` je Zeile).
`refresh_fragment_suggestions` ruft `calculate_match_confidence` für jede offene
Zahlung × jede aktive Karte auf — bei 480 × ~30 wären das **rund 14.000 Aufrufe und
über drei Minuten**. Deshalb gehört ein **Ausdrucks-Index** in dieselbe Migration.
Das ist LL-29 in seiner allgemeinen Form: **erst zählen, wie oft gefragt wird, dann
die Frage optimieren.**

---

## 7 · Prüfanker

**Vor und nach dem Eingriff, in DERSELBEN Sitzung** (§7 Regel 21). Vollständiges
Vorher-Protokoll: `sprints/sprint_v2-29_anker.md`.

| Anker | Erwartung |
|---|---|
| **Sparrate, 24 Monate, Ist und Plan** | **0,00 € Bewegung in jedem Monat.** Erzwungen, nicht zugesagt: 0,94 liegt unter der Auto-Schwelle 0,95, es kann nichts verlinkt werden. |
| **Anker 1** — Ordner-Spalte == Sparrate | 24/24 exakt |
| **Anker 2** — `Σ delta = Ist − Plan` | 24/24 exakt |
| **Prüfsummen** | alle neun Rechenfunktionen **plus** `calculate_match_confidence` byte-identisch |
| **`card_fragment_links`** | **678 Zeilen vorher == nachher** |
| **Die Zahl, die sich bewegen SOLL** | offene 2025-Zahlungen mit Vorschlag: **136 → 195 erwartet** |

> **Die 195 sind vor dem Eingriff aufgeschrieben, nicht danach abgelesen.** Sie
> setzen sich zusammen aus 136 heutigen plus **59** neuen: 161 der 480 offenen
> Zahlungen bekommen einen eindeutigen Händler-Treffer, davon 155 auf einer Karte,
> die im Buchungsmonat **aktiv** ist (`is_card_active_in_month` filtert in
> `refresh_fragment_suggestions`), und 59 davon liegen heute unter der Schwelle
> 0,60. **In keinem einzigen Fall widerspricht der neue Vorschlag dem heutigen** —
> gemessen: 0 Kartenwechsel unter den 96 Überschneidungen.
>
> Weicht die Zahl nach dem Lauf ab, ist das **kein** Alarm, sondern zuerst ein
> Hinweis auf weitere Kuratierung: Der Nutzer ordnet laufend zu. Verglichen wird
> gegen den eigenen Vorher-Wert von vor Minuten, nicht gegen dieses Papier von
> vorhin.

**Momentaufnahme CLAUDE.md §9 ist KEIN Sollwert.** 2025 stand am 24.08. bei
21.776,33 €, heute bei **21.708,77 €** — ohne dass etwas kaputt wäre.

---

## 8 · Phasen

Phasen-sequenziell, ein Commit je Phase, Phase N+1 startet erst nach grüner Phase N
(§7 Regel 11 / LL-14).

| Phase | Was | Datenbank |
|---|---|---|
| **P0** | Design-Record `V2/`, dieses Briefing, Anker-Protokoll vorher | nein |
| **P1** | `af_merchant_key`, Ausdrucks-Index, `history_match` zweistufig | **ja** — Trockenlauf, dann Freigabe |
| **P2** | Vorschläge für 2025 nachrechnen (`refresh_fragment_suggestions`) | **ja** — schreibt nur Anzeige-Spalten |
| **P3** | Vorschlagszeile in der Rohmasse + Wächter | nein |
| **P4** | Prüfstrecke, Review, Roadmap, Doku-Patches, PR | nein |

**Jede Migration wird einzeln freigegeben.** Die Übungs-Datenbank-Probe entfällt wie
in v2-24, v2-27 und v2-28: Ihr Bestand ist synthetisch und kennt die Händler-Historie
nicht — dort gibt es nichts zu erkennen. Stattdessen **RAISE-Rollback-Trockenlauf auf
Produktion** (LL-18), der die neue Funktion anlegt, misst und alles zurückrollt.

---

## 9 · Prüfschritte für den Browser-Smoke

| | Schritt | Erwartung | § |
|---|---|---|---|
| **S1** | Dashboard öffnen, Monat mit offenen Zahlungen (2025) | Unter der Beschreibung steht bei erkannten Zahlungen eine **leise Zeile** `KI-Vorschlag: <Karte>` | DD-Record E1–E3 |
| **S2** | Eine Zahlung mit sehr langem Kartennamen ansehen | Zeile endet mit `…`, die Karte wird **nicht höher** | DD-Record E4 |
| **S3** | Eine Zahlung ohne Vorschlag ansehen | **keine** leere Zeile, kein Platzhalter — die Karte sieht aus wie heute | §8 |
| **S4** | Eine Zahlung mit Transfer-Kästchen ansehen | Kästchen unverändert, **kein** Vorschlag daneben oder darunter | §8 (AD5) |
| **S5** | Eine bereits zugeordnete Zahlung ansehen | **kein** Vorschlag (Status ≠ `UNASSIGNED`) | `suggestion.ts` |
| **S6** | Betrag in der Kopfzeile prüfen | Euro-Zeichen bricht **nicht** um — die Fehlerklasse aus `BF-1` bleibt geschlossen | §8 |
| **S7** | Sparrate des Monats mit dem Vorher-Wert vergleichen | **identisch**, auf den Cent | §4.2 |

**Alle Erwartungen sind regel-basiert formuliert, nicht instanz-basiert** (§7
Regel 13 / LL-19) — „bei erkannten Zahlungen", nicht „bei der Aral-Buchung vom 9.2.".

---

## 10 · Was dieser Sprint an der Roadmap korrigiert

**`ZO-5` ist heute falsch begründet.** Der Eintrag sagt, 147 Zahlungen bekämen keinen
Vorschlag, *„weil der Name bei jeder Buchung ein anderer ist"*. **Gemessen hält das
nicht.** Von den 480 offenen 2025-Zahlungen (Stand 25.08.):

| | Zahlungen | heute mit Vorschlag | Händler **nie** zugeordnet |
|---|---|---|---|
| mit Datum im Text | 128 | **0** | **84 (66 %)** |
| ohne Datum im Text | 352 | 136 | 192 (55 %) |

**Die Null stimmt** — keine einzige Zahlung mit Datumsmuster bekommt heute einen
Vorschlag. **Die Erklärung stimmt nicht:** Zwei Drittel dieser Zahlungen tragen einen
Händler, der **noch nie** einer Karte zugeordnet wurde. Es sind Einmalkäufe — eine
Japan-Reise, Kleidung, PayPal an Privatpersonen, Bargeld. Sie bekommen keinen
Vorschlag, **weil es keine Karte gibt, zu der sie gehören**, nicht weil der Name
wechselt.

**Der Unterschied ist teuer, nicht kosmetisch:** Nach der alten Begründung wäre der
Erfolg dieses Sprints an „147 werden sichtbar" zu messen. Erreichbar sind über den
Text **39**; die übrigen 84 brauchen eine Karte — das ist Kuratierung, keine Technik.
Dieselbe Fehlerklasse wie die Ursachen-Diagnose zu `M6`, die bis zum 15.08.2026 in
CLAUDE.md §9 stand: **die Beobachtung war richtig, ihre Erklärung nicht.**
