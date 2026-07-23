# Beschluss-Nachtrag — Mehrkonten-Modell: Auflösung der 7 offenen Design-Fragen

> **Vom:** Architekten-Chat (Schema v3.1)
> **An:** PM-Chat V2 (zur Anwendung; LL-16 — kein Self-Edit des Diskussionspapiers, dieser Nachtrag ergänzt es)
> **Datum:** 06. Juli 2026
> **Referenz:** `architekt_diskussionspapier_mehrkonten_modell_eignung.md`, §8
> **Status:** Alle 7 Fragen im direkten Dialog mit dem User entschieden (Schritt-für-Schritt, je einzeln bestätigt). Live-DB dabei ausschließlich read-only introspiziert.

---

## 1. Beschlüsse je Frage

### F1 — Topf-Definition & Grenzregel ✅ entschieden

- **Spartopf = Cortal-Consors-Verbund als Ganzes** (Tagesgeld + Depot).
- **Grenzregel:** Als Topf-Bewegung zählen **ausschließlich Überweisungen DKB-Girokonto ↔ Cortal** (beide Richtungen). Es existiert **kein DKB-Tagesgeldkonto** — der Giro ist der einzige Korridor (User-Klarstellung; die Auftrags-Formulierung „DKB-Tagesgeld" war ungenau).
- **Topf-interne Umschichtungen** (Effekten-Sparpläne Tagesgeld → Depot) sind **neutral**.
- **Kapitalerträge** (Zins/Steuer) zählen **nicht** als Sparleistung — sie erhöhen den Bestand, nicht die Rate (User bestätigt).
- **Gesparte Einmaleinnahmen** (z. B. Steuererstattung → Topf) zählen als echtes Sparen.
- **Zweck-Änderung durch F4:** Diese Regeln definieren keine angezeigte Kennzahl mehr, sondern die **Klassifikations-Hygiene** — sie legen fest, was als interner Transfer neutralisiert wird, damit die Ring-Sparrate sauber bleibt.

### F2 — Gemeinschaftskonto ✅ entschieden (Grundsatzentscheid, zu dokumentieren)

`DE60…1089942948` (Gemeinschaftskonto Dominik + Aline) wird **niemals** als eigenes Konto geführt (nie in `own_ibans`), obwohl der User Mitinhaber ist. Zahlungen dorthin (Miete, Essen, Strom „(Domi)" …) bleiben aus Sparraten-Sicht **Ausgaben**.

### F3 — Scalable / Vermögensumschichtung ✅ entschieden

- **Sofort:** Der Broker-Eingang (+2.722,15, 04.05.) bleibt **Rohmasse**, wird nie einer Karte zugeordnet — damit automatisch sparraten-neutral.
- **Kein** pauschaler Eintrag der Scalable-IBAN in `own_ibans`.
- **Stufe-1-Sprint:** `fragments.transfer_type`-CHECK wird um den Wert **`ASSET_REALLOCATION`** erweitert — **manuell setzbare** Markierung für Vermögensumschichtungen (z. B. Giro→Cortal-Überweisung „Übertrag Scalable", strukturell nicht von Sparüberweisungen unterscheidbar → Absichtsfrage, daher manuell; erwartete Frequenz 1–2/Jahr). Semantik: verhält sich überall wie `INTERNAL_TRANSFER` (nie an Karten verlinkbar, neutral für die Sparrate); der zusätzliche Ausschluss aus einer Topf-Kennzahl ist durch F4 derzeit ohne Konsument, die Unterscheidbarkeit bleibt bewusst erhalten. Regel ist symmetrisch (auch Topf→Broker).
- **BROKER-Konten-Rolle:** vertagt (fällt mit der `accounts`-Tabelle, siehe F4).
- Implementierungsnotizen: Defense-in-Depth-Filter in `calculate_card_amount_for_month` von `IS DISTINCT FROM 'INTERNAL_TRANSFER'` auf **`transfer_type IS NULL`** umstellen (schützt neue Werte automatisch); Markierung braucht ein kleines Schreib-RPC mit Ownership-Check. Markier-**Geste** (UI) → DD.

### F4 — Anzeige / Kennzahlen-Architektur ✅ entschieden (revidiert)

- **Die Ring-Sparrate (GuV: Einkommen − realisierte Karten-Abflüsse) ist die einzige sichtbare Sparkennzahl der App.** Unverändert, keine Entkopplung Kartenanzeige ↔ Beitrag.
- **Kein Topf-Delta in V2** — weder im Ring noch im Welle-Popup. Begründung (vom User selbst geliefert, vom Architekten übernommen): Bei disziplinierter Puffer-Nachüberweisung ist das monatliche Topf-Delta nur die GuV-Sparrate mit Zeitversatz plus Rauschen — Timing-Artefakte ohne Entscheidungsinformation, kumuliert konvergent. Die ursprüngliche Architekten-Empfehlung „Zweitkennzahl im Popup" ist damit **zurückgezogen**.
- **Vertagt bis echter Bedarf (M9-Kontext):** `accounts`-Tabelle, `fragments.source_account_id`, Konten-Rollen (inkl. BROKER), Topf-Delta-RPC.

### F5 — Timing-Beispiel ✅ gegenstandslos

Durch F4 erledigt: Ohne angezeigte Topf-Kennzahl gibt es keinen Monatsversatz mehr zu akzeptieren. Die Diskussion wurde faktisch über den Puffer-Einwand des Users geführt und ist im F4-Beschluss aufgegangen.

### F6 — Transfer-Drop als Geste ✅ entschieden

**Wird nicht gebaut.** Transfer-Fragmente bleiben nicht-drop-fähig, OQ-B bleibt vollständig unangetastet — weder Verrechnungs- noch Etikett-Variante. Begründung: Etikett ändert keine Zahl (rein dekorativ), erzeugt Phantom-Zuordnungen (Fragment „auf der Karte", das in der Summe nicht vorkommt — dieselbe Problemklasse wie das verworfene „Verbergen") und erforderte eine neue Link-Art gegen `UNIQUE(fragment_id)` + OQ-B-Link-Auflösung. Das reale Bedürfnis (Kette nachvollziehen) ist gedeckt: externes Rand-Fragment auf der Karte, Transfer-Glieder ausgegraut mit Badge in der Rohmasse (Cluster-3), über identische Verwendungszwecke auffindbar. Damit ist die ursprüngliche User-Hypothese vollständig zerlegt und beantwortet: Verrechnung → gelöst durch vervollständigte Auto-Erkennung; Zuordnung → entfällt mangels Nutzen.

### F7 — Re-Import-Rückwirkung ✅ entschieden

- **Grundsatz:** Transfer-Markierung in vergangenen (auch design-seitig abgeschlossenen) Monaten ist eine **zulässige Korrektur einer Fehlklassifikation**, kein §2.1-Bruch. §2.1 schützt Fakten vor stillem Umschreiben durch spätere *Ereignisse*; eine Sparrate, die interne Transfers als Konsum zählte, war faktisch falsch. **Bedingung:** Korrektur nur durch **explizite User-Aktion** (Re-Import), niemals durch Hintergrundjobs.
- **Operativ — der Umstellungs-Moment:** kein Ad-hoc-Handgriff, sondern geordneter Schritt: `own_ibans` erweitern (Stufe 0) → Stufe-1-Sprint live → **Voll-Re-Import Giro + Cortal + KK** über den gesamten Zeitraum. Proxy-Links lösen sich auf, echte KK-Käufe übernehmen (Distiller-Vorschläge + manuelle Drops).
- **User-Hinweis (eingearbeitet):** Zum V2-Go-Live ist ohnehin ein Ganzjahres-Import (monatsweise) geplant, um einen sauberen Startpunkt zu schaffen. **Der Umstellungs-Moment fällt mit diesem Go-Live-Import zusammen** — kein separater Termin nötig.
- **⚠ Sequenz-Bedingung:** Der **Duplikat-Hash-Fix muss vor dem Ganzjahres-Import** gelandet sein (Stufe 1), sonst verschluckt der Hash-UPSERT byte-identische Zeilen (realer Fall: 2× PAYPAL −10,00 am 11.06.) — bei einem Voll-Import über 12 Monate ist die Trefferwahrscheinlichkeit erheblich.

---

## 2. Kontext aus der Live-DB (read-only, Stand 06.07.2026)

Für das Sprint-Briefing relevant: Der Bestand umfasst **genau einen Monat** (Mai 2026, 55 Fragmente; Giro- und Cortal-CSV importiert, **KK-CSV nie**). Die 14 Cortal↔Giro-Glieder sind bereits korrekt auto-markiert (Erkennung arbeitet wie entworfen, Scalable-Übertrag −2.700 darunter). **6 von 7 Giro→KK-Aufladungen sind als Konsum-Stellvertreter an Karten verlinkt** (V1-Workaround mangels KK-Import; Proxy-Summe 2.581 € vs. echte Mai-KK-Käufe ~2.651 €). Ein Re-Import mit erweiterten `own_ibans` **ohne gleichzeitigen KK-Import** würde den Mai daher verfälschen (Konsum verschwände) statt korrigieren — der F7-Umstellungs-Moment ist deshalb als ein zusammenhängender Schritt definiert. Formal eingefrorene Monatszustände (`closed_at`) existieren noch keine.

---

## 3. Resultierender verschlankter Stufenplan

| Stufe | Inhalt | Ausführung | Status |
|---|---|---|---|
| **0** | `own_ibans` += `DE63120300000001999333` (KK-Aufladung), `DE79120300009003290294` (KK-Abrechnung). **Nie aufnehmen:** `DE96…9005290904` (Visa-Debit = echte Ausgaben), `DE60…1089942948` (Gemeinschaftskonto, F2) | Reines DML auf `profiles`; PM/User wendet an (Zwei-Personen-Prinzip) | beschlossen, anwendbar |
| **1** | RPC-Sprint (aktiviert vereinbarungsgemäß das Test-Projekt): ① `p_format_hint = 'DKB_VISA'` scharf schalten — Zeilen „Einzahlung" / „Ausgleich Kreditkarte" mit Betrag > 0 → `INTERNAL_TRANSFER` · ② CHECK-Erweiterung `ASSET_REALLOCATION` + Markier-RPC (Ownership-Check) · ③ Defense-in-Depth-Filter → `transfer_type IS NULL` · ④ **Duplikat-Hash-Fix** (Laufnummer identischer Zeilen im Import-Batch; Re-Import-Idempotenz bewahren) | Architekt liefert Schema-/RPC-Entwurf nach Freigabe; Migration erst nach expliziter Bestätigung durch Dominik | beschlossen, zu briefen |
| **Umstellungs-Moment** | Voll-Re-Import Giro + Cortal + KK, gesamter Zeitraum; Proxy-Links → echte KK-Käufe | **= V2-Go-Live-Ganzjahres-Import** (User); zwingend **nach** Stufe 1 | beschlossen |
| **vertagt** | `accounts`-Tabelle, Konten-Rollen (SPAR_ANKER, BROKER), `source_account_id`, Topf-Delta-RPC, `paired_fragment_id` | M9-Kontext, „bauen bei echtem Bedarf" | bewusst offen |

---

## 4. Übergaben

**An den Design-Direktor (nächster Block):**
- Markier-Geste für `ASSET_REALLOCATION` (Kontextmenü am Fragment? Badge-Darstellung?) — einzige verbliebene DD-Frage aus diesem Komplex; die Topf-Delta-Anzeige ist entfallen.

**An den PM (Randnotizen, außerhalb dieses Auftrags):**
- **Erstattungs-Blindfleck:** Im Juni lagen 642 € Erstattungen/Zuwendungen (u. a. 500 € privat, PayPal-Eingänge, Handy-Anteil) auf keiner Einnahmen-Karte — die Ring-Sparrate sieht sie nicht. Grundsatzfrage „Behandlung von Erstattungen" (eigene Einnahmen-Karte vs. Verrechnung gegen die Ausgabe) als eigenes Thema führen.
- Duplikat-Hash-Befund ist in Stufe 1 ④ eingeplant (Ursprung: Nebenbefund §1.3 des Diskussionspapiers).

---

*Beschluss-Nachtrag Mehrkonten-Modell · Antigravity Finance 2.0 · 06. Juli 2026 · ergänzt das Diskussionspapier vom 05.07.2026, ersetzt dessen §8*
