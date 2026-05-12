# Antigravity Finance 1.0 — Schema-Zusammenfassung

**Version:** 2.0
**Status:** Datenbankseitig vollständig implementiert
**Datum:** April 2026
**Iterationen bis hierher:** Phase 1 (4 Iterationen Logik-Klärung) + Phase 2 (9 Migrations-Blöcke)
**Referenz-Dokument für Frontend-Phase**

**Änderungen ggü. v1:** Eine Zeile in Section 9 ergänzt — `card_monthly_states.closed_at` ist in V1 ungenutzt (siehe Schema-Hinweis am Ende von Section 9).

---

## 1. Was gebaut wurde

10 Tabellen, 1 View, 16 Funktionen, 4 Trigger, vollständige RLS, Seed-Daten für Steuerklassen 1–6 und globale Konstanten.

```
   IDENTITÄT          EINKOMMEN              KARTEN                   FRAGMENTE
   ─────────          ─────────              ──────                   ─────────
   profiles           income_timeline        cards                    fragments
                      net_estimation_        card_planned_timeline    card_fragment_links
                      brackets               card_monthly_states      fragments_with_status (View)

   INFRASTRUKTUR
   ─────────────
   app_config          → globale Konstanten (Schwellen, Gewichte, Retention)
   deleted_entities    → Trash für Rückgängig-Pattern
```

---

## 2. Beziehungs-Diagramm

```
auth.users (Supabase Auth)
    │
    │ 1:1
    ▼
profiles ─────────────────────────────────┐
    │                                     │
    │ 1:n                                 │
    ▼                                     │
income_timeline                           │
                                          │
                                          │ owner ⤴
profiles                                  │
    │ 1:n                                 │
    ▼                                     │
cards ────────────────────────────────────┤
    │                                     │
    ├─ 1:n ─→ card_planned_timeline      │
    │         (Plan-Zeitreihe)           │
    │                                     │
    ├─ 1:n ─→ card_monthly_states        │
    │         (Sparse Pro-Monat-State)   │
    │                                     │
    └─ 1:n ─→ card_fragment_links ←──┐   │
                  │                  │   │
                  │ n:1              │   │
                  ▼                  │   │
              fragments              │   │
                  ▲                  │   │
                  │ UNIQUE(fragment_id)──┘
                  │
                  │ owner ⤴
              profiles

deleted_entities  ── owner ──→ profiles
net_estimation_brackets  (global, kein Owner)
app_config              (global, read-only für User)
```

**Lese-Hilfe:**

- Jede Tabelle mit Owner kaskadiert auf `auth.users`-Löschung (DSGVO-Konformität)
- `card_fragment_links` hat den `UNIQUE(fragment_id)`-Constraint → ein Fragment kann maximal einer Karte zugewiesen sein → keine Doppelverbuchung möglich
- Cascading: Karte gelöscht → States + Links weg, Fragmente bleiben (sie sind unabhängig)

---

## 3. Datenbasis der Sparrate — die Wahrheits-Quellen

Die Sparrate ist nirgends gespeichert. Sie wird zur Laufzeit aus diesen vier Quellen berechnet:

| Quelle | Was sie liefert | Forward-Inheritance? |
|---|---|---|
| `income_timeline` | Brutto + Netto pro Person | Ja — neuester Eintrag ≤ Monat M |
| `card_planned_timeline` | Geplanter Wert pro Karte | Ja — neuester Eintrag ≤ Monat M |
| `card_monthly_states` | Tap-Status, einmalige Anpassung | Nein — exakter Monat |
| `card_fragment_links` + `fragments` | Realer Geldfluss pro Karte | Nein — exakter Monat |

Damit sind **alle drei Zeiträume** (Vergangenheit, Gegenwart, Forecast) durch dieselbe Funktion abgedeckt — der Unterschied ergibt sich automatisch aus dem Daten-Inhalt.

---

## 4. Funktionen — was das Frontend per RPC ruft

### Im Hot-Path (bei jedem Render)

