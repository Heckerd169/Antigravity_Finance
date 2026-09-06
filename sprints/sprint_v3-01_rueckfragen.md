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

---

## Schritt 4 · `interaction-zone.module.css` + fünf `.tsx`-Stellen

**Keine offenen Fragen.** Beide Entscheidungen aus Schritt 3 sind eingebaut
(SVG-Tausche freigegeben, Wächter nachgezogen). Fünf Befunde.

### B13 · Dritter Fundort derselben Sache — 38 lokale Farbwerte

Am `.interactionZone`-Root standen **38** komponenten-lokale Farbwerte, exakt
dasselbe Muster wie in `cards.module.css`: `--frag-bg: #141416`,
`--frag-amount-neg: #FF453A`, `--zone-label: rgba(255,255,255,.18)`,
`--slot-icon`, `--chev-color`, `--portal-*` … Eine Änderung an `tokens.css`
erreichte diese Komponente nicht, weil sie ihre Farben selbst mitbrachte.

Sie sind jetzt ausnahmslos **Weiterleitungen** auf globale Tokens. Zusammen mit
`cards` und `card-action-toast` tragen die drei Module danach **null** rohe
Farbwerte (Schwarz-Schatten ausgenommen).

**Das ist der dritte Fundort in einem Sprint** — nach den achtzehn in `cards`
und den vier hartkodierten SVG-Farben in `card.tsx`. Gehört als
Lessons-Learned-Kandidat ins Review.

### B14 · Die Übergabe adressiert BEIDE Module, ich hatte nur eines gelesen

Der Abschnitt „Overlays, Menü, Toast" ist überschrieben mit
*„cards.module.css **+ interaction-zone.module.css**"*. Beim ersten Durchgang
habe ich ihn nur auf `cards` angewandt — `.overlayModal`, `.overlayTitle`,
`.overlayInput` und `.cancelButton` gibt es **in beiden Dateien** mit denselben
Namen. Nachgeholt; ohne den Abgleich wäre das „Karte anlegen"-Overlay als
einziges im alten Stand geblieben.

### B15 · „Lösen" wird neutral, nicht rot — abgeleitet, nicht vorgegeben

`.ejectButton` (Fragment von einer Karte lösen) war rot getönt. Die Übergabe
sagt dazu nichts. Die v3-Seite *Einkommen* begründet für den gleichnamigen
Knopf im Gehalts-Popup ausdrücklich: *„Lösen neutral (kein Rot: Lösen ist
rückgängig machbar)."* Dieselbe Handlung, dieselbe Begründung — übernommen.

### B16 · Ein Wächter hat eine echte Ungeschicklichkeit gefunden

`vorschlagszeile.spec.ts` ③ wurde rot: Meine neuen Stufen-Überschreibungen
(`.fragmentCardLocked .fragmentDesc`) standen **vor** der Basisregel
`.fragmentDesc`, und der Test greift die **erste** Textstelle — dort steht
keine Schriftgröße. Der Test hatte recht in der Sache: Eine Überschreibung
gehört hinter das Überschriebene. Verschoben, nicht der Test angepasst.

### B17 · Die Prüfbedingung für den Light-Umschalter ist erfüllt

Die zwölf Übergangs-Tokens sind entfernt — **nachdem** gemessen war, dass kein
Modul sie mehr liest, nicht weil der Plan es vorsah. Damit ist die Liste der
Tokens ohne Light-Wert **leer**; genau das war die Bedingung, die der Kommentar
in `tokens.css` seit Schritt 1 nennt.

Mit entfallen sind `--border-category` und `--border-category-stack`, die die
Übergabe **nicht** nennt: Die Ordner-Kachel trägt seit Beschluss A denselben
Rand wie jede Karte (`--border-subtle`), damit hatten sie keinen Leser mehr.

---

## Schritt 5 · Ring, Header, Welle

**Zwei Fragen.** Beide betreffen Stellen, an die die Übergabe die v3-Regeln
schickt, die aber außerhalb der acht Schritte liegen.

### ❓ F3 · Die halbe Welle liegt in `draw.ts` und ist aus CSS nicht erreichbar

Die v3-Seite `komponenten/welle.html` verlangt fünf Dinge. **Drei davon stehen
hartkodiert im Zeichencode**, nicht im CSS-Modul:

