# Design-Entscheidung — Kategorien im Karussell (Paket 4) · 07./08. August 2026

> **Status: vollständig.** Alle sechs Gestaltungsfragen aus
> `V2/befunde_2026-08-04_kategorien.md` §6 sind entschieden, dazu vier Detailfragen, die
> sich in der Runde neu ergeben haben.
>
> **Der Ablauf war zweistufig — und das war eine Auflage des Users.** Teil A wurde am
> 07.08. im Dialog geklärt, während der User unterwegs war und nur ein Handy hatte. Teil B
> hing an den maßstäblichen Entwürfen und wurde **erst am 08.08. entschieden, nachdem der
> User sie am Rechner gesehen hatte.** Wörtliche Vorgabe: *„Bitte keine Entscheidung als
> gefallen protokollieren, die ich nur beschrieben und nicht gesehen habe."* Die
> Gliederung dieses Records hält diese Trennung fest, weil sie erklärt, worauf welche
> Entscheidung beruht — auf einem Gespräch oder auf einem Bild.
>
> **Gewählt wurde Variante A** (Stapel-Kachel im Kartenformat), nach Ansicht aller drei
> Varianten.

**Anlass:** Paket 4 ist der Engpass der Roadmap. Die Kette lautet Rohmasse lesbar →
Kategorien → automatische Zuordnung → Kuratierung; die automatische Zuordnung ist der
einzige Punkt der Roadmap, der Aufwand **wegnimmt**, und sie ist hinter Paket 4
eingesperrt. Sechs Gestaltungsfragen (`V2/befunde_2026-08-04_kategorien.md` §6)
blockierten den Schnitt.

**Rolle:** `design-direktor`. Der Rollenwechsel wurde ausgesprochen; **Aufwand war in
dieser Runde kein zulässiges Argument** — ausdrückliche Vorgabe des Users.

**Vor der Runde angesehen:** `V2/befunde_2026-08-04_kategorien.md` vollständig (30
Befunde, §3 D1–D15 und §4 U1–U15) · Design-Doku §1 (Prinzipien), §2.1/§2.2
(Snapshot-Integrität, Forward-Inheritance), §4.2 (Hauptformel), §7 (Karten, Kontextmenü),
§8 (Karussell, Fragment-Stack), §9 (Welle-Popup), §10 (Income) ·
`V2/v2_roadmap_konsolidiert.md` · `V2/design_direktor_2026-08-06_liquiditaet_fragment_split.md` ·
`design-system/README.md` (Drei-Varianten-Regel) · dazu der laufende Code
(`carousel.tsx`, `card-interactive.tsx`, `interaction-zone.module.css`, `tokens.css`)
und lesende Messungen gegen die Produktiv-Datenbank.

**Kein Widerspruch** zu früheren Entscheidungen gefunden. Zwei Befunde widersprechen
allerdings der bisherigen **Diagnose** — siehe „Bewusste Abweichungen" unten.

**Anschauungsmaterial:** `design-system/entwuerfe/kat-kategorien.html` — drei Varianten
A/B/C, maßstäblich auf 876 px (die echte Karussell-Breite bei 1440 px Fenster), mit den
gemessenen Juli-Beträgen und **anklickbaren** Kategorien.

---

## Der gemessene Ausgangspunkt

Diese Zahl fehlte in allen bisherigen Papieren und hat die Fragestellung verschoben.

Das Karussell ist **kein blätterndes Karussell**, sondern eine einzige horizontal
scrollende Reihe (`carousel.tsx`, `scrollBy` um `SCROLL_STEP = 146`). Bei 1440 px
Fensterbreite bleiben nach Grid (`180px 1fr 220px`, gap 14), Seitenpadding (32) und
zwei Chevrons (28 + 8) **876 px** für den Viewport — bei Slot 136 + gap 10 sind das
**exakt 6 Kartenplätze**, und der Pfeil rückt um **eine** Karte.

| Monat | Karten | sichtbar | Pfeilklicks Ende zu Ende |
|---|---|---|---|
| Januar (Grundrauschen) | 19 | 6 | **15** |
| Juli (Spitze) | 32 | 6 | **27** |

**Der Schmerz ist der Weg, nicht die Menge.** Im Juli sieht der User 18 % seines Monats
auf einmal. Daraus folgt unmittelbar: **Nur Zuklappen verkürzt den Weg.** Eine Kategorie,
die die Reihe bloß beschriftet, ordnet — aber sie spart keinen einzigen Klick.

**Schmerz-Rangfolge des Users** (erfragt, in dieser Reihenfolge):
1. **Arbeiten** — beim Zuordnen zu viel Hin- und Herscrollen
2. **Ruhe** — es sieht überladen aus
3. **Suchen** — eine bekannte Karte nicht schnell genug finden

Der Verlauf stand ausdrücklich **nicht** in der Schmerzliste: Er ist der Wunsch dahinter,
nicht der Druck.

---

# Teil A — im Dialog entschieden und bestätigt

## A1 · Eine Kategorie ist ein **Ordner**, kein Sammelposten

**Entscheidung:** Eine Kategorie enthält ausschließlich **Karten**. Sie hat keine eigene
Zahl außer der vorzeichenrichtigen Summe ihres Inhalts, und die Sparrate rechnet
weiterhin kategorie-blind über alle Karten.

**Begründung:** Der Ausgangswunsch lautete, eine Kategorie solle „andere Karten **und
Fragmente** aufnehmen". Das sind zwei verschiedene Dinge. Ein Sammelposten könnte eine
Zahlung direkt aufnehmen und müsste dann selbst rechnen — womit seine Kinder es nicht
mehr dürften, sonst zählt alles doppelt. Ein Behälter, der **mal** selbst zählt und
**mal** seine Kinder zählen lässt, ist von außen nicht mehr lesbar: „Wohnen 1.148 €"
ließe offen, ob das drei Posten sind oder drei Posten plus eine lose Zahlung. Genau
diese Sorte stiller Doppeldeutigkeit hat die fünf Befunde vom 04.08. erzeugt
(**Ehrlichkeit vor Beruhigung**).

**Verworfen:** Sammelposten mit eigener Rechnung — siehe oben. Zusätzlich wäre er der
direkte Weg in Befund `D1` (Kategorie als `cards`-Zeile wird doppelt in die Sparrate
gerechnet, Prüfanker bricht).

## A2 · Die Anlege-Geste ersetzt, was der Sammelposten gekonnt hätte

**Entscheidung:** Wird eine Zahlung auf eine Kategorie gezogen, öffnet sich **dasselbe
Fenster wie heute beim leeren Platz** (Name, Betrag, Häufigkeit, Typ, Attribution) — nur
mit der Kategorie bereits eingetragen. Ein Zug, ein Fenster, daraus entsteht ein Posten.

