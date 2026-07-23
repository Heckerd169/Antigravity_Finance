# Doku-Patch — CLAUDE.md-Nachzug v2-02 … v2-04

> **Rolle:** docs-maintainer (Claude Code, LL-16-Verfahren)
> **Datum:** 23.07.2026
> **Ziel-Datei (einzige):** `CLAUDE.md` (Repo-Root)
> **Nicht angefasst:** Design-Doku, Schema-Doku, Code, git
> **Zweck:** CLAUDE.md hing inhaltlich bei v2-01 — Nachzug für v2-02, v2-03, v2-04.

Jede Patch-Stelle: Ziel-Datei · Anker (exaktes Zitat) · Patch (alt → neu / Einfügetext) · Quelle.
Nummerierung folgt dem Auftrag (7 Stellen), mit Unter-Buchstaben für einzelne Anker
innerhalb einer Stelle.

---

## Patch-Stelle 1 — Kopfbereich (Pflegehinweis + Stand-Zeile)

**Ziel-Datei:** CLAUDE.md

**Anker** (Zeilen 4–5, exaktes Zitat, zusammenhängend):
```
> Diese Datei wird vom PM (Opus 4.7) nach jedem abgeschlossenen Sprint aktualisiert.
> **Letzte Aktualisierung:** 24. Mai 2026 · **Nach Sprint:** 9 (Approved)
```

**Patch (alt → neu):**
```
> Diese Datei wird vom zentralen Arbeits-Agenten (Claude Code, PM-Rolle) nach jedem abgeschlossenen Sprint patch-basiert aktualisiert (LL-16).
> **Letzte Aktualisierung:** 23. Juli 2026 · **Nach Sprint:** v2-04 (Approved) + v2-03 (gemerged 23.07.2026)
```

**Quelle:** PM-Fakten/User-Anweisung 22./23.07.2026 (zentraler Arbeits-Agent seit 22.07.2026; nicht in einer Review-Datei dokumentiert).

---

## Patch-Stelle 2 — Sprint-Protokoll V2: drei neue Tabellenzeilen

**Ziel-Datei:** CLAUDE.md

**Anker** (exaktes Zitat, einzige Zeile mit v2-01 in der V2-Tabelle):
```
| v2-01 | Bug-Sprint N1–N4a (direkt auf Prod, Option A) | 🟢 Done | sprints/sprint_v2-01_briefing.md | 26.06.2026 |
```

**Patch (Einfügetext, drei neue Zeilen direkt danach):**
```
| v2-02 | Jahres-Welle + Popup §9 (M3, ersetzt V1-Treppe) | 🟢 Done | sprints/sprint_v2-02_briefing.md | Juli 2026 (Merge vor v2-04) |
| v2-03 | Display: N5 Rohmasse-Grundton + N4b Ring-Degeneration + B3 Popup-Rot | 🟢 Done | sprints/sprint_v2-03_briefing.md | 23.07.2026 (Merge durch Claude Code auf User-Anweisung, Smoke erlassen) |
| v2-04 | Mehrkonten Stufe 1: DKB_VISA + ASSET_REALLOCATION + Hash-Fix | 🟢 Done | sprints/sprint_v2-04_briefing.md | 15.07.2026 |
```

