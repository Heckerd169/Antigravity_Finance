# Sprint v2-25 — Doku-Patches

> **Verfahren nach §7 Regel 14 / LL-16:** Anker + Patch-Satz je Stelle, danach
> angewendet. Die beiden Bibeln werden nie direkt editiert.
>
> **Anlass:** Eine Spezifikation aus der Design-Runde vom 17.08.2026 hat sich beim
> Bauen als **nicht umsetzbar** erwiesen — nicht wegen Aufwand, sondern weil der Text
> physisch nicht in die Zeile passt. Die Entscheidung darüber ist in der Rolle
> `design-direktor` gefallen und im Record nachgetragen.

---

## Patch 1 · Design-Doku §7 — die Statuszeile ersetzt das Status-Label, nicht den Termin

**Datei:** `antigravity_finance_design_dokument.md`
**Abschnitt:** §7, Block „Diesen Monat nicht angefallen (neu 17.08.2026)"

### Anker (eindeutig, einmal in der Datei)

```
**Die Statuszeile zeigt dann `nicht angefallen`** am rechten Anschlag, **anstelle** des
Fälligkeitstags, im Ghost-Ton (`--text-ghost`). Ein Monat, in dem die Sache nicht
angefallen ist, hat keinen Termin, den man erwarten könnte — die Angabe wäre nicht nur
überflüssig, sondern irreführend. Ersetzen statt ergänzen heißt: **keine zusätzliche
Kartenhöhe, kein neues Token, keine neue Farbe.**
```

### Patch-Satz

```
**Die Statuszeile zeigt dann `nicht angefallen`** — im Ghost-Ton (`--text-ghost`),
**anstelle des Status-Labels**, und der Fälligkeitstag verschwindet mit. Ersetzen statt
ergänzen heißt: **keine zusätzliche Kartenhöhe, kein neues Token, keine neue Farbe.**

**Beide Enden der Zeile wären sonst eine Falschaussage.** Ein Monat, in dem die Sache
nicht angefallen ist, hat keinen Termin, den man erwarten könnte — und die Karte ist
auch nicht `Offen` oder `Erwartet`. Sie ist genau das, was dort steht.

> **Diese Stelle sagte bis zum Bau von v2-25 „am rechten Anschlag, anstelle des
> Fälligkeitstags". Gemessen passt der Text dort in KEINEM der vier Zustände.** Die
> Karte ist 136 px breit, die Statuszeile hat 110 px Inhalt:
>
> | Statuszeile | braucht | verfügbar |
> |---|---|---|
> | `OFFEN` + `nicht angefallen` | 117,8 px | 110 px |
> | `BEZAHLT` + `nicht angefallen` | 130,3 px | 110 px |
> | `ERWARTET` + `nicht angefallen` | 139,3 px | 110 px |
> | `FORECAST` + `nicht angefallen` | 138,3 px | 110 px |
> | *(`OFFEN` + `am 1.`, der heutige Stand)* | 71,0 px | passt |
> | **`nicht angefallen` allein, links** | **79,7 px** | **passt** |
>
> **Der Wortlaut hat Vorrang bekommen, nicht der Ort.** `entfällt` am rechten Anschlag
> hätte gepasst (74,6 px) und die Kette zum Menüpunkt `Diesen Monat nicht angefallen`
> zerrissen — dazu ist es Verwaltungssprache, die Entscheidung 2 bei `übersprungen`
> und `auf 0 €` schon einmal verworfen hat.
>
> **Kein `text-transform: uppercase`**, anders als beim Status-Label, das hier ersetzt
> wird: §12.3 schreibt den Text klein, der Ghost-Ton unterscheidet ihn ohnehin — und
> uppercase wäre 22 px breiter und liefe wieder eng.
>
> Nachtrag im Record: `V2/design_direktor_2026-08-17_loeschen_und_nicht-angefallen.md`.
```

---

## Patch 2 · Design-Doku §7 — Querverweis bei der Fälligkeitstag-Anzeige

**Abschnitt:** §7, Block „Fälligkeitstag-Anzeige (seit `LQ-1`, 06.08.2026)"

### Anker

```
**Rechts steht in drei Fällen nichts** — kein „—", kein Platzhalter:
1. **Budget-Karte** — `due_day` ist dort per Migration `NULL`; ein Budget ist eine Erlaubnis ohne Termin (Befund `L7`). Die Leerstelle **ist** die Aussage.
2. **Fixkosten-/Einnahmen-Karte ohne Buchungshistorie** — es gibt keinen ableitbaren Tag.
3. **Kein Wert gesetzt.**
```

### Patch-Satz

```
**Rechts steht in vier Fällen nichts** — kein „—", kein Platzhalter:
1. **Budget-Karte** — `due_day` ist dort per Migration `NULL`; ein Budget ist eine Erlaubnis ohne Termin (Befund `L7`). Die Leerstelle **ist** die Aussage.
2. **Fixkosten-/Einnahmen-Karte ohne Buchungshistorie** — es gibt keinen ableitbaren Tag.
3. **Kein Wert gesetzt.**
4. **Der Monat ist auf 0 angepasst** (`KJ-3`, v2-25). Dann steht links `nicht angefallen` statt des Zustands, und rechts bleibt die Zeile leer — ein Monat ohne Anfall hat keinen Termin. Siehe den Block „Diesen Monat nicht angefallen" unten.
```

---

## Patch 3 · Design-Doku §12.3 — die Copy-Zeile nennt den richtigen Ort

**Abschnitt:** §12.3 Karten

### Anker

```
| Statuszeile — Monat auf 0 angepasst | `nicht angefallen` *(ersetzt den Fälligkeitstag, Ghost-Ton)* |
```

### Patch-Satz

