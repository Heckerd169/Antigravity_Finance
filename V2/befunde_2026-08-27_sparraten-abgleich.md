# Befunde — Sparraten-Abgleich gegen das Cortal-Consors-Konto

> **Datum:** 27. August 2026 · **Anlass:** Der Nutzer fragte, warum die App für den
> August 2026 eine Sparrate von 507 € zeigt, obwohl er 1.822 € auf sein
> Cortal-Consors-Konto überweisen konnte. Daraus wurden drei Analysen.
> **Art:** Reine Lese-Analyse gegen die Produktiv-Datenbank. **Nichts verändert** —
> keine Migration, kein Code, keine mutierende Abfrage.
> **Status:** Befund. Zwei Datenkorrekturen und vier Logik-Vorschläge warten auf
> Entscheidung.
>
> **Warum dieses Papier existiert:** Es ist die erste **unabhängige Gegenprüfung** der
> Sparrate. Alle bisherigen Prüfanker (§9 CLAUDE.md) messen die App **gegen sich
> selbst** — die Ordner-Spalte gegen die Sparrate, die Treiber-Summe gegen die
> Differenz zweier Sparraten. Sie können deshalb strukturell nicht finden, was hier
> gefunden wurde: eine Buchung, die **richtig erfasst und falsch eingeordnet** ist.
> Der zweite Beleg musste von außen kommen, und er kam vom Kontoauszug des
> Sparkontos.

---

## 0 · Zusammenfassung in zehn Zeilen

1. **Die Rechenlogik der App ist in Ordnung.** Über **20 geprüfte Monate** (12× 2025,
   8× 2026) hält Anker 1 (Ordner-Spalte = Sparrate) **ausnahmslos auf den Cent**.
2. **Gefunden wurden zwei Fehler — beide in den Daten, keiner in der Rechnung**, und
   sie sind exakte Spiegelbilder voneinander.
3. **`SP-1`:** Eine **Scalable-Broker-Auszahlung über 2.414,08 €** ist im Oktober 2025
   als Einnahme gezählt. Die Sparrate 2025 ist um diesen Betrag **zu hoch**.
4. **`SP-2`:** Die Karte **„Autoversicherung 2025"** ist `ANNUAL` **ohne Enddatum** und
   zieht im Januar 2026 **292,53 €** Plan-Kosten ohne jede Zahlung. Die Sparrate ist
   dort **zu niedrig** — und der Fehler **wiederholt sich in jedem künftigen Januar**.
5. **2025 deckt sich NICHT:** App **13.123,31 €** gegen Cortal-Realität
   **10.973,51 €** — Lücke **2.149,80 €** (16 %).
6. **2026 (Jan–Aug) deckt sich:** App **9.269,60 €** gegen **9.762,56 €** — Lücke
   **492,96 €** (5 %), nach Korrektur von `SP-2` nur noch **200,43 €** (2 %).
7. **Die bereinigte Sparquote** liegt bei **25,2 %** (2025) und **29,3 %** (2026
   Jan–Aug), jeweils inklusive privater Altersvorsorge.
8. **Der Sprung erklärt sich fast vollständig aus dem Rennrad:** 2025 kostete es
   **6.190,49 € brutto / 5.560,49 € netto**, davon 2.911,48 € einmalig für das Rad.
9. **Cortal Consors war 2025 kein Sparkonto, sondern ein Durchlaufkonto** — 18.000 €
   flossen weiter an Coinbase, kein einziges Wertpapier wurde dort gekauft.
10. **Vier Logik-Vorschläge** stehen in §7, priorisiert. Der wirksamste ist der
    kleinste: das Händler-Gedächtnis aus v2-29 auf **Transfer-Typen** ausdehnen.

---

## 1 · Die Ausgangsfrage und was sie sichtbar gemacht hat

Der Nutzer bekam am 26.08.2026 sein Gehalt (4.165,11 €) und überwies **1.822,00 €**
auf sein Cortal-Consors-Konto. Die App zeigte für den August eine Sparrate von
**507,10 €**. Die Lücke von **1.314,90 €** war der Anlass.

**Die Frage war falsch gestellt, und genau das war ihr Wert.** Sie unterstellte, die
beiden Zahlen müssten übereinstimmen. Sie messen aber Verschiedenes:

| | misst | Quelle |
|---|---|---|
| **Sparrate** | Einnahmen − Ausgaben eines Kalendermonats | alle drei Konten |
| **Sparüberweisung** | was von einem Konto auf ein anderes geschoben wurde | nur das Girokonto |

Die Frage nach der Deckung dieser beiden Größen ist trotzdem die richtige Frage — nur
eben **über ein volles Jahr**, nicht über einen Monat. Über ein Jahr müssen sie sich
angleichen, sonst stimmt etwas nicht. Genau das hat `SP-1` aufgedeckt.

