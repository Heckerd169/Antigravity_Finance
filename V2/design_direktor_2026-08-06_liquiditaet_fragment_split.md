# Design-Entscheidung — Liquidität, Fragment-Schaufenster, Split-Folgen · 06. August 2026

**Anlass:** Vier Gestaltungsfragen blockierten den Schnitt von `LQ-2`, `LQ-1` (Rest),
`RM-2` und `PA-1`. Alle vier sind hier entschieden.

**Rolle:** `design-direktor`. Der Rollenwechsel wurde ausgesprochen; **Aufwand war in
dieser Runde kein zulässiges Argument** — der User hat das ausdrücklich vorgegeben.

**Vor der Runde angesehen:** `design-system/` (alle fünf Seiten) · Design-Doku §1
(Prinzipien) · §4.5 (Split-Anwendung nach `BF-4`) · §5 (Ring) · §6 (Header) · §7
(Karten) · §8 (Interaktionszone) · §10 (Income) · §11 (Fragment-Karte) · §12 (UI-Copy) ·
`V2/design_direktor_block_1_entscheidungen.md` · `V2/design_direktor_gemeinsame_karte.md` ·
`V2/befunde_2026-08-05_liquiditaet.md` · `sprints/sprint_v2-10_offene_fragen.md` §5 ·
dazu der laufende Code (`interaction-zone.module.css`, `cards.module.css`,
`singularity-ring.module.css`, `tokens.css`) und die Migration
`20260806_v2_14_lq1_faelligkeitstag.sql`.

**Kein Widerspruch** zu früheren Entscheidungen gefunden. Zwei Sachkorrekturen am
Ausgangsstand sind unten unter „Nebenbefunde" vermerkt.

