# Sprint v2-28 — Anker-Protokoll

> **Alle Messungen dieser Datei stammen aus DERSELBEN Sitzung** (24.08.2026), gegen
> Produktion `nflkobdfdhncrtjncpmq`, User `179cd2c1-bbc2-4fd0-954b-8735eb90f370`.
> Die Übungs-Datenbank-Probe entfällt nach Nutzer-Entscheidung — ihr Bestand ist
> synthetisch und kennt die gefährlichen Fälle nicht (so entschieden in v2-24 und
> v2-27). An ihre Stelle tritt der **RAISE-Rollback-Trockenlauf auf Produktion**.

---

## §1 · Vorher — gemessen 24.08.2026, vor jedem Eingriff

### Sparrate, alle 24 Monate

| Monat | Ist | Plan | | Monat | Ist | Plan |
|---|---|---|---|---|---|---|
| 2025-01 | 1.748,93 | 1.848,33 | | 2026-01 | 1.318,76 | 1.497,91 |
| 2025-02 | 1.776,51 | 1.866,42 | | 2026-02 | 1.667,90 | 1.651,10 |
| 2025-03 | 1.811,58 | 1.866,42 | | 2026-03 | 1.053,42 | 1.381,43 |
| 2025-04 | 1.850,46 | 1.849,54 | | 2026-04 | 1.753,14 | 1.729,58 |
| 2025-05 | 1.888,22 | 1.887,30 | | 2026-05 | −239,10 | −96,40 |
| 2025-06 | 1.898,12 | 1.897,20 | | 2026-06 | 3.509,75 | 3.799,90 |
| 2025-07 | 1.866,97 | 1.866,05 | | 2026-07 | −8,84 | 21,44 |
| 2025-08 | 1.908,07 | 1.907,15 | | 2026-08 | 629,34 | 404,46 |
| 2025-09 | 1.904,67 | 1.907,15 | | 2026-09 | 1.821,59 | 1.821,59 |
| 2025-10 | 1.873,52 | 1.876,00 | | 2026-10 | 1.790,08 | 1.790,08 |
| 2025-11 | 1.894,72 | 1.897,20 | | 2026-11 | 1.821,59 | 1.821,59 |
| 2025-12 | 1.894,55 | 1.897,20 | | 2026-12 | 1.821,59 | 1.821,59 |

**Jahressumme 2025 Ist: 22.316,32 €.**

> **Diese 24 Zeilen sind zeichengleich mit der Momentaufnahme vom 21.08. im Briefing.**
> In den drei Tagen dazwischen wurde nicht kuratiert. Das ist ein **Zufall der
> Nutzung**, kein Beleg für Stabilität — gemessen wurde trotzdem selbst, weil die
> Regel das verlangt und der umgekehrte Fall (v2-27 → Briefing: −251,48 €) genau
> deshalb existiert.

### Invarianten

| Anker | Ergebnis |
|---|---|
| **1** — Σ Ordner-Spalte == `calculate_sparrate_for_month` | **24/24 exakt, Abweichung 0,00 €** |
| **2** — Σ delta == Ist − Plan (B2) | **24/24 exakt, Abweichung 0,00 €** |

> Anker 2 braucht eine gesetzte Sitzung: `get_year_deviation_drivers` liest
> `auth.uid()` selbst und wirft sonst `28000` (§6 Stolperfalle 4). Und sie nimmt
> **ein Jahr, kein Monatsdatum** — Signatur `(p_year integer, p_limit integer
> DEFAULT 3)`, `p_limit` ist auf 1–50 begrenzt. Gemessen wurde mit **50**, damit die
> Summe wirklich alle Treiber enthält und nicht die Vorgabe 3 (LL-26).

### Prüfsummen `md5(pg_get_functiondef(...))`

| Funktion | Prüfsumme | trifft v2-27 |
|---|---|---|
| `calculate_card_amount_for_month` | `4af07d327f17363e2452b815403e5c89` | ✅ |
| `calculate_planned_sparrate_for_month` | `cb2b43af5cc71fd8d1556cefe2ecc51e` | ✅ |
| `calculate_sparrate_for_month` | `68b4954451deb829a5e61d65b1946eaf` | ✅ |
| `get_cards_for_month` | `6394926aff4411f09d569a4f08f4f115` | ✅ |
| `get_category_amounts_for_month` | `e6e0361bcf30a5d56dcaf6b83a32fe97` | ✅ |
| `get_effective_plan_for_month` | `b93f894c88b463a5ce76674524641890` | ✅ |
| `get_sparrate_series` | `2fa1dfcbad77c5a679c2d902f47691b8` | ✅ |
| `get_year_deviation_drivers` | `bfd1111ec392ea446112b234f85efc2c` | ✅ |
| `is_card_active_in_month` | `b57e8a9871caa8d583627d5f9c7eb0b2` | ✅ |

