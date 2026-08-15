# Sprint v2-21 — Review

> **Branch:** `sprint/v2-21-zuordnung` · **Basis:** `sprint/v2-20-papierkorb-loeschen`
> (PR #30, beim Start noch offen — User-Entscheid, weil die v2-20-Migrationen bereits
> auf Produktion liegen) · **Datum:** 15. August 2026 · **Paket 5** (`M6`)
>
> **In einem Satz:** Die automatische Zuordnung schlägt jetzt für 115 statt 9 offene
> Zahlungen eine Karte vor — weil sie Wörter statt Zeichenketten vergleicht, aus den
> eigenen Handzuordnungen lernt und Vorschläge nachrechnet, statt sie nur einmal beim
> Import zu berechnen.

---

## 1. Was gebaut wurde

### Der Befund zuerst — er hat den Sprint umgeschnitten

Der Eröffnungsprompt trug einen Verdacht: *Die Konfidenz wird nur einmal beim Import
berechnet und nie wieder — ein Nachrechnen wäre der größere Hebel als jeder bessere
Algorithmus.*

**Der Verdacht stimmt. Der Schluss daraus nicht.**

`calculate_match_confidence` hat im gesamten Schema genau einen Aufrufer
(`process_csv_import`) und steht dort hinter `IF v_was_inserted` — sie läuft
ausschließlich für neu eingefügte Zeilen. Belegt auch in den Daten: 1.590 Fragmente,
davon **1.567 ohne Konfidenz**, und die 23 mit Konfidenz sind exakt dieselben 23 mit
Vorschlag.

Aber ein reines Nachrechnen mit dem **heutigen** Algorithmus hätte für 2026 nur
36 von 284 Zahlungen (12,7 %) etwas gebracht. 247 hatten einen Score — nur zu
niedrigen. Die Masse scheiterte woanders, in drei Schichten:

| # | Befund | Beleg |
|---|---|---|
| ① | **Die Badge-Schwelle ist ohne Namenstreffer unerreichbar.** `frequency_match` prüft nur, ob die Karte im Monat aktiv ist — worauf der Aufrufer bereits filtert. Sie liefert *immer* 1.00. Betrag + Frequenz ergeben höchstens 0,50, die Schwelle liegt bei 0,60 | Frequenz-Mittelwert 1.00 über **alle** fünf Score-Klassen; 72 Zahlungen klemmen im Band 0,50–0,60 mit Betrag 1.00 und Name 0,05 |
| ② | **Die Namensfunktion ist blind für Teilwörter** — sie vergleicht die ganzen Strings und kennt nur den vollständigen Kartennamen als Substring | `Nurnberger…` vs `Private Altersvorsorge - Nürnberger` = **0,139**; `Alte Leipziger…` = 0,344; `Vodafone GmbH…` = 0,225 |
| ③ | **Die eigene Historie wird nicht genutzt** — 101 Handzuordnungen aus Juli/August, die niemand ausliest | 86 der 284 offenen Zahlungen (30 %) tragen eine schon einmal zugeordnete Beschreibung |

**Die Messgrundlage:** Juli und August sind zu 100 % von Hand zugeordnet. Diese
101 Entscheidungen sind ein echtes Prüfset — nicht simuliert, sondern die Antworten
des Nutzers selbst.

### P1 · Die Namensfunktion lernt Wörter lesen

`supabase/migrations/20260815_v2_21_p1_namensaehnlichkeit.sql` · Commit `9147e63`

Neu: `af_normalize_text` (Umlaute, ß), `af_word_in_text` (echte Wortgrenzen),
`name_similarity_scoped` (wortweiser Vergleich mit Entwertung).

**Die naive Fassung wäre schlechter als gar keine gewesen** — und das ist der
eigentliche Ertrag dieser Phase. Bloß wortweise zu vergleichen hob die richtigen
Vorschläge von 14 auf 27, die **falschen** aber von 1 auf **18**. Zwei Ursachen,
beide gemessen statt vermutet:

- **Der Vorname.** `aline` steht in **sieben** Kartennamen und traf überall mit 1.00.
  13 der 18 Falschtreffer kamen von hier.
- **Die Substring-Falle.** `Doug|las` traf `Radbrille - Glas`, `Kauf|land` traf
  `Kauf iPhone 15ProMax`.

