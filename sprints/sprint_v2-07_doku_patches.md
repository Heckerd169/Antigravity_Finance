# Sprint v2-07 — Doku-Patches

**Erzeugt von:** Claude Code (LL-16 — Design-/Schema-Doku werden nie direkt editiert)
**Ziel-Dokument:** `antigravity_finance_design_dokument.md` (aktuell v3.1.5)
**Datum:** 25. Juli 2026
**Anzuwenden nach:** Sprint-v2-07-Approval

**Schema-Doku:** kein Patch — der Sprint fasst das Schema nicht an (keine Tabelle,
Spalte, RPC, View, Trigger oder Enum berührt).

---

## Patch 1 — §3 Farb-Token-Tabelle: sechs Badge-Farbtöne

**Anker:** Tabelle „Farben" in §3, letzte Zeile
`| `--fragment-hue` | gemeinsamer Grau-Grundton | Rohmasse-Fragmente §8 (N5) — Unterscheidung nur via Opacity/Badge |`

**Patch:** Direkt darunter sechs Zeilen ergänzen:

```markdown
| `--badge-hue-1` … `--badge-hue-6` | Gold `255,200,60` · Orange `255,150,90` · Oliv `170,200,110` · Blau `100,168,240` · Violett `170,130,255` · Magenta `240,120,190` | KI-Vorschlag-Badge §11 (A1) — der Kartenname wählt den Ton deterministisch; Deckkraft unverändert `.08` Fläche / `.5` Text / `.15` Rahmen |
```

**Begründung:** Die sechs Töne sind Produktionswerte und gehören damit in die
Token-Tabelle, wie `--wave-opacity` und `--fragment-hue`. Türkis und Rot sind
bewusst ausgespart — beide tragen in der App Statusbedeutung.

---

## Patch 2 — §8 Fragment-Stack: Übertrags-Schalter

**Anker:** §8 → „Fragment-Stack (Rechts)" → nach dem Absatz
**„Status `INTERNAL_TRANSFER` (Sprint 9):**…" und **vor** dem Absatz
„**Grundton-Vereinheitlichung (N5):**…".

**Patch:** Neuen Aufzählungspunkt einfügen:

```markdown
- **Übertrags-Schalter (v2-07, C1):** Fragmente mit gesetztem `transfer_type`
  (`INTERNAL_TRANSFER` **oder** `ASSET_REALLOCATION`) sind aus der Arbeitsfläche
  ausgeblendet. Sie erscheinen nur, wenn der Schalter **„Überträge anzeigen"**
  eingeschaltet ist; **Standard ist „aus"**. Begründung: ein Fragment mit
  gesetztem `transfer_type` kann per Daten-Invariante nie einer Karte zugeordnet
  werden (Trigger `trg_oqb_no_transfer_links`) und gehört deshalb nicht auf die
  Fläche, auf der kuratiert wird.
  **Ort und Form:** rechtsbündig in derselben Zeile wie die Zonen-Überschrift
  „ROHMASSE" — bewusst nicht in einer eigenen Zeile, damit die Oberkanten von
  Portal, Karussell und Stack bündig bleiben. Beschriftung
  `Überträge anzeigen (N)`, wobei **N die Anzahl der Übertrags-Fragmente des
  angezeigten Monats** ist (beide Typen zusammen, unabhängig von der
  Schalterstellung). Enthält der Monat keine Überträge, wird der Schalter **nicht
  gerendert**.
  **Invarianten:** Der Schalter filtert ausschließlich die Stack-Darstellung. Die
  Sortierregel ist unberührt — bei eingeschaltetem Schalter steht die Liste exakt
  so da wie vor v2-07. Ebenso unberührt: die Darstellung eines sichtbaren
  Übertrags (Opacity `0.45`, Badge „TRANSFER", kein Drag/Tap), die
  Status-Hierarchie aus Sprint 9, die Drop-Ziele des Karussells und die
  „N Fragmente offen"-Zählung der Header-Flanke (die zählt `UNASSIGNED` und hat
  Überträge nie enthalten).
  **Verhalten:** rein clientseitig, ohne Server-Roundtrip und ohne
  URL-Parameter. Die Stellung überlebt einen Monatswechsel innerhalb der Sitzung
  — sie ist eine Ansichts-Vorliebe, kein monatsspezifischer Zustand. Ein
  Neuladen der Seite setzt auf „aus" zurück; es findet keine Persistierung statt.
  **Folge:** Wird ein Fragment bei ausgeschaltetem Schalter als Umschichtung
  markiert, verschwindet es unmittelbar aus dem Stack. Das ist die beabsichtigte
  Wirkung; die Rücknahme der Markierung ist folgerichtig nur bei eingeschaltetem
  Schalter erreichbar.
```

**Ersetzt:** die V1-Variante (b) „gedimmt + Badge" als *alleinige* Behandlung
(Sprint 9 V8''). Variante (b) gilt weiterhin — aber nur für den eingeschalteten
Zustand.

---

## Patch 3 — §8 Backfill-Report-Toast: Wortlaut bei hohem Zähler

