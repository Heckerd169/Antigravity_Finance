# Sprint v2-24 — Briefing: die App reagiert sofort

> **Briefing-Datei: ja** — und zwar aus drei der vier Gründe gleichzeitig: Die Datenbank
> wird berührt (zwei neue Lese-Funktionen), es sind mehr als drei Phasen, und der Sprint
> reicht über mehrere Sitzungen.
>
> **Grundlage:** `V2/befunde_2026-08-16_performance.md` — dort stehen alle Messungen mit
> Quelle. Dieses Papier wiederholt sie nicht, es baut darauf auf.
>
> **Entschieden am 16.08.2026 durch den Nutzer** (drei Fragen, alle nach Empfehlung):
> ① keine neue Warte-Anzeige, erst schnell machen und dann messen · ② Welle-Treiber und
> Vorjahr erst beim Anfassen laden · ③ die Datenbank-Instanz vorerst **nicht** vergrößern.
>
> **Vorrang:** Dieser Sprint drängt sich vor `ZO-3` (Paket 5). Begründung: Die App läuft
> in Produktion in Zeitüberschreitungen; das ist kein Komfort-Thema mehr.

---

## Ziel — ein Satz

**Eine Geste im Dashboard — eine Zahlung ziehen, den Monat wechseln, eine Karte antippen —
wirkt spürbar sofort, statt mehrere Sekunden zu brauchen oder in einer Fehlerseite zu
enden.**

## Nicht-Ziel — was ausdrücklich nicht angefasst wird

- **Keine einzige Zahl darf sich bewegen.** Dies ist ein reiner Umbau des Transportwegs.
  Keine Rechenlogik wird geändert, keine bestehende Rechenfunktion angefasst.
- Keine neue Funktion, keine neue Oberfläche, kein neuer Bedien-Weg.
- **Keine optimistische Anzeige** und kein neuer Wartezustand (Entscheidung ①).
- Keine Vergrößerung der Datenbank-Instanz (Entscheidung ③).
- Kein Major-Bump von Next/React/ESLint. Keine neue Abhängigkeit.
- Keine Mobile-/Touch-Arbeit.
- **Die 22 `revalidatePath`-Aufrufe bleiben, wie sie sind.** Sie sind der Verstärker, nicht
  die Ursache — wenn ein Aufbau nur noch 17 Anfragen kostet, ist ein vollständiger
  Neuaufbau je Geste vertretbar und bleibt die einfachste korrekte Bauweise. Ein Umbau auf
  `revalidateTag` wäre ein eigener Sprint mit eigenem Risiko.
- **Die RLS-Feinschliff-Arbeit läuft NICHT in diesem Sprint** — siehe „Nachlauf".

---

## Prüfanker

### Der harte Anker: nichts bewegt sich

Es gibt in diesem Sprint **keinen** erwarteten Zahlen-Ausschlag. Jede Bewegung ist ein
Fehler. Gemessen wird nach §7 Regel 21 **vor und nach jeder Phase, in derselben Sitzung**,
gegen den eigenen Vorher-Wert — nicht gegen eine Tabelle in einer Datei (§9).

| Anker | Was gemessen wird | Erwartung |
|---|---|---|
| **A1** | Ist-Sparrate, alle 12 Monate 2026 + alle 12 Monate 2025 | unverändert, auf den Cent |
| **A2** | Plan-Sparrate, alle 12 Monate 2026 | unverändert, auf den Cent |
| **A3** | Invariante 1: `Σ get_category_amounts_for_month == calculate_sparrate_for_month` | 0,00 € Differenz in allen 12 Monaten |
| **A4** | Invariante 2 (B2): `Σ delta == Ist − Plan` | gilt in allen 12 Monaten |
| **A5** | `md5(pg_get_functiondef(oid))` der vier Rechenfunktionen | **byte-identisch** vorher/nachher |
| **A6** | Übungs-Datenbank: März-Anker | **2.200,00 €**, vor und nach jeder Migration |

