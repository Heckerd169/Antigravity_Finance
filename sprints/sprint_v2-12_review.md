# Sprint v2-12 — Review

> **Branch:** `sprint/v2-12-ring-subzeile` · **Basis:** `7589f5f` (= `origin/main`)
> **Datum:** 05. August 2026 · **Thema:** `BF-2` — sinnloser Hinweis unter dem Ring
> bei negativer Sparrate, mit Entscheidung **E3**
>
> **In einem Satz:** Aus zwei Textzweigen wird einer; die Subzeile rechnet jetzt auf
> der Differenz statt auf dem Vorzeichen des Plans, bekommt mit `genau nach Plan` eine
> dritte Zeile — und die Regel liegt in einer eigenen prüfbaren Datei, weil genau ihre
> Unprüfbarkeit den Fehler ein Jahr hat überleben lassen.
>
> **Reine Anzeige.** Keine Datenbank, keine Migration, kein `db-eingriff`.

---

## 1. Was gebaut wurde

### Der Fehler

`singularity-ring/index.tsx` verzweigte im Degenerations-Modus (`Plan < 100 €`) am
**Vorzeichen des Plans**:

```ts
plan < 0
  ? diff >= 0 ? `${formatEur(diff)} über Plan` : `${formatEur(diff)} unter Plan`
  : `Plan fast 0 € — ${formatEur(current)} gespart`
```

