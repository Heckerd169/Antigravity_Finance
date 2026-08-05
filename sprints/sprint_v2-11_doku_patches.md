# Sprint v2-11 — Doku-Patches

**Ziel-Dokumente:** `antigravity_finance_design_dokument.md` (v3.1.7) ·
`antigravity_finance_schema_summary.md` (v3.4.1)
**Datum:** 05. August 2026
**Anlass:** `BF-5` — die Fragment-Aggregation warf Vorzeichen weg. Beide Bibeln
beschreiben an je einer Stelle etwas, das entweder nie galt oder ab dieser Migration
nicht mehr gilt.
**Verfahren:** §7 Regel 14 / LL-16 — Anker + Patch-Satz je Stelle.
**Status:** ✅ angewendet am 05.08.2026. Alle vier Anker vorher einzeln per
Volltextsuche als eindeutig bestätigt.

---

## Patch 1 — Design-Doku §11: der Satz, der sich selbst widerspricht

**Der eigentliche Befund dieses Sprints.** Der Erstattungs-Leitfaden (Beschluss
24.07.2026) sagt in **einem** Satz zwei Dinge, die einander ausschließen:

> „`calculate_card_amount_for_month` summiert verlinkte Fragmente
> **vorzeichen-agnostisch** — bei BUDGET **senkt die Gutschrift den Verbrauch**"

Vorzeichen-agnostisch zu summieren heißt, Beträge zu addieren statt zu verrechnen.
Eine Gutschrift kann den Verbrauch dann gar nicht senken — sie erhöht ihn. Der zweite
Halbsatz beschreibt das gewünschte Verhalten, der erste die tatsächliche
Implementierung, und beide standen ein Jahr lang nebeneinander.

**Anker:**

```
1. **Retouren/Erstattungen mit Kosten-Bezug** → per Drag auf die verursachende
   Karte (Verrechnung; `calculate_card_amount_for_month` summiert verlinkte
   Fragmente vorzeichen-agnostisch — bei BUDGET senkt die Gutschrift den
   Verbrauch, bei FIXED_COST die Realität).
```

**Patch — ersetzen durch:**

```markdown
1. **Retouren/Erstattungen mit Kosten-Bezug** → per Drag auf die verursachende
   Karte (Verrechnung; `calculate_card_amount_for_month` summiert verlinkte
   Fragmente **vorzeichenrichtig** — Gutschriften und Ausgaben werden gegeneinander
   aufgerechnet, nicht addiert. Bei BUDGET senkt die Gutschrift damit den Verbrauch,
   bei FIXED_COST die Realität).
```

---

## Patch 2 — Design-Doku §11: die widerlegte Schlussfolgerung

**Anker:**

```
Ein Schema-/RPC-Eingriff ist dafür nicht nötig und wurde bewusst verworfen
(Kern-Invariante §4.2: Karten sind die einzige Realitäts-Quelle der Sparrate).
```

**Patch — ersetzen durch:**

```markdown
Ein **Schema**-Eingriff ist dafür nicht nötig (Kern-Invariante §4.2: Karten sind die
einzige Realitäts-Quelle der Sparrate).

> **Korrektur (v2-11, 05.08.2026 — `BF-5`).** Hier stand bis dahin, auch ein
> **RPC**-Eingriff sei nicht nötig und „bewusst verworfen". Das beruhte auf der
> ungeprüften Annahme, `calculate_card_amount_for_month` summiere bereits
> vorzeichenrichtig. Sie tat es nicht: Die Fragment-Aggregation lautete
> `SUM(ABS(f.amount))` und warf jedes Vorzeichen weg. Der Leitfaden hat damit ab dem
> Tag seiner Verabschiedung ein Verhalten beschrieben, das es nie gab — aufgefallen
> ist es erst, als im Juli 2026 zum ersten Mal eine Karte gemischte Vorzeichen
> bekam („Aline Geburtstag": 1.068,11 € angezeigt statt 168,11 €, **900 €** Wirkung
> auf die Juli-Sparrate).
>
> Der RPC-Eingriff ist in **v2-11** nachgeholt worden
> (`supabase/migrations/20260805_v2_11_bf5_vorzeichen.sql`). Die Kern-Invariante
> §4.2 bleibt davon unberührt — geändert hat sich nur, wie die Fragmente **einer**
> Karte zu deren Betrag verrechnet werden.
>
> **Lehre:** Ein Leitfaden, der Verhalten einer Rechenfunktion *beschreibt*, ist
> keine Prüfung dieser Funktion. Wo die Doku eine Zusicherung über Rechenverhalten
> macht, gehört sie gegen die Funktion belegt — nicht aus deren Zweck erschlossen.
```

