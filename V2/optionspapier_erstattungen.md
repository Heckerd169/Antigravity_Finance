# Optionspapier — Behandlung von Erstattungen („Erstattungs-Blindfleck")

> **Von:** Zentraler Arbeits-Agent V2 (PM+Architekt)
> **An:** Dominik (Grundsatz-Entscheidung) · Design-Direktor (nur falls O-Misch §4 gewählt)
> **Datum:** 24. Juli 2026
> **Status:** ENTSCHIEDEN 24.07.2026 — E1 (Leitfaden O1+O2, Schwelle 100 €) ja · E2: ONCE-INCOME-Karte „Steuererstattung 2025" (Juni, +2.658,35 €) am 24.07.2026 durch den Arbeits-Agenten per `create_card_from_fragment` angelegt und mit dem Erstattungs-Fragment verlinkt (Juni-Sparrate verifiziert: 4.545,32 €) · E3 (kein Schema-Weg) ja. Design-Doku-Leitfaden-Patch: siehe P4 dieser Patch-Datei.
> **Quellen:** Beschluss-Nachtrag Mehrkonten (PM-Randnotiz „642 € im Juni") ·
> Live-Datenanalyse der importierten 2026-Fragmente (24.07.2026)

---

## 1. Befund — das Zahlenbild ist größer als die 642 €

Positive Fragmente 2026 ohne Transfer-/Umschichtungs-Charakter, kategorisiert:

| Kategorie | n | Summe | Status |
|---|---|---|---|
| Gehälter (Income-Timeline, korrekt kartenlos) | 6 | 24.990,66 € | ✓ kein Blindfleck |
| Zins/Abschluss-Kleinbeträge | 3 | 53,59 € | ✓ vernachlässigbar |
| Bereits durch INCOME-Karten gedeckt (Handy-Anteil, iCloud-Anteil, Mai-Einmal-Anteile) | 17 | 619,85 € | ✓ Kuratierung genügt |
| **Echter Blindfleck: Erstattungen/Zuwendungen ohne Karten-Ziel** | **29** | **4.365,14 €** | ✗ Sparrate sieht sie nicht |

Blindfleck je Monat: Jan 118,90 · Feb 34,90 · Mär 332,50 · Apr 280,49 · Mai 27,00 ·
**Jun 3.282,35** · Jul 289,00. Dominiert von der **Steuererstattung +2.658,35 €**
(Juni) — die real am selben Tag in den Spartopf floss („Sparen Steuer 2025"):
Die Juni-Ist-Sparrate zeigt 1.886,97 €, obwohl real zusätzlich ~2.658 € gespart
wurden — Einnahme unsichtbar (kein Karten-Ziel), Weiterleitung neutral (Transfer).
Der Rest sind private Zuwendungen (500 € „Bekannt", Geburtstags-/Ostergeld),
PayPal-Verkaufserlöse und Erstattungen (TK +80, Deutschlandticket +70, Fahrkarte +100).

**Warum das Modell sie verliert:** §4.2 definiert die Sparrate als Einkommen
(Timeline) − Karten-Größen. Ein positives Fragment wirkt nur, wenn es (a) auf einer
INCOME-Karte oder (b) als Verrechnung auf einer Kosten-Karte landet. Unzugeordnet
zählt es nirgends — die Sparrate ist systematisch **konservativ** (unterschätzt).

## 2. Wichtiger Technik-Befund: Verrechnung existiert bereits

`calculate_card_amount_for_month` summiert verlinkte Fragmente **vorzeichen-agnostisch**.
Ein +36,99-Retouren-Fragment per Drag auf die Ausgaben-Karte gezogen **reduziert
heute schon** deren Realität (bei BUDGET: senkt den Verbrauch — genau richtig für
Retouren wie Douglas/H&S). Es braucht **keinen Schema-Eingriff** — die offene Frage
ist reine Kurations-**Semantik**: Wohin gehört welcher positive Betrag?

## 3. Optionen

| # | Option | Mechanik | Bewertung |
|---|---|---|---|
| O1 | **Verrechnung gegen die Ausgabe** | +Fragment auf dieselbe Karte wie die Ausgabe ziehen | Heute möglich. Richtig für Retouren & Auslagen-Erstattungen mit klarem Kosten-Bezug. Grenze: braucht eine Karte |
| O2 | **INCOME-Karten-Pattern** | wiederkehrende Erstattungsquellen als MONTHLY-INCOME (existiert: Handy-Anteil, iCloud-Anteil); nennenswerte Einmal-Zuwendungen als ONCE-INCOME | Heute möglich. Präzise, aber bei Übertreibung Karten-Inflation |
| O3 | **Bewusst Rohmasse lassen** | nichts tun | Sparrate bleibt konservativ; akzeptabel für Kleinkram, falsch für 2.658 € |
| O4 | Modell-Erweiterung („kartenlose Einnahme zählt in Sparrate", Schema-Flag) | neues Fragment-Flag + RPC-Änderung | **Verworfen empfohlen** — bricht die Kern-Invariante „Karten sind die einzige Realitäts-Quelle der Sparrate" (§4.2) und reißt den Test-Projekt-Gate für ein Problem auf, das O1+O2 ohne Eingriff lösen |

## 4. Empfehlung: Kurations-Leitfaden O1+O2 (kein Schema-Eingriff)

1. **Retouren/Erstattungen mit Kosten-Bezug → O1** auf die verursachende Karte
   (Douglas-Retoure → Privates Budget; H&S-Gutschrift → Privates Budget; …).
2. **Wiederkehrende Anteile → O2-MONTHLY** (existieren bereits).
3. **Einmal-Zuwendungen ab einer Erheblichkeits-Schwelle (Vorschlag: 100 €) →
   O2-ONCE-INCOME-Karte** („Steuererstattung 2025" +2.658,35 als ONCE-INCOME im
   Juni; „Zuwendung Bekannt" +500; Geburtstagsgeld-Karten nach Bedarf). Damit wird
   der Juni ehrlich: Ist-Sparrate ≈ 4.545 statt 1.887 — was der Spartopf-Bewegung
   tatsächlich entspricht.
4. **Unter der Schwelle → O3** bewusst Rohmasse (PayPal-Kleinerlöse etc.).

Der Leitfaden wird als kurzer Absatz in die Design-Doku §11/§4-Umgebung gepatcht
(LL-16), sobald du ihn bestätigst — plus Aufnahme der neuen ONCE-INCOME-Karten in
deine Kuratierungs-Runde (die Zuordnungs-Hilfsliste markiert die Kandidaten schon
als „Rohmasse-Bleiber mit Erstattungs-Verweis").

Eine DD-Randfrage (nicht blockierend): Sollen Karten mit gemischten +/−-Links einen
dezenten Hinweis tragen (z. B. im Verknüpfte-Fragmente-Overlay), damit Verrechnung
sichtbar bleibt?

## 5. Entscheidungspunkte an Dominik

- **E1:** Leitfaden O1+O2+Schwelle 100 € annehmen? (Empfehlung: ja)
- **E2:** Steuererstattung als ONCE-INCOME-Karte „Steuererstattung 2025" (Juni,
  +2.658,35) anlegen — soll ich das nach deinem Go direkt per `create_card_direct`
  vorbereiten, oder legst du sie selbst in der App an?
- **E3:** O4 endgültig verwerfen (kein Schema-Weg)? (Empfehlung: ja)

*Optionspapier Erstattungen · Antigravity Finance 2.0 · 24. Juli 2026*