> **A5 ist der eigentliche Beweis dieses Sprints.** v2-17 hat dieses Verfahren schon
> einmal benutzt. Wenn `calculate_sparrate_for_month`,
> `calculate_planned_sparrate_for_month`, `calculate_card_amount_for_month` und
> `get_effective_plan_for_month` byte-identisch bleiben, ist bewiesen, dass die neuen
> Bündel-Funktionen sie **aufrufen** und nicht **nachbauen**. Genau daran hängt alles
> (LL-26 · §6 Stolperfalle 11).

### Der Erfolgs-Messwert

| | heute (belegt) | Ziel |
|---|---|---|
| Anfragen je Dashboard-Aufbau | **233** (Juli) / 208 (August) | **≤ 20** |
| Anfragen je Middleware-Durchlauf | 2, nacheinander | **1** |
| Rechenzeit je Aufbau in Postgres | ~490 ms | **~130 ms** |

Gezählt wird im Supabase-Edge-Log über die Kennzahl, die schon den Vorher-Wert geliefert
hat: `app_config`, `cards`, `card_categories` und `get_split_factor` stehen bei genau
**einem** Aufruf je Aufbau und dienen damit als Zähler für die Zahl der Aufbauten.

---

## Phasen

Ein Commit je Phase, Phase N+1 startet erst nach grüner Phase N (LL-14). Reihenfolge:
akutester Ausfall zuerst, dann größter Gewinn je Risiko. **Jede Phase ist allein
zurücknehmbar.**

### Phase 1 — Die Middleware darf keinen 504 mehr erzeugen
**Datenbank: nein** · Aufwand: klein · Risiko: klein (aber Auth-nah, deshalb sorgfältig)

Heute macht `updateSession` zwei Netzrunden **nacheinander** und hat weder Zeitlimit noch
Ausweichpfad — 71 Zeilen ohne ein einziges `try`, `catch` oder `AbortSignal`.

1. **Den `profiles`-Abruf aus der Middleware nehmen.** Der Onboarding-Guard wandert nach
   `src/app/page.tsx` — dort wird `profiles` in Zeile 59-63 **ohnehin schon gelesen**. Der
   Redirect erfolgt dann per `redirect("/onboarding")`, bevor irgendetwas gerendert wird.
   Wirkung: eine Netzrunde weniger auf **jeder** Anfrage, ohne dass der Guard schwächer
   wird.
2. **Zeitlimit um `auth.getUser()`** (`AbortSignal.timeout`), plus `try/catch`. Läuft es
   ab, wird auf `/login` umgeleitet — nie in eine Zeitüberschreitung gelaufen.
3. **`fetchWithRetry` am Middleware-Client verdrahten.** Es hängt heute nur am
   Server-Client (`supabase/server.ts:15`), nicht am Middleware-Client.
4. **`page.tsx` gegen fehlenden Nutzer absichern.** Heute steht dort dreimal `user!.id` —
   wenn die Middleware bei einem Timeout durchlässt, muss die Seite selbst umleiten statt
   abzustürzen. Das ist ohnehin die robustere Bauweise; die Supabase-SSR-Muster sehen die
   Middleware ausdrücklich nicht als alleinigen Wächter.

> **Ehrlich gesagt:** Diese Phase beseitigt die Ursache **nicht** — die Dauerlast bleibt,
> bis Phase 3 und 4 stehen. Sie sorgt dafür, dass die App eine überlastete Datenbank
> **überlebt**, statt eine Fehlerseite zu zeigen. Sie steht zuerst, weil sie der einzige
> akute Ausfall ist und weil sie ohne Datenbank-Eingriff auskommt.

---

### Phase 2 — Welle-Treiber und Vorjahr erst beim Anfassen
**Datenbank: nein** · Aufwand: klein bis mittel · Risiko: klein
**Ersparnis: 357 ms + 13 Anfragen je Aufbau** — der größte einzelne Zeitposten