**Alle neun treffen ihren v2-27-Wert.** Dieser Sprint bewegt Zahlen ausschließlich
durch **Daten**; weicht auch nur eine Prüfsumme ab, ist etwas passiert, das nicht
passieren durfte.

---

## §2 · Der Ausgangsbefund, gegen die Daten belegt

Das Briefing behauptet vier Dinge. **Alle vier sind gemessen, keines geschätzt.**

### Die Karten heute

| Karte | `card_id` | Typ · Zuordnung · Rhythmus | ab | Plan-Zeitreihe heute |
|---|---|---|---|---|
| Handyvertrag | `30ac3fa7…` | FIXED_COST · ICH · MONTHLY | 2025-01 | `2025-01 = 33,07` · `2026-01 = 35,00` |
| Netflix | `1f89cdff…` | FIXED_COST · ICH · MONTHLY | 2025-01 | `2025-01 = 18,99` · `2026-01 = 13,99` |
| Spotify | `e5a9f85e…` | FIXED_COST · ICH · MONTHLY | 2025-01 | `2025-01 = 11,16` · `2026-01 = 12,99` |
| Friseur | `ba1544e6…` | FIXED_COST · ICH · MONTHLY | **2026-01** | `2026-01 = 45,00` |

> **Alle vier sind `ICH`.** Es ist also **kein** Split-Anteil im Spiel — die
> gemischte Klammer aus LL-23 kann hier nicht zuschlagen. Das ist geprüft, nicht
> vorausgesetzt.

### Die tatsächlichen Zahlungen 2025

**Netflix** — Preis**senkung** im November, belegt:

| Monat | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | **11** | **12** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| gezahlt | 19,99 | 19,99 | 19,99 | 19,99 | 19,99 | 19,99 | 19,99 | 19,99 | 19,99 | 19,99 | **13,99** | **13,99** |
| verlinkt | ✅ | — | — | — | — | — | — | — | — | — | — | — |

**18,99 € kommt in den Daten NICHT vor.** Rechnerisch:
(10 × 19,99 + 2 × 13,99) / 12 = 227,88 / 12 = **18,99 exakt** — der Mittelwert ist
sauber gebildet und trotzdem in **keinem** Monat richtig.

**Spotify** — Preis**erhöhung** im Dezember, belegt:

| Monat | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | **12** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| gezahlt | 10,99 | 10,99 | 10,99 | 10,99 | 10,99 | 10,99 | 10,99 | 10,99 | 10,99 | 10,99 | 10,99 | **12,99** |
| verlinkt | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |

(11 × 10,99 + 12,99) / 12 = 133,88 / 12 = 11,15666… → **auf 11,16 gerundet.**
Diese Rundung ist der Grund, warum die Plan-Jahressumme sich um **+0,04 €** bewegt
(133,92 gegen 133,88) — dazu unten mehr.

**Handyvertrag** — zwei Ausreißer, belegt:

| Monat | 01 | 02 | 03 | 04 | 05 | 06 | 07 | **08** | 09 | 10 | 11 | **12** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| gezahlt | 33,00 | 33,00 | 33,00 | 33,00 | 33,00 | 33,00 | 33,00 | **33,40** | 33,00 | 33,00 | 33,00 | **33,44** |
| verlinkt | — | — | — | — | — | — | — | — | — | — | — | — |

(10 × 33,00 + 33,40 + 33,44) / 12 = 396,84 / 12 = **33,07** exakt. Zehn von zwölf
Monaten waren 33,00.

**Friseur** — **keine einzige Zahlung vor 2026-01.** Die Karte trägt vier verlinkte
Zahlungen, alle 2026 (01, 02, 03, 05); der Salon `Zeil 57` taucht in der gesamten
Rohmasse erstmals am 05.01.2026 auf. Die Rückdatierung stellt also **Plan ohne
Realität** her — bewusst, siehe Folgepflicht im Briefing.

---

## §3 · Die erwartete Bewegung — VOR dem Eingriff festgeschrieben

**Die entscheidende Unterscheidung, die das Briefing nicht auflöst:** Bei
FIXED_COST gewinnt die Realität. Ein Monat mit **verlinkter** Zahlung ist gegen
Plan-Änderungen **immun** — sein Ist steht schon fest. Nur die **unverlinkten**
Monate folgen dem Plan.

Deshalb bewegen sich **Ist und Plan unterschiedlich**, und zwar genau dort, wo
verlinkt ist:

| Karte | verlinkte Monate 2025 | Ist bewegt sich in | Plan bewegt sich in |
|---|---|---|---|
| Handyvertrag | **keinem** | allen 12 | allen 12 |
| Netflix | nur 01 | 02–12 | allen 12 |
| Spotify | 01–11 | nur 12 | allen 12 |
| Friseur | keinem | allen 12 | allen 12 |

### Bewegung je Karte, übers Jahr 2025

| Karte | Ist | Plan | Herleitung |
|---|---|---|---|
| **Handyvertrag** | **+0,84** | **+0,84** | 12 × (33,07 − 33,00) |
| **Netflix** | **+1,00** | **0,00** | Ist: 9 × (−1,00) + 2 × (+5,00) — Januar immun · Plan: 10 × (−1,00) + 2 × (+5,00) |
| **Spotify** | **−1,83** | **+0,04** | Ist: nur Dezember (−1,83) — Jan–Nov immun · Plan: 11 × (+0,17) − 1,83 |
| **Friseur** | **−540,00** | **−540,00** | 12 × 45,00, keine Realität dagegen |
| **Summe** | **−539,99** | **−539,12** | |

> **Die Briefing-Zeile „Netflix und Spotify: Jahressumme 2025 unverändert" stimmt
> für den PLAN und nur für Netflix exakt.**
> Netflix Plan: 0,00 € — der Mittelwert war exakt.
> Spotify Plan: **+0,04 €** — der Mittelwert war gerundet.
> Auf der **Ist**-Seite stimmt sie für keine der beiden, weil die verlinkten Monate
> nicht mitgehen: Netflix **+1,00**, Spotify **−1,83**.
> Das ist **keine Abweichung vom Auftrag** — die Beträge sind unverändert die
> beauftragten. Es ist eine Präzisierung der Erwartung, damit der Nachher-Vergleich
> überhaupt trennscharf sein kann.

### Erwartete Bewegung je Monat

| Monat 2025 | Ist-Δ | Plan-Δ | | Monat 2025 | Ist-Δ | Plan-Δ |
|---|---|---|---|---|---|---|
| 01 | −44,93 | −45,76 | | 07 | −45,93 | −45,76 |
| 02 | −45,93 | −45,76 | | 08 | −45,93 | −45,76 |
| 03 | −45,93 | −45,76 | | 09 | −45,93 | −45,76 |
| 04 | −45,93 | −45,76 | | 10 | −45,93 | −45,76 |
| 05 | −45,93 | −45,76 | | 11 | −39,93 | −39,76 |
| 06 | −45,93 | −45,76 | | 12 | −41,76 | −41,76 |

### Erwartete Sparrate nachher

| Monat 2025 | Ist | Plan | | Monat 2025 | Ist | Plan |
|---|---|---|---|---|---|---|
| 01 | **1.704,00** | **1.802,57** | | 07 | **1.821,04** | **1.820,29** |
| 02 | **1.730,58** | **1.820,66** | | 08 | **1.862,14** | **1.861,39** |
| 03 | **1.765,65** | **1.820,66** | | 09 | **1.858,74** | **1.861,39** |
| 04 | **1.804,53** | **1.803,78** | | 10 | **1.827,59** | **1.830,24** |
| 05 | **1.842,29** | **1.841,54** | | 11 | **1.854,79** | **1.857,44** |
| 06 | **1.852,19** | **1.851,44** | | 12 | **1.852,79** | **1.855,44** |

**Jahressumme 2025 Ist erwartet: 21.776,33 €** (22.316,32 − 539,99).

### 2026 — die Zeilen, die sich NICHT bewegen dürfen

**Alle zwölf Monate, Ist und Plan: Bewegung 0,00 €.**

Das ist erzwungen, nicht gehofft — jede der drei bestehenden Karten trägt bereits
eine eigene Plan-Zeile zum `2026-01`, an der die Forward-Inheritance aus 2025
endet:

| Karte | Riegel |
|---|---|
| Handyvertrag | `2026-01 = 35,00` |
| Netflix | `2026-01 = 13,99` |
| Spotify | `2026-01 = 12,99` |
| Friseur | `2026-01 = 45,00`, bleibt unberührt |

> **Und der Friseur-Rhythmus verschiebt sich nicht.** Das ist die Falle aus v2-27
> (LL-34): Zurückdatieren zählt den Rhythmus ab `first_active_month` neu und
> verschiebt bei QUARTERLY/ANNUAL den Fälligkeitsmonat in **allen** Folgejahren.
> Hier greift sie nicht — `is_card_active_in_month` gibt für `MONTHLY`
> bedingungslos `true` zurück. **Im Funktionsrumpf nachgelesen, nicht angenommen.**

