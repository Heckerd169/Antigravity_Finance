# Anker-Protokoll Sprint v2-27

> **Alle Werte am 19.08.2026 gegen Produktion (`nflkobdfdhncrtjncpmq`) gemessen.**
> Vorher-Messung, Trockenlauf und Nachher-Messung liegen in **derselben Sitzung** —
> das ist die Messregel aus CLAUDE.md §9, und sie ist der eigentliche Wächter.
> Es gibt seit dem 13.08.2026 **keine eingefrorene Sollwert-Tabelle**; verglichen wird
> gegen den eigenen Vorher-Wert, nicht gegen eine Datei.

---

## 1. Vorher — Ausgangslage

### Sparrate, alle 24 Monate

| Monat | Ist | Plan | | Monat | Ist | Plan |
|---|---|---|---|---|---|---|
| 2025-01 | 4.037,11 | 4.037,11 | | 2026-01 | 1.318,76 | 1.465,36 |
| 2025-02 | 4.037,11 | 4.037,11 | | 2026-02 | 1.667,90 | 1.651,10 |
| 2025-03 | 4.037,11 | 4.037,11 | | 2026-03 | 1.053,42 | 1.381,43 |
| 2025-04 | 4.037,11 | 4.037,11 | | 2026-04 | 1.753,14 | 1.729,58 |
| 2025-05 | 4.037,11 | 4.037,11 | | 2026-05 | −239,10 | −96,40 |
| 2025-06 | 4.037,11 | 4.037,11 | | 2026-06 | 3.509,75 | 3.799,90 |
| 2025-07 | 4.037,11 | 4.037,11 | | 2026-07 | −8,84 | 21,44 |
| 2025-08 | 4.037,11 | 4.037,11 | | 2026-08 | 629,34 | 404,46 |
| 2025-09 | 4.037,11 | 4.037,11 | | 2026-09 | 1.821,59 | 1.821,59 |
| 2025-10 | 4.037,11 | 4.037,11 | | 2026-10 | 1.790,08 | 1.790,08 |
| 2025-11 | 4.037,11 | 4.037,11 | | 2026-11 | 1.821,59 | 1.821,59 |
| 2025-12 | 4.037,11 | 4.037,11 | | 2026-12 | 1.821,59 | 1.821,59 |
| **2025 Summe** | **48.445,32** | | | | | |

**2025 ist in allen zwölf Monaten identisch — Ist = Plan = das volle Netto.** Es sind
dort keine Kosten modelliert; keine der 85 Karten reicht zurück.

### Invarianten vorher

| Anker | Ergebnis |
|---|---|
| **1** — Σ Ordner-Spalte == `calculate_sparrate_for_month` | **24/24 exakt** |
| **2** — Σ delta == Ist − Plan (B2) | **24/24 exakt, 0 Abweichungen** |

### Prüfsummen `md5(pg_get_functiondef(...))` vorher

| Funktion | Prüfsumme |
|---|---|
| `calculate_card_amount_for_month` | `4af07d327f17363e2452b815403e5c89` |
| `calculate_sparrate_for_month` | `68b4954451deb829a5e61d65b1946eaf` |
| `calculate_planned_sparrate_for_month` | `cb2b43af5cc71fd8d1556cefe2ecc51e` |
| `get_effective_plan_for_month` | `b93f894c88b463a5ce76674524641890` |
| `get_category_amounts_for_month` | `e6e0361bcf30a5d56dcaf6b83a32fe97` |
| `get_year_deviation_drivers` | `bfd1111ec392ea446112b234f85efc2c` |
| `get_cards_for_month` | `6394926aff4411f09d569a4f08f4f115` |
| `get_sparrate_series` | `2fa1dfcbad77c5a679c2d902f47691b8` |
| `is_card_active_in_month` | `b57e8a9871caa8d583627d5f9c7eb0b2` |

> **Diese neun Zeilen sind selbst ein Prüfanker.** Der Sprint bewegt Zahlen durch
> **Daten**, nicht durch Logik. Weicht auch nur eine Prüfsumme ab, ist etwas passiert,
> das nicht passieren sollte.

