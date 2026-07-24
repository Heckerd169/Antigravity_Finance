# Sprint v2-05 — Review: Karten-Lebenszyklus (Beenden/Löschen/Papierkorb)

> **Datum:** 24. Juli 2026 (abends) · **Branch:** `sprint/v2-05-loesch-umbau` (Commit `cd36ff0`, ff-gemerged)
> **Briefing:** `V2/architekt_stufe1_karten_loeschen_m1_m2.md` (Stufe-1-Papier, Beschluss „① alles ja")
> **Ausführung:** Zentraler Arbeits-Agent (PM+Architekt); Merge- und Live-Migrations-Delegation
> für diese Session durch den User explizit erteilt.

---

## 1. Was umgesetzt wurde

**DB (Migration `v2_05_loesch_umbau`, zuerst Übungs-DB, dann Prod):**
5 neue RPCs — `end_card` (inkl. Ende-Aufheben via NULL, ONCE-Ablehnung),
`card_delete_gate` (deletable + Grund-Codes HAS_LINKS/HAS_STATES/HAS_PAST_PLAN),
`delete_card` (Gate-Prüfung 23514, Papierkorb via `schedule_deletion`),
`restore_card` (via `restore_deletion`), `cleanup_expired_card_trash`
(opportunistischer Hard-Delete-Vollzug, DB-Kaskade). `toggle_card_hidden`
ersatzlos entfernt. `cards.deleted_at` ist seither Papierkorb-Marker (§2.4),
nicht mehr Verbergen-Marker.

**Frontend (12 Dateien, +432/−75):** Kontextmenü-Verben „Karte beenden…" /
„Ende aufheben" / „Karte löschen" (Gate-abhängig ausgegraut mit Klartext-Grund),
Beenden-Overlay mit Monatswahl, generalisierter 5s-Undo-Toast
(`card-action-toast-provider`), Bulk-„Alle Verknüpfungen lösen…" (2-Schritt,
alle Monate), Lösch-Tor-Vorberechnung in `page.tsx` (2 Selects statt 31 RPCs),
`hideOnly` → `endDeleteOnly`. Interim-UI bis DD-Feinschliff (M2-Geste offen).

## 2. Übungs-DB-Probe (erstmals volles Test-Projekt-Gate)

Projekt `antigravity-finance-test` (`qyjuzzgqxowqiiwqcahd`, eu-west-1, Free) nach
Runbook `supabase/test_projekt/` aufgebaut. Struktur-Parität zu Prod verifiziert
(10 Tabellen / 82 Spalten / 10 Policies / 6 Trigger / 54 Constraints /
14 Zusatz-Indizes / 6 Enums; bewusste Ausnahmen: `rls_auto_enable`-Helfer,
Brackets-Seed leer). Init-2-Anker: **2.200,00 €** ✓.

**Testlauf T1–T6 (eine Transaktion, selbst-rollback):**

| Test | Ergebnis |
|---|---|
| T1 Beenden: Juli nach Ende (Juni) = 2.000,00 · März unverändert 2.200,00 · nach Aufheben 2.200,00 | ✓ |
| T1b ONCE-Karte beenden → 22023 | ✓ |
| T2 Vergangenheits-Karte: Gate rot (HAS_PAST_PLAN), delete → 23514 | ✓ |
| T3 Zukunfts-Karte: Gate grün → Papierkorb (Trash-Row, deleted_at) → Restore | ✓ |
| T4 Ablauf erzwungen → Cleanup: Karte + Plan (Kaskade) + Trash-Row weg; restaurierte Row bleibt (§2.4) | ✓ |
| T5 Karte mit Link: Gate HAS_LINKS, delete 23514 → nach Detach grün → delete ok | ✓ |
| T6 `toggle_card_hidden` → 42883 (existiert nicht mehr) | ✓ |
| Anker nach allen Tests | 2.200,00 ✓ |

**Befund der Probe:** 1 Bug im Migrations-Entwurf gefunden — `text[] || 'literal'`
wird als Array-Concat geparst (22P02); Fix `array_append`. Genau dafür ist die
Übungs-DB da; der Fix war vor der Live-Migration drin.

## 3. Live-Migration + Verifikation (Prod)

Identische Migration auf `nflkobdfdhncrtjncpmq`. Nachher-Prüfung:
**12-Monats-Kurve exakt unverändert** (Jan–Apr 1.886,97 · Mai −130,98 ·
Juni 4.545,32 · Jul–Dez 1.886,97) · 5 neue RPCs vorhanden · `toggle_card_hidden`
weg · Live-Gate-Beispiel „Miete": `deletable=false, HAS_PAST_PLAN` ✓.
Merge → main (`cd36ff0`) unmittelbar nach der Migration (Fenster, in dem die
alte UI den entfallenen Verbergen-Aufruf hätte treffen können: wenige Minuten,
Single-User, informiert).

## 4. Sanity

`tsc --noEmit` 0 · `next lint` 0/0 · `next build` clean · §9-Pixel-Checks 3/3.
Kein daten-mutierender E2E gegen Prod (Regel eingehalten — alle mutierenden
Tests liefen ausschließlich auf der Übungs-DB).

## 5. Bewusste Interim-Entscheidungen (DD-Feinschliff offen, M2)

Verben-Sprache („Beenden"/„Löschen"), ausgegrauter Lösch-Eintrag mit
Grund-Zeile, Beenden-Overlay-Form, 2-Schritt-Bulk-Detach — alles
Empfehlungs-Defaults aus dem Stufe-1-Papier §5, als Interim gekennzeichnet
(gleiches Muster wie der AR-Button v2-04).

## 6. Offene Punkte

1. DD-Rücksprache M2 (Gesten/Sprache) — nicht blockierend.
2. B2-Backend-Sprint auf derselben Übungs-DB (Slot-Tausch wiederholen).
3. Übungs-DB: `net_estimation_brackets`-Seed bei Bedarf nachziehen (Q10).
4. User-Browser-Smoke der neuen Menü-Flows bei nächster Gelegenheit —
   empfohlen: an einer selbst angelegten Test-Karte (Zukunftsmonat) einmal
   Löschen + Rückgängig durchspielen.
