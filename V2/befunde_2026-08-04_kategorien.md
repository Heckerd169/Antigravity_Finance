# Befunde — Kategorien und Unterkategorien über Karten

> **Was das hier ist:** die Vorab-Risikoanalyse zu der Idee, Karten unter
> Kategorien und Unterkategorien zu gruppieren. Erhoben am **04. August 2026** in
> der Ideen-Runde, **bevor** irgendetwas gebaut oder geschnitten wurde.
>
> **Wie es entstanden ist:** zwei parallele, strikt read-only arbeitende Subagenten
> mit bewusst getrennten Blickwinkeln — einer auf Datenmodell und Rechenwege, einer
> auf Oberfläche, Interaktion und Spezifikation. Dazu eigene Messungen gegen die
> Produktiv-Datenbank (ausschließlich `SELECT`).
>
> **Wofür es da ist:** Die Roadmap trägt Themen, keine Diagnosen (Roadmap §6). Das
> Paket **Kategorien im Karussell** verweist hierher. Ohne dieses Papier stünde dort
> eine Behauptung ohne Beleg.
>
> **Status:** Analyse abgeschlossen. Die Gestaltungsfragen in §6 sind **offen** und
> gehören vor den Schnitt an die Fähigkeit `design-direktor`.

---

## 1. Die Idee und was davon beschlossen ist

**Die Idee (User, 04.08.2026):** Das Karussell wird unübersichtlich. Statt vieler
Einzelkarten soll es Kategorien („Abos") und Unterkategorien („Netflix") geben, denen
Karten zugeordnet werden. Ein Klick auf eine Kategorie soll deren Ausgabenverlauf über
die Zeit zeigen. Die erste Kategorien-Liste entsteht aus drei Monaten Umsätzen; zusätzlich
soll es eine Möglichkeit geben, Kategorien selbst anzulegen.

**In der Ideen-Runde beschlossen:**

| Frage | Beschluss |
|---|---|
| Zwei Wünsche trennen: **(A)** Übersicht im Karussell, **(B)** Ausgabenverlauf | **Ja.** (A) ist der akute Schmerz, (B) die Belohnung. Getrennte Roadmap-Einträge. |
| Trägt eine Kategorie eine Zahl? | **Ja** — und zwar **den Beitrag ihrer Karten zur Sparrate des Monats**, also dieselbe vorzeichenrichtige Summierung, die der Ring ohnehin macht, nur gefiltert. Nicht ein eigener Plan. |
| Kategorie als `cards`-Zeile? | **Verworfen** (Befund D1). |
| Reihenfolge gegenüber der Kuratierung (`DA-2`) | **Davor.** Erst das Cockpit fertig bauen, dann den Marathon laufen. |
| Wer erstellt den initialen Kategorien-Vorschlag? | **Der Arbeits-Agent im Chat**, aus drei Monaten Umsätzen — **nicht** ein Algorithmus in der App. Die App braucht nur Anlegen und Ändern. |

Die Definition der Kategorie-Zahl als *geerbter Sparraten-Beitrag* ist bewusst so
gewählt, dass die Befunde **D2** (Vorzeichen) und **D5** (Partner-Anteil) strukturell
nicht auftreten können, statt sie einzeln behandeln zu müssen.

---

## 2. Eigene Messungen gegen die Produktiv-Datenbank

*Gemessen am 04.08.2026 gegen `nflkobdfdhncrtjncpmq`, ausschließlich lesend.*

### 2.1 Wie groß ist das Karussell wirklich?

| Monat 2026 | Fixkosten | Einnahmen | Budget | **Karussell** |
|---|---|---|---|---|
| Jan–Apr | 14 | 2 | 3 | **19** |
| Mai | 22 | 6 | 3 | **31** |
| Jun | 15 | 3 | 3 | **21** |
| Jul | 23 | 4 | 5 | **32** |
| Aug | 16 | 2 | 3 | **21** |
| Sep–Dez | 15 | 2 | 3 | **20** |

**Der Schmerz ist real.** Grundrauschen ~20 Karten, Spitzen bei 31 und 32. Die Spitzen
gehen auf **Einmal-Karten** zurück: 22 der 46 Karten haben die Frequenz `ONCE` und
erscheinen in genau einem Monat.

### 2.2 Karten-Inventur

46 Karten gesamt, davon 23 laufend (`last_active_month IS NULL`):

| Typ | Attribution | gesamt | laufend |
|---|---|---|---|
| FIXED_COST | ICH | 28 | 13 |
| FIXED_COST | GEMEINSAM | 4 | 4 |
| BUDGET | ICH | 5 | 4 |
| INCOME | ICH | 9 | 2 |

### 2.3 Abdeckung — welcher Anteil der Ausgaben hängt überhaupt an einer Karte?

| Jan | Feb | Mär | Apr | Mai | Jun | Jul |
|---|---|---|---|---|---|---|
| 0,0 % | 0,0 % | 0,0 % | 0,0 % | 0,3 % | 27,8 % | 74,3 % |

Zusätzlich: **965 der 1.548 Fragmente liegen in 2025**, aber
`min(cards.first_active_month) = 2026-01-01`. Für ganz 2025 wäre jede karten-basierte
Kategorie-Kurve konstant **null**, während die Welle dort eine Goldlinie von
**48.445,32 €** zeigt.

**Folge:** Eine Kategorie-Kurve über 2026 bildet heute den **Kurationsfortschritt** ab,
nicht das Ausgabeverhalten. Das ist der Grund, warum **(B)** hinter die Datenbasis
gehört und nicht mit **(A)** zusammen gebaut wird.

