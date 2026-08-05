# Doku-Patch 05.08.2026 — CLAUDE.md-Nachzug nach Sprint v2-10

**Ziel-Dokument:** `CLAUDE.md` (die Verfassung)
**Anlass:** Sprint v2-10 ist auf `main` gemerged. Zwei Punkte aus
`sprints/sprint_v2-10_review.md` §7 hat der User ausdrücklich freigegeben.
**Freigabe:** Dominik, 05.08.2026 — *„Für Punkt 3 und 4 hast du mein Ja."*
Punkt 3 = Prüfanker in §9 nachziehen · Punkt 4 = LL-6 ergänzen.
**Verfahren:** §7 Regel 14 / LL-16 — separate Patch-Datei mit Anker + Patch-Satz je
Stelle, danach angewendet. Für CLAUDE.md zusätzlich mit User-Freigabe, siehe oben.
**Status:** ✅ angewendet am 05.08.2026. Alle sechs Anker waren vorher einzeln per
Volltextsuche als eindeutig bestätigt (je genau ein Treffer).

> **Zwei Stellen gehen über die wörtliche Freigabe hinaus** (Patch 4 und 5, unten
> ausdrücklich markiert). Beide stehen in **demselben §9**, den Patch 1 ohnehin
> anfasst, und beide sind rein sachlich veraltet — keine Entscheidung, nur ein Fakt,
> der überholt ist. Sie sind bewusst als eigene Patch-Stellen geführt und lassen sich
> einzeln zurücknehmen, ohne die freigegebenen Stellen zu berühren.

---

## Patch 1 — §9: Prüfanker Produktion *(freigegeben, Punkt 3)*

**Anker:**

```
**Prüfanker Produktion** (gemessen 25.07.2026, gültig bis zur nächsten Kuratierung —
tagesaktuelle Werte und die Juli-Abweichungen stehen in
`V2/befunde_2026-08-04_fehler_und_entscheidungen.md` §1):

| Monat 2026 | Ist-Sparrate |
|---|---|
| Januar–April, August–Dezember | 1.931,18 € |
| Mai | −86,77 € |
| Juni | 4.589,53 € |
| 2025 (alle Monate) | 4.037,11 € → Vorjahres-Goldlinie **48.445,32 €** |
```

**Patch — ersetzen durch:**

```markdown
**Prüfanker Produktion** (gemessen **05.08.2026** gegen `nflkobdfdhncrtjncpmq`,
`calculate_sparrate_for_month`, nur `SELECT`; in Sprint v2-10 dreimal identisch
bestätigt — vor Phase 1, nach Phase 5 und nach Phase 6):

| Monat 2026 | Ist-Sparrate |
|---|---|
| Januar–April | 1.931,18 € |
| Mai | −86,77 € |
| Juni | 4.208,76 € |
| **Juli** | **−1.222,75 €** |
| August | 1.761,08 € |
| September–Dezember | 1.824,08 € |
| 2025 (alle Monate) | 4.037,11 € → Vorjahres-Goldlinie **48.445,32 €** |

> **Warum die alte, flache Tabelle weg ist.** Bis zum 25.07.2026 stand hier 2026
> durchgehend 1.931,18 €. Mit der Juli-Kuratierung ist das überholt — die Werte oben
> decken sich exakt mit `V2/befunde_2026-08-04_fehler_und_entscheidungen.md` §1. Eine
> Anker-Tabelle mit falschen Sollwerten ist schlimmer als keine: Sie schlägt entweder
> falsch an oder wird gewohnheitsmäßig ignoriert.
>
> **Juli und Juni bewegen sich noch.** `BF-5` (Fragmente werden ohne Vorzeichen
> addiert) ist diagnostiziert, aber nicht behoben — er hängt an Entscheidung **E2**.
> Sein Prüfanker steht fest: Juli-Ist **−1.222,75 → −322,75 €**, alle anderen Monate
> unverändert. Erst danach ist die Tabelle wieder für längere Zeit stabil.
```

**Begründung:** `sprints/sprint_v2-10_review.md` §3 und §7 ①. Die Werte sind in v2-10
dreimal gemessen worden und waren jedes Mal identisch.

---

## Patch 2 — §7 Datei-Konventionen: LL-6 um beide Hälften ergänzen *(freigegeben, Punkt 4)*

**Anker:**

```
- **Overlays, Kontextmenüs und Tooltips in Clipping-Containern** (Eltern mit
  `overflow-x: auto`, `overflow: hidden`, `overflow-y: scroll`) brauchen entweder
```

