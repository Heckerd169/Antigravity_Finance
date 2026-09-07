# Anker-Protokoll v3-02 — `/mobil`, Lese-Funktion `get_open_fragment_candidates`

**Erwartung dieses Sprints: KEIN Zahlenwert bewegt sich.** Die Migration legt **eine**
neue, **rein lesende** Funktion an, die für die Aktiv-Entscheidung
`is_card_active_in_month` aufruft. Sie kann keine Zahl verändern — ein grüner
Nachher-Wert ist das erwartete Ergebnis, kein Beleg für Sorgfalt. Der Beleg liegt in
der Testreihe (unten) und in der Wortgleichheit Übung ↔ Produktion.

> Gemessen wird gegen den **eigenen Vorher-Wert dieser Sitzung**, nicht gegen eine
> Tabelle in einer Datei (CLAUDE.md §9, seit 13.08.2026). Der Nutzer kuratiert laufend
> weiter; Abweichungen zwischen zwei Sitzungen sind der Normalfall.

---

## VORHER — gemessen 07.09.2026, 17:50 Uhr, Produktiv-Datenbank `nflkobdfdhncrtjncpmq`

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
| 2025-08 | 169,35 | 458,61 | | 2026-08 | 341,36 | 294,31 |
| 2025-09 | 682,50 | 1.031,12 | | 2026-09 | 1.613,11 | 1.695,09 |
| 2025-10 | 1.856,28 | 1.736,18 | | 2026-10 | 1.766,56 | 1.766,56 |
| 2025-11 | 2.925,87 | 3.125,81 | | 2026-11 | 1.819,15 | 1.819,15 |
| 2025-12 | 943,12 | 1.169,64 | | 2026-12 | 1.529,58 | 1.529,58 |

**Goldlinie 2025 (Σ Ist):** 11.442,30 € — unverändert seit v2-31.

> **August bis Dezember 2026 haben sich seit dem 31.08.2026 bewegt** (August
> 507,10 → 341,36; September 1.621,60 → 1.613,11; Oktober bis Dezember je +30 bis
> +75 €). Der Nutzer hat in der Zwischenzeit September importiert und kuratiert (15
> Buchungen, alle zugeordnet) — **das ist kein Befund**, sondern der Grund, warum es
> keine eingefrorene Sollwert-Tabelle mehr gibt. Beide Invarianten sind 24/24 exakt.

### Anker 1 — Ordner-Spalte ergibt die Sparrate

`Σ get_category_amounts_for_month(...) − calculate_sparrate_for_month(...)`

**0,00 € in allen 24 Monaten.** Keine Verletzung.

### Anker 2 — B2-Invariante `Σ delta = Ist − Plan`

`get_year_deviation_drivers(jahr, 50)` unter gesetzter Session, Summe über alle
Treiber je Monat; Monate ohne Treiber zählen als 0 (dort ist Ist = Plan).

**0,00 € in allen 24 Monaten.** Keine Verletzung. Oktober bis Dezember 2026 liefern
keine Treiber (Ist = Plan, kein Wächter-Loch); alle übrigen 21 Monate treffen die
Differenz auf den Cent — größte Abweichung 0,0000 €.

### Prüfsummen — neun Rechenfunktionen plus vier, die diese Funktion berührt oder nachahmt

`md5(pg_get_functiondef(oid))`. **Keine davon wird in v3-02 geändert.**

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
| *zusätzlich:* `history_match` | `eb8f9540123fb08b80a9e3158968a283` |
| *zusätzlich:* `calculate_match_confidence` | `defa3e43f468e51946362a15ee943c9f` |
| *zusätzlich:* `get_cards_for_month` | `6394926aff4411f09d569a4f08f4f115` |
| *zusätzlich:* `refresh_fragment_suggestions` | `191809d6e0286436415984ffb28c60a5` |

**Alle neun identisch zu `sprints/sprint_v2-31_anker.md`** — seit dem 31.08.2026 hat
niemand eine Rechenfunktion angefasst. Die vier zusätzlichen stehen hier, weil die neue
Funktion die Regel von `history_match` Stufe 1 **wortgleich wiederholt** und
`is_card_active_in_month` **aufruft**: Ändert sich eine davon, muss sich diese Zeile
ändern, sonst ist die Wiederholung still auseinandergelaufen (LL-26).

