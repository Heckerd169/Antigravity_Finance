# Diskussionspapier — Modell-Eignung: Mehrkonten-Geldströme & Transfer-Verrechnung

> **Vom:** Architekten-Chat (Schema v3.1, alle 21 RPCs)
> **An:** PM-Chat V2, zur Diskussion mit dem User (und in Teilen mit dem DD)
> **Datum:** 05. Juli 2026
> **Rahmen:** Explorations-/Design-Phase, ergebnisoffen. Live-DB ausschließlich read-only introspiziert (2 SELECTs: Funktionsdefinitionen, `own_ibans`). CSVs nur als Anschauungsmaterial analysiert, nichts importiert. Vorschläge LL-16-konform zur PM-Anwendung formatiert.

---

## 0. Ergebnis in fünf Sätzen

1. Das heutige Modell kennt die **Konten-Herkunft eines Fragments nicht** (Frage 4.1: Nein) — beim Import geht eine Information verloren, die in der CSV-Datei implizit vorhanden ist, denn *die Datei ist das Konto*.
2. Die Auto-Transfer-Erkennung funktioniert im Cortal↔Giro-Korridor einwandfrei, ist aber auf dem **gesamten Kreditkarten-Korridor blind** — das sind in den realen Daten 50 von 88 Transfer-Gliedern (Erkennungsquote heute: ~43 %).
3. Die User-Hypothese „jede Karte transfer-drop-fähig, ersetzt die Auto-Erkennung" **trägt als Ersatz nicht**: die Karten-Aggregation summiert `ABS(amount)` — eine Gegenbuchung würde auf der Karte nicht verrechnen, sondern *addieren*. Verrechnung auf der Karte ist im heutigen Modell rechnerisch unmöglich, und die −100/0-Unterscheidung der beiden Arbeitsbeispiele kann keine Summenbildung leisten, nur eine konten-verankerte Regel.
4. Die Spannung „Kartenanzeige vs. Sparraten-Impact" löst sich auf, sobald man anerkennt, dass hier **zwei verschiedene Kennzahlen** gefragt sind: die Sparrate (GuV-Sicht: „Was habe ich konsumiert?") und ein **Spartopf-Delta** (Vermögens-Sicht: „Was ist im Topf passiert?"). Beispiel 2 hat dann die Antwort −100 € *und* 0 € — auf zwei verschiedene Fragen. Eine Entkopplung von Kartenanzeige und Sparraten-Beitrag (Frage 4.2) ist **nicht nötig**.
5. Empfehlung: dreistufig — (0) `own_ibans` um zwei DKB-Verrechnungs-IBANs erweitern (reines DML, sofort, hebt die Erkennungsquote auf ~72 %), (1) `p_format_hint` für das KK-Format aktivieren (~100 %), (2) `accounts`-Tabelle + `fragments.source_account_id` + Konten-Rolle „Spar-Anker" als erster Schema-Sprint — das Fundament für Spartopf-Delta und später M9. `paired_fragment_id` **jetzt nicht bauen**.

---

## 1. Befund aus den realen CSVs (P1)

### 1.1 Konten-Landkarte

Drei Exporte, Zeitraum ca. 06.04.–05.07.2026, zusammen ~256 Buchungen:

| Konto | Identität in den Daten | Buchungen | Besonderheit |
|---|---|---|---|
| DKB Girokonto | `DE13…1051422572` | ~144 | Drehscheibe: Gehalt, Fixkosten, alle Transfers |
| Cortal Consors Tagesgeld | Konto 853562991 = `DE84…0853562991` | ~24 | Der gelebte **Spartopf**; enthält zusätzlich Depot-Sparpläne |
| DKB Visa Kreditkarte | Kartennr. 4998…3514 — **keine IBAN-Spalte im Export** | ~88 | Konsumkonto; wird per App-Aufladung vom Giro gespeist |

Dazu treten im Giro fünf Gegenkonten mit Sonderstatus auf, die für jede Transfer-Logik entscheidend sind:

| IBAN | Was es ist | Richtige Behandlung |
|---|---|---|
| `DE63…0001999333` („DKB") | DKB-Sammelkonto für **KK-Aufladungen** per App | Immer Transfer (Giro→eigene KK) — heute **nicht** erkannt |
| `DE79…9003290294` („Deutsche Kreditbank Berlin") | Sammelkonto **KK-Saldoabrechnung** (Lastschrift) | Immer Transfer — heute **nicht** erkannt |
| `DE96…9005290904` („ISSUER") | Verrechnungskonto der **Visa-Debitkarte** | **Echte Ausgaben** (Tanken, Tegut) — darf **niemals** in eine Transfer-Liste |
| `DE60…1089942948` | **Gemeinschaftskonto** Dominik + Aline | Miete/Essen/Strom (Domi) sind aus Sparraten-Sicht **Ausgaben** — darf **niemals** in `own_ibans`, obwohl Dominik Mitinhaber ist |
| `DE86…0922050000` (Scalable Capital) | Broker-Auszahlung +2.722,15 € (04.05.) | Vermögensumschichtung, **keine Einnahme** — Einzelfall, siehe §7 |

### 1.2 Die realen Ketten-Muster

**Muster A — die Kernkette (Cortal → Giro → KK → Händler):** Der User kauft per KK, lädt die KK aus dem Giro auf und refinanziert das Giro gezielt aus dem Cortal-Topf. Schönster Beleg ist der 02.07.: drei Cortal→Giro-Eingänge (189 / 69,99 / 107,10 mit sprechenden Verwendungszwecken), vier Giro→KK-Aufladungen, vier KK-„Einzahlungen" — und die zugehörigen Käufe liegen teils **Wochen zurück** (Anthropic −107,10 am **23.06.** auf der KK, Refinanzierung am **02.07.**). Ketten kreuzen Monatsgrenzen — das ist kein Randfall, das ist der Normalbetrieb.

**Muster B — der gelebte Spartopf:** Monatlich „Cortal Consors Sparen MM/26" (1.940 / 1.887 / 1.940 €) vom Giro in den Topf; Rückflüsse als „Ausgleich DKB", „Urlaub …", „Geschenk …". Die Steuererstattung (+2.658,35) wandert am selben Tag vollständig in den Topf. **Der User rechnet mental bereits in Topf-Bewegungen** — die Hypothese ist keine Laune, sie beschreibt seine tatsächliche Buchführung.

**Muster C — KK-Abrechnung:** Der nicht per Aufladung gedeckte Restsaldo wird per Lastschrift eingezogen (24.04. 64,73 / 27.05. 8,47), auf der KK als „Ausgleich Kreditkarte gem" sichtbar. Beide Seiten heute unerkannt.

**Muster D — topf-interne Umschichtung:** Vier Wertpapier-Sparpläne (3× 500, 1× 1.000) verlassen den Cortal-Saldo Richtung Depot. Kein Konsum, kein Topf-Abfluss, *wenn* das Depot zum Topf zählt — die Topf-Definition muss eine **Konten-Menge** sein, kein Einzelkonto (§7).

**Muster E — die Realität ist unscharf:** Ausgleiche decken Aufladungen nur teilweise (19.06.: Ausgleich 207,17 vs. Aufladungen 424,05 am selben Tag) und weichen im Cent-Bereich ab (21,61 vs. 21,64 beim Gemeinschaftskonto-Ausgleich). **Exaktes 1:1-Betrags-Pairing scheitert an diesen Daten** — ein zentrales Argument in der Optionsbewertung.

### 1.3 Quantifizierung: Was die Auto-Erkennung heute sieht

Von 88 internen Transfer-Gliedern im Quartal (≈ 34 % *aller* Fragmente):

| Korridor | Glieder | Erkennbar heute? | Warum (nicht) |
|---|---|---|---|
| Cortal ↔ Giro | 38 (19 Paare) | ✅ ja | beide IBANs in `own_ibans` (live verifiziert: exakt diese zwei Einträge) |
| Giro → KK (Aufladung) | 23 | ❌ nein | Gegen-IBAN ist DKB-Sammelkonto `DE63…999333`, nicht own |
| KK-Seite („Einzahlung") | 23 | ❌ strukturell unmöglich | KK-Export hat **keine IBAN-Spalte** |
| KK-Abrechnung (beide Seiten) | 4 | ❌ nein | Giro-Seite: Sammelkonto `DE79…290294`; KK-Seite: keine IBAN |

**Erkennungsquote: 38/88 ≈ 43 %.** Die unerkannten 50 Glieder landen heute als normale Fragmente in der Rohmasse — die 23 positiven KK-„Einzahlungen" sind dabei die gefährlichsten: falsch auf eine Einnahmen-Karte gedroppt, würden sie die Sparrate aufblähen.

*Nebenbefund Import-Robustheit:* Am 11.06. existieren **zwei byte-identische KK-Zeilen** (PAYPAL *lidiatriassi, −10,00). Beim SHA-256-Hash über die Rohzeile verschluckt der UPSERT die zweite als „Duplikat" — realer Datenverlust von 10 €. Separat vom Mehrkonten-Thema, gehört aber auf den Sprint-Zettel.

---

## 2. Modell-Bewertung gegen Schema v3.1 (P2) — die drei PM-Fragen

**Frage 4.1 — Erfasst das Modell die Konten-Herkunft je Fragment? Nein.** `fragments` trägt `counterparty_iban` (die *Gegenseite*), aber keine Spalte für das eigene Konto, auf dem gebucht wurde. Die Information existiert im Moment des Imports implizit (jede CSV *ist* ein Konto) und wird weggeworfen. Ohne sie ist die Spartopf-Regel („zählt nur, was den Topf verkleinert") schlicht **nicht berechenbar** — weder automatisch noch als Server-Validierung manueller Zuordnungen. Der User müsste die Regel im Kopf ausführen; das widerspricht dem Grundsatz, dass Berechnung dem Server gehört.

**Frage 4.2 — Muss die Kartenanzeige vom Sparraten-Beitrag entkoppelt werden? Nein — sofern man die Sparraten-Definition nicht verbiegt.** Live verifiziert: `calculate_sparrate_for_month` ist eine reine GuV-Rechnung — `(Netto + Einnahmen-Karten) − Fixkosten-Karten − Budget-Karten`, wobei jeder Karten-Betrag exakt der Anzeige-Betrag aus `calculate_card_amount_for_month` ist. Anzeige und Beitrag sind heute **identisch per Konstruktion**. Eine Entkopplung würde nur nötig, wenn man die Spartopf-Regel *in* die Sparrate zwingt (Karte zeigt −100, trägt 0 bei) — genau das erzeugt die Phantom-Zustände, die mit „Verbergen" schon einmal verworfen wurden. Die saubere Auflösung steht in §4.

**Frage 4.3 — Trägt „jede Karte transfer-drop-fähig + manuelle Verrechnung"? Nein, aus einem harten technischen und zwei konzeptionellen Gründen** — ausführlich in §5.

Ergänzend zur heutigen Mechanik: OQ-B (Transfer-Fragmente nie an Karten, inkl. Link-Auflösung beim Import) und der Defense-in-Depth-Filter in `calculate_card_amount_for_month` (`transfer_type IS DISTINCT FROM 'INTERNAL_TRANSFER'`) bilden zusammen die Invariante „Transfers berühren die Sparrate nie". Diese Invariante ist korrekt und sollte **bestehen bleiben** — das Problem ist nicht die Regel, sondern dass 57 % der Transfers gar nicht erst als solche erkannt werden.

---

## 3. Beispiel-Analyse: Warum Summieren scheitern muss (P2/P3)

Der PM-Kernbefund lässt sich verallgemeinern: Summiert man alle Glieder einer Transferkette, heben sich die internen Glieder **teleskopartig** weg — übrig bleibt immer der externe Rand (der Kauf beim Händler, die Zahlung an Aline). Deshalb ergeben Beispiel 1 und 2 identisch −100 €: die Summe sieht nur den Rand, nie den Weg. Die Information „lief der Weg durch den Spartopf?" steckt in den **Konten der Zwischenglieder** — exakt der Information, die das Modell nicht erfasst (§2).

Was die zwei Beispiele wirklich zeigen, sind **zwei verschiedene Messverfahren**, die verschiedene Fragen beantworten:

| | **Sparrate (GuV-Methode, heutiges Modell)** | **Spartopf-Delta (Cashflow-Methode, Hypothese)** |
|---|---|---|
| Frage | „Wie viel meines Einkommens habe ich diesen Monat *nicht konsumiert*?" | „Um wie viel ist mein designiertes Sparvermögen gewachsen?" |
| Beispiel 1 (Kauf, aus Cortal refinanziert) | −100 € | −100 € |
| Beispiel 2 (Kauf, aus DKB-Puffer beglichen) | **−100 €** | **0 €** |
| Zeitpunkt | Monat der Ausgabe (Fragment-Monats-Identität, §4.7) | Monat der Topf-Bewegung |

Drei Konsequenzen daraus:

1. **Die User-Erwartung in Beispiel 2 („Karte zeigt −100 und es schmälert die Sparrate") ist die GuV-Antwort** — also exakt das, was das heutige Modell bereits liefert. Der scheinbare Widerspruch zur Spartopf-Regel ist keiner: er entsteht nur, wenn man vom Spartopf verlangt, die Sparrate zu *definieren*, statt eine eigene Kennzahl zu sein.
2. **Die beiden Kennzahlen divergieren auch im Timing**, nicht nur im Betrag: der Anthropic-Kauf (Juni, KK) wird GuV-seitig im Juni wirksam, die Topf-Entnahme erst im Juli. Jede Vermischung der beiden Verfahren in *einer* Zahl erzeugt entweder rückwirkende Änderungen (Kollision mit §2.1 Snapshot-Integrität) oder Perioden-Willkür.
3. Über lange Zeiträume konvergieren beide Kennzahlen genau dann, wenn die Nicht-Topf-Puffer (Giro, KK-Saldo) konstant bleiben. Kurzfristig ist die Differenz selbst informativ: „Konsum aus dem Puffer statt aus dem Topf."

---

## 4. Auflösung der Spannung Kartenanzeige ↔ Sparraten-Impact

**Keine Entkopplung. Zwei Kennzahlen.**

- Die **Karte zeigt Konsum** und trägt exakt diesen Konsum zur **Sparrate** bei — wie heute, unverändert, per Konstruktion konsistent. Beispiel 2: Karte −100, Sparrate −100. ✓ (User-Erwartung erfüllt.)
- Der **Spartopf** wird eine **eigene, konten-basierte Zweitkennzahl** („Topf-Delta"): Summe aller Fragmente, deren Quellkonto die Rolle *Spar-Anker* trägt, im jeweiligen Monat — topf-interne Umschichtungen (Effekten-Sparplan) ausgenommen. Beispiel 1: Topf-Delta −100. Beispiel 2: Topf-Delta 0. ✓ (Spartopf-Intuition erfüllt.)

Beide Zahlen sind gleichzeitig wahr, weil sie verschiedene Fragen beantworten. Nichts an den bestehenden Sparrate-RPCs, an OQ-B oder an der Kartenlogik ändert sich — das Topf-Delta ist eine **rein additive** Kennzahl. Wo sie angezeigt wird (Welle-Popup? Ring-Sekundärwert?), ist DD-Territorium (§7).

---

## 5. Bewertung der User-Hypothese (P3)

**Was die Hypothese richtig sieht:** Es gibt Transfers, die Bedeutung tragen („Cortal Consors Sparen 06/26" *ist* die gefühlte Sparrate; „Ausgleich DKB" *ist* konsumierte Ersparnis), und das heutige Modell macht sie unsichtbar. Der Drop-Wunsch ist in Wahrheit der Wunsch, Transfer-*Semantik* zuzuweisen. Außerdem entsteht der Druck real daher, dass der komplette KK-Korridor unerkannt bleibt — der User will die Glieder „irgendwo verrechnen", weil das System sie ihm als Rohmasse vor die Füße legt.

**Warum sie als Ersatz der Auto-Erkennung nicht trägt:**

1. **Harter technischer Befund (live verifiziert):** Die Karten-Aggregation lautet `SUM(ABS(f.amount))`. Eine auf die Karte gedroppte Gegenbuchung (+100) verrechnet nicht — sie **addiert** 100 zum Kartenwert. „Auf der Karte verrechnen" würde vorzeichenbehaftete Summen erfordern; das kollidiert mit dem Anzeige-Vertrag „immer ≥ 0", mit der BUDGET-Logik (`v_fragment_sum > v_base_amount`-Vergleich) und mit der N4b-Degenerations-Anzeige. Das ist kein Patch, das ist eine Neudefinition der Kartensemantik.
2. **Vollständigkeit ist nicht erzwingbar:** Die Verrechnung stimmt nur, wenn *jedes* Glied einer Kette gedroppt wird. Ein vergessenes Glied → Karte zeigt das Doppelte; ein auf die falsche Karte gedropptes Glied → stille Quersubvention. `UNIQUE(fragment_id)` verhindert Doppelverlinkung, aber keine Lücken. Und die realen Daten (§1.2, Muster E) zeigen Teilbeträge und Cent-Abweichungen — der User müsste 1:n-Ketten mit Differenzen im Kopf ausbalancieren.
3. **Arbeitslast:** 88 Transfer-Glieder im Quartal, ~30 pro Monat, wären manuell zu droppen — nur um Neutralität herzustellen, die die Auto-Erkennung im Cortal↔Giro-Korridor heute schon geräuschlos liefert. Ein Ersatz wäre ein Rückschritt genau dort, wo es funktioniert.
4. **Sie beantwortet die Kernfrage nicht:** Auch mit perfekter manueller Verrechnung bleibt die Summe teleskopisch (§3) — die −100/0-Unterscheidung der zwei Beispiele kann sie prinzipiell nicht treffen. Dafür braucht es die Konten-Herkunft, die auch beim Drop fehlt.
5. **Verlust der Invariante:** OQ-B aufzugeben hieße, den einzigen harten Schutz gegen Transfer-Verschmutzung der Sparrate aufzugeben — für einen Mechanismus, der auf Disziplin statt auf Struktur beruht.

**Was von der Hypothese bleibt:** In fast jeder realen Kette gibt es genau **ein externes Rand-Fragment**, das die Ausgabe repräsentiert (KK-Kauf beim Händler, Giro→Aline, Giro→iQ athletik). *Dieses* Fragment auf die passende Karte zu droppen ist bereits heute das richtige — und ausreichende — Muster. Die internen Glieder gehören auf keine Karte; sie gehören erkannt und neutralisiert.

---

## 6. Optionen mit Trade-offs (P4/P5)

| # | Option | Was sie löst | Kosten / Risiken | §2.1 Snapshot | Simplicity |
|---|---|---|---|---|---|
| **O0** | `own_ibans` um `DE63…999333` (KK-Aufladung) und `DE79…290294` (KK-Abrechnung) erweitern | Giro-Seite des KK-Korridors: Quote 43 % → ~72 %. Re-Import der bestehenden CSVs markiert rückwirkend via UPSERT-Pfad | Reines DML auf `profiles` (kein Sprint). Semantische Dehnung: die IBANs sind DKB-Sammelkonten, nicht „eigene" — dokumentieren. **Warnung:** `DE96…290904` (Visa-Debit) und das Gemeinschaftskonto dürfen *nie* hinein | unkritisch (Markierung wirkt auf künftige Aggregation; geschlossene Monate: bewusst prüfen, ob Re-Import in abgeschlossene Monate zurückwirkt → mit PM klären) | ★★★ |
| **O1** | `accounts`-Tabelle (id, name, iban NULL, `role`: GIRO / SPAR_ANKER / KREDITKARTE / BROKER) + `fragments.source_account_id` (NULL für Bestand) + Import wählt Konto (UI oder `p_format_hint`) | Konten-Herkunft (Frage 4.1) ✓ · KK-„Einzahlungen" per Regel (source=KK ∧ Beschreibung „Einzahlung"/„Ausgleich" ∧ Betrag > 0 → Transfer) ✓ · **Topf-Delta berechenbar** ✓ · natürliches Fundament für M9 | 1 Tabelle, 1 Spalte, Import-Anpassung → erster Schema-Sprint, aktiviert vereinbarungsgemäß das Test-Projekt | rein additiv; Sparrate-RPCs unverändert; Alt-Fragmente bleiben NULL — keine Neuberechnung geschlossener Monate | ★★ |
| **O2** | `paired_fragment_id` (F5): Gegenbuchungen paaren, Paare neutral | exakte Ketten-Abbildung, offene Posten sichtbar | Matching scheitert an den realen Daten (Teilbeträge 207,17 vs. 424,05; Drift 21,61/21,64; 1:n; Monatsgrenzen). Hoher Aufwand, viele Sonderfälle | neutral | ★ — **jetzt nicht bauen**, M9-Kandidat auf O1-Fundament |
| **O3** | User-Hypothese pur: alle Karten transfer-drop-fähig, OQ-B weg, Auto-Erkennung ersetzt | Gefühl der Kontrolle | §5: ABS-Aggregation macht Verrechnung unmöglich; Vollständigkeit nicht erzwingbar; ~30 Drops/Monat; Invariante weg; beantwortet −100/0 nicht | Manipulierbarkeit historischer Kartenwerte durch nachträgliche Drops → Spannungsfeld | ✗ — **nicht empfohlen** |
| **O4** | Entkopplung Kartenanzeige ↔ Sparraten-Beitrag | nur nötig, wenn Spartopf-Regel in die Sparrate gezwungen wird | Phantom-Differenzen zwischen Anzeige und Wirkung — dieselbe Klasse Problem, für die „Verbergen" verworfen wurde; RPC-Chirurgie an der Kernrechnung | riskant | ✗ — **entfällt** durch Zwei-Kennzahlen-Ansatz (§4) |

---

## 7. Empfehlung des Architekten

**Sparrate bleibt, was sie ist (GuV). Der Spartopf wird eine eigene Kennzahl. Der Weg dahin in drei Stufen:**

**Stufe 0 — sofort, kein Sprint (O0):** `own_ibans` um die zwei DKB-Verrechnungs-IBANs erweitern; per PM/User anzuwenden (einfaches UPDATE, Zwei-Personen-Prinzip gewahrt). Erkennungsquote ~72 %, die gefährlichen Giro→KK-Glieder sind neutralisiert.

**Stufe 1 — kleiner RPC-Sprint (Test-Projekt aktivieren):** `p_format_hint` (existiert bereits als Future-Proof-Slot!) für das KK-Format scharf schalten: `'DKB_VISA'` → Zeilen mit Beschreibung „Einzahlung"/„Ausgleich Kreditkarte" und positivem Betrag werden als `INTERNAL_TRANSFER` markiert. Damit ~100 % der 88 Glieder erkannt — die Auto-Erkennung wird nicht ersetzt, sondern **vervollständigt**. (Im selben Sprint: Duplikat-Hash-Nebenbefund adressieren, z. B. laufende Nummer identischer Zeilen innerhalb eines Import-Batches in den Hash — Re-Import-Idempotenz dabei bewahren.)

**Stufe 2 — erster Schema-Sprint (O1):** `accounts` + `fragments.source_account_id` + Rolle `SPAR_ANKER`. Darauf ein neues Read-RPC `calculate_spartopf_delta_for_month(user_id, month)`: Summe aller Fragmente auf Anker-Konten, topf-interne Umschichtungen ausgenommen. Rein additiv, keine Änderung an den bestehenden Sparrate-RPCs, OQ-B bleibt unangetastet. M9 (`paired_fragment_id`) bleibt bewusst offen — falls es je gebraucht wird, steht es dann auf einem Fundament, auf dem Pairing überhaupt validierbar ist.

Damit ist die offene Spannung aufgelöst: Beispiel 1 → Sparrate −100, Topf-Delta −100. Beispiel 2 → Karte zeigt −100, Sparrate −100 (User-Erwartung), Topf-Delta 0 (Spartopf-Logik). Keine Karte zeigt je etwas anderes, als sie beiträgt.

---

## 8. Offene Design-Fragen (User / DD)

1. **Topf-Definition als Konten-Menge:** Zählt das Depot (Sparplan-Käufe, 4× im Quartal) zum Spartopf? Empfehlung ja — dann sind Effekten-Käufe topf-intern neutral und Zins (+31,33) / Steuer (−8,76) topf-wirksam. → User.
2. **Gemeinschaftskonto:** Bestätigen, dass `DE60…948` *nie* als eigenes Konto geführt wird — Miete/Essen (Domi) müssen Ausgaben bleiben, obwohl Dominik Mitinhaber ist. → User (Grundsatzentscheid, dokumentieren).
3. **Scalable-Einzelfall:** Der +2.722,15-Eingang ist keine Einnahme. Kurzfristig: Fragment schlicht nie zuordnen (Rohmasse). Mit O1: Broker als Konto mit Rolle BROKER, Eingang als Umschichtung. Die Scalable-IBAN pauschal in eine Transfer-Liste zu nehmen, ist wegen möglicher echter Erträge unsauber. → User.
4. **Anzeige des Topf-Deltas:** Welle-Popup als zweite Zeile unter dem Hero-Wert? Sekundärwert am Ring? Reines DD-Territorium; die Kennzahl ist bewusst UI-agnostisch entworfen. → DD (Block-2-Kandidat).
5. **Timing akzeptieren:** Topf-Delta ist monatsscharf kontenbasiert; Ketten kreuzen Monatsgrenzen (Anthropic: Konsum Juni, Topf-Entnahme Juli). Vorschlag: als Eigenschaft der Kennzahl akzeptieren, nicht wegkorrigieren — alles andere kollidiert mit §2.1 und §4.7. → User bestätigen.
6. **Transfer-Drop als Geste:** Falls der User Transfers dennoch *etikettieren* möchte (z. B. „Ausgleich DKB" einer Urlaubs-Karte zuordnen, ohne Betragswirkung), wäre das ein neues Konzept „Label-Link ohne Aggregat-Wirkung" — ich rate ab (Phantom-Zuordnungen, gegen Simplicity), lege es aber als bewusste Entscheidung vor statt es still zu beerdigen. → User + DD.
7. **Re-Import-Rückwirkung klären (aus O0):** Markiert ein Re-Import Transfers in bereits abgeschlossenen Monaten nach — und ist das gewollt (Korrektur) oder ein §2.1-Konflikt (rückwirkende Ist-Änderung)? Mein Lesart: Transfer-Markierung *korrigiert* eine Fehlklassifikation und ist zulässig, verdient aber einen expliziten Beschluss. → User + PM.

---

*Architekten-Diskussionspapier Mehrkonten-Modell-Eignung · Antigravity Finance 2.0 · 05. Juli 2026 · Basis: Schema v3.1, Live-Introspektion (read-only), 3 Konto-CSVs (06.04.–05.07.2026)*