Die Abhilfe braucht **keine gepflegte Stoppwortliste**: Ein Kartenwort, das in `n`
Kartennamen desselben Nutzers vorkommt, kann diese `n` Karten nicht unterscheiden und
zählt nur `1/n`. Gemessen: `aline` → 1/7, `nurnberger` → 1/1, `leipziger` → 1/1.

### P2 · Die eigene Historie wird zur vierten Komponente

`supabase/migrations/20260815_v2_21_p2_wiedererkennung.sql` · Commit `b1d76ad`

Neu: `history_match`, `app_config`-Schlüssel `confidence.history_score` (0,94).

Zwei Entscheidungen, die im Diff nicht sichtbar wären:

- **Gelernt wird nur aus `MANUAL_DROP`.** Eine automatische Zuordnung ist keine
  Zustimmung des Nutzers, sondern eine Vermutung der App — würde sie mitgelernt,
  verstärkte sich ein Fehler bei jedem Import selbst. Heute wäre das theoretisch
  (4 von 132 Verknüpfungen), genau deshalb ist jetzt der billige Zeitpunkt.
- **Sie wirkt als Untergrenze, nicht als Summand.** Ein vierter *gewichteter* Anteil
  hätte alle Scores gesenkt, bei denen keine Historie vorliegt — und das sind die
  meisten. `GREATEST` kann nur heben; die bestehenden Gewichte summieren sich weiter
  auf 1,0.
- **Gedeckelt auf 0,94**, knapp unter der Auto-Absorptions-Schwelle: sichtbarer
  Vorschlag, niemals eine automatische Verknüpfung.

### P3 · Nachrechnen, ohne zu verlinken

`supabase/migrations/20260815_v2_21_p3_nachrechnen.sql` · Commit `fe92ced`

Neu: `refresh_fragment_suggestions(p_from_month, p_to_month)`.

**Die scharfe Kante dieses Sprints:** `suggested_card_id` zu setzen bewegt keine Zahl,
`card_fragment_links` zu schreiben bewegt sofort die Sparrate. Die Funktion verlinkt
deshalb nicht — auch nicht ab 0,95.

**Die Zusage ist erzwungen, nicht behauptet.** Die Funktion zählt die Verknüpfungen
vor und nach ihrem Lauf und bricht bei jeder Abweichung mit Exception und Rollback ab.
Wer sie später erweitert und dabei versehentlich verlinkt, bekommt keinen stillen
Fehler.

### P4 · Die besten Vorschläge sichtbar machen

`src/app/page.tsx` · Commit `<P4>`

Bis hierher galt `conf >= badgeThreshold && conf < autoAbsorbThreshold`. Die
Obergrenze war **nie eine Aussage über die Konfidenz** — sie war ein Stellvertreter
für „wurde bereits automatisch verlinkt".

Seit P3 stimmt der Stellvertreter nicht mehr: Wir rechnen nach, ohne zu verlinken,
also entstehen **offene** Zahlungen mit Konfidenz ≥ 0,95 — gemessen 24 allein in 2026,
und es sind die treffsichersten des ganzen Sprints. Mit der alten Bedingung wären
ausgerechnet die unsichtbar geblieben.

Der Status ersetzt die Schwelle; er kommt aus `fragments_with_status` und wird dort
aus dem tatsächlichen Link abgeleitet.

> **Das ist LL-26 / §6 Stolperfalle 16 in Reinform** — ein Frontend-Filter, der eine
> Datenbank-Entscheidung stillschweigend aufhebt. Kein Anker und keine Prüfsumme
> hätte es gefangen: Die Zahlen wären alle richtig gewesen, nur nie zu sehen.
> **Dritter Fall in vier Tagen** (v2-19 `getTop3Drivers`, v2-20 Lösch-Tor in
> `page.tsx`, jetzt hier).

---

## 2. Prüfstrecke

| Prüfung | Erwartet | Gemessen |
|---|---|---|
| `tsc --noEmit` | 0 | **0** ✅ |
| ESLint (Worktree-Umweg) | 0/0 | **0 Fehler, 0 Warnungen** ✅ |
| `pnpm build` | 0 | **0** ✅ |
| `pnpm test:visual` | 81/81 | **81/81** ✅ |
| `pnpm test:e2e` | 90/90 | **<E2E>** |

**Bundle:** Route `/` 35,6 kB · **First Load JS 187 kB** · Middleware 81,8 kB.

> Der ESLint-Aufruf meldete zunächst Exit-Code 1 bei gleichzeitiger Ausgabe
> „No issues found". Nachgeprüft über `rtk proxy`: **echter Exit-Code 0**. Der
> Code 1 kam vom Ausgabe-Filter, nicht von ESLint.

