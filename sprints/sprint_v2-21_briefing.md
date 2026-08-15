# Sprint v2-21 — die automatische Zuordnung nimmt Arbeit ab

> **Datum:** 15. August 2026 · **Paket 5** (`M6`, fasst `F1` `F2` `F3` zusammen)
> **Basis:** `sprint/v2-20-papierkorb-loeschen` (PR #30, noch offen — User-Entscheid,
> weil die v2-20-Migrationen bereits auf Produktion liegen)
> **Branch:** `sprint/v2-21-zuordnung`

---

## 0 · Warum dieses Briefing existiert

Drei der vier Kriterien aus `sprint-start` treffen zu: Die Datenbank wird berührt,
es sind mehr als drei Phasen, und der Sprint reicht voraussichtlich über die
Sitzung hinaus (der Browser-Smoke steht offen). Deshalb eine eigene Datei.

---

## 1 · Der Befund — was Phase ① ergeben hat

Der Eröffnungsprompt trug einen Verdacht: *Die Konfidenz wird nur einmal beim Import
berechnet und nie wieder.* **Der Verdacht stimmt — aber er ist nicht der Hebel, für
den er gehalten wurde.** Alles Folgende ist gegen Produktion gemessen, nicht
erschlossen (§7 Regel 10 / LL-22).

### 1.1 Der Verdacht ist belegt

`calculate_match_confidence` hat im gesamten Schema **genau einen** Aufrufer:
`process_csv_import`. Dort steht sie hinter `IF v_was_inserted AND NOT v_is_internal`
— sie läuft also ausschließlich für **neu eingefügte** Zeilen. Es gibt keine Funktion,
die einen Vorschlag später erneuert. Wer nach dem Import eine Karte anlegt, bekommt
für ältere Zahlungen nie einen Vorschlag. 20 der 51 Karten sind nach dem Großimport
vom 25.07. entstanden.

Belegt auch in den Daten: 1.590 Fragmente, davon **1.567 ohne Konfidenz**. Die 23 mit
Konfidenz sind **exakt dieselben 23** mit Vorschlag.

### 1.2 Aber: Nachrechnen allein bringt wenig

Für alle 284 offenen Zahlungen aus 2026 durchgerechnet, mit dem **heutigen**
Algorithmus und demselben Filter, den der Import benutzt:

| Ergebnis eines reinen Nachrechnens | Anzahl |
|---|---|
| kein Match überhaupt | 0 |
| Score > 0, aber unter Badge-Schwelle 0.60 | **247** |
| würde ein Badge bekommen (0.60–0.95) | 32 |
| würde automatisch verlinkt (≥ 0.95) | 4 |

**36 von 284 — 12,7 %.** Der Hebel ist da, aber klein. Die Masse scheitert woanders.

### 1.3 Wo sie wirklich scheitert — drei Schichten

**① Die Badge-Schwelle ist ohne Namenstreffer mathematisch unerreichbar.**

`frequency_match` prüft ausschließlich, ob die Karte im Monat des Fragments aktiv ist
— und **genau darauf filtert der Aufrufer bereits**. Sie liefert deshalb *immer* 1.00.
Gemessen über alle fünf Score-Klassen: Frequenz-Mittelwert **1.00**, ausnahmslos.

20 % des Scores sind damit eine Konstante, die nichts unterscheidet. Der effektive
Wertebereich ist auf `[0.20, 1.00]` gestaucht, und ohne Namensähnlichkeit ist das
Maximum `0.3 × 1.0 + 0.2 × 1.0 = 0.50` — die Schwelle liegt bei 0.60.

Sichtbar in der Verteilung: **72 Zahlungen sitzen im Band 0.50–0.60**, mit
Namens-Mittelwert 0.05, Betrags-Mittelwert 1.00 und Frequenz 1.00. Perfekter Betrag,
perfekte Frequenz, kein Name — und trotzdem chancenlos.

**② Die Namensfunktion ist blind für Teilwörter.**

