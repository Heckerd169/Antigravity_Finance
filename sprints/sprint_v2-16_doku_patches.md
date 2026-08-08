# Doku-Patches — Sprint v2-16

> **Verfahren:** LL-16 / §7 Regel 14 — Anker + Patch-Satz je Stelle, keine direkte
> Bearbeitung der Bibeln. Anwendung durch den Subagenten `docs-maintainer`.
>
> **Betroffen:** ausschließlich die **Design-Doku** (`antigravity_finance_design_dokument.md`).
> Die **Schema-Doku bleibt unberührt** — v2-16 hat die Datenbank nicht angefasst; die
> einzige neu gelesene Spalte (`fragments.counterparty_iban`) existiert seit Sprint 9
> und ist dort bereits dokumentiert.
>
> **CLAUDE.md steht am Ende als Vorschlag** und wird **nicht** mit angewendet —
> §7 Regel 14 verlangt dafür die ausdrückliche Freigabe des Users.
>
> **Versions-Bump:** 3.3.1 → **3.4.0**. Minor, nicht Patch: Es kommt ein neuer
> Copy-Block (§12.10) hinzu, und in §8/§11 wechselt eine Regel von „entschieden,
> Umsetzung steht aus" auf „gilt".
>
> **Angewendet am 07.08.2026**, P1–P12, alle Anker vor der Anwendung einzeln auf
> Eindeutigkeit geprüft. Vier Konsistenzprüfungen bestanden: Version 3.4.0 im Header ·
> Changelog v3.4.0 vor v3.3.1 (jüngster zuerst) · §12.10 innerhalb von §12, vor der
> Trennlinie zu §13 · „Konsequenz-Anzeige — Held-Zeile" genau einmal.

---

## P1 · Header — Version und Status

**Anker** (Zeilen 3–4):

```
**Version:** 3.3.1 (V2 · Sprint v2-15 — Liquidität: Ausführungsdetails)
**Status:** Freigegeben — Schema-Doku v3.4.4; V2-Patches bis Sprint v2-15 eingespielt (`LQ-1` · `LQ-2` gebaut); `RM-2` · `PA-1` weiterhin entschieden, Umsetzung steht aus
```

**Patch-Satz:**

```
**Version:** 3.4.0 (V2 · Sprint v2-16 — Schaufenster-Popup und Konsequenz-Anzeige)
**Status:** Freigegeben — Schema-Doku v3.4.4; V2-Patches bis Sprint v2-16 eingespielt (`LQ-1` · `LQ-2` · `RM-2` · `PA-1` gebaut). Aus der Runde vom 06.08.2026 ist damit **alles umgesetzt**.
```

---

## P2 · Changelog — neuer Eintrag

**Anker:** die Zeile, die mit `> **Changelog v3.3.1` beginnt (jüngster Eintrag).

**Patch-Satz:** **davor** einfügen:

```
> **Changelog v3.4.0 (07.08.2026, Sprint v2-16 · `RM-2` + `PA-1`):** §8 — die
> Klick-Sperre auf zugeordneten Fragmenten und Überträgen ist **gebaut**, nicht mehr
> nur entschieden; ergänzt um die *dritte* Wirkung derselben CSS-Zeile (Hover). §11 —
> Schaufenster-Popup um vier im Record offen gebliebene Punkte vervollständigt
> (IBAN **verkürzt** · KI-Vorschlag **mit** Prozentwert · „Umschichtung" als eigenes
> Wort · „automatisch erkannt" bei `AUTO_ABSORBED`). §10 — Konsequenz-Anzeige um den
> **umgekehrten** Fall (Anteil sinkt) und die **Rundungs-Regel** ergänzt; Anmerkung zur
> Breite. §12 — neuer Block **§12.10** (Copy des Schaufenster-Popups), §12.7 um die
> gespiegelten Zeilen erweitert. Belege: `sprints/sprint_v2-16_review.md`,
> `V2/design_direktor_2026-08-06_liquiditaet_fragment_split.md` §3/§4.
>
```

---

## P3 · §8 — die Klickbarkeits-Regel gilt jetzt

