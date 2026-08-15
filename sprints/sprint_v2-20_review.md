# Sprint v2-20 — Review

> **Branch:** `sprint/v2-20-papierkorb-loeschen` · **Datum:** 15.08.2026
> **Commits:** `4a99227` (Befunde) · `550c54d` (P1 Lösch-Tor) · `f98d292` (P2 Papierkorb) ·
> `179ff74` (P3 Oberfläche)
>
> **In einem Satz:** Eine gelöschte Karte verschwindet jetzt sofort aus jeder Zahl, und
> eine Karte aus dem laufenden Monat lässt sich auch wieder loswerden.

---

## 1. Was gebaut wurde

### P1 · Das Lösch-Tor schützt nur noch die Vergangenheit

`card_delete_gate`: `HAS_STATES` blockiert nur noch bei Monats-Zuständen aus
**vergangenen** Monaten. `HAS_LINKS` und `HAS_PAST_PLAN` unverändert.

Was die Regel schützen soll, ist die **Historie** — und die schützt sie weiterhin
vollständig. Bei einer Karte aus dem laufenden Monat ist der Zustand entweder eine
Betragsanpassung oder ein Bezahlt-Haken; beides gehört zur Karte und stirbt mit ihr.

### P2 · Der Papierkorb verschwindet aus der Rechnung

Vier Funktionen bekommen `deleted_at IS NULL`, in **einer** Migration:
`calculate_sparrate_for_month` · `calculate_planned_sparrate_for_month` ·
`get_category_amounts_for_month` · `get_year_deviation_drivers`.

Jede einzeln wegzulassen bricht etwas: nur die Ist-Funktion → Ist und Plan driften
auseinander · ohne die Ordner-Funktion → Anker 1 · ohne die Treiber → Anker 2.

### P3 · Der Hinweis wird ehrlich — und ein zweiter Fund

Drei Änderungen. Die mittlere war nicht geplant und der eigentliche Fund des Sprints:

1. Der Verweis auf »Karte beenden…« hängt jetzt an `canEnd`.
2. **`page.tsx` bildet das Lösch-Tor nach** — und hätte P1 stillschweigend aufgehoben.
3. Die drei Sperrgründe sagen, was zu tun ist, statt nur zu benennen, was im Weg steht.

---

## 2. Prüfstrecke

| | Ergebnis | vorher (v2-19) |
|---|---|---|
| `tsc --noEmit` | **0 Fehler** | 0 |
| ESLint | **0/0** | 0/0 |
| `pnpm build` | **0 Fehler** · Route `/` 35,5 kB · First Load **187 kB** | 187 kB |
| `pnpm test:visual` | **81/81** | 75 |
| `pnpm test:e2e` | **90/90** | 84 |

Beide Testzahlen sind **nur gestiegen**, und zwar um genau die sechs Fälle aus
`tests/e2e/loesch-tor.spec.ts` — die Prüfung aus der neuen Fassung von
`sprint-abschluss`, hier zum ersten Mal angewandt.

---

## 3. Anker vorher/nachher

**Gemessen in derselben Sitzung**, alle zwölf Monate, Ist **und** Plan.

| | vorher | nachher | Bewegung |
|---|---|---|---|
| August Ist | 1.076,24 € | **721,24 €** | **−355,00** ✅ wie vorab festgelegt |
| August Plan | 1.151,23 € | **796,23 €** | **−355,00** — beide Seiten gleich |
| August Differenz | −74,99 € | **−74,99 €** | **0,00** ✅ |
| Ordner „Urlaub" | −559,85 € | **−914,85 €** | die Zahl des Users |
| Posten „Urlaub" | 4 | **3** | == sichtbare Karten |
| übrige elf Monate | — | — | **0,00 €** ✅ |
| Anker 1 (Ordner == Ist) | 12/12 | **12/12** | ✅ |

