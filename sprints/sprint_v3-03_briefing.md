# Sprint v3-03 — Briefing

> **`/mobil` — die drei Sichten: Übersicht · Karten · Verlauf**
> Branch `sprint/v3-03-mobil-sichten` · Basis `origin/main` (Stand nach PR #59) ·
> 08. September 2026
> Datenbank: **nein** — alle vier Sichten lesen bestehende RPCs.
> Rechenfunktionen: **unangetastet.**
>
> **Briefing-Datei: ja**, weil mehr als drei Phasen (Kriterium 2 aus `sprint-start`).

---

## 1. Warum dieser Sprint

`MB-6` ist der letzte offene Punkt aus Paket 20. v3-02 hat die Route `/mobil` gebaut und
den Tab **Zuordnen** vollständig ausgeliefert; die drei anderen Tabs stehen seither in der
Leiste **ohne Ziel** (Annahme A7 aus dem v3-02-Briefing), und `/mobil` leitet auf
`/mobil/zuordnen` um. Dieser Sprint gibt ihnen ihre Seiten.

**Alles ist entschieden.** Spezifikation: `design-system/handoff/mobile/README.md` §4–§6,
Screenshots 01, 05, 06. Record: `V2/design_direktor_2026-09-07_mobil.md` (#9, #10, #11).
Nichts wird neu gestaltet.

**Die eine offene Frage ist geklärt** (User, 08.09.2026): Der Ring-Bogen schließt bei
**200 %**, wie Design-Doku §5 und die bestehende Komponente. Der Prototyp zeigt 100 %; er
verliert nach CLAUDE.md §5. Kein zweiter Ring, kein zweiter Modus.

---

## 2. Ziel, Nicht-Ziel, Prüfanker

**Ziel (ein Satz):** Auf dem Handy zeigen drei weitere Tabs den Monat als Ganzes — die
Übersicht mit dem Ring vor der Jahres-Welle, die Karten als Liste mit Balken und
aufklappbaren Buchungen, den Verlauf als sechs Monate Sparrate mit Planlinie.

**Nicht-Ziel — ausdrücklich nicht angefasst:**

- kein Responsive-Umbau der Schreibtisch-Ansicht
- keine Kartenanlage, kein Kartenmenü (`M2`) auf `/mobil`
- keine Swipe- oder Long-Press-Geste
- keine Änderung an einer Rechenfunktion, keine Migration
- kein zweiter Ring und kein zweiter Zeichencode für die Welle
- Light-Mode-Abnahme (`RD-5`), `MB-H1` („N × zuvor" gegen Konfidenz)

**Prüfanker (regel-basiert, LL-19):**

- **Kein Zahlenwert bewegt sich.** Sparrate Ist **und** Plan, 24 Monate 2025 + 2026,
  vorher/nachher in derselben Sitzung byte-identisch. Anker 1 und 2 in 24/24.
  Protokoll: `sprints/sprint_v3-03_anker.md`.
- **Jede angezeigte Zahl stammt aus einer RPC, keine wird im Frontend gerechnet**
  (§7 Regel 1). Der Ring bekommt Ist und Plan, die Kacheln Plansummen und Reste je Typ,
  der Verlauf die Serie.
- **Anker 3:** Netzrunden je Aufbau — Übersicht ≤ 8, Karten ≤ 7, Verlauf ≤ 7.
  Zum Vergleich: `/mobil/zuordnen` 11, Schreibtisch ~18.
- **Prüfstrecke:** `tsc` 0 · Lint 0/0 · Build 0 · `test:visual` und `test:e2e` vollständig
  grün. Baseline nach dem Nachzug vom 07.09.2026: **visual 225 · e2e 243**; sie dürfen nur
  um die eigenen Wächter steigen.

---

## 3. Was nachgesehen wurde — die Fakten, die den Plan tragen

| Fakt (08.09.2026) | Folge |
|---|---|
| `singularity-ring/` trägt bereits `viewBox="0 0 248 248"`, r 98, Stroke 9, Punkte bei y 26 und 222 — **exakt die Maße des Handoffs** | Die Komponente wird **unverändert** eingesetzt. Die deckende Innenfläche (r 94, `--bg-primary`) ist eine Hülle **um** sie herum, keine Änderung **an** ihr |
| Der Bogen der Komponente schließt bei 200 % (`SUBTEXT_CAP_PCT = 2`, Kommentar „N4b-a (§5)"), der Handoff bei `clamp(sparrate/plan, 0, 1)` | §5 gewinnt; im Handoff-README wird die Stelle als Abweichung vermerkt |
| `drawWave` nutzt `WAVE_PAD_L = WAVE_PAD_R = 18`. Bei 430 px Breite ergibt das `cW = 394` und `stepX = 394/11` — **exakt die Punktabstände des Handoffs** | Die Welle passt ohne Geometrie-Eingriff |
| Der Marker hängt an `pts[activeIndex]`, die Monatsbeschriftung ebenfalls | Ein Parameter trennt beides: `showActiveMarker`. Der laufende Monat bleibt in der Beschriftung hervorgehoben, der Kreis entfällt |
| Rot wird bereits **nur zwischen Kurve und Nulllinie** gezeichnet (`areaPath` schließt auf `y0`, Clip von `y0` abwärts) | Nichts zu tun — die Forderung des Records ist erfüllt |
| Einen senkrechten Strich zeichnet `drawWave` nicht; er lebt in `welle/index.tsx` | Die Handy-Bühne ruft `drawWave` direkt, ohne die Schreibtisch-Hülle |
| `get_sparrate_series(user_id, year)` liefert **zwölf Monate Ist und Plan in einem Aufruf** | Deckt Welle **und** Ring-Plan **und** Verlauf ab. Der Ring braucht deshalb keinen eigenen `calculate_sparrate_for_month`-Aufruf |
| `get_cards_for_month` liefert `amount`, `effective_plan`, `manually_paid`, `adjusted_amount` je aktiver Karte in einem Aufruf | Kacheln und Kartenliste kommen daraus; `is_card_active_in_month` wird nicht einzeln gerufen (LL-28/LL-29) |
| `card-state.ts` trägt `resolveFixedCostState`, `resolveIncomeState`, `resolveBudgetState`, `sumLinkedFragments`, `isCardOpen` | Die Wortlaute „unbezahlt" · „frei" · „erwartet/eingegangen" und die Bezahlt-Regel kommen von dort, nicht aus einer zweiten Formulierung (LL-26) |
| Die Tab-Leiste führt die drei Tabs bereits mit `href: null` und der Klasse `tabOhneZiel` | P4 setzt nur die Ziele ein und entfernt den Sonderfall |
| `/mobil/page.tsx` leitet auf `/mobil/zuordnen` um (8 Zeilen) | P4 macht daraus die Umleitung auf `/mobil/uebersicht` |

---

## 4. Phasen — ein Commit je Phase, N+1 erst nach grünem N

| # | Was | Dateien | DB |
|---|---|---|---|
| **P0** | CLAUDE.md-Nachzug v3-01 + v3-02, Kollisionen aufgelöst (Stolperfalle 32/33, LL-44/45/46), §9 auf den Stand vom 08.09.2026 | `CLAUDE.md`, `sprints/doku_patch_2026-09-08_…md` | nein |
| **P1 Übersicht** | Bühne 282 px: Welle im Hintergrund (`drawWave` mit `showActiveMarker: false`), Ring davor mit deckender Innenfläche · drei Kacheln · Einstiegskarte · Fußzeile | `src/app/mobil/uebersicht/`, `src/components/mobil/uebersicht/`, `src/components/welle/draw.ts` | nein |
| **P2 Karten** | Filter-Pillen, Liste mit Statuspunkt · Balken · Rest, aufklappbare Buchungen des Monats | `src/app/mobil/karten/`, `src/components/mobil/karten/` | nein |
| **P3 Verlauf** | Sechs Monate Sparrate als Balken mit Planlinie, Detailkarte zum gewählten Monat | `src/app/mobil/verlauf/`, `src/components/mobil/verlauf/` | nein |
| **P4 Leiste** | Tab-Leiste bekommt die drei Ziele, `tabOhneZiel` entfällt; `/mobil` → `/mobil/uebersicht` | `src/components/mobil/tab-bar/`, `src/app/mobil/page.tsx` | nein |
| **P5 Abschluss** | `sprint-abschluss`: Prüfstrecke, Anker, Review, Historie, Roadmap `MB-6`, Handoff-Vermerk zur Ring-Abweichung, Push, PR | Doku | nein |

**Netzrunden je Aufbau (Anker 3), gezählt:**

| Sicht | Aufrufe | Summe |
|---|---|---|
| Übersicht | Anmeldung · `profiles` · `cards` · `get_sparrate_series` · `get_cards_for_month` · verknüpfte Zahlungen des Monats · offene Zahlungen (Badge) | **7** |
| Karten | Anmeldung · `profiles` · `cards` · `get_cards_for_month` · verknüpfte Zahlungen · offene Zahlungen | **6** |
| Verlauf | Anmeldung · `profiles` · `cards` · `get_sparrate_series` (zwei bei Jahresgrenze) · offene Zahlungen | **5–6** |

---

## 5. Prüfschritte

| # | Schritt | Erwartung | Quelle |
|---|---|---|---|
| S1 | `/mobil/uebersicht` nicht angemeldet | Umleitung auf `/login` | CLAUDE.md §4 |
| S2 | `/mobil` aufrufen | landet auf `/mobil/uebersicht` | Handoff §4 |
| S3 | Übersicht, laufender Monat | Ring vor der Welle, Innenfläche deckend, **kein** Marker-Punkt, **kein** senkrechter Strich | Record #10 |
| S4 | Ring bei Sparrate über Plan | Bogen wächst über 12 Uhr, schließt erst bei doppeltem Plan; Zahl türkis | Design-Doku §5 |
| S5 | Ring bei negativer Sparrate | Bogen rot, Zahl rot, Subzeile „N % Defizit" | Design-Doku §5 |
| S6 | Drei Kacheln | Fixkosten „{Rest} unbezahlt", Budget „{Rest} frei", Einnahmen „erwartet" oder „eingegangen" | Record #11 |
| S7 | Einstiegskarte bei leerem Stapel | „Alles zugeordnet" / „Die Sparrate ist endgültig", Kreis `--neutral-fill` | Handoff §4 |
| S8 | Einstiegskarte antippen | führt auf den Tab Zuordnen, Monat bleibt | Handoff §4 |
| S9 | Karten, Filter „Budget" | nur Budget-Karten, Zähler rechts im Kopf bleibt die Gesamtzahl | Handoff §5 |
| S10 | Karte antippen | klappt auf, zeigt die zugeordneten Buchungen **dieses** Monats oder „Noch keine Buchung in diesem Monat" | Handoff §5 |
| S11 | Budget-Karte über Plan | Statuspunkt und Balken rot, Zeile 3 „überschritten" | Handoff §5, §4.3 |
| S12 | Verlauf | sechs Monate, Planlinie gestrichelt, gewählter Monat hervorgehoben, Detailkarte darunter | Handoff §6 |
| S13 | Verlauf, Monat mit negativer Sparrate | Balken und Wert rot, Detailkarte „Defizit — X gegen Plan" | Handoff §6 |
| S14 | Alle drei Tabs, Edge-Log nach dem Smoke | Netzrunden wie in §4 | CLAUDE.md §9 Anker 3 |
| S15 | **User, am iPhone:** alle vier Tabs durchgehen | nichts abgeschnitten, nichts unter 44 px, Zahlen stimmen mit dem Schreibtisch überein | Abnahme |

Wächter (LL-40): jeden neuen Test einmal absichtlich rot sehen, bevor er zählt. Neue
`*.spec.ts` in die **feste Liste** in `playwright.config.ts` eintragen, sonst laufen sie nie.

---

## 6. Annahmen — gelten, solange der User nicht widerspricht

| # | Lücke | Annahme |
|---|---|---|
| B1 | Ring-Bogen 100 % gegen 200 % | **Entschieden vom User am 08.09.2026: 200 %** wie §5. Die Abweichung wird im Handoff-README vermerkt, damit der Prototyp nicht als Quelle missverstanden wird |
| B2 | Die Welle des Handoffs beschreibt SVG mit vertikalen Farbverläufen; die App zeichnet Canvas mit horizontalem Regime-Gradienten | Die bestehende Zeichenfunktion bleibt, inklusive ihrer Farben und ihrer Skala. Ein zweiter Zeichencode wäre LL-26 in der Form „Nachbauen", und die Farbwerte stünden ein drittes Mal im Repo (LL-44) |
| B3 | Der Handoff nennt für die Welle die Skala „max·1,15 bis min(0,min)−120" | Es bleibt bei der Skala aus `drawWave` (min/max der Werte einschließlich Null). Sie ist erprobt und hat einen Pixel-Wächter |
| B4 | „Zuletzt zugeordnet: {Empfänger} → {Karte}" — der Server kennt keine Sitzung | Die Fußzeile zeigt die **zuletzt zugeordnete Zahlung des angezeigten Monats** aus der Datenbank. Gibt es keine, steht dort „noch nichts in dieser Sitzung". Kein `localStorage`, keine zusätzliche Netzrunde |
| B5 | „Verlauf, sechs Monate" — welche sechs | Der angezeigte Monat und die fünf davor. Gewählt ist zunächst der angezeigte Monat |
| B6 | Held im Verlauf: „Ø je Monat" | Mittelwert der sechs **Ist**-Werte, aus der Serie geholt und nur gemittelt. Monate ohne Wert zählen nicht in den Nenner (LL-20: kein Wert ist nicht 0) |
| B7 | Planlinie im Verlauf | Der **Plan des gewählten Monats** aus der Serie, nicht der Mittelwert der Pläne. Der Handoff zeigt eine feste Linie „Plan 1.000 €" |
| B8 | Der Handoff nennt für die Kacheln „Plansumme" | Summe von `effective_plan` über alle im Monat aktiven Karten des Typs — die Vergleichsbasis, die auch die Karten benutzen (§6 Stolperfalle 8). **Kein Rundungs-Ausgleich**, weil die Summe der drei Kacheln nirgends als Sparrate erscheint (LL-43) |
| B9 | Einnahmen-Kachel „erwartet" gegen „eingegangen" | „eingegangen", sobald **jede** Einnahmen-Karte des Monats den Zustand `received` trägt; sonst „erwartet" |
| B10 | Filter-Pille „Einmalig" | wie im Sheet: Ausgaben-Karte mit Rhythmus `ONCE` (`kartenGruppe` aus `gruppen.ts`), nicht neu formuliert |

---

## 7. Fallen, die in diesem Sprint zählen

- **LL-26 „Nachbauen"** — Ring und Welle werden benutzt, nicht nachgebaut. In v2-20 hat ein
  Nachbau des Lösch-Tors eine Datenbank-Entscheidung still aufgehoben.
- **LL-44** — Farbwerte kommen aus Tokens. `draw.ts` spiegelt sie bereits als Konstanten;
  ein drittes Vorkommen entstünde, wenn die Handy-Welle eigene Farben bekäme.
- **LL-28 / LL-29 / Anker 3** — jede Sicht zählt ihre Netzrunden, bevor sie fertig ist.
- **LL-43** — ein Rundungs-Ausgleich nur dort, wo die Summe sichtbar ist. Hier nirgends.
- **§7 Regel 1** — keine Sparrate im Frontend.
- **LL-40** — jeder neue Wächter wird einmal absichtlich rot gesehen.
