# Sprint v2-22 — Review

> **Branch:** `sprint/v2-22-cent-und-pruefbarkeit` · **Basis:** `sprint/v2-21-zuordnung`
> (PR #31) — Kette **#30 → #31 → #32** · **Datum:** 15. August 2026
>
> **In einem Satz:** Zwei Hausaufgaben abgeräumt — die Treiber-Summe stimmt wieder
> auf den Cent, und die Stelle, an der v2-21 beinahe unsichtbar geblieben wäre, hat
> jetzt eine eigene Prüfung.

---

## 1. Was gebaut wurde

### P1 · `B2-R` — die Treiber-Summe stimmt wieder auf den Cent

`supabase/migrations/20260815_v2_22_p1_treiber_cent.sql` · Commit `e9075f0`

`get_year_deviation_drivers` rundete das Delta **je Karte** auf zwei Stellen,
während die Sparraten-Funktionen erst am Ende über alles runden. Gemessen:

| Monat | Karten **ungerundet** | je Zeile **gerundet** | Gehalt | Ziel (`Ist − Plan`) |
|---|---|---|---|---|
| Juni | −11,7700 | −11,77 | 0,00 | −11,77 ✅ |
| **Juli** | **−17,2036** | **−17,21** | −15,57 | **−32,77** ❌ |
| **August** | **−74,9943** | **−75,00** | 0,00 | **−74,99** ❌ |

**Zwei Dinge, die die Messung widerlegt hat** — beide standen so nicht in der
Hausaufgabe:

1. **Das Gehalt ist unschuldig.** Es wird separat gerundet
   (`round(ist_net − plan_net, 2)`), und der Verdacht lag nahe. Sein Delta ist in
   beiden betroffenen Monaten exakt.
2. **Die Zeilen, die den Fehler verursachen, sind gar nicht sichtbar.** Ein Delta
   von 0,0022 € rundet auf 0,00 und wird von `WHERE delta <> 0` gefiltert — es steht
   in keiner Anzeige, verschiebt aber die Summe. **Wer nur auf die angezeigten Zeilen
   schaut, findet die Ursache nie.**

### P2 · `ZO-2` — die Vorschlags-Sichtbarkeit ist prüfbar

`src/lib/suggestion.ts` · `tests/e2e/suggestion-visibility.spec.ts` · Commit `dbe96af`

Die Regel stand inline im `.map()` einer Server Component. Genau dort saß in v2-21
der Fehler, der den ganzen Sprint entwertet hätte — und es war die **dritte Stelle
dieser Art in vier Tagen**.

Sie liegt jetzt als reine Funktion vor, mit zehn Fällen abgedeckt. Die Spec
**transpiliert die echte Quelldatei**, statt die Logik nachzubauen (Muster von
`ring-subline.spec.ts`, dessen Kommentar denselben Grund nennt: *„weil die Regel im
Bauteil eingebettet und damit nicht einzeln prüfbar war"*).

---

## 2. Prüfstrecke

| Prüfung | Erwartet | Gemessen |
|---|---|---|
| `tsc --noEmit` | 0 | **0** ✅ |
| ESLint | 0/0 | **0/0** ✅ |
| `pnpm build` | 0 | **0** ✅ |
| `pnpm test:visual` | 81 → steigt nur um eigene Tests | **91/91** ✅ (+10) |
| `pnpm test:e2e` | 90 → steigt nur um eigene Tests | **100/100** ✅ (+10) |

Die Zusammensetzung, damit die Zahl nachvollziehbar ist:
**91** visual + **2** unauth + **1** setup + **6** render-smoke = **100**.
Vorher: 81 + 2 + 1 + 6 = 90. Der Zuwachs sind exakt die zehn Fälle aus
`suggestion-visibility.spec.ts`, keiner davon fremd.

**Bundle:** Route `/` 35,6 kB · First Load JS **187 kB** — unverändert gegenüber v2-21.

Die neue Spec ist in `playwright.config.ts` unter `testMatch` eingetragen. Ohne
diesen Eintrag wäre sie stillschweigend nicht mitgelaufen — die Gesamtzahl hätte den
Unterschied nicht verraten.

> **Der e2e-Lauf brauchte zwei Anläufe, und der Grund gehört hierher.** Im ersten
> Durchgang fiel `auth.setup` aus (`page.waitForURL` nach 30 s), wodurch die sechs
> render-smoke-Tests gar nicht liefen — 93 passed, 1 failed, 6 did not run. Die
> visual- und unauth-Projekte waren dabei vollständig grün.
> **Getrennt nachgefahren: 7/7 grün** (setup + render-smoke). Im Server-Log desselben
> Laufs stehen die bekannten `ECONNRESET`-Wiederholungen gegen Supabase; sie kosten
> Zeit und reißen gelegentlich ein Timeout. Der Login-Pfad ist von diesem Sprint
> nicht berührt.
>
> **Nebenbefund, nicht von diesem Sprint verursacht, aber hier notiert:** Wenn
> `auth.setup` fehlschlägt, schreibt Playwright einen Seiten-Snapshot nach
> `test-results/` — **mit dem Passwort im Klartext** im ausgefüllten Formularfeld.
> Das Verzeichnis ist gitignored (`.gitignore:52`), es gelangt also nichts ins Repo;
> lokal liegt es aber auf der Platte, bis es überschrieben wird. Wer diese Dateien
> weitergibt (Trace-Zip an Dritte, Screenshot in ein Ticket), gibt das Passwort mit.

---

## 3. Anker vorher/nachher

Gemessen in derselben Sitzung, unmittelbar vor und nach der Migration.

| Monat 2026 | Ist vorher | Ist nachher | Plan vorher | Plan nachher |
|---|---|---|---|---|
| Januar | 1.899,67 | **1.899,67** ✅ | 1.899,67 | **1.899,67** ✅ |
| Februar | 1.931,18 | **1.931,18** ✅ | 1.931,18 | **1.931,18** ✅ |
| März | 1.931,18 | **1.931,18** ✅ | 1.931,18 | **1.931,18** ✅ |
| April | 1.899,67 | **1.899,67** ✅ | 1.899,67 | **1.899,67** ✅ |
| Mai | −86,77 | **−86,77** ✅ | −86,77 | **−86,77** ✅ |
| Juni | 4.208,76 | **4.208,76** ✅ | 4.220,53 | **4.220,53** ✅ |
| Juli | −8,84 | **−8,84** ✅ | 23,93 | **23,93** ✅ |
| August | 721,24 | **721,24** ✅ | 796,23 | **796,23** ✅ |
| September | 1.824,08 | **1.824,08** ✅ | 1.824,08 | **1.824,08** ✅ |
| Oktober | 1.792,57 | **1.792,57** ✅ | 1.792,57 | **1.792,57** ✅ |
| November | 1.824,08 | **1.824,08** ✅ | 1.824,08 | **1.824,08** ✅ |
| Dezember | 1.824,08 | **1.824,08** ✅ | 1.824,08 | **1.824,08** ✅ |

**Anker 1** (Ordner-Spalte == Ist-Sparrate): vorher wie nachher **0,00 in allen zwölf**.

**Anker 2** (`Σ delta = Ist − Plan`) — **hier bewegt sich das, was sich bewegen soll:**

| | vorher | nachher |
|---|---|---|
| abweichende Monate | **2** (Juli +0,01 · August +0,01) | **0** ✅ |

Zusätzlich gegengeprüft: Im Produktivfall `p_limit = 3` liefert die Funktion
höchstens **4** Zeilen je Monat (drei Karten + „Gehalt", wie in v2-19 vorgesehen)
und wirft keinen Fehler.

**Laufzeit:** 229 ms für den vollen Jahresabruf mit `p_limit = 50`. Die zwei
zusätzlichen RPC-Aufrufe je Monat (24 insgesamt), die das Zielholen kostet, sind
damit unkritisch — das war vorab die einzige echte Sorge an diesem Entwurf.

### Warum ohne Übungs-Datenbank — begründet abweichend von `db-eingriff`

Auf ausdrückliche Entscheidung des Users, und mit einem Argument, das bei v2-21 noch
nicht galt: **Die Übungs-Datenbank kann diesen Fix strukturell nicht prüfen.** Ihr
Anker liegt in allen zwölf Monaten bei 2.200,00 € — für Ist **und** Plan. Also ist
`Ist − Plan` dort überall exakt 0, es gibt keine Treiber, und
`get_year_deviation_drivers` liefert leere Listen. Ein Rundungsfehler in einer leeren
Liste ist nicht sichtbar.

Geprüft wurde stattdessen in einer **zurückgerollten Transaktion auf Produktion**
gegen die echten Daten — 0 abweichende Monate von 12, keine Spur hinterlassen
(verifiziert). Der Rennrad-Trainer blieb unangetastet.

---

## 4. Selbst-Review gegen die Akzeptanzkriterien

| # | Kriterium | Erfüllt | Beleg |
|---|---|---|---|
| A1 | `Σ delta = Ist − Plan` mit Differenz exakt 0,00 in **allen zwölf** Monaten | ✅ | `abweichende_monate = 0` (vorher 2) |
| A2 | Ist- und Plan-Sparrate in allen zwölf Monaten unverändert | ✅ | §3, alle 24 Werte |
| A3 | Anker 1 bleibt 0,00 in allen zwölf | ✅ | §3 |
| A4 | Rest auf genau eine Zeile, die betragsgrößte; keine Zuteilung bei Differenz 0 | ✅ | `CASE WHEN r.rn = 1 THEN … + COALESCE(rst.betrag, 0)` — `rn = 1` ist per `row_number()` eindeutig, und `betrag` ist 0, wenn nichts fehlt |
| A5 | Ein Monat ohne Treiber liefert weiterhin `[]`, kein Fehler | ✅ | `COALESCE(pm.drivers, '[]'::jsonb)` unverändert; Januar–Mai und September–Dezember liefern leere Listen |
| A6 | `istVorschlagSichtbar` deckt alle vier Fälle ab | ✅ | 10 Tests, darunter „über der Auto-Schwelle **und offen**" — der Fall, der in v2-21 gefehlt hätte |
| A7 | Testzahlen steigen nur um eigene Tests | ✅ | `test:visual` 81 → 91, alle zehn aus `suggestion-visibility.spec.ts` |

---

## 5. Architektur-Entscheidungen

| Entscheidung | Alternative | Warum so |
|---|---|---|
| **Ziel aus den Rechenfunktionen holen** | `round(Σ delta_roh, 2)` als Ziel herleiten | Die Herleitung stimmt in allen drei geprüften Monaten — aber `Ist − Plan` ist die Differenz **zweier getrennt gerundeter** Summen und muss nicht gleich der gerundeten Differenz sein. LL-25 sagt wörtlich: *Ziel holen, nicht herleiten.* Genau daran ist diese Fehlerklasse beim ersten Auftreten gescheitert. Kosten: 24 RPC-Aufrufe, gemessen 229 ms |
| **Rest auf die betragsgrößte Zeile** | gleichmäßig verteilen | Ein Cent auf viele Zeilen verteilt ergibt Bruchteile, die wieder gerundet werden müssten — dasselbe Problem eine Ebene tiefer. Die größte Zeile trägt `rn = 1` und überlebt jeden `p_limit`-Schnitt |
| **Rest **nach** dem Runden, vor dem Kürzen** | vor dem Runden | Nach dem Runden ist der Fehlbetrag exakt bekannt; davor müsste er geschätzt werden |
| **Spec transpiliert die echte Quelldatei** | Logik im Test nachbauen | Ein Nachbau driftet vom Original ab und gibt falsche Sicherheit — so steht es schon in `ring-subline.spec.ts` |

---

## 6. Offene Punkte und Fragen

**① Ein konstruierbarer Randfall bleibt, bewusst.** Gäbe es in einem Monat gar keine
sichtbare Kartenzeile (alle Deltas unter einem halben Cent), während die Summe
dennoch einen vollen Cent ergibt, hätte der Rest keinen Träger. Das verlangt, dass
sich Sub-Cent-Beträge über viele Karten zu einem Cent addieren, ohne dass eine
einzige Karte einen Cent erreicht. Nicht real, aber im Migrations-Kommentar
festgehalten — und die B2-Prüfung aus `db-eingriff` würde ihn anzeigen.

**② `ZO-1` und `ZO-3` bleiben offen** und sind bewusst nicht angefasst worden — beide
würden die 115 neuen Vorschläge verändern oder bewerten, bevor der User sie gesehen
hat.

**③ Drei PRs hängen jetzt ineinander:** #30 → #31 → #32. Die Reihenfolge ist nicht
beliebig.

---

## 7. Vorschläge für CLAUDE.md und Roadmap

**Für CLAUDE.md: nichts.** Die Lehre aus P1 steht bereits als §6 Stolperfalle 13 /
LL-25 in der Verfassung — dieser Sprint ist ihre **Anwendung**, kein neuer Fall.
Die Lehre aus P2 steht als LL-26 / Stolperfalle 16 dort. Ein vierter Eintrag zum
selben Thema würde die Datei verwässern.

> Eine Zeile wäre trotzdem ehrlich: **§9 nennt `B2-R` als offene Hausaufgabe.** Nach
> diesem Sprint stimmt das nicht mehr. Das ist ein Einzeiler und braucht die
> Freigabe des Users.

**Für die Roadmap** (bereits eingetragen):

- `B2-R` → ✅, mit der korrigierten Ursachenangabe (nicht das Gehalt, sondern das
  Runden je Karte; und die verursachenden Zeilen sind unsichtbar).
- `ZO-2` → ✅.
- Zahlen zeilengenau nachgezählt.
