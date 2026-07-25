# Sprint v2-07 — „Rohmasse aufräumen"

**Datum:** 25. Juli 2026
**Branch:** `sprint/v2-07-rohmasse-aufraeumen`
**Rolle:** Zentraler Arbeits-Agent (PM + Architekt)
**Vorgänger:** Sprint v2-06 (B2 Abweichungs-Treiber), `main` @ `82c8a32`

---

## 0. Auftrag und Einordnung

Drei Punkte aus `V2/v2_roadmap_konsolidiert.md`, gemeinsam geschnitten als
Teil-Umsetzung des dort vorgeschlagenen „Kleinkram-Sammelsprints" (Rang 3):

| # | Roadmap-Punkt | Kategorie | Herkunft |
|---|---|---|---|
| **C1** | `INTERNAL_TRANSFER`-Fragmente aus dem Stack ausblenden | Transfer-System | Sprint 9 V8'' |
| **C2** | Backfill-Toast bei hohem Zähler sprachlich entschärfen | Transfer-System | Sprint 9 V9'' |
| **A1** | Karten-spezifische Badge-Farben | Karten-System | Sprint 8 OQ1 / V2-C / V3'' |

**Warum jetzt:** Der Bestand führt (verifiziert am 25.07.2026, lesende Abfrage
gegen Prod) **363 `INTERNAL_TRANSFER`** und **31 `ASSET_REALLOCATION`**
Fragmente. Pro Monat des Jahres 2026 sind das 20–36 Übertrags-Fragmente bei
42–56 offenen — rund **ein Drittel der Rohmasse besteht aus Bewegungen, die
nie einer Karte zugeordnet werden können**. Sie liegen seit Sprint 9 gedimmt,
aber vollständig, im Stack und verlängern jede Kuratierungs-Sitzung. Die
Kuratierung ist laut Roadmap-Abschnitt 0.1 der aktuelle Engpass, an dem
Treiber-Qualität (B2) und Sparraten-Genauigkeit hängen.

### Ausdrücklich NICHT im Scope

- **M5** (Kartenreihenfolge Budget → Fixkosten → Einnahmen) — gehört in die
  Design-Direktor-Runde, ist dort als offener Punkt geführt (Roadmap §17).
