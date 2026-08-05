# Befunde — Liquiditäts-Vorschau („reicht mein Geld bis Monatsende?")

> **Was das hier ist:** die Vorab-Analyse zu der Idee, beim Öffnen der App zu sehen,
> welche wiederkehrenden Ausgaben und Einnahmen noch ausstehen — und was sie zusammen
> ausmachen. Erhoben am **04./05. August 2026** in der Ideen-Runde, **bevor** etwas
> gebaut oder geschnitten wurde.
>
> **Wie es entstanden ist:** eigene Messungen gegen die Produktiv-Datenbank
> (ausschließlich `SELECT`), Prüfung der drei CSV-Parser und ein Blick in den Kopfblock
> des DKB-Giro-Abzugs.
>
> **Wofür es da ist:** Die Roadmap trägt Themen, keine Diagnosen (Roadmap §6). Das
> Paket **Liquiditäts-Vorschau** verweist hierher.
>
> **Enthält Beweismaterial für die offene Entscheidung E1** — siehe Befund L4. Das ist
> der wichtigste Einzelbefund dieses Papiers, weil E1 heute Arbeit in Paket 1 blockiert.

---

## 1. Die Idee und was davon beschlossen ist

**Die Idee (User, 04.08.2026):** Beim Öffnen der App sichtbar machen, welche
wiederkehrenden Ausgaben und Einnahmen zum Stichtag noch ausstehen, und ihre Summe —
um abschätzen zu können, ob das Guthaben auf dem DKB-Girokonto noch reicht.

**In der Ideen-Runde beschlossen:**

| Frage | Beschluss |
|---|---|
| Soll die App den Kontostand kennen? | **Nein.** Nur die Ausstehend-Summe; den Kontostand liefert der User im Kopf. Begründung: Der Wert aus dem Import ist eine Momentaufnahme und veraltet sofort (L1). |
| Woher weiß die App, dass etwas abgebucht ist? | **Aus einem Fälligkeitstag je Karte** — nicht aus dem Import (zu alt) und nicht aus dem Bezahlt-Häkchen (nie benutzt, L6). Die Aussage ist damit eine **Vorhersage**, keine Feststellung: „war am 1. fällig", nicht „ist bezahlt". |
| Brutto oder Anteil bei gemeinsamen Posten? | **Anteil** — und zwar dieselben Beträge, die die Sparrate ohnehin verwendet. Durch L4 sachlich entschieden, nicht durch Abwägung. |
| Fixkosten und Budget zusammen? | **Getrennt ausweisen.** Ein Dauerauftrag ist ein Termin, ein Budget eine Erlaubnis (L7). |
| Kreditkarten-Abrechnung? | **Erste Fassung ohne.** Bekannte Lücke, dokumentiert (L5). |

---

## 2. Messungen gegen die Produktiv-Datenbank

*Gemessen am 04./05.08.2026 gegen `nflkobdfdhncrtjncpmq`, ausschließlich lesend.
Stichmonat August 2026. Split-Faktor August: **0,57209**.*

### 2.1 Was im August noch aussteht

Aktive Karten ohne zugeordnetes Fragment und ohne Bezahlt-Häkchen — 21 Stück, **alle
wiederkehrend** (keine Einmal-Karte):

| | Anzahl | Betrag (Anteil) |
|---|---|---|
| Fixkosten ICH | 12 | 668,40 € |
| Fixkosten GEMEINSAM | 4 | 1.163,62 € |
| Einnahmen | 2 | −18,00 € |
| **Fest, netto** | **18** | **1.814,02 €** |
| Budget (Tanken 240 · Haushaltsgeld 200 · Privat 150) | 3 | 590,00 € |
| **Gesamt** | **21** | **2.404,02 €** |

Zum Vergleich: mit Brutto-Beträgen bei den gemeinsamen Posten wären es **3.274,39 €** —
**870,37 € zu viel**. Warum das die falsche Zahl wäre, steht in L4.

