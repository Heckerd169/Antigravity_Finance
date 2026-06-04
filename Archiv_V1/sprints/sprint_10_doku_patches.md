# Sprint 10 — Doku-Patches (Design-Dokument v3)

> **Lieferant:** Claude Code (Sprint-10-Implementierungs-Chat)
> **Adressat:** PM-Chat — Verifikation + Anwendung gemäß LL-16
> **Datum:** 25. Mai 2026
>
> Claude Code editiert die Design-Doku NIE selbst (CLAUDE.md „Was Claude Code
> NIE macht"). Diese Datei liefert die Patches als Anker + Patch-Satz pro Stelle.
> Der PM verifiziert und gibt zur Anwendung frei.

---

## Patch 1 — §2.4 Soft-Delete: implementiertes UI-Hide via `deleted_at`

**Anker:** §2.4 „Soft-Delete-Pattern (Rückgängig-Toast)", neuer Unterabschnitt
am Ende des Abschnitts (die bestehende `deleted_entities`/60s-Cleanup-Beschreibung
für `CARD_END` + `CARD` bleibt unberührt — sie bleibt die Ziel-Architektur für die
beiden destruktiven Aktionen).

**Einzufügen:**

> **„Verbergen" (UI-Hide, V1 implementiert, Sprint 10):** Neben den beiden
> destruktiven Aktionen (`CARD_END`, `CARD`) gibt es eine nicht-destruktive
> Verberg-Geste. Sie setzt `cards.deleted_at` per RPC
> `toggle_card_hidden(p_card_id, p_hidden)` (idempotent; `true` → `deleted_at =
> now()`, `false` → `NULL`) und blendet die Karte sofort aus allen UI-Surfaces
> aus (`WHERE deleted_at IS NULL`). Ein 5-Sekunden-Toast unten Mitte bietet
> „Rückgängig"; nach Ablauf bleibt die Karte verborgen (V1: kein „Versteckte
> Karten verwalten"-Pfad — V2). Past-Month-Verbergen ist erlaubt (keine Sperre).
> **Snapshot-Integrität (§2.1):** `deleted_at` ist ein reiner UI-Concern — die
> Sparrate-RPCs (`calculate_sparrate_for_month`,
> `calculate_planned_sparrate_for_month`, `is_card_active_in_month`) ignorieren
> `deleted_at`, sodass eine spätere Verberg-Aktion keine historische Sparrate
> ändert. Verifiziert: Karte „Netflix" verbergen lässt März 2026 = 2.910,01 €
> unverändert.

---

## Patch 2 — §7 Karten: Kontextmenü-Eintrag „Verbergen" + Ghost-Karten-Hide

**Anker:** §7 „Komponente: Karten", Abschnitt zum Kontextmenü (bei der
„Rückgängig"-Toast-Referenz, Zeile „Triggert 5-Sekunden-Toast … siehe 2.4").

**Einzufügen:**

> **Kontextmenü-Eintrag „Verbergen" (Sprint 10):** Das bestehende `···`-Kontext-
> menü (oben links, sichtbar bei Karten-Hover) trägt den Eintrag „Verbergen". Er
> löst das UI-Hide aus §2.4 aus. **PM-Entscheidung Sprint 10:** „Verbergen" wird
> in das bestehende Kontextmenü konsolidiert (statt eines separaten Dreipunkt-
> Menüs oben rechts) — folgt dem Single-Menu-Modell aus §12.4. Der Eintrag steht
> nach „Betrag anpassen".
>
> **Ghost-/Forecast-Karten sind verbergbar (Sprint 10):** Karten im Ghost-/
> Forecast-Zustand (alle Zukunfts-Karten; vergangene BUDGET-Karten ohne Tap und
> ohne Fragmente) zeigen ein reduziertes Kontextmenü mit **nur** „Verbergen"
> (kein Tap-Catcher, kein „Betrag anpassen"). So ist das Hide-Affordance auf
> jeder Karte verfügbar, ohne Ghost-Karten sonst interaktiv zu machen.

---

## Patch 3 — §9 Sparraten-Treppe: V1-Präzisierungen

**Anker:** §9 „Komponente: Sparraten-Treppe", Abschnitt „Vorjahres-Referenzwert"
bzw. „Interaktion" — die folgenden drei Präzisierungen ergänzen die bestehende
Spec (Berechnung + Visual-Spec bleiben wie dokumentiert).

**Einzufügen (Vorjahres-Referenzwert):**

> **Vorjahres-Endwert = kumulierter Jahresendwert (PM-bestätigt, Sprint 10):**
> Die gold-gestrichelte Linie zeigt die **kumulierte** Jahres-Sparrate des
> Vorjahres (Σ Jan–Dez X-1, also der Treppen-Endpunkt des Vorjahres) — auf
> derselben Skala wie die kumulierte Treppe. **Sonderfall:** Liefert das Vorjahr
> für alle 12 Monate `NULL` (keine Income-Basis, z. B. vor dem ersten getrackten
> Jahr), entfällt die Linie ganz — eine Linie bei 0 € wäre irreführend
> („nichts gespart" vs. „keine Daten"). Ein Teiljahr mit einzelnen `NULL`-Monaten
> summiert dagegen normal (NULL = 0).

**Einzufügen (Interaktion — Klick / Treiber):**

> **Abweichungs-Treiber sind V2 (Sprint 10):** Die Klick-Erklärungszeile unter
> dem Chart ist in V1 ein statischer Hinweis („Treiber-Hinweis: V2"), da die
> Definition von Ausreißern und die Top-3-Abweichungstreiber laut §9 ein
> Analytics-Feature für V2 sind. Entsprechend werden in V1 auch keine
> ⚠-Ereignis-Annotationen an Dots gezeichnet (es existiert keine Ausreißer-
> Datenquelle).

**Einzufügen (Tooltip / Berechnung):**

> **„% monatlich" im Tooltip (Sprint 10):** Die Primärzeile des Hover-Tooltips
> zeigt die monatliche Sparrate als Anteil am Haushalts-Netto (ICH + PARTNER
> net_monthly des jeweils jüngsten Income-Slots). Fehlt eine Netto-Basis, fällt
> die Zeile auf den €-Monatswert zurück.

**Einzufügen (Was explizit NICHT — Tooling):**

> **Tooling ≠ Produkt (Sprint 10):** Die Opacity-Slider und die Jahres-
> Simulations-Buttons aus dem Prototyp `sparrate_treppe_final_v2.html` sind
> Werkzeuge, kein Produkt (analog zum Slider-Ausschluss beim Singularity Ring,
> §5). Das aktive Jahr ergibt sich aus dem `month`-URL-Param.

---

*Sprint-10 Doku-Patches · 25. Mai 2026*
