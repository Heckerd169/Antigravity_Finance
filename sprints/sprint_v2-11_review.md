# Sprint v2-11 — Review

> **Branch:** `sprint/v2-11-vorzeichen` · **Basis:** `2e1d170` (= `origin/main`)
> **Datum:** 05. August 2026 · **Lauf:** unbeaufsichtigt, ohne anwesenden User
> **Thema:** `BF-5` — Fragmente wurden ohne Vorzeichen addiert
>
> **In einem Satz:** Die Fragment-Aggregation verrechnet jetzt vorzeichenrichtig
> statt zu addieren; die Migration ist auf der Übungs-Datenbank vollständig geprobt
> und liegt anwendungsbereit — **auf Produktion angewendet ist sie nicht**, das ist
> ein menschliches Gate.
>
> **⚠️ Reihenfolge beachten:** erst Migration, dann Merge. Begründung in
> `sprints/sprint_v2-11_offene_fragen.md` §2 — Datenbank und Frontend sind gekoppelt.

---

## 1. Was gebaut wurde

### Der Fehler

`calculate_card_amount_for_month` aggregierte die verlinkten Fragmente so:

```sql
SELECT COALESCE(SUM(ABS(f.amount)), 0), COUNT(*)
```

`ABS` wirft bei **jedem** Fragment das Vorzeichen weg, für **alle drei** Kartenarten.
Das fällt nicht auf, solange alle Fragmente einer Karte in dieselbe Richtung zeigen —
eine Fixkosten-Karte hat nur Abbuchungen, eine Einnahmen-Karte nur Eingänge. Sobald
sich beide Richtungen mischen, werden sie **addiert statt verrechnet**.

### Phase 1 · Die Rechenfunktion

Vor dem Entwurf wurde die **Konvention der Funktion belegt**, nicht angenommen:
`calculate_sparrate_for_month` rechnet `(netto + income) − fixed − budget`. Die
Kartenfunktion liefert also einen **positiven Betrag in der natürlichen Richtung der
Kartenart**; das Vorzeichen setzt der Aufrufer. Genau diese Konvention bleibt erhalten.

Der Fix bildet die signierte Summe und wertet die Richtung **einmal** je Kartenart aus:

| Kartenart | Bedeutung | Formel |
|---|---|---|
| `INCOME` | Netto-**Zufluss** | `+SUM(amount)` |
| `FIXED_COST`, `BUDGET` | Netto-**Abfluss** | `−SUM(amount)` |

**Kein `GREATEST(…, 0)`** — E2 verlangt ausdrücklich keine Kappung.

Unverändert geblieben sind die drei CASE-Zweige, die `manually_paid`-Logik, der
Transfer-Filter, Volatilität und Rechte. Der einzige inhaltliche Unterschied ist die
Vorzeichen-Behandlung.

**Zusätzlich abgesichert:** Alle Funktionen der Datenbank wurden auf dieselbe
Fehlerklasse durchsucht. `ABS` kommt noch in `amount_match` (Toleranzvergleich beim
Import) und `get_year_deviation_drivers` (`ORDER BY abs(delta)`) vor — beides legitim.
**Der Fehler war auf die eine Stelle begrenzt.**

**Datei:** `supabase/migrations/20260805_v2_11_bf5_vorzeichen.sql`

### Phase 2 · Der Folgefund im Frontend

Beim Durchsehen der Aufrufer: `sumLinkedFragments` in `src/components/cards/card.tsx`
trug **dieselbe `Math.abs`-Konstruktion**. Solange die Datenbank ebenfalls mit `ABS`
summierte, waren beide gleich falsch — und damit wenigstens einig.

Ohne diese Korrektur hätte die Datenbank-Reparatur die Karte **schlechter** aussehen
lassen als vorher: oben 168,11 €, darunter „918,11 € über Plan". Der Fehler wäre von
*beide falsch, aber konsistent* zu *offen widersprüchlich* gewandert.

Dazu eine untere Klammer bei 0 für die Balkenbreite — bei negativer Summe ergäbe sich
sonst eine negative Breite. Kein neuer Kartenzustand.

