# Befund · `/mobil` verlässt beim Navigieren den Vollbild-Modus

> **Datum:** 13. September 2026 · **Gefunden vom:** Nutzer, am iPhone
> **Betrifft:** Paket 20 (`/mobil`), neu als `MB-7`
> **Status:** Ist-Zustand mit Messung. Die Umsetzung ist Sprint **v3-04**.

---

## 1. Was passiert

Die App liegt über Teilen → „Zum Home-Bildschirm" als eigenes Symbol auf dem
Home-Bildschirm. Abgelegt wurde die Adresse **`…/mobil`**.

| Schritt | Was der Nutzer sieht |
|---|---|
| **Start** aus dem Symbol | Korrekt. Übersicht im Vollbild, keine Adresszeile, keine Browser-Knöpfe. |
| **Tipp auf „Zuordnen"** | Die App sitzt in einem **Browser-Rahmen**: oben die Adresse mit Schließen-Kreuz, unten — **unter** der Tab-Leiste — eine zweite Leiste mit Zurück, Teilen, Neuladen, Kompass. Der Vollbild-Modus ist weg. Die Zuordnen-Seite selbst rendert korrekt. |
| **Tipp auf „Übersicht"** | Der Rahmen verschwindet wieder. Der Inhalt hängt jetzt aber **rund ein Fünftel der Höhe zu tief**: über der Monatsüberschrift klafft eine leere Fläche, der Ring steht mitten im Bild statt oben. |
| **in diesem Zustand** | Die Tab-Leiste nimmt **keine Berührung** an. Erst nach einem Hochziehen der Seite geht die Navigation wieder. |

Drei Screenshots vom 13.09.2026, 18:23 Uhr, liegen beim Nutzer (Bilder bleiben lokal,
CLAUDE.md §3).

---

## 2. Was gemessen wurde

Alles read-only gegen Produktion (`antigravity-finance-sigma.vercel.app`), in derselben
Sitzung wie der Befund.

| Frage | Messung | Ergebnis |
|---|---|---|
| Ist ein Tab-Wechsel eine **echte Seiten-Navigation**? | Variable in die Seite schreiben, alle vier Tabs klicken, prüfen ob sie überlebt; dazu `load`-Ereignisse zählen | **Nein.** 0 Ladevorgänge, die Variable überlebt **jeden** der vier Wechsel. Reine Client-Navigation. |
| Tragen alle vier Seiten die Apple-Angaben? | `<meta>`-Auslese je Route | **Ja, identisch** auf allen vier: `apple-mobile-web-app-capable=yes`, `status-bar-style=black-translucent`, `viewport-fit=cover`. |
| Gibt es ein Web-App-Manifest? | Suche nach `<link rel="manifest">`, `public/`, `src/app/manifest.*` | **Nein.** Kein Verweis, `public/` war leer. |
| Wohin führt `/mobil`? | Aufruf | `/mobil/uebersicht` — **ohne** `?month=`. Die effektive Startadresse der App ist also `/mobil/uebersicht`. |
| Wechselt die Adresse die Domain? | Screenshot 2 | **Nein.** Dieselbe Produktions-Adresse. Kein Sprung auf eine fremde Origin, kein Umweg über die Anmeldeseite. |
| Wie groß ist der Versatz? | Ausmessung Screenshot 1 gegen 3 | **~115 px** — und das entspricht **Statusleiste plus Adressleiste** aus Screenshot 2. |

**Damit ist die naheliegendste Erklärung widerlegt:** Es ist *kein* harter Seitenwechsel,
bei dem Next.js auf eine volle Navigation zurückfällt. Wer dort gesucht hätte, hätte
nichts gefunden.

---

## 3. Diagnose

**Ohne Manifest entscheidet iOS selbst, welche Adressen noch „zur App" gehören — und
nimmt dafür die Startadresse.** Alles, was davon abweicht, öffnet es im eingebetteten
Browser. Das gilt **auch bei einer reinen Client-Navigation**; die App muss dafür die
Seite nicht neu laden.

Das erklärt alle drei Beobachtungen lückenlos:

