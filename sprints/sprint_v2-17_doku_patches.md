# Doku-Patches — Sprint v2-17

> **Verfahren:** LL-16 / §7 Regel 14 — Anker + Patch-Satz je Stelle, keine direkte
> Bearbeitung ohne festgehaltenen Anker.
>
> **Betroffen:** **Design-Doku** (`antigravity_finance_design_dokument.md`) **und
> Schema-Doku** (`antigravity_finance_schema_summary.md`). Anders als in v2-16 ist die
> Schema-Doku diesmal berührt — der Sprint legt eine Tabelle und sechs RPCs an.
>
> **CLAUDE.md steht am Ende als Vorschlag** und ist **nicht** angewendet —
> §7 Regel 14 verlangt dafür die ausdrückliche Freigabe des Users.
>
> **Versions-Bumps:**
> · Design-Doku 3.4.0 → **3.5.0**. Minor, nicht Patch: §8 bekommt eine ganz neue
>   Struktur, §12 einen neuen Block, §11 benennt einen bestehenden Begriff um, §1 wird
>   präzisiert.
> · Schema-Doku 3.4.4 → **3.5.0**. Minor: neue Tabelle, neue Spalte, sechs neue RPCs.
>
> **Achtung — das Ziel wurde korrigiert.** Der Beschluss-Record nennt unter
> „Doku-Folge" **v3.4.0** als Ziel für die Design-Doku, ausgehend von v3.3.1. Diese
> Nummer ist inzwischen vergeben: Sprint v2-16 hat sie am 07.08.2026 belegt. Der Patch
> geht deshalb auf **v3.5.0**. Der Record ist an der Stelle entsprechend ergänzt.
>
> **Angewendet am 08.08.2026**, D1–D9 und S1–S7. Alle Anker vor der Anwendung einzeln
> auf Eindeutigkeit geprüft.

---

# Teil 1 · Design-Doku (3.4.0 → 3.5.0)

## D1 · Header — Version und Status

**Anker:** `**Version:** 3.4.0 (V2 · Sprint v2-16 — Schaufenster-Popup und Konsequenz-Anzeige)`

**Patch:** Version auf **3.5.0 (V2 · Sprint v2-17 — Kategorien im Karussell)**;
Status-Zeile um `KAT-1` · `KAT-2` · `KAT-3` und die Schema-Doku-Version **v3.5.0**
ergänzt; „Aus der Runde vom 06.08." → „Aus den Runden vom 06.08. und 07./08.08.".

## D2 · Changelog — neuer Eintrag v3.5.0

**Anker:** `> **Changelog v3.4.0 (07.08.2026, Sprint v2-16 · `RM-2` + `PA-1`):** §8 — die`

