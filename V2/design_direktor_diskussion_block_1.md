# Design-Direktor-Diskussion — Pre-Briefing-Block 1 (BEREIT)

> **Vom:** PM-Chat V2 (Opus 4.7)
> **An:** Design-Direktor-Chat (kennt Design-Doku v3.0)
> **Datum:** 04. Juni 2026 (nach DD-Onboarding angepasst)
> **Status:** **Bereit — DD onboardet, Diskussion kann starten.** Cluster-Reihenfolge 1 → 2 → 3 verbindlich (Cluster 3 hängt am M3-Ausgang aus Cluster 2).
> **Zweck:** Produkt-/UX-Richtungsentscheidungen, aus denen der PM die abhängigen Sprint-Briefings ableitet (Roadmap §17/§18).

---

## 0. Was hier entschieden wird (und was nicht)

Kein Code, keine Pixel-Specs — Produkt-/UX-Richtung. Pro Frage eine kurze Festlegung zurück.

### 0.1 Framing-Anpassungen nach DD-Onboarding (PM, übernommen — keine Festlegungen)

1. **B6** ist im Welle-Kontext keine Welle-, sondern eine **Popup-Frage**: Die Vorjahres-Linie ist ein kumulierter Jahresendwert und ergibt nur auf einer kumulierten Fläche Sinn → Treppen-Popup, nicht monatliche Welle. Cluster 2 entsprechend verengt.
2. **N4b/M10** sind nach Einführung der M3-Welle ein **Ring-UND-Welle-Problem** (Plan ≈ 0 degeneriert das IST/Plan-Verhältnis auf beiden Flächen). Scope hängt am M3-Ausgang → daher Cluster 3 **nach** Cluster 2.
3. **Cluster 1** wird nicht „M2 zuerst", sondern **M1↔M2 als gekoppeltes Paar** behandelt; A2/A3/A4 hängen wir erst danach auf.

---

## 1. Cluster 1 — Karten-Lebenszyklus (M1 ↔ M2 gekoppelt → A2/A3/A4)

Hintergrund: V1 hat nur **Verbergen** (`deleted_at`, 5s-Undo, snapshot-integer). Aus der Nutzung kam der Wunsch nach echter **Löschung**. M1 und M2 sind gekoppelt — erst das Paar entscheiden, dann die A-Punkte.

| Frage | Zu entscheiden |
|---|---|
| **M1 (Fähigkeit + Kosten zuerst)** | Was kann/soll „Löschen" mit **verknüpften Fragmenten**? Soft-Detach (Links lösen, Fragmente bleiben) / Cascade / Löschung verbieten solange Fragmente verknüpft. DB-Konsequenz klärt danach der Architekt (Pre-Sprint-Stufe-1) |
| **M2 (Keystone, gegen den Strich prüfen)** | Rechtfertigt das M1-Ergebnis, „Verbergen" als **zweite** Geste zu behalten — oder ersetzt „Löschen" das „Verbergen"? Falls beide: klare sprachliche/visuelle Trennung |
| **A2** | Nur falls Verbergen bleibt: „Versteckte Karten verwalten / wieder einblenden"-UI (Settings/Overlay)? |
| **A3** | Nur falls Verbergen bleibt: Bestätigungs-Dialog vor Verbergen (V1 = direkt + 5s-Undo)? |
| **A4** | Trash-Variante mit `CARD_HIDE`-Enum + 60s-Cleanup — relevant nur, wenn Löschen über den Trash läuft; durch M1 überlagert |

**Abhängigkeit (Roadmap §18):** Das M1/M2-Paar entscheidet über Existenz von A2/A3; M1 ist die übergreifende Spec, A4 ein Detail darunter.

---

## 2. Cluster 2 — Welle / Treppe (M3 → B6/B1 → B2/B3/B4)

Hintergrund: M3 will eine **Welle** (monatliche IST + Plan) hinter dem Ring auf gleicher Höhe; Klick öffnet ein **Treppen-Popup** mit kumulierter Sparrate. Das **ersetzt das V1-Treppen-Layout** (§9). B-Punkte bis zur M3-Entscheidung eingefroren.

