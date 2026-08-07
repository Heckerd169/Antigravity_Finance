# Sprint v2-16 — Review

> **Branch:** `sprint/v2-16-schaufenster-konsequenz` · **Commits:** `02fe566` (P1) ·
> `c0310bc` (P2) · `docs:` (P3) · **Datum:** 07. August 2026
>
> **In einem Satz:** Eine Buchung in der Rohmasse lässt sich jetzt anklicken und zeigt,
> wer das Geld bekommen hat (`RM-2`); und nach einer Gehaltsänderung sagt das
> Einkommens-Popup, was sie kostet (`PA-1`) — beides reine Anzeige, kein
> Datenbank-Eingriff, kein Zahlenwert der Sparrate bewegt.

---

## 1. Was gebaut wurde

### Phase 1 · `RM-2` — das Schaufenster-Popup (`02fe566`)

**Absicht.** `RM-1` hat der Fragment-Karte in v2-10 den Empfänger genommen — sie zeigt
seither den Verwendungszweck. Der Empfänger war damit **nirgends mehr sichtbar**. Das
Popup ist die Gegenleistung dafür und beantwortet genau die Frage, mit der man klickt:
*wer war das?*

**Lösungsweg.** Ein reines Anzeige-Popup ohne Knöpfe (§11). Datum in der Kopfzeile,
Empfänger als Hauptzeile mit dem Betrag rechts daneben, Verwendungszweck ungekürzt
darunter, unter dem Strich die Rangfolge *erst was immer gilt, dann was den Zustand
erklärt, dann was selten vorkommt*.

**Die aufgehobene Regel — und was daran nicht aufgehoben ist.** Zugeordnete Fragmente
und Überträge waren per `pointer-events: none` tot gestellt. Diese eine Zeile trug
**dreierlei zugleich**: Klick-Sperre, Drag-Sperre und die Unterdrückung der
Hover-Rückmeldung. Aufgehoben ist ausschließlich das Erste:

| Was | Danach | Träger |
|---|---|---|
| **Klick** | offen — jedes Fragment öffnet das Popup | `onClick`-Delegation im Stack |
| **Drag** | weiterhin gesperrt | `draggable={false}` + Check in `handleDragStart` — **eigenständig**, nicht mehr aus `pointer-events` folgend |
| **Hover/Active** | weiterhin unterdrückt | eigene CSS-Regeln (siehe §5.1) |
| **Verlinkbarkeit** | unverändert unmöglich | Trigger `trg_oqb_no_transfer_links`, unberührt |

*Klickbar ≠ ziehbar ≠ verlinkbar.*

**Berührte Dateien:**
`interaction-zone/fragment-showcase-overlay.tsx` (neu) ·
`interaction-zone/fragment-showcase.ts` (neu, die Textregeln) ·
`interaction-zone/fragment-stack.tsx` (Klick-Delegation, LL-5-Reset) ·
`interaction-zone/interaction-zone.types.ts` (vier neue Felder) ·
`interaction-zone/interaction-zone.module.css` · `app/page.tsx` (`counterparty_iban`,
Kartennamen-Auflösung, Prozentwert) · `tests/e2e/fragment-showcase.spec.ts` (neu, 11
Prüfungen) · `playwright.config.ts`.

### Phase 2 · `PA-1` — die Konsequenz-Anzeige (`c0310bc`)

**Absicht.** Bis hierher schloss das Popup nach „Übernehmen" wortlos. Dass eine
Gehaltsänderung den eigenen Anteil an vier gemeinsamen Posten verschiebt — und damit
die Sparrate —, erfuhr man nirgends.

**Lösungsweg.** Derselbe Rahmen, neuer Inhalt (§10). Held ist die **Summe**, nicht die
Liste; die Tabelle darunter belegt sie nur. Ein Knopf: `Schließen`.

**Was die Liste zeigt (§4.5-Rahmung).** Den künftigen **Plan-Anteil** — praktisch: auf
welchen Betrag ein Dauerauftrag zu stellen ist. Basis ist deshalb
`get_effective_plan_for_month` (Roh-Soll, ungesplittet) und **nicht**
`calculate_card_amount_for_month`: Die trägt den Anteil seit v2-13 bereits in sich
(§6 Stolperfalle 11) — sie zu nehmen und den Faktor erneut anzuwenden wäre exakt der
Doppel-Abzug, gegen den `BF-4` geschrieben wurde. Beide Split-Faktoren kommen echt aus
`get_split_factor`, vor und nach dem UPSERT, statt aus dem Brutto nachgerechnet zu
werden (LL-22).