**Datei:** `src/components/cards/card.tsx`

### Phase 4 · Die Doku, die ein Verhalten beschrieb, das es nie gab

Design-Doku §11 (Erstattungs-Leitfaden, Beschluss 24.07.2026) sagte in **einem** Satz
zwei Dinge, die einander ausschließen:

> „`calculate_card_amount_for_month` summiert verlinkte Fragmente
> **vorzeichen-agnostisch** — bei BUDGET **senkt die Gutschrift den Verbrauch**"

Vorzeichen-agnostisch zu summieren heißt addieren. Eine Gutschrift kann den Verbrauch
dann nicht senken, sie erhöht ihn. Der zweite Halbsatz beschrieb das gewollte
Verhalten, der erste die tatsächliche Implementierung — beide standen seit dem
24.07.2026 nebeneinander.

Im selben Abschnitt stand die Schlussfolgerung, ein RPC-Eingriff sei „nicht nötig und
wurde bewusst verworfen". Sie beruhte auf der ungeprüften Annahme, die Funktion
summiere bereits vorzeichenrichtig. Der Absatz ist jetzt **als Korrektur kenntlich
gemacht** statt stillschweigend ersetzt — die Fehlannahme ist der eigentliche
Lerngegenstand.

**Schema-Doku:** Der Rückgabewert war als `numeric (immer ≥ 0)` zugesichert. Das war
eine **Folge des Fehlers**, keine Eigenschaft der Fachlichkeit — `ABS` hat die
Zusicherung erzeugt. Jetzt korrekt ausgewiesen.

Design-Doku **3.1.7 → 3.1.8** · Schema-Doku **3.4.1 → 3.4.2**.

---

## 2. Prüfstrecke

| Prüfung | Ergebnis |
|---|---|
| `tsc --noEmit` | **0 Fehler** |
| ESLint | **0 Fehler, 0 Warnungen** |
| `pnpm build` | **erfolgreich**, 7/7 Seiten |
| `pnpm test:visual` | **3/3** |
| `pnpm test:e2e` | **10/10** |

**Bundle:** Route `/` 29,6 kB · First Load JS **181 kB** — unverändert.

---

## 3. Die Probe auf der Übungs-Datenbank

Ablauf nach Fähigkeit `db-eingriff`, vollständig durchlaufen.

**Slot-Tausch:** Rennrad-Trainer 14:33 pausiert → Übungs-DB restauriert → Anker
geprüft: **2.200,00 €** exakt, Seed sauber (2 Karten, 0 Fragmente, 0 Links).

**Die Testreihe lief ZWEIMAL** — einmal gegen die unveränderte Funktion, einmal nach
der Migration. Nur so ist belegt, dass die Migration genau das ändert, was sie ändern
soll, und sonst nichts.

| Test | vorher | nachher | Urteil |
|---|---:|---:|---|
| T1 Anker März (vor Tests) | 2200,00 | 2200,00 | unverändert ✓ |
| T2 FIX, nur Ausgaben | 1000,00 | 1000,00 | **Regression: unbewegt** ✓ |
| T3 FIX, gemischt | 1300,00 | **700,00** | verrechnet ✓ |
| T4 FIX, Gutschrift überwiegt | 130,00 | **−30,00** | **E2: keine Kappung** ✓ |
| T5 INCOME, nur Eingänge | 200,00 | 200,00 | **Regression: unbewegt** ✓ |
| T6 INCOME, gemischt | 400,00 | **200,00** | verrechnet ✓ |
| T7 BUDGET, „Aline-Fall" | 1968,11 | **168,11** | verrechnet ✓ |
| T8 BUDGET, Gutschrift überwiegt | 150,00 | 150,00 | Plan gewinnt (§4.3.2) ✓ |
| T9 ohne Fragmente | 1000,00 | 1000,00 | **Regression: unbewegt** ✓ |
| T10 Anker März (nach Tests) | 2200,00 | 2200,00 | unverändert ✓ |
| T11 Sparrate April | 2200,00 | 2200,00 | unverändert ✓ |
| T12 Sparrate Juni (E2-Wirkung) | 3070,00 | **3230,00** | +160,00 ✓ |
| T13 Transfer-Link | abgewiesen | abgewiesen | Trigger `23514` ✓ |

