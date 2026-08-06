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
```

Erwartung: `tsc` 0 Fehler · Lint 0/0 · Build 0 Fehler · Pixel-Checks **12/12**
(9 Ring-Subzeile seit v2-12 + 3 §9-Pixel).

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

`git status` muss leer sein. Keine `??`, keine `M`. Temporäre Dateien und
Arbeitskopien entfernen.

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

- [ ] Prüfstrecke vollständig grün (inkl. `test:visual`), Bundle-Größe notiert
- [ ] Anker gemessen, sofern Daten berührt
- [ ] Ein Commit je Phase, aussagekräftige Nachrichten
- [ ] Review geschrieben, alle 7 Abschnitte
- [ ] **Roadmap-Stand nachgezogen, Zahlen nachgezählt**
- [ ] Doku-Patches als eigene Datei, Versions-Bump als eigene Patch-Stelle
- [ ] `docs:`-Commit mit Review + Patches + Roadmap zusammen
- [ ] Branch gepusht
- [ ] **Nicht gemerged** — Freigabe erfragt
- [ ] `git status` leer
