# Doku-Patches — Sprint v2-32 (P2 · P3 · P4)

> **Verfahren:** §7 Regel 14 / LL-16 — Anker + Patch-Satz je Stelle, danach angewendet.
> **Datum:** 04. September 2026 · Branch `sprint/v2-32-aufraeumen`
> **Umfang:** die vier Führungs-Dokumente auf einen Stand. Kein Byte in `src/` oder
> `supabase/`.

---

## Was P2 überhaupt zu reparieren hat

| # | Stelle | Befund |
|---|---|---|
| A1 | `CLAUDE.md` Kopf, Z. 11–15 | sagt „nach **v2-30**", „Alles bis **v2-30** ist in `main`", „PR #48" — **drei Angaben, alle überholt** |
| A2 | `CLAUDE.md` §9, Z. 1176–1182 | sagt „**v2-31 liegt als Pull Request vor und ist NICHT gemergt**" — #51 ist gemergt, ebenso #52 und #53 |
| A3 | `CLAUDE.md` §6 Stolperfalle 18 | nennt **77** Karten (Stand v2-24); am 03.09.2026 gemessen: **178** |
| A4 | `CLAUDE.md` §9 „Was offen ist" | die beiden offenen Punkte vom 03.09.2026 fehlen |
| A5 | `CLAUDE.md` §9 Stand-Tabelle | Datum und „Nächste Arbeit" überholt |
| B1 | `sprints/projekt_historie.md` | **kein Eintrag** für die Behebung vom 03.09.2026 (PR #53) |
| C1–C4 | `V2/v2_roadmap_konsolidiert.md` | **0 Treffer** für den Visa-Import-Fix; Stand und Zahlen überholt |
| D1 | `antigravity_finance_schema_summary.md` | Version steht auf **3.16.0**, ein Changelog-Eintrag **v3.16.0 existiert nicht** |
| E | `antigravity_finance_design_dokument.md` | **keine Änderung** — v3.13.1 vom 03.09.2026 ist aktuell und deckt PR #52 ab |

> ### Warum A1 nicht bloß korrigiert, sondern **entfernt** wird
>
> Die Aussage „was liegt in `main`" stand an **zwei** Stellen — im Kopf und in §9.
> Genau deshalb war sie an einer davon falsch: Der Kopf blieb bei v2-30 stehen,
> während §9 schon v2-31 nannte. **Niemand hat sich geirrt**; es hat nur jemand eine
> von zwei Stellen gepflegt.
>
> Diese Datei hat dieselbe Lehre am 24.08.2026 schon einmal gezogen — für die
> Doku-Versionsnummern, die es **zweimal** erwischt hatte (17.08. und 19.08.). Der
> Schluss stand danach wörtlich in §9: *„Ein Wert, der an zwei Stellen steht, ist an
> einer davon irgendwann falsch … Die einzige verlässliche Abhilfe ist, ihn **nicht zu
> duplizieren**."*
>
> **Der Kopf verweist ab jetzt auf §9, statt die Aussage zu wiederholen.** Das ist
> dieselbe Konsequenz, ein zweites Mal angewandt — und der Grund, warum sie hier
> nicht noch einmal ausführlich begründet wird: Sie steht bereits in §9.
>
> **Zusätzlich fallen die PR-Nummern weg.** Eine PR-Nummer altert schneller als ein
> Sprint-Name und sagt weniger; sie ist außerdem mit einem Befehl nachschlagbar. Was
> bleibt, ist die Sprint-Ebene — und die Prüfregel, die schon dastand: **gegen den
> Baum prüfen (`git ls-tree origin/main`), nicht gegen den PR-Status.**

---

## A1 · CLAUDE.md — Kopf

**Anker (Zeile 11–15):**

```
> **Letzte Aktualisierung:** 27. August 2026 · **nach:** Sprint **v2-30**
> („Der Import passt wieder in die Zeit" — `PF-6`).
> **Alles bis einschließlich v2-30 ist in `main`** — PR #48 gemergt, Browser-Smoke
> bestanden, gegen den Baum geprüft (`git ls-tree origin/main`), nicht gegen den
> PR-Status.
```

**Patch-Satz:**

```
> **Letzte Aktualisierung:** 4. September 2026 · **nach:** Sprint **v2-32**
> („Ein sauberer Tisch für das Re-Design").
> **Was in `main` liegt, steht an genau EINER Stelle: §9.** Bis zum 04.09.2026 stand
> es hier ein zweites Mal — und war hier falsch, während §9 recht hatte.
```

---

## A2 · CLAUDE.md — §9, Kopfzeilen

**Anker (Zeile 1176–1182):**

```
**Letzter Sprint:** **v2-31** („Verlauf je Karte und je Ordner" — `M7` `KAT-4`,
31.08.2026) · **davor:** v2-30 (`PF-6`), v2-29 (`ZO-5`), v2-28 (`DA-3` `ZO-4`
`NAV-1`), v2-27 (`DA-1` `ZO-3`), v2-26 (`KJ-6`…`KJ-9`), v2-25 (`KJ-1` `KJ-2` `KJ-3`),
v2-24 (`PF-1` `PF-2` `PF-4`).
**Alles bis einschließlich v2-30 ist in `main`** — PR #48 gemergt, Browser-Smoke
bestanden, gegen den Baum geprüft (`git ls-tree origin/main`), **nicht** gegen den
PR-Status. **v2-31 liegt als Pull Request vor und ist NICHT gemergt.**
```

**Patch-Satz:**

```
**Letzter Sprint:** **v2-32** („Ein sauberer Tisch für das Re-Design", 04.09.2026)
· **davor:** v2-31 (`M7` `KAT-4`), v2-30 (`PF-6`), v2-29 (`ZO-5`), v2-28 (`DA-3`
`ZO-4` `NAV-1`), v2-27 (`DA-1` `ZO-3`), v2-26 (`KJ-6`…`KJ-9`), v2-25 (`KJ-1` `KJ-2`
`KJ-3`), v2-24 (`PF-1` `PF-2` `PF-4`).

**Alles bis einschließlich v2-31 ist in `main`**, dazu die beiden Fixes vom
03.09.2026 (durchgehende Verlaufslinie · blockweiser CSV-Import). Geprüft **gegen den
Baum** (`git ls-tree origin/main`), **nicht** gegen den PR-Status — der lügt nicht,
aber er beantwortet eine andere Frage. **v2-32 ist dieser Sprint** und liegt bis zur
Freigabe als Pull Request vor.
```

---

## A3 · CLAUDE.md — §6 Stolperfalle 18 (die Kartenzahl)

**Anker (Zeile 587–590):**

```
    das war **richtig, als es geschrieben wurde**. Bei **77** Karten waren daraus
    **179 Netzrunden je Dashboard-Aufbau** geworden, und jede neue Karte kostete vier
    weitere.
```

**Patch-Satz:**

```
    das war **richtig, als es geschrieben wurde**. Bei **77** Karten waren daraus
    **179 Netzrunden je Dashboard-Aufbau** geworden, und jede neue Karte kostete vier
    weitere. **Am 03.09.2026 nachgemessen: 178 aktive Karten** — in neun Monaten mehr
    als verdoppelt. Die Zahl steht hier mit Datum, weil genau das die Regel dieses
    Eintrags ist.
```

> **Warum die 77 stehenbleibt und nicht durch 178 ersetzt wird.** Sie ist kein
> veralteter Sollwert, sondern eine **historische Messung** — sie beschreibt, wie es
> zum N+1 kam. Ersetzte man sie, ginge der Vorfall verloren und übrig bliebe eine
> Checkliste; §8 dieses Projekts sagt, dass eine Regel ohne ihren Vorfall nicht
> gelesen wird. **Richtig ist, die heutige Zahl danebenzustellen — mit Datum.** Genau
> das verlangt LL-28 im eigenen Regelsatz.

---

## A4 · CLAUDE.md — §9 „Was offen ist und eine Entscheidung braucht"

**Anker:** die Tabellenzeile

```
| **`KAT-5` / `A2`** | entschieden und ungebaut. Alle übrigen Beschlüsse der Runden vom 06.08. und 07./08.08.2026 sind umgesetzt. |
```

**Patch-Satz:** dieselbe Zeile, davor eingefügt:

```
| **`PF-9`** | **Der gemessene Datenbank-Hebel aus dem 03.09. ist ungenutzt.** Der Planer zieht `calculate_match_confidence` vor `is_card_active_in_month` und rechnet damit auch in Monaten ohne jede aktive Karte. Eine Optimierungs-Sperre kehrt das um: Juni 2023 **128 ms → 9,8 ms**. Für einen normalen Monatsimport bringt es nur ~25 %. Eingriff in `process_csv_import`, also §7 Regel 20 — eigener kleiner Sprint. Beleg: `V2/befunde_2026-09-03_visa-import-timeout.md` §5. |
| **Die 2.031 Zahlungen aus 2020–2024** | Der Visa-Jahresexport enthält sie; die App modelliert 2025 und 2026. Dort ist **keine Karte aktiv** — sie bekämen weder Zuordnung noch Vorschlag und lägen als offene Zahlungen neben einer gerade abgeschlossenen Kuratierung. **Auf die Sparrate wirken sie nicht.** Empfehlung des Befunds: Export bei der DKB auf 2025+2026 eingrenzen (~504 Zeilen). Nachholbar, weil der Import idempotent ist. |
```

---

## A5 · CLAUDE.md — §9 Stand-Tabelle

**Anker:**

```
| | Stand 31.08.2026 |
```

**Patch-Satz:**

```
| | Stand 04.09.2026 |
```

**Anker:**

```
| **Nächste Arbeit** | **offen.** Die Kuratierung ist durch; der nächste Sprint kommt aus der Roadmap. |
```

**Patch-Satz:**

```
| **Nächste Arbeit** | **Das Re-Design der Oberfläche** (Paket 19), geplant mit Fable 5.1 in einer eigenen Sitzung. Davor nichts Zwingendes — die Kuratierung ist durch. |
```

---

## B1 · sprints/projekt_historie.md — Eintrag für den 03.09.2026

**Regel der Datei: append-only.** Der Eintrag kommt ans Ende, bestehende werden nicht
umgeschrieben.

**Anker:** Dateiende (nach dem Block „Offen nach v2-31").

**Patch-Satz:** neuer Abschnitt `### Nachtrag zu v2-31 · 03. September 2026 — der
Visa-Jahresexport ließ sich nicht importieren`. Inhalt siehe angewandte Fassung; er
fasst `V2/befunde_2026-09-03_visa-import-timeout.md` auf das zusammen, was für eine
spätere Sitzung zählt.

> **Warum dieser Eintrag überhaupt fehlte.** Die Behebung lief als **Fix ohne Sprint**
> (`fix/visa-import-grosse-datei`, PR #53). `sprint-abschluss` greift nur bei
> Sprints — und `doku-vollstaendigkeit.spec.ts` prüft, ob jeder Sprint **mit
> Review-Datei** in der Historie steht. Ein Fix ohne Review-Datei fällt durch **beide**
> Netze. Das ist keine Nachlässigkeit, sondern eine Lücke in der Bauart der Prüfung;
> sie ist in P5 mitzudenken.

---

## C · V2/v2_roadmap_konsolidiert.md

**C1 — Stand-Zeile.** Auf den 04.09.2026 nach v2-32 nachziehen.

**C2 — Paket 17, zwei neue Zeilen:**

```
| PF-8 | Ein Jahresexport (2.535 Zeilen) reißt das 8-Sekunden-Zeitlimit | Fehler | nein | ✅ | **Am 03.09.2026 im Frontend behoben** (`src/lib/csv-batches.ts`, Wächter `tests/e2e/csv-blockbildung.spec.ts`). Die Datei war nie fehlerhaft — Parser 4 ms, 2.535 Zeilen, 271 KB. `process_csv_import` läuft als **ein** Statement gegen `statement_timeout = 8s` der Rolle `authenticated`. Der Import läuft jetzt blockweise. Beleg: `V2/befunde_2026-09-03_visa-import-timeout.md`. |
| PF-9 | Die Konfidenz wird auch in Monaten ohne jede aktive Karte gerechnet | Fehler | **ja** | ⬜ | Der Planer zieht `calculate_match_confidence` vor `is_card_active_in_month`. Eine Optimierungs-Sperre (`OFFSET 0` oder `MATERIALIZED`-CTE) kehrt das um — **Juni 2023: 128 ms → 9,8 ms**, Januar 2025 (28 Karten): 128 → 96 ms. Für die Altjahre Faktor 13, für einen normalen Monatsimport ~25 %. **Die Blockbildung bliebe trotzdem nötig.** Eingriff in `process_csv_import` ⇒ §7 Regel 20: Probe auf der Übungs-Datenbank, Anker vorher/nachher, menschliche Freigabe. |
```

**C3 — Hausaufgabe (§2):** Entscheidung über die 2.031 Zahlungen aus 2020–2024.

**C4 — §0 Zahlen** neu auszählen, zeilengenau. Das ist dort schon zweimal
schiefgegangen und wird deshalb gezählt, nicht geschätzt.

---

## D1 · antigravity_finance_schema_summary.md — der fehlende Changelog v3.16.0

**Befund:** Zeile 3 sagt `**Version:** 3.16.0`, die Status-Zeile nennt
„Sprint v2-31 Verlaufs-Reihen", und §4 führt die beiden neuen Funktionen. **Ein
Changelog-Eintrag `v3.16.0` existiert nicht** — der neueste ist `v3.15.0` (v2-30).

**Anker:** die Zeile vor `> **Changelog v3.15.0 (27.08.2026, Sprint v2-30):**`

**Patch-Satz:** Eintrag `v3.16.0 (31.08.2026, Sprint v2-31)` davor einfügen.

> **Warum das mehr ist als Kosmetik.** Der Changelog ist die einzige Stelle, an der
> steht, **was sich wann geändert hat**. Fehlt ein Eintrag, während die Versionsnummer
> weitergezählt wurde, entsteht genau der Zustand, den `doku-vollstaendigkeit.spec.ts`
> für die Historie verhindert — **ein Verweis, der ins Leere läuft**. Und er ist von
> außen nicht als Lücke erkennbar: Die Datei sieht vollständig aus, weil die Version
> stimmt.

---

## E · antigravity_finance_design_dokument.md — keine Änderung

Version **3.13.1** vom 03.09.2026, Changelog deckt den Nachtrag zu v2-31 (durchgehende
Verlaufslinie, PR #52) vollständig ab. **Für das anstehende Re-Design ist das die
wichtigste Datei überhaupt** — sie ist geprüft und aktuell. Nichts zu tun.

---

## P3 · CLAUDE.md verschlanken — und warum die ursprüngliche Diagnose falsch war

> **Diese Phase hat mit einer Korrektur an sich selbst begonnen.** Dem User war
> vorgelegt worden: *„CLAUDE.md steht bei 1.509 von 1.600 Zeilen (94 %) — jetzt
> kürzen?"* Er hat zugestimmt. **Die Frage war schlecht gestellt.**

### Was die Messung ergab

Die Fähigkeit `claude-md-pflege` verlangt, vor jeder Kürzung **alle drei** Grenzen zu
lesen, nicht nur die gerissene:

| Grenze | Ist | Bewertung |
|---|---|---|
| Zeilen gesamt | 1.516 / 1.600 | **95 %** — eng |
| Erzählzone | 126 / 150 | 84 % — **schlank** |
| Regelanteil | **50 %** | über dem Mindestwert 45 % · über den 49 % bei Einführung |

Und die Fähigkeit ist für genau diesen Fall eindeutig:

> *„Ist sie allein gerissen, während ② und ③ grün sind, ist die Datei tatsächlich aus
> **Regeln** gewachsen. **Dann ist Kürzen die falsche Antwort.**"*

**§6 + §7 + §8 waren 752 Zeilen.** „Kürzen" hätte hier bedeutet: Regeln wegwerfen —
und mit ihnen die Vorfälle, an denen sie haften. §8 sagt, warum das teuer wäre: *Eine
Regel ohne ihren Vorfall wird zur Checkliste, und Checklisten werden nicht gelesen.*

### Was stattdessen geschnitten wurde

Ausschließlich **doppelt erzählte Beschreibung**. Jede Streichung wurde vorher gegen
die Zieldatei belegt.

| | Was | vorher | nachher | Beleg, dass nichts verloren geht |
|---|---|---|---|---|
| **A** | §2 — die Dublin-Entscheidung in **drei** Kästen | 78 Z. | 23 Z. | Regel in §6 Stolperfalle 20 (LL-30) · vollständige Messung in Roadmap `PF-4` · 6 Treffer in der Historie |
| **B** | §3 — derselbe Stoff ein **viertes** Mal | 12 Z. | 6 Z. | §2 |
| **C** | §9 — nacherzählter Roadmap-Stand ab „Offene Themen" | 101 Z. | 14 Z. | jede Aussage einzeln in der Roadmap nachgewiesen (Paket 1/2/3/4 ✅, `M6`, `ZO-1`/`ZO-5`/`ZO-6`, `M2`/`M5`, `B2-R`, `DA-2`) |

**Vorher übertragen, nicht gestrichen:** Der Kasten zu `B2-R` trug eine Lehre, die
**nirgends sonst als Regel stand** — ein Delta von **0,0022 €** rundet auf 0,00 und
fällt aus der Anzeige, verschiebt die Summe aber trotzdem; wer die B2-Invariante um
einen Cent verfehlt, sucht in den **angezeigten** Zeilen und findet dort nichts. Sie
steht jetzt in **§6 Stolperfalle 9**. Genau diese Reihenfolge verlangt die Fähigkeit:
erst übertragen, dann streichen.

### Ergebnis

| | vorher | nachher |
|---|---|---|
| Zeilen gesamt | 1.516 (95 %) | **1.397 (87 %)** |
| Erzählzone | 126 | 126 (unverändert) |
| **Regelanteil** | 50 % | **54 %** |
| §6 + §7 + §8 | 752 Z. | **759 Z.** — *gewachsen* |
| Nicht-Regel außerhalb der Erzählzone | 638 Z. (42 %) | 512 Z. (37 %) |

**Der Regelblock ist größer geworden, während die Datei um 119 Zeilen schrumpfte.**
Das ist dasselbe Muster wie in v2-29 und der Grund, warum der Regelanteil überhaupt
gemessen wird: Eine reine Zeilenzahl hätte beide Zustände gleich beurteilt.

---

## P3b · Der blinde Fleck des Wächters — Prüfung ⑤

**Beim Schneiden von C fiel auf, warum diese 101 Zeilen überhaupt entstehen konnten.**

Der Wächter misst die Erzählzone als *Vorspann + §9 **bis zur Überschrift „Die
Prüfanker"***. Die 101 Zeilen standen **dahinter**. Sie zählten damit weder als
Erzählung noch als Regel — **sie lagen zwischen zwei Messungen** und konnten wachsen,
während alle drei Grenzen grün blieben.

**Prüfung ⑤** misst jetzt die Zone ab `**Offene Themen:**` bis zum Dateiende, Grenze
**30 Zeilen** (Stand nach v2-32: 14).

> ### Der Beweis, dass sie auslösen kann — und was er nebenbei zeigt
>
> §7 Regel 27 (LL-40) verlangt, den Fehler **einmal absichtlich einzubauen** und rot
> zu sehen. Eingebaut: 25 Zeilen im Stil des gestrichenen Roadmap-Stands.
>
> **Ergebnis: ⑤ rot — ①, ②, ③ und ④ blieben GRÜN.**
>
> Das ist mehr als der geforderte Nachweis. Es belegt den blinden Fleck direkt:
> **25 Zeilen Roadmap-Abschrift hätten von den bestehenden drei Grenzen keine
> ausgelöst.** Die Datei lag mit ihnen bei 1.422 von 1.600 Zeilen — bequem im grünen
> Bereich. Genau so sind die 101 entstanden.
>
> Danach zurückgenommen, 8/8 grün, Vorwarnung verschwunden.

**Das ist LL-30, angewandt auf einen Wächter statt auf eine Doku-Zeile:** Was nicht
gemessen wird, wächst — und eine Messung, die ihre eigenen Ränder nicht kennt, sieht
aus wie Abdeckung.

---

## P4 · Das Re-Design bekommt einen Platz — und `design-system/` wird gemessen

### Warum das ein eigenes Paket braucht

**„Re-Design" hatte in der Roadmap null Treffer.** Das ist exakt der Zustand, den
Paket 17 für Performance beschreibt: *Ein Thema, das nicht in der Liste steht,
konkurriert unsichtbar mit allem anderen und verliert gegen das, was gerade lauter
ist.* Neu ist **Paket 19 · Re-Design der Oberfläche**, mit vier Punkten.

### Die Messung, die den Zuschnitt bestimmt hat

Der Design-Direktor beurteilt **Bilder, keine Beschreibungen** (CLAUDE.md §4). Also
wurde gezählt, wie viele Bilder es gibt:

| | |
|---|---|
| Sichtbare Komponenten laut Design-Doku | **7** (§5 Ring · §6 Header/Timeline · §7 Karten · §8 Untere Interaktionszone · §9 Welle · §10 Income/Partner-Split · §11 CSV-Import) |
| Davon mit einer Seite unter `design-system/komponenten/` | **3** — Ring, Karten, Welle (dazu Kategorien und Verlauf als Teilansichten) |
| **Ohne jede Seite** | **4** — Header/Timeline · Untere Interaktionszone (Rohmasse) · Income/Partner-Split · CSV-Import |

**Fable würde neu gestalten, was es sehen kann, und den Rest raten.** Deshalb ist
`RD-1` die erste Arbeit des Pakets und nicht die zweite.

### Der zweite Fund: die Foundation-Seiten schreiben ab, statt zu benutzen

`design-system/foundations/typografie.html` enthält **null** `var(--typo-*)` und nennt
**keinen einzigen** Token-Namen — sie setzt px-Werte hart. `src/styles/tokens.css`
definiert **21 `--typo-*`-Tokens**.

**Heute stimmen die Werte noch.** Alle sieben Größen (34 · 22 · 17 · 13 · 13 · 10 ·
9 px) sind auf der Seite vertreten; es gibt **keinen Drift**. Aber nur, weil bisher
niemand ein Token geändert hat — und genau das wird das Re-Design tun.

> **Das ist LL-30 an einer neuen Stelle:** derselbe Wert an zwei Orten, einer davon
> ohne Prüfung. Die Besonderheit hier ist, dass der Ort, der veraltet, das
> **Anschauungsmaterial** ist. Ein überholtes Bild ist schlimmer als gar keines: Es
> sieht aus wie der Stand.

### Der Vorspann der Roadmap — dasselbe Muster, ohne Wächter

Der Kopf trug eine Kette von **neun** nacherzählten Sprintständen (v2-31 zurück bis
v2-18), die mit jedem Sprint länger wurde. **27 Zeilen raus**, ersetzt durch den
aktuellen Stand plus den Verweis auf die Historie — dieselbe Konsequenz, die CLAUDE.md
in v2-29 für sich gezogen hat.

**Bemerkenswert:** Paket 19 hat genau **27 Zeilen** hinzugefügt. Die Datei ist gleich
lang geblieben und trägt jetzt mehr Inhalt.

### §0 neu ausgezählt — und ein Zählfehler, der hierher gehört

| | nach v2-31 | Δ | nach v2-32 |
|---|---|---|---|
| Paket-Tabellen | 65 | +6 | **71** |
| ✅ | 28 | +1 | **29** |
| ⬜ (davon 🔎) | 33 (3) | +5 (+1) | **38 (4)** |
| 🟡 | 4 | 0 | **4** |
| Hausaufgaben | 4 | +1 | **5** |
| §4 Erledigt | 68 | +1 | **69** |
| Pakete (davon fertig) | 18 (7) | +1 | **19 (7)** |
| **Offen gesamt** | 41 | +6 | **47** |

**Keiner der sechs neuen Punkte ist neue Arbeit.** Fünf standen schon da und nirgends
geschrieben (`PF-9`, Hausaufgabe `V1`, `RD-1` bis `RD-4`); der sechste (`PF-8`) war
bereits erledigt, als er eingetragen wurde.

> ### ⚠️ Der Zählfehler, und warum er im Papier bleibt
>
> Gezählt wurde mit einem Skript, weil die Datei selbst festhält, dass das Schätzen
> hier **zweimal** schiefgegangen ist. Das Skript nahm die erste Tabellenzelle, die mit
> einem Statuszeichen **beginnt**. Bei `M6` steht in der *Datenbank*-Spalte **„✅ ja"** —
> der Punkt wurde damit als **erledigt** gezählt statt als **teilweise**.
>
> **Die Summe stimmte trotzdem:** 29 ✅ + 3 🟡 ergibt dasselbe wie 28 + 4. Eine
> Plausibilitätsprüfung über die Gesamtzahl hätte den Fehler **nicht** gefunden.
> Sichtbar wurde er nur durch den Abgleich **gegen die vorherige Auszählung**, Zeile
> für Zeile — 65 + 6 Zeilen, 28 + 1 ✅, 33 + 5 ⬜, und dort passte 🟡 nicht.
>
> **Die Regel daraus:** Eine Statuszelle enthält **ausschließlich** Statuszeichen. Und
> wer neu auszählt, hält das Ergebnis gegen die letzte Zählung **plus die eigenen
> Änderungen** — nicht gegen die eigene Erwartung.
