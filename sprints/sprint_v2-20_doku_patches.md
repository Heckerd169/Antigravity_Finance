# Sprint v2-20 — Doku-Patches

> **Verfahren:** LL-16 / §7 Regel 14 — Anker + Patch-Satz je Stelle, danach anwenden.
> **Betroffen:** Schema-Doku **3.6.0 → 3.7.0**. Die **Design-Doku bleibt unberührt** —
> der Sprint ändert keine Gestaltung, nur Regeln und einen Hinweistext.
>
> **CLAUDE.md ist NICHT Teil dieser Datei.** Vorschläge dafür stehen in §7 des Reviews
> und brauchen eine eigene Freigabe.

---

## S1 · Header-Version

**Anker:** `**Version:** 3.6.0`
**Patch:** ersetzen durch `**Version:** 3.7.0`

## S2 · §4 — die Sparraten-Funktionen filtern den Papierkorb

**Anker:** in der Bemerkungs-Spalte von `calculate_sparrate_for_month` das Textende
`… beide Seiten der Differenz verschöben sich gleich weit und die Abweichung wäre danach unsichtbarer als vorher (LL-23)`

**Patch:** am Ende der Zelle anfügen —

```
 **Seit v2-20 (`KU-1`) filtert sie `deleted_at IS NULL`** — eine Karte im Papierkorb zählt nicht mehr mit. Das ist **keine** Verletzung von §2.1: `card_delete_gate` lässt über `HAS_PAST_PLAN` keine Karte mit Vergangenheit löschen, der Filter kann historische Sparraten also strukturell nicht bewegen.
```

**Anker:** in der Bemerkungs-Spalte von `calculate_planned_sparrate_for_month` das
Textende `… Prüfsumme … identisch (e80bf401…)`

**Patch:** am Ende der Zelle anfügen —

```
 **Seit v2-20 filtert auch sie `deleted_at IS NULL`** — sie muss mitziehen, sonst driften Ist und Plan auseinander und die Treiber müssten eine Karte erklären, die es nicht mehr gibt.
```

## S3 · §4 — Ordner-Funktion und Treiber

**Anker:** in der Bemerkungs-Spalte von `get_category_amounts_for_month` das Textende
`… liefe hier der Plan und dort die Wirklichkeit, bräche Prüfanker 1 sofort`

**Patch:** anfügen —

```
 **Seit v2-20 filtert sie `deleted_at IS NULL`** — sonst bräche Anker 1 in die andere Richtung. Die Posten-Zahl stimmt dadurch wieder mit den sichtbaren Karten überein; vorher konnte die Kachel „4 Posten" bei drei Karten melden.
```

**Anker:** in der Bemerkungs-Spalte von `get_year_deviation_drivers` das Textende
`… Ein Frontend-Limit von 3 schnitte im Juli 2026 genau diese Zeile ab`

**Patch:** anfügen —

```
 **Seit v2-20 filtert sie `deleted_at IS NULL`** — sonst bräche die B2-Invariante: Die Treiber erklärten eine Karte, die in keiner der beiden Sparraten mehr vorkommt.
```

## S4 · §6 — die Lösch-Logik

**Anker:** in der `**cards**`-Zeile der Lösch-Tabelle der Satzteil
`**Wichtig:** \`deleted_at\`-Filterung ist UI-Concern, nicht Berechnungs-Concern — Sparraten-RPCs (\`calculate_sparrate_for_month\`, \`calculate_planned_sparrate_for_month\`) ignorieren \`deleted_at\` (§2.1 Snapshot-Integrität).`

**Patch:** ersetzen durch —

```
**Seit v2-20 (`KU-1`) gilt das Gegenteil für den Papierkorb:** Die vier Aggregations-RPCs (`calculate_sparrate_for_month`, `calculate_planned_sparrate_for_month`, `get_category_amounts_for_month`, `get_year_deviation_drivers`) filtern `deleted_at IS NULL`. §2.1 bleibt davon unberührt — sie schützt historische Sparraten, und die kann eine Papierkorb-Karte gar nicht tragen: `card_delete_gate` lässt über `HAS_PAST_PLAN` keine Karte mit Vergangenheit löschen. Der Filter wirkt ausschließlich im laufenden Monat und in der Zukunft. **Die frühere Begründung, Papierkorb-Karten trügen „ohnehin 0 bei", war falsch** — sie gilt für die *Treiber* (`delta = ist − plan = 0`) und nicht für die *Sparrate* (Beitrag = Plan). Belegt am 15.08.2026: eine gelöschte Einnahme-Karte hielt die August-Sparrate 355,00 € zu hoch.
```

## S5 · §4 — das Lösch-Tor

**Anker:** die Tabellenzeile, die `card_delete_gate` beschreibt

**Patch:** am Ende der Bemerkungs-Spalte anfügen —

```
 **Seit v2-20 (`KU-2`) blockiert `HAS_STATES` nur noch bei Monats-Zuständen aus VERGANGENEN Monaten** (`month < date_trunc('month', now())`). Vorher blockierte jeder Zustand — eine frisch angelegte Karte wurde damit unlöschbar, sobald man einmal den Betrag angepasst oder auf „bezahlt" getippt hatte, und bei einer `ONCE`-Karte gab es keinen Ausweg („Beenden" existiert dort nicht). `HAS_LINKS` und `HAS_PAST_PLAN` unverändert. ⚠️ **`src/app/page.tsx` bildet dieses Tor nach** (Vorberechnung statt 31 RPC-Aufrufe) — wer die Regel hier ändert, muss sie dort mitziehen, sonst graut das Menü aus, was die Datenbank erlaubt.
```

## S6 · Zwei Stellen, die der neuen Regel WIDERSPRACHEN

**Beim Anwenden gefunden**, nicht vorher geplant — und zwingend, sonst stünde die
Schema-Doku gegen sich selbst.

**Anker:** die Invarianten-Zeile `| **UI-Hide ändert keine Aggregation** | …`

**Patch:** Überschrift und Inhalt ersetzen. Die Zusage „hat **keinen Effekt** auf
`calculate_sparrate_for_month`" gilt nicht mehr. Neu: Der Papierkorb ändert die
Aggregation sehr wohl — historische Sparraten bleiben trotzdem stabil, aber durch das
**Lösch-Tor**, nicht durch die Aggregation.

**Anker:** in §7 der Satz
`Die Sparrate-RPCs **dürfen nicht filtern** (§2.1 Snapshot-Integrität).`

**Patch:** Absatz ersetzen. `is_card_active_in_month` filtert weiterhin nicht — das
bleibt. Aber die Liste der Konsumenten, die selbst filtern, wächst um die vier
Aggregations-RPCs. Der alte Satz stammte aus der Zeit des Verbergens und ist abgelöst.

> **Warum das hier steht und nicht stillschweigend passierte:** Beide Sätze waren
> eindeutige, ausdrückliche Zusagen über Rechenverhalten. Sie einfach stehen zu lassen
> hätte die nächste Sitzung in die Irre geführt — genau der Fall, vor dem LL-22 warnt.

---

## Anwendung

Alle Anker vor dem Schreiben auf Eindeutigkeit geprüft. Der Versions-Bump (S1) ist eine
**eigene** Patch-Stelle. **S6 kam beim Anwenden dazu** und ist oben nachdokumentiert.
