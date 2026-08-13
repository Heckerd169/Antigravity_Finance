# Sprint v2-18 — Review

> **Branch:** `sprint/v2-18-nutzungsbefunde` · **Commits:** 3 (2 Phasen + 1 Doku)
> **Datum:** 13. August 2026
>
> **In einem Satz:** Zwei Befunde aus der ersten echten Benutzung der Kategorien —
> beide unsichtbar beim Bauen, beide in Minuten behoben, einer davon hebt eine
> ausdrücklich festgeschriebene Gestaltungs-Entscheidung wieder auf.

---

## 1. Was gebaut wurde

### Phase 1 · `NB-1` — Ziehen öffnet nur noch, was offen ist

**Befund (User, 13.08.2026):** *„Ziehe ich eine Karte aus der Rohmasse zu den Ordnern,
öffnen sich alle Ordner. Dadurch rückt das eigentliche Ordnerfragment so weit nach
rechts, dass ich es nicht mehr sehen kann. Da ich zu diesem Zeitpunkt aber noch das
Fragment halte, kann ich nicht das Karussell bedienen."*

**Das war Record `B4`** — und die Entscheidung war beim Bauen plausibel: Sie löste
Befund `U1` (ein Drop braucht eine Karten-ID, eine zugeklappte Kategorie hat keine).
Am Entwurf war der Fehler nicht zu sehen; dort war die Reihe kurz und niemand hielt eine
Maustaste.

**Neue Regel:** Es öffnet sich nichts von selbst. Wer zuordnen will, klappt den
Zielordner vorher auf.

`U1` ist damit **nicht wieder offen, sondern anders gelöst** — nicht durch automatisches
Aufklappen *während* des Zugs, sondern durch bewusstes Aufklappen *davor*.

**Entfernt:** `dragActive`-State, drei `document`-Listener
(`dragstart`/`dragend`/`drop`), der Eintrag in der Abhängigkeitsliste von
`recomputeScrollState` und der ungenutzte `DRAG_MIME`-Import. Netto **weniger** Code.

**Dateien:** `src/components/interaction-zone/carousel.tsx`

### Phase 2 · `NB-2` — die Ansicht springt nicht mehr

**Befund (User):** Zwei Screenshots, Juli und August. Der August wirkt größer, weil die
Rohmasse leer ist — beim Wechsel springt alles.

**Ursache:** Die drei Zonen-Spalten stehen auf `align-items: stretch`; die Zone ist so
hoch wie ihre höchste Spalte. `.fragmentStack` hatte `max-height: 320px` — voll gab sie
der Zone 341 px, leer fiel die Zone auf 215 px. Die Welle darüber
(`page.module.css .stage`, `flex: 1 1 280px`) absorbiert die Resthöhe und wuchs um
**126 px**.

**Fix:** `max-height` → `height` am Stack. Bewusst dort und nicht als `min-height` an
der Zone: Die Rohmasse ist das Element, dessen Inhalt schwankt, und so kann der Wert
nicht driften, wenn später jemand an den 320 px dreht.

**Leerzustand:** `Keine offenen Umsätze`. Weil die Spalte ihre Höhe jetzt immer
reserviert, sähe eine große leere Fläche unter „ROHMASSE" wie ein Ladefehler aus. Der
Satz gilt für die **angezeigte** Liste — sind alle Umsätze Überträge und der Schalter
steht auf „aus", ist er ebenfalls richtig.

**Dateien:** `interaction-zone.module.css` · `fragment-stack.tsx` ·
`tests/e2e/render-smoke.spec.ts`

---

## 2. Prüfstrecke

| Prüfung | Ergebnis |
|---|---|
| `tsc --noEmit` | **0 Fehler** |
| ESLint (`src`, Worktree-Umweg) | **0 / 0** |
| `pnpm build` | **0 Fehler** |
| `pnpm test:visual` | **69 / 69** |
| `pnpm test:e2e` | **78 / 78** (vorher 77 — der Layout-Wächter ist der 78.) |

> **Drei Läufe waren zwischendurch rot, alle drei durch die Umgebung.** Das Protokoll
> zeigt fortlaufend `[supabase-fetch] Netz-Fehler, wiederhole Lese-Request: … ECONNRESET`.
> Bei schlechter Verbindung überschreitet der SSR-Render die 30-Sekunden-Grenze von
> Playwright. Jeder betroffene Test besteht einzeln und im Wiederholungslauf; der volle
> Durchlauf war am Ende 78/78. Das ist der bekannte SSR-ECONNRESET-Burst und **kein
> Regress dieses Sprints** — er verdient aber irgendwann eine eigene Zeile in der
> Roadmap.