**Mitgenommener Altbestand.** Das Einkommens-Popup hat einen **Escape-Handler**
bekommen — es war als einziges von acht Overlays ohne
(`sprint_v2-10_offene_fragen.md` §6, offen seit Sprint 1). Das neue Schaufenster hat
seinen von Anfang an.

**Berührte Dateien:**
`income-split/consequence.ts` (neu, die Rechnung) · `income-split/actions.ts` ·
`income-split/index.tsx` (zweiter Zustand, Escape) · `income-split/income-split.types.ts` ·
`income-split/income-split.module.css` (400 px, Tabellen-Styles) ·
`tests/e2e/consequence.spec.ts` (neu, 12 Prüfungen) · `playwright.config.ts`.

---

## 2. Prüfstrecke

| Schritt | Ergebnis |
|---|---|
| `tsc --noEmit` | **0 Fehler** |
| ESLint (`--no-eslintrc`-Variante) | **0 Fehler / 0 Warnungen** |
| `pnpm build` | **0 Fehler** · Route `/` **31,6 kB** · First Load JS **183 kB** |
| `pnpm test:visual` | **48/48** |
| `pnpm test:e2e` | **55/55**, inkl. `render-smoke` 4/4 |

**Bundle:** +1,0 kB auf der Route, +1 kB First Load gegenüber v2-15 (30,6 / 182 kB).
Zwei neue Overlays plus zwei Regel-Module — der Zuwachs ist plausibel.

**Pixel-Checks 25 → 48.** Die 23 neuen sind die beiden Regressions-Wächter dieses
Sprints (11 + 12). Beide laufen gegen synthetische Werte, ohne Zugangsdaten und ohne
Live-Daten.

