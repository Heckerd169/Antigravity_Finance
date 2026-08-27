# Sprint v2-30 — Der Import passt wieder in die Zeit

> **Auftrag:** Der Import zweier Monatsabzüge scheitert am 8-Sekunden-Zeitlimit der
> Rolle `authenticated`. Ursache und Ausschlüsse: `V2/befunde_2026-08-27_import-zeitlimit.md`.
>
> **Entscheidung des Nutzers (27.08.2026):** Option B — die Rechnung reparieren, nicht
> umgehen. Vorgabe wörtlich: *„der fachlich sauberste Weg, der am robustesten für die
> Zukunft ist, unabhängig von den Kosten."*
>
> **Briefing-Kriterien (sprint-start):** zwei treffen zu — **die Datenbank wird
> berührt** und **mehr als drei Phasen**.
>
> **Freigaben:** Plan freigegeben am 27.08.2026. P0-Schreibzugriff auf Produktion
> ausdrücklich freigegeben, mit den vorhergesagten Zahlen daneben.

---

## Ziel · Nicht-Ziel · Anker

**Ziel:** Ein Monatsimport mit typischer Zahl neuer Zahlungen läuft in der App wieder
durch, ohne dass sich ein einziger Konfidenz-Wert oder eine Sparrate ändert.

**Nicht-Ziel:** `PF-3` (Policy-Umstellung, eigener Sprint) · Stückelung großer Importe
(Option A, erst nach P4 entscheiden) · Anheben des Zeitlimits · Bewertungslogik ·
`ZO-8` · Frontend (`portal.tsx`, `actions.ts`).

**Der sprint-eigene Anker steht über den anderen:** Die Konfidenz-Matrix muss vor und
nach P2/P3 **identisch** sein. Bewegt sich ein Wert, ist es keine Tempo-Änderung mehr
→ zurückrollen, nicht erklären.

**Tempo-Ziel:** Import von 17 neuen Zahlungen unter `authenticated` in **< 3 s**
(heute ~34 s). 8 s ist die Grenze, 3 s die Reserve.

---

## P0 · Sofort-Import + Anker — ✅ ABGESCHLOSSEN (27.08.2026)

### Anker VORHER (24 Monate, Ist / Plan)

| Monat | Ist | Plan | | Monat | Ist | Plan |
|---|---|---|---|---|---|---|
| 2025-01 | −987,21 | −762,61 | | 2026-01 | 1.026,23 | 1.205,38 |
| 2025-02 | 1.813,37 | 1.944,66 | | 2026-02 | 1.667,90 | 1.651,10 |
| 2025-03 | 3.527,21 | 3.547,33 | | 2026-03 | 1.053,42 | 1.381,43 |
| 2025-04 | −198,14 | −1.215,25 | | 2026-04 | 1.753,14 | 1.729,58 |
| 2025-05 | 87,55 | 1.227,20 | | 2026-05 | −239,10 | −96,40 |
| 2025-06 | 894,60 | 1.228,15 | | 2026-06 | 3.509,75 | 3.799,90 |
| 2025-07 | −272,20 | −28,32 | | 2026-07 | −8,84 | 21,44 |
| 2025-08 | 169,35 | 458,61 | | 2026-08 | 629,34 | 404,46 |
| 2025-09 | 682,50 | 1.031,12 | | 2026-09 | 1.621,60 | 1.621,60 |
| 2025-10 | 3.697,29 | 3.739,26 | | 2026-10 | 1.691,08 | 1.691,08 |
| 2025-11 | 2.925,87 | 3.125,81 | | 2026-11 | 1.745,66 | 1.745,66 |
| 2025-12 | 783,12 | 1.009,64 | | 2026-12 | 1.456,09 | 1.456,09 |

Anker 1 vorher: **12/12 exakt** · Anker 2 vorher: **0 Verletzungen in 24 Monaten**.

### Die Erwartung — VOR dem Schreiben festgelegt (§7 Regel 21)

Kombinierter Trockenlauf beider Dateien mit `RAISE`-Rollback (LL-18), Reihenfolge
Giro → Visa:

| | neu | Duplikate | auto-verlinkt | Überträge | IBAN-Backfill |
|---|---|---|---|---|---|
| Giro | 11 | 36 | 1 | 5 | 0 |
| Visa | 17 | 13 | 3 | 5 | 0 |

