# Sprint 1 — Onboarding + Income / Partner-Split

> **Sprint-Nummer:** 1
> **Komponente:** Onboarding-Flow + Income/Partner-Split-Popup + RPC-Wrapper-Fundament
> **Dauer-Schätzung:** 1 Session, ~90–120 Minuten Implementierung
> **Modell-Empfehlung:** Opus 4.7
> **Branch:** `sprint/01-income`
> **Datum erstellt:** 11. Mai 2026
> **Voraussetzung:** Sprint 0 ist 🟢 (Approved 11. Mai 2026)

---

## 0. Pflicht-Lese-Reihenfolge für Claude Code

Beim Start dieser Session lese in dieser Reihenfolge:

1. `CLAUDE.md` (Repo-Root) — Status, Tech-Stack, Arbeitsregeln, Sprint-0-Lessons
2. `antigravity_finance_design_dokument_v3.md` — insbesondere **§10 Income / Partner-Split**, **§2.2 Forward-Inheritance**, **§4.5 Split-Anwendung**
3. `antigravity_finance_schema_summary_v2.md` — insbesondere die Tabellen `profiles`, `income_timeline`, `net_estimation_brackets` sowie die RPCs `estimate_net_monthly`, `get_split_factor`, `get_net_monthly_for_month` und das Interaktions-Mapping in §5
4. Diese Datei (`sprints/sprint_01_briefing.md`)
5. **Referenz-Prototyp** (visuelles Soll, im `public/prototypes/` bzw. Project Knowledge): `income_split_final.html` + `income_split_final.png`

---

## 1. Ziel

Am Ende dieses Sprints existieren drei Dinge:

1. **Funktionierender Onboarding-Flow** unter `/onboarding`, der einen frisch registrierten User durch Steuerklasse + Jahresbrutto + Netto-Eingabe führt und am Ende `profiles.onboarded_at` setzt. Vor Abschluss bleibt das Dashboard gesperrt.
2. **Income/Partner-Split-Popup-Komponente** unter `src/components/income-split/`, exakt gemäß Design-Doku §10 — vollständig in allen Feld-Zuständen, mit Netto-Vorschlag per RPC, Forward-Inheritance-Badge, deutsche UI-Copy aus §10/§12.
3. **`src/lib/rpc.ts`** — typisierter RPC-Wrapper, der `estimate_net_monthly` als erste Funktion bereitstellt. Foundation für alle Folge-Sprints.

