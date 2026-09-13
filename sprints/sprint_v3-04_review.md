# Sprint v3-04 — Review

> **Branch:** `sprint/v3-04-mobil-vollbild` · **Datum:** 13.09.2026
> **Commits:** `9921a0e` (P0) · `b19c4bd` (P1) · `a44e979` (P2) · dieser (P3)
> **In einem Satz:** `/mobil` erklärt jetzt selbst, welche Adressen zur
> Home-Bildschirm-App gehören — vorher entschied das iOS anhand der Startadresse, und
> jeder Tab-Wechsel führte aus der App heraus.

---

## 1. Was gebaut wurde

### P0 · Papierarbeit

Befund `V2/befunde_2026-09-13_mobil-vollbild.md`, Design-Record
`V2/design_direktor_2026-09-13_mobil-symbol.md`, Briefing, Anker-Protokoll,
Roadmap-Eintrag `MB-7`. Die Vergleichs-Artboards des Symbols liegen unter
`design-system/handoff/mobile/symbol/`.

### P1 · Der Fix

| Datei | Was |
|---|---|
| `public/mobil.webmanifest` | neu — `scope: "/mobil"`, `start_url: "/mobil"`, `display: "standalone"`, Farben aus `tokens.css` |
| `src/app/mobil/apple-icon.png` | neu, 180 × 180 — der Weg, den iOS für das Home-Symbol nimmt |
| `public/mobil-icon-512.png` | neu, 512 × 512 — das `icons`-Feld des Manifests |
| `src/app/mobil/layout.tsx` | `manifest: "/mobil.webmanifest"`, plus die Begründung, die JSON nicht tragen kann |
| `src/middleware.ts` | `webmanifest` in den matcher-Ausschluss |
| `design-system/handoff/mobile/symbol/` | `app-symbol.svg` als Quelle, `erzeuge-png.mjs` als Weg zum PNG |

### P2 · Die Wächter

`tests/e2e/mobil-vollbild.spec.ts` (sechs, Projekt `visual`) plus einer in
`render-smoke-mobil.spec.ts`. Eingetragen in die **feste** Dateiliste.

---

## 2. Prüfstrecke

| | Ergebnis |
|---|---|
| `tsc --noEmit` | **0 Fehler** |
| ESLint `src` (Worktree-Umweg, roher Exitcode) | **0 Fehler / 0 Warnungen** |
| `pnpm build` | **0 Fehler** |
| `pnpm test:visual` | **282 / 282** |
| `pnpm test:e2e` | **307 bestanden, 1 übersprungen** |

**Bundle — unverändert gegenüber v3-03, Zeile für Zeile:**

| Route | Size | First Load JS |
|---|---|---|
| `/` | 29,2 kB | 193 kB |
| `/mobil/uebersicht` | 1,16 kB | 100 kB |
| `/mobil/karten` | 1,49 kB | 97,5 kB |
| `/mobil/verlauf` | 1,27 kB | 97,3 kB |
| `/mobil/zuordnen` | 6,28 kB | 102 kB |
| Middleware | — | 82,3 kB |

Neu in der Routenliste: `/mobil/apple-icon.png` mit **0 B** — eine statische Datei,
kein Code.

**Gegen v3-03 (visual 276, e2e 301):**

| | v3-03 | jetzt | Differenz |
|---|---|---|---|
| `test:visual` | 276 | **282** | **+6** — alle in `mobil-vollbild.spec.ts` |
| `test:e2e` | 301 | **308** | **+7** — die 6 oben plus einer in `render-smoke-mobil` |

Keine Zahl ist gesunken.

> ### ⚠️ Die e2e-Zahl ist 308, aber nur 307 sind gelaufen — und das ist kein Fehler
>
> Ein **bestehender** Test überspringt sich seit heute selbst: „sheet ‚Karte wählen'"
> läuft nur, wenn der laufende Monat eine offene Zahlung hat — sonst gibt es den Knopf
> „Andere Karte …" gar nicht. **Gemessen am 13.09.2026: September 2026 hat 0 offene
> Zahlungen** bei 40 Fragmenten, August ebenfalls 0. Am 08.09. gab es dort noch welche.
>
> **Wert der Beobachtung:** Ein datenabhängiger Test verliert seine Aussage **lautlos**,
> sobald die Daten ihm die Voraussetzung entziehen. Hier nennt er den Grund immerhin
> mit. Ein flüchtiger Blick auf „301 → 307" hätte „+6" gelesen — dabei kamen **sieben**
> dazu und einer fiel weg. **Die Differenz zweier Gesamtzahlen ist keine Aussage über
> Zuwachs.**

