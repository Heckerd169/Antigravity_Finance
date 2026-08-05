# Sprint v2-10 — Review

> **Branch:** `sprint/v2-10-fehler-und-lesbarkeit` · **Basis:** `6cab0b1` (= `origin/main`)
> **Commits:** `173eb53` (P1) · `eb4b64b` (P2) · `d75c89b` (P3) · Doku-Commit (P5)
> **Datum:** 05. August 2026 · **Lauf:** unbeaufsichtigt, rund zwei Stunden, ohne
> anwesenden User — nach `sprints/sprint_v2-10_auftrag.md`
>
> **In einem Satz:** Drei Anzeige-Fehler behoben — das Einkommens-Popup öffnet wieder
> in voller Breite, der Betrag in der Rohmasse bricht nicht mehr um, und die
> Beschreibung zeigt den Verwendungszweck statt des Empfängers; die vierte Phase
> (`PA-1`) wurde nach der Abbruch-Klausel bewusst nicht gebaut, weil ihre Darstellung
> nirgends spezifiziert ist.

---

## 1. Was gebaut wurde

### Phase 1 · `BF-3` Einkommens-Popup + `RM-4` Positionsregel — `173eb53`

**Absicht.** Das Popup zum Eintragen der Gehälter öffnete als unbenutzbare Säule von
rund 80 px Breite. Es blockierte damit aktiv das Eintragen neuer Gehälter — die
höchste Dringlichkeit im ganzen Projekt.

**Lösungsweg.** Die Diagnose aus dem Auftrag wurde vor dem Patchen am Code
**nachgeprüft** (§7 Regel 10) und bestätigt: `.splitLeft`/`.splitRight` tragen in
`welle.module.css:78–86` ein `transform: translateY(-50%)`. Ein Vorfahre mit
`transform` wird nach CSS-Spezifikation zum Bezugsrahmen für `position: fixed`;
`inset: 0` meinte dadurch das schmale Label statt des Fensters, `width: 100%` ergab
80 px und `max-width: 480px` griff nie. Behoben durch `createPortal` nach
`document.body` — dasselbe Muster wie bei den übrigen Overlays (LL-6). Die
Zentrierung in `.backdrop` war korrekt und blieb unangetastet.

**Zwei Fallen vorab ausgeschlossen:**
- *Portal-Falle aus Sprint-5 K2.1* (Custom-Properties vererben nicht über den
  Portal-Hop): greift hier nicht — `income-split.module.css` definiert keine eigenen
  Custom-Properties, sondern liest ausschließlich `:root`-Tokens aus `tokens.css`.
- *SSR*: `createPortal` fasst `document` an. Beide Aufrufer rendern das Popup nur
  hinter einer Bedingung, die auf dem Server falsch ist (`isOpen` bzw. `openPerson`),
  der Server erreicht den Aufruf also nie. Belegt durch den grünen Build (7/7 Seiten).

**Berührt:** `src/components/income-split/index.tsx`

**`RM-4`** ist als Patch-Datei entstanden und in Phase 5 angewendet worden (§6 unten).

### Phase 2 · `BF-1` Vorschlags-Kästchen und Umbruch — `eb4b64b`

**Absicht.** Auf einer Rohmasse-Karte rutschte das Euro-Zeichen in die zweite Zeile.

**Lösungsweg.** Zwei Änderungen, beide am 04.08.2026 entschieden:
1. Die KI-Vorschlags-Kästchen entfallen aus der Anzeige. Umgesetzt über die Konstante
   `SHOW_SUGGESTION_BADGES` statt durch Löschen des Zweigs — das erfüllt beide
   Auflagen des Beschlusses auf einmal: „später mit **einer Zeile** wieder
   einschaltbar" ist wörtlich wahr, und die sechs Badge-Farbtöne bleiben **in
   Gebrauch** statt als toter Code eine Lint-Unterdrückung zu brauchen.
