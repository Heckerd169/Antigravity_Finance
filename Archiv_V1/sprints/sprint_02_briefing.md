# Sprint 2 — Singularity Ring

> **Sprint-Nummer:** 2
> **Komponente:** Singularity Ring (Dashboard-Herzstück, §5 der Design-Doku)
> **Dauer-Schätzung:** 1 Session, ~90–120 Minuten Implementierung
> **Modell-Empfehlung:** Opus 4.7
> **Branch:** `sprint/02-ring`
> **Datum erstellt:** 12. Mai 2026
> **Voraussetzung:** Sprint 1 ist 🟢 (Approved 11. Mai 2026); Migration `add_calculate_planned_sparrate_for_month` ist live; Supabase-Typen sind regeneriert

---

## 0. Pflicht-Lese-Reihenfolge für Claude Code

Beim Start dieser Session lese in dieser Reihenfolge:

1. `CLAUDE.md` (Repo-Root) — Status, Tech-Stack, Arbeitsregeln, Sprint-0/1-Lessons, Pre-Sprint-2-Log-Eintrag
2. `antigravity_finance_design_dokument_v3.md` — insbesondere **§5 Singularity Ring** (Kernkapitel), **§3 Tokens** (Farb-/Typo-Referenz), **§4.4 Forecast-Definition** (Plan-Sparrate-Semantik), **§4.2 Sparrate-Definition** (Ist-Sparrate-Semantik)
3. `antigravity_finance_schema_summary_v2.md` — insbesondere **§4 Hot-Path-RPCs** mit `calculate_sparrate_for_month` und dem neuen `calculate_planned_sparrate_for_month`
4. Diese Datei (`sprints/sprint_02_briefing.md`)
5. **Referenz-Prototyp** (visuelles Soll, im Project Knowledge bzw. `public/prototypes/`): `singularity_ring_v3.html` + `singularity_ring_v3.png`

> ⚠️ **Stolperfalle Prototyp:** Der Prototyp enthält oben einen „Sparrate diesen Monat"-Slider. Der ist **kein Teil des finalen Produkts** — Design-Doku §5 schließt jeden Slider im Dashboard explizit aus (§5 „Was explizit NICHT", §7 Arbeitsregeln „Keinen Slider im finalen Singularity Ring"). Der Slider ist reines Visualisierungs-Werkzeug zum Durchspielen aller Wertebereiche. Im finalen Code kommt die Sparrate ausschließlich per RPC, keine User-Interaktion.

---

## 1. Ziel

Am Ende dieses Sprints existieren drei Dinge:

1. **Funktionierender Singularity Ring** unter `src/components/singularity-ring/`, vollständig gemäß Design-Doku §5: SVG-Geometrie, Arc-Logik, Zentrumszahl, Farblogik, alle Grenzwert-Zustände (§5 Tabelle).
2. **RPC-Wrapper erweitert** in `src/lib/rpc.ts` um zwei Funktionen: `calculateSparrateForMonth(supabase, args)` und `calculatePlannedSparrateForMonth(supabase, args)`.
3. **Dashboard-Integration:** Server-Component `src/app/page.tsx` lädt beide Sparraten via RPC und übergibt sie an den (Client-)Ring. Email + Logout bleiben sichtbar, aber dezent (kein Header — der kommt Sprint 3). Dev-Panel wird um Force-Sparrate / Force-Plan-Override erweitert (NODE_ENV-gated).

**Was NICHT in diesem Sprint passiert:**
- Kein Header / Timeline-Navigation (Sprint 3)
- Keine Karten (Sprint 4)
- Keine Sparraten-Treppe
- Keine Sparrate-Berechnung im Frontend (alles per RPC)
- Keine Klick-/Hover-Interaktionen auf dem Ring
- Kein Slider im finalen Ring
- Keine Mobile-Anpassung

---

## 2. Voraussetzungen (vor Sprint-Start, durch User erledigt — Bestätigung im Sprint-Output)

