# Wie diese Seiten zum Design-Projekt kommen

> Diese Datei ist **nicht** Teil des veröffentlichten Bündels — sie beschreibt nur
> den Arbeitsweg. Veröffentlicht werden ausschließlich `README.md` und die fünf
> HTML-Seiten.

## Wohin

Design-System-Projekt **„Antigravity Finance"** auf `claude.ai/design`.
Projekt-Kennung: `c6c3c610-c662-49d2-933c-25c235fc263c`
Angelegt am 04.08.2026. Daneben liegen dort nur noch die beiden mitgelieferten
Vorlagen „Nocturne" und „Classical" — die haben mit diesem Projekt nichts zu tun.

## Wann nachziehen

Immer dann, wenn sich etwas an der **Formensprache** ändert, nicht bei jeder
Code-Änderung. Konkret:

- `src/styles/tokens.css` — eine Farbe, ein Schriftwert, ein neuer Token
- ein Karten-Zustand kommt dazu oder fällt weg (`cards.module.css` / `card.tsx`)
- Ring- oder Wellen-Geometrie ändert sich
- eine offene Design-Frage wird entschieden (die Seiten weisen offene Punkte aus)

Wird das versäumt, beurteilt der Design-Direktor wieder einen veralteten Stand —
und das ist genau der Zustand, den dieses Projekt beenden sollte.

## Wie

Der Ablauf läuft über das `DesignSync`-Werkzeug, in dieser Reihenfolge:

1. `list_files` auf die Projekt-Kennung — sehen, was drüben liegt.
2. Die betroffene Datei hier unter `design-system/` ändern.
3. `finalize_plan` mit den zu schreibenden Pfaden **und** `localDir` auf den
   absoluten Pfad dieses Ordners. `deletes` muss mitgegeben werden, notfalls leer.
4. `write_files` mit `localPath` je Datei — der Inhalt wird direkt von der Platte
   gelesen.
5. Nur bei **neuen** Seiten: `register_assets`, damit die Kachel in der Übersicht
   erscheint. Bestehende Seiten brauchen das nicht.

**Stolperfalle:** Jede Seite trägt in der **ersten Zeile** einen Marker
`<!-- @dsCard group="…" -->`. Fällt er weg, verliert die Seite ihre Zuordnung in
der Übersicht. Beim Bearbeiten also nie die erste Zeile abschneiden.

## Regeln für den Inhalt

- **Werte aus dem Code ziehen, nicht aus dem Gedächtnis.** Jede Seite nennt oben
  ihre Quelle im Repository. Ein Nachbau, der um zwei Prozent danebenliegt, ist
  schlimmer als keine Seite — er sieht richtig aus.
- **Keine Gestaltungs-Vorschläge.** Die Seiten zeigen, was ist. Einzige Ausnahme:
  eine offene Entscheidung darf als solche markiert danebenstehen, zusammen mit
  dem heutigen Zustand (siehe Ring-Seite, Unterzeile bei kleinem Plan).
- **Bei Widerspruch gewinnt die Design-Doku.** Diese Seiten machen sie sichtbar,
  sie ersetzen sie nicht.

## Warum dieser Ordner und nicht `public/prototypes/`

Dort liegen die alten HTML-Prototypen, und thematisch wäre es naheliegend. Aber
`public/` ist der Auslieferungsordner der App. Die Wellen-Seite zeigt **echte
Sparraten-Zahlen**; heute schützt der Middleware-Matcher zwar auch `.html`, doch
eine spätere Änderung daran würde diese Zahlen still öffentlich machen. Ein
Referenz-Ordner für den Design-Direktor gehört ohnehin nicht in die
App-Auslieferung.
