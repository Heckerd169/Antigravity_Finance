# Sprint v2-26 — Review

> **Branch:** `sprint/v2-26-nachbesserungen` · **Commits:** `ccbd9ac` (P1) · `9da1a07` (P2) ·
> Doku-Commit · **Datum:** 18. August 2026
>
> **In einem Satz:** Fünf Nachbesserungen aus der Benutzung von v2-25 — und der
> Kernbefund ist, dass **der Fall des Löschriegels eine zweite Sperre freilegte, die
> niemand kannte, weil sie nie erreichbar war.**

---

## 1. Was gebaut wurde

### ① Das Lösch-Tor: eine leere Zustandszeile sperrt nicht mehr *(Datenbank)*

Der Nutzer legte nach dem Merge `Privathaftpflicht` an und konnte sie nicht löschen —
obwohl v2-25 den Vergangenheits-Riegel gerade entfernt hatte. `card_delete_gate` meldete
`HAS_STATES`. Die Karte hatte **genau eine** Zeile in `card_monthly_states`, für April:

```
manually_paid = false · adjusted_amount = NULL
```

**Diese Zeile sagt nichts aus.** Sie ist der Rückstand eines Tap, der zurückgenommen
wurde: Der erste Tap legt sie mit `true` an, der zweite setzt `false`, und liegen bleibt
sie. `toggle_card_manually_paid` löscht sie bewusst nicht — in derselben Zeile kann eine
Betragsanpassung stehen (§6 Stolperfalle 3).

`HAS_STATES` soll bedeuten „die Karte **trägt** vergangene Monate". Eine leere Zeile
trägt nichts. Das Tor verlangt jetzt einen **aussagekräftigen** Zustand
(`manually_paid OR adjusted_amount IS NOT NULL`) — dieselbe Verfeinerung wie v2-20, eine
Ebene tiefer.

**Beide Seiten in einem Commit** (LL-26): `page.tsx` schränkt ebenfalls ein, und zwar
**server-seitig** über `.or()` statt als nachgelagerter JS-Filter (§7 Regel 18). Der
Wächter bekam zwei Prüfungen dazu.

### ② `Wiederholung ändern …` *(Datenbank + Oberfläche)*

Dieselbe Karte stand auf `MONTHLY`, obwohl quartalsweise gedacht — und es gab **keinen
Weg**, das zu korrigieren. Der Vorgabewert beim Anlegen ist `Monatlich`, man vertut sich
also durch **Nichtstun**, und danach half nur Löschen und Neuanlegen. Genau deshalb
wollte der Nutzer überhaupt löschen; dass er dann auch daran scheiterte, war die zweite
Sackgasse.

`set_card_frequency` misst ihre Wirkung wie `delete_card` seit v2-25 und führt den
Constraint `once_is_single_month` mit. Das Overlay zeigt die fünf Werte, der Toast
danach die Sparraten-Wirkung.

### ③ „Nicht angefallen" ist ein erledigter Zustand *(Oberfläche)*

Die Karte blieb rot und „Offen", und der Ordner zählte sie als offen — `3 offen`, von
denen zwei erledigt waren.

**Die Änderung sitzt an einer Stelle.** `card-state.ts` wertet `adjustedAmount === 0` als
bezahlt bzw. erhalten; daraus folgt alles Übrige von selbst: türkis, Häkchen, und das
Weglassen im Ordner. Genau dafür wurden die Resolver in v2-17 aus `card.tsx`
herausgelöst.

Die Statuszeile sagt weiterhin `nicht angefallen` — die Karte sieht erledigt aus und
nennt trotzdem den Grund.

### ④ Der volle Haushaltsbetrag beim Anlegen *(Oberfläche)*

Im Popup „Karte aus Zahlung" war der Betrag **fest verdrahtet** auf den Zahlungsbetrag —
kein Eingabefeld. Bei GEMEINSAM ist das falsch: Der Plan ist der **Haushaltsbetrag**, die
Zahlung dagegen bereits der eigene Anteil. Wer 28,88 € überweist und daraus eine
gemeinsame Karte macht, bekam 28,88 € als Plan — und der Anteil wurde beim Rechnen ein
**zweites Mal** abgezogen (§6 Stolperfalle 11). Exakt der Fall aus dem Befund vom 17.08.

Das Feld ist jetzt eingebbar, und **beide** Anlage-Wege zeigen bei GEMEINSAM:
`Voller Haushaltsbetrag — dein Anteil davon: X €`. `parseAmount` ist dafür nach
`lib/format.ts` gewandert — zwei Kopien derselben Parse-Regel liefen genau so lange
synchron, bis jemand eine anfasst.

