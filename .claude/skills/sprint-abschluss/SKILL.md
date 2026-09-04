---
name: sprint-abschluss
description: Verbindliche Reihenfolge zum Abschließen eines Sprints in Antigravity Finance — Prüfstrecke, Commit-Ordnung, Review-Datei, Roadmap-Stand, Doku-Patches, Push. Enthält die vollständige Prüfstrecke inklusive Pixel-Checks und des ESLint-Umwegs im Worktree, sowie die Gliederung der Review-Datei. Laden, sobald der Code eines Sprints oder einer Phase fertig ist — nicht erst beim Schreiben des Reviews.
---

# Sprint abschließen

**18 Sprints sind so gelaufen.** Der Ablauf ist erprobt; wo er schiefging, lag es an
genau einem Schritt: der Roadmap-Stand (Schritt 5) wurde **zweimal vergessen** und
kostete drei Nachzugs-Commits. Deshalb steht er hier so weit oben wie möglich.

---

## Die Reihenfolge

### 1 · Prüfstrecke — vollständig

Nach **jeder** Phase, nicht nur am Sprint-Ende.

```bash
node_modules/.bin/tsc --noEmit
npx eslint src --ext .ts,.tsx --no-eslintrc --config .eslintrc.json --resolve-plugins-relative-to .
pnpm build
pnpm test:visual
pnpm test:e2e
```

Erwartung: `tsc` **0 Fehler** · Lint **0/0** · Build **0 Fehler** · beide Testläufe
**vollständig grün**.

> **`pnpm test:e2e` gehört dazu — bis zum 13.08.2026 stand es hier nicht.** Es lief
> trotzdem jedes Mal, weil der Eröffnungsprompt es zufällig verlangte. Eine Prüfung,
> die nur läuft, weil der Auftrag sie erwähnt, ist keine Prüfstrecke. Und es ist nicht
> irgendein Lauf: `render-smoke.spec.ts` ist der **einzige** Test des Projekts, der die
> Anwendung tatsächlich hochfährt und angemeldet bedient.

> **Die Testzahlen stehen hier bewusst NICHT.** Sie waren dreimal überholt (25 → 69 →
> 75), jedes Mal durch normale Arbeit — dasselbe Muster, das am 13.08.2026 die
> eingefrorene Anker-Tabelle aus §9 vertrieben hat. Eine Zahl, die sich bei
> bestimmungsgemäßer Benutzung bewegt, wird nach dem dritten Fehlalarm nicht mehr
> gelesen.
>
> **Geprüft wird stattdessen die Bewegung:** Vergleiche die Zahl mit der aus dem
> **letzten Review** (dort steht sie, Abschnitt 2). Sie darf **nur steigen**, und nur um
> die Tests, die du in diesem Sprint selbst geschrieben hast.
>
> **Ist sie gleich geblieben, obwohl du eine neue `*.spec.ts` angelegt hast, ist die
> Datei nicht in `testMatch`** — genau die Falle unten. **Ist sie gesunken, hast du ein
> echtes Problem**, keinen Zahlendreher.
>
> Stand 13.08.2026 nach v2-19, als Orientierung: `test:visual` **75** ·
> `test:e2e` **84**.

> **Das `visual`-Projekt hat eine feste Dateiliste.** Eine neue `*.spec.ts` in
> `tests/e2e/` läuft **nicht** von allein mit — sie muss in `playwright.config.ts` in
> `testMatch` des Projekts eingetragen werden, sonst bleibt sie unbemerkt liegen und
> die Gesamtzahl oben verrät den Unterschied nicht.
>
> **In v2-19 ist genau das beinahe passiert:** `gehalt.spec.ts` prüft, dass die
> Gehalts-Treiberzeile nicht abgeschnitten wird — sie wäre ohne den Eintrag in
> `testMatch` nie gelaufen, und der Wächter für den teuersten Fund des Sprints hätte
> nur so ausgesehen, als gäbe es ihn.

