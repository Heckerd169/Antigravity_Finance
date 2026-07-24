# Architekt-Stufe-1 — Karten-Löschen (M1) + Verbergen-Ablösung (M2)

> **Von:** Zentraler Arbeits-Agent V2 (PM+Architekt)
> **An:** Dominik (Entscheidungs-Gate) · Design-Direktor (Gesten/Sprache, §6)
> **Datum:** 24. Juli 2026
> **Status:** ENTSCHIEDEN 24.07.2026 — E1 (Drei-Verben-Modell + Gate) ja · E2 (Verbergen streichen) ja · E3 (Hard-Delete opportunistisch) ja · E4 (Test-Projekt) freigegeben, Anlage aktuell durch Free-Projekt-Limit blockiert (2/2 Slots belegt, siehe Runbook `supabase/test_projekt/README.md`). Umsetzung im Folge-Sprint (neue Session).
> **Umsetzung:** 24.07.2026 abends als Sprint v2-05 — Übungs-DB-Probe (T1–T6 grün) → Live-Migration (Kurve unverändert) → UI deployed (Commit cd36ff0). Details: sprints/sprint_v2-05_review.md.
> **Quellen:** Roadmap M1/M2/A2–A4 (`v2_roadmap_konsolidiert.md`) · Schema-Doku v3.2 §2.4/§6/§7 ·
> Sprint-10-Implementierung (Verbergen) · Live-DB-Inventur 24.07.2026 (read-only)

---

## 1. Ist-Stand

**Code (Sprint 10):** „Verbergen" = `cards.deleted_at` via RPC `toggle_card_hidden`,
5-s-Undo-Toast (`CardHideProvider`), UI-Filter nur in der Karussell-Query
(`deleted_at IS NULL`, Anker A2.11); alle Sparrate-Surfaces ignorieren `deleted_at`
bewusst (Snapshot-Integrität). Der V1-Scope-Cut aus Sprint 4 („Letzte Zahlung in
Monat X" + „Karte löschen") ist nie nachgeholt worden.

