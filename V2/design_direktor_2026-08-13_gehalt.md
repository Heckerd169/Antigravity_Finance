# Gestaltungs-Record 13.08.2026 — das Gehalt wird zuordenbar

> **Rolle:** Design-Direktor (Fähigkeit `design-direktor`, CLAUDE.md §4).
> **Form:** Der User hat beide Fragen **direkt entschieden**, ohne dass eine eigene
> Runde nötig war. Der Record entsteht trotzdem — §4 verlangt, dass die Entscheidung
> **vor** dem Bauen fällt und **festgeschrieben** wird, statt nur besprochen zu werden.
> Eine Runde nachzuspielen, deren Ergebnis schon vorliegt, wäre Zeremonie gewesen.
>
> **Betrifft:** Sprint **v2-19**. Briefing: `sprints/sprint_v2-19_briefing.md`.

---

## Der Anlass

Der User hat versucht, sein Gehalt aus der Rohmasse auf die Netto-Kachel im
Einkommens-Ordner zu ziehen. **Es ging nicht** — und zwar aus einem strukturellen
Grund: Ein Fragment kann nur auf eine **Karte** gezogen werden, und das Netto ist
keine.

Dahinter steckt eine Lücke, die bis dahin niemand benannt hatte:

> **Das Netto ist geplant, nicht gemessen.** Juli 2026 geplant **4.165,11 €**,
> tatsächlich überwiesen **4.149,54 €**. Die Differenz von **15,57 €** sieht die App
> nicht — und würde sie nie sehen.

„Realität gewinnt" gilt bei Fixkosten und Einnahmen. Beim Gehalt galt es nicht.

