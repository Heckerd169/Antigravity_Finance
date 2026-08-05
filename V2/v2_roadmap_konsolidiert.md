# Roadmap — Antigravity Finance

> **Was das hier ist:** die einzige Liste offener Themen. Sie ist nach **Sprint-Paketen**
> geordnet — jedes Paket ist ein planbarer Sprint, nicht eine Themenkategorie.
> **Stand:** 05. August 2026 (nach v2-09, Ideen-Runde) · **Vorgänger-Struktur:** bis zum
> 04.08.2026 waren die Themen nach 14 Buchstaben-Kategorien (A–N) sortiert. Die Kennungen
> leben weiter (§5), damit ältere Papiere auflösen — aber sie sind nicht mehr die Ordnung.
>
> **Letzte Änderung (Ideen-Runde 04./05.08.2026):** drei neue Pakete eingefügt —
> **Paket 2** „Rohmasse lesbar machen" (`RM-n`), **Paket 3** „Liquiditäts-Vorschau"
> (`LQ-n`) und **Paket 4** „Kategorien im Karussell" (`KAT-n`). Paket 10 heißt jetzt
> „Verlauf" statt „Kartenverlauf".
> **Achtung:** Paket-Nummern aus Fassungen vor dieser Runde liegen heute **drei Stellen
> weiter hinten** (alt 2–11 → neu 5–14); Paket 1 ist unverändert.
>
> **Pflege:** Am Ende jedes Sprints wird der Stand der berührten Pakete mitgezogen —
> zusammen mit CLAUDE.md und den Bibeln. Die Fähigkeit `sprint-abschluss` führt das
> als eigenen Schritt. Ohne diese Routine veraltet die Datei innerhalb von zwei Sprints.

**Zeichen:** ✅ erledigt · 🟡 teilweise · ⬜ offen · ⊘ hinfällig · 🔎 vor dem Schnitt prüfen

---

## 0. Stand in Zahlen

*Alle Zahlen am 05.08.2026 zeilengenau nachgezählt.*

| | Anzahl |
|---|---|
| Offene Pakete | **14** |
| Themen darin | **40** |
| Hausaufgaben ohne eigenen Sprint | **7** |
| **Offen gesamt** | **47** |
| Erledigt | 25 |
| Hinfällig geworden | 4 |

> Die 47 setzen sich zusammen aus 28 offenen Themen der Alt-Roadmap **minus 3**
> (F1, F2, F3 sind unter M6 zu einer Zeile zusammengefasst) **plus 11 neue**:
> die fünf Befunde vom 04.08., zwei Datenbasis-Themen und zwei Übungs-DB-Hausaufgaben,
> die bisher nur im Projekt-Gedächtnis standen, sowie zwei Feinschliff-Punkte
> (B2-F, A1-F), die zuvor nur im Fließtext erwähnt waren — **plus 11** aus der
> Ideen-Runde vom 04./05.08.2026 (RM-1…RM-4, KAT-1…KAT-4, LQ-1…LQ-3).

**Die Pakete 1, 2, 4 und 5 sind eine Kette, keine Liste.** Jedes baut das Werkzeug für
das nächste:

| | | |
|---|---|---|
| Paket 1 | Fehler beheben | → verlässliche Zahlen |
| Paket 2 | Rohmasse lesbar | → du erkennst, **was** du zuordnest |
| Paket 4 | Kategorien | → du findest, **wohin** |
| Paket 5 | Kuratierung | → der Marathon, einmal, im fertigen Cockpit |

**Paket 3 steht bewusst daneben, nicht darin.** Die Liquiditäts-Vorschau hängt an
keinem anderen Paket und liefert als Einziges Wert, **bevor** kuratiert ist. Sie steht
an dieser Stelle, weil Paket 4 noch nicht schneidbar ist — sie füllt die Wartezeit,
statt sie zu verlängern.

**Was als Nächstes dran ist:** Paket 1. Ein Rechenfehler, der 900 € in der
Juli-Sparrate bewegt, wiegt schwerer als jedes offene Feature — und drei der fünf
Befunde sind bereits entschieden und sofort umsetzbar. **Paket 4 ist noch nicht
schneidbar** und braucht vorher eine Design-Direktor-Runde.

**Drei Entscheidungen blockieren Arbeit** (alle in
`V2/befunde_2026-08-04_fehler_und_entscheidungen.md` §7, jeweils mit Empfehlung):
**E1** Was bedeutet die Zahl auf einer gemeinsamen Karte? · **E2** Was, wenn
Gutschriften die Ausgaben übersteigen? · **E3** Braucht Gleichstand eine eigene
Formulierung? Ohne sie darf an den Befunden 4 und 5 nicht gebaut werden.

---

## 1. Offene Pakete

Die Reihenfolge ist ein **Vorschlag**, kein Beschluss. Sie ändert sich erfahrungsgemäß
mit dem, was beim Benutzen auffällt.

