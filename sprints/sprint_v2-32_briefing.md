# Sprint v2-32 — Briefing

> **Ein sauberer Tisch für das Re-Design**
> Branch `sprint/v2-32-aufraeumen` · Basis `0e8b9fb` · 04. September 2026
> Kein Eingriff in `src/` und `supabase/`. Keine Migration, keine Rechenfunktion.

---

## 1. Warum dieser Sprint

Der User will die Oberfläche der App mit **Fable 5.1** neu gestalten — in einer
**frischen Sitzung mit einem anderen Modell**. Das ist der Anlass, und es ist ein
schärferer Anlass, als er zunächst klingt:

**Eine fremde Sitzung hat nichts als das Repo.** Das Projekt-Gedächtnis liegt unter
`~/.claude/projects/…/memory/`, also **außerhalb von git** — CLAUDE.md §3 sagt das
selbst und nennt es „eine Abkürzung, kein Lager". Was das Re-Design braucht, muss
folglich **im Repo** stehen und **stimmen**. Beides war beim Start dieses Sprints
nicht der Fall.

### Was die Bestandsaufnahme ergeben hat

| # | Befund | Zahl |
|---|---|---|
| ① | Der lokale Arbeitsstand hing hinter `origin/main` zurück | **21 Commits** |
| ② | CLAUDE.md widerspricht sich selbst über den eigenen Stand | 3 Stellen |
| ③ | Änderungen in `main`, die in keiner Führungs-Doku stehen | PR #52, #53 |
| ④ | Tote Arbeitskopien unter `.claude/worktrees/` | **9 · 4.309 MB** |
| ⑤ | Branches, deren PR längst gemergt ist | **49 lokal · 49 remote** |
| ⑥ | CLAUDE.md gegen ihre eigene Wächter-Grenze | **1.509 von 1.600** = 94 % |
| ⑦ | Projekt-Gedächtnis überholt („PR #51 offen" — ist gemergt) | 2 Einträge |

**Befund ② im Wortlaut**, weil er die Fehlerklasse dieses Projekts genau trifft:

| Stelle in CLAUDE.md | Aussage |
|---|---|
| Zeile 11–13 (Kopf) | „nach Sprint **v2-30**" · „Alles bis **v2-30** ist in `main`" |
| Zeile 1176 (§9) | „Letzter Sprint: **v2-31**" |
| Zeile 1182 | „**v2-31 liegt als Pull Request vor und ist NICHT gemergt.**" |

Tatsächlich sind **#51, #52 und #53 gemergt**; es ist **kein PR offen**. Das ist
**LL-30 in seiner allgemeinen Form** — derselbe Wert an zwei Stellen, und an einer
davon veraltet er, ohne dass jemand sich geirrt hätte. Die Datei warnt davor in einem
eigenen Kasten (§9, „Warum diese Zeile keine Versionsnummern mehr trägt") und ist der
Warnung dann selbst zum Opfer gefallen — an einer anderen Zeile.

---

## 2. Ziel, Nicht-Ziel, Prüfanker

**Ziel (ein Satz):** Der lokale Stand, die Git-Ablage und die vier Führungs-Dokumente
sagen alle dasselbe — und die Verfassung hat wieder Luft, damit Fable 5.1 die Optik
neu gestalten kann, ohne gegen überholte Papiere zu arbeiten.

**Nicht-Ziel — ausdrücklich nicht angefasst:**

- **Kein Byte in `src/` oder `supabase/`.** Keine Migration, keine RPC, keine
  Rechenfunktion, kein Feature.
- **Nicht die Oberfläche neu gestalten.** Das ist das Re-Design selbst; dieser Sprint
  bereitet es nur vor.
- **Keine Archivierung** der 112 Sprint- und 29 V2-Papiere. Vom User verworfen —
  die Regeln dieses Projekts haften an ihren Vorfällen, und ein Vorfall im Archiv
  wird nicht mehr gelesen.
- `Archiv_V1/` bleibt unberührt (§3: wird nicht nachgepflegt).
- **Kein Merge nach `main`.** Bleibt beim Menschen (§4).

**Prüfanker.** Ein reiner Aufräum-Sprint bewegt keine Zahl — und das ist ein
vollwertiges Ergebnis, kein fehlendes (`sprint-start`, Pflichtfrage 3):

| # | Anker | Sollwert |
|---|---|---|
| A1 | `git diff origin/main -- src/ supabase/` | **leer** |
| A2 | Prüfstrecke | mindestens so grün wie vorher, gleiche Testzahl |
| A3 | `claude-md-umfang.spec.ts` | grün **und ohne Vorwarnung** (< 1.440 Zeilen) |
| A4 | Jede Löschung | einzeln belegt, dass der Inhalt in `origin/main` liegt |
| A5 | Sparraten | **nicht gemessen** — siehe Kasten |

> **Warum A5 bewusst NICHT gemessen wird.** §7 Regel 21 verlangt die
> Zwölf-Monats-Messung vor und nach **jedem Eingriff**. Dieser Sprint berührt die
> Datenbank nicht — dann misst die Regel nichts als das Kuratieren des Nutzers, und
> CLAUDE.md §9 warnt ausdrücklich davor, genau das als Befund zu lesen („Eine
> Abweichung von dieser Tabelle ist der Normalfall, kein Befund"). **A1 ist hier der
> schärfere Anker:** Wo kein Byte Code und kein Byte Datenbank sich ändert, *kann*
> sich keine Zahl bewegen. Das ist eine strukturelle Zusicherung statt einer
> Stichprobe.

---

## 3. Die Entscheidungen des Users (04.09.2026)

| Frage | Antwort | Folge für diesen Sprint |
|---|---|---|
| Was ist das Re-Design? | **Optik neu, Logik bleibt** | Design-Bibel und `design-system/` müssen den heutigen Stand zeigen; Schema und Rechenlogik bleiben unangetastet |
| Wie weit darf das Aufräumen gehen? | **Alles: Git + Doku** | Arbeitskopien, Branches, lokaler Stand und Doku — mit Einzelbeleg je Löschung |
| CLAUDE.md bei 94 %? | **Jetzt kürzen** | Phase P3, Ziel ~1.200 Zeilen über `claude-md-pflege` |
| Zusatz des Users | **„Merke dir, welche Skills oder Agents für solche Routine-Arbeiten sinnvoll sind — z. B. am Sprint-Ende immer die Worktrees löschen."** | Phase P5, und sie ist die inhaltlich interessanteste |

> ### Warum P5 keine weitere Checklisten-Zeile werden darf
>
> **Der Schritt existiert bereits.** `sprint-abschluss` Schritt 9 sagt wörtlich
> *„Temporäre Dateien und Arbeitskopien entfernen"* — als beiläufige Halbzeile am Ende
> eines langen Ablaufs. Er wurde über **neun Sprints hinweg** übersehen, und das
> Ergebnis waren 4,3 GB.
>
> Das ist **LL-40 in Reinform**: *Ein Wächter, von dem niemand weiß, ob er auslösen
> kann, ist eine Zusicherung — keine Prüfung.* Und es ist derselbe Befund wie bei
> `doku-vollstaendigkeit.spec.ts` in v2-28: Der „vergessene Schritt" stand seit v2-08
> **als solcher markiert** in `sprint-abschluss` und wurde trotzdem zweimal übersehen.
>
> **Eine zehnte Checklisten-Zeile hat also eine gemessene Trefferquote von null.**
> P5 baut deshalb etwas, das die Umgebung ausführt statt der Agent — Details dort.

---

## 4. Phasen

Ein Commit je Phase, jede einzeln zurücknehmbar (LL-14).

| # | Was | Dateien | Datenbank |
|---|---|---|---|
| **P0** | Stand herstellen: lokalen `main` nachziehen, Worktree + Branch, dieses Briefing | `sprints/sprint_v2-32_briefing.md` | nein |
| **P1** | Git-Hygiene mit Einzelbeleg je Löschung | Protokoll in diesem Briefing | nein |
| **P2** | Die vier Führungs-Dokumente begradigen | `CLAUDE.md`, `projekt_historie.md`, Roadmap, beide Bibeln | nein |
| **P3** | CLAUDE.md kürzen (`claude-md-pflege`) | `CLAUDE.md` | nein |
| **P4** | Das Re-Design bekommt einen Platz in der Roadmap; `design-system/` gegen den Code geprüft | Roadmap, `design-system/` | nein |
| **P5** | Die Aufräum-Routine dauerhaft machen | `.claude/` | nein |
| **P6** | Prüfstrecke, Review, Gedächtnis, Push, PR | `sprints/sprint_v2-32_review.md` | nein |

**Briefing-Datei: ja.** Zwei der vier Kriterien treffen zu — *mehr als drei Phasen*
und *es hängen Entscheidungen daran, die schriftlich festgehalten werden müssen*
(der Zuschnitt des Re-Design-Pakets und die Bauart der Aufräum-Routine).

**`design-direktor`: nein** — in diesem Sprint wird nichts entschieden, das man sehen
kann. Das Re-Design selbst braucht ihn; es ist nicht dieser Sprint.
**`db-eingriff`: nein** — die Datenbank wird nicht berührt.

---

## 5. Prüfschritte

| # | Schritt | Erwartung |
|---|---|---|
| S1 | `git diff origin/main -- src/ supabase/` | leer |
| S2 | `pnpm exec tsc --noEmit` | 0 Fehler |
| S3 | ESLint | 0 Fehler (Umweg im Worktree beachten, `sprint-abschluss` §64) |
| S4 | `pnpm build` | erfolgreich |
| S5 | `pnpm test:visual` | alle Logik-Wächter grün, Zahl wie vorher |
| S6 | `claude-md-umfang.spec.ts` | grün **ohne** Vorwarnung |
| S7 | `doku-vollstaendigkeit.spec.ts` | grün — er prüft genau das, was P2 begradigt |
| S8 | `git status` | leer, keine `??` |

---

## 6. Offene Fragen

- **Die eingefrorene Sollwert-Tabelle.** Die Bedingung dafür ist seit dem 31.08.2026
  erfüllt (Kuratierung durch, 0 offene Zahlungen in beiden Jahren). CLAUDE.md §9 sagt,
  sie komme zurück, „sobald der Nutzer es freigibt". **Dieser Sprint zieht sie nicht** —
  er berührt die Datenbank nicht und dürfte deshalb keine Messung als Sollwert
  einfrieren, die er nicht selbst erhoben hat. Gehört in den ersten Sprint, der wieder
  misst.
- **Ob das Re-Design ein eigenes Paket oder mehrere braucht**, entscheidet sich in P4
  aus dem, was `design-system/` gegen den heutigen Code hergibt.

---

## 7. Protokoll P1 — was gelöscht wurde, und wie es zurückkommt

**Regel dieses Sprints:** Es wird nichts gelöscht, dessen Inhalt nicht vorher in
`origin/main` **belegt** wurde. Die Belege stehen unten, damit sie eine Prüfung sind
und keine Zusicherung (LL-40).

### 7.1 Die neun Arbeitskopien

Vor der Löschung geprüft: ungesicherte Änderungen, Stashes, Enthaltensein in
`origin/main`. **Alle neun waren restlos sauber.**

| Arbeitskopie | Branch | ungesichert | Stash | HEAD in `origin/main` |
|---|---|---|---|---|
| `befunde-sparraten-abgleich` | `worktree-befunde-sparraten-abgleich` | 0 | 0 | ja |
| `sprint+v2-29-haendler-gedaechtnis` | `docs/claude-md-v2-29` | 0 | 0 | ja |
| `sprint+v2-30-zuordnung-tempo` | `docs/v2-30-abschluss` | 0 | 0 | ja |
| `sprint-v2-27` | `sprint/v2-27-2025-vergleichbar` | 0 | 0 | ja |
| `sprint-v2-28` | `docs/claude-md-v2-28` | 0 | 0 | ja |
| `sprint-v2-31-verlauf` | `sprint/v2-31-verlauf` | 0 | 0 | ja |
| `v2-19-gehalt` | `sprint/v2-20-papierkorb-loeschen` | 0 | 0 | ja |
| `v2-21-zuordnung` | `docs/stand-nach-smoke` | 0 | 0 | ja |
| `visa-import-grosse-datei` | `fix/visa-import-grosse-datei` | 0 | 0 | ja |

**Freigegeben: 4.309 MB.**

> ### ⚠️ Die Prüfung, die fast vergessen worden wäre — und schon einmal weh tat
>
> `git status` zeigt **gitignorierte** Dateien nicht an. Eine saubere Statusmeldung
> ist deshalb **kein** Beleg dafür, dass in einer Arbeitskopie nichts Wichtiges liegt:
> `.env.local` und `.env.e2e.local` sind gitignoriert und wären **lautlos**
> mitgelöscht worden.
>
> CLAUDE.md §4 beschreibt genau diesen Vorfall — zwischen v2-10 und v2-15 sind die
> beiden Dateien so verschwunden, und die Folge war, dass der angemeldete
> Render-Smoke ersatzlos entfiel und `pnpm build` am Prerender von `/onboarding`
> abbrach.
>
> **Deshalb vor der ersten Löschung gemessen:** beide Dateien liegen im
> Haupt-Checkout, und alle acht Worktree-Kopien waren **byte-identisch**
> (`md5 c45fcf5c…` bzw. `13ffb9ae…`). Erst danach wurde gelöscht.

### 7.2 Die Branches — 98 gelöscht, 2 behalten

**Lokal 49 → 1, remote 49 → 1.** Von den 49 lokalen ließen sich **47** mit
`git branch -d` entfernen; dieser Befehl verweigert von sich aus alles, was nicht
enthalten ist, und ist damit selbst ein Beleg.

**Die verbleibenden Zweifelsfälle wurden einzeln aufgelöst** — `git cherry` meldet bei
einem Squash-Merge fälschlich „fehlt in main", weil sich die Patch-ID ändert:

| Branch | Verdacht | Beleg, dass der Inhalt in `main` liegt |
|---|---|---|
| `docs/projekt-historie-nachzug` | *„Wächter gegen Lücken in der Projekt-Historie"* — ein nie gemergter Wächter wäre ein echter Verlust | `tests/e2e/doku-vollstaendigkeit.spec.ts` liegt **byte-identisch** in `origin/main` |
| `sprint/v2-24-performance` | Die Dublin-Region (`PF-4`) | `vercel.json` in `origin/main` enthält exakt `{"regions": ["dub1"]}` |
| `sprint/v2-11-vorzeichen` | 1 Commit | `git cherry` markiert ihn mit `-` = Patch liegt in `main` |
| `sprint/v2-23-zuordnung` | 1 Commit | dito |
| `origin/sprint/v2-20-papierkorb-loeschen` | 1 Commit | ist ein **Merge-Commit von PR #31** und berührt **keine einzige Datei** |
| `docs/nachzug-nach-v2-13` | `-d` verweigert | ist Vorfahre von `origin/main` **und** von `HEAD`; verweigert wurde nur wegen des weiter gelaufenen Remote-Gegenstücks |

> **Eine Stolperfalle, die zwei Minuten gekostet hat und beim nächsten Mal teurer wäre.**
> `git for-each-ref --format='%(refname:short)' refs/remotes/origin` kürzt
> `refs/remotes/origin/HEAD` auf **`origin`** — ein Filter auf `^origin/(main|HEAD)$`
> lässt ihn also durch. In der Löschliste stand dadurch ein Eintrag namens `origin`;
> ein `git push origin --delete origin` hätte den gesamten Stapel scheitern lassen.
> **Abhilfe:** über `%(refname)` gehen und `refs/remotes/origin/` selbst abschneiden.

### 7.3 Rückhol-Liste

Jeder gelöschte Branch ist mit **einem** Befehl wiederherstellbar:

```bash
git branch <name> <sha>                       # lokal
git push origin <sha>:refs/heads/<name>       # remote
```

#### Remote-Branches (49)

| Branch | SHA | Spitze in origin/main |
|---|---|---|
| `docs/claude-md-nach-v2-11` | `7589f5f7c2fa0dea23a068a899642c4c7c86d97a` | ja |
| `docs/claude-md-nachzug-v2-10` | `970ac7e246ff219dc5db6c5cf520eb4ac97817bc` | ja |
| `docs/claude-md-v2-28` | `9f684d0dbe6fc1e79eabca97288efa664ac7d135` | ja |
| `docs/claude-md-v2-29` | `51c88b129f22db3593e0cc9fbc9012369020b275` | ja |
| `docs/dd-runde-2026-08-06` | `b4fd41934796cf146e0352af46c88e5044d95ce0` | ja |
| `docs/dd-runde-2026-08-17` | `c660ec9cb97281c6af83dc1c5a7d15a45ed970a8` | ja |
| `docs/e1-entscheidung` | `c0bab4b03e79c22a4d0dc6d21b4af131a15843e5` | ja |
| `docs/e2-entscheidung` | `2e1d170cea980d681486311082205f9ff84e35de` | ja |
| `docs/nachzug-nach-v2-13` | `b3b000f2aabc0b0816961f782d876ed43b6e0031` | ja |
| `docs/projekt-historie-nachzug` | `ebaadb49527a07c6ae2ad4331ec16bcac255376a` | Squash-Rest (Inhalt belegt) |
| `docs/stand-nach-smoke` | `1e69d6147bf6c7eb714ddf2e0fe818a43939817d` | ja |
| `docs/tp1-abhaken` | `2cfd18fae111c0a1ee61217e73396b72270d10a5` | ja |
| `docs/v2-15-nachzug` | `8cfa568057e6524ebf21def095232be1a7b6d609` | ja |
| `docs/v2-30-abschluss` | `5a170f5524da14f51626f9b6e042f49a118fd915` | ja |
| `fix/kategorie-menue-unsichtbar` | `dbddd4d382d369f025d79acd08f626d2e4a77671` | ja |
| `fix/visa-import-grosse-datei` | `b0123f17149d01cbba738f48638e8edbb9426d97` | ja |
| `skill/eroeffnungs-prompt` | `2bb6408111d5ff361166295b2870cdb643866c35` | ja |
| `skill/sprint-start-plan-pflicht` | `be08ab1cb79e5c0f8bc43e8ed7609e77fa7a6c80` | ja |
| `sprint/v2-10-fehler-und-lesbarkeit` | `357487e4aaa3a1aafdd2ab391254df1ab28f88bb` | ja |
| `sprint/v2-11-vorzeichen` | `051a9e420d5516b3bef45e0b34f959cff9593069` | Squash-Rest (Inhalt belegt) |
| `sprint/v2-12-ring-subzeile` | `f5e6823a9b0325624d2e355a7e7dbe2216c91051` | ja |
| `sprint/v2-13-bau` | `ccb649313488e8ec60c279ea7d084dac038bcb9f` | ja |
| `sprint/v2-13-gemeinsame-karten` | `a61352c74fe9977cb26ad02a708d39ecbead48f0` | ja |
| `sprint/v2-14-faelligkeitstag` | `9e7830353dde0f5c0c07fb2b98cd68bf37d07a23` | ja |
| `sprint/v2-15-liquiditaet` | `18b74fbb4f6cfb0d744d1d62612527f6283dd5ea` | ja |
| `sprint/v2-16-schaufenster-konsequenz` | `0f6d55b9c2accd22ccc4169f96dfab2d0f9702d0` | ja |
| `sprint/v2-17-kategorien` | `bd0dc78d68b46904c1b723e330d51241d910a39d` | ja |
| `sprint/v2-18-nutzungsbefunde` | `39e01c823314d52c31ff63a863620d75120f4563` | ja |
| `sprint/v2-19-gehalt` | `c1e0a7ce0c08fc02bf86603676745273477ef1f1` | ja |
| `sprint/v2-20-papierkorb-loeschen` | `3ada09576f8e01b97eef6f7d322c429135748ba9` | Squash-Rest (Inhalt belegt) |
| `sprint/v2-21-zuordnung` | `509dc0a444bb767bf304f0eb0fc8b56dc724f3eb` | ja |
| `sprint/v2-22-cent-und-pruefbarkeit` | `f1489033a11eb7f949c52d5523421cb4aaad9fef` | ja |
| `sprint/v2-23-zuordnung` | `276a889d008d4d86295d2088dd15615b276c26a6` | Squash-Rest (Inhalt belegt) |
| `sprint/v2-24-nachtrag` | `c660ec9cb97281c6af83dc1c5a7d15a45ed970a8` | ja |
| `sprint/v2-24-performance` | `6f70097a18dfbc7e8097bfc0ebed17e7ab319ba3` | Squash-Rest (Inhalt belegt) |
| `sprint/v2-25-loeschen` | `4026cb2b0df22135a0ee7abc88905948870df9bc` | ja |
| `sprint/v2-26-nachbesserungen` | `72ce39ca82a9b38efa1d344a68ba6add8280f239` | ja |
| `sprint/v2-27-2025-vergleichbar` | `ed769b8cc505a2dd94f794f0f48c2f6de0297dca` | ja |
| `sprint/v2-28-2025-korrekturen` | `e26a45752075c376fe4874cf658e4b4fb4676d9e` | ja |
| `sprint/v2-29-haendler-gedaechtnis` | `7f0ef3b00342d61926d1134e6fe34012c8657377` | ja |
| `sprint/v2-30-zuordnung-tempo` | `039903fbe304e51a6cb78aec932cd118003591f7` | ja |
| `sprint/v2-31-verlauf` | `dc0b97d1a04b40f364a4b19114017a10b00856cc` | ja |
| `sync/v2-21-v2-22-und-historie` | `9a349d09d5f5a84c3f2d7fd5229041c1683cb3da` | ja |
| `test/liquiditaet-regel` | `5d616ed170fb1406fc856b621261c4b8a419ee77` | ja |
| `worktree-anker-invarianten` | `4efdac4688b4e96cdfe7e5ffbcfb0f67cfa91935` | ja |
| `worktree-befunde-sparraten-abgleich` | `75dd2eb0dac06872afd5a10baa8776625f913993` | ja |
| `worktree-dd-paket4-kategorien` | `fd0b7d33e5c7f4b1830195c916cd5273b7103c97` | ja |
| `worktree-roadmap-rohmasse` | `6cab0b11edbdebd75b64c127352f314730557bec` | ja |
| `worktree-v2-19-briefing` | `7a4e2c1a567e47c083f820440346b16920d2eb22` | ja |

#### Lokale Branches (49)

| Branch | SHA | in origin/main |
|---|---|---|
| `docs/claude-md-nach-v2-11` | `7589f5f7c2fa0dea23a068a899642c4c7c86d97a` | ja |
| `docs/claude-md-nachzug-v2-10` | `970ac7e246ff219dc5db6c5cf520eb4ac97817bc` | ja |
| `docs/claude-md-v2-28` | `9f684d0dbe6fc1e79eabca97288efa664ac7d135` | ja |
| `docs/claude-md-v2-29` | `51c88b129f22db3593e0cc9fbc9012369020b275` | ja |
| `docs/dd-runde-2026-08-06` | `b4fd41934796cf146e0352af46c88e5044d95ce0` | ja |
| `docs/dd-runde-2026-08-17` | `c660ec9cb97281c6af83dc1c5a7d15a45ed970a8` | ja |
| `docs/e1-entscheidung` | `c0bab4b03e79c22a4d0dc6d21b4af131a15843e5` | ja |
| `docs/e2-entscheidung` | `2e1d170cea980d681486311082205f9ff84e35de` | ja |
| `docs/nachzug-nach-v2-13` | `1e37dc181ba4b992d448359619a8136c55477c09` | ja |
| `docs/projekt-historie-nachzug` | `ebaadb49527a07c6ae2ad4331ec16bcac255376a` | Squash-Rest, Inhalt belegt |
| `docs/stand-nach-smoke` | `1e69d6147bf6c7eb714ddf2e0fe818a43939817d` | ja |
| `docs/tp1-abhaken` | `2cfd18fae111c0a1ee61217e73396b72270d10a5` | ja |
| `docs/v2-15-nachzug` | `8cfa568057e6524ebf21def095232be1a7b6d609` | ja |
| `docs/v2-30-abschluss` | `5a170f5524da14f51626f9b6e042f49a118fd915` | ja |
| `fix/kategorie-menue-unsichtbar` | `dbddd4d382d369f025d79acd08f626d2e4a77671` | ja |
| `fix/visa-import-grosse-datei` | `b0123f17149d01cbba738f48638e8edbb9426d97` | ja |
| `lesen-e1` | `ed0314cdd0e12bb34a5ceaeaf95cd3c62efc5607` | ja |
| `lesen-e2` | `6202015d3278bb4539a8f17e14b75aa8510d5853` | ja |
| `skill/eroeffnungs-prompt` | `2bb6408111d5ff361166295b2870cdb643866c35` | ja |
| `skill/sprint-start-plan-pflicht` | `be08ab1cb79e5c0f8bc43e8ed7609e77fa7a6c80` | ja |
| `sprint/v2-10-fehler-und-lesbarkeit` | `357487e4aaa3a1aafdd2ab391254df1ab28f88bb` | ja |
| `sprint/v2-11-vorzeichen` | `051a9e420d5516b3bef45e0b34f959cff9593069` | Squash-Rest, Inhalt belegt |
| `sprint/v2-12-ring-subzeile` | `f5e6823a9b0325624d2e355a7e7dbe2216c91051` | ja |
| `sprint/v2-13-bau` | `ccb649313488e8ec60c279ea7d084dac038bcb9f` | ja |
| `sprint/v2-13-gemeinsame-karten` | `a61352c74fe9977cb26ad02a708d39ecbead48f0` | ja |
| `sprint/v2-14-faelligkeitstag` | `9e7830353dde0f5c0c07fb2b98cd68bf37d07a23` | ja |
| `sprint/v2-15-liquiditaet` | `18b74fbb4f6cfb0d744d1d62612527f6283dd5ea` | ja |
| `sprint/v2-16-schaufenster-konsequenz` | `0f6d55b9c2accd22ccc4169f96dfab2d0f9702d0` | ja |
| `sprint/v2-17-kategorien` | `bd0dc78d68b46904c1b723e330d51241d910a39d` | ja |
| `sprint/v2-18-nutzungsbefunde` | `39e01c823314d52c31ff63a863620d75120f4563` | ja |
| `sprint/v2-19-gehalt` | `c1e0a7ce0c08fc02bf86603676745273477ef1f1` | ja |
| `sprint/v2-20-papierkorb-loeschen` | `4964337dd8bb0e0f9afea94508dbbc1043158fc2` | ja |
| `sprint/v2-21-zuordnung` | `66b65e68eab8c732e985ba3f7cfe455cfed909a3` | ja |
| `sprint/v2-22-cent-und-pruefbarkeit` | `f1489033a11eb7f949c52d5523421cb4aaad9fef` | ja |
| `sprint/v2-23-zuordnung` | `276a889d008d4d86295d2088dd15615b276c26a6` | Squash-Rest, Inhalt belegt |
| `sprint/v2-24-nachtrag` | `c660ec9cb97281c6af83dc1c5a7d15a45ed970a8` | ja |
| `sprint/v2-24-performance` | `762d95682cf8454458e81e0ca3505e40a1ce4481` | Squash-Rest, Inhalt belegt |
| `sprint/v2-25-loeschen` | `4026cb2b0df22135a0ee7abc88905948870df9bc` | ja |
| `sprint/v2-26-nachbesserungen` | `72ce39ca82a9b38efa1d344a68ba6add8280f239` | ja |
| `sprint/v2-27-2025-vergleichbar` | `ed769b8cc505a2dd94f794f0f48c2f6de0297dca` | ja |
| `sprint/v2-28-2025-korrekturen` | `e26a45752075c376fe4874cf658e4b4fb4676d9e` | ja |
| `sprint/v2-29-haendler-gedaechtnis` | `7f0ef3b00342d61926d1134e6fe34012c8657377` | ja |
| `sprint/v2-30-zuordnung-tempo` | `039903fbe304e51a6cb78aec932cd118003591f7` | ja |
| `sprint/v2-31-verlauf` | `dc0b97d1a04b40f364a4b19114017a10b00856cc` | ja |
| `sync/v2-21-v2-22-und-historie` | `9a349d09d5f5a84c3f2d7fd5229041c1683cb3da` | ja |
| `test/liquiditaet-regel` | `5d616ed170fb1406fc856b621261c4b8a419ee77` | ja |
| `worktree-befunde-sparraten-abgleich` | `75dd2eb0dac06872afd5a10baa8776625f913993` | ja |
| `worktree-dd-paket4-kategorien` | `fd0b7d33e5c7f4b1830195c916cd5273b7103c97` | ja |
| `worktree-roadmap-rohmasse` | `6cab0b11edbdebd75b64c127352f314730557bec` | ja |
