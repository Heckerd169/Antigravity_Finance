# Design-Entscheidung — Anzeige der gemeinsamen Karte, 05. August 2026

**Anlass:** Entscheidung **E1** (05.08.2026) legt fest, dass eine gemeinsame Karte den
**eigenen Anteil** zeigt. Offen blieb ausdrücklich, ob der Gesamtbetrag daneben
sichtbar bleibt und in welcher Form — das Mockup zur E1-Auswahl zeigte eine zweite
Zeile, aber **ein Mockup ist keine Spezifikation**.

**Rolle:** `design-direktor`. Der Rollenwechsel wurde ausgesprochen; Aufwand war in
dieser Runde kein zulässiges Argument.

**Vor der Runde angesehen:** `design-system/komponenten/karten.html` · Design-Doku §7
(Karten-Basis, 136 px, Zustände) · §6 (M3, reservierte Zeilenhöhe) · §4.5 (Split) ·
`V2/design_direktor_block_1_entscheidungen.md` — kein Widerspruch zu früheren
Entscheidungen.

---

## Was entschieden wurde

### 1 · Der Gesamtbetrag steht auf der Karte, nicht im Overlay

**Entscheidung:** Eine gemeinsame Karte führt unter dem Betrag eine eigene Zeile mit
dem vollen Betrag des Haushalts.

**Begründung (User, wörtlich):** *„Ich will beim Blick aufs Karussell sehen, was die
Wohnung insgesamt kostet."* Damit ist der Ort entschieden — ein Overlay hätte den
Zweck „auf einen Blick" verfehlt.

**Verworfen:** Unterbringung im Karten-Overlay (kostet keine Kartenfläche, erfüllt den
Zweck aber nicht).

### 2 · Wortlaut: `von 1.904,00 €` — nicht „Haushalt"

**Entscheidung:** Die Zeile lautet `von [Betrag] €`.

**Begründung:** Laut vorgelesen ergibt sich der richtige Satz — *„1.089,26 € **von**
1.904,00 €"*. Es wird **kein neues Substantiv** eingeführt.

**Verworfen: „Haushalt 1.904,00 €"** (der Wortlaut aus dem E1-Mockup). Grund: „Haushalt"
kommt in der gesamten Design-Doku **genau einmal** vor — als Verneinung in §10:
*„Kein Haushaltsnetto — Sparrate basiert ausschließlich auf `ich.netto`."* Eine Vokabel
auf der Karte einzuführen, die an anderer Stelle ausdrücklich abgelehnt ist, erzeugt
genau die Sorte stiller Widerspruch, aus der die Befunde vom 04.08. entstanden sind.

### 3 · Platzierung: direkt unter dem Betrag, über dem Status

**Entscheidung:** Reihenfolge auf der Karte ist künftig
**Name → Betrag → `von X €` → Status → Attribution.**

**Begründung:** Die Zuordnung entsteht durch **Nähe**, nicht durch ein Label. Der
Qualifizierer steht unmittelbar unter der Zahl, die er qualifiziert. Abstände:
**2 px** zum Betrag (eng gebunden), **5 px** zum Status (abgesetzt) — die Gruppierung
macht der Weißraum.