**Was NICHT in diesem Sprint passiert:**
- Kein Ring (Sprint 2) → Popup-Trigger ist ein **temporärer Dev-Button** auf dem Dashboard, mit klar markiertem Sunset („wird in Sprint 2/3 vom Ring/Header übernommen")
- Keine Sparrate-Berechnung
- Keine Karten, keine Fragmente, keine Timeline

---

## 2. Voraussetzungen (vor Sprint-Start, durch User zu erledigen)

| # | Aufgabe | Wer | Kontrolle |
|---|---|---|---|
| V1 | Sprint 0 ist approved und auf `main` gemerged | User | CLAUDE.md §4 Sprint 0 = 🟢 |
| V2 | Branch `sprint/01-income` erstellt + ausgecheckt | User | `git status` |
| V3 | `.env.local` mit Publishable Key noch funktional | User | `pnpm dev` startet, Login klappt |
| V4 | **Test-User-Profile löschen oder `onboarded_at` zurücksetzen** | User | Bei Sprint-Start soll der Test-User im „pre-onboarding"-State sein — sonst wird `/onboarding` per Middleware-Redirect übersprungen und ist nicht testbar |

**V4 konkret:** Im Supabase Dashboard → SQL Editor:
```sql
UPDATE profiles SET onboarded_at = NULL WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'dominik.hecker.92@gmail.com'
);
-- Falls noch kein profiles-Eintrag existiert, ist auto-erstellt durch Trigger oder
-- muss in Sprint 1 als Teil des Login-Flows angelegt werden (siehe §3.2)
```

---

## 3. Aufgaben (in dieser Reihenfolge ausführen)

### 3.1 RPC-Wrapper-Fundament anlegen

**Datei:** `src/lib/rpc.ts`

**Inhalt:** Typisierter Wrapper für RPCs, die in den nächsten Sprints zunehmend genutzt werden. Sprint 1 implementiert nur `estimateNetMonthly`:

```ts
import { createClient } from "@/lib/supabase/server"; // oder client.ts je nach Aufrufkontext
import type { Database } from "@/lib/supabase/types";

export async function estimateNetMonthly(args: {
  grossAnnual: number;
  taxClass: number;
  taxYear: number;
}): Promise<number | null> {
  // .rpc("estimate_net_monthly", { gross_annual, tax_class, tax_year })
  // Returns null wenn Bracket-Tabelle für taxYear fehlt — siehe §10 Edge-Case
}
```

**Wichtige Anforderungen:**
- Funktion gibt **`number | null`** zurück (nicht `throw`). Der null-Pfad ist legitim (Bracket fehlt für Jahr) und wird im UI sichtbar gemacht.
- Parameter-Namen sind camelCase im TS-Layer, snake_case im RPC-Call. Mapping erfolgt im Wrapper.
- Wrapper wählt automatisch zwischen Browser- und Server-Supabase-Client je nach Aufrufkontext. Im Zweifel: server-side (Server Actions, Route Handlers) bevorzugt — Browser-Client nur wenn explizit nötig.
- Generische Hilfs-Funktion `callRpc<T>(...)` ist optional in Sprint 1 — nur wenn sie den Code klarer macht. YAGNI gilt.

### 3.2 `profiles`-Auto-Erstellung beim ersten Login

**Aktuell:** Sprint 0 hat `profiles` nicht angefasst — der Test-User hat möglicherweise noch keinen `profiles`-Eintrag.

**Soll-Verhalten:** Beim ersten erfolgreichen Login muss ein `profiles`-Eintrag existieren mit:
- `user_id` = `auth.uid()`
- `onboarded_at` = NULL
- `tax_class` = NULL (wird erst beim Onboarding gesetzt)

**Drei Optionen, in dieser Präferenz:**

1. **Bevorzugt: Server-Side-Trigger in Supabase** prüft Claude Code via `list_tables`/`execute_sql`, ob es bereits einen `on_auth_user_created`-Trigger gibt, der das automatisch tut. Falls ja → nichts zu tun, dokumentieren.
2. **Falls kein Trigger:** Login-Server-Action ergänzt um `upsert` in `profiles` (`user_id` als ON CONFLICT). Macht den Code im Login schmutzig, aber funktional sauber.
3. **Fallback:** Im Middleware-Redirect-Pfad zu `/onboarding` einen `upsert` einfügen, bevor die Onboarding-Seite gerendert wird.

**Empfehlung:** Option 1 verifizieren. Falls Trigger fehlt: in der Sprint-1-Review als **offene Frage an PM** dokumentieren („Sollte ich einen DB-Trigger anlegen oder Option 2/3 wählen?") — keine eigenmächtige DB-Änderung.

### 3.3 Middleware um Onboarding-Guard erweitern

**Datei:** `src/lib/supabase/middleware.ts` + ggf. `src/middleware.ts`

**Neue Logik (zusätzlich zu Sprint 0):**

| Login-Status | onboarded_at | Pfad | Aktion |
|---|---|---|---|
| ausgeloggt | — | `/login` | passieren lassen |
| ausgeloggt | — | sonst | Redirect → `/login` |
| eingeloggt | NULL | `/onboarding` | passieren lassen |
| eingeloggt | NULL | sonst | Redirect → `/onboarding` |
| eingeloggt | NOT NULL | `/onboarding` | Redirect → `/` |
| eingeloggt | NOT NULL | `/login` | Redirect → `/` |
| eingeloggt | NOT NULL | sonst | passieren lassen |

**Implementations-Hinweis:** Den `onboarded_at`-Lookup nur einmal pro Middleware-Pass machen. Bei jedem Page-Load eine zusätzliche DB-Query ist in einer Single-User-App akzeptabel, aber unnötige Round-Trips vermeiden (z. B. wenn die Session sowieso Cookie-frisch geladen wird).

### 3.4 Onboarding-Seite — Route + Server Actions

**Datei:** `src/app/onboarding/page.tsx` + `src/app/onboarding/actions.ts`

**Pflichtumfang gemäß Design-Doku §10:**

1. Steuerklasse 1–6 (Buttons oder Dropdown)
2. Jahresbrutto: Range-Slider 20.000 € – 150.000 €, Step 100 €
3. Live-Vorschau Netto-Schätzung unter dem Slider (RPC-Call `estimate_net_monthly`)
4. Monatliches Netto: Pflichtfeld, vorbefüllt durch RPC-Schätzung, überschreibbar, selbstheilend
5. „Übernehmen"-Button: disabled bis Netto-Pflichtfeld einen Wert hat
6. **Optional-Sektion: Partner-Brutto** mit „Überspringen"-Option

**Logik bei Submit:**

In einer **Transaktion** (oder zwei separaten, sicher ausgeführten) Server Actions:
1. INSERT `income_timeline` für ICH mit `effective_month` = aktueller Monat (Tag 1)
2. UPDATE `profiles` mit `tax_class` (erstmaligem Eintrag) und `onboarded_at = now()`
3. Falls Partner-Daten angegeben: INSERT `income_timeline` für PARTNER

Da Supabase-JS keine atomic transactions zwischen mehreren Tabellen direkt unterstützt, gilt: **bei einem Fehler nach Schritt 1** entweder via DB-Funktion (RPC) konsolidieren oder Best-Effort + Logging — kein Rollback im Frontend simulieren.

**Empfehlung:** Pragmatisch zwei separate Calls (income → profiles), beide via Server Action. Edge-Case „income inserted, profile update failed" ist in V1 akzeptabel (User landet im Onboarding-Loop, kann erneut probieren). In der Review als bekannten Edge-Case dokumentieren.

**Nach erfolgreichem Submit:** Redirect → `/`.

**Styling:** Plain CSS Module, **nur Tokens aus `tokens.css`**. Layout sauber, lesbar, **kein** Glow / kein Polish — Onboarding ist Werkzeug, nicht Produkt. Gleiche Disziplin wie Login-Page.

**Vergangenheits-Check:** Vergangene Monate sind hier nicht relevant — Onboarding-Eintrag gilt immer ab aktuellem Monat. Forward-Inheritance-Mechanik wird in §3.5 implementiert.

### 3.5 Income/Partner-Split-Popup-Komponente

**Datei:** `src/components/income-split/` mit:
- `index.tsx` — die Popup-Komponente (Client Component, `use client`)
- `income-split.module.css` — Styling, nur Tokens
- `income-split.types.ts` — Props-Typen und State-Typen
- `actions.ts` — Server Actions für `saveIncomeChange`

**Props der Komponente:**
```ts
type Props = {
  isOpen: boolean;
  onClose: () => void;
  person: "ICH" | "PARTNER";
  activeMonth: { year: number; month: number };
  isFirstIncomeEntry: boolean; // steuert Anzeige Steuerklasse-Auswahl
  // Initial-Werte aus der DB für vorbefüllung (falls bereits Einträge existieren)
  initialGrossAnnual?: number;
  initialNetMonthly?: number;
  initialTaxClass?: number; // nur bei isFirstIncomeEntry false als Anzeige
};
```

**Felder gemäß §10 Popup-Felder + Zustände:**

| Block | Anforderung |
|---|---|
| Header | „ICH — Jahresbrutto" bzw. „PARTNER — Jahresbrutto" + aktiver Monat |
| Steuerklasse | Nur wenn `isFirstIncomeEntry === true && person === "ICH"`. Buttons 1–6 oder Dropdown. Bestätigung speichert `profiles.tax_class`. |
| Jahresbrutto-Slider | Range 20.000–150.000, Step 100, Label „ICH / PARTNER %"-Vorschau dynamisch |
| Split-Vorschau | „ICH X % · PARTNER Y %" + Beispielrechnung mit gemeinsamer Fixkosten-Karte „(nur illustrativ)" |
| Netto-Feld | Pflicht, 5 Zustände (Default, Fokus, Manuell geändert, Leer/Fehler, Wiederhergestellt) — exakte Borders und Hinweistexte aus §10 Tabelle |
| Forward-Inheritance-Badge | „Gilt ab [Monat] für alle Folgemonate bis zur nächsten Änderung" |
| Buttons | „Abbrechen" + „Übernehmen" (Übernehmen disabled bis Netto-Feld einen gültigen Wert hat) |

**Vergangenheits-Verhalten (§10):** Wenn `activeMonth` < heute (Monatsebene): gelbe Warnung anzeigen, alle Felder gesperrt, Übernehmen disabled. Begründung: V1 verbietet rückwirkende Korrektur (§10 V1-Limitation).

**Edge-Case Bracket fehlt:** Wenn `estimate_net_monthly` `null` liefert → kein Vorschlag, dezenter Hinweis „Schätzung für dieses Steuerjahr noch nicht verfügbar — Netto bitte selbst eintragen." Netto-Feld ist dann manuell zu füllen (kein „Wiederherstellen", weil es keinen Vorschlag gibt).

**Selbstheilung Netto-Feld:** Wenn der User das Feld leert + Fokus verlässt → setze Vorschlagwert zurück, zeige Hinweis „Vorschlag wiederhergestellt · Änderbar".

### 3.6 Temporärer Dev-Trigger im Dashboard

**Datei:** `src/app/page.tsx` (Dashboard-Skeleton aus Sprint 0)

**Ergänzung:** Zwei explizit als Dev markierte Buttons:

```tsx
{/* TODO Sprint 2/3: Diese Trigger durch Klick auf Ring-Avatare ersetzen */}
<button onClick={openIchPopup}>[DEV] ICH bearbeiten</button>
<button onClick={openPartnerPopup}>[DEV] PARTNER bearbeiten</button>
```

**Wichtig:**
- Buttons sind nur in `process.env.NODE_ENV === "development"` sichtbar (oder via Feature-Flag-Konstante in einer separaten `src/lib/dev-flags.ts`). Sie dürfen niemals in Production sichtbar sein.
- Inline-Kommentar `// TODO Sprint 2/3: …` ist Pflicht
- Komponente lädt Initial-Daten aus der DB beim Öffnen (für ICH und PARTNER separat)

### 3.7 UI-Copy — Deutsch, vollständig

Sämtliche Texte aus Design-Doku §10 und §12 (UI-Copy) übernehmen. **Wörtlich.** Keine eigenen Formulierungen erfinden.

Insbesondere wörtlich:
- „Vorschlag basiert auf Steuerklasse [N] · Änderbar"
- „Manuell angepasst"
- „Pflichtfeld — Vorschlag kehrt beim Verlassen zurück"
- „Vorschlag wiederhergestellt · Änderbar"
- „Schätzung für dieses Steuerjahr noch nicht verfügbar — Netto bitte selbst eintragen."
- „Gilt ab [Monat] für alle Folgemonate bis zur nächsten Änderung"
- „(nur illustrativ)" bei der Beispielrechnung

Wenn §12 einen exakteren Wortlaut liefert als §10, gewinnt §12.

---

## 4. Akzeptanz-Kriterien

| # | Kriterium | Wie geprüft |
|---|---|---|
| A1 | `pnpm install` (falls neue Deps) + `pnpm build` fehlerfrei | Build-Output |
| A2 | `tsc --noEmit` ohne Fehler | Output |
| A3 | Frisch eingeloggter User mit `onboarded_at = NULL` landet auf `/onboarding`, nicht `/` | Screenshot Browser |
| A4 | `/onboarding` enthält alle Pflichtfelder gemäß §10 | Screenshot |
| A5 | Range-Slider Brutto: 20.000–150.000, Step 100 | Screenshot + DevTools |
| A6 | Live-Vorschau Netto-Schätzung erscheint unter dem Slider sobald Brutto + Steuerklasse gesetzt sind | Screenshot Werteänderung |
| A7 | Manuelles Überschreiben des Netto-Felds zeigt „Manuell angepasst" in Teal | Screenshot |
| A8 | Netto-Feld leeren + Tab/Blur → Vorschlagwert kehrt zurück, „Vorschlag wiederhergestellt" sichtbar | Screenshot |
| A9 | „Übernehmen" disabled bei leerem Netto-Feld, enabled wenn Wert vorhanden | Screenshot beider Zustände |
| A10 | Submit erfolgreich → DB: 1 Row in `income_timeline` (ICH), `profiles.onboarded_at` ≠ NULL, `profiles.tax_class` gesetzt | SQL-Verifikation in Review |
| A11 | Nach Submit: Redirect auf `/`, kein erneuter Onboarding-Redirect | Browser-Test |
| A12 | Auf `/` sind die zwei Dev-Trigger-Buttons sichtbar | Screenshot |
| A13 | Klick auf „[DEV] ICH bearbeiten" öffnet das Popup mit korrekt vorbefüllten Initialwerten aus DB | Screenshot |
| A14 | Klick auf „[DEV] PARTNER bearbeiten" öffnet leeres / Partner-Popup (Steuerklasse-Sektion ausgeblendet, da `isFirstIncomeEntry` für Partner anders gehandhabt wird) | Screenshot |
| A15 | RPC `estimate_net_monthly` wird typsicher über `lib/rpc.ts` aufgerufen, kein direkter `.rpc("estimate_net_monthly", ...)` außerhalb des Wrappers | Code-Grep |
| A16 | `font-variant-numeric` greift in Brutto-/Netto-Zahlen (DevTools Computed) | Screenshot DevTools |
| A17 | Forward-Inheritance: Bei vergangenem `activeMonth` ist das Popup gesperrt mit gelber Warnung | Screenshot Test mit künstlich gesetztem Past-Month |
| A18 | RLS funktioniert: Login als anderer User würde fremde `income_timeline`-Rows nicht sehen — Spotcheck im Review (nicht zwingend testen, aber Code muss `auth.uid()` respektieren) | Code-Review |

**A17 Test-Setup:** Da der Ring/Header noch nicht existiert, hardcodet Claude Code beim Dev-Trigger einen vergangenen Monat (z. B. Februar 2026) testweise, macht den Screenshot, und stellt danach auf aktuell zurück.

---

## 5. Smoke-Test-Sequenz für User

**Vorbereitung:** V4 ausgeführt (`onboarded_at = NULL` für Test-User), Dev-Server läuft (`pnpm dev`).

1. `localhost:3000` aufrufen, Login → erwartet: Redirect auf `/onboarding`
2. Versuch `localhost:3000/` direkt → erwartet: Redirect zurück auf `/onboarding`
3. Onboarding-Formular ausfüllen: Steuerklasse 1, Brutto 60.000 €, Netto sollte automatisch ~3.200 € vorschlagen (echter Wert je nach Bracket-Tabelle)
4. Netto manuell auf `3250` ändern → „Manuell angepasst" in Teal sichtbar
5. Netto-Feld leeren, Tab drücken → Vorschlag kehrt zurück
6. „Übernehmen" → Redirect auf `/`
7. Auf `/`: zwei Dev-Buttons sichtbar, Email weiterhin angezeigt
8. „[DEV] ICH bearbeiten" → Popup öffnet, vorbefüllt mit den Onboarding-Werten
9. Brutto-Slider ändern auf 70.000 → Split-Vorschau bewegt sich live, Netto-Vorschlag aktualisiert
10. „Übernehmen" → Popup schließt, eine zweite Row in `income_timeline` existiert
11. „[DEV] PARTNER bearbeiten" → Popup öffnet ohne Steuerklasse-Sektion, leer
12. Partner-Brutto auf 40.000 setzen, Netto 2400, „Übernehmen" → dritte Row in `income_timeline` (jetzt für PARTNER)
13. Browser-Logout (über bestehenden Logout-Button auf `/`) → `/login` erreicht
14. Erneut einloggen → Direkt auf `/` (kein Onboarding-Redirect mehr, weil `onboarded_at` gesetzt ist)

Wenn 1–14 grün und A1–A18 erfüllt → Sprint 1 auf 🟢.

---

## 6. Sprint-Output (`sprints/sprint_01_review.md`)

Pflicht-Inhalt:

1. `git status` + Datei-Liste
2. `tree src/` (mind. 3 Ebenen)
3. `pnpm build`-Output (letzte 20 Zeilen) + `tsc --noEmit`-Output
4. Screenshots zu A3–A14 und A16–A17
5. **DB-Verifikations-Block:** SQL-Outputs nach erfolgreichem Smoke-Test:
   ```sql
   SELECT user_id, person, effective_month, gross_annual, net_monthly
   FROM income_timeline ORDER BY effective_month, person;

   SELECT user_id, onboarded_at, tax_class FROM profiles;
   ```
6. Selbst-Review-Checkliste A1–A18
7. Antwort auf §3.2-Frage: existiert ein Trigger für `profiles`-Auto-Creation, oder nicht? Wie wurde es gelöst?
8. Offene Fragen an den PM
9. Vorschläge zur CLAUDE.md-Aktualisierung

---

## 7. Nicht-Aufgaben (Anti-Drift)

- ❌ Kein Singularity Ring (Sprint 2)
- ❌ Keine Header / Timeline (Sprint 3)
- ❌ Keine Karten irgendeiner Art (Sprint 4)
- ❌ Keine Sparrate-Berechnung
- ❌ Keine Sparraten-Treppe
- ❌ Kein CSV-Import
- ❌ Keine rückwirkende Korrektur mit Fairness-Delta (V1-Limitation §10)
- ❌ Kein separater Settings-Screen für Steuerklassen-Wechsel (V2-Plan §10)
- ❌ Keine Haushaltsnetto-Berechnung (§10 „Was explizit NICHT")
- ❌ Kein automatischer Split aus Netto (§10 „Was explizit NICHT")
- ❌ Keine Partner-Login-Möglichkeit (§10 „Nur der Nutzer selbst bedient")
- ❌ Keine Tests / kein Storybook
- ❌ Keine eigene RPC für Netto-Berechnung — `estimate_net_monthly` ist da, der wird benutzt
- ❌ Keine Tokens-Erweiterung von `tokens.css` (es kommen keine neuen globalen Tokens hinzu — Sprint-1-Werte sind bereits aus Sprint 0 verfügbar)
- ❌ Kein Polish der Login- oder Onboarding-Seite über das funktional Nötige hinaus

---

## 8. Bekannte Stolperfallen

1. **`profiles`-Auto-Creation:** Es ist unklar, ob ein Auth-Trigger den profiles-Eintrag automatisch anlegt. Erst prüfen, dann handeln (siehe §3.2).

2. **Forward-Inheritance-Doppel-Eintrag:** Wenn der User zweimal denselben `(person, effective_month)` setzt — was passiert? Wenn ein Unique-Constraint existiert, schlägt der INSERT fehl. Wenn nicht, gewinnt der spätere Eintrag im Lookup („neuester Eintrag ≤ M"). Claude Code soll das DB-Verhalten via `\d income_timeline` oder `execute_sql`-Inspektion klären und in §6 Review dokumentieren. **In V1 wird kein UPDATE-Pfad gebaut** — Schema §6 sagt explizit „Append-only in V1, kein Lösch-Pfad im Frontend". Falls Constraint vorhanden ist und blockt: in Review als offene Frage melden.

3. **Steuerklasse beim ersten Onboarding:** §10 sagt, Steuerklasse wird beim ersten Income-Eintrag erfasst und in `profiles.tax_class` gespeichert. Wichtig: **nicht** in `income_timeline.tax_class` (existiert dort gar nicht). Verwechslung leicht möglich.

4. **`net_estimation_brackets` ist Read-Only:** RLS erlaubt `Read`, aber kein `Write`. Bei RPC-Call `estimate_net_monthly` ist das egal, weil die Funktion server-side mit Service-Role läuft. Wenn Claude Code aus irgendeinem Grund direkte Reads auf `net_estimation_brackets` macht: das geht (alle authentifizierten dürfen lesen). Aber nicht nötig — RPC ist der Pfad.

5. **`effective_month` Format:** In `income_timeline` ist `effective_month` typischerweise als `date` (Tag 1 des Monats). Claude Code soll konsistent Tag 1 setzen: `new Date(year, month - 1, 1)` → ISO-String oder DB-Date. Tag-Werte ≠ 1 würden Lookup-Logik brechen.

---

## 9. Falls etwas blockiert

Sprint NICHT „durchwurschteln". Stattdessen:
1. In `sprints/sprint_01_review.md` unter „Offene Fragen" dokumentieren
2. Sprint-Status in CLAUDE.md bleibt 🟡
3. Zurück an PM im PM-Chat

---

---

## Korrektur-Briefing — angehängt 11. Mai 2026 nach Sprint-1-Review

Drei PM-Entscheidungen aus dem Review:

### Korrektur K1 — Open Question #1: UPSERT statt INSERT für income_timeline

**Entscheidung: Option B.** Begründung: UNIQUE-Constraint definiert einen Slot pro
Monat-Person; Snapshot-Integrität bleibt gewahrt, weil vergangene Monate UI-seitig
gesperrt sind. Re-Save desselben Monats für denselben Person muss möglich sein.

**Konkret:**
- In `src/components/income-split/actions.ts`: INSERT → UPSERT mit
  `onConflict: "user_id,person,effective_month"`. Friendly-Error für `23505` kann
  entfernt werden (wird durch ON CONFLICT obsolet — außer für andere
  Constraint-Verletzungen, dann generischer Fehler).
- In `src/app/onboarding/actions.ts`: ebenso UPSERT statt INSERT. Onboarding läuft
  bei einem unvollständig abgebrochenen Versuch dann sauber durch.
- Sicherheitscheck Vergangenheit: Server Action prüft `effective_month >=
  date_trunc('month', now())` (oder via `is_past` aus dem Frontend übergeben).
  Falls vergangener Monat: 403 / „Vergangene Monate sind eingefroren". Das ist
  Belt-and-Suspenders zur UI-Sperre — kein Trust auf Client-State.

### Korrektur K2 — Open Question #3: Manueller Wert bleibt bei Brutto-Änderung erhalten

**Entscheidung: Alternative.** Der useEffect, der den Estimate ins Netto-Feld
schreibt, muss bei `manualOverride === true` no-op werden.

**Konkret:**
- In `onboarding-form.tsx`: useEffect-Body um `if (manualOverride) return;` ergänzen
- In `income-split/index.tsx`: ebenso
- `manualOverride` wird nur durch zwei User-Aktionen verändert:
  - `true` bei jeder manuellen Eingabe ins Netto-Feld
  - `false` durch Selbstheilung (Feld leeren + Blur → Vorschlag kehrt zurück)
- Hinweistext „Manuell angepasst" in Teal bleibt korrekt, solange manualOverride

### Open Question #2 — keine Code-Änderung

`taxClass: 1` als Default für PARTNER bleibt. V1-Limitation, kein Spec-Bruch.
V2-Backlog: Partner-Steuerklasse-Mapping bei verheirateten Paaren.

### Output

Ein zusätzlicher `fix:`-Commit auf `sprint/01-income`. Falls die Review-Datei
durch die Korrekturen nicht-aktuell wird (z. B. weil der Friendly-Error-Hinweis
in §8 Open Question #1 jetzt obsolet ist): kurzer `docs:`-Folgecommit mit
„docs: Sprint 1 review — post-correction note" und ergänze in `sprint_01_review.md`
einen kurzen Abschnitt „§10 Korrektur-Notiz" mit den drei Bullet-Punkten oben.

**Nicht-Aufgaben dieses Korrektur-Sprints:**
- Keine neuen Features
- Keine Browser-Tests durch Claude Code (übernimmt der User)
- Keine CLAUDE.md-Änderung (übernimmt PM nach finalem Approval)

---

## Korrektur-Briefing #2 — angehängt 11. Mai 2026 nach Browser-Smoke-Test

Zwei zusätzliche Korrekturen aus dem Browser-Test:

### Korrektur K3 — Onboarding-Action: UPDATE → UPSERT auf profiles

**Befund:** Wenn beim Onboarding kein profiles-Row existiert (Edge-Case: Login-Upsert
hat nicht gegriffen, z. B. wenn User aus Pre-Trigger-Zeit nie neu eingeloggt hat),
schlägt der Onboarding-Submit silent fehl: `UPDATE profiles WHERE user_id = X` trifft
0 Rows, kein Error, aber `onboarded_at` wird nie gesetzt → User landet endlos auf
`/onboarding`.

**Im Browser-Smoke-Test exakt so passiert:** Bug umgangen durch Cookies-Löschen +
Re-Login (das hat den Login-Upsert getriggert). Der Code muss aber robust gegen
diesen Edge-Case sein, sonst kommt der Bug bei neuen Test-Usern oder Migrations-
Szenarien wieder.

**Konkret:** In `src/app/onboarding/actions.ts`, der Profile-Write am Ende des
Submit-Flows:

```ts
// VORHER (silent failure möglich):
await supabase
  .from("profiles")
  .update({
    tax_class: data.tax_class,
    tax_year: data.tax_year,
    onboarded_at: new Date().toISOString(),
  })
  .eq("user_id", user.id);

// NACHHER (robust):
await supabase
  .from("profiles")
  .upsert(
    {
      user_id: user.id,
      tax_class: data.tax_class,
      tax_year: data.tax_year,
      onboarded_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
```

Begründung: idempotent, deckt Edge-Case ab. Im Happy-Path identisches Verhalten
(UPSERT überschreibt einen vorhandenen Row, was funktional einem UPDATE entspricht).

### Korrektur K4 — Split-Labels im PARTNER-Popup korrekt zuordnen

**Befund:** Im PARTNER-Popup zeigt die Split-Vorschau die Prozente invertiert.
Beispiel mit DB-Stand ICH=75k, PARTNER=40k:
- Angezeigt: „ICH 35% · PARTNER 65%" und „ICH-Anteil 420 €" ❌
- Korrekt: „ICH 65% · PARTNER 35%" und „ICH-Anteil 780 €" ✅

**Vermutete Ursache:** Die Split-Faktor-Berechnung verwendet `currentSliderGross` als
„person-Anteil" und ordnet diesen ungeachtet des aktiven `person`-Props dem
ICH-Label zu. Im ICH-Popup ist das zufällig korrekt; im PARTNER-Popup ergibt es das
gespiegelte Bild.

**Konkret:** In `src/components/income-split/index.tsx` (oder wo immer die
Split-Vorschau berechnet wird) muss die Zuordnung von Slider-Wert zu Person
explizit über das `person`-Prop erfolgen:

```ts
// Slider-Wert ist immer das Brutto der GERADE BEARBEITETEN Person
// Other-Gross ist das Brutto der ANDEREN Person (aus DB)
const ichGross = person === "ICH" ? sliderGross : otherGross;
const partnerGross = person === "PARTNER" ? sliderGross : otherGross;

const total = ichGross + partnerGross;
const ichRatio = total > 0 ? ichGross / total : 1;
const partnerRatio = 1 - ichRatio;
```

Label-Rendering bleibt unverändert (`ICH {ichRatio}%`, `PARTNER {partnerRatio}%`),
aber die zugrundeliegenden Variablen sind jetzt korrekt zugeordnet.

**Validierungs-Test nach Fix:**
- ICH-Popup, Slider auf 85k (mit PARTNER 40k aus DB): „ICH 68% · PARTNER 32%" → unverändert ✓
- PARTNER-Popup, Slider auf 40k (mit ICH 75k aus DB): „ICH 65% · PARTNER 35%" → war 35/65, soll 65/35

### Output

Ein `fix:`-Commit (K3 + K4 zusammen, weil verwandt: beide räumen Edge-Cases im
Onboarding/Income-Flow auf). Anschließend `docs:`-Commit, der die Review-Datei
um eine §11 „Korrektur-Notiz #2" ergänzt.

**Nicht-Aufgaben:** Keine UI-Änderungen über die invertierten Labels hinaus.
Keine Tests. Keine CLAUDE.md-Änderung.

**Ende des Sprint-1-Briefings.**