Der zweite Zweig unterstellt ein **positives Ist** — er schreibt das Vorzeichen sogar
ins Wort („gespart"). Juli 2026 (Plan 55,44 €, Ist negativ) fiel genau dort hinein und
las sich als **„Plan fast 0 € — −1.223 € gespart"**. Man spart keine minus 1.223 €.

**Warum es ein Jahr überlebt hat.** Die Kombination *kleiner positiver Plan +
negatives Ist* war bis zur Juli-Kuratierung **nicht erreichbar**: Ist und Plan waren in
jedem Monat identisch. N4b (v2-03) hat deshalb nur den Fall „Plan negativ" behandelt.

**Und der Fehler stand nicht nur im Code.** Design-Doku §5 spezifizierte dieselben zwei
Zweige und schrieb das Vorzeichen ins Beispiel: *„Plan fast 0 € — **+X € gespart**"*.
Die Lücke saß also schon in der Spezifikation — ein Fall für **LL-22**.

### Der Fix

Eine Regel, unabhängig vom Vorzeichen des Plans:

| Fall | Text | Farbe |
|---|---|---|
| besser als geplant | `+X € über Plan` | Türkis |
| schlechter als geplant | `−X € unter Plan` | Rot |
| genau auf Plan | `genau nach Plan` | Neutral (`muted`) |

Juli zeigt damit **„−378 € unter Plan"**. Der Zusatz „Plan fast 0 €" entfällt
ersatzlos — er war ohnehin ungenau (55 € sind nicht fast 0), und die Euro-Aussage
erklärt sich selbst.

`muted` existierte bereits im Typ `RingSubtextColor` und im CSS — für die dritte Zeile
war **kein** Typ- und kein Style-Eingriff nötig.

### Eine Entscheidung, die ich getroffen habe — und warum

**`genau nach Plan` greift ab einer Abweichung unter 0,50 €, nicht bei exakt null.**

Der Befund formuliert E3 als *„exakt auf Plan"*. Streng gelesen wäre das
`diff === 0`. Dann stünde bei 0,30 € Abweichung aber weiterhin **„+0 € über Plan"** da
— exakt der Text, den E3 abschaffen sollte, weil `formatEur` auf ganze Euro rundet.

Die Anzeige-Schwelle ist deshalb die konsequentere Lesart: Unter einem halben Euro
rundet die Anzeige ohnehin auf 0, und „genau nach Plan" ist dort die ehrlichere von
zwei ungenauen Aussagen. Steht so in `ring-subline.ts` begründet und im Doku-Patch.

> **Nicht betroffen: der Normalfall.** Bei `Plan ≥ 100 €` und `Ist = Plan` zeigt die
> Subzeile weiterhin `100,0 % von Plan` — das ist keine sinnlose Aussage und wurde
> nicht angefasst. `genau nach Plan` gilt ausschließlich im Degenerations-Modus.
> (August 2026 ist genau dieser Fall: Ist = Plan = 1.761,08 €.)

### Die Regel liegt jetzt in einer eigenen Datei

`src/components/singularity-ring/ring-subline.ts` — rein, ohne React, ohne CSS.

Das ist die eigentliche Lehre aus diesem Befund: Der Fehler saß in einer Textregel, die
im Bauteil eingebettet und damit **nicht einzeln prüfbar** war. Das Projekt hält es bei
`welle/draw.ts` seit v2-01 genau andersherum — reine Logik in eigener Datei, direkt
getestet. Diese Stelle zieht nach.

**Berührt:** `singularity-ring/index.tsx` · `singularity-ring/ring-subline.ts` (neu) ·
`tests/e2e/ring-subline.spec.ts` (neu) · `playwright.config.ts`

---

## 2. Prüfstrecke

| Prüfung | Ergebnis |
|---|---|
| `tsc --noEmit` | **0 Fehler** |
| ESLint | **0 Fehler, 0 Warnungen** |
| `pnpm build` | **erfolgreich**, 7/7 Seiten |
| `pnpm test:visual` | **12/12** (3 Pixel-Checks + **9 neue** Subzeilen-Tests) |
| `pnpm test:e2e` | **19/19** (vorher 10) |

**Bundle:** Route `/` 29,6 kB · First Load JS **181 kB** — unverändert.

### Der neue Wächter, in beide Richtungen geprüft

`tests/e2e/ring-subline.spec.ts` transpiliert die **echte** Quelldatei und fährt alle
Verzweigungen ab — kein Nachbau der Logik im Test. Muster übernommen von
`visual-pixel.spec.ts`, das dasselbe mit `welle/draw.ts` tut.

| Fall | Ist | Plan | erwartet |
|---|---:|---:|---|
| Juli 2026 (der Befund) | −322,75 | 55,44 | `−378 € unter Plan` · rot |
| Juli vor `BF-5` | −1.222,75 | 55,44 | `−1.278 € unter Plan` · rot |
| negativer Plan, besser | −50 | −200 | `+150 € über Plan` · teal |
| negativer Plan, schlechter | −300 | −200 | `−100 € unter Plan` · rot |
| exakt auf Plan | 55,44 | 55,44 | `genau nach Plan` · muted |
| 30 Cent daneben | 55,74 | 55,44 | `genau nach Plan` · muted |
| 60 Cent daneben | 56,04 | 55,44 | `+1 € über Plan` · teal |
| kleiner Plan, Ist positiv | 400 | 55,44 | `+345 € über Plan` · teal |

Dazu ein neunter Test, der über **alle** Fälle prüft, dass die Wörter „gespart" und
„fast 0" nirgends mehr auftauchen.

**Gegenprobe gefahren:** Mit dem alten Zweig fallen **7 Tests** um, mit dem neuen sind
es **12/12**. Ein Wächter, der auch ohne die Reparatur grün bliebe, wäre wertlos.

> Der Fall „Juli vor `BF-5`" steht bewusst mit drin: Er liefert `−1.278 € unter Plan`
> — genau den Wert, den der Befund vom 04.08. als Beispiel nennt. Damit ist belegt,
> dass die Umsetzung der Spezifikation entspricht und nicht nur zufällig zur heutigen
> Datenlage passt.

---

## 3. Anker vorher/nachher

Reiner Anzeige-Sprint — es darf sich **nichts** bewegen, und es hat sich nichts bewegt.

| Monat 2026 | Ist | Plan |
|---|---:|---:|
| Juni | 4.208,76 € | 4.220,53 € |
| **Juli** | **−322,75 €** | **55,44 €** |
| August | 1.761,08 € | 1.761,08 € |

Juli ist der Monat, um den es geht: `−322,75 − 55,44 = −378,19` → **„−378 € unter
Plan"**. Die Zahl stammt aus `BF-5` (v2-11) und ist hier nur Eingangswert.

---

## 4. Selbst-Review gegen die Akzeptanzkriterien

| # | Kriterium | erfüllt | Beleg |
|---|---|---|---|
| A1 | Ein Textzweig statt zwei, vorzeichensicher | ✅ | `ring-subline.ts`, keine Verzweigung mehr auf `plan` |
| A2 | „gespart" verschwindet bei negativem Ist | ✅ | Test 9 prüft alle Fälle |
| A3 | Juli zeigt `−378 € unter Plan` | ✅ | Test 1, gegen die echten Prod-Werte gerechnet |
| A4 | Negativer Plan verhält sich wie bisher | ✅ | Tests 3/4 — Regressionsfälle, unbewegt |
| A5 | Dritte Zeile `genau nach Plan` (E3) | ✅ | Tests 5/6, Farbe `muted` |
| A6 | „+0 € über Plan" kann nicht mehr auftreten | ✅ | Anzeige-Schwelle 0,50 €, Test 6 |
| A7 | Normalfall (`Plan ≥ 100 €`) unberührt | ✅ | Zweig nicht angefasst; August = Ist = Plan zeigt weiter Prozent |
| A8 | Kein Typ-/CSS-Eingriff nötig | ✅ | `muted` existierte bereits |
| A9 | Doku patch-basiert nachgezogen | ✅ | §5 + §12.1, Bump 3.1.8 → 3.1.9 |
| A10 | Anker unbewegt | ✅ | §3 |

---

## 5. Offene Punkte

**Keine.** `BF-2` war mit E3 vollständig entschieden, der Wortlaut stand im Befund
wörtlich fest. Die einzige eigene Entscheidung — die Schwelle für „genau nach Plan" —
ist oben in §1 begründet und in Code wie Doku vermerkt; sie ist bewusst als solche
kenntlich gemacht statt stillschweigend getroffen.

---

## 6. Vorschläge für CLAUDE.md und Roadmap

**① Kein neuer Lessons-Learned-Eintrag nötig — LL-22 hat gerade seinen zweiten Beleg
bekommen.** Design-Doku §5 spezifizierte den fehlerhaften Zweig **wörtlich**, inklusive
Vorzeichen im Beispiel. Das ist exakt der Fall, den LL-22 seit heute beschreibt: eine
Zusage über Verhalten, die nie gegen die Wirklichkeit geprüft wurde. Dass die Regel
zweimal an einem Tag zuschlägt, spricht für sie — nicht für eine dritte Nummer.

**② Vorschlag für die Datei-Konventionen in §7:** *„Reine Anzeige- und Rechenregeln
gehören in eine eigene Datei neben das Bauteil, nicht hinein — `welle/draw.ts` und
`singularity-ring/ring-subline.ts` sind das Muster. Eingebettete Regeln sind nicht
einzeln prüfbar, und genau das hat `BF-2` ein Jahr überleben lassen."*
Das ist heute schon gelebte Praxis, steht aber nirgends.

**③ Roadmap — bereits nachgezogen:** `BF-2` auf ✅ nach §4. Paket 1 besteht damit nur
noch aus **`BF-4`** (wartet auf **E1**). Zahlen zeilengenau: 36 → **35** Themen,
43 → **42** offen, 30 → **31** erledigt.

---

*Review Sprint v2-12 · Antigravity Finance · 05. August 2026*
