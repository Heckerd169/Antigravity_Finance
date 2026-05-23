# Sprint 8 Review — CSV-Import + Distiller (DKB-only) + Konflikt-6-Cleanup

> **Von:** Claude Code (Implementierungs-Chat, Opus 4.7)
> **Datum:** 22. Mai 2026
> **Branch:** `sprint/08-csv-import`
> **Test-User:** `179cd2c1-bbc2-4fd0-954b-8735eb90f370`
> **Status:** Code komplett (P0–P4), Sanity grün. Browser-Smoke offen
> (User testet S1–S5 gebündelt nach P4 — bewusste Abweichung vom Per-Phase-Smoke).

---

## 1. Commits (6, sequenzielle Phasen gemäß LL-14)

| Phase | Commit | Inhalt |
|---|---|---|
| P0 | `666a23b` | INCOME-Tap-Catcher rendert nur ohne Fragment-Link (L6 + L7) |
| P1 | `45dccc3` | DKB-CSV-Parser mit Format-Erkennung + Fehler-Klassifikation (L1) |
| — | `62a24c6` | `chore`: Supabase-Typen regeneriert (`process_csv_import`) |
| P2 | `a7cca34` | Portal-Live-Verkabelung + RPC-Call + State-Machine (L3) |
| P3 | `f020f36` | Fragment-Stack-Refresh nach Import (L4) |
| P4 | `4ee03ed` | KI-Vorschlag-Badge-Rendering auf Fragment-Cards (L5) |

### Code-Diff (`git diff --stat main...HEAD`, ohne Briefing/Review-Docs)

```
src/app/page.tsx                                   |  60 +++-
src/components/cards/card.tsx                      |  13 +-
src/components/cards/cards.module.css              |  11 +
src/components/interaction-zone/actions.ts         |  23 ++
src/components/interaction-zone/fragment-card.tsx  |  21 +-
src/components/interaction-zone/interaction-zone.module.css | 29 +-
src/components/interaction-zone/interaction-zone.types.ts   |  5 +
src/components/interaction-zone/portal.tsx         |  78 ++++-
src/lib/dkb-csv.ts                                 | 175 +++++++++++  (NEU)
src/lib/rpc.ts                                     |  33 ++-
src/lib/supabase/types.ts                          |   1 +
```

---

## 2. Was implementiert wurde

### P0 — Konflikt-6-Cleanup INCOME (L6 + L7)
- `IncomeCard` (`card.tsx`): `hasFragment = (linkedFragments?.length ?? 0) > 0`,
  `tappable = !hasFragment`. Bei `!isGhost && !tappable` → Klasse `notTappable`.
  Der `tapButton`-Catcher rendert dann nicht (`manually_paid` nicht UI-schreibbar);
  das ⋯-Kontextmenü (Verknüpfte Fragmente / Betrag anpassen) bleibt aktiv.
- `cards.module.css`: `.notTappable { cursor: default }` + Hover-Lift-Suppression.
- State-Resolution **unverändert** (`manuallyPaid || hasFragment`) — nur das
  Tap-Catcher-Rendering ist neu (DD-Spec wortwörtlich).

### P1 — DKB-CSV-Parser (L1)
- Neues, framework-freies Modul `src/lib/dkb-csv.ts`: `parseDkbCsv(text)` →
  `{ ok: true, rows } | { ok: false, errorClass }`.
- Format-Heuristik: Header-Zeile (`"Buchungsdatum"` als erstes Feld + `;`) in den
  ersten 8 Zeilen; sonst `format`.
- CSV-Tokenizer respektiert in-Quotes-Semikolons + `""`-Escapes, **trimmt nicht**
  (Beschreibung byte-exakt).
- Feld-Mapping: `DD.MM.YY[YY]` → ISO (Pivot < 50 → 20YY); deutscher Betrag
  (`1.200,00` → `1200`); `description = "{Empfänger} | {Verwendungszweck}"`.
- Atomar: erste fehlerhafte Datenzeile → `corrupt`, kein partielles Ergebnis.
  0 Datenzeilen → `empty`.

### P2 — Portal-Live-Verkabelung (L3)
- `process_csv_import`-Wrapper in `rpc.ts` (`processCsvImport`, Throw-on-Error,
  Typen `CsvImportRow` / `CsvImportResult`).
- Server-Action `processCsvImportAction` in `interaction-zone/actions.ts`.
- `portal.tsx`: Stub raus. `runImport(file)`: `processing` → `file.text()` →
  `parseDkbCsv` → bei Parse-Fehler `error-{format|empty|corrupt}` (4 s) → sonst
  RPC → bei RPC-Exception `error-corrupt` → `success` (1.5 s) → `default`.
  `processing` hält für die **echte** Dauer (kein künstliches Delay mehr).
- Dev-Buttons (NODE_ENV-gated) bleiben für Visual-Sim (`runFakeSuccessSequence`).