### Fälligkeitsmonate 2026 vorher (für S7)

| Karte | Frequenz | aktiv 2026 |
|---|---|---|
| ADAC Mitgliedsbeitrag | ANNUAL | 07 |
| Aline Geburtstag | ANNUAL | 07 |
| Mitgliedschaftsbeitrag BuMs-NDQ | ANNUAL | 04 |
| Privathaftpflicht | ANNUAL | 04 |
| Reisekrankenversicherung – DKV | ANNUAL | 05 |
| Rundfunkbeitrag | QUARTERLY | 01, 04, 07, 10 |

---

## 2. Trockenlauf — RAISE-Rollback auf Produktion (LL-18)

**Warum auf Produktion und nicht auf der Übungs-Datenbank:** Briefing §7. Kurz: Der
Sprint ändert keine Rechenfunktion, und der synthetische Bestand der Übungs-Datenbank
hat weder 2025-Zahlungen noch eine GEMEINSAM-Karte mit Faktor-Wechsel — also genau den
gefährlichsten Fall nicht. Der Rollback-Trockenlauf prüft die **echten** Daten und
hinterlässt nichts.

**Zwei Läufe, und der erste hat einen Fehler gefunden.**

### Lauf 1 — fand Falle ④ im eigenen Prüfcode

Der Faktor wurde pauschal am Januar genommen. Die Privathaftpflicht beginnt aber im
April: **50,49 € statt 52,47 €** — 3,8 % daneben, und keine Zahl sah falsch aus.
Das ist die Split-Falle in Miniatur, im Code, der sie prüfen sollte.

Korrektur: `get_split_factor(v_user, r.start_m)` — der Faktor des **Startmonats der
Zeile**, nicht des Jahresanfangs.

### Lauf 2 — vollständig grün

| Prüfung | Ergebnis |
|---|---|
| Karten zurückdatiert | **22** |
| Plan-Zeilen geschrieben | **27** (fünf GEMEINSAM-Karten mit zweiter April-Zeile) |
| `cards_assert_initial_plan` (`SET CONSTRAINTS ALL IMMEDIATE`) | **erfüllt** |
| Rhythmus-Wächter | **kein Bruch** |
| Anker 1 über 24 Monate | **0 Brüche** |
| 2026, alle zwölf Monate, Ist und Plan | **identisch zu §1** |
| 2025 Jahressumme | **22.461,00 €** |

### Fälligkeitsmonate 2026 nach dem Trockenlauf (S7)

| Karte | aktiv 2026 | |
|---|---|---|
| ADAC Mitgliedsbeitrag | 07 | unverändert (nicht zurückdatiert) |
| Aline Geburtstag | 07 | unverändert |
| Mitgliedschaftsbeitrag BuMs-NDQ | 04 | unverändert |
| **Privathaftpflicht** | **04** | **zurückdatiert, Monat gehalten** |
| **Reisekrankenversicherung – DKV** | **05** | **zurückdatiert, Monat gehalten** |
| **Rundfunkbeitrag** | **01, 04, 07, 10** | **zurückdatiert, alle vier gehalten** |

> **Das ist der Beleg für Falle ③.** Ohne den Wächter wäre der ADAC auf 2025-10
> gewandert und hätte seinen 2026-Monat von Juli auf Oktober verschoben — zwei
> Monatssparraten vertauscht, ohne dass eine einzige Zahl falsch aussieht.

---

## 3. Erwartung für die Nachher-Messung

**Diese Werte stehen VOR dem Eingriff fest** (§7 Regel 21).

### 2025 — soll sich bewegen

| Monat | erwartet | | Monat | erwartet |
|---|---|---|---|---|
| Januar | 1.849,12 | | Juli | 1.849,12 |
| Februar | 1.890,50 | | August | 1.890,50 |
| März | 1.890,50 | | September | 1.890,50 |
| April | 1.829,39 | | Oktober | 1.859,07 |
| Mai | 1.870,65 | | November | 1.880,55 |
| Juni | 1.880,55 | | Dezember | 1.880,55 |
| | | | **Summe** | **22.461,00** |

