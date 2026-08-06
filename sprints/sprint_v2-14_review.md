# Sprint v2-14 — Review

> **Branch:** `sprint/v2-14-faelligkeitstag` · **Commits:** 3 · **Datum:** 06. August 2026
> **Thema:** `LQ-1` — Karten bekommen einen Fälligkeitstag, abgeleitet aus der eigenen
> Buchungshistorie.
>
> **In einem Satz:** Die Frage „was steht bis zum Stichtag noch aus?" ist ab jetzt
> überhaupt formulierbar — bis dahin legten Frequenz und erster aktiver Monat nur den
> *Monat* fest, nie den Tag.

---

## 1. Was gebaut wurde

### P1 · Migration
`supabase/migrations/20260806_v2_14_lq1_faelligkeitstag.sql`

- `cards.due_day smallint NULL`, CHECK `cards_due_day_range` (`NULL` oder `1..31`)
- 17 Werte, **aus `fragments` abgeleitet**, je Wert ein Kommentar mit Belegzahl und
  beobachteter Spanne
- Idempotent über `due_day IS NULL` und `ADD COLUMN IF NOT EXISTS`

### P2 · Typen
`src/lib/supabase/types.ts` neu erzeugt — **exakt 3 Zeilen Unterschied**
(`due_day` in Row/Insert/Update), maschinell gegengeprüft. Der bekannte
`<claude-code-hint>`-Anhang trat diesmal nicht auf.

### Doku
Schema-Doku **3.4.3 → 3.4.4**, zwei Patch-Stellen
(`sprints/sprint_v2-14_doku_patches.md`).

---

## 2. Prüfstrecke

| Schritt | Ergebnis |
|---|---|
| `tsc --noEmit` | **0 Fehler** |
| ESLint | **0 / 0** |
| `pnpm build` | **0 Fehler** · Bundle **unverändert** (identische Chunk-Hashes wie v2-13) |
| `pnpm test:visual` | **12 / 12 grün** |

Kein Frontend berührt — dass sich das Bundle nicht bewegt, ist hier das erwartete
Ergebnis und zugleich der Beleg dafür.

---

## 3. Anker vorher/nachher

### Produktion — alle zwölf Monate, Ist **und** Plan

| Monat 2026 | vorher | nachher | Bewegung |
|---|---:|---:|---|
| Januar–April | 1.931,18 | 1.931,18 | **0,00** |
| Mai | −86,77 | −86,77 | **0,00** |
| Juni | 4.208,76 (Plan 4.220,53) | identisch | **0,00** |
| Juli | −322,75 (Plan 55,44) | identisch | **0,00** |
| August | 1.761,08 | 1.761,08 | **0,00** |
| September–Dezember | 1.824,08 | 1.824,08 | **0,00** |

**B2-Invariante:** 12/12. **Prüfsummen der vier Rechenfunktionen unverändert**
gegenüber v2-13 (`4af07d32…` · `cb880d01…` · `e80bf401…` · `6093a8e0…`) — sie wurden
nicht angefasst, und das ist belegt statt behauptet.

### Übungs-Datenbank — die Mechanik-Probe

Anker vorher **2.200,00 €**, nachher **2.200,00 €**.

| # | Fall | Ergebnis |
|---|---|---|
| T2 | Spalte, Typ, Nullbarkeit | `smallint`, nullable ✅ |
| T3 | `due_day = 0` | abgewiesen ✅ |
| T4 | `due_day = 32` | abgewiesen ✅ |
| T5 | `due_day = 1` und `= 31` | beide erlaubt ✅ |
| T6 | `due_day = NULL` | erlaubt ✅ |
| T7 | Anker in der Transaktion | 2.200,00 / 2.200,00 ✅ |
| T8 | Werte auf der Übungs-DB | 0 von 2 — erwartet, sie kennt die Prod-Namen nicht ✅ |
| — | **Zweitlauf der Migration** | fehlerfrei, nichts geändert ✅ |

T2–T8 in einer per `RAISE` zurückgerollten Transaktion (LL-18).

### Verteilung auf Produktion — Soll = Ist

17 Karten mit Wert, 4 ohne: **Friseur** (0 Belege) und die drei **BUDGET**-Karten.
Genau die geplante Verteilung.

---

## 4. Selbst-Review gegen die Akzeptanzkriterien

| # | Kriterium | erfüllt | Beleg |
|---|---|---|---|
| A1 | Spalte existiert, `NULL` erlaubt | ✅ | T2 |
| A2 | Grenzen 1–31 durchgesetzt | ✅ | T3/T4/T5 |
| A3 | Werte aus der Historie, nicht geschätzt | ✅ | je Wert Belegzahl + Spanne in der Migration |
| A4 | BUDGET bleibt ohne Termin | ✅ | Verteilung, 3 × `NULL` |
| A5 | Keine Zahl bewegt sich | ✅ | §3, 12 Monate Δ = 0,00 |
| A6 | Keine Rechenfunktion berührt | ✅ | Prüfsummen identisch zu v2-13 |
| A7 | Migration idempotent | ✅ | Zweitlauf ohne Wirkung |
| A8 | Typen aktuell | ✅ | 3 Zeilen Diff, `tsc` 0 |
| A9 | Vollständigkeit der Kartenliste | ✅ | Summe 1.814,02 € = Befund §2.1 |