> **`pnpm lint` bzw. `next lint` scheitert innerhalb eines Git-Worktrees** an doppelt
> aufgelöster ESLint-Konfiguration. Der Aufruf oben ist der Ersatz **ohne**
> Konfigurationsänderung; er funktioniert überall — deshalb immer er.
>
> **`--no-eslintrc` ist der entscheidende Teil, nicht `--resolve-plugins-relative-to`.**
> Bis v2-13 stand hier nur Letzteres, und es reichte nicht: Es verhindert die doppelte
> **Plugin**-Auflösung, nicht die doppelte **Konfigurations**-Auflösung. Weil die
> Worktrees unter `.claude/worktrees/` **innerhalb** des Repos liegen, findet ESLint
> beim Hochlaufen zusätzlich die `.eslintrc.json` des Eltern-Checkouts (die kein
> `"root": true` trägt) und bricht mit *„couldn't determine the plugin
> @next/next uniquely“* ab. `--no-eslintrc` schaltet die Kaskade ab, `--config`
> liefert die Konfiguration dann explizit nach.

> **Ein frischer Worktree braucht außerdem `pnpm install` und eine `.env.local`**
> mit `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` — beide sind
> gitignored und deshalb dort nicht vorhanden. Ohne sie bricht `pnpm build` beim
> Prerender von `/onboarding` ab. Ohne `.env.e2e.local` läuft nur das
> `visual`-Projekt; ein authentifizierter Render-Smoke ist dann nicht möglich.

> **`pnpm test:visual` gehört dazu.** Es kam am 23./24.07.2026 hinzu und stand bis
> zum 04.08.2026 nicht in der kanonischen Liste. Die Pixel-Checks laufen gegen
> synthetische Fixtures, brauchen keine Zugangsdaten und keine Live-Daten — sie haben
> beim allerersten Lauf einen latenten Fehler in der Popup-Treppe gefunden, den
> niemand gesucht hatte.

Bundle-Größe notieren (`Route /` und `First Load JS`) — sie gehört in den Review.

### 2 · Anker messen, wenn Daten im Spiel waren

Sobald der Sprint eine Rechenfunktion, eine RPC oder Daten berührt hat: Sparrate
vorher/nachher. Werte und Verfahren → Fähigkeit **`db-eingriff`**. Reine
Darstellungs-Sprints dürfen **keinen** Zahlenwert bewegen; auch das ist ein Anker.

### 3 · Code committen — ein Commit je Phase

Branch: `sprint/v2-NN-<thema>`. Präfixe: `feat:` · `fix:` · `chore:` · `docs:`.
Bei mehreren Komponenten in einem Sprint: **ein Commit je Phase**, Phase N+1 startet
erst nach grüner Phase N (LL-14). Nicht drei Phasen in einen Riesen-Commit mischen —
das lässt sich bei einem Fehler nicht mehr einzeln zurücknehmen.

Commit-Nachricht: **was** und **warum**, nicht **wie**. Das Wie steht im Diff.

### 4 · Review schreiben

`sprints/sprint_v2-NN_review.md`. Gliederung siehe unten.

### 4b · Historie-Eintrag schreiben ← direkt im Anschluss, nicht später

`sprints/projekt_historie.md` bekommt einen Eintrag
`### Sprint v2-NN · DONE <Datum>` — **append-only**, verdichtet aus dem Review, den
du gerade geschrieben hast. **Jetzt**, nicht am Sprint-Ende: Der Eintrag ist eine
Verdichtung, und der Kontext ist in diesem Moment frisch. Wer beides trennt, schreibt
den zweiten Text aus dem Gedächtnis.

**Gliederung:**

- **Komponente** — was war der Auftrag, in zwei bis drei Sätzen
- Die **tragenden Entscheidungen mit ihrer Begründung**, nicht nur die Ergebnisse
- **Verifikation** — Prüfstrecke und Anker **mit Zahlen**
- **Offen nach v2-NN** — was liegen blieb und warum

