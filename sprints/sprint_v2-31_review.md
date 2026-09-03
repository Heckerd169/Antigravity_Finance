# Sprint v2-31 — Review

> **Branch:** `sprint/v2-31-verlauf` · **Datum:** 31. August 2026
> **Commits:** `3ea1fe6` (P0) · `7aa61ee` (P1) · `796ea21` (P2) · `b3e1fbb` (P3) · `81f67a1` (P4)
>
> **In einem Satz:** Karten und Ordner haben einen Verlauf bekommen — 24 Monate Ist
> gegen Plan in einem zentrierten Overlay —, und die Roadmap-Zusage, das sei
> datenseitig längst abgedeckt, hat der Messung nicht standgehalten.

---

## 1. Was gebaut wurde

### P0 · Design-Runde, Record, Anker vorher

Die Gestaltung von `M7` war **nicht** entschieden. Die Runde vom 31.08.2026 hat sie
festgeschrieben (`V2/design_direktor_2026-08-31_verlauf.md`) und dabei den Umfang des
Sprints an zwei Stellen geändert — beide auf Entscheidung des Users:

| | |
|---|---|
| **`KAT-4` kam DAZU** | „Der Verlauf muss bei allen Ordnern dargestellt werden." Der Auftrag hatte das ausgeschlossen. Befund `U5` sagt seit dem 04.08.2026, dass beide dieselbe Fläche brauchen. |
| **`KAT-5` fiel RAUS** | Die Anlege-Geste auf der Ordner-Kachel wird ein eigener Sprint. Record `A2` (07.08.2026) bleibt unverändert gültig. |

Entwürfe mit **gemessenen** Zahlen aus der Produktiv-Datenbank, fünf Artboards:
`design-system/entwuerfe/v2-31-verlauf.html` (lokal, bewusst ohne `@dsCard`-Marker).

**Berührt:** `V2/design_direktor_2026-08-31_verlauf.md` ·
`sprints/sprint_v2-31_briefing.md` · `sprints/sprint_v2-31_anker.md` ·
`design-system/entwuerfe/v2-31-verlauf.html`

### P1 · Zwei rein lesende Serien-Funktionen

`supabase/migrations/20260831_v2_31_verlauf_serien.sql`

```
get_card_amount_series(p_card_id uuid, p_year integer)         → jsonb
get_category_amount_series(p_category_id uuid, p_year integer) → jsonb
```

24 Einträge `{month_index, month, aktiv, ist, plan}` für `p_year-1` und `p_year`.
Beide `STABLE`, `SECURITY INVOKER`, ohne `p_user_id`.

**Berührt:** die Migration · `src/lib/supabase/types.ts` (neu generiert) ·
`src/lib/rpc.ts` (zwei Wrapper)

### P2 · Overlay und Menüpunkt auf Karten

Die Geometrie liegt in `verlauf.ts` — **ohne DOM, ohne React, ohne Supabase**. Das ist
kein Stilfrage: Nur so kann der Wächter aus P4 die **echte** Quelldatei transpilieren
und ausführen, statt die Regeln nachzubauen.

**Berührt:** `src/components/cards/verlauf.ts` (neu) · `verlauf-overlay.tsx` (neu) ·
`actions.ts` · `card-interactive.tsx` · `card.tsx` · `cards.module.css`

### P3 · Menüpunkt auf der Ordner-Kachel

Dieselbe Komponente, anderer Datenlader.

**Berührt:** `src/components/interaction-zone/category-tile.tsx` · `carousel.tsx`

### P4 · Wächter

20 Tests, eingetragen in `playwright.config.ts`.

**Berührt:** `tests/e2e/verlauf.spec.ts` (neu) · `playwright.config.ts`

---

## 2. Prüfstrecke

