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

## A5 — Prüfsummen NACHHER

*(wird nach Phase 4 ergänzt)*

## A1–A4 — NACHHER

*(wird nach Phase 4 ergänzt)*
