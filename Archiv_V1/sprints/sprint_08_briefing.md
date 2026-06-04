# Sprint 8 — CSV-Import + Distiller (DKB-only) + Konflikt-6-Cleanup

> **Adressiert an:** Claude Code (Implementierungs-Chat)
> **Vom:** PM-Chat Sprint 8
> **Datum:** 22. Mai 2026
> **Test-User:** `179cd2c1-bbc2-4fd0-954b-8735eb90f370`

---

## 0. Sprint-Ziel — eine Zeile

Den Sprint-5-Portal-Stub durch die echte DKB-CSV-Import-Pipeline ersetzen: Parser → Hash → atomare Distiller-RPC → Fragment-Stack-Refresh, plus Mini-Cleanup INCOME-Tap-Catcher (Konflikt 6).

---

## 1. Scope

### In Scope

| # | Lieferung |
|---|---|
| L1 | DKB-CSV-Parser (Frontend) inkl. Format-Erkennung, deutsche Zahl-/Datumsformate, Fehler-Klassifikation |
| L2 | Atomare RPC `process_csv_import(p_rows jsonb) RETURNS jsonb` |
| L3 | Portal-Live-Verkabelung: Stub raus, echter Aufruf rein, Portal-States gemäß §11 |
| L4 | Fragment-Stack-Refresh nach Import (Supabase Realtime ODER manueller Refetch — Implementierung wählt) |
| L5 | Fragment-Card-Badge-Rendering im Stack (Score 0.60–0.95) — Badge-Text via §12.6 |
| L6 | Konflikt-6-Cleanup INCOME: Tap-Catcher nicht rendern bei `hasFragment === true`, Cursor `default` |
| L7 | Design-Doku §7 Konflikt-6-Patch-Satz (DD-Vorgabe, ein Satz) |

### Out of Scope (V2-Vormerkungen)

| # | Verschoben |
|---|---|
| V2-A | Cortal-Consors-Parser (anderes Format) |
| V2-B | IBAN-Filter / `INTERNAL_TRANSFER`-Status für Cross-Account-Bewegungen — Pfad A: User lässt Cross-Account-Fragmente unzugeordnet |
| V2-C | Karten-spezifische Badge-Farbe pro Karte — Sprint 8 nutzt generische Akzent-Farbe (siehe OQ1) |
| V2-D | Drag-&-Drop von Fragmenten auf Karten (existiert seit Sprint 4? prüfen, sonst V2) |
| V2-E | Pro-Steuerjahr-Brackets etc. — wie bisher |

---

## 2. Architekten-Vorbedingung — `process_csv_import` LIVE seit 23.05.2026

RPC live in DB V2-Stand (V1-Pitfall `INSERT...RETURNING INTO` in PL/pgSQL bei ON-CONFLICT-Pfad wurde Architekt-seitig via CTE-Pattern gefixt — keine Frontend-Auswirkung). Smokes 1–5 grün, §4.6-Anker = `2910.01`.

Spec-Referenz (für Pipeline-Verständnis im Frontend):

```sql
process_csv_import(
  p_rows jsonb  -- Array von { transaction_date date, amount numeric, description text }
) RETURNS jsonb -- { inserted_count, skipped_duplicates_count, auto_absorbed_count, fragment_ids[] }
```

Garantien:
- `SECURITY INVOKER`, `auth.uid()`-Check
- Pro Zeile: SHA-256 via `pgcrypto.digest` über `transaction_date_iso || '|' || amount_fixed || '|' || description_raw`
- `INSERT ... ON CONFLICT (user_id, hash) DO NOTHING RETURNING id`
- Pro neu inserted Fragment: Loop über aktive User-Karten, `calculate_match_confidence`
  - Score `> 0.95` (höchster gewinnt bei mehreren) → `card_fragment_links` mit `origin = 'AUTO_ABSORBED'`
  - Score `0.60–0.95` (höchster gewinnt) → `fragments.suggested_card_id` setzen, `fragments.confidence` setzen
  - Score `< 0.60` → kein State auf Fragment, bleibt unzugeordnet
- Eine Funktions-Transaktion, vollständig rollback-fähig

