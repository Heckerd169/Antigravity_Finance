# Sprint v2-13 — `BF-4`: technisches Konzept

**Stand:** 05. August 2026 · **Grundlage:** Entscheidung **E1** (Beschluss-Record in
`V2/befunde_2026-08-04_fehler_und_entscheidungen.md` §7) und die Gestaltungsrunde
(`V2/design_direktor_gemeinsame_karte.md`).

> **Warum dieses Papier existiert.** Der Eingriff berührt **vier** Rechenfunktionen,
> von denen **drei** den Split heute selbst anwenden. Wer nur eine davon ändert,
> erzeugt genau die Fehlerklasse, die `BF-4` beheben soll — lautlos und mit
> Geldwirkung. Die Abstimmung ist der eigentliche Inhalt dieses Sprints, nicht die
> einzelne Zeile.

---

## 1 · Was E1 verlangt

Eine gemeinsame Karte **plant** im Haushaltsbetrag, **zeigt** den eigenen Anteil, und
eine zugeordnete echte Zahlung wird **unverändert übernommen** — ohne zweiten Abzug.

Daraus folgt eine einzige Leitregel:

> **Ein Betrag wird genau einmal anteilig gemacht — an der Stelle, an der er den
> Haushalt verlässt und zur eigenen Zahl wird.**

Fragment-Summen haben diesen Schritt bereits hinter sich (sie sind der real
überwiesene Anteil). Plan-Werte nicht (sie sind die Haushaltsrechnung).

---

## 2 · Der Ist-Zustand — wer wendet den Anteil heute an

| Funktion | Quelle des Betrags | Anteil heute |
|---|---|---|
| `calculate_card_amount_for_month` | Fragmente **oder** Plan/Adjustment | **nie** |
| `calculate_sparrate_for_month` | Kartenfunktion | **immer** bei `GEMEINSAM` |
| `calculate_planned_sparrate_for_month` | `get_planned_amount_for_month` (Roh-Plan) | **immer** bei `GEMEINSAM` |
| `get_year_deviation_drivers` | `ist` = Kartenfunktion · `plan` = `get_effective_plan_for_month` | `share` auf die **Differenz** |

**Der Fehler:** `calculate_sparrate_for_month` multipliziert alles, was die
Kartenfunktion liefert — auch eine Fragment-Summe, die den Anteil schon enthält.
Bei der Miete: 1.089,26 € × 0,5721 = **623,17 €** statt 1.089,26 €. Rund **466 €
pro Monat zu gut**, lautlos.

---

## 3 · Der Soll-Zustand

| Funktion | rechnet mit | Anteil anwenden? | Änderung |
|---|---|---|---|
| `calculate_card_amount_for_month` | **Fragmenten** (schon Anteil) | **nein** | — |
| " | **Plan/Adjustment** (Haushalt) | **ja** | **NEU** |
| `calculate_sparrate_for_month` | Kartenfunktion (dann schon Anteil) | **nein** | **Multiplikation entfällt** |
| `calculate_planned_sparrate_for_month` | Roh-Plan (Haushalt) | **ja** | **unverändert** |
| `get_year_deviation_drivers` | `ist` = Anteil · `plan` = Haushalt | **nur auf den Plan-Teil** | **umbauen** |

### Warum `calculate_card_amount_for_month` der richtige Ort ist

Sie ist die **einzige** Stelle, die weiß, ob der Betrag aus Fragmenten oder aus dem
Plan stammt. Nur dort lässt sich „einmal anteilig machen" korrekt entscheiden. Ein
Aufrufer weiter oben sieht nur noch eine Zahl und kann die Herkunft nicht mehr
unterscheiden — genau daran scheitert die heutige Fassung.

**Nebenwirkung, die ausdrücklich gewollt ist:** Die Karte im Frontend liest denselben
Wert und zeigt damit automatisch den eigenen Anteil — genau das, was E1 verlangt.
Es braucht dafür **keine** Frontend-Rechnung (§7 Regel 1 bleibt gewahrt).

### Die Falle bei `get_year_deviation_drivers`

Die Treiber rechnen heute:

```
delta = vorzeichen × anteil × ( ist − plan )
```

Wird `ist` vorab anteilig, `plan` aber nicht, ist die Klammer gemischt und `anteil`
darf nicht mehr außen stehen. Neu:

```
delta = vorzeichen × ( ist_bereits_anteilig − plan × anteil )
```

**Das ist der gefährlichste Punkt des Sprints.** Wird er übersehen, laufen
Welle-Tooltip und Ring auseinander, ohne dass eine Zahl offensichtlich falsch
aussieht. Die **B2-Invariante** ist der Wächter dafür:

> `Σ delta(alle aktiven Karten, M) = calculate_sparrate_for_month(M) − calculate_planned_sparrate_for_month(M)`

Sie muss nach dem Eingriff in **allen zwölf Monaten** halten.

---

## 4 · Prüfanker — vorab festgelegt

**Heute bewegt sich nichts.** Keine gemeinsame Karte hat ein verknüpftes Fragment
(über alle Monate geprüft, 05.08.2026). Der Eingriff ist damit **anker-neutral**:

| Monat 2026 | Ist | Plan | Erwartung nach der Migration |
|---|---:|---:|---|
| Januar–April | 1.931,18 € | 1.931,18 € | **unverändert** |
| Mai | −86,77 € | −86,77 € | **unverändert** |
| Juni | 4.208,76 € | 4.220,53 € | **unverändert** |
| Juli | −322,75 € | 55,44 € | **unverändert** |
| August | 1.761,08 € | 1.761,08 € | **unverändert** |
| September–Dezember | 1.824,08 € | 1.824,08 € | **unverändert** |

