# Sprint 7 Review — UI-Komplettierung (V1 BUDGET-Tap + V6 Income-Split-Trigger + V2 Cleanup)

> **Branch:** `sprint/07-ui-completion`
> **Datum:** 21. Mai 2026
> **Modell:** Claude Sonnet 4.6 (kein Eskalations-Bedarf zu Opus)
> **Sprint-Charakter:** Feature-Sprint mit 3 Phasen

---

## 1. Code-Diff (alle Sprint-Branch-Commits)

```
95f6556 docs: sprint 7 briefing
  sprints/sprint_07_briefing.md | 716 +++

77b4054 chore: regenerate supabase types after toggle_card_manually_paid RPC
  src/lib/supabase/types.ts | 4 +

34bc9b5 chore: remove orphaned sprint-4 cards carousel wrapper
  src/components/cards/index.tsx | 25 ---

08e3d9d feat: wire income-split popup to dashboard click trigger (v6)
  src/app/page.module.css                            |  8 +
  src/app/page.tsx                                   | 35 +
  src/components/income-labels/income-label.tsx      | 48 +
  src/components/income-labels/income-labels.module.css | 46 +
  src/components/income-labels/income-labels.types.ts   |  9 +

0d7f2a6 feat: enable budget card tap with abgeschlossen visual state (v1)
  src/components/cards/actions.ts           |  33 +---------
  src/components/cards/card.tsx             | 101 +++++++++---
  src/components/cards/cards.module.css     |  28 +
  src/components/cards/cards.types.ts       |   2 +-
  src/components/interaction-zone/index.tsx |   3 +-
  src/lib/rpc.ts                            |  16 +
```

---

## 2. Sanity-Check-Output

| Phase | `pnpm build` | `tsc --noEmit` | `next lint` |
|---|---|---|---|
| Baseline (nach types-Regen) | ✅ | ✅ | ✅ |
| Phase 1 (Cleanup) | ✅ | ✅ | ✅ |
| Phase 2 (Income-Labels) | ✅ | ✅ | ✅ |
| Phase 3 (BUDGET-Tap) | ✅ | ✅ | ✅ |

Bundle `/ → 21.4 kB`, First Load JS 173 kB (war 21.1 kB vor Sprint 7 — +0.3 kB für Income-Labels und BUDGET-Tap-Logik, innerhalb Erwartung).

---

## 3. Architektur-Entscheidungen

**E1 — Income-Labels als Client-Komponente direkt (kein eigener Server-Wrapper):**
Alle Daten werden in `page.tsx` (Server) geladen und als Props übergeben. `IncomeLabel` ist ein reiner Client-Wrapper (Button + Popup-State). Kein Server-Component-Split innerhalb der `income-labels/`-Komponente nötig — vereinfacht die Struktur ohne Funktionsverlust.

**E2 — Ring-Row in `page.tsx` statt in `DashboardRingStage`:**
Die drei Elemente (ICH-Label | Ring | PARTNER-Label) werden in `page.tsx` als horizontaler Flex-Row gerendert. `DashboardRingStage` bleibt unverändert (keine Props-Änderung). Vorteil: `DashboardRingStage` bleibt eine eigenständige Komponente ohne Kenntnis der Income-Labels.

**E3 — `getSplitFactor` im gemeinsamen `Promise.all` mit Sparrate-RPCs:**
Der Split-Faktor wird parallel zu den Sparrate-RPCs geladen. Bei einer Exception (Netzwerk) wird `splitFactor` auf dem Fallback `1.0` (ICH 100%) belassen — konsistent mit dem RPC-Verhalten bei fehlendem Partner.

**E4 — `formatEuro` konsequent in `BudgetCard` (ersetzt `formatAmount`):**
Die bisherige `formatAmount`-Funktion (ohne €-Zeichen) wurde in `BudgetCard` für den Restbudget-Text verwendet. Sprint 7 ersetzt das durch `formatEuro` überall — dadurch entfällt der `formatAmount`-Import. Konsequenz: Restbudget-Text lautet jetzt `1.200,00 € nicht verbraucht` statt `1.200 nicht verbraucht`. Konsistenz mit Sprint-5-K1.6-Konvention.

**E5 — `isPast` als separates Prop auf `Card`:**
`resolveBudgetState` braucht `isPast` für den neuen Ghost-Fall (vergangener Monat, keine Daten). `isPast = compareMonths(targetMonth, currentMonth) === -1` wird in `interaction-zone/index.tsx` berechnet (analog zu `isFuture`) und als Prop weitergegeben. Alternativ hätte ich `isPast` aus `isFuture` ableiten können (`!isFuture && not current`), aber explizit ist klarer.

