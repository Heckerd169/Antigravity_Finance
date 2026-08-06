# Doku-Patch — Nachzug A–E nach Sprint v2-13

**Freigabe:** Dominik, 06.08.2026 — *„A–E machen"*, nach dem grünen Browser-Smoke und
dem Merge von PR #12/#11/#10.

**Verfahren:** LL-16 / §7 Regel 14 — Anker + Patch-Satz je Stelle. Für CLAUDE.md §9
(Punkt C) gilt zusätzlich die Freigabe-Pflicht; sie liegt oben vor.

| | Was | Datei |
|---|---|---|
| **A** | Restore-Timing + Prüfsummen-Nachweis | `.claude/skills/db-eingriff/SKILL.md` |
| **B** | ESLint-Umweg im Worktree + Pixel-Zahl | `.claude/skills/sprint-abschluss/SKILL.md` |
| **C** | §9 Aktueller Stand | `CLAUDE.md` |
| **D** | Karten-Seite nach `claude.ai/design` | *(kein Repo-Patch — Sync-Vorgang)* |
| **E** | veralteter Prod-Anker | `supabase/test_projekt/README.md` |

---

## A · `db-eingriff` — zwei Ergänzungen

### A1 · Restore-Timing (die teuerste Falle aus v2-13)

**Anker:**

```
2. Übungs-DB `qyjuzzgqxowqiiwqcahd` **restoren**, warten bis `ACTIVE_HEALTHY`.
3. Anker der Übungs-DB messen: **2.200,00 €**. Weicht er ab, ist die Übungs-DB nicht
   im erwarteten Zustand — **anhalten**, nicht migrieren.
```

**Patch-Satz:**

```markdown
2. Übungs-DB `qyjuzzgqxowqiiwqcahd` **restoren**, warten bis `ACTIVE_HEALTHY`.
3. Anker der Übungs-DB messen: **2.200,00 €**. Weicht er ab, ist die Übungs-DB nicht
   im erwarteten Zustand — **anhalten**, nicht migrieren.

> ### ⚠️ Erst `ACTIVE_HEALTHY`, dann urteilen — nicht vorher
>
> **Postgres nimmt Verbindungen an, BEVOR die Daten wieder da sind.** In diesem
> Fenster antwortet die Datenbank auf jede Abfrage korrekt — und meldet dabei
> **keine Tabellen, keine Funktionen, keinen Nutzer**. Das sieht exakt aus wie ein
> leeres Projekt.
>
> Am 05.08.2026 (v2-13) war genau das der Fall: `status` stand minutenlang auf
> `COMING_UP`, `SELECT 1` lief bereits durch, und `public` wirkte vollständig leer.
> Die Übungs-DB war die ganze Zeit **intakt**. Wer in diesem Moment nach dem
> Runbook (`supabase/test_projekt/README.md`) neu aufbaut, **zerstört eine gesunde
> Datenbank** — und merkt es nicht, weil der Wiederaufbau ja „funktioniert".
>
> **Regel:** Status über `get_project` abfragen, bis er **`ACTIVE_HEALTHY`** ist.
> Erst dann den Anker messen, erst dann urteilen. Ein `SELECT`, das durchläuft, ist
> **kein** Beleg dafür, dass der Restore fertig ist.
```

### A2 · Prüfsummen-Vergleich als Wortgleichheits-Nachweis

**Anker** (Ende von Schritt 5 · Produktion):

```
3. Migration wortgleich auf `nflkobdfdhncrtjncpmq` anwenden.
```

**Patch-Satz:**

```markdown
3. Migration wortgleich auf `nflkobdfdhncrtjncpmq` anwenden.
4. **Wortgleichheit belegen statt zusichern.** Nach dem Einspielen auf **beiden**
   Projekten dieselbe Abfrage laufen lassen und die Werte vergleichen:

   ```sql
   SELECT p.proname, md5(pg_get_functiondef(p.oid))
   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname IN ('…', '…')
   ORDER BY 1;
   ```

   Identische Prüfsummen heißen: Produktion führt **byte-genau** den Code aus, der
   auf der Übungs-DB grün war. Der Vergleich kostet einen Aufruf und ersetzt eine
   Zusicherung durch einen Beleg. Nützlich auch für Funktionen, die eine Migration
   **unverändert** mitführt — dort muss die Prüfsumme dieselbe sein wie **vorher**
   (so belegt in v2-13 für `calculate_planned_sparrate_for_month`).
```

---

## B · `sprint-abschluss` — ESLint-Umweg und Pixel-Zahl

**Anker:**

