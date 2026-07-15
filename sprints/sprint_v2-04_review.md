# Sprint v2-04 — Review: Mehrkonten Stufe 1, App-Layer

> **Von:** Claude Code · **An:** PM / Dominik (Prod-Gate)
> **Datum:** 07. Juli 2026
> **Branch:** `sprint/v2-04-mehrkonten-stufe1` (von `main`, gepusht)
> **Rollen-Stand:** DB-Seite (Migration + RPCs + SQL-Verifikation A0–A4) vollständig durch den
> Architekten erledigt und am 06.07.2026 selbst angewendet (bestätigte Sprint-Ausnahme,
> Briefing §0a). Dieses Review deckt den App-Layer, das Repo und die E2E-Verifikation ab.
> **Kein Merge, kein Deploy** — das Gate liegt bei Dominik.

---

## 1. Sanity

| Check | Ergebnis |
|---|---|
| `tsc --noEmit` | ✅ 0 Errors |
| `next lint` | ✅ 0 Warnings / 0 Errors |
| `next build` | ✅ 0 Errors — Route `/` 28 kB, First Load JS 180 kB |
| `git status` am Sessions-Ende | ✅ clean, Branch gepusht |

## 2. Migrations-Anwendung (Architekt) + Repo-Ablage (P0)

- Migration `v2_04_mehrkonten_stufe1` am **06.07.2026 vom Architekten selbst angewendet**
  (Supabase MCP; einmalige Option-A-/Zwei-Personen-Ausnahme, Briefing §0a — keine Dauerregel).
- **Repo-Ablage:** `supabase/migrations/20260706_v2_04_mehrkonten_stufe1.sql` — exakt der
  SQL-Block aus `sprint_v2-04_migration_entwurf.md` §1, **ohne** den `BEGIN;`/`COMMIT;`-Rahmen
  (Anwendung lief atomar über das Migrations-Tool). Struktur-Check: M0 (Wipe) · M1 (CHECK)
  · M2 (Markier-RPC) · M3 (Filter/View/Trigger) · M4 (`process_csv_import` V4) vollständig.
- **P0-Vorbedingungen live bestätigt (07.07.):** 0 Fragmente / 0 Links / 0 Monatszustände,
  31 Karten + 31 `card_planned_timeline`-Zeilen intakt, `own_ibans` = 4 Einträge (Stufe 0),
  RPC `set_fragment_asset_reallocation` + Trigger `trg_oqb_no_transfer_links` existieren.

## 3. DB-seitige Verifikations-Tabelle des Architekten (übernommen fürs Protokoll)

| Kriterium | Ergebnis |
|---|---|
| A0 Migration | ✅ fehlerfrei angewendet |
| A1 KK-Klassifikation | ✅ 3 Transfer / 3 Konsum exakt |
| A2 Markier-RPC | ✅ alle Transitionen + Fremd-Owner `42501` + CHECK-Verletzung |
| A3 Link-Trigger + Filter | ✅ Trigger `23514`, Filter neutral für beide Transfer-Typen |
| A4 Duplikat-Hash | ✅ 2 identische Zeilen → 2 Fragmente / 2 Hashes, Re-Import 0/2 idempotent |

> **Protokoll-Hinweis (Architekt):** Ein erster A2-Lauf scheiterte am Test-Harness des
> Architekten (JWT-GUC beim Identitätswechsel), **nicht** am RPC; der korrigierte Lauf war
> vollständig grün, Migrations-Code unverändert.

## 4. App-Layer-Implementierung (P1–P3)

### P1 — DKB-Visa-KK-Parser + Format-Router (`836bb8b`)
- **Neu `src/lib/dkb-visa-csv.ts`** (188 LOC, pure, framework-frei). Header-Anker
  `"Belegdatum"` (distinkt zum Giro-Anker `"Buchungsdatum"`), 4 Vor-Header-Zeilen,
  gequotete Felder, Datum `DD.MM.YY`, Beträge deutsch — teils **ohne Dezimalstellen**
  (`"150"`, `"-10"`), vom Betrags-Parser abgedeckt.
- **Parser-Vertrag (bindend, Entwurf §2) eingehalten:** `description` = Spalte
  „Beschreibung" **unverändert** (byte-exakt, kein Composite — die KK-Klassifikation der
  RPC hängt am `ILIKE 'Einzahlung%'`/`'Ausgleich Kreditkarte%'`-Prefix); `counterparty_iban`
  immer `null`; Vorzeichen wie im Export; Zeilen in **Dateireihenfolge** (Ordinalität für ④).