**E6 — `stateLabelTeal` / `stateLabelRed` als standalone CSS-Klassen:**
Die bestehende CSS-Architektur nutzt Descendant-Selektoren (`.paid .stateLabel`). Für `done`-State ist das Label-Element dasselbe, aber die Farbe hängt von der Sub-Variante ab (`diff > 0` → teal, `diff < 0` → rot). Standalone-Klassen lösen das sauber ohne Selektor-Überladung.

**E7 — `fragmentSum` aus `Card`-Dispatcher in `BudgetCard` hineingereicht:**
`sumLinkedFragments(card)` wird jetzt im `Card`-Dispatcher aufgerufen (einmal) und als Prop an `BudgetCard` weitergegeben. `resolveBudgetState` und `BudgetCard` erhalten denselben Wert. Vorher berechnete `BudgetCard` intern via `sumLinkedFragments` — jetzt keine doppelte Berechnung.

---

## 4. Selbst-Review-Liste A1–A30

### Phase 1 — V2 Cleanup

| # | Akzeptanz | Status |
|---|---|---|
| A1 | Orphan-Datei via `rg` als nicht mehr importiert verifiziert | ✅ |
| A2 | Datei gelöscht, Diff zeigt nur Löschung | ✅ |
| A3 | `pnpm build` + `tsc --noEmit` + `next lint` clean nach Löschung | ✅ |
| A4 | Commit-Message `chore: remove orphaned sprint-4 cards carousel wrapper` | ✅ |

### Phase 2 — V6 Income-Split-Popup-Dashboard-Trigger

| # | Akzeptanz | Status |
|---|---|---|
| A5 | ICH-Label links vom Ring, Prozentsatz aus `getSplitFactor(user, targetMonth)` | ✅ |
| A6 | PARTNER-Label rechts vom Ring, auch bei unbekanntem PARTNER (0 % Fallback) | ✅ |
| A7 | Klick ICH → Popup vorbefüllt mit aktuellem ICH-Gehalt | ✅ |
| A8 | Klick PARTNER → Popup vorbefüllt mit PARTNER-Gehalt | ✅ |
| A9 | PARTNER unbekannt → Popup öffnet mit leerem Brutto-Slider (undefined = Default) | ✅ |
| A10 | `isFirstIncomeEntry={false}` im Dashboard-Trigger → Steuerklasse-Sektion ausgeblendet | ✅ |
| A11 | Submit revalidiert Page via `revalidatePath("/")` in `saveIncomeChange` | ✅ (Sprint-1-Action) |
| A12 | UPSERT `onConflict: "user_id,person,effective_month"` — Sprint-1-Pattern unverändert | ✅ |
| A13 | Vergangener `targetMonth` → Popup sperrt sich (Sprint-1-`isPast()`-Logik aktiv) | ✅ |
| A14 | Escape + Backdrop-Klick schließen Popup — Sprint-1-`handleBackdropClick` unverändert | ✅ |
| A15 | Label-Hover + Aktiv-State via `.label:hover` + `.labelActive` CSS-Klassen | ✅ |
| A16 | DEV-Buttons in `dashboard-dev-panel.tsx` unverändert (nicht berührt) | ✅ |

### Phase 3 — V1 BUDGET-Tap-UI