`name_similarity` nimmt das Maximum aus (a) `similarity()` über die **ganzen** Strings
und (b) 0.80, falls der **vollständige** Kartenname als Substring vorkommt. Beides
versagt bei langen Buchungstexten gegen kurze Kartennamen:

| Zahlung | Karte | heute | wortweise + Umlaute |
|---|---|---|---|
| `Nurnberger Lebensversicherung Akti…` | Private Altersvorsorge - Nürnberger | **0.139** | **1.000** |
| `Alte Leipziger Lebensversicherung …` | Berufsunfähigkeit - Alte Leipziger | **0.344** | **1.000** |
| `Vodafone GmbH | Kundennummer 123` | Internet - Vodafone | **0.225** | **1.000** |
| `APPLE.COM/BILL` | Audible | 0.095 | 0.167 |
| `MAHNAZ` | Netflix | 0.000 | 0.000 |

Echte Treffer springen, Fehlpaarungen bleiben unten. Bei „Nurnberger" kommt hinzu,
dass der Kontoauszug **keinen Umlaut** liefert, der Kartenname aber einen trägt.

**③ Der stärkste Hebel wird überhaupt nicht genutzt: die eigene Historie.**

Juli und August sind zu 100 % von Hand zugeordnet — **101 Entscheidungen des Nutzers**,
die bisher niemand ausliest. Von 284 offenen Zahlungen aus 2026 tragen **86 (30 %)**
eine Beschreibung, die schon einmal einer Karte zugeordnet wurde.

Und sie ist verlässlich: 108 gelernte Beschreibungen, davon **106 eindeutig** (nur 2
zeigen auf mehr als eine Karte, bei 128 gegen 4 Zuordnungen).

**Kreuzvalidierung** — nur aus Juli gelernt, gegen August geprüft:
**9 von 9 richtig, 0 falsch.**

### 1.4 Die Messgrundlage für den ganzen Sprint

Die 101 Handzuordnungen aus Juli/August sind ein echtes Prüfset. Gegen sie gemessen:

| | heute | nur bessere Namensfunktion |
|---|---|---|
| richtige Karte ist Sieger | 33 (32,7 %) | 35 (34,7 %) |
| davon über Badge-Schwelle | **14** | **27** |
| **falsche** Vorschläge über Schwelle | **1** | **18** ⚠️ |
| würde automatisch verlinkt, richtig | 0 | 16 |
| würde automatisch verlinkt, **falsch** | 0 | **0** |

Die Namensfunktion allein hebt die Abdeckung — und **verdirbt die Präzision**
(93 % → 60 %). Ursache ist eindeutig identifiziert und behebbar:

- **Der Vorname.** Jede gemeinsame Überweisung trägt „Dominik Hecker und Aline
  Nünninghoff" im Zweck. Karten heißen „Handyvertrag - **Aline**" und „**Aline**
  Geburtstag" → Wortscore 1.00 → Score 0.70. **13 der 18 Falschen** haben genau
  diese Ursache.
- **Die Substring-Falle.** `LIKE '%wort%'` trifft auch Wortteile: „Doug**las**" trifft
  „Radbrille - **Glas**", „**Kauf**land" trifft „**Kauf** iPhone 15ProMax".

Beides ist der Grund, warum P1 nicht bei „wortweise vergleichen" stehen bleibt.

### 1.5 Der Fund, der alles andere entwertet hätte

`src/components/interaction-zone/fragment-card.tsx:32`:

```ts
const SHOW_SUGGESTION_BADGES: boolean = false;
```

Die Vorschlags-Kästchen sind seit v2-10 (`BF-1`) **aus der Anzeige genommen** —
User-Entscheid vom 04.08.2026 wegen des Euro-Zeilenumbruchs. Berechnet wird weiter,
gezeichnet wird nicht.