Ist **und** Plan sind identisch — nach Phase 2 ist noch nichts verlinkt.

**Die Bewegung: −25.984,32 €** (48.445,32 → 22.461,00).

### 2026 — darf sich NICHT bewegen

Alle zwölf Monate, Ist und Plan, identisch zu §1. **Das ist der schärfste Wächter
dieses Sprints.**

### Warum die Monate unterschiedlich hoch sind

| Monat | Besonderheit |
|---|---|
| Januar, Juli, Oktober | Rundfunkbeitrag (quartalsweise, 31,43 € Anteil) |
| April | Rundfunkbeitrag **und** Privathaftpflicht (29,68 €) → niedrigster Monat |
| Mai | Reisekrankenversicherung DKV (9,90 €) |
| Januar, Mai, Juni, Juli, November, Dezember | Audible (9,95 €) |
| Februar, März, August, September | nur die Grundlast → höchste Monate |

---

## 4. Nachher — nach Anwendung auf Produktion

**Angewendet am 19.08.2026** als Migration `v2_27_da1_karten_2025`, nach ausdrücklicher
Freigabe des Nutzers. Gemessen unmittelbar danach, in derselben Sitzung.

### S1 — 2026 darf sich nicht bewegen

| Monat | Ist | Plan | | Monat | Ist | Plan |
|---|---|---|---|---|---|---|
| 01 | 1.318,76 | 1.465,36 | | 07 | −8,84 | 21,44 |
| 02 | 1.667,90 | 1.651,10 | | 08 | 629,34 | 404,46 |
| 03 | 1.053,42 | 1.381,43 | | 09 | 1.821,59 | 1.821,59 |
| 04 | 1.753,14 | 1.729,58 | | 10 | 1.790,08 | 1.790,08 |
| 05 | −239,10 | −96,40 | | 11 | 1.821,59 | 1.821,59 |
| 06 | 3.509,75 | 3.799,90 | | 12 | 1.821,59 | 1.821,59 |

**Alle 24 Werte identisch zu §1. Kein Monat hat sich bewegt.** ✅

### S2 — 2025 soll sich bewegen

| Monat | Ist = Plan | erwartet | | Monat | Ist = Plan | erwartet |
|---|---|---|---|---|---|---|
| Januar | 1.849,12 | 1.849,12 ✅ | | Juli | 1.849,12 | 1.849,12 ✅ |
| Februar | 1.890,50 | 1.890,50 ✅ | | August | 1.890,50 | 1.890,50 ✅ |
| März | 1.890,50 | 1.890,50 ✅ | | September | 1.890,50 | 1.890,50 ✅ |
| April | 1.829,39 | 1.829,39 ✅ | | Oktober | 1.859,07 | 1.859,07 ✅ |
| Mai | 1.870,65 | 1.870,65 ✅ | | November | 1.880,55 | 1.880,55 ✅ |
| Juni | 1.880,55 | 1.880,55 ✅ | | Dezember | 1.880,55 | 1.880,55 ✅ |

**Jahressumme 22.461,00 €** — auf den Cent wie vorhergesagt.
**Bewegung: 48.445,32 → 22.461,00 €, also −25.984,32 €.**

### S3 bis S8

| # | Prüfung | Ergebnis |
|---|---|---|
| **S3** | Anker 1 — Σ Ordner == Sparrate | **24/24 exakt** ✅ |
| **S4** | Anker 2 — Σ delta == Ist − Plan (B2) | **24/24 exakt, 0 Abweichungen** ✅ |
| **S5** | Neun Prüfsummen | **byte-identisch zu §1, alle neun** ✅ |
| **S6** | Dubletten je `(card_id, effective_month)` | **0** ✅ |
| **S6** | Plan-Zeilen 2025 neu | 27 |
| **S6** | Plan-Zeilen ab 2026 | **85, unverändert** ✅ |
| **S7** | Fälligkeitsmonate 2026 | **alle unverändert** ✅ |
| **S8** | Audible | **6 × 9,95 € · 6 × 0,00 €** ✅ |

