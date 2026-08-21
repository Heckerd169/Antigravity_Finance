# Sprint v2-27 — „2025 wird vergleichbar"

> **Stand:** 19. August 2026 · **Pakete:** 6 (`DA-1`) und 5 (`ZO-3`)
> **Branch:** `sprint/v2-27-2025-vergleichbar` · **Datenbank:** ja, Schreibzugriff auf Produktion
>
> **Warum es diese Datei gibt:** Drei der vier Kriterien aus `sprint-start` §3 treffen zu —
> die Datenbank wird berührt, es sind mehr als drei Phasen, und es sind **fünf
> Entscheidungen** festzuhalten, die sonst nur im Chat stünden.

---

## 1. Ziel, Nicht-Ziel, Anker

**Ziel (ein Satz):** Das Jahr 2025 rechnet mit den Kosten, die es damals wirklich gab,
damit die Vorjahres-Goldlinie in der Welle etwas aussagt.

**Nicht-Ziel — ausdrücklich NICHT angefasst:**

- **Keine Rechenfunktion.** Die neun Prüfsummen bleiben byte-identisch; das ist selbst ein Anker.
- **Kein Frontend.** Dieser Sprint bewegt Zahlen durch **Daten**, nicht durch Code.
- **Keine Kuratierung 2026** (`DA-2`) — eigenes Paket.
- **Keine Einmal-Karten.** Die 55 `ONCE`-Karten bleiben, wo sie sind.
- **Kein ADAC** (Begründung §4), **kein CLAUDE.AI / Gemini / Friseur / Deutschlandticket**
  (2025 nachweislich null Zahlungen).
- **Keine neuen Karten.** `MOBILE SUICA APPLE V` (15 Zahlungen, 79,45 €) bleibt unmodelliert.

**Prüfanker — gemessen im Trockenlauf am 19.08.2026, nicht geschätzt:**

| | vorher | nachher |
|---|---|---|
| **2026, alle zwölf Monate, Ist und Plan** | siehe §2 | **identisch — kein Monat bewegt sich** |
| 2025 Jahressumme Ist | 48.445,32 € | **22.461,00 €** |
| Anker 1 (Σ Ordner == Sparrate) | 24/24 OK | **24/24 OK** |
| Anker 2 (Σ delta == Ist − Plan) | 24/24 exakt | 24/24 exakt |
| Prüfsummen der neun Rechenfunktionen | §2 | **byte-identisch** |

---

## 2. Ausgangslage — alles am 19.08.2026 gegen Produktion gemessen

**2025 steht in allen zwölf Monaten auf exakt 4.037,11 €**, Ist = Plan = Ordnersumme.
Das ist das volle Netto: null modellierte Kosten. **751 offene Zahlungen, keine einzige
verlinkt**, weil keine der Karten dorthin zurückreicht.

**2026 zum Vergleich (Vorher-Werte, Ist / Plan):**

| Monat | Ist | Plan | | Monat | Ist | Plan |
|---|---|---|---|---|---|---|
| 01 | 1.318,76 | 1.465,36 | | 07 | −8,84 | 21,44 |
| 02 | 1.667,90 | 1.651,10 | | 08 | 629,34 | 404,46 |
| 03 | 1.053,42 | 1.381,43 | | 09 | 1.821,59 | 1.821,59 |
| 04 | 1.753,14 | 1.729,58 | | 10 | 1.790,08 | 1.790,08 |
| 05 | −239,10 | −96,40 | | 11 | 1.821,59 | 1.821,59 |
| 06 | 3.509,75 | 3.799,90 | | 12 | 1.821,59 | 1.821,59 |

**Prüfsummen `md5(pg_get_functiondef(...))` vorher:**

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

**Split-Faktoren (aus `income_timeline` nachgerechnet):**
Jan–Mär 2025 **0,587863** · Apr–Dez 2025 **0,565636** · 2026 **0,572090**.

---

## 3. Die fünf Entscheidungen des Nutzers (19.08.2026)

| # | Frage | Entscheidung |
|---|---|---|
| **E1** | Welche Karten reichen zurück? | **Alles mit Beleg** — auch die vier, die der Auftrag als „gab es nicht" führte |
| **E2** | Welcher Plan-Betrag gilt 2025? | **Jahresschnitt, split-korrigiert** — zwei Plan-Zeilen bei GEMEINSAM (2025-01 / 2025-04) |
| **E3** | Budget-Karten mit zurück? | **Alle drei, heutige Pläne** (150 / 200 / 240 €) |
| **E4** | Übungs-Datenbank proben? | **Nein** — Trockenlauf auf Produktion statt Slot-Tausch (Begründung §7) |
| **E5** | Audible? | **Mitnehmen, Lücken markieren** — sechs Monate als „nicht angefallen" |