| # | Aufgabe | Wer | Kontrolle |
|---|---|---|---|
| V1 | Sprint 1 ist approved und auf `main` gemerged | User | CLAUDE.md §4 Sprint 1 = 🟢 |
| V2 | Migration `add_calculate_planned_sparrate_for_month` ist auf Production-DB live | User | RPC existiert (siehe V4) |
| V3 | `src/lib/supabase/types.ts` ist nach der Migration regeneriert, `<claude-code-hint>`-Tag entfernt, `tsc --noEmit` clean | User | Datei enthält `calculate_planned_sparrate_for_month` in `Database["public"]["Functions"]` |
| V4 | Sanity-Query bestätigt RPC live: `SELECT calculate_planned_sparrate_for_month('<test-user-uuid>', '2026-05-01'::date);` liefert numerischen Wert ohne Error | User | Claude Code darf nicht selbst SQL ausführen; im Briefing nur dokumentiert |
| V5 | Branch `sprint/02-ring` erstellt + ausgecheckt | User | `git status` |
| V6 | Test-User-State: onboardet, Test-Daten Mai 2026 (ICH 75k/3200) — wie nach Sprint 1 | User | Login funktioniert, Dashboard erreichbar |

> Hinweis: Test-User hat keine Karten → Plan-Sparrate = Ist-Sparrate = 3200 €. Der Ring zeigt **100,0 % von Plan**, voller Teal-Arc bis 12 Uhr, weiße Zentrumszahl. Alle anderen Wertebereiche (negativ, < Plan, > Plan, > 200%) sind nur per Dev-Panel testbar — siehe §3.6.

---

## 3. Aufgaben (in dieser Reihenfolge ausführen)

### 3.1 RPC-Wrapper erweitern

**Datei:** `src/lib/rpc.ts`

Zwei neue Funktionen, parallel zu `estimateNetMonthly`:

```ts
export async function calculateSparrateForMonth(
  supabase: SupabaseClient<Database>,
  args: { userId: string; month: string /* "YYYY-MM-01" */ }
): Promise<number | null> {
  // .rpc("calculate_sparrate_for_month", { p_user_id, p_month })
  // Mapping camelCase → snake_case im Wrapper
  // Returns null bei NULL-Response (Onboarding offen)
}

export async function calculatePlannedSparrateForMonth(
  supabase: SupabaseClient<Database>,
  args: { userId: string; month: string }
): Promise<number | null> {
  // analog
}
```

**Anforderungen:**
- Signatur folgt Wrapper-Konvention (CLAUDE.md §7 Datei-Konventionen): `SupabaseClient` als erster Parameter, args-Objekt als zweiter.
- Returntyp `number | null` (nicht throw). NULL ist legitim (Onboarding offen / kein Income-Eintrag).
- `month` als String `"YYYY-MM-01"` konstruieren — niemals `new Date(...)` direkt an die DB übergeben (CLAUDE.md §7 Regel 9, Timezone-Risiko).
- Wenn Supabase-Errors anders als `null`-Daten auftreten (Network, RLS-Verletzung): Error werfen — der Aufrufer entscheidet, was passiert. Wrapper schluckt keine Errors.

### 3.2 Komponenten-Skeleton anlegen

**Dateien:**
- `src/components/singularity-ring/index.tsx`
- `src/components/singularity-ring/singularity-ring.module.css`
- `src/components/singularity-ring/singularity-ring.types.ts`

**Component-Typ:** Client Component (`"use client"`) wegen Post-Mount-Animation (siehe §3.4). Daten kommen via Props vom Server.

**Props-Interface** (`singularity-ring.types.ts`):

```ts
export type SingularityRingProps = {
  /** Ist-Sparrate des angezeigten Monats. null = Onboarding offen / kein Income */
  currentSparrate: number | null;
  /** Plan-Sparrate desselben Monats. null analog */
  plannedSparrate: number | null;
};
```

> Bewusst minimal: keine Monat-Props, kein Klick-Handler, kein Loading-State. Sprint 3 wird das ggf. erweitern.

### 3.3 SVG-Markup + Geometrie

Geometrie 1:1 aus Prototyp (`singularity_ring_v3.html` Zeilen 28–51), in JSX übersetzt. Konstanten als Top-Level-Konstanten in `index.tsx`:

```ts
const R = 98;
const STROKE_WIDTH = 9;
const C = 2 * Math.PI * R; // ≈ 615.752
const HC = C / 2;          // ≈ 307.876
```

**SVG-Struktur** (in dieser Reihenfolge — wichtig wegen Stacking):

