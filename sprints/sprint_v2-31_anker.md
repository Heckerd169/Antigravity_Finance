# Anker-Protokoll v2-31 — „Verlauf" je Karte und je Ordner

**Erwartung dieses Sprints: KEIN Zahlenwert bewegt sich.** Der Eingriff legt zwei neue,
**rein lesende** Funktionen an, die ausschließlich bestehende Funktionen aufrufen. Sie
können deshalb keine Zahl verändern — ein grüner Nachher-Wert ist hier das erwartete
Ergebnis und kein Beleg für Sorgfalt.

> Gemessen wird gegen den **eigenen Vorher-Wert dieser Sitzung**, nicht gegen eine
> Tabelle in einer Datei (CLAUDE.md §9, seit 13.08.2026). Der Nutzer kuratiert 2025
> laufend weiter; Abweichungen zwischen zwei Sitzungen sind der Normalfall.

---

## VORHER — gemessen 31.08.2026, Produktiv-Datenbank `nflkobdfdhncrtjncpmq`

### Sparrate, 24 Monate, Ist und Plan

| Monat | Ist | Plan | | Monat | Ist | Plan |
|---|---|---|---|---|---|---|
| 2025-01 | −987,21 | −762,61 | | 2026-01 | 1.318,76 | 1.497,91 |
| 2025-02 | 1.813,37 | 1.944,66 | | 2026-02 | 1.667,90 | 1.651,10 |
| 2025-03 | 3.527,21 | 3.547,33 | | 2026-03 | 1.053,42 | 1.381,43 |
| 2025-04 | −198,14 | −1.215,25 | | 2026-04 | 1.753,14 | 1.729,58 |
| 2025-05 | 87,55 | 1.227,20 | | 2026-05 | −239,10 | −96,40 |
| 2025-06 | 894,60 | 1.228,15 | | 2026-06 | 3.509,75 | 3.799,90 |
| 2025-07 | −272,20 | −28,32 | | 2026-07 | −8,84 | 21,44 |
| 2025-08 | 169,35 | 458,61 | | 2026-08 | 507,10 | 327,46 |
| 2025-09 | 682,50 | 1.031,12 | | 2026-09 | 1.621,60 | 1.621,60 |
| 2025-10 | 1.856,28 | 1.736,18 | | 2026-10 | 1.691,08 | 1.691,08 |
| 2025-11 | 2.925,87 | 3.125,81 | | 2026-11 | 1.745,66 | 1.745,66 |
| 2025-12 | 943,12 | 1.169,64 | | 2026-12 | 1.456,09 | 1.456,09 |

**Goldlinie 2025 (Σ Ist):** 11.442,30 € · **Σ Ist 2026:** 16.076,56 €

> **Die 2025-Werte haben sich seit dem 25.08.2026 erheblich bewegt** — dort stand die
> Goldlinie bei 21.708,77 €. Der Nutzer hat in der Zwischenzeit kuratiert; zugeordnete
> Zahlungen senken die Sparrate der betroffenen Monate. **Das ist kein Befund**, sondern
> genau der Grund, warum es seit dem 13.08.2026 keine eingefrorene Sollwert-Tabelle mehr
> gibt. Beide Invarianten sind dabei 24/24 exakt (unten).

### Anker 1 — Ordner-Spalte ergibt die Sparrate

`Σ get_category_amounts_for_month(...) − calculate_sparrate_for_month(...)`

**0,00 € in allen 24 Monaten.** Keine Verletzung.

### Anker 2 — B2-Invariante `Σ delta = Ist − Plan`

`get_year_deviation_drivers(jahr, 50)`, Summe über alle Treiber je Monat.

**0,00 € in allen 24 Monaten.** Keine Verletzung.

> `p_limit = 50` statt der Voreinstellung 3 — die Invariante gilt nur, wenn **alle**
> abweichenden Karten in der Antwort sind. Gemessen weichen höchstens 11 Karten je Monat
> ab (Januar 2025), 50 reicht also mit Abstand. Mit `p_limit = 3` wäre der Anker
> bedeutungslos, ohne dass es auffiele.

### Prüfsummen der neun berührten Funktionen

`md5(pg_get_functiondef(oid))` — **keine davon wird in v2-31 geändert.**

