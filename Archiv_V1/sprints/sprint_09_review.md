# Sprint 9 — Review · Cortal-Consors-Parser + Cross-Account-Transfer-Erkennung

> **Von:** Claude Code (Implementierungs-Chat)
> **An:** PM-Chat Sprint 9
> **Datum:** 24. Mai 2026
> **Branch:** `sprint/09-cortal-transfer`
> **Test-User:** `179cd2c1-bbc2-4fd0-954b-8735eb90f370`

---

## 1. Code-Diff (Commit-Reihenfolge, LL-14 phasen-sequenziell)

| Commit | Inhalt |
|---|---|
| `docs: sprint 9 briefing` | Briefing-Datei eingecheckt |
| `chore: regenerate supabase types …` | `types.ts` auf RPC-v3-Signatur + `counterparty_iban`/`transfer_type` (View + `fragments` + `profiles.own_ibans`) |
| `sprint-9 p0: dkb parser extracts counterparty iban` | L1 |
| `sprint-9 p1: cortal-consors csv parser with format detection` | L2 |
| `sprint-9 p2: csv format router routes to dkb or cortal parser` | L3 |
| `sprint-9 p3: wire process_csv_import v3 with format hint and counterparty iban` | L4 |
| `sprint-9 p4: render internal transfer fragments dimmed with badge and backfill toast` | L5 + L6 |

**Diffstat `main..HEAD` (nur `src/`):** 10 Dateien, +403 / −24.

Neue Module: `src/lib/cortal-csv.ts` (145 LOC), `src/lib/csv-format-router.ts`
(63 LOC). Erweitert: `dkb-csv.ts`, `rpc.ts`, `actions.ts`, `portal.tsx`,
`fragment-card.tsx`, `interaction-zone.types.ts`, `interaction-zone.module.css`.

Sanity-Checks am Sprint-Ende: `tsc --noEmit` clean · `next lint` 0/0 ·
`next build` 0 Errors / 0 Warnings.

---

## 2. Architektur-Entscheidungen

- **AD1 — Parser als getrennte, framework-freie Module.** DKB- und Cortal-Parser
  bleiben eigenständig (keine Cross-Imports). Der Router (`csv-format-router.ts`)
  ist der einzige Runtime-Aggregator; er importiert beide Parser. Gemeinsamer
  Output-Shape `ParsedCsvRow` (`{ transaction_date, amount, description,
  counterparty_iban }`) — strukturell identisch zu `DkbCsvRow` / `CortalCsvRow`,
  daher ohne Coupling assignbar an `CsvImportRow` (rpc.ts).

- **AD2 — Router-Erkennungs-Semantik.** Ein Parser meldet `errorClass: "format"`,
  wenn sein Header-Anker fehlt (→ Format passt nicht, nächsten probieren). Meldet
  er `"empty"`/`"corrupt"`, hat das Format gepasst, aber die Daten sind fehlerhaft
  → kein Fall-Through, der Fehler wird durchgereicht. Cortal wird VOR DKB geprüft
  (Briefing §5: beide nutzen `;`, aber Cortal ist unquoted + distinkter Header).

- **AD3 — Cortal-Header strikt (OQ4).** Byte-exakter Vergleich der Header-Zeile
  inkl. Trailing-Space nach „Buchung". Kein Trim. Ändert Cortal das Format, ist
  neu zu spec'en (V2-Vormerkung).

- **AD4 — `counterparty_iban` nicht im Hash.** Frontend reicht die IBAN nur durch;
  der Hash bleibt die V2-Formel über `(date, amount, description)`. Dadurch trifft
  ein Re-Import bestehende Hashes und der Server backfillt die IBAN per
  `ON CONFLICT DO UPDATE` (Briefing §2 / verifiziert, siehe §4 S4.1).

- **AD5 — INTERNAL_TRANSFER-Rendering (§6.1, Variante b).** Eigene CSS-Klasse
  `.fragmentCardTransfer` (Opacity 0.45, `pointer-events:none`) statt der
  `locked`-Klasse (0.22). Badge „TRANSFER" über eigene Token-Triplet
  (`--frag-transfer-badge-*`, Grau-Soft `rgba(140,140,140,.5)` gemäß Spec). Die
  Status-Priorität wird im `FragmentCard`-Render erzwungen: `isTransfer` schlägt
  `isLocked` und das KI-Vorschlag-Badge. Komponenten-lokale Custom-Properties
  (kein globales `tokens.css`) — konsistent mit dem Sprint-2/3-Pattern und dem
  bestehenden KI-Badge.