**Bei Auffälligkeiten gegen Spec während Sprint-8-Implementation: Stopp, PM informieren.**

---

## 3. DKB-CSV-Format — Parser-Spec

### Format-Erkennung (Heuristik)

CSV gilt als DKB-Format, wenn alle drei Bedingungen erfüllt sind:

1. Datei-Encoding ist UTF-8 (mit oder ohne BOM)
2. Separator ist `;` (Semikolon)
3. Eine der ersten 8 Zeilen beginnt mit `"Buchungsdatum"` (Header-Zeile)

Wenn nicht erfüllt: Fehler-State `Format nicht erkannt`.

### CSV-Struktur (verbindlich)

DKB-Export hat folgende Vor-Header-Struktur (Zeilen 1–4) gefolgt von Header und Datenzeilen ab Zeile 5+:

```
"Girokonto";"DE..."
""
"Kontostand vom dd.mm.yyyy:";"X,XX €"
""
"Buchungsdatum";"Wertstellung";"Status";"Zahlungspflichtige*r";"Zahlungsempfänger*in";"Verwendungszweck";"Umsatztyp";"IBAN";"Betrag (€)";"Gläubiger-ID";"Mandatsreferenz";"Kundenreferenz"
"22.05.26";"22.05.26";"Gebucht";"Max Müller";"Aral Tankstelle...";"VISA Debitkartenumsatz...";"Ausgang";"";"-50,91";"";"";""
```

Parser muss:
- Vor-Header-Zeilen überspringen, Header-Zeile als Schema-Anker verwenden
- Datenzeilen ab Zeile nach Header lesen
- Anführungszeichen unwrappen
- Leere Felder als `""` erhalten

### Feld-Mapping pro Datenzeile

| CSV-Feld | Ziel | Transformation |
|---|---|---|
| `Buchungsdatum` (`DD.MM.YY`) | `transaction_date` | → ISO `YYYY-MM-DD`; `YY` < 50 → `20YY`, sonst `19YY` (in der Praxis 2025+ → `20YY`) |
| `Betrag (€)` (`-50,91` / `1.200,00`) | `amount` | Tausender-`.` entfernen, Dezimal-`,` → `.`, parse als numeric mit zwei Nachkommastellen |
| `Zahlungsempfänger*in` + `Verwendungszweck` | `description` | `"{Zahlungsempfänger*in} \| {Verwendungszweck}"` — **byte-exakt aus CSV**, ohne Trimming, ohne Normalisierung. Pipe-Separator mit Spaces rundum. |

**§11-Adapter (DKB-Format, DD-approved):**
> `description_raw` wird gebildet als `"{Zahlungsempfänger*in} | {Verwendungszweck}"` — beide Felder byte-exakt aus der CSV-Quelle, ohne Trimming, ohne Normalisierung. Pipe-Separator mit Spaces als Trenner. Hash-Determinismus bleibt erhalten.

Diesen Satz in Design-Doku §11 unter „Hash-Algorithmus" als Bank-Adapter-Block aufnehmen.

### Fehler-Klassifikation

| Fehler-Klasse | Bedingung | Portal-State (§11) |
|---|---|---|
| Format | Datei ist nicht CSV ODER Format-Heuristik schlägt fehl | `error-format` (4 s) |
| Leer | CSV parst, aber 0 Datenzeilen vorhanden | `error-empty` (4 s) |
| Korrupt | Parse-Exception in einer Datenzeile (Datum nicht parsbar, Betrag nicht parsbar) | `error-corrupt` (4 s) |

Bei „Korrupt": gesamter Import wird verworfen (kein partielles INSERT). Die RPC ist atomar, also auf Frontend-Seite: nicht erst aufrufen, wenn Parsing der gesamten Datei fehlerfrei abgeschlossen ist.

---

## 4. Frontend-Pipeline — Reihenfolge