### ⑤ Der Beenden-Toast folgt §12.5 *(Oberfläche)*

`[Kartenname] — Endet in [Monat Jahr]` statt `Karte »X« endet im 04/2026`. **Die Doku
hatte seit jeher recht, der Code nicht.**

---

## 2. Prüfstrecke

| | Erwartung | Ergebnis |
|---|---|---|
| `tsc --noEmit` | 0 | **0** ✅ |
| ESLint (kanonisch, `src`) | 0/0 | **0/0** ✅ |
| `pnpm build` | 0 | **0** ✅ · Route `/` **36,9 kB** (vorher 36,3) · First Load JS **188 kB** · geteilt **87,3 kB** unverändert |
| `pnpm test:visual` | steigt nur um eigene Tests | **121/121** ✅ (119 → 121, die zwei neuen) |
| `pnpm test:e2e` | vollständig grün | **130/130** ✅ inkl. Render-Smoke |

---

## 3. Anker vorher/nachher

**Erwartung: keine Bewegung.** Beide Änderungen betreffen nur, was ein *künftiger* Klick
darf — kein Bestandsdatum wird angefasst.

| Monat 2026 | Ist vorher | Ist nachher | Plan vorher | Plan nachher | Anker 1 | Anker 2 |
|---|---|---|---|---|---|---|
| Januar | 1.318,76 | **1.318,76** | 1.465,36 | **1.465,36** | 0,00 | 0,00 |
| Februar | 1.667,90 | **1.667,90** | 1.651,10 | **1.651,10** | 0,00 | 0,00 |
| März | 1.053,42 | **1.053,42** | 1.381,43 | **1.381,43** | 0,00 | 0,00 |
| April | 1.751,56 | **1.751,56** | 1.729,58 | **1.729,58** | 0,00 | 0,00 |
| Mai | −269,56 | **−269,56** | −126,86 | **−126,86** | 0,00 | 0,00 |
| Juni | 3.479,29 | **3.479,29** | 3.769,44 | **3.769,44** | 0,00 | 0,00 |
| Juli | −39,30 | **−39,30** | −9,02 | **−9,02** | 0,00 | 0,00 |
| August | 588,93 | **588,93** | 364,05 | **364,05** | 0,00 | 0,00 |
| September | 1.791,13 | **1.791,13** | 1.791,13 | **1.791,13** | 0,00 | 0,00 |
| Oktober | 1.759,62 | **1.759,62** | 1.759,62 | **1.759,62** | 0,00 | 0,00 |
| November | 1.791,13 | **1.791,13** | 1.791,13 | **1.791,13** | 0,00 | 0,00 |
| Dezember | 1.791,13 | **1.791,13** | 1.791,13 | **1.791,13** | 0,00 | 0,00 |

> **Diese Werte sind NICHT die aus dem v2-25-Review.** Zwischen den Sprints liegt ein Tag
> normaler Benutzung — Januar wanderte von 1.374,95 auf 1.318,76, August von 694,34 auf
> 588,93. Genau deshalb gibt es seit dem 13.08.2026 keine eingefrorene Anker-Tabelle:
> Verglichen wird gegen den **eigenen Vorher-Wert von vor zehn Minuten**.

### Prüfsummen

| Funktion | vorher | nachher | |
|---|---|---|---|
| `calculate_card_amount_for_month` | `4af07d32…` | `4af07d32…` | **identisch** ✅ |
| `calculate_sparrate_for_month` | `68b49544…` | `68b49544…` | **identisch** ✅ |
| `calculate_planned_sparrate_for_month` | `cb2b43af…` | `cb2b43af…` | **identisch** ✅ |
| `get_effective_plan_for_month` | `b93f894c…` | `b93f894c…` | **identisch** ✅ |
| `delete_card` | `c6322067…` | `c6322067…` | **identisch** ✅ |
| `restore_card` | `e4810cf1…` | `e4810cf1…` | **identisch** ✅ |
| `toggle_card_manually_paid` | `9334426d…` | `9334426d…` | **identisch** ✅ |
| `card_delete_gate` | `e97ed9b6…` | `23147023…` | geändert (Absicht) |
| `set_card_frequency` | — | `d9c7d789…` | neu |

