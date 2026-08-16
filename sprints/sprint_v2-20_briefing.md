# Sprint v2-20 — Briefing

> **Thema:** `KU-1` / `KU-2` — der Papierkorb zählt nicht mehr mit, und Löschen führt
> nicht mehr ins Leere.
> **Stand:** Phase ① abgeschlossen, beide Entscheidungen am 15.08.2026 vom User
> getroffen. Plan freigegeben. **Branch:** `sprint/v2-20-papierkorb-loeschen`.
>
> **Warum diese Datei existiert:** Die Datenbank wird berührt (zwei Migrationen, fünf
> Funktionen) — eines der vier Kriterien aus `sprint-start`.
>
> **Herkunft:** `V2/befunde_2026-08-15_kuratierung-august.md`, Befunde B1 und B3.
> B2 hat der User selbst gelöst, indem er den Plan der Karte auf den Ist-Wert anpasste.

---

## 1 · Ziel

Löschst du eine Karte, verschwindet sie **sofort** aus jeder Zahl — und eine Karte, die
du diesen Monat angelegt hast, lässt sich auch wieder loswerden.

## 2 · Nicht-Ziel

- **Verknüpfte Zahlungen blockieren weiterhin** (`HAS_LINKS`). Erst lösen, dann löschen.
- **Die Vergangenheit bleibt geschützt** (`HAS_PAST_PLAN` unverändert).
- **Die Aufbewahrungszeit von 60 s bleibt.** Sie ist Absicht — die Rücknahme läuft über
  den 5-Sekunden-Hinweis, nicht über einen Langzeit-Papierkorb (`app_config`,
  Beschluss E3b).
- **Kein neues Verb** im Lebenszyklus. „Zustände zurücksetzen" wurde verworfen und
  gehört in die Gestaltungsrunde `M2`.
- `cleanup_expired_card_trash` und der opportunistische Aufräum-Vorgang bleiben
  unverändert.
- `B2-R` (der Cent in der Treiber-Summe) bleibt liegen.

## 3 · Die beiden Entscheidungen

| | Entscheidung | verworfen |
|---|---|---|
| **A** | Papierkorb-Karten zählen **gar nicht mehr** mit — Filter in den Rechenfunktionen, sofort wirksam | „Beim Laden aufräumen" (Fenster bliebe, Schreibzugriff im Lesepfad) · „beides" (überflüssig) |
| **B** | Das Lösch-Tor schützt **nur noch die Vergangenheit** — Monats-Zustände blockieren nur, wenn sie in einem vergangenen Monat liegen | „nur den Hinweis ehrlich machen" (Sackgasse bliebe, nur korrekt beschriftet) · „Zustände zurücksetzbar machen" (neues Verb → `M2`) |

## 4 · Der Fund, der Entscheidung A trägt

Die Snapshot-Integrität §2.1 verbietet einen `deleted_at`-Filter in den
Sparraten-Funktionen. **Der Grund dafür kann hier nicht eintreten:**
`HAS_PAST_PLAN` im Lösch-Tor lässt Karten mit Vergangenheit gar nicht erst löschen —
eine Papierkorb-Karte beginnt frühestens im laufenden Monat. **Historische Sparraten
können durch den Filter nicht kippen.**

Die bisherige Begründung im Code ist zudem falsch:

> *„Papierkorb-Karten haben per Lösch-Gate weder Links noch States noch
> Vergangenheits-Plan → `delta = 0` → fallen ohnehin aus dem Ranking."*

Das gilt für die **Treiber** (`delta = ist − plan = 0`) und **nicht** für die
**Sparrate** (Beitrag = Plan ≠ 0). Ein Schluss von einer Differenz auf einen
Absolutwert — dieselbe Fehlerklasse wie LL-23.

## 5 · Prüfanker

**Regel (LL-19):** Eine Karte im Papierkorb trägt in **keinem** Monat zur Sparrate bei —
weder Ist noch Plan, weder Ordner-Spalte noch Treiber.

**Gemessen 15.08.2026, unmittelbar vor dem Bauen:**

| Monat 2026 | Ist | Plan | Monat | Ist | Plan |
|---|---|---|---|---|---|
| Januar | 1.899,67 | 1.899,67 | Juli | −8,84 | 23,93 |
| Feb–Mär | 1.931,18 | 1.931,18 | **August** | **1.076,24** | **1.151,23** |
| April | 1.899,67 | 1.899,67 | September | 1.824,08 | 1.824,08 |
| Mai | −86,77 | −86,77 | Oktober | 1.792,57 | 1.792,57 |
| Juni | 4.208,76 | 4.220,53 | Nov–Dez | 1.824,08 | 1.824,08 |

Anker 1 (Ordner-Spalte == Ist) hält in **12/12**.

**Erwartete Bewegung — nur August, beide Seiten gleich:**

