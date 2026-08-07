# Smoke-Test v2-16 — Prüfliste für den Browser

> **Für:** den optischen Abnahme-Durchgang am Rechner (Desktop).
> **Dauer:** rund 15 Minuten. **Stand der Daten:** 07.08.2026, gegen Produktion erhoben.
>
> **Zwei Dinge vorweg, die den Ablauf bestimmen:**
>
> 1. **Prüfe im Juli 2026, nicht im August.** Der laufende Monat hat **null** Buchungen
>    in der Rohmasse — der letzte Import endet im Juli. Juli ist zugleich der einzige
>    Monat, der **alle fünf** Buchungs-Zustände enthält.
> 2. **Teil C schreibt echte Daten.** Er ist der einzige Weg, die Konsequenz-Anzeige zu
>    sehen. Rückweg und Kontrolle stehen dort; bitte den Abschnitt ganz lesen, bevor du
>    ihn startest.

---

## Teil A · Vorbereitung (1 Minute)

| | Was | Erwartung |
|---|---|---|
| **A1** | Dashboard öffnen, Monat **August 2026** (Startzustand) | Ring zeigt **1.761,08 €** |

> **Notiere dir diese Zahl.** Sie ist der Wächter für Teil C — am Ende muss sie wieder
> genau so dastehen.

| | Was | Erwartung |
|---|---|---|
| **A2** | Über die Kopfzeile zurück auf **Juli 2026** | Ring zeigt **−322,75 €** (rot) |
| **A3** | In der Rohmasse rechts den Schalter **„Überträge anzeigen (51)"** einschalten | Die Liste wird deutlich länger |

> Ohne A3 sind Überträge und Umschichtungen ausgeblendet — das ist so gewollt (v2-07),
> aber die halbe Prüfliste unten hinge sonst in der Luft.

---

## Teil B · Das Schaufenster-Popup (`RM-2`)

**Neu ist: jede Buchung in der Rohmasse lässt sich anklicken.** Bis jetzt waren die
grauen (zugeordneten) und die Überträge tot — Klicks passierten einfach nichts.

### B1 · Der Normalfall — wer hat das Geld bekommen?

**Klick auf:** `Miete (Domi)` · **−1.089,26 €** · 1. Juli

| Prüfen | Erwartung |
|---|---|
| Kopfzeile | `BUCHUNG · 1. Juli 2026` |
| **Hauptzeile** | `Dominik Hecker und Aline Nünninghoff` |
| Betrag | `−1.089,26 €` **rechts daneben**, in derselben Zeile, rot |
| Zeile darunter | `Miete (Domi)` |
| Unter dem Strich | `STATUS · Nicht zugeordnet` und `VORSCHLAG · [Kartenname] · 60 %` |

> **Der Kern der Sache:** Auf der Karte in der Rohmasse steht `Miete (Domi)` — der
> *Zweck*. Wer das Geld bekommen hat, stand seit v2-10 **nirgends**. Genau das holt das
> Popup zurück, und deshalb führt der Empfänger und nicht der Betrag.

### B2 · Die Buchung ohne Trennzeichen — eine Zeile fällt weg

**Klick auf:** `Spotify` · **−12,99 €** · 3. Juli

| Prüfen | Erwartung |
|---|---|
| Hauptzeile | `Spotify` |
| Zeile darunter | **entfällt** — da steht nichts, und es klafft keine Lücke |
| Unter dem Strich | `ZUGEORDNET · Spotify`, darunter klein `automatisch erkannt` · `IM MONAT · Juli 2026` |

> **Zwei Dinge auf einmal:** Die Kreditkarte liefert ein einziges Textfeld ohne
> Trennzeichen — dann steht alles in der Hauptzeile und die Zweckzeile fällt weg (kein
> zweites Layout, nur eine Zeile weniger). Und: Diese Zuordnung hat die App **selbst**
> getroffen, ab 95 % Sicherheit. Das Popup ist der einzige Ort, an dem du das erfährst.

### B3 · Der Übertrag — welches meiner Konten war das?

**Klick auf:** `DOMINIK HECKER | Anthropic` · **+107,10 €** · 2. Juli
*(gedimmt, mit grauem `TRANSFER`-Kästchen)*

| Prüfen | Erwartung |
|---|---|
| Kopfzeile | `ÜBERTRAG · 2. Juli 2026` |
| Zeile | `GEGENKONTO · DE.. .... ···· ....` — **verkürzt**, Mitte gepunktet |
| Darunter | `Eigenes Konto — zählt nicht in die Sparrate` |
| **Kein** | Status-Zeile, kein Vorschlag |

### B4 · Der Dreiteiler — nichts darf verlorengehen

**Klick auf:** `ECHTZEIT EURO-UEBERW.` / `Apple (MS Office)` · **−69,99 €** · 2. Juli