### S7 im Einzelnen — der Beleg für Falle ③

| Karte | aktiv 2026 vorher | nachher | |
|---|---|---|---|
| ADAC Mitgliedsbeitrag | 07 | 07 | nicht zurückdatiert |
| Aline Geburtstag | 07 | 07 | nicht zurückdatiert |
| Mitgliedschaftsbeitrag BuMs-NDQ | 04 | 04 | nicht zurückdatiert |
| **Privathaftpflicht** | 04 | **04** | **zurückdatiert, Monat gehalten** |
| **Reisekrankenversicherung – DKV** | 05 | **05** | **zurückdatiert, Monat gehalten** |
| **Rundfunkbeitrag** | 01,04,07,10 | **01,04,07,10** | **zurückdatiert, alle vier gehalten** |

### S8 im Einzelnen

| Monat 2025 | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Audible | 9,95 | 0,00 | 0,00 | 0,00 | 9,95 | 9,95 | 9,95 | 0,00 | 0,00 | 0,00 | 9,95 | 9,95 |

Sechs Zahlungen, sechs Lücken — exakt die Monate, in denen 2025 gezahlt wurde.

---

## 5. Was dieser Eingriff NICHT belegt

**Ein grüner Anker ist hier ein schwächerer Beweis als sonst.** 2025 war vorher in allen
zwölf Monaten identisch (4.037,11 €) und ist es nachher wieder — nur auf anderem Niveau,
und Ist = Plan, weil noch nichts verlinkt ist. Was der Anker zeigt: Die Plan-Zeilen
greifen und 2026 blieb unberührt. Was er **nicht** zeigt: ob die Plan-Beträge inhaltlich
richtig sind.

**Der eigentliche Beleg dafür ist die Split-Rechnung**, und sie ist nachprüfbar: Die Miete
plant 1.817,49 € (Jan–Mär) bzw. 1.888,91 € (ab April) als Haushaltsbetrag, und der eigene
Anteil ergibt in **allen zwölf Monaten** 1.068,44 € — genau den gemessenen Jahresdurchschnitt
der tatsächlichen Zahlungen (12.821,24 € / 12). Wäre der Anteil doppelt angewandt worden,
stünde dort rund 604 €.

**Erst Phase 4 stellt den Anker auf die Probe**, denn dann ersetzen echte Zahlungen den
Plan und Ist und Plan laufen auseinander.

---

## 6. Nach Phase 4 — `ZO-3`, 41 Zahlungen rückwirkend verlinkt

Migration `v2_27_zo3_rueckwirkend_verlinken`, angewendet am 19.08.2026 nach eigener
Freigabe. Erwartung stand vorher fest (Trockenlauf, `sprint_v2-27_zuordnung.md` §6).

| Monat 2025 | nach Phase 2 | erwartet nach P4 | **gemessen** | |
|---|---|---|---|---|
| Januar | 1.849,12 | 1.854,61 | **1.854,61** | ✅ |
| Februar | 1.890,50 | 1.891,42 | **1.891,42** | ✅ |
| März | 1.890,50 | 1.891,42 | **1.891,42** | ✅ |
| April | 1.829,39 | 1.830,31 | **1.830,31** | ✅ |
| Mai | 1.870,65 | 1.871,57 | **1.871,57** | ✅ |
| Juni | 1.880,55 | 1.881,47 | **1.881,47** | ✅ |
| Juli | 1.849,12 | 1.850,04 | **1.850,04** | ✅ |
| August | 1.890,50 | 1.891,42 | **1.891,42** | ✅ |
| September | 1.890,50 | 1.888,02 | **1.888,02** | ✅ |
| Oktober | 1.859,07 | 1.856,59 | **1.856,59** | ✅ |
| November | 1.880,55 | 1.878,07 | **1.878,07** | ✅ |
| Dezember | 1.880,55 | 1.877,90 | **1.877,90** | ✅ |
| **Summe** | 22.461,00 | 22.462,84 | **22.462,84** | ✅ |