2. `.fragmentAmount` bekommt `white-space: nowrap`. Damit zählt die ganze
   Zeichenkette als Mindestbreite des Flex-Items (`min-width: auto`), der Betrag wird
   also nicht mehr zusammengedrückt — die Fehlerklasse ist auch für das
   TRANSFER-Kästchen geschlossen, das bleibt.

**Unberührt:** TRANSFER-Kästchen · automatische Zuordnung ab 95 % Konfidenz (sie ist
keine Empfehlung, sondern eine fertige Zuordnung) · die Berechnung in der Datenbank.

**Berührt:** `interaction-zone/fragment-card.tsx` · `interaction-zone.module.css`

### Phase 3 · `RM-1` Verwendungszweck statt Empfänger — `d75c89b`

**Absicht.** Die Beschreibung wurde vom Empfänger gefüllt; der Verwendungszweck —
genau die Information, die man beim Zuordnen braucht — fiel dem „…" zum Opfer.

**Lösungsweg.** `displayDescription()`: immer der letzte durch `|` getrennte Teil, bei
leerem Ergebnis Rückfall auf den ersten. Die Regel wurde **vor** der Umsetzung lesend
gegen die Produktiv-Datenbank geprüft und bestätigt sich exakt:

| Quelle | Aufbau | Anzahl | Ergebnis |
|---|---|---:|---|
| DKB Visa | ein Feld, kein Trennzeichen | 469 | unverändert |
| DKB Giro | `Empfänger \| Zweck` | 973 | Zweck |
| Cortal | `Sender \| Buchungstext \| Zweck` | 106 | Zweck |
| | | **1.548** | |

