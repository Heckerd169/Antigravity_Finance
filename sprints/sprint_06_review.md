# Sprint 6 Review — Sparrate-Verifikation §4.6

> **Branch:** `sprint/06-sparrate-verification`
> **Datum:** 20. Mai 2026
> **Modell:** Claude Sonnet 4.6 (Begründung: §0.6 Briefing — Pre-Sprint-Spec-Klärung macht Opus überflüssig)
> **Sprint-Charakter:** Verifikations-Sprint + K1-Status-Bug-Fix

---

## 1. Pre-Sprint-Architekten-Verifikations-Status

Alle Voraussetzungen vor Sprint-Start durch Architekten-Pre-Sprint-Auftrag erfüllt:

- **Stufe 1 — Sandbox-Verifikation:** `calculate_sparrate_for_month` liefert cent-genau `2910.01`
- **Stufe 2 — Reset+Seed echter Test-User:** Test-User `179cd2c1-bbc2-4fd0-954b-8735eb90f370` mit §4.6-State versehen; alle 5 Karten + Plan-Zeilen + 2 Monthly-States + 3 Fragmente + 3 Links korrekt gesetzt
- **Architekt-MCP-Cross-Check (read-only):** alle 5 Einzel-Karten-Beträge + Split + Ist-Sparrate + Plan-Sparrate verifiziert

Design-Doku §4.6-Klarstellung (`docs:`-Commit auf `main`): Tanken-Zeile explizit „manuell getappt" ergänzt. Spec-Konsistenz §4.3.3 ↔ §4.6 vor Sprint-Start vollständig geklärt.

---

## 2. Sanity-Check-Output (Baseline)

```
pnpm install              → ok (keine neuen Pakete)
pnpm exec tsc --noEmit    → TypeScript: No errors found
pnpm exec next lint       → ✔ No ESLint warnings or errors
pnpm build                → ✓ Compiled successfully
                             Route / → 21.1 kB, First Load JS 173 kB
                             (identisch zu Sprint 5)
```

---

## 3. Smoke-Test-Tabelle S1–S22

Smoke gegen Test-User März 2026. Initiale Smoke-Befunde (vor K1) + finaler Status nach K1-Patch.

