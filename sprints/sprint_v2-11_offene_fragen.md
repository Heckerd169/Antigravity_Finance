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
