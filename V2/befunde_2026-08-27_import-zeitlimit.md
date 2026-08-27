# Befund 27.08.2026 — Der Import scheitert an der Uhr, nicht an der Datei

> **Symptom des Nutzers:** Die beiden Monatsabzüge vom 27.08.2026 (DKB-Giro und
> DKB-Visa) lassen sich nicht importieren — die App zeigt bei beiden einen Fehler.
> Eine ältere Datei ging im selben Zeitraum problemlos durch.
>
> **Befund in einem Satz:** Die Dateien sind einwandfrei. Der Import überschreitet
> das **8-Sekunden-Zeitlimit** der Datenbank-Rolle `authenticated`, weil die
> Zuordnungs-Rechnung seit v2-28/v2-29 rund **2 Sekunden je neuer Zahlung** kostet.
> **Ab fünf neuen Zahlungen ist der Import tot.**
>
> **Status:** Ursache belegt, Entscheidung getroffen (Option B), Umsetzung offen →
> Sprint **v2-30**.

---

## 1 · Was der Nutzer sieht

Beide Dateien vom 27.08.2026 werden im Import-Feld abgewiesen. Die App zeigt den
allgemeinen Fehlerzustand des Portals. Eine ältere Datei ließ sich am selben Tag
ohne Probleme importieren — was den Verdacht zunächst auf die neuen Dateien lenkte.

**Genau dieser Verdacht war falsch**, und er hätte den Sprint in die Irre geführt.

---

## 2 · Was ausgeschlossen wurde — und wie

Die Reihenfolge folgt §7 Regel 10: erst verifizieren, dann patchen. Jeder Punkt ist
**gemessen**, nicht erschlossen (LL-22).

| Verdacht | Prüfung | Ergebnis |
|---|---|---|
| Dateien defekt / falsches Encoding | Byte-Analyse aller vier Dateien (alt + neu) | **sauber** — UTF-8 strikt gültig, 0 Null-Bytes, 0 Steuerzeichen, keine Ersatzzeichen |
| Doppeltes Minus im Visa-Saldo (`--137,5 EUR`) | Position im Dateikopf geprüft | **irrelevant** — die Zeile steht **vor** dem Header und wird nie geparst |
| Dateiname (fehlendes `DKB_`, fehlendes Jahres-Suffix) | Router liest ausschließlich den Inhalt | **irrelevant** |
| Parser kippt | **echte** Quelldateien aus `src/lib` transpiliert und ausgeführt | **läuft** — Giro 47 Zeilen (`DKB`), Visa 30 Zeilen (`DKB_VISA`) |
| `process_csv_import` defekt | Trockenlauf mit Rollback (LL-18), echter Payload | **läuft** — Giro 11 neu/36 Duplikate, Visa 17 neu/13 Duplikate |
| Fehlende RLS-Policy (Stolperfalle 15) | alle 12 Tabellen gegen `pg_policy` | **sauber** — RLS an, je 1 Policy |
| Fehlende `EXECUTE`-Rechte | `has_function_privilege('authenticated', …)` für 12 Funktionen | **sauber** — alle erlaubt |
| Ausdrucks-Index defekt (Stolperfalle 29) | `af_merchant_key` ist `IMMUTABLE`, schema-qualifiziert; `pg_stat_user_indexes` | **greift** — `idx_fragments_merchant_key` mit **88.107** Scans |

**Der Parser war der wichtigste Ausschluss.** Hätte man ihn nachgebaut statt
ausgeführt, wäre die Diagnose beim doppelten Minus stehengeblieben — einem Detail,
das echt aussieht und nichts tut.

---

## 3 · Die Ursache

### 3.1 Das Limit

```sql
select rolname, rolconfig from pg_roles
 where rolname in ('authenticated','anon','service_role','postgres');
```

| Rolle | `statement_timeout` |
|---|---|
| `anon` | 3 s |
| **`authenticated`** | **8 s** ← unter dieser Rolle arbeitet die App |
| `authenticator` | 8 s |
| `postgres` / `service_role` | **kein Limit** ← unter dieser Rolle läuft jeder MCP-Trockenlauf |

**Diese Zeile ist der Grund, warum der Fehler im Trockenlauf unsichtbar bleibt.**
Wer über MCP prüft, misst ohne Uhr.

### 3.2 Der Beleg aus den Edge-Logs (27.08.2026)

Sechs Aufrufe von `/rest/v1/rpc/process_csv_import`:

| Uhrzeit (lokal) | Dauer | Status |
|---|---|---|
| 14:31:24 | 8.704 ms | **500** |
| 14:31:45 | 8.618 ms | **500** |
| 14:32:04 | 767 ms | 200 |
| 14:32:38 | 8.233 ms | **500** |
| 14:33:20 | 629 ms | 200 |
| 14:34:41 | 9.249 ms | **500** |

