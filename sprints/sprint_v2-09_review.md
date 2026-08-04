# Sprint v2-09 — Review

> **Branch** `sprint/v2-09-workflow-vereinfachung` · **Datum** 04. August 2026
> **Ausgangsstand** `main` @ `6c91ff7` · **Commits** `1a70ab8` · `0997228` · `6399e03` · `9f536f6`
> **Auftrag:** Den Sprint-Ablauf vereinfachen. Kein Eingriff in die App.
>
> **In einem Satz:** Sieben Sprint-Stufen werden drei, der Design-Direktor zieht aus
> einem eigenen Chat in eine Fähigkeit um, und die Roadmap ist nach Sprint-Paketen
> geordnet statt nach Buchstaben-Kategorien.

---

## 1. Was gebaut wurde

### Der Auslöser

Nach der Beschreibung des Ablaufs in v2-08 hat der User ihn als **zu komplex**
zurückgewiesen. Die Diagnose davor war der eigentliche Wert des Sprints: **Nicht der
Prozess ist teuer, sondern der Chat-Wechsel zum Design-Direktor.** Von sieben Stufen
kosten fünf nichts — sie laufen mit. Teuer war genau eine: Papier schreiben,
hintragen, Antwort zurückholen, einarbeiten.

### Phase 1 — Roadmap nach Sprint-Paketen (`1a70ab8`)

351 → 276 Zeilen. Oberste Ebene sind jetzt **elf Sprint-Pakete**, je mit einer Zeile
„was es entsperrt".

Die alte Ordnung war nach 14 Kategorien A–N sortiert. Niemand denkt in „M6" und
„F3" — man denkt in „bessere Zuordnung". Zusammengehöriges lag auseinander (M6 fasst
F1+F2+F3, M9 braucht F5), und um das zu verstehen, musste man einen eigenen Abschnitt
lesen. Die Sprint-Gruppierung existierte zwar, aber in einer **anderen** Tabelle als
die Themen.

**Elf Themen neu aufgenommen**, die vorher nirgends in der Roadmap standen:

| | war vorher wo |
|---|---|
| BF-1 … BF-5, die fünf Befunde vom 04.08. | nur im eigenen Papier — konkurrierten damit unsichtbar mit allem anderen |
| DA-1 Karten-Rückdatierung 2025, DA-2 Kuratierung 2026 | nur im Projekt-Gedächtnis |
| TP-1 veralteter Prüfwert, TP-2 leerer Seed | nur im Gedächtnis bzw. im v2-08-Review |
| B2-F, A1-F Feinschliff | nur im Fließtext erwähnt |

Kein zweites Dokument daneben — zwei Listen „was ist offen" wären schlimmer als eine
schlecht sortierte.

### Phase 2 — Fähigkeit `design-direktor` (`0997228`)

Ersetzt den separaten Chat. **Fähigkeit, nicht Agent** — siehe §5 AD1.

Übernimmt das bewährte Cluster-Muster aus Block 1 (Juni 2026): Fragen werden gebündelt
nach dem, was sie **gemeinsam entsperren**, nicht nach Thema. Vor jedem Cluster steht,
was hier **nicht** entschieden wird.

Enthält die fünf Grundsätze als Prüfraster (ein Screen · schmale Palette · Ruhe vor
Betonung · Werkzeug ist nicht Produkt · Ehrlichkeit vor Beruhigung) und eine Tabelle,
wann die Rolle **nicht** zuständig ist.

### Phase 3 — Fähigkeit `sprint-start`, `sprint-briefing` entfernt (`6399e03`)

Verbindliche Reihenfolge: **Nachbohren → Schneiden → Plan vorlegen → Freigabe.**

Das Nachbohren war ausdrückliche User-Forderung (grill-me, aufs Projekt angepasst).
Sechs Pflichtfragen, die immer kommen, vier Nachhak-Muster für die weichen Stellen,
und drei selten gestellte Fragen — darunter: *Was passiert, wenn wir es gar nicht
bauen?* Manchmal lautet die ehrliche Antwort „nichts Schlimmes".

