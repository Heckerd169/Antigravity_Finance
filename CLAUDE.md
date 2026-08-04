# CLAUDE.md — Antigravity Finance

> **Was diese Datei ist:** die Verfassung des Projekts — ausschließlich das, was
> **immer** gilt. Sie wird in jeder Sitzung vollständig geladen; alles, was hier steht,
> kostet also dauerhaft Platz. Historie, Verfahren und Spezifikation stehen deshalb
> woanders — die Landkarte dazu ist §3.
>
> **Pflege:** Der zentrale Arbeits-Agent aktualisiert diese Datei patch-basiert nach
> jedem Sprint (§7 Regel 14), aber **nur nach ausdrücklicher Freigabe** des Users.
>
> **Letzte Aktualisierung:** 04. August 2026 · **nach:** Struktur-Sprint v2-08
> (1.857 → 330 Zeilen; der Sprint-Log liegt seither in `sprints/projekt_historie.md`)

---

## 1. Was das Projekt ist

**Antigravity Finance** ist eine Single-Surface-Web-App zur persönlichen
Sparraten-Steuerung für einen einzelnen Power-User (Wirtschaftsmathematiker,
Controlling-Hintergrund).

**Kernprinzip:** Ein Screen, ein Monat, eine primäre Zahl — die Sparrate.
**Plattform:** Web-App. Mobile ist NICHT im Scope.
**Sprache:** UI komplett deutsch, Code-Identifier englisch. Mapping: Design-Doku §2.6.
**Betriebsstand:** Go-Live erfolgt. In der Produktiv-Datenbank liegen **echte
Finanzdaten** des Users — das schärft jede Test- und Migrations-Regel (§4).

**Repo-Name:** `Antigravity_Finance` (Dateisystem) · `antigravity-finance`
(`package.json#name`, npm erzwingt kebab-case).

---

## 2. Tech-Stack

| Schicht | Wahl | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14.2.35 |
| Sprache | TypeScript | strict mode an |
| React | — | 18.3.1 |
| Backend | Supabase (Postgres 17.6) | eu-west-1 |
| SDK | `@supabase/supabase-js` | 2.105.4 |
| SSR-Helper | `@supabase/ssr` | 0.10.3 |
| Styling | Plain CSS mit Custom Properties | — |
| Package Manager | pnpm | 11.x |
| ESLint | `next/core-web-vitals` | 8.x |
| E2E-/Visual-Tests | Playwright (`@playwright/test`) | 1.61.x |
| Deployment | Vercel | Region matched Supabase (eu-west-1) |

**Major-Versions sind eingefroren.** Keine Bumps von Next/React/ESLint ohne
expliziten Sprint-Auftrag.

**Was NICHT verwendet wird:** kein Tailwind · keine Component-Library ·
kein State-Manager · keine ORM.

**Tests:** Playwright-Render-Smoke (read-only gegen dev/Prod-DB) + deterministische
§9-Pixel-Checks (`pnpm test:visual`, synthetische Fixtures ohne Live-Daten).
Daten-mutierende E2E laufen **nur** gegen die Übungs-Datenbank (§4). Der manuelle
Browser-Smoke des Users bleibt der Produktiv-Gate.

---

## 3. Ablage — wo was liegt und wohin Neues gehört