**Anker:** §8 → Absatz **„Backfill-Report-Toast (Sprint 9):**…", am Ende des
Absatzes (nach „…nicht kumulativ.").

**Patch:** Anfügen:

```markdown
**Wortlaut bei hohem Zähler (v2-07, C2):** Erreicht oder überschreitet
`iban_backfilled_count` den Wert **50**, lautet die Zeile
`Bestehende Fragmente nachgepflegt` — ohne Zahl. Darunter bleibt sie
unverändert `N Fragmente mit IBAN ergänzt`. Grund: ein Re-Import über den
Gesamtbestand meldet sonst Zeilen wie „544 Fragmente mit IBAN ergänzt" — fachlich
korrekt, in der Wirkung aber ein Großereignis, während lediglich ein
berechnungs-irrelevantes Feld nachgetragen wurde. Die Regel gilt **nur** für die
IBAN-Zeile; die drei übrigen Zeilen behalten Wortlaut und Zahl, weil dort die
Zahl inhaltlich relevant ist. Die Schwelle ist reine Anzeige-Sprache ohne
DB-Gegenstück und steht daher bewusst nicht in `app_config`.
```

---

## Patch 4 — §11 Fragment-Karte: Badge-Farbe konkretisieren

**Anker:** §11 → Tabelle „Fragment-Karte — Spezifikation", Zeile
`| Kategorie-Badge (nur 0.60–0.95) | `7.5px`, `font-weight: 600`, uppercase | Karten-spezifisch |`

**Patch:** Die Zelle „Karten-spezifisch" ersetzen durch:

```markdown
Karten-spezifisch — einer von sechs `--badge-hue-*`-Tönen (§3), deterministisch aus dem Kartennamen
```

**Zusätzlich** direkt unter der Tabelle einfügen:

```markdown
**Badge-Farbe (v2-07, A1):** Welchen der sechs Töne ein Badge trägt, bestimmt
allein der **Kartenname** — über eine deterministische Funktion, nicht über eine
Datenbank-Spalte. Damit ist die Farbe stabil über Renders, Sitzungen und Geräte
hinweg und unabhängig von Anzahl, Reihenfolge oder Anlage-Zeitpunkt der Karten;
eine Karte behält ihre Farbe, wenn andere Karten angelegt oder gelöscht werden.
Groß-/Kleinschreibung und Randleerzeichen im Namen ändern den Ton nicht.
Bei mehr Karten als Tönen teilen sich Karten einen Ton — die Farbe ist ein
**Gruppierungs-Hinweis, kein Identitätsmerkmal**; der Kartenname steht daneben.
Deckkraft, Typografie und Geometrie des Badges sind unverändert; variabel ist
ausschließlich der Farbton.
Das **TRANSFER-Badge ist vom Mapping ausgenommen** und behält den neutralen
Grau-Soft-Ton auf `--fragment-hue` (AD5, Sprint 9: Transfer ist Fakt, kein
Vorschlag).

*Historie:* Sprint 8 (OQ1) hatte übergangsweise **einen** generischen Gold-Ton für
alle Karten gesetzt und die karten-spezifische Farbe als V2 vorgemerkt. Die
Tabellen-Zelle „Karten-spezifisch" war seither die unerfüllte Soll-Aussage; v2-07
löst sie ein. `--badge-hue-1` ist genau der Gold-Ton aus Sprint 8.
```

---

## Patch 5 — §8 Fragment-Stack: Monats-Scope serverseitig (Nachtrag zu N1)

**Anker:** §8 → „Fragment-Stack (Rechts)" → Absatz
„**Monats-Scope (v2-01, N1):**…", am Ende des Absatzes.

**Patch:** Anfügen:

```markdown
**Umsetzungs-Nachtrag (v2-07, P0):** Der Monats-Scope wird seit v2-07
**server-seitig** abgefragt statt nachträglich in der Anwendung gefiltert. Bis
dahin holte die App alle Fragmente aller Monate und filterte anschließend — was
ab einem Gesamtbestand von 1000 Fragmenten stillschweigend abschnitt (siehe
Sprint-v2-07-Review §4). Zusätzlich zum Monats-Scope wird eine zweite,
link-orientierte Abfrage geführt (`assigned_month` = angezeigter Monat), damit
ein Fragment aus einem anderen Monat weiterhin als *verknüpftes Fragment auf der
Karte* erscheint. An der sichtbaren Regel ändert sich nichts.
```

---

## Anwendungs-Reihenfolge und Versions-Bump

1. Patch 1 (§3) · 2. Patch 2 (§8) · 3. Patch 3 (§8) · 4. Patch 5 (§8) · 5. Patch 4 (§11)
2. Kopf des Dokuments: **Version 3.1.5 → 3.1.6**, Datum auf 25.07.2026.
3. Changelog-Eintrag im Kopf ergänzen:

```markdown
> **Changelog v3.1.6 (25.07.2026, Sprint v2-07):** §8 Übertrags-Schalter der
> Rohmasse (C1, Standard „aus", Zähler am Schalter) · §8 Backfill-Toast-Wortlaut
> ab 50 nachgepflegten IBANs (C2) · §8 Monats-Scope server-seitig (P0-Bugfix) ·
> §11 Badge-Farbe karten-spezifisch über sechs deterministische Töne (A1,
> schließt Sprint-8-OQ1) · §3 sechs neue `--badge-hue-*`-Tokens.
```

---

*Doku-Patches Sprint v2-07 · Antigravity Finance · 25. Juli 2026*