**Verworfen:**
- *In die Attributions-Zeile integrieren* („● Gem. · 1.904 €"): Bei 136 px Breite
  minus Padding bleiben rund 110 px; der Text passt nur mit Abkürzungen, die es
  sonst nirgends in der App gibt. Zudem liegt die Meta-Zeile bei Deckkraft `.20` —
  der Gesamtbetrag wäre fast unsichtbar und damit gerade **nicht** „auf einen Blick".
  Und sie koppelt zwei Aussagen, die nichts miteinander zu tun haben: **wer** zahlt
  und **wie viel insgesamt**.
- *Am Kartenfuß unter der Attributions-Zeile*: Zwischen Betrag und Erklärung lägen
  zwei fremde Zeilen. Außerdem tragen Budget-Karten dort einen 3 px-Fortschrittsbalken.

### 4 · Tonwert: `--text-muted` (`rgba(255,255,255,.45)`)

**Entscheidung:** Die Zeile nutzt `--text-muted` in allen Zuständen; im Ghost-Zustand
dimmt die Karten-Opacity sie ohnehin mit.

**Begründung:** `--text-ghost` (`.22`) und der Meta-Ton (`.20`) sind genau die
Unsichtbarkeit, die schon gegen Variante 2 sprach. `.45` ist lesbar und bleibt
deutlich unter dem Held (22 px, Weight 200, in „bezahlt" reinweiß).
**Kein neuer Token.**

### 5 · Alle Karten behalten dieselben Maße

**Entscheidung:** Die Zeilenhöhe ist auf **jeder** Karte permanent reserviert
(`min-height`); auf ICH-Karten bleibt sie leer. Es schaltet ausschließlich die
Sichtbarkeit, nie die Höhe.

**Begründung:** Vorgabe des Users (*„ALLE Karten müssen am Schluss die gleichen Maße
haben"*) — und es ist exakt das Muster, das §6 (M3) für die Ausreißer-Subzeile im
Header bereits festschreibt: *„ihre Zeilenhöhe ist permanent reserviert (`min-height`).
Beim Monatswechsel schaltet ausschließlich die Sichtbarkeit (`opacity`), nie die
Höhe."* Kein neues Muster, ein bestehendes angewandt.

---

## Abgleich gegen die fünf Grundsätze

| Grundsatz | Urteil |
|---|---|
| Ein Screen, ein Monat, eine Zahl | ✓ 10 px auf der Karte; konkurriert nicht mit der Sparrate im Ring |
| Schmale Palette | ✓ keine neue Farbe, kein neuer Token; Blau bleibt exklusiv der Gemeinsam-Punkt |
| Ruhe vor Betonung | ✓ Held unverändert; Zuordnung über Abstand statt über ein Label |
| Werkzeug ist nicht Produkt | ✓ nichts Reglerhaftes |
| Ehrlichkeit vor Beruhigung | ✓ **stärkt sie** — die Karte zeigt Anteil **und** Gesamtrechnung, statt eine der beiden zu verschweigen |

---

## Was NICHT entschieden wurde

- **Welche Zahl die Karte führt** — das ist `E1` (der eigene Anteil), bereits
  entschieden und hier nicht berührt.
- **Die Sparraten-Rechnung** — das ist `BF-4`, ein Eingriff in
  `calculate_sparrate_for_month` mit Übungs-DB-Probe.
- **Die Kartenreihenfolge im Karussell** — bleibt `M5`, weiterhin offen
  (heute Fixkosten → Einnahmen → Budget).
- **Ob die Zeile auch bei ICH-Karten je einen Inhalt bekommt** — heute leer
  reserviert; ein Inhalt ist nicht vorgesehen und nicht ausgeschlossen.
- **Das Verhalten bei einer Karte, deren Plan gleich dem Anteil ist** (Split-Faktor
  1,0, also kein Partner-Einkommen). Dann stünde `1.089,26 € / von 1.089,26 €`.
  Tritt heute nicht auf, weil beide Einkommen erfasst sind. **Empfehlung für den
  Bau-Sprint:** Zeile in diesem Fall leer lassen — sie erklärt dann nichts.
  Als offene Frage im Sprint führen, nicht stillschweigend entscheiden.

---

## Was das entsperrt

**`BF-4`** (Paket 1, letzter der fünf Befunde) ist damit vollständig schneidbar:
E1 klärt die Semantik, diese Runde die Darstellung. Was noch fehlt, ist reine
Umsetzung — inklusive `db-eingriff` mit Übungs-DB-Probe und Prüfung der
B2-Invariante, weil `get_year_deviation_drivers` den Anteil ebenfalls selbst anwendet.

---

## Doku-Folge

| Was | Wohin |
|---|---|
| Neue Kartenzeile: Ort, Wortlaut, Ton, reservierte Höhe | Design-Doku **§7** („Gemeinsame Basis") |
| Copy-Zeile `von [N] €` | Design-Doku **§12.3** (Karten) |
| Umkehr der Split-Semantik | Design-Doku **§4.5** — gehört zu `BF-4`, **nicht** zu dieser Runde |
| Karten-Seite mit der neuen Zeile | `design-system/komponenten/karten.html` (Ablauf: `design-system/SYNC.md`) |

Patch über den `docs-maintainer`, mit Versions-Bump.

---

*Design-Entscheidung · Antigravity Finance · 05. August 2026*
