# Sprint v3-03 — Review

> Branch `sprint/v3-03-mobil-sichten` · fünf Phasen · 08. September 2026
> **Die drei fehlenden Sichten auf `/mobil`: die Übersicht mit dem Ring vor der
> Jahres-Welle, die Karten als Liste mit Balken und aufklappbaren Buchungen, der
> Verlauf als sechs Monate Sparrate mit Planlinie. Paket 20 ist damit vollständig.**
>
> Briefing: `sprints/sprint_v3-03_briefing.md` · Anker-Protokoll:
> `sprints/sprint_v3-03_anker.md` · Handoff: `design-system/handoff/mobile/README.md`
> §4–§6 · Record: `V2/design_direktor_2026-09-07_mobil.md` #9/#10/#11.

## 1. Was gebaut wurde

| Phase | Absicht | Lösungsweg | Dateien |
|---|---|---|---|
| **P0** | Die Verfassung sagt wieder, was im Repo liegt | Die Patch-Vorschläge aus v3-01 und v3-02 **zusammengeführt** statt nacheinander angewendet — beide waren gegen den Stand *vor* v3-01 geschrieben und kollidierten an drei Stellen (siehe §5). Zwölf Anker einzeln per `grep -c` geprüft, jeder genau einmal vorhanden | `CLAUDE.md`, `sprints/doku_patch_2026-09-08_v3-01-v3-02-nachzug.md` |
| **P1 Übersicht** | Ein Blick sagt, wo der Monat steht | Bühne 282 px: `drawWave` im Hintergrund, `SingularityRing` davor mit deckender Innenfläche (r 94). Drei Kacheln aus `get_cards_for_month`, Einstiegskarte in den Stapel, Fußzeile mit der letzten Zuordnung | `src/app/mobil/uebersicht/`, `src/components/mobil/uebersicht/`, `src/components/welle/draw.ts` |
| **P2 Karten** | Der Monat als Liste, nicht als Karussell | Filter-Pillen über `kartenGruppe` (dieselbe Einteilung wie das Sheet), Statuspunkt und Balken aus `card-state.ts`, aufklappbare Buchungen des Monats | `src/app/mobil/karten/`, `src/components/mobil/karten/` |
| **P3 Verlauf** | Sechs Monate auf einen Blick | `get_sparrate_series` liefert Ist und Plan; Balken im Betragsraum mit Planlinie, Detailkarte zum gewählten Monat | `src/app/mobil/verlauf/`, `src/components/mobil/verlauf/` |
| **P4 Leiste** | Alle vier Tabs führen irgendwohin | Die drei `href: null` bekommen ihre Ziele, `/mobil` wird zur Übersicht. Der Monat wandert als `?month=` in **jeden** Link | `src/components/mobil/tab-bar/index.tsx`, `src/app/mobil/page.tsx` |

**Zwei Eingriffe in bestehenden Code, beide klein und beide begründet:**

- `drawWave` bekommt `showActiveMarker` (Standard `true`). Der Schreibtisch bleibt
  unverändert; `/mobil` schaltet nur den Kreis ab, **nicht** `activeIndex` — die
  Monatsbeschriftung hebt den laufenden Monat weiterhin hervor.
- `readWaveOpacity` und `DEFAULT_WAVE_OPACITY` wandern von `welle/index.tsx` nach
  `draw.ts`. Zwei Bühnen zeichnen jetzt dieselbe Welle; ein zweites Mal
  hingeschriebener Token-Wert wäre genau LL-44 gewesen.

## 2. Prüfstrecke

| | Ergebnis |
|---|---|
| `tsc --noEmit` | **0 Fehler** |
| ESLint (Worktree-Umweg, roh) | **0 Fehler / 0 Warnungen** |
| `pnpm build` | **0 Fehler** |
| `pnpm test:visual` | **276 / 276** |
| `pnpm test:e2e` | **301 / 301** |

**Bundle:**

| Route | Size | First Load JS |
|---|---|---|
| `/` | 29,2 kB | 193 kB |
| `/mobil/uebersicht` | 1,16 kB | 100 kB |
| `/mobil/karten` | 1,49 kB | 97,5 kB |
| `/mobil/verlauf` | 1,27 kB | 97,3 kB |
| `/mobil/zuordnen` | 6,28 kB | 102 kB |
| Middleware | — | 82,3 kB |

