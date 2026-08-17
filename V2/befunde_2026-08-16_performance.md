# Befunde 16.08.2026 — warum die App auf Eingaben wartet

> **Was das hier ist:** eine Diagnose des Ist-Zustands, keine Umsetzung. Anlass war die
> Meldung des Nutzers, das Ziehen einer Zahlung auf eine Karte dauere „mehrere Sekunden",
> und ein Screenshot mit `504 GATEWAY_TIMEOUT · MIDDLEWARE_INVOCATION_TIMEOUT`
> (`fra1::q68cm-1786907424392-ef5b3156971e`).
>
> **Alle Zahlen unten sind gemessen, nicht geschätzt.** Quellen: die Produktiv-Datenbank
> `nflkobdfdhncrtjncpmq` (ausschließlich lesend; Laufzeiten über `clock_timestamp()` in
> einem per `RAISE` zurückgerollten `DO`-Block nach LL-18) und der Supabase-Edge-Log
> desselben Tages. Wo eine Zahl hergeleitet ist, steht das dabei.
>
> **Methodik-Hinweis:** Der Zeitstempel in der Vercel-Fehler-ID ist auflösbar —
> `1786907424392` ms = **16.08.2026, 19:10:24 UTC**. Das erlaubt es, den Fehler mit der
> Minute im Datenbank-Log zusammenzuführen, statt über die Ursache zu spekulieren.

---

## 0. Der Befund in einem Satz

**Ein Dashboard-Aufbau macht 208–233 einzelne HTTP-Anfragen an die Datenbank, um darin
rund 0,5 Sekunden Rechenarbeit zu erledigen** — und jede Geste des Nutzers löst diesen
Aufbau vollständig neu aus.

Nicht die Datenbank ist langsam. Der **Transport** ist das Problem: Die App zerlegt eine
halbe Sekunde Arbeit in über zweihundert Postsendungen.

---

## 1. Die Datenbank ist schnell — gemessen

Zweiter, warmer Lauf, Produktion, 16.08.2026:

| Funktion | Laufzeit in der Datenbank |
|---|---|
| `is_card_active_in_month` (ein Aufruf) | **0,089 ms** |
| `calculate_card_amount_for_month` (ein Aufruf) | **0,125 ms** |
| `get_effective_plan_for_month` (ein Aufruf) | **0,403 ms** |
| `calculate_planned_sparrate_for_month` | 1,98 ms |
| `calculate_sparrate_for_month` | 5,94 ms |
| `get_category_amounts_for_month` | 9,52 ms |
| **alle 77 `is_card_active_in_month` zusammen** | **1,2 ms** |
| **die ganze Welle: 12× Ist + 12× Plan** | **54,6 ms** |
| `get_year_deviation_drivers(2026)` | **357,4 ms** |

Bestand, selbst gezählt: **77** nicht gelöschte Karten (davon **34** im Juli aktiv, **26**
im August), 1.590 Fragmente, 295 `card_fragment_links`, **26** Zeilen in
`card_monthly_states`, 10 Kategorien. Die gesamte Datenbank ist **15 MB** groß und passt
vielfach in den Arbeitsspeicher der Instanz (224 MB `shared_buffers`) — ein
Festplatten-Engpass ist damit ausgeschlossen.

**Summiert man alles, was ein Dashboard-Aufbau an Rechnung braucht, kommt man auf rund
490 ms — davon entfallen 357 ms auf eine einzige Funktion** (`get_year_deviation_drivers`).
Die übrigen ~200 Anfragen tragen zusammen etwa 130 ms.

---

## 2. Die App zerlegt diese halbe Sekunde in 233 Anfragen

Gezählt aus `src/app/page.tsx`, für den Juli (34 von 77 Karten aktiv):

| Was | Fundstelle | Anfragen |
|---|---|---|
| `auth.getUser()` | `page.tsx:54` | 1 |
| Profil + Einkommen ICH + Einkommen PARTNER | `page.tsx:58-78` | 3 |
| Ring: Ist, Plan, Split-Faktor | `page.tsx:96-100` | 3 |
| **Welle**: 12× Ist + 12× Plan + 12× Vorjahr-Ist + Treiber | `welle/loader.ts:65-82` | **37** |
| Karten-Stammdaten, Kategorien, Kategorie-Beträge | `page.tsx:139-190` | 3 |
| Gehalts-Verknüpfung, Lösch-Tor (2 Selects) | `page.tsx:203-238` | 3 |
| **`isCardActiveInMonth` — einzeln je Karte** | `page.tsx:252-256` | **77** |
| **drei Aufrufe je aktiver Karte** (Betrag, Plan, Monatszustand) | `page.tsx:267-277` | **102** |
| Schwellenwert, Fragmente (2×), Vormonats-Zähler | `page.tsx:352-544` | 4 |
| | **Summe** | **233** |