---

## 2 · Analyse 1 — der August 2026

### 2.1 Die Zahl ist bestätigt

`calculate_sparrate_for_month('…','2026-08-01')` liefert **507,10 €**. Der Plan lag bei
327,46 €; der August war also **besser als geplant**.

**Bemerkenswert:** Die Summe aller 80 August-Fragmente ohne Transfer-Typ ergibt
ebenfalls **exakt 507,10 €**. Der Monat ist vollständig kuratiert — **keine einzige
offene Zahlung**, und kein Plan-Anteil verzerrt das Bild. Die App rechnet hier reine
Realität.

Die Daten sind aktuell: letzte Buchung 27.08., Import um 14:08 Uhr desselben Tages.
Gehalt und Sparüberweisung sind erfasst.

### 2.2 Die Brücke — sie geht auf den Cent auf

| Posten | Betrag |
|---|---|
| Was der August erwirtschaftet hat (= App-Sparrate) | **507,10 €** |
| **+ Guthaben, das am 1. August schon auf dem Girokonto lag** | **+ 1.109,90 €** |
| + „Bergtour" — als `ASSET_REALLOCATION` markiert, zählt nicht als Einnahme | + 355,00 € |
| − Guthaben, das auf die Visa geladen und noch nicht ausgegeben wurde | − 148,77 € |
| − Restbetrag Kreditkartenabrechnung | − 1,23 € |
| **= überwiesen am 26.08.** | **1.822,00 €** |

### 2.3 Die Ursache: der Juli-Aussetzer

**Im Juli 2026 gab es keine Sparüberweisung.** Die letzte davor war am 26.06. über
1.940 €. Entsprechend wuchs das Girokonto im Juli um **977,67 €**, und dieses Guthaben
wurde im August mitgenommen. Der August leerte das Konto um **1.109,90 €**.

**Kumuliert ist das Girokonto 2026 um nur 205,30 € gewachsen** — der Puffer aus Juni
und Juli ist verbraucht. Die 1.822 € sind im September nicht wiederholbar.

### 2.4 Drei Hypothesen, die sich widerlegt haben

Sie werden hier festgehalten, weil ein widerlegter Verdacht beim nächsten Mal Zeit
spart:

- **Kreditkarten-Zeitverschiebung:** widerlegt. Visa-Ausgaben (−489,88 €) und
  Aufladungen (+489,88 €) decken sich **exakt** — der Nutzer gleicht taggleich aus.
- **Seltene Jahres-/Quartalskosten im August:** keine.
- **Ausgaben-Ausreißer:** im Gegenteil. Die Ausgaben-Ordner lagen zusammen **228 €
  unter** dem Schnitt Januar–Juli.

### 2.5 Die Mittelwert-Falle, in die diese Analyse fast gelaufen wäre

Der Ordner **„Rückflüsse"** zeigt im Schnitt Januar–Juli **+682,67 €** pro Monat und im
August nichts — das sah nach der Erklärung aus. **Ist es nicht:** Der Schnitt wird
allein vom Juni (3.180,92 €) getragen, alle anderen Monate liegen zwischen 17,90 € und
100 €. Der Durchschnittswert kommt in **keinem einzigen Monat vor**.

Das ist **LL-37** in freier Wildbahn, diesmal in einer Analyse statt in einer
Migration. Die Konsequenz für alles Folgende: gegen **Einzelwerte** vergleichen, nie
gegen Jahresschnitte.

---

## 3 · Analyse 2 — das Jahr 2025

### 3.1 Die Frage des Nutzers, wörtlich genommen

> Alles, was 2025 mit dem Betreff „Sparen" auf Cortal Consors überwiesen wurde, minus
> alles, was von diesem Konto wieder abgeflossen ist. Broker-Überträge in beide
> Richtungen bleiben draußen. Wertpapierkäufe zählen **nicht** als Abfluss.

### 3.2 Die Cortal-Rechnung

