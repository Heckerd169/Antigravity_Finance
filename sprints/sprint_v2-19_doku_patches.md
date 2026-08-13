# Sprint v2-19 — Doku-Patches

> **Verfahren:** LL-16 / §7 Regel 14 — Anker + Patch-Satz je Stelle, danach anwenden.
> Die Bibeln werden **nie** direkt editiert.
>
> **Betroffen:** Design-Doku **3.6.0 → 3.7.0** · Schema-Doku **3.5.0 → 3.6.0**
> **Anlass:** Sprint v2-19 (`GE-1`, `GE-2`) · Record `V2/design_direktor_2026-08-13_gehalt.md`

---

# Design-Doku

## D1 · Header-Version

**Anker:** `**Version:** 3.6.0 (V2 · Sprint v2-18 — zwei Befunde aus der Nutzung)`

**Patch:** ersetzen durch
`**Version:** 3.7.0 (V2 · Sprint v2-19 — „Realität gewinnt" auch für das Netto)`

## D2 · Changelog-Eintrag

**Anker:** die letzte `> **Changelog v3.6.0…`-Zeile im Changelog-Block

**Patch:** danach einfügen —

```
>
> **Changelog v3.7.0 (13.08.2026, Sprint v2-19):** §8 Netto-Kachel ist **Ablageziel** —
> eine Zahlung darauf zu ziehen macht den Monat mit dem tatsächlich überwiesenen Betrag
> rechnen (`GE-1`); §9 Popup-Unterzeile „die drei Treiber" → **„die größten Treiber"**
> und die Treiber-Liste kann eine Zeile **ohne Karte** enthalten (`GE-2`); §10
> Einkommens-Fenster trägt den Block „Zugeordnete Zahlung" samt **Lösen**; §12-Copy
> entsprechend. Record: `V2/design_direktor_2026-08-13_gehalt.md` (A–G).
```

## D3 · §8 — der Einkommens-Ordner wird Ablageziel

**Anker:** die Zeile
`öffnet das **bestehende** Einkommens-Fenster (§10), kein zweites Formular. Nebeneffekt:`

**Patch:** nach dem Absatz, in dem diese Zeile steht, einfügen —

```
**Seit v2-19 ist die Netto-Kachel ein Ablageziel (`GE-1`).** Zieht man die
Gehaltszahlung aus der Rohmasse darauf, rechnet **dieser Monat** mit dem tatsächlich
überwiesenen Betrag statt mit dem geplanten — dieselbe Regel „Realität gewinnt", die
für Fixkosten und Einnahmen längst gilt (§4.3). Die Hervorhebung beim Drüberziehen ist
**identisch** mit der einer Karte; es ist dieselbe Komponente.

**Die Kachel wird dadurch keine Karte.** Kein Kontextmenü, kein Lebenszyklus, kein
„Betrag anpassen", kein Bezahlt-Status. Der Klick öffnet weiterhin das
Einkommens-Fenster (§10) — dort steht die zugeordnete Zahlung, und dort wird sie auch
wieder gelöst.

**Was die Kachel zeigt, sobald eine Zahlung zugeordnet ist:** oben den überwiesenen
Betrag, darunter `geplant 4.165,11 €` — in derselben Zeile, in der eine gemeinsame
Fixkosten-Karte `von 1.904,00 €` trägt. Die Zeile erscheint **nur bei Abweichung**;
wurde exakt der Planbetrag überwiesen, stünde dort sonst zweimal dieselbe Zahl.
Statuszeile: `Zugeordnet` statt `Monatlich`.

**Die Zahlung verschwindet nicht aus der Rohmasse**, sondern verhält sich wie eine, die
auf einer Karte liegt: sichtbar, nach hinten sortiert, nicht mehr ziehbar.

**Mehrere Zahlungen in einem Monat summieren sich** (Nachzahlung, 13. Gehalt) — dieselbe
Mechanik wie bei Karten, keine Sonderregel.
```

## D4 · §9 — Treiber, die keine Karte sind

**Anker:** `- **Monatsklick → Top-3-Treiber** dieses Monats.`