> **Das ist die angenehme Lage dieses Sprints und zugleich seine Tücke.** Weil sich
> auf Produktion nichts bewegen darf, sagt ein grüner Anker **nichts** über die
> Richtigkeit der neuen Logik aus — er sagt nur, dass nichts kaputtging. Der Beweis
> muss aus der Übungs-Datenbank kommen, mit **künstlich verlinkten Fragmenten** auf
> einer gemeinsamen Karte.

---

## 5 · Testreihe für die Übungs-Datenbank

Die Übungs-DB hat heute **keine** gemeinsame Karte — sie muss in der Probe angelegt
werden (`create_card_direct(..., 'GEMEINSAM', ...)`) und ein Partner-Einkommen dazu,
damit der Split-Faktor ≠ 1 wird.

**Wie in v2-11: die Reihe ZWEIMAL fahren**, einmal gegen die unveränderte Funktion.
Ohne Vorher-Werte ist nicht belegbar, dass sich nur das Gewollte bewegt.

| # | Fall | Erwartung nachher |
|---|---|---|
| T1 | Anker Übungs-DB vor allem | 2.200,00 € |
| T2 | ICH-Karte, nur Plan | unverändert (Regression) |
| T3 | ICH-Karte mit Fragmenten | unverändert (Regression) |
| T4 | **GEMEINSAM, nur Plan** | Karte zeigt **Plan × Faktor** |
| T5 | **GEMEINSAM mit Fragment = Anteil** | Karte zeigt **Fragment unverändert** |
| T6 | Sparrate mit T5-Karte | **kein zweiter Abzug** |
| T7 | Plan-Sparrate mit T4-Karte | Anteil **weiterhin** angewandt |
| T8 | **B2-Invariante** über alle 12 Monate | `Σ delta = Ist − Plan` |
| T9 | Split-Faktor 1,0 (kein Partner) | Karte = Plan, keine Änderung |
| T10 | Anker nach allen Tests | 2.200,00 € |

**T8 ist der Kern.** T6 allein beweist nur die halbe Sache.

---

## 6 · Frontend

`card.tsx` zeigt bereits `card.amount` aus der RPC — nach der Migration ist das der
Anteil. **Keine Rechenänderung nötig.**

Neu ist allein die Zeile aus der Gestaltungsrunde:

- Ort: **direkt unter dem Betrag, über dem Status**
- Wortlaut: **`von 1.904,00 €`** — *nicht* „Haushalt" (Begründung im Record)
- Ton: **`--text-muted`** (`.45`), kein neuer Token
- Abstände: **2 px** zum Betrag, **5 px** zum Status
- Höhe auf **jeder** Karte reserviert (`min-height`), auf ICH-Karten leer —
  Muster aus §6 (M3)

Die Karte braucht dafür den **Haushaltsbetrag** zusätzlich zum Anteil. Der kommt aus
`get_effective_plan_for_month` und muss im Loader mitgeladen werden.

> **Offene Frage für den Bau:** Was steht in der Zeile, wenn der Split-Faktor 1,0 ist
> (kein Partner-Einkommen)? Dann wären Anteil und Haushalt identisch —
> `1.089,26 € / von 1.089,26 €` erklärt nichts. **Empfehlung: Zeile leer lassen.**
> In der Gestaltungsrunde ausdrücklich **nicht** entschieden.

---

## 7 · Doku-Folge

| § | Was |
|---|---|
| **§4.5** | Die Umkehr: „Wer überweist, ist eine Konto-Frage" gilt nicht mehr. Als **geänderte Produkt-Entscheidung** kenntlich machen, nicht stillschweigend ersetzen. |
| **§7** | Neue Kartenzeile: Ort, Wortlaut, Ton, reservierte Höhe |
| **§12.3** | Copy-Zeile `von [N] €` |
| Schema-Doku §4 | Anteils-Logik wandert in `calculate_card_amount_for_month`; die drei Aufrufer entsprechend |
| `design-system/komponenten/karten.html` | Karte mit der neuen Zeile (Ablauf: `design-system/SYNC.md`) |

---

## 8 · Reihenfolge im Sprint

1. Anker Produktion messen *(erledigt, §4)*
2. Migration entwerfen — **alle vier Funktionen in EINER Migration**, sonst existiert
   ein Zwischenzustand mit doppeltem oder fehlendem Abzug
3. Slot tauschen, Übungs-DB auf 2.200,00 € prüfen
4. Testreihe **vor** der Migration (Baseline)
5. Migration einspielen, Testreihe erneut, **T8 zwingend**
6. Zurücktauschen, Rennrad-Trainer auf `ACTIVE_HEALTHY` verifizieren
7. Migrationsdatei ablegen · **menschliche Freigabe** · anwenden · Anker nachher
8. Frontend + Doku-Patches
9. Review, Roadmap, PR

> **Schritt 2 ist nicht teilbar.** Würde man `calculate_card_amount_for_month` zuerst
> ausliefern und die drei Aufrufer später, wäre die Sparrate dazwischen **doppelt**
> anteilig — der Fehler wäre größer als vorher.

---

*Konzept Sprint v2-13 · Antigravity Finance · 05. August 2026*
