# Wie diese Seiten zum Design-Projekt kommen

> Diese Datei ist **nicht** Teil des veröffentlichten Bündels — sie beschreibt nur
> den Arbeitsweg. Veröffentlicht werden `README.md`, die HTML-Seiten und die beiden
> Stylesheets.

## Was hier liegt — Stand nach v3-01 (06.09.2026)

| | |
|---|---|
| `styles.css` | **die Tokens.** Alle Seiten binden sie ein, statt Werte abzuschreiben |
| `doc.css` · `karte.css` | Chrome der Seiten und das Kartenbauteil |
| `00-was-aendert-sich.html` | die **sieben Regeln** von v3, jede mit dem Zustand von vorher daneben |
| `uebergabe.html` | die Zuordnung alt → neu, Selektor für Selektor |
| `foundations/` | Farben, Typografie |
| `komponenten/` | **neun** Seiten: Karten · Kategorien · Ring · Welle · Verlauf · Header · Overlays · Interaktionszone · Einkommen |
| `entwuerfe/` | ältere Einzelentwürfe, nicht Teil des Bündels |

> **Seit v3-01 sind alle sieben sichtbaren Komponenten der Design-Doku bebildert**
> (§5 Ring · §6 Header · §7 Karten · §8 Zone · §9 Welle · §10 Einkommen · §11
> Import/Schaufenster). Vorher waren es drei — das war Befund `RD-1`, und er ist der
> Grund, warum das Re-Design mit dieser Arbeit anfangen musste und nicht mit dem
> Gestalten.

> ### ⚠️ `styles.css` ist eine ZWEITE Kopie der Tokens — das ist bekannt und offen
>
> Die Seiten binden `styles.css` ein, statt Werte hart hinzuschreiben; das war der
> Kern von Befund `RD-2` und ist damit halb behoben. **Die andere Hälfte steht noch:**
> `design-system/styles.css` ist eine Abschrift von `src/styles/tokens.css`, keine
> Verbindung dorthin. Ändert jemand ein Token im Code, zeigen diese Seiten still den
> alten Stand.
>
> **Genau das ist in v3-01 an einer anderen Stelle passiert** — `draw.ts` spiegelte
> die Farben ebenfalls, und die Goldlinie blieb bei `.55`, während das Token auf `.75`
> ging. Dieselbe Fehlerklasse, nur hier noch nicht behoben. `RD-2` bleibt offen.

## Nach jedem Sprint, der die Formensprache berührt

**Zuerst prüfen: Hat sich an Tokens oder Komponenten etwas geändert?** Wenn ja,
gehören die Seiten mitgezogen — sonst beurteilt der Design-Direktor beim nächsten Mal
Bilder, die es so nicht mehr gibt. `styles.css` ist dabei die erste Datei, nicht die
letzte.

> **Und die Drei-Varianten-Regel:** Standen für eine Entscheidung mehrere Entwürfe
> nebeneinander, bleibt **nach dem Bau nur der Beschluss** stehen — mit seiner
> Begründung und den verworfenen Alternativen als Text, nicht als Bild. So geschehen
> auf `komponenten/karten.html` (Varianten B und C, entfernt am 06.09.2026). Ein
> Entwurf, der nicht gebaut wurde, sieht ein Jahr später aus wie ein Ist-Zustand.

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