Ein perfekt nachgerechneter Vorschlag wäre in der Rohmasse also **unsichtbar
geblieben**. Das ist exakt Falle 4 / LL-26 — ein Frontend-Flag hebt die gesamte
Datenbank-Arbeit stillschweigend auf, und kein Anker und keine Prüfsumme fängt das.

Sichtbar ist der Vorschlag heute an **einer** Stelle: im Schaufenster-Popup
(`fragment-showcase-overlay.tsx:174`), wenn eine offene Zahlung angeklickt wird.
Dort steht er ohne Flag, mit Prozentzahl. **Diese Stelle trägt den Sprint.**

### 1.6 Und eine zweite Kürzung derselben Art

`src/app/page.tsx:388` setzt `suggestedCardName` nur im Band
`conf >= badgeThreshold && conf < autoAbsorbThreshold`.

Die Obergrenze ist heute richtig: Ab 0.95 verlinkt der Import selbst, ein Vorschlag
wäre gegenstandslos. **In diesem Sprint wird sie falsch** — wir rechnen nach, ohne zu
verlinken, also entstehen offene Zahlungen mit Konfidenz ≥ 0.95. Die wären durch
genau diese Bedingung unsichtbar. **Die 16 besten Vorschläge des ganzen Sprints.**

Deshalb ist P4 eine eigene Phase und keine Fußnote.

---

## 2 · Ziel, Nicht-Ziel, Prüfanker

**Ziel (ein Satz):** Die App schlägt für eine offene Zahlung von selbst die richtige
Karte vor — auch dann, wenn die Karte erst nach dem Import angelegt wurde.

**Nicht-Ziel** — ausdrücklich nicht angefasst:

| Was | Warum |
|---|---|
| **Rückwirkendes automatisches Verlinken** | bewegt sofort die Sparrate über bis zu zwölf Monate. User-Entscheid: erst sehen, dann entscheiden → eigener Sprint |
| Badges in der Rohmasse (`SHOW_SUGGESTION_BADGES`) | User-Entscheid vom 04.08. bleibt unangetastet; Sichtbarkeit läuft über das Schaufenster |
| Eine eigene Vorschlags-Ansicht zum Durchgehen | eigenes Stück Oberfläche, sprengt den Sprint |
| Die 751 Zahlungen aus 2025 | dort ist keine Karte aktiv — `DA-1`, Paket 6 |
| `frequency_match` echt machen | siehe §4 — Befund steht, Änderung verschiebt **alle** bestehenden Scores. Als Hausaufgabe in die Roadmap |
| Sparraten-Funktionen, Lösch-Tor, Papierkorb | v2-20-Gebiet |

**Prüfanker — die schärfste Fassung, die dieser Sprint haben kann:**

> **Keine einzige Zahl bewegt sich.** Alle zwölf Monate, Ist **und** Plan, identisch
> zum Vorher-Wert dieser Sitzung.

Das ist nicht nur eine Erwartung, sondern **strukturell belegt**: `name_similarity`,
`amount_match` und `frequency_match` haben im gesamten Schema genau einen Aufrufer —
`calculate_match_confidence`. Die wiederum genau einen: `process_csv_import`. Der
Zuordnungs-Pfad ist von den Rechenfunktionen vollständig isoliert. Und die neue
Nachrechen-RPC schreibt **niemals** `card_fragment_links`.

### Gemessen VORHER — 15.08.2026, Produktion, diese Sitzung

| Monat 2026 | Ist | Plan | | Monat 2026 | Ist | Plan |
|---|---|---|---|---|---|---|
| Januar | 1.899,67 | 1.899,67 | | Juli | **−8,84** | 23,93 |
| Februar | 1.931,18 | 1.931,18 | | August | **721,24** | 796,23 |
| März | 1.931,18 | 1.931,18 | | September | 1.824,08 | 1.824,08 |
| April | 1.899,67 | 1.899,67 | | Oktober | 1.792,57 | 1.792,57 |
| Mai | −86,77 | −86,77 | | November | 1.824,08 | 1.824,08 |
| Juni | 4.208,76 | 4.220,53 | | Dezember | 1.824,08 | 1.824,08 |

