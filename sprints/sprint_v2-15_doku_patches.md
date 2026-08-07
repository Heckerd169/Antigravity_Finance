# Sprint v2-15 — Doku-Patches

> **Ziel-Dokument:** `antigravity_finance_design_dokument.md` (v3.3.0 → v3.3.1)
> **Schema-Doku:** nicht berührt — kein Datenbank-Eingriff in diesem Sprint.
> **Quelle:** `sprints/sprint_v2-15_briefing.md` (Entscheidungen E-1/E-2/E-3, Prüfanker),
> `sprints/sprint_v2-15_review.md` (Umsetzung, Architektur-Entscheidungen ①–⑤).
> **Verfahren:** LL-16 (§7 Regel 14 CLAUDE.md) — Patch-Datei vor Anwendung.

---

## Abschnitt 06.08.2026

### Patch 1 — §8, Ausstehend-Anzeige: fehlende Rechenregel

**Ziel-Datei:** `antigravity_finance_design_dokument.md`, §8 „Untere Interaktionszone"

**Anker (exaktes Zitat, muss eindeutig sein):**
```
**Die Aussage ist eine Vorhersage, keine Feststellung.** Sie entsteht aus dem Fälligkeitstag (§7), nicht aus einem Bezahlt-Häkchen. Eine Karte kann „Offen" sein und trotzdem nicht mehr in „noch fällig" zählen, weil ihr Termin verstrichen ist.

Copy: §12.9. Beleg der Gestaltung: `V2/design_direktor_2026-08-06_liquiditaet_fragment_split.md` §1.
```

**Patch (Einfügetext nach dem ersten Absatz, vor der Copy-Zeile):**
```
**Die Aussage ist eine Vorhersage, keine Feststellung.** Sie entsteht aus dem Fälligkeitstag (§7), nicht aus einem Bezahlt-Häkchen. Eine Karte kann „Offen" sein und trotzdem nicht mehr in „noch fällig" zählen, weil ihr Termin verstrichen ist.

**Wann ein Posten zählt.** Ein fester Posten zählt genau dann, wenn er eine **aktive Fixkosten- oder Einnahmen-Karte des Monats mit Termin** ist, sein Fälligkeitstag **nicht vor dem heutigen Tag** liegt, und **weder ein Umsatz an ihm hängt noch er abgehakt ist**. Beide Ausschluss-Signale wirken einzeln — es genügt eines, damit der Posten aus der Zahl fällt. Einnahmen **mindern** den Betrag, statt ihn zu erhöhen.

**Der Fälligkeitstag wird auf die Monatslänge geklammert** (`min(due_day, Tage im Monat)`) — ein Dauerauftrag zum 31. ist im Februar am 28. fällig. Die Klammerung sitzt in der Anzeige, nicht in der Spalte `cards.due_day` (§7); so ist es bereits in der v2-14-Migration angelegt.

**„Budget frei" ist die Summe** über alle Budget-Karten von `max(0, effektiver Plan − Verbrauch)`. Ein überschrittenes Budget trägt 0 € bei, ein abgeschlossenes ebenso — die Erlaubnis ist dort beendet, nicht negativ.

**Die Zeile erscheint ausschließlich im laufenden Monat.** Im Zukunftsmonat gibt es kein „heute", gegen das gerechnet werden könnte — die Zahl wäre in Wahrheit die Monatslast und damit eine andere Aussage. Im vergangenen Monat sind alle Termine verstrichen; die Zahl wäre dauerhaft 0 €, und ein Referenzwert ohne Daten ist „keine Anzeige", nicht 0 (§7 Regel 17 / LL-20).

**Abgegrenzt davon:** *Innerhalb* des laufenden Monats wird eine **0 gezeigt**, sobald alle Termine durch sind — „es steht nichts mehr aus" ist eine Antwort, kein fehlender Wert. Nur wenn es die jeweilige Kartenart im Monat gar nicht gibt, entfällt ihre Angabe ganz.

**Die Anzahl der Posten steht nicht dabei.** Ausdrücklich entschieden: Die Kopfzeile trüge sonst vier Zahlen, und die Frage, mit der man hinsieht, ist eine Betragsfrage, keine Zählfrage. Nachzählen lässt sich ohnehin an den Karten selbst — seit `LQ-1` trägt jede ihren Termin.

**Bekannte Untererfassung, bewusst in Kauf genommen:** Karten ohne Termin zählen nicht mit (heute der Friseur, 45,00 €). Zusammen mit der fehlenden Kreditkarten-Abrechnung (Befund `L5`) ist die Zahl systematisch leicht zu optimistisch.

**Darstellung:** Beide Beträge **ohne Nachkommastellen**, mit geschütztem Leerzeichen vor dem € (wie im Ring, §5). Die Aussage ist eine Vorhersage — Cent suggerierten eine Genauigkeit, die ein abgeleiteter Fälligkeitstag nicht hergibt.

Beleg: `sprints/sprint_v2-15_briefing.md` (Entscheidungen E-1 bis E-3 mit Begründung und den verworfenen Alternativen).

Copy: §12.9. Beleg der Gestaltung: `V2/design_direktor_2026-08-06_liquiditaet_fragment_split.md` §1.
```