### 2.2 Aktualität des Datenbestands

| | |
|---|---|
| Jüngste Buchung in der App | **31.07.2026** |
| Buchungen im August | **0** |
| Karten im August als „bezahlt" abgehakt | **0** |
| Karten **jemals** als „bezahlt" abgehakt | **0** |
| Kontostand laut letztem Abzug | **254,97 €** (Stand 23.07.2026) |

---

## 3. Befunde

### L1 · Der Kontostand steht im Import und wird weggeworfen
**Schwere: MITTEL — zugleich Chance**
Der DKB-Giro-Abzug trägt den Kontostand in Zeile 3 seines Kopfblocks:
`"Kontostand vom 23.07.2026:";"254,97 €"`. Der Parser scannt bis zu acht Zeilen nach der
Kopfzeile, die mit `Buchungsdatum` beginnt, und **überspringt alles davor**. Die Zahl ist
seit dem ersten Import in jeder Datei vorhanden und wird nicht gelesen.
**Beleg:** `import_data/23-07-2026_Umsatzliste_DKB_Girokonto_…_2026.csv` Zeile 3;
`src/lib/dkb-csv.ts:41-79` (`HEADER_FIRST_FIELD`, `HEADER_SCAN_LINES`).
**Warum nicht offensichtlich:** Der Parser ist auf Transaktionszeilen ausgelegt; der
Kopfblock gilt als Formatrauschen und ist es in jeder anderen Hinsicht auch.
**Bewertung:** Trotzdem **bewusst nicht genutzt**. Ein Feld mit der Überschrift
„Kontostand", das so alt ist wie der letzte Import (heute zwölf Tage), sieht aus wie eine
Tatsache und ist eine Erinnerung — in einer Liquiditätsprüfung schlechter als kein Feld.
Wird der Import häufiger, ist es ein kleiner Nachtrag.

### L2 · Karten haben keinen Fälligkeitstag
**Schwere: BLOCKER für die Idee**
`cards` trägt `attribution`, `created_at`, `deleted_at`, `first_active_month`,
`frequency`, `id`, `last_active_month`, `name`, `type`, `updated_at`, `user_id` — **kein
Feld für den Tag im Monat**. „Zum Stichtag ausstehend" ist damit heute nicht
beantwortbar; die einzige mögliche Aussage wäre „in diesem Monat noch nicht abgebucht",
und die ist wegen L6 wertlos.
**Beleg:** `src/lib/supabase/types.ts`, Block `cards.Row`.
**Warum nicht offensichtlich:** Frequenz und erster aktiver Monat wirken wie eine
vollständige Terminangabe — sie legen aber nur den *Monat* fest, nie den Tag.
→ **Wird `LQ-1`.**

### L3 · Fragmente kennen das eigene Konto nicht
**Schwere: SCHWER**
`fragments` trägt `counterparty_iban` — die IBAN der **Gegenseite**. Es gibt keine Spalte
für das eigene Konto, auf dem die Buchung liegt. Nach dem Import sind Giro-, Visa- und
Cortal-Bewegungen nicht mehr auseinanderzuhalten; die Herkunftsdatei wird nicht
festgehalten. Die Frage „reicht mein **DKB-Girokonto**" lässt sich deshalb nicht auf ein
Konto eingrenzen.
**Beleg:** `src/lib/supabase/types.ts`, Block `fragments.Row`; alle drei Parser liefern
dasselbe Ausgabeschema ohne Konto-Feld (`dkb-csv.ts`, `dkb-visa-csv.ts`, `cortal-csv.ts`).
**Warum nicht offensichtlich:** Die Transfer-Erkennung arbeitet mit `own_ibans` und
erweckt den Eindruck, die App kenne die eigenen Konten — sie kennt sie nur, um die
*Gegenseite* dagegen zu prüfen.
**Folge:** Für die erste Fassung unkritisch, weil praktisch alle wiederkehrenden Posten
vom Girokonto abgehen. Relevant wird es bei L5.

