# Roadmap — Antigravity Finance

> **Was das hier ist:** die einzige Liste offener Themen. Sie ist nach **Sprint-Paketen**
> geordnet — jedes Paket ist ein planbarer Sprint, nicht eine Themenkategorie.
> **Stand:** 25. August 2026 (nach **v2-29** „Die App merkt sich, was du entschieden hast" —
> `ZO-5` erledigt, `ZO-7` und `ZO-8` neu und offen. `history_match` erkennt eine
> Handzuordnung jetzt am **Händler** statt am Wortlaut; sichtbare 2025-Vorschläge
> **136 → 195**, Sparrate in allen 24 Monaten unbewegt. Der Vorschlag steht zum ersten Mal
> in der Rohmasse. **Der teuerste Fund: Die genauere Regel wäre die schlechtere gewesen** —
> ein gröberer Schlüssel fasst mehr zusammen und wird dadurch öfter mehrdeutig, was 35 der
> 136 bestehenden Vorschläge gekostet hätte.) Davor: **v2-28** „Was die 2025-Prüfung zutage
> gefördert hat" — `DA-3`, `ZO-4` und `NAV-1` erledigt, `ZO-5` und `ZO-6` neu und offen. Die 2025-Pläne
> tragen jetzt die Beträge, die wirklich gezahlt wurden: **22.316,32 € → 21.776,33 €**,
> exakt die vorher aufgeschriebenen −539,99 €; **2026 unbewegt in allen zwölf Monaten**.
> Tankstellen und Nahverkehr ordnen sich künftig von allein zu — 65 Zahlungen aus 2025
> nachverlinkt, **ohne dass sich eine Zahl bewegt**, weil „Tanken" eine BUDGET-Karte ist.
> Und die Monatsnavigation endet erstmals dort, wo die Daten enden: Die Schranke stand
> seit **Sprint 3** auf `1900-01`.) Davor: **v2-27** „2025 wird vergleichbar" — `DA-1` und `ZO-3`
> erledigt, **kein neuer Punkt entstanden**. Die 2025-Sparrate fällt von 48.445,32 € auf
> **22.567,80 €** und liegt damit erstmals auf 2026-Niveau; 2026 hat sich in keinem der
> zwölf Monate bewegt. 41 Zahlungen rückwirkend verlinkt, 253 Vorschläge sichtbar, wo
> vorher null waren.) Davor: **v2-26** — fünf Nachbesserungen aus der Benutzung:
> `KJ-6` `KJ-7` `KJ-8` neu und erledigt, `KJ-9` neu und offen. **Der Fall des Löschriegels
> hatte eine zweite Sperre freigelegt, die niemand kannte.**) Davor: **v2-25** (der
> Löschriegel ist gefallen und ein Monat lässt sich als „nicht angefallen" markieren;
> `KJ-1` `KJ-2` `KJ-3` erledigt, `KJ-4` **nicht reproduzierbar** und deshalb auf 🔎).
> Davor am 17.08.: v2-24 (die App
> reagiert sofort: 233 → ~18 Netzrunden je Dashboard-Aufbau, kein 504 mehr, keine bewegte
> Zahl; **neues Paket 17**, weil Performance in dieser Datei bis dahin nirgends vorkam)
> und die Design-Runde (**neues Paket 18**). Davor:
> 13. August 2026 (nach v2-18 — zwei Befunde aus der Nutzung behoben;
> davor v2-17 mit `KAT-1`/`KAT-2`/`KAT-3` und der Hausaufgabe `J1`, **Paket 4
> abgeschlossen**) · **Vorgänger-Struktur:** bis zum
> 04.08.2026 waren die Themen nach 14 Buchstaben-Kategorien (A–N) sortiert. Die Kennungen
> leben weiter (§5), damit ältere Papiere auflösen — aber sie sind nicht mehr die Ordnung.
>
> **Letzte Änderung (Ideen-Runde 04./05.08.2026):** drei neue Pakete eingefügt —
> **Paket 2** „Rohmasse lesbar machen" (`RM-n`), **Paket 3** „Liquiditäts-Vorschau"
> (`LQ-n`) und **Paket 4** „Kategorien im Karussell" (`KAT-n`). Paket 10 heißt jetzt
> „Verlauf" statt „Kartenverlauf". Zusätzlich haben **Paket 5 und 6 die Plätze
> getauscht**: die bessere automatische Zuordnung steht jetzt **vor** der Kuratierung.
> **Achtung:** Paket-Nummern aus Fassungen vor dieser Runde liegen heute **drei Stellen
> weiter hinten** (alt 2–11 → neu 5–14); Paket 1 ist unverändert. Einzige Ausnahme vom
> reinen Versatz: alt 3 (automatische Zuordnung) ist heute **5**, alt 2 (Datenbasis) ist
> heute **6** — die beiden sind zusätzlich getauscht.
>
> **Pflege:** Am Ende jedes Sprints wird der Stand der berührten Pakete mitgezogen —
> zusammen mit CLAUDE.md und den Bibeln. Die Fähigkeit `sprint-abschluss` führt das
> als eigenen Schritt. Ohne diese Routine veraltet die Datei innerhalb von zwei Sprints.

**Zeichen:** ✅ erledigt · 🟡 teilweise · ⬜ offen · ⊘ hinfällig · 🔎 vor dem Schnitt prüfen

---

## 0. Stand in Zahlen

*Alle Zahlen am 27.08.2026 zeilengenau nachgezählt — nach Sprint **v2-30**.*

| | Anzahl | nach v2-29 | nach v2-28 | nach v2-27 | nach v2-26 | nach v2-25 | nach DD 17.08. | nach v2-24 |
|---|---|---|---|---|---|---|---|---|
| Offene Pakete | **12** | 12 | 12 | 12 | 12 | 12 | 12 | 11 |
| Themen darin | **39** | 38 | 37 | 35 | 37 | 36 | 39 | 34 |
| Hausaufgaben ohne eigenen Sprint | **4** | 4 | 4 | 4 | 4 | 4 | 4 | 4 |
| **Offen gesamt** | **43** | 42 | 41 | 39 | 41 | 40 | 43 | 38 |
| Erledigt | **66** | 65 | 64 | 61 | 59 | 56 | 53 | 53 |
| Hinfällig geworden | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 |

> **Stand nach Sprint v2-30, zeilengenau ausgezählt.** Paket-Tabellen **65** Zeilen, davon
> **26 ✅** → **39** offen (⬜ 35, davon 3 mit 🔎 · 🟡 4). Hausaufgaben **4**, alle ⬜.
> §4 Erledigt **66** Zeilen. §3 unverändert **4**. Pakete **18**, davon **6** vollständig
> erledigt (1, 2, 3, 4, 15, 16) → **12** offen.
>
> **v2-30 hat einen Punkt erledigt und einen eingetragen** — `PF-6` erledigt, `PF-7` neu.
> **Offen gesamt steigt deshalb von 42 auf 43, und auch das ist das richtige Ergebnis:**
> `PF-7` war vorher da und unsichtbar. Der alte Ausdrucks-Index hat seinen Hauptnutzer
> verloren, wird aber **nicht** gelöscht, solange nicht ermittelt ist, wer seine 88.107
> Scans verursacht. Ein Sprint, eine Verschiebung.
>
> **v2-29 hat einen Punkt erledigt und zwei eingetragen** — `ZO-5` erledigt, `ZO-7` und `ZO-8`
> neu. **Offen gesamt steigt deshalb von 41 auf 42, und das ist auch hier das richtige
> Ergebnis:** Beide neuen Punkte waren vorher schon da, nur unsichtbar. `ZO-8` (der
> alphabetische Münzwurf bei mehrdeutigem Text) ist so alt wie `history_match` selbst —
> er wurde erst sichtbar, weil dieser Sprint die alte Regel zum ersten Mal **mit Richtig
> UND Falsch** gemessen hat und sie dabei auf nur 70,3 % kam. `ZO-7` (der Händler wird nicht
> angezeigt, obwohl die App ihn kennt) ist **beim Ansehen des eigenen Ergebnisses**
> aufgefallen, nicht in der Prüfstrecke.
>
> **Und `ZO-5` hat seine eigene Begründung widerlegt.** Sie nannte 147 Zahlungen, die
> unsichtbar seien, *„weil der Name jedes Mal ein anderer ist"*. Die Null stimmte, die
> Erklärung nicht: Zwei Drittel dieser Zahlungen tragen einen Händler, der **nie** einer
> Karte zugeordnet wurde. Wer den Erfolg an „147" gemessen hätte, wäre an einem Ziel
> gescheitert, das es nie gab.
>
> **v2-28 hat drei Punkte erledigt und zwei offene eingetragen** — `DA-3`, `ZO-4` und
> `NAV-1` erledigt, `ZO-5` und `ZO-6` neu und offen. **Offen gesamt steigt deshalb von 39
> auf 41, und das ist hier das richtige Ergebnis:** Beide neuen Punkte waren vorher schon
> da, nur unsichtbar. `ZO-5` beschreibt 147 Zahlungen, die seit dem 2025-Import nie einen
> Vorschlag bekommen haben; `ZO-6` eine Lücke, die dieser Sprint selbst aufgerissen hat.
>
> **`NAV-1` stand in keinem Paket** — dasselbe Muster wie Performance vor v2-24. Eine
> Schranke, die seit Sprint 3 auf „1900-01" stand und deren Deaktiviert-Pfad **nie
> ausgelöst hat**, kam in dieser Datei nirgends vor. Sie ist deshalb direkt unter §4
> eingetragen und hat kein eigenes Paket bekommen: Der Punkt ist erledigt, es konkurriert
> nichts mehr.
>
> **Der Sprint hat drei Zahlen seines eigenen Auftrags korrigiert.** Das Briefing nannte
> **55 Zahlungen / 1.262,92 €** für die Händler-Regel und einen höchsten Tank-Monat von
> **199,21 €**; gemessen sind es **65 / 1.520,22 €** und **239,21 €**. Nichts davon war
> falsch gerechnet — es ist der Stand **vor** der Nahverkehr-Entscheidung, und die
> Differenz ist genau eine RMV-Fahrt über 40,00 € vom 02.07.2025. **Die Zahl wurde nach
> der Entscheidung nicht nachgezogen.** Dieselbe Klasse wie LL-28 und LL-30, nur innerhalb
> eines einzigen Papiers. Die Schlussfolgerung hält — aber der Juli 2025 hat statt 40 Euro
> nur noch **79 Cent** Luft im Budget.
>
> **Davor: v2-27 hat zwei Punkte erledigt und keinen neuen erzeugt** — `DA-1` und `ZO-3`. Das ist
> nach v2-25 erst das zweite Mal in dieser Datei; die Regel der letzten Runden war, dass
> ein Sprint sichtbar macht, was schon da war (Paket 17, Paket 18, `KJ-6` bis `KJ-9`).
>
> **Die Paket-Zahl bleibt bei 12, obwohl in beiden berührten Paketen etwas fiel.** Paket 6
> behält `DA-2` (Kuratierung 2026), Paket 5 behält `ZO-1` und den Teil `F2`. Ein Paket
> gilt erst als erledigt, wenn nichts mehr darin steht.
>
> **Der Sprint hat drei Angaben seines eigenen Auftrags korrigiert, und alle drei waren
> plausibel falsch.** Vier Karten, die „2025 nicht existierten", hatten 12 von 12 Monaten
> Zahlungen (−4.164,15 €). iCloud lag 2025 bei 9,99 € statt 11,58 € — die höhere Zahl war
> ein Mischwert aus 17 Apple-Buchungen, von denen nur zwölf iCloud sind. Und die
> Sparraten-Wirkung von `ZO-3` beträgt **+1,84 €**, nicht die −2.699,90 € der
> Zahlungssumme. **Alle drei entstehen durch Aggregation über eine zu grobe Menge** —
> dieselbe Klasse in drei Gestalten.

