# Sprint v2-31 — Briefing

**„Verlauf" je Karte und je Ordner** · `M7` + `KAT-4` (Roadmap-Paket 10)
**Datum:** 31. August 2026 · **Branch:** `sprint/v2-31-verlauf`
**Freigabe:** erteilt nach Design-Runde und Plan-Vorlage.

> **Warum es diese Datei gibt.** Zwei der vier Kriterien aus `sprint-start` treffen zu:
> die **Datenbank wird berührt** und der Sprint hat **mehr als drei Phasen**. Ein
> Chat-Verlauf wird von der nächsten Sitzung nicht gelesen.

---

## Ziel

Ein Klick auf `Verlauf …` im Kontextmenü einer Karte oder einer Ordner-Kachel zeigt
24 Monate Ist gegen Plan als zwei Linien — teal und grau, in einem zentrierten Overlay.

Heute ist die Frage *„wie lief das übers Jahr?"* nur beantwortbar, indem man zwölfmal
den Monat wechselt.

## Nicht-Ziel

| | |
|---|---|
| **`KAT-5`** | Zahlung auf die Ordner-Kachel ziehen → Anlege-Fenster. War im Auftrag, auf Wunsch des Users **herausgenommen**. Record `A2` (07.08.2026) bleibt gültig, eigener Sprint. |
| **Tooltip / Monatsklick** | Der Verlauf reagiert nicht auf Hover und nicht auf Klick. Eigene Entscheidung, nicht stillschweigend nachrüsten. |
| **Gleitendes Fenster** | Fest Vorjahr + aktuelles Jahr. Ein rollierendes 24-Monats-Fenster ist `B1` (Paket 11). |
| **Rechenfunktionen** | Keine einzige wird geändert. Die neuen Funktionen **rufen** sie auf. |
| **Ordner `Einkommen`** | Bekommt keinen Verlauf — er ist keine Karten-Gruppe (§8, Record `A4`), und seine Kachel hat ausdrücklich kein Kontextmenü. |
| **Kumulierte Sicht** | §9 reserviert sie fürs Welle-Popup. Siehe Warnung unten. |

---

## Zwei Änderungen gegenüber dem Eröffnungsauftrag