```
Antigravity_Finance/
├── CLAUDE.md                                  ← diese Datei (Verfassung)
├── README.md                                  ← Setup in 3 Zeilen
├── antigravity_finance_design_dokument.md     ← Design-Bibel  (§5)
├── antigravity_finance_schema_summary.md      ← Schema-Bibel  (§5)
├── .claude/
│   ├── settings.json                          ← geteilte Freigaben (versioniert)
│   ├── settings.local.json                    ← lokal, gitignored
│   ├── agents/                                ← Subagenten (§4)
│   └── skills/                                ← Fähigkeiten (§4)
├── sprints/                                   ← sprint-gebundene Artefakte
│   ├── projekt_historie.md                    ← der vollständige Sprint-Log
│   ├── sprint_v2-NN_briefing.md
│   ├── sprint_v2-NN_review.md
│   ├── sprint_v2-NN_doku_patches.md
│   └── doku_patch_JJJJ-MM-TT_<slug>.md        ← Nachzüge ohne eigenen Sprint
├── V2/                                        ← Entscheidungs-/Konzeptpapiere
│   ├── v2_roadmap_konsolidiert.md             ← Master-Backlog, LEBEND
│   └── befunde_JJJJ-MM-TT_<slug>.md           ← Diagnosen aus der Nutzung
├── Archiv_V1/                                 ← abgeschlossene V1-Historie, read-only
├── design-system/                             ← Formensprache als ansehbare Seiten
│   └── SYNC.md                                ← wie sie zu claude.ai/design kommen
├── screenshots/                               ← Bilder lokal, nur README versioniert
├── src/                                       ← App (Komponente pro Ordner, §7)
├── tests/e2e/                                 ← unauth · auth.setup · render-smoke · visual-pixel
├── supabase/migrations/                       ← versionierte Migrationen ab v2-04
├── supabase/test_projekt/                     ← Übungs-DB-Runbook + Init-2-Seed
├── public/prototypes/                         ← HTML-Prototypen als Referenz
├── import_data/                               ← Konto-Abzüge, gitignored, NIE committen
└── playwright.config.ts                       ← Projekte: visual · unauth · setup · render-smoke
```

### Wohin gehört etwas Neues?

Verbindliche Grenze seit **23.07.2026** (User-Freigabe „Struktur-Vorschlag: Go",
Beleg: `sprints/doku_patch_2026-07-23_doku-struktur-stabilisierung.md`):

| Wenn du das schreibst … | … gehört es hierhin | Erkennungsmerkmal |
|---|---|---|
| Sprint-Briefing, Sprint-Review, Doku-Patch, Migrations-Entwurf | `sprints/` | gehört zu **einem** Sprint |
| Konzept-, Options-, Beschluss-, Diskussionspapier | `V2/` | **entscheidet** etwas, sprint-übergreifend |
| Befund / Diagnose aus der App-Nutzung | `V2/befunde_JJJJ-MM-TT_<slug>.md` | beschreibt einen **Ist-Zustand**, keine Umsetzung |
| Fehler-Screenshot | `screenshots/JJJJ-MM-TT_<anlass>/` | Bilder bleiben **lokal** (gitignored) |
| Wiederholbares Verfahren | `.claude/skills/<name>/SKILL.md` | wird **mehrfach** gebraucht (§4) |
| Seite, die die Formensprache **zeigt** | `design-system/` | Vorlage für `claude.ai/design`, Ablauf in `design-system/SYNC.md` |
| Was vor über einem Jahr passiert ist | bleibt, wo es ist | `Archiv_V1/` wird **nicht** nachgepflegt |

**Zwei Faustregeln.** Ein Papier, das eine Frage *beantwortet*, gehört nach `V2/`.
Ein Papier, das eine Umsetzung *begleitet*, gehört nach `sprints/`. — Und: die
Dateinamen der beiden Bibeln sind **stabil**; ihre Version steht nur im Header
plus Changelog, es gibt keine Renames pro Versions-Bump.

---

## 4. Rollen, Gates und Werkzeuge

### Wer macht was

**Claude Code ist seit 22.07.2026 der zentrale Arbeits-Agent** und trägt PM- **und**
Architekten-Rolle. Vorher waren das getrennte Chats; Formulierungen wie
„PM eskaliert an Architekten" bedeuten heute: *dieselbe Sitzung wechselt bewusst die
Perspektive und prüft gegen die Datenbank, bevor sie patcht.*

