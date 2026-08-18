# Sprint v2-25 — Review

> **Branch:** `sprint/v2-25-loeschen` · **Commits:** `2ca42e3` (P1) · `e1f26b8` (P2) ·
> Doku-Commit · **Datum:** 17. August 2026
>
> **In einem Satz:** Der Nutzer wird eine irrtümlich angelegte Karte wieder los und kann
> sagen, dass ein Monat nicht angefallen ist — und sieht in beiden Fällen, was das mit
> der Sparrate macht. **Der Sprint selbst hat keine einzige Zahl bewegt.**

---

## 1. Was gebaut wurde

### Phase 1 · `KJ-1` — Der Riegel fällt, die Folge steht im Toast

**Der Anlass in einer Zahl:** Am 17.08.2026 waren von **82 Karten null löschbar.**
`HAS_PAST_PLAN` greift, sobald `first_active_month` vor dem laufenden Monat liegt — nach
der Kuratierung von Januar bis Juli traf das auf alles zu, was der Nutzer angelegt hatte.

Der Riegel war nicht sinnlos: Seit v2-20 filtern alle vier Rechenfunktionen `deleted_at`,
eine gelöschte Karte fällt also aus den Sparraten **aller** Monate, auch der vergangenen.
Bei einer irrtümlich angelegten Karte ist genau das richtig. Der Schutz wandert deshalb
von einer **Sperre** zu einer **Anzeige**.

**Beide Seiten in einem Commit** (LL-26, in v2-20 real fast schiefgegangen):

| Ort | Änderung |
|---|---|
| `20260817_v2_25_kj1_loeschriegel.sql` | `HAS_PAST_PLAN`-Block aus `card_delete_gate` entfernt |
| `src/app/page.tsx` | `first_active_month >= nowMonthDb` aus dem Nachbau gefallen |
| `cards.types.ts` | `"HAS_PAST_PLAN"` aus `DeleteGate["reasons"]` — der Compiler zeigt danach jede Stelle |
| `card-interactive.tsx` | Grund-Text entfällt; neu die Folgen-Zeile im Toast |
| `card-action-toast-provider.tsx` + CSS | zweizeilig, Folge wird nachgereicht |
| `lib/rpc.ts` · `cards/actions.ts` | `DeleteEffect`, neue Signatur durchgereicht |
| `lib/months.ts` | `formatMonthNameOnly` — „Januar" ohne Jahr |
| `tests/e2e/loesch-tor.spec.ts` | Wächter mitgezogen, **+6 Prüfungen** |

**Die Folgen-Zeile kommt aus der Datenbank, nicht aus dem Browser.** Die Wirkung über N
Monate ist eine Sparraten-Rechnung, und Arbeitsregel 1 verbietet die im Frontend.
`delete_card` misst sie selbst: alle Monate des Jahres vor dem eigenen UPDATE, dieselben
danach, in **derselben Transaktion**. Sie **ruft** `calculate_sparrate_for_month` zweimal
auf, statt sie nachzubauen.

### Phase 2 · `KJ-2` + `KJ-3` — „Diesen Monat nicht angefallen", und man sieht es

Menüpunkt plus Gegenstück `Wieder mitzählen`, ein Klick, kein Dialog, kein `…`. Er
schreibt **denselben Wert** wie der bisherige Weg über „Betrag anpassen auf 0 €, nur
diesen Monat" — keine neue Rechenregel, kein Eingriff in
`calculate_card_amount_for_month`.

`KJ-3` gehört in dieselbe Phase: `adjustedAmount` wurde von **keiner** Kartenkomponente
angezeigt. Eine Karte mit Plan 45 € und Anpassung 0 zeigte `0,00 €`, ununterscheidbar von
fehlenden Daten. Ohne den Marker wäre der Menüpunkt eine stille Falschaussage.

**Die Gegenrichtung von Entscheidung 4 sitzt in der Datenbank**, nicht in der Server
Action: `toggle_card_manually_paid` löscht eine Anpassung von **genau 0**, wenn abgehakt
wird. Es geht um zwei Felder, die sich widersprechen können, und der Widerspruch bewegt
die Sparrate — `manually_paid` ändert nur die Anzeige, `adjusted_amount = 0` schlägt den
Plan.

### Phase 3 · `KJ-4` — nicht gebaut, weil nicht reproduzierbar

Siehe §6. **Kein Patch ohne reproduzierten Fehler** (§7 Regel 10).

---

## 2. Prüfstrecke