**Der Ordner ist erst seit v2-17 da.** Vorher war das Gehalt im Karussell überhaupt
nicht sichtbar; die Design-Doku hatte das als Nebeneffekt notiert (*„Das Gehalt wird
zum ersten Mal überhaupt im Karussell sichtbar"*). Dass daraus binnen fünf Tagen ein
Bedienversuch wurde, ist die eigentliche Nachricht: **Die Kachel sieht aus wie eine
Karte und ist keine.**

---

## Entscheidung A · Die Netto-Kachel verhält sich beim Ablegen wie eine Fixkosten-Karte

**Wortlaut des Users:** *„Analog zu den anderen Fixkosten-Karten."*

Das heißt konkret:

| | |
|---|---|
| Beim Drüberziehen | dieselbe Hervorhebung wie bei einer Karte, die ein gültiges Ziel ist |
| Nach dem Ablegen | Plan und Wirklichkeit nebeneinander, wie bei einer Fixkosten-Karte mit verknüpftem Fragment |
| Lösen der Zuordnung | stellt den Planwert wieder her, das Fragment kehrt in die Rohmasse zurück |

**Warum das die richtige Antwort ist und nicht nur die bequeme:** Die Kachel *sieht*
bereits aus wie eine Karte. Sie sich beim Ziehen anders verhalten zu lassen als das,
wonach sie aussieht, wäre genau der Bruch, der den Bedienversuch überhaupt ausgelöst
hat. Gleiches Aussehen, gleiches Verhalten.

**Was die Entscheidung NICHT bedeutet:** Die Kachel wird keine Karte. Sie bekommt kein
Karten-Kontextmenü, keinen Lebenszyklus, keine „Betrag anpassen"-Funktion. Der Klick
öffnet weiterhin das bestehende Einkommens-Fenster (§10), nicht ein Karten-Menü.

## Entscheidung B · Die neue Treiber-Zeile heißt „Gehalt" und ist nicht anklickbar

**Wortlaut des Users:** *„Neue Treiber-Zeile soll ‚Gehalt' heißen und nicht anklickbar
sein."*

**Das Problem dahinter:** Die Abweichungs-Treiber im Jahres-Popup werden heute
**ausschließlich aus Karten** gebaut — jede Zeile trägt einen Kartennamen und meint
eine Karte, die es gibt. Weicht das Netto ab, entsteht die erste Zeile, hinter der
keine Karte steht. Sähe sie aus wie die anderen, wäre sie ein Versprechen, das ins
Leere führt.

**Der Name „Gehalt", nicht „Netto":** Es ist das Wort, das der User selbst benutzt.
Die App nennt den Ordner „Einkommen" und die Kachel zeigt das Netto — im Treiber geht
es aber um die konkrete Überweisung, und die heißt beim Nutzer Gehalt.

**Nicht anklickbar** heißt: kein Cursor-Wechsel, kein Hover-Zustand, kein Zielsprung.
Die Zeile trägt ihre Zahl und sonst nichts.

---

## Verworfen · Das Netto als echte Karte

Der User hat gefragt, warum nicht einfach eine Gehaltskarte angelegt wird, die im
Ordner liegt und wie jede andere funktioniert. **Die Frage ist berechtigt und die Idee
architektonisch sauberer als der heutige Sonderfall.** Sie ist nicht abgelehnt, sondern
**vertagt** — und liegt als `GE-3` in Paket 14.

**Wofür sie spricht:** Treiber-Liste und Ablageziel funktionierten ohne jede Änderung.
Der Sonderfall „Ordner mit einer Kachel, die keine Karte ist" verschwände. Und das
Kopfmodell des Users hätte recht — der Bedienversuch war kein Fehler, sondern ein
Hinweis.

**Was dagegen entschieden hat — ein Grund, nicht vier:**

> **Das Gehalt läge danach an zwei Orten.** Der Partner-Anteil wird aus dem **Brutto**
> berechnet (`get_split_factor` liest `gross_annual`, gemessen — nicht angenommen).
> Das Brutto müsste in der Einkommens-Zeitreihe bleiben, das Netto wanderte auf die
> Karte. Heute stehen beide in **einer** Zeile. Getrennt hieße: Eine Gehaltserhöhung
> ist zweimal einzutragen, und wird es einmal vergessen, driften Brutto und Netto
> auseinander, **ohne dass ein Wächter anschlägt**. Die Folge wäre ein still falscher
> Anteil an Miete, Strom und Internet — die teuerste Fehlerklasse dieses Projekts.

Dazu vier kleinere, aber echte Punkte: **Onboarding** speist das Netto aus Brutto und
Steuerklasse (`estimate_net_monthly` über `net_estimation_brackets`) in die Zeitreihe —
eine Karte wird davon nicht gespeist. **Der Partner** würde asymmetrisch behandelt
(Karten gehören ausschließlich `ICH`, §13 „keine Partner-only Karten"). **Die Historie**
2025 ist exakt Netto × 12 = 48.445,32 €, weil dort keine Karte aktiv ist — eine
Gehaltskarte müsste bis Januar 2025 zurückdatiert werden (`DA-1`). Und **die Formel**
`Sparrate = Netto + Einnahmen − Kosten` ist in Design-Doku §4.2 normativ: Das Netto zur
Karte zu machen ändert nicht die Umsetzung, sondern die **Spezifikation**.

**Der Größenunterschied, gemessen:** Am Netto hängen **sechs** Datenbank-Funktionen
(`get_net_monthly_for_month`, `get_split_factor`, beide Sparrate-Funktionen,
`get_category_amounts_for_month`, `estimate_net_monthly`) und **vier** Frontend-Dateien
(`onboarding/actions.ts`, `income-split/actions.ts`, `page.tsx`, `lib/rpc.ts`). Der
gewählte Weg fasst **eine** Rechenfunktion an plus die Treiber.

**Und die Reihenfolge ist umkehrbar, aber nur in eine Richtung:** Der schmale Weg
verbaut die Karten-Idee nicht — die kleine Ist-Ablage wird später entweder übernommen
oder fällt ersatzlos weg. Umgekehrt hieße es, das Fundament umzustellen, bevor der User
das Zuordnen ein einziges Mal erlebt hat. **Der natürliche Moment für `GE-3` ist der
Sprint, in dem `DA-1` ansteht** — dann fällt die teuerste Voraussetzung, die
Rückdatierung, ohnehin an.