| Was v3 will | Wo es heute steht | Wert |
|---|---|---|
| Monatsnamen 9 → 11 px, keine Versalien | `draw.ts:218` | `ctx.font = "500 8px system-ui"` — tatsächlich **8 px** |
| Aktiver Monat weiß statt 50 % Grau | `draw.ts:219` | `graS(0.5)` gegen `graS(0.18)` |
| Goldlinie von 60 auf 75 % Deckkraft | `draw.ts:356`, `362` | `goldS(0.55)` / `goldS(0.85)` |

Dazu zwei Stellen, die dieselbe Klasse haben und in der Übergabe gar nicht
vorkommen: die Achsenbeschriftung des Popups (`draw.ts:378`, ebenfalls **8 px**)
und der Schriftstapel — der Zeichencode schreibt dreimal `system-ui`, während
v3 `-apple-system` an die erste Stelle setzt. **Die Welle rendert damit in einer
anderen Schrift als der Rest der App.**

**Die Token-Änderung `--color-gold: .6 → .75` aus Schritt 1 erreicht die
Goldlinie nicht.** Sie ist im Diff sichtbar, im Bild nicht — der **vierte**
Fundort derselben Fehlerklasse in diesem Sprint (nach 18 Werten in `cards`,
4 SVG-Farben in `card.tsx`, 38 Werten in `interaction-zone`).

`draw.ts` steht **nicht** auf der Verbotsliste von Bedingung 1 (dort stehen
`src/lib/`, `supabase/`, `card-state.ts`, `verlauf.ts`, `consequence.ts`,
`liquidity.ts`, `ring-subline.ts` und Server-Actions). Es ist auch keine
Rechenlogik, sondern Zeichencode. Aber Schritt 5 nennt ausdrücklich nur die drei
CSS-Module, und Bedingung 2 verbietet „Umbau".

