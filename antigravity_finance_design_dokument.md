# Antigravity Finance — Konsolidiertes Design-Dokument

**Version:** 3.1.9 (V2 · v2-12 Doku-Nachzug)
**Status:** Freigegeben — Schema-Doku v3.4; V2-Patches bis Sprint v2-07 eingespielt
**Datum:** 25. Juli 2026
**Primäres Referenzdokument für Claude Code**

> **Hinweis zu v2:** Diese Version wurde nach der Implementierung des Datenbank-Schemas überarbeitet. Sie ist konsistent mit `antigravity_finance_schema_summary.md`. Beide Dokumente zusammen bilden die vollständige Wissensbasis für die Frontend-Implementierung.
>
> **Changelog v3.1 (26.06.2026):** §9 „Sparraten-Treppe" → „Jahres-Welle + Popup (kumulierte Treppe)" — M3 ersetzt das V1-Treppen-Layout; §5 Ring interaktions-transparent; §6 Header-Subzeile mit reservierter Zeilenhöhe; neuer Token `--wave-opacity 0.80`; §12.8-Copy angepasst. Offen → Cluster 3: N4b (Ring-%-Subzeile), B3 (kumulativ-negativ-Rot im Popup).
>
> **Changelog v3.1.1 (26.06.2026, Sprint v2-01):** §8 Fragment-Stack Monats-Scope (N1); §7 Kartenname-Overflow (N3); §4.7/§13 Umkehr — Zuordnungs-Monat = Transaktions-Monat, Periodenabgrenzung (allocation≠transaction) nicht mehr verfolgt; manueller Cross-Monat-Drop entfällt.
>
> **Changelog v3.1.2 (04.07.2026, Block-1-Cluster-3):** §8 Rohmasse-Grundton vereinheitlicht (N5, Unterscheidung nur via Opacity/Badge); §5 %-Subzeile + Degenerations-Modus `Plan < 100 €` + neutraler Arc (N4b); §9-Popup kumulativ-negativ-Rot ab Null-Linie (B3). **Block 1 vollständig.**
>
> **Changelog v3.1.3 (06.07.2026, v2-02-Doku-Nachzug):** §9 Regime-Grenze inkl. laufendem Monat (teal bis einschließlich aktueller Monat, grau ab erstem Zukunftsmonat); NULL-Monate = 0 € auf Welle/Tooltip; Treiber-Slots zeigen „B2-Heuristik offen" bis B2.
>
> **Changelog v3.1.4 (24.07.2026):** §11 um Kurations-Leitfaden „Behandlung von Erstattungen" ergänzt (Beschluss Optionspapier Erstattungen, 24.07.2026).
>
> **Changelog v3.1.5 (24.07.2026):** §7 Karten-Lebenszyklus (Beenden/Löschen/Papierkorb ersetzt Verbergen, Sprint v2-05).
>
> **Changelog v3.1.6 (25.07.2026, Sprint v2-07):** §8 Übertrags-Schalter der Rohmasse (C1 — Standard „aus", Zähler am Schalter, erfasst beide `transfer_type`-Werte); §8 Backfill-Toast-Wortlaut ab 50 nachgepflegten IBANs (C2); §8 Monats-Scope server-seitig statt als JS-Nachfilter (P0-Bugfix, siehe `sprints/sprint_v2-07_review.md` §3); §11 Badge-Farbe karten-spezifisch über sechs deterministische Töne (A1 — schließt Sprint-8-OQ1); §3 sechs neue `--badge-hue-*`-Tokens.
>
> **Changelog v3.1.7 (05.08.2026, Sprint v2-10):** §7 Positionsregel für Overlays und Popups — immer mittig, einzige Ausnahme das Karten-Kontextmenü (`RM-4`); §8 Verweis auf dieselbe Regel für Recurrence-Popup und Direktklick-Overlay; §8 Fragment-Stack zeigt den Verwendungszweck statt des Empfängers, ausschließlich in der Anzeige (`RM-1`); §11 Feld-Tabelle nachgezogen — KI-Vorschlags-Badges seit v2-10 nicht mehr gerendert, Spezifikation bleibt für die Wiedereinschaltung stehen (`BF-1`).
>
> **Changelog v3.1.8 (05.08.2026, Sprint v2-11):** §11 Erstattungs-Leitfaden korrigiert — die Aggregation summiert **vorzeichenrichtig**, nicht „vorzeichen-agnostisch"; die Aussage, ein RPC-Eingriff sei nicht nötig, ist widerlegt und als Korrektur kenntlich gemacht (`BF-5`); §11 um das Verhalten bei überwiegenden Gutschriften ergänzt (Beschluss `E2`, keine Kappung bei 0).
>
> **Changelog v3.1.9 (05.08.2026, Sprint v2-12):** §5 N4b — der Degenerations-Modus verzweigte am Vorzeichen des **Plans** und unterstellte im Zweig „Plan fast 0 € (positiv)" ein positives Ist („+X € gespart"). Ersetzt durch **eine** Regel auf der Differenz, mit dritter Zeile `genau nach Plan` (Entscheidung `E3`); der Zusatz „Plan fast 0 €" entfällt ersatzlos (`BF-2`). §12.1 um die drei Copy-Zeilen des Degenerations-Modus ergänzt, die dort bisher fehlten.
>
> **Datei-Konvention (23.07.2026):** Stabiler Dateiname `antigravity_finance_design_dokument.md` — Version nur noch im Header/Changelog, Datei-Renames pro Patch-Level entfallen.

---

## Inhaltsverzeichnis