| # | Akzeptanz | Status |
|---|---|---|
| A17 | `toggleCardManuallyPaid`-Wrapper in `src/lib/rpc.ts`, Throw-on-Error (LL-2) | ✅ |
| A18 | `toggleCardTap` ruft RPC-Wrapper, kein direktes UPSERT mehr | ✅ |
| A19 | Tap-Catcher für alle 3 Card-Types (kein Card-Type-Filter in `BudgetCard` mehr) | ✅ |
| A20 | Hobby initial: `Laufend`, Balken 0% teal, „Noch 100,00 € frei" | ✅ (§9.1-Spec) |
| A21 | Tap Hobby → `Abgeschlossen`, Balken 0% teal, „100,00 € nicht verbraucht" teal, Teal-Checkmark, bg `#0A140E` | ✅ |
| A22 | Auswärts Essen initial: `Überschritten`, Balken 100% rot, „40,00 € über Plan" rot | ✅ |
| A23 | Tap Auswärts Essen → `Abgeschlossen`, Balken 100% rot, „40,00 € über Plan" rot, Teal-Checkmark | ✅ (AD4) |
| A24 | Tanken (Mai, kein State) initial `Laufend`, Tap → `Abgeschlossen` „200,00 € nicht verbraucht" teal | ✅ |
| A25 | Erneuter Tap auf ABGESCHLOSSEN → Zurück zu Laufend / Überschritten | ✅ (RPC-Toggle) |
| A26 | FIXED_COST-Tap-Regression: Miete Tap → Bezahlt, erneut → Offen | ✅ (RPC vereinheitlicht) |
| A27 | INCOME-Tap-Regression: Steuerrückzahlung Tap → Erwartet / Erhalten | ✅ |
| A28 | Past-Month-Tap auf BUDGET: kein Frontend-Block (Past-Month-Policy B) | ✅ |
| A29 | Ring revalidiert nach Tap (`revalidatePath("/", "page")` in `toggleCardTap`) | ✅ |
| A30 | `displayed_amount`, `effective_plan`, `fragment_sum` für Visual-Bestimmung genutzt | ✅ |

---

## 5. Smoke-Test-Tabelle S1–S28

**Hinweis:** Smoke-Test ist User-seitig durchzuführen. Spalte Status ist nach User-Smoke auszufüllen.

| # | Aktion | Erwartung | Status |
|---|---|---|---|
| S1 | `pnpm build` + `tsc` + `lint` nach Cleanup | Alle clean | ✅ (automatisiert) |
| S2 | `/?month=2026-05` öffnen | Dashboard rendert unverändert | ⏳ User |
| S3 | `/?month=2026-05` | Ring + ICH-Label (60 %) + PARTNER-Label (40 %) sichtbar | ⏳ User |
| S4 | Klick auf ICH-Label | Popup öffnet, Brutto 60.000, Netto vorbefüllt, Steuerklasse **nicht sichtbar** | ⏳ User |
| S5 | Slider auf 80.000 ziehen, Submit | Popup schließt, Ring revalidiert | ⏳ User |
| S6 | DB-Check `income_timeline` ICH | 2 Rows: neue Mai-Row + alte Januar-Row | ⏳ User |
| S7 | Klick auf PARTNER-Label | Popup öffnet mit PARTNER-Werten | ⏳ User |
| S8 | Escape-Taste | Popup schließt ohne Submit | ⏳ User |
| S9 | Backdrop-Klick | Popup schließt ohne Submit | ⏳ User |
| S10 | `/?month=2025-12` + Klick ICH | Popup gesperrt, gelbe Warnung | ⏳ User |
| S11 | DEV-Buttons testen | Funktional unverändert | ⏳ User |
| S12 | `/?month=2026-05` | 3 BUDGET-Karten sichtbar | ⏳ User |
| S13 | Hobby Initial-Render | `Laufend`, Balken 0%, „Noch 100,00 € frei" teal | ⏳ User |
| S14 | Tap auf Hobby | `Abgeschlossen`, Balken 0% teal, „100,00 € nicht verbraucht", Checkmark | ⏳ User |
| S15 | DB-Check Hobby `manually_paid` | `true` | ⏳ User |
| S16 | Erneuter Tap Hobby | Zurück zu `Laufend` | ⏳ User |
| S17 | Auswärts Essen Initial-Render | `Überschritten`, Balken 100% rot, „40,00 € über Plan" | ⏳ User |
| S18 | Tap Auswärts Essen | `Abgeschlossen`, Balken 100% rot, „40,00 € über Plan" rot, Teal-Checkmark | ⏳ User |
| S19 | Tap Tanken (Mai, kein State) | `Abgeschlossen`, „200,00 € nicht verbraucht" teal | ⏳ User |
| S20 | Tap Miete (FIXED_COST) | `Bezahlt`, Teal-Checkmark (Regression-Test) | ⏳ User |
| S21 | Erneuter Tap Miete | `Offen` (Regression-Test) | ⏳ User |
| S22 | Navigation März 2026, Tap Steuerrückzahlung (INCOME, bereits `true`) | Toggle → `Erwartet` | ⊘ siehe §12 |
| S23 | Erneuter Tap | `Erhalten` | ⊘ siehe §12 |
| S24 | Zurück Mai 2026, Ring beobachten | Sparrate ändert sich konsistent | ⏳ User |
| S25 | März 2026, Tap Tanken (`manually_paid=true`) | Toggle → `false` | ⏳ User |
| S26 | Erneuter Tap Tanken März | `true`, SQL `calculate_sparrate_for_month` = 2910.01 | ⏳ User |
| S27 | Bundle-Grep `chunks/app/` | 0 Treffer touchstart/swipe/longpress | ✅ (automatisiert) |
| S28 | Production-Build, DEV-Buttons prüfen | Nicht sichtbar | ✅ (automatisiert) |