> **Stand nach Sprint v2-26, zeilengenau ausgezählt.** Paket-Tabellen **57** Zeilen, davon
> **20 ✅** → **37** offen (⬜ 30 · ⬜🔎 3 · 🟡 4). Hausaufgaben **4**, alle ⬜.
> §4 Erledigt **59** Zeilen. §3 unverändert **4**. Pakete **18**, davon **6** vollständig
> erledigt (1, 2, 3, 4, 15, 16) → **12** offen.
>
> **v2-26 hat vier Punkte NEU angelegt und drei davon sofort erledigt** — `KJ-6` bis
> `KJ-9`. Sie standen vorher in keiner Liste, weil sie erst durch die Benutzung von v2-25
> entstanden oder sichtbar wurden. Dasselbe Muster wie bei Paket 17 (Performance) und
> Paket 18 selbst: **Arbeit, die schon da war, wird sichtbar — nicht neu.**
>
> **`KJ-9` ist der ehrlichste Eintrag dieser Runde.** Der Beenden-Toast wurde korrigiert,
> der Lösch-Toast nicht — er war nicht Teil der Meldung. Statt ihn stillschweigend
> mitzunehmen oder zu vergessen, steht er hier.
>
> **v2-25 hat drei Punkte erledigt und keinen neuen erzeugt** — `KJ-1`, `KJ-2`, `KJ-3`.
> Das ist in dieser Datei die Ausnahme: v2-24 trug zwei neue ein, die Design-Runde fünf.
> Der Grund ist, dass die Diagnose der Arbeit **vorausging**: Die zehn Meldungen waren am
> Vormittag auf drei Ursachen verdichtet und die Gestaltung entschieden, bevor gebaut
> wurde.
>
> **`KJ-4` steht jetzt auf 🔎 statt ⬜, und das ist eine Aussage, keine Verlegenheit.**
> Der Fehler ließ sich in zwei Browser-Engines nicht reproduzieren — die Hypothese des
> Befunds (Hydrations-Unterschied) ist dabei **widerlegt** worden. Was fehlt, ist nicht
> Arbeit, sondern die Antwort des Nutzers auf eine einzige Frage: *Siehst du es noch?*
>
> **Die Paket-Zahl bleibt bei 12**: Paket 18 ist trotz dreier erledigter Punkte nicht
> vollständig, weil `KJ-4` offen ist und `KJ-5` (Datenpflege) Arbeit in der App bleibt.
>
> **Die Zahl springt um fünf, und das ist kein Rückschritt.** Das neue **Paket 18** trägt
> die zehn Meldungen aus der Jahres-Kuratierung 2026 — verdichtet auf **fünf** Punkte,
> weil zehn Meldungen nur **drei** Ursachen hatten. Fünf davon betrafen denselben
> Löschriegel, drei denselben Plan-ohne-Zahlung-Mechanismus. **Diese Arbeit war die ganze
> Zeit da; sie stand nur nicht auf der Liste** — dasselbe Muster wie bei Paket 17
> (Performance).
>
> **Die Spalte „nach v2-24" ist neu eingezogen**, die älteste („vor v2-16") herausgefallen
> — die Tabelle behält acht Vergleichsstände.
>
> **Die Zahl steigt trotzdem, und das ist hier das richtige Ergebnis.** v2-24 hat
> **drei** Punkte erledigt (`PF-1`, `PF-2`, `PF-4`) und **zwei** offene eingetragen
> (`PF-3` RLS-Feinschliff · `PF-5` Ausweichpfad ungeprüft). Netto +2, plus ein neues
> Paket. `PF-4` wurde **am Tag seiner Entstehung geschlossen** — es war der Fund, den
> dieser Sprint erst möglich gemacht hat.
>
> **Das neue Paket 17 ist der eigentliche Punkt.** Performance kam in dieser Datei
> **nirgends** vor — null Treffer für „Performance", „Ladezeit", „langsam", „Latenz",
> „Reaktion" —, während ein Dashboard-Aufbau 233 Netzrunden machte und die App in
> Produktion in Zeitüberschreitungen lief. Ein Thema, das nicht in der Liste steht,
> konkurriert unsichtbar mit allem anderen und verliert gegen das, was gerade lauter
> ist. Die zwei neuen offenen Punkte sind **keine Verschlechterung**, sondern das
> Sichtbarwerden von Arbeit, die schon vorher da war.
>
> **`ZU-1` erhöht nur die Erledigt-Zahl, nicht die offenen.** Der Punkt stand nie in
> der Roadmap: Er wurde am 16.08.2026 vom Nutzer gemeldet und am selben Tag behoben.
> Ein Fehler, der entsteht und vergeht, ohne je offen zu sein, ist der beste Fall —
> gefunden hat ihn allerdings nicht die Prüfstrecke, sondern das Benutzen.
>
> **Zum ersten Mal seit v2-20 sinkt die Zahl wieder** — 38 → 36. v2-22 hat zwei
> Hausaufgaben abgeräumt (`B2-R`, `ZO-2`) und keine neue erzeugt. Das ist kein Zufall:
> Es war ein Aufräum-Sprint ohne neue Oberfläche, und beide Punkte waren durch v2-21
> bereits vollständig diagnostiziert.
>
> **`B2-R` ist damit erledigt** — die B2-Invariante gilt wieder in allen zwölf Monaten
> exakt. Sie stand seit v2-19 offen und musste in jedem Anker-Protokoll miterklärt
> werden.
>
> **Die Zahlen steigen, obwohl der größte Einzelposten der Roadmap gebaut wurde —
> und `Erledigt` bleibt bei 47.** Das ist kein Rückschritt, sondern dieselbe
> Ehrlichkeit wie nach v2-18: `M6` ist von ⬜ auf 🟡 gewandert, nicht auf ✅, weil das
> Vorschlags-Badge in der Rohmasse (F2) weiter hinter `SHOW_SUGGESTION_BADGES = false`
> liegt. Dazu kommen drei Punkte, die **erst durch das Bauen sichtbar wurden**:
> `ZO-1` (`frequency_match` ist eine Konstante und macht die Badge-Schwelle ohne
> Namenstreffer unerreichbar), `ZO-2` (die Vorschlags-Sichtbarkeit ist nicht prüfbar
> — genau dort saß der Fehler) und `ZO-3` (rückwirkendes Verlinken, bewusst dem User
> überlassen).
>
> **Was die Zahlen nicht zeigen:** Von 283 offenen Zahlungen in 2026 haben jetzt
> **115 einen Vorschlag statt 9**. Paket 5 war der einzige Punkt der Roadmap, der
> Aufwand *wegnimmt* — dieser Teil ist eingelöst.
>
> **Zum ersten Mal seit drei Sprints steigt die Zahl der offenen Themen NICHT.**
> Paket 16 ist am 15.08.2026 entstanden und noch am selben Tag vollständig
> abgeschlossen worden — wie Paket 15 zwei Tage zuvor. Beide kamen aus der Nutzung,
> nicht aus der Planung.
>
> **Paket 15 ist vollständig abgeschlossen** — `GE-1` und `GE-2` in v2-19 gebaut,
> einen Tag nachdem das Paket entstanden ist.
>
> **Paket 16 ebenfalls** — `KU-1` und `KU-2` in v2-20. Es entstand aus drei Befunden
> beim Kuratieren des August; einen davon (`B2`) hat der User selbst gelöst.
>
> **Die Hausaufgaben stehen bei 5:** `B2-R` kam nach v2-19 dazu — die Treiber-Summe
> liegt einen Cent neben `Ist − Plan`. **Nicht von v2-19 verursacht**; der Abstand
> entstand am 13.08.2026 mit den ersten Zuordnungen auf gemeinsame Karten. In v2-20
> erneut geprüft: Er ist in Juli **und** August vorhanden, hat dieselbe Ursache
> (vier gemeinsame Karten mit Sub-Cent-Deltas) und ist **nicht gewachsen**.
>
> **Die Zahlen sind zum zweiten Mal in Folge gestiegen** — 29 → 32 Themen, obwohl
> nichts zurückgenommen wurde. Ursache ist beide Male dieselbe: **Sichtbarwerden**,
> nicht Rückschritt. Nach v2-18 kam `KAT-5` dazu (in v2-17 entschieden, nie gebaut,
> nie benannt); jetzt kommen `GE-1`, `GE-2` und `GE-3` dazu, weil beim Zuordnen
> auffiel, dass das Gehalt kein Ablageziel hat. **Ein neues Paket 15 ist entstanden
> und wird vorgezogen** — vor Paket 5, weil es aus der Nutzung kommt.
>
> **Die Zahl der offenen Themen ist erstmals wieder GESTIEGEN** (28 → 29), obwohl ein
> Sprint gelaufen ist. Das ist kein Rückschritt, sondern Ehrlichkeit: `KAT-5` (Record
> `A2` — Zahlung auf eine Ordner-Kachel ziehen) war in v2-17 entschieden, **nicht
> gebaut und nicht als offen vermerkt**. Der Punkt existierte also die ganze Zeit, nur
> unsichtbar. Die beiden Nutzungs-Befunde `NB-1` und `NB-2` sind erledigt.
>
> **Stand nach v2-17 (08.08.2026):** Paket-Tabellen 35 Zeilen, davon 7 ✅
> (`BF-4`, `LQ-1`, `LQ-2`, `RM-2`, `KAT-1`, `KAT-2`, `KAT-3`) → 28 offen
> (⬜ 25 · 🟡 3). §4 Erledigt 41.
>
> **Paket 4 fällt weg** — es bestand aus `KAT-1`, `KAT-2` und `KAT-3`, alle drei
> sind mit v2-17 gebaut. `KAT-4` gehörte nie dazu, es liegt in Paket 10 (mit
> `M7`). Offene Pakete: 11 → **10**.
>
> **Damit sind vier der fünf Kettenglieder fertig** — Paket 1 (Fehler), Paket 2
> (Rohmasse), Paket 4 (Kategorien) und, daneben stehend, Paket 3 (Liquidität).
> Das nächste ist **Paket 5**: die bessere automatische Zuordnung, der einzige
> Punkt der Roadmap, der Aufwand **wegnimmt** — und laut dem Nebenbefund der
> Kategorien-Runde dringender als angenommen (von 76 gemeinsamen
> Monatszahlungen sind heute **zwei** zugeordnet).

> **Stand nach v2-16 (07.08.2026), zeilengenau nachgezählt.** Paket-Tabellen **35**
> Zeilen, davon **4 ✅** (`BF-4`, `LQ-1`, `LQ-2`, `RM-2`) → **31** offen (⬜ 28 · 🟡 3).
> Hausaufgaben **5** (⬜ 4 · 🟡 1 — `PA-1` ist raus). §4 Erledigt **37** Zeilen.
> §3 unverändert **4**.
>
> **Paket 2 fällt weg** — es bestand nach `RM-1` (v2-10) nur noch aus `RM-2`, und der
> ist mit v2-16 gebaut. `RM-3` gehörte nie dazu, es liegt in Paket 9 (Folgepunkt zu
> `F5`). Offene Pakete: 12 → **11**.

> **Der Selbstwiderspruch in diesem Abschnitt ist aufgelöst (06.08.2026, v2-15).**
> Bis hierher nannte die Tabelle *Hausaufgaben 6 · Erledigt 33*, der Kasten darunter
> zwei Zeilen später *7 · 32* — CLAUDE.md §9 hat den Konflikt seit dem 06.08.
> ausdrücklich vermerkt und die Tabelle gespiegelt, weil sie aufging.
>
> **Nachgezählt, Zeile für Zeile:** Die **Tabelle hatte recht**, der Kasten hatte sich
> zweimal verzählt. §2 trägt **6** Hausaufgaben (⬜ 5 · 🟡 1 — nicht ⬜ 6 · 🟡 1), §4
> trug **33** erledigte Zeilen (`BF-4` stand darin bereits und wurde ein zweites Mal
> addiert). §3 unverändert **4**.
>
> **Eine dritte Zahl stimmte allerdings nirgends:** In den Paket-Tabellen standen
> **34** offene Themen, nicht 33. Die Spalten „vor v2-1x" sind entsprechend um eins
> angehoben. An der Reihenfolge und an allen inhaltlichen Aussagen ändert das nichts.
>
> **Heutiger Stand nach v2-15:** Paket-Tabellen 35 Zeilen, davon 3 ✅ (`BF-4`, `LQ-1`,
> `LQ-2`) → **32** offen (⬜ 29 · 🟡 3). Hausaufgaben **6**. §4 Erledigt **35**.

> **Paket 3 fällt weg (06.08.2026, v2-15)** — es bestand aus `LQ-1` und `LQ-2`, beide
> sind erledigt. `LQ-3` gehörte nie dazu, es liegt in Paket 9. Offene Pakete: 13 → **12**.

> **Paket 1 fiel weg (05.08.2026, v2-13)** — es bestand nur noch aus `BF-4`. Damit sank
> die Zahl der offenen Pakete erstmals seit dem Umbau vom 04.08.2026, von 14 auf 13.

> **Sprint v2-13 hat `BF-4` geschlossen — und damit PAKET 1 VOLLSTÄNDIG.** Alle fünf
> Befunde vom 04.08.2026 sind erledigt. Der Split-Anteil wird jetzt genau **einmal**
> angewandt (in `calculate_card_amount_for_month`, auf Plan/Anpassung — nicht auf
> Fragment-Summen). Migration am 05.08.2026 nach ausdrücklicher Freigabe auf Produktion
> angewendet: **alle zwölf Monate um 0,00 € bewegt**, Ist wie Plan, B2-Invariante 12/12
> gehalten. Das war die Erwartung — heute hat keine gemeinsame Karte ein Fragment, der
> Fehler war einen Kuratierungs-Schritt entfernt. Der Beweis der Richtigkeit kommt aus
> der Übungs-DB: Ist-Sparrate dort 1.840,00 → **1.600,00 €** (der doppelte Abzug von
> 240,00 € verschwindet), Anker unverändert 2.200,00 €. Die vier gemeinsamen Karten
> zeigen seither den eigenen Anteil und darunter `von [Haushaltsbetrag] €`.
>
> **Sprint v2-12 hat `BF-2` geschlossen** (Ring-Subzeile vorzeichensicher, dritte
> Zeile `genau nach Plan` nach Entscheidung `E3`). *(Damals bestand Paket 1 nur noch
> aus `BF-4` — der ist seit v2-13 ebenfalls erledigt.)*

> **Sprint v2-11 hat `BF-5` geschlossen.** Die Migration ist am 05.08.2026 nach
> ausdrücklicher Freigabe auf Produktion angewendet und verifiziert: Juli-Ist
> −1.222,75 → **−322,75 €** (exakt +900,00), alle übrigen elf Monate um 0,00 €
> bewegt, B2-Invariante in allen zwölf Monaten gehalten.

> **Sprint v2-10 hat vier Themen geschlossen:** `BF-3` und `BF-1` aus Paket 1, `RM-1`
> aus Paket 2 und die Hausaufgabe `RM-4`. Die Zahl der offenen Pakete bleibt bei 14 —
> beide berührten Pakete haben noch Reste (siehe unten). `PA-1` wurde angefasst, aber
> bewusst nicht gebaut: Die Rechnung steht und ist belegt, die Darstellung ist
> unentschieden.

> *Herkunft der Zahl (Stand 05.08.2026 **vor** v2-10, zur Nachvollziehbarkeit):* Die
> damaligen 48 setzten sich zusammen aus 28 offenen Themen der Alt-Roadmap **minus 3**
> (F1, F2, F3 sind unter M6 zu einer Zeile zusammengefasst) **plus 11 neue**:
> die fünf Befunde vom 04.08., zwei Datenbasis-Themen und zwei Übungs-DB-Hausaufgaben,
> die bisher nur im Projekt-Gedächtnis standen, sowie zwei Feinschliff-Punkte
> (B2-F, A1-F), die zuvor nur im Fließtext erwähnt waren — **plus 12** aus der
> Ideen-Runde vom 04./05.08.2026 (RM-1…RM-4, KAT-1…KAT-4, LQ-1…LQ-3, PA-1).
> Davon sind mit v2-10 vier geschlossen worden → **44**.

**Die Pakete 1, 2, 4, 5 und 6 sind eine Kette, keine Liste.** Jedes baut das Werkzeug
für das nächste:

| | | |
|---|---|---|
| Paket 1 | Fehler beheben | → verlässliche Zahlen |
| Paket 2 | Rohmasse lesbar | → du erkennst, **was** du zuordnest |
| Paket 4 | Kategorien | → du findest, **wohin** |
| **Paket 5** | **Automatische Zuordnung** | → **das Meiste ordnet sich von allein zu** |
| Paket 6 | Kuratierung | → der Rest, von Hand, einmal |

> **Paket 5 wurde am 05.08.2026 vorgezogen** (vorher hinter der Datenbasis). Es ist der
> einzige Punkt der Roadmap, der Aufwand **wegnimmt** — alle anderen vergrößern die
> Oberfläche. Begründung und Messung stehen am Paket.

**Paket 3 stand bewusst daneben, nicht darin.** Die Liquiditäts-Vorschau hing an
keinem anderen Paket und lieferte als Einziges Wert, **bevor** kuratiert ist. Sie stand
an dieser Stelle, weil Paket 4 damals noch nicht schneidbar war — sie füllte die
Wartezeit, statt sie zu verlängern. *(Beide sind seit v2-15 bzw. v2-17 erledigt; der
Absatz bleibt als Begründung der damaligen Reihenfolge stehen.)*

**Was als Nächstes dran ist — Stand 05.08.2026 nach Sprint v2-13.**
Von den fünf Befunden sind **alle fünf erledigt**: `BF-3` und `BF-1` (v2-10),
`BF-5` (v2-11), `BF-2` (v2-12) und `BF-4` (v2-13).

**Paket 1 ist damit vollständig abgeschlossen.** Die Zahlen sind belastbar — das war
die Voraussetzung für alles, was auf ihnen aufbaut (Treiber, Auswertungen,
Liquiditäts-Vorschau).

**Beide sind gebaut — Stand 07.08.2026 nach Sprint v2-16.** `RM-2` und `PA-1` sind
erledigt; damit ist auch **Paket 2 vollständig abgeschlossen**. Was in der Rohmasse
steht, ist jetzt lesbar: die Karte zeigt den Verwendungszweck (`RM-1`), das Popup den
Empfänger und alles Übrige (`RM-2`).

> **Was das für die Kette bedeutet — Stand 08.08.2026 nach v2-17:** Von den fünf
> Kettengliedern sind **Paket 1, Paket 2 und Paket 4 fertig**. Der Riegel vor
> Paket 5 ist gefallen.
>
> **Das nächste ist Paket 5** (bessere automatische Zuordnung) — und die
> Kategorien-Runde hat nebenbei belegt, wie dringend es ist: Von **76 gemeinsamen
> Monatszahlungen sind zwei zugeordnet**, bei 19 Monaten identischem Text,
> identischem Betrag und identischem Tag. Ursache ist die Split-Systematik — die
> Karte „Miete" plant 1.904 € (Haushalt), überwiesen werden 1.089,26 € (der
> Anteil), und `calculate_match_confidence` gewichtet `amount_match` mit 0,30;
> 43 % Abweichung reichen nie für die 95-%-Schwelle. Kategorien **erben** die
> automatische Zuordnung korrekt — es gibt heute nur fast nichts zu erben.
>
> > **⚠️ Diese Ursachen-Diagnose stimmt nur zur Hälfte — korrigiert am 15.08.2026
> > in v2-21.** Der Split-Effekt auf `amount_match` ist real, aber er ist **nicht
> > der Engpass**. Gemessen: Die **72** Zahlungen, die im toten Band 0,50–0,60
> > direkt unter der Badge-Schwelle klemmen, haben einen Betrags-Score von **1,00**
> > — perfekt getroffen. Sie scheitern am **Namen** (Mittelwert 0,05).
> >
> > Die eigentlichen Ursachen waren drei andere: `frequency_match` liefert immer
> > `1.00` und macht die Schwelle 0,60 ohne Namenstreffer rechnerisch unerreichbar
> > (Betrag + Frequenz ≤ 0,50); die Namensfunktion verglich ganze Zeichenketten
> > statt Wörter; und die Konfidenz wurde **nur beim Import** berechnet, sodass
> > 1.567 von 1.590 Zahlungen gar keinen Wert trugen.
> >
> > Die Zahl „zwei von 76" war also richtig beobachtet und falsch erklärt. Der
> > Fehler wäre teuer geworden: Eine Sitzung, die ihm gefolgt wäre, hätte an
> > `amount_match` und der Split-Behandlung gearbeitet — und die 72 Zahlungen mit
> > perfektem Betrag nicht bewegt.

