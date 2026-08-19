# Zuordnungs-Messung 2025 — Sprint v2-27, Phase 3

> **Der Halt.** Diese Messung entscheidet, ob das rückwirkende Verlinken (`ZO-3`)
> überhaupt lohnt. Sie wird **vorgelegt, nicht vorweggenommen** (Auftrag vom 19.08.2026).
>
> Alles am 19.08.2026 gegen Produktion gemessen, **nach** dem Zurückdatieren (Phase 2),
> **rein lesend** — es ist keine Zeile geschrieben worden.

---

## 1. Warum überhaupt gemessen werden kann

Vor Phase 2 hatte 2025 **keine Vorschläge**, und zwar nicht, weil die Zuordnung schlecht
gewesen wäre: Es gab dort schlicht keine aktive Karte, also nichts vorzuschlagen. 751
offene Zahlungen, 0 Konfidenzwerte, 0 Vorschläge.

Erst das Zurückdatieren schafft die Ziele. Das ist der Grund, warum `DA-1` in der Roadmap
**vor** `ZO-3` steht.

---

## 2. Die Messregel — und warum sie hier hält

§7 Regel 25 / LL-27 verlangt: **Richtig UND Falsch zählen**, und das geprüfte Element aus
seiner eigenen Lernmenge ausschließen. Sonst misst man Auswendiglernen statt Vorhersage.

**Für 2025 selbst gibt es keine Wahrheit** — dort ist nichts von Hand zugeordnet. Gemessen
wird deshalb gegen die **411 verlinkten Zahlungen aus 2026**: Für jede wird der beste
Vorschlag berechnet und mit der Karte verglichen, die der Nutzer tatsächlich gewählt hat.

**Der Leave-One-Out-Ausschluss ist eingebaut, nicht nachgerüstet.** `history_match` filtert
selbst mit `f.id <> p_fragment_id` und zählt ausschließlich `origin = 'MANUAL_DROP'` — die
Funktion sieht ihre eigene Antwort also nie und lernt auch nicht aus automatischen
Zuordnungen.

---

## 3. Kreuzvalidierung gegen die 2026-Wahrheit

| Zeitraum | geprüft | ab 0,60 | richtig | falsch | ab 0,95 | richtig | falsch |
|---|---|---|---|---|---|---|---|
| Januar 2026 | 48 | 25 | 23 | 2 | 8 | 8 | **0** |
| Februar–April | 144 | 80 | 64 | 16 | 15 | 15 | **0** |
| Mai–August | 219 | 125 | 94 | 31 | 25 | 25 | **0** |
| **Summe** | **411** | **230** | **181** | **49** | **48** | **48** | **0** |

**Ab der Badge-Schwelle 0,60: 181 richtig zu 49 falsch — 78,7 %.**
Gut genug, um einen Vorschlag *anzuzeigen*. **Nicht** gut genug, um automatisch zu
verlinken: Jede fünfte Zuordnung wäre falsch, und sie würde rückwirkend in die Sparrate
gehen.

**Ab 0,95: 48 von 48 richtig, kein einziger Fehlgriff.**
Das deckt sich mit v2-21, wo im Prüfset 11 von 11 solcher Fälle richtig waren — jetzt auf
der vierfachen Menge bestätigt.

---

## 4. Was 2025 dadurch bekommt

| Zeitraum | offene Zahlungen | ab 0,60 | ab 0,95 |
|---|---|---|---|
| Januar–Juni 2025 | 380 | 133 | 21 |
| Juli–Dezember 2025 | 371 | 120 | 20 |
| **Summe** | **751** | **253** | **41** |
| *vorher* | *751* | ***0*** | ***0*** |

**Von null auf 253 sichtbare Vorschläge** — für ein Drittel aller offenen Zahlungen des
Jahres liegt jetzt ein Kartenvorschlag vor.

---

## 5. Die 41 Kandidaten ab 0,95 — einzeln geprüft