```
File ausgewählt / gedroppt
  ↓
Portal-State → 'processing'  (gemäß §11)
  ↓
Datei lesen als UTF-8 Text
  ↓
Format-Heuristik
  → Fehlschlag → Portal-State 'error-format'
  ↓
CSV parsen → Datenzeilen-Array
  → 0 Zeilen → Portal-State 'error-empty'
  → Parse-Exception → Portal-State 'error-corrupt'
  ↓
Datenzeilen → Array von { transaction_date, amount, description } (alle Felder byte-exakt)
  ↓
RPC-Call: process_csv_import(p_rows)
  → Exception → Portal-State 'error-corrupt'
  ↓
Portal-State → 'success' (1.5 s)
  ↓
Fragment-Stack-Refetch (Implementation: useEffect-Trigger ODER Realtime-Subscription)
  ↓
Portal-State → 'default'
```

---

## 5. Konflikt-6-Cleanup INCOME (Phase 0 vor allem anderen)

DD-Spec wortwörtlich umsetzen:

```ts
// State-Resolution unverändert
resolveIncomeState = isFuture ? "ghost"
                   : (manuallyPaid || hasFragment) ? "received"
                                                   : "expected";

// Tap-Catcher-Rendering — NEU
renderTapCatcher = !hasFragment;
// Falls hasFragment === true: cursor: default (kein pointer)
// Kein Hover-Hinweis, kein Overlay
```

Bei Karten mit `type === 'INCOME'` und `hasFragment === true`: kein Tap-Catcher rendern, Cursor `default`. Sonst (kein Fragment): Tap-Catcher rendern wie bisher.

**Doku-Patch §7 Konflikt 6:**
> INCOME-Spezialregel: Ist `hasFragment === true`, wird der Tap-Catcher nicht gerendert und der Cursor bleibt `default`. `manually_paid` wird in diesem Fall nicht über die UI geschrieben.

Diesen Satz an §7 Konflikt 6 in Design-Doku v3 anhängen.

---

## 6. Fragment-Card-Badge

§11 + §12.6 + Prototyp `csv_import_drop_distill.html` sind die Visual-Quelle.

| Aspekt | Wert |
|---|---|
| Render-Bedingung | `fragments.confidence` zwischen 0.60 (inklusive) und 0.95 (exklusive) UND `suggested_card_id IS NOT NULL` |
| Badge-Text | `KI-Vorschlag: [Karten-Name]` (aus §12.6) — Karten-Name via JOIN auf `cards.name` |
| Typographie | `7.5px`, `font-weight: 600`, uppercase, letter-spacing wie Prototyp |
| Farbe | siehe OQ1 |
| Position | rechts neben Betrag in Fragment-Card-Top-Row (siehe Prototyp) |

---

## 7. Phasen + Commits

LL-14 (Multi-Komponenten sequenziell, eigene Commits):

| Phase | Inhalt | Commit-Message |
|---|---|---|
| P0 | Konflikt-6-Cleanup (L6 + L7 + Doku-Patch §7) | `sprint-8 p0: income tap-catcher only renders when no fragment linked` |
| P1 | DKB-Parser-Modul + Unit-Tests intern (L1) | `sprint-8 p1: dkb csv parser with format detection and error classification` |
| P2 | Portal-Live-Verkabelung + RPC-Call + Pipeline (L3) | `sprint-8 p2: wire portal to process_csv_import rpc with full state machine` |
| P3 | Fragment-Stack-Refresh (L4) | `sprint-8 p3: fragment stack refresh after import` |
| P4 | Badge-Rendering (L5) + Doku-Patch §11 DKB-Adapter | `sprint-8 p4: ai suggestion badge rendering on fragment cards` |

Jeder Phase: eigener Commit, eigener Push, eigener Smoke-Check.

---

## 8. Smoke-Plan

Sprint-7-Lesson LL-15: Smoke-Plan vor Briefing-Approval gegen aktive Konflikte + Sprint-K-Logiken + Test-Daten-Eigenschaften prüfen.

### Test-Daten-Realitätscheck (per 22.05.2026)

