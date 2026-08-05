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

