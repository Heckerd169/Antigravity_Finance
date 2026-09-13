# Sprint v3-04 — Doku-Patches für CLAUDE.md

> **Verfahren:** §7 Regel 14 / LL-16 — CLAUDE.md wird nie direkt editiert, sondern über
> Anker + Patch-Satz, **und mit ausdrücklicher Freigabe des Users**.
>
> **Umfangslage:** Der Wächter meldet **1.461 von 1.600 Zeilen — 91 % ausgeschöpft**,
> also Warnstufe, keine gerissene Grenze. Deshalb sind die Patches so geschnitten, dass
> die **Erzählzone netto schrumpft** (P1 + P2 + P3 zusammen **−13 Zeilen**), während der
> Regelanteil wächst (P4 + P5, **+27 Zeilen** in §6/§8). Beides zieht in die richtige
> Richtung: Prüfung ② misst die Erzählzone, Prüfung ③ den Regelanteil.
>
> **Nummern:** letzte Stolperfalle ist **33**, letztes Register-Kürzel **LL-46** —
> die neuen sind **34** und **LL-47**, lückenlos.

---

## P1 · §9 — der Stand steht noch auf v3-02

**Warum:** Die Zeile behauptet „v3-03 ist dieser Sprint". v3-03 ist seit dem 13.09.2026
in `main` (PR #60, `962d204`), **gegen den Baum geprüft**. Dieser Sprint ist v3-04.

**Anker** (eindeutig zu prüfen):

```
**Letzter Sprint:** **v3-02** („`/mobil` — Zahlungen zuordnen ohne Ziehen", 07.09.2026)
```

**Patch-Satz** — ersetzt den Block von dort bis einschließlich `**v3-03 ist dieser Sprint.**`:

```markdown
**Letzter Sprint:** **v3-04** („Vollbild beim Navigieren", 13.09.2026) · **davor:**
v3-03 (`MB-6`, die drei Sichten), v3-02 (`/mobil` Zuordnen), v3-01 (Apple-Redesign),
v2-32 (Aufräumen), v2-31 (`M7` `KAT-4`), v2-30 (`PF-6`), v2-29 (`ZO-5`).

**Alles bis einschließlich v3-03 ist in `main`**, dazu die Nachzüge vom 07.09.2026 und
die Fixes vom 03.09.2026. Geprüft **gegen den Baum**, **nicht** gegen den PR-Status —
der beantwortet eine andere Frage. **v3-04 ist dieser Sprint** und liegt bis zur
Abnahme am iPhone als Pull Request vor.
```

---

## P2 · §9 — der Erzähl-Kasten steht auf v3-01/v3-02

**Warum:** Er erzählt zwei Sprints nach, die beide abgeschlossen und in der Historie
vollständig verzeichnet sind. Was für die **nächste** Sitzung gilt, ist v3-03 und v3-04
— und davon nur das, was ohne den Sprint gilt.

**Anker** (eindeutig zu prüfen):

```
> **v3-01 und v3-02 in vier Sätzen.**
```

**Patch-Satz** — ersetzt den gesamten Kasten bis einschließlich der Zeile
`> Prüfstrecke nach dem Nachzug vom 07.09.2026: \`test:visual\` 225 · \`test:e2e\` 243.`:

```markdown
> **`/mobil` ist vollständig und noch nicht abgenommen.** v3-03 hat die drei fehlenden
> Sichten gebaut (Übersicht · Karten · Verlauf, 8 · 6 · 5 Netzrunden je Aufbau); v3-04
> hat den Fehler behoben, der dabei durchgerutscht ist — **die App verließ beim
> Tab-Wechsel den Vollbild-Modus**, weil nie ausgesprochen war, welche Adressen zu ihr
> gehören (§6 Stolperfalle 34).
>
> **Beide Sprints haben keinen Zahlenwert bewegt**, und beide Male hat **nicht die
> Prüfstrecke** den teuersten Fund gemacht, sondern das Benutzen: 301 grüne Tests,
> darunter elf Render-Prüfungen bei exakt 430 × 932 — und der Fehler war trotzdem da.
```

---

## P3 · §9 — „Nächste Arbeit" steht noch auf v3-03

**Anker** (eindeutig zu prüfen):

```
| **Nächste Arbeit** | **v3-03: Übersicht · Karten · Verlauf auf `/mobil`**
```

**Patch-Satz** — ersetzt die Zelle:

```markdown
| **Nächste Arbeit** | **Die Abnahme von v3-04 am iPhone** — und dafür muss das alte Symbol vom Home-Bildschirm **gelöscht und neu abgelegt** werden, sonst zeigt es das alte Verhalten. Danach: das Re-Design (Paket 19) oder `ZO-7`. |
```

---

## P4 · §6 — neue Stolperfalle 34

**Warum:** eine dauerhafte Suchrichtung, die es bisher nicht gab. Sie gilt immer, nicht
nur für v3-04.

**Anker** (eindeutig zu prüfen) — die neue Ziffer wird **vor** dieser Überschrift
eingefügt:

```
### Typen neu erzeugen (nur bei Schema-Änderung)
```

**Patch-Satz** — als Nummer 34 ans Ende der Stolperfallen-Liste, vor diese Überschrift:

```markdown
34. **Wo wir nichts sagen, entscheidet die Laufzeitumgebung — plausibel und
    gelegentlich falsch.** `/mobil` erklärte seit v3-02, **dass** es im Vollbild laufen
    will (`appleWebApp.capable`), nie **welche Adressen** dazugehören: Es gab kein
    Web-App-Manifest. iOS füllte die Lücke selbst und nahm die **Startadresse**. Ein
    Tipp auf „Zuordnen" führte damit aus der App heraus in einen eingebetteten Browser
    — **obwohl gar keine Seite neu geladen wird**; die Zugehörigkeit wird auch bei
    reiner Client-Navigation geprüft.
    **Kein Wächter dieses Projekts fängt das.** 301 grüne Tests, darunter elf
    Render-Prüfungen bei exakt 430 × 932. Playwright läuft in Chromium und kennt weder
    den Vollbild-Modus noch diese Prüfung. **Jede Zahl war richtig und jede Seite
    rendert korrekt** — die App war nur nicht mehr die App.
    **Die Suchrichtung ist neu.** Die fünf Gestalten von LL-26 (Stolperfalle 16) sitzen
    alle in etwas, das **da ist**: eine Menge zu kurz, eine Regel zweimal formuliert,
    ein Vergleich zu eng, ein Zeitbezug fehlt, der falsche Teil gezeigt. Diese sitzt in
    etwas, das **gar nicht existiert** — und wonach man deshalb nicht greppt.
    **Frage: Verlässt sich die Umgebung auf eine Angabe, die wir nie gemacht haben?**
    **Und die Gegenprobe kostet nichts:** Beim Suchen war der erste Verdacht ein harter
    Seitenwechsel. Eine in die Seite geschriebene Variable überlebte **alle vier**
    Tab-Wechsel bei 0 Ladeereignissen — der Verdacht war damit in zwei Minuten erledigt,
    und die Suche drehte sich um.
    **Verwandt mit LL-30**, aber schärfer: Dort lebt ein Wert außerhalb des Repos und
    ist deshalb unsichtbar; hier gibt es ihn **gar nicht**, und die Umgebung setzt
    stillschweigend einen eigenen ein. (v3-04, LL-47)
```

---

## P5 · §8 — Register-Eintrag LL-47

**Anker** (eindeutig zu prüfen):

```
| LL-46 | Eine **View läuft mit den Rechten ihres Eigentümers**
```

**Patch-Satz** — neue Zeile **nach** der LL-46-Zeile:

```markdown
| LL-47 | **Wo wir nichts sagen, entscheidet die Laufzeitumgebung** — ohne Manifest wählte iOS selbst, welche Adressen zur App gehören, und jeder Tab-Wechsel verließ den Vollbild-Modus. Die sechste Gestalt von LL-26, aber die erste, die in einer **fehlenden** Angabe sitzt statt in einer zu engen | §6 Stolperfalle 34 | v3-04 (`MB-7`) |
```

---

## Was ausdrücklich NICHT geändert wird

- **§6 Stolperfalle 16** bekommt **keine** sechste Zeile. Die Tabelle dort sammelt
  Gestalten **einer** Suchrichtung („etwas ist da, aber zu eng"). Die neue Falle kehrt
  die Richtung um; sie in dieselbe Tabelle zu schieben, würde beide unschärfer machen.
- **§2 (Tech-Stack)** bleibt unberührt. Das Manifest ist keine Stack-Entscheidung.
- **Die drei Prüfanker, die Messregel und die Momentaufnahme** in §9 bleiben
  unangetastet.
- **Die Design-Doku bekommt keinen Patch.** Das Home-Bildschirm-Symbol erscheint
  nirgends in der App; es gehört in den Design-Record und ins Manifest, nicht in einen §
  der Bibel. Begründung im Record vom 13.09.2026, §5.
