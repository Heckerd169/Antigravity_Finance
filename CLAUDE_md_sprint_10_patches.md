# CLAUDE.md — Sprint-10-Patches

> **Lieferant:** Claude Code (Sprint-10-Implementierungs-Chat)
> **Adressat:** PM-Chat — Verifikation + Anwendung (Claude Code editiert CLAUDE.md
> nie selbst).
> **Datum:** 25. Mai 2026

---

## Patch A — §4 Sprint-Protokoll-Tabelle: Sprint 10 auf „Done"

**Anker:** §4 Tabelle, Zeile Sprint 10.

**Ersetzen:**

> | 10 | Soft-Delete-Pattern (§2.4) + Sparraten-Treppe (§9) | 🟢 Done | sprints/sprint_10_briefing.md | 25.05.2026 |

(Sprint 10 hat beide Kandidaten geliefert — Treppe als Phase 1, Soft-Delete als
Phase 2.)

---

## Patch B — §9 Modell-Empfehlungen: Sprint-10-Befund + Sprint-11-Zeile

**Anker:** §9 Tabelle, Sprint-10-Zeile + Eskalations-Heuristik-Block.

**Ersetzen Sprint-10-Zeile:**

> | Sprint 10 (Treppe + Soft-Delete) | ~~Sonnet 4.6~~ ✓ erledigt — als Opus 4.7
> gefahren; UI-orientiert, aber zwei Spec-Klärungen (Vorjahres-Linie-Semantik,
> Verbergen-Menü-Position) + ein Ghost-Hide-Diagnose-Befund machten PM-Gating-
> Disziplin (LL-13) wertvoll. Keine CSS/DOM-Diagnosekomplexität. |

**Befund-Notiz (optional, für §10-Block):** Sonnet 4.6 wäre laut §9-Empfehlung
ausreichend gewesen; die drei Klärungs-/Diagnose-Punkte waren Spec-Lesart- und
Render-Gating-Fragen, keine Modell-Grenzfälle. Bestätigt: reine UI-Sprints mit
klaren Specs bleiben Sonnet-Komfortzone, sofern keine Mehrdeutigkeit in der Spec.

---

## Patch C — §10 Append-only-Log: Sprint-10-Block

**Anker:** §10, neuer Block am Ende (nach Sprint 9).

**Einzufügen:**