**Anker** (Ende des Abschnitts „Klickbarkeit des Stacks"):

```
  Entscheidung vom 06.08.2026, **Umsetzung steht aus**. Beleg: `V2/design_direktor_2026-08-06_liquiditaet_fragment_split.md` §3.
```

**Patch-Satz:**

```
  - Die **Hover- und Active-Rückmeldung**: Sie folgte bis v2-16 ebenfalls aus
    `pointer-events: none` und braucht seither eine eigene Regel. Ohne sie spränge die
    Deckkraft beim Überfahren auf `0.92` — die beiden Werte oben wären damit faktisch
    aufgehoben, obwohl sie hier als unberührt festgeschrieben sind. Die einzige neue
    Rückmeldung ist der **Zeiger-Cursor**.

  Entschieden am 06.08.2026, **gebaut in Sprint v2-16 (07.08.2026)**. Belege:
  `V2/design_direktor_2026-08-06_liquiditaet_fragment_split.md` §3 und
  `sprints/sprint_v2-16_review.md` §1/§5.1.
```

> **Hinweis an den `docs-maintainer`:** Die drei Spiegelstriche darüber
> (Daten-Invariante · Drag-Sperre · Deckkraft-Werte) bleiben **unverändert** stehen;
> der neue Spiegelstrich kommt als **vierter** hinzu, direkt vor dem Schlusssatz.

---

## P4 · §8 — die beiden Verweis-Zeilen im Fragment-Stack

**Anker A:**

```
- Zugeordnete Fragmente: `opacity: 0.22` · ~~`pointer-events: none`~~ — **aufgehoben (06.08.2026, `RM-2`)**, siehe „Klickbarkeit des Stacks" unten. Die Deckkraft bleibt unverändert.
```

**Patch-Satz A:**

```
- Zugeordnete Fragmente: `opacity: 0.22` · ~~`pointer-events: none`~~ — **aufgehoben (06.08.2026, `RM-2`; gebaut v2-16)**, siehe „Klickbarkeit des Stacks" unten. Die Deckkraft bleibt unverändert — auch im Hover.
```

**Anker B:** im Absatz „Status `INTERNAL_TRANSFER` (Sprint 9)" die Wortfolge

```
~~`pointer-events: none`~~ ist mit `RM-2` **aufgehoben** (06.08.2026, siehe „Klickbarkeit des Stacks" unten)
```

**Patch-Satz B:**

```
~~`pointer-events: none`~~ ist mit `RM-2` **aufgehoben** (06.08.2026, gebaut v2-16 — siehe „Klickbarkeit des Stacks" unten)
```

---

## P5 · §11 — die Drag-Tabelle der Fragment-Karte

**Anker** (der Absatz unter der Drag-Tabelle):

```
**Zur Zeile „Zugeordnet" (06.08.2026, `RM-2`):** `pointer-events: none` sperrte bisher **Klick und Drag in einem**.
```

**Patch-Satz** — nur der Satzanfang ändert sich, der Rest des Absatzes bleibt:

```
**Zur Zeile „Zugeordnet" (06.08.2026, `RM-2`; gebaut in v2-16):** `pointer-events: none` sperrte **dreierlei in einem** — Klick, Drag und die Hover-Rückmeldung.
```

**Zusätzlich** am Ende desselben Absatzes anhängen:

```
 Und die **Hover-/Active-Rückmeldung** braucht seit v2-16 ebenfalls eine eigene Regel, damit `0.22` und `0.45` auch beim Überfahren gelten.
```

---

## P6 · §11 — Schaufenster-Popup vervollständigen

**Anker:**

```
**Nicht im Popup:** Duplikat-Hash und Import-Zeitpunkt. Beides ist Maschinerie und beantwortet keine Frage, die man beim Klicken hatte.
```

**Patch-Satz** — **danach** einfügen:

```

**Die vier Randfälle (07.08.2026, Rolle `design-direktor`).** Der Record vom 06.08.
führte sie unter „Was NICHT entschieden wurde"; sie sind vor dem Bau in v2-16 geklärt
worden.

| Frage | Entscheidung | Grund |
|---|---|---|
| **IBAN** des Gegenkontos | **verkürzt**: `DE02 1203 ···· 7291` — Anfang und letzte vier Stellen | Die Frage beim Klick lautet „welches meiner Konten war das?", nicht „wie lautet die Nummer?". Die vollen 22 Zeichen wären der längste Eintrag eines Popups, das sonst aus ganzen Sätzen besteht. Werte unter zwölf Zeichen bleiben unverändert stehen. |
| **KI-Vorschlag** | **mit** Prozentwert: `Miete · 91 %` | Das Popup ist der Ort für Details — es ist die Gegenleistung dafür, dass die Karte nichts mehr zeigt. Die Kästchen mussten wegen eines **Umbruch**-Problems von der Karte (`BF-1`), nicht wegen der Zahl. Und ein Vorschlag ohne Sicherheitsangabe wirkt bestimmter, als er ist. |
| **`ASSET_REALLOCATION`** | eigene Kopfzeile **`Umschichtung`** statt `Übertrag`, dazu der Hinweis `Von dir als Umschichtung markiert — zählt nicht in die Sparrate` | Eine Umschichtung hat der User **selbst** markiert, ein `INTERNAL_TRANSFER` wurde beim Import erkannt. Zwei verschiedene Sachverhalte bekommen zwei verschiedene Wörter. |
| **`AUTO_ABSORBED`** | dieselbe Zeile wie bei `ASSIGNED`, darunter **`automatisch erkannt`** | Diese Zuordnung ab 95 % Konfidenz hat der User nie getroffen — das Popup ist der einzige Ort, an dem er davon erfährt (Ehrlichkeit vor Beruhigung). |

**Fehlt die IBAN** (im Bestand 109 von 378 Überträgen), entfällt nur die
Gegenkonto-Zeile — der Hinweissatz bleibt. Er trägt die eigentliche Aussage, nicht die
Nummer (LL-20 sinngemäß: der fehlende **Wert** entfällt, die Aussage nicht).

**Zur Hauptzeile bei drei Teilen** (Cortal: `Sender | Buchungstext | Zweck`): Teil 1
führt als Empfänger, der **Rest bleibt zusammen** und wird mit einem Mittelpunkt
verbunden — §11 verlangt den Zweck *ungekürzt*, es darf also nichts wegfallen. Ist der
erste Teil leer, fällt die Hauptzeile auf den Rohtext zurück; eine leere Hauptzeile
machte das Popup kopflos.
```

---

## P7 · §11 — Portal-Hinweis ergänzen

**Anker:**

```
**Ort und Schließen:** Das Popup öffnet **zentriert per React-Portal** (§7, `RM-4`) und hat einen **Escape-Handler**.
```

**Patch-Satz:**

```
**Ort und Schließen:** Das Popup öffnet **zentriert per React-Portal** (§7, `RM-4`) und hat einen **Escape-Handler** — anders als das Einkommens-Popup, das seinen erst mit v2-16 bekommen hat.

> **Falle beim Portal (v2-16):** Über `createPortal` nach `document.body` vererben nur
> Custom-Properties von `:root` (`tokens.css`). Alles, was auf einer Komponente
> definiert ist — etwa `--frag-amount-pos` auf `.interactionZone` —, kommt dort
> **nicht** an: Die Farbe fehlt einfach, ohne Fehler und ohne Warnung. Overlay-Styles
> lesen deshalb `:root`-Tokens oder kodieren den Wert hart (so lösen es
> `.overlayBackdrop` und `.overlayModal` seit Sprint 5). Das berührt sich mit LL-6, ist
> aber ein anderer Mechanismus: LL-6 handelt vom **Bezugsrahmen** und der **DOM-Nähe**,
> dies von der **Vererbung**.
```

---

## P8 · §10 — der umgekehrte Fall und die Rundungs-Regel

**Anker:**

```
**Ein Knopf: `Schließen`.** „Abbrechen" wäre sinnlos — es gibt nichts mehr abzubrechen; „Übernehmen" ist bereits geschehen.
```

**Patch-Satz** — **danach** einfügen:

```

**Der umgekehrte Fall — der Anteil sinkt (07.08.2026).** Sinkt das eigene Brutto oder
steigt das des Partners stärker, wird der eigene Anteil kleiner. Die Anzeige ist dann
**gespiegelt**: gleicher Aufbau, drei Richtungswörter drehen — `Dein Anteil sinkt` ·
*„**weniger** pro Monat …"* · *„Die Sparrate **steigt** um denselben Betrag."* Die
Zahl wird **türkis** statt rot. Das ist keine neue Farbe: Rot heißt hier wie überall
Belastung, Türkis Entlastung.

**Rundung — die Entscheidung ist zweigeteilt (LL-24).** Die drei Spalten lassen sich
nicht gleichzeitig zum Aufgehen bringen, weil die Differenz zweier gerundeter Zahlen
nicht die gerundete Differenz ist. Verbindlich:

- **`Bisher` und `Künftig`** summieren die **gerundeten** Zeilenwerte. Wer die Spalte
  nachaddiert, bekommt die Summe heraus, die darunter steht (`1.163,62`, nicht
  `1.163,63`).
- Die **Held-Zahl** summiert **ungerundet** und rundet erst am Ende: `+18,98 €` — und
  ist zugleich die Differenz der beiden Spaltensummen, die Summenzeile bleibt also in
  sich stimmig.

Übrig bleibt, dass die **Diff.-Spalte** sich fürs Auge auf `18,97` addiert. Das ist die
unauffälligste der drei möglichen Abweichungen und bewusst gewählt. Anker-Wirkung hat
das keine — hier wird nichts persistiert, und die Sparrate kommt unverändert aus
`calculate_sparrate_for_month`.

**Der `Schließen`-Knopf ist neutral gestaltet**, wie „Abbrechen". Das Entwurfsbild
zeichnete ihn gold; Gold ist in der schmalen Palette der **Vorjahres-Linie**
vorbehalten (§9 `B6`).
```

---

## P9 · §10 — Anmerkung zur Breite

**Anker:**

```
**Breite 400 px in beiden Zuständen** — auch im Eingabe-Zustand, damit das Overlay beim Übernehmen nicht unter der Hand wächst.
```

**Patch-Satz** — an das Ende **desselben Absatzes** anhängen (nach dem RM-4-Zitat):

```
 **Anmerkung zur Herkunft der Zahl (v2-16):** Der Entscheidungs-Record beschreibt den Schritt als *„340 → 400 px, das Popup wird breiter"*. Der echte Ausgangswert war jedoch **480 px** — das Popup wird durch die Festlegung also **schmaler**. An der Entscheidung ändert das nichts (400 px sind normativ), wohl aber an ihrer Begründung: Die Breite ist hier kein Dichte-Zuwachs, sondern eine Verengung.
```

---

## P10 · §12 — neuer Copy-Block §12.10

**Anker:**

```
### 12.9 Liquidität
```

**Patch-Satz** — der Block **§12.10 nach der Tabelle von §12.9** einfügen, also
unmittelbar vor der Zeile `---`, die §12 beendet:

```

### 12.10 Schaufenster-Popup (Fragment)

| Kontext | Text |
|---|---|
| Kopfzeile — normale Buchung | `Buchung · [Datum]` |
| Kopfzeile — Übertrag | `Übertrag · [Datum]` |
| Kopfzeile — Umschichtung | `Umschichtung · [Datum]` |
| Zeile — unzugeordnet | `Status` / `Nicht zugeordnet` |
| Zeile — zugeordnet | `Zugeordnet` / `[Karten-Name]` |
| Zusatz — automatisch zugeordnet | `automatisch erkannt` |
| Zeile — Zuordnungs-Monat | `Im Monat` / `[Monat] [Jahr]` |
| Zeile — Gegenkonto | `Gegenkonto` / `[IBAN verkürzt]` |
| Hinweis — Übertrag | `Eigenes Konto — zählt nicht in die Sparrate` |
| Hinweis — Umschichtung | `Von dir als Umschichtung markiert — zählt nicht in die Sparrate` |
| Zeile — KI-Vorschlag | `Vorschlag` / `[Karten-Name] · [N] %` |
```

---

## P11 · §12.7 — Copy des umgekehrten Falls

**Anker:**

```
| Konsequenz-Anzeige — Held-Zeile | `+[N] € mehr pro Monat für [N] gemeinsame Posten` |
```

**Patch-Satz** — die Zeile **ersetzen** durch:

```
| Konsequenz-Anzeige — Titel | `Dein Anteil steigt` bzw. `Dein Anteil sinkt` |
| Konsequenz-Anzeige — Untertitel | `Split [N] % → [N] % · ab [Monat] [Jahr]` |
| Konsequenz-Anzeige — Held-Zeile | `+[N] € mehr pro Monat für [N] gemeinsame Posten` |
| Konsequenz-Anzeige — Held-Zeile, umgekehrt | `−[N] € weniger pro Monat für [N] gemeinsame Posten` |
| Konsequenz-Anzeige — Folgesatz | `Die Sparrate sinkt um denselben Betrag.` bzw. `… steigt …` |
| Konsequenz-Anzeige — Summenzeile | `Zusammen` |
```

---

## P12 · §12.7 — Fußnote zur Zahlwort-Schreibweise

> **Nachgereicht.** Dieser Absatz stand zunächst als Blockquote unter P11 und war
> dort **mehrdeutig**: Er sah aus wie die Anweisungen an den `docs-maintainer` bei P3
> und P10 und wurde folgerichtig als solche gelesen, nicht als Dokumenttext. Der
> Agent hat die Stelle von sich aus zurückgemeldet, statt sie stillschweigend zu
> entscheiden — hier als eigene Patch-Stelle nachgezogen.
>
> **Lehre für künftige Patch-Dateien:** Anweisungen an den Agenten und einzufügender
> Text dürfen nicht dieselbe Auszeichnung tragen. Text gehört in den Codeblock,
> Anweisungen bleiben außerhalb.

**Anker** — die **tatsächlich letzte** Zeile der §12.7-Tabelle:

```
| Konsequenz-Anzeige — Abschluss-Button | `Schließen` |
```

> **Korrigierter Anker.** Der ursprüngliche Auftrag nannte
> `| Konsequenz-Anzeige — Summenzeile | `Zusammen` |`. Der war zwar **eindeutig**, aber
> **nicht die letzte Tabellenzeile** — danach folgen noch `Spaltenköpfe` und
> `Abschluss-Button` aus dem Altbestand. Eine Einfügung dort hätte den Absatz mitten in
> die Markdown-Tabelle gesetzt und ihre letzten zwei Zeilen aus der Tabellenstruktur
> herausgebrochen (eine Tabelle endet bei der ersten Nicht-Tabellenzeile).
>
> Der `docs-maintainer` hat das erkannt, die **Ortsangabe** („nach der Tabelle, vor
> §12.8") über den **wörtlichen Anker** gestellt und zurückgemeldet. Richtig so — und
> ein Beleg dafür, dass die Eindeutigkeitsprüfung aus §7 Regel 14 allein nicht reicht:
> Ein Anker kann eindeutig **und** an der falschen Stelle sein.

**Patch-Satz** — nach der Tabelle von §12.7, vor der Überschrift `### 12.8`:

```

> **Zur Postenzahl im Fließsatz:** Sie steht als **Zahlwort** („vier gemeinsame
> Posten"), ab dreizehn als Ziffer. Bei genau einem Posten lautet die Wendung
> `für einen gemeinsamen Posten`.
```

---

## VORSCHLAG (nicht anwenden) · CLAUDE.md

§7 Regel 14: Änderungen an dieser Datei brauchen die **ausdrückliche Freigabe** des
Users. Die folgenden drei Stellen werden deshalb **nur vorgeschlagen**.

### V1 · §9 — Sprint-Stand

`v2-16` als letzten Sprint eintragen (`RM-2` + `PA-1`, kein Datenbank-Eingriff, Anker
in allen zwölf Monaten unbewegt). Design-Doku-Version auf **v3.4.0**.
Roadmap-Stand: **11 offene Pakete · 36 offen · 37 erledigt**, Paket 2 abgeschlossen.

**Zu streichen** ist der Satz am Ende von §9:

```
**§6 bleibt offener Altbestand:** Das Einkommens-Popup hat als einziges von acht
Overlays keinen Escape-Handler — Bauauftrag für den Sprint, der das Popup anfasst.
```

Er ist mit v2-16 erledigt.

### V2 · §6 — neue Stolperfalle 12

```
12. **Ein Portal-Kind erbt keine Custom-Properties eines Zwischen-Elements.**
    Über `createPortal` nach `document.body` vererben nur Properties von `:root`
    (`tokens.css`). Alles, was auf einer Komponente definiert ist — etwa
    `--frag-amount-pos` auf `.interactionZone` —, kommt dort **nicht** an: Die Farbe
    fehlt einfach, ohne Fehler und ohne Warnung; `tsc`, Lint und Build melden nichts.
    Overlay-Styles lesen deshalb `:root`-Tokens oder kodieren den Wert hart (so lösen
    es `.overlayBackdrop` und `.overlayModal` seit Sprint 5). Berührt sich mit LL-6,
    ist aber ein anderer Mechanismus: LL-6 handelt vom **Bezugsrahmen** und der
    **DOM-Nähe**, dies von der **Vererbung**. (v2-16)
```

### V3 · Fähigkeit `sprint-abschluss` — veraltete Erwartung

Sie nennt „Pixel-Checks **12/12** (9 Ring-Subzeile + 3 §9-Pixel)". Tatsächlich waren es
vor v2-16 bereits **25** und danach **48**. Eine Erwartung, die zwei Sprints
hinterherhinkt, wird gewohnheitsmäßig ignoriert — dasselbe Argument, mit dem in §9 die
alte flache Anker-Tabelle entfernt wurde.

**Vorschlag:** die feste Zahl durch „**alle grün**, Gesamtzahl im Review notieren"
ersetzen. Dann veraltet sie nicht mehr.

---

*Doku-Patches · Sprint v2-16 · 07. August 2026*
