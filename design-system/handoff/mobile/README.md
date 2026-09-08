# Handoff: /mobil — Zahlungen zuordnen ohne Ziehen

Zielrepo: `Heckerd169/Antigravity_Finance` (main). Design-Record: `V2/design_direktor_2026-09-07_mobil.md` (aus diesem Paket dorthin verschoben — Beschluss-Papiere liegen unter `V2/`, CLAUDE.md §3). Design-System: `design-system/styles.css` (v3-Tokens, Dark + Light) — **keine neuen Tokens anlegen.**

## Overview

Neue Route **`/mobil`** (430 px, eigene Route, kein Responsive-Umbau der Schreibtisch-Ansicht). Vier Tabs: Übersicht · Zuordnen · Karten · Verlauf. Kern ist **Zuordnen**: eine Buchung im Fokus, Vorschlag als einziger gefüllter Knopf, Zweifelsfall als gleichrangige Konturen, Konsequenz erst nach Bestätigung im Toast. Entschieden am 07.09.2026 (Vorschlag 1a; 1b Liste und 1c Wischen verworfen).

## About the Design Files

`Mobil App.dc.html` und `Mobil Zuordnen.dc.html` sind **HTML-Design-Referenzen** (klickbarer Prototyp bzw. Artboards), kein Produktionscode. Aufgabe: die Screens in der bestehenden App-Umgebung (React/TypeScript, `src/`, Supabase) mit den vorhandenen Komponenten und Mustern nachbauen — Ring aus `src/components/singularity-ring/`, Welle aus `src/components/welle/`, Karten aus `src/components/cards/`. Die Prototyp-Logik (`class Component` im HTML) ist Modell, nicht Vorlage: insbesondere die Konsequenz-Rechnung (s. u.).

Öffnen zum Anschauen: die `.dc.html` direkt im Browser (brauchen `support.js` und `_ds/` daneben — beide im Paket).

## Fidelity