**Quelle/Begründung:** `sprints/sprint_v2-15_briefing.md` §„Die drei Entscheidungen dieses Sprints" (E-1/E-2/E-3) + Prüfanker ②/③; `sprints/sprint_v2-15_review.md` Abschnitt „Ersatzprüfung der Rechnung" (Klammerung, Budget-frei-Regel, Häkchen/Umsatz-Ausschluss, Darstellung ohne Cent).

---

### Patch 2 — §7, Fälligkeitstag-Anzeige: eigenständiger Ghost-Ton

**Ziel-Datei:** `antigravity_finance_design_dokument.md`, §7 „Komponente: Karten"

**Anker (exaktes Zitat, muss eindeutig sein):**
```
**Herkunft:** Die Werte sind aus der Buchungshistorie **abgeleitet** (Sprint v2-14, `LQ-1`), nicht vom Nutzer bestätigt. Genau deshalb sind sie sichtbar: Ein geratener Wert, der eine sichtbare Zahl treibt (§8, `LQ-2`), darf nicht selbst unsichtbar sein.

Beleg der Gestaltung: `V2/design_direktor_2026-08-06_liquiditaet_fragment_split.md` §2.
```

**Patch (Einfügetext zwischen den beiden Absätzen):**
```
**Herkunft:** Die Werte sind aus der Buchungshistorie **abgeleitet** (Sprint v2-14, `LQ-1`), nicht vom Nutzer bestätigt. Genau deshalb sind sie sichtbar: Ein geratener Wert, der eine sichtbare Zahl treibt (§8, `LQ-2`), darf nicht selbst unsichtbar sein.

**Im Ghost-/Forecast-Zustand dimmt der Termin eigenständig auf `rgba(255,255,255,.20)`.** Die Karten-Opacity (`0.65`) allein ließe ihn lauter wirken als das Status-Label daneben, das zusätzlich auf `--text-ghost` (`.22`) fällt. *Anders als bei der Haushaltsbetrag-Zeile oben, wo ausdrücklich **kein** eigener Ghost-Ton vorgesehen ist — dort wäre ein eigener Ton genau die Unsichtbarkeit, die schon gegen die Alternativvariante sprach; hier macht er den Termin erst lesbar. Der Unterschied ist gewollt.* Wert aus der Entwurfsseite, Variante A1.

Beleg der Gestaltung: `V2/design_direktor_2026-08-06_liquiditaet_fragment_split.md` §2.
```

**Quelle/Begründung:** `sprints/sprint_v2-15_review.md` Abschnitt „Architektur-Entscheidungen" ⑤ (Ghost-Ton `.20` statt `.30`, aus der Entwurfsseite übernommen).

---

### Patch 3 — §7, „Fällig am …": Begründung der Unterzeile

**Ziel-Datei:** `antigravity_finance_design_dokument.md`, §7 „Komponente: Karten", Abschnitt Kontextmenü

**Anker (exaktes Zitat, muss eindeutig sein):**
```
**„Fällig am …" (neu mit `LQ-1`, 06.08.2026):** Eigener Menüpunkt, **nicht** Teil von „Betrag anpassen". Das ist keine Platz-, sondern eine Bedeutungsfrage: „Betrag anpassen" hat durchgängig Monats-Semantik (*nur dieser Monat* / *dauerhaft ab diesem Monat*), `cards.due_day` gilt dagegen **immer** und kennt keine Monatsabgrenzung. Ein Feld dazwischen erzeugte die Frage *„gilt der neue Tag nur für diesen Monat?"* — und die Oberfläche beantwortet sie nicht.
```

**Patch (Einfügetext direkt danach, als neuer Absatz):**
```
**„Fällig am …" (neu mit `LQ-1`, 06.08.2026):** Eigener Menüpunkt, **nicht** Teil von „Betrag anpassen". Das ist keine Platz-, sondern eine Bedeutungsfrage: „Betrag anpassen" hat durchgängig Monats-Semantik (*nur dieser Monat* / *dauerhaft ab diesem Monat*), `cards.due_day` gilt dagegen **immer** und kennt keine Monatsabgrenzung. Ein Feld dazwischen erzeugte die Frage *„gilt der neue Tag nur für diesen Monat?"* — und die Oberfläche beantwortet sie nicht.

**Die Unterzeile `[Kartenname] · gilt für alle Monate` im Overlay trägt genau diese Antwort.** Sie ist die entscheidende Zeile des Overlays: Sie beantwortet die Frage „gilt der neue Tag nur für diesen Monat?", bevor sie entsteht — aus demselben Grund, aus dem der Fälligkeitstag oben nicht in „Betrag anpassen" gehört. Kein Füllwort: Fiele sie einer späteren Straffung zum Opfer, kehrte exakt die Frage zurück, die der eigene Menüpunkt ausschließen sollte.
```

