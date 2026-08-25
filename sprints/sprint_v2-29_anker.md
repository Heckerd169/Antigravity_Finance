# Sprint v2-29 · Anker-Protokoll

**Alle Werte gegen Produktion `nflkobdfdhncrtjncpmq`,
Nutzer `179cd2c1-bbc2-4fd0-954b-8735eb90f370`.**

> **Wozu diese Datei.** §7 Regel 21 verlangt, vor und nach jedem Eingriff **alle
> vierundzwanzig** Monate zu messen, Ist **und** Plan, **in derselben Sitzung**.
> Verglichen wird gegen den eigenen Vorher-Wert von vor Minuten, nicht gegen eine
> Tabelle aus einer Datei — die Zahlen des Nutzers bewegen sich durch normale
> Benutzung. Deshalb steht hier ein Protokoll und kein Sollwert.

---

## 1 · Sparrate — VORHER (25.08.2026)

| Monat | Ist | Plan | | Monat | Ist | Plan |
|---|---|---|---|---|---|---|
| 2025-01 | 1.813,98 | 1.802,57 | | 2026-01 | 1.318,76 | 1.497,91 |
| 2025-02 | 1.689,37 | 1.820,66 | | 2026-02 | 1.667,90 | 1.651,10 |
| 2025-03 | 1.679,98 | 1.820,66 | | 2026-03 | 1.053,42 | 1.381,43 |
| 2025-04 | 1.753,87 | 1.803,78 | | 2026-04 | 1.753,14 | 1.729,58 |
| 2025-05 | 1.842,29 | 1.841,54 | | 2026-05 | −239,10 | −96,40 |
| 2025-06 | 1.852,19 | 1.851,44 | | 2026-06 | 3.509,75 | 3.799,90 |
| 2025-07 | 1.821,04 | 1.820,29 | | 2026-07 | −8,84 | 21,44 |
| 2025-08 | 1.862,14 | 1.861,39 | | 2026-08 | 629,34 | 404,46 |
| 2025-09 | 1.858,74 | 1.861,39 | | 2026-09 | 1.821,59 | 1.821,59 |
| 2025-10 | 1.827,59 | 1.830,24 | | 2026-10 | 1.790,08 | 1.790,08 |
| 2025-11 | 1.854,79 | 1.857,44 | | 2026-11 | 1.821,59 | 1.821,59 |
| 2025-12 | 1.852,79 | 1.855,44 | | 2026-12 | 1.821,59 | 1.821,59 |

**Jahressumme 2025 (Ist): 21.708,77 €.**

> Am 24.08.2026 stand dieselbe Summe bei **21.776,33 €**. Die Differenz von
> −67,56 € ist **normale Kuratierung**, kein Befund — der Nutzer ordnet laufend
> weiter zu. Genau deshalb gibt es seit dem 13.08.2026 keine eingefrorene
> Sollwert-Tabelle mehr.

**Erwartung nach dem Eingriff: jede Zeile identisch.** Erzwungen, nicht zugesagt —
`confidence.history_score` steht auf **0,94** und damit unter der
Auto-Absorptions-Schwelle **0,95**. Es kann nichts verlinkt werden, also kann sich
keine Zahl bewegen.

---

## 2 · Anker 1 — Ordner-Spalte == Sparrate

**24 von 24 Monaten exakt.** Gemessen als

```sql
SELECT sum((e->>'amount')::numeric)
  FROM jsonb_array_elements(get_category_amounts_for_month(<user>, <monat>)) e;
```

gegen `calculate_sparrate_for_month(<user>, <monat>)`. Keine Abweichung in keinem
Monat, weder 2025 noch 2026.

---

## 3 · Anker 2 — `Σ delta = Ist − Plan` (B2)

**24 von 24 Monaten exakt.**