Die Phase ist fertig, wenn der Sprint in **drei Sätzen** wiedergegeben werden kann
und der User bei allen dreien nickt.

**Neu gegenüber der alten Fähigkeit:** Eine Briefing-**Datei** entsteht nur noch bei
vier Kriterien (Datenbank · mehr als drei Phasen · sitzungsübergreifend · festzu-
haltende Entscheidung). Sonst reicht der freigegebene Plan. Begründung: Was über eine
Sitzung hinausreicht, muss in einer Datei stehen — ein Chat-Verlauf wird von der
nächsten Sitzung nicht gelesen.

### Phase 4 — CLAUDE.md (`9f536f6`)

434 → 500 Zeilen. Neu: der Drei-Phasen-Ablauf, die Fähigkeiten-Tabelle, der Merksatz
zur Werkzeugwahl — und zwei Regeln, die **bisher nur im Projekt-Gedächtnis außerhalb
des Repos standen**:

- **Sprachregel:** Empfehlungen in einfacher Sprache; App-Begriffe ja, Datenbank-Jargon nein.
- **Gedächtnis-Regel:** Das Projekt-Gedächtnis liegt außerhalb des Repos, ist nicht
  in git und bei einem frischen Klon nicht dabei. Es darf sagen, wo wir stehen —
  **nichts Dauerhaftes darf ausschließlich dort liegen.**

---

## 2. Prüfstrecke

Nach jeder Phase gefahren, jedes Mal grün:

| Prüfung | Ergebnis |
|---|---|
| `tsc --noEmit` | 0 Fehler |
| `npx eslint src …` | 0 / 0 |
| `pnpm build` | 0 Fehler · Route `/` **29,6 kB** · First Load **181 kB** |
| `pnpm test:visual` | **3/3** |

Bundle-Größe unverändert gegenüber `6c91ff7` — wie es bei einem reinen Prozess-Sprint
sein muss.

**Zusatzprüfungen:**
- Alle **56 alten Roadmap-Kennungen** lösen weiter auf (maschinell geprüft)
- Alle **21 Lessons Learned** weiterhin in CLAUDE.md auffindbar
- Alle **4 Fähigkeiten** und **4 Agenten** in CLAUDE.md genannt
- **Kein Verweis** mehr auf das entfernte `sprint-briefing`
- Die fünf LL-Verweise aus `sprint-briefing` (LL-12/14/15/19/20) sind in
  `sprint-start` übernommen

---

## 3. Anker vorher/nachher

**Kein Zahlenwert bewegt.** Der Sprint hat keine Datei unter `src/`, `tests/`,
`supabase/` oder die Datenbank berührt. Kein DB-Zugriff, keine Migration, kein
Übungs-DB-Tausch. Der identische Bundle-Umfang belegt, dass kein ausgeführter Code
betroffen war.

---

## 4. Selbst-Review gegen den Auftrag

| # | Kriterium | erfüllt | Beleg |
|---|---|---|---|
| A1 | Ablauf spürbar einfacher | ✅ | 7 → 3 Phasen; Berührungspunkte des Users 4 → 3 |
| A2 | Chat-Wechsel zum Design-Direktor entfällt | ✅ | Fähigkeit `design-direktor`, Dialog im selben Chat |
| A3 | Ein Dokument mit allen Features, nach Sprints gruppiert | ✅ | Roadmap, elf Pakete — **kein** zweites Dokument daneben |
| A4 | Session startet mit Nachbohren, dann Plan zur Freigabe | ✅ | `sprint-start`, Phasen ① bis ④ |
| A5 | grill-me integriert, aufs Projekt angepasst | ✅ | 6 Pflichtfragen + 4 Nachhak-Muster + 3 Zusatzfragen |
| A6 | Anzahl Werkzeuge wächst nicht unnötig | ✅ | Agenten 4 → 4, Fähigkeiten 3 → 4 (eine kam, eine ging) |
| A7 | Nichts unter `src/`, `tests/`, `supabase/` geändert | ✅ | Bundle identisch |
| A8 | Keine Regel verloren | ✅ | 21 LL vollständig, 56 Kennungen auflösbar |
| A9 | Prüfstrecke nach jeder Phase | ✅ | §2 |

