# Befunde 17.08.2026 — die Kuratierung des Jahres 2026

> **Was das hier ist:** die Diagnose zu den Meldungen, die der Nutzer beim Kuratieren
> aller Monate 2026 gesammelt hat. Ist-Zustand, keine Umsetzung.
>
> **Alle Zahlen gegen die Produktiv-Datenbank gemessen**, rein lesend.
>
> **Die Meldungen waren nach Monaten sortiert. Sie zerfallen aber in weniger Ursachen,
> als es Meldungen gibt** — sechs von zehn Punkten haben zwei gemeinsame Wurzeln.

---

## 0. Die Verdichtung

| Meldung | Monate | Wurzel |
|---|---|---|
| „Karte lässt sich nicht löschen" (5×) | 01, 05 (2×), 06, 07, 08 | **U1** — der Löschriegel |
| „Betrag zählt, obwohl nichts bezahlt wurde" (2×) | 05 (Audible), 06 (Friseur) | **U2** — Plan ohne Zahlung |
| „Fahrradteile taucht immer wieder auf" (3×) | 06, 07, 08 | **U1 + U2** zusammen |
| Neue/korrigierte Karten (3×) | 01, 04 | **Datenpflege** |
| Monatsnamen überlagern sich | 06 | **U3** — Anzeigefehler |
| Drei Sachfragen | 01, 08 | **hier beantwortet** |

---

## 1. U1 — Der Löschriegel sperrt 78 von 82 Karten

**Gemessen:**

| | Anzahl |
|---|---|
| Karten, nicht gelöscht | **82** |
| davon gesperrt durch `HAS_PAST_PLAN` | **78** |
| davon gesperrt **und** ohne Zahlung und ohne Zustand | 3 |
| **löschbar** | **4** |

`HAS_PAST_PLAN` greift, sobald `first_active_month` vor dem laufenden Monat liegt. Der
Nutzer hat Januar bis Juli kuratiert — **also ist praktisch alles, was er angelegt hat,
unlöschbar.**

**Der Riegel ist nicht sinnlos.** `delete_card` ist ein Soft-Delete, und seit v2-20
(`KU-1`) filtern alle vier Rechenfunktionen `deleted_at IS NULL`. Eine gelöschte Karte
fällt damit aus den Sparraten **aller** Monate, in denen sie aktiv war — auch der
vergangenen. Der Riegel schützt die Snapshot-Integrität (§2.1).

**Bei einer irrtümlich angelegten Karte ist genau diese Änderung aber richtig.** Sie
korrigiert die Vergangenheit, statt sie zu verfälschen. Das ist der Kern der
Entscheidung unten.

> **Warum „nur Karten ohne Zahlung freigeben" nicht reicht:** Es wären **3** von 78.
> Die neun Fahrradteile-Karten tragen je eine Zahlung und blieben gesperrt.

### Die neun Karten namens „Fahrradteile"

| Typ | Frequenz | ab | bis | Zahlungen |
|---|---|---|---|---|
| FIXED_COST | ONCE | 2026-01 | 2026-01 | 1 |
| FIXED_COST | ONCE | 2026-02 | 2026-02 | 1 |
| FIXED_COST | ONCE | 2026-02 | 2026-02 | 1 |
| FIXED_COST | ONCE | 2026-03 | 2026-03 | 1 |
| FIXED_COST | ONCE | 2026-03 | 2026-03 | 1 |
| FIXED_COST | ONCE | 2026-03 | 2026-03 | 1 |
| FIXED_COST | ONCE | 2026-03 | 2026-03 | 1 |
| **FIXED_COST** | **MONTHLY** | **2026-03** | **— (kein Ende)** | 1 |
| INCOME | ONCE | 2026-03 | 2026-03 | 1 |

**Die achte Zeile ist die, die den Nutzer in 05, 06, 07 und 08 verfolgt.** Eine
monatliche Fixkosten-Karte ohne Ende, Plan **26,90 €** — sie zählt in **jedem** Monat ab
März, für immer, ohne dass je eine weitere Zahlung kommt.

Weitere Mehrfachnamen: `Fahrradzubehör` (2×, 07), `Geschenk Lukas` (2×, 06),
`Inspektion Auto - Aline` (2×, 05 — einmal FIXED_COST, einmal INCOME).

