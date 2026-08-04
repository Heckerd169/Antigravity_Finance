# Roadmap — Antigravity Finance

> **Was das hier ist:** die einzige Liste offener Themen. Sie ist nach **Sprint-Paketen**
> geordnet — jedes Paket ist ein planbarer Sprint, nicht eine Themenkategorie.
> **Stand:** 04. August 2026 (nach v2-08) · **Vorgänger-Struktur:** bis zum 04.08.2026
> waren die Themen nach 14 Buchstaben-Kategorien (A–N) sortiert. Die Kennungen leben
> weiter (§5), damit ältere Papiere auflösen — aber sie sind nicht mehr die Ordnung.
>
> **Pflege:** Am Ende jedes Sprints wird der Stand der berührten Pakete mitgezogen —
> zusammen mit CLAUDE.md und den Bibeln. Die Fähigkeit `sprint-abschluss` führt das
> als eigenen Schritt. Ohne diese Routine veraltet die Datei innerhalb von zwei Sprints.

**Zeichen:** ✅ erledigt · 🟡 teilweise · ⬜ offen · ⊘ hinfällig · 🔎 vor dem Schnitt prüfen

---

## 0. Stand in Zahlen

*Alle Zahlen am 04.08.2026 zeilengenau nachgezählt.*

| | Anzahl |
|---|---|
| Offene Pakete | **11** |
| Themen darin | **30** |
| Hausaufgaben ohne eigenen Sprint | **6** |
| **Offen gesamt** | **36** |
| Erledigt | 24 |
| Hinfällig geworden | 4 |

> Die 36 setzen sich zusammen aus 28 offenen Themen der Alt-Roadmap **minus 3**
> (F1, F2, F3 sind unter M6 zu einer Zeile zusammengefasst) **plus 11 neue**:
> die fünf Befunde vom 04.08., zwei Datenbasis-Themen und zwei Übungs-DB-Hausaufgaben,
> die bisher nur im Projekt-Gedächtnis standen, sowie zwei Feinschliff-Punkte
> (B2-F, A1-F), die zuvor nur im Fließtext erwähnt waren.

**Was als Nächstes dran ist:** Paket 1. Ein Rechenfehler, der 900 € in der
Juli-Sparrate bewegt, wiegt schwerer als jedes offene Feature — und drei der fünf
Befunde sind bereits entschieden und sofort umsetzbar.

**Drei Entscheidungen blockieren Arbeit** (alle in
`V2/befunde_2026-08-04_fehler_und_entscheidungen.md` §7, jeweils mit Empfehlung):
**E1** Was bedeutet die Zahl auf einer gemeinsamen Karte? · **E2** Was, wenn
Gutschriften die Ausgaben übersteigen? · **E3** Braucht Gleichstand eine eigene
Formulierung? Ohne sie darf an den Befunden 4 und 5 nicht gebaut werden.

---

## 1. Offene Pakete

Die Reihenfolge ist ein **Vorschlag**, kein Beschluss. Sie ändert sich erfahrungsgemäß
mit dem, was beim Benutzen auffällt.

