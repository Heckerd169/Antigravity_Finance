# Sprint v3-01 — Review

> **Branch** `sprint/v3-01-apple-redesign` (11 Commits, gemergt als PR #55) ·
> **Doku-Nachzug** `sprint/v3-01-abschluss` · **Datum** 05.–06.09.2026
>
> Das Design-System **v3 (Apple-Redesign)** ist umgesetzt: Optik neu, Rechenlogik
> und Datenbank unberührt. Der teuerste Fund war nicht gestalterisch, sondern
> strukturell — **87 komponenten-lokale Farbwerte**, die jede Änderung an
> `tokens.css` abgefangen hätten.

---

## 1. Was gebaut wurde

### P0 · Das v3-Bündel kam ins Repository

Der Auftrag setzte `design-system/v3/` voraus — **den Ordner gab es nicht.** Das
Design-System lag fertig entschieden auf `claude.ai/design`, aber nur dort. 15
Dateien über `DesignSync` heruntergeladen: Übergabe, die sieben Regeln mit
Vorher/Nachher, zwei Foundations- und neun Komponentenseiten, dazu `styles.css`
mit den v3-Tokens.

**Damit sind erstmals alle sieben sichtbaren Komponenten bebildert.** Bisher zeigte
`design-system/` drei — genau der Befund `RD-1`, mit dem Paket 19 eröffnet wurde.

### P1 · `src/styles/tokens.css`

Wertetausch nach der alt→neu-Tabelle. Neu: `--bg-card-hover`, `--bg-elevated`,
`--border-ghost`, `--text-quaternary`, `--neutral-fill`, `--teal-fill`, `--red-fill`,
`--progress-track`, `--progress-neutral`, `--ring-track`, `--wave-forecast`, drei
Radien. Später kam `--on-accent` dazu (siehe §5).

`--text-muted` und `--text-ghost` sind **nicht umbenannt, sondern Alias** auf die
neuen Stufen — sie werden von zehn bzw. acht Dateien gelesen, sechs davon außerhalb
dieses Sprints (Login, Onboarding, Fehlerseite, `page.module.css`, Ring-Bühne,
Einkommens-Marken). Über den Alias erben sie die v3-Werte, ohne angefasst zu werden.

Light-Mode als `[data-theme="light"]`-Block, **nicht erreichbar** — kein Umschalter
in diesem Sprint.

### P2 · Design-Doku §3, §8 und §11

Die normative Vorbedingung, deshalb **vor** dem Code. 3.13.1 → **3.14.0**
(Minor-Bump, weil §8 eine Invariante aufhebt). Elf Patches über
`sprint_v3-01_doku_patches.md`, angewendet durch `docs-maintainer`; Patch 12 als
Nachtrag zur Überschriften-Ebene.

**§11 musste mit**, obwohl der Auftrag nur §3 und §8 nennt: Die Deckkraft-Invariante
stand dort ein zweites Mal. Nur §3 und §8 zu patchen hätte die Bibel ab sofort sich
selbst widersprechen lassen — LL-26 in Doku-Form.

### P3 · `cards.module.css` + `card-action-toast.module.css`

Die Zustandsfarbe verlässt die Fläche. `.card { opacity: .75 }` und
`.ghost { opacity: .65 }` ersatzlos raus; sieben Zustands-Selektoren verlieren
Hintergrund und Rand; `.cardLabel` einfarbig statt in sieben Zweigen; Icons als
leerer Kreis / gefüllt türkis mit weißem Haken / gefüllt rot; Statuswort 9 → 11 px
**ohne Versalien**; Betrag 200 → 400; Balken der laufenden Budget-Karte neutral.

Overlays, Kontextmenü, Toast und Verlaufs-Overlay auf `--bg-elevated`,
Bedienelemente 44 px, Verlaufs-Held 38/200 → 26/600, Achsen 8 → 11 px.

### P3.1 · Der rote Punkt

Nachtrag nach dem ersten Screenshot — siehe §5.

### P4 · `interaction-zone.module.css` + fünf `.tsx`-Stellen

Die drei Stufen der Rohmasse, die Ordner-Kachel nach Beschluss A, Portal und
Leer-Slot als Kontur, Schaufenster, Anlage-Overlay. **38 lokale Farbwerte** auf
Tokens umgestellt.

### P5 · Ring, Header, Welle

Die Pfeile im Header sind immer da (standen auf `opacity: 0`). Die Pille spricht die
Kartensprache. `--ring-track` lag lokal und hätte die Änderung geschluckt. Ein
sechster Farbton entfernt (`--wave-tt-driver-tag`, ein Orange).

### P5.1 · `draw.ts` und der Gutter

Nach Freigabe — siehe §5.

### P6/P7 · Einkommens-Popup

37 Regeln, dazu der eigene Regler mit `--pct`. Drei Dinge sind nicht mehr türkis:
„Manuell angepasst", der Vererbungs-Hinweis und der Rand des Netto-Felds. Keines
davon ist „erledigt" — es sind Sachhinweise.

### P8 · Entfallen

Der Auftrag verlangt neue Referenzbilder für `visual-pixel.spec.ts`. **Gemessen:
`toMatchSnapshot` und `toHaveScreenshot` kommen dort null Mal vor**, im Repo liegt
kein Schnappschuss. Der Test transpiliert `draw.ts`, rendert auf einer leeren Seite
und **zählt Pixel**, klassifiziert über Türkis und Rot — beide in v3 unverändert.
Es gab nichts nachzuziehen.

---

## 2. Prüfstrecke

| | Ergebnis |
|---|---|
| `tsc --noEmit` | **0 Fehler** |
| ESLint (Worktree-Aufruf) | **0 Fehler / 0 Warnungen** |
| `pnpm build` | **0 Fehler** · Route `/` **40,6 kB** · First Load JS **193 kB** · Middleware **82,1 kB** |
| `pnpm test:visual` | **191 / 191** |
| `pnpm test:e2e` | **200 / 200** — inkl. aller **6** Render-Smoke-Tests |

**Gegen das letzte Review (v2-32: visual 183, e2e 192, Route `/` 40,3 kB):** beide
Zahlen sind um **genau 8** gestiegen — die acht Wächter, die dieser Sprint selbst
geschrieben hat (4 × `karten-zustandsfarbe`, 4 × `rohmasse-stufen`). Keine ist
gesunken. Das Bundle wächst um 0,3 kB.

Beide neuen Dateien sind in `playwright.config.ts` unter `testMatch` eingetragen —
sonst wären sie stumm liegen geblieben.

---

## 3. Anker vorher/nachher

**Kein Zahlenwert bewegt — und das ist das vollständige Ergebnis.**

Der Sprint hat **keine** Rechenfunktion, **keine** RPC, **keine** Migration und
**keine** Server-Action berührt. `src/lib/`, `supabase/`, `card-state.ts`,
`verlauf.ts`, `consequence.ts`, `liquidity.ts` und `ring-subline.ts` sind
unangetastet; der Diff besteht aus CSS, sechs Klassennamen-Stellen, zwei
SVG-Tauschen, einer Boolean-Prop und fünf Zahlen in `draw.ts`.

Eine Anker-Messung nach `db-eingriff` war deshalb **nicht** erforderlich. Der
Nachweis führt über die Prüfstrecke: Die 200 E2E-Tests decken Sparrate, Ring-Unterzeile,
Liquidität, Konsequenz-Anzeige, Treiber und Zuordnung ab und rechnen dieselben Werte
wie vorher.

> **Eine Ausnahme, die keine ist:** `POP_PAD_R` ist von 58 auf 74 px gewachsen. Das
> ist eine **Zeichenfläche**, kein Rechenwert — die Pixel-Checks lesen die Konstante
> aus dem Export und rechnen ihre Geometrie neu.

---

## 4. Selbst-Review gegen die Bedingungen des Auftrags

| | Bedingung | erfüllt | Beleg |
|---|---|---|---|
| A1 | Keine Rechenlogik | ✅ | `git diff --stat origin/main~11..HEAD` berührt keine der sieben genannten Dateien, kein `supabase/`, kein `src/lib/` |
| A2 | In `.tsx` nur Klassennamen | ⚠️ **erweitert, freigegeben** | Vier vorgesehene Stellen gesetzt. Dazu **freigegeben am 06.09.**: zwei SVG-Tausche (`category-tile.tsx:149`, `verlauf-overlay.tsx:127`) und eine Boolean-Prop (`header-timeline/index.tsx`). Begründung je Stelle in `sprint_v3-01_rueckfragen.md` F1/F4 |
| A3 | Grundtöne unverändert | ✅ | `#0D0D0F`, `#3ECFAF`, `#FF453A`, Gold, Blau unverändert in `tokens.css`; Light-Stufen 1:1 aus `design-system/styles.css` |
| A4 | Alle Wortlaute bleiben | ✅ | 200 E2E grün, darunter alle Wortlaut-Wächter. **Eine Ergänzung:** „· zugeordnet" — vom Auftrag unter A2 ausdrücklich vorgesehen |
| A5 | Design-Doku vor Code | ✅ | §3/§8/§11 als P2 vor P3; Doku 3.14.0. §5, §6, §7, §9, §10, §12 folgen in Teil 2 (siehe §6) |
| A6 | Jeder Schritt einzeln baubar | ✅ | `pnpm build` nach jedem der elf Commits grün |
| A7 | Screenshot nach Schritt 3 | ✅ | `screenshots/2026-09-06_v3-01-schritt3/` — und er hat einen Fehler gefunden (§5) |

---

## 5. Architektur-Entscheidungen

### 5.1 · Die teuerste Klasse des Sprints: 87 lokale Farbwerte

| Fundort | Anzahl | Beispiel |
|---|---|---|
| `cards.module.css` | 18 | `--meta-dot-gem: rgba(100,168,240,.38)` |
| `card.tsx` (SVG-Attribute) | 4 | `fill="rgba(255,69,58,.55)"` |
| `interaction-zone.module.css` | 38 | `--frag-bg: #141416` |
| `header-timeline` · Ring · Welle | 22 | `--ring-track: rgba(255,255,255,.05)` |
| `income-labels.module.css` | 5 | `border-color: rgba(255,255,255,.4)` |

Jeder einzelne war zu seiner Zeit begründet — das etablierte
„Sprint-2-Ring-Pattern": komponenten-lokale Custom-Properties am Wurzelelement.
**Zusammen bildeten sie eine Schicht, die jede Token-Änderung abfing.**

`--meta-dot-gem` ist der klarste Fall: eine wortgleiche Kopie von
`--color-blue-dot` mit dem alten Wert `.38`. Die Übergabe hebt das Token auf `.7`
mit der Begründung „ein 6-px-Punkt braucht Deckkraft" — **ohne diesen Fund wäre die
Änderung im Diff sichtbar und im Bild unsichtbar geblieben.**

Nach dem Sprint tragen die fünf Module **null** rohe Farbwerte. Übrig bleiben drei
bewusste Ausnahmen: die Verlaufs-Kaschierung hinter dem Ring (`.ringGlass`, ein
Schwarz-Verlauf wie ein Schatten) und die Dev-Leiste.

### 5.2 · `--on-accent` statt `#fff`

Was **auf** einer gefüllten Türkis- oder Rot-Fläche liegt — Haken, Ausrufezeichen,
Schrift im gefüllten Knopf, Regler-Griff — muss in **beiden** Erscheinungen weiß
sein. `--text-primary` wäre im Light Mode schwarz auf Türkis. Die v3-Seiten schreiben
`#fff` direkt; §7 Regel 4 verbietet Hex-Codes inline. Also ein Token.

### 5.3 · Präsentations-Attribute schlagen — das hat vier `.tsx`-Änderungen erspart

Die SVG in `card.tsx`, im Portal und im Header tragen ihre Farbe und Strichstärke als
**Präsentations-Attribut** (`stroke="rgba(...)"`, `strokeWidth="1.4"`). Solche
Attribute haben die **niedrigste Priorität aller Autoren-Stile** — jede CSS-Regel
schlägt sie. Der weiße Haken, das weiße Ausrufezeichen, der 1,6-px-Chevron und das
Ausblenden der vier „noch nicht"-Glyphen laufen deshalb vollständig über CSS.

### 5.4 · Zwei Fehler, die nur das Bild gefunden hat

**Beide Male war die Prüfstrecke vollständig grün.**

**① Der rote Punkt (P3.1).** Der Statuspunkt war korrekt umgebaut — aber *innerhalb*
des Rings steckte ein zweites SVG. `IconOpenCircle` zeichnete einen Kreis mit
`fill="rgba(255,69,58,.55)"`, exakt `--color-red`. Er wird für **jede** offene
Fixkosten-Karte und **jede** laufende Budget-Karte gerendert. Der Normalzustand von
rund 80 % aller Karten trug damit weiter dieselbe Farbe wie „Budget überschritten" —
genau die Aussage, die Regel 2 abschafft. Meine Regel aus P3 traf nur `svg path` und
damit die Kreise nicht.

**② Das unsichtbare Wort.** „· zugeordnet" stand hinter der Beschreibung, wie der
v3-Entwurf es zeigt. `.fragmentDesc` kürzt aber einzeilig mit Ellipsis. Gemessen mit
dem echten Schriftstapel, 192 px Inhaltsbreite:

| Beschreibung | Breite |
|---|---|
| `ADAC E.V. Hecker Dominik BEITRAG` | 206 px — schon **ohne** Zusatz zu lang |
| `Vers-Nr:00008386058-Ihr Beitrag` | 201 px — schon **ohne** Zusatz zu lang |
| `Abrechnung 30.06.2026 siehe Anlage` | 218 px — schon **ohne** Zusatz zu lang |
| `Essengehen (Domi)` | 113 px — passt |
| `Miete August` (Entwurf) | 76 px — passt |

**Der Entwurf zeigt „Miete August" — einen kurzen, erfundenen Text.** Die echten
Buchungstexte der Bank sehen anders aus; die Entscheidung war gegen ein Bild
getroffen, das die Daten nicht trifft. Das Wort steht jetzt auf der Datumszeile.

### 5.5 · Gleiche Anatomie, andere Schrift

Verlaufs-Overlay und Wellen-Popup haben denselben Aufbau. Der Held des Verlaufs ging
von 38/200 auf **26/600**, der des Wellen-Popups behält den **Ring-Schnitt (36/300)**.
Grund: Dort ist der Held ein **Name**, hier eine **Zahl**. Dünn-und-groß trägt bei
Ziffern und scheitert bei einem Wort — „Versicherungen" in 38 px Ultralight ist eine
Zeile Hairlines, die mit der Kurve um Aufmerksamkeit konkurriert.

### 5.6 · Der Gutter war schon vorher zu klein

Beim Anheben des Vorjahres-Betrags von 9 auf 11 px wurde die reservierte Breite
gemessen statt geschätzt (LL-31). Verfügbar: 50 px.

| | 9 px | 11 px |
|---|---|---|
| `48.445 €` | 42,4 | **50,6** |
| `−123.456 €` | **52,5** | **62,7** |

Bei 11 px passt kein realistischer Wert — **und bei 9 px passte der sechsstellige
schon vorher nicht.** Der Sprint hat einen bestehenden Fehler sichtbar gemacht, nicht
verursacht. `POP_PAD_R` 58 → 74.

Die Pixel-Checks blieben grün, weil sie die Geometrie aus den **exportierten
Konstanten nachrechnen** statt sie zu kopieren. Eine alte Entscheidung, die eine
spätere Änderung trägt, ohne dass jemand daran denken musste.

### 5.7 · Warum `draw.ts` doch angefasst wurde

Drei der fünf Wellen-Anforderungen standen hartkodiert im Zeichencode und waren aus
CSS nicht erreichbar: Monatsnamen bei **8 px**, aktiver Monat bei `graS(0.5)`,
Goldlinie bei `goldS(0.55)`. **Die Token-Änderung `--color-gold: .6 → .75` erreichte
die Welle nicht.** Dazu dreimal hartkodiertes `system-ui` — die Welle renderte in
einer anderen Schrift als der Rest der App.

Der Kopfkommentar sagte: *„Farb-Triplets spiegeln tokens.css."* Das ist eine Zusage,
keine Verbindung, und sie ist in diesem Sprint gerissen. Der Kommentar sagt das jetzt
und nennt den richtigen Weg (`getComputedStyle` wie bei `--wave-opacity`) als
Roadmap-Punkt.

---

## 6. Offene Punkte

| | |
|---|---|
| **Doku-Teil 2** | §5, §6, §7, §9, §10, §12 der Design-Doku nennen weiter Deckkraft- und Schriftwerte, die der Code nicht mehr trägt. Beschreibende Abschnitte — sie werden mit diesem Abschluss nachgezogen |
| **`RD-2` bis `RD-4`** | Paket 19 ist mit `RD-1` (Bebilderung) und diesem Sprint zum großen Teil erledigt; der Light-Mode-**Umschalter** ist bewusst nicht gebaut |
| **Canvas liest keine Tokens** | `draw.ts` spiegelt sie weiterhin als Konstanten. Der saubere Weg wäre `getComputedStyle`, wie ihn `readWaveOpacity` schon geht. Eigener Punkt für die Roadmap |
| **Login, Onboarding, Fehlerseite** | erben die neuen Stufen über die Alias-Zeilen, haben aber keine eigenen v3-Seiten. Die Übergabe sieht das ausdrücklich so vor |
| **Zwei Stufen visuell unbestätigt** | In den Produktivdaten ist **jede** Zahlung aus 2025 und 2026 zugeordnet — die Rohmasse besteht durchgehend aus Konturen. „Arbeitsfähig" und „Übertrag" waren im automatischen Smoke nicht sichtbar; der Browser-Smoke des Users hat sie abgedeckt |

---

## 7. Vorschläge für CLAUDE.md und Roadmap

**Als Vorschlag formuliert — die Anwendung braucht die Freigabe des Users.**

### LL-46 · Ein Token wirkt nur, wo niemand seinen Wert ein zweites Mal hingeschrieben hat

87 komponenten-lokale Farbwerte in fünf Modulen plus vier SVG-Attribute plus vier
Konstanten im Zeichencode. Jeder war begründet, keiner war falsch — **und zusammen
bildeten sie eine Schicht, die jede Änderung an `tokens.css` abfing.**

Das ist LL-26 („Nachbauen") in seiner allgemeinsten Form, aber mit einem eigenen
Erkennungsmerkmal: **Wer einen Token-Wert ändert, prüft, ob ihn jemand kopiert hat.**
Ein `grep` nach dem alten Wert ist die ganze Prüfung und dauert Sekunden.

Verschärfend: Der Kommentar in `draw.ts` behauptete ausdrücklich, die Werte würden
`tokens.css` „spiegeln". **Eine Zusage über eine Verbindung ist keine Verbindung** —
das ist LL-22 an einer Stelle, an der man es nicht sucht.

### LL-47 · Ein Entwurf zeigt, was hineinpasst, nicht was drinsteht

Der v3-Entwurf setzt „· zugeordnet" hinter „Miete August" (76 px). Die echten
Buchungstexte sind 200–220 px lang und werden schon **ohne** den Zusatz gekürzt. Die
Copy-Entscheidung war gegen ein Bild getroffen, das die Daten nicht trifft.

LL-31 verlangt, eine Copy-Entscheidung gegen die Breite zu messen. **Neu ist die
zweite Hälfte: gegen die Breite des ECHTEN Inhalts, nicht des Entwurfsinhalts.** Ein
Entwurf wählt seine Beispiele danach, dass sie gut aussehen — das ist seine Aufgabe.
Verwandt mit LL-35 (die Stichprobe war nicht repräsentativ).

### Werkzeug-Fallen dieser Sitzung — Kandidaten für §6

**① Ein leeres Verzeichnis-Listing ist kein Beleg für Abwesenheit.** Der
RTK-Proxy-Hook filtert `ls` und `find`; beide liefern leer, obwohl Dateien da sind.
Der `smoke-agent` hat daraus einen kompletten, plausibel hergeleiteten Blocker gebaut
(„die `.env`-Dateien sind beim Aufräumen verlorengegangen") — mit Verweis auf die
echte Falle aus §4. **Prüfung: `test -f <pfad>`.**

**② `PASS (0) FAIL (0)` ist kein Erfolg.** Dieselbe Filterung meldete das für eine
Spec-Datei mit Syntaxfehler. Null gelaufene Tests lesen sich wie null Fehler. Nur das
Rohprotokoll unter `~/Library/Application Support/rtk/tee/` nennt die Ursache.
**Prüfung: Die Testzahl muss zur Erwartung passen, nicht nur die Fehlerzahl zu null.**

### Roadmap

- **Paket 19** — `RD-1` ✅ (alle sieben Komponenten bebildert), Umsetzung ✅.
  Der Light-Mode-**Umschalter** bleibt offen und braucht einen eigenen Schnitt.
- **Neu:** *Der Zeichencode liest die Tokens selbst* — `draw.ts` spiegelt sie
  weiterhin. `readWaveOpacity` zeigt den Weg.