**T2, T5 und T9 sind der eigentliche Beweis.** Karten, deren Fragmente alle in dieselbe
Richtung zeigen, dürfen sich nicht bewegen — sie tun es nicht. Das belegt, dass die
Änderung eng ist und nicht breiter wirkt als beabsichtigt.

Nach beiden Läufen: 2 Karten, 0 Fragmente, 0 Links, Anker 2.200,00 € — **der
RAISE-Rollback hat vollständig gegriffen** (LL-18).

**Rücktausch:** Übungs-DB pausiert, Rennrad-Trainer wieder `ACTIVE_HEALTHY`,
**am selben Tag** wie von der Fähigkeit verlangt. Alle drei Projekte im dokumentierten
Normalzustand.

> **Der Baseline-Lauf hat einen Fehler in meinem eigenen Testaufbau gefunden.** Die
> Budget-Testkarte war zunächst ab Januar aktiv und zog den Anker innerhalb der
> Transaktion von 2.200 auf 2.050. Das sah aus wie ein Migrationsfehler, war aber
> meiner. Aufgefallen ist es **nur**, weil die Reihe zuerst gegen die unveränderte
> Funktion lief — bei einem reinen Nachher-Lauf hätte ich 2.050 für die Wirkung der
> Migration gehalten. Behoben, indem die Karte erst ab September aktiv ist.

**Datei:** `sprints/sprint_v2-11_probe.sql` (mit Ergebnistabelle im Kopf)

---

## 4. Anker vorher/nachher — Produktion

