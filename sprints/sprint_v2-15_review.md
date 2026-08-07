# Sprint v2-15 — Review

> **Branch:** `sprint/v2-15-liquiditaet` · **Commits:** `d531dfe` · `6272ed7` · `d0cc5cc`
> **Datum:** 06. August 2026 · **Datenbank:** nicht berührt
>
> **In einem Satz:** Der Fälligkeitstag steht jetzt auf der Karte und lässt sich dort
> ändern, und die Kopfzeile „Planung" sagt im laufenden Monat, wie viel noch abgeht
> und wie viel Budget frei ist — ohne dass sich eine einzige Sparrate bewegt.

---

## 1. Was gebaut wurde

### Phase 1 · Der Tag steht auf der Karte (`d531dfe`)

**Absicht:** Die 17 Fälligkeitstage aus v2-14 sind **abgeleitet** — aus der
Buchungshistorie gelesen, nie bestätigt — und steuern ab `LQ-2` eine sichtbare Zahl.
Ein geratener Wert, der eine sichtbare Zahl treibt und selbst unsichtbar bleibt, ist
genau die Bauart, aus der die Befunde vom 04.08. entstanden sind.

**Lösungsweg:** Die Statuszeile bekommt zwei Enden — links der Zustand, rechts der
Termin (`Offen ····· am 1.`). Getrennt wird durch die **Position**, nicht durch ein
Trennzeichen. Aus dem bisherigen Block-`div` wird ein Flex-Container mit
`align-items: baseline`; beide Enden tragen 9px/500, die Zeile bleibt damit exakt so
hoch wie das Status-Label allein. **Keine neue Zeile, keine zusätzliche Kartenhöhe** —
und anders als bei der Haushaltsbetrag-Zeile ist deshalb auch nichts zu reservieren.

Die drei Leer-Fälle aus §7 entstehen von selbst, weil sie alle `due_day IS NULL` sind:
Budget-Karten, Karten ohne Buchungshistorie, Karten ohne gesetzten Wert.

| Datei | Änderung |
|---|---|
| `src/components/cards/cards.types.ts` | `dueDay: number \| null` in `EnrichedCard` |
| `src/app/page.tsx` | `due_day` im Karten-`select`, `dueDay` im Mapping |
| `src/components/cards/card.tsx` | neue `StateRow`-Komponente; `FixedCostCard` und `IncomeCard` nutzen sie, `BudgetCard` bleibt unberührt |
| `src/components/cards/cards.module.css` | `.stateRow`, `.dueDay`, `.ghost .dueDay` |

### Phase 2 · Der Tag lässt sich ändern (`6272ed7`)

**Absicht:** Ein abgeleiteter Wert muss korrigierbar sein, sonst ist seine
Sichtbarkeit nur eine Zumutung.

**Lösungsweg:** Eigener Kontextmenü-Eintrag `Fällig am …` mit kleinem Overlay — **nicht**
als Feld in „Betrag anpassen". Das ist keine Platz-, sondern eine Bedeutungsfrage: Dort
gilt alles entweder *nur dieser Monat* oder *dauerhaft ab diesem Monat*,
`cards.due_day` gilt dagegen **immer**. Die Unterzeile `gilt für alle Monate`
beantwortet die Frage, bevor sie entsteht.

Die Server Action schreibt direkt auf `cards` — es ist nichts zu rechnen, also braucht
es keine RPC. Bereichsprüfung 1–31 als erste Verteidigungslinie, der CHECK
`cards_due_day_range` aus v2-14 als zweite. **Bewusst keine Klammerung auf die
Monatslänge:** Der gespeicherte Wert bleibt der Soll-Tag; die Februar-Klammerung
gehört in die Vorhersage (so steht es in der Migration).

| Datei | Änderung |
|---|---|
| `src/components/cards/actions.ts` | Server Action `setCardDueDay` |
| `src/components/cards/due-day-overlay.tsx` | **neu** — Portal, Escape-Handler, Zahlenfeld, `Kein fester Tag`, Herkunftssatz |
| `src/components/cards/card-interactive.tsx` | Menüpunkt, Props `cardType` + `currentDueDay` |
| `src/components/cards/card.tsx` | reicht die zwei Props durch (alle drei Kartentypen) |
| `src/components/cards/cards.module.css` | `.overlayHint` |

