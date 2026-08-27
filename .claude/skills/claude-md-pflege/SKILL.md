---
name: claude-md-pflege
description: Pflege der CLAUDE.md von Antigravity Finance — etwas ergänzen, ohne die Datei zuwachsen zu lassen, und auslagern, wenn sie es doch getan hat. Laden, sobald an CLAUDE.md etwas geändert werden soll, und immer wenn `tests/e2e/claude-md-umfang.spec.ts` rot oder gelb ist. Enthält die Entscheidung, was überhaupt hineingehört, die drei Umfangsgrenzen mit ihrer Bedeutung und den Auslagerungs-Weg je Inhaltsart. NICHT nötig für Design- oder Schema-Doku — dafür gilt `sprint-abschluss` Schritt 6.
---

# CLAUDE.md pflegen

Diese Datei ist die **Verfassung** des Projekts und wird in **jeder** Sitzung
vollständig geladen. Jede Zeile darin kostet dauerhaft — nicht einmal, sondern bei
jedem Start, für immer.

Diese Fähigkeit hat deshalb **eine** Aufgabe: verhindern, dass die Datei ein zweites
Mal zum Archiv wird.

---

## ⚠️ Warum es diese Fähigkeit gibt — und warum ein Merksatz nicht gereicht hätte

**Sprint v2-08 kürzte CLAUDE.md von 1.857 auf 434 Zeilen.** Einundzwanzig Sprints
später stand sie bei **1.712** — fast wieder dort, wo sie vorher war. Der Vorspann
erzählte **19 Sprints** nach, §9 noch einmal **20**, und dieselbe Historie stand
vollständig in `sprints/projekt_historie.md`.

**Der Kopf der Datei sagte die ganze Zeit, dass genau das nicht passieren darf:**
*„ausschließlich das, was immer gilt … Historie, Verfahren und Spezifikation stehen
deshalb woanders."*

> ### Die Eigenschaft, die diese Fehlerklasse gefährlich macht
>
> **Sie entsteht ausschließlich aus richtigen Entscheidungen.** Jede einzelne
> Ergänzung war begründet, jede wurde vom User freigegeben, keine war überflüssig.
> **Nur die Summe ist der Fehler** — und eine Summe bemerkt niemand beim
> Hinschreiben.
>
> Deshalb ist die eigentliche Absicherung nicht diese Fähigkeit, sondern
> **`tests/e2e/claude-md-umfang.spec.ts`**. Er läuft in jeder Prüfstrecke mit und
> misst, was kein Mensch nebenbei mitzählt. Nach **LL-40** ist eine Checklisten-Zeile
> eine Zusicherung, ein Test eine Prüfung — und der „vergessene Schritt" in
> `sprint-abschluss` war seit v2-08 als solcher **markiert** und wurde trotzdem
> zweimal übersehen.
>
> **Diese Fähigkeit sagt, WAS zu tun ist. Der Test sagt, DASS.**

---

## Die eine Frage vor jeder Ergänzung

> **Gilt das, was ich hier hinschreiben will, IMMER?**

| Antwort | Wohin damit |
|---|---|
| **Ja, dauerhaft** — eine Stolperfalle, eine Arbeitsregel, eine Lesson Learned | **CLAUDE.md** (§6 / §7 / §8) |
| Es beschreibt, **was ein Sprint gebracht hat** | `sprints/projekt_historie.md` |
| Es ist ein **Verfahren**, das sich wiederholt | eine Fähigkeit unter `.claude/skills/` |
| Es beschreibt, **wie die App aussehen oder rechnen soll** | Design-Doku bzw. Schema-Doku |
| Es ist ein **offenes Thema** | `V2/v2_roadmap_konsolidiert.md` |
| Es ist die **Diagnose eines Ist-Zustands** | `V2/befunde_JJJJ-MM-TT_<slug>.md` |

**Der häufigste Fehler ist nicht, das Falsche zu schreiben, sondern das Richtige an
den falschen Ort.** Ein Sprint-Ergebnis ist wertvoll — es gilt nur nicht *immer*.

> **Faustregel für den Grenzfall:** Wenn ein Absatz mit „In v2-NN …" beginnt und
> danach **kein** Satz folgt, der ohne diesen Sprint gilt, gehört er in die Historie.
> Beginnt er mit „Wer X tut, muss Y beachten", gehört er hierher.

---

## Der Test ist rot — was jetzt?

Drei Grenzen, **drei verschiedene Antworten.** Die Meldung nennt, welche gerissen ist.

### ① „die Datei bleibt unter der Obergrenze" (1.600 Zeilen)

Die **Kostengrenze**. Sie sagt nichts darüber, *was* zu viel ist — dafür sind ② und ③
da. Ist sie allein gerissen, während ② und ③ grün sind, ist die Datei tatsächlich aus
**Regeln** gewachsen.

**Dann ist Kürzen die falsche Antwort.** Prüfe stattdessen:

- Stehen zwei Stolperfallen nebeneinander, die **dieselbe** Suchrichtung meinen? Dann
  gehören sie zusammengelegt — §6 Stolperfalle 16 führt genau deshalb eine Tabelle
  ihrer Gestalten, statt fünf einzelne Einträge zu haben.
- Trägt ein Eintrag eine **Vorfallsbeschreibung, die länger ist als die Regel**? Der
  Vorfall darf kürzen, aber nicht verschwinden (siehe unten).
- Erst wenn beides nicht greift: die Grenze anheben — **mit Begründung im selben
  Commit**. Prüfung ④ im Test hält fest, dass die Zahlen zusammenpassen müssen.

### ② „die Erzählzone bleibt schlank" (150 Zeilen)

