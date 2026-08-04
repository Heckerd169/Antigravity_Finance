# Antigravity Finance — Design-System

Die Formensprache der App, als ansehbare Seiten statt als Beschreibung.

## Wozu das hier da ist

Der Design-Direktor arbeitet in einem eigenen Chat und hat bislang **Beschreibungen**
beurteilt — „die Karte wird türkis, wenn sie bezahlt ist“. Das ist eine schlechte
Grundlage für Gestaltungs-Entscheidungen. Diese Seiten zeigen stattdessen das, was
tatsächlich auf dem Bildschirm steht.

## Woher die Werte kommen

Jede Farbe, jede Schriftgröße und jede Geometrie ist aus dem laufenden Code
übernommen, nicht aus der Erinnerung nachgebaut:

| Seite | Quelle im Repository |
|---|---|
| Farben | `src/styles/tokens.css` · Design-Doku §3 |
| Typografie | `src/styles/tokens.css` · Design-Doku §3 |
| Karten | `src/components/cards/cards.module.css` + `card.tsx` · Design-Doku §7 |
| Singularity Ring | `src/components/singularity-ring/` · Design-Doku §5 |
| Jahres-Welle | `src/components/welle/` · Design-Doku §9 |

Bei einem Widerspruch zwischen diesen Seiten und der Design-Doku gilt **die
Design-Doku**. Sie ist die Wahrheitsquelle, diese Seiten sind ihre Sichtbarmachung.

## Was hier bewusst nicht steht

Keine Ideen, keine Vorschläge, keine Varianten „wie es auch aussehen könnte“ —
mit einer Ausnahme: Wo eine Entscheidung offen ist, steht sie als solche markiert
dabei, zusammen mit dem heutigen Zustand. Aktuell betrifft das den Text unter dem
Ring bei sehr kleinem Plan (Fehler 2 vom 04.08.2026).

## Offene Punkte für den Design-Direktor

1. **Ring-Unterzeile bei kleinem Plan** — der heutige Text ist nachweislich falsch.
   Drei Fälle sind vorgeschlagen; offen ist, ob Gleichstand eine eigene Formulierung
   braucht. Siehe Seite „Singularity Ring“.
2. **Vorschlags-Kästchen auf Fragment-Karten** — entfallen laut Entscheidung vom
   04.08.2026 vollständig aus der Anzeige. Die sechs Badge-Farbtöne bleiben ungenutzt
   im Code. Die Karten-Seite zeigt bereits den Zustand danach.
3. **Verben und Gesten des Karten-Lebenszyklus** (Beenden, Löschen, Lösen) — die
   Oberfläche dazu ist ein Zwischenstand und wartet auf eine gestalterische Aussage.
4. **Kartenreihenfolge im Karussell** — heute Fixkosten, dann Einnahmen, dann Budget.
   Zu bestätigen oder zu ändern.

## Stand

Erstellt am 04. August 2026, aus `main` @ `41ca3d2` zuzüglich des Struktur-Sprints
v2-08. Wenn sich Tokens oder Komponenten ändern, gehören diese Seiten mit
nachgezogen — sonst beurteilt der Design-Direktor wieder einen veralteten Stand.