### Phase 3 · Die Ausstehend-Anzeige (`d0cc5cc`)

**Absicht:** Die Frage „reicht mein Geld bis Monatsende?" beantwortbar machen.

**Lösungsweg:** Zwei Beträge rechtsbündig in **derselben Zeile** wie die
Zonen-Überschrift — dasselbe Muster wie der Übertrags-Schalter der Rohmasse (v2-07,
`C1`). Kein vierter waagerechter Bereich, Oberkanten der drei Zonen bleiben bündig.

Die Rechnung liegt in einer eigenen, reinen Funktion und läuft **server-seitig auf den
bereits geladenen Karten**: keine zusätzliche Abfrage, kein nachgelagerter JS-Filter.
Die 1000-Zeilen-Grenze (§7 Regel 18 / `LL-21`) ist damit strukturell unerreichbar —
gezählt wird über `cards` (zweistellig), nicht über die mitwachsende Rohmasse.

| Datei | Änderung |
|---|---|
| `src/components/interaction-zone/liquidity.ts` | **neu** — `computeLiquidity` |
| `src/components/interaction-zone/index.tsx` | ruft sie **nur im laufenden Monat** auf |
| `src/components/interaction-zone/carousel.tsx` | Kopfzeile mit den zwei Angaben |
| `src/components/interaction-zone/interaction-zone.module.css` | `.carouselZoneHeader`, `.liquidityLine`, `.liquidityGroup`, `.liquidityNum`, `.liquidityWord`, `.liquiditySep` |
| `src/lib/months.ts` | `getCurrentDayOfMonth`, `getDaysInMonth` |
| `src/lib/format.ts` | `formatEuroRounded` |

---

## 2. Prüfstrecke

| Schritt | Ergebnis |
|---|---|
| `tsc --noEmit` | **0 Fehler** |
| ESLint (Worktree-Aufruf) | **0 Fehler, 0 Warnungen** |
| `pnpm build` | **0 Fehler** · Route `/` **30,6 kB** · First Load JS **182 kB** · Middleware 81,8 kB |
| `pnpm test:visual` | **12/12 grün** (9 Ring-Subzeile + 3 §9-Pixel) |
| `pnpm test:e2e` (`smoke-agent`) | **14/14 grün** (`visual` 12 + `unauth` 2) · `render-smoke` lief mangels Zugangsdaten nicht |

**Bundle:** +0,9 kB auf der Route, +1 kB First Load gegenüber v2-13 (29,7 / 181 kB).
Das ist das neue Overlay plus die Kopfzeile — angemessen für zwei Features.

**Was NICHT geprüft werden konnte — und warum das benannt gehört:**
`.env.e2e.local` existiert in dieser Arbeitskopie nicht (`E2E_TEST_EMAIL` /
`E2E_TEST_PASSWORD` fehlen). Damit läuft ausschließlich das `visual`-Projekt; ein
**angemeldeter** Render-Smoke ist nicht möglich, weil der Agent nicht am Login
vorbeikommt. Die gesamte sichtbare Oberfläche dieses Sprints liegt hinter dem Login.
**Der Browser-Test des Users ist hier deshalb nicht nur der Gate, sondern die einzige
Prüfung der Darstellung.**

### Ersatzprüfung der Rechnung — deterministisch, gegen echte Daten

Weil die Anzeige nicht automatisiert sichtbar gemacht werden konnte, wurde die
**Rechnung** stattdessen direkt geprüft: `computeLiquidity` wurde nach JS übersetzt und
mit dem **exakten Kartenbestand des August 2026** aufgerufen (21 Karten, zuvor nur
lesend aus der Produktiv-Datenbank gemessen). Vierzehn Prüfungen, alle grün:

