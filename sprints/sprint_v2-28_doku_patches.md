# Sprint v2-28 — Doku-Patches

> **Verfahren nach LL-16 / §7 Regel 14:** Die beiden Bibeln werden **nie direkt**
> bearbeitet, sondern über diese Datei — *Anker + Patch-Satz* je Stelle, dann
> angewendet. Der Versions-Bump im Header plus Changelog ist eine **eigene**
> Patch-Stelle, keine Nebensache.
>
> **Jeder Anker wurde vor der Anwendung einzeln auf Eindeutigkeit geprüft.**
>
> **Die Patches für `CLAUDE.md` stehen am Ende dieser Datei**, unter „Nachtrag". Für
> die Verfassung gilt dasselbe Verfahren **plus User-Freigabe vor der Anwendung** —
> beim Schreiben der Bibel-Patches lag sie noch nicht vor, deshalb standen sie
> zunächst nur als Vorschlag in `sprints/sprint_v2-28_review.md` §7. **Freigegeben am
> 24.08.2026, nach bestandenem Browser-Smoke und dem Merge von PR #44.**

---

## Design-Doku — v3.10.0 → **v3.11.0**

**Warum Minor und nicht Patch:** §6 bekommt neue Spezifikation. Der Zustand „Kein
Vormonat" war seit jeher beschrieben — **wann** er eintritt, stand nirgends.

### Patch A · §6 Interaktionslogik — die untere Grenze bekommt eine Definition

