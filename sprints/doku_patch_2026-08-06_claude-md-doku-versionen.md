# Doku-Patch 06.08.2026 — CLAUDE.md §9, Zeile „Doku-Versionen"

**Verfahren:** LL-16 / §7 Regel 14 — Anker + Patch-Satz, keine direkte Bearbeitung.
Für CLAUDE.md zusätzlich mit **ausdrücklicher User-Freigabe**.

**Freigabe:** Dominik, 06.08.2026 — über den Koordinator übermittelt: *„Der User hat die
Freigabe für den CLAUDE.md-Patch ausdrücklich erteilt."* Sie deckt **ausschließlich die
Zeile „Doku-Versionen"**. Alles andere in §9 bleibt unberührt (siehe „Bewusst NICHT
geändert" unten).

**Bewusst eine eigene Datei.** Die Design-Doku-Patches dieses Tages liegen in
`sprints/doku_patch_2026-08-06_dd-runde.md`. CLAUDE.md ist eine andere Bibel mit einem
eigenen Freigabe-Gate; die Stelle muss **einzeln zurücknehmbar** bleiben.

**Kein Versions-Bump.** CLAUDE.md führt keine eigene Versionsnummer — nur die Zeile
„Letzte Aktualisierung" im Kopfblock (dazu unten V1).

---

## V0 · §9 — Zeile „Doku-Versionen"

**Anker** (CLAUDE.md Zeile 561):

```
**Doku-Versionen:** Design-Doku **v3.2.0** · Schema-Doku **v3.4.3**.
```

**Patch-Satz** — ersetzt den Anker:

```markdown
**Doku-Versionen:** Design-Doku **v3.3.0** · Schema-Doku **v3.4.4**.
```

**Warum, je Zahl belegt:**

| Zahl | Beleg |
|---|---|
| Design-Doku `v3.2.0` → **`v3.3.0`** | Header-Zeile 3 von `antigravity_finance_design_dokument.md` nach dem heutigen Bump; Changelog-Absatz v3.3.0 (06.08.2026, DD-Runde · `LQ-2` `LQ-1` `RM-2` `PA-1`). Patch-Beleg: `sprints/doku_patch_2026-08-06_dd-runde.md` E1/E2. |
| Schema-Doku `v3.4.3` → **`v3.4.4`** | Header-Zeile 3 von `antigravity_finance_schema_summary.md`; Changelog v3.4.4 (06.08.2026, Sprint v2-14 · `LQ-1` — `cards.due_day`). **Von mir nicht geschrieben**, nur abgelesen. |

---

## V1 · Kopfblock — „Letzte Aktualisierung" *(erste Runde: kein Patch — überholt durch V5)*

> **Nachtrag 06.08.2026:** Die hier beschriebene Sperre ist **gefallen** — der User hat
> die vier gemeldeten Punkte ausdrücklich freigegeben. Umsetzung in **V5**. Der Eintrag
> bleibt als Beleg stehen, warum er in der ersten Runde nicht angefasst wurde.

**Geprüft, Ergebnis: kein Patch.** Die Zeile trägt nach dem Verfahren Datum **und
Anlass** des letzten Patches; sie steht auf *„05. August 2026 · nach: v2-13"* und endet
mit dem ausdrücklichen Vermerk, §9 sei damals **nicht** nachgezogen worden und brauche
eine eigene Freigabe. Genau diese Freigabe ist heute für **einen Teil** von §9 erteilt
worden — für die Doku-Versionen, nicht für die Prüfanker und nicht für „Letzter Sprint".

