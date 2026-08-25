# Sprint v2-29 — Review

> **Branch:** `sprint/v2-29-haendler-gedaechtnis` · **Basis:** `main` @ `a04d387`
> **Datum:** 25. August 2026 · **Phasen:** P0 – P3, ein Commit je Phase
>
> **In einem Satz:** Die App erkennt eine frühere Handzuordnung jetzt am **Händler**
> statt nur am wortgleichen Buchungstext — und zeigt den Vorschlag zum ersten Mal
> dort, wo kuratiert wird; **136 → 195** sichtbare Vorschläge in 2025, **keine
> Sparrate bewegt**.

---

## 1. Was gebaut wurde

### P0 · Die Papiere (`docs:`)

Der **Design-Record zur Runde vom 24.08.2026 existierte nicht** — die Entscheidungen
standen fest, aber nur im Gespräch. Er ist deshalb das **erste** Artefakt dieses
Sprints und nicht sein letztes: `V2/design_direktor_2026-08-24_haendler_gedaechtnis.md`
mit den Entscheidungen 1–5 und den Breitenmessungen, die sie tragen.

Dazu `sprints/sprint_v2-29_briefing.md` (zwei der vier Kriterien treffen zu:
Datenbank berührt, mehr als drei Phasen) und `sprints/sprint_v2-29_anker.md` mit dem
vollständigen Vorher-Protokoll.

### P1 · Die Wiedererkennung lernt den Händler (`feat:`)

`supabase/migrations/20260825_v2_29_haendler_gedaechtnis.sql` — drei Dinge:

| | |
|---|---|
| `af_merchant_key(text)` | Der stabile Teil eines Buchungstextes: alle Ziffern und Sonderzeichen zu Leerzeichen, der Rest ist der Händler. `IMMUTABLE`. |
| `idx_fragments_merchant_key` | Ausdrucks-Index auf `(user_id, af_merchant_key(description))`. **Ohne ihn ist die Funktion unbenutzbar** — siehe §5 ②. |
| `history_match` | Zweistufig: Händler-Schlüssel, wenn eindeutig; sonst wortgleicher Vergleich wie seit v2-21. |

Dazu `src/lib/supabase/types.ts` nachgezogen.

### P2 · Vorschläge für 2025 nachgerechnet (`data:`)

`refresh_fragment_suggestions('2025-01-01','2025-12-01')`. 484 Zahlungen geprüft,
**68 Vorschläge neu gesetzt, 0 gelöscht**, 678 Verknüpfungen unberührt, 23,2 s.

### P3 · Der Vorschlag wird sichtbar (`feat:`)

`src/components/interaction-zone/fragment-card.tsx` +
`interaction-zone.module.css`: eine eigene, leise Zeile unter der Beschreibung.
Ghost-Ton, 9 px, keine Versalien, kein Kästchen, einzeilig mit `…`.
`aria-label` trägt den Vorschlag mit — Vorlesen und Sehen ergeben dasselbe (RM-1).

Neuer Wächter `tests/e2e/vorschlagszeile.spec.ts` (7 Prüfungen), eingetragen in die
feste Dateiliste von `playwright.config.ts`.

---

## 2. Prüfstrecke

| Prüfung | Erwartung | Ergebnis |
|---|---|---|
| `tsc --noEmit` | 0 Fehler | **0** ✅ |
| ESLint (`--no-eslintrc`-Umweg) | 0/0 | **0 Fehler, 0 Warnungen** ✅ |
| `pnpm build` | 0 Fehler | **0** ✅ |
| Bundle `Route /` | — | **37 kB** · First Load JS **189 kB** |
| `pnpm test:visual` | steigt nur um eigene Tests | **144/144** ✅ (137 → 144, die sieben neuen) |
| `pnpm test:e2e` | vollständig grün | **153/153** ✅ (146 → 153) inkl. Render-Smoke |

