# Sprint v2-25 — Briefing

> **Was diese Datei ist:** die Antwort auf `sprints/sprint_v2-25_schnitt.md`. Der Schnitt
> nennt Umfang, Phasen und Prüfanker; hier stehen die **Prüfschritte**, die
> **Akzeptanzkriterien** und das, was die Vorbereitung gegen die Datenbank ergeben hat.
>
> **Angelegt am:** 17. August 2026, in der Bau-Sitzung, nach `sprint-start`.
> **Branch:** `sprint/v2-25-loeschen` · **Plan freigegeben:** 17.08.2026
>
> Von den vier Kriterien aus `sprint-start` treffen **drei** zu: Die Datenbank wird
> berührt (P1 **und** P2) · drei Phasen plus Nachlauf · der Sprint reicht über mehrere
> Sitzungen.

**Grundlage:** `V2/befunde_2026-08-17_kuratierung-2026.md` (Diagnose) ·
`V2/design_direktor_2026-08-17_loeschen_und_nicht-angefallen.md` (Entscheidungen 1–5) ·
Design-Doku **v3.9.0** (§7, §12.3, §12.4, §12.5) · Roadmap **Paket 18** (`KJ-1` … `KJ-5`)

---

## Ziel — ein Satz

**Der Nutzer wird eine irrtümlich angelegte Karte wieder los und kann sagen, dass ein
Monat nicht angefallen ist — und sieht in beiden Fällen, was das mit der Sparrate macht.**

## Nicht-Ziel

- **Keine neue Gestaltung.** Alles entschieden (Record, Entscheidungen 1–5). Taucht eine
  Frage auf, die dort nicht beantwortet ist: **nicht raten**, melden und
  `design-direktor` ziehen (§7 Regel 3).
- **Keine Änderung an `calculate_card_amount_for_month`**, keine an
  `calculate_sparrate_for_month`, `calculate_planned_sparrate_for_month` oder
  `get_effective_plan_for_month`. Keine neue Rundungsstelle.
- **`HAS_LINKS` und `HAS_STATES` bleiben** unverändert Sperrgründe (Entscheidung des
  Nutzers vom 17.08., Begründung unten).
- **`M2`** (Verben und Gesten des Karten-Lebenszyklus) bleibt offen.
- **Kein Sichtbarmachen von Anpassungen ≠ 0** — bewusst nicht mitentschieden.
- **`KJ-5` (Datenpflege)** ist Arbeit des Nutzers in der App, kein Bauauftrag.

---

## 1. Was die Vorbereitung ergeben hat — und was sie am Schnitt geändert hat

Alles gegen die Produktiv-Datenbank gemessen, rein lesend, am 17.08.2026.

### ① Der Löschriegel ist nicht die größte Sperre — `HAS_LINKS` ist es

| | Anzahl |
|---|---|
| Karten, nicht gelöscht | 82 |
| **heute löschbar** | **0** |
| gesperrt durch `HAS_PAST_PLAN` | 78 |
| gesperrt durch **`HAS_LINKS`** | **79** |
| gesperrt durch `HAS_STATES` (vergangene Monate) | 9 |
| **löschbar nach diesem Sprint** | **3** |

**Der Befund vom Vormittag nannte 4 löschbare Karten, gemessen sind es 0** — der Nutzer
hat seither weiter kuratiert. Genau deshalb gibt es seit dem 13.08.2026 keine
eingefrorene Anker-Tabelle mehr.

**Alle neun „Fahrradteile" tragen je eine Zahlung** und bleiben nach diesem Sprint
gesperrt; ebenso `Fahrradzubehör` (2×), `Geschenk Lukas` (2×) und
`Inspektion Auto - Aline` (2×). Für sie führt der Weg über
„Verknüpfte Fragmente → Alle Verknüpfungen lösen" (existiert bereits,
`linked-fragments-overlay.tsx:146`) und danach Löschen.

