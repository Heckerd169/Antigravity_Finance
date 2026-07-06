# Sprint v2-02 — Doku-Patches (LL-16)

> **Von:** Claude Code (Implementierungs-Chat v2-02)
> **An:** PM (Verifikation + Anwendung)
> **Datum:** 4. Juli 2026
> **Ziel-Dokument:** `antigravity_finance_design_dokument_v3_1_1.md` (→ v3.1.2)
> Claude Code editiert die Design-Doku NIE selbst — Patches ausschließlich hier.

---

## Patch 1 — §9 Regime-Grenze: laufender Monat zählt als realisiert

**Anker (§9, Welle — Visuelle Spezifikation, Absatz „Regime-Grenze Teal→Grau"):**
> „Teal reicht **bis einschließlich dem letzten realisierten (abgeschlossenen) Monat** („jetzt"), fix und **unabhängig vom Header-aktiven Monat**."

**Befund:** „realisiert (abgeschlossen)" und „(„jetzt")" lassen zwei Lesarten zu: (a) Grenze = letzter *vollständig abgeschlossener* Monat (heute: Juni, laufender Juli wäre grau) oder (b) Grenze = laufender Kalendermonat („jetzt", Hybridsicht §4). Die Port-Vorlage `welle_v1.html` kodiert Lesart (b): `REALIZED = 2` (März) bei Header-Pill „Laufend" für März.

**Implementiert wurde Lesart (b)** (mockup-konform, „jetzt"-Gloss): Teal reicht bis einschließlich des laufenden Kalendermonats; im Vergangenheitsjahr ist das ganze Fenster teal, im Zukunftsjahr ganz grau.

**Patch-Satz (ersetzt den Klammerzusatz):**
> „Teal reicht bis einschließlich des **laufenden Kalendermonats** („jetzt" — der laufende Monat trägt bereits Realität, Hybridsicht §4.3), fix und unabhängig vom Header-aktiven Monat. Im Vergangenheitsjahr ist das gesamte Fenster teal, im Zukunftsjahr vollständig grau."

**Falls der PM Lesart (a) will:** Ein-Zeilen-Fix in `page.tsx` (`curMonthNum - 2` statt `curMonthNum - 1` + Jahresgrenzen-Behandlung) — bitte explizit beauftragen.

---

## Patch 2 — §9 Welle/Tooltip: NULL-Monate werden als 0 € geführt

**Anker (§9, Berechnungslogik, nach dem Satz „…(NULL = 0)."):**

**Befund:** §9 regelt NULL = 0 nur für die Vorjahres-Summierung. Für das aktive Fenster (z. B. Monate vor dem ersten Income-Slot — auf Prod real: Jan–Apr 2026) war unspezifiziert, was Welle-Geometrie und Tooltip zeigen.

**Implementiert:** NULL-Monate gehen als 0 in die Wellen-Geometrie ein (Linie auf der Nulllinie) und der Tooltip zeigt `+0 €` — konsistent zur kumulierten NULL=0-Regel. Kein eigener „keine Daten"-Zustand pro Monat.

**Patch-Satz (Ergänzung am Ende von „Berechnungslogik"):**
> „Monate, für die die RPC NULL liefert (keine Datenbasis, z. B. vor dem ersten Income-Slot), werden in Welle, Tooltip und Kumulation einheitlich als 0 € geführt."

---

## Patch 3 — §9 Treiber-Platzhalter: Anzeige des offenen B2-Status

**Anker (§9, „Welle-Hover → Tooltip" + Popup-Spezifikation „Monatsklick → Top-3-Treiber"):**

**Befund:** Briefing §4 verlangt Stub-Daten „wie im Mockup". Das Mockup zeigt für drei Monate fiktive Beispiel-Treiber („Miete 1.200 €"), für alle übrigen „B2-Heuristik offen". Neben echten Prod-Finanzdaten wären erfundene Beträge irreführend — implementiert ist deshalb durchgängig der ehrliche Platzhalter „B2-Heuristik offen" (kursiv, gedämpft), in exakt der Display-Struktur des Mockups (Tooltip: `Treiber`-Tag + Top-1-Zeile; Popup: Monats-Box mit Top-3-Liste). Der Stub lebt isoliert in `src/components/welle/drivers-stub.ts` (Monats-Map analog Mockup-`drivers={…}`); die echte B2-Heuristik ersetzt nur dieses Modul, ohne UI-Änderung.

**Patch-Satz (Ergänzung hinter „Top-1-Treiber" in der Tooltip-Zeile):**
> „Bis zur B2-Entscheidung zeigen Top-1/Top-3 den Platzhalter-Status „B2-Heuristik offen"; das Display (Struktur, Position, Tag) ist damit bereits final."

---

*Sprint v2-02 Doku-Patches · 4. Juli 2026 · Anwendung durch PM nach Verifikation*