| | vorher | nachher |
|---|---|---|
| Ist August | 1.076,24 € | **721,24 €** |
| Plan August | 1.151,23 € | **796,23 €** |
| Differenz Ist − Plan | −74,99 € | **−74,99 € unverändert** |
| Ordner „Urlaub" | −559,85 € | **−914,85 €** |
| übrige elf Monate | — | **0,00 € Bewegung** |

> Die Papierkorb-Karte `Dominik Hecker | Bergtour` (INCOME, 355,00 €) existiert zum
> Zeitpunkt der Messung noch — der Anker ist also **auf Produktion messbar**. Räumt der
> User zwischenzeitlich auf (ein Kontextmenü-Klick genügt), bewegt der Filter nichts
> mehr; **dann ist der Nachweis aus der Übungs-Datenbank zu führen**, wie in v2-13
> (`BF-4`).
>
> Weil die Karte eine **Einnahme** ist, senkt ihr Wegfall die Sparrate. Sie fällt aus
> **beiden** Seiten gleich weit heraus, deshalb bleibt die Differenz stehen und die
> B2-Invariante stabil.

**Das Lösch-Tor (P1) bewegt keine Zahl** — belegt über identische Prüfsummen der vier
Rechenfunktionen vor und nach der Migration.

## 6 · Phasen

| | Was | DB |
|---|---|---|
| **P0** | Slot tauschen, Anker beidseitig messen | — |
| **P1** | `card_delete_gate`: `HAS_STATES` nur bei vergangenen Monaten | **ja** |
| **P2** | Vier Rechenfunktionen filtern `deleted_at IS NULL` — **eine** Migration | **ja** |
| **P3** | Hinweis im Kontextmenü wird ehrlich | nein |
| **P4** | Prüfstrecke, Roadmap, Doku, PR, Rücktausch | nein |

**Warum P2 vier Funktionen in einer Migration umfasst:** Filtert nur die Ist-Funktion,
driften Ist und Plan auseinander. Filtert die Ordner-Funktion nicht mit, bricht Anker 1.
Filtern die Treiber nicht mit, bricht Anker 2 — sie erklärten dann eine Karte, die nicht
mehr zählt. Ein Zwischenzustand auf Produktion ist damit ausgeschlossen.

## 7 · Prüfschritte

| | Schritt | Erwartung |
|---|---|---|
| S1 | Karte anlegen (einmalig, laufender Monat), Betrag anpassen, löschen | **geht** — vorher blockierte `HAS_STATES` |
| S2 | Ring und Ordner-Kachel sofort danach | Betrag **sofort** weg, Posten-Zahl == sichtbare Karten |
| S3 | „Rückgängig" im 5-Sekunden-Hinweis | Karte und Betrag zurück |
| S4 | Karte mit verknüpfter Zahlung löschen wollen | **blockiert**, Hinweis nennt die Zahlung |
| S5 | Karte mit Zustand aus einem **vergangenen** Monat | **blockiert**, unverändert |
| S6 | Wiederkehrende Karte, nicht löschbar | Hinweis nennt „Karte beenden…" **und der Menüpunkt ist da** |
| S7 | Jahres-Welle, Monat mit Papierkorb-Karte | **keine** Treiber-Zeile für sie |
| S8 | August 2026 | Ordner „Urlaub" **−914,85 €**, Sparrate **721,24 €** |

**Kartentyp (LL-12):** Lösch-Tor und Papierkorb kennen **keinen** Typ-Unterschied — alle
drei Typen sind betroffen. Die Testkarte für S1 ist `FIXED_COST` (einmalig); die reale
Karte in S8 ist `INCOME`, weshalb ihr Wegfall die Sparrate **senkt**.

**Testdaten (LL-15):** S1 braucht eine Karte **ohne** verknüpfte Zahlung, sonst
blockiert `HAS_LINKS` und der Schritt prüft etwas anderes. S5 braucht einen
Monats-Zustand aus einem vergangenen Monat — **den gibt es in den Testdaten nicht**, er
wird auf der Übungs-Datenbank hergestellt.

## 8 · Offene Frage — der Wortlaut

Nicht erfunden, sondern vorgelegt (§7 Regel 3). Vorschlag je Grund:

| Grund | Vorschlag |
|---|---|
| verknüpfte Zahlung | **„Erst die zugeordnete Zahlung lösen."** |
| Vergangenheit, wiederkehrend | **„Sie trägt vergangene Monate. Stattdessen »Karte beenden…«."** |
| Vergangenheit, einmalig | **„Sie trägt vergangene Monate und bleibt als Beleg erhalten."** |

Der Verweis auf „Karte beenden…" erscheint **nur**, wenn es den Menüpunkt gibt
(`canEnd = frequency !== 'ONCE'`).

## 9 · Roadmap

Beide Themen kommen als **Paket 16 · Befunde aus der August-Kuratierung** hinein,
Kennungen `KU-1` (Papierkorb) und `KU-2` (Lösch-Tor) — **vor** dem Bauen.
