# Sprint v2-32 — Review

> **Ein sauberer Tisch für das Re-Design**
> Branch `sprint/v2-32-aufraeumen` · 5 Commits · 04. September 2026
> **Repo und Doku sagen wieder dasselbe — 4,3 GB und 98 Branches sind weg, die
> Verfassung hat wieder Luft, und die Aufräum-Routine kann nicht mehr vergessen
> werden.**

---

## 1. Was gebaut wurde

### P0 + P1 · Stand herstellen und Git-Hygiene — `a71bdda`

**Absicht:** Der lokale Arbeitsstand hing **21 Commits** hinter `origin/main` — zwei
komplette Sprints (v2-30, v2-31) und zwei Fixes. Die CLAUDE.md, die eine neue Sitzung
geladen bekam, war der **v2-29**-Stand.

**Lösungsweg:** Nachgezogen auf `0e8b9fb`. Dann die Git-Hygiene, **nichts gelöscht ohne
Beleg in `origin/main`**:

| | vorher | nachher |
|---|---|---|
| Arbeitskopien unter `.claude/worktrees/` | 9 · **4.309 MB** | 0 |
| Lokale Branches | 49 | **1** (`main`) |
| Remote-Branches | 49 | **1** (`main`) |

Alle 98 SHAs stehen im Briefing; jeder Branch ist mit **einem** Befehl
wiederherstellbar.

**Dateien:** `sprints/sprint_v2-32_briefing.md` (neu, 348 Zeilen — enthält das
vollständige Löschprotokoll).

### P2 · Die vier Führungs-Dokumente auf einen Stand — `081ae3d`

**Absicht:** CLAUDE.md widersprach sich über ihren eigenen Stand.

| Stelle | Aussage | Wirklichkeit |
|---|---|---|
| Kopf, Z. 11–15 | „nach **v2-30**", „Alles bis v2-30 ist in `main`", „PR #48" | überholt |
| §9, Z. 1176 | „Letzter Sprint: **v2-31**" | richtig |
| §9, Z. 1182 | „**v2-31 liegt als Pull Request vor und ist NICHT gemergt**" | **falsch** — #51, #52, #53 sind gemergt |

**Lösungsweg:** Nicht bloß korrigiert, sondern **entdoppelt**. Der Kopf verweist jetzt
auf §9, statt die Aussage zu wiederholen; die PR-Nummern fallen weg. Dazu der fehlende
Historien-Eintrag für den 03.09., die beiden offenen Punkte daraus (`PF-9`,
Hausaufgabe `V1`), der fehlende Schema-Changelog **v3.16.0** und die Kartenzahl
(77 → *zusätzlich* 178 mit Datum).

**Dateien:** `CLAUDE.md`, `sprints/projekt_historie.md`,
`V2/v2_roadmap_konsolidiert.md`, `antigravity_finance_schema_summary.md`,
`sprints/sprint_v2-32_doku_patches.md` (neu).

### P3 · CLAUDE.md verschlanken — `2a86591`

**Absicht:** 1.516 von 1.600 Zeilen (95 %), Vorwarnung des Wächters aktiv.

**Lösungsweg — und hier hat sich die Ausgangsdiagnose als falsch erwiesen:** siehe
§5. Geschnitten wurde ausschließlich **doppelt erzählte Beschreibung**: die
Dublin-Entscheidung (drei Kästen in §2, ein vierter in §3) und **101 Zeilen
nacherzählter Roadmap-Stand** in §9. Dazu **Prüfung ⑤**, die den blinden Fleck
schließt, durch den jene 101 Zeilen überhaupt wachsen konnten.

**Dateien:** `CLAUDE.md`, `tests/e2e/claude-md-umfang.spec.ts`.

### P4 · Paket 19 für das Re-Design — `79cd6f9`

**Absicht:** „Re-Design" hatte in der Roadmap **null Treffer** — derselbe Zustand wie
Performance vor v2-24.

**Lösungsweg:** Neues **Paket 19** mit vier Punkten, deren Zuschnitt aus einer Messung
kommt: Die Design-Doku beschreibt **7** sichtbare Komponenten, `design-system/` zeigt
**3**. Dazu der Roadmap-Vorspann (Kette von neun Sprintständen, −27 Zeilen) und §0
neu ausgezählt.

**Dateien:** `V2/v2_roadmap_konsolidiert.md`, `sprints/sprint_v2-32_doku_patches.md`.

### P5 · Die Aufräum-Routine dauerhaft machen — `70fbd7b`

