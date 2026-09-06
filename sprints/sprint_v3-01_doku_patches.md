# Sprint v3-01 — Doku-Patches (Design-Doku)

> Verfahren nach **§7 Regel 14 / LL-16**: Anker + Patch-Satz je Stelle, danach
> angewendet durch den Subagenten `docs-maintainer`. Die Bibel wird nie direkt
> editiert.
>
> **Teil 1 (dieser Patch, VOR dem Code):** §3 Tokens, §8 Fragment-Invariante,
> §11 Tabelle „Drag-Verhalten". Diese drei sind **normativ** — sie definieren
> oder verbieten, was der Code in den Schritten 3 und 4 tun soll. Sie müssen
> deshalb vorher stehen (Auftrag, Bedingung 5).
>
> **Teil 2 (am Sprint-Ende, eigener Patch):** §5 Ring, §6 Header, §7 Karten,
> §9 Welle, §10 Einkommen, §11 Schaufenster, §12 Copy. Das sind **beschreibende**
> Spezifikationen; ihre Werte stehen erst fest, wenn die Module gebaut und
> gemessen sind. Sie werden über `sprint-abschluss` Schritt 6 nachgezogen.
>
> **Version:** 3.13.1 → **3.14.0**. Minor-Bump, nicht Patch-Bump — §8 **hebt eine
> bestehende Invariante auf** und ersetzt ihren Mechanismus. Präzedenzfall:
> v3.3.0, ebenfalls Minor wegen einer aufgehobenen §8-Regel.

---

## Patch 1 · Kopfzeile (Version)

**Anker (Zeile 3):**

```
**Version:** 3.13.1 (V2 · Sprint v2-31 — Karten und Ordner haben einen Verlauf)
```

**Patch-Satz:**

```
**Version:** 3.14.0 (V3 · Sprint v3-01 — Apple-Redesign: Tokens und Fragment-Invariante)
```

---

## Patch 2 · Changelog-Eintrag (direkt VOR dem Block „Changelog v3.13.1")

**Anker:**

```
> **Changelog v3.13.1 (03.09.2026, Sprint v2-31 · Nachtrag aus der Anschauung):**
```

**Patch-Satz — davor einfügen, mit einer Leerzeile Abstand:**

