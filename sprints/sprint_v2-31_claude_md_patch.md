# CLAUDE.md-Patch v2-31 — zur Freigabe

**Sprint:** v2-31 · **Datum:** 31. August 2026
**Verfahren:** §7 Regel 14 / LL-16 — Anker + Patch-Satz, plus **ausdrückliche
Freigabe des Users**. Fähigkeit: `claude-md-pflege`.

**Umfang heute:** 1.468 Zeilen (Obergrenze 1.600). Der Patch fügt **rund 30 Zeilen
hinzu und entfernt 11** — netto etwa **+19**. Die Erzählzone bleibt gleich groß, weil
der v2-30-Kasten durch einen v2-31-Kasten ähnlicher Länge ersetzt wird. Der
**Regelanteil steigt**, weil die Ergänzung in §6 und §8 liegt.

---

## Was NICHT hierher kommt — und warum

Der Sprint hat viel bestätigt, was schon steht: LL-20 (null ≠ 0), LL-22 (Doku-Zusage
ist keine Prüfung), LL-25 (Gruppen-Rundung), LL-26 (Nachbauen), LL-29 (Netzrunden),
LL-40 (Wächter rot sehen). **Bestätigung ist kein Grund für eine neue Zeile.** Das
steht in `sprints/projekt_historie.md` beim Sprint.

Hierher kommt **eine** Sache — weil sie eine bestehende Regel an einer Stelle
begrenzt, an der man sie sonst falsch anwendet.

---

## C1 · §6 — neue Stolperfalle 31

**Anker** (letzte Zeilen der Stolperfallen-Liste, Ende von Nr. 30):

```
    **Regel:** Wer eine Erkennungs- oder Ähnlichkeitsfunktion verallgemeinert, misst
    **beides**: die neue Trefferquote **und** was die alte Fassung heute schon leistet.
    Ergänzen schlägt ersetzen, solange die alte Stufe etwas trägt, das die neue nicht
    erreicht. Ergänzt §7 Regel 25, die nur Richtig und Falsch verlangt — hier kommt die
    **Reichweite** als dritte Achse dazu. (v2-29, LL-41)
```

> ⚠️ **Vor der Anwendung prüfen:** Dieser Anker steht am Ende von Nr. 30. Ist zwischen
> v2-30 und heute eine Nr. 31 dazugekommen, wandert der Patch ans Ende der Liste und
> die Nummer wird angepasst.

**Patch-Satz — wird DANACH eingefügt:**

```markdown
31. **Ein Rundungs-Ausgleich gehört nur dorthin, wo die Summe der Gruppen SICHTBAR
    ist — an jeder anderen Stelle ist er eine Verfälschung.** Und beide Stellen sehen
    im Code gleich aus.
    `get_category_amounts_for_month` **muss** den Rest ausgleichen: Anker 1 verlangt
    `Σ Ordner == Sparrate`, und die Ordner-Spalte steht sichtbar im Karussell. Die
    **Plan**-Seite derselben Gruppierung **darf** es nicht — dort liefert dieselbe
    Funktion `planned` hart als `NULL`, es gibt also gar keine Summe, die stimmen
    müsste. Ein Ausgleich verschöbe den Plan **eines** Ordners um fremde Rundungsreste,
    damit eine Zahl stimmt, die niemand sieht.
    **Gemessen in v2-31:** Ungerundet über alle Karten summiert ergibt der Plan exakt
    die Plan-Sparrate (0,00 € in 24/24). Summiert man die **je Ordner gerundeten**
    Werte, weicht das Ergebnis in **12 von 24** Monaten um ±0,01 € ab — sauber
    gerechnet innerhalb jeder Gruppe, und trotzdem daneben.
    **Wer LL-25 kennt, neigt dazu, den Ausgleich überall einzubauen, wo gruppiert
    wird.** Die Frage ist aber nicht *„wird gruppiert?"*, sondern **„wird die Summe der
    Gruppen irgendwo angezeigt?"** Ohne diesen Ort ist der Ausgleich keine Korrektur.
    **Das ist nicht die Wiederholung von LL-25, sondern seine Grenze:** LL-25 sagt,
    wann man ausgleichen **muss**; diese Falle sagt, wann man es **lassen** muss.
    Erst beide zusammen ergeben eine benutzbare Regel. (v2-31, LL-43)
```

---

## C2 · §8 — Registereintrag LL-43

**Anker** (letzte Zeile der LL-Tabelle):

```
| LL-42 |
```

> Die Zeile ist lang; als Anker genügt der Zeilenanfang, er ist eindeutig. Der
> Patch-Satz wird **nach** der vollständigen LL-42-Zeile eingefügt.

**Patch-Satz:**