| # | Schritt | Status | Bemerkung |
|---|---|---|---|
| S1 | Login + Default-Render Mai 2026 | ✓ | Dashboard lädt ohne Errors |
| S2 | Navigation zu `?month=2026-03` | ✓ | Cross-Fade-Animation funktioniert |
| S3 | Ring-Zentrum `2.910 €` | ✓ | formatEuroRing (0 Dezimalen), Wert korrekt |
| S4 | Ring-Farbe teal | ✓ | Ist 2.910 > Plan 2.890 → §5-Farblogik greift |
| S5 | Ring-Arc überfüllt | ✓ | Arc zeigt ~100,7 % → leichter Überfüll-Indikator |
| S6 (A4) | Status-Pill `Abgeschlossen` | ✓ | März < Mai (heute) → §6-Logik korrekt |
| S7 (A5) | Linke Flanke `Alles erledigt` | ✓ | Keine Februar-Fragmente im §4.6-Setup |
| S8 (A6) | Miete 1.200,00 € · **BEZAHLT** | ✓ (nach K1) | Vor K1: `OFFEN` — Bug (siehe §7 K1-Block) |
| S9 (A7) | Strom 120,00 € · OFFEN | ✓ | Kein Fragment, kein Tap → OFFEN korrekt |
| S10 (A8) | Netflix 17,99 € · BEZAHLT | ✓ | manually_paid=true → BEZAHLT korrekt |
| S11 (A9) | Tanken 180,00 € · LAUFEND · `Noch 20,00 € frei` | ✓ | V1-Lücke: kein Tap-Visual bei BUDGET (erwartet, §9.3) |
| S12 (A10) | Steuerrückzahlung 800,00 € · **ERHALTEN** | ✓ (nach K1) | Vor K1: `ERWARTET` — Bug (siehe §7 K1-Block) |
| S13 (A11) | Karussell: Miete → Netflix → Strom → Steuerrückzahlung → Tanken | ✓ | FIXED→INCOME→BUDGET, alphabetisch innerhalb Typ |
| S14 (A12) | Fragment-Stack: 3 gedimmte ASSIGNED-Fragmente | ✓ | Alle 3 März-Fragmente korrekt gedimmt |
| S15 (A13) | ICH-Popup Split 60%/40% | ✗ N/A | Income-Split-Popup §10 noch nicht implementiert — Briefing-Fehler PM (A13/S14/S15 waren falsch spezifiziert) |
| S16 (A13) | PARTNER-Popup Split | ✗ N/A | Wie S15 — Komponente §10 fehlt |
| S17 (A16) | SQL Cross-Check `calculate_sparrate_for_month` | ✓ | Pre-Sprint-Architekt-Verifikation: `2910.01` ↔ Ring `2.910 €` (Rundung via formatEuroRing = expected) |
| S18 (A16) | SQL Einzel-Karten-Beträge | ✓ | Pre-Sprint-Architect-MCP-Cross-Check bestätigt alle 5 Werte (§0.5) |
| S19 (A14) | April `?month=2026-04`: Steuer weg, Tanken 200 € | ✓ | ONCE-Karte korrekt nicht sichtbar; Plan 200 € ohne Tap/Fragment |
| S20 (A15) | Februar `?month=2026-02`: Steuer weg, Tanken 200 € | ✓ | Analog April, kein Bonus |
| S21 | Latenz-Beobachtung Soft-Navigation | ✓ | Erster Monatswechsel ~2–3 s, Folge-Navigationen <1 s — V3-Entscheidung notiert (§6 unten) |
| S22 (A18) | Bundle-Grep `chunks/app/` | ✓ | `rg "touchstart\|swipe\|longpress" .next/static/chunks/app/` → 0 Matches |

**Finaler Smoke-Status: 20/22 Schritte grün, 2 N/A (Income-Split-Popup §10 nicht implementiert).**

---

## 4. Cross-Check-Tabelle — Architekt-SQL ↔ Frontend

Werte aus Pre-Sprint-Architekt-MCP-Verifikation (Stufe 1+2, 19. Mai 2026):

| RPC / Prüfpunkt | Architekt-SQL-Output | Frontend-Anzeige | Konsistent? |
|---|---|---|---|
| `calculate_sparrate_for_month(user, '2026-03-01')` | `2910.01` | Ring: `2.910 €` (0 Dezimalen via formatEuroRing) | ✓ |
| `calculate_planned_sparrate_for_month(user, '2026-03-01')` | `2890.01` | Ring-Arc-Nenner (nicht direkt angezeigt) | ✓ |
| `get_split_factor(user, '2026-03-01')` | `0.60` | — (Split-Popup §10 fehlt, nicht testbar) | N/A |
| `calculate_card_amount_for_month(miete, '2026-03-01')` | `1200.00` | Karte: `1.200,00 €` | ✓ |
| `calculate_card_amount_for_month(strom, '2026-03-01')` | `120.00` | Karte: `120,00 €` | ✓ |
| `calculate_card_amount_for_month(netflix, '2026-03-01')` | `17.99` | Karte: `17,99 €` | ✓ |
| `calculate_card_amount_for_month(tanken, '2026-03-01')` | `180.00` | Karte: `180,00 €` | ✓ |
| `calculate_card_amount_for_month(steuer, '2026-03-01')` | `800.00` | Karte: `800,00 €` | ✓ |

**Cross-Check: 7/7 testbare RPCs konsistent mit Frontend.**

---

## 5. Beobachtete Quirks

### 5.1 BUDGET-Tap-Visual-Lücke (V1-erwartet, kein Bug)

Tanken hat `manually_paid=true` (aus §4.6-Setup). Da §7 für BUDGET-Karten nur drei Zustände definiert (Laufend / Überschritten / Ghost) — **kein Bezahlt-Visual** — zeigt die Karte `LAUFEND · 180,00 € · Noch 20,00 € frei`. Das ist korrekt per Spec.