1. [Globale Design-Prinzipien](#1-globale-design-prinzipien)
2. [Architektur-Prinzipien](#2-architektur-prinzipien)
3. [Globale Farb- und Typographie-Tokens](#3-globale-farb--und-typographie-tokens)
4. [Sparrate — Zentrale Berechnungslogik](#4-sparrate--zentrale-berechnungslogik)
5. [Komponente: Singularity Ring](#5-komponente-singularity-ring)
6. [Komponente: Header / Timeline-Navigation](#6-komponente-header--timeline-navigation)
7. [Komponente: Karten (Fixkosten, Budget, Einnahmen)](#7-komponente-karten-fixkosten-budget-einnahmen)
8. [Komponente: Untere Interaktionszone](#8-komponente-untere-interaktionszone)
9. [Komponente: Jahres-Welle + Popup (kumulierte Treppe)](#9-komponente-jahres-welle--popup-kumulierte-treppe)
10. [Komponente: Income / Partner-Split](#10-komponente-income--partner-split)
11. [Komponente: CSV-Import / Drop & Distill](#11-komponente-csv-import--drop--distill)
12. [Bekannte Limitationen V1](#12-bekannte-limitationen-v1)
13. [Empfohlene Implementierungs-Reihenfolge](#13-empfohlene-implementierungs-reihenfolge)

---

## 1. Globale Design-Prinzipien

**Single Surface.** Ein Screen, ein Monat, eine primäre Zahl. Keine Tab-Navigation, keine separaten Screens.

**Apple-Ästhetik.** Ultra-light Typographie, minimale Farbe, maximale Reduktion. Glassmorphism nur wenn konsistent eingesetzt — kein Stil-Experiment.

**Farbe durch Tönung, nicht Lautstärke.** Rot und Grün sind nie gesättigt. Sie sind Hauch, nicht Ampel.

**Fragment = Realität, Tap = Absicht.** Fragmente repräsentieren tatsächliche Geldflüsse. Manuelle Taps repräsentieren Absichten. Beides ist gültig — aber semantisch verschieden.

**Lautlose Intelligenz.** KI-Verarbeitung passiert vollständig im Hintergrund. Keine Modals, keine Ladeindikatoren, keine Bestätigungsmeldungen.

**Web-App — keine Touch-Gesten.** Ausschließlich Klick-, Hover- und Drag-&-Drop-Interaktionen. Kein Swipe, kein Long-Press.

---

## 2. Architektur-Prinzipien

Diese Section definiert die fundamentalen Verhaltensweisen des Systems. Jede UX-Entscheidung in den Komponenten-Sections folgt diesen Prinzipien.

### 2.1 Snapshot-Integrität

**Kernprinzip:** Daten sind unveränderlich, Ereignisse nicht. Vergangene Monate sind eingefroren — eine spätere Änderung der Stammdaten verändert niemals einen abgeschlossenen Monat rückwirkend.

Dies wird auf fünf Ebenen technisch garantiert:

| Ebene | Mechanismus |
|---|---|
| **Gehaltsänderungen** | Append-only Zeitreihe `income_timeline`. Lookup nimmt neuesten Eintrag ≤ Monat M → vergangene Monate sehen weiterhin den damaligen Stand. |
| **Plan-Anpassungen einer Karte** | Append-only Zeitreihe `card_planned_timeline`. Forward-Inheritance ohne Modifikation alter Werte. |
| **Karten-Lebensdauer** | `last_active_month` setzt das Ende, ohne historische Monate zu beeinflussen. |
| **Fragmente** | Sind reale Geldflüsse — können in der Zeit nicht "verschoben" werden. Eject ist DELETE des Links, nicht des Fragments. |
| **Sparrate** | Niemals als Spalte gespeichert. Funktion `calculate_sparrate_for_month()` liest deterministisch aus den eingefrorenen Quellen. |

→ Eine Plan-Anpassung im April 2026 ändert niemals die Sparrate vom Februar 2026.

### 2.2 Forward-Inheritance

Zwei Stammdaten-Konzepte folgen dem gleichen zeitlichen Vererbungsmodell — Gehalt und Karten-Plan.

**Gehalt:** Eine Gehaltsänderung wird mit `effective_month` als neuer Eintrag in `income_timeline` gespeichert. Sie gilt **ab** diesem Monat vorwärts, bis ein neuer Eintrag eingebracht wird. Vergangene Monate sind eingefroren.

**Karten-Plan:** „Betrag anpassen, dauerhaft ab Monat X" erzeugt einen neuen Eintrag in `card_planned_timeline` mit `effective_month = X`. Vergangene Monate behalten ihren damaligen Plan.

**Beispiel — mehrfache Plan-Anpassungen:**

- April 2026: Karte „Strom" mit Plan 100 € (initial)
- Im Mai klickt User „dauerhaft anpassen → 110 €"
- Im August klickt User „dauerhaft anpassen → 120 €"

Resultierende `card_planned_timeline`:

| `effective_month` | `planned_amount` |
|---|---|
| 2026-04-01 | 100,00 € |
| 2026-05-01 | 110,00 € |
| 2026-08-01 | 120,00 € |

Lookup für Juni → 110 €. Lookup für September → 120 €. Lookup für April → 100 € (eingefroren).

**UX-Konsequenz:** Der User sieht in vergangenen Monaten weiterhin die damals gültigen Beträge — auch wenn der Plan inzwischen geändert wurde. Das ist die direkte Visualisierung der Snapshot-Integrität.

### 2.3 Modell α — Vergangenheits-Behandlung bei offenen Karten

**Definition:** Karten in vergangenen Monaten, die ohne Tap und ohne Fragment-Verknüpfung blieben, werden mit ihrem damaligen Plan-Wert gerechnet.

**Begründung:** Eine Miete wird im Zweifel überwiesen, auch wenn der User vergisst zu tappen — die Realität soll widergespiegelt werden, nicht der UX-Lapsus. Wenn der User wirklich nicht gezahlt hat, kann er die Karte über „Betrag anpassen, nur dieser Monat → 0 €" oder „Letzte Zahlung in Monat X" markieren.

**Konsequenz:** Es gibt keine explizite „Monat abschließen"-Aktion. Vergangene Monate sind durch das Verstreichen der Zeit + Modell α implizit abgeschlossen.

### 2.4 Soft-Delete-Pattern (Rückgängig-Toast)

Zwei destruktive Aktionen werden über einen Trash-Mechanismus gepuffert:

- **„Letzte Zahlung in Monat X"** (`CARD_END`) — setzt `cards.last_active_month`
- **Karte löschen** (`CARD`) — Hard-Delete einer nie genutzten Karte

**Mechanik:** Klick auf eine dieser Aktionen erzeugt einen Eintrag in `deleted_entities` mit `expires_at = now() + 60s`. Das Frontend zeigt 5 Sekunden lang einen Toast mit „Rückgängig"-Button. Server-seitig wartet ein Cleanup-Job den vollen Retention-Zeitraum ab, bevor die eigentliche Operation ausgeführt wird.

**Andere Aktionen ohne Toast:** Fragment-Eject und Fragment-Delete laufen direkt — kein Trash-Umweg, sofortige Wirkung. Der User kann ein gerade ejected Fragment per Drag & Drop sofort wieder zuordnen.

**Toast-UI — Visuelle Spezifikation:**

| Eigenschaft | Wert |
|---|---|
| Position | `fixed`, `bottom: 24px`, horizontal zentriert |
| Background | `rgba(28,28,30,.92)` mit `backdrop-filter: blur(20px)` |
| Border | `.5px solid rgba(255,255,255,.1)` |
| Border-Radius | `14px` |
| Padding | `12px 16px` |
| Min-Width | `260px` · Max-Width: `340px` |
| Eintritts-Animation | `translateY(+16px) → translateY(0)` + `opacity 0 → 1` · `280ms` · `cubic-bezier(.2,0,.1,1)` |
| Austritts-Animation | `opacity 1 → 0` · `200ms` · `ease` |

**Typographie:**
- Toast-Text: `13px`, `font-weight: 500`, `rgba(255,255,255,.85)`
- Subtext: `11px`, `rgba(255,255,255,.30)`
- „Rückgängig"-Button: `12px`, `font-weight: 600`, `#3ECFAF`

**Fortschrittsbalken:**
- Position: absolut, Unterkante des Toasts
- Höhe: `1.5px` · Farbe: `rgba(62,207,175,.35)`
- Läuft von 100% → 0% in 5 Sekunden (entspricht der UI-sichtbaren Wartezeit)
- Bei Klick auf „Rückgängig": springt auf 100%, Farbe wechselt auf `rgba(62,207,175,.6)` · Toast verschwindet nach 800ms

**Icon-Differenzierung (links im Toast):**
- `28×28px`, `border-radius: 8px`
- „Letzte Zahlung in Monat X": Gelbes Icon · `rgba(255,200,60,.1)` bg · `rgba(255,200,60,.2)` border
- „Karte löschen": Rotes Icon · `rgba(255,69,58,.1)` bg · `rgba(255,69,58,.2)` border

**„Rückgängig"-Interaktion:**
- Klick → Text wechselt sofort auf `Wiederhergestellt ✓` · Fortschrittsbalken springt auf 100% in Teal
- Toast verschwindet nach 800ms mit Fade-out

**Mehrere parallele Toasts:**
- Stacken vertikal — neuester Toast erscheint unten, ältere schieben sich nach oben
- Maximum 2 gleichzeitig sichtbar — bei drittem Toast wird der älteste verdrängt

**~~„Verbergen" (UI-Hide, V1 implementiert, Sprint 10)~~ — aufgehoben durch Sprint v2-05 (24.07.2026):** Das Verbergen ist ersatzlos entfallen; `deleted_at` ist seither ausschließlich der Papierkorb-Marker des Lösch-Flows (§7 Karten-Lebenszyklus). Historischer Stand: Neben den beiden destruktiven Aktionen (`CARD_END`, `CARD`) gab es eine nicht-destruktive Verberg-Geste. Sie setzt `cards.deleted_at` per RPC `toggle_card_hidden(p_card_id, p_hidden)` (idempotent; `true` → `deleted_at = now()`, `false` → `NULL`) und blendet die Karte sofort aus allen UI-Surfaces aus (`WHERE deleted_at IS NULL`). Ein 5-Sekunden-Toast unten Mitte bietet „Rückgängig"; nach Ablauf bleibt die Karte verborgen (V1: kein „Versteckte Karten verwalten"-Pfad — V2). Past-Month-Verbergen ist erlaubt (keine Sperre). **Snapshot-Integrität (§2.1):** `deleted_at` ist ein reiner UI-Concern — die Sparrate-RPCs (`calculate_sparrate_for_month`, `calculate_planned_sparrate_for_month`, `is_card_active_in_month`) ignorieren `deleted_at`, sodass eine spätere Verberg-Aktion keine historische Sparrate ändert. Verifiziert (Sprint 10): Karte „Netflix" verbergen lässt März 2026 = 2.910,01 € unverändert.


### 2.5 Modell 1 — Karten als Templates + Pro-Monat-State

**Konzept:** Eine Karte existiert als Template-Eintrag (ein Datensatz in `cards`) und hat über die Zeit hinweg eine konstante Identität (Name, Typ, Frequenz, Attribution). Der Zustand pro Monat (Tap-Status, einmalige Anpassung, Fragment-Verknüpfungen) wird **separat** in `card_monthly_states` und `card_fragment_links` gespeichert.

**UX-Konsequenzen:**

1. **Karten-Identität ist global, Karten-Zustand ist lokal.** Eine Karte „Miete" ist über Monate hinweg dieselbe Entität — sie kann nicht in zwei verschiedenen Monaten unterschiedliche Namen oder Frequenzen haben.
2. **„Letzte Zahlung in Monat X" ist eine Eigenschaft des Templates, nicht des Monats-States.** Setzt `last_active_month`, ändert keine Monats-States.
3. **„Betrag anpassen, dauerhaft" ist eine neue Plan-Zeitreihen-Zeile, kein Update am Template.** Macht keinen UPDATE auf `cards`, sondern INSERT auf `card_planned_timeline`.
4. **Karten-Lookup für „im Monat M aktive Karten"** ist ein zweistufiger Filter: erst Template-Filter (`first_active_month <= M <= last_active_month`), dann Frequenz-Check über `is_card_active_in_month()`.

### 2.6 Mapping UX ↔ DB — Begriffsbrücke

Diese Tabelle ist die **einzige** Stelle, an der UX-Begriffe (deutsch, in der Design-Doku) auf technische Identifier (englisch, in der Schema-Doku und im Code) abgebildet werden. Im Rest der Design-Doku wird ausschließlich UX-Sprache verwendet.

| UX-Begriff (Design-Doku) | DB-ENUM / Feld (Schema-Doku) |
|---|---|
| Fixkosten-Karte | `card_type = 'FIXED_COST'` |
| Budget-Karte | `card_type = 'BUDGET'` |
| Einnahmen-Karte | `card_type = 'INCOME'` |
| Karte gemeinsam | `card_attribution = 'GEMEINSAM'` |
| Karte allein (ICH) | `card_attribution = 'ICH'` |
| Frequenz monatlich | `card_frequency = 'MONTHLY'` |
| Frequenz quartalsweise | `card_frequency = 'QUARTERLY'` |
| Frequenz halbjährlich | `card_frequency = 'SEMIANNUAL'` |
| Frequenz jährlich | `card_frequency = 'ANNUAL'` |
| Frequenz einmalig | `card_frequency = 'ONCE'` |
| Karte bezahlt / erhalten / erledigt | `card_monthly_states.manually_paid = true` |
| Letzte Zahlung in Monat X | `cards.last_active_month = X` |
| Betrag anpassen (nur dieser Monat) | `card_monthly_states.adjusted_amount` |
| Betrag anpassen (dauerhaft) | INSERT in `card_planned_timeline` |
| Person ICH | `person_role = 'ICH'` |
| Person Partner | `person_role = 'PARTNER'` |
| Auto-absorbiertes Fragment | `card_fragment_links.origin = 'AUTO_ABSORBED'` |
| Manuell zugeordnetes Fragment | `card_fragment_links.origin = 'MANUAL_DROP'` |

### 2.7 Schema-Hinweise V1 — Nicht genutzte Felder

Folgendes Feld existiert im DB-Schema (siehe `antigravity_finance_schema_summary.md`), wird aber in V1 vom Frontend **nicht geschrieben** und nicht ausgelesen:

- **`card_monthly_states.closed_at`** — reserviert für eventuelle V2-Wiedereinführung eines manuellen Karten-Abschluss-Patterns. Vergangene Monate sind in V1 implizit durch Modell α abgeschlossen, eine explizite Markierung ist nicht vorgesehen.

Claude Code soll dieses Feld in V1 ignorieren.

---

## 3. Globale Farb- und Typographie-Tokens

### Farben

| Token | Wert | Verwendung |
|---|---|---|
| `--bg-primary` | `#0D0D0F` | App-Hintergrund |
| `--bg-card` | `#141416` | Karten-Hintergrund neutral |
| `--bg-card-open` | `#160D0D` | Karte offen / laufend |
| `--bg-card-paid` | `#0A140E` | Karte bezahlt / erhalten |
| `--bg-card-over` | `#160A08` | Budget überschritten |
| `--bg-card-ghost` | `#181818` | Ghost / Forecast |
| `--color-teal` | `#3ECFAF` | Positiv, bezahlt, Sparrate im Plan, Einnahmen |
| `--color-red` | `#FF453A` | Negativ, offen, Defizit |
| `--color-gold` | `rgba(255,200,60,.6)` | Vorjahres-Referenz, Ereignisse |
| `--color-blue-dot` | `rgba(100,168,240,.38)` | Gemeinsam-Attribution |
| `--text-primary` | `#ffffff` | Aktive Zustände |
| `--text-muted` | `rgba(255,255,255,.45)` | Offene Zustände |
| `--text-ghost` | `rgba(255,255,255,.22)` | Labels, Metadaten |
| `--border-subtle` | `rgba(255,255,255,.07)` | Standard-Border |
| `--border-teal` | `rgba(62,207,175,.22)` | Bezahlt-Border |
| `--border-red` | `rgba(255,69,58,.18)` | Offen-Border |
| `--wave-opacity` | `0.80` | Jahres-Welle (§9), festgelegter Produktionswert |
| `--fragment-hue` | gemeinsamer Grau-Grundton | Rohmasse-Fragmente §8 (N5) — Unterscheidung nur via Opacity/Badge |
| `--badge-hue-1` … `--badge-hue-6` | Gold `255,200,60` · Orange `255,150,90` · Oliv `170,200,110` · Blau `100,168,240` · Violett `170,130,255` · Magenta `240,120,190` | KI-Vorschlag-Badge §11 (A1) — der Kartenname wählt den Ton deterministisch; Deckkraft unverändert `.08` Fläche / `.5` Text / `.15` Rahmen. Türkis und Rot bewusst ausgespart (Statusfarben). |

### Typographie

| Element | Font-Size | Font-Weight | Letter-Spacing |
|---|---|---|---|
| Primärzahl (Ring) | `34px` | `200` | `-1.8px` |
| Aktiver Monat (Header) | `17px` | `600` | `-0.5px` |
| Kartenname | `13px` | `500` | `-0.2px` |
| Kartenbetrag | `22px` | `200` | `-1.2px` |
| Flanken-Monat | `13px` | `500` | `-0.2px` |
| Labels / Meta | `9–10px` | `500–600` | `0.6–1.1px` |
| Alle Zahlen | — | — | `font-variant-numeric: tabular-nums` |

---

## 4. Sparrate — Zentrale Berechnungslogik

Dies ist die kritischste Logik der gesamten App. Alle Komponenten leiten sich davon ab. Die Logik ist in der DB als deterministische Funktion `calculate_sparrate_for_month(user_id, month)` implementiert — das Frontend ruft sie per RPC auf, niemals als eigene Berechnung.

### 4.1 Begriffliche Trennung

Vier Begriffe sind eindeutig zu unterscheiden:

| Begriff | Bedeutung | Quelle |
|---|---|---|
| **Plan** | Der für eine Karte geplante Wert zu einem bestimmten Monat | `card_planned_timeline` (Forward-Inheritance) |
| **Anpassung** | Einmaliger Override „nur dieser Monat" für eine Karte | `card_monthly_states.adjusted_amount` |
| **Realität** | Summe der Fragment-Beträge, die der Karte in einem Monat zugeordnet sind | `card_fragment_links` + `fragments` |
| **Anzeige-Betrag** | Der auf der Karte sichtbare Betrag — berechnet durch die Sparrate-Logik aus den drei oberen Inputs | RPC `calculate_card_amount_for_month()` |

Wenn diese Doku im Folgenden „den Betrag" einer Karte erwähnt, meint sie immer den **Anzeige-Betrag**.

### 4.2 Hauptformel

```
Sparrate (Monat M) = Mein Netto (M)
                   + Σ Einnahmen-Karten (mein Anteil, mit Split bei GEMEINSAM)
                   − Σ Fixkosten-Karten (mein Anteil, mit Split bei GEMEINSAM)
                   − Σ Budget-Karten (immer 100 %, da nie GEMEINSAM)
```

**„Mein Netto"** setzt sich zusammen aus:

```
Mein Netto (M) = ich.netto aus income_timeline (M)
              + Σ Einnahmen-Karten (mit Split-Anwendung bei GEMEINSAM)
```

**Wichtig:** Das Netto der Partnerin fließt **nicht** in die Sparrate ein. Es beeinflusst die Sparrate ausschließlich indirekt über den Split-Faktor (siehe 4.5).

### 4.3 Berechnungstabellen pro Karten-Typ

Die Hauptformel oben aggregiert pro Karte einen Anzeige-Betrag. Wie sich dieser Betrag pro Karte ergibt, hängt vom Karten-Typ und vom Monats-Zustand ab. Alle drei Tabellen liefern **immer einen positiven Wert** — das Vorzeichen (Einnahme vs. Ausgabe) wird durch den Karten-Typ in der Hauptformel oben gehandhabt.

#### 4.3.1 Fixkosten-Karten

| Zustand | Anzeige-Betrag |
|---|---|
| Offen, kein Fragment, kein Tap | **Plan** (oder Anpassung falls gesetzt) |
| Manueller Tap, kein Fragment | **Plan** (oder Anpassung falls gesetzt) |
| Fragment verknüpft (mit oder ohne Tap) | **Realität** (Summe der Fragment-Beträge) |

Prioritätskette: **Realität → Anpassung → Plan**

#### 4.3.2 Einnahmen-Karten (analog Fixkosten)

| Zustand | Anzeige-Betrag |
|---|---|
| Erwartet, kein Fragment, kein Tap | **Plan** (oder Anpassung falls gesetzt) |
| Manueller Tap (Erhalten), kein Fragment | **Plan** (oder Anpassung falls gesetzt) |
| Fragment verknüpft (mit oder ohne Tap) | **Realität** (Summe der Fragment-Beträge) |

Prioritätskette: **Realität → Anpassung → Plan**

#### 4.3.3 Budget-Karten

| Zustand | Anzeige-Betrag |
|---|---|
| Offen, keine Fragmente, kein Tap | **Plan** (oder Anpassung falls gesetzt) |
| Fragmente ≤ Plan, kein Tap | **Plan** (Fragmente sind „im Budget" — Plan zählt) |
| Fragmente > Plan, egal ob Tap | **Realität** (Überschreitung zählt voll) |
| Manueller Tap + Fragmente ≤ Plan | **Realität** (tatsächlicher Wert) |
| Manueller Tap, keine Fragmente | **0 €** |

### 4.4 Verhalten in den drei Zeiträumen

Es gibt **eine** Funktion. Die drei Zeiträume unterscheiden sich automatisch durch die Daten-Inputs.

**Vergangenheit (Monat M < heute):** Karten-Status ist eingefroren — keine neuen Taps oder Fragment-Verknüpfungen entstehen mehr im normalen Betrieb (rückwirkende Fragment-Verknüpfungen via CSV-Import sind möglich, siehe 4.7). Karten ohne Tap und ohne Fragment werden mit Plan-Wert gerechnet — Modell α (siehe 2.3).

**Gegenwart (Monat M = heute):** Hybridsicht. Bisher Realisiertes (Fragmente, Taps) ersetzt den Plan, alles andere läuft mit Plan.

**Forecast (Monat M > heute):** Keine Fragmente, keine Taps. Alle aktiven Karten zählen mit ihrem dann gültigen Plan-Wert. Die Sparrate-Formel ist effektiv identisch zu „Geplante Sparrate".

### 4.5 Split-Anwendung

Der Split-Faktor wird zum Zeitpunkt M aus dem Brutto-Verhältnis berechnet:

```
Split-Faktor ICH (M) = ich.brutto (M) / (ich.brutto (M) + partner.brutto (M))
```

**Anwendungs-Modell:** Der Split wirkt auf den Anzeige-Betrag einer Karte **nach** der Auflösung der Berechnungstabelle. Das gilt unabhängig davon, ob der Anzeige-Betrag aus Plan, Anpassung oder Realität (Fragment-Summe) stammt.

**Konkretes Beispiel:** Miete 1.200 € (gemeinsam, Split 60/40 zu meinen Lasten).

- Ich überweise persönlich 1.200 € → Fragment +1.200 € → an Mietkarte gehängt
- Anzeige-Betrag der Karte = 1.200 € (Realität)
- Mein Anteil in der Sparrate = 60 % × 1.200 € = **720 €**

Der Split rechnet immer fair, unabhängig davon wer real überwiesen hat. Wer überweist, ist eine Konto-Frage — nicht eine Fairness-Frage.

**Edge-Case Partner unbekannt:** Split-Faktor = 1.0, ICH trägt alles allein. Sinnvoll für Single-Nutzer.

### 4.6 Rechenbeispiel — End-to-End

**Setup für März 2026:**
- ICH: Brutto 60.000 €, Netto 3.100 € / Monat
- PARTNER: Brutto 40.000 €, Netto 2.200 € / Monat
- Split-Faktor ICH: 60 %, PARTNER: 40 %

**Karten:**
- Miete 1.200 € (Fixkosten, GEMEINSAM, monatlich) — Fragment +1.200 € verknüpft
- Strom 120 € (Fixkosten, GEMEINSAM, monatlich) — Offen, kein Fragment, kein Tap
- Netflix 17,99 € (Fixkosten, ICH, monatlich) — manuell getappt
- Tanken 200 € (Budget, ICH, monatlich) — Fragmente in Höhe von 180 € verknüpft, manuell getappt
- Steuerrückzahlung 800 € (Einnahme, ICH, einmalig im März) — Fragment +800 € verknüpft

**Berechnung Sparrate für März 2026:**

```
Mein Netto:
  ich.netto                                = 3.100,00 €
  + Steuerrückzahlung (Realität, ICH 100%) =   800,00 €
  = 3.900,00 €

Fixkosten:
  Miete (Realität 1.200 € × Split 60%)     =   720,00 €
  Strom (Plan 120 € × Split 60%)           =    72,00 €
  Netflix (Plan, ICH 100%)                 =    17,99 €
  = 809,99 €

Budget:
Tanken (Tap + Fragmente, Realität, 100%) =   180,00 €

Sparrate = 3.900,00 − 809,99 − 180,00     = 2.910,01 €
```

### 4.7 Rückwirkende Fragment-Verknüpfungen

Beim CSV-Import können Fragmente mit `transaction_date` in vergangenen Monaten auftreten (z. B. späte Mietabrechnung im April mit Buchungsdatum 28. März).

**Verhalten:** Auto-Absorption und manueller Drop funktionieren auch für vergangene Monate. Die Sparrate des betroffenen Vergangenheitsmonats wird beim nächsten Render neu berechnet — die Plan-Werte und Gehälter bleiben eingefroren, nur die „Realität" wird präziser eingebracht.

Dies ist konsistent mit Snapshot-Integrität: Plan und Gehalt bleiben unangetastet, eine bessere Datenbasis ergibt automatisch eine bessere Berechnung.

**Zuordnungs-Monat = Transaktions-Monat (v2-01-Regel):** Ein Fragment wird ausschließlich einer Karte *seines eigenen* Transaktions-Monats zugeordnet — `card_fragment_links.month` = Monat von `transaction_date`. Die rückwirkende Verknüpfung oben betrifft daher die *Vergangenheit desselben Monats* (z. B. ein März-Fragment auf eine März-Karte, sichtbar im März-View), nicht eine monatsübergreifende Zuordnung. Ein Cross-Monat-Drop aus dem Stack eines anderen Monats existiert nicht (v2-01/N1). Bestehende Verknüpfungen mit `month ≠ transaction_date`-Monat (falls im Altbestand) bleiben als historische Fakten eingefroren — sie werden nicht retroaktiv umgezogen (§2.1).

---

## 5. Komponente: Singularity Ring

### Funktion

Herzstück des Dashboards. Zeigt die tatsächliche Sparrate im Zentrum. Der Arc zeigt den Füllstand zur geplanten Sparrate (siehe 4.4 Forecast-Definition).

### Visuelle Spezifikation

| Eigenschaft | Wert |
|---|---|
| Hintergrund | `#0D0D0F` |
| Ring-Radius | `98px` |
| Stroke-Width | `9px` |
| Stroke-Linecap | `round` |
| Track-Farbe | `rgba(255,255,255,.05)` |
| Positiver Arc | `#3ECFAF` |
| Negativer Arc | `#FF453A` |
| Dots (6 + 12 Uhr) | `rgba(255,255,255,.22)`, `r=3.5px` |
| Dot 6 Uhr (Nullpunkt) | `cx=124, cy=222` |
| Dot 12 Uhr (Plan) | `cx=124, cy=26` |
| Pointer-Events | **`none` — interaktions-transparent (M3, §9)** |

**Interaktions-Transparenz (M3):** Der Ring ist `pointer-events:none`. Das Welle-Scrubbing (§9) läuft durch ihn hindurch; Führungslinie + Tooltip der Welle rendern über dem Ring. Der Ring trägt weiterhin Ring-Zahl + den einen aktiven-Monat-Kreis — beide vom Header-aktiven Monat gesteuert, nicht von der Welle-Einfärbung.

### Zentrumszahl

| Eigenschaft | Wert |
|---|---|
| Font-Size | `34px` |
| Font-Weight | `200` |
| Letter-Spacing | `-1.8px` |
| Font-Variant | `tabular-nums` |

### Farblogik Zentrumszahl

| Bedingung | Farbe |
|---|---|
| `v < 0` | `#FF453A` |
| `0 ≤ v ≤ Plan` | `#ffffff` |
| `v > Plan` | `#3ECFAF` |

### Arc-Logik

**Positiver Arc (Teal):**
- Startpunkt: 6 Uhr (unten)
- Richtung: CCW durch 9 Uhr nach 12 Uhr
- CSS-Transform: `rotate(90deg)` mit `transform-box: fill-box; transform-origin: center`
- Formel: `fill = Math.min(pct × C/2, C − 0.5)`

**Negativer Arc (Rot):**
- Startpunkt: 6 Uhr (unten)
- Richtung: CW durch 3 Uhr nach 12 Uhr
- CSS-Transform: `scaleX(-1) rotate(90deg)` mit `transform-box: fill-box; transform-origin: center`
- Formel: `fill = Math.min(|pct| × C/2, C/2)`

### Grenzwert-Verhalten

| Szenario | Verhalten |
|---|---|
| Sparrate = 0 € | Kein Arc. Beide Dots sichtbar. |
| 0 € < Sparrate ≤ Plan | Teal-Arc wächst CCW bis 12 Uhr. |
| Sparrate > Plan | Arc wächst über 12 Uhr bis max. voller Kreis (200%). |
| Sparrate > 200% von Plan | Ring vollständig geschlossen. Zahl kommuniziert Rest. |
| Sparrate < 0 € | Roter Arc wächst CW bis max. 12 Uhr. |
| Sparrate = NULL (Onboarding offen) | Ring im Leer-Zustand, Zahl wird durch Onboarding-Hinweis ersetzt |

### %-Subzeile + Degenerations-Modus (N4b)

Die Subzeile unter der Ringzahl kommuniziert das Verhältnis zur geplanten Sparrate. Zwei Zustände plus Arc-Kopplung.

**a) Normalfall — Cap an den Arc gekoppelt.** Ab **> 200 %** zeigt die Subzeile „**> 200 % von Plan**" statt einer exakten Zahl — konsistent zum bereits bei 200 % geschlossenen Arc.

**b) Degenerations-Modus — Schwelle `Plan < 100 €` (inkl. jedem negativen Plan).** „% von Plan" wird bei einem Plan nahe/unter Null bedeutungslos bzw. irreführend (bei negativem Plan invertiert das Verhältnis). Die Prozent-Quote wird durch die **absolute EUR-Aussage** ersetzt — **Prozent wird hier nie gezeigt:**
**Eine Regel, unabhängig vom Vorzeichen des Plans (v2-12, `BF-2` + `E3`).** Held = IST in EUR (rot, wenn negativ). Die Subzeile nennt immer die **Differenz zum Plan**, die **Farbe folgt dem Differenz-Vorzeichen**, nicht dem absoluten IST:

| Fall | Subzeile | Farbe |
|---|---|---|
| besser als geplant | `+X € über Plan` | Türkis |
| schlechter als geplant | `−X € unter Plan` | Rot |
| genau auf Plan | `genau nach Plan` | Neutral (`muted`) |

- Plan −500 €, IST −400 € → Held „−400 €" (rot) · „+100 € über Plan" (teal — besser als geplanter Deficit).
- Plan −500 €, IST −700 € → Held „−700 €" (rot) · „−200 € unter Plan" (rot — schlechter).
- Plan 55 €, IST −323 € → Held „−323 €" (rot) · „−378 € unter Plan" (rot).

**„genau nach Plan" gilt ab einer Abweichung unter 0,50 €** — also der Anzeige-Schwelle, nicht bei exakt null. Die EUR-Anzeige rundet auf ganze Euro; eine Abweichung von 0,30 € stünde sonst als „+0 € über Plan" da, genau der Text, den `E3` abschaffen sollte.

> **Was hier bis v2-12 stand — und warum es falsch war.** Die Spezifikation kannte zwei Zweige, getrennt nach dem **Vorzeichen des Plans**. Der Zweig für einen kleinen *positiven* Plan lautete „Plan fast 0 € — **+X € gespart**" und unterstellte damit ein positives Ist. Juli 2026 (Plan 55,44 €, Ist negativ) fiel genau dort hinein: „−1.223 € gespart". Man spart keine minus 1.223 €.
>
> Aufgefallen ist es erst nach einem Jahr, weil die Kombination *kleiner positiver Plan + negatives Ist* bis zur Juli-Kuratierung **nicht erreichbar** war — Ist und Plan waren in jedem Monat identisch. Der Zusatz „Plan fast 0 €" entfällt ersatzlos: Er war ohnehin ungenau (55 € sind nicht fast 0), und die Euro-Aussage erklärt sich selbst.
>
> Die Regel liegt seit v2-12 in einer eigenen, reinen Datei (`singularity-ring/ring-subline.ts`) und wird von `tests/e2e/ring-subline.spec.ts` gegen die echte Quelle geprüft — nach dem Vorbild von `welle/draw.ts`. Sie war vorher im Bauteil eingebettet und damit nicht einzeln prüfbar; das ist der zweite Grund, warum der Fehler so lange überlebt hat.

**c) Neutraler Arc im Degenerations-Modus.** Da der Arc `IST/Plan` rechnet, wäre er bei winzigem/negativem Plan ebenso invertiert. Er **entkoppelt sich von der Quote → nur die Spur (Track), keine Füllung.** Der Ring wird zum Rahmen für die ehrliche EUR-Aussage, statt eine Quote vorzutäuschen.

### Datenbasis

Der Ring zeigt eine einzige Sparrate — den Wert von `calculate_sparrate_for_month(user_id, aktuell angezeigter Monat)`. Der Arc visualisiert das Verhältnis zur „geplanten Sparrate" des aktuellen Monats (Forecast-Definition aus 4.4: alle Karten mit Plan-Wert, kein Tap, kein Fragment).

Der Ring hat **keinen Slider und keine manuelle Eingabe** im finalen Dashboard.

### Was explizit NICHT
- Kein Glow-Effekt
- Kein Apple-Watch-Doppelring für Overflow
- Kein Prozentwert in der Arc-Geometrie
- Kein Slider im finalen Dashboard

---

## 6. Komponente: Header / Timeline-Navigation

### Funktion

Navigationsanker für die Zeitachse. Zeigt den aktiven Monat zentral, Vormonat links, Folgemonat rechts.

### Visuelle Spezifikation

**Aktiver Monat (Zentrum):**
- Font: `17px`, `font-weight: 600`, `letter-spacing: -0.5px`, `#ffffff`

**Status-Pill unter Monatsname:**

| Zustand | Label | Farbe |
|---|---|---|
| Laufender Monat | `Laufend` | `rgba(255,255,255,.35)` auf `rgba(255,255,255,.06)` |
| Abgeschlossener Monat | `Abgeschlossen` | `rgba(62,207,175,.6)` auf `rgba(62,207,175,.08)` |
| Zukünftiger Monat | `Forecast` | `rgba(255,255,255,.15)` auf `rgba(255,255,255,.03)` |

**Hinweis:** „Abgeschlossen" für vergangene Monate folgt aus dem Verstreichen der Zeit + Modell α — keine explizite Zustandsänderung im Datenmodell. Der Zustand wird im Frontend aus dem Vergleich von angezeigtem Monat zum aktuellen Datum abgeleitet.

**Flanken:**
- Font: `13px`, `font-weight: 500`, `rgba(255,255,255,.38)`
- Opacity Default: `0.85` · Disabled: `0.2`
- Subzeile: `10.5px`, `rgba(255,255,255,.18)`

**Chevrons:**
- `26×26px`, `border-radius: 50%`
- Default: `opacity: 0` (unsichtbar)
- Hover: `opacity: 1`, Background: `rgba(255,255,255,.07)`

**Trennlinie:** `0.5px solid rgba(255,255,255,.06)`

### Interaktionslogik

| Aktion | Verhalten |
|---|---|
| Klick linke Flanke | Navigation zum Vormonat |
| Klick rechte Flanke | Navigation zum Folgemonat |
| Kein Vormonat | Linke Flanke `opacity: 0.2`, `pointer-events: none` |

**Übergangsanimation:** Direktional, `±20px` X-Versatz, `opacity .22s, transform .22s`

### Subzeilen-Logik

**Linke Flanke (Vergangenheit):**
- `Alles erledigt` wenn alle Fragmente zugeordnet
- `X Fragmente offen` wenn unzugeordnete Fragmente existieren (Query: COUNT auf `fragments_with_status WHERE status='UNASSIGNED'` für den Vormonat)

**Rechte Flanke (Zukunft):**
- `Kein Ausreißer` wenn keine besonderen Ausgaben
- `[Bezeichnung] [Betrag]` z.B. `Autoversicherung 650 €`
- **Definition Ausreißer:** TBD im Architekten-Chat (V1: Karte mit Frequenz nicht-monatlich und Plan > 200 € — funktional ableitbar, aber Schwellwert ist tunbar)

**Kein Layout-Sprung (M3):** Die Ausreißer-Subzeile erscheint nur im betroffenen Monat, ihre Zeilenhöhe ist permanent reserviert (`min-height`). Beim Monatswechsel schaltet ausschließlich die Sichtbarkeit (`opacity`), nie die Höhe — die Komposition aus Ring + Welle bleibt sprungfrei.

### Was explizit NICHT
- Keine „Gestern/Morgen"-Labels
- Kein Sprung zum nächsten Event-Monat
- Keine sichtbaren Chevrons im Default-Zustand

---

## 7. Komponente: Karten (Fixkosten, Budget, Einnahmen)

### Gemeinsame Basis (alle Karten-Typen)

| Eigenschaft | Wert |
|---|---|
| Breite | `136px` |
| Kartenname-Overflow | Eine Zeile, abgeschnitten mit Ellipsis (`…`) innerhalb der 136px-Breite (Pattern wie Fragment-Beschreibung §8) |
| Border-Radius | `14px` |
| Padding | `14px 13px 12px` |
| Opacity (aktiv) | `0.75` |
| Opacity (Ghost) | `0.65` |
| Hover Opacity | `0.95` |
| Hover Transform | `translateY(-2px)` |
| Active Transform | `scale(0.97)` |

**Karussell-Sortierung:** Fixkosten-Karten zuerst, dann Einnahmen-Karten, dann Budget-Karten. Ein gemeinsames Karussell, keine getrennten Reihen.

**Attribution (Meta-Zeile):**
- Dot ICH: `rgba(255,255,255,.22)`
- Dot GEMEINSAM: `rgba(100,168,240,.38)`
- Meta-Text: `rgba(255,255,255,.20)`

### Fixkosten-Karte — 3 Zustände

**Offen:**
- Background: `#160D0D` · Border: `rgba(255,69,58,.18)`
- Kartenname + Betrag: `rgba(255,255,255,.45)`
- Status: `Offen` · Icon: Roter Kreis
- Interaktion: Tap → Bezahlt

**Bezahlt:**
- Background: `#0A140E` · Border: `rgba(62,207,175,.22)`
- Kartenname + Betrag: `#ffffff`
- Status: `Bezahlt` · Icon: Teal-Checkmark
- Interaktion: Tap → Offen (Rückgängig)
- Hinweis: Kein visueller Unterschied zwischen manuell bezahlt und Fragment-verifiziert

**Ghost (Forecast):**
- Background: `#181818` · Border: `rgba(255,255,255,.10)` · Opacity: `0.65`
- Kartenname: `rgba(255,255,255,.35)` · Betrag: `rgba(255,255,255,.32)`
- Status: `Forecast` · Cursor: `default`
- Interaktion: Keine — Ghost Cards sind nicht interaktiv
- Border-Stil: Solid, KEINE gestrichelte Border

### Budget-Karte — 4 Zustände

Zusätzlich zu den Fixkosten-Eigenschaften: Fortschrittsbalken (`3px`) an Unterkante + Restbudget-Anzeige + Padding-Bottom `18px`.

**Wichtig:** Budget-Karten sind **immer** Karte allein (ICH) — niemals gemeinsam. Eine GEMEINSAM-Attribution ist datenbankseitig durch Constraint ausgeschlossen.

**Laufend:**
- Background: `#160D0D` · Border: `rgba(255,69,58,.18)`
- Kartenname + Betrag: `rgba(255,255,255,.45)`
- Status: `Laufend` · Restbudget: `Noch X € frei` in `rgba(62,207,175,.40)`
- Balken: `rgba(62,207,175,.45)` · Breite = verbrauchter %
- Interaktion: Tap → Abgeschlossen

**Überschritten:**
- Background: `#160A08` · Border: `rgba(255,69,58,.35)`
- Kartenname: `#ffffff` · Betrag: `#FF453A`
- Status: `Überschritten` · Restbudget: `X € über Plan` in `rgba(255,69,58,.65)`
- Balken: `#FF453A` · Breite = 100%
- Interaktion: Tap → Abgeschlossen

**Abgeschlossen** *(neu seit Sprint 7, 21.05.2026)*:
- Background: `#0A140E` · Border: `rgba(62,207,175,.22)` (analog FIXED_COST-Bezahlt)
- Kartenname + Betrag: `#ffffff`
- Status-Label: `Abgeschlossen` · `rgba(62,207,175,.55)`
- Icon: Teal-Checkmark `rgba(62,207,175,.85)` auf `rgba(62,207,175,.1)` bg, Border `rgba(62,207,175,.28)`
- Balken **bleibt sichtbar**, Farbe + Breite je nach Sub-Variante:
  - `fragment_sum < effective_plan`: Balken teal `rgba(62,207,175,.45)`, Breite = verbrauchter %
  - `fragment_sum > effective_plan`: Balken rot `#FF453A`, Breite 100%
  - `fragment_sum = effective_plan`: Balken teal, Breite 100%
- Restbudget-Text (`diff = effective_plan − fragment_sum`, X = `|diff|`):
  - `diff > 0` → `X € nicht verbraucht` in teal `rgba(62,207,175,.55)`
  - `diff < 0` → `X € über Plan` in rot `rgba(255,69,58,.65)` (Icon bleibt teal — User hat Überschreitung akzeptiert)
  - `diff = 0` → kein Sub-Text (nur Status-Label sichtbar)
- Interaktion: Tap → zurück zu Laufend / Überschritten je nach `fragment_sum` vs. `effective_plan`

**Ghost (Forecast):**
- Identisch zu Fixkosten-Ghost-Variante
- Tap nicht möglich (Ghost ist nicht interaktiv, §7 Konflikt 3)

**Interaktions-Matrix BUDGET-Tap:**

| Vor-Tap | Nach-Tap | Berechnungs-Wert (§4.3.3) |
|---|---|---|
| Laufend (`fragment_sum ≤ plan`) | Abgeschlossen | `fragment_sum` (auch `0`, wenn keine Fragmente) |
| Überschritten (`fragment_sum > plan`) | Abgeschlossen | `fragment_sum` (Realität) |
| Abgeschlossen (`manually_paid=true`) | Laufend / Überschritten | Plan oder Realität, je nach Fragment-Lage |
| Ghost | (nicht tappable) | — |

### Einnahmen-Karte — 2 Zustände

Funktional analog zu Fixkosten-Karten — zwei Zustände statt drei (kein Pendant zu „Überschritten", weil ein höherer Eingang als geplant nichts Schlechtes ist und einfach voll in die Sparrate zählt).

**Designprinzip:** Gespiegelte Farblogik zur Fixkosten-Karte. Wo Fixkosten Rot-Tönung zeigen (ausstehende Ausgabe), zeigt Einnahmen Teal-Tönung (erwartete Einnahme = positiv). Der Icon-Typ unterscheidet sich ebenfalls: offener Kreis (wartend/erwartend) statt gefüllter Kreis (Problem/ausstehend).

**Erwartet:**
- Background: `#0D1A16` · Border: `rgba(62,207,175,.18)`
- Kartentyp-Label: `rgba(62,207,175,.45)`
- Icon: Offener Teal-Kreis (`rgba(62,207,175,.7)`, kein Fill) auf `rgba(62,207,175,.1)` bg, Border `rgba(62,207,175,.25)`
- Kartenname + Betrag: `rgba(255,255,255,.45)` (gedimmt — noch nicht erhalten)
- Status-Label: `Erwartet` · `rgba(62,207,175,.45)`
- Attribution (Meta-Zeile): Dot ICH `rgba(255,255,255,.22)` · Dot GEMEINSAM `rgba(100,168,240,.38)`
- Interaktion: Tap → Erhalten

**Erhalten:**
- Background: `#0A140E` · Border: `rgba(62,207,175,.22)`
- Kartentyp-Label: `rgba(62,207,175,.45)`
- Icon: Teal-Checkmark `rgba(62,207,175,.85)` auf `rgba(62,207,175,.1)` bg, Border `rgba(62,207,175,.28)`
- Kartenname + Betrag: `#ffffff`
- Status-Label: `Erhalten` · `rgba(62,207,175,.55)`
- Interaktion: Tap → Erwartet (Rückgängig)
- Hinweis: Kein visueller Unterschied zwischen manuell erhalten und Fragment-verifiziert

**Ghost (Forecast):**
- Identisch zu Fixkosten-Ghost-Variante

### Kontextmenü (⋯-Icon)

Erscheint bei Hover oben links — Default: unsichtbar.

**Position (v2-10, RM-4):** Overlays und Popups erscheinen immer mittig im Bild, an
derselben Stelle; sie unterscheiden sich in der Größe, nie im Ort. **Kontextmenüs**
sind davon ausgenommen — sie erscheinen am auslösenden Element, weil sie sonst ihren
Bezug verlieren. Konkret: Von den sieben Overlays und Popups der App ist
ausschließlich das Karten-Kontextmenü hier (`cards/card-interactive.tsx`) am
auslösenden ⋯-Icon verankert; die übrigen sechs — darunter „Betrag anpassen" und
„Karte beenden…" weiter unten in diesem Abschnitt — zeichnen zentriert per
React-Portal an `document.body`. Der Rückgängig-Toast ist **kein** Overlay in diesem
Sinne: er behält seine eigene, in §2.4 spezifizierte Position unten Mitte.

| Karten-Typ | Optionen |
|---|---|
| Fixkosten / Einnahmen / Budget | `Betrag anpassen` / `Letzte Zahlung in Monat X` |
| Karte nie genutzt (kein State, keine Fragmente) | zusätzlich `Karte löschen` (Hard-Delete) |

**„Betrag anpassen":** Overlay mit zwei Optionen
- **Nur dieser Monat** → UPSERT `card_monthly_states.adjusted_amount` (einmalig, vergangene/zukünftige Monate unberührt)
- **Dauerhaft ab diesem Monat** → INSERT in `card_planned_timeline` mit `effective_month = aktuell angezeigter Monat` (Forward-Inheritance, vergangene Monate eingefroren)

**„Letzte Zahlung in Monat X":** UX-Bezeichnung für das Soft-End einer Karte.
- Setzt `cards.last_active_month = X` (inklusiv — Monat X selbst ist noch enthalten, X+1 nicht mehr)
- Triggert 5-Sekunden-Toast mit „Rückgängig" — siehe 2.4
- Wirkung im Beispiel: Karte „Auto-Versicherung 650 €", Frequenz `Jährlich`, Letzte Zahlung Oktober 2026 → erscheint Oktober 2026, danach nicht mehr

**„Karte löschen" (Hard-Delete):** Präzisiert durch v2-05: nur bei grünem Lösch-Gate (keine Links, keine Monats-States, kein Vergangenheits-Plan — Grund-Codes `HAS_LINKS`/`HAS_STATES`/`HAS_PAST_PLAN`), über den §2.4-Papierkorb mit 5-Sekunden-Toast „Rückgängig"; Details im Absatz „Karten-Lebenszyklus" unten.

**~~„Verbergen" (Sprint 10, UI-Hide via `deleted_at`)~~ — aufgehoben durch v2-05:** Der Menüpunkt ist entfallen (siehe „Karten-Lebenszyklus" unten). Die Sprint-10-Konsolidierungs-Entscheidung (ein Single-Menu oben links statt separater Menüs, §12.4) gilt weiter für die Lebenszyklus-Verben.

**Ghost-/Forecast-Karten (Sprint 10, angepasst v2-05):** Karten im Ghost-/Forecast-Zustand (alle Zukunfts-Karten; vergangene BUDGET-Karten ohne Tap und ohne Fragmente) zeigen ein reduziertes Kontextmenü mit **nur** den Lebenszyklus-Verben („Karte beenden…"/„Ende aufheben"/„Karte löschen"; kein Tap-Catcher, kein „Betrag anpassen"). So bleibt die Affordance auf jeder Karte verfügbar, ohne Ghost-Karten sonst interaktiv zu machen.

**Karten-Lebenszyklus im Kontextmenü (v2-05, Beschluss 24.07.2026 — Interim-UI bis DD-Feinschliff M2):**
Der Menüpunkt „Verbergen" ist ersatzlos entfallen. Stattdessen: „Karte beenden…"
(Monatswahl, Default = angezeigter Monat; setzt last_active_month, Vergangenheit
bleibt unberührt; ONCE-Karten haben den Eintrag nicht), „Ende aufheben" (nur bei
gesetztem Ende) und „Karte löschen" (nur bei grünem Lösch-Gate: keine Links,
keine Monats-States, kein Vergangenheits-Plan — sonst ausgegraut mit
Klartext-Grund und Verweis auf »Karte beenden…«). Löschen läuft über den
§2.4-Papierkorb (5-s-Undo-Toast, 60-s-Server-Retention, danach endgültig).
Im Verknüpfte-Fragmente-Overlay zusätzlich „Alle Verknüpfungen lösen…"
(2-Schritt-Bestätigung, wirkt über ALLE Monate; Fragmente fallen verlustfrei
in die Rohmasse zurück).


### Karten-Frequenzen

Fünf Frequenzen verfügbar (siehe Mapping in 2.6):

| UX-Bezeichnung | Verhalten |
|---|---|
| Monatlich | Karte erscheint in jedem Monat ab `first_active_month` |
| Quartalsweise | Karte erscheint alle 3 Monate |
| Halbjährlich | Karte erscheint alle 6 Monate |
| Jährlich | Karte erscheint alle 12 Monate |
| Einmalig | Karte erscheint **nur in einem einzigen Monat** (`first_active_month = last_active_month`). Wird **nicht** in Folgemonaten angezeigt. |

### Zustandskonflikte (gelöst)

**Konflikt 1 — Betrag-Abweichung beim Fragment-Drop:**
Fragment-Betrag ≠ Plan → dezente Subzeile: `Betrag weicht vom Plan ab — anpassen?` → öffnet Overlay mit Forward-Inheritance-Option. Eject → Karte springt zurück auf Plan-Wert.

**Konflikt 2 — Mehrere Fragmente auf Fixkosten-Karte (1:n):**
Anzeige-Betrag = Summe aller Fragmente. Karte wird grün ausschließlich durch manuellen Tap. Detail-Overlay zeigt Liste aller Fragmente mit `×`-Icon zum Eject.

**Konflikt 3 — Vorauszahlung (V1-Limitation):**
Ghost Cards sind nicht interaktiv — kein Fragment-Drop aus anderen Monaten. Workaround: „Betrag anpassen auf 0 €, nur diesen Monat". Periodenabgrenzung wird **nicht** verfolgt (v2-01-Regel: Zuordnungs-Monat = Transaktions-Monat).

**Konflikt 4 — Fragment-Drop auf eine Karte in einem vergangenen Monat:**
Fragment wird akzeptiert. Sparrate des Vergangenheitsmonats wird beim nächsten Render neu berechnet (Plan und Gehalt bleiben eingefroren, Realität wird präziser eingebracht — siehe 4.7).

**Konflikt 5 — „Betrag anpassen" + abweichendes Fragment:**
Realität (Fragment) gewinnt immer. Prioritätskette: **Realität → Anpassung → Plan**.

**Konflikt 6 — Manuell bezahlt + Eject:**
`manually_paid` und `card_fragment_links` sind unabhängig. Eject entfernt nur den Link — `manually_paid` bleibt erhalten. Karte bleibt Bezahlt.
INCOME-Spezialregel: Ist `hasFragment === true`, wird der Tap-Catcher nicht gerendert und der Cursor bleibt `default`. `manually_paid` wird in diesem Fall nicht über die UI geschrieben.
---

## 8. Komponente: Untere Interaktionszone

### Struktur

Drei Zonen nebeneinander: **Portal (links) · Karussell (Mitte) · Fragment-Stack (rechts)**

### Portal (Links)

- Klick öffnet File-Picker
- Drag & Drop CSV auf Zone
- KI-Verarbeitung: vollständig lautlos im Hintergrund
- Fünf Zustände: Default / Drag-Over / Verarbeitung / Erfolg / Fehler
- Erfolg: 1.5 Sek sichtbar → Auto-Reset
- Fehler: 4 Sek sichtbar → Auto-Reset

**Fehlertexte:**
- Unbekanntes Format: `Format nicht erkannt — bitte CSV verwenden`
- Leere Datei: `Keine Transaktionen — Datei enthält keine Einträge`
- Korrupte Datei: `Datei fehlerhaft — Datei konnte nicht gelesen werden`

**Backfill-Report-Toast (Sprint 9):** Nach einem CSV-Import erscheint direkt unter dem Portal (Drop-Zone) eine kurze Quittung, sofern mindestens einer der Counter `iban_backfilled_count`, `internal_transfers_count`, `links_removed_for_transfers_count` > 0 ist. Der Toast zeigt nur die Counter > 0, je eine Kurzzeile (`N Fragmente mit IBAN ergänzt` / `M Bewegungen als Transfer erkannt` / `K Karten-Zuordnungen gelöst`), ist 4 s sichtbar (Fade-In/Fade-Out) und nicht interaktiv. Bei sukzessivem Re-Import zeigt jeder Toast nur die Counter des aktuellen Imports, nicht kumulativ.

**Wortlaut bei hohem Zähler (v2-07, C2):** Erreicht oder überschreitet `iban_backfilled_count` den Wert **50**, lautet die Zeile `Bestehende Fragmente nachgepflegt` — ohne Zahl. Darunter bleibt sie unverändert `N Fragmente mit IBAN ergänzt`. Grund: ein Re-Import über den Gesamtbestand meldet sonst Zeilen wie „544 Fragmente mit IBAN ergänzt" — fachlich korrekt, in der Wirkung aber ein Großereignis, während lediglich ein berechnungs-irrelevantes Feld nachgetragen wurde. Die Regel gilt **nur** für die IBAN-Zeile; die drei übrigen Zeilen behalten Wortlaut und Zahl, weil dort die Zahl inhaltlich relevant ist. Die Schwelle ist reine Anzeige-Sprache ohne DB-Gegenstück und steht daher bewusst **nicht** in `app_config`.

### Karussell (Mitte)

- Sortierung: Fixkosten → Einnahmen → Budget
- Navigation via Chevron-Klick
- Leerer Slot am Ende als Einstiegspunkt für neue Karten

**Leerer Slot — Weg 1 (Fragment-Drop):**
→ Recurrence-Popup: Beschreibung + Betrag + Datum (vorausgefüllt) + Karten-Typ-Auswahl + Frequenz (Monatlich / Quartalsweise / Halbjährlich / Jährlich / Einmalig) + Attribution (ICH / GEMEINSAM, falls Fixkosten oder Einnahme) + Abbrechen-Button

**Leerer Slot — Weg 2 (Direktklick):**
→ Overlay: Name + Betrag + Karten-Typ + Frequenz + Attribution. Gilt ab dem aktuell angezeigten Monat.

**Position (v2-10, RM-4):** Das Recurrence-Popup (Weg 1) und das Overlay aus Weg 2
(Direktklick) folgen derselben Regel wie alle Overlays und Popups der App (§7,
Abschnitt „Kontextmenü (⋯-Icon)"): sie öffnen zentriert, unabhängig davon, an welcher
Position der „Leerer Slot" im Karussell steht, von dem aus sie ausgelöst wurden.
Keines der beiden ist eine Ausnahme — die einzige Ausnahme in der App ist das
Karten-Kontextmenü.

**Wichtig zur Frequenz „Einmalig":** Nach Bestätigung erzeugt sich die Karte mit `first_active_month = last_active_month = aktuell angezeigter Monat`. Sie verschwindet in Folgemonaten — kein UI-Lärm, keine Anzeige in zukünftigen Monaten.

### Fragment-Stack (Rechts)

- Vertikales Scrollen, Mausrad / Scrollbar (`3px`, dezent)
- Keine Chevrons
- Fragmente sind Drag-Quellen
- **Monats-Scope (v2-01, N1):** Der Stack zeigt ausschließlich Fragmente, deren `transaction_date` im aktuell angezeigten Monat liegt. Ein Fragment mit `transaction_date` in einem anderen Monat erscheint im Stack *jenes* Monats, nicht im aktuell angezeigten. Ein vergangenes Fragment, das einer Karte seines Monats zugeordnet ist, erscheint als *verknüpftes Fragment auf der Karte* (Kontextmenü „Verknüpfte Fragmente"), nicht erneut im Stack. Die Sparrate-Berechnung ist unberührt (sie liest `card_fragment_links`, nicht den Stack). **Folge:** Der manuelle Cross-Monat-Drop aus dem Stack entfällt — konsistent mit der Regel Zuordnungs-Monat = Transaktions-Monat (§4.7). **Umsetzungs-Nachtrag (v2-07, P0):** Der Monats-Scope wird seit v2-07 **server-seitig** abgefragt statt nachträglich in der Anwendung gefiltert. Bis dahin holte die App alle Fragmente aller Monate und filterte anschließend — was ab einem Gesamtbestand von 1000 Fragmenten stillschweigend abschnitt (Befund und Messung: `sprints/sprint_v2-07_review.md` §3). Zusätzlich zum Monats-Scope läuft eine zweite, link-orientierte Abfrage (`assigned_month` = angezeigter Monat), damit ein Fragment aus einem anderen Monat weiterhin als *verknüpftes Fragment auf der Karte* erscheint. An der sichtbaren Regel ändert sich nichts.
- Zugeordnete Fragmente: `opacity: 0.22`, `pointer-events: none`
- Eject → Fragment kehrt in Stack zurück, wird wieder aktiv (sofortige Wirkung, kein Toast)

- **Angezeigte Beschreibung (v2-10, RM-1):** Die Fragment-Karte zeigt **den letzten durch `|` getrennten Teil** der gespeicherten Beschreibung; ist dieser leer, fällt sie auf den **ersten** Teil zurück. Damit steht der Verwendungszweck vorn statt des Empfängers, ohne dass die Anzeige die Herkunft des Fragments kennen muss: DKB Visa liefert ein Feld ohne Trennzeichen (unverändert), DKB Giro `Empfänger | Zweck`, Cortal `Sender | Buchungstext | Zweck`. **Ausschließlich Anzeige.** Der gespeicherte Text bleibt unverändert — er ist Bestandteil des Duplikat-Hashes, des Trigram-Index der Zuordnung und des Beschreibungs-Tiebreakers der Sortierung unten. Das `title`-Attribut trägt weiterhin den **vollständigen** Text; das Abschneiden mit „…" bleibt reines CSS (`text-overflow: ellipsis`).
- **Sortierung:** Unzugeordnete Fragmente zuerst, dann zugeordnete (gedimmt). Innerhalb beider Gruppen: `transaction_date ASC`, Tiebreaker `imported_at ASC`, finaler Tiebreaker Beschreibung alphabetisch aufsteigend (`description ASC`, de-DE). Der Beschreibungs-Tiebreaker ist nötig, weil Same-Day-Buchungen aus derselben Import-Charge identisches `imported_at` haben (PM-Entscheidung 22.05.2026).
- **Status `INTERNAL_TRANSFER` (Sprint 9):** Ein Fragment mit Status `INTERNAL_TRANSFER` rendert gedimmt (Opacity 0.45 — heller als ein zugeordnetes Fragment) mit einem Badge „TRANSFER" in neutralem Grau-Soft (bewusst nicht das Yellow-Soft des KI-Vorschlag-Badges, damit visuell unterscheidbar). Das Fragment hat **kein** Tap-/Drag-Verhalten (Cursor `default`, `pointer-events: none`). Dieser Status schlägt alle anderen Stati in der Darstellung. In der Stack-Sortierung zählt es zur Gruppe der nicht-unzugeordneten Fragmente (unten), nicht zur Arbeitsfläche oben; es zählt nicht in die „N Fragmente offen"-Zählung der Header-Flanke.
- **Übertrags-Schalter (v2-07, C1):** Fragmente mit gesetztem `transfer_type` (`INTERNAL_TRANSFER` **oder** `ASSET_REALLOCATION`) sind aus der Arbeitsfläche ausgeblendet. Sie erscheinen nur, wenn der Schalter **„Überträge anzeigen"** eingeschaltet ist; **Standard ist „aus"**. Begründung: ein Fragment mit gesetztem `transfer_type` kann per Daten-Invariante nie einer Karte zugeordnet werden (Trigger `trg_oqb_no_transfer_links`) und gehört deshalb nicht auf die Fläche, auf der kuratiert wird.
  **Ort und Form:** rechtsbündig in derselben Zeile wie die Zonen-Überschrift „ROHMASSE" — bewusst nicht in einer eigenen Zeile, damit die Oberkanten von Portal, Karussell und Stack bündig bleiben. Beschriftung `Überträge anzeigen (N)`, wobei **N die Anzahl der Übertrags-Fragmente des angezeigten Monats** ist (beide Typen zusammen, unabhängig von der Schalterstellung). Enthält der Monat keine Überträge, wird der Schalter **nicht gerendert**.
  **Invarianten:** Der Schalter filtert ausschließlich die Stack-Darstellung. Die Sortierregel ist unberührt — bei eingeschaltetem Schalter steht die Liste exakt so da wie vor v2-07. Ebenso unberührt: die Darstellung eines sichtbaren Übertrags (Opacity `0.45`, Badge „TRANSFER", kein Drag/Tap), die Status-Hierarchie aus Sprint 9, die Drop-Ziele des Karussells und die „N Fragmente offen"-Zählung der Header-Flanke (die zählt `UNASSIGNED` und hat Überträge nie enthalten).
  **Verhalten:** rein clientseitig, ohne Server-Roundtrip und ohne URL-Parameter. Die Stellung überlebt einen Monatswechsel innerhalb der Sitzung — sie ist eine Ansichts-Vorliebe, kein monatsspezifischer Zustand (bewusste Abweichung vom LL-5-Reset-Muster). Ein Neuladen der Seite setzt auf „aus" zurück; es findet keine Persistierung statt.
  **Folge:** Wird ein Fragment bei ausgeschaltetem Schalter als Umschichtung markiert, verschwindet es unmittelbar aus dem Stack. Das ist die beabsichtigte Wirkung; die Rücknahme der Markierung ist folgerichtig nur bei eingeschaltetem Schalter erreichbar.
- **Grundton-Vereinheitlichung (N5):** Alle Rohmasse-Fragmente teilen **einen gemeinsamen Grau-Grundton-Token** (zugeordnet *und* `INTERNAL_TRANSFER`). Die Unterscheidung läuft ausschließlich über **Opacity** (zugeordnet `0.22` / Transfer `0.45`) **+ das „TRANSFER"-Badge** (Grau-Soft). Kein separater Hue je Zustand — das behebt zwei leicht abweichende Grau-Töne nebeneinander. Der Yellow-Soft (KI-Vorschlag-Badge) bleibt für Transfer ausgeschlossen (AD5): Transfer ist Fakt, kein Vorschlag.

### Was explizit NICHT
- Kein Swipe, kein Long-Press
- Keine zwei Karussell-Reihen
- Kein „Drop & Distill"-Header
- Kein zweiter CSV-Import-Bereich
- Keine Chevrons im Fragment-Stack
- Kein Fragment-Drop auf Ghost Cards

---

## 9. Komponente: Jahres-Welle + Popup (kumulierte Treppe)

### Funktion

**M3 ersetzt das V1-Treppen-Layout.** Die Jahres-Visualisierung ist eine **monatliche EUR-Welle hinter dem zentrierten Ring**. Die kumulierte Sicht (vormals inline-Treppe) zieht in ein **On-Demand-Popup** um. Die Welle ist Hintergrund-Element auf gleicher Fläche wie der Ring (§5); das Popup ist die **einzige** Heimat der kumulierten Treppe.

### Welle — Visuelle Spezifikation

| Eigenschaft | Wert |
|---|---|
| Y-Achse | monatliche Sparrate in **EUR** (konsistent zu Ring + kumulierter Sicht) |
| Fenster | **Kalenderjahr Jan–Dez (B1)** |
| Opacity | **`0.80`** (Token `--wave-opacity`) |
| Realisiert | **Teal** `#3ECFAF` |
| Forecast | **Grau** (Ghost-Analogie, vgl. `--bg-card-ghost` / `--text-ghost`) |
| Negativer Monat | **Ausgaben-Rot** `#FF453A` (Fläche + Linie unter Null) |
| Aktiver-Monat-Marker | **genau ein Kreis** — der im Header gewählte aktive Monat. Kein Hover-Punkt, kein Ereignis-Kreis |

**Regime-Grenze Teal→Grau (DD-bestätigt, v2-02-Präzisierung):** Teal reicht **bis einschließlich dem laufenden (aktuellen) Monat** — abgeschlossene Monate (Fakt) **und** der laufende Monat (Hybridsicht, §4.4). **Grau ab dem ersten Zukunftsmonat** (reine Prognose). Die Grenze liegt fix am Kalender-„jetzt" und ist **unabhängig vom Header-aktiven Monat**: der aktive Monat steuert nur die Ring-Zahl (§5) und den einen Kreis, **nicht** die Einfärbung. Navigation in einen Zukunftsmonat färbt nichts um (Teal = Fakt + laufender Monat, Grau = Zukunft).

**Verdeckung (Kernpunkt):** Der Ring liegt grafisch vor der Welle, ist aber **interaktions-transparent** (§5, `pointer-events:none`). Die Monatswahl ist **positions-basiertes Scrubbing über die volle Breite** (nicht punkt-genau); Führungslinie + Tooltip rendern **über** dem Ring. Damit ist auch die Jahresmitte hinter dem Ring voll erreichbar — der V1-„Umweg" entfällt.

**Welle-Hover → Tooltip:** Monatsname, IST €, Plan €, **Top-1-Treiber**. Der IST-vs-Plan-Vergleich lebt hier, nicht als zweite Welle.

**NULL-Monate (v2-02):** Ein Monat ohne berechenbare Sparrate (`calculate_sparrate_for_month = NULL`, z. B. Onboarding offen) wird auf der Welle und im Tooltip als **0 €** dargestellt — kein Lücken-/Gap-Rendering, die Welle bleibt durchgehend.

**Treiber-Platzhalter (v2-02, bis B2):** Solange die Treiber-Heuristik (B2, Backend-Sprint) fehlt, zeigen die Treiber-Slots (Hover-Top-1, Popup-Top-3) das Label „B2-Heuristik offen" statt fiktiver Beträge; die Anzeige-Struktur ist final, nur die Datenquelle ist ein Stub.

### Popup (kumulierte Treppe) — Spezifikation

Klick auf die Welle öffnet ein **Single-Surface-Overlay**, dismissible per Klick-außen / Escape, **kein Tooling, keine Slider**. Inhalt:

- **Kumulierte Treppe** als Stufen: **IST (teal) + Plan (grau)**.
- **Jahressumme als Held** (z. B. „+8.880 €").
- **Monatsklick → Top-3-Treiber** dieses Monats.
- **Unterzeile/Legende:** „IST (teal), Plan (grau), Vorjahr (gold) · Klick auf einen Monat zeigt die drei Treiber".

**B6 — Vorjahres-Linie (nur Popup):** gold-gestrichelte Linie (`[5,4]`) auf dem **kumulierten Vorjahres-Jahresendwert** (Σ Jan–Dez X-1), auf derselben Skala wie die Treppe. Der **Betrag steht im rechten Gutter, außerhalb der Plotfläche**; die Legende „Vorjahr (gold)" in der Unterzeile. **Datenloses Vorjahr → Linie entfällt komplett** (keine 0-€-Linie; „nichts gespart" ≠ „keine Daten"). Ein Teiljahr mit einzelnen `NULL`-Monaten summiert normal (NULL = 0). Die **monatliche Welle führt keine** Vorjahres-Referenz — ein kumulierter Endwert ergibt nur auf kumulierter Fläche Sinn.

**B3 — Kumulativ-negative Sparrate (Cluster 3):** Schwelle ist die **Null-Linie** (einzige Schwelle). Die kumulierte Kurve ist **≥ 0 teal**; ein **Abschnitt unter Null** wird **Ausgaben-Rot `#FF453A`** (Fläche + Linie, gleiche Behandlung wie monatlich auf der Welle); steigt sie wieder über Null, wieder teal — **abschnittsweise, nicht global**. Die **Held-Zahl (Jahressumme)** folgt der §5-Ring-Logik: **rot, wenn der Endwert negativ** ist, sonst teal — sie spiegelt das Jahresergebnis (Endwert), nicht den tiefsten Zwischenstand. Die **Vorjahres-Goldlinie bleibt unberührt** (Gold = Referenz, Rot = Ist-Zustand), auch wenn sie selbst im Negativbereich liegt.

### Berechnungslogik

Die kumulierte Treppe ist die Summe der monatlichen Sparraten; jede monatliche Sparrate liefert `calculate_sparrate_for_month(user_id, M)` (siehe Section 4), das sich automatisch nach Zeitraum unterscheidet:

- **Vergangene Monate (M < heute):** eingefroren; offene Karten zählen mit Plan nach Modell α (2.3); Fragment-Summen final.
- **Aktueller Monat (M = heute):** Hybridsicht — Realisiertes ersetzt Plan, Rest läuft mit Plan.
- **Zukünftige Monate (M > heute):** keine Fragmente/Taps; aktive Karten zählen mit dann gültigem Plan.

**Geplante kumulierte Sparrate (Grau-Treppe):** Σ geplante Sparrate Januar bis Monat X.
**Tatsächliche kumulierte Sparrate (Teal-Treppe):** Σ `calculate_sparrate_for_month(M')` Januar bis Dezember.

### Was explizit NICHT
- Keine zwei Wellen (IST-vs-Plan lebt im Tooltip, nicht als zweite Welle)
- Kein Toggle %-/kumulierte Ansicht; keine kumulierte Sicht außerhalb des Popups
- Kein permanentes Abweichungs-Label; kein Hover-Punkt; kein Ereignis-Kreis auf der Welle
- Kein Tooling im Produkt (das Dev-Panel des Prototyps `welle_v1.html` ist Werkzeug, kein Produkt — analog Slider-Ausschluss §5). Das aktive Jahr ergibt sich aus dem `month`-URL-Param

### Cluster 3 — aufgelöst (04.07.2026)
- **N4b** → in §5 „%-Subzeile + Degenerations-Modus" spezifiziert (Cap > 200 %, EUR-Aussage bei `Plan < 100 €`, neutraler Arc).
- **B3** → oben im Popup-Abschnitt spezifiziert (abschnittsweise Rot ab Null-Linie, Held folgt Endwert-Vorzeichen, Goldlinie unberührt).

---

## 10. Komponente: Income / Partner-Split

### Funktion

Zwei klickbare Labels (ICH / PARTNER) flankieren den Ring. Klick öffnet Gehalts-Popup. Nur der Nutzer selbst bedient das Dashboard — die Partnerin hat keinen eigenen Login.

### Labels

| Eigenschaft | Wert |
|---|---|
| Avatar | `32×32px`, `border-radius: 50%`, `border: 1px solid rgba(255,255,255,.12)` |
| Prozentsatz | `13px`, `font-weight: 500` |
| Name | `9px`, `font-weight: 600`, `letter-spacing: .8px`, uppercase |
| Hover | `border-color: rgba(255,255,255,.3)` |
| Aktiv | `border-color: rgba(255,255,255,.4)`, `background: rgba(255,255,255,.06)` |

**Sonderfall Partner 0 € Brutto:** Split = 100% / 0%. PARTNER-Label bleibt sichtbar mit `0 %`.

**Sonderfall Partner unbekannt (kein Eintrag):** Split = 100 % / 0 %. ICH trägt alles allein. PARTNER-Label kann durch Klick befüllt werden.

### Onboarding — Pflichtumfang

Vor der Nutzung des Dashboards muss der User folgende Pflichtangaben machen:

1. **Account erstellen** (passiert automatisch via Supabase Auth)
2. **Steuerklasse + Jahresbrutto + monatliches Netto für ICH** — danach wird `profiles.onboarded_at` gesetzt und das Dashboard freigeschaltet
3. **(Optional) Partner-Brutto** — kann übersprungen werden, kann später aus dem Dashboard heraus über das PARTNER-Label nachgetragen werden

Wenn der User das Onboarding (Schritt 2) abbricht, bleibt `onboarded_at = NULL` und das Dashboard bleibt gesperrt — beim nächsten Login erscheint wieder das Onboarding.

**V1-Limitation:** Die Steuerklasse wird beim ersten Income-Eintrag erfasst und in `profiles.tax_class` gespeichert. Eine Änderung der Steuerklasse über die UI ist in V1 nicht möglich — nur über direkten DB-Eingriff durch Admin. V2-Plan: Settings-Bereich zum Ändern.

### Popup-Felder

**Header:** Wer (ICH / PARTNER) + aktiver Monat

**Steuerklasse (nur beim allerersten Income-Eintrag für ICH):**
- Auswahl 1–6 als Buttons oder Dropdown
- Wird nach Bestätigung in `profiles.tax_class` gespeichert
- In Folge-Popups nicht mehr abgefragt

**Jahresbrutto:**
- Range-Slider: Min `20.000 €`, Max `150.000 €`, Step `100 €`
- Wirkung: Bestimmt ausschließlich den Split-Prozentsatz
- Inline-Vorschau unter dem Slider: aktuelle Schätzung des monatlichen Nettos (siehe Netto-Vorschlag-Algorithmus unten)

**Split-Vorschau:**
- Zeigt ICH % / PARTNER % dynamisch während Slider-Bewegung
- Beispielrechnung mit gemeinsamer Fixkosten-Karte — explizit als `(nur illustrativ)` gekennzeichnet

**Monatliches Netto (Pflichtfeld):**
- Vorbefüllt durch Netto-Vorschlag-Algorithmus (siehe unten)
- Überschreibbar — freies Zahlenfeld
- Selbstheilend: Feld leeren + Fokus verlassen → Vorschlagwert kehrt zurück
- Pflicht: Bestätigen ohne Wert ist nicht möglich — Button disabled
- Wirkung: Treibt die Sparrate

**Forward-Inheritance-Badge:** `Gilt ab [Monat] für alle Folgemonate bis zur nächsten Änderung`

### Netto-Vorschlag-Algorithmus (Tier 2)

**Funktional:** Bei Eingabe / Änderung des Brutto wird der Vorschlag live unter dem Brutto-Feld angezeigt im Format „Schätzung: 3.245 €". Der User kann den Wert ins Netto-Feld als vorbefüllt übernehmen oder selbst tippen.

**Technisch:** Das Frontend ruft `estimate_net_monthly(gross_annual, profiles.tax_class, aktuelles_steuerjahr)` per RPC auf. Die Funktion liefert den geschätzten Netto-Monatswert basierend auf einer Bracket-Tabelle (Steuerklasse × Brutto-Range × Steuerjahr → Faktor) und gibt das Produkt `gross × factor / 12` zurück.

**Edge-Case fehlendes Steuerjahr:** Wenn die Bracket-Tabelle für das aktuelle Steuerjahr noch nicht gepflegt ist, gibt die Funktion `NULL` zurück. Frontend zeigt dann **keinen** Vorschlag, sondern einen dezenten Hinweis: *„Schätzung für dieses Steuerjahr noch nicht verfügbar — Netto bitte selbst eintragen."* Die App funktioniert weiter, nur ohne Schätzungs-Komfort.

**Wartungsaufgabe:** Im Januar jeden Jahres müssen die Brackets für das neue Steuerjahr in die `net_estimation_brackets`-Tabelle eingespielt werden. Dies ist ein manueller Admin-Eingriff. V2-Plan: automatisierte Pflege aus offizieller Steuertarif-Quelle.

### Zustände Netto-Feld

| Zustand | Border | Hinweistext |
|---|---|---|
| Default | `rgba(255,255,255,.1)` | `Vorschlag basiert auf Steuerklasse [N] · Änderbar` |
| Fokus | `rgba(255,255,255,.3)` | — |
| Manuell geändert | `rgba(255,255,255,.3)` | `Manuell angepasst` in Teal |
| Leer (Fehler) | `rgba(255,69,58,.4)` | `Pflichtfeld — Vorschlag kehrt beim Verlassen zurück` in Rot |
| Wiederhergestellt | `rgba(255,255,255,.1)` | `Vorschlag wiederhergestellt · Änderbar` |

### Forward-Inheritance

- Gehaltsänderung gilt ab eingetragenem Monat vorwärts bis zur nächsten Änderung
- Vergangene Monate sind eingefroren, nicht editierbar
- Vergangene Monate im Popup: gelbe Warnung, alle Felder gesperrt, „Übernehmen" deaktiviert

**V1-Limitation:** Keine rückwirkende Korrektur mit Fairness-Delta. Der Nutzer ist selbst verantwortlich, den korrekten Startmonat zu wählen.

**V2-Plan:** Rückwirkende Korrektur mit Fairness-Delta-Anzeige und manuellem Ausgleichsworkflow.

### Was explizit NICHT
- Kein separater Einstellungsscreen
- Kein Haushaltsnetto — Sparrate basiert ausschließlich auf `ich.netto`
- Kein automatischer Split aus Netto
- Keine rückwirkende Fairness-Delta-Berechnung in V1

---

## 11. Komponente: CSV-Import / Drop & Distill

### Unterstützte Formate
- V1: CSV ausschließlich
- V2 geplant: Excel, PDF-Kontoauszug

### Portal — 5 Zustände

| Zustand | Border | Background | Dauer |
|---|---|---|---|
| Default | `1px dashed rgba(255,255,255,.12)` | `#111113` | — |
| Drag-Over | `rgba(62,207,175,.5)` | `rgba(62,207,175,.04)` | — |
| Verarbeitung | `rgba(255,255,255,.2)` | `#141416` | Bis fertig |
| Erfolg | `rgba(62,207,175,.5)` | `rgba(62,207,175,.06)` | 1.5 Sek |
| Fehler | `rgba(255,69,58,.4)` | `rgba(255,69,58,.04)` | 4 Sek |

### Hash-Algorithmus (Silent De-Duplication)

Jedes importierte Fragment erhält einen kryptografischen Fingerabdruck. Fragmente mit bekanntem Hash werden lautlos ignoriert — keine Duplikate, keine Fehlermeldung.

**Verbindliche Definition:**

```
Hash = SHA-256(transaction_date_iso + "|" + amount_fixed + "|" + description_raw)
```

Dabei:
- `transaction_date_iso` = ISO-Datumsformat ohne Uhrzeit, z. B. `2026-04-15`
- `amount_fixed` = String mit zwei Nachkommastellen, z. B. `-1200.00`
- `description_raw` = vollständiger Verwendungszweck-Text aus der CSV, **ohne** Trimming, **ohne** Normalisierung
- Pipe-Separator `|` zwischen den Feldern

**Konsequenz:** Derselbe CSV-Eintrag erzeugt immer denselben Hash. Ein zweiter Import derselben CSV-Datei wird vollständig dedupliziert.

**Implementiert als DB-Garantie:** Tabelle `fragments` hat `UNIQUE(user_id, hash)`. Distiller arbeitet mit `INSERT ... ON CONFLICT DO NOTHING` — keine Race Conditions, keine Anwendungs-Logik nötig.

**Bank-Adapter (DKB-Format, DD-approved):** `description_raw` wird gebildet als `"{Zahlungsempfänger*in} | {Verwendungszweck}"` — beide Felder byte-exakt aus der CSV-Quelle, ohne Trimming, ohne Normalisierung. Pipe-Separator mit Spaces als Trenner. Hash-Determinismus bleibt erhalten.

**Bank-Adapter (Cortal-Consors-Format, DD-approved, Sprint 9):** `description_raw` wird gebildet als `"{Sender / Empfänger} | {Buchungstext} | {Verwendungszweck}"` — alle drei Felder byte-exakt aus der CSV-Quelle, ohne Trimming, ohne Normalisierung. Pipe-Separator mit Spaces als Trenner (drei Felder, zwei Separatoren). `n/a`-Werte werden als Literal `"n/a"` belassen (kein NULL für Description-Bestandteile). Hash-Formel unverändert: `sha256(transaction_date | amount_fixed | description_raw)`. `counterparty_iban` ist **nicht** Hash-Bestandteil — damit trifft ein Re-Import bestehende Hashes und füllt die IBAN per `ON CONFLICT DO UPDATE` nachträglich (Backfill).

### Konfidenz-Berechnung

Für jedes neu importierte Fragment berechnet der Distiller pro aktive Karte einen Konfidenz-Score zwischen 0 und 1.

**Formel:**

```
Konfidenz = 0.50 × Namensähnlichkeit
          + 0.30 × Betragsübereinstimmung
          + 0.20 × Frequenz-Konsistenz
```

Die Gewichte sind in `app_config` hinterlegt (siehe unten) und in V1 nicht über die UI änderbar.

**Komponente 1 — Namensähnlichkeit:**
Trigram-basierter Vergleich der Fragment-Description mit dem Karten-Namen. Substring-Boost: wenn der Karten-Name als Teil-String in der Description vorkommt (typisch für CSV-Buchungstexte wie „BUCHUNG MIETE WOHNUNG"), wird der Score auf 0.80 angehoben — auch wenn die reine Trigram-Ähnlichkeit niedriger wäre.

**Komponente 2 — Betragsübereinstimmung:**
Bracket-Logik nach prozentualer Abweichung vom Karten-Plan (Absolutwert-Vergleich, Vorzeichen ignoriert):

| Abweichung | Score |
|---|---|
| < 1 % | 1.00 |
| < 5 % | 0.85 |
| < 15 % | 0.60 |
| < 30 % | 0.30 |
| ≥ 30 % | 0.00 |

**Komponente 3 — Frequenz-Konsistenz:**
Binär. 1.00 wenn die Karte im Fragment-Monat aktiv ist (= Frequenz-Treffer), sonst 0.00. Eine Auto-Versicherung mit Frequenz `Jährlich` und `first_active_month=Oktober` matcht ein Oktober-Fragment, kein Mai-Fragment.

### Schwellwert-Verhalten

| Konfidenz-Range | Verhalten |
|---|---|
| < 0.20 | Kein Match. Fragment bleibt komplett unzugeordnet im Stack — keine UI-Reaktion. |
| 0.20 – 0.60 | Score zu schwach für Vorschlag. Kein Badge. Fragment bleibt unzugeordnet. |
| 0.60 – 0.95 | Fragment im Stack mit Badge `KI-Vorschlag: [Karten-Name]`. User entscheidet manuell. |
| > 0.95 | Auto-Absorption. Karte wird automatisch grün. Kein User-Eingriff nötig. Vollständig lautlos. |

**Mehrfach-Match:** Matchen mehrere Karten in derselben Konfidenz-Range (0.60–0.95 für Badge bzw. > 0.95 für Auto-Absorption), gewinnt die Karte mit dem höchsten Score, deterministisch. Bei Score-Gleichstand entscheidet der alphabetisch erste Karten-Name.

**Cross-Account-Erkennung (`INTERNAL_TRANSFER`, Sprint 9):** `profiles.own_ibans text[]` führt die eigenen Konto-IBANs des Users. Beim Import wird jede Zeile, deren `counterparty_iban` in `own_ibans` enthalten ist, als `fragments.transfer_type = 'INTERNAL_TRANSFER'` markiert (greift sowohl für neu eingefügte Fragmente als auch für IBAN-Backfill bestehender Fragmente). Eine Transfer-Markierung löst bestehende `card_fragment_links`-Zuordnungen des Fragments und bereinigt eine etwaige KI-Vorschlag-Markierung (`suggested_card_id` / `confidence`) — ein Transfer kann nicht gleichzeitig einer Karte zugeordnet sein (Daten-Invariante). Im View `fragments_with_status` hat der Status `'INTERNAL_TRANSFER'` die höchste Priorität und schlägt `UNASSIGNED` / `ASSIGNED` / `AUTO_ABSORBED`. **Konsequenz:** Jede Bewegung zwischen zwei eigenen Konten wird markiert — nicht nur ausdrücklich als „Übertrag/Sparen" betitelte, sondern auch Erstattungen, Geschenke etc., sofern sie über ein eigenes Konto laufen. Das ist gewollt: der Geld-Saldo verlässt das Gesamtvermögen nicht.

### Konfidenz-Beispiel — End-to-End

**Fragment:** `BUCHUNG MIETE WOHNUNG MUSTERSTR -1200,00 € am 28.03.2026`
**Karte:** `Miete`, Plan im März 2026 = 1.200 €, Frequenz `Monatlich`, first_active_month vor März 2026

**Komponenten:**
- Namensähnlichkeit: 0.80 (Substring „miete" in Description erkannt)
- Betragsübereinstimmung: 1.00 (1.200 € exakt = 1.200 €, < 1 % Abweichung)
- Frequenz-Konsistenz: 1.00 (Karte im März aktiv, Monatlich)

**Score:** 0.50 × 0.80 + 0.30 × 1.00 + 0.20 × 1.00 = 0.40 + 0.30 + 0.20 = **0.90**

**Resultat:** Score 0.90 fällt in Range 0.60–0.95 → Fragment erscheint im Stack mit Badge „KI-Vorschlag: Miete". User kann per Drag & Drop manuell zuordnen.

(Wäre der Score knapp über 0.95 gewesen — z. B. bei einem noch eindeutigeren Description-Text — wäre die Karte ohne Zutun grün geworden.)

### Konfigurierbare Konstanten (`app_config`)

Folgende Konstanten sind zentral in der `app_config`-Tabelle hinterlegt — Claude Code soll sie **nicht hardcoden**, sondern aus der DB lesen:

| Konstante | Default | Bedeutung |
|---|---|---|
| `confidence.auto_absorption_threshold` | 0.95 | Über diesem Score: Fragment wird automatisch der Karte zugeordnet |
| `confidence.badge_threshold` | 0.60 | Über diesem Score: Fragment zeigt KI-Vorschlag-Badge im Stack |
| `confidence.minimum_match_threshold` | 0.20 | Unter diesem Score: kein Match-Vorschlag |
| `confidence.weight_name` | 0.50 | Gewicht der Trigram-Namensähnlichkeit |
| `confidence.weight_amount` | 0.30 | Gewicht der Betrag-Übereinstimmung |
| `confidence.weight_frequency` | 0.20 | Gewicht der Frequenz-Konsistenz |
| `trash.retention_seconds` | 60 | Server-Side-Wartezeit für Rückgängig (UI versteckt nach 5s) |

Werte änderbar nur via Service-Role (Admin-Eingriff).

### Fragment-Karte — Spezifikation

| Feld | Typographie | Farbe |
|---|---|---|
| Betrag | `16px`, `font-weight: 200`, `tabular-nums` | Negativ: `#FF453A` · Positiv: `#3ECFAF` |
| Beschreibung | `10px`, `font-weight: 500` | `rgba(255,255,255,.28)` · truncated · zeigt den Verwendungszweck (§8, `RM-1`) |
| Datum | `9px` | `rgba(255,255,255,.15)` |
| Kategorie-Badge (nur 0.60–0.95) | `7.5px`, `font-weight: 600`, uppercase | **Seit v2-10 nicht mehr gerendert** (`BF-1`) — Spezifikation bleibt für die Wiedereinschaltung stehen |

**Badge-Farbe (v2-07, A1):** Welchen der sechs Töne ein Badge trägt, bestimmt allein der **Kartenname** — über eine deterministische Funktion, nicht über eine Datenbank-Spalte. Damit ist die Farbe stabil über Renders, Sitzungen und Geräte hinweg und unabhängig von Anzahl, Reihenfolge oder Anlage-Zeitpunkt der Karten; eine Karte behält ihre Farbe, wenn andere Karten angelegt oder gelöscht werden. Groß-/Kleinschreibung und Randleerzeichen im Namen ändern den Ton nicht. Bei mehr Karten als Tönen teilen sich Karten einen Ton — die Farbe ist ein **Gruppierungs-Hinweis, kein Identitätsmerkmal**; der Kartenname steht daneben. Deckkraft, Typografie und Geometrie des Badges sind unverändert; variabel ist ausschließlich der Farbton. Das **TRANSFER-Badge ist vom Mapping ausgenommen** und behält den neutralen Grau-Soft-Ton auf `--fragment-hue` (AD5, Sprint 9: Transfer ist Fakt, kein Vorschlag).

**Nicht mehr gerendert (v2-10, BF-1):** Die KI-Vorschlags-Badges sind aus der Anzeige genommen. Anlass war ein Umbruch: Badge und Betrag teilten sich eine Zeile, das Badge durfte weder schrumpfen noch umbrechen, also wurde der Betrag zusammengedrückt und das Euro-Zeichen rutschte in die zweite Zeile. Der Vorschlag wird in der Datenbank unverändert **weiter berechnet** und die sechs Farbtöne bleiben im Code — die Anzeige ist über eine einzelne Konstante (`SHOW_SUGGESTION_BADGES`) wieder einschaltbar. Unberührt bleiben das **TRANSFER-Badge** und die **automatische Zuordnung ab 95 % Konfidenz**: sie ist keine Empfehlung, sondern eine fertige Zuordnung. Der Betrag trägt zusätzlich ein Umbruch-Verbot, damit die Fehlerklasse auch für das TRANSFER-Badge dauerhaft geschlossen ist.

*Historie:* Sprint 8 (OQ1) hatte übergangsweise **einen** generischen Gold-Ton für alle Karten gesetzt und die karten-spezifische Farbe als V2 vorgemerkt. Die Tabellen-Zelle „Karten-spezifisch" war seither die unerfüllte Soll-Aussage; v2-07 löst sie ein. `--badge-hue-1` ist genau der Gold-Ton aus Sprint 8.

**Drag-Verhalten:**

| Zustand | Wert |
|---|---|
| Default Opacity | `0.72` |
| Hover | `translateY(-1px)`, `opacity: 0.92` |
| Drag-Start | `opacity: 0.35`, `scale(.97)`, cursor: `grabbing` |
| Zugeordnet | `opacity: 0.22`, `pointer-events: none` |

### Was explizit NICHT
- Kein Modal bei Fehlern
- Kein Ladebalken
- Keine Bestätigungsmeldung nach Import
- Kein automatisches Clustering
- Keine interaktiven Kategorie-Badges (nur informativ)
- Keine Kategorie-Vorhersage in V1 (Karten-Zuordnung reicht)

### Behandlung von Erstattungen — Kurations-Leitfaden (Beschluss 24.07.2026)

Positive Fragmente ohne Transfer-Charakter werden nach vier Regeln kuratiert:
1. **Retouren/Erstattungen mit Kosten-Bezug** → per Drag auf die verursachende
   Karte (Verrechnung; `calculate_card_amount_for_month` summiert verlinkte
   Fragmente **vorzeichenrichtig** — Gutschriften und Ausgaben werden gegeneinander
   aufgerechnet, nicht addiert. Bei BUDGET senkt die Gutschrift damit den Verbrauch,
   bei FIXED_COST die Realität).
2. **Wiederkehrende Erstattungs-Quellen** → eigene MONTHLY-INCOME-Karte.
3. **Einmal-Zuwendungen ab 100 €** (Erheblichkeits-Schwelle) → ONCE-INCOME-Karte
   im betreffenden Monat.
4. **Unter der Schwelle** → bewusst unzugeordnet in der Rohmasse (die Sparrate
   bleibt insoweit konservativ).

Ein **Schema**-Eingriff ist dafür nicht nötig (Kern-Invariante §4.2: Karten sind die
einzige Realitäts-Quelle der Sparrate).

> **Korrektur (v2-11, 05.08.2026 — `BF-5`).** Hier stand bis dahin, auch ein
> **RPC**-Eingriff sei nicht nötig und „bewusst verworfen". Das beruhte auf der
> ungeprüften Annahme, `calculate_card_amount_for_month` summiere bereits
> vorzeichenrichtig. Sie tat es nicht: Die Fragment-Aggregation lautete
> `SUM(ABS(f.amount))` und warf jedes Vorzeichen weg. Der Leitfaden hat damit ab dem
> Tag seiner Verabschiedung ein Verhalten beschrieben, das es nie gab — aufgefallen
> ist es erst, als im Juli 2026 zum ersten Mal eine Karte gemischte Vorzeichen bekam
> („Aline Geburtstag": 1.068,11 € angezeigt statt 168,11 €, **900 €** Wirkung auf die
> Juli-Sparrate).
>
> Der RPC-Eingriff ist in **v2-11** nachgeholt worden
> (`supabase/migrations/20260805_v2_11_bf5_vorzeichen.sql`). Die Kern-Invariante §4.2
> bleibt davon unberührt — geändert hat sich nur, wie die Fragmente **einer** Karte
> zu deren Betrag verrechnet werden.
>
> **Lehre:** Ein Leitfaden, der das Verhalten einer Rechenfunktion *beschreibt*, ist
> keine Prüfung dieser Funktion. Wo die Doku eine Zusicherung über Rechenverhalten
> macht, gehört sie gegen die Funktion belegt — nicht aus deren Zweck erschlossen.

**Wenn Gutschriften die Ausgaben übersteigen (Beschluss E2, 05.08.2026).** Der
Netto-Betrag zählt so, wie er ist — **auch unter null**. Es wird **nicht** bei 0
gekappt; der negative Verbrauch verbessert die Sparrate entsprechend. Eine Zahl zu
verschlucken wäre genau die Art stiller Ungenauigkeit, die zu den Befunden vom
04.08.2026 geführt hat (vgl. LL-20).

**Reichweite in der Praxis:** Bei **BUDGET** greift zusätzlich §4.3.2 — der Plan gilt,
solange die Fragmente ihn nicht übersteigen (LL-12). Ein negativer Netto-Verbrauch ist
stets ≤ Plan, die Karte zeigt also den Plan; der negative Wert erreicht die Sparrate
bei BUDGET gar nicht. Wirksam wird E2 damit bei **FIXED_COST** (dort gewinnt immer die
Realität) und bei **INCOME**. Beide Fälle sind in v2-11 auf der Übungs-Datenbank
belegt (`sprints/sprint_v2-11_probe.sql`, T4 und T8).

---

## 12. UI-Copy — Vollständige Textreferenz

Alle deutschsprachigen UI-Texte der App. Englische Ausnahmen sind explizit markiert. Variablen in eckigen Klammern werden zur Laufzeit befüllt.

### 12.1 Singularity Ring

| Kontext | Text |
|---|---|
| Ring-Label | `Sparrate` |
| Prozent — im Plan | `[N] % von Plan` |
| Prozent — über Plan | `+[N] % über Plan` |
| Prozent — Defizit | `[N] % Defizit` |
| Degenerations-Modus — besser | `+[N] € über Plan` |
| Degenerations-Modus — schlechter | `−[N] € unter Plan` |
| Degenerations-Modus — genau auf Plan | `genau nach Plan` |

### 12.2 Header / Timeline-Navigation

| Kontext | Text |
|---|---|
| Status-Pill: laufender Monat | `Laufend` |
| Status-Pill: vergangener Monat | `Abgeschlossen` |
| Status-Pill: Zukunftsmonat | `Forecast` *(englisch, bewusst)* |
| Linke Flanke — alles zugeordnet | `Alles erledigt` |
| Linke Flanke — 1 Fragment offen | `1 Fragment offen` |
| Linke Flanke — mehrere offen | `[N] Fragmente offen` |
| Rechte Flanke — kein Ausreißer | `Kein Ausreißer` |
| Rechte Flanke — Ausreißer | `[Bezeichnung] [Betrag]` *(z.B. `Autoversicherung 650 €`)* |

### 12.3 Karten

| Kontext | Text |
|---|---|
| Kartentyp-Label Fixkosten | `Fixkosten` |
| Kartentyp-Label Budget | `Budget` |
| Kartentyp-Label Einnahmen | `Einnahmen` |
| Fixkosten — Status offen | `Offen` |
| Fixkosten — Status bezahlt | `Bezahlt` |
| Fixkosten — Status Forecast | `Forecast` |
| Budget — Status laufend | `Laufend` |
| Budget — Status überschritten | `Überschritten` |
| Budget — Status abgeschlossen | `Abgeschlossen` |
| Budget — Status Forecast | `Forecast` |
| Einnahmen — Status erwartet | `Erwartet` |
| Einnahmen — Status erhalten | `Erhalten` |
| Einnahmen — Status Forecast | `Forecast` |
| Budget — Restbudget positiv | `Noch [N] € frei` |
| Budget — Restbudget überschritten | `−[N] € über Plan` |
| Budget — Restbudget abgeschlossen | `[N] € nicht verbraucht` |
| Betrag-Abweichungs-Hinweis | `Betrag weicht vom Plan ab — anpassen?` |
| Attribution ICH | `Ich` |
| Attribution GEMEINSAM | `Gemeinsam` |

### 12.4 Kontextmenü + Overlays

| Kontext | Text |
|---|---|
| Kontextmenü — Option 1 | `Betrag anpassen` |
| Kontextmenü — Option 2 | `Letzte Zahlung in Monat X` *(X = vom Nutzer gewählter Monat aus Monatspicker)* |
| Kontextmenü — Option 3 | `Karte löschen` |
| Betrag anpassen — Option 1 | `Nur dieser Monat` |
| Betrag anpassen — Option 2 | `Dauerhaft ab diesem Monat` |
| Neue Karte — Popup-Titel | `Neue Karte erstellen` |
| Neue Karte — Frequenz-Label | `Wiederholung` |
| Frequenz Monatlich | `Monatlich` |
| Frequenz Quartalsweise | `Quartalsweise` |
| Frequenz Halbjährlich | `Halbjährlich` |
| Frequenz Jährlich | `Jährlich` |
| Frequenz Einmalig | `Einmalig` |
| Neue Karte — Bestätigung | `Erstellen` |
| Alle Overlays — Abbruch | `Abbrechen` |

### 12.5 Toast (Soft-Delete)

| Kontext | Text |
|---|---|
| CARD_END — Titel | `[Kartenname] — Endet in [Monat Jahr]` |
| CARD_END — Subtext | `Ab [Folgemonat] nicht mehr aktiv` |
| CARD DELETE — Titel | `[Kartenname] gelöscht` |
| CARD DELETE — Subtext | `Karte wird dauerhaft entfernt` |
| Toast — Aktion | `Rückgängig` |
| Toast — nach Undo | `Wiederhergestellt ✓` |

### 12.6 Portal / CSV-Import

| Kontext | Text |
|---|---|
| Default — Label | `CSV ablegen oder klicken` |
| Default — Subtext | `Kontoauszug importieren` |
| Drag-Over — Label | `Loslassen zum Import` |
| Drag-Over — Subtext | `CSV wird erkannt` |
| Verarbeitung — Label | `Wird verarbeitet…` |
| Verarbeitung — Subtext | `Fragmente werden erkannt` |
| Erfolg — Label | `Import erfolgreich` |
| Erfolg — Subtext | `Fragmente erscheinen im Stack` |
| Fehler Format — Label | `Format nicht erkannt` |
| Fehler Format — Subtext | `Bitte CSV-Datei verwenden` |
| Fehler Leer — Label | `Keine Transaktionen` |
| Fehler Leer — Subtext | `Datei enthält keine Einträge` |
| Fehler Korrupt — Label | `Datei fehlerhaft` |
| Fehler Korrupt — Subtext | `Datei konnte nicht gelesen werden` |
| Fragment KI-Badge | `KI-Vorschlag: [Karten-Name]` |

### 12.7 Income / Partner-Split

| Kontext | Text |
|---|---|
| Ring-Label ICH | `Ich` |
| Ring-Label PARTNER | `Partner` |
| Popup-Header | `[Ich / Partner] — Jahresbrutto` |
| Feld-Label Brutto | `Jahresbrutto` |
| Feld-Label Netto | `Monatliches Netto` |
| Schätzung — verfügbar | `Schätzung: [N] €` |
| Schätzung — nicht verfügbar | `Schätzung für dieses Steuerjahr noch nicht verfügbar — Netto bitte selbst eintragen.` |
| Netto-Hinweis — Default | `Vorschlag basiert auf Steuerklasse [N] · Änderbar` |
| Netto-Hinweis — manuell geändert | `Manuell angepasst` |
| Netto-Hinweis — Feld leer | `Pflichtfeld — Vorschlag kehrt beim Verlassen zurück` |
| Netto-Hinweis — wiederhergestellt | `Vorschlag wiederhergestellt · Änderbar` |
| Forward-Inheritance-Badge | `Gilt ab [Monat] für alle Folgemonate bis zur nächsten Änderung.` |
| Vergangener Monat — Warnung | `Vergangener Monat — Werte sind eingefroren.` |
| Illustrativ-Hinweis Split-Vorschau | `(nur illustrativ)` |
| Confirm-Button | `Übernehmen` |

### 12.8 Jahres-Welle + Popup

| Kontext | Text |
|---|---|
| Welle-Tooltip — Kopf | `[Monat] [Jahr] · IST` bzw. `· Forecast` |
| Welle-Tooltip — Zeilen | `IST` / `Plan` (€-Werte) |
| Welle-Tooltip — Treiber | `Treiber: [Top-1]` (B2-Heuristik offen) |
| Popup — Titel | `Kumulierte Sparrate [Jahr]` |
| Popup — Held | Jahressumme (€) |
| Popup — Unterzeile | `IST (teal), Plan (grau), Vorjahr (gold) · Klick auf einen Monat zeigt die drei Treiber` |
| Popup — Monatsklick | drei Positionen (Top-3-Treiber, B2-Heuristik offen) |

---

## 13. Bekannte Limitationen V1

| Limitation | Workaround V1 | V2-Plan |
|---|---|---|
| Keine Periodenabgrenzung (Vorauszahlungen) | Betrag anpassen auf 0 €, nur diesen Monat | **Nicht verfolgt (v2-01):** Zuordnungs-Monat = Transaktions-Monat ist Regel; keine `transactionMonth`/`allocationMonth`-Divergenz |
| Keine rückwirkende Gehaltskorrektur mit Fairness-Delta | Nutzer muss korrekten Startmonat wählen | Rückwirkende Korrektur mit Ausgleichsworkflow |
| Kein PDF/Excel-Import | CSV only | PDF-Parser, Excel-Import |
| Kein Clustering von Fragmenten | Manuelle Zuordnung | Automatisches Clustering |
| Steuerklasse-Wechsel nicht über UI | Direkter SQL-Eingriff durch Admin | Settings-Bereich für Profil-Daten |
| Steuerjahr-Brackets müssen manuell gepflegt werden | Admin spielt Brackets jährlich ein | Automatisierte Pflege aus offizieller Quelle |
| Top-3-Abweichungstreiber nicht berechnet | — | Analytics-Feature mit materialisierten Views |
| Manueller Karten-Abschluss vor Monatsende | Nicht angeboten — Modell α reicht | Eventuell V2 über `card_monthly_states.closed_at` |
| Keine Partner-only Karten | Nicht modelliert | Bewusst nicht geplant |

---

## 14. Empfohlene Implementierungs-Reihenfolge

Komponente für Komponente — nicht monolithisch. Nach jeder Komponente Review gegen dieses Dokument und gegen die Schema-Doku.

1. **Onboarding + Income / Partner-Split** — `profiles`, `income_timeline`, Netto-Vorschlag, Forward-Inheritance, Steuerklasse-Erfassung. Pflicht für alles weitere.
2. **Singularity Ring** — Arc-Logik, Farbzustände, Dots. Ruft `calculate_sparrate_for_month()`. Kein Slider.
3. **Header / Timeline-Navigation** — Monatsnavigation, Status-Pill, Subzeilen-Logik mit `fragments_with_status`.
4. **Karten (Fixkosten, Budget, Einnahmen)** — Alle Zustände, Kontextmenü, Tap-Interaktion, „Betrag anpassen", „Letzte Zahlung in Monat X".
5. **Untere Interaktionszone** — Portal, Karussell, Fragment-Stack, Drag & Drop, Recurrence-Popup mit allen 5 Frequenzen.
6. **Sparrate-Berechnungslogik (Frontend-Integration)** — Verifikation aller Zustandskonflikte gegen `calculate_sparrate_for_month()`.
7. **CSV-Import / Distiller** — Upload, Hash-Bildung, Konfidenz-Berechnung, Auto-Absorption, Fragment-Generierung.
8. **Soft-Delete-Pattern** — Toast-UI, `schedule_deletion()` und `restore_deletion()` RPCs, Cleanup-Edge-Function.
9. **Jahres-Welle + Popup** — monatliche EUR-Welle hinter dem Ring (Teal/Grau/Rot, Scrub durch den Ring), Klick → Popup mit kumulierter Treppe (IST+Plan), Jahressumme, Vorjahres-Linie (B6), Top-1/Top-3-Treiber. Ersetzt das V1-Treppen-Layout.

**Kritischer Pfad:** Schritt 1 (Onboarding + Income) ist Voraussetzung für alles. Schritt 6 (Sparrate-Verifikation) ist die Grundlage für die finalen Komponenten.

**Test-Case für Schritt 6:** Das Rechenbeispiel aus 4.6 muss exakt `2.910,01 €` als Sparrate liefern, wenn die dort beschriebenen Daten in der DB stehen. Das ist der Standard-Sanity-Test.

---

*Design-Direktor + Architekt + Übersetzer | Antigravity Finance 1.0 | April 2026*
