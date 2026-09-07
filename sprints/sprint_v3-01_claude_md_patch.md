# Sprint v3-01 — Patch für CLAUDE.md

> **Braucht die ausdrückliche Freigabe des Users** (§7 Regel 14, Fähigkeit
> `claude-md-pflege`). Nicht angewendet, solange sie nicht vorliegt.
>
> **Umfang vor dem Patch:** 1.407 / 1.600 Zeilen (88 %) · Erzählzone 126 / 150 ·
> Regelanteil 54 % (min 45) · Roadmap-Abschrift 15 / 30 — **alle vier grün**.
> **Nach dem Patch geschätzt:** ~1.448 Zeilen (91 %), Erzählzone **unverändert**
> (der v2-31-Kasten wird ersetzt, nicht ergänzt).

---

## ⚠️ Nummern-Kollision, die vorher zu klären ist

`sprints/sprint_v2-32_review.md` §7 schlägt zwei Lessons Learned als **LL-44** und
**LL-45** vor. Sie sind **nie angewendet worden** — das Register in §8 endet bei
**LL-43**.

Dieser Patch belegt **LL-44 und LL-45** mit den Lehren aus v3-01, weil Nummern beim
**Anwenden** vergeben werden und nicht beim Vorschlagen; sonst entstünde eine Lücke,
und `doku-vollstaendigkeit.spec.ts` prüft die Nummernfolge.

**Folge:** Werden die beiden Vorschläge aus v2-32 später freigegeben, bekommen sie
**LL-46 und LL-47**. Das ist im v2-32-Review nachzutragen.

---

## Patch 1 · Vorspann, Datum

**Anker:**
```
> **Letzte Aktualisierung:** 4. September 2026 · **nach:** Sprint **v2-32**
```
**Patch-Satz:**
```
> **Letzte Aktualisierung:** 6. September 2026 · **nach:** Sprint **v3-01**
```

---

## Patch 2 · §6 — neue Stolperfalle 32