Der Read-Pfad ist korrekt verarbeitet: `calculate_card_amount_for_month` gibt 180 € zurück (Tap + Fragmente ≤ Plan → Realität), Betrag stimmt. Nur kein visueller Tap-Indikator.

**Klassifikation:** Expected V1 Gap. BUDGET-Tap-UI-Geste ist Sprint-7+ Vormerkung.

**UX-Hinweis für PM:** Das LAUFEND-Icon (roter Kreis) ist bei einer bezahlten Budget-Karte irritierend — der User sieht Rot, obwohl das Budget im Plan liegt. Empfehle, diese V1-Lücke in Sprint 7 mit höherer Priorität einzustufen.

### 5.2 Income-Split-Popup §10 nicht implementiert

S15/S16 (A13) aus dem Briefing waren nicht testbar: das ICH/PARTNER-Klick-Target am Ring-Bereich und das Split-Popup §10 existieren noch nicht im Frontend. Sprint 1 hat nur das Onboarding-Popup (`/onboarding`) und das Income-Split-Modal (`src/components/income-split/`) implementiert, das ausschließlich über den Onboarding-Pfad erreichbar ist — kein Dashboard-Klick-Trigger für den Ring-Label.

**Klassifikation:** Fehlende Komponente, kein Bug. Briefing A13/S14/S15 waren falsch spezifiziert (PM-Briefing-Fehler). Empfehle, Income-Split-Popup §10 (Dashboard-Klick-Trigger + Split-Anzeige im Ring-Bereich) in Sprint 7 einzuplanen.

---

## 6. Latenz-Beobachtung S21 — für V3-Entscheidung

**Beobachtung:** Erster Monatswechsel (Mai → März, 3 Navigationsschritte) ca. 2–3 Sekunden. Folge-Navigationen innerhalb derselben Session deutlich schneller (<1 s).

**Kontext:** N+1-Pattern: 3 parallele RPC-Calls pro Karte (`calculateCardAmountForMonth`, `getEffectivePlanForMonth`, `card_monthly_states`-Lookup) = bei 5 Karten 15 parallele Calls in `Promise.all`. Dazu Fragments-Query und Count-Query.

**V3-Entscheidung:** Bei Sprint 7 mit weiteren Karten (Karten-Neuanlage-Flows aus Sprint 5 + 7) könnte die Latenz spürbar steigen. Bulk-RPC `get_cards_with_effective_plan_for_month` als Sprint-7-Parallel-Architekten-Auftrag vormerken, falls der User dort 10+ Karten anlegt.

---

## 7. K1 — Status-Bug Frontend-Fix

### 7.1 Befund (Initial-Smoke)

| Karte | manually_paid | Fragment-Link | Status erwartet | Status vor K1 |
|---|---|---|---|---|
| Miete (FIXED_COST) | false | ✓ (−1.200 €) | Bezahlt | **Offen** ✗ |
| Strom (FIXED_COST) | false | — | Offen | Offen ✓ |
| Netflix (FIXED_COST) | true | — | Bezahlt | Bezahlt ✓ |
| Tanken (BUDGET) | true | ✓ (−180 €) | Laufend | Laufend ✓ |
| Steuerrückzahlung (INCOME) | false | ✓ (+800 €) | Erhalten | **Erwartet** ✗ |

### 7.2 Wurzel-Diagnose

`resolveFixedCostState` und `resolveIncomeState` in `src/components/cards/card.tsx` prüften nur `card.manuallyPaid`, ignorierten `card.linkedFragments`. Da `linkedFragments` bereits server-seitig auf den `targetMonth` gefiltert ist (`f.assigned_month === targetDbDate` in `page.tsx`), war kein zusätzlicher Datenfetch nötig.

**Spec-Basis:** §7 Konflikt 6: „`manually_paid` und `card_fragment_links` sind unabhängige Indikatoren — entweder reicht für Bezahlt-Status."

