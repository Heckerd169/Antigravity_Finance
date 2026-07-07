# Sprint v2-04 — Mehrkonten Stufe 1 (Schema-Sprint, Option A) — v1.2

> **Adressiert an:** Claude Code (App-Layer) · **Backend + Anwendung:** Architekt (Migrations-/RPC-Entwurf **und** Anwendung)
> **Vom:** PM-Chat V2 (Opus 4.7)
> **Datum:** 06. Juli 2026
> **Branch:** `sprint/v2-04-mehrkonten-stufe1`
> **Modell-Empfehlung:** **Opus 4.7** (§8 — Schema/Pipeline/Hash-sensitiv)
> **Grundlage:** `architekt_beschluss_nachtrag_mehrkonten_7_fragen.md` §3 „Stufe 1"
> **Status:** **ENTWURF — Freigabe erforderlich.** Nach Freigabe liefert der Architekt den Migrations-/RPC-Entwurf.

---

## 0. Sprint-Ziel — eine Zeile

Die vier Stufe-1-Bausteine bauen — Transfer-Klassifikation der KK-Zeilen (①), `ASSET_REALLOCATION`-Markierung (②), Defense-in-Depth-Filter (③), Duplikat-Hash-Fix (④) — als anwendungsbereite Migration + RPCs, verifiziert gegen frische Test-Importe.

---

## 0a. Option A — kein Test-Projekt (User-Entscheidung 06.07.2026)

Obwohl dies ein **schema-verändernder** Sprint ist, entfällt das Test-Projekt-Gate hier: Der User **löscht alle bisher importierten Daten** und nutzt die App aktuell **nicht produktiv** → es gibt **keine schützenswerten Daten** und keine eingefrorenen Monatszustände (`closed_at` existiert keiner). Damit ist die verfügbare DB selbst der Wegwerf-Prüfstand; ein separates Projekt hätte keinen Zweck.

> **⚠ Einmalige Ausnahme, keine Regeländerung.** Das Test-Projekt-Gate (CLAUDE.md §4) bleibt in Kraft. Sobald der saubere Go-Live-Import gelaufen ist und echte, gepflegte Daten in der DB liegen, **greift das Gate für jeden weiteren Schema-Sprint wieder**. Diese Ausnahme gilt nur für den jetzigen pre-go-live Wegwerf-Zustand.

**Zwei-Personen-Prinzip — für diesen Sprint bewusst gelockert (User-Entscheidung 06.07.2026):** Der Architekt liefert den Migrations-Entwurf **und wendet ihn selbst an** (Supabase MCP), weil der Datenbestand disponibel ist. Er verifiziert nach dem Anwenden per SQL, bevor er an Claude Code (App-Layer) übergibt.
>
> **⚠ Scoped, keine Dauerregel.** Wie die Test-Projekt-Ausnahme gilt auch diese nur für den jetzigen Wegwerf-Zustand. Sobald echte, gepflegte Daten in der DB liegen, greift das Zwei-Personen-Prinzip wieder: **kein AI-Self-Execute von DDL/DML gegen die produktive DB** — dann liefert der Architekt nur den Entwurf und Dominik wendet an.

---

## 1. Scope (phasen-sequenziell, LL-14 · Commit + Push pro Phase)

**Pre-Sprint (Architekt, nach Briefing-Freigabe):** Migrations-Entwurf (DDL) + RPC-Bodies + Hash-Fix-Logik als separater Entwurf. Claude Code setzt darauf auf.

