# Doku-Patches — Sprint v2-32 (P2)

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