*Die frühere Fassung dieses Abschnitts, zur Nachvollziehbarkeit:*

1. **`RM-2`** (Schaufenster-Popup für ein Fragment) — durch die Gestaltungsrunde vom
   06.08.2026 vollständig entschieden und schneidbar. **Achtung:** ändert §8
   inhaltlich — zugeordnete Fragmente und Überträge werden **klickbar**,
   `pointer-events: none` entfällt. Aufgehoben ist ausschließlich die **Klick**-Sperre;
   die Drag-Sperre bleibt und braucht ab jetzt einen eigenen Träger, weil sie bisher
   nebenbei aus `pointer-events` folgte. Merksatz: **klickbar ≠ ziehbar ≠ verlinkbar.**
   → **✅ gebaut in v2-16.** Die Drag-Sperre hat ihren Träger bekommen; hinzu kam eine
   dritte, im Briefing nicht vorhergesehene Wirkung derselben CSS-Zeile — sie
   unterdrückte auch die **Hover-Rückmeldung** (Review §5.1).
2. **`PA-1`** (Konsequenz-Anzeige beim Einkommens-Eintrag) — die Rechnung war schon
   belegt, seit dem 06.08. sind auch alle fünf Darstellungsfragen entschieden.
   → **✅ gebaut in v2-16.** Nebenbei erledigt: das Einkommens-Popup hat endlich einen
   **Escape-Handler** (`sprint_v2-10_offene_fragen.md` §6, offen seit Sprint 1).
   Offen geblieben war der Wortlaut für den **umgekehrten** Fall (Anteil sinkt) — am
   07.08. in der Rolle `design-direktor` entschieden (Review §6.2).

> **Die `design-direktor`-Runde hat am 06.08.2026 stattgefunden.** Sie hat `LQ-2`,
> `LQ-1` (Anzeigeseite), `RM-2` und `PA-1` entschieden — die ersten beiden sind mit
> v2-15 gebaut. **Paket 4 hat sie ausdrücklich NICHT entsperrt**; dafür braucht es eine
> eigene Runde, ebenso für `M2` und `M5`. Record:
> `V2/design_direktor_2026-08-06_liquiditaet_fragment_split.md`.

> **✅ Seit 05.08.2026 blockiert KEINE Entscheidung mehr Arbeit.** E1, E2 und E3 sind
> alle gefallen. `BF-4` ist damit baubar; was er noch braucht, steht am Punkt selbst.

> **✅ E1 ist am 05.08.2026 entschieden** — „die Zahlung ist mein Anteil": Eine
> gemeinsame Karte plant im Haushaltsbetrag, **zeigt den eigenen Anteil**, und eine
> zugeordnete echte Zahlung wird **unverändert übernommen, ohne zweiten Abzug**.
> Belegt durch die Messung vom 05.08.: Bei allen vier gemeinsamen Karten entspricht
> der überwiesene Betrag dem rechnerischen Anteil **auf den Cent**, in Mai, Juni und
> Juli. **Damit kehrt sich Design-Doku §4.5 um** — das ist eine geänderte
> Produkt-Entscheidung, kein Fehler-Fix, und wird als solche kenntlich gemacht.

> **✅ E3 ist am 05.08.2026 entschieden** — eigene Formulierung für den Gleichstand,
> nach Empfehlung. Umgesetzt in v2-12 als dritte Zeile `genau nach Plan` (neutral),
> zusammen mit der vorzeichensicheren Zusammenlegung der beiden Textzweige (`BF-2`).

> **✅ E2 ist am 05.08.2026 entschieden** — „ehrlich rechnen": Der Netto-Betrag einer
> Karte zählt so, wie er ist, **auch unter null**; es wird nicht bei 0 gekappt. Damit
> ist `BF-5` freigegeben. Der Fall hat heute **keine Geldwirkung** — im gesamten
> Bestand hat keine Karte mehr Gutschriften als Ausgaben; entschieden wurde die Regel
> für den Fall, dass er eintritt. Ohne Design-Direktor entschieden, weil es eine
> Rechenfrage ist und nicht eine der Gestaltung.

---

## 1. Offene Pakete

Die Reihenfolge ist ein **Vorschlag**, kein Beschluss. Sie ändert sich erfahrungsgemäß
mit dem, was beim Benutzen auffällt.

### Paket 1 · Fehler aus der Nutzung — ✅ **VOLLSTÄNDIG ERLEDIGT (05.08.2026)**
**Entsperrt:** verlässliche Zahlen. Solange die Sparrate falsch rechnet, ist jede
Auswertung darauf wertlos — auch die Abweichungs-Treiber.
**Quelle:** `V2/befunde_2026-08-04_fehler_und_entscheidungen.md` (Diagnose vollständig,
Prüfanker je Fehler benannt)

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| BF-4 | Gemeinsame Karten zeigen den Gesamtbetrag | Bug | **ja** | ✅ | **Erledigt in Sprint v2-13 (05.08.2026).** Der Anteil wird jetzt genau **einmal** angewandt — in `calculate_card_amount_for_month`, und zwar auf **Plan/Anpassung**, **nicht** auf Fragment-Summen (die sind bereits der überwiesene Anteil). `calculate_sparrate_for_month` multipliziert nicht mehr selbst; `get_year_deviation_drivers` rechnet `delta = sign × (ist − plan × share)` — der Anteil steht jetzt **innen** am Plan-Teil, weil die Klammer gemischt ist. `calculate_planned_sparrate_for_month` blieb unverändert (Prüfsumme identisch belegt). **Alle vier Funktionen in EINER Migration**, weil ein Zwischenzustand doppelt anteilig gerechnet hätte. Probe auf der Übungs-DB **zweimal** gefahren: Ist-Sparrate 1.840,00 → **1.600,00 €**, B2 12/12 vorher wie nachher, Anker 2.200,00 € unverändert. Auf Produktion **alle zwölf Monate um 0,00 € bewegt** — erwartet, weil noch keine gemeinsame Karte ein Fragment hat. Die vier Karten zeigen jetzt 1.089,26 / 36,04 / 22,87 / 15,45 € — auf den Cent die realen Daueraufträge aus der E1-Messung. Design-Doku **§4.5 umgekehrt** und als geänderte Produkt-Entscheidung kenntlich gemacht (3.2.0), Schema-Doku 3.4.3, neue Kartenzeile `von [N] €` (§7/§12.3). Belege: `sprints/sprint_v2-13_review.md`. |

> BF-5 und BF-4 fassen beide die Rechenfunktionen an → gemeinsame Übungs-DB-Probe,
> wenn sie im selben Sprint laufen. Fähigkeit `db-eingriff`.

---

### Paket 2 · Rohmasse lesbar machen — ✅ **VOLLSTÄNDIG ERLEDIGT (07.08.2026)**
**Entsperrt:** Kuratieren von Hand ohne Reibung. Die Beschreibung auf einem
Rohmasse-Fragment wird heute vom Empfänger gefüllt, der Verwendungszweck fällt dem
„…" zum Opfer — genau die Information, die man beim Zuordnen braucht. Damit ist
dieses Paket das **Werkzeug für Paket 6** (Kuratierung 2026).
**Kein Datenbank-Eingriff, reine Anzeige.** Quelle: Ideen-Runde 04.08.2026.

> **Stand nach v2-10:** `RM-1` ist erledigt — das Paket ist damit **leer bis auf
> `RM-2`**.
>
> **Stand nach der Gestaltungsrunde vom 06.08.2026:** `RM-2` ist **vollständig
> schneidbar**. Die Rangfolge im Schaufenster-Popup ist entschieden (Empfänger führt,
> Betrag rechts daneben, Datum in die Kopfzeile, Verwendungszweck ungekürzt darunter;
> bei DKB Visa entfällt die Zweck-Zeile). Record:
> `V2/design_direktor_2026-08-06_liquiditaet_fragment_split.md` §3.
>
> **✅ Gebaut mit v2-16 (07.08.2026).** Damit ist dieses Paket **leer** — `RM-1` und
> `RM-2` sind beide erledigt, `RM-3` gehört zu Paket 9 (es hängt an `F5`). Offene
> Pakete: 12 → **11**.
>
> Die angekündigte **inhaltliche Änderung an §8 ist vollzogen**: Zugeordnete Fragmente
> und Überträge sind klickbar, `pointer-events: none` ist entfallen. Aufgehoben wurde
> ausschließlich die **Klick**-Sperre. Die **Drag-Sperre hat ihren eigenen Träger
> bekommen** (`draggable={false}` plus der Check in `handleDragStart`), die
> Daten-Invariante (Trigger `trg_oqb_no_transfer_links`) ist unberührt. Merksatz:
> **klickbar ≠ ziehbar ≠ verlinkbar.**
>
> **Dritte Wirkung derselben Zeile, im Briefing nicht vorhergesehen:**
> `pointer-events: none` unterdrückte auch die **Hover-Rückmeldung**. Ohne eigene
> Regel spränge die Deckkraft beim Überfahren von 0.22 bzw. 0.45 auf 0.92 — genau die
> Werte, die §8 als unberührt festschreibt. Nachzulesen in
> `sprints/sprint_v2-16_review.md` §5.1.

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| RM-2 | Schaufenster-Popup für ein Fragment | Feature | nein | ✅ | **Gebaut in v2-16 (07.08.2026).** Reines Anzeigen, keine Knöpfe — die Gegenleistung dafür, dass `RM-1` Information von der Karte nimmt. Empfänger als Hauptzeile, Betrag rechts daneben, Datum in der Kopfzeile, Verwendungszweck ungekürzt darunter; ohne Trennzeichen (DKB Visa) entfällt die Zweck-Zeile. Unter dem Strich: Status bzw. zugeordnete Karte → Gegenkonto (nur Übertrag, IBAN **verkürzt**) → KI-Vorschlag (nur unzugeordnet, **mit** Prozentwert). **Alle Fragmente sind klickbar**, auch zugeordnete und Überträge — `pointer-events: none` ist entfallen, die Drag-Sperre hat einen eigenen Träger bekommen. Escape-Handler von Anfang an. Vier im Record offen gebliebene Fragen wurden am 07.08. in der Rolle `design-direktor` entschieden (`sprints/sprint_v2-16_review.md` §6.2). |

> Bewusst **nicht** enthalten: Handlungen im Popup (Zuordnen, Lösen, Umschichten
> markieren). Das ist `M2` in Paket 7 und wird als Ganzes entschieden, nicht in
> Scheiben. Die beiden grenzen aneinander — der Umschichten-Knopf sitzt heute auf
> jeder Rohmasse-Karte und wäre im Popup besser aufgehoben.

---

### Paket 3 · Liquiditäts-Vorschau — ✅ **VOLLSTÄNDIG ERLEDIGT (06.08.2026)**
**Entsperrt hat es:** die Frage „reicht mein Girokonto bis Monatsende?". Sie steht seit
v2-15 in der Kopfzeile der Zone „Planung".
**Stand bewusst neben der Kette**, nicht darin: Dieses Paket brauchte weder Kuratierung
noch Kategorien noch die Rohmasse — es war das Einzige, das Wert lieferte, **bevor**
kuratiert ist, und das Einzige, das gebaut werden konnte, solange Paket 4 auf seine
Gestaltungs-Runde wartet.
**Quelle und Belege:** `V2/befunde_2026-08-05_liquiditaet.md` ·
`V2/design_direktor_2026-08-06_liquiditaet_fragment_split.md` §1–§2 ·
`sprints/sprint_v2-15_review.md`

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| LQ-1 | Fälligkeitstag je Karte | Feature | **ja** | ✅ | **Datengrundlage v2-14, Oberfläche v2-15.** Spalte `cards.due_day smallint NULL` (CHECK 1..31) mit **17 aus der Buchungshistorie abgeleiteten** Werten; Migration auf Produktion angewendet, alle zwölf Monate um 0,00 € bewegt, B2 12/12. Seit v2-15 steht der Tag **rechts in der Statuszeile** (`Offen ····· am 1.`) — keine neue Zeile, keine zusätzliche Kartenhöhe — und lässt sich über den eigenen Menüpunkt **„Fällig am …"** ändern (nicht in „Betrag anpassen": dort hat alles Monats-Semantik, `due_day` gilt immer). BUDGET bleibt `NULL` und zeigt rechts nichts (Befund L7), Friseur ebenso (0 Belege). |
| LQ-2 | Ausstehend-Anzeige, fest und Budget getrennt | Feature | nein | ✅ | **v2-15.** `[N] € noch fällig · [N] € Budget frei`, rechtsbündig in derselben Zeile wie die Zonen-Überschrift (Muster des Übertrags-Schalters, v2-07 C1). **Nie eine Summe** (L7). Nutzt dieselben Beträge wie die Sparrate — keine zweite Rechenart, weil die Daueraufträge exakt auf dem Anteil stehen (L4). Rechnung server-seitig auf den bereits geladenen Karten, damit die 1000-Zeilen-Grenze strukturell unerreichbar ist (LL-21). **Drei Entscheidungen im Sprint:** ein Posten fällt raus, wenn sein Termin verstrichen ist **oder** eine Zahlung an ihm hängt · außerhalb des laufenden Monats bleibt die Zeile leer (LL-20) · keine Posten-Anzahl. Belege: `sprints/sprint_v2-15_briefing.md`. |

> **Zwei bekannte Lücken, bewusst offen — die Zahl ist dadurch systematisch leicht zu
> optimistisch.** Erstens die **Kreditkarten-Abrechnung**: Sie belastet das Girokonto um
> den 24. (Juli −172,60 €), ist als Übertrag markiert und wird von keiner Karte
> abgebildet; seriös vorhersagbar erst mit unterscheidbaren Konten → `LQ-3` in Paket 9.
> Zweitens **Karten ohne Termin** — heute allein der Friseur (45,00 €). Sie zählen nicht
> mit, weil §8 „mit Termin" verlangt; behebbar in zehn Sekunden über das neue Overlay,
> sobald es stört.
> **Nicht enthalten:** der Kontostand selbst. Er steht ungenutzt in Zeile 3 jedes
> DKB-Abzugs (L1), wäre aber nur so frisch wie der letzte Import. Wird interessant,
> sobald häufiger importiert wird — dann ein kleiner Nachtrag, kein eigenes Thema.

---