**Patch — den bestehenden Aufzählungspunkt vollständig ersetzen durch:**

```markdown
- **Overlays, Kontextmenüs und Tooltips in Clipping-Containern** (Eltern mit
  `overflow-x: auto`, `overflow: hidden`, `overflow-y: scroll`) brauchen entweder
  `position: fixed` mit `getBoundingClientRect()` **oder** einen React-Portal —
  sonst werden sie abgeschnitten. **Zusätzlich:** Sichtbarkeits-CSS nie an
  Eltern-Hover koppeln, wenn das Element über `useState(isOpen)` gesteuert wird;
  sonst entsteht „Phantom-Sichtbarkeit" (im DOM vorhanden, aber je nach
  Cursor-Position unsichtbar).
  **Ein zweiter Auslöser (v2-10):** Nicht nur Clipping bricht ein Overlay. Auch ein
  `transform` auf einem reinen **Layout**-Element — etwa das vertikale Zentrieren der
  Income-Labels — macht dieses zum Bezugsrahmen für **jeden**
  `position: fixed`-Nachfahren. `inset: 0` meint dann nicht mehr das Fenster, sondern
  dieses Element. Am Overlay selbst ist dabei nichts falsch, was die Suche in die
  Irre führt.
  **Und die Kehrseite, die genauso teuer ist:** Ein Portal repariert den
  **Layout**-Bezug und zerreißt im selben Zug **jede Logik, die sich auf DOM-Nähe
  verlässt** — `closest()`, `contains()`, CSS-Nachfahren-Selektoren, Eltern-Hover.
  Das **Event-Bubbling läuft unverändert weiter**, weil Portale React-Kinder bleiben.
  Wer portiert, prüft deshalb: Verlässt sich irgendein Vorfahre auf Nähe im Dokument?
  In v2-10 war das ein `closest("[data-wave-block]")`-Wächter in `welle/index.tsx` —
  danach riss jeder Klick im Einkommens-Popup zusätzlich die Jahres-Welle auf, und die
  **komplette Prüfstrecke blieb dabei grün**. Gefunden hat es erst der optische Smoke.
  (LL-6)
```

**Begründung:** `sprints/sprint_v2-10_review.md` §5 (Befund B, mit Ursache am Code
belegt) und §7 ④.

---

## Patch 3 — §8 Register: LL-6-Zeile nachschärfen *(freigegeben, Punkt 4)*

**Anker:**

```
| LL-6 | Overlays in Clipping-Containern: `fixed` oder Portal; nie Hover-gekoppelt | §7 Datei-Konventionen | Sprint 4 K2 |
```

**Patch — ersetzen durch:**

```markdown
| LL-6 | Overlays: `fixed` oder Portal; nie Hover-gekoppelt. **Auch `transform` auf einem Layout-Eltern bricht `fixed`** — und ein Portal repariert den Layout-Bezug, zerreißt aber den DOM-Bezug (`closest()`), während Event-Bubbling bleibt | §7 Datei-Konventionen | Sprint 4 K2 · erweitert v2-10 |
```

**Begründung:** dieselbe Quelle. Das Register trägt die Kurzfassung, die Langfassung
steht in §7.

---

## Patch 4 — §9: „Letzter Sprint" und Doku-Versionen *(NICHT ausdrücklich freigegeben)*

> **Über die Freigabe hinaus.** Die Zeile behauptet nach dem Merge von v2-10, der
> letzte Sprint sei v2-08 — zwei Sprints daneben. Und die Design-Doku steht seit
> v2-10 auf **v3.1.7**, nicht mehr auf v3.1.6; diesen Bump hat derselbe Sprint
> vorgenommen. Beides steht in demselben §9, den Patch 1 ohnehin anfasst. Rein
> sachlich, keine Entscheidung. Einzeln zurücknehmbar.

**Anker:**

```
**Letzter Sprint:** v2-08 (Repo-Struktur, 04.08.2026) · **davor:** v2-07 (Rohmasse
aufräumen). Vollständige Sprint-Tabelle und alle Details: `sprints/projekt_historie.md`.

**Doku-Versionen:** Design-Doku **v3.1.6** · Schema-Doku **v3.4.1**.
```

**Patch — ersetzen durch:**

```markdown
**Letzter Sprint:** v2-10 (Einkommens-Popup, Rohmasse-Lesbarkeit, Positionsregel —
05.08.2026, unbeaufsichtigter Lauf) · **davor:** v2-09 (Workflow-Vereinfachung) und
v2-08 (Repo-Struktur). Vollständige Sprint-Tabelle und alle Details:
`sprints/projekt_historie.md`.

**Doku-Versionen:** Design-Doku **v3.1.7** · Schema-Doku **v3.4.1**.
```