| | Ergebnis |
|---|---|
| `tsc --noEmit` | **0 Fehler** |
| ESLint (Worktree-Aufruf) | **0 Fehler / 0 Warnungen** |
| `pnpm build` | **0 Fehler** · Route `/` **39,5 kB** · First Load JS **192 kB** · Middleware 82,1 kB |
| `pnpm test:visual` | **168 / 168** *(v2-30: 148)* |
| `pnpm test:e2e` | **177 / 177** *(v2-30: 157)* |

**Beide Zahlen sind um genau 20 gestiegen** — die 20 selbst geschriebenen Tests aus P4.
Nichts ist weggefallen, nichts gleich geblieben.

> Die Gleichheit der beiden Zuwächse ist kein Zufall: `verlauf.spec.ts` läuft im
> `visual`-Projekt, und `test:e2e` schließt dieses Projekt ein.

---

## 3. Anker vorher/nachher

**Vollständiges Protokoll: `sprints/sprint_v2-31_anker.md`.** Beide Messungen in
derselben Sitzung, wenige Minuten auseinander.

| Anker | vorher | nachher | Urteil |
|---|---|---|---|
| Sparrate 24 Monate, Ist und Plan | siehe Protokoll | **byte-identisch** | ✅ |
| Goldlinie 2025 | 11.442,30 € | 11.442,30 € | ✅ |
| Σ Ist 2026 | 16.076,56 € | 16.076,56 € | ✅ |
| Anker 1 — Ordner-Spalte == Sparrate | 0,00 € in 24/24 | 0,00 € in 24/24 | ✅ |
| Anker 2 — `Σ delta = Ist − Plan` | 0,00 € in 24/24 | *(nicht erneut nötig)* | ✅ |
| Prüfsummen der neun Rechenfunktionen | 9 Werte | **alle neun identisch** | ✅ |
| **neu A** — Serien-Ist je Ordner == Kachel | — | **200 Zellen, 0 Verletzungen** | ✅ |
| **neu B** — Σ Ordner-Plan == Plan-Sparrate | 0,00 € in 24/24 | **±0,01 € in 12/24** | ⚠️ siehe unten |

**Kein Zahlenwert hat sich bewegt.** Das war das erwartete Ergebnis — die beiden neuen
Funktionen lesen ausschließlich und rufen bestehende Funktionen auf, statt zu rechnen.

> ⚠️ **Die 2025-Werte weichen erheblich von der Momentaufnahme in CLAUDE.md §9 ab**
> (Goldlinie dort 21.708,77 €, hier 11.442,30 €). Das ist **kein Befund**: Der Nutzer
> hat seit dem 25.08.2026 weiter kuratiert, und jede zugeordnete Zahlung senkt die
> Sparrate ihres Monats. Beide Invarianten sind dabei 24/24 exakt. Genau deshalb gibt
> es seit dem 13.08.2026 keine eingefrorene Sollwert-Tabelle mehr.

### Der Anker, der gerissen ist — und warum er bleibt, wie er ist

**Neu-Anker B war meine eigene Formulierung, und sie war ungenau.** Vor dem Bau habe
ich gemessen:

```
round( Σ_ungerundet (Karten-Plan × Anteil) + Netto-Plan , 2 )  ==  Plan-Sparrate
```

→ 0,00 € in allen 24 Monaten. Die Funktion liefert aber **je Ordner gerundete** Werte;
deren Summe weicht in **12 von 24** Monaten um ±0,01 € ab.

**Das ist LL-25, Wort für Wort:** *„‚Ungerundet summieren, erst am Ende runden' ist
notwendig, aber NICHT hinreichend — es behebt die Rundung innerhalb einer Gruppe; der
Cent geht zwischen den Gruppen verloren."* Innerhalb eines Ordners rechnet die Funktion
sauber; die Abweichung entsteht erst beim Addieren der Ordner.