---

## Patch 3 — Design-Doku §11: Verhalten bei überwiegenden Gutschriften (E2)

**Anker:** derselbe Abschnitt, direkt nach der eingefügten Korrektur aus Patch 2 —
als neuer Absatz am Ende des Kurations-Leitfadens.

**Patch — anfügen:**

```markdown
**Wenn Gutschriften die Ausgaben übersteigen (Beschluss E2, 05.08.2026).** Der
Netto-Betrag zählt so, wie er ist — **auch unter null**. Es wird **nicht** bei 0
gekappt; der negative Verbrauch verbessert die Sparrate entsprechend. Eine Zahl zu
verschlucken wäre genau die Art stiller Ungenauigkeit, die zu den Befunden vom
04.08.2026 geführt hat (vgl. LL-20).

**Reichweite in der Praxis:** Bei **BUDGET** greift zusätzlich §4.3.2 — der Plan
gilt, solange die Fragmente ihn nicht übersteigen (LL-12). Ein negativer
Netto-Verbrauch ist stets ≤ Plan, die Karte zeigt also den Plan; der negative Wert
erreicht die Sparrate bei BUDGET gar nicht. Wirksam wird E2 damit bei **FIXED_COST**
(dort gewinnt immer die Realität) und bei **INCOME**. Beide Fälle sind in v2-11 auf
der Übungs-Datenbank belegt (`sprints/sprint_v2-11_probe.sql`, T4 und T8).
```

---

## Patch 4 — Schema-Doku §4: Rückgabewert ist nicht mehr „immer ≥ 0"

**Anker:**

```
| `calculate_card_amount_for_month(card_id, month)` | Wert auf Karte (Realität → Anpassung → Plan) | `numeric` (immer ≥ 0) |
```

**Patch — ersetzen durch:**

```markdown
| `calculate_card_amount_for_month(card_id, month)` | Wert auf Karte (Realität → Anpassung → Plan) | `numeric` — **seit v2-11 auch negativ möglich** (BF-5/E2: übersteigen die Gutschriften die Ausgaben, ist der Netto-Verbrauch negativ; keine Kappung bei 0) |
```

**Begründung:** Die alte Zusicherung „immer ≥ 0" war eine Folge des Fehlers, nicht
eine Eigenschaft der Fachlichkeit. Sie stimmte nur, weil `ABS` jedes Vorzeichen
entfernte. Aufrufer, die sich darauf verlassen, müssen das wissen — deshalb steht es
im RPC-Katalog und nicht nur in §11.

---

## Versions-Bumps

**Design-Doku 3.1.7 → 3.1.8**, Changelog-Zeile:

```markdown
> **Changelog v3.1.8 (05.08.2026, Sprint v2-11):** §11 Erstattungs-Leitfaden korrigiert — die Aggregation summiert **vorzeichenrichtig**, nicht „vorzeichen-agnostisch"; die Aussage, ein RPC-Eingriff sei nicht nötig, ist widerlegt und als Korrektur kenntlich gemacht (`BF-5`); §11 um das Verhalten bei überwiegenden Gutschriften ergänzt (Beschluss `E2`, keine Kappung bei 0).
```

**Schema-Doku 3.4.1 → 3.4.2**, Changelog-Zeile:

```markdown
> **Changelog v3.4.2 (05.08.2026, Sprint v2-11):** §4 `calculate_card_amount_for_month` — Rückgabewert ist nicht mehr „immer ≥ 0". Die Fragment-Aggregation verrechnet seit `BF-5` vorzeichenrichtig (`SUM(f.amount)` statt `SUM(ABS(f.amount))`); übersteigen die Gutschriften die Ausgaben, ist das Ergebnis negativ (Beschluss `E2` — keine Kappung).
```

---

## Nicht angefasst

- **§4.2 / §4.3** — die Kern-Invariante und die Prioritätsketten sind unverändert
  gültig. Der Fehler saß in der Aggregation, nicht in der Fallunterscheidung.
- **§4.3.2 (BUDGET, Plan gilt bis zur Überschreitung)** — bewusst unverändert. Der
  Patch 3 beschreibt die Wechselwirkung mit E2, ändert die Regel aber nicht.
- **Schema-Doku §4 B2-Treiber** — die Vorzeichen-Formel dort war schon immer
  korrekt (`vorzeichen = +1 für INCOME, −1 für FIXED_COST/BUDGET`) und wird durch
  die Korrektur erstmals auch tatsächlich mit vorzeichenrichtigen Eingangswerten
  gespeist.

---

*Doku-Patches Sprint v2-11 · Antigravity Finance · 05. August 2026*
