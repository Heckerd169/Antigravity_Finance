# Befunde 15.08.2026 — aus der August-Kuratierung

> **Herkunft:** Der User hat nach dem Merge von v2-19 den August kuratiert (Karten aus
> Rohmasse-Fragmenten angelegt, Zahlungen zugeordnet, eine Karte gelöscht) und dabei
> drei Dinge gemeldet.
>
> **Status: DIAGNOSE, nichts gebaut.** Alle drei sind gegen die Produktiv-Datenbank
> reproduziert, nicht aus der Doku erschlossen (§7 Regel 10 / LL-22). Was daraus wird,
> entscheidet der User.
>
> **Einer davon ist ein echter Rechenfehler**, einer eine Sackgasse in der Bedienung,
> einer eine Verwechslung — aber eine, die die Anzeige mitverursacht.

---

## Der Datenstand, auf dem alles beruht

Ordner **Urlaub**, August 2026 — vier Karten sind in der Rechnung, **drei** davon
sichtbar:

| Karte | Typ | Ist | Beitrag | sichtbar? |
|---|---|---|---|---|
| Bezahlung Bergführer 1 | FIXED_COST | 504,95 € | −504,95 € | ja |
| Sölden Geld abheben 1 | FIXED_COST | 204,95 € | −204,95 € | ja |
| Sölden Geld abheben 2 | FIXED_COST | 204,95 € | −204,95 € | ja |
| **Dominik Hecker \| Bergtour** | **INCOME** | **355,00 €** | **+355,00 €** | **NEIN — im Papierkorb seit 07:36** |

Summe der drei sichtbaren: **−914,85 €** · Kachel zeigt: **−559,85 €** ·
Differenz: **exakt 355,00 €**.

---

# B1 · Eine Karte im Papierkorb rechnet weiter mit

**Schweregrad: hoch.** Es bewegt die Sparrate.

## Was passiert

`calculate_sparrate_for_month`, `calculate_planned_sparrate_for_month` und
`get_category_amounts_for_month` filtern `cards.deleted_at` **nicht** — bewusst, das ist
die Snapshot-Integrität §2.1. Das Karussell filtert dagegen sehr wohl
(`WHERE deleted_at IS NULL`).

Ergebnis: Die gelöschte Einnahme-Karte ist unsichtbar, zählt aber weiter.
**Die Ordner-Kachel verrät es sogar** — sie sagt `4 Posten`, während darunter drei
Karten liegen. Das ist der einzige sichtbare Hinweis.

**Gemessen im Trockenlauf** (`cleanup_expired_card_trash()`, zurückgerollt):

| | vorher | nachher |
|---|---|---|
| Sparrate August (Ist) | 1.076,24 € | **721,24 €** |
| Ordner „Urlaub" | −559,85 € | **−914,85 €** |
| hart gelöschte Karten | — | 1 |

## Warum die dokumentierte Absicherung nicht greift

Die Schema-Doku begründet den fehlenden Filter so:

> *„Papierkorb-Karten haben per Lösch-Gate weder Links noch States noch
> Vergangenheits-Plan → `delta = 0` → fallen ohnehin aus dem Ranking."*

**Der Satz ist für die Treiber richtig und für die Sparrate falsch.** Er schließt von
einer **Differenz** auf einen **Absolutwert**:

- Im Treiber ist `delta = ist − plan`. Eine frische Karte ohne Fragmente hat
  `ist = plan`, also `delta = 0` — sie fällt tatsächlich aus dem Ranking. ✅
- In der Sparrate ist der Beitrag `calculate_card_amount_for_month` = **der Plan
  selbst**, hier 355,00 €. Der ist nicht 0. ❌

Das Lösch-Gate prüft Links, States und Vergangenheits-Plan — **nicht den Planwert**.
Eine Karte, die im laufenden Monat beginnt, ist löschbar und trägt trotzdem ihren
vollen Betrag.

> Dieselbe Fehlerklasse wie LL-23: Eine Aussage über Differenzen wird auf Absolutwerte
> übertragen, und es fällt nicht auf, weil keine Zahl offensichtlich falsch *aussieht*.

## Warum es sich manchmal von selbst erledigt — und warum das nichts hilft

`cleanup_expired_card_trash()` löscht abgelaufene Papierkorb-Karten hart und wird vom
Frontend **vor jeder Lebenszyklus-Aktion** aufgerufen. Die Aufbewahrung beträgt
**60 Sekunden** (`app_config`).

Der Papierkorb-Eintrag dieser Karte ist längst abgelaufen — sie wird beim nächsten
Kontextmenü-Klick des Users verschwinden. **Bis dahin rechnet sie mit.** Wie lange das
dauert, ist unbestimmt: Wer nur schaut und nichts anfasst, sieht den falschen Wert
beliebig lange.

## Mögliche Abhilfen — nicht entschieden

| | Weg | Kosten |
|---|---|---|
| **a** | Aggregations-RPCs filtern `deleted_at IS NOT NULL` heraus | Bricht mit §2.1 Snapshot-Integrität — die müsste erst neu entschieden werden |
| **b** | `cleanup_expired_card_trash()` auch beim Laden des Dashboards rufen | Kleinster Eingriff, aber ein Schreibzugriff im Lesepfad |
| **c** | Aufbewahrung von 60 s auf einen sinnvollen Wert heben und **a** umsetzen | Sauberste Trennung: Papierkorb heißt „zählt nicht mehr", Wiederherstellen bringt es zurück |

