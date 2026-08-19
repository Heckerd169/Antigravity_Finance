# Doku-Patches Sprint v2-27 — CLAUDE.md

> **Verfahren nach §7 Regel 14 / LL-16:** erst diese Datei, dann die Anwendung.
> Für CLAUDE.md zusätzlich mit **User-Freigabe** — sie liegt vor: Der Auftrag zu diesem
> Sprint sagt ausdrücklich *„Das Nachziehen von CLAUDE.md gehört mit in diesen Sprint"*,
> und der Plan mit Phase 5 ist freigegeben.
>
> **Dieser Nachzug umfasst DREI Sprints.** CLAUDE.md stand auf **v2-24**; die Patches aus
> v2-25 und v2-26 warteten auf Freigabe. Quellen: `sprint_v2-25_review.md` §7,
> `sprint_v2-26_review.md` §7, `sprint_v2-27_review.md` §7.
>
> **Bibeln unberührt.** Design-Doku (v3.10.0) und Schema-Doku (v3.12.0) brauchen keinen
> Patch: v2-27 hat weder Oberfläche noch Schema geändert. Ihre Versionen werden in §9
> lediglich **richtig abgeschrieben** — dort stand v3.9.0 / v3.10.0.

---

## P1 · Kopfzeile — Stand auf v2-27

**Anker:** `> **Letzte Aktualisierung:** 17. August 2026 · **nach:** Sprint **v2-24**`
bis zum Ende des v2-24-Blocks (vor `> Davor Sprint **v2-23**`).

**Patch:** Ersetzt durch einen v2-27-Block. Der v2-24-Text wandert in die
Davor-Kette; die Regions-Geschichte bleibt in §2 und §6 erhalten, wo sie hingehört.

---

## P2 · §6 — fünf neue Stolperfallen (21 bis 25)

**Anker:** Ende der Stolperfalle **20** (`… (v2-24, LL-30)`), davor die Überschrift
`### Typen neu erzeugen (nur bei Schema-Änderung)`.

**Patch:** Fünf Einträge anfügen.

| # | Kurz | Ursprung |
|---|---|---|
| 21 | Eine Copy-Entscheidung auf einer Karte ist erst vollständig, wenn sie gegen 136 px gehalten wurde | v2-25 |
| 22 | `pg_get_functiondef` schließt **Kommentare** ein — wortgleich heißt wirklich wortgleich | v2-25, in v2-26 bestätigt |
| 23 | Eine Sperre, die nie erreichbar war, ist ungeprüft — wer eine entfernt, prüft, was darunter liegt | v2-26 |
| 24 | Der Rhythmus zählt ab `first_active_month` — Zurückdatieren verschiebt den Fälligkeitsmonat | v2-27 |
| 25 | Ein Client-Timeout ist kein Rollback | v2-27 |

---

## P3 · §8 — fünf neue Lessons Learned (LL-31 bis LL-35)

**Anker:** letzte Zeile der Tabelle (`| LL-30 | …`).

| # | Kurz | steht in | Ursprung |
|---|---|---|---|
| LL-31 | Eine Spezifikation kann an der **Physik** scheitern, nicht am Aufwand — messen und beide Varianten vorlegen | §6 Stolperfalle 21 | v2-25 |
| LL-32 | Ein Wächter auf ein verschwundenes Konstrukt muss Kommentare ausschließen, sonst bestraft er gute Erklärungen | §6 Stolperfalle 22 | v2-25 |
| LL-33 | Der Vorgabewert als Falle — wo eine Vorbelegung eine Zeitreihe eröffnet, gehört sie zur bewussten Wahl oder nachträglich änderbar | §6 Stolperfalle 23 | v2-26 |
| LL-34 | Zurückdatieren verschiebt den Rhythmus — jede Zahl bleibt richtig, sie steht nur im falschen Monat | §6 Stolperfalle 24 | v2-27 |
| LL-35 | Wer aus einem Textmuster aggregiert, misst das Muster und nicht die Sache | §9 | v2-27 |

---

## P4 · §9 — Sprint-Stand

**Anker:** `**Letzter Sprint:** **v2-24** (die App reagiert sofort …`

**Patch:** auf v2-27, mit v2-26 und v2-25 in der Davor-Kette.

---

## P5 · §9 — Doku-Versionen

**Anker:** `**Doku-Versionen:** Design-Doku **v3.9.0** · Schema-Doku **v3.10.0**.`

**Patch:** Design-Doku **v3.10.0** · Schema-Doku **v3.12.0**.

> **Diese Zeile stand zum zweiten Mal falsch** — sie war schon am 17.08.2026 Gegenstand
> einer Korrektur, mit dem ausdrücklichen Hinweis, sie sei „eine Abschrift, keine Quelle".
> Genau das ist wieder passiert. Der Warnkasten bleibt deshalb stehen und bekommt den
> zweiten Vorfall dazu.

---

## P6 · §9 — Momentaufnahme ersetzen

**Anker:** `**Momentaufnahme 13.08.2026 — Orientierung, KEIN Sollwert.**` samt Tabelle
und Fußnote.

**Patch:** Neue Momentaufnahme vom **19.08.2026** mit frisch gemessenen Werten.

> **Diese Stelle ist der eigentliche Grund, warum der Patch nicht warten kann.** Die alte
> Tabelle nennt für 2025 *„alle Monate 4.037,11 €"* und *„Goldlinie 2025 48.445,32 €"*.
> **Beides ist seit diesem Sprint falsch** — und zwar nicht durch normale Benutzung,
> sondern durch einen Eingriff. Eine neue Sitzung, die dort nachschlägt, würde die
> korrigierten Werte für einen Fehler halten.

---

## P7 · §9 — Roadmap-Zahlen

**Anker:** `**17.08.2026, nach der Design-Runde vom 17.08.**: **12 offene Pakete · 39 Themen ·
4 Hausaufgaben · 43 offen gesamt · 53 erledigt**.`

**Patch:** **19.08.2026, nach v2-27**: **12 offene Pakete · 35 Themen · 4 Hausaufgaben ·
39 offen gesamt · 61 erledigt**.