| Funktion | Wofür | Returns |
|---|---|---|
| `calculate_sparrate_for_month(user_id, month)` | Ring-Zentrum-Wert | `numeric` (NULL falls Onboarding offen) |
| `calculate_planned_sparrate_for_month(user_id, month)` | Ring-Arc-Nenner (Plan-Sparrate ohne Realität-Pfad) | `numeric` (NULL falls Onboarding offen) |
| `calculate_card_amount_for_month(card_id, month)` | Wert auf Karte | `numeric` (immer ≥ 0) |
| `is_card_active_in_month(card_id, month)` | Karte rendern oder nicht? | `boolean` |
| `get_planned_amount_for_month(card_id, month)` | Plan-Anzeige | `numeric` |
| `get_net_monthly_for_month(user_id, person, month)` | Netto-Anzeige | `numeric` |
| `get_split_factor(user_id, month)` | "ICH 60%" / "PARTNER 40%"-Anzeige | `numeric` (0..1) |

### Beim CSV-Import

| Funktion | Wofür | Returns |
|---|---|---|
| `calculate_match_confidence(fragment_id, card_id)` | Best-Match finden, Auto-Absorption-Entscheidung | `numeric` (0..1) |
| `name_similarity(description, card_name)` | direkte Trigram-Ähnlichkeit | `numeric` |
| `amount_match(fragment, planned)` | Bracket-Score | `numeric` |
| `frequency_match(date, card_id)` | Konsistenz-Check | `numeric` |

### Beim Onboarding und Income-Editing

| Funktion | Wofür | Returns |
|---|---|---|
| `estimate_net_monthly(gross_annual, tax_class, tax_year)` | Netto-Vorschlag im Income-Popup | `numeric` (NULL falls keine Bracket passt) |

### Beim Lösch-Pattern

| Funktion | Wofür | Returns |
|---|---|---|
| `schedule_deletion(entity_type, entity_id, payload)` | Aktion in Trash legen mit auto-berechnetem `expires_at` | `uuid` (Trash-ID) |
| `restore_deletion(trash_id)` | "Rückgängig"-Klick | `boolean` |

---

## 5. Interaktions-Mapping — User-Aktion → DB-Operation

Die kompakte Referenz für die Frontend-Implementierung:

| User-Aktion | DB-Operation |
|---|---|
| **Onboarding: erstes Gehalt** | INSERT `income_timeline` (ICH); UPDATE `profiles.onboarded_at = now()` |
| **Gehalt ändern (vorwärts)** | INSERT neue Zeile in `income_timeline` |
| **Karte anlegen (Direktklick)** | INSERT `cards` + INSERT `card_planned_timeline` (Transaktion!) |
| **Karte anlegen (Fragment-Drop)** | INSERT `cards` + INSERT `card_planned_timeline` + INSERT `card_fragment_links` (Transaktion!) |
| **Fixkosten/Income tappen** | UPSERT `card_monthly_states` mit `manually_paid` toggle |
| **Fragment auf Karte droppen** | INSERT `card_fragment_links` mit `origin='MANUAL_DROP'` |
| **Fragment ejecten** | DELETE FROM `card_fragment_links WHERE fragment_id=$1` |
| **Betrag anpassen, nur dieser Monat** | UPSERT `card_monthly_states.adjusted_amount` |
| **Betrag anpassen, dauerhaft ab Monat X** | INSERT neue Zeile in `card_planned_timeline` mit `effective_month=X` |
| **Letzte Zahlung in Monat X** | RPC `schedule_deletion('CARD_END', card_id, {...})` |
| **Karte hard-löschen (nie genutzt)** | RPC `schedule_deletion('CARD', card_id, {})` |
| **Rückgängig-Klick** | RPC `restore_deletion(trash_id)` |
| **CSV-Import** | Pro Zeile: INSERT `fragments` ON CONFLICT DO NOTHING; danach Konfidenz-Loop |
| **Sparrate für Ring** | RPC `calculate_sparrate_for_month(user_id, month)` |
| **Sparraten-Treppe** | Schleife über 12 Monate, je RPC `calculate_sparrate_for_month` |
| **Subzeile "X Fragmente offen"** | SELECT COUNT FROM `fragments_with_status WHERE status='UNASSIGNED' AND date_trunc(...) = $month` |

---

## 6. Lösch-Logik — explizit pro Entität