| | Erwartung | Ergebnis |
|---|---|---|
| `tsc --noEmit` | 0 | **0** ✅ |
| ESLint (kanonisch, `src`) | 0/0 | **0/0** ✅ |
| `pnpm build` | 0 | **0** ✅ · Route `/` **36,3 kB** (vorher 35,8) · First Load JS **188 kB** (vorher 187) · geteilt **87,3 kB** unverändert |
| `pnpm test:visual` | steigt nur um eigene Tests | **119/119** ✅ (113 → 119, die sechs neuen) |
| `pnpm test:e2e` | vollständig grün | **128/128** ✅ inkl. Render-Smoke |

**Bundle:** Route `/` wächst um **0,5 kB** — die zweite Toast-Zeile, die beiden neuen
Menüpunkte und `formatMonthNameOnly`. Das geteilte Bundle bleibt unverändert.

**Die Prüfstrecke lief zusätzlich nach Phase 1 allein** (tsc 0 · Lint 0/0 ·
`test:visual` 119/119), bevor P2 dazukam — LL-14 verlangt eine grüne Phase N vor
Phase N+1, und die beiden teilen sich zwei Dateien.

> **Der ESLint-Fehler *im Build* ist kein Widerspruch.** `next lint` scheitert innerhalb
> eines Worktrees an doppelt aufgelöster Konfiguration; der kanonische Aufruf mit
> `--no-eslintrc --config` ist die Prüfung, die zählt. Beschrieben in `sprint-abschluss`.

---

## 3. Anker vorher/nachher

**Erwartung: keine einzige Zahl bewegt.** Der Sprint ändert, was *möglich* ist, nicht was
*ist*. Gemessen unmittelbar vor und nach dem Eingriff, in derselben Sitzung, dazwischen
nichts in der App getan.

| Monat 2026 | Ist vorher | Ist nachher | Plan vorher | Plan nachher | Anker 1 | Anker 2 |
|---|---|---|---|---|---|---|
| Januar | 1.374,95 | **1.374,95** | 1.521,55 | **1.521,55** | 0,00 | 0,00 |
| Februar | 1.670,39 | **1.670,39** | 1.653,59 | **1.653,59** | 0,00 | 0,00 |
| März | 1.055,91 | **1.055,91** | 1.383,92 | **1.383,92** | 0,00 | 0,00 |
| April | 1.794,59 | **1.794,59** | 1.812,77 | **1.812,77** | 0,00 | 0,00 |
| Mai | −341,86 | **−341,86** | −203,67 | **−203,67** | 0,00 | 0,00 |
| Juni | 3.547,44 | **3.547,44** | 3.837,59 | **3.837,59** | 0,00 | 0,00 |
| Juli | −35,74 | **−35,74** | −2,97 | **−2,97** | 0,00 | 0,00 |
| August | 694,34 | **694,34** | 769,33 | **769,33** | 0,00 | 0,00 |
| September | 1.797,18 | **1.797,18** | 1.797,18 | **1.797,18** | 0,00 | 0,00 |
| Oktober | 1.765,67 | **1.765,67** | 1.765,67 | **1.765,67** | 0,00 | 0,00 |
| November | 1.797,18 | **1.797,18** | 1.797,18 | **1.797,18** | 0,00 | 0,00 |
| Dezember | 1.797,18 | **1.797,18** | 1.797,18 | **1.797,18** | 0,00 | 0,00 |

**Beide Invarianten gelten in allen zwölf Monaten exakt.**

### Prüfsummen (`md5(pg_get_functiondef(...))`)

| Funktion | vorher | nachher | |
|---|---|---|---|
| `calculate_card_amount_for_month` | `4af07d32…` | `4af07d32…` | **identisch** ✅ |
| `calculate_sparrate_for_month` | `68b49544…` | `68b49544…` | **identisch** ✅ |
| `calculate_planned_sparrate_for_month` | `cb2b43af…` | `cb2b43af…` | **identisch** ✅ |
| `get_effective_plan_for_month` | `b93f894c…` | `b93f894c…` | **identisch** ✅ |
| `get_cards_for_month` | `6394926a…` | `6394926a…` | **identisch** ✅ |
| `get_category_amounts_for_month` | `e6e0361b…` | `e6e0361b…` | **identisch** ✅ |
| `restore_card` | `e4810cf1…` | `e4810cf1…` | **identisch** ✅ |
| `card_delete_gate` | `aeafb839…` | `e97ed9b6…` | geändert (Absicht) |
| `delete_card` | `ab0baa04…` | `c6322067…` | geändert (Absicht) |
| `toggle_card_manually_paid` | — | `9334426d…` | geändert (Absicht) |

### Übungs-Datenbank

