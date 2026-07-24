# Doku-Patch 24.07.2026 — CLAUDE.md-Nachzug Testinfrastruktur + Go-Live-Initial-Import

> **Rolle:** docs-maintainer (Claude Code, LL-16-Verfahren)
> **Datum:** 24.07.2026
> **Ziel-Datei (einzige):** `CLAUDE.md` (Repo-Root)
> **Nicht angefasst:** Design-Doku, Schema-Doku, Code, git
> **Zweck:** CLAUDE.md hing bei „Stand: v2-04 + v2-03-Merge". Nachzug für die
> Testinfrastruktur (Playwright-Render-Smoke M0, §9-Pixel-Checks, smoke-agent) und den
> Go-Live-Initial-Import 2026 (Import, Karten-Rückdatierung, Welle-Rot-Fix + B3-Zwilling,
> bekannter SSR-Burst-Issue).
> **Gemeinsame Quelle für alle Patch-Stellen:** User-Freigabe „Go 1+2" vom 24.07.2026 auf
> den PM-Plan (Session des zentralen Arbeits-Agenten, 23./24.07.2026). Kein separates
> Sprint-Review vorhanden — Ops-Meilenstein, kein Feature-Sprint.

Jede Patch-Stelle: Ziel-Datei · Anker (exaktes Zitat) · Patch (alt → neu / Einfügetext) · Quelle.
Nummerierung P1–P5 folgt dem Auftrag.

---

## Patch-Stelle 1 (P1) — Header „Letzte Aktualisierung"

**Ziel-Datei:** CLAUDE.md

**Anker** (exaktes Zitat, Zeile 5):
```
> **Letzte Aktualisierung:** 23. Juli 2026 · **Nach Sprint:** v2-04 (Approved) + v2-03 (gemerged 23.07.2026)
```

**Patch (alt → neu):**
```
> **Letzte Aktualisierung:** 24. Juli 2026 · **Nach:** v2-04 + Go-Live-Initial-Import 2026 + Smoke-Infrastruktur (M0, Pixel-Checks, smoke-agent)
```

**Quelle:** User-Freigabe „Go 1+2" vom 24.07.2026 auf den PM-Plan (Session des zentralen Arbeits-Agenten, 23./24.07.2026).

---

## Patch-Stelle 2 (P2) — §2 Tech-Stack-Tabelle: neue Zeile Playwright

**Ziel-Datei:** CLAUDE.md

**Anker** (exaktes Zitat, einzige ESLint-Zeile der Tabelle):
```
| ESLint | `next/core-web-vitals` | 8.x |
```

**Patch (Einfügetext, direkt danach eingefügt):**
```
| E2E-/Visual-Tests | Playwright (`@playwright/test`) | 1.61.x |
```

**Quelle:** User-Freigabe „Go 1+2" vom 24.07.2026 auf den PM-Plan (Session des zentralen Arbeits-Agenten, 23./24.07.2026).

---

## Patch-Stelle 3 (P3) — §2 „Was NICHT verwendet wird"

**Ziel-Datei:** CLAUDE.md

**Anker** (exaktes Zitat, zwei Zeilen — einzige Stelle im Dokument):
```
**Was NICHT verwendet wird:** kein Tailwind · keine Component-Library · kein State-Manager ·
keine ORM · keine Tests (manuelles Smoke-Testing in V1).
```

**Patch (alt → neu):**
```
**Was NICHT verwendet wird:** kein Tailwind · keine Component-Library · kein State-Manager · keine ORM. **Tests (seit 23./24.07.2026):** Playwright-Render-Smoke (M0, read-only gegen dev/Prod-DB) + deterministische §9-Pixel-Checks (Projekt `visual`, `pnpm test:visual`, synthetische Fixtures ohne Live-Daten). Daten-mutierende E2E weiterhin NUR gegen das Test-Projekt (V2-Gate). Der manuelle Browser-Smoke des Users bleibt Prod-Gate.
```

**Quelle:** User-Freigabe „Go 1+2" vom 24.07.2026 auf den PM-Plan (Session des zentralen Arbeits-Agenten, 23./24.07.2026).

---

## Patch-Stelle 4 (P4) — §3 Dateistruktur: neue Einträge vor `package.json`

**Ziel-Datei:** CLAUDE.md

**Anker** (exaktes Zitat, einzige Baum-Zeile mit `package.json`):
```
├── package.json
```

**Patch (Einfügetext, direkt davor eingefügt — Anker-Zeile bleibt danach unverändert stehen):**
```
├── V2/                                                ← Entscheidungs-/Konzeptdokumente (einzige Heimat, seit 23.07.2026)
├── import_data/                                       ← lokale Konto-Abzüge für Importe (gitignored, NIE committen)
├── tests/
│   └── e2e/                                           ← unauth · auth.setup · render-smoke · visual-pixel (M0 + Pixel-Checks)
├── playwright.config.ts                               ← Projekte: visual (creds-frei) · unauth · setup · render-smoke
├── .claude/
│   └── agents/                                        ← docs-maintainer.md · smoke-agent.md (versioniert)
```

**Quelle:** User-Freigabe „Go 1+2" vom 24.07.2026 auf den PM-Plan (Session des zentralen Arbeits-Agenten, 23./24.07.2026).

---

## Patch-Stelle 5 (P5) — §10 Append-only-Log: neuer Eintrag ans Ende der Datei

**Ziel-Datei:** CLAUDE.md