> ⚠️ `pg_get_functiondef` schließt **Kommentare** ein (LL-32). Eine Prüfsumme ändert sich
> also auch dann, wenn nur ein Kommentar dazukommt. Bleibt sie gleich, ist die Funktion
> byte-identisch — das ist die Aussage, die hier gebraucht wird.

### Datenlage zum Zeitpunkt der Messung

| | Wert |
|---|---|
| Karten gesamt (nicht gelöscht) | **179** |
| davon aktiv im September 2026 | **22** |
| Zahlungen gesamt | **2.219** — 2023: 384 · 2024: 183 · 2025: 965 · 2026: 687 |
| offene Zahlungen (`UNASSIGNED`) | **476**, alle in 2023–2024; **0** in 2025 und 2026 |
| davon Händler auf 0 / 1 / 2 / 3 Karten | 268 / 87 / 91 / 30 |
| Verknüpfungen gesamt · davon von Hand | 1.186 · **1.065** |
| meiste manuelle Verknüpfungen eines Händlers | **39** |
| `confidence.badge_threshold` | 0,60 |

---

## Übungs-Datenbank `qyjuzzgqxowqiiwqcahd` — Probe am 07.09.2026, 17:56–18:40 Uhr

**Slot-Tausch:** Rennrad-Trainer pausiert 17:56 → Übungs-DB restore, `ACTIVE_HEALTHY`
um 18:12 (vorher ~14 Minuten `COMING_UP` — nicht geurteilt, nur gewartet) → Anker
**2.200,00 €** ✓ · 13 Tabellen, 78 Funktionen, 2 Karten, 0 Zahlungen.

### ⚠️ Befund: Die Übungs-DB stand bei v2-26 — Produktion bei v2-31

`list_migrations` der Übungs-DB endete mit `v2_26_loeschtor_und_frequenz` (18.08.2026).
**Sieben Schema-Migrationen fehlten** (v2-22 P1, v2-24 P3/P4, v2-28 P3a, v2-29, v2-30,
v2-31); die Spalte `fragments.merchant_key` gab es dort nicht, `get_cards_for_month`
auch nicht. Der erste Testlauf brach mit `42703 column "merchant_key" does not exist`
ab — **eine Probe gegen diesen Stand hätte etwas anderes geprüft, als in Produktion
läuft** (dieselbe Klasse wie die gekürzte Fassung aus v2-25, LL-32).

**Nachgeholt, wortgleich aus den Repo-Dateien, in Reihenfolge:** v2-22 → v2-24 P3 →
v2-24 P4 → v2-28 P3a → v2-31 → v2-29 → v2-30. Die fünf **Daten**-Migrationen aus
v2-27/v2-28 (Karten-Rückdatierung, Pläne 2025, Nachverlinkung) wurden **nicht**
eingespielt — sie arbeiten auf Produktionsdaten, die es dort nicht gibt.

**Danach Prüfsummen gegen Produktion:** 8 der 9 Rechenfunktionen byte-identisch, dazu
`history_match`, `calculate_match_confidence`, `is_card_active_in_month`,
`af_merchant_key`, `refresh_fragment_suggestions`. **Vier Lesefunktionen weichen ab,
obwohl sie aus derselben Repo-Datei kommen:** `get_year_deviation_drivers`
(Übung `513c…`, Prod `bfd1…`), `get_cards_for_month` (`4950…` / `6394…`),
`get_sparrate_series` (`540b…` / `2fa1…`), `merchant_rule_match` (`0aa4…` / `b41b…`).
→ **Die Migrationsdateien im Repo sind für diese vier nicht mehr wortgleich mit
Produktion** (Kommentar-Drift oder nachträgliche Änderung außerhalb des Repos). Für
diese Probe ohne Bedeutung — die neue Funktion ruft nur `is_card_active_in_month`, und
die ist identisch. Nebenbefund fürs Review.

### Baseline-Lauf VOR den beiden Migrationen (zurückgerollt)

| | Ergebnis |
|---|---|
| `history_match(f0, A)` bei Händler nur auf A | **1,00** · B **0,00** |
| `history_match` bei Händler auf A und B | **0,00 / 0,00** — Stufe 1 schweigt, Stufe 2 findet keinen wortgleichen Text |
| Karte C (einmalig Januar) aktiv im Januar / Februar | true / false |
| `merchant_key` von `REWE Frankfurt Bockenheim 100001` | `rewe frankfurt bockenheim` |
| Anker März vor / nach dem Aufbau | 2.200,00 / 2.200,00 |