> **Die sieben neuen Tests laufen wirklich mit.** Die Gesamtzahl ist um genau sieben
> gestiegen — das ist die einzige Art, die feste Dateiliste in
> `playwright.config.ts` zu prüfen (die Falle, die v2-28 gestellt hat).
>
> **Und der Wächter wird auch wirklich rot.** Gegengeprüft: Mit einer testweise
> eingebauten zweiten Bedingung (`&& fragment.status === "UNASSIGNED"`) schlägt er
> an. Die Änderung wurde danach zurückgenommen. **Ein Wächter, von dem niemand
> weiß, ob er auslösen kann, ist eine Zusicherung, keine Prüfung** — dieselbe
> Unterscheidung, die LL-22 für Doku macht.

---

## 3. Anker vorher/nachher

Vollständiges Protokoll: `sprints/sprint_v2-29_anker.md`.

| Anker | Vorher | Nachher | Urteil |
|---|---|---|---|
| Sparrate, 24 Monate, Ist **und** Plan | 24 Werte | **24 identisch, 0 bewegt** | ✅ |
| Anker 1 — Ordner-Spalte == Sparrate | 24/24 | **24/24** | ✅ |
| Anker 2 — `Σ delta = Ist − Plan` | 24/24 | **24/24** | ✅ |
| `card_fragment_links` | 678 | **678** (568 Hand · 110 auto) | ✅ |
| Prüfsummen (19 Funktionen) | — | **18 identisch**, nur `history_match` | ✅ |
| `calculate_match_confidence` | `defa3e43…` | **`defa3e43…`** | ✅ |
| **Vorschläge 2025** | **136** | **195** | ✅ **wie vorhergesagt** |

**Dass die Sparrate sich nicht bewegt, ist erzwungen und nicht zugesagt:**
`confidence.history_score` steht auf **0,94**, die Auto-Absorptions-Schwelle bei
**0,95**. Es kann nichts verlinkt werden, also kann sich keine Zahl bewegen.
Zusätzlich zählt `refresh_fragment_suggestions` die Verknüpfungen vor und nach
ihrem Lauf und bricht bei jeder Abweichung mit Rollback ab.

> **Die 195 standen VOR dem Eingriff im Briefing.** Das ist der eigentliche Wert
> dieser Messung — nicht dass die Zahl gestiegen ist, sondern dass sie
> **vorhersagbar** war. Eine Zahl, die man erst hinterher abliest, beschreibt nur.

---

## 4. Selbst-Review gegen die Akzeptanzkriterien

| | Kriterium | erfüllt | Beleg |
|---|---|---|---|
| **A1** | Eine Handzuordnung überträgt sich auch bei nicht wortgleichem Text | ✅ | 39 Zahlungen mit Datumsmuster bekommen einen Vorschlag; vorher **null** |
| **A2** | Bei mehrdeutigen Händlern wird **nichts** vorgeschlagen | ✅ | `history_match` Stufe 1 prüft `count(DISTINCT card_id) = 1`; Trockenlauf T4 |
| **A3** | Gelernt wird ausschließlich aus `MANUAL_DROP` | ✅ | Migration §3, beide Stufen; 110 automatische Verknüpfungen bleiben außen vor |
| **A4** | Überträge lernen nicht und werden nicht gelernt | ✅ | `f.transfer_type IS NULL` in beiden Stufen; T5 = 0.00 |
| **A5** | Das geprüfte Fragment ist aus seiner eigenen Lernmenge ausgeschlossen | ✅ | `f.id <> p_fragment_id`; T7 = 0.00 |
| **A6** | Mit Richtig **und** Falsch gemessen, Leave-one-out | ✅ | 568 Handzuordnungen; fünf Extraktionswege, drei Bauweisen (§5 ①) |
| **A7** | Keine Regression gegenüber heute | ✅ | `vorschlag_geleert: 0`; Leave-one-out: 0 Fälle „heute richtig → neu nicht" |
| **A8** | `calculate_match_confidence` unangetastet | ✅ | Prüfsumme `defa3e43f468e51946362a15ee943c9f` vor **und** nach |
| **A9** | `frequency_match` unangetastet (`ZO-1` bleibt offen) | ✅ | Prüfsumme `79d782eb…` unverändert |
| **A10** | Nichts wird automatisch verlinkt | ✅ | 0,94 < 0,95; `card_fragment_links` 678 == 678 |
| **A11** | Der Vorschlag ist eine eigene, leise Zeile | ✅ | gemessen im Browser: `rgba(255,255,255,0.22)`, 9 px, `text-transform: none` |
| **A12** | Lange Namen kürzen, ohne die Karte höher zu machen | ✅ | `nowrap` + `ellipsis`; gemessen `scrollWidth <= clientWidth` |
| **A13** | Die Sichtbarkeitsregel hat genau **eine** Stelle | ✅ | `vorschlagszeile.spec.ts` Prüfung ①, gegengetestet |
| **A14** | Die sechs Badge-Farbtöne weder benutzt noch gelöscht | ✅ | `vorschlagszeile.spec.ts` Prüfung ④ |
| **A15** | Prüfstrecke vollständig | ✅ | §2 |
| **A16** | `ZO-5`-Begründung in der Roadmap korrigiert | ✅ | §7, Roadmap-Eintrag |