---

## 3. Anker vorher/nachher

**Kein Datenbank-Eingriff.** Trotzdem gemessen:

| Monat 2026 | vorher | nachher | Bewegung |
|---|---|---|---|
| alle zwölf | *(siehe unten)* | identisch | **0,00 €** |

### Der Juli-Anker hat sich unabhängig von diesem Sprint bewegt

Beim Messen fiel auf: Juli steht auf **−322,74 €**, CLAUDE.md §9 nennt **−322,75 €**.

**Das ist kein Fehler, sondern der Fall, den §9 wörtlich vorhergesagt hat:**

> *„Was sich als Nächstes planmäßig bewegen wird: der erste Monat, in dem eine
> gemeinsame Karte eine zugeordnete Zahlung bekommt. Dann greift `BF-4` — bewusst und
> richtig."*

Am 13.08.2026 um 06:05 wurden drei echte Zahlungen zugeordnet: **Miete 1.089,26 €,
Strom 36,04 €, Internet 22,87 €**. Vorher rechnete die Karte `Plan × Anteil`
(1.089,25968…), jetzt nimmt sie die Überweisung — glatt auf zwei Stellen. Die
Nachkommastellen, die den Juli auf −322,745**69** und damit über die Rundungsgrenze
hoben, sind weg.

**Nachgeprüft:**
- Die übrigen elf Monate stehen unverändert.
- Die Ordner-Spalte ergibt weiterhin in **allen zwölf** Monaten exakt die Sparrate — die
  Restverteilung aus `C1` hält auch bei veränderter Datenlage.
- **Rechtsschutz** ist die vierte gemeinsame Karte und noch **nicht** zugeordnet
  (15,4521555… mit vollen Nachkommastellen). Sobald sie es ist, kann der Juli erneut um
  einen Cent wandern.

Damit hat **`BF-4` aus v2-13 zum ersten Mal in Produktion gegriffen.**

### Layout-Anker — neu mit diesem Sprint

Gegen einen **Produktions-Build**:

| Fenster | | Juli | August | Differenz |
|---|---|---|---|---|
| 1440 × 900 | Zone vorher | 341 | 215 | **−126** |
| | Zone nachher | 341 | 341 | **0** |
| | Welle vorher | 326 | 452 | **+126** |
| | Welle nachher | 326 | 326 | **0** |
| 1440 × 801 | Zone nachher | 341 | 341 | **0** |

---

## 4. Selbst-Review gegen die Prüfschritte des Plans

| # | Kriterium | Erfüllt | Beleg |
|---|---|---|---|
| S1 | Nur der vorher geöffnete Ordner bleibt beim Ziehen offen | ⏳ | Browser-Smoke — kein automatischer Wächter möglich |
| S2 | Zielkarte bleibt sichtbar, Drop funktioniert | ⏳ | Browser-Smoke |
| S3 | Alle Ordner zu → kein Drop-Ziel, gewollt | ✅ | Code: `isOpen = openKeys.has(key)` |
| S4 | Welle bleibt beim Monatswechsel gleich groß | ✅ | §3, Messung gegen Produktions-Build |
| S5 | August zeigt `Keine offenen Umsätze` | ✅ | Screenshot |
| S6 | Juli unverändert, 77 Umsätze, Liste scrollt | ✅ | Messung: `fragmente 77`, Zone 341 |
| S7 | Sparrate unbewegt | ✅ | §3 — die eine Bewegung ist fremdverursacht und korrekt |
| S8 | Prüfstrecke grün | ✅ | §2 |

---

## 5. Architektur-Entscheidungen

### 5.1 Warum `B4` abgelöst und nicht repariert wurde

Die naheliegende Reparatur wäre gewesen, das Karussell während des Zugs automatisch zum
Ziel zu scrollen. Das hätte drei neue Probleme gebracht: Wohin scrollen, wenn das Ziel
noch nicht feststeht? Was passiert bei elf offenen Ordnern und zwei Bildschirmbreiten
Inhalt? Und wie fühlt sich eine Fläche an, die sich unter dem Cursor bewegt?

Die einfachere Antwort war, den Auslöser zu entfernen. **Der Preis ist ein Klick, der
Gewinn ist ein Ziel, das stehen bleibt** — und netto weniger Code.

### 5.2 Warum die feste Höhe am Stack sitzt, nicht an der Zone

`min-height` an `.interactionZone` hätte dasselbe Ergebnis geliefert. Die feste Höhe am
Stack ist trotzdem besser: Die Rohmasse **ist** das Element, dessen Inhalt schwankt. Ein
Wert an der Zone müsste nachgezogen werden, sobald jemand an den 320 px dreht — und
genau solche stillen Kopplungen sind es, die später auseinanderlaufen.

