# Sprint v2-25 — Schnitt

> **Was diese Datei ist und was sie NICHT ist.** Sie ist der **Schnitt**: Umfang,
> Phasen, Reihenfolge, Prüfanker. Sie ist **kein Briefing** — die Prüfschritte
> `S1…Sn`, die Akzeptanzkriterien und die vier Prüfungen aus `sprint-start`
> (LL-12, LL-15, LL-19, LL-20) entstehen in der **Bau-Sitzung**, nicht hier.
>
> **Warum diese Trennung.** Der Schnitt ist eine Steuerungsentscheidung und fiel im
> Chat, in dem auch die Diagnose und die Gestaltung entstanden sind. Das Nachbohren
> gehört dagegen dorthin, wo gebaut wird — wandert es hierher, beginnt die Bau-Sitzung
> mit fertigen Antworten statt mit eigenen Fragen, und die vier Prüfungen laufen nie.
> (Begründung: Fähigkeit `eroeffnungs-prompt`, Abschnitt „Was hier NICHT hineingehört".)
>
> **Erster Schritt der Bau-Sitzung ist deshalb `sprint-start`**, nicht das Bauen.

**Datum des Schnitts:** 17. August 2026
**Grundlage:** `V2/befunde_2026-08-17_kuratierung-2026.md` (Diagnose, alles gemessen) ·
`V2/design_direktor_2026-08-17_loeschen_und_nicht-angefallen.md` (Entscheidungen 1–5) ·
Design-Doku **v3.9.0** (§7, §12.3, §12.4, §12.5) · Roadmap **Paket 18** (`KJ-1` … `KJ-5`)

---

## Ziel — ein Satz

**Der Nutzer wird eine irrtümlich angelegte Karte wieder los und kann sagen, dass ein
Monat nicht angefallen ist — und sieht in beiden Fällen, was das mit der Sparrate macht.**

## Nicht-Ziel

- **Keine neue Gestaltung.** Alles ist entschieden (Record, Entscheidungen 1–5;
  Design-Doku v3.9.0). Taucht eine Frage auf, die dort nicht beantwortet ist:
  **nicht raten**, melden und `design-direktor` ziehen (§7 Regel 3).
- **Keine Änderung an `calculate_card_amount_for_month`.** Der neue Menüpunkt schreibt
  denselben Wert wie der heutige Weg „Betrag anpassen auf 0 €, nur diesen Monat".
- **Keine Änderung an den Sparrate-Funktionen**, keine neue Rundungsstelle.
- **`M2`** (Verben und Gesten des Karten-Lebenszyklus) bleibt offen und wird nicht
  angefasst.
- **Kein Sichtbarmachen von Anpassungen ≠ 0** — bewusst nicht mitentschieden.
- **Die Datenpflege (`KJ-5`)** ist **nicht** Teil des Sprints. Sie ist Arbeit des Nutzers
  in der App und hängt an P1 und P2.

---

## Prüfanker

**Der Sprint selbst darf keine Zahl bewegen.** Er ändert, was *möglich* ist, nicht was
*ist*. Bewegt sich beim Bauen ein Wert, ist es ein Fehler.

> ### ⚠️ Die Verwechslung, die diesen Sprint teuer machen kann
>
> **Beim Benutzen bewegt sich die Vergangenheit — und zwar absichtlich.** Sobald der
> Nutzer eine Karte mit Vergangenheit löscht, ändern sich die Sparraten vergangener
> Monate. Das ist der Zweck von `KJ-1`, nicht sein Fehler.
>
> **Beim Bauen darf sich nichts bewegen.** Wer die beiden verwechselt, rollt einen
> korrekten Sprint zurück — oder lässt einen falschen durch.
>
> **Regel für die Messung:** Anker vorher/nachher in **derselben Sitzung**, und
> **zwischen den beiden Messungen nichts in der App tun**. Wer zwischendurch klickt,
> misst seine eigene Benutzung.

**Zusätzlich, weil zwei Rechenfunktionen in der Nähe sind:** Prüfsummen
`md5(pg_get_functiondef(...))` von `calculate_card_amount_for_month`,
`calculate_sparrate_for_month`, `calculate_planned_sparrate_for_month` und
`get_effective_plan_for_month` **byte-identisch** vor und nach dem Sprint. Das Verfahren
hat sich in v2-24 bewährt: Der Anker allein hätte einen zufällig übereinstimmenden
Nachbau nicht gefunden.

**Anker-Werte als Orientierung, gemessen am 17.08.2026** — **kein Sollwert**:

| Monat 2026 | Ist | Plan | | Monat 2026 | Ist | Plan |
|---|---|---|---|---|---|---|
| Januar | 1.374,95 | 1.521,55 | | Juli | −35,74 | −2,97 |
| Februar | 1.670,39 | 1.653,59 | | August | 694,34 | 769,33 |
| März | 1.055,91 | 1.383,92 | | September | 1.797,18 | 1.797,18 |
| April | 1.794,59 | 1.812,77 | | Oktober | 1.765,67 | 1.765,67 |
| Mai | −341,86 | −203,67 | | November | 1.797,18 | 1.797,18 |
| Juni | 3.547,44 | 3.837,59 | | Dezember | 1.797,18 | 1.797,18 |

> **Diese Zahlen sind am Vormittag des 17.08. noch anders gewesen** (März 1.042,55 ·
> April 1.872,77 · Mai −113,67) — der Nutzer hat zwischendurch kuratiert. Genau deshalb
> gibt es seit dem 13.08.2026 **keine eingefrorene Anker-Tabelle** mehr. Immer selbst
> messen, nie gegen eine Tabelle in einer Datei vergleichen.

**Beide Invarianten** müssen weiter in allen zwölf Monaten gelten:
Σ Ordner-Beträge == `calculate_sparrate_for_month` · Σ delta == Ist − Plan.

**Prüfstrecken-Erwartung:** `tsc` 0 · ESLint (kanonisch, `src`) 0/0 · Build 0 ·
`test:visual` **113/113** und darf **nur** um selbst geschriebene Tests steigen ·
`test:e2e` **122/122**.

---

## Phasen

Phasen-sequenziell, ein Commit je Phase, Phase N+1 startet erst nach grüner Phase N
(§7 Regel 11 / LL-14). Reihenfolge: der Riegel zuerst, weil fünf Meldungen und die
gesamte Datenpflege daran hängen.

### Phase 1 · `KJ-1` — Der Löschriegel fällt, die Folge steht im Toast
**Datenbank: JA** → Fähigkeit `db-eingriff`

**Zwei Seiten, und die zweite ist die Falle:**
- `card_delete_gate` / `delete_card` — `HAS_PAST_PLAN` darf nicht mehr sperren.
- **`page.tsx` bildet das Lösch-Tor NACH** (Kommentar dort nennt es selbst). Wer nur die
  Datenbank ändert, hebt die Änderung stillschweigend auf: Das Menü zeigt weiter einen
  ausgegrauten Punkt, den die Datenbank längst durchließe. **In v2-20 real passiert**
  (`KU-2`), Wächter dafür ist `tests/e2e/loesch-tor.spec.ts` — er prüft **beide Seiten
  auf dieselbe Regel** und muss mitgezogen werden.

**Dazu die Folgen-Zeile im Toast** — Summe und Zahl der Monate, türkis/rot nach
Entlastung/Belastung, leerer Fall zeigt nichts (Design-Doku §7 + §12.5).

> **Die Summe muss aus der Datenbank kommen, nicht aus dem Browser.** Arbeitsregel 1:
> keine eigene Sparrate-Rechnung im Frontend. Die Wirkung einer Löschung über N Monate
> ist eine Sparraten-Rechnung.

### Phase 2 · `KJ-2` + `KJ-3` — „Diesen Monat nicht angefallen", und man sieht es
**Datenbank: vermutlich nein** — der Wert `adjusted_amount = 0` existiert und wird
bereits geschrieben; zu prüfen ist, ob ein eigener RPC-Weg nötig ist oder der bestehende
genügt.

- Menüpunkt `Diesen Monat nicht angefallen` + Gegenstück `Wieder mitzählen`
- Sichtbarkeits-Regeln: nur FIXED_COST/INCOME · nicht Ghost/Forecast · **nicht bei
  verknüpfter Zahlung in diesem Monat**
- Bezahlt-Häkchen und „nicht angefallen" schließen sich aus (Entscheidung 4)
- `Wieder mitzählen` hebt **jede** Anpassung des Monats auf (Entscheidung 5)
- Statuszeile `nicht angefallen` **anstelle** des Fälligkeitstags, Ghost-Ton

**`KJ-3` gehört in dieselbe Phase, nicht in eine eigene.** Ohne den Marker ist `KJ-2`
eine stille Falschaussage — die beiden getrennt auszuliefern hieße, einen Zustand
sichtbar zu machen, den man nicht erkennt.

### Phase 3 · `KJ-4` — Die Monatsnamen überlagern sich
**Datenbank: nein**

**Zuerst diagnostizieren, dann patchen** (§7 Regel 10). Die Ursache ist **nicht**
geklärt; die Hypothese steht im Befund (Hydrations-Unterschied) und ist eine
**Beobachtung, keine These**. Reihenfolge: LL-21 abhaken, dann in die Schleifen-Disziplin
aus `diagnosing-bugs`.

### Nachlauf, außerhalb der Phasen
**`design-system/komponenten/`** — die Karten-Seite zeigt die Statuszeile und braucht den
Zustand `nicht angefallen`, sonst zeigt sie beim nächsten Gestaltungsgespräch einen
überholten Stand (CLAUDE.md §4, Ablauf `design-system/SYNC.md`).

---

## Warum diese Reihenfolge

| | Begründung |
|---|---|
| **P1 zuerst** | Fünf der zehn Meldungen. Und: Solange der Riegel steht, ist **jede** neu angelegte Karte sofort unlöschbar — die Datenpflege (`KJ-5`) würde jeden Fehler dauerhaft machen. |
| **P2 danach** | Braucht P1 nicht technisch, aber der Nutzer braucht beides zusammen, um `KJ-5` zu erledigen. |
| **P3 zuletzt** | Klein, unabhängig, und die Ursache muss erst gefunden werden — das ist der einzige Punkt mit offener Diagnose. |
| **`KJ-5` danach** | Arbeit in der App, kein Bauauftrag. Hängt an P1 und P2. |

---

## Briefing-Datei: **ja**, aber sie entsteht in der Bau-Sitzung

Von den vier Kriterien aus `sprint-start` treffen **drei** zu: Die Datenbank wird berührt
(P1) · es sind drei Phasen plus Nachlauf · der Sprint reicht über mehrere Sitzungen
(Diagnose und Gestaltung hier, Bau dort). Die Datei `sprints/sprint_v2-25_briefing.md`
gehört also angelegt — **mit** den Prüfschritten, die hier bewusst fehlen.
