# Sprint v3-01 — Rückfragen und Befunde zur Übergabe

> Gesammelt während der Umsetzung, gebündelt je Schritt gefragt (Auftrag,
> „Vorgehen je Schritt"). Was hier als **Befund** steht, habe ich selbst
> entschieden und im Sinne der sieben Regeln aufgelöst; was als **Frage**
> steht, braucht eine Antwort, bevor es weitergeht.

---

## Schritt 1 · `src/styles/tokens.css`

**Keine blockierenden Fragen.** Vier Befunde, alle aufgelöst.

### B1 · `--text-muted` und `--text-ghost` bleiben als Alias stehen

Die Übergabe schreibt sie um: `--text-muted → --text-secondary`,
`--text-ghost → --text-tertiary`. Gemessen werden sie aber von **zehn** bzw.
**acht** Dateien gelesen — darunter sechs, die in keinem der acht Schritte
vorkommen:

`src/app/error.module.css` · `src/app/page.module.css` ·
`src/app/login/login.module.css` · `src/app/onboarding/onboarding.module.css` ·
`src/components/dashboard-ring-stage/` · `src/components/income-labels/`

Ein reines Umbenennen hätte sie gebrochen. Sie stehen deshalb als Alias auf
den neuen Stufen (`--text-muted: var(--text-secondary)`). Damit erben sie die
v3-Werte, ohne angefasst zu werden — genau das, was die Übergabe unter
*„Login und Onboarding folgen denselben Tokens"* ankündigt. Die sechs Module
dieses Sprints benutzen die neuen Namen.

**Was daraus folgt:** Die Alias-Zeilen sind der Ort, an dem später die
Restmigration hängt. Wer sie entfernt, muss vorher die sechs Dateien
umstellen; der Kommentar in `tokens.css` sagt das.

### B2 · `--color-blue-dot` wird von KEINEM Modul gelesen — es gibt einen Nachbau

Die Übergabe hebt den Wert von `.38` auf `.7` mit der Begründung *„6-px-Punkt
braucht Deckkraft"*. Gemessen liest **kein einziges** CSS-Modul dieses Token.
Der „Gemeinsam"-Punkt hängt an einer **lokalen Kopie** in
`cards.module.css:28`:

```
--meta-dot-gem: rgba(100, 168, 240, .38);
```

Der Tokenwert allein hätte also **nichts bewirkt** — die Karte hätte weiter
.38 gezeigt, und die Änderung wäre grün durchgelaufen, ohne sichtbar zu sein.
Das ist die zweite Gestalt von **LL-26** („Nachbauen"): dieselbe Farbe ein
zweites Mal formuliert.

**Erledigt in Schritt 3:** `.metaDotGem` zeigt auf `var(--color-blue-dot)`,
die lokale Kopie entfällt.

### B3 · `--typo-label-meta-*` ist ebenfalls tot

Dieselbe Lage: global definiert, von keinem Modul gelesen. Status, Termin und
Meta-Zeile tragen ihre Werte hart in `cards.module.css`. Die Übergabe ändert
das Token (10/500/0,6 → 11/500/0) — auch das bliebe ohne Verdrahtung
wirkungslos. **Erledigt in Schritt 3.**

Zum Vergleich: `--typo-label-small-*` wird an **24** Stellen gelesen und wirkt
sofort.

### B4 · Zwei Namensfragen, nach der Regel „Maße von der v3-Seite" aufgelöst

- **`--typo-month-active-tracking`** steht nicht in der Übergabe-Tabelle,
  wohl aber auf `foundations/typografie.html`: v3 **−0,4 px** gegen heute
  −0,5 px. Übernommen, weil die Komponentenseite die Maße trägt.
- **Die v3-Datei `styles.css` führt `--typo-label-*` und `--typo-caption-*`,
  das Repo `--typo-label-small-*` und `--typo-label-meta-*`.** Beibehalten
  sind die Repo-Namen, weil die alt→neu-Tabelle der Übergabe genau diese
  nennt. Zwei Namen für dieselbe Rolle wären schlimmer als ein alter Name.

### B5 · Light Mode ist vollständig, aber bewusst lückenhaft

Der `[data-theme="light"]`-Block trägt alle v3-Tokens aus
`design-system/styles.css`. **Nicht** aufgeführt sind die als
„Übergangs-Token" markierten (`--bg-card-open/-paid/-over`, `--border-teal`,
`--border-red`, `--border-category-open/-done`, `--text-category-flag`,
`--border-bracket-open`) und `--fragment-hue` — sie verschwinden in den
Schritten 3 und 4. Ein Light-Wert dafür wäre eine Zahl für etwas, das es dann
nicht mehr gibt.

**Prüfbedingung für den späteren Umschalter:** Diese Liste muss leer sein.
Steht sie im Kommentar in `tokens.css`.

### B6 · `--ring-track` lag lokal

`singularity-ring.module.css:2` definiert es selbst mit `0.05`. v3 will
`0.06` global. Das globale Token ist angelegt; die lokale Zeile überschattet
es noch und fällt in **Schritt 5**. Bis dahin bleibt der Ring optisch
unverändert — das ist gewollt, nicht übersehen.
