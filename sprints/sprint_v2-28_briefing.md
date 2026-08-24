# Sprint v2-28 — „Was die 2025-Prüfung zutage gefördert hat"

> **Status:** freigegeben am 21.08.2026, **noch nichts gebaut.**
> **Branch:** `sprint/v2-28-2025-korrekturen`, aufgesetzt auf `origin/main` (`ed769b8`,
> v2-27 P7). PR #43 ist **gemergt** — die Kette ist sauber, kein Kettenglied.
> **Diese Datei ist der Auftrag.** Sie entstand aus fünf Rückfragen des Nutzers nach der
> Durchsicht von 2025 und 2026; jede Antwort ist gegen Produktion gemessen, nicht
> geschätzt.

---

## Kontext

v2-27 hat für jede zurückdatierte Karte **eine** Plan-Zeile für 2025 gesetzt, gebildet
als **Jahresdurchschnitt** der tatsächlichen Zahlungen. Das ist an zwei Stellen zu grob —
bei **Ausreißern** und bei echten **Preiswechseln**. Die Jahressumme stimmt in beiden
Fällen; die Monatswerte nicht.

**Dieselbe Fehlerklasse wie LL-34** („jede Zahl richtig, nur im falschen Monat"), nur aus
einem anderen Grund: dort verschob das Zurückdatieren den Rhythmus, hier glättet ein
Mittelwert einen Sprung, den es wirklich gab.

## Ziel — ein Satz

**Die Karten zeigen für 2025 die Beträge, die tatsächlich gezahlt wurden — und
wiederkehrende Mobilitätsausgaben ordnen sich künftig von allein zu.**

## Nicht-Ziel

- **Keine Änderung an den Rechenfunktionen.** Alle vier Prüfsummen bleiben identisch.
- **2026 bleibt unangetastet** — außer der Navigationsgrenze, die kein Datum berührt.
- **Keine bestehende Zuordnung wird aufgehoben.** Was der Nutzer selbst zugeordnet hat,
  bleibt — auch die neun RMV-Fahrten auf „Tanken".
- **Keine Kuratierung 2025.** Der Sprint macht die Automatik möglich; das Zuordnen der
  restlichen ~563 Zahlungen bleibt Handarbeit des Nutzers.

---

## Phase 1 · Die 2025-Pläne stimmen *(Datenbank, Schreibzugriff auf Produktion)*

| Karte | heute | neu | Grund |
|---|---|---|---|
| **Handyvertrag** | `2025-01` → 33,07 | `2025-01` → **33,00** | 10 von 12 Monaten waren exakt 33,00; zwei Ausreißer (33,40 · 33,44) haben den Schnitt verschoben |
| **Netflix** | `2025-01` → 18,99 | `2025-01` → **19,99**<br>`2025-11` → **13,99** | **Preissenkung im November 2025.** 18,99 € wurde nie gezahlt |
| **Spotify** | `2025-01` → 11,16 | `2025-01` → **10,99**<br>`2025-12` → **12,99** | **Preiserhöhung im Dezember 2025.** 11,16 € wurde nie gezahlt |
| **Friseur** | ab `2026-01` | ab **`2025-01`**, Plan **45,00** | Karte reichte nicht nach 2025 zurück |

**Ein Preiswechsel gehört als zweite Zeitreihen-Zeile hinein, nicht in einen Mittelwert.**
`card_planned_timeline` ist genau dafür gebaut; die Forward-Inheritance regelt den Rest.
**UPSERT auf `(card_id, effective_month)`**, niemals INSERT — ein Slot, kein Anhängen
(§7 Regel 6).

> ### ⚠️ Zwei Fallen bei der Friseur-Rückdatierung
>
> **① `cards_assert_initial_plan` verlangt eine Plan-Zeile zum neuen Startmonat.**
> Zurückdatieren und Plan-Zeile müssen in **einer** Transaktion passieren
> (§6 Stolperfalle 5).
>
> **② Der Nutzer hat eine Folgepflicht übernommen — sie gehört in den Review.** Es gibt
> **keine Belege** für Friseurbesuche 2025; der Salon (`Zeil 57`) taucht erstmals im
> Januar 2026 auf, 2025 gibt es nur **Bargeld-Abhebungen**. Der Nutzer hat entschieden,
> trotzdem zurückzudatieren, und ordnet die passenden Abhebungen bei der Kuratierung der
> **Friseur-Karte** zu statt dem Privaten Budget. **Tut er das nicht, zählt dasselbe Geld
> zweimal.**

**Erwartete Anker-Bewegung — vor dem Eingriff je Karte festschreiben:**

- **Netflix und Spotify: Jahressumme 2025 unverändert**, nur die Monatsverteilung ändert
  sich (Netflix ±1,00 / −5,00 je Monat · Spotify ±0,17 / −1,83).
- **Handyvertrag: +0,84 €** übers Jahr (12 × 0,07).
- **Friseur: −540,00 €** übers Jahr (12 × 45,00) — die einzige große Bewegung.
- **2026: 0,00 € in allen zwölf Monaten.**

---

## Phase 2 · Die Navigation endet dort, wo die Daten enden *(Frontend)*

Heute stehen die Schranken auf `MIN_NAVIGABLE_YM = "1900-01"` und
`MAX_NAVIGABLE_YM = "2999-12"` (`src/lib/months.ts`) — ein als „absurd weit" markierter
V1-Platzhalter aus Sprint 3, der nie nachgezogen wurde. **Die Design-Doku spezifiziert
dazu nichts** (geprüft). Der Deaktiviert-Pfad in `header-timeline/index.tsx:71` ist
**gebaut und funktionsfähig**, wird nur nie ausgelöst.

Vor 2025 ist die Bühne leer: Sparrate `null`, null Zahlungen, null Karten. Kein Fehler —
aber ein Pfeil, der ins Leere führt, ist ein Versprechen ohne Inhalt.

**Entschieden: dynamisch aus den Daten**, damit sich die Grenze nach einem künftigen
Import älterer Auszüge selbst korrigiert.

> **Ohne zusätzliche Netzrunde.** `page.tsx` lädt `rawCards` bereits mit
> `first_active_month` — das Minimum daraus ist gratis zu haben (LL-29: bei Trägheit
> zählen wir Netzrunden, also erst gar keine erzeugen). Nur falls Zahlungen **vor** der
> ersten Karte liegen sollen, braucht es mehr; heute beginnt beides im Januar 2025.

Die **Obergrenze bleibt offen** — der Forecast soll blätterbar sein.

---

## Phase 3 · Mobilitäts-Händler ordnen sich selbst zu *(Datenbank + Import)*

**Entschieden: dauerhafte Regel in `app_config`**, nicht nur eine einmalige Korrektur.
Sie greift dann bei jedem künftigen CSV-Import.

**Wirkung auf den Bestand: 55 offene Zahlungen aus 2025, 1.262,92 €.**

> **Und das bewegt keine Zahl.** „Tanken" ist eine **BUDGET**-Karte: Sie zeigt den Plan,
> solange die Ausgaben darunter liegen (§4.3.2 · LL-12). Der höchste Monat käme auf
> **199,21 €** bei **240,00 €** Budget — in keinem Monat 2025 wird überschritten. Ein
> risikoloser Eingriff, der die Rohmasse um 9 % leichter macht.

### Die Liste — zweistufig

**Stufe 1, eindeutig** (Wortgrenze genügt):
`Aral` · `Agip` · `Esso` · `Shell` · `OMV` · `Avia` · `HEM` · `Orlen` · `Allguth` ·
`Calpam` · `Pinoil` · `Westfalen` · `Raiffeisen` · `BFT` · `Tankstelle` · `Station`
*(in den Daten belegt: Aral, Agip, Esso, Shell, Tankstelle, Station)*

**Stufe 2, mehrdeutig** — Wortgrenze **plus** zweites Signal (`Tank`/`Station` im Text
oder Betrag 10–150 €):
`JET` · `Total` · `Star` · `Team` · `Classic` · `Sprint` · `Q1` · `ELAN`

> `Total` steht in Rechnungstexten, `JET` steckt in „Projekt", `Star`/`Team`/`Classic`
> sind Alltagswörter. **`af_word_in_text` (aus v2-21) macht die Wortgrenzen** — kein
> neuer Code.

**Nahverkehr gehört dazu** (Nutzer-Entscheidung: „Tanken" ist bei ihm Mobilität
insgesamt): `Rhein-Main-Verkehrsverbund` · `RMV`.

> ### ⚠️ `DB Vertrieb` gehört NICHT in die Liste
>
> Gemessen liegt derselbe Händler auf **vier** Karten:
>
> | Karte | Beträge |
> |---|---|
> | Deutschlandticket · Deutschlandticket Mama | 63,00 € (Abo) |
> | Privates Budget | 62,24 € |
> | Tanken | 5,50 € (Einzelticket) |
>
> Eine pauschale Regel würde **Deutschlandticket-Abos auf „Tanken" umleiten**. Eine
> Betragsschwelle (Abo ≈ 58–63 €) wäre denkbar, ist aber raten. **Entschieden:
> weglassen** — bei zwei bis drei Buchungen im Jahr ist das keine Last. Die eine
> bestehende `DB Vertrieb`-Zuordnung auf „Tanken" bleibt unangetastet.

---

## Prüfanker

| | Erwartung |
|---|---|
| **2026, alle zwölf Monate** | **0,00 €** — Ist und Plan |
| **2025** | bewegt sich **nur** wie in Phase 1 aufgeschrieben; Phase 2 und 3 bewegen nichts |
| **Beide Invarianten** | in allen zwölf Monaten **beider** Jahre |
| **Prüfsummen** der vier Rechenfunktionen | **byte-identisch** |
| Prüfstrecke | `tsc` 0 · ESLint 0/0 · Build 0 · `test:visual` ≥ 121 · `test:e2e` ≥ 130 |

**Messregel:** vorher/nachher in **derselben** Sitzung, dazwischen nichts in der App tun.

**Wortgleich einspielen heißt wirklich wortgleich** — `pg_get_functiondef` schließt
Kommentare ein (Lehre aus v2-25, in v2-26 angewandt und belegt).

### Momentaufnahme 21.08.2026, 21:0x Uhr — Orientierung, **KEIN Sollwert**

Gemessen unmittelbar nach dem Anlegen des Branches, **vor** jedem Eingriff. **Anker 1
(Ordner-Spalte == Sparrate) war in allen 24 Monaten exakt 0,00 € Abweichung.**

| Monat | Ist | Plan | | Monat | Ist | Plan |
|---|---|---|---|---|---|---|
| 2025-01 | 1.748,93 | 1.848,33 | | 2026-01 | 1.318,76 | 1.497,91 |
| 2025-02 | 1.776,51 | 1.866,42 | | 2026-02 | 1.667,90 | 1.651,10 |
| 2025-03 | 1.811,58 | 1.866,42 | | 2026-03 | 1.053,42 | 1.381,43 |
| 2025-04 | 1.850,46 | 1.849,54 | | 2026-04 | 1.753,14 | 1.729,58 |
| 2025-05 | 1.888,22 | 1.887,30 | | 2026-05 | −239,10 | −96,40 |
| 2025-06 | 1.898,12 | 1.897,20 | | 2026-06 | 3.509,75 | 3.799,90 |
| 2025-07 | 1.866,97 | 1.866,05 | | 2026-07 | −8,84 | 21,44 |
| 2025-08 | 1.908,07 | 1.907,15 | | 2026-08 | 629,34 | 404,46 |
| 2025-09 | 1.904,67 | 1.907,15 | | 2026-09 | 1.821,59 | 1.821,59 |
| 2025-10 | 1.873,52 | 1.876,00 | | 2026-10 | 1.790,08 | 1.790,08 |
| 2025-11 | 1.894,72 | 1.897,20 | | 2026-11 | 1.821,59 | 1.821,59 |
| 2025-12 | 1.894,55 | 1.897,20 | | 2026-12 | 1.821,59 | 1.821,59 |

**Jahressumme 2025 Ist: 22.316,32 €.**

> **Diese Zahl ist NICHT die 22.567,80 € aus dem Review von v2-27** (19.08.2026). Die
> Differenz von **−251,48 €** ist **kein Fehler** — der Nutzer hat in den zwei Tagen
> dazwischen weiter kuratiert, und genau deshalb gibt es seit dem 13.08.2026 keine
> eingefrorene Anker-Tabelle mehr. **Wer diesen Sprint baut, misst selbst neu**; die
> Tabelle oben sagt nur, in welcher Größenordnung man sich bewegt.
>
> **Und sie ist beim Lesen schon wieder älter:** Die Messung stammt vom 21.08., die
> Bauphase beginnt frühestens am 24.08. Drei weitere Tage Kuratierung liegen dazwischen.
> Die Tabelle taugt zur Orientierung — als Vergleichswert für einen Eingriff taugt sie
> **nicht**.

---

## Offene Punkte

1. **Der strukturelle Befund aus Rückfrage 3 gehört in die Roadmap, nicht in diesen
   Sprint:** **191 der 618 offenen 2025-Zahlungen tragen das Buchungsdatum im Text**
   (`… | VISA Debitkartenumsatz vom 03.01.2026`) — und **keine einzige davon** bekommt
   einen Vorschlag ≥ 0,60. Ein knappes Drittel ist für die automatische Zuordnung
   strukturell unsichtbar, weil der Name jedes Mal ein anderer ist. Das ist der stärkste
   bekannte Hebel für die Kuratierung 2025 und verdient einen eigenen Roadmap-Punkt neben
   `ZO-1`.
2. **`MOBILE SUICA APPLE V`** bleibt weiter ohne Karte (offen aus v2-27).
3. **`KJ-4`** (überlappende Monatsnamen) blieb in v2-25 **unreproduzierbar** — in
   Chromium und WebKit je 0 Konsolenmeldungen, nie mehr als eine Kopfzeile im DOM,
   Breiten 1680 → 560 px. Kein Patch gemacht, bewusst.
4. **`KJ-9`** — der Lösch-Toast weicht weiter von Design-Doku §12.5 ab.