---

## 5. Architektur-Entscheidungen

### ① Wie der Händler gewonnen wird — fünf Wege, eine Messung

Der Eröffnungsprompt schlug „Text vor dem ersten `|`" vor und verlangte ausdrücklich,
**mindestens zwei Varianten** gegen dieselbe Messung zu halten. Es wurden fünf:

| Weg | richtig | falsch | Genauigkeit |
|---|---|---|---|
| Text vor dem ersten `\|` | 147 | 17 | 89,6 % |
| dito, nur Buchstaben | 152 | 21 | 87,9 % |
| **ganzer Text, alle Ziffern raus** | **257** | **24** | **91,5 %** |
| dito, Wörter < 3 Zeichen raus | 262 | 26 | 91,0 % |
| erste 3 · erste 5 Wörter | 203 · 202 | 22 · 22 | 90,2 % |

**Gewonnen hat die einfachste Regel, auf beiden Achsen zugleich** — das ist selten
genug, um es zu benennen. Sie muss nichts über Datumsformate wissen: Das Datum
verschwindet, weil es aus Ziffern besteht, und mit ihm jede Kundennummer und
Transaktions-ID. Der vorgeschlagene Weg scheitert an genau den Fällen **ohne** `|`
(`Audible Gmbh*YG4WQ1N95` bliebe unverändert).

Die Variante mit 262 Treffern wurde verworfen: Sie braucht eine Wortlängen-Grenze
(`>= 3`), für die es keine Begründung gibt außer dem Messwert — und ist um 0,5 Punkte
ungenauer. **Eine Regel, deren Schwelle niemand erklären kann, wird beim nächsten Mal
falsch gepflegt.**

### ② Ergänzen statt ersetzen — die Zahl, die es entschieden hat

Die reine Händler-Regel ist deutlich genauer (91,5 % gegen 77,4 %). Trotzdem wäre sie
allein falsch gewesen, und das zeigte erst die richtige Frage:

> **131 der 136 heute sichtbaren 2025-Vorschläge kommen aus der Historie (Konfidenz
> 0,9400) — und 35 davon haben mit dem gröberen Händler-Schlüssel keinen eindeutigen
> Treffer mehr.**

Der Schlüssel fasst mehr Buchungen zusammen und wird dadurch **öfter** mehrdeutig. Ein
ersatzloser Austausch hätte die Zahl im Prüfanker erst **gesenkt**.

| | richtig | falsch | Regression | 2025 sichtbar |
|---|---|---|---|---|
| heute | 180 | 76 | — | 136 |
| nur Händler | 257 | 24 | **17** | ~160 |
| **beide** | **274** | **80** | **0** | **195** |

Von den 80 Fehlern sind **76 schon heute da**. Dem User vorgelegt, Entscheidung:
ergänzen.

> **Was dabei sichtbar wurde und größer ist als dieser Sprint:** Die heutige Regel
> kommt nur auf **70,3 %**, weil sie bei mehrdeutigem Text **mehrere Karten
> gleichzeitig** vorschlägt — und `refresh_fragment_suggestions` dann per
> `ORDER BY score DESC, card_name ASC` entscheidet. **Alphabetisch.** Das ist ein
> Münzwurf mit Alphabet, und er betrifft 93 Handzuordnungen. Vorschlag für die
> Roadmap, nicht für diesen Sprint: **ein Sprint, eine Verschiebung.**

