# Doku-Patches v2-30 — Schema-Doku

> **Verfahren nach LL-16 / §7 Regel 14:** Anker + Patch-Satz je Stelle, danach
> anwenden. Die Bibel wird nie direkt editiert.
>
> **Ziel:** `antigravity_finance_schema_summary.md`, **v3.14.0 → v3.15.0**
>
> **Vier Stellen.** Stelle 3 ist keine Ergänzung, sondern eine **Korrektur** — die
> bisherige Fassung enthält eine Aussage, die dieser Sprint widerlegt hat.

---

## Stelle 1 · Versions-Nummer im Header

**Anker (Zeile 3):**

```
**Version:** 3.14.0
```

**Patch:**

```
**Version:** 3.15.0
```

---

## Stelle 2 · Neuer Changelog-Block, direkt vor dem v3.14.0-Block

**Anker (erste Zeile des bestehenden Blocks):**

```
> **Changelog v3.14.0 (25.08.2026, Sprint v2-29):**
```

**Patch — davor einfügen:**

```
> **Changelog v3.15.0 (27.08.2026, Sprint v2-30):** Eine neue Spalte, ein neuer Index,
> eine geänderte Funktion. **§1 — `fragments`: +1 Spalte** `merchant_key text
> GENERATED ALWAYS AS (public.af_merchant_key(description)) STORED`, dazu der
> gewöhnliche B-Tree-Index `idx_fragments_merchant_key_stored` auf
> `(user_id, merchant_key)`. **§4 — `history_match`** liest Stufe 1 aus der Spalte
> statt aus dem Ausdruck.
>
> **Der Anlass ist ein Fund, der die v3.14.0-Zeile zu `af_merchant_key` teilweise
> widerlegt (siehe dort):** Ein **Ausdrucks-Index über eine SQL-Funktion ist gegen
> Inlining nicht robust. Der Planer bettet `af_merchant_key` ein; danach steht im Plan
> ihr Rumpf statt des Aufrufs, und ein Index über den Aufruf trifft ihn nicht mehr.
> `idx_fragments_merchant_key` griff in `history_match` deshalb **nie** — `Seq Scan`
> über alle 1.628 Fragmente, und weil `history_match` je Karte aufgerufen wird,
> **28-mal je Zahlung**.
>
> **Die Statistik verriet es nicht:** `pg_stat_user_indexes` wies **88.107 Scans** aus.
> Der Index greift anderswo sehr wohl — und niemand liest den Plan, solange die
> Statistik beruhigt. Wer einen Ausdrucks-Index anlegt, prüft deshalb den **Plan seines
> Hauptaufrufers**, nicht die Scan-Zahl.
>
> **Wirkung:** Import von 17 neuen Zahlungen **23.938 ms → 1.357 ms** (Faktor 17,6),
> `history_match` über 28 Karten **326 ms → 12 ms** (Faktor 27). Das
> `statement_timeout` der Rolle `authenticated` liegt bei **8 s** — der Import lief also
> vorher strukturell in einen Fehler, sobald mehr als vier Zahlungen neu waren.
>
> **Kein Nachbau (§6 Stolperfalle 16):** Die Spalte **ruft** `af_merchant_key` auf,
> statt deren Logik zu wiederholen. Es gibt weiterhin genau **eine** Definition des
> Schlüssels; ändert sie sich, rechnet Postgres die Spalte selbst neu.
>
> **Zwei naheliegende Fixes wurden gemessen und verworfen** und stehen in der Migration
> dokumentiert: die Policy-Umstellung auf `(select auth.uid())` (274 → 289 ms,
> wirkungslos) und `af_merchant_key` auf `LANGUAGE plpgsql` (285 → 367 ms, schlechter —
> der Planer wählt dann einen Seq Scan über `card_fragment_links`).
>
> **Kein Zahlenwert bewegt:** Sparrate 24/24 identisch, Anker 1 und 2 je 0 Verletzungen,
> Spalten-Äquivalenz über alle 1.628 Zeilen ohne Abweichung, `history_match` alt gegen
> neu über 231 Paare ohne Unterschied, 16 von 17 Prüfsummen unverändert.
>
> **Der alte Ausdrucks-Index bleibt vorerst bestehen** (`PF-7`) — welcher Aufrufer seine
> 88.107 Scans verursacht, ist nicht ermittelt.
```

---

## Stelle 3 · KORREKTUR der `af_merchant_key`-Zeile in §4

**Anker (Teil der bestehenden Zeile, eindeutig):**

```
`IMMUTABLE` — das ist Voraussetzung für den Ausdrucks-Index `idx_fragments_merchant_key` auf `(user_id, af_merchant_key(description))`. **Ohne diesen Index kostet ein Aufruf von `history_match` 14,9 ms statt 0,2 ms** (Seq Scan mit `regexp_replace` je Zeile); bei ~14.000 Aufrufen je `refresh_fragment_suggestions`-Lauf ist das der Unterschied zwischen 23 Sekunden und über drei Minuten.
```

