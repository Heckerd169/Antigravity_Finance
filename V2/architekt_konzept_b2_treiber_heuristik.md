# Architekt-Konzept — B2 Abweichungs-Treiber-Heuristik (Welle-Tooltip + Popup)

> **Von:** Zentraler Arbeits-Agent V2 (PM+Architekt)
> **An:** Dominik (Entscheidungs-Gate) · Design-Direktor (nur §5-Feinschliff)
> **Datum:** 24. Juli 2026
> **Status:** ENTSCHIEDEN 24.07.2026 — E1 (Δ-Definition) ja · E2 (Jahres-RPC) ja · E3 (Sequenz nach Lösch-Sprint) ja · E4 (Rohmasse-Pseudo-Treiber) als offene DD-Frage mitgenommen.
> **Quellen:** Roadmap B2/B5 · DD-Cluster-2-Beschluss („UI-first, Stub, Heuristik als
> separater Backend-Sprint") · `src/components/welle/drivers-stub.ts` (fixer UI-Kontrakt)

---

## 1. Fixer Rahmen (bereits entschieden)

Das Display steht seit v2-02: **Top-1** im Welle-Hover-Tooltip, **Top-3** im
Popup-Monatsklick. Der Stub `drivers-stub.ts` definiert den Modul-Kontrakt
(`DriverEntry { label, isPlaceholder }`, `getTop1Driver(monthIndex)`,
`getTop3Drivers(monthIndex)`) — die echte Heuristik ersetzt **ausschließlich dieses
Modul**, ohne UI-Änderung. Dieses Papier definiert die Heuristik + den Datenpfad.

## 2. Heuristik-Definition (Vorschlag)

**Treiber eines Monats M = Karten, deren Realität am weitesten vom Plan abweicht.**

```
Δ(karte, M) := calculate_card_amount_for_month(karte, M)      -- „displayed amount", §4.3-konform
             − get_effective_plan_for_month(karte, M)          -- Adjustment-aware Plan (Sprint-5-K1.4-Basis)
```

- Ranking über alle in M aktiven Karten nach `|Δ|` absteigend; Top-1 bzw. Top-3.
- `Δ = 0` fällt raus; sind alle 0 → leere Liste (UI-Wording dafür = DD-Feinschliff,
  Vorschlag „Keine Abweichungen" statt des heutigen Platzhalters).
- Label-Format-Vorschlag: `{Kartenname} {+/−Δ formatiert} €` (z. B. „Tanken −37,20 €").
  Vorzeichen aus Karten-Sicht: Δ < 0 = teurer/weniger Einnahme als geplant.
- Beide Basis-RPCs existieren und sind §4.3-komplett (inkl. BUDGET-Sonderlogik,
  Fragment-Awareness, Transfer-Ausschluss) — die Heuristik erfindet **keine**
  eigene Betragslogik (CLAUDE.md §7 Regel 1).

**Bekannte Sichtbarkeits-Grenze (bewusst):** B2 sieht nur Karten-Realität.
Unzugeordnete Rohmasse-Fragmente — inklusive des Erstattungs-Blindflecks
(siehe Optionspapier Erstattungen vom selben Tag) — sind für die Treiber
unsichtbar. B2-Qualität wächst also direkt mit der Kuratierung. Optionale
V2+-Erweiterung (DD-Frage): ein Pseudo-Treiber „n € unzugeordnet in M", der die
Rohmasse-Summe des Monats ausweist.

## 3. Datenpfad — drei Optionen

| Option | Mechanik | Bewertung |
|---|---|---|
| (a) Frontend-Loop | pro Monatsklick 31 Karten × 2 RPCs ≈ 62 Calls | verworfen — Latenz + genau der RPC-Burst, den wir gerade per Retry entschärft haben |
| (b) Monats-RPC `get_month_deviation_drivers(p_month, p_limit)` | eine Read-only-RPC, intern Set-basiert über die beiden Basis-Funktionen | gut für den Popup-Klick, aber der **Tooltip braucht Top-1 für alle 12 Monate** beim Hover → 12 Einzel-Calls beim Mount |
| **(c) Jahres-RPC `get_year_deviation_drivers(p_year, p_limit)`** | ein Call beim Welle-Mount liefert pro Monat die Top-N als jsonb (`{month, drivers:[{card_name, ist, plan, delta}]}`) | **Empfehlung** — deckt Tooltip UND Popup aus einem Call, reduziert den Render-Burst statt ihn zu vergrößern; natürlicher Baustein Richtung B5 (Bulk-Jahres-Kurven) |

Signatur-Konvention wie Hot-Path-RPCs: kein `p_user_id`, `auth.uid()`-basiert,
`SECURITY INVOKER`, Read-only. Frontend: Loader ruft die RPC einmal, `drivers-stub.ts`
wird durch ein Modul ersetzt, das die Map aus dem Loader speist.

## 4. Gate + Sequenzierung

Eine neue RPC ist laut V2-Gate-Wortlaut ein „RPC-Eingriff" → **Test-Projekt zuerst**
(Dry-Run der Migration dort, dann Live). Empfehlung: das Gate **nicht** für additive
Read-only-RPCs aufweichen — das Test-Projekt entsteht ohnehin für den Lösch-Sprint;
B2 folgt unmittelbar danach auf derselben Infrastruktur. Reihenfolge damit:
Test-Projekt → Lösch-Migration → **B2-Backend-Sprint** (Migration + Modul-Tausch +
Smoke; Aufwand ~1 Tag).

## 5. Ehrlicher Daten-Hinweis + DD-Feinschliff

Stand heute sind fast alle Δ = 0 (erst 3 Links) — die Heuristik würde live noch
„Keine Abweichungen" zeigen. Nach der Kuratierung von 1–2 Monaten ist sie sofort
real testbar (z. B. congstar 33–39 € vs. Plan 35, Tanken-Budget-Verbrauch).
DD-Feinschliff (kann parallel zur Umsetzung laufen): Label-Format, Leer-Wording,
optionaler Rohmasse-Pseudo-Treiber.

## 6. Entscheidungspunkte an Dominik

- **E1:** Heuristik-Definition Δ = displayed − effective_plan, Ranking |Δ|? (Empfehlung: ja)
- **E2:** Datenpfad Jahres-RPC Option (c)? (Empfehlung: ja)
- **E3:** Sequenz nach Lösch-Sprint auf dem Test-Projekt? (Empfehlung: ja)
- **E4:** Rohmasse-Pseudo-Treiber als DD-Frage mitnehmen oder V2+-Backlog?

*B2-Konzeptpapier · Antigravity Finance 2.0 · 24. Juli 2026*