```
> **Changelog v3.14.0 (06.09.2026, Sprint v3-01 · Apple-Redesign, Teil 1 von 2):**
> **§3 vollständig ersetzt** und um einen Light-Mode-Block erweitert; **§8 hebt die
> Deckkraft-Invariante auf**; **§11** (Tabelle „Drag-Verhalten") mitgezogen, weil
> dort dieselbe Invariante ein zweites Mal stand.
>
> Grundlage ist das Design-System **v3**, entschieden am 05.09.2026 und im Repo
> unter `design-system/v3/` — `uebergabe.html` trägt die Zuordnung alt → neu,
> `00-was-aendert-sich.html` die sieben Regeln mit Vorher/Nachher je Regel.
>
> **Die fünf Grundtöne sind unverändert** (`#0D0D0F`, `#3ECFAF`, `#FF453A`, Gold,
> Blau). Geändert ist ihre **Zuweisung**: Rot bedeutet ab jetzt ausschließlich
> *Abweichung* — „Offen", „Laufend" und „Erwartet" sind neutral. Der Grund steht in
> Regel 2: Eine Stromrechnung, die am 1. abgebucht wird, ist am 28. des Vormonats
> offen; das ist der Normalzustand von rund 80 % aller Karten an 80 % aller Tage und
> trug bis hierhin dieselbe Farbe wie „Budget überschritten".
>
> **§8 · Was genau aufgehoben ist.** Die Werte `0.22` (zugeordnet) und `0.45`
> (Übertrag) waren als Invariante festgeschrieben, damit sie sich gegen
> versehentliche Änderung wehren (`RM-2`, v2-16). Aufgehoben ist der **Mechanismus**,
> nicht die **Aussage**: Zugeordnet bleibt die leiseste Stufe, Übertrag die mittlere,
> arbeitsfähig die volle. Sie läuft jetzt über **Fläche und Textstufe** statt über
> `opacity` auf dem Container. Der Grund ist Regel 3 — eine Container-Deckkraft
> multipliziert sich mit jeder Deckkraft darin und macht Kontraste unberechenbar; bei
> `0.22` × einer bereits gedimmten Textfarbe landet man unter jeder Lesbarkeitsgrenze.
> Weil eine Kontur allein nicht sagt, *warum* ein Fragment leise ist, tritt das Wort
> `· zugeordnet` an die Beschreibung (§12 in Teil 2).
>
> **Was NICHT geändert ist:** alle Statuswörter, alle Menüeinträge, alle Toast-Texte,
> die Daten-Invariante („klickbar ≠ ziehbar ≠ verlinkbar"), die Drag-Sperre, das
> TRANSFER-Badge, die Status-Hierarchie aus Sprint 9, die Sortierregel, der
> Monats-Scope und jede Rechenregel aus §4.
>
> **Teil 2 folgt am Sprint-Ende** und zieht §5, §6, §7, §9, §10, §11 und §12 nach —
> beschreibende Spezifikationen, deren Werte erst nach dem Bau gemessen sind.
> Solange Teil 2 aussteht, nennen diese Abschnitte Deckkraft- und Schriftwerte, die
> der Code nicht mehr trägt. **Im Zweifel gilt bis dahin `design-system/v3/`.**
```

---

## Patch 3 · §3 — Farben-Tabelle vollständig ersetzen

**Anker (Beginn):** die Zeile

```
| Token | Wert | Verwendung |
```

unmittelbar unter der Überschrift `### Farben` (§3), **bis einschließlich** des
Absatzes, der mit

```
> **Die Kategorie-Tokens bringen KEINE neue Farbe**
```

beginnt und mit

```
> (offen / erledigt), also in exakt ihrer bisherigen Bedeutung.
```

endet.

**Patch-Satz — der gesamte Block wird ersetzt durch:**

```
Quelle im Code: `src/styles/tokens.css`. Die Werte stammen aus
`design-system/styles.css` (v3); die Herleitung je Regel steht in
`design-system/v3/00-was-aendert-sich.html`.

**Der Grundsatz der schmalen Palette gilt unverändert — v3 fügt keinen neuen
Farbton hinzu.** Was sich geändert hat, ist die Zuweisung und die Zahl der
Abstufungen: Text kennt ab jetzt genau **vier** Stufen (100 / 60 / 30 / 18 %)
statt der siebzehn frei gewählten Alpha-Werte, die sich bis v2-31 angesammelt
hatten. Jeder einzelne war begründet; zusammen ergaben sie keine Ordnung.

### Farben — Dark (Standard)

| Token | Wert | Verwendung |
|---|---|---|
| `--bg-primary` | `#0D0D0F` | App-Hintergrund |
| `--bg-card` | `#1C1C1E` | **Alle** Karten, **alle** Zustände — eine Fläche |
| `--bg-card-hover` | `#2C2C2E` | Karten-Hover (ersetzt die Deckkraft-Änderung) |
| `--bg-card-ghost` | `transparent` | Forecast — Kontur statt Fläche |
| `--bg-elevated` | `#1C1C1E` | Popups, Kontextmenü, Toast, Verlaufs-Overlay |
| `--color-teal` | `#3ECFAF` | Erledigt / positiv: bezahlt, erhalten, abgeschlossen, Sparrate über Plan, realisierte Welle, Auswahl |
| `--color-red` | `#FF453A` | **Nur Abweichung**: überschritten, Defizit im Ring, Welle unter Null, Fehler, destruktive Aktion |
| `--color-gold` | `rgba(255,200,60,.75)` | Vorjahres-Referenz, Ereignisse, Zeit-Hinweise |
| `--color-blue-dot` | `rgba(100,168,240,.7)` | Gemeinsam-Attribution |
| `--teal-fill` | `rgba(62,207,175,.16)` | Türkise Fläche: Auswahl, Fokus-Schein, Pille „Abgeschlossen" |
| `--red-fill` | `rgba(255,69,58,.16)` | Rote Fläche: Portal-Fehler |
| `--neutral-fill` | `rgba(235,235,245,.10)` | Neutrale Fläche: Eingabefelder, Knöpfe, Chevron-Kreise, Badges |
| `--text-primary` | `#FFFFFF` | Kartenname, erledigte Beträge, Menüeinträge, Ring |
| `--text-secondary` | `rgba(235,235,245,.60)` | Offene Beträge, Statuswort neutral, Fließtext |
| `--text-tertiary` | `rgba(235,235,245,.30)` | Labels, Termin, Meta, Achsen |
| `--text-quaternary` | `rgba(235,235,245,.18)` | Nur Forecast-Punkt und Trennlinien — **nie für Text** |
| `--text-muted` / `--text-ghost` | Alias auf `--text-secondary` / `--text-tertiary` | Übergang: die Bildschirme außerhalb des Dashboards (Login, Onboarding, Fehlerseite) lesen weiter die alten Namen und erben darüber die neuen Stufen |
| `--border-subtle` | `rgba(255,255,255,.08)` | **Ein** Rand für alle Karten — Zustandsränder entfallen |
| `--border-ghost` | `rgba(255,255,255,.14)` | Kontur für alles, was es noch nicht gibt: Forecast, Portal, Leer-Slot, Klammer |
| `--outline-drop` | `rgba(255,255,255,.35)` | Drop-Target-Outline (Sprint 5, K1.3) |
| `--bg-category` | `#1A1A20` | Grundton der Ordner-Kachel §8 — eine Spur kühler und dunkler als `--bg-card` |
| `--bg-category-stack` | `#131317` | Gestapelte Kanten unter der Ordner-Kachel |
| `--border-category` | `rgba(255,255,255,.13)` | Rahmen der Ordner-Kachel |
| `--border-category-stack` | `rgba(255,255,255,.09)` | Rahmen der zweiten Stapelkante |
| `--border-bracket` | `rgba(255,255,255,.14)` | Klammer unter einem aufgeklappten Ordner §8 |
| `--progress-track` | `rgba(255,255,255,.06)` | Spur des Budget-Balkens |
| `--progress-neutral` | `rgba(235,235,245,.35)` | Balken im Zustand „Laufend" — Verbrauch ist Information, kein Urteil |
| `--ring-track` | `rgba(255,255,255,.06)` | Spur des Singularity Rings §5 (lag bis v3-01 lokal im Modul) |
| `--wave-forecast` | `#8A8A90` | Prognose-Anteil der Jahres-Welle §9 |
| `--radius-card` | `16px` | Karte, Ordner-Kachel, Portal, Leer-Slot |
| `--radius-control` | `10px` | Eingabefeld, Knopf, Auswahlkachel |
| `--radius-popup` | `18px` | Verlaufs-Overlay |
| `--wave-opacity` | `0.80` | Jahres-Welle (§9), festgelegter Produktionswert |
| `--badge-hue-1` … `--badge-hue-6` | Gold `255,200,60` · Orange `255,150,90` · Oliv `170,200,110` · Blau `100,168,240` · Violett `170,130,255` · Magenta `240,120,190` | KI-Vorschlag-Badge §11 (A1) — der Kartenname wählt den Ton deterministisch. **Liegt weiter hinter `SHOW_SUGGESTION_BADGES = false`;** v3 nimmt die Töne nicht in die Palette auf, weil eine Farbe, die nirgends erscheint, nicht ins Design-System gehört. |

### Farben — Light

**Vorbereitet, aber nicht erreichbar:** v3-01 baut keinen Umschalter. Die Werte
stehen in `tokens.css` als `[data-theme="light"]`-Block, damit sie beim späteren
Einbau nicht neu erfunden werden.

**Gleiche Tokennamen, gleiche Prozentstufen** — deshalb bleibt die Hierarchie
identisch. Türkis und Rot bekommen eine dunklere Stufe **desselben** Farbtons:
`#3ECFAF` auf Weiß hätte nur 1,9 : 1 Kontrast. Ein Token ist ein Name für eine
**Rolle**, nicht für einen Hex-Wert.

| Token | Light-Wert | Anmerkung |
|---|---|---|
| `--bg-primary` | `#F2F2F7` | leicht kühl, damit weiße Karten sich abheben |
| `--bg-card` / `--bg-elevated` | `#FFFFFF` | Rand 6 % Schwarz, kein Schatten |
| `--bg-card-hover` | `#FFFFFF` | im Light Mode trägt der 2-px-Lift allein |
| `--color-teal` | `#1FA588` | gleicher Farbton, dunkler — 4,5 : 1 auf Weiß |
| `--color-red` | `#E0362C` | gleicher Farbton, dunkler — 4,6 : 1 auf Weiß |
| `--color-gold` | `rgba(190,140,0,.9)` | helles Gelb verschwindet auf Weiß |
| `--color-blue-dot` | `rgba(40,120,220,.8)` | gesättigter, damit der 6-px-Punkt sichtbar bleibt |
| `--text-primary` … `--text-quaternary` | `#000000` · `rgba(60,60,67,.60)` · `.30` · `.18` | Apples label-Stufen |
| `--border-subtle` / `--border-ghost` | `rgba(0,0,0,.06)` / `rgba(0,0,0,.16)` | |
| `--teal-fill` / `--red-fill` / `--neutral-fill` | `rgba(31,165,136,.14)` · `rgba(224,54,44,.12)` · `rgba(60,60,67,.08)` | |
| `--bg-category` / `--bg-category-stack` | `#F7F7FB` / `#ECECF2` | |
| `--progress-track` / `--progress-neutral` / `--ring-track` | `rgba(0,0,0,.06)` · `rgba(60,60,67,.35)` · `rgba(0,0,0,.06)` | |
| `--wave-forecast` | `#A0A0A8` | |

> **Die Liste der Tokens OHNE Light-Wert ist die Prüfbedingung für den späteren
> Umschalter.** Sie enthält heute die Übergangs-Tokens aus v3-01
> (`--bg-card-open/-paid/-over`, `--border-teal`, `--border-red`,
> `--border-category-open/-done`, `--text-category-flag`, `--border-bracket-open`)
> und `--fragment-hue`. Alle verschwinden mit den Schritten 3 und 4 dieses Sprints;
> ein Light-Wert dafür wäre eine Zahl für etwas, das es dann nicht mehr gibt. **Wer
> den Umschalter baut, prüft zuerst, dass diese Liste leer ist.**

> **Was in v3 ERSATZLOS entfällt.** `--bg-card-open`, `--bg-card-paid`,
> `--bg-card-over` — der Zustand färbt keine Fläche mehr, er sitzt im Statuspunkt
> und im Statuswort. `--border-teal`, `--border-red` — es gibt keinen Zustandsrand.
> `--border-category-open`, `--border-category-done`, `--text-category-flag`,
> `--border-bracket-open` — die Ordner-Kachel trägt ihren Zustand als **Wort**
> (Beschluss vom 05.09.2026, Variante A), die Klammer ist neutral.
> `--fragment-hue` — die Fragment-Abstufung läuft über Fläche und Textstufe (§8).
```

---

## Patch 4 · §3 — Typographie-Tabelle ersetzen

**Anker:** der Block unter `### Typographie`, von

```
| Element | Font-Size | Font-Weight | Letter-Spacing |
```

bis einschließlich

```
| Alle Zahlen | — | — | `font-variant-numeric: tabular-nums` |
```

**Patch-Satz:**

```
**Untergrenze 11 px.** Darunter greift die Rendering-Engine zu Hinting-Tricks, die
Buchstaben verschwimmen lassen; auf Retina fehlen bei 9 px schlicht die Pixel für
eine saubere Rundung. Größe, Gewicht und Laufweite sind ein **Dreieck** — wer eines
ändert, zieht die anderen beiden nach. Dünne Schnitte tragen groß (Ring, 36 px),
nicht klein (Betrag, 22 px): Strichstärke wächst nicht mit der Schriftgröße mit.

| Element | Font-Size | Font-Weight | Letter-Spacing |
|---|---|---|---|
| Primärzahl (Ring) | `36px` | `300` | `-1.4px` |
| Aktiver Monat (Header) | `17px` | `600` | `-0.4px` |
| Kartenname | `14px` | `500` | `-0.2px` |
| Kartenbetrag | `22px` | `400` | `-0.6px` |
| Flanken-Monat | `13px` | `500` | `-0.2px` |
| Label — Typ, Ring-Unterschrift, Zonen-Kopf | `11px` | `600` | `0.5px` · **Versalien** |
| Meta — Status, Termin, Zusatzzeile | `11px` | `500` | `0` · **keine Versalien** |
| Hinweise, Fließtext im Popup | `12–13px` | `400` | `0` |
| Titel eines Popups | `17px` | `600` | `-0.3px` |
| Alle Zahlen | — | — | `font-variant-numeric: tabular-nums` |

**Schriftstapel:** `-apple-system, BlinkMacSystemFont, system-ui, "Helvetica Neue",
sans-serif`. SF Pro steht bewusst **vorn** — auf Apple-Geräten *ist* SF Pro die
Apple-Ästhetik; `system-ui` hätte sie zwar meist ebenfalls geliefert, aber nicht
verlässlich.

> **Warum das Statuswort keine Versalien mehr trägt.** „BEZAHLT" in 9 px mit 0,6 px
> Sperrung ist ein Etikett, „Bezahlt" in 11 px ein Wort. Versalien lesen sich um
> etwa 10 % langsamer, weil die Wortform verlorengeht — alle Buchstaben sind gleich
> hoch. Für ein **Typ**-Label (`FIXKOSTEN`), das man nicht liest, sondern erkennt,
> ist das in Ordnung; für den **Zustand**, den man wirklich lesen muss, nicht.
> Deshalb behält die Zeile „Label" ihre Versalien und die Zeile „Meta" verliert sie.
```

---

## Patch 5 · §8 — „Zugeordnete Fragmente"

**Anker:**

```
- Zugeordnete Fragmente: `opacity: 0.22` · ~~`pointer-events: none`~~ — **aufgehoben (06.08.2026, `RM-2`; gebaut v2-16)**, siehe „Klickbarkeit des Stacks" unten. Die Deckkraft bleibt unverändert — auch im Hover.
```

**Patch-Satz:**

```
- Zugeordnete Fragmente: **keine Fläche** — Kontur (`--border-ghost`) und Tertiärtext, dazu das Wort `· zugeordnet` hinter der Beschreibung. ~~`opacity: 0.22`~~ — **abgelöst in v3-01 (06.09.2026)**, siehe „Die drei Stufen" unten. ~~`pointer-events: none`~~ — **aufgehoben (06.08.2026, `RM-2`; gebaut v2-16)**, siehe „Klickbarkeit des Stacks" unten. Die Stufe bleibt auch im Hover unverändert; der Hover ändert ausschließlich den Cursor.
```

---

## Patch 6 · §8 — Status `INTERNAL_TRANSFER`

**Anker (Beginn des Aufzählungspunkts):**

```
- **Status `INTERNAL_TRANSFER` (Sprint 9):** Ein Fragment mit Status `INTERNAL_TRANSFER` rendert gedimmt (Opacity 0.45 — heller als ein zugeordnetes Fragment) mit einem Badge „TRANSFER" in neutralem Grau-Soft
```

**Patch-Satz — nur dieser Satzanfang wird ersetzt, der Rest des Punkts bleibt Wort für Wort stehen:**

```
- **Status `INTERNAL_TRANSFER` (Sprint 9):** Ein Fragment mit Status `INTERNAL_TRANSFER` rendert auf **voller Fläche mit Sekundärtext** — die mittlere der drei Stufen, lauter als ein zugeordnetes und leiser als ein arbeitsfähiges Fragment (bis v3-01: `Opacity 0.45`) — mit einem Badge „TRANSFER" in neutralem Grau-Soft
```

---

## Patch 7 · §8 — Invarianten des Übertrags-Schalters

**Anker:**

```
Ebenso unberührt: die Darstellung eines sichtbaren Übertrags (Opacity `0.45`, Badge „TRANSFER", kein Drag/Tap)
```

**Patch-Satz:**

```
Ebenso unberührt: die Darstellung eines sichtbaren Übertrags (mittlere Stufe — volle Fläche, Sekundärtext; Badge „TRANSFER"; kein Drag/Tap)
```

---

## Patch 8 · §8 — Grundton-Vereinheitlichung (N5)

**Anker (vollständiger Aufzählungspunkt):**

```
- **Grundton-Vereinheitlichung (N5):** Alle Rohmasse-Fragmente teilen **einen gemeinsamen Grau-Grundton-Token** (zugeordnet *und* `INTERNAL_TRANSFER`). Die Unterscheidung läuft ausschließlich über **Opacity** (zugeordnet `0.22` / Transfer `0.45`) **+ das „TRANSFER"-Badge** (Grau-Soft). Kein separater Hue je Zustand — das behebt zwei leicht abweichende Grau-Töne nebeneinander. Der Yellow-Soft (KI-Vorschlag-Badge) bleibt für Transfer ausgeschlossen (AD5): Transfer ist Fakt, kein Vorschlag.
```

**Patch-Satz:**

```
- **Die drei Stufen (N5, Mechanismus abgelöst in v3-01):** Alle Rohmasse-Fragmente teilen **eine** Fläche und **eine** Rahmenfarbe; es gibt keinen eigenen Farbton je Zustand — das war schon der Kern von N5 und behebt zwei leicht abweichende Grau-Töne nebeneinander. Die Unterscheidung läuft über **Fläche und Textstufe**:

  | Stufe | Fläche | Text | Zusätzlich |
  |---|---|---|---|
  | **Arbeitsfähig** | `--bg-card` | Betrag primär, Beschreibung sekundär | ziehbar |
  | **Übertrag** | `--bg-card` | sekundär | Badge „TRANSFER" (Grau-Soft), nicht ziehbar |
  | **Zugeordnet** | keine — Kontur `--border-ghost` | tertiär | Wort `· zugeordnet`, nicht ziehbar |

  **Diese drei Stufen sind invariant; ihre Mittel sind Fläche und Textstufe, nicht Deckkraft.** Die bis v3-01 gültigen Werte `0.22` (zugeordnet) und `0.45` (Übertrag) waren genau dieselbe Aussage mit einem anderen Mittel — **abgelöst, nicht aufgeweicht**. Der Grund ist Regel 3 des v3-Systems: Eine Deckkraft auf dem Container multipliziert sich mit jeder Deckkraft darin. Bei `0.22` × einem ohnehin gedimmten Text landet die Beschreibung unter jeder Lesbarkeitsgrenze; gedimmt wird deshalb am **Text**, nie an der **Box**. Das Wort `· zugeordnet` tritt hinzu, weil eine Kontur allein nicht sagt, *warum* das Fragment leise ist.

  Der Yellow-Soft (KI-Vorschlag-Badge) bleibt für Transfer ausgeschlossen (AD5): Transfer ist Fakt, kein Vorschlag.
```

---

## Patch 9 · §8 — „Klickbarkeit des Stacks", Aufzählungspunkt „Deckkraft-Werte"

**Anker (der Punkt und sein Unterpunkt, zusammenhängend):**

```
  - Die **Deckkraft-Werte** `0.22` (zugeordnet) und `0.45` (Übertrag) sowie das TRANSFER-Badge und die Status-Hierarchie aus Sprint 9.
```

**Patch-Satz:**

```
  - Die **drei Stufen** (arbeitsfähig / Übertrag / zugeordnet) sowie das TRANSFER-Badge und die Status-Hierarchie aus Sprint 9. *(Bis v3-01 waren die Stufen als Deckkraft `0.22` und `0.45` festgeschrieben; der Mechanismus ist abgelöst, die Rangfolge nicht — siehe „Die drei Stufen" oben.)*
```

---

## Patch 10 · §8 — Hover-Rückmeldung

**Anker:**

```
    `pointer-events: none` und braucht seither eine eigene Regel. Ohne sie spränge die
    Deckkraft beim Überfahren auf `0.92` — die beiden Werte oben wären damit faktisch
    aufgehoben, obwohl sie hier als unberührt festgeschrieben sind. Die einzige neue
    Rückmeldung ist der **Zeiger-Cursor**.
```

**Patch-Satz:**

```
    `pointer-events: none` und braucht seither eine eigene Regel. Ohne sie spränge die
    Darstellung beim Überfahren auf die volle Stufe — die Rangfolge oben wäre damit
    faktisch aufgehoben, obwohl sie hier als unberührt festgeschrieben ist. Die
    einzige neue Rückmeldung ist der **Zeiger-Cursor**. *(Bis v3-01 lautete dieselbe
    Aussage: „spränge die Deckkraft auf `0.92`".)*
```

---

## Patch 11 · §11 — Tabelle „Drag-Verhalten"

> **Warum diese Tabelle in Teil 1 gehört und nicht in Teil 2:** Sie schreibt die
> §8-Invariante ein **zweites Mal** fest. Bliebe sie stehen, widerspräche die Bibel
> sich vom Moment des §8-Patches an selbst — dieselbe Fehlerklasse wie LL-26, nur in
> der Doku statt im Code. Genau dafür gibt es den Präzedenzfall v3.3.0, wo §11 aus
> demselben Grund mitgezogen wurde.

**Anker (vollständige Tabelle):**

```
| Zustand | Wert |
|---|---|
| Default Opacity | `0.72` |
| Hover | `translateY(-1px)`, `opacity: 0.92` |
| Drag-Start | `opacity: 0.35`, `scale(.97)`, cursor: `grabbing` |
| Zugeordnet | `opacity: 0.22` · **kein Drag** · ~~`pointer-events: none`~~ — aufgehoben, siehe unter der Tabelle |
```

**Patch-Satz:**

```
| Zustand | Wert |
|---|---|
| Default | volle Fläche `--bg-card`, Betrag primär — **keine** Container-Deckkraft (bis v3-01: `0.72`) |
| Hover | `translateY(-1px)` — **nur Lift, keine Deckkraft** (bis v3-01: zusätzlich `opacity: 0.92`) |
| Drag-Start | `opacity: 0.35`, `scale(.97)`, cursor: `grabbing` |
| Zugeordnet | keine Fläche — Kontur, Tertiärtext, Wort `· zugeordnet` · **kein Drag** · ~~`pointer-events: none`~~ — aufgehoben, siehe unter der Tabelle (bis v3-01: `opacity: 0.22`) |

> **Die Deckkraft beim Drag-Start bleibt.** Sie ist keine Zustands-Darstellung,
> sondern eine **vorübergehende Rückmeldung während einer Geste** — das Element ist
> für den Bruchteil der Bewegung halb durchsichtig, damit man sieht, was darunter
> liegt. Regel 3 („kein Dimmen ganzer Elemente") zielt auf Zustände, die dauerhaft
> angezeigt werden; sie ist hier nicht verletzt.
```

---

## Patch 12 · §3 — Überschriften-Ebene korrigieren

> **Nachtrag, 06.09.2026.** Fehler in Patch 3, nicht in seiner Anwendung: Der
> Patch-Satz begann mit `### Farben — Dark (Standard)`, obwohl direkt darüber
> bereits `### Farben` steht. Zwei Überschriften derselben Ebene für dieselbe
> Sache; die zweite ist eine Unterteilung der ersten. Angewendet mit demselben
> Verfahren (Anker muss genau einmal vorkommen, sonst Abbruch).

**Anker A:**

```
### Farben — Dark (Standard)
```

**Patch-Satz A:**

```
#### Dark (Standard)
```

**Anker B:**

```
### Farben — Light
```

**Patch-Satz B:**

```
#### Light
```