1. `<circle>` Track (Hintergrund-Kreis): `cx=124 cy=124 r=98 fill=none stroke=<track-color> stroke-width=9`. Kein linecap nötig (keine Arc).
2. `<circle>` Arc-Negativ (rot): `stroke=var(--color-red) stroke-width=9 stroke-linecap=round`, `stroke-dasharray="${C}"`, initial `stroke-dashoffset={C}`, CSS-class `aneg`. Transform: `scaleX(-1) rotate(90deg)` mit `transform-box: fill-box; transform-origin: center`.
3. `<circle>` Arc-Positiv (teal): analog, `stroke=var(--color-teal)`, CSS-class `apos`, Transform: `rotate(90deg)`.
4. `<circle>` Dot-unten: `cx=124 cy=222 r=3.5 fill=var(--text-ghost)`.
5. `<circle>` Dot-oben: `cx=124 cy=26 r=3.5 fill=var(--text-ghost)`.

Reihenfolge ist relevant: Dots zeichnen über die Arcs.

### 3.4 Arc-Animation (Post-Mount)

**Problem:** Wenn der Server-Render bereits den finalen `stroke-dashoffset` schickt, „springt" der Arc beim Hydration sichtbar — keine Animation, Wert ist sofort da.

**Lösung:** Initial-State im Component ist `dashoffset = C` (= kein Arc sichtbar). `useEffect` setzt nach Mount den Zielwert; CSS-Transition (`transition: stroke-dashoffset .72s cubic-bezier(.22,0,.08,1)`) animiert weich.

```ts
const [posOffset, setPosOffset] = useState(C);
const [negOffset, setNegOffset] = useState(C);

useEffect(() => {
  // Berechne Ziel-Offsets aus props (siehe §3.5)
  // requestAnimationFrame um sicherzustellen, dass initial-CSS gerendert ist
  requestAnimationFrame(() => {
    setPosOffset(targetPos);
    setNegOffset(targetNeg);
  });
}, [currentSparrate, plannedSparrate]);
```

**Wichtig:** `requestAnimationFrame` (oder `setTimeout(..., 0)`) ist nicht kosmetisch — ohne ihn passiert die State-Änderung im selben Render-Cycle wie der Initial-Mount, und die Transition feuert nicht. Mit ihm wird der DOM erst mit `dashoffset=C` gemalt, danach in den Ziel-Wert übergeblendet.

### 3.5 Arc-Mathematik + Farb-/Subtext-Logik

Die Mathematik ist 1:1 aus Prototyp `singularity_ring_v3.html` Zeilen 71–103, neu strukturiert. **Implementiere als reine Funktion** (`computeRingState`) — keine Berechnungen im JSX:

```ts
type RingState = {
  posOffset: number;
  negOffset: number;
  centerColor: "red" | "white" | "teal";
  subtext: string | null;
  subtextColor: "red" | "teal" | "muted";
};

function computeRingState(current: number, plan: number): RingState {
  // Edge-Case plan = 0: kein Arc, Subtext = null. Siehe §3.7.
  if (plan === 0) {
    return { posOffset: C, negOffset: C, centerColor: "white", subtext: null, subtextColor: "muted" };
  }

  const pct = current / plan;

  // Center-Farbe (§5 Tabelle)
  const centerColor: RingState["centerColor"] =
    current < 0 ? "red" : current <= plan ? "white" : "teal";

  if (current >= 0) {
    const fill = Math.min(pct * HC, C - 0.5);
    const posOffset = C - fill;
    if (current > plan) {
      return {
        posOffset,
        negOffset: C,
        centerColor,
        subtext: `+${formatPct((pct - 1) * 100)} % über Plan`,
        subtextColor: "teal",
      };
    }
    return {
      posOffset,
      negOffset: C,
      centerColor,
      subtext: `${formatPct(pct * 100)} % von Plan`,
      subtextColor: "muted",
    };
  }

  // current < 0
  const fill = Math.min(Math.abs(pct), 1) * HC;
  const negOffset = C - fill;
  return {
    posOffset: C,
    negOffset,
    centerColor,
    subtext: `−${formatPct(Math.abs(pct) * 100)} % Defizit`,
    subtextColor: "red",
  };
}
```