Im August sind es 208 (weniger aktive Karten). Die beiden fett markierten Zeilen — der
Karten-Lader — sind **179 der 233 Anfragen** und tragen zusammen **17 ms** Rechenzeit bei.

Der Kommentar an der Stelle nennt die Annahme, die längst gebrochen ist
(`page.tsx:266`):

> `// N+1-Pragmatik: bei <20 Karten in V1 akzeptable Latenz (Briefing §K1.4).`

Es sind 77. Und die 34 Einzelabfragen auf `card_monthly_states` fragen eine Tabelle ab,
die **insgesamt 26 Zeilen** hat.

### Im Produktions-Log nachgezählt

Fenster 18:45–19:00 UTC, 15 Minuten normaler Nutzung durch **eine** Person:

- **9.818 Anfragen** insgesamt
- davon `is_card_active_in_month`: **3.538**
- exakt **54 Dashboard-Aufbauten** (`app_config`, `cards`, `card_categories`,
  `get_split_factor`, `get_category_amounts_for_month`, `income_fragment_links` und
  `get_year_deviation_drivers` stehen alle bei genau 54 — je einmal pro Aufbau)
- `calculate_sparrate_for_month`: 1.350 = **exakt 25 je Aufbau** (12 + 12 + 1) ✓
- `calculate_planned_sparrate_for_month`: 702 = **exakt 13 je Aufbau** (12 + 1) ✓

Über den ganzen Tag: **rund 56.000 Anfragen**, ausgelöst von einem einzigen Nutzer einer
persönlichen Finanz-App.

---

## 3. Was der Transport kostet — dieselbe Funktion, 10.000-fach teurer

Dieselben 15 Minuten, jetzt die gemessene Antwortzeit:

| Endpunkt | Anzahl | Ø | p95 | max |
|---|---|---|---|---|
| `is_card_active_in_month` | 3.538 | **899 ms** | 3.983 ms | 15.778 ms |
| `calculate_sparrate_for_month` | 1.350 | 1.298 ms | 3.966 ms | 6.446 ms |
| `calculate_card_amount_for_month` | 1.051 | 684 ms | 1.970 ms | 16.990 ms |
| `get_effective_plan_for_month` | 1.051 | 635 ms | 1.956 ms | 16.915 ms |
| `card_monthly_states` | 1.105 | 541 ms | 1.824 ms | 16.915 ms |
| `get_year_deviation_drivers` | 54 | **2.064 ms** | 4.658 ms | 6.934 ms |
| `/auth/v1/user` | 157 | 329 ms | 1.081 ms | 5.205 ms |

**`is_card_active_in_month` braucht in der Datenbank 0,089 ms und über die Leitung im
Schnitt 899 ms.** Das ist ein Faktor von rund 10.000. Nichts davon ist Rechnen.

---

## 4. Der 504 — die Kette ist geschlossen

Der Fehler fiel um **19:10:24 UTC**. Die Minute **19:10** ist die schlechteste des
gesamten Tages im Datenbank-Log:

| | Wert |
|---|---|
| Anfragen in der Minute | 365 |
| **Median-Antwortzeit** | **20.023 ms** |
| p95 | 30.643 ms |
| Maximum | 31.708 ms |

Im Fenster 19:09:30–19:11:00 brauchte `/auth/v1/user` im Median **6.547 ms** (max 15.106 ms)
und `/rest/v1/profiles` im Median **14.184 ms** (max 18.004 ms).

**Die Middleware ruft genau diese beiden nacheinander auf** — `supabase/middleware.ts:31`
und `:48-52`. Zusammen liegt das über Vercels 25-Sekunden-Grenze für Edge-Middleware. Es
gibt dort weder ein Zeitlimit noch einen Ausweichpfad: `updateSession` hat 71 Zeilen und
kein einziges `try`, `catch`, `AbortSignal` oder `Promise.race`. Auch der bestehende
Wiederhol-Mechanismus aus `fetch-retry.ts` ist dort **nicht verdrahtet** — er hängt nur am
Server-Client (`supabase/server.ts:15`), nicht am Middleware-Client.