### ③ Warum Stufe 2 nicht geprüft wird, wenn Stufe 1 greift

Wenn der Händler eindeutig auf Karte A zeigt, liegen **alle** anderen Fragmente
dieses Händlers auf A. Ein wortgleicher Text ist eine Teilmenge davon und kann nie
eine andere Karte liefern. Die Reihenfolge verliert also nichts — sie spart eine
Abfrage. Gemessen bestätigt: Die Bauweise „Händler zuerst, exakt als Rückfall"
liefert dieselben 257/24 wie „nur Händler".

### ④ Der Index gehört in dieselbe Migration

Ohne ihn kostet **ein** Aufruf **14,9 ms** — ein Seq Scan über 1.599 Fragmente mit
`regexp_replace` je Zeile. `refresh_fragment_suggestions` ruft
`calculate_match_confidence` für jede offene Zahlung × jede aktive Karte auf; bei
480 × ~30 wären das rund **14.000 Aufrufe und über drei Minuten**.

**Mit Index: 0,208 ms. Faktor 72.** Der echte Lauf brauchte 23,2 s.

Das ist LL-29 in seiner allgemeinen Form: **erst zählen, wie oft gefragt wird, dann
die Frage optimieren.**

### ⑤ Die Vorschlagszeile steht unter der Beschreibung, nicht neben dem Betrag

Entschieden im Design-Record, hier nur die tragende Zahl: Bei 194 px Inhaltsbreite
braucht `KI-VORSCHLAG: TANKEN` **121,9 px**, neben `−129,00 €` sind **119 px** frei.
**Der kürzeste denkbare Fall passt schon nicht**, der längste Kartenname hat 105
Zeichen. Gekürzt wird also immer — neben dem Betrag kostet das den **Betrag** (so ist
`BF-1` in v2-10 entstanden), auf eigener Zeile nur Text.

---

## 6. Offene Punkte und Fragen

### ⚠️ Der Fund, der beim Hinsehen entstand: die App kennt den Händler und zeigt ihn nicht

**Nicht durch diesen Sprint verursacht, aber er begrenzt seine Wirkung.**

Im Browser sieht eine der neu sichtbaren Zahlungen so aus:

```
−16,65 €
VISA Debitkartenumsatz vom 29.11…      <- die Beschreibung
KI-Vorschlag: Privates Budget          <- neu in v2-29
1. Dezember 2025
```

**Der Händler fehlt.** `displayDescription` (v2-10, `RM-1`) zeigt den **letzten**
durch `|` getrennten Teil — bei DKB-Giro ist das der Verwendungszweck und richtig,
bei einem Debitkartenumsatz ist es das **Datum**. Der Händler steht davor und wird
weggeschnitten.

**Es sind exakt dieselben 39 Zahlungen**, die dieser Sprint neu sichtbar macht.
Gemessen: 39 von 195 sichtbaren 2025-Vorschlägen tragen als Anzeigetext das Datum.

**Warum das mehr ist als Kosmetik:** Der Vorschlag soll helfen zu **entscheiden**.
Wer „VISA Debitkartenumsatz vom 29.11." liest, kann nicht beurteilen, ob „Privates
Budget" stimmt — die Begründung des Vorschlags ist unsichtbar. Der vollständige Text
steht im `title`-Attribut, also erst beim Überfahren mit der Maus.

**Nicht in diesem Sprint behoben, und zwar bewusst:** Eine Änderung an
`displayDescription` betrifft **alle 1.599** Fragmente und wäre eine zweite
Verschiebung im selben Sprint — dieselbe Begründung, mit der `frequency_match`
(`ZO-1`) unangetastet bleibt. Außerdem ist „welcher Textteil wird gezeigt" eine
Gestaltungsfrage (§7 Regel 3). **Vorschlag: neuer Roadmap-Punkt `ZO-7`.**

> **Die Fehlerklasse ist LL-26 in einer FÜNFTEN Gestalt.** Bisher: Kürzen (v2-19),
> Nachbauen (v2-20), Filtern auf einen Wert (v2-23) — und v2-28s Zahl, die mit einer
> Entscheidung veraltete. Hier ist es **die Wahl des falschen Teils**: Die Datenbank
> weiß den Händler, das Frontend zeigt ihn nicht. Wieder ist jede Zahl richtig.