---

## 3. Befunde — Datenmodell und Rechenwege

Erhoben gegen `pg_proc.prosrc`, `pg_constraint`, `pg_enum` der Produktiv-Datenbank sowie
gegen `src/lib/rpc.ts`, `src/app/page.tsx` und `supabase/migrations/`.

### D1 · Kategorie als `cards`-Zeile wird sofort doppelt in die Sparrate gerechnet
**Schwere: BLOCKER**
Beide Sparrate-RPCs schleifen über
`SELECT * FROM cards WHERE user_id=… AND first_active_month<=M AND (last_active_month IS NULL OR >=M)`
— **ohne jeden Filter auf `type`** oder ein gedachtes Kategorie-Kennzeichen. Eine
Kategorie-Karte im Karussell würde zusätzlich zu ihren Kindern summiert; der Prüfanker
bricht. Dieselbe ungefilterte Kartenmenge nutzen `get_year_deviation_drivers`
(`JOIN cards c ON c.user_id = v_user_id AND c.first_active_month <= m.month`) und der
Auto-Absorptions-Kandidatenloop in `process_csv_import` (einziger Filter:
`AND c.deleted_at IS NULL`) — Fragmente würden also auch auf Kategorien auto-absorbiert.
**Beleg:** `prosrc` von `calculate_sparrate_for_month`, `calculate_planned_sparrate_for_month`,
`get_year_deviation_drivers`, `process_csv_import` (Prod, gelesen 04.08.2026).
**Warum nicht offensichtlich:** Das Karussell zeigt heute exakt die Zeilenmenge, die die
Sparrate summiert — „eine Karte mehr im Karussell" liest sich als UI-Änderung, ist aber
ein Eingriff in die Rechenfunktion (§7 Regel 20).
→ **Beschluss: Kategorien bekommen eine eigene Tabelle und einen eigenen Anlageweg.**

### D2 · Kategorie-Summe hat kein Vorzeichen; die Gegenposten-Paare im Echtbestand heben sich nicht auf
**Schwere: BLOCKER**
`calculate_card_amount_for_month` liefert per Konstruktion immer ≥ 0; das Vorzeichen
entsteht erst in der Hauptformel §4.2 über den Kartentyp. Der Echtbestand enthält
systematisch thematisch gleichnamige FIXED_COST/INCOME-Paare:

| Ausgabe | Gegenposten |
|---|---|
| `Handyvertrag` 35,00 € | `Handyvertrag - Aline` 11,00 € (INCOME) |
| `iCloud` 9,99 € | `iCloud - Anteil Mama` 7,00 € (INCOME) |
| `Hotel Konfirmation` 310,00 € | `Hotel Konfirmation - Anteil Aline` 155,00 € (INCOME) |
| `Inspektion Auto - Aline` 204,00 € (FIXED_COST) | `Inspektion Auto - Aline` 186,05 € (INCOME) — **gleicher Name, zweimal** |

Eine naive Σ über die Kategorie „Handyvertrag" ergibt **46,00 €** statt der
wirtschaftlich richtigen **24,00 €**.
**Beleg:** `SELECT name, type, attribution, frequency, plan FROM cards` gegen Prod
(46 Karten); `prosrc` `calculate_card_amount_for_month` (alle CASE-Zweige liefern
Beträge ohne Vorzeichen).
**Warum nicht offensichtlich:** Genau diese Paare sind das, was eine namensbasierte
Gruppierung als Erstes zusammenzieht — der Fehler entsteht nicht *trotz*, sondern
*wegen* des Vorschlags-Gedankens.
→ **Durch den Beschluss zur Zahl-Definition (§1) strukturell ausgeschlossen.**