**2026: alle zwölf Monate weiterhin identisch zu §1.**

| Prüfung | Ergebnis |
|---|---|
| Anker 1 über 24 Monate | **24/24 exakt** ✅ |
| Anker 2 (B2) über 24 Monate | **0 Abweichungen** ✅ |
| Neun Prüfsummen | **jede trifft ihren eigenen Vorher-Wert** ✅ |
| Verknüpfungen | 411 → **452** (+41, wie geplant) |
| 2025 noch offen | **710** |

### Endstand der Zahlungen

| Jahr | Zustand | Anzahl | trägt Vorschlag |
|---|---|---|---|
| 2025 | offen | 710 | 212 |
| 2025 | verlinkt | 41 | 41 |
| 2026 | offen | 7 (nur Gehalt) | 1 |
| 2026 | verlinkt | 411 | 128 |

Dass verlinkte Zahlungen weiterhin einen Vorschlagsrest tragen, ist der **normale
Zustand** der App — in 2026 gilt es für 128 von 411. Kein Handlungsbedarf.

---

## 7. Ein Fund aus dem Betrieb: ein Client-Timeout ist kein Rollback

**Real passiert in diesem Sprint.** Der Aufruf
`refresh_fragment_suggestions('2025-01-01','2025-12-01')` lief in einen Timeout der
MCP-Verbindung. Die unmittelbar folgende Kontrollabfrage meldete **0 Konfidenzwerte** —
also augenscheinlich ein sauberer Rollback.

**Er war keiner.** Die Datenbank arbeitete weiter und committete; die Kontrollabfrage kam
nur zu früh und sah einen Zwischenstand. Später standen exakt die **253** Vorschläge da,
die auch die unabhängige Messung ergeben hatte. Aufgefallen ist es erst, weil ein
anschließender Monatslauf `vorschlag_gesetzt: 0` meldete — die Werte standen ja bereits.

**Warum es hier harmlos war und trotzdem festgehalten gehört:** Die Funktion schreibt
ausschließlich Anzeige-Spalten, und ihre eingebaute Invariante (Links vorher == Links
nachher) hat gehalten. Bei einer mutierenden Funktion wäre dieselbe Fehlannahme teuer
gewesen: Man hielte einen durchgeführten Eingriff für abgebrochen und führte ihn erneut aus.

**Regel:** Nach einem Timeout ist der Zustand **unbekannt**, nicht „zurückgerollt". Wer
ihn feststellen will, misst nicht sofort, sondern mit Abstand — und prüft die Wirkung, nicht
die Fehlermeldung. Verwandt mit der Log-Ingestion-Falle aus v2-24: Beide Male sieht ein zu
früher Blick wie ein Befund aus.


---

## 8. Nach Phase 6 — die Pläne der GEMEINSAM-Karten korrigiert

**Anlass: eine Korrektur des Nutzers, die einen Konstruktionsfehler aufdeckte.**

Am 19.08.2026 meldete der Nutzer: *„Die Gesamtmiete ist falsch. Wir haben gemeinsam
gezahlt: 01/25 1.820 € · 02/25–01/26 1.861 € · ab 02/26 1.904 €."*

Er hatte recht — und der Fehler war grundsätzlicher als die Miete.

### Was in Phase 2 falsch gemacht wurde

Der Plan wurde als **Jahresdurchschnitt des eigenen Anteils ÷ Split-Faktor** gebildet.
Das hielt den Anteil über zwölf Monate konstant und **erfand dafür einen Haushaltsbetrag,
den es nie gab**: 1.817,49 € (Jan–Mär) und 1.888,91 € (ab April). Echt waren 1.820 € und
dann 1.861 €.

