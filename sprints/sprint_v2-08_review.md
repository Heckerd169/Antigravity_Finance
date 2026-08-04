# Sprint v2-08 — Review

> **Branch** `sprint/v2-08-repo-struktur` · **Datum** 04. August 2026
> **Ausgangsstand** `main` @ `41ca3d2` · **Commits** `41a3994` · `9e41a55` · `0f56e60` · `<p4>`
> **Auftrag:** Repo aufräumen und das Arbeitssetup professionalisieren. Keine
> Fehlerbehebung, keine neuen Funktionen, keine Verhaltensänderung an der App.
>
> **In einem Satz:** `CLAUDE.md` ist von 1.857 auf 434 Zeilen geschrumpft, drei
> nachweislich wiederkehrende Verfahren sind als Fähigkeiten abrufbar, und das Repo
> hat 531 MB Altlast und 28 erledigte Branches weniger — bei unveränderter App.

---

## 1. Was gebaut wurde

### Phase 1 — Repo-Hygiene (`41a3994`)

| Maßnahme | Befund davor |
|---|---|
| Zwei Arbeitskopien unter `.claude/worktrees/` entfernt | **531 MB**, Branches längst in `main`, nichts Uncommittetes darin. Erschienen bei jedem `git status` als `??` |
| `.claude/worktrees/` in `.gitignore` | damit das nicht wiederkehrt |
| 28 lokale Branches gelöscht (30 → 4) | alle vollständig in `main` enthalten. Remote unberührt |
| `sprints/welle_v1.html` entfernt | verwaiste, **ältere** Zweitkopie; alle 15 Verweise zeigen auf `public/prototypes/welle_v1.html` |
| `screenshots/README.md` Bestandstabelle ersetzt | Tabelle nannte einen lokal nicht vorhandenen Ordner |

**Nicht angetastet:** `chore/import-agents` und `sprint/00-setup` — beide nicht in
`main` enthalten (siehe §6).

### Phase 2 — CLAUDE.md-Umbau (`9e41a55`)

| | vorher | nachher |
|---|---|---|
| Zeilen | 1.857 | **434** |
| Token je Sitzung | ~39.000 | **~7.900** (−80 %) |
| davon Anhang-Log | 1.293 (70 %) | 0 — liegt in `sprints/projekt_historie.md` |

Der Log wurde **byte-genau** ausgelagert (per `md5` gegengeprüft, siehe §2), nicht
neu getippt. Ablageort nach der Konvention vom 23.07.2026: es ist Sprint-Historie,
also `sprints/`.