Jeder Fehlschlag liegt am 8-Sekunden-Limit. Jeder Erfolg liegt unter einer Sekunde.
**Es gibt keinen Zwischenbereich** — das ist die Signatur eines Timeouts, nicht die
eines Datenfehlers.

### 3.3 Die Kosten, A/B gemessen

Identischer 5-Zeilen-Payload, zwei getrennte Trockenläufe:

| Rolle | Dauer | neue Zeilen | je Zahlung |
|---|---|---|---|
| Dienst-Rolle (ohne RLS) | **545 ms** | 5 | 109 ms |
| **`authenticated`** (mit RLS) | **9.973 ms** | 5 | **1.995 ms** |

Faktor **18**. Gegenprobe mit 10 Zeilen: **17.701 ms**.

**Daraus folgt die Grenze:** 8.000 ms ÷ ~2.000 ms = **vier** neue Zahlungen pro
Import. Die fünfte kippt ihn.

| Datei | neue Zahlungen | erwartete Dauer | Ergebnis |
|---|---|---|---|
| Giro 27.08. | 11 | ~22 s | ❌ |
| Visa 27.08. | 17 | ~34 s | ❌ |

### 3.4 Wo die Zeit verbrennt

Je **eine** Zahlung gegen **28 aktive Karten**, dreimal warm gemessen:

| | Dienst-Rolle | `authenticated` | Faktor |
|---|---|---|---|
| volle Konfidenz-Runde | 148 ms | 287 ms | 1,9 |
| davon **`history_match`** (v2-29) | **7 / 7 ms** | **278 / 274 / 264 ms** | **≈ 38** |
| `merchant_rule_match` (v2-28) | — | 6 ms | — |

**`history_match` trägt 93 % der Kosten** und ist der einzige Teil, der unter den
Zugriffsregeln dramatisch teurer wird. Die Rechnung selbst ist nicht langsam — sie
wird es erst unter RLS.

---

## 4 · Warum die alte Datei durchging

`process_csv_import` überspringt die Konfidenz-Rechnung in **zwei** Fällen:

```sql
IF v_was_inserted AND NOT v_is_internal THEN   -- nur dann wird gerechnet
```

- **Duplikate** (`v_was_inserted = false`) — eine alte Datei besteht aus nichts
  anderem und ist deshalb in Millisekunden fertig.
- **interne Überträge** (`v_is_internal = true`).

Der einzige erfolgreiche Import des Tages (14:32:04, 767 ms) hat **genau eine**
Zahlung angelegt — einen internen Übertrag (`Cortal Consors Sparen 08/26`). Auch er
hat also nie gerechnet.

**Damit ist das Symptom vollständig erklärt:** Es scheitert nicht, was neu ist,
sondern was **neu und zuzuordnen** ist.

---

## 5 · Warum kein Wächter angeschlagen hat

Anker 1, Anker 2, alle Prüfsummen und beide Invarianten sind grün. **Jede Zahl ist
richtig — sie kommt nur nicht mehr an.** Das ist exakt die Fehlerklasse aus **LL-28
und LL-29**, und sie ist hier zum zweiten Mal aufgetreten.

**Der Zusatz, der über v2-24 hinausgeht:** v2-29 hat die Kosten des neuen Index
sorgfältig gemessen und mit **0,208 ms je Aufruf** dokumentiert. Diese Messung ist
nicht falsch — sie wurde nur unter einer Rolle gemacht, **die es in der laufenden
App nicht gibt**. Unter `authenticated` kostet derselbe Aufruf das Vierzigfache.

> **Kandidat für eine neue Lehre (LL-42):**
> *Eine Performance-Messung gilt nur unter der Rolle, unter der die App arbeitet.*
> Ein Trockenlauf über MCP läuft als `service_role`/`postgres` — **ohne RLS und ohne
> Zeitlimit**. Er beweist Richtigkeit, nicht Bezahlbarkeit. Wer Tempo misst, setzt
> `SET LOCAL ROLE authenticated`, sonst misst er eine Umgebung, die kein Nutzer je
> sieht.
>
> Das ist **nicht** LL-29: Dort war der Weg zu oft gegangen (Netzrunden zählen).
> Hier ist die Zahl der Wege richtig — nur unter der falschen Rolle gestoppt.

---

## 6 · Widerlegt: der naheliegende Policy-Fix

Alle drei Policies lauten `(auth.uid() = user_id)` — ohne die in Supabase empfohlene
Klammerung `((select auth.uid()) = user_id)`, die die Anmelde-Prüfung einmal statt je
Zeile auswertet. Das ist der Standard-Verdacht für genau diesen Faktor.