**Gegen das letzte Review (v3-02: visual 221, e2e 234) und die Baseline nach dem Nachzug
vom 07.09.2026 (visual 225, e2e 243):**

| | Baseline | jetzt | Differenz |
|---|---|---|---|
| `test:visual` | 225 | **276** | **+51** — 15 `mobil-uebersicht` · 18 `mobil-karten` · 18 `mobil-verlauf` |
| `test:e2e` | 243 | **301** | **+58** — die 51 oben, plus 3 `unauth` und 4 `render-smoke-mobil` |

Keine Zahl ist gesunken. Alle drei neuen Dateien stehen in der **festen Liste** in
`playwright.config.ts` — ohne den Eintrag wären sie nie gelaufen, und die Gesamtzahl
hätte es nicht verraten.

> **Eine Beobachtung zum Bundle, die kein Befund ist:** Route `/` steht bei 29,2 kB, das
> v3-02-Review nennt 31,9 kB. Dazwischen liegen die beiden Nachzüge vom 07.09.2026, nicht
> dieser Sprint — er hat an der Schreibtisch-Seite nur einen Import verschoben. Die Zahl
> ist gesunken, nicht gestiegen; nachgemessen wurde sie nicht.

**LL-40 — drei Wächter, dreimal absichtlich rot gesehen:**

| Wächter | Was gebrochen wurde | Was rot wurde |
|---|---|---|
| `mobil-uebersicht` | `showActiveMarker` in `draw.ts` ignoriert | genau **1** von 14 (der Pixel-Test) |
| `mobil-karten` | `punktFarbe` gab „offen" Rot statt Neutral | genau **2** von 18 |
| `mobil-verlauf` | Reihenfolge in `detailUnterzeile` gedreht, „über Plan" vor „Defizit" | genau **1** von 18 |

Jedes Mal wurde die Datei danach wiederhergestellt und der Lauf war wieder vollständig
grün. **Der Marker wird als Pixel gemessen, nicht am Quelltext abgelesen:** Zwei
Zeichnungen desselben Felds werden Zeichen für Zeichen verglichen — am aktiven Punkt
müssen sich über 100 Pixel unterscheiden, elf Punkte weiter **kein einziges**.

## 3. Anker vorher/nachher

Vollständig in `sprints/sprint_v3-03_anker.md`.

| Anker | Vorher (vor P1) | Nachher (nach P4) |
|---|---|---|
| Sparrate Ist + Plan, 24 Monate 2025 + 2026 | gemessen | **24/24 byte-identisch** |
| Anker 1 (Σ Ordner = Sparrate) | 0,00 € in 24/24 | **0,00 € in 24/24** |
| Anker 2 (Σ delta = Ist − Plan) | 0,00 € in 24/24 | **0,00 € in 24/24** |
| Anker 3, `/mobil/uebersicht` | — | **8** Netzrunden je Aufbau |
| Anker 3, `/mobil/karten` | — | **6** |
| Anker 3, `/mobil/verlauf` | — | **5** (6 an einer Jahresgrenze) |

**Kein Zahlenwert hat sich bewegt.** Das war die Erwartung, und sie ist der eigentliche
Prüfanker eines reinen Anzeige-Sprints.

> **August 2026 steht bei 341,36 €, die Momentaufnahme in CLAUDE.md §9 nennt 507,10 €.**
> Kein Befund: Die Momentaufnahme ist ausdrücklich kein Sollwert, der Nutzer kuratiert
> weiter, und verglichen wird gegen den eigenen Vorher-Wert derselben Sitzung.

## 4. Selbst-Review gegen die Prüfschritte