**Formatierung:**
- `formatPct(n)`: 1 Dezimalstelle, deutsche Lokale, `n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })`
- Geldbetrag im Zentrum: `formatEur(n)` → `(n >= 0 ? '+' : '−') + Math.abs(n).toLocaleString('de-DE', { maximumFractionDigits: 0 }) + '\u00a0€'` (NBSP zwischen Zahl und €, U+2212 für Minus, nicht Bindestrich)
- Aktuell-Monats-Anzeige verwendet **keine** Dezimalstellen für die Zentrumszahl (Prototyp: `de(Math.abs(v),0)`).

### 3.6 Edge-Cases

| Szenario | Verhalten | Implementierung |
|---|---|---|
| `currentSparrate === null` ODER `plannedSparrate === null` | „Leer-Zustand": Ring zeigt nur Track + Dots, Zentrum `—`, Sublabel SPARRATE bleibt, kein Subtext | Beide Offsets auf `C`, Center-Text `"—"`, Subtext-DOM-Knoten leer |
| `plannedSparrate === 0` | Kein Arc (Division-by-Zero-Schutz). Zentrum zeigt Ist-Sparrate normal. Subtext: kein Text (Ratio undefiniert) | siehe `computeRingState` plan=0-Branch |
| `currentSparrate > 2 × plannedSparrate` | Teal-Arc bei `C - 0.5` gecappt (fast voller Kreis). Zentrum + Subtext bleiben semantisch korrekt | bereits durch `Math.min(... , C - 0.5)` |
| `currentSparrate < −plannedSparrate` (Defizit > 100%) | Roter Arc bei `HC` gecappt (6 → 12 Uhr CW). Zentrum + Subtext semantisch korrekt | bereits durch `Math.min(|pct|, 1) × HC` |
| `currentSparrate === 0` | Beide Offsets `C` (kein Arc), beide Dots sichtbar, weiße Zentrumszahl `+0 €`, Subtext „0,0 % von Plan" (muted) | normaler Pfad, `pct = 0`, kein Spezialcode |

> Onboarding-NULL-Pfad: Middleware-Guard aus Sprint 1 sorgt dafür, dass nur onboardete User das Dashboard sehen. Defensiv rendern wir den Leer-Zustand trotzdem.

### 3.7 Token-Konvention für Ring-spezifische Farben

Im Prototyp werden drei RGBA-Werte verwendet, die **nicht** in `tokens.css` existieren und auch nicht dorthin gehören (Ring-lokal, nirgendwo sonst):

- `rgba(255,255,255,0.05)` — Track-Background
- `rgba(255,255,255,0.20)` — SPARRATE-Label
- `rgba(255,255,255,0.28)` — Subtext im „neutral" Zustand

**Lösung:** Component-lokale CSS-Custom-Properties am `.ringStage`-Root in `singularity-ring.module.css`:

```css
.ringStage {
  --ring-track: rgba(255, 255, 255, 0.05);
  --ring-label: rgba(255, 255, 255, 0.20);
  --ring-subtext-muted: rgba(255, 255, 255, 0.28);
  /* globale tokens kommen via var(--color-teal) etc. */
}
```

**Globale Token-Refs verwenden** für:
- `--color-teal` (Teal-Arc, Center-Farbe Teal, Subtext-Farbe Teal)
- `--color-red` (Rot-Arc, Center-Farbe Rot, Subtext-Farbe Rot)
- `--text-primary` (Center-Farbe White)
- `--text-ghost` (Dots `rgba(255,255,255,.22)` — wert-identisch)

**Hex/RGBA direkt im JSX (z. B. via `style={{ stroke: "#3ECFAF" }}`) ist verboten** (CLAUDE.md §7 Regel 4).

### 3.8 Farb-Umschaltung von Center + Subtext

Da `style={{ color: ... }}` für Tokens umständlich ist (Custom-Property-Auflösung im React-Inline-Style), Pattern: `data-state="…"`-Attribut + CSS-Selector.

```tsx
<div className={styles.centerValue} data-color={ringState.centerColor}>
  {formattedAmount}
</div>
<div className={styles.subtext} data-color={ringState.subtextColor}>
  {ringState.subtext}
</div>
```

```css
.centerValue[data-color="red"]  { color: var(--color-red); }
.centerValue[data-color="white"]{ color: var(--text-primary); }
.centerValue[data-color="teal"] { color: var(--color-teal); }
.subtext[data-color="red"]   { color: var(--color-red); }
.subtext[data-color="teal"]  { color: var(--color-teal); }
.subtext[data-color="muted"] { color: var(--ring-subtext-muted); }
```

