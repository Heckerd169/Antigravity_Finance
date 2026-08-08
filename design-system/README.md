# Antigravity Finance — Design-System

Die Formensprache der App, als ansehbare Seiten statt als Beschreibung.

## Wozu das hier da ist

Der Design-Direktor ist seit dem 04.08.2026 eine **Rolle** (Fähigkeit `design-direktor`),
kein eigener Chat mehr — der Dialog läuft direkt mit dem User. Beurteilt wurden früher
**Beschreibungen**: „die Karte wird türkis, wenn sie bezahlt ist". Das ist eine schlechte
Grundlage für Gestaltungs-Entscheidungen. Diese Seiten zeigen stattdessen das, was
tatsächlich auf dem Bildschirm steht.

**Der User sieht gerenderte Seiten, der Agent nicht.** Deshalb gilt: zeigen statt
beschreiben. Eine Seite hier zu ergänzen beantwortet mehr als drei Absätze Text.

## Ablage

```
design-system/
├── README.md            ← diese Datei
├── SYNC.md              ← wie die Seiten zu claude.ai/design kommen
├── foundations/         ← Farben, Typografie
├── komponenten/         ← Ring, Karten, Welle — der IST-Zustand
└── entwuerfe/           ← offene Gestaltungsfragen, je genau drei Varianten
```

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

## Entwürfe — die Drei-Varianten-Regel

*(Beschluss des Users, 06.08.2026 — ersetzt das frühere Verbot von Vorschlägen.)*

`komponenten/` und `foundations/` zeigen den **Ist-Zustand**. `entwuerfe/` zeigt, was
zur Entscheidung steht. Ideen und Vorschläge sind hier ausdrücklich **erwünscht** —
sie sind der Zweck des Ordners.

**Jede offene Gestaltungsfrage bekommt genau drei Varianten.** Nicht zwei, nicht vier.

- **Zwei** sind keine Wahl, sondern eine Ja/Nein-Falle — die zweite Variante dient
  meist nur dazu, die erste gut aussehen zu lassen.
- **Vier oder mehr** sind eine Liste zum Selbststudium. Der Design-Direktor soll eine
  Haltung haben, keinen Katalog vorlegen.
- **Drei** zwingen dazu, eine echte Gegenposition zu bauen und trotzdem zu empfehlen.

Für jede Entwurfsseite gilt:

1. **Genau drei Varianten**, sichtbar als A / B / C.
2. **Eine davon ist als Empfehlung markiert** — die Rolle empfiehlt, der User entscheidet.
3. **Zu jeder Variante steht, was sie kostet und was sie bringt.** Auch bei der
   Empfehlung; eine Variante ohne Preis ist nicht durchdacht.
4. **Eine Variante darf bewusst die schlechte sein**, wenn sie zeigt, *warum* eine
   Regel gilt. Das ist kein Füllmaterial — es ist der Beleg.
5. **Maßstäblich und im Kontext.** Eine Rangfolge-Frage lässt sich nur im ganzen
   Dashboard beurteilen, nicht am Ausschnitt.
6. **Echte Werte, echte Zahlen.** Gemessene Beträge aus der Produktiv-Datenbank statt
   Platzhalter — sonst beurteilt man ein Layout, das es so nie gibt.
7. **Jede Entwurfsseite trägt sichtbar den Hinweis „kein Ist-Zustand".**

**Lebensdauer.** Eine Entwurfsseite lebt, bis die Entscheidung gefallen und gebaut ist.
Danach wandert das Ergebnis in `komponenten/` (Ablauf: `SYNC.md`) und der Entwurf wird
gelöscht — sonst stehen irgendwann drei Varianten neben einem gebauten Zustand und
niemand weiß mehr, welche gilt. Der Beschluss-Record unter `V2/` ist das Gedächtnis,
nicht dieser Ordner.

## Gestaltungsfragen

### Entschieden in der Runde vom 06.08.2026

Beschluss-Record: `V2/design_direktor_2026-08-06_liquiditaet_fragment_split.md`.
Die Entwurfsseiten bleiben, bis der jeweilige Bau-Sprint durch ist.

