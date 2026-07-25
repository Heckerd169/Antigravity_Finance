# V2-Go-Live-Import — Ablaufplan (F7-Umstellungs-Moment)

> **Von:** Zentraler Arbeits-Agent V2 (PM+Architekt)
> **An:** Dominik (Freigabe-Gate)
> **Datum:** 23. Juli 2026
> **Status:** AUSGEFÜHRT am 23.07.2026 (User-Freigabe „Go, alle drei") — 544 Fragmente
> importiert (Giro 307 / Cortal 45 / Visa 192), Counter deckungsgleich mit dem LL-18-Dry-Run;
> 163 INTERNAL_TRANSFER auto-erkannt, 17 ASSET_REALLOCATION manuell markiert, 3 Auto-Absorbs
> (Spotify). Nachträge auf User-Anweisung 23./24.07.: Income-Slots (beide Personen) und
> 19 MONTHLY-Karten auf 2026-01-01 rückdatiert (12 ONCE/ANNUAL bewusst im Mai belassen).
> **2025-Import: AUSGEFÜHRT am 25.07.2026** — 964 Fragmente, Counter deckungsgleich mit §0.1-Prognose (642/58/264, Transfers 100/44/56), 14 AR-Markierungen, Einkommens-Historie 2025 + Partner-Brutto-Korrektur 2026 laut User-Tabelle. Neue Anker siehe CLAUDE.md-Eintrag 25.07.2026.
> **Referenzen:** Beschluss-Nachtrag Mehrkonten F1/F2/F3/F7 · Design-Doku v3.1.3 §11 · Schema-Doku v3.2 §4/§7

---

## 0. Pre-Flight-Befunde (alles read-only verifiziert, 23.07.2026)

### 0.1 Dateien in `import_data/` — alle 6 parsen sauber mit den echten Parsern

| Datei | Format erkannt | Zeilen | Zeitraum | Auto-Transfers | Duplikat-Gruppen im Batch |
|---|---|---|---|---|---|
| DKB Giro 2025 | `DKB` | **642** | 01.01.–31.12.2025 ✓ vollständig | 100 | 1 (2× Irish Pub 27.10.) |
| DKB Giro 2026 | `DKB` | **307** | 01.01.–23.07.2026 (Juli offen) | 81 | 0 |
| DKB Visa 2025 | `DKB_VISA` | **264** | Belegdatum 02.01.–29.12.2025 | 56 (KK-Heuristik) | 8 |
| DKB Visa 2026 | `DKB_VISA` | **192** | Belegdatum 31.12.25–22.07.26 | 49 (KK-Heuristik) | 1 (2× PAYPAL −10 am 11.06.) |
| Cortal 2025 | `CORTAL_CONSORS` | **58** | 06.01.–31.12.2025 ✓ | 44 | 0 |
| Cortal 2026 | `CORTAL_CONSORS` | **45** | 05.01.–20.07.2026 | 33 | 0 |
| **Σ** | | **1.508** | | **363** | 10 Gruppen (à 2×) |

- UTF-8 mit BOM — Parser strippen BOM ✓. Cortal-Header-Anker matcht byte-exakt (inkl. Trailing-Space) ✓. Alle Cortal-Zeilen EUR ✓. 0 „Vorgemerkt"-Zeilen in allen Dateien.
- **Cross-File-Hash-Kollisionen: 0 / 0 / 0** (Giro, Visa, Cortal je 2025↔2026). Der Visa-Grenzfall (Belegdatum 31.12.25 in der 2026-Datei, weil der Export nach Buchungsdatum schneidet) erzeugt in diesen Dateien keine Kollision.
- Duplikat-Hash-Fix ④ greift nachweislich: 10 byte-identische Paare bekommen `|#2` (darunter die Beschluss-Referenz-Zeile 2× PAYPAL −10,00 am 11.06.).
- RPC-Body von `process_csv_import` gegen die Simulation verifiziert: Transfer-Regel zeilen-lokal (`counterparty = ANY(own_ibans)` bzw. Visa-Heuristik `Einzahlung%`/`Ausgleich Kreditkarte%` bei Betrag > 0), Hash `to_char(FM999990.00)`-kompatibel, Auto-Absorb-`link month = date_trunc(transaction_date)`.
- Latenz-Benchmark (read-only, EXPLAIN ANALYZE): ~20.000 Konfidenz-Evaluationen ≈ 31 ms serverseitig → 642-Zeilen-Datei bleibt weit unter jedem Vercel-Timeout. Kein Datei-Splitting nötig.
- Versehentlicher Doppel-Drop derselben Datei ist harmlos (idempotent: alles `skipped`).

### 0.2 DB-Stand (Prod, read-only)

- `profiles.own_ibans` = exakt die 4 Stufe-0-IBANs (Giro DE13…572, Cortal DE84…991, KK-Aufladung DE63…333, KK-Abrechnung DE79…294). Keine der Verbots-IBANs (Visa-Debit DE96…904, Gemeinschaftskonto DE60…948) ✓.
- `fragments` / `card_fragment_links` / `card_monthly_states` / `deleted_entities`: **alle 0** — sauberer Startpunkt, keine Proxy-Links mehr aufzulösen (der Mai-2026-Altbestand wurde am 06.07. gewipet). Der F7-„Re-Import" ist faktisch ein Erst-Import.
- `app_config`-Schwellen: 0.95 / 0.60 / 0.20, Gewichte 0.5 / 0.3 / 0.2 ✓.
- **`income_timeline`: nur 2 Zeilen — ICH + PARTNER, beide `effective_month = 2026-05-01`** (ICH 92.400 / 4.165,11 · PARTNER 63.200 / 3.265,33). Der Sprint-10-Alt-Seed (2025: 36.000/1.800) existiert nicht mehr. → 2025 komplett und Jan–Apr 2026 ohne Income-Basis: Sparrate dieser 16 Monate = NULL (Leer-Zustand).
- **`cards`: 31 Karten, alle `first_active_month = 2026-05`**, je genau 1 Plan-Zeile (2026-05). 20 wiederkehrende (15 FIXED_COST + 3 BUDGET + 2 INCOME), 11 ONCE-Karten (Mai 2026).
- Monats-Navigation: MIN 1900-01 — 2025er-Monate sind erreichbar ✓.
- `get_split_factor`: bruttobasiert mit Forward-Inheritance **pro Person**; fehlt PARTNER-Slot für einen Monat → Faktor 1.0 (ICH trägt GEMEINSAM zu 100 %).

### 0.3 Struktur-Erkenntnis mit Sequenz-Folge

Der Distiller-Confidence-Loop läuft **nur beim INSERT** und filtert vorab auf `is_card_active_in_month(karte, fragment-monat)`. Fragmente aus Monaten ohne aktive Karten bekommen **nie** Vorschläge/Auto-Absorption — auch nicht durch späteren Re-Import (Duplikate durchlaufen den Loop nicht). **Konsequenz: Income-Backfill und Karten-Rückdatierung müssen VOR dem Import passieren**, sonst ist für 2025 + Jan–Apr 2026 nur manuelles Verlinken möglich.

---

## 1. Entscheidungen VOR Freigabe (LL-13 — bitte je einzeln beantworten)

### E1 — Granularität: Jahres-Dateien statt „monatsweise"

Der F7-Beschluss formuliert „Ganzjahres-Import (monatsweise)". Gezogen wurden 6 **Jahres-Dateien**. Die Duplikat-Hash-Bedingung verlangt nur, dass kein Monat über zwei Batches gesplittet wird — eine Jahres-Datei erfüllt das *stärker* als 12 Monats-Dateien (und der Grenzfall „Visa-Belegdatum am Jahresschnitt" ist empirisch kollisionsfrei).
**Empfehlung: Jahres-Dateien freigeben** (6 Drops statt ~40, technisch überlegen). ☐ Ja ☐ Nein, doch monatsweise