### Testreihe V (View) — VOR dem Fix, zurückgerollt

`reloptions = null`. Eigentümer: View 3 / Tabelle 3 · **Fremder: View 3 / Tabelle 0** ·
**ohne Session: View 3 / Tabelle 0** · Dienstrolle: 3. **Dasselbe Loch wie auf
Produktion.**

### Beide Migrationen wortgleich eingespielt (`apply_migration`)

`v3_02_mobil_kandidaten` · `v3_02_view_security_invoker`

### Testreihe T1–T7 — NACH den Migrationen, unter `SET LOCAL ROLE authenticated`, zurückgerollt

| | Fall | Erwartung | Ergebnis |
|---|---|---|---|
| T1 | ohne Session | 0 Zeilen, kein Fehler | **0** ✓ |
| T2 | Monat ohne offene Zahlungen (April) | 0 Zeilen | **0** ✓ |
| T3 | Händler auf genau einer Karte, 3 manuelle Links | `[A: 3]` | **`[A: 3]`** ✓ |
| T4 | Händler auf zwei Karten; ein `AUTO_ABSORBED` auf A, ein Übertrag mit demselben Händler | `[A: 3, B: 2]` — Automatik und Übertrag zählen nicht | **`[A: 3, B: 2]`** ✓ |
| T5 | Karte C (einmalig, nur Januar) mit manuellem Link, Monat Februar | C fehlt | **C fehlt** ✓ · Januar liefert `null` (dort ist nichts offen) ✓ |
| T6 | Fremd-Nutzer | 0 Zeilen | **0** ✓ |
| T7 | Konsistenz mit `history_match` | T3: A 1,00 / B 0,00 · T4: schweigt | **1,00 / 0,00 · 0,00 / 0,00** ✓ |
| — | Anker März vor / nach | 2.200,00 | **2.200,00 / 2.200,00** ✓ |

**Plan:** `Function Scan on get_open_fragment_candidates … actual time=5.407 ms, rows=2,
Buffers: shared hit=151` — die SQL-Funktion wird als Ganzes ausgeführt (kein Inlining
sichtbar). Die Laufzeit mit echten Daten wird **auf Produktion** gemessen (Monat mit
offenen Zahlungen, unter der App-Rolle, LL-42).

### Testreihe V — NACH dem Fix, zurückgerollt

`reloptions = [security_invoker=true]`. Eigentümer: View 3 / Tabelle 3 · **Fremder:
View 0** · **ohne Session: View 0** · Dienstrolle: 3. **Das Loch ist zu; der
Eigentümer sieht unverändert alles.**

### Prüfsumme der neuen Funktion auf der Übungs-DB

`get_open_fragment_candidates` → **`c48042ffbb79ea175c63d701a78bc45c`** — muss nach
dem Einspielen auf Produktion identisch sein (Wortgleichheit belegt, nicht zugesichert).

**Rücktausch:** Übungs-DB pausiert 18:40 → Rennrad-Trainer restore 18:44 →
**`ACTIVE_HEALTHY` um 18:52** (geprüft über `get_project`, nicht angenommen).

---

## NACHHER — Produktion, 07.09.2026, 18:48 Uhr, unmittelbar nach dem Einspielen, dieselbe Sitzung