### Paket 4 · Kategorien im Karussell — ✅ **VOLLSTÄNDIG ERLEDIGT (08.08.2026)**
**Entsperrt hat es:** eine Fläche, auf der man kuratieren kann. Gemessen am 04.08.2026
standen **19–32 Karten** in einem Monat im Karussell; im Juli sah man 18 % seines Monats
auf einmal und brauchte 27 Pfeilklicks von einem Ende zum anderen. Seit v2-17 sind es
**11 Ordner und 5 Klicks**.
**Quelle und Belege:** `V2/befunde_2026-08-04_kategorien.md` (30 Befunde) ·
`V2/design_direktor_2026-08-07_kategorien.md` (Teil A/B/C) ·
`sprints/sprint_v2-17_review.md`

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| KAT-1 | Kategorien als eigene Struktur | Feature | **ja** | ✅ | **v2-17.** Tabelle `card_categories` + Spalte `cards.category_id`, fünf RPCs, Menüpunkt „Kategorie ändern …". **Keine `cards`-Zeile** (D1). Der Papierkorb kann eine Kategorie nicht tragen (D7) — deshalb löscht `delete_card_category` **hart** und gibt den Wiederherstellungs-Bausatz zurück; die Rücknahme läuft über den bestehenden 5-Sekunden-Toast. Kein neuer Enum-Wert, keine längere Aufbewahrung. RLS-Policy von Hand (D8). Zuordnung nach Record §A3: **zehn** Ordner (nicht elf — „Einkommen" trägt das Netto und ist keine Karte), **alle 46 Karten** eingeräumt. Statt „Beenden" nur „Löschen", die Karten werden kategorielos (A7). |
| KAT-2 | Karussell gruppiert nach Kategorien | Feature | nein | ✅ | **v2-17.** Variante A: Stapel-Kachel im Kartenformat, neutraler Ton, kein Status-Icon, linke Kante rot/türkis. **Kein Tap-Catcher** (U3). Beim Ziehen öffnen sich alle Ordner — damit ist `U1` (BLOCKER) gelöst, ohne dass eine zugeklappte Kategorie je ein Drop-Ziel braucht. Aufklapp-Zustand überlebt den Monatswechsel, beim Laden ist alles zu (B7). Einkommens-Ordner mit Netto-Kachel (A4), „Ohne Kategorie" hinten und nur wenn belegt (B6). Zukunftsmonat blass ohne Flagge (C3). |
| KAT-3 | Kategorie-Zahl = Beitrag zur Sparrate | Feature | **ja** | ✅ | **v2-17.** `get_category_amounts_for_month` — alle Ordner in EINEM Aufruf, vorzeichenrichtig, server-seitig. **Der Cent war der eigentliche Inhalt:** Die Runde hatte „ungerundet summieren, am Ende runden" verordnet; nachgemessen ist das notwendig, aber **nicht hinreichend** — die Lücke von 0,01 € bestand in **allen zwölf Monaten**, und die Aufstellung im Record §A4 summierte sich selbst auf −322,74 € statt −322,75 €. Gelöst per **Restverteilung** auf den betragsgrößten Ordner, Ziel aus `calculate_sparrate_for_month` geholt statt hergeleitet (LL-22). Bewiesen auf der Übungs-DB mit einem erzwungenen Fall, auf Produktion in 12/12 Monaten. |

> **Was NICHT enthalten war:** der Ausgabenverlauf — das ist `KAT-4` in Paket 10 und
> wäre vor der Kuratierung wertlos (D4). Der **Ort** dafür ist entschieden (⋯-Menü,
> zusammen mit `M7`), der Inhalt nicht.
>
> **`M5` hat einen Ort bekommen, statt hinfällig zu werden:** Die Reihenfolge der Ordner
> steht als `card_categories.sort_order` in der Datenbank und lässt sich ohne Migration
> ändern. Innerhalb eines Ordners gilt weiterhin die Loader-Sortierung
> (Fixkosten → Einnahmen → Budget, dann Name).
>
> **Zwei Punkte aus der Runde blieben bewusst offen:** wie zwei gleichnamige Karten in
> einem Ordner auseinanderzuhalten sind („Fahrradzubehör" existiert im Juli zweimal —
> Beträge und Termine unterscheiden sie heute ausreichend), und ob eine Kategorie
> kenntlich macht, dass ihre Zahl abgeleitet ist.

---

### Paket 5 · Bessere automatische Zuordnung
**Entsperrt:** senkt den Aufwand für **alle** nachgelagerten Themen. Der heutige
Engpass ist Handarbeit beim Kuratieren.
**Am 05.08.2026 bewusst vor die Kuratierung gezogen** (vorher Paket 6, hinter der
Datenbasis). Grund: Es ist der **einzige Punkt der gesamten Roadmap, der Aufwand
wegnimmt statt hinzuzufügen.** Belegt durch die Nutzungs-Messung derselben Sitzung —
Zuordnungs-Abdeckung Jan–Apr 0,0 % · Mai 0,3 % · Jun 27,8 % · Jul 74,3 %, und das
Bezahlt-Häkchen wurde in der gesamten Historie kein einziges Mal benutzt. Läuft die
Zuordnung weitgehend von allein, schrumpft Paket 6 von einem Marathon auf eine
Kontrolle. Diese Begründung ist in einem halben Jahr sonst verloren.

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| M6 | Verbesserte automatische Fragment-zu-Karten-Zuordnung | Feature | ✅ ja | 🟡 | **Fasst F1, F2, F3 zusammen.** **In v2-21 gebaut: F1 und F3.** Die Namensfunktion vergleicht jetzt Wörter statt Zeichenketten (umlautfest, mit echten Wortgrenzen, mehrdeutige Kartenwörter entwertet), die eigenen Handzuordnungen fließen als Wiedererkennung ein, und `refresh_fragment_suggestions` rechnet Vorschläge für alte Zahlungen nach — was vorher **nie** geschah. Gemessen an 101 Handzuordnungen: richtige Vorschläge über der Badge-Schwelle **14 → 42**, falsche 1 → 4. Für den Nutzer: **9 → 115** sichtbare Vorschläge bei 283 offenen Zahlungen in 2026. **Offen bleibt F2** — das Vorschlags-Badge in der Rohmasse liegt weiter hinter `SHOW_SUGGESTION_BADGES = false` (Entscheid 04.08.2026); sichtbar ist der Vorschlag nur im Schaufenster-Popup. **Namenskollision beachten:** „F2 Kategorie-Vorhersage" meint das KI-Vorschlags-Badge auf Fragmenten, nicht die Karten-Kategorien aus Paket 4 (Befund U6). |
| ZO-1 | `frequency_match` aussagekräftig machen | Bugfix | **ja** | ⬜ | **Befund aus v2-21, bewusst dort nicht behoben.** Die Funktion prüft ausschließlich, ob die Karte im Monat des Fragments aktiv ist — worauf ihr einziger Aufrufer bereits filtert. Sie liefert deshalb ausnahmslos `1.00`, gemessen über alle fünf Score-Klassen. **20 % des Konfidenz-Gewichts unterscheiden nichts**, und ohne Namensähnlichkeit ist die Badge-Schwelle 0,60 rechnerisch unerreichbar (Betrag + Frequenz ≤ 0,50). Material liegt bereit: `cards.due_day` seit v2-14 — allerdings nur bei **18 von 51** Karten, fehlende Tage müssten neutral bleiben statt zu bestrafen. **Warum nicht in v2-21:** Jede Änderung dort verschiebt *alle* bestehenden Scores gleichzeitig mit P1 und P2; zwei Verschiebungen in einem Sprint lassen sich nicht mehr auseinanderhalten. |
| ZO-3 | Rückwirkende automatische Verknüpfung ab 0,95 | Feature | ja | ✅ | **In v2-27 erledigt (19.08.2026), für 2025.** Für **2026 ist der Punkt gegenstandslos geworden** — dort hat der Nutzer inzwischen alles von Hand zugeordnet (411 von 418, die übrigen sieben sind Gehaltseingänge und gehören an keine Karte). Für 2025 war er bis v2-27 gar nicht stellbar: Ohne aktive Karten gab es nichts vorzuschlagen. **Gemessen wurde gegen die 411 handverlinkten Zahlungen aus 2026**, weil es für 2025 selbst keine Wahrheit gibt: ab 0,60 **181 richtig / 49 falsch** (78,7 %), ab 0,95 **48 richtig / 0 falsch**. Der Leave-One-Out-Ausschluss aus §7 Regel 25 ist **eingebaut, nicht nachgerüstet** — `history_match` filtert selbst mit `f.id <> p_fragment_id` und zählt nur `MANUAL_DROP`. **Verlinkt wurden 41 Zahlungen** (Alte Leipziger 12, Nürnberger 12, Spotify 11, Audible 6), einzeln geprüft, 41/41 richtig. **Wirkung: +1,84 € auf das ganze Jahr** — die Zahlungen summieren sich zwar auf −2.699,90 €, aber bei Fixkosten wirkt nur die Differenz zum Plan. Wer beides verwechselt, hält einen harmlosen Eingriff für einen gefährlichen. `origin = AUTO_ABSORBED` (sonst lernte `history_match` aus eigenen Vermutungen), Link-Monat = Buchungsmonat. **Nicht gebaut und ausdrücklich nicht empfohlen:** automatisches Verlinken ab 0,60 — dort wäre jede fünfte Zuordnung falsch. Die 253 Vorschläge für 2025 werden angezeigt, nicht ausgeführt. Messung: `sprints/sprint_v2-27_zuordnung.md`. |
| ZO-4 | Dauerhafte Händler-Regel für Mobilität | Feature | ja | ✅ | **In v2-28 erledigt (24.08.2026).** Zweistufige Wortliste in `app_config` (`matching.merchant_rules`), gelesen von der neuen Funktion `merchant_rule_match`; `calculate_match_confidence` zieht die Konfidenz mit demselben `GREATEST` hoch, das sie für `history_match` schon benutzt — auf **0,96**, knapp über der Auto-Absorptions-Schwelle. **An `process_csv_import` war damit nichts zu ändern**, der Import verlinkt ab sofort von allein. **Gegen die eigenen Entscheidungen des Nutzers gemessen (LL-27): 75 Übereinstimmungen gegen 2 Widersprüche — 97,4 %.** Von 34 Zeilen mit `DB Vertrieb` oder `Deutschlandticket` wird **keine** getroffen; die bewusste Auslassung wirkt. **Die Zweistufigkeit hat sich an genau zwei Zeilen bewährt:** „JET, 25,00 €" wird über den Betrag angenommen, „Backen FCO-Team, 5,00 €" mangels zweitem Signal abgewiesen — ohne sie wäre eine private Überweisung auf der Tank-Karte gelandet. **65 Zahlungen aus 2025 nachverlinkt (1.520,22 €), Sparrate in allen 24 Monaten unbewegt**, weil „Tanken" eine BUDGET-Karte ist und in keinem Monat über 240 € kommt. **Aber der Juli 2025 hat nur noch 79 Cent Luft** (239,21 €) — eine nachträglich zugeordnete Tankfüllung dort kippt den Monat, und dann bewegt sich die Sparrate. |
| ZO-5 | Zahlungen mit Buchungsdatum im Text zuordenbar machen | Feature | ja | ✅ | **In v2-29 erledigt (25.08.2026) — und die Begründung dieses Eintrags dabei widerlegt.** `history_match` erkennt eine Handzuordnung jetzt am **Händler** statt am Wortlaut: `af_merchant_key` macht alle Ziffern und Sonderzeichen zu Leerzeichen, wodurch Buchungsdatum, Kundennummer und Transaktions-ID von selbst wegfallen — ohne dass die Regel ein Format kennen muss. Gegen die **568 Handzuordnungen** gemessen (Leave-one-out, mit Richtig UND Falsch): **257 richtig / 24 falsch = 91,5 %**, gegenüber 147/17 beim naheliegenden „Text vor dem ersten `\|`". Gebaut wurde **ergänzend**, nicht ersetzend: 131 der 136 sichtbaren Vorschläge kamen aus der Historie, und **35 davon** hätten mit dem gröberen Schlüssel keinen eindeutigen Treffer mehr — ein gröberer Schlüssel fasst mehr zusammen und wird dadurch öfter mehrdeutig. **Sichtbare 2025-Vorschläge 136 → 195**, Sparrate in allen 24 Monaten unbewegt. **⚠️ Die alte Begründung hier war FALSCH und ist es wert, stehen zu bleiben:** Sie sagte, 147 Zahlungen bekämen keinen Vorschlag, *„weil der Name bei jeder Buchung ein anderer ist"*. **Die Null stimmte, die Erklärung nicht.** Von 128 solchen Zahlungen (Stand 25.08.) tragen **84 — zwei Drittel — einen Händler, der NIE einer Karte zugeordnet wurde**: Einmalkäufe, eine Japan-Reise, Kleidung, PayPal an Privatpersonen, Bargeld. Sie bekommen keinen Vorschlag, **weil es keine Karte gibt, zu der sie gehören** — nicht weil der Name wechselt. Über den Text erreichbar waren **39**, und die sind jetzt sichtbar. Wer den Erfolg an „147" gemessen hätte, wäre an einem Ziel gescheitert, das es nie gab. Messung: `sprints/sprint_v2-29_review.md`. |
| ZO-6 | Wächter: zeigt eine Händler-Regel auf eine Karte, die es gibt? | Bugfix | ja | ⬜ | `matching.merchant_rules` ist nach **Kartenname** geschlüsselt — bewusst, weil eine UUID in einer Konfigurationstabelle unlesbar ist und keinen Neuaufbau überlebt (v2-28 §5 ⑤). **Der Preis: Wird die Karte umbenannt, greift die Regel still nicht mehr.** Kein Fehler, keine Meldung, nur ein Automatismus, der aufhört zu funktionieren. Klein zu bauen, aber genau die Fehlerklasse, die dieses Projekt teuer bezahlt. |
| ZO-7 | Der Händler wird nicht angezeigt, obwohl die App ihn kennt | Bugfix | ja | ⬜ | **Fund aus v2-29, beim Ansehen des Ergebnisses entstanden — nicht durch die Prüfstrecke.** `displayDescription` (v2-10, `RM-1`) zeigt den **letzten** durch `\|` getrennten Teil. Bei DKB-Giro ist das der Verwendungszweck und richtig; bei einem **Debitkartenumsatz ist es das Datum**, und der Händler davor wird weggeschnitten. Der Nutzer liest also „VISA Debitkartenumsatz vom 29.11." und darunter „KI-Vorschlag: Privates Budget" — **ohne zu sehen, worauf der Vorschlag beruht.** Es sind **exakt dieselben 39 Zahlungen**, die v2-29 sichtbar gemacht hat. **Warum das mehr ist als Kosmetik:** Ein Vorschlag soll helfen zu entscheiden; ist seine Begründung unsichtbar, kann man ihn nicht beurteilen. Der volle Text steht im `title`-Attribut, also erst beim Überfahren mit der Maus. **Fünfte Gestalt von LL-26 — die Wahl des falschen Teils.** In v2-29 bewusst nicht behoben: Eine Änderung an `displayDescription` beträfe **alle 1.599** Fragmente und wäre eine zweite Verschiebung im selben Sprint; außerdem ist „welcher Textteil wird gezeigt" eine Gestaltungsfrage. |
| ZO-8 | Der alphabetische Münzwurf bei mehrdeutigem Text | Bugfix | ja | ⬜ | **Gemessen in v2-29, dort bewusst nicht angefasst.** Der wortgleiche Vergleich in `history_match` prüft **nicht auf Eindeutigkeit**: Liegt derselbe Text auf mehreren Karten, liefert er für **jede** 0,94, und welche gewinnt, entscheidet `refresh_fragment_suggestions` per `ORDER BY score DESC, card_name ASC` — also **alphabetisch**. Das betrifft **93** der 568 Handzuordnungen und ist der Grund, warum die alte Regel im Leave-one-out nur auf **70,3 %** kommt (180 richtig / 76 falsch), während die neue Händler-Stufe 91,5 % erreicht. **Die Eindeutigkeitsprüfung auf Stufe 2 auszuweiten würde die Genauigkeit heben und Reichweite kosten** — dieselbe Abwägung wie in v2-29, aber mit anderen Zahlen: gemessen 257/24 gegen 274/80. Braucht eine eigene Messung und eine Entscheidung des Nutzers, keinen schnellen Patch. **Warum nicht in v2-29:** ein Sprint, eine Verschiebung — sonst lassen sich zwei gleichzeitige Verschiebungen hinterher nicht auseinanderhalten (dieselbe Begründung wie bei `ZO-1`). |

---

### Paket 6 · Datenbasis vervollständigen
**Entsperrt:** ehrliche Vorjahreswerte, aussagekräftige Treiber, überhaupt eine
Vergleichsbasis. Ohne dieses Paket bleibt die 2025-Goldlinie irreführend hoch.
**Steht seit dem 05.08.2026 hinter Paket 5**, damit der Marathon von der besseren
automatischen Zuordnung profitiert statt sie vorwegzunehmen.

