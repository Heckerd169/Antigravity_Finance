# Sprint v2-13 — Doku-Patches (`BF-4`)

**Verfahren:** LL-16 / §7 Regel 14 — Anker + Patch-Satz je Stelle, keine direkte
Bearbeitung der Bibeln. Anker vor der Anwendung einzeln auf Eindeutigkeit geprüft.

**Grundlage:** Entscheidung `E1`
(`V2/befunde_2026-08-04_fehler_und_entscheidungen.md` §7) · Gestaltungsrunde
(`V2/design_direktor_gemeinsame_karte.md`) · Konzept
(`sprints/sprint_v2-13_konzept.md`) · Migration
`supabase/migrations/20260805_v2_13_bf4_gemeinsame_karten.sql`.

> **Die inhaltlich schwerste Stelle ist P1 (§4.5).** Dort wird eine
> Produkt-Entscheidung **umgekehrt**, nicht ein Fehler korrigiert. E1 verlangt
> ausdrücklich, das als geänderte Entscheidung kenntlich zu machen und nicht
> stillschweigend zu ersetzen — der alte Satz bleibt deshalb sichtbar stehen und
> wird als aufgegeben markiert.

---

## Design-Dokument (`antigravity_finance_design_dokument.md`)

### P1 · §4.5 Split-Anwendung — die Umkehr