**Empfehlung: c**, aber es ist eine Produktentscheidung. 60 Sekunden Aufbewahrung
heißt heute faktisch: Der Papierkorb ist kein Papierkorb, sondern eine
Rückgängig-Taste mit Nachlauf.

---

# B2 · „Bezahlung Bergführer 1" — die Karte gibt es, der Betrag meint etwas anderes

**Schweregrad: mittel.** Kein Rechenfehler, aber die Anzeige lädt zur Verwechslung ein.

## Was gemeldet wurde

> *„In der Welle beim Hovern über den August wird als Treiber ‚Bezahlung Bergführer 1
> −300,00 €' gezeigt. Allerdings existiert diese Karte nirgends?"*

## Was tatsächlich der Fall ist

**Die Karte existiert** — Ordner „Urlaub", August, nicht gelöscht, angelegt um 07:22.
Sie ist sogar eine der drei, die der User in B1 selbst zusammenzählt (504,95 €).

**Die −300,00 € sind nicht ihr Betrag, sondern ihre Abweichung:**

```
Ist   504,95 €   (ein VISA-Debitkartenumsatz ist zugeordnet)
Plan  204,95 €
      ────────
delta −300,00 €   ← das steht im Treiber
```

Wer die Karte anhand der Zahl sucht, sucht nach „300" und findet „504,95" — und
schließt, es gebe sie nicht.

## Der eigentliche Befund

Die Treiber-Zeile trägt **Kartenname + Zahl**, ohne dass die Zahl sich als *Abweichung*
zu erkennen gibt (Design-Doku §9, Label-Format `{Kartenname} {±Betrag} €`). In einer
Liste, die „Abweichungs-Treiber" heißt, ist das logisch — beim Hovern über die Welle
steht dieser Titel aber nirgends.

**Das ist eine Gestaltungsfrage**, kein Fehler: Soll die Zeile den Bezug mitliefern
(etwa `Bezahlung Bergführer 1 · 300,00 € über Plan`)? Sie gehört zu `B2-F`, dem
offenen Punkt „Label-Format der Treiber-Zeilen" in Paket 7.

> **Zweite mögliche Ursache, vom User zu bestätigen:** Die Welle ist **unabhängig vom
> Header-Monat** (§9). Wer im Juli-Karussell steht und über den August hovert, sieht
> die August-Karten nicht — dann existiert die Karte „nirgends", weil man im falschen
> Monat sucht.

---

# B3 · Löschen unmöglich, und der Hinweis führt ins Leere

**Schweregrad: hoch für die Bedienung.** Eine echte Sackgasse.

## Was passiert

Der User legte aus einem Fragment eine Karte an, löste das Fragment wieder und wollte
die Karte löschen. Das Kontextmenü zeigte „Karte löschen" ausgegraut mit dem Hinweis:

> *Nicht löschbar: … . Stattdessen »Karte beenden…«.*

**„Karte beenden…" gibt es im Menü nicht.** `card-interactive.tsx`:

```tsx
{canEnd && ( … Karte beenden… )}          // Zeile 286 — nur wenn canEnd
{!deleteGate.deletable && (
  <div>… Stattdessen »Karte beenden…«.</div>   // Zeile 316 — IMMER
)}
```

`canEnd = card.frequency !== "ONCE"` (`card.tsx`). Bei einer **einmaligen** Karte ist
`canEnd = false` — der Verweis zeigt auf einen Menüpunkt, den es dort nie gibt.

**Alle fünf Karten, die der User heute angelegt hat, sind `ONCE`.** Karten aus einem
Fragment sind es typischerweise: eine Zahlung, ein Monat.

## Warum die Karte nicht löschbar war

Gemessen: `deletable = false`, Gründe `["HAS_LINKS", "HAS_STATES"]`.

**`HAS_STATES` ist der Haken.** Das Lösen eines Fragments entfernt den Link — aber der
Eintrag in `card_monthly_states` bleibt bestehen (etwa `manually_paid` von einem Klick
auf die Karte). Das Tor bleibt zu, und der Nutzer hat keinen Weg, den Zustand wieder
loszuwerden.

## Zwei getrennte Fragen

1. **Der Hinweis muss ehrlich sein.** Ohne „Beenden" darf er nicht darauf verweisen.
   Reine Textänderung, klein.
2. **Soll eine `ONCE`-Karte im laufenden Monat überhaupt unlöschbar sein?**
   `HAS_STATES` schützt die Historie — bei einer Karte, die heute angelegt wurde und
   deren Zustand aus einem Fehlklick stammt, schützt es nichts. Das ist eine
   Produktfrage und gehört zu `M2` (Verben und Gesten des Karten-Lebenszyklus).

---

## Was der User sofort tun kann

- **B1:** Irgendeine Kontextmenü-Aktion auf einer beliebigen Karte auslösen — dann
  räumt die App den Papierkorb auf, und der August springt auf **721,24 €**.
- **B3:** Kein Weg über die Oberfläche. Die Karte lässt sich weder löschen noch beenden.

## Nebenbefund ohne eigene Nummer

**Der Juli steht jetzt auf −8,84 €** — der User hat sein Gehalt zugeordnet und liegen
gelassen. Das ist die korrekte Zahl und der Beleg, dass `GE-1` in Produktion greift.
Die Momentaufnahme in CLAUDE.md §9 nennt noch 6,73 €; sie ist ausdrücklich
Orientierung und kein Sollwert, sollte aber bei Gelegenheit nachgezogen werden.