**Anker** (exaktes Zitat, letzte Zeile der Datei — Ende des Sprint-v2-04-Blocks):
```
**Offen:** Finale DD-Geste für `ASSET_REALLOCATION` steht aus — Interim-Button + undifferenziertes Transfer-Badge sind bewusst „nichts Aufwendiges" (Briefing-Vorgabe). Merge-Reihenfolge mit v2-03 (beide berühren Fragment-Card) lag bei Dominik. Realer KK-Import (89 Zeilen/25 Transfer-Kandidaten) noch nicht im Browser gefahren — Browser-Smoke offen beim User.
```

**Patch (Einfügetext, nach dieser Zeile angehängt):**
```
### Go-Live-Initial-Import 2026 + Smoke-Infrastruktur · 23./24. Juli 2026

**Kein Feature-Sprint — Ops-Meilenstein + Test-/Robustheits-Ausbau durch den zentralen
Arbeits-Agenten (V2-Rolle PM+Architekt); alle Prod-Writes und Merges einzeln User-gegated.**

- **M0 Playwright-Render-Smoke** (23.07.): `playwright.config.ts` + `tests/e2e/`
  (unauth / auth.setup / render-smoke), Auth via UI-Login-storageState
  (`.env.e2e.local`, gitignored). Strikt read-only; 6/6 grün pre-Import.
- **Initial-Import 2026** (23.07., User-Go „Go, alle drei"): 544 Fragmente über die
  produktive `process_csv_import` (authentifiziert als User, RLS-konform) — Giro 307 /
  Cortal 45 / Visa 192. Counter exakt deckungsgleich mit dem LL-18-Dry-Run;
  163 INTERNAL_TRANSFER auto-erkannt (`own_ibans` umfasst 4 IBANs: Giro, Cortal,
  Visa-Verrechnung, KK-Abrechnung), 17 ASSET_REALLOCATION manuell per RPC markiert,
  3 Auto-Absorbs (Spotify Mai–Jul, deltaneutral). Income-Slots (ICH + PARTNER) per
  UPDATE von 2026-05-01 auf 2026-01-01 rückdatiert. Ablauf-Record:
  `V2/golive_import_ablaufplan.md`. 2025-Dateien liegen parse-geprüft bereit, Import offen.
- **Karten-Rückdatierung** (24.07., User-Anweisung): 19 MONTHLY-Karten
  (`first_active_month` + Plan-Slot) auf 2026-01-01; 11 ONCE + 1 ANNUAL (DKV,
  Mai-Stichtag) bewusst im Mai belassen. Jan–Apr-Sparrate seither 1.886,97 €
  (cent-exakt verifiziert).
- **Welle-Rot-Fix** (Commit 3bc2fab, User-Befund + Merge-Go): Rot-Overdraw clippte
  bis zur Plot-Unterkante; der Catmull-Rom-Overshoot am Minimums-Monat blieb teal.
  Clip jetzt bis Canvas-Unterkante. Nachweis per Headless-Pixel-Repro. Design-Doku
  unverändert — Implementierungs-Bug gegen die bestehende §9-M10-Spec.
- **B3-Zwilling Popup-Treppe** (Commit cd1e623): gleiche Fehlerklasse latent in der
  kumulierten Treppe (untere Strichhälfte ragt über die Clip-Kante, wenn das
  kumulative Minimum exakt auf der Plot-Unterkante liegt) — von den neuen
  Pixel-Checks beim ersten Lauf gefunden; im Live-Bestand (noch) unsichtbar.
- **Schicht-1-Pixel-Checks** (Commit 0999a97): Playwright-Projekt `visual`
  (`pnpm test:visual`, creds-frei) — transpiliert das echte `draw.ts` in-process und
  vermisst Canvas-Pixel gegen synthetische Fixtures (Overshoot-Regression /
  kein-Rot-ohne-Negativmonat / B3). `POP_PAD_*` dafür exportiert.
- **Schicht-2 smoke-agent** (Commit 679412d): `.claude/agents/smoke-agent.md` —
  read-only Vision-Smoke (deterministische Suite + Zustands-Screenshots +
  §-Checklisten-Beurteilung). Ersetzt NICHT den menschlichen Prod-Gate-Smoke.
  Daneben seit 23.07.: `.claude/agents/docs-maintainer.md` (LL-16-Doku-Pflege).
- **Known Issue:** intermittierender SSR-Crash unter RPC-Burst (~130 parallele
  Supabase-Calls pro Dashboard-Render): `TypeError: fetch failed / ECONNRESET`,
  Error-Digest 3736018080. Robustheits-Fix (Einmal-Retry idempotenter Lese-Pfade im
  Server-Client-Fetch) umgesetzt 24.07. im selben Merge wie dieser Doku-Nachzug.
  Bulk-RPC `get_cards_with_effective_plan_for_month` (V3-Vormerkung Sprint 5) bleibt
  vorgemerkt, falls Latenz spürbar bleibt.
```

**Quelle:** User-Freigabe „Go 1+2" vom 24.07.2026 auf den PM-Plan (Session des zentralen Arbeits-Agenten, 23./24.07.2026).

---

## Anwendungs-Hinweis

Alle fünf Anker wurden vor Anwendung einzeln auf Eindeutigkeit im Ziel-Dokument geprüft
(je genau ein Treffer, per Grep verifiziert). Design-Doku und Schema-Doku sind vom Auftrag
ausdrücklich ausgenommen — beide Canvas-Fixes (Welle-Rot-Fix + B3-Zwilling) waren reine
Implementierungs-Bugs gegen die bestehende §9-Spec, es gab keine DDL und keine
Spec-Änderung. Relative Datumsangaben aus dem Auftrag sind bereits in absoluten Daten
gehalten (23./24.07.2026 aus der genannten Session).