### Paket 1 · Fehler aus der Nutzung
**Entsperrt:** verlässliche Zahlen. Solange die Sparrate falsch rechnet, ist jede
Auswertung darauf wertlos — auch die Abweichungs-Treiber.
**Quelle:** `V2/befunde_2026-08-04_fehler_und_entscheidungen.md` (Diagnose vollständig,
Prüfanker je Fehler benannt)

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| BF-3 | Einkommens-Popup öffnet ~80 px schmal, unbenutzbar | Bug | nein | ⬜ | **Entschieden, sofort umsetzbar.** Popup wird ohne Portal innerhalb eines Elements mit `transform` gezeichnet; ein Vorfahre mit `transform` wird zum Bezugsrahmen für `position: fixed`. Alle acht anderen Overlays nutzen bereits Portale. **Blockiert aktiv das Eintragen von Gehältern — höchste Dringlichkeit.** Die Zentrierung ist im Code bereits hinterlegt (`place-items: center`) und greift nur wegen des fehlenden Portals nicht — die Reparatur stellt damit zugleich die Positionsregel her. **`RM-4` hier anhängen.** |
| BF-1 | Euro-Zeichen bricht auf die nächste Zeile | Bug | nein | ⬜ | **Entschieden.** Alle KI-Vorschlags-Kästchen entfallen aus der Anzeige; Datenbank rechnet weiter, später mit einer Zeile wieder einschaltbar. Die sechs Badge-Farbtöne bleiben ungenutzt im Code. Zusätzlich Umbruch-Verbot für den Betrag. Schließt zugleich den Badge-Überlauf aus v2-07-Review §5.1. |
| BF-5 | Fragmente werden ohne Vorzeichen addiert | Bug | **ja** | ⬜ | `SUM(ABS(...))` wirft Vorzeichen weg. Betrifft heute **eine** Karte („Aline Geburtstag", Juli) mit **900,00 €** Wirkung. Sollverhalten steht bereits in Design-Doku §11 — der Leitfaden beschreibt ein Verhalten, das es nie gab. **Hängt an E2.** Prüfanker: Juli-Ist −1.222,75 → −322,75, alle anderen Monate unverändert. |
| BF-2 | Sinnloser Hinweis unter dem Ring bei negativer Sparrate | Bug | nein | ⬜ | „Plan fast 0 € — −1.223 € gespart". Aus zwei Textzweigen wird einer, vorzeichensicher. **Hängt an E3.** Sinnvoll **nach** BF-5, weil die Juli-Zahl dann stimmt und der neue Text am echten Fall zu sehen ist. |
| BF-4 | Gemeinsame Karten zeigen den Gesamtbetrag | Diskussion | **ja** | ⬜ | Anzeige ist spec-konform (§4.5), dahinter steckt aber ein Rechenproblem mit Geldwirkung: Der Anteil wird auch auf eine zugeordnete Fragment-Summe angewandt → Sparrate rund **466 €/Monat zu gut**, sobald eine gemeinsame Karte ein Fragment bekommt. Heute noch nicht eingetreten (keine gemeinsame Karte hat eines). **Hängt an E1.** Eigene Phase, berührt Design-Doku §4.5. **Neues Beweismaterial für E1** (Messung 05.08.2026, `V2/befunde_2026-08-05_liquiditaet.md` L4): Bei **allen vier** gemeinsamen Karten entspricht der tatsächlich abgebuchte Betrag auf den Cent dem rechnerischen Anteil — Miete 1.089,26 statt 1.904,00 · Strom 36,04 statt 63,00 · Internet 22,87 statt 39,98 · Rechtsschutz 15,45 statt 27,01, jeweils mit „(Domi)" im Verwendungszweck. Das sagt nicht, was die Karte zeigen *soll*, ist aber ein starkes Argument für den Anteil — und lag bei der Formulierung von E1 nicht vor. |

> BF-5 und BF-4 fassen beide die Rechenfunktionen an → gemeinsame Übungs-DB-Probe,
> wenn sie im selben Sprint laufen. Fähigkeit `db-eingriff`.

---

### Paket 2 · Rohmasse lesbar machen
**Entsperrt:** Kuratieren von Hand ohne Reibung. Die Beschreibung auf einem
Rohmasse-Fragment wird heute vom Empfänger gefüllt, der Verwendungszweck fällt dem
„…" zum Opfer — genau die Information, die man beim Zuordnen braucht. Damit ist
dieses Paket das **Werkzeug für Paket 5** (Kuratierung 2026).
**Kein Datenbank-Eingriff, reine Anzeige.** Quelle: Ideen-Runde 04.08.2026.

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| RM-1 | Beschreibung auf den Verwendungszweck kürzen | Feature | nein | ⬜ | **Entschieden.** Regel: **immer der letzte durch `\|` getrennte Teil**; ist er leer, Rückfall auf den Anfang. Deckt alle drei Quellen ab, ohne deren Herkunft zu kennen (Giro 2 Teile · Cortal 3 · Visa 0). Greift auf 1.547 von 1.548 Fragmenten. **Ausschließlich beim Anzeigen** — der gespeicherte Text ist Bestandteil des Duplikat-Hashes, des Trigram-Index der KI-Zuordnung und des Sortier-Tiebreakers und bleibt unangetastet. Abschneiden mit „…" ist bereits gebaut (`text-overflow: ellipsis`), kein Aufwand. Berührt Design-Doku §8. |
| RM-2 | Schaufenster-Popup für ein Fragment | Feature | nein | ⬜ | **Entschieden: reines Anzeigen, keine Knöpfe** — die Gegenleistung dafür, dass RM-1 Information von der Karte nimmt. Zeigt den vollständigen Text sowie Betrag, Datum, Status und bei Überträgen das **Gegenkonto mit „eigenes Konto"-Hinweis** (`counterparty_iban`, heute schon vorhanden). **Klickbar werden alle Fragmente**, auch zugeordnete und Überträge — beide sind heute per `pointer-events: none` tot gestellt, das ändert Design-Doku §8. Natürlicher Ort für den KI-Vorschlag, den BF-1 von der Karte nimmt. **Gestaltungsfrage offen:** Rangfolge der Angaben und Hauptzeile → `design-direktor` vor dem Bauen. |

> Bewusst **nicht** enthalten: Handlungen im Popup (Zuordnen, Lösen, Umschichten
> markieren). Das ist `M2` in Paket 7 und wird als Ganzes entschieden, nicht in
> Scheiben. Die beiden grenzen aneinander — der Umschichten-Knopf sitzt heute auf
> jeder Rohmasse-Karte und wäre im Popup besser aufgehoben.

---

### Paket 3 · Liquiditäts-Vorschau
**Entsperrt:** die Frage „reicht mein Girokonto bis Monatsende?". Gemessen für August
2026 stehen **1.814 € feste Abbuchungen** und **590 € Budget** aus; der letzte bekannte
Kontostand ist **254,97 €**. Die App kann das heute nicht beantworten.
**Steht bewusst neben der Kette**, nicht darin: Dieses Paket braucht weder Kuratierung
noch Kategorien noch die Rohmasse. Es ist das Einzige, das sofort Wert liefert — und
das Einzige, das gebaut werden kann, solange Paket 4 auf seine Gestaltungs-Runde wartet.
**Quelle und Belege:** `V2/befunde_2026-08-05_liquiditaet.md`

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| LQ-1 | Fälligkeitstag je Karte | Feature | **ja** | ⬜ | Neues Feld, Oberfläche zum Setzen, einmalig ~20 Werte eintragen. **Ohne das gibt es kein „zum Stichtag"** — `cards` kennt heute nur Frequenz und ersten aktiven Monat, nie einen Tag (Befund L2). **Bewusst gegen die zwei Alternativen entschieden:** der Import ist zu alt (jüngste Buchung 31.07., null August-Buchungen), und das Bezahlt-Häkchen wurde in der gesamten Historie **kein einziges Mal** benutzt (L6). Fähigkeit `db-eingriff`. |
| LQ-2 | Ausstehend-Anzeige, fest und Budget getrennt | Feature | nein | ⬜ | **Entschieden: zwei Zeilen, nie eine Zahl.** Ein Dauerauftrag ist ein Termin, ein Budget eine Erlaubnis ohne Termin (L7). Rechnet gegen das heutige Datum. **Nutzt dieselben Beträge wie die Sparrate** — keine zweite Rechenart nötig, weil die Daueraufträge exakt auf dem Anteil stehen (L4). Die Aussage ist eine **Vorhersage** („war am 1. fällig"), keine Feststellung („ist bezahlt"); der Wortlaut muss das tragen. **Gestaltungsfrage offen:** Wo steht die Zahl? Eine zweite prominente Zahl neben der Sparrate ist eine Rangfolge-Entscheidung → `design-direktor` vor dem Bauen. |

> **Bekannte Lücke, bewusst offen:** Die Kreditkarten-Abrechnung belastet das Girokonto
> um den 24. (Juli −172,60 €), ist als Übertrag markiert und wird von keiner Karte
> abgebildet. Die Summe ist dadurch systematisch **leicht zu optimistisch**. Seriös
> vorhersagbar erst mit unterscheidbaren Konten → `LQ-3` in Paket 9.
> **Nicht enthalten:** der Kontostand selbst. Er steht ungenutzt in Zeile 3 jedes
> DKB-Abzugs (L1), wäre aber nur so frisch wie der letzte Import. Wird interessant,
> sobald häufiger importiert wird — dann ein kleiner Nachtrag, kein eigenes Thema.

---

### Paket 4 · Kategorien im Karussell
**Entsperrt:** eine Fläche, auf der man kuratieren kann. Gemessen am 04.08.2026 stehen
**19–32 Karten** in einem Monat im Karussell (Grundrauschen ~20, Spitzen 31 im Mai und
32 im Juli). Beim Zuordnen sucht man das Ziel unter genau diesen Karten — deshalb steht
dieses Paket **vor** der Kuratierung, nicht danach.
**Quelle und Belege:** `V2/befunde_2026-08-04_kategorien.md` (30 Befunde aus zwei
parallelen Analysen plus eigene Messungen)
**⚠️ Noch nicht schneidbar** — es hängen sechs Gestaltungsfragen daran (Befunde §6).
**Erst `design-direktor`, dann schneiden.**

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| KAT-1 | Kategorien und Unterkategorien als eigene Struktur | Feature | **ja** | ⬜ | Eigene Tabelle, eigener Anlageweg, Anlegen/Ändern/Beenden/Löschen. **Ausdrücklich keine `cards`-Zeile** — beide Sparrate-RPCs laufen ohne Typ-Filter über alle Karten, eine Kategorie-Karte würde doppelt gezählt und der Prüfanker bräche (Befund D1). Der Papierkorb kann eine Kategorie heute nicht tragen: sein Typ-Verzeichnis kennt nur vier Werte, das Aufräumen filtert hart auf `CARD`, und 60 s Aufbewahrung reichen für eine Kaskade nicht (D7). **„Ohne Kategorie" muss ein vollwertiger Eimer sein**, kein Fehlerzustand — beide Anlage-RPCs kennen keine Kategorie und liefern laufend welche nach (D12). |
| KAT-2 | Karussell gruppiert nach Kategorien | Feature | nein | ⬜ | Klapp-Verhalten, Drop-Ziele, Gesten. **Muss das Zuordnen für die Hierarchie lösen** — ein Drop braucht heute eine Karten-ID, eine zugeklappte Kategorie hat keine (Befund U1, BLOCKER). Eine beendete Kategorie muss in vergangenen Monaten sichtbar bleiben, sonst verliert die Vergangenheit ihre Struktur (U13). |
| KAT-3 | Kategorie-Zahl = Beitrag zur Sparrate | Feature | **ja** | ⬜ | **Entschieden:** die Zahl ist der **vorzeichenrichtige Beitrag der enthaltenen Karten zur Sparrate des Monats** — dieselbe Summierung wie im Ring, nur gefiltert. Nicht ein eigener Plan. Erbt Vorzeichen, Partner-Anteil und die Typ-Sonderregeln, statt sie nachzubauen; schließt damit die Befunde D2 und D5 strukturell aus. **Server-seitig** — im Browser wäre es eine eigene Sparrate-Rechnung (Arbeitsregel 1). Räumt zugleich den heutigen N+1-Ladeweg auf (46 Karten × 3 Einzelabfragen, im Code für „<20 Karten" begründet — D14). Fähigkeit `db-eingriff`, Anker vorher/nachher. |

> **Reihenfolge:** KAT-1 zuerst, dann KAT-2 und KAT-3 — drei Phasen, ein Commit je
> Phase (Arbeitsregel 11).
> **Zieht mit:** `M5` aus Paket 7 wird **Voraussetzung statt hinfällig** — eine Kategorie
> mischt erstmals verschiedene Kartentypen, deren Zustands-Farben nie nebeneinanderstanden
> (U11). Die Klick-Geste kollidiert mit `M2`: über jeder Karte liegt eine unsichtbare
> Klickfläche für „bezahlt", ein Fehlklick bewegt die Sparrate (U3).
> **Nicht enthalten:** der Ausgabenverlauf — der ist `KAT-4` in Paket 10 und wäre vor der
> Kuratierung wertlos (D4: 0 % Abdeckung in vier von sieben Monaten 2026, ganz 2025 ohne
> Karten).

---

### Paket 5 · Datenbasis vervollständigen
**Entsperrt:** ehrliche Vorjahreswerte, aussagekräftige Treiber, überhaupt eine
Vergleichsbasis. Ohne dieses Paket bleibt die 2025-Goldlinie irreführend hoch.

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| DA-1 | Karten auf 2025 zurückdatieren | Daten | ja (Schreibzugriff) | ⬜ | Ohne sie ist die 2025-Sparrate das **volle Netto** — es sind dort keine Kosten modelliert. Die Vorjahres-Goldlinie (48.445 €) ist dadurch technisch richtig und inhaltlich unvergleichbar. Zugleich Voraussetzung dafür, dass 2025 überhaupt kuratierbar ist (Karten sind dort inaktiv, es gibt keine Ablageziele). **User-Entscheidung offen.** |
| DA-2 | Kuratierung 2026 | Daten | ja (Schreibzugriff) | ⬜ | Seit v2-07 überhaupt erst möglich — vorher war die Rohmasse ab Februar leer. Voraussetzung dafür, dass die Abweichungs-Treiber live etwas zeigen: bei heute 4 Verknüpfungen, davon 3 wirkungsneutral, steht überall „Keine Abweichungen". Das ist korrektes Verhalten, aber nutzlos. |

---

### Paket 6 · Bessere automatische Zuordnung
**Entsperrt:** senkt den Aufwand für **alle** nachgelagerten Themen. Der heutige
Engpass ist Handarbeit beim Kuratieren.

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| M6 | Verbesserte automatische Fragment-zu-Karten-Zuordnung | Feature | evtl. | ⬜ | **Fasst F1, F2, F3 zusammen.** F1 Konfidenz-Verbesserung (Embeddings, Levenshtein, Klassifikator; evtl. Score-Spalten) · F2 Kategorie-Vorhersage pro Nutzer (Schema-Eingriff) · F3 Fragment-Clustering. Empfehlung: erster echter Feature-Sprint nach den Paketen 1 und 5 (Fehler und Datenbasis). **Namenskollision beachten:** „F2 Kategorie-Vorhersage" meint das KI-Vorschlags-Badge auf Fragmenten, nicht die Karten-Kategorien aus Paket 4 (Befund U6). |

---

### Paket 7 · Gestaltungs-Feinschliff
**Entsperrt:** die Endabnahme zweier fertiger Sprints (v2-05, v2-06).
**Werkzeug:** Fähigkeit `design-direktor`.

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| M2 | Verben-Sprache und Gesten des Karten-Lebenszyklus | Diskussion | nein | 🟡 | Backend entschieden und umgesetzt (v2-05): Verbergen ersatzlos gestrichen, Drei-Verben-Modell steht. **Offen:** Wortwahl und Gesten. Interim-Oberfläche ist in Betrieb. Umfasst auch die Geste für `ASSET_REALLOCATION` (heute schlichter Text-Knopf). |
| B2-F | Feinschliff der Abweichungs-Treiber | Diskussion | nein | ⬜ | Label-Format der Treiber-Zeilen · Wortlaut bei Monaten ohne Abweichung · Entscheidung über **E4** (Pseudo-Treiber „n € unzugeordnet in Monat M" für die Rohmasse — bewusst nicht umgesetzt). |
| M5 | Karten-Anordnung im Karussell | Feature | nein | ⬜ 🔎 | Heute Fixkosten → Einnahmen → Budget (seit Sprint 4). Ursprünglicher Wunsch war Budget → Fixkosten → Einnahmen. **Vor dem Schnitt bestätigen**, ob das noch gilt. |
| A1-F | Badge-Palette und Schalter-Sprache | Diskussion | nein | ⬜ | Aus v2-07: reiner Token- und Text-Tausch. **Achtung:** Wird BF-1 umgesetzt, entfallen die Vorschlags-Kästchen ganz — dann erledigt sich die Palettenfrage von selbst. Erst nach Paket 1 anfassen. |

---

### Paket 8 · Einstellungen
**Entsperrt:** eigene IBANs ohne SQL pflegbar — heute ist bei jedem neuen Konto ein
manueller Datenbank-Eingriff nötig.

| # | Punkt | Art | Datenbank | Stand |
|---|---|---|---|---|
| D3 | Settings-Bereich allgemein, Routing und Layout | Feature | nein | ⬜ |
| D1 | Oberfläche zur Verwaltung von `own_ibans` | Feature | nein | ⬜ |
| D2 | Steuerklasse-Wechsel über die Oberfläche | Feature | nein | ⬜ |

---

### Paket 9 · Mehrkonten Stufe 2
**Entsperrt:** Überweisungsketten (Cortal → Giro → Kreditkarte) werden als **eine**
Ausgabe erkannt statt als drei Bewegungen.
**Voraussetzung:** mindestens ein sauber kuratierter Monat — sonst fehlt die
Vergleichsbasis für die Verkettung.

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| M9 | Multi-Account-Reconciliation, Stufe 2 | Feature | **ja** | 🟡 | Stufe 1 erledigt (v2-04): DKB-Visa-Parser, `ASSET_REALLOCATION`, Transfer-Erkennung. |
| F5 | Paired-Fragment-Verlinkung (`paired_fragment_id`) | Feature | **ja** | ⬜ | Technische Voraussetzung für M9 Stufe 2. Muss **beim Import** gesetzt werden, wo Konto und Herkunftsdatei noch bekannt sind. Nachträgliches Paaren scheidet aus: bei 378 internen Überträgen sind **97 (26 %) mehrdeutig** — gleicher Betrag, umgekehrtes Vorzeichen, wenige Tage Abstand, mehrere Kandidaten (Messung 04.08.2026). |
| LQ-3 | Kreditkarten-Abrechnung in die Liquiditäts-Vorschau | Feature | **ja** | ⬜ | **Folgepunkt zu LQ-2 (Paket 3).** Die Visa-Abrechnung belastet das Girokonto um den 24. (2026: −2,23 · −64,73 · −8,47 · **−172,60 €**), ist korrekt als Übertrag markiert und zählt deshalb nicht in die Sparrate — für die Liquidität des Girokontos ist sie aber ein echter Abfluss. Voraussetzung: Fragmente müssen wieder erkennen lassen, auf **welchem eigenen Konto** sie liegen; heute kennen sie nur die Gegen-IBAN (Befund L3). |
| RM-3 | Gegenbuchung im Fragment-Popup anzeigen | Feature | nein | ⬜ | **Folgepunkt zu RM-2 (Paket 2).** Eine Zeile mehr im fertigen Schaufenster, sobald `F5` die Paare gesetzt hat. Bis dahin zeigt das Popup nur das Gegenkonto, nicht die Gegenbuchung — bewusst, weil Raten in jedem vierten Fall falsch läge. |

---

### Paket 10 · Verlauf

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| M7 | „Verlauf" im Karten-Kontextmenü: Jan–Dez, Ist gegen Plan je Karte | Feature | nein | ⬜ | Datenseitig bereits abgedeckt — `get_year_deviation_drivers` liefert je Karte `ist` und `plan` pro Monat. Reines Oberflächen-Feature. **Nicht mehr allein isolierbar**, seit `KAT-4` dieselbe Fläche braucht (Befund U5). |
| KAT-4 | Ausgabenverlauf je Kategorie und Unterkategorie | Feature | **ja** | ⬜ | **Die zweite Hälfte der Kategorien-Idee** (Ideen-Runde 04.08.2026) — bewusst hierher gehängt statt in Paket 4. Setzt `KAT-1` **und** eine kuratierte Datenbasis voraus: heute hängen in Jan–Apr **0,0 %** der Ausgaben an einer Karte, im Juli 74,3 %; die Kurve zeigte den Kurationsfortschritt statt des Ausgabeverhaltens, und für ganz 2025 wäre sie null (Befund D4). Zusammen mit `M7` zu schneiden — Karten- und Kategorie-Verlauf sind dieselbe Fläche mit zwei Ebenen, und Design-Doku §9 erklärt das Welle-Popup zur einzigen Heimat der kumulierten Sicht. |

> Deshalb heißt dieses Paket seit dem 04.08.2026 **„Verlauf"** statt „Kartenverlauf".
> Voraussetzungen: Paket 4 (`KAT-1`) und Paket 5 (`DA-1`/`DA-2`).

---

### Paket 11 · Welle-Rest

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| B1 | Gleitendes 12-Monats-Fenster statt Kalenderjahr | Feature | nein | ⬜ | Im Welle-Kontext neu zu definieren — heute führt sie das Kalenderjahr. |
| B4 | Monatsgenauer Nenner für die %-Angabe statt jüngstem Einkommens-Slot | Feature | nein | ⬜ | |
| B5 | Bulk-Abfrage `get_yearly_sparrate_curves` | Feature | **ja** | ⬜ | **Nur bei spürbarer Verzögerung.** Nicht auf Verdacht optimieren. Der Jahres-Call aus v2-06 ist der erste Baustein in diese Richtung. |

---

### Paket 12 · Import-Erweiterungen
**Bedarfsgetrieben** — erst wenn eine Quelle real gebraucht wird.

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| F4 | IBAN-Format-Prüfung in der Datenbank | Feature | **ja** | ⬜ | Constraint über regulären Ausdruck. |
| F6 | Cortal-Importe in Fremdwährung | Feature | **ja** | ⬜ | Heute verworfen mit `error-corrupt` (Sprint 9 OQ2). |
| F7 | PDF- und Excel-Import | Feature | nein | ⬜ | Als Adapter auf Anwendungsebene. |

---

### Paket 13 · Lebenszyklus-Rest

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| G1 | Aufräumen des Papierkorbs für die übrigen Entitäten | Feature | **ja** | 🟡 | Für **Karten** in v2-05 gelöst (`cleanup_expired_card_trash`, opportunistisch). Offen: Fragmente und Verknüpfungen — plus die Frage, ob eine echte Edge-Function nötig ist oder das opportunistische Muster reicht. |
| G2 | Oberfläche für den manuellen Monatsabschluss | Feature | **ja** | ⬜ | Setzt `card_monthly_states.closed_at`, das heute bewusst ungenutzt ist. |

---

### Paket 14 · Große Brocken
**Bewusst nach hinten** — alle vier werden besser, wenn die Datenbasis sauber ist.

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| E2 | Periodenabgrenzung (Dezember-Gehalt am 30.11. = Januar-Periode) | Feature | nein | ⬜ | |
| E1 | Rückwirkende Gehaltskorrektur mit Fairness-Ausgleich | Feature | **ja** | ⬜ | Neue Tabelle `fairness_deltas`. |
| M11 | Hell-/Dunkel-Modus | Feature | nein | ⬜ | Niedrige Priorität. Variablen-Ebene auf Basis von `src/styles/tokens.css`. |
| M8 | Chat-Fenster für Rückfragen zu allen App-Daten | Feature | nein (API-Ebene) | ⬜ | Großes Feature, eigene Phase. **Braucht ein Sicherheits- und Datenschutz-Konzept**, bevor irgendetwas gebaut wird. |

---

## 2. Hausaufgaben ohne eigenen Sprint

An einen passenden Sprint anhängen, nie als eigenen schneiden.

| # | Punkt | Stand | Bemerkung |
|---|---|---|---|
| RM-4 | Positionsregel für Overlays in die Design-Doku schreiben | ⬜ | **An BF-3 anhängen** (Paket 1) — dieselbe Sache: BF-3 ist die einzige Verletzung, die Reparatur ist die Durchsetzung. Wortlaut entschieden: *„Overlays und Popups erscheinen immer mittig im Bild, an derselben Stelle; sie unterscheiden sich in der Größe, nie im Ort. **Kontextmenüs** sind davon ausgenommen — sie erscheinen am auslösenden Element, weil sie sonst ihren Bezug verlieren."* Bestandsaufnahme 04.08.2026: 7 von 8 Overlays bereits zentriert, einzige bewusste Ausnahme ist das Karten-Kontextmenü (`card-interactive.tsx`, verankert am Icon). Reine Doku, kein Code. Berührt Design-Doku §7/§8. |
| J1 | Migrationen der Sprints 5–8 als Datei nachziehen | 🟡 | Seit v2-04 werden neue Migrationen als Datei abgelegt. Die Altbestände liegen weiterhin nur in Supabase. **Dringlicher geworden:** `supabase/migrations/` enthält nur zwei Patch-Dateien, der Übungs-DB-Seed ist reine Daten ohne Schema. Es gibt damit **keine versionierte Basis**, gegen die ein Eingriff in eine Rechenfunktion diffen könnte, und die Übungs-Datenbank ist aus dem Repo nicht rekonstruierbar. Spätestens vor `KAT-3` mitnehmen (Befund D15). |
| TP-1 | Prüfwert im Übungs-DB-Runbook korrigieren | ⬜ | `supabase/test_projekt/README.md:66` nennt Juni 2026 = 4.545,32 €; gültig ist **4.589,53 €**. In der Fähigkeit `db-eingriff` vermerkt, führt also niemanden in die Irre. Beim nächsten Datenbank-Eingriff mitnehmen. |
| TP-2 | `net_estimation_brackets` der Übungs-DB befüllen | ⬜ | Seed ist dort bislang leer. Nur nötig, wenn ein Sprint die Netto-Schätzung berührt. |
| M4 | Karten-Deckkraft-Schieber in der Entwicklungsumgebung | ⬜ | Nur Entwicklung, nicht in Produktion. |
| I1 | Eigene Domain statt Vercel-Subdomain | ⬜ | |
| H1 | Vercel Coding Agent Plugin bewerten | ⬜ | |

---

## 3. Dauerhaft nicht

| # | Punkt | Warum |
|---|---|---|
| L1 | Partner-only-Karten | Oberflächen-Lärm ohne Sparraten-Relevanz. Dauerhaft außerhalb des Umfangs. |
| A2 | Oberfläche „versteckte Karten verwalten" | Hinfällig — Verbergen wurde in v2-05 ersatzlos gestrichen. |
| A3 | Bestätigungs-Dialog vor dem Verbergen | Hinfällig, gleiche Begründung. Beim Löschen übernehmen Lösch-Tor und 5-Sekunden-Rücknahme diese Rolle. |
| K2 | Git-Historie von `linked-project.json` bereinigen | Hinfällig — geprüft am 25.07.2026: die Datei taucht in keinem Commit auf. Keine Schlüssel-Rotation nötig. |

---

## 4. Erledigt

| # | Punkt | Sprint |
|---|---|---|
| Init-1 | Übungs-Datenbank aufgesetzt, Runbook in `supabase/test_projekt/` | v2-05 |
| Init-2 | Deterministischer Prüfwert 2.200,00 € definiert | v2-05 |
| Init-3 | Branch-Namenskonvention `sprint/v2-NN-<thema>` | — |
| Init-4 | Sprint-Protokoll-Tabelle in CLAUDE.md | — |
| M0 | Automatisierte Tests mit Playwright, Pixel-Prüfungen, `smoke-agent` | v2-01 / 23.07. |
| A1 | Karten-spezifische Badge-Farben aus dem Kartennamen | v2-07 |
| A4 | Papierkorb-Muster über `deleted_entities`, 60-Sekunden-Aufbewahrung | v2-05 |
| B2 | Abweichungs-Treiber `get_year_deviation_drivers` | v2-06 |
| B3 | Rot-Regel bei negativer Kumulation | v2-03 |
| B6 | Vorjahres-Linie entfällt bei datenlosem Vorjahr | v2-02 |
| C1 | Übertrags-Schalter statt Überträge in der Arbeitsfläche | v2-07 |
| C2 | Backfill-Meldung ab 50 Einträgen ohne Zahl | v2-07 |
| C3 | Rohmasse ab Februar leer — 1000-Zeilen-Grenze (→ LL-21) | v2-07 |
| H2 | Arbeitssetup professionalisiert: CLAUDE.md 1.857 → 434 Zeilen, drei Fähigkeiten, geteilte Freigaben | v2-08 |
| WF-1 | Ablauf vereinfacht: drei Sprint-Phasen statt sieben · Design-Direktor als Fähigkeit statt eigenem Chat · diese Roadmap nach Paketen umgebaut · `sprint-start` mit Nachbohren ersetzt `sprint-briefing` | v2-09 |
| J2 | Typen-Regenerierung als feste Routine | — |
| K1 | Dev-Panel im Produktions-Bundle nicht enthalten (mehrfach geprüft) | — |
| M1 | Drei-Verben-Modell Beenden / Löschen / Lösen | v2-05 |
| M3 | Jahres-Welle hinter dem Ring, Popup mit kumulierter Treppe | v2-02 |
| M10 | Darstellung negativer kumulierter Sparrate | v2-02 / v2-03 |
| N1 | Rohmasse zeigte Fragmente fremder Monate | v2-01 |
| N2 | Karten-Größen-Inkonsistenz | v2-01 |
| N3 | Text-Überlauf auf langer Karte | v2-01 |
| N4 | Ring-Anzeige `+− 358,1 %` und Cap-Strategie | v2-01 / v2-03 |
| N5 | Farbtöne zwischen zugeordneten Fragmenten und Überträgen vereinheitlicht | v2-03 |

---

## 5. Kennungs-Register

Ältere Papiere nennen Themen über ihre Buchstaben-Kennung. Hier steht, wo sie heute leben.

| Kennung | Heute |
|---|---|
| A1, A4 · B2, B3, B6 · C1, C2, C3 · H2 · J2 · K1 · M0, M1, M3, M10 · N1–N5 · Init-1–4 | §4 Erledigt |
| A2, A3 · K2 · L1 | §3 Dauerhaft nicht |
| B1, B4, B5 | Paket 11 |
| D1, D2, D3 | Paket 8 |
| E1, E2 | Paket 14 |
| F1, F2, F3 | Paket 6 (unter M6 zusammengefasst) |
| F4, F6, F7 | Paket 12 |
| F5 | Paket 9 (mit M9) |
| G1, G2 | Paket 13 |
| H1, I1, J1, M4 | §2 Hausaufgaben |
| M2, M5 | Paket 7 |
| M6 | Paket 6 |
| M7 | Paket 10 |
| M8, M11 | Paket 14 |
| M9 | Paket 9 |
| RM-1, RM-2 | Paket 2 |
| RM-3 | Paket 9 (Folgepunkt zu F5) |
| RM-4 | §2 Hausaufgaben (an BF-3 anhängen) |
| LQ-1, LQ-2 | Paket 3 |
| LQ-3 | Paket 9 (Folgepunkt zu LQ-2) |
| KAT-1, KAT-2, KAT-3 | Paket 4 |
| KAT-4 | Paket 10 (mit M7) |

> **Achtung bei älteren Papieren:** Die Paket-Nummern 2–11 aus Fassungen vor der
> Ideen-Runde vom 04./05.08.2026 meinen heute **5–14**; Paket 1 ist unverändert. Die
> Buchstaben-Kennungen sind davon unberührt — sie bleiben die verlässliche Referenz.

**Neue Kennungen seit dem 04.08.2026:** `BF-n` Befunde aus der Nutzung ·
`DA-n` Datenbasis · `TP-n` Übungs-Datenbank · `RM-n` Rohmasse-Lesbarkeit ·
`LQ-n` Liquidität · `KAT-n` Kategorien · `B2-F` / `A1-F` Feinschliff zu einem
erledigten Thema.

---

## 6. Wie diese Datei gepflegt wird

**Ein neues Thema** bekommt eine Zeile in dem Paket, in das es fachlich gehört —
oder ein eigenes Paket, wenn es keines gibt. Beides passiert in Phase 1 eines
Sprints, nicht nebenbei.

**Ein erledigtes Thema** wandert aus seinem Paket nach §4, mit Sprint-Nummer. Ist ein
Paket leer, verschwindet es.

**Die Zahlen in §0** werden **nachgezählt, nicht geschätzt.** Das ist schon einmal
schiefgegangen.

**Was hier nicht hineingehört:** Begründungen und Diagnosen. Die stehen in den
Papieren unter `V2/`, hier steht nur der Verweis. Diese Datei soll auf einen Blick
beantworten, was offen ist — nicht warum.

---

*Roadmap · Antigravity Finance · umgebaut am 04. August 2026 aus der
kategorien-orientierten Fassung vom 01. Juni 2026 · zuletzt fortgeschrieben am
05. August 2026 (Ideen-Runde: Idee 1 → Paket 2, Idee 2 → Paket 4 und KAT-4,
Idee 3 → Paket 3 und LQ-3)*