### D3 · Kategorie-Zuordnung als einfache Spalte schreibt Historie rückwirkend um
**Schwere: SCHWER**
`cards.category_id` als Stammdaten-Spalte macht jede Umkategorisierung rückwirkend — der
Kategorie-Verlauf **aller** Vergangenheitsmonate ändert sich. Genau dagegen sind Gehalt
und Karten-Plan als Append-only-Zeitreihen mit Forward-Inheritance gebaut. Die Zuordnung
gehört in dieselbe Klasse, also in `card_category_timeline(card_id, effective_month, category_id)`
mit Composite-Key und UPSERT (§7 Regel 6). Zweiter Haken: die initiale Massenzuordnung
muss ein `effective_month` wählen — `now()` lässt Jan–Jul 2026 „ohne Kategorie",
`first_active_month` schreibt zurück und ist die retroaktive Variante.
**Beleg:** Design-Doku §2.1/§2.2 (Zeilen 66–106), Schema-Doku §3 (Spalte
„Forward-Inheritance? Ja/Nein") und §7.
**Warum nicht offensichtlich:** Die Sparrate selbst bleibt korrekt (sie aggregiert
kategorie-blind über alle Karten) — die Verletzung ist ausschließlich in der neuen Sicht
sichtbar und fällt beim Anker-Test **nicht** auf.
→ **Offene Entscheidung, siehe §6.**

### D4 · Der Kategorie-Verlauf zeigt den Kurationsfortschritt, nicht die Ausgaben
**Schwere: SCHWER**
Siehe Messung §2.3. Zusammen mit Modell α (§2.3 der Design-Doku: Karte ohne Fragment
zählt mit Plan) ist eine Kategorie-Kurve Jan–Apr reiner Plan und Juli reine Realität —
die Kurve steigt, weil zugeordnet wurde, nicht weil ausgegeben wurde.
**Beleg:** `sum(abs(amount)) FILTER (amount<0)` je Monat gegen die Teilmenge mit
`card_fragment_links`; `min(first_active_month)`; `count(*) WHERE transaction_date < '2026-01-01'` = 965.
**Warum nicht offensichtlich:** Die dokumentierte „Sichtbarkeits-Grenze" von B2 ist
bekannt, ihr Ausmaß nicht — 0 % Abdeckung in vier von sieben Monaten macht aus einer
Verlaufsanzeige ein Artefakt.
→ **Grund für die Trennung (A) / (B) und für die Platzierung von (B) hinter der Datenbasis.**

### D5 · Split-Faktor bewegt die Kategorie-Kurve, ohne dass sich die Kategorie ändert
**Schwere: SCHWER**
Wird die Kategorie-Summe als ICH-Anteil gezeigt, wandert sie mit `get_split_factor(M)`:
gemessen 0,58786 (2025-01) → 0,56564 (2025-04) → 0,57209 (2026-01), also **−3,8 %
relativ** an der April-2025-Grenze allein durch die Gehaltszeitreihe der Partnerin. Alle
vier GEMEINSAM-Karten (Miete 1.904, Strom 63, Internet 39,98, Rechtsschutz 27,01) sind
betroffen. Wird stattdessen der 100-%-Wert gezeigt, ist die Kategorie-Summe nicht mehr
mit ihrem Beitrag zum Ring vergleichbar. Verschärft durch den CHECK `budget_never_shared`
(BUDGET nie GEMEINSAM): jede Kategorie, die eine Budget-Karte mit einer geteilten
Fixkosten-Karte zusammenfasst, ist zwangsläufig attributions-gemischt.
**Beleg:** `SELECT get_split_factor(user_id, mo)` über 2025-01…2026-10 gegen Prod;
`pg_constraint` `cards.budget_never_shared`; Design-Doku §4.5.
**Warum nicht offensichtlich:** Der Split wirkt laut §4.5 erst *nach* der
Kartenauflösung — auf Kartenebene ist er unsichtbar und taucht erst auf, wenn man über
Karten aggregiert.
→ **Durch den Beschluss zur Zahl-Definition (§1) strukturell ausgeschlossen.**

### D6 · Kategorie beenden/löschen lässt die Karten in der Sparrate, aber aus der Sicht verschwinden
**Schwere: SCHWER**
Der Präzedenzfall ist eindeutig: `calculate_sparrate_for_month` trägt im Quelltext den
Kommentar „Snapshot-Integrität §2.1: Aggregation IGNORIERT `cards.deleted_at`", und
`is_card_active_in_month` prüft `deleted_at` bewusst nicht. Eine beendete oder gelöschte
Kategorie nach demselben Muster blendet ihre Karten aus, ändert die Sparrate aber nicht.
Solange das Karussell die Karten einzeln zeigt, ist das harmlos; **sobald nur noch
Kategorien im Karussell stehen, hat die verschwundene Karte keine andere Oberfläche
mehr** — der Ring zeigt dann eine Zahl, die kein sichtbares Element erklärt, und
`get_year_deviation_drivers` liefert weiter `card_name` für Karten ohne Ort in der UI.
**Beleg:** `prosrc` `calculate_sparrate_for_month` (Kommentarzeile), `is_card_active_in_month`;
Schema-Doku §6.
**Warum nicht offensichtlich:** Die Regel „Verbergen ändert keine Aggregation" ist
bewusst gesetzt und richtig — sie kippt erst dann in einen Fehler, wenn die Kategorie
die einzige Sichtachse auf die Karte wird.

### D7 · Der Papierkorb kann eine Kategorie nicht tragen: Enum ohne Wert, Cleanup hart auf `'CARD'`
**Schwere: SCHWER**
`deleted_entity_type` hat genau vier Werte `{CARD_END, CARD, CARD_FRAGMENT_LINK, FRAGMENT}`,
und `schedule_deletion(p_entity_type deleted_entity_type, …)` ist darauf typisiert.
`cleanup_expired_card_trash` filtert im WITH-Block hart `AND de.entity_type = 'CARD'` —
eine CATEGORY-Trash-Zeile würde **nie vollzogen und nie entfernt**; `restore_deletion`
verweigert sie nach `expires_at` („bereits abgelaufen"). Ergebnis: eine unsterbliche
Waisenzeile. Eine generische Cleanup-Edge-Function existiert nicht.
**Beleg:** `pg_enum` für `deleted_entity_type`; `prosrc` `cleanup_expired_card_trash`
und `restore_deletion`; `app_config.trash.retention_seconds = 60`.
**Warum nicht offensichtlich:** Über „Kategorien müssen löschbar sein" hinaus ist hier
die **Retention** das Problem — 60 Sekunden reichen nicht, um eine Kaskade über Kinder zu
entscheiden, und ein halb vollzogener Kaskaden-Löschvorgang hat im bestehenden Muster
keinen Rückweg.
→ **Direkte Antwort auf die User-Frage „Was geschieht beim Löschen, wenn noch eine
unbeendete Plankarte enthalten ist?"**

### D8 · Neue Tabelle bekommt RLS an, aber keine Policies — sie wirkt leer statt kaputt
**Schwere: MITTEL**
Der Event-Trigger `rls_auto_enable` führt ausschließlich
`alter table … enable row level security` aus, er legt **keine** Policy an. Eine
`card_categories`-Tabelle ohne explizite Owner-Policies liefert über PostgREST ein stilles
`[]` beim SELECT (kein Fehler) und 42501 beim INSERT. Zusätzlich schluckt der Trigger sein
eigenes Scheitern (`EXCEPTION WHEN OTHERS THEN RAISE LOG`).
**Beleg:** `prosrc` `rls_auto_enable`; Schema-Doku §8.
**Warum nicht offensichtlich:** Die Doku beschreibt den Trigger als Sicherheitsnetz — er
ist eines gegen Datenlecks, erzeugt aber genau die Fehlerklasse, die man beim Testen für
„noch keine Daten angelegt" hält.

### D9 · Der Distiller kann strukturell keine Kategorie vorschlagen
**Schwere: MITTEL**
`calculate_match_confidence` = 0,50·`name_similarity` + 0,30·`amount_match` +
0,20·`frequency_match`. `amount_match` gibt `0.00` zurück, sobald der Plan NULL ist;
`frequency_match` ruft `is_card_active_in_month`, das für eine ID außerhalb von `cards`
`false` liefert. Eine Kategorie hat weder eine `card_planned_timeline`-Zeile noch eine
Frequenz → **maximaler Score 0,50**, also unter `confidence.badge_threshold` (0,60) und
weit unter `confidence.auto_absorption_threshold` (0,95). Die bestehende Pipeline
wiederzuverwenden liefert nicht schlechte, sondern **null** Vorschläge.
**Beleg:** `prosrc` `calculate_match_confidence`, `amount_match`, `frequency_match`;
`app_config`-Schwellen laut Schema-Doku §13.
**Warum nicht offensichtlich:** Der Score sieht wie ein generischer Ähnlichkeits-Score
aus; dass zwei seiner drei Komponenten Kartenattribute voraussetzen, steht nur im
Funktionskörper.
→ **Entschärft durch den Beschluss (§1), dass der initiale Vorschlag im Chat entsteht.**

### D10 · Frequenz-Mischung erzeugt eine phasenverschobene, nicht nur zackige Kurve
**Schwere: MITTEL**
`is_card_active_in_month` verankert QUARTERLY/SEMIANNUAL/ANNUAL am **eigenen**
`first_active_month` jeder Karte (`v_months_diff % 12 = 0`) und liefert außerhalb 0.
Echtbestand: „Reisekrankenversicherung - DKV" ANNUAL first=2026-05, „ADAC
Mitgliedsbeitrag" ANNUAL first=2026-07, „Aline Geburtstag" BUDGET/ANNUAL first=2026-07.
Eine Kategorie „Versicherungen" zeigt 24,80 € im Mai, 99,00 € im Juli und 0 € in den
übrigen zehn Monaten — **die Phase ist pro Karte willkürlich, nicht kalendarisch.**
Verschärft: 22 der 46 Karten sind ONCE (first = last).
**Beleg:** `prosrc` `is_card_active_in_month`; Karten-Inventur gegen Prod.
**Warum nicht offensichtlich:** Man erwartet bei jährlichen Posten eine Jahresspitze —
dass zwei Jahreskarten derselben Kategorie *nie* im selben Monat feuern, folgt erst aus
der karten-individuellen Verankerung.

### D11 · Kategorie als `cards`-Zeile scheitert zusätzlich am DEFERRED-Constraint und an `planned_amount > 0`
**Schwere: MITTEL**
`cards_assert_initial_plan` ist ein `DEFERRABLE INITIALLY DEFERRED` Constraint-Trigger und
verlangt zum Transaktionsende mindestens eine `card_planned_timeline`-Zeile je
`cards`-Zeile. `create_card_direct` lehnt zusätzlich `p_planned_amount <= 0` mit 22023 ab
— eine Kategorie, deren Plan sich aus den Kindern ergibt, kann also nicht mit 0 angelegt
werden, sondern bräuchte einen erfundenen Planwert (der dann nach D1 doppelt zählt).
**Beleg:** `pg_constraint` `cards_assert_initial_plan`, `card_planned_timeline.positive_planned`;
`prosrc` `create_card_direct`.
**Warum nicht offensichtlich:** Der Tabellen-Constraint erlaubt 0, die einzig legale
Anlage-RPC nicht — die beiden Grenzen widersprechen sich, und nur die strengere ist
erreichbar.

### D12 · „Ohne Kategorie" ist ein Dauerzustand, den zwei Erzeugungspfade laufend nachliefern
**Schwere: MITTEL**
`create_card_direct` (7 Parameter) und `create_card_from_fragment` (9 Parameter) sind wegen
des DEFERRED-Constraints der einzige legale Weg, eine Karte anzulegen; **keiner der beiden
kennt eine Kategorie**. Jeder Empty-Slot-Klick und jeder Fragment-Drop erzeugt also eine
kategorielose Karte. Ein `NOT NULL cards.category_id` bräche beide RPC-Signaturen samt
generierter `src/lib/supabase/types.ts`.
**Beleg:** `src/lib/rpc.ts:285-346`; `pg_proc`-Signaturen `create_card_direct`,
`create_card_from_fragment`.
**Warum nicht offensichtlich:** Der Migrationspfad („46 Bestandskarten einmalig zuordnen")
wirkt wie ein einmaliges Backfill — tatsächlich ist der kategorielose Zustand ein
**Zufluss**, kein Restbestand.
→ **„Ohne Kategorie" muss ein erstklassiger Eimer in der Aggregation sein, kein Fehlerzustand.**

### D13 · Die Hierarchie hat keinen Ort für Realität: `UNIQUE(fragment_id)` erlaubt nur eine Ebene
**Schwere: MITTEL**
`card_fragment_links` trägt `UNIQUE (fragment_id)` — ein Fragment hängt an höchstens einer
Karte. Sind Unterkategorie und Kategorie beide Entitäten, kann die Kategorie ihre Realität
nicht aus Links beziehen, sondern nur ableiten. Jede Kategorie-Zahl ist damit ein
abgeleiteter Wert ohne Constraint-Schutz. Zusätzlich rundet `get_year_deviation_drivers`
`delta` **je Karte** auf zwei Nachkommastellen vor dem Ranking, während die Sparrate-RPCs
erst am Ende runden — eine zusätzliche Kategorie-Ebene addiert eine **dritte Rundungsstufe**
auf dieselbe B2-Invariante.
**Beleg:** `pg_constraint` `card_fragment_links_fragment_id_key`; `prosrc`
`get_year_deviation_drivers` gegen `calculate_sparrate_for_month`.
**Warum nicht offensichtlich:** Der UNIQUE-Constraint ist als Doppelverbuchungsschutz
dokumentiert — dass er zugleich die Tiefe der Zuordnungs-Hierarchie auf eins festnagelt,
steht nirgends.

### D14 · Kategorie-Aggregation muss server-seitig laufen; der heutige Client-Pfad fällt in LL-21 und N+1
**Schwere: MITTEL**
Der bestehende Loader lädt Karten ohne Limit und feuert dann **pro Karte drei Aufrufe**
(`isCardActiveInMonth`, `calculateCardAmountForMonth`, `getEffectivePlanForMonth`) — im Code
als „N+1-Pragmatik: bei <20 Karten in V1 akzeptable Latenz" begründet, bei heute **46**
Karten. Ein 12-Monats-Kategorieverlauf sind 162 aktive Karten-Monate; server-seitig in
einem Statement gemessen **40,1 ms** (EXPLAIN ANALYZE, 2.237 shared hits), als einzelne
RPC-Runden **162 Requests**. Zusätzlich holt derselbe Loader `card_fragment_links` ohne
Limit (heute 100 Zeilen, im Juli allein 61 neue) — die 1000-Zeilen-Grenze schneidet die
Lösch-Tor-Vorberechnung irgendwann still ab.
**Beleg:** `src/app/page.tsx:126-138` und `:153-178`;
`EXPLAIN (ANALYZE) SELECT calculate_card_amount_for_month(c.id, m.mo) …` gegen Prod
= 40,088 ms für 162 Zeilen.
**Warum nicht offensichtlich:** Die Rechnung ist server-seitig billig — teuer wird sie erst
durch die Round-Trip-Zahl, und genau die wächst mit der Kategorie-Ebene **multiplikativ**
statt additiv.
→ **Begründet den Beschluss, die Kategorie-Zahl server-seitig zu bilden. Räumt den
bestehenden N+1-Pfad mit auf.**

### D15 · Es gibt keine versionierte Schema-Basis, gegen die eine Kategorie-Migration diffen könnte
**Schwere: GERING**
`supabase/migrations/` enthält nur zwei Patch-Dateien (`20260706_v2_04_mehrkonten_stufe1.sql`,
`20260725_v2_06_b2_treiber.sql`); `supabase/test_projekt/init2_seed.sql` ist 50 Zeilen reine
Daten (0 Treffer für `CREATE TABLE|CREATE OR REPLACE FUNCTION|CREATE POLICY`). Basistabellen,
die v2-05-Lebenszyklus-RPCs und `rls_auto_enable` existieren nur in den beiden lebenden
Datenbanken. Ein Sprint, der `calculate_sparrate_for_month` anfassen muss, hat damit keinen
versionierten Vorzustand — und die Übungs-Datenbank lässt sich aus dem Repo nicht
rekonstruieren, nur aus einem bestehenden Snapshot.
**Beleg:** `git ls-files supabase` (5 Dateien); `wc -l` und `grep -c` auf `init2_seed.sql`.
**Warum nicht offensichtlich:** CLAUDE.md §3 sagt „versionierte Migrationen ab v2-04" — das
stimmt, meint aber **Deltas** ab v2-04, nicht eine reproduzierbare Basis.
→ **Schärft die bestehende Hausaufgabe `J1`.**

---

## 4. Befunde — Oberfläche, Interaktion und Spezifikation

### U1 · Fragment-Drop auf zugeklappte Kategorie hat kein gültiges Ziel
**Schwere: BLOCKER**
Jedes Drop-Ziel ruft heute `linkFragmentToCard(fragmentId, cardId, targetDbMonth)` mit einer
konkreten Karten-ID auf — eine Kategorie hat keine. Verschwinden die Karten hinter
Kategorien, muss der User vor dem Ziehen aufklappen; HTML5-Drag kennt aber keinen
Zustandswechsel während des Ziehens außer Hover-Aufklappen, das nirgends spezifiziert ist.
Damit bricht genau die Schleife, die die Kuratierung (`DA-2`) voraussetzt.
**Beleg:** `src/components/interaction-zone/drop-target-wrapper.tsx:81`; Design-Doku §8
„Karussell"; CLAUDE.md §7 Regel 3.
**Warum nicht offensichtlich:** Die Hierarchie sieht wie ein reines Anzeige-Thema aus,
hängt aber am **einzigen Schreibpfad der Kuratierung**.

### U2 · Zweite Navigationsebene widerspricht der Verfassung wörtlich
**Schwere: BLOCKER**
§1 legt fest „Ein Screen, ein Monat, eine primäre Zahl. Keine Tab-Navigation, keine
separaten Screens"; §8 verbietet ausdrücklich „Keine zwei Karussell-Reihen" und §7 „Ein
gemeinsames Karussell, keine getrennten Reihen". Eine navigierbare
Kategorie-/Unterkategorie-Ebene ist entweder eine zweite Reihe oder eine
Drill-In-Navigation — beides ist heute **normativ ausgeschlossen**.
**Beleg:** `antigravity_finance_design_dokument.md:48, :571, :804`.
**Warum nicht offensichtlich:** Die drei Verbote stehen an drei verschiedenen Stellen und
keines nennt das Wort „Hierarchie".
→ **Gestaltungsfrage 1 in §6. Ohne Beschluss und Doku-Patch kein Bauauftrag.**

### U3 · Klick ist auf Karten bereits der Tap — Verlauf-Klick doppelt belegt
**Schwere: SCHWER**
Über jeder tappbaren Karte liegt ein **unsichtbarer Vollflächen-Button**, der den Zustand
umschaltet (Bezahlt / Erhalten / Abgeschlossen). Wenn „Klick auf Kategorie" den Verlauf
öffnet, bedeutet dieselbe Geste auf Ebene 1 „Verlauf zeigen" und auf Ebene 2 „bezahlt
markieren" — im selben Karussell, ohne visuellen Unterschied. **Fehl-Taps schreiben
`manually_paid` und bewegen die Sparrate.**
**Beleg:** `src/components/cards/card-interactive.tsx:169-175`; Design-Doku §7
„Interaktion: Tap → Bezahlt".
**Warum nicht offensichtlich:** Der Tap-Catcher ist im DOM unsichtbar und taucht in keiner
Zustands-Tabelle als „Klickfläche" auf.

### U4 · Beide Karten-Anlagewege kennen kein Kategorie-Feld
**Schwere: SCHWER**
`RecurrencePopup` (Drop auf leeren Slot) und `DirectCreateOverlay` (Direktklick) erzeugen
Karten mit Name/Typ/Frequenz/Attribution — kein Kategorie-Feld. Zeigt das Karussell nur noch
Kategorien, ist jede so erzeugte Karte **unmittelbar nach dem Anlegen unsichtbar, ohne
Fehlermeldung**. Der leere Slot ist zugleich der einzige Einstiegspunkt für neue Karten.
**Beleg:** `recurrence-popup.tsx:75-84`; `direct-create-overlay.tsx:72-79`;
`carousel.tsx:115-119`; Design-Doku §8:774-782.
**Warum nicht offensichtlich:** Der Verlust ist rein visuell — die Karte existiert, rechnet
in der Sparrate mit und fehlt nur auf der Fläche.

### U5 · Drei konkurrierende Verlaufs-Oberflächen, eine davon per Doku exklusiv
**Schwere: SCHWER**
§9 erklärt das Welle-Popup zur „**einzigen** Heimat der kumulierten Treppe" und schließt
„keine kumulierte Sicht außerhalb des Popups" aus. Daneben liegt `M7` („Verlauf" im
Karten-Kontextmenü, als „gut isolierbar" eingestuft) und nun ein dritter Kategorie-Verlauf.
Wird die Hierarchie zuerst gebaut, ist `M7` **nicht mehr isolierbar**, sondern muss
zweistufig oder generisch neu geschnitten werden.
**Beleg:** `antigravity_finance_design_dokument.md:816, :866`; Roadmap.
**Warum nicht offensichtlich:** Die Exklusivitäts-Aussage steht in der Funktions-Einleitung
von §9, nicht in einer Verbotsliste.
→ **Beschluss: `KAT-4` und `M7` werden im selben Paket geführt („Verlauf").**

### U6 · „Kategorie" ist im Vokabular bereits belegt, §12 kennt kein Kategorie-Wort
**Schwere: SCHWER**
Der Begriff bezeichnet heute das KI-Vorschlags-Badge auf Fragment-Karten
(„Kategorie-Badge", §11) und in der Roadmap die geplante Funktion `F2`
„Kategorie-Vorhersage pro Nutzer" (unter `M6`). Der neue Gruppierungsbegriff kollidiert
damit direkt. Gleichzeitig enthält §12 („Vollständige Textreferenz") **keine einzige Zeile**
für Kategorie-Label, leere Kategorie, Kategorie-Status, Anlege-Dialog, Beenden-/Lösch-Toast
oder Verlaufs-Titel.
**Beleg:** `antigravity_finance_design_dokument.md:1096, :1116-1117, :1137`; Roadmap `M6`.
**Warum nicht offensichtlich:** §11 nennt „Kategorie-Badge" als Feldnamen in einer Tabelle,
nicht als reservierten Begriff.

### U7 · KI-Kategorie-Vorschlag baut das gerade gestrichene Vorschlags-Kästchen wieder auf — auf 136 px
**Schwere: SCHWER**
`BF-1` ist entschieden: alle KI-Vorschlags-Kästchen entfallen aus der Anzeige, weil ein
`flex-shrink: 0; white-space: nowrap`-Badge neben dem Betrag in einer 220-px-Spalte den
Betrag umbrechen ließ. Ein Kategorie-Vorschlag als Marker auf einer Karte erzeugt dieselbe
Geometrie — bei **136 px Kartenbreite** (`flex: 0 0 136px`), also strikt enger als der
bereits gebrochene Fall. Zusätzlich beansprucht `RM-2` das Fragment-Popup als neue Heimat
des KI-Vorschlags; zwei Heimaten sind eine zu viel.
**Beleg:** `V2/befunde_2026-08-04_fehler_und_entscheidungen.md:55-59, :65-74`;
`interaction-zone.module.css:352-353, :581-596`.
**Warum nicht offensichtlich:** `BF-1` wird als Bugfix geführt; dass er eine **Anzeige-Klasse
dauerhaft schließt**, steht nur im Entscheidungs-Absatz.
→ **Entschärft durch den Beschluss (§1), dass der initiale Vorschlag im Chat entsteht.**

### U8 · Auto-Absorption verliert ihren einzigen Rückkanal
**Schwere: SCHWER**
Ab Konfidenz > 0,95 ordnet der Distiller lautlos zu; die einzige Rückmeldung ist, dass die
Karte im Karussell grün wird — ohne Toast, ohne Badge, ohne Unterschied zu „manuell
bezahlt". Sitzt die Karte hinter einer zugeklappten Kategorie, ist diese Rückmeldung weg,
solange die Kategorie keinen aggregierten Zustand zeigt (siehe U12). Das Prinzip „Lautlose
Intelligenz" wird damit von **leise zu unsichtbar**.
**Beleg:** `antigravity_finance_design_dokument.md:56, :591, :1051`.
**Warum nicht offensichtlich:** Das Feedback ist eine Nebenwirkung des Karten-Renderings,
nirgends als Rückmeldekanal spezifiziert.

### U9 · „Alle Verknüpfungen lösen" auf Kategorie-Ebene wäre undo-lose Massenaktion
**Schwere: SCHWER**
Der Menüpunkt wirkt heute pro Karte über **alle** Monate; das Lösen selbst hat **keinen
Papierkorb** („sofortige Wirkung, kein Toast") — anders als Beenden/Löschen mit 5-s-Undo und
60-s-Aufbewahrung. Propagiert das Verb auf die Kategorie, löst eine Bestätigung sämtliche
Fragmente sämtlicher enthaltener Karten über sämtliche Monate, und jede betroffene
Monats-Sparrate fällt auf den Plan zurück. Kein Rückweg außer erneutem Zuordnen von Hand.
**Beleg:** `antigravity_finance_design_dokument.md:707-709, :791`.
**Warum nicht offensichtlich:** Die Asymmetrie „Karten-Verben haben Papierkorb, Lösen nicht"
steht an zwei getrennten Stellen in §7 und §8.

### U10 · Aufklapp-Zustand über den Monatswechsel ist unentschieden und kann ins Leere führen
**Schwere: MITTEL**
Soft-Navigation zwischen Monaten un-mountet die Client-Komponenten nicht; das Karussell setzt
Overlays deshalb explizit auf `targetMonth` zurück, während der Übertrags-Schalter bewusst
überlebt. Für den Drill-In gibt es **kein Präjudiz**. Zugleich wird die Kartenmenge pro Monat
über `isCardActiveInMonth` gefiltert — eine im August geöffnete Kategorie kann im September
leer sein, und der Weg zurück existiert heute nicht.
**Beleg:** `carousel.tsx:46-50`; `fragment-stack.tsx:20-28`; `src/app/page.tsx:153-158`;
CLAUDE.md §7 (LL-5).
**Warum nicht offensichtlich:** Die App hat für beide Lesarten je einen Präzedenzfall, und
beide sind ausdrücklich begründet.

### U11 · `M5` wird Voraussetzung statt hinfällig; gemischte Typen brechen die Farbsprache
**Schwere: MITTEL**
Die Sortierung Fixkosten → Einnahmen → Budget ist heute die einzige Ordnung und steht als
offener DD-Punkt (`M5`, 🔎). Unter Kategorien ist die Typ-Ordnung **innerhalb** einer
Kategorie undefiniert — und eine Kategorie wie „Abos" kann erstmals Karten verschiedener
Typen enthalten, deren Zustands-Farbsprache (rot-getönt / teal / Fortschrittsbalken) bisher
nie nebeneinander stand.
**Beleg:** `src/app/page.tsx:209-214`; `antigravity_finance_design_dokument.md:571`;
Roadmap `M5`; `design-system/README.md:45-46`.
**Warum nicht offensichtlich:** Naheliegend wäre die Annahme, Kategorien würden die
Sortierfrage **ersetzen** — sie verschieben sie nur eine Ebene tiefer und mischen dabei
erstmals Typen.

### U12 · Kategorie hat kein Zustandsmodell für Forecast, Vergangenheit und Mischzustände
**Schwere: MITTEL**
Jeder Kartentyp hat 2–4 spezifizierte Zustände plus Ghost-Variante, inklusive einer eigenen
Vergangenheits-Regel für Budget (kein Tap, keine Fragmente → Ghost). Für eine Kategorie ist
**nichts davon definiert**: Wie sieht sie im Zukunftsmonat aus, wenn alle Kinder Ghost sind?
Wie bei drei bezahlten und zwei offenen Kindern? §7 Regel 3 macht das zum **Halt-Kriterium**,
nicht zum Detail.
**Beleg:** `src/components/cards/card.tsx:86-114`; Design-Doku §7; CLAUDE.md §7 Regel 3.
**Warum nicht offensichtlich:** Der Ghost-Zustand wirkt wie reine Darstellung, entscheidet
aber zugleich über Tap-Fähigkeit, Drop-Fähigkeit und Menü-Umfang.

### U13 · Lösch-Tor-Sprache ist karten-spezifisch; beendete Kategorie muss in der Vergangenheit sichtbar bleiben
**Schwere: MITTEL**
Der ausgegraute Lösch-Menüpunkt zeigt Klartext-Gründe aus genau drei Codes
(`HAS_LINKS` / `HAS_STATES` / `HAS_PAST_PLAN`); „enthält eine noch nicht beendete Karte" wäre
ein **vierter ohne Text und ohne §12-Copy**. Und weil „Beenden" bei Karten über
`last_active_month` läuft und die Karte in der Vergangenheit stehen lässt, muss eine beendete
Kategorie in vergangenen Monaten **weiter erscheinen** — sonst verliert die Vergangenheit ihre
Karussell-Struktur und die Rückwärts-Kuratierung wird unmöglich.
**Beleg:** `card-interactive.tsx:19-23, :239-254`; `src/app/page.tsx:192-204`;
`antigravity_finance_design_dokument.md:699-709`, §12.5.
**Warum nicht offensichtlich:** Dass „löschbar/beendbar" bekannt ist, verdeckt, dass die
**Begründungs-Sprache** und die **Vergangenheits-Sichtbarkeit** eigene, unbeantwortete Fragen
sind.

### U14 · Einstellungs-Oberfläche setzt `D3` voraus und widerspricht §10 wörtlich
**Schwere: MITTEL**
§10 schließt einen separaten Einstellungsscreen ausdrücklich aus; die Roadmap führt `D3`
(„Settings-Bereich allgemein, Routing und Layout") als offen und ohne jede inhaltliche
Festlegung. Die geforderte Oberfläche zum Anlegen von Kategorien ist damit **kein Anhängsel**,
sondern zieht `D3` samt Routing-Entscheidung als Vorbedingung nach — und die
Routing-Entscheidung ist wiederum dieselbe Frage wie U2.
**Beleg:** `antigravity_finance_design_dokument.md:966`; Roadmap `D3`.
**Warum nicht offensichtlich:** „Einstellungs-Oberfläche" klingt nach kleinem Formular; sie
ist der **erste Screen der App, der nicht das Dashboard ist**.

### U15 · Verbleibende Aufklapp-Gesten sind sämtlich belegt, Hover-Aufklappen ist das LL-6-Anti-Muster
**Schwere: GERING**
Touch-Gesten, Swipe und Long-Press sind verboten; Klick ist durch den Tap belegt (U3), Hover
ist durch das Einblenden des ⋯-Kontext-Icons belegt. Übrig bleibt Hover-Aufklappen — genau die
Kopplung von Sichtbarkeit an Eltern-Hover, vor der LL-6 wegen „Phantom-Sichtbarkeit" warnt.
**Beleg:** `antigravity_finance_design_dokument.md:58, :677, :803`; CLAUDE.md §7 (LL-6).
**Warum nicht offensichtlich:** Jede der drei Belegungen ist für sich harmlos; erst zusammen
lassen sie **keine freie Geste** übrig.

---

## 5. Was daraus für die Roadmap folgt

| Folgerung | Wo sie hinwirkt |
|---|---|
| Kategorien bekommen eine **eigene Tabelle**, keine `cards`-Zeile | `KAT-1` |
| Die Kategorie-Zahl ist der **geerbte Sparraten-Beitrag**, server-seitig gebildet | `KAT-3`; schließt D2 und D5 strukturell aus; räumt D14 mit auf |
| Der **Verlauf** wandert hinter die Datenbasis und wird mit `M7` zusammengelegt | `KAT-4` im Paket „Verlauf"; löst U5 |
| **`M5` ist Voraussetzung**, nicht hinfällig | Paket Gestaltungs-Feinschliff, vorgelagert |
| `D3` wird Vorbedingung, **falls** die Anlage über einen Einstellungs-Screen läuft | offene Gestaltungsfrage 3 |
| Der **Papierkorb** braucht einen neuen Entitätstyp und eine längere Aufbewahrung | `KAT-1`; berührt `G1` (Lebenszyklus-Rest) |
| **§12 UI-Copy** braucht einen kompletten neuen Abschnitt | Doku-Patch im Sprint |
| Ohne versionierte Schema-Basis ist ein Eingriff in die Rechenfunktion schlecht abgesichert | schärft Hausaufgabe `J1` |

---

## 6. Offene Gestaltungsfragen

**Vor dem Schnitt an die Fähigkeit `design-direktor`. Keine davon wird nebenbei entschieden.**

1. **Die Verfassungsfrage.** Eine zweite Ebene widerspricht §1, §7 und §8 wörtlich
   (U2). Entweder wird die Verfassung bewusst geändert — mit Doku-Patch — oder die
   Gruppierung muss ohne Navigationsebene auskommen.
2. **Die Aufklapp-Geste.** Klick ist durch „bezahlt" belegt (U3), Hover ist das
   LL-6-Anti-Muster (U15), Touch ist verboten. Es ist **keine freie Geste übrig**.
3. **Wo wird eine Kategorie angelegt?** Im Karussell wie eine Karte — oder in einem
   Einstellungs-Bereich? Letzteres zieht `D3` nach und widerspricht §10 (U14).
4. **Wie sieht eine Kategorie aus**, wenn ihre Kinder gemischte Zustände haben, im
   Zukunftsmonat, in der Vergangenheit (U12)? Das entscheidet zugleich über Tap-,
   Drop- und Menü-Fähigkeit.
5. **Ist die Kategorie-Zuordnung zeitpunktbezogen?** Eine einfache Spalte schreibt
   Historie rückwirkend um (D3); eine Zeitreihe mit `effective_month` folgt dem
   bestehenden Forward-Inheritance-Muster, kostet aber eine Tabelle mehr.
6. **Das Wort „Kategorie" ist belegt** (U6). Entweder wird der bestehende Gebrauch
   umbenannt oder der neue Begriff heißt anders.

---

*Befunde · Antigravity Finance · erhoben am 04. August 2026 in der Ideen-Runde ·
zwei parallele read-only-Subagenten plus eigene Messungen gegen die Produktiv-Datenbank*