**Was hier hineingehört und sonst verloren geht: die Stellen, an denen sich eine
Annahme als falsch erwiesen hat.** Ein Log, der nur Erfolge verzeichnet, wird nicht
gelesen — und die Lessons Learned verweisen auf genau diese Stellen. Die wertvollsten
Einträge dieses Logs sind die, in denen jemand seinen eigenen Irrtum notiert hat.

**Bestehende Einträge werden NIE umgeschrieben**, auch nicht bei späterer besserer
Erkenntnis. Die Korrektur kommt als neuer Eintrag. Der Wert des Logs liegt darin, dass
er zeigt, was man **damals** wusste.

> **Warum dieser Schritt existiert.** Er fehlte bis zum 15.08.2026 — und die Historie
> endete deshalb bei **v2-07**, während fünfzehn Sprints unverzeichnet blieben.
> `CLAUDE.md §8` verspricht zu jeder Lesson Learned die Langfassung „beim genannten
> Sprint"; für LL-21 bis LL-27 lief dieser Verweis ins Leere. Sprint v2-08 hat die
> Datei erzeugt, aber ihre Fortschreibung nie in diesem Ablauf verankert.
>
> **`tests/e2e/doku-vollstaendigkeit.spec.ts` prüft, dass dieser Schritt passiert
> ist** — drei Regeln: jeder Sprint mit Review hat einen Eintrag · jeder LL-Ursprung
> aus §8 ist auffindbar · keine Lücke in der Nummernfolge. Der Test wird rot, sobald
> der Review steht und der Eintrag fehlt. **Das ist Absicht.**
>
> **Er prüft Existenz, nicht Qualität.** Ein Eintrag mit einem Satz macht ihn grün.
> Dagegen hilft nur die Gliederung oben. Ein Checklisten-Punkt allein hätte nicht
> gereicht: Schritt 5 steht seit v2-08 als „der vergessene Schritt" markiert in dieser
> Datei — und wurde trotzdem zweimal übersehen.

### 5 · Roadmap-Stand nachziehen ← der vergessene Schritt

In `V2/v2_roadmap_konsolidiert.md`:

- Spalte **Stand** aller berührten Themen aktualisieren (✅ · 🟡 · ⬜ · ⊘ · 🔎)
- Bemerkungs-Spalte: was genau erledigt ist und was offen bleibt
- **Abschnitt 0.1** nachziehen, wenn sich das Gesamtbild verschiebt — Zahlen
  (`N ✅ · N 🟡 · N ⊘ · N ⬜`) **zeilengenau nachzählen**, nicht schätzen
- Reihenfolge-Vorschlag anpassen, wenn ein Paket wegfällt oder dazukommt

Grund: die Roadmap ist die **einzige** Stelle, an der offene und erledigte Themen
zusammen sichtbar sind. Ohne diese Routine muss der Stand in jeder neuen Sitzung aus
der Historie rekonstruiert werden.

### 6 · Doku-Patches

Berührt der Sprint die Design- oder Schema-Doku, entsteht **eine separate
Patch-Datei** `sprints/sprint_v2-NN_doku_patches.md` mit *Anker + Patch-Satz* je
Stelle — nie eine direkte Bearbeitung der Bibeln (LL-16). Werkzeug: Subagent
`docs-maintainer`. Der Versions-Bump im Header plus Changelog ist eine **eigene**
Patch-Stelle, keine Nebensache.

Anker vor der Anwendung einzeln per Suche auf Eindeutigkeit prüfen.

> **Und die Seiten unter `design-system/` gehören mit nachgezogen**, sobald der Sprint
> an Tokens oder Komponenten etwas geändert hat — `CLAUDE.md §4` verlangt das, und
> diese Datei hat es bis zum 15.08.2026 nirgends gesagt. Sonst zeigen die Seiten beim
> nächsten Gestaltungsgespräch einen überholten Stand, und der Design-Direktor
> beurteilt Bilder, die es so nicht mehr gibt. Ablauf: `design-system/SYNC.md`.
>
> **Dafür gibt es bewusst keinen Test** — „hat sich die Formensprache geändert?" ist
> keine Frage, die eine Maschine beantworten kann. Anders als bei der Historie, wo die
> Regel exakt ist (Schritt 4b).