Eine Fortschreibung der Kopfzeile müsste diesen Unterschied mit tragen („§9 nur in der
Zeile Doku-Versionen nachgezogen; Prüfanker und Sprint-Stand weiterhin offen"). Das ist
eine **zweite** inhaltliche Aussage über den Stand der Verfassung und damit über die
erteilte Freigabe hinaus. Deshalb hier **nicht** angefasst, sondern dem Koordinator als
Vorschlag gemeldet — zusammen mit der v2-14-Frage, die ohnehin zur Entscheidung ansteht.
Beides gehört in **eine** Freigabe, nicht in zwei halbe.

---

## V2 · §9 — „Letzter Sprint" plus neuer Absatz „Zuletzt entschieden, noch nicht gebaut"

> **Freigabe:** Dominik, 06.08.2026, Punkt ② — *„Nimm deinen Vorschlag unverändert."*
> Der Vorschlag stammt aus meinem Bericht der ersten Runde.

**Anker** (CLAUDE.md Zeilen 557–559):

```
**Letzter Sprint:** v2-13 (`BF-4` — der Split-Anteil wird genau einmal angewandt,
06.08.2026 gemerged) · **davor:** v2-12 (`BF-2`, Ring-Subzeile) und v2-11 (`BF-5`,
Vorzeichen). Vollständige Sprint-Tabelle und alle Details: `sprints/projekt_historie.md`.
```

**Patch-Satz** — ersetzt den Anker:

```markdown
**Letzter Sprint:** v2-14 (`LQ-1` — `cards.due_day`, der Fälligkeitstag je Karte; reine
Schema-Erweiterung, keine Rechenfunktion berührt, 06.08.2026 gemerged `576ea43`) ·
**davor:** v2-13 (`BF-4`, Split-Anteil genau einmal) und v2-12 (`BF-2`, Ring-Subzeile).
Vollständige Sprint-Tabelle und alle Details: `sprints/projekt_historie.md`.

**Zuletzt entschieden, noch nicht gebaut:** die Design-Direktor-Runde vom 06.08.2026 —
`LQ-2` (Ausstehend-Anzeige), `LQ-1`-Anzeigeseite (Fälligkeitstag auf der Karte), `RM-2`
(Schaufenster-Popup) und `PA-1` (Konsequenz-Anzeige). Record:
`V2/design_direktor_2026-08-06_liquiditaet_fragment_split.md`; Spezifikation in der
Design-Doku v3.3.0.
```

**Warum:** v2-14 ist gemerged (`576ea43`) und fehlte. Der zweite Absatz ist der
eigentliche Punkt — „Letzter Sprint" allein kann nicht tragen, dass vier Spezifikationen
**entschieden, aber nicht gebaut** sind; genau in diesem Zustand startet die nächste
Sitzung. Belege: Schema-Doku Changelog v3.4.4 · `sprints/sprint_v2-14_review.md` ·
Record vom 06.08.2026.

---

## V3 · §9 — „Offene Themen" (Roadmap-Zahlen gespiegelt, nicht nachgerechnet)

> **Freigabe:** Dominik, 06.08.2026, Punkt ③ — mit der ausdrücklichen Grenze: *„CLAUDE.md
> spiegelt die Roadmap, es erfindet keine eigenen Zahlen."*

**Anker** (CLAUDE.md Zeilen 601–603):

```
**Offene Themen:** `V2/v2_roadmap_konsolidiert.md` — nach **Sprint-Paketen** geordnet,
aktuell **13**; §0 trägt die Zahlen, §5 löst die alten Buchstaben-Kennungen auf.
Zahlen nach v2-13: **40 offen · 32 erledigt.**
```

**Patch-Satz** — ersetzt den Anker:

```markdown
**Offene Themen:** `V2/v2_roadmap_konsolidiert.md` — nach **Sprint-Paketen** geordnet;
§0 trägt die Zahlen, §5 löst die alten Buchstaben-Kennungen auf. Stand dort
**05.08.2026, nach v2-13**: **13 offene Pakete · 39 offen · 33 erledigt**. v2-14 und die
Entscheidungen vom 06.08.2026 sind darin **noch nicht verrechnet** — die Zahlen sind
gespiegelt, nicht nachgerechnet.
```

**Warum:** Die bisherigen Zahlen (`40 offen · 32 erledigt`) stimmen mit §0 **nicht**
überein. Übernommen ist die Zahlen-Tabelle aus §0 (Zeilen 31–38): *Offene Pakete 13 ·
Offen gesamt 39 · Erledigt 33*. Der Stichtag steht dort wörtlich: *„Alle Zahlen am
05.08.2026 nach Sprint v2-13 zeilengenau nachgezählt."*

> **Ergänzt durch V6 (06.08.2026):** Der Widerspruch wird seit V6 **in CLAUDE.md selbst
> benannt**, nicht nur hier. Wer V3 liest, muss V6 mitlesen — sonst kennt er nur die
> halbe Begründung.
>
> **Widerspruch innerhalb von §0 — nicht aufgelöst, gemeldet.** Der Korrektur-Kasten
> direkt unter der Tabelle (Zeilen 40–44) rechnet abweichend: *Hausaufgaben „= 7"*
> (Tabellenzeile: **6**) und *„§4 Erledigt 31 Zeilen + `BF-4` = **32**"* (Tabellenzeile:
> **33**). Gespiegelt ist die **Tabelle**, weil sie in sich aufgeht (33 Themen + 6
> Hausaufgaben = 39 offen) und weil sie die Stelle ist, die §0 „Stand in Zahlen" nennt.
> Die Auflösung des Widerspruchs gehört in die Roadmap, nicht in die Verfassung — sie
> ist als Nachzugs-Bedarf gemeldet.

