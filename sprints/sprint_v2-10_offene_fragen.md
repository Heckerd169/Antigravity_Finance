# Sprint v2-10 — Offene Fragen

> Angelegt am 05.08.2026 zu Beginn des unbeaufsichtigten Laufs, wie im Arbeitsauftrag
> gefordert. Hier landet alles, was eine Entscheidung des Users braucht: offene Fragen,
> Gestaltungsentscheidungen, Blocker, Widersprüche. Jeder Eintrag nennt **was**, **wo**,
> **warum** und **welche Entscheidung fehlt**.
>
> Der Lauf hat an keiner dieser Stellen gewartet — er hat notiert und ist zur nächsten
> Phase gegangen.

---

## 1 · Widerspruch: die Prüfanker im Arbeitsauftrag sind überholt

**Was.** Der Arbeitsauftrag nennt unter „Prüfanker — Sparrate darf sich NICHT bewegen"
die flache Tabelle 1.931,18 € für Jan–Apr und Aug–Dez, 4.589,53 € für Juni. Lesend
gegen die Produktiv-Datenbank gemessen (05.08.2026, `calculate_sparrate_for_month`,
nur `SELECT`) stimmen davon nur Jan–Apr und Mai.

| Monat 2026 | Auftrag | gemessen 05.08. | |
|---|---|---|---|
| Jan–Apr | 1.931,18 € | 1.931,18 € | ✓ |
| Mai | −86,77 € | −86,77 € | ✓ |
| Juni | 4.589,53 € | **4.208,76 €** | ✗ |
| Juli | *(nicht genannt)* | **−1.222,75 €** | — |
| August | 1.931,18 € | **1.761,08 €** | ✗ |
| Sep–Dez | 1.931,18 € | **1.824,08 €** | ✗ |

**Wo.** `sprints/sprint_v2-10_auftrag.md` §„Prüfanker" · dieselbe überholte Tabelle
steht in `CLAUDE.md` §9.

**Warum kein Blocker.** `V2/befunde_2026-08-04_fehler_und_entscheidungen.md` §1 hat
genau diese Werte am 04.08. gemessen und schreibt ausdrücklich: „Die alten Anker aus
dem Juli-Stand (2026 flach 1.931,18 €) sind **überholt** und dürfen nicht mehr als
Sollwert dienen." Die gemessenen Werte decken sich **exakt** mit dieser Liste — die
Abweichung ist also bekannt und stammt aus der Juli-Kuratierung, nicht aus diesem
Sprint.

**Wie dieser Lauf damit umgegangen ist.** Der Anker wirkt in diesem Sprint als
*relativer* Regressions-Wächter: maßgeblich ist, dass sich die Zahlen zwischen der
Messung **vor** Phase 1 und der Messung **nach** Phase 5 nicht bewegen. Alle Phasen
sind reine Anzeige. Als Basis dient deshalb der am 05.08. gemessene Stand, nicht die
Tabelle aus dem Auftrag.

**Welche Entscheidung fehlt.** Ob die Anker-Tabelle in `CLAUDE.md` §9 auf den Stand
vom 04./05.08. nachgezogen werden soll. Das ist eine Änderung an der Verfassung und
braucht nach §7 Regel 14 eine ausdrückliche Freigabe — dieser Lauf hat sie deshalb
**nicht** angefasst.

---

## 2 · Korrektur an der Bestandsaufnahme zu RM-4 (kein Blocker, bereits gelöst)

**Was.** Der Arbeitsauftrag gibt für RM-4 mit: „7 von 8 Overlays waren bereits
zentriert, einzige bewusste Ausnahme ist das Karten-Kontextmenü." Am Code geprüft
stimmt die Zahl nicht ganz: Acht Komponenten zeichnen per Portal an `document.body`,
aber eine davon ist der **Rückgängig-Toast** (`cards/card-action-toast.module.css`),
und der sitzt mit `bottom: 24px; left: 50%` unten Mitte — laut Kommentar dort
„bewusst anders", und so auch in Design-Doku §2.4 spezifiziert.

**Warum das zählt.** Die Regel spricht von „Overlays und Popups". Ein Toast ist
keine modale Fläche; ihn unter die Zentrierungs-Regel zu ziehen hätte einen
Widerspruch zu §2.4 in die Design-Doku geschrieben.

