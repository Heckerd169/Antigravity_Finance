# Sprint v2-19 — Briefing

> **Thema:** `GE-1` / `GE-2` — „Realität gewinnt" auch für das Netto.
> **Stand:** Phase ① (Nachbohren) am 13.08.2026 abgeschlossen, Ziel, Nicht-Ziel und
> Prüfanker **vom User freigegeben**. Phase ② (Schneiden) und ③ (Plan) stehen aus.
> **Branch:** `sprint/v2-19-gehalt`.
>
> **Warum diese Datei existiert:** Zwei der vier Kriterien treffen zu — die Datenbank
> wird berührt, und der Sprint läuft über mehrere Sitzungen. Phase ① fand in einer
> Sitzung statt, die gebaut wird in der nächsten. **Ein Chat-Verlauf wird von der
> nächsten Sitzung nicht gelesen** — alles, was zum Bauen nötig ist, steht hier.

---

## 1 · Ziel — freigegeben

Ziehst du dein Gehalt aus der Rohmasse auf die Netto-Kachel, rechnet **dieser Monat**
mit dem tatsächlich überwiesenen Betrag statt mit dem geplanten — und die Differenz
wird sichtbar, statt lautlos zu verschwinden.

## 2 · Nicht-Ziel — freigegeben

- Der **Plan** bleibt unangetastet. Ebenso **alle Folgemonate**. Für echte
  Gehaltsänderungen gibt es das Einkommens-Fenster (§10).
- **Kein Fairness-Ausgleich.** `E1` bleibt liegen — er entsteht hier auch gar nicht:
  Der Partner-Anteil hängt am **Brutto**, nicht am Netto.