| Prüfen | Erwartung |
|---|---|
| Hauptzeile | `DOMINIK HECKER` |
| Zeile darunter | `ECHTZEIT EURO-UEBERW. · Apple (MS Office)` — beide Teile, verbunden mit einem Mittelpunkt |

> Der Text der Bank hat hier **drei** Teile. Der erste führt als Empfänger, die anderen
> beiden bleiben zusammen — es darf nichts abgeschnitten werden, und das Trennzeichen
> der Bank (`|`) darf **nirgends** im Bild auftauchen.

### B5 · Die Umschichtung — eigenes Wort, und ein fehlendes Feld

**Klick auf:** `Effekten` / `SPARPLAN … WKN: A2QMHS` · **−1.000,00 €** · 1. Juli

| Prüfen | Erwartung |
|---|---|
| Kopfzeile | `UMSCHICHTUNG · 1. Juli 2026` — **nicht** „Übertrag" |
| Hinweis | `Von dir als Umschichtung markiert — zählt nicht in die Sparrate` |
| Gegenkonto-Zeile | **fehlt** — diese Buchung hat keine hinterlegte Nummer. Der Hinweissatz steht trotzdem da |

> Eine Umschichtung hast **du** markiert, einen Übertrag hat die App beim Import
> erkannt. Zwei verschiedene Sachverhalte, zwei verschiedene Wörter. Und: Wenn die
> Kontonummer fehlt, verschwindet nur sie — die Aussage bleibt.

### B6 · Eine zugeordnete Buchung

**Klick auf** eine beliebige **graue** Buchung, z. B. `RE20260760 lxoQR` · −189,00 €

| Prüfen | Erwartung |
|---|---|
| Unter dem Strich | `ZUGEORDNET · Privates Budget` · `IM MONAT · Juli 2026` |
| **Kein** | `automatisch erkannt` (die hast du selbst zugeordnet) |

### B7 · Schließen

| Prüfen | Erwartung |
|---|---|
| **Escape** drücken | Popup schließt |
| Klick **neben** das Popup | Popup schließt |
| Im Popup | **keine Knöpfe** — kein Zuordnen, kein Lösen, kein Korrigieren |

---

## Teil C · Was **nicht** passieren darf — der wichtigste Abschnitt

Hier steckt das eigentliche Risiko des Sprints. Die alte Sperre auf grauen Buchungen
und Überträgen hat **dreierlei zugleich** verhindert: Anklicken, Ziehen und das
Aufhellen beim Drüberfahren. Aufgehoben wurde **nur das Anklicken**.

| | Prüfen | Erwartung |
|---|---|---|
| **C1** | Mit der Maus über eine **graue** (zugeordnete) Buchung fahren | Sie bleibt **genauso blass**. Sie hebt sich nicht, sie leuchtet nicht auf. Nur der Mauszeiger wird zur Hand |
| **C2** | Dasselbe über einem **Übertrag** | Ebenfalls unverändert — etwas heller als grau, aber ohne Reaktion |
| **C3** | Eine **graue** Buchung auf eine Karte im Karussell **ziehen** | Lässt sich **nicht** ziehen. Nichts bewegt sich, keine Karte leuchtet auf |
| **C4** | Einen **Übertrag** auf eine Karte ziehen | Ebenfalls **nicht** möglich |
| **C5** | Eine **unzugeordnete** (helle) Buchung ziehen | Funktioniert **wie immer** — die Karte hebt sich beim Drüberfahren, das Ziehen geht |
| **C6** | Bei einem Übertrag auf den kleinen `UMSCHICHTUNG`-Knopf klicken | Er tut, was er immer tat — und öffnet **nicht** zusätzlich das Popup |

> **Merksatz:** anklicken ja · ziehen nein · zuordnen nein.
> Schlägt C3, C4 oder C6 fehl, bitte **nicht mergen** — dann hätte die Aufhebung mehr
> mitgenommen als beabsichtigt.

---

## Teil D · Die Konsequenz-Anzeige (`PA-1`)

> ### ⚠️ Dieser Teil schreibt in die Produktiv-Datenbank
>
> Die Anzeige erscheint nur **nach** einem echten Speichern — es gibt keinen
> Vorschau-Modus. Konkret entsteht ein neuer Einkommens-Eintrag für **August 2026**
> (heute existiert für diesen Monat keiner; der jüngste stammt aus Januar 2026).
>
> **Der Rückweg steht in D5 und D6.** Bitte erst lesen, dann anfangen.

**Wechsle zurück auf August 2026.**

| | Was | Erwartung |
|---|---|---|
| **D1** | Links auf das **ICH**-Label neben dem Ring klicken | Popup öffnet. Jahresbrutto **92.400 €**, Netto **4.165,11** |
| **D2** | **Zuerst nur ansehen: passt das Popup?** | Es ist **schmaler als früher** (400 statt 480 px). Besonders ansehen: die Zeile `Beispiel: gemeinsame Fixkosten 1.200 € → ICH-Anteil …` — bricht sie hässlich um? Steht der Slider gedrängt? |
| **D3** | Brutto-Regler auf **96.000 €** ziehen. **Netto nicht anfassen.** | Split-Vorschau springt auf ICH 58 % · PARTNER 42 % |
| **D4** | **Übernehmen** | Popup **schließt nicht**, sondern tauscht seinen Inhalt |