> **Der Befund hat diesen Punkt gemacht, aber nur gegen die verworfene Variante:**
> *„Warum ‚nur Karten ohne Zahlung freigeben' nicht reicht: Es wären 3 von 78."* Genau
> dieselbe Zahl gilt für die **gewählte** Variante, solange `HAS_LINKS` steht. Das war
> vor dem Bauen zu klären.

**Entscheidung des Nutzers (17.08.2026): Nur der Vergangenheits-Riegel fällt.**
Begründung: Wer eine Karte löscht, an der eine echte Zahlung hängt, muss entscheiden,
wohin die Zahlung gehört — bei den Doppelten ist genau das die eigentliche Arbeit (die
Zahlungen sollen umziehen, nicht verschwinden). Ein automatisches Lösen träfe diese
Entscheidung stillschweigend für ihn.

**Die drei Karten, die sofort löschbar werden, sind die wichtigsten:**

| Karte | Typ | Monat | Wirkung |
|---|---|---|---|
| `Malin Besuch Erstattung Time Ride` | INCOME | Januar 2026 | Januar ist **+53,70 €** zu gut ausgewiesen |
| `Anteil Essen Aline Marburg` | INCOME | April 2026 | April ist **+15,00 €** zu gut ausgewiesen |
| `Inspektion Auto` | FIXED_COST | Mai 2026 | — |

### ② P2 berührt die Datenbank doch

Der Schnitt vermutete „Datenbank: vermutlich nein — zu prüfen". **Geprüft:**
`toggle_card_manually_paid` schreibt ausschließlich `manually_paid` und rührt
`adjusted_amount` nicht an. Entscheidung 4 verlangt aber **beide** Richtungen — „wer
danach abhakt, hebt die Anpassung auf". Das braucht einen Eingriff in diese RPC.

### ③ Falle 3 ist im August entschärft

In v2-24 wurde gemessen, dass **alle 34 im Juli aktiven Karten** eine verknüpfte Zahlung
haben. Im **August** ist das anders — sieben Karten ohne Zahlung, darunter genau die
aus dem Befund:

`ANTHROPIC – CLAUDE Abo` 107,10 · `Audible` 9,95 · `Fahrradteile` 26,90 ·
`Fitnessstudio` 104,00 · `Friseur` 45,00 · `iCloud` 9,99 · `iCloud – Anteil Mama` 7,00 (INCOME)

Gegenprobe „der Punkt darf **nicht** erscheinen": `Miete` (Zahlung verknüpft),
`Privates Budget` (BUDGET). Für Entscheidung 5 (Anpassung ≠ 0):
`Bezahlung Bergführer 1`, August, `adjusted_amount = 504,95`.

### ④ Der Toast weicht schon heute von §12.5 ab — Altbefund, nicht im Umfang

§12.5 nennt Titel `[Kartenname] gelöscht` und Subtext `Karte wird dauerhaft entfernt`.
Der Code sagt `Karte »[Kartenname]« gelöscht` und hat **gar keinen** Subtext. Das ist
älter als dieser Sprint und wird hier **nicht** mitgeändert — nur vermerkt, damit es
nicht als übersehen gilt.

---

## 2. Prüfanker

**Der Sprint selbst darf keine Zahl bewegen.** Er ändert, was *möglich* ist, nicht was
*ist*. Beim **Benutzen** bewegt sich die Vergangenheit dagegen absichtlich — das ist der
Zweck von `KJ-1`, nicht sein Fehler. Wer beides verwechselt, rollt einen korrekten Sprint
zurück oder lässt einen falschen durch.

### Gemessen am 17.08.2026 VOR dem Eingriff — Orientierung, kein Sollwert

| Monat 2026 | Ist | Plan | | Monat 2026 | Ist | Plan |
|---|---|---|---|---|---|---|
| Januar | 1.374,95 | 1.521,55 | | Juli | −35,74 | −2,97 |
| Februar | 1.670,39 | 1.653,59 | | August | 694,34 | 769,33 |
| März | 1.055,91 | 1.383,92 | | September | 1.797,18 | 1.797,18 |
| April | 1.794,59 | 1.812,77 | | Oktober | 1.765,67 | 1.765,67 |
| Mai | −341,86 | −203,67 | | November | 1.797,18 | 1.797,18 |
| Juni | 3.547,44 | 3.837,59 | | Dezember | 1.797,18 | 1.797,18 |