`welle/loader.ts:55-63` ruft `get_year_deviation_drivers` bedingungslos bei jedem Aufbau
(357 ms, ~73 % der gesamten Rechenzeit). Die Zeilen 76-80 holen zusätzlich 12
Vorjahres-Werte für die Goldlinie im Popup.

1. `loadWelleData` lädt beide **nicht mehr** vorab. `drivers` ist bereits `nullable`, und
   `welle/drivers.ts` behandelt den Fall sauber — die Vorarbeit ist da.
2. Treiber werden über eine **Server Action** nachgeladen, sobald die Welle gehovert oder
   geklickt wird; Vorjahr beim Öffnen des Popups.
3. **Fallstrick, ausdrücklich benannt:** `get_year_deviation_drivers` nimmt **kein**
   `p_user_id`, liest `auth.uid()` selbst und wirft `28000` ohne Session (§6 Stolperfalle
   4). Das Nachladen **muss** deshalb über eine Server Action laufen — ein Aufruf aus dem
   Browser-Client scheitert.

---

### Phase 3 — Der Karten-Lader: eine Anfrage statt 179
**Datenbank: JA — Fähigkeit `db-eingriff`** · Aufwand: mittel · Risiko: mittel
**Ersparnis: 178 Anfragen je Aufbau** — der mit Abstand größte Posten

Heute: `page.tsx:252-256` ruft `isCardActiveInMonth` **einzeln für alle 77 Karten**, um 43
davon wegzuwerfen; `page.tsx:267-277` feuert danach **drei weitere Aufrufe je aktiver
Karte**. Zusammen 179 Anfragen für 17 ms Rechenarbeit. Die 34 Einzelabfragen auf
`card_monthly_states` treffen eine Tabelle mit **26 Zeilen**.

Neue Lese-Funktion:

```
get_cards_for_month(p_user_id uuid, p_month date) returns jsonb
-- je im Monat AKTIVER Karte: id, amount, effective_plan,
--                            manually_paid, adjusted_amount
```

**Die einzige Regel, die zählt:** Sie **ruft** `is_card_active_in_month`,
`calculate_card_amount_for_month` und `get_effective_plan_for_month` auf. Sie baut sie
**nicht** nach. Wer die Prioritätskette nachbaut, wendet den Split-Anteil ein zweites Mal
an — exakt der Fehler, den v2-13 (`BF-4`) behoben hat (§6 Stolperfalle 11 · LL-26).
Anker **A5** ist genau dafür da.

**Bleibt bestehen:** der Stammdaten-Select auf `cards` (`page.tsx:139-146`). `cardNameById`
(`page.tsx:245`) braucht die Namen **auch monats-inaktiver** Karten für die
Badge-Auflösung — der Select darf also nicht auf aktive Karten eingeengt werden.

**Verhaltensänderung, die ausgesprochen gehört:** `isCardActiveInMonth` schluckt heute
bewusst jeden Fehler und liefert `false`, damit eine einzelne Karte nicht den ganzen
Render blockiert (`rpc.ts:91-101`). Gebündelt reißt ein Fehler künftig **alle** Karten mit.
Der Aufruf bekommt deshalb ein eigenes `try/catch` nach dem Muster von `categoryAmounts`
(`page.tsx:183-190`) — fällt er aus, bleibt das Karussell leer statt die Seite zu töten.

---

### Phase 4 — Die Welle: eine Anfrage statt 24
**Datenbank: JA — Fähigkeit `db-eingriff`** · Aufwand: mittel · Risiko: klein bis mittel
**Ersparnis: 23 Anfragen je Aufbau**

```
get_sparrate_series(p_user_id uuid, p_year int) returns jsonb
-- 12 Einträge: { month_index, ist, plan }
```

Ruft `calculate_sparrate_for_month` und `calculate_planned_sparrate_for_month` auf —
wieder: aufrufen, nicht nachbauen. Gemessen kostet die Schleife in der Datenbank
**54,6 ms** für alle 24 Werte.