**Vorspann + §9 bis zur Überschrift „Die Prüfanker".** Hier sind zwischen v2-08 und
v2-28 die 443 Zeilen Nacherzählung entstanden — **das ist die Grenze, die zuerst
reißt**, und sie ist fast immer die richtige Diagnose.

**Vorgehen:**

1. Im Vorspann und im §9-Kopf jeden Absatz durchgehen, der einen Sprint nacherzählt.
2. Prüfen, ob sein Inhalt in `sprints/projekt_historie.md` **schon steht**. Meist ja —
   der Sprint-Abschluss schreibt ihn dorthin (Schritt 4b).
3. Steht er dort **nicht**, zuerst dorthin übertragen, dann hier streichen.
4. Was bleibt: was für die **nächste** Sitzung gilt — letzter Sprint, aktuelle Lage in
   Zahlen, offene Entscheidungen.

> **Der Vorspann braucht keine Sprint-Kette.** Wer wissen will, was v2-17 gebracht
> hat, liest die Historie. Wer hier arbeitet, braucht: was die Datei ist, wie sie
> gepflegt wird, wann sie zuletzt angefasst wurde, und was **diese** Runde geändert
> hat.

### ③ „der Regelanteil bleibt hoch" (§6+§7+§8 ≥ 45 %)

**Die aussagekräftigste der drei.** Sie bestraft nicht das Wachsen, sondern das
**Verwässern**: Wächst die Datei durch neue Stolperfallen und Regeln, bleibt der
Anteil stabil und der Test grün.

**Beleg, warum diese Zahl gebraucht wird:** In v2-29 sind §6+§7+§8 von **657 auf 701
Zeilen gewachsen**, während die Datei um 294 Zeilen **schrumpfte** — der Anteil stieg
von 38 % auf 49 %. Eine reine Zeilenzahl hätte beide Zustände gleich beurteilt.

Fällt der Anteil, ist **außerhalb** der Regelabschnitte etwas dazugekommen. Meist ist
dann auch ② gerissen; wenn nicht, sind §1–§5 gewachsen — dort ist Beschreibung, keine
Regel, und sie veraltet schneller.

---

## Was NIE gekürzt wird

**Die Vorfälle, an denen die Regeln haften.** §6, §7 und §8 erzählen zu fast jeder
Regel, woran sie entstanden ist — mit Zahlen, Datum und der Stelle, an der sich eine
Annahme als falsch erwies. Das ist kein Beiwerk:

> **Eine Regel ohne ihren Vorfall wird zur Checkliste, und Checklisten werden nicht
> gelesen.** Wer „Netzrunden zählen, nicht Abfragen optimieren" liest, hakt es ab. Wer
> liest, dass eine Funktion **0,089 ms** brauchte und **899 ms** kostete, weil sie
> 77-mal einzeln gerufen wurde, sucht beim nächsten Mal danach.

Bei einer Kürzungsrunde bleibt §6/§7/§8 deshalb **vollständig** — auch wenn dort das
meiste Gewicht liegt. Gekürzt wird die Erzählzone.

**Ebenfalls unantastbar:** die drei Prüfanker in §9, die Messregel, die Momentaufnahme
mit ihrem Warnkasten. Sie sind der Grund, warum ein Eingriff überhaupt prüfbar ist.

---

## Das Verfahren

**CLAUDE.md wird nie direkt editiert** (§7 Regel 14 / LL-16) — und für sie gilt
zusätzlich zur Patch-Datei die **ausdrückliche Freigabe des Users**, auch für eine
reine Kürzung.

1. **Patch-Datei schreiben:** `sprints/sprint_v2-NN_doku_patches.md` (oder
   `sprints/doku_patch_JJJJ-MM-TT_<slug>.md` ohne Sprint), je Stelle **Anker +
   Patch-Satz**.
2. **Jeden Anker einzeln auf Eindeutigkeit prüfen** — `grep -c`, Erwartung `1`.
   Ein mehrdeutiger Anker patcht die falsche Stelle, und der Diff sieht plausibel aus.
3. **Freigabe einholen.** Bei einer Kürzung dem User vorlegen: was raus soll, wie viel
   das spart, und **was ausdrücklich bleibt**.
4. Anwenden, dann `pnpm test:visual` — der Umfangs-Wächter und
   `doku-vollstaendigkeit.spec.ts` laufen mit.
5. **Nummern prüfen:** Stolperfallen, Regeln und LL-Einträge müssen **lückenlos**
   bleiben; §8 verweist auf §6/§7, und `doku-vollstaendigkeit.spec.ts` prüft, dass
   jeder LL-Ursprung in der Historie auffindbar ist.

> **Wer eine neue Regel ergänzt, ergänzt drei Stellen:** die Regel selbst (§6 oder §7),
> den Registereintrag (§8) **und** den Historie-Eintrag beim auslösenden Sprint. Fehlt
> der dritte, wird `doku-vollstaendigkeit.spec.ts` rot — absichtlich.

---

## Abhakliste

- [ ] Für **jede** Ergänzung gefragt: Gilt das *immer*?
- [ ] Sprint-Ergebnisse nach `sprints/projekt_historie.md`, nicht hierher
- [ ] Patch-Datei geschrieben, **Anker einzeln auf Eindeutigkeit geprüft**
- [ ] **Freigabe des Users eingeholt** — auch für eine reine Kürzung
- [ ] Nummern lückenlos (Stolperfallen · Regeln · LL)
- [ ] Neue Regel? Dann auch §8-Register **und** Historie-Eintrag
- [ ] `pnpm test:visual` grün — inklusive `claude-md-umfang` und
      `doku-vollstaendigkeit`
- [ ] Grenze angehoben? Dann **Begründung im selben Commit**