Vorteil: deklarativ, keine JS-Style-Auflösung, keine Hex-Inline.

### 3.9 Dashboard-Integration (Server-Component + Client-Ring)

**Datei:** `src/app/page.tsx`

Page bleibt Server-Component. Lädt beide Sparraten via Wrapper (mit `createClient` aus `lib/supabase/server`).

```tsx
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
// User ist durch Middleware-Guard garantiert nicht null

const month = currentMonthYYYYMM01(); // Helper, siehe unten
const [current, planned] = await Promise.all([
  calculateSparrateForMonth(supabase, { userId: user.id, month }),
  calculatePlannedSparrateForMonth(supabase, { userId: user.id, month }),
]);

return (
  <main className={styles.dashboard}>
    <div className={styles.topbar}>
      <span className={styles.email}>{user.email}</span>
      <LogoutButton />
    </div>
    <div className={styles.ringStage}>
      <SingularityRing currentSparrate={current} plannedSparrate={planned} />
    </div>
    {process.env.NODE_ENV === "development" && (
      <DevPanel
        realCurrent={current}
        realPlanned={planned}
        /* siehe §3.10 */
      />
    )}
  </main>
);
```

**Helper `currentMonthYYYYMM01`:** in `src/lib/date.ts` oder direkt in `page.tsx` als const. CLAUDE.md §7 Regel 9: niemals via `new Date(year, month-1, 1)`-Roundtrip. Stattdessen:

```ts
function currentMonthYYYYMM01(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}-01`;
}
```

> Server-Side gerendert in UTC → für deutsche User unkritisch (Tag 1 ist Tag 1, unabhängig vom Tag im Monat). Wenn der Server im 23:59 UTC den 31. Mai schreibt und der User in 01:59 CEST den 1. Juni sieht: würde rückwirkende Mai-Zahlen anzeigen für einen Junimorgen. **Akzeptiert für V1**, Timezone-Fix kommt mit Header / Timeline-Nav in Sprint 3.

### 3.10 Dev-Panel-Erweiterung (NODE_ENV-gated)

Das aus Sprint 1 existierende Dev-Panel auf `/` (Income-Split-Trigger) wird erweitert um eine **Force-Override-Sektion** für den Ring. Production-Build sieht das nie.

**Datei:** vorhandenes Dev-Panel (vermutlich inline in `page.tsx` oder in `src/components/dev-panel/`) ergänzen, ODER neue Datei `src/components/dev-panel/` einführen falls noch nicht extrahiert.

**Funktion:**
- Zwei Inputs: „Force currentSparrate" und „Force plannedSparrate" (jeweils Number-Inputs, leer = no-override).
- Bei Override: Der Ring rendert mit den geforced-ten Werten statt der RPC-Werte.

**Implementation-Muster:**

Da der Ring eine Client-Komponente ist und Page eine Server-Komponente: Dev-Panel muss ebenfalls Client sein, und der Ring + Dev-Panel teilen sich State über einen kleinen Wrapper:

```tsx
// src/components/dashboard-ring-stage/index.tsx (Client)
"use client";

export function DashboardRingStage({
  realCurrent,
  realPlanned,
}: { realCurrent: number | null; realPlanned: number | null }) {
  const [forceCurrent, setForceCurrent] = useState<number | null>(null);
  const [forcePlanned, setForcePlanned] = useState<number | null>(null);

  const effectiveCurrent = forceCurrent ?? realCurrent;
  const effectivePlanned = forcePlanned ?? realPlanned;

  return (
    <>
      <SingularityRing currentSparrate={effectiveCurrent} plannedSparrate={effectivePlanned} />
      {process.env.NODE_ENV === "development" && (
        <DevPanel
          forceCurrent={forceCurrent}
          forcePlanned={forcePlanned}
          onForceCurrent={setForceCurrent}
          onForcePlanned={setForcePlanned}
        />
      )}
    </>
  );
}
```

> **Wichtig:** `process.env.NODE_ENV` ist im Client-Bundle zur Build-Zeit ersetzt. Im Production-Build wird der Dev-Panel-JSX-Zweig tree-shaked. Verifizierbar via `grep -r "Force currentSparrate" .next/static/` nach `pnpm build` — sollte 0 Treffer geben.

> Sprint-1-Dev-Trigger (Income-Split-Popup-Trigger) **bleiben funktional**. Im Dev-Panel-Layout neben den Force-Inputs lassen. TODO-Kommentar (`// TODO Sprint 4: Dev-Trigger entfernen, sobald Ring/Karten klickbar sind`) ergänzen.