> **Bemerkenswert: Netflix und Spotify laufen auf ihre 2026-Werte zu.** Die neuen
> 2025-Zeilen (13,99 ab November · 12,99 ab Dezember) treffen exakt die Beträge, die
> ohnehin ab `2026-01` gelten. Die Preiswechsel waren also schon in der Datenbank —
> nur im falschen Jahr verbucht.

---

## §4 · Nachher — P1 angewendet, 24.08.2026

Migration `v2_28_p1_2025_plaene` auf Produktion, nach ausdrücklicher Einzelfreigabe.

### Sparrate, alle 24 Monate — gemessen gegen die Erwartung aus §3

| Monat 2025 | Ist | ✓ | Plan | ✓ | | Monat 2026 | Ist | Plan | Bewegung |
|---|---|---|---|---|---|---|---|---|---|
| 01 | 1.704,00 | ✅ | 1.802,57 | ✅ | | 01 | 1.318,76 | 1.497,91 | **0,00** |
| 02 | 1.730,58 | ✅ | 1.820,66 | ✅ | | 02 | 1.667,90 | 1.651,10 | **0,00** |
| 03 | 1.765,65 | ✅ | 1.820,66 | ✅ | | 03 | 1.053,42 | 1.381,43 | **0,00** |
| 04 | 1.804,53 | ✅ | 1.803,78 | ✅ | | 04 | 1.753,14 | 1.729,58 | **0,00** |
| 05 | 1.842,29 | ✅ | 1.841,54 | ✅ | | 05 | −239,10 | −96,40 | **0,00** |
| 06 | 1.852,19 | ✅ | 1.851,44 | ✅ | | 06 | 3.509,75 | 3.799,90 | **0,00** |
| 07 | 1.821,04 | ✅ | 1.820,29 | ✅ | | 07 | −8,84 | 21,44 | **0,00** |
| 08 | 1.862,14 | ✅ | 1.861,39 | ✅ | | 08 | 629,34 | 404,46 | **0,00** |
| 09 | 1.858,74 | ✅ | 1.861,39 | ✅ | | 09 | 1.821,59 | 1.821,59 | **0,00** |
| 10 | 1.827,59 | ✅ | 1.830,24 | ✅ | | 10 | 1.790,08 | 1.790,08 | **0,00** |
| 11 | 1.854,79 | ✅ | 1.857,44 | ✅ | | 11 | 1.821,59 | 1.821,59 | **0,00** |
| 12 | 1.852,79 | ✅ | 1.855,44 | ✅ | | 12 | 1.821,59 | 1.821,59 | **0,00** |

**Alle 24 Zeilen treffen die in §3 VORHER aufgeschriebene Erwartung — auf den Cent.**
Jahressumme 2025 Ist: **21.776,33 €**, erwartet waren 21.776,33 €.

### Die Plan-Zeitreihen danach

| Karte | ab | Plan-Zeitreihe |
|---|---|---|
| Friseur | **2025-01** | `2025-01 = 45,00` · `2026-01 = 45,00` |
| Handyvertrag | 2025-01 | `2025-01 = 33,00` · `2026-01 = 35,00` |
| Netflix | 2025-01 | `2025-01 = 19,99` · **`2025-11 = 13,99`** · `2026-01 = 13,99` |
| Spotify | 2025-01 | `2025-01 = 10,99` · **`2025-12 = 12,99`** · `2026-01 = 12,99` |

### Wächter nach P1

| Prüfung | Ergebnis |
|---|---|
| **Anker 1** — Ordner-Spalte == Sparrate | **24/24, max. Abweichung 0,00 €** ✅ |
| **Anker 2** — Σ delta == Ist − Plan (B2) | **24/24, max. Abweichung 0,00 €** ✅ |
| **Neun Prüfsummen** | **9 Treffer, 0 Abweichungen** ✅ |
| **2026** | in allen zwölf Monaten unbewegt, Ist und Plan ✅ |

> **Was dieser Abschnitt beweist und was nicht.** Er beweist, dass der Eingriff
> **genau** das bewegt hat, was vorher aufgeschrieben war — inklusive der Zeilen, die
> sich **nicht** bewegen durften. Das ist der eigentliche Beleg (Fähigkeit
> `db-eingriff`, Schritt 3: *„Die Zeilen, die sich NICHT bewegen dürfen, sind der
> eigentliche Beweis"*).
>
> Er beweist **nicht**, dass die Beträge fachlich richtig sind — das tut §2, gegen die
> tatsächlichen Zahlungen.

---