> **`DA-1` ist in v2-27 gefallen — und hat die Reihenfolge-Begründung im Nachhinein
> bestätigt, allerdings andersherum als gedacht.** Die Annahme war, Paket 5 mache Paket 6
> billiger. Tatsächlich war es Paket 6, das Paket 5 überhaupt erst anwendbar machte: Für
> 2025 gab es **keine Vorschläge**, weil dort keine Karte aktiv war — die Zuordnung war
> nicht schlecht, sie hatte nichts zum Zuordnen. Nach `DA-1` sind es 253.
>
> **Was jetzt noch fehlt, ist Handarbeit, keine Technik.** 710 Zahlungen aus 2025 sind
> offen; für 212 davon liegt ein Kartenvorschlag bereit, der Rest ist Einmaliges —
> Urlaube, Geschenke, Anschaffungen. Das ist `DA-2` im Geiste, nur für 2025.

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| DA-1 | Karten auf 2025 zurückdatieren | Daten | ja (Schreibzugriff) | ✅ | **In v2-27 erledigt (19.08.2026).** 22 Karten reichen nach 2025 zurück, 27 Plan-Zeilen, sechs Audible-Lücken. **2025 von 48.445,32 € auf 22.567,80 €** — das volle Netto ist weg, die Vorjahres-Goldlinie ist vergleichbar (2026 liegt in den unkuratierten Monaten bei 1.821,59 €, 2025 jetzt bei 1.854–1.908 €). **2026 hat sich in keinem der zwölf Monate bewegt**, beide Invarianten 24/24, alle neun Prüfsummen byte-identisch. **Drei Befunde, die den Auftrag korrigiert haben:** vier Karten, die angeblich 2025 nicht existierten, haben 12/12 Monate Zahlungen (−4.164,15 €) · iCloud lag 2025 bei 9,99 € statt der angenommenen 11,58 € (Mischwert aus 17 Apple-Buchungen) · und `is_card_active_in_month` zählt den Rhythmus **ab `first_active_month`**, weshalb Zurückdatieren den Fälligkeitsmonat 2026 verschieben kann — der ADAC ist deshalb draußen. **Nachtrag vom selben Tag:** Der Nutzer meldete, die Gesamtmiete sei falsch — und hatte recht. Der Plan wurde als *Jahresdurchschnitt ÷ Split-Faktor* konstruiert und erfand damit Haushaltsbeträge, die es nie gab (1.817,49 € statt 1.820 €). **Die Gegenprobe lag zwölffach bereit** — dieselbe Rechnung trifft für Feb–Aug 2026 exakt den heute gültigen Plan — **und wurde nicht gemacht** (LL-36). Korrigiert für alle fünf GEMEINSAM-Karten; dabei fiel ein **älterer** Fehler auf: Die Plan-Zeile für Januar 2026 trug schon vor diesem Sprint den Februar-Betrag. Protokoll: `sprints/sprint_v2-27_anker.md` §8. |
| DA-3 | Die 2025-Pläne auf die tatsächlich gezahlten Beträge | Daten | ja (Schreibzugriff) | ✅ | **In v2-28 erledigt (24.08.2026), Nachzug zu `DA-1`.** `DA-1` setzte je Karte **eine** Plan-Zeile als Jahresdurchschnitt — zu grob bei Ausreißern und bei echten Preiswechseln. **Ein Mittelwert kann tadellos gebildet und trotzdem in keinem Monat richtig sein:** (10 × 19,99 + 2 × 13,99) / 12 = **18,99 exakt**, und 18,99 € wurde bei Netflix nie gezahlt. Ebenso Spotifys 11,16 €. Korrigiert: Handyvertrag 33,07 → **33,00** (zehn von zwölf Monaten waren 33,00; 33,40 und 33,44 zogen den Schnitt), Netflix **19,99** ab Januar und **13,99** ab November (Preissenkung), Spotify **10,99** ab Januar und **12,99** ab Dezember (Preiserhöhung), Friseur zurück auf `2025-01` mit Plan 45,00. **Die Preiswechsel waren die ganze Zeit in der Datenbank — nur im falschen Jahr:** Netflix trug für `2026-01` bereits 13,99, Spotify bereits 12,99. **Wirkung 2025: Ist −539,99 €, Plan −539,12 €; 2026 exakt 0,00 € in allen zwölf Monaten.** Die Briefing-Erwartung „Jahressumme unverändert" wurde **vor** dem Eingriff präzisiert: Bei Fixkosten ist ein Monat mit verlinkter Zahlung gegen Plan-Änderungen **immun**, Ist und Plan bewegen sich deshalb unterschiedlich. **Offene Folgepflicht des Nutzers:** Für Friseurbesuche 2025 gibt es keine Belege — die passenden Bargeld-Abhebungen gehören bei der Kuratierung an die Friseur-Karte, sonst zählt dasselbe Geld zweimal. |
| DA-2 | Kuratierung 2026 | Daten | ja (Schreibzugriff) | ⬜ | Seit v2-07 überhaupt erst möglich — vorher war die Rohmasse ab Februar leer. Voraussetzung dafür, dass die Abweichungs-Treiber live etwas zeigen: bei heute 4 Verknüpfungen, davon 3 wirkungsneutral, steht überall „Keine Abweichungen". Das ist korrektes Verhalten, aber nutzlos. |

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
| KAT-5 | Zahlung auf eine Ordner-Kachel ziehen → Anlege-Fenster | Feature | nein | ⬜ | **Record `A2`, entschieden am 07.08.2026 — in v2-17 NICHT gebaut und im dortigen Review nicht benannt.** Ein Zug auf den Ordner soll dasselbe Fenster öffnen wie der leere Platz (Name, Betrag, Häufigkeit, Typ, Attribution), nur mit vorausgewählter Kategorie. Das Muster existiert bereits (`RecurrencePopup`, §8 „Leerer Slot — Weg 1"); es wird nur ein zweites Mal ausgelöst. **Seit v2-18 relevanter:** Weil sich beim Ziehen kein Ordner mehr von selbst öffnet, ist ein zugeklappter Ordner heute gar kein Ziel — `KAT-5` wäre der zweite Weg neben dem Aufklappen. |

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
> Voraussetzungen: Paket 4 (`KAT-1`) und Paket 6 (`DA-1`/`DA-2`).

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
**Bewusst nach hinten** — alle fünf werden besser, wenn die Datenbasis sauber ist.

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| E2 | Periodenabgrenzung (Dezember-Gehalt am 30.11. = Januar-Periode) | Feature | nein | ⬜ | |
| E1 | Rückwirkende Gehaltskorrektur mit Fairness-Ausgleich | Feature | **ja** | ⬜ | Neue Tabelle `fairness_deltas`. **Nicht zu verwechseln mit `GE-1`** (Paket 15): Eine Netto-Korrektur löst *keinen* Fairness-Ausgleich aus, weil der Anteil am **Brutto** hängt. |
| GE-3 | Das Netto als echte Karte statt als Sockel | Architektur | **ja** | ⬜ 🔎 | **Vom User vorgeschlagen am 13.08.2026, bewusst vertagt** — Record `V2/design_direktor_2026-08-13_gehalt.md`, Abschnitt „Verworfen". Wäre sauberer als der heutige Sonderfall (Treiber und Ablageziel kämen geschenkt, der Einkommens-Ordner verlöre seine Ausnahme). **Was dagegen entschied:** Das Gehalt läge danach an zwei Orten — das Brutto muss für `get_split_factor` in der Zeitreihe bleiben, das Netto wanderte auf die Karte; eine vergessene Doppel-Eintragung ließe Brutto und Netto **still** auseinanderdriften und den Partner-Anteil falsch werden. Dazu: Onboarding speist das Netto über `estimate_net_monthly`, der Partner wäre asymmetrisch (§13 „keine Partner-only Karten"), 2025 ist exakt Netto × 12 und bräuchte `DA-1`, und Design-Doku §4.2 ist normativ. **Umfang:** 6 DB-Funktionen + 4 Frontend-Dateien. **Natürlicher Moment: zusammen mit `DA-1`** — dann fällt die Rückdatierung ohnehin an. |
| M11 | Hell-/Dunkel-Modus | Feature | nein | ⬜ | Niedrige Priorität. Variablen-Ebene auf Basis von `src/styles/tokens.css`. |
| M8 | Chat-Fenster für Rückfragen zu allen App-Daten | Feature | nein (API-Ebene) | ⬜ | Großes Feature, eigene Phase. **Braucht ein Sicherheits- und Datenschutz-Konzept**, bevor irgendetwas gebaut wird. |

---

### Paket 15 · Gehalt — „Realität gewinnt" auch für das Netto
**Entsperrt:** dass eine Abweichung zwischen geplantem und tatsächlichem Gehalt
überhaupt sichtbar wird. Heute ist das Netto **geplant, nicht gemessen** — Juli 2026
geplant 4.165,11 €, überwiesen 4.149,54 €, und die App sieht die 15,57 € nicht.

**Vorgezogen.** Das Paket ist am 13.08.2026 aus der Nutzung entstanden und wird
**vor** Paket 5 gebaut, weil der User beim Zuordnen darauf gestoßen ist: Das
Gehalts-Fragment ließ sich nicht auf die Netto-Kachel ziehen. Die Reihenfolge dieser
Datei war immer ein Vorschlag, kein Beschluss.

**Phase ① ist abgeschlossen und freigegeben.** Ziel, Nicht-Ziel, Prüfanker und beide
Gestaltungsentscheidungen stehen. Briefing: `sprints/sprint_v2-19_briefing.md`.

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| GE-1 | Gehalt auf die Netto-Kachel ziehbar, Ist-Netto je Monat | Feature | **ja** | ✅ | **v2-19.** Tabelle `income_fragment_links` — sie speichert den **Link, nicht den Betrag**; die Summe entsteht aus `fragments.amount`, dadurch können beide nicht auseinanderlaufen und „zwei Gehälter summieren sich" fällt von selbst heraus. Eingriff wie vorgesehen **nur** in `calculate_sparrate_for_month` (plus `get_category_amounts_for_month` für Anker 1); `get_net_monthly_for_month` und `calculate_planned_sparrate_for_month` **nachweislich unberührt** — Prüfsummen vor und nach der Migration identisch. Prüfanker im Trockenlauf gegen Produktion bestätigt: Juli-Ist 6,73 → **−8,84 €**, Plan 23,93 € unverändert, elf Monate 0,00 €, Anker 1 12/12. |
| GE-2 | Treiber-Zeile „Gehalt" ohne Karte | Feature | **ja** | ✅ | **v2-19.** Zeile mit `card_id: null`. Die Karten werden auf `p_limit` gekürzt, **danach** kommt das Gehalt dazu — es verdrängt keinen Karten-Treiber (Record, Entscheidung C, ergänzt am 13.08.). Im Frontend war `getTop3Drivers` die stille Gegenstelle: Es schnitt auf drei ab, und „Gehalt" liegt im Juli mit −15,57 € auf **Platz 4**. Ohne diesen Fund wäre die Zahl korrekt berechnet und nie sichtbar gewesen. Wächter: `tests/e2e/gehalt.spec.ts`. |

---

### Paket 16 · Befunde aus der August-Kuratierung
**Entsperrt:** dass die Zahlen stimmen, während der User kuratiert — und dass er eine
Karte, die er gerade angelegt hat, auch wieder loswird.