| Karte | Frequenz | first_active | Relevanz für DKB-CSV (Mai 2026) |
|---|---|---|---|
| Miete | MONTHLY | 2026-01-01 | aktiv Mai — könnte matchen, falls Description „miete" enthält |
| Netflix | MONTHLY | 2026-01-01 | aktiv Mai |
| Steuerrückzahlung | ONCE | 2026-03-01 | NICHT Mai-aktiv — frequenz_match = 0 für Mai-Fragmente |
| Tanken | MONTHLY | 2026-01-01 | aktiv Mai — wird DKB-Tankstellen-Buchungen vorgeschlagen bekommen, falls name_similarity reicht |
| Hobby | MONTHLY | 2026-05-01 | aktiv Mai (Sprint-7-Test-Karte) |
| Auswärts Essen | MONTHLY | 2026-05-01 | aktiv Mai (Sprint-7-Test-Karte) |
| Nebenjob | MONTHLY | 2026-05-01 | aktiv Mai (Pre-Sprint-8-Test-Karte) |

**Realität:** DKB-Description-Texte sind generisch (`VISA Debitkartenumsatz vom XX.XX.2026`, `DKB BANKING`). Substring-Boost für Karten-Namen wie „Tanken" oder „Miete" greift in echten DKB-Daten selten. Erwartung: viele Fragmente landen unzugeordnet im Stack, wenige bis keine Badges, kaum Auto-Absorbs. Das ist **kein Bug**, sondern V1-Verhalten — Pfad A für Cross-Account und realistische Treffer-Quote.

### S1 — P0 Konflikt-6-Cleanup

| # | Setup | Aktion | Erwartung |
|---|---|---|---|
| S1.1 | Navigation auf März 2026 | Tap auf Steuerrückzahlung-Karte (Fragment-verlinkt) | Kein State-Change, kein Cursor-Pointer beim Hover (default-Cursor), DB `manually_paid` unverändert |
| S1.2 | Navigation auf Mai 2026 | Tap auf Nebenjob-Karte (kein Fragment) | State-Toggle `expected ↔ received`, Cursor `pointer` beim Hover, DB `manually_paid` toggelt |

### S2 — P1 Parser-intern (Unit/Integration-Level)

| # | Input | Erwartung |
|---|---|---|
| S2.1 | DKB-CSV mit 30+ Zeilen | Parser liefert Array mit `transaction_date` als ISO-Datum, `amount` als numeric, `description` als `"Empfänger \| Verwendungszweck"` byte-exakt |
| S2.2 | Datei mit JSON-Inhalt | Format-Erkennung schlägt fehl, Klasse `format` |
| S2.3 | CSV mit Header aber 0 Datenzeilen | Klasse `empty` |
| S2.4 | CSV mit unparsbarem Betrag in Zeile 3 | Klasse `corrupt`, kein partielles Ergebnis |

### S3 — P2 End-to-End mit echtem DKB-CSV

| # | Setup | Aktion | Erwartung |
|---|---|---|---|
| S3.1 | Sauberer DB-State (alle Mai-Fragmente vorab gelöscht, falls vorhanden) | User-CSV (Mai 2026) droppen | Portal `processing` → `success` → `default`; RPC-Result: `inserted_count > 0`, `skipped_duplicates_count = 0` |
| S3.2 | Direkt nach S3.1 | Selbe CSV nochmal droppen | RPC-Result: `inserted_count = 0`, `skipped_duplicates_count = N` (Re-Import-Determinismus) |
| S3.3 | Nach S3.2 | Fragment-Stack visuell prüfen | Alle Mai-Fragmente sichtbar, je nach Score 0–wenige mit Badge |
| S3.4 | Cross-Account: −1.200 € „DKB BANKING" + +100 € „Ausgleich DKB" | im Stack vorhanden | Beide Einträge bleiben unzugeordnet (Pfad A — keine Auto-Absorption, kein Match auf Miete trotz Betrag-Match) |

### S4 — Synthetischer Smoke (für Badge + Auto-Absorb)

Optional, falls echtes CSV keine Badge-/Auto-Absorb-Cases produziert.