**Erwartete Sparraten-Bewegung: KEINE, in allen 24 Monaten.**

> **Warum eine Null hier das richtige Ergebnis ist — und nicht bloß gemessen, sondern
> verstanden.** Von 28 neuen Zahlungen sind **10 interne Überträge** (zählen nie,
> §6 Stolperfalle 7), **14 bleiben unverlinkt** (eine lose Zahlung zählt nicht in die
> Sparrate), und die **4 verlinkten** bewegen aus je eigenem Grund nichts:
>
> - `CLAUDE.AI SUBSCRIPTION` **[FIXED_COST]** ← „ANTHROPIC* CLAUDE SUB" −107,10 €.
>   Realität gewinnt, der Betrag trifft den Plan.
> - `Tanken` **[BUDGET]** ← zwei Aral-Zahlungen −2,39 € und −35,00 €, plus eine aus
>   der Giro-Datei. **Budget zeigt den Plan, solange die Ausgaben darunter liegen**
>   (Design-Doku §4.3, LL-12).
>
> Das ist exakt die Falle aus `ZO-4`: Dort hatte der Juli 2025 nur noch **79 Cent
> Luft**, und eine nachträglich zugeordnete Tankfüllung hätte den Monat gekippt. Hier
> ist genug Luft — belegt durch den Trockenlauf, nicht angenommen.

### Ausführung und Verifikation (getrennte Aufrufe, `db-eingriff`)

| | neu | Duplikate | verlinkt | Überträge | = Erwartung? |
|---|---|---|---|---|---|
| Giro (echt) | 11 | 36 | 1 | 5 | ✅ |
| Visa (echt) | 17 | 13 | 3 | 5 | ✅ |

### Anker NACHHER

- **24 Monate geprüft: 24× Ist identisch, 24× Plan identisch, 0 Abweichungen** ✅
- **Anker 1: 0 Verletzungen** (12 Monate) ✅
- **Anker 2: 0 Verletzungen** (24 Monate, max. 13 Treiber je Monat bei Limit 50 —
  die Summe ist also vollständig und nicht durch das Limit beschnitten) ✅

**Datenstand nach P0:** 1.628 Fragmente, davon **36 offen** (21 aus 2026), 176 Karten,
**28 aktiv im August 2026**.

> **Abweichung vom Plan, bewusst und begründet:** Die Konfidenz-Matrix wird **nicht**
> in P0 eingefroren, sondern zu Beginn von P2, unmittelbar vor der Migration.
> Zwischen P0 und P2 liegt P1; kuratiert der Nutzer in dieser Zeit, wäre eine früh
> eingefrorene Matrix überholt und der Vergleich wertlos. Ein Wächter, der aus einem
> veralteten Stand vergleicht, meldet Bewegungen, die der Eingriff nicht verursacht
> hat — und wird nach dem zweiten Fehlalarm nicht mehr gelesen (dieselbe Begründung,
> aus der die eingefrorene Anker-Tabelle am 13.08.2026 aus §9 geflogen ist).

---

## P1 · Vollständige Kostenaufstellung — ✅ ABGESCHLOSSEN (27.08.2026)

**Kein Code, kein Schema.** Alle Messungen unter `SET LOCAL ROLE authenticated` —
**nie** unter der Dienst-Rolle.

### Der Referenzwert für die Abnahme

Echter Importlauf in einer zurückgerollten Transaktion (17 Visa-Fragmente gelöscht,
neu importiert, `RAISE` → zurück):

> **23.938 ms für 17 neue Zahlungen = 1.408 ms je Zahlung.**
> Limit: **8.000 ms**. Das ist **dreifach darüber** — und damit die Zahl, gegen die
> P4 misst.

Der Messaufbau funktioniert und ist damit für S7 erprobt.

### Die Zerlegung — je Zahlung, gegen 28 aktive Karten

| Posten | Dauer | Anteil an der Runde |
|---|---|---|
| **Konfidenz-Runde gesamt** | **307 ms** | 100 % |
| davon **`history_match`** | **263 ms** | **86 %** |
| davon `name_similarity_scoped` | 7 ms | 2 % |
| davon `merchant_rule_match` | 6 ms | 2 % |
| davon Rest (`amount_match`, `frequency_match`, Overhead) | ~31 ms | 10 % |