**Patch:** die Zeile und die folgende Unterzeilen-Zeile ersetzen durch —

```
- **Monatsklick → die größten Treiber** dieses Monats: die **drei größten
  Karten-Treiber**, plus — seit v2-19 — eine Zeile **`Gehalt`**, sobald das tatsächlich
  überwiesene Netto vom geplanten abweicht.
- **Unterzeile/Legende:** „IST (teal), Plan (grau), Vorjahr (gold) · Klick auf einen
  Monat zeigt die größten Treiber".
```

**Patch (Ergänzung):** danach einfügen —

```
**Die Gehalts-Zeile (`GE-2`, Record Entscheidung B/C).** Sie ist die erste Treiber-Zeile,
hinter der **keine Karte** steht, und deshalb **nicht anklickbar** — kein
Cursor-Wechsel, kein Hover, kein Zielsprung. Sie trägt ihre Zahl und sonst nichts.

Sie **verdrängt keinen Karten-Treiber**: Die drei größten Karten werden zuerst bestimmt,
danach kommt das Gehalt hinzu — an seiner Rangposition nach Betrag. Im Juli 2026 steht
es mit −15,57 € hinten; bei einer Nachzahlung stünde es vorn. Deshalb können es
zeitweise **vier** Zeilen sein, und deshalb nennt die Unterzeile keine Zahl mehr.

**Ohne diese Zeile bräche die B2-Invariante** `Σ delta = Ist-Sparrate − Plan-Sparrate`:
Die Sparrate bewegte sich, und die Treiber erklärten die Bewegung nicht.
```

## D5 · §10 — die zugeordnete Zahlung im Einkommens-Fenster

**Anker:** `**Sonderfall Partner unbekannt (kein Eintrag):** Split = 100 % / 0 %. ICH trägt alles allein. PARTNER-Label kann durch Klick befüllt werden.`

**Patch:** danach einfügen —

```
### Zugeordnete Gehaltszahlung (v2-19, `GE-1`)

Liegt für den angezeigten Monat eine zugeordnete Zahlung vor, trägt das Fenster
zwischen Netto-Feld und Vererbungs-Hinweis den Block **„Zugeordnete Zahlung"**:
Buchungstag, Betrag, und daneben **`Lösen`**.

**Warum hier und nirgends sonst:** Die Netto-Kachel bekommt bewusst kein
Kontextmenü — über ein solches löst man die Verknüpfung bei Karten. Der Klick auf die
Kachel öffnet ohnehin dieses Fenster, also gibt es genau **einen** Ort für alles, was
das Netto betrifft, statt zwei.

**Der Block steht unter dem Netto-Feld**, weil er genau dieses Feld für **diesen einen
Monat** außer Kraft setzt: Solange die Zahlung liegt, rechnet der Monat mit ihr statt
mit dem Plan darüber. Nach dem Lösen gilt wieder der Plan, und die Zahlung kehrt in die
Rohmasse zurück.

**Nur für `ICH`.** Das Partner-Netto ist nicht ablegbar.

**Der Block ist neutral getönt, ohne farbige Kante** — anders als der
Vererbungs-Hinweis darunter. Türkis heißt „erledigt/positiv" (§3); eine zugeordnete
Zahlung ist weder gut noch schlecht, sondern ein Fakt.
```

## D6 · §12 — UI-Copy

**Anker:** `| Popup — Unterzeile | \`IST (teal), Plan (grau), Vorjahr (gold) · Klick auf einen Monat zeigt die drei Treiber\` |`

**Patch:** diese Zeile und die folgende (`| Popup — Monatsklick | drei Positionen …`)
ersetzen durch —

```
| Popup — Unterzeile | `IST (teal), Plan (grau), Vorjahr (gold) · Klick auf einen Monat zeigt die größten Treiber` |
| Popup — Monatsklick | bis zu vier Positionen: drei Karten-Treiber + `Gehalt`, falls das Netto abweicht |
| Popup — Treiber-Zeile Gehalt | `Gehalt −15,57 €` — nicht anklickbar |
```

