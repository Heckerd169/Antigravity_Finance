# Sprint v2-26 — Doku-Patches

> **Verfahren nach §7 Regel 14 / LL-16:** Anker + Patch-Satz je Stelle, danach
> angewendet. Die beiden Bibeln werden nie direkt editiert.
>
> **Anlass:** Fünf Meldungen des Nutzers nach dem Merge von v2-25. Vier davon sind
> Nachbesserungen an dem, was v2-25 gebaut hat; die fünfte (`Wiederholung ändern`)
> schließt eine Lücke, die es schon immer gab und die erst durch v2-25 sichtbar wurde.

---

## Patch 1 · Design-Doku §7 — „nicht angefallen" ist ein ERLEDIGTER Zustand

**Datei:** `antigravity_finance_design_dokument.md`
**Abschnitt:** §7, Block „Diesen Monat nicht angefallen"

### Anker

```
**Die Statuszeile zeigt dann `nicht angefallen`** — im Ghost-Ton (`--text-ghost`),
**anstelle des Status-Labels**, und der Fälligkeitstag verschwindet mit. Ersetzen statt
ergänzen heißt: **keine zusätzliche Kartenhöhe, kein neues Token, keine neue Farbe.**
```

### Patch-Satz

```
**Die Karte nimmt den Zustand „erledigt" an** — türkiser Grund, Häkchen-Icon, genau wie
`Bezahlt` bzw. `Erhalten`. **An ihr ist nichts mehr zu tun**, und der Ordner darüber
zählt sie folgerichtig nicht mehr in sein `[N] offen`.

> **Bis v2-26 war das anders, und es war eine Falschaussage.** Eine Karte, bei der
> nichts anfiel, blieb rot und „Offen"; der Ordner meldete `3 offen`, von denen zwei
> gar nicht mehr offen waren. Die Regel sitzt in `card-state.ts` an **einer** Stelle —
> Karte und Ordner-Kachel benutzen dieselben Resolver, genau dafür wurden sie in v2-17
> herausgelöst.

**Die Statuszeile zeigt trotzdem weiter `nicht angefallen`** — im Ghost-Ton
(`--text-ghost`), **anstelle des Status-Labels**, und der Fälligkeitstag verschwindet
mit. Ersetzen statt ergänzen heißt: **keine zusätzliche Kartenhöhe, kein neues Token,
keine neue Farbe.**

**Die Karte sieht also erledigt aus und nennt den Grund.** Stünde dort `Bezahlt`, wären
„ich habe gezahlt" und „es fiel nichts an" wieder ununterscheidbar — genau die
Verwechslung, die `KJ-3` behoben hat. Der Zustand ist derselbe, die Begründung nicht.

**Auslöser ist `adjusted_amount === 0`, nicht `amount === 0`.** Eine Karte kann aus
anderen Gründen 0 anzeigen (Plan 0, kein Fragment) und ist dann weiterhin offen. Nur die
**bewusste** Null zählt (§6 Stolperfalle 3).
```

---

## Patch 2 · Design-Doku §7 — neuer Block „Die Wiederholung ändern"

**Abschnitt:** §7, direkt nach dem Block „Diesen Monat nicht angefallen"

### Anker

```
### Die Folge des Löschens (neu 17.08.2026) — entschieden, noch nicht gebaut
```

### Patch-Satz — davor einfügen

```
### Die Wiederholung ändern (neu 18.08.2026, v2-26)

Ein Kontextmenü-Punkt `Wiederholung ändern …` öffnet ein Overlay mit den fünf Werten aus
§12.4 (`Monatlich` · `Quartalsweise` · `Halbjährlich` · `Jährlich` · `Einmalig`).

| | |
|---|---|
| Sichtbar auf | allen Kartentypen |
| **Nicht** sichtbar auf | Ghost-/Forecast-Karten (sie zeigen nur die Lebenszyklus-Verben) |
| Ort im Menü | direkt über `Kategorie ändern …` — beide sind Eigenschaften der Karte, keine Monats-Zustände |
| Dialog | **ja**, deshalb `…` |
| Unterzeile | `[Kartenname] · gilt für alle Monate` |

**Warum es das überhaupt geben muss.** Bis v2-26 war die Frequenz nach dem Anlegen
**endgültig**. Der Vorgabewert beim Anlegen ist `Monatlich` — man vertut sich also durch
Nichtstun —, und danach half nur Löschen und Neuanlegen. Genau das ist am 18.08.2026
passiert: eine als quartalsweise gedachte Karte stand auf monatlich, erschien in jedem
Monat, und ließ sich zusätzlich nicht löschen.

**Warum ein Dialog und kein Untermenü.** Die Änderung **bewegt die Sparrate**, und zwar
erheblich: monatlich → jährlich nimmt elf Monate aus dem Jahr. Das `…` ist in dieser App
das Zeichen für „öffnet einen Dialog" (§12.4), und der Dialog ist hier richtig, weil eine
Auswahl mit dieser Tragweite nicht im Vorbeigehen passieren soll.

**Die Wirkung erscheint danach im Toast** — dieselbe Zeile, dieselben Farben und dieselbe
Regel für den leeren Fall wie beim Löschen (§12.5). Bewegt sich nichts, erscheint nichts.

**Sie gilt für alle Monate, rückwirkend wie künftig.** `cards.frequency` ist eine
Eigenschaft der Karte, keine Zeitreihe — dieselbe Natur wie `due_day` und `category_id`.
Genau deshalb steht sie **nicht** in „Betrag anpassen", wo alles entweder *nur dieser
Monat* oder *dauerhaft ab diesem Monat* ist.

```

