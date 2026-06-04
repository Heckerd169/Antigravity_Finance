# Sprint 9 — Cortal-Consors-Parser + Cross-Account-Transfer-Erkennung

> **Adressiert an:** Claude Code (Implementierungs-Chat)
> **Vom:** PM-Chat Sprint 9
> **Datum:** 24. Mai 2026
> **Test-User:** `179cd2c1-bbc2-4fd0-954b-8735eb90f370`

---

## 0. Sprint-Ziel — eine Zeile

CSV-Import-Pipeline um Cortal-Consors-Format erweitern, DKB-Parser um Gegen-IBAN ergänzen, Cross-Account-Bewegungen zwischen eigenen Konten als `INTERNAL_TRANSFER` sichtbar machen.

---

## 1. Scope

### In Scope

| # | Lieferung |
|---|---|
| L1 | DKB-Parser-Erweiterung um `counterparty_iban` (Spalte 8 der DKB-CSV) |
| L2 | Cortal-Consors-Parser (eigenes Modul) inkl. Format-Erkennung, deutsche Zahl-/Datumsformate, Wertpapier-/n/a-IBAN-Edge-Cases |
| L3 | Format-Router im Frontend: erkennt DKB vs. Cortal vs. unbekannt, ruft passenden Parser, gibt `p_format_hint` an RPC |
| L4 | RPC-Verkabelung-Update: `process_csv_import` mit Signatur `(p_rows, p_format_hint)`, Zeilen tragen `counterparty_iban` |
| L5 | UI: `INTERNAL_TRANSFER`-Fragmente im Stack gedimmt + Badge „Transfer" (V1-Variante) |
| L6 | UI: Backfill-Report-Toast nach Re-Import (sichtbar, wenn mind. ein Counter > 0) |
| L7 | Design-Doku-Patches §11 (Cortal-Adapter, INTERNAL_TRANSFER-Status) + §10 (Stack-Rendering-Regel) als Patch-Datei |

### Out of Scope (V2-Vormerkungen)

| # | Verschoben |
|---|---|
| V8'' | V2-Web-App: `INTERNAL_TRANSFER`-Fragmente komplett aus Stack ausblenden (eigener Reiter / Settings-Toggle) |
| V3'' | Karten-spezifische Badge-Farbe (Sprint-8-OQ1-Vormerkung) |
| V4'' | Soft-Delete-Pattern Karten |
| V5'' | Sparraten-Treppe |
| V6'' | Schema-Doku v3 → v3.1 — Architekten-Pflege-Turn, nicht Claude Code |
| V7'' | Defense-in-Depth-Patch `calculate_card_amount_for_month` — Architekten-Pflege-Turn |
| (offen) | IBAN-Verwaltung-UI (User stellt eigene IBANs selbst ein) — Sprint-10+-Kandidat |
| (offen) | Mehr-als-zwei-Bank-Formate, IBAN-Format-Validierung in DB, Spiegel-Paar-Verlinkung (`paired_fragment_id`) |

---

## 2. Architekten-Vorbedingung — Stufe 1 LIVE seit 24.05.2026

Schema-Erweiterung + RPC-V3 live, §4.6-Anker stabil bei `2910.01` (3× verifiziert). Sandbox 10/10 TCs grün.

**Neue Schema-Felder:**
- `profiles.own_ibans text[]` — bestückt für Test-User mit `{DE13120300001051422572, DE84760300800853562991}`
- `fragments.counterparty_iban text NULL`
- `fragments.transfer_type text NULL` (CHECK: NULL oder `'INTERNAL_TRANSFER'`)

**Neue RPC-Signatur:**

```sql
process_csv_import(
  p_rows jsonb,
  p_format_hint text DEFAULT 'DKB'
) RETURNS jsonb
```

`p_rows`-Zeilen jetzt um optionales Feld erweitert:

```json
{
  "transaction_date": "2026-05-18",
  "amount": -100.00,
  "description": "DOMINIK HECKER | ECHTZEIT EURO-UEBERW. | Ausgleich DKB",
  "counterparty_iban": "DE13120300001051422572"
}
```

`counterparty_iban` darf `null` sein (unbekannt / nicht in CSV vorhanden).