**Anker** (Zeilen 346–356, beginnend mit „**Anwendungs-Modell:**"):

```
**Anwendungs-Modell:** Der Split wirkt auf den Anzeige-Betrag einer Karte **nach** der Auflösung der Berechnungstabelle. Das gilt unabhängig davon, ob der Anzeige-Betrag aus Plan, Anpassung oder Realität (Fragment-Summe) stammt.
```
… bis einschließlich …
```
Der Split rechnet immer fair, unabhängig davon wer real überwiesen hat. Wer überweist, ist eine Konto-Frage — nicht eine Fairness-Frage.
```

**Patch-Satz** — ersetzt den gesamten Block:

```markdown
**Anwendungs-Modell (seit `BF-4`, 05.08.2026):** Der Split wird **genau einmal**
angewandt — an der Stelle, an der ein Betrag den Haushalt verlässt und zur eigenen
Zahl wird. Das ist **nicht** mehr pauschal „nach der Berechnungstabelle", sondern
hängt an der **Herkunft** des Betrags:

| Herkunft des Karten-Betrags | Split anwenden? | Begründung |
|---|---|---|
| **Plan** oder **Anpassung** | **ja** | das ist die Haushaltsrechnung |
| **Realität** (Fragment-Summe) | **nein** | die Überweisung *ist* bereits der eigene Anteil |

Entschieden wird das in `calculate_card_amount_for_month` — der einzigen Stelle, die
die Herkunft überhaupt kennt. Alle Aufrufer erhalten dadurch bereits die eigene Zahl
und dürfen den Anteil **nicht erneut** anwenden.

**Konkretes Beispiel:** Miete 1.904 € (gemeinsam, Split 57,21 % zu meinen Lasten).

- Dauerauftrag überweist **1.089,26 €** — den rechnerischen Anteil
- Fragment −1.089,26 € → an die Mietkarte gehängt
- Anzeige-Betrag der Karte = **1.089,26 €** (Realität, bereits Anteil)
- Mein Anteil in der Sparrate = **1.089,26 €** — **kein zweiter Abzug**
- Auf der Karte darunter: `von 1.904,00 €` (§7)

Ohne zugeordnetes Fragment zeigt dieselbe Karte `1.904,00 € × 57,21 % = 1.089,26 €`
aus dem Plan — dieselbe Zahl auf dem anderen Weg.

> ### ⚠️ Geänderte Produkt-Entscheidung, kein Bugfix
>
> Bis zum 05.08.2026 stand hier wörtlich:
>
> > *„Der Split rechnet immer fair, unabhängig davon wer real überwiesen hat. Wer
> > überweist, ist eine Konto-Frage — nicht eine Fairness-Frage."*
>
> Diese Position ist mit `E1` **bewusst aufgegeben** worden. Anlass war die Messung
> vom 05.08.2026: bei **allen vier** gemeinsamen Karten entspricht der tatsächlich
> überwiesene Betrag dem rechnerischen Anteil **auf den Cent**, in Mai, Juni und
> Juli. Die Daueraufträge stehen bereits auf dem Fairness-Anteil; die App gegen
> diese Realität rechnen zu lassen hätte bedeutet, das Zahlungsverhalten an die
> Software anzupassen statt umgekehrt.
>
> **Fairness bleibt automatisch:** Ändert sich das Gehaltsverhältnis, wandert der
> Anteil mit — die Karte zeigt dann unmittelbar, auf welchen Betrag der
> Dauerauftrag zu stellen ist.
>
> **Bewusst in Kauf genommener Haken:** Wird ausnahmsweise doch der volle Betrag
> überwiesen und der Partner erstattet zurück, zählt die App die Erstattung als
> eigene Einnahme. Unterm Strich richtig, im einzelnen Monat aber anders als die
> reine Fairness-Sicht. Eine Markierung „anteilig / voll" je Karte wurde geprüft
> und verworfen (neue Spalte, neue Geste, kein realer Anwendungsfall).
>
> Beleg: `V2/befunde_2026-08-04_fehler_und_entscheidungen.md` §5 + §7.
```

*(Der Satz „**Edge-Case Partner unbekannt:** Split-Faktor = 1.0 …" bleibt unverändert
darunter stehen.)*

---

### P2 · §4.6 Rechenbeispiel — Miete-Zeile

**Warum:** Das Beispiel demonstriert heute genau die aufgegebene Regel („Realität
1.200 € × Split 60 %"). Bliebe es stehen, widerspräche es dem frisch gepatchten §4.5
zwei Absätze weiter unten.

**Anker 1** (Karten-Liste):

```
- Miete 1.200 € (Fixkosten, GEMEINSAM, monatlich) — Fragment +1.200 € verknüpft
```

**Patch-Satz 1:**

```markdown
- Miete 1.200 € (Fixkosten, GEMEINSAM, monatlich) — Dauerauftrag überweist den Anteil, Fragment −720 € verknüpft
```

**Anker 2** (Berechnungsblock):

```
  Miete (Realität 1.200 € × Split 60%)     =   720,00 €
```

**Patch-Satz 2:**

```markdown
  Miete (Realität 720 €, ist schon Anteil) =   720,00 €
```

> **Das Ergebnis bleibt 2.910,01 €.** Die Zahl ändert sich nicht, nur ihre
> Begründung — das ist der didaktisch wertvolle Teil: dieselbe Sparrate, weil der
> Dauerauftrag bereits auf dem Anteil steht.

---

### P3 · §7 Gemeinsame Basis — die neue Kartenzeile

**Anker** (Ende des Abschnitts „**Attribution (Meta-Zeile):**"):

```
**Attribution (Meta-Zeile):**
- Dot ICH: `rgba(255,255,255,.22)`
- Dot GEMEINSAM: `rgba(100,168,240,.38)`
- Meta-Text: `rgba(255,255,255,.20)`
```

**Patch-Satz** — direkt **danach** einfügen:

```markdown
**Haushaltsbetrag-Zeile (seit `BF-4`, 05.08.2026):**

Eine gemeinsame Karte zeigt als große Zahl den **eigenen Anteil** (§4.5) und darunter
den vollen Betrag des Haushalts.

| Eigenschaft | Wert |
|---|---|
| Reihenfolge auf der Karte | Name → Betrag → **`von X €`** → Status → Attribution |
| Wortlaut | `von [N] €` — **kein** Label, kein neues Substantiv (§12.3) |
| Schriftgröße | `10px`, Weight `400`, `tabular-nums`, `white-space: nowrap` |
| Farbe | `--text-muted` (`rgba(255,255,255,.45)`) in **allen** Zuständen |
| Abstand nach oben | `2px` zum Betrag — eng gebunden |
| Abstand nach unten | `5px` zum Status — abgesetzt |
| Zeilenhöhe | `min-height: 12px`, auf **jeder** Karte permanent reserviert |

**Die Zuordnung entsteht durch Nähe, nicht durch ein Label.** Der Qualifizierer steht
unmittelbar unter der Zahl, die er qualifiziert; die Gruppierung macht der Weißraum.

**Die Höhe schaltet nie, nur der Inhalt.** Auf ICH-Karten bleibt die Zeile leer, die
Höhe bleibt reserviert — alle Karten behalten dieselben Maße. Das ist kein neues
Muster: §6 (M3) schreibt es für die Ausreißer-Subzeile im Header bereits so fest.

**Leer bleibt die Zeile in drei Fällen:**
1. ICH-Karte — es gibt keinen Haushaltsanteil
2. Split-Faktor `1,0` (kein Partner-Einkommen) — Anteil und Haushalt wären identisch,
   die Zeile erklärte nichts *(Entscheid 05.08.2026; in der Gestaltungsrunde
   ausdrücklich offen gelassen)*
3. Effektiver Plan `0` — `von 0,00 €` wäre eine Falschaussage

Im Ghost-Zustand dimmt die Karten-Opacity (`0.65`) die Zeile mit; ein eigener
Ghost-Ton ist **nicht** vorgesehen. `--text-ghost` (`.22`) und der Meta-Ton (`.20`)
wären genau die Unsichtbarkeit, die schon gegen die Alternativvariante sprach.

**Budget-Karten tragen die Zeile nie mit Inhalt** — eine GEMEINSAM-Attribution ist
per Constraint `budget_never_shared` ausgeschlossen. Die Zeile wird dort trotzdem
gerendert, damit die Maße gleich bleiben.

Beleg der Gestaltung: `V2/design_direktor_gemeinsame_karte.md`.
```

---

### P4 · §12.3 Karten — Copy-Zeile

**Anker:**

```
| Attribution ICH | `Ich` |
| Attribution GEMEINSAM | `Gemeinsam` |
```

**Patch-Satz** — ersetzt den Anker:

```markdown
| Attribution ICH | `Ich` |
| Attribution GEMEINSAM | `Gemeinsam` |
| Gemeinsame Karte — Haushaltsbetrag | `von [N] €` *(leer bei ICH, Split-Faktor 1,0 oder Plan 0)* |
```

---

### P5 · Header — Version + Changelog

**Anker:**

```
**Version:** 3.1.9 (V2 · v2-12 Doku-Nachzug)
```

**Patch-Satz:**

```markdown
**Version:** 3.2.0 (V2 · v2-13 `BF-4` — Split-Semantik umgekehrt)
```

**Anker** (letzte Changelog-Zeile im Kopf-Block, beginnend mit
`> **Changelog v3.1.9`) — **danach** einfügen:

```markdown
> **Changelog v3.2.0 (05.08.2026, Sprint v2-13 · `BF-4`):** §4.5 **Split-Semantik umgekehrt** — der Anteil wird genau **einmal** angewandt, abhängig von der Herkunft des Betrags: auf Plan/Anpassung **ja**, auf Fragment-Summen **nein** (die Überweisung ist bereits der Anteil). Die bis dahin gültige Position *„Wer überweist, ist eine Konto-Frage"* ist mit `E1` **bewusst aufgegeben** und im Abschnitt als geänderte Produkt-Entscheidung kenntlich gemacht — kein Bugfix. §4.6 Rechenbeispiel entsprechend nachgezogen (Ergebnis unverändert 2.910,01 €). §7 neue Haushaltsbetrag-Zeile `von [N] €` auf gemeinsamen Karten (Ort, Wortlaut, Ton, reservierte Höhe); §12.3 Copy-Zeile ergänzt. **Minor-Bump statt Patch-Bump**, weil eine Produkt-Entscheidung gedreht wurde und nicht nur eine Beschreibung nachgezogen.
```

> **Warum `3.2.0` und nicht `3.1.10`:** Alle bisherigen `3.1.x`-Bumps waren
> Nachzüge — sie beschrieben, was gebaut wurde. Hier kehrt sich eine
> **Produkt-Entscheidung** um. Ein Patch-Bump würde diese Stelle in der
> Versions-Historie unsichtbar machen, und genau davor warnt `E1`.

---

## Schema-Dokument (`antigravity_finance_schema_summary.md`)

### P6 · §3 Wahrheitsquellen — Anzeige-Betrag

**Anker:**

```
| **Anzeige-Betrag** | `calculate_card_amount_for_month` | §4.3-Prioritätskette Realität → Anpassung → Plan | Was auf der Karte steht |
```

**Patch-Satz:**

```markdown
| **Anzeige-Betrag** | `calculate_card_amount_for_month` | §4.3-Prioritätskette Realität → Anpassung → Plan, **seit v2-13 inkl. Split-Anteil auf Plan/Anpassung** | Was auf der Karte steht — bei GEMEINSAM der **eigene Anteil** |
```

---

### P7 · §4 Hot-Path-Tabelle — zwei Zeilen

**Anker 1:**

```
| `calculate_sparrate_for_month(user_id, month)` | Ring-Zentrum-Wert (Ist) | `numeric` (NULL falls Onboarding offen) |
```

**Patch-Satz 1:**

```markdown
| `calculate_sparrate_for_month(user_id, month)` | Ring-Zentrum-Wert (Ist) | `numeric` (NULL falls Onboarding offen) — **seit v2-13 ohne eigene Split-Anwendung**: der Anteil steckt bereits im Rückgabewert von `calculate_card_amount_for_month` |
```

**Anker 2:**

```
| `calculate_card_amount_for_month(card_id, month)` | Wert auf Karte (Realität → Anpassung → Plan) | `numeric` — **seit v2-11 auch negativ möglich** (BF-5/E2: übersteigen die Gutschriften die Ausgaben, ist der Netto-Verbrauch negativ; keine Kappung bei 0) |
```

**Patch-Satz 2:**

```markdown
| `calculate_card_amount_for_month(card_id, month)` | Wert auf Karte (Realität → Anpassung → Plan) | `numeric` — **seit v2-11 auch negativ möglich** (BF-5/E2: übersteigen die Gutschriften die Ausgaben, ist der Netto-Verbrauch negativ; keine Kappung bei 0). **Seit v2-13 (BF-4) trägt sie die Split-Logik**: bei `attribution = 'GEMEINSAM'` wird `get_split_factor(cards.user_id, month)` auf **Plan/Anpassung** angewandt, **nicht** auf Fragment-Summen — die sind bereits der überwiesene Anteil. Der Rückgabewert ist damit stets die **eigene** Zahl; Aufrufer dürfen den Anteil nicht erneut anwenden |
```

> **Warum das die wichtigste Zeile des Patches ist.** Sie ist die Stelle, an der ein
> künftiger Sprint nachschlägt, bevor er einen Aufrufer baut. Stünde sie nicht da,
> entstünde derselbe doppelte Abzug erneut — nur an einer neuen Stelle.

---

### P8 · §4 Treiber-Heuristik — die Formel

**Anker:**

```
delta := round( vorzeichen × anteil × ( calculate_card_amount_for_month(karte, M)
                                      − get_effective_plan_for_month(karte, M) ), 2)
         vorzeichen = +1 für INCOME, −1 für FIXED_COST/BUDGET
         anteil     = get_split_factor(M) bei GEMEINSAM, sonst 1
```

**Patch-Satz:**

```markdown
delta := round( vorzeichen × ( calculate_card_amount_for_month(karte, M)
                             − get_effective_plan_for_month(karte, M) × anteil ), 2)
         vorzeichen = +1 für INCOME, −1 für FIXED_COST/BUDGET
         anteil     = get_split_factor(M) bei GEMEINSAM, sonst 1
```

**Anker 2** (Absatz direkt darunter):

```
- `delta` ist damit die **Wirkung auf die Sparrate**: negativ = der Monat ist um diesen Betrag schlechter als geplant. `ist`/`plan` bleiben die **rohen** Kartenwerte (wie auf der Karte sichtbar), `share` weist den angewandten Anteil aus.
```

**Patch-Satz 2:**

```markdown
- `delta` ist damit die **Wirkung auf die Sparrate**: negativ = der Monat ist um diesen Betrag schlechter als geplant. `ist`/`plan` bleiben die Kartenwerte **so, wie sie auf der Karte stehen** — `ist` ist die große Zahl (seit v2-13 bei GEMEINSAM der **eigene Anteil**), `plan` die Zeile `von X €` darunter (der **Haushaltsbetrag**); `share` weist den angewandten Anteil aus.
- **`anteil` steht seit v2-13 INNEN am Plan-Teil, nicht mehr außen vor der Klammer.** Weil `ist` bereits anteilig ist und `plan` nicht, ist die Klammer **gemischt** — ein Faktor außen würde den Ist-Teil ein zweites Mal kürzen. Wird das übersehen, laufen Welle-Tooltip und Ring auseinander, **ohne dass eine Zahl offensichtlich falsch aussieht**. Wächter ist die Invariante unten; sie ist genau dafür da.
```

---

### P9 · Header — Version + Changelog

**Anker:**

```
**Version:** 3.4.2
```

**Patch-Satz:**

```markdown
**Version:** 3.4.3
```

**Anker 2** (Changelog-Zeile v3.4.2) — **davor** einfügen:

```markdown
> **Changelog v3.4.3 (05.08.2026, Sprint v2-13 · `BF-4`):** §4 — die **Split-Logik wandert in `calculate_card_amount_for_month`**. Sie wird dort auf Plan/Anpassung angewandt, **nicht** auf Fragment-Summen (Beschluss `E1`: eine zugeordnete Zahlung *ist* bereits der eigene Anteil). `calculate_sparrate_for_month` wendet den Anteil dadurch **nicht mehr selbst** an — die doppelte Anwendung war der Fehler `BF-4` (Miete: 623,17 € statt 1.089,26 €, rund 466 €/Monat zu gut). `calculate_planned_sparrate_for_month` bleibt **unverändert** (rechnet auf dem Roh-Plan). `get_year_deviation_drivers`: `delta = vorzeichen × (ist − plan × anteil)` — der Anteil steht jetzt **innen** am Plan-Teil, weil die Klammer gemischt ist. Alle vier Funktionen in **einer** Migration `supabase/migrations/20260805_v2_13_bf4_gemeinsame_karten.sql`, weil ein Zwischenzustand doppelt anteilig gerechnet hätte. §3 Wahrheitsquellen nachgezogen.
```

---

## Nicht Teil dieses Patches

| Was | Warum |
|---|---|
| `CLAUDE.md` | Änderungen dort brauchen **eigene User-Freigabe** (§7 Regel 14). Vorschläge stehen im Review §7. |
| Design-Doku §10 (Income/Partner-Split) | beschreibt die Ermittlung des Faktors, nicht seine Anwendung — unberührt |
| Design-Doku §13 (Bekannte Limitationen) | der „Haken" aus E1 ist in §4.5 als Teil der Entscheidung dokumentiert, nicht als Limitation |
| `design-system/komponenten/karten.html` | **kein** Patch-Verfahren — die Seite ist Anschauungsmaterial und wird direkt gepflegt (Ablauf: `design-system/SYNC.md`). In diesem Sprint bereits nachgezogen. |

---

*Doku-Patches Sprint v2-13 · Antigravity Finance · 05. August 2026*