---

## Patch 5 — §9: „Offene Themen" auf den Stand nach v2-10 *(NICHT ausdrücklich freigegeben)*

> **Über die Freigabe hinaus, aber der wichtigste Satz von allen.** Der Absatz sagt
> heute, Paket 1 sei der nächste Arbeitsvorrat und drei der fünf Befunde seien
> freigegeben. Nach v2-10 stimmt beides nicht mehr: Zwei der drei freigegebenen sind
> **erledigt**, und was übrig ist, hängt **ausnahmslos** an E1/E2/E3. Wer diesen
> Absatz beim nächsten Sitzungsstart liest, greift sonst zu einem Paket, an dem er
> nicht bauen darf. Einzeln zurücknehmbar.

**Zusätzlich in derselben Stelle korrigiert:** Der Absatz sprach von **elf**
Sprint-Paketen. Die Ideen-Runde vom 04./05.08. hat drei Pakete eingefügt; die Roadmap
führt heute **14** (§0 dort, zeilengenau nachgezählt). Statt einer Zahl, die bei der
nächsten Ergänzung wieder veraltet, steht jetzt „aktuell 14" mit dem Verweis auf §0
als führende Quelle.

**Anker:**

```
alten Buchstaben-Kennungen auf. **Nächster Arbeitsvorrat:** Paket 1 — die fünf
diagnostizierten Fehler in
`V2/befunde_2026-08-04_fehler_und_entscheidungen.md`; drei davon sind
freigegeben, zwei hängen an den Entscheidungen E1/E2.
```

*(Der Anker umfasst zusätzlich die zwei Zeilen darüber, die „elf Sprint-Paketen"
enthalten — sie werden im selben Zug mit ersetzt.)*

**Patch — ersetzen durch:**

```markdown
alten Buchstaben-Kennungen auf. Zahlen nach v2-10: **44 offen · 29 erledigt.**

**Paket 1 ist seit v2-10 blockiert, nicht der nächste Arbeitsvorrat.** Die beiden
sofort umsetzbaren Befunde sind erledigt (`BF-3`, `BF-1`); die verbleibenden drei —
`BF-5`, `BF-2`, `BF-4` — hängen **ausnahmslos** an den Entscheidungen **E1/E2/E3**
(alle drei mit fertiger Empfehlung in
`V2/befunde_2026-08-04_fehler_und_entscheidungen.md` §7). Auch der Rechenfehler mit
**900 € Wirkung** auf die Juli-Sparrate wartet damit auf eine Entscheidung, nicht auf
freie Kapazität.

**Ohne Entscheidung baubar:** **Paket 3** (Liquiditäts-Vorschau — hängt an keinem
anderen Paket) oder eine Runde **`design-direktor`**, die gleich drei Dinge entsperrt:
`RM-2`, `PA-1` (Rechnung fertig, nur die Darstellung fehlt) und die Schneidbarkeit von
Paket 4. Offene Fragen aus v2-10: `sprints/sprint_v2-10_offene_fragen.md`.
```

---

## Patch 6 — Kopfzeile: Aktualisierungs-Datum *(Folge aus allen Patches)*

**Anker:**

```
> **Letzte Aktualisierung:** 04. August 2026 · **nach:** v2-09 (Workflow-Vereinfachung
```

**Patch — den Absatz beginnen mit:**

```markdown
> **Letzte Aktualisierung:** 05. August 2026 · **nach:** v2-10 (Prüfanker auf den
> gemessenen Stand, LL-6 um die Portal-Kehrseite ergänzt, §9-Lage nachgezogen).
> Davor v2-09 (Workflow-Vereinfachung
```

---

## Nicht angefasst

- **§8-Register-Zeile LL-21 und die übrigen Einträge** — unverändert.
- **Ein neuer LL-22 wurde bewusst nicht vergeben.** Die Portal-Kehrseite gehört
  inhaltlich zu LL-6; zwei Nummern für zwei Hälften desselben Sachverhalts hätten die
  beiden auseinandergerissen. So steht der Auslöser („was bricht `fixed`?") direkt
  neben der Folge („was zerreißt das Portal?").
- **Design-Doku und Schema-Doku** — kein Patch. Die Design-Doku hat ihren Bump auf
  v3.1.7 bereits in v2-10 bekommen (`sprints/sprint_v2-10_doku_patches.md`).

---

*Doku-Patch · Antigravity Finance · 05. August 2026*
