# Befund — der Visa-Jahresexport ließ sich nicht importieren

> **Datum:** 03. September 2026 · **Anlass:** Nutzer-Meldung „Ich kann die Umsätze
> meiner Visa-Karte nicht hochladen"
> **Datei:** `import_data/01-09-2026_Umsatzliste_Visa Kreditkarte_3514.csv`
> **Behoben:** ja, im Frontend — Branch `fix/visa-import-grosse-datei`
> **Offen:** ein datenbankseitiger Hebel (siehe §5)

---

## 1. Was der Nutzer sah, und was wirklich los war

Der Import brach ab. Sichtbar war „Datei fehlerhaft" — der Zustand, den das Portal
zeigt, wenn die RPC einen Fehler wirft.

**An der Datei ist nichts fehlerhaft.** Gemessen mit dem echten Parser
(`routeAndParseCsv`, transpiliert und ausgeführt, kein Nachbau):

| | |
|---|---|
| Format erkannt | `DKB_VISA`, Header-Anker gefunden |
| Zeilen | **2.535**, alle mit 7 Feldern, alle Status `Gebucht` |
| Parse-Dauer | **4 ms** |
| Encoding | UTF-8 mit BOM — identisch zum Export vom 27.08.2026 |
| Nutzlast als JSON | 271 KB, also unter dem 1-MB-Limit der Server Action |

Der Parser war nie das Problem. Die Meldung „Datei fehlerhaft" ist die einzige, die
das Portal für einen RPC-Fehler kennt — sie beschreibt die Ursache nicht, sie ist nur
der Sammelbegriff.

---

## 2. Die Ursache, gemessen

`process_csv_import` läuft als **ein** Statement. Die Rolle `authenticated` trägt
`statement_timeout = 8s` (gemessen gegen `pg_roles`). Die Funktion rechnet für **jede
neue, nicht-interne Zeile** gegen **jede im Monat aktive Karte** eine Konfidenz.