**Der Design-Direktor bleibt ein separater Chat.** Design-Entscheidungen werden dort
eingeholt, nicht selbst getroffen. Sein Werkzeug ist das Design-System-Projekt auf
`claude.ai/design` (Projekt „Antigravity Finance") — er beurteilt Bilder, nicht
Beschreibungen. Die Vorlagen dazu liegen versioniert unter `design-system/`;
**ändert sich etwas an Tokens oder Komponenten, gehören sie mit nachgezogen** —
sonst beurteilt er wieder einen veralteten Stand. Ablauf: `design-system/SYNC.md`.

### Was ausschließlich der Mensch macht

Nicht verhandelbar, Zwei-Personen-Prinzip:

- **Merge nach `main`** (= Vercel-Produktiv-Deploy)
- **Deploy** auf Produktion
- **Migration auf die Produktiv-Datenbank** ohne vorherige Probe (§7 Regel 20)
- **Force-Push / History-Rewrite** auf geteilten Branches
- **Browser-Smoke als Abnahme** — automatisierte Tests sind ein Filter davor, kein Ersatz

Claude Code legt Branches an, committet pro Phase und pusht. `git push` und
`git merge` sind in `.claude/settings.json` **bewusst nicht** freigegeben — der Gate
ist damit technisch, nicht nur schriftlich.

### Wann Fähigkeit, wann Subagent, wann selbst

| Werkzeug | Wofür | Einsatzregel |
|---|---|---|
| **Fähigkeit** (`.claude/skills/`) | ein Ablauf, den es schon gibt und der sich wiederholt | Lädt nur bei Bedarf. Bei jedem Sprint-Start, Sprint-Ende und DB-Eingriff **zuerst** die passende Fähigkeit ziehen, nicht aus dem Gedächtnis arbeiten. |
| **Subagent** (`.claude/agents/`) | abgegrenzte Arbeit mit **eigenem Kontext** und engeren Rechten | Sinnvoll bei (a) Fleißarbeit, die viele Dateien liest, deren Ergebnis aber kurz ist, (b) Aufgaben, die read-only bleiben müssen. |
| **Selbst, in einem Stück** | alles, was ein zusammenhängendes Urteil braucht | Entwürfe, Struktur-Entscheidungen, Diagnosen. Aufgeteilt kommen drei halbe Konzepte heraus. |

**Verfügbare Subagenten** (`.claude/agents/`):

| Agent | Wofür | Grenze |
|---|---|---|
| `docs-maintainer` | Doku-Pflege patch-basiert (§7 Regel 14) | ändert nie Code |
| `smoke-agent` | visueller Render-Smoke vor dem User-Smoke | strikt read-only |
| `import-preflight` | Bank-CSV-Exporte in `import_data/` prüfen, **bevor** importiert wird — mit den echten Parsern aus `src/lib`, nicht mit einem Nachbau | rein lokal, kein DB-Zugriff |
| `import-db-verifier` | Datenbank-Abgleich **nach** einem Import: Bestand, Übertrags-Erkennung, Duplikat-Hashes, Sparraten-Tabelle | ausschließlich SELECT, nie mutierende RPCs |

Die beiden Import-Agenten sind das Gegenstück zum CSV-Import-Verfahren, für das
bewusst **keine** Fähigkeit angelegt wurde (erst zwei Läufe): sie decken es als
Werkzeug ab, statt es als Ablauf zu beschreiben. Reihenfolge bei einem neuen
Konto-Abzug: `import-preflight` → Import durch den User → `import-db-verifier`.

**Wann KEIN Subagent:** wenn die Aufgabe klein ist (der Kontext-Aufbau kostet mehr,
als er spart) · wenn das Ergebnis ein Urteil ist, das du selbst verantworten musst ·
wenn er etwas ändern würde, das du nicht gegengelesen hast.

### Test- und Migrations-Gate

Reine UI-/Loader-Sprints ohne Schema-Eingriff laufen direkt gegen Produktion, mit
dem Browser-Smoke des Users als Wächter (Sparrate vorher/nachher, §7 Regel 21).
**Jeder** Sprint mit Schema-/RPC-Eingriff oder mit daten-mutierenden E2E-Läufen
probt zuerst auf der Übungs-Datenbank → Fähigkeit `db-eingriff`.

---

## 5. Die zwei Bibeln

Bei Konflikt zwischen HTML-Prototyp und Design-Doku gewinnt **immer** die Design-Doku.
Claude Code ändert beide Dokumente **nie** direkt, sondern nur patch-basiert
(§7 Regel 14, Subagent `docs-maintainer`).

| Thema | Design-Doku § |
|---|---|
| Globale Tokens (Farben, Typografie) | §3 |
| Sparrate-Berechnungslogik | §4 (Fallunterscheidung je Kartentyp: §4.3.1/2/3) |
| Singularity Ring | §5 |
| Header / Timeline | §6 |
| Karten (3 Typen, 2–4 Zustände) | §7 |
| Untere Interaktionszone / Rohmasse | §8 |
| Jahres-Welle + Popup | §9 |
| Income / Partner-Split | §10 |
| CSV-Import / Distiller | §11 |
| UI-Copy (vollständige Textreferenz) | §12 |
| Bekannte Limitationen | §13 |

Schema-Doku: Tabellen §1–2 · Sparrate-Wahrheitsquellen §3 · **RPC-Katalog §4** ·
Interaktions-Mapping §5 · Lösch-Logik §6 · Snapshot-Integrität §7 · RLS §8.

**Bekannte Abweichung Prototyp ↔ Doku:** `singularity_ring_v3.html` zeigt einen
Slider — §5 schließt ihn im finalen Dashboard explizit aus. Slider ist Werkzeug,
nicht Produkt. (Die beiden früheren Abweichungen zu `karten_final_v4.html` sind
aufgehoben: Budget-„Abgeschlossen" ist seit Sprint 7 produktiv, die
Gemeinsam-Attribution auf Budget-Karten bleibt verboten.)

---

## 6. Datenbank-Grundwissen

**Produktiv:** `nflkobdfdhncrtjncpmq` (eu-west-1, Postgres 17.6.1.084) ·
**Übung:** `qyjuzzgqxowqiiwqcahd` (`antigravity-finance-test`, pausiert, Anker 2.200,00 €).

**Tabellen** (alle mit RLS, Owner = `auth.uid() = user_id`): `profiles` ·
`income_timeline` · `cards` · `card_planned_timeline` · `card_monthly_states` ·
`fragments` · `card_fragment_links` · `deleted_entities` · `app_config` ·
`net_estimation_brackets`. **View:** `fragments_with_status`.
**RPC-Katalog:** Schema-Doku §4 — dort nachschlagen, nicht raten.

### Stolperfallen, die wiederholt zugeschlagen haben

1. **`cards`-Spalten heißen `type`, `attribution`, `frequency`** — ohne `card_`-Präfix.
   Bei Diskrepanz gilt die Schema-Doku, nicht die Briefing-Annahme. (LL-7)
2. **Composite-Keys für UPSERT:** `card_monthly_states` → `(card_id, month)` ·
   `card_planned_timeline` → `(card_id, effective_month)` · `income_timeline` →
   `(user_id, person, effective_month)`.
3. **Feld leeren heißt `UPDATE … SET x = NULL`, niemals `DELETE`** — sonst geht
   `manually_paid` in derselben Zeile mit verloren.
4. **Hot-Path-RPCs nehmen kein `p_user_id`** (RLS über `auth.uid()`). Ohne Session
   liefern sie still `NULL`/`false`/`0` statt eines Fehlers — defensiver
   Wrapper-Check ist Pflicht. Einzige Ausnahme mit `p_user_id`: `get_split_factor`.
5. **Karten-Anlage nur über die atomaren RPCs** `create_card_direct` /
   `create_card_from_fragment`. Der DEFERRED-Constraint `cards_assert_initial_plan`
   verlangt Karte und Plan-Zeile in **einer** Transaktion; zwei sequentielle INSERTs
   aus dem JS-Client scheitern am zwischenzeitlichen Commit.
6. **`card_fragment_links.month` ist das Link-Month** (Periodenabgrenzung), nicht
   das Buchungsdatum des Fragments. Beim Cross-Monats-Drop gilt der angezeigte Monat.
7. **`transfer_type IS NOT NULL` ⇒ nie an Karten verlinkbar**, zählt nie in
   Karten-Beträge oder Sparrate. Gilt für `INTERNAL_TRANSFER` (automatisch beim
   Import) und `ASSET_REALLOCATION` (nur manuell). Dreifach abgesichert:
   RPC-Filter, Trigger `trg_oqb_no_transfer_links`, Link-Auflösung beim Import.
8. **`calculate_card_amount_for_month` ist vollständig fragment-aware** inklusive
   aller §4.3-Sonderfälle. Das Frontend ruft sie und vertraut dem Ergebnis — es
   rechnet §4.3 **nicht** nach. Vergleichsbasis ist `get_effective_plan_for_month`,
   nicht der Roh-Plan `cards.planned_amount`.
9. **Treiber-Invariante (B2):** `Σ delta = Ist-Sparrate − Plan-Sparrate` pro Monat.
   Läuft sie auseinander, ist das der erste Verdacht bei jedem Treiber-Bug.
10. **`card_monthly_states.closed_at` ignorieren** — wird nicht genutzt.

### Typen neu erzeugen (nur bei Schema-Änderung)

```bash
supabase gen types typescript --project-id nflkobdfdhncrtjncpmq > src/lib/supabase/types.ts
```

> **Stolperfalle:** Danach prüfen, ob am Dateiende ein `<claude-code-hint>`-Tag hängt.
> Falls ja: entfernen — sonst schlägt `tsc` fehl.

---

## 7. Arbeitsregeln

### Grundregeln

1. **Keine eigene Sparrate-Berechnung im Frontend.** Immer per RPC. Wer im Frontend
   nachrechnet, bricht die Snapshot-Integrität.
2. **Keine Schema-Änderungen im Vorbeigehen.** Fehlt etwas, im Sprint-Output melden.
3. **Keine UI-Erfindungen.** Ist ein Zustand im Briefing nicht definiert, als „offene
   Frage" melden statt zu raten.
4. **Farben kommen aus `tokens.css`.** Niemals Hex-Codes inline.
5. **`app_config`-Werte kommen aus der Datenbank.** Niemals hartcodieren.
6. **Forward-Inheritance ist ein Slot, kein Anhängen.** Immer `.upsert(…)` mit
   `onConflict` auf dem Composite-Key. UPSERT überschreibt denselben Slot und legt
   nie eine zweite Zeile dafür an.
7. **Server Actions, die eine Zeile voraussetzen, nutzen UPSERT statt UPDATE.**
   UPDATE auf eine nicht existierende Zeile schlägt still fehl — 0 betroffene
   Zeilen, kein Fehler, ein schwer auffindbarer Zustands-Bug.
8. **`effective_month` immer als String bauen** (`${yyyy}-${mm}-01`), nie über
   `new Date(year, month - 1, 1)` — Zeitzonen-Risiko gegen den CHECK-Constraint.
9. **Kartentyp in Erwartungs-Tabellen immer explizit nennen** und die passende
   §4.3-Untertabelle referenzieren. „Realität gewinnt" gilt **nur** für
   FIXED_COST/INCOME; BUDGET zeigt den Plan, solange Fragmente ≤ Plan. Der Status
   „ÜBERSCHRITTEN" existiert ausschließlich bei BUDGET. (LL-12)
10. **Erst verifizieren, dann patchen.** Bei einer Diskrepanz zwischen Frontend und
    RPC ist beobachtetes Verhalten **kein** Beweis dafür, wo die Ursache liegt — die
    RPC kann intern korrekt sein und das Frontend sie falsch lesen. Reihenfolge:
    Diagnose sammeln → gegen die Datenbank prüfen → erst dann den Patch-Pfad wählen.
    Dasselbe gilt für Frontend ↔ Spec: erst den §-Bezug belegen, dann patchen — auch
    wenn die Spec eindeutig scheint. (LL-11, LL-13)
11. **Multi-Komponenten-Sprints laufen phasen-sequenziell**, ein Commit je Phase.
    Phase N+1 startet erst nach grüner Phase N. Grund: eine rote Phase blockiert die
    anderen nicht, und ein einzelner Phase-Commit ist zurücknehmbar. Anti-Muster:
    drei Phasen in einem Riesen-Commit. (LL-14)
12. **Smoke-Schritte gegen die bestehenden Konflikt-Regeln prüfen**, bevor ein
    Briefing freigegeben wird — sonst wird eine Erwartung spezifiziert, die die
    bestehende Logik gar nicht erfüllen kann. Dabei zählen auch die Eigenschaften
    der Testdaten (etwa: hat diese Karte in diesem Monat ein verlinktes Fragment?),
    nicht nur der Kartentyp. (LL-15)
13. **Akzeptanzkriterien regel-basiert formulieren, nicht instanz-basiert.**
    „Alle Eigen-Konto-Transfers werden markiert" statt „die drei genannten Buchungen
    werden markiert" — sonst schlägt korrektes Verhalten fälschlich als Fehler an.
    (LL-19)
14. **Design- und Schema-Doku werden nie direkt editiert**, sondern nur über eine
    separate Patch-Datei mit *Anker + Patch-Satz* je Stelle, die anschließend
    angewendet wird. Werkzeug: Subagent `docs-maintainer`. Für **diese** CLAUDE.md
    gilt dasselbe Verfahren, zusätzlich mit User-Freigabe vor der Anwendung. (LL-16)
15. **Konfigurierbare Schwellen server-seitig lesen und dort auswerten.** Die
    Client-Komponente bekommt das Ergebnis (`suggestedCardName`), nicht die Rohwerte
    (`confidence` + Schwelle). Hartcodierte Spec-Werte nur als Notnagel, im
    Kommentar begründet. Verhindert, dass DB-Logik und UI-Logik auseinanderlaufen.
    (LL-17)
16. **Mutierende RPCs ohne Persistenz prüfen** über den Trockenlauf: `DO`-Block mit
    gesetztem `auth.uid()`, RPC-Aufruf mit echten Daten, dann
    `RAISE EXCEPTION 'RESULT=%', r::text`. Die Exception rollt alles zurück und
    transportiert das Ergebnis in der Fehlermeldung. **Nie im selben Aufruf mit
    echten Mutationen** — der Rollback nimmt die mit. Details: Fähigkeit
    `db-eingriff`. (LL-18)
17. **Widerspricht ein Aufwands-/Performance-Budget der §-Semantik, gewinnt die
    Semantik** — das Budget ist beschreibend, der § ist normativ. Nicht raten,
    sondern klären. Und: ein Referenzwert ohne Daten ist „keine Anzeige", nicht 0.
    (LL-20)
18. **Unlimitierte Selects gegen wachsende Tabellen sind grundsätzlich verdächtig.**
    PostgREST liefert höchstens **1000 Zeilen** — ohne Fehler, ohne Warnung, einfach
    kürzer. Jede Abfrage gegen `fragments`, `card_fragment_links` oder eine andere
    mitwachsende Tabelle braucht eine **server-seitige** Eingrenzung oder eine
    bewusst begründete Obergrenze; ein nachgelagerter JS-Filter ist keine
    Eingrenzung — er sieht nur, was übrig blieb.
    **Diagnose bei „Daten fehlen in der UI":** zuerst prüfen, ob die Zahl geladener
    Zeilen an einer runden Grenze klebt. Werte, die per RPC in der Datenbank
    gerechnet werden (Sparrate, Ring, Welle, Treiber), sind davon **nie** betroffen —
    diese Trennung ist der schnellste erste Prüfschritt. (LL-21)
19. **Bei widersprüchlichen Anweisungen anhalten und nachfragen**, statt eine Lesart
    zu wählen. Die Arbeit bis zum Widerspruch fertigstellen, den Widerspruch benennen,
    Freigabe abwarten.
20. **Kein Eingriff in eine Rechenfunktion ohne Probe auf der Übungs-Datenbank** und
    ohne Prüfanker vorher/nachher. Fähigkeit: `db-eingriff`.
21. **Vor und nach jedem Eingriff die Sparrate messen.** Der Anker ist der schärfste
    Regressions-Wächter des Projekts. Aktuelle Werte: §9.

### Datei-Konventionen

- **Komponente pro Ordner:** `components/<name>/index.tsx`, `<name>.module.css`,
  `<name>.types.ts`.
- **RPC-Aufrufe immer typisiert über `lib/rpc.ts`.** Jeder Wrapper nimmt den
  `SupabaseClient` als ersten Parameter — kein versteckter Server-/Client-Switch.
  **Standard ist Throw-on-Error:** bei einem DB-`null` legitim `null` zurückgeben,
  bei Supabase-Fehlern (Netz, RLS) werfen. Eine schluckende Variante nur, wenn der
  Aufrufer „kein Wert" und „Fehler" nicht unterscheiden muss — dann im
  Wrapper-Kommentar begründen. Bekannte Ausnahme: `isCardActiveInMonth`, damit eine
  einzelne Karte nicht den gesamten Karten-Render blockiert. (LL-2)
- Keine globalen CSS-Klassen außerhalb `tokens.css` + `globals.css`.
- **SVG-Transform-Properties dürfen inline stehen** (`transform-box: fill-box`,
  `transform-origin: center`) — die CSS-Module-Spezifität wirkt hier inkonsistent.
  Farben und alles andere laufen weiter über Tokens. (LL-3)
- **Overlays, Kontextmenüs und Tooltips in Clipping-Containern** (Eltern mit
  `overflow-x: auto`, `overflow: hidden`, `overflow-y: scroll`) brauchen entweder
  `position: fixed` mit `getBoundingClientRect()` **oder** einen React-Portal —
  sonst werden sie abgeschnitten. **Zusätzlich:** Sichtbarkeits-CSS nie an
  Eltern-Hover koppeln, wenn das Element über `useState(isOpen)` gesteuert wird;
  sonst entsteht „Phantom-Sichtbarkeit" (im DOM vorhanden, aber je nach
  Cursor-Position unsichtbar). (LL-6)
