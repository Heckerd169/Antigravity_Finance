# Sprint v2-10 — Doku-Patches

**Erzeugt von:** docs-maintainer (LL-16 — Design-/Schema-Doku werden nie direkt editiert)
**Ziel-Dokument:** `antigravity_finance_design_dokument.md` (aktuell v3.1.6)
**Datum:** 05. August 2026
**Zweck:** Die Positionsregel für Overlays und Popups (`RM-4`, Sprint v2-10 Phase 1)
in die Design-Doku übernehmen — inklusive der Kontextmenü-Ausnahme.
**Auftrag/Quelle:** `sprints/sprint_v2-10_auftrag.md`, Phase 1 (`BF-3` + `RM-4`,
Zeilen 73–83). Der Wortlaut der Regel steht dort **wörtlich fest** und wird
unverändert übernommen; Zeile 83 benennt den Anwendungsbereich explizit: „Berührt
Design-Doku §7/§8."
**Status:** Entwurf — **noch nicht angewendet**. Diese Datei enthält bislang nur
den Patch aus Phase 1 (`RM-4`). Laut Arbeitsauftrag („Phase 5 · Abschluss", Punkt 3)
wird ein zweiter Patch aus Phase 3 (`RM-1` — §8, Verwendungszweck-Anzeige statt
Empfänger) noch in dieselbe Datei nachgetragen, bevor beide gemeinsam angewendet
werden.

**Schema-Doku:** kein Patch — `RM-4` ist reine Anzeige-/Layout-Dokumentation ohne
Tabellen-, Spalten-, RPC-, Trigger- oder Enum-Bezug.

---

## Bestandsaufnahme (im Sprint verifiziert, hier nur referenziert — nicht verändert)

Acht Komponenten zeichnen per React-Portal an `document.body`. Davon sind **sieben**
Overlays/Popups im Sinne der Regel; die achte ist der Rückgängig-Toast, der keine
modale Fläche ist und seine eigene Position aus §2.4 behält (`bottom: 24px`,
horizontal zentriert — laut Kommentar in `card-action-toast.module.css` „bewusst
anders als der Sprint-9-Backfill-Toast oben"). Die Regel unten gilt ihm deshalb
nicht.

- `cards/adjust-amount-overlay.tsx` — „Betrag anpassen" (§7)
- `cards/end-card-overlay.tsx` — „Karte beenden…" (§7)
- `cards/card-action-toast-provider.tsx` (§7)
- `interaction-zone/recurrence-popup.tsx` — Recurrence-Popup (§8, Weg 1)
- `interaction-zone/direct-create-overlay.tsx` — Overlay (§8, Weg 2)
- `interaction-zone/linked-fragments-overlay.tsx` — Verknüpfte-Fragmente-Overlay (§7)
- `income-split/index.tsx` — Einkommens-Popup (§10)

Das Einkommens-Popup war das achte und einzige, das nie umgestellt worden war
(Befund `BF-3`: `.splitLeft`/`.splitRight` in `welle.module.css` tragen ein
`transform: translateY(-50%)`; ein Vorfahre mit `transform` wird zum Bezugsrahmen
für `position: fixed`, deshalb öffnete das Popup rund 80 px schmal). Es ist in
Sprint v2-10 Phase 1 per Portal nachgezogen worden (Commit-Botschaft laut
Arbeitsauftrag: `fix: einkommens-popup mit portal, positionsregel dokumentiert
(v2-10 p1)`) und zählt seither zu den zentrierten.

Einzige bewusste Ausnahme von der Zentrierung: das **Karten-Kontextmenü**
(`cards/card-interactive.tsx`, §7) — es ist am auslösenden ⋯-Icon verankert.

**Hinweis zur Auswahl der Beispiele unten:** `card-action-toast-provider.tsx`
gehört inhaltlich zum bereits bestehenden §2.4 „Soft-Delete-Pattern
(Rückgängig-Toast)", dessen Toast-UI dort mit einer eigenen, davon abweichenden
Position spezifiziert ist (`fixed`, `bottom: 24px`, horizontal zentriert — nicht
„mittig im Bild"). §2.4 ist von diesem Auftrag nicht berührt und wird hier nicht
angetastet. Die Patches unten nennen als konkrete Beispiele deshalb nur
Komponenten, die die Design-Doku bereits ausdrücklich als „Overlay" führt.

---

## Verortung — warum §7 und §8, nicht §12.4

§12.4 „Kontextmenü + Overlays" wurde geprüft und **nicht** verwendet. §12 erklärt
seinen eigenen Geltungsbereich in der Einleitung ausdrücklich: „Alle
deutschsprachigen UI-Texte der App" (Zeile 1139). §12.4 selbst ist durchgehend eine
zweispaltige Kontext/Text-Tabelle für wörtliche Beschriftungen (Beispiel:
„Kontextmenü — Option 1 | `Betrag anpassen`"). Eine Positions-/Verhaltensregel ist
kein UI-Text und passt weder ins Tabellenformat noch in den erklärten
Geltungsbereich des Abschnitts.

Die Regel gehört zu den Verhaltens-Spezifikationen der betroffenen Komponenten —
die stehen in §7 (Kontextmenü, „Betrag anpassen", „Karte beenden…",
Verknüpfte-Fragmente-Overlay) und §8 (Recurrence-Popup, Direktklick-Overlay). Beide
Abschnitte werden im Arbeitsauftrag auch explizit als berührt genannt.

**Zwischen §7 und §8:** Der vollständige, wörtliche Regel-Satz steht **einmal**, in
§7 — dort lebt die einzige Ausnahme (Karten-Kontextmenü), die den Satz erst
notwendig macht. §8 bekommt eine kürzere Stelle, die auf §7 verweist, statt den
wörtlichen Satz zu wiederholen. Das folgt derselben Verweis-Konvention, die die
Doku für wiederkehrendes Verhalten bereits nutzt (Beispiel: „Ghost (Forecast):
Identisch zu Fixkosten-Ghost-Variante" in §7) — eine Regel, ein Ort, der Rest
verweist.

---

## Patch 1 — §7 Kontextmenü: Positionsregel + Ausnahme

**Anker:** §7 → Abschnitt „### Kontextmenü (⋯-Icon)" → exaktes Zitat der ersten
Zeile danach:

```
Erscheint bei Hover oben links — Default: unsichtbar.
```

**Patch:** Direkt darunter, vor der Optionen-Tabelle, neuen Absatz einfügen:

```markdown
**Position (v2-10, RM-4):** Overlays und Popups erscheinen immer mittig im Bild, an
derselben Stelle; sie unterscheiden sich in der Größe, nie im Ort. **Kontextmenüs**
sind davon ausgenommen — sie erscheinen am auslösenden Element, weil sie sonst ihren
Bezug verlieren. Konkret: Von den sieben Overlays und Popups der App ist
ausschließlich das Karten-Kontextmenü hier (`cards/card-interactive.tsx`) am
auslösenden ⋯-Icon verankert; die übrigen sechs — darunter „Betrag anpassen" und
„Karte beenden…" weiter unten in diesem Abschnitt — zeichnen zentriert per
React-Portal an `document.body`. Der Rückgängig-Toast ist **kein** Overlay in
diesem Sinne: er behält seine eigene, in §2.4 spezifizierte Position unten Mitte.
```

**Quelle/Begründung:** `sprints/sprint_v2-10_auftrag.md` Phase 1 (`RM-4`) — Wortlaut
wörtlich übernommen, nicht umformuliert. §7 ist die einzige Stelle, an der die
genannte Ausnahme (Karten-Kontextmenü) konkret existiert; deshalb steht hier der
vollständige Regel-Satz.

---

## Patch 2 — §8 Karussell: Verweis auf dieselbe Regel

**Anker:** §8 → „Karussell (Mitte)" → nach dem Absatz „**Leerer Slot — Weg 2
(Direktklick):**…", exaktes Zitat der Zeile:

```
→ Overlay: Name + Betrag + Karten-Typ + Frequenz + Attribution. Gilt ab dem aktuell angezeigten Monat.
```

und **vor** dem Absatz „**Wichtig zur Frequenz „Einmalig":**…".

**Patch:** Dazwischen neuen Absatz einfügen:

```markdown
**Position (v2-10, RM-4):** Das Recurrence-Popup (Weg 1) und das Overlay aus Weg 2
(Direktklick) folgen derselben Regel wie alle Overlays und Popups der App (§7,
Abschnitt „Kontextmenü (⋯-Icon)"): sie öffnen zentriert, unabhängig davon, an
welcher Position der „Leerer Slot" im Karussell steht, von dem aus sie ausgelöst
wurden. Keines der beiden ist eine Ausnahme — die einzige Ausnahme in der App ist
das Karten-Kontextmenü.
```

**Quelle/Begründung:** dieselbe Quelle wie Patch 1. §8 beherbergt zwei der acht
Overlays (Recurrence-Popup, Direktklick-Overlay) ohne eigene Ausnahme — eine
Verweis-Stelle statt einer zweiten wörtlichen Kopie hält die Regel an einem Ort
wartbar.

---

## Offene Fragen aus diesem Auftrag

Keine. `RM-4` ist im Arbeitsauftrag vollständig entschieden; beide Anker waren vor
dem Schreiben dieser Datei per Volltextsuche als eindeutig und einzigartig im
Dokument bestätigt.

---

## Weiteres Vorgehen (nicht Teil dieses Patches)

- **Zweiter Patch folgt:** Phase 3 (`RM-1`, §8 — Rohmasse zeigt den
  Verwendungszweck statt des Empfängers) wird laut Arbeitsauftrag als weiterer
  Patch an diese Datei angehängt.
- **Versions-Bump erfolgt nicht hier.** Beide Patches werden gemeinsam in Phase 5
  angewendet, mit einem gemeinsamen Versions-Bump im Header (**3.1.6 → 3.1.7**)
  und einem gemeinsamen Changelog-Eintrag — statt zwei getrennter
  Patch-Level-Bumps für zwei Phasen desselben Sprints.
- **Reihenfolge beim Anwenden:** Patch 1 (§7) vor Patch 2 (§8) — reine Lesefolge,
  keine Abhängigkeit zwischen den beiden Stellen.

---

*Doku-Patches Sprint v2-10 · Antigravity Finance · 05. August 2026*