Anker **2.200,00 €** vor der Probe, **2.200,00 €** danach. Nach dem Trockenlauf:
0 Karten im Papierkorb, 2 aktiv, 0 Links, 0 Zustände, 0 Fragmente — **nichts
hinterlassen**.

**Testreihe, alles in zurückgerollten Transaktionen (LL-18):**

| | Prüfung | Ergebnis |
|---|---|---|
| T1 | `card_delete_gate` ohne Session | `28000` ✅ |
| T2 | Karte mit Vergangenheits-Plan | `{"reasons": [], "deletable": true}` ✅ |
| T3 | mit verknüpfter Zahlung | `HAS_LINKS`, gesperrt ✅ |
| T4 | mit vergangenem Zustand | `HAS_STATES`, gesperrt ✅ |
| T5 | Fixkosten 1.000 €/Monat löschen | `total: 12000.00, months: 12` ✅ |
| T6 | Einnahme 200 €/Monat löschen | `total: -2400.00, months: 12` ✅ (Vorzeichen dreht) |
| T7 | einmalige Karte im April, 77 € | `total: 77.00, months: 1, single_month: "2026-04"` ✅ |
| T8 | Karte aus 2027, Messfenster 2026 | `total: 0, months: 0` ✅ (Toast zeigt nichts) |
| T10 | Häkchen setzen bei Anpassung 0 | `adj=NULL paid=t` ✅ |
| T11 | Häkchen setzen bei 504,95 | `adj=504.95 paid=t` ✅ |
| T12 | Häkchen **entfernen** bei 0 | `adj=0.00 paid=f` ✅ (Regel greift nur beim Setzen) |
| T13 | ohne Zustandszeile | `adj=NULL paid=t` ✅ |

---

## 4. Selbst-Review gegen die Akzeptanzkriterien

| | Kriterium | erfüllt | Beleg |
|---|---|---|---|
| A1 | Riegel fällt in der Datenbank | ✅ | T2, `card_delete_gate` md5 `e97ed9b6…` |
| A2 | Frontend-Nachbau zieht mit | ✅ | `page.tsx:375` ff., Wächter „das Frontend vergleicht … nicht mehr" |
| A3 | Wächter prüft **beide** Seiten | ✅ | `loesch-tor.spec.ts`, 3 neue Prüfungen |
| A4 | Toast-Summe entsteht **nicht** im Browser | ✅ | `delete_card` misst; Wächter „RUFT die Sparrate-Funktion auf" zählt **genau zwei** Aufrufe |
| A5 | drei Anzeigefälle aus §12.5 | ✅ | T5/T6 (mehrere) · T7 (einer, benannt) · T8 (keiner → nichts) |
| A6 | Türkis bei Entlastung, Rot bei Belastung | ✅ | `toFollowUp`, Tokens `--color-teal`/`--color-red` wie §10 |
| A7 | Menüpunkt nur FIXED_COST/INCOME | ✅ | `monthActionsAllowed`, `cardType !== "BUDGET"` |
| A8 | nicht auf Ghost/Forecast | ✅ | `!endDeleteOnly` |
| A9 | nicht bei verknüpfter Zahlung | ✅ | `!hasLinkedFragmentThisMonth` |
| A10 | Häkchen und „nicht angefallen" schließen sich aus | ✅ | Upsert schreibt beides; T10 die Gegenrichtung |
| A11 | `Wieder mitzählen` hebt **jede** Anpassung auf | ✅ | `adjusted_amount = null`, unabhängig vom Wert |
| A12 | `nicht angefallen` sichtbar, ohne neue Kartenhöhe | ✅ | `.notIncurred` 9px/500 wie `.dueDay`, gemessene Höhe 11,0 px in beiden Fällen |
| A13 | keine Zahl bewegt | ✅ | §3, alle zwölf Monate |
| A14 | vier Rechenfunktionen unberührt | ✅ | §3, Prüfsummen |
| A15 | `KJ-4` behoben | ⊘ | **nicht reproduzierbar** — siehe §6 |

---

## 5. Architektur-Entscheidungen

**① Die Wirkung wird gemessen, nicht gerechnet.**
Alternative wäre gewesen, den Beitrag einer Karte analytisch zu bestimmen
(`calculate_card_amount_for_month` je Monat, Vorzeichen nach Typ). Das wäre ein Nachbau
gewesen und hätte Prioritätskette, Split-Anteil (§6 Stolperfalle 11) und Schlussrundung
(LL-25) mitbilden müssen — **und keine Zahl hätte falsch ausgesehen.** Genau diese
Fehlerklasse hat v2-13 gekostet. Stattdessen ruft `delete_card` die echte Funktion
zweimal auf.

