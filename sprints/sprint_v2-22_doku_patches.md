# Doku-Patches — Sprint v2-22

> Verfahren nach LL-16 / §7 Regel 14: **Anker + Patch-Satz je Stelle**, nie eine
> direkte Bearbeitung der Bibeln.
>
> Betroffen: **Schema-Doku** (RPC-Katalog §4, Kopf, Changelog).
> **Nicht betroffen: Design-Doku** — der Sprint ändert keine Formensprache und keinen
> Text. Das Jahres-Popup zeigt dieselben Zeilen, nur mit einer Summe, die aufgeht.
> **Nicht betroffen: CLAUDE.md** — Begründung unten.

---

## Patch 1 · Schema-Doku §4 — `get_year_deviation_drivers`

**Anker** (Ende der Katalog-Zeile, eindeutig):

```
**Seit v2-20 filtert sie `deleted_at IS NULL`** — sonst bräche die B2-Invariante: Die Treiber erklärten eine Karte, die in keiner der beiden Sparraten mehr vorkommt | `jsonb` |
```

**Patch-Satz:** Der Anker bleibt, danach wird die v2-22-Änderung ergänzt — kein
Runden je Zeile mehr, Ziel aus den Rechenfunktionen geholt, Rest auf die
betragsgrößte Kartenzeile, plus die beiden widerlegten Vermutungen (Gehalt
unschuldig; die verursachenden Zeilen sind unsichtbar).

---

## Patch 2 · Schema-Doku — Kopf und Changelog

**Anker** (Zeile 3–5, eindeutig):

```
**Version:** 3.8.0
```

**Patch-Satz:** auf **3.9.0**, Status um „Sprint v2-22 Treiber-Rundung" ergänzt,
neuer Changelog-Block darunter.

---

## Nicht gepatcht — und warum das eine Entscheidung ist

| Stelle | Warum unverändert |
|---|---|
| **CLAUDE.md §6 / §7 / §8** | Die Lehre aus P1 steht bereits als **Stolperfalle 13 / LL-25** in der Verfassung, die aus P2 als **Stolperfalle 16 / LL-26**. Dieser Sprint ist die **Anwendung** beider Regeln, kein neuer Fall. Ein vierter Eintrag zum selben Thema würde die Datei verwässern, und §8 warnt selbst davor, verwandte Lehren zu doppeln |
| **CLAUDE.md §9** | Nennt `B2-R` noch als offene Hausaufgabe. Das stimmt nach diesem Sprint nicht mehr — ein Einzeiler, der die **Freigabe des Users** braucht (§7 Regel 14). Vorschlag steht im Review §7 |
| Schema-Doku §3 (Sparrate-Wahrheitsquellen) | `get_year_deviation_drivers` ist eine Auswertungs-Funktion; sie schreibt nichts und wird von keiner Rechenfunktion aufgerufen. Die Sparrate ist in allen zwölf Monaten unverändert |
| Design-Doku §9 (Jahres-Welle + Popup) | Die Anzeige ist unverändert: dieselben Zeilen, dieselbe Sortierung, dieselben Beträge — bis auf einen Cent auf der größten Zeile in zwei Monaten |