```
| Statuszeile — Monat auf 0 angepasst | `nicht angefallen` *(ersetzt das Status-Label; der Fälligkeitstag entfällt mit, Ghost-Ton, keine Großschreibung)* |
```

---

## Patch 4 · Design-Doku — Versions-Bump und Changelog

**Abschnitt:** Header + Changelog-Block

### Anker

```
**Version:** 3.9.0 (V2 · Design-Runde 17.08.2026 — Löschen und „nicht angefallen")
```

### Patch-Satz

```
**Version:** 3.9.1 (V2 · Sprint v2-25 — gebaut, mit einer gemessenen Korrektur an §7)
```

### Zweite Anker-Stelle — neuer Changelog-Block direkt über `> **Changelog v3.9.0`

```
> **Changelog v3.9.1 (17.08.2026, Sprint v2-25):** **Patch, keine neue Spezifikation.**
> Die drei Spezifikationen von v3.9.0 sind gebaut; eine davon hat sich beim Bauen als
> physisch nicht umsetzbar erwiesen und ist korrigiert.
>
> §7 · §12.3 — **`nicht angefallen` ersetzt das Status-Label, nicht den Fälligkeitstag.**
> v3.9.0 legte den Text an den rechten Anschlag; gemessen passt er dort in **keinem** der
> vier Zustände (117,8 bis 139,3 px bei 110 px Inhaltsbreite). Links allein sind es
> 79,7 px. Entschieden wurde für den **Wortlaut** und gegen den Ort — das kürzere
> `entfällt` hätte gepasst, aber die Kette zum Menüpunkt zerrissen. Der Fälligkeitstag
> verschwindet mit: Beide Enden der Zeile wären sonst eine Falschaussage.
>
> **Warum das ein Patch ist und kein Minor:** Die Aussage der Spezifikation ist
> unverändert — der Zustand wird sichtbar, im Ghost-Ton, ohne zusätzliche Kartenhöhe
> und ohne neues Token. Nur die Position innerhalb derselben Zeile ändert sich.
>
> **Was das für die nächste Gestaltungsrunde bedeutet:** Eine Copy-Entscheidung für die
> Karten-Statuszeile ist erst vollständig, wenn sie gegen die **136 px** gehalten wurde.
> Der Platz dort ist die eigentliche Randbedingung, und die 110 px Inhaltsbreite teilen
> sich zwei Texte. Gemessen wird mit dem echten Font-Stack, nicht geschätzt.
>
> Record-Nachtrag: `V2/design_direktor_2026-08-17_loeschen_und_nicht-angefallen.md`.
```

### Dritte Anker-Stelle — Status-Zeile im Header

```
**Status:** Freigegeben — Schema-Doku v3.10.0; V2-Patches bis Sprint v2-24 eingespielt. Aus den Runden vom 06.08. und 07./08.08.2026 ist alles umgesetzt; `B4` ist seit v2-18 **abgelöst** (siehe §8). **Die drei Spezifikationen der Runde vom 17.08.2026 sind entschieden, aber noch nicht gebaut** (Sprint v2-25).
```

### Patch-Satz

```
**Status:** Freigegeben — Schema-Doku v3.11.0; V2-Patches bis Sprint v2-25 eingespielt. Aus den Runden vom 06.08. und 07./08.08.2026 ist alles umgesetzt; `B4` ist seit v2-18 **abgelöst** (siehe §8). **Die drei Spezifikationen der Runde vom 17.08.2026 sind gebaut** (Sprint v2-25) — eine davon mit einer gemessenen Korrektur an §7, siehe Changelog v3.9.1.
```

---

## Patch 5 · Schema-Doku — die drei geänderten Funktionen

**Datei:** `antigravity_finance_schema_summary.md`
**Abschnitt:** §4 RPC-Katalog · §6 Lösch-Logik

Anker und Patch-Sätze werden beim Anwenden gegen die Datei geprüft; die inhaltlichen
Änderungen sind:

1. **`card_delete_gate`** — `HAS_PAST_PLAN` ist **kein Sperrgrund mehr**. Es bleiben
   `HAS_LINKS` und `HAS_STATES`. Der Historien-Schutz wandert von einer Sperre zu einer
   **Anzeige**: Was die Löschung mit den Sparraten vergangener Monate macht, steht im
   Toast. **Gemessen am 17.08.2026:** mit dem Riegel waren **0 von 82** Karten löschbar,
   ohne ihn sind es **3** — die übrigen 79 tragen eine Zahlung und bleiben durch
   `HAS_LINKS` gesperrt.
2. **`delete_card`** — neue Signatur `(p_card_id uuid, p_year integer default null)`,
   die alte Ein-Parameter-Form ist **gedroppt** (sonst entstünde eine Überladung).
   Rückgabe zusätzlich `sparrate_effect { months, total, single_month }`. Sie **ruft**
   `calculate_sparrate_for_month` zweimal auf — vor und nach dem eigenen UPDATE, in
   derselben Transaktion — und baut sie **nicht** nach.
3. **`toggle_card_manually_paid`** — löscht `adjusted_amount`, wenn beim **Einschalten**
   des Häkchens dort eine **0** steht. Nur die 0; jede andere Anpassung bleibt.
   Grund: „ist bezahlt" gegen „fiel nicht an" ist ein Widerspruch, und er bewegt die
   Sparrate (Entscheidung 4 der Runde vom 17.08.2026).

**Versions-Bump Schema-Doku:** v3.10.0 → **v3.11.0** (Minor: geänderte Signatur, neue
Rückgabe, geändertes Verhalten — keine aufgehobene Invariante).

---

## Patch 6 · CLAUDE.md — nur nach ausdrücklicher Freigabe

Vorschläge stehen im Review (`sprints/sprint_v2-25_review.md` §7) und werden **nicht**
ohne Zustimmung angewendet.