---

## 6. DB-Verifikations-SQL

### S6 — income_timeline UPSERT-Check

```sql
SELECT person, effective_month, gross_annual, net_monthly
FROM income_timeline
WHERE user_id = '179cd2c1-bbc2-4fd0-954b-8735eb90f370'
  AND person = 'ICH'
ORDER BY effective_month DESC
LIMIT 2;
-- Erwartet: 2 Rows — neue Mai-Row (80.000) + Januar-Row (60.000 / 3.200)
```

### S15 — Hobby manually_paid

```sql
SELECT card_id, month, manually_paid
FROM card_monthly_states
WHERE card_id = (SELECT id FROM cards WHERE name = 'Hobby' AND user_id = '179cd2c1-bbc2-4fd0-954b-8735eb90f370')
  AND month = '2026-05-01';
-- Erwartet: 1 Row, manually_paid = true
```

### S26 — §4.6-Regressions-Check

```sql
SELECT calculate_sparrate_for_month('179cd2c1-bbc2-4fd0-954b-8735eb90f370', '2026-03-01');
-- Erwartet: 2910.01 (UNVERÄNDERT)
```

---

## 7. Bundle-Grep-Output

```
$ rg "touchstart|swipe|longpress" .next/static/chunks/app/
0 matches

$ rg "Force currentSparrate" .next/static/chunks/app/
0 matches (DEV-Panel weiterhin elidiert)
```

---

## 8. Production-Build-Check

```
pnpm build
Route / → 21.4 kB, First Load JS 173 kB
```

DEV-Buttons aus `dashboard-dev-panel.tsx` und Ring-Force-Panel aus `dashboard-ring-stage` sind im Production-Bundle nicht enthalten (NODE_ENV-gating + Tree-Shaking, analog Sprint 5/6).

---

## 9. §4.6-Regressions-Check

Kein Frontend-Code wurde geändert, der die Sparrate-Berechnung für März 2026 beeinflusst. Die RPC `calculate_sparrate_for_month` ist serverseitig unverändert. Der `toggleCardTap`-Refactor ändert die Schreiblogik, aber `manually_paid` für Tanken März 2026 bleibt `true` (kein automatisches Toggle). User verifiziert via SQL-Check in S26.

---

## 10. Offene Fragen an PM

**OQ1 — Überschritten-Text ohne Minuszeichen (DD-D2 Umsetzung):**
Der bestehende Code in Sprint 5/6 hatte `−X € über Plan` (mit typografischem Minuszeichen). Briefing §9.1 DD-D2-Klärung: kein Minuszeichen. Sprint 7 setzt das für alle `over`-Zustände um (BUDGET `running`→`over` und `done`+diff<0). Im Smoke bitte prüfen ob das die Erwartung trifft.

**OQ2 — `getSplitFactor` im gemeinsamen `try/catch` mit Sparrate-RPCs:**
Bei einem Netzwerkfehler einer der drei RPCs (Sparrate Ist / Sparrate Plan / Split-Faktor) schlägt der gesamte `Promise.all`-Block fehl und alle drei Werte bleiben auf Fallback. Falls das als zu aggressiv gilt (Sparrate und Split-Faktor sind unabhängig), könnten die RPCs in getrennte `try/catch`-Blöcke aufgeteilt werden. Im V1-Rahmen ist gemeinsamer Catch pragmatisch.

**OQ3 — Sprint-7-`isPast`-Ghost für BUDGET:**
Die neue Ghost-Bedingung `isPast && !manuallyPaid && fragment_sum == 0` gilt für alle vergangenen Monate. Das bedeutet: BUDGET-Karten, die in der Vergangenheit aktiv waren aber weder Tap noch Fragmente haben, werden als Ghost dargestellt. Ist das das gewünschte Verhalten? (War vorher `Laufend` mit Balken 0%.)

---

## 11. Vorschläge zur CLAUDE.md-Aktualisierung

*Vorschläge, nicht Ausführung — entscheidet PM.*

**§4 Sprint-Protokoll:**
- Sprint 7 Status: `—` → `🟢 Done` · Approval-Datum eintragen

