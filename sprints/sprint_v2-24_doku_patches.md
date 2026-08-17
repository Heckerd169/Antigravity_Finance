# Sprint v2-24 — Doku-Patches

> **Verfahren:** LL-16 / §7 Regel 14. Je Stelle **Anker** (eindeutiger Suchtext) plus
> **Patch-Satz**. Kein direktes Editieren der Bibeln.
>
> **Freigabe-Status je Ziel:**
>
> | Ziel | Freigabe nötig? | Status |
> |---|---|---|
> | Schema-Doku (§4 RPC-Katalog + Header/Changelog) | nein — sachliche Aufnahme zweier neuer Funktionen | **angewendet** |
> | Design-Doku §12 (zwei neue Wortlaute) | **ja** — neue UI-Copy ist eine Gestaltungsentscheidung | **wartet** |
> | CLAUDE.md (§6 Stolperfallen, §8 Register, §9 Stand) | **ja** — §7 Regel 14 verlangt sie ausdrücklich | **wartet** |

---

## A · Schema-Doku — ANGEWENDET

### A1 · Version und Datum

**Anker:** `**Version:** 3.9.0`

**Patch:** → `**Version:** 3.10.0`. Minor-Bump, nicht Patch: Es kommen **zwei neue
Funktionen** dazu, und §4 ändert zusätzlich seine Grundaussage — mehrere Hot-Path-RPCs
werden vom Frontend **nicht mehr direkt** gerufen.

**Anker:** `**Datum:** 15. August 2026`
**Patch:** → `**Datum:** 17. August 2026`

**Anker:** `+ Sprint v2-22 Treiber-Rundung)`
**Patch:** → `+ Sprint v2-22 Treiber-Rundung + Sprint v2-24 gebündelte Lese-Funktionen)`

### A2 · Changelog-Eintrag

**Anker:** `> **Changelog v3.9.0 (15.08.2026, Sprint v2-22 · `B2-R`):**`

**Patch:** Neuer Block **davor** eingefügt (Changelog ist absteigend):

```
> **Changelog v3.10.0 (17.08.2026, Sprint v2-24 · `PF-1` `PF-2`):** **Zwei neue
> LESENDE Funktionen**, die je einen N+1-Fächer des Frontends zu einer Netzrunde
> bündeln — `get_cards_for_month` (179 → 1) und `get_sparrate_series` (24 → 1).
>
> **Beide RUFEN die bestehenden Rechenfunktionen AUF und bauen sie nicht nach.** Das
> ist die ganze Sicherheit des Eingriffs, und es ist belegt statt zugesichert: Die
> Prüfsummen `md5(pg_get_functiondef(...))` aller **neun** Rechenfunktionen sind vor
> und nach beiden Migrationen **byte-identisch** (9/0). Ein Nachbau der
> Prioritätskette hätte den Split-Anteil ein zweites Mal angewandt (§6 Stolperfalle 11
> der CLAUDE.md, der Fehler aus v2-13) — und keine Zahl hätte falsch ausgesehen.
>
> **`get_sparrate_series` enthält bewusst kein `sum()` und kein `round()`.** Beide
> Sparrate-Funktionen runden einmal ganz am Ende über alles; eine Summierung hier wäre
> eine zweite Rundungsstelle und hätte die Sparrate um Cent-Beträge verschoben (LL-25).
> Die Kumulation der Welle bleibt deshalb im Frontend.
>
> **Keine Schema-Änderung** — keine Tabelle, keine Spalte, kein Constraint, kein
> Trigger. Die Sparrate bewegt sich in keinem der zwölf Monate; beide Invarianten
> gelten exakt.
>
> **§4 ändert seine Grundaussage:** Fünf Funktionen, die dort unter „Im Hot-Path (bei
> jedem Render)" stehen, werden vom Frontend **nicht mehr direkt** gerufen — sie
> laufen jetzt innerhalb der beiden Bündel. Der Abschnitt ist entsprechend
> gekennzeichnet.
```

### A3 · §4 — Überschrift des Hot-Path-Abschnitts präzisieren

**Anker:** `### Im Hot-Path (bei jedem Render)`

**Patch:** → `### Im Hot-Path (bei jedem Render)` **plus folgender Hinweis direkt
darunter**, vor der Tabelle:

```
> **⚠️ Seit v2-24 ruft das Frontend fünf dieser Funktionen NICHT MEHR DIREKT.**
> `calculate_sparrate_for_month`, `calculate_planned_sparrate_for_month`,
> `calculate_card_amount_for_month`, `get_effective_plan_for_month` und
> `is_card_active_in_month` laufen jetzt **innerhalb** von `get_cards_for_month` bzw.
> `get_sparrate_series` (siehe „Gebündelte Lese-Funktionen" weiter unten). Sie sind
> unverändert und bleiben die Wahrheitsquelle — nur der Aufrufer ist nicht mehr der
> Browser-Server, sondern die Datenbank selbst.
>
> **Wer eine dieser Funktionen ändert, muss die zwei Bündel mitdenken.** Direkt
> gerufen wird aus dem Frontend nur noch `get_split_factor` (Monatswert, passt in
> keine der beiden Reihen).
```