**Begründung:** Der User bekommt die grobe Geste, die er wollte, ohne dass das
Datenmodell doppeldeutig wird. Das Muster existiert bereits (`RecurrencePopup`, §8
„Leerer Slot — Weg 1"); es wird nur ein zweites Mal ausgelöst.

## A3 · Der Schnitt: elf Kategorien, vom User selbst geschnitten

**Entscheidung:** Gliederung nach **Lebensbereich** (Vorschlag „Schnitt A"), vom User in
zwei Runden nachgeschärft.

| Kategorie | Inhalt (Stand 07.08.2026) |
|---|---|
| **Einkommen** | das Nettogehalt (siehe A4) |
| **Wohnen** | Miete · Strom · Internet · *(künftig Rundfunkgebühren)* |
| **Lebensmittel** | Haushaltsgeld |
| **Mobilität** | Deutschlandticket · Tanken · Autoreifen · Inspektion Auto (+ Erstattung) |
| **Abos & Mitgliedschaften** | Claude · Audible · iCloud · Netflix · Spotify · Handyvertrag · **Fitnessstudio** · **ADAC** · die zwei Erstattungen |
| **Versicherungen** | Berufsunfähigkeit · Private Altersvorsorge · Rechtsschutz · Reisekrankenversicherung · *(künftig Privathaftpflicht)* |
| **Hobby** | Fahrradzubehör (2×) · Radbrille · Bikefitting |
| **Urlaub** | Urlaub Frankreich · Urlaub Österreich |
| **Geschenke & Anlässe** | Aline Geschenk 30ter · Konfirmation · Hotel Konfirmation · Parfüm Mama · Aline Geburtstag (+ Erstattungen) |
| **Persönliches** | Privates Budget · Friseur · Essen gehen · **Kauf iPhone** |
| **Rückflüsse** | Steuererstattung · Kleinanzeigen (2×) · Einzahlung Münzen |

**Wirkung:** Juli **11 Ordner statt 32 Karten** (27 → 5 Pfeilklicks), Januar **7 statt
19**. Der Schnitt **atmet mit dem Jahr**: „Urlaub" existiert in elf von zwölf Monaten
nicht und erscheint nur, wenn Urlaub ansteht.

**Drei Schnitte standen zur Wahl**, alle aus den echten 46 Karten gebildet:
- **A · Lebensbereich** (7 Behälter im Erstentwurf) — **gewählt.** Beim Zuordnen hat man
  einen Umsatz in der Hand („Shell", „Netflix", „Vodafone"), und der ist thematisch. Der
  Schnitt folgt damit dem Suchweg. Da *Arbeiten* die oberste Priorität ist, gab das den
  Ausschlag.
- **B · Steuerbarkeit** (5) — Unvermeidbar / Kündbar / Frei verfügbar / Einmalig geplant /
  Rückflüsse. Beantwortet als einziger die Frage *„wo kann ich überhaupt drehen?"*.
  Verworfen, weil er beim Zuordnen nicht hilft.
- **C · Rhythmus** (4) — die ruhigste Gliederung, faltet die Spitze weg (22 der 46 Karten
  sind Einmal-Karten). **Bewusst als Gegenprobe vorgelegt und verworfen:** Ein Behälter
  „Nur dieser Monat" mit elf Karten sagt beim Zuordnen genauso wenig wie vorher. Er
  belegt, dass Ruhe allein kein Maßstab ist.

**Nachgeschärft durch den User, gegen den Erstvorschlag:** „Abos & Digitales" →
**„Abos & Mitgliedschaften"** (trennt Vertrag von Anschaffung statt digital von analog —
die bessere Regel, deshalb wanderte Fitnessstudio hinein) · „Vorsorge" →
**„Versicherungen"** · „Sport & Freizeit" → **„Hobby"** · **„Urlaub"** neu ·
**„Lebensmittel"** aus „Wohnen" herausgelöst.

**Streitfall ADAC — die Rolle hat sich nicht durchgesetzt und das ist in Ordnung.** Die
Empfehlung lautete, ADAC und Deutschlandticket thematisch in Mobilität zu lassen, weil
man beim Zuordnen „Auto" denkt und nicht „Vertrag". Der User hat ADAC nach Abos &
Mitgliedschaften gegeben und das Deutschlandticket in Mobilität gelassen. Damit ist die
Regel nicht rein — aber sie ist **seine** Regel, und Kategorien sind Ordnung nach
persönlichem Denken, nicht nach Systematik.

## A4 · Das Nettogehalt bekommt einen eigenen Ordner — die Summen ergeben die Sparrate

**Anforderung des Users, wörtlich:** *„Auf jeden Fall müssen die Summen die Sparrate
ergeben."*

**Entscheidung:** Der erste Ordner der Reihe heißt **Einkommen** und trägt das
Nettogehalt. Aufgeklappt enthält er ein einziges Element — das Netto als Kachel; ein
Klick darauf öffnet das bestehende Einkommens-Fenster.

**Begründung:** Nach §4.2 ist `Sparrate = Netto + Einnahmen − Fixkosten − Budgets`. Die
Kategorien decken ausschließlich Karten ab; das Netto ist **keine Karte** und steht heute
gar nicht im Karussell. Ohne eigenen Ordner fehlte in der Aufstellung genau dieser
Betrag, und die Rechnung ginge nicht auf. Nebeneffekt: Das Gehalt wird zum ersten Mal
überhaupt im Karussell sichtbar. Die Geste bleibt einheitlich — **Ordner klappt auf,
Element öffnet Details.**

**Nachweis gegen Produktion, Juli 2026** (gemessen 07.08.2026, nur `SELECT`):

| Ordner | Juli 2026 |
|---|---|
| Einkommen | +4.165,11 € |
| Wohnen | −1.148,17 € |
| Lebensmittel | −257,50 € |
| Mobilität | −522,00 € |
| Abos & Mitgliedschaften | −374,02 € |
| Versicherungen | −232,83 € |
| Hobby | −369,14 € |
| Urlaub | −738,01 € |
| Geschenke & Anlässe | −168,11 € |
| Persönliches | −747,58 € |
| Rückflüsse | +69,51 € |
| **Summe = Sparrate** | **−322,75 €** |

Deckt sich exakt mit `calculate_sparrate_for_month` und mit dem Prüfanker in CLAUDE.md §9.

**Nebengewinn, nicht gesucht:** Die Aufstellung erklärt den negativen Juli auf einen
Blick — Urlaub 738 € + Persönliches 748 € + Hobby 369 € sind **1.855 €** einmalige
Ausgaben in einem Monat. In der heutigen Reihe aus 32 gleich aussehenden Karten ist das
nur durch Blättern und Kopfrechnen zu finden.

## A5 · Erstattungen liegen bei ihrer Ausgabe — der Ordner saldiert

**Entscheidung:** „Handyvertrag - Aline" (11,00 €) und „iCloud - Anteil Mama" (7,00 €)
liegen in **Abos & Mitgliedschaften**, nicht in Rückflüssen. Der Ordner zeigt damit den
**Saldo**. In „Rückflüsse" bleibt nur, was zu keiner Ausgabe gehört: Steuererstattung,
Kleinanzeigen-Verkäufe, Münzeinzahlung.

**Begründung:** Der Sinn einer Kategorie ist die Frage *„was kostet mich das?"* — und ein
erstatteter Anteil senkt die Kosten. Der Saldo ist die ehrlichere Zahl.

**Bekannter Preis, benannt:** Man sieht zwei Karten mit 35,00 € und 11,00 € nebeneinander
und darüber 24,00 €. Richtig gerechnet, beim ersten Mal überraschend. Es trifft
ausgerechnet die Paare, die eine thematische Gruppierung als Erstes zusammenzieht
(Befund `D2`).

## A6 · Die Zuordnung gilt rückwirkend für alle Monate

**Entscheidung:** Eine Karte trägt ihre Kategorie als **einfache Eigenschaft**, nicht als
Zeitreihe. Wird Netflix von „Abos" nach „Unterhaltung" verschoben, steht es auch im
Januar dort, und beide Zwischensummen ändern sich in **jedem** Monat.

**Das weicht bewusst von Befund `D3` ab**, der eine Zeitreihe
`card_category_timeline(card_id, effective_month, category_id)` nach dem
Forward-Inheritance-Muster empfiehlt.

**Begründung:** Ausschlaggebend ist der Verlaufs-Wunsch des Users. Eine ab-heute-Zuordnung
zerschnitte **jede Kategorie-Kurve an jeder Umsortierung** — Netflix stünde bis Juli unter
„Abos" und ab August unter „Unterhaltung", und beide Linien hätten an dieser Stelle einen
Bruch, der nichts über Ausgaben aussagt. Umsortieren ist fast immer eine **Korrektur der
Ordnung**, keine Änderung der Wirklichkeit.

**Warum das die Snapshot-Integrität nicht verletzt:** §2.1 garantiert sie auf fünf Ebenen
— Gehalt, Karten-Plan, Karten-Lebensdauer, Fragmente, Sparrate. Die Kategorie ist keine
davon und berührt keine davon; die Sparrate bleibt bitgenau gleich. Der Präzedenzfall ist
`cards.name`: Auch eine Umbenennung wirkt rückwirkend, und das stört niemanden. Was sich
ändert, ist ausschließlich die **Gliederung**, nie eine Zahl, die rechnet.

## A7 · Kategorien werden nicht beendet — nur gelöscht

**Entscheidung:** Es gibt **kein** „Kategorie beenden". Es gibt „Kategorie löschen", und
dabei werden die enthaltenen Karten **nicht** mitgelöscht, sondern kategorielos.

**Begründung:** Bei einer Karte heißt „beenden": dieser Betrag fällt künftig weg. Eine
Kategorie hat keinen eigenen Betrag — sie wird nicht beendet, sie wird **leer**. Und eine
leere Kategorie wird im betreffenden Monat einfach nicht angezeigt. Damit entfällt der
Bedarf für ein viertes Lebenszyklus-Verb samt Begründungs-Sprache im Lösch-Tor
(Befund `U13`).

**Kaskade ausgeschlossen:** Ein Behälter, dessen Löschung sechs Posten mitnimmt, wäre eine
undo-lose Massenaktion — dasselbe Muster, das `U9` für „Alle Verknüpfungen lösen"
beschreibt.

## A8 · Eine Kategorie gilt in allen Monaten, sichtbar ist sie nur, wo sie belegt ist

**Entscheidung:** Kategorien sind nicht monatsgebunden. Sie gelten vorwärts **und**
rückwärts. In einem Monat erscheinen sie nur, wenn dort mindestens eine Karte in ihnen
liegt.

**Begründung:** Ohne die Sichtbarkeits-Regel stünden im Januar elf Behälter, von denen
vier leer sind. Mit ihr bleibt die Vergangenheit strukturiert (`U13`), und der Schnitt
atmet mit dem Jahr.

## A9 · Das Ding heißt „Kategorie"

**Entscheidung:** Der neue Begriff heißt **Kategorie**. Der bisherige Gebrauch — das
KI-Vorschlags-Badge auf Fragment-Karten (§11) — wird zu **„Vorschlag"** umbenannt.

**Begründung, gegen Befund `U6`:** Die Kollision ist kleiner, als der Befund sie
darstellt. Das Badge ist mit `BF-1` (v2-10) **aus der Anzeige verschwunden**, und §12
(die vollständige Textreferenz der App) enthält **kein einziges** Kategorie-Wort. Es ist
ein Feldname in zwei Doku-Absätzen, kein sichtbares Wort. Der User sagt durchgehend
„Kategorie" — das ist sein natürliches Wort für die Sache. Ein Kunstwort zu erfinden,
damit ein unsichtbarer Feldname ungestört bleibt, wäre die falsche Rangfolge.

**Verworfen:** „Gruppe" (neutraler und garantiert kollisionsfrei, aber blasser und nicht
das Wort, in dem der User denkt) · „Fach" (bildhafter, aber im Deutschen mit
Schulfach/Fachgebiet doppelt belegt).