**Absicht:** Ausdrücklicher Wunsch des Users. **Der Schritt existierte bereits** —
`sprint-abschluss` Schritt 9 seit v2-08 — und wurde über **neun Sprints** übersehen.

**Lösungsweg:** Drei Teile statt einer zehnten Checklisten-Zeile:

1. `.claude/skripte/tote-arbeitskopien.sh` — `melden` · `zeigen` · `entfernen`
2. `SessionStart`-Hook in `.claude/settings.json`, der **meldet und nie löscht**
3. `sprint-abschluss` Schritt 9 trägt jetzt einen **Befehl**

**Dateien:** `.claude/skripte/tote-arbeitskopien.sh` (neu),
`.claude/settings.json`, `.claude/skills/sprint-abschluss/SKILL.md`, `CLAUDE.md`.

---

## 2. Prüfstrecke

| | Ergebnis |
|---|---|
| `tsc --noEmit` | **0 Fehler** |
| ESLint (Worktree-Aufruf) | **0 Fehler / 0 Warnungen** |
| `pnpm build` | **0 Fehler** · Route `/` **40,3 kB** · First Load JS **192 kB** · Middleware **82,1 kB** |
| `pnpm test:visual` | **183 / 183** |
| `pnpm test:e2e` | **192 / 192** — inkl. aller **6** Render-Smoke-Tests |

> ### ⚠️ Die Vergleichszahlen des letzten Reviews taugen hier NICHT als Baseline
>
> Der v2-31-Review nennt `test:visual` **168**, `test:e2e` **177** und Route `/`
> **39,5 kB**. Alle drei sind **nicht** die Zahlen von `origin/main`: Nach jenem Review
> sind **PR #52 und #53** gemergt, und #53 brachte `csv-blockbildung.spec.ts` samt
> `src/lib/csv-batches.ts` mit.
>
> **Statt gegen eine überholte Zahl zu vergleichen, wurde direkt belegt, was dieser
> Sprint hinzugefügt hat:** `claude-md-umfang.spec.ts` hat in `origin/main` **4**
> Testfälle und hier **5**, und **keine andere Datei unter `tests/` ist berührt**
> (`git diff --name-only origin/main -- tests/` liefert genau eine Zeile). Der Zuwachs
> ist also exakt **+1**, wie beabsichtigt.
>
> **Dieselbe Überlegung trägt die Bundle-Größe:** Anker A1 weist **0 Byte** Unterschied
> in `src/` gegenüber `origin/main` nach — der gebaute Bundle *kann* sich also nicht
> von dem unterscheiden, den `origin/main` erzeugt. Die 39,5 → 40,3 kB stammen
> vollständig aus #52/#53.
>
> **Das ist LL-38 in einer neuen Gestalt:** Eine Zahl im Review veraltet mit dem, was
> nach ihr gemergt wird — nicht durch einen Fehler, sondern durch Fortschritt.

---

## 3. Anker vorher/nachher

**Kein Zahlenwert bewegt — und das ist strukturell zugesichert, nicht gemessen.**

| # | Anker | Sollwert | Ergebnis |
|---|---|---|---|
| A1 | `git diff origin/main -- src/ supabase/` | leer | ✅ **0 Zeilen** |
| A2 | Prüfstrecke mindestens so grün wie vorher | keine Regression | ✅ 183 / 192, +1 selbst geschrieben |
| A3 | `claude-md-umfang.spec.ts` grün **ohne Vorwarnung** | < 1.440 Zeilen | ✅ **1.407** (88 %), Vorwarnung weg |
| A4 | Jede Löschung belegt | 100 % | ✅ 9 Arbeitskopien + 98 Branches, je einzeln |

> **Warum die Sparraten NICHT gemessen wurden — und warum das die schärfere Prüfung
> ist.** §7 Regel 21 verlangt die Zwölf-Monats-Messung vor und nach jedem Eingriff.
> Dieser Sprint berührt die Datenbank nicht; die Regel misst dann nur die Kuratierung
> des Nutzers, und CLAUDE.md §9 warnt ausdrücklich davor, genau das als Befund zu
> lesen. **A1 ist die stärkere Zusicherung:** Wo sich kein Byte Code und kein Byte
> Datenbank ändert, *kann* sich keine Zahl bewegen. Das ist ein Beweis, keine
> Stichprobe.

---

## 4. Selbst-Review gegen die Akzeptanzkriterien