### A4 · §4 — neuer Abschnitt für die beiden Bündel

**Anker:** `### Netto-Zuordnung (v2-19, `GE-1`)`

**Patch:** Neuer Abschnitt **davor** eingefügt:

```
### Gebündelte Lese-Funktionen (Sprint v2-24 · `PF-1`)

Beide `STABLE`, `SECURITY INVOKER`, `SET search_path TO 'public'`, mit `p_user_id` in
der Signatur (Konvention für Funktionen, die über den Nutzer aggregieren — §6
Stolperfalle 4 der CLAUDE.md). `STABLE` ist hier nicht Kosmetik: Es verbietet
schreibende Anweisungen, die Funktionen können strukturell nichts verändern.

| Funktion | Wofür | Returns |
|---|---|---|
| `get_cards_for_month(p_user_id uuid, p_month date)` | Alle im Monat **aktiven** Karten mit ihren Monatswerten in EINEM Aufruf — ersetzt 179 Netzrunden (77× `is_card_active_in_month` plus 3 je aktiver Karte). **Ruft** `is_card_active_in_month`, `calculate_card_amount_for_month` und `get_effective_plan_for_month` auf; liest `card_monthly_states` per LEFT JOIN (doppelt nicht — `UNIQUE (card_id, month)`). `manually_paid` kommt als `false` statt `NULL`, wenn keine Zustands-Zeile existiert; `adjusted_amount` bleibt `NULL` — „keine Anpassung" und „Anpassung auf 0 €" sind verschiedene Aussagen (§6 Stolperfalle 3). Der Monatsbereich steht **zusätzlich** als inline-Vorfilter: `is_card_active_in_month` erzwingt ihn selbst und verengt danach über die Frequenz, der Vorfilter ist also eine echte Obermenge und erlaubt nur den Index-Zugriff. Rein lesend gegen Produktion belegt: über 24 Monate **304 gegen 304 Zeilen, 0 Unterschied in beide Richtungen**. Gemessen **7,99 ms** für 34 Karten. **Liefert NICHT** Name, Typ, Zuordnung, Frequenz, Fälligkeitstag oder Kategorie — das sind Eigenschaften der Karte, und der `cards`-Select bleibt ohnehin, weil die Badge-Auflösung die Namen auch monats-**inaktiver** Karten braucht | `jsonb` (Array aus `{card_id, amount, effective_plan, manually_paid, adjusted_amount}`, sortiert nach `card_id`) |
| `get_sparrate_series(p_user_id uuid, p_year int)` | Zwölf Monate Ist und Plan in EINEM Aufruf — ersetzt 24 Netzrunden, plus zwei weitere, weil der Ring seinen Monatswert jetzt aus der Reihe liest statt ihn erneut zu holen. **Ruft** `calculate_sparrate_for_month` und `calculate_planned_sparrate_for_month` auf. **Enthält bewusst kein `sum()` und kein `round()`** — beide Funktionen runden einmal ganz am Ende über alles, eine Summierung hier wäre eine zweite Rundungsstelle (LL-25); die Kumulation der Welle bleibt im Frontend. `NULL` bleibt `NULL` (kein Gehalt hinterlegt ≠ 0,00 €, LL-20): für ein Jahr ohne Daten kommen 12 von 12 `NULL` durch den jsonb-Umlauf zurück. `p_year` außerhalb 1900–2200 → **22023**. Immer genau 12 Einträge, aufsteigend nach `month_index`. Gemessen **50,3 ms** für zwölf Monate. Gegen die 24 Einzelaufrufe belegt: drei Jahre, **36 gegen 36 Zeilen, 0 Unterschied** | `jsonb` (Array aus `{month_index, ist, plan}`) |

> **Warum das Bündeln überhaupt so viel bringt — die Zahl, um die es geht.**
> `is_card_active_in_month` braucht **0,089 ms** in der Datenbank und lag im
> Produktionsschnitt bei **899 ms** über die Leitung. Faktor ~10.000, und nichts davon
> ist Rechnen. Am 16.08.2026 transportierten **55.881 Anfragen** insgesamt **0,4 MB** —
> im Schnitt **8 Bytes je Antwort**. Ein Dashboard-Aufbau machte 233 Netzrunden für
> rund 490 ms Rechenarbeit; danach sind es ~18.
>
> **Wer eine dieser beiden Funktionen erweitert, prüft die Prüfsummen erneut.** Sie
> stehen in `sprints/sprint_v2-24_anker.md`. Der Anker der Sparrate allein genügt
> nicht: Ein Nachbau, der zufällig dasselbe liefert, wäre dort unsichtbar.
```