| Funktion | Prüfsumme |
|---|---|
| `calculate_card_amount_for_month` | `4af07d327f17363e2452b815403e5c89` |
| `calculate_planned_sparrate_for_month` | `cb2b43af5cc71fd8d1556cefe2ecc51e` |
| `calculate_sparrate_for_month` | `68b4954451deb829a5e61d65b1946eaf` |
| `get_category_amounts_for_month` | `e6e0361bcf30a5d56dcaf6b83a32fe97` |
| `get_effective_plan_for_month` | `b93f894c88b463a5ce76674524641890` |
| `get_net_monthly_for_month` | `f04593a61253ad4f54680f35b5ee6285` |
| `get_split_factor` | `3c6fc76ab1a1983936e995645a1814a7` |
| `get_year_deviation_drivers` | `bfd1111ec392ea446112b234f85efc2c` |
| `is_card_active_in_month` | `b57e8a9871caa8d583627d5f9c7eb0b2` |

> ⚠️ `pg_get_functiondef` schließt **Kommentare** ein (LL-32). Eine Prüfsumme ändert sich
> also auch dann, wenn nur ein Kommentar dazukommt. Bleibt sie gleich, ist die Funktion
> byte-identisch — das ist die Aussage, die hier gebraucht wird.

### Datenlage zum Zeitpunkt der Messung

| | Wert |
|---|---|
| Karten gesamt (nicht gelöscht) | **178** — 25 monatlich · 10 jährlich · 1 quartalsweise · 142 einmalig |
| davon mit `Verlauf …` im Menü | **36** (alle außer `ONCE`) |
| Karten mit `attribution = GEMEINSAM` | 6 |
| Vergangene Monate mit reiner Plan-Kopie | **0** von 20 (Jan 2025 – Aug 2026) |
| Zukunftsmonate mit reiner Plan-Kopie | **4** von 4 (Sep – Dez 2026) |

---

## Zwei neue Anker, spezifisch für diesen Sprint

Beide betreffen die **Ordner-Ebene** (`KAT-4`) und sind vor dem Bau als erfüllbar
nachgewiesen.

### Neu-Anker A — Serien-Ist je Ordner == Karussell-Wert

Der Verlauf eines Ordners muss in jedem Monat **exakt** den Wert zeigen, den die
Ordner-Kachel im Karussell trägt.

⚠️ **Das ist der heikle Teil des Sprints.** `get_category_amounts_for_month` legt den
Rundungs-Rest auf den **betragsgrößten** Ordner, damit Anker 1 exakt gilt. Eine
Serien-Funktion, die dieselben Ist-Werte ohne diesen Ausgleich summiert, weicht um
Cent-Beträge ab — und **keine Zahl sähe dabei falsch aus**. Deshalb ruft die neue
Funktion `get_category_amounts_for_month` auf, statt die Summierung nachzubauen
(LL-25 / LL-26).

**Prüfung nachher:** für mindestens drei Ordner in allen 24 Monaten, Differenz 0,00 €.

### Neu-Anker B — Σ Serien-Plan je Ordner == Plan-Sparrate

**Vor dem Bau gemessen, Ergebnis: 0,00 € in allen 24 Monaten.**

`Σ (Karten-Plan × Anteil) + Netto-Plan` gegen `calculate_planned_sparrate_for_month`.
Die Plan-Seite braucht damit **keinen** Rest-Ausgleich — anders als die Ist-Seite.

---

## NACHHER — gemessen 31.08.2026, unmittelbar nach der Migration, dieselbe Sitzung

### Sparrate, 24 Monate, Ist und Plan

**Alle 24 Zeilen byte-identisch zur Vorher-Messung.** Ist und Plan, beide Jahre.
Goldlinie 2025 unverändert 11.442,30 €, Σ Ist 2026 unverändert 16.076,56 €.

### Anker 1 — Ordner-Spalte ergibt die Sparrate

**0,00 € in allen 24 Monaten.** Keine Verletzung.

### Prüfsummen der neun Rechenfunktionen

**Alle neun identisch zur Vorher-Messung.** Keine bestehende Rechenfunktion wurde
berührt — die Migration legt ausschließlich zwei neue an.

### Neu-Anker A — Serien-Ist je Ordner == Karussell-Wert

Gemessen über **alle 11 Ordner** und **alle 24 Monate**:

| | |
|---|---|
| verglichene Zellen | **200** |
| Verletzungen | **0** |
| größte Abweichung | **0,0000 €** |
| Lücke in der Reihe, aber Kachel vorhanden | **0** |
| Wert in der Reihe, aber keine Kachel | **0** |

Die letzten beiden Zeilen sind der eigentliche Beleg: Die Reihe erkennt **exakt
dieselben** Monate als aktiv wie das Karussell.

### Funktionale Testreihe

