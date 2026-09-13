# Sprint v3-04 — Briefing

> **Thema:** `MB-7` · `/mobil` bleibt beim Navigieren im Vollbild
> **Datum:** 13.09.2026 · **Branch:** `sprint/v3-04-mobil-vollbild`
> **Warum diese Datei existiert:** zwei der vier Kriterien aus `sprint-start` treffen zu —
> **mehr als drei Phasen**, und der Sprint **reicht über eine Sitzung hinaus**, weil die
> Abnahme am iPhone stattfindet. Ein Chat-Verlauf wird von der nächsten Sitzung nicht
> gelesen.

---

## Ziel

Ein Wechsel zwischen allen vier Tabs lässt `/mobil` im Vollbild — weil die App selbst
erklärt, dass alle vier Tabs zu ihr gehören.

## Nicht-Ziel

- **Kein Pflaster für den Versatz und die tote Tab-Leiste.** Erst A beheben, dann messen,
  ob B und C überhaupt noch auftreten.
- Keine Änderung an `.frame`, `100dvh`, den Safe Areas oder der Tab-Leisten-CSS
  (LL-6: `position: fixed` bricht leicht, und die Prüfstrecke bleibt dabei grün).
- Keine Änderung an der Schreibtisch-Ansicht, an Routen, Daten oder Rechenlogik.
- Kein Service Worker, kein Offline-Cache, keine PWA-Vollausstattung.
- Kein Umbau von `/mobil/page.tsx`. Die Weiterleitung bleibt die **eine** Stelle, die
  entscheidet, wohin `/mobil` führt — ein zweiter Ort wäre LL-26 in der Gestalt
  „Nachbauen".

## Diagnose

Vollständig in `V2/befunde_2026-09-13_mobil-vollbild.md`. In einem Satz: Ohne
Web-App-Manifest entscheidet iOS anhand der **Startadresse**, welche Seiten noch zur App
gehören — und öffnet alles andere im eingebetteten Browser, **auch bei reiner
Client-Navigation**.

**Gemessen und damit ausgeschlossen:** harter Seitenwechsel (0 Ladevorgänge auf allen
vier Tabs), fehlendes Meta-Tag (alle vier Seiten identisch), Origin-Wechsel,
Anmelde-Umweg.

## Prüfanker

**Kein Zahlenwert bewegt sich.** Protokoll: `sprints/sprint_v3-04_anker.md`.

| | Vorher (13.09.2026) |
|---|---|
| Sparrate Ist + Plan, 24 Monate | gemessen, Tabelle im Anker-Protokoll |
| Anker 1 (Σ Ordner = Sparrate) | **0,00 € in 24/24** |
| Anker 2 (Σ delta = Ist − Plan) | **24/24 exakt, größte Abweichung 0,00 €** |
| Netzrunden je Aufbau | Übersicht 8 · Karten 6 · Verlauf 5 · Zuordnen 11 |
| Prüfstrecke | tsc 0 · Lint 0/0 · Build 0 · `test:visual` 276 · `test:e2e` 301 |

Die Prüfzahlen dürfen **nur um die eigenen Wächter** steigen: 276 → 282, 301 → 307.

## Phasen

| Phase | Inhalt | Commit |
|---|---|---|
| **P0** | Befund, Design-Record Symbol, Roadmap `MB-7`, dieses Briefing, Anker-Protokoll vorher | ja |
| **P1** | Manifest, Symbol, Manifest-Verweis im Layout, Middleware-Ausschluss | ja |
| **P2** | Sechs Wächter, zwei davon absichtlich rot gesehen (LL-40) | ja |
| **P3** | Prüfstrecke, Anker nachher, Review, Roadmap-Stand, CLAUDE.md-Nachzug, PR | ja |

## Annahmen

- **A1 — Der Zugehörigkeitsbereich lautet `/mobil`.** Alle vier Tabs liegen darunter; ein
  fünfter Bereich müsste es auch. Wächter 1 in P2 prüft genau das gegen die **echte**
  Tab-Leiste.
- **A2 — `start_url` ist `/mobil`, nicht `/mobil/uebersicht`.** Begründung: `/mobil`
  entscheidet selbst, wohin es führt (heute die Übersicht, samt Monats-Rückfall). Eine
  zweite Stelle mit derselben Entscheidung wäre LL-26.
- **A3 — Ein Manifest wirkt erst nach erneutem Ablegen.** iOS merkt sich das Verhalten des
  abgelegten Symbols. **Das ist keine Vermutung über den Fix, sondern über die Abnahme** —
  und sie entscheidet, ob der Test aussagekräftig ist (siehe S8).

## Prüfschritte

**Maschinell:** S1 Anker vorher · S2 Build grün und Manifest ohne Anmeldung erreichbar ·
S3 Kopf-Angaben je Route · S4 Navigations-Messung wiederholt · S5 volle Prüfstrecke ·
S6 Anker nachher · S7 Netzrunden.

**Am Gerät — der eigentliche Anker:**

- **S8** — ⚠️ **das alte Symbol zuerst LÖSCHEN.**
- **S9** — Vorschau des Branches öffnen, anmelden, **neu** zum Home-Bildschirm hinzufügen.
  Kontrolle: Das Symbol ist der Ring, nicht ein Screenshot.
- **S10** — Aus dem Symbol starten, **alle vier Tabs hin und zurück**. Erwartung: kein
  Browser-Rahmen, in keiner Richtung.
- **S11** — Danach gezielt: Inhalt noch zu tief? Tab-Leiste sofort bedienbar? Erwartung:
  beides behoben. **Bleibt eines bestehen, ist das ein eigener Befund** — kein Nachbessern
  in diesem Sprint.

## Offen

**Brechen „Karten" und „Verlauf" genauso wie „Zuordnen"?** Die Diagnose sagt ja (sie
liegen beide nicht auf der Startadresse). Bricht **nur** Zuordnen, ist die Diagnose falsch.
Der Test kostet 20 Sekunden am Gerät und ist jederzeit nachholbar — auch **nach** dem Fix,
dann allerdings nur noch mit dem alten Symbol.

## Die vier Prüfungen aus `sprint-start`

| Prüfung | Ergebnis |
|---|---|
| **Kartentyp in jeder Erwartung genannt?** (LL-12) | **Nicht anwendbar** — es kommt keine Karte vor. Der Sprint fasst weder Karten noch Beträge noch Zustände an. |
| **Prüfschritte gegen bestehende Regeln und Testdaten geprüft?** (LL-15) | Ja. S2 hängt an der Middleware-Regel und ist genau deshalb ein Prüfschritt: `.webmanifest` steht **nicht** in der Endungsliste des matchers, das Manifest bekäme sonst die Anmeldeseite. S10 setzt einen angemeldeten Zustand auf dem Gerät voraus — deshalb steht das Anmelden in S9. |
| **Akzeptanzkriterien regel-basiert?** (LL-19) | Ja. „**Jeder** Tab-Wechsel bleibt im Vollbild" und „**jedes** Ziel der Tab-Leiste liegt im Zugehörigkeitsbereich" — nicht „Zuordnen funktioniert wieder". Ein fünfter Bereich fiele damit automatisch unter die Regel. |
| **Widerspricht ein Aufwands-Budget der Spezifikation?** (LL-20) | Nein. Es gibt kein Budget, und die Design-Doku sagt zum Home-Bildschirm-Symbol nichts — deshalb der Record vom 13.09.2026. |

## Datenbank

**Nicht berührt.** Keine Migration, keine Rechenfunktion, keine RPC, kein mutierender
Testlauf. Die Anker-Messung läuft trotzdem (§7 Regel 21).