### 6b · CLAUDE.md — und dabei auf den Umfang achten ← neu seit 27.08.2026

Hat der Sprint eine **dauerhafte** Lehre erzeugt — eine Stolperfalle, eine
Arbeitsregel, eine Lesson Learned —, gehört sie in CLAUDE.md. **Verfahren wie oben,
plus ausdrückliche Freigabe des Users** (§7 Regel 14). Fähigkeit:
**`claude-md-pflege`**.

**Die Frage vor jeder Ergänzung lautet: Gilt das *immer*?** Was ein einzelner Sprint
gebracht hat, gehört nach `sprints/projekt_historie.md` — hierher nur, was daraus
dauerhaft folgt.

> **Warum dieser Schritt existiert.** Er fehlte bis zum 27.08.2026, und CLAUDE.md kam
> in dieser Datei nur in Nebensätzen vor. **Sprint v2-08 hatte sie von 1.857 auf 434
> Zeilen gekürzt; einundzwanzig Sprints später stand sie bei 1.712** — fast wieder
> dort, wo sie vorher war, obwohl ihr eigener Kopf sagt, Historie gehöre woanders hin.
>
> **Die Fehlerklasse entsteht ausschließlich aus richtigen Entscheidungen:** Jede
> Ergänzung war begründet und freigegeben. Nur die Summe war der Fehler — und Summen
> bemerkt niemand beim Hinschreiben. Deshalb misst
> **`tests/e2e/claude-md-umfang.spec.ts`** sie bei jedem Testlauf: Gesamtumfang,
> Erzählzone und Regelanteil. **Er warnt bei 90 % der Grenze und wird rot beim
> Überschreiten.**
>
> Dieselbe Begründung wie bei Schritt 4b: Nach LL-40 ist eine Checklisten-Zeile eine
> Zusicherung, ein Test eine Prüfung.

### 7 · Doku-Commit

`docs:` — Review + Doku-Patches + Roadmap in **einem** Commit. So bleibt der Stand
zusammen und es entstehen keine Nachzüge wie nach v2-06.

### 8 · Push, dann anhalten

```bash
git push -u origin sprint/v2-NN-<thema>
```

**Hier ist Schluss.** Der Merge nach `main` löst den Produktiv-Deploy aus und ist
ausschließlich Sache des Users. Nachfragen, nicht mergen — auch wenn der Sprint
grün ist.

### 9 · Sauberer Abschluss

`git status` muss leer sein. Keine `??`, keine `M`. Temporäre Dateien entfernen.

**Und die Arbeitskopie dieses Sprints entfernen — mit diesem Befehl, nicht von Hand:**

```bash
.claude/skripte/tote-arbeitskopien.sh entfernen
```

Er entfernt **ausschließlich**, was belegbar sicher ist: nichts Ungesichertes, kein
Stash, Branch vollständig in `origin/main`, und **nie** die Arbeitskopie, in der er
selbst läuft. Fehlt `.env.local` oder `.env.e2e.local` im Haupt-Checkout, **bricht er
ab** statt zu löschen.