| Monat | Σ delta | Treiber | | Monat | Σ delta | Treiber |
|---|---|---|---|---|---|---|
| 2025-01 | 11,41 | 7 | | 2026-01 | −179,15 | 11 |
| 2025-02 | −131,29 | 9 | | 2026-02 | 16,80 | 5 |
| 2025-03 | −140,68 | 11 | | 2026-03 | −328,01 | 5 |
| 2025-04 | −49,91 | 11 | | 2026-04 | 23,56 | 5 |
| 2025-05 | 0,75 | 2 | | 2026-05 | −142,70 | 7 |
| 2025-06 | 0,75 | 2 | | 2026-06 | −290,15 | 3 |
| 2025-07 | 0,75 | 2 | | 2026-07 | −30,28 | 6 |
| 2025-08 | 0,75 | 2 | | 2026-08 | 224,88 | 4 |
| 2025-09 | −2,65 | 2 | | 2026-09 | 0,00 | 0 |
| 2025-10 | −2,65 | 2 | | 2026-10 | 0,00 | 0 |
| 2025-11 | −2,65 | 2 | | 2026-11 | 0,00 | 0 |
| 2025-12 | −2,65 | 2 | | 2026-12 | 0,00 | 0 |

> **Zwei Stolperfallen bei dieser Messung, beide haben hier Zeit gekostet.**
>
> **①** `get_year_deviation_drivers` hat die Signatur **`(p_year, p_limit)`** — der
> zweite Parameter ist die Zahl der Treiber je Monat, **nicht** der Monat. Ein
> Aufruf mit `(2026, 10)` liefert das ganze Jahr mit höchstens zehn Treibern je
> Monat und sieht dabei völlig plausibel aus.
>
> **②** `p_limit` ist auf **1…50** begrenzt (`22023` darüber). Die Spalte „Treiber"
> steht hier, um zu belegen, dass **kein** Monat an diese Grenze stößt — der
> Höchstwert ist 11. Ohne diesen Nachweis wäre die Summe möglicherweise
> abgeschnitten und die Invariante scheinbar verletzt.
>
> Und wie in §6 Stolperfalle 4 vermerkt: Die Funktion nimmt **kein** `p_user_id`,
> sondern liest `auth.uid()` selbst und wirft `28000` ohne Session. Über MCP muss
> deshalb `request.jwt.claims` im selben Aufruf gesetzt werden.

---

## 4 · Prüfsummen — VORHER

`md5(pg_get_functiondef(oid))`, Schema `public`.

| Funktion | Prüfsumme | erwartet nachher |
|---|---|---|
| `calculate_sparrate_for_month` | `68b4954451deb829a5e61d65b1946eaf` | identisch |
| `calculate_planned_sparrate_for_month` | `cb2b43af5cc71fd8d1556cefe2ecc51e` | identisch |
| `calculate_card_amount_for_month` | `4af07d327f17363e2452b815403e5c89` | identisch |
| `get_planned_amount_for_month` | `454eae37e578207bff2542422fe234f2` | identisch |
| `get_effective_plan_for_month` | `b93f894c88b463a5ce76674524641890` | identisch |
| `is_card_active_in_month` | `b57e8a9871caa8d583627d5f9c7eb0b2` | identisch |
| `get_split_factor` | `3c6fc76ab1a1983936e995645a1814a7` | identisch |
| `get_net_monthly_for_month` | `f04593a61253ad4f54680f35b5ee6285` | identisch |
| `get_year_deviation_drivers` | `bfd1111ec392ea446112b234f85efc2c` | identisch |
| **`calculate_match_confidence`** | `defa3e43f468e51946362a15ee943c9f` | **identisch** |
| `get_category_amounts_for_month` | `e6e0361bcf30a5d56dcaf6b83a32fe97` | identisch |
| `merchant_rule_match` | `b41b06df42187d8760240191d9f54051` | identisch |
| `name_similarity_scoped` | `f0b110f0a91de5a0f60ec9934c55476c` | identisch |
| `frequency_match` | `79d782eb4c01c42de5ce1f42fddcbe91` | identisch |
| `amount_match` | `4d951f516315943bb59f06ed19218dd6` | identisch |
| `af_normalize_text` | `05a73da318ccbda82500b41d974c8b4c` | identisch |
| `af_word_in_text` | `4f8e4b757b63998ddb7bcdd1195df451` | identisch |
| `refresh_fragment_suggestions` | `191809d6e0286436415984ffb28c60a5` | identisch |
| **`history_match`** | `5da26193c869c506627c0044b963c94f` | **ändert sich — das ist der Sprint** |