**Anker:** `| Netto-Kachel — Statuszeile | \`Monatlich\` · im Zukunftsmonat \`Forecast\` |`

**Patch:** ersetzen durch —

```
| Netto-Kachel — Statuszeile | `Monatlich` · `Zugeordnet` bei zugeordneter Zahlung · im Zukunftsmonat `Forecast` |
| Netto-Kachel — Planzeile | `geplant 4.165,11 €` — nur bei Abweichung; „geplant" statt „von", weil „von" den Haushaltsanteil meint |
| Einkommens-Fenster — Zuordnungsblock | Überschrift `Zugeordnete Zahlung` · Knopf `Lösen` / `Wird gelöst …` |
| Einkommens-Fenster — Zuordnungshinweis | `Dieser Monat rechnet mit dem überwiesenen Betrag. Nach dem Lösen gilt wieder der Plan.` |
```

---

# Schema-Doku

## S1 · Header-Version

**Anker:** `**Version:** 3.5.0`
**Patch:** ersetzen durch `**Version:** 3.6.0`

## S2 · §1 — die neue Tabelle

**Anker:** `- \`card_fragment_links\` hat den \`UNIQUE(fragment_id)\`-Constraint → ein Fragment kann maximal einer Karte zugewiesen sein → keine Doppelverbuchung möglich`

**Patch:** danach einfügen —

```
- `income_fragment_links` (v2-19) bildet dasselbe für das **Netto** ab: `UNIQUE(fragment_id)`,
  `month` auf den Monatsersten festgenagelt, RLS-Policy `income_fragment_links_owner`.
  **Sie speichert den Link, nicht den Betrag** — die Summe entsteht aus `fragments.amount`,
  dadurch können Betrag und Zuordnung nicht auseinanderlaufen, und „mehrere Zahlungen in
  einem Monat summieren sich" ergibt sich von selbst.
- **Ein Fragment hängt entweder an einer Karte ODER am Netto, nie an beidem.** Zwei
  Trigger erzwingen das gegenseitig (`trg_ifl_drop_card_link`, `trg_cfl_drop_income_link`);
  ein neuer Link löscht den jeweils anderen. Bewusst als Trigger und nicht im Schreibpfad,
  damit auch `process_csv_import` (Auto-Absorption), `create_card_from_fragment` und der
  direkte UPSERT aus dem Frontend abgedeckt sind. Ohne diesen Schutz zählte dasselbe
  Fragment zweimal in die Sparrate.
- `income_fragment_links` trägt denselben Transfer-Wächter wie `card_fragment_links` —
  dieselbe Trigger-Funktion `enforce_no_transfer_fragment_links()`, unverändert
  wiederverwendet.
```

## S3 · §4 — Hot-Path-Funktionen nachziehen

**Anker:** die Zeile
`| \`calculate_sparrate_for_month(user_id, month)\` | Ring-Zentrum-Wert (Ist) | \`numeric\` (NULL falls Onboarding offen) — **seit v2-13 ohne eigene Split-Anwendung**: der Anteil steckt bereits im Rückgabewert von \`calculate_card_amount_for_month\` |`

**Patch:** ersetzen durch —

```
| `calculate_sparrate_for_month(user_id, month)` | Ring-Zentrum-Wert (Ist) | `numeric` (NULL falls Onboarding offen) — **seit v2-13 ohne eigene Split-Anwendung**: der Anteil steckt bereits im Rückgabewert von `calculate_card_amount_for_month`. **Seit v2-19 (`GE-1`) bevorzugt sie das tatsächlich überwiesene Netto**: `COALESCE(get_actual_net_for_month(…), get_net_monthly_for_month(…))`. Der NULL-Fall wird **vorher** abgefangen, damit „Onboarding offen" weiterhin NULL liefert. ⚠️ Der Eingriff sitzt **hier** und NICHT in `get_net_monthly_for_month` — jene liest auch die Plan-Funktion; beide Seiten der Differenz verschöben sich gleich weit und die Abweichung wäre unsichtbarer als vorher (LL-23) |
```

**Anker:** die Zeile mit `| \`calculate_planned_sparrate_for_month(user_id, month)\` | Plan-Sparrate (ohne Realität) | \`numeric\` |`