**Return-Schema erweitert um vier Felder:**

```json
{
  "inserted_count": 12,
  "skipped_duplicates_count": 30,
  "auto_absorbed_count": 0,
  "fragment_ids": [...],
  "iban_backfilled_count": 30,
  "internal_transfers_count": 3,
  "links_removed_for_transfers_count": 0
}
```

**Hash-Determinismus:** `counterparty_iban` ist **nicht** Hash-Bestandteil (gewollt, damit Re-Import bestehende Hashes trifft und `counterparty_iban` per `ON CONFLICT DO UPDATE` nachträglich gefüllt wird). Hash bleibt V2-Formel über `(date, amount, description)`.

**View `fragments_with_status`:**
- Erweitert um Spalten `counterparty_iban` und `transfer_type` (am Ende — bestehende Konsumenten lesen per Spaltennamen, unbetroffen)
- Neuer `status`-Wert `'INTERNAL_TRANSFER'` — höchste Priorität, schlägt alle anderen Stati

**Bei Auffälligkeiten gegen Stufe-1-Spec während Sprint-9-Implementation: Stopp, PM informieren.**

---

## 3. Cortal-Consors-CSV-Format — Parser-Spec

### Format-Erkennung (Heuristik)

CSV gilt als Cortal-Consors-Format, wenn alle drei Bedingungen erfüllt sind:

1. Datei-Encoding ist UTF-8 (mit oder ohne BOM)
2. Separator ist `;` (Semikolon)
3. Eine der ersten 12 Zeilen ist exakt `Buchung ;Valuta;Sender / Empfänger;IBAN;BIC;Buchungstext;Verwendungszweck;Kategorie;Stichwörter;Umsatz geteilt;Betrag;Währung` (Header-Anker — Achtung: `Buchung ` mit Trailing-Space, im Original so)

Wenn nicht erfüllt: Format-Router prüft DKB-Heuristik (Sprint 8); wenn auch DKB fehlschlägt → `error-format`.

### CSV-Struktur (verbindlich, beobachtet aus echtem Sample)

Cortal-Export hat 10 Vor-Header-Zeilen, gefolgt von der Header-Zeile und Datenzeilen ab Zeile 12:

```
Konto;Inhaber;Exportdatum                              ← Zeile 1
{Konto-Nr};{Inhaber};{Exportdatum DD.MM.YYYY, HH:MM:SS}
                                                       ← Zeile 3 leer
Allgemeine Informationen
Konto;Inhaber;Exportdatum                              ← Wiederholung
{Konto-Nr};{Inhaber};{Exportdatum}
Kontostand
Saldo;Währung für Saldo;Datum;max. Verfügungsrahmen;Währung für max. Verfügungsrahmen
{Saldo};EUR;{Datum};{max. Verfügung};EUR
Kontoumsätze                                           ← Zeile 10
Buchung ;Valuta;Sender / Empfänger;IBAN;BIC;...        ← Zeile 11 (Header)
{Datenzeilen ab hier}
```

Parser-Anker: Suche die Header-Zeile (siehe Format-Erkennung Bedingung 3), Datenzeilen folgen ab der Zeile danach.

**Werte sind nicht in Anführungszeichen** (Unterschied zu DKB).

### Feld-Mapping pro Datenzeile

| Spalte | CSV-Feld | Ziel | Transformation |
|---|---|---|---|
| 1 | `Buchung` (`DD.MM.YYYY`) | `transaction_date` | → ISO `YYYY-MM-DD`; volle 4-stellige Jahreszahl, kein YY-Window nötig |
| 4 | `IBAN` | `counterparty_iban` | Bei `n/a` oder leer → `NULL`; sonst String byte-exakt |
| 11 | `Betrag` (`-1.940,00` / `2.700,00`) | `amount` | Tausender-`.` entfernen, Dezimal-`,` → `.`, parse als numeric mit zwei Nachkommastellen |
| 12 | `Währung` | (Validierung) | Muss `EUR` sein, sonst Korrupt-Fehler |
| 3+6+7 | `Sender / Empfänger` + `Buchungstext` + `Verwendungszweck` | `description` | `"{Sender_Empfänger} \| {Buchungstext} \| {Verwendungszweck}"` — byte-exakt, ohne Trimming, ohne Normalisierung. Drei Pipe-Separator mit Spaces |

