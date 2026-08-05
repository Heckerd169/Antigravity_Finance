# Sprint v2-13 — Review

> **Branch:** `sprint/v2-13-bau` (aus `sprint/v2-13-gemeinsame-karten`, PR #11 noch offen)
> **Commits:** 5 · **Datum:** 05. August 2026
> **Thema:** `BF-4` — der Split-Anteil wird genau **einmal** angewandt, und die
> gemeinsame Karte zeigt den eigenen Anteil mit dem Haushaltsbetrag darunter.
>
> **In einem Satz:** Der letzte der fünf Befunde vom 04.08. ist behoben — die
> Sparrate zog den Anteil zweimal ab, sobald eine gemeinsame Karte ein Fragment
> bekam (rund 466 €/Monat zu gut); auf Produktion hat sich dabei **keine einzige
> Zahl bewegt**, weil der Fehler noch nicht eingetreten war.

---

## 1. Was gebaut wurde

### P1 · Migration — alle vier Rechenfunktionen in **einer** Transaktion

`supabase/migrations/20260805_v2_13_bf4_gemeinsame_karten.sql`

| Funktion | Änderung |
|---|---|
| `calculate_card_amount_for_month` | **NEU:** wendet den Anteil auf **Plan/Anpassung** an — nicht auf Fragment-Summen |
| `calculate_sparrate_for_month` | Multiplikation mit dem Split-Faktor **entfällt** |
| `calculate_planned_sparrate_for_month` | **unverändert**, wortgleich mitgeführt |
| `get_year_deviation_drivers` | `delta = sign × (ist − plan × share)` — Anteil wandert **in** die Klammer |

**Warum nicht teilbar:** Würde man die Kartenfunktion zuerst ausliefern und die
Aufrufer später, wäre die Sparrate dazwischen **doppelt** anteilig — schlimmer als
der Ausgangsfehler. Deshalb `BEGIN … COMMIT` um alle vier.

**Warum `calculate_card_amount_for_month` der richtige Ort ist:** Sie ist die
einzige Stelle, die weiß, ob der Betrag aus Fragmenten oder aus dem Plan stammt.
Ein Aufrufer weiter oben sieht nur noch eine Zahl — genau daran ist die alte
Fassung gescheitert.

### P5 · Frontend — die Zeile `von 1.904,00 €`

`card.tsx` · `cards.types.ts` · `cards.module.css` · `page.tsx`

Die Karte führt seit der Migration automatisch den eigenen Anteil — **ohne
Frontend-Rechnung** (§7 Regel 1 gewahrt). Neu ist allein die Zeile darunter,
umgesetzt nach der Gestaltungsrunde: `10px`, `--text-muted`, 2 px zum Betrag,
5 px zum Status, Höhe auf **jeder** Karte reserviert.

### Doku · neun Patch-Stellen + design-system

`sprints/sprint_v2-13_doku_patches.md` (LL-16: Anker + Patch-Satz, Anker einzeln
auf Eindeutigkeit geprüft — 13/13 eindeutig). Design-Doku **3.1.9 → 3.2.0**,
Schema-Doku **3.4.2 → 3.4.3**, `design-system/komponenten/karten.html` nachgezogen.

---

## 2. Prüfstrecke

| Schritt | Ergebnis |
|---|---|
| `tsc --noEmit` | **0 Fehler** |
| ESLint (`src`, `.ts`/`.tsx`) | **0 Fehler / 0 Warnungen** |
| `pnpm build` | **0 Fehler** · Route `/` **29,7 kB** · First Load JS **181 kB** · Middleware 81,8 kB |
| `pnpm test:visual` | **12 / 12 grün** (6,0 s) |

> **Zwei Umwege, die in die Fähigkeiten gehören** (Vorschläge in §7):
>
> 1. **ESLint im Worktree.** Der in `sprint-abschluss` hinterlegte Ersatzaufruf
>    (`--resolve-plugins-relative-to .`) **scheitert weiterhin** — er verhindert nur
>    die doppelte *Plugin*-Auflösung, nicht die doppelte *Konfigurations*-Auflösung.
>    Weil Worktrees unter `.claude/worktrees/` **innerhalb** des Repos liegen, findet
>    ESLint zusätzlich die `.eslintrc.json` des Eltern-Checkouts. Funktioniert hat:
>    `npx eslint src --ext .ts,.tsx --no-eslintrc --config .eslintrc.json --resolve-plugins-relative-to .`
> 2. **`.env.local` fehlt im Worktree** (gitignored, existiert lokal nirgends).
>    Ohne die zwei `NEXT_PUBLIC_SUPABASE_*`-Werte bricht `pnpm build` beim
>    Prerender von `/onboarding` ab. Angelegt aus den öffentlichen Projektwerten.

**Kein authentifizierter Render-Smoke gefahren.** `E2E_TEST_EMAIL`/`_PASSWORD`
(`.env.e2e.local`) fehlen, deshalb lief nur das `visual`-Projekt. Der
Browser-Smoke bleibt damit unverändert der Produktiv-Gate — siehe §6.

---

## 3. Anker vorher/nachher

### Produktion (`nflkobdfdhncrtjncpmq`) — alle zwölf Monate

| Monat 2026 | Ist vorher | Ist nachher | Plan vorher | Plan nachher | Bewegung |
|---|---:|---:|---:|---:|---|
| Januar–April | 1.931,18 | 1.931,18 | 1.931,18 | 1.931,18 | **0,00** |
| Mai | −86,77 | −86,77 | −86,77 | −86,77 | **0,00** |
| Juni | 4.208,76 | 4.208,76 | 4.220,53 | 4.220,53 | **0,00** |
| Juli | −322,75 | −322,75 | 55,44 | 55,44 | **0,00** |
| August | 1.761,08 | 1.761,08 | 1.761,08 | 1.761,08 | **0,00** |
| September–Dezember | 1.824,08 | 1.824,08 | 1.824,08 | 1.824,08 | **0,00** |

**B2-Invariante Produktion:** vorher 12/12 · nachher 12/12, mit **identischen**
Summen (Juni −11,77 · Juli −378,19 · übrige Monate 0,00).

> **Ein grüner Anker beweist hier bewusst wenig.** Keine gemeinsame Karte hat heute
> ein verknüpftes Fragment (unabhängig nachgeprüft: 0 Links über alle Monate bei
> allen vier Karten). Der Eingriff **musste** anker-neutral sein; der Beweis der
> Richtigkeit kommt aus der Übungs-Datenbank.

### Übungs-Datenbank (`qyjuzzgqxowqiiwqcahd`) — die eigentliche Probe

Anker vor der Migration **2.200,00 €**, nach der Migration **2.200,00 €**.

Die Reihe lief **zweimal**, identisches Skript, einmal gegen die unveränderte
Funktion. Testaufbau in einer per `RAISE` zurückgerollten Transaktion (LL-18):
GEMEINSAM-Karte Plan 1.000 €, Partner-Einkommen ⇒ Split-Faktor **0,6**,
Fragment −600 € (= der eigene Anteil).

| # | Fall | vorher | nachher | erwartet nachher |
|---|---|---:|---:|---|
| T1 | Anker Ist / Plan | 2.200,00 / 2.200,00 | 2.200,00 / 2.200,00 | unverändert ✅ |
| T2 | ICH-Karte, nur Plan | 1.000,00 | 1.000,00 | unverändert ✅ |
| T3 | ICH-Karte mit Fragment | 950,00 | 950,00 | unverändert ✅ |
| T4 | **GEMEINSAM, nur Plan** | 1.000,00 | **600,00** | Plan × Faktor ✅ |
| T5 | **GEMEINSAM mit Fragment** | 600,00 | 600,00 | Fragment unverändert ✅ |
| T6 | **Ist-Sparrate mit T5-Karte** | **1.840,00** | **1.600,00** | kein zweiter Abzug ✅ |
| T7 | Plan-Sparrate mit T4-Karte | 1.600,00 | 1.600,00 | Anteil weiterhin ✅ |
| T8 | **B2 über alle 12 Monate** | 12/12 | **12/12** | hält ✅ |
| T9 | Split-Faktor 1,0 | 1.000,00 | 1.000,00 | unverändert ✅ |
| T10 | Anker nach Rollback | 2.200,00 | 2.200,00 | unverändert ✅ |

**T6 ist der Kern:** Die 240,00 €, die verschwinden, sind exakt der doppelte
Abzug — `600 × (1 − 0,6)`. Das ist `BF-4` im Kleinen, reproduziert und behoben.

### Zwei unabhängige Nachweise

**1 · Wortgleichheit belegt, nicht behauptet.** Die vier Funktions-Prüfsummen
(`md5(pg_get_functiondef)`) sind auf Übungs-DB und Produktion **identisch**:

| Funktion | Prüfsumme |
|---|---|
| `calculate_card_amount_for_month` | `4af07d32…` |
| `calculate_sparrate_for_month` | `cb880d01…` |
| `calculate_planned_sparrate_for_month` | `e80bf401…` |
| `get_year_deviation_drivers` | `6093a8e0…` |

`calculate_planned_sparrate_for_month` trägt **dieselbe** Prüfsumme wie **vor** dem
Eingriff — damit ist die Behauptung „wortgleich mitgeführt, inhaltlich unverändert"
maschinell belegt und nicht nur zugesichert.

**2 · Die Karten zeigen jetzt die realen Daueraufträge.** Ohne dass es Testziel
war, decken sich die neuen Kartenbeträge auf den Cent mit der E1-Messung:

| Karte | Haushalt | Karte zeigt | tatsächlich überwiesen (E1) |
|---|---:|---:|---:|
| Miete | 1.904,00 | **1.089,26** | −1.089,26 |
| Strom – Mainova | 63,00 | **36,04** | −36,04 |
| Internet – Vodafone | 39,98 | **22,87** | −22,87 |
| Rechtsschutz – Adam Riese | 27,01 | **15,45** | −15,45 |

---

## 4. Selbst-Review gegen die Akzeptanzkriterien

| # | Kriterium | erfüllt | Beleg |
|---|---|---|---|
| A1 | Anteil wird genau **einmal** angewandt | ✅ | T4/T5/T6; Migration §1 |
| A2 | Fragment-Summe bleibt unangetastet | ✅ | T5 600,00 vorher wie nachher |
| A3 | Alle vier Funktionen in **einer** Migration | ✅ | `20260805_v2_13_bf4_gemeinsame_karten.sql`, `BEGIN…COMMIT` |
| A4 | `calculate_planned_sparrate_for_month` unverändert | ✅ | Prüfsumme `e80bf401…` identisch vor/nach |
| A5 | Treiber-Formel umgebaut, B2 hält | ✅ | T8 12/12 auf Übung; 12/12 auf Prod, Summen identisch |
| A6 | Produktion bewegt sich nicht | ✅ | §3, alle 12 Monate Ist **und** Plan Δ = 0,00 |
| A7 | Karte zeigt den eigenen Anteil | ✅ | §3, vier Karten auf den Cent |
| A8 | Zeile `von X €`, kein neues Substantiv | ✅ | `card.tsx:HouseholdRow`; §12.3 |
| A9 | Zeilenhöhe auf jeder Karte reserviert | ✅ | `cards.module.css .householdAmount { min-height: 12px }`, in allen drei Kartentypen gerendert |
| A10 | Keine Frontend-Rechnung (§7 Regel 1) | ✅ | Loader reicht `effectivePlan` durch, kein `× Faktor` im Client |
| A11 | Entscheidung server-seitig (§7 Regel 15) | ✅ | `page.tsx` liefert `householdAmount: number \| null` |
| A12 | §4.5-Umkehr als Produkt-Entscheidung kenntlich | ✅ | Design-Doku §4.5, zitierter Alt-Satz + ⚠️-Block |
| A13 | Übungs-DB-Probe zweimal gefahren | ✅ | §3, Baseline + Nachher |
| A14 | Rennrad-Trainer zurück auf `ACTIVE_HEALTHY` | ✅ | verifiziert, noch am selben Abend |

---

## 5. Architektur-Entscheidungen

**① Der Anteil wird auf `v_base_amount` angewandt, nicht in den drei CASE-Zweigen.**
Alternative wäre gewesen, jeden Zweig einzeln anzufassen. Ein Eingriff an der
Basis-Variablen erfasst automatisch **alle** Zweige inklusive `manually_paid` und
des BUDGET-Vergleichs `fragment > plan` — beide Seiten stehen dadurch im selben
Anteils-Raum. Drei Einzeleingriffe hätten dreimal dieselbe Regel wiederholt.

**② Der Anteil wird NICHT auf zwei Stellen gerundet.** Das war die wichtigste
stille Entscheidung des Sprints. `calculate_planned_sparrate_for_month` multipliziert
ebenfalls **ungerundet** und rundet erst die Endsumme. Hätte die Kartenfunktion je
Karte gerundet, wären Ist- und Plan-Sparrate auf den vier gemeinsamen Karten um
Cent-Beträge auseinandergelaufen — **die Produktiv-Anker hätten sich bewegt**, genau
das, was nicht passieren durfte. Ungerundet zu lassen ist der Grund, warum §3 zwölf
Nullen zeigt.

**③ `get_split_factor` wird nur bei `GEMEINSAM` gerufen.** Die Kartenfunktion läuft
in `get_year_deviation_drivers` 12 × N mal. Der Aufruf innerhalb des `IF` statt davor
begrenzt die zusätzliche Last auf die vier gemeinsamen Karten statt auf alle 46.

**④ `p_user_id` kommt aus `v_card.user_id`, nicht aus `auth.uid()`.**
`get_split_factor` ist die bekannte Ausnahme mit explizitem Parameter (§6
Stolperfalle 4). Die Kartenzeile trägt den Eigentümer ohnehin — damit bleibt die
Funktion auch für Service-Rollen-Aufrufe und im Aggregat korrekt.

**⑤ Die Zeile bleibt bei Split-Faktor 1,0 leer.** In der Gestaltungsrunde
ausdrücklich offen gelassen, hier vom User entschieden. Zusätzlich von mir ergänzt:
auch bei effektivem Plan `0` bleibt sie leer — `von 0,00 €` wäre eine Falschaussage.

**⑥ Doku-Patches selbst ausgeführt statt über `docs-maintainer`.** Die
Sitzungsanweisung untersagt Subagenten ohne ausdrückliche Bitte. Das **Verfahren**
aus LL-16 ist vollständig eingehalten: separate Patch-Datei, Anker + Patch-Satz,
Eindeutigkeitsprüfung (13/13), Versions-Bump als eigene Stelle.

**⑦ Minor-Bump der Design-Doku (3.1.9 → 3.2.0) statt Patch-Bump.** Alle bisherigen
`3.1.x` waren Nachzüge. Hier dreht sich eine Produkt-Entscheidung; ein Patch-Bump
hätte genau die Stelle unsichtbar gemacht, vor der E1 warnt.

---

## 6. Offene Punkte und Fragen

1. **Der Browser-Smoke steht aus.** Automatisiert lief nur die deterministische
   Pixel-Suite; ein authentifizierter Render-Smoke war ohne `.env.e2e.local` nicht
   möglich. **Worauf zu achten ist:** die vier gemeinsamen Karten (Miete, Strom,
   Internet, Rechtsschutz) müssen den Anteil führen und darunter `von … €` zeigen —
   und **alle** Karten müssen weiterhin gleich hoch sein.
2. **Der Sprint hat den Fehler behoben, bevor er eintrat.** Sobald eine gemeinsame
   Karte künftig ein Fragment zugeordnet bekommt, greift die neue Logik. Das ist der
   erste Moment, in dem sich auf Produktion überhaupt eine Zahl bewegen wird — dann
   bewusst und richtig.
3. **`design-system` ist noch nicht nach `claude.ai/design` gesynct.** Die lokale
   Seite ist nachgezogen; der Sync-Schritt (`design-system/SYNC.md`) steht aus.
4. **PR #11 ist weiterhin offen.** Dieser Branch baut darauf auf. Reihenfolge beim
   Mergen: erst #11 (oder gleich diesen, er enthält #11 vollständig).
5. **Kein Merge erfolgt** — Freigabe liegt beim User.

---

## 7. Vorschläge für CLAUDE.md, Fähigkeiten und Roadmap

Alle als **Vorschlag** formuliert; Anwendung braucht Freigabe (§7 Regel 14).

**① CLAUDE.md §6 — neue Stolperfalle 11:**
> **Der Split-Anteil wird genau einmal angewandt — in `calculate_card_amount_for_month`,
> und zwar nur auf Plan/Anpassung.** Fragment-Summen sind bereits der überwiesene
> Anteil. Wer einen neuen Aufrufer baut, darf den Anteil **nicht erneut** anwenden.
> `calculate_planned_sparrate_for_month` ist die Ausnahme: sie rechnet auf dem
> Roh-Plan und wendet ihn deshalb weiterhin selbst an. (v2-13)

**② CLAUDE.md §8 — neues LL-23:**
> Wird ein Faktor aus einer Aggregation in eine Basis-Funktion verschoben, muss
> **jede** Formel geprüft werden, die beide Seiten einer Differenz benutzt. Aus
> `f × (a − b)` wird dann `(a − b × f)` — die Klammer ist gemischt. Wächter:
> B2-Invariante. (v2-13, `get_year_deviation_drivers`)

**③ CLAUDE.md §8 — neues LL-24:**
> **Runden ist eine Entscheidung mit Anker-Wirkung.** Eine Zwischengröße pro Karte
> zu runden, während die Vergleichsfunktion erst die Endsumme rundet, bewegt die
> Sparrate um Cent-Beträge. Vor jedem neuen `round()` prüfen, ob die Gegenseite
> genauso rundet. (v2-13)

**④ Fähigkeit `sprint-abschluss` — ESLint-Umweg korrigieren.** Der hinterlegte
Aufruf scheitert im Worktree weiterhin. Funktionierend:
`npx eslint src --ext .ts,.tsx --no-eslintrc --config .eslintrc.json --resolve-plugins-relative-to .`
Begründung: Worktrees liegen **innerhalb** des Repos, ESLint findet daher zusätzlich
die Eltern-`.eslintrc.json`; nur `--no-eslintrc` unterbindet die Kaskade.

**⑤ Fähigkeit `db-eingriff` — zwei Ergänzungen:**
- **Nach dem Restore auf `ACTIVE_HEALTHY` warten, bevor der Zustand beurteilt wird.**
  Postgres nimmt Verbindungen an, **bevor** die Daten wieder da sind. In diesem Sprint
  meldete die Übungs-DB minutenlang „keine Tabellen, keine Funktionen, kein Nutzer" —
  sie war vollständig intakt. Wer da nach Runbook neu aufbaut, zerstört eine gesunde
  Datenbank. **Erst `ACTIVE_HEALTHY`, dann den Anker messen.**
- **Prüfsummen-Vergleich als Nachweis der Wortgleichheit** aufnehmen:
  `md5(pg_get_functiondef(oid))` auf Übung und Produktion vergleichen.

**⑥ CLAUDE.md §9 — Prüfanker bestätigen.** Die Werte vom 05.08.2026 sind nach dem
Eingriff unverändert gültig und können als aktueller Stand übernommen werden.

**⑦ Roadmap:** `BF-4` auf ✅ — **Paket 1 ist damit vollständig abgeschlossen**, alle
fünf Befunde erledigt. (Im Roadmap-Commit bereits nachgezogen.)

---

*Review Sprint v2-13 · Antigravity Finance · 05. August 2026*