**Freigabe des Users:** 18:44 Uhr („Ja, beide jetzt einspielen"). Eingespielt per
`apply_migration`: `v3_02_mobil_kandidaten`, `v3_02_view_security_invoker` — beide
byte-gleich mit der Probe.

### Sparrate, 24 Monate, Ist und Plan

**Alle 24 Zeilen byte-identisch zur Vorher-Messung.** Ist und Plan, beide Jahre.
Goldlinie 2025 unverändert 11.442,30 €.

### Anker 1 — Ordner-Spalte ergibt die Sparrate

**0,00 € in allen 24 Monaten.** Keine Verletzung.

### Anker 2 — B2-Invariante

**24 von 24 Monaten exakt, größte Abweichung 0,00 €.**

### Prüfsummen

| | Übung | Produktion |
|---|---|---|
| `get_open_fragment_candidates` (neu) | `c48042ffbb79ea175c63d701a78bc45c` | **`c48042ffbb79ea175c63d701a78bc45c`** ✓ |
| `fragments_with_status` `reloptions` | `security_invoker=true` | **`security_invoker=true`** ✓ |
| die neun Rechenfunktionen | — | **alle neun identisch zur Vorher-Messung** ✓ |
| `history_match` · `calculate_match_confidence` · `get_cards_for_month` · `refresh_fragment_suggestions` | — | **identisch zur Vorher-Messung** ✓ |

Produktion führt byte-genau den Code aus, der auf der Übungs-DB grün war.

### Testreihe V auf Produktion — NACH dem Fix

| Rolle | View | Tabelle |
|---|---|---|
| Fremder (`authenticated`, fremde ID) | **0** (vorher 2.219) | 0 |
| Eigentümer (`authenticated`, eigene ID) | **2.219** | 2.219 |
| `get_open_fragment_candidates` als Fremder | **0 Zeilen** | — |

**Das Loch ist zu; für den Eigentümer hat sich nichts geändert.**

### Laufzeit unter der App-Rolle (LL-42), echte Daten

| Monat | offene Zahlungen | Zeilen | Ergebnis |
|---|---|---|---|
| November 2023 | 11 | 0 (keine Karte aktiv) | Funktionsaufruf **13,4 ms** gesamt (2.519 Puffer); der eingebettete Rumpf **3,96 ms** Ausführung, 6,8 ms Planung |
| Juni 2024 | 6 | 0 | — |
| September 2026 | 0 | 0 | — |

**Plan des Rumpfs:** `idx_fragments_user_date` für den Monatsbereich (14 Zeilen),
`idx_fragments_merchant_key_stored` für den Händler-Join (11 Schleifen, 211 Zeilen),
`card_fragment_links_fragment_id_key` je Zeile. **Der Planer schiebt
`is_card_active_in_month` an die Verknüpfungs-Zeilen vor** — der Kopfkommentar der
Migration behauptete „einmal je (Zahlung, Karte)". Das war eine Zusage ohne Messung
(LL-22) und ist im Kommentar korrigiert; der Funktionsrumpf ist unverändert, die
Prüfsumme identisch.

> **Zum Messfehler, der einmal passiert ist:** Der erste Eigentümer-Test lieferte
> View 0 / Tabelle 0 — nicht wegen der View, sondern weil `(select user_id from
> profiles limit 1)` unter `SET LOCAL ROLE authenticated` selbst RLS unterliegt und
> ohne Session leer bleibt. Mit fester Nutzer-ID: 2.219 / 2.219. Wer unter der
> App-Rolle misst, setzt die ID als Literal.

### Wortgleichheit der Migrationsdatei nach der Messung

Der **Kopfkommentar** von `20260907_v3_02_mobil_kandidaten.sql` (außerhalb des
Funktionsrumpfs) wurde nach der Laufzeitmessung um die Planer-Beobachtung korrigiert.
Der Funktionsrumpf — und damit `pg_get_functiondef` — ist davon nicht berührt:
Prüfsumme auf beiden Projekten weiterhin `c48042ff…`.

### Typen und Wrapper

`supabase gen types` neu erzeugt, **Namensmengen verglichen** (nicht der Zeilen-Diff):
nichts verloren, **eine** dazu (`get_open_fragment_candidates`). Kein
`<claude-code-hint>`-Rest. Wrapper `getOpenFragmentCandidates` in `src/lib/rpc.ts`;
`tsc --noEmit` 0 Fehler, ESLint 0 Hinweise.

---

## Anker 3 und Schluss-Messung — 07.09.2026, 20:55 Uhr

**Anker 3 (Anfragen je Aufbau), Edge-Log der letzten 45 Minuten:** 15 Aufbauten von
`/mobil/zuordnen` (je einmal `calculate_sparrate_for_month` und
`get_open_fragment_candidates`), parallel 47 Schreibtisch-Aufbauten
(`get_split_factor` 47). Je Pfad nachgerechnet ergibt `/mobil/zuordnen` **11 Anfragen je
Aufbau** — Anmeldung 1 · `profiles` 1 · `cards` 1 · `fragments_with_status` 4 (Stapel,
verknüpfte Zahlungen, zwei Nachbar-Zähler) · Sparrate 1 · Kandidaten 1 ·
`get_cards_for_month` 1 · `app_config` 1. Der Schreibtisch liegt bei ~18.

**Sparrate am Ende des Sprints (24 Monate, Ist und Plan):** byte-identisch zur
Vorher-Messung von 17:50 Uhr — kein Eingriff dieses Sprints hat eine Zahl bewegt. Die
Benutzung wird es tun, und der Toast zeigt es (Prüfschritt S13).