Alles außerhalb der Runde ist **vernachlässigbar**:

| Posten | Dauer |
|---|---|
| `INSERT` in `fragments`, alle 6 Indizes | **8,9 ms** |
| Hash-Bildung (`digest`) | 2,0 ms |
| Kartenauswahl (`is_card_active_in_month` × 28) | 20,4 ms |
| `own_ibans` lesen | 11,4 ms (einmal je **Import**, nicht je Zahlung) |

> ### ⚠️ Zwei Verdachtsmomente sind hier GESTORBEN — beide waren plausibel
>
> **① Der GIN-Index war unschuldig.** Der Trigram-Index auf `description` ist mit
> 1.376 kB der größte der sechs, und GIN-Einfügungen gelten als teuer. Der Verdacht
> lag nahe genug, dass er im Plan stand. Gemessen kostet ein vollständiger `INSERT`
> mit **allen sechs** Indizes **8,9 ms** — 0,6 % der Kosten je Zahlung. **Auch
> `fragments` hat keine Trigger**, der Einfügepfad ist nackt.
>
> **② Meine eigene Schätzung „history_match sind nur ~13 %" war zu niedrig.** Sie
> stammte aus 255 ms gegen 1.995 ms Import — also aus zwei Messungen, die unter
> verschiedener Last entstanden sind. Sauber zerlegt sind es **86 % der
> Konfidenz-Runde**, und die Runde ist praktisch der ganze Import.
>
> **Deshalb ist die Entkopplung von `history_match` nicht nur der richtige Hebel,
> sondern auch ein ausreichender.** Genau dafür gab es P1: Hätte P2 nach dem
> GIN-Verdacht gebaut, wäre der Sprint an 0,6 % der Kosten verstrichen.

### Die Beobachtung, die man kennen muss, um die Zahlen zu lesen

**Dieselbe Messung liefert 307, 575, 602 und 685 ms.** Die Schwankung ist real und
nicht wegzumitteln: Die kostenlose Instanz drosselt unter Dauerlast, und diese Sitzung
hat sie mit Messläufen belastet. **Das ist LL-29 selbst** — dort wurde aus genau
dieser Drosselung ein Ausfall.

**Konsequenz für die Bewertung:** Absolute Millisekunden aus dieser Sitzung sind
Größenordnungen, keine Sollwerte. **Die Anteile sind stabil** (`history_match`
86 %, über mehrere Läufe reproduziert) — und Anteile tragen die Entscheidung, welcher
Posten anzufassen ist. Der Abnahme-Wert in P4 wird deshalb **unmittelbar vor und nach**
der Migration erhoben, in derselben Sitzung, nicht gegen die 23.938 ms von heute.

### A/B: warum der Trockenlauf den Fehler nicht sieht

Identischer 5-Zeilen-Payload, getrennte Läufe:
**545 ms** (Dienst-Rolle) gegen **9.973 ms** (`authenticated`) — Faktor **18**.

### Die eine Ursache, die schon feststeht

`history_match` wird **je Karte** aufgerufen, aber ihre teure Stufe-1-Abfrage hängt am
**Fragment** (`af_merchant_key(description)`), nicht an der Karte — nur der
Schlussfilter `count(*) FILTER (WHERE l.card_id = p_card_id)` nutzt sie. Bei 28 Karten
läuft deshalb **28-mal dieselbe Abfrage**.

**Belegt:** dieselbe Abfrage 28× = **255 ms**; gemessenes `history_match` je Zahlung =
264–278 ms. Die Differenz ist Aufruf-Overhead.

Das ist **LL-29 in neuer Gestalt**: nicht die Abfrage optimieren, sondern zählen, wie
oft gefragt wird.

### Was P1 für P2 entschieden hat

**P2 fasst genau einen Posten an: `history_match`.** Kein zweiter Posten lohnt —
alles außerhalb der Konfidenz-Runde liegt zusammen unter 32 ms je Zahlung.

Erwartung: `history_match` von **28 Ausführungen auf 1** je Zahlung, also 263 ms →
grob 9 ms. Die Konfidenz-Runde fällt damit von ~307 auf ~53 ms — **Faktor ~6 auf den
gesamten Import**.

