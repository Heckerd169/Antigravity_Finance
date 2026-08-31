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

## NACHHER

*(wird nach P3 ausgefüllt — in derselben Sitzung wie die Vorher-Messung)*
