# Sprint v2-28 — Review

> **Branch:** `sprint/v2-28-2025-korrekturen`, aufgesetzt auf `origin/main`
> (Merge von PR #43, gegen den Baum geprüft — nicht gegen den PR-Status).
> **Commits:** `c0af98b` (P1) · `fec34bf` (P2) · `643ba55` (P3) · dazu dieser Doku-Commit.
> **Datum:** 24. August 2026.
>
> **In einem Satz:** Die 2025-Pläne tragen jetzt die Beträge, die wirklich gezahlt
> wurden, die Monatsnavigation endet dort, wo die Daten enden, und Tankstellen wie
> Nahverkehr ordnen sich künftig von allein zu.
>
> **Die Sparrate hat sich um genau den Betrag bewegt, der vorher aufgeschrieben war
> — und in 2026 um 0,00 € in allen zwölf Monaten.**

---

## 1. Was gebaut wurde

### P1 · Die 2025-Pläne stimmen *(Datenbank, Schreibzugriff)*

**Absicht.** v2-27 hat für jede zurückdatierte Karte **eine** Plan-Zeile für 2025
gesetzt, gebildet als Jahresdurchschnitt der tatsächlichen Zahlungen. Das ist an
zwei Stellen zu grob — bei **Ausreißern** und bei echten **Preiswechseln**. Die
Jahressumme stimmt in beiden Fällen; die Monatswerte nicht.

**Vier Karten, alle gegen die Zahlungen belegt:**

| Karte | vorher | nachher | Befund |
|---|---|---|---|
| Handyvertrag | `2025-01 = 33,07` | `2025-01 = **33,00**` | zehnmal 33,00, dazu 33,40 (August) und 33,44 (Dezember) |
| Netflix | `2025-01 = 18,99` | `2025-01 = **19,99**` · `2025-11 = **13,99**` | Preis**senkung** im November |
| Spotify | `2025-01 = 11,16` | `2025-01 = **10,99**` · `2025-12 = **12,99**` | Preis**erhöhung** im Dezember |
| Friseur | ab `2026-01` | ab **`2025-01`**, Plan 45,00 | Karte reichte nicht zurück |

**Weder 18,99 € noch 11,16 € kommt in den Daten ein einziges Mal vor.** Beide
Mittelwerte waren rechnerisch tadellos gebildet — (10 × 19,99 + 2 × 13,99) / 12
ergibt exakt 18,99 — und trotzdem in **keinem** Monat der gezahlte Betrag.

> **Der Nebenbefund, der die Diagnose bestätigt:** Netflix trug für `2026-01`
> bereits **13,99**, Spotify bereits **12,99**. Die neuen 2025-Zeilen treffen also
> exakt die Beträge, die ohnehin ab Januar 2026 gelten. **Die Preiswechsel waren die
> ganze Zeit in der Datenbank — nur im falschen Jahr.**

**Berührte Dateien:** `supabase/migrations/20260824_v2_28_p1_2025_plaene.sql`.

### P2 · Die Navigation endet dort, wo die Daten enden *(Frontend)*

**Absicht.** Die untere Schranke stand seit Sprint 3 auf `MIN_NAVIGABLE_YM =
"1900-01"` — ein im Code selbst als „absurd weit" markierter V1-Platzhalter. Der
Zurück-Pfeil führte über Jahrzehnte in eine leere Bühne.

**Lösungsweg.** `MIN_NAVIGABLE_YM` entfällt ersatzlos. An seine Stelle tritt
`deriveMinNavigableYm(firstActiveMonths, fallbackYm)` — eine **reine Funktion** in
`src/lib/months.ts`, gespeist aus `rawCards`, die `page.tsx` ohnehin lädt. Die
Komponente bekommt das Ergebnis als **Pflicht-Prop**.

Drei Entscheidungen tragen das, alle in §5 begründet: abgeleitet statt fest
verdrahtet · aus den Karten statt aus den Zahlungen · Pflicht-Prop statt optional.

**Berührte Dateien:** `src/lib/months.ts` · `src/app/page.tsx` ·
`src/components/header-timeline/index.tsx` · `…/header-timeline.types.ts` ·
`tests/e2e/navigationsgrenze.spec.ts` (neu) · `playwright.config.ts`.

### P3 · Mobilitäts-Händler ordnen sich selbst zu *(Datenbank + Import)*

**Absicht.** Tankstellen und Nahverkehr tauchen unter ständig neuen Namen auf und
mussten bisher jeden Monat von Hand auf „Tanken" gezogen werden. Der Nutzer hat das
**75-mal** getan.

**Lösungsweg — in zwei Migrationen, und die Reihenfolge ist inhaltlich begründet:**

**P3a** legt die zweistufige Wortliste in `app_config` ab
(`matching.merchant_rules`), dazu den Wert, auf den ein Treffer die Konfidenz hebt
(`confidence.merchant_rule_score` = **0,96**). Die neue Funktion
`merchant_rule_match` liefert 1 oder 0; `calculate_match_confidence` zieht die
Konfidenz mit demselben `GREATEST` hoch, das sie für `history_match` schon benutzt.

> **An `process_csv_import` war nichts zu ändern.** 0,96 liegt über der
> Auto-Absorptions-Schwelle von 0,95 — der Import verlinkt solche Zahlungen damit ab
> sofort von allein. Beide Zahlen stehen in `app_config`, nicht im Code (§7 Regel 5).

**P3b** verlinkt die **65** offenen Zahlungen aus 2025 (1.520,22 €) nach.

> **Warum P3b die Funktion AUFRUFT, statt die Liste zu wiederholen.** Die Auswahl
> steht dort als `calculate_match_confidence(...) >= Schwelle`, nicht als zweite
> Wortliste. Eine zweite Formulierung derselben Regel wäre die Form **„Nachbauen"**
> aus LL-26 — genau das, was in v2-20 passiert ist, als `page.tsx` das Lösch-Tor
> nachbaute und streng blieb, während die Datenbank großzügiger wurde. Deshalb muss
> P3a vorher laufen, und deshalb sind es zwei Migrationen.

**Berührte Dateien:** `supabase/migrations/20260824_v2_28_p3a_haendler_regel.sql` ·
`…_p3b_bestand_nachverlinken.sql`.

---

## 2. Prüfstrecke

| Prüfung | Erwartung | Ergebnis |
|---|---|---|
| `tsc --noEmit` | 0 Fehler | **0** ✅ |
| ESLint (`--no-eslintrc`-Umweg) | 0/0 | **0 Fehler, 0 Warnungen** ✅ |
| `pnpm build` | 0 Fehler | **Exit 0** ✅ · Route `/` **36,9 kB** · First Load JS **189 kB** · geteilt **87,3 kB** — **alle drei unverändert gegenüber v2-27** |
| `pnpm test:visual` | steigt nur um eigene Tests | **137/137** ✅ (127 → 137, die zehn neuen) |
| `pnpm test:e2e` | vollständig grün | **146/146** ✅ (136 → 146) inkl. Render-Smoke |

> ### ⚠️ Die Testzahl hat einen echten Fehler gefangen — den in der Konfiguration
>
> `tests/e2e/navigationsgrenze.spec.ts` lag fertig und grün da **und lief nicht.**
> Das `visual`-Projekt hat eine **feste Dateiliste** in `playwright.config.ts`; eine
> neue `*.spec.ts` wird nicht von allein erkannt.
>
> **Aufgefallen ist es ausschließlich daran, dass die Gesamtzahl bei 127 stehen
> blieb.** Genau dafür steht die Regel „nur gestiegen, und nur um selbst geschriebene
> Tests" in `sprint-abschluss`, und genau davor warnt die Konfiguration in einem
> eigenen Kommentarblock. Beide Warnungen haben funktioniert — aber erst, weil die
> Zahl verglichen wurde. Ein „grün" ohne Zahl hätte nichts verraten.
>
> **Der Wächter für die Blindstelle dieses Sprints hätte sonst nur so ausgesehen, als
> gäbe es ihn.** Dasselbe war in v2-19 beinahe mit `gehalt.spec.ts` passiert.

**Zusätzlich, einmalig und bewusst nicht committet:** Der Zurück-Pfeil wurde gegen
**echte Daten** geprüft, nicht nur gegen Fixtures — bei `?month=2025-01` existiert
kein Link auf `2024-12`, bei `?month=2025-02` existiert einer auf `2025-01`. Der
Prüfschritt lief im Render-Smoke und wurde danach entfernt: Er hinge sonst am
heutigen Datenstand und würde nach einem Import älterer Auszüge rot, ohne dass
etwas kaputt wäre.

---

## 3. Anker vorher/nachher

Vollständiges Protokoll mit allen Zwischenständen: **`sprints/sprint_v2-28_anker.md`**.
Alle Messungen stammen aus **derselben Sitzung**.

| Monat 2025 | Ist vorher | Ist nachher | Δ | | Plan vorher | Plan nachher | Δ |
|---|---|---|---|---|---|---|---|
| 01 | 1.748,93 | **1.704,00** | −44,93 | | 1.848,33 | **1.802,57** | −45,76 |
| 02 | 1.776,51 | **1.730,58** | −45,93 | | 1.866,42 | **1.820,66** | −45,76 |
| 03 | 1.811,58 | **1.765,65** | −45,93 | | 1.866,42 | **1.820,66** | −45,76 |
| 04 | 1.850,46 | **1.804,53** | −45,93 | | 1.849,54 | **1.803,78** | −45,76 |
| 05 | 1.888,22 | **1.842,29** | −45,93 | | 1.887,30 | **1.841,54** | −45,76 |
| 06 | 1.898,12 | **1.852,19** | −45,93 | | 1.897,20 | **1.851,44** | −45,76 |
| 07 | 1.866,97 | **1.821,04** | −45,93 | | 1.866,05 | **1.820,29** | −45,76 |
| 08 | 1.908,07 | **1.862,14** | −45,93 | | 1.907,15 | **1.861,39** | −45,76 |
| 09 | 1.904,67 | **1.858,74** | −45,93 | | 1.907,15 | **1.861,39** | −45,76 |
| 10 | 1.873,52 | **1.827,59** | −45,93 | | 1.876,00 | **1.830,24** | −45,76 |
| 11 | 1.894,72 | **1.854,79** | −39,93 | | 1.897,20 | **1.857,44** | −39,76 |
| 12 | 1.894,55 | **1.852,79** | −41,76 | | 1.897,20 | **1.855,44** | −41,76 |

**Jahressumme 2025 Ist: 22.316,32 → 21.776,33 €.**
**2026: in allen zwölf Monaten unbewegt, Ist und Plan — 0,00 €.**

| Wächter | Ergebnis |
|---|---|
| **Anker 1** (Ordner-Spalte == Sparrate) | **24/24 exakt**, vorher wie nachher |
| **Anker 2** (Σ delta == Ist − Plan) | **24/24 exakt**, vorher wie nachher |
| **Neun Prüfsummen** | **9 Treffer, 0 Abweichungen** — vor P1, nach P1, nach P3 |
| **P3 allein** | Sparrate in allen 24 Monaten **unverändert** |

> **`calculate_match_confidence` hat eine neue Prüfsumme, und das ist richtig so.**
> Sie gehört nicht zu den neun: Sie **ordnet zu**, sie rechnet keine Sparrate. Der
> Sprint hat genau die Funktion angefasst, die er anfassen sollte, und keine andere.

---

## 4. Selbst-Review gegen die Akzeptanzkriterien

| # | Kriterium | erfüllt | Beleg |
|---|---|---|---|
| **A1** | Handyvertrag `2025-01` = 33,00 | ✅ | Anker §4, Plan-Zeitreihen |
| **A2** | Netflix `2025-01` = 19,99, `2025-11` = 13,99 | ✅ | ebenda |
| **A3** | Spotify `2025-01` = 10,99, `2025-12` = 12,99 | ✅ | ebenda |
| **A4** | Friseur ab `2025-01`, Plan 45,00 | ✅ | `first_active_month = 2025-01-01` |
| **A5** | UPSERT auf `(card_id, effective_month)`, nie INSERT | ✅ | `…p1_2025_plaene.sql`, `ON CONFLICT … DO UPDATE` |
| **A6** | Friseur: Rückdatierung und Plan-Zeile in EINER Transaktion | ✅ | ein einziger `DO`-Block; im Trockenlauf mit `SET CONSTRAINTS ALL IMMEDIATE` erzwungen geprüft |
| **A7** | Handyvertrag +0,84 € übers Jahr | ✅ | §3 · 12 × 0,07 |
| **A8** | Friseur −540,00 € übers Jahr | ✅ | §3 · 12 × 45,00 |
| **A9** | Netflix/Spotify Jahressumme 2025 unverändert | 🟡 | **präzisiert**, siehe unten |
| **A10** | 2026 exakt 0,00 € in allen zwölf Monaten | ✅ | §3 |
| **A11** | Beide Invarianten in allen 24 Monaten | ✅ | §3 |
| **A12** | Neun Prüfsummen byte-identisch | ✅ | §3 |
| **A13** | `MIN_NAVIGABLE_YM` dynamisch, ohne zusätzliche Netzrunde | ✅ | `page.tsx` nutzt das schon geladene `rawCards` |
| **A14** | Obergrenze bleibt offen | ✅ | `MAX_NAVIGABLE_YM` unverändert `2999-12`, Wächter prüft es |
| **A15** | Regel dauerhaft in `app_config`, nicht einmalig | ✅ | zwei Schlüssel, Funktion liest sie zur Laufzeit |
| **A16** | Zweistufige Liste, `af_word_in_text` macht die Wortgrenzen | ✅ | `merchant_rule_match`, kein neuer Grenz-Code |
| **A17** | RMV gehört dazu | ✅ | in `eindeutig` |
| **A18** | `DB Vertrieb` NICHT | ✅ | **0 von 34** Zeilen getroffen |
| **A19** | Keine bestehende Zuordnung aufgehoben | ✅ | `MANUAL_DROP` auf „Tanken" vorher 77, nachher 77 |
| **A20** | Keine Kuratierung 2025 | ✅ | 553 Zahlungen bleiben offen |
| **A21** | Prüfstrecke vollständig | ✅ | §2 |

> ### ⚠️ A9 steht auf 🟡 — die Erwartung war zu grob, nicht die Umsetzung
>
> Die Briefing-Zeile *„Netflix und Spotify: Jahressumme 2025 unverändert"* stimmt
> **für den Plan und nur für Netflix exakt.** Die gebauten Beträge sind unverändert
> die beauftragten; präzisiert wurde die **Erwartung**, und zwar **vor** dem Eingriff
> (Anker §3), damit der Nachher-Vergleich trennscharf sein kann.
>
> **Zwei Gründe, beide gemessen:**
>
> **① Bei Fixkosten gewinnt die Realität.** Ein Monat mit **verlinkter** Zahlung ist
> gegen Plan-Änderungen immun — sein Ist steht schon fest. Netflix hat für 2025 nur
> den **Januar** verlinkt, Spotify **Januar bis November**. Ist und Plan bewegen sich
> deshalb unterschiedlich: Netflix Ist **+1,00** / Plan **0,00**, Spotify Ist
> **−1,83** / Plan **+0,04**.
>
> **② Spotifys alter Mittelwert war gerundet.** (11 × 10,99 + 12,99) / 12 =
> 11,15666… → 11,16. Über zwölf Monate sind das **0,04 €**, die der Plan jetzt
> zurückgewinnt. Netflix' Mittelwert war exakt, dort bleibt es bei 0,00.

---

## 5. Architektur-Entscheidungen

**① Die Navigationsgrenze wird abgeleitet, nicht gesetzt.**
Alternative: `MIN_NAVIGABLE_YM = "2025-01"`. Wäre heute richtig und nach dem nächsten
Import älterer Auszüge **still falsch** — dieselbe Klasse wie die Mengen-Annahme aus
LL-28, die mit ihrer Begründung veraltet, ohne dass jemand es merkt.

**② Die Grenze kommt aus den Karten, nicht aus den Zahlungen.**
Alternative: eine zweite Abfrage auf `min(fragments.transaction_date)`. Das wäre eine
zusätzliche Netzrunde für eine Information, die schon da ist (LL-29). Gemessen am
24.08.2026: früheste Karte **2025-01**, früheste Zahlung **02.01.2025**, frühestes
Einkommen **2025-01** — die Karten sind tatsächlich die äußere Grenze. **Sollten je
Zahlungen vor der ersten Karte liegen, ist `deriveMinNavigableYm` die Stelle, an der
das auffallen muss** — dann braucht es eine zweite Quelle, keinen größeren Puffer.

**③ `minNavigableYm` ist ein Pflicht-Prop, kein optionales mit Vorgabewert.**
Ein Vorgabewert hätte denselben Fehler wieder möglich gemacht: still eine Grenze
bekommen, die niemand geprüft hat. So fragt der Compiler jeden künftigen Einbauort.

**④ Die Händler-Regel hebt an und senkt nie.**
`GREATEST` wie bei `history_match`. Eine Regel, die eine gute Namensübereinstimmung
nach **unten** zöge, wäre eine Verschlechterung, die niemand suchen würde — und
LL-27 zeigt, wie leicht eine „Verbesserung" in Wahrheit eine ist.

**⑤ Die Regel ist nach KARTENNAME geschlüsselt, nicht nach `card_id`.**
Eine UUID in einer Konfigurationstabelle ist für einen Menschen nicht lesbar und
überlebt keinen Neuaufbau. **Der Preis ist echt:** Wird die Karte umbenannt, greift
die Regel still nicht mehr. Das steht in der `description`-Spalte, damit es beim
Umbenennen auffällt — und in §6 als offener Punkt.

**⑥ Das zweite Signal sucht ohne Wortgrenze.**
`af_word_in_text('tank', 'jet tankstelle')` findet **nichts** — die Regex verlangt
hinter dem Wort ein Nicht-Alphanumerisches, und dort steht ein „s". Ausgerechnet
„JET Tankstelle", der Fall, für den Stufe 2 gebaut ist, fiele durch. Bei einem
Teilwort-Signal ist Teilwort-Suche das Richtige.

**⑦ P3 sind zwei Migrationen, damit P3b die Funktion aufrufen kann.**
Siehe §1. Nebenwirkung, die man kennen muss: P3b ist ohne P3a nicht reproduzierbar.

**⑧ Der Riegel `v_anzahl <> 65` steht im Code, nicht im Kommentar.**
Zwischen Messung und Anwendung kann der Nutzer kuratiert haben. Dann ist Anhalten und
neu messen richtig — nicht stillschweigend eine andere Menge anfassen. Dieselbe
Haltung wie die Anker-Messregel.

---

## 6. Offene Punkte und Fragen

**① Der Juli 2025 hat 79 Cent Luft im Tank-Budget — nicht 40 Euro.**
Das Briefing nennt als höchsten Monat 199,21 € bei 240,00 € Budget. Gemessen sind es
**239,21 €**. Die Differenz ist genau **eine RMV-Fahrt über 40,00 € vom 02.07.2025**:
Die Briefing-Zahl entstand, bevor der Nahverkehr in die Liste kam, und wurde danach
nicht nachgezogen. **Dasselbe gilt für die Wirkungszahl:** 55 Zahlungen / 1.262,92 €
ist der Stand ohne Nahverkehr, **65 / 1.520,22 €** der Stand mit.

Die Schlussfolgerung des Briefings hält — kein Monat wird überschritten, die Sparrate
bewegt sich nicht. **Aber: eine einzige nachträglich zugeordnete Tankfüllung im Juli
2025 kippt den Monat in ÜBERSCHRITTEN, und dann bewegt sich die Sparrate.** Wer dort
kuratiert, sollte das wissen.

**② Die Friseur-Folgepflicht liegt beim Nutzer.**
Es gibt **keine** Belege für Friseurbesuche 2025 — der Salon `Zeil 57` taucht in der
gesamten Rohmasse erstmals am 05.01.2026 auf; 2025 gibt es nur Bargeld-Abhebungen.
Die Karte plant jetzt 12 × 45,00 € ohne Realität dagegen. **Werden die passenden
Abhebungen bei der Kuratierung nicht der Friseur-Karte zugeordnet, sondern dem
Privaten Budget, zählt dasselbe Geld zweimal.**

**③ Zwei Zahlungen, bei denen die Regel dem Nutzer widerspricht.**
Ein `Agip` über 29,82 € (Januar 2026) und ein `RMV-HANDYTICKET` über 7,75 € (August
2026) liegen auf „Privates Budget". Beide wurden **nicht** angefasst. Bei künftigen
Importen würde die Regel solche Fälle nach „Tanken" schicken. Bei 75 Übereinstimmungen
gegen 2 Widersprüche (**97,4 %**) ist das hingenommen; rückgängig macht es ein Zug mit
der Maus.

**④ Wird „Tanken" umbenannt, greift die Regel still nicht mehr.**
Siehe §5 ⑤. Es gibt heute keinen Wächter dafür. Ein Vorschlag steht in §7.

**⑤ Die Roadmap-Punkte, die das Briefing bewusst nicht in den Sprint gelegt hat**,
sind unverändert offen: die **191 Zahlungen mit Buchungsdatum im Text** (siehe §7),
`MOBILE SUICA APPLE V` ohne Karte, und `KJ-9` (Lösch-Toast gegen Design-Doku §12.5).

**⑥ Nicht ausgeführt: `refresh_fragment_suggestions`.**
Die Anzeige-Spalten `confidence` / `suggested_card_id` der **übrigen** offenen
Zahlungen sind vom Stand vor diesem Sprint. Für die Händler-Regel ist das ohne Belang
— was sie trifft, ist verlinkt. Ein Nachrechnen wäre ein eigener, mutierender Aufruf
und stand nicht im Auftrag.

---

## 7. Vorschläge für CLAUDE.md und Roadmap

**Als Vorschlag formuliert — die Anwendung braucht die Freigabe des Users.**

### Für CLAUDE.md

**① §6 neue Stolperfalle: „Eine Wortgrenzen-Suche findet kein Teilwort."**
`af_word_in_text` ist die richtige Wahl für Händlernamen und die **falsche** für ein
Teilwort-Signal. Beides in einer Regel zu haben ist kein Widerspruch, sondern eine
bewusste Unterscheidung — sie muss nur benannt sein, sonst „vereinheitlicht" sie die
nächste Sitzung.

**② §6 neue Stolperfalle: „Eine Zahl im Briefing kann von einer späteren Entscheidung
überholt sein."** Die 55 / 1.262,92 € und die 199,21 € waren korrekt **bevor** der
Nahverkehr aufgenommen wurde. Nichts daran war falsch gerechnet; die Zahl wurde nur
nicht nachgezogen. **Dieselbe Klasse wie LL-28 und LL-30, nur innerhalb eines einzigen
Dokuments.** Gegenmittel: Wer eine Entscheidung ändert, sucht im selben Papier nach
den Zahlen, die daraus folgen.

**③ §8 neuer Eintrag LL-37 zu ②.**

**④ §6 Stolperfalle 8 ist überholt.** Sie nennt „den Roh-Plan `cards.planned_amount`"
— **diese Spalte existiert nicht.** Der Plan liegt vollständig in
`card_planned_timeline`. Gemessen gegen `information_schema` am 24.08.2026.

**⑤ §9 Sprint-Stand, Doku-Versionen und Roadmap-Zahlen** auf v2-28 nachziehen.

**⑥ §9 Momentaufnahme:** Die Tabelle vom 13.08.2026 ist durch v2-27 **und** diesen
Sprint überholt. Sie trägt bereits den Hinweis, dass sie kein Sollwert ist — eine
Zeile mit dem heutigen Stand für 2025 wäre trotzdem ehrlicher.

### Für die Roadmap

**⑦ Neuer erledigter Punkt `DA-3`** (Paket 6): die 2025-Pläne auf die tatsächlich
gezahlten Beträge. Ein Nachzug zu `DA-1`.

**⑧ Neuer erledigter Punkt `ZO-4`** (Paket 5): die Händler-Regel.

**⑨ Neuer erledigter Punkt `NAV-1`**: die dynamische Navigationsgrenze. Sie stand
in **keinem** Paket — dasselbe Muster wie Performance vor v2-24.

**⑩ Neuer offener Punkt `ZO-5`** (Paket 5): Zahlungen, die das **Buchungsdatum im
Text** tragen (`… | VISA Debitkartenumsatz vom 03.01.2026`), sind für die
automatische Zuordnung strukturell unsichtbar — der Name ist jedes Mal ein anderer.

**Nachgemessen am 24.08.2026, und die Zahl hat sich durch diesen Sprint selbst
bewegt:**

| | vor v2-28 | nach v2-28 |
|---|---|---|
| offene Zahlungen 2025 | 618 | **553** |
| davon mit Datum im Text | 191 | **147** |
| **davon mit Vorschlag ≥ 0,60** | **0** | **0** |

**Die Händler-Regel hat 44 dieser Fälle bereits mit erledigt** — die Tank-Zahlungen
tragen genau dieses Muster (`Agip | VISA Debitkartenumsatz vom …`) und werden jetzt
über den **Händlernamen** erkannt statt über Namensähnlichkeit. Das ist ein Hinweis
auf die Lösungsrichtung: nicht die Ähnlichkeitsfunktion reparieren, sondern den
**stabilen Teil** des Textes vom veränderlichen trennen.

**Die entscheidende Zahl bleibt aber die Null:** Von 147 Zahlungen bekommt **keine
einzige** einen Vorschlag. Zum Vergleich: Von allen 553 offenen haben **183** einen.
Das ist der stärkste bekannte Hebel für die Kuratierung 2025 und verdient einen
eigenen Punkt neben `ZO-1`.

**⑪ Neuer offener Punkt `ZO-6`** (Paket 5): ein Wächter dafür, dass eine
Händler-Regel auf einen Kartennamen zeigt, den es gibt. Heute scheitert sie still.
Klein, aber genau die Klasse Fehler, die dieses Projekt teuer bezahlt.