**Datums-Herleitung (Transparenz, nicht Teil des Patch-Texts):**
- v2-02: `sprint_v2-02_review.md` enthält kein explizites Approval-Datum (nur Review-Datum
  4. Juli 2026 und K1-Korrektur-Datum, beide keine „Approved"-Aussage) → Auftrags-Fallback
  „Juli 2026 (Merge vor v2-04)" verwendet.
- v2-03: Datum + Umstand direkt aus PM-Fakten übernommen (nicht im Review dokumentiert —
  Review-Kopf sagt noch „Merge/Deploy liegt beim User", das war vor der Merge-Entscheidung).
- v2-04: `sprint_v2-04_review.md` §4 P7-Nachtrag ist explizit auf „15.07.2026" datiert — das
  jüngste im Review dokumentierte Datum, kein separates „Approved"-Datum vorhanden.

**Quelle:** sprints/sprint_v2-02_review.md (Kopf + K1) · PM-Fakten/User-Anweisung 22./23.07.2026 · sprints/sprint_v2-04_review.md §4 (P7, 15.07.2026).

---

## Patch-Stelle 3 — Fußnote unter der V2-Tabelle

**Ziel-Datei:** CLAUDE.md

**Anker** (exaktes Zitat, zwei Zeilen):
```
**Doku-Stand nach v2-01:** Design-Doku **v3.1.1** (M3 Welle/Popup + v2-01-Patches), Schema-Doku v3.1.
**N4b / N5:** bewusst offen → Design-Direktor Cluster 3 (nicht in v2-01 entschieden).
```

**Patch (alt → neu):**
```
**Doku-Stand nach v2-04:** Design-Doku v3.1.3 (`antigravity_finance_design_dokument_v3_1_3.md`), Schema-Doku v3.2 (`antigravity_finance_schema_summary_v3_2.md`). **N4b / N5 / B3:** durch DD-Cluster 3 entschieden (04.07.2026), umgesetzt in v2-03.
```

**Quelle:** V2/design_direktor_block_1_entscheidungen.md (Cluster 3, 04.07.2026) + sprints/sprint_v2-03_review.md (N5/N4b/B3 umgesetzt) + PM-Fakten (Dateinamen-Rotation v3_1_2→v3_1_3, 23.07.2026).

---

## Patch-Stelle 4 — §10 Append-only-Log: drei neue Sprint-Blöcke ans Ende anhängen

**Ziel-Datei:** CLAUDE.md

**Anker** (exaktes Zitat, letzte Zeile der Datei):
```
Pre-Live-Phase startet.
```

**Patch (Einfügetext, nach dieser Zeile angehängt):**

```
### Sprint v2-02 · APPROVED Juli 2026 (Merge vor v2-04)

**Komponente:** Jahres-Welle + Popup (Design-Doku §9, M3) — ersetzt die V1-Sparraten-Treppe (`src/components/treppe/` entfernt, −699 LOC).

**Kern-Implementierung:** 12-Monats-EUR-Welle hinter dem interaktions-transparenten, bildschirm-zentrierten Ring (Teal = realisiert, Grau = Forecast, Rot `#FF453A` = negativer Monat, Opacity 0.80, genau ein aktiver-Monat-Kreis) · Scrub-Führungslinie + Tooltip über volle Breite inkl. Jahresmitte hinter dem Ring · Klick-Popup mit kumulierter Treppe IST(teal)+Plan(grau), Jahressumme als Held, B6-Goldlinie (Vorjahres-Endwert, datenlos → entfällt) · Header-Ausreißer-Subzeile mit permanent reservierter Zeilenhöhe.

**Korrektur K1** (4. Juli 2026, nach User-Smoke): `<canvas>` als Replaced Element ohne explizite `width/height` — `inset:0` stretcht bei Canvas (anders als bei Divs) nicht auf die Containergröße, die Bitmap lief bei Retina-DPR über die ganze Seite. Fix: `.canvas { width:100%; height:100% }` + Single-Viewport-Layout (`main { height:100dvh; overflow-y:auto }` statt `min-height:100dvh`). Verifiziert per Headless-Chrome-Repro (Bug- und Fix-Variante).

**Offen:** B3-Slot (Popup-Held-Farbe bei kumulativ-negativer Jahressumme) blieb offen für Cluster 3 — gefüllt in v2-03. Treiber-Anzeige zeigt Platzhalter „B2-Heuristik offen" (echte Heuristik = separater Backend-Sprint). Beobachtung: 36 Sparrate-RPC-Calls pro Dashboard-Render (12 IST + 12 Plan + 12 Vorjahr) — nur bei spürbarer Latenz eskalieren, nicht eigenmächtig optimieren.

### Sprint v2-03 · APPROVED 23.07.2026 (Merge durch Claude Code auf User-Anweisung, Smoke erlassen)

**Komponente:** Display-Feinschliff N5 (§8) + N4b (§5) + B3-Fertigstellung (§9-Popup) aus Design-Direktor Cluster 3.

**Kern-Implementierung:** N5 — gemeinsamer Grau-Grundton-Token `--fragment-hue` für alle Rohmasse-Fragmente, Unterscheidung nur über Opacity (0.22 zugeordnet / 0.45 Transfer) + TRANSFER-Badge. N4b — Ring-Subzeile: Cap „> 200 % von Plan" ab `pct > 2`, Degenerations-Modus bei Plan < 100 € (inkl. negativ) mit EUR-Aussage statt %, Subzeilen-Farbe folgt dem Differenz-Vorzeichen, neutraler Arc (nur Spur, keine Füllung). B3 — Popup-Treppe abschnittsweise rot unter der Null-Linie (`#FF453A`), Held folgt dem Endwert-Vorzeichen (füllt den in v2-02 offen gelassenen B3-Slot).

**Korrekturen:** keine.

**Verifikation:** B3-Negativpfad und N4b-Degenerations-Pfad sind im Live-Bestand nicht auslösbar (alle Kumulationen ≥ 0, Live-Plan > 100 €) — per Headless-Chrome-Repro mit real kompiliertem `draw.ts` + synthetischen Kurven nachgewiesen statt per Browser-Smoke.

**Merge-Modus (PM-Entscheid/User-Anweisung 22./23.07.2026, nicht im Review dokumentiert):** Fast-Forward-Merge nach `main` durch Claude Code (PM-Rolle) auf ausdrückliche User-Anweisung; Browser-Smoke bewusst erlassen. Verifikation stattdessen: Headless-Chrome-Repro der Negativpfade (siehe oben), `tsc`/Lint/Build grün, Vercel-Preview grün.

### Sprint v2-04 · APPROVED 15.07.2026

**Komponente:** Mehrkonten Stufe 1 — DKB-Visa-KK-Parser + Format-Router-Erweiterung, Interim-Verdrahtung `set_fragment_asset_reallocation`, Frontend-Status-Pfade für `ASSET_REALLOCATION` (§11). DB-Seite (Migration + RPCs) am 06.07.2026 vom Architekten selbst angewendet (bestätigte, einmalige Sprint-Ausnahme, Briefing §0a — keine Dauerregel).

**Kern-Implementierung:** `src/lib/dkb-visa-csv.ts` (Header-Anker „Belegdatum", `p_format_hint='DKB_VISA'`, KK-Klassifikation Einzahlung/Ausgleich-Kreditkarte-Prefix → `INTERNAL_TRANSFER`) · Router-Reihenfolge Cortal → DKB-Visa → DKB-Giro · `setFragmentAssetReallocation`-Wrapper + schlichter Interim-Text-Button auf der Fragment-Karte (Setzen aus UNASSIGNED/INTERNAL_TRANSFER, Rücknahme aus ASSET_REALLOCATION) · `fragment-card.tsx`: `isTransfer` deckt jetzt beide `transfer_type`-Werte (gedimmt 0.45, graues Badge, `draggable=false`).

**Nachtrag P7** (15.07.2026): „Vorgemerkt"-Zeilen-Filter in beiden DKB-Parsern (Giro + Visa) — Zeilen mit Status ≠ „Gebucht" werden vor der Feld-Validierung übersprungen (vom Architekten bestätigtes Duplikat-Hash-Risiko), Import-Toast weist übersprungene Zeilen aus, eine reine Vorgemerkt-Datei liefert `error-empty`.

**Verifikation (P5, ohne Browser):** echte Parser-/Router-Ausgabe → RPC-Aufruf mit simuliertem Auth-Kontext (LL-18-Pattern) — KK-Transfer-Klassifikation, Fremd-Owner-Negativtest (`42501`), Duplikat-Hash-Idempotenz, AR-Markieren/Rücknahme alle grün.

**Offen:** Finale DD-Geste für `ASSET_REALLOCATION` steht aus — Interim-Button + undifferenziertes Transfer-Badge sind bewusst „nichts Aufwendiges" (Briefing-Vorgabe). Merge-Reihenfolge mit v2-03 (beide berühren Fragment-Card) lag bei Dominik. Realer KK-Import (89 Zeilen/25 Transfer-Kandidaten) noch nicht im Browser gefahren — Browser-Smoke offen beim User.
```

**Quelle:** sprints/sprint_v2-02_review.md (§1–8 + K1) · sprints/sprint_v2-03_review.md (§1–8) + PM-Fakten (Merge-Modus) · sprints/sprint_v2-04_review.md (§1–9, inkl. P7-Nachtrag).

---

## Patch-Stelle 5 — §6: neuer Schema-Befunde-Block „Sprint v2-04"

**Ziel-Datei:** CLAUDE.md

**Anker** (exaktes Zitat, einzige Stelle mit dieser Überschrift):
```
**TypeScript-Typen-Generierung** (nur bei Schema-Änderung):
```

**Patch (Einfügetext, direkt davor eingefügt — Anker-Zeile bleibt am Ende erhalten):**
```
**Wichtige Schema-Befunde aus Sprint v2-04 (Mehrkonten Stufe 1):**
- `fragments.transfer_type`-CHECK erweitert: `NULL` | `'INTERNAL_TRANSFER'` | `'ASSET_REALLOCATION'`. `INTERNAL_TRANSFER` weiterhin automatisch beim Import (IBAN-Erkennung gegen `own_ibans` oder DKB_VISA-Heuristik); `ASSET_REALLOCATION` ausschließlich manuell via `set_fragment_asset_reallocation` (Vermögensumschichtungen wie Broker→Topf, strukturell nicht von Sparüberweisungen unterscheidbar). Beide Typen verhalten sich in allen Berechnungs- und Link-Pfaden identisch — Semantik-Invariante: `transfer_type IS NOT NULL` ⇒ nie an Karten verlinkbar, zählt nie in Karten-Beträge oder Sparrate.
- `process_csv_import`s `p_format_hint` ist jetzt **aktiv** (vorher Future-Proof-Slot ohne Body-Logik): `'DKB'` (Default) | `'CORTAL_CONSORS'` | `'DKB_VISA'`. Bei `'DKB_VISA'` greift zusätzlich zur IBAN-Erkennung die KK-Klassifikationsregel — Zeilen mit `amount > 0` und Beschreibung `ILIKE 'Einzahlung%'` oder `ILIKE 'Ausgleich Kreditkarte%'` → `INTERNAL_TRANSFER` (inkl. OQ-B-Link-Auflösung), da der DKB-Visa-Export keine Gegen-IBAN führt.
- Neue RPC `set_fragment_asset_reallocation(p_fragment_id uuid, p_set boolean DEFAULT true)`: Auth-Pflicht (28000), expliziter Ownership-Check zusätzlich zu RLS (42501). Setzen (`p_set=true`) erlaubt aus `NULL` und `INTERNAL_TRANSFER`→`ASSET_REALLOCATION`, verweigert mit 23514 bei bestehender Karten-Zuordnung (erst lösen, kein stilles Entkoppeln), räumt `suggested_card_id`/`confidence`. Rücknahme (`p_set=false`) nur aus `ASSET_REALLOCATION` → `NULL`; ein IBAN-erkennbares Fragment bekommt beim nächsten Re-Import automatisch wieder `INTERNAL_TRANSFER`. Returns `jsonb` (`{fragment_id, transfer_type}`).
- Neuer Trigger `trg_oqb_no_transfer_links` auf `card_fragment_links` (BEFORE INSERT OR UPDATE OF `fragment_id`, Funktion `enforce_no_transfer_fragment_links()`): weist Links auf Fragmente mit `transfer_type IS NOT NULL` mit 23514 ab — schließt sowohl direktes Client-INSERT unter RLS als auch `create_card_from_fragment`. OQ-B ist damit dreischichtig abgesichert.
- Duplikat-Hash-Fix: `fragments.hash` bekommt bei byte-identischen Zeilen innerhalb eines Import-Batches ab dem 2. Vorkommen das deterministische Suffix `|#N` (N = Vorkommens-Index in Dateireihenfolge; erstes Vorkommen = alte Formel, abwärtskompatibel; Re-Import → gleiche Indizes → gleiche Hashes, idempotent). Bekannte Grenze bleibt: identische Buchungen über zwei separate Teil-Exporte desselben Monats deduplizieren weiterhin — Monats-Exporte vollständig importieren.
- Defense-in-Depth-Filter in `calculate_card_amount_for_month` (bereits Pre-Sprint-10 als `transfer_type IS NULL`-Filter eingeführt) ist type-agnostisch und deckt `ASSET_REALLOCATION` automatisch mit ab, ohne dass die RPC für v2-04 erneut angefasst werden musste — `calculate_sparrate_for_month` ist transitiv geschützt (liest Fragmente ausschließlich über diese Funktion).

**TypeScript-Typen-Generierung** (nur bei Schema-Änderung):
```

**Quelle:** antigravity_finance_schema_summary_v3_2.md (Kopf-Changelog v3.1→v3.2, §4 RPC-Tabellen, §7 Snapshot-Integrität, §12 Trigger-Übersicht).

---

## Patch-Stelle 6 — §6: Schema-Doku-Status-Satz ersetzen (nur diese Stelle, NICHT den §10-Log)

**Ziel-Datei:** CLAUDE.md

**Anker** (exaktes Zitat, kommt nur einmal im Dokument vor — im §6-Block; der ähnliche Satz im
§10-Sprint-9-Log hat einen anderen Wortlaut und wird NICHT angefasst):
```
- **Schema-Doku v3 ist gegenüber diesen Änderungen noch nicht aktualisiert** — Schema-Doku v3 → v3.1 Pflege ist als V6'' vorgemerkt (Architekten-Lieferung).
```

**Patch (alt → neu):**
```
- **Schema-Doku ist seit v2-04 als v3.2 aktiv** (`antigravity_finance_schema_summary_v3_2.md`) — deckt sowohl die Sprint-9-Stufe-1-Änderungen als auch die v2-04-Mehrkonten-Erweiterungen ab (Details siehe Schema-Befunde-Block „Sprint v2-04" unten).
```

**Quelle:** antigravity_finance_schema_summary_v3_2.md (Kopfzeile „Version: 3.2" + Changelog-Block).

---

## Patch-Stelle 7 — Veraltete Datei-Referenzen (§3, §5, §8) + treppe/-Hinweis (§3)

**Ziel-Datei:** CLAUDE.md — vier Datei-Referenz-Ersetzungen + eine Ergänzung, sonst keine
Änderung an Baum/Struktur.

### 7a — §3 Dateibaum, Design-Doku-Zeile

**Anker:** `├── antigravity_finance_design_dokument_v3.md`
**Patch:** → `├── antigravity_finance_design_dokument_v3_1_3.md` (nur der Dateiname; die
bestehende Kommentar-Ausrichtung `← Design-Bibel (read-only)` bleibt unverändert stehen).

### 7b — §3 Dateibaum, Schema-Doku-Zeile

**Anker:** `├── antigravity_finance_schema_summary_v2.md`
**Patch:** → `├── antigravity_finance_schema_summary_v3_2.md` (nur der Dateiname; Kommentar
`← Schema-Bibel (read-only)` bleibt unverändert stehen).

### 7c — §3 Dateibaum, treppe/-Zeile: Hinweis ergänzen

**Anker** (exaktes Zitat):
```
│   │   └── treppe/                                    ← Sprint 9
```
**Patch (alt → neu):**
```
│   │   └── treppe/                                    ← Sprint 9 (ersetzt durch components/welle/ seit v2-02)
```

### 7d — §5 Designreferenzen, erster Absatz

**Anker:** `` (`antigravity_finance_design_dokument_v3.md`) ``
**Patch:** → `` (`antigravity_finance_design_dokument_v3_1_3.md`) `` (nur der Dateiname
innerhalb der Klammer/Backticks; „**Design-Dokument v3**" bleibt unverändert, da nicht
Teil des Auftrags).

### 7e — §8 Sprint-Start-Liste, Punkt 2

**Anker:** `2. antigravity_finance_design_dokument_v3.md`
**Patch:** → `2. antigravity_finance_design_dokument_v3_1_3.md`

### 7f — §8 Sprint-Start-Liste, Punkt 3

**Anker:** `3. antigravity_finance_schema_summary_v2.md`
**Patch:** → `3. antigravity_finance_schema_summary_v3_2.md`

**Quelle (7a–7f):** Dateisystem-Stand Repo-Root (`ls`, 23.07.2026: aktive Dateien
`antigravity_finance_design_dokument_v3_1_3.md` + `antigravity_finance_schema_summary_v3_2.md`)
· sprints/sprint_v2-02_review.md A7 (`src/components/treppe/` gelöscht, −699 LOC) + §5 Vorschlag
(„neu components/welle/").

---

## Anwendungs-Hinweis

Alle Anker sind vor Anwendung einzeln auf Eindeutigkeit im Ziel-Dokument geprüft worden
(je genau ein Treffer, mit Ausnahme der Datei-Referenzen 7a/7b/7d/7e/7f, die je durch
ihren unmittelbaren Kontext — Baum-Präfix `├── `, Klammer/Backtick-Kontext, Listen-Präfix
`2. `/`3. ` — eindeutig gemacht wurden, da der nackte Dateiname mehrfach im Dokument vorkommt).