> ### ✅ Der Wortgleichheits-Beleg trägt diesmal
>
> **Übungs-Datenbank und Produktion tragen byte-identische Prüfsummen:**
> `card_delete_gate` = `23147023415303dd8379945c68486f2f` auf beiden,
> `set_card_frequency` = `d9c7d7893cbb8e4b7e3861074e34479a` auf beiden.
>
> In v2-25 war das **nicht** der Fall — dort lief auf der Übungs-DB eine Fassung mit
> gekürzten Kommentaren, und `pg_get_functiondef` schließt Kommentare ein. Die Lehre
> daraus ist hier angewandt: die Migrationsdatei gelesen und **1:1** an beide Projekte
> übergeben.

### Übungs-Datenbank

Anker **2.200,00 €** vor der Probe, **2.200,00 €** danach. Nach dem Trockenlauf: beide
Karten wieder `MONTHLY` mit `last_active_month = NULL`, 0 Zustände, 0 Links, 0 Fragmente
— **nichts hinterlassen**.

**Testreihe, alles in zurückgerollten Transaktionen (LL-18):**

| | Prüfung | Ergebnis |
|---|---|---|
| **B1** | *Baseline vor der Migration:* leere Zeile | `HAS_STATES`, gesperrt — **der Fehler reproduziert** ✅ |
| **B2** | *Baseline:* bezahlt-Zeile | gesperrt ✅ |
| **B3** | *Baseline:* `set_card_frequency` | fehlt (erwartet) ✅ |
| T1 | leere Zeile **nach** der Migration | `{"reasons": [], "deletable": true}` ✅ |
| T2 | bezahlt-Zeile | `HAS_STATES` ✅ |
| T3 | Anpassung `0` („nicht angefallen") | `HAS_STATES` ✅ — eine bewusste 0 **ist** eine Aussage |
| T4 | Zeile im laufenden Monat | löschbar ✅ (v2-20 unberührt) |
| T5 | verknüpfte Zahlung | `HAS_LINKS` ✅ |
| T6 | ohne Session | `28000` ✅ |
| F1 | monatlich → jährlich | `+11.000,00 in 11 Monaten` ✅ (1.000 €/Monat, nur Januar bleibt) |
| F2 | dieselbe Frequenz erneut | `unchanged=true`, kein Effekt ✅ |
| F3 | → einmalig | `last_active_month = 2026-01-01` ✅ Constraint mitgeführt |
| F4 | einmalig → quartalsweise | `last = NULL` ✅, `−3.000,00 in 3 Monaten` ✅ |
| F5 | ohne Session | `28000` ✅ |

---

## 4. Selbst-Review gegen die Akzeptanzkriterien

| | Kriterium | erfüllt | Beleg |
|---|---|---|---|
| A1 | „Nicht angefallen" wird teal wie bezahlt | ✅ | `card-state.ts`, `isNotIncurred` → `"paid"`/`"received"` |
| A2 | Der Ordner zählt sie nicht mehr als offen | ✅ | `isCardOpen` nutzt dieselben Resolver — eine Stelle, beide Wirkungen |
| A3 | Die Statuszeile bleibt unterscheidbar | ✅ | `nicht angefallen` statt `Bezahlt` |
| A4 | Gemeinsam-Karte: voller Betrag eingebbar | ✅ | `recurrence-popup.tsx`, Feld statt `Math.abs(fragment.amount)` |
| A5 | Beide Wege sagen, dass der Haushaltsbetrag gemeint ist | ✅ | `zeigeAnteil`, nur bei Split-Faktor < 1 |
| A6 | `Privathaftpflicht` ist löschbar | ✅ | Auf Produktion geprüft: `{"reasons": [], "deletable": true}` |
| A7 | Aussagekräftige Zustände sperren weiter | ✅ | T2, T3 |
| A8 | Die Frequenz ist nachträglich änderbar | ✅ | `set_card_frequency`, F1–F4 |
| A9 | Jährlich ab April, Tag 22 → jedes Jahr am 22. April | ✅ | `is_card_active_in_month` (`ANNUAL: months_diff % 12 = 0`) + `due_day = 22`; **war nie fehlerhaft**, es fehlte nur der Weg zur richtigen Frequenz |
| A10 | Beenden-Toast nach §12.5 | ✅ | `handleEndConfirm`, `formatMonthLabel` |
| A11 | Keine Zahl bewegt | ✅ | §3, alle zwölf Monate |
| A12 | Die vier Rechenfunktionen unberührt | ✅ | §3, Prüfsummen |

---

## 5. Architektur-Entscheidungen

**① Die Regel für „erledigt" bleibt an einer Stelle.**
Der naheliegende Weg wäre gewesen, in `card.tsx` die Farbe zu setzen und in
`category-tile.tsx` die Zählung anzupassen. Das wären **zwei** Formulierungen derselben
Regel gewesen — genau das, was `card-state.ts` in v2-17 abgeschafft hat. Stattdessen
eine Zeile in den Resolvern; alles Übrige folgt.

**② `set_card_frequency` wiederholt das Muster von `delete_card`, statt es zu variieren.**
Dieselbe Messmechanik, dieselbe Rückgabeform, dieselbe Toast-Zeile. Eine zweite Art, die
Sparraten-Wirkung zu melden, wäre eine zweite Stelle zum Pflegen gewesen.

**③ Die Frequenz-Änderung ist NICHT zurücknehmbar über den Toast.**
`Rückgängig` setzt beim Löschen den vorherigen Zustand zurück. Bei der Frequenz wäre das
eine **zweite Änderung** mit eigener Sparraten-Wirkung, kein Undo. Der Toast zeigt
deshalb nur die Wirkung; wer zurück will, wählt die alte Frequenz erneut.

**④ `parseAmount` nach `lib/format.ts`.**
Der zweite Aufrufer machte aus einer lokalen Hilfsfunktion eine geteilte Regel.

---

## 6. Offene Punkte und Fragen

### ① Wie die falsche Frequenz entstanden ist, bleibt offen

Beide Anlage-Wege reichen `frequency` sauber durch — im Code ist kein Fehler zu finden.
Die zwei Möglichkeiten: Der Nutzer hat den Vorgabewert `Monatlich` stehen lassen, oder es
gibt einen Bedienweg, den ich nicht kenne. **Der Vorgabewert ist der wahrscheinlichere
Kandidat**, und er ist eine echte Falle: Er ist unauffällig, und die Folge (die Karte
erscheint in jedem Monat, für immer) ist groß.

**Als Vorschlag für eine Gestaltungsrunde vermerkt, nicht stillschweigend geändert:**
Sollte die Wiederholung beim Anlegen eine bewusste Wahl sein statt einer Vorbelegung?

### ② `KJ-4` (Monatsnamen) bleibt unbeantwortet

Aus v2-25 offen: nicht reproduzierbar in zwei Browser-Engines. Die Frage an den Nutzer
steht weiterhin.

### ③ Der Toast weicht weiterhin von §12.5 ab — jetzt nur noch beim Löschen

`Karte »X« gelöscht` statt `X gelöscht`, und der Subtext `Karte wird dauerhaft entfernt`
fehlt. **Der Beenden-Toast ist mit diesem Sprint korrigiert, der Lösch-Toast nicht** —
er war nicht Teil der Meldung. Konsequenterweise gehört er nachgezogen.

---

## 7. Vorschläge für CLAUDE.md und Roadmap

**① §9 Sprint-Stand:** v2-26 · Design-Doku **v3.10.0** · Schema-Doku **v3.12.0**.

**② §6 neue Stolperfalle — eine Sperre, die nie erreichbar war, ist ungeprüft.**
`HAS_STATES` zählte seit v2-20 auch leere Zustandszeilen. Das fiel **nie auf**, weil
`HAS_PAST_PLAN` ohnehin fast alles sperrte — die zweite Sperre wurde erst sichtbar, als
die erste fiel. **Wer eine Sperre entfernt, prüft, was darunter liegt.** Dieselbe Klasse
wie LL-26, aber in der Tiefe statt in der Breite.

**③ §6 Ergänzung zu `pg_get_functiondef`** (aus v2-25 offen, hier bestätigt): Es schließt
Kommentare ein. Wortgleich einspielen heißt **wirklich wortgleich** — sonst ist der
Prüfsummen-Vergleich Übung ↔ Produktion wertlos. In v2-26 angewandt und belegt.

**④ §8 neuer Eintrag — der Vorgabewert als Falle.** `Monatlich` beim Anlegen ist die
folgenreichste Vorbelegung der App: Sie ist unauffällig, wirkt unbegrenzt in die Zukunft,
und war bis v2-26 nicht korrigierbar. Wo eine Vorbelegung eine Zeitreihe eröffnet, gehört
sie entweder zur bewussten Wahl gemacht oder nachträglich änderbar.

**⑤ Roadmap:** Paket 18 bekommt drei erledigte Punkte dazu (`KJ-6` bis `KJ-8`, neu
angelegt für diese Meldungen) und einen offenen für den Lösch-Toast aus §6 ③.