| Karte | Anzahl | Summe | Konfidenz | Beschreibung im Kontoauszug |
|---|---|---|---|---|
| Berufsunfähigkeit – Alte Leipziger | 12 | −1.146,11 € | 0,955–1,00 | „Alte Leipziger Lebensversicherung…" |
| Private Altersvorsorge – Nürnberger | 12 | −1.373,20 € | 0,955–1,00 | „Nurnberger Lebensversicherung Akti…" |
| Spotify | 11 | −120,89 € | 0,955 | „Spotify" |
| Audible | 6 | −59,70 € | 1,00 | „Audible Gmbh*…" |
| **Summe** | **41** | **−2.699,90 €** | | |

**41 von 41 sind eindeutig richtig.** Es sind vier Karten mit unverwechselbaren
Gläubigernamen; keine zweite Karte im Bestand trägt einen ähnlichen Namen. Die Prüfung ist
hier ausnahmsweise auch von Hand belastbar, weil die Menge klein und die Texte eindeutig
sind.

---

## 6. Die Wirkung auf die Sparrate — gemessen, nicht geschätzt

Trockenlauf mit RAISE-Rollback (LL-18): alle 41 Verknüpfungen angelegt, gemessen,
zurückgerollt. `origin = 'AUTO_ABSORBED'`, Link-Monat = Buchungsmonat.

| Monat 2025 | vorher | nachher | Differenz |
|---|---|---|---|
| Januar | 1.849,12 | 1.854,61 | **+5,49** |
| Februar | 1.890,50 | 1.891,42 | +0,92 |
| März | 1.890,50 | 1.891,42 | +0,92 |
| April | 1.829,39 | 1.830,31 | +0,92 |
| Mai | 1.870,65 | 1.871,57 | +0,92 |
| Juni | 1.880,55 | 1.881,47 | +0,92 |
| Juli | 1.849,12 | 1.850,04 | +0,92 |
| August | 1.890,50 | 1.891,42 | +0,92 |
| September | 1.890,50 | 1.888,02 | **−2,48** |
| Oktober | 1.859,07 | 1.856,59 | **−2,48** |
| November | 1.880,55 | 1.878,07 | **−2,48** |
| Dezember | 1.880,55 | 1.877,90 | **−2,65** |
| **Jahressumme** | **22.461,00** | **22.462,84** | **+1,84** |

**2026 bewegt sich in keinem Monat.** Anker 1 hält in allen zwölf 2025-Monaten.

> ### Die Zahl, die man nicht verwechseln darf
>
> Die 41 Zahlungen summieren sich auf **−2.699,90 €**. Die Sparrate bewegt sich um
> **+1,84 €**.
>
> Das ist kein Widerspruch, sondern „Realität gewinnt": Bei Fixkosten wirkt nur die
> **Differenz** zwischen Plan und tatsächlicher Zahlung. Der Plan für diese vier Karten
> ist der Jahresdurchschnitt der echten Zahlungen — deshalb hebt sich fast alles auf, und
> übrig bleibt die Streuung innerhalb des Jahres.
>
> **Wer beide Zahlen verwechselt, hält einen harmlosen Eingriff für einen gefährlichen.**
> Dieselbe Warnung steht in der Roadmap bei `ZO-3` für 2026 (dort: −1.296,87 € Zahlungen
> gegen +4,79 € Sparrate).

---

## 7. Bewertung

**Die Messung trägt.** Bei 0,95 liegt die Trefferquote in der Kreuzvalidierung bei 48/48,
und die 41 Kandidaten für 2025 sind einzeln nachgeprüft ebenfalls alle richtig. Die
Sparraten-Wirkung ist mit +1,84 € auf das Jahr klein und in jedem Monat nachvollziehbar.

**Was ausdrücklich nicht empfohlen wird:** automatisches Verlinken ab 0,60. Dort wäre
jede fünfte Zuordnung falsch (49 von 230), und ein falscher Link geht rückwirkend in die
Sparrate ein. Diese 253 Vorschläge gehören angezeigt, nicht ausgeführt.

**Offen und dem Nutzer vorgelegt:** ob die 41 verlinkt werden.
