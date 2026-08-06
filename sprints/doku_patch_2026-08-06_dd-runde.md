# Doku-Patch 06.08.2026 — Design-Doku nach der Design-Direktor-Runde

**Verfahren:** LL-16 / §7 Regel 14 — Anker + Patch-Satz je Stelle, keine direkte
Bearbeitung. Kein CLAUDE.md, keine Schema-Doku, kein Code.

**Quelle für jede Stelle:** `V2/design_direktor_2026-08-06_liquiditaet_fragment_split.md`
(Rolle `design-direktor`, vier Fragen, alle vom User bestätigt). Die Doku-Folge-Tabelle
am Ende jenes Records benennt Zielsektion und Kürzel; die konkreten Werte (Größen,
Farben, Wortlaute) stammen aus den vier Entwurfsseiten unter `design-system/entwuerfe/`.

**Ziel-Datei für alle Stellen:** `antigravity_finance_design_dokument.md`
(Version **3.2.0 → 3.3.0**, Minor-Bump — siehe D1/D2).

**Grundsatz für diesen Patch:** Die Doku trägt die **Entscheidung**, nicht die
Begründungskette. Jeder neue Block schließt mit einem Verweis auf den Record — dasselbe
Muster wie die Haushaltsbetrag-Zeile in §7 (*„Beleg der Gestaltung:
`V2/design_direktor_gemeinsame_karte.md`."*).

---

## A1 · §8 „Karussell (Mitte)" — Ausstehend-Anzeige (`LQ-2`)

**Anker** (Überschrift des Folgeabschnitts, die neue Stelle wird **davor** eingefügt):

```
### Fragment-Stack (Rechts)
```

**Patch-Satz** — davor eingefügt:

```markdown
**Ausstehend-Anzeige in der Kopfzeile (06.08.2026, `LQ-2`):** Die Zone „Planung" trägt rechtsbündig in **derselben Zeile wie die Zonen-Überschrift** zwei Beträge. Das ist dasselbe Muster wie der Übertrags-Schalter der Rohmasse (v2-07, `C1`) — bewusst keine eigene Zeile, damit die Oberkanten von Portal, Karussell und Stack bündig bleiben.

| Angabe | Wortlaut | Inhalt |
|---|---|---|
| Feste Posten | `[N] € noch fällig` | Fixkosten- und Einnahmen-Karten mit Termin (`cards.due_day`, §7) |
| Budgets | `[N] € Budget frei` | Restbudget der Budget-Karten — eine Erlaubnis ohne Termin |

**Nie eine Summe.** Die beiden Zahlen stehen getrennt und werden nie zu einer addiert: Der eine Betrag sind Termine, der andere ist eine Erlaubnis — ein Budget lässt sich zurückhalten, ein Dauerauftrag nicht. Eine gemeinsame Zahl machte beides zur Verpflichtung und wäre in der Sache falsch (Befund `L7`, `V2/befunde_2026-08-05_liquiditaet.md`).

**Die verschiedenen Wörter sind Absicht.** Zwei Zahlen nebeneinander mit demselben Wort darüber laden zum Addieren ein; die Trennung hält erst, wenn die beiden Angaben verschieden **heißen**. „fällig" trägt den Termin, „frei" ist bereits die Vokabel der Budget-Karte (`Noch [N] € frei`, §12.3) — es wird kein Begriff erfunden.

**Die Aussage ist eine Vorhersage, keine Feststellung.** Sie entsteht aus dem Fälligkeitstag (§7), nicht aus einem Bezahlt-Häkchen. Eine Karte kann „Offen" sein und trotzdem nicht mehr in „noch fällig" zählen, weil ihr Termin verstrichen ist.

Copy: §12.9. Beleg der Gestaltung: `V2/design_direktor_2026-08-06_liquiditaet_fragment_split.md` §1.
```

**Warum:** Record §1.1/§1.2 — Ort in der Zonen-Kopfzeile, zwei getrennte Angaben mit
verschiedenen Wörtern, keine Summe. „Planung" ist die reale Zonen-Beschriftung
(`src/components/interaction-zone/carousel.tsx`).

---

## A2 · §12 — neuer Block „12.9 Liquidität"

**Anker** (Ende der §12.8-Tabelle bis zur Überschrift des Folgekapitels — der neue Block
gehört **vor** die Kapitel-Trennlinie, damit er innerhalb von §12 bleibt):

```
| Popup — Monatsklick | drei Positionen (Top-3-Treiber, B2-Heuristik offen) |

---

## 13. Bekannte Limitationen V1
```

**Patch-Satz** — ersetzt den Anker:

```markdown
| Popup — Monatsklick | drei Positionen (Top-3-Treiber, B2-Heuristik offen) |

### 12.9 Liquidität

| Kontext | Text |
|---|---|
| Kopfzeile „Planung" — feste Posten | `[N] € noch fällig` |
| Kopfzeile „Planung" — Budgets | `[N] € Budget frei` |

---

## 13. Bekannte Limitationen V1
```

**Warum:** Record, Doku-Folge-Tabelle — Copy zu `LQ-2` als eigener §12-Block.
**Geprüft:** Das Inhaltsverzeichnis (Zeile ~36) führt **keine** §12-Unterpunkte; es ist
dort nichts mitzuziehen (siehe „Nicht angewendet", O1).

---

## B1 · §7 „Gemeinsame Basis" — Fälligkeitstag auf der Karte (`LQ-1`)

**Anker** (letzte Zeile der Haushaltsbetrag-Zeile, die neue Stelle folgt **danach**):

```
Beleg der Gestaltung: `V2/design_direktor_gemeinsame_karte.md`.
```

**Patch-Satz** — danach eingefügt:

```markdown
**Fälligkeitstag-Anzeige (seit `LQ-1`, 06.08.2026):**

Die Statuszeile bekommt zwei Enden: **links der Zustand, rechts der Termin** — zwei Aussagen, getrennt durch die Position, nicht durch ein Trennzeichen.

| Eigenschaft | Wert |
|---|---|
| Ort | rechter Anschlag der **Statuszeile** — **keine** neue Zeile, **keine** zusätzliche Kartenhöhe |
| Wortlaut | `am [N].` (§12.3) |
| Schriftgröße | `9px`, Weight `500`, `white-space: nowrap` |
| Farbe | `rgba(255,255,255,.30)` |

**Alle Karten behalten ihre Maße.** Weil keine Zeile hinzukommt, bleibt die Vorgabe gleicher Kartenmaße unberührt — anders als bei der Haushaltsbetrag-Zeile oben ist hier keine Höhe zu reservieren.

**Rechts steht in drei Fällen nichts** — kein „—", kein Platzhalter:
1. **Budget-Karte** — `due_day` ist dort per Migration `NULL`; ein Budget ist eine Erlaubnis ohne Termin (Befund `L7`). Die Leerstelle **ist** die Aussage.
2. **Fixkosten-/Einnahmen-Karte ohne Buchungshistorie** — es gibt keinen ableitbaren Tag.
3. **Kein Wert gesetzt.**

**Der Tag bleibt auch im Zustand „Bezahlt" / „Erhalten" stehen.** Er ist eine Eigenschaft der Karte, kein Zustand. Verschwände er beim Bezahlen, spränge die Zeile — und der Wert wäre genau dann nicht mehr prüfbar, wenn man ihn gegen den echten Umsatz hält.

**Herkunft:** Die Werte sind aus der Buchungshistorie **abgeleitet** (Sprint v2-14, `LQ-1`), nicht vom Nutzer bestätigt. Genau deshalb sind sie sichtbar: Ein geratener Wert, der eine sichtbare Zahl treibt (§8, `LQ-2`), darf nicht selbst unsichtbar sein.

Beleg der Gestaltung: `V2/design_direktor_2026-08-06_liquiditaet_fragment_split.md` §2.
```

**Warum:** Record §2.1 (Ort, keine zusätzliche Höhe), §2.2 (drei Randfälle), §2.1
(Herkunft/Sichtbarkeit). Werte aus `design-system/entwuerfe/lq1-faelligkeitstag.html`
(`.dueRight`: `9px`, Weight `500`, `rgba(255,255,255,.30)`, `nowrap`).

---

## B2 · §7 „Kontextmenü (⋯-Icon)" — neuer Menüpunkt `Fällig am …`

**Anker 1** (die Options-Tabelle):

```
| Karten-Typ | Optionen |
|---|---|
| Fixkosten / Einnahmen / Budget | `Betrag anpassen` / `Letzte Zahlung in Monat X` |
| Karte nie genutzt (kein State, keine Fragmente) | zusätzlich `Karte löschen` (Hard-Delete) |
```

**Patch-Satz 1** — ersetzt den Anker:

```markdown
| Karten-Typ | Optionen |
|---|---|
| Fixkosten / Einnahmen | `Betrag anpassen` / `Fällig am …` / `Letzte Zahlung in Monat X` |
| Budget | `Betrag anpassen` / `Letzte Zahlung in Monat X` — **kein** `Fällig am …` |
| Karte nie genutzt (kein State, keine Fragmente) | zusätzlich `Karte löschen` (Hard-Delete) |
```

**Anker 2** (Ende des „Betrag anpassen"-Blocks, die neue Stelle folgt **danach**):

```
- **Dauerhaft ab diesem Monat** → INSERT in `card_planned_timeline` mit `effective_month = aktuell angezeigter Monat` (Forward-Inheritance, vergangene Monate eingefroren)
```

**Patch-Satz 2** — danach eingefügt:

```markdown
**„Fällig am …" (neu mit `LQ-1`, 06.08.2026):** Eigener Menüpunkt, **nicht** Teil von „Betrag anpassen". Das ist keine Platz-, sondern eine Bedeutungsfrage: „Betrag anpassen" hat durchgängig Monats-Semantik (*nur dieser Monat* / *dauerhaft ab diesem Monat*), `cards.due_day` gilt dagegen **immer** und kennt keine Monatsabgrenzung. Ein Feld dazwischen erzeugte die Frage *„gilt der neue Tag nur für diesen Monat?"* — und die Oberfläche beantwortet sie nicht.

**Auf Budget-Karten erscheint der Eintrag nicht** (kein Termin — siehe „Fälligkeitstag-Anzeige" oben). Das Overlay trägt ein Zahlenfeld (Tag im Monat), die Option `Kein fester Tag` und einen Satz zur Herkunft des Werts. Copy: §12.4.
```

**Warum:** Record §2.3 — eigener Eintrag statt Feld in „Betrag anpassen", nicht auf
Budget-Karten, Overlay-Inhalt.

---

## B3 · §12.3 — Copy `am [N].`

**Anker** (letzte Zeile der §12.3-Tabelle):

```
| Gemeinsame Karte — Haushaltsbetrag | `von [N] €` *(leer bei ICH, Split-Faktor 1,0 oder Plan 0)* |
```

**Patch-Satz** — ersetzt den Anker:

```markdown
| Gemeinsame Karte — Haushaltsbetrag | `von [N] €` *(leer bei ICH, Split-Faktor 1,0 oder Plan 0)* |
| Fälligkeitstag (rechts in der Statuszeile) | `am [N].` *(leer bei Budget-Karten und Karten ohne Fälligkeitstag)* |
```

**Warum:** Record, Doku-Folge-Tabelle („Copy `am [N].` → §12.3").

---

## B4 · §12.4 — Copy `Fällig am …` und `Kein fester Tag`

**Anker** (die beiden „Betrag anpassen"-Zeilen der §12.4-Tabelle):

```
| Betrag anpassen — Option 1 | `Nur dieser Monat` |
| Betrag anpassen — Option 2 | `Dauerhaft ab diesem Monat` |
```

**Patch-Satz** — ersetzt den Anker:

```markdown
| Kontextmenü — Fälligkeitstag | `Fällig am …` *(nicht auf Budget-Karten)* |
| Betrag anpassen — Option 1 | `Nur dieser Monat` |
| Betrag anpassen — Option 2 | `Dauerhaft ab diesem Monat` |
| Fällig am — Overlay-Option | `Kein fester Tag` |
```

**Warum:** Record §2.3 + Doku-Folge-Tabelle. **Bewusst ohne Options-Nummer:** Die
bestehenden Zeilen heißen „Option 1/2/3"; eine „Option 4" würde eine Position im Menü
behaupten, die der Record nicht festlegt (im Entwurf steht der Eintrag an zweiter
Stelle).

---

## C1 · §11 — neuer Unterabschnitt „Schaufenster-Popup" (`RM-2`)

**Anker** (letzte Zeile der Drag-Verhalten-Tabelle in „Fragment-Karte — Spezifikation";
die neue Stelle folgt **danach**, vor „Was explizit NICHT"):

```
| Zugeordnet | `opacity: 0.22`, `pointer-events: none` |
```

**Patch-Satz** — danach eingefügt:

```markdown
### Schaufenster-Popup (06.08.2026, `RM-2`)

Ein Klick auf ein Fragment im Stack (§8) öffnet ein **reines Anzeige-Popup — keine Knöpfe**: keine Zuordnung, kein Eject, keine Korrektur.

**Aufbau.** Das **Datum** steht in der Kopfzeile. Die **Hauptzeile trägt den Empfänger** — den **ersten** durch `|` getrennten Teil der gespeicherten Beschreibung —, der **Betrag** steht rechts in derselben Zeile. Darunter folgt der **Verwendungszweck**, ungekürzt.

**Warum der Empfänger führt:** `RM-1` zeigt auf der Fragment-Karte seit v2-10 den *letzten* Teil, also den Verwendungszweck (§8). Der Empfänger ist damit nirgends sonst mehr sichtbar. Das Popup ist deshalb nicht „die Karte in groß", sondern der einzige Ort, an dem steht, wer das Geld bekommen hat.

**Sonderfall ohne Trennzeichen** (DKB Visa liefert ein einziges Feld): Der gesamte Text steht in der Hauptzeile, die Zweck-Zeile **entfällt**. Es wird **nicht** auf ein anderes Layout umgeschaltet — das wären zwei Popups unter einem Namen; eine wegfallende Zeile ist ruhiger als ein springender Aufbau.

**Rangfolge unter dem Strich — eine Regel:** *erst was immer gilt, dann was den Zustand erklärt, dann was selten vorkommt.*

1. **Datum** (in der Kopfzeile)
2. **Status** bzw. die **zugeordnete Karte**
3. **Gegenkonto** — nur bei Übertrag, mit dem Hinweis `Eigenes Konto — zählt nicht in die Sparrate`
4. **KI-Vorschlag** — nur bei unzugeordnetem Fragment

**Nicht im Popup:** Duplikat-Hash und Import-Zeitpunkt. Beides ist Maschinerie und beantwortet keine Frage, die man beim Klicken hatte.

**Ort und Schließen:** Das Popup öffnet **zentriert per React-Portal** (§7, `RM-4`) und hat einen **Escape-Handler**.

Beleg der Gestaltung: `V2/design_direktor_2026-08-06_liquiditaet_fragment_split.md` §3.
```

**Warum:** Record §3.1 (Hauptzeile, Betrag rechts, Datum in die Kopfzeile), §3.2
(Visa-Sonderfall), §3.3 (Rangfolge, ausgeschlossene Felder) sowie „Was NICHT entschieden
wurde" (Escape-Handler als Bauauftrag).

---

## C2 · §8 „Fragment-Stack (Rechts)" — `pointer-events: none` aufgehoben (`RM-2`)

> **Inhaltliche Änderung, nicht nur Ergänzung.** Zwei bestehende Aussagen werden
> aufgehoben. Nach dem Muster von §7 („~~Verbergen~~ — aufgehoben durch v2-05") bleibt
> der alte Wortlaut durchgestrichen stehen, statt spurlos zu verschwinden.

**Anker 1:**

```
- Zugeordnete Fragmente: `opacity: 0.22`, `pointer-events: none`
```

**Patch-Satz 1** — ersetzt den Anker:

```markdown
- Zugeordnete Fragmente: `opacity: 0.22` · ~~`pointer-events: none`~~ — **aufgehoben (06.08.2026, `RM-2`)**, siehe „Klickbarkeit des Stacks" unten. Die Deckkraft bleibt unverändert.
```

**Anker 2** (Satz aus dem `INTERNAL_TRANSFER`-Punkt):

```
Das Fragment hat **kein** Tap-/Drag-Verhalten (Cursor `default`, `pointer-events: none`).
```

**Patch-Satz 2** — ersetzt den Anker:

```markdown
Das Fragment ist **keine Drag-Quelle** und lässt sich keiner Karte zuordnen; ~~`pointer-events: none`~~ ist mit `RM-2` **aufgehoben** (06.08.2026, siehe „Klickbarkeit des Stacks" unten).
```

**Anker 3** (Ende des Grundton-Punkts, die neue Stelle folgt **danach**):

```
Der Yellow-Soft (KI-Vorschlag-Badge) bleibt für Transfer ausgeschlossen (AD5): Transfer ist Fakt, kein Vorschlag.
```

**Patch-Satz 3** — danach eingefügt (neuer Listenpunkt):

```markdown
- **Klickbarkeit des Stacks (06.08.2026, `RM-2`) — Aufhebung einer bestehenden Regel:** Bis dahin galt, dass zugeordnete Fragmente **und** Überträge per `pointer-events: none` tot gestellt sind. Diese Regel ist **aufgehoben**: **jedes** Fragment im Stack ist anklickbar und öffnet das Schaufenster-Popup (§11) — auch ein zugeordnetes, auch ein Übertrag.
  **Das betrifft ausschließlich das Öffnen des Popups.** Unberührt bleiben:
  - Die **Daten-Invariante**: Ein Fragment mit gesetztem `transfer_type` kann weiterhin **nie** einer Karte zugeordnet werden (Trigger `trg_oqb_no_transfer_links`, RPC-Filter, Link-Auflösung beim Import). **Klickbar ≠ verlinkbar** — aus dieser Änderung folgt an keiner Stelle, dass Überträge wieder zuordenbar wären.
  - Die **Drag-Sperre**: Weder zugeordnete Fragmente noch Überträge sind Drag-Quellen.
  - Die **Deckkraft-Werte** `0.22` (zugeordnet) und `0.45` (Übertrag) sowie das TRANSFER-Badge und die Status-Hierarchie aus Sprint 9.

  Entscheidung vom 06.08.2026, **Umsetzung steht aus**. Beleg: `V2/design_direktor_2026-08-06_liquiditaet_fragment_split.md` §3.
```

**Warum:** Record, Tabelle „Was das entsperrt" — *„ändert §8: zugeordnete Fragmente und
Überträge sind heute per `pointer-events: none` tot gestellt und werden klickbar"*, plus
§3 (das Popup ist der einzige Ort für Empfänger und Gegenkonto).

---

## C3 · §11 „Drag-Verhalten" — dieselbe Regel ein zweites Mal (Nachtrag)

> **Nachgetragen am 06.08.2026 nach C2.** Quelle: ausdrücklicher Auftrag des
> Koordinators („Ich beauftrage die Auflösung jetzt ausdrücklich"), nachdem die Stelle
> in diesem Papier zunächst als offene Frage **O2** gemeldet worden war. Eigener Punkt,
> damit sie **einzeln zurücknehmbar** bleibt.

**Befund:** Die Tabelle „Drag-Verhalten" in §11 trägt dieselbe Aussage wie §8 ein zweites
Mal. Seit C2 widerspricht sie §8 direkt.

**Vollständigkeits-Prüfung (`grep` auf `pointer-events` über das ganze Dokument):** Es
gibt **keine dritte** von `RM-2` betroffene Stelle. Gefunden wurden außerdem §5 Z. 453
(Ring interaktions-transparent, M3), §9 Z. 978 (Verweis auf dieselbe Ring-Regel) und §6
Z. 579 (linke Header-Flanke ohne Vormonat) — alle drei haben mit dem Fragment-Stack
nichts zu tun und bleiben **unberührt**. Die Ghost-Karten (§7 Z. 697/738, §7 Konflikt 3
Z. 849) arbeiten nicht mit `pointer-events`, sondern mit „nicht interaktiv"/Tap-Catcher;
ebenfalls unberührt.

**Anker** (Zeile der Drag-Verhalten-Tabelle):

```
| Zugeordnet | `opacity: 0.22`, `pointer-events: none` |
```

**Patch-Satz** — ersetzt den Anker (Zelle bewusst kurz, die Unterscheidung trägt ein
Absatz unter der Tabelle — eine dreiteilige Aussage in einer Tabellenzelle wäre
unleserlich):

```markdown
| Zugeordnet | `opacity: 0.22` · **kein Drag** · ~~`pointer-events: none`~~ — aufgehoben, siehe unter der Tabelle |

**Zur Zeile „Zugeordnet" (06.08.2026, `RM-2`):** `pointer-events: none` sperrte bisher **Klick und Drag in einem**. Aufgehoben ist **ausschließlich die Klick-Sperre** — ein zugeordnetes Fragment öffnet jetzt das Schaufenster-Popup (nächster Abschnitt; Stack-Regel: §8). **Die Drag-Sperre bleibt und braucht ab jetzt einen eigenen Träger:** Sie folgt nicht mehr nebenbei aus `pointer-events`, sondern muss eigenständig gesetzt werden. Dasselbe gilt für Fragmente mit gesetztem `transfer_type` (§8). Kurzform: **klickbar ≠ ziehbar ≠ verlinkbar** — die Daten-Invariante (Trigger `trg_oqb_no_transfer_links`) ist davon ohnehin unberührt.
```

**Warum:** Auflösung des Widerspruchs, den C2 erzeugt hat, im selben Muster wie §8 (alte
Aussage durchgestrichen sichtbar, nicht gelöscht). Die inhaltliche Präzisierung
Klick-Sperre ↔ Drag-Sperre folgt zwingend aus dem Record (§3 + Tabelle „Was das
entsperrt": klickbar **werden**, Zuordnung bleibt ausgeschlossen) — sie ist keine neue
Gestaltungsentscheidung, sondern benennt, was `pointer-events` bisher **mit**
transportiert hat. Kein Versions-Bump: gehört zur selben Runde.

---

## C4 · Changelog-Absatz v3.3.0 — §11-Nachzug ergänzen

**Anker** (Teilsatz im v3.3.0-Absatz, Zeile 32):

```
sondern öffnen das Schaufenster — Daten-Invariante (nie an Karten verlinkbar) und Drag-Sperre bleiben unberührt.
```

**Patch-Satz** — ersetzt den Anker:

```markdown
sondern öffnen das Schaufenster; §11 (Tabelle „Drag-Verhalten") ist mitgezogen, weil dort dieselbe Regel ein zweites Mal stand. Aufgehoben ist **ausschließlich die Klick-Sperre** — Daten-Invariante (nie an Karten verlinkbar) und Drag-Sperre bleiben, Letztere braucht ab jetzt einen eigenen Träger.
```

**Warum:** Der Absatz nannte bisher nur §8; C3 gehört ausdrücklich mit abgedeckt.
**Kein** weiterer Versions-Bump — dieselbe Runde, derselbe Eintrag.

---

## D1 · §10 — neuer Unterabschnitt „Konsequenz-Anzeige nach dem Speichern" (`PA-1`)

**Anker** (letzte Zeile des Blocks „Popup-Felder", die neue Stelle folgt **danach**):

```
**Forward-Inheritance-Badge:** `Gilt ab [Monat] für alle Folgemonate bis zur nächsten Änderung`
```

**Patch-Satz** — danach eingefügt:

```markdown
### Konsequenz-Anzeige nach dem Speichern (06.08.2026, `PA-1`)

**Zweiter Zustand desselben Popups.** „Übernehmen" speichert und **tauscht den Inhalt**, statt zu schließen — derselbe Rahmen, neuer Inhalt. Ursache und Wirkung stehen damit an einem Ort, ohne Ortswechsel des Blicks.

**Held ist die Summe, nicht die Liste:**

- große Zahl `+[N] €`
- darunter: *„mehr pro Monat für [N] gemeinsame Posten. Die Sparrate sinkt um denselben Betrag."*
- Untertitel: alter und neuer Split sowie der Geltungsmonat (`ab [Monat] [Jahr]`) — die Aussage gilt **vorwärts** (Forward-Inheritance), nicht für einen einzelnen Monat

**Tabelle darunter**, eine Zeile je gemeinsamem Posten, Spalten `Bisher` / `Künftig` / `Diff.`, dazu eine Summenzeile. **Alle drei Zahlen erscheinen** (Entscheidung des Users, 06.08.2026): Eine Änderungs-Anzeige ohne den Ausgangswert verlangt, dass man ihn im Kopf behält — *nachschlagen* auf der Karte ist nicht dasselbe wie *vergleichen*.

**Breite 400 px in beiden Zuständen** — auch im Eingabe-Zustand, damit das Overlay beim Übernehmen nicht unter der Hand wächst. Das ist ausdrücklich zulässig: §7 (`RM-4`) schreibt für Overlays den **Ort** fest, nicht die Größe — wörtlich *„sie unterscheiden sich in der Größe, nie im Ort"*.

**Ein Knopf: `Schließen`.** „Abbrechen" wäre sinnlos — es gibt nichts mehr abzubrechen; „Übernehmen" ist bereits geschehen.

**Der leere Fall — gar nichts.** Ändert sich der Split-Faktor nicht (etwa weil nur das Netto angepasst wurde) oder gibt es keine gemeinsamen Posten, **speichert das Popup und schließt wie bisher**. Kein Zwischenbildschirm, keine Null-Zeile, kein „Keine Änderungen" (CLAUDE.md §7 Regel 17 / LL-20: *ein Referenzwert ohne Daten ist „keine Anzeige", nicht 0*). Das Netto ändert die Sparrate trotzdem — diese Anzeige handelt aber vom **Split**, und die Sparrate steht ohnehin im Ring, sobald das Popup zu ist.

**Umfang — gemeinsame Einnahmen zählen mit**, in **derselben** Liste, mit dem Vorzeichen, das ihnen zusteht: Sie werden nach §4.5 genauso gesplittet wie gemeinsame Ausgaben. Keine eigene Gruppe, keine Zwischensumme. Heute existiert keine solche Karte — die Regel steht, damit sie nicht stillschweigend fehlt, wenn die erste angelegt wird.

**Was die Liste zeigt.** Nach §4.5 wirkt der Split nur auf Beträge aus Plan oder Anpassung, nie auf einen realen Umsatz. Die Liste zeigt also den künftigen **Plan-Anteil** — praktisch: auf welchen Betrag ein Dauerauftrag zu stellen ist.

Copy: §12.7. Beleg der Gestaltung: `V2/design_direktor_2026-08-06_liquiditaet_fragment_split.md` §4.
```

**Warum:** Record §4.0 (Rahmung/Plan-Anteil), §4.1 (zweiter Zustand, Summe als Held),
§4.2 (ein Knopf), §4.3 (Spalten, 400 px in beiden Zuständen), §4.4 (leerer Fall),
§4.5 (gemeinsame Einnahmen).

---

## D2 · §12.7 — Copy der Konsequenz-Anzeige

**Anker** (letzte Zeile der §12.7-Tabelle):

```
| Confirm-Button | `Übernehmen` |
```

**Patch-Satz** — ersetzt den Anker:

```markdown
| Confirm-Button | `Übernehmen` |
| Konsequenz-Anzeige — Held-Zeile | `+[N] € mehr pro Monat für [N] gemeinsame Posten` |
| Konsequenz-Anzeige — Spaltenköpfe | `Bisher` / `Künftig` / `Diff.` |
| Konsequenz-Anzeige — Abschluss-Button | `Schließen` |
```

**Warum:** Record §4.2/§4.3 + Doku-Folge-Tabelle.

---

## E1 · Header — Version und Status

**Anker:**

```
**Version:** 3.2.0 (V2 · v2-13 `BF-4` — Split-Semantik umgekehrt)
**Status:** Freigegeben — Schema-Doku v3.4; V2-Patches bis Sprint v2-07 eingespielt
```

**Patch-Satz** — ersetzt den Anker:

```markdown
**Version:** 3.3.0 (V2 · DD-Runde 06.08.2026 — Liquidität, Schaufenster, Split-Folgen)
**Status:** Freigegeben — Schema-Doku v3.4.4; V2-Patches bis Sprint v2-14 eingespielt, dazu die Design-Entscheidungen vom 06.08.2026 (`LQ-2` · `LQ-1` · `RM-2` · `PA-1` — entschieden, Umsetzung steht aus)
```

**Warum:** Minor-Bump (Begründung in E2). Die Status-Zeile stand auf „Schema-Doku v3.4;
V2-Patches bis Sprint v2-07" — die Schema-Doku steht heute auf **v3.4.4** (Header jener
Datei), und die Design-Doku ist seither über v2-10 bis v2-13 nachgezogen worden;
`sprints/sprint_v2-14_doku_patches.md` hält ausdrücklich fest, dass v2-14 seinen
Design-Doku-Anteil in diese Gestaltungsrunde verschoben hat. Nachzug ausdrücklich
beauftragt.

---

## E2 · Header — Changelog-Absatz v3.3.0

**Anker** (Übergang vom letzten Changelog-Absatz zur Datei-Konvention):

```
>
> **Datei-Konvention (23.07.2026):** Stabiler Dateiname `antigravity_finance_design_dokument.md` — Version nur noch im Header/Changelog, Datei-Renames pro Patch-Level entfallen.
```

**Patch-Satz** — ersetzt den Anker (neuer Absatz **vor** der Datei-Konvention, wie alle
Changelog-Einträge chronologisch aufsteigend):

```markdown
>
> **Changelog v3.3.0 (06.08.2026, Design-Direktor-Runde · `LQ-2` `LQ-1` `RM-2` `PA-1`):** Vier neue Spezifikationen. §8 **Ausstehend-Anzeige** rechtsbündig in der Kopfzeile der Zone „Planung" — zwei getrennte Angaben (`[N] € noch fällig` / `[N] € Budget frei`), **nie eine Summe** (`LQ-2`, Befund `L7`); §12.9 neu für die Copy. §7 **Fälligkeitstag** am rechten Anschlag der Statuszeile, ohne zusätzliche Kartenhöhe, mit drei Leer-Fällen und Verbleib im Zustand „Bezahlt"; neuer Kontextmenü-Punkt `Fällig am …` (nicht auf Budget-Karten) statt eines Feldes in „Betrag anpassen" (`LQ-1`); §12.3 und §12.4 nachgezogen. §11 **Schaufenster-Popup** — reines Anzeigen, Empfänger als Hauptzeile, Visa-Sonderfall ohne Zweck-Zeile, feste Rangfolge unter dem Strich, Hash und Import-Zeitpunkt ausgeschlossen (`RM-2`). §10 **Konsequenz-Anzeige** als zweiter Popup-Zustand — Summe als Held, Spalten `Bisher`/`Künftig`/`Diff.`, 400 px in beiden Zuständen, leerer Fall zeigt nichts (`PA-1`); §12.7 nachgezogen. **Minor-Bump statt Patch-Bump**, weil §8 zusätzlich eine bestehende Regel **aufhebt**: zugeordnete Fragmente und Überträge sind nicht mehr per `pointer-events: none` tot gestellt, sondern öffnen das Schaufenster — Daten-Invariante (nie an Karten verlinkbar) und Drag-Sperre bleiben unberührt. Alle vier Spezifikationen sind **entschieden, aber noch nicht gebaut**. Beleg: `V2/design_direktor_2026-08-06_liquiditaet_fragment_split.md`.
>
> **Datei-Konvention (23.07.2026):** Stabiler Dateiname `antigravity_finance_design_dokument.md` — Version nur noch im Header/Changelog, Datei-Renames pro Patch-Level entfallen.
```

**Warum:** Record, Abschnitt „Doku-Folge" — Minor-Bump ausdrücklich begründet (vier neue
Spezifikationen **und** eine aufgehobene Regel), Stil nach dem Vorbild des
v3.2.0-Eintrags.

---

## Nicht angewendet — offene Stellen

| # | Stelle | Warum nicht |
|---|---|---|
| **O1** | Inhaltsverzeichnis (Zeile 36 ff.) | Es führt **keine** §12-Unterpunkte, also ist zu §12.9 nichts mitzuziehen. Dabei ist aufgefallen: Das Verzeichnis ist ab Punkt 12 **um eins verschoben** — „12. Bekannte Limitationen V1" / „13. Empfohlene Implementierungs-Reihenfolge", während das Dokument §12 UI-Copy, §13 Limitationen, §14 Reihenfolge führt. Ein Bestandsfehler ohne Bezug zu dieser Runde; eine Korrektur wäre eine Gelegenheits-Änderung und braucht einen eigenen Auftrag. |
| **O2** | ~~§11, Drag-Verhalten-Tabelle~~ | **Erledigt — siehe C3.** Zunächst offen gelassen, weil der Erst-Auftrag ausdrücklich nur die beiden §8-Stellen benannte. Nach ausdrücklicher Beauftragung durch den Koordinator am 06.08.2026 als eigener Punkt **C3** nachgetragen und angewendet, mit der Präzisierung Klick-Sperre ↔ Drag-Sperre. |
| **O3** | §13 „Bekannte Limitationen V1" | Keine der vier Entscheidungen hebt eine dort gelistete Limitation auf; nichts zu ändern. |
| **O4** | `CLAUDE.md`, `antigravity_finance_schema_summary.md`, Code | Ausdrücklich außerhalb dieses Auftrags. |

---

*Doku-Patch · Antigravity Finance · 06. August 2026 · Subagent `docs-maintainer`*