### Weiterhin offen

| | |
|---|---|
| **`ZO-1`** | `frequency_match` liefert ausnahmslos `1.00`. Unangetastet — eine Änderung verschiebt alle Scores gleichzeitig. |
| **`ZO-6`** | Wächter, ob eine Händler-Regel auf eine Karte zeigt, die es gibt. Von v2-28, unberührt. |
| **`F2`-Rest** | `SHOW_SUGGESTION_BADGES` bleibt `false`. Die Kästchen bleiben aus; die neue Zeile ist eine **zweite** Darstellungsform daneben, kein Ersatz (Beschluss `BF-1`, Punkt 4). |
| **Der alphabetische Münzwurf** | siehe §5 ② — betrifft 93 Handzuordnungen. |
| **Die 84 ohne Karte** | Zwei Drittel der Zahlungen mit Datumsmuster tragen einen Händler, der **nie** zugeordnet wurde. Das ist Kuratierung, keine Technik. |

---

## 7. Vorschläge für CLAUDE.md und Roadmap

**Als Vorschlag formuliert — die Anwendung braucht die Freigabe des Users.**

### Roadmap

| Punkt | Vorschlag |
|---|---|
| **`ZO-5`** | auf ✅ · **und die Begründung korrigieren.** Sie sagt heute, 147 Zahlungen seien unsichtbar, *„weil der Name jedes Mal ein anderer ist"*. Gemessen: Von 128 solchen Zahlungen tragen **84 (66 %)** einen Händler, der **nie** zugeordnet wurde — Einmalkäufe ohne passende Karte. Erreichbar über den Text waren **39**, und die sind jetzt sichtbar. |
| **`ZO-7`** *(neu)* | Der Händler wird nicht angezeigt, obwohl die App ihn kennt — §6. |
| **`ZO-8`** *(neu)* | Der alphabetische Münzwurf bei mehrdeutigem wortgleichem Text — §5 ②. |
| **`M6`/`F2`** | bleibt 🟡 — die Zeile ist da, die Kästchen bleiben aus. |

### CLAUDE.md

| § | Vorschlag |
|---|---|
| **§6 Stolperfalle 16** | **fünfte Gestalt** ergänzen: *die Wahl des falschen Teils.* Die Tabelle führt Kürzen, Nachbauen und Filtern — `displayDescription` zeigt den letzten `\|`-Teil und schneidet damit genau den Händler weg, den `history_match` erkannt hat. Suchrichtung: *wird der Teil angezeigt, auf dem die Entscheidung beruht?* |
| **§6 neue Stolperfalle 29** | **Ein Ausdrucks-Index braucht schema-qualifizierte Aufrufe.** `CREATE INDEX` scheitert mit `42883`, wenn eine eingebettete SQL-Funktion ihre Hilfsfunktion nicht als `public.…` aufruft — jeder direkte Aufruf funktioniert dabei tadellos. Und: Ein berechneter Ausdruck **ohne** Index kostete hier das 72-fache. |
| **§7 neue Regel 27** | **Ein Wächter, von dem niemand weiß, ob er auslösen kann, ist eine Zusicherung, keine Prüfung.** Wer einen Regressions-Wächter schreibt, baut den Fehler einmal testweise ein und belegt, dass er rot wird. |
| **§8 LL-40** | Zu Regel 27. |
| **§8 LL-41** | **Eine Verallgemeinerung kann die alte Regel nicht ersetzen, obwohl sie genauer ist.** Ein gröberer Schlüssel fasst mehr zusammen und wird dadurch **öfter mehrdeutig** — hier hätte er 35 von 136 sichtbaren Vorschlägen gekostet, bei um 14 Punkte besserer Genauigkeit. **Wer eine Erkennung verallgemeinert, misst nicht nur die Trefferquote, sondern was die alte Fassung heute schon leistet.** |
| **§9** | Sprint-Stand auf v2-29, Vorschläge 2025 **136 → 195**, Momentaufnahme 2025 auf **21.708,77 €** (war 21.776,33 € — normale Kuratierung, kein Befund). |