| Phase | Baustein | Lieferung |
|---|---|---|
| **P0** | Vorbereitung | Branch anlegen. Bestätigen: Stufe 0 (`own_ibans` += KK-IBANs) angewendet; Daten-Wipe erfolgt/geplant (§2) |
| **P1** | **① `p_format_hint='DKB_VISA'`** | KK-CSV-Format-Parser + Hint scharf schalten: Zeilen „**Einzahlung**" / „**Ausgleich Kreditkarte**" mit **Betrag > 0** → `INTERNAL_TRANSFER`. Echte KK-Käufe (Debit/negativ) bleiben Konsum |
| **P2** | **② `ASSET_REALLOCATION`** | `fragments.transfer_type`-CHECK um `ASSET_REALLOCATION` erweitern. **Markier-RPC** mit **Ownership-Check** (`auth.uid()` = Fragment-Owner). Semantik: überall wie `INTERNAL_TRANSFER` (nie an Karten verlinkbar, sparraten-neutral), **manuell**, **symmetrisch** (Broker↔Topf). Finale UI-Geste ist **DD-Frage** → hier nur minimale Interim-Verdrahtung |
| **P3** | **③ Defense-in-Depth-Filter** | In den sparraten-/karten-relevanten Pfaden (Sparrate-RPCs, Karten-Link-Eignung, `fragments_with_status`) hart auf **`transfer_type IS NULL`** filtern — für `INTERNAL_TRANSFER` **und** `ASSET_REALLOCATION`, zusätzlich zur bestehenden Regel |
| **P4** | **④ Duplikat-Hash-Fix** | Byte-identische Zeilen **innerhalb eines Import-Batches** erhalten eine deterministische **Laufnummer** (N-tes Vorkommen → Index N), beide bleiben erhalten. **Re-Import-Idempotenz bewahren:** derselbe erneute Import erzeugt dieselben Hashes → keine Duplikate. Realfall: 2× `PAYPAL −10,00` am 11.06. |
| **P5** | Verifikation | Architekt hat Migration angewendet + SQL-verifiziert; Claude Code prüft ①–④ End-to-End gegen frische Test-Importe (§2a); Fremd-Owner-Negativtest (②); Re-Import-Idempotenz (④) |
| **P6** | Doku + Review | Schema-Doku-Patch (Architekt, LL-16, PM wendet an) + Review + git-Push |

**Rollen:** DB-Seite (Migration/CHECK/RPCs/Filter in RPCs+View/Import-Hash) liefert **und wendet der Architekt an** + verifiziert per SQL. App-Layer (Format-Hint-Weitergabe ①, Interim-Verdrahtung der Markier-RPC ②, dass die Frontend-Pfade den ③-Filter respektieren) + End-to-End-Verifikation + git macht **Claude Code**.

### Explizit NICHT in v2-04
| # | Grund |
|---|---|
| **Sauberer Voll-Re-Import** (Giro+Cortal+KK, gesamter Zeitraum) | = V2-Go-Live-Import (User), **nach** Stufe 1. ④ muss davor live sein |
| `accounts`/`source_account_id`/SPAR_ANKER/BROKER/Topf-Delta-RPC/`paired_fragment_id` | vertagt (M9-Kontext, F4) |
| Finale `ASSET_REALLOCATION`-Markier-Geste (Kontextmenü/Badge) | Design-Direktor-Übergabe |
| Erstattungs-Blindfleck (642 € Juni ohne Einnahmen-Karte) | eigenes PM-Thema |

---

## 2. Vorbedingungen

| Vorbedingung | Quelle |
|---|---|
| Briefing freigegeben → Architekt liefert Migrations-/RPC-Entwurf | Pre-Sprint |
| Stufe 0 (`own_ibans` += KK-Aufladung/-Abrechnung; **nie** Visa-Debit/Gemeinschaftskonto) angewendet | Stufenplan Stufe 0 |
| Daten-Wipe erfolgt oder unmittelbar geplant (keine schützenswerten Daten) | User-Entscheidung |

### 2a. Verifikations-Importe (frisch, für P5)
| Baustein | Testdaten |
|---|---|
| ① | KK-CSV-Zeilen „Einzahlung"/„Ausgleich Kreditkarte" (>0) **plus** echte KK-Käufe (negativ) |
| ② | Ein Giro→Cortal-„Übertrag Scalable"-Kandidat |
| ③ | Genuines Konsum-Fragment neben einem Transfer-Fragment |
| ④ | Zwei byte-identische Zeilen im selben Batch (2× `PAYPAL −10,00`) + ein Re-Import desselben Files |

---

## 3. Akzeptanzkriterien