**Er trägt hier nicht.** Im Trockenlauf mit anschließendem Rollback umgestellt und
gemessen:

| | `history_match`, 1 Zahlung × 28 Karten |
|---|---|
| heutige Policy | **274 ms** |
| `(select auth.uid())` | **289 ms** |

Kein Effekt. **Die Ursache des Faktors 38 ist damit weiterhin offen** und ist der
erste Arbeitsschritt von v2-30 — nicht seine Voraussetzung.

Dieser Absatz steht hier, damit die nächste Sitzung ihn nicht ein zweites Mal prüft.

---

## 7 · Die drei Optionen

| | Option | Wirkung | Kosten / Risiko |
|---|---|---|---|
| **A** | Import und Zuordnung trennen (`refresh_fragment_suggestions` aus v2-21 übernimmt) | Import wird unabhängig von der Datenmenge | mittel; die Auto-Verknüpfung ab 0,95 muss mitwandern |
| **B** | **Zuordnungs-Rechnung reparieren** | behebt die Ursache, wirkt auf **alle** Aufrufer | hoch; Eingriff in Rechenfunktionen, volle `db-eingriff`-Strecke |
| **C** | `statement_timeout` anheben | sofort wirksam | Symptom; Dauerlast auf der Free-Instanz — genau der Weg in den Ausfall von v2-24 (LL-29) |

### Entscheidung des Nutzers (27.08.2026): **Option B**

Vorgabe wörtlich: *„der fachlich sauberste Weg, der am robustesten für die Zukunft
ist, unabhängig von den Kosten."* Damit entfällt das Argument, das zunächst für A
sprach.

**Tragende Gründe:**

1. **B beseitigt den Defekt, A umgeht ihn.** Bei A bliebe dieselbe Langsamkeit im
   zweiten Schritt stehen — nur an einer Stelle, wo sie weniger auffällt.
2. **Der Hebel ist gemessen:** Faktor ~38 auf 93 % der Kosten.
3. **B wirkt überall** — auch auf das Nachrechnen der Vorschläge, das laut
   v2-29-Migration schon heute in Minuten rechnet.
4. **B ist verifizierbar.** Der Umbau darf ausschließlich die Geschwindigkeit
   ändern. Die vollständige Konfidenz-Matrix vorher/nachher muss **identisch** sein.

### Was B allein NICHT leistet

**B verschiebt die Grenze, es hebt sie nicht auf.** Von heute ~4 auf grob 150
Zahlungen je Import.

Für einen Monatsabzug (11 bzw. 17) ist das reichlich. Für einen **Jahresimport**
nicht — der von 2025 brachte **544** Zahlungen. Wer die Jahres-Fähigkeit will,
braucht die Stückelung aus A **zusätzlich**.

**Reihenfolge ist nicht beliebig: erst B, dann A.** Wer zuerst stückelt, legt die
Paketgröße auf einem Defekt fest und muss sie danach erneut anfassen.

---

## 8 · Was für v2-30 feststeht

- **Prüfanker zusätzlich zu §9:** die vollständige Konfidenz-Matrix (alle offenen
  Zahlungen × alle aktiven Karten) vor dem Eingriff einfrieren, danach auf
  Gleichheit prüfen. Bewegt sich ein Wert, ist es kein Tempo-Umbau mehr →
  zurückrollen, nicht erklären.
- **Anker 1 und 2 gelten unverändert.** `process_csv_import` verknüpft ab 0,95
  automatisch; jede Verknüpfung bewegt die Sparrate. Der Eingriff ist deshalb
  anker-relevant, obwohl er keine Sparraten-Funktion berührt.
- **Jede Tempo-Messung unter `SET LOCAL ROLE authenticated`.** Ohne diese Zeile misst
  der Sprint dieselbe Umgebung, die den Fehler entstehen ließ.
- **Abnahmekriterium:** Beide Dateien vom 27.08.2026 importieren in der App
  fehlerfrei — das ist der Beleg, kein Testlauf über MCP.

---

## 9 · Datenlage zum Befundzeitpunkt

| | |
|---|---|
| Fragmente gesamt | 1.600 (635 davon 2026) |
| aktive Karten im August 2026 | 28 |
| August-Fragmente in der DB | 52 (Importe am 15.08., 18.08. und 1× am 27.08.) |
| Giro 27.08. | 47 Zeilen → 11 neu, 36 Duplikate |
| Visa 27.08. | 30 Zeilen → 17 neu, 13 Duplikate |

**Kein Datenverlust.** Sämtliche Prüfläufe liefen als Trockenlauf mit
`RAISE EXCEPTION`-Rollback (LL-18) und haben keine Zeile hinterlassen. Das einzige am
27.08. angelegte Fragment stammt aus dem erfolgreichen Cortal-Import des Nutzers um
14:32.