| Prüfung | Erwartung | Ergebnis |
|---|---|---|
| 06.08. · noch fällig | 312,09 € | ✅ |
| 06.08. · Budget frei | 590,00 € | ✅ |
| 01.08. · noch fällig | 1.769,02 € | ✅ |
| **Gegenprobe zum Befund:** 01.08. + Friseur | **1.814,02 €** | ✅ |
| 28.08. · alle Termine durch | `0`, **nicht** „keine Anzeige" | ✅ |
| 24.08. · nur Einnahme übrig | −7,00 € (Einnahmen mindern) | ✅ |
| Häkchen nimmt Karte heraus | 312,09 − 104,00 | ✅ |
| Umsatz nimmt Karte heraus | 312,09 − 107,10 | ✅ |
| Februar: `due_day` 31 am 28. | zählt (geklammert) | ✅ |
| Budget: überschritten und abgeschlossen | tragen 0 bei, kein Minus | ✅ |
| ohne Budget-Karten | `budgetFree === null` | ✅ |

**Die vierte Zeile ist der wertvollste Beleg dieses Sprints.** Der Befund vom
05.08.2026 hat unabhängig und mit anderer Methode (reines SQL, ohne Termin-Filter)
**1.814,02 €** gemessen. Unsere Rechnung liefert am 1. August **1.769,02 €** — die
Differenz ist auf den Cent der Friseur (45,00 €), die einzige Karte ohne Termin. Damit
ist belegt: Die Anzeige nutzt dieselbe Betragsbasis wie die Sparrate (Befund `L4`,
keine zweite Rechenart), und die einzige Abweichung ist die dokumentierte
Untererfassung.

Das Prüfskript lag bewusst außerhalb des Repos (Job-Verzeichnis) — es ist ein Beleg,
kein Artefakt. **Vorschlag dazu in Abschnitt 7.**

### Render-Smoke (`smoke-agent`)

Gefahren, mit der bekannten Einschränkung. Ergebnis: **keine Diskrepanz zwischen Code
und Spezifikation gefunden**, weder in der Suite noch im statischen Abgleich gegen
Design-Doku §7 · §8 · §12.3 · §12.4 · §12.9 und beide Entwurfsseiten. Die neuen
CSS-Werte decken sich wertgenau mit `lq1-faelligkeitstag.html` (Variante A1) und
`lq2-ausstehend.html` (Variante A). Die Login-Seite rendert sauber — keine
Konsolenfehler, kein Hydration-Mismatch, kein horizontaler Überlauf.

**Ungeprüft blieb das angemeldete Dashboard** — also genau die fünf Zustände, in denen
die beiden neuen Anzeigen sichtbar wären. Das ist keine Nachlässigkeit, sondern die
Folge der fehlenden Zugangsdaten; der Agent hat korrekt darauf verzichtet, welche zu
beschaffen. **Restrisiko laut Agent:** ein Layout-Sprung bei sehr langen Kartennamen
oder ein Umbruch bei sehr breiten Beträgen in der Kopfzeile. Beides ist aus den
CSS-Regeln plausibel ausgeschlossen (`white-space: nowrap` auf beiden neuen Elementen,
`flex-shrink: 0` auf der Liquiditätszeile), aber bestätigen kann es nur der
Browser-Test.

---

## 3. Anker vorher/nachher

Gemessen gegen `nflkobdfdhncrtjncpmq`, ausschließlich `SELECT`, jeweils Ist **und**
Plan, alle zwölf Monate 2026 — vor Phase 1 und nach Phase 3.

| Monat 2026 | Ist vorher | Ist nachher | Plan vorher | Plan nachher |
|---|---|---|---|---|
| Januar–April | 1.931,18 | **1.931,18** | 1.931,18 | **1.931,18** |
| Mai | −86,77 | **−86,77** | −86,77 | **−86,77** |
| Juni | 4.208,76 | **4.208,76** | 4.220,53 | **4.220,53** |
| Juli | −322,75 | **−322,75** | 55,44 | **55,44** |
| August | 1.761,08 | **1.761,08** | 1.761,08 | **1.761,08** |
| September–Dezember | 1.824,08 | **1.824,08** | 1.824,08 | **1.824,08** |

