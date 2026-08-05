# Sprint v2-12 — Doku-Patches

**Ziel-Dokument:** `antigravity_finance_design_dokument.md` (v3.1.8)
**Datum:** 05. August 2026
**Anlass:** `BF-2` mit Entscheidung **E3** — der Degenerations-Modus (§5, N4b)
beschreibt zwei Textzweige, von denen einer ein positives Ist unterstellt.
**Verfahren:** §7 Regel 14 / LL-16, Anker + Patch-Satz.
**Status:** ✅ angewendet am 05.08.2026, Anker vorher als eindeutig bestätigt.

---

## Patch 1 — §5 N4b: aus zwei Textzweigen wird einer

**Der Befund.** §5 spezifizierte den Degenerations-Modus in **zwei** Zweigen, getrennt
nach dem **Vorzeichen des Plans**:

- *Plan fast 0 € (positiv)* → „Plan fast 0 € — **+X € gespart**"
- *Plan negativ* → EUR-Differenz in „über/unter Plan"-Sprache

Der erste Zweig unterstellt ein **positives Ist** — er schreibt das Vorzeichen sogar
fest ins Beispiel (`+X € gespart`). Juli 2026 (Plan 55,44 €, Ist negativ) fiel genau
dort hinein und las sich als „−1.223 € gespart". Die Spezifikation selbst war also
lückenhaft, nicht nur die Umsetzung.

**Anker:**

```
- **Plan fast 0 € (positiv):** Subzeile „Plan fast 0 € — +X € gespart" (EUR-Betrag als Held in der Ringmitte).
- **Plan negativ (Sonderausgabe):** Held = IST in EUR (rot, wenn negativ); Subzeile = EUR-Differenz in „über/unter Plan"-Sprache. **Subzeilen-Farbe folgt dem Differenz-Vorzeichen**, nicht dem absoluten IST:
```

**Patch — ersetzen durch:**

```markdown
**Eine Regel, unabhängig vom Vorzeichen des Plans (v2-12, `BF-2` + `E3`).** Held = IST in EUR (rot, wenn negativ). Die Subzeile nennt immer die **Differenz zum Plan**, die **Farbe folgt dem Differenz-Vorzeichen**, nicht dem absoluten IST:

| Fall | Subzeile | Farbe |
|---|---|---|
| besser als geplant | `+X € über Plan` | Türkis |
| schlechter als geplant | `−X € unter Plan` | Rot |
| genau auf Plan | `genau nach Plan` | Neutral (`muted`) |

- Plan −500 €, IST −400 € → Held „−400 €" (rot) · „+100 € über Plan" (teal — besser als geplanter Deficit).
- Plan −500 €, IST −700 € → Held „−700 €" (rot) · „−200 € unter Plan" (rot — schlechter).
- Plan 55 €, IST −323 € → Held „−323 €" (rot) · „−378 € unter Plan" (rot).

**„genau nach Plan" gilt ab einer Abweichung unter 0,50 €** — also der Anzeige-Schwelle, nicht bei exakt null. Die EUR-Anzeige rundet auf ganze Euro; eine Abweichung von 0,30 € stünde sonst als „+0 € über Plan" da, genau der Text, den `E3` abschaffen sollte.

> **Was hier bis v2-12 stand — und warum es falsch war.** Die Spezifikation kannte zwei Zweige, getrennt nach dem **Vorzeichen des Plans**. Der Zweig für einen kleinen *positiven* Plan lautete „Plan fast 0 € — **+X € gespart**" und unterstellte damit ein positives Ist. Juli 2026 (Plan 55,44 €, Ist negativ) fiel genau dort hinein: „−1.223 € gespart". Man spart keine minus 1.223 €.
>
> Aufgefallen ist es erst nach einem Jahr, weil die Kombination *kleiner positiver Plan + negatives Ist* bis zur Juli-Kuratierung **nicht erreichbar** war — Ist und Plan waren in jedem Monat identisch. Der Zusatz „Plan fast 0 €" entfällt ersatzlos: Er war ohnehin ungenau (55 € sind nicht fast 0), und die Euro-Aussage erklärt sich selbst.
>
> Die Regel liegt seit v2-12 in einer eigenen, reinen Datei (`singularity-ring/ring-subline.ts`) und wird von `tests/e2e/ring-subline.spec.ts` gegen die echte Quelle geprüft — nach dem Vorbild von `welle/draw.ts`. Sie war vorher im Bauteil eingebettet und damit nicht einzeln prüfbar; das ist der zweite Grund, warum der Fehler so lange überlebt hat.
```

---

## Patch 2 — §12.1 UI-Copy: die dritte Zeile aufnehmen

**Anker:** §12.1 „Singularity Ring", die Copy-Tabelle, exakte Zeile:

```
| Prozent — Defizit | `[N] % Defizit` |
```

**Patch — darunter einfügen:**

```markdown
| Degenerations-Modus — besser | `+[N] € über Plan` |
| Degenerations-Modus — schlechter | `−[N] € unter Plan` |
| Degenerations-Modus — genau auf Plan | `genau nach Plan` |
```

**Begründung:** §12 ist laut eigener Anmoderation die **vollständige** Textreferenz der
App. Die drei Zeilen des Degenerations-Modus fehlten dort bisher ganz — der Wortlaut
stand nur in §5. `genau nach Plan` ist neu (E3), die beiden anderen werden nachgetragen.

---

## Versions-Bump

**Design-Doku 3.1.8 → 3.1.9:**

```markdown
> **Changelog v3.1.9 (05.08.2026, Sprint v2-12):** §5 N4b — der Degenerations-Modus verzweigte am Vorzeichen des **Plans** und unterstellte im Zweig „Plan fast 0 € (positiv)" ein positives Ist („+X € gespart"). Ersetzt durch **eine** Regel auf der Differenz, mit dritter Zeile `genau nach Plan` (Entscheidung `E3`); der Zusatz „Plan fast 0 €" entfällt ersatzlos (`BF-2`). §12.1 um die drei Copy-Zeilen des Degenerations-Modus ergänzt, die dort bisher fehlten.
```

---

## Nicht angefasst

- **§5 a) Normalfall und c) Neutraler Arc** — unverändert. Der Fehler saß
  ausschließlich in der Textregel von b).
- **Die Schwelle `Plan < 100 €`** — unverändert. Sie war nie das Problem; in Juli hat
  sie korrekt gegriffen.
- **Schema-Doku** — kein Patch, reine Anzeige ohne Datenbank-Bezug.

---

*Doku-Patches Sprint v2-12 · Antigravity Finance · 05. August 2026*
