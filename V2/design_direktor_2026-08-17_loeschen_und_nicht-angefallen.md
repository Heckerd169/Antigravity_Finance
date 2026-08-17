# Design-Entscheidung — Löschen und „nicht angefallen", 17.08.2026

## Eine Karte loswerden, und ein Monat, in dem nichts war

> **Rollenwechsel ausgesprochen.** Hier wurde gestalterisch geurteilt. **Aufwand war in
> diesem Papier kein Argument** — er ist eine Frage für die Planung.
>
> **Status: ENTSCHIEDEN am 17.08.2026.** Alle drei Empfehlungen vom Nutzer bestätigt,
> die beiden offenen Punkte wie vorgeschlagen entschieden. Die Varianten bleiben stehen,
> weil eine verworfene Alternative Teil der Entscheidung ist — wer sie später wieder
> vorschlägt, soll lesen können, warum sie es nicht war.
>
> **Anlass:** `V2/befunde_2026-08-17_kuratierung-2026.md`. Der Nutzer hat 2026
> vollständig kuratiert und zehn Punkte gemeldet; zwei Produktentscheidungen fielen am
> 17.08.2026 vorab (Löschen erlauben mit angezeigter Folge · Ein-Klick-Abkürzung für
> „nicht angefallen"). Dieses Papier entscheidet, **wie** beides aussieht.

---

## Die Entscheidungen auf einen Blick

| # | Entscheidung | Verworfen |
|---|---|---|
| **1** | Die Folge des Löschens steht als **eine Zeile im bestehenden Toast** — Summe, nicht Liste. Türkis bei Entlastung, rot bei Belastung. Leerer Fall: gar nichts | §10-Popup mit `Bisher`/`Künftig`/`Diff.` · Bestätigung vor dem Löschen |
| **2** | Eigener Menüpunkt **`Diesen Monat nicht angefallen`**, Gegenstück **`Wieder mitzählen`**. Ein Klick, kein `…`. Nicht auf BUDGET, nicht auf Ghost, **nicht bei verknüpfter Zahlung** | 0-€-Knopf in „Betrag anpassen" · Häkchen auf der Karte |
| **3** | **`nicht angefallen`** in der Statuszeile, **anstelle** des Fälligkeitstags, im Ghost-Ton | gar keine Anzeige · eigenes Badge |
| **4** | **„Nicht angefallen" und das Bezahlt-Häkchen schließen sich aus.** Wer „nicht angefallen" setzt, verliert das Häkchen | beides zugleich zulassen |
| **5** | **`Wieder mitzählen` hebt JEDE Anpassung dieses Monats auf**, nicht nur die 0 — der Wortlaut beschreibt, was hinterher gilt | zweiter Wortlaut für den allgemeinen Fall |

**Entscheidung 3 stand nicht im Auftrag.** Sie kam beim Nachsehen dazu: `adjustedAmount`
wird von keiner Kartenkomponente benutzt, eine Anpassung ist auf der Karte heute
unsichtbar. Ohne sie wäre Entscheidung 2 eine stille Falschaussage.

### Was hier entschieden wird

1. **Wie die Folge des Löschens erscheint**, wenn eine Karte in die Vergangenheit reicht.
2. **Der Menüpunkt** für „dieser Monat ist nicht angefallen" — Wortlaut, Ort, Gegenstück.
3. **Woran man einen angepassten Monat auf der Karte erkennt.** Dieser Punkt stand nicht
   im Auftrag; er kam beim Nachsehen dazu (Begründung in Entscheidung 3).

### Was hier ausdrücklich NICHT entschieden wird

- **`M2`** — die Verben und Gesten des Karten-Lebenszyklus (Beenden / Löschen / Lösen)
  bleiben offen. Dieses Papier fügt einen **Monats**-Punkt hinzu, keinen
  Lebenszyklus-Punkt; `Betrag anpassen` liegt heute schon in derselben Ebene. Die
  Verbensprache von `Karte löschen` selbst wird **nicht** angefasst.
- **Ob der Löschriegel fällt.** Das hat der Nutzer bereits entschieden. Hier geht es nur
  darum, wie die Folge sichtbar wird.
- **Die Datenpflege** (neun „Fahrradteile", zwei kategorielose Einnahmen) — das ist
  Arbeit in der App, keine Gestaltung.
- **`A1-F`, `B2-F`, `M5`** — unberührt.

---

## Was vorher angesehen wurde

| Quelle | Was daraus folgt |
|---|---|
| **§10 Konsequenz-Anzeige (`PA-1`, 06.08.2026)** | Es gibt ein fertiges Muster für „eine Änderung wirkt über viele Monate": Held ist die **Summe**, darunter `Bisher`/`Künftig`/`Diff.`, 400 px, ein Knopf `Schließen`, gespiegelte Richtungswörter, **türkis bei Entlastung, rot bei Belastung**, und der leere Fall zeigt **gar nichts**. |
| **§12.5 Toast (Soft-Delete)** | `Karte löschen` hat **heute schon** eine Rückmeldung: `[Kartenname] gelöscht` · `Karte wird dauerhaft entfernt` · `Rückgängig`, 5 Sekunden. Die App beantwortet „zerstörende Aktion" also mit **handeln + zurücknehmbar**, nicht mit Bestätigung. |
| **§12.4 Kontextmenü** | Fünf Punkte: `Betrag anpassen` (mit `Nur dieser Monat` / `Dauerhaft ab diesem Monat`), `Letzte Zahlung in Monat X`, `Karte löschen`, `Fällig am …`, `Kategorie ändern …`. |
| **§7 Ghost-/Forecast-Karten** | Zeigen ein **reduziertes** Menü ohne `Betrag anpassen`. |
| **§7 Prioritätskette** | **Realität → Anpassung → Plan.** Eine verknüpfte Zahlung schlägt jede Anpassung. |
| **`src/components/cards/`** | **`adjustedAmount` steht nur im Typ und wird von keiner Kartenkomponente benutzt.** Eine Anpassung ist heute unsichtbar. |

---

## Entscheidung 1 — Wie die Folge des Löschens erscheint

**Das Problem in einer Zahl:** Die versehentlich monatliche Karte „Fahrradteile" trägt
**26,90 € in zehn Monaten**. Sie zu löschen hebt die Sparrate in neun Monaten um je
26,90 €. Wer das nicht sieht, wundert sich später über eine Bewegung, die er selbst
ausgelöst hat.

### ▶ Variante A — die Folge steht im Toast, der schon existiert *(Empfehlung)*

`Karte löschen` bleibt **ein Klick**. Der bestehende Toast bekommt eine Zeile.

```
┌──────────────────────────────────────────────┐
│  Fahrradteile gelöscht                       │
│  Sparrate in 10 Monaten · zusammen +269,00 € │   ← neu, türkis
│                                  Rückgängig  │
└──────────────────────────────────────────────┘
```

- **Held ist die Summe, nicht die Liste** — genau wie §10 es festlegt.
- **Ein Monat betroffen → der Monat wird genannt**, weil das nützlicher ist als „in 1
  Monat": `Sparrate Januar · −53,70 €`.
- **Farbe nach der bestehenden Regel:** türkis, wenn die Sparrate steigt (Entlastung),
  rot, wenn sie sinkt (Belastung). Keine neue Farbe (§10, gespiegelter Fall).
- **Leerer Fall — gar nichts.** Bewegt das Löschen keine Zahl (Karte nur im laufenden
  oder einem künftigen Monat, ohne Beitrag), bleibt der Toast wie heute. Keine
  Null-Zeile, kein „Keine Änderungen" (LL-20).
- `Rückgängig` ist **schon da**, 5 Sekunden, mit `Wiederhergestellt ✓`.

**Was sie kostet:** Die Aufschlüsselung fehlt. Wer wissen will, *welcher* Monat wie viel,
sieht es nicht — nur die Summe und die Zahl der Monate.

### Variante B — das §10-Muster: Popup mit `Bisher` / `Künftig` / `Diff.`

Vollständig und konsistent mit `PA-1`: alle drei Zahlen, eine Zeile je Monat, Summenzeile,
400 px, `Schließen`.

**Was sie kostet:** Aus einem Klick wird ein Dialog — und zwar einer, der **nach** der
Tat erscheint und weggeklickt werden muss. Bei neun gleichnamigen Karten hintereinander
sind das neun Dialoge. Dazu die eigentliche Schwäche: Für dieselbe Aktion ist der Toast
schon spezifiziert. Zwei Anzeigen für einen Vorgang, und die eine widerspricht der
anderen in ihrer Haltung („kurz und nebenbei" gegen „anhalten und lesen").

> Das Muster aus §10 sitzt dort gut, weil der Nutzer **bereits in einem Popup war** —
> „Übernehmen tauscht den Inhalt". Hier gibt es kein Popup, das man tauschen könnte.

### Variante C — Bestätigung **vor** dem Löschen

`Wirklich löschen? Die Sparrate ändert sich in 10 Monaten.` Am ehrlichsten im Wortsinn:
Man entscheidet informiert, statt zu korrigieren.

**Was sie kostet:** Die App kennt **keinen einzigen** Bestätigungs-Dialog. Der
Papierkorb mit `Rückgängig` ist die bewusste Alternative dazu — v2-20 hat ihn gebaut.
Ein `Wirklich?` wäre ein neues Interaktionsmuster und bräche die Haltung „handeln, dann
zurücknehmbar" an genau der Stelle, für die sie erfunden wurde.

---

## Entscheidung 2 — Der Menüpunkt

### ▶ Variante A — eigener Punkt, ein Klick, kein Dialog *(Empfehlung)*

| | |
|---|---|
| **Wortlaut** | `Diesen Monat nicht angefallen` |
| **Gegenstück** | `Wieder mitzählen` |
| **Ort** | direkt **unter** `Betrag anpassen` — beide sind monatsbezogen |
| **`…`?** | **nein.** Kein Dialog, keine Eingabe. `…` trägt in dieser App, was einen Dialog öffnet (`Fällig am …`, `Kategorie ändern …`, `Karte beenden…`) |
| **Nicht auf** | BUDGET-Karten · Ghost-/Forecast-Karten · Karten mit **verknüpfter Zahlung in diesem Monat** |

**Warum dieser Wortlaut.** Er beschreibt die **Welt**, nicht die Datenbank. Der Nutzer
hat gesagt *„ich gehe nicht jeden Monat zum Frisör"* — genau das steht dann im Menü.
Verworfen: `Diesen Monat übersprungen` (klingt nach Abo, passt nicht auf den Friseur),
`Diesen Monat nicht bezahlt` (zweideutig — offen oder entfallen?), `Diesen Monat auf 0 €`
(beschreibt den Mechanismus statt der Sache).

**Warum ein Gegenstück und kein Umschalter ohne Namen.** §7 macht es bei
`Karte beenden…` / `Ende aufheben` genauso: gesetzter Zustand, benannte Rücknahme. Ohne
sie müsste man über `Betrag anpassen` zurück — ein Weg hinein, ein anderer hinaus.

**Warum nicht auf Karten mit verknüpfter Zahlung.** Die Prioritätskette ist
**Realität → Anpassung → Plan**. Liegt eine Zahlung an, gewinnt sie ohnehin, und der
Menüpunkt wäre ein Versprechen ohne Wirkung. Ein Punkt, der nichts tut, ist schlimmer
als keiner.

**Warum nicht auf BUDGET-Karten.** Ein Budget *fällt nicht an* — es steht zur Verfügung.
„Nicht angefallen" ist die Vokabel eines Kostenpunkts. Dieselbe Grenze zieht §7 schon
beim Fälligkeitstag (`nicht auf Budget-Karten`).

**Warum auf INCOME-Karten schon.** Eine erwartete Einnahme, die nicht kam, ist derselbe
Fall — und im Bestand liegen zwei davon („Malin Besuch Erstattung" 53,70 € im Januar,
„Anteil Essen Aline Marburg" 15,00 € im April, beide ohne Zahlung).

### Variante B — ein 0-€-Knopf in „Betrag anpassen"

Kein neuer Menüpunkt, die Zahl bleibt bei fünf.
**Kosten:** Dialog öffnen, Knopf drücken, übernehmen — und der Punkt heißt weiter
„Betrag anpassen", obwohl nichts angepasst wird. Das Wort führt in die falsche Richtung.

### Variante C — ein Häkchen auf der Karte

Der schnellste Weg überhaupt, ein Tap.
**Kosten:** Der Tap hat auf der Karte schon eine Bedeutung („bezahlt"). §7 hält Karten
ausdrücklich von Drag-Quellen frei, damit der Tap eindeutig bleibt (`KAT-2`,
08.08.2026). Ein zweiter Tap-Sinn nimmt genau diese Eindeutigkeit zurück.

---

## Entscheidung 3 — Woran man den angepassten Monat erkennt

**Dieser Punkt stand nicht im Auftrag.** Er kam beim Nachsehen dazu, und ohne ihn wäre
Entscheidung 2 unvollständig:

> **`adjustedAmount` wird von keiner Kartenkomponente benutzt.** Eine Anpassung ist auf
> der Karte heute **unsichtbar**. Setzt der Nutzer Friseur auf 0 €, zeigt die Karte
> `0,00 €` — und nichts unterscheidet das von „keine Daten". Genau davor warnt LL-20:
> *ein Referenzwert ohne Daten ist „keine Anzeige", nicht 0.* Hier ist es umgekehrt und
> genauso falsch: eine bewusste 0 sieht aus wie eine Leere.

### ▶ Variante A — `nicht angefallen` in der Statuszeile *(Empfehlung)*

Im Ghost-Ton, **am rechten Anschlag der Statuszeile — dort, wo sonst der Fälligkeitstag
steht.** Er wird ersetzt, nicht ergänzt.

**Warum ersetzt:** Ein Monat, in dem die Sache nicht angefallen ist, hat keinen
Fälligkeitstag mehr, den man erwarten könnte. Die Angabe wäre nicht nur überflüssig,
sondern irreführend. Und: **keine zusätzliche Kartenhöhe** — §7 legt für den
Fälligkeitstag genau das fest.

**Kein neues Token, keine neue Farbe.** `--text-ghost` ist der Ton, den der
Fälligkeitstag ohnehin trägt.

### Variante B — nichts, die `0,00 €` genügt

**Kosten:** Sie genügt nicht. Zwei sehr verschiedene Sachverhalte sehen identisch aus,
und der Nutzer müsste das Kontextmenü öffnen, um sie zu unterscheiden. Das verstößt
gegen **Ehrlichkeit vor Beruhigung**.

### Variante C — ein eigenes Kennzeichen, wie das „TRANSFER"-Badge

**Kosten:** Badges sind in dieser App der Rohmasse vorbehalten (§11 Vorschlag-Badge,
TRANSFER-Badge). Ein Badge auf einer Karte wäre ein neues Element in einer Zone, die
bewusst ruhig ist — und es müsste sich eine Farbe nehmen.

---

## Prüfung gegen die fünf Grundsätze

| Grundsatz | Prüffrage | Befund |
|---|---|---|
| **Ein Screen, ein Monat, eine Zahl** | Lenkt es von der Sparrate ab? | **Nein.** Variante 1A ist eine Toast-Zeile, 2A ein Menüpunkt, 3A ersetzt einen bestehenden Text. Nichts Neues auf der Bühne. Variante 1B hätte einen Dialog eingeführt. |
| **Schmale Palette** | Wird eine Statusfarbe neu belegt? | **Nein.** Türkis/Rot in 1A folgen §10 (Entlastung/Belastung), 3A nutzt `--text-ghost`. Kein Gold, kein Blau. |
| **Ruhe vor Betonung** | Schreit der Vorschlag? | **Nein.** Eine Summe statt einer Tabelle, ein Menüpunkt statt eines Dialogs, ein ersetzter Text statt eines Badges. |
| **Werkzeug ist nicht Produkt** | Panels, Regler, Schalter? | **Nein.** Die verworfene Variante 1B kam einem Prüfwerkzeug am nächsten — Tabelle mit drei Zahlenspalten nach dem Löschen. |
| **Ehrlichkeit vor Beruhigung** | Wird etwas Unangenehmes versteckt? | **Das ist der Grund für 1A und 3A.** Heute verschweigt die App beides: dass ein Löschen die Vergangenheit bewegt, und dass eine 0 gewollt ist. Beides wird sichtbar, ohne laut zu werden. |

---

## Vorgeschlagene Copy für §12

**§12.4 — zwei neue Zeilen:**

| Kontext | Text |
|---|---|
| Kontextmenü — nicht angefallen | `Diesen Monat nicht angefallen` |
| Kontextmenü — Rücknahme | `Wieder mitzählen` |

**§12.3 (Karten-Statuszeile) — eine neue Zeile:**

| Kontext | Text |
|---|---|
| Statuszeile — angepasst auf 0 | `nicht angefallen` *(ersetzt den Fälligkeitstag)* |

**§12.5 (Toast) — eine neue Zeile:**

| Kontext | Text |
|---|---|
| CARD DELETE — Folge, mehrere Monate | `Sparrate in [N] Monaten · zusammen [±N] €` |
| CARD DELETE — Folge, ein Monat | `Sparrate [Monat] · [±N] €` |
| CARD DELETE — Folge, keine | *(entfällt — kein Zusatz)* |

---

## Die zwei offenen Punkte — entschieden am 17.08.2026

**Entscheidung 4 — Bezahlt-Häkchen und „nicht angefallen" schließen sich aus.**
Beides zugleich ist widersprüchlich: „ist bezahlt" gegen „fiel nicht an". Wer „nicht
angefallen" setzt, **verliert das Häkchen**. Die umgekehrte Richtung folgt daraus: Wer
danach abhakt, hebt die Anpassung auf — sonst stünde ein Häkchen an einer Karte, die
0,00 € zeigt, und das wäre die Falschaussage, die Entscheidung 3 gerade verhindert.

**Entscheidung 5 — `Wieder mitzählen` hebt jede Anpassung dieses Monats auf.**
`Betrag anpassen` kann jeden Wert schreiben, nicht nur 0. Die Rücknahme wirkt auf alle:
Der Wortlaut beschreibt, **was hinterher gilt** („die Karte zählt wieder mit ihrem
Plan"), nicht wovon man kommt. Ein zweiter Wortlaut für den allgemeinen Fall wäre eine
Unterscheidung, die der Nutzer im Menü treffen müsste, ohne sie treffen zu wollen.

**Folge für die Sichtbarkeit:** Entscheidung 3 spricht von „angepasst auf 0". Eine
Anpassung auf einen **anderen** Wert bleibt damit weiterhin unsichtbar. Das ist bewusst
so belassen — dieser Fall war nicht Gegenstand der Runde, und eine Kennzeichnung für
jede Anpassung wäre eine eigene Entscheidung. **Als offener Punkt vermerkt, nicht
stillschweigend mitentschieden.**

## Was danach noch offen bleibt

1. **Der Nachweis, dass die 5 Sekunden reichen.** Die Toast-Zeile ist neu; ob sie in der
   Zeit gelesen wird, sieht man erst am gerenderten Bild — Sache des `smoke-agent`,
   nicht dieser Rolle.
2. **Eine Anpassung auf einen Wert ≠ 0 bleibt auf der Karte unsichtbar** (siehe oben).
   Eigene Entscheidung, wenn sie ansteht.
3. **`M2`** — die Verben und Gesten des Karten-Lebenszyklus. Unberührt.

---

## Was das entsperrt

Mit diesen drei Entscheidungen ist **Sprint v2-25** schneidbar:

| Phase | Was | Datenbank |
|---|---|---|
| P1 | Löschriegel fällt · Folge im Toast (Entscheidung 1A) | **ja** |
| P2 | `Diesen Monat nicht angefallen` + `Wieder mitzählen` (2A) · Statuszeile (3A) | nein |
| P3 | Überlagerung der Monatsnamen im Header | nein |

Danach die Datenpflege — sie hängt an P1 und P2.

## Doku-Folge

- **§7** — Statuszeile: `nicht angefallen` ersetzt den Fälligkeitstag; Menü-Regeln
  (nicht auf BUDGET, nicht auf Ghost, nicht bei verknüpfter Zahlung).
- **§12.3 · §12.4 · §12.5** — die Copy-Zeilen oben.
- **Versions-Bump** Design-Doku auf **v3.9.0** (Minor: neue Spezifikationen, keine
  aufgehobene Regel).
- **`design-system/`** — die Karten-Seite zeigt die Statuszeile; sie gehört mit
  nachgezogen (Ablauf: `design-system/SYNC.md`).