**Ein zweiter Befund, der nicht zu diesem Sprint gehört und trotzdem hier steht:**
ESLint über `tests/` meldet **8 Fehler** (`no-assign-module-variable`) in acht Dateien.
**Alle acht bestehen unverändert in `origin/main`** — nachgeprüft an
`consequence.spec.ts:43`. Es ist das Muster der Logik-Wächter, die eine echte Quelldatei
transpilieren. Der kanonische Prüfbefehl aus `sprint-abschluss` prüft `src`, nicht
`tests`, und ist grün. **Meine beiden neuen Testdateien sind nicht darunter.** Nicht
angefasst — fremder Umfang.

---

## 3. Anker vorher/nachher

Vollständig in `sprints/sprint_v3-04_anker.md`. Beide Messungen am 13.09.2026 in
**derselben Sitzung**.

| Anker | Vorher | Nachher |
|---|---|---|
| Sparrate Ist + Plan, 24 Monate | gemessen | **24/24 byte-identisch** |
| Anker 1 (Σ Ordner = Sparrate) | 0,00 € in 24/24 | **0,00 € in 24/24** |
| Anker 2 (Σ delta = Ist − Plan) | 24/24 exakt | **24/24 exakt** |
| Anker 3 (Netzrunden) | 8 · 6 · 5 · 11 | **unverändert** |

**Kein Zahlenwert bewegt.** Der Vergleich lief maschinell gegen die Vorher-Tabelle, in
Ist **und** Plan gleichzeitig; die Abweichungsliste kam leer zurück.

Bei Anker 3 ist der Beleg stärker als eine Zählung: Der Diff über `src/app/mobil/` und
`src/components/` zeigt **zwei** Einträge — `layout.tsx` und die Symboldatei. **Kein
Lader wurde angefasst.**

> **Eine Beobachtung zum Vorher-Wert, die die Messregel bestätigt.** September 2026 stand
> im v3-03-Protokoll bei 1.613,11 €, in meiner Vorher-Messung bei **1.315,23 €** — und
> im Screenshot des Nutzers von 18:23 Uhr bei **1.286,37 €**, also nochmal anders,
> wenige Minuten vor meiner Messung. Alle drei Zahlen sind richtig; der Nutzer ordnet
> zu. **Genau deshalb wird gegen den eigenen Vorher-Wert von vor zehn Minuten verglichen
> und nicht gegen eine Tabelle** (CLAUDE.md §9).

---

## 4. Selbst-Review gegen die Akzeptanzkriterien

| # | Kriterium | erfüllt | Beleg |
|---|---|---|---|
| A1 | **Jedes** Ziel der Tab-Leiste liegt im Zugehörigkeitsbereich | ✅ | Wächter ① (Quelldatei) und der siebte (gerendert, gegen das über HTTP geholte Manifest) |
| A2 | Die Startadresse liegt im eigenen Bereich und zeigt auf eine echte Route | ✅ | Wächter ②; `src/app/mobil/page.tsx` existiert |
| A3 | Der Vollbild-Modus ist angefordert, Startfläche = Farbe der App | ✅ | Wächter ③, Wert gegen `tokens.css` geprüft, nicht gegen eine erinnerte Farbe |
| A4 | Das Manifest ist **ohne Anmeldung** erreichbar | ✅ | live: `200 application/manifest+json`; Gegenprobe `/mobil/uebersicht` → `307 /login`. Wächter ④ prüft denselben matcher statisch |
| A5 | Der Verweis hängt **nur** an `/mobil` | ✅ | S3: alle vier `/mobil`-Seiten tragen Manifest + `apple-touch-icon`, `/` trägt **keines** von beiden. Wächter ⑤ prüft, dass das Wurzel-Layout es nicht bekommt |
| A6 | Das Symbol ist der entschiedene Ring in 180 × 180 | ✅ | Wächter ⑥ liest die Maße aus dem PNG-Kopf; Bild angesehen, nicht nur gemessen |
| A7 | Kein Zahlenwert bewegt | ✅ | §3 |
| A8 | Jeder neue Wächter kann auslösen (LL-40) | ✅ | zwei Runden mit Gegenprobe, §5 |
| **A9** | **Die App bleibt beim Tab-Wechsel im Vollbild** | **offen** | **Nur am Gerät prüfbar.** Prüfschritte S8–S11 |