**Patch:** ersetzen durch —

```
| `calculate_planned_sparrate_for_month(user_id, month)` | Plan-Sparrate (ohne Realität) | `numeric` — liest **weiterhin ausschließlich** `income_timeline`. In v2-19 nachweislich unberührt geblieben: Prüfsumme `md5(pg_get_functiondef(...))` vor und nach der Migration identisch (`e80bf401…`) |
```

## S4 · §4 — die neuen Funktionen

**Anker:** die Überschrift `### Im Hot-Path (bei jedem Render)` — der zugehörige
Tabellenblock endet vor der nächsten `###`-Überschrift.

**Patch:** unmittelbar vor der nächsten `###`-Überschrift einfügen —

```
### Netto-Zuordnung (v2-19, `GE-1`)

| Funktion | Wofür | Returns |
|---|---|---|
| `get_actual_net_for_month(user_id, person, month)` | Summe der dem Netto zugeordneten Zahlungen | `numeric` — **NULL, wenn nichts zugeordnet ist**; genau das ist das Signal für „nimm den Plan". Kein `round()`: Die Aufrufer runden am Ende über alles (LL-24) |
| `link_fragment_to_income(fragment_id, month)` | Zahlung dem Netto zuordnen (UPSERT auf `fragment_id`) | `jsonb {fragment_id, month, actual_net}` · wirft `28000` ohne Session, `42501` bei fremdem Fragment, `23514` bei Transfer, **`22023` bei nicht-positivem Betrag** |
| `unlink_fragment_from_income(fragment_id)` | Zuordnung lösen — danach gilt wieder der Plan | `jsonb {fragment_id, month, actual_net}` · wirft `28000`, `42501` |

**Warum eine RPC und kein UPSERT wie bei `linkFragmentToCard`:** Das Vorzeichen muss
geprüft werden. Ohne diese Prüfung ließe sich eine Ausgabe auf die Netto-Kachel ziehen
und das Monats-Netto fiele auf einen negativen Betrag.
```

## S5 · §4 — `get_category_amounts_for_month` und die Treiber

**Anker:** die Tabellenzeile, die `get_category_amounts_for_month` beschreibt

**Patch:** am Ende der Bemerkungs-Spalte anfügen —

```
 **Seit v2-19** benutzt sie denselben Ist-Netto-Wert wie `calculate_sparrate_for_month`; liefe hier der Plan und dort die Wirklichkeit, bräche Prüfanker 1 sofort. Neu im JSON: `planned` — der Planwert des Monats, nur beim `INCOME`-Eintrag gesetzt, sonst `null`.
```

**Anker:** die Tabellenzeile, die `get_year_deviation_drivers` beschreibt

**Patch:** am Ende der Bemerkungs-Spalte anfügen —

```
 **Seit v2-19 kann ein Treiber `card_id: null` tragen** — die Zeile `Gehalt` (`card_type` und `attribution` ebenfalls `null`). `p_limit` begrenzt die **Karten**-Treiber; die Gehalts-Zeile wird **danach** angehängt und deshalb nie abgeschnitten. Aufrufer müssen `card_id: null` vertragen.
```

## S6 · §5 — Interaktions-Mapping

**Anker:** `| **Fragment auf Karte droppen** | INSERT \`card_fragment_links\` mit \`origin='MANUAL_DROP'\` |`

**Patch:** danach einfügen —

```
| **Fragment auf Netto-Kachel droppen** (v2-19) | `link_fragment_to_income(fragment_id, angezeigter Monat)` — löscht einen etwaigen Karten-Link per Trigger |
| **Netto-Zuordnung lösen** (v2-19) | `unlink_fragment_from_income(fragment_id)` aus dem Einkommens-Fenster (§10) |
```

---

## Anwendung

Alle Anker wurden vor dem Schreiben dieser Datei per Suche auf **Eindeutigkeit**
geprüft. Nach der Anwendung: Versions-Bump in beiden Headern kontrollieren — er ist
eine **eigene** Patch-Stelle (D1/S1), keine Nebensache.
