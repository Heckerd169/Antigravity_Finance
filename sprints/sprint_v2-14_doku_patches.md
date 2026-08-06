# Sprint v2-14 — Doku-Patches (`LQ-1`)

**Verfahren:** LL-16 / §7 Regel 14 — Anker + Patch-Satz je Stelle, keine direkte
Bearbeitung der Bibeln. Anker vor der Anwendung einzeln auf Eindeutigkeit geprüft.

**Grundlage:** Befund `V2/befunde_2026-08-05_liquiditaet.md` §L2 · Roadmap Paket 3 ·
Migration `supabase/migrations/20260806_v2_14_lq1_faelligkeitstag.sql`.

> **Nur die Schema-Doku wird gepatcht.** Die Design-Doku bekommt in diesem Sprint
> **keine** Änderung — `due_day` ist bislang reine Datenhaltung, es gibt nichts zu
> sehen. Sobald `LQ-2` die Zahl anzeigt und die Nachmittagsrunde entschieden hat, wo
> der Tag auf der Karte steht, gehört das in §7 und §12.3. Eine Karten-Eigenschaft in
> die Design-Doku zu schreiben, die niemand sehen kann, wäre eine Zusage auf Vorrat.

---

## S1 · Neuer „Änderungen"-Block

**Anker** (Ende des v3.4.1-Blocks, unmittelbar vor `**\`transfer_type\`` …):

```
  durch „Globale Konstanten — `app_config`" belegt. Keine schema- oder
  datenseitige Änderung, reine Nummerierungskorrektur (Sprint-v2-08-Review
  §6 F4).
```

**Patch-Satz** — direkt **danach** einfügen:

```markdown

**Änderungen v3.4.3 → v3.4.4 (Sprint v2-14 „Fälligkeitstag", `LQ-1`):**

- `cards`: **+1 Spalte** — `due_day smallint NULL`, CHECK `cards_due_day_range`
  (`NULL` oder `1..31`). Tag im Monat, an dem die Karte fällig ist.
- **`NULL` ist ein Wert, keine Lücke.** Er steht für „kein Termin" und ist der
  korrekte Zustand bei **BUDGET**-Karten (ein Budget ist eine Erlaubnis ohne
  Termin, Befund `L7`) sowie bei Karten ohne Buchungshistorie.
- **Gespeichert wird der SOLL-Tag, nicht der reale Buchungstag.** Sieben Karten
  zeigen über 19 Monate dasselbe Muster: gebucht am 1., 2., 3. oder 4. — nie
  früher. Das ist ein Dauerauftrag zum Ersten, der auf den nächsten
  Bankarbeitstag rutscht. Die Klammerung auf die tatsächliche Monatslänge
  (Februar) gehört in die Vorhersage-Logik, **nicht** in die Spalte.
- Keine RPC, keine Rechenfunktion und keine bestehende Spalte berührt. Die
  Sparrate ist von der Erweiterung **nicht** betroffen — nachgewiesen über alle
  zwölf Monate 2026, Ist und Plan, vor und nach der Anwendung.
- Es gibt **noch keine Oberfläche** zum Setzen des Werts. Die 17 Startwerte kommen
  aus der Migration, abgeleitet aus der Buchungshistorie; die Bearbeitung folgt
  mit `LQ-2` nach der Gestaltungsrunde.
```

---

## S2 · Header — Version + Changelog

**Anker:**

```
**Version:** 3.4.3
```

**Patch-Satz:**

```markdown
**Version:** 3.4.4
```

**Anker 2** (Changelog-Zeile v3.4.3) — **davor** einfügen:

```markdown
> **Changelog v3.4.4 (06.08.2026, Sprint v2-14 · `LQ-1`):** `cards` bekommt **`due_day smallint NULL`** (CHECK `1..31`) — den Tag im Monat, an dem die Karte fällig ist. Damit wird die Frage „was steht bis zum Stichtag noch aus?" überhaupt formulierbar; bis dahin legten Frequenz und erster aktiver Monat nur den *Monat* fest (Befund `L2`). `NULL` bedeutet „kein Termin" und ist der richtige Wert für **BUDGET**-Karten (Befund `L7`) und für Karten ohne Historie. Gespeichert wird der **Soll-Tag**, nicht der reale Buchungstag — Daueraufträge zum Ersten rutschen auf den nächsten Bankarbeitstag. Die 17 Startwerte sind aus `fragments` abgeleitet, nicht geschätzt. Migration: `supabase/migrations/20260806_v2_14_lq1_faelligkeitstag.sql`. **Keine Rechenfunktion berührt** — alle zwölf Monate 2026 vor und nach der Anwendung identisch.
```

---

## Nicht Teil dieses Patches

| Was | Warum |
|---|---|
| Design-Doku §7 / §12.3 | `due_day` ist noch nicht sichtbar. Kommt mit `LQ-2`, nach der Gestaltungsrunde. |
| Schema-Doku §1 (Zählwerte) | Eine Spalte ändert weder Tabellen- noch RPC-Zahl. |
| Schema-Doku §4 (RPC-Katalog) | Keine RPC angefasst. |
| `CLAUDE.md` | Braucht eigene Freigabe (§7 Regel 14); es entsteht keine neue Dauerregel. |

---

*Doku-Patches Sprint v2-14 · Antigravity Finance · 06. August 2026*