> ### ⚠️ Warum diese Zeile jetzt einen Befehl trägt — und vorher nichts bewirkt hat
>
> Hier stand bis zum 04.09.2026 nur *„Temporäre Dateien und **Arbeitskopien**
> entfernen"*. Über **neun Sprints** hinweg ist das übersehen worden; gefunden wurde
> es erst, als unter `.claude/worktrees/` **4.309 MB** in neun Arbeitskopien lagen.
>
> **Das ist LL-40 an dieser Fähigkeit selbst:** Eine Checklisten-Zeile ist eine
> Zusicherung, keine Prüfung — und die gemessene Trefferquote dieser einen war
> **null**. Ein Befehl, den man ausführt, ist überprüfbar; ein Halbsatz am Ende einer
> langen Liste ist es nicht.
>
> **Zusätzlich meldet seit v2-32 ein `SessionStart`-Hook**, wenn tote Arbeitskopien
> herumliegen (`.claude/settings.json`). Er **löscht nie** — eine laufende Sitzung
> kann in einer Arbeitskopie stehen, deren Branch bereits gemergt ist. Der Hook ist
> das Netz; dieser Schritt bleibt die Arbeit.
>
> **Die Prüfung, die vor dem Löschen kommt und fast vergessen worden wäre:**
> `git status` zeigt **gitignorierte** Dateien nicht. `.env.local` und
> `.env.e2e.local` wären also lautlos mitgelöscht worden — genau der Vorfall aus
> CLAUDE.md §4 zwischen v2-10 und v2-15.

---

## Gliederung der Review-Datei

Bis v2-04 war diese Form stabil; ab v2-05 ist sie in eine freie Erzählung gekippt
und dabei sind **zwei Abschnitte verloren gegangen** — ausgerechnet die beiden, die
Wissen zurückspielen (Smoke-Tabelle, CLAUDE.md-Vorschläge). Deshalb hier verbindlich:

```markdown
# Sprint v2-NN — Review

> Branch · Commits · Datum · Zusammenfassung in einem Satz

## 1. Was gebaut wurde
Je Phase: Absicht, Lösungsweg, berührte Dateien.

## 2. Prüfstrecke
tsc · Lint · Build (mit Bundle-Größe) · Pixel-Checks — mit Zahlen, nicht mit „grün".

## 3. Anker vorher/nachher
Tabelle. Bei reinen Darstellungs-Sprints: „kein Zahlenwert bewegt" ist das Ergebnis.

## 4. Selbst-Review gegen die Akzeptanzkriterien
Tabelle A1…An: Kriterium | erfüllt | Beleg (Datei:Zeile, Messwert, Commit).

## 5. Architektur-Entscheidungen
Nur die, bei denen eine echte Alternative bestand — jeweils mit Begründung.

## 6. Offene Punkte und Fragen
Was der Sprint bewusst offen gelassen hat, und was der User entscheiden muss.

## 7. Vorschläge für CLAUDE.md und Roadmap
Als Vorschlag formuliert. Die Anwendung braucht die Freigabe des Users.
```

---

## Checkliste

- [ ] Prüfstrecke vollständig grün — **inkl. `test:visual` UND `test:e2e`**,
      Bundle-Größe notiert
- [ ] Testzahlen gegen das letzte Review verglichen: nur gestiegen, und nur um
      selbst geschriebene Tests
- [ ] Anker gemessen, sofern Daten berührt
- [ ] Ein Commit je Phase, aussagekräftige Nachrichten
- [ ] Review geschrieben, alle 7 Abschnitte
- [ ] **Historie-Eintrag geschrieben** (Schritt 4b) — `doku-vollstaendigkeit.spec.ts`
      prüft es, aber nur auf Existenz; die Gliederung steht dort
- [ ] **Roadmap-Stand nachgezogen, Zahlen nachgezählt**
- [ ] Doku-Patches als eigene Datei, Versions-Bump als eigene Patch-Stelle
- [ ] **CLAUDE.md gepflegt, falls eine dauerhafte Lehre entstand** (Schritt 6b,
      Fähigkeit `claude-md-pflege`) — und `claude-md-umfang.spec.ts` grün
- [ ] `design-system/` nachgezogen, falls Tokens oder Komponenten berührt wurden
- [ ] `docs:`-Commit mit Review + Patches + Roadmap zusammen
- [ ] Branch gepusht
- [ ] **Nicht gemerged** — Freigabe erfragt
- [ ] `git status` leer