---

## Patch 3 · Design-Doku §7 — der volle Haushaltsbetrag beim Anlegen

**Abschnitt:** §7, Block „Haushaltsbetrag-Zeile (seit `BF-4`, 05.08.2026)"

### Anker

```
**Die Zuordnung entsteht durch Nähe, nicht durch ein Label.** Der Qualifizierer steht unmittelbar unter der Zahl, die er qualifiziert; die Gruppierung macht der Weißraum.
```

### Patch-Satz

```
**Die Zuordnung entsteht durch Nähe, nicht durch ein Label.** Der Qualifizierer steht unmittelbar unter der Zahl, die er qualifiziert; die Gruppierung macht der Weißraum.

> **Beim ANLEGEN einer gemeinsamen Karte ist der eingegebene Betrag der
> Haushaltsbetrag** — nicht der eigene Anteil. Beide Anlage-Wege sagen das seit v2-26
> ausdrücklich und zeigen den Anteil zur Kontrolle:
> `Voller Haushaltsbetrag — dein Anteil davon: [N] €`.
>
> **Der Hinweis erscheint nur, wenn es einen Partner gibt** (Split-Faktor < 1). Bei 1,0
> wären Anteil und Haushalt identisch und die Zeile erklärte nichts — dieselbe Regel,
> nach der die Karte selbst die `von X €`-Zeile leer lässt.
>
> **Warum das nötig wurde:** Im Popup „Karte aus Zahlung" war der Betrag bis v2-26 fest
> auf den Zahlungsbetrag verdrahtet und **gar nicht eingebbar**. Eine Zahlung ist aber
> bereits der überwiesene **Anteil**. Wer daraus eine gemeinsame Karte machte, bekam den
> Anteil als Plan — und beim Rechnen wurde er ein **zweites Mal** abgezogen (§6
> Stolperfalle 11). Der Befund vom 17.08.2026 beschreibt genau diesen Fall an der
> Privathaftpflicht: 53,25 € Haushalt, 28,88 € abgebucht.
```

---

## Patch 4 · Design-Doku §12.4 — zwei neue Copy-Zeilen

### Anker

```
| Kontextmenü — Rücknahme | `Wieder mitzählen` |
```

### Patch-Satz

```
| Kontextmenü — Rücknahme | `Wieder mitzählen` |
| Kontextmenü — Wiederholung | `Wiederholung ändern …` *(nicht auf Ghost-Karten)* |
| Wiederholung — Overlay-Titel | `Wiederholung` |
| Wiederholung — Unterzeile | `[Kartenname] · gilt für alle Monate` |
| Wiederholung — Hinweis | `Gilt auch für vergangene Monate. Wie sich die Sparrate dadurch ändert, steht gleich in der Meldung.` |
| Anlegen — Hinweis bei GEMEINSAM | `Voller Haushaltsbetrag — dein Anteil davon: [N] €` |
```

---

## Patch 5 · Design-Doku §12.5 — der Beenden-Toast ist jetzt gebaut

**Keine Textänderung.** §12.5 nennt seit jeher `[Kartenname] — Endet in [Monat Jahr]`;
der Code sagte bis v2-26 `Karte »X« endet im 04/2026`. Die Doku hatte recht, die
Umsetzung nicht — **kein Patch nötig, nur der Vermerk im Changelog**, dass die
Abweichung behoben ist.

**Zusätzlich eine neue Zeile für die Frequenz-Änderung:**

### Anker

```
| CARD DELETE — Folge, keine Wirkung | *(entfällt — kein Zusatz, keine Null-Zeile)* |
```

### Patch-Satz

