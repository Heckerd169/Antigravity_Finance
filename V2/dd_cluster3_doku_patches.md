# Doku-Patches — Block 1 / Cluster 3 (Design-Dokument v3.1.1 → v3.1.2)

> **Lieferant:** Design-Direktor (via PM-Chat V2) · **Datum:** 04. Juli 2026
> **Status:** in **v3.1.2 angewendet** — diese Datei ist der LL-16-Beleg.
> **Ziel-Datei:** `antigravity_finance_design_dokument_v3_1_2.md`

---

## Patch 1 — §8 Rohmasse: Grundton vereinheitlichen (N5)

**Anker:** §8 → Fragment-Stack, nach dem `INTERNAL_TRANSFER`-Bullet.

**Eingefügt:** Ein gemeinsamer Grau-Grundton-Token für **alle** Rohmasse-Fragmente (zugeordnet *und* Transfer). Unterscheidung nur über **Opacity** (`0.22` / `0.45`) **+ „TRANSFER"-Badge** (Grau-Soft). Kein separater Hue je Zustand. Yellow-Soft (KI-Vorschlag) bleibt für Transfer ausgeschlossen (AD5). Behebt zwei leicht abweichende Grau-Töne nebeneinander.

## Patch 2 — §5 Ring: %-Subzeile + Degenerations-Modus + neutraler Arc (N4b)

**Anker:** §5, neue Subsektion „### %-Subzeile + Degenerations-Modus (N4b)" vor „### Datenbasis".

**Eingefügt:**
- **a) Cap:** ab > 200 % → „> 200 % von Plan" (arc-gekoppelt).
- **b) Degenerations-Modus `Plan < 100 €` (inkl. negativ):** absolute EUR-Aussage statt %; **Subzeilen-Farbe folgt dem Differenz-Vorzeichen**, nicht dem absoluten IST (Beispiele: Plan −500/IST −400 → „−400 €" rot · „+100 € über Plan" teal; Plan −500/IST −700 → „−700 €" rot · „−200 € unter Plan" rot). Prozent wird hier nie gezeigt.
- **c) Neutraler Arc** im Degenerations-Modus: nur Spur, keine Füllung.

## Patch 3 — §9-Popup: kumulativ-negative Sparrate (B3)

**Anker:** §9 Popup-Abschnitt, nach dem B6-Absatz (füllt den in v3.1.1 markierten B3-Slot).

**Eingefügt:** Abschnittsweise Rot ab **Null-Linie** (< 0 → `#FF453A` Fläche + Linie, ≥ 0 → teal, nicht global). Held (Jahressumme) folgt **Endwert**-Vorzeichen. Vorjahres-Goldlinie unberührt.

## Patch 4 — §3 Tokens

**Eingefügt:** `--fragment-hue` (gemeinsamer Grau-Grundton, §8 N5). Bestätigt: negativ (monatlich + kumulativ) = `#FF453A`; Transfer-Badge = Grau-Soft.

## Patch 5 — §9 „Offen — Cluster 3" auflösen

Slot-Vermerke ersetzt durch „Cluster 3 — aufgelöst": N4b → §5, B3 → Popup-Abschnitt.

---

## Versions-Folge
v3.1.1 → **v3.1.2** (Block 1 vollständig). Changelog-Zeile ergänzt.

---

*DD-Cluster-3-Doku-Patches · Antigravity Finance 2.0 · 04. Juli 2026*