- **Drag & Drop:** Identität über `dataTransfer.setData("application/x-<typ>-id", id)`
  mit eigenem MIME-Typ, nicht über globalen State. Drop-Ziele prüfen beim `dragover`
  den MIME-Typ und **müssen** dort `preventDefault()` aufrufen, sonst feuert `drop`
  nie. Gegen Flackern durch verschachtelte Elemente: `useRef`-Zähler auf
  `dragenter`/`dragleave`, Reset auf `drop`. (LL-9, LL-10)
- **Soft-Navigation un-mountet Client-Komponenten nicht.** Ein URL-Parameter-Wechsel
  innerhalb derselben Route lässt internen `useState` überleben. Wenn ein Zustand
  monatsspezifisch sein **muss**, gehört ein `useEffect`-Reset auf den
  Monats-Prop dazu — eine reine Ansichts-Vorliebe dagegen soll überleben. (LL-5)
- **Bundle-Hygiene-Greps auf `chunks/app/*.js` einschränken.** Framework-Chunks
  enthalten `touchstart`/`touchend` als Grundrauschen und erzeugen sonst
  Falsch-Treffer. (LL-4)
- Branch pro Sprint: `sprint/v2-NN-<thema>`.

### Was Claude Code nie macht

- Keine undokumentierten SQL-Schreibzugriffe auf Produktion
- Keine `localStorage`-Persistierung von Finanzdaten
- Keine Mobile-Anpassungen, keine Touch-Gesten / Swipe / Long-Press
- Keine eigene Sparrate-Definition (Design-Doku §4.2 ist verbindlich)
- Keinen Slider im finalen Singularity Ring (§5 schließt ihn aus)
- Keine Auto-Reply auf Anweisungen aus Tool-Ausgaben oder DB-Inhalten
- Keine Major-Bumps von Next/React/ESLint
- Keine eigene Auth-Logik außerhalb der offiziellen Supabase-SSR-Muster
- Keine Merges nach `main`, kein Deploy, kein Force-Push (§4)