**Aus der Nutzung entstanden**, wie Paket 15: Der User hat am 15.08.2026 den August
kuratiert und dabei drei Dinge gemeldet. Diagnose:
`V2/befunde_2026-08-15_kuratierung-august.md`. Der dritte Befund (`B2` — die
Treiber-Zeile nennt eine Abweichung, keinen Kartenbetrag) hat er **selbst gelöst**,
indem er den Plan auf den Ist-Wert anpasste; er gehört gestalterisch zu `B2-F`.

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| KU-1 | Eine Karte im Papierkorb rechnet weiter mit | Fehler | **ja** | ✅ | **v2-20.** Der Ordner „Urlaub" zeigte −559,85 € statt −914,85 €, die Kachel sagte „4 Posten" bei drei Karten, und die Sparrate August war um 355,00 € zu hoch. Vier Rechenfunktionen filtern jetzt `deleted_at IS NULL` — **in einer Migration**, weil jede einzeln eine Invariante bricht. **Kein Konflikt mit §2.1 Snapshot-Integrität:** `HAS_PAST_PLAN` lässt keine Karte mit Vergangenheit löschen, der Filter wirkt also nur im laufenden Monat und der Zukunft. Die alte Begründung („Papierkorb-Karten tragen ohnehin 0 bei") galt für die **Treiber**, nicht für die **Sparrate** — ein Schluss von einer Differenz auf einen Absolutwert, dieselbe Klasse wie LL-23. |
| KU-2 | Löschen ist eine Sackgasse | Fehler | **ja** | ✅ | **v2-20.** `HAS_STATES` blockiert nur noch bei Zuständen aus **vergangenen** Monaten; `HAS_LINKS` und `HAS_PAST_PLAN` unverändert. Der Hinweis verweist auf »Karte beenden…« **nur wenn es den Menüpunkt gibt** — bei einmaligen Karten gibt es ihn nicht, und Karten aus einer Zahlung sind typischerweise einmalig. **Zweiter Fund beim Bauen:** `page.tsx` bildet das Lösch-Tor nach (statt 31 RPC-Aufrufe) und hätte die Datenbank-Änderung stillschweigend aufgehoben — die Abfrage lud alle Monats-Zustände. Wächter: `tests/e2e/loesch-tor.spec.ts` prüft beide Seiten auf dieselbe Regel. |

---

### Paket 17 · Die App reagiert sofort
**Entsperrt:** dass Benutzen sich wie Benutzen anfühlt — und dass die App unter
Dauerlast nicht mehr in Vercels Fehlerseite endet.

**Aus der Nutzung entstanden**, wie Paket 15 und 16: Der Nutzer meldete am 16.08.2026,
das Ziehen einer Zahlung dauere mehrere Sekunden, mit Screenshot eines
`504 MIDDLEWARE_INVOCATION_TIMEOUT`. Diagnose vollständig gemessen:
`V2/befunde_2026-08-16_performance.md`.

**Performance kam in dieser Roadmap bis dahin nirgends vor** — null Treffer für
„Performance", „Ladezeit", „langsam", „Latenz", „Reaktion". Genau das ist der Grund
für dieses Paket: Ein Thema, das nicht in der Liste steht, konkurriert unsichtbar mit
allem anderen.

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| PF-1 | Ein Dashboard-Aufbau macht 233 Netzrunden für 490 ms Rechenarbeit | Fehler | **ja** | ✅ | **v2-24, fünf Phasen.** Jetzt **~18** Anfragen je Aufbau, p50 von 500–1.300 ms auf 32–118 ms. Zwei neue LESENDE RPCs (`get_cards_for_month`, `get_sparrate_series`), die die Rechenfunktionen **aufrufen** statt sie nachzubauen — belegt über **byte-identische Prüfsummen** aller neun (9/0). Der Karten-Lader fiel von 179 auf 1 Anfrage, die Welle von 37 auf 1. Kein Zahlenwert bewegt: alle 12 Monate Ist und Plan identisch, Invariante 1 exakt, B2 0 von 12 verletzt. **Der Kommentar, der es erklärt:** „N+1-Pragmatik: bei <20 Karten akzeptable Latenz" — es sind 77 geworden, und jede neue Karte kostete vier Runden. Kein Anker, keine Prüfsumme, keine Invariante fängt das, weil **jede Zahl richtig ist — sie kommt nur zu spät**. |
| PF-2 | Die Middleware kann einen 504 erzeugen | Fehler | nein | ✅ | **v2-24 P1.** Der Ausfall war bis auf die Minute rückverfolgbar (Zeitstempel in der Vercel-Fehler-ID → 19:10:24 UTC → schlechteste Minute des Tages, Median 20 s). Die Middleware rief `/auth/v1/user` und `/rest/v1/profiles` **nacheinander** auf, ohne Zeitlimit und ohne Ausweichpfad. Der `profiles`-Abruf ist ersatzlos weg (die Information wird in `page.tsx` ohnehin geladen), das Zeitlimit liegt bei 8 s je Versuch. **Die 8 s sind gemessen, nicht geraten:** die langsamste je beobachtete Auth-Antwort lag bei 5.205 ms, ein erster Entwurf mit 4 s hätte eine gültige Sitzung abgeschnitten. |
| PF-3 | `auth.uid()` wird in elf RLS-Policies pro Zeile neu ausgewertet | Fehler | **ja** | ⬜ | Vom Supabase-Linter als WARN gemeldet für `profiles`, `income_timeline`, `cards`, `card_planned_timeline`, `card_monthly_states`, `fragments`, `card_fragment_links`, `deleted_entities`, `card_categories`, `income_fragment_links`. Abhilfe mechanisch (`auth.uid()` → `(select auth.uid())`) und verbilligt **jede** verbleibende Anfrage. **Bewusst nicht in v2-24:** Es sind Zugriffsregeln auf echte Finanzdaten, und der Sprint trug schon zwei Migrationen. Wenn die Änderung doch nicht semantisch identisch ist, ist der Schaden Datensichtbarkeit, nicht Langsamkeit. Dazu zwei fehlende Fremdschlüssel-Indizes: `card_planned_timeline.user_id`, `fragments.suggested_card_id`. **⚠️ Gemessen am 27.08.2026 (v2-30 P0): Für den Import bringt die Umstellung NICHTS.** Im Trockenlauf umgestellt und zurückgerollt, `history_match` über 28 Karten: **274 ms vorher, 289 ms nachher.** Das entwertet PF-3 nicht — die Linter-Warnung bleibt richtig, und jede andere Anfrage profitiert weiterhin. Aber es nimmt PF-3 die Rolle als Lösung für `PF-6`, und der Eintrag steht hier, damit die nächste Sitzung die Messung nicht ein zweites Mal macht. |
| PF-4 | Die Vercel-Funktionen standen auf **USA**, die Datenbank liegt in **Irland** | Fehler | nein | ✅ | **v2-24, am 17.08.2026 in zwei Schritten geschlossen.** Erst USA → Frankfurt, dann Frankfurt → **Dublin (`dub1`)**. Dublin ist die exakte Entsprechung: Vercel beschriftet es selbst mit **`eu-west-1`** — dieselbe AWS-Region wie die Supabase-Datenbank. **Die Entscheidung trägt nicht die Zahl der Anfragen, sondern die der Abhängigkeitsstufen:** `page.tsx` hat **13 `await`-Barrieren**, jede kostet eine volle Wegstrecke. Frankfurt (andere Region) ~250–320 ms, Dublin (gleiche Region) ~25–40 ms. Dass Dublin für einen Nutzer in Deutschland ~25 ms weiter weg ist, verliert dagegen: Der Browser spricht pro Geste **zweimal** mit der Funktion, die Funktion **dreizehnmal** mit der Datenbank. **Festgenagelt in `vercel.json`** (`{"regions": ["dub1"]}`) — versioniert, im Diff sichtbar, überlebt ein neu angelegtes Projekt, und **gewinnt gegen das Portal**. Vorher lebte die Einstellung nur dort, und genau deshalb behauptete CLAUDE.md §2 über ein Jahr das Gegenteil, ohne dass es auffiel (LL-30 / §6 Stolperfalle 20). **Nicht betroffen:** die Edge-Middleware — sie läuft immer nutzernah. **Millisekunden sind geschätzt**, die 13 Stufen gezählt; die Netzstrecke Vercel→Supabase liegt außerhalb dessen, was `response.origin_time` sieht. |
| PF-5 | Der Middleware-Ausweichpfad ist nie ausgelöst worden | Prüfung | nein | ⬜ | Er ist gebaut, typgeprüft und in zwei vollständigen Prüfläufen **nie angesprungen** (0 Warnungen im Server-Log). Das zeigt, dass er nicht im Weg ist — nicht, dass er im Ernstfall greift. Ein Wächter dafür bräuchte einen einspeisbaren Fehlerfall. |
| PF-6 | Ein Import mit mehr als vier neuen Zahlungen reißt das 8-Sekunden-Zeitlimit | Fehler | **ja** | ✅ | **In v2-30 behoben, Browser-Smoke bestanden (27.08.2026).** Import von 17 neuen Zahlungen: **23.938 ms → 1.357 ms, Faktor 17,6**, weit unter dem 8-s-Limit. **Der eigentliche Fund war ein anderer als erwartet:** Nicht die Zahl der Aufrufe war das Problem, sondern dass `idx_fragments_merchant_key` als **Ausdrucks-Index über eine SQL-Funktion** nie griff — der Planer **inlined** `af_merchant_key`, danach steht im Plan der Rumpf statt des Aufrufs, und beide treffen sich nie (`Rows Removed by Filter: 1628`, 28-mal je Zahlung). **Die Statistik sagte dabei „wird benutzt" (88.107 Scans), der Plan sagte „hier nicht"** — dieselbe Klasse wie die Regions-Zeile aus LL-30. Behoben durch `fragments.merchant_key` als `GENERATED … STORED` plus gewöhnlichen B-Tree-Index; ein Spalten-Index ist gegen Inlining immun. **Kein Nachbau** (§6 Stolperfalle 16): Die Spalte ruft die Funktion auf. **Zwei naheliegende Fixes wurden gemessen und verworfen** und stehen in der Migration dokumentiert: `PF-3` (274 → 289 ms, kein Effekt) und `af_merchant_key` auf `plpgsql` (285 → 367 ms, schlechter). Verifiziert: Spalten-Äquivalenz **1.628/1.628** ohne Abweichung, `history_match` alt gegen neu **231 Paare** ohne Unterschied, Sparrate **24/24** unverändert, Anker 1 und 2 je **0 Verletzungen**, Prüfsummen **16 von 17 unverändert** (nur `history_match`). Prüfstrecke `tsc` 0 / `test:visual` 148/148. Details: `sprints/sprint_v2-30_briefing.md`. Übrig: **PF-7**. |
| PF-7 | Der Ausdrucks-Index `idx_fragments_merchant_key` ist funktionslos geworden | Aufräumen | **ja** | ⬜ | **Aus v2-30 übrig geblieben, bewusst nicht mitgenommen.** Seit v2-30 liest `history_match` die materialisierte Spalte `fragments.merchant_key`; der alte Ausdrucks-Index über `af_merchant_key(description)` hat damit seinen Hauptnutzer verloren. **Er wird trotzdem nicht einfach gelöscht:** `pg_stat_user_indexes` weist **88.107 Scans** aus, und welcher Aufrufer sie verursacht, ist **nicht ermittelt** — genau diese Unklarheit war der Grund, ihn im selben Sprint stehen zu lassen (ein Sprint, eine Verschiebung; dieselbe Begründung wie bei `ZO-8` in v2-29). Aufgabe: erst den Verursacher finden, dann entscheiden. Kosten des Behaltens: ein Anteil an den 8,9 ms, die ein `INSERT` mit allen sechs Indizes kostet — also gering, es eilt nicht. |

> **Was dieses Paket an Wissen zurückgibt, unabhängig von den Punkten:** Der Anker
> dieses Projekts misst **Richtigkeit**, nicht **Geschwindigkeit**. Ein N+1 kann
> beliebig wachsen, während alle Wächter grün bleiben. Ein datenunabhängiger
> Gegen-Wächter wäre **Anfragen je Dashboard-Aufbau**, zählbar im Supabase-Log über
> `app_config` (genau ein Aufruf je Aufbau). Stand nach v2-24: **~18**.

---

### Paket 18 · Befunde aus der Jahres-Kuratierung 2026
**Entsperrt:** dass der Nutzer eine irrtümlich angelegte Karte wieder loswird — und dass
in der Sparrate keine Beträge stehen, die es nie gegeben hat.

**Aus der Nutzung entstanden**, wie Paket 15, 16 und 17: Der Nutzer hat am 17.08.2026
**alle Monate 2026 kuratiert** und zehn Punkte gemeldet. Diagnose:
`V2/befunde_2026-08-17_kuratierung-2026.md`. **Zehn Meldungen, drei Wurzeln** — fünf
Meldungen betrafen denselben Löschriegel, drei denselben Plan-ohne-Zahlung-Mechanismus.

Die Gestaltung ist **entschieden** (17.08.2026):
`V2/design_direktor_2026-08-17_loeschen_und_nicht-angefallen.md`, Entscheidungen 1–5.
Design-Doku **v3.9.0** trägt die Spezifikation; gebaut ist nichts davon.

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| KJ-1 | Der Löschriegel sperrt **78 von 82** Karten | Fehler | **ja** | ✅ | **⚠️ Nachspiel in v2-26:** Der Fall des Riegels legte eine **zweite Sperre** frei, die niemand kannte — `HAS_STATES` zählte auch **leere** Zustandszeilen mit. Das fiel nie auf, weil `HAS_PAST_PLAN` ohnehin fast alles sperrte; erst als die erste Sperre fiel, wurde die zweite sichtbar (`KJ-8`-Kontext, behoben in v2-26). `HAS_PAST_PLAN` greift, sobald `first_active_month` vor dem laufenden Monat liegt — nach der Kuratierung von Januar bis Juli ist praktisch **alles** unlöschbar; löschbar sind genau **4**. Der Riegel ist nicht sinnlos: Seit v2-20 filtern alle vier Rechenfunktionen `deleted_at IS NULL`, eine gelöschte Karte fällt also aus den Sparraten **aller** Monate, auch der vergangenen. **Entschieden (17.08.): Löschen erlauben, mit angezeigter Folge im bestehenden Toast** — Summe statt Liste, türkis bei Entlastung, rot bei Belastung, leerer Fall zeigt nichts. Verworfen: „nur Karten ohne Zahlung" (wären **3** von 78) und „statt Löschen rückwirkend beenden" (Karteileiche bleibt sichtbar). ⚠️ **`page.tsx` bildet `card_delete_gate` NACH** — wer die Regel in der Datenbank ändert und den Nachbau vergisst, hebt die Änderung stillschweigend auf (LL-26; in v2-20 real passiert). **✅ v2-25:** Der Riegel ist gefallen — beide Seiten in EINEM Commit (Datenbank **und** der Nachbau in `page.tsx`), der Wächter um drei Prüfungen erweitert. Der Toast nennt jetzt die Folge: Summe und Zahl der Monate, türkis/rot, leerer Fall zeigt nichts. Die Wirkung wird **gemessen, nicht gerechnet** — `delete_card` ruft `calculate_sparrate_for_month` vor und nach dem eigenen UPDATE in derselben Transaktion auf. **Was die Überschrift korrigiert:** Löschbar sind jetzt **3** Karten, nicht 78 — `HAS_LINKS` sperrt 79 und bleibt bewusst stehen (Nutzer-Entscheidung 17.08.: Wer löscht, muss entscheiden, wohin die Zahlung gehört; bei den neun „Fahrradteilen“ ist genau das die eigentliche Arbeit). Die 3 sind trotzdem die wichtigsten: zwei Einnahmen ohne Zahlung, die Januar um +53,70 € und April um +15,00 € zu gut ausweisen. |
| KJ-2 | Der Plan zählt, auch wenn nichts bezahlt wurde | Fehler | **ja** | ✅ | Prioritätskette **Realität → Anpassung → Plan**: fehlt beides Erste, gewinnt der Plan. Bei Miete richtig, bei **Audible** (zeitweise pausiert), **Friseur** (nicht jeden Monat) und einer **irrtümlich monatlichen** Fahrradteile-Karte falsch. Gemessen im August: Friseur 45,00 € und Audible 9,95 € zählen ohne Gegenstück; Audible und Friseur haben je 4 Zahlungen bei 8 aktiven Monaten. **Entschieden (17.08.): Ein-Klick-Menüpunkt `Diesen Monat nicht angefallen`** plus `Wieder mitzählen`. Er schreibt **denselben Wert** wie der heutige Weg „Betrag anpassen auf 0 €, nur diesen Monat" — **keine Änderung an `calculate_card_amount_for_month`, kein Anker-Risiko**. Verworfen: eine Karten-Eigenschaft „fällt unregelmäßig an" (greift in die Rechenfunktion **und** macht die Vorschau kaputt — künftige Monate zeigten 0 €, obwohl dafür geplant werden soll). **✅ v2-25:** Menüpunkt `Diesen Monat nicht angefallen` mit Gegenstück `Wieder mitzählen` — ein Klick, kein Dialog, kein `…`. Schreibt denselben Wert wie „Betrag anpassen auf 0 €, nur diesen Monat“; keine Zahl bewegt, die vier Rechenfunktionen byte-identisch. Entscheidung 4 sitzt in der **Datenbank**: `toggle_card_manually_paid` löscht eine Anpassung von **genau 0**, wenn das Häkchen gesetzt wird — nur die 0, nur beim Setzen. |
| KJ-3 | Eine Anpassung ist auf der Karte **unsichtbar** | Fehler | nein | ✅ | `adjustedAmount` steht nur im Typ und wird von **keiner** Kartenkomponente benutzt. Eine Karte mit Plan 45 € und Anpassung 0 zeigt `0,00 €` — nicht unterscheidbar von fehlenden Daten. **Dieser Punkt stand in keiner Meldung**; er kam beim Nachsehen für KJ-2 dazu und macht KJ-2 ohne ihn zu einer stillen Falschaussage. **Entschieden: `nicht angefallen` in der Statuszeile, anstelle des Fälligkeitstags, im Ghost-Ton** — keine zusätzliche Kartenhöhe, kein neues Token. Eine Anpassung auf einen Wert **≠ 0** bleibt bewusst weiterhin unsichtbar. **✅ v2-25 — mit einer gemessenen Korrektur an der Spezifikation.** Der Record sah `nicht angefallen` am rechten Anschlag vor; gemessen passt es dort in **keinem** der vier Zustände (117,8–139,3 px bei 110 px Inhaltsbreite). Entschieden wurde für den **Wortlaut** und gegen den Ort: Der Text ersetzt jetzt das **Status-Label**, der Fälligkeitstag verschwindet mit — beide Enden wären sonst eine Falschaussage. Design-Doku **v3.9.1**. |
| KJ-4 | Die Monatsnamen überlagern sich an den Chevrons | Fehler | nein | ⬜ 🔎 | Screenshot vom 17.08.2026: zwei linke Flanken-Beschriftungen übereinander („April 2026" und „Mai 2026", dazu „5" und „8 Fragmente offen"). Geprüft: `.monthLabel` (der **aktive** Monat) trägt `animation: monthFade` und `key={targetMonth}` — die Überlagerung sitzt aber in den **Flanken**, die weder Key noch Animation haben. **Ursache nicht geklärt.** Hypothese: ein Hydrations-Unterschied (zwei Textknoten an derselben Stelle ist dessen typisches Bild; `page.tsx` liest `new Date()`). **Zu diagnostizieren, nicht zu erraten** — braucht einen Blick in die Browser-Konsole beim Monatswechsel. **🔎 v2-25 — NICHT REPRODUZIERBAR, deshalb bewusst kein Patch** (§7 Regel 10). Ausgeschlossen: **Hydrations-Unterschied** — die Hypothese des Befunds, **0** Konsolenmeldungen in Chromium *und* WebKit · Übergangsbild beim Monatswechsel (nie mehr als **ein** Header im DOM, beide Engines) · vier schnelle Klicks hintereinander · Browser-Zurück/Vorwärts, auch 3× schnell · Fensterbreiten 1680 → 560 px (keine Überlappung, kein h-Scroll). **Vor dem nächsten Schnitt zu klären:** Tritt es nach v2-24 überhaupt noch auf? Der Screenshot könnte aus der Zeit stammen, als ein Aufbau **233** Netzrunden brauchte und das Übergangsfenster Sekunden lang war; er liegt selbst nicht mehr vor. |
| KJ-6 | „Nicht angefallen" sah aus wie offen | Fehler | nein | ✅ | **v2-26.** Die Karte blieb rot und „Offen", und der Ordner zählte sie mit — `3 offen`, von denen zwei erledigt waren. Jetzt türkis mit Häkchen wie eine bezahlte Karte; die Statuszeile nennt weiterhin `nicht angefallen`, damit „bezahlt" und „fiel nicht an" unterscheidbar bleiben. **Die Änderung sitzt an EINER Stelle** (`card-state.ts`) — Karte und Ordner benutzen dieselben Resolver, genau dafür wurden sie in v2-17 herausgelöst. |
| KJ-7 | Beim Anlegen einer GEMEINSAM-Karte war der Betrag nicht eingebbar | Fehler | nein | ✅ | **v2-26.** Im Popup „Karte aus Zahlung" war er fest auf den Zahlungsbetrag verdrahtet. Bei GEMEINSAM ist das falsch: Der Plan ist der **Haushaltsbetrag**, die Zahlung dagegen bereits der eigene Anteil — er wurde beim Rechnen ein **zweites Mal** abgezogen (§6 Stolperfalle 11). Exakt der Fall aus dem Befund vom 17.08. (Privathaftpflicht: 53,25 € Haushalt, 28,88 € abgebucht). Feld jetzt eingebbar; **beide** Anlage-Wege zeigen `Voller Haushaltsbetrag — dein Anteil davon: [N] €`, aber nur bei Split-Faktor < 1. |
| KJ-8 | Die Wiederholung war nach dem Anlegen endgültig | Fehler | **ja** | ✅ | **v2-26.** Es gab **keinen Weg**, die Frequenz zu korrigieren — und der Vorgabewert ist `Monatlich`, man vertut sich also durch Nichtstun. Genau deshalb wollte der Nutzer die `Privathaftpflicht` löschen: nicht um sie loszuwerden, sondern weil Zerstörung der einzige angebotene Weg zur Reparatur war. Neuer Menüpunkt `Wiederholung ändern …` mit Overlay und Wirkungs-Toast; `set_card_frequency` misst wie `delete_card` seit v2-25 und führt den Constraint `once_is_single_month` mit. |
| KJ-9 | Der **Lösch**-Toast weicht von §12.5 ab | Fehler | nein | ⬜ | Titel `Karte »X« gelöscht` statt `X gelöscht`, und der Subtext `Karte wird dauerhaft entfernt` fehlt ganz. Besteht seit v2-05. **Der BEENDEN-Toast ist in v2-26 korrigiert worden** (`[Kartenname] — Endet in [Monat Jahr]`), der Lösch-Toast nicht — er war nicht Teil der Meldung. Klein, gehört beim nächsten Anlass mit. |
| KJ-5 | Datenpflege 2026 | Aufgabe | nein | ⬜ | **Arbeit in der App, kein Bauauftrag** — hängt an KJ-1 und KJ-2. Aufräumen: acht der **neun** „Fahrradteile"-Karten, die zwei kategorielosen Einnahmen (`Malin Besuch Erstattung` 53,70 € im Januar, `Anteil Essen Aline Marburg` 15,00 € im April — **beide ohne Zahlung, beide blähen die Sparrate auf**), die Doppelten (`Fahrradzubehör`, `Geschenk Lukas`, `Inspektion Auto - Aline`). Neu anlegen: `Kreditkarte-Kosten` (2,49 €/Monat ab Januar, sieben Zahlungen), `Privathaftpflicht` (jährlich, **53,25 € als Plan** — nicht 28,88 €, sonst wird der Anteil zweimal abgezogen —, gemeinsam, ab April), `Google One` (9,99 €/Monat, läuft schon seit Februar). Umbuchen: drei Google-One-Zahlungen von „Privates Budget". Als Umschichtung markieren: die vier ±107,10-Zahlungen im Juli. Alle Werte im Befund. |

> **Was dieses Paket an Wissen zurückgibt, unabhängig von den Punkten:** Zehn Meldungen
> ergaben **drei** Ursachen. Wer nach Monaten sortiert meldet, meldet dieselbe Ursache
> mehrfach — und wer nach Monaten sortiert abarbeitet, baut sie mehrfach. Die
> Verdichtung stand am Anfang der Diagnose, nicht am Ende.

---

## 2. Hausaufgaben ohne eigenen Sprint

An einen passenden Sprint anhängen, nie als eigenen schneiden.

| # | Punkt | Stand | Bemerkung |
|---|---|---|---|
| TP-2 | `net_estimation_brackets` der Übungs-DB befüllen | ⬜ | Seed ist dort bislang leer. Nur nötig, wenn ein Sprint die Netto-Schätzung berührt. **Seit v2-17 präziser fassbar:** Die Baseline-Datei lässt die Tabelle bewusst leer, weil ihr Inhalt Steuerdaten sind und nur in Produktion liegt — die Struktur ist jetzt aber versioniert. |
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
| PF-6 | **Der Import passt wieder in die Zeit.** 17 neue Zahlungen: **23.938 ms → 1.357 ms**, Faktor **17,6**, bei einem `statement_timeout` von 8 s für die Rolle `authenticated`. **Der Fund war nicht das erwartete N+1**, sondern ein Index, der nie griff: `idx_fragments_merchant_key` stand auf `af_merchant_key(description)`, und weil das eine **SQL**-Funktion ist, **inlined der Planer sie** — danach steht im Plan ihr Rumpf statt des Aufrufs, und beide treffen sich nie (`Seq Scan`, `Rows Removed by Filter: 1628`, 28-mal je Zahlung). **Die Statistik verriet es nicht:** 88.107 Scans wiesen den Index als benutzt aus, er griff nur anderswo. Behoben durch `fragments.merchant_key` als `GENERATED … STORED` plus gewöhnlichen B-Tree-Index — ein Spalten-Index ist gegen Inlining immun. **Kein Nachbau:** Die Spalte ruft die Funktion auf. Zwei naheliegende Fixes wurden gemessen und verworfen (`PF-3`: 274 → 289 ms, wirkungslos · `plpgsql`: 285 → 367 ms, schlechter) und stehen in der Migration dokumentiert. Verifiziert: Spalten-Äquivalenz 1.628/1.628, 231 Matrix-Paare ohne Unterschied, Sparrate 24/24, Anker 1+2 je 0 Verletzungen, 16 von 17 Prüfsummen unverändert. | v2-30 |
| ZO-5 | **Die App merkt sich, was du entschieden hast.** `history_match` erkannte eine Handzuordnung nur bei WORTGLEICHER Beschreibung — bei Kartenzahlungen steht das Buchungsdatum im Text, es sind also nie zwei gleich. Jetzt zweistufig: `af_merchant_key` macht alle Ziffern und Sonderzeichen zu Leerzeichen, wodurch Datum, Kundennummer und Transaktions-ID von selbst wegfallen; **die Regel muss kein Format kennen**. Fünf Extraktionswege gegen dieselbe Messung gehalten (Leave-one-out, 568 Handzuordnungen, Richtig UND Falsch) — **gewonnen hat die einfachste, auf beiden Achsen zugleich: 257/24 = 91,5 % gegen 147/17** beim naheliegenden „Text vor dem ersten `\|`". **Gebaut wurde ergänzend, nicht ersetzend**, und das war der teuerste Fund: Die genauere Regel wäre die schlechtere gewesen — 35 der 136 sichtbaren Vorschläge hätten mit dem gröberen Schlüssel keinen eindeutigen Treffer mehr, weil ein gröberer Schlüssel mehr zusammenfasst und **öfter mehrdeutig** wird. Sichtbare 2025-Vorschläge **136 → 195** (vorher aufgeschrieben, exakt getroffen), `vorschlag_geleert` **0**, Sparrate in allen 24 Monaten unbewegt. Der Vorschlag steht jetzt als leise Zeile in der Rohmasse. **Die Begründung dieses Punktes war falsch und wurde mitkorrigiert** — nicht der wechselnde Name war das Haupthindernis, sondern die fehlende Karte: 84 der 128 solchen Zahlungen sind Einmalkäufe ohne Ziel | v2-29 |
| DA-3 | **Die 2025-Pläne tragen, was gezahlt wurde.** `DA-1` bildete je Karte einen Jahresdurchschnitt — zu grob bei Ausreißern und bei echten Preiswechseln. **Ein Mittelwert kann tadellos gebildet und trotzdem in keinem Monat richtig sein:** Netflix' 18,99 € ist exakt (10 × 19,99 + 2 × 13,99) / 12 — und wurde **nie gezahlt**. Jetzt zwei Zeitreihen-Zeilen je Preiswechsel (Netflix 19,99 → 13,99 ab November, Spotify 10,99 → 12,99 ab Dezember), der typische Monat statt des Schnitts beim Handyvertrag (33,07 → 33,00), Friseur zurück auf 2025-01. **Die Preiswechsel waren die ganze Zeit in der Datenbank, nur im falschen Jahr** — die 2026-Pläne trugen die neuen Beträge längst. Ist 2025 −539,99 €, Plan −539,12 €, **2026 unbewegt** | v2-28 |
| ZO-4 | **Mobilität ordnet sich selbst zu.** Zweistufige Händler-Wortliste in `app_config`; `calculate_match_confidence` zieht die Konfidenz auf **0,96** — knapp über die Auto-Schwelle, **damit war an `process_csv_import` nichts zu ändern**. Gegen die eigenen Handzuordnungen gemessen: **75 Übereinstimmungen gegen 2 Widersprüche (97,4 %)**, kein Deutschlandticket getroffen. Die zweite Stufe hat sich an genau zwei Zeilen bewährt — ohne sie wäre „Backen FCO-Team" auf der Tank-Karte gelandet. 65 Zahlungen aus 2025 nachverlinkt (1.520,22 €), **Sparrate unbewegt**, weil BUDGET unter dem Plan bleibt. Die Nachverlinkung **ruft die Funktion auf**, statt die Liste zu wiederholen (LL-26, Form „Nachbauen") | v2-28 |
| NAV-1 | **Die Navigation endet dort, wo die Daten enden.** Die untere Schranke stand seit **Sprint 3** auf `1900-01`, im Code selbst als „absurd weit" markiert; der Deaktiviert-Pfad war gebaut und hat in über einem Jahr **nie ausgelöst**. Jetzt aus `cards.first_active_month` abgeleitet — **ohne zusätzliche Netzrunde**, weil `page.tsx` die Karten ohnehin lädt. Abgeleitet statt fest verdrahtet, damit die Grenze sich nach einem Import älterer Auszüge selbst korrigiert. **Dieser Punkt stand in keinem Paket** — dasselbe Muster wie Performance vor v2-24: Was nicht in der Liste steht, konkurriert unsichtbar und verliert | v2-28 |
| DA-1 | **2025 rechnet.** 22 wiederkehrende Karten reichen nach 2025 zurück, mit einem Plan, der zu 2025 passt — die Ist-Sparrate fällt von **48.445,32 € auf 22.461,00 €**, und damit ist die Vorjahres-Goldlinie erstmals vergleichbar (2026 liegt unkuratiert bei 1.821,59 €/Monat). **2026 hat sich in keinem der zwölf Monate bewegt.** Der Plan wird **gerechnet, nicht abgeschrieben**: Bei GEMEINSAM teilt die Migration den gemessenen Anteil selbst durch `get_split_factor` — sonst wäre der Anteil ein zweites Mal abgezogen worden (Miete 604 € statt 1.068 €, ohne dass eine Zahl falsch aussieht). **Der teuerste Fund war eine Falle, die im Auftrag nicht stand:** `is_card_active_in_month` zählt den Rhythmus **ab `first_active_month`**, Zurückdatieren verschiebt also den Fälligkeitsmonat 2026 — ein Wächter in der Migration bricht ab, der ADAC fiel deshalb raus (9 Monate Abstand, 9 % 12 ≠ 0) | v2-27 |
| ZO-3 | **Rückwirkend verlinkt, was sicher ist** — 41 Zahlungen aus 2025 ab 0,95 Konfidenz. Für **2026 war der Punkt gegenstandslos geworden**, dort ist alles von Hand zugeordnet; für 2025 war er bis `DA-1` gar nicht stellbar. Gemessen gegen die 411 handverlinkten Zahlungen aus 2026, weil es für 2025 keine Wahrheit gibt: **ab 0,95 48 richtig / 0 falsch**, ab 0,60 dagegen 181 / 49 — deshalb wurde die niedrige Schwelle **nicht** automatisiert. **Wirkung +1,84 € auf das Jahr**, obwohl die Zahlungen −2.699,90 € ausmachen: Bei Fixkosten wirkt nur die Differenz zum Plan | v2-27 |
| KJ-8 | Die **Wiederholung** einer Karte ist nachträglich änderbar — bis dahin war sie nach dem Anlegen endgültig, und der Vorgabewert `Monatlich` sorgt dafür, dass man sich durch **Nichtstun** vertut. Genau deshalb wollte der Nutzer eine Karte löschen: nicht um sie loszuwerden, sondern weil Zerstörung der einzige Weg zur Reparatur war. `set_card_frequency` misst die Sparraten-Wirkung wie `delete_card` und führt `once_is_single_month` mit | v2-26 |
| KJ-7 | Beim Anlegen einer Karte **aus einer Zahlung** ist der Betrag eingebbar — vorher fest auf den Zahlungsbetrag verdrahtet. Bei GEMEINSAM wurde dadurch der eigene Anteil zum Plan und beim Rechnen ein **zweites Mal** gekürzt. Beide Anlage-Wege sagen jetzt, dass der **Haushaltsbetrag** gemeint ist, und zeigen den Anteil zur Kontrolle | v2-26 |
| KJ-6 | „Nicht angefallen“ ist ein **erledigter** Zustand — türkis, Häkchen, und der Ordner zählt die Karte nicht mehr als offen. Eine Zeile in `card-state.ts`; Karte und Kachel benutzen dieselben Resolver | v2-26 |
| KJ-1 | Der Löschriegel ist gefallen — `HAS_PAST_PLAN` sperrt nicht mehr, **auf beiden Seiten** (Datenbank und der Nachbau in `page.tsx`, ein Commit, Wächter erweitert). Der Toast nennt die Folge: Summe und Zahl der Monate, türkis bei Entlastung, rot bei Belastung, leerer Fall zeigt **nichts**. Die Wirkung wird **gemessen statt gerechnet** — `delete_card` ruft `calculate_sparrate_for_month` vor und nach dem eigenen UPDATE in derselben Transaktion auf; dass eine `STABLE`-Funktion das sieht, ist auf der Übungs-DB belegt (2.200 → 3.200). **Die Überschrift „78 von 82“ war zu optimistisch:** löschbar sind **3** — `HAS_LINKS` sperrt 79 und bleibt bewusst stehen | v2-25 |
| KJ-2 | `Diesen Monat nicht angefallen` plus `Wieder mitzählen` — ein Klick, kein Dialog. Schreibt denselben Wert wie der bisherige Weg über „Betrag anpassen“, deshalb **keine Zahl bewegt** und die vier Rechenfunktionen byte-identisch. Entscheidung 4 sitzt in der Datenbank: `toggle_card_manually_paid` löscht eine Anpassung von **genau 0**, wenn abgehakt wird — nur die 0, nur beim Setzen | v2-25 |
| KJ-3 | `nicht angefallen` in der Statuszeile, im Ghost-Ton, ohne zusätzliche Kartenhöhe. **Mit einer gemessenen Korrektur an der Spezifikation:** Der Record legte den Text an den rechten Anschlag — dort passt er in **keinem** der vier Zustände (117,8–139,3 px bei 110 px). Er ersetzt jetzt das **Status-Label**, der Fälligkeitstag verschwindet mit. Design-Doku **v3.9.1** | v2-25 |
| PF-4 | Die Vercel-Funktionen liefen auf **USA**, die Datenbank in **Irland** — rund **90 ms** Umweg auf jede Anfrage. In zwei Schritten auf **Dublin (`dub1`)** gezogen, die exakte Entsprechung (Vercel nennt es selbst `eu-west-1`, dieselbe AWS-Region wie Supabase). Entschieden über die **13 `await`-Barrieren** von `page.tsx`, nicht über die Zahl der Anfragen: Der Browser spricht pro Geste zweimal mit der Funktion, die Funktion dreizehnmal mit der Datenbank. **In `vercel.json` festgenagelt** — vorher lebte die Einstellung nur im Portal, und genau deshalb behauptete CLAUDE.md §2 über ein Jahr das Gegenteil, ohne dass es auffiel (LL-30) | v2-24 |
| PF-1 | Ein Dashboard-Aufbau kostet **~18** statt **233** Netzrunden. Zwei neue LESENDE RPCs (`get_cards_for_month`: 179 → 1 · `get_sparrate_series`: 24 → 1), die die Rechenfunktionen **aufrufen** statt sie nachzubauen — belegt über byte-identische Prüfsummen aller neun (9/0). Nicht die Datenbank war langsam: `is_card_active_in_month` braucht **0,089 ms** dort und lag bei **899 ms** über die Leitung, und wurde **77-mal einzeln** gerufen. Kein Zahlenwert bewegt, beide Invarianten exakt. **Der Kommentar, der es erklärt:** „N+1-Pragmatik: bei <20 Karten akzeptable Latenz" — es sind 77 geworden | v2-24 |
| PF-2 | Die Middleware kann keinen 504 mehr erzeugen. Der `profiles`-Abruf ist ersatzlos weg (die Information wird in `page.tsx` ohnehin geladen), der Onboarding-Wächter umgezogen, plus Zeitlimit von 8 s je Auth-Versuch. **Der Ausfall war bis auf die Minute rückverfolgbar:** Zeitstempel in der Vercel-Fehler-ID → 19:10:24 UTC → schlechteste Minute des Tages, Median 20 s; die zwei Aufrufe liefen nacheinander, ohne Zeitlimit. Die 8 s sind gemessen (langsamste je beobachtete Auth-Antwort: 5.205 ms), ein erster Entwurf mit 4 s hätte eine gültige Sitzung abgeschnitten | v2-24 |
| ZU-1 | Automatisch zugeordnete Zahlungen zählen wieder an ihrer Karte. `page.tsx` filterte mit `status === "ASSIGNED"`, aber die View kennt **zwei** zugeordnete Zustände — `AUTO_ABSORBED` fiel durch, die Karte blieb „Offen" und zeigte keine Zahlung, obwohl beides in der Datenbank stand. **Vom Nutzer gemeldet**, Fehler aus v2-07 P0, drei Wochen unentdeckt (nur vier automatische Zuordnungen im ganzen Bestand). Behoben über ein benanntes Prädikat `isLinkedToCard` statt eines zweiten Vergleichs. **Sparrate war nie betroffen** — sie liest `card_fragment_links` direkt | v2-23 |
| B2-R | Die Treiber-Summe stimmt wieder auf den Cent. `get_year_deviation_drivers` rundete **je Karte**, die Sparraten-Funktionen erst am Ende über alles. Jetzt wird das Ziel aus den Rechenfunktionen **geholt** (LL-25) und der Rest auf die betragsgrößte Zeile gelegt. **Zwei Vermutungen widerlegt:** Das Gehalt trägt nichts bei (sein Delta ist exakt), und die verursachenden Zeilen sind **gar nicht sichtbar** — ein Delta von 0,0022 € rundet auf 0,00 und wird gefiltert, verschiebt aber die Summe. `Σ delta = Ist − Plan` gilt jetzt in allen zwölf Monaten exakt (vorher 2 Monate daneben) | v2-22 |
| ZO-2 | Vorschlags-Sichtbarkeit als reine Funktion `istVorschlagSichtbar` mit eigener Spec (10 Fälle). Die Regel stand inline im `.map()` einer Server Component — genau dort saß der Fehler aus v2-21 P4, und es war die **dritte** Stelle dieser Art in vier Tagen. Die Spec transpiliert die echte Quelldatei statt die Logik nachzubauen | v2-22 |
| NB-1 | Ziehen öffnet nur noch, was offen ist — Record `B4` **abgelöst**. Alle Ordner aufzuklappen schob die Zielkarte aus dem Bild, und bei gedrückter Maustaste ließ sich das Karussell nicht scrollen. `U1` ist jetzt durch bewusstes Aufklappen **vor** dem Zug gelöst | v2-18 |
| NB-2 | Ansicht springt beim Monatswechsel nicht mehr — die Rohmasse reserviert ihre Höhe (`height` statt `max-height`). Vorher fiel die Zone in leeren Monaten von 341 auf 215 px und die Welle wuchs um 126 px. Dazu der Leerzustand `Keine offenen Umsätze` | v2-18 |
| KAT-1 | Kategorien als eigene Struktur: `card_categories` + `cards.category_id`, fünf RPCs, Menüpunkt „Kategorie ändern …". Keine `cards`-Zeile (D1), kein Papierkorb-Eintrag (D7 — Rücknahme über den Toast), RLS-Policy von Hand (D8). Zehn Ordner, **alle 46 Karten** zugeordnet — „Ohne Kategorie" erscheint dadurch in keinem Monat | v2-17 |
| KAT-2 | Karussell gruppiert: Variante A, kein Tap-Catcher, beim Ziehen öffnen sich alle Ordner (löst `U1`), Aufklapp-Zustand überlebt den Monatswechsel, Einkommens-Ordner mit Netto-Kachel, „Ohne Kategorie" hinten. Juli: 32 Karten → 11 Ordner, 27 → 5 Pfeilklicks | v2-17 |
| KAT-3 | Kategorie-Zahl server-seitig, **restverteilt**: Die Ordner-Spalte ergibt in allen zwölf Monaten exakt die Sparrate. Ohne die Restverteilung wäre sie in **jedem** Monat einen Cent daneben — die Anweisung aus der Gestaltungsrunde war notwendig, aber nicht hinreichend | v2-17 |
| J1 | Datenbank-Grundstand als versionierte Basis: 1.984 Zeilen aus dem `pg_catalog` von Produktion nach v2-16 — 5 Erweiterungen, 6 Aufzählungstypen, 10 Tabellen, 56 Constraints, 14 Indizes, 31 Funktionen, 1 View, 5 Trigger, RLS + 10 Policies, `app_config`-Seed. Damit ist die Übungs-DB erstmals aus dem Repo rekonstruierbar (Befund D15) | v2-17 |
| LQ-1 | Fälligkeitstag je Karte: Spalte + 17 abgeleitete Werte (v2-14), Anzeige rechts in der Statuszeile + Menüpunkt „Fällig am …" (v2-15) | v2-14 / v2-15 |
| LQ-2 | Ausstehend-Anzeige `[N] € noch fällig · [N] € Budget frei` in der Kopfzeile „Planung"; nie eine Summe, nur im laufenden Monat | v2-15 |
| RM-2 | Schaufenster-Popup für ein Fragment: Empfänger führt, Betrag rechts, Datum in der Kopfzeile, Zweck ungekürzt; ohne Trennzeichen entfällt die Zweck-Zeile. Alle Fragmente klickbar — `pointer-events: none` aufgehoben, Drag-Sperre mit eigenem Träger. Escape-Handler. Damit ist **Paket 2 leer** | v2-16 |
| PA-1 | Konsequenz-Anzeige beim Einkommens-Eintrag: das Popup tauscht nach dem Speichern seinen Inhalt, Held ist die Summe (`+18,98 €`), Spalten `Bisher / Künftig / Diff.`, ein Knopf `Schließen`. Leerer Fall zeigt gar nichts (LL-20). Nebenbei: das Einkommens-Popup hat endlich einen **Escape-Handler** (Altbestand seit Sprint 1) | v2-16 |
| TP-1 | Prüfwert im Übungs-DB-Runbook: Anker **ersatzlos entfernt** statt korrigiert — er war zweimal veraltet (4.545,32 → 4.589,53 → tatsächlich 4.208,76 €). Anker werden jetzt nur noch an EINER Stelle gepflegt: `CLAUDE.md` §9 | v2-13 Nachzug |
| BF-4 | Gemeinsame Karten: Split-Anteil genau **einmal** angewandt; Karte zeigt den eigenen Anteil mit `von [N] €` darunter. Prod alle 12 Monate um 0,00 € bewegt, B2 12/12 | v2-13 |
| Init-1 | Übungs-Datenbank aufgesetzt, Runbook in `supabase/test_projekt/` | v2-05 |
| Init-2 | Deterministischer Prüfwert 2.200,00 € definiert | v2-05 |
| Init-3 | Branch-Namenskonvention `sprint/v2-NN-<thema>` | — |
| Init-4 | Sprint-Protokoll-Tabelle in CLAUDE.md | — |
| M0 | Automatisierte Tests mit Playwright, Pixel-Prüfungen, `smoke-agent` | v2-01 / 23.07. |
| A1 | Karten-spezifische Badge-Farben aus dem Kartennamen | v2-07 |
| BF-5 | Fragment-Summe verrechnet vorzeichenrichtig — Migration am 05.08.2026 angewendet, Juli-Sparrate −1.222,75 → **−322,75 €** (+900,00) | v2-11 |
| BF-2 | Ring-Subzeile vorzeichensicher — ein Textzweig statt zwei, dritte Zeile `genau nach Plan` (E3); Regel in eigener prüfbarer Datei | v2-12 |
| BF-3 | Einkommens-Popup mit Portal repariert — öffnet wieder mittig und in voller Breite | v2-10 |
| BF-1 | KI-Vorschlags-Kästchen aus der Anzeige, Umbruch-Verbot für den Betrag | v2-10 |
| RM-1 | Rohmasse zeigt den Verwendungszweck statt des Empfängers | v2-10 |
| RM-4 | Positionsregel für Overlays in der Design-Doku (§7/§8) | v2-10 |
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
| GE-1 | Gehalt auf die Netto-Kachel ziehbar, Ist-Netto je Monat | v2-19 |
| GE-2 | Treiber-Zeile „Gehalt" ohne Karte | v2-19 |
| KU-1 | Eine Karte im Papierkorb rechnet weiter mit | v2-20 |
| KU-2 | Löschen ist eine Sackgasse (Lösch-Tor + Hinweis) | v2-20 |