**Es bleibt so.** Es gibt **keine Anzeige, die Ordner-Pläne summiert** —
`get_category_amounts_for_month` liefert `planned` für Karten-Ordner hart als `NULL`.
Anker 1 erzwingt den Ausgleich auf der **Ist**-Seite, weil dort eine **sichtbare**
Summe stimmen muss. Ein Ausgleich auf der Plan-Seite verschöbe den Plan **eines**
Ordners um fremde Rundungsreste, damit eine Zahl stimmt, die niemand sieht — und der
Verlauf zeigt genau **einen** Ordner.

Festgehalten im `COMMENT ON FUNCTION`, damit es zur Laufzeit sichtbar ist
(§6 Stolperfalle 12), plus ausführlich in der Migrationsdatei.

---

### Optischer Smoke — mit einer benannten Lücke

Der `smoke-agent` hat den Sprint geprüft und dabei **einen Auftragsteil verweigert**:
Seine Betriebs-Charta verbietet Kontextmenü-Aktionen kategorisch, auch für einen laut
Code rein lesenden Menüpunkt. Er hat den Widerspruch **benannt statt ihn aufzulösen**
(§7 Regel 19) — das ist das richtige Verhalten und wird hier festgehalten, damit die
Lücke nicht als Prüfung durchgeht.

**Was er stattdessen belegt hat:**

| | |
|---|---|
| Deterministische Suite | **177/177**, darunter 20/20 `verlauf.spec.ts` |
| Vier Dashboard-Zustände (Aug/Mai/Jan/Sep 2026) | alle ✅, kein Layout-Sprung, keine Fehlerseite |
| Diagnose-Render mit der **echten** `baueGeometrie` | Tanken, Netflix, Miete und ADAC in ihrer erwarteten Gestalt |
| Gegenprobe zur Split-Falle | Ein 43-%-Fehler ergäbe **64 px Abstand** bei 158 px Zeichenhöhe — er wäre unübersehbar |
| Menü-Gating | per Quellcode bestätigt: `ONCE` aus, Ghost drin, `INCOME`/`UNCATEGORIZED` ohne ⋯-Menü |

**Sein wichtigster Befund betrifft LL-6 — und er ist stärker als erwartet.** In
`page.tsx` sind `WelleStage` und `InteractionZone` **Geschwister**, nicht verschachtelt.
Der v2-10-Schaden entstand, weil das Einkommens-Popup als `leftSlot` **innerhalb** von
`WelleStage` gerendert wird und React Klicks entlang des **React**-Baums weiterreicht,
während `welle/index.tsx:162` mit `closest()` auf dem **echten DOM** prüft. Das
Verlaufs-Overlay hängt an `CardInteractive` bzw. `CategoryTile` — beide sind keine
React-Nachfahren von `WelleStage`. **Der Klick kann den Wächter strukturell nicht
erreichen**, nicht nur „wahrscheinlich nicht". Selbst nachgeprüft: `page.tsx:665–701`.

> ⚠️ **Was offen bleibt: Es hat niemand „Verlauf …" angeklickt.** Weder der Agent
> (Charta) noch ich (kein Browser in dieser Sitzung). Ein Interaktions-Bug, der nur im
> echten DOM auftritt — Z-Index-Stapel, Karussell-Scrollcontainer —, wäre bis hierher
> unentdeckt. **Das ist genau die Klasse, für die es den Browser-Smoke des Users gibt**
> (§4: automatisierte Tests sind ein Filter davor, kein Ersatz). Die Prüfschritte
> S1–S10 stehen im Briefing.

---

## 4. Selbst-Review gegen die Akzeptanzkriterien