> **Das Muster dahinter ist eine Bedien-Beobachtung, kein Datenfehler:** Es sieht aus,
> als sei je Zahlung eine eigene Karte entstanden. Ob das ein Bedienweg-Problem ist
> (Drop auf leeren Slot legt zu leicht eine neue Karte an?) ist **nicht untersucht** und
> gehört nicht in diesen Befund — aber es ist die Frage, die sich beim Ansehen der
> Tabelle stellt.

### Die zwei kategorielosen Karten — beide blähen die Sparrate auf

| Name | Typ | ab | Plan | Zahlungen |
|---|---|---|---|---|
| Malin Besuch Erstattung Time Ride | INCOME | 2026-01 | **53,70 €** | **0** |
| Anteil Essen Aline Marburg | INCOME | 2026-04 | **15,00 €** | **0** |

Beide sind **Einnahmen ohne Zahlung**. Eine Einnahmen-Karte trägt ihren Plan positiv zur
Sparrate bei — Januar ist damit um **+53,70 €** und April um **+15,00 €** zu gut
ausgewiesen. **Der Nutzer hat nur die Januar-Karte gemeldet; die April-Karte ist
derselbe Fall und war ihm offenbar nicht aufgefallen.**

---

## 2. U2 — Der Plan zählt, auch wenn nichts bezahlt wurde

**Gemessen im August 2026**, Fixkosten-Karten ohne Zahlung in diesem Monat:

| Karte | Plan | zählt in die Sparrate |
|---|---|---|
| ANTHROPIC – CLAUDE Abo | 107,10 | **107,10** |
| Fitnessstudio | 104,00 | **104,00** |
| **Friseur** | 45,00 | **45,00** |
| **Fahrradteile** (die monatliche) | 26,90 | **26,90** |
| iCloud | 9,99 | **9,99** |
| **Audible** | 9,95 | **9,95** |

Das ist die Prioritätskette von `calculate_card_amount_for_month`:
**Realität → Anpassung → Plan.** Fehlt die Realität und fehlt die Anpassung, gewinnt der
Plan. Bei Miete und Fitnessstudio ist das richtig — das Geld geht ab. Bei Audible
(zeitweise pausiert), Friseur (nicht jeden Monat) und einer irrtümlich monatlichen Karte
ist es falsch.

**Audible und Friseur haben je 4 Zahlungen bei 8 aktiven Monaten** (ab Januar) — in vier
Monaten zählt also der Plan ohne Gegenstück.

**Ein Weg existiert bereits:** „Betrag anpassen auf 0 €, **nur diesen Monat**" schreibt
`card_monthly_states.adjusted_amount = 0`, und die Anpassung schlägt den Plan. Er ist
nur pro Monat einzeln zu gehen — bei Audible und Friseur seit Januar rund ein Dutzend
Mal.

---

## 3. U3 — Die Monatsnamen überlagern sich

Im Screenshot (06/26) stehen **zwei linke Flanken-Beschriftungen übereinander**:
„April 2026" und „Mai 2026" ineinander, dazu „5 Fragmente offen" und „8 Fragmente
offen".

**Was geprüft ist:** `.monthLabel` (der **aktive** Monat rechts) trägt
`animation: monthFade 0.22s` und ein `key={targetMonth}` — der wird bei jedem
Monatswechsel neu aufgebaut und blendet ein. Die Flanken (`.flankMonth`, `.flankSub`)
haben **weder Key noch Animation**; die Überlagerung sitzt aber genau dort.

**Was NICHT geprüft ist — und deshalb als Hypothese steht:** Zwei Textknoten an
derselben Stelle ist das typische Bild eines **Hydrations-Unterschieds** (Server und
Browser rendern verschiedene Beschriftungen, beide bleiben im DOM). `page.tsx` liest
`new Date()` für `activeMonth`; ein Server-/Browser-Unterschied dort wäre ein Kandidat.
**Zu diagnostizieren, nicht zu erraten** — es braucht einen Blick in die
Browser-Konsole beim Monatswechsel.

---

## 4. Datenpflege — was fehlt und was falsch ist

### Kreditkarte-Kosten — Karte fehlt

Sieben Zahlungen, **konstant −2,49 €**, jeweils um den 20.–22.:
01-22 · 02-20 · 03-20 · 04-22 · 05-22 · 06-22 · 07-22.
Beschreibung durchgängig `Entgelt Ausgabe einer Kre`. Die Juli-Zahlung hängt heute an
**„Privates Budget"**, die übrigen sechs sind unverknüpft.