### Es war keine Momentaufnahme, sondern ein neun Minuten langer Zustand

In 10-Sekunden-Fenstern zwischen 19:04 und 19:13:

| Fenster | Anfragen | Median |
|---|---|---|
| 19:04:50 | 142 | **36.035 ms** |
| 19:07:00 | **3** | **22.679 ms** |
| 19:08:20 | 117 | 30.049 ms |
| 19:10:20 | 98 | 30.320 ms |
| 19:12:40 | 61 | 26.491 ms |

**Ein Fenster mit drei Anfragen zeigt einen Median von 22,7 Sekunden.** Das schließt eine
reine Momentan-Warteschlange aus — die Instanz war bereits gedrosselt.

### Der Tagesverlauf zeigt, warum

| Stunde (UTC) | Anfragen | Median | p95 |
|---|---|---|---|
| 15:00 | 15.469 | 344 ms | 6.493 ms |
| 16:00 | 6.691 | 339 ms | 8.606 ms |
| 18:00 | 15.457 | 312 ms | 3.962 ms |
| **19:00** | 12.864 | **1.188 ms** | **26.651 ms** |
| 20:00 | 795 | **64 ms** | 628 ms |

Drei schwere Stunden hintereinander (rund 44.000 Anfragen), dann bricht die Instanz ein.
Sobald die Last nachlässt, ist sie mit **64 ms** sofort wieder gesund. Das ist das
Verhalten einer **Instanz mit CPU-Guthaben**: Sie hält kurze Spitzen mühelos aus und wird
hart gedrosselt, wenn das Guthaben unter Dauerlast aufgebraucht ist.

> **Damit ist die Frage beantwortet, ob das langsame Ziehen und der 504 dieselbe Ursache
> haben. Ja — aber nicht so, wie es zunächst aussieht.** Es ist keine unmittelbare
> Warteschlange: Der Aufbau sättigt die Datenbank nicht in dem Moment, in dem die
> Middleware anklopft. Es ist die **Dauerlast**, die aus dem Anfrage-Fächer entsteht und
> die Instanz über Stunden in die Drosselung treibt. In diesem gedrosselten Zustand ist
> dann alles langsam — auch die zwei Aufrufe der Middleware.
>
> **Folge für die Abhilfe:** Der Fächer ist die Wurzel. Aber die Middleware braucht
> **zusätzlich** einen eigenen Schutz, denn sie darf auch in einem schlechten Moment
> keinen 504 erzeugen.

---

## 5. Warum jede Geste den ganzen Aufbau auslöst

`drop-target-wrapper.tsx:81-97` — der Drop-Handler in voller Länge relevant:

```
async function handleDrop(e) {
  …
  await linkFragmentToCard(fragmentId, target.cardId, targetDbMonth);
}
```

Kein `useTransition`, kein `useOptimistic`, kein Wartezustand, kein Zeiger-Wechsel.
**Zwischen dem Loslassen und dem Ergebnis sieht der Nutzer nichts.**

Die Server Action selbst (`interaction-zone/actions.ts:28-55`) ist billig: ein
`auth.getUser()` und ein UPSERT. Teuer ist die letzte Zeile — `revalidatePath("/", "page")`.
Sie steht in **allen 22 Server Actions** des Projekts und bedeutet: Next.js rendert die
Seite vollständig neu und liefert das Ergebnis als Teil der Antwort auf den Drop zurück.
Der Nutzer wartet also auf **alle 233 Anfragen**, bevor sich irgendetwas bewegt.

Dazu kommt: Es gibt **kein `loading.tsx`, kein `error.tsx`, keine einzige
Suspense-Grenze** im Projekt (geprüft über `find src/app` und `grep -rn "Suspense" src/` —
je null Treffer). Der Seitenaufbau ist damit alles-oder-nichts: Bis die letzte der 233
Anfragen zurück ist, wird kein einziges Pixel ausgeliefert.

Und ein `cache()` oder `unstable_cache` gibt es nirgends — identische Aufrufe innerhalb
desselben Renders werden nicht zusammengefasst. `calculate_sparrate_for_month` für den
angezeigten Monat wird deshalb **zweimal** geholt: einmal für den Ring (`page.tsx:97`) und
einmal im Welle-Lader (`welle/loader.ts:67`).