**Abweichung überall 0,00 €.** Das ist hier das erwartete Ergebnis und der Beleg
dafür, dass keine Rechenfunktion berührt wurde: Der Sprint fügt eine Spalte zur
Anzeige hinzu und rechnet aus bereits vorhandenen Werten. Ein Zahlenwert, der sich
bewegt hätte, wäre ein Fehler gewesen.

**Die Anker-Tabelle in CLAUDE.md §9 bleibt unverändert gültig.**

---

## 4. Selbst-Review gegen die Akzeptanzkriterien

| # | Kriterium | erfüllt | Beleg |
|---|---|---|---|
| A1 | Fixkosten/Einnahmen **mit** Termin: `am [N].` rechts, Höhe unverändert | ✅ | `card.tsx` `StateRow`; `cards.module.css` `.stateRow` (`align-items: baseline`, beide Enden 9px/500 → keine neue Zeilenhöhe) |
| A2 | **Budget**-Karte: rechts nichts | ✅ | `BudgetCard` nutzt `StateRow` nicht; `due_day` dort per Migration `NULL` |
| A3 | Fixkosten/Einnahmen **ohne** Termin: rechts nichts | ✅ | `StateRow` rendert bei `dueDay === null` kein Element — kein Platzhalter |
| A4 | Tag bleibt in jedem Zustand stehen | ✅ | `StateRow` bekommt `card.dueDay` unabhängig vom Zustand; keine Zustandsbedingung im Code |
| A5 | `Fällig am …` nicht auf Budget, nicht auf Ghost | ✅ | `card-interactive.tsx`: `!endDeleteOnly && cardType !== "BUDGET"` |
| A6 | Overlay setzt 1–31, entfernt per `Kein fester Tag`, Escape schließt | ✅ | `due-day-overlay.tsx`: `parseInput` (1–31), `handleClear`, Escape-`useEffect` |
| A7 | Zwei Beträge, zwei Wörter, nie eine Summe | ✅ | `carousel.tsx` rendert zwei getrennte Gruppen; es existiert keine Additionsstelle im Code |
| A8 | Außerhalb des laufenden Monats leer, Oberkanten bündig | ✅ | `index.tsx`: `compareMonths(targetMonth, currentMonth) === 0`, sonst `null`; `.carouselZoneHeader` spiegelt `.fragmentZoneHeader` (gleiches `margin-bottom: 10px`) |
| A9 | Termin verstrichen **oder** Zahlung vorhanden → raus | ✅ | `liquidity.ts`, drei `continue`-Zweige; deterministisch geprüft (Abschnitt 2, Zeilen „Häkchen"/„Umsatz") |
| A10 | Keine Sparrate bewegt sich | ✅ | Abschnitt 3, 12/12 Monate Abweichung 0,00 € |

**A1 und A8 tragen eine Einschränkung:** Beide sind Aussagen über das *Bild*. Belegt
ist hier die *Konstruktion* (Flex statt zusätzlicher Zeile; gleiches Kopfzeilen-Muster
wie die Rohmasse). Den optischen Beweis kann erst der Browser-Test liefern — siehe die
Einschränkung in Abschnitt 2.

---

## 5. Architektur-Entscheidungen