**Patch:**

```
`IMMUTABLE` — Voraussetzung sowohl für den Ausdrucks-Index als auch für die seit v2-30 bestehende **generierte Spalte** `fragments.merchant_key`. ⚠️ **Die hier bis v3.14.0 stehende Aussage „ohne diesen Index kostet ein Aufruf 14,9 ms statt 0,2 ms" war irreführend:** Die Messung stimmte, die Schlussfolgerung nicht. Der Ausdrucks-Index `idx_fragments_merchant_key` **griff in `history_match` nie** — der Planer bettet diese SQL-Funktion ein (Inlining), danach steht im Plan ihr Rumpf statt des Aufrufs, und ein Index über den Aufruf trifft ihn nicht mehr (`Seq Scan`, `Rows Removed by Filter: 1628`). Die 0,2 ms wurden unter einer Formulierung gemessen, die es im Funktionsrumpf so nicht gab. **Seit v2-30 trägt Stufe 1 die materialisierte Spalte** `merchant_key` mit dem gewöhnlichen B-Tree-Index `idx_fragments_merchant_key_stored`; ein Spalten-Index ist gegen Inlining immun, weil nichts mehr zu expandieren ist. Gemessen: 326 ms → 12 ms je Zahlung über 28 Karten.
```

---

## Stelle 4 · `history_match`, Stufe 1 liest die Spalte

**Anker:**

```
**Stufe 1 — der Händler:** Liegen andere handverlinkte Zahlungen mit demselben `af_merchant_key` auf **genau einer** Karte,
```

**Patch:**

```
**Stufe 1 — der Händler (seit v2-30 über die Spalte `fragments.merchant_key`, nicht mehr über den Ausdruck):** Liegen andere handverlinkte Zahlungen mit demselben Händler-Schlüssel auf **genau einer** Karte,
```

---

## Nicht gepatcht — und warum

**Die Design-Doku bleibt unberührt.** Der Sprint hat nichts Sichtbares geändert: kein
Token, keine Komponente, kein Wortlaut, keine Geste. Aus demselben Grund werden auch
die Seiten unter `design-system/` **nicht** nachgezogen (`sprint-abschluss` Schritt 6).

**CLAUDE.md** wird separat behandelt — Schritt 6b, Fähigkeit `claude-md-pflege`, mit
ausdrücklicher Freigabe des Users. Vorgeschlagen sind dort **LL-42** und eine neue
Stolperfalle; beides steht im Review §7.

---
---

# Doku-Patches v2-30 — CLAUDE.md

> **Zusätzlich zur Patch-Datei braucht CLAUDE.md die ausdrückliche Freigabe des
> Users** (§7 Regel 14, Fähigkeit `claude-md-pflege`).
>
> **Umfang heute:** 1.427 Zeilen (Grenze 1.600), Wächter 4/4 grün.
> **Erwartet nach dem Patch:** rund +22 Zeilen → ~1.449. Der **Regelanteil steigt**,
> weil §6 und §8 wachsen und die Erzählzone nur getauscht wird.
>
> **Drei Stellen. Keine neue Stolperfalle, keine neue Regel** — die passende
> Stolperfalle **29** existiert bereits und wird erweitert **und korrigiert**. Das
> folgt der Fähigkeit: gleiche Suchrichtung gehört zusammengelegt, nicht
> nebeneinandergestellt.

---

## Stelle A · §6 Stolperfalle 29 — Punkt ② korrigieren, ③ ergänzen

**Warum Korrektur und nicht nur Ergänzung:** Punkt ② behauptet, der Index habe die
Kosten von 14,9 ms auf 0,208 ms gedrückt. **Die Messung stimmte, die Schlussfolgerung
nicht** — der Index griff in `history_match` nie, weil derselbe Inlining-Mechanismus,
der in ① das *Anlegen* betrifft, beim *Lesen* ein zweites Mal zuschlägt.

**Anker (eindeutig, `grep -c` = 1):**

```
    **② Ohne den Index kostet ein einziger Aufruf das 72-fache.** In v2-29 brauchte
```

**Patch — der Block ② wird ersetzt und ③ angehängt:**