**§11-Adapter (Cortal-Format, DD-approved):**
> `description_raw` wird gebildet als `"{Sender / Empfänger} | {Buchungstext} | {Verwendungszweck}"` — alle drei Felder byte-exakt aus der CSV-Quelle, ohne Trimming, ohne Normalisierung. Pipe-Separator mit Spaces als Trenner. `n/a`-Werte werden als Literal `"n/a"` belassen (kein NULL für Description-Bestandteile). Hash-Determinismus bleibt erhalten.

Diesen Satz in Design-Doku §11 unter „Hash-Algorithmus" als zweiten Bank-Adapter-Block aufnehmen (DKB-Adapter aus Sprint 8 bleibt unberührt).

### Fehler-Klassifikation (Cortal)

Identische Klassen wie DKB (Sprint 8) — `error-format`, `error-empty`, `error-corrupt`. Zusätzlicher Korrupt-Trigger: nicht-EUR-Währung in Spalte 12.

---

## 4. DKB-Parser-Erweiterung (P0)

Bestehender DKB-Parser bleibt strukturell unverändert. Drei Anpassungen:

| Aspekt | Änderung |
|---|---|
| Feld-Extraktion | Spalte 8 (`IBAN`) wird zusätzlich gelesen |
| Ausgabe-Schema | `counterparty_iban` wird in jedes `p_rows`-Element aufgenommen — leerer String `""` → `NULL` |
| Hash-Determinismus | Unverändert — `counterparty_iban` ist nicht Hash-Bestandteil (siehe §2) |

Bestehende DKB-CSV-Re-Imports nach P0 triggern den `ON CONFLICT DO UPDATE`-Pfad des RPC und füllen `counterparty_iban` für vorhandene Fragmente nach.

---

## 5. Frontend-Pipeline + Format-Router (P1–P3)

```
File ausgewählt / gedroppt
  ↓
Portal-State → 'processing'
  ↓
Datei lesen als UTF-8 Text
  ↓
Format-Router:
  → Cortal-Heuristik (§3) passt? → Cortal-Parser, p_format_hint = 'CORTAL_CONSORS'
  → DKB-Heuristik (Sprint 8) passt? → DKB-Parser, p_format_hint = 'DKB'
  → keines passt? → Portal-State 'error-format'
  ↓
Parser-Ausgabe → Array von { transaction_date, amount, description, counterparty_iban }
  → 0 Zeilen → Portal-State 'error-empty'
  → Parse-Exception → Portal-State 'error-corrupt'
  ↓
RPC-Call: process_csv_import(p_rows, p_format_hint)
  → Exception → Portal-State 'error-corrupt'
  ↓
Return-Schema-Auswertung → ggf. Backfill-Toast (§6.2)
  ↓
Portal-State → 'success' (1.5 s)
  ↓
Fragment-Stack-Refetch
  ↓
Portal-State → 'default'
```

**Wichtig:** Cortal-Heuristik VOR DKB-Heuristik prüfen — beide nutzen `;`-Separator, aber Cortal hat keine Anführungszeichen und einen distinkten Header. Reihenfolge stabilisiert Erkennung.

---

## 6. UI — INTERNAL_TRANSFER-Darstellung + Backfill-Toast (P4)

### 6.1 Fragment-Stack-Rendering `INTERNAL_TRANSFER`

V1-Variante (b) — minimalinvasiv, konsistent mit `MANUAL_DROP`-Pattern aus Sprint 7:

| Aspekt | Wert |
|---|---|
| Render-Bedingung | `fragments_with_status.status === 'INTERNAL_TRANSFER'` |
| Opacity | `0.45` (gedimmt — analog Sprint-7-DROP-Fragmente) |
| Badge-Text | `TRANSFER` (uppercase) |
| Badge-Typographie | `7.5px`, `font-weight: 600`, letter-spacing wie KI-Vorschlag-Badge |
| Badge-Farbe | `rgba(140, 140, 140, .5)` — neutrales Grau-Soft (bewusst nicht Yellow-Soft des KI-Vorschlag-Badges, damit visuell unterscheidbar) |
| Badge-Position | Rechts neben Betrag in Fragment-Card-Top-Row (gleiche Position wie KI-Vorschlag-Badge) |
| Tap-Verhalten | Kein interaktiver Effekt. Cursor `default`. Tap öffnet keinen Drop-/Karten-Dialog. |
| Status-Priorität | `INTERNAL_TRANSFER` schlägt `SUGGESTED`, `AUTO_ABSORBED`, `MANUAL_DROP`, `UNATTRIBUTED`. Ein gelinktes Fragment kann nach Transfer-Reklassifikation nicht gleichzeitig gelinkt erscheinen — Daten-Invariante stellt das sicher (OQ-B Variante ii in Stufe 1). |

**Doku-Patch §10:**
> Fragment-Status `INTERNAL_TRANSFER` rendert das Fragment mit Opacity 0.45, Badge „TRANSFER" in Grau-Soft, kein Tap-Verhalten. Dieser Status schlägt alle anderen Stati.

### 6.2 Backfill-Report-Toast

| Aspekt | Wert |
|---|---|
| Render-Bedingung | Mindestens eines von `iban_backfilled_count`, `internal_transfers_count`, `links_removed_for_transfers_count` ist > 0 |
| Position | Direkt unter dem Portal (Drop-Zone). Der Toast ist Quittung der Import-Aktion und damit Pipeline-Feedback — Nähe zum auslösenden Element |
| Inhalt | Drei Kurz-Sätze, untereinander, nur die Counter, die > 0 sind:<br>• `N Fragmente mit IBAN ergänzt`<br>• `M Bewegungen als Transfer erkannt`<br>• `K Karten-Zuordnungen gelöst` |
| Sichtbarkeit | 4 s, dann Fade-Out (analog Portal-Success-Timing) |
| Stil | Soft Card mit Subtext-Typographie, keine Interaktion |
| Mehrfach-Imports | Bei sukzessivem Re-Import: jeder Toast zeigt nur die Counter des aktuellen Imports, nicht kumulativ |

---

## 7. Phasen + Commits

LL-14 (Multi-Komponenten sequenziell, eigene Commits):

| Phase | Inhalt | Commit-Message |
|---|---|---|
| P0 | DKB-Parser-Erweiterung um `counterparty_iban` (L1) | `sprint-9 p0: dkb parser extracts counterparty iban` |
| P1 | Cortal-Parser-Modul (L2) | `sprint-9 p1: cortal-consors csv parser with format detection` |
| P2 | Format-Router (L3) | `sprint-9 p2: csv format router routes to dkb or cortal parser` |
| P3 | RPC-Verkabelung Update (L4) | `sprint-9 p3: wire process_csv_import v3 with format hint and counterparty iban` |
| P4 | UI INTERNAL_TRANSFER-Stack + Backfill-Toast (L5 + L6) | `sprint-9 p4: render internal transfer fragments dimmed with badge and backfill toast` |

Jeder Phase: eigener Commit, eigener Push, eigener Smoke-Check.

---

## 8. Smoke-Plan

### Test-Daten-Realitätscheck (per 24.05.2026)

| Karte | Mai-Relevanz | Erwartung im Sprint-9-Smoke |
|---|---|---|
| Miete | aktiv | keine Auto-Absorbs, kein Transfer-Effekt |
| Netflix | aktiv | dito |
| Steuerrückzahlung | März-only | unberührt — §4.6-Anker stabil |
| Tanken | aktiv | unverändert |
| Hobby | aktiv | unverändert |
| Auswärts Essen | aktiv | unverändert |
| Nebenjob | aktiv | unverändert |

Plus: Im DB-State existiert ein ARAL-Test-Fragment (`imported_at = 2026-05-23 07:56 UTC`) aus zwischenzeitlichem Frontend-Test (Architekten-Beifang-Hinweis). Unverlinkt, kein Cleanup nötig — bleibt im Stack sichtbar, unverändert.

