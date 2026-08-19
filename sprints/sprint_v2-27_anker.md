# Anker-Protokoll Sprint v2-27

> **Alle Werte am 19.08.2026 gegen Produktion (`nflkobdfdhncrtjncpmq`) gemessen.**
> Vorher-Messung, Trockenlauf und Nachher-Messung liegen in **derselben Sitzung** —
> das ist die Messregel aus CLAUDE.md §9, und sie ist der eigentliche Wächter.
> Es gibt seit dem 13.08.2026 **keine eingefrorene Sollwert-Tabelle**; verglichen wird
> gegen den eigenen Vorher-Wert, nicht gegen eine Datei.

---

## 1. Vorher — Ausgangslage

### Sparrate, alle 24 Monate

| Monat | Ist | Plan | | Monat | Ist | Plan |
|---|---|---|---|---|---|---|
| 2025-01 | 4.037,11 | 4.037,11 | | 2026-01 | 1.318,76 | 1.465,36 |
| 2025-02 | 4.037,11 | 4.037,11 | | 2026-02 | 1.667,90 | 1.651,10 |
| 2025-03 | 4.037,11 | 4.037,11 | | 2026-03 | 1.053,42 | 1.381,43 |
| 2025-04 | 4.037,11 | 4.037,11 | | 2026-04 | 1.753,14 | 1.729,58 |
| 2025-05 | 4.037,11 | 4.037,11 | | 2026-05 | −239,10 | −96,40 |
| 2025-06 | 4.037,11 | 4.037,11 | | 2026-06 | 3.509,75 | 3.799,90 |
| 2025-07 | 4.037,11 | 4.037,11 | | 2026-07 | −8,84 | 21,44 |
| 2025-08 | 4.037,11 | 4.037,11 | | 2026-08 | 629,34 | 404,46 |
| 2025-09 | 4.037,11 | 4.037,11 | | 2026-09 | 1.821,59 | 1.821,59 |
| 2025-10 | 4.037,11 | 4.037,11 | | 2026-10 | 1.790,08 | 1.790,08 |
| 2025-11 | 4.037,11 | 4.037,11 | | 2026-11 | 1.821,59 | 1.821,59 |
| 2025-12 | 4.037,11 | 4.037,11 | | 2026-12 | 1.821,59 | 1.821,59 |
| **2025 Summe** | **48.445,32** | | | | | |

**2025 ist in allen zwölf Monaten identisch — Ist = Plan = das volle Netto.** Es sind
dort keine Kosten modelliert; keine der 85 Karten reicht zurück.

### Invarianten vorher

| Anker | Ergebnis |
|---|---|
| **1** — Σ Ordner-Spalte == `calculate_sparrate_for_month` | **24/24 exakt** |
| **2** — Σ delta == Ist − Plan (B2) | **24/24 exakt, 0 Abweichungen** |

### Prüfsummen `md5(pg_get_functiondef(...))` vorher

| Funktion | Prüfsumme |
|---|---|
| `calculate_card_amount_for_month` | `4af07d327f17363e2452b815403e5c89` |
| `calculate_sparrate_for_month` | `68b4954451deb829a5e61d65b1946eaf` |
| `calculate_planned_sparrate_for_month` | `cb2b43af5cc71fd8d1556cefe2ecc51e` |
| `get_effective_plan_for_month` | `b93f894c88b463a5ce76674524641890` |
| `get_category_amounts_for_month` | `e6e0361bcf30a5d56dcaf6b83a32fe97` |
| `get_year_deviation_drivers` | `bfd1111ec392ea446112b234f85efc2c` |
| `get_cards_for_month` | `6394926aff4411f09d569a4f08f4f115` |
| `get_sparrate_series` | `2fa1dfcbad77c5a679c2d902f47691b8` |
| `is_card_active_in_month` | `b57e8a9871caa8d583627d5f9c7eb0b2` |

> **Diese neun Zeilen sind selbst ein Prüfanker.** Der Sprint bewegt Zahlen durch
> **Daten**, nicht durch Logik. Weicht auch nur eine Prüfsumme ab, ist etwas passiert,
> das nicht passieren sollte.

### Fälligkeitsmonate 2026 vorher (für S7)

| Karte | Frequenz | aktiv 2026 |
|---|---|---|
| ADAC Mitgliedsbeitrag | ANNUAL | 07 |
| Aline Geburtstag | ANNUAL | 07 |
| Mitgliedschaftsbeitrag BuMs-NDQ | ANNUAL | 04 |
| Privathaftpflicht | ANNUAL | 04 |
| Reisekrankenversicherung – DKV | ANNUAL | 05 |
| Rundfunkbeitrag | QUARTERLY | 01, 04, 07, 10 |