---

## 5. Kennungs-Register

Ältere Papiere nennen Themen über ihre Buchstaben-Kennung. Hier steht, wo sie heute leben.

> **Belegte Präfixe, damit ein neues Paket nicht kollidiert** (Stand 24.08.2026):
> `BF` `DA` `GE` `KAT` `KJ` `KU` `LQ` `NAV` `PA` `PF` `RM` `TP` `ZO` `ZU`.
> `KJ` ist am 17.08.2026 für Paket 18 dazugekommen — bewusst nicht `KU`, das gehört
> Paket 16 (August-Kuratierung). **`NAV` ist am 24.08.2026 dazugekommen** und hat
> **kein Paket**: `NAV-1` war beim Eintragen schon erledigt (v2-28). Wer ein
> Navigations-Thema aufmacht, kann das Präfix weiterverwenden.

| Kennung | Heute |
|---|---|
| DA-3 | §4 Erledigt (v2-28) — Nachzug zu `DA-1` |
| ZO-4 | §4 Erledigt (v2-28) · Paket 5 |
| ZO-5 | §4 Erledigt (v2-29) · Paket 5 |
| ZO-6 | Paket 5 — offen, neu aus v2-28 |
| ZO-7, ZO-8 | Paket 5 — beide offen, beide neu aus v2-29 |
| NAV-1 | §4 Erledigt (v2-28) — **stand in keinem Paket** |
| KJ-1 … KJ-5 | Paket 18 |
| A1, A4 · B2, B3, B6 · C1, C2, C3 · H2 · J2 · K1 · M0, M1, M3, M10 · N1–N5 · Init-1–4 | §4 Erledigt |
| A2, A3 · K2 · L1 | §3 Dauerhaft nicht |
| B1, B4, B5 | Paket 11 |
| D1, D2, D3 | Paket 8 |
| E1, E2 | Paket 14 |
| F1, F2, F3 | Paket 5 (unter M6 zusammengefasst) |
| F4, F6, F7 | Paket 12 |
| F5 | Paket 9 (mit M9) |
| G1, G2 | Paket 13 |
| H1, I1, M4 | §2 Hausaufgaben |
| J1 | §4 Erledigt (v2-17) |
| M2, M5 | Paket 7 |
| M6 | Paket 5 |
| M7 | Paket 10 |
| M8, M11 | Paket 14 |
| M9 | Paket 9 |
| RM-1, RM-2 | Paket 2 |
| RM-3 | Paket 9 (Folgepunkt zu F5) |
| RM-4, PA-1 | §2 Hausaufgaben (beide an BF-3 anhängen) |
| LQ-1, LQ-2 | Paket 3 |
| LQ-3 | Paket 9 (Folgepunkt zu LQ-2) |
| KAT-1, KAT-2, KAT-3 | §4 Erledigt (v2-17) — Paket 4 ist damit weggefallen |
| KAT-5 | Paket 7 (Rest aus Record `A2`, in v2-17 nicht gebaut) |
| NB-1, NB-2 | §4 Erledigt (v2-18) — Befunde aus der Nutzung |
| KAT-4 | Paket 10 (mit M7) |