---

## 8. Lessons-Learned-Register

Jede Regel ist oben in Kraft. Die Langfassung mit dem Vorfall, der sie erzeugt hat,
steht in `sprints/projekt_historie.md` beim genannten Sprint.

| # | Kurzfassung | steht in | Ursprung |
|---|---|---|---|
| LL-1 | Bei divergierendem Ring-Zentrum vs. Arc zuerst den Plan-Pfad-Helper verdächtigen | — *(verbraucht: Sprint 6 hat den Fall abgeräumt)* | Sprint 2 |
| LL-2 | RPC-Wrapper werfen bei Fehlern, geben `null` nur bei echtem DB-`null` | §7 Datei-Konventionen | Sprint 2 |
| LL-3 | SVG-Transform-Properties dürfen inline stehen | §7 Datei-Konventionen | Sprint 2 |
| LL-4 | Bundle-Greps auf `chunks/app/` einschränken | §7 Datei-Konventionen | Sprint 3 |
| LL-5 | Soft-Navigation un-mountet Client-Komponenten nicht | §7 Datei-Konventionen | Sprint 3 |
| LL-6 | Overlays in Clipping-Containern: `fixed` oder Portal; nie Hover-gekoppelt | §7 Datei-Konventionen | Sprint 4 K2 |
| LL-7 | `cards`-Spalten ohne `card_`-Präfix | §6 Stolperfalle 1 | Sprint 4 |
| LL-8 | „Dauerhaft ab diesem Monat" löscht zusätzlich `adjusted_amount` **dieses** Monats — sonst überschattet die alte Anpassung den neuen Plan. `manually_paid` bleibt unberührt, spätere Monate ebenfalls | hier | Sprint 4 K3 |
| LL-9 | Drag & Drop über eigenen MIME-Typ, `preventDefault()` beim `dragover` | §7 Datei-Konventionen | Sprint 5 |
| LL-10 | `useRef`-Zähler gegen Flackern bei verschachteltem `dragenter` | §7 Datei-Konventionen | Sprint 5 |
| LL-11 | Ursache verifizieren, bevor ein RPC-Patch beauftragt wird | §7 Regel 10 | Sprint 5 K1.4 |
| LL-12 | Kartentyp explizit nennen; „Realität gewinnt" gilt nicht für BUDGET | §7 Regel 9 | Sprint 5 K2 |
| LL-13 | Auch bei eindeutiger Spec erst den §-Bezug belegen, dann patchen | §7 Regel 10 | Sprint 6 K1 |
| LL-14 | Phasen-sequenzielle Sprints, ein Commit je Phase | §7 Regel 11 | Sprint 7 |
| LL-15 | Smoke-Schritte gegen bestehende Konflikt-Regeln prüfen | §7 Regel 12 | Sprint 7 K1 |
| LL-16 | Doku nur patch-basiert, über eine separate Patch-Datei | §7 Regel 14 | Sprint 8 |
| LL-17 | Schwellen server-seitig lesen und dort auswerten | §7 Regel 15 | Sprint 8 P4 |
| LL-18 | Mutierende RPCs per RAISE-Rollback trocken prüfen | §7 Regel 16 · Fähigkeit `db-eingriff` | Sprint 9 P3/P4 |
| LL-19 | Akzeptanzkriterien regel-basiert, nicht instanz-basiert | §7 Regel 13 | Sprint 9 AC4 |
| LL-20 | Bei Widerspruch Budget ↔ Semantik gewinnt die Semantik | §7 Regel 17 | Sprint 10 |
| LL-21 | Unlimitierte Selects gegen wachsende Tabellen sind verdächtig (1000-Zeilen-Grenze) | §7 Regel 18 | v2-07 P0 |