| # | Kriterium | erfüllt | Beleg |
|---|---|---|---|
| A1 | Kein Byte in `src/` oder `supabase/` | ✅ | `git diff origin/main -- src/ supabase/` → 0 Zeilen |
| A2 | Nichts gelöscht ohne Beleg in `origin/main` | ✅ | Briefing §7.1–7.3; 47 Branches über `git branch -d` (verweigert selbst), die 6 Zweifelsfälle einzeln aufgelöst |
| A3 | `.env`-Dateien überleben | ✅ | vor der ersten Löschung MD5-verglichen; `c45fcf5c…` / `13ffb9ae…` im Haupt-Checkout |
| A4 | CLAUDE.md unter der Vorwarnschwelle | ✅ | 1.516 → **1.407** (88 %), Regelanteil 50 % → **54 %** |
| A5 | Keine Regel gestrichen | ✅ | §6+§7+§8 **752 → 759** Zeilen — *gewachsen*, während die Datei um 109 schrumpfte |
| A6 | Die Doku widerspricht sich nicht mehr | ✅ | Kopf verweist auf §9; `doku-vollstaendigkeit` 3/3 |
| A7 | Das Re-Design hat einen Platz | ✅ | Roadmap Paket 19, `RD-1`…`RD-4` |
| A8 | Die Aufräum-Routine ist nachweislich auslösbar | ✅ | drei Pfade einzeln rot/grün gesehen — §5 |
| A9 | Prüfstrecke vollständig grün | ✅ | §2 |

---

## 5. Architektur-Entscheidungen

### ① Die Kürzung von CLAUDE.md wäre beinahe falsch ausgeführt worden

**Die Frage an den User lautete:** *„CLAUDE.md steht bei 94 % — jetzt kürzen?"* Er hat
zugestimmt. **Die Frage war schlecht gestellt**, und die Fähigkeit `claude-md-pflege`
sagt genau, warum:

> *„Ist sie allein gerissen, während ② und ③ grün sind, ist die Datei tatsächlich aus
> **Regeln** gewachsen. **Dann ist Kürzen die falsche Antwort.**"*

Gemessen: Zeilen 95 % (eng), **Erzählzone 84 %** (schlank), **Regelanteil 50 %** (über
dem Mindestwert *und* über den 49 % bei Einführung). §6+§7+§8 waren **752 Zeilen** —
„kürzen" hätte hier bedeutet, Regeln wegzuwerfen und mit ihnen die Vorfälle, an denen
sie haften.

**Die echte Alternative** war also nicht *kürzen oder nicht*, sondern *was*. Geschnitten
wurde ausschließlich doppelt erzählte Beschreibung; **eine Lehre wurde vorher
übertragen** statt gestrichen (der 0,0022-€-Fund aus `B2-R` → §6 Stolperfalle 9).

### ② Der Hook meldet und löscht nicht

**Alternative:** Ein `SessionEnd`- oder `Stop`-Hook, der automatisch entfernt.
**Verworfen:** Eine laufende Sitzung kann in einer Arbeitskopie stehen, deren Branch
bereits gemergt ist — automatisches Löschen zöge ihr den Boden weg. Der Hook ist das
Netz, `sprint-abschluss` Schritt 9 bleibt die Arbeit.

### ③ Die Merge-Aussage wurde entfernt statt korrigiert

**Alternative:** Den Kopf einfach auf v2-31 aktualisieren. **Verworfen:** Dann stünde
derselbe Wert weiter an zwei Stellen, und die nächste Sitzung pflegte wieder eine
davon. CLAUDE.md hat diesen Schluss am 24.08.2026 für die Doku-Versionen bereits
gezogen — hier ist er ein zweites Mal angewandt.

### ④ Die Sprint-Papiere wurden NICHT archiviert

Vom User verworfen (Option C in der Freigabe-Frage), und das ist richtig: Die Regeln
dieses Projekts haften an ihren Vorfällen, und ein Vorfall im Archiv wird nicht mehr
gelesen.

---

## 6. Offene Punkte und Fragen

