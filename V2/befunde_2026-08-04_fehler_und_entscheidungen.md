# Befunde 4. August 2026 — fünf Fehler aus dem Test nach der Juli-Kuratierung

**Gemeldet von:** Dominik (Test nach Juli-Import + erster echter Fragment-Zuordnung)
**Diagnostiziert von:** Claude Code (zentraler Arbeits-Agent, PM + Architekt)
**Stand des Repos bei Diagnose:** `main` @ `0165b34` (nach Sprint v2-07)
**Bilder:** `screenshots/2026-08-04_fehlerliste/` (lokal, nicht im Repository)

---

## 0. Wie dieses Dokument zu lesen ist

Fünf gemeldete Fehler, alle diagnostiziert und gegen die Produktiv-Datenbank
belegt — **keiner ist umgesetzt**. Jeder Eintrag trennt sauber zwischen dem, was
gemessen wurde, und dem, was vorgeschlagen wird.

**Wichtig für jede Folge-Sitzung:** Drei der fünf sind eindeutige Programmfehler
und können nach Freigabe direkt umgesetzt werden. Zwei berühren die
Rechenlogik in der Datenbank und hängen an einer **User-Entscheidung**, die noch
aussteht (Abschnitt 7). Ohne diese Entscheidung darf an ihnen nicht gebaut
werden.

**Diagnose-Grundsatz, der sich hier zweimal bewährt hat:** Beobachtetes
Verhalten sagt nicht, wo die Ursache liegt. Fehler 4 sah nach einem
Anzeige-Fehler aus und ist in Wahrheit ein Modellierungs-Problem mit
Geldwirkung; Fehler 5 sah nach einem Anzeige-Fehler aus und ist ein
Rechenfehler, der bereits 900 € in der Juli-Sparrate bewegt.

---

## 1. Ausgangslage der Daten

Gemessen am 4. August 2026, lesend gegen `nflkobdfdhncrtjncpmq`:

| Monat | Ist-Sparrate | Plan-Sparrate |
|---|---|---|
| 2026-05 | −86,77 € | −86,77 € |
| 2026-06 | 4.208,76 € | 4.220,53 € |
| **2026-07** | **−1.222,75 €** | **55,44 €** |
| 2026-08 | 1.761,08 € | 1.761,08 € |
| 2026-09 | 1.824,08 € | 1.824,08 € |

Der Juli ist der erste Monat mit echter Kuratierung — daher weichen dort Ist
und Plan erstmals voneinander ab, und daher treten die Fehler 2, 4 und 5
überhaupt erst zutage. Die alten Anker aus dem Juli-Stand (2026 flach
1.931,18 €) sind **überholt** und dürfen nicht mehr als Sollwert dienen.

---

## 2. Fehler 1 — Euro-Zeichen bricht auf die nächste Zeile

**Symptom.** Auf einer Fragment-Karte in der Rohmasse steht der Betrag
`−1.089,26` und das `€` rutscht in die zweite Zeile.
Bild: `fehler-1_badge-ueberlauf-euro-zeichen.png`

**Diagnose.** Betrag und Vorschlags-Kästchen teilen sich eine Zeile. Das
Kästchen darf weder schrumpfen noch umbrechen (`flex-shrink: 0`,
`white-space: nowrap`), also wird der Betrag zusammengedrückt. Bei einem langen
Kartennamen wie „KI-VORSCHLAG: BERUFSUNFÄHIGKEIT — ALTE LEIPZIGER" reicht die
Spaltenbreite von 220 px für beides nicht.

**Einordnung.** Altbestand. Bereits im v2-07-Review §5.1 als offener Punkt
notiert, **nicht** durch die Badge-Farben aus v2-07 verursacht — deren Diff
enthält keine Geometrie-Änderung.

**Entschieden (Dominik, 04.08.2026):**
1. **Alle** KI-Vorschlags-Kästchen werden aus der **Anzeige** entfernt.
2. Die Datenbank berechnet den Vorschlag weiter — kein Schema-Eingriff, später
   mit einer Zeile wieder einschaltbar.
