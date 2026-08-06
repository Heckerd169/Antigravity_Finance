# Sprint v2-15 — Briefing

> **Themen:** `LQ-1` (Anzeigeseite) + `LQ-2` (Ausstehend-Anzeige) · **Paket 3**
> **Datum:** 06. August 2026 · **Datenbank:** nicht berührt
> **Gestaltung:** vollständig entschieden vor dem Sprint —
> `V2/design_direktor_2026-08-06_liquiditaet_fragment_split.md` §1 und §2,
> Design-Doku v3.3.0 §7 · §8 · §12.3 · §12.4 · §12.9

**Warum beide Themen in einem Sprint.** `LQ-2` rechnet mit dem Fälligkeitstag.
Getrennt gebaut wäre die Ausstehend-Zahl einen Sprint lang eine Blackbox aus
17 abgeleiteten Werten, die man nirgends prüfen kann — genau das Argument, aus dem
die Sichtbarkeits-Entscheidung von `LQ-1` überhaupt entstanden ist.

---

## Ziel

Jede Karte mit Fälligkeitstag zeigt ihn rechts in ihrer Statuszeile und lässt ihn
dort ändern — und die Kopfzeile „Planung" nennt im laufenden Monat, wie viel Geld
noch abgeht und wie viel Budget noch frei ist.

## Nicht-Ziel

Kein Datenbank-Eingriff · kein Kontostand (`L1`) · keine Kreditkarten-Abrechnung
(`L5` → `LQ-3`) · keine Kennzeichnung „abgeleitet vs. bestätigt" je Karte (bräuchte
eine zweite Spalte, im Record ausgeklammert) · nicht `RM-2`, nicht `PA-1` · keine
Änderung an der Sparrate.

---

## Die drei Entscheidungen dieses Sprints

Der Beschluss-Record vom 06.08. hat zwei Punkte ausdrücklich offen gelassen; ein
dritter kam beim Nachbohren dazu. Alle drei sind hier festgehalten, weil sie sonst
nur im Chat stünden (CLAUDE.md §3).

### E-1 · Wann ein Posten aus „noch fällig" fällt

**Entschieden:** Wenn sein Termin **hinter dem heutigen Tag liegt** *oder* eine
**Zahlung an ihm hängt** — verknüpfter Umsatz oder Bezahlt-Häkchen. Beide Signale
wirken, es genügt eines.

**Begründung.** Der Record sagt, die Aussage entstehe „aus dem Fälligkeitstag, nicht
aus einem Bezahlt-Häkchen". Dieser Satz grenzt gegen Befund `L6` ab (das Häkchen
wurde nie benutzt, eine Umsetzung allein darauf meldete alle Posten als offen) — er
verbietet aber nicht, ein *tatsächlich vorhandenes* Signal zu berücksichtigen. „Noch
fällig" heißt „steht noch bevor"; ein abgebuchter Posten steht nicht mehr bevor, auch
wenn sein Termin erst der 23. wäre.

**Wirkung heute: 0,00 €.** Es gibt keinen einzigen August-Umsatz und in der gesamten
Historie kein gesetztes Häkchen. Die Regel greift erst ab dem nächsten Import — und
dann in die richtige Richtung.

**Verworfen:** *nur der Termin* (das Fitnessstudio stünde nach dem Import bis zum 23.
weiter in der Zahl, obwohl das Geld weg ist — die Zahl wäre zu hoch) · *nur die
Zahlung* (durch `L6` ausgeschlossen; der Fälligkeitstag wäre umsonst erhoben).

### E-2 · Was außerhalb des laufenden Monats steht

**Entschieden:** **nichts.** Die Zeile wird dort gar nicht gerendert.

**Begründung.** Im Zukunftsmonat gibt es kein „heute", gegen das gerechnet werden
könnte; alles stünde aus, und die Zahl wäre in Wahrheit die Monatslast — eine andere
Aussage, die sich als Liquiditätsaussage tarnte. Im vergangenen Monat sind alle
Termine verstrichen, die Zahl wäre dauerhaft 0 €, und ein Referenzwert ohne Daten ist
„keine Anzeige", nicht 0 (§7 Regel 17 / `LL-20`). Passt zum Karussell, das im
Zukunftsmonat ohnehin nur Forecast-Karten zeigt.

**Abgegrenzt davon:** Innerhalb des laufenden Monats **wird** eine 0 gezeigt, sobald
alle Termine durch sind. „Es steht nichts mehr aus" ist eine Antwort, kein fehlender
Wert. Nur wenn es die Kartenart im Monat gar nicht gibt, entfällt die Angabe ganz.

### E-3 · Ob die Anzahl der Posten mitsteht

**Entschieden:** **nein** — nur die zwei Beträge.