| | |
|---|---|
| **`RD-1`** | `design-system/` zeigt **3 von 7** sichtbaren Komponenten. Ohne Seite: Header/Timeline, Untere Interaktionszone, Income/Partner-Split, CSV-Import. **Das ist die erste Arbeit des Re-Designs**, nicht die zweite. |
| **`RD-2`** | `typografie.html` enthält **null** `var(--typo-*)` und schreibt px-Werte ab. Heute stimmen sie noch — beim ersten geänderten Token nicht mehr. |
| **`PF-9`** | Der gemessene Datenbank-Hebel vom 03.09. (Juni 2023: 128 ms → 9,8 ms). Eigener kleiner Sprint, §7 Regel 20. |
| **Hausaufgabe `V1`** | Die **2.031** Visa-Zahlungen aus 2020–2024 — importieren oder den Export eingrenzen? |
| **Die eingefrorene Sollwert-Tabelle** | Die Bedingung ist seit dem 31.08. erfüllt (Kuratierung durch). **Dieser Sprint zieht sie bewusst nicht** — er misst nicht und dürfte deshalb keinen Sollwert einfrieren, den er nicht selbst erhoben hat. Gehört in den ersten Sprint, der wieder misst. |
| **Der `SessionStart`-Hook** | Sein Befehl ist gepipet geprüft und das JSON validiert. **Dass er tatsächlich feuert, ist in dieser Sitzung nicht nachweisbar** — er läuft außerhalb dieses Turns. Beim nächsten Sitzungsstart sichtbar; ggf. einmal `/hooks` öffnen, damit die Konfiguration neu geladen wird. |

---

## 7. Vorschläge für CLAUDE.md und Roadmap

**Bereits in diesem Sprint angewendet** (P2–P5, patch-basiert nach §7 Regel 14):
Kopf-Entdopplung, §6 Stolperfalle 9 erweitert, §6 Stolperfalle 18 mit heutiger
Kartenzahl, §9 gekürzt, §3 und §4 um `.claude/skripte/`, Roadmap Paket 19 + `PF-8` +
`PF-9` + Hausaufgabe `V1`, Schema-Changelog v3.16.0.

**Als Vorschlag offen — braucht die Freigabe des Users:**

### Vorschlag 1 · **LL-44** — ein Wächter kennt seine eigenen Ränder nicht

> *Zwischen zwei Messungen liegt ein blinder Fleck, und dort wächst, was keine von
> beiden sieht.* Der Umfangs-Wächter maß Erzählzone (bis „Die Prüfanker") und
> Regelanteil (§6–§8). **101 Zeilen standen dazwischen** und konnten wachsen, während
> alle drei Grenzen grün blieben — belegt: 25 zusätzliche Zeilen lösten **nur** die
> neue Prüfung ⑤ aus, ①–④ blieben grün.
>
> **Regel:** Wer eine Kennzahl über einen Ausschnitt definiert, benennt, was
> **außerhalb** liegt — und ob es dort wachsen kann.
> **Ort:** §7 als Regel 28, Register §8.

### Vorschlag 2 · **LL-45** — eine Zahl im Review veraltet mit dem, was danach gemergt wird

> Der v2-31-Review nennt 168/177 Tests und 39,5 kB. Alle drei sind heute falsch, und
> **niemand hat sich geirrt** — es wurden nur #52 und #53 gemergt. Wer die Prüfstrecke
> gegen das *letzte Review* vergleicht (wie `sprint-abschluss` es verlangt),
> vergleicht gegen einen Stand, der nicht `origin/main` ist.
>
> **Regel:** Die Baseline ist `origin/main`, nicht das letzte Review. Wo das teuer zu
> messen ist, wird stattdessen belegt, **was dieser Sprint hinzugefügt hat** — hier:
> 4 → 5 Testfälle in genau einer Datei.
> **Ort:** `sprint-abschluss` Schritt 1, dazu §8. Verwandt mit **LL-38** (eine Zahl
> veraltet mit einer Entscheidung auf derselben Seite), aber die Ursache ist eine
> andere: dort eine Entscheidung, hier ein Merge.

### Vorschlag 3 · Ein Wächter gegen tote Roadmap-Verweise?

`ZO-6` beschreibt bereits, dass eine Händler-Regel nach einer Umbenennung still ins
Leere zeigt. Dieser Sprint hat dieselbe Klasse zweimal gefunden: den fehlenden
Schema-Changelog v3.16.0 (Version gebumpt, Eintrag fehlt) und den fehlenden
Historien-Eintrag für einen **Fix ohne Sprint**. Beide sind für
`doku-vollstaendigkeit.spec.ts` unsichtbar, weil er nur Sprints **mit Review-Datei**
prüft. **Vorschlag:** eine vierte Prüfung dort — *jede Versionsnummer in einer Bibel
hat einen Changelog-Eintrag*. Nicht in diesem Sprint gebaut, weil er ohnehin breit
genug war.