> Juli und August weichen von der Momentaufnahme in CLAUDE.md §9 ab (dort 6,73 € und
> 1.761,08 €). Das ist **kein Alarm** — §9 sagt selbst, die Tabelle ist Orientierung,
> kein Sollwert, und der Nutzer kuratiert weiter. Verglichen wird gegen **diesen**
> Vorher-Wert, in **dieser** Sitzung.

**Anker 1 — Ordner-Spalte == Ist-Sparrate:** in allen zwölf Monaten exakt **0,00**. ✓

**Anker 2 — `Σ delta = Ist − Plan`:** zehn Monate exakt 0. Juli −32,78 gegen −32,77,
August −75,00 gegen −74,99 — **je ein Cent**, der bekannte Rückstand `B2-R`.
**Er darf nicht wachsen und nicht wandern.**

---

## 3 · Die Phasen

Phasen-sequenziell, ein Commit je Phase, Phase N+1 erst nach grüner Phase N (LL-14).

### P1 · Die Namensfunktion lernt Wörter lesen · **DB**

`name_similarity` bekommt drei Dinge, die sie heute nicht hat:

1. **Umlaut- und ß-Normalisierung** auf beiden Seiten (`Nürnberger` ↔ `Nurnberger`).
2. **Wortweiser Vergleich mit echten Wortgrenzen.** Der Kartenname wird in Wörter ab
   4 Zeichen zerlegt; ein Wort zählt nur als Treffer, wenn es in der Beschreibung
   **als Wort** steht — nicht als Teilstück (`Douglas` ≠ `Glas`).
3. **Entwertung mehrdeutiger Wörter.** Ein Wort, das in mehreren Kartennamen desselben
   Nutzers vorkommt, trennt nicht — es wird abgewertet statt voll gezählt. Das fängt
   „Aline" und ähnliche Personennamen ohne fest verdrahtete Namensliste.

**Nie schlechter als heute:** Das Ergebnis ist das Maximum aus altem und neuem Weg.

*Akzeptanz (regel-basiert, LL-19):* Für jedes Paar aus Zahlung und Karte gilt
`neu >= alt`. Die Trefferquote auf dem 101er-Prüfset steigt, und die Zahl **falscher**
Vorschläge über der Badge-Schwelle bleibt bei **höchstens 1** — dem heutigen Stand.

### P2 · Die Historie wird zur vierten Komponente · **DB**

Neue Funktion `history_match(p_fragment_id, p_card_id)`: Wurde eine Zahlung mit
dieser Beschreibung schon einmal dieser Karte zugeordnet? Sie fließt mit einem eigenen
Gewicht aus `app_config` in `calculate_match_confidence` ein.

Zwei Dinge sind hier heikel und werden ausdrücklich behandelt:

- **Die Gewichte müssen zusammen 1.0 ergeben.** Ein viertes Gewicht dazuzuschreiben,
  ohne die anderen anzupassen, hebt den Wertebereich über 1.0 und verschiebt jede
  bestehende Schwelle stillschweigend.
- **Nur eigene Historie zählt.** `transfer_type IS NOT NULL` bleibt außen vor
  (Falle 3), und gelernt wird nur aus Zuordnungen desselben Nutzers.

*Akzeptanz:* Auf dem 101er-Prüfset steigt die Zahl richtiger Vorschläge über der
Badge-Schwelle gegenüber P1, ohne dass die Zahl falscher steigt. Kein Score
überschreitet 1.0.

### P3 · Nachrechnen — ohne zu verlinken · **DB**

Neue RPC `refresh_fragment_suggestions(p_user_id, p_from_month, p_to_month)`:
setzt `suggested_card_id` und `confidence` für **offene** Zahlungen im Zeitraum neu.