**Begründung.** Die Kopfzeile trüge sonst vier Zahlen. Die Frage, mit der man
hinsieht, ist eine Betragsfrage („reicht mein Geld"), und die Anzahl beantwortet sie
nicht. Nachzählen kann man ohnehin: Die Karten stehen unmittelbar darunter, und seit
`LQ-1` trägt jede ihren Termin.

---

## Ein vierter Punkt, im Bau entschieden

**Der Herkunftssatz im „Fällig am …"-Overlay.** Der Record empfahl einen Satz mit der
Herleitung (*„Aus deinen Buchungen abgeleitet — 19 Monate, immer am 1. bis 4."*). **So
ist er nicht baubar:** Diese Herleitung steht nirgends in der Datenbank, sondern nur
als Kommentar in `20260806_v2_14_lq1_faelligkeitstag.sql`. Sie zur Laufzeit zu
rekonstruieren hieße, die gesamte Buchungshistorie je Karte zu lesen — genau die
Abfrage, vor der `LL-21` warnt. Sie zu speichern wäre eine neue Spalte und damit ein
Datenbank-Eingriff, den dieser Sprint ausschließt.

**Gebaut, mit Freigabe im Plan:** ein fester Satz ohne Zahlen —
*„Die Tage stammen aus deiner Buchungshistorie — abgeleitet, nicht bestätigt."*
Er trägt dieselbe Ehrlichkeit, behauptet nichts über den konkreten Wert und bleibt
richtig, nachdem der Tag von Hand gesetzt wurde.

---

## Prüfanker

**① Die Sparrate bewegt sich nicht.** Alle zwölf Monate 2026, Ist und Plan,
identisch zu CLAUDE.md §9 — vor und nach dem Sprint gemessen.

**② Die neue Zahl am 06.08.2026:** `312 € noch fällig · 590 € Budget frei`.

Regel statt Instanz (`LL-19`): Ein fester Posten zählt genau dann, wenn er eine
aktive Fixkosten- oder Einnahmen-Karte des Monats ist, sein Fälligkeitstag ≥ dem
heutigen Tag liegt und weder ein Umsatz noch ein Häkchen an ihr hängt. Einnahmen
mindern die Summe.

> **Nicht die 1.814 € aus dem Entwurf.** Die Dauerauftrags-Welle zum Ersten ist am
> 6. August längst durch. Genau das ist der Zweck der Anzeige — ohne diesen Satz
> sieht ein korrektes Ergebnis beim Smoke wie ein Fehler aus. Der Wert wandert
> außerdem mit dem Datum: ab dem 16. fällt der Handyvertrag heraus.

**③ Bekannte Untererfassung, bewusst:** Friseur (45,00 €) hat keinen Termin und
zählt nicht mit — §8 sagt „mit Termin". Zusammen mit der Kreditkarten-Lücke (`L5`)
ist die Zahl systematisch leicht zu optimistisch.

---

## Phasen

| # | Inhalt | Commit |
|---|---|---|
| 1 | Fälligkeitstag rechts in der Statuszeile | `d531dfe` |
| 2 | Menüpunkt „Fällig am …" + Overlay + Server Action | `6272ed7` |
| 3 | Ausstehend-Anzeige in der Kopfzeile „Planung" | `d0cc5cc` |

---

## Akzeptanzkriterien

Kartentyp überall genannt (`LL-12`), regel-basiert formuliert (`LL-19`).

| # | Kriterium |
|---|---|
| A1 | Eine Fixkosten- oder Einnahmen-Karte **mit** Termin zeigt ihn rechts in der Statuszeile als `am [N].`; die Kartenhöhe ist unverändert |
| A2 | Eine **Budget**-Karte zeigt rechts nichts — kein „—", kein Platzhalter |
| A3 | Eine Fixkosten-/Einnahmen-Karte **ohne** Termin zeigt rechts nichts |
| A4 | Der Tag bleibt in **jedem** Zustand stehen, auch bei „Bezahlt" und „Erhalten" |
| A5 | `Fällig am …` erscheint im Kontextmenü jeder Fixkosten- und Einnahmen-Karte und **fehlt** auf jeder Budget-Karte sowie auf Ghost-Karten |
| A6 | Das Overlay setzt einen Tag 1–31, entfernt ihn über `Kein fester Tag` und schließt per Escape ohne Änderung |
| A7 | Die Kopfzeile „Planung" zeigt im laufenden Monat zwei Beträge mit zwei verschiedenen Wörtern, **nie** eine Summe |
| A8 | Außerhalb des laufenden Monats bleibt die Zeile leer; die Oberkanten der drei Zonen bleiben bündig |
| A9 | Ein Posten verschwindet aus „noch fällig", sobald sein Termin verstrichen ist **oder** eine Zahlung an ihm hängt |
| A10 | Keine Sparrate bewegt sich in irgendeinem der zwölf Monate 2026 |

---

*Briefing · Antigravity Finance · Sprint v2-15 · 06. August 2026*
