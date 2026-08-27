# Sprint v2-30 — Review

> **Branch:** `sprint/v2-30-zuordnung-tempo` (PR **#48**, gemergt) ·
> **Commits:** 4 (P0 · P1 · P2/P4 · Befund) · **Datum:** 27.08.2026 ·
> **Browser-Smoke:** bestanden
>
> **In einem Satz:** Der Import von 17 neuen Zahlungen fiel von **23.938 ms auf
> 1.357 ms** — nicht weil zu oft gefragt wurde, sondern weil ein Ausdrucks-Index
> durch Inlining **nie griff**, während die Statistik 88.107 Zugriffe auswies.

---

## 1. Was gebaut wurde

### P0 · Sofort-Import + Anker einfrieren *(keine Codeänderung)*

Der Nutzer konnte nicht importieren. Nach ausdrücklicher Freigabe wurden beide
Monatsabzüge vom 27.08.2026 einmalig über die Dienst-Rolle eingespielt, die kein
Zeitlimit kennt.

**Die Erwartung stand vor dem Schreiben fest** (§7 Regel 21), ermittelt im
kombinierten Trockenlauf mit `RAISE`-Rollback:

| | neu | Duplikate | verlinkt | Überträge |
|---|---|---|---|---|
| Giro | 11 | 36 | 1 | 5 |
| Visa | 17 | 13 | 3 | 5 |

**Erwartete Sparraten-Bewegung: keine.** Ausgeführt: exakt so eingetreten.

### P1 · Kostenaufstellung *(keine Codeänderung)*

Zerlegung des Imports unter `SET LOCAL ROLE authenticated`. Ergebnis siehe §3.
**Zwei Verdachtsmomente sind hier gestorben**, siehe §5.

### P2 · Der Händler-Schlüssel wird eine Spalte

`supabase/migrations/20260827_v2_30_merchant_key_materialisiert.sql`

- **`fragments.merchant_key`** als `GENERATED ALWAYS AS (af_merchant_key(description))
  STORED`
- **`idx_fragments_merchant_key_stored`** — gewöhnlicher B-Tree über
  `(user_id, merchant_key)`
- **`history_match`** liest die Spalte statt den Ausdruck — **zwei geänderte Zeilen**,
  alles andere wortgleich inklusive Kommentaren

Berührt außerdem: `src/lib/supabase/types.ts` (neu erzeugt).

### P3 · entfallen

Kein weiterer Posten lohnt — alles außerhalb der Konfidenz-Runde liegt zusammen unter
32 ms je Zahlung. **Das ist ein Ergebnis, kein Versäumnis**; der Plan hatte diesen
Ausgang ausdrücklich vorgesehen.

### P4 · Abnahme

Messaufbau in zurückgerollter Transaktion: Fragmente löschen, neu importieren, Dauer
stoppen, `RAISE` → zurück.

---

## 2. Prüfstrecke

| Prüfung | Erwartung | Ergebnis |
|---|---|---|
| `tsc --noEmit` | 0 Fehler | **0** ✅ |
| ESLint (Worktree-Umweg) | 0/0 | **keine Probleme** ✅ |
| `pnpm build` | 0 Fehler | **erfolgreich** ✅ |
| `pnpm test:visual` | steigt nur um eigene Tests | **148/148** ✅ (144 → 148) |
| `pnpm test:e2e` | vollständig grün | **157/157** ✅ (153 → 157) inkl. Render-Smoke |

**Bundle:** Route `/` **37 kB**, First Load JS **189 kB**, Middleware 82,1 kB.

> **Die +4 stammen NICHT aus diesem Sprint**, sondern aus PR #47
> (`claude-md-umfang.spec.ts`), der nach v2-29 gemergt wurde. **v2-30 hat keinen
> eigenen Wächter erzeugt** — dazu §6.

---

## 3. Anker vorher/nachher

### Der Sprint-Anker: Tempo

| Import von 17 neuen Zahlungen | Dauer | je Zahlung |
|---|---|---|
| vorher | 23.938 ms | 1.408 ms |
| **nachher** | **1.357 ms** | **80 ms** |
| Limit `authenticated` | 8.000 ms | |
| Ziel des Plans | < 3.000 ms | |

**Faktor 17,6.** Ergebnisse identisch: 17 neu, 13 Duplikate, 3 verlinkt, 5 Überträge.

### Die Zerlegung aus P1 — je Zahlung × 28 Karten

| Posten | Dauer | Anteil |
|---|---|---|
| Konfidenz-Runde gesamt | 307 ms | 100 % |
| davon **`history_match`** | **263 ms** | **86 %** |
| davon `name_similarity_scoped` | 7 ms | 2 % |
| davon `merchant_rule_match` | 6 ms | 2 % |
| `INSERT` (alle 6 Indizes) | 8,9 ms | — |
| Hash-Bildung | 2,0 ms | — |
| Kartenauswahl | 20,4 ms | — |

`history_match` isoliert: **326 ms → 12 ms, Faktor 27.**

### Die Wächter: nichts hat sich bewegt

| Anker | Ergebnis |
|---|---|
| Sparrate 24 Monate, Ist **und** Plan | **24/24 identisch, 0 Abweichungen** ✅ |
| Anker 1 (Ordner-Spalte == Sparrate) | **0 Verletzungen** (12 Monate) ✅ |
| Anker 2 (`Σ delta = Ist − Plan`) | **0 Verletzungen** (24 Monate) ✅ |
| Spalte gegen Ausdruck, alle Zeilen | **0 Abweichungen** (1.628/1.628) ✅ |
| `history_match` alt gegen neu | **0 Unterschiede** (231 Paare) ✅ |
| Prüfsummen 17 Funktionen | **genau eine geändert:** `history_match` ✅ |

Unverändert belegt: `calculate_match_confidence`, `process_csv_import`,
`refresh_fragment_suggestions`, beide Sparrate-Funktionen, `af_merchant_key` selbst.

> **Die Null in P0 ist erklärt, nicht bloß gemessen.** Von 28 neuen Zahlungen sind 10
> interne Überträge (zählen nie), 14 bleiben unverlinkt (eine lose Zahlung zählt nicht
> in die Sparrate), und die 4 verlinkten bewegen aus je eigenem Grund nichts:
> `CLAUDE.AI SUBSCRIPTION` ist **FIXED_COST** und trifft den Plan; `Tanken` ist
> **BUDGET** und zeigt den Plan, solange die Ausgaben darunter liegen (§4.3, LL-12).
> Das ist exakt die `ZO-4`-Falle, wo der Juli 2025 nur **79 Cent Luft** hatte.

---

## 4. Selbst-Review gegen die Akzeptanzkriterien

| # | Kriterium | erfüllt | Beleg |
|---|---|---|---|
| S1 | P0-Import wie vorhergesagt | ✅ | 11/36/1/5 und 17/13/3/5, exakt wie im Trockenlauf |
| S2 | Sparrate nach P0 unverändert | ✅ | 24/24, 0 Abweichungen |
| S3 | Anker 1, 12 Monate 2026 | ✅ | 0 Verletzungen |
| S4 | Anker 2, 24 Monate | ✅ | 0 Verletzungen, max. 13 Treiber bei Limit 50 |
| S5 | Konfidenz-Matrix identisch | ✅ | 231 Paare + Spalten-Äquivalenz 1.628/1.628 |
| S6 | Prüfsummen unberührter Funktionen | ✅ | 16 von 17 unverändert |
| S7 | Import < 3 s | ✅ | **1.357 ms** (Limit 8.000, vorher 23.938) |
| S8 | Sparrate nach P2 unverändert | ✅ | 24/24 gegenüber S2 |
| S9 | Browser-Smoke | ✅ | vom Nutzer bestätigt, 27.08.2026 |

---

## 5. Architektur-Entscheidungen

### ① Materialisierte Spalte statt Entkopplung

**Alternative bestand:** Der Plan sah vor, `history_match` zu **entkoppeln** — einmal
je Zahlung statt je Zahlung × Karte. Das hätte `calculate_match_confidence` mit
berührt und eine neue Funktionssignatur gebraucht.

**Gewählt wurde die Spalte**, weil der Abfrageplan eine tiefere Ursache zeigte: Der
Index griff überhaupt nicht. Faktor 27 bei **zwei geänderten Zeilen** schlägt einen
Umbau, der dieselbe Ursache stehen ließe. Die Entkopplung bleibt als Option.

**Kein Nachbau (§6 Stolperfalle 16):** Die Spalte *ruft* `af_merchant_key` auf. Es
gibt weiterhin genau eine Definition des Schlüssels; ändert sie sich, rechnet Postgres
die Spalte selbst neu.

### ② Zwei naheliegende Fixes gemessen und verworfen

| Versuch | vorher | nachher | |
|---|---|---|---|
| `PF-3`, Policies auf `(select auth.uid())` | 274 ms | 289 ms | **kein Effekt** |
| `af_merchant_key` auf `LANGUAGE plpgsql` | 285 ms | 367 ms | **schlechter** |

Beim zweiten wählt der Planer dann einen Seq Scan über `card_fragment_links` und zahlt
den Funktionsaufruf je Zeile. **Beide stehen in der Migration dokumentiert** — der
Wert liegt darin, dass die nächste Sitzung sie nicht erneut probiert.

### ③ Der GIN-Verdacht war falsch — und P1 hat ihn getötet

Der Trigram-Index ist mit 1.376 kB der größte der sechs, GIN-Einfügungen gelten als
teuer. Der Verdacht stand **im freigegebenen Plan**. Gemessen kostet ein `INSERT` mit
**allen sechs** Indizes **8,9 ms** — 0,6 % der Kosten je Zahlung.

**Hätte P2 nach dem Verdacht gebaut, wäre der Sprint an 0,6 % der Kosten
verstrichen.** Genau dafür gab es P1 als eigene Phase ohne Code.

### ④ Der alte Index bleibt stehen

`idx_fragments_merchant_key` hat seinen Hauptnutzer verloren, wird aber **nicht**
gelöscht: `pg_stat_user_indexes` weist **88.107 Scans** aus, und welcher Aufrufer sie
verursacht, ist nicht ermittelt. Ein Sprint, eine Verschiebung — dieselbe Begründung
wie bei `ZO-8` in v2-29. Neu als **`PF-7`** in der Roadmap.

### ⑤ Probe auf Produktion statt auf der Übungs-Datenbank

**Abweichung von `db-eingriff`**, vom Nutzer freigegeben. Begründung: Der Fund hängt
an der echten Datenmenge (1.628 Fragmente) und an echten Händlernamen; der
synthetische Bestand der Übungs-Datenbank hätte den Effekt **nicht zeigen können**.
Stattdessen wurde auf Produktion in zurückgerollten Transaktionen geprobt — mit
Spalten-Äquivalenz über alle Zeilen und Matrix-Vergleich als Wächter. Dieselbe
Begründungsform wie in v2-24 §5.

---

## 6. Offene Punkte und Fragen

### Dieser Sprint hat keinen eigenen Wächter erzeugt

**Das ist die unbefriedigendste Stelle.** Der Fehler blieb unentdeckt, weil Anker,
Prüfsummen und beide Invarianten grün waren — jede Zahl war richtig, sie kam nur zu
spät. Genau dafür entstand in v2-24 **Anker 3** (Anfragen je Dashboard-Aufbau).

**Für den Import gibt es kein Gegenstück.** Ein Playwright-Test wäre der falsche Ort:
Er liefe gegen wechselnde Daten und würde nach dem dritten Fehlalarm nicht mehr
gelesen — dieselbe Begründung, aus der die eingefrorene Anker-Tabelle am 13.08.2026
aus §9 flog.

**Vorschlag statt Test:** ein **Anker 4** in §9 — *Dauer eines Imports je neuer
Zahlung, gemessen unter `SET LOCAL ROLE authenticated`*. Stand nach v2-30: **80 ms**.
Steigt er deutlich, ist ein Index unbrauchbar geworden, ohne dass eine Zahl falsch
wird. **Zur Entscheidung des Nutzers**, nicht vorweggenommen.

### `PF-7` — wer nutzt den alten Index?

88.107 Scans haben einen Verursacher. Erst finden, dann löschen.

### Reicht es für einen Jahresimport?

Bei 80 ms je Zahlung wären 544 Zahlungen (Import 2025) rund **44 s** — weiterhin über
dem Limit. **Die Stückelung großer Importe (Option A aus dem Befund) bleibt damit
offen**, ist aber für Monatsabzüge nicht nötig. Erst nötig, wenn wieder ein Jahr
importiert wird.

---

## 7. Vorschläge für CLAUDE.md und Roadmap

**Als Vorschlag formuliert — die Anwendung braucht die Freigabe des Users.**

### LL-42 · Eine Performance-Messung gilt nur unter der Rolle, unter der die App arbeitet

Ein Trockenlauf über MCP läuft als `service_role`/`postgres` — **ohne RLS und ohne
Zeitlimit**. Er beweist **Richtigkeit, nicht Bezahlbarkeit**.

Belege aus diesem Sprint: identischer Payload **545 ms** (Dienst-Rolle) gegen
**9.973 ms** (`authenticated`), Faktor 18. Und v2-29 hat den Händler-Index mit
**0,208 ms je Aufruf** dokumentiert — korrekt gemessen, aber unter einer Rolle, die es
in der laufenden App nicht gibt.

**Regel:** Wer Tempo misst, setzt `SET LOCAL ROLE authenticated`.

**Nicht in LL-29 enthalten:** Dort war der Weg zu oft gegangen (Netzrunden zählen).
Hier ist die Zahl der Wege richtig — nur unter der falschen Rolle gestoppt.

### Stolperfalle · Ein Ausdrucks-Index über eine SQL-Funktion ist gegen Inlining nicht robust

Der Planer **inlined** SQL-Funktionen; danach steht im Plan der Rumpf statt des
Aufrufs, und ein Index über den Aufruf trifft ihn nicht mehr. Symptom: `Seq Scan` mit
`Rows Removed by Filter` in Höhe der Tabellengröße.

**Und die Statistik verrät es nicht:** `pg_stat_user_indexes` wies **88.107 Scans**
aus — der Index griff anderswo sehr wohl. **Wer einen Ausdrucks-Index anlegt, prüft
den Plan seines Hauptaufrufers, nicht die Scan-Zahl.** Abhilfe: den Wert als Spalte
materialisieren (`GENERATED … STORED`) und gewöhnlich indizieren.

**Verwandt mit LL-30:** eine beruhigende Zahl, die niemanden nachsehen lässt.

### Anker 4 (siehe §6)

### Roadmap

- **`PF-6`** → 🟡 auf ✅ (nach diesem Review)
- **`PF-7`** neu ⬜ — der alte Index
- **`PF-3`** um das Messergebnis ergänzt: für den Import wirkungslos
