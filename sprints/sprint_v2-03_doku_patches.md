# Sprint v2-03 — Doku-Patches (LL-16)

> **Von:** Claude Code (Implementierungs-Chat v2-03)
> **An:** PM (Verifikation + Anwendung)
> **Datum:** 6. Juli 2026
> **Ziel-Dokument:** `antigravity_finance_design_dokument_v3_1_2.md` (→ v3.1.3)
> Reine Präzisierungen — keine Abweichungen von der Spec.

---

## Patch 1 — §9 B3: IST-Punkte folgen dem Abschnitt

**Anker (§9, Popup-Abschnitt B3, Satz „…(Fläche + Linie, gleiche Behandlung wie monatlich auf der Welle)"):**

**Befund:** B3 spezifiziert explizit „Fläche + Linie". Die IST-Treppe trägt zusätzlich Monats-**Punkte** — ein teal Punkt auf einem roten Abschnitt wäre inkonsistent. Implementiert: Punkte folgen dem Abschnitt, in dem sie liegen (kumulierter Wert < 0 → rot, sonst teal); der Selektions-Zustand (größerer Punkt) bleibt unverändert.

**Patch-Satz (Ergänzung):**
> „Die Monats-Punkte der IST-Treppe folgen dem Abschnitt, in dem sie liegen (< 0 rot, sonst teal)."

---

## Patch 2 — §5 N4b: Wortlaut „Plan fast 0 €" gilt für den gesamten positiven Degenerations-Bereich

**Anker (§5, Degenerations-Modus b, Bullet „Plan fast 0 € (positiv)"):**

**Befund:** Die Schwelle ist `Plan < 100 €`. Für den gesamten positiven Bereich `0 ≤ Plan < 100 €` (also auch z. B. Plan = 80 €) zeigt die Subzeile den spezifizierten Wortlaut „Plan fast 0 € — +X € gespart" (X = IST). Die Subzeilen-Farbe folgt auch hier dem Differenz-Vorzeichen (IST − Plan), konsistent zum Negativ-Plan-Fall.

**Patch-Satz (Ergänzung hinter dem Bullet):**
> „»Plan fast 0 €« ist der Wortlaut für den gesamten Bereich 0 ≤ Plan < 100 €; X = IST (vorzeichenbehaftet), Subzeilen-Farbe = Differenz-Vorzeichen."

---

## Patch 3 — §5 N4b: Kanten-Fall Differenz exakt 0 bei negativem Plan

**Anker (§5, Degenerations-Modus b, Differenz-Sprache):**

**Befund:** Bei IST = Plan (Differenz exakt 0, z. B. Plan −500 €, IST −500 €) ist „über/unter" unbestimmt. Implementiert als „+0 € über Plan" (teal) — Differenz ≥ 0 zählt als plan-erfüllt; kein eigener dritter Wortlaut erfunden (Regel 3).

**Patch-Satz (Ergänzung):**
> „Differenz exakt 0 → »+0 € über Plan« (teal)."

---

*Sprint v2-03 Doku-Patches · 6. Juli 2026 · Anwendung durch PM nach Verifikation*