→ FIXED_COST, MONTHLY, ICH, Plan **2,49 €**, ab **2026-01**, Fälligkeitstag **20**,
Kategorie **Abos & Mitgliedschaften**.

### Privathaftpflicht — Karte fehlt, und der Betrag ist nicht der genannte

**Es gibt keine Karte.** Die Zahlung liegt vor: **2026-04, −28,88 €**,
`Dominik Hecker und Aline Nünninghoff | Privathaftp…`.

> **Achtung, das sind zwei verschiedene Zahlen.** Der Nutzer nennt **53,25 €
> Gesamtkosten**; abgebucht wurden von seinem Konto **28,88 €**. Bei einer
> GEMEINSAM-Karte ist das kein Widerspruch, sondern genau die Systematik:
> `calculate_card_amount_for_month` wendet den Split-Anteil auf **Plan und Anpassung**
> an, **nicht** auf Zahlungssummen — die sind bereits der überwiesene Anteil (§6
> Stolperfalle 11).
>
> **Folge:** Plan = **53,25 €** (Haushalts-Gesamtbetrag). Im April 2026 zeigt die Karte
> mit verknüpfter Zahlung **28,88 €** (Realität gewinnt). In künftigen Aprilen ohne
> Zahlung zeigt sie **53,25 × 0,5721 = 30,46 €** (eigener Anteil am Plan).
> **28,88 als Plan einzutragen wäre falsch** — dann würde der Anteil ein zweites Mal
> abgezogen.

→ FIXED_COST, **ANNUAL**, **GEMEINSAM**, Plan **53,25 €**, ab **2026-04**,
Fälligkeitstag **1**.

### Die zwei AI-Abos

**Anthropic/Claude** — Karte `ANTHROPIC - CLAUDE Abo` existiert, eine Juli-Zahlung hängt
dran.

| Monat | Summe | Einzelzahlungen |
|---|---|---|
| 04/26 | **66,94 €** | 21,42 (16.04.) + 45,52 (27.04.) |
| 05/26 | **111,61 €** | 21,42 (16.05.) + 90,19 (23.05.) |
| 06/26 | **107,10 €** | 107,10 (23.06.) |
| 07/26 | **107,10 €** | 107,10 (23.07.) — verknüpft |

**Google One / Gemini** — **Karte fehlt.** Läuft schon **seit Februar**, nicht erst ab
April: 3,99 € (02, 03), ab April **9,99 €** (04, 05, 06). Eine Rückbuchung **+3,73 €**
am 30.03. Drei dieser Zahlungen hängen heute an **„Privates Budget"** und müssten
umziehen.

**Empfehlung zur Bauart: beide als FIXED_COST, nicht als BUDGET.** Bei Fixkosten gewinnt
die Realität — sobald die Zahlung verknüpft ist, zählt der **echte** Betrag statt des
Plans; der Plan ist nur die Schätzung für kommende Monate. Eine Budget-Karte zeigt
dagegen weiter den Plan, solange die Ausgabe darunter liegt, und würde einen günstigeren
Monat verschlucken (§4.3, LL-12).

