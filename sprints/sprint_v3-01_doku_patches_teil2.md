# Sprint v3-01 — Doku-Patches, Teil 2 (beschreibende Abschnitte)

> **Teil 1** (`sprint_v3-01_doku_patches.md`) hat §3, §8 und §11 vor dem Code
> angepasst — die **normativen** Stellen. Teil 2 zieht die **beschreibenden** nach:
> §3 (zwei entfallene Tokens), §5, §6, §7 und §11. Ihre Werte standen erst nach
> dem Bau fest.
>
> Verfahren wie immer: Anker + Patch-Satz, angewendet durch `docs-maintainer`,
> nie direkte Bearbeitung (§7 Regel 14 / LL-16).
>
> **Version:** 3.14.0 → **3.14.1** (Patch-Bump: keine Regel ändert sich, es werden
> Beschreibungen an den gebauten Stand angeglichen).

---

## Patch 1 · Kopfzeile

**Anker:**
```
**Version:** 3.14.0 (V3 · Sprint v3-01 — Apple-Redesign: Tokens und Fragment-Invariante)
```
**Patch-Satz:**
```
**Version:** 3.14.1 (V3 · Sprint v3-01 — Apple-Redesign vollständig nachgezogen)
```

---

## Patch 2 · Changelog-Eintrag, direkt VOR „Changelog v3.14.0"

**Anker:**
```
> **Changelog v3.14.0 (06.09.2026, Sprint v3-01 · Apple-Redesign, Teil 1 von 2):**
```
**Patch-Satz — davor einfügen, mit einer Leerzeile Abstand:**
```
> **Changelog v3.14.1 (06.09.2026, Sprint v3-01 · Teil 2 von 2):** Die
> beschreibenden Abschnitte sind an den gebauten Stand angeglichen — §5
> (Zentrumszahl), §6 (Flanken, Chevrons, Schranke), §7 (Karten-Maße,
> Zustands-Katalog, Haushaltsbetrag, Fälligkeitstag) und §11 (Fragment-Typografie).
> **Keine Regel ändert sich**, deshalb Patch-Bump.
>
> Zusätzlich zwei Token-Zeilen aus §3 entfernt, die Teil 1 selbst überholt hat:
> `--border-category` und `--border-category-stack` gibt es seit Schritt 4 nicht
> mehr — die Ordner-Kachel trägt denselben Rand wie jede Karte (`--border-subtle`).
> Sie wurden aus `tokens.css` gelöscht, **nachdem** gemessen war, dass kein Modul
> sie mehr liest.
```

---

## Patch 3 · §3 — zwei entfallene Tokens

**Anker:**
```
| `--border-category` | `rgba(255,255,255,.13)` | Rahmen der Ordner-Kachel |
| `--border-category-stack` | `rgba(255,255,255,.09)` | Rahmen der zweiten Stapelkante |
```
**Patch-Satz — beide Zeilen ersatzlos entfernen** (leer ersetzen).

---

## Patch 4 · §5 — Zentrumszahl

**Anker:**
```
| Font-Size | `34px` |
| Font-Weight | `200` |
| Letter-Spacing | `-1.8px` |
```
**Patch-Satz:**
```
| Font-Size | `36px` |
| Font-Weight | `300` |
| Letter-Spacing | `-1.4px` |
```

---

## Patch 5 · §6 — Flanken und Chevrons

**Anker:**
```
**Flanken:**
- Font: `13px`, `font-weight: 500`, `rgba(255,255,255,.38)`
- Opacity Default: `0.85` · Disabled: `0.2`
- Subzeile: `10.5px`, `rgba(255,255,255,.18)`

**Chevrons:**
- `26×26px`, `border-radius: 50%`
- Default: `opacity: 0` (unsichtbar)
- Hover: `opacity: 1`, Background: `rgba(255,255,255,.07)`

**Trennlinie:** `0.5px solid rgba(255,255,255,.06)`
```
**Patch-Satz:**
```
**Flanken:**
- Font: `13px`, `font-weight: 500`, `--text-secondary`
- **Keine Container-Deckkraft** (bis v3-01: `0.85`) — die Textstufen tragen die
  Abstufung selbst. Disabled: `opacity: 0.35`
- Subzeile: `12px`, `--text-tertiary`. **Bei offenen Fragmenten eine Stufe heller**
  (`--text-secondary`): „3 Fragmente offen" ist eine Aufgabe, „Alles erledigt" eine
  Bestätigung — die einzige Stelle im Header, die zu einer Handlung auffordert.
  Keine Farbe, denn unzugeordnete Fragmente sind kein Fehler, nur Arbeit.

**Chevrons:**
- `28×28px`, `border-radius: 50%`, Fläche `--neutral-fill`, Strich `1.6px`
- **Dauerhaft sichtbar.** Bis v3-01 standen sie auf `opacity: 0` und erschienen erst
  beim Hover über den ganzen Header — auf einem Telefon also nie. Ein
  Navigationselement, das nur bei Hover existiert, existiert für die Hälfte der
  Nutzer nicht. 28 px sind zugleich die kleinste ohne Frust treffbare Fläche; die
  ganze Flanke bleibt Link, der Kreis zeigt nur, **wo**.
- Hover: Fläche `--border-ghost`

**Trennlinie:** `1px solid --border-subtle`
```