### 5.3 Warum der Wächter die Zone misst und nicht die Welle

Die Welle ist das **Symptom**, die Zone die **Ursache**. Dazu kommt ein praktischer
Grund: Der Render-Smoke läuft gegen den dev-Server, und dort ist der Wellen-Sprung
**nicht** messbar — das Entwickler-Panel drückt sie in beiden Monaten auf ihr Minimum.
Ein Wächter auf der Welle wäre grün gewesen, ohne etwas zu beweisen.

Der Test misst **vier** Monate statt zwei und prüft vorab, dass mindestens einer mit und
einer ohne Umsätze dabei ist (LL-19). Ohne diese Vorprüfung könnte er grün sein, weil
zufällig alle vier gleich voll sind.

---

## 6. Offene Punkte und Fragen

### 6.1 Was der User entscheiden muss

1. **CLAUDE.md §9 — Juli-Anker auf −322,74 €** nachziehen, plus den Sprint-Stand.
   Vorschläge in `sprints/sprint_v2-18_doku_patches.md`. §7 Regel 14.
2. **Merge-Freigabe** nach dem Browser-Smoke.

### 6.2 Neu sichtbar geworden

- **`KAT-5` (Record `A2`) war nie gebaut.** Ein Zug auf die Ordner-Kachel soll das
  Anlege-Fenster mit vorgewählter Kategorie öffnen. In v2-17 entschieden, nicht
  umgesetzt — und **im Review von v2-17 nicht als offen benannt**. Das war eine Lücke
  meinerseits. Steht jetzt als eigene Zeile in Paket 7.
  Durch Phase 1 wird der Punkt relevanter: Ein zugeklappter Ordner ist heute gar kein
  Ziel mehr, `KAT-5` wäre der zweite Weg neben dem Aufklappen.
- **Die Zahl der offenen Themen ist von 28 auf 29 gestiegen**, obwohl ein Sprint gelaufen
  ist. Das ist die Sichtbarmachung von `KAT-5`, kein Rückschritt.

### 6.3 Bewusst nicht gemacht

- **Kein automatischer Wächter für Phase 1.** HTML5-Drag lässt sich in Playwright nicht
  verlässlich nachstellen, und der Render-Smoke ist read-only. Die Änderung ist eine
  Zeile mit sichtbarer Wirkung — sie gehört in den Browser-Smoke. Das ist eine echte
  Lücke und keine Bequemlichkeit.
- **Der SSR-ECONNRESET-Burst** wurde nicht angefasst. Er macht die Prüfstrecke
  unzuverlässig und verdient eine eigene Zeile in der Roadmap — aber nicht in diesem
  Sprint, der zwei benannte Befunde abarbeitet.

---

## 7. Vorschläge für CLAUDE.md und Roadmap

**Roadmap: bereits nachgezogen.** `NB-1` und `NB-2` in §4, `KAT-5` neu in Paket 7,
Kennungs-Register ergänzt, Zahlen zeilengenau ausgezählt (10 Pakete · 29 Themen ·
4 Hausaufgaben · 33 offen · 43 erledigt) — inklusive der Erklärung, warum die Zahl
gestiegen ist.

**CLAUDE.md: zwei Vorschläge — ✅ am 13.08.2026 freigegeben und angewendet.** Volltext
und Anwendungs-Vermerk in `sprints/sprint_v2-18_doku_patches.md`:

| # | Was | Stand |
|---|---|---|
| C1 | §9 Juli-Anker **−322,75 → −322,74 €**, mit der Begründung aus `BF-4`. Dazu den Satz „Was sich als Nächstes planmäßig bewegen wird" auf „ist eingetreten" umschreiben — und festhalten, dass Rechtsschutz noch aussteht | ✅ |
| C2 | §9 Sprint-Stand auf v2-18, Design-Doku 3.6.0, neue Roadmap-Zahlen | ✅ |

**Zwei Stellen sind über den Wortlaut hinaus mitgeändert worden** — der Kopfblock
„Letzte Aktualisierung" (trug noch v2-17) und der Satz „**Nichts** ist entschieden und
ungebaut" (durch `KAT-5` nachweislich falsch, und zwar seit v2-17). Beide tragen
dieselbe Tatsache wie `C2` und hätten ihr nach der Anwendung **offen widersprochen**.
Sie sind in der Patch-Datei einzeln benannt, statt still mitzulaufen — die Erweiterung
einer gegateten Datei über den freigegebenen Satz hinaus ist in dieser Sitzung schon
einmal passiert und soll nachvollziehbar bleiben.