**`own_ibans`-Stand:** `{DE13120300001051422572, DE84760300800853562991}` (DKB-Giro + Cortal). Damit greifen Cross-Account-Markierungen bei beiden Importen.

### S1 — P0 DKB-Parser-Erweiterung (Unit/Integration)

| # | Input | Erwartung |
|---|---|---|
| S1.1 | Echte DKB-CSV (Sample `22-05-2026_Umsatzliste_Girokonto_DE13...DKB.csv`), parsen | `counterparty_iban` pro Zeile gesetzt; leere Werte als `null` |
| S1.2 | DKB-CSV-Zeile mit Spalte-8 leer | `counterparty_iban === null` |
| S1.3 | Hash für eine Beispielzeile vergleichen vor/nach P0 | Hash identisch (counterparty_iban nicht im Hash) |

### S2 — P1 Cortal-Parser-Modul (Unit/Integration)

| # | Input | Erwartung |
|---|---|---|
| S2.1 | Echte Cortal-CSV (Sample `Umsatzu_bersicht_853562991_Cortal_Consors.csv`), parsen | 8 Datenzeilen geparst, alle Felder konsistent, `counterparty_iban` korrekt extrahiert |
| S2.2 | Cortal-Zeile mit IBAN `n/a` (Effekten/Wertpapierkauf) | `counterparty_iban === null`, Description als `"n/a \| Effekten \| SPARPLAN ..."` byte-exakt |
| S2.3 | Cortal-CSV mit nicht-EUR-Währung in einer Zeile | Klasse `corrupt`, kein partielles Ergebnis |
| S2.4 | DKB-Datei dem Cortal-Parser zuwerfen | Format-Erkennung schlägt fehl — Parser-Modul gibt Format-Fehler zurück (Router wirft es nicht an Cortal) |
| S2.5 | JSON-Datei dem Format-Router zuwerfen | Klasse `format` |

### S3 — P2 Format-Router

| # | Setup | Aktion | Erwartung |
|---|---|---|---|
| S3.1 | leerer State | DKB-CSV droppen | Router wählt DKB, p_format_hint = 'DKB' |
| S3.2 | leerer State | Cortal-CSV droppen | Router wählt Cortal, p_format_hint = 'CORTAL_CONSORS' |
| S3.3 | leerer State | Unbekanntes CSV droppen | Portal-State `error-format` |

### S4 — P3 End-to-End mit echten CSVs

| # | Setup | Aktion | Erwartung |
|---|---|---|---|
| S4.1 | DB-State mit bestehenden Mai-DKB-Fragmenten (aus Sprint-8-Smoke, ohne `counterparty_iban`) | DKB-CSV erneut droppen | `iban_backfilled_count > 0`; bestehende Fragmente bekommen `counterparty_iban`; `internal_transfers_count >= 2` (mind. `Cortal Consors Sparen 04/26` -1.940 € + `Cortal Consors Übertrag Scalable 05/26` -2.700 €); `inserted_count = 0` |
| S4.2 | nach S4.1 | Cortal-CSV droppen | Neue Cortal-Fragmente; alle Zeilen mit Sender = DOMINIK HECKER + IBAN = DE13... werden als `INTERNAL_TRANSFER` markiert (mind. die drei Cross-Account-Echos); Effekten/Wertpapier-Zeile bleibt normales Fragment |
| S4.3 | nach S4.2 | Cortal-CSV nochmal droppen | `inserted_count = 0`, `skipped_duplicates_count = N`, `iban_backfilled_count = 0`, kein Toast |
| S4.4 | nach S4.3 | Fragment-Stack visuell prüfen | Cross-Account-Bewegungen gedimmt mit `TRANSFER`-Badge, Tap zeigt kein Verhalten |

### S5 — P4 UI-Smoke

| # | Setup | Aktion | Erwartung |
|---|---|---|---|
| S5.1 | nach S4.2 | Hover/Tap auf TRANSFER-Fragment | Cursor `default`, keine State-Änderung |
| S5.2 | direkt nach S4.1-Import-Abschluss | Backfill-Toast sichtbar | Drei Counter-Zeilen (`N Fragmente mit IBAN ergänzt`, `M Bewegungen als Transfer erkannt`, ggf. `K Karten-Zuordnungen gelöst`), Fade nach 4 s |
| S5.3 | Toast nach 4 s | Fragment-Stack | Toast weg, Stack-Status unverändert |