### 3.11 UI-Copy (deutsch)

| Element | Text | Anmerkung |
|---|---|---|
| Sublabel unter Zentrumszahl | `SPARRATE` | Uppercase, 8px, letter-spacing 2px, color `--ring-label` |
| Subtext bei `0 ≤ v ≤ Plan` | `X,X % von Plan` | NBSP zwischen Zahl und %, muted |
| Subtext bei `v > Plan` | `+X,X % über Plan` | NBSP, teal |
| Subtext bei `v < 0` | `−X,X % Defizit` | U+2212 Minus, NBSP, rot |
| Zentrum bei NULL | `—` (Em-Dash U+2014) | text-primary |

> Falls `antigravity_finance_design_dokument_v3.md` §12 (UI-Copy) abweichende Strings spezifiziert: **§12 gewinnt**. Im Briefing-Output (Review) als Fußnote dokumentieren, falls eine Abweichung auftritt.

---

## 4. Akzeptanz-Kriterien

| # | Kriterium | Wie geprüft |
|---|---|---|
| A1 | `pnpm build` + `tsc --noEmit` + `next lint` clean | Build-Output, Logs |
| A2 | Ring unter `/` sichtbar nach Login | Screenshot |
| A3 | Real-State (Test-User keine Karten): Ring zeigt voller Teal-Arc bis 12 Uhr, weiße Zahl `+3.200 €`, Subtext „100,0 % von Plan" muted | Screenshot |
| A4 | Force currentSparrate = `0`: kein Arc, weiße `+0 €`, Subtext „0,0 % von Plan" muted | Screenshot |
| A5 | Force currentSparrate = `1500`, plan = `3200`: Teal-Arc ca. 47% CCW (zwischen 6 und 9 Uhr), weiße Zahl, Subtext „46,9 % von Plan" muted | Screenshot |
| A6 | Force currentSparrate = `5000`, plan = `3200`: Teal-Arc über 12 Uhr (ca. 78% des Vollkreises), **teal** Zahl `+5.000 €`, Subtext „+56,3 % über Plan" teal | Screenshot |
| A7 | Force currentSparrate = `8000`, plan = `3200`: Teal-Arc bei `C - 0.5` (visuell quasi voll), teal Zahl `+8.000 €`, Subtext „+150,0 % über Plan" teal | Screenshot |
| A8 | Force currentSparrate = `-500`, plan = `3200`: Roter Arc CW (ca. 15% bis halbweg 3 Uhr), **rote** Zahl `−500 €`, Subtext „−15,6 % Defizit" rot | Screenshot |
| A9 | Force currentSparrate = `-3500`, plan = `3200`: Roter Arc gecappt bei 12 Uhr (genau `HC`), rote Zahl `−3.500 €`, Subtext „−109,4 % Defizit" rot | Screenshot |
| A10 | Force plannedSparrate = `0`, currentSparrate = `850`: kein Arc, weiße Zahl `+850 €`, kein Subtext (DOM-Element leer oder absent) | Screenshot |
| A11 | Animation: Beim Page-Load oder Force-Wert-Wechsel ist der Arc-Übergang sichtbar weich (ca. 700 ms), kein „Spring" | Screen-Recording / manuelle Beobachtung |
| A12 | Kein Slider im finalen Ring-DOM. Source-View: kein `<input type="range">` außer im Dev-Panel | DevTools-Inspect |
| A13 | Production-Build (`pnpm build && pnpm start`): Dev-Panel-Markup ist nicht im DOM, `<input>`-Suche im Page-Source liefert 0 Treffer für Force-Felder | `pnpm build && pnpm start` + `view-source:` |
| A14 | RPC-Aufrufe ausschließlich über `lib/rpc.ts`: `grep -rn "rpc(\"calculate_" src/app src/components` liefert 0 Treffer (außer im Wrapper selbst) | Code-Grep |
| A15 | Keine Hex- oder RGBA-Farbcodes inline in `.tsx` oder `.module.css` außer in den drei dokumentierten Ring-lokalen Custom-Properties am `.ringStage`-Root | Code-Grep `grep -E "#[0-9a-fA-F]{3,8}|rgba?\(" src/components/singularity-ring/` |
| A16 | Email + Logout sichtbar, aber dezent (top-right oder ähnlich, keine Dominanz gegenüber Ring) | Screenshot |
| A17 | `font-variant-numeric: tabular-nums` greift in Zentrumszahl und Subtext (DevTools Computed) | Screenshot |