Genau **ein** Fragment hat einen leeren Zweck („Burschen- und Mädchenschaft 1972
Niederquembach e.V. | ") — dort greift der Rückfall wie vorgesehen.

**Grenzen bewusst eingehalten:** Nur die Anzeige. Der gespeicherte Text bleibt
unangetastet, weil er Bestandteil des Duplikat-Hashes, des Trigram-Index und des
Sortier-Tiebreakers (`page.tsx:344`) ist. Das `title`-Attribut behält den
**vollständigen** Text; das `aria-label` zieht die gekürzte Fassung mit, damit
Vorlesen und Sehen dasselbe ergeben. Das Abschneiden mit „…" bleibt unverändert CSS.

**Berührt:** `interaction-zone/fragment-card.tsx`

### Phase 4 · `PA-1` — nicht gebaut, bewusst

Ausführlich in `sprints/sprint_v2-10_offene_fragen.md` §5 und unten in §6.

---

## 2. Prüfstrecke

Vollständig, nach jeder Phase; die Zahlen unten sind der Schlussstand.

| Prüfung | Ergebnis |
|---|---|
| `tsc --noEmit` | **0 Fehler** |
| ESLint (`src`, `.ts`/`.tsx`) | **0 Fehler, 0 Warnungen** |
| `pnpm build` | **erfolgreich**, 7/7 Seiten statisch erzeugt |
| `pnpm test:visual` | **3/3** Pixel-Checks grün (6,5 s) |
| `pnpm test:e2e` | **9/9** grün (24,4 s) — setup · visual 3 · unauth 2 · render-smoke 3 |

**Bundle** (Schlussstand, unverändert gegenüber der Basis):

| | Size | First Load JS |
|---|---:|---:|
| Route `/` | 29,6 kB | **181 kB** |
| `/onboarding` | 2,82 kB | 154 kB |
| geteilt | — | 87,3 kB |
| Middleware | — | 81,6 kB |

Route `/` ist von 29,7 kB auf 29,6 kB gefallen — das nicht mehr gerenderte Badge-JSX.

> **ESLint im Worktree — der dokumentierte Umweg reichte nicht.** Die Fähigkeit
> `sprint-abschluss` nennt
> `npx eslint src --ext .ts,.tsx --resolve-plugins-relative-to .` als Ersatz für
> `pnpm lint`. Der scheitert hier weiterhin: Er löst zwar die *Plugins* eindeutig auf,
> aber ESLint läuft die Verzeichniskette weiter nach oben und findet
> `../../../.eslintrc.json` des Eltern-Repos, weil die Konfiguration kein
> `"root": true` trägt. Funktioniert hat:
> ```
> npx eslint src --ext .ts,.tsx --no-eslintrc --config .eslintrc.json --resolve-plugins-relative-to .
> ```
> `--no-eslintrc` unterbindet die Kaskade, `--config` lädt trotzdem die richtige
> Konfiguration — ohne eine Datei im Repo zu ändern. Vorschlag für die Fähigkeit:
> §7 unten.

---

## 3. Anker vorher/nachher

Alle drei Phasen sind reine Anzeige — der Anker musste sich **nicht** bewegen.
Gemessen lesend gegen `nflkobdfdhncrtjncpmq` (`calculate_sparrate_for_month`, nur
`SELECT`), einmal vor Phase 1 und einmal nach Phase 5:

| Monat 2026 | vorher | nachher | |
|---|---:|---:|---|
| Januar–April | 1.931,18 € | 1.931,18 € | ✓ |
| Mai | −86,77 € | −86,77 € | ✓ |
| Juni | 4.208,76 € | 4.208,76 € | ✓ |
| Juli | −1.222,75 € | −1.222,75 € | ✓ |
| August | 1.761,08 € | 1.761,08 € | ✓ |
| September–Dezember | 1.824,08 € | 1.824,08 € | ✓ |

**Ergebnis: kein Zahlenwert bewegt**, in keinem der zwölf Monate.

> **Die Anker-Tabelle im Auftrag ist überholt** — sie nennt 2026 flach 1.931,18 € und
> Juni 4.589,53 €. Gemessen stimmen davon nur Januar–Mai. Das ist **kein** Befund
> dieses Sprints: `V2/befunde_2026-08-04_fehler_und_entscheidungen.md` §1 hat exakt
> dieselben Werte am 04.08. gemessen und schreibt ausdrücklich, die alten Anker seien
> überholt. Dieselbe veraltete Tabelle steht in `CLAUDE.md` §9 → §7 unten.
> Ausführlich: `sprint_v2-10_offene_fragen.md` §1.

---

## 4. Selbst-Review gegen die Akzeptanzkriterien

| # | Kriterium | erfüllt | Beleg |
|---|---|---|---|
| A1 | Popup öffnet mittig, volle Breite, unabhängig vom auslösenden Klick | ✅ | `income-split/index.tsx` — `createPortal(…, document.body)`; das Popup ist damit Kind von `body` und kann keinen `transform`-Vorfahren mehr haben. Optische Bestätigung: §5a |
| A2 | Geometrie vergleichbar mit `direct-create-overlay` | ✅ | Beide portalen nach `document.body`; `.backdrop` (`fixed`/`inset:0`/`place-items:center`) und `.overlayBackdrop` (`fixed`/`inset:0`/`flex`+`center`) zentrieren gleichwertig |
| A3 | Kein Vorschlags-Kästchen mehr sichtbar | ✅ | `fragment-card.tsx` — Zweig hinter `SHOW_SUGGESTION_BADGES = false` |
| A4 | Transfer-Badge weiterhin vorhanden | ✅ | `fragment-card.tsx` — der `isTransfer`-Zweig ist unverändert und liegt **vor** der Verzweigung |
| A5 | Kein Betrag bricht um, auch vierstellig nicht | ✅ | `.fragmentAmount { white-space: nowrap }`; Mindestbreite des Flex-Items = ganze Zeichenkette |
| A6 | Badge-Farbtöne bleiben im Code, nicht gelöscht | ✅ | `BADGE_HUE_CLASSES` und `badgeHueIndex` unverändert und **referenziert** — Lint 0 Warnungen ohne Unterdrückung |
| A7 | `ALINE NUENNINGHOFF \| Geburtstagsgeld Gutschein VS` → `Geburtstagsgeld Gutschein VS` | ✅ | Funktion gegen die vier realen Fälle durchgerechnet, Ausgabe wörtlich getroffen |
| A8 | Visa-Zeile (`SP SCICON SPORTS`) unverändert | ✅ | dieselbe Prüfung — ohne `\|` liefert die Regel die Eingabe zurück |
| A9 | Cortal-Zeile zeigt den dritten Teil | ✅ | `Aline Nuenninghoff \| EURO-Überweisung \| Autoversicherung 2025` → `Autoversicherung 2025` |
| A10 | Nichts in der Datenbank geändert | ✅ | Ausschließlich `SELECT` gegen Produktion; `git diff` enthält keine Migration, kein SQL |
| A11 | `title` behält den vollständigen Text | ✅ | `title={fragment.description}` unverändert |
| A12 | Sparrate unbewegt | ✅ | §3 — alle zwölf Monate identisch |
| A13 | Ein Commit je Phase (LL-14) | ✅ | `173eb53` · `eb4b64b` · `d75c89b` + Doku-Commit |
| A14 | Doku nur patch-basiert (LL-16) | ✅ | `sprint_v2-10_doku_patches.md`, Anwendung erst in Phase 5, Bump als eigene Patch-Stelle |
| A15 | Kein Merge, kein Deploy | ✅ | PR angelegt, nicht gemerged |

---

## 5. Optische Prüfung

Der Subagent `smoke-agent` (strikt read-only) lief zum Zeitpunkt dieses Commits noch;
sein Ergebnis wird als eigener Commit nachgetragen. Beauftragt waren drei Dinge:
das Einkommens-Popup von **beiden** Labels aus geöffnet und mit
`direct-create-overlay` verglichen · die Rohmasse auf verschwundene
Vorschlags-Kästchen, erhaltenes TRANSFER-Kästchen, nicht umbrechende Beträge und
gekürzte Beschreibungen · das übrige Dashboard auf Regressionen.

Ausdrücklich untersagt war ihm, im Einkommens-Popup „Übernehmen" zu klicken — in der
Produktiv-Datenbank liegen echte Finanzdaten.

> **Das ersetzt den Browser-Smoke des Users nicht.** Er ist der Filter davor
> (CLAUDE.md §4). Der Produktiv-Gate bleibt der manuelle Durchgang — und bei diesem
> Sprint besonders der Blick ins Einkommens-Popup, weil genau dort der Fehler saß.

---

## 6. Offene Punkte und Fragen

Vollständig und begründet in **`sprints/sprint_v2-10_offene_fragen.md`**. Kurzfassung:

| # | Was | Entscheidung nötig? |
|---|---|---|
| 1 | Anker-Tabelle in Auftrag **und** `CLAUDE.md` §9 ist überholt | ja — nachziehen? (§7 Regel 14: braucht Freigabe) |
| 2 | „7 von 8 Overlays zentriert" stimmt nicht ganz — der Rückgängig-Toast sitzt bewusst unten Mitte (§2.4) | nein, sachlich korrigiert |
| 3 | Doku-Patch für `BF-1` (§11), den der Auftrag nicht vorsah | ja — soll er bleiben? Einzeln rücknehmbar |
| 4 | Gilt die Kürzung auch im Verknüpfte-Fragmente-Overlay? | ja — fürs Recurrence-Popup lautet die Empfehlung **nein** |
| 5 | **`PA-1` nicht gebaut** — Rechnung fertig und belegt, Darstellung unspezifiziert | ja — eine Runde `design-direktor`, fünf Punkte |

**Zu `PA-1` im Klartext:** Es lag nicht an der Zeit und nicht an der Rechnung. Der
Rechenweg ist vollständig verifiziert (Faktor 0,5721 aus 92.400 / 161.513; vier
gemeinsame Posten; durchgerechnetes Beispiel in den offenen Fragen). Aber Design-Doku
§10 und §12.7 kennen **keinen** Zustand nach dem Speichern, und §12.7 ist laut eigener
Anmoderation die *vollständige* Textreferenz der App. Das Feature zu bauen hätte
bedeutet, fünf Gestaltungsentscheidungen zu erfinden — darunter neue UI-Copy für den
Schließen-Knopf. Der Auftrag verbietet das zweimal („Keine Gestaltungsentscheidung",
„Niemals raten"), CLAUDE.md §7 Regel 3 ein drittes Mal. Also: notiert, mit fertiger
Rechnung übergeben, weiter zu Phase 5 — genau wie die Abbruch-Klausel es vorsieht.

---

## 7. Vorschläge für CLAUDE.md, Fähigkeiten und Roadmap

Alles als **Vorschlag** — die Anwendung braucht die Freigabe des Users.

**① `CLAUDE.md` §9 — Anker-Tabelle nachziehen.** Sie nennt 2026 flach 1.931,18 €;
gültig sind die am 04./05.08. gemessenen Werte (§3 oben). Die Tabelle ist der
„schärfste Regressions-Wächter des Projekts" (§7 Regel 21) — solange sie falsche
Sollwerte nennt, schlägt sie entweder falsch an oder wird ignoriert. Beides ist
schlimmer als kein Anker. **Empfehlung: nachziehen**, mit dem Zusatz, dass Juni und
Juli bis zur Klärung von `BF-5` in Bewegung bleiben.

**② Fähigkeit `sprint-abschluss` — den ESLint-Umweg korrigieren.** Der dort
hinterlegte Aufruf funktioniert in einem Worktree *unterhalb* des Repos nicht (§2
oben). Vorschlag: die Zeile ersetzen durch
`npx eslint src --ext .ts,.tsx --no-eslintrc --config .eslintrc.json --resolve-plugins-relative-to .`
Sie funktioniert in beiden Lagen und ändert weiterhin keine Datei im Repo.

**③ Alternativ zu ② — `"root": true` in `.eslintrc.json`.** Eine Zeile, und `pnpm lint`
funktioniert überall wieder, auch im Worktree. Das ist die sauberere Lösung, ändert
aber eine Konfigurationsdatei; deshalb hier nur als Vorschlag und **nicht** gemacht.

**④ Neue Fragment-Anzeige-Regel als Lessons-Learned?** Eher nicht. Der Portal-Fall ist
bereits LL-6, und dieser Sprint hat ihn nur bestätigt. Was **fehlt**, ist der Zusatz,
dass eine `transform`-Regel auf einem *Layout*-Element (hier: das Zentrieren der
Income-Labels) einen `position: fixed`-Nachfahren mitreißt, ohne dass am Overlay
selbst etwas falsch ist. Vorschlag: LL-6 um einen Halbsatz ergänzen statt eine neue
Nummer zu vergeben.

**⑤ Roadmap — bereits nachgezogen** (Teil des Doku-Commits): `BF-3`, `BF-1`, `RM-1`,
`RM-4` auf ✅ und in §4 „Erledigt"; §0 zeilengenau nachgezählt (40 → **37** Themen,
8 → **7** Hausaufgaben, 48 → **44** offen, 25 → **29** erledigt; Pakete bleiben 14).
Zwei Feststellungen, die daraus folgen und im Text stehen:
- **Paket 2 ist leer bis auf `RM-2`** — und `RM-2` wartet auf eine Gestaltungsrunde.
- **Paket 1 ist ab jetzt blockiert.** Die zwei sofort umsetzbaren Befunde sind
  erledigt; `BF-5`, `BF-2` und `BF-4` hängen **alle** an E1/E2/E3. Der Rechenfehler
  mit 900 € Wirkung wartet damit auf eine Entscheidung, nicht auf Kapazität. Das ist
  der wichtigste Steuerungs-Hinweis aus diesem Sprint.

---

*Review Sprint v2-10 · Antigravity Finance · 05. August 2026*
