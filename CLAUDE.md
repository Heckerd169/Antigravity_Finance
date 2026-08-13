# CLAUDE.md — Antigravity Finance

> **Was diese Datei ist:** die Verfassung des Projekts — ausschließlich das, was
> **immer** gilt. Sie wird in jeder Sitzung vollständig geladen; alles, was hier steht,
> kostet also dauerhaft Platz. Historie, Verfahren und Spezifikation stehen deshalb
> woanders — die Landkarte dazu ist §3.
>
> **Pflege:** Der zentrale Arbeits-Agent aktualisiert diese Datei patch-basiert nach
> jedem Sprint (§7 Regel 14), aber **nur nach ausdrücklicher Freigabe** des Users.
>
> **Letzte Aktualisierung:** 13. August 2026 · **nach:** Sprint **v2-18**
> (zwei Befunde aus der Nutzung — Ziehen öffnet nur noch den bereits offenen Ordner,
> die Ansicht springt beim Monatswechsel nicht mehr; Design-Doku **v3.6.0**,
> Schema-Doku **v3.5.0**, PR **#26** offen).
>
> Diese Runde berührt **nur §9**, dafür an vier Stellen — alle nach ausdrücklicher
> Freigabe: **Der Juli-Anker steht jetzt auf −322,74 €** (`BF-4` hat zum ersten Mal in
> Produktion gegriffen, ohne Eingriff — allein durch die Zuordnung dreier Zahlungen am
> 13.08.) · **Sprint-Stand und Roadmap-Zahlen** auf v2-18 · und zwei Sätze, die der
> Freigabe sonst offen widersprochen hätten: **„nichts ist entschieden und ungebaut"
> war seit v2-17 falsch** (`KAT-5` / Record `A2`), und die Kopfzeile trug noch v2-17.
>
> **Der Prüfanker ist damit zum ersten Mal seit dem 05.08.2026 nicht mehr flächendeckend
> von diesem Datum** — elf Monate ja, der Juli nicht. Warum das kein Alarm ist und wann
> er sich erneut bewegen darf, steht bei der Tabelle in §9. Der **zweite** Anker, die
> Ordner-Spalte, geht weiterhin in allen zwölf Monaten exakt auf.
>
> Davor Sprint v2-17 (Kategorien im Karussell — `KAT-1` `KAT-2` `KAT-3` plus die
> Hausaufgabe `J1`; **Paket 4 damit vollständig**, der Riegel vor Paket 5 gefallen;
> **§6 Stolperfalle 4 war FALSCH** und ist korrigiert — wer über den Nutzer aggregiert,
> nimmt `p_user_id` · **neue Stolperfallen 13, 14 und 15** · **neuer Eintrag LL-25**).
> Davor v2-16 (`RM-2`, `PA-1`) und v2-15 (`LQ-1`-Anzeigeseite + `LQ-2`).
> Davor die Design-Direktor-Runde vom 06.08.2026 (`LQ-2` `LQ-1` `RM-2` `PA-1`
> entschieden, Design-Doku v3.3.0) und Sprint v2-14 (`LQ-1`, `cards.due_day`). Davor
> v2-13 (`BF-4` — der
> Split-Anteil wird genau einmal angewandt; **neue Stolperfalle 11**, **neue Regeln
> 23/24 mit LL-23/LL-24**). Damit ist **Paket 1 vollständig**: alle fünf Befunde vom
> 04.08. sind erledigt.
> Davor v2-11 (Juli-Anker auf
> −322,75 € nach der `BF-5`-Migration, **neue Regel 22 / LL-22**, §9-Lage nachgezogen).
> Davor v2-10 (Prüfanker auf den gemessenen Stand, LL-6
> um die Portal-Kehrseite ergänzt) und die Entscheidung E2.
> Davor v2-09 (Workflow-Vereinfachung
> — drei Sprint-Phasen statt sieben, Design-Direktor als Fähigkeit statt eigenem Chat,
> Roadmap nach Sprint-Paketen). Davor v2-08: 1.857 → 434 Zeilen, der Sprint-Log liegt
> seither in `sprints/projekt_historie.md`.

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

**Das Projekt-Gedächtnis ist eine Abkürzung, kein Lager.** Es liegt außerhalb des
Repos (`~/.claude/projects/…/memory/`), ist also **nicht in git, nicht gesichert und
bei einem frischen Klon nicht dabei**. Es darf sagen, wo wir gerade stehen — aber
**nichts Dauerhaftes darf ausschließlich dort liegen.** Was gelten soll, gehört in
eine Datei im Repo; das Gedächtnis verweist dann höchstens darauf.

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

**Der Design-Direktor ist seit 04.08.2026 eine Rolle, kein eigener Chat mehr** —
Fähigkeit `design-direktor`. Der Dialog läuft direkt mit dem User; ein Subagent wäre
hier falsch, weil jede Rückmeldung über eine Übersetzung liefe und Gestaltung genau
in der Nuance lebt. Drei Vorkehrungen ersetzen den weggefallenen frischen Blick:
Der Rollenwechsel wird ausgesprochen (**Aufwand ist dort kein Argument**), die
Entscheidung fällt **vor** dem Bauen, und sie wird als Record unter `V2/`
festgeschrieben statt nur besprochen.

Sein Anschauungsmaterial sind die Seiten unter `design-system/` und das gleichnamige
Projekt auf `claude.ai/design` — er beurteilt Bilder, nicht Beschreibungen.
**Ändert sich etwas an Tokens oder Komponenten, gehören die Seiten mit nachgezogen**,
sonst zeigen sie beim nächsten Mal einen überholten Stand. Ablauf:
`design-system/SYNC.md`.

### Wie ein Sprint läuft

Drei Phasen. Die Berührungspunkte des Users sind fett.

| Phase | Was passiert | Werkzeug |
|---|---|---|
| **① Klären** | Nachbohren bis Ziel, Nicht-Ziel und Prüfanker stehen · Umfang aus der Roadmap schneiden · Gestaltungsfragen klären · **Plan zur Freigabe** | `sprint-start`, bei Bedarf `design-direktor` |
| **② Bauen** | Phasen mit je einem Commit, Prüfstrecke läuft mit | `db-eingriff`, sobald die Datenbank berührt wird |
| **③ Abnehmen** | Optische Prüfung → **Browser-Test des Users** → Review, Roadmap, Doku, Push → **Merge-Freigabe** | `smoke-agent`, dann `sprint-abschluss` |

### Wie im Chat erklärt wird

Empfehlungen, Entscheidungsfragen und Statusberichte in **einfacher, nicht-technischer
Sprache**. App-Begriffe sind in Ordnung — Karte, Fragment, Rohmasse, Sparrate, Welle
kennt der User. Begriffe aus Datenbank- und Infrastruktur-Welt nicht: entweder
vermeiden oder in einem Halbsatz übersetzen („eine Übungs-Kopie der Datenbank" statt
„Free-Tier-Test-Projekt"). Die Papiere unter `V2/` und `sprints/` dürfen technisch
bleiben — die Zusammenfassung im Chat nicht.

### Was ausschließlich der Mensch macht

Nicht verhandelbar, Zwei-Personen-Prinzip:

- **Merge nach `main`** (= Vercel-Produktiv-Deploy)
- **Deploy** auf Produktion
- **Migration auf die Produktiv-Datenbank** ohne vorherige Probe (§7 Regel 20)
- **Force-Push / History-Rewrite** auf geteilten Branches
- **Browser-Smoke als Abnahme** — automatisierte Tests sind ein Filter davor, kein Ersatz

Claude Code legt Branches an, committet pro Phase, **pusht und legt den Pull Request
an**. Damit ist alles bis zum merge-fertigen PR vorbereitet; nur der Merge selbst bleibt
beim Menschen.

Seit dem 05.08.2026 sind `git push` und `gh pr create` in `.claude/settings.json`
**freigegeben** — die Reibung dort war echt und ohne Sicherheitsgewinn. Gesperrt bleiben
`git merge` und `gh pr merge`, ebenso Force-Push und ein Push direkt auf `main`. Der
Gate ist damit weiterhin technisch, aber er sitzt jetzt an der richtigen Stelle.

> **Zur Freigabe vom 05.08.2026:** Der User hat ausdrücklich erlaubt, dass Claude Code
> den Merge künftig selbst ausführt, sofern er vorher zustimmt. **Wirksam wird das
> nicht** — das Merge-Verbot ist Teil der Betriebsanweisung von Claude Code und liegt
> außerhalb dieses Repos; keine Datei hier kann es aufheben. Diese Zeile hält die
> Absicht fest, damit sie nicht als übersehen gilt. Der bequemste heute gangbare Weg:
> Claude Code legt den PR an, der User klickt einmal „Merge" — oder aktiviert
> Auto-Merge auf GitHub, dann führt GitHub den Merge aus.

### Wann Fähigkeit, wann Subagent, wann selbst

| Werkzeug | Wofür | Einsatzregel |
|---|---|---|
| **Fähigkeit** (`.claude/skills/`) | ein Ablauf, den es schon gibt und der sich wiederholt — **oder eine Rolle, mit der der User sprechen können muss** | Lädt nur bei Bedarf. Bei Sprint-Start, Sprint-Ende, DB-Eingriff und Gestaltungsfragen **zuerst** die passende Fähigkeit ziehen, nicht aus dem Gedächtnis arbeiten. |
| **Subagent** (`.claude/agents/`) | abgegrenzte Arbeit mit **eigenem Kontext** und engeren Rechten | Sinnvoll bei (a) Fleißarbeit, die viele Dateien liest, deren Ergebnis aber kurz ist, (b) Aufgaben, die nachweislich read-only bleiben müssen. |
| **Selbst, in einem Stück** | alles, was ein zusammenhängendes Urteil braucht | Entwürfe, Struktur-Entscheidungen, Diagnosen. Aufgeteilt kommen drei halbe Konzepte heraus. |

> **Der schnellste Test: Muss ich mit dem Ding reden können?**
> Wenn ja, ist es **nie** ein Subagent — der liefert einen Bericht, jede Rückfrage
> liefe über eine Übersetzung. Genau daran ist der erste Entwurf des
> Design-Direktors gescheitert.

**Verfügbare Fähigkeiten** (`.claude/skills/`):

| Fähigkeit | Wann |
|---|---|
| `sprint-start` | Beginn jedes Sprints — nachbohren, schneiden, Plan vorlegen |
| `design-direktor` | Gestaltungsfragen, **bevor** gebaut wird |
| `db-eingriff` | jede Berührung der Datenbank |
| `sprint-abschluss` | sobald der Code steht |

**Zusätzlich global installiert** (fremd, liegt in `~/.agents/skills/`, **nicht im
Repo** — auf einem frischen Klon also nicht vorhanden): `diagnosing-bugs` ·
`prototype` · `vercel-react-best-practices` · `find-skills`. Hilfsmittel, keine
Voraussetzung; ausgewählt am 04.08.2026 aus 51 gesichteten Fähigkeiten.

> **`diagnosing-bugs` und §7 Regel 18 (LL-21) zusammen lesen.** Die Fähigkeit
> verlangt, **zuerst** eine enge Prüfschleife zu bauen und **vorher keine These** zu
> bilden. LL-21 nennt dagegen einen 30-Sekunden-Vorabtest für eine bekannte
> Symptomklasse („Daten fehlen in der UI" → klebt die Zeilenzahl an einer runden
> Grenze? Wird der Wert per RPC gerechnet?). Das ist kein Widerspruch: LL-21 ist eine
> **Beobachtung**, keine These. Reihenfolge: erst LL-21 abhaken, und wenn es nicht
> greift, in die volle Schleifen-Disziplin fallen.
>
> Der Trockenlauf aus `db-eingriff` **ist** bereits eine solche Prüfschleife —
> deterministisch, schnell, unbeaufsichtigt lauffähig.

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

**`.env.local` und `.env.e2e.local` haben ihre dauerhafte Heimat im Haupt-Checkout und
werden in jeden neuen Worktree kopiert.** Beide sind gitignored; liegen sie *nur* im
Worktree, verschwinden sie mit dessen Aufräumen — genau das ist zwischen v2-10 und
v2-15 passiert.

**Kopieren ist Pflicht, nicht Kür:** `playwright.config.ts` liest `.env.e2e.local` aus
seinem **eigenen** Verzeichnis (`__dirname`), und Next.js liest `.env.local` ebenso aus
dem Projekt-Wurzelverzeichnis. Im Haupt-Checkout allein wirken sie also nicht — dort
überleben sie nur. Fehlt `.env.e2e.local` im Arbeitsverzeichnis, schließt die
Konfiguration das `render-smoke`-Projekt aus der Projektliste aus: Der **angemeldete**
Render-Smoke entfällt dann ersatzlos, und der `smoke-agent` kann die Oberfläche nicht
mehr beurteilen — er kommt nicht am Login vorbei. Fehlt `.env.local`, bricht
zusätzlich `pnpm build` beim Prerender von `/onboarding` ab.

Beleg, dass es früher lief: `sprints/sprint_v2-10_review.md` §2 weist `pnpm test:e2e`
**10/10** aus, darunter `render-smoke` 4.

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
4. **Wer über den Nutzer aggregiert, nimmt `p_user_id`. Wer eine einzelne Karte
   auflöst, nicht.** Das ist die Regel — und sie stand hier bis zum 08.08.2026
   **falsch herum** („Hot-Path-RPCs nehmen kein `p_user_id`, einzige Ausnahme
   `get_split_factor`"). Gemessen gegen `pg_proc`:

   | Mit `p_user_id` | Ohne |
   |---|---|
   | `calculate_sparrate_for_month` | `calculate_card_amount_for_month` |
   | `calculate_planned_sparrate_for_month` | `is_card_active_in_month` |
   | `get_split_factor` | `get_planned_amount_for_month` |
   | `get_net_monthly_for_month` | `get_effective_plan_for_month` |
   | `get_category_amounts_for_month` (v2-17) | |

   `get_year_deviation_drivers` ist die Ausnahme in der anderen Richtung: Sie
   aggregiert über den Nutzer, nimmt aber **kein** `p_user_id`, sondern liest
   `auth.uid()` selbst — und **wirft `28000` ohne Session**. Ein Aufruf über MCP
   scheitert deshalb, wenn nicht vorher `request.jwt.claims` gesetzt ist.

   **Wo die alte Fassung stimmt und weiter gilt:** RPCs, die `auth.uid()` lesen,
   liefern ohne Session still `NULL`/`false`/`0` statt eines Fehlers — ein
   defensiver Wrapper-Check bleibt Pflicht.

   *Gefunden in der Gestaltungsrunde vom 07./08.08.2026 (Nebenbefund ⑤), in v2-17
   unabhängig bestätigt. Wer nach der alten Fassung arbeitete, baute den Aufruf
   falsch.*
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
11. **Der Split-Anteil wird genau EINMAL angewandt** — in
    `calculate_card_amount_for_month`, und dort **nur auf Plan/Anpassung**.
    Fragment-Summen sind bereits der überwiesene Anteil und bleiben unangetastet.
    Wer einen neuen Aufrufer baut, darf den Anteil **nicht erneut** anwenden.
    Einzige Ausnahme: `calculate_planned_sparrate_for_month` rechnet auf dem
    Roh-Plan und wendet ihn deshalb weiterhin selbst an. (v2-13, LL-23)
12. **Ein Beleg, der nur im Migrations-Kommentar steht, ist zur Laufzeit nicht
    vorhanden.** Die Herleitung der 17 Fälligkeitstage („19 Monate, immer am 1. bis
    4.") ist sorgfältig dokumentiert — aber ausschließlich als SQL-Kommentar in
    `20260806_v2_14_lq1_faelligkeitstag.sql`. Ein UI-Vorschlag, der sie anzeigen
    wollte, war deshalb nicht baubar, ohne entweder die gesamte Historie je Karte zu
    lesen (LL-21) oder eine Spalte anzulegen. **Wer eine Herleitung später zeigen
    will, muss sie speichern, nicht kommentieren.** (v2-15)
13. **Eine Aggregation über Teilmengen kann die Schlussrundung der Sparrate nicht
    nachbilden.** `calculate_sparrate_for_month` rundet **einmal ganz am Ende über
    alles**. Wer dieselbe Kartenmenge in Gruppen zerlegt und jede Gruppe rundet,
    landet daneben — gemessen **0,01 € in allen zwölf Monaten** 2026, unabhängig
    davon, wie sorgfältig innerhalb einer Gruppe gerechnet wird.
    **„Ungerundet summieren, erst am Ende runden" ist notwendig, aber NICHT
    hinreichend** — es behebt die Rundung *innerhalb* einer Gruppe; der Cent geht
    *zwischen* den Gruppen verloren.
    **Regel:** Ziel aus der Rechenfunktion **holen**, nicht herleiten, und den
    Rest auf die betragsgrößte Gruppe verteilen. Prüfung in einem Aufruf:
    `Σ Gruppen == calculate_sparrate_for_month(...)`, in allen zwölf Monaten.
    (v2-17, LL-25)
14. **Eine Kategorie ist keine Karte.** `card_categories` steht neben `cards`, hat
    **keine** Betrags-Spalte, und `cards.category_id` ist nullable mit
    `ON DELETE SET NULL`. Wer eine Kategorie als `cards`-Zeile anlegt, bricht den
    Prüfanker sofort: Beide Sparrate-RPCs, `get_year_deviation_drivers` und der
    Auto-Absorptions-Loop in `process_csv_import` laufen **ohne Typ-Filter** über
    alle Karten des Monats (Befund D1). `category_id IS NULL` ist ein **regulärer**
    Zustand („Ohne Kategorie"), kein Fehler — beide Anlage-RPCs kennen keine
    Kategorie und liefern laufend kategorielose Karten nach (D12). (v2-17)
15. **Eine neue Tabelle bekommt RLS automatisch, aber KEINE Policy.** Der
    Event-Trigger `rls_auto_enable` führt nur `enable row level security` aus und
    schluckt sein eigenes Scheitern (`EXCEPTION WHEN OTHERS THEN RAISE LOG`).
    PostgREST liefert dann ein **stilles `[]`** beim SELECT und `42501` beim INSERT —
    beim Testen liest sich das wie „noch keine Daten angelegt". `ENABLE` **und**
    Policy gehören von Hand in die Migration. (v2-17, Befund D8)

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
22. **Eine Doku-Zusage über Rechenverhalten ist keine Prüfung.** Wo ein Papier
    beschreibt, *was* eine Rechenfunktion tut, gehört die Aussage **gegen die
    Funktion belegt** — nicht aus ihrem Zweck erschlossen. Und eine
    Aufwands-Entscheidung, die auf einer solchen ungeprüften Zusage aufbaut, ist
    genauso ungeprüft. (LL-22)
23. **Wandert ein Faktor aus einer Aggregation in eine Basis-Funktion, ist jede
    Formel zu prüfen, die beide Seiten einer Differenz benutzt.** Aus
    `f × (a − b)` wird dann `(a − b × f)` — die Klammer ist **gemischt**, ein
    Faktor außen würde die bereits umgerechnete Seite ein zweites Mal kürzen.
    Das fällt nicht auf, weil keine Zahl offensichtlich falsch *aussieht*.
    Wächter ist die B2-Invariante (§6 Stolperfalle 9), und sie ist in **allen
    zwölf** Monaten zu prüfen, nicht stichprobenartig. (LL-23)
24. **Runden ist eine Entscheidung mit Anker-Wirkung.** Eine Zwischengröße je
    Karte zu runden, während die Vergleichsfunktion erst die Endsumme rundet,
    bewegt die Sparrate um Cent-Beträge — und damit den schärfsten
    Regressions-Wächter des Projekts. Vor jedem neuen `round()` prüfen, ob die
    **Gegenseite genauso rundet**. Im Zweifel nicht runden: die Aufrufer runden
    ohnehin am Ende. (LL-24)

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
  Cursor-Position unsichtbar).
  **Ein zweiter Auslöser (v2-10):** Nicht nur Clipping bricht ein Overlay. Auch ein
  `transform` auf einem reinen **Layout**-Element — etwa das vertikale Zentrieren der
  Income-Labels — macht dieses zum Bezugsrahmen für **jeden**
  `position: fixed`-Nachfahren. `inset: 0` meint dann nicht mehr das Fenster, sondern
  dieses Element. Am Overlay selbst ist dabei nichts falsch, was die Suche in die
  Irre führt.
  **Und die Kehrseite, die genauso teuer ist:** Ein Portal repariert den
  **Layout**-Bezug und zerreißt im selben Zug **jede Logik, die sich auf DOM-Nähe
  verlässt** — `closest()`, `contains()`, CSS-Nachfahren-Selektoren, Eltern-Hover.
  Das **Event-Bubbling läuft unverändert weiter**, weil Portale React-Kinder bleiben.
  Wer portiert, prüft deshalb: Verlässt sich irgendein Vorfahre auf Nähe im Dokument?
  In v2-10 war das ein `closest("[data-wave-block]")`-Wächter in `welle/index.tsx` —
  danach riss jeder Klick im Einkommens-Popup zusätzlich die Jahres-Welle auf, und die
  **komplette Prüfstrecke blieb dabei grün**. Gefunden hat es erst der optische Smoke.
  (LL-6)
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
| LL-6 | Overlays: `fixed` oder Portal; nie Hover-gekoppelt. **Auch `transform` auf einem Layout-Eltern bricht `fixed`** — und ein Portal repariert den Layout-Bezug, zerreißt aber den DOM-Bezug (`closest()`), während Event-Bubbling bleibt | §7 Datei-Konventionen | Sprint 4 K2 · erweitert v2-10 |
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
| LL-22 | Eine Doku-Zusage über Rechenverhalten ist keine Prüfung — gegen die Funktion belegen, nicht aus dem Zweck erschließen | §7 Regel 22 | v2-11 (BF-5) |
| LL-23 | Wandert ein Faktor in eine Basis-Funktion, wird aus `f × (a − b)` ein `(a − b × f)` — gemischte Klammer, B2 in allen zwölf Monaten prüfen | §7 Regel 23 · §6 Stolperfalle 11 | v2-13 (BF-4) |
| LL-24 | Runden ist eine Entscheidung mit Anker-Wirkung — prüfen, ob die Gegenseite genauso rundet | §7 Regel 24 | v2-13 (BF-4) |
| LL-25 | Eine Aggregation über Teilmengen bildet die Schlussrundung nicht nach — Ziel aus der Rechenfunktion holen, Rest verteilen | §6 Stolperfalle 13 | v2-17 (KAT-3) |

> **Warum LL-25 neben LL-24 steht und nicht darin aufgeht.** LL-24 warnt, dass die
> Gegenseite **anders** rundet. Bei LL-25 rundet sie **seltener** — einmal am Ende
> statt einmal je Gruppe. Das ist eine andere Fehlerklasse, und sie ist teurer: Sie
> war in einem Beschluss-Record bereits **falsch analysiert** worden („die Ursache
> sitzt in Wohnen"), ohne dass es jemandem auffiel, und die dort verordnete Abhilfe
> hätte den Fehler nicht behoben. Wer LL-24 kennt und LL-25 nicht, hält die Sache
> für erledigt, sobald er innerhalb der Gruppe sauber rechnet.

---

## 9. Aktueller Stand

**Letzter Sprint:** v2-18 (zwei Befunde aus der Nutzung — Ziehen öffnet nur noch den
bereits offenen Ordner, die Ansicht springt beim Monatswechsel nicht mehr, 13.08.2026,
PR **#26** offen) · **davor:** v2-17 (Kategorien im Karussell, `KAT-1` `KAT-2` `KAT-3`
plus die Hausaufgabe `J1`) und v2-16 (`RM-2`, `PA-1`).
Vollständige Sprint-Tabelle und alle Details: `sprints/projekt_historie.md`.

**v2-18 hat eine Produkt-Entscheidung aufgehoben, nicht nur nachgezogen.** Record `B4`
(„beim Anfassen einer Zahlung öffnen sich **alle** Ordner") war beim Bauen plausibel
und löste den Blocker `U1`; in der Praxis schiebt es die Zielkarte aus dem Bild,
während die Maustaste gedrückt ist und das Karussell deshalb nicht gescrollt werden
kann. `U1` ist jetzt anders gelöst — durch bewusstes Aufklappen **vor** dem Zug.
Design-Doku **§8**, Record Teil B.

**Paket 4 ist vollständig abgeschlossen.** Das Karussell zeigt im Juli **elf Ordner
statt 32 Karten**. Damit sind **vier der fünf Kettenglieder fertig** (Pakete 1, 2, 4
plus das danebenstehende 3), und der Riegel vor **Paket 5** — der besseren
automatischen Zuordnung, dem einzigen Punkt der Roadmap, der Aufwand **wegnimmt** — ist
gefallen. Record: `V2/design_direktor_2026-08-07_kategorien.md` (Teil A/B/C).

**Ein Beschluss ist entschieden und ungebaut:** `KAT-5` / Record `A2`. Bis zum
13.08.2026 stand hier „nichts ist entschieden und ungebaut" — das war **falsch**, seit
v2-17. Alle übrigen Beschlüsse der Runden vom 06.08. und 07./08.08.2026 sind umgesetzt.

**Doku-Versionen:** Design-Doku **v3.6.0** · Schema-Doku **v3.5.0**.

**Zweiter Prüfanker seit v2-17 — die Ordner-Spalte.** Sie ergibt in **allen zwölf
Monaten exakt** die Sparrate, und das ist erzwungen, nicht zufällig (Stolperfalle 13 /
LL-25). Sie schlägt an, sobald jemand an der Rundung dreht, und ist in einem Aufruf
messbar:

```sql
SELECT sum((e->>'amount')::numeric)
  FROM jsonb_array_elements(get_category_amounts_for_month('<user_id>', '<monat>')) e;
-- muss exakt calculate_sparrate_for_month('<user_id>', '<monat>') ergeben
```

**Prüfanker Produktion** (gemessen **05.08.2026** gegen `nflkobdfdhncrtjncpmq`,
`calculate_sparrate_for_month`, nur `SELECT`; in v2-13 vor **und** nach der
`BF-4`-Migration bestätigt; in v2-15 vor **und** nach dem Sprint erneut gemessen —
`calculate_sparrate_for_month` **und** `calculate_planned_sparrate_for_month`, alle
zwölf Monate, Ist **und** Plan, Abweichung überall 0,00 €, erwartet, weil keine
Rechenfunktion berührt wurde):

| Monat 2026 | Ist-Sparrate |
|---|---|
| Januar–April | 1.931,18 € |
| Mai | −86,77 € |
| Juni | 4.208,76 € |
| **Juli** | **−322,74 €** *(seit 13.08.2026, siehe unten)* |
| August | 1.761,08 € |
| September–Dezember | 1.824,08 € |
| 2025 (alle Monate) | 4.037,11 € → Vorjahres-Goldlinie **48.445,32 €** |

> **Warum die alte, flache Tabelle weg ist.** Bis zum 25.07.2026 stand hier 2026
> durchgehend 1.931,18 €. Mit der Juli-Kuratierung ist das überholt — die Werte oben
> decken sich exakt mit `V2/befunde_2026-08-04_fehler_und_entscheidungen.md` §1. Eine
> Anker-Tabelle mit falschen Sollwerten ist schlimmer als keine: Sie schlägt entweder
> falsch an oder wird gewohnheitsmäßig ignoriert.
>
> **Der Juli-Wert stammt aus v2-11.** `BF-5` (Fragmente wurden ohne Vorzeichen
> addiert) ist am 05.08.2026 behoben: Juli-Ist **−1.222,75 → −322,75 €**, exakt die
> vorab festgelegten +900,00 €, alle übrigen elf Monate um 0,00 € bewegt.
>
> **v2-13 (`BF-4`) hat die Tabelle NICHT bewegt** — und das war die Erwartung. Der
> Eingriff verlagert die Split-Anwendung, wirkt aber erst, sobald eine gemeinsame
> Karte ein verknüpftes Fragment hat; heute hat das keine. Alle zwölf Monate wurden
> vorher und nachher gemessen, Ist **und** Plan, Abweichung überall 0,00 €; die
> B2-Invariante hielt in allen zwölf Monaten mit identischen Summen.
> **Ein grüner Anker beweist in so einem Fall wenig** — der Nachweis kam aus der
> Übungs-Datenbank (Ist-Sparrate dort 1.840,00 → 1.600,00 €).
>
> **v2-17 (Kategorien) hat die Tabelle ebenfalls NICHT bewegt.** Alle zwölf Monate
> vor und nach beiden Migrationen gemessen, Abweichung überall 0,00 €, B2-Invariante
> 12/12. Zusätzlich belegt über **byte-identische Prüfsummen**
> (`md5(pg_get_functiondef(...))`) der vier Rechenfunktionen gegen Übungs- **und**
> Produktiv-Datenbank — der Sprint hat sie nachweislich nicht angefasst.
>
> ---
>
> **Was hier als Nächstes erwartet wurde, ist am 13.08.2026 eingetreten** — und zwar
> **ohne jeden Eingriff.** Der Satz an dieser Stelle lautete: „der erste Monat, in dem
> eine gemeinsame Karte eine zugeordnete Zahlung bekommt — dann greift `BF-4`, bewusst
> und richtig." Genau das ist passiert. Um 06:05 wurden drei echte Zahlungen den
> gemeinsamen Juli-Karten zugeordnet: Miete 1.089,26 €, Strom 36,04 €, Internet
> 22,87 €. Vorher rechnete die Karte `Plan × Anteil` = 1.904 × 0,57209… =
> **1.089,25968…**; jetzt nimmt sie die **echte Überweisung**, glatt auf zwei Stellen.
> Die Nachkommastellen, die den Juli auf −322,745**69** und damit knapp über die
> Rundungsgrenze hoben, sind weg — **Juli-Ist −322,75 → −322,74 €**.
>
> **Damit hat `BF-4` aus v2-13 zum ersten Mal in Produktion gegriffen.** Keine
> Migration, kein Sprint, keine Codeänderung: allein die Zuordnung einer Zahlung durch
> den Nutzer. Die übrigen elf Monate stehen unverändert, und die Ordner-Spalte ergibt
> weiterhin in **allen zwölf** Monaten exakt die Sparrate.
>
> **Der Rest steht noch aus.** Rechtsschutz ist die vierte gemeinsame Karte und noch
> **nicht** zugeordnet — sobald sie es ist, kann der Juli erneut um einen Cent wandern.
> Ein Cent Abweichung **im Juli** ist deshalb kein Alarm, solange er sich über eine
> neue Zuordnung erklären lässt; **jede andere Zeile** der Tabelle ist es sehr wohl.

**Übungs-Datenbank:** Anker **2.200,00 €** (März, synthetisch).

**Offene Themen:** `V2/v2_roadmap_konsolidiert.md` — nach **Sprint-Paketen** geordnet;
§0 trägt die Zahlen, §5 löst die alten Buchstaben-Kennungen auf. Stand dort
**13.08.2026, nach v2-18**: **10 offene Pakete · 29 Themen · 4 Hausaufgaben ·
33 offen gesamt · 43 erledigt**. Die Zahlen sind zeilengenau ausgezählt, nicht
geschätzt — das ist dort schon zweimal schiefgegangen.

> **Die offenen Themen sind gestiegen, obwohl ein Sprint gelaufen ist — 28 → 29.**
> Das ist Ehrlichkeit, kein Rückschritt: `KAT-5` (Record `A2` — eine Zahlung auf die
> Ordner-Kachel ziehen öffnet das Anlege-Fenster mit vorgewählter Kategorie) wurde in
> v2-17 **entschieden, aber nie gebaut** und im dortigen Review **nicht als offen
> benannt**. Der Punkt existierte die ganze Zeit, nur unsichtbar. Er steht jetzt in
> Paket 7 und ist durch v2-18 relevanter geworden, weil ein zugeklappter Ordner nun
> gar kein Ziel mehr ist.

**Paket 1 ist vollständig abgeschlossen.** Alle fünf Befunde vom 04.08.2026 sind
erledigt — `BF-3` und `BF-1` (v2-10), `BF-5` (v2-11), `BF-2` (v2-12), `BF-4` (v2-13).
Damit blockiert **keine Entscheidung mehr Arbeit**: E1, E2 und E3 sind gefallen.

**Die Pakete 2, 3 und 4 sind ebenfalls vollständig abgeschlossen.** `RM-1`/`RM-2`
(v2-10/v2-16), `LQ-1`/`LQ-2` (v2-14/v2-15) und `KAT-1`/`KAT-2`/`KAT-3` (v2-17).
`LQ-3` und `RM-3` gehörten nie dazu — beide liegen in Paket 9, `KAT-4` in Paket 10.

**Als Nächstes dran: Paket 5** (bessere automatische Zuordnung). Es ist der einzige
Punkt der Roadmap, der Aufwand **wegnimmt**, und die Kategorien-Runde hat nebenbei
belegt, wie dringend es ist: Von **76 gemeinsamen Monatszahlungen sind zwei
zugeordnet**, bei 19 Monaten identischem Text, Betrag und Tag. Ursache ist die
Split-Systematik — „Miete" plant 1.904 € (Haushalt), überwiesen werden 1.089,26 €
(der Anteil), und `calculate_match_confidence` gewichtet `amount_match` mit 0,30;
43 % Abweichung reichen nie für die 95-%-Schwelle.

**Weiterhin offen, für eine eigene Gestaltungsrunde:** `M2` (Verben und Gesten des
Karten-Lebenszyklus) und `M5` (Reihenfolge). **`M5` hat seit v2-17 einen Ort** —
`card_categories.sort_order` ist änderbar, ohne dass eine Migration nötig wird.

**Der Escape-Handler-Rückstand aus `sprints/sprint_v2-10_offene_fragen.md` §6 ist
geschlossen.** Das Einkommens-Popup hat seit v2-16 einen (`income-split/index.tsx`);
in v2-17 nachgeprüft, weil dieser Sprint dasselbe Popup an einer **zweiten** Stelle
öffnet (Netto-Kachel im Einkommens-Ordner). Alle Overlays haben jetzt einen.