| # | Kriterium | erfüllt | Beleg |
|---|---|---|---|
| S1 | Die drei Sichten sind unangemeldet nicht erreichbar | ✅ | `unauth.spec.ts` — drei neue Fälle, je mit `next`-Ziel |
| S2 | `/mobil` landet auf der Übersicht | ✅ | `render-smoke-mobil.spec.ts` „/mobil leitet auf die Übersicht" |
| S3 | Ring vor der Welle, kein Marker, kein senkrechter Strich | ✅ | Pixel-Test in `mobil-uebersicht.spec.ts`; der senkrechte Strich lebt in `welle/index.tsx`, die Bühne ruft `drawWave` direkt |
| S4/S5 | Ring-Bogen und Farben | ✅ | `singularity-ring/` **unverändert** eingesetzt — die Regel „schließt bei 200 %" ist die der Komponente, geprüft von `ring-subline.spec.ts` |
| S6 | Kacheln: „unbezahlt" · „frei" · „erwartet/eingegangen" | ✅ | `mobil-uebersicht.spec.ts` — inklusive der Prüfung, dass „frei" bei Fixkosten **nicht** vorkommt |
| S7/S8 | Einstiegskarte leer und voll, führt in den Stapel | ✅ | `einstiegTitel`/`einstiegUnterzeile` geprüft; Ziel `/mobil/zuordnen?month=` |
| S9 | Filter zeigen ihre Gruppe, Zähler bleibt die Gesamtzahl | ✅ | `render-smoke-mobil.spec.ts`; der Zähler liest `daten.zeilen.length`, nicht die gefilterte Menge |
| S10 | Aufklappen zeigt die Buchungen **dieses** Monats | ✅ | Lader filtert auf `assigned_month`, nicht auf das Buchungsdatum (§6 Stolperfalle 6) |
| S11 | „überschritten" nur bei Budget | ✅ | `mobil-karten.spec.ts` — über **alle zehn** (Typ, Zustand)-Kombinationen geprüft |
| S12/S13 | Verlauf: sechs Balken, Planlinie, Detailkarte, Defizit rot | ✅ | `mobil-verlauf.spec.ts` und `render-smoke-mobil.spec.ts` |
| S14 | Netzrunden | ✅ | 8 · 6 · 5, aus den Ladern gezählt; im Edge-Log nach dem Browser-Smoke gegenzuzählen |
| S15 | **Browser-Smoke am iPhone** | ⬜ | **steht aus — Sache des Users** |

## 4b. Der optische Smoke — was erst das Bild gezeigt hat

Die Wächter waren grün, die Anker gehalten, und trotzdem stimmten **fünf** Dinge nicht.
Gefunden hat sie der Vergleich der Render-Smoke-Bilder mit `screenshots/01`, `05` und `06`.
**Keiner dieser Fehler hätte eine Zahl falsch gemacht.**

| # | Was das Bild zeigte | Korrektur |
|---|---|---|
| ① | Der Ring-Bogen war ein **Stummel** statt eines halben Kreises | **Kein Fehler im Bau, sondern im Messen.** Der Bogen wächst über eine Transition von **0,72 s** aus dem Leeren heraus; der Screenshot entstand davor. Der Smoke wartet jetzt auf das Ende der Animation. Danach steht der Bogen bei genau 47,6 % des Umfangs — 95,2 % auf der 200-Prozent-Skala, exakt wie gerechnet |
| ② | Die Kacheln standen **Fixkosten · Budget · Einnahmen**, der Entwurf zeigt **Fixkosten · Einnahmen · Budget** | Reihenfolge korrigiert. Die Aufzählung im README-Text nennt die Wortlaute, nicht die Anordnung — das Bild ist die einzige Aussage darüber |
| ③ | „2.841,87 € unbezahlt" **passte nicht** in die 105 px einer Kachel | `eurGanz` für Kacheln und Balkenwerte. **Gemessen, nicht geschätzt:** ein neuer Wächter misst mit dem echten Font-Stack — ganze Euro passen (auch fünfstellig), Cent-Beträge nicht. Genau die Prüfung, die LL-31 verlangt |
| ④ | Der Kopf las „Karten · September **2026**", der Entwurf „Karten · September" | Nur der Monatsname; das Jahr steht auf der Übersicht |
| ⑤ | Im Verlauf **verdeckte die Planlinien-Beschriftung einen Messwert** | Umgedreht: Der Messwert liegt oben und bringt seinen eigenen Grund mit. Die Planlinie bleibt als gestrichelte Linie erkennbar, auch wenn ihre Beschriftung angeschnitten wird — **ein Messwert schlägt eine Referenz** |