**① `KAT-4` ist im Umfang.** Der Auftrag schloss es aus („KAT-4 wird in v2-31 NICHT
gebaut"). Der User hat in der Design-Runde entschieden, dass der Verlauf *„bei allen
Ordnern dargestellt werden muss"*. Das ist inhaltlich `KAT-4` — und Befund `U5` sagt
seit dem 04.08.2026, dass beide dieselbe Fläche brauchen.

**② Der Sprint braucht doch einen Datenbank-Eingriff.** Der Auftrag sagte „KEIN
Datenbank-Eingriff, keine Migration" und stützte sich auf die Roadmap-Zusage, `M7` sei
datenseitig abgedeckt. **Diese Zusage hält der Messung nicht stand** (LL-22):

`get_year_deviation_drivers` trägt die Zeile `WHERE round(delta_roh, 2) <> 0` und
liefert deshalb **ausschließlich Karten, die vom Plan abweichen**.

| 2026 | Jan | Feb | Mär | Apr | Mai | Jun | Jul | Aug | Sep | Okt | Nov | Dez |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Karten aktiv | 27 | 23 | 30 | 27 | 34 | 30 | 34 | 29 | 22 | 23 | 22 | 22 |
| davon geliefert | 11 | 5 | 5 | 5 | 7 | 3 | 5 | 5 | **0** | **0** | **0** | **0** |

Netflix läuft zwölf Monate exakt auf Plan → erscheint in **keinem** Monat, sein Verlauf
wäre leer. Der Widerspruch wurde dem User vorgelegt (§7 Regel 19); die neue **rein
lesende** Funktion ist freigegeben.

---

## Prüfanker — dieser Sprint darf keinen Zahlenwert bewegen

**Vorher gemessen am 31.08.2026, Protokoll: `sprints/sprint_v2-31_anker.md`.**

| Anker | Vorher | Erwartung nachher |
|---|---|---|
| Sparrate 24 Monate, Ist und Plan | siehe Protokoll | **identisch** |
| Anker 1 — Ordner-Spalte == Sparrate | 0,00 € in 24/24 | 0 Verletzungen |
| Anker 2 — `Σ delta = Ist − Plan` | 0,00 € in 24/24 | 0 Verletzungen |
| Prüfsummen der 9 Rechenfunktionen | siehe Protokoll | **unverändert** |
| **neu A** — Serien-Ist je Ordner == `get_category_amounts_for_month` | — | 0,00 € in 24/24 |
| **neu B** — Σ Serien-Plan + Netto == Plan-Sparrate | 0,00 € in 24/24 | 0 Verletzungen |

> **Ein grüner Nachher-Wert ist hier das erwartete Ergebnis, kein Beleg für Sorgfalt.**
> Die neuen Funktionen lesen nur. Wenn sich trotzdem etwas bewegt, ist das ein Befund
> und kein Zufall.

**Prüfstrecke:** `tsc` 0 · Lint 0/0 · `pnpm build` 0 · `test:visual` 148/148 ·
`test:e2e` 157/157. Die Zahlen dürfen nur um selbst geschriebene Tests **steigen**.

---

## Phasen — ein Commit je Phase, N+1 erst nach grüner N (§7 Regel 11)

### P0 · Record, Entwürfe, Anker — kein Code
`V2/design_direktor_2026-08-31_verlauf.md` ·
`design-system/entwuerfe/v2-31-verlauf.html` (ohne `@dsCard`-Marker) ·
`sprints/sprint_v2-31_anker.md` (Vorher-Messung) · diese Datei.

### P1 · Datenbank — zwei neue Lese-Funktionen
`supabase/migrations/20260831_v2_31_verlauf_serien.sql`

```
get_card_amount_series(p_card_id uuid, p_year integer)         → jsonb
get_category_amount_series(p_category_id uuid, p_year integer) → jsonb
```

24 Einträge `{month_index 0..23, month, aktiv, ist, plan}` für `p_year-1` und `p_year`.
Beide `STABLE`, rein lesend.

**Fähigkeit `db-eingriff` laden, bevor das erste SQL entsteht.**

- **Kein `p_user_id`** — §6 Stolperfalle 4: wer eine einzelne Entität auflöst, nimmt
  keins. Die `user_id` kommt aus `cards` bzw. `card_categories`.
- **Split genau einmal, nur auf die Plan-Seite** (§6 Stolperfalle 11). Das Ist ist
  bereits der Anteil.
- **Der Ordner-Ist ruft `get_category_amounts_for_month` auf** statt nachzubauen —
  wegen des Rest-Ausgleichs, siehe Warnung unten. Laufzeit messen.
- Trockenlauf per RAISE-Rollback mit `SET CONSTRAINTS ALL IMMEDIATE` (LL-39).
- `supabase gen types` danach; `<claude-code-hint>` prüfen; **Namensmengen** vergleichen,
  nicht den Zeilen-Diff lesen.
- Wrapper in `src/lib/rpc.ts`, Throw-on-Error (LL-2).

### P2 · Overlay + Menüpunkt auf Karten
`src/components/cards/verlauf-overlay.tsx`, Muster `frequency-overlay.tsx`.
Zentriert per **React-Portal an `document.body`** (§7: die einzige Ausnahme der App ist
das Kontextmenü selbst). Escape schließt.
Menüpunkt `Verlauf …` in `card-interactive.tsx` — **nicht** bei `ONCE`, **ja** auf
Ghost-Karten.

### P3 · Menüpunkt auf der Ordner-Kachel
`Verlauf …` im ⋯-Menü von `category-tile.tsx`. Dieselbe Overlay-Komponente, anderer
Datenlader. Beträge als Höhe, Vorzeichen in der Unterzeile.

### P4 · Wächter, Doku, Abschluss
`tests/e2e/verlauf.spec.ts` — **die echte Quelldatei transpilieren und ausführen**, nicht
die Regel nachbauen. **In `playwright.config.ts` `testMatch` eintragen.**
Doku-Patches über `docs-maintainer`. `design-system/komponenten/verlauf.html` **mit**
Marker. Fähigkeit `sprint-abschluss`.

---

## Prüfschritte für den Browser-Smoke des Users

Regel-basiert formuliert, nicht instanz-basiert (LL-19) — die genannten Karten sind
Beispiele für die Regel, nicht die Bedingung.

| | Schritt | Erwartung | § |
|---|---|---|---|
| **S1** | Kontextmenü einer **monatlichen Budget-Karte** (z. B. `Tanken`) → `Verlauf …` | Overlay öffnet **zentriert**, nicht am Icon. 24 Monate, zwei Linien. | §7 Position |
| **S2** | Im selben Overlay auf die rechte Hälfte sehen | Teale Linie **endet** am laufenden Monat, `heute`-Marke steht dort. Graue Linie läuft bis Dezember. | Record §2 |
| **S3** | Escape drücken, dann Klick außerhalb | Overlay schließt bei beidem. | §2.4-Muster |
| **S4** | Kontextmenü einer **gemeinsamen Fixkosten-Karte** (z. B. `Miete`) → `Verlauf …` | Die Linien liegen **nah beieinander**, nicht dauerhaft 43 % auseinander. Unterzeile trägt `von [Betrag] €`. | Record §4 |
| **S5** | Kontextmenü einer **jährlichen Karte** (z. B. `ADAC Mitgliedschaft`) | Zwei **Punkte**, keine durchgehende Linie, nichts auf der Nulllinie. | Record §3 |
| **S6** | Kontextmenü einer **Einmal-Karte** (z. B. ein Urlaubs-Posten) | `Verlauf …` **fehlt** im Menü. | Record §5 |
| **S7** | Kontextmenü einer **Ghost-/Zukunfts-Karte** (Monat in die Zukunft schalten) | `Verlauf …` **ist da**, neben den Lebenszyklus-Verben. | Record §5 |
| **S8** | ⋯-Menü einer **Ordner-Kachel** (z. B. `Wohnen`) → `Verlauf …` | Dieselbe Fläche. Der Wert im angezeigten Monat **stimmt mit der Kachel überein**. | Record §8 |
| **S9** | Danach: **Einkommens-Popup** öffnen und darin klicken | Die Jahres-Welle geht **nicht** zusätzlich auf. | LL-6 |
| **S10** | Sparrate im Ring vor und nach allem | **unverändert** | Anker |

> **S9 ist kein Formalismus.** In v2-10 hat ein Portal genau das ausgelöst, und **die
> komplette Prüfstrecke blieb dabei grün** — gefunden hat es erst der optische Smoke.

---

## Die Fallen dieses Sprints

**① §9 verbietet die kumulierte Sicht außerhalb des Welle-Popups.** Dieser Verlauf zeigt
je Monat den Wert *dieses* Monats — die Darstellungsform der Welle, nicht die des
Popups. Das Verbot greift deshalb **nicht**. ⚠️ Eine Treppe hier einzubauen („Ausgaben
seit Januar") verletzt §9, ohne dass eine Zahl falsch würde. Die Exklusivitäts-Aussage
steht in der **Funktions-Einleitung** von §9, nicht in der Verbotsliste — genau deshalb
wurde sie beim ersten Zuschnitt übersehen (`U5`, Schwere SCHWER).

**② Der Rest-Ausgleich der Ordner-Ist-Werte.** `get_category_amounts_for_month` legt den
Rundungs-Rest auf den **betragsgrößten** Ordner, damit Anker 1 exakt gilt. Wer die
Summierung nachbaut, weicht um Cent ab — und **keine Zahl sieht dabei falsch aus**
(LL-25/LL-26). Deshalb wird die bestehende Funktion aufgerufen, nicht nachgebaut.

**③ Das Portal repariert den Layout-Bezug und zerreißt den DOM-Bezug** — `closest()`,
`contains()`, CSS-Nachfahren, Eltern-Hover. Event-Bubbling läuft weiter, weil Portale
React-Kinder bleiben (LL-6). Prüfschritt **S9**.

**④ Ein neuer Wächter muss einmal rot gewesen sein** (LL-40). In v2-29 lief der neue Test
beim ersten Versuch grün, weil sein Muster die falsche Stelle traf — ein grüner Lauf
hätte das nie verraten.

**⑤ Eine neue `*.spec.ts` läuft im `visual`-Projekt nicht von allein mit.** Sie muss in
`playwright.config.ts` in `testMatch` eingetragen werden, sonst bleibt sie unbemerkt
liegen und die Gesamtzahl verrät den Unterschied nicht.

**⑥ ESLint im Worktree** nur über
`npx eslint src --ext .ts,.tsx --no-eslintrc --config .eslintrc.json --resolve-plugins-relative-to .`
· **`pnpm build` nie bei laufendem dev-Server** — beide teilen `.next`.

---

## Offene Fragen

- **Laufzeit des Ordner-Verlaufs.** 24 interne Aufrufe von
  `get_category_amounts_for_month` à ~26 ms sind rechnerisch ~620 ms. Wird beim Bauen
  gemessen. Geht sie über ~800 ms, wird **mit Messung** optimiert, nicht auf Verdacht
  (LL-29).
- **Verhalten bei einem Ordner, dessen Vorzeichen wechselt.** Tritt heute nicht auf.
  Wenn es auftritt, ist „Betrag als Höhe" mehrdeutig — dann neu entscheiden, nicht raten.

---

*Briefing · Antigravity Finance · Sprint v2-31 · 31. August 2026*