**High-fidelity.** Farben, Typografie, Maße und Zustände sind final und aus `design-system/v3` abgeleitet. Nachbau pixelgenau, Copy exakt wie angegeben. Daten im Prototyp sind teils Annahmen (s. „Daten").

## Rahmen (alle Screens)

- Viewport 430 × 932, Safe Areas: Statusleiste 59 px oben, Home-Indikator 34 px unten (in der 83-px-Tab-Leiste enthalten).
- Hintergrund `--bg-primary`, Text `--text-primary`, Schrift `--font-stack-system`. Zahlen immer `font-variant-numeric: tabular-nums`. Minus als typografisches „−" (U+2212), Euro mit geschütztem Leerzeichen, de-DE-Format.
- Seitenränder 16 px; Inhaltsfläche `top:59px; bottom:83px`.
- **Tab-Leiste** 83 px: `--bg-primary`, `border-top: 1px solid --border-subtle`; 4 Tabs à 49 px Höhe, Icon 24 px + Label 10 px/500, Abstand 3 px. Aktiv `--color-teal`, inaktiv `--text-tertiary`. Badge auf „Zuordnen": Anzahl offener Buchungen, 18 px hoch, `--color-teal`, weiße 11 px/600, links `calc(50% + 6px)`, top 4 px; verschwindet bei 0. Home-Indikator 134 × 5 px, `--text-primary`.
- Icons (Stroke 1.7, round): Übersicht = Kreis r 8,5 + Bogen 3 px; Zuordnen = Rechteck 16×11 r 2,5 + Strich oben + Häkchen; Karten = Rechteck 17×12 r 2,5 + Querlinie; Verlauf = vier Balken (Stroke 2,2).
- Alle Bedienelemente ≥ 44 px Höhe. Kein Hover-Konzept (Touch); Aktiv-Zustand: Standard-Opacity des Systems.

## Screens

### 1 · Zuordnen (Einstieg, Tab 2)

Vertikaler Flex, `padding: 14px 16px 0`, `gap: 14px`.

**Kopf** (Zeile, `padding: 0 8px`, `justify-content: space-between`, `align-items: flex-end`)
- links: Label „SPARRATE · {Monat}" 11 px/600, letter-spacing .5, uppercase, `--text-tertiary`; darunter (6 px) Betrag 36 px/300, letter-spacing −1.4, line-height 1.
- rechts (Spalte, rechtsbündig, gap 6): optional Offline-Pille (s. Zustände); Zeile 12 px `--text-secondary`: „vorläufig · N nicht zugeordnet" | „alle N zugeordnet" | „noch keine Umsätze".

**Stapel-Vorschau** (`padding: 0 8px`)
- Kopf: „DANACH IM STAPEL" links, rechts „N weitere" | „letzte" (11 px/600 uppercase tertiary, margin-bottom 4).
- 3 Zeilen (tweakbar 1–4), je `min-height: 46px`, `border-top: 1px solid --border-subtle`, `justify-content: space-between`, gap 12: Empfänger 13 px/500 `--text-secondary`, darunter Zweck 11 px `--text-tertiary` (beide `nowrap` + `ellipsis`); rechts Betrag 13 px `--text-tertiary` mit Vorzeichen.
- Leer: eine Zeile „Nichts mehr danach" 13 px tertiary. Abschluss-Linie `border-top` unten.

**Monatsnavigation** (Höhe 48, `space-between`)
- Links/Rechts je 44 px Tap-Fläche: 28-px-Kreis `--neutral-fill` mit Chevron 14 px (Stroke 1.6), daneben zwei Zeilen: Monatsname 13 px/500 letter-spacing −.2; Unterzeile 12 px („3 offen" | „erledigt" | Pille-Wort des Zielmonats). Ohne Nachbar: Opacity .3, kein Handler.
- Mitte: Monat „September 2026" 17 px/600 letter-spacing −.4; darunter (4 px) Pille 11 px/600, `padding: 3px 10px`, r 20, `--neutral-fill` / `--text-secondary`: „Laufend" | „Vorbei" | „Forecast".

**Fokus-Karte** — `--bg-card`, `border: 1px solid --border-subtle`, r 16, `padding: 14px 16px 16px`
- Kopf: „BUCHUNG · {Datum lang}" links (ellipsis), „{i} von {n}" rechts (nowrap) — 11 px/600 uppercase tertiary.
- Betrag (margin-top 10): 22 px/400, letter-spacing −.6, mit Vorzeichen (+ für Zugänge).
- Empfänger (margin-top 10): 17 px/600, letter-spacing −.4, line-height 1.3, **ungekürzt** (`overflow-wrap: anywhere`).
- Zweck (margin-top 4, nur wenn vorhanden): 13 px, line-height 1.5, `--text-secondary`, ungekürzt.

**Aktionsfläche** (flex 1, Spalte, gap 8)

*Zustand normal (genau 1 Kandidat):*
- Label „VORSCHLAG · N × SO ZUGEORDNET" (11 px/600 uppercase tertiary, `padding: 0 4px 2px`).
- **Übernehmen-Knopf**: 52 px, r 10, `--color-teal`, weiß 15 px/600, zentriert, Häkchen 12 px + Kartenname (`nowrap` + `ellipsis`, `padding: 0 16px`). Einziger gefüllter Knopf.

*Zustand mehrdeutig (≥ 2 Kandidaten, `count(DISTINCT card_id) > 1`):*
- Label links „N KANDIDATEN · TREFFER AUF »{erstes Wort des Empfängers}«", rechts „NICHT EINDEUTIG".
- Je Kandidat: 48 px, r 10, `border: 1px solid --border-ghost`, transparent, `padding: 0 16px`, `space-between`: Name 15 px/500; rechts „N × zuvor" 12 px tertiary. **Keine Vorbelegung** (die alphabetische Vorbelegung `ORDER BY card_name` der Schreibtisch-Ansicht gilt hier nicht). Gewählt: `border --color-teal`, `background --teal-fill`. Erneutes Tippen hebt Auswahl auf.
- Übernehmen-Knopf 52 px wie oben, Text „Übernehmen" → nach Auswahl „Übernehmen · {Karte}". **Gesperrt** (Opacity .4, kein Handler) bis ein Kandidat gewählt ist.

*Beide Zustände:*
- „Andere Karte …" 44 px, r 10, `--neutral-fill`, `--text-primary`, 15 px/500 → öffnet Sheet.
- „Später" `margin-top: auto`, zentriert, 44 px hoch, `padding: 0 20px`, 15 px/500 `--text-secondary`, kein Rahmen.

*Zustand leer (Forecast-Monat oder alles zugeordnet):* statt Karte + Aktionen zentriert (gap 10, `padding: 0 24px`): Kreis-Häkchen 40 px `--color-teal` Stroke 1.5/1.8; Titel 17 px/600 „Noch keine Umsätze" | „Alles zugeordnet"; Text 13 px/1.5 secondary: „{Monat} ist Forecast. Die Buchungen kommen, wenn der Monat läuft." | „Sparrate {Monat} steht bei {Betrag}. Der Ring in der Übersicht zeigt sie."

### 2 · Sheet „Karte wählen"

- Scrim `rgba(0,0,0,.55)` über allem, Tap schließt.
- Sheet unten, `max-height: 640px`, `--bg-elevated`, r 18 oben, `border-top: 1px solid --border-subtle`, `padding: 10px 16px 34px`. Griff 36 × 5 px `--border-ghost`, r 3, zentriert, margin-bottom 12.
- Kopfzeile 44 px: „Karte wählen" 17 px/600 links; „Abbrechen" rechts, 15 px/500 secondary, 44 px Tap.
- Kontextzeile 12 px secondary, ellipsis: „{Empfänger} · {Betrag}".
- Liste scrollt (Scrollbar ausgeblendet), Gruppen in Reihenfolge **Fixkosten · Budget · Einmalig · Einnahmen**, Gruppenkopf 11 px/600 uppercase tertiary, `padding: 14px 4px 6px`. Zeile 48 px, `border-top --border-subtle`, `padding: 0 4px`, gap 12: Name 15 px/500 (ellipsis); rechts 12 px tertiary: Fixkosten „{Rest} unbezahlt" | „bezahlt"; Budget „{Rest} frei"; Einmalig „{Rest} frei"; Einnahmen „Einnahme".
- Tap auf Zeile = zuordnen (Sheet schließt, Toast erscheint).

### 3 · Toast (Danach-Moment)

- `position: absolute; left/right 16px; bottom 95px` (über der Tab-Leiste), `--bg-elevated`, `border --border-subtle`, r 14, `padding: 12px 16px`, `box-shadow: 0 12px 40px -8px rgba(0,0,0,.5)`, gap 16.
- Zeile 1: 13 px/500 „Zugeordnet · {Karte}" (ellipsis). Zeile 2: 12 px/500: bei Wirkung „Sparrate {Monat} −X,XX €" in `--color-red`; sonst „Sparrate unverändert · im Plan" | „Einnahme · im Plan" in `--text-secondary`. **Rot nur bei echter Abweichung** (v3 Regel 2).
- Rechts „Rückgängig" 13 px/600 `--color-teal`, 44 px Tap. Automatisch weg nach 5 s. „Später"-Toast: „Zurückgestellt · {Empfänger}" / „Steht jetzt am Ende des Stapels", **ohne** Rückgängig.

### 4 · Übersicht (Tab 1)

`padding: 10px 16px 0`, gap 12.
- Kopfzeile: „{Monat Jahr}" 17 px/600 links, Pille rechts (wie Zuordnen).
- **Bühne** 282 px hoch, volle Breite (margin 0 −16):
  - **Jahres-Welle** im Hintergrund (SVG 430 × 260): 12 Monatspunkte x = 18 + i·(394/11); y linear zwischen max·1,15 und min(0, min)−120 auf 24…224. Kubische Bézier-Segmente, Kontrollpunkte bei ⅓ / ⅔ auf der Höhe des jeweiligen Endpunkts. Gruppe Opacity .80. Drei Clips: realisiert (x ≤ laufender Monat) → Linie `--color-teal` 2 px, Fläche Verlauf `#3ECFAF` .26 → 0; Prognose (x > laufend) → Linie `--wave-forecast`, Fläche `#8A8A90` .18 → 0; **unter Null** → Linie `--color-red`, Fläche `#FF453A` .28 → .04 **nur zwischen Kurve und Nulllinie** (Pfad schließt auf y(0), nicht auf den Boden). Nulllinie 1 px `--border-ghost` x 16…414. **Kein** Marker-Punkt, **kein** senkrechter Strich. Monatsbeschriftung darunter (top 262): 12 Spalten, 11 px, laufender Monat 600 `--text-primary`, sonst 500 `--text-tertiary`.
  - **Ring** davor, 248 × 248, zentriert (left 91, top 6): deckende Innenfläche r 94 `--bg-primary` (schneidet die Welle aus); Track r 98 Stroke 9 `--ring-track`; Bogen r 98 Stroke 9 round, Umfang 615,752, `stroke-dashoffset = U·(1 − clamp(sparrate/plan, 0, 1))`, gedreht 90°, Transition .5 s; Farbe **`--color-teal`, `--color-red` bei negativer Sparrate**. Zwei 3,5-px-Punkte `--text-tertiary` bei 12 h/6 h. Innen: Betrag 36 px/300 −1.4 (weiß im Plan, teal über Plan, rot negativ); „SPARRATE" 11 px/600 ls 1.2 uppercase tertiary; „N % von Plan" | „N % Defizit" 12 px/500 secondary.
  - Ring nutzt `src/components/singularity-ring/`, Welle `src/components/welle/` — Geometrie an diese Maße anpassen, nicht neu bauen.
  - ⚠️ **Der Bogen schließt im Bau bei 200 %, nicht bei 100 %.** Die `clamp(…, 0, 1)`-Formel oben beschreibt den **Prototyp**; verbindlich ist Design-Doku §5 („Arc wächst über 12 Uhr bis max. voller Kreis (200 %)"), und `singularity-ring/` rechnet bereits so. Entschieden vom User am 08.09.2026, umgesetzt in v3-03: Die Komponente wird **unverändert** eingesetzt, ein zweiter Modus hätte dieselbe Figur auf zwei Geräten Verschiedenes bedeuten lassen. **Wer diese Zeile als Bauvorlage liest, baut die falsche Regel.**
  - ⚠️ **Die Welle ist Canvas, nicht SVG.** Die Beschreibung oben ist die des Prototyps; gebaut wurde mit `welle/draw.ts` und dessen Farben, Skala und horizontalem Regime-Gradienten — ein zweiter Zeichencode wäre ein Nachbau, und die Farbwerte stünden ein drittes Mal im Repo. Der einzige Unterschied zum Schreibtisch ist ein Parameter: `showActiveMarker: false`. **Rot lag bereits nur zwischen Kurve und Nulllinie**; die Forderung des Records war schon erfüllt.
- **Drei Kacheln** (Grid 3 × 1fr, gap 8): `--bg-card`, `border --border-subtle`, r 16, `padding: 12px 10px`, gap 6: Typ 11 px/600 uppercase tertiary (ellipsis); Plansumme 17 px/600 −.4 (ellipsis); Unterzeile 11 px secondary nowrap: Fixkosten „{Rest} **unbezahlt**", Budget „{Rest} frei", Einnahmen „erwartet" | „eingegangen".
- **Einstiegskarte** (`--bg-card`, r 16, `padding: 14px 16px`, `space-between`): „N Umsätze zuordnen" 15 px/600 + „Die Sparrate ist vorläufig, bis der Stapel leer ist" 12 px secondary; rechts 28-px-Kreis Chevron `--color-teal`/weiß. Leer: „Alles zugeordnet" / „Die Sparrate ist endgültig", Kreis `--neutral-fill`. Tap → Tab Zuordnen.
- Fußzeile 12 px tertiary: „Zuletzt zugeordnet: {Empfänger} → {Karte}" | „noch nichts in dieser Sitzung".

### 5 · Karten (Tab 3)

`padding: 10px 16px 0`, gap 10.
- Kopf: „Karten · {Monat}" 17 px/600; rechts „N Karten" 12 px secondary.
- Filter-Pillen (horizontal scrollbar, Scrollbar versteckt, gap 6): Alle · Fixkosten · Budget · Einmalig · Einnahmen. 32 px, `padding: 0 11px`, r 20, 13 px/500; aktiv `--text-primary` auf `--bg-primary`-Text (invertiert), sonst `--neutral-fill`.
- Liste scrollt (gap 8). Karte `--bg-card`, `border --border-subtle`, r 16, `padding: 12px 16px`, gap 8:
  - Zeile 1: Statuspunkt 6 px (tertiary | teal erledigt | rot überschritten) + Name 14 px/500 (ellipsis); rechts Ausgegeben 14 px/500.
  - Balken 3 px, Track `--progress-track`, Füllung `--progress-neutral` | teal (100 %) | rot (überschritten), Transition .4 s.
  - Zeile 3: 12 px secondary „{Typ} · {Status}" links („offen" | „N Buchung(en)" | „erledigt" | „überschritten"; Einnahmen „offen" | „erledigt"), rechts „von {Plan}" | „erwartet" | „eingegangen".
  - Tap klappt auf (`border-top --border-subtle`, `padding-top 8`, gap 6): zugeordnete Buchungen des Monats 12 px secondary (Empfänger ellipsis, Betrag rechts) | „Noch keine Buchung in diesem Monat" tertiary.

### 6 · Verlauf (Tab 4)

`padding: 10px 16px 0`, gap 14.
- Kopf: „Verlauf" 17 px/600; rechts „Sparrate, 6 Monate" 12 px secondary.
- Panel `--bg-elevated`, `border --border-subtle`, r 16, `padding: 16px 16px 12px`, gap 14: Held Ø 26 px/600 −.8 nowrap + „Ø je Monat" 12 px secondary. Balkenfeld 190 px, gap 10, `border-bottom --border-subtle`; Planlinie 1 px dashed `--border-ghost` bei y(1000), Beschriftung „Plan 1.000 €" 11 px tertiary **links** (auf `--bg-elevated`, 16 px über der Linie). Balken: Wert 11 px darüber (rot < 0, teal ≥ 1000, sonst secondary), Höhe |v|/max·150 px min 4, r 6 oben, gewählt `--teal-fill` + Rand teal (rot-Variante bei negativ), sonst `--neutral-fill`. Monatslabels 11 px darunter, gewählt 600 primary.
- Detailkarte `--bg-card` r 16 `padding: 14px 16px`: „SPARRATE · {Mon} 2026" 11 px uppercase tertiary; Wert 22 px/400 −.6 (rot/teal/weiß); Unterzeile 12 px secondary „+X über Plan" | „X unter Plan" | „Defizit — X gegen Plan".

## Zustände & Regeln

- **Offline**: Pille „Stand von HH:MM · offline" (11 px/600, `--neutral-fill`/secondary, **nicht rot**) oben rechts; Signalbalken tertiary; alle schreibenden Knöpfe (Übernehmen, Kandidaten-Übernehmen, Andere Karte) Opacity .4 ohne Handler; Hinweis 12 px secondary „Zuordnen braucht Netz. Der Stapel ist der von HH:MM."; **„Später" bleibt** (lokal).
- **Reihenfolge Stapel**: Reihenfolge der Buchungen wie geliefert; „Später" = ans Ende. Nach Zuordnung rückt die nächste nach; `{i} von {n}` zählt über alle Buchungen des Monats.
- **Nur vorhandene Karten** — auf /mobil keine Kartenanlage.
- **Rückgängig** (5 s) stellt Buchung, Kartenbudget und Sparrate zurück.
- **Light Mode**: gleiche Tokennamen (`.t-light`), keine Sonderfälle; gegen `v3/foundations/farben.html` prüfen (im Prototyp nicht abgenommen).

## State (Prototyp-Modell)

`tab`, `monthIndex`, `selectedCandidate | null`, `sheetOpen`, `toast {title, line, red, undo} | null`, `undo {bookingId, cardId, delta, before, month} | null`, `cardFilter`, `openCardId`, `historySelection`, `lastAssigned`. Buchung: `{id, day, who, what, amt, suggestion | candidates[], status: open|done, card, delta}`.

**Konsequenz-Rechnung im Prototyp** — nur Modell: Δ Sparrate = −max(0, |Betrag| − Restbudget der Karte). **Im Bau** nicht übernehmen: bestehende `calculate_match_confidence` und Anker 2 (Σ delta = Ist − Plan) verwenden; Toast-Zeile aus dem echten Δ der Sparrate.

## Daten

- Kartennamen: 1:1 aus `supabase/migrations/20260808_v2_17_kat1_zuordnung.sql` (46 Karten, inkl. 105-Zeichen-Name „Deutschlandticket Mama …"). Regel überall außer Fokus-Karte: `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` — Knopf wächst nicht, wichtigster Teil steht vorn.
- Beträge außer „Privates Budget 150 €" sind Annahmen; Welle Jan–Jul Beispielwerte. Vor dem Bau gegen Produktion ziehen.
- Kandidaten-Zähler „N × zuvor" = Anzahl früherer Zuordnungen des Empfänger-Musters zur Karte.

## Design Tokens

Ausschließlich `design-system/styles.css` (v3): `--bg-primary #0D0D0F`, `--bg-card #1C1C1E`, `--bg-elevated`, `--color-teal #3ECFAF`, `--color-red #FF453A`, `--teal-fill`, `--red-fill`, `--neutral-fill`, `--text-primary/secondary/tertiary`, `--border-subtle/ghost`, `--ring-track`, `--progress-track/neutral`, `--wave-forecast`, `--font-stack-system`. Radien: 10 (Knöpfe), 14 (Toast), 16 (Karten), 18 (Sheet), 20 (Pillen). Typo-Stufen: 36/300 · 26/600 · 22/400 · 17/600 · 15/600 · 15/500 · 14/500 · 13 · 12 · 11/600 uppercase · 10/500.

## Assets

Keine Bilder. Icons als Inline-SVG (Maße oben). Ring/Welle aus den bestehenden Komponenten.

## Screenshots

`screenshots/` — Prototyp bei 2×, 430 × 932:
01 Übersicht (Ring vor Welle) · 02 Zuordnen normal · 03 Zuordnen mehrdeutig + Toast nach erster Zuordnung · 04 Sheet „Karte wählen" · 05 Karten · 06 Verlauf.

## Files

- `Mobil App.dc.html` — klickbarer Prototyp (alle sechs Screens, Tweaks: Offline, Theme, Welle, Stapel-Vorschau)
- `Mobil Zuordnen.dc.html` — Beschluss-Artboards 1a (normal / mehrdeutig / danach) + Offline
- Design-Record → `V2/design_direktor_2026-09-07_mobil.md` (Entscheidungen, Messungen, Offenes)
- `support.js`, `_ds/` — Laufzeit + Tokens, nur zum Öffnen der Prototypen

## Offen (nicht Teil dieses Sprints)

„N × zuvor" vs. Konfidenz in % · Kartenmenü M2 (Beenden/Löschen/Lösen) · Light-Mode-Abnahme.