**Quelle/Begründung:** Auftragstext dieser Sitzung (Weisung zu §7/§12.4) — die Unterzeile ist „die entscheidende Zeile des Overlays"; festzuhalten, damit sie bei einer Straffung nicht als Füllwort gestrichen wird.

---

### Patch 4 — §7, „Fällig am …": Verzicht auf Zahlen im Herkunftshinweis

**Ziel-Datei:** `antigravity_finance_design_dokument.md`, §7 „Komponente: Karten", Abschnitt Kontextmenü

**Anker (exaktes Zitat, muss eindeutig sein):**
```
**Auf Budget-Karten erscheint der Eintrag nicht** (kein Termin — siehe „Fälligkeitstag-Anzeige" oben). Das Overlay trägt ein Zahlenfeld (Tag im Monat), die Option `Kein fester Tag` und einen Satz zur Herkunft des Werts. Copy: §12.4.
```

**Patch (Einfügetext direkt danach, als neuer Absatz):**
```
**Auf Budget-Karten erscheint der Eintrag nicht** (kein Termin — siehe „Fälligkeitstag-Anzeige" oben). Das Overlay trägt ein Zahlenfeld (Tag im Monat), die Option `Kein fester Tag` und einen Satz zur Herkunft des Werts. Copy: §12.4.

**Der Herkunftshinweis nennt bewusst keine Zahlen.** Der Beschluss-Record schlug einen Satz mit der Herleitung vor (*„19 Monate, immer am 1. bis 4."*). Diese Herleitung steht ausschließlich als Kommentar in der Migration `20260806_v2_14_lq1_faelligkeitstag.sql` und ist zur Laufzeit nicht verfügbar — sie zu rekonstruieren hieße, die gesamte Buchungshistorie je Karte zu lesen (LL-21), sie zu speichern wäre eine neue Spalte und damit ein Datenbank-Eingriff außerhalb dieses Sprints. Der gewählte Satz ohne Zahlen bleibt außerdem richtig, nachdem der Tag von Hand gesetzt wurde.
```

**Quelle/Begründung:** `sprints/sprint_v2-15_briefing.md` Abschnitt „Ein vierter Punkt, im Bau entschieden" (Herkunftssatz ohne Zahlen, Grund: Herleitung nur im SQL-Kommentar, LL-21).

---

### Patch 5 — §12.4, fünf fehlende Copy-Einträge

**Ziel-Datei:** `antigravity_finance_design_dokument.md`, §12.4 „Kontextmenü + Overlays"

**Anker (exaktes Zitat, muss eindeutig sein):**
```
| Fällig am — Overlay-Option | `Kein fester Tag` |
```

**Patch (fünf neue Zeilen direkt danach):**
```
| Fällig am — Overlay-Option | `Kein fester Tag` |
| Fällig am — Overlay-Titel | `Fällig am` |
| Fällig am — Unterzeile | `[Kartenname] · gilt für alle Monate` |
| Fällig am — Feld-Label | `Tag im Monat` |
| Fällig am — Bestätigung | `Übernehmen` |
| Fällig am — Herkunftshinweis | `Die Tage stammen aus deiner Buchungshistorie — abgeleitet, nicht bestätigt.` |
```

**Quelle/Begründung:** Auftragstext dieser Sitzung — die fünf Copy-Stellen existieren im gebauten Overlay (`sprints/sprint_v2-15_review.md`, Phase 2, `due-day-overlay.tsx`), fehlten aber bislang in §12.4.

---

### Patch 6 — Versions-Bump und Changelog (v3.3.0 → v3.3.1)

**Ziel-Datei:** `antigravity_finance_design_dokument.md`, Header

**Anker 1 (exaktes Zitat, muss eindeutig sein):**
```
**Version:** 3.3.0 (V2 · DD-Runde 06.08.2026 — Liquidität, Schaufenster, Split-Folgen)
```

**Patch 1 (alt → neu):**
```
alt: **Version:** 3.3.0 (V2 · DD-Runde 06.08.2026 — Liquidität, Schaufenster, Split-Folgen)
neu: **Version:** 3.3.1 (V2 · Sprint v2-15 — Liquidität: Ausführungsdetails)
```

**Anker 2 (exaktes Zitat, muss eindeutig sein):**
```
**Status:** Freigegeben — Schema-Doku v3.4.4; V2-Patches bis Sprint v2-14 eingespielt, dazu die Design-Entscheidungen vom 06.08.2026 (`LQ-2` · `LQ-1` · `RM-2` · `PA-1` — entschieden, Umsetzung steht aus)
```

