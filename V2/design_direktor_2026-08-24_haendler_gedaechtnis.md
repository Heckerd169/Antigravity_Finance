# Design-Direktor · 24. August 2026

## Der Vorschlag wird sichtbar — und zwar leise

**Anlass:** Sprint v2-29 lehrt `history_match`, eine frühere Handzuordnung am
**Händler** wiederzuerkennen statt nur am wortgleichen Text. Damit entstehen zum
ersten Mal genug Vorschläge, dass sich die Frage überhaupt lohnt: **Wo sieht der
Nutzer sie?**

Bis heute nirgends. Der Vorschlag wird seit v2-07 berechnet, seit v2-10 aber nicht
mehr gezeichnet — `SHOW_SUGGESTION_BADGES = false` in `fragment-card.tsx`. Sichtbar
ist er ausschließlich im Schaufenster-Popup, also **nachdem** man eine Zahlung
bereits angefasst hat. Das ist genau die falsche Reihenfolge: Der Vorschlag soll
helfen zu entscheiden, welche Zahlung man anfasst.

> **Dieser Record wird nachgereicht.** Die Runde lief am 24.08.2026 im Gespräch;
> die Entscheidungen standen fest, bevor v2-29 begann, aber es gab kein Papier
> dazu. Das ist der Grund, warum er das erste Artefakt dieses Sprints ist und nicht
> sein letztes — ein Beschluss, der nur im Chat steht, wird von der nächsten
> Sitzung nicht gelesen (CLAUDE.md §3).

---

## Warum das alte Kästchen nicht zurückkommt

Es wäre der bequemste Weg: eine Konstante von `false` auf `true`, fertig. Genau das
ist die Falle.

**Das Kästchen ist v2-10 an einem Zeilenumbruch gescheitert** (`BF-1`). Es saß neben
dem Betrag, durfte weder schrumpfen noch umbrechen (`flex-shrink: 0`,
`white-space: nowrap`) — also wurde der Betrag zusammengedrückt, bis das Euro-Zeichen
in die zweite Zeile rutschte. Die damalige Abhilfe war, das Kästchen wegzunehmen und
dem Betrag ein Umbruch-Verbot zu geben.

**Das Umbruch-Verbot ist geblieben, das Platzproblem auch.** Gemessen mit dem echten
Schriftstack bei **194 px** Inhaltsbreite und 6 px Abstand zwischen Betrag und
Kästchen:

| | Breite |
|---|---|
| `KI-VORSCHLAG: TANKEN` | **121,9 px** |
| davon das Präfix `KI-VORSCHLAG:` allein | **74 px** |
| freier Platz neben `−129,00 €` | **119 px** |
| `BERUFSUNFÄHIGKEIT - ALTE LEIPZIGER` | **188 px** |

**Der kürzeste denkbare Fall passt schon nicht.** „Tanken" ist der kürzeste
Kartenname im Bestand, −129,00 € ein mittlerer Betrag — und es fehlen bereits
3 px. Der längste echte Kartenname hat **105 Zeichen**.

**Es gibt keine Variante, in der alles passt.** Gekürzt wird also in jedem Fall. Die
Frage ist nur, **was** gekürzt wird:

- **neben dem Betrag** kostet es den **Betrag** — die primäre Zahl der Zeile
- **auf eigener Zeile** kostet es **Text**, und zwar das Ende eines Kartennamens,
  den der Nutzer ohnehin wiedererkennt

Damit ist die Sache entschieden, ohne dass Geschmack eine Rolle spielt.

---

## Entscheidung 1 · Eine eigene Zeile, unter der Beschreibung

Der Vorschlag steht **unter** der Beschreibung, als eigene Zeile — nicht als Kästchen
neben dem Betrag.

Die Fragment-Karte liest sich damit von oben nach unten als eine Abfolge, die immer
leiser wird: **Betrag** (was) → **Beschreibung** (woher) → **Vorschlag** (wohin
vermutlich) → **Datum** (wann). Der Vorschlag sitzt genau dort, wo die Frage
entsteht, die er beantwortet.

## Entscheidung 2 · Ghost-Ton, und zwar der schwächste im System

Farbe: `--text-ghost` (`rgba(255,255,255,.22)`). Keine Fläche, kein Rahmen, kein
Farbtopf.

**Der Grund ist nicht Zurückhaltung, sondern Wahrheit.** Ein Vorschlag ist eine
Vermutung der Maschine. Er darf nicht aussehen wie ein Zustand, den die App **weiß** —
und die Rohmasse hat für Wissen bereits eine Form: das TRANSFER-Kästchen. Ein zweites
Kästchen daneben würde Vermutung und Tatsache visuell gleichstellen.

## Entscheidung 3 · Klein, aber nicht in Großbuchstaben

Schriftgröße auf der Ebene des Datums, **kein** `text-transform: uppercase`, kein
gesperrter Zeichenabstand.