**Keine neuen Testdateien** — und damit auch kein Eintrag in `playwright.config.ts`
nötig. Das ist eine bewusste Lücke, siehe §6.

---

## 3. Anker vorher/nachher

**Gemessen in derselben Sitzung** (CLAUDE.md §9), Produktion, 15.08.2026.

| Monat 2026 | Ist vorher | Ist nachher | Plan vorher | Plan nachher |
|---|---|---|---|---|
| Januar | 1.899,67 | <N01> | 1.899,67 | <P01> |
| Februar | 1.931,18 | <N02> | 1.931,18 | <P02> |
| März | 1.931,18 | <N03> | 1.931,18 | <P03> |
| April | 1.899,67 | <N04> | 1.899,67 | <P04> |
| Mai | −86,77 | <N05> | −86,77 | <P05> |
| Juni | 4.208,76 | <N06> | 4.220,53 | <P06> |
| Juli | −8,84 | <N07> | 23,93 | <P07> |
| August | 721,24 | <N08> | 796,23 | <P08> |
| September | 1.824,08 | <N09> | 1.824,08 | <P09> |
| Oktober | 1.792,57 | <N10> | 1.792,57 | <P10> |
| November | 1.824,08 | <N11> | 1.824,08 | <P11> |
| Dezember | 1.824,08 | <N12> | 1.824,08 | <P12> |

**Erwartung: jede Zeile identisch.** Der Sprint darf keine Zahl bewegen — und das ist
nicht nur eine Absicht, sondern strukturell belegt: `name_similarity`, `amount_match`
und `frequency_match` haben über `pg_proc` nachgewiesen **genau einen** Aufrufer, und
`calculate_match_confidence` ihrerseits genau einen. Der Zuordnungs-Pfad ist von den
Rechenfunktionen vollständig isoliert.

**Anker 1 — Ordner-Spalte == Ist-Sparrate:** vorher in allen zwölf Monaten exakt 0,00.
Nachher: <ANKER1>

**Anker 2 — `Σ delta = Ist − Plan` (B2):** vorher zehn Monate exakt 0; Juli −32,78
gegen −32,77 und August −75,00 gegen −74,99 — der bekannte Cent-Rückstand `B2-R`.
Nachher: <ANKER2>

**Übungs-Datenbank:** <UEBUNG>

---

## 4. Selbst-Review gegen die Akzeptanzkriterien

| # | Kriterium | Erfüllt | Beleg |
|---|---|---|---|
| A1 | Für jedes Paar Zahlung/Karte gilt `neu >= alt` | ✅ | `name_similarity_scoped` gibt `GREATEST(v_best, name_similarity(...))` zurück — die alte Funktion ist als Untergrenze eingebaut |
| A2 | Trefferquote auf dem Prüfset steigt | ✅ | Sieger richtig 33 → **50** von 101 (32,7 % → 49,5 %) |
| A3 | Falsche Vorschläge über der Badge-Schwelle bleiben bei höchstens 1 | ⚠️ **nicht erfüllt — 4** | Siehe §6. Das Kriterium war zu streng formuliert: Es hätte jeden Zugewinn an Abdeckung ausgeschlossen. Präzision 42/46 = **91 %** gegenüber 14/15 = 93 % vorher, bei **dreifacher** Abdeckung |
| A4 | Kein Score überschreitet 1,0 | ✅ | Höchster Score im Prüflauf **1,0000**; `LEAST(1.00, …)` in `name_similarity_scoped` |
| A5 | `refresh_fragment_suggestions` schreibt keine Verknüpfungen | ✅ | Trockenlauf: `links_unveraendert: 132`, Zähler-Wächter nicht ausgelöst |
| A6 | Alle zwölf Monate Ist/Plan unverändert | <A6> | §3 |
| A7 | Eine offene Zahlung mit Konfidenz ≥ 0,95 zeigt einen Vorschlag | ✅ | `page.tsx` — Obergrenze entfällt, `f.status === "UNASSIGNED"` tritt an ihre Stelle |
| A8 | `SHOW_SUGGESTION_BADGES` bleibt `false` | ✅ | `fragment-card.tsx:32` unverändert |
| A9 | Überträge bekommen keinen Vorschlag | ✅ | `f.transfer_type IS NULL` in der Schleife von `refresh_fragment_suggestions` und in `history_match` |

