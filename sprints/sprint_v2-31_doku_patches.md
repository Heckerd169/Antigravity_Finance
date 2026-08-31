# Doku-Patches v2-31 — „Verlauf" je Karte und je Ordner

**Sprint:** v2-31 (`M7` + `KAT-4`) · **Datum:** 31. August 2026
**Grundlage:** `V2/design_direktor_2026-08-31_verlauf.md`
**Verfahren:** LL-16 — Anker + Patch-Satz je Stelle, nie direkte Bearbeitung.

| Ziel | von | auf |
|---|---|---|
| `antigravity_finance_design_dokument.md` | 3.12.0 | **3.13.0** |
| `antigravity_finance_schema_summary.md` | 3.15.0 | **3.16.0** |

> **Beide Male ein Minor-Bump.** Design-Doku: ein neuer Abschnitt in §7, ein neuer
> Menüpunkt in §7 und §8, neue Copy in §12 — und §9 bekommt eine **Abgrenzung**, die
> eine bestehende Aussage präzisiert, ohne sie aufzuheben. Schema-Doku: zwei neue
> Funktionen im Katalog.

---

## D1 · Design-Doku §7 — Kontextmenü-Tabelle

**Anker** (§7, Abschnitt „Kontextmenü (⋯-Icon)"):

```
| Karten-Typ | Optionen |
|---|---|
| Fixkosten / Einnahmen | `Betrag anpassen` / `Fällig am …` / `Kategorie ändern …` / `Letzte Zahlung in Monat X` |
| Budget | `Betrag anpassen` / `Kategorie ändern …` / `Letzte Zahlung in Monat X` — **kein** `Fällig am …` |
| Karte nie genutzt (kein State, keine Fragmente) | zusätzlich `Karte löschen` (Hard-Delete) |
```

**Patch-Satz — ersetzt den Anker vollständig:**

```
| Karten-Typ | Optionen |
|---|---|
| Fixkosten / Einnahmen | `Verlauf …` / `Betrag anpassen` / `Fällig am …` / `Kategorie ändern …` / `Letzte Zahlung in Monat X` |
| Budget | `Verlauf …` / `Betrag anpassen` / `Kategorie ändern …` / `Letzte Zahlung in Monat X` — **kein** `Fällig am …` |
| Karte nie genutzt (kein State, keine Fragmente) | zusätzlich `Karte löschen` (Hard-Delete) |
| **Einmalige Karte** (`Frequenz = Einmalig`) | **kein** `Verlauf …` — siehe unten |

**Die Reihenfolge im Menü folgt der Wirkung, nicht der Entstehung** (v2-31): erst was
nur *ansieht* (`Verknüpfte Fragmente`, `Verlauf …`), dann was *ändert*, zuletzt was
*beendet oder löscht*. `Verlauf …` steht deshalb oben und nicht bei den Änderungen.
```

---

## D2 · Design-Doku §7 — neuer Abschnitt „Verlauf …"

**Anker** — die Zeile unmittelbar **vor** dem Absatz `**„Kategorie ändern …" (neu mit`:

```
| Wirkung | rückwirkend in **allen** Monaten (§2.1 unberührt, siehe unten) |
```

**Patch-Satz — wird NACH dem Block „Kategorie ändern …" eingefügt**, unmittelbar vor
`**„Betrag anpassen":** Overlay mit zwei Optionen`:

```markdown
**„Verlauf …" (neu mit `M7`, 31.08.2026):** 24 Monate Ist gegen Plan in einem
zentrierten Overlay — Vorjahr und angezeigtes Jahr.

| Eigenschaft | Regel |
|---|---|
| Erscheint auf | allen Karten **außer** `Einmalig` — auch auf Ghost-/Forecast-Karten |
| Fläche | zentriertes Overlay per Portal, 680 px, Anatomie wie das Welle-Popup (§9) |
| Held | der **Kartenname**, keine Zahl |
| Unterzeile | `[Typ] · [Frequenz] · eigene Karte` bzw. `· gemeinsame Karte` |
| Ist-Linie | Teal, 2 px — **endet am laufenden Monat** |
| Plan-Linie | Grau `rgba(255,255,255,.25)`, 1 px — läuft bis Dezember durch |
| X-Achse | Format `01/25`, **jeder dritte Monat** beschriftet; dünne Jahresgrenze |
| Y-Achse | zwei Marken: `0 €` und ein gerundetes Maximum |
| Fußzeile | Legende links, die beiden Jahressummen des Ist rechts |

**Die Ist-Linie endet am laufenden Monat, und die Grenze hängt am Kalender.** In
Zukunftsmonaten liefert `calculate_card_amount_for_month` den Plan zurück — gemessen
am 31.08.2026 sind dort **alle 22** aktiven Karten reine Plan-Kopien, in den 20
vergangenen Monaten **keine einzige**. Weiterzuzeichnen hieße, die Plan-Linie ein
zweites Mal zu zeichnen und das Ergebnis „Ist" zu nennen. Das ist dieselbe Regel, die
§9 für die Welle festlegt: Teal bis einschließlich dem laufenden Monat, Grau ab dem
ersten Zukunftsmonat, **unabhängig vom Header-aktiven Monat**.

**Eine gestrichelte Marke mit dem Wort `heute` steht an der Grenze.** Sie ist kein
Schmuck: Ohne sie ist eine Linie, die im August aufhört, von fehlenden Daten nicht zu
unterscheiden. Fiele sie einer späteren Straffung zum Opfer, entstünde genau die Frage,
die sie beantwortet — dasselbe Argument wie bei der Unterzeile `gilt für alle Monate`
oben.

**Monate, in denen die Karte nicht aktiv ist, brechen die Linie — sie fallen nicht auf
null.** „Nicht fällig" und „null Euro ausgegeben" sind verschiedene Aussagen (§7 Regel
17). Die Unterscheidung liegt in der Datenbank: Die Serien-Funktionen liefern dort
`null`, nicht `0`. Ein Wert ohne aktive Nachbarn wird als **Punkt** gezeichnet — ohne
das wäre eine jährliche Karte unsichtbar (`ADAC Mitgliedschaft`: 2 von 24 Monaten).
Eine Linie **zwischen** zwei so weit entfernten Punkten behauptete eine Entwicklung,
die es nicht gibt.

**Auf gemeinsamen Karten zeigt die Plan-Linie den eigenen Anteil**, nicht den
Haushaltsbetrag. Roh gezeichnet stünden zwei Größen mit verschiedener Basis
nebeneinander — bei der Miete 1.089,26 € gegen 1.904,00 €, also **43 % Abstand in
jedem einzelnen Monat, und keiner davon eine Abweichung**. Auf gemeinsame Basis
gebracht sinkt der größte Abstand auf 41,36 €, und sichtbar wird, was wirklich
abweicht. Das ist dieselbe Entscheidung wie beim Kartenbetrag (Record 05.08.2026), eine
Ebene weiter.

> ⚠️ **Der Split-Anteil wird genau einmal angewandt, und nur auf den Plan.** Der
> Ist-Wert ist bereits der überwiesene Anteil (§4.5).

**Der Haushaltsbetrag steht NICHT in der Unterzeile** — anders als auf der Karte, wo
`von 1.904,00 €` unter dem Betrag steht. Grund: Die Karte zeigt einen Monat, der
Verlauf zeigt 24, und die Miete hat darin **drei** verschiedene Haushaltsbeträge
(1.820 / 1.861 / 1.904 €). Eine feste Zahl wäre in 23 von 24 Monaten die falsche.

**Einmalige Karten bekommen den Menüpunkt nicht.** Sie existieren per Constraint in
genau einem Monat; ihr „Verlauf" wäre ein einzelner Punkt. Ein Menüpunkt, der nichts
zeigt, ist ein Versprechen ins Leere — dieselbe Logik, mit der `Fällig am …` auf
Budget-Karten fehlt. **Das betrifft die Mehrheit:** 142 von 178 Karten sind einmalig,
nur 36 haben überhaupt einen Rhythmus (Stand 31.08.2026).

**Auf Ghost-/Forecast-Karten erscheint er** — anders als `Betrag anpassen` und
`Fällig am …`, und aus demselben Grund wie `Kategorie ändern …`: Der Verlauf ist eine
Eigenschaft der Karte über die Zeit, kein Monats-Zustand.

**Was der Verlauf NICHT hat** (v2-31, bewusst): keinen Hover-Tooltip, keinen
Monatsklick, keinen Zeitraum-Wähler. Werte liest man an der Y-Achse ab. Jedes davon
wäre eine eigene Entscheidung.
```

---

## D3 · Design-Doku §8 — `Verlauf …` im Ordner-Menü

**Anker** (§8, Abschnitt „Löschen — und was es NICHT gibt"):

```
`Kategorie löschen` im ⋯-Menü der Kachel entfernt **nur den Ordner**; die enthaltenen
Karten werden **kategorielos**, nicht gelöscht.
```

**Patch-Satz — wird DAVOR eingefügt:**

```markdown
**Das ⋯-Menü der Ordner-Kachel trägt seit `KAT-4` (31.08.2026) `Verlauf …`** — an
erster Stelle, vor `Kategorie umbenennen …` und `Kategorie löschen`. Es ist **dieselbe
Fläche** wie auf der Karte (§7), nur eine Ebene höher: dieselbe Anatomie, dieselben
zwei Linien, dieselben Regeln für Zukunft und Lücken. Befund `U5` hatte am 04.08.2026
festgestellt, dass Karten- und Kategorie-Verlauf dieselbe Fläche mit zwei Ebenen sind;
getrennt zu bauen hieße, sie zweimal anzufassen.

| Eigenschaft | Regel |
|---|---|
| Held | der **Ordnername** |
| Unterzeile | `Ordner · [N] Posten · [±Betrag] im angezeigten Monat` |
| Beträge im Chart | als **Höhe**, nicht unter der Nulllinie |
| Vorzeichen | trägt die **Unterzeile**, nicht die Kurve |

**Warum ein Ausgaben-Ordner nicht unter die Nulllinie und nicht ins Rot gezeichnet
wird:** Rot ist in dieser App „offen / Defizit" (§3), nicht „Ausgabe" — eine
Fixkosten-Karte ist auch nicht rot, nur weil sie Geld kostet. Das Vorzeichen steht
dort, wo es der Ordner ohnehin trägt (Record `B5`: *„Der Ordner trägt ein Vorzeichen,
die Karte nicht"*).

**Ein Ordner hat keinen eigenen Plan — er ist die Summe seiner Karten.** Deshalb
springt seine Plan-Linie, wenn in einzelnen Monaten zusätzliche Posten darin liegen.
Das ist richtig und keine Unruhe, die geglättet gehört.

**`Einkommen` und `Ohne Kategorie` bekommen keinen Verlauf.** Beide haben ohnehin kein
⋯-Menü — sie sind Sammelbecken der Anzeige und keine Zeilen in `card_categories`. Für
`Ohne Kategorie` ist das auch inhaltlich richtig: Der Behälter ist ein **Zufluss, kein
Bestand** (Befund `D12`) — jede neu angelegte Karte landet dort, bis sie einsortiert
wird. Seine Kurve zeigte den Aufräumfortschritt statt des Ausgabeverhaltens.
```

---

## D4 · Design-Doku §9 — Abgrenzung zur kumulierten Sicht

> **Die wichtigste Patch-Stelle dieses Sprints.** Befund `U5` (Schwere SCHWER) hat
> darauf hingewiesen, dass die Exklusivitäts-Aussage in der **Funktions-Einleitung**
> von §9 steht und nicht in der Verbotsliste — und genau deshalb beim ersten Zuschnitt
> von `M7` übersehen wurde. Dieser Patch macht die Grenze **an der Verbotsliste**
> sichtbar, wo man sie sucht.

**Anker** (§9, Abschnitt „Was explizit NICHT"):

```
- Kein Toggle %-/kumulierte Ansicht; keine kumulierte Sicht außerhalb des Popups
```

**Patch-Satz — ersetzt die Anker-Zeile:**

```markdown
- Kein Toggle %-/kumulierte Ansicht; keine **kumulierte** Sicht außerhalb des Popups
  — ⚠️ **das Wort „kumuliert" trägt hier die ganze Aussage.** Der Verlauf je Karte und
  je Ordner (`M7`/`KAT-4`, §7 und §8) zeigt **je Monat den Wert dieses Monats** und ist
  damit ausdrücklich **zulässig**: Er hat die Darstellungsform der Welle, nicht die des
  Popups. **Verboten bleibt die Treppe** — eine Kurve, in der jeder Monat den Stand
  seit Januar trägt.
  **Wer eine Fläche außerhalb dieses Popups erweitert, prüft zuerst diese Zeile.** Eine
  Treppe im Karten-Verlauf („Ausgaben seit Januar") verletzt §9 an einer Stelle, an der
  es niemandem auffiele: Die Zahlen blieben richtig, es wäre nur die falsche Heimat.
```

---

## D5 · Design-Doku §12.4 — Copy Karten-Kontextmenü

**Anker:**

```
| Kontextmenü — Wiederholung | `Wiederholung ändern …` *(nicht auf Ghost-Karten)* |
```

**Patch-Satz — wird DANACH eingefügt:**

```
| Kontextmenü — Verlauf | `Verlauf …` *(nicht auf einmaligen Karten; ja auf Ghost-Karten)* |
| Verlauf — Kicker | `Verlauf` |
| Verlauf — Held | `[Kartenname]` bzw. `[Ordnername]` |
| Verlauf — Unterzeile Karte | `[Typ] · [Frequenz] · eigene Karte` / `· gemeinsame Karte` |
| Verlauf — Unterzeile Ordner | `Ordner · [N] Posten · [±Betrag] im angezeigten Monat` |
| Verlauf — Legende | `Ist` · `Plan` |
| Verlauf — Zeitmarke | `heute` |
| Verlauf — Fußzeile rechts | `[Jahr] [Betrag] € · [Jahr] [Betrag] €` |
| Verlauf — Ladezustand | `Verlauf wird geladen` |
| Verlauf — Fehlerfall | `Verlauf nicht verfügbar` |
| Verlauf — leerer Zeitraum | `Keine Daten für diesen Zeitraum` |
```

> **Kein Auslassungszeichen bei den drei Zustands-Texten.** `…` bedeutet in dieser
> Anwendung durchgängig „öffnet einen Dialog" (§12.3/§12.4) — im Menüpunkt `Verlauf …`
> ist es deshalb richtig, in einer Statuszeile wäre es falsch.

---

## D6 · Design-Doku §12 — Copy Ordner-Kontextmenü

**Anker:**

```
**Kontextmenü der Ordner-Kachel**

| Element | Text |
|---|---|
| Menüpunkt 1 | `Kategorie umbenennen …` |
| Menüpunkt 2 | `Kategorie löschen` |
```

**Patch-Satz — ersetzt den Anker vollständig:**

```
**Kontextmenü der Ordner-Kachel**

| Element | Text |
|---|---|
| Menüpunkt 1 | `Verlauf …` |
| Menüpunkt 2 | `Kategorie umbenennen …` |
| Menüpunkt 3 | `Kategorie löschen` |
```

---

## D7 · Design-Doku — Versions-Bump und Changelog

**Anker:**

```
**Version:** 3.12.0 (V2 · Sprint v2-29 — der Vorschlag wird sichtbar, wo kuratiert wird)
```

**Patch-Satz:**

```
**Version:** 3.13.0 (V2 · Sprint v2-31 — Karten und Ordner haben einen Verlauf)
```

**Zweite Stelle — Changelog.** Neuer Eintrag **vor** dem bisher obersten:

```markdown
> **Changelog v3.13.0 (31.08.2026, Sprint v2-31 · `M7` `KAT-4`):** Neuer Abschnitt in
> **§7** — `Verlauf …` im Karten-Kontextmenü: 24 Monate Ist gegen Plan, Ist teal (2 px)
> und Plan grau (1 px) in **exakt ihrer §9-Bedeutung**, kein neuer Token. Die Ist-Linie
> **endet am laufenden Monat** (in Zukunftsmonaten sind alle Werte reine Plan-Kopien,
> gemessen 22 von 22), eine `heute`-Marke trägt die Begründung; inaktive Monate brechen
> die Linie statt auf null zu fallen (§7 Regel 17); isolierte Werte werden als Punkt
> gezeichnet, sonst wäre eine jährliche Karte unsichtbar. Auf **gemeinsamen** Karten
> zeigt die Plan-Linie den **eigenen Anteil** — roh gezeichnet liefen die Linien
> dauerhaft 43 % auseinander, ohne dass das eine Abweichung wäre. **Nicht auf einmaligen
> Karten** (142 von 178), **ja auf Ghost-Karten**. **§8** trägt denselben Menüpunkt im
> ⋯-Menü der Ordner-Kachel — dieselbe Fläche, eine Ebene höher, wie Befund `U5` es
> vorhergesagt hatte; Beträge stehen dort als **Höhe**, das Vorzeichen trägt die
> Unterzeile. **§12.4 und §12** um die neue Copy ergänzt.
> **Minor-Bump und nicht Patch**, weil **§9 zusätzlich präzisiert** wird: Die
> Verbotszeile „keine kumulierte Sicht außerhalb des Popups" sagt jetzt ausdrücklich,
> dass das Wort **kumuliert** die ganze Aussage trägt — eine monatliche Darstellung
> außerhalb des Popups ist zulässig, eine Treppe nicht. Die Exklusivitäts-Aussage stand
> bis dahin nur in der Funktions-Einleitung von §9 und wurde beim ersten Zuschnitt von
> `M7` genau deshalb übersehen (Befund `U5`, Schwere SCHWER). **Aufgehoben wird nichts.**
> Beleg: `V2/design_direktor_2026-08-31_verlauf.md`.
```

---

## S1 · Schema-Doku §4 — neuer Abschnitt „Verlaufs-Reihen"

**Anker** (§4, die Zeile unmittelbar **vor** `### Beim Karten-Lebenszyklus (Sprint v2-05)`):

```
- **Sichtbarkeits-Grenze (bewusst, Konzept §2):** B2 sieht nur Karten-Realität. Unzugeordnete Rohmasse ist unsichtbar; die Qualität wächst mit der Kuratierung. E4 (Rohmasse-Pseudo-Treiber) bleibt offene DD-Frage und ist **nicht** umgesetzt.
```

**Patch-Satz — wird DANACH eingefügt:**

```markdown
### Beim Verlauf (Sprint v2-31, `M7` / `KAT-4`)

| Funktion | Wofür | Returns |
|---|---|---|
| `get_card_amount_series(p_card_id uuid, p_year integer)` | 24 Monate Ist und Plan **einer Karte** — `p_year-1` und `p_year`. `STABLE`, `SECURITY INVOKER`, `SET search_path TO 'public'`, **ohne** `p_user_id`: Sie löst eine **einzelne** Karte auf und aggregiert nicht über den Nutzer; die `user_id` kommt aus `cards`, RLS erledigt den Rest. Eine fremde oder unbekannte Karte ergibt `[]` — **kein Fehler**. `p_year` außerhalb 1900–2999 → `22023`. Rein lesend: ruft ausschließlich `is_card_active_in_month`, `calculate_card_amount_for_month`, `get_effective_plan_for_month` und `get_split_factor` auf | `jsonb` |
| `get_category_amount_series(p_category_id uuid, p_year integer)` | dieselbe Reihe **für einen Ordner**. Zusätzliches Feld `posten`. Gleiche Konventionen und gleiche Fehlerfälle | `jsonb` |

**Return-Form** — immer genau 24 Einträge, aufsteigend nach `month_index`:

```jsonc
[{ "month_index": 0, "month": "2025-01-01", "aktiv": true,
   "ist": 129.56, "plan": 240.00 }, …]
```

**⚠️ `ist` und `plan` sind `null`, wenn `aktiv = false`.** Das ist die Kernaussage
dieser beiden Funktionen und **kein** Nebeneffekt: `is_card_active_in_month` liefert
dort `false`, und beide Betragsfunktionen geben dann `0.00` zurück — aber „nicht
fällig" und „null Euro ausgegeben" sind verschiedene Aussagen. Die Unterscheidung
gehört **hierher** und nicht ins Frontend (§7 Regel 15 / LL-20); sonst entschiede die
Anzeige, was ein fehlender Wert bedeutet, und zeichnete eine jährliche Karte in elf
Monaten auf die Nulllinie. **Jeder Aufrufer muss `null` als Lücke behandeln.**

**⚠️ `plan` ist bei `GEMEINSAM` bereits auf den eigenen Anteil heruntergerechnet** —
anders als `effective_plan` in `get_cards_for_month`, das den **vollen
Haushaltsbetrag** liefert. Der Split wird **genau einmal** angewandt, und nur auf die
Plan-Seite; `ist` kommt aus `calculate_card_amount_for_month` und ist bereits der
überwiesene Anteil (§4.5). Ohne diese Umrechnung stünden zwei Größen mit verschiedener
Basis nebeneinander: bei der Miete 1.089,26 € gegen 1.904,00 €, also **43 % Abstand in
jedem Monat — und keiner davon eine Abweichung**.

**⚠️ `get_category_amount_series` HOLT den Ist-Wert aus
`get_category_amounts_for_month`, statt ihn nachzurechnen.** Jene Funktion legt den
Rundungs-Rest des Monats auf den **betragsgrößten** Ordner, damit Anker 1
(`Σ Ordner == Sparrate`) exakt gilt. Gemessen am 31.08.2026 über 24 Monate trägt in
den vier Zukunftsmonaten jeweils **ein** Ordner **0,01 €** Ausgleich — eine eigene
Summierung zeigte dort einen Cent weniger als die Kachel im Karussell daneben, **ohne
dass eine Zahl falsch aussähe** (LL-25 / LL-26 „Nachbauen"). Der Preis sind 24 innere
Aufrufe: gemessen **254 ms** gegen **21 ms** beim Karten-Verlauf.

**⚠️ Der PLAN trägt diesen Ausgleich NICHT — und das ist Absicht.** Ungerundet über
alle Karten summiert ergibt er exakt `calculate_planned_sparrate_for_month` (0,00 € in
24/24, gemessen); summiert man die **je Ordner gerundeten** Rückgabewerte, weicht das
Ergebnis in **12 von 24** Monaten um ±0,01 € ab. Das ist LL-25 — die Rundung innerhalb
der Gruppe ist sauber, der Cent geht **zwischen** den Gruppen verloren.

> **Die Frage ist nicht „wird gruppiert?", sondern „wird die Summe der Gruppen irgendwo
> angezeigt?"** Auf der Ist-Seite gibt es diesen Ort (die Ordner-Spalte im Karussell,
> Anker 1) — dort ist der Ausgleich Pflicht. Auf der Plan-Seite gibt es ihn nicht:
> `get_category_amounts_for_month` liefert `planned` für Karten-Ordner hart als `NULL`.
> Ein Ausgleich verschöbe dort den Plan **eines** Ordners um fremde Rundungsreste,
> damit eine Zahl stimmt, die niemand sieht — und der Verlauf zeigt genau **einen**
> Ordner. Wer das ändert, braucht zuerst den Ort, an dem die Summe sichtbar wird.

**Warum es diese Funktionen überhaupt gibt.** `get_year_deviation_drivers` schien sie
überflüssig zu machen — sie liefert je Monat `ist` und `plan` je Karte. Sie trägt aber
`WHERE round(delta_roh, 2) <> 0` und liefert deshalb **ausschließlich abweichende**
Karten: Netflix läuft zwölf Monate exakt auf Plan und erscheint in **keinem einzigen**;
für Sep–Dez 2026 liefert sie **gar nichts** (0 von 22 aktiven Karten). Zusätzlich trägt
das `delta` der Rang-1-Zeile seit v2-22 den Rundungs-Rest des ganzen Monats.

**Eine Netzrunde statt 36.** Ohne diese Funktionen kostete ein Verlauf 36 Anfragen
(drei Einzel-RPCs × 24 Monate). In der Datenbank kostet die ganze Reihe **21 ms**;
teuer ist ausschließlich der Weg — dasselbe Argument wie bei `get_sparrate_series`
(v2-24). Anker 3 zählt genau diese Runden.
```

---

## S2 · Schema-Doku — Versions-Bump und Status

**Anker:**

```
**Version:** 3.15.0
```

**Patch-Satz:**

```
**Version:** 3.16.0
```

**Zweite Stelle — Status-Zeile.** Anker:

```
+ Sprint v2-29 Händler-Gedächtnis)
```

**Patch-Satz:**

```
+ Sprint v2-29 Händler-Gedächtnis + Sprint v2-31 Verlaufs-Reihen)
```

---

## D8 · Design-Doku — die Schema-Doku-Version wird NICHT mehr genannt

> **Nachtrag, gefunden beim Anwenden von D1–D7.** Die Statuszeile der Design-Doku
> nannte *„Schema-Doku v3.14.0"*, während die Schema-Doku bei **v3.15.0** stand —
> **falsch schon vor diesem Sprint**, und durch S2 wäre sie noch weiter abgedriftet.
>
> **Das ist die Fehlerklasse, die CLAUDE.md §9 an sich selbst beschreibt:** *„Ein Wert,
> der an zwei Stellen steht, ist an einer davon irgendwann falsch — und man erfährt es
> nicht, weil beide Stellen für sich plausibel bleiben. Die einzige verlässliche
> Abhilfe ist, ihn nur einmal zu schreiben."* CLAUDE.md hat daraus am 24.08.2026 die
> Konsequenz gezogen und die Doku-Versionen aus §9 entfernt, nachdem dieselbe Zeile
> **zweimal** falsch war. Die Design-Doku führt die Doppelung bis heute fort.
>
> **Deshalb wird der Wert entfernt und nicht korrigiert.** Eine Korrektur hielte
> genau bis zum nächsten Schema-Bump.

**Anker:**

```
**Status:** Freigegeben — Schema-Doku v3.14.0; V2-Patches bis Sprint v2-29 eingespielt.
```

**Patch-Satz:**

```
**Status:** Freigegeben — V2-Patches bis Sprint v2-31 eingespielt. *(Die Version der Schema-Doku stand hier bis zum 31.08.2026 als Zahl und war zuletzt zwei Bumps veraltet. Sie ist entfernt statt korrigiert: Ein Wert, der an zwei Stellen steht, ist an einer davon irgendwann falsch — er steht jetzt nur noch im Header der Schema-Doku selbst. Dieselbe Konsequenz, die CLAUDE.md §9 am 24.08.2026 für sich gezogen hat.)*
```

---

## Prüfung vor der Anwendung

- [ ] Jeder Anker ist per Suche **eindeutig** — einzeln prüfen, nicht pauschal
- [ ] `D4` ersetzt **eine** Zeile der Verbotsliste, hebt nichts auf
- [ ] Beide Versions-Bumps sind **eigene** Patch-Stellen (D7, S2), keine Nebensache
- [ ] Nach der Anwendung: `pnpm test:visual` — `doku-vollstaendigkeit.spec.ts` und
      `claude-md-umfang.spec.ts` laufen mit

---

*Doku-Patches · Antigravity Finance · Sprint v2-31 · 31. August 2026*