---

## 4. Der Befund, der den Auftrag korrigiert

Der Eröffnungsprompt nannte neun Karten, die es 2025 „nicht gab". **Vier davon haben in
allen zwölf Monaten Zahlungen** — dieselben Beschreibungs-Muster, die 2026 an genau
diesen Karten hängen:

| Karte | 2025 | Monate |
|---|---|---|
| Private Altersvorsorge – Nürnberger | −1.373,20 € | 12/12 |
| Fitnessstudio (Elements) | −1.248,00 € | 12/12 |
| Berufsunfähigkeit – Alte Leipziger | −1.146,11 € | 12/12 |
| Handyvertrag (congstar) | −396,84 € | 12/12 |
| **Summe** | **−4.164,15 €** | |

**Fünf der neun stimmen:** CLAUDE.AI, Gemini, Friseur und das Deutschlandticket-Abo haben
2025 null Zahlungen. Audible hat sechs unregelmäßige (E5).

**Zusätzlich im Auftrag nicht genannt, aber 2025 belegt:** Rundfunkbeitrag (vier
Quartalszahlungen, −125,72 €), Privathaftpflicht (−29,68 € im April),
Reisekrankenversicherung DKV (−9,90 € im Mai).

### Zwei Zahlen des Auftrags, die eine Muster-Aggregation verzerrt hat

**iCloud war 2025 nicht 11,58 €, sondern 9,99 € — unverändert gegenüber heute.** Die 11,58 €
sind der Durchschnitt über **17** `APPLE.COM/BILL`-Buchungen; zwölf davon sind iCloud und
lauten **alle exakt auf 9,99 €**, die anderen fünf sind Einzelkäufe (0,99 / 1,99 / 1,99 /
69,99 / 1,99 €).

**Der ADAC verbirgt zwei verschiedene Dinge:** 99,00 € Mitgliedsbeitrag am 09.10.2025 und
212,10 € Fahrsicherheitstraining am 05.12.2025. Nur das erste gehört zur Karte.

**Warum der ADAC trotzdem draußen bleibt:** siehe Falle ③ — die Karte ist jährlich und
startet 2026-07. Eine Rückdatierung auf 2025-10 (den Zahlungsmonat) würde 2026 den aktiven
Monat von Juli auf Oktober verschieben und damit den schärfsten Anker des Sprints brechen.
Für 99 € ist das nicht zu rechtfertigen.

---

## 5. Die Fallen — drei aus dem Auftrag, zwei selbst gefunden

### ① Der Split-Anteil (aus dem Auftrag)

Bei einer GEMEINSAM-Karte ist der Plan der **Haushaltsbetrag**, die Zahlung dagegen bereits
**mein Anteil** (§6 Stolperfalle 11). Wer den Zahlbetrag als Plan einträgt, lässt den Anteil
ein zweites Mal abziehen. Die Miete: gezahlt 1.068,44 €/Monat, Plan **1.817,49 €** (Jan–Mär)
bzw. **1.888,91 €** (ab April).

### ② Forward-Inheritance ist ein Slot (aus dem Auftrag)

Der 2025-Plan kommt als **zusätzliche** Zeile mit `effective_month = 2025-01-01`, per UPSERT
auf `(card_id, effective_month)` (§7 Regel 6). Die 2026-01-Zeile bleibt unangetastet und gilt
ab Januar 2026 weiter — **genau das ist der Grund, warum sich 2026 nicht bewegt.**

### ③ SELBST GEFUNDEN: Der Rhythmus zählt ab `first_active_month`

`is_card_active_in_month` rechnet:

```
v_months_diff := Abstand(p_month, first_active_month)
ANNUAL    → aktiv, wenn v_months_diff % 12 = 0
QUARTERLY → aktiv, wenn v_months_diff %  3 = 0
```

**Zurückdatieren verschiebt also, in welchen Monaten die Karte 2026 aktiv ist.** Eine
jährliche Karte, die um neun Monate zurückwandert, ist 2026 in einem anderen Monat fällig —
und keine Zahl sähe dabei falsch aus, nur die Sparrate zweier Monate wäre vertauscht.