**Zusätzlich hier:** Der Ring holt heute `calculate_sparrate_for_month` für den
angezeigten Monat ein **zweites Mal** (`page.tsx:97` neben `welle/loader.ts:67`). Nach
dieser Phase liest er den Wert aus der Reihe — zwei Anfragen weniger, und beide Zahlen
stammen garantiert aus derselben Quelle.

---

### Phase 5 — Früher etwas zeigen
**Datenbank: nein** · Aufwand: klein bis mittel · Risiko: klein

Es gibt heute **kein `loading.tsx`, kein `error.tsx`, keine einzige Suspense-Grenze** — der
Aufbau ist alles-oder-nichts.

1. `src/app/loading.tsx` — Kopfzeile und Bühne stehen sofort.
2. Suspense-Grenzen um Welle und Karussell, damit der Ring nicht auf sie wartet.
3. `src/app/error.tsx` — eine überlastete Datenbank zeigt künftig eine eigene Seite mit
   „nochmal versuchen", nicht die Vercel-Fehlerseite.
4. **Region der Vercel-Funktionen** prüfen und auf `fra1` festnageln, falls nicht schon so.
   Die Datenbank liegt in eu-west-1; eine Funktion in Washington würde jede der
   verbleibenden Anfragen um ~90 ms verteuern. *(offene Frage — siehe unten)*

---

## Erwartetes Ergebnis

| | vorher | nachher |
|---|---|---|
| `auth.getUser()` | 1 | 1 |
| Profil + Einkommen | 3 | 3 |
| Ring (Ist/Plan/Split) | 3 | 1 |
| Welle | 37 | 1 |
| Karten-Lader | **179** | **1** |
| Kategorien + Beträge + Stammdaten | 3 | 3 |
| Gehalt + Lösch-Tor | 3 | 3 |
| Schwelle + Fragmente + Zähler | 4 | 4 |
| **Summe** | **233** | **17** |

Dazu eine Netzrunde statt zwei in der Middleware, und ~130 ms statt ~490 ms Rechenzeit.

---

## Prüfschritte

| # | Was | Erwartung | § |
|---|---|---|---|
| **S1** | Anker A1–A5 **vor** dem ersten Eingriff, in derselben Sitzung | Ausgangswerte notiert | §9 |
| **S2** | Anker A1–A5 nach **jeder** Phase, gegen S1 | 0,00 € Bewegung, A5 byte-identisch | §9 |
| **S3** | Übungs-Datenbank-Anker A6 vor und nach Phase 3 und 4 | 2.200,00 € | §9 |
| **S4** | Trockenlauf beider neuer Funktionen (`RAISE`-Rollback) auf der Übungs-DB | Ergebnis stimmt Wert für Wert mit den Einzelaufrufen überein | LL-18 |
| **S5** | **Kartentyp-Probe** — je eine `FIXED_COST`-, `INCOME`- und `BUDGET`-Karte aus `get_cards_for_month` gegen den Einzelaufruf | identisch; `BUDGET` zeigt den Plan, solange Fragmente ≤ Plan; „Realität gewinnt" nur bei `FIXED_COST`/`INCOME` | §4.3.1/2/3 · LL-12 |
| **S6** | **Split-Probe** — eine `GEMEINSAM`-Karte **mit** verknüpftem Fragment | eigener Anteil, genau **einmal** angewandt | §6 Stolperfalle 11 · LL-15 |
| **S7** | Anfragen je Aufbau im Supabase-Log | von 233 auf **≤ 20** | — |
| **S8** | Prüfstrecke: `pnpm build` · `pnpm lint` · `pnpm test:e2e` · `pnpm test:visual` | grün | `sprint-abschluss` |
| **S9** | Middleware-Ausweichpfad: Zeitlimit künstlich auf 1 ms setzen | Umleitung auf `/login`, **kein** 504 | — |
| **S10** | `smoke-agent` — optischer Render-Smoke | unverändertes Bild | Design-Doku |
| **S11** | **Browser-Smoke des Nutzers** — Zahlung ziehen · Monat wechseln · Welle überfahren · Popup öffnen · Karte antippen | fühlt sich sofort an; Tooltip kommt beim ersten Überfahren mit kurzer Verzögerung; Goldlinie im Popup da | §5 · §8 · §9 |