**Die Zusage, die diesen Sprint trägt:** Sie schreibt **niemals**
`card_fragment_links`. Sie berührt ausschließlich zwei Anzeige-Spalten auf
`fragments`. Übertragungen (`transfer_type IS NOT NULL`) und bereits zugeordnete
Zahlungen fasst sie nicht an.

Geprüft per Trockenlauf mit `RAISE`-Rollback (LL-18), in einem **eigenen** Aufruf,
niemals gemeinsam mit einer echten Mutation.

*Akzeptanz:* Nach dem Lauf über 2026 ist die Zahl der `card_fragment_links`
unverändert, und alle zwölf Monate Ist/Plan sind identisch zum Vorher-Wert.

### P4 · Die besten Vorschläge sichtbar machen · **Frontend**

`page.tsx` lässt heute nur das Band `[badge, auto)` durch. Ohne Auto-Verlinkung wäre
alles ab 0.95 unsichtbar — **die besten 16**. Die Obergrenze fällt für offene
Zahlungen; die Untergrenze bleibt, und beide Schwellen werden weiterhin
**server-seitig gelesen und server-seitig ausgewertet** (LL-17): Die Komponente
bekommt `suggestedCardName`, nicht die Rohwerte.

*Akzeptanz:* Eine offene Zahlung mit Konfidenz ≥ 0.95 zeigt im Schaufenster einen
Vorschlag. `SHOW_SUGGESTION_BADGES` bleibt `false`.

### P5 · Prüfstrecke, Review, Pull Request

`tsc` 0 · ESLint 0/0 · Build 0 · `test:visual` 81/81 · `test:e2e` 90/90 — beide
Zahlen dürfen nur **steigen**, und nur um selbst geschriebene Tests. Neue Spec-Dateien
gehören in `playwright.config.ts` unter `testMatch`, sonst laufen sie stillschweigend
nicht mit. Danach Anker nachher, Review, PR — **kein Merge, kein Deploy**.

---

## 4 · Was der Sprint findet, aber nicht behebt

**`frequency_match` ist eine Konstante.** Sie prüft nur, ob die Karte im Monat aktiv
ist — worauf der Aufrufer schon filtert. 20 % des Gewichts unterscheiden nichts.

Sie zu reparieren wäre naheliegend: `cards.due_day` gibt es seit v2-14. Aber nur
**18 von 51** Karten haben einen Fälligkeitstag, und jede Änderung dort verschiebt
**alle** bestehenden Scores gleichzeitig mit den Änderungen aus P1 und P2. Zwei
Verschiebungen in einem Sprint lassen sich nicht mehr auseinanderhalten.

→ Als Hausaufgabe in die Roadmap, mit dem Messwert aus diesem Sprint als Ausgangspunkt.

---

## 5 · Offene Frage an den User

**Übungs-Datenbank ja oder nein?** `db-eingriff` sagt „im Zweifel ja". Hier stehen
drei Dinge dagegen:

1. Der **Rennrad-Trainer** wird morgens und abends benutzt; die Fähigkeit sagt selbst,
   ihn nur **tagsüber** zu pausieren. Dieser Sprint läuft am späten Abend.
2. Die Übungs-Datenbank hat **keine aussagekräftigen Zuordnungsdaten** — der
   Init-2-Seed ist synthetisch und kennt weder 1.590 Fragmente noch 51 Karten. Eine
   Probe dort würde den Algorithmus praktisch nicht prüfen.
3. Es gibt eine **schärfere** Probe: die neuen Funktionen in einer zurückgerollten
   Transaktion auf Produktion anlegen und gegen die **101 echten Handzuordnungen**
   messen. Das prüft mehr als die Übungs-Datenbank es könnte — an echten Daten, ohne
   eine Spur zu hinterlassen.

**Empfehlung:** Weg 3 für P1/P2, Trockenlauf nach LL-18 für P3. Die Übungs-Datenbank
bleibt aus, der Rennrad-Trainer unangetastet. Begründet abweichend von `db-eingriff`
— und hier festgehalten, damit die Abweichung nicht als Versehen gilt.