### L4 · Die Daueraufträge stehen auf dem Anteil, nicht auf brutto — Beweismaterial für E1
**Schwere: SCHWER (positiv verwertbar)**
Bei **allen vier** gemeinsamen Karten entspricht der tatsächlich abgebuchte Betrag exakt
dem rechnerischen Anteil des Users, auf den Cent:

| Karte | Plan (brutto) | Anteil (× 0,57209) | tatsächlich abgebucht | Zweck im Auszug |
|---|---|---|---|---|
| Miete | 1.904,00 € | 1.089,26 € | **−1.089,26 €** | „Miete (Domi)" |
| Strom – Mainova | 63,00 € | 36,04 € | **−36,04 €** | „Strom (Domi)" |
| Internet – Vodafone | 39,98 € | 22,87 € | **−22,87 €** | „Internet (Domi)" |
| Rechtsschutz – Adam Riese | 27,01 € | 15,45 € | **−15,45 €** | „Rechtsschutzversicherung (Domi)" |

**Beleg:** `SELECT` auf `fragments` für Juni und Juli 2026; `card_planned_timeline` für
die Planwerte; `get_split_factor(user_id,'2026-08-01') = 0,57209`.
**Warum nicht offensichtlich:** Keine gemeinsame Karte hat je ein verknüpftes Fragment
(bestätigt `BF-4`) — die Übereinstimmung ist deshalb nirgends in der App sichtbar und nur
durch einen direkten Abgleich der Rohbuchungen gegen die Planwerte auffindbar.
**Zwei Folgerungen:**
1. **Für dieses Paket:** Die Liquiditätssicht braucht keine eigene Brutto-Rechnung. Sie
   darf exakt die Beträge nehmen, die die Sparrate verwendet. Das erspart eine zweite
   Rechenart und damit eine Quelle für Abweichungen.
2. **Für E1:** Die offene Entscheidung lautet *„Was bedeutet die Zahl auf einer
   gemeinsamen Karte?"*. Die Karte zeigt heute den Bruttowert (spec-konform, §4.5);
   abgebucht wird der Anteil. Das ist **kein** Beweis dafür, was die Karte zeigen *soll* —
   aber es ist ein starkes Argument für den Anteil, und es lag bei der Formulierung von
   E1 nicht vor.

### L5 · Die Kreditkarten-Abrechnung ist ein Giro-Abfluss ohne Karte
**Schwere: MITTEL**
Die Visa-Abrechnung belastet das Girokonto um den **24.** jedes Monats, ist als
`INTERNAL_TRANSFER` markiert und zählt deshalb korrekt **nicht** in die Sparrate — es ist
eine Bewegung zwischen eigenen Konten. Für die Liquidität des Girokontos ist sie
dagegen ein echter Abfluss, den **keine Karte abbildet**:

| Datum | Betrag |
|---|---|
| 24.02.2026 | −2,23 € |
| 24.04.2026 | −64,73 € |
| 27.05.2026 | −8,47 € |
| 24.07.2026 | −172,60 € |

**Beleg:** `SELECT` auf `fragments` mit `description ILIKE '%Abrechnung%'`, 2026.
**Warum nicht offensichtlich:** Die Regel „Übertrag zählt nicht" ist für die Sparrate
richtig und tief verankert (dreifach abgesichert laut CLAUDE.md §6) — dass genau diese
Regel eine Liquiditätssicht blind macht, folgt erst aus dem Perspektivwechsel von
*Vermögensänderung* zu *Kontostand*.
**Folge:** Die Ausstehend-Summe ist systematisch **leicht zu optimistisch**. Erste
Fassung ohne; seriös vorhersagbar erst, wenn Konten wieder unterscheidbar sind (L3) —
also mit Mehrkonten Stufe 2. → **Wird `LQ-3`.**