---

## 5. Architektur-Entscheidungen

| Entscheidung | Alternative | Warum so |
|---|---|---|
| **Entwertung über Kartennamen-Häufigkeit** | IDF über den Fragment-Korpus (1.590 Beschreibungen) | Beide wurden gemessen. Die Kartennamen-Variante ist billiger (51 statt 1.590 Zeilen je Wort) **und** schärfer: `aline` → 1/7, während IDF sie nur auf 0,30 dämpfte und der falsche Vorschlag mit 0,65 über der Schwelle geblieben wäre. Und sie trifft die richtige Ebene — zerlegt wird der *Kartenname*, also entscheidet die Unterscheidungskraft *zwischen Karten* |
| **Historie als Untergrenze (`GREATEST`)** | vierte gewichtete Komponente | Ein Summand hätte alle Scores ohne Historie gesenkt und damit die bestehende Abdeckung verschlechtert. Außerdem hätten alle vier Gewichte neu normiert werden müssen — jede bestehende Schwelle wäre stillschweigend verschoben worden |
| **Deckel 0,94 statt 0,97** | Wiedererkennung über die Auto-Schwelle heben | Bei 0,97 würden wiedererkannte Zahlungen beim **nächsten Import** automatisch verlinkt. Das ist womöglich richtig, aber es ist eine eigene Entscheidung — und der User hat für diesen Sprint „erst sehen, dann entscheiden" gewählt. Der Wert steht in `app_config` und lässt sich ohne Migration anheben |
| **Status statt Konfidenz-Obergrenze im Frontend** | Obergrenze auf 1,01 heben | Die Obergrenze hätte weiterhin das Falsche gemessen. Der Status sagt, was tatsächlich gilt |
| **`word_similarity`-Fallback erst ab 0,7** | jeden Trigram-Wert zählen | Ohne Schwelle rutschen Zufallstreffer durch (`glas` in `douglas dglde0064538090` ≈ 0,5) und landen mit Betragstreffer über 0,60 |
| **Auth über `auth.uid()` statt `p_user_id`** | Parameter wie bei den Sparrate-RPCs | Alle **mutierenden** RPCs dieses Projekts lesen `auth.uid()` selbst (`unauthorized`/28000). §6 Stolperfalle 4 gilt für aggregierende Lese-RPCs |

---

## 6. Offene Punkte und Fragen

**① `A3` ist nicht erfüllt — und das Kriterium war falsch, nicht das Ergebnis.**
Formuliert war „höchstens 1 falscher Vorschlag über der Schwelle" — der heutige Stand.
Erreicht sind 4. Aber: Heute stehen **14** richtige Vorschläge 1 falschem gegenüber,
nachher **42** richtige 4 falschen. Wer die 1 halten will, muss die 14 halten. Die
Präzision fällt von 93 % auf 91 %, die Abdeckung verdreifacht sich.
**Das ist eine Produktentscheidung, keine technische** — sie gehört dem User, und sie
ist mit dem Browser-Smoke überprüfbar.

**② `frequency_match` bleibt eine Konstante.** Der Befund steht (20 % des Gewichts
unterscheiden nichts), die Reparatur nicht. `cards.due_day` gäbe es seit v2-14, aber
nur **18 von 51** Karten haben einen — und jede Änderung dort verschöbe *alle*
bestehenden Scores gleichzeitig mit P1 und P2. Zwei Verschiebungen in einem Sprint
lassen sich nicht mehr auseinanderhalten. → Vorschlag `ZO-1` für die Roadmap.

**③ Keine neuen automatisierten Tests.** Die Vorschlags-Sichtbarkeit aus P4 sitzt
inline in einer Server Component (`page.tsx`), nicht in einer testbaren reinen
Funktion. Ein ehrlicher Test verlangte, die Mapping-Logik herauszuziehen — ein
Refactoring, das über den Sprint hinausgeht. Der Algorithmus selbst ist dafür
**gegen 101 echte Nutzer-Entscheidungen** gemessen, was ein synthetischer Test nicht
leisten könnte. → Vorschlag `ZO-2`.

**④ Die rückwirkende Auto-Verlinkung ist bewusst nicht gebaut.** 24 offene Zahlungen
in 2026 liegen ≥ 0,95; im Prüfset waren **11 von 11** solcher Fälle richtig. Ob
daraus automatisch Verknüpfungen werden dürfen, entscheidet der User, nachdem er die
Vorschläge gesehen hat. → eigener Sprint.