**A9 ist das eigentliche Ziel des Sprints, und es ist von hier aus nicht abnehmbar.**
Alles darüber sind notwendige Bedingungen dafür.

---

## 5. Architektur-Entscheidungen

**① `scope: "/mobil"` ohne Schrägstrich am Ende.** Der Vergleich ist ein reiner
Zeichen-Präfix: `"/mobil"` deckt `/mobil` **und** `/mobil/zuordnen` ab, `"/mobil/"`
deckt `/mobil` **nicht** ab — und `/mobil` ist die `start_url`. Ein Zeichen mehr legt
den Einstieg der App nach draußen. Steht als Warnung im Layout-Kommentar und ist
Wächter ②.

**② `start_url` bleibt `/mobil`, nicht `/mobil/uebersicht`.** Die Alternative wäre einen
Weiterleitungs-Sprung beim Kaltstart billiger gewesen. Dagegen: `/mobil/page.tsx` ist
die **eine** Stelle, die entscheidet, wohin `/mobil` führt (heute die Übersicht, samt
Monats-Rückfall). Eine zweite Stelle mit derselben Entscheidung wäre LL-26 in der
Gestalt „Nachbauen" — und sie würde beim nächsten Umbau der Einstiegslogik still
falsch.

**③ Der Verweis hängt an `mobil/layout.tsx`, nicht im Wurzel-Layout.** Die
Datei-Konvention `src/app/manifest.ts` wäre der kürzere Weg gewesen, hätte den Verweis
aber auf **jede** Seite gelegt — auch auf die Schreibtisch-Ansicht, die kein
Handy-Programm ist und auch keines behaupten soll. Wächter ⑤ hält das fest.

**④ Die Symbole sind erzeugte Dateien, die Quelle ist ein SVG im Repo.** Ein PNG allein
ist im Diff nicht lesbar; wer die Figur später ändern will, sähe nur „Bin 5061 bytes".
Jetzt steht die Figur als SVG daneben, mit `erzeuge-png.mjs` als Weg. Die Alternative —
`apple-icon.tsx` mit `ImageResponse` — wurde verworfen: Die erzeugte Route trüge **keine
`.png`-Endung** und liefe damit durch den Middleware-matcher.

**⑤ Nur A behoben, B und C bewusst nicht.** Der Versatz und die tote Tab-Leiste sind
nach der Diagnose Folgen des Moduswechsels. Ein Eingriff an `.frame`, `100dvh` oder den
Safe Areas hätte drei Pflaster übereinander gelegt — und LL-6 sagt, dass genau dort
`position: fixed` bricht, **während die Prüfstrecke grün bleibt**. Gemessen wird nach
der Abnahme (S11).

**⑥ Der Vorbehalt steht im Kopf der Testdatei, nicht nur im Review.** Sieben grüne
Wächter sehen nach Sicherheit aus. Sie prüfen die Aussage, nicht das Verhalten von iOS.
Wer das in sechs Monaten liest, soll es an der Datei sehen und nicht in einem Review
suchen müssen.

---

## 6. Offene Punkte und Fragen

| | |
|---|---|
| **Die Abnahme am Gerät (A9)** | Steht aus. Ablauf S8–S11 im Briefing. **S8 ist nicht optional:** Das alte Symbol muss gelöscht werden, sonst testet man den alten Zustand und hält den Fix für wirkungslos. |
| **Brechen „Karten" und „Verlauf" genauso?** | Die Diagnose sagt ja; beide liegen nicht auf der Startadresse. Nie geprüft — der Nutzer hatte nur „Zuordnen" getippt. Bricht **nur** Zuordnen, ist die Diagnose falsch. Nach dem Fix nur noch mit dem **alten** Symbol nachholbar. |
| **Bleiben Versatz und tote Tab-Leiste?** | Erwartung: nein. Falls doch, ist das ein **eigener** Befund für einen eigenen Sprint. |
| **`MB-H3` (Light-Mode)** | Das Manifest trägt genau eine Startfläche, und das ist die dunkle. Wird der Light Mode je abgenommen, ist das erneut zu entscheiden. |
| **Die 8 Lint-Fehler in `tests/`** | Vorbestehend, außerhalb des kanonischen Prüfbefehls. Wenn sie stören sollen, wäre das ein eigener Aufräum-Auftrag. |