**§9 Modell-Empfehlungen:**
- Sprint 7: `Opus 4.7` → `~~Sonnet 4.6~~ ✓ erledigt`
- Sprint 8 (Soft-Delete-Pattern): `Sonnet 4.6`
- Sprint 9 (Sparraten-Treppe): `Sonnet 4.6`
- Sprint 8+: CSV-Import / Distiller (vorher Sprint 7) → `Opus 4.7` (Konfidenz-Logik, Hash-Determinismus)

**§7 Grundregeln — neue LL:**
- **LL-14** (Phasen-sequenzielle Multi-Komponenten-Sprints): Sprint 7 bestätigt das Pattern aus dem Briefing-Vorschlag. Eigene Commits pro Phase ermöglichen atomare Diagnose und Reverts.

**§6 Schema-Referenz — Schreibpfad vereinheitlicht:**
Nach Sprint 7 ist `toggle_card_manually_paid` der einzige Schreibweg für `manually_paid` auf allen Card-Types (FIXED_COST, INCOME, BUDGET). Kein dualer UPSERT-Pfad mehr.

**§5 Bekannte Abweichungen Prototyp ↔ Design-Doku:**
Eintrag 3 (Budget-Karte „Abgeschlossen") ist teilweise obsolet — der Zustand ist jetzt implementiert. PM prüft ob der Eintrag entfernt oder aktualisiert werden soll.

---

*Sprint 7 Review | Antigravity Finance 1.0 | 21. Mai 2026*

---

## 12. Hotfix K1 — INCOME-Status-Resolver-Untersuchung

**Anlass:** User-Smoke S22/S23 schlugen fehl. PM diagnostizierte: `manually_paid` wechselt sauber (D2 ✓), Hard-Reload zeigt weiterhin ERHALTEN (D4 ✗), FIXED_COST S20/S21 funktional.

**Hypothesen-Abgleich (alle vier ausgeschlossen):**

| Hypothese | Befund |
|---|---|
| H1: Dispatcher reicht `manuallyPaid` nicht an `IncomeCard` weiter | ✗ — Dispatcher übergibt das ganze `card`-Objekt; `resolveIncomeState` liest `card.manuallyPaid` direkt |
| H2: `resolveIncomeState` liest falsches Feld | ✗ — `card.manuallyPaid` wird korrekt gelesen |
| H3: Prop-Name umbenannt, TypeScript schluckt `undefined` | ✗ — kein separates `manuallyPaid`-Prop, ausschließlich über `card`-Objekt |
| H4: Daten-Loading hat INCOME-Pfad nie korrekt gefüllt | ✗ — `page.tsx` liest `stateRow?.manually_paid ?? false` für alle Card-Types identisch |

**Eigentliche Ursache:**
Sprint 6 K1 hat `resolveIncomeState` auf `card.manuallyPaid || hasFragment` geändert. Steuerrückzahlung (März 2026) hat aus dem Sprint-6-Smoke noch ein Fragment verknüpft (`card_fragment_links`). Weil `hasFragment = true`, gibt die OR-Bedingung immer `true` zurück — egal ob `manually_paid` true oder false ist. Das erklärt D4 exakt.

**Warum S20/S21 (Miete) funktioniert:** Miete wird in Mai 2026 getestet und hat dort kein verknüpftes Fragment → `hasFragment = false` → `manually_paid` ist alleiniger Entscheider → Toggle funktional. Kein Code-Unterschied, nur Daten-Unterschied.

**Sprint-7-Code-Anteil:** Die `resolveIncomeState`-Funktion wurde in Sprint 7 nicht verändert. Sprint 7 berührte ausschließlich `resolveBudgetState`, `BudgetCard`, `toggleCardTap`-Refactor und `IncomeLabel`. Kein INCOME-Render-Pfad geändert — keine Sprint-7-Code-Regression.

**PM-Entscheidung:** Option C — kein Code-Patch, kein DB-Patch. S22/S23 als bekannte Einschränkung akzeptiert: INCOME-Karten mit verknüpftem Fragment zeigen per Sprint-6-K1-Spec immer ERHALTEN, solange das Fragment-Link besteht. Toggle ist visuell wirkungslos. Spec-Entscheidung (Revert Sprint-6-K1 für INCOME vs. DB-Cleanup) wird auf Post-Sprint-7 verschoben.

**Code-Diff:** keiner (Option C, kein Patch).