### E2 — Income-Backfill (Werte von dir; SQL von mir; Ausführung durch dich)

Beobachtete ICH-Netto-Reihe aus dem Giro („Lohn-/Gehaltzahlung"):

| ab Monat | Netto | | ab Monat | Netto |
|---|---|---|---|---|
| 2025-01 | 4.022,58 | | 2025-05 | 4.070,52 |
| 2025-02 | 4.022,56 | | 2025-07 | 4.034,60 |
| 2025-03 | 4.070,52 | | 2025-08 | 4.006,87 |
| 2025-04 | 4.119,66 | | 2026-01 | 4.165,11 ✓ (= bestehender Mai-Slot) |

Zu liefern von dir:
- **ICH:** Fidelity-Wahl (a: monatsgenau = 7 Slots 2025 + 1 Slot 2026-01, empfohlen; b: vereinfacht 1–2 Slots) + zugehörige **Brutto**-Jahreswerte (für den Split-Faktor; nur du kennst sie).
- **PARTNER (Aline):** Brutto + Netto ab 2025-01 (und Änderungspunkte bis 2026-04) — ohne sie rechnet `get_split_factor` in 2025 mit Faktor 1.0, d. h. GEMEINSAM-Karten voll auf dich.
- Mechanik: Income-Popup hat Past-Month-Sperre → Backfill ist DML. Ich bereite die INSERTs (append-only-Slots, `onConflict`-sicher) vor, **du führst sie im Supabase-SQL-Editor aus** (Zwei-Personen-Prinzip, wie Stufe 0). Bestehende Slots (2026-05) bleiben unberührt.

### E3 — Karten-Rückdatierung (Scope-Entscheidung + Alt-Werte von dir)

Damit Distiller + UI die 16 Alt-Monate bedienen können: `first_active_month` der **20 wiederkehrenden Karten** auf den echten Beginn zurücksetzen (typisch 2025-01) + für Karten mit abweichenden Alt-Beträgen zusätzliche `card_planned_timeline`-Slots (append-only, z. B. Miete 2025, alte Abo-Preise).
- **Achtung ANNUAL-Zyklus:** `Reisekrankenversicherung - DKV` (ANNUAL, first_active 2026-05) — Rückdatierung bestimmt den Fälligkeitsmonat. Wenn 2025 auch Mai fällig war → `2025-05`, nicht 2025-01.
- ONCE-Karten (11×) bleiben Mai 2026.
- Zu liefern von dir: je Karte „gab es die 2025 schon? seit wann? Betrag damals (falls anders)?" — ich baue daraus die UPDATE-/INSERT-SQL, du führst aus.
- Neue 2025-Phänomene ohne heutige Karte (z. B. Aline-Zahlungen aus dem Topf, Jan 2025: −292,53 Autoversicherung, −940,75 Flug Japan) entstehen **nach** dem Import regulär per Fragment-Drop auf Empty-Slot in der jeweiligen Monatsansicht — kein DML.
- Minimal-Variante möglich (nur Rückdatierung, keine Alt-Beträge): Realität überschreibt bei FIXED/INCOME ohnehin (§4.3); Plan-Genauigkeit betrifft dann nur Plan-Sparrate/Welle-Grau und BUDGET-Soll der Alt-Monate.

### E4 — ASSET_REALLOCATION-Scope (F3; 26 Kandidaten identifiziert)

| Gruppe | Zeilen | Beschluss-Lage | Empfehlung |
|---|---|---|---|
| A. Scalable→Giro-Eingänge (bleiben sonst UNASSIGNED): 2025-10-07 +1,00 · 2025-10-14 +2.413,08 · 2026-03-05 +2,67 · 2026-03-09 +5.533,80 · 2026-05-04 +2.722,15 | 5 | F3 ✓ | AR markieren |
| B. Giro↔Cortal „Übertrag Scalable"-Glieder (werden auto-INTERNAL_TRANSFER): −2.400/+2.400 (10/25) · −5.533,80/+5.533,80 (03/26) · −2.700/+2.700 (05/26) | 6 | F3 nennt exakt diese | IT→AR umtypen |
| C. **Coinbase-Überweisungen aus dem Topf** (7× 2025 inkl. +4.000-Rückläufer, 4× 2026; netto −20.500) | 11 | **Beschluss-Lücke** — F3 regelt nur Scalable; „Topf→Broker symmetrisch" spricht dafür | AR markieren — **deine Bestätigung nötig** |
| D. Effekten-Sparpläne Cortal→Depot (04–07/2026, 3× −500 + 1× −1.000) | 4 | F1: topf-intern = neutral | AR markieren (räumt Stack auf) — Alternativ: UNASSIGNED lassen |

Bewusst **kein** AR (bleiben Rohmasse): Zins/Abschluss/Steuer Cortal (9 Zeilen — F1: Kapitalerträge zählen nicht), Gehälter (18), Visa-Erstattungen (5), Aline-Zahlungen (2 = echte Ausgaben → E3).
Alle Markierungen machst **du** nach dem Import per Interim-Button (v2-04); ich liefere die klickbare Liste mit Datum/Betrag/Beschreibung.

### E5 — Kenntnisnahme Teil-Monat Juli 2026

Schnitt 23.07.: Juli ist als laufender Monat naturgemäß unvollständig (Gehalt kommt ~27.07.; 1 Visa-Einzahlung hat ihr Giro-Bein noch nicht). **Folgeregel ab jetzt:** Komplettierung ausschließlich über vollständige Monats- (oder erneute Jahres-)Exporte — nie disjunkte „Rest-Zeiträume" (Duplikat-Hash-Grenze). Re-Import über Bestehendes ist idempotent. Und: pro Monat immer **alle drei Konten** zeitnah zusammen importieren, sonst hängt die Sparrate schief (KK-Aufladung neutralisiert, echte KK-Käufe fehlen).

---

## 2. Ablauf nach Freigabe

**Reihenfolge ist zwingend: Phase 1 vor Phase 2** (Begründung §0.3). Innerhalb Phase 2 ist die Datei-Reihenfolge technisch frei (Transfer-Markierung zeilen-lokal, keine Cross-File-Abhängigkeit).

| Phase | Inhalt | Wer |
|---|---|---|
| **1. Vorbereitungs-DML** | Income-Slots (E2) + Karten-Rückdatierung/Alt-Pläne (E3) — SQL vorbereitet von mir, Review + Ausführung durch dich im Supabase-SQL-Editor. Danach verifiziere ich read-only (Slot-Liste, Kartentabelle). | Ich → **Du** |
| **2. Portal-Drops** (eine Sitzung) | Je Datei: Drop → „Import erfolgreich" abwarten → nächste. Empfohlene Reihenfolge: Cortal 2025 → Cortal 2026 → Visa 2025 → Visa 2026 → Giro 2025 → Giro 2026 (klein validiert Pipeline, groß danach). Browser-Konsole offen lassen (Detail-Counter pro Datei als Bonus-Beleg; DB-Verifikation ist ohnehin autoritativ). Angezeigter Monat ist egal. | **Du** |
| **3. Read-only-Verifikation** | Siehe Katalog §3. Ergebnis als Verifikations-Report. | Ich |
| **4. Manuelle Nacharbeit in der App** | (a) AR-Markierungen nach E4-Liste (Interim-Button) · (b) Distiller-Vorschläge sichten, Fragmente droppen, 2025-ONCE-Karten per Empty-Slot anlegen — monatsweise durchgehen · (c) Auto-Absorb-Review anhand meiner Liste (Fehlgriffe ejecten). | **Du** (Listen von mir) |
| **5. Abschluss** | Erneute Sparraten-Tabelle 2025-01…2026-07 als Referenz-Snapshot im Repo · Doku-Nachzug patch-basiert (LL-16): CLAUDE.md-Protokoll-Eintrag Go-Live-Import; Beschluss-Nachtrag um E4-C-Entscheid (Coinbase) ergänzen. | Ich (docs-maintainer) |

### Erwartungswerte je Drop (Erst-Import, leere DB)

| Datei | inserted | skipped | iban_backfilled | internal_transfers | links_removed | vorgemerkt |
|---|---|---|---|---|---|---|
| Cortal 2025 | 58 | 0 | 0 | 44 | 0 | 0 |
| Cortal 2026 | 45 | 0 | 0 | 33 | 0 | 0 |
| Visa 2025 | 264 | 0 | 0 | 56 | 0 | 0 |
| Visa 2026 | 192 | 0 | 0 | 49 | 0 | 0 |
| Giro 2025 | 642 | 0 | 0 | 100 | 0 | 0 |
| Giro 2026 | 307 | 0 | 0 | 81 | 0 | 0 |

`auto_absorbed` ist ex ante nicht exakt vorhersagbar (Konfidenz-abhängig) — Plausibilitäts-Review in Phase 3/4. Jede Abweichung bei den anderen Countern ist ein Stopp-Signal: melden, nicht weiterdroppen.

## 3. Verifikations-Katalog Phase 3 (read-only, durch mich)

1. **Bestand:** `fragments` gesamt = 1.508; Zeilen-Zahl pro Monat = Summe der drei Konten-Histogramme (liegt aus dem Pre-Flight je Monat vor).
2. **Transfers:** `transfer_type='INTERNAL_TRANSFER'` gesamt = 363; KK-Spiegel pro Monat (Giro-seitige DE63/DE79-Beträge ≙ Visa-Einzahlungen — Pre-Flight-Tabelle liegt vor, Juli-Schnitt-Toleranz +172,60).
3. **Duplikat-Fix:** genau 10 Paare mit identischem (Datum, Betrag, Beschreibung) und **2 verschiedenen** Hashes; 0 verschluckte Zeilen.
4. **Invariante OQ-B:** 0 Links auf Fragmente mit `transfer_type IS NOT NULL`.
5. **Distiller:** Liste aller AUTO_ABSORBED-Links (Fragment ↔ Karte ↔ Monat ↔ Score) → Review-Tabelle; Anzahl Badge-Vorschläge.
6. **Status-View:** Zählung UNASSIGNED / ASSIGNED / AUTO_ABSORBED / INTERNAL_TRANSFER konsistent.
7. **Sparraten-Tabelle:** `calculate_sparrate_for_month` + `calculate_planned_sparrate_for_month` für 2025-01…2026-07 (19 Monate) mit Plausibilisierung gegen Netto − Plan-Ausgaben; Auffälligkeiten annotiert.
8. **Gemeinschaftskonto-Probe (F2):** 0 Transfer-Markierungen auf DE60…948-Zeilen (169 Zeilen bleiben Ausgaben-Rohmasse).

## 4. Bewusste Folgen (keine Bugs)

- Dauerhaft unzugeordnete Fragmente nach Abschluss (~40–50: Gehälter, Zins/Steuer, Erstattungen …) — F1/F4-konform neutral; „N Fragmente offen"-Flanke zählt sie. UX-Aufräumen (eigener Reiter o. ä.) bleibt V8''-Vormerkung.
- Erstattungs-Blindfleck (Beschluss-Randnotiz) bleibt offen — eigenes Thema nach Go-Live.
- Sparraten der Alt-Monate entstehen mit diesem Schritt erstmals „echt"; der alte Test-Anker 2.910,01 ist seit dem Wipe vom 06.07. gegenstandslos. Neuer Referenz-Snapshot = Phase-5-Tabelle.

---

*Kein Portal-Drop, kein DML, keine Markierung vor deiner Freigabe von E1–E5. — Arbeits-Agent V2, 23.07.2026*