---

## 6. Zwei Dinge, die eigenständig teuer sind

**① `get_year_deviation_drivers` — 357 ms für etwas, das niemand ansieht.**
`welle/loader.ts:55-63` ruft die Funktion **bedingungslos bei jedem Aufbau**. Ihr Ergebnis
wird ausschließlich im Hover-Tooltip der Welle (`welle/index.tsx:196`) und im Popup
gebraucht — beides erst, wenn der Nutzer die Welle anfasst. Beim Zuordnen einer Zahlung
ist das Popup zu. Diese eine Funktion ist **rund 73 % der gesamten Rechenzeit** eines
Aufbaus.

Dasselbe gilt für die **12 Vorjahres-Werte** (`loader.ts:76-80`): Sie speisen allein die
gold-gestrichelte Linie im Popup (`prevYearEndCumulative`) — 12 Anfragen für einen Inhalt
hinter einem Klick.

**② Jede RLS-Regel wertet `auth.uid()` pro Zeile neu aus.**
Der Supabase-Linter meldet `auth_rls_initplan` als **WARN** für **elf** Tabellen: `profiles`,
`income_timeline`, `cards`, `card_planned_timeline`, `card_monthly_states`, `fragments`,
`card_fragment_links`, `deleted_entities`, `card_categories`, `income_fragment_links`.
Die Abhilfe ist mechanisch (`auth.uid()` → `(select auth.uid())`) und verbilligt **jede**
der 233 Anfragen ein Stück.

Nebenbei, aus demselben Bericht: `card_planned_timeline.user_id` und
`fragments.suggested_card_id` haben keinen Index auf ihrem Fremdschlüssel.

---

## 7. Was daraus folgt

Die Reihenfolge der Ursachen nach spürbarer Wirkung:

| # | Ursache | Anfragen | Berührt Datenbank |
|---|---|---|---|
| **U1** | Karten-Lader fragt Karte für Karte einzeln | **179 von 233** | ja (neue Lese-Funktion) |
| **U2** | Treiber und Vorjahr werden vorab geladen, obwohl beide hinter einem Klick liegen | 13 | nein |
| **U3** | Welle holt 24 Monatswerte einzeln | 24 | ja (neue Lese-Funktion) |
| **U4** | Middleware ohne Zeitlimit, zwei Aufrufe nacheinander | 2 je Anfrage | nein |
| **U5** | RLS wertet `auth.uid()` je Zeile aus | — | ja (Policy-Migration) |
| **V** | `revalidatePath` in 22 Aktionen multipliziert U1–U3 auf jede Geste | — | nein |
| **S** | Drop ohne jede Rückmeldung — der Nutzer sieht die Wartezeit ungefiltert | — | nein |

**U1 bis U3 zusammen sind 216 der 233 Anfragen.** Sie lassen sich auf **drei** reduzieren,
ohne dass eine einzige Zahl anders berechnet wird — vorausgesetzt, die neuen Funktionen
**rufen** die bestehenden Rechenfunktionen auf und bauen sie nicht nach (LL-26, und §6
Stolperfalle 11: der Split-Anteil darf kein zweites Mal angewandt werden).

---

## 8. Offene Frage an den Gestalter

**Was sieht der Nutzer zwischen dem Loslassen einer Zahlung und dem fertigen Ergebnis?**

Die Design-Doku regelt das Ziehen ausführlich (§8, §11, Konflikte 1/3/4) — aber **nicht
diesen Zustand**. Nach §7 Regel 3 ist das eine offene Frage und keine Sache, die beim Bauen
nebenbei entschieden wird.

---

## 9. Was noch nicht gemessen ist

- **Die tatsächliche Laufzeit der Vercel-Funktion.** Alle Zahlen oben sind von der
  Datenbank-Seite aus gemessen. Was Vercel selbst dazurechnet (Kaltstart, Region der
  Funktion — es gibt weder `vercel.json` noch eine Region-Einstellung in
  `next.config.mjs`), ist offen.
- **Wie oft der 504 auftritt.** Belegt ist genau ein Fall, dieser dafür lückenlos.
- **Wie viel die Drosselung genau ausmacht.** Der Verlauf ist eindeutig, die
  CPU-Guthaben-Kurve der Instanz selbst wurde nicht eingesehen.
