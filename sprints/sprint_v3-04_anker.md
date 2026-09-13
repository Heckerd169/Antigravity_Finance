# Sprint v3-04 — Anker-Protokoll

> **Reiner Metadaten-Sprint.** Keine Migration, keine Rechenfunktion berührt, keine RPC
> neu, kein mutierender Testlauf. Erwartung deshalb: **kein Zahlenwert bewegt sich.**
>
> Gemessen gegen Produktion (`nflkobdfdhncrtjncpmq`) in **derselben Sitzung** vorher und
> nachher — nicht gegen eine Tabelle in einer Datei (CLAUDE.md §9 Messregel).

---

## Vorher — 13.09.2026, vor der ersten Änderung

### Sparrate Ist und Plan, 24 Monate

| Monat | Ist | Plan | | Monat | Ist | Plan |
|---|---|---|---|---|---|---|
| 2025-01 | −987,21 | −762,61 | | 2026-01 | 1.318,76 | 1.497,91 |
| 2025-02 | 1.813,37 | 1.944,66 | | 2026-02 | 1.667,90 | 1.651,10 |
| 2025-03 | 3.527,21 | 3.547,33 | | 2026-03 | 1.053,42 | 1.381,43 |
| 2025-04 | −198,14 | −1.215,25 | | 2026-04 | 1.753,14 | 1.729,58 |
| 2025-05 | 87,55 | 1.227,20 | | 2026-05 | −239,10 | −96,40 |
| 2025-06 | 894,60 | 1.228,15 | | 2026-06 | 3.509,75 | 3.799,90 |
| 2025-07 | −272,20 | −28,32 | | 2026-07 | −8,84 | 21,44 |
| 2025-08 | 169,35 | 458,61 | | 2026-08 | 341,36 | 294,31 |
| 2025-09 | 682,50 | 1.031,12 | | 2026-09 | **1.315,23** | **1.399,47** |
| 2025-10 | 1.856,28 | 1.736,18 | | 2026-10 | 1.766,56 | 1.766,56 |
| 2025-11 | 2.925,87 | 3.125,81 | | 2026-11 | 1.819,15 | 1.819,15 |
| 2025-12 | 943,12 | 1.169,64 | | 2026-12 | 1.529,58 | 1.529,58 |

> **Alle 2025er Werte und zwanzig der 2026er sind byte-identisch mit dem Protokoll von
> v3-03 (08.09.2026).** Bewegt hat sich genau **ein** Monat: September 2026, von
> 1.613,11 € auf 1.315,23 € (Plan 1.695,09 → 1.399,47). Das ist **normale Benutzung** —
> der Nutzer hat in den fünf Tagen dazwischen zugeordnet.
>
> **Und die Zahl bewegt sich weiter, während dieser Sprint läuft.** Der Screenshot, mit
> dem der Fehler gemeldet wurde, zeigt September 2026 um 18:23 Uhr bei **1.286,37 €**;
> die Messung oben, wenige Minuten später, liefert 1.315,23 €. Beide Zahlen sind richtig.
> **Genau deshalb wird gegen den eigenen Vorher-Wert von vor zehn Minuten verglichen und
> nicht gegen eine Tabelle** (CLAUDE.md §9).

### Anker 1 — die Ordner-Spalte ergibt die Sparrate

`Σ get_category_amounts_for_month == calculate_sparrate_for_month`

**0,00 € in 24 von 24 Monaten.**

### Anker 2 — B2-Invariante `Σ delta = Ist − Plan`

`get_year_deviation_drivers(jahr, 50)` unter gesetzter Session, Summe über **alle**
Treiber je Monat; Monate ohne Treiber zählen als 0 (dort ist Ist = Plan).

**24 von 24 Monaten exakt, größte Abweichung 0,00 €.**
Oktober bis Dezember 2026 liefern keine Treiber, weil dort Ist = Plan gilt.

> **Zur Messung selbst:** `get_year_deviation_drivers` liest `auth.uid()` selbst und wirft
> ohne Sitzung `28000` (§6 Stolperfalle 4). Über MCP muss deshalb vorher
> `request.jwt.claims` gesetzt werden, in **derselben** Transaktion. Und `p_limit` ist
> auf 1…50 begrenzt — ein größerer Wert scheitert mit `22023`, statt still zu kappen.

---

## Nachher

*(wird in P3 in derselben Sitzung nachgetragen)*