```
node_modules/.bin/tsc --noEmit
npx eslint src --ext .ts,.tsx --resolve-plugins-relative-to .
pnpm build
pnpm test:visual
```

**Patch-Satz:**

```markdown
node_modules/.bin/tsc --noEmit
npx eslint src --ext .ts,.tsx --no-eslintrc --config .eslintrc.json --resolve-plugins-relative-to .
pnpm build
pnpm test:visual
```

**Anker 2:**

```
Erwartung: `tsc` 0 Fehler · Lint 0/0 · Build 0 Fehler · Pixel-Checks 3/3.

> **`pnpm lint` bzw. `next lint` scheitert innerhalb eines Git-Worktrees** an doppelt
> aufgelöster ESLint-Konfiguration (Eltern-Repo + Worktree). Der Aufruf oben ist der
> Ersatz **ohne** Konfigurationsänderung. Im normalen Arbeitsverzeichnis
> funktionieren beide; der Ersatz funktioniert überall — deshalb immer er.
```

**Patch-Satz 2:**

```markdown
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
> `"root": true` trägt) und bricht mit *„couldn't determine the plugin @next/next
> uniquely"* ab. `--no-eslintrc` schaltet die Kaskade ab, `--config` liefert die
> Konfiguration dann explizit nach.

> **Ein frischer Worktree braucht außerdem `pnpm install` und eine `.env.local`**
> mit `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` — beide sind
> gitignored und deshalb dort nicht vorhanden. Ohne sie bricht `pnpm build` beim
> Prerender von `/onboarding` ab. Ohne `.env.e2e.local` läuft nur das
> `visual`-Projekt; ein authentifizierter Render-Smoke ist dann nicht möglich.
```

---

## C · `CLAUDE.md` §9 — Aktueller Stand

**Anker:** der gesamte Abschnitt `## 9. Aktueller Stand` bis zum Dateiende.

**Patch-Satz:** siehe angewendete Fassung — inhaltlich:

- **Letzter Sprint** v2-10 → **v2-13**, mit v2-12/v2-11 als Vorgänger
- **Doku-Versionen** 3.1.8 / 3.4.2 → **3.2.0 / 3.4.3**
- **Prüfanker-Tabelle bleibt unverändert** (die Werte sind nach v2-13 nachgemessen
  und identisch), der Erläuterungsblock wird um v2-13 ergänzt
- **Roadmap-Zahlen** 44 offen / 29 erledigt / 14 Pakete → **40 / 32 / 13**
- **„Nächster Sprint `BF-2`"** entfällt — Paket 1 ist vollständig, es blockiert
  keine Entscheidung mehr

---

## E · `supabase/test_projekt/README.md` — doppelt veralteter Anker

**Anker:**

```
- Nach jeder Live-Migration: Prod-Anker prüfen (aktuell: Juni 2026 = 4.545,32 €
  und die 12-Monats-Kurve unverändert, sofern nicht beabsichtigt geändert).
```

**Patch-Satz:**

```markdown
- Nach jeder Live-Migration: Prod-Anker prüfen — **alle zwölf Monate**, Ist **und**
  Plan, unverändert sofern nicht beabsichtigt geändert.

  > **Maßgeblich ist `CLAUDE.md` §9, nicht diese Datei.** Hier stand bis zum
  > 06.08.2026 „Juni 2026 = 4.545,32 €" — ein Wert, der schon durch den
  > 2025er-Import überholt war (4.589,53 €) und seit der Juli-Kuratierung erneut
  > (**4.208,76 €**). Zweimal veraltet, zweimal unbemerkt: ein Anker an einer
  > zweiten Stelle zu pflegen funktioniert nicht. Deshalb steht hier jetzt **kein
  > Zahlenwert** mehr, sondern nur noch der Verweis.
```

> **Warum die Zahl ersatzlos entfällt und nicht korrigiert wird.** Ein zweiter Ort
> für denselben Anker ist genau der Mechanismus, der ihn zweimal veralten ließ.
> Ein Verweis kann nicht falsch werden.

---

## Nicht Teil dieses Patches

| Was | Warum |
|---|---|
| `V2/v2_roadmap_konsolidiert.md` | in v2-13 bereits nachgezogen (40 / 32 / 13) |
| Design-Doku · Schema-Doku | in v2-13 bereits auf 3.2.0 / 3.4.3 |
| Merksatz LL-6 (Portal, aus v2-10) | steht weiterhin als unfreigegebener Vorschlag im v2-10-Review |

---

*Doku-Patch · Antigravity Finance · 06. August 2026*