---

## V4 · §9 — „Ohne Entscheidung baubar"

> **Freigabe:** Dominik, 06.08.2026, Punkt ① — *„Nimm deinen eigenen Vorschlag"*, mit
> zwei Auflagen: Paket 4 muss ausdrücklich **offen** bleiben, und der Verweis auf
> `sprints/sprint_v2-10_offene_fragen.md` bleibt, wird aber ehrlich.

**Anker** (CLAUDE.md Zeilen 609–612):

```
**Ohne Entscheidung baubar:** **Paket 3** (Liquiditäts-Vorschau — hängt an keinem
anderen Paket) oder eine Runde **`design-direktor`**, die gleich drei Dinge entsperrt:
`RM-2`, `PA-1` (Rechnung fertig, nur die Darstellung fehlt) und die Schneidbarkeit von
Paket 4. Offene Fragen aus v2-10: `sprints/sprint_v2-10_offene_fragen.md`.
```

**Patch-Satz** — ersetzt den Anker:

```markdown
**Ohne Entscheidung baubar:** **Paket 3** (Liquiditäts-Vorschau) sowie die vier am
06.08.2026 entschiedenen Anzeigen — Spezifikation in der Design-Doku v3.3.0, kein
Datenbank-Eingriff nötig. Weiterhin **offen**: **Paket 4** (Kategorien im Karussell) —
die Runde vom 06.08. hat es ausdrücklich **nicht** entsperrt —, dazu `M2` und `M5`.
Aus `sprints/sprint_v2-10_offene_fragen.md` ist §5 (`PA-1`) durch die Runde erledigt;
**§6 bleibt offener Altbestand:** Das Einkommens-Popup hat als einziges von acht
Overlays keinen Escape-Handler — Bauauftrag für den Sprint, der das Popup anfasst.
```

**Warum:** Der alte Absatz empfahl eine `design-direktor`-Runde, die am 06.08.2026
stattgefunden hat — er schickte die nächste Sitzung also auf erledigte Arbeit. Paket 4,
`M2` und `M5` stehen im Record unter „Was NICHT entschieden wurde"; der Escape-Handler
steht dort unter „Was NICHT entschieden wurde" als **Bauauftrag, keine Gestaltungsfrage**.

---

## V6 · §9 — den §0-Widerspruch in der Verfassung benennen (Nachtrag zu V3)

> **Freigabe:** Dominik über den Koordinator, 06.08.2026 — *„Ergänze einen Halbsatz oder
> kurzen Klammerzusatz … Kurz halten — zwei Zeilen, nicht fünf."* Eigener Punkt, damit
> er unabhängig von V3 zurücknehmbar bleibt.

**Anlass:** Nach V3 liest die nächste Sitzung „39 · 33" als **gesicherte** Zahl. Sie ist
aber eine begründete Wahl zwischen zwei Angaben, die sich in **derselben** Quelle
widersprechen. Genau diese Sorte stiller Ungenauigkeit ist der Fehlertyp der Befunde vom
04.08.2026 — sie gehört benannt, nicht geglättet (vgl. §7 Regel 22 / LL-22).

**Anker** (Schluss des in V3 gesetzten Absatzes):

```
Entscheidungen vom 06.08.2026 sind darin **noch nicht verrechnet** — die Zahlen sind
gespiegelt, nicht nachgerechnet.
```

**Patch-Satz** — ersetzt den Anker:

```markdown
Entscheidungen vom 06.08.2026 sind darin **noch nicht verrechnet** — die Zahlen sind
gespiegelt, nicht nachgerechnet. **Vorsicht:** §0 nennt sie zweimal verschieden —
Zahlen-Tabelle gegen Herleitungs-Kasten (Hausaufgaben 6/7, Erledigt 33/32). Übernommen
ist die Tabelle, weil sie aufgeht (33 + 6 = 39); die Auflösung gehört in die Roadmap.
```