| | Fall | Ergebnis |
|---|---|---|
| T1 | Netflix (monatlich, ICH) | 24 Einträge, 24 aktiv, max. Abstand Ist↔Plan **0,00 €** |
| T2 | ADAC Mitgliedschaft (jährlich) | 24 Einträge, **2 aktiv, 22 NULL** |
| T3 | Miete (monatlich, GEMEINSAM) | 24 aktiv, max. Abstand **41,36 €** — roh wären es ~815 € |
| T3b | Urlaub Frankreich (einmalig) | 1 aktiv, 23 NULL, Abstand 303,23 € (700,00 geplant → 396,77) |
| T4 | `p_year` = 1800 / NULL / 3000 | je **`22023`** |
| T5 | unbekannte Karte / unbekannter Ordner / `p_card_id` NULL | je **`[]`** |
| T6 | `aktiv = true`, aber `ist` NULL | **0 Fälle** |
| T7 | `aktiv = false`, aber Wert gesetzt | **0 Fälle** — LL-20 greift in der Datenbank |
| T8 | Zeitraum | `2025-01-01` … `2026-12-01`, 24 Einträge |

### Laufzeit

| | in der Datenbank |
|---|---|
| `get_card_amount_series` | **21 ms** |
| `get_category_amount_series` | **254 ms** |

Der Faktor 12 ist der Preis für Neu-Anker A: 24 interne Aufrufe von
`get_category_amounts_for_month`, die jedes Mal **alle** Ordner rechnen — nötig, weil
sich erst daraus ergibt, wer den Rundungs-Rest trägt. Die Schwelle im Briefing lag bei
800 ms; sie wird eingehalten.

---

## ⚠️ Neu-Anker B ist gerissen — und das ist ein Befund, keine Panne

**Vorher gemessen: 0,00 € in allen 24 Monaten. Nachher: ±0,01 € in 12 von 24.**

Ich habe den Anker vor dem Bau falsch formuliert, ohne es zu merken. Gemessen habe ich
damals:

```
round( Σ_ungerundet (Karten-Plan × Anteil) + Netto-Plan , 2)  ==  Plan-Sparrate
```

Die Funktion liefert aber **je Ordner gerundete** Werte. Summiert man die, ergibt sich:

| | Abweichung zur Plan-Sparrate |
|---|---|
| ungerundet über alle Karten summiert | **0,00 € in 24/24** |
| Summe der je Ordner gerundeten Werte | **±0,01 € in 12/24** |

**Das ist LL-25, Wort für Wort:** *„‚Ungerundet summieren, erst am Ende runden' ist
notwendig, aber NICHT hinreichend — es behebt die Rundung **innerhalb** einer Gruppe;
der Cent geht **zwischen** den Gruppen verloren."* Innerhalb eines Ordners rechnet die
Funktion sauber (`sum()` ungerundet, `round()` einmal am Ende). Die Abweichung entsteht
erst beim Addieren der Ordner.

### Warum das so bleibt

**Es gibt keine Anzeige, die Ordner-Pläne summiert.** `get_category_amounts_for_month`
liefert `planned` für Karten-Ordner hart als `NULL` — eine Plan-Spalte im Karussell
existiert nicht. Anker 1 erzwingt den Ausgleich auf der **Ist**-Seite, weil dort eine
**sichtbare** Summe stimmen muss; auf der Plan-Seite gibt es keine solche Summe.

Ein Ausgleich verschöbe den Plan **eines** Ordners um fremde Rundungsreste, damit eine
Zahl stimmt, die niemand sieht — und der Verlauf zeigt genau **einen** Ordner. Das wäre
keine Korrektur, sondern eine Verfälschung.

**Festgehalten, wo es zur Laufzeit sichtbar ist:** im `COMMENT ON FUNCTION` von
`get_category_amount_series` (§6 Stolperfalle 12 — ein Beleg nur im Migrations-Kommentar
ist zur Laufzeit nicht vorhanden), zusätzlich ausführlich in der Migrationsdatei.

**Wer das später ändert, braucht zuerst den Ort, an dem diese Summe sichtbar wird.**

---

## Fazit

**Kein Zahlenwert hat sich bewegt.** 24 Sparraten identisch, Anker 1 in 24/24 bei 0,00 €,
neun Prüfsummen unverändert. Das war das erwartete Ergebnis — die beiden neuen Funktionen
lesen ausschließlich und rufen bestehende Funktionen auf, statt zu rechnen.

Der einzige unerwartete Befund ist Neu-Anker B, und er betrifft nicht die Daten, sondern
meine Formulierung des Ankers. Er steht oben vollständig.
