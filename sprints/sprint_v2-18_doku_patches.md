# Doku-Patches — Sprint v2-18

> **Verfahren:** LL-16 / §7 Regel 14 — Anker + Patch-Satz je Stelle.
>
> **Betroffen:** **Design-Doku** (3.5.0 → **3.6.0**) und der **Record** zu den
> Kategorien. Die **Schema-Doku bleibt unberührt** — v2-18 hat die Datenbank nicht
> angefasst.
>
> **Minor-Bump statt Patch-Bump:** Eine ausdrücklich festgeschriebene Regel wird
> **aufgehoben** (`B4`), nicht nur nachgezogen.
>
> **CLAUDE.md steht am Ende als Vorschlag** und ist **nicht** angewendet.
>
> **Angewendet am 13.08.2026**, D1–D6 und R1. Anker einzeln auf Eindeutigkeit geprüft.

---

## D1 · Header — Version und Status

**Anker:** `**Version:** 3.5.0 (V2 · Sprint v2-17 — Kategorien im Karussell)`

**Patch:** **3.6.0 (V2 · Sprint v2-18 — zwei Befunde aus der Nutzung)**; Status-Zeile
nennt, dass `B4` seit v2-18 abgelöst ist.

## D2 · Changelog — neuer Eintrag v3.6.0

**Anker:** `> **Changelog v3.5.0 (08.08.2026, Sprint v2-17 · ...`

**Patch:** Neuer Block **davor** (jüngster zuerst). Er nennt beide Befunde mit ihren
Messwerten und den Grund für den Minor-Bump.

## D3 · §8 „Aufklappen" — die Tabellenzeile

**Anker:** `| Beim Anfassen einer Zahlung | **alle** Ordner öffnen sich; beim Loslassen kehren sie in den vorherigen Zustand zurück |`

**Patch:** `| Beim Anfassen einer Zahlung | **nichts öffnet sich von selbst** — es bleibt
offen, was der User vorher aufgeklappt hat |`

## D4 · §8 — der Begründungs-Absatz

**Anker:** `**Warum sich beim Ziehen alles öffnet:** Ein Drop braucht eine Karten-ID, …`

**Patch:** Vollständig ersetzt durch **„Warum sich beim Ziehen NICHTS öffnet — geänderte
Entscheidung"**, mit dem Vorfall, der neuen Regel, der Feststellung dass `U1` anders
gelöst ist, der Folge (bei allen zugeklappten Ordnern gibt es kein Drop-Ziel — gewollt)
und dem ausdrücklich als **überholt** markierten alten Merksatz.

> Der alte Merksatz bleibt zitiert stehen. Wer die Doku später quer liest und ihn
> irgendwo im Kopf hat, soll ihn hier wiederfinden — durchgestrichen, nicht gelöscht.

## D5 · §8 „Fragment-Stack (Rechts)" — feste Höhe und Leerzustand

**Anker:** Die Aufzählung unter `### Fragment-Stack (Rechts)`, Zeile
`- Fragmente sind Drag-Quellen`

**Patch:** Neuer Aufzählungspunkt (feste Höhe `320px`), darunter zwei Absätze: die
Herleitung des Sprungs mit den gemessenen Zahlen und ein **Warnkasten**, dass die
Messung einen Produktions-Build braucht — gegen den dev-Server schrumpft die Differenz
auf 5 px, weil das Entwickler-Panel die Welle auf ihr Minimum drückt. Dazu die
Spezifikation des Leerzustands inklusive der Abgrenzung „angezeigte Liste, nicht
Bestand".

## D6 · §12.11 — Copy des Leerzustands

**Anker:** `| Ordner-Name | `Ohne Kategorie` |`

**Patch:** Neuer Block **Leere Rohmasse** mit der Zeile `Keine offenen Umsätze` plus
Begründung, warum es den Satz gibt und warum „offen" statt „vorhanden".

## R1 · Record `V2/design_direktor_2026-08-07_kategorien.md` §B4

**Anker:** `**Entscheidung:** **Beim Anfassen einer Zahlung öffnen sich alle Kategorien**, beim`

**Patch:** Warnkasten **darüber** („ABGELÖST am 13.08.2026"), die Entscheidung selbst
bleibt als `**Entscheidung (abgelöst):**` stehen. Der Kasten hält zusätzlich fest, dass
der zweite Halbsatz („Die Kategorie-Kachel bleibt daneben ein gültiges Ziel") **nie
zutraf** — `A2` wurde in v2-17 nicht gebaut und im dortigen Review nicht als offen
benannt.

---

# Vorschlag für CLAUDE.md — NICHT angewendet

## C1 · §9 — Juli-Anker auf **−322,74 €**

**Anker:** Die Zeile `| **Juli** | **−322,75 €** |` in der Prüfanker-Tabelle.

**Vorschlag:** `| **Juli** | **−322,74 €** |`

**Das ist keine Regression, sondern der dokumentierte Planfall.** §9 sagt heute schon:

> *„Was sich als Nächstes planmäßig bewegen wird: der erste Monat, in dem eine
> gemeinsame Karte eine zugeordnete Zahlung bekommt. Dann greift `BF-4` — bewusst und
> richtig."*

Genau das ist am 13.08.2026 um 06:05 eingetreten: drei echte Zahlungen wurden den
gemeinsamen Juli-Karten zugeordnet — Miete 1.089,26 €, Strom 36,04 €, Internet 22,87 €.
Vorher rechnete die Karte `Plan × Anteil` = 1.904 × 0,57209… = **1.089,25968…**; jetzt
nimmt sie die **echte Überweisung**, glatt auf zwei Stellen. Die Nachkommastellen, die
den Juli auf −322,745**69** und damit knapp über die Rundungsgrenze hoben, sind weg.

**Nachgeprüft:** Die übrigen elf Monate stehen unverändert, und die Ordner-Spalte ergibt
weiterhin in **allen zwölf** Monaten exakt die Sparrate (Restverteilung aus `C1` hält).
Rechtsschutz ist die vierte gemeinsame Karte und noch **nicht** zugeordnet — sobald sie
es ist, kann der Juli erneut um einen Cent wandern.

**Ergänzungs-Vorschlag für denselben Absatz:** Den Satz „Was sich als Nächstes planmäßig
bewegen wird" umschreiben auf *„ist am 13.08.2026 eingetreten"* — mit dem Hinweis, dass
`BF-4` damit zum ersten Mal in Produktion gegriffen hat und der Rest über Rechtsschutz
noch aussteht.

## C2 · §9 — Sprint-Stand

**Vorschlag:** Letzter Sprint **v2-18**; Design-Doku **v3.6.0**; Roadmap-Zahlen
**10 offene Pakete · 29 Themen · 4 Hausaufgaben · 33 offen · 43 erledigt**; Hinweis,
dass die Zahl der offenen Themen gestiegen ist, weil `KAT-5` sichtbar gemacht wurde.