**Beide Invarianten: 0,00 in allen zwölf Monaten.**
Anker 1: Σ Ordner-Beträge == `calculate_sparrate_for_month`.
Anker 2: Σ delta == Ist − Plan.

> **Zwei Fallen bei Anker 2, beide hier aufgetreten:**
> `get_year_deviation_drivers` nimmt **`(p_year, p_limit)`**, nicht einen Monat — und
> **kein `p_user_id`**; ohne gesetzte Session wirft sie `28000` (§6 Stolperfalle 4).
> Und `p_limit` **muss 50 sein** (das Maximum): Bei kleineren Werten schneidet die
> Funktion die Treiber ab, die Summe fällt zu klein aus und die Invariante sieht
> verletzt aus, obwohl sie gilt.

### Prüfsummen vor dem Eingriff

| Funktion | md5 | erwartet nachher |
|---|---|---|
| `calculate_card_amount_for_month` | `4af07d327f17363e2452b815403e5c89` | **identisch** |
| `calculate_sparrate_for_month` | `68b4954451deb829a5e61d65b1946eaf` | **identisch** |
| `calculate_planned_sparrate_for_month` | `cb2b43af5cc71fd8d1556cefe2ecc51e` | **identisch** |
| `get_effective_plan_for_month` | `b93f894c88b463a5ce76674524641890` | **identisch** |
| `card_delete_gate` | `aeafb839c740a989a1f3c184e7870f5d` | ändert sich (P1, Absicht) |
| `delete_card` | `ab0baa040f3554fd57037c9cebf6a39f` | ändert sich (P1, Absicht) |
| `restore_card` | `e4810cf1d3e8d0736d87787347d37087` | **identisch** |

### Prüfstrecke

`tsc` 0 · ESLint (kanonisch, nur `src`) 0/0 · Build 0 · `test:visual` **113/113**
(darf **nur** um selbst geschriebene Tests steigen) · `test:e2e` **122/122**.
Eine neue `*.spec.ts` gehört in `playwright.config.ts` in `testMatch`.

---

## 3. Phase 1 · `KJ-1` — Der Riegel fällt, die Folge steht im Toast

**Datenbank: JA.**

### 1a · Der Riegel — beide Seiten, ein Commit

Die Regel lebt an **zwei** Orten (LL-26 / §6 Stolperfalle 16, in v2-20 real passiert):

| Ort | Änderung |
|---|---|
| `supabase/migrations/20260817_v2_25_kj1_loeschriegel.sql` | `HAS_PAST_PLAN`-Block in `card_delete_gate` entfällt. `HAS_LINKS`/`HAS_STATES` **unverändert** |
| `src/app/page.tsx` | `c.first_active_month >= nowMonthDb` raus aus `deletable`, `HAS_PAST_PLAN` raus aus `reasons` |
| `src/components/cards/cards.types.ts` | `"HAS_PAST_PLAN"` raus aus `DeleteGate["reasons"]` — der Compiler zeigt dann jede Stelle |
| `src/components/cards/card-interactive.tsx` | `HAS_PAST_PLAN`-Zeile aus `GATE_REASON_TEXT` |
| `tests/e2e/loesch-tor.spec.ts` | **bricht sonst** — er prüft heute alle drei Sperrgründe |

Der Wächter wird auf **zwei** Gründe umgestellt und bekommt **zwei neue Prüfungen**:
`HAS_PAST_PLAN` kommt in der Migration nicht mehr vor, und `page.tsx` vergleicht
`first_active_month` nicht mehr gegen `nowMonthDb`. Er prüft weiterhin **beide Seiten
auf dieselbe Regel** — das ist sein Zweck.

