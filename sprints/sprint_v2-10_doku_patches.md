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
**Status:** ✅ **Angewendet am 05.08.2026 in Phase 5** — alle fünf Patches, Design-Doku
steht auf **v3.1.7**. Alle sechs Anker waren vor der Anwendung einzeln per Volltextsuche
als eindeutig bestätigt (je genau ein Treffer). Diese Datei bleibt als Beleg stehen.

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

## Patch 3 — §8 Fragment-Stack: Anzeige zeigt den Verwendungszweck (`RM-1`)

**Anker:** §8 → „Fragment-Stack (Rechts)" → exaktes Zitat des Listenpunkts zur
Sortierung (er nennt die Beschreibung als finalen Tiebreaker und ist damit die
Stelle, an der die Unterscheidung „gespeichert vs. angezeigt" hingehört):

```
- **Sortierung:** Unzugeordnete Fragmente zuerst, dann zugeordnete (gedimmt).
```

**Patch:** Als neuen Listenpunkt **direkt davor** einfügen:

```markdown
- **Angezeigte Beschreibung (v2-10, RM-1):** Die Fragment-Karte zeigt **den letzten
  durch `|` getrennten Teil** der gespeicherten Beschreibung; ist dieser leer, fällt
  sie auf den **ersten** Teil zurück. Damit steht der Verwendungszweck vorn statt des
  Empfängers, ohne dass die Anzeige die Herkunft des Fragments kennen muss: DKB Visa
  liefert ein Feld ohne Trennzeichen (unverändert), DKB Giro `Empfänger | Zweck`,
  Cortal `Sender | Buchungstext | Zweck`.
  **Ausschließlich Anzeige.** Der gespeicherte Text bleibt unverändert — er ist
  Bestandteil des Duplikat-Hashes, des Trigram-Index der Zuordnung und des
  Beschreibungs-Tiebreakers der Sortierung unten. Das `title`-Attribut trägt weiterhin
  den **vollständigen** Text; das Abschneiden mit „…" bleibt reines CSS
  (`text-overflow: ellipsis`).
```

**Quelle/Begründung:** `sprints/sprint_v2-10_auftrag.md` Phase 3 (`RM-1`) — Regel dort
festgelegt. Die Trennung „gespeichert ≠ angezeigt" gehört zwingend in dieselbe Liste
wie der Sortier-Tiebreaker, sonst liest sich der Tiebreaker künftig so, als sortiere
er nach dem gekürzten Text.

---

## Patch 4 — §11 „Fragment-Karte — Spezifikation": zwei Zeilen der Feld-Tabelle

**Anker:** §11 → „### Fragment-Karte — Spezifikation" → die Feld-Tabelle, exakte
Zeilen:

```
| Beschreibung | `10px`, `font-weight: 500` | `rgba(255,255,255,.28)` · truncated |
```

```
| Kategorie-Badge (nur 0.60–0.95) | `7.5px`, `font-weight: 600`, uppercase | Karten-spezifisch — einer von sechs `--badge-hue-*`-Tönen (§3), deterministisch aus dem Kartennamen |
```

**Patch 4a — Beschreibungs-Zeile ersetzen durch:**

```markdown
| Beschreibung | `10px`, `font-weight: 500` | `rgba(255,255,255,.28)` · truncated · zeigt den Verwendungszweck (§8, `RM-1`) |
```

**Patch 4b — Badge-Zeile ersetzen durch:**

```markdown
| Kategorie-Badge (nur 0.60–0.95) | `7.5px`, `font-weight: 600`, uppercase | **Seit v2-10 nicht mehr gerendert** (`BF-1`) — Spezifikation bleibt für die Wiedereinschaltung stehen |
```

**Ergänzender Absatz** direkt unter dem bestehenden Absatz „**Badge-Farbe (v2-07,
A1):** …" einfügen:

```markdown
**Nicht mehr gerendert (v2-10, BF-1):** Die KI-Vorschlags-Badges sind aus der Anzeige
genommen. Anlass war ein Umbruch: Badge und Betrag teilten sich eine Zeile, das Badge
durfte weder schrumpfen noch umbrechen, also wurde der Betrag zusammengedrückt und das
Euro-Zeichen rutschte in die zweite Zeile. Der Vorschlag wird in der Datenbank
unverändert **weiter berechnet** und die sechs Farbtöne bleiben im Code — die Anzeige
ist über eine einzelne Konstante (`SHOW_SUGGESTION_BADGES`) wieder einschaltbar.
Unberührt bleiben das **TRANSFER-Badge** und die **automatische Zuordnung ab 95 %
Konfidenz**: sie ist keine Empfehlung, sondern eine fertige Zuordnung. Der Betrag trägt
zusätzlich ein Umbruch-Verbot, damit die Fehlerklasse auch für das TRANSFER-Badge
dauerhaft geschlossen ist.
```

**Quelle/Begründung:** Punkte 1/2/4 in
`V2/befunde_2026-08-04_fehler_und_entscheidungen.md` §2 (User-Entscheid 04.08.2026).

> **Hinweis — dieser Patch geht über den Wortlaut des Arbeitsauftrags hinaus.** Der
> Auftrag nennt für Phase 2 (`BF-1`) ausdrücklich **keinen** Doku-Patch. Ohne 4b
> behauptet die Design-Doku allerdings weiterhin, ein Badge werde gerendert, das seit
> diesem Sprint nicht mehr erscheint — die Doku ist normativ (§5), eine solche
> Divergenz wäre also ein echter Fehler in der Bibel. Der zugrunde liegende Beschluss
> ist am 04.08.2026 gefallen und dokumentiert; hier wird nichts entschieden, nur
> nachgetragen. Beim Anwenden in Phase 5 kann diese Stelle einzeln zurückgestellt
> werden, ohne die übrigen Patches zu berühren. Vermerkt in
> `sprints/sprint_v2-10_offene_fragen.md` §3.

---

## Patch 5 — Header: Versions-Bump und Changelog

**Anker 1:** Kopfzeile des Dokuments, exaktes Zitat:

```
**Version:** 3.1.6 (V2 · v2-07 Doku-Nachzug)
```

**Patch:** ersetzen durch:

```markdown
**Version:** 3.1.7 (V2 · v2-10 Doku-Nachzug)
```

**Anker 2:** die letzte Changelog-Zeile im Kopf-Blockzitat, exaktes Zitat des
Zeilenanfangs:

```
> **Changelog v3.1.6 (25.07.2026, Sprint v2-07):**
```

**Patch:** direkt **darunter** eine neue Changelog-Zeile einfügen:

```markdown
> **Changelog v3.1.7 (05.08.2026, Sprint v2-10):** §7 Positionsregel für Overlays und Popups — immer mittig, einzige Ausnahme das Karten-Kontextmenü (`RM-4`); §8 Verweis auf dieselbe Regel für Recurrence-Popup und Direktklick-Overlay; §8 Fragment-Stack zeigt den Verwendungszweck statt des Empfängers, ausschließlich in der Anzeige (`RM-1`); §11 Feld-Tabelle nachgezogen — KI-Vorschlags-Badges seit v2-10 nicht mehr gerendert, Spezifikation bleibt für die Wiedereinschaltung stehen (`BF-1`).
```

**Begründung:** Ein gemeinsamer Patch-Level-Bump für alle Stellen dieses Sprints statt
getrennter Bumps je Phase. §7 Regel 14 verlangt den Bump als eigene Patch-Stelle —
das ist er hier.

---

## Offene Fragen aus diesem Auftrag

Keine. `RM-4` ist im Arbeitsauftrag vollständig entschieden; beide Anker waren vor
dem Schreiben dieser Datei per Volltextsuche als eindeutig und einzigartig im
Dokument bestätigt.

---

## Weiteres Vorgehen (nicht Teil dieses Patches)

- **Vollständig.** Alle Patches dieses Sprints stehen jetzt in dieser Datei:
  Patch 1 (§7, `RM-4`), Patch 2 (§8, `RM-4`-Verweis), Patch 3 (§8, `RM-1`),
  Patch 4 (§11, `RM-1` + `BF-1`) und Patch 5 (Header, Versions-Bump 3.1.6 → 3.1.7).
- **Reihenfolge beim Anwenden:** Patch 1 → 2 → 3 → 4 → 5. Reine Lesefolge; zwischen
  den Stellen besteht keine Abhängigkeit. Patch 5 (Bump) zuletzt, damit der
  Changelog beschreibt, was tatsächlich angewendet wurde.
- **Anker vor dem Anwenden einzeln auf Eindeutigkeit prüfen** (Fähigkeit
  `sprint-abschluss`, Schritt 6).

---

*Doku-Patches Sprint v2-10 · Antigravity Finance · 05. August 2026*
