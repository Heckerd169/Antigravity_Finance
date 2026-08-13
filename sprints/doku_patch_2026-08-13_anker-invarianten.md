# Doku-Patch 13.08.2026 — der Anker wird invariantenbasiert

> **Kein Sprint.** Ein Nachzug nach §3 („Wohin gehört etwas Neues?"), ausgelöst durch
> zwei Beobachtungen aus der laufenden Nutzung und eine Frage des Users.
>
> **Freigabe:** ausdrücklich erteilt am 13.08.2026 („Freigabe erteilt"), auf einen
> Vorschlag hin, der Umfang und Begründung vorher benannt hat. §7 Regel 14.

---

## Der Anlass

Der Juli-Anker war am 13.08.2026 **zweimal innerhalb weniger Stunden überholt**:

| Uhrzeit | Juli-Ist | Ursache |
|---|---|---|
| Stand CLAUDE.md vor v2-18 | −322,75 € | Anker aus v2-11 |
| ~08:05 | −322,74 € | Drei Zahlungen den gemeinsamen Juli-Karten zugeordnet → `BF-4` greift erstmals in Produktion |
| ~12:58 | **+38,24 €** | **Sechs Budget-Karten auf „abgeschlossen" gesetzt** → statt des Plans zählt das tatsächlich Ausgegebene |

Die zweite Bewegung beträgt **+360,98 €**. Sie wurde exakt zugeordnet, indem die
Änderungen in einem zurückgerollten Trockenlauf einzeln rückgängig gemacht wurden
(LL-18):

```
Juli JETZT                          =   38.24
ohne die 6 Abschluesse              = -322.74
zusaetzlich ohne die 4 neuen Links  = -322.75
```

**In beiden Fällen hat die App exakt richtig gearbeitet.** Kein Eingriff, kein Sprint,
keine Codeänderung — allein die normale Benutzung. Und der User hat angekündigt, in den
nächsten Tagen **rückwirkend** weiter zuzuordnen.

Damit ist die Frage des Users berechtigt: *„Braucht es deshalb überhaupt noch einen
Anker in der CLAUDE.md?"*

## Die Antwort, die dem Patch zugrunde liegt

**Ja — aber keinen, der Werte einfriert.**

Der Anker soll merken, wenn **ein Eingriff** eine Zahl bewegt, die sich nicht bewegen
durfte. Er soll **nicht** die Zahlen des Nutzers kennen. Eine eingefrorene Tabelle
verwechselt beides: Sie schlägt bei jeder normalen Kuratierung an, und genau deshalb
wird sie nach dem dritten Fehlalarm nicht mehr gelesen. §9 sagt das seit dem
25.07.2026 selbst — der Satz stand nur neben einer Tabelle, die es trotzdem tat:

> *„Eine Anker-Tabelle mit falschen Sollwerten ist schlimmer als keine: Sie schlägt
> entweder falsch an oder wird gewohnheitsmäßig ignoriert."*

An ihre Stelle treten **zwei Invarianten**, die das Projekt bereits besitzt und die
vom Datenstand **unabhängig** sind, plus die Messregel, die ohnehin schon gilt und die
an beiden Tagen tatsächlich getragen hat.

---

# Patch-Stellen

## P1 · CLAUDE.md §9 — Anker-Block ersetzen

**Anker (Beginn):** die Zeile

```
**Zweiter Prüfanker seit v2-17 — die Ordner-Spalte.** Sie ergibt in **allen zwölf
```

**Anker (Ende):** die Zeile

```
> neue Zuordnung erklären lässt; **jede andere Zeile** der Tabelle ist es sehr wohl.
```

**Patch:** Der gesamte Block dazwischen — Einleitung, Prüfanker-Tabelle Produktion und
der große Begründungs-Kasten — wird durch die neue Fassung ersetzt. Sie enthält:

1. **Was der Anker leisten soll** (und was nicht) — der Satz, der bisher fehlte.
2. **Anker 1 — die Ordner-Spalte ergibt die Sparrate.** Unverändert übernommen,
   inklusive SQL, aber neu eingeordnet: als *stehender* Anker, nicht als „zweiter".
3. **Anker 2 — `Σ delta = Ist − Plan`** (B2). War bisher nur in §6 Stolperfalle 9 und
   in Regel 23 erwähnt, nie in §9 als Anker geführt.
4. **Die Messregel** — vor und nach jedem Eingriff alle zwölf Monate, Ist **und** Plan,
   **in derselben Sitzung**. Verglichen wird gegen den eigenen Vorher-Wert, nicht gegen
   eine Tabelle von letzter Woche.
5. **Warum die Werte-Tabelle raus ist** — mit der Chronologie des 13.08.2026.
6. **Momentaufnahme 13.08.2026** — dieselben Zahlen wie bisher, aber ausdrücklich als
   *Orientierung, kein Sollwert* gekennzeichnet und mit dem Hinweis, wann sie wieder
   zum Sollwert werden darf.
7. Die Historie zu `BF-5`, `BF-4` und v2-17 bleibt erhalten, **komprimiert** — sie
   trägt Wissen, das nicht an der Tabelle hängt.

**Was ausdrücklich NICHT gestrichen wird:** der Anker der Übungs-Datenbank
(2.200,00 €). Dort kuratiert niemand; er bleibt ein echter Sollwert.

## P2 · CLAUDE.md §9 — Momentaufnahme auf den Stand nach der Rundfunk-Karte

Die Werte des 13.08.2026 nach Anlage der Karte `Rundfunkbeitrag` (siehe unten):
Januar **1.899,67** · Februar–März **1.931,18** · April **1.899,67** · Mai **−86,77** ·
Juni **4.208,76** · Juli **6,73** · August **1.761,08** · September **1.824,08** ·
Oktober **1.792,57** · November–Dezember **1.824,08** · 2025 durchgehend **4.037,11**,
Goldlinie **48.445,32**.

---

# Anhang · Schreibzugriff auf Produktion vom 13.08.2026

CLAUDE.md §7 verbietet **undokumentierte** SQL-Schreibzugriffe auf Produktion. Dieser
Abschnitt ist die Dokumentation.

**Was:** Anlage der Karte `Rundfunkbeitrag` über die atomare RPC `create_card_direct`
(§6 Stolperfalle 5), anschließend `set_card_category` und `due_day = 1`.

**Warum:** Ausdrücklicher Auftrag des Users („Ab Januar 2026"), nach einer von ihm
verlangten Gegenprüfung der hinterlegten Zahlungen.

| Feld | Wert | Beleg |
|---|---|---|
| Ordner | **Wohnen** | `Wohnen` enthält exakt die drei **gemeinsamen** Positionen (Miete, Strom, Internet, alle fällig am 1.); `Abos & Mitgliedschaften` ausschließlich `ICH`-Karten |
| Typ / Zuordnung | `FIXED_COST` / **`GEMEINSAM`** | **gemessen, nicht vermutet:** 31,51 € = 55,08 € × 0,57209… = voller Quartalsbeitrag × Split-Faktor |
| Frequenz | `QUARTERLY`, ab **2026-01-01** | `is_card_active_in_month` zählt `months_diff % 3` **ab dem Startmonat** — ein August-Start hätte Aug/Nov/Feb getroffen |
| Plan | **55,08 €**, nicht 31,51 € | Der Split-Anteil wird in `calculate_card_amount_for_month` angewandt (§6 Stolperfalle 11 / LL-23). Der Anteil im Plan wäre eine **zweite** Kürzung → 18,02 € |
| Fällig am | 1. | Buchungen liegen auf dem 1.; im Januar auf dem 2. (Feiertag) |

**Gegenprüfung der Zahlungen** (vom User verlangt): 02.01.2026 **31,16 €** ·
01.04.2026 **31,51 €** · 01.07.2026 **31,51 €**. Fünf von sieben Buchungen seit 2025
treffen den erwarteten Anteil auf den Cent; der Januar 2026 hinkt dem zum Jahreswechsel
geänderten Split-Faktor **ein Quartal hinterher** (Dauerauftrag erst zum April
angepasst).

**Wirkung, im Trockenlauf vorab gemessen und danach real bestätigt — beide Läufe
identisch:**

| 2026 | vorher | nachher |
|---|---|---|
| Januar | 1.931,18 € | **1.899,67 €** |
| April | 1.931,18 € | **1.899,67 €** |
| Juli | 38,24 € | **6,73 €** |
| Oktober | 1.824,08 € | **1.792,57 €** |
| übrige acht Monate | — | **unverändert** |

**Aktiv ausschließlich in 01, 04, 07, 10** — im Trockenlauf einzeln über alle zwölf
Monate geprüft.

**Beide Anker nach dem Eingriff geprüft:** Ordner-Spalte == Sparrate in **allen zwölf**
Monaten, Abweichung 0,00 €. **2025 unberührt** — Goldlinie unverändert 48.445,32 €, die
Karte ist dort inaktiv.

**Keine Migrationsdatei.** Es ist kein Schema- und kein Funktions-Eingriff, sondern
Dateneingabe über die reguläre RPC — dasselbe, was ein Klick auf „neue Karte" tut.