**Wie dieser Lauf damit umgegangen ist.** Der **Wortlaut der Regel** ist unverändert
übernommen worden — er stand laut Auftrag wörtlich fest. Nur die begleitende
Bestandsaufnahme im Patch ist auf die belegte Zählung korrigiert: sieben
Overlays/Popups, davon sechs bereits zentriert, eine bewusste Ausnahme
(Karten-Kontextmenü), plus das Einkommens-Popup aus diesem Sprint. Der Toast ist
ausdrücklich als nicht von der Regel erfasst vermerkt.

**Welche Entscheidung fehlt.** Keine — die Korrektur ist rein sachlich und am Code
belegt. Der Eintrag steht hier nur, damit die Abweichung vom Auftragstext sichtbar
bleibt.

---

## 3 · Doku-Patch für `BF-1`, den der Auftrag nicht vorsah

**Was.** Der Arbeitsauftrag nennt für Phase 2 (`BF-1`, KI-Vorschlags-Badges) keinen
Doku-Patch. Beim Schreiben des `RM-1`-Patches ist aufgefallen, dass die Design-Doku
in §11 („Fragment-Karte — Spezifikation") eine Tabellenzeile
„Kategorie-Badge (nur 0.60–0.95)" führt und darunter einen ganzen Absatz zur
Badge-Farbe. Beides beschreibt ab sofort etwas, das nicht mehr gezeichnet wird.

**Wo.** `antigravity_finance_design_dokument.md` §11 · Patch 4b in
`sprints/sprint_v2-10_doku_patches.md`.

**Warum notiert.** Die Design-Doku ist normativ (CLAUDE.md §5). Eine Zeile, die ein
Badge verspricht, das die App nicht mehr zeigt, ist ein echter Fehler in der Bibel —
und genau die Sorte Divergenz, die später als Regressions-Verdacht missgedeutet wird.
Der zugrunde liegende Beschluss ist am 04.08.2026 gefallen und dokumentiert
(`V2/befunde_2026-08-04_fehler_und_entscheidungen.md` §2, Punkte 1/2/4); der Patch
trägt ihn nur nach, er entscheidet nichts.

**Wie dieser Lauf damit umgegangen ist.** Patch 4b ist geschrieben und in Phase 5
mit angewendet worden — die Spezifikation bleibt dabei **stehen** und wird nur als
„seit v2-10 nicht mehr gerendert" markiert, passend dazu, dass die Anzeige über eine
Konstante wieder einschaltbar ist.

**Welche Entscheidung fehlt.** Ob dieser über den Auftrag hinausgehende Patch so
bleiben soll. Er ist bewusst als eigene Stelle geführt und lässt sich einzeln
zurücknehmen, ohne die übrigen Patches zu berühren.

---

## 4 · Gilt die Kürzung auf den Verwendungszweck auch außerhalb der Rohmasse?

**Was.** `RM-1` ist im Auftrag ausdrücklich auf
`src/components/interaction-zone/fragment-card.tsx` verortet. Die gespeicherte
Beschreibung wird aber an zwei weiteren Stellen angezeigt:

| Ort | Was dort passiert | in diesem Sprint |
|---|---|---|
| `linked-fragments-overlay.tsx:103` | Liste der verknüpften Fragmente auf einer Karte | **unverändert** |
| `recurrence-popup.tsx:40` | Beschreibung als **vorausgefüllter Kartenname** | **unverändert** |

**Warum nicht mitgezogen.** Für das Overlay wäre es eine reine Gestaltungsfrage —
dasselbe Lesbarkeits-Argument gilt dort, der Auftrag hat es aber nicht entschieden,
und §7 Regel 3 verbietet die Erfindung. Beim Recurrence-Popup wäre es sogar
**mehr** als Anzeige: Der Text landet als Kartenname in der Datenbank. Ihn dort zu
kürzen hieße, gespeicherte Daten zu verändern — genau das, was `RM-1` ausschließt
(„Nichts in der Datenbank ändern").

**Welche Entscheidung fehlt.** Ob die Liste der verknüpften Fragmente
(`linked-fragments-overlay`) dieselbe Kürzung bekommen soll. Für das Recurrence-Popup
lautet die Empfehlung ausdrücklich **nein** — dort ist der vollständige Text die
bessere Vorlage für einen Kartennamen, und der User kann ihn ohnehin überschreiben.