**Anker:** das Ende von Stolperfalle 31, also die Zeile
```
    Erst beide zusammen ergeben eine benutzbare Regel. (v2-31, LL-43)
```
**Patch-Satz — danach einfügen:**
```
32. **Ein Token wirkt nur dort, wo niemand seinen Wert ein zweites Mal
    hingeschrieben hat.** In v3-01 standen **87** komponenten-lokale Farbwerte in
    fünf Modulen — 18 in `cards.module.css`, 38 in `interaction-zone.module.css`,
    22 in Header/Ring/Welle, 5 in `income-labels.module.css` — dazu **vier**
    hartkodierte SVG-Attribute in `card.tsx` und **vier** Konstanten in `draw.ts`.
    Jeder war zu seiner Zeit begründet: das etablierte „Sprint-2-Ring-Pattern",
    komponenten-lokale Custom-Properties am Wurzelelement. **Zusammen bildeten sie
    eine Schicht, die jede Änderung an `tokens.css` abfing.**
    Der klarste Fall: `--meta-dot-gem: rgba(100,168,240,.38)` war eine **wortgleiche
    Kopie** von `--color-blue-dot` mit dem alten Wert. Das Token wurde auf `.7`
    gehoben — ohne diesen Fund wäre die Änderung **im Diff sichtbar und im Bild
    unsichtbar** geblieben. Dasselbe bei der Goldlinie der Welle: Token `.6 → .75`,
    `draw.ts` blieb bei `goldS(0.55)`.
    **Verschärfend kommt eine Zusage hinzu, die keine Verbindung ist:** Der
    Kopfkommentar von `draw.ts` sagte wörtlich, die Farb-Triplets würden
    `tokens.css` „spiegeln". Das ist LL-22 an einer Stelle, an der man es nicht
    sucht — eine Behauptung über eine Kopplung, die es nicht gibt.
    **Regel:** Wer einen Token-Wert ändert, sucht den **alten** Wert im ganzen
    Repository. Ein `grep` nach `rgba(100,168,240` oder `#141416` ist die vollständige
    Prüfung und dauert Sekunden. Findet er etwas außerhalb von `tokens.css`, ist die
    Änderung dort noch nicht angekommen.
    **Kein Wächter fängt das** — jede Zahl bleibt richtig, die Prüfstrecke bleibt
    grün, und die Datei, die es verhindern sollte, ist genau die, die kopiert wurde.
    (v3-01, LL-44)
```

---

## Patch 3 · §6 — Stolperfalle 21 erweitern

**Anker:**
```
    Gemessen wird mit dem echten Font-Stack, nicht geschätzt. (v2-25, LL-31)
```
**Patch-Satz:**
```
    Gemessen wird mit dem echten Font-Stack, nicht geschätzt. (v2-25, LL-31)
    **Und gemessen wird gegen den ECHTEN Inhalt, nicht gegen den des Entwurfs.**
    v3-01 setzte das Wort `· zugeordnet` hinter die Beschreibung einer
    Rohmasse-Zahlung, weil die v3-Seite es dort zeigt — mit „Miete August", **76 px**.
    Die Fragment-Karte hat **192 px** Inhaltsbreite, und **drei von fünf echten
    Buchungstexten sind schon OHNE den Zusatz zu lang** (`Abrechnung 30.06.2026 siehe
    Anlage` = 218 px). Die Ellipse schnitt damit genau das Wort ab, das die neue
    Kontur erklärt; sichtbar war es nur bei den kurzen.
    **Ein Entwurf wählt seine Beispiele danach, dass sie gut aussehen — das ist seine
    Aufgabe.** Wer eine Copy-Entscheidung daraus ableitet, misst gegen die freundlichste
    Zeile statt gegen die häufigste. Verwandt mit LL-35 (die Stichprobe war nicht
    repräsentativ), aber die Quelle ist eine andere: dort eine Aggregation, hier ein
    Gestaltungsbild. (v3-01, LL-45)
```

---

## Patch 4 · §8 — zwei Registereinträge

**Anker:**
```
| LL-43 | Ein **Rundungs-Ausgleich gehört nur dorthin, wo die Summe der Gruppen sichtbar ist**
```
> *(Anker ist der Zeilenanfang; die Zeile ist eindeutig.)*

**Patch-Satz — nach dieser vollständigen Zeile einfügen:**
```
| LL-44 | Ein **Token wirkt nur dort, wo niemand seinen Wert ein zweites Mal hingeschrieben hat** — 87 lokale Farbwerte fingen jede Änderung an `tokens.css` ab, und ein Kommentar behauptete, sie würden sie „spiegeln" | §6 Stolperfalle 32 | v3-01 |
| LL-45 | Ein **Entwurf zeigt, was hineinpasst, nicht was drinsteht** — gemessen wird gegen den echten Inhalt, nicht gegen das Beispiel des Entwurfs | §6 Stolperfalle 21 | v3-01 |
```

---

## Patch 5 · §9 — Kopf

**Anker:**
```
**Letzter Sprint:** **v2-32** („Ein sauberer Tisch für das Re-Design", 04.09.2026)
· **davor:** v2-31 (`M7` `KAT-4`), v2-30 (`PF-6`), v2-29 (`ZO-5`), v2-28 (`DA-3`
`ZO-4` `NAV-1`), v2-27 (`DA-1` `ZO-3`), v2-26 (`KJ-6`…`KJ-9`), v2-25 (`KJ-1` `KJ-2`
`KJ-3`), v2-24 (`PF-1` `PF-2` `PF-4`).

**Alles bis einschließlich v2-31 ist in `main`**, dazu die beiden Fixes vom
03.09.2026 (durchgehende Verlaufslinie · blockweiser CSV-Import). Geprüft **gegen den
Baum** (`git ls-tree origin/main`), **nicht** gegen den PR-Status — der beantwortet
eine andere Frage. **v2-32 ist dieser Sprint** und liegt bis zur Freigabe als Pull
Request vor.
```
**Patch-Satz:**
```
**Letzter Sprint:** **v3-01** („Apple-Redesign umsetzen", 06.09.2026) · **davor:**
v2-32 (Aufräumen), v2-31 (`M7` `KAT-4`), v2-30 (`PF-6`), v2-29 (`ZO-5`), v2-28
(`DA-3` `ZO-4` `NAV-1`), v2-27 (`DA-1` `ZO-3`), v2-26 (`KJ-6`…`KJ-9`).

**Alles bis einschließlich v3-01 ist in `main`** — PR #55 gemergt, Browser-Smoke
bestanden, geprüft **gegen den Baum** (`git ls-tree origin/main`), **nicht** gegen den
PR-Status. Der Doku-Nachzug dieses Sprints liegt als eigener Pull Request vor.
```

---

## Patch 6 · §9 — den v2-31-Kasten ersetzen

**Anker:** der vollständige Block von
```
> **v2-31 in drei Sätzen.** Karten und Ordner haben einen **Verlauf** bekommen: 24
```
bis einschließlich
```
> genommen und bleibt offen.
```

**Patch-Satz:**
```
> **v3-01 in drei Sätzen.** Das Design-System **v3** ist umgesetzt — Optik neu,
> Rechenlogik und Datenbank unberührt. Die tragende Regel: **Rot bedeutet ab jetzt
> ausschließlich Abweichung.** „Offen" und „Laufend" sind der Normalzustand von rund
> 80 % aller Karten an 80 % aller Tage und trugen bis dahin dieselbe Farbe wie
> „Budget überschritten". Die Karten teilen eine Fläche; der Zustand sitzt im
> 18-px-Punkt und im Statuswort.
>
> **Der teuerste Fund war nicht gestalterisch, sondern strukturell:** 87
> komponenten-lokale Farbwerte, die jede Änderung an `tokens.css` abgefangen hätten
> (LL-44). **Und zwei Fehler hat nur das Bild gefunden, nicht die Prüfstrecke** — der
> rote Punkt in „Offen"/„Laufend" und das unsichtbare Wort „· zugeordnet"; beide Male
> waren alle Tests grün. Sie haben seither Wächter, die einmal absichtlich rot gesehen
> wurden.
>
> **Kein Zahlenwert bewegt** — der Sprint hat keine Rechenfunktion, keine RPC und
> keine Migration berührt. Prüfstrecke: `tsc` 0 · Lint 0/0 · `test:visual` 191 ·
> `test:e2e` 200. Design-Doku **3.14.1**.
```