> **① ist der lehrreichste der fünf, weil er kein Fehler war.** Ein Bild, das 300 ms zu
> früh entsteht, zeigt einen Zwischenzustand — und der sieht aus wie ein kaputter Ring.
> Wer ihm glaubt, sucht eine Stunde in einer Komponente, die richtig rechnet. Der Smoke
> wartet jetzt auf `getAnimations().finished`, nicht auf eine feste Zeit.

**Und ein Befund, der NICHT korrigiert wurde:** Der Entwurf zeigt in `05-karten.png` eine
Karte „Strom - Mainova" mit **„Fixkosten · überschritten"** in Rot. Diesen Zustand gibt es
nicht — `resolveFixedCostState` kennt `ghost`, `paid` und `open`, und „überschritten"
existiert ausschließlich bei BUDGET (LL-12, Design-Doku §4.3). Gebaut wurde nach der Logik,
nicht nach dem Bild. **Das ist genau der Fall aus §7 Regel 12:** Ein Entwurf spezifiziert
eine Erwartung, die die bestehende Logik nicht erfüllen kann. Wer ihn ungeprüft nachbaut,
schreibt eine Zustandsregel ein zweites Mal — und die zweite ist falsch.

## 5. Architektur-Entscheidungen

**① Der Ring-Bogen schließt bei 200 %, nicht bei 100 %.** Der Prototyp rechnet
`clamp(sparrate/plan, 0, 1)`, Design-Doku §5 und die bestehende Komponente schließen erst
beim doppelten Plan. Entschieden vom User am 08.09.2026: **§5 gewinnt** (CLAUDE.md §5).
Die Alternative hätte einen zweiten Modus in `singularity-ring/` gebraucht — dieselbe
Figur hieße dann auf zwei Geräten Verschiedenes, und die Komponente trüge zwei Wahrheiten.
Der Preis ist sichtbar: Ein planerfüllter Monat füllt den Bogen halb. Genauso wie am
Schreibtisch.

**② Die Welle bekommt einen Parameter, keinen zweiten Zeichencode.** Der Handoff
beschreibt SVG mit vertikalen Farbverläufen, die App zeichnet Canvas mit horizontalem
Regime-Gradienten. Übernommen wurde die **bestehende** Zeichenfunktion samt ihrer Farben
und ihrer Skala; der einzige Unterschied ist `showActiveMarker: false`. Ein Nachbau wäre
LL-26 in der Form „Nachbauen" gewesen, und die Farbwerte stünden ein drittes Mal im Repo
(LL-44). **Die Geometrie passte ohne Eingriff:** `WAVE_PAD_L/R = 18` ergibt bei 430 px
Breite exakt die Punktabstände des Entwurfs.

**③ Das Feld der Bühne ist 282 px hoch, nicht 260.** `drawWave` zeichnet die
Monatsbeschriftung selbst, bei `h − 6`. Ein 260er Feld legte sie auf 254 — mitten unter
den Ring, der bis 254 reicht. Mit der vollen Bühnenhöhe sitzt sie bei 276, also dort, wo
der Entwurf sie zeigt.

**④ Die Balken des Verlaufs messen im Betragsraum.** Ein Monat mit −987 € ist ein großer
Ausschlag, kein kleiner; die Farbe sagt die Richtung, die Höhe die Größe. Ginge das
Vorzeichen in die Höhe ein, wäre der teuerste Monat des Jahres der unauffälligste. Das
Skalenmaximum schließt **alle** Pläne ein, nicht nur den des gewählten Monats — sonst
rechnete sich das Feld bei jedem Tippen neu, und dieselbe Säule wäre je nach Auswahl
verschieden hoch.

**⑤ Kein Rundungs-Ausgleich in den drei Kacheln.** LL-43 fragt nicht „wird gruppiert?",
sondern „wird die Summe der Gruppen irgendwo angezeigt?". Die drei Kacheln erscheinen
nirgends als Sparrate; ein Ausgleich verschöbe die Zahl einer Kachel um fremde
Rundungsreste, damit eine Summe stimmt, die niemand sieht.

