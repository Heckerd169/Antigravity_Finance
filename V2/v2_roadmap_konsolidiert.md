# Roadmap — Antigravity Finance

> **Was das hier ist:** die einzige Liste offener Themen. Sie ist nach **Sprint-Paketen**
> geordnet — jedes Paket ist ein planbarer Sprint, nicht eine Themenkategorie.
> **Stand:** 17. August 2026 (nach v2-24 — die App reagiert sofort: 233 → ~18
> Netzrunden je Dashboard-Aufbau, kein 504 mehr, keine bewegte Zahl; **neues Paket 17**,
> weil Performance in dieser Datei bis dahin nirgends vorkam). Davor:
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

*Alle Zahlen am 17.08.2026 zeilengenau nachgezählt — nach Sprint v2-24.*

| | Anzahl | nach v2-23 | nach v2-21 | nach v2-20 | nach v2-19 | nach v2-18 | vor v2-18 | vor v2-17 |
|---|---|---|---|---|---|---|---|---|
| Offene Pakete | **11** | 10 | 10 | 10 | 10 | 10 | 10 | 11 |
| Themen darin | **35** | 32 | 32 | 30 | 30 | 29 | 28 | 31 |
| Hausaufgaben ohne eigenen Sprint | **4** | 4 | 6 | 5 | 5 | 4 | 4 | 5 |
| **Offen gesamt** | **39** | 36 | 38 | 35 | 35 | 33 | 32 | 36 |
| Erledigt | **52** | 50 | 49 | 47 | 47 | 45 | 43 | 41 |
| Hinfällig geworden | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 |

> **Stand nach v2-24, zeilengenau ausgezählt.** Paket-Tabellen **48** Zeilen, davon
> **13 ✅** → **35** offen (⬜ 30 · 🟡 5). Hausaufgaben **4**, alle ⬜. §4 Erledigt **52**
> Zeilen. §3 unverändert **4**. Pakete **17**, davon **6** vollständig erledigt
> (1, 2, 3, 4, 15, 16) → **11** offen.
>
> **Die Zahl steigt, und das ist hier das richtige Ergebnis.** v2-24 hat **zwei** Punkte
> erledigt (`PF-1`, `PF-2`) und **drei** neue eingetragen (`PF-3` RLS-Feinschliff ·
> `PF-4` Vercel-Region · `PF-5` Ausweichpfad ungeprüft). Netto +3, plus ein neues Paket.
>
> **Das neue Paket 17 ist der eigentliche Punkt.** Performance kam in dieser Datei
> **nirgends** vor — null Treffer für „Performance", „Ladezeit", „langsam", „Latenz",
> „Reaktion" —, während ein Dashboard-Aufbau 233 Netzrunden machte und die App in
> Produktion in Zeitüberschreitungen lief. Ein Thema, das nicht in der Liste steht,
> konkurriert unsichtbar mit allem anderen und verliert gegen das, was gerade lauter
> ist. Die drei neuen offenen Punkte sind **keine Verschlechterung**, sondern das
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
| ZO-3 | Rückwirkende automatische Verknüpfung ab 0,95 | Feature | ja | ⬜ | **Bewusst nicht Teil von v2-21.** `refresh_fragment_suggestions` schreibt ausschließlich Anzeige-Spalten und verlinkt nie — das ist erzwungen, nicht nur zugesagt. 24 offene Zahlungen in 2026 liegen ≥ 0,95; im Prüfset waren **11 von 11** solcher Fälle richtig. Ob daraus Verknüpfungen werden dürfen, entscheidet der User, **nachdem** er die Vorschläge gesehen hat — Verlinken bewegt die Sparrate rückwirkend über bis zu zwölf Monate. Dann auch zu klären: ob `confidence.history_score` von 0,94 über die Auto-Schwelle steigt. |

---