### P3 — Fragment-Stack-Refresh (L4)
- `processCsvImportAction` ruft nach der RPC `revalidatePath("/", "page")`. Da die
  Action aus einer Client-Component awaited wird, liefert Next.js das aktualisierte
  RSC-Payload zurück → Stack zeigt neue Fragmente ohne Reload (manueller Refetch,
  nicht Realtime — Implementierungs-Wahl gemäß L4).

### P4 — KI-Vorschlag-Badge (L5)
- `FragmentRow` um `suggestedCardName: string | null` erweitert.
- `page.tsx`: Badge-Schwellen aus `app_config` gelesen (`badge_threshold`,
  `auto_absorption_threshold`) — **nicht hardcoded** (CLAUDE.md Regel 5),
  Spec-Defaults nur als Defense-in-Depth-Fallback. Karten-Name-Lookup über alle
  nicht-gelöschten Karten. Badge-Gating server-seitig: `confidence ∈
  [badge, auto_absorb)` UND `suggested_card_id != null`.
- `fragment-card.tsx`: Top-Row (Betrag links, Badge rechts), Badge-Text
  `KI-Vorschlag: {Name}` (§12.6).
- CSS: `.fragmentTop` + `.fragmentBadge` (7.5px, 600, uppercase, generische
  Yellow-Soft-Akzent-Farbe `rgba(255,200,60,.5)` als komponenten-lokale Tokens
  — OQ1-Default).

---

## 3. Sanity-Test-Output (alle Phasen)

```
pnpm exec tsc --noEmit   → TypeScript: No errors found
pnpm exec next lint      → ✔ No ESLint warnings or errors
pnpm build               → ✓ Compiled successfully · Route / 22.4 kB / 174 kB First Load
```

**Bundle-Hygiene:** Dev-Buttons-Strings (`Zustand simulieren`, `Fehler: Korrupt`)
in `.next/static/chunks/app/` = **0 Treffer** (Tree-Shaking intakt). Parser/RPC-Code
in `chunks/` vorhanden.

### P1 Parser — interne Unit-Tests (14/14 grün)

Verifiziert via `node --experimental-strip-types` gegen `src/lib/dkb-csv.ts`
(kein committetes Test-File — Projekt hat kein Test-Framework, CLAUDE.md §2):

| Test | Ergebnis |
|---|---|
| S2.1 valide CSV, 3 Zeilen, ISO-Datum, Betrag neg/Tausender/pos | ✓ |
| S2.1 Beschreibung byte-exakt inkl. eingebettetes Semikolon in Quotes | ✓ |
| S2.2 JSON-Inhalt → `format` | ✓ |
| S2.3 Header ohne Datenzeilen → `empty` | ✓ |
| S2.4 unparsbarer Betrag → `corrupt` (kein partielles Ergebnis) | ✓ |
| extra: unparsbares Datum → `corrupt` | ✓ |
| extra: BOM-Präfix toleriert | ✓ |
| extra: `""`-Escape in Beschreibung korrekt entwertet | ✓ |

### §4.6-Anker (S5.1) — Baseline am Code-Complete-Punkt

```sql
select calculate_sparrate_for_month('179cd2c1-…','2026-03-01');  → 2910.01
```
Intakt. P0–P4 berühren keine Sparrate-Logik; März-2026 hat keine Mai-CSV-Daten.

---

## 4. Selbst-Review gegen Akzeptanz-Kriterien

| AC | Kriterium | Status |
|---|---|---|
| AC1 | P0–P4 committed, Build grün | ✅ |
| AC2 | S1.1/S1.2, S2.1–S2.4, S3.1–S3.4 grün | ⏳ S2 grün (intern); S1/S3 = Browser-Smoke offen |
| AC3 | S5.1 = `2910.01` | ✅ (Baseline; finaler Re-Check nach Smoke) |
| AC4 | S4 ≥ 1 Case grün (Badge ODER Auto-Absorb sichtbar) | ⏳ Browser-Smoke offen (Synthetic-CSV vorbereitet) |
| AC5 | §7 Konflikt 6 + §11-Patch-Sätze als Patch-Datei | ✅ `sprints/sprint_08_doku_patches.md` |
| AC6 | CLAUDE.md §9/§10-Patch-Vorschlag | ✅ §7 unten |

---

## 5. Browser-Smoke — vorbereitete Schritte für den User

Synthetic-CSVs liegen in `/tmp` (DKB-konform; bei Bedarf aus den Snippets unten
neu erzeugen):