**Regel für diesen Sprint:** Rückdatierung nur um ein **ganzzahliges Vielfaches der
Periode**. Die Migration prüft das selbst und bricht sonst ab. Betroffen: Rundfunkbeitrag
(12 Monate, 12 % 3 = 0 ✓), Privathaftpflicht (12 ✓), DKV (12 ✓), ADAC (9 ✗ → draußen).

### ④ SELBST GEFUNDEN: Der Faktor gehört an den Startmonat, nicht an den Januar

Der erste Trockenlauf nahm für **alle** Karten den Januar-Faktor. Bei der Privathaftpflicht,
die erst im April beginnt, ergab das **50,49 € statt 52,47 €**. Das ist Falle ① in Miniatur —
und sie hat im eigenen Prüfcode zugeschlagen, obwohl sie im Briefing stand.

### ⑤ Eine Zuordnungs-Messung ohne Falsch-Treffer ist keine Messung (aus dem Auftrag)

§7 Regel 25 / LL-27. Prüfset: die **101 Handzuordnungen** aus Juli/August plus die **418
aus 2026**; das geprüfte Element wird aus seiner eigenen Lernmenge ausgeschlossen.

---

## 6. Die Plan-Tabelle — 22 Karten, 27 Plan-Zeilen

Beträge in Euro. Bei GEMEINSAM ist die zweite Spalte der Haushaltsbetrag ab April.

| Karte | Typ / Attribution | ab | Plan 2025-01 | Plan 2025-04 |
|---|---|---|---|---|
| Miete | FIXED_COST / GEMEINSAM | 2025-01 | 1.817,49 | 1.888,91 |
| Internet – Vodafone | FIXED_COST / GEMEINSAM | 2025-01 | 38,70 | 40,22 |
| Rechtsschutz – Adam Riese | FIXED_COST / GEMEINSAM | 2025-01 | 24,58 | 25,55 |
| Strom – Mainova | FIXED_COST / GEMEINSAM | 2025-01 | 49,90 | 51,86 |
| Rundfunkbeitrag (quartalsweise) | FIXED_COST / GEMEINSAM | 2025-01 | 53,46 | 55,57 |
| Privathaftpflicht (jährlich) | FIXED_COST / GEMEINSAM | 2025-04 | — | 52,47 |
| Netflix | FIXED_COST / ICH | 2025-01 | 18,99 | — |
| Spotify | FIXED_COST / ICH | 2025-01 | 11,16 | — |
| iCloud | FIXED_COST / ICH | 2025-01 | 9,99 | — |
| Essen gehen | FIXED_COST / ICH | 2025-01 | 50,00 | — |
| Kreditkartenkosten | FIXED_COST / ICH | 2025-01 | 2,49 | — |
| Private Altersvorsorge – Nürnberger | FIXED_COST / ICH | 2025-01 | 114,43 | — |
| Berufsunfähigkeit – Alte Leipziger | FIXED_COST / ICH | 2025-01 | 95,51 | — |
| Fitnessstudio | FIXED_COST / ICH | 2025-01 | 104,00 | — |
| Handyvertrag | FIXED_COST / ICH | 2025-01 | 33,07 | — |
| Audible (sechs Lücken) | FIXED_COST / ICH | 2025-01 | 9,95 | — |
| Reisekrankenversicherung – DKV (jährlich) | FIXED_COST / ICH | 2025-05 | 9,90 | — |
| Handyvertrag – Aline | INCOME / ICH | 2025-01 | 11,00 | — |
| iCloud – Anteil Mama | INCOME / ICH | 2025-01 | 7,00 | — |
| Privates Budget | BUDGET / ICH | 2025-01 | 150,00 | — |
| Haushaltsgeld | BUDGET / ICH | 2025-01 | 200,00 | — |
| Tanken | BUDGET / ICH | 2025-01 | 240,00 | — |

**Audible-Lücken** (`adjusted_amount = 0`, `adjustment_scope = 'THIS_MONTH'`):
Februar, März, April, August, September, Oktober 2025.

### Die erwartete 2025-Sparrate, Monat für Monat

Ist **und** Plan sind nach Phase 2 identisch — es ist ja noch nichts verlinkt.