**Achtzehn von neunzehn müssen unverändert bleiben.** `calculate_match_confidence`
ist ausdrücklich darunter: Sie ruft `history_match` auf, wird selbst aber nicht
angefasst. Bewegt sich ihre Prüfsumme, ist versehentlich in sie hineingeschrieben
worden — und dann ist auch die Händler-Regel aus v2-28 betroffen.

---

## 5 · Bestand — VORHER

| Was | Wert | erwartet nachher |
|---|---|---|
| `card_fragment_links` gesamt | **678** | **678** |
| davon `MANUAL_DROP` | 568 | 568 |
| davon `AUTO_ABSORBED` | 110 | 110 |
| `fragments` gesamt | 1.599 | 1.599 |
| offene Zahlungen 2025 | 480 | 480 |
| **davon mit Vorschlag ≥ 0,60** | **136** | **195 erwartet** |
| offene Zahlungen 2026 | 0 | 0 |

**Schwellen in `app_config`** (keine davon wird geändert):

| Schlüssel | Wert |
|---|---|
| `confidence.badge_threshold` | 0,60 |
| `confidence.history_score` | **0,94** |
| `confidence.auto_absorption_threshold` | 0,95 |
| `confidence.merchant_rule_score` | 0,96 |
| `confidence.minimum_match_threshold` | 0,20 |

> **Die 678 sind der schärfste Wächter dieses Sprints.** `history_match` ist eine
> `STABLE`-Funktion und kann per Definition nichts schreiben; wandert die Zahl
> trotzdem, ist etwas grundsätzlich anders als gedacht.
> `refresh_fragment_suggestions` zählt sie zusätzlich selbst vor und nach ihrem Lauf
> und bricht bei jeder Abweichung mit Rollback ab — das ist **erzwungen, nicht
> zugesagt**.

---

## 6 · Sauberkeit der Lernmenge — VORHER

Drei Kontrollfragen, alle mit **0** beantwortet:

| Frage | Ergebnis |
|---|---|
| Fragmente mit **mehr als einer** Verknüpfung | **0** — ein Fragment hat höchstens eine Karte |
| `MANUAL_DROP`-Verknüpfungen auf einem **Übertrag** | **0** — §6 Stolperfalle 7 hält |
| `MANUAL_DROP`-Verknüpfungen auf einer **gelöschten** Karte | **0** |

Die Lernmenge sind damit genau **568 Fragmente**, jedes mit genau einer Karte. Das
ist die Voraussetzung dafür, dass „der Händler zeigt auf **eine** Karte" überhaupt
wohldefiniert ist.

---

## 7 · Nachher — gemessen in derselben Sitzung

Dieselben Abfragen, nach der Migration (P1) **und** nach dem Nachrechnen (P2).

| Anker | Erwartung | Gemessen |
|---|---|---|
| Sparrate, 24 Monate, Ist **und** Plan | jede Zeile identisch | **24 identisch · 0 bewegt** ✅ |
| Anker 1 — Ordner-Spalte == Sparrate | 24/24 | **24/24** ✅ |
| Anker 2 — `Σ delta = Ist − Plan` | 24/24 | **24/24** ✅ |
| `card_fragment_links` | 678 | **678** (568 Hand · 110 automatisch) ✅ |
| Prüfsummen | 18 von 19 identisch | **18 identisch**, nur `history_match` bewegt ✅ |
| `calculate_match_confidence` | byte-identisch | `defa3e43f468e51946362a15ee943c9f` — **unverändert** ✅ |
| **Vorschläge 2025** | **136 → 195** | **195** ✅ |

**`history_match` neu:** `99aa12b889a18691917c7c7e93f191f6`
(vorher `5da26193c869c506627c0044b963c94f`).

### Was der Nachrechnen-Lauf gemeldet hat