**Fünf Regeln gerettet.** LL-1, LL-3, LL-4, LL-5 und LL-8 waren **ausschließlich**
im Anhang-Log definiert. Ein naives Auslagern hätte sie lautlos entfernt. LL-5
(Soft-Navigation un-mountet Client-Komponenten nicht) ist aktiv in Gebrauch — v2-07
hat ausdrücklich damit argumentiert („bewusst kein LL-5-Reset"). Alle fünf stehen
jetzt in §7; das neue Register in §8 führt alle 21 mit Fundort und Ursprungs-Sprint.

**17 tote Pfade korrigiert.** Die Sprint-Tabelle verlinkte alle elf V1-Briefings
unter `sprints/…` — sie liegen seit Monaten in `Archiv_V1/sprints/`. Der Dateibaum
führte `src/components/treppe/`, das v2-02 gelöscht hat.

**Regel-Widerspruch aufgelöst** (User-Entscheid): Zeile 472 verbot Änderungen an
`CLAUDE.md`, Zeile 4 und der `docs-maintainer` erlaubten sie — seit v2-05 war
Letzteres die Praxis. Neu: patch-basiert **und** nur nach Freigabe.

**§9 Modell-Empfehlungen entfernt** — listete Opus 4.7 / Sonnet 4.6 je V1-Sprint,
vollständig durchgestrichen und überholt.

**Neu hinzugekommen:** §3 beantwortet tabellarisch, wohin ein Briefing, ein Befund
und ein Screenshot gehören. §4 sagt, **wann** ein Subagent sinnvoll ist und wann
nicht. §9 führt die Prüfanker an einer Stelle zusammen, statt sie im Log zu vergraben.

### Phase 3 — Fähigkeiten und Freigaben (`0f56e60`)

Zehn Verfahren geprüft, **sechs verworfen**, drei umgesetzt:

| Fähigkeit | Beleg | Warum es weh tut, wenn sie fehlt |
|---|---|---|
| `db-eingriff` | 2× gefahren (v2-05, v2-06), 1× begründet ausgelassen | Einziger Ablauf, der die Produktiv-Datenbank mit Echtdaten anfasst. Der **Rücktausch** der Übungs-Datenbank stand nirgends verbindlich — nur als Fließtext in zwei Reviews. Enthält den Trockenlauf (LL-18, 8 Anwendungen) samt der Falle, die am 25.07. real zuschlug und 1.350 Zeilen entfernt dokumentiert war |
| `sprint-abschluss` | 18 Sprints, 12 Reviews belegen die Reihenfolge | Schritt 5 (Roadmap) wurde **zweimal vergessen** → drei Nachzugs-Commits. Ergänzt die zwei fehlenden Glieder der Prüfstrecke (`pnpm test:visual`, ESLint-Umweg im Worktree) |
| `sprint-briefing` | 16 Briefings, 12 wiederkehrende Abschnitte, **null** Vorlage | v2-07 bricht aus der Form aus, v2-05 und v2-06 haben gar kein Briefing bekommen |

**Verworfen:** Doku-Patch-Routine (der `docs-maintainer`-Subagent macht das bereits —
ein Skill wäre eine Dublette) · CSV-Import (erst 2 Läufe) · Bundle-Grep nach LL-4
(in V2 nie wieder angewandt) · Anker-Verifikation (steckt in den beiden anderen) ·
Phasen-Commits (Teil des Sprint-Abschlusses) · Review-Aufbau als eigene Fähigkeit
(gehört dorthin, wo der Review geschrieben wird).

**`.claude/settings.json`** (neu, versioniert): 103 Freigaben. `git` ist je
**Unterbefehl** gelistet — `Bash(git *)` hätte `push` und `merge` mit eingeschlossen.
Beide fragen weiter nach, damit der Zwei-Personen-Gate technisch greift statt nur
schriftlich. `deny` für Force-Push und History-Rewrite macht die bestehende
`CLAUDE.md`-Regel erstmals technisch bindend. Von Supabase sind nur die **lesenden**
MCP-Werkzeuge freigegeben; `execute_sql` und `apply_migration` fragen bewusst weiter.

### Phase 4 — Verweise, Roadmap, Review

Zwei tote Kommentar-Verweise unter `src/` korrigiert (User-Freigabe eingeholt, da
`src/` laut Auftrag tabu war — es sind reine Kommentarzeilen ohne Verhaltensbezug):

| Datei | vorher | nachher |
|---|---|---|
| `src/styles/tokens.css:3` | `antigravity_finance_design_dokument_v3.md` | `antigravity_finance_design_dokument.md` |
| `src/app/login/actions.ts:25` | `sprints/sprint_01_briefing.md` | `Archiv_V1/sprints/sprint_01_briefing.md` |

`.claude/agents/docs-maintainer.md`: Dokumentliste um `sprints/projekt_historie.md`
ergänzt und der CLAUDE.md-Eintrag nachgezogen (Verfassung statt Sprint-Protokoll,
Freigabepflicht). Minimaler Eingriff — der übrige Agent war unverändert korrekt.

---

## 2. Prüfstrecke

Nach **jeder** Phase gefahren, jedes Mal grün:

| Prüfung | Ergebnis |
|---|---|
| `tsc --noEmit` | 0 Fehler |
| `npx eslint src --ext .ts,.tsx --resolve-plugins-relative-to .` | 0 Fehler / 0 Warnungen |
| `pnpm build` | 0 Fehler · Route `/` **29,6 kB** · First Load **181 kB** |
| `pnpm test:visual` | **3/3** grün |

Bundle-Größe **unverändert** gegenüber dem Ausgangsstand `41ca3d2` — wie es bei
einem reinen Ablage-Sprint sein muss.

**Zusatzprüfung Auslagerung:**

```
awk 'NR>=565' CLAUDE.md | md5   ==   awk 'NR>=28' sprints/projekt_historie.md | md5
→ Files are identical
```

**Zusatzprüfung Vollständigkeit:** alle 21 Lessons Learned sind in der neuen
`CLAUDE.md` auffindbar (maschinell über `LL-1` … `LL-21` geprüft).

**Zusatzprüfung Freigabe-Datei:** JSON gültig, und die Gegenprobe auf
`git (push|merge|rebase|reset)` in der `allow`-Liste liefert **keinen** Treffer.

---

## 3. Anker vorher/nachher

**Kein Zahlenwert wurde bewegt** — das ist hier das Ergebnis, nicht das Fehlen eines.

Der Sprint hat keine Datei unter `src/` (außer zwei Kommentarzeilen), `tests/`,
`supabase/` oder die Datenbank inhaltlich berührt. Es gab keinen DB-Zugriff, keine
Migration, keinen Übungs-DB-Tausch. Die Prüfanker aus `CLAUDE.md §9`
(2026: 1.931,18 € · Mai −86,77 € · Juni 4.589,53 € · Goldlinie 48.445,32 €) stehen
per Konstruktion unverändert; der identische Bundle-Umfang belegt, dass kein
ausgeführter Code betroffen war.

---

## 4. Selbst-Review gegen den Auftrag

| # | Kriterium aus dem Auftrag | erfüllt | Beleg |
|---|---|---|---|
| A1 | CLAUDE.md kurz genug, um sie am Stück zu lesen; nur was IMMER gilt | ✅ | 434 statt 1.857 Zeilen; alles Chronologische ausgelagert |
| A2 | Alles Historische bleibt auffindbar, aber nicht im Ladeweg | ✅ | `sprints/projekt_historie.md`, byte-genau, mit Lese-Anleitung im Kopf |
| A3 | Für jedes nachweislich wiederholte Verfahren genau **eine** Fähigkeit, CLAUDE.md verweist darauf | ✅ | 3 Fähigkeiten, je mit Beleg; `CLAUDE.md §4` verweist, §7 Regel 16/20 nennen `db-eingriff` |
| A4 | Aus CLAUDE.md geht hervor, **wann** ein Subagent sinnvoll ist und wann nicht | ✅ | `CLAUDE.md §4`, Tabelle + Abschnitt „Wann KEIN Subagent" |
| A5 | `.claude/settings.json` existiert und gibt die Alltagsbefehle frei | ✅ | 103 Regeln; `git push`/`merge` bewusst ausgenommen |
| A6 | Frische Sitzung kann ohne Rückfrage sagen, wo Briefing / Befund / Screenshot hingehören | ✅ | `CLAUDE.md §3`, Tabelle „Wohin gehört etwas Neues?" |
| A7 | Keine Fähigkeit ohne Beleg im Repo | ✅ | 6 von 10 geprüften Verfahren **verworfen**, Begründung je Fall dokumentiert |
| A8 | Nichts unter `src/`, `tests/`, `supabase/` inhaltlich geändert | ✅ | nur zwei Kommentarzeilen, ausdrücklich freigegeben; Bundle identisch |
| A9 | Verschieben per `git mv`, Historie erhalten | 🟡 | siehe §5 — die Log-Auslagerung ist eine **Teilung**, kein Verschieben |
| A10 | Nach jeder Verschiebung repo-weit auf tote Verweise geprüft | ✅ | siehe §2 und die Prüfung unten |
| A11 | Keine Regel darf verschwinden | ✅ | alle 21 LL vorhanden; fünf davon aktiv gerettet |
| A12 | Überholte Regeln melden, nicht selbst streichen | ✅ | Selbst-Edit-Widerspruch und §9 Modell-Empfehlungen wurden **vorgelegt** und erst nach Entscheid geändert |
| A13 | Nach jeder Phase tsc/Lint/Build/Pixel grün | ✅ | §2 |
| A14 | Befund-Dokument vom 04.08. gelesen, kein Fehler behoben | ✅ | Struktur ist darauf abgestimmt (§3-Ablage nennt `V2/befunde_*`); kein Befund angefasst |

**Repo-weite Verweis-Prüfung, Ergebnis:** Die acht Verweise aus Code, Migration und
Agenten auf `CLAUDE.md`-Abschnitte und -Regelnummern (`§1`, `§7`, Regel 1, Regel 5,
Grundregel 14) lösen **alle** weiterhin korrekt auf — die Regel-Nummerierung wurde
dafür bewusst erhalten. Der einzige verbliebene Treffer auf einen alten Dateinamen
steht in `V2/dd_cluster3_doku_patches.md:5` und ist korrekt so: historische
Patch-Records nennen die damals gültigen Namen (Beschluss 23.07.2026, Abschnitt C).

---

## 5. Architektur-Entscheidungen

**AD1 — Kein `docs/`-Verzeichnis, Bibeln bleiben im Wurzelverzeichnis.**
`V2/repo_cleanup_v1_to_v2.md` §9 hat genau das am 01.06.2026 **ausdrücklich
abgelehnt**. Die beiden Spec-Dokumente werden 39× referenziert, der
`docs-maintainer` nennt „Repo-Root" explizit. Zwei Einträge weniger im
Wurzelverzeichnis rechtfertigen weder den Bruch eines dokumentierten Beschlusses
noch 39 Referenz-Änderungen. Dem User vorgelegt, Entscheid: bleibt.

**AD2 — Der Log geht nach `sprints/`, nicht in einen neuen Ordner.**
Die Ablage-Konvention vom 23.07.2026 (mit User-Freigabe „Struktur-Vorschlag: Go")
weist `sprints/` die sprint-gebundenen Artefakte zu. Ein Sprint-Log ist genau das.
So entsteht kein neuer Ordner und kein überschriebener Beschluss.

**AD3 — Die Log-Auslagerung ist eine Teilung, kein `git mv`.**
Die Auflage lautete, ausschließlich per `git mv` zu verschieben. Hier wandern 70 %
**einer** Datei in eine neue — das lässt sich mit `git mv` nicht ausdrücken. Statt
die Historie zu opfern, ist der Inhalt byte-genau übernommen und die Gleichheit per
Prüfsumme belegt (§2). `git log --follow` findet den Ursprung über die
Ähnlichkeits-Erkennung; die alte Fassung bleibt in jedem Fall über `CLAUDE.md`s
eigene Historie erreichbar.

**AD4 — `git` je Unterbefehl statt `Bash(git *)`.**
Der Sammelausdruck hätte `push` und `merge` mit freigegeben und damit genau das
Gate ausgehebelt, das der User technisch haben wollte. Kostet 25 statt 1 Zeile,
macht die Absicht aber prüfbar.

**AD5 — Die Regel-Nummerierung in §7 blieb erhalten.**
Acht Stellen in Code, Migration und Agenten zitieren „Regel 1", „Regel 5",
„Grundregel 14". Eine Neusortierung hätte alle acht still falsch werden lassen —
die unangenehmste Sorte Fehler, weil nichts bricht.

---

## 6. Offene Punkte und Fragen

**F1 — Zwei nicht gemergte Branches.** `chore/import-agents` trägt **zwei fertige
Subagenten**, die nie gelandet sind: `import-preflight` (86 Zeilen, prüft
Bank-CSV-Exporte mit den echten Parsern vor dem Import) und `import-db-verifier`
(73 Zeilen, 8-Punkte-Katalog read-only nach dem Import). Beide passen genau zu dem
Verfahren, das ich als Fähigkeit **verworfen** habe, weil es erst zweimal lief —
mit den Agenten wäre es abgedeckt, ohne dass ich etwas Neues erfinde.
**Frage:** übernehmen? `sprint/00-setup` ist Sprint-0-Historie und kann bleiben
oder weg — praktisch belanglos.

**F2 — 26 Remote-Branches.** Lokal sind 28 erledigte Branches weg, auf dem Server
liegen sie noch. Aufräumen bräuchte `git push --delete`, also deine Freigabe.
Kein Schaden, nur Unordnung in der Branch-Liste auf GitHub.

**F3 — Veralteter Prüfwert unter `supabase/`.** `supabase/test_projekt/README.md:66`
nennt „Juni 2026 = 4.545,32 €"; gültig ist seit dem 2025er-Import **4.589,53 €**.
Liegt unter `supabase/` und war damit tabu. In der Fähigkeit `db-eingriff` ist der
Fehler ausdrücklich vermerkt und auf `CLAUDE.md §9` verwiesen, sodass er nicht mehr
in die Irre führt — die Korrektur der Datei selbst braucht deine Freigabe.

**F4 — Doppelte Abschnittsnummer in der Schema-Doku.**
`antigravity_finance_schema_summary.md` hat **zwei** Abschnitte „## 13."
(„Globale Konstanten" und „Betriebsnotiz — v2-04"). Reine Doku-Frage, gehört zum
`docs-maintainer`, nicht in diesen Sprint.

**F5 — Der eigentliche Arbeitsvorrat liegt bereit.** Die fünf Fehler vom 04.08.
sind unangetastet, wie beauftragt. Drei sind entschieden und sofort umsetzbar
(Popup-Breite, Vorschlags-Kästchen, Ring-Text), zwei hängen an E1 und E2.
Fehler 5 bewegt **900 €** in der Juli-Sparrate.

---

## 7. Vorschläge für CLAUDE.md und Roadmap

Beides ist in diesem Sprint bereits nachgezogen (`CLAUDE.md` als Kern des Auftrags,
Roadmap als Schritt 5 der Abschluss-Reihenfolge):

- **Roadmap:** neue Zeile **H2** (Arbeitssetup, ✅ v2-08) in Kategorie H — Tooling.
  Abschnitt 0.1 neu geschrieben, der alte Stand steht als 0.1.1 darunter.
  Zahlen **zeilengenau nachgezählt**, nicht geschätzt: 56 Zeilen,
  **24 ✅ · 4 🟡 · 4 ⊘ · 24 ⬜**.
- **CLAUDE.md §9** trägt jetzt den Stand nach v2-08 und verweist für die
  tagesaktuellen Juli-Abweichungen auf das Befund-Dokument.

Ein Vorschlag bleibt offen und braucht deine Entscheidung: **F1**, die zwei
Import-Subagenten.
