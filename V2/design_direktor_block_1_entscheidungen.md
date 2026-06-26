# Design-Direktor-Block 1 — Entscheidungs-Record

> **Vom:** PM-Chat V2 (Opus 4.7)
> **Quelle:** Design-Direktor-Chat
> **Datum:** 13. Juni 2026
> **Status:** **Cluster 1 ABGESCHLOSSEN + vom User bestätigt.** Ersetzt die Zwischenfassung vom 04.06. (dort war „Verbergen behalten" — jetzt **gestrichen**). Cluster 2 (M3 → B6/B1 → B2/B3/B4) + Cluster 3 (N4b/M10/N5) ausstehend.
> **Zweck:** Autoritativer Record, aus dem PM die abhängigen Briefings + Architekten-Aufträge ableitet.

---

## 0. Kernmodell — drei Verben, keine vierte Geste

| Verb | Konsequenz | Quelle |
|---|---|---|
| **Löschen** | Karte weg aus *allen* Monaten, als hätte es sie nie gegeben | M1 (neu) |
| **Beenden** („Letzte Zahlung in Monat X") | Karte bleibt in der Vergangenheit, stoppt ab Folgemonat | §7 / §2.4 (bestehend) |
| **Anpassen** („Betrag anpassen → dauerhaft ab Monat X") | Vergangenheit eingefroren, neuer Plan vorwärts | §7 / §2.2 (bestehend) |

**„Verbergen" ist gestrichen.** Begründung: Eine verborgene, aber weiter mitzählende Karte macht die Sparrate aus den sichtbaren Karten nicht mehr rekonstruierbar — für einen Controller das Gegenteil von Kontrolle. Jeder Bedarf ist abgedeckt: Fehler → Löschen, Auslauf → Beenden, Änderung → Anpassen.

---

## 1. Festlegungen pro Frage

### M1 — Löschen
| Aspekt | Festlegung |
|---|---|
| **Lösch-Gate** | Löschbar ⟺ Karte hat **keine Fragmente aus früheren (abgeschlossenen) Monaten**. Maßgeblich ist das **Link-Month** (Periode), nicht `transaction_date` |
| **Aktueller-Monats-Fragment** | Blockiert **NICHT** — eine frisch per Drop angelegte Karte bleibt im selben Monat löschbar |
| **Fragment-Behandlung** | Immer **Soft-Detach**, nie Cascade. Fragment = Realität, wird nie zerstört. Aktuelles-Monats-Fragment wandert beim Löschen zurück in die Rohmasse |
| **Wirkung** | Karte verschwindet aus allen Monaten; da nur Karten ohne abgeschlossenen Fußabdruck löschbar sind, wird **kein abgeschlossener Monat** berührt |
| **Sicherheitsnetz** | 5s-Undo + 60s-Retention (§2.4), **kein** Bestätigungs-Modal |
| **Geltung** | Alle Typen (Fixkosten / Einnahmen / Budget) |

### M2 — Verbergen
**Gestrichen.** Löschen + Beenden ersetzen es vollständig.

### Beenden (unverändert)
Setzt `last_active_month`; Karte bleibt in Vergangenheitsmonaten sichtbar, erscheint ab Folgemonat nicht mehr. **Einzige** Geste für Karten mit abgeschlossenem Fußabdruck.

### Hinweis-UX bei gesperrtem Löschen
Im `⋯`-Menü erscheint „Karte löschen" **sichtbar, aber deaktiviert**, mit Ein-Zeilen-Begründung — *„Hat Fragmente aus früheren Monaten — nur Beenden möglich"* — und daneben die aktive Alternative „Letzte Zahlung in Monat X". Non-modal, kein Dead-End.

### A2 / A3 / A4
**Alle entfallen** (keine verborgenen Karten mehr; kein `CARD_HIDE`-Enum). Trash-Mechanik (§2.4) gilt nur noch für Löschen + Beenden — exakt das §2.4-Design vor dem Sprint-10-Verbergen.

---

## 2. §2.1 Snapshot-Integrität
Bleibt heilig, **ohne Ausnahme**. Löschen rührt per Gate keinen abgeschlossenen Monat an. Der früher erwogene §2.1-Carve-out **entfällt** durch das Gate.

---

## 3. Architekten-Auftrag (Pre-Sprint-Stufe-1 des Lösch-/Beenden-Sprints)
1. **Lösch-Gate-Erkennung (günstig):** existiert `card_fragment_link` / `card_monthly_states`-Row / Aktivität mit **Monat < aktueller Monat** (Link-Month maßgeblich)? Nein → löschbar
2. **Snapshot-Vollständigkeit:** manueller Tap (`manually_paid`) bzw. Plan-/Modell-α-Wert in abgeschlossenem Monat **sperrt ebenfalls** (wie ein früheres Fragment) — für den User unsichtbar
3. **Soft-Detach-Pfad:** beim Löschen Link lösen, Fragment zurück in Rohmasse, `suggested_card_id`/`confidence` zurücksetzen (analog Transfer-Invariante Sprint 9)
4. **Migration Verbergen-Streichung:** Live-DB produktiv seit 25.05. — etwaige `deleted_at`-Karten wieder einblenden (verlustfrei, snapshot-integer), `deleted_at`-UI-Filter entfernen, `toggle_card_hidden` stilllegen

---

## 4. Doku-Patches (LL-16 — PM wendet an)
- **§2.4:** Verbergen/`deleted_at`-UI-Hide raus; Löschen-Gate + Soft-Detach + Hinweis-Redirect rein
- **§7 (Kontextmenü):** „Verbergen" raus; „Karte löschen" als gegateter Eintrag mit Deaktiviert-Zustand + Ein-Zeilen-Begründung; Eligibilität von „nie genutzt" auf „kein Fragment aus früheren Monaten" erweitern
- **CLAUDE.md:** §-Verweise + „Was Claude Code NIE macht" / Sprint-Protokoll nachziehen (Sprint-10-V4''-Hide als zurückgebaut markieren)

---

## 5. Backlog-/Roadmap-Hygiene (PM-Folge)
Durch die Verbergen-Streichung werden obsolet — beim nächsten Roadmap-/CLAUDE.md-Sync entfernen:
- **Roadmap A2, A3** → obsolet
- **Roadmap A4** (`CARD_HIDE`-Enum-Teil) → obsolet; M2 final aufgelöst
- **Handover-Backlog A2/A3/A4** + **Sprint-10-V2-Vormerkungen** („Versteckte Karten verwalten", „Bestätigungs-Dialog vor Verbergen") → obsolet
- Sprint-10-V4''-Soft-Delete-Hide wird im Lösch-Sprint **zurückgebaut** (bewusste Feature-Rücknahme, nicht Drift)

---

## 6. Was Cluster 1 entsperrt (künftiger Lösch-/Beenden-Sprint, nach v2-01)
| Schritt | Inhalt |
|---|---|
| Doku-Patch | §2.4 + §7 + CLAUDE.md (siehe §4), als separate Patch-Datei |
| Architekten-Stufe-1 | die vier Punkte aus §3 (inkl. Verbergen-Streich-Migration) |
| PM-Briefing | Lösch-/Beenden-Sprint inkl. Hinweis-UX + §7-Menü-Verfeinerung |

---

## 7. Cluster 2 + 3 — ausstehend
Cluster 2: M3 → B6 (nur Popup) / B1 → B2/B3/B4. Cluster 3 (N4b/M10/N5) erst nach M3-Ausgang. Wird hier ergänzt.

---

*DD-Block-1 Entscheidungs-Record (final) · Antigravity Finance 2.0 · 13. Juni 2026*