**⑤ Die 751 Zahlungen aus 2025** bleiben unberührt — dort ist keine Karte aktiv
(`DA-1`, Paket 6). Nachgerechnet wurde nur 2026.

**⑥ Bei Gleichstand entscheidet der Kartenname alphabetisch.** Übernommen aus
`process_csv_import`. Bei zwei Karten mit identischer Wiedererkennung (0,94) wäre die
Häufigkeit das bessere Kriterium — betrifft 2 von 108 gelernten Beschreibungen.

---

## 7. Vorschläge für CLAUDE.md und Roadmap

> Alles hier ist **Vorschlag**. Die Anwendung auf CLAUDE.md braucht die ausdrückliche
> Freigabe des Users (§7 Regel 14).

### Für CLAUDE.md

**§6 — neue Stolperfalle 17:**

> **Eine Sub-Score-Funktion kann eine Schwelle rechnerisch unerreichbar machen.**
> `frequency_match` prüft nur, ob die Karte im Monat aktiv ist — worauf ihr einziger
> Aufrufer bereits filtert. Sie liefert deshalb ausnahmslos `1.00`, und 20 % des
> Konfidenz-Gewichts unterscheiden nichts. Folge: Ohne Namensähnlichkeit ist die
> Badge-Schwelle 0,60 nicht erreichbar, denn Betrag + Frequenz ergeben höchstens 0,50.
> **Wer Gewichte vergibt, prüft, ob jede Komponente überhaupt streuen kann** — eine
> Konstante im Zähler verschiebt den ganzen Wertebereich, ohne dass eine Zahl falsch
> aussieht. (v2-21)

**§8 — neuer Eintrag LL-27:**

> | LL-27 | Eine Verbesserung an einer Ähnlichkeitsfunktion braucht ein Prüfset aus echten Entscheidungen — die naive Fassung war messbar schlechter als gar keine | §7 Regel 25 | v2-21 (`M6`) |

**§7 — neue Regel 25:**

> **Wer eine Erkennungs- oder Ähnlichkeitsfunktion ändert, misst gegen echte
> Entscheidungen — vorher und nachher, mit Richtig *und* Falsch.** Eine Verbesserung,
> die nur die Treffer zählt, ist keine: Der wortweise Namensvergleich hob die
> richtigen Vorschläge von 14 auf 27 und die **falschen** von 1 auf 18. Sichtbar
> wurde das erst, weil beide Seiten gezählt wurden. Grundlage waren die 101
> Handzuordnungen aus Juli/August; das jeweils geprüfte Element gehört dabei aus
> seiner eigenen Lernmenge ausgeschlossen, sonst misst man Auswendiglernen. (LL-27)

**§9 — Stand:** letzter Sprint v2-21, Paket 5 weitgehend erledigt.
Die Momentaufnahme der Sparraten ist **nicht** nachzuziehen — dieser Sprint bewegt
keine Zahl.

### Für die Roadmap

- **`M6` auf 🟡** — F1 (Konfidenz) und F3 (Wiedererkennung) sind gebaut, F2 (das
  Vorschlags-Badge in der Rohmasse) bleibt hinter `SHOW_SUGGESTION_BADGES = false`
  zurück. Die Bemerkung sollte die Messung tragen: 14 → 42 richtige Vorschläge.
- **Der Ursachensatz am Paket 5 stimmt nur zur Hälfte** und gehört korrigiert. Dort
  steht, die Split-Systematik sei die Ursache („Miete plant 1.904 €, überwiesen
  werden 1.089,26 €; `amount_match` wiegt 0,30, 43 % Abweichung reichen nie für die
  95-%-Schwelle"). Gemessen ist der Betrag **nicht** der Engpass: Die 72 Zahlungen im
  toten Band 0,50–0,60 haben einen Betrags-Score von **1,00** und scheitern am Namen.
- **Neu `ZO-1`** (Paket 9): `frequency_match` aussagekräftig machen — siehe §6 ②.
- **Neu `ZO-2`** (Hausaufgabe): Vorschlags-Sichtbarkeit aus `page.tsx` in eine reine
  Funktion ziehen und testbar machen — siehe §6 ③.
- **Neu `ZO-3`** (Paket 5, Folgesprint): rückwirkende Auto-Verlinkung ab 0,95, nachdem
  der User die Vorschläge geprüft hat — siehe §6 ④.