Ob das für das Ziel „< 3 s bei 17 Zahlungen" reicht, wird in P4 gemessen, nicht hier
behauptet. Reicht es nicht, ist **P3** der Ort dafür — mit dann frischen Zahlen.

---

## P2 · Der Händler-Schlüssel wird eine Spalte — ✅ ABGESCHLOSSEN (27.08.2026)

> **P1 hatte die Entkopplung von `history_match` vorgesehen — gebaut wurde etwas
> anderes und Kleineres.** Der Grund ist ein Fund, den erst der Abfrageplan zeigte.

### Der eigentliche Fund: ein Ausdrucks-Index ist gegen Inlining nicht robust

`idx_fragments_merchant_key` steht auf `af_merchant_key(description)`.
`af_merchant_key` ist eine **SQL**-Funktion, also **inlined der Planer sie**. Im Plan
steht danach nicht mehr der Funktionsaufruf, sondern sein Rumpf:

```
Filter: btrim(regexp_replace(replace(translate(lower(COALESCE(description,'')),
          'äöüÄÖÜ','aouaou'),'ß','ss'),'[^a-z]+',' ','g')) = 'paypal felix augustin'
Rows Removed by Filter: 1628          ← Seq Scan über ALLE Fragmente
Execution Time: 10.352 ms
```

**Der Index trägt den Aufruf, die Abfrage den Rumpf — sie treffen sich nie.** Und weil
`history_match` je Karte aufgerufen wird, passiert dieser vollständige Tabellenlauf
**28-mal je Zahlung**.

> **Warum das so lange unsichtbar blieb:** `pg_stat_user_indexes` weist für den Index
> **88.107 Scans** aus. Er greift also anderswo sehr wohl. **Die Statistik sagt „wird
> benutzt", der Plan sagt „hier nicht"** — und niemand liest den Plan, solange die
> Statistik beruhigt. Dieselbe Klasse wie die Regions-Zeile aus LL-30.

### Zwei naheliegende Fixes wurden gemessen und VERWORFEN

| Versuch | vorher | nachher | Ergebnis |
|---|---|---|---|
| Policies auf `(select auth.uid())` (= `PF-3`, Supabase-Empfehlung) | 274 ms | 289 ms | **kein Effekt** |
| `af_merchant_key` auf `LANGUAGE plpgsql`, damit nicht inlinebar | 285 ms | 367 ms | **schlechter** |

Beim zweiten wählt der Planer dann einen Seq Scan über `card_fragment_links` und zahlt
den Funktionsaufruf je Zeile. **Beide stehen in der Migration dokumentiert**, damit die
nächste Sitzung sie nicht erneut probiert.

### Gebaut: der Schlüssel wird materialisiert

`fragments.merchant_key` als `GENERATED ALWAYS AS (af_merchant_key(description))
STORED`, dazu ein gewöhnlicher B-Tree-Index `(user_id, merchant_key)`. Ein
Spalten-Index ist gegen Inlining **immun**, weil nichts mehr zu expandieren ist.

**Kein Nachbau (§6 Stolperfalle 16):** Die Spalte *ruft* `af_merchant_key` auf, statt
deren Logik zu wiederholen. Es gibt weiterhin genau **eine** Definition des Schlüssels.

`history_match` liest die Spalte statt den Ausdruck — **zwei geänderte Zeilen**, alles
andere wortgleich inklusive Kommentaren (Prüfsummen-Falle aus v2-25/v2-29).

| `history_match` × 28 Karten | Dauer |
|---|---|
| vorher | 326 ms |
| nachher | **12 ms** |
| **Faktor** | **27** |

### Verifikation

**Vor dem Einspielen**, im zurückgerollten Trockenlauf:

- Spalte gegen Ausdruck, **alle 1.628 Zeilen** → **0 Abweichungen**
- `history_match` alt gegen neu, **231 Paare** → **0 Unterschiede**

**Nach dem Einspielen:**