---

## Patch 6 · §6 — untere Schranke

**Anker:**
```
| Kein Vormonat | Linke Flanke `opacity: 0.2`, `pointer-events: none` |
```
**Patch-Satz:**
```
| Kein Vormonat | Linke Flanke `opacity: 0.35`, `pointer-events: none` — bei `0.2` war nicht mehr erkennbar, **dass** dort eine Schranke ist |
```

---

## Patch 7 · §7 — Karten-Maße

**Anker:**
```
| Border-Radius | `14px` |
| Padding | `14px 13px 12px` |
| Opacity (aktiv) | `0.75` |
| Opacity (Ghost) | `0.65` |
| Hover Opacity | `0.95` |
| Hover Transform | `translateY(-2px)` |
```
**Patch-Satz:**
```
| Border-Radius | `16px` (`--radius-card`) |
| Padding | `14px 13px 12px` |
| Deckkraft | **keine** — v3 Regel 3: eine Deckkraft auf dem Container multipliziert sich mit jeder Deckkraft darin. Das Statuswort „Offen" lag bei 38 % × 0,75 = effektiv 28 % Weiß. Gedimmt wird am Text, nie an der Box |
| Hover | `translateY(-2px)` **und** Fläche `--bg-card-hover` (bis v3-01: `opacity: 0.95`) |
```

---

## Patch 8 · §7 — Vorspann des Zustands-Katalogs

**Anker:**
```
### Fixkosten-Karte — 3 Zustände
```
**Patch-Satz — davor einfügen:**
```
> ### ⚠️ Die Flächen- und Randangaben der folgenden Zustände sind ab v3-01 hinfällig
>
> **Alle Karten teilen EINE Fläche (`--bg-card`) und EINEN Rand
> (`--border-subtle`).** Der Zustand sitzt an genau zwei Stellen: dem 18-px-Punkt
> oben rechts und dem Statuswort. Die je Zustand genannten Hintergründe
> (`#160D0D`, `#0A140E`, `#160A08`, `#0D1A16`) und Zustandsränder gibt es nicht
> mehr; die Tokens dafür sind aus `tokens.css` entfernt.
>
> **Der Grund steht in Regel 1 und 2 des v3-Systems:** Vier Stellen sagten
> dasselbe — Fläche, Rand, Typ-Label und Statuswort. Und „Offen" ist der
> Normalzustand von rund 80 % aller Karten an 80 % aller Tage; er trug dieselbe
> Farbe wie „Budget überschritten".
>
> **Was unverändert gilt:** die Zustände selbst, ihre Wortlaute, die
> Tap-Interaktionen und die Regel „Realität gewinnt" je Kartentyp. Nur die
> Darstellung ist eine andere. Die gebauten Werte je Zustand stehen in
> `design-system/v3/komponenten/karten.html`.