- Das **Partner-Netto** wird nicht ablegbar.
- `income_timeline` wird **nicht** zur Ablage von Monats-Ist-Werten umgewidmet.
- **Keine Gehaltskarte** — das ist `GE-3`, bewusst vertagt (Record, Abschnitt
  „Verworfen").
- Onboarding, Einkommens-Fenster, Brutto, Steuerklasse und `get_split_factor` werden
  **nicht** angefasst.

## 3 · Prüfanker — freigegeben

Nach dem Ablegen des Juli-Gehalts (Fragment vom **28.07.2026, 4.149,54 €**,
`Lohn-/Gehaltzahlung 7/2026`):

| | vorher | nachher |
|---|---|---|
| Ist-Sparrate Juli | **6,73 €** | **−8,84 €** — exakt **−15,57 €** |
| Plan-Sparrate Juli | **23,93 €** | **23,93 €** — unverändert |
| Differenz Ist − Plan | −17,20 € | **−32,77 €** |
| **Summe der Treiber Juli** | −17,20 € | **−32,77 €**, mit eigener Zeile `Gehalt −15,57 €` |
| alle übrigen elf Monate | — | **0,00 €** |

> **Die Treiber-Summe ist der schärfere Teil des Ankers, nicht die Sparrate.** Ein
> Sprint, der die Sparrate korrekt bewegt und die Treiber-Liste stehen lässt, ist
> **rot** — dann erklärte das Jahres-Popup eine Abweichung von 32,77 € mit Gründen,
> die nur 17,20 € ergeben, und die Abweichung, um die es hier überhaupt geht, bliebe
> unsichtbar. Nur ein Bildschirm weiter hinten.

**Stand der Anker-Messung vor dem Sprint** (13.08.2026, nach Anlage der Karte
`Rundfunkbeitrag`): Januar 1.899,67 · Feb–Mär 1.931,18 · April 1.899,67 ·
Mai −86,77 · Juni 4.208,76 · Juli 6,73 · August 1.761,08 · September 1.824,08 ·
Oktober 1.792,57 · Nov–Dez 1.824,08. **Vor dem Bauen neu messen** — der User kuratiert
weiter, und seit dem 13.08.2026 gibt es bewusst keine eingefrorene Sollwert-Tabelle
mehr (CLAUDE.md §9).

---

## 4 · Die zwei Funde, die den Zuschnitt bestimmen

**Beide sind gegen die Datenbank belegt, nicht aus der Doku erschlossen (LL-22).**

### Fund 1 — der Eingriff darf NICHT in `get_net_monthly_for_month`

`get_net_monthly_for_month` wird von **beiden** Sparraten-Funktionen aufgerufen:

| Funktion | ruft `get_net_monthly_for_month` |
|---|---|
| `calculate_sparrate_for_month` | ja |
| `calculate_planned_sparrate_for_month` | ja |
| `get_category_amounts_for_month` | ja (für den Einkommens-Ordner) |

Würde die Wirklichkeit dort eingebaut, verschöben sich **Ist und Plan gleich weit** —
die Differenz bliebe bei −17,20 €, die Abweichung wäre danach **unsichtbarer als
vorher**, und der Prüfanker oben wäre nicht erfüllbar. Das ist exakt das Muster von
**LL-23**: eine Formel, die beide Seiten einer Differenz benutzt.

**Der Eingriff gehört ausschließlich in die Ist-Funktion.** Die Plan-Funktion liest
weiter die Zeitreihe.

> **Offene Detailfrage für Phase ②:** Was tut `get_category_amounts_for_month`? Die
> Ordner-Spalte **muss** weiterhin exakt die Ist-Sparrate ergeben (Anker 1, CLAUDE.md
> §9 / LL-25). Der Einkommens-Ordner trägt das Netto — er muss also **denselben**
> Ist-Wert verwenden wie `calculate_sparrate_for_month`, sonst bricht Anker 1 sofort.

### Fund 2 — die Treiber kennen nur Karten

`get_year_deviation_drivers` läuft über `JOIN cards`; jeder Treiber trägt
`card_id`, `card_name`, `card_type`, `attribution`. **Ein Gehalt ist keine Karte.**
Ohne Erweiterung bricht die **B2-Invariante** `Σ delta = Ist − Plan` (§6 Stolperfalle
9) — und das ist einer der beiden Anker, die am 13.08.2026 gerade erst als *stehender*
Anker festgeschrieben wurden.

Zu beachten:
- Die Funktion liest `auth.uid()` **selbst** und wirft `28000` ohne Session. Ein
  Aufruf über MCP scheitert, wenn nicht vorher `request.jwt.claims` gesetzt ist
  (§6 Stolperfalle 4).
- Sie nimmt **kein** `p_user_id` — die Ausnahme in der anderen Richtung.
- Das **Frontend** muss einen Treiber **ohne** `card_id` vertragen. Vorher prüfen, ob
  irgendwo auf `card_id` zugegriffen wird, ohne auf `null` zu prüfen.

---

## 5 · Ablage — wohin der Ist-Wert gehört

**Nicht in `income_timeline`.** Sie hat fünf Zeilen und beschreibt Gehalts**änderungen**
(Forward-Inheritance, Composite-Key `(user_id, person, effective_month)`). Ein
Monats-Ist-Wert dort bräuchte **zwei** Zeilen je Korrektur — eine für den Monat, eine
zum Zurückstellen — und machte „echte Erhöhung" von „einmalige Abweichung"
ununterscheidbar.

**Vorschlag für Phase ②:** eine eigene, schmale Ablage neben der Zeitreihe — Monat,
Person, Ist-Netto, und die **Herkunft** (welches Fragment). Letzteres ist Pflicht, denn
es ersetzt den `card_fragment_links`-Eintrag, den es hier nicht geben kann: Ein Link
braucht eine `card_id`, und die gibt es nicht.

**Zwingend zu klären, bevor gebaut wird:**
- **Verschwindet das Gehalt aus der Rohmasse?** Der Zustand `status` der View
  `fragments_with_status` hängt an `card_fragment_links`. Ohne Link bliebe das
  Fragment `UNASSIGNED` — also weiterhin ziehbar und weiterhin oben in der Liste.
  Der Prüfanker verlangt das nicht, das **Ziel** aber schon.
- **Neue Tabelle ⇒ RLS-Policy von Hand** (§6 Stolperfalle 15, Befund D8). Der
  Event-Trigger `rls_auto_enable` setzt nur `ENABLE` und schluckt sein eigenes
  Scheitern; PostgREST liefert dann ein stilles `[]`.

---

## 6 · Gestaltung — entschieden, nicht offen

Beide Fragen hat der User am 13.08.2026 direkt beantwortet. Record:
`V2/design_direktor_2026-08-13_gehalt.md`.

| | Entscheidung |
|---|---|
| **A** | Die Netto-Kachel verhält sich beim Ziehen und Ablegen **wie eine Fixkosten-Karte** — gleiche Hervorhebung, danach Plan und Wirklichkeit nebeneinander. Sie wird dadurch **keine** Karte: kein Kontextmenü, kein Lebenszyklus; der Klick öffnet weiterhin das Einkommens-Fenster. |
| **B** | Die neue Treiber-Zeile heißt **„Gehalt"** und ist **nicht anklickbar** — kein Cursor-Wechsel, kein Hover, kein Zielsprung. |

---

## 7 · Was der Sprint anfassen wird — Erwartung, kein Plan

Der Plan entsteht in Phase ③ über den Planungsmodus. Diese Liste ist die
Erwartungshaltung aus Phase ①, damit die nächste Sitzung nicht bei null anfängt.

| Teil | Datenbank |
|---|---|
| Ablage für das Ist-Netto (Tabelle + RLS-Policy + Schreib-/Lösch-RPC) | **ja** |
| `calculate_sparrate_for_month` — Ist bevorzugt den echten Wert | **ja** |
| `get_category_amounts_for_month` — Einkommens-Ordner zieht mit (Anker 1) | **ja** |
| `get_year_deviation_drivers` — Zeile „Gehalt", `card_id: null` | **ja** |
| Netto-Kachel als Ablageziel, Anzeige Plan ↔ Wirklichkeit, Lösen | nein |
| Treiber-Anzeige verträgt einen Eintrag ohne Karte | nein |

**Alles mit Datenbank läuft über die Fähigkeit `db-eingriff`** — Probe auf der
Übungs-Datenbank, Anker 2.200,00 € vorher und nachher, Trockenlauf für jede mutierende
RPC, Prüfsummen-Vergleich Übung ↔ Produktion. **Kein Eingriff in eine Rechenfunktion
ohne diese Probe** (§7 Regel 20).

**Phasenschnitt-Empfehlung:** Ablage → Ist-Sparrate → Ordner-Spalte → Treiber →
Oberfläche. Ein Commit je Phase (LL-14). Die Ordner-Spalte gehört **unmittelbar** hinter
die Ist-Sparrate, nicht ans Ende: Zwischen beiden Phasen ist Anker 1 gebrochen, und
dieser Zustand soll so kurz wie möglich bestehen.

---

## 8 · Offene Fragen — bewusst nicht leer

1. **Rohmasse-Zustand:** siehe §5. Braucht eine Antwort, bevor die Oberfläche gebaut
   wird — sonst bleibt das Gehalt nach dem Ablegen ziehbar.
2. **Rückwirkend:** Der User ordnet in den nächsten Tagen auch ältere Monate zu.
   Gilt die Gehalts-Zuordnung für **jeden** Monat mit einem Gehalts-Fragment, auch
   2025? Erwartung: ja, ohne Sonderregel — aber der Prüfanker oben ist nur für Juli
   2026 formuliert.
3. **Zwei Gehälter in einem Monat** (Nachzahlung, 13. Gehalt): Summe der zugeordneten
   Fragmente, oder nur eines? Heute existiert kein solcher Monat — die Regel ist
   trotzdem vor dem Bauen festzulegen (LL-19: regel-basiert, nicht instanz-basiert).