**B2-Invariante:** Abstand 0,01 € in Juli **und** August — beide durch dieselben vier
gemeinsamen Karten mit Sub-Cent-Deltas (`B2-R`), **nicht gewachsen**. Die gelöschte
Karte hatte `delta = 0` und war durch `WHERE delta <> 0` ohnehin nie ein Treiber; der
August-Abstand bestand also schon vorher.

**Übungs-Datenbank:** Anker 2.200,00 € vorher und nachher, **null Rückstände**
(2 Karten wie im Seed, 0 Fragmente, 0 Zustände).

**P1 bewegt keine Zahl** — belegt über identische Prüfsummen aller fünf
Rechenfunktionen vor und nach der Gate-Migration.

**Wortgleichheit:** Alle **acht** Prüfsummen byte-identisch zwischen Übungs- und
Produktiv-Datenbank, einschließlich der beiden unberührten
(`calculate_card_amount_for_month` `4af07d32…`, `get_net_monthly_for_month` `f04593a6…`).

---

## 4. Selbst-Review gegen die Akzeptanzkriterien

| | Kriterium | erfüllt | Beleg |
|---|---|---|---|
| A1 | Papierkorb-Karte zählt in keinem Monat mehr | ✅ | Übungs-Test T1: 2.100 → **2.200** nach dem Löschen |
| A2 | Ist **und** Plan ziehen gleich | ✅ | August beide −355,00; Differenz unverändert |
| A3 | Anker 1 hält | ✅ | 12/12 auf beiden Datenbanken |
| A4 | Anker 2 hält, Cent wächst nicht | ✅ | Juli/August je 0,01, Ursache belegt |
| A5 | Wiederherstellen bringt die Karte zurück | ✅ | Übungs-Test T5: 2.200 → 2.100 |
| A6 | Zustand im laufenden Monat blockiert nicht mehr | ✅ | Gate-Test B: `false [HAS_STATES]` → **`true []`** |
| A7 | Zustand aus der Vergangenheit blockiert weiter | ✅ | Gate-Test C: `false ["HAS_STATES"]` |
| A8 | Verknüpfte Zahlung blockiert weiter | ✅ | Gate-Test D: `false ["HAS_LINKS"]` |
| A9 | Karte aus der Vergangenheit blockiert weiter | ✅ | Gate-Test E: `false ["HAS_PAST_PLAN"]` |
| A10 | Verweis auf »Beenden« nur wenn es ihn gibt | ✅ | `card-interactive.tsx` — `canEnd &&` |
| A11 | Frontend und Datenbank sagen dasselbe | ✅ | `page.tsx` filtert `.lt("month", nowMonthDb)`; Wächter-Spec |
| A12 | Neue Spec läuft mit | ✅ | `playwright.config.ts` — `loesch-tor` in `testMatch`, 81/81 |

---

## 5. Architektur-Entscheidungen

**① Filter statt Aufräumen.** Alternative wäre gewesen, `cleanup_expired_card_trash`
auch beim Dashboard-Laden zu rufen. Das hätte ein 60-Sekunden-Fenster gelassen, in dem
die Karte weiterzählt, und einen Schreibzugriff in den Lesepfad gelegt. Der Filter wirkt
sofort und ist mit dem 5-Sekunden-„Rückgängig" konsistent: Was zurückkommt, zählt wieder.

**② Der Widerspruch zu §2.1 ist keiner.** Die Snapshot-Integrität verbietet den
`deleted_at`-Filter, damit historische Sparraten nicht kippen. Das Lösch-Tor lässt über
`HAS_PAST_PLAN` aber gar keine Karte mit Vergangenheit löschen — der Filter kann
strukturell nur den laufenden Monat und die Zukunft berühren. Diese Prüfung stand vor
der Migration, nicht danach.

**③ `HAS_STATES` eingegrenzt statt gestrichen.** Es ganz zu entfernen wäre einfacher
gewesen, hätte aber den Historien-Schutz aufgeweicht, den `HAS_PAST_PLAN` nur für den
*Plan* leistet — ein Bezahlt-Haken in einem vergangenen Monat ist ein eigener Fakt.