**① Die Rechnung liegt im Frontend-Loader, nicht in einer RPC.**
Echte Alternative: eine Datenbank-Funktion `calculate_outstanding_for_month`. Dagegen
sprach dreierlei. Erstens wäre es ein Datenbank-Eingriff — der Sprint hat keinen, und
die Übungs-Datenbank ist pausiert, die Probe nach `db-eingriff` also teuer. Zweitens
liegen **alle** Eingangswerte bereits server-seitig vor: `amount` (der Anteilsbetrag),
`effectivePlan`, `manuallyPaid`, `linkedFragments`. Eine RPC berechnete sie ein zweites
Mal — und §7 Regel 1 („keine eigene Sparrate-Berechnung im Frontend") ist hier **nicht**
berührt: Es wird nichts *nachgerechnet*, sondern über bereits von der Datenbank
gelieferte Beträge summiert. Drittens ist genau das der Grund, warum die Zahl nicht
von der Sparrate abweichen kann.

**② Die Klammerung auf die Monatslänge sitzt in der Anzeige, nicht in der Spalte.**
Vorgegeben durch die v2-14-Migration, hier eingelöst: `min(due_day, Tage im Monat)`.
Ein Dauerauftrag zum 31. existiert; würde man beim Speichern klammern, wäre der
gespeicherte Wert bereits eine Interpretation und im Februar dauerhaft verfälscht.

**③ Beträge ohne Cent.**
Alternative war `formatEuro` (zwei Dezimalen wie auf Karten und im Stack). Dagegen: Die
Aussage ist eine **Vorhersage** aus einem abgeleiteten Fälligkeitstag — Cent
suggerierten eine Genauigkeit, die es nicht gibt. Dieselbe Wahl trifft der Ring. Die
Entwurfsseite zeigt es ebenso (`1.814 €`). Der neue `formatEuroRounded` übernimmt das
NBSP des Rings, verzichtet aber auf dessen erzwungenes `+`: Ein Vorzeichen gehört zu
einer Abweichung, nicht zu einem Bestand.

**④ `computeLiquidity` bekommt eine Zahl, kein `Date`.**
Ursprünglich als `(cards, today: Date, daysInMonth)` entworfen. Umgestellt auf
`(cards, heute: number, daysInMonth)`, weil die Funktion damit ohne Zeitzonen-Annahme
prüfbar wird — die Zeitzonenfrage bleibt beim Aufrufer, der ohnehin schon UTC nutzt
(`getCurrentMonthYM`). Genau diese Signatur hat die deterministische Prüfung in
Abschnitt 2 erst möglich gemacht.

**⑤ Ein eigener Ghost-Ton für den Termin (`.20` statt `.30`).**
Aus der Entwurfsseite übernommen. Die Karten-Opacity (`.65`) allein ließe den Termin im
Forecast lauter wirken als das Status-Label daneben, weil dieses zusätzlich auf
`--text-ghost` (`.22`) fällt.

---

## 6. Offene Punkte und Fragen

**① Der angemeldete Smoke fehlt strukturell, nicht nur diesmal.**
`.env.e2e.local` existiert in keiner Arbeitskopie. Damit ist die gesamte Oberfläche
hinter dem Login automatisiert unprüfbar, und der `smoke-agent` kann seine
Kernaufgabe — Screenshots des Dashboards gegen die §-Checkliste — grundsätzlich nicht
erfüllen. Das trifft jeden künftigen UI-Sprint gleichermaßen. **Frage an den User:**
Sollen wir für die Übungs- oder Produktiv-Datenbank einen Test-Zugang hinterlegen?

**② Zwei bekannte Untererfassungen der neuen Zahl.**
Der Friseur (45,00 €, kein Termin) und die Kreditkarten-Abrechnung (`L5`, um den 24.,
von keiner Karte abgebildet). Beide sind dokumentiert und gewollt; zusammen ist die
Zahl systematisch **leicht zu optimistisch**. Sobald das stört, ist der Friseur mit
einem Tag im neuen Overlay in zehn Sekunden behoben — die Kreditkarte erst mit `LQ-3`.

**③ Der Wert wandert mit dem Kalendertag.**
Am 6. August zeigt die Anzeige 312 €, am 16. nur noch 277 €, am 24. −7 €. Das ist
richtig so, aber es heißt: Ein Screenshot von heute ist morgen kein gültiger Sollwert.
Für künftige Prüfungen zählt die **Regel**, nicht die Zahl.

**④ Die Anzeige kann negativ werden.**
Wenn nur noch Einnahmen ausstehen, steht dort `−7 €`. Fachlich korrekt („es kommt
netto noch Geld"), aber das Wort daneben heißt weiterhin „noch fällig". Heute tritt
das ab dem 24. jedes Monats ein. **Keine Gestaltungsentscheidung dazu getroffen** —
falls es stört, wäre es eine Frage für den `design-direktor`, nicht für einen Bugfix.

**⑤ Der Stichtag wird in UTC bestimmt — zwischen 0 und 2 Uhr zeigt die App den Vortag.**
Vom `smoke-agent` gefunden. `getCurrentDayOfMonth()` nutzt `getUTCDate()` und folgt
damit exakt der bestehenden Konvention: `getCurrentMonthYM()` macht es seit jeher
genauso, und `src/lib/months.ts` ist ausdrücklich auf UTC ausgelegt (Kopfkommentar,
§7 Regel 8). **Bewusst nicht geändert** — eine Umstellung auf Europe/Berlin wäre eine
Änderung an bestehendem Verhalten außerhalb dieses Auftrags und müsste dann
konsequenterweise auch den Monatswechsel betreffen.

**Wirkung:** Wer die App nachts zwischen 0:00 und 2:00 deutscher Zeit öffnet, sieht den
Stand des Vortags — also **einen Posten zu viel** als fällig. Die Abweichung geht damit
in die vorsichtige Richtung. **Entscheidung des Users**, ob das reicht oder ob
`months.ts` insgesamt auf die deutsche Zeitzone umgestellt werden soll; Letzteres wäre
ein eigener kleiner Sprint, weil er den Monatswechsel mitbetrifft.

**⑥ Das Einkommens-Popup hat weiterhin keinen Escape-Handler**
(`sprints/sprint_v2-10_offene_fragen.md` §6, unverändert offener Altbestand). Das neue
`Fällig am`-Overlay hat einen von Anfang an — der Rückstand wächst also nicht weiter.

---

## 7. Vorschläge für CLAUDE.md und Roadmap

Alle als **Vorschlag** formuliert; die Anwendung braucht die Freigabe des Users.

**① Roadmap:** `LQ-1` und `LQ-2` auf ✅. Damit ist **Paket 3 vollständig
abgeschlossen** bis auf `LQ-3`, das ohnehin in Paket 9 liegt. Zahlen in §0
zeilengenau nachziehen.

**② CLAUDE.md §9:** Sprint-Stand auf v2-15, Doku-Versionen nachziehen. Die
**Anker-Tabelle bleibt unverändert** — sie wurde vorher und nachher bestätigt.

**③ Neue Stolperfalle (Vorschlag für §6):**
> **Ein Beleg, der nur im Migrations-Kommentar steht, ist zur Laufzeit nicht
> vorhanden.** Die Herleitung der 17 Fälligkeitstage („19 Monate, immer am 1. bis 4.")
> ist sorgfältig dokumentiert — aber ausschließlich als SQL-Kommentar. Ein
> UI-Vorschlag, der sie anzeigen wollte, war deshalb nicht baubar, ohne entweder die
> gesamte Historie zu lesen (`LL-21`) oder eine Spalte anzulegen. **Wer eine
> Herleitung später zeigen will, muss sie speichern, nicht kommentieren.**

**④ Vorschlag zur Prüfbarkeit — der eine echte Neuerung wäre.**
Dieser Sprint hat die Rechnung geprüft, indem eine reine Funktion nach JS übersetzt und
mit echten Daten aufgerufen wurde. Das hat auf Anhieb bestätigt, dass die Zahl auf
derselben Basis steht wie der unabhängig gemessene Befund. Das Skript lag außerhalb des
Repos und ist damit weg.

**Vorschlag:** Reine Rechenfunktionen wie `computeLiquidity` bekommen eine
`*.spec.ts`-Datei im `visual`-Playwright-Projekt — es läuft ohne Zugangsdaten und ohne
Live-Daten, genau wie die Ring-Subzeilen-Tests (`ring-subline.spec.ts`), die exakt so
gebaut sind. Kosten: eine Datei. Nutzen: Die Regel „Termin verstrichen **oder** bezahlt"
ist dann dauerhaft bewacht, statt nur einmal belegt. **Bewusst nicht ohne Freigabe
gebaut** — es erweitert die Teststrategie und ist damit keine Sprint-Entscheidung.

---

*Review · Antigravity Finance · Sprint v2-15 · 06. August 2026*