**`/tmp/dkb_synthetic_s4.csv`** (S4 — Badge + Auto-Absorb):
```
"Girokonto";"DE00000000000000000000"
""
"Kontostand vom 31.05.2026:";"0,00 €"
""
"Buchungsdatum";"Wertstellung";"Status";"Zahlungspflichtige*r";"Zahlungsempfänger*in";"Verwendungszweck";"Umsatztyp";"IBAN";"Betrag (€)";"Gläubiger-ID";"Mandatsreferenz";"Kundenreferenz"
"10.05.26";"10.05.26";"Gebucht";"Max Müller";"Tanken";"Tanken";"Ausgang";"";"-50,00";"";"";""
"10.05.26";"10.05.26";"Gebucht";"Max Müller";"Tanken";"Tanken";"Ausgang";"";"-200,00";"";"";""
```
- Zeile 1 (−50,00): Score ≈ 0.70 → **Badge** „KI-Vorschlag: Tanken" im Stack.
- Zeile 2 (−200,00): Score ≈ 1.00 → **Auto-Absorb**, Tanken-Karte (Mai) wird grün,
  Fragment erscheint NICHT im Stack.

**`/tmp/dkb_cross_account_s3_4.csv`** (S3.4 — Cross-Account, Pfad A):
```
… (Header wie oben) …
"12.05.26";…;"Max Müller";"DKB BANKING";"Uebertrag eigenes Konto";"Ausgang";"DE11";"-1.200,00";…
"13.05.26";…;"DKB BANKING";"Max Müller";"Ausgleich DKB";"Eingang";"DE11";"100,00";…
```
- Beide bleiben unzugeordnet (kein Match auf Miete trotz −1.200 Betrag).

Parser-Dry-Run gegen beide Files: `ok: true`, Beträge/Daten/Beschreibungen korrekt.

**Smoke-Reihenfolge:** S1.1/S1.2 (P0) → S3.1 (echtes Mai-CSV) → S3.2 (Re-Import =
Duplikate) → S3.3 (Stack visuell) → S3.4 (Cross-Account) → S4 (Synthetic) →
**S5.1 final** (`= 2910.01`, sonst kein Merge).

---

## 6. DB-Verifikations-SQL (nach Browser-Smoke auszuführen)

```sql
-- Nach S3.1: neue Fragmente vorhanden?
select count(*) from fragments
 where user_id = '179cd2c1-bbc2-4fd0-954b-8735eb90f370'
   and transaction_date >= '2026-05-01' and transaction_date < '2026-06-01';

-- Nach S4: Auto-Absorb-Link auf Tanken (origin = 'AUTO_ABSORBED')?
select cfl.origin, f.amount, f.description
  from card_fragment_links cfl
  join fragments f on f.id = cfl.fragment_id
 where cfl.origin = 'AUTO_ABSORBED';

-- Nach S4: Badge-Fragment hat confidence im Range + suggested_card_id?
select amount, confidence, suggested_card_id
  from fragments
 where confidence is not null and suggested_card_id is not null;

-- S5.1 final:
select calculate_sparrate_for_month('179cd2c1-bbc2-4fd0-954b-8735eb90f370','2026-03-01');
```

---

## 7. Vorschläge CLAUDE.md-Aktualisierung (als Vorschlag, nicht ausgeführt)

**§4 Sprint-Protokoll:** Sprint 8 → 🟢 Done (nach Browser-Smoke-Approval).

**§9 Sprint-8-Block (§10 Append-only-Log):** Eintrag analog zu Sprint 7.

**Neue Lessons (Vorschlag):**
- **LL-16 (Doku-Patch-Auslieferung):** Wenn ein Briefing Design-Doku-Patches
  fordert, liefert Claude Code diese als separate Patch-Datei
  (`sprints/sprint_NN_doku_patches.md`), **ohne** die Design-/Schema-Doku selbst
  zu editieren (CLAUDE.md-Hartregel). Der PM wendet sie an. Sprint-8-Präzedenz.
- **LL-17 (app_config-Schwellen im Frontend):** Konfidenz-/Badge-Schwellen werden
  server-seitig in `page.tsx` aus `app_config` gelesen und das Gating dort
  vorgenommen; Client-Components erhalten nur aufgelöste Werte
  (`suggestedCardName`). Hält Regel 5 ein und vermeidet Schwellen-Drift.

---

## 8. Offene Fragen / Auffälligkeiten

- **OQ1 (Badge-Farbe):** PM-Default `rgba(255,200,60,.5)` übernommen (generisch,
  alle Badges). Karten-spezifische Farben = V2-C.
- **OQ2/OQ3 (Mehrfach-Match):** Höchster Score gewinnt, Tie → alphabetisch.
  Server-seitig in der RPC bereits so; in Patch-Datei (Patch 3) für §11 dokumentiert.
- **Badge-Breite:** `KI-Vorschlag: {Name}` ist `white-space: nowrap` + `flex-shrink: 0`.
  Bei sehr langen Karten-Namen in der schmalen Stack-Spalte theoretisch eng —
  bei realen Namen (Tanken/Miete/Essen) unkritisch. Falls im Smoke unschön:
  V1.1-Visual-Tweak (Truncation/Wrap), kein Blocker.
- **Keine RPC-Spec-Abweichungen** beobachtet (Architekt-Garantien §2 gelten).