```
| LL-43 | Ein **Rundungs-Ausgleich gehört nur dorthin, wo die Summe der Gruppen sichtbar ist** — die Frage ist nicht „wird gruppiert?", sondern „wird die Summe irgendwo angezeigt?". Ohne diesen Ort ist er keine Korrektur, sondern eine Verfälschung. **Die Grenze von LL-25**, nicht seine Wiederholung | §6 Stolperfalle 31 | v2-31 |
```

---

## C3 · §9 — Sprint-Kopf

**Anker:**

```
**Letzter Sprint:** **v2-30** („Der Import passt wieder in die Zeit" — `PF-6`,
27.08.2026) · **davor:** v2-29 (`ZO-5`), v2-28 (`DA-3` `ZO-4` `NAV-1`),
v2-27 (`DA-1` `ZO-3`), v2-26 (`KJ-6`…`KJ-9`), v2-25 (`KJ-1` `KJ-2` `KJ-3`),
v2-24 (`PF-1` `PF-2` `PF-4`), v2-23 (`ZU-1`), v2-22 (`B2-R` `ZO-2`).
**Alles bis einschließlich v2-30 ist in `main`** — PR #48 gemergt, Browser-Smoke
bestanden, gegen den Baum geprüft (`git ls-tree origin/main`), **nicht** gegen den
PR-Status.
```

**Patch-Satz:**

```
**Letzter Sprint:** **v2-31** („Verlauf je Karte und je Ordner" — `M7` `KAT-4`,
31.08.2026) · **davor:** v2-30 (`PF-6`), v2-29 (`ZO-5`), v2-28 (`DA-3` `ZO-4`
`NAV-1`), v2-27 (`DA-1` `ZO-3`), v2-26 (`KJ-6`…`KJ-9`), v2-25 (`KJ-1` `KJ-2` `KJ-3`),
v2-24 (`PF-1` `PF-2` `PF-4`).
**Alles bis einschließlich v2-30 ist in `main`** — PR #48 gemergt, Browser-Smoke
bestanden, gegen den Baum geprüft (`git ls-tree origin/main`), **nicht** gegen den
PR-Status. **v2-31 liegt als Pull Request vor und ist NICHT gemergt.**
```

---

## C4 · §9 — den v2-30-Kasten durch v2-31 ersetzen

> **Ersetzen, nicht ergänzen.** Sonst wächst die Erzählzone bei jedem Sprint um einen
> Kasten — genau die Bewegung, die zwischen v2-08 und v2-28 zu 443 Zeilen geführt hat.
> Was v2-30 gebracht hat, steht vollständig in der Historie; die eine Zahl daraus, die
> **immer** gilt (das 8-Sekunden-Limit), steht bereits in §6 Stolperfalle 29.

**Anker — der vollständige Kasten:**

```
> **v2-30 in drei Sätzen.** Ein Import von 17 neuen Zahlungen fiel von **23.938 ms auf
> 1.357 ms**. Das `statement_timeout` der Rolle `authenticated` liegt bei **8 s** — der
> Import lief also strukturell in einen Fehler, sobald mehr als **vier** Zahlungen neu
> waren, und Duplikate überspringen die teure Rechnung, weshalb eine alte Datei
> weiterhin durchging und **kein Wächter** anschlug.
>
> **Die Ursache war kein N+1, sondern ein Ausdrucks-Index, der durch Inlining nie
> griff** (§6 Stolperfalle 29 ③) — während `pg_stat_user_indexes` **88.107 Scans**
> auswies. **Kein Zahlenwert bewegt:** Sparrate 24/24, Anker 1 und 2 je 0
> Verletzungen. Neu offen: `PF-7` (der alte Index wird erst gelöscht, wenn sein
> Verursacher bekannt ist).
```

**Patch-Satz:**

```
> **v2-31 in drei Sätzen.** Karten und Ordner haben einen **Verlauf** bekommen: 24
> Monate Ist gegen Plan in einem zentrierten Overlay, aus dem Kontextmenü. `M7` und
> `KAT-4` zusammen — **Paket 10 ist damit vollständig**, und es war seit dem 04.08.2026
> so geschnitten, weil beide dieselbe Fläche brauchen (Befund `U5`).
>
> **Der teuerste Fund war eine Zeile der Roadmap.** Sie führte `M7` als „datenseitig
> bereits abgedeckt"; gemessen liefert `get_year_deviation_drivers` aber nur Karten,
> die **abweichen** — Netflix läuft zwölf Monate auf Plan und erschien in **keinem
> einzigen**, für Sep–Dez 2026 lieferte sie **gar nichts**. Der Auftrag hatte darauf
> aufgebaut und einen Datenbank-Eingriff ausgeschlossen (LL-22).
>
> **Kein Zahlenwert bewegt:** 24 Sparraten byte-identisch, Anker 1 in 24/24 bei 0,00 €,
> alle neun Prüfsummen unverändert. `KAT-5` wurde zugunsten von `KAT-4` aus dem Sprint
> genommen und bleibt offen.
```

