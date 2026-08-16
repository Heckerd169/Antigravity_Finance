# Doku-Patches — Sprint v2-23

> Verfahren nach LL-16 / §7 Regel 14: **Anker + Patch-Satz je Stelle**, nie eine
> direkte Bearbeitung. Für CLAUDE.md zusätzlich mit ausdrücklicher User-Freigabe —
> erteilt am 16.08.2026.
>
> Betroffen: **CLAUDE.md** (§6 Stolperfalle 16, §8 LL-26, §9 Stand).
> **Nicht betroffen: Design-Doku und Schema-Doku** — der Sprint ändert weder
> Formensprache noch Datenbank. Er repariert einen Frontend-Filter.

---

## ⚠️ Der Umfang ist größer als der freigegebene Satz — und warum

Vorgelegt war **eine** Ergänzung: die dritte Ausprägung von Stolperfalle 16.

Beim Anwenden zeigte sich: **Die zweite Ausprägung steht gar nicht drin.** Der
v2-20-Review hat sie vorgeschlagen (*„§6 Stolperfalle 16 erweitern — auch ein
Frontend-**Nachbau** einer Datenbank-Regel kann sie aufheben"*), aber für v2-20 wurde
nie eine CLAUDE.md-Freigabe erteilt; die Freigaben kamen für v2-21 und v2-22. Der
Vorschlag ist stillschweigend liegen geblieben.

**Eine „dritte Ausprägung" ohne die zweite wäre unverständlich.** Deshalb sind beide
enthalten — die nachgereichte aus v2-20 und die neue aus v2-23. Das ist eine
Erweiterung über den freigegebenen Wortlaut hinaus und wird deshalb hier ausdrücklich
benannt, statt still mitzulaufen (dasselbe Verfahren wie in v2-18).

---

## Patch 1 · §6 Stolperfalle 16 — zwei Ausprägungen ergänzen

**Anker** (Ende der Stolperfalle, eindeutig):

```
    Stelle, die sie kürzt** — `slice`, `LIMIT`, `take`, eine feste Feldliste.
    (v2-19, LL-26)
```

**Patch-Satz:** Der Anker bleibt; darunter werden die zwei weiteren Formen ergänzt,
in denen dieselbe Lehre aufgetreten ist — **Nachbau** (v2-20) und **Einzelwert-Filter**
(v2-23) — mit dem Satz, dass die Suchrichtung je Form eine andere ist.

---

## Patch 2 · §8 LL-26 — die Registerzeile verallgemeinern

**Anker** (eindeutig):

```
| LL-26 | Ein Frontend-Limit kann eine Datenbank-Entscheidung stillschweigend aufheben — wer eine Antwort erweitert, sucht die Stelle, die sie kürzt | §6 Stolperfalle 16 | v2-19 (GE-2) |
```

**Patch-Satz:** Die Zeile nennt heute nur das **Limit**. Nach vier Vorfällen ist die
Lehre allgemeiner: Ein Frontend kann eine Datenbank-Entscheidung auf **drei** Wegen
aufheben — kürzen, nachbauen, auf einen Einzelwert filtern. Die Zeile wird darauf
gehoben und nennt alle drei Ursprungs-Sprints.

> **Warum kein neuer LL-Eintrag:** §8 warnt selbst davor, verwandte Lehren zu doppeln
> (siehe den Kasten zu LL-24/LL-25). Es ist derselbe Mechanismus — die Datenbank
> entscheidet richtig, der Nutzer sieht es nicht —, nur in drei Gestalten. Eine zweite
> Nummer würde die Suche zerstreuen, statt sie zu bündeln.

---

## Patch 3 · §9 — Stand auf v2-23

**Anker A** (Kopfzeile):

```
> **Letzte Aktualisierung:** 15. August 2026 · **nach:** Sprint **v2-22**
```

**Anker B** (§9):

```
**Letzter Sprint:** v2-22 (der Cent und die Prüfbarkeit — `B2-R` `ZO-2`, 15.08.2026,
```

**Patch-Satz:** beide auf **v2-23**, PR-Lage aktualisiert (#30–#34 gemerged, #35
offen), Roadmap-Zahlen auf **50 erledigt**.

---

## Nicht gepatcht, aber geprüft

| Stelle | Warum unverändert |
|---|---|
| §6 Stolperfalle 17 (`frequency_match`) | unberührt — `ZO-1` ist weiterhin offen |
| Die Sparraten-Momentaufnahme in §9 | v2-23 bewegt keine Zahl; gemessen vor und nach dem Eingriff |
| §7 Regeln | Die Lehre aus v2-23 ist eine **Stolperfalle** (wo etwas schiefgeht), keine **Arbeitsregel** (was zu tun ist). Regel 10 („erst verifizieren, dann patchen") deckt das Vorgehen bereits ab — und sie hat hier funktioniert: Die Meldung des Nutzers wurde gegen die Datenbank geprüft, bevor irgendetwas geändert wurde |