**Patch 2 (alt → neu):**
```
alt: **Status:** Freigegeben — Schema-Doku v3.4.4; V2-Patches bis Sprint v2-14 eingespielt, dazu die Design-Entscheidungen vom 06.08.2026 (`LQ-2` · `LQ-1` · `RM-2` · `PA-1` — entschieden, Umsetzung steht aus)
neu: **Status:** Freigegeben — Schema-Doku v3.4.4; V2-Patches bis Sprint v2-15 eingespielt (`LQ-1` · `LQ-2` gebaut); `RM-2` · `PA-1` weiterhin entschieden, Umsetzung steht aus
```

**Anker 3 (exaktes Zitat, Tail des v3.3.0-Changelog-Eintrags + Folgezeile, muss eindeutig sein):**
```
Beleg: `V2/design_direktor_2026-08-06_liquiditaet_fragment_split.md`.
>
> **Datei-Konvention (23.07.2026):**
```

**Patch 3 (Einfügetext eines neuen Changelog-Absatzes davor):**
```
Beleg: `V2/design_direktor_2026-08-06_liquiditaet_fragment_split.md`.
>
> **Changelog v3.3.1 (06.08.2026, Sprint v2-15 · `LQ-1` `LQ-2` gebaut):** Ausführungsdetails der DD-Runde nachgezogen — keine neue Spezifikation, keine aufgehobene Regel; die vier Entscheidungen vom 06.08. stehen bereits in v3.3.0. §8 Ausstehend-Anzeige um die vollständige Rechenregel ergänzt: wann ein Posten zählt (Termin nicht vor heute, weder Umsatz noch Häkchen), Klammerung des Fälligkeitstags auf die Monatslänge, Definition „Budget frei", Sichtbarkeit ausschließlich im laufenden Monat inkl. der 0-€-Abgrenzung, bewusster Verzicht auf eine Postenzahl, bekannte Untererfassung, Darstellung ohne Nachkommastellen. §7 Fälligkeitstag-Anzeige um den eigenständigen Ghost-Ton `rgba(255,255,255,.20)` ergänzt sowie um die Begründung der Overlay-Unterzeile `gilt für alle Monate` und den bewussten Verzicht auf Zahlen im Herkunftshinweis. §12.4 um fünf bislang fehlende Copy-Einträge des „Fällig am …"-Overlays ergänzt (Overlay-Titel, Unterzeile, Feld-Label, Bestätigung, Herkunftshinweis). Beleg: `sprints/sprint_v2-15_briefing.md`, `sprints/sprint_v2-15_review.md`. Patch-Bump statt Minor, weil ausschließlich Ausführungsdetails nachgezogen werden.
>
> **Datei-Konvention (23.07.2026):**
```

**Quelle/Begründung:** LL-16 / §7 Regel 14 CLAUDE.md — Versions-/Changelog-Bump ist Pflicht-Patch-Stelle bei jeder Design-Doku-Änderung. Patch-Level laut Auftrag: keine neue Spezifikation, keine aufgehobene Regel.

---

### Patch 7 — Nachtrag: Begründung des Ghost-Tons war inhaltlich verdreht

**Ziel-Datei:** `antigravity_finance_design_dokument.md`, §7 „Komponente: Karten", Abschnitt „Fälligkeitstag-Anzeige"

