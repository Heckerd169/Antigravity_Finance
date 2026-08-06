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

*Patch-Datei · Antigravity Finance · Sprint v2-15 · 06. August 2026*