**Anschauungsmaterial:** vier Entwurfsseiten unter `design-system/entwuerfe/`, jede mit
genau drei Varianten (siehe „Verfahrensbeschluss" am Ende).

---

## 1 · `LQ-2` — die Ausstehend-Anzeige

### 1.1 Ort: rechtsbündig in der Kopfzeile der Zone „Planung"

**Entscheidung:** Die Zahl steht in derselben Zeile wie die Zonen-Überschrift
„Planung", rechtsbündig.

**Begründung:** Es gibt dafür bereits ein Muster — seit v2-07 (`C1`) sitzt der Schalter
„Überträge anzeigen (N)" genau so in der Kopfzeile der Rohmasse. Gleiche Höhe, gleiches
Muster, **kein neuer Bereich auf dem Schirm**. Und die Zahl steht unmittelbar über den
Karten, aus denen sie entsteht: Zuordnung durch Nähe, wie schon bei `von X €` auf der
gemeinsamen Karte.

**Rangfolge-Prüfung:** Der User hat die Frage *„Grund die App zu öffnen oder Auskunft
nebenbei?"* mit **„Auskunft nebenbei"** beantwortet. Damit ist die Kopfzeile der
richtige Rang — die Sparrate bleibt unangefochten die eine primäre Zahl.

**Verworfen:**
- *Eigener Streifen zwischen Ring und Karten:* ein vierter waagerechter Bereich, und
  bei ~17 px Zifferngröße so nah unter der Ringzahl, dass zwei Beträge um den Rang
  streiten. Wäre die richtige Wahl gewesen, wenn die Zahl der Öffnungsgrund wäre.
- *Vierte Zeile im Ringzentrum:* Das Zentrum trägt heute drei Zeilen (Zahl, „SPARRATE",
  Verhältnis). Eine vierte macht daraus einen Textblock mit zwei ähnlich gewichteten
  Beträgen untereinander — der direkteste Bruch mit „ein Screen, ein Monat, **eine**
  primäre Zahl".

### 1.2 Wortlaut: zwei Angaben, zwei verschiedene Wörter

**Entscheidung:** `1.814 € noch fällig · 590 € Budget frei`

**Begründung:** Befund `L7` verlangt, fest und Budget nie als eine Zahl zu zeigen. Zwei
Zahlen nebeneinander mit **demselben** Wort darüber laden aber genau zum Addieren ein —
die Trennung hält erst, wenn die beiden Angaben verschieden **heißen**. „fällig" trägt
den Termin und damit die Vorhersage, die der Fälligkeitstag hergibt; „frei" ist bereits
die Vokabel der Budget-Karte (`Noch [N] € frei`, §12.3). Beide Begriffe stehen schon im
Wortschatz, es wird keiner erfunden.

**Verworfen:**
- **„offen"** — belegt bereits den Zustandsnamen der Fixkosten-Karte (§12.3) *und* die
  Header-Flanke (`[N] Fragmente offen`, §12.2). Das wäre die dritte Bedeutung desselben
  Wortes.
- **„ausstehend"** — neues Substantiv ohne Anschluss an den Wortschatz; dasselbe
  Argument, das am 05.08. gegen „Haushalt" auf der Karte entschieden hat. Zusätzlich
  klingt es nach Feststellung, während die Aussage eine Vorhersage ist.

**Keine Summe.** 1.814 € sind Termine, 590 € sind eine Erlaubnis: Ein Budget lässt sich
zurückhalten, ein Dauerauftrag nicht. Eine gemeinsame Zahl `2.404 €` machte beides zur
Verpflichtung und wäre in der Sache falsch (`L7`).

---

## 2 · `LQ-1` — der Fälligkeitstag auf der Karte

### 2.1 Er wird angezeigt — und zwar rechtsbündig in der Statuszeile

**Entscheidung:** Die Statuszeile bekommt zwei Enden: links der Zustand, rechts der
Termin. `Offen ····· am 1.` **Keine neue Zeile, keine zusätzliche Kartenhöhe.**

**Begründung, warum überhaupt sichtbar:** Die 17 Werte sind **abgeleitet** — aus der
Buchungshistorie gelesen, nie vom User bestätigt — und steuern ab `LQ-2` eine Zahl auf
dem Dashboard. Ein geratener Wert, der eine sichtbare Zahl treibt und selbst unsichtbar
ist, ist genau die Bauart, aus der die Befunde vom 04.08. entstanden sind
(**Ehrlichkeit vor Beruhigung**).

Dazu ein Fall, der ohne den Tag wie ein Fehler aussieht: Eine Karte kann **„Offen"**
sein und trotzdem **nicht mehr** in „noch fällig" zählen, weil ihr Termin verstrichen
ist. Am 6. August steht die Miete auf „Offen" (kein Umsatz verknüpft), war aber am 1.
fällig und ist längst abgebucht. Steht der Tag auf der Karte, erklärt sich das selbst.

**Begründung für den Ort:** Zustand und Termin gehören zusammen und werden durch
**Position** getrennt statt durch ein Trennzeichen. Alle Karten behalten ihre Maße —
die Vorgabe aus der Runde vom 05.08. (*„ALLE Karten müssen am Schluss die gleichen Maße
haben"*) bleibt unberührt, weil keine Zeile hinzukommt.

**Verworfen:**
- *Eigene Zeile unter dem Status:* kostet 12 px Höhe auf **allen** Karten, auch denen
  ohne Tag. Eine Budget-Karte trüge dann **zwei** dauerhaft leere reservierte Zeilen
  (Haushaltsbetrag + Termin), von denen sie keine je füllt. Und der Betrag stünde über
  drei kleinen Textzeilen statt über zweien.
- *Nur im Overlay, gar nicht auf der Karte:* der abgeleitete Wert bliebe unsichtbar,
  bis man jede Karte einzeln öffnet — und der Fall oben bliebe unerklärt.
- *In der Attributions-Zeile:* aus demselben Grund verworfen wie am 05.08. der
  Haushaltsbetrag — die Meta-Zeile liegt bei Deckkraft `.20` und wäre gerade nicht
  „auf einen Blick".

### 2.2 Die drei Randfälle

| Fall | Anzeige |
|---|---|
| **Budget-Karte** | rechts bleibt **leer**. `due_day` ist dort per Migration `NULL` — ein Budget ist eine Erlaubnis ohne Termin (`L7`). Die Leerstelle **ist** die Aussage. |
| **Fixkosten/Einnahme ohne Tag** (keine Historie, z. B. Friseur) | rechts bleibt **leer**. Kein „—", kein Platzhalter. |
| **Karte bereits bezahlt** | Tag **bleibt stehen**. Er ist eine Eigenschaft der Karte, kein Zustand; verschwände er beim Bezahlen, spränge die Zeile und der Wert wäre genau dann nicht mehr prüfbar, wenn man ihn gegen den echten Umsatz halten will. |

### 2.3 Geändert wird er über einen eigenen Menüpunkt „Fällig am …"

**Entscheidung:** Neuer Eintrag im Karten-Kontextmenü, mit kleinem Overlay (Tag im
Monat + Option „Kein fester Tag"). **Auf Budget-Karten erscheint der Eintrag nicht.**

**Begründung:** Das ist keine Platz-, sondern eine Bedeutungsfrage. In „Betrag anpassen"
gilt alles entweder *nur dieser Monat* oder *dauerhaft ab diesem Monat* — eine reine
Monats-Semantik. Der Fälligkeitstag steht dagegen in `cards` und gilt **immer**; er
kennt keine Monatsabgrenzung. Zwischen die beiden Optionen gesetzt, entstünde eine
Frage, die die Oberfläche nicht beantwortet: *gilt der neue Tag nur für August?* Genau
die Sorte stiller Widerspruch, gegen die §7 Regel 10 geschrieben wurde.

**Verworfen:** Erweiterung von „Betrag anpassen" um ein Feld (siehe oben).

**Empfehlung an den Bau-Sprint, nicht hier entschieden:** Das Overlay sollte in einem
Satz nennen, woher der Wert stammt (*„Aus deinen Buchungen abgeleitet — 19 Monate,
immer am 1. bis 4."*). Das ist Ehrlichkeit über einen geratenen Wert, kostet eine Zeile
und keine Spalte.

---

## 3 · `RM-2` — das Schaufenster-Popup für ein Fragment

### 3.1 Der volle Text führt

**Entscheidung:** Hauptzeile ist der **Empfänger** (erster Teil der Beschreibung), der
**Betrag steht rechts in derselben Zeile**, das **Datum wandert in die Kopfzeile**, der
**Verwendungszweck** steht ungekürzt darunter.

**Begründung:** `RM-1` hat der Fragment-Karte den Empfänger genommen — sie zeigt seit
v2-10 den Verwendungszweck. Der Empfänger ist damit **nirgends mehr sichtbar**. Das
Popup ist deshalb nicht „die Karte in groß", sondern der einzige Ort, an dem steht, wer
das Geld bekommen hat. Die Hauptzeile beantwortet damit exakt die Frage, mit der man
klickt: *„wer war das?"* Beim Übertrag steht dort „DKB Visa" — und die Frage ist sofort
erledigt.

**Verworfen:**
- *Betrag als Held:* derselbe Held wie auf der Karte, also null Wiedererkennungsaufwand
  — aber das Popup wiederholte damit als Held, was man schon wusste, und beantwortete
  die Frage, wegen der man geöffnet hat, erst in Zeile zwei.
- *Rohtext in Maschinenschrift:* das Trennzeichen `|` ist ein Bank-Artefakt und gehört
  nicht ins Bild; Maschinenschrift bricht mit §1 („Apple-Ästhetik, maximale
  Reduktion"). **Ihr Wert lag woanders:** Sie hat eine echte Schwäche der beiden anderen
  offengelegt — beide unterstellen, dass der erste Textteil immer der Empfänger ist. Bei
  DKB Giro stimmt das (`Empfänger | Zweck`), bei Cortal sind es drei Teile
  (`Sender | Buchungstext | Zweck`), bei DKB Visa gibt es keine Trennung.

### 3.2 DKB Visa: die Zweck-Zeile fällt weg

**Entscheidung:** Enthält die Beschreibung kein Trennzeichen, steht der gesamte Text in
der Hauptzeile und die Zweck-Zeile **entfällt**.

**Begründung:** Ein Umschalten auf ein anderes Layout hieße, zwei Popups unter einem
Namen zu führen. Eine wegfallende Zeile ist ruhiger als ein springender Aufbau.

### 3.3 Rangfolge unter dem Strich

**Entscheidung — eine Regel:** *erst was immer gilt, dann was den Zustand erklärt, dann
was selten vorkommt.*

1. **Datum** (in der Kopfzeile)
2. **Status** bzw. die **zugeordnete Karte**
3. **Gegenkonto** — nur bei Übertrag, mit dem Hinweis „Eigenes Konto — zählt nicht in
   die Sparrate"
4. **KI-Vorschlag** — nur bei unzugeordnetem Fragment

**Nicht im Popup:** Duplikat-Hash und Import-Zeitpunkt. Beides ist Maschinerie und
beantwortet keine Frage, die man beim Klicken hatte.

---

## 4 · `PA-1` — die Konsequenz-Anzeige beim Einkommens-Eintrag

### 4.0 Die Rahmung, aus der alles Weitere folgt

Nach §4.5 (Stand nach `BF-4`) wird der Split **nur** auf Beträge aus *Plan* oder
*Anpassung* angewandt, nie auf einen realen Umsatz. Was die Liste zeigt, ist also der
**künftige Plan-Anteil** — und §4.5 sagt selbst, wozu der gut ist: *„die Karte zeigt
dann unmittelbar, auf welchen Betrag der Dauerauftrag zu stellen ist."*

Die Anzeige ist damit keine Buchhaltungs-Quittung, sondern eine **Handlungsliste**.
Diese Rahmung war der Maßstab für alle fünf Teilentscheidungen.

### 4.1 Nach dem Speichern tauscht das Popup seinen Inhalt

**Entscheidung:** Derselbe Rahmen, neuer Inhalt. **Held ist nicht die Liste, sondern
die Summe:** `+18,98 €`, darunter *„mehr pro Monat für vier gemeinsame Posten. Die
Sparrate sinkt um denselben Betrag."* Die vier Zeilen belegen sie nur.

**Begründung:** Ursache und Wirkung an einem Ort, ohne Ortswechsel des Blicks. Die
Summe beantwortet die Frage sofort, die Liste die Rückfrage „bei welchen?" — und
niemand muss eine Tabelle lesen, der es nicht will.

**Verworfen:**
- *Toast unten Mitte:* trägt keine fünf Zeilen und verschwindet nach Sekunden. Genau
  die Handlungsliste wäre damit weg, also der Zweck der ganzen Anzeige.
- *Vorschau vor dem Speichern:* die ehrlichere Reihenfolge — man sähe die Folge, bevor
  man sie auslöst. Scheitert aber am Brutto-Slider: 100-€-Schritte von 20.000 bis
  150.000, die Tabelle darunter flimmerte bei jeder Bewegung. Das ist das Gegenteil von
  „Ruhe vor Betonung", und das Popup bliebe dauerhaft hoch, auch wenn man nur das Netto
  tippen wollte.

### 4.2 Ein Knopf statt zweier: `Schließen`

**Entscheidung:** Im Ergebnis-Zustand gibt es **einen** Knopf mit der Beschriftung
`Schließen`. Neuer Eintrag in §12.7.

**Begründung:** „Abbrechen" ist hier sinnlos — es gibt nichts mehr abzubrechen;
„Übernehmen" ist bereits geschehen. `Schließen` ist das nüchternste Wort, trägt keine
Bewertung und benennt die einzige verbleibende Handlung.

### 4.3 Spalten: `Bisher / Künftig / Diff.` — alle drei Zahlen

**Entscheidung des Users, gegen die Empfehlung der Rolle.** Alle drei Zahlen erscheinen;
das Popup wird dafür breiter (**340 → 400 px**).

**Begründung (User):** Der Ausgangswert muss sichtbar sein. — Sachlich trägt das: Eine
Änderungs-Anzeige, die den alten Wert weglässt, verlangt, dass man ihn im Kopf behält.
*Nachschlagen* auf der Karte ist nicht dasselbe wie *vergleichen*.

**Zulässigkeit der Breite:** §7 (`RM-4`) schreibt für Overlays den **Ort** fest, nicht
die Größe — wörtlich *„sie unterscheiden sich in der Größe, nie im Ort"*. Eine breitere
Fläche ist damit ausdrücklich kein Regelbruch.

**Mitentschieden — beide Zustände sind gleich breit.** Auch der Eingabe-Zustand bekommt
400 px. Ein Overlay, das beim Übernehmen unter der Hand wächst, wäre unruhig.

**Verworfen:**
- *Nur `Künftig` + `Diff.`* (die Empfehlung der Rolle): acht Zahlen statt zwölf, und die
  Überschrift „Dauerauftrag umstellen auf" wäre eine Anweisung statt einer Beschriftung.
  Vom User verworfen, weil der Vergleichswert fehlt.
- *`Vorher / Nachher / ±`*: „±" hat im UI-Wortschatz kein Gegenstück, und
  „Vorher/Nachher" klingt nach Vergangenheit, obwohl die Aussage nach vorn zeigt.
  „Künftig" trägt dagegen die Forward-Inheritance-Semantik korrekt.

### 4.4 Der leere Fall: gar nichts

**Entscheidung:** Ändert sich der Split nicht — etwa weil nur das Netto angepasst wurde
— oder gibt es keine gemeinsamen Posten, **speichert das Popup und schließt wie heute**.
Kein Zwischenbildschirm, keine Null-Zeile, kein „Keine Änderungen".

**Begründung:** §7 Regel 17 (`LL-20`) — *ein Referenzwert ohne Daten ist „keine
Anzeige", nicht 0.*

**Hinweis:** Das Netto ändert die Sparrate trotzdem. Diese Anzeige handelt aber vom
**Split**; die Sparrate steht ohnehin im Ring, sobald das Popup zu ist.

### 4.5 Gemeinsame Einnahmen zählen mit

**Entscheidung:** Ja — in **derselben** Liste, mit dem Vorzeichen, das ihnen zusteht.
Keine eigene Gruppe, keine Zwischensumme.

**Begründung:** Eine gemeinsame Einnahme wird nach §4.5 genauso gesplittet wie eine
gemeinsame Ausgabe; sie wegzulassen machte die Summe falsch. Heute existiert keine
solche Karte — die Frage ist latent, muss aber entschieden sein, **bevor** die erste
angelegt wird, sonst fehlt sie stillschweigend. Eine eigene Gruppe wäre Aufbau für einen
Fall, den es nicht gibt; das Vorzeichen trägt die Aussage bereits.

---

## Abgleich gegen die fünf Grundsätze

| Grundsatz | Urteil |
|---|---|
| **Ein Screen, ein Monat, eine Zahl** | ✓ `LQ-2` bewusst in die Zonen-Kopfzeile statt neben den Ring — die Rangfolge-Frage wurde ausdrücklich gestellt und mit „Auskunft nebenbei" beantwortet. Die drei Ring-Zeilen bleiben unberührt. |
| **Schmale Palette** | ✓ keine neue Farbe, kein neuer Token in allen vier Entscheidungen. Türkis/Rot/Gold/Blau behalten ihre Bedeutung. |
| **Ruhe vor Betonung** | ✓ `LQ-1` kostet **keine** Kartenhöhe · `LQ-2` nutzt die bestehende Kopfzeile · `PA-1` verwirft die flimmernde Live-Vorschau. Einziger bewusster Dichte-Zuwachs: das 400-px-Popup — vom User abgewogen und gewollt. |
| **Werkzeug ist nicht Produkt** | ✓ nichts Reglerhaftes; Hash und Import-Zeitpunkt bleiben aus dem Schaufenster. |
| **Ehrlichkeit vor Beruhigung** | ✓ **trägt diese Runde.** Der abgeleitete Fälligkeitstag wird sichtbar statt versteckt; der leere Fall zeigt nichts statt 0,00 €; das Schaufenster nennt beim Übertrag das eigene Konto; die Konsequenz-Anzeige sagt, was die Gehaltsänderung **kostet**, statt nur den neuen Split zu melden. |

---

## Nebenbefunde aus dieser Runde

1. **`PR #15` war bereits gemerged**, nicht offen — `cards.due_day` liegt auf
   `origin/main` (Commit `576ea43`).
2. **Das lokale `main` des Users stand auf v2-09**, 46 Commits hinter `origin/main`,
   ohne eigene Commits. Reines Nachziehen per `git pull --ff-only`; aus der isolierten
   Sitzung heraus technisch gesperrt, deshalb an den User übergeben.
3. **`design-system/README.md` war an zwei Stellen sachlich falsch:** Es behauptete, der
   Design-Direktor arbeite in einem eigenen Chat (seit 04.08. eine Rolle), und führte
   drei offene Punkte, die v2-10 und v2-12 erledigt haben. Beides mit korrigiert.

---

## Verfahrensbeschluss — die Drei-Varianten-Regel

**Entscheidung des Users, 06.08.2026:** `design-system/` darf Ideen und Vorschläge
enthalten. Das frühere Verbot (*„Keine Ideen, keine Vorschläge, keine Varianten"*) ist
aufgehoben. **Jede offene Gestaltungsfrage bekommt genau drei Varianten.**

Festgeschrieben in `design-system/README.md` mit sieben Regeln: genau drei als A/B/C ·
eine als Empfehlung markiert · zu jeder was sie kostet **und** was sie bringt ·
eine Variante darf bewusst die schlechte sein, wenn sie belegt, warum eine Regel gilt ·
maßstäblich und im Kontext · echte gemessene Werte · sichtbarer Hinweis „kein
Ist-Zustand".

**Begründung für die Zahl drei:** Zwei sind eine Ja/Nein-Falle — die zweite Variante
dient meist nur dazu, die erste gut aussehen zu lassen. Vier oder mehr sind ein Katalog
zum Selbststudium. Drei zwingen dazu, eine echte Gegenposition zu bauen und trotzdem zu
empfehlen.

**Lebensdauer der Entwürfe:** Eine Seite unter `entwuerfe/` lebt, bis die Entscheidung
gebaut ist. Danach wandert das Ergebnis nach `komponenten/` (Ablauf: `SYNC.md`) und der
Entwurf wird **gelöscht**. Dieser Record ist das Gedächtnis, nicht der Ordner.

---

## Was NICHT entschieden wurde

- **Ob die Anzahl der Posten in `LQ-2` mitsteht** („18 Posten"). Wäre eine dritte und
  vierte Zahl in der Kopfzeile. Als offene Frage in den Bau-Sprint.
- **Was `LQ-2` in einem Zukunftsmonat zeigt.** Die Frage „reicht mein Geld" hat im
  November keinen Sinn. Muss vor dem Bau geklärt werden — auch „nichts anzeigen" ist
  eine zulässige Antwort.
- **Ob eine Karte kenntlich macht, dass ihr Fälligkeitstag nur abgeleitet und nie
  bestätigt ist.** Das wäre eine weitere Spalte und gehört nicht in eine
  Gestaltungsrunde.
- **Ob die IBAN im Schaufenster vollständig oder verkürzt steht.**
- **Ob der KI-Vorschlag im Schaufenster seinen Prozentwert mitbringt.** Er war der
  Anlass, warum die Badges von der Karte verschwanden (`BF-1`); eine Zahl ohne Erklärung
  könnte denselben Ärger erzeugen.
- **Die Schließ-Geste des Einkommens-Popups.** `sprints/sprint_v2-10_offene_fragen.md`
  §6 hält fest, dass es als einziges von acht Overlays keinen Escape-Handler hat.
  Empfehlung dort: ja, angleichen. Das Schaufenster (`RM-2`) sollte ihn von Anfang an
  haben. **Bauauftrag, keine Gestaltungsfrage.**
- **`M2`** (Verben und Gesten des Karten-Lebenszyklus), **`M5`** (Kartenreihenfolge) und
  **Paket 4** (Kategorien im Karussell) — nicht Gegenstand dieser Runde.

---

## Was das entsperrt

| Thema | Status danach |
|---|---|
| **`LQ-2`** | vollständig schneidbar — Ort, Wortlaut, Trennung stehen. Offen nur die zwei Punkte oben (Posten-Anzahl, Zukunftsmonat). |
| **`LQ-1`** (Rest) | vollständig schneidbar — Anzeige, drei Randfälle, Änderungs-Geste stehen. Die Datenbank-Seite ist mit v2-14 bereits erledigt. |
| **`RM-2`** | vollständig schneidbar. **Achtung:** ändert §8 — zugeordnete Fragmente und Überträge sind heute per `pointer-events: none` tot gestellt und werden klickbar. |
| **`PA-1`** | vollständig schneidbar — alle fünf offenen Punkte aus `sprint_v2-10_offene_fragen.md` §5 sind beantwortet. Die Rechnung war bereits belegt. |

**Kein Datenbank-Eingriff** in allen vier Themen: `LQ-1` ist mit v2-14 fertig, die
übrigen drei sind reine Anzeige. Der pausierte Zustand der Übungs-Datenbank blockiert
hier nichts.

---

## Doku-Folge

Patch über den `docs-maintainer` nach §7 Regel 14 (LL-16), mit Versions-Bump. Die
Design-Doku steht auf **v3.2.0** (v2-13, `BF-4`) → Ziel **v3.3.0**.

**Minor-Bump, kein Patch-Bump.** Begründung nach dem Vorbild von v3.2.0: Es werden
nicht nur Beschreibungen nachgezogen, sondern vier neue Spezifikationen aufgenommen —
und **§8 hebt eine bestehende Regel auf** (`pointer-events: none` auf zugeordneten
Fragmenten und Überträgen entfällt, beide werden klickbar).

| Was | Wohin |
|---|---|
| Ausstehend-Anzeige: Ort in der Kopfzeile „Planung", zwei getrennte Angaben, nie eine Summe | Design-Doku **§8** („Karussell (Mitte)") |
| Copy `[N] € noch fällig` / `[N] € Budget frei` | Design-Doku **§12** — neuer Eintrag, Vorschlag: eigener Block §12.9 „Liquidität" |
| Fälligkeitstag: rechter Anschlag der Statuszeile, drei Randfälle, bleibt bei „bezahlt" | Design-Doku **§7** („Gemeinsame Basis") |
| Menüpunkt „Fällig am …", nicht auf Budget-Karten | Design-Doku **§7** („Kontextmenü") + **§12.4** |
| Copy `am [N].` | Design-Doku **§12.3** |
| Schaufenster-Popup: Rangfolge, Hauptzeile, Visa-Sonderfall, ausgeschlossene Felder | Design-Doku **§11** (Fragment-Karte) |
| **Zugeordnete Fragmente und Überträge werden klickbar** — `pointer-events: none` entfällt | Design-Doku **§8** (Fragment-Stack) — *inhaltliche Änderung, nicht nur Ergänzung* |
| Konsequenz-Anzeige: zweiter Popup-Zustand, Summe als Held, Spalten, leerer Fall, Umfang | Design-Doku **§10** (Income / Partner-Split) |
| Copy `Schließen` + Spaltenköpfe `Bisher` / `Künftig` / `Diff.` | Design-Doku **§12.7** |
| Popup-Breite 400 px, beide Zustände gleich | Design-Doku **§10** |
| Drei-Varianten-Regel, `entwuerfe/` | `design-system/README.md` — **bereits angewendet** |

**Nach dem Bau:** `design-system/komponenten/karten.html` um die Statuszeile mit Termin
nachziehen, Entwurfsseiten löschen (Ablauf: `design-system/SYNC.md`).

---

*Design-Entscheidung · Antigravity Finance · 06. August 2026 · Rolle `design-direktor`,
vier Fragen, je drei Varianten, alle vom User bestätigt*
