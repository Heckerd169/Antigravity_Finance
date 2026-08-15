# Doku-Patches — Sprint v2-22

> Verfahren nach LL-16 / §7 Regel 14: **Anker + Patch-Satz je Stelle**, nie eine
> direkte Bearbeitung der Bibeln.
>
> Betroffen: **Schema-Doku** (RPC-Katalog §4, Kopf, Changelog) und **CLAUDE.md §9**
> (Teil B, nach ausdrücklicher Freigabe).
> **Nicht betroffen: Design-Doku** — der Sprint ändert keine Formensprache und keinen
> Text. Das Jahres-Popup zeigt dieselben Zeilen, nur mit einer Summe, die aufgeht.

---

## Patch 1 · Schema-Doku §4 — `get_year_deviation_drivers`

**Anker** (Ende der Katalog-Zeile, eindeutig):

```
**Seit v2-20 filtert sie `deleted_at IS NULL`** — sonst bräche die B2-Invariante: Die Treiber erklärten eine Karte, die in keiner der beiden Sparraten mehr vorkommt | `jsonb` |
```

**Patch-Satz:** Der Anker bleibt, danach wird die v2-22-Änderung ergänzt — kein
Runden je Zeile mehr, Ziel aus den Rechenfunktionen geholt, Rest auf die
betragsgrößte Kartenzeile, plus die beiden widerlegten Vermutungen (Gehalt
unschuldig; die verursachenden Zeilen sind unsichtbar).

---

## Patch 2 · Schema-Doku — Kopf und Changelog

**Anker** (Zeile 3–5, eindeutig):

```
**Version:** 3.8.0
```

**Patch-Satz:** auf **3.9.0**, Status um „Sprint v2-22 Treiber-Rundung" ergänzt,
neuer Changelog-Block darunter.

---

## Nicht gepatcht — und warum das eine Entscheidung ist

| Stelle | Warum unverändert |
|---|---|
| **CLAUDE.md §6 / §7 / §8** | Die Lehre aus P1 steht bereits als **Stolperfalle 13 / LL-25** in der Verfassung, die aus P2 als **Stolperfalle 16 / LL-26**. Dieser Sprint ist die **Anwendung** beider Regeln, kein neuer Fall. Ein vierter Eintrag zum selben Thema würde die Datei verwässern, und §8 warnt selbst davor, verwandte Lehren zu doppeln |
| ~~**CLAUDE.md §9**~~ | **Überholt — der User hat die Freigabe noch am selben Abend erteilt.** Siehe Teil B, Patches 5 und 6 |
| Schema-Doku §3 (Sparrate-Wahrheitsquellen) | `get_year_deviation_drivers` ist eine Auswertungs-Funktion; sie schreibt nichts und wird von keiner Rechenfunktion aufgerufen. Die Sparrate ist in allen zwölf Monaten unverändert |
| Design-Doku §9 (Jahres-Welle + Popup) | Die Anzeige ist unverändert: dieselben Zeilen, dieselbe Sortierung, dieselben Beträge — bis auf einen Cent auf der größten Zeile in zwei Monaten |

---

# Teil B · CLAUDE.md — nach ausdrücklicher Freigabe (15.08.2026)

> §7 Regel 14 verlangt für diese Datei zusätzlich zur Patch-Form die Freigabe des
> Users. Sie ist nach Vorlage des Reviews erteilt worden.
>
> **Es sind drei Stellen, nicht eine.** Vorgelegt war der `B2-R`-Kasten. Beim
> Anwenden zeigte sich, dass der Absatz **direkt darüber** ebenfalls überholt ist (er
> nennt die Roadmap-Zahlen „nach v2-19", also drei Sprints alt) — und weiter unten
> stand noch die **falsche Ursachen-Diagnose zu Paket 5**, die in der Roadmap bereits
> in v2-21 korrigiert worden war. Alle drei stehen im selben Sinnzusammenhang; nur
> den Kasten zu korrigieren hätte einen §9 hinterlassen, der sich selbst widerspricht.

## Patch 5 · §9 — die Roadmap-Zahlen

**Anker** (eindeutig):

```
**13.08.2026, nach v2-19**: **10 offene Pakete · 30 Themen · 5 Hausaufgaben ·
35 offen gesamt · 45 erledigt**.
```

**Patch-Satz:** auf den Stand nach v2-22 — **10 offene Pakete · 32 Themen ·
4 Hausaufgaben · 36 offen gesamt · 49 erledigt**, Datum 15.08.2026.

## Patch 6 · §9 — der `B2-R`-Kasten

**Anker** (Beginn des Kastens, eindeutig):

```
> **Eine Hausaufgabe ist dazugekommen: `B2-R`.** Die Treiber-Summe liegt im Juli
```

**Patch-Satz:** Der Kasten wird von „ist dazugekommen" auf „ist erledigt" gedreht
und dabei **gekürzt**, aber nicht gelöscht. Was bleibt, ist der Teil, der dauerhaft
nützlich ist: dass ein Delta unterhalb eines halben Cents **unsichtbar** ist und die
Summe trotzdem verschiebt. Was entfällt, ist die Warnung an Messende, den Cent nicht
dem eigenen Eingriff zuzuschreiben — sie ist gegenstandslos, seit die Invariante
wieder exakt gilt.

> **Warum der Kasten nicht einfach verschwindet.** §9 ist „Aktueller Stand", und ein
> erledigter Punkt gehört dort nicht dauerhaft hin. Die Beobachtung dahinter ist aber
> keine Statusmeldung, sondern eine Falle: Wer die B2-Invariante prüft und sie um
> einen Cent verfehlt, sucht den Fehler in den **angezeigten** Zeilen — und findet
> ihn nie, weil er in den ausgefilterten steckt. Dieser Satz überlebt den Sprint.

## Patch 7 · §9 — die falsche Ursachen-Diagnose zu Paket 5

**Anker** (eindeutig):

```
**Als Nächstes dran: Paket 5** (bessere automatische Zuordnung) — v2-19 hat sich
```

**Patch-Satz:** Der Absatz wird auf den Stand nach v2-21 gebracht (Paket 5 ist
größtenteils gebaut, `M6` steht auf 🟡) — **und die Ursachen-Diagnose wird korrigiert
statt gelöscht.**

> **Warum das die wichtigste der drei Stellen ist.** Der Absatz behauptete, die
> Split-Systematik und `amount_match` seien der Engpass. Gemessen ist das falsch: Die
> 72 Zahlungen im toten Band hatten einen Betrags-Score von **1,00** und scheiterten
> am Namen. **Eine Sitzung, die dieser Diagnose gefolgt wäre, hätte an der falschen
> Stelle gearbeitet** — an `amount_match` und der Split-Behandlung — und genau die 72
> nicht bewegt.
>
> Die alte Fassung bleibt im Patch **zitiert** stehen, nicht stillschweigend
> überschrieben. Dieselbe Korrektur ist in `V2/v2_roadmap_konsolidiert.md` bereits in
> v2-21 vorgenommen worden; CLAUDE.md trug sie noch.

## Nicht gepatcht, obwohl geprüft

| Stelle | Warum sie stehen bleibt |
|---|---|
| §9 „Ein Beschluss ist entschieden und ungebaut: `KAT-5`" | stimmt weiterhin — `KAT-5` ist nach wie vor nicht gebaut |
| §9 „der Riegel vor Paket 5 ist gefallen" (v2-17/v2-18-Kontext) | historisch richtig, beschreibt den damaligen Stand |
| Die Sparraten-Momentaufnahme | v2-21 und v2-22 bewegen keine Zahl — beide Male alle 24 Werte identisch gemessen |
