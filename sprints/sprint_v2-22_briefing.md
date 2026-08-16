# Sprint v2-22 — der Cent und die Prüfbarkeit

> **Datum:** 15. August 2026 · **Branch:** `sprint/v2-22-cent-und-pruefbarkeit`
> **Basis:** `sprint/v2-21-zuordnung` (PR #31, offen) — Kette #30 → #31 → #32
> **Umfang:** zwei Hausaufgaben, `B2-R` und `ZO-2`
>
> **Briefing-Datei, weil:** die Datenbank wird berührt (Kriterium 1 aus `sprint-start`).

---

## 1 · Ziel, Nicht-Ziel, Prüfanker

**Ziel:** Die Erklärzeile im Jahres-Popup stimmt wieder auf den Cent, und die
Entscheidung, ob ein Kartenvorschlag angezeigt wird, ist automatisiert geprüft.

**Nicht-Ziel:**

| Was | Warum |
|---|---|
| Jede Änderung an der Sparrate | Der Sprint ist ein Aufräumen, kein Umbau |
| `ZO-3` (rückwirkend verlinken) | braucht die Beurteilung der 115 neuen Vorschläge durch den User |
| `ZO-1` (`frequency_match`) | würde alle Konfidenz-Scores erneut verschieben — genau die, die gerade zu prüfen sind |
| Die Anzeige-Logik des Jahres-Popups | nur die Rechnung dahinter wird korrigiert, nicht die Darstellung |

**Prüfanker — hier bewegt sich ausnahmsweise etwas, und zwar genau eine Sache:**

| Größe | vorher | nachher erwartet |
|---|---|---|
| Ist-/Plan-Sparrate, alle zwölf Monate | siehe unten | **identisch** |
| Anker 1 (Ordner-Spalte == Ist) | 0,00 in allen zwölf | **0,00 in allen zwölf** |
| **Anker 2 (`Σ delta = Ist − Plan`)** | Juli **+0,01**, August **+0,01**, sonst 0 | **0,00 in ALLEN zwölf** ← das ist der Zweck |

**Gemessen VORHER, 15.08.2026, dieselbe Sitzung:**

| Monat | Ist | Plan | | Monat | Ist | Plan |
|---|---|---|---|---|---|---|
| Jan | 1.899,67 | 1.899,67 | | Jul | −8,84 | 23,93 |
| Feb | 1.931,18 | 1.931,18 | | Aug | 721,24 | 796,23 |
| Mär | 1.931,18 | 1.931,18 | | Sep | 1.824,08 | 1.824,08 |
| Apr | 1.899,67 | 1.899,67 | | Okt | 1.792,57 | 1.792,57 |
| Mai | −86,77 | −86,77 | | Nov | 1.824,08 | 1.824,08 |
| Jun | 4.208,76 | 4.220,53 | | Dez | 1.824,08 | 1.824,08 |

---

## 2 · Der Befund zu `B2-R` — gemessen, nicht übernommen

Die Hausaufgabe stand seit v2-19 mit der Vermutung „vier gemeinsame Karten mit
Sub-Cent-Deltas". Das stimmt, ist aber nur die halbe Auskunft. Die Zerlegung:

| Monat | Karten **ungerundet** | Karten **je Zeile gerundet** | Gehalt | Ziel (`Ist − Plan`) |
|---|---|---|---|---|
| Juni | −11,7700 | −11,77 | 0,00 | −11,77 ✅ |
| **Juli** | **−17,2036** | **−17,21** | −15,57 | **−32,77** |
| **August** | **−74,9943** | **−75,00** | 0,00 | **−74,99** |

**Zwei Dinge, die dadurch feststehen:**

1. **Das Gehalt ist unschuldig.** Sein Delta (−15,57 €) ist exakt; die Vermutung, es
   könnte durch seine separate Rundung beitragen, ist widerlegt.
2. **Der Fehler sitzt allein in `round(…, 2)` je Karte** in der `scored`-CTE von
   `get_year_deviation_drivers`. Ungerundet summiert stimmt jeder Monat auf den Cent.
   Das ist §6 Stolperfalle 13 / LL-25, eine Ebene tiefer als beim ersten Auftreten.

**Warum das Ziel geholt und nicht hergeleitet wird.** Naheliegend wäre
`round(Σ delta_roh, 2)` als Zielwert — er stimmt in allen drei geprüften Monaten.
Aber `Ist − Plan` ist die **Differenz zweier getrennt gerundeter** Summen, und die
muss nicht gleich der gerundeten Differenz sein. LL-25 sagt dazu ausdrücklich: *Ziel
aus der Rechenfunktion **holen**, nicht herleiten.* Also wird
`calculate_sparrate_for_month − calculate_planned_sparrate_for_month` aufgerufen,
das Gehalts-Delta abgezogen, und der Rest auf die betragsgrößte Kartenzeile gelegt.

**Die Zeilen, die den Fehler verursachen, verschwinden aus der Anzeige** — ein Delta
von 0,0022 € rundet auf 0,00 und wird von `WHERE delta <> 0` gefiltert. Ihr Beitrag
darf trotzdem nicht verloren gehen; genau das leistet die Rest-Verteilung.

---

## 3 · Der Befund zu `ZO-2`

Die Entscheidung, ob ein Vorschlag angezeigt wird, steht inline im `.map()` einer
Server Component (`src/app/page.tsx`). Sie ist damit nicht automatisiert prüfbar —
und **genau dort saß der Fehler aus v2-21 P4**: Die Obergrenze `conf < auto_absorption`
hätte die 24 treffsichersten Vorschläge verschluckt.

Es ist die **dritte Stelle dieser Art in vier Tagen** (v2-19 `getTop3Drivers`, v2-20
Lösch-Tor, v2-21 hier). Kein Anker fängt sie, weil alle Zahlen richtig sind — sie
werden nur nicht gezeigt.

---

## 4 · Phasen

Phasen-sequenziell, ein Commit je Phase (§7 Regel 11).

| Phase | Was | DB |
|---|---|---|
| **P1** | `get_year_deviation_drivers` rundet nicht mehr je Zeile: Ziel aus den Rechenfunktionen holen, Rest auf die betragsgrößte Kartenzeile verteilen | **ja** |
| **P2** | `istVorschlagSichtbar(...)` als reine Funktion aus `page.tsx` herausziehen, mit Playwright-Spec abdecken; neue Spec in `playwright.config.ts` unter `testMatch` eintragen | nein |
| **P3** | Prüfstrecke, Anker nachher, Review, Roadmap, Doku, PR | — |

**Akzeptanzkriterien, regel-basiert (LL-19):**

- `A1` — In **allen zwölf** Monaten gilt `Σ delta = Ist − Plan` mit Differenz **exakt 0,00**.
- `A2` — Ist- und Plan-Sparrate sind in allen zwölf Monaten unverändert.
- `A3` — Anker 1 bleibt in allen zwölf Monaten 0,00.
- `A4` — Der Rest wird auf **genau eine** Zeile gelegt, und zwar die betragsgrößte;
  keine Zeile bekommt einen Rest, wenn die Differenz 0 ist.
- `A5` — Ein Monat ohne Treiber liefert weiterhin `[]` und keinen Fehler.
- `A6` — `istVorschlagSichtbar` ist für alle vier Fälle abgedeckt: unter der Schwelle ·
  im Band · über der Auto-Schwelle **und offen** · über der Auto-Schwelle **und
  zugeordnet**. Der dritte Fall ist der, der in v2-21 gefehlt hätte.
- `A7` — `pnpm test:visual` und `pnpm test:e2e` steigen nur um selbst geschriebene Tests.