3. Die **automatische Zuordnung** ab 95 % Konfidenz bleibt unberührt. Sie ist
   keine Empfehlung, sondern eine fertige Zuordnung.
4. Die sechs Badge-Farbtöne aus v2-07 (A1) **bleiben im Code, als ungenutzt
   markiert** — nicht löschen.
5. Zusätzlich wird dem Betrag der Zeilenumbruch verboten, damit diese
   Fehlerklasse dauerhaft geschlossen ist, auch für das TRANSFER-Kästchen.

**Aufwand:** klein, reine Oberfläche. Keine Entscheidung mehr offen.

---

## 3. Fehler 2 — sinnloser Hinweis unter dem Ring bei negativer Sparrate

**Symptom.** Juli 2026 zeigt im Ring `−1.223 €` und darunter
`Plan fast 0 € — −1.223 € gespart`. Man spart keine minus 1.223 €.
Bild: `fehler-2_ring-subzeile-gespart-bei-negativ.png`

**Diagnose.** Belegt in `src/components/singularity-ring/index.tsx`, Zweig
`plan < DEGENERATE_PLAN_THRESHOLD` (Schwelle 100 €). Juli hat Plan 55,44 € →
der Sonderfall greift **korrekt**. Er verzweigt dann aber am **Vorzeichen des
Plans**:

- Plan negativ → `X € über/unter Plan` (vorzeichensicher)
- Plan positiv → `Plan fast 0 € — X € gespart` ← unterstellt positives Ist

**Warum es v2-03 überlebt hat.** N4b hat damals nur den Fall „Plan negativ"
behandelt. Die Kombination *kleiner positiver Plan + negatives Ist* war bis zur
Juli-Kuratierung nicht erreichbar, weil Ist und Plan in jedem Monat identisch
waren.

**Vorschlag.** Den Sonderfall auf **eine** Regel zusammenziehen, unabhängig vom
Plan-Vorzeichen:

| Fall | Text | Farbe |
|---|---|---|
| besser als geplant | `+X € über Plan` | Türkis |
| schlechter als geplant | `−X € unter Plan` | Rot |
| exakt auf Plan | `genau nach Plan` | Neutral |

Juli ergäbe `−1.278 € unter Plan`. Der Zusatz „Plan fast 0 €" entfällt — er war
ohnehin ungenau (55 € sind nicht fast 0), und die Euro-Aussage erklärt sich
selbst. Aus zwei Textzweigen wird einer; genau die Verzweigung nach Vorzeichen
hat den Fehler erzeugt.