**Patch:** Neuer Changelog-Block **vor** dem v3.4.0-Eintrag (jüngster zuerst). Er nennt
die fünf berührten Paragraphen und **die widerlegte Zusicherung**: Die Anweisung der
Gestaltungsrunde („ungerundet summieren, erst am Ende runden") ist notwendig, aber
nicht hinreichend; die Lücke betrug 0,01 € in allen zwölf Monaten.

## D3 · §1 — Präzisierung „zweiter Ort ≠ Faltung"

**Anker:** `**Single Surface.** Ein Screen, ein Monat, eine primäre Zahl. Keine Tab-Navigation, keine separaten Screens.`

**Patch:** Blockzitat direkt darunter. Es hält fest, dass dieser Satz und seine
Geschwister in §7 und §8 einen zweiten **Ort** oder eine zweite **Reihe** treffen —
**keiner** eine Gliederung innerhalb der einen Reihe. Mit der Unterscheidung Akkordeon
↔ Reiter und dem Hinweis, dass die App seit Sprint 4 ohnehin stumm gruppiert.

> **Warum eine Präzisierung und keine Änderung.** Befund `U2` führt die drei Verbote
> als BLOCKER und stellte die Wahl „Verfassung ändern **oder** ohne Navigationsebene
> auskommen". Die Runde hat einen dritten Weg gefunden. Eine Verfassungs-Änderung wäre
> die teurere Antwort auf eine Frage gewesen, die sich als Missverständnis erwies.

## D4 · §7 — Karussell-Sortierung gilt innerhalb eines Ordners

**Anker:** `**Karussell-Sortierung:** Fixkosten-Karten zuerst, dann Einnahmen-Karten, dann Budget-Karten. Ein gemeinsames Karussell, keine getrennten Reihen.`

**Patch:** Blockzitat darunter (Sortierung gilt ab `KAT-2` **innerhalb** eines Ordners,
Reihenfolge der Ordner steht in `card_categories.sort_order`), plus ein neuer Absatz
**„Karten sind KEINE Drag-Quellen"** mit der Begründung aus `U3`/`B8` und dem Satz
*„Wer das später nachrüsten will, liest zuerst U3 und B8 im Record."*

## D5 · §7 — Kontextmenü: neuer Punkt `Kategorie ändern …`

**Anker:** Die Tabelle `| Karten-Typ | Optionen |` mit den Zeilen
`| Fixkosten / Einnahmen | ... |` und `| Budget | ... |`

**Patch:** Beide Zeilen um `Kategorie ändern …` ergänzt. Darunter ein neuer
Spezifikations-Block: Erscheint auf **allen** Karten (auch Ghost — die Kategorie ist
eine Eigenschaft der Karte, kein Monats-Zustand), Overlay-Inhalt, Unterzeile
`gilt für alle Monate`, Rückwirkung mit der Begründung gegen Befund `D3`, dem Nachweis
gegen §2.1 und dem Satz „Eine Kategorie entsteht dadurch, dass man ihr eine Karte gibt".

## D6 · §8 — neuer Block „Kategorien"

**Anker:** `### Karussell (Mitte)` samt der drei Aufzählungszeilen darunter.

**Patch:** Die Aufzählung nennt jetzt die Gliederung; darunter der neue Abschnitt
**„Kategorien (seit `KAT-2`, 08.08.2026)"** mit sieben Unterabschnitten: Die Kachel ·
Vorzeichen · Klammer · Sichtbarkeit und Reihenfolge · Die beiden Sammelbecken ·
Zustände über die Zeit · Aufklappen · Die Zahl eines Ordners · Löschen.

**Der Warnkasten „Die Spalte geht auf — und zwar erzwungen, nicht zufällig"** steht
darin und trägt die gemessenen Zahlen. Er ist die wichtigste Stelle des ganzen Patches.

## D7 · §8 — „Was explizit NICHT"

**Anker:** Die Liste unter `### Was explizit NICHT`, Zeile `- Keine zwei Karussell-Reihen`

**Patch:** Die Zeile ist präzisiert (gemeint ist eine zweite, eigenständige Reihe), und
zwei Verbote kommen dazu: **keine Kategorie als `cards`-Zeile** (mit `D1` und der
vollständigen Liste der betroffenen Funktionen) und **keine Ebene unter der Kategorie**
(mit `D13` / `UNIQUE(fragment_id)`).

## D8 · §11 — „Kategorie-Badge" → „Vorschlag-Badge"

**Anker (2 Stellen):**
1. `| Kategorie-Badge (nur 0.60–0.95) | ...` in der Feld-Tabelle
2. Die beiden Zeilen `- Keine interaktiven Kategorie-Badges (nur informativ)` und
   `- Keine Kategorie-Vorhersage in V1 (Karten-Zuordnung reicht)`

**Patch:** Umbenannt in **Vorschlag-Badge** / **Vorschlags-Vorhersage**, plus ein
Blockzitat mit der Begründung gegen Befund `U6` und dem Warnhinweis, dass die Roadmap
unter `M6` ein Thema „F2 Kategorie-Vorhersage" führt, das **dieses** Badge meint.

## D9 · §12.11 — neuer Copy-Block · §3 — neue Tokens

**Anker §12:** `| Zeile — KI-Vorschlag | ... |` gefolgt von `---` und `## 13. Bekannte Limitationen V1`

**Patch:** Neuer Abschnitt **§12.11 Kategorien** *vor* der Trennlinie zu §13, mit
sieben Tabellen (Ordner-Kachel · Einkommens-Ordner · Unsortiert · Kontextmenü der Karte
· Overlay „Kategorie ändern" · Kontextmenü der Kachel · Overlay „umbenennen" ·
Lösch-Toast) und zwei Begründungs-Absätzen.

**Anker §3:** `| `--badge-hue-1` … `--badge-hue-6` | ...` gefolgt von `### Typographie`

**Patch:** Neun neue Token-Zeilen plus der Satz **„Die Kategorie-Tokens bringen KEINE
neue Farbe"** mit der Begründung aus dem Grundsatz „Schmale Palette".

---

# Teil 2 · Schema-Doku (3.4.4 → 3.5.0)

## S1 · Header — Version, Status, Changelog

**Anker:** `**Version:** 3.4.4` bis `> **Changelog v3.4.4`

**Patch:** Version **3.5.0**, Datum 08. August 2026, Status um „Sprint v2-17
Kategorien" ergänzt. Neuer Changelog-Block mit: Tabelle, Spalte, sechs RPCs, dem
**Papierkorb-Verzicht** (`D7`), der **RLS-Policy von Hand** (`D8`), dem Nachweis
**byte-identischer Prüfsummen** aller vier Rechenfunktionen und der neuen
**Baseline-Datei** (`J1` / `D15`).

## S2 · §1 — Bestandszahlen und Diagramm

**Anker:** `10 Tabellen, 1 View, **26 App-RPCs** ...` samt ASCII-Diagramm

**Patch:** **11 Tabellen · 32 App-RPCs · 7 Trigger**; `card_categories` im Diagramm
unter KARTEN; Hinweis an `deleted_entities`, dass es **keine** Kategorien trägt. Darunter
ein Blockzitat, warum die Tabelle **neben** `cards` steht und **keine Betrags-Spalte**
hat.

## S3 · §2 — Lese-Hilfe

**Anker:** `- Cascading: Karte gelöscht → States + Links weg, Fragmente bleiben (sie sind unabhängig)`

**Patch:** Neue Zeile zu `cards.category_id` als **schwacher** Referenz mit
`ON DELETE SET NULL` und der Feststellung, dass `NULL` dort ein **regulärer** Wert ist
(Befund `D12`).

## S4 · §3 — Wahrheits-Quellen

**Anker:** `Die Sparrate ist nirgends gespeichert. Sie wird zur Laufzeit aus diesen vier Quellen berechnet:`

**Patch:** Blockzitat darunter: **`card_categories` ist KEINE fünfte Quelle.** Genau
deshalb darf die Zuordnung eine einfache Spalte sein und rückwirkend gelten, ohne §7
zu verletzen.

## S5 · §4 — neuer RPC-Abschnitt

**Anker:** `### Beim Karten-CRUD (Sprint 5)`

**Patch:** Neuer Abschnitt **„Bei den Kategorien (Sprint v2-17)"** davor, mit einer
Tabelle über alle sechs RPCs, dem Hinweis auf den `auth.uid()`-Guard (*nicht* redundant
— MCP läuft als Service-Rolle an RLS vorbei) und dem **Warnkasten zur Rundung**
inklusive der Prüfanweisung für künftige Eingriffe.

## S6 · §6 — Lösch-Logik

**Anker:** `| **deleted_entities** | Cleanup-Job nach `expires_at`. Restored-Zeilen bleiben dauerhaft |`

**Patch:** Zeile ergänzt („trägt KEINE Kategorien"), neue Zeile **`card_categories`**,
und darunter ein Blockzitat mit der vollständigen Herleitung aus Befund `D7` — samt
Hinweis für den späteren `G1`-Sprint, warum Kategorien dort nicht auftauchen.

## S7 · §8 — RLS

**Anker (2 Stellen):**
1. Die Tabelle mit `| card_fragment_links | Owner | Owner |`
2. `**Event-Trigger `rls_auto_enable`:** stellt sicher, dass jede neue public-Tabelle ...`

**Patch:** Neue Tabellenzeile `card_categories`. Am Event-Trigger ein Warnkasten: Er
legt **keine Policy** an und **schluckt sein eigenes Scheitern** — die Folge ist ein
stilles `[]` beim SELECT und 42501 beim INSERT, was sich beim Testen wie „noch keine
Daten" liest. **Regel:** Wer eine Tabelle hinzufügt, schreibt Policy und `ENABLE` von
Hand in die Migration.

---

# Teil 3 · CLAUDE.md — C1 bis C4 ANGEWENDET (Freigabe 08.08.2026)

> §7 Regel 14 verlangt für diese Datei die ausdrückliche Freigabe des Users. Sie liegt
> seit dem 08.08.2026 vor („die CLAUDE.md-Patches sind freigegeben") und bezieht sich
> auf die vier unten stehenden Patches **C1–C4**. Sie sind angewendet.
>
> **C5 und C6 sind NICHT angewendet.** Sie sind mir beim Schreiben aufgefallen und
> standen nicht in dem Satz, den der User freigegeben hat. Eine gegatete Datei
> stillschweigend über die Freigabe hinaus zu erweitern, hebt das Gate praktisch auf —
> deshalb stehen sie als eigene Vorschläge am Ende.

## C1 · §6 Stolperfalle 4 ist FALSCH und gehört korrigiert

**Anker:** `4. **Hot-Path-RPCs nehmen kein `p_user_id`** (RLS über `auth.uid()`). ... Einzige Ausnahme mit `p_user_id`: `get_split_factor`.`

**Vorschlag:** Die Aussage stimmt nicht. Gemessen gegen `pg_proc`:

| Funktion | Signatur |
|---|---|
| `calculate_sparrate_for_month` | `(p_user_id uuid, p_month date)` |
| `calculate_planned_sparrate_for_month` | `(p_user_id uuid, p_month date)` |
| `get_split_factor` | `(p_user_id uuid, p_month date)` |
| `get_net_monthly_for_month` | `(p_user_id uuid, p_person person_role, p_month date)` |
| `get_category_amounts_for_month` *(neu)* | `(p_user_id uuid, p_month date)` |
| `calculate_card_amount_for_month` | `(p_card_id uuid, p_month date)` — ohne |
| `is_card_active_in_month` | `(p_card_id uuid, p_month date)` — ohne |

Die Regel ist also umgekehrt: **Was über den Nutzer aggregiert, nimmt `p_user_id`;
was eine einzelne Karte auflöst, nicht.** Der Befund stammt aus der Gestaltungsrunde
(Nebenbefund ⑤) und ist in v2-17 unabhängig bestätigt worden.

**Warum das zählt:** Wer nach der bisherigen Fassung einen Aufruf baut, baut ihn falsch.

## C2 · §9 — Sprint-Stand nachziehen

**Vorschlag:** Letzter Sprint **v2-17**; Design-Doku **v3.5.0**, Schema-Doku **v3.5.0**;
Paket 4 abgeschlossen, damit vier der fünf Kettenglieder fertig und der Riegel vor
Paket 5 gefallen; Roadmap-Stand **10 offene Pakete · 28 Themen · 4 Hausaufgaben ·
32 offen gesamt · 41 erledigt**.

**Prüfanker unverändert** — alle zwölf Monate 2026 vor und nach dem Sprint identisch,
B2-Invariante 12/12, Prüfsummen der vier Rechenfunktionen byte-gleich.

**Neu aufzunehmen:** Die Ordner-Spalte ergibt in allen zwölf Monaten exakt die Sparrate.
Das ist ein **zweiter Anker** neben der Sparrate selbst und sollte dort stehen, wo die
Sparraten-Anker stehen.

## C3 · §6 — neue Stolperfalle 13

**Vorschlag:**

> 13. **Eine Aggregation über Teilmengen kann die Schlussrundung der Sparrate nicht
>     nachbilden.** `calculate_sparrate_for_month` rundet **einmal ganz am Ende über
>     alles**. Wer dieselbe Menge in Gruppen zerlegt und jede Gruppe rundet, landet
>     daneben — gemessen 0,01 € in **allen zwölf** Monaten 2026, unabhängig davon, wie
>     sorgfältig innerhalb einer Gruppe gerechnet wird. „Ungerundet summieren, erst am
>     Ende runden" ist **notwendig, aber nicht hinreichend**. Wer eine solche
>     Aufstellung baut, holt sein Ziel aus der Rechenfunktion und verteilt den Rest.
>     (v2-17, LL-25)

## C4 · §8 — neuer Eintrag LL-25

**Vorschlag:**

| # | Kurzfassung | steht in | Ursprung |
|---|---|---|---|
| LL-25 | Eine Aggregation über Teilmengen bildet die Schlussrundung nicht nach — Ziel aus der Rechenfunktion holen, Rest verteilen | §6 Stolperfalle 13 | v2-17 (KAT-3) |

**Warum ein eigener Eintrag neben LL-24.** LL-24 warnt, dass die **Gegenseite anders**
rundet. Hier rundet die Gegenseite **seltener** — das ist eine andere Fehlerklasse, und
sie war in einem Beschluss-Record bereits falsch analysiert worden, ohne dass es jemand
bemerkte.

---

# Teil 4 · Zwei weitere CLAUDE.md-Vorschläge — NICHT angewendet

> Diese beiden sind mir beim Anwenden von C1–C4 aufgefallen. Sie standen **nicht** in
> der Freigabe vom 08.08.2026 und sind deshalb **nicht** eingespielt. Ich hatte sie
> zwischenzeitlich mit hineingeschrieben und wieder entfernt — eine gegatete Datei über
> die Freigabe hinaus zu erweitern, hebt das Gate praktisch auf.
>
> Beide sind kurz und würden als **Stolperfalle 14 und 15** in §6 stehen.

## C5 · §6 — neue Stolperfalle 14: Eine Kategorie ist keine Karte

> 14. **Eine Kategorie ist keine Karte.** `card_categories` steht neben `cards`, hat
>     **keine** Betrags-Spalte, und `cards.category_id` ist nullable mit
>     `ON DELETE SET NULL`. Wer eine Kategorie als `cards`-Zeile anlegt, bricht den
>     Prüfanker sofort: Beide Sparrate-RPCs, `get_year_deviation_drivers` und der
>     Auto-Absorptions-Loop in `process_csv_import` laufen **ohne Typ-Filter** über
>     alle Karten des Monats (Befund D1). `category_id IS NULL` ist ein **regulärer**
>     Zustand („Ohne Kategorie"), kein Fehler — beide Anlage-RPCs kennen keine
>     Kategorie und liefern laufend kategorielose Karten nach (D12). (v2-17)

**Warum es sich lohnt:** Die Versuchung, „nur schnell eine Kategorie-Karte" anzulegen,
ist real — das Karussell zeigt heute Ordner und Karten nebeneinander, und beide sehen
ähnlich aus. Der Fehler wäre still: Die Sparrate wäre falsch, ohne dass etwas kaputt
aussieht.

## C6 · §6 — neue Stolperfalle 15: Neue Tabelle, keine Policy

> 15. **Eine neue Tabelle bekommt RLS automatisch, aber KEINE Policy.** Der
>     Event-Trigger `rls_auto_enable` führt nur `enable row level security` aus und
>     schluckt sein eigenes Scheitern (`EXCEPTION WHEN OTHERS THEN RAISE LOG`).
>     PostgREST liefert dann ein **stilles `[]`** beim SELECT und `42501` beim INSERT —
>     beim Testen liest sich das wie „noch keine Daten angelegt". `ENABLE` **und**
>     Policy gehören von Hand in die Migration. (v2-17, Befund D8)

**Warum es sich lohnt:** Das ist die Fehlerklasse, die eine Stunde Suche an der
falschen Stelle kostet, weil das Symptom nach „noch nichts angelegt" aussieht. In
v2-17 war der Befund bekannt und die Falle deshalb umgangen — beim nächsten Mal steht
er nur noch in einem Befund-Papier vom 04.08.2026.