### L6 · Der Datenstand trägt keine Ist-Aussage; das Bezahlt-Häkchen wurde nie benutzt
**Schwere: BLOCKER für die naive Umsetzung**
Die jüngste Buchung in der App ist vom **31.07.2026**, es gibt **null** August-Buchungen,
und `card_monthly_states.manually_paid` ist in der **gesamten Historie** kein einziges Mal
gesetzt worden. Eine Umsetzung, die „ausstehend" als *„kein Fragment verknüpft und nicht
abgehakt"* definiert, meldete heute alle 21 Posten als offen — einschließlich der Miete,
die am Monatsanfang längst abgebucht wurde.
**Beleg:** `SELECT max(transaction_date), count(*) FILTER (transaction_date >= '2026-08-01')
FROM fragments`; `SELECT count(*) FROM card_monthly_states WHERE manually_paid`.
**Warum nicht offensichtlich:** Beide Mechanismen existieren und funktionieren — sie sind
nur nicht *aktuell* genug bzw. werden nicht benutzt. Die Lücke ist eine Nutzungs-Tatsache,
keine Code-Tatsache, und nur durch Messung sichtbar.
→ **Begründet die Entscheidung für den Fälligkeitstag (L2) statt für Import oder Häkchen.**

### L7 · Budget und Fixkosten sind für eine Liquiditätsfrage verschiedene Dinge
**Schwere: MITTEL**
Von den 2.404,02 € sind **590,00 €** Budget (Tanken 240, Haushaltsgeld 200, Privates
Budget 150). Ein Budget ist eine **Erlaubnis** ohne Termin, kein Dauerauftrag; es wird
über den Monat verbraucht und lässt sich zurückhalten, wenn es eng wird. Zusätzlich hat
ein Budget gar keinen Fälligkeitstag und passt damit strukturell nicht in dieselbe
Rechnung. Die §4.3-Regeln behandeln BUDGET ohnehin abweichend („Realität gewinnt" gilt
dort nicht).
**Beleg:** Karten-Inventur August 2026; Design-Doku §4.3.
**Warum nicht offensichtlich:** Beide erscheinen im Karussell als Karte mit Plan-Betrag
und wirken dadurch gleichartig.
→ **Getrennt ausweisen, nie als eine Zahl.**

---

## 4. Was daraus für die Roadmap folgt

| Folgerung | Wo sie hinwirkt |
|---|---|
| Neues Feld **Fälligkeitstag** je Karte, plus Oberfläche zum Setzen | `LQ-1` (Datenbank-Eingriff, `db-eingriff`) |
| Anzeige **fest** und **Budget** getrennt, gerechnet gegen das heutige Datum | `LQ-2` |
| Beträge = **dieselben wie in der Sparrate**, keine zweite Rechenart | `LQ-2`, folgt aus L4 |
| **Kreditkarten-Abrechnung** erst mit unterscheidbaren Konten | `LQ-3` in Mehrkonten Stufe 2 |
| **Kontostand aus dem Import** erst bei häufigerem Import | Notiz am Paket, kein eigenes Thema |
| **E1-Beweismaterial** | Vermerk an `BF-4` in Paket 1 |

---

## 5. Offene Gestaltungsfrage

**Vor dem Schnitt an die Fähigkeit `design-direktor`:**

**Wo steht diese Zahl?** Das Kernprinzip lautet „ein Screen, ein Monat, eine primäre
Zahl" — und die primäre Zahl ist die Sparrate. Eine zweite prominente Zahl daneben zu
setzen, ist eine **Rangfolge-Entscheidung**, kein Layout-Detail. Mitzuentscheiden ist
die Formulierung: Die Aussage ist eine Vorhersage („war am 1. fällig"), keine
Feststellung („ist bezahlt") — der Wortlaut muss das tragen, ohne umständlich zu werden.

---

*Befunde · Antigravity Finance · erhoben am 04./05. August 2026 in der Ideen-Runde ·
eigene Messungen gegen die Produktiv-Datenbank, Prüfung der CSV-Parser*