| | Kriterium | erfüllt | Beleg |
|---|---|---|---|
| A1 | Verlauf öffnet aus dem Karten-Kontextmenü | ✅ | `card-interactive.tsx` Menüpunkt `Verlauf …` |
| A2 | Verlauf öffnet aus dem Ordner-⋯-Menü | ✅ | `category-tile.tsx` |
| A3 | 24 Monate, Vorjahr + angezeigtes Jahr | ✅ | Test „das Format ist MM/JJ und beginnt im Vorjahr" |
| A4 | Ist teal, Plan grau — **kein neuer Token** | ✅ | `cards.module.css`, Werte aus `welle/draw.ts` |
| A5 | Ist-Linie endet am laufenden Monat | ✅ | Test: 19 `L` im Ist-Pfad gegen 23 im Plan-Pfad |
| A6 | `heute`-Marke erklärt das Ende | ✅ | Test „die heute-Marke steht dort, wo die Ist-Linie endet" |
| A7 | Inaktive Monate brechen die Linie, fallen nicht auf 0 | ✅ | Test „kein inaktiver Monat landet auf der Nulllinie" — 2 Koordinaten statt 24 |
| A8 | Isolierte Werte werden als Punkt gezeichnet | ✅ | Test „eine jährliche Karte ergibt zwei isolierte Punkte" |
| A9 | Gemeinsame Karte: Plan auf den eigenen Anteil | ✅ | Gemessen: max. Abstand Miete **41,36 €** statt roh ~815 € |
| A10 | Split genau einmal, nur auf den Plan | ✅ | Migration; `ist` bleibt unangetastet |
| A11 | Einmal-Karten haben den Menüpunkt nicht | ✅ | Test + Probe 3 (rot ohne die Bedingung) |
| A12 | Ghost-Karten haben ihn | ✅ | Test „hängt NICHT an endDeleteOnly" |
| A13 | Ordner-Ist stimmt mit der Kachel überein | ✅ | Neu-Anker A: 200 Zellen, 0 Verletzungen |
| A14 | Beträge als Höhe, kein Rot für Ausgaben | ✅ | Test „negativ und positiv ergeben dieselbe Geometrie" |
| A15 | Overlay zentriert, nicht am Icon | ✅ | Portal an `document.body`, `overlayBackdrop` |
| A16 | Escape und Klick-außen schließen | ✅ | `verlauf-overlay.tsx` |
| A17 | Keine kumulierte Sicht (§9) | ✅ | Je Monat der Monatswert; im Record §0 begründet |
| A18 | Kein Zahlenwert bewegt | ✅ | Abschnitt 3 |
| A19 | Der Wächter kann auslösen | ✅ | Drei Proben, 2/3/3 rot — Abschnitt 5 |

---

### P5 · Nachtrag 03.09.2026 — zwei Änderungen aus der Anschauung

Der Nutzer hat die Entwürfe angesehen und zwei Dinge beauftragt. **Beides ist reines
Frontend** (`verlauf.ts`), die Datenbank blieb unangetastet.

**① Alle Verläufe sind eine durchgehende Linie.** Inaktive Monate laufen auf **0 €**,
statt die Linie zu brechen.

> **Das kehrt eine Entscheidung um, die ich getroffen und mit LL-20 begründet hatte —
> und die Begründung war eine Überdehnung.** LL-20 sagt: *„ein Referenzwert ohne Daten
> ist ‚keine Anzeige', nicht 0."* Gemeint ist ein **fehlender** Wert; „Budget frei" in
> einem Monat ohne Budget-Karten ist das Musterbeispiel. **Beim Verlauf ist die Null
> keine Falschaussage:** Er beantwortet „was hat mich das gekostet", und für einen Monat
> ohne Fälligkeit lautet die Antwort null Euro. Das ist wahr, nicht geschätzt.
>
> **Gesehen hat es der Nutzer, nicht die Prüfstrecke.** Der Wächter war grün, die Anker
> waren grün, das Argument im Record klang schlüssig. Am Bild fiel auf, dass die Reihen
> **zerhackt** aussehen und von der jährlichen Karte zwei einsame Punkte übrig bleiben,
> aus denen sich kein Rhythmus lesen lässt.

**② Die Y-Achse rastert in runden Schritten**, jede Linie beschriftet; der Schritt
wächst mit der Größenordnung, höchstens sechs Abschnitte.