- **AD6 — Backfill-Toast (§6.2).** Lebt im `Portal`-Client-Component (hält das
  RPC-Result ohnehin). State `toast: { id, lines }`; `id` erzwingt Remount →
  Animation-Restart bei sukzessiven Importen. Eine CSS-Animation
  `backfillToastLife 4s` macht Fade-In + Fade-Out in einem; Unmount per Timer bei
  4 s. Nur Counter > 0 werden als Zeile gerendert; bei keinem Counter > 0 kein
  Toast. LL-5-Reset bei `targetMonth`-Wechsel (Timer + State + Toast).

---

## 3. Selbst-Review gegen Akzeptanz-Kriterien

| AC | Status | Beleg |
|---|---|---|
| AC1 — alle Phasen P0–P4 committed, Build grün | ✅ | 5 Phase-Commits + chore; `tsc`/`lint`/`build` clean |
| AC2 — S1.1–S1.3, S2.1–S2.5, S3.1–S3.3, S4.1–S4.4, S5.1–S5.3 grün | ✅ Parser/Router/E2E-Pfad · ⏳ UI-visuell | siehe §4 |
| AC3 — S6.1 §4.6-Anker = `2910.01` | ✅ | live verifiziert, 3× (vor/nach beiden Dry-Runs) |
| AC4 — drei Cross-Account-Bewegungen beidseitig markiert | ✅ + ⚠️ Abweichung | siehe §5 (Offene Frage 1) |
| AC5 — Doku-Patches als Datei | ✅ | `sprints/sprint_09_doku_patches.md` |
| AC6 — CLAUDE.md-Patch-Vorschlag | ✅ | siehe §7 |

---

## 4. Smoke-Ergebnisse

### S1 — DKB-Parser (P0), gegen echtes Sample
- **S1.1** ✅ 54 Zeilen geparst, `counterparty_iban` pro Zeile gesetzt (das DKB-
  Sample hat in jeder Zeile eine IBAN).
- **S1.2** ✅ Synthetische Zeile mit leerer Spalte 8 → `counterparty_iban === null`.
- **S1.3** ✅ Hash-Tripel `(date, amount, description)` unverändert gegenüber
  Sprint 8 — `counterparty_iban` ist nicht Bestandteil.

### S2 — Cortal-Parser (P1), gegen echtes Sample
- **S2.1** ✅ 8 Datenzeilen, alle Felder konsistent, `counterparty_iban` korrekt.
- **S2.2** ✅ Effekten/Wertpapier-Zeile (IBAN `n/a`) → `counterparty_iban === null`,
  Description `"n/a | Effekten | SPARPLAN 0372176179001 Kauf WKN: A2QMHS
  INVESCOMI NASDAQ100 SWAP"` byte-exakt.
- **S2.3** ✅ Zeile mit Währung ≠ EUR → `corrupt` (gesamter Import verworfen).
- **S2.4** ✅ DKB-Datei an Cortal-Parser → `format` (kein Cortal-Header).
- **S2.5** ✅ JSON an Router → `format`.

### S3 — Format-Router (P2)
- **S3.1** ✅ DKB-Sample → `formatHint = 'DKB'`, 54 Zeilen.
- **S3.2** ✅ Cortal-Sample → `formatHint = 'CORTAL_CONSORS'`, 8 Zeilen.
- **S3.3** ✅ Unbekanntes CSV → `error-format`.

### S4 — End-to-End gegen die LIVE-RPC (nicht-persistierender Dry-Run)
Verifiziert via transaktionalem `DO`-Block mit gesetztem `request.jwt.claims`
(= `auth.uid()` des Test-Users) und abschließendem `RAISE EXCEPTION`, der die
Transaktion zurückrollt → **keine Persistenz** (per Re-Query bestätigt: 0 neue
`ECHTZEIT`-Fragmente, Fragment-Count unverändert 59).

- **S4.1 (DKB-Re-Import)** ✅ `process_csv_import(54 DKB-Zeilen, 'DKB')` →
  `inserted_count: 0`, `iban_backfilled_count: 54`, `internal_transfers_count: 7`,
  `links_removed_for_transfers_count: 0`. Beweist: Re-Import trifft bestehende
  Hashes, backfillt IBANs, markiert die 7 Bewegungen mit `counterparty_iban ∈
  own_ibans` als Transfer.
- **S4.2 (Cortal-Erst-Import)** ✅ `process_csv_import(8 Cortal-Zeilen,
  'CORTAL_CONSORS')` → `inserted_count: 8`, `iban_backfilled_count: 0`,
  `internal_transfers_count: 7` (alle außer der Effekten-Zeile mit null-IBAN).
  Bestätigt: Wrapper-Row-Shape + `p_format_hint` werden akzeptiert, das
  v3-Return-Schema deckt sich mit `CsvImportResult`.