| Monat | Wert | | Monat | Wert |
|---|---|---|---|---|
| Januar | 1.849,12 | | Juli | 1.849,12 |
| Februar | 1.890,50 | | August | 1.890,50 |
| März | 1.890,50 | | September | 1.890,50 |
| April | 1.829,39 | | Oktober | 1.859,07 |
| Mai | 1.870,65 | | November | 1.880,55 |
| Juni | 1.880,55 | | Dezember | 1.880,55 |
| | | | **Jahressumme** | **22.461,00** |

---

## 7. Warum keine Übungs-Datenbank (E4)

Die Fähigkeit `db-eingriff` verlangt den Slot-Tausch bei Migration, neuer RPC, Änderung an
einer Rechenfunktion und mutierendem Testlauf. **Dieser Sprint ist keiner der vier Fälle** —
er ändert ausschließlich Nutzdaten.

Was die Übungs-Datenbank hier belegen könnte, ist der Constraint-Mechanismus. Was sie
**nicht** belegen kann, ist die Split-Umrechnung: Ihr Bestand ist synthetisch, ohne
2025-Zahlungen und ohne GEMEINSAM-Karte mit Faktor-Wechsel — also ohne den gefährlichsten
Fall. Der RAISE-Rollback-Trockenlauf (LL-18) prüft dagegen **die echten Daten** und
hinterlässt nichts; er hat bereits Falle ④ gefunden.

Dieselbe Begründung wie `sprints/sprint_v2-24_review.md` §5. Der Rennrad-Trainer bleibt an.

---

## 8. Phasen

Phasen-sequenziell, ein Commit je Phase (§7 Regel 11).

| # | Was | Datenbank | Commit |
|---|---|---|---|
| **1** | Briefing + Migrationsdatei + Vorher-Anker | nein | ja |
| **2** | Karten zurückdatieren, Plan-Zeilen, Audible-Lücken · Trockenlauf → **Freigabe** → Anwendung → Nachher-Anker | **ja, Prod** | ja |
| **3** | **HALT.** Zuordnung für 2025 nachrechnen und messen — Richtig **und** Falsch. Ergebnis vorlegen, nicht vorwegnehmen | ja (lesend + `refresh_fragment_suggestions`) | ja |
| **4** | `ZO-3`: rückwirkend verlinken, was sicher ist — **nur nach eigener Freigabe** | **ja, Prod** | ja |
| **5** | Doku: CLAUDE.md (v2-25 + v2-26 + v2-27), Roadmap, Review | nein | ja |

**Phase 3 ist der Halt, den der Auftrag verlangt.** Sie entscheidet, ob Phase 4 überhaupt
lohnt. Fällt die Messung schlecht aus, endet der Sprint nach Phase 3 plus 5 — und das wäre
ein vollwertiges Ergebnis.

---

## 9. Prüfschritte

| # | Schritt | Erwartung | Bezug |
|---|---|---|---|
| **S1** | 2026, alle zwölf Monate, Ist und Plan | **identisch zu §2** | §7 Regel 21 |
| **S2** | 2025, alle zwölf Monate | Tabelle §6, Summe 22.461,00 € | §7 Regel 21 |
| **S3** | Anker 1: Σ Ordner == Sparrate | 24/24 exakt | §9 Anker 1 |
| **S4** | Anker 2: Σ delta == Ist − Plan | 24/24 exakt | §6 Stolperfalle 9 |
| **S5** | Prüfsummen der neun Funktionen | byte-identisch zu §2 | LL-22 |
| **S6** | `card_planned_timeline`: je Karte genau eine Zeile je Slot | keine Dubletten | §7 Regel 6 |
| **S7** | Rhythmus: jede ANNUAL/QUARTERLY-Karte 2026 im selben Monat aktiv wie vorher | unverändert | Falle ③ |
| **S8** | Audible: sechs Monate 0,00 €, sechs Monate 9,95 € | wie §6 | E5 |
| **S9** | Zuordnungs-Messung 2025 | Richtig **und** Falsch gezählt | §7 Regel 25 |
| **S10** | Prüfstrecke | tsc 0 · ESLint 0/0 · Build 0 · visual 121/121 · e2e 130/130 | — |

**Browser-Smoke (Desktop, durch den Nutzer):** Jahres-Welle öffnen und prüfen, dass die
Vorjahreslinie jetzt bei rund **22.461 €** statt 48.445 € steht · einen 2025-Monat ansteuern
und prüfen, dass Karten erscheinen · Miete im Januar 2025 antippen: Haushaltsbetrag
**1.817,49 €**, mein Anteil **1.068,44 €**.