**Warum genau so kurz:** Die Verfassung benennt den **Zustand** („zwei nicht
deckungsgleiche Angaben, gewählt wurde die Tabelle, Auflösung steht aus"), sie breitet
den Widerspruch nicht aus. Drei Zeilen statt fünf.

**Bewusst nicht in CLAUDE.md aufgenommen:** dass die **bisherige** CLAUDE.md-Zeile
(`40 offen · 32 erledigt`) den Herleitungs-Kasten spiegelte und nicht die Tabelle. Das
ist Historie, kein Dauerzustand — nach §3 gehört es damit nicht in die Verfassung. Es
steht hier in V3/V6 und ist im Bericht an den Koordinator genannt.

---

## V5 · Kopfblock — „Letzte Aktualisierung" (hebt V1 auf)

> **Freigabe:** Dominik, 06.08.2026, Punkt ④ — Vorschlag ausformulieren, Prüfanker-Halbsatz
> ist Pflicht, die §9-Aussage anpassen.

**Anker** (CLAUDE.md Zeilen 11–15):

```
> **Letzte Aktualisierung:** 05. August 2026 · **nach:** v2-13 (`BF-4` — der
> Split-Anteil wird genau einmal angewandt; **neue Stolperfalle 11**, **neue Regeln
> 23/24 mit LL-23/LL-24**). Damit ist **Paket 1 vollständig**: alle fünf Befunde vom
> 04.08. sind erledigt. **§9 ist in diesem Patch NICHT nachgezogen** — die Prüfanker
> stehen weiterhin auf dem v2-11-Stand und brauchen eine eigene Freigabe.
```

**Patch-Satz** — ersetzt den Anker:

```markdown
> **Letzte Aktualisierung:** 06. August 2026 · **nach:** der Design-Direktor-Runde
> (`LQ-2` `LQ-1` `RM-2` `PA-1` entschieden, Design-Doku **v3.3.0**) und Sprint **v2-14**
> (`LQ-1`, `cards.due_day`). §9 ist auf Sprint-Stand, Doku-Versionen und Roadmap-Lage
> nachgezogen; die **Prüfanker stehen weiterhin auf dem Stand vom 05.08.2026** und sind
> unverändert gültig, weil seither keine Rechenfunktion berührt wurde.
> Davor v2-13 (`BF-4` — der
> Split-Anteil wird genau einmal angewandt; **neue Stolperfalle 11**, **neue Regeln
> 23/24 mit LL-23/LL-24**). Damit ist **Paket 1 vollständig**: alle fünf Befunde vom
> 04.08. sind erledigt.
```

**Warum:** Der Schlusssatz des alten Eintrags („§9 ist in diesem Patch NICHT
nachgezogen … Prüfanker auf dem v2-11-Stand … eigene Freigabe") war **doppelt
überholt**: §9 ist mit diesem Patch nachgezogen, und die Prüfanker-Tabelle trägt seit
dem 05.08.2026 gemessene Werte, nicht mehr den v2-11-Stand. Er entfällt deshalb; der
sachliche Teil des v2-13-Eintrags bleibt wörtlich stehen.

---

## Bewusst NICHT geändert

| Stelle | Warum |
|---|---|
| ~~§9 „**Letzter Sprint:** v2-13 …"~~ | **Erledigt — V2.** In der ersten Runde nicht von der Freigabe gedeckt, am 06.08.2026 ausdrücklich freigegeben. |
| §9 Prüfanker-Tabelle + Erläuterungs-Block (Zeilen 563–597) | **Unverändert, auch in der zweiten Runde.** Werte vom 05.08.2026, inhaltlich korrekt — keine der Änderungen berührt eine Rechenfunktion. Der erwogene Komfort-Halbsatz „durch v2-14 bestätigt" ist auf Weisung **weggelassen**: Er wäre eine Zusicherung über Rechenverhalten, die dieser Patch nicht selbst belegt (§7 Regel 22 / LL-22). |
| ~~§9 „Offene Themen" / „Ohne Entscheidung baubar"~~ | **Erledigt — V3 und V4.** |
| `V2/v2_roadmap_konsolidiert.md` | **Nicht angefasst.** CLAUDE.md spiegelt die Roadmap; der Widerspruch in deren §0 (Tabelle ↔ Korrektur-Kasten) und der fehlende Nachzug für v2-14 und die DD-Runde gehören dorthin und sind gemeldet. |
| §5 „Die zwei Bibeln" (§-Themen-Tabelle der Design-Doku) | Ein Eintrag für den neuen §12.9 wäre konsequent, ist aber nicht Teil der Freigabe. |
| Alles außerhalb §9 | Nicht Gegenstand. |

---

*Doku-Patch · Antigravity Finance · 06. August 2026 · Subagent `docs-maintainer`*