> **Der `LL-6`-Regressionswächter ist grün geblieben** —
> `render-smoke.spec.ts:58` („einkommens-popup: klick darin öffnet nicht die
> jahres-welle"). Er war in diesem Sprint doppelt relevant: `PA-1` fasst genau das
> Popup an, dessen Portal-Umbau ihn 2026 nötig gemacht hat, und `RM-2` bringt ein
> **weiteres** Portal-Kind hinzu. Zur strukturellen Lage siehe §5.2.

---

## 3. Anker vorher/nachher

Gemessen am 07.08.2026 gegen `nflkobdfdhncrtjncpmq`, **nur `SELECT`**, Ist **und**
Plan, alle zwölf Monate — vor Beginn und nach Abschluss beider Phasen.

| Monat 2026 | Ist vorher | Ist nachher | Plan vorher | Plan nachher |
|---|---:|---:|---:|---:|
| Januar | 1.931,18 | 1.931,18 | 1.931,18 | 1.931,18 |
| Februar | 1.931,18 | 1.931,18 | 1.931,18 | 1.931,18 |
| März | 1.931,18 | 1.931,18 | 1.931,18 | 1.931,18 |
| April | 1.931,18 | 1.931,18 | 1.931,18 | 1.931,18 |
| Mai | −86,77 | −86,77 | −86,77 | −86,77 |
| Juni | 4.208,76 | 4.208,76 | 4.220,53 | 4.220,53 |
| Juli | −322,75 | −322,75 | 55,44 | 55,44 |
| August | 1.761,08 | 1.761,08 | 1.761,08 | 1.761,08 |
| September–Dezember | 1.824,08 | 1.824,08 | 1.824,08 | 1.824,08 |

**Abweichung in allen zwölf Monaten: 0,00 €**, auf beiden Seiten. Das ist bei einem
reinen Darstellungs-Sprint das erwartete Ergebnis und zugleich das vollständige.
Die Ist-Werte decken sich exakt mit `CLAUDE.md` §9.

**Kein Datenbank-Eingriff.** Keine Migration, keine geänderte RPC, kein mutierender
Testlauf. Die Fähigkeit `db-eingriff` wurde nicht gebraucht, die Übungs-Datenbank
blieb pausiert.

---

## 4. Selbst-Review gegen die Akzeptanzkriterien

| # | Kriterium | erfüllt | Beleg |
|---|---|---|---|
| A1 | Klick auf **jedes** Fragment öffnet das Popup — auch zugeordnet, auch Übertrag | ✅ | `fragment-stack.tsx:handleClick`, keine Zustands-Bedingung |
| A2 | Hauptzeile = Empfänger (erster `\|`-Teil), Betrag rechts daneben | ✅ | `fragment-showcase.ts:splitDescription`, Test „DKB Giro" |
| A3 | Ohne Trennzeichen: ganzer Text in der Hauptzeile, Zweck-Zeile **entfällt** | ✅ | Test „DKB Visa"; `purpose === null` rendert die Zeile gar nicht |
| A4 | Datum in der Kopfzeile, Verwendungszweck ungekürzt | ✅ | `showcaseKicker`; `.showcasePurpose` ohne `ellipsis` |
| A5 | Rangfolge: Status/Karte → Gegenkonto (nur Übertrag) → Vorschlag (nur unzugeordnet) | ✅ | Render-Reihenfolge `fragment-showcase-overlay.tsx` |
| A6 | Duplikat-Hash und Import-Zeitpunkt erscheinen **nicht** | ✅ | keine Referenz auf `hash`/`importedAt` in der Komponente |
| A7 | Drag-Sperre bleibt, mit eigenem Träger | ✅ | `draggable={!isLocked && !isTransfer}` + `handleDragStart`-Check; §1-Tabelle |
| A8 | Deckkraft-Werte 0.22 / 0.45 unverändert, auch bei Hover | ✅ | `.fragmentCardLocked:hover` / `.fragmentCardTransfer:hover` setzen sie explizit |
| A9 | Beide Popups haben einen Escape-Handler | ✅ | `fragment-showcase-overlay.tsx:52`, `income-split/index.tsx:62` |
| A10 | Nach dem Speichern tauscht das Popup den Inhalt, Held = Summe | ✅ | `ConsequenceView`, `consequenceHero` |
| A11 | Spalten `Bisher / Künftig / Diff.` + Summenzeile, ein Knopf `Schließen` | ✅ | `consequenceHead`, `consequenceSum`, `actions` |
| A12 | Leerer Fall: speichern und schließen wie bisher, keine Null-Zeile | ✅ | `isEmptyConsequence`, drei Tests |
| A13 | Gemeinsame **Einnahmen** zählen in derselben Liste, mit ihrem Vorzeichen | ✅ | `buildConsequenceItems:impact`, zwei Tests |
| A14 | 400 px in **beiden** Zuständen | ✅ | `.dialog { max-width: 400px }` — ein Rahmen für beide |
| A15 | Sparrate bewegt sich in keinem der zwölf Monate | ✅ | §3, Abweichung 0,00 € auf beiden Seiten |
| A16 | `LL-6`-Regressionswächter grün | ✅ | `render-smoke` 4/4 |
| A17 | Prüfstrecke: tsc 0 · Lint 0/0 · Build 0 · visual ≥ 25 | ✅ | §2 (visual 48) |

**Regel-basiert formuliert (LL-19).** A1 sagt „jedes Fragment", nicht „diese drei";
A13 sagt „gemeinsame Einnahmen", obwohl heute keine existiert.

**Kartentyp genannt (LL-12).** A13 betrifft ausschließlich `INCOME` mit
`attribution = GEMEINSAM`; die vier heutigen Posten sind alle `FIXED_COST`. Der Status
„ÜBERSCHRITTEN" kommt in keinem Kriterium vor — er wäre hier auch fehl am Platz.

---

## 5. Architektur-Entscheidungen

### 5.1 Hover und Active mussten ausdrücklich ausgeschlossen werden

**Die Alternative bestand darin, es zu übersehen.** `pointer-events: none` unterdrückte
bisher nebenbei jede Hover-Rückmeldung. Nimmt man die Zeile weg, greift
`.fragmentCard:hover { opacity: .92 }` plötzlich auch auf gedimmten Karten — die
Deckkraft spränge beim Überfahren von 0.22 auf 0.92. Genau die beiden Werte schreibt
§8 als *unberührt* fest.

Gewählt: eigene `:hover`/`:active`-Regeln, die die Werte festnageln. Der
**Zeiger-Cursor** ist die einzige neue Rückmeldung — er zeigt an, dass hier etwas zu
holen ist, ohne einen festgeschriebenen Wert anzufassen.

*Verworfen:* eine leichte Deckkraft-Anhebung als Klick-Affordanz (0.22 → 0.30). Wäre
freundlicher, widerspräche aber der Doku-Zusage — und die Zusage ist normativ.

### 5.2 Das neue Portal und die `LL-6`-Falle

Das Schaufenster-Popup ist ein weiteres Portal-Kind. `LL-6` sagt: Ein Portal repariert
den Layout-Bezug und zerreißt im selben Zug jede Logik, die sich auf DOM-Nähe verlässt,
während das Event-Bubbling im React-Baum weiterläuft.

**Geprüft, nicht angenommen:** Der Welle-Klickhandler sitzt auf `styles.field`
**innerhalb** von `WelleStage`. Die `InteractionZone` ist in `page.tsx:470` ein
**Geschwister** davon, kein Nachfahre — ein Klick im Schaufenster erreicht
`welle/index.tsx` also gar nicht erst, weder im DOM noch im React-Baum.

Der Marker `data-wave-block` steht am Backdrop **trotzdem**. Er kostet nichts und hält
die Absicht fest, falls die Zonen je zusammenwandern. Genau die Annahme „das liegt ja
woanders" ist in v2-10 einmal teuer geworden.

### 5.3 Die K2.1-Falle beim Portal-Hop — beinahe hineingelaufen

Der erste Entwurf hat für den Betrag im Popup `.fragmentAmountPos/Neg` wiederverwendet.
Die lesen `--frag-amount-pos/neg`, und **die sind auf `.interactionZone` definiert** —
über den Portal-Hop nach `document.body` vererben sie nicht. Der Betrag wäre farblos
geblieben; `tsc`, Lint und Build hätten das nie gemeldet.

Gewählt: eigene Klassen auf `--color-teal` / `--color-red` aus `:root` (tokens.css) —
dieselben Farbwerte, aber aus der Quelle, die über `document.body` weitervererbt.
Der Warnkommentar dazu stand seit Sprint 5 im CSS; er hat funktioniert.

### 5.4 Zwei Regel-Module statt Logik in den Komponenten

`fragment-showcase.ts` und `consequence.ts` enthalten **keine Importe**. Das ist kein
Stil, sondern Voraussetzung: Nur so lässt sich die Quelldatei im Test transpilieren und
direkt ausführen, statt sie nachzubauen.

Der Anlass ist `BF-2` (v2-12): Die Regel steckte im Bauteil, war deshalb nicht einzeln
prüfbar — und hat **zwei Sprints überlebt**. Die beiden Wächter dieses Sprints prüfen
Fälle, die sonst nirgends prüfbar wären: der Cortal-Dreiteiler, der leere Zweck und
vor allem die **gemeinsame Einnahme**, für die es heute gar keine Karte gibt.

### 5.5 Runden — die Entscheidung ist zweigeteilt (LL-24)

Die drei Spalten lassen sich **nicht gleichzeitig** zum Aufgehen bringen: Die Differenz
zweier gerundeter Zahlen ist nicht die gerundete Differenz. Eine Ungereimtheit bleibt
zwangsläufig; die Frage ist nur, welche.

| | Regel | Ergebnis im belegten Fall |
|---|---|---|
| `Bisher` / `Künftig` | Summe der **gerundeten** Zeilenwerte | 1.163,62 / 1.182,60 — die Spalte geht auf, wenn man sie nachaddiert |
| Held-Zahl | **ungerundet** summiert, erst am Ende gerundet | +18,98 € — wie im Record, in §10 und in §12.7 |

Beide zusammen halten die Summenzeile in sich stimmig: 1.182,60 − 1.163,62 = 18,98.
Übrig bleibt, dass die **Diff.-Spalte** sich fürs Auge auf 18,97 addiert — die
unauffälligste der drei möglichen Abweichungen.

> **Der erste Entwurf hatte hier einen Cent Abweichung zum Beleg** (1.163,63 statt
> 1.163,62), weil auch die beiden Betragsspalten ungerundet summierten. Aufgefallen ist
> es beim Schreiben des Wächters gegen die belegte Tabelle. Der Nutzer ist
> Wirtschaftsmathematiker mit Controlling-Hintergrund — der addiert Spalten nach.
>
> **Anker-Wirkung hat nichts davon:** Hier wird nichts persistiert, und keine
> Vergleichsfunktion rechnet dagegen. Die Sparrate kommt unverändert aus
> `calculate_sparrate_for_month`. Das ist der Unterschied zu `BF-4`, wo genau dieselbe
> Frage den schärfsten Regressions-Wächter des Projekts bewegt hätte.

### 5.6 Der `Schließen`-Knopf ist neutral, nicht gold

Das Entwurfsbild (`pa1-konsequenz.html`) zeichnet ihn **gold**
(`rgba(255,200,60,.85)`). Gold ist in der schmalen Palette der **Vorjahres-Linie**
vorbehalten (§9 `B6`), und der Record vom 06.08. hält unter „Abgleich gegen die fünf
Grundsätze" ausdrücklich fest: *„keine neue Farbe, kein neuer Token … Türkis/Rot/Gold/
Blau behalten ihre Bedeutung."*

Gewählt: `buttonSecondary`, dieselbe Optik wie „Abbrechen" heute. Der Record ist die
Entscheidung, das Entwurfsbild nur die Anschauung — bei Widerspruch gewinnt der Record.

---

## 6. Offene Punkte und Fragen

### 6.1 Für den optischen Smoke besonders ansehen

**Die Popup-Breite.** Der Record beschreibt den Schritt als *„340 → 400 px, das Popup
wird breiter"*. Der echte Ausgangswert war aber **480 px** — das Popup wird durch
diese Änderung also **schmaler**, nicht breiter. Die Zahl 400 px ist normativ und
umgesetzt; nur ihre Herleitung ging von einem falschen Ist-Wert aus.

Zu prüfen ist deshalb der **Eingabe**-Zustand bei 400 px, besonders die
Illustrativ-Zeile *„Beispiel: gemeinsame Fixkosten 1.200 € → ICH-Anteil 700 € (nur
illustrativ)"* — sie ist der längste Text im Popup. Bricht sie unschön um, ist die
saubere Antwort eine Kürzung der Copy, nicht eine Rücknahme der Breite.

### 6.2 Vier Punkte, die dieser Sprint entschieden hat

Der Record vom 06.08. führt sie unter „Was NICHT entschieden wurde". Sie sind am
07.08.2026 in der Rolle `design-direktor` geklärt und vom User bestätigt worden:

| Frage | Entscheidung | Begründung in einem Satz |
|---|---|---|
| IBAN vollständig oder verkürzt? | **verkürzt** (`DE02 1203 ···· 7291`) | Die Frage beim Klick lautet „welches meiner Konten?", nicht „wie lautet die Nummer?" |
| KI-Vorschlag mit Prozentwert? | **ja** (`Miete · 91 %`) | Das Popup ist der Ort für Details; ein Vorschlag ohne Sicherheitsangabe wirkt bestimmter, als er ist |
| Wie heißen die zwei Zustände, die der Entwurf nicht zeigt? | **„Umschichtung"** als eigenes Wort neben „Übertrag" · **„automatisch erkannt"** unter der zugeordneten Karte | Die Umschichtung hat der User selbst markiert, der Transfer wurde erkannt; die automatische Zuordnung hat er nie getroffen und erfährt sie nur hier |
| Was steht da, wenn der Anteil **sinkt**? | **gespiegelt** — „Dein Anteil sinkt" · „weniger pro Monat" · „Die Sparrate steigt" | Gleicher Aufbau, drei Richtungswörter drehen; die Farbregel lag im Entwurf schon vor |

**Diese vier gehören noch in den Record unter `V2/`.** Sie sind in Design-Doku §11 und
§12 gepatcht und damit spezifiziert — aber `V2/` gehörte am 07.08. der parallelen
Sitzung (Paket-4-Runde). Der Nachtrag ist ein Zweizeiler und sollte beim nächsten
Zugriff auf den Record erfolgen.

### 6.3 Was bewusst offen bleibt

- **`design-system/entwuerfe/`** enthält weiterhin `rm2-schaufenster.html` und
  `pa1-konsequenz.html`. Nach der Regel des Records („eine Seite lebt, bis die
  Entscheidung gebaut ist; danach wandert das Ergebnis nach `komponenten/` und der
  Entwurf wird gelöscht") wären beide jetzt fällig. **Nicht angefasst**, weil der
  Ordner am 07.08. der parallelen Sitzung gehört. Bauauftrag für danach, zusammen mit
  einer neuen Seite `komponenten/overlays.html`.
- **`RM-3`** (Gegenbuchung im Fragment-Popup anzeigen) bleibt unberührt — es ist ein
  eigener Roadmap-Punkt und war nicht Gegenstand dieses Sprints.
- **Handlungen im Popup** (Zuordnen, Lösen, Umschichten) bleiben ausgeschlossen. Das
  ist `M2` und wird als Ganzes entschieden, nicht in Scheiben.

---

## 7. Vorschläge für CLAUDE.md und Roadmap

Als **Vorschlag** formuliert — die Anwendung braucht die Freigabe des Users.

### 7.1 CLAUDE.md §9 — Sprint-Stand

`v2-16` als letzter Sprint eintragen; `RM-2` und `PA-1` als erledigt. Die Prüfanker
bleiben **unverändert gültig** und tragen weiterhin das Datum 05.08.2026 — sie sind am
07.08. bestätigt worden, aber keine Rechenfunktion wurde berührt.

Der Satz „**§6 bleibt offener Altbestand:** Das Einkommens-Popup hat als einziges von
acht Overlays keinen Escape-Handler" ist **erledigt** und gehört gestrichen.

### 7.2 Eine neue Stolperfalle für §6

> **12 · Ein Portal-Kind erbt keine Custom-Properties eines Zwischen-Elements.**
> Über `createPortal` nach `document.body` vererben nur Properties von `:root`
> (`tokens.css`). Alles, was auf einer Komponente definiert ist — etwa
> `--frag-amount-pos` auf `.interactionZone` —, kommt dort **nicht** an; die Farbe
> fehlt einfach, ohne Fehler und ohne Warnung. Bei Overlay-Styles deshalb entweder
> `:root`-Tokens lesen oder den Wert hartkodieren (so lösen es `.overlayBackdrop` und
> `.overlayModal` seit Sprint 5). Berührt sich mit LL-6, ist aber ein anderer
> Mechanismus: LL-6 handelt vom **Bezugsrahmen** und der **DOM-Nähe**, dies von der
> **Vererbung**.

### 7.3 Die Fähigkeit `sprint-abschluss` ist bei den Pixel-Checks veraltet

Sie nennt als Erwartung „**12/12** (9 Ring-Subzeile + 3 §9-Pixel)". Tatsächlich waren
es vor diesem Sprint **25** (v2-15 ergänzte `liquidity.spec.ts`) und danach **48**.
Eine Erwartung, die zwei Sprints hinterherhinkt, wird gewohnheitsmäßig ignoriert —
genau das Argument, mit dem in §9 die alte flache Anker-Tabelle entfernt wurde.

**Vorschlag:** die feste Zahl durch „**alle grün**, Gesamtzahl im Review notieren"
ersetzen. Dann veraltet sie nicht mehr. Die bereits dokumentierte Falle (feste
Dateiliste in `testMatch`, sonst läuft eine neue `*.spec.ts` stillschweigend nicht mit)
bleibt davon unberührt und hat in diesem Sprint zweimal gegriffen.

### 7.4 Eine Ergänzung zu §7 Regel 14 (LL-16)

Die Regel verlangt, jeden Doku-Anker **vor** der Anwendung auf Eindeutigkeit zu prüfen.
Das reicht nicht ganz: In diesem Sprint war ein Anker **eindeutig und trotzdem falsch**
— er benannte die vermeintlich letzte Zeile einer Markdown-Tabelle, nach der aber noch
zwei Zeilen aus dem Altbestand folgten. Eine Einfügung dort hätte die Tabelle
zerrissen. Der `docs-maintainer` hat es erkannt und zurückgemeldet.

**Vorschlag für die Regel:** *Anker auf Eindeutigkeit **und auf ihre Umgebung** prüfen
— bei „nach der Tabelle", „am Ende des Abschnitts" oder „vor der Überschrift" gilt die
**Ortsangabe**, nicht die zitierte Zeile.*

Zweitens hat sich gezeigt: In einer Patch-Datei dürfen **Anweisungen an den Agenten**
und **einzufügender Text** nicht dieselbe Auszeichnung tragen. Bei P11 stand eine
Copy-Regel als Blockquote unter dem Codeblock — genau wie zwei echte Hinweise an den
Agenten weiter oben, und sie wurde folgerichtig als solcher gelesen. **Regel:** Text
gehört in den Codeblock, Anweisungen bleiben außerhalb.

### 7.5 Roadmap

**Bereits angewendet** (die Roadmap ist keine Bibel, sie wird direkt gepflegt):
`RM-2` → ✅, `PA-1` → ✅ und aus den Hausaufgaben entfernt. **Paket 2 fällt weg** — es
bestand nach `RM-1` nur noch aus `RM-2`; `RM-3` liegt in Paket 9.

Zahlen in §0 zeilengenau nachgezählt (35 Paket-Zeilen: 28 ⬜ · 3 🟡 · 4 ✅):

| | vorher | nachher |
|---|---|---|
| Offene Pakete | 12 | **11** |
| Themen darin | 32 | **31** |
| Hausaufgaben | 6 | **5** |
| **Offen gesamt** | 38 | **36** |
| Erledigt | 35 | **37** |

---

*Sprint v2-16 · Antigravity Finance · 07. August 2026 · zwei Phasen, kein
Datenbank-Eingriff, Anker unbewegt*