| Adresse | Verhältnis zur Startadresse | Folge |
|---|---|---|
| `/mobil/uebersicht` | **ist** die Startadresse | Vollbild ✓ |
| `/mobil/zuordnen?month=…` | andere Seite | Browser-Rahmen ✗ |
| `/mobil/uebersicht?month=…` | wieder die Startadresse | Vollbild ✓ |

Die App erklärt heute nur **dass** sie im Vollbild laufen will
(`appleWebApp: { capable: true }` in `src/app/mobil/layout.tsx`, seit v3-02). Sie erklärt
nirgends, **welche Adressen dazugehören.** Genau das ist die Lücke.

### Symptom B und C sind Folgen, keine eigenen Fehler

Beim Rücksprung in den Vollbild-Modus rechnet die Seite `env(safe-area-inset-top)` nicht
neu und behält den Wert aus dem eingebetteten Browser — dort ist er um die Adressleiste
größer. **Die gemessenen ~115 px sind genau diese Differenz.** Die Tab-Leiste ist
`position: fixed` und wird gezeichnet, während ihre Trefferfläche noch am alten Viewport
hängt; ein Hochziehen erzwingt die Neuberechnung.

**Ohne Moduswechsel gibt es nichts nachzurechnen.** Die Reparatur von A sollte B und C
mitnehmen — das ist die Erwartung, nicht der Beweis, und sie wird nach der Abnahme
gemessen (v3-04, Prüfschritt S11).

---

## 4. Was daran NICHT bewiesen ist

**Kein Test dieses Projekts kann diesen Fehler sehen.** Playwright läuft in Chromium;
den Vollbild-Modus, die Zugehörigkeits-Prüfung und den Wechsel in den eingebetteten
Browser gibt es dort nicht. v3-03 hatte **301 grüne Tests**, darunter 11
Render-Prüfungen bei exakt 430 × 932 — und genau dieser Fehler ist durchgerutscht.

Was die Messungen oben belegen, ist, **was es nicht ist** (kein Seitenwechsel, kein
fehlendes Meta-Tag, kein Origin-Wechsel, kein Anmelde-Umweg) und **dass die Aussage
fehlt** (kein Manifest). Dass iOS sich *mit* einem Manifest anders verhält, ist von hier
aus nicht prüfbar. **Der Beweis ist die Abnahme am iPhone.**

> **Dieselbe Klasse wie LL-30:** Der entscheidende Zustand lebt außerhalb des Repos. Dort
> war es eine Einstellung in einem Web-Portal, hier das Verhalten, das sich ein abgelegtes
> Symbol gemerkt hat. **Praktische Folge für die Abnahme:** Das alte Symbol muss
> **gelöscht und neu abgelegt** werden. Wer mit dem alten testet, hält die Reparatur für
> wirkungslos und sucht an der falschen Stelle weiter.

> **Und dieselbe Klasse wie LL-22:** `mobil/layout.tsx` erklärt seit v3-02, dass die App
> im Vollbild läuft. Dass sie beim **Navigieren** dort bleibt, hat nie jemand gemessen —
> und genau das tut sie nicht. Eine Zusage über Verhalten ist keine Prüfung.

---

## 5. Was zu tun ist

Ein Web-App-Manifest, das den Zugehörigkeitsbereich **ausspricht** statt ihn iOS raten zu
lassen: `scope: "/mobil"` deckt alle vier Tabs ab, `display: "standalone"` fordert den
Vollbild-Modus an, `start_url` benennt den Einstieg.

Dazu ein echtes Symbol — heute nimmt iOS einen verkleinerten Screenshot der Übersicht,
auf dem nichts zu erkennen ist. Die Gestaltung ist am 13.09.2026 entschieden:
`V2/design_direktor_2026-09-13_mobil-symbol.md`.

**Nicht anzufassen:** `.frame`, `100dvh`, die Safe Areas, die Tab-Leisten-CSS. Erst A
beheben, dann messen, ob B und C überhaupt noch auftreten — nicht drei Pflaster
übereinander kleben (LL-6: `position: fixed` bricht leicht, und die Prüfstrecke bleibt
dabei grün).
