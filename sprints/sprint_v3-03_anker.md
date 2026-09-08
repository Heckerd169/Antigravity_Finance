# Sprint v3-03 — Anker-Protokoll

> **Reiner Anzeige-Sprint.** Keine Migration, keine Rechenfunktion berührt, keine RPC neu.
> Erwartung deshalb: **kein Zahlenwert bewegt sich.**
>
> Gemessen gegen Produktion (`nflkobdfdhncrtjncpmq`) in **derselben Sitzung** vorher und
> nachher — nicht gegen eine Tabelle in einer Datei (CLAUDE.md §9 Messregel).

---

## Vorher — 08.09.2026, vor der ersten Code-Änderung

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
| 2025-08 | 169,35 | 458,61 | | 2026-08 | **341,36** | 294,31 |
| 2025-09 | 682,50 | 1.031,12 | | 2026-09 | 1.613,11 | 1.695,09 |
| 2025-10 | 1.856,28 | 1.736,18 | | 2026-10 | 1.766,56 | 1.766,56 |
| 2025-11 | 2.925,87 | 3.125,81 | | 2026-11 | 1.819,15 | 1.819,15 |
| 2025-12 | 943,12 | 1.169,64 | | 2026-12 | 1.529,58 | 1.529,58 |

> **August 2026 steht bei 341,36 €, die Momentaufnahme in CLAUDE.md §9 nennt 507,10 €.**
> Das ist **kein Befund**, sondern der dokumentierte Normalfall: Die Momentaufnahme ist
> ausdrücklich kein Sollwert, und der Nutzer kuratiert weiter. Verglichen wird gegen den
> eigenen Vorher-Wert von heute, nicht gegen die Tabelle.

### Anker 1 — die Ordner-Spalte ergibt die Sparrate

`Σ get_category_amounts_for_month == calculate_sparrate_for_month`

**0,00 € in 24 von 24 Monaten.**

### Anker 2 — B2-Invariante `Σ delta = Ist − Plan`

`get_year_deviation_drivers(jahr, 50)` unter gesetzter Session, Summe über alle Treiber je
Monat; Monate ohne Treiber zählen als 0 (dort ist Ist = Plan).

**24 von 24 Monaten exakt, größte Abweichung 0,00 €.**
Oktober bis Dezember 2026 liefern keine Treiber, weil dort Ist = Plan gilt.

---

## Nachher — 08.09.2026, nach P4, in derselben Sitzung

| Anker | Vorher | Nachher |
|---|---|---|
| Sparrate Ist + Plan, 24 Monate | gemessen | **24/24 byte-identisch** |
| Anker 1 (Σ Ordner = Sparrate) | 0,00 € in 24/24 | **0,00 € in 24/24** |
| Anker 2 (Σ delta = Ist − Plan) | 0,00 € in 24/24 | **0,00 € in 24/24** |

**Kein Zahlenwert hat sich bewegt** — wie erwartet. Der Sprint hat keine Migration
eingespielt, keine Rechenfunktion berührt und keine RPC geändert; er liest ausschließlich
`get_sparrate_series`, `get_cards_for_month` und `fragments_with_status`.

**Prüfsummen wurden bewusst NICHT gemessen.** Sie belegen, dass eine Funktion unverändert
ist — und dieser Sprint hat keine angefasst. Eine Messung ohne Eingriff belegt nichts, was
die 24 identischen Sparraten nicht schon zeigen.

### Anker 3 — Netzrunden je Aufbau

Aus den Ladern gezählt, nicht geschätzt (die Zählung steht als Kommentar in jeder
`page.tsx`):

| Sicht | Netzrunden | Aufrufe |
|---|---|---|
| `/mobil/uebersicht` | **8** | Anmeldung · `profiles` · `cards` · `get_sparrate_series` · `get_cards_for_month` · verknüpfte Zahlungen · offene Zahlungen · letzte Zuordnung |
| `/mobil/karten` | **6** | Anmeldung · `profiles` · `cards` · `get_cards_for_month` · verknüpfte Zahlungen · offene Zahlungen |
| `/mobil/verlauf` | **5** (6 an einer Jahresgrenze) | Anmeldung · `profiles` · `get_sparrate_series` (1–2) · offene Zahlungen |
| `/mobil/zuordnen` (v3-02) | 11 | unverändert |
| Schreibtisch (v2-24) | ~18 | unverändert |

**Im Edge-Log gegengezählt wird nach dem Browser-Smoke des Users** — die Ingestion
verzögert sich um Minuten, ein sofortiger Blick zählt zu wenig (§9 Anker 3, v2-24).