### 7.3 Patch-Lokalisierung

**Datei:** `src/components/cards/card.tsx`
**Funktionen:** `resolveFixedCostState` (Zeile 86–90) + `resolveIncomeState` (Zeile 92–97)

**Diff:**

```diff
 function resolveFixedCostState(card: EnrichedCard, isFuture: boolean): FixedCostState {
   if (isFuture) return "ghost";
-  return card.manuallyPaid ? "paid" : "open";
+  // §7 Konflikt 6: Fragment-Link und manually_paid sind unabhängige Indikatoren —
+  // entweder reicht für Bezahlt-Status (Sprint 6 K1).
+  const hasFragment = (card.linkedFragments?.length ?? 0) > 0;
+  return card.manuallyPaid || hasFragment ? "paid" : "open";
 }

 function resolveIncomeState(card: EnrichedCard, isFuture: boolean): IncomeState {
   if (isFuture) return "ghost";
-  return card.manuallyPaid ? "received" : "expected";
+  // §7 Konflikt 6: Fragment-Link und manually_paid sind unabhängige Indikatoren —
+  // entweder reicht für Erhalten-Status (Sprint 6 K1).
+  const hasFragment = (card.linkedFragments?.length ?? 0) > 0;
+  return card.manuallyPaid || hasFragment ? "received" : "expected";
 }
```

**Größe:** 8 Zeilen +, 2 Zeilen −. BUDGET-`resolveBudgetState` nicht berührt.

**Kein n+1:** `linkedFragments` war bereits in der `page.tsx`-Loading-Pipeline vorhanden und monatsgefiltert — kein zusätzlicher DB-Call.

### 7.4 Re-Smoke R1–R12 (nach Patch)

| # | Prüfpunkt | Status |
|---|---|---|
| R1 | `/?month=2026-03` neu laden | ✓ |
| R2 | Miete: `1.200,00 € · BEZAHLT · teal · Gemeinsam` | ✓ |
| R3 | Strom: `120,00 € · OFFEN · rot · Gemeinsam` | ✓ |
| R4 | Netflix: `17,99 € · BEZAHLT · teal · Ich` | ✓ |
| R5 | Steuerrückzahlung: `800,00 € · ERHALTEN · teal · Ich` | ✓ |
| R6 | Tanken: `180,00 € · LAUFEND · Noch 20,00 € frei · Ich` (V1-Lücke bleibt) | ✓ |
| R7 | Ring: `2.910 € · teal` | ✓ |
| R8 | April: Steuer weg, Tanken 200 € Plan | ✓ |
| R9 | Februar: Steuer weg, Tanken 200 € Plan | ✓ |
| R10 | `pnpm build`, `tsc --noEmit`, `next lint` | ✓ clean |
| R11 | Bundle-Grep `chunks/app/` | ✓ 0 Matches |
| R12 | Network-Tab: keine n+1-Patterns | ✓ |

**K1-Status: grün, alle 12 Re-Smoke-Schritte bestanden.**

### 7.5 Sanity-Checks (nach K1)

```
pnpm exec tsc --noEmit    → TypeScript: No errors found
pnpm exec next lint       → ✔ No ESLint warnings or errors
pnpm build                → Route / → 21.1 kB, First Load JS 173 kB
                             (identisch zu Sprint 5 + Sprint 6 Baseline)
rg "touchstart|swipe|longpress" .next/static/chunks/app/  → 0 Matches
```

---

## 8. Bundle-Grep-Output (LL-4-Pattern)

```
$ rg "touchstart|swipe|longpress" .next/static/chunks/app/
0 matches

$ rg "Force currentSparrate" .next/static/chunks/app/
0 matches
```

---

## 9. V1-Eingangs-Beobachtungen für Sprint 7

1. **Tanken-Visual (K1-D1):** `LAUFEND · roter Kreis` trotz `manually_paid=true` ist semantisch irritierend. V1-Priorität für BUDGET-Tap-UI-Geste erhöhen. Architekten-RPC `toggle_card_manually_paid` (aus Sprint-5-V1-Vormerkung) vorziehen.