- **E4** (Rohmasse-Pseudo-Treiber „n € unzugeordnet in M") — bewusst offener
  DD-Punkt seit v2-06.
- Jede Form von Schema-Eingriff, Migration oder Datenbank-Schreibzugriff.
- Die finale DD-Geste für `ASSET_REALLOCATION` (Interim-Button aus v2-04 bleibt
  unverändert stehen).

---

## 1. Rahmenbedingungen

1. **Reiner Frontend-Sprint.** Keine Migration, kein Schema-Eingriff, kein
   Datenbank-Schreibzugriff. Der Projekt-Slot-Tausch mit der Übungs-DB entfällt
   deshalb; **„Rennrad-Trainer" bleibt unangetastet.**
2. Die Produktiv-Datenbank enthält echte Finanzdaten. **Lesende** Abfragen zur
   Verifikation sind zulässig, schreibende nicht.
3. Design-Doku §8 ist für die Rohmasse maßgeblich; §11 für das Badge.
4. Die **Status-Hierarchie aus Sprint 9** (Transfer schlägt „zugeordnet" und
   schlägt KI-Vorschlag) darf nicht kippen.
5. Die **Header-Flanke** („N Fragmente offen") muss weiterhin exakt dasselbe
   zählen wie vor dem Sprint.
6. CLAUDE.md §7 Regel 3: nicht spezifizierte Zustände werden nicht erfunden.
   Die drei offenen Punkte dieses Sprints sind am 25.07.2026 vom User
   entschieden worden (Abschnitt 2).
7. Merge nach `main` ist **nicht** Teil dieses Sprints (menschliches Gate,
   Zwei-Personen-Prinzip). Siehe Abschnitt 8.

---

## 2. User-Entscheide vom 25.07.2026

Drei Spec-Lücken waren vor Implementierungsbeginn zu schließen. Vorgelegt mit
Empfehlung, alle drei wie empfohlen entschieden:

| # | Frage | Entscheid |
|---|---|---|
| **E1** | C1 — Anzeige der Anzahl versteckter Überträge? | **Ja, Zahl am Schalter.** Ohne die Zahl ist „keine Überträge vorhanden" nicht von „Überträge versteckt" unterscheidbar; nach einem Import bliebe unsichtbar, dass Überträge dabei waren. |
| **E2** | A1 — Breite der Farbpalette? | **Sechs gedeckte Farbtöne.** Genug Trennschärfe zwischen Vorschlägen, ohne die Rohmasse bunt zu machen. Türkis und Rot bleiben ausgespart — sie sind in der App Statusfarben („bezahlt" / „überschritten"). |
| **E3** | C2 — Wortlaut bei hohem Zähler? | **„Bestehende Fragmente nachgepflegt"** ab Schwelle, ohne Zahl. Betrifft **nur** die IBAN-Backfill-Zeile; die drei übrigen Zeilen behalten Wortlaut und Zahl, weil dort die Zahl inhaltlich relevant ist. |

**Grundsatz-Entscheid des Auftrags (nicht neu verhandelt):** C1 wird als
**Schalter „Überträge anzeigen" (Standard: aus)** umgesetzt, **kein eigener
Reiter.**

---

## 3. Punkt C1 — Überträge raus aus der Arbeitsfläche

### 3.1 Fachliche Regel

Der Fragment-Stack ist die **Arbeitsfläche** der Kuratierung. Ein Fragment mit
gesetztem `transfer_type` (Status `INTERNAL_TRANSFER` **oder**
`ASSET_REALLOCATION`) kann per Daten-Invariante nie einer Karte zugeordnet
werden (Trigger `trg_oqb_no_transfer_links`, Schema-Doku). Es gehört damit
nicht auf die Arbeitsfläche, sondern hinter einen Schalter.

Beide Typen werden von **einem** Schalter erfasst. Begründung: sie verhalten
sich in allen Berechnungs- und Verlinkungs-Pfaden identisch (Semantik-Invariante
v2-04) und sind für den Kuratierungs-Blick dieselbe Kategorie — „Geld, das ich
mir selbst überwiesen habe". Die begriffliche Trennung bleibt in der DB
erhalten und ist über das Badge weiterhin sichtbar, sobald der Schalter an ist.

### 3.2 Ort und Verhalten

- Der Schalter sitzt in der Fragment-Spalte **unter der Zonen-Überschrift
  „ROHMASSE"**, oberhalb der Liste.
- Beschriftung: `Überträge anzeigen` plus die Anzahl der Übertrags-Fragmente
  **des angezeigten Monats** in Klammern.
- Die Zahl beschreibt den Bestand des Monats, nicht die Schalterstellung — sie
  ist in beiden Stellungen dieselbe.
- Der Schalter wird nur gerendert, wenn der angezeigte Monat mindestens ein
  Übertrags-Fragment enthält. Sonst wäre er reines Rauschen.
- Umlegen wirkt sofort und rein clientseitig — **kein** Server-Roundtrip, kein
  URL-Parameter, kein Neuladen.
- Die Stellung überlebt einen **Monatswechsel** innerhalb der Sitzung. Das ist
  eine bewusste Abweichung vom LL-5-Reset-Muster: LL-5 verlangt einen Reset für
  Client-State, der *monatsspezifisch* ist. Eine Ansichts-Vorliebe ist das
  nicht — wer Überträge sehen will, will sie auch im Nachbarmonat sehen. Ein
  Neuladen der Seite setzt auf „aus" zurück.
- Keine `localStorage`-Persistierung (CLAUDE.md §7 „Was Claude Code NIE macht").

### 3.3 Was unberührt bleibt

| Bereich | Warum unberührt |
|---|---|
| Header-Flanke „N Fragmente offen" | Zählt server-seitig `status = 'UNASSIGNED'` im Vormonat. Überträge tragen den Status `INTERNAL_TRANSFER`/`ASSET_REALLOCATION` (Sprint-9-Prioritätsregel der View) und wurden dort **nie** mitgezählt. Die Abfrage in `page.tsx` wird nicht angefasst. |
| Karussell / Drop-Ziele / Empty-Slot | Erhalten weiterhin die **ungefilterte** Monatsliste. Der Filter greift ausschließlich in der Stack-Darstellung. |
| Sortierung (§8, Sprint 8 P5) | Ein Filter ändert keine Reihenfolge. Bei eingeschaltetem Schalter stehen die Überträge exakt dort, wo sie heute stehen. |
| Darstellung sichtbarer Überträge | Opacity 0.45, Badge „Transfer" Grau-Soft, kein Drag, kein Tap — unverändert (§8 Sprint 9 + N5). |
| Sparraten-Berechnung | Liest `card_fragment_links`, nicht den Stack. Kein Rechenpfad wird berührt. |
| Interim-Button „Umschichtung" (v2-04) | Bleibt unverändert auf der Fragment-Karte. |

### 3.4 Bewusst akzeptierte Folge

Wird ein Fragment über den Interim-Button als Umschichtung markiert, während
der Schalter **aus** steht, verschwindet es unmittelbar aus dem Stack. Das ist
die gewünschte Wirkung („raus aus der Arbeitsfläche"). Die Rücknahme der
Markierung ist folgerichtig nur bei eingeschaltetem Schalter erreichbar. Kein
Bug, kein Sonderfall — wird im Review festgehalten.

### 3.5 Akzeptanzkriterien C1 *(regelbasiert, LL-19)*

- **AC-C1.1** Im Standardzustand zeigt der Stack ausschließlich Fragmente,
  deren Status **weder** `INTERNAL_TRANSFER` **noch** `ASSET_REALLOCATION` ist.
  Die Regel gilt für jeden Monat, unabhängig von der konkreten Anzahl.
- **AC-C1.2** Der Schalter wird genau dann gerendert, wenn der angezeigte Monat
  mindestens ein Übertrags-Fragment enthält.
- **AC-C1.3** Die am Schalter gezeigte Zahl entspricht exakt der Anzahl der
  Übertrags-Fragmente des angezeigten Monats (beide Typen zusammen) und ist
  von der Schalterstellung unabhängig.
- **AC-C1.4** Bei eingeschaltetem Schalter entspricht die Liste — Inhalt **und**
  Reihenfolge — exakt der Liste vor dem Sprint.
- **AC-C1.5** Ein sichtbares Übertrags-Fragment behält Opacity 0.45, das
  Grau-Soft-Badge „Transfer", `draggable=false` und `pointer-events:none`. Die
  Sprint-9-Status-Hierarchie (Transfer schlägt „zugeordnet" und KI-Vorschlag)
  bleibt in Kraft.
- **AC-C1.6** Die Header-Flanke liefert für jeden Monat denselben Wert wie vor
  dem Sprint; die zugrundeliegende Abfrage ist unverändert.
- **AC-C1.7** Das Karussell erhält weiterhin die ungefilterte Monatsliste; das
  Drop-Verhalten ist unverändert.
- **AC-C1.8** Die Schalterstellung überlebt einen Monatswechsel; ein Neuladen
  der Seite setzt sie auf „aus".
- **AC-C1.9** Das Umlegen löst keinen Server-Roundtrip und keine Navigation aus.

---

## 4. Punkt C2 — Backfill-Toast entschärfen

### 4.1 Problem

Nach einem Re-Import über den bestehenden Bestand meldet die Import-Quittung
Zeilen wie `544 Fragmente mit IBAN ergänzt`. Fachlich korrekt, in der Wirkung
irreführend: die Zahl legt ein großes Ereignis nahe, während tatsächlich nur
ein Feld nachgetragen wurde, das den Berechnungen gleichgültig ist. Sprint 9
hat das als V9'' vermerkt.

### 4.2 Regel

- Unterhalb der Schwelle: Zeile unverändert `N Fragmente mit IBAN ergänzt`.
- Ab der Schwelle: `Bestehende Fragmente nachgepflegt` — **ohne** Zahl.
- Schwelle: **50**. Als benannte Modul-Konstante mit Begründungs-Kommentar.
  **Bewusst nicht in `app_config`:** CLAUDE.md §7 Regel 5 schützt Schwellen,
  die auch die DB-Logik kennt (Konfidenz, Auto-Absorb). Hier gibt es kein
  DB-Gegenstück — es ist reine Anzeige-Sprache ohne Rechenwirkung. Eine
  `app_config`-Zeile würde eine Kopplung vortäuschen, die nicht existiert.
- Die exakte Zahl bleibt in der Entwickler-Konsole erhalten.

### 4.3 Akzeptanzkriterien C2 *(regelbasiert)*

- **AC-C2.1** Liegt der IBAN-Backfill-Zähler unter der Schwelle, ist die Zeile
  wortgleich mit dem Stand vor dem Sprint, inklusive Zahl.
- **AC-C2.2** Erreicht oder überschreitet er die Schwelle, lautet die Zeile
  `Bestehende Fragmente nachgepflegt` und enthält keine Zahl.
- **AC-C2.3** Die drei übrigen Zeilen (Transfer erkannt / Karten-Zuordnungen
  gelöst / vorgemerkte Umsätze übersprungen) sind in Wortlaut **und** Zahl
  unverändert — unabhängig von ihrer Höhe.
- **AC-C2.4** Die Regel „nur Zähler > 0 erzeugen eine Zeile" gilt unverändert;
  bei Zähler 0 erscheint keine IBAN-Zeile.
- **AC-C2.5** Sind alle Zähler 0, erscheint gar kein Toast.
- **AC-C2.6** Die exakte Zahl bleibt in der Entwickler-Konsole nachvollziehbar.

---

## 5. Punkt A1 — Karten-spezifische Badge-Farben

### 5.1 Problem

Das Badge `KI-Vorschlag: [Kartenname]` trägt seit Sprint 8 für **alle** Karten
denselben Gold-Ton (OQ1-Entscheid: generisch, karten-spezifische Farben als
V2 vorgemerkt). Bei einem Stack mit 40–60 Fragmenten und mehreren
Vorschlags-Karten ist auf einen Blick nicht erkennbar, welche Vorschläge
zusammengehören — der Kartenname muss jedes Mal gelesen werden.

### 5.2 Regel

- Der **Kartenname** bestimmt die Farbe, über eine deterministische Funktion
  auf sechs Farbtöne. Kein Zufall, keine Reihenfolgen-Abhängigkeit, **keine
  neue Spalte** im Datenmodell (Auftragsvorgabe).
- Normalisierung vor der Berechnung: umgebende Leerzeichen entfernen,
  Kleinschreibung. Damit ändert eine Umbenennung „Netflix" → „netflix" die
  Farbe nicht.
- Die sechs Farbtöne liegen als Tokens in `src/styles/tokens.css` und werden
  mit den **bestehenden** Deckkraft-Stufen des Badges komponiert
  (.08 Hintergrund / .5 Text / .15 Rahmen). Damit ändert sich ausschließlich
  der Farbton, nicht Helligkeit, Typografie oder Geometrie.
- Palette (gedeckt, dunkler Hintergrund): **Gold** (der heutige Ton, bleibt
  erhalten) · **Orange** · **Oliv** · **Blau** · **Violett** · **Magenta**.
  Türkis und Rot sind ausgespart — sie tragen in der App Statusbedeutung.
- Das **TRANSFER-Badge bleibt ausgenommen** und behält seinen Grau-Soft-Ton
  (AD5 Sprint 9: Transfer ist Fakt, kein Vorschlag).

### 5.3 Bewusst akzeptierte Folge

Bei rund 31 aktiven Karten teilen sich mehrere Karten einen Farbton. Das ist
gewollt: die Farbe ist ein **Gruppierungs-Hinweis**, kein Identitätsmerkmal —
der Kartenname steht daneben. Mehr Farbtöne würden bei dieser geringen
Deckkraft ununterscheidbar (User-Entscheid E2).

### 5.4 Akzeptanzkriterien A1 *(regelbasiert)*

- **AC-A1.1** Vorder-, Hintergrund- und Rahmenfarbe des KI-Vorschlag-Badges
  stammen aus genau einem von sechs Farb-Tokens in `tokens.css`. In
  Komponenten-CSS und TSX steht kein Hex-/RGBA-Literal für diese Farben
  (CLAUDE.md §7 Regel 4).
- **AC-A1.2** Die Zuordnung ist deterministisch: derselbe Kartenname ergibt in
  jedem Render, jeder Sitzung und auf jedem Gerät denselben Farbton. Sie hängt
  weder von der Anzahl oder Reihenfolge der Karten noch von der
  Fragment-Sortierung ab.
- **AC-A1.3** Groß-/Kleinschreibung und umgebende Leerzeichen im Kartennamen
  ändern den Farbton nicht.
- **AC-A1.4** Es wird keine Datenbank-Spalte gelesen oder geschrieben, die
  heute nicht existiert. Kein Schema-Eingriff.
- **AC-A1.5** Deckkraft-Stufen, Typografie und Geometrie des Badges bleiben
  exakt wie in §11 spezifiziert; es ändert sich ausschließlich der Farbton.
- **AC-A1.6** Das TRANSFER-Badge ist vom Mapping ausgenommen und behält den
  Grau-Soft-Ton.
- **AC-A1.7** Keiner der sechs Töne ist Türkis oder Rot.
- **AC-A1.8** Fragmente ohne aufgelösten Vorschlag zeigen weiterhin kein Badge;
  das server-seitige Schwellen-Gating (LL-17) bleibt unverändert.

---

## 6. Sprint-übergreifende Akzeptanzkriterien

- **AC-G1** Nach **jeder** Phase: `tsc --noEmit` 0 Fehler · Lint 0 Befunde ·
  `pnpm build` 0 Fehler/0 Warnungen · `pnpm test:visual` 3/3.
- **AC-G2** Im gesamten Sprint: keine Migration, keine Schema-Änderung, kein
  Datenbank-Schreibzugriff.
- **AC-G3** Kein Rechenpfad wird berührt: keine Änderung an `src/lib/rpc.ts`,
  `src/components/welle/`, `src/components/singularity-ring/` oder an den
  Sparrate-Aufrufen in `page.tsx`. Die Prod-Anker (2026: 1.931,18 € · Mai
  −86,77 € · Juni 4.589,53 €) bleiben damit **per Konstruktion** unverändert.
- **AC-G4** Ein Commit pro Phase (LL-14), Phase N+1 startet erst nach grüner
  Prüfstrecke von Phase N.
- **AC-G5** Doku patch-basiert (LL-16): Claude Code editiert Design- und
  Schema-Doku nicht selbst, sondern liefert
  `sprints/sprint_v2-07_doku_patches.md`.

---

## 7. Phasenplan

| Phase | Inhalt | Commit-Präfix |
|---|---|---|
| **P1** | C1 — Schalter „Überträge anzeigen" im Fragment-Stack | `sprint-v2-07 p1:` |
| **P2** | C2 — Backfill-Toast-Wortlaut ab Schwelle | `sprint-v2-07 p2:` |
| **P3** | A1 — sechs Badge-Farbtöne + deterministisches Mapping | `sprint-v2-07 p3:` |
| **P4** | Doku-Patch-Datei, Review, Roadmap-Stand | `docs:` |

### Erwartete Berührungsfläche

```
src/styles/tokens.css                                  P3
src/components/interaction-zone/fragment-stack.tsx     P1
src/components/interaction-zone/fragment-card.tsx      P3
src/components/interaction-zone/badge-hue.ts     (NEU) P3
src/components/interaction-zone/interaction-zone.module.css  P1, P3
src/components/interaction-zone/portal.tsx             P2
```

`src/app/page.tsx` wird **nicht** angefasst — das hält AC-C1.6 (Header-Flanke)
und AC-G3 (Rechenpfade) per Konstruktion ein.

---

## 8. Verifikationsplan

**Deterministisch (Claude Code):**
1. Prüfstrecke nach jeder Phase (AC-G1).
2. `pnpm test:visual` — die §9-Pixel-Checks sind der Regressions-Wächter für
   die Welle; dieser Sprint darf sie nicht bewegen.
3. Gezielte Belege für die Kern-Regeln: Filter-Regel, Zähl-Regel,
   Determinismus und Kollisionsverteilung des Farb-Mappings gegen die echten
   Kartennamen (lesende Abfrage), Toast-Zeilen an der Schwelle.
4. Lesende Kontrollabfrage: Header-Flanken-Zahl je Monat vor/nach — muss
   identisch sein.

**Nicht durch Claude Code ersetzbar:**
Der Browser-Smoke des Users bleibt Prod-Gate. Dieser Sprint ist rein visuell
und interaktiv, ein Sicht-Test ist hier besonders aussagekräftig
(Schalter-Verhalten, Farbwirkung der Palette im echten Stack).

**Merge nach `main`:** nicht Teil dieses Sprints. Der Branch wird gepusht und
zur Sichtprüfung übergeben (Zwei-Personen-Prinzip, CLAUDE.md §4
V2-Git-Workflow).

---

## 9. Doku-Folgearbeiten (P4)

| Doku | Stelle | Inhalt |
|---|---|---|
| Design-Doku §8 | Fragment-Stack | Neue Regel: Übertrags-Fragmente hinter Schalter, Standard aus, Zähler am Schalter, Sortier- und Darstellungs-Invarianz |
| Design-Doku §8 | Backfill-Report-Toast | Schwellen-Regel für die IBAN-Zeile |
| Design-Doku §11 | Visuelle Spezifikation / OQ1 | Badge-Farbe karten-spezifisch statt generisch; OQ1 damit geschlossen |
| Design-Doku §3 | Token-Tabelle | Sechs neue Badge-Farb-Tokens |
| `V2/v2_roadmap_konsolidiert.md` | C1, C2, A1 + Abschnitte 0.1 / 19 | Stand auf ✅ (v2-07), Statistik nachziehen |
| CLAUDE.md | §4 Sprint-Tabelle V2, §10 | Vorschlag im Review, Anwendung durch den PM-Lauf |

Schema-Doku: **kein Patch nötig** — der Sprint fasst das Schema nicht an.

---

## 10. Offene Punkte nach diesem Sprint

- **DD-Feinschliff Palette:** die sechs Farbtöne sind eine begründete Wahl,
  keine Design-Direktor-Entscheidung. Sollte der DD andere Töne wollen, ist das
  ein Token-Tausch in `tokens.css` ohne Code-Änderung.
- **DD-Feinschliff Schalter-Sprache:** „Überträge anzeigen" ist gesetzt; ob der
  DD eine andere Formulierung oder eine andere Geste (z. B. Zonen-Kopfzeile mit
  Filter-Chips) will, bleibt offen.
- Unverändert offen aus früheren Sprints: M2- und B2-Feinschliff (DD),
  Karten-Rückdatierung 2025, M5, E4.

---

*Sprint v2-07 Briefing · Antigravity Finance · 25. Juli 2026*
