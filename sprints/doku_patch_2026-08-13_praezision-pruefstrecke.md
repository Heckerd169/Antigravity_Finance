# Vorschlag 13.08.2026 — die Prüfstrecke sagen lassen, was sie tut

> **Status: ANGEWENDET am 13.08.2026** nach ausdrücklicher Freigabe des Users
> („Bitte anwenden"). Der Vorschlag lag vorher vollständig vor — er war **nicht** von
> der CLAUDE.md-Freigabe desselben Tages gedeckt, die nur die vier Sprint-Stellen
> umfasste, und wurde deshalb einzeln vorgelegt (§7 Regel 14).
>
> **Anlass:** Beim Anwenden jener Freigabe aufgefallen. Kein Fehlverhalten der App —
> beschreibende Stellen, die überholt sind. Sie kosten nichts, bis jemand sich auf sie
> verlässt.

---

## Die drei Befunde, gemessen

### ① Die Fähigkeit `sprint-abschluss` nennt eine Testzahl, die **dreimal** überholt ist

Dort steht seit v2-15:

> Erwartung: `tsc` 0 Fehler · Lint 0/0 · Build 0 Fehler · `test:visual` **25/25**
> (9 Ring-Subzeile seit v2-12 + 3 §9-Pixel + 13 Liquiditäts-Regel seit v2-15).

**Gemessen am 13.08.2026: 75.** Die Aufschlüsselung der drei genannten Posten stimmt
sogar noch exakt — sie ist nur nicht mehr vollständig:

| Spec | Tests | im Skill genannt |
|---|---|---|
| `kategorien.spec.ts` | 21 | nein *(v2-17)* |
| `liquidity.spec.ts` | 13 | **ja** |
| `consequence.spec.ts` | 12 | nein *(v2-16)* |
| `fragment-showcase.spec.ts` | 11 | nein *(v2-16)* |
| `ring-subline.spec.ts` | 9 | **ja** |
| `gehalt.spec.ts` | 6 | nein *(v2-19)* |
| `visual-pixel.spec.ts` | 3 | **ja** |
| **Summe** | **75** | 25 |

### ② `pnpm test:e2e` fehlt in der Prüfstrecke der Fähigkeit **ganz**

Der Block listet vier Befehle: `tsc`, ESLint, `pnpm build`, `pnpm test:visual`. Der
e2e-Lauf steht nirgends — obwohl `render-smoke.spec.ts` der **einzige** Test des
Projekts ist, der die Anwendung tatsächlich im Browser hochfährt und angemeldet
bedient. Wer sich streng an die Fähigkeit hält, fährt ihn nie.

Dass er trotzdem gelaufen ist, lag jedes Mal am Eröffnungsprompt, der ihn ausdrücklich
verlangt hat. **Eine Prüfung, die nur läuft, weil der Auftrag sie zufällig nennt, ist
keine Prüfstrecke.**

### ③ CLAUDE.md §2 beschreibt zwei Testarten — es sind drei

Dort steht:

> **Tests:** Playwright-Render-Smoke (read-only gegen dev/Prod-DB) + deterministische
> §9-Pixel-Checks (`pnpm test:visual`, synthetische Fixtures ohne Live-Daten).

Gemessen: **Alle sieben** `visual`-Specs transpilieren echten Quellcode und führen ihn
aus (`ts.transpileModule` auf die Originaldatei). Nur **zwei** Specs steuern überhaupt
einen Browser als Anwendung — `render-smoke` und `unauth`, beide **nicht** im
`visual`-Projekt.

Die größte Gruppe fehlt also in der Beschreibung: **72 von 75** `visual`-Tests sind
Logik-Wächter, die die echte Quelldatei prüfen, statt sie nachzubauen. Genau diese
Bauart hat in v2-12 einen Fehler gefunden, der zwei Sprints überlebt hatte, und in
v2-19 die abgeschnittene Gehalts-Zeile.

---

## Der Punkt hinter ①, und warum ich nicht einfach 25 durch 75 ersetze

**Diese Zahl ist zum dritten Mal falsch** — 25 → 69 → 75, jedes Mal durch normale
Arbeit. Sie wird beim nächsten Sprint mit einem neuen Test wieder falsch sein.

Das ist **dasselbe Muster wie beim Anker**, den wir am 13.08.2026 genau deshalb
umgebaut haben: Eine eingefrorene Zahl, die sich bei bestimmungsgemäßer Benutzung
bewegt, schlägt entweder falsch an oder wird gewohnheitsmäßig überlesen. §9 sagt es
selbst — *„Eine Anker-Tabelle mit falschen Sollwerten ist schlimmer als keine."*

**Aber ersatzlos streichen wäre falsch.** Die Zahl hat einen echten Zweck: Sie ist der
einzige Wächter gegen die `testMatch`-Falle. Eine neue Spec, die nicht in
`playwright.config.ts` eingetragen ist, läuft stillschweigend nicht mit — und **nichts**
außer der Gesamtzahl verrät das. In v2-19 wäre `gehalt.spec.ts` genau so liegen
geblieben.

**Deshalb: dieselbe Lösung wie beim Anker.** Nicht die Zahl festschreiben, sondern die
**Bewegung** prüfen — gegen den Wert aus dem letzten Review, in derselben Sitzung.

---

# Patch-Stellen

## P1 · `.claude/skills/sprint-abschluss/SKILL.md` — Prüfstrecke

**Anker:** der Code-Block mit den vier Befehlen und die beiden Zeilen darunter
(`Erwartung: … **25/25**` / `(9 Ring-Subzeile … v2-15).`)

**Patch:** ersetzen durch —

````
```bash
node_modules/.bin/tsc --noEmit
npx eslint src --ext .ts,.tsx --no-eslintrc --config .eslintrc.json --resolve-plugins-relative-to .
pnpm build
pnpm test:visual
pnpm test:e2e
```

Erwartung: `tsc` **0 Fehler** · Lint **0/0** · Build **0 Fehler** · beide Testläufe
**vollständig grün**.

> **Die Testzahlen stehen hier bewusst NICHT.** Sie waren dreimal überholt (25 → 69 →
> 75), jedes Mal durch normale Arbeit — dasselbe Muster, das am 13.08.2026 die
> eingefrorene Anker-Tabelle aus §9 vertrieben hat. Eine Zahl, die sich bei
> bestimmungsgemäßer Benutzung bewegt, wird nach dem dritten Fehlalarm nicht mehr
> gelesen.
>
> **Geprüft wird stattdessen die Bewegung:** Vergleiche die Zahl mit der aus dem
> **letzten Review** (dort steht sie, Abschnitt 2). Sie darf **nur steigen**, und nur
> um die Tests, die du in diesem Sprint selbst geschrieben hast.
>
> **Ist sie gleich geblieben, obwohl du eine neue `*.spec.ts` angelegt hast, ist die
> Datei nicht in `testMatch`** — genau die Falle unten. **Ist sie gesunken, hast du ein
> echtes Problem**, kein Zahlendreher.
>
> Stand 13.08.2026 nach v2-19, als Orientierung: `test:visual` **75** ·
> `test:e2e` **84**.
````

**Zusätzlich (dieselbe Datei), Anker:** der Kasten
`> **Das \`visual\`-Projekt hat eine feste Dateiliste.**`

**Patch:** am Ende des Kastens anfügen —

```
> **In v2-19 ist genau das beinahe passiert:** `gehalt.spec.ts` prüft, dass die
> Gehalts-Treiberzeile nicht abgeschnitten wird — sie wäre ohne den Eintrag in
> `testMatch` nie gelaufen, und der Wächter für den teuersten Fund des Sprints hätte
> nur so ausgesehen, als gäbe es ihn.
```

**Und in der Checkliste, Anker:**
`- [ ] Prüfstrecke vollständig grün (inkl. \`test:visual\`), Bundle-Größe notiert`

**Patch:** ersetzen durch —

```
- [ ] Prüfstrecke vollständig grün — **inkl. `test:visual` UND `test:e2e`**,
      Bundle-Größe notiert
- [ ] Testzahlen gegen das letzte Review verglichen: nur gestiegen, und nur um
      selbst geschriebene Tests
```

## P2 · CLAUDE.md §2 — was die Tests wirklich sind

**Anker:** der Absatz, der mit `**Tests:** Playwright-Render-Smoke` beginnt

**Patch:** ersetzen durch —

```
**Tests:** Playwright in drei Rollen. **Logik-Wächter** (die Mehrzahl, 72 von 75 im
`visual`-Projekt) transpilieren die **echte Quelldatei** und führen sie aus, statt die
Regel nachzubauen — ein Nachbau driftet ab und gibt falsche Sicherheit; diese Bauart
hat in v2-12, v2-17 und v2-19 je einen Fehler gefunden. **Pixel-Checks** (§9, `draw.ts`)
zeichnen auf ein Canvas und messen Farben. **Render-Smoke** fährt die Anwendung
angemeldet hoch — read-only gegen dev/Prod-DB, und der einzige Test, der die App als
Ganzes sieht.

Alle drei brauchen **keine** Live-Daten außer dem Render-Smoke. Daten-mutierende E2E
laufen **nur** gegen die Übungs-Datenbank (§4). Der manuelle Browser-Smoke des Users
bleibt der Produktiv-Gate.
```

---

## Was ich NICHT vorschlage

- **Die Aufschlüsselung je Spec-Datei in die Fähigkeit zu schreiben.** Sie wäre beim
  nächsten Sprint wieder falsch und verlagert das Problem nur.
- **Die Zahl automatisch prüfen zu lassen** (etwa ein Skript, das `testMatch` gegen den
  Ordnerinhalt hält). Wäre der gründlichste Weg, ist aber Bauarbeit und gehört in einen
  Sprint, nicht in einen Doku-Nachzug.
- **Irgendetwas an `playwright.config.ts`.** Die feste Dateiliste ist Absicht: Sie
  verhindert, dass ein halbfertiger Test unbemerkt in die Prüfstrecke rutscht.

---

## Aufwand und Risiko

Zwei Dateien, rein beschreibend. **Kein Code, keine Datenbank, keine Zahl der App
betroffen.** Die Prüfstrecke selbst ändert sich in einem Punkt real: `pnpm test:e2e`
wird verbindlich — was sie faktisch längst war.