2. **Income-Split-Popup §10:** Nicht implementiert. Dashboard zeigt keine ICH/PARTNER-Klick-Targets am Ring. Sprint 7 sollte diese Komponente priorisieren: Avatar + Prozentsatz-Label am Ring (klickbar), Popup mit Split-Anzeige + Brutto-Slider + Netto-Eingabe.

3. **Sprint-4-`CardsCarousel`-Orphan:** `src/components/cards/index.tsx` (Sprint-4-Karussell) wird nicht mehr von `page.tsx` aufgerufen (Sprint-5-Karussell übernimmt). Bleibt toter Code. Aufräumen als Mini-Task im nächsten Sprint.

---

## 10. Commit-Reihenfolge (final)

```
<initial>   docs: sprint 6 briefing         ← Phase 1
<k1-patch>  fix: card status considers fragment link existence (sprint 6 k1)
<review>    docs: sprint 6 review
```

---

## 11. Offene Fragen an PM

**OQ1 — Income-Split-Popup §10 Sprint-Einplanung:** A13/S14/S15 aus dem Briefing waren nicht testbar. Wann soll §10-Dashboard-Klick-Trigger implementiert werden? Sprint 7 scheint sinnvoll, da CSV-Distiller (primärer Sprint-7-Scope) zeitlich parallel laufen kann.

**OQ2 — V3 Bulk-RPC Entscheidung:** Latenz-Beobachtung S21: erster Wechsel 2–3 s. Bei 5 Karten noch im V1-Rahmen. Soll Architekt vor Sprint 7 die Bulk-RPC `get_cards_with_effective_plan_for_month` als Option vorbereiten?

**OQ3 — Sprint-4-`CardsCarousel`-Cleanup:** Soll das als eigener `chore:`-Commit auf `main` direkt nach Sprint-6-Merge geschehen, oder in den Sprint-7-Branch packen?

---

## 12. Vorschläge zur CLAUDE.md-Aktualisierung

(Vorschläge, nicht Ausführung — entscheidet PM.)

**§4 Sprint-Protokoll:**
- Sprint 6 Status: `—` → `🟢 Done` · Approval-Datum + Briefing-Pointer eintragen

**§9 Modell-Empfehlungen:**
- Sprint 6: `~~Opus 4.7~~` → `~~Sonnet 4.6~~ ✓ erledigt` + Notiz: „Pre-Sprint-Spec-Klärung (PM klärt §4.3.3-Konflikt vorab, Architekt verifiziert RPC, Sprint = reiner Smoke) macht Opus überflüssig"

**§7 Grundregel 11 — Erweiterung:**
Aktueller Wortlaut deckt Frontend↔RPC-Diskrepanzen ab. K1 in Sprint 6 war Frontend↔Spec-Diskrepanz (Status-Logik gegen §7 Konflikt 6). Ergänzungsvorschlag: „…Gleiches gilt für Frontend↔Spec-Diskrepanzen: PM prüft Spec-Bezug bevor Patch-Auftrag formuliert wird."

**LL-13 (neu):**
*Pre-Sprint-PM-Spec-Verifikation bei Test-Case-Sprints.* Wenn ein Sprint einen konkreten Test-Case verifiziert, muss der PM in der Pre-Sprint-Phase die Spec auf Konsistenz mit allen referenzierten Sub-Spezifikationen prüfen. Sprint-6-Erfahrung: PM hat §4.3.3-Konflikt durch Detail-Lesen entdeckt und vorab geklärt — damit war Sprint 6 kleiner als §9 ursprünglich annahm.

**§10 Sprint-Übergabe-Status:**
Sprint-6-Block anhängen (analog Sprint-5-Format): Befunde, K1-Summary, Lessons, V1-Vormerkungen.

---

*Sprint 6 Review | Antigravity Finance 1.0 | 20. Mai 2026*