---

## 5. Smoke-Test-Sequenz für User

**Vorbereitung:** V1–V6 erledigt. `pnpm dev` läuft. Eingeloggt als Test-User.

1. `localhost:3000` → Ring sichtbar, **realer State**: voller Teal-Arc bis 12 Uhr, `+3.200 €`, „100,0 % von Plan". Animation beim Laden weich. **(A2, A3, A11, A16, A17)**
2. Dev-Panel sichtbar mit Force-Inputs. Sprint-1-Trigger („[DEV] ICH bearbeiten" / „[DEV] PARTNER bearbeiten") weiterhin sichtbar.
3. Force currentSparrate = `0` → A4 prüfen.
4. Force currentSparrate = `1500` → A5 prüfen.
5. Force currentSparrate = `5000` → A6 prüfen.
6. Force currentSparrate = `8000` → A7 prüfen.
7. Force currentSparrate = `-500` → A8 prüfen.
8. Force currentSparrate = `-3500` → A9 prüfen.
9. Force currentSparrate = `850`, Force plannedSparrate = `0` → A10 prüfen.
10. Force-Felder leeren → Ring kehrt auf Real-State zurück.
11. `pnpm build && pnpm start` → eingeloggt als Test-User, Real-State weiterhin korrekt, kein Dev-Panel sichtbar. **(A13)**

Wenn 1–11 grün und A1–A17 erfüllt → Sprint 2 auf 🟢.

---

## 6. Sprint-Output (`sprints/sprint_02_review.md`)

Pflicht-Inhalt (analog Sprint 1):

1. `git log --stat`-Output des Sprint-Commits
2. `tree src/` (mind. 3 Ebenen, neue Dateien sichtbar)
3. `pnpm build` letzte 20 Zeilen + `tsc --noEmit`-Output + `next lint`-Output
4. Screenshots zu A2–A10, A16
5. Production-Build-Verifikation A13: Output von `grep -c "Force currentSparrate" .next/static/chunks/*.js || echo "0"` (sollte 0 sein)
6. Selbst-Review-Checkliste A1–A17 (jede Zeile abgehakt + Beleg)
7. RPC-Wrapper-Beleg: Snippet von `src/lib/rpc.ts` mit den beiden neuen Funktionen
8. Bestätigung V1–V6 erledigt (User-Verantwortung, aber Sichtprüfung beim Sprint-Start)
9. Offene Fragen an den PM
10. Vorschläge zur CLAUDE.md-Aktualisierung

---

## 7. Nicht-Aufgaben (Anti-Drift)