| # | Kriterium | Nachweis |
|---|---|---|
| A0 | `tsc`/`lint`/`build` clean; Migration fehlerfrei angewendet | Output |
| A1 | ①: „Einzahlung"/„Ausgleich"-Zeilen (>0) → `INTERNAL_TRANSFER`; echte KK-Käufe bleiben Konsum | Query |
| A2 | ②: CHECK akzeptiert `ASSET_REALLOCATION`; Markier-RPC setzt ihn **nur** für Owner-Fragmente (Fremd-Owner schlägt fehl); markiertes Fragment nie an Karten verlinkbar + sparraten-neutral | RPC-Test ± |
| A3 | ③: sparraten-/karten-Pfade zählen nur `transfer_type IS NULL`; testweise verlinkter Transfer schlägt **nicht** durch | Query |
| A4 | ④: zwei identische Zeilen bleiben beide erhalten; **Re-Import erzeugt keine Duplikate** | Import + Re-Import-Diff |
| A5 | Schema-Doku-Patch als separate Datei (LL-16) | Datei |
| A6 | git: Branch + Commit/Push pro Phase | git log |

## 4. Verifikation

Läuft direkt auf der (disponiblen) DB: ① KK-Fixture importieren → Klassifikation; ② Markier-RPC positiv/negativ; ③ Sparrate mit/ohne testweise verlinktem Transfer; ④ Dup-Import + Re-Import.

**Danach (außerhalb dieses Sprints):** Der saubere Voll-Re-Import (Giro+Cortal+KK) ist der V2-Go-Live-Import des Users. ⚠ **④ muss vorher live sein** (F7-Sequenz), sonst verschluckt der Hash-UPSERT identische Zeilen über 12 Monate.

---

## 5. Anti-Drift

| # | Regel |
|---|---|
| A1 | **Migration wendet der Architekt selbst an** (für diesen Sprint gelockert, weil Daten disponibel). Prinzip reaktiviert sich, sobald echte Daten in der DB liegen |
| A2 | LL-14 sequenziell, Commit + Push pro Phase (git-Regel) |
| A3 | **OQ-B bleibt:** Transfer-Fragmente (`INTERNAL_TRANSFER` **und** `ASSET_REALLOCATION`) nie an Karten verlinkbar. F6 „Transfer-Drop" wird **nicht** gebaut |
| A4 | ③-Filter ist Defense-in-Depth, **kein** Ersatz für die bestehende Regel — beide Ebenen bleiben |
| A5 | ④ darf Re-Import-Idempotenz **nicht** brechen — deterministische Laufnummer, kein Zufalls-/Zeitstempel-Anteil im Hash |
| A6 | Schema-Doku nie inline editieren — Patch als separate Datei (LL-16) |
| A7 | Migration darf **nur** die vier Bausteine berühren; keine vertagten `accounts`-Teile vorwegnehmen |
| A8 | Test-Projekt-Gate bleibt für künftige Schema-Sprints in Kraft — diese Option-A-Ausnahme gilt nur für den jetzigen Wegwerf-Zustand |

## 6. git-Workflow (stehende Regel)

Branch von `main`, Commit + Push pro Phase (auch die Migrations-SQL landet als Datei im Repo). **Kein** Merge/Deploy, **kein** Force-Push, **keine** Secrets. Merge → `main` macht Dominik nach grüner Verifikation. Die **Migration wendet der Architekt** an (diese Runde).

## 7. Übergaben

- **An Design-Direktor:** finale Markier-Geste für `ASSET_REALLOCATION` (Kontextmenü am Fragment? Badge?). P2 liefert nur RPC + Interim-Verdrahtung.
- **An PM (separat):** Erstattungs-Blindfleck (642 € Juni ohne Einnahmen-Karte) als eigenes Thema „Behandlung von Erstattungen".

## 8. Modell-Empfehlung-Begründung

**Opus 4.7** — Schema-Migration (CHECK), RPC mit Ownership-Check, Klassifikations-Heuristik und **Import-Hash-Idempotenz** sind pipeline-/korrektheitssensitiv (CLAUDE.md §9). Keine Sonnet-Aufgabe.

## 9. PM-Übergabe-Notiz

**Nach Freigabe:** Architekt liefert Migrations-/RPC-Entwurf; dann Claude Code frisch instanziieren mit CLAUDE.md + Schema-Doku v3.1 + Design-Doku v3.1.2 + Beschluss-Nachtrag + Architekten-Entwurf + diesem Briefing.

**Rückgabe im Review:** Sanity, Migrations-Anwendung, Verifikations-Tabelle A1–A4, Fremd-Owner-Negativtest (②), Re-Import-Idempotenz-Beleg (④), git-Log, Schema-Doku-Patch, offene Quirks.

---

*Sprint v2-04 Briefing v1.2 (Option A) · Antigravity Finance 2.0 · 06. Juli 2026*