> **Anlass gemessen am Ordner `Versicherungen`:** 18 von 24 Monaten liegen zwischen
> 223 und 262 €, der Dezember 2026 bei **597,36 €**. Die Achse **muss** bis 600 reichen.
> Vorher trug sie drei Rasterlinien und **zwei** Beschriftungen — man sah, *dass* die
> Linie flach verläuft, aber nicht, *auf welcher Höhe*. **Die Obergrenze war nicht das
> Problem** (600 statt 597,36 sind 0,4 % Luft), sondern die Leere dazwischen.

**Und ein Befund über meinen eigenen Wächter.** Die erste LL-40-Probe für Regel ②
**schlug nicht an** — ich hatte `: 0` auf `: null` zurückgedreht, aber `Math.abs(null)`
ist `0`, die Probe war also wirkungslos. Der Test blieb grün, obwohl ich ihn zu brechen
versuchte. Erst eine Probe an der richtigen Stelle machte ihn rot (6 Tests). **Das ist
genau der v2-29-Fall** aus LL-40: ein Muster, das die falsche Stelle trifft — nur diesmal
in der Probe statt im Test.

**Nebenbefund, nicht vom Sprint verursacht:** `render-smoke.spec.ts` wurde rot, weil er
vier Monate fest verdrahtet hatte und sich darauf verließ, dass September leer bleibt.
Der Nutzer hat am **01.09.2026** seinen Monatsabzug importiert (belegt über
`fragments.created_at`). Der Test wählt die Monate jetzt relativ zu heute — **LL-28 in
neuer Gestalt**: eine Annahme, die mit dem Kalender verfällt.

**Prüfstrecke:** `test:visual` **175/175** *(v2-30: 148)* · `test:e2e` **184/184**
*(v2-30: 157)*. Anker 1 in 24/24 bei 0 Verletzungen, Goldlinie 2025 unverändert.

---

## 5. Architektur-Entscheidungen

### ① Die Roadmap-Zusage prüfen, statt ihr zu glauben (LL-22)

Die Roadmap führte `M7` als *„datenseitig bereits abgedeckt —
`get_year_deviation_drivers` liefert je Karte ist und plan pro Monat. Reines
Oberflächen-Feature."* Der Eröffnungsauftrag baute darauf auf und schloss einen
Datenbank-Eingriff ausdrücklich aus.

**Gemessen hält die Zusage nicht.** Die Funktion trägt `WHERE round(delta_roh,2) <> 0`
und liefert nur **abweichende** Karten:

| 2026 | Jan | Feb | Mär | Apr | Mai | Jun | Jul | Aug | Sep | Okt | Nov | Dez |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| aktiv | 27 | 23 | 30 | 27 | 34 | 30 | 34 | 29 | 22 | 23 | 22 | 22 |
| geliefert | 11 | 5 | 5 | 5 | 7 | 3 | 5 | 5 | **0** | **0** | **0** | **0** |

Netflix läuft zwölf Monate exakt auf Plan → erscheint in **keinem** Monat.

**Alternative, die bestand:** die vorhandenen Einzel-RPCs 36-mal aufrufen (3 × 24) oder
`get_cards_for_month` 24-mal. Beides ohne Migration möglich.

**Gewählt: eine neue Serien-Funktion.** Dasselbe Argument, mit dem v2-24 (`PF-4`)
`get_sparrate_series` gebaut hat: aus 24 Netzrunden wurde eine. Anker 3 zählt die
Anfragen; ein Feature, das je Geste 36 kostet, arbeitet gegen ihn (LL-29). Der
Widerspruch zum Auftrag wurde dem User vorgelegt (§7 Regel 19), nicht stillschweigend
aufgelöst.

### ② Den Ordner-Ist holen statt nachrechnen

**Alternative:** die Karten der Kategorie direkt summieren. Einfacher, schneller
(21 ms statt 254 ms), und **falsch**.

