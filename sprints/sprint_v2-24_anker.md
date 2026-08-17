# Sprint v2-24 — Anker-Protokoll

> **Gemessen am 17.08.2026 auf Produktion `nflkobdfdhncrtjncpmq`, ausschließlich lesend,
> VOR dem ersten Eingriff.** Nutzer `179cd2c1-bbc2-4fd0-954b-8735eb90f370`.
>
> **Erwartung dieses Sprints: jede Zeile bleibt identisch.** Es gibt keinen erwarteten
> Ausschlag — jede Bewegung ist ein Fehler (§7 Regel 21, `db-eingriff` Schritt 1 und 6).

## A1 + A2 + A3 — Ist, Plan und Invariante 1 (2026)

`inv1_diff` = `Σ get_category_amounts_for_month − calculate_sparrate_for_month`.

| Monat | Ist | Plan | inv1_diff |
|---|---|---|---|
| 2026-01 | 1.374,95 | 1.521,55 | **0,00** |
| 2026-02 | 1.670,39 | 1.653,59 | **0,00** |
| 2026-03 | 1.042,55 | 1.383,92 | **0,00** |
| 2026-04 | 1.872,77 | 1.872,77 | **0,00** |
| 2026-05 | −113,67 | −113,67 | **0,00** |
| 2026-06 | 3.547,44 | 3.837,59 | **0,00** |
| 2026-07 | −35,74 | −2,97 | **0,00** |
| 2026-08 | 694,34 | 769,33 | **0,00** |
| 2026-09 | 1.797,18 | 1.797,18 | **0,00** |
| 2026-10 | 1.765,67 | 1.765,67 | **0,00** |
| 2026-11 | 1.797,18 | 1.797,18 | **0,00** |
| 2026-12 | 1.797,18 | 1.797,18 | **0,00** |

## A1 — Ist 2025

**Alle zwölf Monate: 4.037,11 €.** Goldlinie 2025 = 48.445,32 €.
(Deckt sich mit der Momentaufnahme in `CLAUDE.md §9`.)

## A4 — Invariante 2 (B2)

`Σ delta == Ist − Plan`, geprüft über alle zwölf Monate 2026 mit `p_limit = 50`
(also ohne Abschneiden):

> **0 von 12 Monaten verletzt — alle zwölf exakt.**

## A5 — Prüfsummen der Rechenfunktionen (Vorher-Wert)

`md5(pg_get_functiondef(oid))`. **Diese neun Werte müssen nach dem Sprint
byte-identisch sein** — das ist der Beweis, dass die neuen Bündel-Funktionen die
bestehenden *aufrufen* und nicht *nachbauen* (LL-26 · §6 Stolperfalle 11).

| Funktion | Prüfsumme |
|---|---|
| `calculate_card_amount_for_month` | `4af07d327f17363e2452b815403e5c89` |
| `calculate_planned_sparrate_for_month` | `cb2b43af5cc71fd8d1556cefe2ecc51e` |
| `calculate_sparrate_for_month` | `68b4954451deb829a5e61d65b1946eaf` |
| `get_category_amounts_for_month` | `e6e0361bcf30a5d56dcaf6b83a32fe97` |
| `get_effective_plan_for_month` | `b93f894c88b463a5ce76674524641890` |
| `get_planned_amount_for_month` | `454eae37e578207bff2542422fe234f2` |
| `get_split_factor` | `3c6fc76ab1a1983936e995645a1814a7` |
| `get_year_deviation_drivers` | `bfd1111ec392ea446112b234f85efc2c` |
| `is_card_active_in_month` | `b57e8a9871caa8d583627d5f9c7eb0b2` |

## Bestand zum Messzeitpunkt

| | Anzahl |
|---|---|
| Karten, nicht gelöscht | **77** |
| davon aktiv im Juli 2026 | 34 |
| davon aktiv im August 2026 | 26 |
| Fragmente | 1.590 |
| `card_fragment_links` | 295 |
| `card_monthly_states` | 26 |
| `card_categories` | 10 |
| Datenbankgröße | 15 MB |

## Leistungs-Ausgangswert (S7)

| | Wert |
|---|---|
| Anfragen je Dashboard-Aufbau | **233** (Juli) / 208 (August), aus `page.tsx` gezählt |
| Anfragen am 16.08.2026 insgesamt | **55.881** |
| Antwort-Nutzlast desselben Tages | **0,4 MB** (Ø **8 Bytes** je Antwort) |
| Rechenzeit je Aufbau in Postgres | ~490 ms, davon 357 ms `get_year_deviation_drivers` |

---

## NACHHER — gemessen am 17.08.2026, nach beiden Migrationen

Zwischen Vorher- und Nachher-Messung liegen zwei angewendete Migrationen
(`20260817_v2_24_p3_karten_buendel.sql`, `20260817_v2_24_p4_sparrate_reihe.sql`),
beide **nur neue lesende Funktionen**, kein Schema-Eingriff.