- **Router:** Reihenfolge Cortal → DKB-Visa → DKB-Giro; `errorClass`-Semantik unverändert
  (`format` → nächster Parser, `empty`/`corrupt` → durchreichen). `CsvFormatHint` in Router
  + `rpc.ts` um `'DKB_VISA'` erweitert — der Portal-Pfad reicht den Hint unverändert durch
  (keine Portal-Änderung nötig).
- **Verifiziert gegen den echten Export** (`05-07-2026_Umsatzliste_DKB_Visa Kreditkarte.csv`):
  89 Zeilen geparst, **25 Transfer-Kandidaten** (Einzahlung/Ausgleich > 0, regel-basiert,
  LL-19), IBAN durchgängig `null`, das reale PAYPAL-Duplikatpaar vom 11.06. in
  Dateireihenfolge erhalten. **Routing-Regression:** echtes Giro-File → `DKB` (145 Zeilen),
  echtes Cortal-File → `CORTAL_CONSORS` (25 Zeilen), Junk → `error-format`.

### P2 — Interim-Verdrahtung `set_fragment_asset_reallocation` (`bc86899`)
- `types.ts` regeneriert (`supabase gen types`, +4 Zeilen = neue RPC; kein
  `<claude-code-hint>`-Tag).
- `rpc.ts`: `setFragmentAssetReallocation` (Throw-on-Error, LL-2), Return-Shape
  `{fragment_id, transfer_type}`.
- `actions.ts`: `setFragmentAssetReallocationAction` (Auth-Guard + `revalidatePath`).
- **Interim-Trigger** `asset-reallocation-toggle.tsx`: schlichter Text-Button auf der
  Fragment-Karte. Setzen aus `UNASSIGNED` (Broker-Eingang, F3) oder `INTERNAL_TRANSFER`
  (Scalable-Fall, E2), Rücknahme aus `ASSET_REALLOCATION`. Verlinkte Fragmente
  (`ASSIGNED`/`AUTO_ABSORBED`) bekommen **keinen** Trigger — die RPC würde per OQ-B mit
  `23514` verweigern. `pointer-events: auto` reaktiviert den Button innerhalb der
  gedimmten Transfer-Karte. Fehler inline am Button (kein Modal, §11-Linie).
  **Bewusst nichts Aufwendiges** — finale Geste ist DD-Territorium (Briefing §7).
- `FragmentRow.status`-Union um `'ASSET_REALLOCATION'` erweitert (View v3.2).

### P3 — Frontend-Status-Pfade (`979ff19`)
- `fragment-card.tsx`: `isTransfer` deckt **beide** `transfer_type`-Werte — gedimmt (0.45),
  graues TRANSFER-Badge, `draggable=false`, angepasstes `aria-label`. Damit ist der
  v3.2-View-Vertrag (Status = konkreter Typ) vollständig konsumiert.
- Keine weiteren Konsumenten betroffen (geprüft per Literal-Grep): UNASSIGNED-Zähler
  (Header-Flanke), Stack-Sortierung (AR fällt wie IT in die locked-Gruppe), Link-Pfade
  (`ASSIGNED`-only) und Portal unverändert korrekt; DB-Trigger als Backstop gegen Drops.

### P7 — Nachtrag: „Vorgemerkt"-Filter in beiden DKB-Parsern (15.07.2026)

> Auslöser: §8 Quirk 5, vom Architekten als Duplikat-Risiko bestätigt, Fix freigegeben.

- **Zeilen-Filter** in `dkb-visa-csv.ts` **und** `dkb-csv.ts` (Giro): Zeilen mit
  vorhandener Status-Spalte und Wert ≠ „Gebucht" (z. B. „Vorgemerkt") werden
  übersprungen — **vor** der Feld-Validierung, damit eine unfertige vorgemerkte Zeile
  den Import nicht als `corrupt` kippt. Fehlt die Status-Spalte (ältere Exporte), wird
  nicht gefiltert (additiv, Sprint-9-IBAN-Pattern). **Cortal unverändert** (keine
  Status-Spalte).
- **Zähler:** Parser-Ergebnis + Router (`skippedPendingCount`, Cortal = 0) → Portal-Toast
  weist `„N vorgemerkte Umsätze übersprungen"` aus (nur bei N > 0, bestehendes
  Toast-Pattern §6.2).