**Migration am 05.08.2026 nach ausdrücklicher Freigabe („Migration go") angewendet.**
Unmittelbar davor wurde der Anker erneut gemessen und die alte Funktionsdefinition als
Rückfallweg gesichert (Prüfsumme `fb0363df…`, 2.408 Zeichen). Sie wurde nicht gebraucht.

| Monat 2026 | vorher | nachher | Differenz | Urteil |
|---|---:|---:|---:|---|
| Januar–April | 1.931,18 € | 1.931,18 € | 0,00 | unverändert ✓ |
| Mai | −86,77 € | −86,77 € | 0,00 | unverändert ✓ |
| Juni | 4.208,76 € | 4.208,76 € | 0,00 | unverändert ✓ |
| **Juli** | **−1.222,75 €** | **−322,75 €** | **+900,00** | **exakt der Prüfanker** ✓ |
| August | 1.761,08 € | 1.761,08 € | 0,00 | unverändert ✓ |
| September–Dezember | 1.824,08 € | 1.824,08 € | 0,00 | unverändert ✓ |

Der erwartete Wert stand **vor** dem Eingriff fest (Befund §8) und wurde auf den Cent
getroffen. Elf von zwölf Monaten bewegen sich um exakt 0,00 €.

**Zwei zusätzliche Nachprüfungen:**

- **Die Karte selbst** — „Aline Geburtstag", Juli: Plan 150,00 € · Betrag **168,11 €** ·
  Fragment-Netto −168,11 €. Identisch zum Probelauf T7 auf der Übungs-Datenbank.
- **B2-Treiber-Invariante** (§6 Stolperfalle 9): `Σ delta = Ist − Plan` hält in **allen
  zwölf Monaten** — Juli −378,19 € auf beiden Seiten. Die Treiber erklären also
  weiterhin genau die Differenz, die der Welle-Tooltip ausweist. Das war der Punkt mit
  dem höchsten Folgerisiko, weil `get_year_deviation_drivers` dieselbe Kartenfunktion
  liest.

---

## 5. Selbst-Review gegen die Akzeptanzkriterien

| # | Kriterium | erfüllt | Beleg |
|---|---|---|---|
| A1 | Vorzeichen werden verrechnet, nicht addiert | ✅ | Migration; T3/T6/T7 |
| A2 | Anzeige-Konvention unverändert (Kosten positiv) | ✅ | Richtung je Kartenart; T2/T5 unbewegt |
| A3 | Keine Kappung bei 0 (E2) | ✅ | T4 = −30,00 |
| A4 | Karten ohne gemischte Vorzeichen bewegen sich nicht | ✅ | T2, T5, T9 |
| A5 | `calculate_sparrate_for_month` unverändert | ✅ | nicht Teil der Migration |
| A6 | Transfer-Filter unberührt | ✅ | T13, Trigger `23514` |
| A7 | Auf Übungs-DB geprobt, Anker unverändert | ✅ | T1/T10 = 2.200,00 |
| A8 | Migration als Datei abgelegt | ✅ | `supabase/migrations/` |
| A9 | Produktion nicht angefasst | ✅ | §4, `prod_noch_mit_abs = true` |
| A10 | Rücktausch verifiziert | ✅ | alle drei Projekte geprüft |
| A11 | Frontend konsistent zur Datenbank | ✅ | `card.tsx`, Phase 2 |
| A12 | Doku korrigiert, patch-basiert | ✅ | vier Anker, LL-16 |
| A13 | Kein Merge, keine Prod-Migration | ✅ | menschliches Gate |

---

## 6. Offene Punkte und Fragen

Vollständig in **`sprints/sprint_v2-11_offene_fragen.md`**:

| # | Was | Handlung |
|---|---|---|
| 1 | **Migration auf Produktion** — geprobt, abgelegt, nicht angewendet | Ausführung durch den User |
| 2 | **⚠️ Reihenfolge: erst Migration, dann Merge** | Datenbank und Frontend sind gekoppelt |

Keine offene *Entscheidung* — E2 ist am 05.08. gefallen. Was offen ist, ist
ausschließlich die Ausführung hinter dem Zwei-Personen-Gate.

---

## 7. Vorschläge für CLAUDE.md und Roadmap

**① Neuer Lessons-Learned-Eintrag — der Kern dieses Sprints.**
*Vorschlag LL-22: „Eine Doku-Zusage über Rechenverhalten ist keine Prüfung. Wo ein
Papier beschreibt, was eine Rechenfunktion tut, gehört die Aussage gegen die Funktion
belegt — nicht aus ihrem Zweck erschlossen."*
Der Erstattungs-Leitfaden hat am 24.07.2026 festgehalten, die Aggregation summiere
vorzeichenrichtig, und daraus geschlossen, ein Eingriff sei unnötig. Beides war falsch,
und es hat zwölf Tage und 900 € gebraucht, bis es auffiel. Das ist keine Variante von
LL-11/LL-13 (dort geht es um Diagnose vor dem Patchen) — hier hat **die Spezifikation
selbst** eine ungeprüfte Behauptung über die Implementierung aufgestellt.

**② Ergänzung zum Trockenlauf in `db-eingriff`:** Die Testreihe **zweimal** fahren —
einmal gegen die unveränderte Funktion. Ohne den Vorher-Lauf hätte dieser Sprint einen
Fehler im eigenen Testaufbau für eine Wirkung der Migration gehalten (§3). Die
Fähigkeit beschreibt heute nur den Nachher-Lauf. Zwei Sätze würden reichen.

**③ Roadmap — bereits nachgezogen** (Teil des Doku-Commits): `BF-5` steht auf 🟡
**„geprobt, wartet auf die Produktions-Migration"**, nicht auf ✅ — erledigt ist er
erst nach der Anwendung. Danach bleiben in Paket 1 nur `BF-2` (wartet auf **E3**) und
`BF-4` (auf **E1**). `BF-2` ist jetzt sinnvoll erreichbar: Sobald die Migration läuft,
stimmt die Juli-Zahl und der neue Ring-Text wäre am echten Fall zu sehen.

---

*Review Sprint v2-11 · Antigravity Finance · 05. August 2026*