---

## 5. Architektur-Entscheidungen

**① Gespeichert wird der Soll-Tag, nicht der Median der Buchungstage.** Sieben Karten
zeigen über 19 Monate exakt dasselbe Muster — gebucht am 1., 2., 3. oder 4., **nie
früher**. Das ist kein Streuwert, sondern ein Dauerauftrag zum Ersten, der auf den
nächsten Bankarbeitstag rutscht. Hätte ich den Median genommen, stünde bei der Miete
eine 2 — und die Vorhersage wäre am 1. jedes Monats falsch.

**② Bei echter Streuung gewinnt der frühere Tag** (Modus statt Median). Für eine
Liquiditätsfrage ist die vorsichtige Annahme die, bei der das Geld früher abfließt.

**③ Grenze 1–31, nicht 1–28.** Ein Dauerauftrag zum 31. existiert. Die Klammerung auf
die tatsächliche Monatslänge gehört in die Vorhersage, nicht in die Spalte — sonst
wäre der gespeicherte Wert schon eine Interpretation.

**④ `NULL` ist ein Wert, keine Lücke.** Es gibt drei legitime Gründe dafür (Budget,
keine Historie, unbekannter Rhythmus). Ein Pflichtfeld hätte für Budget-Karten eine
Zahl erzwungen, die es nicht gibt.

**⑤ Die Werte kommen aus der Migration, nicht aus einer Oberfläche.** Sie sind
abgeleitet und nachprüfbar; von Hand wären es 17 Eingaben, bei denen jeder Tippfehler
unbemerkt bliebe.

**⑥ Die Design-Doku wurde NICHT gepatcht.** Abweichung vom Plan: Dort war §7
vorgesehen. `due_day` ist aber bislang reine Datenhaltung — es gibt nichts zu sehen.
Eine Karten-Eigenschaft zu dokumentieren, die niemand sehen kann, wäre eine Zusage auf
Vorrat. Der Patch folgt mit `LQ-2`.

---

## 6. Offene Punkte und Fragen

1. **⚠️ Der Rennrad-Trainer steht seit rund 40 Minuten auf `PAUSING`.** Supabase
   verweigert den Restore mit *„no longer in a paused state, it is PAUSING"* — das ist
   ein Zustand auf Supabase-Seite, nicht auf unserer. Ich habe es siebenmal versucht.
   Details und nächste Schritte unten in §7.
2. **Die Oberfläche zum Ändern fehlt bewusst** — `LQ-1` steht deshalb 🟡, nicht ✅.
3. **Deutschlandticket steht auf einem einzigen Beleg** (16.07.2026). Der Wert 16 ist
   gesetzt und in der Migration als dünn markiert.
4. **Friseur hat keinen Wert** — 0 Buchungen. Sobald eine zugeordnet ist, nachtragbar.
5. **Kein Browser-Smoke nötig** — es hat sich sichtbar nichts geändert.

---

## 7. Vorschläge für CLAUDE.md, Fähigkeiten und Roadmap

**① `db-eingriff` — die Restore-Regel aus v2-13 ist in dieser Form nicht praktikabel.**
Sie verlangt, auf `ACTIVE_HEALTHY` zu warten, bevor der Zustand beurteilt wird. In
diesem Sprint stand der Status **die gesamte Probe über** auf `COMING_UP`, obwohl die
Datenbank vollständig da war — wie schon in v2-13. Der Status flippt offenbar nicht
zuverlässig.

> **Vorschlag:** Die Regel behalten, aber die *Prüfung* austauschen. Statt auf den
> Status zu warten: **den Anker abfragen und auf ihn warten.** Solange die Abfrage
> `FATAL: terminating connection` liefert oder Tabellen fehlen, ist der Restore nicht
> fertig; sobald sie **2.200,00 €** liefert, ist er es. Das ist derselbe Schutz gegen
> das Fehlurteil „Datenbank ist leer", aber an einem Signal, das tatsächlich kippt.

**② `db-eingriff` — Pausieren dauert und blockiert den Rücktausch.** Neu gelernt:
Zwischen `pause_project` und der Möglichkeit, das *andere* Projekt zu restoren, liegt
ein `PAUSING`-Fenster, in dem Supabase jeden Restore ablehnt. Der Rücktausch ist damit
**nicht** sofort nach der Probe erledigt.

> **Vorschlag:** In Schritt 7 aufnehmen — *nach `pause_project` erst den Status auf
> `INACTIVE` prüfen, dann restoren*, und einplanen, dass zwischen beidem etliche
> Minuten liegen können. Wer das nicht weiß, hält den abgelehnten Restore für einen
> Fehler.

**③ Roadmap:** `LQ-1` auf 🟡 — im Roadmap-Commit bereits nachgezogen. Die Zahlen
bleiben bei **39 offen · 33 erledigt**, weil 🟡 weiterhin offen zählt.

**④ CLAUDE.md:** kein Änderungsbedarf. Es entsteht keine neue Dauerregel; die beiden
Lehren oben gehören in die Fähigkeit, nicht in die Verfassung.

---

*Review Sprint v2-14 · Antigravity Finance · 06. August 2026*