**Sichtbar wird das Wort an drei Stellen:** beim Anlegen, beim Ändern über das
Kartenmenü, und im Behälter für alles Unsortierte.

---

# Teil B — entschieden am 08.08.2026, nach Ansicht der Entwürfe

Alles Folgende beruht auf der Entwurfsseite
`design-system/entwuerfe/kat-kategorien.html` — drei Varianten, maßstäblich auf 876 px,
mit den gemessenen Juli-Beträgen und anklickbaren Kategorien. **Der User hat sie am
Rechner gesehen und danach entschieden.**

## B1 · Die Verfassungsfrage — Präzisierung statt Änderung

Befund `U2` führt als BLOCKER, dass eine zweite Ebene drei Stellen der Verfassung
**wörtlich** widerspricht: §1 („Keine Tab-Navigation, keine separaten Screens"), §7
(„Ein gemeinsames Karussell, keine getrennten Reihen"), §8 („Keine zwei Karussell-Reihen").

**Entscheidung:** Die Verfassung wird **nicht geändert, sondern präzisiert.** Alle drei
Verbote treffen einen **zweiten Ort** oder eine **zweite Reihe**. Keines trifft eine
Gliederung innerhalb der einen Reihe. Bleibt eine Kategorie an ihrem Platz und
**breitet sich beim Aufklappen dort aus**, entsteht weder das eine noch das andere: Man
wechselt nirgendwohin, man macht etwas auf. Das unterscheidet ein Akkordeon von einem
Reiter — bei Reitern sieht man immer nur einen Inhalt und hat einen „aktuellen Ort".

**Kein Winkelzug:** Die App gruppiert **heute schon** (Fixkosten → Einnahmen → Budget),
nur stumm und ohne Beschriftung. Kategorien sind dieselbe Sache mit anderer Regel und
mit Namen.

## B2 · Das Aussehen — **Variante A gewählt**

| | Variante | Bringt | Kostet |
|---|---|---|---|
| **A** | ✅ **Stapel-Kachel im Kartenformat — GEWÄHLT.** 136 px, neutraler Grundton statt roter/türkiser Tönung, **kein Status-Icon**, gestapelte Kanten darunter, farbige linke Kante (rot = drinnen ist etwas offen, türkis = alles erledigt) | Die Reihe bleibt **eine** homogene Reihe. Vollwertiges Ablageziel. Zahl an derselben Stelle wie bei Karten | Sieht einer Karte **ähnlich** — und über jeder echten Karte liegt eine unsichtbare Klickfläche, die „bezahlt" umschaltet und die Sparrate bewegt. Die Unterscheidung muss durch Ton, fehlendes Icon und Stapelkante wirklich tragen |
| **B** | **Flache Klammer**, 172 px, vertikal zentriert | Verwechslung ausgeschlossen | **Am Entwurf sichtbar geworden:** aufgeklappt springt die Oberkante massiv — flache Klammern in der Mitte, hohe Karten oben. Gegen „Ruhe vor Betonung". Breiterer Slot: 7 statt 5 Pfeilklicks |
| **C** | **Nur Trennung, kein Zuklappen** | Kein Regelkonflikt, keine neue Geste, kein Fehlklick-Risiko | **Löst das Hauptproblem nicht.** 32 Karten + 10 Trenner = **36** Pfeilklicks — der Weg wird länger. Bewusst als Beleg dabei |

**Die Rolle hat die drei Varianten gerendert und angesehen** (Playwright, 1440 px,
`@2x`). Der Nachteil von B ist dabei nicht vermutet, sondern beobachtet worden.

## B3 · Die Geste — die „Sackgasse" ist auflösbar

Befund `U15` sagt, es sei **keine freie Geste übrig**: Klick ist durch den Tap-Catcher
belegt, Hover durch das ⋯-Icon, Hover-Aufklappen ist das `LL-6`-Anti-Muster, Touch ist
projektweit verboten.

**Das ist zu scharf formuliert.** Der Tap-Catcher ist eine Eigenschaft **der Karte**,
nicht der Fläche: `card-interactive.tsx` rendert ihn nur bei `effectiveTappable` —
Ghost-Karten haben keinen, INCOME-Karten mit Fragment ebenfalls nicht. Eine Kategorie ist
keine Karte und hat folglich keinen. **Klick ist technisch frei.**

Was bleibt, ist eine echte **gestalterische** Frage: Darf dieselbe Geste an zwei Orten
derselben Reihe Verschiedenes tun? Antwort: ja — wenn die beiden Orte **sichtbar
verschieden** sind, wie Ordner und Datei. Das verlagert die Last aufs Aussehen (B2) und
macht sie dort entscheidbar, statt sie als Sackgasse stehen zu lassen.

**Entscheidung:** Klick klappt auf. **Der Verlauf liegt im ⋯-Menü**, nicht auf dem Klick —
Aufklappen ist die häufige Handlung, der Verlauf die seltene, und die direkte Geste
gehört der häufigen. Karte und Kategorie bekommen denselben Menüpunkt auf zwei Ebenen
(deckt sich mit `M7`).

## B4 · Drop auf eine zugeklappte Kategorie

Befund `U1` (BLOCKER): Ein Drop braucht heute eine Karten-ID, eine zugeklappte Kategorie
hat keine.

> **⚠️ ABGELÖST am 13.08.2026 (Sprint v2-18) — nach dem ersten echten Zuordnen.**
>
> Die Entscheidung unten war plausibel und ist in der Praxis durchgefallen. Elf Ordner
> auf einmal aufzuklappen schiebt die Zielkarte weit nach rechts aus dem Bild — und
> weil die Maustaste gedrückt ist, lässt sich das Karussell in diesem Moment **nicht
> scrollen**. Der Zug endet im Nichts, und zwar umso sicherer, je mehr Ordner es gibt.
> Die Runde hat den Fall am Entwurf nicht sehen können: Dort war die Reihe kurz und
> niemand hielt eine Maustaste.
>
> **Es gilt jetzt:** Es öffnet sich **nichts** von selbst. Wer zuordnen will, klappt
> den Zielordner **vorher** auf; während des Zugs bleibt genau er offen.
>
> `U1` ist damit nicht wieder offen, sondern **anders gelöst** — nicht durch
> automatisches Aufklappen *während* des Zugs, sondern durch bewusstes Aufklappen
> *davor*. Neue Regel: Design-Doku §8 „Aufklappen".
>
> **Der zweite Halbsatz unten war ohnehin nie wahr:** „Die Kategorie-Kachel bleibt
> daneben ein gültiges Ziel" — die Anlege-Geste aus **A2** wurde in v2-17 **nicht
> gebaut**, und das ist im Review von v2-17 nicht benannt worden. Sie steht seit v2-18
> als eigene Zeile in der Roadmap.

**Entscheidung (abgelöst):** **Beim Anfassen einer Zahlung öffnen sich alle
Kategorien**, beim Loslassen kehren sie in den vorherigen Zustand zurück. Beim Arbeiten
ist alles offen, beim Ansehen ist es aufgeräumt. Die Kategorie-Kachel selbst bleibt
daneben ein gültiges Ziel — dort greift die Anlege-Geste aus **A2**.

## B5 · Drei Details, die sich erst am Entwurf gezeigt haben

**Der Ordner trägt ein Vorzeichen, die Karte nicht.** Auf einer Karte transportiert der
Typ die Richtung („Fixkosten" = Abgang). Ein Ordner hat keinen Typ und mischt beides —
in „Abos" liegen acht Ausgaben und zwei Erstattungen. Ohne Vorzeichen wäre nicht lesbar,
wohin die 374,02 € wirken. Deshalb `−374,02 €` und `+69,51 €`.

**Ein offener Ordner steht in einer Klammer** — eine durchgehende Grundlinie unter seinen
Karten. Ohne sie verliert man beim Weiterscrollen die Zuordnung: „Abos" ist mit zehn
Karten fast zwei Bildschirmbreiten lang, die Kachel ist dann längst aus dem Bild.

**Ordner mit einem einzigen Kind bleiben normale Ordner.** Lebensmittel hat im Juli nur
„Haushaltsgeld", Einkommen immer nur das Netto. Zugeklappt sparen sie keinen Platz und
kosten einen Klick — aber sie sind der Ort für den Verlauf und für neue Karten, und im
nächsten Monat können zwei darin liegen. Eine Sonderregel „ab zwei Kindern ein Ordner"
ließe die Reihe bei jedem Monatswechsel die Form wechseln.

## B6 · „Ohne Kategorie" steht hinten und erscheint nur, wenn er nicht leer ist

**Entscheidung:** Letzter Ordner der Reihe, unmittelbar vor dem leeren Platz. Auf ihn
wirkt dieselbe Regel wie auf alle anderen (**A8**): Ohne Karten wird er im Monat **nicht
angezeigt**. Der Name bleibt **„Ohne Kategorie"**.

**Begründung:** Befund `D12` nennt den kategorielosen Zustand einen **Zufluss**, keinen
Restbestand — beide Anlage-RPCs kennen keine Kategorie, jeder Klick auf den leeren Platz
erzeugt eine kategorielose Karte. Ein Behälter dafür ist also dauerhaft nötig, aber er
soll keine dauerhafte Mängelliste sein. Die Sichtbarkeits-Regel löst beides: Er ist genau
dann da, wenn es etwas zu tun gibt.

**Begründung für hinten statt vorn:** Er soll nicht das Erste sein, was man sieht. Und er
steht so unmittelbar neben dem leeren Platz — also dort, wo kategorielose Karten
überhaupt entstehen. Die Zuordnung entsteht durch Nähe, wie schon bei `von X €` auf der
gemeinsamen Karte und bei der Ausstehend-Anzeige über den Karten.

**Verworfen:**
- *Vorn in der Reihe:* zeigt die Arbeit sofort, macht aber jeden Blick aufs Dashboard mit
  einer Mängelliste auf. Das ist Betonung, wo Ruhe hingehört.
- *Kein Behälter, lose Karten am Ende:* Drei stumme Karten ohne Klammer wären
  uneindeutig — man sähe nicht, ob sie zu nichts gehören oder ob nur die Kachel aus dem
  Bild gescrollt ist.
- *Der Name „Sonstiges":* freundlicher, aber er klingt nach einer echten Kategorie, in
  der Dinge liegen bleiben dürfen. Genau diese Einladung soll der Behälter nicht
  aussprechen.

## B7 · Der Aufklapp-Zustand überlebt den Monatswechsel

**Entscheidung:** Aufgeklappte Ordner bleiben beim Monatswechsel aufgeklappt. Beim Laden
der Seite ist **alles zu**; es findet keine Persistierung statt.

**Begründung:** Befund `U10` hält fest, dass es für beide Lesarten einen Präzedenzfall
gibt — Overlays werden per `useEffect` auf `targetMonth` zurückgesetzt (LL-5), der
Übertrags-Schalter überlebt bewusst, weil er eine **Ansichts-Vorliebe** ist. Der
Aufklapp-Zustand gehört in die zweite Klasse: Wer an „Abos" arbeitet und Januar bis Juli
durchgeht, will nicht siebenmal neu aufklappen.

**Die Sorge aus `U10` entschärft sich von selbst:** Eine im August geöffnete Kategorie
kann im September leer sein — dann wird sie nach **A8** gar nicht angezeigt, und der
Zustand läuft ins Leere, ohne etwas anzurichten.

**Der Startzustand ist das Versprechen:** elf Ordner statt 32 Karten. Deshalb beim Laden
alles zu.

## B8 · Umsortiert wird über das Kontextmenü — und dort entstehen auch neue Kategorien

**Entscheidung:** Neuer Eintrag `Kategorie ändern …` im ⋯-Menü **der Karte**. Er öffnet
ein Overlay mit der Liste der bestehenden Kategorien plus `Neue Kategorie …`.
**Karten werden nicht ziehbar.**

**Begründung gegen das Ziehen:** Es wäre die natürlichere Geste, kollidiert aber hart mit
dem Tap-Catcher. Die App müsste zwischen „kurz klicken = bezahlt" und „ziehen =
umsortieren" auf derselben Fläche unterscheiden; ein missratener Zug schriebe stumm
`manually_paid` und bewegte die Sparrate. Das ist dieselbe Doppelbelegung, die bei der
Aufklapp-Geste vermieden wurde (`U3`). Zwei Klicks sind leicht genug für etwas, das man
pro Karte einmal tut — und *leicht* muss es sein, weil manche Karte in zwei Kategorien
passt (Fitnessstudio ist Sport **und** kündbares Abo).

**Damit ist auch Gestaltungsfrage 3 der Befunde beantwortet** („Wo wird eine Kategorie
angelegt?"): **ausschließlich hier.** Kein Einstellungs-Bereich — §10 schließt einen
separaten Screen aus, und `U14` zeigt, dass er der erste Ort der App wäre, der nicht das
Dashboard ist.

**Revision gegenüber dem ersten Vorschlag der Runde:** Im Dialog war zunächst der leere
Platz als Anlage-Ort genannt worden. Der Menüpunkt ist besser, weil es dann **einen** Ort
gibt statt zwei — und weil daraus eine stärkere Eigenschaft folgt: **Eine Kategorie
entsteht dadurch, dass man ihr eine Karte gibt.** Eine leere Kategorie kann so gar nicht
erst entstehen.

**Folge für den Lebenszyklus:** Nimmt man die letzte Karte heraus, verschwindet die
Kategorie aus der Anzeige, bleibt aber in der Auswahlliste und lässt sich jederzeit wieder
befüllen. Endgültig entfernt wird sie über das ⋯-Menü ihrer Kachel (**A7**).

## B9 · Die Kopfzeile „noch fällig" bleibt unberührt

**Entscheidung:** Die Ausstehend-Anzeige aus `LQ-2` ändert sich **nicht**, und die
Kategorie-Kachel zeigt **keinen** Termin.

**Begründung:** Die Zahl summiert über alle aktiven Karten des Monats — ob eine Karte
sichtbar ist oder in einem zugeklappten Ordner steckt, spielt keine Rolle. Sie ist eine
Aussage über den **Monat**, nicht über die **Ansicht**.

**Warum kein Termin auf der Kachel:** Rechts in der Statuszeile steht dort bereits
`[N] offen`, und das ist die wichtigere Angabe — sie beantwortet *muss ich hier ran*, also
die oberste Priorität des Users. Der Termin beantwortet *wann* und steht als Summe schon
in der Kopfzeile. Wer den einzelnen Tag braucht, klappt auf.

**Bekannte Doppeldeutigkeit, bewusst in Kauf genommen:** `[N] offen` auf dem Ordner und
die Kopfzeile folgen **verschiedenen Regeln**. Der Ordner zählt den **Zustand** (Karten
auf „Offen"), die Kopfzeile macht eine **Vorhersage** und lässt Posten weg, deren Termin
verstrichen ist (§8). Am 6. August kann „Wohnen" also `3 offen` zeigen, während die Miete
in der Kopfzeile nicht mehr mitzählt. Das ist bestehendes Verhalten seit v2-15 und dort
ausdrücklich festgeschrieben — die Kategorien machen es nur sichtbarer. **Wer es später
als Fehler meldet, findet hier die Begründung.**

---

# Teil C — entschieden am 08.08.2026, im Bau-Sprint v2-17

Vier Punkte, die beim Schneiden von `KAT-1`/`KAT-2`/`KAT-3` aufliefen. **C1 ist neu und
war in Teil A/B nicht bekannt** — er widerlegt die Ursachenanalyse unter „Neuer
Fallstrick" (siehe dort, korrigiert). C2 bis C4 waren unter „Was NICHT entschieden
wurde" gelistet und sind damit abgeräumt.

## C1 · Der Cent geht **zwischen** den Ordnern verloren, nicht **in** einem

**Gemessen am 08.08.2026 gegen Produktion, nur `SELECT`:** Die Lücke von 0,01 € besteht
in **allen zwölf Monaten** 2026, nicht nur im Juli.

| | Juli 2026 |
|---|---|
| `calculate_sparrate_for_month` | **−322,75 €** |
| Summe der elf Ordner, jeder für sich exakt gerechnet und gerundet | **−322,74 €** |
| exakter Kartenwert (ungerundet) | −4.487,8556895729755… |

**Warum die bisherige Anweisung nicht reicht.** „Ordner-Summe aus ungerundeten
Kartenwerten bilden und erst am Ende runden" ist **notwendig, aber nicht hinreichend**.
Die Sparrate rundet **einmal ganz zum Schluss über alles**: 4.165,11 − 4.487,85569 =
−322,74569 → −322,75. Elf einzeln gerundete Ordner werfen die Nachkommastellen vorher
weg und landen auf −322,74. Das ist mit unabhängiger Rundung **prinzipiell** nicht
heilbar — es liegt nicht an einer schlecht gewählten Reihenfolge der Operationen.

**Beleg, dass es in Teil A schon drin steckte, aber unbemerkt:** Die Aufstellung in
**§A4 summiert sich nachgerechnet selbst auf −322,74 €**, obwohl darüber −322,75 €
steht. Die Zeile „Deckt sich exakt mit `calculate_sparrate_for_month`" war eine
Zusicherung, keine Prüfung — genau der Fall, den **LL-22** beschreibt.

**Entscheidung: Restverteilung.** Alle Ordner werden exakt gerechnet und gerundet; die
verbleibende Differenz wandert auf den **betragsgrößten** Ordner. Die Spalte geht damit
in jedem Monat auf, per Konstruktion und nicht per Zufall.

Formal: Die Kartenordner werden so verteilt, dass ihre Summe exakt
`Sparrate − Einkommens-Ordner` ergibt. Der Einkommens-Ordner selbst trägt den Netto-Wert
unverändert; er ist keine Kartensumme und hat keinen Rundungsrest.

**Warum der betragsgrößte Ordner und nicht der mit dem größten Rundungsrest:** Beide
sind im Controlling üblich. Der betragsgrößte ist **stabiler** — er wechselt selten,
während der größte Rest praktisch jeden Monat woanders liegt. Und die relative
Verzerrung ist dort am kleinsten: ein Cent auf 1.148 € ist 0,0009 %.

**Bekannter Preis, benannt:** Ein Ordner zeigt einen Cent neben seinem eigenen exakten
Wert — im Juli **Wohnen mit −1.148,18 € statt −1.148,17 €**. Wer nur diesen einen Ordner
gegen seine drei Karten nachrechnet, findet die Abweichung. Das ist der Preis dafür,
dass die **Spalte** aufgeht, und die Spalte war die ausdrückliche Bedingung.

**Verworfen:**
- *Zwölfte Zeile „Rundung −0,01 €":* vollkommen ehrlich, erzeugt aber in **jedem** Monat
  eine Zeile, die kein Lebensbereich ist. Steht gegen „Ruhe vor Betonung", und sie wäre
  dauerhaft da, nicht nur im Ausnahmefall.
- *Den Cent hinnehmen:* steht gegen die ausdrückliche Bedingung aus §A4.
- *Ordner in ganzen Euro zeigen:* macht die Lücke nicht kleiner, sondern größer
  (bis 0,50 € je Ordner), und bricht die Zahlenform der Karten daneben.

## C2 · Die Reihenfolge der Ordner ist die Liste aus §A3

**Entscheidung:** Einkommen · Wohnen · Lebensmittel · Mobilität · Abos &
Mitgliedschaften · Versicherungen · Hobby · Urlaub · Geschenke & Anlässe ·
Persönliches · Rückflüsse · **Ohne Kategorie**.

**Begründung:** Es ist die Reihenfolge, in der der User seine Kategorien selbst
aufgeschrieben hat, und sie liest sich vom Notwendigen zum Freiwilligen. Vor allem ist
sie **stabil**: Ein Ordner steht in jedem Monat an derselben Stelle, man findet ihn
blind. Sie wird als änderbare Sortiernummer (`card_categories.sort_order`) gespeichert,
nicht in Code einbetoniert — damit hat `M5` später einen Ort, ohne dass eine Migration
nötig wird.

**Verworfen:** *Nach Betrag absteigend* — zeigt sofort, wo das Geld hingeht, ordnet die
Reihe aber in jedem Monat neu; das ist Betonung, wo Ruhe hingehört, und es zerstört das
Muskelgedächtnis. *Alphabetisch* — stabil, aber ohne Aussage.

## C3 · Der Ordner im Zukunftsmonat ist blass und meldet nichts

**Entscheidung:** Sind alle Kinder Forecast, ist der Ordner es auch: grauer Grundton,
**keine farbige linke Kante**, **kein** `[N] offen` und **kein** `erledigt` — nur
`[N] Posten`.

**Begründung — und das ist kein Schönheitsargument:** Ohne diese Regel stünde am Ordner
im Zukunftsmonat **türkis `erledigt`**, weil null Kinder auf „Offen" stehen. Das wäre
eine Falschaussage über einen Monat, in dem noch gar nichts fällig war. Damit ist `U12`
vollständig beantwortet: Mischzustände über `[N] offen`, Forecast über diese Regel.

## C4 · Zuschnitt: ein Sprint, vier Phasen

**Entscheidung:** `J1` → `KAT-1` → `KAT-3` → `KAT-2`, ein Commit je Phase.

**Zwei Abweichungen von der ursprünglichen Reihenfolge, beide begründet:**

**`KAT-3` steht vor `KAT-2`, nicht dahinter.** Die Kategorie-Kachel trägt eine Zahl —
das ist der Kern von Variante A. Diese Zahl darf nach **Arbeitsregel 1** nicht im
Browser entstehen. `KAT-2` vor `KAT-3` ergäbe also entweder eine Kachel ohne Betrag
(nutzlos) oder eine verbotene Frontend-Rechnung.

**Ein Sprint statt zwei.** Die Datenbank wird dadurch **einmal** angefasst statt
zweimal — und damit auch die Übungs-Datenbank nur einmal geholt, was jedes Mal
bedeutet, ein fremdes, täglich genutztes Projekt zu pausieren. Ein erster Sprint aus
`J1` + `KAT-1` allein hätte zudem fast nichts Sichtbares für den Browser-Test ergeben:
einen Menüpunkt, aber keine Ordner.

---

## Bewusste Abweichungen von den Befunden vom 04.08.2026

| Befund | Dort | Hier | Grund |
|---|---|---|---|
| `D3` | Zuordnung als Zeitreihe mit `effective_month` | **einfache Eigenschaft, rückwirkend** | Eine Zeitreihe zerschneidet jede Verlaufskurve an jeder Umsortierung (A6) |
| `U6` | „Kategorie" ist belegt, Begriff muss weichen | **Begriff bleibt, der alte Gebrauch weicht** | Das Wort steht nirgends in der sichtbaren Oberfläche; §12 kennt es nicht (A9) |
| `U15` | „Es ist keine freie Geste übrig" | **Klick ist frei** | Der Tap-Catcher hängt an der Karte, nicht an der Fläche (B3) |
| `U2` | Verfassung ändern **oder** ohne Navigationsebene auskommen | **dritter Weg: präzisieren** | Die Verbote treffen einen zweiten *Ort*, nicht eine Faltung (B1) |

---

## Neuer Fallstrick — Rundung mit Anker-Wirkung

> **⚠️ Korrigiert am 08.08.2026 (Teil C1).** Der ursprüngliche Text dieses Abschnitts
> stand hier bis zum Bau-Sprint v2-17 und lokalisierte die Ursache **falsch**. Er
> lautete: *„Die Ursache sitzt in Wohnen: Miete, Strom und Internet sind Split-Anteile
> mit vielen Nachkommastellen (1089,25968… + 36,04168… + 22,87216… = 1148,17353…).
> Einzeln gerundet fehlt ein halber Cent."* — Nachgemessen stimmt das nicht: Innerhalb
> von „Wohnen" liefern beide Rundungsreihenfolgen dasselbe Ergebnis (−1.148,17 €). Der
> Cent geht **zwischen** den Ordnern verloren, nicht in einem. Der Abschnitt bleibt
> stehen, weil die daraus gezogene Anweisung richtig — nur unvollständig — war.

**Die Kategorie-Summe muss aus ungerundeten Kartenwerten gebildet und erst am Ende
gerundet werden.** Das ist **notwendig**. Es ist aber **nicht hinreichend**: Auch dann
ergibt die Aufstellung aus A4 **−322,74 €** statt −322,75 €.

Die Ursache liegt eine Ebene höher. `calculate_sparrate_for_month` rundet **einmal ganz
am Schluss über alles** (`round((netto + Σ income) − Σ fixed − Σ budget, 2)`). Elf
unabhängig gerundete Ordner können diese eine Rundung nicht nachbilden, gleichgültig
wie sorgfältig jeder einzelne rechnet. **Lösung: Restverteilung, siehe C1.**

Das ist **`LL-24` in freier Wildbahn** („Runden ist eine Entscheidung mit Anker-Wirkung —
prüfen, ob die Gegenseite genauso rundet"), und zwar in einer schärferen Fassung als
LL-24 sie bisher kannte: Hier rundet die Gegenseite nicht nur **anders**, sondern
**seltener**. Besondere Schärfe zusätzlich: Der User ist Wirtschaftsmathematiker mit
Controlling-Hintergrund und hat die aufgehende Summe **ausdrücklich zur Bedingung
gemacht**. Ein Cent Abweichung ist damit kein Schönheitsfehler.

---

## Nebenbefunde aus dieser Runde

**① Die automatische Zuordnung greift bei gemeinsamen Karten praktisch nie.**
Gemessen seit Januar 2025:

| Zahlung | Buchungen | zugeordnet |
|---|---|---|
| Miete (Domi) | 19 | **0** |
| Internet (Domi) | 19 | **0** |
| Rechtsschutz (Domi) | 19 | **0** |
| Essen (Domi) | 19 | **2** |

**Von 76 gemeinsamen Monatszahlungen sind zwei zugeordnet** — bei 19 Monaten identischem
Text, identischem Betrag, identischem Tag. Ursache ist die Split-Systematik: Die Karte
„Miete" plant **1.904 €** (Haushalt), überwiesen werden **1.089,26 €** (der Anteil);
`calculate_match_confidence` gewichtet `amount_match` mit 0,30, und 43 % Abweichung
reichen nie für die 95-%-Schwelle.

**Folge für die Erwartungshaltung:** Kategorien **erben** die automatische Zuordnung
korrekt — es gibt heute nur fast nichts zu erben. Kein Gegenargument gegen Kategorien,
aber der schärfste Beleg dafür, dass **Paket 5** der eigentliche Engpass ist.

**② Zwei wiederkehrende Zahlungen haben überhaupt keine Karte** — Rundfunkgebühren
(8 Buchungen, ⌀ 44,75 €) und Privathaftpflicht (2 Buchungen, ⌀ 29,28 €). Sie fehlen damit
in der Planung. Der User hat sie bereits zugeordnet (Wohnen bzw. Versicherungen), sobald
Karten dafür bestehen.

**③ Das Gemeinschaftskonto ist nicht als eigenes Konto hinterlegt** — die vier IBANs in
`profiles.own_ibans` enthalten es nicht. Überweisungen dorthin sind deshalb normale
Ausgaben und lassen sich Karten zuordnen; im Juli hängen 200,00 € + 57,50 € „Ausgleich
Mehrkosten" an „Haushaltsgeld". Der Lebensmittel-Fall funktioniert also bereits.
**Aber:** Der Nachschlag heißt jedes Mal anders — „Ausgleich Haushaltsgeld" (April),
„Zusätzliches Geld Essen" (Juni), „Ausgleich Gemeinschaftskonto" (Juni), „Ausgleich
Mehrkosten" (Juli). Nur die letzte ist zugeordnet.

**④ Der Lebensmittel-Verlauf zeigt den eigenen Anteil, nicht die Haushaltskosten.**
Bei 500 € Gesamtausgaben erscheinen ~250 €. Die Form der Kurve stimmt, die Höhe ist etwa
halb; verdoppeln wäre falsch, weil der Anteil schwankt (Juli: 257,50 €). Budget-Karten
können den Split nicht tragen — `budget_never_shared` schließt GEMEINSAM aus.

**⑤ CLAUDE.md §6 Stolperfalle 4 ist falsch.** Dort steht, Hot-Path-RPCs nähmen kein
`p_user_id`, einzige Ausnahme sei `get_split_factor`. Tatsächlich ist die Signatur
`calculate_sparrate_for_month(p_user_id uuid, p_month date)` — ebenso
`calculate_planned_sparrate_for_month`. Nur `calculate_card_amount_for_month` und
`is_card_active_in_month` kommen ohne aus. Wer nach der Stolperfalle arbeitet, baut den
Aufruf falsch. **Korrektur gehört in CLAUDE.md, mit User-Freigabe (§7 Regel 14).**

---

## Abgleich gegen die fünf Grundsätze

| Grundsatz | Urteil |
|---|---|
| **Ein Screen, ein Monat, eine Zahl** | ✓ Kein zweiter Ort, keine zweite Reihe, kein Reiter — die Kategorie breitet sich an ihrem Platz aus (B1). Die Sparrate bleibt die eine primäre Zahl; die Ordner-Beträge summieren sich zu ihr, statt mit ihr zu konkurrieren. |
| **Schmale Palette** | ✓ Keine neue Farbe. Der Ordner ist **neutral** getönt — Rot und Türkis bleiben den Karten-Zuständen vorbehalten und erscheinen am Ordner nur als schmale Kante (offen / erledigt), also in exakt ihrer bisherigen Bedeutung. |
| **Ruhe vor Betonung** | ✓ Der Hauptgewinn ist Ruhe: 32 → 11 Elemente im Juli, 19 → 7 im Januar. Variante B wurde **wegen** der springenden Oberkante zurückgestellt. |
| **Werkzeug ist nicht Produkt** | ✓ Kein Regler, kein Filter, kein Panel. Die Kategorie ist Inhalt, kein Bedienelement. |
| **Ehrlichkeit vor Beruhigung** | ✓ **trägt diese Runde.** Der Ordner statt des Sammelpostens verhindert eine nicht lesbare Zahl · das Vorzeichen macht die Richtung sichtbar · die Summe geht auf den Cent auf statt „ungefähr" · und die Runde meldet ungefragt, dass die automatische Zuordnung bei gemeinsamen Karten heute praktisch nicht greift. |

---

## Was NICHT entschieden wurde

> **Drei Punkte dieser Liste sind am 08.08.2026 in Teil C entschieden worden** —
> Reihenfolge (→ C2), Zukunftsmonat (→ C3) und der Rundungs-Cent, der hier gar nicht
> stand (→ C1). Sie sind unten durchgestrichen stehen geblieben, damit sichtbar bleibt,
> was die Runde offen ließ und was der Bau-Sprint nachziehen musste.

- ~~**In welcher Reihenfolge die Kategorien untereinander stehen.**~~ → **C2**: die Liste
  aus §A3, gespeichert als änderbare Sortiernummer. `M5` bekommt damit einen Ort.
- **Wie zwei gleichnamige Karten in einem Ordner auseinanderzuhalten sind** —
  „Fahrradzubehör" existiert im Juli zweimal (34,69 € und 305,45 €). Heute trennt sie der
  Abstand in der langen Reihe; in einem Ordner stehen sie nebeneinander.
  **Bleibt offen und wird in v2-17 bewusst nicht gelöst:** Die beiden Beträge liegen eine
  Größenordnung auseinander und die Statuszeile trägt bereits verschiedene Termine
  (`am 14.` / `am 21.`). Ein zusätzliches Unterscheidungsmerkmal wäre Lärm; das Umbenennen
  ist Sache des Users, nicht der App.
- ~~**Wie die Kategorie-Kachel im Zukunftsmonat aussieht.**~~ → **C3**: blass, ohne Kante,
  ohne Flagge. `U12` ist damit **vollständig** beantwortet.
- **Ob eine Kategorie kenntlich macht, dass ihre Zahl abgeleitet ist.** Sie ist immer die
  Summe ihrer Kinder — eine eigene Kennzeichnung wäre vermutlich Lärm, ist aber nicht
  geprüft. **Bleibt offen.**
- ~~**Wohin die Karte „Deutschlandticket Mama … | Abo 101627874 zum 01.05.2026"
  gehört.**~~ → **entschieden am 08.08.2026: Geschenke & Anlässe.**
  Beim Abgleich der §A3-Liste gegen den Bestand aufgefallen: Diese Karte (ONCE, Mai
  2026) war in §A3 nicht zugeordnet — „Deutschlandticket" dort meint die eigene
  Monatskarte. **Mobilität** (Verkehrsmittel) und **Geschenke & Anlässe** (für Mama)
  waren beide plausibel, deshalb wurde nicht geraten (Arbeitsregel 3): Sie startete in
  „Ohne Kategorie" und wurde vom User zugeordnet — genau der Weg, für den der Behälter
  da ist (`B6`).
  **Damit sind alle 46 Karten eingeräumt**, und „Ohne Kategorie" erscheint in keinem
  Monat mehr. Der Mai fällt von zehn auf neun Ordner.
- **`KAT-4`** (Ausgabenverlauf) bleibt hinter der Datenbasis. Von Januar bis April hängen
  **0 %** der Ausgaben an einer Karte, im Juli 74 % — eine Kurve über 2026 zeigte den
  Kurationsfortschritt, nicht das Ausgabeverhalten (Befund `D4`). Der **Ort** ist mit B3
  entschieden (⋯-Menü, zusammen mit `M7`), der **Inhalt** nicht.
- **`M2`** (Verben und Gesten des Karten-Lebenszyklus) und **`B2-F`** — nicht Gegenstand.

---

## Was das entsperren wird

| Thema | Status nach Abschluss von Teil B |
|---|---|
| **`KAT-1`** (eigene Tabelle, Anlegen/Ändern/Löschen) | schneidbar. Kein `cards`-Eintrag (`D1`), kein Einstellungs-Screen (§10, `U14`), Papierkorb braucht einen neuen Entitätstyp (`D7`) |
| **`KAT-2`** (Gruppierung im Karussell) | schneidbar, sobald B2/B3/B4 stehen |
| **`KAT-3`** (Kategorie-Zahl server-seitig) | schneidbar. **Achtung:** ungerundet summieren, erst am Ende runden — siehe „Neuer Fallstrick". Räumt den N+1-Ladeweg mit auf (`D14`) |
| **Paket 5** (bessere automatische Zuordnung) | nicht mehr durch Paket 4 blockiert — und laut Nebenbefund ① dringender als angenommen |

**Vorher fällig:** Hausaufgabe `J1` (alte Migrationen als Datei nachziehen). Ohne sie gibt
es keine versionierte Basis, gegen die ein Eingriff in eine Rechenfunktion diffen könnte
(`D15`).

---

## Doku-Folge

Patch nach §7 Regel 14 (LL-16) mit Versions-Bump. **Minor-Bump, kein Patch-Bump:** §1
wird präzisiert, §8 bekommt eine ganz neue Struktur, §12 einen neuen Block — und §11
benennt einen bestehenden Begriff um.

> **Ziel korrigiert am 08.08.2026:** Dieser Abschnitt nannte ursprünglich **v3.4.0** als
> Ziel, ausgehend von v3.3.1. Inzwischen ist **v2-16 gemergt** und hat die Design-Doku
> selbst auf **v3.4.0** gehoben. Die Nummer ist damit vergeben; der Patch dieses Sprints
> geht auf **v3.5.0**.

**Zeitpunkt:** Die Design-Doku gehörte zum Zeitpunkt dieser Runde der parallel laufenden
Bau-Sitzung (`RM-2` / `PA-1`). Deren Merge ist erfolgt — der Patch läuft in v2-17.

| Was | Wohin |
|---|---|
| Präzisierung „zweiter Ort ≠ Faltung"; Akkordeon ist kein Reiter | Design-Doku **§1** |
| Kategorie als Ordner: Definition, Zahl als Saldo, Vorzeichen, Klammer, Sichtbarkeits-Regel | Design-Doku **§8** (Karussell) |
| Aussehen (Variante A), Ablageziel, Anlege-Geste beim Drop, Aufklapp-Zustand | Design-Doku **§7** + **§8** |
| Reihenfolge: Einkommen vorn, „Ohne Kategorie" hinten | Design-Doku **§8** |
| Menüpunkt `Kategorie ändern …`; Verlauf im ⋯-Menü, gemeinsam mit `M7` | Design-Doku **§7** (Kontextmenü) |
| Karten bleiben **keine** Drag-Quellen — ausdrücklich festhalten, damit es nicht später „nachgerüstet" wird | Design-Doku **§7** |
| Vollständige neue Copy: Kategorie-Label, `Kategorie ändern …`, `Neue Kategorie …`, `Ohne Kategorie`, `[N] Posten`, `[N] offen`, `erledigt`, Lösch-Toast | Design-Doku **§12** — neuer Block, heute existiert **keine einzige** Zeile |
| „Kategorie-Badge" → **„Vorschlag"** umbenennen | Design-Doku **§11** |
| Kopfzeile `LQ-2` bleibt unberührt; Doppeldeutigkeit `[N] offen` ↔ „noch fällig" benennen | Design-Doku **§8** |
| Kategorie-Summe **ungerundet** bilden, erst am Ende runden | Schema-Doku **§3/§4** bei `KAT-3` |
| Stolperfalle 4 korrigieren (`p_user_id`) | **CLAUDE.md §6** — eigener Patch, User-Freigabe |

---

*Design-Entscheidung · Antigravity Finance · 07./08. August 2026 · Rolle
`design-direktor` · sechs Gestaltungsfragen plus vier Detailfragen, alle vom User
bestätigt · Teil A im Dialog, Teil B nach Ansicht der Entwürfe am Rechner ·
**Teil C am 08.08.2026 im Bau-Sprint v2-17 nachgezogen** (vier weitere Entscheidungen,
darunter eine Korrektur an der eigenen Fallstrick-Analyse) ·
Entwurf: `design-system/entwuerfe/kat-kategorien.html` (lebt, bis gebaut ist)*