**Offen:** ob die dritte Zeile („genau nach Plan") gewünscht ist — heute stünde
dort `+0 € über Plan`. Siehe Entscheidung **E3**.

**Aufwand:** klein, reine Oberfläche. Berührt §5 der Design-Doku (N4b-Wortlaut).

---

## 4. Fehler 3 — Einkommens-Popup unbenutzbar schmal

**Symptom.** Das Popup zum Eintragen der Gehälter öffnet als schmale Säule von
etwa 80 px Breite. Eingabefelder unlesbar, Inhalt läuft nach unten aus dem Bild.
Bild: `fehler-3_einkommens-popup-zusammengequetscht.png`

**Diagnose — vollständig belegt.** Das Popup ist `position: fixed; inset: 0`,
soll also das Browserfenster füllen. Es wird aber **innerhalb** des
Einkommens-Labels gezeichnet (`income-label.tsx` rendert `IncomeSplitPopup` als
Geschwister des Buttons, ohne Portal). Die Labels tragen in
`welle.module.css` die Regeln:

```css
.splitLeft  { right: calc(50% + 148px); transform: translateY(-50%); }
.splitRight { left:  calc(50% + 148px); transform: translateY(-50%); }
```

Ein Vorfahre mit `transform` wird nach CSS-Spezifikation zum Bezugsrahmen für
`position: fixed`-Nachfahren. Damit bedeutet „ganzer Bildschirm" ab dort „dieses
Label" — rund 80 px. `width: 100%` ergibt 80 px, `max-width: 480px` greift nie.

**Seit wann.** Eingebrochen mit Commit `21f7c49` („v2-02 P1 — Welle-Canvas").
Vorher saßen die Labels in einer normalen Zeile ohne `transform`; der
Sprint-7-Smoke hatte das Popup ausdrücklich geprüft (S3/S4/S7/S8/S10 grün).
Unbemerkt geblieben, weil die Einkommen seither per SQL gepflegt wurden.

**Vorschlag.** Das Popup per React-Portal an `document.body` zeichnen — exakt
das Muster, das **alle acht anderen Overlays** der App bereits nutzen
(`adjust-amount-overlay`, `end-card-overlay`, `card-interactive`,
`card-action-toast-provider`, `recurrence-popup`, `direct-create-overlay`,
`linked-fragments-overlay`). Das Einkommens-Popup stammt aus Sprint 1 und ist
das einzige, das nie umgestellt wurde.

**Vorab geprüft:**
- `income-split.module.css` definiert **keine** lokalen CSS-Variablen, nutzt nur
  globale Tokens → die Portal-Falle aus Sprint-5-K2.1 greift hier nicht.
- Zweiter Aufrufer ist `dashboard-dev-panel.tsx` (nur Entwicklung, außerhalb des
  Ringbereichs) — funktioniert heute und danach unverändert.

**Aufwand:** sehr klein (wenige Zeilen). **Priorität: hoch** — blockiert aktiv
das Eintragen neuer Gehälter.

---

## 5. Fehler 4 — gemeinsame Karten zeigen den Gesamtbetrag

**Symptom.** Alle als „Gemeinsam" markierten Karten zeigen den vollen Betrag
(Miete 1.904,00 €), erwartet wurde der eigene Anteil.
Bild: `fehler-4_gemeinsame-karte-zeigt-gesamtbetrag.png`

**Zur Anzeige: kein Programmfehler.** Design-Doku §4.5 ist eindeutig:

> „Anzeige-Betrag der Karte = 1.200 € (Realität) · Mein Anteil in der Sparrate
> = 60 % × 1.200 € = **720 €**"
> „Der Split rechnet immer fair, unabhängig davon wer real überwiesen hat. Wer
> überweist, ist eine Konto-Frage — nicht eine Fairness-Frage."

Die App verhält sich spec-konform. Die Erwartung weicht von der Spec ab.

**Dahinter steckt aber ein echtes Problem mit Geldwirkung.** Belegt aus der
Rechenvorschrift `calculate_sparrate_for_month`:

```
v_card_amount := calculate_card_amount_for_month(v_card.id, p_month);
IF v_card.attribution = 'GEMEINSAM' THEN
  v_card_amount := v_card_amount * v_split_factor;
```

Der Split wird auf **alles** angewendet, was die Karten-Funktion liefert — auch
auf eine Fragment-Summe. Die Spec unterstellt, dass die ganze Miete vom eigenen
Konto geht. Tatsächlich überweist Dominik **1.089,26 €**, also bereits seinen
Anteil (1.904 € × 57,21 % = 1.089,28 €).

Sobald die Miete zugeordnet wird:

| Schritt | Wert |
|---|---|
| Karte plant (Haushalt gesamt) | 1.904,00 € |
| Zugeordnete echte Zahlung | 1.089,26 € |
| „Realität gewinnt" → Karte rechnet mit | 1.089,26 € |
| Sparrate zieht nochmals 57,21 % ab | **623,17 €** |

→ Sparrate **rund 466 € pro Monat zu gut**, allein bei der Miete. Lautlos, ohne
Fehlermeldung.

**Aktueller Stand der Daten:** Es hat heute **keine einzige** gemeinsame Karte
ein verknüpftes Fragment (geprüft über alle Monate). Der Fehler ist also noch
nicht eingetreten — er ist einen Kuratierungs-Schritt entfernt. Betroffen wären
vier aktive Karten: Miete, Internet – Vodafone, Rechtsschutz – Adam Riese,
Strom – Mainova.

**Vorschlag (nicht entschieden).** Die Karte **plant** weiter den
Haushaltsbetrag, **zeigt** den eigenen Anteil, und eine zugeordnete echte
Zahlung wird **unverändert** übernommen, ohne zweiten Abzug. Das erfüllt alle
drei Ziele: erwartete Anzeige, korrekte Sparrate, und die Fairness-Rechnung
wandert weiterhin automatisch mit, wenn sich das Gehaltsverhältnis ändert.

**Bekannter Haken dieses Vorschlags:** Wird ausnahmsweise doch die ganze Miete
überwiesen und der Partner erstattet zurück, zählt die App das als eigene
Ausgabe und die Rückzahlung als eigene Einnahme. Unterm Strich richtig, im
einzelnen Monat aber anders als die reine Fairness-Sicht — was §4.5 heute
ausdrücklich ablehnt.

**Einordnung:** Eingriff in die Rechenfunktion → Probe auf der Übungs-Datenbank
vor Produktiv (Projekt-Tausch mit „Rennrad-Trainer"). Zusätzlich Änderung an
Design-Doku §4.5. **Hängt an Entscheidung E1.**

---

## 6. Fehler 5 — Fragmente werden ohne Vorzeichen addiert

**Symptom.** Budget-Karte „Aline Geburtstag" zeigt 1.068,11 € und
„918,11 € über Plan", obwohl unter den verknüpften Fragmenten mehrere
Gutschriften stehen (+50, +100, +100, +50 — Beiträge anderer zum Geschenk).
Bilder: `fehler-5a_budget-karte-1068-euro.png`,
`fehler-5b_verknuepfte-fragmente-gemischte-vorzeichen.png`

**Diagnose — Ursache im Quelltext gefunden.**
`calculate_card_amount_for_month`, Zeile 29:

```sql
SELECT COALESCE(SUM(ABS(f.amount)), 0), COUNT(*)
```

`ABS` wirft bei jedem Fragment das Vorzeichen weg, für **alle drei
Kartenarten**. Das funktioniert, solange alle Fragmente einer Karte in dieselbe
Richtung zeigen — eine Fixkosten-Karte hat nur Abbuchungen, eine
Einnahmen-Karte nur Eingänge. Sobald sich beide Richtungen mischen, werden sie
addiert statt verrechnet.

**Messung (Juli 2026, „Aline Geburtstag"):**

| | Wert |
|---|---|
| Verknüpfte Fragmente | 13 (6 positiv, 7 negativ) |
| Summe **mit** Vorzeichen | −168,11 € (= 168,11 € netto ausgegeben) |
| Summe **ohne** Vorzeichen | 1.068,11 € |
| Was die Karte anzeigt | **1.068,11 €** |
| Plan | 150,00 € |

**Es ist ein Fehler, keine Spec-Frage.** Design-Doku §11, Erstattungs-Leitfaden
(Beschluss 24.07.2026), beschreibt das Sollverhalten wörtlich:

> „bei BUDGET **senkt die Gutschrift den Verbrauch**, bei FIXED_COST die
> Realität"

Im selben Absatz wurde geschlossen, ein Eingriff in die Rechenfunktion sei
„nicht nötig" — auf Basis der ungeprüften Annahme, sie summiere
vorzeichenrichtig. Der Leitfaden beschreibt also ein Verhalten, das es nie gab.
Der Satz in §11 ist mit zu korrigieren.

**Reichweite — heute genau eine Karte.** Alle Karten aller Monate auf gemischte
Vorzeichen geprüft: betroffen ist ausschließlich „Aline Geburtstag" (Juli 2026)
mit **900,00 €** Abweichung.

**Zusammenhang mit Fehler 2:** Diese 900 € stecken in der Juli-Sparrate. Nach
der Korrektur wird aus **−1.222,75 €** ein Wert von **−322,75 €**. Der Juli
bleibt negativ, aber die alarmierende Zahl war zu drei Vierteln dieser Fehler.

**Vorschlag.** Vorzeichen nach Kartenart auswerten statt wegwerfen: bei
Fixkosten und Budget zählt der Netto-Abfluss, bei Einnahmen der Netto-Zufluss.
Anzeige-Konvention bleibt (Kosten als positive Zahl).

**Entschieden am 05.08.2026 (E2, siehe §7):** Der Netto-Betrag zählt so, wie er ist,
**auch unter null** — es wird nicht bei 0 gekappt. Damit ist dieser Fehler
**vollständig baubar**; es steht keine Entscheidung mehr aus.

**Einordnung:** Eingriff in die Rechenfunktion → Übungs-Datenbank-Probe. Änderung
an Design-Doku §11.

---

## 7. Offene Entscheidungen

**Stand 05.08.2026: E2 ist entschieden, E1 und E3 stehen noch aus.** Damit ist
**Fehler 5 baubar** (er hing allein an E2). Fehler 4 wartet weiter auf **E1**,
Fehler 2 auf **E3**.

### E1 — Was bedeutet die Zahl auf einer gemeinsamen Karte? *(Fehler 4)*

Die ganze Rechnung des Haushalts, oder der eigene Anteil? Alles Weitere folgt
daraus. Anschlussfrage: Soll eine zugeordnete echte Zahlung als bereits
anteiliger Betrag gelten (kein zweiter Abzug) oder weiterhin als
Haushaltsbetrag, von dem der Anteil genommen wird?

*Empfehlung Claude Code:* planen im Haushaltsbetrag, anzeigen als eigener
Anteil, zugeordnete Zahlung unverändert übernehmen.

### E2 — Was, wenn Gutschriften die Ausgaben übersteigen? *(Fehler 5)* — ✅ **ENTSCHIEDEN 05.08.2026**

Beispiel: 50 € ausgelegt, 80 € zurückbekommen. Zeigt die Karte dann −30 €
(ehrlich, aber ungewohnt) oder bleibt sie bei 0 € stehen (ruhiger, aber die
30 € fehlen in der Sparrate)?

*Empfehlung Claude Code war:* die ehrliche Variante. Eine Zahl zu verschlucken ist
genau die Art stiller Ungenauigkeit, die zu diesen Befunden geführt hat.

> **Beschluss Dominik, 05.08.2026: die ehrliche Variante — „ehrlich rechnen".**
>
> **Regel.** Der Netto-Betrag einer Karte zählt so, wie er ist — **auch wenn er unter
> null geht**. Es wird **nicht** bei 0 gekappt. Übersteigen die Gutschriften die
> Ausgaben, ist der Verbrauch negativ und verbessert die Sparrate entsprechend.
>
> **Anzeige.** Kein neuer Kartenzustand. Bei Plan 150 € und Verbrauch −30 € steht auf
> der Karte folgerichtig `Noch 180 € frei` — mehr als der Plan. Das ist sachlich
> richtig: Es *ist* mehr zurückgekommen als ausgegeben wurde. Der Fall ist im
> Bestand **noch nie aufgetreten** (Messung unten).
>
> **Bewusst verworfen (Variante 2, „bei null kappen").** Sie hätte still Geld aus der
> Sparrate entfernt und widerspricht **LL-20**, das für diese Familie von Fällen
> bereits festhält: ein fehlender Wert heißt „keine Anzeige", **nicht 0**.
>
> **Offen gehalten (Variante 3, „eigener Wortlaut").** Statt `Noch 180 € frei` könnte
> die Karte im Klartext `30 € zurück` sagen. Das **rechnet identisch** zur getroffenen
> Entscheidung und ist deshalb **jederzeit nachrüstbar**, ohne die Rechenfunktion
> erneut anzufassen — es wäre eine reine Wortlaut-Ergänzung in §7/§12.3 und bräuchte
> dann einen kurzen `design-direktor`-Moment. Nicht Teil dieses Beschlusses.
>
> **Warum ohne Design-Direktor entschieden.** E2 ist keine Gestaltungsfrage, sondern
> eine Rechenfrage mit Geldwirkung: Darf vorhandenes Geld aus der Sparrate
> verschwinden? Das Sollverhalten steht dem Grunde nach bereits in Design-Doku §11
> („bei BUDGET senkt die Gutschrift den Verbrauch"); der Beschluss denkt diese Regel
> nur zu Ende, statt eine neue Gestaltung zu erfinden.
>
> **Messung vor der Entscheidung (05.08.2026, lesend gegen Produktion).** Über den
> gesamten Bestand hat **keine einzige Karte** in irgendeinem Monat mehr Gutschriften
> als Ausgaben. Die einzige Karte mit gemischten Vorzeichen ist „Aline Geburtstag"
> (Juli 2026, 6 Gutschriften / 7 Ausgaben, netto **−168,11 €** — also echt
> ausgegeben). E2 hat damit **heute keine Geldwirkung**; entschieden wurde eine Regel
> für den Fall, dass er eintritt. Die 900 € aus `BF-5` hängen am weggeworfenen
> Vorzeichen und kommen unabhängig von E2 zurück.

### E3 — Dritte Zeile „genau nach Plan"? *(Fehler 2)*

Heute stünde bei Gleichstand `+0 € über Plan`. Eigene Formulierung dafür oder
nicht?

*Empfehlung Claude Code:* eigene Formulierung, Aufwand vernachlässigbar.

---

## 8. Prüfanker für die Umsetzung

Nach der Korrektur von Fehler 5 (unabhängig von E2) **darf sich genau ein
Wert bewegen**:

| Prüfung | Erwartung |
|---|---|
| Karte „Aline Geburtstag", Juli 2026 | 1.068,11 € → **168,11 €**, Status weiterhin überschritten, aber 18,11 € statt 918,11 € über Plan |
| Ist-Sparrate Juli 2026 | −1.222,75 € → **−322,75 €** (exakt +900,00 €) |
| Ist-Sparrate alle anderen Monate | **unverändert** |
| Plan-Sparrate alle Monate | **unverändert** |

Bewegt sich mehr als das, stimmt etwas nicht. Die Auswirkung von Fehler 4 ist
erst nach Entscheidung E1 zu beziffern und dann vor der Umsetzung ebenso zu
verankern.

Die Fehler 1, 2 und 3 dürfen **keinen** Zahlenwert bewegen — sie sind reine
Oberfläche.

---

## 9. Vorschlag zum Zuschnitt

| Reihenfolge | Inhalt | Warum |
|---|---|---|
| 1 | Fehler 3 (Popup) | Blockiert aktiv das Eintragen der Gehälter. Kleinster Eingriff, größte Sofortwirkung. |
| 2 | Fehler 1 (Vorschlags-Kästchen + Umbruch) | Entschieden, reine Oberfläche, unabhängig von allem anderen. |
| 3 | Fehler 5 (Vorzeichen) | Eindeutiger Fehler mit dokumentiertem Sollverhalten und scharfem Prüfanker. Bereinigt zugleich die Juli-Zahl. |
| 4 | Fehler 2 (Ring-Text) | Sinnvoll **nach** Fehler 5, weil die Juli-Zahl dann bereits stimmt und der neue Text am echten Fall zu sehen ist. |
| 5 | Fehler 4 (gemeinsame Karten) | Größter konzeptioneller Eingriff, hängt an E1, betrifft Design-Doku §4.5. Eigene Phase. |

Fehler 4 und 5 gehören in eine gemeinsame Übungs-Datenbank-Probe, wenn sie im
selben Sprint laufen — beide fassen `calculate_card_amount_for_month`
beziehungsweise `calculate_sparrate_for_month` an.

---

## 10. Was hier ausdrücklich NICHT steht

- Kein Code ist geändert. Alle fünf Befunde sind Diagnose, keine Umsetzung.
- Die Juli-Plan-Sparrate von 55,44 € (statt vorher 1.931,18 €) ist **nicht** als
  Fehler gemeldet und auch nicht untersucht worden. Sie erklärt sich vermutlich
  durch die beim Kuratieren neu angelegten Karten. Falls die Zahl überrascht,
  ist das ein eigener Befund.
- Der Badge-Überlauf aus v2-07-Review §5.1 gilt mit Entscheidung zu Fehler 1
  als erledigt — die Kästchen verschwinden ganz.

---

*Befund-Dokument · Antigravity Finance · 4. August 2026 · erstellt vor der Repo-Aufräumung*