```
    **② Ohne den Index kostet ein einziger Aufruf das 72-fache.** In v2-29 gemessen:
    **14,9 ms** statt **0,208 ms** — ein Seq Scan über 1.599 Fragmente, der für **jede**
    Zeile ein `regexp_replace` ausführt. Bei rund 14.000 Aufrufen je
    `refresh_fragment_suggestions`-Lauf ist das der Unterschied zwischen 23 Sekunden
    und über drei Minuten.
    **③ Und dann greift der Index beim LESEN trotzdem nicht.** Derselbe Mechanismus
    wie in ①, nur eine Ebene später: Der Planer **bettet die SQL-Funktion auch in der
    Abfrage ein**. Danach steht im Plan ihr **Rumpf**, im Index aber der **Aufruf** —
    und beide treffen sich nie. In v2-30 gemessen: `Seq Scan on fragments`,
    `Rows Removed by Filter: 1628`, und weil `history_match` je Karte aufgerufen wird,
    **28-mal je Zahlung**. **Damit ist die Zusage in ② für den Hauptaufrufer nie
    eingetreten** — die 0,208 ms galten für eine Formulierung, die es im Funktionsrumpf
    so nicht gab.
    **Und die Statistik verrät es nicht:** `pg_stat_user_indexes` wies **88.107 Scans**
    aus. Der Index greift anderswo sehr wohl, und niemand liest den Plan, solange die
    Statistik beruhigt — dieselbe Klasse wie die Regions-Zeile aus LL-30.
    **Abhilfe:** den Wert als **Spalte** materialisieren
    (`GENERATED ALWAYS AS (…) STORED`) und gewöhnlich indizieren; ein Spalten-Index ist
    gegen Inlining immun. Gemessen 326 ms → 12 ms (v2-30). **Wer einen Ausdrucks-Index
    anlegt, prüft den PLAN seines Hauptaufrufers, nicht die Scan-Zahl.** (v2-30, LL-42)
```

---

## Stelle B · §8 Register — LL-42

**Anker (letzte Registerzeile, `grep -c` = 1):**

```
| LL-41 |
```

**Patch — neue Zeile danach:**

```
| LL-42 | Eine Performance-Messung gilt nur unter der **Rolle**, unter der die App arbeitet — ein MCP-Trockenlauf läuft ohne RLS und **ohne Zeitlimit** und beweist Richtigkeit, nicht Bezahlbarkeit | §6 Stolperfalle 29 ③ · §9 | v2-30 (PF-6) |
```

**Zusätzlich als erläuternder Kasten unter der Tabelle** (das Register führt solche
Kästen bereits für LL-25/26/28/29):

```
> **Warum LL-42 neben LL-29 steht und nicht darin aufgeht.** LL-29 sagt: bei Trägheit
> **zählen, wie oft gefragt wird**, nicht wie lange eine Frage dauert. Das war hier
> richtig gezählt — 28 Aufrufe je Zahlung — und trotzdem die falsche Spur, denn der
> Fehler lag darin, dass **jeder einzelne** Aufruf teuer war, und das sah man nur unter
> der richtigen Rolle.
>
> **Der Beleg:** identischer Import-Payload, **545 ms** als Dienst-Rolle gegen
> **9.973 ms** als `authenticated` — Faktor 18. Und v2-29 hat den Händler-Index mit
> **0,208 ms je Aufruf** dokumentiert; korrekt gemessen, aber unter einer Rolle, die es
> in der laufenden App **nicht gibt**. Wer Tempo misst, setzt
> `SET LOCAL ROLE authenticated` — sonst misst er eine Umgebung, die kein Nutzer je
> sieht.
```

---

## Stelle C · §9 Sprint-Stand

**Anker (`grep -c` = 1):**

```
**Letzter Sprint:** **v2-29**
```

**Patch — der Satzanfang wird ersetzt, der bisherige v2-29-Text rückt eine Stufe
zurück:**

```
**Letzter Sprint:** **v2-30** (der Import passt wieder in die Zeit — `PF-6`,
27.08.2026, PR **#48** gemergt, Browser-Smoke **bestanden**). Ein Import von 17 neuen
Zahlungen fiel von **23.938 ms auf 1.357 ms**; das `statement_timeout` der Rolle
`authenticated` liegt bei **8 s**, der Import lief also strukturell in einen Fehler,
sobald mehr als vier Zahlungen neu waren. **Kein Zahlenwert bewegt** — Sparrate 24/24,
Anker 1 und 2 je 0 Verletzungen. Ursache war **kein N+1**, sondern ein
Ausdrucks-Index, der durch Inlining nie griff (§6 Stolperfalle 29 ③). Neu offen:
`PF-7`. **Davor:** **v2-29**
```

> **Bewusst NICHT in §9 aufgenommen:** die Zerlegung der Kosten, die beiden
> verworfenen Fixes, die Zahlen zu Spalte und Index. Das ist Sprint-Ergebnis und steht
> vollständig in `sprints/projekt_historie.md` und im Review. §9 trägt nur, was die
> **nächste** Sitzung als Lage braucht.
>
> **Die Momentaufnahme in §9 bleibt unverändert** — der Sprint hat keine Zahl bewegt,
> und das ist hier das erwartete Ergebnis, nicht ein fehlender Nachtrag.

---

## Nicht vorgeschlagen — und warum

**Anker 4 (Import-Dauer je neuer Zahlung)** steht im Review §6 als Vorschlag und ist
**bewusst nicht Teil dieses Patches.** Ein vierter Anker ist eine Entscheidung über
die Prüfstrategie des Projekts, keine Nachpflege eines Sprints — er gehört dem User
vorgelegt, nicht mitgeliefert.