- **Kanten-Entscheidung:** Besteht eine Datei ausschließlich aus vorgemerkten Zeilen,
  liefert der Parser `error-empty` („Keine Transaktionen") statt eines leeren
  Erfolgs-Imports.
- **Verifikation:** Echte Exporte unverändert zu P1 — KK `DKB_VISA` 89 Zeilen /
  25 Transfer-Kandidaten / 0 übersprungen · Giro `DKB` 145 / 0 übersprungen · Cortal
  25 / 0 übersprungen. Synthetisch: KK- und Giro-Fixture mit je 1 „Vorgemerkt"- +
  1 „Gebucht"-Zeile → jeweils 1 übersprungen, 1 geparst; Nur-Vorgemerkt-Fixture →
  `error-empty`. `tsc` 0, Lint 0/0, Build 0 Errors.

## 5. E2E-Verifikation gegen frische Test-Importe (P5, Briefing §2a)

Methode: echte Parser-/Router-Ausgabe (App-Code via `tsx`) → RPC-Aufruf mit simuliertem
Auth-Kontext (`set_config('request.jwt.claims', …, true)` in Transaktion, LL-18-Pattern,
hier persistent + anschließend bereinigt). Der Browser-Klick-Pfad (Portal-Drop, Toggle-Klick,
Badge-Rendering) bleibt dem User-Smoke vorbehalten — siehe §7 Quirk 6.

| # | Test | Ergebnis |
|---|---|---|
| ① | KK-Fixture (6 Zeilen: 2× „Einzahlung" >0, 1× „Ausgleich Kreditkarte gem" +8,47, 2 Käufe <0, 1 „Entgelt" −2,49) via `DKB_VISA` | ✅ `inserted=6, internal_transfers=3, auto_absorbed=0`; View: exakt 3× `INTERNAL_TRANSFER`, 3× `UNASSIGNED`/`transfer_type NULL` |
| ③ | Konsum neben Transfer im selben Batch | ✅ mit ① abgedeckt — Käufe + Entgelt bleiben `NULL` |
| ④ | Duplikat-Fixture: 2× byte-identisch `TESTDUP PAYPAL −10,00` am 11.06. | ✅ `inserted=2` → 2 Fragmente, `distinct_hashes=2` |
| ④ | **Re-Import** desselben Batches | ✅ `inserted=0, skipped_duplicates=2`, Bestand unverändert (2) — idempotent |
| ② | Giro→Cortal-Fixture „Uebertrag Scalable" −2.700, Gegen-IBAN = Cortal (`own_ibans`) | ✅ auto `INTERNAL_TRANSFER` (`internal_transfers=1`) |
| ② | Markieren (Owner): IT → AR | ✅ `transfer_type='ASSET_REALLOCATION'`, View-`status='ASSET_REALLOCATION'` |
| ② | **Fremd-Owner-Negativtest** (fremde `sub`-UUID) | ✅ `SQLSTATE 42501` „gehört nicht dem aktuellen User", Rollback |
| ② | Rücknahme: AR → NULL | ✅ `transfer_type=NULL`, `status='UNASSIGNED'` (Re-Import würde IT per E3 wiederherstellen) |

**Cleanup:** Alle Testdaten restlos gelöscht (`DELETE FROM fragments WHERE user_id=…`,
Links kaskadiert; es entstanden keine Auto-Absorb-Links und keine Monatszustände).
End-Zustand verifiziert: **0 Fragmente / 0 Links / 0 Monatszustände, 31 Karten +
31 Plan-Zeilen intakt** — die DB ist sauber für den Go-Live-Import.

## 6. git-Log (ein Commit pro Phase, LL-14; alle gepusht)

```
663e973 v2-04 p0: migrations-sql als repo-datei + sprint-docs + schema-doku v3.1 → v3.2 rotation
836bb8b v2-04 p1: dkb-visa kk-parser + format-router + p_format_hint='DKB_VISA'
bc86899 v2-04 p2: interim-verdrahtung set_fragment_asset_reallocation
979ff19 v2-04 p3: ASSET_REALLOCATION im frontend wie INTERNAL_TRANSFER behandeln
(+ dieser Review-Commit)
```

P5 erzeugte bewusst keinen Code-Diff (reine Verifikation) — Beleg liegt in §5.

## 7. Schema-Doku-Patch (A5)

Die Schema-Doku-Pflege v3.1 → **v3.2** war diese Runde **Architekten-/PM-Lieferung** (im
Briefing §1 P6 so gerollt); die Datei `antigravity_finance_schema_summary_v3_2.md` lag im
Working Tree bereit und wurde in P0 committet (Rotation: v3 entfernt). Claude Code hat
gemäß LL-16 **keine** Doku selbst editiert. Ein separater Patch-File entfällt daher.

## 8. Offene Quirks / Fragen an PM

1. **Design-Dokument war im Working Tree überschrieben:** Vor Sprint-Start war
   `antigravity_finance_design_dokument_v3_1_2.md` lokal **byte-identisch mit der neuen
   Schema-Doku v3.2** (offensichtlich versehentliches Überschreiben beim Ablegen der
   PM-Lieferung). Ich habe die Datei aus dem Commit-Stand wiederhergestellt (kein
   Datenverlust — der Inhalt existiert als `…schema_summary_v3_2.md`). **Bitte prüfen,
   ob zusätzlich eine echte Design-Doku-Änderung geplant war**, die dabei verloren
   gegangen sein könnte.
2. **Merge-Reihenfolge mit v2-03:** Branch basiert briefing-konform auf `main`;
   `sprint/v2-03-display-n5-n4b-b3` ist noch nicht gemerged. v2-03 P1 (N5,
   `--fragment-hue`) berührt ebenfalls die Rohmasse-Darstellung → beim zweiten Merge sind
   kleine Konflikte in `interaction-zone.module.css`/`fragment-card.tsx` möglich.
   Merge-Reihenfolge liegt bei Dominik.
3. **Interim-Badge nicht unterscheidend:** `ASSET_REALLOCATION` zeigt dasselbe graue
   „Transfer"-Badge wie `INTERNAL_TRANSFER` — strikt „wie den bisherigen Transfer-Status
   behandeln" (Schema-Doku v3.2). Der Zustand ist über den Interim-Button-Text
   („Umschichtung zurücknehmen") erkennbar. Unterscheidendes Badge = DD-Frage.
4. **Interim-Toggle auf jeder UNASSIGNED-Karte** erzeugt visuelles Rauschen im Stack —
   bewusste Schlichtheit (Briefing: „nichts Aufwendiges"), DD-Geste ersetzt ihn.
5. ~~**Visa-Status-Spalte ungefiltert:** Der Parser übernimmt alle Zeilen unabhängig von
   `Status` („Gebucht"/„Vorgemerkt") — konsistent zum Giro-Parser. Der echte Export
   enthielt ausschließlich „Gebucht". Falls DKB vorgemerkte KK-Umsätze exportiert, können
   Fragmente entstehen, deren Hash sich nach Buchung ändert (Duplikat-Risiko beim
   Folge-Import). Vor dem Go-Live-Import ggf. als PM-Regel klären.~~
   → **Erledigt durch P7 (15.07.2026):** Architekt hat das Duplikat-Risiko bestätigt und
   den Fix freigegeben. Beide DKB-Parser überspringen jetzt Zeilen mit Status ≠ „Gebucht";
   der Import-Toast weist übersprungene Zeilen aus (§4 P7).
6. **Browser-Smoke offen (User):** Portal-Drop des echten KK-Files, Toggle-Klick am
   Scalable-Fragment, AR-Badge-Rendering, Toast-Counter. Die E2E-Kette lief über den
   echten Parser/Router-Code + RPC mit simuliertem Auth-Kontext — der DOM-Pfad ist
   ungeklickt.
7. **Erwartung für den echten KK-Import:** Im realen Visa-Export (89 Zeilen) matchen
   **25 Zeilen** die Transfer-Regel — regel-basiert korrekt (alle Einzahlungen/Ausgleiche),
   nicht nur die 3 Fixture-Instanzen (LL-19 beachten, keine instanz-engen ACs beim Smoke).

## 9. Vorschläge zur CLAUDE.md-Aktualisierung (Vorschlag, keine Ausführung)

- §6 Schema-Referenz: `transfer_type`-Wertemenge v3.2 (`INTERNAL_TRANSFER` |
  `ASSET_REALLOCATION`), Markier-RPC, OQ-B-Trigger `trg_oqb_no_transfer_links`,
  `process_csv_import` V4 (aktiver `p_format_hint` inkl. `DKB_VISA`, Duplikat-Laufnummer
  `|#N` ab 2. Vorkommen), View-Status = konkreter Typ.
- §3 Dateistruktur: `src/lib/dkb-visa-csv.ts`, `supabase/migrations/`.
- Sprint-Protokoll V2: Zeile v2-04.

---

*Sprint v2-04 Review · Antigravity Finance 2.0 · 07. Juli 2026*