> ### Sprint 10 · APPROVED 25. Mai 2026
> **Komponente:** Sparraten-Treppe (§9, V5'') + Soft-Delete-Karten (§2.4-
> Erweiterung, V4''). Zwei sequenzielle Phasen + Doku-Phase (LL-14). Branch
> `sprint/10-treppe-soft-delete`.
>
> **Voraussetzungen erfüllt:** Sprints 0–9 grün. Architekt-Pre-Sprint-10 live:
> V7''-Defense-in-Depth (`calculate_card_amount_for_month` schließt
> INTERNAL_TRANSFER aus), C.2-Migrationen (Sparrate-/Plan-/Active-RPCs ohne
> `deleted_at`-Filter = snapshot-integer), C.3 RPC `toggle_card_hidden`. §4.6-Anker
> `2910.01` über alle 4 Migrationen stabil.
>
> **Implementierung (3 Commits + chore):**
> - `sprint-10 p1: sparraten-treppe …` — neue Komponente `src/components/treppe/`
>   (SVG, ResizeObserver, kumulierte Teal/Grau-Treppe, gold-gestrichelte
>   Vorjahres-Linie, Hover-Tooltip, Klick-Abweichungszeile). `loader.ts`: 12×2 RPCs
>   + Vorjahres-Endwert via Promise.all, ohne `deleted_at`-Filter.
> - `chore: regenerate supabase types after toggle_card_hidden RPC`.
> - `sprint-10 p2: soft-delete cards …` — `toggleCardHidden`-Wrapper,
>   hide/unhide-Actions, `CardHideProvider` (Context + 5s-Undo-Toast unten Mitte,
>   Portal), „Verbergen" im bestehenden Kontextmenü, `hideOnly`-Modus für Ghost.
> - `docs: sprint 10 doku + claude.md patches`.
>
> **PM-Entscheidungen während des Sprints (LL-13-konform, kein Spontan-Patch):**
> - **Vorjahres-Linie = kumulierter Jahresendwert** (Σ Jan–Dez X-1), nicht der
>   einzelne Dezember-Monatswert (Briefing-L1.2/Perf-Budget vs. §9-Semantik; §9
>   gewinnt). Bei komplett datenlosem Vorjahr → keine Linie statt 0-€-Linie.
> - **Test-Daten-Seed (PM-approved):** ICH-`income_timeline`-Slot 2025-01-01
>   (gross 36.000 / net 1.800) gesetzt, damit die 2026-Ansicht eine echte
>   Gold-Vorjahres-Linie (21.600 €) zeigt (A1.5). Per RAISE-Rollback-Dry-Run
>   vorab verifiziert: §4.6-Anker März 2026 = 2910.01 unverändert (Forward-
>   Inheritance schattet 2025 für 2026).
> - **„Verbergen"-Menü konsolidiert** ins bestehende `···`-Menü oben links
>   (Design-Doku §12.4 Single-Menu), bewusste Abweichung von der Briefing-§5-
>   Position „oben rechts".
> - **Ghost-Hide-Fix (S17-Befund):** Ghost/Forecast-Karten hatten gar kein
>   Hide-Affordance (CardInteractive war hinter `!isGhost` gegated). Fix:
>   `hideOnly`-Modus (nur „Verbergen", kein Tap/Betrag-anpassen), auf jeder Karte
>   gerendert. Erfüllt L2.1 + A2.12.
>
> **Browser-Smoke (User):** Phase 1 S1–S5 grün; Phase 2 S6–S17 grün (S17 nach
> Ghost-Hide-Fix). Snapshot-Integrität verifiziert (Netflix verbergen → März/Mai
> 2026 unverändert). Test-State nach Smoke zurückgesetzt (alle `deleted_at = NULL`).
>
> **UI-Filter-Anker (A2.11):** Einzige `from("cards")`-Query (Karussell +
> `cardNameById`-Badge-Lookup) filtert `deleted_at IS NULL`; Sparrate-Surfaces
> (Ring, Treppe) filtern NICHT. Kein separates `lib/cards.ts`/`lib/distiller.ts` —
> Karten-Loading liegt inline in `page.tsx`.
>
> **Bundle-Stand:** Route `/` 26.2 kB (+3.8 kB ggü. Sprint 9: 22.4 kB), First Load
> 178 kB. SVG-Treppe + Toast-Provider erklären den Zuwachs. `tsc` 0, `next lint`
> 0/0, `next build` 0 Errors. Kein Dev-Helper in Sprint 10 → A3.3 n/a.
>
> **V1-Lücken / Sprint-11-Vorlauf:**
> - V2: „Versteckte Karten verwalten / wieder einblenden"-Pfad (Settings/Overlay).
> - V2: Bestätigungs-Dialog vor Verbergen (V1 = direkt + 5s-Undo).
> - V2: Treppe-Multi-Year-Rolling-Window (V1 = Kalenderjahr).
> - V2: Treppen-Klick-Abweichungs-Treiber-Heuristik im Backend (V1 = statischer
>   „V2"-Hinweis, keine ⚠-Annotationen).
> - V3''/V2-C: Karten-spezifische Badge-Farben (offen seit Sprint 8).
> - V6'': Schema-Doku v3 → v3.1 Pflege (Architekten-Lieferung; Patch-File war für
>   Pre-Sprint-10 vorgesehen).

---

## Patch D (optional) — neue Lesson Learned

**Anker:** §7 Arbeitsregeln, falls der PM die Treppe-Vorjahres-Episode als LL
kodifizieren will.

**Vorschlag:**

> **LL-20: Spec-Mehrdeutigkeit Perf-Budget vs. Semantik — Semantik gewinnt, aber
> PM klärt.** Wenn ein Briefing eine Berechnung sowohl narrativ/semantisch
> (§-autoritativ) als auch über ein Performance-/Aufwands-Budget beschreibt und
> die beiden sich widersprechen (Sprint 10: „Vorjahres-Dezember-Wert" + „12×2+1
> Calls" vs. §9 „Jahresendwert" = kumuliert), ist das Budget deskriptiv, die
> §-Semantik normativ. Claude Code raten nicht — PM-Klärung vor Implementierung,
> auch wenn die §-Lesart eindeutig erscheint (LL-13). Zusätzlich: datenlose
> Referenz-Werte (alle-NULL-Vorjahr) als „keine Anzeige" behandeln, nicht als 0.

---

*CLAUDE.md Sprint-10-Patches · 25. Mai 2026*