### 1b · Die Folgen-Zeile im Toast

**Die Summe darf nicht im Browser entstehen** — die Wirkung über N Monate ist eine
Sparraten-Rechnung, und Arbeitsregel 1 verbietet die im Frontend.

`delete_card` misst sie selbst, in **derselben Transaktion**:

1. Ist-Sparrate für alle Monate des Jahres messen (**vorher**)
2. `UPDATE cards SET deleted_at = now()` — wie bisher
3. Dieselben Monate erneut messen (**nachher**)
4. Differenz, Summe und Zahl der bewegten Monate zurückgeben

Das **ruft** `calculate_sparrate_for_month` auf und baut sie **nicht** nach. Kein
Rollback-Trick nötig, weil die Messung nach dem UPDATE bereits den Nachher-Stand sieht.

> **Der eine technische Punkt, der zu belegen ist, nicht anzunehmen (LL-22):**
> Sieht eine `STABLE`-Funktion die Änderung eines vorangegangenen `UPDATE` derselben
> Transaktion? Nach der Command-ID-Regel ja — **wird auf der Übungs-Datenbank
> nachgewiesen**. Fällt der Nachweis negativ aus, ist der Ersatzweg der RAISE-Rollback
> (LL-18).

**Signatur:** `delete_card(p_card_id uuid, p_year integer)`. Die alte
Ein-Parameter-Form wird **explizit gedroppt** — `create or replace` mit geänderter
Signatur legt sonst eine **Überladung** an und die alte Fassung bleibt still bestehen.

**Zeitfenster = das Kalenderjahr des angezeigten Monats.** Nicht explizit spezifiziert,
aber aus dem Record ableitbar: „Fahrradteile, 10 Monate, zusammen +269,00 €" =
10 × 26,90 € = März–Dezember 2026. Eine unbefristete monatliche Karte wirkt sonst
unendlich weit; das Kalenderjahr ist das Fenster, das die App überall sonst benutzt
(Welle §9, `get_year_deviation_drivers(p_year)`). **Gezählt werden nur Monate, in denen
sich die Sparrate tatsächlich bewegt** — damit stimmen beide Beispiele des Records.

**Anzeige (§12.5):**

| Fall | Text |
|---|---|
| mehrere Monate | `Sparrate in [N] Monaten · zusammen [±N] €` |
| genau ein Monat | `Sparrate [Monat] · [±N] €` |
| keine Wirkung | **gar nichts** — kein „Keine Änderungen" (LL-20) |

**Türkis**, wenn die Sparrate steigt (Entlastung), **rot**, wenn sie sinkt (Belastung).
Keine neue Farbe. Der Toast erscheint **sofort** mit dem Titel; die Folgen-Zeile wird
nachgereicht, sobald die Aktion antwortet.

---

## 4. Phase 2 · `KJ-2` + `KJ-3` — „Diesen Monat nicht angefallen", und man sieht es

**Datenbank: JA** (siehe §1 ②).

`KJ-3` gehört in **dieselbe** Phase. Ohne den Marker ist `KJ-2` eine stille
Falschaussage — eine bewusste 0 sähe aus wie fehlende Daten.

### Die zwei Aktionen

| Menüpunkt | schreibt |
|---|---|
| `Diesen Monat nicht angefallen` | UPSERT `adjusted_amount = 0`, `manually_paid = false` — **ein** Schreibvorgang, kein Widerspruch möglich |
| `Wieder mitzählen` | `UPDATE … SET adjusted_amount = NULL` — **niemals DELETE** (§6 Stolperfalle 3: sonst geht `manually_paid` mit verloren) |

Muster wie `applyAdjustmentThisMonth` (`cards/actions.ts:187`): direkter UPSERT auf
`card_monthly_states` mit `onConflict: "card_id,month"`. **Keine neue RPC** — es ist
derselbe Wert, den „Betrag anpassen auf 0 €, nur diesen Monat" heute schon schreibt.

### Die Gegenrichtung braucht eine Migration