| | |
|---|---|
| 14 Überweisungen „Cortal Consors Sparen" (erste am 03.02., **im Januar keine**) | + 19.985,00 € |
| 27 Rückflüsse aufs Girokonto (Urlaub Japan 1.500 · Bolia Bett 1.000 · Bett 800 · diverse „Ausgleich DKB") | − 7.775,50 € |
| 3 Ausgaben direkt vom Cortal-Konto (Flug Japan 940,75 · Autoversicherung 292,53 · Steuer 2,71) | − 1.235,99 € |
| **= Realität** | **10.973,51 €** |

**Kontrolle:** Alle **58** Cortal-Buchungen wurden einzeln eingeordnet; die Summe der
Klassen ergibt **−4.233,94 €** und damit exakt die tatsächliche Kontobewegung des
Jahres. Es ist nichts durchgerutscht.

### 3.3 `SP-1` — eine Broker-Auszahlung als Einkommen

Im Oktober 2025 zahlte Scalable Capital **2.413,08 €** (plus 1,00 € Testüberweisung)
auf das Girokonto aus. Beide Buchungen sind als **echte Einnahme** erfasst und hängen
an einer INCOME-Karte namens `SCALABLE CAPITAL BROKER AUSZAHLUNG` im Ordner
„Rückflüsse".

**Das ist Geld aus dem eigenen Depot — kein Einkommen.** Und es ist eine
Inkonsistenz, keine Meinungsverschiedenheit:

| Auszahlung | Betrag | erfasst als |
|---|---|---|
| 07.10.2025 | 1,00 € | ❌ Einnahme |
| **14.10.2025** | **2.413,08 €** | ❌ **Einnahme** |
| 05.03.2026 | 2,67 € | ✅ `ASSET_REALLOCATION` |
| 09.03.2026 | 5.533,80 € | ✅ `ASSET_REALLOCATION` |
| 04.05.2026 | 2.722,15 € | ✅ `ASSET_REALLOCATION` |
| 04.08.2026 | 1.601,13 € | ✅ `ASSET_REALLOCATION` |

**Vier von sechs richtig, die beiden aus 2025 falsch — bei praktisch identischem
Buchungstext.** Wirkung: Die Sparrate 2025 ist um **2.414,08 €** zu hoch.

> **Warum das keine Nachlässigkeit war.** Der Buchungstext lautet
> `DOMINIK HECKER | SCALABLE CAPITAL BROKER AUSZAHLUNG`. Absender ist der Nutzer
> selbst, der Betrag ist plausibel, und die App bietet beim Kuratieren **keinerlei
> Hinweis** darauf, dass dieselbe Textform früher schon einmal als Umschichtung
> markiert wurde. Das Händler-Gedächtnis aus v2-29 kennt nur Karten, keine
> Transfer-Typen (§7.2).

### 3.4 Die vollständige Brücke 2025

| | |
|---|---|
| **Cortal-Realität** | **10.973,51 €** |
| 🔴 `SP-1` Scalable-Auszahlung, als Einnahme gezählt | + 2.414,08 € |
| 🟡 Zwei Cortal-Einzahlungen „Weihnachtsgeld" ohne „Sparen"-Betreff | + 300,00 € |
| 🟡 Zinsen auf dem Cortal-Konto (4× „Abschluss") | + 92,55 € |
| 🟡 Visa-Guthaben (+235,29) minus Girokonto-Rückgang (−147,93) | + 87,36 € |
| 🟡 Klarna-Rückzahlung und 1 € Coinbase außerhalb von Cortal | + 47,96 € |
| 🟡 Teil der Scalable-Auszahlung, der auf dem Girokonto blieb | − 14,08 € |
| 🟢 Drei unzugeordnete Einnahmen (2× MAAP 460,00 · PayPal 160,00) | − 620,00 € |
| 🟢 Karten mit Plan über Ist | − 158,07 € |
| **= App-Anzeige 2025** | **13.123,31 €** |

**Bereinigt man nur `SP-1`, schrumpft die Lücke von 2.149,80 € auf 264 €.**

### 3.5 Kontext: Cortal war 2025 ein Durchlaufkonto

- **19.985 €** gingen als „Sparen" ein
- **18.000 €** flossen weiter an **Coinbase** (7 Überweisungen, Krypto)
- **7.776 €** wurden zurück aufs Girokonto geholt
- Das Konto **verlor im Jahr 4.233,94 €**
- **2025 wurde dort kein einziges Wertpapier gekauft** — die erste `Effekten`-Buchung
  ist der Invesco-Sparplan vom **15.04.2026**

Das ist für die Bewertung der Zahlen wichtig: Der Cortal-Kontostand ist 2025 **kein**
Maß für die Sparleistung gewesen.

---

## 4 · Sparquote 2025 und die Rennrad-Frage

### 4.1 Die Einkommensbasis

**48.445,31 €** Nettogehalt (12 einzeln belegte Zahlungen zwischen 4.006,87 € und
4.119,66 €) plus **2.643,49 €** Steuererstattung für 2024 = **51.088,80 €**
verfügbares Einkommen.

> **Methodischer Hinweis:** Der Nenner stammt aus den **tatsächlichen
> Gehaltsfragmenten**, nicht aus dem gepflegten Planwert der `income_timeline`
> (4.037,11 €). Die beiden weichen ab; wer den Planwert nimmt, rechnet mit einer
> Zahl, die in keinem Monat gezahlt wurde.

### 4.2 Der Ordner „Rückflüsse" 2025, vollständig zerlegt

Insgesamt **+10.330,40 €** — nach dem Gehalt die zweitgrößte Einnahmequelle des
Jahres. Er enthält drei völlig verschiedene Dinge:

| Posten | Betrag | Einkommen? |
|---|---|---|
| „DOMINIK HECKER \| 2025-03-24/ULTD/DE/FRANKFURT AM MAIN GRETHENWEG 93" | 4.924,20 € | ✅ vom Nutzer bestätigt |
| Steuerrückerstattung (Veranlagung 2024) | 2.643,49 € | ✅ ja |
| **Scalable Capital Broker Auszahlung** | **2.414,08 €** | ❌ **nein — `SP-1`** |
| Refund MAAP · Bücher-Gutschrift · D-Ticket · TK-Erstattung | 348,63 € | ✅ Ausgaben-Erstattungen |

> **Der 4.924,20-€-Posten war zunächst verdächtig** — Absender ist der Nutzer selbst,
> und die Karte trägt als Namen den **unveränderten Buchungstext**, was auf eine
> unbewusst durchgewinkte Anlage hindeutet. Der Nutzer hat am 27.08.2026 bestätigt:
> **keine Umschichtung.** Der Posten bleibt.

### 4.3 Sparleistung und Quote

| | 2025 |
|---|---|
| App-Anzeige | 13.123,31 € |
| **bereinigt um `SP-1`, alle Zahlungen** | **11.487,30 €** |
| **Sparquote** | **22,5 %** |
| **inkl. privater Altersvorsorge (1.373,20 €)** | **25,2 %** |

> Die **Private Altersvorsorge — Nürnberger** läuft in der App als Ausgabe im Ordner
> „Versicherungen". Wirtschaftlich ist sie Sparen und gehört in den Zähler. Das ist
> **keine** Empfehlung, die App zu ändern (siehe §7.5) — nur eine Einordnung beim
> Interpretieren der Quote.

### 4.4 Was das Rennrad gekostet hat

Gesucht wurde **breit** — über Händlernamen und Ordner, nicht über ein einzelnes
Textmuster. Das war nötig: Das Zwift-Abo liegt außerhalb von „Hobby".

| Block | Betrag |
|---|---|
| **Das Rad** — Specialized über Bike24, 17.03.2025 | **2.911,48 €** |
| Bekleidung & Schuhe — MAAP (663 + 340), DMT Cycling 288,12, Rapha Tokyo 44,40 | 1.335,52 € |
| Teile & Zubehör — Bike24 (3×), BikeFast (2×), Bike-Components, ROSE, Bikebude24 | 772,86 € |
| Indoor-Training — Zwift-Abo 199,99, Wahoo-Ventilator 185,99, Zwift-Fernsteuerung 110, Polar-Pulsgurt 96,81 | 592,79 € |
| Events & Reisen — A.S.O. 137,00, ADAC Cycling Tour Magdeburg inkl. Fahrt/Essen 225,00 | 362,00 € |
| Sport-Ernährung — MNSTRY Fueled by Nature (3×) | 215,84 € |
| **Brutto** | **6.190,49 €** |
| MAAP-Rücksendungen (170,00 + 410,00 + 50,00) | − 630,00 € |
| **Netto** | **5.560,49 €** |

**Nicht mitgezählt**, weil nicht eindeutig Rad: GETPICA.COM (28,99 €), Decathlon
(20,95 €).

**Ohne dieses Hobby:** Sparleistung **17.047,79 €**, Quote **33,4 %** (36,1 % inkl.
Altersvorsorge).

### 4.5 Es war kein Einmaleffekt

| | Hobby gesamt | davon das Rad | **laufend** |
|---|---|---|---|
| **2025** | 6.040 € | 2.911 € | **3.129 €** |
| **2026** (Jan–Aug, hochgerechnet) | 3.149 € | — | **3.149 €** |

Die laufenden Kosten sind **praktisch unverändert**. Die Anschaffung war einmalig, das
Hobby kostet dauerhaft rund **3.100 € im Jahr**.

---

## 5 · Analyse 3 — Januar bis August 2026

### 5.1 Die Cortal-Rechnung

| | |
|---|---|
| 7 Überweisungen „Cortal Consors Sparen" (01/26–08/26, **im Juli keine**) | + 13.384,00 € |
| 1 Überweisung „Sparen Steuer 2025" vom 18.06. | + 2.658,35 € |
| 27 Rückflüsse aufs Girokonto | − 6.265,86 € |
| Steuer-Abzüge auf dem Cortal-Konto | − 13,93 € |
| **= Realität** | **9.762,56 €** |

Ausgeschlossen: **9.834,93 €** Scalable-Überträge und **6.500 €** Coinbase. **Nicht**
abgezogen: **3.500 €** Wertpapierkäufe (5× Invesco-Sparplan) — laut Vorgabe kein
Abfluss.

**Kontrolle:** Alle **51** Cortal-Buchungen einzeln eingeordnet, Summe exakt
**+9.647,35 €** = tatsächliche Kontobewegung.

### 5.2 `SP-2` — die Karteileiche

Der Januar 2026 ist der einzige Monat, in dem App (**1.026,23 €**) und Zahlungssumme
(**1.318,76 €**) auseinanderfallen, ohne dass eine Zahlung offen wäre.

**Ursache:** Die Karte **„Autoversicherung 2025"** —
`FIXED_COST` · `ANNUAL` · `first_active_month = 2025-01-01` · **`last_active_month =
NULL`** — trägt im Januar 2026 einen Plan von **292,53 €** bei **null Zahlungen**.

**Die Versicherung existiert doppelt.** Dieselbe Sache läuft seit dem 29.12.2025 unter
der Karte **„KFZ-Versicherung"** (365,50 €). Die alte Karte wurde nie beendet.

> **Das Gravierende ist nicht der Januar, sondern die Wiederholung.** Weil die Karte
> `ANNUAL` und ohne Enddatum ist, wird sie **in jedem künftigen Januar** erneut
> 292,53 € abziehen — 2027, 2028, unbegrenzt. Der Fehler ist nicht vergangen, er ist
> geplant.

**Geprüft und ausgeschlossen:** Die `ONCE`-Logik ist sauber gebaut. Der Constraint
`once_is_single_month` erzwingt `last_active_month = first_active_month`, und
`is_card_active_in_month` prüft bei `ONCE` auf `p_month = first_active_month`. Es gibt
**keine einzige `ONCE`-Karteileiche**. `SP-2` betrifft ausschließlich `ANNUAL`.

**Sechs weitere Jahreskarten haben dieselbe Bauart** (`ANNUAL`, `last_active_month =
NULL`, bisher genau eine Zahlung): ZWIFT Abo · ADAC Mitgliedschaft ·
Hausratversicherung · KFZ-Versicherung · Privathaftpflicht · Reisekrankenversicherung
DKV · Mitgliedschaftsbeitrag BuMs-NDQ. **Diese sind legitim** — eine Jahresversicherung
soll wiederkehren, und der Plan ist bis zur echten Zahlung die richtige Anzeige. Der
Unterschied zu `SP-2` ist inhaltlich, nicht strukturell: Bei „Autoversicherung 2025"
gibt es einen **Nachfolger unter anderem Namen**. Genau deshalb kann kein rein
technischer Wächter das entscheiden — wohl aber einen Hinweis geben (§7.1).

### 5.3 Die Brücke 2026

| | |
|---|---|
| **Cortal-Realität** | **9.762,56 €** |
| Girokonto-Zuwachs (+205,30) minus Visa-Guthaben-Abbau (−170,82) | + 34,48 € |
| Zinsen und Steuern auf dem Cortal-Konto | + 35,93 € |
| Umschichtungen außerhalb Cortal (Sölden-Rückbuchung, Bergtour, Geburtstagsgeld) | − 214,75 € |
| Visa-Aufladung vom 27.08., Gegenbuchung folgt beim nächsten Import | − 150,00 € |
| Wertpapierkäufe, Coinbase und Scalable-Überträge, netto | + 111,86 € |
| **= tatsächliche Sparleistung Jan–Aug 2026** | **9.617,08 €** |
| 🔴 `SP-2` Karteileiche „Autoversicherung 2025" | − 292,53 € |
| Kleinere Karten mit Plan über Ist (Juni 9,95 · Juli 45,00) | − 54,95 € |
| **= App-Anzeige** | **9.269,60 €** |

### 5.4 Was 2026 sauber ist

- **Keine einzige unzugeordnete Zahlung** in acht Monaten.
- **Kein `SP-1`-Muster.** Die einzigen echten Einnahmen über 300 € sind die
  Steuererstattung 2025 (2.658,35 €), ein Posten „Mama" (500,00 €) und die
  Urlaubs-Verrechnung (344,50 €). Alle vier Scalable-Auszahlungen 2026 sind korrekt
  als Umschichtung markiert.
- Der Ordner „Rückflüsse" (**3.413,33 €**) wurde vollständig in zehn Einzelposten
  zerlegt — keine Umschichtung darunter.

### 5.5 Sparquote und Jahresvergleich

| | **2025** (12 Monate) | **2026** (Jan–Aug) |
|---|---|---|
| Nettogehalt | 48.445,31 € | 33.305,31 € |
| + Steuererstattung | 2.643,49 € | 2.658,35 € |
| **Verfügbar** | **51.088,80 €** | **35.963,66 €** |
| **Sparleistung** | **11.487,30 €** | **9.617,08 €** |
| pro Monat | 957 € | **1.202 €** |
| **Sparquote** | **22,5 %** | **26,7 %** |
| **inkl. Altersvorsorge** | **25,2 %** | **29,3 %** |

**Woher die Verbesserung kommt** (Ordner, pro Monat):

| Ordner | 2025 | 2026 | Veränderung |
|---|---|---|---|
| **Hobby** | −503 € | −262 € | **+241 €** |
| **Urlaub** | −473 € | −237 € | **+236 €** |
| Wohnen | −1.297 € | −1.154 € | +143 € |
| Klamotten | −47 € | 0 € | +47 € |
| Abos & Mitgliedschaften | −287 € | −247 € | +40 € |
| Versicherungen | −300 € | −275 € | +25 € |
| Lebensmittel | −244 € | −284 € | −40 € |
| Mobilität | −194 € | −248 € | −54 € |
| **Geschenke & Anlässe** | −75 € | −322 € | **−248 €** |

Hobby und Urlaub zusammen sind von 976 € auf 499 € pro Monat gefallen — fast exakt der
weggefallene Anschaffungsbetrag des Rades. Dagegen ist „Geschenke & Anlässe" um 248 €
gestiegen (Alines 30. Geburtstag 1.050 €, Konfirmation) und frisst die Hälfte des
Gewinns; das ist erkennbar einmalig.

**Einordnung:** Die Sparquote der privaten Haushalte in Deutschland liegt bei rund
11 %. Der Nutzer liegt beim Doppelten bis Dreifachen. Dieser Durchschnitt enthält aber
Haushalte, die nicht sparen *können* — bei 4.000 € netto und geteilten Wohnkosten sind
30–35 % erreichbar. **Die Kostenbasis ist gesund** (Wohnen 32 % vom Netto, im Rahmen);
der Hebel liegt ausschließlich bei Hobby und Urlaub.

---

## 6 · Die Befunde im Überblick

| Kennung | Befund | Wirkung | Art |
|---|---|---|---|
| **`SP-1`** | Scalable-Broker-Auszahlung Okt 2025 als Einnahme gezählt (2.414,08 €) | Sparrate 2025 **zu hoch** | 🔴 Daten |
| **`SP-2`** | Karte „Autoversicherung 2025" `ANNUAL` ohne Enddatum, Plan 292,53 € ohne Zahlung | Januar **jedes Jahres** zu niedrig | 🔴 Daten |
| **`SP-3`** | Drei unzugeordnete Einnahmen 2025 (2× MAAP 460,00 € · PayPal 160,00 €) | Sparrate 2025 620 € zu niedrig | 🟡 Kuratierung |
| **`SP-4`** | Posten „Mama" 500,00 € (01.06.2026), Text nur „HECKER, DOMINIK \| Bekannt" | ungeklärt | ⚪ Rückfrage |
| **`SP-5`** | „Bergtour" 355,00 € (03.08.2026) als Umschichtung markiert | ggf. +355 € im August | ⚪ Rückfrage |
| **`SP-6`** | Im Juli 2026 keine Sparüberweisung — in der App unsichtbar | Girokonto-Puffer aufgebraucht | 🟡 Verhalten |

**`SP-1` bis `SP-3` sind Datenkorrekturen in der App** — kein Code, keine Migration,
kein Schema-Eingriff. Sie bewegen die Sparrate und müssen deshalb nach §7 Regel 21
(CLAUDE.md) vorher/nachher gemessen werden.

---

## 7 · Vorschläge zur App-Logik

> Vorab, weil es die wichtigste Aussage dieses Papiers ist: **An der Rechenlogik ist
> nichts zu ändern.** Sparrate-Definition, Split-Anwendung, Schlussrundung,
> Kategorie-Aggregation und die `ONCE`-Aktivitätslogik haben 20 Monate Prüfung ohne
> eine einzige Abweichung überstanden. Die folgenden Vorschläge betreffen
> ausschließlich **Wächter und Gedächtnis** — also das, was verhindert, dass eine
> richtig erfasste Buchung falsch eingeordnet wird.

### 7.1 🔴 Ein Wächter für „Plan ohne Zahlung in einem abgeschlossenen Monat"

**Das Problem:** Bei `FIXED_COST` gilt „Realität gewinnt" — fehlt eine Zahlung, zeigt
die App den Plan. Für einen **künftigen** Monat ist das genau richtig (Forecast). Für
einen **vergangenen, vollständig importierten** Monat ist „keine Zahlung" dagegen ein
Fakt und keine Prognoselücke.

`SP-2` hat auf diesem Weg **acht Monate lang** 292,53 € versteckt, ohne dass irgendein
Anker angeschlagen hätte — jede Zahl war richtig.

**Vorschlag:** Eine Karte, die in einem abgeschlossenen Monat einen Plan > 0 trägt und
**null** verknüpfte Zahlungen hat, soll auffallen — als Liste, nicht als Sperre. Der
Zustand **„nicht angefallen"** existiert bereits seit v2-25; hier fehlt nur der
Hinweis, dass er zu setzen wäre.

**Warum kein automatischer Fix:** Ob „nicht angefallen" oder „Zahlung fehlt noch" ist
eine inhaltliche Frage. Die App kann sie nicht entscheiden — sie kann sie aber stellen.

### 7.2 🔴 Das Händler-Gedächtnis auf Transfer-Typen ausdehnen

**Das ist der kleinste und wirksamste Vorschlag dieses Papiers.**

Seit v2-29 merkt sich `history_match` über `af_merchant_key`, **welcher Karte** eine
Zahlung zugeordnet wurde. Es merkt sich **nicht**, dass eine Buchung als
`INTERNAL_TRANSFER` oder `ASSET_REALLOCATION` markiert wurde.

Genau daran ist `SP-1` entstanden: sechs Buchungen mit praktisch identischem
Buchungstext, vier richtig markiert, zwei falsch — und **nichts** in der App wies
darauf hin.

**Vorschlag:** Wurde ein `merchant_key` schon einmal als Umschichtung markiert, soll
die nächste Buchung mit demselben Schlüssel einen entsprechenden **Vorschlag**
bekommen. Die Infrastruktur dafür ist seit v2-29 vollständig vorhanden (Spalte,
Ausdrucks-Index, zweistufiger Vergleich) — es fehlt nur die zweite Anwendung.

> **Achtung, LL-41:** Wer das baut, misst **beides** — die neue Trefferquote **und**
> was heute schon erkannt wird. Ein gröberer Schlüssel fasst mehr zusammen und wird
> dadurch öfter mehrdeutig. Ergänzen schlägt ersetzen.

### 7.3 🟡 Den Ordner „Rückflüsse" auftrennen

Er enthält heute drei Dinge, die nichts miteinander zu tun haben:

| Was | Beispiel 2025 |
|---|---|
| **Echtes Zusatz-Einkommen** | Steuerrückerstattung 2.643,49 € |
| **Erstattung eigener Ausgaben** | MAAP-Rücksendung 170,00 € |
| **Vermögensumschichtung** *(gehört gar nicht hierher)* | Scalable 2.414,08 € |

In einem Topf von **10.330 €** fällt ein falscher Posten von 2.414 € nicht auf.
Getrennt wäre er sofort sichtbar gewesen — und die dritte Zeile wäre als Kategorie
**leer geblieben**, was für sich schon die Warnung ist.

Das ist eine reine Kuratierungs-Entscheidung (`card_categories.sort_order` ist
änderbar, kein Schema-Eingriff, §6 Stolperfalle 14) und kostet nichts.

**Verwandt:** Das `optionspapier_erstattungen.md` vom 24.07.2026 hat für genau diese
Fehlerklasse bereits einen **Leitfaden mit 100-€-Schwelle** beschlossen. Er hat `SP-1`
nicht gefangen — **weil er ein Leitfaden ist und kein Wächter.** Das ist das Argument
für §7.1 und §7.2 in einem Satz.

### 7.4 🟡 Ein Prüfbericht „große Einnahmen, die nicht Gehalt sind"

Beide Fehler wären mit **einer** Abfrage aufgefallen: *Zeig alle echten Einnahmen über
X €, die nicht die Gehaltszahlung sind.* Genau das hat sie in dieser Analyse
gefunden — 2025 sofort, 2026 mit negativem Ergebnis.

Das muss keine Oberfläche sein. Als wiederkehrender Schritt im **Import-Nachlauf**
(`import-db-verifier`) reicht es völlig und kostet fast nichts. Der Agent existiert
bereits und prüft bereits acht Punkte; dies wäre der neunte.

### 7.5 ⚪ Was ich ausdrücklich NICHT ändern würde

- **Die Sparrate-Definition.** Sie ist richtig. Dass sie im einzelnen Monat von der
  Sparüberweisung abweicht, ist kein Fehler, sondern die Trennung von *Ergebnis* und
  *Liquidität*. Über ein Jahr liegen beide 2 % auseinander.
- **Die Altersvorsorge als Ausgabe zu führen.** Sie ist eine Abbuchung wie jede andere;
  sie zum Sparen umzudeklarieren würde die Sparrate von einer messbaren Größe in eine
  Auslegungsfrage verwandeln. Die Einordnung gehört in die Interpretation, nicht in die
  Rechnung.
- **Einen „Ist es angekommen?"-Abgleich** zwischen Sparrate und Sparüberweisung.
  Naheliegend, aber teuer — und die Analyse zeigt, dass die Abweichung über ein Jahr
  nur 2 % beträgt. Der gefühlte Nutzen ist größer als der echte. **`SP-6`** (der
  Juli-Aussetzer) wäre der einzige Fall gewesen, den er gefangen hätte, und den sieht
  man auch am Kontostand.
- **Die `ONCE`-Logik.** Sie ist sauber gebaut und hat keine einzige Karteileiche
  produziert.

### 7.6 Empfohlene Reihenfolge

1. **`SP-1` und `SP-2` korrigieren** (Daten, mit Anker-Messung vorher/nachher)
2. **§7.2** — Händler-Gedächtnis für Transfer-Typen (klein, hoher Nutzen, Infrastruktur
   vorhanden)
3. **§7.3** — Ordner auftrennen (kostenlos, reine Kuratierung)
4. **§7.1** — Wächter „Plan ohne Zahlung" (mittlerer Aufwand)
5. **§7.4** — neunter Punkt im `import-db-verifier` (klein)

---

## 8 · Methodik und Prüfungen

**Alles hier stammt aus Lese-Abfragen gegen die Produktiv-Datenbank
(`nflkobdfdhncrtjncpmq`).** Keine Migration, keine mutierende RPC, kein Schreibzugriff.

**Konto-Zuordnung.** Die Tabelle `fragments` trägt **keine** Konto-Spalte. Die
Zuordnung erfolgte über das Textformat der Importe, das je Quelle verschieden ist:

| Konto | Format (aus `src/lib/*.ts` belegt) | Trennstriche |
|---|---|---|
| **DKB Visa** | Beschreibung unverändert | 0 |
| **DKB Giro** | `{Empfänger} \| {Verwendungszweck}` | 1 |
| **Cortal Consors** | `{Sender} \| {Buchungstext} \| {Zweck}` | 2 |

**Validiert** an drei unabhängigen Kontrollsummen, die jeweils exakt aufgingen:
2025 Cortal −4.233,94 € · 2026 Cortal +9.647,35 € · August 2026 Giro −1.109,90 €.

**Durchgeführte Prüfungen:**

| Prüfung | Ergebnis |
|---|---|
| Anker 1 (Ordner-Spalte = Sparrate), 20 Monate | **20/20 exakt, Abweichung 0,00** |
| Interne Überträge 2025 summieren sich auf null | **0,00 €** — kein Paar fehlt |
| Interne Überträge 2026 Jan–Aug | −150,00 € = die schwebende Visa-Aufladung vom 27.08. |
| Alle 58 Cortal-Buchungen 2025 einzeln klassifiziert | Summe exakt |
| Alle 51 Cortal-Buchungen 2026 einzeln klassifiziert | Summe exakt |
| Ordner „Rückflüsse" 2025 / 2026 vollständig zerlegt | 10.330,40 € / 3.413,33 € |
| Drei Brückenrechnungen | alle **auf den Cent** aufgegangen |

**Bewusst vermiedene Fallen:**

- **LL-35** (Aggregation über ein zu grobes Textmuster): Jede Klassifikation wurde an
  den **Einzelbuchungen** vorgenommen und gegen die Kontobewegung gegengerechnet.
- **LL-37** (Mittelwert verbirgt Sprung): Der „Rückflüsse"-Schnitt von 682,67 € wurde
  als Juni-Artefakt entlarvt, **bevor** daraus eine Erklärung gebaut wurde (§2.5).
- **LL-22** (eine Zusage ist keine Prüfung): Die `ONCE`-Logik wurde **gegen die
  Migration und gegen die Daten** geprüft, bevor §7.5 sie für sauber erklärte.
- **§6 Stolperfalle 16** (Menge vollständig? Zeitpunkt richtig?): Die Rennrad-Suche lief
  über Händlernamen **und** Ordner — nur deshalb wurde das Zwift-Abo außerhalb von
  „Hobby" gefunden.

---

## 9 · Offene Fragen an den Nutzer

1. **`SP-4`** — Was war der Posten **„Mama" über 500,00 €** vom 01.06.2026
   (`HECKER, DOMINIK | Bekannt`)? Geschenk (dann richtig als Einnahme) oder Geld von
   einem eigenen Konto?
2. **`SP-5`** — War die **„Bergtour" über 355,00 €** vom 03.08.2026 wirklich eine
   Umschichtung zwischen eigenen Konten, oder die Erstattung eines Mitfahrers? Im
   zweiten Fall steigt die August-Sparrate auf **862,10 €**.
3. **Sollen `SP-1` bis `SP-3` korrigiert werden?** Alle drei bewegen die Sparrate; die
   Messung vorher/nachher gehört dazu.
4. **Sollen die Vorschläge aus §7 in die Roadmap** (`V2/v2_roadmap_konsolidiert.md`)?
   Sie haben heute **kein Paket** — dieselbe Lage wie Performance vor v2-24.