### A5 — Prüfsummen: **alle neun byte-identisch**

Gemessen nach P3 und erneut nach P4, jeweils gegen die Vorher-Tabelle oben:
**9 identisch, 0 geändert.**

Das ist der tragende Beleg des Sprints: Die beiden neuen Funktionen **rufen** die
Rechenfunktionen auf und **bauen sie nicht nach**. Hätte eine von ihnen die
Prioritätskette nachgebildet, wäre der Split-Anteil ein zweites Mal angewandt
worden (§6 Stolperfalle 11) — und keine Zahl hätte falsch *ausgesehen*.

### A1 + A2 + A3 — jede Zeile identisch

| Monat | Ist | Plan | inv1_diff |
|---|---|---|---|
| 2026-01 | 1.374,95 | 1.521,55 | 0,00 |
| 2026-02 | 1.670,39 | 1.653,59 | 0,00 |
| 2026-03 | 1.042,55 | 1.383,92 | 0,00 |
| 2026-04 | 1.872,77 | 1.872,77 | 0,00 |
| 2026-05 | −113,67 | −113,67 | 0,00 |
| 2026-06 | 3.547,44 | 3.837,59 | 0,00 |
| 2026-07 | −35,74 | −2,97 | 0,00 |
| 2026-08 | 694,34 | 769,33 | 0,00 |
| 2026-09 | 1.797,18 | 1.797,18 | 0,00 |
| 2026-10 | 1.765,67 | 1.765,67 | 0,00 |
| 2026-11 | 1.797,18 | 1.797,18 | 0,00 |
| 2026-12 | 1.797,18 | 1.797,18 | 0,00 |

**Ist 2025: 4.037,11 € in allen zwölf Monaten** (als einziger distinkter Wert
geprüft) — unverändert.

### A4 — Invariante 2 (B2): **0 von 12 verletzt**

### Zusätzliche Gleichwertigkeits-Belege (über den Anker hinaus)

| Prüfung | Ergebnis |
|---|---|
| `get_cards_for_month` gegen den alten Frontend-Weg, 24 Monate, Karte für Karte und Wert für Wert (`EXCEPT` in **beide** Richtungen) | **304 = 304, 0 Unterschied** |
| Monatsbereich-Vorfilter gleichwertig zum Aufruf ohne Vorfilter, 24 Monate | **304 = 304, 0 Unterschied** |
| `get_sparrate_series` gegen die 24 Einzelaufrufe, drei Jahre (2024/25/26) | **36 = 36, 0 Unterschied** |
| `NULL` bleibt `NULL` (2024 ohne Daten) | **12 von 12 `NULL` erhalten** |
| Bereichsprüfung `get_sparrate_series(1800)` | wirft **22023** |

### Prüfdaten-Deckung (LL-15 — nicht nur Typen, auch Eigenschaften)

Der Juli 2026 enthält: alle **drei Kartentypen** · **GEMEINSAM mit verknüpfter
Zahlung fünfmal**, davon eine **vierteljährlich** · vier Frequenzen (MONTHLY,
QUARTERLY, ANNUAL, ONCE) · gesetzte **Anpassung** im August · **Häkchen** gesetzt
und nicht gesetzt · **26 Karten ganz ohne Monatszustand**.

---

## Leistung — Vorher/Nachher, beide aus dem Produktions-Log

| | vorher (16.08.) | nachher (17.08.) |
|---|---|---|
| **Anfragen je Dashboard-Aufbau** | **233** | **~18** (218 Anfragen / 12 Aufbauten) |
| p50 je Anfrage | 500–1.300 ms | **32–118 ms** |
| `is_card_active_in_month` je Aufbau | **77** | **0** (entfällt) |
| `calculate_sparrate_for_month` je Aufbau | **25** | **0** (entfällt) |
| `calculate_planned_sparrate_for_month` je Aufbau | **13** | **0** (entfällt) |
| `get_year_deviation_drivers` | **1 je Aufbau** (357 ms) | **1× im ganzen Fenster**, nur bei geöffnetem Popup |
| Netzrunden je Middleware-Durchlauf | 2, nacheinander | **1** |
| ECONNRESET-Wiederholungen im Prüflauf | dutzende | **0** |
| Laufzeit der Prüfstrecke | 2,4 min | **36,3 s** |

Der Zähler für „Aufbauten" ist `app_config` — genau ein Aufruf je
Dashboard-Aufbau, unverändert von diesem Sprint.

> **Zur Log-Auswertung, damit die nächste Sitzung nicht darauf hereinfällt:** Die
> Supabase-Edge-Logs haben eine **Ingestion-Verzögerung von einigen Minuten**. Eine
> Abfrage direkt nach dem Messlauf zeigte `get_sparrate_series` überhaupt nicht —
> die zwölf Aufrufe erschienen erst später. Wer sofort nach dem Lauf zählt, zählt
> zu wenig und diagnostiziert einen Fehler, den es nicht gibt.