**Deine Entscheidung:** ① fünf Zahlen in `draw.ts` ändern — Schriftgrößen 8 → 11,
aktiver Monat auf Weiß, Gold auf .75, Schriftstapel aus dem Token. Keine
Rechnung, keine neue Datei, kein Umbau. ② draußen lassen und als eigenen Punkt
in die Roadmap. *Ich empfehle ①*: Die Monatsnamen unter der Welle sind die am
häufigsten gesehene 8-px-Schrift der App, und Regel 4 („nichts unter 11 px")
ist die einzige der sieben, die ohne sie unerfüllt bleibt.

### ❓ F4 · `.flankSubOpen` braucht eine Prop, die Bedingung 2 ausschließt

Die Übergabe verlangt: *„`.flankSub` … bei offenen Fragmenten
`--text-secondary` — dafür in `index.tsx` eine Klasse an `safeCount > 0` hängen
(reiner Klassenname)."*

Das geht nicht ohne neue Prop. `safeCount` wird in der Elternkomponente
berechnet (`index.tsx:84`); die Zeile rendert die Kindkomponente `Flank`, die
`sublabel` als **fertigen String** bekommt und weder die Zahl noch die Seite
kennt. Ein Klassenname allein reicht nicht — es müsste ein Wahrheitswert
hindurch. **Bedingung 2 schließt neue Props aus.**

Die CSS-Klasse `.flankSubOpen` ist angelegt und **unbenutzt**.

**Deine Entscheidung:** ① eine Boolean-Prop an `Flank` erlauben (eine Zeile in
der Typdefinition, eine im Aufruf, eine im Klassennamen), ② so lassen — der
Untertitel des Vormonats bleibt tertiär, auch wenn dort Arbeit wartet.
*Ich empfehle ①*, aber das ist die kleinste der offenen Fragen: Es geht um eine
Textstufe auf einer Zeile.

### Befunde

**B18 · `--ring-track` lag lokal und hätte die Änderung geschluckt.**
`singularity-ring.module.css` definierte es selbst mit `0.05` und überschattete
damit das gleichnamige globale Token. Die v3-Anhebung auf `0.06` — „die Spur
soll als Rahmen sichtbar sein, nicht erraten werden" — wäre nicht angekommen.
Angekündigt in B6 (Schritt 1), jetzt erledigt.

**B19 · Ein sechster Farbton, den die Palette nicht kennt.**
`--wave-tt-driver-tag: rgba(255, 170, 90, 0.7)` — ein **Orange**, an genau einer
Stelle im ganzen Produkt (das Treiber-Etikett im Wellen-Fensterchen). Weder in
§3 noch in der v3-Palette. Ersatzlos auf die Tertiärstufe gezogen: Das Etikett
benennt den Treiber, es bewertet ihn nicht.

**B20 · Zwölf weitere lokale Farbwerte im Header, drei im Ring, sieben in der
Welle.** Damit sind es in diesem Sprint **82** komponenten-lokale Farbwerte, die
eine Token-Änderung nicht durchgelassen hätten.

**B21 · Der Held des Wellen-Popups behält den Ring-Schnitt — anders als der des
Verlaufs.** Beide Overlays haben dieselbe Anatomie, und in Schritt 3 ist der
Verlaufs-Held von 38/200 auf 26/600 gegangen. Hier bleibt es beim Ring-Schnitt
(36/300), weil der Held eine **Zahl** ist: Dünn-und-groß trägt bei Ziffern und
scheitert bei einem Wort. Gleiche Anatomie, andere Schrift, weil der Inhalt ein
anderer ist — steht so auf `komponenten/welle.html`.

---

## Schritte 6, 7 und 8

### B22 · Der Gutter der Vorjahreslinie war schon vorher zu klein

Beim Anheben des Gold-Betrags von 9 auf 11 px habe ich die reservierte Breite
nachgemessen, statt sie zu schätzen (LL-31). Verfügbar sind 50 px:

| Betrag | 9 px | 11 px |
|---|---|---|
| `48.445 €` | 42,4 | **50,6** |
| `+48.445 €` | 48,4 | **57,9** |
| `−123.456 €` | **52,5** | **62,7** |

Bei 11 px passt **kein** realistischer Wert — und bei 9 px passte der
sechsstellige **schon vorher nicht**. Der Gutter war zu klein, bevor dieser
Sprint ihn angefasst hat; die Schriftvergrößerung hat es nur sichtbar gemacht.
`POP_PAD_R` 58 → 74 px.

Die Pixel-Checks blieben grün, weil sie die Geometrie aus den exportierten
Konstanten **nachrechnen** statt sie zu kopieren — genau dafür sind sie
exportiert. Ein seltener Fall, in dem eine alte Entscheidung eine spätere
Änderung trägt, ohne dass jemand daran denken musste.

### B23 · Schritt 8 hat keine Grundlage — es gibt keine Referenzbilder

Der Auftrag sagt: *„`tests/e2e/visual-pixel.spec.ts` — neue Referenzbilder
ziehen"*, und die Übergabe kündigt an, der Pixel-Test werde nach dem Tausch
neue Bilder brauchen.

**Gemessen: `toMatchSnapshot` und `toHaveScreenshot` kommen im Test null Mal
vor, und im Repo liegt kein einziges Schnappschuss-Bild.** Der Test
transpiliert `draw.ts`, rendert es auf einer leeren Seite und **zählt Pixel**,
die er über die Token-Farben Türkis und Rot klassifiziert.

Beide Farben sind in v3 unverändert — deshalb ist der Test durch den ganzen
Sprint grün geblieben, auch durch den Eingriff in `draw.ts`. **Es gibt nichts
nachzuziehen.** Die Annahme der Übergabe beschreibt eine Testbauart, die dieses
Projekt nicht verwendet.

### B24 · Der Regler ist die einzige Stelle, an der v3 ein natives Element ersetzt

`accent-color` überlässt dem Browser die Form: In Safari ist der Griff 20 px, in
Chrome ein anderer, in Firefox eckig. Für einen Wert, den man auf 100 € genau
einstellen soll, ist das zu zufällig. Track 4 px, Griff 28 px — auf jedem Gerät
dasselbe. Der Grund ist Präzision, nicht Optik; das steht so auf der v3-Seite
und ist die einzige Ausnahme im ganzen System.

### B25 · Drei Dinge im Einkommens-Popup sind nicht mehr türkis

„Manuell angepasst", der Vererbungs-Hinweis („Gilt ab …") und der Rand des
Netto-Felds bei Handeingabe trugen Türkis. Keines davon ist „erledigt" oder
„positiv" — es sind **Sachhinweise**. Türkis bleibt im Popup für genau zwei
Dinge: die ausgewählte Steuerklasse (Auswahl) und den Übernehmen-Knopf (die
eine richtige Aktion).

Gold bleibt für „Vergangener Monat" — das ist ein Hinweis auf **Zeit**, wie die
Vorjahreslinie und die Ausreißer-Zeile, kein Fehler. Nur ohne Rahmen.
