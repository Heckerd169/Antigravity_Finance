# Design-Direktor-Block 1 — Entscheidungs-Record

> **Vom:** PM-Chat V2 (Opus 4.7)
> **Quelle:** Design-Direktor-Chat
> **Datum:** 26. Juni 2026
> **Status:** **BLOCK 1 VOLLSTÄNDIG (Cluster 1–3), user-bestätigt.** Alle Cluster-3-Punkte entschieden; Design-Doku v3.1.2 eingespielt. Nächster Schritt: Block 2 im DD-Chat.
> **Zweck:** Autoritativer Record, aus dem PM Briefings, Doku-§-Patches + Architekten-Aufträge ableitet.

---

## Cluster 1 — Karten-Lebenszyklus (final, 13.06.)

Drei Verben, keine vierte Geste. **„Verbergen" gestrichen.**

| Verb | Konsequenz |
|---|---|
| **Löschen** | Karte weg aus *allen* Monaten — nur erlaubt ohne eingefrorenen Vergangenheits-Fußabdruck (Gate via **Link-Month**, aktueller Monat blockiert nicht). Fragmente immer **Soft-Detach**, nie Cascade. 5s-Undo, kein Modal |
| **Beenden** („Letzte Zahlung in Monat X") | bleibt in der Vergangenheit, stoppt ab Folgemonat. Einzige Geste für Karten mit Historie |
| **Anpassen** | Vergangenheit eingefroren, neuer Plan vorwärts |

Gesperrtes Löschen → `⋯`-Eintrag sichtbar-aber-deaktiviert + Ein-Zeilen-Grund + aktive Alternative „Letzte Zahlung in Monat X". A2/A3/A4 entfallen. §2.1 bleibt heilig (Gate ersetzt den erwogenen Carve-out).

→ Architekten-Stufe-1 (4 Punkte inkl. Verbergen-Streich-Migration) + Doku-Patch §2.4/§7/CLAUDE.md. Backlog-Hygiene: A2/A3/A4-`CARD_HIDE` obsolet. **(Details siehe vorige Fassung — unverändert.)**

---

## Cluster 2 — Welle / Treppe (M3) — final, 26.06.

**Kernmodell:** monatliche **EUR-Welle hinter dem zentrierten Ring**; Klick → **Popup mit kumulierter Treppe** (IST+Plan+Vorjahr). **Ersetzt das V1-Treppen-Layout (§9).** Referenz: `welle_v1.html`.

| Punkt | Festlegung |
|---|---|
| **M3a Position** | Ring bildschirm-zentriert, fix, **interaktions-transparent** (`pointer-events:none`). Volle Jan–Dez-Welle dahinter. **Nur ein Kreis: der aktive Monat.** Kein Hover-Punkt, kein Ereignis-Kreis |
| **M3b Darstellung** | Eine Welle, Y = **monatliche Sparrate in EUR**. Teal = realisiert, Grau = Forecast (Ghost-Analogie), **Rot `#FF453A`** = negativer Monat. IST-vs-Plan im Hover-Tooltip, nicht als zweite Welle. **Opacity = 0.80 (Token)** |
| **M3c Klick → Popup** | Single-Surface-Overlay, dismissible (Klick-außen/Escape), kein Tooling/Slider. Kumulierte Treppe IST(teal)+Plan(grau), **Jahressumme als Held**, Monatsklick → drei Treiber. Einzige Heimat der kumulierten Sicht |
| **M3d Treiber** | Welle-Hover → Tooltip (Monat, IST €, Plan €, **Top-1**). Popup-Monatsklick → **Top-3** |
| **B6 (nur Popup)** | **Gold-gestrichelte** Vorjahres-Linie auf kumuliertem Jahresendwert; Betrag im **rechten Gutter** außerhalb der Plotfläche; Legende in Popup-Unterzeile. **Datenloses Vorjahr → Linie entfällt** (keine 0-€-Linie). Monatliche Welle führt **keine** Vorjahres-Referenz |
| **B1 Fenster** | **Kalenderjahr (Jan–Dez)** für Welle + Popup |
| **Verdeckung** | Ring interaktions-transparent; Monatswahl = **positions-basiertes Scrubbing über volle Breite** (nicht punkt-genau); Guide + Tooltip rendern über dem Ring → Jahresmitte hinter dem Ring voll erreichbar |
| **Header** | Ausreißer-Subzeile nur im betroffenen Monat; **Zeilenhöhe dauerhaft reserviert** → kein Layout-Sprung |
| **M10 monatlich** | **mitentschieden:** negativer Monat = Ausgaben-Rot (Fläche + Linie). Nur noch **B3** (kumulativ-negativ) offen → Cluster 3 |

---

## Mockup-Verifikation (PM, 26.06.) — `welle_v1.html`

**Konform** mit M3a–M3d, B6, B1, Verdeckung, Header, Tokens. Eine Präzisierung + zwei Cleanups:

| # | Befund | Handlung |
|---|---|---|
| **D1 (Doku-§-relevant)** | Die Teal→Grau-Regime-Grenze folgt im Mockup dem **letzten realisierten Monat** (Konstante `REALIZED`), nicht dem Header-aktiven Monat. M3b-Prosa sagt „bis aktiver Monat". Das Mockup ist semantisch korrekt: realisiert = abgeschlossene Kalendermonate, **unabhängig von Navigation** — bei Navigation in einen Zukunftsmonat darf die Welle nicht umfärben | **DD um Ein-Zeilen-Bestätigung bitten**, dann Doku-§ auf „Grenze = letzter realisierter/abgeschlossener Monat" festschreiben (nicht „aktiver Monat") |
| C1 | Kommentar (Datenzeile) sagt „danach Gold", Code nutzt Grau (`graS`) | Kommentar korrigieren beim Produktiv-Port |
| C2 | `.hpt`-Hover-Punkt-Element wird nie eingeblendet (konsistent mit M3a „kein Hover-Punkt") | totes Markup beim Produktiv-Code entfernen |

---

## Sequenzierung Welle+Popup-Sprint (PM-Entscheidung)

Die Treiber (M3d) hängen an **B2** (Heuristik = Backend). Das **Display** ist entschieden, die **Heuristik** nicht.
→ **UI-first:** Welle+Popup-Sprint mit **Platzhalter-Treibern** (Stub, wie im Mockup), danach **B2 als separater Backend-Sprint**, der die echte Heuristik hinter das fertige Display setzt. Display und Heuristik bleiben entkoppelt.

---

## Doku-§-Patches aus Cluster 2 (LL-16 — PM wendet an, nach D1-Bestätigung)

1. **§9 Treppe — retired.** „M3 ersetzt das V1-Treppen-Layout."
2. **Neuer Abschnitt „Welle" (§5a/§13):** EUR-Monats-Sparrate, Teal→Grau→Rot, Opacity 0.80, ein aktiver-Monat-Kreis, Scrub durch den Ring, Hover-Tooltip (Monat, IST €, Plan €, Top-1). **Regime-Grenze = letzter realisierter Monat (D1).**
3. **Popup-Spec:** kumulierte Treppe IST+Plan, Jahressumme als Held, B6 (gold-gestrichelt, rechter Gutter, Legende Unterzeile, datenlos → entfällt), B1 Kalenderjahr, Monatsklick → Top-3, dismissible, kein Tooling. *(Slots für N4b/B3 aus Cluster 3 markieren.)*
4. **§5 Ring:** Ring interaktions-transparent ergänzen.
5. **§6 Header:** Ausreißer-Subzeile, Zeilenhöhe permanent reserviert.
6. **Tokens:** `Welle-Opacity 0.80`; Forecast = Ghost-Grau; negativ = `#FF453A`; Gold ausschließlich Vorjahr/Ereignis.

---

## Cluster 3 — Darstellung/Token (final, 04.07.) — Block 1 damit vollständig

Drei reine UI/§-Punkte, kein Schema (Option A production-direct bleibt).

| Punkt | Festlegung |
|---|---|
| **N5** (§8) | **Grundton angleichen, Semantik behalten.** Ein gemeinsamer Grau-Grundton-Token für alle Rohmasse-Fragmente (zugeordnet + Transfer); Unterscheidung nur über Opacity (0.22 / 0.45) + „TRANSFER"-Badge (Grau-Soft). Yellow-Soft bleibt für Transfer ausgeschlossen (AD5) |
| **N4b** (§5) | **a)** Cap: ab > 200 % Subzeile „> 200 % von Plan" (arc-gekoppelt). **b)** Degenerations-Modus `Plan < 100 €` (inkl. negativ) → absolute EUR-Aussage statt %, Subzeilen-Farbe folgt dem **Differenz-Vorzeichen** (nicht dem absoluten IST). **c)** Neutraler Arc im Degenerations-Modus (nur Spur, keine Füllung). Scope gewachsen: Subzeile **+** Arc-Verhalten |
| **B3** (§9-Popup) | Abschnittsweise Rot ab **Null-Linie** (< 0 → `#FF453A`, ≥ 0 → teal, nicht global). Held (Jahressumme) folgt **Endwert**-Vorzeichen. Vorjahres-Goldlinie unberührt |

**M10-monatlich** war bereits in Cluster 2 entschieden (negativer Monat = Rot).

### Doku-Folge (v3.1.2, angewendet)
§8 N5-Grundton · §5 %-Subzeile + Degenerations-Modus + neutraler Arc · §9-Popup B3 · Token `--fragment-hue`. Separater LL-16-Patch: `dd_cluster3_doku_patches.md`.

### Was Cluster 3 entsperrt — UI-Sprints (kein Schema)
| Sprint | Inhalt | Reihenfolge |
|---|---|---|
| **B3** | in Popup (§9) | fällt in **v2-02** — oder Fast-Follow, je nach v2-02-Stand |
| **v2-03** | **N5** (§8) + **N4b** (§5) gebündelt | **nach v2-02** (N4b und v2-02 berühren beide §5/Ring → Branch-Konflikt vermeiden) |

---

## Block 1 — abgeschlossen
Cluster 1 (Karten-Lebenszyklus) · Cluster 2 (Welle/Popup, M3) · Cluster 3 (Darstellung/Token). Empfehlung DD: Block 2 im DD-Chat eröffnen.

*DD-Block-1 Entscheidungs-Record · Antigravity Finance 2.0 · 26. Juni 2026*