| Thema | Entscheidung | Entwurf |
|---|---|---|
| `LQ-2` Ausstehend-Anzeige | Kopfzeile „Planung", rechtsbündig · `noch fällig` / `Budget frei` | ✅ **gebaut (v2-15)** — Entwurf gelöscht, Ergebnis in `komponenten/` |
| `LQ-1` Fälligkeitstag | rechter Anschlag der Statuszeile · Menüpunkt „Fällig am …" | ✅ **gebaut (v2-15)** — Entwurf gelöscht, Ergebnis in `komponenten/karten.html` |
| `RM-2` Schaufenster-Popup | Empfänger führt, Betrag rechts daneben | ✅ **gebaut (v2-16)** — Entwurf gelöscht (v2-17) |
| `PA-1` Konsequenz-Anzeige | Popup tauscht Inhalt, Summe als Held, 400 px | ✅ **gebaut (v2-16)** — Entwurf gelöscht (v2-17) |

### Entschieden in der Runde vom 07./08.08.2026

Beschluss-Record: `V2/design_direktor_2026-08-07_kategorien.md` (Teil A/B/C).

| Thema | Entscheidung | Entwurf |
|---|---|---|
| **Paket 4** Kategorien im Karussell | **Variante A** — Stapel-Kachel im Kartenformat, neutraler Ton, kein Status-Icon, linke Kante rot/türkis; Klick klappt auf; beim Ziehen öffnet sich alles | ✅ **gebaut (v2-17)** — Entwurf gelöscht, Ergebnis in `komponenten/kategorien.html` |

> **Der Ordner ist die erste Komponente, die eine Karte NACHAHMT, ohne eine zu sein.**
> Wer sie anfasst, liest vorher den Kasten „Was die Kachel bewusst NICHT hat" auf der
> Komponenten-Seite: Über jeder tappbaren Karte liegt eine unsichtbare Klickfläche, die
> „bezahlt" umschaltet und die Sparrate bewegt. Die Kachel hat sie nicht — und der Ton,
> das fehlende Icon und die Stapelkante sind das Einzige, was das sichtbar macht.

### Noch offen

1. **`M2`** — Verben und Gesten des Karten-Lebenszyklus (Beenden, Löschen, Lösen)
2. **`M5`** — Reihenfolge der Ordner untereinander. **Seit v2-17 hat die Frage einen
   Ort:** `card_categories.sort_order` ist änderbar, ohne dass eine Migration nötig
   wird. Innerhalb eines Ordners gilt weiterhin Fixkosten → Einnahmen → Budget
3. **Zwei Reste aus der Kategorien-Runde:** wie zwei gleichnamige Karten in einem
   Ordner auseinanderzuhalten sind, und ob ein Ordner kenntlich macht, dass seine Zahl
   abgeleitet ist

Erledigt und deshalb nicht mehr aufgeführt: Ring-Unterzeile bei kleinem Plan (v2-12,
`BF-2`/`E3`) · Vorschlags-Kästchen auf Fragment-Karten (v2-10, `BF-1`) ·
Haushaltsbetrag auf gemeinsamen Karten (v2-13, `BF-4`).

## Stand

Erstellt am 04. August 2026, aus `main` @ `41ca3d2` zuzüglich des Struktur-Sprints
v2-08. Zuletzt nachgezogen am **06. August 2026 nach Sprint v2-15**: Die Karten-Seite
trägt jetzt die Statuszeile mit Fälligkeitstag, und die beiden gebauten Entwürfe
(`lq1-faelligkeitstag.html`, `lq2-ausstehend.html`) sind gelöscht — so sieht es die
Drei-Varianten-Regel vor: Ein Entwurf lebt, bis die Entscheidung gebaut ist; danach ist
der Beschluss-Record das Gedächtnis, nicht der Ordner. Davor am selben Tag: Einführung
der Drei-Varianten-Regel und `entwuerfe/`, Rollen-Korrektur, offene Punkte auf den
Stand nach v2-14. Wenn sich Tokens oder Komponenten ändern, gehören diese Seiten mit
nachgezogen — sonst beurteilt der Design-Direktor wieder einen veralteten Stand.