**④ Die neue Spec prüft Quelltext, nicht Verhalten.** Ungewöhnlich für dieses Projekt,
und hier bewusst: Die Lösch-Regel existiert an zwei Orten. Ein Verhaltens-Nachbau wäre
die **dritte** Kopie derselben Logik gewesen — und hätte den Widerspruch zwischen
Datenbank und Frontend gerade nicht gefunden, weil er ihn mit nachgebaut hätte.

---

## 6. Offene Punkte und Fragen

**① Der zweite Fund ist eine neue Ausprägung von LL-26.** Bisher hieß die Lehre: Ein
Frontend-**Limit** kann eine Datenbank-Antwort kürzen. Hier war es ein Frontend-**Nachbau
einer Regel**, der die Datenbank-Entscheidung überstimmt hätte. Die Wirkung ist dieselbe
— die Datenbank entscheidet richtig, der Nutzer sieht es nie —, aber die Suchrichtung
ist eine andere: nicht „wo wird gekürzt", sondern „wo wird dieselbe Regel ein zweites
Mal formuliert". Vorschlag für §6 Stolperfalle 16 in Abschnitt 7.

**② `B2-R` bleibt liegen.** Der Cent in der Treiber-Summe. In diesem Sprint erneut
gemessen und in seiner Ursache bestätigt (dieselben vier gemeinsamen Karten in Juli und
August). Er ist **nicht gewachsen**.

**③ Die Momentaufnahme in CLAUDE.md §9 ist zweifach überholt** — Juli steht auf
−8,84 € (Gehalt zugeordnet, v2-19 wirkt), August auf 721,24 €. Vorschlag in
Abschnitt 7.

**④ Nicht geprüft: ob es weitere Frontend-Nachbauten von Datenbank-Regeln gibt.**
`page.tsx` bildet das Lösch-Tor nach; ob anderswo dasselbe passiert, war nicht Teil
dieses Sprints. Ein gezielter Durchgang wäre eine eigene Hausaufgabe.

---

## 7. Vorschläge für CLAUDE.md und Roadmap

**Roadmap ist nachgezogen** (Teil dieses Commits): **Paket 16** neu und sofort
vollständig, `KU-1`/`KU-2` auf ✅, §0 zeilengenau neu ausgezählt —
**10 offene Pakete · 30 Themen · 5 Hausaufgaben · 35 offen · 47 erledigt**. Zum ersten
Mal seit drei Sprints steigen die offenen Themen **nicht**.

**Für CLAUDE.md — Vorschlag, Freigabe nötig (§7 Regel 14):**

1. **§9 Sprint-Stand** auf v2-20; Paket 16 als abgeschlossen vermerken.
2. **§9 Momentaufnahme:** Juli **−8,84 €**, August **721,24 €** — beide Werte sind
   heute korrekt und erklärbar, nicht überholt.
3. **§6 Stolperfalle 16 erweitern** (nicht neu anlegen — es ist dieselbe Lehre):
   > **Auch ein Frontend-**Nachbau** einer Datenbank-Regel kann sie aufheben.**
   > `page.tsx` bildet `card_delete_gate` nach, um 31 RPC-Aufrufe zu sparen. Als die
   > Datenbank in v2-20 großzügiger wurde, blieb der Nachbau streng — das Menü hätte
   > ausgegraut, was die Datenbank längst erlaubte. **Wer eine Datenbank-Regel ändert,
   > sucht im Frontend nach der Stelle, die sie ein zweites Mal formuliert.**
4. **§6 Stolperfalle 10 streichen oder korrigieren?** Sie sagt
   „`card_monthly_states.closed_at` ignorieren — wird nicht genutzt". Das stimmt
   weiterhin; **kein** Änderungsbedarf, nur zur Sicherheit geprüft.

**Nicht vorgeschlagen:** eine Änderung an §2.1 Snapshot-Integrität. Sie gilt
unverändert für alles außer dem Papierkorb, und die Ausnahme ist in der Migration
begründet.