### Paket 6 · Datenbasis vervollständigen
**Entsperrt:** ehrliche Vorjahreswerte, aussagekräftige Treiber, überhaupt eine
Vergleichsbasis. Ohne dieses Paket bleibt die 2025-Goldlinie irreführend hoch.
**Steht seit dem 05.08.2026 hinter Paket 5**, damit der Marathon von der besseren
automatischen Zuordnung profitiert statt sie vorwegzunehmen.

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| DA-1 | Karten auf 2025 zurückdatieren | Daten | ja (Schreibzugriff) | ⬜ | Ohne sie ist die 2025-Sparrate das **volle Netto** — es sind dort keine Kosten modelliert. Die Vorjahres-Goldlinie (48.445 €) ist dadurch technisch richtig und inhaltlich unvergleichbar. Zugleich Voraussetzung dafür, dass 2025 überhaupt kuratierbar ist (Karten sind dort inaktiv, es gibt keine Ablageziele). **User-Entscheidung offen.** |
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
| PF-3 | `auth.uid()` wird in elf RLS-Policies pro Zeile neu ausgewertet | Fehler | **ja** | ⬜ | Vom Supabase-Linter als WARN gemeldet für `profiles`, `income_timeline`, `cards`, `card_planned_timeline`, `card_monthly_states`, `fragments`, `card_fragment_links`, `deleted_entities`, `card_categories`, `income_fragment_links`. Abhilfe mechanisch (`auth.uid()` → `(select auth.uid())`) und verbilligt **jede** verbleibende Anfrage. **Bewusst nicht in v2-24:** Es sind Zugriffsregeln auf echte Finanzdaten, und der Sprint trug schon zwei Migrationen. Wenn die Änderung doch nicht semantisch identisch ist, ist der Schaden Datensichtbarkeit, nicht Langsamkeit. Dazu zwei fehlende Fremdschlüssel-Indizes: `card_planned_timeline.user_id`, `fragments.suggested_card_id`. |
| PF-4 | Die Vercel-Funktionen standen auf **USA**, die Datenbank liegt in **Irland** | Fehler | nein | 🟡 | **Geprüft und umgestellt am 17.08.2026 vom Nutzer: USA → Frankfurt (`fra1`).** Rund **90 ms** Umweg über den Atlantik fielen damit weg — auf jede einzelne Anfrage. **CLAUDE.md §2 behauptete über ein Jahr das Gegenteil** („Region matched Supabase (eu-west-1)"); die Zeile war nie gegengeprüft worden, und weder Prüfstrecke noch Doku konnte das finden (neu als LL-30 / §6 Stolperfalle 20). **Zwei Reste offen:** ① `fra1` ist gut, aber nicht die genaue Entsprechung — Supabase `eu-west-1` ist **Irland**, Vercel bietet dafür `dub1` (Dublin); Frankfurt liegt rund 20 ms entfernt, Dublin wären wenige Millisekunden. ② Die Einstellung lebt **nur im Vercel-Portal** und ist damit für dieses Repo unsichtbar und bei einem neu angelegten Projekt weg. Festnageln über `export const preferredRegion` oder `vercel.json` — **bewusst noch nicht getan**, solange ① offen ist: Der Code würde sonst den Wert festschreiben, der gerade noch zur Prüfung steht. |
| PF-5 | Der Middleware-Ausweichpfad ist nie ausgelöst worden | Prüfung | nein | ⬜ | Er ist gebaut, typgeprüft und in zwei vollständigen Prüfläufen **nie angesprungen** (0 Warnungen im Server-Log). Das zeigt, dass er nicht im Weg ist — nicht, dass er im Ernstfall greift. Ein Wächter dafür bräuchte einen einspeisbaren Fehlerfall. |

> **Was dieses Paket an Wissen zurückgibt, unabhängig von den Punkten:** Der Anker
> dieses Projekts misst **Richtigkeit**, nicht **Geschwindigkeit**. Ein N+1 kann
> beliebig wachsen, während alle Wächter grün bleiben. Ein datenunabhängiger
> Gegen-Wächter wäre **Anfragen je Dashboard-Aufbau**, zählbar im Supabase-Log über
> `app_config` (genau ein Aufruf je Aufbau). Stand nach v2-24: **~18**.

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

| Kennung | Heute |
|---|---|
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