---

## 7. Vorschläge für CLAUDE.md und Roadmap

**Roadmap:** in P0 erledigt (`MB-7` neu, Paket 20 wieder offen, Zahlen zeilengenau
nachgezählt: 80 Paket-Zeilen, 37 ✅, 43 offen, 20 Pakete davon 7 vollständig). In P3
wird `MB-7` auf 🟡 gesetzt — gebaut, aber **nicht abgenommen**.

**CLAUDE.md — fünf Patches, am 13.09.2026 vom User freigegeben und angewendet**
(`sprints/sprint_v3-04_doku_patches.md`, Anker einzeln auf Eindeutigkeit geprüft):

| | |
|---|---|
| **P1** | §9-Stand: stand auf v3-02 und behauptete „v3-03 ist dieser Sprint" — v3-03 liegt seit dem 13.09.2026 in `main` (PR #60) |
| **P2** | Der Erzähl-Kasten erzählte v3-01 und v3-02 nach; beide stehen vollständig in der Historie. Ersetzt durch v3-03/v3-04, **kürzer** |
| **P3** | „Nächste Arbeit" stand auf v3-03 |
| **P4** | §6 **Stolperfalle 34** (unten) |
| **P5** | §8 **LL-47** |

**Wirkung auf den Umfang: 1.460 → 1.478 Zeilen (+18), 92 % ausgeschöpft.** Angekündigt
waren +14 — es wurden vier mehr. Alle drei Grenzen halten, **einschließlich Erzählzone
und Regelanteil**; die Warnung bei über 90 % bleibt bestehen und war schon vorher da.
Wächter: `claude-md-umfang.spec.ts`, 5/5 grün.

**Die neue Regel — sechste Gestalt von LL-26, aber mit umgekehrter Suchrichtung:**

> **Eine Zusage kann fehlen, ohne dass irgendein Code fehlt.** `/mobil` erklärte seit
> v3-02, **dass** es im Vollbild laufen will, nie **welche Adressen** dazugehören. Das
> Gerät entschied deshalb selbst — anhand der Startadresse — und öffnete jeden anderen
> Tab im eingebetteten Browser, **obwohl gar keine Seite neu geladen wird**.
>
> **Kein Wächter dieses Projekts fängt das:** 301 grüne Tests, darunter elf
> Render-Prüfungen bei exakt 430 × 932. Chromium kennt weder den Vollbild-Modus noch
> die Zugehörigkeits-Prüfung. **Jede Zahl war richtig, jede Seite rendert korrekt** —
> die App war nur nicht mehr die App.
>
> **Die Suchrichtung ist neu.** Die bisherigen fünf Gestalten von LL-26 sitzen alle in
> etwas, das **da ist**: eine Menge zu kurz, eine Regel zweimal formuliert, ein
> Vergleich zu eng, ein Zeitbezug fehlt, der falsche Teil gezeigt. Diese sitzt in etwas,
> das **gar nicht existiert** — und wonach man deshalb nicht greppt. **Frage:
> Verlässt sich die Umgebung auf eine Angabe, die wir nie gemacht haben?**
>
> Verwandt mit LL-30 (der entscheidende Zustand lebt außerhalb des Repos — dort ein
> Web-Portal, hier das Gedächtnis eines abgelegten Symbols) und mit LL-22 (eine Zusage
> über Verhalten ist keine Prüfung).

**Und ein Nebenprodukt, das der User behalten oder wegwerfen kann:**
`.claude/skripte/roadmap-zahlen.py` zählt die Roadmap-Zahlen zeilengenau aus. Es ist
beim Nachzählen für P0 entstanden, rein lesend, und deckt eine Routine ab, die bei
**jedem** Sprint-Abschluss anfällt (Schritt 5 verlangt „zeilengenau nachzählen, nicht
schätzen"). Entspricht dem Wunsch vom 04.09.2026, wiederkehrende Arbeit zu
automatisieren statt sie zu notieren.