**⑥ Die zwei Doku-Patches wurden zusammengeführt, nicht nacheinander angewendet.** Beide
waren gegen den Stand *vor* v3-01 geschrieben und kollidierten dreifach: Beide nannten
ihre neue Stolperfalle „32" und hingen am selben Anker, beide fügten nach `LL-43` ein, und
beide ersetzten dieselbe §9-Kopfzeile — nach dem ersten Patch hätte der Anker des zweiten
**nicht mehr existiert** (`grep -c` = 0). Aufgelöst: v3-01 wird Stolperfalle 32 mit LL-44
und LL-45, v3-02 wird 33 mit LL-46. Zusätzlich war der §9-Stand **beider** Vorlagen
überholt — sie schreiben „v3-02 liegt als Pull Request vor", tatsächlich ist er samt
beider Nachzüge in `main`. **Folge für später:** Die zwei Vorschläge aus dem
v2-32-Review, die dort LL-44/45 heißen, bekommen bei Freigabe **LL-47 und LL-48**.

## 6. Offene Punkte und Fragen

- **Der Browser-Smoke am iPhone steht aus.** Er ist der eigentliche Abnahme-Gate
  (CLAUDE.md §4); die automatisierten Prüfungen sind der Filter davor.
- **Git war während des gesamten Sprints blockiert.** Der RTK-Hook schreibt jedes `git`
  zu `rtk git` um, und der Worktree-Wächter lehnt genau diese Form ab — kein Commit, kein
  Push. Abhilfe: in `~/Library/Application Support/rtk/config.toml` unter `[hooks]` die
  Zeile `exclude_commands = ["git"]`. **Ohne sie kann kein Worktree-Sprint committen.**
- **Die Fußzeile „Zuletzt zugeordnet" liest die Datenbank, nicht die Sitzung** (B4). Der
  Entwurf meint „in dieser Sitzung"; der Server kennt keine. Gezeigt wird die letzte
  Zuordnung **dieses Monats** aus `card_fragment_links.created_at`. Kostet eine Netzrunde
  und ist dafür wahr.
- **`MB-H1` bleibt offen** („N × zuvor" gegen Konfidenz in Prozent), ebenso die
  Light-Mode-Abnahme (`RD-5`) und das Kartenmenü `M2`.
- **Die Handoff-README nennt für den Ring weiterhin 100 %.** Sie beschreibt den
  Prototyp und ist damit nicht falsch — aber wer sie als Bauvorlage liest, baut die
  falsche Regel. Vorschlag in §7.

## 7. Vorschläge für CLAUDE.md und Roadmap

**Roadmap:** `MB-6` auf ✅, **Paket 20 ist damit vollständig**. Abschnitt 0.1
nachzählen.

**CLAUDE.md:** **kein Vorschlag.** Dieser Sprint hat keine dauerhafte Lehre erzeugt — die
Fallen, an denen er entlanggelaufen ist (LL-12, LL-26, LL-43, LL-44, LL-40), stehen alle
schon dort und haben genau das getan, wofür sie da sind. Die Frage aus
`claude-md-pflege` lautet „gilt das *immer*?", und ein Sprint-Ergebnis gilt nicht immer.
Es gehört in die Historie, und dort steht es.

> **Eine Ausnahme wäre denkbar und wird bewusst nicht vorgeschlagen:** Die Kollision der
> beiden Patch-Dateien (§5 ⑥) ist ein hübsches Beispiel für LL-38 — eine Zahl veraltet
> mit einer Entscheidung, ohne dass jemand sich geirrt hat. Aber sie ist ein
> **Verfahrens**-Problem, kein neues Muster: Zwei nicht angewendete Patches gegen
> denselben Anker kollidieren, das folgt aus dem Verfahren selbst. Der Eintrag stünde in
> §6, würde gelesen und hülfe nichts, was die bestehende Regel „Anker einzeln per
> `grep -c` prüfen" nicht schon leistet — sie hat den Fall ja gefunden.

**Handoff-README:** ein Vermerk an der Ring-Zeile in §4, dass der Bogen im **Bau** bei
200 % schließt (Design-Doku §5) und die `clamp`-Formel den Prototyp beschreibt. Sonst baut
die nächste Sitzung die Regel des Prototyps nach.
