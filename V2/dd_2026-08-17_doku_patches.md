# Doku-Patches zur Design-Runde vom 17.08.2026

> **Verfahren:** LL-16 / §7 Regel 14. Je Stelle **Anker** (eindeutiger Suchtext) plus
> **Patch-Satz**. Kein direktes Editieren der Bibel.
>
> **Grundlage:** `V2/design_direktor_2026-08-17_loeschen_und_nicht-angefallen.md`,
> alle fünf Entscheidungen am 17.08.2026 vom Nutzer bestätigt.
>
> **Ziel:** Design-Doku **v3.8.0 → v3.9.0**. Minor-Bump: drei neue Spezifikationen,
> **keine aufgehobene Regel**.
>
> **Alle drei Spezifikationen sind entschieden und NOCH NICHT GEBAUT** — dieselbe Lage
> wie bei v3.3.0. Der Bau ist Sprint v2-25.

---

## P1 · Version, Status, Datum

**Anker:** `**Version:** 3.8.0 (V2 · Sprint v2-24 — Ladezustand, Fehlerseite, dritter Treiber-Platzhalter)`

**Patch:** → `**Version:** 3.9.0 (V2 · Design-Runde 17.08.2026 — Löschen und „nicht angefallen")`

**Anker:** `**Status:** Freigegeben — Schema-Doku v3.10.0; V2-Patches bis Sprint v2-24 eingespielt.`

**Patch:** ergänzen um: *„Die drei Spezifikationen der Runde vom 17.08.2026 sind
**entschieden, aber noch nicht gebaut** (Sprint v2-25)."*

---

## P2 · Changelog-Eintrag (vor dem v3.8.0-Block)

**Anker:** `> **Changelog v3.8.0 (17.08.2026, Sprint v2-24 · `PF-1` `PF-2`):**`

**Patch:** neuer Block **davor**:

```
> **Changelog v3.9.0 (17.08.2026, Design-Direktor-Runde · Löschen und „nicht
> angefallen"):** Drei neue Spezifikationen, **entschieden und noch nicht gebaut**
> (Sprint v2-25). Anlass ist die vollständige Kuratierung des Jahres 2026: Der Nutzer
> konnte **78 von 82 Karten nicht löschen** und sah Beträge in der Sparrate, die es nie
> gegeben hat.
>
> §7 **Die Folge des Löschens steht im Toast**, nicht in einem eigenen Dialog. `Karte
> löschen` bleibt ein Klick; der bestehende Soft-Delete-Toast bekommt eine Zeile mit der
> **Summe** der Sparraten-Wirkung — türkis bei Entlastung, rot bei Belastung, und im
> leeren Fall **gar nichts**. Verworfen: das §10-Muster mit `Bisher`/`Künftig`/`Diff.`
> (es sitzt dort gut, weil der Nutzer schon in einem Popup war — beim Löschen gibt es
> keins, das man tauschen könnte) und eine Bestätigung vorher (die App kennt **keinen**
> Bestätigungs-Dialog; der Papierkorb mit `Rückgängig` ist die bewusste Alternative).
>
> §7 **Neuer Menüpunkt `Diesen Monat nicht angefallen`** mit dem Gegenstück `Wieder
> mitzählen` — ein Klick, kein Dialog, kein `…`. Er ist die Abkürzung für „Betrag
> anpassen auf 0 €, nur diesen Monat", also **keine neue Rechenregel**. Nicht auf
> BUDGET-Karten (ein Budget *fällt nicht an*, es steht zur Verfügung — dieselbe Grenze
> wie beim Fälligkeitstag), nicht auf Ghost-/Forecast-Karten, und **nicht, wenn in
> diesem Monat eine Zahlung verknüpft ist**: Die Prioritätskette ist Realität →
> Anpassung → Plan, der Punkt wäre dort ein Versprechen ohne Wirkung.
>
> §7 **Die Statuszeile zeigt `nicht angefallen`** — am rechten Anschlag, **anstelle** des
> Fälligkeitstags, im Ghost-Ton. Ein Monat, in dem die Sache nicht angefallen ist, hat
> keinen Termin mehr, den man erwarten könnte. Ersetzen statt ergänzen heißt: keine
> zusätzliche Kartenhöhe, kein neues Token, keine neue Farbe.
>
> **Warum diese dritte Spezifikation überhaupt entstand:** `adjustedAmount` wird von
> keiner Kartenkomponente benutzt — eine Anpassung ist auf der Karte heute
> **unsichtbar**. Ohne den Marker sähe eine bewusste 0 aus wie fehlende Daten, und das
> ist genau die Verwechslung, vor der LL-20 warnt, nur mit umgekehrtem Vorzeichen.
>
> §12.3 · §12.4 · §12.5 um die Copy ergänzt. Zwei Folge-Entscheidungen: „nicht
> angefallen" und das **Bezahlt-Häkchen schließen sich aus**, und `Wieder mitzählen`
> hebt **jede** Anpassung des Monats auf, nicht nur die 0.
>
> Record: `V2/design_direktor_2026-08-17_loeschen_und_nicht-angefallen.md`
> (Entscheidungen 1–5). Befund: `V2/befunde_2026-08-17_kuratierung-2026.md`.
```

---

## P3 · §7 — Statuszeile und Menü-Regeln

**Anker:** `| Ort | rechter Anschlag der **Statuszeile** — **keine** neue Zeile, **keine** zusätzliche Kartenhöhe |`

**Patch:** neuer Block **nach** der Fälligkeitstag-Tabelle:

```
**„Diesen Monat nicht angefallen" (neu 17.08.2026):** Ein Kontextmenü-Punkt, der die
Karte in **diesem** Monat auf 0 € setzt. Er ist die Abkürzung für „Betrag anpassen auf
0 €, nur diesen Monat" und schreibt denselben Wert — **keine neue Rechenregel, kein
Eingriff in die Prioritätskette.** Gegenstück: `Wieder mitzählen`.

| | |
|---|---|
| Sichtbar auf | FIXED_COST und INCOME |
| **Nicht** sichtbar auf | BUDGET-Karten · Ghost-/Forecast-Karten · Karten mit **verknüpfter Zahlung in diesem Monat** |
| Ort im Menü | direkt unter `Betrag anpassen` — beide sind monatsbezogen |
| Dialog | keiner. Ein Klick, sofort wirksam |

**Warum nicht auf BUDGET-Karten.** Ein Budget *fällt nicht an* — es steht zur Verfügung.
„Nicht angefallen" ist die Vokabel eines Kostenpunkts. Dieselbe Grenze zieht der
Fälligkeitstag oben.

**Warum nicht bei verknüpfter Zahlung.** Die Prioritätskette ist **Realität → Anpassung
→ Plan**. Liegt eine Zahlung an, gewinnt sie; der Punkt wäre ein Versprechen ohne
Wirkung. Ein Menüpunkt, der nichts tut, ist schlechter als keiner.

**Warum auf INCOME-Karten schon.** Eine erwartete Einnahme, die nicht kam, ist derselbe
Fall — und im Bestand liegen zwei davon.

**Das Bezahlt-Häkchen und „nicht angefallen" schließen sich aus.** „Ist bezahlt" gegen
„fiel nicht an" ist ein Widerspruch. Wer „nicht angefallen" setzt, verliert das Häkchen;
wer danach abhakt, hebt die Anpassung auf. Sonst stünde ein Häkchen an einer Karte, die
0,00 € zeigt.

**`Wieder mitzählen` hebt JEDE Anpassung dieses Monats auf**, nicht nur die 0 — der
Wortlaut beschreibt, was hinterher gilt, nicht wovon man kommt.

**Die Statuszeile zeigt `nicht angefallen`** am rechten Anschlag, **anstelle** des
Fälligkeitstags, im Ghost-Ton (`--text-ghost`). Ein Monat, in dem die Sache nicht
angefallen ist, hat keinen Termin, den man erwarten könnte — die Angabe wäre nicht nur
überflüssig, sondern irreführend. Keine zusätzliche Kartenhöhe, kein neues Token.

> **Ohne diesen Marker wäre der Menüpunkt eine stille Falschaussage.**
> `card_monthly_states.adjusted_amount` wird heute von **keiner** Kartenkomponente
> angezeigt: Eine Karte mit Plan 45 € und Anpassung 0 zeigt `0,00 €`, und nichts
> unterscheidet das von fehlenden Daten. LL-20 warnt vor der einen Richtung („ein
> Referenzwert ohne Daten ist keine Anzeige, nicht 0"); dies ist die andere und genauso
> falsch.
>
> **Eine Anpassung auf einen Wert ≠ 0 bleibt weiterhin unsichtbar.** Bewusst nicht
> mitentschieden — eigene Entscheidung, wenn sie ansteht.

**Die Folge des Löschens steht im Toast (§12.5), nicht in einem Dialog.** `Karte
löschen` bleibt ein Klick. Seit dem Fall des Löschriegels kann eine Löschung die
Sparrate **vergangener** Monate bewegen; der Toast nennt deshalb die **Summe** der
Wirkung und die Zahl der betroffenen Monate. Held ist die Summe, nicht die Liste —
dieselbe Haltung wie §10. Türkis, wenn die Sparrate steigt (Entlastung), rot, wenn sie
sinkt (Belastung); keine neue Farbe. **Bewegt das Löschen keine Zahl, bleibt der Toast
wie bisher** — keine Null-Zeile, kein „Keine Änderungen" (LL-20).
```

---

## P4 · §12.3 — Statuszeilen-Copy

**Anker:** `| Fälligkeitstag (rechts in der Statuszeile) | `am [N].` *(leer bei Budget-Karten und Karten ohne Fälligkeitstag)* |`

**Patch:** eine Zeile danach:

```
| Statuszeile — Monat auf 0 angepasst | `nicht angefallen` *(ersetzt den Fälligkeitstag, Ghost-Ton)* |
```

---

## P5 · §12.4 — Kontextmenü-Copy

**Anker:** `| Kontextmenü — Fälligkeitstag | `Fällig am …` *(nicht auf Budget-Karten)* |`

**Patch:** zwei Zeilen danach:

```
| Kontextmenü — nicht angefallen | `Diesen Monat nicht angefallen` *(nur FIXED_COST/INCOME, nicht bei verknüpfter Zahlung)* |
| Kontextmenü — Rücknahme | `Wieder mitzählen` |
```

---

## P6 · §12.5 — Toast-Copy

**Anker:** `| CARD DELETE — Subtext | `Karte wird dauerhaft entfernt` |`

**Patch:** drei Zeilen danach:

```
| CARD DELETE — Folge, mehrere Monate | `Sparrate in [N] Monaten · zusammen [±N] €` |
| CARD DELETE — Folge, ein Monat | `Sparrate [Monat] · [±N] €` |
| CARD DELETE — Folge, keine Wirkung | *(entfällt — kein Zusatz, keine Null-Zeile)* |
```

---

## Nachzug außerhalb der Bibel

**`design-system/komponenten/`** — die Karten-Seite zeigt die Statuszeile und muss den
neuen Zustand `nicht angefallen` bekommen, sonst zeigt sie beim nächsten
Gestaltungsgespräch einen überholten Stand (CLAUDE.md §4). Ablauf:
`design-system/SYNC.md`.
**Gehört in Sprint v2-25**, nicht in diesen Patch — die Seite zeigt Gebautes.