| Frage | Zu entscheiden |
|---|---|
| **M3 (Keystone)** | Welle-Konzeption: Position/Höhe relativ zum Ring, Darstellung monatlich IST vs. Plan, Klick-zu-Treppen-Popup-Verhalten, Position der Treiber-Hinweise |
| **B6 (nur Popup)** | Führt das **Treppen-Popup** (kumulierte Fläche) noch eine **Vorjahres-Linie** (kumulierter Jahresendwert)? Falls ja: Verhalten bei datenlosem Vorjahr (V1: Linie entfällt; Alternative: 0-€-Linie + Label). Auf die monatliche Welle ist die Referenz bewusst NICHT übertragbar |
| **B1** | Multi-Year-Rolling-Window (12 Monate gleitend) im Welle-/Popup-Kontext neu definieren — oder Kalenderjahr beibehalten? |
| **B2/B3/B4** | Bleiben anwendbar (Abweichungs-Treiber-Heuristik / Rot-Spec negative Kumulation / monatsgenauer %-Nenner) — Bestätigung, dass sie im Welle-/Popup-Kontext gelten |
| **B5** | Performance-Bulk-RPC `get_yearly_sparrate_curves` — bleibt relevant; reine Architektur-Frage, hier nur zur Kenntnis |

---

## 3. Cluster 3 — Darstellungs- und Token-Entscheidungen (N4b / M10 / N5)

**Scope hängt am M3-Ausgang** (Cluster 2): Sobald M3 eine monatliche IST-vs-Plan-Welle einführt, trifft die Plan-≈-0-Degeneration **Ring und Welle**. Was hier festgelegt wird, muss für beide Flächen tragen.

| Frage | Zu entscheiden |
|---|---|
| **N4b (Ring + Welle)** | Cap-/Vorzeichen-/alternative Darstellung bei **winzigem Plan-Nenner** (Befund ≈ 73,80 € → 358 %) — auf Ring **und** Welle. §5 cappt den Arc bei 200 %, die %-Zahl bleibt ungecappt + aussagearm |
| **M10 (Ring + Welle + Popup)** | Darstellung **negativer kumulierter Plan-Sparrate** |
| **N5** | Rohmasse-Farbtöne: zugeordnete Fragmente (Opacity 0.22) ↔ `INTERNAL_TRANSFER` (Opacity 0.45). „Vereinheitlichen" — und wenn ja: bleibt die bewusste Sprint-9-AD5-Differenzierung (Transfer heller + Grau-Soft-Badge statt KI-Yellow) **erhalten**, oder wird sie aufgehoben? Reiner `+−`-Glyph-Bug (N4a) wird unabhängig in v2-01 gefixt |

---

## 4. Was nach dieser Runde entsperrt wird

| Entscheidung | Entsperrt Briefing für |
|---|---|
| M1 + M2 | Karten-Lösch-/Verberg-Sprint (inkl. A2/A3/A4) + Architekt-Rücksprache zur Fragment-Konsequenz |
| M3 + B6/B1 | Welle-/Treppen-Popup-Sprint (B-Kategorie) |
| N4b + M10 | Ring-/Welle-Darstellungs-Feinspec |
| N5 | Rohmasse-Token-Spec → N5-Fix als Folge von v2-01 |

**Nicht Teil dieser Runde** (separat, eigene spätere DD-Runde): M5 (Karten-Reihenfolge — heutigen Stand erst verifizieren), M11 (Dark Mode — niedrige Priorität).

---

## 5. Rückgabe an PM

Pro Frage eine kurze Festlegung, Cluster für Cluster. Daraus erstelle ich die abhängigen Sprint-Briefings; bei DB-Konsequenzen (M1) folgt ein Architekten-Auftrag analog Pre-Sprint-Stufe-1.

---

*Design-Direktor-Diskussion Block 1 (bereit) · Antigravity Finance 2.0 · 04. Juni 2026*