`get_category_amounts_for_month` legt den Rundungs-Rest des Monats auf den
betragsgrößten Ordner, damit Anker 1 exakt gilt. **Gemessen am 31.08.2026:** In den
vier Zukunftsmonaten trägt jeweils ein Ordner **0,01 €** Ausgleich. Ein Nachbau zeigte
dort einen Cent weniger als die Kachel daneben — und **keine Zahl sähe dabei falsch
aus** (LL-25 / LL-26 „Nachbauen").

**Der Faktor 12 in der Laufzeit ist der Preis dieser Treue**, und er ist bezahlbar:
254 ms beim Öffnen eines Popups, nicht im Dashboard-Aufbau.

### ③ Die LL-20-Regel gehört in die Datenbank, nicht ins Frontend

`is_card_active_in_month` sagt `false`, und beide Betragsfunktionen liefern dann `0.00`.
Die Serien-Funktionen geben stattdessen **`null`** zurück.

**Alternative:** 0 liefern und die Unterscheidung im Frontend treffen. Dann entschiede
die Anzeige, was ein fehlender Wert bedeutet — und eine jährliche Karte läge in 22 von
24 Monaten auf der Nulllinie. §7 Regel 15 sagt das allgemein: Schwellen server-seitig
lesen und dort auswerten, die Komponente bekommt das Ergebnis.

### ④ Die Geometrie in ein eigenes Modul, ohne DOM und React

`verlauf.ts` importiert **nichts**. Das kostet eine zusätzliche Datei und eine
Umwandlung (`AmountSeriesPoint` → `VerlaufPunkt`).

**Der Gegenwert:** Der Wächter transpiliert die echte Quelldatei und führt sie aus. Ein
Nachbau im Test driftet ab und gibt falsche Sicherheit — diese Bauart hat in v2-12,
v2-17 und v2-19 je einen Fehler gefunden.

**Und `heute` wird übergeben statt intern gelesen.** Eine Funktion, die `new Date()`
selbst aufruft, ist nicht prüfbar; die Zeit kommt vom **Server**, damit eine falsch
gestellte Browser-Uhr die Ist-Linie nicht in die Zukunft verlängert.

### ⑤ Der Haushaltsbetrag steht NICHT in der Unterzeile — Abweichung vom Entwurf

Der Entwurf zeigte `… · von 1.904,00 €`, analog zur Karte.

**Beim Bauen fiel auf, dass das nicht trägt:** Der Entwurf zeigt einen Monat, der
Verlauf zeigt 24 — und die Miete hat darin **drei** verschiedene Haushaltsbeträge
(1.820 / 1.861 / 1.904 €). Eine feste Zahl wäre in 23 von 24 Monaten die falsche.

Die Zeile ist weggelassen; der Haushaltsbetrag steht weiterhin auf der Karte selbst
(Record vom 05.08.2026). **Verwandt mit LL-38:** Eine Zahl, die in einem Papier richtig
ist, veraltet mit einer Entscheidung auf derselben Seite — hier mit der Entscheidung,
24 Monate statt einem zu zeigen.

### ⑥ „Ohne Kategorie" bekommt keinen Verlauf

Er hat keine `categoryId` und deshalb ohnehin kein ⋯-Menü. **Das ist aber auch
inhaltlich richtig:** Der Behälter ist ein **Zufluss, kein Bestand** (Befund `D12`) —
jede neu angelegte Karte landet dort, bis sie einsortiert wird. Sein Verlauf zeigte den
Aufräumfortschritt statt des Ausgabeverhaltens, also genau den Fehler, den Befund `D4`
für die 2025-Kurve beschrieben hat.

---

## 6. Offene Punkte und Fragen

| | |
|---|---|
| **`KAT-5`** | Aus diesem Sprint herausgenommen. Record `A2` (07.08.2026) gilt unverändert; die Umsetzung ist ein eigener, kleiner Sprint. |
| **Kein Tooltip, kein Monatsklick** | Der Verlauf reagiert nicht auf Hover und nicht auf Klick. Werte liest man an der Y-Achse ab. Beides wäre eine eigene Gestaltungsentscheidung — nicht stillschweigend nachrüsten. |
| **Verlauf des Ordners `Einkommen`** | Er ist keine Karten-Gruppe (§8, Record `A4`) und hat kein Kontextmenü. Ob er einen Verlauf bekommen soll und was der zeigt, ist offen. |
| **Ordner mit wechselndem Vorzeichen** | Tritt heute nicht auf. Wenn es auftritt, ist „Betrag als Höhe" mehrdeutig — dann neu entscheiden, nicht raten. |
| **Gleitendes 24-Monats-Fenster** | Fest am Kalenderjahr. Die Verwandte davon ist `B1` (Paket 11). |
| **Laufzeit des Ordner-Verlaufs** | 254 ms in der Datenbank, Faktor 12 gegenüber dem Karten-Verlauf. Unter der Briefing-Schwelle (800 ms) und begründet (Anker-Treue). Steigt der Kartenbestand stark, gehört sie neu gemessen. |

---

## 7. Vorschläge für CLAUDE.md und Roadmap

### Roadmap

- **`M7` → ✅**, **`KAT-4` → ✅**. **Paket 10 („Verlauf") ist damit vollständig.**
- **`KAT-5` bleibt ⬜** in Paket 7 — aus v2-31 herausgenommen, Record `A2` gilt.
- **Bei `KAT-4` die alte Voraussetzung streichen.** Dort steht, der Punkt setze eine
  kuratierte Datenbasis voraus (Befund `D4`: *„heute hängen in Jan–Apr 0,0 % der
  Ausgaben an einer Karte … für ganz 2025 wäre sie null"*). **Das gilt nicht mehr:**
  `DA-1` (v2-27) hat die Karten zurückdatiert, `DA-3` (v2-28) ihre Pläne gesetzt.
  Gemessen am 31.08.2026 hat in **allen 20** vergangenen Monaten **jede** aktive Karte
  eine verknüpfte Zahlung oder einen Tap — `reine_plan_kopie = 0`.

### CLAUDE.md — ein Vorschlag, zur Freigabe

**Nur einer.** Der Sprint hat viel bestätigt, was schon steht (LL-20, LL-22, LL-25,
LL-26, LL-29, LL-40) — das gehört in die Historie, nicht in die Verfassung.

**Neue Stolperfalle: Eine Aggregation ist an EINER Stelle ausgleichspflichtig und an
der anderen nicht — und beide Stellen sehen gleich aus.**

`get_category_amounts_for_month` **muss** den Rundungs-Rest ausgleichen, weil Anker 1
eine sichtbare Summe erzwingt. Die Plan-Seite derselben Gruppierung **darf** ihn nicht
ausgleichen, weil es dort keine sichtbare Summe gibt — ein Ausgleich verschöbe den
Wert *eines* Ordners um fremde Reste.

Wer LL-25 kennt, neigt dazu, den Ausgleich überall einzubauen, wo eine Gruppierung
stattfindet. **Die Frage ist nicht „wird gruppiert?", sondern „wird die Summe der
Gruppen irgendwo angezeigt?"** Ohne diesen Ort ist der Ausgleich keine Korrektur,
sondern eine Verfälschung.

> Das ist keine Wiederholung von LL-25, sondern seine **Grenze**. LL-25 sagt, wann man
> ausgleichen muss; dieser Fall sagt, wann man es lassen muss. Beides zusammen
> ergibt erst eine benutzbare Regel.

**Außerdem zu prüfen:** ob §9 einen Nachtrag braucht, der die Abgrenzung „monatlich ja,
kumuliert nein" festhält (siehe Doku-Patches). Der Verlauf ist die erste Fläche, die
diese Grenze berührt, und Befund `U5` hat ausdrücklich davor gewarnt, dass die
Exklusivitäts-Aussage in der Funktions-Einleitung steht und deshalb übersehen wird.

---

*Review · Antigravity Finance · Sprint v2-31 · 31. August 2026*