---

## B · Design-Doku §12 — WARTET AUF FREIGABE

Zwei Wortlaute, die die App seit v2-24 zeigt und die §12 noch nicht kennt. Beide sind
**gebaut** — der Patch trägt sie nach, er entscheidet sie nicht neu. Wird einer
abgelehnt, ändert sich der Code.

### B1 · Der dritte Zustand der Treiber-Zeile (§12.7 / §9)

**Anker:** die bestehende Auflistung der Treiber-Platzhalter (`Keine Abweichungen` /
`Treiber nicht verfügbar`).

**Patch:** dritter Eintrag `Treiber werden geladen`, gedimmt wie die beiden anderen.

**Begründung, die mitgeschrieben gehört:** Seit v2-24 werden die Treiber erst beim
Anfassen der Welle geladen. In dem Moment, in dem der Tooltip erscheint, können sie
noch unterwegs sein — und **beide bestehenden Platzhalter wären dann eine falsche
Aussage**: „Keine Abweichungen" behauptet einen geprüften Befund, „Treiber nicht
verfügbar" behauptet ein Scheitern. Zutreffend ist keins von beidem.

**Kein Auslassungszeichen:** `…` bedeutet in dieser Anwendung durchgängig „öffnet einen
Dialog" (§12.3/§12.4). Ein Ladezustand ist kein Dialog.

**Wächter:** `tests/e2e/welle-driver-states.spec.ts` nagelt fest, dass die drei Texte
**paarweise verschieden** sind — fiele einer auf den Text eines anderen zurück, wäre die
Anzeige eine stille Falschaussage, und keine Zahl im Projekt würde sich bewegen.

### B2 · Die Fehlerseite (neuer §12-Abschnitt)

**Anker:** Ende von §12.

**Patch:** neuer Abschnitt „Fehlerseite" mit drei Zeilen:

| Element | Wortlaut |
|---|---|
| Titel | `Die Ansicht konnte nicht geladen werden` |
| Hinweis | `Deine Daten sind unberührt — es ist nur die Anzeige, die nicht zustande kam.` |
| Knopf | `Nochmal versuchen` |

**Drei bewusste Auslassungen, die begründet gehören:**
- **kein Fehlercode und keine Ursache im Text.** Der Grund ist selten der, den ein Text
  raten würde, und eine falsche Ursache ist schlimmer als keine. Die technische Meldung
  geht mit dem Digest in die Server-Logs.
- **eine Handlung, nicht zwei.** `reset()` versucht denselben Render erneut — bei einer
  Überlast genau das Richtige, und es braucht kein Neuladen.
- **keine Zahl.** Eine Fehlerseite, die Beträge zeigt, zeigt womöglich veraltete.

**Formensprache:** Zeichen für Zeichen von der Anmeldeseite übernommen — gleiche Kachel,
Radius, Ränder, Schriftgrade, Knopf. Es sind die beiden einzigen Seiten außerhalb des
Dashboards, sie erscheinen in derselben Lage, und eine zweite Formensprache dafür wäre
erfunden.

---

## C · CLAUDE.md — WARTET AUF FREIGABE

### C1 · §6 — neue Stolperfalle 18

**Anker:** `17. **Eine Sub-Score-Funktion, die nicht streuen kann,`

**Patch:** neuer Punkt **18** danach:

```
18. **Ein N+1 mit Datumsstempel: eine Aufwands-Entscheidung verfällt mit der
    Datenmenge, die sie begründet hat.** In `page.tsx` stand
    *„N+1-Pragmatik: bei <20 Karten in V1 akzeptable Latenz (Briefing §K1.4)"* — und
    das war richtig, als es geschrieben wurde. Bei **77** Karten waren daraus **179
    Netzrunden je Dashboard-Aufbau** geworden, und jede neue Karte kostete vier
    weitere.
    **Kein Wächter dieses Projekts fängt das.** Anker, Prüfsummen und beide
    Invarianten sind grün, weil **jede Zahl richtig ist** — sie kommt nur zu spät.
    Gefunden hat es der Nutzer beim Benutzen.
    **Regel:** Wer eine Mengen-Annahme in einen Kommentar schreibt, schreibt die
    **heutige Zahl** dazu. Dann ist die Annahme prüfbar statt bloß plausibel.
    (v2-24, LL-28)
```

### C2 · §6 — neue Stolperfalle 19

**Patch:** neuer Punkt **19**:

```
19. **Die Antwort ist winzig, der Weg ist teuer — bei Trägheit zuerst die
    Netzrunden zählen, nicht die Abfragen optimieren.**
    `is_card_active_in_month` braucht **0,089 ms** in der Datenbank und lag im
    Produktionsschnitt bei **899 ms** über die Leitung. Faktor ~10.000, und nichts
    davon ist Rechnen: Für jede Anfrage muss eine verschlüsselte Verbindung stehen,
    ein Ausweis geprüft und eine eigene Transaktion geöffnet werden.
    Am 16.08.2026 transportierten **55.881 Anfragen** insgesamt **0,4 MB** — im
    Schnitt **8 Bytes je Antwort**.
    **Und die Folge reicht weiter als Trägheit:** Die Dauerlast aus dem Fächer trieb
    die kostenlose Datenbank-Instanz über Stunden in die CPU-Drosselung. In diesem
    Zustand brauchten die zwei Aufrufe der Middleware zusammen über 25 Sekunden, und
    Vercel lieferte `504 MIDDLEWARE_INVOCATION_TIMEOUT`. **Ein Leistungsproblem war
    hier ein Verfügbarkeitsproblem.** (v2-24, LL-29)
```

### C3 · §8 — zwei neue Register-Einträge

**Anker:** die Zeile `| LL-27 | Eine Ähnlichkeitsfunktion braucht ein Prüfset`

**Patch:** zwei Zeilen danach:

```
| LL-28 | Ein N+1 mit Datumsstempel — die Mengen-Annahme im Kommentar verfällt, und kein Anker merkt es | §6 Stolperfalle 18 | v2-24 (`PF-1`) |
| LL-29 | Die Antwort ist winzig, der Weg ist teuer — Netzrunden zählen, nicht Abfragen optimieren | §6 Stolperfalle 19 | v2-24 (`PF-1`) |
```

### C4 · §9 — Kopfzeile und Stand

**Patch:** Sprint-Stand auf **v2-24**, Doku-Versionen auf Design **v3.7.0**
(unverändert, sofern B abgelehnt wird — sonst **v3.8.0**) und Schema **v3.10.0**,
Roadmap-Zahlen auf **11 offene Pakete · 35 Themen · 4 Hausaufgaben · 39 offen gesamt ·
52 erledigt**.

**Die Momentaufnahme in §9 bleibt unverändert** — der Sprint hat keine Zahl bewegt, und
das ist hier das erwartete Ergebnis, nicht ein fehlender Nachtrag.

### C5 · §9 — ein zweiter Wächter, der nicht die Richtigkeit misst

**Patch:** Ergänzung bei den Prüfankern:

```
#### Anker 3 — Anfragen je Dashboard-Aufbau *(seit v2-24)*

**Die beiden anderen Anker messen Richtigkeit. Dieser misst, ob die App benutzbar
bleibt.** Ein N+1 kann beliebig wachsen, während Anker 1, Anker 2 und alle Prüfsummen
grün bleiben — jede Zahl ist richtig, sie kommt nur zu spät. Genau so ist v2-24
entstanden.

Zählbar im Supabase-Edge-Log über `app_config`: genau **ein** Aufruf je
Dashboard-Aufbau, also der Zähler für die Zahl der Aufbauten.

    Anfragen im Fenster / Aufrufe von app_config im Fenster

**Stand nach v2-24: ~18.** Vor v2-24: **233**. Steigt die Zahl deutlich, ist ein
N+1 zurück.

> **Zwei Fallen bei der Auswertung.** Die Edge-Logs haben eine
> **Ingestion-Verzögerung von Minuten** — wer sofort nach dem Messlauf zählt, zählt zu
> wenig und diagnostiziert einen Fehler, den es nicht gibt. Und: `pnpm build` **nie**
> bei laufendem dev-Server starten, beide teilen `.next`; das Symptom ist
> `ERR_ABORTED` beim Navigieren und die Anmeldeseite im Test-Abbild, was nach einem
> Auth-Fehler aussieht und keiner ist.
```

### C6 · §4 — Nebenfund als Routine

**Patch:** Ergänzung bei „Typen neu erzeugen":

```
> **Und danach die NAMENSMENGEN vergleichen, nicht den Zeilen-Diff lesen.** In v2-24
> war `types.ts` **seit v2-21 veraltet** — fünf RPCs fehlten (`af_normalize_text`,
> `af_word_in_text`, `history_match`, `name_similarity_scoped`,
> `refresh_fragment_suggestions`), weil dieser Schritt damals übersprungen worden war.
> Aufgefallen ist es nur, weil `tsc` eine neue RPC nicht kannte.
> Der Zeilen-Diff war 288+/267− und praktisch unlesbar; ein Vergleich der
> Funktionsnamen als Menge beantwortete die Frage in einer Zeile — „nichts verloren,
> sechs dazu". **Verloren gehende Namen sind das, was hier wehtut**, nicht
> verschobene Zeilen.
```
