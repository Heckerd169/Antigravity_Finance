# Sprint v2-19 — Review

> **Branch:** `sprint/v2-19-gehalt` · **Datum:** 13.08.2026
> **Commits:** `29aaed2` (Gestaltung) · `c75ee93` (P1 Ablage) · `5d53807` (P2 Rechenfunktionen) · `1f8de79` (P3 Oberfläche)
>
> **In einem Satz:** Das Gehalt lässt sich aus der Rohmasse auf die Netto-Kachel
> ziehen; dieser Monat rechnet dann mit dem tatsächlich überwiesenen Betrag, und die
> Differenz erscheint als eigene Zeile in den Abweichungs-Treibern.

---

## 1. Was gebaut wurde

### P1 · Die Ablage — `20260813_v2_19_ge1_ist_netto.sql`

Tabelle **`income_fragment_links`**, gebaut wie `card_fragment_links`.

**Der Entwurfs-Entschluss, der alles andere vereinfacht hat: Sie speichert den Link,
nicht den Betrag.** Das Briefing hatte „Monat, Person, Ist-Netto, Herkunft"
vorgeschlagen. Die Summe stattdessen aus `fragments.amount` zu ziehen, hat zwei
Folgen: Betrag und Zuordnung können nicht auseinanderlaufen, und Fachregel G („zwei
Gehälter in einem Monat summieren sich") fällt heraus, ohne eigens behandelt zu
werden — mehrere Zeilen, eine Summe.

Dazu drei Wächter, jeder gegen eine bezahlte Erfahrung:

| Wächter | Wogegen |
|---|---|
| `ENABLE` **und** Policy von Hand | Stolperfalle 15 / Befund D8 — `rls_auto_enable` setzt nur ENABLE und schluckt sein Scheitern |
| `trg_ifl_no_transfer_links` | Stolperfalle 7 — Transfers sind nie verlinkbar. **Bestehende Funktion wiederverwendet**, sie liest nur `NEW.fragment_id` |
| `trg_ifl_drop_card_link` / `trg_cfl_drop_income_link` | Ein Fragment an Karte **und** Netto zugleich wäre doppelt in der Sparrate |

Die Doppel-Link-Wächter sind bewusst Trigger und nicht Teil der RPC: So greifen sie
auch für `process_csv_import` (Auto-Absorption), `create_card_from_fragment` und den
direkten UPSERT aus `linkFragmentToCard`, die alle an der neuen RPC vorbeischreiben.

`link_fragment_to_income` prüft zusätzlich das **Vorzeichen**. Ohne diese Prüfung
ließe sich „Aldi −48,22 €" auf die Netto-Kachel ziehen und das Monats-Netto fiele auf
einen negativen Betrag.

`fragments_with_status` liefert für netto-verlinkte Fragmente **`ASSIGNED`** — bewusst
kein neuer Status-Wert. Dadurch greifen `isLocked` (`fragment-stack.tsx:148`) und die
Ziehbarkeit (`fragment-card.tsx:125`) ohne **eine Zeile** Frontend-Änderung: Die
Zahlung bleibt sichtbar, rutscht nach hinten und ist gesperrt, genau wie eine, die auf
einer Karte liegt.

### P2 · Die drei Rechenfunktionen — `20260813_v2_19_ge2_treiber.sql`

**Bewusst eine Migration, nicht drei.** Zwischen „Ist-Sparrate rechnet mit dem echten
Wert" und „Ordner-Spalte zieht mit" ist Prüfanker 1 gebrochen; getrennt ausgeliefert
gäbe es auf Produktion ein Zeitfenster, in dem das gilt.

1. **`calculate_sparrate_for_month`** — zwei Zeilen. Erst den Plan holen und den
   NULL-Fall abfangen (Onboarding offen bleibt NULL), **dann** der Ist-Wert per
   `COALESCE`. Umgekehrt gebaut lieferte ein zugeordnetes Gehalt eine Sparrate, wo
   bisher bewusst nichts stand.
2. **`get_category_amounts_for_month`** — derselbe Wert für `v_net`. Weil das Ziel der
   Karten-Ordner `v_sparrate − v_net` ist und aus der Rechenfunktion **geholt** wird,
   hält Anker 1 per Konstruktion (LL-25). Neu: Feld `planned` für die Kachel-Zeile.
3. **`get_year_deviation_drivers`** — Zeile `Gehalt` mit `card_id: null`. Erst die
   Karten auf `p_limit` kürzen, **dann** das Gehalt anhängen: Es kommt hinzu, statt
   einen Karten-Treiber zu verdrängen (Record C).

### P3 · Oberfläche

| Datei | Was |
|---|---|
| `drop-target-wrapper.tsx` | `DropTarget`-Union statt `cardId` |
| `carousel.tsx` | Netto-Kachel im **selben** Wrapper wie Karten |
| `netto-tile.tsx` | `geplant 4.165,11 €` im vorhandenen Höhen-Platzhalter |
| `interaction-zone/actions.ts` | `linkFragmentToIncomeAction` |
| `income-split/{index,actions}.tsx` | Block „Zugeordnete Zahlung" + Lösen |
| `page.tsx` | monats-enge Zuordnungs-Abfrage |
| `welle/popup.tsx` · `drivers.ts` | Unterzeile · `cardId` nullable · **`MAX_POPUP_DRIVERS`** |
| `tests/e2e/gehalt.spec.ts` | neu, 6 Fälle, in `testMatch` eingetragen |

---

## 2. Prüfstrecke

| | Ergebnis |
|---|---|
| `tsc --noEmit` | **0 Fehler** |
| ESLint (`--no-eslintrc`-Umweg) | **0/0** |
| `pnpm build` | **0 Fehler** · Route `/` 35,5 kB · **First Load JS 187 kB** |
| `pnpm test:visual` | **75/75** (vorher 69 — die 6 neuen aus `gehalt.spec.ts`) |
| `pnpm test:e2e` | **84/84** (vorher 78) |

Die ECONNRESET-Meldungen gegen Supabase traten wie gewohnt auf und wurden intern
wiederholt; kein Testlauf ist daran gescheitert.

---

## 3. Anker vorher/nachher

### Nach den Migrationen, ohne Zuordnung — **nichts darf sich bewegen**

Alle zwölf Monate 2026, Ist **und** Plan, gegen die Messung unmittelbar davor:

| | Ergebnis |
|---|---|
| Abweichung Ist | **0,00 € in 12/12** |
| Abweichung Plan | **0,00 € in 12/12** |
| Anker 1 (Ordnersumme == Ist) | **hält in 12/12** |

### Nach dem Ablegen des Juli-Gehalts — Trockenlauf gegen Produktion, zurückgerollt

| Kriterium | erwartet | gemessen |
|---|---|---|
| Ist-Sparrate Juli | −8,84 € | **−8,84 €** ✅ |
| Plan-Sparrate Juli | 23,93 € unverändert | **23,93 €** ✅ |
| Anker 1 | Ordner == Ist | **−8,84 == −8,84** ✅ |
| Treiber-Summe | −32,78 € | **−32,78 €** ✅ |
| Abstand zur Differenz | 0,01 €, **darf nicht wachsen** | **0,01 €** ✅ |
| Gehalt-Zeile | `card_id: null`, delta −15,57 | **exakt so** ✅ |
| übrige elf Monate | unbewegt | **keine Bewegung** ✅ |

### Wortgleichheit statt Zusicherung (LL-22)

Alle **elf** Funktionen tragen byte-identische Prüfsummen auf Übungs- **und**
Produktiv-Datenbank. Drei davon mussten **unverändert** bleiben und sind es:

| Funktion | vorher | nachher |
|---|---|---|
| `calculate_planned_sparrate_for_month` | `e80bf401…` | `e80bf401…` |
| `get_net_monthly_for_month` | `f04593a6…` | `f04593a6…` |
| `calculate_card_amount_for_month` | `4af07d32…` | `4af07d32…` |

**Übungs-Datenbank:** 2.200,00 € vor der Probe, 2.200,00 € danach, **0 Rückstände**.
Zwölf Tests grün (Wirkung · Anker 1 · B2 · `28000`/`22023`/`23514`/`42501` ·
Summierung · Doppel-Link in beide Richtungen · Lösen), alle per RAISE-Rollback.

**Produktion nach dem Trockenlauf:** 0 Zeilen in `income_fragment_links`, Juli-Ist
zurück auf 6,73 €, Gehalts-Fragment wieder `UNASSIGNED`. **Rennrad-Trainer wieder
`ACTIVE_HEALTHY`.**

---

## 4. Selbst-Review gegen die Akzeptanzkriterien

| | Kriterium | erfüllt | Beleg |
|---|---|---|---|
| A1 | Gehalt ist auf die Netto-Kachel ziehbar | ✅ | `carousel.tsx:246` — `DropTargetWrapper target={{kind:"income"}}` |
| A2 | Der Monat rechnet mit dem echten Betrag | ✅ | Trockenlauf: Ist 6,73 → −8,84 € |
| A3 | Der Plan bleibt unangetastet | ✅ | Plan 23,93 € unverändert; Prüfsumme `e80bf401…` identisch |
| A4 | Folgemonate unberührt | ✅ | „andere Monate bewegt: KEINE" |
| A5 | Anker 1 hält | ✅ | 12/12 ohne Zuordnung, und mit |
| A6 | B2-Invariante hält | ✅ | Treiber −32,78 gegen Differenz −32,77; Abstand 0,01 **unverändert** |
| A7 | Treiber-Zeile heißt „Gehalt", nicht anklickbar | ✅ | `drivers.ts` — `DriverEntry` kennt nur `label`; keine Zeile ist klickbar |
| A8 | Frontend verträgt `card_id: null` | ✅ | `drivers.ts:96` + `gehalt.spec.ts` „card_id bleibt null" |
| A9 | Zahlung verschwindet aus der ziehbaren Rohmasse | ✅ | View liefert `ASSIGNED` → `isLocked` greift, ohne Frontend-Änderung |
| A10 | Lösen stellt den Plan wieder her | ✅ | Übungs-Test T10: Ist zurück auf 2.200,00 €, Status `UNASSIGNED` |
| A11 | Zwei Gehälter summieren sich | ✅ | T8: `actual 3.700,00`, Anker 1 hält |
| A12 | Transfers und Ausgaben werden abgewiesen | ✅ | T5 `23514`, T6 `22023` |
| A13 | Neue Spec läuft mit | ✅ | `playwright.config.ts:61` — `gehalt` in `testMatch`, 75/75 |

---

## 5. Architektur-Entscheidungen

**① Link statt Betrag speichern.** Das Briefing schlug eine Betrags-Spalte vor. Der
Link ist die schmalere Wahrheit: Er kann nicht vom Fragment abweichen, und die
Summierungs-Regel entsteht von selbst. Preis: ein JOIN je Lesezugriff — bei einer
Handvoll Zeilen pro Monat irrelevant.

**② Zwei Migrationen, nicht eine und nicht drei.** Eine wäre unnötig grob gewesen
(die Ablage ist für sich harmlos und einzeln zurücknehmbar), drei hätten ein Fenster
geöffnet, in dem Anker 1 auf Produktion gebrochen wäre.

**③ Die Lösen-Aktion liegt bei `income-split`, nicht bei `interaction-zone`.**
Andernfalls importierte das Einkommens-Fenster aus dem Karussell und es entstünde ein
Zyklus `netto-tile → income-split → interaction-zone/actions`. Die fachliche
Zuordnung (gelöst wird im Fenster) und die technische fallen hier zusammen.

**④ Die Gehalts-Zeile wird nicht gegen die Karten gerankt.** Alternative wäre ein
gemeinsames Ranking gewesen — dann hätte „Gehalt" im Juli einen Karten-Treiber
verdrängt. Erst kürzen, dann anhängen erhält beides: richtige Rangfolge in der
Anzeige, garantierte Sichtbarkeit.

---

## 6. Offene Punkte und Fragen

**① `B2-R` — die Treiber-Summe liegt einen Cent neben `Ist − Plan`.**
Gemessen Juli 2026: −17,21 € gegen −17,20 €. Ursache sind vier **gemeinsame** Karten
mit exakten, aber Sub-Cent-großen Deltas (Internet +0,0022 · Rechtsschutz +0,0022 ·
Strom +0,0017 · Miete −0,0003), die `get_year_deviation_drivers` **je Zeile** auf zwei
Stellen rundet, während die Sparraten-Funktionen erst am Ende über alles runden.

**Der Befund ist nicht von diesem Sprint verursacht** — er entstand am 13.08.2026 mit
den ersten Zuordnungen auf gemeinsame Karten. Er ist aufgefallen, weil der Prüfanker
ihn streifte: Die Vorgabe „Treiber-Summe → −32,77 €" war **nicht erfüllbar** und
musste vor dem Bauen korrigiert werden. Steht jetzt als Hausaufgabe in der Roadmap.

**② Rückwirkend gilt es ohne Sonderregel — mit einer Nebenwirkung, die niemanden
überraschen sollte.** Es liegen **20 unzugeordnete Gehalts-Fragmente** (2025 alle
zwölf, 2026 Januar bis Juli). Für 2026 Januar–Juni wurde **exakt der Planbetrag**
überwiesen (4.165,11 €) — eine Zuordnung dort bewegt **nichts**. Für 2025 weicht
**jeder** Monat ab; ordnet der User alle zu, bewegt sich die Vorjahres-Goldlinie um
**−0,01 €** (48.445,32 → 48.445,31 €). Korrektes Verhalten, aber es sieht nach einem
Fehler aus, wenn man es nicht erwartet.

**③ Ein fehlgeschlagener Drop bleibt stumm.** Zieht man eine Ausgabe auf die
Netto-Kachel, weist die Datenbank es ab (`22023`) und die Oberfläche zeigt schlicht
keine Änderung — dasselbe Verhalten wie beim Karten-Drop (`drop-target-wrapper.tsx`,
Kommentar seit Sprint 4). Für eine sichtbare Rückmeldung fehlt eine
Gestaltungsentscheidung; sie wurde hier nicht erfunden (§7 Regel 3).

**④ `person` ist angelegt, aber nur `ICH` nutzbar.** Das Partner-Netto ist
Nicht-Ziel. Die Spalte kostet nichts und erspart später eine Migration.

---

## 7. Vorschläge für CLAUDE.md und Roadmap

**Roadmap ist nachgezogen** (Teil dieses Commits): `GE-1` und `GE-2` auf ✅, **Paket 15
vollständig**, neue Hausaufgabe `B2-R`, §0-Zahlen zeilengenau neu ausgezählt —
**10 offene Pakete · 30 Themen · 5 Hausaufgaben · 35 offen gesamt · 45 erledigt**.

**Für CLAUDE.md — Vorschlag, Freigabe des Users nötig (§7 Regel 14):**

1. **§9 Sprint-Stand** auf v2-19 nachziehen; Paket 15 als abgeschlossen vermerken.
2. **§9 Momentaufnahme:** unverändert lassen. Der Sprint hat keine Zahl bewegt — erst
   das Ziehen im Browser tut das. Sobald der User das Juli-Gehalt zuordnet, steht dort
   **−8,84 €** statt 6,73 €.
3. **§6 neue Stolperfalle 16 — Vorschlag:**
   > **Ein Frontend-Limit kann eine Datenbank-Entscheidung stillschweigend
   > aufheben.** `get_year_deviation_drivers` liefert seit v2-19 bewusst bis zu vier
   > Treiber; `getTop3Drivers` schnitt auf drei. Die zusätzliche Zeile lag im Juli auf
   > Platz 4 — sie wäre korrekt berechnet, in die Sparrate gerechnet, B2-konform und
   > **trotzdem unsichtbar** gewesen. Weder Anker noch Prüfsumme fangen das. **Wer eine
   > Datenbank-Antwort erweitert, sucht im Frontend nach der Stelle, die sie kürzt.**
4. **§8 neuer Eintrag LL-26** zu ebendiesem Punkt.

**Nicht vorgeschlagen:** eine Änderung an den Anker-Regeln. Die invariantenbasierte
Fassung vom 13.08.2026 hat in diesem Sprint zum ersten Mal getragen — und dabei
gleich einen Vorbefund sichtbar gemacht, den eine eingefrorene Wertetabelle
verschluckt hätte.