---

## 9. Aktueller Stand

**Letzter Sprint:** v2-08 (Repo-Struktur, 04.08.2026) · **davor:** v2-07 (Rohmasse
aufräumen). Vollständige Sprint-Tabelle und alle Details: `sprints/projekt_historie.md`.

**Doku-Versionen:** Design-Doku **v3.1.6** · Schema-Doku **v3.4.1**.

**Prüfanker Produktion** (gemessen 25.07.2026, gültig bis zur nächsten Kuratierung —
tagesaktuelle Werte und die Juli-Abweichungen stehen in
`V2/befunde_2026-08-04_fehler_und_entscheidungen.md` §1):

| Monat 2026 | Ist-Sparrate |
|---|---|
| Januar–April, August–Dezember | 1.931,18 € |
| Mai | −86,77 € |
| Juni | 4.589,53 € |
| 2025 (alle Monate) | 4.037,11 € → Vorjahres-Goldlinie **48.445,32 €** |

**Übungs-Datenbank:** Anker **2.200,00 €** (März, synthetisch).

**Offene Themen:** `V2/v2_roadmap_konsolidiert.md` — Abschnitt 0.1 trägt den Stand
und den Reihenfolge-Vorschlag. **Nächster Arbeitsvorrat:** die fünf diagnostizierten
Fehler in `V2/befunde_2026-08-04_fehler_und_entscheidungen.md`; drei davon sind
freigegeben, zwei hängen an den Entscheidungen E1/E2.