> **S5 und S6 sind der Grund, warum dieser Sprint schiefgehen kann.** Ein Bündel, das die
> §4.3-Fallunterscheidung nicht exakt trifft, sieht in keiner einzigen Zahl offensichtlich
> falsch aus (LL-23). Beide Proben laufen **auf der Übungs-Datenbank** und **vor** dem
> ersten Produktions-Eingriff.

---

## Offene Fragen

1. **In welcher Region laufen die Vercel-Funktionen?** Es gibt weder `vercel.json` noch
   eine Einstellung in `next.config.mjs`. Die Fehler-ID zeigt `fra1`, das ist aber der
   Edge-Standort der Middleware, nicht zwingend der der Funktionen. Muss vor Phase 5 in
   den Vercel-Einstellungen nachgesehen werden — **vom Nutzer**, ich habe dort keinen
   Zugriff.
2. **Wie oft tritt der 504 wirklich auf?** Belegt ist genau ein Fall, dieser dafür
   lückenlos. Wenn er öfter kommt, ändert das nichts an der Reihenfolge — Phase 1 steht
   ohnehin vorn.
3. **Soll `get_cards_for_month` auch die verknüpften Fragmente je Karte mitliefern?**
   **Vorschlag: nein.** Die kommen heute schon gebündelt aus zwei Abfragen
   (`page.tsx:395-409`) — es gäbe keine Anfrage weniger, nur mehr Fläche in einer neuen
   Funktion.
4. **Bleibt es bei „keine Warte-Anzeige"?** Entscheidung ① sagt: erst messen. Falls ein
   Drop nach Phase 4 immer noch spürbar dauert, ist das eine **neue** Gestaltungsfrage für
   `design-direktor` — nicht etwas, das beim Bauen nebenbei entschieden wird.

---

## Nachlauf — eigener kleiner Sprint, nicht dieser

**`auth.uid()` in elf RLS-Regeln wird pro Zeile neu ausgewertet.** Der Supabase-Linter
meldet das als WARN für `profiles`, `income_timeline`, `cards`, `card_planned_timeline`,
`card_monthly_states`, `fragments`, `card_fragment_links`, `deleted_entities`,
`card_categories` und `income_fragment_links`. Die Abhilfe ist mechanisch
(`auth.uid()` → `(select auth.uid())`) und verbilligt **jede** verbleibende Anfrage.

**Warum trotzdem nicht hier:** Es sind Zugriffsregeln auf echte Finanzdaten. Die Änderung
ist semantisch identisch und offiziell so dokumentiert — aber wenn sie doch nicht
identisch ist, ist der Schaden Datensichtbarkeit, nicht Langsamkeit. Das gehört nicht in
einen Sprint, der ohnehin schon zwei Migrationen trägt. Dazu die beiden fehlenden
Fremdschlüssel-Indizes (`card_planned_timeline.user_id`, `fragments.suggested_card_id`).

---

## Was noch in die Roadmap muss

**Performance kommt in `V2/v2_roadmap_konsolidiert.md` bisher nicht vor** — null Treffer
für „Performance", „Ladezeit", „langsam", „Latenz", „Reaktion". Nach der Regel aus
`sprint-start` Phase ② gehört das Thema zuerst dorthin, sonst konkurriert es unsichtbar
mit allem anderen. Vorschlag: ein neues Paket **„Die App reagiert sofort"** mit diesem
Sprint als Inhalt und dem RLS-Nachlauf als zweitem Punkt.