- **S4.3 (Cortal-Re-Import)** — RPC-Logik (`skipped_duplicates` bei zweitem
  Lauf) ist Architekten-verifiziert (Sandbox 10/10); im Frontend nicht separat
  dry-gerunnt, da identischer Pfad. **User-Browser-Smoke bestätigt final.**
- **S4.4 (Stack visuell)** ⏳ **User-Browser-Smoke** — Code-Pfad steht (Dimming
  0.45 + TRANSFER-Badge + no-tap, §6.1); visuelle Bestätigung obliegt dem User.

### S5 — UI-Smoke
- **S5.1 / S5.2 / S5.3** ⏳ **User-Browser-Smoke.** Implementiert: TRANSFER-
  Fragment `pointer-events:none`/Cursor default; Backfill-Toast 3 Counter-Zeilen,
  Fade nach 4 s, dann weg. Bundle-Grep bestätigt die Toast-Texte im Client-Chunk,
  Dev-Buttons 0 Treffer in `chunks/app/`.

### S6 — §4.6-Anker (nicht verhandelbar)
- **S6.1** ✅ `calculate_sparrate_for_month(test-user, '2026-03-01') = 2910.01` —
  vor und nach beiden Dry-Runs identisch. März ist von den April/Mai-Importen
  strukturell unberührt; Transfers fließen ohnehin nicht in die Sparrate.

**Bundle-Hygiene (LL-4):** `chunks/app/` — 0 Treffer für Dev-Button-Strings,
0 für `touchstart`/`onSwipe`/`longpress`.

---

## 5. Offene Fragen an PM