### Fixkosten-Karte — 3 Zustände
```

---

## Patch 9 · §7 — Haushaltsbetrag

**Anker:**
```
| Schriftgröße | `10px`, Weight `400`, `tabular-nums`, `white-space: nowrap` |
| Farbe | `--text-muted` (`rgba(255,255,255,.45)`) in **allen** Zuständen |
```
**Patch-Satz:**
```
| Schriftgröße | `11px`, Weight `400`, `tabular-nums`, `white-space: nowrap` |
| Farbe | `--text-tertiary` in **allen** Zuständen |
```

---

## Patch 10 · §7 — Fälligkeitstag

**Anker:**
```
| Schriftgröße | `9px`, Weight `500`, `white-space: nowrap` |
| Farbe | `rgba(255,255,255,.30)` |
```
**Patch-Satz:**
```
| Schriftgröße | `11px`, Weight `500`, `white-space: nowrap` |
| Farbe | `--text-tertiary` |
```

---

## Patch 11 · §7 — Ghost dimmt den Termin nicht mehr eigenständig

**Anker:**
```
**Im Ghost-/Forecast-Zustand dimmt der Termin eigenständig auf `rgba(255,255,255,.20)`.** Die Karten-Opacity (`0.65`) allein ließe ihn lauter wirken a
```
> *(Anker ist der Anfang dieses Absatzes; er ist im Dokument eindeutig. Der Rest
> des Satzes bleibt erhalten, nur der erste Satz wird ersetzt.)*

**Patch-Satz für den ersten Satz:**
```
**Im Ghost-/Forecast-Zustand trägt der Termin dieselbe Stufe wie sonst** (`--text-tertiary`). Der eigene, dunklere Ton ist mit v3-01 entfallen: Er war nötig, solange die Karten-Deckkraft (`0.65`) alles andere mitdimmte — ohne sie gibt es diesen Effekt nicht mehr, und eine fünfte Textstufe wäre genau die Beliebigkeit, die v3 abschafft.
```

---

## Patch 12 · §11 — Fragment-Typografie

**Anker:**
```
| Beschreibung | `10px`, `font-weight: 500` | `rgba(255,255,255,.28)` · truncated · zeigt den Verwendungszweck (§8, `RM-1`) |
| Datum | `9px` | `rgba(255,255,255,.15)` |
```
**Patch-Satz:**
```
| Beschreibung | `12px`, `font-weight: 500` | `--text-secondary` · truncated · zeigt den Verwendungszweck (§8, `RM-1`) |
| Datum | `11px` | `--text-tertiary` · trägt bei zugeordneten Fragmenten zusätzlich das Wort `· zugeordnet` |
```

> **Warum das Wort auf der Datumszeile steht und nicht hinter der Beschreibung**,
> wo der v3-Entwurf es zeigt: Gemessen mit dem echten Schriftstapel hat die
> Fragment-Karte **192 px** Inhaltsbreite, und drei von fünf echten Buchungstexten
> sind schon **ohne** den Zusatz zu lang (`Abrechnung 30.06.2026 siehe Anlage` =
> 218 px). Die Ellipse hätte genau das Wort abgeschnitten, das die Kontur erklärt.
> Der Entwurf zeigte „Miete August" — 76 px, einen kurzen erfundenen Text (LL-31).
> Wächter: `tests/e2e/rohmasse-stufen.spec.ts` ③.

---

## Patch 13 · §8 — Ordner-Kachel (Nachtrag)

> **Gefunden erst bei der Rest-Kontrolle nach Patch 12.** Die Tabelle nennt drei
> Dinge, die es nicht mehr gibt: den alten Grundton, ein **gelöschtes Token**
> (`--border-category`) und die linke Zustandskante, die Beschluss A vom 05.09.2026
> abgeschafft hat.

**Anker:**
```
| Grundton | `--bg-category` (`#131318`) — **neutral**, nicht rot oder türkis getönt |
| Rahmen | `1px solid --border-category` |
| Status-Icon | **keines** |
| Stapelkanten | zwei versetzte Kopien der Form via `box-shadow`; entfallen im aufgeklappten Zustand |
| Linke Kante | `2px` rot (`--border-category-open`), solange drinnen etwas offen ist · `2px` türkis (`--border-category-done`), wenn alles erledigt ist |
```
**Patch-Satz:**
```
| Grundton | `--bg-category` (`#1A1A20`) — **neutral**, eine Spur kühler und dunkler als die Karte |
| Rahmen | `1px solid --border-subtle` — **derselbe Rand wie jede Karte** |
| Status-Icon | **keines** — stattdessen ein Chevron (Richtung, nicht Zustand) |
| Stapelkanten | zwei versetzte Kopien der Form via `box-shadow`; entfallen im aufgeklappten Zustand |
| Linke Kante | **entfällt (Beschluss A, 05.09.2026).** Sie war der einzige Ort, an dem Rot und Türkis am Ordner auftraten, und sagte dasselbe wie die Flagge daneben. Rot für „drei Daueraufträge warten auf den 1." ist genau die Bedeutung, die v3 Regel 2 abschafft. Der Zustand steht jetzt nur als **Wort**: `[N] offen` neutral, `erledigt` türkis |
```