- Sparrate 24 Monate Ist+Plan → **24/24 identisch, 0 Abweichungen**
- Anker 1 → **0 Verletzungen** (12 Monate) · Anker 2 → **0 Verletzungen** (24 Monate)
- Spalten-Äquivalenz erneut über 1.628 Zeilen → **0 Abweichungen**
- Prüfsummen von 17 Funktionen → **genau eine geändert: `history_match`**
  (vorher `99aa12b889a18691917c7c7e93f191f6`). `calculate_match_confidence`,
  `process_csv_import`, `refresh_fragment_suggestions`, beide Sparrate-Funktionen und
  `af_merchant_key` selbst sind **unverändert**.
- `types.ts` neu erzeugt. **Namensmengen verglichen, nicht der Zeilen-Diff:**
  47 RPC-Funktionen vorher und nachher, **keine verschwunden**. Kein
  `<claude-code-hint>` am Dateiende.

### Was diese Phase NICHT getan hat

Der alte Ausdrucks-Index `idx_fragments_merchant_key` **bleibt**. Welcher Aufrufer
seine 88.107 Scans verursacht, ist nicht ermittelt; ihn mitzunehmen wäre eine zweite
Verschiebung im selben Sprint — dieselbe Begründung, aus der v2-29 `ZO-8` liegen ließ.
Kosten des Behaltens: ein Anteil an den 8,9 ms je `INSERT`. **Gehört als eigener Punkt
in die Roadmap.**

### Vorherige Planung (überholt, bleibt als Beleg stehen)

Vorgesehen war, `history_match` zu **entkoppeln** — einmal je Zahlung statt je Zahlung
× Karte. Das wäre der größere Umbau gewesen und hätte `calculate_match_confidence`
mit berührt. **Er ist nicht mehr nötig:** Der Index-Fix bringt Faktor 27 auf denselben
Posten, bei zwei geänderten Zeilen statt einer neuen Funktionssignatur. Die
Entkopplung bleibt als Option, falls die Datenmenge irgendwann wieder drückt.

**Nicht verhandelbar — die drei Filter bleiben wortgleich:**

| Filter | Warum |
|---|---|
| `l.origin = 'MANUAL_DROP'` | sonst lernt die Automatik aus ihrer eigenen Vermutung |
| `f.transfer_type IS NULL` | ein Übertrag wird nie verlinkt (§6 Stolperfalle 7) |
| `f.id <> p_fragment_id` | Leave-one-out, sonst misst man Auswendiglernen (§7 Regel 25) |

**Vor der Migration:** Konfidenz-Matrix einfrieren. **Nach der Migration:** Matrix
identisch, Prüfsummen der nicht angefassten Funktionen identisch.

> **Prüfsummen-Falle aus v2-25/v2-29:** `pg_get_functiondef` schließt **Kommentare
> ein**. Jedes „Aufräumen" im Rumpf ändert die Prüfsumme, ohne das Verhalten zu
> ändern. Stand `history_match` vor diesem Sprint:
> `99aa12b889a18691917c7c7e93f191f6`.

---

## P3 · Restliche Posten — ✅ ENTFÄLLT

**Kein weiterer Posten lohnt.** P2 bringt Faktor 17,6 auf den gesamten Import und
damit weit unter das Limit; alles außerhalb der Konfidenz-Runde liegt zusammen unter
32 ms je Zahlung. Die Phase entfällt als **Ergebnis**, nicht als Versäumnis — der Plan
hatte diesen Ausgang ausdrücklich vorgesehen.

---

## P4 · Abnahme — ✅ ABGESCHLOSSEN (27.08.2026)

### S7 — die Messung, um die es ging

Derselbe Aufbau wie in P1, in einer zurückgerollten Transaktion, unter
`SET LOCAL ROLE authenticated`:

| Import von 17 neuen Zahlungen | Dauer | je Zahlung |
|---|---|---|
| vorher (P1) | 23.938 ms | 1.408 ms |
| **nachher** | **1.357 ms** | **80 ms** |
| Limit | 8.000 ms | |
| Ziel des Plans | < 3.000 ms | |

**Faktor 17,6 — das Ziel ist mit Reserve erreicht.** Die Ergebnisse sind dabei
identisch: 17 neu, 13 Duplikate, 3 verlinkt, 5 Überträge.

### Prüfstrecke

- `tsc --noEmit` → **0 Fehler**
- `pnpm test:visual` → **148 von 148 bestanden**

### Was noch aussteht