---

## 5. Architektur-Entscheidungen

**AD1 — `design-direktor` ist eine Fähigkeit, kein Agent.** *Korrektur nach
User-Einwand.* Mein erster Vorschlag war ein Agent. Der Einwand: Bei Gestaltung muss
man sagen können, **was** und **warum** etwas nicht passt — das braucht Dialog.

Technisch **könnte** ein Agent fortgesetzt werden. Aber jede Runde liefe über den
Hauptchat als Übersetzer. Bei einer Zahl ist das harmlos, bei Gestaltung ist die
Nuance die ganze Aussage: „zu laut" müsste in einen Auftragstext übersetzt werden,
und was gemeint war, ginge verloren — bemerkt erst am zweiten enttäuschenden Entwurf.
Zudem wäre es der Chat-Wechsel in klein, also genau das zu lösende Problem.

Daraus wurde ein Merksatz in CLAUDE.md §4: **Muss ich mit dem Ding reden können, ist
es nie ein Subagent.**

**AD2 — Kein Agent „Daten-Architekt", obwohl vorgeschlagen.** Migrations-Entwurf ist
Konstruktion, keine Zweitmeinung — wer sie anwendet, muss sie ganz verstanden haben,
sonst ist eine unerwartet wandernde Anker-Zahl nicht mehr diagnostizierbar. Das
Verfahren deckt `db-eingriff` bereits ab, und v2-05 wie v2-06 liefen mit dem
Hauptchat als Architekt sauber. **Was das kippen würde:** häufige, große Migrationen —
dann lohnt ein *Prüfer*, der einen Entwurf gegenliest. Das ist Kontrolle, nicht
Konstruktion, und eine andere Rolle.

**AD3 — Die Roadmap wird umgebaut, nicht ergänzt.** Ein zweites Feature-Dokument
neben der bestehenden Roadmap wäre die naheliegende Umsetzung der User-Idee gewesen.
Zwei Listen „was ist offen" laufen aber garantiert auseinander. Der Umbau kostet mehr
und ist die einzige Variante, die in einem Jahr noch stimmt.

**AD4 — Die Buchstaben-Kennungen bleiben.** Sie sind nicht mehr die Ordnung, aber 56
von ihnen werden in bestehenden Papieren zitiert. §5 der Roadmap löst jede auf ihr
heutiges Paket auf.

---

## 6. Offene Punkte

**F1 — Der Ablauf ist ungetestet.** `sprint-start` und `design-direktor` sind
geschrieben, aber noch nie gefahren. Der erste echte Durchlauf ist Paket 1 (die fünf
Befunde). Erwartung: Das Nachbohren wird sich beim ersten Mal zäh anfühlen — genau
dann zeigt sich, ob die Fragen die richtigen sind.

**F2 — CLAUDE.md ist auf 500 Zeilen gewachsen.** Der Zuwachs ist Inhalt, nicht
Ballast, und gegenüber den 1.857 vor v2-08 unkritisch. Trotzdem gilt: Jede weitere
Ergänzung muss sich rechtfertigen. Bei etwa 600 Zeilen wäre erneut zu prüfen, was
nach unten wandern kann.

**F3 — TP-1 weiterhin offen.** Der veraltete Prüfwert in
`supabase/test_projekt/README.md:66`. Steht jetzt als Hausaufgabe in der Roadmap und
ist in `db-eingriff` vermerkt.

---

## 7. Vorschläge für CLAUDE.md und Roadmap

Beides ist in diesem Sprint bereits nachgezogen. Roadmap: neue Zeile **WF-1** in §4
Erledigt, Zahl der erledigten Themen 24 → 25.

Ein Vorschlag bleibt: **Nach dem ersten echten Durchlauf von `sprint-start` prüfen,
ob die sechs Pflichtfragen die richtigen sind.** Fragen, die dreimal hintereinander
nichts zutage fördern, gehören gestrichen — sonst werden sie zur Formalie, die man
überspringt.