```
| CARD DELETE — Folge, keine Wirkung | *(entfällt — kein Zusatz, keine Null-Zeile)* |
| CARD FREQUENCY — Titel | `[Kartenname] — Wiederholung geändert` |
| CARD FREQUENCY — Folge | wie CARD DELETE (`Sparrate in [N] Monaten · zusammen [±N] €`) |
| CARD FREQUENCY — ohne Wirkung | *(entfällt — es erscheint gar kein Toast)* |
```

---

## Patch 6 · Design-Doku — Versions-Bump und Changelog

### Anker

```
**Version:** 3.9.1 (V2 · Sprint v2-25 — gebaut, mit einer gemessenen Korrektur an §7)
```

### Patch-Satz

```
**Version:** 3.10.0 (V2 · Sprint v2-26 — Nachbesserungen aus der Benutzung)
```

### Zweite Anker-Stelle — neuer Changelog-Block über `> **Changelog v3.9.1`

```
> **Changelog v3.10.0 (18.08.2026, Sprint v2-26):** Fünf Nachbesserungen, alle aus der
> Benutzung von v2-25 gemeldet. **Minor, weil zwei davon neue Spezifikation sind** — der
> Menüpunkt `Wiederholung ändern …` und der Hinweis auf den Haushaltsbetrag beim
> Anlegen.
>
> §7 — **„nicht angefallen" ist ein ERLEDIGTER Zustand**: türkis, Häkchen, und der
> Ordner zählt die Karte nicht mehr als offen. Die Statuszeile nennt weiterhin den
> Grund, damit „bezahlt" und „fiel nicht an" unterscheidbar bleiben. Bis v2-26 blieb
> die Karte rot und der Ordner meldete `3 offen`, von denen zwei erledigt waren.
>
> §7 · §12.4 — **neuer Block „Die Wiederholung ändern"**. Die Frequenz war nach dem
> Anlegen endgültig; der Vorgabewert ist `Monatlich`, man vertut sich also durch
> Nichtstun. Sie gilt für alle Monate, rückwirkend wie künftig, und die Änderung bewegt
> die Sparrate — deshalb ein Dialog und ein Toast mit der Wirkung.
>
> §7 · §12.4 — **beim Anlegen einer gemeinsamen Karte ist der Betrag der
> HAUSHALTSBETRAG**, und die Oberfläche sagt es jetzt. Im Popup „Karte aus Zahlung" war
> er zuvor gar nicht eingebbar, sondern fest der Zahlungsbetrag — also der bereits
> überwiesene Anteil, der beim Rechnen ein zweites Mal gekürzt wurde.
>
> §12.5 — der Beenden-Toast folgt jetzt der seit jeher gültigen Spezifikation
> `[Kartenname] — Endet in [Monat Jahr]`. **Die Doku hatte recht, der Code nicht.**
>
> **Was dieser Sprint über den letzten sagt:** Vier der fünf Punkte betreffen etwas, das
> v2-25 gebaut oder freigelegt hat. Der Löschriegel fiel — und darunter kam eine zweite
> Sperre zum Vorschein, die niemand kannte, weil sie nie erreichbar war.
```

---

## Patch 7 · Schema-Doku — zwei geänderte Funktionen

**Datei:** `antigravity_finance_schema_summary.md`

1. **`card_delete_gate`** — `HAS_STATES` zählt nur noch Zustände, die **etwas aussagen**
   (`manually_paid OR adjusted_amount IS NOT NULL`). Eine Zeile mit `false`/`NULL` ist
   der Rückstand eines zurückgenommenen Tap; sie trug keine Historie, sperrte aber
   dauerhaft und war nicht mehr loszuwerden.
2. **`set_card_frequency(p_card_id, p_frequency, p_year default null)`** — neu. Ändert
   `cards.frequency` und misst die Sparraten-Wirkung wie `delete_card`. Führt den
   Constraint `once_is_single_month` mit: Wechsel zu `ONCE` setzt
   `last_active_month = first_active_month`, Wechsel davon weg räumt es ab.
   Rückgabe zusätzlich `unchanged` — „nichts gewählt" ist nicht dasselbe wie „gewählt,
   aber ohne Wirkung".

**Versions-Bump Schema-Doku:** v3.11.0 → **v3.12.0** (Minor: neue Funktion, geändertes
Verhalten einer bestehenden — keine aufgehobene Invariante).

---

## Patch 8 · CLAUDE.md — nur nach ausdrücklicher Freigabe

Vorschläge stehen im Review (`sprints/sprint_v2-26_review.md` §7) und werden **nicht**
ohne Zustimmung angewendet.