**Was jetzt dastehen muss:**

| Prüfen | Erwartung |
|---|---|
| Titel | `Dein Anteil steigt` |
| Untertitel | `Split 57,2 % → 58,1 % · ab August 2026` |
| **Große Zahl** | **`+18,98 €`** in **Rot** |
| Darunter | „mehr pro Monat für **vier gemeinsame Posten**. Die Sparrate sinkt um denselben Betrag." |
| Tabelle | Vier Zeilen + `Zusammen`. Spalten `POSTEN · BISHER · KÜNFTIG · DIFF.` |
| Miete | `1.089,26` → `1.107,02` → `+17,76` |
| Zusammen | `1.163,62` → `1.182,60` → `+18,98` |
| Knopf | **genau einer**: `Schließen` — kein „Abbrechen", und er ist **nicht gold** |

> **Rechne die Spalte gern nach:** `Bisher` und `Künftig` gehen auf.
> Die `Diff.`-Spalte addiert sich auf **18,97**, in der Summenzeile steht **18,98** —
> **das ist Absicht.** Drei Spalten lassen sich nicht gleichzeitig zum Aufgehen bringen;
> die Summenzeile stimmt in sich (1.182,60 − 1.163,62 = 18,98) und trägt die Zahl, die
> auch im Beleg vom 05.08. steht.

| | Was | Erwartung |
|---|---|---|
| **D5** | `Schließen`, dann auf den Ring sehen | Sparrate August ist von 1.761,08 € auf **1.742,10 €** gefallen — **genau die 18,98 €**, die das Popup angekündigt hat |

> Das ist die eigentliche Prüfung von `PA-1`: Die Anzeige sagt nicht nur *dass* etwas
> passiert, sondern nennt die Zahl — und der Ring bestätigt sie.

### D6 · Zurücksetzen — bitte nicht vergessen

| | Was | Erwartung |
|---|---|---|
| **D6** | ICH-Label erneut öffnen, Brutto zurück auf **92.400 €**, `Übernehmen` | Das Popup **schließt sofort** — ohne Konsequenz-Anzeige |
| **D7** | Ring prüfen | Wieder **1.761,08 €** |

> **D6 prüft zugleich den „leeren Fall":** Weil der Split danach wieder derselbe ist wie
> vorher, gibt es nichts zu berichten — und dann erscheint **kein** Zwischenbildschirm
> und keine Null-Zeile, sondern das Popup schließt wie früher.
>
> **Ein Rest bleibt:** In der Datenbank steht danach ein August-Eintrag mit 92.400 €.
> Rechnerisch ändert er nichts (derselbe Wert wie geerbt) — aber er würde verhindern,
> dass eine spätere Änderung im Januar nach August durchvererbt. **Sag mir Bescheid,
> dann räume ich ihn weg** (eine Zeile `DELETE`, Freigabe brauche ich von dir).

### D8 · Escape — der alte offene Punkt

| | Was | Erwartung |
|---|---|---|
| **D8** | ICH-Label öffnen, **Escape** drücken | Popup schließt |

> Das ging **seit Sprint 1 nicht** — als einziges von acht Overlays der App.

---

## Teil E · Regression — der teuerste Fehler des Projekts

In v2-10 hat ein Umbau an genau diesem Popup dazu geführt, dass **jeder Klick darin
zusätzlich die Jahres-Welle aufriss** — und die komplette automatische Prüfstrecke
blieb dabei grün. Gefunden hat es erst der optische Durchgang.

| | Was | Erwartung |
|---|---|---|
| **E1** | ICH-Popup öffnen, mitten hinein auf die Überschrift klicken | **Nichts** passiert. Das Jahres-Popup mit der Treppe geht **nicht** auf |
| **E2** | Popup schließen, dann auf die **Welle** im Hintergrund klicken | Jahres-Popup **öffnet** — der Schutz darf nicht zu viel blockieren |
| **E3** | Ein Schaufenster-Popup (Teil B) öffnen und hineinklicken | Ebenfalls **kein** Jahres-Popup |

---

## Wenn etwas nicht stimmt

Notiere **Schritt-Nummer, was du erwartet hast, was passiert ist** — und wenn möglich
ein Bild (`screenshots/2026-08-TT_v2-16-smoke/`, die bleiben lokal).

**Nicht mergen**, wenn C3, C4, C6 oder E1 fehlschlagen — das wären echte Regressionen.
Alles Übrige ist Nacharbeit im selben Branch.

---

*Smoke-Test v2-16 · Antigravity Finance · Prüfliste gegen den Datenstand vom 07.08.2026*