**Schema (bereits vorhanden, aber nie verdrahtet):** §2.4 definiert ein vollständiges
Trash-Design — `deleted_entities` (Owner-RLS, `expires_at`, „Cleanup-Job nach
expires_at, Restored-Zeilen bleiben") + `app_config`-Schlüssel
`trash.retention_seconds = 60`. Hard-Delete einer Karte **kaskadiert** DB-seitig auf
`card_monthly_states` + `card_fragment_links`; **Fragmente überleben** (unabhängig),
`fragments.suggested_card_id` ist `ON DELETE SET NULL`.

**Live-Inventur (24.07.2026):** 31 aktive Karten · 0 versteckte (`deleted_at`) ·
0 `deleted_entities`-Zeilen · 0 `card_monthly_states` · 3 Links (Spotify-Auto-Absorbs).
**Das Migrationsfenster ist ideal — die Verbergen-Ablösung trifft null Bestandsdaten.**

## 2. Vorgeschlagenes Semantik-Modell: drei Verben statt zwei

| Verb | Mechanik | Snapshot-Wirkung | Verfügbarkeit |
|---|---|---|---|
| **Beenden** | `last_active_month` setzen | keine (Schema-Doku §7 nennt genau diesen Mechanismus als sanktionierte „Karten-Lebensdauer") | immer |
| **Löschen** | `deleted_at` als Papierkorb-Marker + `deleted_entities`-Eintrag (`expires_at = now() + trash.retention_seconds`), Undo = Restore, danach Hard-Delete mit DB-Kaskade | keine — per **Lösch-Gate** erzwungen | nur bei grünem Gate |
| **Verknüpfungen lösen** (Soft-Detach) | bestehender Eject-Flow (Sprint 5), neu als Bulk „alle Links dieser Karte lösen" | **ändert Vergangenheit** (Karten-Realität fällt auf Plan zurück) → nur als explizite User-Aktion mit Bestätigungstext; Fragmente fallen verlustfrei in die Rohmasse | immer, bewusst |

**Lösch-Gate-Prädikat** (via Link-Month — hart löschbar gdw. die Karte nie Realität
oder Vergangenheit berührt hat):

```
card_is_hard_deletable(card) :=
      NOT EXISTS (card_fragment_links WHERE card_id = card)      -- kein Link, egal welcher Monat
  AND NOT EXISTS (card_monthly_states WHERE card_id = card)      -- kein Tap/Adjustment
  AND card.first_active_month >= date_trunc('month', now())      -- kein Plan-Beitrag in der Vergangenheit
```

Konsequenz: Hart löschbar sind nur **Fehlanlagen und reine Zukunfts-Karten**. Alles
mit Historie wird **beendet** (Karussell-Ende ab Folgemonat, Vergangenheit bleibt
cent-exakt) — wer wirklich löschen will, muss vorher bewusst detachen und kann es
per Gate dann trotzdem nur, wenn keine Vergangenheits-Plan-Monate existieren.
§2.1 bleibt damit strukturell unverletzlich, nicht nur konventionell.

**M2-Empfehlung: Verbergen ersatzlos streichen.** „Beenden" deckt den realen
Anwendungsfall (Karte soll ab jetzt weg) sauberer ab als das heutige Verbergen
(das die Karte in ALLEN Monaten inkl. Vergangenheit ausblendet — rückblickend
verwirrend, weil die Sparrate sie weiter enthält). A2 (Versteckte-Karten-Verwaltung)
und A3 (Bestätigungs-Dialog vor Verbergen) werden damit obsolet; A4 (Trash-Variante)
geht im Lösch-Flow auf. Wegfall: RPC `toggle_card_hidden`, hide/unhide-Actions,
Verbergen-Menüpunkt; der Undo-Toast-Mechanismus wird für Lösch-Undo wiederverwendet.

## 3. Offene Architektur-Frage: Wer vollzieht den Hard-Delete nach `expires_at`?

| Option | Bewertung |
|---|---|
| (a) `pg_cron`-Job | sauber, aber neue Infra-Abhängigkeit für einen 60-s-Trash |
| **(b) opportunistisch beim nächsten App-Zugriff** (Server-Action räumt abgelaufene eigene Trash-Zeilen) | **Empfehlung** — kein Infra-Zusatz, RLS-konform, Verzögerung irrelevant (gelöschte Karte ist ab `deleted_at` unsichtbar) |
| (c) sofortiger Hard-Delete nach 5-s-UI-Undo ohne Server-Trash | einfachste V1-Form, aber verschenkt das fertige §2.4-Design und das Undo hängt am Client |

## 4. Migrations-/Sprint-Skizze (Dry-Run zuerst im Test-Projekt)

1. **RPCs (neu, SECURITY INVOKER):** `end_card(p_card_id, p_last_month)`
   (Validierung `p_last_month ≥ first_active_month`; Enden in der Vergangenheit
   erlaubt = explizite User-Korrektur, UI-Default aktueller Monat) ·
   `delete_card(p_card_id)` (Gate-Prüfung, bei Verstoß 23514 mit Grund-Code
   `HAS_LINKS` / `HAS_STATES` / `HAS_PAST_PLAN`; setzt `deleted_at` +
   `deleted_entities`) · `restore_card(p_card_id)` · opportunistischer
   Cleanup in einer bestehenden Server-Action (Option b).
2. **Wegfall:** `toggle_card_hidden` + zugehörige Frontend-Pfade.
3. **UI:** Kontextmenü „Karte beenden…" (Monatswahl) + „Karte löschen"
   (Gate-abhängig) + Bulk-„Verknüpfungen lösen" im Verknüpfte-Fragmente-Overlay.
4. **Anker-Strategie:** Der historische §4.6-Anker (2.910,01 €, Test-State) existiert
   nicht mehr. Ersatz: **Prod-Real-Anker** (aktuell Juni 2026 = 1.886,97 € bzw. der
   Stand nach Kuratierung, vor Migration eingefroren) + 12-Monats-Kurve
   vorher/nachher identisch. Test-Projekt Init-2 bekommt einen **synthetischen
   deterministischen Seed** (kleiner Kartensatz + Fragmente mit bekannter Sparrate)
   statt einer Prod-Kopie — Determinismus ohne Echtdaten-Kopie.
5. **Aufwand:** Test-Projekt-Setup ~0,5 Tag · Migration + RPC-Sandbox ~1 Tag ·
   UI + Smoke ~1 Tag.

## 5. DD-Fragen (M2-Rücksprache, vor UI-Umsetzung)

1. Verben-Sprache im UI („Beenden" vs. „Auslaufen lassen"; „Löschen" nur bei grünem Gate).
2. Roter-Gate-Zustand: Lösch-Eintrag ausgegraut mit Begründung vs. ganz verborgen.
3. Bestätigungs-Dialoge (Beenden ohne Dialog + Undo? Detach immer mit Dialog?).
4. Papierkorb-Sichtbarkeit: V1 = nur Undo-Toast, kein Trash-Browser — ok?

## 6. Entscheidungspunkte an Dominik

- **E1:** Drei-Verben-Modell + Gate-Prädikat wie in §2? (Empfehlung: ja)
- **E2:** Verbergen ersatzlos streichen (M2)? (Empfehlung: ja — 0 Bestandsdaten)
- **E3:** Hard-Delete-Vollzug Option (b) opportunistisch? (Empfehlung: ja)
- **E4:** Sprint-Schnitt: ① Test-Projekt-Setup (Init-1/Init-2, braucht dein Go wegen
  Free-Tier-Projekt in deiner Org) → ② Lösch-Migration Dry-Run+Live → ③ UI.
  Das Test-Projekt entsperrt zugleich den B2-Backend-Sprint (RPC-Gate, siehe
  B2-Konzeptpapier).

*Stufe-1-Papier Karten-Löschen · Antigravity Finance 2.0 · 24. Juli 2026*
