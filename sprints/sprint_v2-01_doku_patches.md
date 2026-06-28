# Sprint v2-01 — Doku-Patches (LL-16)

> Claude Code editiert die Design-Doku NIE selbst. Diese Datei liefert Anker +
> Patch-Satz pro Stelle. Der PM verifiziert und wendet an.
> **Ziel-Datei:** `antigravity_finance_design_dokument_v3_1.md`
> **Sprint:** v2-01 (Bug-Sprint N1–N4a) · 26. Juni 2026

---

## Patch 1 — §8 Fragment-Stack: Monatsskopierung (aus N1)

**Anker:** `## 8. Komponente: Untere Interaktionszone` → `### Fragment-Stack (Rechts)`,
direkt nach dem Bullet „Fragmente sind Drag-Quellen" (aktuell vor dem
`opacity: 0.22`-Bullet).

**Hintergrund:** Sprint 5 (E5) interpretierte „Rohmasse" als *alle Monate* —
der Stack zeigte ungefiltert alle Fragmente jeden Monats. N1 korrigiert das auf
das Single-Surface-Prinzip „ein Monat" (CLAUDE.md §1): der Stack zeigt nur den
angezeigten Monat. Die Design-Doku selbst hat den Monats-Scope bisher nicht
explizit benannt — dieser Patch füllt die Lücke.

**Einzufügender Bullet:**

> - **Monats-Scope (v2-01, N1):** Der Stack zeigt ausschließlich Fragmente, deren
>   `transaction_date` im aktuell angezeigten Monat liegt. Ein Fragment mit
>   `transaction_date` in einem anderen Monat erscheint im Stack *jenes* Monats,
>   nicht im aktuell angezeigten. Konsistent mit §4.7 (Rückwirkende
>   Verknüpfungen): ein vergangenes Fragment, das per Auto-Absorption oder Drop
>   einer Karte des angezeigten Monats zugeordnet ist, erscheint als *verknüpftes
>   Fragment auf der Karte* (Kontextmenü „Verknüpfte Fragmente"), nicht erneut im
>   Stack des angezeigten Monats. Die Sparrate-Berechnung ist unberührt (sie liest
>   `card_fragment_links`, nicht den Stack).

**Konsequenz / offener Quirk (PM-Bestätigung):** Der manuelle **Cross-Monat-Drop**
aus dem Stack (Sprint 5 E5 / §7 Konflikt 4 — z. B. ein März-Fragment im Mai-View
auf eine Mai-Karte ziehen) ist mit der Monatsskopierung **nicht mehr möglich**, weil
Fremd-Monats-Fragmente nicht mehr im Stack des angezeigten Monats stehen. Die
**Auto-Absorption** beim CSV-Import (server-seitig, §4.7) bleibt vollständig
funktional — sie läuft nicht über den Stack. Falls der manuelle Cross-Monat-Drop
als Fähigkeit erhalten bleiben soll, ist das ein eigener Design-Direktor-Punkt
(nicht in v2-01 entschieden).

---

## Patch 2 — §7 Gemeinsame Basis: Kartenname-Overflow (aus N3)

**Anker:** `## 7. Komponente: Karten` → `### Gemeinsame Basis (alle Karten-Typen)`,
Eigenschafts-Tabelle (die mit `| Breite | 136px |`).

**Hintergrund:** §7 spezifiziert `Breite 136px`, aber kein Verhalten für
überlange Kartennamen. N3 legt fest, dass der Name die Karten-Begrenzung nicht
überläuft.

**Einzufügende Tabellenzeile (oder Fließtext-Notiz unter der Tabelle):**

> | Kartenname-Overflow | Eine Zeile, abgeschnitten mit Ellipsis (`…`) innerhalb der 136px-Breite |

**Optionaler Fließtext:** „Ein überlanger Kartenname streckt die Karte weder
horizontal (Slot fix `flex: 0 0 136px`) noch vertikal (Name einzeilig,
`text-overflow: ellipsis`). Pattern identisch zur Fragment-Beschreibung (§8)."

---

## Nicht-Patches (bewusst ausgelassen)

- **N4a** präzisiert keine Spec — §5 Farblogik/Grenzwert bleibt unverändert; der
  Fix entfernt nur einen doppelten Vorzeichen-Glyph im Anzeige-String.
  Die *Anzeige-Strategie* bei winzigem/negativem Plan-Nenner (N4b) ist
  ausdrücklich **offen** (Cluster 3) und wird hier nicht entschieden.
- **N2** setzt nur die bereits dokumentierte §7-Breite (`136px`) technisch durch —
  keine neue Spec-Aussage (Patch 2 deckt die zugehörige Overflow-Präzisierung ab).