---

## C5 · §9 — „Wo das Projekt gerade steht"

> ⚠️ **Diese Tabelle ist überholt, und zwar erheblich.** Sie sagt „2025: 480 offen" und
> „Nächste Arbeit: Kuratierung 2025". **Gemessen am 31.08.2026 gibt es kein einziges
> `UNASSIGNED` mehr** — weder 2025 noch 2026. Der Nutzer hat die Kuratierung
> abgeschlossen, ohne dass es irgendwo vermerkt wäre.

**Anker:**

```
| | Stand 25.08.2026 |
|---|---|
| **2026** | vollständig zugeordnet — **0** offene Zahlungen |
| **2025** | **480** offen, davon **195** mit Kartenvorschlag (v2-29: 136 → 195) |
| **Goldlinie 2025** | **21.708,77 €** — bewegt sich laufend durch Kuratierung |
| **Nächste Arbeit** | Kuratierung 2025. **Handarbeit in der App, kein Sprint.** |
| **Übungs-Datenbank** | pausiert, Anker 2.200,00 € |
```

**Patch-Satz:**

```
| | Stand 31.08.2026 |
|---|---|
| **2026** | vollständig zugeordnet — **0** offene Zahlungen |
| **2025** | **ebenfalls vollständig zugeordnet — 0 offene Zahlungen** (642 von Hand, 106 automatisch) |
| **Goldlinie 2025** | **11.442,30 €** — von 21.708,77 € gefallen, weil zugeordnete Zahlungen die Sparrate ihres Monats senken |
| **Nächste Arbeit** | **offen.** Die Kuratierung ist durch; der nächste Sprint kommt aus der Roadmap. |
| **Übungs-Datenbank** | pausiert, Anker 2.200,00 € |

> **Die Kuratierung 2025 ist abgeschlossen** — gemessen am 31.08.2026: kein einziges
> `UNASSIGNED` in beiden Jahren. Damit entfällt der Grund, aus dem es seit dem
> 13.08.2026 keine eingefrorene Sollwert-Tabelle gibt (§9, Kasten unten). **Die Tabelle
> kann zurückkommen, sobald der Nutzer es freigibt** — mit Datum daneben und dem Satz,
> dass sie nur gilt, solange nicht kuratiert wird.
```

---

## C6 · §9 — Roadmap-Zahlen

**Anker:**

```
**25.08.2026, nach v2-29**: **12 offene Pakete · 38 Themen ·
```

**Patch-Satz:**

```
**31.08.2026, nach v2-31**: **11 offene Pakete · 37 Themen ·
```

> Die Folgezeile mit `4 Hausaufgaben · 42 offen gesamt · 65 erledigt` gehört zum selben
> Satz und wird mitgepatcht auf **`4 Hausaufgaben · 41 offen gesamt · 68 erledigt`**.
> Zahlen zeilengenau ausgezählt (`V2/v2_roadmap_konsolidiert.md` §0), nicht gerechnet.

---

## C7 · §9 — Momentaufnahme

> Die Zwölf-Monats-Tabelle ist **kein Sollwert** (Warnkasten steht dort). Ihre Zahlen
> sind seit dem 25.08.2026 überholt — 2025 durch die abgeschlossene Kuratierung, 2026
> ebenfalls. **Zur Entscheidung des Users:** nachziehen (Werte liegen in
> `sprints/sprint_v2-31_anker.md` vor) oder unverändert lassen, weil sie ohnehin nur
> die Größenordnung zeigt.
>
> **Empfehlung: nachziehen.** Eine Momentaufnahme, die um mehr als **10.000 €**
> danebenliegt, zeigt keine Größenordnung mehr — sie zeigt eine falsche.

---

## Prüfung vor der Anwendung

- [ ] Jeder Anker per `grep -c` auf **genau 1** geprüft
- [ ] Stolperfallen-Nummer **31** ist frei (nach v2-30 höchste: 30)
- [ ] LL-Nummer **43** ist frei (nach v2-30 höchste: LL-42)
- [ ] Der Historie-Eintrag zu v2-31 nennt LL-43 — sonst wird
      `doku-vollstaendigkeit.spec.ts` rot
- [ ] Nach der Anwendung `pnpm test:visual` — `claude-md-umfang` und
      `doku-vollstaendigkeit` laufen mit
- [ ] **Freigabe des Users liegt vor**

---

*CLAUDE.md-Patch · Antigravity Finance · Sprint v2-31 · 31. August 2026*