### S6 — §4.6-Anker-Schutz (nicht verhandelbar)

| # | Aktion | Erwartung |
|---|---|---|
| S6.1 | NACH allen anderen Smoke-Schritten | `calculate_sparrate_for_month('179cd2c1-...', '2026-03-01') = 2910.01` |

Wenn S6.1 fehlschlägt: Investigation, kein Merge.

---

## 9. Offene Fragen (OQs) — vor Implementation klären

| # | Frage | PM-Vorschlag |
|---|---|---|
| OQ1 | Cortal-Description-Adapter: drei Felder mit Pipe-Separator `Sender \| Buchungstext \| Verwendungszweck`? | Ja, byte-exakt, `n/a`-Literal belassen (siehe §3 Adapter-Block) |
| OQ2 | Nicht-EUR-Währung in Cortal-Spalte 12 — wie behandeln? | `error-corrupt` (gesamter Import verworfen). Cross-Currency ist out of scope für V1 |
| OQ3 | Backfill-Toast-Position | **Entschieden:** Direkt unter dem Portal (Drop-Zone). Toast ist Pipeline-Feedback, kein Stack-Inhalt — Nähe zum auslösenden Element |
| OQ4 | Cortal-Header hat `Buchung ` mit Trailing-Space — Erkennung trim-tolerant oder strikt? | Strikt (byte-exakter Match auf Header-Zeile inkl. Trailing-Space). Falls Cortal das Format jemals ändert, ist neu zu spec'en — V2-Vormerkung |

---

## 10. Was explizit NICHT

- Keine Cortal-spezifische Karten-Matcher-Logik — Confidence-Loop läuft bank-agnostisch
- Keine Spiegel-Paar-Verlinkung (`paired_fragment_id`) — Single-Side-Markierung reicht
- Keine UI für `own_ibans`-Verwaltung — User-IBAN-Pflege via DB-Update (Sprint-10+-Kandidat)
- Kein Cleanup des ARAL-Test-Fragments aus Stufe-1-Beifang
- Keine Schema-Doku-Patches durch Claude Code (V6'' macht Architekt im Pflege-Turn)
- Kein Defense-in-Depth-Patch `calculate_card_amount_for_month` (V7'' macht Architekt)
- Keine drittes Bank-Format

---

## 11. Akzeptanz-Kriterien

Sprint-9-Merge nur, wenn:

| # | Kriterium |
|---|---|
| AC1 | Alle Phasen P0–P4 committed, Build grün |
| AC2 | S1.1–S1.3, S2.1–S2.5, S3.1–S3.3, S4.1–S4.4, S5.1–S5.3 alle grün |
| AC3 | S6.1 grün — §4.6-Anker = `2910.01` |
| AC4 | Im echten Test-User-State: nach DKB-Re-Import + Cortal-Erst-Import sind die drei Cross-Account-Bewegungen (`Cortal Consors Sparen 04/26`, `Cortal Consors Übertrag Scalable 05/26`, `Ausgleich DKB`) auf BEIDEN Seiten als `INTERNAL_TRANSFER` markiert (6 Fragmente total: 3 DKB-Seite + 3 Cortal-Seite) |
| AC5 | Design-Doku §11 (Cortal-Adapter) + §10 (Stack-Rendering INTERNAL_TRANSFER) als Patch-Datei `sprints/sprint_09_doku_patches.md` ausgeliefert (LL-16) |
| AC6 | CLAUDE.md §10 Sprint-9-Block + §7 LL-update (falls neue Lesson) als Patch-Vorschlag |

---

## 12. Modell-Empfehlung Claude-Code

**Opus 4.7.** Multi-Parser-Architektur + Format-Router + Hash-Determinismus-Sensibilität (counterparty_iban nicht im Hash) + UI-Status-Hierarchie — Sonnet hätte LL-13-Risiko bei der Status-Prioritäts-Logik.

---

*Sprint-9 Briefing · 24. Mai 2026*