- ❌ Kein Header / Timeline-Navigation (Sprint 3)
- ❌ Keine Karten irgendeiner Art (Sprint 4)
- ❌ Keine Sparraten-Treppe
- ❌ Keine eigene Sparrate-Berechnung im Frontend (alles per RPC)
- ❌ Kein Slider im finalen Ring (Prototyp-Slider ist Werkzeug, nicht Produkt — §5)
- ❌ Keine Klick- / Hover- / Touch-Interaktionen auf dem Ring
- ❌ Kein Glow, kein Apple-Watch-Doppelring, kein Prozent-Text in der Arc-Geometrie (§5 „Was explizit NICHT")
- ❌ Keine Tooltips über den Dots
- ❌ Keine Animationen über die `stroke-dashoffset`-Transition hinaus (kein „Bouncing", kein Color-Pulse)
- ❌ Keine Monatsauswahl / kein Datepicker — nur aktueller Monat per Server-Berechnung
- ❌ Keine Persistenz der Force-Override-Werte (localStorage, URL-Params, etc.) — flüchtiger State im Component, das ist Zweck
- ❌ Keine Tests / kein Storybook
- ❌ Keine neuen globalen Tokens in `tokens.css` (Ring-lokale CSS-Vars sind komponenten-intern, §3.7)
- ❌ Keine Mobile-Anpassungen
- ❌ Kein Refactor des bestehenden Dashboards über das in §3.9 beschriebene Maß hinaus

---

## 8. Bekannte Stolperfallen

1. **SVG-`transform-box: fill-box` + CSS-Module:** Funktioniert in Chrome / Safari / Firefox, aber bei manchen CSS-Module-Setups werden Spezifitäts-Probleme gemeldet. Wenn Arc nicht am richtigen Punkt startet: erst `transform-origin: center` und `transform-box: fill-box` *beide* gesetzt prüfen, danach Browser-Devtools-Computed kontrollieren. Im Zweifel: inline-`style`-Attribut auf dem `<circle>` statt CSS-Modul-Class — explizit erlaubt für diese zwei SVG-Properties (nicht aber für Farben).

2. **Hydration-Spring:** Wenn der Initial-State `posOffset = C` im ersten Client-Render nicht `C` ist (z. B. wegen useState-Lazy-Init mit Real-Wert), springt der Arc beim Mount auf den Zielwert ohne Animation. Lösung: useState explizit mit `C` initialisieren, useEffect mit `requestAnimationFrame` setzt den Real-Wert.

3. **`requestAnimationFrame` in useEffect-Cleanup:** Wenn props sich schnell hintereinander ändern (Force-Override-Slider), kann ein abgebrochener Animation-Frame zu Race-Conditions führen. Defensiv: rAF-Handle merken und im Cleanup canceln. Optional in Sprint 2 — falls Smoke-Test glitches zeigt.

4. **Server-Component-RPC-Errors:** Wenn `calculateSparrateForMonth` einen Server-Error wirft (z. B. RLS-Verletzung), crasht die Page. Sprint-1-Middleware sollte das nicht zulassen, aber defensiv: `try/catch` im Page-Code, im Catch beide Werte auf `null` setzen → Ring rendert Leer-Zustand. **Optional in Sprint 2** — wenn nicht eingebaut, im Review als bekannte Lücke vermerken.

5. **`process.env.NODE_ENV` in Client-Komponente:** Funktioniert in Next.js, aber **nur als direkter String-Check** (`process.env.NODE_ENV === "development"`). Dynamischer Zugriff via Variable wird nicht ersetzt und führt zu Runtime-Error im Browser. Im Dev-Panel-Code immer direkten String-Vergleich verwenden.

6. **U+2212 vs. Bindestrich:** Der Prototyp verwendet `\u2212` (echtes Minus) statt `-` für negative Werte. Visuell wichtig, vor allem für die `34px`-Zentrumszahl. In TS-Code als `"\u2212"` schreiben — nicht direkt einkopieren (Editor-Auto-Replace-Risiko).

7. **NBSP zwischen Zahl und Einheit:** `\u00a0` zwischen Zahl und `€` bzw. `%`. Standard im Prototyp. In `formatEur` / `formatPct` einbauen.

8. **plan === 0 vs. plan === null:** Bei `plan === null` (Onboarding offen) ist die ganze Berechnung undefiniert → Leer-Zustand. Bei `plan === 0` (onboarded, aber kein Income — sollte nicht passieren, da Onboarding Netto > 0 erzwingt) → Spezialfall in `computeRingState`. Beide Pfade getrennt behandeln.

---

## 9. Falls etwas blockiert

Sprint NICHT „durchwurschteln". Stattdessen:
1. In `sprints/sprint_02_review.md` unter „Offene Fragen" dokumentieren
2. Sprint-Status in CLAUDE.md bleibt 🟡
3. Zurück an PM im PM-Chat

---

## 10. Sprint-Output-Reihenfolge (CLAUDE.md §7 — Erinnerung)

Am Sprint-Ende strikt:

1. Code implementieren
2. `pnpm build`, `tsc --noEmit`, `next lint` — alle clean
3. **`feat:`-Commit** für Code auf `sprint/02-ring`
4. `sprints/sprint_02_review.md` schreiben (referenziert `git status` *nach* Commit = clean)
5. **`docs:`-Commit** für die Review-Datei
6. Push auf Remote
7. Am Session-Ende: `git status` clean, keine `??` oder `M` übrig

Bei Korrekturen: jeweils `fix:`-Commit (Code) + `docs:`-Commit (Review-Append).