**Befund (Gegenlesen des Diffs, Koordinator):** `.20` ist **dunkler** als `.30` — der eigene Ghost-Ton dämpft den Termin, er macht ihn nicht lesbarer. Patch 2 (oben) hatte das in der Vergleichsklausel zur Haushaltsbetrag-Zeile falsch begründet (*„hier macht er den Termin erst lesbar"*). Tatsächlicher Grund laut Code-Kommentar in `cards.module.css`: Ohne eigenen Ton würde der Termin im Forecast **lauter** wirken als das Status-Label daneben, weil das Label zusätzlich auf `--text-ghost` (`.22`) fällt — der eigene Ton stellt das **Verhältnis** der beiden Zeilen-Enden wieder her, das in den anderen Zuständen von selbst stimmt.

**Anker (exaktes Zitat nach Patch 2, muss eindeutig sein):**
```
**Im Ghost-/Forecast-Zustand dimmt der Termin eigenständig auf `rgba(255,255,255,.20)`.** Die Karten-Opacity (`0.65`) allein ließe ihn lauter wirken als das Status-Label daneben, das zusätzlich auf `--text-ghost` (`.22`) fällt. *Anders als bei der Haushaltsbetrag-Zeile oben, wo ausdrücklich **kein** eigener Ghost-Ton vorgesehen ist — dort wäre ein eigener Ton genau die Unsichtbarkeit, die schon gegen die Alternativvariante sprach; hier macht er den Termin erst lesbar. Der Unterschied ist gewollt.* Wert aus der Entwurfsseite, Variante A1.
```

**Patch (alt → neu, nur der Schlussteil der Vergleichsklausel):**
```
alt: … dort wäre ein eigener Ton genau die Unsichtbarkeit, die schon gegen die Alternativvariante sprach; hier macht er den Termin erst lesbar. Der Unterschied ist gewollt.
neu: … dort wäre ein eigener Ton genau die Unsichtbarkeit, die schon gegen die Alternativvariante sprach; hier stellt er das Verhältnis der beiden Zeilen-Enden wieder her, das in allen anderen Zuständen von selbst stimmt. Der Unterschied ist gewollt.
```

**Quelle/Begründung:** Koordinator-Gegenlesen des Diffs (06.08.2026) + Code-Kommentar `cards.module.css`. **Kein Versions-Bump** — v3.3.1 war zum Zeitpunkt der Korrektur noch nicht gepusht, die Korrektur bleibt in derselben Version. Der Changelog-Eintrag zu v3.3.1 (Header) nennt nur „den eigenständigen Ghost-Ton ergänzt", ohne die fehlerhafte Begründung zu wiederholen — dort war nichts nachzuziehen.

---

## Abschnitt 07.08.2026 — CLAUDE.md-Nachzug (User-Freigabe)

> **Ziel-Dokument dieses Abschnitts:** `CLAUDE.md` — abweichend von Patch 1–7 oben
> (Design-Doku). **Freigabe:** User, „Ziehe die Claude.md nach" (07.08.2026).
> **Quelle:** `sprints/sprint_v2-15_review.md` (insb. Abschnitt 7, Vorschläge ①/②),
> `sprints/sprint_v2-15_briefing.md`, `V2/v2_roadmap_konsolidiert.md` (bereits
> nachgezogen, §0).
> **Verfahren:** LL-16 / §7 Regel 14 CLAUDE.md — zusätzlich User-Freigabe vor
> Anwendung, weil Ziel-Dokument die Verfassung selbst ist.
> **Ausdrücklich nicht Teil dieses Abschnitts:** die vom Review vorgeschlagene neue
> Stolperfalle („ein Beleg, der nur im Migrations-Kommentar steht, ist zur Laufzeit
> nicht vorhanden") — die geht dem User separat zur Freigabe vor, weil sie eine neue
> Arbeitsregel wäre.

---

### Patch 8 — Kopfblock: „Letzte Aktualisierung" auf v2-15

**Ziel-Datei:** `CLAUDE.md`, Kopfblock direkt unter der Titelzeile

**Anker (exaktes Zitat, muss eindeutig sein):**
```
> **Letzte Aktualisierung:** 06. August 2026 · **nach:** der Design-Direktor-Runde
> (`LQ-2` `LQ-1` `RM-2` `PA-1` entschieden, Design-Doku **v3.3.0**) und Sprint **v2-14**
> (`LQ-1`, `cards.due_day`). §9 ist auf Sprint-Stand, Doku-Versionen und Roadmap-Lage
> nachgezogen; die **Prüfanker stehen weiterhin auf dem Stand vom 05.08.2026** und sind
> unverändert gültig, weil seither keine Rechenfunktion berührt wurde.
> Davor v2-13 (`BF-4` — der
> Split-Anteil wird genau einmal angewandt; **neue Stolperfalle 11**, **neue Regeln
> 23/24 mit LL-23/LL-24**). Damit ist **Paket 1 vollständig**: alle fünf Befunde vom
> 04.08. sind erledigt.
```

**Patch (alt → neu):**
```
neu:
> **Letzte Aktualisierung:** 07. August 2026 · **nach:** Sprint **v2-15**
> (`LQ-1`-Anzeigeseite + `LQ-2` gebaut, Design-Doku **v3.3.1**, PR **#17** offen, noch
> nicht gemerged). §9 ist auf Sprint-Stand, Doku-Versionen und Roadmap-Lage
> nachgezogen; die **Prüfanker stehen weiterhin auf dem Stand vom 05.08.2026** und sind
> unverändert gültig — in v2-15 vor und nach dem Sprint erneut bestätigt, weil keine
> Rechenfunktion berührt wurde.
> Davor die Design-Direktor-Runde vom 06.08.2026 (`LQ-2` `LQ-1` `RM-2` `PA-1`
> entschieden, Design-Doku v3.3.0) und Sprint v2-14 (`LQ-1`, `cards.due_day`). Davor
> v2-13 (`BF-4` — der
> Split-Anteil wird genau einmal angewandt; **neue Stolperfalle 11**, **neue Regeln
> 23/24 mit LL-23/LL-24**). Damit ist **Paket 1 vollständig**: alle fünf Befunde vom
> 04.08. sind erledigt.
```

Die nachfolgende, nicht zitierte Kette („Davor v2-11 …" bis „Davor v2-08 …") bleibt
unverändert stehen — sie ist nicht Teil dieses Ankers.

**Quelle/Begründung:** `sprints/sprint_v2-15_review.md` Kopf (Branch/Commits/Datum,
PR-Status) + §7 Vorschlag ②; Design-Doku-Version aus Patch 6 dieser Datei (v3.3.1).

---

### Patch 9 — §9: „Letzter Sprint" auf v2-15

**Ziel-Datei:** `CLAUDE.md`, §9 „Aktueller Stand"

**Anker (exaktes Zitat, muss eindeutig sein):**
```
**Letzter Sprint:** v2-14 (`LQ-1` — `cards.due_day`, der Fälligkeitstag je Karte; reine
Schema-Erweiterung, keine Rechenfunktion berührt, 06.08.2026 gemerged `576ea43`) ·
**davor:** v2-13 (`BF-4`, Split-Anteil genau einmal) und v2-12 (`BF-2`, Ring-Subzeile).
Vollständige Sprint-Tabelle und alle Details: `sprints/projekt_historie.md`.
```

**Patch (alt → neu):**
```
neu:
**Letzter Sprint:** v2-15 (`LQ-1`-Anzeigeseite + `LQ-2` Ausstehend-Anzeige,
07.08.2026, PR **#17** offen, noch nicht gemerged) · **davor:** v2-14 (`LQ-1`
Datengrundlage, `cards.due_day`) und v2-13 (`BF-4`, Split-Anteil genau einmal).
Vollständige Sprint-Tabelle und alle Details: `sprints/projekt_historie.md`.
```

**Quelle/Begründung:** `sprints/sprint_v2-15_review.md` Kopf + §1 (drei Phasen,
Commits `d531dfe`/`6272ed7`/`d0cc5cc`); PR-Nummer und -Status aus dem Auftrag dieser
Sitzung.

---

### Patch 10 — §9: „Zuletzt entschieden, noch nicht gebaut" — LQ-1/LQ-2 jetzt gebaut

**Ziel-Datei:** `CLAUDE.md`, §9 „Aktueller Stand"

**Anker (exaktes Zitat, muss eindeutig sein):**
```
**Zuletzt entschieden, noch nicht gebaut:** die Design-Direktor-Runde vom 06.08.2026 —
`LQ-2` (Ausstehend-Anzeige), `LQ-1`-Anzeigeseite (Fälligkeitstag auf der Karte), `RM-2`
(Schaufenster-Popup) und `PA-1` (Konsequenz-Anzeige). Record:
`V2/design_direktor_2026-08-06_liquiditaet_fragment_split.md`; Spezifikation in der
Design-Doku v3.3.0.
```

**Patch (alt → neu):**
```
neu:
**Zuletzt entschieden, noch nicht gebaut:** aus der Design-Direktor-Runde vom
06.08.2026 sind `LQ-2` (Ausstehend-Anzeige) und die `LQ-1`-Anzeigeseite
(Fälligkeitstag auf der Karte) mit Sprint v2-15 gebaut. Offen bleiben `RM-2`
(Schaufenster-Popup) und `PA-1` (Konsequenz-Anzeige) — beide vollständig entschieden
und ohne Datenbank-Eingriff baubar. Record:
`V2/design_direktor_2026-08-06_liquiditaet_fragment_split.md`; Spezifikation in der
Design-Doku v3.3.1.
```

**Quelle/Begründung:** `sprints/sprint_v2-15_briefing.md` Kopf („Themen: LQ-1 +
LQ-2") + Nicht-Ziel-Absatz („nicht RM-2, nicht PA-1"); `sprints/sprint_v2-15_review.md`
Abschnitt 1 (alle drei Phasen umgesetzt).

---

### Patch 11 — §9: Doku-Versionen v3.3.1

**Ziel-Datei:** `CLAUDE.md`, §9 „Aktueller Stand"

**Anker (exaktes Zitat, muss eindeutig sein):**
```
**Doku-Versionen:** Design-Doku **v3.3.0** · Schema-Doku **v3.4.4**.
```

**Patch (alt → neu):**
```
alt: **Doku-Versionen:** Design-Doku **v3.3.0** · Schema-Doku **v3.4.4**.
neu: **Doku-Versionen:** Design-Doku **v3.3.1** · Schema-Doku **v3.4.4**.
```

**Quelle/Begründung:** Patch 6 dieser Datei (Design-Doku-Bump v3.3.0 → v3.3.1,
bereits angewendet). Schema-Doku unberührt laut Auftrag.

---

### Patch 12 — §9: Prüfanker-Tabelle bleibt, Bestätigungsvermerk v2-15 ergänzt

**Ziel-Datei:** `CLAUDE.md`, §9 „Aktueller Stand" — nur der Einleitungssatz vor der
Anker-Tabelle, **die Tabelle selbst wird nicht angefasst**.

**Anker (exaktes Zitat, muss eindeutig sein):**
```
**Prüfanker Produktion** (gemessen **05.08.2026** gegen `nflkobdfdhncrtjncpmq`,
`calculate_sparrate_for_month`, nur `SELECT`; in v2-13 vor **und** nach der
`BF-4`-Migration bestätigt):
```

**Patch (alt → neu):**
```
neu:
**Prüfanker Produktion** (gemessen **05.08.2026** gegen `nflkobdfdhncrtjncpmq`,
`calculate_sparrate_for_month`, nur `SELECT`; in v2-13 vor **und** nach der
`BF-4`-Migration bestätigt; in v2-15 vor **und** nach dem Sprint erneut gemessen —
`calculate_sparrate_for_month` **und** `calculate_planned_sparrate_for_month`, alle
zwölf Monate, Ist **und** Plan, Abweichung überall 0,00 €, erwartet, weil keine
Rechenfunktion berührt wurde):
```

**Quelle/Begründung:** `sprints/sprint_v2-15_review.md` §3 „Anker vorher/nachher"
(Tabelle Ist/Plan vorher/nachher, alle zwölf Monate, Abweichung überall 0,00 €) +
Zeile „Die Anker-Tabelle in CLAUDE.md §9 bleibt unverändert gültig."

---

### Patch 13 — §9: Roadmap-Lage — Selbstwiderspruch aufgelöst, neuer Stand 12/38/35

**Ziel-Datei:** `CLAUDE.md`, §9 „Aktueller Stand"

**Anker (exaktes Zitat, muss eindeutig sein):**
```
**Offene Themen:** `V2/v2_roadmap_konsolidiert.md` — nach **Sprint-Paketen** geordnet;
§0 trägt die Zahlen, §5 löst die alten Buchstaben-Kennungen auf. Stand dort
**05.08.2026, nach v2-13**: **13 offene Pakete · 39 offen · 33 erledigt**. v2-14 und die
Entscheidungen vom 06.08.2026 sind darin **noch nicht verrechnet** — die Zahlen sind
gespiegelt, nicht nachgerechnet. **Vorsicht:** §0 nennt sie zweimal verschieden —
Zahlen-Tabelle gegen Herleitungs-Kasten (Hausaufgaben 6/7, Erledigt 33/32). Übernommen
ist die Tabelle, weil sie aufgeht (33 + 6 = 39); die Auflösung gehört in die Roadmap.
```

**Patch (alt → neu):**
```
neu:
**Offene Themen:** `V2/v2_roadmap_konsolidiert.md` — nach **Sprint-Paketen** geordnet;
§0 trägt die Zahlen, §5 löst die alten Buchstaben-Kennungen auf. Stand dort
**06.08.2026, nach v2-15**: **12 offene Pakete · 38 offen · 35 erledigt**. Der frühere
Selbstwiderspruch ist aufgelöst: Die Zahlen-Tabelle hatte recht, der
Herleitungs-Kasten hatte sich zweimal verzählt (§2 trägt 6 Zeilen, nicht 7; `BF-4`
stand in §4 bereits drin und wurde ein zweites Mal addiert). Eine dritte Zahl stimmte
allerdings nirgends — in den Paket-Tabellen standen 34 offene Themen, nicht 33.
```

**Quelle/Begründung:** `V2/v2_roadmap_konsolidiert.md` §0 „Stand in Zahlen" (Tabelle:
12/32/6/38/35/4) + Kasten „Der Selbstwiderspruch in diesem Abschnitt ist aufgelöst
(06.08.2026, v2-15)" — verifiziert per `Grep` gegen die Roadmap-Datei vor Anwendung.

---

### Patch 14 — §9: Paket 3 abgeschlossen, „Ohne Entscheidung baubar" auf RM-2/PA-1

**Ziel-Datei:** `CLAUDE.md`, §9 „Aktueller Stand" (Schlussabsätze)

**Anker (exaktes Zitat, muss eindeutig sein):**
```
**Paket 1 ist vollständig abgeschlossen.** Alle fünf Befunde vom 04.08.2026 sind
erledigt — `BF-3` und `BF-1` (v2-10), `BF-5` (v2-11), `BF-2` (v2-12), `BF-4` (v2-13).
Damit blockiert **keine Entscheidung mehr Arbeit**: E1, E2 und E3 sind gefallen.

**Ohne Entscheidung baubar:** **Paket 3** (Liquiditäts-Vorschau) sowie die vier am
06.08.2026 entschiedenen Anzeigen — Spezifikation in der Design-Doku v3.3.0, kein
Datenbank-Eingriff nötig. Weiterhin **offen**: **Paket 4** (Kategorien im Karussell) —
die Runde vom 06.08. hat es ausdrücklich **nicht** entsperrt —, dazu `M2` und `M5`.
Aus `sprints/sprint_v2-10_offene_fragen.md` ist §5 (`PA-1`) durch die Runde erledigt;
**§6 bleibt offener Altbestand:** Das Einkommens-Popup hat als einziges von acht
Overlays keinen Escape-Handler — Bauauftrag für den Sprint, der das Popup anfasst.
```

**Patch (alt → neu):**
```
neu:
**Paket 1 ist vollständig abgeschlossen.** Alle fünf Befunde vom 04.08.2026 sind
erledigt — `BF-3` und `BF-1` (v2-10), `BF-5` (v2-11), `BF-2` (v2-12), `BF-4` (v2-13).
Damit blockiert **keine Entscheidung mehr Arbeit**: E1, E2 und E3 sind gefallen.

**Paket 3 ist ebenfalls vollständig abgeschlossen.** `LQ-1` und `LQ-2` sind mit
Sprint v2-15 gebaut. `LQ-3` gehörte nie dazu — es liegt in Paket 9.

**Ohne Entscheidung baubar:** `RM-2` (Schaufenster-Popup) und `PA-1`
(Konsequenz-Anzeige) — beide am 06.08.2026 entschieden, Spezifikation in der
Design-Doku v3.3.1, kein Datenbank-Eingriff nötig. Weiterhin **offen**, für eine
eigene Gestaltungsrunde: **Paket 4** (Kategorien im Karussell) — die Runde vom
06.08. hat es ausdrücklich **nicht** entsperrt —, dazu `M2` und `M5`.
Aus `sprints/sprint_v2-10_offene_fragen.md` ist §5 (`PA-1`) durch die Runde erledigt;
**§6 bleibt offener Altbestand:** Das Einkommens-Popup hat als einziges von acht
Overlays keinen Escape-Handler — Bauauftrag für den Sprint, der das Popup anfasst.
Das neue „Fällig am …"-Overlay aus v2-15 hat einen Escape-Handler von Anfang an, der
Rückstand wächst also nicht weiter.
```

**Quelle/Begründung:** `sprints/sprint_v2-15_review.md` §7 Vorschlag ① („LQ-1 und
LQ-2 auf ✅ … Paket 3 vollständig abgeschlossen bis auf LQ-3, das ohnehin in Paket 9
liegt") + §6 Punkt ⑥ (neues Overlay hat Escape-Handler von Anfang an); Design-Doku-
Version aus Patch 6 dieser Datei.

---

### Patch 15 — §4 „Test- und Migrations-Gate": Zugangsdaten gehören in den
Haupt-Checkout

**Ziel-Datei:** `CLAUDE.md`, §4 „Rollen, Gates und Werkzeuge", Abschnitt
„Test- und Migrations-Gate"

**Warum diese Stelle statt §3:** Der Befund betrifft unmittelbar, welcher Test-Gate
greift (angemeldeter Render-Smoke vs. nur `visual`+`unauth`) — das ist genau das
Thema dieses Abschnitts, nicht die Datei-Ablage-Frage aus §3.

**Anker (exaktes Zitat, muss eindeutig sein):**
```
### Test- und Migrations-Gate

Reine UI-/Loader-Sprints ohne Schema-Eingriff laufen direkt gegen Produktion, mit
dem Browser-Smoke des Users als Wächter (Sparrate vorher/nachher, §7 Regel 21).
**Jeder** Sprint mit Schema-/RPC-Eingriff oder mit daten-mutierenden E2E-Läufen
probt zuerst auf der Übungs-Datenbank → Fähigkeit `db-eingriff`.
```

**Patch (Einfügetext als neuer Absatz direkt danach):**
```
**`.env.local` und `.env.e2e.local` gehören in den Haupt-Checkout, nicht in einen
Sprint-Worktree** — beide sind gitignored und verschwinden sonst mit dessen
Aufräumen, wie zwischen v2-10 und v2-15 geschehen. Fehlt `.env.e2e.local`, schließt
`playwright.config.ts` das `render-smoke`-Projekt aus der Projektliste aus; der
**angemeldete** Render-Smoke entfällt ersatzlos, und der `smoke-agent` kann die
Oberfläche nicht mehr beurteilen (Beleg: `sprints/sprint_v2-10_review.md` §2,
`pnpm test:e2e` 10/10 inkl. `render-smoke` 4).
```

**Quelle/Begründung:** `sprints/sprint_v2-15_review.md` §2 „Was NICHT geprüft werden
konnte" + §6 Punkt ① („Die Zugangsdaten für den angemeldeten Smoke sind verloren
gegangen"); Gegenbeleg `sprints/sprint_v2-10_review.md` §2 (`pnpm test:e2e` 10/10,
`render-smoke` 4) — per `Grep` vor Anwendung verifiziert.

---

*Patch-Datei · Antigravity Finance · Sprint v2-15 · 06.–07. August 2026*