**OQ-1 (wichtig) — `internal_transfers_count` deutlich höher als AC4 annimmt.**
AC4 / S4.1 erwarten die *drei* benannten Bewegungen (`Cortal Consors Sparen
04/26`, `Cortal Consors Übertrag Scalable 05/26`, `Ausgleich DKB`), „6 Fragmente
total (3 DKB + 3 Cortal)". Die LIVE-RPC markiert jedoch **7 pro Seite** (DKB-Seite
7, Cortal-Seite 7), weil die Erkennungs-Regel `counterparty_iban = ANY(own_ibans)`
ist und der Test-User viele weitere Bewegungen zwischen seinen eigenen DKB-/Cortal-
Konten hat (Geschenk Aline, Hotel, Inspektion Auto, Konfirmation Konstantin, …).
**Einordnung:** Das ist *korrektes* Verhalten der Stufe-1-RPC (alle sind echte
Eigen-Konto-Transfers) — **kein** Frontend- und **kein** RPC-Bug, und **kein**
Verstoß gegen die Stufe-1-Spec (deshalb kein Stopp gemäß §2). Es ist eine
Unter-Zählung in der Briefing-*Narrative* (AC4 / S4.1-„mind. 2"). Bitte AC4 als
„≥ 3 je Seite, inkl. der drei benannten" lesen. Die drei benannten Bewegungen
sind nachweislich enthalten und werden beidseitig markiert.

**OQ-2 — Backfill-Toast bei DKB-Re-Import.** Da im Test-DB-State bereits alle 54
DKB-Mai/April-Fragmente liegen (Befund aus S4.1), zeigt der echte DKB-Re-Import
einen Toast mit `54 Fragmente mit IBAN ergänzt` + `7 Bewegungen als Transfer
erkannt`. Das ist spec-konform (§6.2), aber die Zahl 54 ist hoch — falls eine
Deckelung/Formulierung gewünscht ist (z. B. „alle Fragmente …"), bitte als
V2-Vormerkung. V1 zeigt die exakten Counter.

**OQ-3 — INCOME/FIXED-Karten-Status nach Transfer-Reklassifikation.** Die RPC
löst bei Transfer-Markierung bestehende `card_fragment_links` (links_removed). In
den Dry-Runs war `links_removed = 0` (keine der markierten Bewegungen war
verlinkt). Falls im echten User-State eine markierte Bewegung zuvor einer Karte
zugeordnet war, ändert sich deren Karten-Status nach dem Import — erwartetes
Verhalten, hier nur als Hinweis für die Smoke-Interpretation.

---

## 6. Verbleibende User-Browser-Smoke-Schritte

S4.3 (Re-Import-Dedup-Visual), S4.4 (Stack-Dimming + TRANSFER-Badge sichtbar),
S5.1–S5.3 (Tap-No-Op, Toast-Sichtbarkeit + Fade) sind visuelle Schritte, die dem
User-Browser-Smoke vorbehalten sind (PM-Workflow). Der Code-Pfad ist gebaut und
build-/typecheck-grün; die Daten-/RPC-Seite ist via Dry-Run E2E bestätigt.

⚠️ Hinweis: Der echte DKB-Re-Import + Cortal-Erst-Import **persistiert** (anders
als meine Dry-Runs): 54 IBAN-Backfills + 14 Transfer-Markierungen (7+7) +
8 neue Cortal-Fragmente. Das ist die intendierte Smoke-Aktion.

---

## 7. Vorschläge zur CLAUDE.md-Aktualisierung (Vorschlag, keine Ausführung — AC6)

### §4 Sprint-Protokoll-Tabelle
- Sprint 9 Zeile: Komponente von „Soft-Delete-Pattern (§2.4)" auf
  **„Cortal-Consors-Parser + Cross-Account-Transfer-Erkennung (§11)"** ändern,
  Status 🟢 Done, Briefing `sprints/sprint_09_briefing.md`, Approval-Datum nach
  PM-Freigabe. (Soft-Delete + Sparraten-Treppe rücken in spätere Sprints.)

### §3 Dateistruktur
- `src/lib/cortal-csv.ts` und `src/lib/csv-format-router.ts` ergänzen.

### §6 Schema-Befunde — neuer Block „Sprint 9"
- `profiles.own_ibans text[]`, `fragments.counterparty_iban`,
  `fragments.transfer_type` (CHECK: NULL oder `'INTERNAL_TRANSFER'`).
- `process_csv_import` jetzt `(p_rows jsonb, p_format_hint text DEFAULT 'DKB')`.
  `p_format_hint` ist in Stufe 1 **noch nicht aktiv im RPC-Body** (Future-Proof-
  Parameter; Validierung auf `DKB`/`CORTAL_CONSORS`). Cortal-Description-
  Normalisierung passiert frontseitig im Parser.
- View `fragments_with_status`: Spalten `counterparty_iban`, `transfer_type` am
  Ende; neuer `status`-Wert `'INTERNAL_TRANSFER'` mit höchster Priorität.
- `counterparty_iban` ist **nicht** Hash-Bestandteil → Re-Import-Backfill via
  `ON CONFLICT DO UPDATE`.

### §7 — Lessons-Learned-Kandidat (LL-18, Vorschlag)
> **LL-18 — Live-RPC-E2E ohne Persistenz via RAISE-Rollback-Dry-Run.** Wenn ein
> Sprint eine Server-Action gegen eine mutierende RPC verkabelt und der Browser-
> Smoke dem User vorbehalten ist, kann Claude Code den E2E-Contract trotzdem
> nicht-destruktiv verifizieren: `DO`-Block mit `set_config('request.jwt.claims',
> …, true)` (setzt `auth.uid()`), RPC-Aufruf mit echten Parser-Zeilen, dann
> `RAISE EXCEPTION 'RESULT=%', r::text` — die Exception rollt alle Mutationen
> zurück und transportiert das Return-JSON in der Fehlermeldung. Bestätigt Row-
> Shape, Parameter-Akzeptanz und Return-Schema gegen die echte DB, ohne den
> geteilten Test-State zu verändern. Sprint 9 P3/P4 so verifiziert.

### §10 Sprint-Übergabe-Log — neuer „Sprint 9"-Block
- Beim PM-Approval analog zu den Vorgänger-Sprints ergänzen; Kerninhalt: zwei
  neue Parser-Module + Router, RPC-v3-Verkabelung, INTERNAL_TRANSFER-UI +
  Backfill-Toast, OQ-1 (Transfer-Count-Divergenz) als bewusst akzeptiertes
  korrektes Verhalten dokumentieren.

---

## 8. Test-Daten-Befund (für Folge-Sprints)

- Test-DB hat aktuell **59 Fragmente**; davon liegen bereits alle 54 DKB-Mai/April-
  Bewegungen vor (S4.1 zeigte `inserted_count: 0`, `iban_backfilled_count: 54`).
- ARAL-Test-Fragment (`imported_at 2026-05-23`) aus Stufe-1-Beifang unverändert
  im Stack — kein Cleanup nötig (Briefing §8 / §10).
- `own_ibans = {DE13120300001051422572 (DKB-Giro), DE84760300800853562991
  (Cortal)}` — greift bei beiden Importen.

---

*Sprint-9 Review · Claude Code · 24. Mai 2026*
