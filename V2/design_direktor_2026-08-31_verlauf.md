# Design-Entscheidung — Verlauf je Karte und je Ordner, 31. August 2026

**Anlass:** Sprint **v2-31**, Roadmap-Paket 10. `M7` („Verlauf" im Karten-Kontextmenü)
war als reines Oberflächen-Feature geführt und gestalterisch **nicht** entschieden.
`KAT-4` (Ausgabenverlauf je Kategorie) lag im selben Paket, war aber ausdrücklich
**nicht** im Auftrag — bis der User in der Runde entschieden hat, dass der Verlauf
„bei allen Ordnern dargestellt werden muss".

**Rolle:** `design-direktor`. Der Rollenwechsel wurde ausgesprochen; Aufwand war in
dieser Runde kein zulässiges Argument.

**Vor der Runde angesehen:** Design-Doku §3 (Tokens) · §7 (Karten, Kontextmenü,
Overlay-Position) · §8 (Ordner-Kachel, Leerer Slot) · §9 (Welle + Popup, Verbotsliste) ·
`design-system/komponenten/karten.html` und `welle.html` ·
`V2/design_direktor_gemeinsame_karte.md` (05.08.2026) ·
`V2/design_direktor_2026-08-07_kategorien.md` (Record `A2`, `A3`, `B5`) ·
`V2/befunde_2026-08-04_kategorien.md` (`U3`, `U5`) — kein Widerspruch zu früheren
Entscheidungen.

**Entwürfe:** Canvas „Verlauf je Karte", fünf Artboards, mit **gemessenen** Zahlen aus
der Produktiv-Datenbank (Stand 31.08.2026). Lokale Kopie:
`design-system/entwuerfe/v2-31-verlauf.html`.

---

## 0 · Die Vorfrage: Verbietet §9 diese Fläche?

**Diese Frage stand am Anfang, nicht am Ende** — Befund `U5` (Schwere SCHWER) hatte
darauf hingewiesen, dass §9 das Welle-Popup zur „**einzigen** Heimat der kumulierten
Treppe" erklärt und in seiner Verbotsliste „keine kumulierte Sicht außerhalb des
Popups" führt.

**Befund: Das Verbot greift nicht.** Es untersagt die **kumulierte** Sicht — die
aufsummierte Treppe, bei der jeder Monat den Stand seit Januar trägt. Der Verlauf je
Karte zeigt **je Monat den Wert dieses Monats**. Das ist die Darstellungsform der
**Welle**, nicht die des Popups.

> ⚠️ **Wer diese Fläche später erweitert, liest zuerst diesen Absatz.** Eine Treppe in
> den Verlauf einzubauen — „Ausgaben seit Januar" — verletzt §9, und zwar an einer
> Stelle, an der es niemandem auffiele: Die Zahlen blieben richtig, es wäre nur die
> falsche Heimat. Die Exklusivitäts-Aussage steht in der **Funktions-Einleitung** von
> §9, nicht in der Verbotsliste; genau deshalb wurde sie beim ersten Zuschnitt von `M7`
> übersehen.

**Der zweite Satz der Verbotsliste ist dagegen einschlägig und wurde befolgt:**
*„Keine zwei Wellen (IST-vs-Plan lebt im Tooltip, nicht als zweite Welle)."* Er gilt
für die **Welle** — dort ist der Vergleich Tooltip-Sache, weil die Welle
Hintergrund-Element hinter dem Ring ist und eine zweite Kurve dort das Bild zerlegte.
Im **Popup** führt die App längst zwei Linien (IST teal + Plan grau). Der Verlauf folgt
dem Popup-Muster, nicht dem Wellen-Muster — und übernimmt dessen Farbsprache
unverändert.

---

## 1 · Zwei Jahre, zwei Linien — Ist teal, Plan grau

**Entscheidung:** 24 Monate auf der X-Achse (Vorjahr + aktuelles Jahr), Euro auf der
Y-Achse. Zwei Linien: **Ist** in Teal `rgba(62,207,175,.85)` bei 2 px, **Plan** in Grau
`rgba(255,255,255,.25)` bei 1 px.

**Begründung:** Vorgabe des Users. Beide Werte sind **bereits vergeben** — §9 führt die
Popup-Treppe als „IST (teal) + Plan (grau)", `draw.ts` zeichnet die Plan-Referenz seit
v2-06 mit exakt `graS(0.25)` bei `lineWidth 1`. **Kein neuer Token, kein neuer
Farbtopf**, und die Strichstärken sind aus der bestehenden Zeichenfunktion übernommen
statt neu gewählt.

**Verworfen:** Balken (verträgt keine 24 Werte auf 564 px und behauptet Diskretheit,
wo eine Reihe gemeint ist) · Zahlenreihe (beantwortet „wie lief es" nicht auf einen
Blick, und genau das ist der Zweck) · eine einzelne Abweichungs-Linie (verliert die
absolute Höhe, die „was kostet das Ding" beantwortet).

---

## 2 · Die Ist-Linie endet am laufenden Monat

**Entscheidung:** Teal reicht bis **einschließlich** des laufenden Monats. Ab dem
ersten Zukunftsmonat läuft nur noch die graue Plan-Linie weiter. Eine gestrichelte
senkrechte Marke mit dem Wort `heute` steht an der Grenze.

**Begründung — und sie ist gemessen, nicht gefühlt:** In Zukunftsmonaten liefert
`calculate_card_amount_for_month` den Plan zurück. Die Ist-Linie dort weiterzuzeichnen
hieße, die Plan-Linie ein zweites Mal zu zeichnen und das Ergebnis „Ist" zu nennen.
Gemessen über alle 178 Karten: In den 20 vergangenen Monaten (Jan 2025 – Aug 2026)
gibt es **null** Karten, deren Ist eine reine Plan-Kopie ist; in den vier
Zukunftsmonaten sind es **alle**. Die Grenze ist damit keine Konvention, sondern eine
Tatsache über die Daten.

Das ist zugleich §9-konform: *„Teal reicht bis einschließlich dem laufenden Monat …
Grau ab dem ersten Zukunftsmonat."*

**Warum die `heute`-Marke nicht wegoptimiert werden darf:** Ohne sie ist eine Linie,
die im August aufhört, von fehlenden Daten nicht zu unterscheiden. Sie trägt die
Begründung für das Ende — fiele sie einer späteren Straffung zum Opfer, entstünde
genau die Frage, die sie beantwortet. (Dasselbe Argument wie bei der Unterzeile
`gilt für alle Monate` in §7.)

---

## 3 · Inaktive Monate — ABGELÖST am 03.09.2026

> ### ⚠️ Diese Entscheidung ist nach drei Tagen gefallen, und der Grund war die Anschauung
>
> **Es gilt jetzt:** Ein inaktiver Monat läuft auf **0 €**. Jeder Verlauf ist **eine
> durchgehende Linie**, auch wenn nur ein einziger Monat einen Wert trägt.
>
> **Warum die ursprüngliche Begründung nicht trug.** Sie berief sich auf LL-20 — *„ein
> Referenzwert ohne Daten ist ‚keine Anzeige', nicht 0"*. LL-20 meint einen
> **fehlenden** Wert: „Budget frei" in einem Monat ohne Budget-Karten, wo eine 0 eine
> Falschaussage wäre. **Hier ist sie keine.** Der Verlauf beantwortet *„was hat mich
> das gekostet"*, und für einen Monat, in dem die Karte nicht fällig war, lautet die
> Antwort **null Euro**. Das ist wahr, nicht geschätzt.
>
> Die Regel wurde also **überdehnt** — auf einen Fall, für den sie nicht gemacht ist.
> Im Karussell wird eine nicht-fällige Karte gar nicht gezeigt; über 24 Monate hinweg
> ist ihre Abwesenheit dagegen selbst eine Aussage über Geld.
>
> **Gesehen hat es der Nutzer, nicht die Prüfstrecke.** Der Wächter war grün, die Anker
> waren grün, das Argument im Record klang schlüssig. Am Bild fiel auf, dass Reihen mit
> vielen Lücken **zerhackt** aussehen und von der jährlichen Karte nur zwei einsame
> Punkte übrig blieben, aus denen sich kein Rhythmus lesen ließ. Dieselbe Karte zeigt
> jetzt eine flache Nulllinie mit zwei Ausschlägen — und genau das ist sie.
>
> **Die Datenbank ist unberührt geblieben.** Beide Serien-Funktionen liefern weiterhin
> `null` bei `aktiv = false`; die Unterscheidung geht nicht verloren, sie wird in der
> Anzeige zu einer Null verdichtet. Wer sie später braucht — etwa für einen Tooltip
> „nicht fällig" —, findet sie in den Rohdaten. **Ein reiner Frontend-Wechsel, kein
> Datenbank-Eingriff.**
>
> Was von der alten Fassung bleibt: **Regel ③**. Eine Reihe mit einem einzigen Knoten
> bekommt eine sichtbare Marke, weil ein SVG-Pfad aus einem Punkt nichts malt. Das
> tritt nur noch am Rand auf.

**Die abgelöste Fassung, zur Nachvollziehbarkeit:**

## 3 (abgelöst) · Inaktive Monate: die Linie bricht, sie fällt nicht auf null

**Entscheidung:** Monate, in denen die Karte nicht aktiv ist, bekommen **keinen
Punkt** — die Linie ist dort unterbrochen. Ein aktiver Monat ohne aktive Nachbarn wird
als **Punkt** gezeichnet, sonst wäre er unsichtbar.

**Begründung:** `is_card_active_in_month` liefert `false`, und beide Betragsfunktionen
liefern dann `0.00` — aber „nicht fällig" und „null Euro ausgegeben" sind verschiedene
Aussagen. Eine Linie auf der Nulllinie behauptete die zweite. **§7 Regel 17 / LL-20:**
*„ein Referenzwert ohne Daten ist ‚keine Anzeige', nicht 0."*

**Wirkung im Extremfall:** `ADAC Mitgliedschaft` (jährlich) ist in **2 von 24** Monaten
aktiv — Oktober 2025 und Oktober 2026. Der Verlauf zeigt zwei Punkte und sonst nichts.
Eine Linie dazwischen behauptete eine Entwicklung, die es nicht gibt.

---

## 4 · Gemeinsame Karte: die Plan-Linie zeigt den eigenen Anteil

**Entscheidung:** Bei `attribution = GEMEINSAM` wird die Plan-Linie mit dem
Split-Faktor des jeweiligen Monats multipliziert. Der volle Haushaltsbetrag steht in
der **Unterzeile** des Popups (`… · von 1.904,00 €`).

**Begründung:** Roh gezeichnet stünden zwei Größen mit verschiedener Basis nebeneinander
— das Ist ist der überwiesene **Anteil**, der Plan der **Haushaltsbetrag**. Gemessen an
der Miete: Ist 1.089,26 € gegen Plan 1.904,00 €, also **43 % Abstand in jedem einzelnen
Monat**. Dieser Abstand ist keine Abweichung, sondern der Partner-Anteil — er sähe aus
wie ein Befund und wäre keiner. Auf gemeinsame Basis gebracht wird sichtbar, was
wirklich abweicht: die Nachzahlung im Januar 2025 und der Mietsprung im Februar 2026.

**Das ist dieselbe Entscheidung wie im Record vom 05.08.2026, eine Ebene weiter.** Dort
führt die Karte den eigenen Anteil als Held und den Haushaltsbetrag als Zeile darunter
(`von 63,00 €`). Der Verlauf übernimmt beides: die Basis für die Linie, den
Haushaltsbetrag für die Unterzeile. **Kein neues Muster, ein bestehendes angewandt.**

**Verworfen:** Plan roh (siehe oben) · drei Linien (Ist, Anteil-Plan, Haushalts-Plan —
öffnet einen dritten Strichtyp und arbeitet gegen die Haltung von §9, dass ein
Vergleich mit **zwei** Linien auskommt).

> ⚠️ **§6 Stolperfalle 11 gilt unverändert:** Der Split-Anteil wird genau **einmal**
> angewandt. Die Fragment-Summen im Ist sind bereits der überwiesene Anteil und bleiben
> **unangetastet** — multipliziert wird ausschließlich die **Plan**-Seite. Wer diese
> Fläche später anfasst, prüft das zuerst.

---

## 5 · Einmal-Karten bekommen den Menüpunkt nicht

**Entscheidung:** `Verlauf …` erscheint im Kontextmenü nur bei den Frequenzen
`Monatlich`, `Quartalsweise`, `Halbjährlich` und `Jährlich` — **nicht** bei `Einmalig`.

**Begründung:** Eine Einmal-Karte existiert per Definition in genau einem Monat
(`first_active_month = last_active_month`); ihr „Verlauf" ist ein Punkt. Ein Menüpunkt,
der nichts zeigt, ist ein Versprechen ins Leere — dasselbe Argument, mit dem
`Fällig am …` auf Budget-Karten fehlt (§7: kein Termin, also kein Eintrag).

**Die Zahl dazu, weil sie überrascht:** Von **178** Karten sind **142 einmalig** (80 %).
Nur **36** haben überhaupt einen Rhythmus — 25 monatlich, 10 jährlich, 1 quartalsweise.
Der Menüpunkt erscheint also auf einer **Minderheit** der Karten, und das ist richtig
so.

**Auf Ghost-/Forecast-Karten erscheint er.** Anders als `Betrag anpassen` und
`Fällig am …`, wie `Kategorie ändern …` — mit derselben Begründung: Der Verlauf ist
eine Eigenschaft der Karte über die Zeit, kein Monats-Zustand. Im Zukunftsmonat ist die
Kartenmenge zudem am vollständigsten (§7, `KAT-1`).

---

## 5b · Y-Achse: runde Schritte, jede Linie beschriftet *(neu am 03.09.2026)*

**Entscheidung:** Die Y-Achse trägt Rasterlinien in **runden Schritten** — jede davon
beschriftet. Der Schritt stammt aus einer festen Folge (1, 2, 5, 10, 20, 50, 100, 200,
500 …) und wächst mit der Größenordnung; es sind **höchstens sechs Abschnitte**.

**Begründung, gemessen.** Die erste Fassung trug drei Rasterlinien (0, Mitte, Maximum)
und **zwei** Beschriftungen. Der Ordner `Versicherungen` liegt in **18 von 24 Monaten
zwischen 223 und 262 €**, hat aber im Dezember 2026 eine Jahresprämie von **597,36 €**.

Die Achse **muss** bis 600 reichen — sonst wäre die Anzeige schlicht falsch. Damit lag
das dichte Band bei **38 % der Höhe**, und zwischen 0 und 600 stand nichts: Man sah,
*dass* die Linie flach verläuft, aber nicht, *auf welcher Höhe*. Jetzt sind es
`0/100/…/600`, und die Frage „liegt die Linie bei 230?" beantwortet sich durch
Hinsehen.

**Die Obergrenze war ausdrücklich nicht das Problem** — 600 statt 597,36 sind 0,4 %
Luft. Wer hier die Skala enger fasst, schneidet einen echten Wert ab.

**Verworfen:** die Nulllinie weglassen und den Ausschnitt auf 200–600 legen. Das
brächte die Streuung zur Geltung und übertriebe sie zugleich — bei Ausgaben ist die
Null der Anker, und §5 hält daran auch im Ring fest.

**Der kleinste Schritt ist 1 €, nicht 0,50 €.** Die Beschriftung rundet auf ganze Euro
(wie der Ring, §5); ein halber Schritt ergäbe bei einer Karte über 1,00 € zwei Marken
mit demselben Text. Karten mit einem Platzhalter-Plan von 1,00 € gibt es im Bestand.

## 6 · X-Achse: `01/25`, jeder dritte Monat

**Entscheidung:** Format `MM/JJ`. Beschriftet wird **jeder dritte** Monat — acht Marken
über 24 Monate. Eine dünne senkrechte Linie markiert die Jahresgrenze.

**Begründung:** Der User hat das Format gesetzt und die Dichte am Entwurf entschieden.
**Gemessen statt geschätzt** (LL-31): 24 Marken auf 564 px sind **23,5 px je Marke**,
das Label braucht bei 8 px system-ui rund **20 px** — es passt mit knapp 4 px Luft.
Bei jedem dritten Monat sind es rund **50 px Luft**. Beide Fassungen standen
nebeneinander im Entwurf; entschieden hat das Auge, nicht die Rechnung.

**Verworfen:** alle 24 Marken (passt, ist aber dicht) · Kurzmonate `J F M A M J` wie in
`draw.ts` (dort richtig, weil ein einzelnes Jahr keine Jahreszahl braucht — über zwei
Jahre wäre `J` doppeldeutig).

---

## 7 · Die Fläche selbst: zentriertes Overlay, Anatomie des Welle-Popups

**Entscheidung:** Der Verlauf öffnet als **zentriertes Overlay per React-Portal an
`document.body`**, 680 px breit, mit der Anatomie des Welle-Popups: Kicker `VERLAUF`,
Kartenname als Held (38 px, Weight 200), Unterzeile mit Typ/Frequenz/Attribution,
Zeichenfläche 200 px hoch, darunter eine Zeile mit Legende links und den beiden
Jahressummen rechts.

**Begründung:** §7 legt fest, dass **alle** Overlays zentriert erscheinen — die einzige
Ausnahme der App ist das Karten-Kontextmenü selbst. Der Verlauf ist ein Overlay und
damit kein Sonderfall. Die Maße sind 1:1 aus `welle.module.css` übernommen
(`max-width: 680px`, `border-radius: 18px`, `padding: 24px 26px 20px`,
`box-shadow: 0 40px 100px -30px`), die Zeichenfläche folgt `draw.ts`
(Raster `rgba(255,255,255,.07)` bei 0.5 px).

**Der Held ist der Name, keine Zahl.** Das Welle-Popup führt die Jahressumme als Held,
weil dort die Summe die Aussage ist. Beim Verlauf ist die Aussage die **Kurve**; eine
große Zahl daneben konkurrierte mit ihr und mit der Sparrate im Ring
(Grundsatz „ein Screen, ein Monat, eine Zahl"). Die beiden Jahressummen stehen klein
im Fuß, wo sie „was kostet das Ding übers Jahr" beantworten, ohne zu schreien.

> ⚠️ **Beim Bauen zu prüfen (LL-6):** Ein Portal repariert den **Layout**-Bezug und
> zerreißt im selben Zug jede Logik, die sich auf **DOM-Nähe** verlässt — `closest()`,
> `contains()`, CSS-Nachfahren-Selektoren, Eltern-Hover. Das Event-Bubbling läuft
> unverändert weiter, weil Portale React-Kinder bleiben. In v2-10 riss danach jeder
> Klick im Einkommens-Popup zusätzlich die Jahres-Welle auf, und die **komplette
> Prüfstrecke blieb dabei grün**. Gefunden hat es erst der optische Smoke.

---

## 8 · Ordner bekommen denselben Verlauf (`KAT-4`)

**Entscheidung:** Die Ordner-Kachel bekommt im ⋯-Menü ebenfalls `Verlauf …`. Es ist
**dieselbe Fläche** — dieselbe Anatomie, dieselben zwei Linien, dieselben Regeln für
Zukunft und Lücken. Der Held ist der Ordnername, die Unterzeile trägt Postenzahl und
den Monatsbetrag mit Vorzeichen.

**Begründung:** Der User hat es verlangt, und Befund `U5` sagt seit dem 04.08.2026, dass
Karten- und Kategorie-Verlauf **dieselbe Fläche mit zwei Ebenen** sind. Getrennt zu
bauen hieße, dieselbe Fläche zweimal anzufassen. Deshalb liegen beide seit damals im
selben Paket.

**Die Beträge stehen als Höhe, das Vorzeichen trägt die Unterzeile.** Ein Ausgaben-Ordner
wird **nicht** unter die Nulllinie gezeichnet und **nicht** rot eingefärbt: Rot ist in
dieser App „offen / Defizit" (§3), nicht „Ausgabe" — eine Fixkosten-Karte ist auch
nicht rot, nur weil sie Geld kostet. Der Ordner trägt sein Vorzeichen im Kopfbetrag,
genau wie im Karussell (Record `B5`, 07.08.2026: *„Der Ordner trägt ein Vorzeichen, die
Karte nicht"*).

**Ein Ordner hat keinen eigenen Plan — er ist die Summe seiner Karten.** Deshalb springt
seine Plan-Linie, wenn in einzelnen Monaten zusätzliche Posten darin liegen. Das ist
richtig und keine Unruhe, die geglättet gehört.

---

## Was NICHT entschieden wurde

- **`KAT-5`** (eine Zahlung auf die Ordner-Kachel ziehen → Anlege-Fenster). War im
  Auftrag, ist auf Wunsch des Users **aus v2-31 herausgenommen** und bleibt als Record
  `A2` vom 07.08.2026 unverändert gültig. Eigener Sprint.
- **Ein Hover-Tooltip auf dem Verlauf.** Die Welle hat einen (§9); ob der Verlauf einen
  braucht, ist nicht entschieden. Ohne ihn liest man Werte aus der Y-Achse ab. **Nicht
  stillschweigend nachrüsten** — es wäre eine eigene Entscheidung, inklusive der Frage,
  was im Tooltip steht.
- **Ein Klick auf einen Monat im Verlauf.** Das Welle-Popup springt bei Monatsklick zu
  den Treibern. Der Verlauf tut heute **nichts** bei einem Klick. Ob er zum Monat
  navigieren soll, ist offen.
- **Ob der Zeitraum mitwandert.** Entschieden ist „Vorjahr + aktuelles Jahr", also fest
  am Kalenderjahr. Ein gleitendes 24-Monats-Fenster ist die Verwandte von `B1`
  (Paket 11) und gehört dorthin.
- **Verhalten bei einem Ordner, dessen Vorzeichen wechselt.** Tritt heute nicht auf
  (Ausgaben-Ordner bleiben negativ, „Rückflüsse" bleibt positiv). Wenn es auftritt, ist
  „Betrag als Höhe" mehrdeutig — dann ist neu zu entscheiden, nicht zu raten.
- **Der Verlauf des Ordners `Einkommen`.** Er ist kein Karten-Ordner, sondern trägt das
  Nettogehalt (§8, Record `A4`). Ob `Verlauf …` dort erscheint und was er zeigt, ist
  offen — die Kachel hat ausdrücklich **kein** Kontextmenü.

---

## Was das entsperrt

**Roadmap-Paket 10 („Verlauf") wird mit diesem Sprint vollständig** — `M7` und `KAT-4`
zusammen. Das war seit dem 04.08.2026 so geschnitten und ist der Grund, warum das Paket
seither „Verlauf" heißt statt „Kartenverlauf".

**`KAT-4`s alte Voraussetzung ist entfallen.** Die Roadmap führte den Punkt als
abhängig von einer kuratierten Datenbasis (Befund `D4`: *„heute hängen in Jan–Apr
0,0 % der Ausgaben an einer Karte … für ganz 2025 wäre sie null"*). **Das gilt nicht
mehr.** `DA-1` (v2-27) hat die Karten zurückdatiert, `DA-3` (v2-28) ihre Pläne auf die
tatsächlich gezahlten Beträge gebracht. Gemessen am 31.08.2026: In **allen 20**
vergangenen Monaten hat **jede** aktive Karte eine verknüpfte Zahlung oder einen Tap —
`reine_plan_kopie = 0`. Die Kurve zeigt Ausgabeverhalten, nicht Kurationsfortschritt.

---

## Datenlage — was gemessen wurde und was daraus folgt

> **Die Roadmap-Zusage zu `M7` hielt der Messung nicht stand** (LL-22). Sie lautete:
> *„Datenseitig bereits abgedeckt — `get_year_deviation_drivers` liefert je Karte `ist`
> und `plan` pro Monat. Reines Oberflächen-Feature."*

**Das ist nicht der Fall.** Die Funktion trägt die Zeile
`WHERE round(delta_roh, 2) <> 0` — sie liefert **ausschließlich Karten, die vom Plan
abweichen**. Gemessen für 2026:

| Monat | Jan | Feb | Mär | Apr | Mai | Jun | Jul | Aug | Sep | Okt | Nov | Dez |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Karten aktiv | 27 | 23 | 30 | 27 | 34 | 30 | 34 | 29 | 22 | 23 | 22 | 22 |
| davon geliefert | 11 | 5 | 5 | 5 | 7 | 3 | 5 | 5 | **0** | **0** | **0** | **0** |

Netflix läuft zwölf Monate exakt auf Plan und erscheint deshalb in **keinem einzigen
Monat** der Antwort; sein Verlauf wäre leer. In September bis Dezember 2026 liefert die
Funktion **gar nichts**. Zusätzlich verfälscht der Rest-Ausgleich aus v2-22
(`rn = 1 → delta + rest`) das `delta` der jeweils größten Zeile — für einen Verlauf,
der `ist` und `plan` zeigt, ist das unerheblich, für einen, der `delta` zeigt, nicht.

**Folge:** `M7` braucht eine **neue Lese-Funktion** in der Datenbank. Der Auftrag hatte
„kein Datenbank-Eingriff" vorgesehen; der User hat den Widerspruch aufgelöst und die
Funktion freigegeben. Sie ist rein lesend, ruft ausschließlich bestehende Funktionen
auf und kann deshalb **keinen Zahlenwert bewegen**.

**Die drei Wege standen zur Wahl, gemessen:**

| Weg | Netzrunden je Öffnen | Datenbank-Zeit | Migration |
|---|---|---|---|
| 3 Einzel-RPCs × 12 Monate | **36** | ~21 ms gesamt | nein |
| 12× `get_cards_for_month` | **12** | ~311 ms | nein |
| **neue Serien-Funktion** | **1** | **~21 ms** | **ja** |

Gewählt ist die dritte — mit demselben Argument, mit dem v2-24 (`PF-4`)
`get_sparrate_series` gebaut hat: aus 24 Netzrunden wurde eine. Anker 3 (Anfragen je
Dashboard-Aufbau) ist seit v2-24 ein Prüfanker dieses Projekts; ein neues Feature, das
12 oder 36 Runden je Geste kostet, arbeitet gegen ihn (LL-29).

**Für die Ordner-Ebene wurde die Plan-Seite gegen den Anker geprüft:**
Σ (Karten-Plan × Anteil) + Netto-Plan **==** `calculate_planned_sparrate_for_month`,
in **allen 24 Monaten**, Differenz **0,00 €**.

> ⚠️ **Die Ist-Seite ist der heikle Teil und braucht den Rest-Ausgleich.**
> `get_category_amounts_for_month` legt den Rundungs-Rest auf den **betragsgrößten**
> Ordner, damit Anker 1 (`Σ Ordner == Sparrate`) exakt gilt. Eine Verlaufs-Funktion,
> die dieselben Ist-Werte ohne diesen Ausgleich summiert, weicht um Cent-Beträge ab —
> und dann zeigt der Verlauf im Juli einen anderen Wert als der Ordner im Karussell,
> **ohne dass irgendeine Zahl falsch aussieht**. Das ist LL-25 in genau der Gestalt,
> die in v2-17 einen halben Sprint gekostet hat.

---

## Abgleich gegen die fünf Grundsätze

| Grundsatz | Urteil |
|---|---|
| Ein Screen, ein Monat, eine Zahl | ✓ Der Verlauf ist ein Overlay auf Abruf, kein Dauerelement. Der Held ist ein **Name**, keine zweite große Zahl neben der Sparrate. |
| Schmale Palette | ✓ **Keine neue Farbe, kein neuer Token.** Teal und Grau in exakt ihrer bisherigen Bedeutung (§9); Rot ausdrücklich **nicht** für Ausgaben verwendet. |
| Ruhe vor Betonung | ✓ Acht Achsenmarken statt 24, Raster bei `.07`, Plan-Linie 1 px gegen Ist 2 px. Die Hierarchie steht in der Strichstärke, nicht in der Farbe. |
| Werkzeug ist nicht Produkt | ✓ Kein Regler, kein Umschalter, keine Zoom-Geste, kein Zeitraum-Wähler. |
| Ehrlichkeit vor Beruhigung | ✓ **stärkt sie dreifach** — die Ist-Linie endet, wo die Realität endet; inaktive Monate werden nicht auf null geglättet; die gemeinsame Karte zeigt einen Vergleich auf gleicher Basis statt eines Abstands, der keiner ist. |

---

## Doku-Folge

| Was | Wohin |
|---|---|
| Neuer Abschnitt „Verlauf" — Fläche, zwei Linien, Zukunftsgrenze, Lücken, gemeinsame Karte | Design-Doku **§7** (neuer Unterabschnitt nach „Kontextmenü") |
| Kontextmenü-Eintrag `Verlauf …` + Frequenz-Bedingung (nicht bei `Einmalig`, ja auf Ghost) | Design-Doku **§7** (Tabelle „Kontextmenü") |
| `Verlauf …` im ⋯-Menü der Ordner-Kachel + Vorzeichen-Regel | Design-Doku **§8** |
| Copy: `Verlauf`, `Verlauf …`, `heute`, `Ist`, `Plan` | Design-Doku **§12.4** und **§12** (Ordner-Kachel) |
| Abgrenzung „monatlich ja, kumuliert nein" als **Nachtrag zur Verbotsliste** | Design-Doku **§9** |
| Neue Lese-Funktion(en) im RPC-Katalog | Schema-Doku **§4** |
| Neue Seite `komponenten/verlauf.html` mit `@dsCard`-Marker | `design-system/`, **nach** dem Bau (Ablauf: `design-system/SYNC.md`) |

Patch über den `docs-maintainer`, mit Versions-Bump.

> **Die Design-System-Seite entsteht erst nach dem Bau** — ausdrücklich so entschieden.
> `SYNC.md` sagt: *„Keine Gestaltungs-Vorschläge. Die Seiten zeigen, was ist."* Die
> Entwürfe dieser Runde liegen deshalb **lokal** unter
> `design-system/entwuerfe/v2-31-verlauf.html`, ohne `@dsCard`-Marker — genau wie
> `ge-gehalt.html`. Sie erscheinen nicht im Design-System-Projekt auf `claude.ai/design`
> und sollen es nicht.

---

*Design-Entscheidung · Antigravity Finance · 31. August 2026*
