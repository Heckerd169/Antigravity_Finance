# CLAUDE.md — Antigravity Finance

> **Was diese Datei ist:** die Verfassung des Projekts — ausschließlich das, was
> **immer** gilt. Sie wird in jeder Sitzung vollständig geladen; alles, was hier steht,
> kostet also dauerhaft Platz. Historie, Verfahren und Spezifikation stehen deshalb
> woanders — die Landkarte dazu ist §3.
>
> **Pflege:** Der zentrale Arbeits-Agent aktualisiert diese Datei patch-basiert nach
> jedem Sprint (§7 Regel 14), aber **nur nach ausdrücklicher Freigabe** des Users.
>
> **Letzte Aktualisierung:** 25. August 2026 · **nach:** Sprint **v2-29**
> („Die App merkt sich, was du entschieden hast" — `ZO-5`).
> **Alles bis einschließlich v2-29 ist in `main`** — PR #46 gemergt, Browser-Smoke
> bestanden, gegen den Baum geprüft (`git ls-tree origin/main`), nicht gegen den
> PR-Status.
>
> ### ⚠️ Am 25.08.2026 hat diese Datei ihre eigene Regel gebrochen — und wurde gekürzt
>
> Sie stand bei **1.712 Zeilen**. Der Kasten direkt darüber sagt seit v2-08, hier stehe
> „ausschließlich das, was **immer** gilt", und Historie gehöre woanders hin. Der
> Vorspann erzählte trotzdem **19 Sprints** nach, §9 noch einmal **20** — dieselbe
> Historie, die vollständig in `sprints/projekt_historie.md` steht.
>
> **v2-08 hatte die Datei von 1.857 auf 434 Zeilen gebracht.** Sie war also fast wieder
> dort, wo sie vor jener Kürzung stand. Jede einzelne Ergänzung war für sich begründet;
> in der Summe hatten sie die Kosten **jeder** Sitzung verdoppelt. **Das ist die
> Eigenschaft dieser Fehlerklasse: Sie entsteht ausschließlich aus richtigen
> Entscheidungen** — und keine davon fällt beim Treffen als falsch auf.
>
> **Raus sind die Sprint-Nacherzählungen** in Vorspann und §9.
> **Vollständig geblieben sind §6 Stolperfallen, §7 Arbeitsregeln und §8
> Lessons-Learned-Register** — die Regeln und die Vorfälle, an denen sie haften. Genau
> daran haften sie; eine Regel ohne ihren Vorfall wird zur Checkliste und nicht gelesen.
>
> **Die Regel, die daraus folgt, gilt ab sofort für jede Ergänzung hier:** Zuerst
> fragen, ob das Neue *immer* gilt. **Ein Sprint-Ergebnis gilt nicht immer** — es gehört
> in die Historie und in die Roadmap. Hierher gehört nur, was daraus **dauerhaft** folgt:
> eine Stolperfalle, eine Arbeitsregel, eine Lesson Learned. Im Zweifel gehört ein
> Absatz nach `sprints/projekt_historie.md` und ein Verweis hierher.

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
| Deployment | Vercel | Region **Dublin (`dub1`)** — festgenagelt in `vercel.json`, siehe unten |

**Major-Versions sind eingefroren.** Keine Bumps von Next/React/ESLint ohne
expliziten Sprint-Auftrag.

> ### ⚠️ Die Regions-Zeile stand hier über ein Jahr FALSCH — und niemand hat es geprüft
>
> Bis zum 17.08.2026 behauptete diese Tabelle *„Region matched Supabase (eu-west-1)"*.
> **Sie tat es nicht.** Die Vercel-Funktionen standen auf **USA**, die Datenbank liegt
> in **eu-west-1 (Irland)** — jede einzelne Anfrage lief über den Atlantik und zurück,
> rund **90 ms** Umweg. Bei den 233 Netzrunden, die ein Dashboard-Aufbau vor v2-24
> machte, war das ein erheblicher Anteil der Wartezeit.
>
> **Gefunden hat es nicht die Prüfstrecke und nicht diese Datei, sondern der Nutzer** —
> weil v2-24 die Frage überhaupt erst gestellt hat (`PF-4`).
>
> **Das ist LL-22 in seiner allgemeinen Form:** Eine Zusage in einer Doku ist keine
> Prüfung. LL-22 sagt das über **Rechenverhalten** — hier war es die Infrastruktur, und
> die Zeile war umso wirksamer, weil sie so beruhigend klang, dass niemand nachsah.
>
> ### Warum Dublin und nicht Frankfurt
>
> Am 17.08.2026 zunächst auf Frankfurt umgestellt, am selben Tag auf **Dublin**
> weitergezogen. Der Grund steht in Vercels eigener Beschriftung: Dublin heißt dort
> **`eu-west-1`** — dieselbe AWS-Region, in der die Supabase-Datenbank liegt. Die
> Funktion läuft damit **in** der Region der Datenbank, nicht daneben.
>
> **Die Zahl, die die Entscheidung trägt, ist nicht die Zahl der Anfragen, sondern die
> der Abhängigkeitsstufen.** `src/app/page.tsx` hat **13 `await`-Barrieren** — Stellen,
> an denen der Render auf eine Antwort warten *muss*, bevor er die nächste Frage stellt.
> Jede kostet eine volle Wegstrecke, egal wie viele Anfragen darin parallel laufen.
>
> | | Weg Funktion → Datenbank | × 13 Stufen |
> |---|---|---|
> | Frankfurt (`eu-central-1`) | andere AWS-Region | ~250–320 ms |
> | **Dublin (`eu-west-1`)** | **dieselbe** AWS-Region | **~25–40 ms** |
>
> Dagegen steht, dass Dublin für einen Nutzer in Deutschland rund 25 ms weiter weg ist
> als Frankfurt. Das verliert: Der Browser spricht pro Geste **zweimal** mit der
> Funktion, die Funktion **dreizehnmal hintereinander** mit der Datenbank. Das
> Verhältnis 13:2 entscheidet, und daran ändern einzelne Millisekunden nichts.
>
> **Was gemessen ist und was nicht:** Die 13 Stufen sind aus dem Code gezählt. Die
> Millisekunden sind **geschätzt** — sie liegen außerhalb dessen, was die Supabase-Logs
> sehen (`response.origin_time` misst Supabases eigene Verarbeitung, **nicht** die
> Netzstrecke von Vercel dorthin). Das Argument hängt nicht an den exakten Werten:
> „gleiche Region" liegt strukturell etwa eine Größenordnung unter „andere Region".
>
> ### Die Einstellung ist jetzt festgenagelt
>
> **`vercel.json` trägt `{"regions": ["dub1"]}`** — versioniert, im Diff sichtbar, und
> sie überlebt ein neu angelegtes Projekt. Vorher lebte sie **nur im Vercel-Portal** und
> war damit für dieses Repo unsichtbar; genau das ist der Grund, warum die falsche Zeile
> so lange überlebt hat (**LL-30 / §6 Stolperfalle 20**).
>
> **Zwei Dinge, die man dazu wissen muss:**
> - **Die Datei gewinnt gegen das Portal.** Wer die Region ändern will, ändert
>   `vercel.json` — eine Umstellung im Portal allein wird beim nächsten Deployment
>   überschrieben. Das ist gewollt.
> - **Die Middleware ist davon NICHT betroffen.** Sie läuft als Edge-Middleware immer am
>   Netzknoten in der Nähe des Nutzers; ihre eine Anmelde-Abfrage geht also weiterhin von
>   Deutschland nach Irland. Diese Einstellung steuert ausschließlich die
>   Server-Funktionen.
>
> **Der Hobby-Plan erlaubt genau eine Region** — „beides" gibt es nicht.

**Was NICHT verwendet wird:** kein Tailwind · keine Component-Library ·
kein State-Manager · keine ORM.

**Tests:** Playwright in drei Rollen. **Logik-Wächter** (die Mehrzahl, 72 von 75 im
`visual`-Projekt) transpilieren die **echte Quelldatei** und führen sie aus, statt die
Regel nachzubauen — ein Nachbau driftet ab und gibt falsche Sicherheit; diese Bauart hat
in v2-12, v2-17 und v2-19 je einen Fehler gefunden. **Pixel-Checks** (§9, `draw.ts`)
zeichnen auf ein Canvas und messen Farben. **Render-Smoke** fährt die Anwendung
angemeldet hoch — read-only gegen dev/Prod-DB, und der einzige Test, der die App als
Ganzes sieht.

Alle drei brauchen **keine** Live-Daten außer dem Render-Smoke. Daten-mutierende E2E
laufen **nur** gegen die Übungs-Datenbank (§4). Der manuelle Browser-Smoke des Users
bleibt der Produktiv-Gate.

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
├── playwright.config.ts                       ← Projekte: visual · unauth · setup · render-smoke
└── vercel.json                                ← NUR die Funktions-Region (§2)
```

> **Warum `vercel.json` nur eine einzige Zeile enthält.** Es gibt sie seit dem
> 17.08.2026 und ausschließlich für `{"regions": ["dub1"]}` — die AWS-Region, in der
> auch die Supabase-Datenbank liegt. Der Anlass steht in **§2**: Die Region stand über
> ein Jahr auf **USA**, während diese Datei das Gegenteil behauptete, und sie lebte nur
> im Vercel-Portal, wo kein Diff sie prüfen konnte (LL-30).
>
> **JSON kann keine Begründung tragen** — deshalb steht sie in §2 und nicht in der
> Datei. Wer `vercel.json` erweitern will, prüft zuerst, ob die Einstellung nicht
> besser in `next.config.mjs` gehört: Diese Datei ist bewusst **kein** Sammelbecken für
> Deployment-Optionen, sondern trägt genau die eine Sache, die Next.js nicht selbst
> versioniert.

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
   nicht der Roh-Plan.
   ⚠️ **`cards.planned_amount` gibt es nicht.** Diese Zeile nannte die Spalte bis zum
   24.08.2026; im Schema existiert sie nicht (gemessen gegen `information_schema`).
   Der Plan liegt **ausschließlich** in `card_planned_timeline` — wer den Rohwert
   braucht, holt ihn dort oder über `get_planned_amount_for_month`. Eine Abfrage auf
   `cards.planned_amount` scheitert mit `42703`, das ist also die harmlose Sorte
   Fehler; teurer wäre gewesen, die Zeile als Beleg für ein Datenmodell zu lesen, das
   es nicht gibt. (v2-28)
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
16. **Ein Frontend-Limit kann eine Datenbank-Entscheidung stillschweigend aufheben.**
    `get_year_deviation_drivers` liefert seit v2-19 bewusst bis zu **vier** Treiber —
    drei Karten plus die Zeile „Gehalt", die absichtlich **nicht** gegen die Karten
    gerankt wird. Im Frontend schnitt `getTop3Drivers` auf **drei** ab, und „Gehalt"
    liegt im Juli 2026 mit −15,57 € auf **Platz 4**, weil die Budget-Treiber größer
    sind. Die Zahl wäre korrekt berechnet, in die Sparrate gerechnet, B2-konform —
    und **nie sichtbar** gewesen.
    **Kein Wächter dieses Projekts fängt das:** Der Anker misst die Sparrate, die
    Prüfsummen messen den Funktionsrumpf, die B2-Invariante misst die Summe. Alle drei
    wären grün. **Wer eine Datenbank-Antwort erweitert, sucht im Frontend nach der
    Stelle, die sie kürzt** — `slice`, `LIMIT`, `take`, eine feste Feldliste.
    (v2-19, LL-26)

    **Dieselbe Lehre ist inzwischen in DREI Gestalten aufgetreten, und die
    Suchrichtung ist bei jeder eine andere:**

    | Form | Vorfall | Wonach man sucht |
    |---|---|---|
    | **Kürzen** | `getTop3Drivers` schnitt vier Treiber auf drei (v2-19) | `slice`, `LIMIT`, `take`, feste Feldlisten |
    | **Nachbauen** | `page.tsx` bildete `card_delete_gate` nach, um 31 RPC-Aufrufe zu sparen. Als die Datenbank in v2-20 großzügiger wurde, blieb der Nachbau streng — das Menü hätte ausgegraut, was die Datenbank längst erlaubte | *wo wird dieselbe Regel ein zweites Mal formuliert* |
    | **Den Monatsbezug weglassen** | `page.tsx` lud das Einkommen mit `.order("effective_month", desc).limit(1)` — **immer die neueste Zeile, ohne jeden Bezug zum angezeigten Monat**. Das Popup zeigte im Januar 2025 das Jahresbrutto von 2026 (92.400 € statt 90.000 €) und den Split von 2026 (57 % statt 58,8 %). Die **Sparrate war nie betroffen** — sie rechnet in der Datenbank, wo `effective_month <= p_month` gilt (v2-27) | *fehlt der Zeitbezug, obwohl die Datenbank ihn kennt* |
| **Auf einen Wert filtern** | `page.tsx` filterte verknüpfte Zahlungen mit `status === "ASSIGNED"`. Die View kennt **zwei** zugeordnete Zustände; `AUTO_ABSORBED` fiel durch, die Karte blieb „Offen" und zeigte keine Zahlung — obwohl beides in der Datenbank stand und die Sparrate den Betrag mitrechnete (v2-23) | *ist die Menge hinter dem Vergleich größer als der eine Wert* |
    | **Den falschen Teil wählen** | `displayDescription` zeigt den **letzten** `\|`-Teil eines Buchungstextes — bei DKB-Giro der Verwendungszweck und richtig, bei einem Debitkartenumsatz aber das **Datum**. Seit v2-29 erkennt `history_match` die Zahlung am **Händler**, der davor steht: Der Vorschlag ist da, seine Begründung ist weggeschnitten. Der Nutzer liest „VISA Debitkartenumsatz vom 29.11." und darunter „KI-Vorschlag: Privates Budget" (v2-29, `ZO-7`) | *wird der Teil angezeigt, auf dem die Entscheidung beruht* |

    **Sechs Vorfälle** (v2-19 · v2-20 · v2-21 · v2-23 · v2-27 · v2-29) — das ist die
    teuerste Fehlerklasse dieses Projekts, weil **jede Zahl richtig bleibt**. Anker,
    Prüfsummen und B2-Invariante sind dabei grün; gefunden hat **vier der fünf Fälle**
    nicht die Prüfstrecke, sondern das Benutzen.

    **Der fünfte Fall zeigt, worauf sich die Suche ausweiten muss.** Die ersten vier
    saßen alle in einer *Menge*: zu kurz geschnitten, zweitmals formuliert, auf einen
    Wert verengt. Der fünfte sitzt in einer *Zeitachse* — die Abfrage war vollständig
    und richtig, sie galt nur für den falschen Monat. **Wer diese Klasse sucht, prüft
    deshalb beides:** Ist die Menge vollständig? Und stimmt der Zeitpunkt?

    **Gegenmittel, wo die Menge exakt ist:** ein **benanntes Prädikat** statt eines
    Vergleichs an Ort und Stelle (`isLinkedToCard`, `isTransferFragment`). Es hat
    genau einen Ort, an dem ein neuer Wert nachzutragen ist, und es lässt sich
    einzeln prüfen — inklusive der strukturellen Frage, ob **jeder** Wert des Typs
    genau einer Gruppe zugeordnet ist. Genau daran wäre `AUTO_ABSORBED` aufgefallen.
17. **Eine Sub-Score-Funktion, die nicht streuen kann, macht eine Schwelle
    rechnerisch unerreichbar.** `frequency_match` prüft ausschließlich, ob die Karte
    im Monat des Fragments aktiv ist — und **genau darauf filtert ihr einziger
    Aufrufer bereits**. Sie liefert deshalb ausnahmslos `1.00`, gemessen über alle
    fünf Score-Klassen. 20 % des Konfidenz-Gewichts unterscheiden damit nichts: Der
    Wertebereich ist auf `[0.20, 1.00]` gestaucht, und ohne Namensähnlichkeit ist das
    Maximum `0.3 + 0.2 = 0.50` — bei einer Badge-Schwelle von **0,60**. In den Daten
    saßen **72 Zahlungen** im toten Band 0,50–0,60, mit perfektem Betrag und
    perfekter Frequenz.
    **Wer Gewichte vergibt, prüft, ob jede Komponente überhaupt streuen kann.** Eine
    Konstante im Zähler verschiebt den ganzen Wertebereich, ohne dass irgendeine Zahl
    falsch *aussieht* — und keine der bestehenden Prüfungen schlägt an. Offen als
    `ZO-1`. (v2-21)
18. **Ein N+1 mit Datumsstempel: eine Aufwands-Entscheidung verfällt mit der
    Datenmenge, die sie begründet hat.** In `page.tsx` stand
    *„N+1-Pragmatik: bei <20 Karten in V1 akzeptable Latenz (Briefing §K1.4)"* — und
    das war **richtig, als es geschrieben wurde**. Bei **77** Karten waren daraus
    **179 Netzrunden je Dashboard-Aufbau** geworden, und jede neue Karte kostete vier
    weitere.
    **Kein Wächter dieses Projekts fängt das.** Anker, Prüfsummen und beide
    Invarianten sind grün, weil **jede Zahl richtig ist** — sie kommt nur zu spät.
    Gefunden hat es der Nutzer beim Benutzen.
    **Regel:** Wer eine Mengen-Annahme in einen Kommentar schreibt, schreibt die
    **heutige Zahl** dazu. Dann ist die Annahme prüfbar statt bloß plausibel.
    (v2-24, LL-28)
19. **Die Antwort ist winzig, der Weg ist teuer — bei Trägheit zuerst die
    Netzrunden zählen, nicht die Abfragen optimieren.**
    `is_card_active_in_month` braucht **0,089 ms** in der Datenbank und lag im
    Produktionsschnitt bei **899 ms** über die Leitung. Faktor ~10.000, und nichts
    davon ist Rechnen: Für jede Anfrage muss eine verschlüsselte Verbindung stehen,
    ein Ausweis geprüft und eine eigene Transaktion geöffnet werden.
    Am 16.08.2026 transportierten **55.881 Anfragen** insgesamt **0,4 MB** — im
    Schnitt **8 Bytes je Antwort**.
    **Und die Folge reicht weiter als Trägheit:** Die Dauerlast aus dem Fächer trieb
    die kostenlose Datenbank-Instanz über Stunden in die CPU-Drosselung. In diesem
    Zustand brauchten die zwei Aufrufe der Middleware zusammen über 25 Sekunden, und
    Vercel lieferte `504 MIDDLEWARE_INVOCATION_TIMEOUT`. **Ein Leistungsproblem war
    hier ein Verfügbarkeitsproblem.** (v2-24, LL-29)
20. **Eine Einstellung, die nur in einem Web-Portal lebt, ist für dieses Repo
    unsichtbar — und deshalb über ein Jahr falsch geblieben.** §2 behauptete
    *„Region matched Supabase (eu-west-1)"*; die Vercel-Funktionen standen auf
    **USA**, während die Datenbank in **Irland** liegt. Rund **90 ms** Umweg über den
    Atlantik, auf **jede** der damals 233 Netzrunden.
    Weder die Prüfstrecke noch diese Datei konnte das finden — eine Behauptung prüft
    sich nicht selbst, und diese klang so beruhigend, dass niemand nachsah. Gefunden
    hat es der Nutzer, nachdem v2-24 die Frage überhaupt gestellt hatte.
    **Regel:** Was das Verhalten in Produktion bestimmt, gehört in den Code — dann
    prüft der Diff mit. **Erledigt für diesen Fall:** `vercel.json` trägt seit dem
    17.08.2026 `{"regions": ["dub1"]}` und gewinnt gegen das Portal.
    **Was daraus für den nächsten Fall folgt:** Solange eine Einstellung nur im Portal
    steht, ist jede Zeile über sie in dieser Datei eine **Vermutung** und muss als
    solche gekennzeichnet werden. Die Umkehrung ist genauso wichtig: Wer sie in den
    Code holt, muss es **hier** vermerken — sonst sucht die nächste Sitzung im Portal
    und findet einen Wert, der längst überschrieben wird. (v2-24, LL-30)
21. **Eine Copy-Entscheidung auf einer Karte ist erst vollständig, wenn sie gegen
    136 px gehalten wurde.** Der Design-Record vom 17.08.2026 legte den Text
    `nicht angefallen` an eine Stelle, an der er in **keinem** der vier Kartenzustände
    passt — gemessen 117,8–139,3 px bei **110 px** Inhaltsbreite, die sich zwei Texte
    teilen. Das ist kein Fehler der Gestaltung, sondern eine **fehlende Messung**.
    Gemessen wird mit dem echten Font-Stack, nicht geschätzt. (v2-25, LL-31)
22. **`pg_get_functiondef` schließt KOMMENTARE ein — „wortgleich einspielen" heißt
    wirklich wortgleich.** In v2-25 lief auf der Übungs-Datenbank eine gekürzte
    Fassung derselben Funktion; das Verhalten war identisch, die Prüfsumme nicht.
    Damit war der Vergleich Übung ↔ Produktion **wertlos**, und zwar ohne dass etwas
    rot wurde. In v2-26 bestätigt und seither eingehalten.
    **Die Kehrseite ist genauso teuer:** Ein Wächter, der prüft, dass ein Konstrukt
    verschwunden ist (`not.toContain("HAS_PAST_PLAN")`), schlägt an, sobald ein
    Kommentar erklärt, **warum** es verschwunden ist. Er bestraft dann gute
    Erklärungen. Solche Wächter müssen Kommentare ausschließen. (v2-25/v2-26, LL-32)
23. **Eine Sperre, die nie erreichbar war, ist ungeprüft — wer eine entfernt, prüft,
    was darunter liegt.** `card_delete_gate` kannte seit v2-20 die Sperre `HAS_STATES`,
    die auch **leere** Zustandszeilen zählte (`manually_paid = false`,
    `adjusted_amount = NULL` — der Rückstand eines zurückgenommenen Tap). Das fiel
    **nie auf**, weil `HAS_PAST_PLAN` ohnehin fast alles sperrte. Erst als v2-25 die
    erste Sperre entfernte, wurde die zweite sichtbar — und der Nutzer konnte eine
    frisch angelegte Karte nicht löschen.
    Dieselbe Klasse wie LL-26, aber **in der Tiefe statt in der Breite**: nicht eine
    zweite Stelle neben der ersten, sondern eine zweite Bedingung dahinter. (v2-26)
24. **Der Rhythmus zählt ab `first_active_month` — Zurückdatieren verschiebt den
    Fälligkeitsmonat in ALLEN Folgejahren.** `is_card_active_in_month` rechnet den
    Abstand zum ersten aktiven Monat und prüft `% 12 = 0` (ANNUAL) bzw. `% 3 = 0`
    (QUARTERLY). Eine jährliche Karte, die um **neun** Monate zurückwandert, ist
    danach in einem anderen Monat fällig.
    **Kein Wächter dieses Projekts fängt das.** Die Jahressumme bleibt gleich, beide
    Invarianten halten, alle Prüfsummen sind grün — **jede Zahl bleibt richtig, sie
    steht nur im falschen Monat.** Dieselbe Fehlerklasse wie LL-28/LL-29.
    **Regel:** Zurückdatieren nur um ein **ganzzahliges Vielfaches der Periode**, und
    der Wächter gehört in die Migration, nicht in eine Checkliste. In v2-27 fiel der
    ADAC-Mitgliedsbeitrag deshalb aus dem Umfang (Abstand 9, 9 % 12 ≠ 0), während
    Privathaftpflicht, DKV und Rundfunkbeitrag um exakt zwölf Monate zurückwanderten
    und ihre Monate behielten — vorher und nachher belegt. (v2-27, LL-34)
25. **Ein Client-Timeout ist kein Rollback.** Läuft ein Aufruf über MCP in einen
    Timeout, ist der Zustand der Datenbank **unbekannt** — nicht „zurückgerollt". In
    v2-27 lief `refresh_fragment_suggestions` für ein ganzes Jahr in einen Timeout;
    die **sofort** folgende Kontrollabfrage meldete 0 geschriebene Werte und sah damit
    wie ein sauberer Rollback aus. Die Datenbank arbeitete weiter und committete: Es
    waren 253.
    Hier war es harmlos, weil die Funktion nur Anzeige-Spalten schreibt und ihre
    eingebaute Invariante hielt. **Bei einer mutierenden Funktion wäre derselbe Irrtum
    teuer** — man hielte einen durchgeführten Eingriff für abgebrochen und führte ihn
    erneut aus. **Regel:** nach einem Timeout mit Abstand messen und die **Wirkung**
    prüfen, nicht die Fehlermeldung. Verwandt mit der Log-Ingestion-Verzögerung aus
    v2-24 (§9 Anker 3): Beide Male sieht ein zu früher Blick wie ein Befund aus. (v2-27)
26. **Wortgrenze und Teilwort sind zwei verschiedene Fragen — und die falsche Wahl
    fällt nicht auf.** `af_word_in_text` sucht mit
    `(^|[^a-z0-9])wort([^a-z0-9]|$)`. Für **Händlernamen** ist das genau richtig:
    `Douglas` trifft nicht `Glas`. Für ein **Teilwort-Signal** ist es genau falsch:
    `af_word_in_text('tank', 'jet tankstelle')` liefert **`false`**, weil hinter
    `tank` ein `s` steht.
    In v2-28 hing daran der einzige Fall, für den die zweite Stufe der Händler-Regel
    überhaupt gebaut wurde — „JET Tankstelle" wäre durchgefallen. Das zweite Signal
    sucht deshalb mit `strpos`, und der Kommentar in der Migration sagt warum:
    **Sonst „vereinheitlicht" die nächste Sitzung die beiden Aufrufe.**
    **Regel:** Vor jedem `af_word_in_text` die Frage stellen, ob ein Wort gemeint ist
    oder eine Zeichenfolge. Beide Antworten sind legitim, sie stehen nur nebeneinander
    im selben Codeblock. (v2-28)
27. **Ein Mittelwert über eine Periode verbirgt einen Sprung — die Jahressumme
    stimmt, und JEDER Monat ist falsch.** v2-27 bildete die 2025-Pläne als
    Jahresdurchschnitt der tatsächlichen Zahlungen. Bei Netflix ergab
    (10 × 19,99 + 2 × 13,99) / 12 exakt **18,99 €** — ein rechnerisch tadelloser
    Mittelwert, der **in keinem einzigen Monat gezahlt wurde**. Ursache war eine echte
    Preissenkung im November; dasselbe bei Spotify (Erhöhung im Dezember, Mittelwert
    11,16 €), beim Handyvertrag waren es zwei Ausreißer.
    **Kein Wächter fängt das.** Jahressumme, beide Invarianten und alle Prüfsummen
    bleiben grün — dieselbe Familie wie LL-28/LL-29/LL-34: *jede Zahl richtig, nur im
    falschen Monat.*
    **Regel:** Ein **Preiswechsel** gehört als zweite Zeile in
    `card_planned_timeline`, nicht in einen Mittelwert; dafür ist die Zeitreihe
    gebaut, und die Forward-Inheritance regelt den Rest. Ein **Ausreißer** darf den
    typischen Monat nicht verschieben — dann ist der Median die ehrlichere Wahl als
    das arithmetische Mittel.
    **Die billigste Gegenprobe:** die Einzelbeträge ansehen und fragen, ob der
    errechnete Wert **überhaupt vorkommt**. Bei Netflix und Spotify kam er kein
    einziges Mal vor. (v2-28, LL-37)
28. **Ein RAISE-Rollback lässt aufgeschobene Constraints NIE feuern.** Der
    Trockenlauf aus §7 Regel 16 committet nicht — ein `DEFERRABLE INITIALLY DEFERRED`
    Constraint-Trigger prüft aber **erst beim Commit**. Er läuft im Trockenlauf also
    nicht, und der Lauf ist grün, ohne dass die Prüfung stattgefunden hätte.
    In v2-28 betraf das `cards_assert_initial_plan` und damit ausgerechnet die
    Friseur-Rückdatierung — genau den Teil, dessentwegen geprobt wurde.
    **Regel:** `SET CONSTRAINTS ALL IMMEDIATE;` vor der Messung, innerhalb desselben
    Blocks. Details in §7 Regel 16. (v2-28, LL-39)
29. **Ein Ausdrucks-Index braucht schema-qualifizierte Aufrufe — und ohne ihn ist ein
    berechneter Ausdruck unbenutzbar.** Zwei Fallen an derselben Stelle:
    **① `CREATE INDEX` scheitert mit `42883: function … does not exist`**, wenn die
    indizierte SQL-Funktion ihre Hilfsfunktion nicht als `public.…` aufruft. Postgres
    **bettet die Funktion beim Anlegen ein** (Inlining) und wertet sie dabei unter
    einem anderen `search_path` aus. **Jeder direkte Aufruf funktioniert dabei
    tadellos** — der Fehler tritt ausschließlich beim Index-Anlegen auf, was die Suche
    zuverlässig in die Irre führt.
    **② Ohne den Index kostet ein einziger Aufruf das 72-fache.** In v2-29 brauchte
    `history_match` **14,9 ms** statt **0,208 ms** — ein Seq Scan über 1.599 Fragmente,
    der für **jede** Zeile ein `regexp_replace` ausführt. Bei rund 14.000 Aufrufen je
    `refresh_fragment_suggestions`-Lauf ist das der Unterschied zwischen 23 Sekunden
    und über drei Minuten.
    **Regel:** Wer auf einem berechneten Ausdruck vergleicht, legt den Index in
    **derselben** Migration an und ruft darin alles schema-qualifiziert auf. Der
    Trockenlauf findet beide Fallen; ohne ihn findet sie die Produktion. (v2-29)
30. **Eine Verallgemeinerung kann die alte Regel nicht ersetzen, obwohl sie genauer
    ist.** Ein gröberer Schlüssel trifft mehr — und fasst dabei mehr Fälle zusammen,
    wird also **öfter mehrdeutig**. Wo eine Regel bei Mehrdeutigkeit schweigt, ist das
    ein **Verlust an Reichweite**, den die Trefferquote nicht zeigt.
    In v2-29 traf der Händler-Schlüssel **91,5 %** gegen 77,4 % der alten wortgleichen
    Fassung. Er allein hätte trotzdem geschadet: **131 der 136 sichtbaren Vorschläge
    kamen aus der Historie, und 35 davon hätten keinen eindeutigen Treffer mehr
    gehabt.** Gebaut wurde deshalb **zweistufig** — erst der Händler, sonst der alte
    Vergleich; Regression **null**.
    **Regel:** Wer eine Erkennungs- oder Ähnlichkeitsfunktion verallgemeinert, misst
    **beides**: die neue Trefferquote **und** was die alte Fassung heute schon leistet.
    Ergänzen schlägt ersetzen, solange die alte Stufe etwas trägt, das die neue nicht
    erreicht. Ergänzt §7 Regel 25, die nur Richtig und Falsch verlangt — hier kommt die
    **Reichweite** als dritte Achse dazu. (v2-29, LL-41)

### Typen neu erzeugen (nur bei Schema-Änderung)

```bash
supabase gen types typescript --project-id nflkobdfdhncrtjncpmq > src/lib/supabase/types.ts
```

> **Stolperfalle:** Danach prüfen, ob am Dateiende ein `<claude-code-hint>`-Tag hängt.
> Falls ja: entfernen — sonst schlägt `tsc` fehl.

> **Und danach die NAMENSMENGEN vergleichen, nicht den Zeilen-Diff lesen.** In v2-24
> war `types.ts` **seit v2-21 veraltet** — fünf RPCs fehlten (`af_normalize_text`,
> `af_word_in_text`, `history_match`, `name_similarity_scoped`,
> `refresh_fragment_suggestions`), weil dieser Schritt damals übersprungen worden war.
> Aufgefallen ist es nur, weil `tsc` eine **neue** RPC nicht kannte; ohne diesen Zufall
> läge es noch da.
>
> Der Zeilen-Diff war **288+/267−** und praktisch unlesbar — die generierte Datei
> sortiert alphabetisch, ein Einschub verschiebt also alles darunter. Ein Vergleich der
> Funktionsnamen **als Menge** beantwortete dieselbe Frage in einer Zeile: „nichts
> verloren, sechs dazu". **Verschwundene Namen sind das, was hier wehtut**, nicht
> verschobene Zeilen.

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
    ⚠️ **Und: `SET CONSTRAINTS ALL IMMEDIATE;` gehört in den Block, bevor gemessen
    wird.** Der `RAISE` committet nie — ein `DEFERRABLE INITIALLY DEFERRED`
    Constraint-Trigger prüft aber **erst beim Commit** und feuert im Trockenlauf
    deshalb **überhaupt nicht**. Der Lauf ist dann grün, ohne dass die Prüfung
    stattgefunden hat. In v2-28 betraf das `cards_assert_initial_plan` und damit
    genau den Teil des Eingriffs, dessentwegen geprobt wurde. **Der Trockenlauf muss
    das erzwingen, sonst prüft er weniger, als er zu prüfen scheint.**
    (v2-28, LL-39 · §6 Stolperfalle 28)
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
21. **Vor und nach jedem Eingriff die Sparrate messen — alle zwölf Monate, Ist und
    Plan, in DERSELBEN Sitzung.** Verglichen wird gegen den eigenen Vorher-Wert, nicht
    gegen eine Tabelle in einer Datei: Die Zahlen des Nutzers bewegen sich durch
    normale Benutzung, seit dem 13.08.2026 gibt es deshalb **keine eingefrorene
    Sollwert-Tabelle mehr**. Dazu die beiden datenunabhängigen Invarianten. Alles in §9.
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
25. **Wer eine Erkennungs- oder Ähnlichkeitsfunktion ändert, misst gegen echte
    Entscheidungen — vorher und nachher, mit Richtig UND Falsch.** Eine Verbesserung,
    die nur die Treffer zählt, ist keine: Der wortweise Namensvergleich hob in v2-21
    die richtigen Vorschläge von 14 auf 27 — und die **falschen** von 1 auf **18**.
    Beides sichtbar wurde erst, weil beide Seiten gezählt wurden; die Trefferzahl
    allein hätte die Verschlechterung als Erfolg ausgewiesen.
    Grundlage waren die **101 Handzuordnungen aus Juli/August 2026** — echte
    Entscheidungen des Nutzers, kein synthetisches Set. **Das jeweils geprüfte
    Element gehört aus seiner eigenen Lernmenge ausgeschlossen**, sonst misst man
    Auswendiglernen statt Vorhersage. (LL-27)
26. **Wer eine Entscheidung ändert, sucht im selben Papier nach den Zahlen, die aus
    ihr folgen.** Eine Zahl in einem Briefing ist keine Behauptung über die Welt,
    sondern das **Ergebnis der Annahmen, die bis dahin galten**. Wird weiter unten
    eine Annahme geändert, ist die Zahl oben still überholt — ohne dass irgendjemand
    sich geirrt hätte.
    In v2-28 nannte das Briefing **55 Zahlungen / 1.262,92 €** und einen höchsten
    Tank-Monat von **199,21 €**. Beides war korrekt gerechnet — **vor** der weiter
    unten getroffenen Entscheidung, den Nahverkehr aufzunehmen. Mit ihr sind es
    **65 / 1.520,22 €** und **239,21 €**; die Differenz ist genau **eine** RMV-Fahrt
    über 40,00 €. Die Schlussfolgerung („bewegt keine Zahl") hielt — aber aus 40 Euro
    Spielraum im Budget waren **79 Cent** geworden, und darauf beruhte das Urteil
    „risikolos".
    **Das ist LL-28 und LL-30 in einer dritten Gestalt.** Dort veraltet eine Annahme
    mit der Datenmenge bzw. lebt eine Einstellung außerhalb des Diffs; hier veraltet
    eine Zahl mit einer Entscheidung **auf derselben Seite**. Allen dreien gemeinsam:
    **Nichts ist falsch gerechnet, und niemand hat einen Fehler gemacht.**
    **Praktisch:** Wer eine Liste, eine Schwelle oder einen Umfang erweitert, greppt
    das eigene Papier nach den Kennzahlen, die daraus abgeleitet sind — Summen,
    Anzahlen, Maxima, „risikolos"-Urteile. Und wer ein Briefing **ausführt**, misst
    dessen Zahlen ohnehin nach (§7 Regel 10). (v2-28, LL-38)
27. **Ein Wächter, von dem niemand weiß, ob er auslösen kann, ist eine Zusicherung —
    keine Prüfung.** Wer einen Regressions-Wächter schreibt, baut den Fehler, den er
    fangen soll, **einmal testweise ein** und belegt, dass der Test rot wird. Danach
    zurücknehmen.
    Das kostet zwei Minuten und beantwortet die einzige Frage, die zählt: *Prüft er
    das, was ich glaube?* In v2-29 lief der neue Wächter beim ersten Versuch grün, weil
    sein Muster die **falsche** Stelle traf — die Bedingung im `aria-label` statt der
    Render-Bedingung. Ein grüner Lauf hätte das nie verraten.
    **Das ist LL-22 in einer zweiten Gestalt:** Dort ist eine Doku-Zusage über
    Rechenverhalten keine Prüfung; hier ist es ein Test, dessen Auslösung nie
    beobachtet wurde. Beide sehen aus wie Sicherheit und sind keine. (v2-29, LL-40)

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
| LL-26 | Ein Frontend kann eine Datenbank-Entscheidung stillschweigend aufheben — durch **Kürzen**, **Nachbauen** oder **Filtern auf einen Wert**. Jede Zahl bleibt dabei richtig, nur sichtbar ist sie nicht | §6 Stolperfalle 16 | v2-19 (GE-2) · v2-20 (KU-1) · v2-23 (ZU-1) |
| LL-27 | Eine Ähnlichkeitsfunktion braucht ein Prüfset aus echten Entscheidungen — die naive Verbesserung war messbar **schlechter** als gar keine | §7 Regel 25 · §6 Stolperfalle 17 | v2-21 (M6) |
| LL-28 | Ein N+1 mit Datumsstempel — die Mengen-Annahme im Kommentar verfällt mit der Menge, und **kein Wächter merkt es**, weil jede Zahl richtig ist | §6 Stolperfalle 18 | v2-24 (PF-1) |
| LL-29 | Die Antwort ist winzig, der Weg ist teuer — Netzrunden zählen, nicht Abfragen optimieren. Und die Dauerlast daraus wurde zum **Ausfall** | §6 Stolperfalle 19 · §9 Anker 3 | v2-24 (PF-1) |
| LL-30 | Eine Einstellung, die nur in einem Web-Portal lebt, ist für das Repo unsichtbar — die Regions-Zeile stand über ein Jahr falsch | §2 · §6 Stolperfalle 20 | v2-24 (PF-4) |
| LL-31 | Eine Spezifikation kann an der **Physik** scheitern, nicht am Aufwand — dann nicht stillschweigend kürzen, sondern messen und **beide** Varianten mit Zahlen vorlegen | §6 Stolperfalle 21 | v2-25 (KJ-3) |
| LL-32 | `pg_get_functiondef` schließt Kommentare ein — und ein Wächter auf ein verschwundenes Konstrukt muss sie ausschließen, sonst bestraft er gute Erklärungen | §6 Stolperfalle 22 | v2-25 · v2-26 |
| LL-33 | Der Vorgabewert als Falle: Wo eine Vorbelegung eine **Zeitreihe** eröffnet (`Monatlich` beim Anlegen), gehört sie zur bewussten Wahl gemacht **oder** nachträglich änderbar. Sonst ist Zerstörung der einzige Weg zur Reparatur | §6 Stolperfalle 23 | v2-26 (KJ-8) |
| LL-34 | Zurückdatieren verschiebt den Rhythmus — jede Zahl bleibt richtig, sie steht nur im falschen Monat. Der Wächter gehört in die Migration | §6 Stolperfalle 24 | v2-27 (DA-1) |
| LL-35 | Wer aus einem **Textmuster** aggregiert, misst das Muster und nicht die Sache — drei Zahlen eines sorgfältigen Auftrags waren so falsch | §9 · hier | v2-27 (DA-1) |
| LL-36 | Wer einen **unbekannten** Wert aus Daten rekonstruiert, prüft die Methode zuerst an einem **bekannten** — die Gegenprobe lag zwölffach bereit und wurde nicht gemacht | hier | v2-27 (P6) |
| LL-37 | Ein **Mittelwert über eine Periode** verbirgt einen Sprung: Die Jahressumme stimmt, und **jeder einzelne Monat ist falsch**. Der billigste Test — kommt der errechnete Wert in den Daten überhaupt **vor**? | §6 Stolperfalle 27 | v2-28 (DA-3) |
| LL-38 | Eine Zahl in einem Papier veraltet mit einer **Entscheidung auf derselben Seite** — nichts ist falsch gerechnet, und niemand hat sich geirrt | §7 Regel 26 | v2-28 (ZO-4) |
| LL-39 | Ein **RAISE-Rollback lässt aufgeschobene Constraints nie feuern** — der Trockenlauf ist grün, ohne geprüft zu haben. `SET CONSTRAINTS ALL IMMEDIATE` | §7 Regel 16 · §6 Stolperfalle 28 | v2-28 (DA-3) |
| LL-40 | Ein **Wächter, von dem niemand weiß, ob er auslösen kann**, ist eine Zusicherung, keine Prüfung — den Fehler einmal testweise einbauen und rot sehen | §7 Regel 27 | v2-29 |
| LL-41 | Eine **Verallgemeinerung kann die alte Regel nicht ersetzen, obwohl sie genauer ist** — ein gröberer Schlüssel fasst mehr zusammen und wird dadurch **öfter mehrdeutig**. Wer eine Erkennung verallgemeinert, misst nicht nur die neue Trefferquote, sondern auch, **was die alte Fassung heute schon leistet** | §6 Stolperfalle 30 | v2-29 |

> **Warum LL-37 neben LL-35 und LL-36 steht und nicht in ihnen aufgeht.** Alle drei
> handeln von Aggregation, und sie sind trotzdem drei verschiedene Fehler.
> **LL-35:** die Menge ist zu weit gefasst — 17 Apple-Buchungen, von denen nur zwölf
> iCloud sind. Die Gruppe ist falsch.
> **LL-36:** die Methode ist ungeprüft — *Jahresdurchschnitt ÷ Split-Faktor* erfand
> Haushaltsbeträge. Die Rechnung ist falsch.
> **LL-37:** Gruppe und Rechnung sind **beide richtig**. (10 × 19,99 + 2 × 13,99) / 12
> = 18,99 ist über genau die richtigen Zahlen exakt gebildet. Falsch ist die
> **Annahme, dass es einen typischen Monat gibt** — und die steckt nicht in der
> Formel, sondern in der Entscheidung, überhaupt zu mitteln.
>
> Wer LL-35 und LL-36 kennt, prüft die Menge und prüft die Methode, findet beides
> sauber und übersieht LL-37 vollständig. **Die einzige Frage, die es aufdeckt, ist
> die naivste: Kommt der errechnete Wert in den Daten vor?** Bei Netflix und Spotify
> kam er kein einziges Mal vor.

> **Warum LL-38 keine Wiederholung von LL-28 ist, obwohl es sich so liest.** LL-28
> beschreibt eine Annahme, die mit der **Zeit** veraltet — „<20 Karten" war richtig
> und wurde es aufhörend, während der Bestand wuchs. LL-38 beschreibt eine Zahl, die
> **im selben Moment** veraltet, in dem weiter unten im selben Papier eine
> Entscheidung fällt. Es vergeht keine Zeit, es ändert sich keine Datenlage —
> **die beiden Stellen widersprechen sich vom Tag ihrer Niederschrift an.**
>
> Das macht LL-38 leichter zu finden als LL-28 (es steht alles auf einer Seite) und
> zugleich leichter zu übersehen: Ein Papier, das man selbst geschrieben hat, liest
> man nicht noch einmal gegen sich selbst.

> **LL-36 ist die teuerste Prüfung, die in v2-27 gefehlt hat — und sie hätte nichts
> gekostet.** Die Migration `DA-1` bildete den Plan der GEMEINSAM-Karten als
> *Jahresdurchschnitt des Anteils ÷ Split-Faktor*. Das hielt den **Anteil** konstant und
> erfand dafür einen **Haushaltsbetrag**, den es nie gab (1.817,49 € statt 1.820 €,
> 1.888,91 € statt 1.861 €). Der Nutzer bemerkte es noch am selben Tag.
>
> **Die Gegenprobe war die ganze Zeit verfügbar:** Rechnet man *Zahlung ÷ Faktor des
> Monats*, ergibt sich für Feb–Aug 2026 **exakt der heute gültige Plan** — zwölf bekannte
> Werte, die die Methode hätte treffen müssen. Sie tat es; nur hat niemand nachgesehen.
> Für Mai–Dez 2025 liefert dieselbe Rechnung glatte 1.861,00 €, Monat für Monat ohne Rest.
>
> **Der Fehler war nicht Nachlässigkeit, sondern eine Lösung für das falsche Problem.**
> Die Konstruktion sollte vor der Doppelanwendung des Split-Faktors schützen (§6
> Stolperfalle 11) — und tat das zuverlässig. Sie unterstellte dabei nur, ein
> Haushaltsbetrag ändere sich, wenn sich das Verhältnis der Einkommen verschiebt. Er tut
> es nicht.
>
> **Verwandt mit LL-22**, aber schärfer: Dort ist eine Doku-Zusage ungeprüft, hier eine
> **eigene Rechenmethode** — und die lässt sich, anders als eine Zusage, gegen bekannte
> Werte testen.

> **LL-35 in einem Satz, weil es die billigste Prüfung dieses Registers ist.** In v2-27
> hielten drei Angaben des Auftrags der Messung nicht stand, und **alle drei entstanden
> durch Gruppierung über einen zu groben Beschreibungstext**: „iCloud kostete 2025 11,58 €"
> war der Schnitt über 17 `APPLE.COM/BILL`-Buchungen, von denen nur zwölf iCloud sind
> (die tatsächlich alle exakt 9,99 € kosteten). „Diese vier Karten gab es 2025 nicht"
> stimmte für fünf andere, aber nicht für sie — sie hatten 12 von 12 Monaten Zahlungen.
> Und „ADAC" bezeichnet zwei verschiedene Dinge: einen Mitgliedsbeitrag und ein
> Fahrsicherheitstraining.
>
> **Die Gegenprobe kostete jeweils eine Abfrage** — die Einzelbuchungen ansehen statt der
> Aggregatzeile. Verwandt mit LL-26, aber die Richtung ist umgekehrt: Dort filtert ein
> Code eine Menge zu eng, hier fasst eine **Analyse** sie zu weit.

> **Warum LL-28 und LL-29 zusammengehören und trotzdem zwei Einträge sind.** LL-28 ist
> die **Entstehung**: eine Entscheidung, die mit ihrer Begründung veraltet, ohne dass
> jemand es merkt. LL-29 ist die **Diagnose-Reihenfolge**: bei Trägheit zuerst zählen,
> wie oft gefragt wird, nicht wie lange eine Frage dauert. Wer nur LL-28 kennt, sucht
> die veraltete Annahme und findet sie nicht, weil sie plausibel klingt. Wer nur LL-29
> kennt, zählt richtig und versteht nicht, wie es so weit kam.
>
> **Und warum LL-29 nicht in LL-21 aufgeht:** LL-21 warnt vor einer **stillen Kürzung**
> durch die Infrastruktur — PostgREST liefert 1000 Zeilen und schweigt. LL-29 betrifft
> Abfragen, die **vollständig und korrekt** antworten; es sind nur zu viele. Das eine
> ist ein Datenverlust, das andere eine Kostenfrage — und **nur bei LL-29 wurde daraus
> ein Ausfall**.

> **Warum LL-26 neben LL-21 steht und nicht darin aufgeht.** LL-21 warnt vor einer
> **stillen Kürzung durch die Infrastruktur** — PostgREST liefert 1000 Zeilen und
> schweigt. LL-26 ist die Umkehrung: Die Kürzung ist **absichtlich und dokumentiert**,
> nur ist ihre Begründung veraltet. `slice(0, 3)` war jahrelang richtig, mit einem
> Kommentar, der es erklärte („die Begrenzung macht bereits die RPC"). Erst als die
> RPC ihre Antwort erweiterte, wurde aus der Defense-in-Depth ein Filter. **Wer nach
> LL-21 sucht, sucht nach fehlenden Grenzen; LL-26 sucht nach vorhandenen, die zu eng
> geworden sind.**

> **Warum LL-25 neben LL-24 steht und nicht darin aufgeht.** LL-24 warnt, dass die
> Gegenseite **anders** rundet. Bei LL-25 rundet sie **seltener** — einmal am Ende
> statt einmal je Gruppe. Das ist eine andere Fehlerklasse, und sie ist teurer: Sie
> war in einem Beschluss-Record bereits **falsch analysiert** worden („die Ursache
> sitzt in Wohnen"), ohne dass es jemandem auffiel, und die dort verordnete Abhilfe
> hätte den Fehler nicht behoben. Wer LL-24 kennt und LL-25 nicht, hält die Sache
> für erledigt, sobald er innerhalb der Gruppe sauber rechnet.

---

## 9. Aktueller Stand

**Letzter Sprint:** **v2-29** („Die App merkt sich, was du entschieden hast" — `ZO-5`,
25.08.2026) · **davor:** v2-28 (`DA-3` `ZO-4` `NAV-1`), v2-27 (`DA-1` `ZO-3`),
v2-26 (`KJ-6`…`KJ-9`), v2-25 (`KJ-1` `KJ-2` `KJ-3`), v2-24 (`PF-1` `PF-2` `PF-4`),
v2-23 (`ZU-1`), v2-22 (`B2-R` `ZO-2`), v2-21 (`M6`).
**Alles bis einschließlich v2-29 ist in `main`** — PR #46 gemergt, Browser-Smoke
bestanden, gegen den Baum geprüft (`git ls-tree origin/main`), **nicht** gegen den
PR-Status.

> **Was die einzelnen Sprints gebracht haben, steht in
> `sprints/projekt_historie.md`** — dort vollständig, mit Zahlen und den Stellen, an
> denen sich eine Annahme als falsch erwiesen hat. Hier steht nur, was für die
> **nächste** Sitzung gilt.

### Wo das Projekt gerade steht

| | Stand 25.08.2026 |
|---|---|
| **2026** | vollständig zugeordnet — **0** offene Zahlungen |
| **2025** | **480** offen, davon **195** mit Kartenvorschlag (v2-29: 136 → 195) |
| **Goldlinie 2025** | **21.708,77 €** — bewegt sich laufend durch Kuratierung |
| **Nächste Arbeit** | Kuratierung 2025. **Handarbeit in der App, kein Sprint.** |
| **Übungs-Datenbank** | pausiert, Anker 2.200,00 € |

### Was offen ist und eine Entscheidung braucht

| | |
|---|---|
| **`ZO-7`** | **Die App kennt den Händler und zeigt ihn nicht.** `displayDescription` zeigt den **letzten** `\|`-Teil — bei DKB-Giro der Verwendungszweck und richtig, bei einem Debitkartenumsatz das **Datum**. Der Nutzer liest „VISA Debitkartenumsatz vom 29.11." und darunter „KI-Vorschlag: Privates Budget", **ohne zu sehen, worauf der Vorschlag beruht**. Betrifft exakt die 39 Zahlungen, die v2-29 sichtbar gemacht hat. Fünfte Gestalt von LL-26 (§6 Stolperfalle 16). |
| **`ZO-8`** | **Der alphabetische Münzwurf.** Die wortgleiche Stufe von `history_match` prüft **nicht** auf Eindeutigkeit; liegt derselbe Text auf mehreren Karten, entscheidet `ORDER BY score DESC, card_name ASC`. Betrifft 93 der 568 Handzuordnungen. |
| **`ZO-1`** | `frequency_match` liefert ausnahmslos `1.00` (§6 Stolperfalle 17). Jede Änderung verschiebt **alle** Scores gleichzeitig. |
| **`ZO-6`** | Kein Wächter dafür, ob eine Händler-Regel auf eine Karte zeigt, **die es gibt** — sie ist nach Kartenname geschlüsselt und greift nach einer Umbenennung **still** nicht mehr. |
| **`KAT-5` / `A2`** | entschieden und ungebaut. Alle übrigen Beschlüsse der Runden vom 06.08. und 07./08.08.2026 sind umgesetzt. |
| **Folgepflicht des Nutzers** | Für Friseurbesuche 2025 gibt es **keine Belege** (Salon erstmals 01/2026). Die passenden Bargeld-Abhebungen gehören bei der Kuratierung an die Friseur-Karte — **sonst zählt dasselbe Geld zweimal.** |
| **Juli 2025** | hat noch **79 Cent** Luft im Tank-Budget (239,21 bei 240,00). Eine nachträglich zugeordnete Tankfüllung kippt den Monat — und dann bewegt sich die Sparrate. |

**Doku-Versionen:** stehen **im Header der jeweiligen Bibel** —
`antigravity_finance_design_dokument.md` und `antigravity_finance_schema_summary.md`,
jeweils Zeile 3. **Hier steht bewusst keine Zahl mehr.**

> ### ⚠️ Warum diese Zeile keine Versionsnummern mehr trägt
>
> **Sie hat es ZWEIMAL erwischt — am 17.08. und am 19.08.2026.** Beim ersten Mal nannte
> sie Schema-Doku „v3.6.0", während die Datei bei v3.9.0 stand. Der Warnkasten, der
> daraufhin einzog, endete mit *„Sie ist eine Abschrift, keine Quelle"* — und **genau
> das passierte zwei Tage später wieder**.
>
> Der Kasten schloss damals selbst: *„Ein Warnkasten verhindert nichts. … Wirksam wäre
> nur, den Wert **nicht zu duplizieren**."* Am 24.08.2026 ist genau das umgesetzt.
>
> **Das ist die allgemeine Form von LL-30**, und sie gilt über die Regions-Zeile
> hinaus: Ein Wert, der an zwei Stellen steht, ist an einer davon irgendwann falsch —
> und man erfährt es nicht, weil beide Stellen für sich plausibel bleiben. **Die
> einzige verlässliche Abhilfe ist, ihn nur einmal zu schreiben.**


### Die Prüfanker

**Wozu sie da sind:** Ein Anker soll merken, wenn **ein Eingriff** eine Zahl bewegt,
die sich nicht bewegen durfte. Er soll **nicht** die Zahlen des Nutzers kennen.

Bis zum 13.08.2026 stand hier eine eingefrorene Zwölf-Monats-Tabelle. **Sie ist raus**
— sie verwechselte beides und war an einem einzigen Tag zweimal überholt, ohne dass
irgendetwas kaputt war (Begründung unten). An ihre Stelle treten zwei Wächter, die vom
Datenstand **unabhängig** sind, plus die Messregel, die ohnehin schon galt.

#### Anker 1 — die Ordner-Spalte ergibt die Sparrate *(seit v2-17)*

Sie stimmt in **allen zwölf Monaten exakt**, und das ist erzwungen, nicht zufällig
(Stolperfalle 13 / LL-25). Sie schlägt an, sobald jemand an der Rundung dreht — **egal,
wie die Daten gerade aussehen.** In einem Aufruf messbar:

```sql
SELECT sum((e->>'amount')::numeric)
  FROM jsonb_array_elements(get_category_amounts_for_month('<user_id>', '<monat>')) e;
-- muss exakt calculate_sparrate_for_month('<user_id>', '<monat>') ergeben
```

#### Anker 2 — `Σ delta = Ist-Sparrate − Plan-Sparrate` *(B2)*

Pro Monat, in **allen zwölf**, nicht stichprobenartig (§6 Stolperfalle 9, Regel 23).
Ebenfalls datenunabhängig: Die Gleichung muss gelten, wie viel auch immer zugeordnet
ist.

#### Anker 3 — Anfragen je Dashboard-Aufbau *(seit v2-24)*

**Die beiden anderen Anker messen Richtigkeit. Dieser misst, ob die App benutzbar
bleibt.** Ein N+1 kann beliebig wachsen, während Anker 1, Anker 2 und alle Prüfsummen
grün bleiben — jede Zahl ist richtig, sie kommt nur zu spät. Genau so ist v2-24
entstanden: 233 Netzrunden je Aufbau, und **kein Wächter dieses Projekts hat es
gemerkt**.

Zählbar im Supabase-Edge-Log. `app_config` wird **genau einmal je Dashboard-Aufbau**
abgefragt und ist damit der Zähler für die Zahl der Aufbauten:

```sql
-- ClickHouse (Supabase-Log-Abfrage), Fenster nach Bedarf
select count() as anfragen,
       countIf(log_attributes['request.path'] = '/rest/v1/app_config') as aufbauten,
       round(count() / countIf(log_attributes['request.path'] = '/rest/v1/app_config'), 1)
         as je_aufbau
from logs where source = 'edge_logs' and timestamp >= <start>;
```

**Stand nach v2-24: ~18.** Vor v2-24: **233**. Steigt die Zahl deutlich, ist ein N+1
zurück — und zwar ohne dass irgendeine Zahl falsch wird.

> **Zwei Fallen bei der Auswertung, beide haben in v2-24 Zeit gekostet.**
> Die Edge-Logs haben eine **Ingestion-Verzögerung von Minuten** — wer sofort nach dem
> Messlauf zählt, zählt zu wenig und diagnostiziert einen Fehler, den es nicht gibt (in
> v2-24 fehlte eine RPC komplett und erschien erst später). Und: **`pnpm build` nie bei
> laufendem dev-Server starten**, beide teilen `.next`; das Symptom ist `ERR_ABORTED`
> beim Navigieren und die **Anmeldeseite** im Test-Abbild — was nach einem Auth-Fehler
> aussieht und keiner ist.

#### Die Messregel — und sie ist der eigentliche Wächter

**Vor und nach jedem Eingriff alle zwölf Monate messen, Ist *und* Plan, in DERSELBEN
Sitzung.** Verglichen wird gegen den eigenen Vorher-Wert von vor zehn Minuten, nicht
gegen eine Tabelle von letzter Woche. Verfahren: Fähigkeit `db-eingriff`, Schritte 1
und 6. Bewegt sich etwas, das sich nicht bewegen sollte → **zurückrollen, nicht
erklären**. Soll sich etwas bewegen, wird der erwartete Wert **vorher** aufgeschrieben.

> **Warum die Werte-Tabelle raus ist.** Am 13.08.2026 war der Juli-Anker **zweimal
> innerhalb weniger Stunden** überholt — durch nichts als normale Benutzung:
> −322,75 € → −322,74 € (drei Zahlungen zugeordnet, `BF-4` greift) → **+38,24 €**
> (sechs Budget-Karten auf „abgeschlossen" gesetzt, **+360,98 €**). Beide Male hat die
> App exakt richtig gerechnet. Zugeordnet wurde die zweite Bewegung, indem die
> Änderungen in einem zurückgerollten Trockenlauf einzeln rückgängig gemacht wurden
> (LL-18) — nicht durch Nachdenken.
>
> Der Nutzer kuratiert weiter, auch rückwirkend. Eine eingefrorene Tabelle schlägt
> dabei bei **jeder** normalen Benutzung an und wird nach dem dritten Fehlalarm nicht
> mehr gelesen. §9 sagte das seit dem 25.07.2026 selbst — der Satz stand nur direkt
> neben einer Tabelle, die genau das tat: *„Eine Anker-Tabelle mit falschen Sollwerten
> ist schlimmer als keine."*
>
> **Wann sie zurückkommt:** wenn die Kuratierung durch ist. Dann wird eine frische
> Tabelle eingefroren — mit Datum daneben und dem Satz, dass sie nur gilt, solange
> nicht kuratiert wird.

**Momentaufnahme 25.08.2026 — Orientierung, KEIN Sollwert.** Sie sagt einer neuen
Sitzung, in welcher Größenordnung sie sich bewegt. Eine Abweichung ist **kein** Alarm.

> **Am 25.08.2026 nach v2-29 nachgemessen: alle 24 Werte unverändert.** Das ist hier
> das erwartete Ergebnis und kein Zufall — `confidence.history_score` steht auf 0,94
> und damit **unter** der Auto-Absorptions-Schwelle 0,95, es kann also nichts verlinkt
> werden. Der Sprint hat 59 Vorschläge sichtbar gemacht und **keine** Zuordnung
> vorgenommen.

| Monat | 2026 Ist | 2025 Ist | | Monat | 2026 Ist | 2025 Ist |
|---|---|---|---|---|---|---|
| Januar | 1.318,76 € | 1.813,98 € | | Juli | −8,84 € | 1.821,04 € |
| Februar | 1.667,90 € | 1.689,37 € | | August | 629,34 € | 1.862,14 € |
| März | 1.053,42 € | 1.679,98 € | | September | 1.821,59 € | 1.858,74 € |
| April | 1.753,14 € | 1.753,87 € | | Oktober | 1.790,08 € | 1.827,59 € |
| Mai | −239,10 € | 1.842,29 € | | November | 1.821,59 € | 1.854,79 € |
| Juni | 3.509,75 € | 1.852,19 € | | Dezember | 1.821,59 € | 1.852,79 € |
| | | | | **Goldlinie 2025** | | **21.708,77 €** |

> ### ⚠️ Diese Tabelle trägt ihren eigenen Beleg dafür, dass sie kein Sollwert ist
>
> **Sie war schon veraltet, bevor sie geschrieben wurde.** Der Sprint v2-28 endete am
> 24.08.2026 mit **21.776,33 €** für 2025 — gemessen wenige Stunden später steht dort
> **21.708,77 €**, und **vier Monate haben sich bewegt** (Januar bis April 2025). Der
> Nutzer hat in der Zwischenzeit kuratiert, weiter nichts.
>
> **Beide Invarianten blieben dabei 24/24 exakt, alle neun Prüfsummen unverändert.**
> Die App rechnet also richtig; es sind nur andere Zahlungen zugeordnet als vorhin.
> Genau deshalb gibt es seit dem 13.08.2026 keine eingefrorene Sollwert-Tabelle mehr:
> **Eine Abweichung von dieser Tabelle ist der Normalfall, kein Befund.**
>
> **Wer prüfen will, ob ein Eingriff etwas kaputtgemacht hat, misst selbst** — vorher
> und nachher, in derselben Sitzung, alle zwölf Monate beider Jahre, Ist **und** Plan.
> Die Messregel unten ist der Wächter, nicht diese Tabelle.
>
> **Was die 2025-Spalte inhaltlich bedeutet:** Bis v2-27 stand dort in allen Monaten
> 4.037,11 € — das volle Netto, weil für 2025 gar keine Kosten modelliert waren.
> `DA-1` hat die Karten zurückdatiert, `DA-3` (v2-28) ihre Pläne auf die tatsächlich
> gezahlten Beträge gebracht. Die Streuung innerhalb von 2025 wächst weiter, je mehr
> der Nutzer zuordnet — sie ist ein Fortschrittsmaß, kein Fehlermaß.
> Protokolle: `sprints/sprint_v2-27_anker.md` · `sprints/sprint_v2-28_anker.md`.

**Was die alte Tabelle an Wissen trug — komprimiert, weil es nicht an ihr hängt:**

- **`BF-5`** (v2-11, 05.08.2026): Fragmente wurden ohne Vorzeichen addiert. Juli-Ist
  −1.222,75 → −322,75 €, exakt die vorab festgelegten +900,00 €, elf Monate um 0,00 €.
- **`BF-4`** (v2-13) bewegte die Tabelle **nicht** — und das war die Erwartung: Der
  Eingriff wirkt erst, sobald eine gemeinsame Karte ein verknüpftes Fragment hat.
  **Ein grüner Anker beweist in so einem Fall wenig**; der Nachweis kam aus der
  Übungs-Datenbank (1.840,00 → 1.600,00 €). **Am 13.08.2026 hat `BF-4` dann zum ersten
  Mal in Produktion gegriffen** — ohne Migration, ohne Sprint, allein durch die
  Zuordnung dreier Zahlungen.
- **v2-17** (Kategorien) bewegte sie ebenfalls nicht, zusätzlich belegt über
  **byte-identische Prüfsummen** (`md5(pg_get_functiondef(...))`) der vier
  Rechenfunktionen gegen Übungs- **und** Produktiv-Datenbank.

**Übungs-Datenbank:** Anker **2.200,00 €** (März, synthetisch). **Dieser Wert bleibt
ein echter Sollwert** — dort kuratiert niemand, die Daten stehen still. Weicht er ab,
ist die Übungs-Datenbank nicht im erwarteten Zustand: anhalten, nicht migrieren.

**Offene Themen:** `V2/v2_roadmap_konsolidiert.md` — nach **Sprint-Paketen** geordnet;
§0 trägt die Zahlen, §5 löst die alten Buchstaben-Kennungen auf. Stand dort
**25.08.2026, nach v2-29**: **12 offene Pakete · 38 Themen ·
4 Hausaufgaben · 42 offen gesamt · 65 erledigt**. Die Zahlen sind zeilengenau ausgezählt, nicht
geschätzt — das ist dort schon zweimal schiefgegangen.

> **Die Zahl steigt zum zweiten Mal, und beide Male ist das das richtige Ergebnis.**
> **v2-28** hat drei Punkte erledigt (`DA-3`, `ZO-4`, `NAV-1`) und **zwei offene
> eingetragen** (`ZO-5`, `ZO-6`). Beide waren vorher schon da, nur unsichtbar: `ZO-5`
> beschreibt **147 von 553** offenen 2025-Zahlungen, die das Buchungsdatum im Text
> tragen und deshalb **keinen einzigen** Kartenvorschlag bekommen — zum Vergleich: 183
> der 553 haben einen. `ZO-6` ist eine Lücke, die dieser Sprint selbst aufgerissen hat
> (die Händler-Regel zeigt auf einen **Kartennamen**; nach einer Umbenennung greift sie
> still nicht mehr).
>
> **`NAV-1` stand in keinem Paket** — dasselbe Muster wie Performance vor v2-24, nur
> mit umgekehrtem Ausgang: Der Punkt war schon erledigt, als er eingetragen wurde, und
> hat deshalb bewusst **kein** eigenes Paket bekommen. Das Präfix `NAV` ist im
> Kennungs-Register belegt, falls jemand ein Navigations-Thema aufmacht.
>
> **Davor v2-24:** drei Punkte erledigt (`PF-1`, `PF-2`, `PF-4`), zwei offene
> eingetragen, plus ein neues **Paket 17 „Die App reagiert sofort"**. Performance kam
> in der Roadmap vorher **nirgends** vor — null Treffer für „Performance", „Ladezeit",
> „langsam", „Latenz", „Reaktion" —, während die App in Produktion in
> Zeitüberschreitungen lief. **Ein Thema, das nicht in der Liste steht, konkurriert
> unsichtbar mit allem anderen und verliert gegen das, was gerade lauter ist.** Neue
> offene Punkte sind in solchen Fällen **keine Verschlechterung**, sondern das
> Sichtbarwerden von Arbeit, die schon vorher da war.

> **`B2-R` ist erledigt (v2-22).** Die Treiber-Summe lag in Juli und August je einen
> Cent neben `Ist − Plan`; `get_year_deviation_drivers` rundete **je Zeile**, die
> Sparrate-Funktionen erst **am Ende über alles**. Seit v2-22 wird das Ziel aus den
> Rechenfunktionen **geholt** (LL-25) und der Rest auf die betragsgrößte Zeile gelegt.
> **Die Invariante gilt wieder in allen zwölf Monaten exakt.**
>
> **Der Satz, der den Sprint überlebt, weil er eine Falle beschreibt:**
> Die Karten, die den Abstand verursachten, waren **gar nicht sichtbar**. Ein Delta
> von 0,0022 € rundet auf 0,00 und fällt aus der Anzeige — es verschiebt die Summe
> trotzdem. Wer die B2-Invariante prüft und sie um einen Cent verfehlt, sucht den
> Fehler in den **angezeigten** Zeilen und findet ihn nie.
> Ebenfalls gemessen und dabei widerlegt: Das separat gerundete **Gehalts-Delta trägt
> nichts bei** — es ist exakt.

**Paket 1 ist vollständig abgeschlossen.** Alle fünf Befunde vom 04.08.2026 sind
erledigt — `BF-3` und `BF-1` (v2-10), `BF-5` (v2-11), `BF-2` (v2-12), `BF-4` (v2-13).
Damit blockiert **keine Entscheidung mehr Arbeit**: E1, E2 und E3 sind gefallen.

**Die Pakete 2, 3 und 4 sind ebenfalls vollständig abgeschlossen.** `RM-1`/`RM-2`
(v2-10/v2-16), `LQ-1`/`LQ-2` (v2-14/v2-15) und `KAT-1`/`KAT-2`/`KAT-3` (v2-17).
`LQ-3` und `RM-3` gehörten nie dazu — beide liegen in Paket 9, `KAT-4` in Paket 10.

**Paket 5 ist seit v2-21 zum großen Teil gebaut** (`M6` steht auf 🟡, nicht ✅). Die
automatische Zuordnung schlägt für **115 statt 9** offene Zahlungen aus 2026 eine
Karte vor; `ZO-3` (v2-27) und `ZO-4` (v2-28) sind erledigt. **Offen bleiben `ZO-1`,
`ZO-5`, `ZO-6` und der Teil `F2`** — das Vorschlags-Badge in der Rohmasse liegt weiter
hinter `SHOW_SUGGESTION_BADGES = false`.

> **`ZO-5` ist der stärkste bekannte Hebel für die Kuratierung 2025.** **147 der 553**
> offenen Zahlungen tragen das Buchungsdatum im Text
> (`… | VISA Debitkartenumsatz vom 03.01.2026`) — der Name ist bei jeder Buchung ein
> anderer, die Namensähnlichkeit findet deshalb nie einen Treffer. **Keine einzige
> dieser 147 bekommt einen Vorschlag ≥ 0,60**, während es über alle 553 hinweg 183
> sind.
>
> **Die Lösungsrichtung steht schon in den Daten:** Vor v2-28 waren es 191 von 618 —
> die Händler-Regel `ZO-4` hat **44 davon mit erledigt**, weil sie über den
> **Händlernamen** erkennt statt über Namensähnlichkeit. Nicht die
> Ähnlichkeitsfunktion reparieren, sondern den **stabilen** Teil des Textes vom
> veränderlichen trennen.

> ### ⚠️ Die alte Ursachen-Diagnose war falsch — hier stand sie bis zum 15.08.2026
>
> Der Satz lautete: *„Ursache ist die Split-Systematik — ‚Miete' plant 1.904 €,
> überwiesen werden 1.089,26 €, und `calculate_match_confidence` gewichtet
> `amount_match` mit 0,30; 43 % Abweichung reichen nie für die 95-%-Schwelle."*
>
> **Gemessen stimmt das nicht.** Die 72 Zahlungen, die im toten Band 0,50–0,60 direkt
> unter der Schwelle klemmten, hatten einen Betrags-Score von **1,00** — perfekt
> getroffen. Sie scheiterten am **Namen**. Die wirklichen Ursachen waren drei andere:
> `frequency_match` liefert immer `1.00` und macht die Schwelle ohne Namenstreffer
> rechnerisch unerreichbar (§6 Stolperfalle 17); die Namensfunktion verglich ganze
> Zeichenketten statt Wörter; und die Konfidenz wurde **nur beim Import** berechnet.
>
> **Der Fehler wäre teuer geworden:** Eine Sitzung, die der alten Diagnose gefolgt
> wäre, hätte an `amount_match` und der Split-Behandlung gearbeitet — und die 72
> Zahlungen mit perfektem Betrag nicht bewegt. Die Beobachtung „von 76 gemeinsamen
> Monatszahlungen sind zwei zugeordnet" war richtig; nur ihre Erklärung nicht.
> Deshalb steht sie hier als **korrigierte** Fassung und nicht bloß gelöscht.

**Die 20 unzugeordneten Gehalts-Fragmente** (2025 alle zwölf, 2026 Januar bis Juli)
bleiben bestehen: Sie sind kein Zuordnungsproblem, sondern ein Datenproblem für 2025
(`DA-1`, Paket 6) — dort ist keine Karte aktiv, es gibt also nichts vorzuschlagen.

**Weiterhin offen, für eine eigene Gestaltungsrunde:** `M2` (Verben und Gesten des
Karten-Lebenszyklus) und `M5` (Reihenfolge). **`M5` hat seit v2-17 einen Ort** —
`card_categories.sort_order` ist änderbar, ohne dass eine Migration nötig wird.

**Der Escape-Handler-Rückstand aus `sprints/sprint_v2-10_offene_fragen.md` §6 ist
geschlossen.** Das Einkommens-Popup hat seit v2-16 einen (`income-split/index.tsx`);
in v2-17 nachgeprüft, weil dieser Sprint dasselbe Popup an einer **zweiten** Stelle
öffnet (Netto-Kachel im Einkommens-Ordner). Alle Overlays haben jetzt einen.