`20260817_v2_25_kj2_haekchen_und_anpassung.sql`: `toggle_card_manually_paid` löscht
`adjusted_amount`, wenn beim **Einschalten** des Häkchens dort eine **0** steht.

Bewusst in der Datenbank und nicht in der Server Action: Es geht um zwei Felder, die
sich widersprechen können, und der Widerspruch **bewegt die Sparrate**. Atomar ist hier
richtig. (`applyAdjustmentForward` räumt vergleichbar in der Server Action auf — dort
geht es aber nicht um einen widersprüchlichen Zustand.)

### Sichtbarkeit im Kontextmenü

Direkt **unter** `Betrag anpassen`. Nur `FIXED_COST`/`INCOME` · **nicht** bei
Ghost/Forecast (`endDeleteOnly`) · **nicht**, wenn in diesem Monat eine Zahlung verknüpft
ist. Kein `…`, kein Dialog, ein Klick.

Welcher Punkt erscheint, folgt aus Entscheidung 5 („hebt **jede** Anpassung auf"):

| `adjustedAmount` | im Menü |
|---|---|
| `null` | `Diesen Monat nicht angefallen` |
| `0` | `Wieder mitzählen` |
| sonstiger Wert | **beide** — „auf 0 setzen" und „Anpassung aufheben" sind zwei Dinge |

### Die Statuszeile

`nicht angefallen` am rechten Anschlag, **anstelle** des Fälligkeitstags, wenn
`adjustedAmount === 0`. Eigene CSS-Klasse mit `color: var(--text-ghost)`, sonst
identisch zu `.dueDay` (9px/500) — die Zeilenhöhe bleibt unverändert.

> ⚠️ **Benanntes Risiko, erste Handlung in P2: die Breite messen.**
> Die Karte ist 136 px breit, Inhaltsbreite ~110 px. `nicht angefallen` ist deutlich
> länger als `am 15.`; neben `ERWARTET` könnte die Zeile überlaufen. **Passt es nicht,
> wird angehalten und `design-direktor` gezogen** — der Wortlaut wird nicht
> eigenmächtig gekürzt (§7 Regel 3).

---

## 5. Phase 3 · `KJ-4` — Die Monatsnamen überlagern sich

**Datenbank: nein. Ursache nicht geklärt — zuerst diagnostizieren** (§7 Regel 10).

Was die Vorbereitung bereits ausgeschlossen hat: `HeaderTimeline` ist eine
**Server**-Komponente, `formatMonthLabel` ist deterministisch, und der `new Date()`-Aufruf
in `page.tsx:99` speist `activeMonth`, das **ausschließlich ins Dev-Panel** geht. Als
Hydrations-Kandidat für die Flanken scheidet er damit aus — **die Hypothese des Befunds
ist noch nicht bestätigt.**

Reihenfolge: LL-21 abhaken (klebt eine Zahl an einer runden Grenze? nein, es sind keine
Daten), dann die Schleifen-Disziplin aus `diagnosing-bugs`: erst reproduzieren
(Monatswechsel im laufenden dev-Server, Browser-Konsole auf Hydrations-Warnung), dann
patchen. **Kein Patch ohne reproduzierten Fehler.**

Der Screenshot aus dem Befund liegt nicht mehr vor — `screenshots/` enthält nur
`Juli_2026.png` und `August_2026.png`. Die Reproduktion ist selbst zu erzeugen.

---

## 6. Prüfschritte für den Browser-Smoke

Regel-basiert formuliert (LL-19); die Karte dahinter ist nur der Klick-Vorschlag.

| | Was | Erwartung | Beleg |
|---|---|---|---|
| **S1** | Karte mit Vergangenheit **ohne** Zahlung, Menü öffnen → `Malin Besuch Erstattung`, Januar | `Karte löschen` ist **nicht** ausgegraut | §7 |
| **S2** | Diese Karte löschen | Toast nennt **einen** Monat: `Sparrate Januar · −53,70 €`, **rot** | §12.5 |
| **S3** | `Rückgängig` klicken | Karte ist zurück, Januar wieder 1.374,95 € | §2.4 |
| **S4** | Karte **mit** verknüpfter Zahlung → `Miete`, August | weiter ausgegraut, Grund `Erst die zugeordnete Zahlung lösen` | §7 |
| **S5** | Mehrmonatige Karte löschen → `Fahrradteile` (monatlich ab März) | Toast nennt **mehrere** Monate, **türkis** | §12.5 |
| **S6** | Fixkosten ohne Zahlung, Menü → `Friseur`, August | `Diesen Monat nicht angefallen` steht **unter** `Betrag anpassen`, ohne `…` | §12.4 |
| **S7** | Punkt klicken | Betrag `0,00 €`, rechts `nicht angefallen` **statt** Fälligkeitstag, Kartenhöhe unverändert | §7 · §12.3 |
| **S8** | Menü erneut öffnen | jetzt `Wieder mitzählen` | §12.4 |
| **S9** | Karte antippen (Häkchen setzen) | Anpassung aufgehoben, Betrag wieder 45,00 €, `Bezahlt` — **kein** Häkchen an einer 0,00-€-Karte | Entscheidung 4 |
| **S10** | `Wieder mitzählen` bei Anpassung **≠ 0** → `Bezahlung Bergführer 1` | auch diese Anpassung ist aufgehoben | Entscheidung 5 |
| **S11** | Budget-Karte, Menü → `Privates Budget` | Punkt erscheint **nicht** | §7 |
| **S12** | Zukunftsmonat, Ghost-Karte, Menü | Punkt erscheint **nicht** | §7 |
| **S13** | Monatswechsel über beide Chevrons, mehrfach | keine überlagerten Monatsnamen | §6 |

### Die vier Prüfungen aus `sprint-start`

| | |
|---|---|
| **LL-12** — Kartentyp genannt? | Ja, in jeder Zeile. „Realität gewinnt" ist hier zentral: Der Menüpunkt erscheint **nicht** bei verknüpfter Zahlung, weil die Prioritätskette Realität → Anpassung → Plan die Anpassung sonst überstimmen würde. „Überschritten" kommt in keiner Erwartung vor — richtig, den Zustand gibt es nur bei BUDGET. |
| **LL-15** — gegen Testdaten geprüft? | Ja, jede Instanz ist gegen die Produktiv-Datenbank gemessen. S6–S9 brauchen eine Karte **ohne** Zahlung im angezeigten Monat; im Juli gäbe es keine, im August sieben. |
| **LL-19** — regel-basiert? | Ja, die Spalte „Was" nennt die Regel, die Karte ist Beispiel. |
| **LL-20** — Budget ↔ Semantik? | Kein Konflikt. Der leere Fall im Toast zeigt **nichts** statt einer Null-Zeile — genau die Richtung, die LL-20 verlangt. |

---

## 7. Reihenfolge und Gates

Phasen-sequenziell, **ein Commit je Phase** (§7 Regel 11 / LL-14).

**Eine Abweichung mit Grund:** Die Übungs-Datenbank teilt sich einen Platz mit einer
**fremden, täglich genutzten** Anwendung (Rennrad-Trainer). Beide Migrationen werden
deshalb in **einem** Übungs-DB-Fenster geprobt, statt zweimal zu tauschen. Die Commits
bleiben getrennt — die Rücknehmbarkeit einer einzelnen Phase, um die es LL-14 geht,
bleibt vollständig erhalten.

**Menschlich, nicht verhandelbar:** die Freigabe **je Migration** vor Produktion · der
Browser-Smoke als Abnahme · der Merge. Kein Deploy, kein Force-Push.

## 8. Nachlauf

`design-system/komponenten/` — die Karten-Seite zeigt die Statuszeile und braucht den
Zustand `nicht angefallen`, sonst zeigt sie beim nächsten Gestaltungsgespräch einen
überholten Stand (CLAUDE.md §4, Ablauf `design-system/SYNC.md`).