**Der Browser-Smoke des Nutzers (S9).** Er ist der Produktiv-Gate und durch nichts
hiervon ersetzt.

> **Zu prüfen ist dabei ausdrücklich der Import selbst** — und dafür braucht es eine
> Datei mit **neuen** Zahlungen. Die beiden vom 27.08. liegen seit P0 in der
> Datenbank; sie erneut zu laden prüft nur den Duplikat-Pfad, der noch nie langsam
> war. Der belastbare Test ist der **nächste** Monatsabzug.

> **⚠️ P0 hat uns den natürlichen Abnahme-Beleg genommen.** Beide Dateien sind
> importiert; alle Zeilen sind jetzt Duplikate und überspringen genau die Rechnung,
> die gemessen werden soll.

**Deshalb misst die Abnahme in einer zurückgerollten Transaktion:** die betroffenen
Fragmente löschen, neu importieren, Dauer stoppen, `RAISE` → alles zurück (LL-18),
unter `SET LOCAL ROLE authenticated`.

Dazu Prüfstrecke (`tsc`, `pnpm test:visual`), Anker 1+2 über 24 Monate,
Konfidenz-Matrix gegen P2, Prüfsummen — und der **Browser-Smoke des Nutzers**.

---

## Prüfschritte

| # | Schritt | Erwartung | Stand |
|---|---|---|---|
| S1 | P0-Import beider Dateien | exakt wie im Trockenlauf vorhergesagt | ✅ |
| S2 | Sparrate nach P0, 24 Monate Ist+Plan | unverändert | ✅ 24/24 |
| S3 | Anker 1, 12 Monate 2026 | Ordner-Spalte == Sparrate | ✅ 0 Verletzungen |
| S4 | Anker 2, 24 Monate | `Σ delta = Ist − Plan` | ✅ 0 Verletzungen |
| S5 | Konfidenz-Matrix nach P2 | **identisch** — sonst Rollback | ✅ 231 Paare, 0 Unterschiede; zusätzlich Spalten-Äquivalenz 1.628/1.628 |
| S6 | Prüfsummen nicht angefasster Funktionen | identisch | ✅ 16 von 17 unverändert, nur `history_match` geändert |
| S7 | Import 17 neuer Zahlungen, `authenticated`, rückgerollt | < 3 s | ✅ **1.357 ms** (vorher 23.938 ms) |
| S8 | Sparrate nach P2, 24 Monate | unverändert gegenüber S2 | ✅ 24/24, 0 Abweichungen |
| S9 | Browser-Smoke des Nutzers | Import läuft in der App durch | **offen — braucht eine Datei mit NEUEN Zahlungen** |

**Regel-basiert, nicht instanz-basiert (LL-19):** S7 prüft „ein Import mit 17 neuen
Zahlungen", nicht „diese Visa-Datei". S5 prüft „jeder Konfidenz-Wert", nicht „die
Spotify-Zeile".

**Kartentyp (LL-12):** Für den Umbau nicht einschlägig — es wird kein Kartenverhalten
geändert, nur die Geschwindigkeit. In P0 war er es sehr wohl, und dort ist er
ausgewertet: Budget zeigt den Plan, Fixkosten die Realität.

---

## Offene Fragen

1. **Was sind die ~1.310 ms?** → P1. Der GIN-Index ist ein Verdacht, keine Messung.
2. **Reicht die Reparatur für einen Jahresimport?** (2025: 544 Zahlungen) → nach P4
   anhand echter Zahlen entscheiden, nicht jetzt.
3. **Warum ist die Rechnung unter `authenticated` überhaupt teurer?** Für P2 nicht
   nötig — die 28 Wiederholungen sind unabhängig davon falsch. Bleibt Beobachtung.

## Kandidat fürs Register

**LL-42 — Eine Performance-Messung gilt nur unter der Rolle, unter der die App
arbeitet.** Ein MCP-Trockenlauf läuft als `service_role`/`postgres`, also ohne RLS und
**ohne Zeitlimit**; er beweist Richtigkeit, nicht Bezahlbarkeit. v2-29 hat den
Händler-Index mit 0,208 ms je Aufruf dokumentiert — korrekt gemessen, aber unter einer
Rolle, die es in der laufenden App nicht gibt. Wird am Sprint-Ende zur Freigabe
vorgelegt.