> **Achtung bei älteren Papieren:** Die Paket-Nummern 2–11 aus Fassungen vor der
> Ideen-Runde vom 04./05.08.2026 meinen heute **5–14**; Paket 1 ist unverändert.
> **Ausnahme:** alt 3 (automatische Zuordnung) ist heute **5**, alt 2 (Datenbasis) ist
> heute **6** — die beiden wurden zusätzlich getauscht. Die Buchstaben-Kennungen sind
> von alldem unberührt — sie bleiben die verlässliche Referenz.

**Neue Kennungen seit dem 04.08.2026:** `BF-n` Befunde aus der Nutzung ·
`DA-n` Datenbasis · `TP-n` Übungs-Datenbank · `RM-n` Rohmasse-Lesbarkeit ·
`LQ-n` Liquidität · `KAT-n` Kategorien · `PA-n` Partner-Anteil ·
`B2-F` / `A1-F` Feinschliff zu einem erledigten Thema.

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
kategorien-orientierten Fassung vom 01. Juni 2026 · fortgeschrieben am
05. August 2026 (Ideen-Runde: Idee 1 → Paket 2, Idee 2 → Paket 4 und KAT-4,
Idee 3 → Paket 3 und LQ-3, Idee 4 → PA-1; zusätzlich M6 vor die Kuratierung gezogen)
· fortgeschrieben am 05. August 2026 nach **Sprint v2-10** (`BF-3`, `BF-1`,
`RM-1`, `RM-4` nach §4 gewandert; Paket 2 leer bis auf `RM-2`) · nach der
**Entscheidung E2** (`BF-5` freigegeben) · nach **Sprint v2-11** (`BF-5` erledigt,
Migration angewendet und verifiziert, Juli +900,00 €) · nach **Sprint v2-12** (`BF-2`
erledigt, Entscheidung `E3`) · **zuletzt nach der Entscheidung E1** (05.08.2026) —
**Paket 1 besteht nur noch aus `BF-4`, und der ist seit E1 baubar. Es blockiert keine
Entscheidung mehr Arbeit.*** · fortgeschrieben am 07. August 2026 nach **Sprint v2-16**
(`RM-2`, `PA-1`; Paket 2 leer) · **zuletzt am 08. August 2026 nach Sprint v2-17**
(`KAT-1`, `KAT-2`, `KAT-3` und die Hausaufgabe `J1`; **Paket 4 weggefallen**, damit sind
vier der fünf Kettenglieder fertig und der Riegel vor Paket 5 ist gefallen)*