| # | Synthetic-Zeile | Erwartung |
|---|---|---|
| S4.1 | Description `"Tanken \| Tanken"`, Betrag `-50,00 €`, Datum 2026-05-10 | name_sim ≈ 1.0, amount=0.30 (75% Abweichung von 200€), freq=1.0 → Score ≈ 0.50 + 0.09 + 0.20 = 0.79 → Badge |
| S4.2 | Description `"Tanken \| Tanken"`, Betrag `-200,00 €`, Datum 2026-05-10 | name_sim ≈ 1.0, amount=1.00, freq=1.0 → Score 1.00 → Auto-Absorb, Tanken-Karte wird grün, Fragment erscheint NICHT im Stack |

Synthetic-CSV via Testfile in `/tmp/` mit DKB-konformer Struktur.

### S5 — §4.6-Anker-Schutz (nicht verhandelbar)

| # | Aktion | Erwartung |
|---|---|---|
| S5.1 | NACH allen anderen Smoke-Schritten | `calculate_sparrate_for_month('179cd2c1-...', '2026-03-01') = 2910.01` |

März-2026 hat keine Cross-Account-Bewegungen aus dem Mai-CSV, also darf Sparrate-März unverändert sein. Wenn S5.1 fehlschlägt: Investigation, kein Merge.

---

## 9. Offene Fragen (OQs) — vor Implementation klären

| # | Frage | PM-Vorschlag |
|---|---|---|
| OQ1 | Karten-spezifische Badge-Farbe (§11): Wie wird Farbe pro Karte bestimmt? Karten haben aktuell keine Farb-Spalte | **V1-Pragmatik:** generische Akzent-Farbe `rgba(255,200,60,.5)` (Yellow-Soft, wie Essen-Badge im Prototyp) für ALLE KI-Vorschlag-Badges. Echte Karten-Farben → V2-Vormerkung |
| OQ2 | Mehrere Karten matchen mit Score 0.60–0.95: nur höchster zeigt Badge? | **PM-Vorschlag:** höchster Score gewinnt, deterministisch. Bei Score-Gleichstand: alphabetisch erste Karten-Name |
| OQ3 | Mehrere Karten matchen mit Score > 0.95: welche bekommt Auto-Absorb? | **PM-Vorschlag:** höchster Score gewinnt (dieselbe Regel wie OQ2) |

OQ2 und OQ3 sind Spec-Lücken in §11. Falls PM-Vorschlag akzeptiert: in Design-Doku §11 als zusätzlicher Absatz „Mehrfach-Match" dokumentieren. Falls nicht: Sprint-Briefing-Patch.

---

## 10. Was explizit NICHT

Verstärkt aus §11:

- Kein Modal bei Fehlern
- Kein Ladebalken
- Keine Bestätigungsmeldung nach Import (Portal-Success-State 1.5 s ist die einzige Bestätigung)
- Kein automatisches Clustering
- Keine interaktiven Kategorie-Badges (Badge ist informativ, kein Klick-Target)
- Keine Cortal-Consors-Unterstützung (V2-A)
- Keine IBAN-Filter / Internal-Transfer-Erkennung (V2-B)
- Kein Drag-&-Drop-Refactor (V2-D)

---

## 11. Akzeptanz-Kriterien

Sprint-8-Merge nur, wenn:

| # | Kriterium |
|---|---|
| AC1 | Alle Phasen P0–P4 committed, Build grün |
| AC2 | S1.1, S1.2, S2.1–S2.4, S3.1–S3.4 alle grün |
| AC3 | S5.1 grün — §4.6-Anker = `2910.01` |
| AC4 | S4 mindestens 1 Case grün (Badge oder Auto-Absorb sichtbar im Live-UI) |
| AC5 | Design-Doku §7 Konflikt 6 + §11 Hash-Algorithmus mit Patch-Sätzen aktualisiert (Patch-Datei als Output) |
| AC6 | CLAUDE.md §9 Sprint-8-Block + §10 LL-update (falls neue Lesson) als Patch-Vorschlag |

---

## 12. Modell-Empfehlung Claude-Code

**Opus 4.7.** Hash-Determinismus, atomare RPC-Verkabelung, Pipeline-Reihenfolge — Sonnet hätte LL-13-Risiko (spontane Spec-Patches).

---

*Sprint-8 Briefing · 22. Mai 2026 · Patch 1 (23.05.): Enum `AUTO_ABSORBED`, RPC-Live-Status*