**Trockenlauf auf Produktion** (LL-18, `RAISE`-Rollback, nichts hinterlassen —
unabhängig verifiziert über „0 Fragmente vor 2025"):

```
40 echte Zeilen aus 2023  →  3.714 ms  →  92,85 ms je Zeile
```

Und der entscheidende Punkt an dieser Datei:

| Jahr | Zeilen in der Datei | in der Datenbank vorhanden |
|---|---|---|
| 2020 | 280 | — |
| 2021 | 385 | — |
| 2022 | 478 | — |
| 2023 | 705 | — |
| 2024 | 183 | — |
| 2025 | 265 | ja |
| 2026 | 239 | ja |

**Das älteste Fragment der Datenbank ist vom 02.01.2025.** Die **2.031** Zeilen davor
sind also sämtlich neu — jede einzelne durchläuft die teure Konfidenz-Schleife.

```
2.031 × 92,85 ms ≈ 188 s     gegen ein Limit von 8 s     →  Faktor 23
```

Der Import starb nach rund 86 Zeilen, die Transaktion rollte zurück, und es blieb
nichts übrig. **Das war kein Zufallsfehler, sondern in jedem Versuch dasselbe.**

### Warum der letzte Export funktionierte und dieser nicht

Der Export vom 27.08.2026 hatte **30** Zeilen. Der vom 01.09.2026 hat **2.535** —
es ist der volle Verlauf seit Januar 2020, nicht der Monatsauszug. An der App hat
sich nichts geändert; die Datei ist zwei Größenordnungen größer.

---

## 3. Warum kein Wächter das gefangen hat

Anker 1, Anker 2 und alle Prüfsummen bleiben grün. **Jede Zahl ist richtig — sie
kommt nur nie an.** Das ist dieselbe Familie wie LL-28 und LL-29:

- **LL-28:** Eine Mengen-Annahme veraltet mit der Menge. Die Import-Funktion wurde für
  Monatsauszüge von ~30 Zeilen gebaut; diese Annahme stand nirgends geschrieben.
- **LL-29:** Bei Trägheit zuerst zählen. Hier war es nicht die Zahl der Netzrunden,
  sondern die Arbeit **innerhalb** einer Runde, die über eine Grenze gewachsen ist.

**Und es ist ein Nachfahre von `PF-6`, nicht dessen Rückkehr.** `PF-6` beschrieb
dieselbe 8-Sekunden-Wand und wurde in **v2-30** behoben: 17 neue Zahlungen von
23.938 ms auf 1.357 ms, Faktor 17,6. Das sind rund **80 ms je Zeile** — praktisch
derselbe Wert, den ich heute gemessen habe. **v2-30 hat also nichts kaputtgemacht und
nichts übersehen.** Es hat den Fehler an der Datenmenge des Tages gemessen, und bei
17 Zeilen ist 80 ms je Zeile ein hervorragendes Ergebnis. Bei 2.031 Zeilen ist es die
Wand.

> Das ist LL-38 in einer weiteren Gestalt: Eine Zahl veraltet nicht, weil jemand sich
> geirrt hätte, sondern weil sich der Umfang geändert hat, auf den sie sich bezog.

---

## 4. Was gebaut wurde

**Der Import geht blockweise** — `src/lib/csv-batches.ts`, 25 Zeilen je Block.
Die Blockgröße folgt aus der Messung: 25 × 92,85 ms = 2,3 s, Reserve Faktor 3,4 zum
Limit. Gegen die echte Datei: **102 Blöcke, längster 2,69 s.**

**Die eigentliche Schwierigkeit war nicht das Schneiden, sondern wo man schneiden
darf.** `process_csv_import` nummeriert byte-identische Zeilen **innerhalb** von
`p_rows` durch (`row_number() OVER (PARTITION BY date, amount, description)`) und
hängt ab dem zweiten Vorkommen `|#N` an den Hash. Fällt eine solche Gruppe auf zwei
Blöcke, zählen beide bei 1 los, beide bekommen denselben Hash — und die zweite Zeile
wird als Duplikat verworfen. **Eine echte Zahlung verschwände still**, und die
Sparrate des Monats wäre danach falsch, ohne dass irgendein Anker anschlägt.

Die Blockbildung schneidet deshalb nie durch eine solche Gruppe. In dieser Datei sind
das 39 Gruppen mit 80 Zeilen, größte Gruppe 3 Zeilen, größte Spannweite 7 Positionen.
Gegen die echte Datei geprüft: **alle 2.535 Zeilen in exakter Reihenfolge, 0 getrennte
Gruppen.**

**Zwei Folgen, die bewusst in Kauf genommen sind:**

1. **Der Import ist über die ganze Datei nicht mehr atomar** (je Block schon). Bei
   102 Blöcken über Minuten wäre „alles oder nichts" die schlechtere Zusage — ein
   Abbruch im 99. Block würfe 98 gelungene weg. Tragfähig ist das nur, weil der
   Import über den Hash **idempotent** ist: dieselbe Datei erneut einwerfen setzt
   fort und überspringt den Rest als Duplikat. Genau dafür muss die Blockbildung
   **deterministisch** sein — und genau deshalb richtet sie sich **nicht** nach der
   gemessenen Laufzeit.
2. **Der Import dauert.** Für diese Datei rund **3–4 Minuten**. Das Portal zeigt
   deshalb während eines mehrblockigen Imports den Fortschritt („480 von 2.535
   Zahlungen"); ohne eine Zahl, die sich bewegt, ist ein Drei-Minuten-Import von
   „hängt" nicht zu unterscheiden, und der Nutzer lädt mitten im Import neu.

Neuer Portal-Zustand **`error-partial`**: Bricht ein späterer Block ab, ist etwas
angekommen. „Datei fehlerhaft" wäre dort unwahr und hielte den Nutzer von der einzig
richtigen Reaktion ab — dieselbe Datei noch einmal einwerfen.

**`revalidatePath` löst nur noch der letzte Block aus.** Sonst baute jeder der 102
Blöcke das gesamte Dashboard neu auf, mit je ~18 Netzrunden (Anker 3) — ein N+1 auf
der Ebene darüber.

**Wächter:** `tests/e2e/csv-blockbildung.spec.ts`, eingetragen in die feste
Dateiliste von `playwright.config.ts`. Nach **LL-40** gegengeprobt: Gegen eine naive
`slice`-Blockbildung werden **3 der 7** Prüfungen rot, mit genau der richtigen
Begründung. Ohne diesen Nachweis wäre ein grüner Lauf nur eine Zusicherung.

---

## 5. Der offene Hebel — und wo er NICHT hilft

Die Konfidenz-Schleife lässt sich datenbankseitig stark verbilligen, **aber nur für
Monate, in denen gar keine Karte aktiv ist.**

Der Planer zieht heute `calculate_match_confidence` vor `is_card_active_in_month` und
rechnet damit auch dort, wo es nichts zu treffen gibt. Eine Optimierungs-Sperre
(`OFFSET 0` oder ein `MATERIALIZED`-CTE um die Unterabfrage) kehrt das um. Gemessen,
dieselbe Abfrage, nur die Sperre unterscheidet sich:

| Monat | aktive Karten | ohne Sperre | mit Sperre |
|---|---|---|---|
| Juni **2023** | **0** | 128 ms | **9,8 ms** |
| Januar **2025** | 28 | 128 ms | 96 ms |

**Für die 2.031 Zeilen aus 2020–2024 wäre das Faktor 13** — aus 188 s würden rund
20 s. **Für einen normalen Monatsimport bringt es ~25 %**, weil die Konfidenz dort
tatsächlich gerechnet werden muss.

**Auch damit bliebe die Blockbildung nötig:** 20 s liegen weiterhin über 8 s.

**Warum es nicht in dieser Behebung steckt:** Es ist ein Eingriff in
`process_csv_import` und damit §7 Regel 20 — Probe auf der Übungs-Datenbank, Anker
vorher/nachher, menschliche Freigabe. Das ist ein eigener kleiner Sprint, kein
Nebenbei.

> **Nebenbefund zur Kartenzahl.** CLAUDE.md §6 Stolperfalle 18 nennt **77** Karten
> (Stand v2-24). Gemessen am 03.09.2026: **178** aktive Karten. Die Kosten der
> Konfidenz-Schleife wachsen linear damit — die Zahl gehört bei nächster Gelegenheit
> nachgezogen, samt Datum (LL-28).

---

## 6. Was der Nutzer entscheiden muss

**Die Datei enthält 2.031 Zahlungen aus 2020–2024. Die App modelliert 2025 und 2026.**
In jenen Jahren ist **keine einzige Karte aktiv** — die Zahlungen bekämen also weder
eine Zuordnung noch einen Vorschlag und lägen als offene Zahlungen in der Rohmasse.
Die gerade abgeschlossene Kuratierung (0 offene Zahlungen in beiden Jahren) bekäme
2.031 neue Einträge daneben.

**Auf die Sparrate wirken sie nicht** — ohne aktive Karte gibt es nichts zu
verrechnen, und die Monate 2020–2024 zeigt die App ohnehin nicht. Es ist also keine
Gefahr, sondern eine Frage der Übersicht.

Zwei Wege, beide vorbereitet:

1. **Alles importieren.** Der Fix trägt das; ~3–4 Minuten. Die Historie ist dann
   vollständig da, falls sie später einmal gebraucht wird.
2. **Nur 2025+2026 importieren.** Bei der DKB lässt sich der Export auf einen
   Zeitraum eingrenzen. Dann sind es ~504 Zeilen, überwiegend Duplikate, und der
   Import dauert Sekunden.

**Empfehlung: Weg 2**, solange kein Bedarf an den Altjahren besteht — der Nutzen ist
heute null, der Aufwand bei der Übersicht real. Weg 1 bleibt jederzeit nachholbar,
weil der Import idempotent ist.

---

## 7. Belege

| | |
|---|---|
| Trockenlauf 40 Zeilen | `RESULT={"inserted_count": 40, …} \| DAUER_MS=3714.0 \| JE_ZEILE_MS=92.85` |
| Rollback verifiziert | `fragmente_vor_2025 = 0`, `min_datum = 2025-01-02` |
| Anker 1 | 24 von 24 Monaten exakt, 0 Verletzungen |
| Prüfstrecke | `tsc` 0 · Lint 0 · Build 0 (Route `/` 40,3 kB · First Load 192 kB) · `test:visual` **182** (175 + 7 neue) · `test:e2e` **191** |
| Echte Datei durch echte Blockbildung | 2.535 Zeilen → 102 Blöcke, Reihenfolge identisch, 0 getrennte Gruppen, längster Block 2,69 s |

> **Zur Anker-Messung:** Zwischen Vorher und Nachher hat sich **August 2026** bewegt
> (Ist 457,11 → 341,36 €, Plan 327,46 → 294,31 €). Das ist **nicht** dieser Eingriff —
> er ist reines Frontend und kann keine Sparrate bewegen, und der Trockenlauf betraf
> ausschließlich 2023 und rollte zurück. Der Nutzer hat in derselben Zeit weiter
> kuratiert; genau deshalb gibt es seit dem 13.08.2026 keine eingefrorene
> Sollwert-Tabelle mehr. Die 23 übrigen Monate sind unverändert, Anker 1 hält überall.