---

## 2. Trockenlauf — RAISE-Rollback auf Produktion (LL-18)

**Warum auf Produktion und nicht auf der Übungs-Datenbank:** Briefing §7. Kurz: Der
Sprint ändert keine Rechenfunktion, und der synthetische Bestand der Übungs-Datenbank
hat weder 2025-Zahlungen noch eine GEMEINSAM-Karte mit Faktor-Wechsel — also genau den
gefährlichsten Fall nicht. Der Rollback-Trockenlauf prüft die **echten** Daten und
hinterlässt nichts.

**Zwei Läufe, und der erste hat einen Fehler gefunden.**

### Lauf 1 — fand Falle ④ im eigenen Prüfcode

Der Faktor wurde pauschal am Januar genommen. Die Privathaftpflicht beginnt aber im
April: **50,49 € statt 52,47 €** — 3,8 % daneben, und keine Zahl sah falsch aus.
Das ist die Split-Falle in Miniatur, im Code, der sie prüfen sollte.

Korrektur: `get_split_factor(v_user, r.start_m)` — der Faktor des **Startmonats der
Zeile**, nicht des Jahresanfangs.

### Lauf 2 — vollständig grün

| Prüfung | Ergebnis |
|---|---|
| Karten zurückdatiert | **22** |
| Plan-Zeilen geschrieben | **27** (fünf GEMEINSAM-Karten mit zweiter April-Zeile) |
| `cards_assert_initial_plan` (`SET CONSTRAINTS ALL IMMEDIATE`) | **erfüllt** |
| Rhythmus-Wächter | **kein Bruch** |
| Anker 1 über 24 Monate | **0 Brüche** |
| 2026, alle zwölf Monate, Ist und Plan | **identisch zu §1** |
| 2025 Jahressumme | **22.461,00 €** |

### Fälligkeitsmonate 2026 nach dem Trockenlauf (S7)

| Karte | aktiv 2026 | |
|---|---|---|
| ADAC Mitgliedsbeitrag | 07 | unverändert (nicht zurückdatiert) |
| Aline Geburtstag | 07 | unverändert |
| Mitgliedschaftsbeitrag BuMs-NDQ | 04 | unverändert |
| **Privathaftpflicht** | **04** | **zurückdatiert, Monat gehalten** |
| **Reisekrankenversicherung – DKV** | **05** | **zurückdatiert, Monat gehalten** |
| **Rundfunkbeitrag** | **01, 04, 07, 10** | **zurückdatiert, alle vier gehalten** |

> **Das ist der Beleg für Falle ③.** Ohne den Wächter wäre der ADAC auf 2025-10
> gewandert und hätte seinen 2026-Monat von Juli auf Oktober verschoben — zwei
> Monatssparraten vertauscht, ohne dass eine einzige Zahl falsch aussieht.

---

## 3. Erwartung für die Nachher-Messung

**Diese Werte stehen VOR dem Eingriff fest** (§7 Regel 21).

### 2025 — soll sich bewegen

| Monat | erwartet | | Monat | erwartet |
|---|---|---|---|---|
| Januar | 1.849,12 | | Juli | 1.849,12 |
| Februar | 1.890,50 | | August | 1.890,50 |
| März | 1.890,50 | | September | 1.890,50 |
| April | 1.829,39 | | Oktober | 1.859,07 |
| Mai | 1.870,65 | | November | 1.880,55 |
| Juni | 1.880,55 | | Dezember | 1.880,55 |
| | | | **Summe** | **22.461,00** |

Ist **und** Plan sind identisch — nach Phase 2 ist noch nichts verlinkt.

**Die Bewegung: −25.984,32 €** (48.445,32 → 22.461,00).

### 2026 — darf sich NICHT bewegen

Alle zwölf Monate, Ist und Plan, identisch zu §1. **Das ist der schärfste Wächter
dieses Sprints.**

### Warum die Monate unterschiedlich hoch sind

| Monat | Besonderheit |
|---|---|
| Januar, Juli, Oktober | Rundfunkbeitrag (quartalsweise, 31,43 € Anteil) |
| April | Rundfunkbeitrag **und** Privathaftpflicht (29,68 €) → niedrigster Monat |
| Mai | Reisekrankenversicherung DKV (9,90 €) |
| Januar, Mai, Juni, Juli, November, Dezember | Audible (9,95 €) |
| Februar, März, August, September | nur die Grundlast → höchste Monate |

---

## 4. Nachher — nach Anwendung auf Produktion

*(wird nach der Anwendung ausgefüllt)*
