# Design-Entscheidung — das Home-Bildschirm-Symbol von `/mobil`, 13.09.2026

> **Runde:** 13.09.2026 · **Rolle:** Design-Direktor · **Entscheider:** User
> **Anlass:** Sprint v3-04 legt ein Web-App-Manifest an (`V2/befunde_2026-09-13_mobil-vollbild.md`).
> Ein Manifest braucht Name, Startfläche und Symbol — und keines davon war je entschieden.
> **Artefakt:** Vergleichs-Canvas mit allen vier Varianten in **echter Symbolgröße**,
> https://claude.ai/code/artifact/39c9cc0a-7761-4acf-942f-50a1377f1064 ·
> Arbeitsdateien unter `design-system/handoff/mobile/symbol/`
> **Status:** entschieden, bereit für den Bau.

## 1. Was entschieden wurde

| # | Frage | Entscheidung | Verworfen |
|---|---|---|---|
| 1 | **Symbol** | **Geschlossener Ring**, `--color-teal` (#3ECFAF) auf `--bg-primary` (#0D0D0F). Die Figur der App — dieselbe, die in der Tab-Leiste für „Übersicht" steht. | **Offener Bogen:** näher am Ring der Übersicht, sieht aber dauerhaft nach einem bestimmten Stand aus, den das Symbol nicht kennt. **Buchstabe „A":** lesbar, aber austauschbar. **Gar keins:** iOS nimmt weiter einen Screenshot der Seite. |
| 2 | **Name** | **„Antigravity"** unter dem Symbol (`short_name`), **„Antigravity Finance"** als voller Name. | Nichts — der Kurzname steht seit v3-02 als `apple-mobile-web-app-title` im Code und wird hier nur bestätigt, nicht neu erfunden. |
| 3 | **Startfläche** | **`--bg-primary` dunkel (#0D0D0F)** für `background_color` und `theme_color`. | Schwarz oder ein eigener Startbildschirm-Ton: Es ist genau die Fläche, in die die Seite hineinwächst — jeder andere Wert erzeugt einen sichtbaren Farbsprung beim Start. |

**Warum der Ring geschlossen ist, und nicht offen.** Ein unvollständiger Bogen liest sich
als Füllstand. Das Symbol steht dauerhaft auf dem Home-Bildschirm und kennt keine Zahl —
es behauptete also fortwährend einen Stand, der nie stimmt. **Ehrlichkeit vor Beruhigung:
Ein Ring, der nichts behauptet, ist der ehrlichere Ring.** Dass er dem Ring der Übersicht
dadurch weniger ähnelt, ist der Preis und war Teil der Entscheidung.

**Gegen die fünf Grundsätze gehalten.** Lenkt nicht von der Sparrate ab (es ist kein
Bildschirm). Belegt keine Statusfarbe neu — Türkis ist hier Marke, nicht „erledigt", und
die Tab-Leiste nutzt den Ring bereits so. Schreit nicht: eine Form, keine Zahl, kein Text.
Kein Werkzeug im Produkt. Und behauptet nichts, was es nicht weiß.

## 2. Messung

Alle vier Varianten wurden **in echter Größe (60 px)** nebeneinander gezeichnet und
zusätzlich zwischen normalen Nachbar-Apps gezeigt — nicht nur vergrößert. Das war die
eigentliche Prüfung: Der Screenshot-Vorschlag (heutiger Zustand) ist bei 60 px von jedem
anderen dunklen Symbol nicht zu unterscheiden. Der geschlossene Ring trägt, weil auf der
Fläche nur **eine** Form liegt.

Farben nicht geschätzt, sondern aus `src/styles/tokens.css` gelesen: `--bg-primary`
`#0D0D0F` (Zeile 15), `--color-teal` `#3ECFAF` (Zeile 31).

## 3. Was NICHT entschieden wurde

- **Ein Light-Mode-Symbol.** Das Manifest trägt genau eine Startfläche; die dunkle ist
  gewählt, weil die App dunkel gestaltet und der Light Mode nicht abgenommen ist
  (`MB-H3`). Falls der Light Mode später abgenommen wird, ist das hier erneut zu
  entscheiden.
- **Ein Startbildschirm** (Splash) mit Wortmarke. Nicht Teil dieser Runde.
- **Das Symbol der Schreibtisch-Ansicht.** `src/app/favicon.ico` bleibt unberührt; das
  Manifest hängt bewusst nur an `/mobil`.
- **Die Hochformat-Bindung.** Bewusst kein `orientation`-Feld: Der Sprint löst ein
  Vollbild-Problem. Eine Behauptung, die niemand prüft, gehört nicht ins Manifest (LL-22).

## 4. Was das entsperrt

`MB-7` — Sprint v3-04 kann das Manifest anlegen, ohne dass Name, Farbe oder Symbol
unterwegs erfunden werden müssen (§7 Regel 3).

## 5. Doku-Folge

**Kein Patch der Design-Doku.** Das Symbol ist kein Element der Oberfläche — es erscheint
nirgends in der App, sondern nur auf dem Home-Bildschirm des Geräts. Es gehört damit in
diesen Record und ins Manifest, nicht in einen § der Design-Bibel.

`design-system/` wird **nicht** nachgezogen: Die fünf Seiten zeigen die Formensprache der
Oberfläche; ein App-Symbol ist keine. Die Arbeitsdateien des Vergleichs liegen als
Beleg unter `design-system/handoff/mobile/symbol/`.