**Anker** (in §6, Abschnitt „Interaktionslogik", Tabellenzeile):

```
| Kein Vormonat | Linke Flanke `opacity: 0.2`, `pointer-events: none` |
```

**Patch-Satz:** Unmittelbar nach der Tabelle und **vor** der Zeile
`**Übergangsanimation:**` wird eingefügt:

```markdown
**Wann „kein Vormonat" gilt (v2-28):** Die untere Grenze der Zeitachse ist der
**früheste Monat, in dem eine Karte aktiv ist** — `min(cards.first_active_month)`
über alle nicht gelöschten Karten. Liegt der Vormonat davor, ist die linke Flanke
deaktiviert. Die Grenze wird **aus den Daten abgeleitet**, nicht gesetzt: Nach dem
Import älterer Kontoauszüge rückt sie von allein nach hinten.

Gibt es überhaupt keine Karte, ist der **laufende Monat** die Grenze — im
Onboarding gibt es nichts, wohin man zurückblättern könnte.

**Nach vorn gibt es keine solche Grenze, und das ist Absicht:** Der Forecast soll
blätterbar sein, auch über die Daten hinaus. Die obere Schranke bleibt bewusst
absurd weit.

> **Diese Zeile war über ein Jahr lang tot.** Bis zum 24.08.2026 stand die untere
> Schranke auf `1900-01`, im Code selbst als „absurd weit" markiert — ein
> V1-Platzhalter aus Sprint 3. Der Deaktiviert-Pfad war gebaut und funktionsfähig
> und wurde **nie ausgelöst**; der Zurück-Pfeil führte über Jahrzehnte in eine leere
> Bühne. **Kein Wächter fängt so etwas, weil nichts falsch ist** — jede Zahl stimmt,
> es gibt nur keine.
```

### Patch B · Header — Version, Status, Datum und Changelog

**Anker** (Zeilen 3–5):

```
**Version:** 3.10.0 (V2 · Sprint v2-26 — Nachbesserungen aus der Benutzung)
**Status:** Freigegeben — Schema-Doku v3.12.0; …
**Datum:** 17. August 2026
```

**Patch-Satz:**

```markdown
**Version:** 3.11.0 (V2 · Sprint v2-28 — die Navigation endet, wo die Daten enden)
**Status:** Freigegeben — Schema-Doku v3.13.0; V2-Patches bis Sprint v2-28 eingespielt. Aus den Runden vom 06.08. und 07./08.08.2026 ist alles umgesetzt; `B4` ist seit v2-18 **abgelöst** (siehe §8). Die drei Spezifikationen der Runde vom 17.08.2026 sind gebaut (Sprint v2-25) — eine davon mit einer gemessenen Korrektur an §7, siehe Changelog v3.9.1.
**Datum:** 24. August 2026
```

Und **unmittelbar vor** dem Block `> **Changelog v3.10.0 (18.08.2026, Sprint v2-26):**`
wird eingefügt:

```markdown
> **Changelog v3.11.0 (24.08.2026, Sprint v2-28):** Eine einzige Stelle, aber neue
> Spezifikation — deshalb Minor.
>
> §6 — **die untere Grenze der Zeitachse ist definiert**: der früheste Monat, in dem
> eine Karte aktiv ist, abgeleitet aus den Daten statt gesetzt. Der Zustand „Kein
> Vormonat" war seit jeher beschrieben; **wann** er eintritt, stand nirgends — und
> die Konstante im Code (`1900-01`) sorgte dafür, dass er in über einem Jahr nie
> eintrat.
>
> **Was dieser Eintrag über die Doku sagt:** Hier hatte weder die Doku noch der Code
> unrecht. Die Doku beschrieb einen Zustand, der Code konnte ihn erzeugen — nur die
> **Bedingung** dazwischen fehlte auf beiden Seiten. Das ist eine eigene Lücken-Art:
> keine Abweichung, sondern ein Scharnier, das niemand vermisst hat.
```

---

## Schema-Doku — v3.12.0 → **v3.13.0**

**Warum Minor:** eine neue Funktion, zwei neue `app_config`-Schlüssel, eine geänderte
Funktion. Kein Schema-Eingriff — keine Tabelle, keine Spalte, kein Constraint.

### Patch C · §4 RPC-Katalog — neue Zeile `merchant_rule_match`

**Anker** (die vollständige Zeile zu `history_match`, endet mit
`Das Fragment selbst ist ausgeschlossen | \`numeric\` (0 oder 1) |`).

**Patch-Satz:** Direkt **darunter** wird eingefügt:

```markdown
| `merchant_rule_match(fragment_id, card_id)` **(v2-28)** | Händler-Erkennung über eine **zweistufige Wortliste** aus `app_config` (`matching.merchant_rules`), geschlüsselt nach **Kartenname**. Stufe 1 („eindeutig") genügt ein Wortreffer über `af_word_in_text`; Stufe 2 („mehrdeutig", z. B. `total`, `team`, `jet`) verlangt zusätzlich ein **zweites Signal** — ein Wort aus `zweitsignal_woerter` oder einen Betrag im konfigurierten Band. **Das zweite Signal sucht bewusst per `strpos`, nicht per Wortgrenze:** `af_word_in_text('tank', …)` findet „Tankstelle" **nicht**, weil die Regex hinter dem Wort ein Nicht-Alphanumerisches verlangt — ausgerechnet der Fall, für den Stufe 2 gebaut ist. Überträge (`transfer_type IS NOT NULL`) geben immer `0` zurück (dritte Absicherung neben RPC-Filter und Trigger). **Bekannte Grenze:** Wird die Karte umbenannt, greift die Regel still nicht mehr | `numeric` (0 oder 1) |
```

### Patch D · §4 RPC-Katalog — `calculate_match_confidence` erweitert

**Anker:** die vollständige Zeile zu `calculate_match_confidence`, sie endet mit
`— und das sind die meisten | \`numeric\` (0..1) |`.

**Patch-Satz:** Der Satz `Eine vierte **gewichtete** Komponente wäre falsch gewesen: Sie
hätte alle Scores gesenkt, bei denen keine Historie vorliegt — und das sind die meisten`
bleibt **unverändert stehen**; unmittelbar danach, noch in derselben Zelle, wird
angefügt:

```markdown
. **Seit v2-28 gibt es eine zweite Untergrenze derselben Bauart:** Greift `merchant_rule_match`, wird der Score auf `confidence.merchant_rule_score` (**0,96**) gehoben. Sie steht bewusst **über** der Auto-Absorptions-Schwelle 0,95 — anders als die Wiedererkennung soll ein Händler-Treffer beim Import **automatisch verlinken**. Damit war an `process_csv_import` nichts zu ändern. Beide Untergrenzen benutzen dasselbe `GREATEST` und **heben nur an, sie senken nie**; die Reihenfolge ist deshalb ohne Wirkung
```

### Patch E · §13 Globale Konstanten — zwei neue Schlüssel

**Anker** (in §13, die Tabellenzeile):

```
| `trash.retention_seconds` | `60` | UI versteckt Trash-Zeile nach 5 s, Edge-Function löscht final nach diesem Wert |
```

**Patch-Satz:** **Oberhalb** dieser Zeile werden eingefügt:

```markdown
| `confidence.history_score` | `0.94` | Wiedererkennung: Score wird auf diesen Wert **gehoben**, nie gesenkt. Bewusst **unter** 0.95 — erzeugt einen Vorschlag, nie eine automatische Verknüpfung |
| `confidence.merchant_rule_score` | `0.96` | **(v2-28)** Händler-Treffer: Score wird auf diesen Wert gehoben. Bewusst **über** 0.95 — verlinkt beim Import automatisch. Absenken unter 0.95 macht daraus einen bloßen Vorschlag, ohne Migration |
| `matching.merchant_rules` | JSON-Objekt | **(v2-28)** Zweistufige Händler-Wortlisten, geschlüsselt nach **Kartenname**: `eindeutig` · `mehrdeutig` · `zweitsignal_woerter` · `zweitsignal_betrag_min` / `_max`. Gelesen von `merchant_rule_match`. **Achtung:** Kartenname als Schlüssel — nach einer Umbenennung greift die Regel still nicht mehr |
```

> **Nebenbefund, der hier mit repariert wird:** `confidence.history_score` (0,94)
> existiert seit v2-21 in der Datenbank, stand aber **nicht** in dieser Tabelle,
> obwohl §4 ihn nennt. Gemessen gegen `app_config` am 24.08.2026 — die Tabelle führte
> sieben von acht Schlüsseln.

### Patch F · Header — Version und Changelog

**Anker:** `**Version:** 3.12.0`

**Patch-Satz:** `**Version:** 3.13.0`

Und im Changelog-Bereich wird **oben** eingefügt:

```markdown
> **Changelog v3.13.0 (24.08.2026, Sprint v2-28):** Eine neue Funktion, drei
> `app_config`-Schlüssel in der Tabelle, eine erweiterte Funktion. **Kein
> Schema-Eingriff** — keine Tabelle, keine Spalte, kein Constraint, und die neun
> Rechenfunktionen sind byte-identisch geblieben.
>
> §4 — **`merchant_rule_match` (neu)** und die zweite Untergrenze in
> `calculate_match_confidence`. Der Mechanismus ist derselbe wie bei der
> Wiedererkennung aus v2-21; der Unterschied ist ein einziger Zahlenwert: 0,96 statt
> 0,94, also **über** statt **unter** der Auto-Schwelle. Genau daran hängt, ob eine
> erkannte Zahlung vorgeschlagen oder verlinkt wird.
>
> §13 — `matching.merchant_rules` und `confidence.merchant_rule_score` neu; dazu
> `confidence.history_score`, der seit v2-21 in der Datenbank steht und in dieser
> Tabelle **fehlte**.
>
> **Der Satz, der den Sprint überlebt:** Die Nachverlink-Migration wählt über
> `calculate_match_confidence(...) >= Schwelle` aus und **nicht** über eine zweite
> Wortliste. Eine zweite Formulierung derselben Regel ist die Form „Nachbauen" aus
> LL-26 — dieselbe, die in v2-20 das Lösch-Tor streng hielt, während die Datenbank
> längst großzügiger war.
```

---

## Nicht gepatcht — und warum

**§4 `refresh_fragment_suggestions` bleibt unverändert.** Die Funktion ist nicht
angefasst worden. Sie rechnet Anzeige-Spalten nach und **verlinkt nie**; die
Händler-Regel wirkt bei ihr wie jede andere Konfidenz-Komponente. Ihre Zusage gilt
unverändert.

**§6 Lösch-Logik und §7 Snapshot-Integrität bleiben unverändert.** P3b legt neue
`card_fragment_links`-Zeilen an — ein regulärer Vorgang, für den es keine neue Regel
gibt.

**Die Design-Doku bekommt zu P1 und P3 nichts.** Beides sind Daten- und
Zuordnungs-Themen ohne sichtbare Formänderung. Die 65 nachverlinkten Zahlungen
erscheinen im bestehenden Zustand „zugeordnet"; die Karte „Tanken" zeigt weiter den
Plan, weil sie eine BUDGET-Karte unter ihrem Budget ist (§4.3.2).

**`design-system/` bleibt unverändert.** Weder Tokens noch Komponenten sind berührt —
`header-timeline` hat ein Prop bekommen, kein neues Aussehen. Die Seiten zeigen
weiterhin den gültigen Stand.

---

# Nachtrag · CLAUDE.md — freigegeben am 24.08.2026

> **Die Freigabe kam nach dem Browser-Smoke und dem Merge von PR #44.** Bis dahin
> standen diese Punkte als Vorschlag im Review §7; für die Verfassung gilt LL-16
> **plus** ausdrückliche Zustimmung des Users, und die lag vorher nicht vor.
>
> **Sieben Stellen.** Kopfzeile · §6 Stolperfalle 8 (Korrektur) · §6 neue
> Stolperfallen 26–28 · §7 Regel 16 (Erweiterung) · §8 LL-37 bis LL-39 · §9
> Sprint-Stand · §9 Momentaufnahme.

## Patch G · Kopfzeile — v2-28 nach vorn, v2-27 nach hinten

**Anker:**

```
> **Letzte Aktualisierung:** 19. August 2026 · **nach:** Sprint **v2-27**
> („2025 wird vergleichbar" — `DA-1` `ZO-3`; Design-Doku **v3.10.0**, Schema-Doku
> **v3.12.0**). Alles bis **v2-26** ist in `main`.
```

**Patch-Satz:** ersetzt durch die neue Kopfzeile mit v2-28 und **ohne** die
abgeschriebenen Doku-Versionen — siehe Patch L, Begründung dort.

Der Block `⚠️ **Dieser Nachzug holt DREI Sprints auf.**` **entfällt**: Er beschrieb
den Rückstand vor v2-27 und ist mit v2-28 zweimal überholt. Stattdessen kommt der
v2-28-Abschnitt; der bisherige v2-27-Text bleibt **wortgleich** stehen und rückt
hinter ein `---`.

## Patch H · §6 Stolperfalle 8 — eine Spalte, die es nicht gibt

**Anker:** `nicht der Roh-Plan \`cards.planned_amount\`.`

**Patch-Satz:**

```markdown
   nicht der Roh-Plan. **`cards.planned_amount` gibt es nicht** — die Spalte war
   hier bis zum 24.08.2026 genannt und existiert im Schema nicht (gemessen gegen
   `information_schema`). Der Plan liegt **ausschließlich** in
   `card_planned_timeline`; wer den Rohwert braucht, holt ihn dort oder über
   `get_planned_amount_for_month`.
```

## Patch I · §6 — drei neue Stolperfallen 26, 27, 28

**Anker:** das Ende von Stolperfalle 25, die Zeile
`v2-24 (§9 Anker 3): Beide Male sieht ein zu früher Blick wie ein Befund aus. (v2-27)`

**Patch-Satz:** Direkt darunter, vor `### Typen neu erzeugen`, kommen die drei neuen
Nummern (Volltext siehe angewendete Datei).

- **26** — `af_word_in_text` findet **kein Teilwort**. Wortgrenze und Teilwort sind
  zwei verschiedene Fragen, und die falsche Wahl fällt nicht auf.
- **27** — Ein **Mittelwert über eine Periode** verbirgt einen Sprung: Die
  Jahressumme stimmt, **jeder einzelne Monat ist falsch**. (LL-37)
- **28** — Ein **RAISE-Rollback lässt aufgeschobene Constraints nie feuern**. (LL-39)

## Patch J · §7 Regel 16 — der Trockenlauf braucht `SET CONSTRAINTS ALL IMMEDIATE`

**Anker:** `` `db-eingriff`. (LL-18) ``

**Patch-Satz:** ergänzt um den Absatz zu aufgeschobenen Constraints (Volltext siehe
angewendete Datei), Verweis auf **LL-39**.

## Patch K · §8 — LL-37, LL-38, LL-39

**Anker:** die Tabellenzeile `| LL-36 | Wer einen **unbekannten** Wert …`

**Patch-Satz:** drei neue Zeilen darunter.

## Patch L · §9 — Sprint-Stand, Roadmap-Zahlen, und die Doku-Versionen VERSCHWINDEN

**Anker:** `**Doku-Versionen:** Design-Doku **v3.10.0** · Schema-Doku **v3.12.0**.`

**Patch-Satz:** Die Zeile wird **nicht aktualisiert, sondern ersetzt** — durch einen
Verweis auf die Header der beiden Bibeln, ohne Zahlen.

> **Warum das die einzige wirksame Korrektur ist.** Der Warnkasten, der heute unter
> dieser Zeile steht, sagt es selbst: *„Ein Warnkasten verhindert nichts. Er wird von
> derselben Sitzung gelesen, die ihn geschrieben hat, und von keiner danach. Wirksam
> wäre nur, den Wert **nicht zu duplizieren**."* Die Zeile stand am 17.08. falsch, am
> 19.08. wieder falsch. **Sie ein drittes Mal richtig zu schreiben, hieße die eigene
> Lehre zu ignorieren.**

## Patch M · §9 Momentaufnahme — beide Jahre neu, und diesmal mit Beleg

**Anker:** die Tabellenzeile `| Januar | 1.318,76 € | 1.853,82 € | | Juli | −8,84 € | 1.866,97 € |`

**Patch-Satz:** vollständig ersetzte Tabelle, gemessen am 24.08.2026 **nach** dem
Merge, plus der Warnkasten dazu.

> **Diese Messung trägt ihren eigenen Beleg dafür, dass sie kein Sollwert ist.**
> Zwischen dem Ende des Sprints und dieser Messung liegen wenige Stunden — und
> **vier Monate haben sich bewegt** (2025-01 bis 2025-04), weil der Nutzer weiter
> kuratiert hat. 2025 fiel dabei von 21.776,33 € auf **21.708,77 €**. Beide
> Invarianten blieben 24/24 exakt, alle neun Prüfsummen unverändert: **normale
> Benutzung, kein Eingriff.**