```
geprueft            484
vorschlag_gesetzt    68
vorschlag_geleert     0      <-- es geht NICHTS verloren
links_unveraendert  678
badge_threshold     0.60
Dauer               23,2 s
```

> **Die 195 standen VOR dem Eingriff im Briefing und wurden exakt getroffen.**
> Das ist der eigentliche Wert dieser Messung: Nicht dass die Zahl gestiegen ist,
> sondern dass sie **vorhersagbar** war. Eine Zahl, die man erst hinterher abliest,
> belegt nichts — sie beschreibt nur, was passiert ist.
>
> **`vorschlag_geleert: 0` ist die zweite wichtige Null.** Sie belegt, dass die
> Entscheidung „ergänzen statt ersetzen" trägt: Kein einziger der 136 bisherigen
> Vorschläge ist verschwunden. Bei der verworfenen Bauweise wären es 35 gewesen.

### Stichprobe — was tatsächlich sichtbar geworden ist

**39 Zahlungen mit Buchungsdatum im Text** bekommen einen Vorschlag, wo vorher
**keine einzige** einen hatte. Genau die 39, die im Briefing §10 prognostiziert
wurden — nicht die 147 aus der alten `ZO-5`-Begründung.

Alle 39 zeigen auf **Privates Budget** (`ALDI.SUeD/Frankfurt | VISA
Debitkartenumsatz vom …`, `Apotheke Am Henninger T | …`, `BIOTECHUSA/FRANKFURT`).
Das ist kein Zufall und kein Fehler: Es sind Alltagskäufe, und der Nutzer hat
genau diese Händler bisher ausnahmslos dorthin gelegt. Die Regel sagt nichts
anderes, als was er selbst entschieden hat.

### Der Trockenlauf vorher — was er gefunden hat

Beide Funde wären ohne ihn erst in Produktion aufgefallen:

| | Fund |
|---|---|
| **①** | `CREATE INDEX` scheitert mit `42883: function af_normalize_text(text) does not exist`, wenn der Aufruf im Funktionsrumpf nicht **schema-qualifiziert** ist. Postgres bettet die SQL-Funktion beim Anlegen des Index ein und wertet sie unter einem anderen `search_path` aus. Jeder direkte Aufruf funktioniert dabei tadellos — der Fehler tritt **nur** beim Index-Anlegen auf. |
| **②** | Ohne Index kostet ein Aufruf **14,9 ms**. Mit Index **0,208 ms** — Faktor **72**. Bei rund 14.000 Aufrufen je Nachrechnen-Lauf ist das der Unterschied zwischen 23 Sekunden und über drei Minuten. |

Die Testreihe `T1`–`T8` lief zweimal: einmal im Trockenlauf gegen die noch nicht
installierte Fassung, einmal **nach** der Migration gegen die tatsächlich
installierte. Beide Male identisch.

| | Prüfung | Ergebnis |
|---|---|---|
| T1 | vereinfachte Fassung == gemessene Fassung, alle 1.599 Fragmente | **0 Abweichungen** |
| T2 | eindeutiger Händler, richtige Karte | 1.00 |
| T3 | eindeutiger Händler, falsche Karte | 0.00 |
| T4 | mehrdeutiger Händler → Stufe 2 übernimmt | 1.00 |
| T5 | Übertrag | 0.00 |
| T6 | unbekanntes Fragment | 0 |
| T7 | Selbstausschluss (einziger Träger seines Händlers) | 0.00 |
| T8 | Laufzeit mit Index | 0,208 ms je Aufruf |

### Und ein Beleg, den man leicht vergisst

**Die Migrationsdatei im Repo ist byte-genau das, was in Produktion läuft.**
Nachgewiesen, nicht zugesichert: Der Funktionsrumpf aus der Datei wurde nach der
Migration ein zweites Mal eingespielt, und die Prüfsumme blieb bei
`99aa12b889a18691917c7c7e93f191f6`. `pg_get_functiondef` schließt Kommentare ein
— wer im Rumpf „aufräumt", ohne neu einzuspielen, lässt Datei und Datenbank
auseinanderlaufen, ohne dass sich das Verhalten ändert (Lehre aus v2-25).
