# Antigravity Finance 1.0 — Schema-Zusammenfassung

**Version:** 3.13.0
**Status:** Datenbankseitig vollständig implementiert (Sprint 0–9 + Pre-Sprint-10-Patches + Sprint v2-04 Mehrkonten Stufe 1 + Sprint v2-05 Karten-Lebenszyklus + Sprint v2-06 B2-Treiber + Sprint v2-11 Vorzeichen-Korrektur + Sprint v2-17 Kategorien + Sprint v2-21 Zuordnung + Sprint v2-22 Treiber-Rundung + Sprint v2-24 gebündelte Lese-Funktionen + Sprint v2-25 Löschriegel und „nicht angefallen" + Sprint v2-28 Händler-Regel)

> **Changelog v3.13.0 (24.08.2026, Sprint v2-28):** Eine neue Funktion, drei
> `app_config`-Schlüssel in der Tabelle, eine erweiterte Funktion. **Kein
> Schema-Eingriff** — keine Tabelle, keine Spalte, kein Constraint, und die neun
> Rechenfunktionen sind byte-identisch geblieben.
>
> **§4 — `merchant_rule_match` (neu)** und die zweite Untergrenze in
> `calculate_match_confidence`. Der Mechanismus ist derselbe wie bei der Wiedererkennung
> aus v2-21; der Unterschied ist ein einziger Zahlenwert: **0,96 statt 0,94**, also
> **über** statt **unter** der Auto-Schwelle. Genau daran hängt, ob eine erkannte
> Zahlung vorgeschlagen oder verlinkt wird — und weil die Schwelle in `app_config`
> steht, war an `process_csv_import` nichts zu ändern.
>
> **§13 — `matching.merchant_rules` und `confidence.merchant_rule_score` neu**; dazu
> `confidence.history_score`, der seit v2-21 in der Datenbank steht und in dieser
> Tabelle **fehlte** (§4 nannte ihn, §13 nicht — gemessen gegen `app_config` am
> 24.08.2026: sieben von acht Schlüsseln waren geführt).
>
> **Der Satz, der den Sprint überlebt:** Die Nachverlink-Migration wählt über
> `calculate_match_confidence(...) >= Schwelle` aus und **nicht** über eine zweite
> Wortliste. Eine zweite Formulierung derselben Regel ist die Form „Nachbauen" aus
> LL-26 — dieselbe, die in v2-20 das Lösch-Tor streng hielt, während die Datenbank
> längst großzügiger war.

> **Changelog v3.12.0 (18.08.2026, Sprint v2-26):** Eine geänderte und eine neue
> Funktion, **keine neue Tabelle, keine neue Spalte** — und **keine Zahl bewegt** (alle
> vier Rechenfunktionen byte-identisch, Prüfsummen vorher/nachher; ebenso `delete_card`,
> `restore_card` und `toggle_card_manually_paid`).
>
> **`card_delete_gate`** — `HAS_STATES` zählt nur noch Zustände, die etwas **aussagen**.
> Eine Zeile mit `manually_paid = false` und `adjusted_amount IS NULL` ist der Rückstand
> eines zurückgenommenen Tap; sie trug keine Historie, sperrte aber dauerhaft. Real
> passiert am 18.08.2026 an `Privathaftpflicht`, unmittelbar nachdem v2-25 den
> Vergangenheits-Riegel entfernt hatte — **die zweite Sperre wurde erst sichtbar, als
> die erste fiel.**
>
> **`set_card_frequency`** — neu. Die Frequenz war bis dahin nach dem Anlegen endgültig.
>
> **Der Wortgleichheits-Beleg trägt diesmal:** Übungs-Datenbank und Produktion tragen
> byte-identische Prüfsummen (`card_delete_gate` `23147023…`, `set_card_frequency`
> `d9c7d789…`). In v2-25 war das nicht der Fall, weil dort eine gekürzte Kommentar-Fassung
> geprobt wurde — die Lehre daraus ist hier angewandt.

> **Changelog v3.11.0 (17.08.2026, Sprint v2-25):** Drei geänderte Funktionen, **keine
> neue Tabelle, keine neue Spalte** — und **keine Zahl bewegt** (die vier
> Rechenfunktionen sind byte-identisch geblieben, Prüfsummen vorher/nachher).
>
> **`card_delete_gate`** — `HAS_PAST_PLAN` ist **kein Sperrgrund mehr**. Es bleiben
> `HAS_LINKS` und `HAS_STATES`. Gemessen am 17.08.2026: mit dem Riegel waren **0 von
> 82** Karten löschbar, ohne ihn **3**.
>
> **`delete_card`** — neue Signatur `(p_card_id, p_year default null)`, alte
> Ein-Parameter-Form **gedroppt**. Gibt zusätzlich `sparrate_effect` zurück und misst
> es, indem sie `calculate_sparrate_for_month` **zweimal aufruft** (vor und nach dem
> eigenen UPDATE, in derselben Transaktion).
>
> **`toggle_card_manually_paid`** — löscht eine Anpassung von **genau 0**, wenn das
> Häkchen gesetzt wird. Nur die 0, nur beim Setzen.
>
> **Die §2.1-Begründung in §7 ist damit überholt** und dort ausdrücklich als solche
> markiert — nicht gelöscht: Der Satz *„`card_delete_gate` lässt keine Karte mit
> Vergangenheit löschen"* war jahrelang richtig und ist es seit v2-25 nicht mehr.
**Datum:** 17. August 2026

> **Changelog v3.10.0 (17.08.2026, Sprint v2-24 · `PF-1` `PF-2`):** **Zwei neue
> LESENDE Funktionen**, die je einen N+1-Fächer des Frontends zu einer Netzrunde
> bündeln — `get_cards_for_month` (179 → 1) und `get_sparrate_series` (24 → 1).
>
> **Beide RUFEN die bestehenden Rechenfunktionen AUF und bauen sie nicht nach.** Das
> ist die ganze Sicherheit des Eingriffs, und es ist belegt statt zugesichert: Die
> Prüfsummen `md5(pg_get_functiondef(...))` aller **neun** Rechenfunktionen sind vor
> und nach beiden Migrationen **byte-identisch** (9/0). Ein Nachbau der
> Prioritätskette hätte den Split-Anteil ein zweites Mal angewandt (CLAUDE.md §6
> Stolperfalle 11, der Fehler aus v2-13) — und keine Zahl hätte falsch ausgesehen.
>
> **`get_sparrate_series` enthält bewusst kein `sum()` und kein `round()`.** Beide
> Sparrate-Funktionen runden einmal ganz am Ende über alles; eine Summierung hier wäre
> eine zweite Rundungsstelle und hätte die Sparrate um Cent-Beträge verschoben (LL-25).
> Die Kumulation der Welle bleibt deshalb im Frontend.
>
> **Keine Schema-Änderung** — keine Tabelle, keine Spalte, kein Constraint, kein
> Trigger. Die Sparrate bewegt sich in keinem der zwölf Monate; beide Invarianten
> gelten exakt. Protokoll: `sprints/sprint_v2-24_anker.md`.
>
> **§4 ändert seine Grundaussage:** Fünf Funktionen, die dort unter „Im Hot-Path (bei
> jedem Render)" stehen, werden vom Frontend **nicht mehr direkt** gerufen — sie laufen
> jetzt innerhalb der beiden Bündel. Der Abschnitt ist entsprechend gekennzeichnet.
> Minor-Bump und nicht Patch-Bump genau deswegen: Es kommen nicht nur zwei Funktionen
> dazu, es verschiebt sich auch, wer wen ruft.

> **Changelog v3.9.0 (15.08.2026, Sprint v2-22 · `B2-R`):** `get_year_deviation_drivers`
> rundet **nicht mehr je Zeile**. Sie holt das Ziel aus den Sparrate-Funktionen und
> legt den Rest auf die betragsgrößte Kartenzeile — dieselbe Abhilfe wie bei den
> Kategorien in v2-17 (LL-25), eine Ebene tiefer. Damit gilt `Σ delta = Ist − Plan`
> in **allen zwölf** Monaten exakt; vorher lagen Juli und August je einen Cent daneben.
>
> **Zwei Vermutungen sind dabei widerlegt worden.** Das separat gerundete
> Gehalts-Delta trägt **nichts** bei (es ist exakt). Und die verursachenden Karten
> sind **gar nicht sichtbar**: Ein Delta von 0,0022 € rundet auf 0,00 und wird von
> `WHERE delta <> 0` gefiltert — es steht in keiner Anzeige, verschiebt aber die Summe.
>
> **Keine Schema-Änderung, keine neue Funktion** — eine Auswertungs-Funktion ersetzt.
> Die Sparrate bewegt sich in keinem der zwölf Monate.

> **Changelog v3.8.0 (15.08.2026, Sprint v2-21 · `M6`):** Die automatische Zuordnung
> rechnet nach und trifft öfter. **Zwei neue Sub-Score-Funktionen** —
> `name_similarity_scoped` (wortweise, umlautfest, mit Entwertung mehrdeutiger
> Kartenwörter) und `history_match` (Wiedererkennung aus den eigenen
> Handzuordnungen). **Eine neue mutierende RPC** `refresh_fragment_suggestions`,
> die Vorschläge für alte Zahlungen nachrechnet und dabei **niemals verlinkt** —
> erzwungen über einen Zähler-Wächter auf `card_fragment_links`.
> **Neuer `app_config`-Schlüssel** `confidence.history_score` (0,94).
>
> Der Befund dahinter: `calculate_match_confidence` lief ausschließlich beim
> Einfügen, weshalb 1.567 von 1.590 Zahlungen gar keinen Konfidenzwert trugen.
> Gemessen an 101 Handzuordnungen aus Juli/August stieg die Zahl richtiger
> Vorschläge über der Badge-Schwelle von **14 auf 42**, die Zahl falscher von
> 1 auf 4. Für den Nutzer: von 9 auf 115 sichtbare Vorschläge bei 283 offenen
> Zahlungen in 2026.
>
> **Ohne Schema-Änderung an Tabellen** — nur Funktionen und ein Konfigurationswert.
> Die Sparrate bewegt sich in keinem der zwölf Monate.

> **Changelog v3.5.0 (08.08.2026, Sprint v2-17 · `KAT-1` + `KAT-3`):** **Neue Tabelle
> `card_categories`** (`id`, `user_id`, `name`, `sort_order smallint`, Zeitstempel) mit
> UNIQUE-Index auf `(user_id, lower(name))` und eigener Owner-Policy — **von Hand
> angelegt**, denn der Event-Trigger `rls_auto_enable` schaltet RLS ein, legt aber
> **keine** Policy an und schluckt sein eigenes Scheitern (Befund `D8`). `cards`
> bekommt **`category_id uuid NULL`** mit `ON DELETE SET NULL`: Eine gelöschte
> Kategorie nimmt ihre Karten **nicht** mit, sie werden kategorielos.
>
> **Fünf neue Lebenszyklus-RPCs** (`set_card_category`, `create_category_for_card`,
> `rename_card_category`, `delete_card_category`, `restore_card_category`) und **eine
> neue Lese-RPC** `get_category_amounts_for_month(p_user_id, p_month)`.
>
> **Kein Papierkorb-Eintrag für Kategorien.** `deleted_entity_type` hat vier Werte,
> `cleanup_expired_card_trash` filtert hart auf `'CARD'`, und 60 s Aufbewahrung reichen
> nicht — eine CATEGORY-Zeile in `deleted_entities` wäre nie vollzogen und nie entfernt
> worden (Befund `D7`). `delete_card_category` löscht deshalb **hart** und gibt den
> Wiederherstellungs-Bausatz zurück; die Rücknahme läuft über den 5-Sekunden-Toast.
> Damit war weder ein neuer Enum-Wert noch eine längere Retention nötig.
>
> **KEINE Rechenfunktion berührt.** `calculate_card_amount_for_month`,
> `calculate_sparrate_for_month`, `calculate_planned_sparrate_for_month` und
> `get_year_deviation_drivers` tragen nach der Migration **byte-identische
> Prüfsummen** wie vorher (`md5(pg_get_functiondef(...))`, gegen Übungs- und
> Produktiv-Datenbank verglichen). Alle zwölf Monate 2026 um **0,00 €** bewegt,
> B2-Invariante 12/12.
>
> **Zusätzlich: erstmals eine versionierte Schema-Basis** unter
> `supabase/migrations/00000000000000_baseline_stand_v2_16.sql` — der vollständige
> Struktur-Stand aus dem `pg_catalog` von Produktion (Hausaufgabe `J1`, Befund `D15`).
> Bis dahin existierten die Basistabellen und die Sprints 5–8 nur in den beiden
> lebenden Datenbanken.

> **Changelog v3.4.4 (06.08.2026, Sprint v2-14 · `LQ-1`):** `cards` bekommt **`due_day smallint NULL`** (CHECK `1..31`) — den Tag im Monat, an dem die Karte fällig ist. Damit wird die Frage „was steht bis zum Stichtag noch aus?“ überhaupt formulierbar; bis dahin legten Frequenz und erster aktiver Monat nur den *Monat* fest (Befund `L2`). `NULL` bedeutet „kein Termin“ und ist der richtige Wert für **BUDGET**-Karten (Befund `L7`) und für Karten ohne Historie. Gespeichert wird der **Soll-Tag**, nicht der reale Buchungstag — Daueraufträge zum Ersten rutschen auf den nächsten Bankarbeitstag. Die 17 Startwerte sind aus `fragments` abgeleitet, nicht geschätzt. Migration: `supabase/migrations/20260806_v2_14_lq1_faelligkeitstag.sql`. **Keine Rechenfunktion berührt** — alle zwölf Monate 2026 vor und nach der Anwendung identisch, B2-Invariante 12/12.

> **Changelog v3.4.3 (05.08.2026, Sprint v2-13 · `BF-4`):** §4 — die **Split-Logik wandert in `calculate_card_amount_for_month`**. Sie wird dort auf Plan/Anpassung angewandt, **nicht** auf Fragment-Summen (Beschluss `E1`: eine zugeordnete Zahlung *ist* bereits der eigene Anteil). `calculate_sparrate_for_month` wendet den Anteil dadurch **nicht mehr selbst** an — die doppelte Anwendung war der Fehler `BF-4` (Miete: 623,17 € statt 1.089,26 €, rund 466 €/Monat zu gut). `calculate_planned_sparrate_for_month` bleibt **unverändert** (rechnet auf dem Roh-Plan). `get_year_deviation_drivers`: `delta = vorzeichen × (ist − plan × anteil)` — der Anteil steht jetzt **innen** am Plan-Teil, weil die Klammer gemischt ist. Alle vier Funktionen in **einer** Migration `supabase/migrations/20260805_v2_13_bf4_gemeinsame_karten.sql`, weil ein Zwischenzustand doppelt anteilig gerechnet hätte. §3 Wahrheitsquellen nachgezogen.

> **Changelog v3.4.2 (05.08.2026, Sprint v2-11):** §4 `calculate_card_amount_for_month` — Rückgabewert ist nicht mehr „immer ≥ 0". Die Fragment-Aggregation verrechnet seit `BF-5` vorzeichenrichtig (`SUM(f.amount)` statt `SUM(ABS(f.amount))`); übersteigen die Gutschriften die Ausgaben, ist das Ergebnis negativ (Beschluss `E2` — keine Kappung). Migration: `supabase/migrations/20260805_v2_11_bf5_vorzeichen.sql` — **am 05.08.2026 nach Freigabe auf Produktion angewendet**; Juli-Ist −1.222,75 → −322,75 € (exakt +900,00), alle übrigen elf Monate unverändert, B2-Invariante in allen zwölf Monaten gehalten.
**Datei-Konvention (23.07.2026):** Stabiler Dateiname `antigravity_finance_schema_summary.md` — Version nur noch im Header.
**Iterationen bis hierher:** Phase 1 (4 Iterationen Logik-Klärung) + Phase 2 (9 Migrations-Blöcke) + Phase 3 (Sprint 0–8 mit 6 weiteren RPC-/Spalten-Erweiterungen)
**Referenz-Dokument für Frontend- und Distiller-Phase**

**Änderungen ggü. v2 (Phase-3-Delta):**

- `fragments`: +3 Spalten — `confidence numeric NULL`, `suggested_card_id uuid NULL`, `imported_at timestamptz NOT NULL`
- `cards`: +1 Spalte — `deleted_at timestamptz NULL` (Soft-Delete-Marker)
- `card_monthly_states`: +2 Spalten — `adjustment_scope text` (default `'THIS_MONTH'`, Werte `THIS_MONTH | FORWARD`), `closed_at timestamptz NULL` (in v2 reserviert, in v3 erstmals von `toggle_card_manually_paid` als "eingefroren"-Schutz konsumiert)
- 5 neue RPCs: `create_card_direct`, `create_card_from_fragment`, `get_effective_plan_for_month`, `toggle_card_manually_paid`, `process_csv_import`, `calculate_planned_sparrate_for_month`
- 1 neuer Trigger: `card_monthly_states_set_updated_at` (BEFORE UPDATE → `set_updated_at()`)
- View `fragments_with_status`: zusätzlicher Status-Wert `AUTO_ABSORBED` (Distiller-Output), neue Spalten `confidence`, `suggested_card_id`, `imported_at`
- `link_origin`-Enum-Wert (in v2 nicht ausgeschrieben): **`AUTO_ABSORBED`** (Past Tense, konsistent mit `MANUAL_DROP`)
- Constraint-Klarstellung: `card_planned_timeline.positive_planned` ist `≥ 0`, nicht `> 0`
- Section 9: `closed_at` ist nicht mehr reserviert — siehe Punkt zu `toggle_card_manually_paid` unten

**Änderungen v3 → v3.1 (Sprint-9-Stufe-1 + Pre-Sprint-10):**

- `profiles`: +1 Spalte — `own_ibans text[] NOT NULL DEFAULT '{}'` (Liste eigener IBANs für Cross-Account-Transfer-Erkennung)
- `fragments`: +2 Spalten — `counterparty_iban text NULL`, `transfer_type text NULL` (CHECK: NULL oder `'INTERNAL_TRANSFER'`)
- 1 neuer Partial-Index: `idx_fragments_transfer_type` auf `(user_id, transfer_type) WHERE transfer_type IS NOT NULL`
- `process_csv_import`-Signatur erweitert: zweiter Parameter `p_format_hint text DEFAULT 'DKB'` (Future-Proof-Slot für format-spezifische Logik, in Stufe 1 nicht aktiv im Body); `p_rows`-Zeilen dürfen optional `counterparty_iban` enthalten; Return-JSON um `iban_backfilled_count`, `internal_transfers_count`, `links_removed_for_transfers_count` erweitert
- 1 neue RPC: `toggle_card_hidden(card_id, hidden)` für UI-Soft-Delete-Toggle (Sprint 10 V4'')
- View `fragments_with_status`: +2 Spalten am Ende (`counterparty_iban`, `transfer_type`); zusätzlicher Status-Wert `'INTERNAL_TRANSFER'` (höchste Priorität, schlägt alle anderen Stati)
- **Snapshot-Integritäts-Patch (Pre-Sprint-10):** `is_card_active_in_month` filtert nicht mehr auf `deleted_at` — die zwei Sparrate-RPCs aggregieren jetzt korrekt über hidden Karten. Hide ist UI-Concern, nicht Berechnungs-Concern. Konsumenten mit echtem Hide-Bedarf (`process_csv_import`-Match-Loop, `toggle_card_manually_paid`-Ownership-Check) filtern explizit
- **Defense-in-Depth-Patch (Pre-Sprint-10):** `calculate_card_amount_for_month` Fragment-Aggregation filtert hart auf **`transfer_type IS NULL`** — deckt `INTERNAL_TRANSFER`, `ASSET_REALLOCATION` und etwaige künftige Transfer-Typen automatisch ab. `calculate_sparrate_for_month` ist transitiv geschützt (liest Fragmente ausschließlich über diese Funktion)
- Sprint-9-OQ-A/B/C-Pattern dokumentiert (siehe Section 7 + Section 9)

**Änderungen v3.1 → v3.2 (Sprint v2-04 „Mehrkonten Stufe 1"):**

- v2-04 Mehrkonten Stufe 1: `transfer_type`-Erweiterung, Markier-RPC, OQ-B-Trigger, DKB_VISA-Format, Duplikat-Hash-Fix.

**Änderungen v3.2 → v3.3 (Sprint v2-05 „Karten-Lebenszyklus"):**

- v2-05 Karten-Lebenszyklus: 5 neue RPCs (`end_card`, `card_delete_gate`, `delete_card`, `restore_card`, `cleanup_expired_card_trash`), `toggle_card_hidden` per DROP entfernt (Beschluss E2), `cards.deleted_at` semantisch von Verbergen- zu Papierkorb-Marker gewechselt, Trash-Flow (`schedule_deletion`/`restore_deletion`) für Karten erstmals verdrahtet.

**Änderungen v3.3 → v3.4 (Sprint v2-06 „B2 Abweichungs-Treiber"):**

- 1 neue Lese-RPC: `get_year_deviation_drivers(p_year integer, p_limit integer DEFAULT 3)` — Top-N Abweichungs-Treiber je Monat eines Kalenderjahres, EIN Call für Welle-Tooltip (Top-1) und Popup (Top-3). Additiv, read-only, keine Schema- oder Daten-Änderung.
- Keine Tabellen-, Spalten-, Index-, Trigger- oder Enum-Änderung.

**Änderungen v3.4 → v3.4.1 (Doku-Patch, 04.08.2026):**

- Abschnittsnummerierung korrigiert: zweites Vorkommen „## 13." (vormals
  „Betriebsnotiz — v2-04") zu „## 15." umnummeriert — Abschnitt 13 war bereits
  durch „Globale Konstanten — `app_config`" belegt. Keine schema- oder
  datenseitige Änderung, reine Nummerierungskorrektur (Sprint-v2-08-Review
  §6 F4).

**Änderungen v3.4.3 → v3.4.4 (Sprint v2-14 „Fälligkeitstag“, `LQ-1`):**

- `cards`: **+1 Spalte** — `due_day smallint NULL`, CHECK `cards_due_day_range`
  (`NULL` oder `1..31`). Tag im Monat, an dem die Karte fällig ist.
- **`NULL` ist ein Wert, keine Lücke.** Er steht für „kein Termin“ und ist der
  korrekte Zustand bei **BUDGET**-Karten (ein Budget ist eine Erlaubnis ohne
  Termin, Befund `L7`) sowie bei Karten ohne Buchungshistorie.
- **Gespeichert wird der SOLL-Tag, nicht der reale Buchungstag.** Sieben Karten
  zeigen über 19 Monate dasselbe Muster: gebucht am 1., 2., 3. oder 4. — nie
  früher. Das ist ein Dauerauftrag zum Ersten, der auf den nächsten
  Bankarbeitstag rutscht. Die Klammerung auf die tatsächliche Monatslänge
  (Februar) gehört in die Vorhersage-Logik, **nicht** in die Spalte.
- Keine RPC, keine Rechenfunktion und keine bestehende Spalte berührt. Die
  Sparrate ist von der Erweiterung **nicht** betroffen — nachgewiesen über alle
  zwölf Monate 2026, Ist und Plan, vor und nach der Anwendung; die Prüfsummen
  der vier Rechenfunktionen sind unverändert gegenüber v2-13.
- Es gibt **noch keine Oberfläche** zum Setzen des Werts. Die 17 Startwerte kommen
  aus der Migration, abgeleitet aus der Buchungshistorie; die Bearbeitung folgt
  mit `LQ-2` nach der Gestaltungsrunde.

**`transfer_type` — Wertemenge + Semantik (v3.2):**

> `transfer_type text NULL` — CHECK `transfer_type_valid`: `NULL` | `'INTERNAL_TRANSFER'` | `'ASSET_REALLOCATION'`.
> - `INTERNAL_TRANSFER`: automatisch beim Import gesetzt (IBAN-Erkennung gegen `own_ibans` **oder** DKB_VISA-Heuristik).
> - `ASSET_REALLOCATION`: **ausschließlich manuell** via `set_fragment_asset_reallocation` — Vermögensumschichtungen (z. B. Broker→Topf), die strukturell nicht von Sparüberweisungen unterscheidbar sind (Beschluss F3). Verhält sich in allen Berechnungs- und Link-Pfaden identisch zu `INTERNAL_TRANSFER`.
> - Semantik-Invariante (OQ-B, erweitert): Fragmente mit `transfer_type IS NOT NULL` sind nie an Karten verlinkbar und zählen nie in Karten-Beträge oder Sparrate.

**View `fragments_with_status` — Status (v3.2):**

> `status`-Spalte liefert bei gesetztem `transfer_type` jetzt den **konkreten Typ** (`'INTERNAL_TRANSFER'` oder `'ASSET_REALLOCATION'`) statt pauschal `'INTERNAL_TRANSFER'`. Frontend-Interim (bis DD-Geste): beide Werte wie den bisherigen Transfer-Status behandeln (ausgegraut + Badge).

---

## 1. Was gebaut wurde

**11 Tabellen**, 1 View, **32 App-RPCs** (+ 6 Trigger-Funktionen; v2-05: +5
Lebenszyklus-RPCs, −`toggle_card_hidden`; v2-17: +6 Kategorie-RPCs), **7 Trigger**
(+ 1 Event-Trigger), vollständige RLS, Seed-Daten für Steuerklassen 1–6 und globale
Konstanten.

```
   IDENTITÄT          EINKOMMEN              KARTEN                   FRAGMENTE
   ─────────          ─────────              ──────                   ─────────
   profiles           income_timeline        cards                    fragments
                      net_estimation_        card_planned_timeline    card_fragment_links
                      brackets               card_monthly_states      fragments_with_status (View)
                                             card_categories  (v2-17)

   INFRASTRUKTUR
   ─────────────
   app_config          → globale Konstanten (Schwellen, Gewichte, Retention)
   deleted_entities    → Trash für Rückgängig-Pattern (trägt KEINE Kategorien, D7)
```

> **`card_categories` steht bewusst NEBEN `cards`, nicht darin.** Beide Sparrate-RPCs
> schleifen ohne Typ-Filter über alle Karten des Monats; eine Kategorie als
> `cards`-Zeile würde zusätzlich zu ihren Kindern summiert und der Prüfanker bräche
> sofort (Befund `D1`, dort als BLOCKER geführt). Dieselbe ungefilterte Menge nutzen
> `get_year_deviation_drivers` und der Auto-Absorptions-Loop in `process_csv_import`.
>
> Die Tabelle hat **keine Betrags-Spalte**. Die Zahl einer Kategorie ist immer
> abgeleitet und wird server-seitig gebildet (§4, `get_category_amounts_for_month`).

---

## 2. Beziehungs-Diagramm

```
auth.users (Supabase Auth)
    │
    │ 1:1
    ▼
profiles ─────────────────────────────────┐
    │                                     │
    │ 1:n                                 │
    ▼                                     │
income_timeline                           │
                                          │
                                          │ owner ⤴
profiles                                  │
    │ 1:n                                 │
    ▼                                     │
cards ────────────────────────────────────┤
    │                                     │
    ├─ 1:n ─→ card_planned_timeline      │
    │         (Plan-Zeitreihe)           │
    │                                     │
    ├─ 1:n ─→ card_monthly_states        │
    │         (Sparse Pro-Monat-State)   │
    │                                     │
    └─ 1:n ─→ card_fragment_links ←──┐   │
                  │                  │   │
                  │ n:1              │   │
                  ▼                  │   │
              fragments              │   │
                  │  ▲               │   │
                  │  │ UNIQUE(fragment_id)─┘
                  │  │
                  │  │ fragments.suggested_card_id ⤴ cards
                  │
                  │ owner ⤴
              profiles

deleted_entities  ── owner ──→ profiles
net_estimation_brackets  (global, kein Owner)
app_config              (global, read-only für User)
```

**Lese-Hilfe:**

- Jede Tabelle mit Owner kaskadiert auf `auth.users`-Löschung (DSGVO-Konformität)
- `card_fragment_links` hat den `UNIQUE(fragment_id)`-Constraint → ein Fragment kann maximal einer Karte zugewiesen sein → keine Doppelverbuchung möglich
- `income_fragment_links` (v2-19) bildet dasselbe für das **Netto** ab: `UNIQUE(fragment_id)`, `month` auf den Monatsersten festgenagelt, RLS-Policy `income_fragment_links_owner`. **Sie speichert den Link, nicht den Betrag** — die Summe entsteht aus `fragments.amount`, dadurch können Betrag und Zuordnung nicht auseinanderlaufen, und „mehrere Zahlungen in einem Monat summieren sich" ergibt sich von selbst statt als Sonderregel
- **Ein Fragment hängt entweder an einer Karte ODER am Netto, nie an beidem.** Zwei Trigger erzwingen das gegenseitig (`trg_ifl_drop_card_link`, `trg_cfl_drop_income_link`); ein neuer Link löscht den jeweils anderen. Bewusst als Trigger und nicht im Schreibpfad, damit auch `process_csv_import` (Auto-Absorption), `create_card_from_fragment` und der direkte UPSERT aus dem Frontend abgedeckt sind — ohne diesen Schutz zählte dasselbe Fragment zweimal in die Sparrate
- `income_fragment_links` trägt denselben Transfer-Wächter wie `card_fragment_links` — dieselbe Trigger-Funktion `enforce_no_transfer_fragment_links()`, unverändert wiederverwendet (§6 Stolperfalle 7)
- `fragments.suggested_card_id` → `cards` ist eine **schwache** Referenz (`ON DELETE SET NULL`): wenn die vorgeschlagene Karte gelöscht wird, verliert das Fragment nur den Vorschlag, nicht sich selbst
- Cascading: Karte gelöscht → States + Links weg, Fragmente bleiben (sie sind unabhängig)
- `cards.category_id` → `card_categories` ist ebenfalls eine **schwache** Referenz (`ON DELETE SET NULL`): wird der Ordner gelöscht, verliert die Karte nur ihre Zuordnung, nicht sich selbst. `NULL` ist dort ein **regulärer** Wert („Ohne Kategorie"), kein Fehlerzustand — beide Anlage-RPCs kennen keine Kategorie und liefern laufend kategorielose Karten nach (Befund `D12`)

---

## 3. Datenbasis der Sparrate — die Wahrheits-Quellen

Die Sparrate ist nirgends gespeichert. Sie wird zur Laufzeit aus diesen vier Quellen berechnet:

> **`card_categories` ist KEINE fünfte Quelle** (seit v2-17). Die Sparrate rechnet
> **kategorie-blind** über alle Karten des Monats; die Zuordnung bewegt keine Zahl.
> Genau deshalb darf sie eine einfache Spalte sein und rückwirkend gelten, ohne die
> Snapshot-Integrität (§7) zu verletzen — der Präzedenzfall ist `cards.name`.

| Quelle | Was sie liefert | Forward-Inheritance? |
|---|---|---|
| `income_timeline` | Brutto + Netto pro Person | Ja — neuester Eintrag ≤ Monat M |
| `card_planned_timeline` | Geplanter Wert pro Karte | Ja — neuester Eintrag ≤ Monat M |
| `card_monthly_states` | Tap-Status, einmalige Anpassung (`adjusted_amount`), `adjustment_scope`, `closed_at` | Nein — exakter Monat |
| `card_fragment_links` + `fragments` | Realer Geldfluss pro Karte | Nein — exakter Monat |

Damit sind **alle drei Zeiträume** (Vergangenheit, Gegenwart, Forecast) durch dieselbe Funktion abgedeckt — der Unterschied ergibt sich automatisch aus dem Daten-Inhalt.

**Plan vs. effective Plan vs. Anzeige-Betrag** — drei verschiedene Begriffe:

| Begriff | RPC | Quelle | Zweck |
|---|---|---|---|
| **Plan** | `get_planned_amount_for_month` | `card_planned_timeline` Forward-Inheritance | Roh-Plan ohne Monats-Anpassung |
| **Effective Plan** | `get_effective_plan_for_month` | `COALESCE(adjusted_amount, plan)` | „Soll-Wert für diesen Monat" — Vergleichsbasis für Status-Labels |
| **Anzeige-Betrag** | `calculate_card_amount_for_month` | §4.3-Prioritätskette Realität → Anpassung → Plan, **seit v2-13 inkl. Split-Anteil auf Plan/Anpassung** | Was auf der Karte steht — bei GEMEINSAM der **eigene Anteil** |

---

## 4. Funktionen — was das Frontend per RPC ruft

### Im Hot-Path (bei jedem Render)

> **⚠️ Seit v2-24 ruft das Frontend fünf dieser Funktionen NICHT MEHR DIREKT.**
> `calculate_sparrate_for_month`, `calculate_planned_sparrate_for_month`,
> `calculate_card_amount_for_month`, `get_effective_plan_for_month` und
> `is_card_active_in_month` laufen jetzt **innerhalb** von `get_cards_for_month` bzw.
> `get_sparrate_series` (siehe „Gebündelte Lese-Funktionen" weiter unten). Sie sind
> unverändert und bleiben die Wahrheitsquelle — nur der Aufrufer ist nicht mehr der
> Anwendungs-Server, sondern die Datenbank selbst.
>
> **Wer eine dieser Funktionen ändert, muss die zwei Bündel mitdenken.** Direkt aus dem
> Frontend gerufen wird von den Hot-Path-Funktionen nur noch `get_split_factor` — sie
> hängt am Monat und passt in keine der beiden Reihen.

| Funktion | Wofür | Returns |
|---|---|---|
| `calculate_sparrate_for_month(user_id, month)` | Ring-Zentrum-Wert (Ist) | `numeric` (NULL falls Onboarding offen) — **seit v2-13 ohne eigene Split-Anwendung**: der Anteil steckt bereits im Rückgabewert von `calculate_card_amount_for_month`. **Seit v2-19 (`GE-1`) bevorzugt sie das tatsächlich überwiesene Netto**: `COALESCE(get_actual_net_for_month(…), get_net_monthly_for_month(…))`; der NULL-Fall wird **vorher** abgefangen, damit „Onboarding offen" weiterhin NULL liefert. ⚠️ Der Eingriff sitzt **hier** und NICHT in `get_net_monthly_for_month` — jene liest auch die Plan-Funktion; beide Seiten der Differenz verschöben sich gleich weit und die Abweichung wäre danach unsichtbarer als vorher (LL-23). **Seit v2-20 (`KU-1`) filtert sie `deleted_at IS NULL`** — eine Karte im Papierkorb zählt nicht mehr mit. Das ist **keine** Verletzung von §2.1: `card_delete_gate` lässt über `HAS_PAST_PLAN` keine Karte mit Vergangenheit löschen, der Filter kann historische Sparraten also strukturell nicht bewegen |
| `calculate_planned_sparrate_for_month(user_id, month)` | Plan-Sparrate (ohne Realität) | `numeric` — liest **weiterhin ausschließlich** `income_timeline`. In v2-19 nachweislich unberührt geblieben: Prüfsumme `md5(pg_get_functiondef(...))` vor und nach der Migration identisch (`e80bf401…`). **Seit v2-20 filtert auch sie `deleted_at IS NULL`** — sie muss mitziehen, sonst driften Ist und Plan auseinander und die Treiber müssten eine Karte erklären, die es nicht mehr gibt |
| `calculate_card_amount_for_month(card_id, month)` | Wert auf Karte (Realität → Anpassung → Plan) | `numeric` — **seit v2-11 auch negativ möglich** (BF-5/E2: übersteigen die Gutschriften die Ausgaben, ist der Netto-Verbrauch negativ; keine Kappung bei 0). **Seit v2-13 (BF-4) trägt sie die Split-Logik**: bei `attribution = 'GEMEINSAM'` wird `get_split_factor(cards.user_id, month)` auf **Plan/Anpassung** angewandt, **nicht** auf Fragment-Summen — die sind bereits der überwiesene Anteil. Der Rückgabewert ist damit stets die **eigene** Zahl; Aufrufer dürfen den Anteil nicht erneut anwenden |
| `get_effective_plan_for_month(card_id, month)` | „Soll-Wert" für UI-Vergleiche (`adjusted ∨ plan`) | `numeric` |
| `is_card_active_in_month(card_id, month)` | Karte rendern oder nicht? | `boolean` |
| `get_planned_amount_for_month(card_id, month)` | Roher Plan ohne Adjustment | `numeric` |
| `get_net_monthly_for_month(user_id, person, month)` | Netto-Anzeige | `numeric` |
| `get_split_factor(user_id, month)` | "ICH 60%" / "PARTNER 40%"-Anzeige | `numeric` (0..1) |

### Bei der Jahres-Welle (Sprint v2-06)

| Funktion | Wofür | Returns |
|---|---|---|
| `get_year_deviation_drivers(p_year integer, p_limit integer DEFAULT 3)` | B2-Abweichungs-Treiber je Monat — EIN Call speist Welle-Tooltip (Top-1) und Popup-Monatsklick (Top-3). `STABLE`, `SECURITY INVOKER`, `SET search_path TO 'public'`, **ohne** `p_user_id` (auth.uid()-basiert, Hot-Path-Konvention) + expliziter `cards.user_id`-Filter als Defense-in-Depth. Auth-Pflicht 28000; `p_year` außerhalb 1900–2999 und `p_limit` außerhalb 1–50 → 22023. **Seit v2-19 kann ein Treiber `card_id: null` tragen** — die Zeile `Gehalt` (`card_type` und `attribution` ebenfalls `null`). `p_limit` begrenzt die **Karten**-Treiber; die Gehalts-Zeile wird **danach** angehängt und deshalb nie abgeschnitten. Aufrufer müssen `card_id: null` vertragen — auch beim Kürzen: Ein Frontend-Limit von 3 schnitte im Juli 2026 genau diese Zeile ab. **Seit v2-20 filtert sie `deleted_at IS NULL`** — sonst bräche die B2-Invariante: Die Treiber erklärten eine Karte, die in keiner der beiden Sparraten mehr vorkommt. **Seit v2-22 (`B2-R`) rundet sie nicht mehr je Zeile:** Die Deltas werden ungerundet berechnet, das Ziel wird aus `calculate_sparrate_for_month` und `calculate_planned_sparrate_for_month` **geholt** (LL-25 — `Ist − Plan` ist die Differenz zweier getrennt gerundeter Summen und darf nicht hergeleitet werden), das Gehalts-Delta abgezogen, und der verbleibende Rest auf die **betragsgrößte** Kartenzeile gelegt. Sie trägt `rn = 1` und überlebt damit jeden `p_limit`-Schnitt. Vorher lag `Σ delta` in Juli und August je einen Cent neben `Ist − Plan`; Ursache war nicht das separat gerundete Gehalt, sondern Karten mit **Sub-Cent-Deltas, die gar nicht angezeigt werden** (ein Delta von 0,0022 € rundet auf 0,00 und wird von `WHERE delta <> 0` gefiltert, verschiebt aber die Summe) | `jsonb` |

**Return-Form** — immer genau 12 Einträge (auch ohne Treiber), aufsteigend nach Monat:

```jsonc
[{ "month_index": 0, "month": "2026-01-01",
   "drivers": [{ "card_id": "…", "card_name": "Tanken", "card_type": "BUDGET",
                 "attribution": "ICH", "ist": 187.20, "plan": 150.00,
                 "share": 1.000000, "delta": -37.20 }] }, …]
```

**Heuristik (Konzept-Papier E1 + User-Entscheid 25.07.2026):**

```
delta := round( vorzeichen × ( calculate_card_amount_for_month(karte, M)
                             − get_effective_plan_for_month(karte, M) × anteil ), 2)
         vorzeichen = +1 für INCOME, −1 für FIXED_COST/BUDGET
         anteil     = get_split_factor(M) bei GEMEINSAM, sonst 1
```

- `delta` ist damit die **Wirkung auf die Sparrate**: negativ = der Monat ist um diesen Betrag schlechter als geplant. `ist`/`plan` bleiben die Kartenwerte **so, wie sie auf der Karte stehen** — `ist` ist die große Zahl (seit v2-13 bei GEMEINSAM der **eigene Anteil**), `plan` die Zeile `von X €` darunter (der **Haushaltsbetrag**); `share` weist den angewandten Anteil aus.
- **`anteil` steht seit v2-13 INNEN am Plan-Teil, nicht mehr außen vor der Klammer.** Weil `ist` bereits anteilig ist und `plan` nicht, ist die Klammer **gemischt** — ein Faktor außen würde den Ist-Teil ein zweites Mal kürzen. Wird das übersehen, laufen Welle-Tooltip und Ring auseinander, **ohne dass eine Zahl offensichtlich falsch aussieht**. Wächter ist die Invariante unten; sie ist genau dafür da.
- **Invariante:** `Σ delta(alle aktiven Karten, M) = calculate_sparrate_for_month(M) − calculate_planned_sparrate_for_month(M)`. Beide Sparrate-RPCs aggregieren über exakt dieselbe Kartenmenge, denselben Split-Faktor und dieselben Vorzeichen — die Treiber erklären also genau die IST/Plan-Differenz, die der Tooltip darüber ausweist. Auf der Übungs-DB und auf Prod (alle 12 Monate 2026) verifiziert.
- Ranking `|delta|` absteigend, Tiebreaker Kartenname aufsteigend (deterministisch, analog §11-Mehrfach-Match). `delta = 0` fällt raus; Monat ohne Abweichung → `"drivers": []`.
- **Keine eigene Betragslogik** (§7 Regel 1): ausschließlich Aufrufe der bestehenden §4.3-kompletten Basis-RPCs. Transfer-Fragmente sind dadurch transitiv ausgeschlossen.
- **Snapshot-Integrität §2.1:** KEIN `cards.deleted_at`-Filter — identisch zu den Sparrate-RPCs, deren Kurve die Treiber erklären. Papierkorb-Karten haben per Lösch-Gate weder Links noch States noch Vergangenheits-Plan → `delta = 0` → fallen ohnehin aus dem Ranking.
- **Sichtbarkeits-Grenze (bewusst, Konzept §2):** B2 sieht nur Karten-Realität. Unzugeordnete Rohmasse ist unsichtbar; die Qualität wächst mit der Kuratierung. E4 (Rohmasse-Pseudo-Treiber) bleibt offene DD-Frage und ist **nicht** umgesetzt.

### Beim Karten-Lebenszyklus (Sprint v2-05)

**`toggle_card_hidden(card_id, hidden boolean)` — ENTFERNT (Sprint v2-05, Beschluss E2):** per DROP entfernt, ersatzlos gestrichen (0 versteckte Karten im Bestand zum Migrationszeitpunkt). Ersetzt durch die fünf RPCs unten — alle `SECURITY INVOKER`, `SET search_path TO 'public'`, Auth-Pflicht (28000).

| Funktion | Wofür | Returns |
|---|---|---|
| `end_card(p_card_id uuid, p_last_month date)` | Setzt `cards.last_active_month`. `p_last_month = NULL` hebt das Ende auf. Validierung: Monatserster (22023), `≥ first_active_month` (22023); ONCE-Karten werden abgelehnt (22023, first=last-Constraint). Ownership-Verstoß 42704 | `jsonb` |
| `card_delete_gate(p_card_id uuid)` | STABLE. Lösch-Gate-Prüfung fürs UI (ausgegrauter Lösch-Menüpunkt mit Klartext-Grund). **Seit v2-25 (`KJ-1`) noch ZWEI Grund-Codes:** `HAS_LINKS` (Fragment-Links in irgendeinem Monat) und `HAS_STATES` (**seit v2-20 nur Zustände aus VERGANGENEN Monaten**, `month < date_trunc('month', now())`, **und seit v2-26 nur solche, die etwas AUSSAGEN**: `manually_paid OR adjusted_amount IS NOT NULL` — eine Zeile mit `false`/`NULL` ist der Rückstand eines zurückgenommenen Tap, trägt keine Historie und sperrte trotzdem dauerhaft, ohne dass es einen Weg gab, sie loszuwerden). **`HAS_PAST_PLAN` ist ENTFALLEN** — eine Karte, die in einem vergangenen Monat eingeplant war, ist löschbar; was das mit den Sparraten jener Monate macht, zeigt `delete_card` im Toast an, statt es zu verhindern. **Gemessen am 17.08.2026:** mit dem Riegel waren **0 von 82** Karten löschbar, ohne ihn sind es **3** — die übrigen 79 tragen eine Zahlung und bleiben durch `HAS_LINKS` gesperrt (bewusste Nutzer-Entscheidung: Wer löscht, muss entscheiden, wohin die Zahlung gehört). ⚠️ **`src/app/page.tsx` bildet dieses Tor nach** (Vorberechnung statt 82 RPC-Aufrufe) — wer die Regel hier ändert, muss sie dort mitziehen, sonst graut das Menü aus, was die Datenbank erlaubt. Wächter: `tests/e2e/loesch-tor.spec.ts` | `jsonb` (`{deletable boolean, reasons text[]}`) |
| `delete_card(p_card_id uuid, p_year integer default null)` | Prüft `card_delete_gate` (Verstoß → 23514 mit Gründen), setzt `deleted_at = now()`, legt via bestehendem `schedule_deletion('CARD', id, row-snapshot)` den `deleted_entities`-Eintrag an. **Seit v2-25 (`KJ-1`) misst sie zusätzlich ihre eigene Wirkung:** alle zwölf Monate von `p_year` vor dem UPDATE, dieselben danach, in **derselben Transaktion**. Sie **ruft** `calculate_sparrate_for_month` zweimal auf und baut sie **nicht** nach — ein Nachbau müsste Prioritätskette, Split-Anteil (§6 Stolperfalle 11) und Schlussrundung (LL-25) nachbilden, und keine Zahl sähe falsch aus. Dass eine `STABLE`-Funktion das UPDATE derselben Transaktion sieht, ist auf der Übungs-DB **belegt** (2.200 → 3.200), nicht angenommen. `p_year` ist das Kalenderjahr des angezeigten Monats; ohne Angabe das laufende. **Die alte Ein-Parameter-Signatur ist gedroppt** — `create or replace` hätte sonst eine Überladung angelegt. Kosten: 24 Aufrufe, ~370 ms, nur beim Löschen | `jsonb` (`{card_id, trash_id, expires_at, sparrate_effect {months, total, single_month}}`) |
| `set_card_frequency(p_card_id uuid, p_frequency card_frequency, p_year integer default null)` | **v2-26.** Ändert `cards.frequency` — die Frequenz gilt IMMER, rückwirkend wie künftig, sie ist keine Zeitreihe. Führt den Constraint `once_is_single_month` mit: Wechsel **zu** `ONCE` setzt `last_active_month = first_active_month`, Wechsel **davon weg** räumt es ab (sonst endete die Karte im Monat ihrer Entstehung und die neue Frequenz wäre wirkungslos). Misst die Sparraten-Wirkung wie `delete_card` seit v2-25 — vorher/nachher in DERSELBEN Transaktion, mit zwei Aufrufen der echten Rechenfunktion statt eines Nachbaus. `unchanged` unterscheidet „nichts gewählt" von „gewählt, aber ohne Wirkung"; nur beim zweiten lohnt eine Meldung. **Warum es sie gibt:** Bis v2-26 war die Frequenz nach dem Anlegen endgültig, der Vorgabewert ist `Monatlich`, und wer sich vertat, konnte nur löschen und neu anlegen | `jsonb` (`{card_id, frequency, unchanged, sparrate_effect {months, total, single_month}}`) |
| `restore_card(p_card_id uuid)` | Findet den jüngsten offenen Trash-Eintrag der Karte, validiert über bestehendes `restore_deletion` (Ablauf/Row-Lock), setzt `deleted_at = NULL` | `boolean` |
| `cleanup_expired_card_trash()` | Opportunistischer Hard-Delete-Vollzug (Beschluss E3 Option b), vom Frontend vor jeder Lebenszyklus-Aktion aufgerufen: löscht abgelaufene, nicht wiederhergestellte eigene Trash-Karten hart (DB-Kaskade entfernt `card_planned_timeline`/`card_monthly_states`/`card_fragment_links`; Fragmente bleiben, `suggested_card_id` → `NULL`) und entfernt die vollzogenen Trash-Zeilen; wiederhergestellte Trash-Zeilen bleiben dauerhaft (§2.4) | `integer` (Anzahl hart gelöschter Karten) |

### Bei den Kategorien (Sprint v2-17 · `KAT-1` + `KAT-3`)

Alle sechs `SECURITY INVOKER`, `SET search_path TO 'public'`, mit explizitem
`auth.uid()`-Guard (28000) und Eigentums-Prüfung (42704). **Der Guard ist nicht
redundant:** Über MCP läuft die Verbindung als Service-Rolle **an RLS vorbei** — im
Trockenlauf ist er die einzige Absicherung.

| Funktion | Wofür | Returns |
|---|---|---|
| `set_card_category(p_card_id uuid, p_category_id uuid DEFAULT NULL)` | Ordnet eine Karte einem bestehenden Ordner zu. `NULL` löst sie heraus (sie landet in „Ohne Kategorie"). Fremde Kategorie → 42704 | `void` |
| `create_category_for_card(p_card_id uuid, p_name text)` | Legt einen Ordner an **und** räumt die Karte ein, in einem Aufruf. Existiert der Name bereits (ohne Rücksicht auf Groß-/Kleinschreibung), wird der bestehende verwendet statt eines Fehlers. `sort_order` = größter vorhandener Wert + 10. Leerer Name → 22023 | `uuid` |
| `rename_card_category(p_category_id uuid, p_name text)` | Umbenennen. Wirkt rückwirkend in allen Monaten — die Zuordnung ist eine einfache Eigenschaft, keine Zeitreihe | `void` |
| `delete_card_category(p_category_id uuid)` | **Harter** DELETE. Die Karten werden über `ON DELETE SET NULL` kategorielos, nicht gelöscht. Gibt alles zurück, was die Rücknahme braucht — inklusive der Karten-IDs, denn die stehen danach nirgends mehr | `jsonb` (`{category_id, name, sort_order, card_ids[]}`) |
| `restore_card_category(p_category_id uuid, p_name text, p_sort_order smallint, p_card_ids uuid[])` | Rücknahme aus dem 5-Sekunden-Toast: legt den Ordner mit **derselben id** wieder an und hängt nur die Karten zurück, die inzwischen **nicht** anderweitig zugeordnet wurden | `uuid` |
| `get_category_amounts_for_month(p_user_id uuid, p_month date)` | **STABLE.** Alle Ordner eines Monats mit ihrem vorzeichenrichtigen Beitrag zur Sparrate, in EINEM Aufruf. Leeres Array, wenn kein Gehalt hinterlegt ist. **Seit v2-19** benutzt sie denselben Ist-Netto-Wert wie `calculate_sparrate_for_month`; liefe hier der Plan und dort die Wirklichkeit, bräche Prüfanker 1 sofort. **Seit v2-20 filtert sie `deleted_at IS NULL`** — sonst bräche Anker 1 in die andere Richtung. Die Posten-Zahl stimmt dadurch wieder mit den sichtbaren Karten überein; vorher konnte die Kachel „4 Posten" bei drei Karten melden | `jsonb` (Array aus `{key, category_id, name, sort_order, amount, posten, planned}`) — **`planned` neu in v2-19**: der Planwert des Monats, nur beim `INCOME`-Eintrag gesetzt, sonst `null` |

**Signatur mit `p_user_id`**, wie die beiden Sparrate-RPCs — nicht `auth.uid()`-basiert.

### Gebündelte Lese-Funktionen (Sprint v2-24 · `PF-1`)

Beide `STABLE`, `SECURITY INVOKER`, `SET search_path TO 'public'`, mit `p_user_id` in
der Signatur (Konvention für Funktionen, die über den Nutzer aggregieren — CLAUDE.md §6
Stolperfalle 4). `STABLE` ist hier nicht Kosmetik: Es verbietet schreibende
Anweisungen, die Funktionen können strukturell nichts verändern.

| Funktion | Wofür | Returns |
|---|---|---|
| `get_cards_for_month(p_user_id uuid, p_month date)` | Alle im Monat **aktiven** Karten mit ihren Monatswerten in EINEM Aufruf — ersetzt 179 Netzrunden (77× `is_card_active_in_month` plus drei je aktiver Karte). **Ruft** `is_card_active_in_month`, `calculate_card_amount_for_month` und `get_effective_plan_for_month` auf; liest `card_monthly_states` per LEFT JOIN (kann nicht doppeln — `UNIQUE (card_id, month)`, gegen `pg_constraint` geprüft). `manually_paid` kommt als `false` statt `NULL`, wenn keine Zustands-Zeile existiert; `adjusted_amount` bleibt `NULL` — „keine Anpassung" und „Anpassung auf 0 €" sind verschiedene Aussagen (§6 Stolperfalle 3 der CLAUDE.md). Der Monatsbereich steht **zusätzlich** als inline-Vorfilter: `is_card_active_in_month` erzwingt ihn selbst und verengt danach über die Frequenz, der Vorfilter ist also eine echte Obermenge und erlaubt nur den Index-Zugriff statt 77 Funktionsaufrufe. Rein lesend gegen Produktion belegt: über 24 Monate **304 gegen 304 Zeilen, 0 Unterschied in beide Richtungen**. Gemessen **7,99 ms** für 34 Karten. **Liefert NICHT** Name, Typ, Zuordnung, Frequenz, Fälligkeitstag oder Kategorie — das sind Eigenschaften der Karte, und der `cards`-Select bleibt ohnehin, weil die Badge-Auflösung die Namen auch monats-**inaktiver** Karten braucht | `jsonb` (Array aus `{card_id, amount, effective_plan, manually_paid, adjusted_amount}`, sortiert nach `card_id`) |
| `get_sparrate_series(p_user_id uuid, p_year int)` | Zwölf Monate Ist und Plan in EINEM Aufruf — ersetzt 24 Netzrunden, plus zwei weitere, weil der Ring seinen Monatswert jetzt aus der Reihe liest statt ihn erneut zu holen (dadurch können Ring und Welle für denselben Monat auch nicht mehr auseinanderlaufen). **Ruft** `calculate_sparrate_for_month` und `calculate_planned_sparrate_for_month` auf. **Enthält bewusst kein `sum()` und kein `round()`** — beide runden einmal ganz am Ende über alles, eine Summierung hier wäre eine zweite Rundungsstelle (LL-25); die Kumulation der Welle bleibt im Frontend. `NULL` bleibt `NULL` (kein Gehalt hinterlegt ≠ 0,00 €, LL-20): für ein Jahr ohne Daten kommen 12 von 12 `NULL` durch den jsonb-Umlauf zurück. `p_year` außerhalb 1900–2200 → **22023**. Immer genau 12 Einträge, aufsteigend nach `month_index`. Gemessen **50,3 ms** für zwölf Monate. Gegen die 24 Einzelaufrufe belegt: drei Jahre, **36 gegen 36 Zeilen, 0 Unterschied** | `jsonb` (Array aus `{month_index, ist, plan}`) |

**Return-Form:**

```jsonc
// get_cards_for_month
[{ "card_id": "…", "amount": 1052.65, "effective_plan": 1904.00,
   "manually_paid": false, "adjusted_amount": null }, …]

// get_sparrate_series — immer genau 12 Einträge
[{ "month_index": 0, "ist": 1374.95, "plan": 1521.55 }, …]
```

> **Warum das Bündeln überhaupt so viel bringt — die Zahl, um die es geht.**
> `is_card_active_in_month` braucht **0,089 ms** in der Datenbank und lag im
> Produktionsschnitt bei **899 ms** über die Leitung. Faktor ~10.000, und nichts davon
> ist Rechnen: Für jede Anfrage muss eine verschlüsselte Verbindung stehen, ein JWT
> geprüft und eine eigene Transaktion geöffnet werden. Am 16.08.2026 transportierten
> **55.881 Anfragen** insgesamt **0,4 MB** — im Schnitt **8 Bytes je Antwort**. Ein
> Dashboard-Aufbau machte **233** Netzrunden für rund **490 ms** Rechenarbeit; danach
> sind es **~18**.
>
> **Wer eine dieser beiden Funktionen erweitert, prüft die Prüfsummen erneut.** Sie
> stehen in `sprints/sprint_v2-24_anker.md`. Der Anker der Sparrate allein genügt
> nicht: Ein Nachbau, der zufällig dasselbe liefert, wäre dort unsichtbar.

### Netto-Zuordnung (v2-19, `GE-1`)

| Funktion | Wofür | Returns |
|---|---|---|
| `get_actual_net_for_month(p_user_id uuid, p_person person_role, p_month date)` | **STABLE.** Summe der dem Netto zugeordneten Zahlungen eines Monats | `numeric` — **NULL, wenn nichts zugeordnet ist**; genau das ist das Signal für „nimm den Plan". Kein `round()`: Die Aufrufer runden am Ende über alles (LL-24) |
| `link_fragment_to_income(p_fragment_id uuid, p_month date)` | **VOLATILE.** Zahlung dem Netto zuordnen (UPSERT auf `fragment_id`) | `jsonb {fragment_id, month, actual_net}` · `28000` ohne Session, `42501` bei fremdem/unbekanntem Fragment, `23514` bei Transfer, **`22023` bei nicht-positivem Betrag** |
| `unlink_fragment_from_income(p_fragment_id uuid)` | **VOLATILE.** Zuordnung lösen — danach gilt wieder der Plan | `jsonb {fragment_id, month, actual_net}` · `28000`, `42501` |

**Warum eine RPC und kein UPSERT wie bei `linkFragmentToCard`:** Das **Vorzeichen** muss
geprüft werden. Ohne diese Prüfung ließe sich eine Ausgabe auf die Netto-Kachel ziehen
und das Monats-Netto fiele auf einen negativen Betrag. Die Prüfung gehört in die
Datenbank, nicht ins Frontend — sonst gäbe es zwei Wahrheiten.

**Der Monat ist der ANGEZEIGTE, nicht das Buchungsdatum** — dieselbe Periodenabgrenzung
wie beim Karten-Drop (§6 Stolperfalle 6). Ein Gehalt, das am 30.06. für Juli kommt,
gehört damit in den Juli.

> **⚠️ `get_category_amounts_for_month` rundet NICHT je Ordner naiv.**
>
> `calculate_sparrate_for_month` rundet **einmal ganz am Schluss über alles**. Elf
> einzeln gerundete Ordner können das nicht nachbilden: Gemessen am 08.08.2026 gegen
> Produktion war die Summe der gerundeten Ordner in **allen zwölf Monaten** genau
> 0,01 € neben der Sparrate (Juli: −322,74 € statt −322,75 €, exakter Kartenwert
> −4.487,8556895729755…).
>
> Die Funktion holt deshalb ihr Ziel aus `calculate_sparrate_for_month` — **geholt,
> nicht hergeleitet** (LL-22) — bildet `Ziel = Sparrate − Netto` und verteilt den
> verbleibenden Rundungsrest auf den **betragsgrößten** Ordner. Die Spalte geht damit
> per Konstruktion auf.
>
> **Wer diese Funktion anfasst, prüft danach in allen zwölf Monaten:**
> `Σ amount == calculate_sparrate_for_month(user, monat)`.

### Beim Karten-CRUD (Sprint 5)

Atomare Multi-INSERT-Pfade, die ohne RPC am `cards_assert_initial_plan` DEFERRED-Trigger scheitern würden:

| Funktion | Wofür | Returns |
|---|---|---|
| `create_card_direct(name, type, attribution, frequency, first, last, planned)` | Empty-Slot-Direktklick → neue Karte ohne Fragment-Verknüpfung | `uuid` (Card-ID) |
| `create_card_from_fragment(...same..., fragment_id, link_month)` | Fragment-Drop auf Empty-Slot → neue Karte + Plan + Link | `uuid` (Card-ID) |

### Beim Tap (Sprint 7)

| Funktion | Wofür | Returns |
|---|---|---|
| `toggle_card_manually_paid(card_id, month)` | Karte als „bezahlt" markieren oder zurücknehmen. Idempotent in der Hinsicht, dass mehrfacher Aufruf deterministisch togglet. Verweigert Toggle, wenn `card_monthly_states.closed_at IS NOT NULL`. **Seit v2-25 (`KJ-2`, Entscheidung 4): Wird das Häkchen GESETZT und steht dort eine Anpassung von genau `0`, fällt sie auf `NULL`.** „Ist bezahlt" gegen „fiel nicht an" ist ein Widerspruch — und er bewegt die Sparrate, weil `adjusted_amount = 0` den Plan schlägt. **Nur die 0**: Eine Anpassung auf einen anderen Wert bleibt (das heißt „kostet ausnahmsweise mehr, und ich habe es bezahlt"). **Nur beim Setzen**: Wer abhakt und das Häkchen wieder entfernt, behält die 0. Atomar in der Datenbank statt in zwei Schreibvorgängen, zwischen denen einer scheitern kann | `boolean` (Wert **nach** dem Toggle) |

### Beim CSV-Import (Sprint 8 + Sprint 9)

| Funktion | Wofür | Returns |
|---|---|---|
| `process_csv_import(p_rows jsonb, p_format_hint text DEFAULT 'DKB')` | Atomare Distiller-Pipeline: SHA-256-Hash → UPSERT mit ON CONFLICT DO UPDATE (IBAN-Backfill bei bestehendem Hash und leerem `counterparty_iban`) → Transfer-Erkennung via `counterparty_iban = ANY(own_ibans)` (mit OQ-B-Link-Auflösung) → Confidence-Loop nur für echte INSERTs ohne Transfer → Auto-Absorption (Score ≥ 0,95) oder Suggestion (Score ≥ 0,60). Eine Transaktion, ein Round-Trip. `p_format_hint` jetzt **aktiv**: `'DKB'` (Default) | `'CORTAL_CONSORS'` | `'DKB_VISA'`. Bei `'DKB_VISA'` greift zusätzlich zur IBAN-Erkennung die KK-Klassifikation: Zeilen mit `amount > 0` **und** Beschreibung `ILIKE 'Einzahlung%'` **oder** `ILIKE 'Ausgleich Kreditkarte%'` → `INTERNAL_TRANSFER` (inkl. OQ-B-Link-Auflösung), da der DKB-Visa-Export keine Gegen-IBAN führt. `p_rows`-Zeilen dürfen optional `counterparty_iban` enthalten | `jsonb` (`{inserted_count, skipped_duplicates_count, iban_backfilled_count, auto_absorbed_count, internal_transfers_count, links_removed_for_transfers_count, fragment_ids[]}`) |
| `calculate_match_confidence(fragment_id, card_id)` | Best-Match-Score. Gewichtete Summe aus den drei Sub-Scores (Name über `name_similarity_scoped` seit v2-21), danach die **Wiedererkennung als Untergrenze**: Greift `history_match`, wird der Score auf `confidence.history_score` (0,94) **gehoben** — nie gesenkt. Bewusst knapp **unter** der Auto-Absorptions-Schwelle 0,95: Eine wiedererkannte Zahlung erzeugt einen sichtbaren Vorschlag, aber niemals eine automatische Verknüpfung (User-Entscheid 15.08.2026). Der Wert steht in `app_config` und lässt sich ohne Migration anheben. Eine vierte **gewichtete** Komponente wäre falsch gewesen: Sie hätte alle Scores gesenkt, bei denen keine Historie vorliegt — und das sind die meisten. **Seit v2-28 gibt es eine zweite Untergrenze derselben Bauart:** Greift `merchant_rule_match`, wird der Score auf `confidence.merchant_rule_score` (**0,96**) gehoben. Sie steht bewusst **über** der Auto-Absorptions-Schwelle 0,95 — anders als die Wiedererkennung soll ein Händler-Treffer beim Import **automatisch verlinken**. Damit war an `process_csv_import` nichts zu ändern. Beide Untergrenzen benutzen dasselbe `GREATEST` und **heben nur an, sie senken nie**; die Reihenfolge ist deshalb ohne Wirkung | `numeric` (0..1) |
| `name_similarity(description, card_name)` | Trigram + Substring-Boost (`0.80`) über die **ganzen** Strings. Seit v2-21 **nicht mehr direkt von `calculate_match_confidence` aufgerufen**, sondern als Untergrenze innerhalb von `name_similarity_scoped` mitgeführt | `numeric` |
| `name_similarity_scoped(description, card_id)` **(v2-21)** | Wortweiser Namensvergleich: Umlaut-/ß-Normalisierung auf beiden Seiten, Zerlegung des Kartennamens in Wörter ab 4 Zeichen, Treffer nur an **echten Wortgrenzen** (`Douglas` trifft nicht mehr `Glas`), unscharfer Fallback über `word_similarity` erst ab `0.7`. **Entwertung mehrdeutiger Wörter:** Ein Kartenwort, das in `n` Kartennamen desselben Nutzers vorkommt, zählt nur `1/n` — das fängt Personennamen wie `Aline` (in 7 Kartennamen) ohne gepflegte Stoppwortliste. Führt `name_similarity` als Untergrenze mit: das Ergebnis kann nie schlechter werden als vorher | `numeric` (0..1) |
| `history_match(fragment_id, card_id)` **(v2-21)** | Wiedererkennung: Wurde eine Zahlung mit **identischer** Beschreibung schon einmal **von Hand** (`origin = 'MANUAL_DROP'`) dieser Karte zugeordnet? Lernt bewusst **nicht** aus `AUTO_ABSORBED` (sonst verstärkt sich ein Automatik-Fehler selbst) und nicht aus Überträgen. Das Fragment selbst ist ausgeschlossen | `numeric` (0 oder 1) |
| `merchant_rule_match(fragment_id, card_id)` **(v2-28)** | Händler-Erkennung über eine **zweistufige Wortliste** aus `app_config` (`matching.merchant_rules`), geschlüsselt nach **Kartenname**. Stufe 1 („eindeutig") genügt ein Wortreffer über `af_word_in_text`; Stufe 2 („mehrdeutig", z. B. `total`, `team`, `jet`) verlangt zusätzlich ein **zweites Signal** — ein Wort aus `zweitsignal_woerter` oder einen Betrag im konfigurierten Band. **Das zweite Signal sucht bewusst per `strpos`, nicht per Wortgrenze:** `af_word_in_text('tank', …)` findet „Tankstelle" **nicht**, weil die Regex hinter dem Wort ein Nicht-Alphanumerisches verlangt — ausgerechnet der Fall, für den Stufe 2 gebaut ist. Überträge (`transfer_type IS NOT NULL`) geben immer `0` zurück (dritte Absicherung neben RPC-Filter und Trigger). **Bekannte Grenze:** Wird die Karte umbenannt, greift die Regel still nicht mehr | `numeric` (0 oder 1) |
| `amount_match(fragment_amount, planned)` | Bracket-Score (`<1%→1.00`, `<5%→0.85`, `<15%→0.60`, `<30%→0.30`, sonst `0.00`) | `numeric` |
| `frequency_match(date, card_id)` | Binär `0/1` basierend auf `is_card_active_in_month`. ⚠️ **In der Praxis eine Konstante:** Der einzige Aufrufer filtert Karten bereits auf Aktivität im Monat des Fragments, weshalb sie dort ausnahmslos `1.00` liefert — gemessen über alle Score-Klassen (v2-21). 20 % des Gewichts unterscheiden damit nichts, und ohne Namensähnlichkeit ist die Badge-Schwelle 0,60 rechnerisch unerreichbar (Betrag + Frequenz ergeben höchstens 0,50). Offen als Hausaufgabe `ZO-1` | `numeric` |
| `refresh_fragment_suggestions(p_from_month, p_to_month)` **(v2-21)** | Rechnet Kartenvorschläge für **offene** Zahlungen eines Zeitraums neu und schreibt **ausschließlich** `suggested_card_id` und `confidence`. Nötig, weil `calculate_match_confidence` sonst nur beim Einfügen läuft (`process_csv_import`, hinter `IF v_was_inserted`) — wer später eine Karte anlegt, bekam für ältere Zahlungen nie einen Vorschlag. **Verlinkt niemals**, auch nicht ab 0,95: `card_fragment_links` zu schreiben bewegt sofort die Sparrate. Die Zusage ist **erzwungen**, nicht behauptet — die Funktion zählt die Verknüpfungen vor und nach ihrem Lauf und bricht bei jeder Abweichung mit Exception und Rollback ab. Auth über `auth.uid()` (`28000`), Zeitraum validiert (`22023`, höchstens 5 Jahre). Überträge (`transfer_type IS NOT NULL`) bleiben unangetastet | `jsonb` (`{geprueft, vorschlag_gesetzt, vorschlag_geleert, links_unveraendert, badge_threshold}`) |

### Beim Transfer-Markieren (Sprint v2-04)

| Funktion | Wofür | Returns |
|---|---|---|
| `set_fragment_asset_reallocation(p_fragment_id uuid, p_set boolean DEFAULT true)` | Schreib-RPC. Auth-Pflicht (28000), expliziter Ownership-Check zusätzlich zu RLS (42501). Setzen (`p_set=true`): erlaubt aus `NULL` und `INTERNAL_TRANSFER`→`ASSET_REALLOCATION`; verweigert mit 23514, wenn das Fragment einer Karte zugeordnet ist (Zuordnung zuerst lösen — kein stilles Entkoppeln); räumt `suggested_card_id`/`confidence`. Rücknahme (`p_set=false`): nur aus `ASSET_REALLOCATION`, setzt `NULL`; war das Fragment IBAN-erkennbar, stellt der nächste Re-Import `INTERNAL_TRANSFER` automatisch wieder her | `jsonb` (`{fragment_id, transfer_type}`) |

### Beim Onboarding und Income-Editing

| Funktion | Wofür | Returns |
|---|---|---|
| `estimate_net_monthly(gross_annual, tax_class, tax_year)` | Netto-Vorschlag im Income-Popup | `numeric` (NULL falls keine Bracket passt) |

### Beim Lösch-Pattern

| Funktion | Wofür | Returns |
|---|---|---|
| `schedule_deletion(entity_type, entity_id, payload)` | Aktion in Trash legen mit auto-berechnetem `expires_at` | `uuid` (Trash-ID) |
| `restore_deletion(trash_id)` | "Rückgängig"-Klick | `boolean` |

**RPC-Inventur-Summe:** 22 App-RPCs, alle `SECURITY INVOKER` außer den beiden Service-Hooks `handle_new_user` und `rls_auto_enable`, die DEFINER sind. Alle Read-Path-RPCs sind `STABLE` (Cache-fähig pro Transaktion), Schreib-RPCs sind `VOLATILE`.

---

## 5. Interaktions-Mapping — User-Aktion → DB-Operation

Die kompakte Referenz für die Frontend-Implementierung — aktualisiert für Sprint-5–8-Pfade:

| User-Aktion | DB-Operation |
|---|---|
| **Onboarding: erstes Gehalt** | INSERT `income_timeline` (ICH); UPDATE `profiles.onboarded_at = now()` |
| **Gehalt ändern (vorwärts)** | INSERT neue Zeile in `income_timeline` |
| **Karte anlegen (Direktklick)** | RPC `create_card_direct(...)` |
| **Karte anlegen (Fragment-Drop)** | RPC `create_card_from_fragment(...)` |
| **Karte als „bezahlt" tappen / Tap zurücknehmen** | RPC `toggle_card_manually_paid(card_id, month)` |
| **Fragment auf Karte droppen** | INSERT `card_fragment_links` mit `origin='MANUAL_DROP'` |
| **Fragment auf Netto-Kachel droppen** (v2-19) | `link_fragment_to_income(fragment_id, angezeigter Monat)` — ein etwaiger Karten-Link wird per Trigger gelöst |
| **Netto-Zuordnung lösen** (v2-19) | `unlink_fragment_from_income(fragment_id)` aus dem Einkommens-Fenster (§10) |
| **Fragment ejecten** | DELETE FROM `card_fragment_links WHERE fragment_id=$1` |
| **Betrag anpassen, nur dieser Monat** | UPSERT `card_monthly_states (adjusted_amount, adjustment_scope='THIS_MONTH')` |
| **Betrag anpassen, dauerhaft ab Monat X** | INSERT neue Zeile in `card_planned_timeline` mit `effective_month=X` |
| **Letzte Zahlung in Monat X** | RPC `schedule_deletion('CARD_END', card_id, {...})` |
| **Karte hard-löschen (nie genutzt)** | RPC `schedule_deletion('CARD', card_id, {})` |
| **Rückgängig-Klick** | RPC `restore_deletion(trash_id)` |
| **CSV-Import (DKB)** | RPC `process_csv_import(p_rows, 'DKB')` — atomar, eine Transaktion |
| **CSV-Import (Cortal Consors)** | RPC `process_csv_import(p_rows, 'CORTAL_CONSORS')` — selbe RPC, andere Format-Hint, identische Pipeline |
| **Karte beenden / Ende aufheben** (v2-05) | RPC `end_card(card_id, last_month)` — `NULL` hebt das Ende auf; wirkt nicht auf vergangene Monate |
| **Karte löschen / Rückgängig** (v2-05, ersetzt Verbergen) | RPC `delete_card(card_id)` (nur bei grünem `card_delete_gate`) → Papierkorb; `restore_card(card_id)`; Vollzug via `cleanup_expired_card_trash()` |
| **Sparrate für Ring (Ist)** | RPC `calculate_sparrate_for_month(user_id, month)` |
| **Sparrate Plan-Linie** | RPC `calculate_planned_sparrate_for_month(user_id, month)` |
| **„Soll-Wert" für Status-Label / „Noch X frei"** | RPC `get_effective_plan_for_month(card_id, month)` |
| **Sparraten-Treppe** | Schleife über 12 Monate, je RPC `calculate_sparrate_for_month` + `calculate_planned_sparrate_for_month` |
| **Subzeile "X Fragmente offen"** | SELECT COUNT FROM `fragments_with_status WHERE status='UNASSIGNED' AND date_trunc(...) = $month` |

---

## 6. Lösch-Logik — explizit pro Entität

| Entität | Lösch-Pfad |
|---|---|
| **profiles** | Cascade über `auth.users`-Löschung — DSGVO-Vollbereinigung |
| **income_timeline** | Append-only in V1. Kein Lösch-Pfad im Frontend |
| **cards** | Drei Pfade (seit v2-05): (a) **Beenden** über `last_active_month` (RPC `end_card`, inkl. Aufheben) — bleibt historisch sichtbar. (b) **Löschen mit Lösch-Gate** (RPC `delete_card`: nur ohne Links/States/Vergangenheits-Plan) über den §2.4-Papierkorb (`deleted_at` + `deleted_entities`, Vollzug `cleanup_expired_card_trash` mit Cascade auf alle Children). (c) **Soft-Detach** der Links (Eject/Bulk) als bewusste User-Korrektur. Das Sprint-10-Verbergen ist ersatzlos entfallen. **Seit v2-20 (`KU-1`) gilt für den Papierkorb das Gegenteil:** Die vier Aggregations-RPCs (`calculate_sparrate_for_month`, `calculate_planned_sparrate_for_month`, `get_category_amounts_for_month`, `get_year_deviation_drivers`) filtern `deleted_at IS NULL`. §2.1 bleibt davon unberührt — sie schützt historische Sparraten, und die kann eine Papierkorb-Karte gar nicht tragen: `card_delete_gate` lässt über `HAS_PAST_PLAN` keine Karte mit Vergangenheit löschen; der Filter wirkt ausschließlich im laufenden Monat und in der Zukunft. **Die frühere Begründung, Papierkorb-Karten trügen „ohnehin 0 bei", war falsch** — sie gilt für die *Treiber* (`delta = ist − plan = 0`) und nicht für die *Sparrate* (Beitrag = Plan). Belegt am 15.08.2026: Eine gelöschte Einnahme-Karte hielt die August-Sparrate 355,00 € zu hoch. Nur Surfaces, die UI-Sicht produzieren, filtern explizit über `WHERE deleted_at IS NULL` (Karten-Karussell, Detail-Overlay, Stack-Suggestion, KI-Vorschlag-Badge sowie der Match-Loop in `process_csv_import` und der Ownership-Check in `toggle_card_manually_paid`). Funktionaler Index `idx_cards_user_active (user_id) WHERE deleted_at IS NULL` beschleunigt diese UI-Queries. |
| **card_planned_timeline** | Cascade-Delete bei Karten-Hard-Delete. Sonst append-only |
| **card_monthly_states** | Cascade-Delete bei Karten-Hard-Delete. State-Reset (= DELETE) nach UI-Logik möglich |
| **card_fragment_links** | DELETE bei Eject. Cascade bei Karten- oder Fragment-Hard-Delete |
| **fragments** | Hard-Delete erlaubt. Cascade entfernt Links automatisch. `suggested_card_id` ist `ON DELETE SET NULL` |
| **deleted_entities** | Cleanup-Job nach `expires_at`. Restored-Zeilen bleiben dauerhaft. **Trägt KEINE Kategorien** — siehe unten |
| **card_categories** (v2-17) | **Harter** DELETE über `delete_card_category`, **kein** Papierkorb-Eintrag. Die enthaltenen Karten werden über `ON DELETE SET NULL` kategorielos, nicht gelöscht — eine Kaskade wäre eine undo-lose Massenaktion. Die Rücknahme läuft über den 5-Sekunden-Toast, der den Bausatz aus der RPC-Antwort hält (`restore_card_category` legt mit **derselben id** wieder an). Es gibt **kein Lösch-Tor**: Eine Kategorie hat keine Links und keine Monats-Zustände, und ihre Karten überleben |
| **app_config / net_estimation_brackets** | Nur über Service-Role änderbar |

> **Warum Kategorien nicht in den Papierkorb gehen (Befund `D7`).**
> `deleted_entity_type` hat genau vier Werte `{CARD_END, CARD, CARD_FRAGMENT_LINK,
> FRAGMENT}`, und `schedule_deletion` ist darauf typisiert.
> `cleanup_expired_card_trash` filtert im WITH-Block **hart** `AND de.entity_type =
> 'CARD'` — eine CATEGORY-Trash-Zeile würde nie vollzogen und nie entfernt;
> `restore_deletion` verweigert sie nach `expires_at`. Ergebnis wäre eine unsterbliche
> Waisenzeile. Hinzu kommt: **60 Sekunden Aufbewahrung** (`app_config
> trash.retention_seconds`) reichen für eine Kaskaden-Entscheidung nicht.
>
> v2-17 löst das **ohne** neuen Enum-Wert und **ohne** längere Retention. Wer später
> `G1` (Papierkorb für die übrigen Entitäten) angeht, findet hier den Grund, warum
> Kategorien dort nicht auftauchen.

---

## 7. Snapshot-Integrität — wie sie technisch garantiert ist

Das Architekten-Kernprinzip „Daten sind unveränderlich, Ereignisse nicht" wird auf drei Ebenen durchgesetzt:

| Ebene | Mechanismus |
|---|---|
| **Gehaltsänderungen** | Append-only über `income_timeline`. Lookup nimmt neuesten Eintrag ≤ M → vergangene Monate sehen weiterhin den damaligen Stand |
| **Plan-Anpassungen einer Karte** | Append-only über `card_planned_timeline`. Forward-Inheritance ohne Modifikation alter Werte |
| **Karten-Lebensdauer** | `last_active_month` setzt das Ende, ohne historische Monate zu beeinflussen |
| **Monats-Anpassungen** | `card_monthly_states.adjusted_amount` wirkt nur in dem einen Monat, `adjustment_scope` dokumentiert die ursprüngliche User-Intention |
| **Eingefrorene Monate** | `card_monthly_states.closed_at IS NOT NULL` blockiert weitere Mutationen über `toggle_card_manually_paid` |
| **Cross-Account-Transfers** | `fragments.transfer_type = 'INTERNAL_TRANSFER'` markiert Bewegungen zwischen eigenen Konten (`counterparty_iban = ANY(profiles.own_ibans)`). Solche Fragmente werden in `calculate_card_amount_for_month` explizit aus dem Aggregat ausgeschlossen — Sparrate spiegelt nur echte Einnahmen/Ausgaben. OQ-B-Daten-Invariante: bei Transfer-Markierung wird ein eventuell bestehender `card_fragment_link` gelöst (Counter `links_removed_for_transfers_count` im RPC-Return) und Suggestion-State (`confidence`/`suggested_card_id`) zurückgesetzt |
| **Der Papierkorb ändert die Aggregation — seit v2-20** | ~~`cards.deleted_at IS NOT NULL` hat keinen Effekt auf die Sparraten-RPCs~~ **Diese Zusage gilt nicht mehr** (`KU-1`). Die vier Aggregations-RPCs filtern `deleted_at IS NULL`; eine gelöschte Karte verschwindet sofort aus jeder Zahl. **Historische Sparraten bleiben trotzdem unverändert** — nicht durch die Aggregation, sondern durch das Lösch-Tor: `HAS_PAST_PLAN` lässt keine Karte mit Vergangenheit löschen. Der Satz beschrieb ursprünglich das **Verbergen**, das in v2-05 ersatzlos gestrichen wurde |
| **Fragmente** | Sind Geldflüsse — können in der Zeit nicht "verschoben" werden. Eject ist DELETE des Links, nicht des Fragments. `imported_at` dokumentiert Import-Zeitpunkt |
| **CSV-Re-Imports** | `fragments.hash` = SHA-256 über `transaction_date || '|' || amount_fixed || '|' || description_raw`; **byte-identische Zeilen innerhalb eines Import-Batches erhalten ab dem 2. Vorkommen das deterministische Suffix `|#N`** (N = Vorkommens-Index in Dateireihenfolge; erstes Vorkommen = alte Formel, abwärtskompatibel; Re-Import → gleiche Indizes → gleiche Hashes, idempotent). Bekannte Grenze: identische Buchungen über zwei Teil-Exporte desselben Monats deduplizieren weiterhin — Monats-Exporte vollständig importieren. `counterparty_iban` ist **bewusst nicht** Hash-Bestandteil (siehe OQ-A) — Re-Imports treffen den existierenden Hash und backfillen die IBAN-Spalte via `ON CONFLICT (user_id, hash) DO UPDATE SET counterparty_iban = EXCLUDED.counterparty_iban WHERE fragments.counterparty_iban IS NULL`. UNIQUE-Constraint auf `(user_id, hash)` macht Re-Imports deterministisch idempotent |
| **Sparrate** | Niemals als Spalte gespeichert. Funktion liest deterministisch aus den eingefrorenen Quellen |

→ **Eine Plan-Anpassung im April 2026 ändert niemals die Sparrate vom Februar 2026.** Garantiert durch das Schema selbst, nicht durch Anwendungslogik.

---

## 8. RLS — Sicherheits-Modell

| Tabelle | Read | Write |
|---|---|---|
| `profiles` | Owner | Owner |
| `income_timeline` | Owner | Owner |
| `cards` | Owner | Owner |
| `card_planned_timeline` | Owner | Owner |
| `card_monthly_states` | Owner | Owner |
| `fragments` | Owner | Owner |
| `card_fragment_links` | Owner | Owner |
| `card_categories` (v2-17) | Owner | Owner |
| `deleted_entities` | Owner | Owner |
| `fragments_with_status` (View) | Erbt von `fragments` + `card_fragment_links` | (View, nicht beschreibbar) |
| `app_config` | Alle authentifizierten | Nur Service-Role |
| `net_estimation_brackets` | Alle authentifizierten | Nur Service-Role |

**Owner = `auth.uid() = user_id`**. Keine Cross-User-Sichtbarkeit. Service-Role (Migrations, Admin-Tools) umgeht RLS.

**Event-Trigger `rls_auto_enable`:** stellt sicher, dass jede neue public-Tabelle automatisch RLS aktiviert bekommt — Sicherheitsnetz gegen vergessene RLS-Aktivierungen bei zukünftigen Migrationen.

> **⚠️ Er legt KEINE Policy an — und er schluckt sein eigenes Scheitern** (Befund
> `D8`, bestätigt beim Anlegen von `card_categories` in v2-17). Der Trigger führt
> ausschließlich `alter table … enable row level security` aus, gekapselt in
> `EXCEPTION WHEN OTHERS THEN RAISE LOG`.
>
> **Die Folge ist heimtückisch:** Eine neue Tabelle ohne explizite Owner-Policy liefert
> über PostgREST ein **stilles `[]`** beim SELECT (kein Fehler) und **42501** beim
> INSERT. Beim Testen liest sich das wie „noch keine Daten angelegt" — und kostet eine
> Stunde Suche an der falschen Stelle.
>
> **Regel: Wer eine Tabelle hinzufügt, schreibt `ENABLE ROW LEVEL SECURITY` und die
> Policy von Hand in die Migration.** Sich auf einen Trigger zu verlassen, der Fehler
> verschluckt, ist keine Absicherung. So gebaut in
> `supabase/migrations/20260808_v2_17_kat1_kategorien.sql`.

---

## 9. Was bewusst NICHT gebaut wurde

| Feature | Warum nicht V1 | Wo es später ansetzt |
|---|---|---|
| Periodenabgrenzung | Komplexität | `card_fragment_links.month` ist bereits separates Feld — entkoppelt vom `transaction_date` |
| Rückwirkende Gehaltskorrektur mit Fairness-Delta | Konzeptuelle Komplexität | Neue Tabelle `fairness_deltas` |
| PDF/Excel-Import | Out of scope | Application-Layer, kein Schema-Eingriff nötig (Frontend könnte aber CSV-Adapter für DKB hinaus erweitern) |
| Fragment-Clustering | Manuelle Zuordnung gewollt | Application-Layer |
| Top-3-Abweichungs-Treiber | Analytics-Feature | Materialisierte View über `card_monthly_states` + Vergleichsmonate |
| Partner-only-Karten | Sinnlos für Sparrate-Logik | UI-Lärm — keine technische Lücke |
| Cleanup-Edge-Function für Trash | Out of scope der DB-Migration | Supabase Edge Function `cleanup_deleted_entities` |
| Konfidenz-Verbesserung | Trigram reicht für V1 | Embeddings, Levenshtein, ML-Klassifikator |
| Kategorie-Vorhersage | Karten-Zuordnung reicht für V1 | Eigenes Modell pro User |
| Steuerklasse-Wechsel via UI | Aufwand vs. Nutzen | Settings-Bereich in V2, ändert `profiles.tax_class` |
| Manueller Monatsabschluss-UI | Wird vom Distiller-Workflow nicht benötigt | `card_monthly_states.closed_at` ist als Block-Mechanik bereits da (siehe `toggle_card_manually_paid`-RPC) — UI dazu kann später beliebig kommen |
| Paired-Fragment-Verlinkung (`paired_fragment_id`) | Stufe-1-Cross-Account-Erkennung kommt mit Single-Side-Markierung aus — kein Spiegel-Paar nötig | Mögliche V2-Erweiterung wenn Multi-Account-Reconciliation gefragt |
| IBAN-Format-Validierung in der DB | Stufe-1 vertraut Frontend-Validierung (Sprint 9 Cortal-Parser) | Optionale CHECK-Constraint über regex_match in V2 |
| UI für Verwaltung von `own_ibans` | Aktuell nur via Service-Role oder Migration setzbar | Settings-Bereich in V2 oder Sprint-9-Folge-Sprint |
| ~~Hide-Rückgängig-UI ("Verborgene Karten anzeigen")~~ | **Obsolet seit v2-05** — Verbergen ist ersatzlos entfallen; Rückgängig läuft über den Papierkorb (`restore_card` innerhalb der Retention) | — |

**Schema-Hinweis V3 — `card_monthly_states.closed_at`:** In v2 war das Feld reserviert und ungenutzt. In v3 wird es erstmals konsumiert: `toggle_card_manually_paid` verweigert die Mutation, wenn die Row für diesen Monat `closed_at IS NOT NULL` hat. Damit hat das Feld eine erste echte Semantik („dieser Monat ist abgeschlossen, kein weiterer Toggle erlaubt"). Geschrieben wird `closed_at` aktuell von keiner Frontend-Operation — das bleibt für eine zukünftige Edge-Function oder Settings-UI offen.

**Schema-Hinweis V3 — `card_monthly_states.adjustment_scope`:** Default `'THIS_MONTH'`. Werte: `THIS_MONTH | FORWARD`. Aktuell dokumentiert die Spalte die ursprüngliche User-Intention für ein Adjustment (siehe Design-Doku §7 „Betrag anpassen, nur diesen Monat" vs. „… ab nächstem Monat"). Die `FORWARD`-Semantik wird vom Anzeige-Pfad **nicht** ausgewertet — eine zukünftige UI-Erweiterung könnte die Werte für „künftige Monate noch nicht überschritten" o. ä. nutzen.

**Schema-Hinweis V3.1 — Cross-Account-Pattern (Sprint 9 OQ-A/B/C):**

- **OQ-A — Backfill bestehender Fragmente:** User-getriebener Re-Import via `ON CONFLICT (user_id, hash) DO UPDATE SET counterparty_iban = EXCLUDED.counterparty_iban WHERE fragments.counterparty_iban IS NULL`. Hash-Formel unverändert zu Sprint 8 (`transaction_date || '|' || amount_fixed || '|' || description_raw`), damit Re-Import den vorhandenen Eintrag deterministisch trifft. `counterparty_iban` ist explizit kein Hash-Bestandteil.
- **OQ-B — Konflikt Transfer + bestehender Karten-Link:** Bei Transfer-Markierung wird ein eventuell bestehender `card_fragment_link` gelöst, `confidence`/`suggested_card_id` werden zurückgesetzt, Counter `links_removed_for_transfers_count` im RPC-Return getrackt. `manually_paid` bleibt orthogonal unberührt.
- **OQ-C — Hash-Adapter:** Hash-Logik im RPC, nicht im Frontend (Single-Source-of-Truth für Idempotenz). `p_format_hint` ist Future-Proof-Slot ohne aktive Logik in Stufe 1 — wenn künftige Bank-Formate format-spezifische Description-Normalisierung brauchen, wird das hier eingehängt.

**Schema-Hinweis V3.1 — `is_card_active_in_month` ohne Hide-Concern:**

Die Funktion ist seit Pre-Sprint-10 strikt Frequenz/Range-Check. Sie filtert
`cards.deleted_at` **nicht** — das bleibt so, sie beantwortet nur „ist diese Karte in
diesem Monat aktiv". Konsumenten filtern explizit in ihrer eigenen Query.

**Seit v2-20 (`KU-1`) gehören die vier Aggregations-RPCs dazu**
(`calculate_sparrate_for_month`, `calculate_planned_sparrate_for_month`,
`get_category_amounts_for_month`, `get_year_deviation_drivers`) — zusätzlich zu
`process_csv_import` (Match-Loop) und `toggle_card_manually_paid` (Ownership-Check).
Der frühere Satz *„Die Sparrate-RPCs dürfen nicht filtern"* ist damit **abgelöst**: Er
stammte aus der Zeit des Verbergens. Seit v2-05 ist `deleted_at` reiner
Papierkorb-Marker, und was im Papierkorb liegt, soll nicht mitrechnen.

> ### ⚠️ Die Begründung dieses Absatzes gilt seit v2-25 NICHT MEHR
>
> Hier stand: *„§2.1 bleibt gewahrt, weil `card_delete_gate` keine Karte mit
> Vergangenheit löschen lässt."* Seit **v2-25 (`KJ-1`) lässt es genau das zu** —
> `HAS_PAST_PLAN` ist entfallen. Eine Löschung kann die Sparrate **vergangener Monate
> bewegen**, und das ist der Zweck: Sie korrigiert eine irrtümlich angelegte Karte,
> statt sie zu konservieren.
>
> **§2.1 ist damit nicht verletzt, sondern anders gewahrt.** Die Snapshot-Integrität
> schützt davor, dass sich eine vergangene Zahl **unbemerkt** ändert — nicht davor,
> dass der Nutzer sie bewusst korrigiert. Deshalb ist die Sperre durch eine **Anzeige**
> ersetzt worden: `delete_card` misst die Wirkung und `§12.5` nennt sie im Toast, mit
> `Rückgängig` für fünf Sekunden.
>
> **Was daraus für neue Aufrufer folgt:** Wer `deleted_at` setzt, ohne über
> `delete_card` zu gehen, umgeht sowohl die Torprüfung als auch die Anzeige — und
> bewegt vergangene Sparraten schweigend. Das ist die Stelle, an der §2.1 tatsächlich
> bricht.

---

## 10. Was direkt anschließend zu tun ist

### 10.1 Cleanup-Edge-Function für `deleted_entities`

Pseudocode für die Edge Function (alle 30 Sekunden ausgeführt):

```typescript
const expired = await supabase
  .from('deleted_entities')
  .select('*')
  .lte('expires_at', new Date().toISOString())
  .is('restored_at', null);

for (const row of expired.data) {
  switch (row.entity_type) {
    case 'CARD_END':
      await supabase.from('cards')
        .update({ last_active_month: row.payload.new_last_active_month })
        .eq('id', row.entity_id);
      break;
    case 'CARD':
      await supabase.from('cards').delete().eq('id', row.entity_id);
      break;
    case 'CARD_FRAGMENT_LINK':
      await supabase.from('card_fragment_links').delete().eq('id', row.entity_id);
      break;
    case 'FRAGMENT':
      await supabase.from('fragments').delete().eq('id', row.entity_id);
      break;
  }
  await supabase.from('deleted_entities').delete().eq('id', row.id);
}
```

**Hinweis V1:** Aktuell genutzte ENUM-Werte sind `CARD_END` und `CARD`. `CARD_FRAGMENT_LINK` und `FRAGMENT` bleiben für V2 reserviert (Eject und Fragment-Delete laufen direkt ohne Trash-Umweg).

**Hinweis V3.1:** Soft-Delete von Karten (`cards.deleted_at`) läuft **nicht** über die Cleanup-Edge-Function. Hide ist explizit reversibel (5s-Toast-„Rückgängig" via `toggle_card_hidden(card_id, false)`) und ohne Retention-Limit — der User soll die Karte selbst entscheiden, ob sie verborgen bleibt. Ein User-Pfad zum Wieder-Einblenden ist V2-Vormerkung.

**Hinweis v2-05 (löst Hinweis V3.1 ab):** Der Trash-Flow für Karten ist seit Sprint v2-05 tatsächlich verdrahtet — `delete_card` nutzt das bestehende `schedule_deletion('CARD', id, row-snapshot)`, `restore_card` nutzt das bestehende `restore_deletion(trash_id)`, und `cleanup_expired_card_trash()` vollzieht den Hard-Delete opportunistisch beim nächsten App-Zugriff (Option b aus dem Architekt-Stufe-1-Papier) statt über eine Cleanup-Edge-Function. `cards.deleted_at` ist damit **kein** Verbergen-Marker mehr, sondern ausschließlich Papierkorb-Marker: gesetzt nur von `delete_card`, nur bei grünem `card_delete_gate` (also nie für Karten mit Vergangenheits-Links/-States/-Plan). Die RPC `toggle_card_hidden` ist per DROP entfernt (Beschluss E2) — Hinweis V3.1 oben beschreibt damit einen abgelösten Zustand.

### 10.2 Migration als versionierte Datei ablegen

Die Migrationen in `supabase/migrations/` reproduzierbar halten. Sprint 5–8 hat 6 zusätzliche RPCs / Spalten / Trigger eingeführt, die in einer eigenen 0002…-Migrationsdatei zusammengefasst werden sollten.

### 10.3 RPC-Wrapper im Frontend regenerieren

Nach Sprint 5–8-Erweiterungen einmal:

```bash
supabase gen types typescript --project-id <id> > src/lib/supabase-types.ts
```

Damit kennen die TS-Typen alle neuen RPCs der letzten Sprints (`create_card_direct`, `create_card_from_fragment`, `get_effective_plan_for_month`, `toggle_card_manually_paid`, `process_csv_import`, `calculate_planned_sparrate_for_month`, `toggle_card_hidden`), die neuen Fragment-Spalten (`confidence`, `suggested_card_id`, `imported_at`, `counterparty_iban`, `transfer_type`), die neue `profiles.own_ibans`-Spalte und die erweiterte `process_csv_import`-Signatur mit zwei Parametern.

---

## 11. Indexes — Hot-Path-Beschleunigung

Sechs funktionale / partielle Indexes über die v2-PK/UK-Indexes hinaus:

| Tabelle | Index | Zweck |
|---|---|---|
| `cards` | `idx_cards_user_active` (partial, `WHERE deleted_at IS NULL`) | Hot-Path-Karten-Listing pro User |
| `cards` | `idx_cards_active_range` (partial) | `is_card_active_in_month`-Lookup |
| `card_planned_timeline` | `idx_card_planned_lookup (card_id, effective_month DESC)` | Forward-Inheritance-Lookup |
| `card_monthly_states` | `idx_states_card_month`, `idx_states_user_month` | Monats-State-Lookup |
| `card_fragment_links` | `idx_links_card_month`, `idx_links_user_month` | Realitäts-Sum-Lookup |
| `fragments` | `idx_fragments_user_date`, `idx_fragments_description_trgm` (GIN auf `description gin_trgm_ops`) | Roh-Liste + Distiller-Trigram-Score |
| `fragments` | `idx_fragments_transfer_type` (partial, `WHERE transfer_type IS NOT NULL`) | Schneller Filter für Transfer-Sicht in UI |
| `income_timeline` | `idx_income_timeline_lookup (user_id, person, effective_month DESC)` | Netto-Forward-Inheritance |
| `net_estimation_brackets` | `idx_brackets_lookup (tax_class, tax_year, gross_annual_min)` | Bracket-Lookup |
| `deleted_entities` | `idx_deleted_pending`, `idx_deleted_user_pending` (beide partial `WHERE restored_at IS NULL`) | Cleanup-Edge-Function-Polling |

---

## 12. Trigger-Übersicht

| Trigger | Tabelle | Timing | Funktion | Zweck |
|---|---|---|---|---|
| `on_auth_user_created` | `auth.users` (extern) | AFTER INSERT | `handle_new_user()` (DEFINER) | Auto-INSERT `profiles`-Row |
| `cards_assert_initial_plan` | `cards` | AFTER (DEFERRABLE INITIALLY DEFERRED, CONSTRAINT) | `assert_card_has_initial_plan()` | Erzwingt: jede `cards`-Row hat mindestens eine `card_planned_timeline`-Zeile am Transaktions-Ende |
| `cards_set_updated_at` | `cards` | BEFORE UPDATE | `set_updated_at()` | Auto-`updated_at = now()` |
| `card_monthly_states_set_updated_at` | `card_monthly_states` | BEFORE UPDATE | `set_updated_at()` | Auto-`updated_at = now()` |
| `profiles_set_updated_at` | `profiles` | BEFORE UPDATE | `set_updated_at()` | Auto-`updated_at = now()` |
| `trg_oqb_no_transfer_links` | `card_fragment_links` | BEFORE INSERT OR UPDATE OF `fragment_id` | `enforce_no_transfer_fragment_links()` | Weist Links auf Fragmente mit `transfer_type IS NOT NULL` mit 23514 ab. Schließt „direktes Client-INSERT unter RLS" und `create_card_from_fragment`. OQ-B damit dreischichtig |
| `rls_auto_enable` (Event-Trigger) | (DB-global) | DDL `CREATE TABLE` | `rls_auto_enable()` (DEFINER) | Aktiviert RLS automatisch auf jede neue Tabelle |

---

## 13. Globale Konstanten — `app_config`

| Key | Wert | Bedeutung |
|---|---|---|
| `confidence.weight_name` | `0.50` | Gewicht Trigram-Namensähnlichkeit |
| `confidence.weight_amount` | `0.30` | Gewicht Betrag-Bracket |
| `confidence.weight_frequency` | `0.20` | Gewicht Frequenz-Aktiv |
| `confidence.minimum_match_threshold` | `0.20` | Unter dieser Schwelle: Score wird auf 0 zurückgesetzt |
| `confidence.badge_threshold` | `0.60` | Über dieser Schwelle: Suggestion-Badge im Frontend |
| `confidence.auto_absorption_threshold` | `0.95` | Über dieser Schwelle: Auto-Absorb via Distiller-Pipeline |
| `confidence.history_score` | `0.94` | Wiedererkennung: Score wird auf diesen Wert **gehoben**, nie gesenkt. Bewusst **unter** 0.95 — erzeugt einen Vorschlag, nie eine automatische Verknüpfung |
| `confidence.merchant_rule_score` | `0.96` | **(v2-28)** Händler-Treffer: Score wird auf diesen Wert gehoben. Bewusst **über** 0.95 — verlinkt beim Import automatisch. Absenken unter 0.95 macht daraus einen bloßen Vorschlag, ohne Migration |
| `matching.merchant_rules` | JSON-Objekt | **(v2-28)** Zweistufige Händler-Wortlisten, geschlüsselt nach **Kartenname**: `eindeutig` · `mehrdeutig` · `zweitsignal_woerter` · `zweitsignal_betrag_min` / `_max`. Gelesen von `merchant_rule_match`. **Achtung:** Kartenname als Schlüssel — nach einer Umbenennung greift die Regel still nicht mehr |
| `trash.retention_seconds` | `60` | UI versteckt Trash-Zeile nach 5 s, Edge-Function löscht final nach diesem Wert |

Alle Werte als JSONB gespeichert (`value` Spalte). Read-Path: `(value::text)::numeric` oder `(value->>0)` je nach Cast.

---

## 14. Verbleibender Notiz-Zettel aus Phase 1

Eine offene Doku-Aufgabe (Phase 1, Frage 5):
Section 3.2 des ursprünglichen Design-Dokuments schreibt „Σ Planwerte aller Fixkosten (Ich-Anteil)" — bei Budget-Karten fehlt das „Ich-Anteil". In der Implementierung ist das korrekt behandelt (Budget-Karten sind durch `budget_never_shared`-Constraint nie GEMEINSAM, also implizit immer ICH-Anteil = 100 %). Diese Inkonsistenz ist im überarbeiteten Design-Dokument v2 behoben.

---

## Was du jetzt hast

Eine vollständig instrumentierte Datenbank für Antigravity Finance 1.0 — inklusive Sprint-5-Card-CRUD, Sprint-6-Sparrate-Gate, Sprint-7-BUDGET-Tap, Sprint-8-Distiller-Pipeline. Jede Sparrate ist deterministisch berechenbar aus eingefrorenen Quellen. Jede User-Aktion hat genau eine definierte DB-Operation. Jede Lösch-Operation hat einen Pfad, ein Limit und ein Rückgängig-Fenster. Snapshot-Integrität ist nicht eine Anwendungs-Regel — sie ist eine Schema-Eigenschaft. CSV-Import ist atomar und re-import-deterministisch.

---

*Architekt-Persona | Antigravity Finance 1.0 | 24. Mai 2026*

---

## 15. Betriebsnotiz — v2-04 (einmalig, kein Dauerzustand)

> Im Zuge von v2-04 wurden am 06.07.2026 alle importierten Daten sowie drei `manually_paid`-Testzustände gelöscht (Ausnahme 1, pre-go-live Wegwerf-Zustand). Karten (31) und Plan-Zeitreihen blieben unberührt. Option-A-/Zwei-Personen-Ausnahmen dieses Sprints sind **nicht** fortgeltend; ab vorhandenen Echtdaten gelten Test-Projekt-Gate und Zwei-Personen-Prinzip wieder uneingeschränkt (Briefing §0a).