→ Claude: FIXED_COST, MONTHLY, ICH, Plan **107,10 €**, Fälligkeitstag **23**.
→ Google One: FIXED_COST, MONTHLY, ICH, Plan **9,99 €**, ab **2026-02** (Plan dort 3,99,
  ab April auf 9,99 anheben — „dauerhaft ab diesem Monat"), Fälligkeitstag **26**.

### Vier Zahlungen, die keine Kosten sind

| Datum | Betrag | Beschreibung |
|---|---|---|
| 2026-07-02 | −107,10 | `ECHTZEIT EURO-UEBERW. | Anthropic` |
| 2026-07-02 | +107,10 | `DOMINIK HECKER | Anthropic` |
| 2026-07-27 | −107,10 | `ECHTZEIT EURO-UEBERW. | Anthropic Claude Su` |
| 2026-07-28 | +107,10 | `DOMINIK HECKER | Anthropic Claude Sub` |

Zwei Paare, die sich exakt aufheben — Überweisung und Rückbuchung. **Kandidaten für die
Umschichtungs-Markierung**, damit sie nicht in der Rohmasse liegen bleiben. Sie zählen
heute nicht in die Sparrate (unverknüpft), stören aber die Arbeitsfläche.

### Nebenbei aufgefallen, NICHT gemeldet und NICHT im Umfang

Drei monatliche Versicherungs-Zahlungen ohne erkennbare eigene Karte:
`Rechtsschutz` −15,45 € · `Alte Leipziger` −100,68 € · `Nürnberger` −116,70 €
(letztere passt zu `Private Altersvorsorge - Nürnberger`). **Ob sie verknüpft sind, ist
nicht geprüft** — nur als Hinweis für die nächste Kuratierungsrunde vermerkt.

---

## 5. Die drei Sachfragen, beantwortet

**① Warum sind die Karten nicht löschbar?** → Abschnitt 1. `HAS_PAST_PLAN`.

**② Sind „Noch fällig" und „Budget frei" schon von der Sparrate abgezogen?** → **Ja,
vollständig.** Belegt in der Tabelle in Abschnitt 2: Eine Fixkosten-Karte ohne Zahlung
steuert ihren Plan bei. Dasselbe für Budget-Karten, solange die Ausgaben unter dem Plan
liegen. Beide Zahlen sind **keine zusätzliche Belastung**, sondern eine Aufschlüsselung:
welcher Teil des schon abgezogenen Betrags das Konto noch nicht verlassen hat. Eine
Kassensicht, keine Sparraten-Korrektur.

**③ Was passiert bei versehentlicher Umschichtungs-Markierung?** → Wenig, und es ist
umkehrbar. Aus `set_fragment_asset_reallocation` gelesen:

- Die Markierung sitzt an der **Zahlung**, nicht an der Karte.
- Hängt die Zahlung schon an einer Karte, **wirft die Datenbank `23514`** („Zuordnung
  zuerst lösen"). Einer Karte kann also nicht versehentlich die Zahlung entzogen werden.
- Gesetzt: `transfer_type = 'ASSET_REALLOCATION'`, die Zahlung zählt nirgends mehr,
  rendert gedimmt mit „TRANSFER"-Kennzeichen und ist nicht mehr auf eine Karte ziehbar.
- **Rücknahme über denselben Knopf** (`p_set = false`), ausschließlich aus diesem
  Zustand.
- Verloren gehen nur `suggested_card_id` und `confidence` — die rechnet
  `refresh_fragment_suggestions` (v2-21) wieder nach.

---

## 6. Zwei Entscheidungen, am 17.08.2026 vom Nutzer getroffen

**① Löschen erlauben, mit angezeigter Folge.** Vor dem Löschen zeigt die App, welche
Monate sich um welchen Betrag ändern — dieselbe Haltung wie die Konsequenz-Anzeige beim
Partner-Split (§10). Der Nutzer entscheidet informiert, statt gesperrt zu sein.
Verworfen: „nur Karten ohne Zahlung" (wären 3 von 78) und „statt Löschen rückwirkend
beenden" (die Karteileiche bliebe sichtbar — bei neun gleichnamigen Karten keine Hilfe).

**② Ein-Klick-Abkürzung „Diesen Monat nicht angefallen".** Sie schreibt intern **genau
dasselbe** wie der heutige Weg über „Betrag anpassen auf 0 €, nur diesen Monat". Damit
ändert sich an `calculate_card_amount_for_month` **nichts** — kein Anker-Risiko, nur ein
kürzerer Weg zu etwas, das es schon gibt.
Verworfen: eine Karten-Eigenschaft „fällt unregelmäßig an". Sie wäre bequemer (einmal
statt monatlich), greift aber in die Rechenfunktion ein, an der die Sparrate hängt —
**und sie macht die Vorschau kaputt:** Künftige Monate zeigten für den Friseur dann 0 €,
obwohl dafür geplant werden soll.

---

## 7. Was noch offen ist

- **Die Gestalt der Folgen-Anzeige** ist nicht entschieden — welche Monate, welche
  Beträge, welcher Wortlaut. §10 hat mit der Konsequenz-Anzeige ein Muster, aber keine
  Spezifikation für diesen Fall. Gehört vor das Bauen (`design-direktor`).
- **Wortlaut und Ort des neuen Menüpunkts** ebenso.
- **Die Ursache der Überlagerung** (Abschnitt 3) ist Hypothese, nicht Befund.
- **Ob der Bedienweg zu leicht neue Karten anlegt** (neun „Fahrradteile") ist nicht
  untersucht.