**② Kein Rollback-Trick, sondern Messung nach dem UPDATE.**
Dass eine `STABLE`-Funktion die Änderung eines vorangegangenen `UPDATE` derselben
Transaktion sieht, folgt aus der Command-ID-Regel — **belegt statt angenommen** (LL-22):
`2200,00 → 3200,00`, exakt der Betrag der Seed-Fixkosten. Wäre der Nachweis negativ
ausgefallen, wäre der RAISE-Rollback der Ersatzweg gewesen.

**③ Die alte `delete_card`-Signatur wurde explizit gedroppt.**
`create or replace` mit geänderter Signatur legt eine **Überladung** an: Beide Fassungen
existierten nebeneinander, PostgREST könnte weiter die alte treffen, und der Unterschied
fiele niemandem auf. Der neue Parameter hat `default null`, damit ein Aufruf ohne Jahr
weiter funktioniert — wichtig für das Fenster zwischen Migration und Merge.

**④ Entscheidung 4 in der Datenbank statt in der Server Action.**
`applyAdjustmentForward` räumt vergleichbar in der Server Action auf (K4) — dort geht es
aber nicht um einen widersprüchlichen Zustand. Hier bewegt der Widerspruch die Sparrate,
also muss er atomar fallen.

**⑤ Das Messfenster ist das Kalenderjahr des angezeigten Monats.**
Nicht explizit spezifiziert, aber aus dem Record ableitbar („Fahrradteile, 10 Monate,
zusammen +269,00 €" = 10 × 26,90 = März–Dezember). Eine unbefristete monatliche Karte
wirkt sonst unendlich weit; das Kalenderjahr ist das Fenster, das die App überall sonst
benutzt.

**⑥ `nicht angefallen` links statt rechts — die einzige Gestaltungsentscheidung des
Sprints.** Siehe §6, Punkt 1.

---

## 6. Offene Punkte und Fragen

### ① `KJ-4` ist nicht reproduzierbar — und das ist ein Ergebnis, kein Versäumnis

Der Befund vermutete einen **Hydrations-Unterschied**. Diese Hypothese ist **widerlegt**.
Geprüft und ausgeschlossen:

| geprüft | Ergebnis |
|---|---|
| Hydrations-Unterschied | **0** Konsolenmeldungen in Chromium **und** WebKit |
| Übergangsbild beim Monatswechsel (60 / 310 ms nach dem Klick) | nie mehr als **ein** `<main>`, **ein** Header, **zwei** Flanken-Labels |
| vier schnelle Klicks hintereinander | sauber |
| Browser-Zurück/Vorwärts, auch 3× schnell | sauber |
| Fensterbreiten 1680 → 560 px | keine Überlappung, kein horizontaler Scroll |

**Die Frage an den Nutzer:** Tritt es nach v2-24 überhaupt noch auf? Der Screenshot
könnte aus der Zeit stammen, als ein Dashboard-Aufbau **233 Netzrunden** brauchte und das
Übergangsfenster Sekunden statt Millisekunden lang war. Er liegt nicht mehr vor
(`screenshots/` enthält nur Juli und August).

> **Nebenbefund, nicht im Umfang:** `loading.tsx` (v2-24 P5) greift beim **Monatswechsel
> nicht**. Die Datei begründet sich ausdrücklich damit („Am sichtbarsten ist der
> Unterschied beim Monatswechsel"), aber gemessen steht 310 ms nach dem Klick noch
> vollständig die **alte** Ansicht. Grund: Next.js öffnet bei einer Änderung nur des
> Suchparameters innerhalb derselben Route keine neue Suspense-Grenze. Die Ladefläche
> wirkt also beim ersten Aufruf, nicht beim Blättern.

### ② Die Statuszeile hat den Ort gewechselt — Design-Doku auf v3.9.1

Der Record legte `nicht angefallen` an den rechten Anschlag. **Gemessen passt er dort in
keinem der vier Zustände:**

| | braucht | verfügbar |
|---|---|---|
| `OFFEN` + `nicht angefallen` | 117,8 px | 110 px |
| `BEZAHLT` + … | 130,3 px | 110 px |
| `ERWARTET` + … | 139,3 px | 110 px |
| `FORECAST` + … | 138,3 px | 110 px |
| **`nicht angefallen` allein, links** | **79,7 px** | **passt** |

Entschieden in der Rolle `design-direktor` für den **Wortlaut** und gegen den Ort.
`entfällt` hätte rechts gepasst (74,6 px) und die Kette zum Menüpunkt zerrissen. Der
Nachtrag steht im Record, die Doku ist gepatcht.

### ③ Verfahrensfehler, den ich offenlege

**Auf der Übungs-Datenbank lief eine Fassung mit gekürzten Kommentaren im
Funktionsrumpf.** Der ausführbare Code war identisch, aber `pg_get_functiondef` schließt
Kommentare ein — der in `db-eingriff` Schritt 5.4 vorgesehene Prüfsummen-Vergleich
Übung ↔ Produktion **trägt deshalb für diesen Sprint nicht**.

Was stattdessen belegt ist: die Testreihe gegen exakt diese Logik, und die
byte-identischen Prüfsummen der **vier Rechenfunktionen** vor und nach der
Prod-Migration — der Beleg, dass nichts Ungewolltes passiert ist.

**Für das nächste Mal:** Die Migrationsdatei per `Read` einlesen und **1:1** an
`apply_migration` übergeben, auf beiden Projekten. „Die Kurzfassung reicht auf der
Übungs-DB" ist genau das, wovor der Ablauf warnt — ich habe es trotzdem getan.

### ④ Der Toast weicht seit v2-05 von §12.5 ab — Altbefund

§12.5 nennt Titel `[Kartenname] gelöscht` und Subtext `Karte wird dauerhaft entfernt`.
Der Code sagt `Karte »[Kartenname]« gelöscht` und hat **gar keinen** Subtext. Älter als
dieser Sprint, **nicht** mitgeändert. Vorschlag: als eigener kleiner Punkt in Paket 18.

### ⑤ `KJ-5` (Datenpflege) ist jetzt möglich — aber mit Zwischenschritt

Von den ~14 zu löschenden Karten sind **2** direkt löschbar
(`Malin Besuch Erstattung`, `Anteil Essen Aline Marburg` — genau die beiden, die die
Sparrate aufblähen). Für die zwölf Doppelten führt der Weg über
„Verknüpfte Fragmente → Alle Verknüpfungen lösen", dann Löschen.

---

## 7. Vorschläge für CLAUDE.md und Roadmap

**Als Vorschlag formuliert — die Anwendung auf CLAUDE.md braucht die Freigabe.**

**① §9 Sprint-Stand und Doku-Versionen** auf v2-25 · Design-Doku **v3.9.1** ·
Schema-Doku **v3.11.0** · Roadmap-Zahlen **12 offene Pakete · 36 Themen · 4 Hausaufgaben ·
40 offen gesamt · 56 erledigt**.

**② §6 neue Stolperfalle 21 — eine Copy-Entscheidung auf einer Karte ist erst
vollständig, wenn sie gegen 136 px gehalten wurde.** Der Record vom 17.08. legte
`nicht angefallen` an eine Stelle, an der es in **keinem** der vier Zustände passt. Das
ist kein Fehler der Gestaltung, sondern eine fehlende Messung: Die Karte hat 110 px
Inhaltsbreite, und die teilen sich zwei Texte. Gemessen wird mit dem echten Font-Stack.

**③ §6 Stolperfalle-Ergänzung: `pg_get_functiondef` schließt Kommentare ein.** Wer die
Prüfsummen Übung ↔ Produktion vergleichen will, muss **wortgleich** einspielen — auch
die Kommentare. Eine gekürzte Probe-Fassung führt zu abweichenden Prüfsummen bei
identischem Verhalten, und dann ist der Beleg wertlos (siehe §6 ③).

**④ §8 neuer Eintrag LL-31 — eine Spezifikation kann an der Physik scheitern, nicht am
Aufwand.** §7 Regel 3 sagt „nicht raten, melden". Der Fall hier ist die Umkehrung: Die
Spezifikation **war** eindeutig, sie ließ sich nur nicht bauen. Die richtige Reaktion war
nicht, sie stillschweigend anzupassen (der Wortlaut wäre gekürzt worden), sondern die
Rolle zu wechseln, zu messen und **beide** Varianten mit Zahlen vorzulegen.

**⑤ §8 neuer Eintrag LL-32 — ein Wächter, der auf ein verschwundenes Konstrukt prüft,
muss Kommentare ausschließen.** Beim ersten Lauf wurden zwei neue Prüfungen rot, weil die
Erklärung, *warum* `HAS_PAST_PLAN` entfiel, den Namen zwangsläufig nennt. Ein
`not.toContain("X")` auf eine Quelldatei prüft sonst das Gegenteil dessen, was gemeint
ist: Es bestraft gute Kommentare.

**⑥ Roadmap:** `KJ-4` steht auf 🔎 mit vollständiger Ausschlussliste. Zwei kleine neue
Punkte könnten dazu: der Toast-Subtext aus §6 ④ und der `loading.tsx`-Nebenbefund aus
§6 ①.
