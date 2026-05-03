# Antigravity Finance — Konsolidiertes Design-Dokument

**Version:** 2.0
**Status:** Freigegeben — vollständig synchronisiert mit Schema-Dokumentation v2
**Datum:** April 2026
**Primäres Referenzdokument für Claude Code**

> **Hinweis zu v2:** Diese Version wurde nach der Implementierung des Datenbank-Schemas überarbeitet. Sie ist konsistent mit `antigravity_finance_schema_summary_v2.md`. Beide Dokumente zusammen bilden die vollständige Wissensbasis für die Frontend-Implementierung.

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
9. [Komponente: Sparraten-Treppe](#9-komponente-sparraten-treppe)
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

Folgendes Feld existiert im DB-Schema (siehe `antigravity_finance_schema_summary_v2.md`), wird aber in V1 vom Frontend **nicht geschrieben** und nicht ausgelesen:

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
- Tanken 200 € (Budget, ICH, monatlich) — Fragmente in Höhe von 180 € verknüpft
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
  Tanken (Realität 180 €, immer 100%)      =   180,00 €

Sparrate = 3.900,00 − 809,99 − 180,00     = 2.910,01 €
```

### 4.7 Rückwirkende Fragment-Verknüpfungen

Beim CSV-Import können Fragmente mit `transaction_date` in vergangenen Monaten auftreten (z. B. späte Mietabrechnung im April mit Buchungsdatum 28. März).

**Verhalten:** Auto-Absorption und manueller Drop funktionieren auch für vergangene Monate. Die Sparrate des betroffenen Vergangenheitsmonats wird beim nächsten Render neu berechnet — die Plan-Werte und Gehälter bleiben eingefroren, nur die „Realität" wird präziser eingebracht.

Dies ist konsistent mit Snapshot-Integrität: Plan und Gehalt bleiben unangetastet, eine bessere Datenbasis ergibt automatisch eine bessere Berechnung.

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

### Budget-Karte — 3 Zustände

Zusätzlich zu den Fixkosten-Eigenschaften: Fortschrittsbalken (`3px`) an Unterkante + Restbudget-Anzeige + Padding-Bottom `18px`.

**Wichtig:** Budget-Karten sind **immer** Karte allein (ICH) — niemals gemeinsam. Eine GEMEINSAM-Attribution ist datenbankseitig durch Constraint ausgeschlossen.

**Laufend:**
- Background: `#160D0D` · Border: `rgba(255,69,58,.18)`
- Kartenname + Betrag: `rgba(255,255,255,.45)`
- Status: `Laufend` · Restbudget: `Noch X € frei` in `rgba(62,207,175,.40)`
- Balken: `rgba(62,207,175,.45)` · Breite = verbrauchter %

**Überschritten:**
- Background: `#160A08` · Border: `rgba(255,69,58,.35)`
- Kartenname: `#ffffff` · Betrag: `#FF453A`
- Status: `Überschritten` · Restbudget: `−X € über Plan` in `rgba(255,69,58,.65)`
- Balken: `#FF453A` · Breite = 100%

**Ghost (Forecast):**
- Identisch zu Fixkosten-Ghost-Variante

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

**„Karte löschen" (Hard-Delete):** Nur möglich wenn die Karte nie genutzt wurde (kein State, keine Fragmente). Triggert ebenfalls 5-Sekunden-Toast mit „Rückgängig".

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
Ghost Cards sind nicht interaktiv — kein Fragment-Drop aus anderen Monaten. Workaround: „Betrag anpassen auf 0 €, nur diesen Monat". V2-Plan: Periodenabgrenzung über `card_fragment_links.month`.

**Konflikt 4 — Fragment-Drop auf eine Karte in einem vergangenen Monat:**
Fragment wird akzeptiert. Sparrate des Vergangenheitsmonats wird beim nächsten Render neu berechnet (Plan und Gehalt bleiben eingefroren, Realität wird präziser eingebracht — siehe 4.7).

**Konflikt 5 — „Betrag anpassen" + abweichendes Fragment:**
Realität (Fragment) gewinnt immer. Prioritätskette: **Realität → Anpassung → Plan**.

**Konflikt 6 — Manuell bezahlt + Eject:**
`manually_paid` und `card_fragment_links` sind unabhängig. Eject entfernt nur den Link — `manually_paid` bleibt erhalten. Karte bleibt Bezahlt.

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

### Karussell (Mitte)

- Sortierung: Fixkosten → Einnahmen → Budget
- Navigation via Chevron-Klick
- Leerer Slot am Ende als Einstiegspunkt für neue Karten

**Leerer Slot — Weg 1 (Fragment-Drop):**
→ Recurrence-Popup: Beschreibung + Betrag + Datum (vorausgefüllt) + Karten-Typ-Auswahl + Frequenz (Monatlich / Quartalsweise / Halbjährlich / Jährlich / Einmalig) + Attribution (ICH / GEMEINSAM, falls Fixkosten oder Einnahme) + Abbrechen-Button

**Leerer Slot — Weg 2 (Direktklick):**
→ Overlay: Name + Betrag + Karten-Typ + Frequenz + Attribution. Gilt ab dem aktuell angezeigten Monat.

**Wichtig zur Frequenz „Einmalig":** Nach Bestätigung erzeugt sich die Karte mit `first_active_month = last_active_month = aktuell angezeigter Monat`. Sie verschwindet in Folgemonaten — kein UI-Lärm, keine Anzeige in zukünftigen Monaten.

### Fragment-Stack (Rechts)

- Vertikales Scrollen, Mausrad / Scrollbar (`3px`, dezent)
- Keine Chevrons
- Fragmente sind Drag-Quellen
- Zugeordnete Fragmente: `opacity: 0.22`, `pointer-events: none`
- Eject → Fragment kehrt in Stack zurück, wird wieder aktiv (sofortige Wirkung, kein Toast)

### Was explizit NICHT
- Kein Swipe, kein Long-Press
- Keine zwei Karussell-Reihen
- Kein „Drop & Distill"-Header
- Kein zweiter CSV-Import-Bereich
- Keine Chevrons im Fragment-Stack
- Kein Fragment-Drop auf Ghost Cards

---

## 9. Komponente: Sparraten-Treppe

### Funktion

Ersetzt die ursprüngliche Wellen-Visualisierung. Hintergrund-Element — trägt die strategische Jahresaussage.

### Visuelle Spezifikation

| Eigenschaft | Wert |
|---|---|
| Opacity Teal (Standard) | `0.50` |
| Opacity Grau (Standard) | `0.30` |
| Stroke-Width | `1.5px` |
| Dot-Radius normal | `2.5px` |
| Dot-Radius hover | `5px` |
| Nulllinie | `rgba(255,255,255,.08)`, `0.5px` |
| Vorjahres-Linie | `rgba(255,200,60,.3)`, `1px`, gestrichelt `[4,4]` |
| Vorjahres-Label | Nur Betrag (kein Jahresname) · `rgba(255,200,60,0.75)` |

**Jahresend-Labels:** Nur der Vorjahreswert erscheint rechts neben der gestrichelten Linie. Teal- und Grau-Treppe haben keine Jahresend-Labels (verhindert Überlagerungen).

### Berechnungslogik

Die Treppe ist die Summe der monatlichen Sparraten — und jede dieser monatlichen Sparraten wird durch dieselbe Funktion `calculate_sparrate_for_month(user_id, M)` berechnet (siehe Section 4). Das Verhalten unterscheidet sich automatisch nach Zeitraum, weil die Daten-Inputs sich unterscheiden:

- **Vergangene Monate (M < heute):** Karten-Status ist eingefroren. Offene Karten zählen mit Plan-Wert nach Modell α (siehe 2.3). Fragment-Summen sind final.
- **Aktueller Monat (M = heute):** Hybridsicht. Bisher Realisiertes ersetzt Plan, der Rest läuft mit Plan.
- **Zukünftige Monate (M > heute):** Keine Fragmente, keine Taps. Alle aktiven Karten zählen mit ihrem dann gültigen Planwert.

**Geplante kumulierte Sparrate (Grau-Treppe):**
```
Σ geplante Sparrate Januar bis Monat X
```

**Tatsächliche kumulierte Sparrate (Teal-Treppe, Standpunkt Monat M):**
```
Σ Sparrate von Januar bis Dezember
  — wobei für jeden Monat M' die Funktion calculate_sparrate_for_month(M') 
    automatisch das passende Verhalten liefert (Vergangenheit / Gegenwart / Forecast)
```

### Vorjahres-Referenzwert

| Aktives Jahr | Darstellung |
|---|---|
| Jahr X | Linie + Betrag = Jahresendwert Jahr X-1 |
| Jahr X-1 (Vergangenheit) | Linie + Betrag = Jahresendwert Jahr X-2 |
| Jahr X+1 (Zukunft) | Keine Linie, kein Betrag — Vorjahr nicht abgeschlossen |

Statisch innerhalb eines Kalenderjahres. Legende zeigt `Vorjahr [Jahr]` in Gold — kein Betrag in der Legende.

### Interaktion

**Hover:** Tooltip mit Monatsname · monatliche % (primär) · IST kumuliert · Plan kumuliert · Ereignis-Hinweis (⚠ in Gold wenn vorhanden)

**Klick (Teal-Punkt):** Kompakte Abweichungs-Erklärungszeile unter dem Chart — max. 3 Treiber. Zweiter Klick schließt.

**Treppe wird rot:** Ausschließlich wenn kumulierte Sparrate negativ — nicht bei einzelnem Defizitmonat.

**Ereignis-Annotation:** Ausreißer-Monate erhalten ⚠-Kreis (`rgba(255,200,60,.65)`, `1.5px`). Definition Ausreißer und Top-3-Abweichungstreiber: TBD (Analytics-Feature für V2 — in V1 nicht im Scope).

### Was explizit NICHT
- Keine zwei Wellen
- Kein Toggle %-Ansicht / kumulierte Ansicht
- Keine Forecast-Trennlinie im finalen Dashboard
- Kein permanentes Abweichungs-Label

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
| Beschreibung | `10px`, `font-weight: 500` | `rgba(255,255,255,.28)` · truncated |
| Datum | `9px` | `rgba(255,255,255,.15)` |
| Kategorie-Badge (nur 0.60–0.95) | `7.5px`, `font-weight: 600`, uppercase | Karten-spezifisch |

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

### 12.8 Sparraten-Treppe

| Kontext | Text |
|---|---|
| Legende — Teal-Treppe | `Tatsächlich kumuliert` |
| Legende — Grau-Treppe | `Geplant kumuliert` |
| Legende — Vorjahres-Referenz | `Vorjahr [Jahr]` |
| Tooltip — IST-Wert | `IST kumuliert` |
| Tooltip — Plan-Wert | `Plan kumuliert` |

---

## 13. Bekannte Limitationen V1

| Limitation | Workaround V1 | V2-Plan |
|---|---|---|
| Keine Periodenabgrenzung (Vorauszahlungen) | Betrag anpassen auf 0 €, nur diesen Monat | `transactionMonth` vs. `allocationMonth` über `card_fragment_links.month` |
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
9. **Sparraten-Treppe** — Berechnung über RPC-Schleife, Tooltip, Vorjahres-Logik, Ereignis-Annotation.

**Kritischer Pfad:** Schritt 1 (Onboarding + Income) ist Voraussetzung für alles. Schritt 6 (Sparrate-Verifikation) ist die Grundlage für die finalen Komponenten.

**Test-Case für Schritt 6:** Das Rechenbeispiel aus 4.6 muss exakt `2.910,01 €` als Sparrate liefern, wenn die dort beschriebenen Daten in der DB stehen. Das ist der Standard-Sanity-Test.

---

*Design-Direktor + Architekt + Übersetzer | Antigravity Finance 1.0 | April 2026*