**Die Methode war von Anfang an prüfbar gewesen, und niemand hat sie geprüft.** Die
Rückrechnung *Zahlung ÷ Faktor des Monats* ergibt für Mai–Dez 2025 **exakt 1.861,00 €**,
Monat für Monat ohne Rest — und für Feb–Aug 2026 **exakt 1.904,00 €**, also genau den
heute gültigen Plan. Eine Rechnung, die den **bekannten** Wert reproduziert, war der
bessere Schätzer für den unbekannten. Das hätte in Phase 1 auffallen können.

**Derselbe Fehler steckte in allen fünf GEMEINSAM-Karten**, nicht nur in der Miete. Dort
fiel er auf, weil es die größte Position des Jahres ist.

### Der Nebenbefund: der Januar-2026-Plan war schon vorher falsch

Die Zahlungen zeigen, dass der eigene Anteil **bis einschließlich Januar 2026** mit dem
alten Faktor 0,565636 berechnet wurde; erst ab Februar 2026 gilt 0,572090. Auch der
Haushaltsbetrag stieg erst zum Februar.

Die Plan-Zeile `2026-01` trug jedoch bereits den neuen Betrag — bei Miete, Rechtsschutz
und Strom. **Das stammt aus der Zeit vor diesem Sprint.**

### Was sich bewegt hat

| Monat 2025 | nach P4 | **nach P6** | | Monat | nach P4 | **nach P6** |
|---|---|---|---|---|---|---|
| Januar | 1.854,61 | **1.853,82** | | Juli | 1.850,04 | **1.866,97** |
| Februar | 1.891,42 | **1.867,34** | | August | 1.891,42 | **1.908,07** |
| März | 1.891,42 | **1.867,34** | | September | 1.888,02 | **1.904,67** |
| April | 1.830,31 | **1.850,46** | | Oktober | 1.856,59 | **1.873,52** |
| Mai | 1.871,57 | **1.888,22** | | November | 1.878,07 | **1.894,72** |
| Juni | 1.881,47 | **1.898,12** | | Dezember | 1.877,90 | **1.894,55** |
| | | | | **Summe** | 22.462,84 | **22.567,80** |

| Prüfung | Ergebnis |
|---|---|
| **2026 Ist, alle zwölf Monate** | **unverändert** ✅ |
| 2026 Plan, Januar | 1.465,36 → **1.497,91** (die Korrektur) |
| Anker 1 über 24 Monate | **24/24 exakt** ✅ |
| Anker 2 (B2) über 24 Monate | **0 Abweichungen** ✅ |
| Neun Prüfsummen | **jede trifft ihren Vorher-Wert** ✅ |
| Privathaftpflicht behält Planwert | **52,47 €** ✅ |

**Die Ist-Sparrate 2026 bewegt sich nicht**, obwohl der Januar-Plan korrigiert wurde: Für
alle fünf Karten ist die Januar-Zahlung verlinkt, und bei Fixkosten gewinnt die Realität.

**Der eigentliche Gewinn steht nicht in der Summe:** Der Miete-Anteil beträgt ab April
2025 jetzt **1.052,65 €** — exakt den Betrag, der tatsächlich überwiesen wurde. Vorher
lag der Plan dort systematisch daneben.

### Ein Fehler in der Korrektur, den erst der Trockenlauf fand

Die erste Fassung löschte die Konstruktions-Zeilen über
`WHERE attribution = 'GEMEINSAM' AND effective_month = '2025-04-01'`. Das traf **sechs**
Zeilen statt fünf: Die **Privathaftpflicht** beginnt selbst im April 2025 — ihre
2025-04-Zeile ist keine Konstruktion, sondern ihre **einzige**. Die Karte hätte danach
keinen Planwert mehr gehabt.

**Der Constraint-Trigger hätte das nicht gefangen:** `cards_assert_initial_plan` hängt an
`INSERT`/`UPDATE` auf `cards`, nicht an `DELETE` auf `card_planned_timeline`. Gefunden hat
es allein die Zeilenzahl im Trockenlauf — sechs statt der erwarteten fünf. Die Migration
nennt die fünf Karten deshalb **namentlich** und bricht ab, wenn es nicht genau fünf sind.