| Entität | Lösch-Pfad |
|---|---|
| **profiles** | Cascade über `auth.users`-Löschung — DSGVO-Vollbereinigung |
| **income_timeline** | Append-only in V1. Kein Lösch-Pfad im Frontend |
| **cards** | Zwei Pfade: (a) **Hard-Delete** wenn nie genutzt — Cascade auf alle Children. (b) **Soft-End** über `last_active_month` — bleibt historisch sichtbar |
| **card_planned_timeline** | Cascade-Delete bei Karten-Hard-Delete. Sonst append-only |
| **card_monthly_states** | Cascade-Delete bei Karten-Hard-Delete. State-Reset (= DELETE) nach UI-Logik möglich |
| **card_fragment_links** | DELETE bei Eject. Cascade bei Karten- oder Fragment-Hard-Delete |
| **fragments** | Hard-Delete erlaubt. Cascade entfernt Links automatisch |
| **deleted_entities** | Cleanup-Job nach `expires_at`. Restored-Zeilen bleiben dauerhaft |
| **app_config / net_estimation_brackets** | Nur über Service-Role änderbar |

---

## 7. Snapshot-Integrität — wie sie technisch garantiert ist

Das Architekten-Kernprinzip „Daten sind unveränderlich, Ereignisse nicht" wird auf drei Ebenen durchgesetzt:

| Ebene | Mechanismus |
|---|---|
| **Gehaltsänderungen** | Append-only über `income_timeline`. Lookup nimmt neuesten Eintrag ≤ M → vergangene Monate sehen weiterhin den damaligen Stand |
| **Plan-Anpassungen einer Karte** | Append-only über `card_planned_timeline`. Forward-Inheritance ohne Modifikation alter Werte |
| **Karten-Lebensdauer** | `last_active_month` setzt das Ende, ohne historische Monate zu beeinflussen |
| **Fragmente** | Sind Geldflüsse — können in der Zeit nicht "verschoben" werden. Eject ist DELETE des Links, nicht des Fragments |
| **Sparrate** | Niemals als Spalte gespeichert. Funktion liest deterministisch aus den eingefrorenen Quellen |

→ **Eine Plan-Anpassung im April 2026 ändert niemals die Sparrate vom Februar 2026.** Garantiert durch das Schema selbst, nicht durch Anwendungslogik.

---

## 8. RLS — Sicherheits-Modell

| Tabelle | Read | Write |
|---|---|---|
| `profiles` | Owner | Owner |
| `income_timeline` | Owner | Owner |
| `cards` | Owner | Owner |
| `card_planned_timeline` | Owner | Owner |
| `card_monthly_states` | Owner | Owner |
| `fragments` | Owner | Owner |
| `card_fragment_links` | Owner | Owner |
| `deleted_entities` | Owner | Owner |
| `fragments_with_status` (View) | Erbt von `fragments` + `card_fragment_links` | (View, nicht beschreibbar) |
| `app_config` | Alle authentifizierten | Nur Service-Role |
| `net_estimation_brackets` | Alle authentifizierten | Nur Service-Role |

**Owner = `auth.uid() = user_id`**. Keine Cross-User-Sichtbarkeit. Service-Role (Migrations, Admin-Tools) umgeht RLS.

---

## 9. Was bewusst NICHT gebaut wurde

Aus den V2-Diskussionen:

| Feature | Warum nicht V1 | Wo es später ansetzt |
|---|---|---|
| Periodenabgrenzung | Komplexität | `card_fragment_links.month` ist bereits separates Feld — V2 entkoppelt vom `transaction_date` |
| Rückwirkende Gehaltskorrektur mit Fairness-Delta | Konzeptuelle Komplexität | Neue Tabelle `fairness_deltas` |
| PDF/Excel-Import | Out of scope | Application-Layer, kein Schema-Eingriff nötig |
| Fragment-Clustering | Manuelle Zuordnung gewollt | Application-Layer |
| Top-3-Abweichungs-Treiber | Analytics-Feature | Materialisierte View über `card_monthly_states` + Vergleichsmonate |
| Partner-only-Karten | Sinnlos für Sparrate-Logik | UI-Lärm — keine technische Lücke |
| Cleanup-Edge-Function für Trash | Out of scope der DB-Migration | Supabase Edge Function `cleanup_deleted_entities` |
| Konfidenz-Verbesserung | Trigram reicht für V1 | Embeddings, Levenshtein, ML-Klassifikator |
| Kategorie-Vorhersage | Karten-Zuordnung reicht für V1 | Eigenes Modell pro User |
| Steuerklasse-Wechsel via UI | Aufwand vs. Nutzen | Settings-Bereich in V2, ändert `profiles.tax_class` |
| Manuelle Monats- oder Karten-Abschluss-Markierung | UX bewusst entschieden | — |

