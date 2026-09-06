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

---

## Schritt 3 · `cards.module.css` + `card-action-toast.module.css`

**Zwei Fragen, die eine Entscheidung von dir brauchen.** Davor sechs Befunde,
die ich im Sinn der sieben Regeln aufgelöst habe.

### ❓ F1 · Zwei Textzeichen sollen SVG werden — das wäre `.tsx` Nummer fünf und sechs

Die Übergabe verlangt an zwei Stellen, ein Textzeichen durch ein SVG zu
ersetzen:

| Stelle | heute | Übergabe |
|---|---|---|
| `verlauf-overlay.tsx:133` | `×` als Text | 10×10-SVG |
| `category-tile.tsx:150` | `›` als Text | 8×12-SVG |

**Bedingung 2 des Auftrags lässt in `.tsx` nur Klassennamen zu**, und nennt genau
vier Stellen — diese beiden sind nicht darunter. Es ist keine Logik und keine
neue Datei, aber es ist Markup.

**Die Begründung der v3-Seite ist stichhaltig:** Ein Textzeichen variiert je Font
in Höhe und Strichstärke; `›` steht in SF Pro anders als in Helvetica Neue, und
der Chevron sitzt dann sichtbar schief. Mit dem neuen Schriftstapel
(`-apple-system` zuerst) ändert sich genau das.

**Ich habe beide Stellen vorerst als Textzeichen gelassen** und nur ihre Hülle
auf v3 gebracht (28 px, `--neutral-fill`, kein Rand). Sie funktionieren so.

**Deine Entscheidung:** ① so lassen und in einem eigenen Nachzug erledigen,
② die beiden SVG-Tausche freigeben — vier Zeilen JSX, keine Logik, keine Props.
*Ich empfehle ②*, weil die Stelle sonst genau dann schief steht, wenn der neue
Font greift.

### ❓ F2 · Ein bestehender Wächter verlangt einen Token-Namen, den v3 ablöst

`tests/e2e/vorschlagszeile.spec.ts` Zeile 131–134 prüft wörtlich:

```
expect(b, "der Vorschlag trägt --text-ghost, den schwächsten Ton im System")
  .toMatch(/color:\s*var\(--text-ghost\)/);
```

Die Übergabe will für `.fragmentSuggestion` in Schritt 4 `--text-tertiary`.
**Beide haben denselben Wert** — `--text-ghost` ist seit Schritt 1 ein Alias
darauf. Der Test würde also an einem **Namen** scheitern, nicht an der Optik.

Das kollidiert mit der Auflage „alle anderen Tests bleiben unverändert grün".

**Deine Entscheidung:** ① `.fragmentSuggestion` behält `--text-ghost` (Test
unverändert grün, aber ein Modul liest weiter den Altnamen), ② der Test wird auf
`--text-tertiary` nachgezogen — eine Zeile, die Aussage des Wächters
(„schwächster Ton im System") bleibt wortgleich erhalten.
*Ich empfehle ②*, denn der Wächter meint den **Ton**, nicht den Namen — und mit
① bliebe eine Stelle übrig, die niemand mehr findet, wenn die Alias-Zeile
irgendwann fällt.

### Befunde, im Sinn der Regeln entschieden

**B7 · Der weiße Haken braucht keine `.tsx`-Zeile.** `IconCheckmark` und
`IconOverExclamation` tragen ihre Farbe als **Präsentations-Attribut**
(`stroke="rgba(62,207,175,.85)"`). Auf der jetzt gefüllten Fläche wären sie
unsichtbar. Präsentations-Attribute haben die **niedrigste** Priorität aller
Autoren-Stile — eine CSS-Regel im Modul schlägt sie. Erledigt in CSS.

**B8 · Ein neues Token: `--on-accent: #FFFFFF`.** Was *auf* einer gefüllten
Türkis- oder Rot-Fläche liegt, muss in **beiden** Erscheinungen weiß sein;
`--text-primary` wäre im Light Mode schwarz auf Türkis. §7 verbietet Hex-Codes
inline, deshalb ein Token statt `#fff` an vier Stellen. Nicht in der Übergabe
vorgesehen — sie schreibt `#fff` direkt, was im Repo gegen die Arbeitsregel
verstieße.

**B9 · „Erwartet" wird NICHT türkis.** Es trug bis v3-01 denselben Grünton wie
„Erhalten". `komponenten/karten.html` sagt dazu ausdrücklich: *„Gleiche Sprache
wie Offen: leerer Kreis."* Erwartet heißt „noch nicht", und dafür gibt es keine
Farbe. Türkis bleibt „Erhalten" vorbehalten.

**B10 · Der eigene Ghost-Ton des Fälligkeitstags entfällt.** `.ghost .dueDay`
stand auf `.20` — nötig, solange die Karten-Deckkraft `.65` alles andere
mitdimmte. Ohne sie gibt es den Effekt nicht mehr, und eine fünfte Textstufe
wäre genau die Beliebigkeit, die v3 abschafft.

**B11 · Der ausgegraute Lösch-Eintrag behält seine `opacity`.** Regel 3 zielt auf
**Zustände, die dauerhaft angezeigt werden**. Ein abgeschalteter Knopf ist etwas
anderes — dort ist `opacity` das übliche und erwartete Mittel. Dieselbe
Begründung trägt die Deckkraft beim **Drag-Start** (0.35): eine vorübergehende
Rückmeldung während einer Geste, kein Zustand.

**B12 · Vier Stellen, zu denen die Übergabe schweigt.** `.categoryItem`
(`.62` / `.9`), `.categoryItemActive`, `.categoryItemMark` (`.45`), `.contextIcon`
(`.55` / `.07`) und die Scrollbalken (`.14`). Alle auf die nächstliegende der vier
Textstufen bzw. auf `--neutral-fill` / `--border-ghost` gezogen — das ist die
Anwendung von Regel 3, nicht eine eigene Gestaltung. Wären sie stehengeblieben,
stünden fünf frei gewählte Alpha-Werte mitten im neuen Vierstufen-System.