Das alte Kästchen war versal gesetzt — das ist die Formensprache von **Etiketten**
(TRANSFER), nicht von Sätzen. Der Vorschlag ist ein Halbsatz: `KI-Vorschlag: Tanken`.
Versalien würden ihn zurück in die Etiketten-Sprache zwingen und damit gegen
Entscheidung 2 arbeiten.

**Der Wortlaut selbst ist nicht neu erfunden** — er steht seit v2-07 so in der
Design-Doku §11 (`KI-Vorschlag: [Karten-Name]`). Das Präfix bleibt, weil auf einer
eigenen Zeile Platz dafür ist: Es sind die 74 px, die neben dem Betrag den Ausschlag
gaben, hier aber niemandem etwas wegnehmen.

## Entscheidung 4 · Lange Namen enden mit „…"

Eine Zeile, kein Umbruch, Kürzung durch das CSS (`text-overflow: ellipsis`) — genau
wie die Beschreibung darüber, die seit v2-10 dieselbe Behandlung bekommt.

Damit kann die Zeile die Karte nicht höher machen. Das ist die eigentliche
Zusicherung: **Die Rohmasse behält ihre Rasterhöhe**, egal wie lang ein Kartenname
ist. Der vollständige Name bleibt über das `title`-Attribut erreichbar.

## Entscheidung 5 · Bei mehrdeutigen Händlern wird NICHTS vorgeschlagen

Das ist die einzige Entscheidung dieser Runde, die nicht das Aussehen betrifft,
sondern das Schweigen — und sie ist die wichtigste.

**Gemessen an den 568 Handzuordnungen des Nutzers** (Leave-one-out, Händler = Text
vor dem ersten `|`, wie in der Runde besprochen):

| | richtig | falsch | Genauigkeit |
|---|---|---|---|
| eindeutige Händler | 149 | 18 | **89,2 %** |
| mehrdeutige Händler | 155 | 139 | **52,7 %** |

**52,7 % ist ein Münzwurf.** Ein Vorschlag, der in der Hälfte der Fälle falsch ist,
kostet mehr Zeit als er spart: Man muss ihn lesen, prüfen und verwerfen — und beim
nächsten Mal traut man auch dem richtigen nicht mehr. **Ein Werkzeug, dem man nicht
traut, benutzt man nicht.**

142 Händler sind eindeutig, 25 mehrdeutig.

> **Nachgemessen am 25.08.2026 in v2-29: 147 richtig / 17 falsch** statt 149/18 bei
> den eindeutigen, **148/151** statt 155/139 bei den mehrdeutigen. Die Abweichung
> ist keine Korrektur, sondern der Kurationsstand: Der Nutzer hat zwischen beiden
> Messungen weiter zugeordnet. **Die Aussage trägt in beiden Fassungen** — rund
> 89 % gegen rund 50 %. Wer eine dieser Zahlen zitiert, schreibt das Datum dazu
> (LL-28).

> ### ⚠️ Warum „Dominik Hecker" auf zwölf Karten liegt
>
> Bei **Überweisungen** ist der Teil vor dem `|` nicht der Händler, sondern der
> **Absender** — bei einer selbst veranlassten Überweisung also der Nutzer. Der
> Verwendungszweck steht dahinter.
>
> Solche Händler sind zwangsläufig mehrdeutig und liefern **korrekt** keinen
> Vorschlag. Das ist kein Mangel der Regel, sondern der Beleg, dass die
> Eindeutigkeitsprüfung genau das tut, wofür sie da ist.

---

## Was ausdrücklich NICHT passiert

**Die sechs Badge-Farbtöne aus v2-07 werden weder benutzt noch gelöscht.**
`--badge-hue-1` … `--badge-hue-6` in `tokens.css`, `badgeHueIndex()` und die
Klassentabelle in `fragment-card.tsx` bleiben unverändert stehen.

Das ist der Beschluss vom 04.08.2026, Punkt 4 (`BF-1`), und er gilt weiter: Die
Spezifikation bleibt für eine mögliche Wiedereinschaltung erhalten. Der neue
Ghost-Ton ist eine **zweite** Darstellungsform daneben, kein Ersatz — wer die
Kästchen je zurückholen will, findet alles vor.

**Die automatische Zuordnung ab 95 % bleibt unberührt.** Sie ist keine Empfehlung,
sondern eine fertige Zuordnung, und sie zeigt kein Kästchen. Der Wert der
Wiedererkennung liegt bei **0,94** und damit bewusst darunter (`app_config`,
`confidence.history_score`): Sie schlägt vor, sie handelt nicht.

---

## Offen geblieben

**Nichts aus dieser Runde.** Was hier nicht steht, ist auch nicht entschieden — wer
in v2-29 auf eine Gestaltungsfrage stößt, die dieser Record nicht beantwortet, hält
an und fragt (CLAUDE.md §7 Regel 3).
