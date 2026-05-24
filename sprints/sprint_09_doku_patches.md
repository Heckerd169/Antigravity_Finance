# Sprint 9 — Doku-Patches (Design-Dokument v3)

> **Lieferant:** Claude Code (Sprint-9-Implementierungs-Chat)
> **Adressat:** PM-Chat — Verifikation + Anwendung gemäß LL-16
> **Datum:** 24. Mai 2026
>
> Claude Code editiert die Design-Doku NIE selbst (CLAUDE.md „Was Claude Code
> NIE macht"). Diese Datei liefert die Patches als Anker + Patch-Satz pro Stelle.
> Der PM verifiziert und gibt zur Anwendung frei.

---

## Patch 1 — §11 Hash-Algorithmus: zweiter Bank-Adapter (Cortal Consors)

**Anker:** §11, Abschnitt „Hash-Algorithmus", unmittelbar nach dem bestehenden
DKB-Adapter-Block (aus Sprint 8).

**Einzufügen (neuer Block, DKB-Block bleibt unberührt):**

> **Cortal-Consors-Adapter (DD-approved, Sprint 9):**
> `description_raw` wird gebildet als
> `"{Sender / Empfänger} | {Buchungstext} | {Verwendungszweck}"` — alle drei
> Felder byte-exakt aus der CSV-Quelle, ohne Trimming, ohne Normalisierung.
> Pipe-Separator mit Spaces als Trenner (drei Felder, zwei Separatoren).
> `n/a`-Werte werden als Literal `"n/a"` belassen (kein NULL für Description-
> Bestandteile). Der Hash-Determinismus bleibt erhalten: die Hash-Formel ist
> unverändert `sha256(transaction_date | amount_fixed | description_raw)`.
> `counterparty_iban` ist **nicht** Hash-Bestandteil — damit trifft ein
> Re-Import bestehende Hashes und füllt die IBAN per `ON CONFLICT DO UPDATE`
> nachträglich (Backfill).

---

## Patch 2 — §11 INTERNAL_TRANSFER-Status (Cross-Account-Erkennung)

**Anker:** §11, neuer Unterabschnitt am Ende von §11 (nach dem Mehrfach-Match-
Tiebreaker aus Sprint 8).

**Einzufügen:**

> **Cross-Account-Erkennung (`INTERNAL_TRANSFER`, Sprint 9):**
> `profiles.own_ibans text[]` führt die eigenen Konto-IBANs des Users. Beim
> Import wird jede Zeile, deren `counterparty_iban` in `own_ibans` enthalten
> ist, als `fragments.transfer_type = 'INTERNAL_TRANSFER'` markiert (greift
> sowohl für neu eingefügte Fragmente als auch für IBAN-Backfill bestehender
> Fragmente). Eine Transfer-Markierung löst bestehende
> `card_fragment_links`-Zuordnungen des Fragments und bereinigt eine etwaige
> KI-Vorschlag-Markierung (`suggested_card_id` / `confidence`) — ein Transfer
> kann nicht gleichzeitig einer Karte zugeordnet sein (Daten-Invariante). Im
> View `fragments_with_status` hat der Status `'INTERNAL_TRANSFER'` die höchste
> Priorität und schlägt `UNASSIGNED` / `ASSIGNED` / `AUTO_ABSORBED`.
> **Konsequenz:** Jede Bewegung zwischen zwei eigenen Konten wird markiert —
> nicht nur ausdrücklich als „Übertrag/Sparen" betitelte, sondern auch
> Erstattungen, Geschenke etc., sofern sie über ein eigenes Konto laufen. Das
> ist gewollt: der Geld-Saldo verlässt das Gesamtvermögen nicht.

---

## Patch 3 — §10 Fragment-Stack: Rendering-Regel `INTERNAL_TRANSFER`

**Anker:** §10, Abschnitt „Fragment-Stack", nach der Sortier-Regel (aus
Sprint 8 P5).

**Einzufügen:**

> **Status `INTERNAL_TRANSFER` (Sprint 9):** Ein Fragment mit Status
> `INTERNAL_TRANSFER` rendert gedimmt (Opacity 0.45 — heller als ein
> zugeordnetes Fragment) mit einem Badge „TRANSFER" in neutralem Grau-Soft
> (bewusst nicht das Yellow-Soft des KI-Vorschlag-Badges, damit visuell
> unterscheidbar). Das Fragment hat **kein** Tap-/Drag-Verhalten (Cursor
> `default`, `pointer-events: none`). Dieser Status schlägt alle anderen Stati
> in der Darstellung. In der Stack-Sortierung zählt es zur Gruppe der
> nicht-unzugeordneten Fragmente (unten), nicht zur Arbeitsfläche oben; es zählt
> nicht in die „N Fragmente offen"-Zählung der Header-Flanke.

---

## Patch 4 — §10 / §11: Backfill-Report-Toast (Quittung)

**Anker:** §11 (Import-Pipeline-Feedback) oder §8 (Untere Interaktionszone /
Portal) — PM-Entscheidung, wo thematisch passender.

**Einzufügen:**

> **Backfill-Report-Toast (Sprint 9 §6.2):** Nach einem CSV-Import erscheint
> direkt unter dem Portal (Drop-Zone) eine kurze Quittung, sofern mindestens
> einer der Counter `iban_backfilled_count`, `internal_transfers_count`,
> `links_removed_for_transfers_count` > 0 ist. Der Toast zeigt nur die Counter
> > 0, je eine Kurzzeile (`N Fragmente mit IBAN ergänzt` / `M Bewegungen als
> Transfer erkannt` / `K Karten-Zuordnungen gelöst`), ist 4 s sichtbar
> (Fade-In/Fade-Out) und nicht interaktiv. Bei sukzessivem Re-Import zeigt jeder
> Toast nur die Counter des aktuellen Imports, nicht kumulativ.

---

*Sprint-9 Doku-Patches · 24. Mai 2026*