**Schema-Hinweis V1 — `card_monthly_states.closed_at`:** Das Feld existiert im Schema (siehe Migrations-Block 5), wird aber in V1 vom Frontend **nicht geschrieben** und nicht ausgelesen. Vergangene Monate sind durch das Verstreichen der Zeit + Modell α implizit abgeschlossen, ein expliziter Abschluss-Status auf Karten-Ebene ist in V1 nicht vorgesehen. Das Feld bleibt für eventuelle V2-Wiedereinführung reserviert. Claude Code soll das Feld in V1 ignorieren.

---

## 10. Was direkt anschließend zu tun ist

Drei Themen, die die Migration nicht abdeckt aber die als nächstes anstehen:

### 10.1 Cleanup-Edge-Function für `deleted_entities`

Pseudocode für die Edge Function (alle 30 Sekunden ausgeführt):

```typescript
// Pending Trash-Zeilen abarbeiten
const expired = await supabase
  .from('deleted_entities')
  .select('*')
  .lte('expires_at', new Date().toISOString())
  .is('restored_at', null);

for (const row of expired.data) {
  // Pending Operation ausführen je entity_type
  switch (row.entity_type) {
    case 'CARD_END':
      await supabase.from('cards')
        .update({ last_active_month: row.payload.new_last_active_month })
        .eq('id', row.entity_id);
      break;
    case 'CARD':
      await supabase.from('cards').delete().eq('id', row.entity_id);
      break;
    case 'CARD_FRAGMENT_LINK':
      await supabase.from('card_fragment_links').delete().eq('id', row.entity_id);
      break;
    case 'FRAGMENT':
      await supabase.from('fragments').delete().eq('id', row.entity_id);
      break;
  }
  // Trash-Zeile löschen
  await supabase.from('deleted_entities').delete().eq('id', row.id);
}
```

**Hinweis V1:** Nur die ENUM-Werte `CARD_END` und `CARD` werden vom Frontend tatsächlich genutzt. `CARD_FRAGMENT_LINK` und `FRAGMENT` bleiben für V2 reserviert (Eject und Fragment-Delete laufen in V1 direkt ohne Trash-Umweg).

### 10.2 Migration als versionierte Datei ablegen

Die 9 Blöcke in eine Datei packen, z.B. `supabase/migrations/0001_initial_schema.sql`. Damit kann das Schema jederzeit auf einer leeren DB reproduziert werden — z.B. für Test-Umgebungen oder neue Entwickler.

### 10.3 RPC-Wrapper im Frontend definieren

Die TypeScript-Typen aus dem Schema generieren:

```bash
supabase gen types typescript --project-id <id> > src/lib/supabase-types.ts
```

Damit bekommt das Frontend Typsicherheit für alle RPC-Aufrufe und Tabellen-Zugriffe.

---

## 11. Verbleibender Notiz-Zettel aus Phase 1

Eine offene Doku-Aufgabe (Phase 1, Frage 5):
Section 3.2 des ursprünglichen Design-Dokuments schreibt „Σ Planwerte aller Fixkosten (Ich-Anteil)" — bei Budget-Karten fehlt das „Ich-Anteil". In der Implementierung ist das korrekt behandelt (Budget-Karten sind nie GEMEINSAM, also implizit immer ICH-Anteil = 100 %). Diese Inkonsistenz ist im überarbeiteten Design-Dokument v2 behoben.

---

## Was du jetzt hast

Eine vollständig instrumentierte Datenbank für Antigravity Finance 1.0. Jede Sparrate ist deterministisch berechenbar aus eingefrorenen Quellen. Jede User-Aktion hat genau eine definierte DB-Operation. Jede Lösch-Operation hat einen Pfad, ein Limit und ein Rückgängig-Fenster. Snapshot-Integrität ist nicht eine Anwendungs-Regel — sie ist eine Schema-Eigenschaft.

Das ist die saubere Grundlage. Was du auf dieser Grundlage baust, kann nur so sauber sein wie das Datenmodell darunter — und das ist es.

---

*Architekt-Persona | Antigravity Finance 1.0 | April 2026*
