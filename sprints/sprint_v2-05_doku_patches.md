# Doku-Patches — Sprint v2-05 (Karten-Lebenszyklus)

**Datum:** 24. Juli 2026
**Quelle:** User-Beschluss 24.07.2026 („① alles ja") auf `V2/architekt_stufe1_karten_loeschen_m1_m2.md`
(E1–E4) + Sprint-Ausführung 24.07.2026 abends (verifizierte Fakten laut Auftrag:
DB-Migration `v2_05_loesch_umbau` — zuerst Übungs-DB `qyjuzzgqxowqiiwqcahd` Testlauf
T1–T6 grün, dann identisch Prod `nflkobdfdhncrtjncpmq`; Frontend Commit `cd36ff0`).
**Betroffene Ziel-Dokumente:** Schema-Doku, Design-Doku, CLAUDE.md, `V2/architekt_stufe1_karten_loeschen_m1_m2.md`.

---

## 1. Schema-Doku `antigravity_finance_schema_summary.md` — v3.2 → v3.3

### SCHEMA-1 — Header-Bump

**Ziel-Datei:** `antigravity_finance_schema_summary.md`
**Anker (exaktes Zitat):**
```
**Version:** 3.2
**Status:** Datenbankseitig vollständig implementiert (Sprint 0–9 + Pre-Sprint-10-Patches + Sprint v2-04 Mehrkonten Stufe 1)
**Datum:** 06. Juli 2026
```
**Patch (alt → neu):**
```
**Version:** 3.3
**Status:** Datenbankseitig vollständig implementiert (Sprint 0–9 + Pre-Sprint-10-Patches + Sprint v2-04 Mehrkonten Stufe 1 + Sprint v2-05 Karten-Lebenszyklus)
**Datum:** 24. Juli 2026
```
**Quelle/Begründung:** Versions-/Datums-Bump gemäß Grundregel 4 (Patch-Level-Bump bei
Doku-Änderung), Anlass = Sprint v2-05 (Auftrag).

---

### SCHEMA-2 — Changelog-Eintrag v3.2 → v3.3

**Ziel-Datei:** `antigravity_finance_schema_summary.md`
**Anker (exaktes Zitat, Ende v3.1→v3.2-Block bis Anfang `transfer_type`-Block):**
```
- v2-04 Mehrkonten Stufe 1: `transfer_type`-Erweiterung, Markier-RPC, OQ-B-Trigger, DKB_VISA-Format, Duplikat-Hash-Fix.

**`transfer_type` — Wertemenge + Semantik (v3.2):**
```
**Patch (Einfügetext zwischen beiden Blöcken):**
```
- v2-04 Mehrkonten Stufe 1: `transfer_type`-Erweiterung, Markier-RPC, OQ-B-Trigger, DKB_VISA-Format, Duplikat-Hash-Fix.

**Änderungen v3.2 → v3.3 (Sprint v2-05 „Karten-Lebenszyklus"):**

- v2-05 Karten-Lebenszyklus: 5 neue RPCs (`end_card`, `card_delete_gate`, `delete_card`, `restore_card`, `cleanup_expired_card_trash`), `toggle_card_hidden` per DROP entfernt (Beschluss E2), `cards.deleted_at` semantisch von Verbergen- zu Papierkorb-Marker gewechselt, Trash-Flow (`schedule_deletion`/`restore_deletion`) für Karten erstmals verdrahtet.

**`transfer_type` — Wertemenge + Semantik (v3.2):**
```
**Quelle/Begründung:** Changelog-Pflicht bei Versions-Bump (Grundregel 4); Inhalt = 1:1
aus den verifizierten Sprint-v2-05-Fakten des Auftrags.

---

### SCHEMA-3 — RPC-Katalog: „Beim UI-Hide (Sprint 10)" → „Beim Karten-Lebenszyklus (Sprint v2-05)"

**Ziel-Datei:** `antigravity_finance_schema_summary.md`
**Anker (exaktes Zitat, §4 Funktionen-Katalog):**
```
### Beim UI-Hide (Sprint 10)

| Funktion | Wofür | Returns |
|---|---|---|
| `toggle_card_hidden(card_id, hidden boolean)` | Karte aus allen UI-Monatsansichten verbergen (`hidden=true`) oder Hide rückgängig machen (`hidden=false`). Deterministischer Server-Vertrag, kein implicit Toggle. Wirkt **nicht** auf Sparraten-Aggregation — §2.1 Snapshot-Integrität bleibt unberührt | `boolean` (der gesetzte `hidden`-Zustand) |
```
**Patch (alt → neu):**
```
### Beim Karten-Lebenszyklus (Sprint v2-05)

**`toggle_card_hidden(card_id, hidden boolean)` — ENTFERNT (Sprint v2-05, Beschluss E2):** per DROP entfernt, ersatzlos gestrichen (0 versteckte Karten im Bestand zum Migrationszeitpunkt). Ersetzt durch die fünf RPCs unten — alle `SECURITY INVOKER`, `SET search_path TO 'public'`, Auth-Pflicht (28000).

| Funktion | Wofür | Returns |
|---|---|---|
| `end_card(p_card_id uuid, p_last_month date)` | Setzt `cards.last_active_month`. `p_last_month = NULL` hebt das Ende auf. Validierung: Monatserster (22023), `≥ first_active_month` (22023); ONCE-Karten werden abgelehnt (22023, first=last-Constraint). Ownership-Verstoß 42704 | `jsonb` |
| `card_delete_gate(p_card_id uuid)` | STABLE. Lösch-Gate-Prüfung fürs UI (ausgegrauter Lösch-Menüpunkt mit Klartext-Grund). Grund-Codes `HAS_LINKS` (Fragment-Links in irgendeinem Monat), `HAS_STATES` (`card_monthly_states` existiert), `HAS_PAST_PLAN` (`first_active_month` in der Vergangenheit) | `jsonb` (`{deletable boolean, reasons text[]}`) |
| `delete_card(p_card_id uuid)` | Prüft `card_delete_gate` (Verstoß → 23514 mit Gründen), setzt `deleted_at = now()`, legt via bestehendem `schedule_deletion('CARD', id, row-snapshot)` den `deleted_entities`-Eintrag an (`expires_at = now() + trash.retention_seconds`) | `jsonb` (`{card_id, trash_id, expires_at}`) |
| `restore_card(p_card_id uuid)` | Findet den jüngsten offenen Trash-Eintrag der Karte, validiert über bestehendes `restore_deletion` (Ablauf/Row-Lock), setzt `deleted_at = NULL` | `boolean` |
| `cleanup_expired_card_trash()` | Opportunistischer Hard-Delete-Vollzug (Beschluss E3 Option b), vom Frontend vor jeder Lebenszyklus-Aktion aufgerufen: löscht abgelaufene, nicht wiederhergestellte eigene Trash-Karten hart (DB-Kaskade entfernt `card_planned_timeline`/`card_monthly_states`/`card_fragment_links`; Fragmente bleiben, `suggested_card_id` → `NULL`) und entfernt die vollzogenen Trash-Zeilen; wiederhergestellte Trash-Zeilen bleiben dauerhaft (§2.4) | `integer` (Anzahl hart gelöschter Karten) |
```
**Quelle/Begründung:** Auftrag P1(b), RPC-Signaturen/-Semantiken 1:1 aus den
verifizierten Fakten (5 neue RPCs, `toggle_card_hidden`-DROP).

---

### SCHEMA-4 — Trash-Flow-Hinweis (§10.1, wo `deleted_entities` beschrieben ist)

**Ziel-Datei:** `antigravity_finance_schema_summary.md`
**Anker (exaktes Zitat):**
```
**Hinweis V3.1:** Soft-Delete von Karten (`cards.deleted_at`) läuft **nicht** über die Cleanup-Edge-Function. Hide ist explizit reversibel (5s-Toast-„Rückgängig" via `toggle_card_hidden(card_id, false)`) und ohne Retention-Limit — der User soll die Karte selbst entscheiden, ob sie verborgen bleibt. Ein User-Pfad zum Wieder-Einblenden ist V2-Vormerkung.
```
**Patch (Einfügetext direkt danach):**
```
**Hinweis v2-05 (löst Hinweis V3.1 ab):** Der Trash-Flow für Karten ist seit Sprint v2-05 tatsächlich verdrahtet — `delete_card` nutzt das bestehende `schedule_deletion('CARD', id, row-snapshot)`, `restore_card` nutzt das bestehende `restore_deletion(trash_id)`, und `cleanup_expired_card_trash()` vollzieht den Hard-Delete opportunistisch beim nächsten App-Zugriff (Option b aus dem Architekt-Stufe-1-Papier) statt über eine Cleanup-Edge-Function. `cards.deleted_at` ist damit **kein** Verbergen-Marker mehr, sondern ausschließlich Papierkorb-Marker: gesetzt nur von `delete_card`, nur bei grünem `card_delete_gate` (also nie für Karten mit Vergangenheits-Links/-States/-Plan). Die RPC `toggle_card_hidden` ist per DROP entfernt (Beschluss E2) — Hinweis V3.1 oben beschreibt damit einen abgelösten Zustand.
```
**Quelle/Begründung:** Auftrag P1(c) — Trash-Flow seit v2-05 verdrahtet,
`deleted_at`-Semantik-Wechsel Verbergen → Papierkorb.

---

## 2. Design-Doku `antigravity_finance_design_dokument.md` — v3.1.4 → v3.1.5

### DESIGN-1 — §7 Kontextmenü: Karten-Lebenszyklus-Absatz

**Ziel-Datei:** `antigravity_finance_design_dokument.md`
**Anker (exaktes Zitat, letzter Absatz im Kontextmenü-Abschnitt von §7):**
```
**Ghost-/Forecast-Karten sind verbergbar (Sprint 10):** Karten im Ghost-/Forecast-Zustand (alle Zukunfts-Karten; vergangene BUDGET-Karten ohne Tap und ohne Fragmente) zeigen ein reduziertes Kontextmenü mit **nur** „Verbergen" (kein Tap-Catcher, kein „Betrag anpassen"). So ist das Hide-Affordance auf jeder Karte verfügbar, ohne Ghost-Karten sonst interaktiv zu machen.
```
**Patch (Einfügetext direkt danach, vor „### Karten-Frequenzen"):**
```
**Karten-Lebenszyklus im Kontextmenü (v2-05, Beschluss 24.07.2026 — Interim-UI bis DD-Feinschliff M2):**
Der Menüpunkt „Verbergen" ist ersatzlos entfallen. Stattdessen: „Karte beenden…"
(Monatswahl, Default = angezeigter Monat; setzt last_active_month, Vergangenheit
bleibt unberührt; ONCE-Karten haben den Eintrag nicht), „Ende aufheben" (nur bei
gesetztem Ende) und „Karte löschen" (nur bei grünem Lösch-Gate: keine Links,
keine Monats-States, kein Vergangenheits-Plan — sonst ausgegraut mit
Klartext-Grund und Verweis auf »Karte beenden…«). Löschen läuft über den
§2.4-Papierkorb (5-s-Undo-Toast, 60-s-Server-Retention, danach endgültig).
Im Verknüpfte-Fragmente-Overlay zusätzlich „Alle Verknüpfungen lösen…"
(2-Schritt-Bestätigung, wirkt über ALLE Monate; Fragmente fallen verlustfrei
in die Rohmasse zurück).
```
**Quelle/Begründung:** Auftrag P2(a), Wortlaut vollständig vorgegeben (User-Beschluss
24.07.2026 + Sprint-v2-05-Frontend, Commit `cd36ff0`).

---

### DESIGN-2 — Versions-Bump + Changelog

**Ziel-Datei:** `antigravity_finance_design_dokument.md`
**Anker 1 (Header-Version):**
```
**Version:** 3.1.4 (V2 · v2-02 Doku-Nachzug)
```
**Patch 1:**
```
**Version:** 3.1.5 (V2 · v2-02 Doku-Nachzug)
```
**Anker 2 (Changelog-Block):**
```
> **Changelog v3.1.4 (24.07.2026):** §11 um Kurations-Leitfaden „Behandlung von Erstattungen" ergänzt (Beschluss Optionspapier Erstattungen, 24.07.2026).
>
> **Datei-Konvention (23.07.2026):**
```
**Patch 2 (Einfügetext dazwischen):**
```
> **Changelog v3.1.4 (24.07.2026):** §11 um Kurations-Leitfaden „Behandlung von Erstattungen" ergänzt (Beschluss Optionspapier Erstattungen, 24.07.2026).
>
> **Changelog v3.1.5 (24.07.2026):** §7 Karten-Lebenszyklus (Beenden/Löschen/Papierkorb ersetzt Verbergen, Sprint v2-05).
>
> **Datei-Konvention (23.07.2026):**
```
**Quelle/Begründung:** Auftrag P2(b), Versions-/Changelog-Bump-Pflicht (Grundregel 4).

---

## 3. `CLAUDE.md`

### CLAUDE-1 — Header „Letzte Aktualisierung"

**Ziel-Datei:** `CLAUDE.md`
**Anker (exaktes Zitat, aktueller Stand der Datei):**
```
> **Letzte Aktualisierung:** 24. Juli 2026 (abends) · **Nach:** Beschlüsse Lösch/B2/Erstattungen + Steuererstattungs-Karte + Test-Projekt-Vorbereitung
```
**Patch (alt → neu):**
```
> **Letzte Aktualisierung:** 24. Juli 2026 (spät) · **Nach Sprint:** v2-05 (Karten-Lebenszyklus, Done)
```
**Quelle/Begründung:** Auftrag P3(a). Hinweis: Anker weicht vom CLAUDE.md-Stand im
Sitzungs-Kontext-Snapshot ab, da die Datei zwischenzeitlich (selber Tag, früherer
Patch-Lauf „Beschlüsse Lösch/B2/Erstattungen") bereits aktualisiert wurde — Patch
greift auf den tatsächlichen aktuellen Datei-Stand.

---

### CLAUDE-2 — V2-Sprint-Tabelle: neue Zeile nach v2-04

**Ziel-Datei:** `CLAUDE.md`
**Anker (exaktes Zitat):**
```
| v2-04 | Mehrkonten Stufe 1: DKB_VISA + ASSET_REALLOCATION + Hash-Fix | 🟢 Done | sprints/sprint_v2-04_briefing.md | 15.07.2026 |
```
**Patch (Einfügetext direkt danach):**
```
| v2-04 | Mehrkonten Stufe 1: DKB_VISA + ASSET_REALLOCATION + Hash-Fix | 🟢 Done | sprints/sprint_v2-04_briefing.md | 15.07.2026 |
| v2-05 | Karten-Lebenszyklus: Beenden/Löschen/Papierkorb ersetzt Verbergen (M1/M2) + Übungs-DB-Aufbau | 🟢 Done | V2/architekt_stufe1_karten_loeschen_m1_m2.md (Stufe-1-Papier = Briefing) | 24.07.2026 |
```
**Quelle/Begründung:** Auftrag P3(b), Zeile wörtlich vorgegeben.

---

### CLAUDE-3 — „Doku-Stand"-Zeile

**Ziel-Datei:** `CLAUDE.md`
**Anker (exaktes Zitat):**
```
**Doku-Stand nach v2-04:** Design-Doku v3.1.4 (`antigravity_finance_design_dokument.md`), Schema-Doku v3.2 (`antigravity_finance_schema_summary.md`). **N4b / N5 / B3:** durch DD-Cluster 3 entschieden (04.07.2026), umgesetzt in v2-03.
```
**Patch (alt → neu, nur Versionsnummern):**
```
**Doku-Stand nach v2-04:** Design-Doku v3.1.5 (`antigravity_finance_design_dokument.md`), Schema-Doku v3.3 (`antigravity_finance_schema_summary.md`). **N4b / N5 / B3:** durch DD-Cluster 3 entschieden (04.07.2026), umgesetzt in v2-03.
```
**Quelle/Begründung:** Auftrag P3(c) — nur Versionsnummern bumpen, Rest unverändert
(Label „nach v2-04" laut Auftrag ausdrücklich stehen lassen).

---

### CLAUDE-4 — §3 Dateistruktur: `supabase/test_projekt/`

**Ziel-Datei:** `CLAUDE.md`
**Anker (exaktes Zitat):**
```
├── .claude/
│   └── agents/                                        ← docs-maintainer.md · smoke-agent.md (versioniert)
├── package.json
```
**Patch (alt → neu):**
```
├── .claude/
│   └── agents/                                        ← docs-maintainer.md · smoke-agent.md (versioniert)
├── supabase/test_projekt/                             ← Übungs-DB-Runbook + Generator-Queries + Init-2-Seed (24.07.2026)
├── package.json
```
**Quelle/Begründung:** Auftrag P3(d), Zeile wörtlich vorgegeben.

---

### CLAUDE-5 — §6 Schema-Referenz: neuer Befund-Block „Sprint v2-05"

**Ziel-Datei:** `CLAUDE.md`
**Anker (exaktes Zitat, letzte Zeile des v2-04-Blocks):**
```
- Defense-in-Depth-Filter in `calculate_card_amount_for_month` (bereits Pre-Sprint-10 als `transfer_type IS NULL`-Filter eingeführt) ist type-agnostisch und deckt `ASSET_REALLOCATION` automatisch mit ab, ohne dass die RPC für v2-04 erneut angefasst werden musste — `calculate_sparrate_for_month` ist transitiv geschützt (liest Fragmente ausschließlich über diese Funktion).
```
**Patch (Einfügetext direkt danach, vor „**TypeScript-Typen-Generierung**"):**
```
**Wichtige Schema-Befunde aus Sprint v2-05 (Karten-Lebenszyklus):**
- 5 neue RPCs (alle `SECURITY INVOKER`, `SET search_path TO 'public'`, Auth-Pflicht 28000): `end_card(p_card_id uuid, p_last_month date)` setzt `cards.last_active_month` (`p_last_month = NULL` hebt das Ende auf; Validierung Monatserster/`≥ first_active_month` je 22023, ONCE-Karten abgelehnt 22023, Ownership 42704) · `card_delete_gate(p_card_id uuid)` STABLE, returns `{deletable boolean, reasons text[]}` mit Grund-Codes `HAS_LINKS` / `HAS_STATES` / `HAS_PAST_PLAN` fürs UI · `delete_card(p_card_id uuid)` prüft das Gate (Verstoß → 23514 mit Gründen), setzt `deleted_at = now()`, legt via bestehendem `schedule_deletion('CARD', id, row-snapshot)` den `deleted_entities`-Eintrag an (`expires_at = now() + trash.retention_seconds`) · `restore_card(p_card_id uuid)` findet den jüngsten offenen Trash-Eintrag, validiert über bestehendes `restore_deletion`, setzt `deleted_at = NULL` · `cleanup_expired_card_trash()` opportunistischer Hard-Delete-Vollzug (Beschluss E3 Option b, vom Frontend vor jeder Lebenszyklus-Aktion aufgerufen): löscht abgelaufene, nicht wiederhergestellte eigene Trash-Karten hart (DB-Kaskade entfernt planned_timeline/states/links, Fragmente bleiben, `suggested_card_id` → NULL) und entfernt die vollzogenen Trash-Zeilen.
- `toggle_card_hidden(uuid, boolean)` per DROP entfernt — das Sprint-10-Verbergen ist ersatzlos gestrichen (Beschluss E2; 0 versteckte Karten im Bestand zum Migrationszeitpunkt).
- **Semantik-Wechsel `cards.deleted_at`:** vormals Verbergen-Marker (UI-Hide), seit v2-05 ausschließlich Papierkorb-Marker des §2.4-Trash-Flows (gesetzt nur von `delete_card`, nur bei grünem Gate — also nie für Karten mit Vergangenheit). Sparrate-RPCs ignorieren `deleted_at` weiterhin unverändert (§2.1) — da das Gate Vergangenheits-Karten ausschließt und die Retention 60 s beträgt, ist das harmlos.
- Migration `v2_05_loesch_umbau` zuerst auf der Übungs-DB `qyjuzzgqxowqiiwqcahd` geprobt (Testlauf T1–T6 grün, Anker 2.200,00 stabil), dann identisch auf Prod `nflkobdfdhncrtjncpmq`. Prod-12-Monats-Kurve nach Migration exakt unverändert (Jan–Apr 1.886,97 · Mai −130,98 · Juni 4.545,32 · Jul–Dez 1.886,97).
- Übungs-DB-Projekt `antigravity-finance-test` (`qyjuzzgqxowqiiwqcahd`, eu-west-1, Free) nach Runbook `supabase/test_projekt/` aufgebaut, Struktur-Parität zu Prod (10/82/10/6/54/14/6; einzige bewusste Abweichung: `rls_auto_enable`-Eventtrigger-Helfer übersprungen; `net_estimation_brackets`-Seed noch leer), Init-2-Anker 2.200,00. Wird zwischen Sprints pausiert (Slot-Tausch mit „Rennrad-Trainer").
```
**Quelle/Begründung:** Auftrag P3(e), Inhalt aus den verifizierten Fakten des Auftrags
(RPCs, DROP, Semantik-Wechsel, Migrations-Ablauf, Übungs-DB).

---

### CLAUDE-6 — §10 Append: Sprint v2-05

**Ziel-Datei:** `CLAUDE.md`
**Anker (exaktes Zitat, letzter Absatz der Datei):**
```
`supabase/test_projekt/`. Offene User-Entscheidung: Slot freimachen
(„Rennrad-Trainer" pausieren) oder Upgrade — danach ist der Aufbau in wenigen
Minuten ausführbar (erster Schritt der Folge-Session).
```
**Patch (Einfügetext ans Dateiende, direkt danach):**
```
### Sprint v2-05 · DONE 24. Juli 2026 (abends)

**Komponente:** Karten-Lebenszyklus (M1/M2-Beschluss): „Beenden" (last_active_month,
inkl. Aufheben), „Löschen" nur bei grünem Lösch-Gate (keine Links/States/
Vergangenheits-Plan) über den §2.4-Papierkorb (deleted_entities, 60-s-Retention,
opportunistischer Hard-Delete-Vollzug), Bulk-Soft-Detach. Verbergen
(toggle_card_hidden) ersatzlos gestrichen; deleted_at ist jetzt Papierkorb-Marker.

**Vorgehen:** Erstmals komplette Übungs-DB-Probe vor Prod — Test-Projekt
`antigravity-finance-test` (qyjuzzgqxowqiiwqcahd) nach Runbook
`supabase/test_projekt/` aufgebaut (Struktur-Parität, Init-2-Anker 2.200,00);
Migration dort geprobt (Testlauf T1–T6: Beenden-Semantik, ONCE-Ablehnung,
Gate-23514-Fälle, Papierkorb-Restore, Hard-Delete-Kaskade, Verbergen-Wegfall,
Anker stabil — dabei 1 Bug im Entwurf gefunden/gefixt: text[]-Append-Operator),
erst dann identisch live. Prod-12-Monats-Kurve nach Migration exakt unverändert.
Slot-Tausch: „Rennrad-Trainer" für die Dauer der Arbeit pausiert, danach
reaktiviert; Übungs-DB pausiert (Reaktivierung für B2-Sprint per gleichem Tausch).

**Frontend (Commit cd36ff0):** Kontextmenü-Verben mit Gate-abhängigem
Lösch-Eintrag (ausgegraut + Klartext-Grund), Beenden-Overlay (Monatswahl),
generalisierter 5s-Undo-Toast (card-action-toast-provider, vormals
card-hide-provider), Bulk-Detach im Verknüpfte-Fragmente-Overlay,
Lösch-Tor-Vorberechnung in page.tsx über zwei Selects. tsc/lint/build grün,
§9-Pixel-Checks 3/3. Interim-UI bis DD-Feinschliff (M2-Geste offen).

**Offen:** DD-Rücksprache Verben-Sprache/Gesten (M2) · B2-Backend-Sprint auf
derselben Übungs-DB (Tausch wiederholen) · net_estimation_brackets-Seed der
Übungs-DB bei Bedarf.
```
**Quelle/Begründung:** Auftrag P3(f), Wortlaut vollständig vorgegeben. Angehängt an
das tatsächliche Dateiende (nach dem „Beschlüsse Lösch/B2/Erstattungen"-Eintrag,
der die Entscheidung dokumentiert — dieser Eintrag dokumentiert die Ausführung).

---

## 4. `V2/architekt_stufe1_karten_loeschen_m1_m2.md`

### V2DOC-1 — Umsetzung-Zeile nach Status-Zeile

**Ziel-Datei:** `V2/architekt_stufe1_karten_loeschen_m1_m2.md`
**Anker (exaktes Zitat):**
```
> **Status:** ENTSCHIEDEN 24.07.2026 — E1 (Drei-Verben-Modell + Gate) ja · E2 (Verbergen streichen) ja · E3 (Hard-Delete opportunistisch) ja · E4 (Test-Projekt) freigegeben, Anlage aktuell durch Free-Projekt-Limit blockiert (2/2 Slots belegt, siehe Runbook `supabase/test_projekt/README.md`). Umsetzung im Folge-Sprint (neue Session).
```
**Patch (Einfügetext direkt danach):**
```
> **Umsetzung:** 24.07.2026 abends als Sprint v2-05 — Übungs-DB-Probe (T1–T6 grün) → Live-Migration (Kurve unverändert) → UI deployed (Commit cd36ff0). Details: sprints/sprint_v2-05_review.md.
```
**Quelle/Begründung:** Auftrag P4, Zeile wörtlich vorgegeben.

---

## Beobachtungen (keine Patch-Aufträge, nur zur Transparenz — nicht ausgeführt)

- Schema-Doku §4 „RPC-Inventur-Summe: 22 App-RPCs…" ist nach SCHEMA-3 rechnerisch
  veraltet (22 − 1 + 5 = 26). Nicht im Auftrag benannt → nicht angefasst.
- Schema-Doku §5 „Interaktions-Mapping" (Zeilen zu „Letzte Zahlung in Monat X",
  „Karte hard-löschen", „Karte aus UI verbergen") und §6 „Lösch-Logik"-Tabelle
  (Zeile `cards`) referenzieren weiterhin die alte Verbergen-/Hard-Delete-Sprache.
  Nicht im Auftrag benannt → nicht angefasst.
- Design-Doku §7 Kontextmenü-Tabelle (Zeilen „Fixkosten / Einnahmen / Budget" /
  „Karte nie genutzt") und der ältere Absatz „„Karte löschen" (Hard-Delete): Nur
  möglich wenn die Karte nie genutzt wurde…" sind durch das neue Gate-Modell
  (`card_delete_gate`, inkl. `HAS_PAST_PLAN`) präzisiert/überholt. Nicht im Auftrag
  benannt → nicht angefasst.
- `sprints/sprint_v2-05_review.md` (referenziert in V2DOC-1) existiert zum Zeitpunkt
  dieses Patch-Laufs noch nicht im Repo (geprüft per Glob). Patch-Text wurde dennoch
  wörtlich wie im Auftrag vorgegeben übernommen.

---

## Nachtrag 24.07.2026 (spät) — Rest-Fundstellen aus dem Transparenz-Hinweis

> Quelle: Abschluss-Report des docs-maintainer-Laufs (4 gemeldete Alt-Sprache-Stellen).
> Angewendet direkt durch den Arbeits-Agenten (PM-Rolle), gleiche Faktenbasis v2-05.

| # | Ziel | Anker | Patch |
|---|---|---|---|
| N1 | Schema-Doku | „**22 App-RPCs**" (Inventur-Summe) | → **26 App-RPCs** (+5 Lebenszyklus, −toggle_card_hidden) |
| N2 | Schema-Doku §5 | Mapping-Zeile „Karte aus UI verbergen / Hide rückgängig" | → zwei Lebenszyklus-Zeilen (Beenden/Aufheben · Löschen/Rückgängig/Vollzug) |
| N3 | Schema-Doku §6 | cards-Zeile „Drei Pfade: … (c) Soft-Delete (UI-Hide)" | → Drei Pfade seit v2-05 (Beenden · Löschen mit Gate über Papierkorb · Soft-Detach); Verbergen entfallen |
| N4 | Schema-Doku (Lücken-Tabelle) | „Hide-Rückgängig-UI"-Zeile | → als obsolet markiert (Papierkorb/restore_card) |
| N5 | Design-Doku §2.4 | Absatz „Verbergen (UI-Hide, V1 implementiert, Sprint 10)" | → als aufgehoben markiert, historischer Stand erhalten |
| N6 | Design-Doku §7 | Satz „Karte löschen (Hard-Delete): Nur möglich wenn nie genutzt…" | → präzisiert auf das v2-05-Lösch-Gate |
| N7 | Design-Doku §7 | Absätze „Verbergen (Sprint 10)…" + „Ghost-…verbergbar" | → Verbergen aufgehoben; Ghost-Absatz auf Lebenszyklus-Verben angepasst |
