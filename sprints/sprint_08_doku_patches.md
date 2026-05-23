# Sprint 8 — Design-Doku-Patch-Sätze (Output für PM)

> Claude Code editiert die Design-Doku **nicht** (CLAUDE.md „Was Claude Code NIE
> macht"). Diese Datei liefert die im Briefing (L7, AC5) geforderten Patch-Sätze
> als Vorschlag. Der PM wendet sie auf `antigravity_finance_design_dokument_v3.md`
> an.

---

## Patch 1 — §7 Konflikt 6 (anhängen, Phase P0)

**Anker:** Abschnitt „Konflikt 6 — Manuell bezahlt + Eject" (aktuell Z. 680–681).

**Anzuhängender Satz:**

> INCOME-Spezialregel: Ist `hasFragment === true`, wird der Tap-Catcher nicht
> gerendert und der Cursor bleibt `default`. `manually_paid` wird in diesem Fall
> nicht über die UI geschrieben.

---

## Patch 2 — §11 Hash-Algorithmus / Bank-Adapter (anhängen, Phase P4)

**Anker:** Abschnitt „Hash-Algorithmus (Silent De-Duplication)" (aktuell Z. 919–937),
als zusätzlicher Block „Bank-Adapter (DKB-Format)".

**Anzuhängender Block:**

> **Bank-Adapter (DKB-Format, DD-approved):** `description_raw` wird gebildet als
> `"{Zahlungsempfänger*in} | {Verwendungszweck}"` — beide Felder byte-exakt aus der
> CSV-Quelle, ohne Trimming, ohne Normalisierung. Pipe-Separator mit Spaces als
> Trenner. Hash-Determinismus bleibt erhalten.

---

## Patch 3 — §11 Mehrfach-Match (Spec-Lücke OQ2/OQ3, anhängen, Phase P4)

**Anker:** Abschnitt „Schwellwert-Verhalten" (aktuell Z. 970–977), als zusätzlicher
Absatz „Mehrfach-Match".

**Anzuhängender Absatz:**

> **Mehrfach-Match:** Matchen mehrere Karten in derselben Konfidenz-Range
> (0.60–0.95 für Badge bzw. > 0.95 für Auto-Absorption), gewinnt die Karte mit dem
> höchsten Score, deterministisch. Bei Score-Gleichstand entscheidet der
> alphabetisch erste Karten-Name.

---

## Patch 4 — §10 Fragment-Stack-Sortierung (Spec-Lücke, anhängen, Phase P5)

**Anker:** Abschnitt zum Fragment-Stack-Verhalten in §10 (DD-empirisch aus
Prototyp `csv_import_drop_distill.html`).

**Anzuhängender Satz:**

> **Sortierung:** Unzugeordnete Fragmente zuerst, dann zugeordnete (gedimmt).
> Innerhalb beider Gruppen: `transaction_date ASC`, Tiebreaker `imported_at ASC`.