### Paket 1 · Fehler aus der Nutzung
**Entsperrt:** verlässliche Zahlen. Solange die Sparrate falsch rechnet, ist jede
Auswertung darauf wertlos — auch die Abweichungs-Treiber.
**Quelle:** `V2/befunde_2026-08-04_fehler_und_entscheidungen.md` (Diagnose vollständig,
Prüfanker je Fehler benannt)

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| BF-3 | Einkommens-Popup öffnet ~80 px schmal, unbenutzbar | Bug | nein | ⬜ | **Entschieden, sofort umsetzbar.** Popup wird ohne Portal innerhalb eines Elements mit `transform` gezeichnet; ein Vorfahre mit `transform` wird zum Bezugsrahmen für `position: fixed`. Alle acht anderen Overlays nutzen bereits Portale. **Blockiert aktiv das Eintragen von Gehältern — höchste Dringlichkeit.** |
| BF-1 | Euro-Zeichen bricht auf die nächste Zeile | Bug | nein | ⬜ | **Entschieden.** Alle KI-Vorschlags-Kästchen entfallen aus der Anzeige; Datenbank rechnet weiter, später mit einer Zeile wieder einschaltbar. Die sechs Badge-Farbtöne bleiben ungenutzt im Code. Zusätzlich Umbruch-Verbot für den Betrag. Schließt zugleich den Badge-Überlauf aus v2-07-Review §5.1. |
| BF-5 | Fragmente werden ohne Vorzeichen addiert | Bug | **ja** | ⬜ | `SUM(ABS(...))` wirft Vorzeichen weg. Betrifft heute **eine** Karte („Aline Geburtstag", Juli) mit **900,00 €** Wirkung. Sollverhalten steht bereits in Design-Doku §11 — der Leitfaden beschreibt ein Verhalten, das es nie gab. **Hängt an E2.** Prüfanker: Juli-Ist −1.222,75 → −322,75, alle anderen Monate unverändert. |
| BF-2 | Sinnloser Hinweis unter dem Ring bei negativer Sparrate | Bug | nein | ⬜ | „Plan fast 0 € — −1.223 € gespart". Aus zwei Textzweigen wird einer, vorzeichensicher. **Hängt an E3.** Sinnvoll **nach** BF-5, weil die Juli-Zahl dann stimmt und der neue Text am echten Fall zu sehen ist. |
| BF-4 | Gemeinsame Karten zeigen den Gesamtbetrag | Diskussion | **ja** | ⬜ | Anzeige ist spec-konform (§4.5), dahinter steckt aber ein Rechenproblem mit Geldwirkung: Der Anteil wird auch auf eine zugeordnete Fragment-Summe angewandt → Sparrate rund **466 €/Monat zu gut**, sobald eine gemeinsame Karte ein Fragment bekommt. Heute noch nicht eingetreten (keine gemeinsame Karte hat eines). **Hängt an E1.** Eigene Phase, berührt Design-Doku §4.5. |

> BF-5 und BF-4 fassen beide die Rechenfunktionen an → gemeinsame Übungs-DB-Probe,
> wenn sie im selben Sprint laufen. Fähigkeit `db-eingriff`.

---

### Paket 2 · Datenbasis vervollständigen
**Entsperrt:** ehrliche Vorjahreswerte, aussagekräftige Treiber, überhaupt eine
Vergleichsbasis. Ohne dieses Paket bleibt die 2025-Goldlinie irreführend hoch.

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| DA-1 | Karten auf 2025 zurückdatieren | Daten | ja (Schreibzugriff) | ⬜ | Ohne sie ist die 2025-Sparrate das **volle Netto** — es sind dort keine Kosten modelliert. Die Vorjahres-Goldlinie (48.445 €) ist dadurch technisch richtig und inhaltlich unvergleichbar. Zugleich Voraussetzung dafür, dass 2025 überhaupt kuratierbar ist (Karten sind dort inaktiv, es gibt keine Ablageziele). **User-Entscheidung offen.** |
| DA-2 | Kuratierung 2026 | Daten | ja (Schreibzugriff) | ⬜ | Seit v2-07 überhaupt erst möglich — vorher war die Rohmasse ab Februar leer. Voraussetzung dafür, dass die Abweichungs-Treiber live etwas zeigen: bei heute 4 Verknüpfungen, davon 3 wirkungsneutral, steht überall „Keine Abweichungen". Das ist korrektes Verhalten, aber nutzlos. |

---

### Paket 3 · Bessere automatische Zuordnung
**Entsperrt:** senkt den Aufwand für **alle** nachgelagerten Themen. Der heutige
Engpass ist Handarbeit beim Kuratieren.

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| M6 | Verbesserte automatische Fragment-zu-Karten-Zuordnung | Feature | evtl. | ⬜ | **Fasst F1, F2, F3 zusammen.** F1 Konfidenz-Verbesserung (Embeddings, Levenshtein, Klassifikator; evtl. Score-Spalten) · F2 Kategorie-Vorhersage pro Nutzer (Schema-Eingriff) · F3 Fragment-Clustering. Empfehlung: erster echter Feature-Sprint nach Paket 1 und 2. |

---

### Paket 4 · Gestaltungs-Feinschliff
**Entsperrt:** die Endabnahme zweier fertiger Sprints (v2-05, v2-06).
**Werkzeug:** Fähigkeit `design-direktor`.

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| M2 | Verben-Sprache und Gesten des Karten-Lebenszyklus | Diskussion | nein | 🟡 | Backend entschieden und umgesetzt (v2-05): Verbergen ersatzlos gestrichen, Drei-Verben-Modell steht. **Offen:** Wortwahl und Gesten. Interim-Oberfläche ist in Betrieb. Umfasst auch die Geste für `ASSET_REALLOCATION` (heute schlichter Text-Knopf). |
| B2-F | Feinschliff der Abweichungs-Treiber | Diskussion | nein | ⬜ | Label-Format der Treiber-Zeilen · Wortlaut bei Monaten ohne Abweichung · Entscheidung über **E4** (Pseudo-Treiber „n € unzugeordnet in Monat M" für die Rohmasse — bewusst nicht umgesetzt). |
| M5 | Karten-Anordnung im Karussell | Feature | nein | ⬜ 🔎 | Heute Fixkosten → Einnahmen → Budget (seit Sprint 4). Ursprünglicher Wunsch war Budget → Fixkosten → Einnahmen. **Vor dem Schnitt bestätigen**, ob das noch gilt. |
| A1-F | Badge-Palette und Schalter-Sprache | Diskussion | nein | ⬜ | Aus v2-07: reiner Token- und Text-Tausch. **Achtung:** Wird BF-1 umgesetzt, entfallen die Vorschlags-Kästchen ganz — dann erledigt sich die Palettenfrage von selbst. Erst nach Paket 1 anfassen. |

---

### Paket 5 · Einstellungen
**Entsperrt:** eigene IBANs ohne SQL pflegbar — heute ist bei jedem neuen Konto ein
manueller Datenbank-Eingriff nötig.

| # | Punkt | Art | Datenbank | Stand |
|---|---|---|---|---|
| D3 | Settings-Bereich allgemein, Routing und Layout | Feature | nein | ⬜ |
| D1 | Oberfläche zur Verwaltung von `own_ibans` | Feature | nein | ⬜ |
| D2 | Steuerklasse-Wechsel über die Oberfläche | Feature | nein | ⬜ |

---

### Paket 6 · Mehrkonten Stufe 2
**Entsperrt:** Überweisungsketten (Cortal → Giro → Kreditkarte) werden als **eine**
Ausgabe erkannt statt als drei Bewegungen.
**Voraussetzung:** mindestens ein sauber kuratierter Monat — sonst fehlt die
Vergleichsbasis für die Verkettung.

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| M9 | Multi-Account-Reconciliation, Stufe 2 | Feature | **ja** | 🟡 | Stufe 1 erledigt (v2-04): DKB-Visa-Parser, `ASSET_REALLOCATION`, Transfer-Erkennung. |
| F5 | Paired-Fragment-Verlinkung (`paired_fragment_id`) | Feature | **ja** | ⬜ | Technische Voraussetzung für M9 Stufe 2. |

---

### Paket 7 · Kartenverlauf

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| M7 | „Verlauf" im Karten-Kontextmenü: Jan–Dez, Ist gegen Plan je Karte | Feature | nein | ⬜ | Datenseitig bereits abgedeckt — `get_year_deviation_drivers` liefert je Karte `ist` und `plan` pro Monat. Reines Oberflächen-Feature, gut isolierbar. |

---

### Paket 8 · Welle-Rest

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| B1 | Gleitendes 12-Monats-Fenster statt Kalenderjahr | Feature | nein | ⬜ | Im Welle-Kontext neu zu definieren — heute führt sie das Kalenderjahr. |
| B4 | Monatsgenauer Nenner für die %-Angabe statt jüngstem Einkommens-Slot | Feature | nein | ⬜ | |
| B5 | Bulk-Abfrage `get_yearly_sparrate_curves` | Feature | **ja** | ⬜ | **Nur bei spürbarer Verzögerung.** Nicht auf Verdacht optimieren. Der Jahres-Call aus v2-06 ist der erste Baustein in diese Richtung. |

---

### Paket 9 · Import-Erweiterungen
**Bedarfsgetrieben** — erst wenn eine Quelle real gebraucht wird.

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| F4 | IBAN-Format-Prüfung in der Datenbank | Feature | **ja** | ⬜ | Constraint über regulären Ausdruck. |
| F6 | Cortal-Importe in Fremdwährung | Feature | **ja** | ⬜ | Heute verworfen mit `error-corrupt` (Sprint 9 OQ2). |
| F7 | PDF- und Excel-Import | Feature | nein | ⬜ | Als Adapter auf Anwendungsebene. |

---

### Paket 10 · Lebenszyklus-Rest

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| G1 | Aufräumen des Papierkorbs für die übrigen Entitäten | Feature | **ja** | 🟡 | Für **Karten** in v2-05 gelöst (`cleanup_expired_card_trash`, opportunistisch). Offen: Fragmente und Verknüpfungen — plus die Frage, ob eine echte Edge-Function nötig ist oder das opportunistische Muster reicht. |
| G2 | Oberfläche für den manuellen Monatsabschluss | Feature | **ja** | ⬜ | Setzt `card_monthly_states.closed_at`, das heute bewusst ungenutzt ist. |

---

### Paket 11 · Große Brocken
**Bewusst nach hinten** — alle vier werden besser, wenn die Datenbasis sauber ist.

| # | Punkt | Art | Datenbank | Stand | Bemerkung |
|---|---|---|---|---|---|
| E2 | Periodenabgrenzung (Dezember-Gehalt am 30.11. = Januar-Periode) | Feature | nein | ⬜ | |
| E1 | Rückwirkende Gehaltskorrektur mit Fairness-Ausgleich | Feature | **ja** | ⬜ | Neue Tabelle `fairness_deltas`. |
| M11 | Hell-/Dunkel-Modus | Feature | nein | ⬜ | Niedrige Priorität. Variablen-Ebene auf Basis von `src/styles/tokens.css`. |
| M8 | Chat-Fenster für Rückfragen zu allen App-Daten | Feature | nein (API-Ebene) | ⬜ | Großes Feature, eigene Phase. **Braucht ein Sicherheits- und Datenschutz-Konzept**, bevor irgendetwas gebaut wird. |

---

## 2. Hausaufgaben ohne eigenen Sprint

An einen passenden Sprint anhängen, nie als eigenen schneiden.

| # | Punkt | Stand | Bemerkung |
|---|---|---|---|
| J1 | Migrationen der Sprints 5–8 als Datei nachziehen | 🟡 | Seit v2-04 werden neue Migrationen als Datei abgelegt. Die Altbestände liegen weiterhin nur in Supabase. |
| TP-1 | Prüfwert im Übungs-DB-Runbook korrigieren | ⬜ | `supabase/test_projekt/README.md:66` nennt Juni 2026 = 4.545,32 €; gültig ist **4.589,53 €**. In der Fähigkeit `db-eingriff` vermerkt, führt also niemanden in die Irre. Beim nächsten Datenbank-Eingriff mitnehmen. |
| TP-2 | `net_estimation_brackets` der Übungs-DB befüllen | ⬜ | Seed ist dort bislang leer. Nur nötig, wenn ein Sprint die Netto-Schätzung berührt. |
| M4 | Karten-Deckkraft-Schieber in der Entwicklungsumgebung | ⬜ | Nur Entwicklung, nicht in Produktion. |
| I1 | Eigene Domain statt Vercel-Subdomain | ⬜ | |
| H1 | Vercel Coding Agent Plugin bewerten | ⬜ | |

---

## 3. Dauerhaft nicht

| # | Punkt | Warum |
|---|---|---|
| L1 | Partner-only-Karten | Oberflächen-Lärm ohne Sparraten-Relevanz. Dauerhaft außerhalb des Umfangs. |
| A2 | Oberfläche „versteckte Karten verwalten" | Hinfällig — Verbergen wurde in v2-05 ersatzlos gestrichen. |
| A3 | Bestätigungs-Dialog vor dem Verbergen | Hinfällig, gleiche Begründung. Beim Löschen übernehmen Lösch-Tor und 5-Sekunden-Rücknahme diese Rolle. |
| K2 | Git-Historie von `linked-project.json` bereinigen | Hinfällig — geprüft am 25.07.2026: die Datei taucht in keinem Commit auf. Keine Schlüssel-Rotation nötig. |

---

## 4. Erledigt

| # | Punkt | Sprint |
|---|---|---|
| Init-1 | Übungs-Datenbank aufgesetzt, Runbook in `supabase/test_projekt/` | v2-05 |
| Init-2 | Deterministischer Prüfwert 2.200,00 € definiert | v2-05 |
| Init-3 | Branch-Namenskonvention `sprint/v2-NN-<thema>` | — |
| Init-4 | Sprint-Protokoll-Tabelle in CLAUDE.md | — |
| M0 | Automatisierte Tests mit Playwright, Pixel-Prüfungen, `smoke-agent` | v2-01 / 23.07. |
| A1 | Karten-spezifische Badge-Farben aus dem Kartennamen | v2-07 |
| A4 | Papierkorb-Muster über `deleted_entities`, 60-Sekunden-Aufbewahrung | v2-05 |
| B2 | Abweichungs-Treiber `get_year_deviation_drivers` | v2-06 |
| B3 | Rot-Regel bei negativer Kumulation | v2-03 |
| B6 | Vorjahres-Linie entfällt bei datenlosem Vorjahr | v2-02 |
| C1 | Übertrags-Schalter statt Überträge in der Arbeitsfläche | v2-07 |
| C2 | Backfill-Meldung ab 50 Einträgen ohne Zahl | v2-07 |
| C3 | Rohmasse ab Februar leer — 1000-Zeilen-Grenze (→ LL-21) | v2-07 |
| H2 | Arbeitssetup professionalisiert: CLAUDE.md 1.857 → 434 Zeilen, drei Fähigkeiten, geteilte Freigaben | v2-08 |
| J2 | Typen-Regenerierung als feste Routine | — |
| K1 | Dev-Panel im Produktions-Bundle nicht enthalten (mehrfach geprüft) | — |
| M1 | Drei-Verben-Modell Beenden / Löschen / Lösen | v2-05 |
| M3 | Jahres-Welle hinter dem Ring, Popup mit kumulierter Treppe | v2-02 |
| M10 | Darstellung negativer kumulierter Sparrate | v2-02 / v2-03 |
| N1 | Rohmasse zeigte Fragmente fremder Monate | v2-01 |
| N2 | Karten-Größen-Inkonsistenz | v2-01 |
| N3 | Text-Überlauf auf langer Karte | v2-01 |
| N4 | Ring-Anzeige `+− 358,1 %` und Cap-Strategie | v2-01 / v2-03 |
| N5 | Farbtöne zwischen zugeordneten Fragmenten und Überträgen vereinheitlicht | v2-03 |

---

## 5. Kennungs-Register

Ältere Papiere nennen Themen über ihre Buchstaben-Kennung. Hier steht, wo sie heute leben.

| Kennung | Heute |
|---|---|
| A1, A4 · B2, B3, B6 · C1, C2, C3 · H2 · J2 · K1 · M0, M1, M3, M10 · N1–N5 · Init-1–4 | §4 Erledigt |
| A2, A3 · K2 · L1 | §3 Dauerhaft nicht |
| B1, B4, B5 | Paket 8 |
| D1, D2, D3 | Paket 5 |
| E1, E2 | Paket 11 |
| F1, F2, F3 | Paket 3 (unter M6 zusammengefasst) |
| F4, F6, F7 | Paket 9 |
| F5 | Paket 6 (mit M9) |
| G1, G2 | Paket 10 |
| H1, I1, J1, M4 | §2 Hausaufgaben |
| M2, M5 | Paket 4 |
| M6 | Paket 3 |
| M7 | Paket 7 |
| M8, M11 | Paket 11 |
| M9 | Paket 6 |

**Neue Kennungen seit dem 04.08.2026:** `BF-n` Befunde aus der Nutzung ·
`DA-n` Datenbasis · `TP-n` Übungs-Datenbank · `B2-F` / `A1-F` Feinschliff zu einem
erledigten Thema.

---

## 6. Wie diese Datei gepflegt wird

**Ein neues Thema** bekommt eine Zeile in dem Paket, in das es fachlich gehört —
oder ein eigenes Paket, wenn es keines gibt. Beides passiert in Phase 1 eines
Sprints, nicht nebenbei.

**Ein erledigtes Thema** wandert aus seinem Paket nach §4, mit Sprint-Nummer. Ist ein
Paket leer, verschwindet es.

**Die Zahlen in §0** werden **nachgezählt, nicht geschätzt.** Das ist schon einmal
schiefgegangen.

**Was hier nicht hineingehört:** Begründungen und Diagnosen. Die stehen in den
Papieren unter `V2/`, hier steht nur der Verweis. Diese Datei soll auf einen Blick
beantworten, was offen ist — nicht warum.

---

*Roadmap · Antigravity Finance · umgebaut am 04. August 2026 aus der
kategorien-orientierten Fassung vom 01. Juni 2026*
