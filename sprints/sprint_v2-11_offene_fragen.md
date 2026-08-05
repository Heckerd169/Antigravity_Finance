# Sprint v2-11 — Offene Fragen

> Angelegt am 05.08.2026 zu Beginn des zweiten unbeaufsichtigten Laufs. Hier landet
> alles, was eine Entscheidung des Users braucht: offene Fragen, Blocker, Widersprüche.
> Jeder Eintrag nennt **was**, **wo**, **warum** und **welche Entscheidung fehlt**.
>
> Der Lauf hält an keiner dieser Stellen an — er notiert und geht zur nächsten Phase.

---

## 1 · Die Migration auf Produktion wartet auf dich — **das ist geplant, kein Fehler**

**Was.** Die Migration für `BF-5` ist entworfen, auf der Übungs-Datenbank geprobt und
als Datei abgelegt. Sie ist **nicht** auf die Produktiv-Datenbank angewendet worden.

**Warum.** Die Fähigkeit `db-eingriff` zieht an dieser Stelle eine harte Grenze:

> **Schritt 5.2:** „Menschliche Freigabe einholen. **Das ist ein Gate, keine
> Formalie.**"

Und `CLAUDE.md` §4 führt „Migration auf die Produktiv-Datenbank" unter dem, was
ausschließlich der Mensch macht. In der Produktiv-Datenbank liegen echte Finanzdaten;
es gibt keine Rückgängig-Taste und keinen zweiten Nutzer, der einen Fehler bemerkt.

**Der Auftrag „keine Rückfragen" hebt dieses Gate nicht auf.** Er regelt, dass ich bei
*offenen Fragen* nicht warte, sondern notiere und weiterarbeite — genau das passiert
hier. Ein Zwei-Personen-Gate ist keine Rückfrage, sondern eine Sicherheitsgrenze.

**Was du tun musst** — steht ausführlich im Review, hier die Kurzfassung:

1. Die Migrationsdatei ansehen: `supabase/migrations/…`
2. Anwenden auf `nflkobdfdhncrtjncpmq`.
3. Anker nachher messen. **Erwartung steht vorher fest:** Juli-Ist
   **−1.222,75 € → −322,75 €** (exakt +900,00 €), **alle anderen Monate unverändert.**

Bewegt sich ein anderer Monat, ist etwas falsch — dann zurückrollen, nicht erklären.

**Welche Entscheidung fehlt.** Keine — nur die Ausführung. Die fachliche Entscheidung
ist mit **E2** am 05.08.2026 bereits gefallen.

---

## 2 · ⚠️ Reihenfolge: **erst die Migration, dann der Merge**

**Das ist der wichtigste Satz dieses Sprints.** Migration und Frontend-Änderung sind
**gekoppelt** und müssen zusammen wirksam werden. Wird nur eines von beidem
ausgeliefert, zeigt die Karte „Aline Geburtstag" zwei Zahlen, die nicht zueinander
passen:

| Zustand | Karte zeigt oben | Karte zeigt darunter | |
|---|---|---|---|
| Heute (beides alt) | 1.068,11 € | 918,11 € über Plan | konsistent, aber falsch |
| **Nur Merge, ohne Migration** | 1.068,11 € | **18,11 € über Plan** | ✗ widersprüchlich |
| **Nur Migration, ohne Merge** | 168,11 € | **918,11 € über Plan** | ✗ widersprüchlich |
| Beides | 168,11 € | 18,11 € über Plan | ✓ richtig |

Der Grund: Die Zahl oben kommt aus der **Datenbank**
(`calculate_card_amount_for_month`), die Zeile darunter rechnet das **Frontend** aus
den verlinkten Fragmenten. Beide summierten bisher mit `ABS` — gleich falsch, aber
konsistent. Dieser Sprint korrigiert beide; sie müssen deshalb gemeinsam scharf
geschaltet werden.

**Empfohlene Reihenfolge:**

1. **Migration auf Produktion anwenden** (siehe §1 oben).
2. **Anker prüfen** — Juli muss von −1.222,75 € auf **−322,75 €** springen, alle
   anderen Monate unverändert.
3. **Erst dann PR mergen** — der Merge löst den Vercel-Deploy aus.

Umgekehrt (erst mergen, dann migrieren) entsteht ein Fenster, in dem die Karte
widersprüchlich aussieht. Das Fenster ist ungefährlich — es bewegt kein Geld und
verfälscht keine gespeicherten Daten —, aber es ist unnötig.

> **Warum das Frontend überhaupt mitgeändert wurde:** `sumLinkedFragments` in
> `card.tsx` trug dieselbe `Math.abs`-Konstruktion. Ohne die Korrektur hätte die
> Datenbank-Reparatur die Karte **schlechter** aussehen lassen als vorher — der
> Fehler wäre von „beide falsch, aber einig" zu „offen widersprüchlich" gewandert.
> Gefunden beim Durchsehen der Aufrufer, nicht im Auftrag benannt.
