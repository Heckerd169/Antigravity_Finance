# Sprint v2-06 — Review · B2 Abweichungs-Treiber

> **Datum:** 25. Juli 2026 · **Rolle:** Zentraler Arbeits-Agent V2 (PM + Architekt)
> **Briefing:** `V2/architekt_konzept_b2_treiber_heuristik.md` (E1/E2/E3 entschieden
> 24.07.2026; E4 „Rohmasse-Pseudo-Treiber" bleibt offene DD-Frage — **nicht** umgesetzt)
> **Branch:** `sprint/v2-06-b2-treiber`

---

## 1. Was gebaut wurde

Die Jahres-Welle sagte bisher nur, *dass* ein Monat vom Plan abweicht. Jetzt sagt
sie auch, *welche Karten* das treiben — Top-1 im Hover-Tooltip, Top-3 im
Popup-Monatsklick. Das §9-Display ist seit v2-02 spezifiziert und blieb
unverändert; ausgetauscht wurde ausschließlich die Datenquelle dahinter.

| Schicht | Änderung |
|---|---|
| DB | neue Lese-RPC `get_year_deviation_drivers(p_year, p_limit DEFAULT 3)` (additiv, read-only) |
| Wrapper | `getYearDeviationDrivers` in `src/lib/rpc.ts` (Throw-on-Error, LL-2) |
| Modul | `src/components/welle/drivers-stub.ts` → `drivers.ts` (UI-Vertrag identisch) |
| Loader | ein Jahres-Call parallel zu den Sparrate-Loops, eigener Fehler-Pfad |
| Typen | `WelleData.drivers`, `types.ts` um die RPC-Signatur ergänzt |

Keine UI-, CSS- oder Layout-Änderung. Keine Schema-Änderung (keine Tabelle,
Spalte, Index, Trigger, Enum berührt).

---

## 2. Heuristik + die zwei geschlossenen Spec-Lücken

```
delta := round( vorzeichen × anteil × ( calculate_card_amount_for_month(karte, M)
                                      − get_effective_plan_for_month(karte, M) ), 2)
         vorzeichen = +1 für INCOME, −1 für FIXED_COST/BUDGET
         anteil     = get_split_factor(M) bei GEMEINSAM, sonst 1
```

Das Konzept-Papier definiert `Δ = displayed − effective_plan` **roh**, beschreibt
die Vorzeichen-Semantik aber als „Δ < 0 = teurer/weniger Einnahme als geplant".
Für Kosten-Karten widersprechen sich beide Aussagen (mehr ausgegeben ⇒ rohes
Δ > 0, aber semantisch „schlechter"). Zweite Lücke: der Split-Anteil bei
GEMEINSAM ist im Papier nicht adressiert.

**User-Entscheid 25.07.2026 (vor der Implementierung eingeholt, LL-13/LL-20):**

1. `delta` = **Wirkung auf die Sparrate** — Minus heißt immer „Monat um diesen
   Betrag schlechter als geplant".
2. **GEMEINSAM zählt nur mit dem eigenen Anteil** — sonst wären gemeinsame Karten
   im `|delta|`-Ranking systematisch überbewertet.

**Folge — die Invariante:**

```
Σ delta(alle aktiven Karten, M) = calculate_sparrate_for_month(M)
                                − calculate_planned_sparrate_for_month(M)
```

Sie gilt per Konstruktion, weil beide Sparrate-RPCs über exakt dieselbe
Kartenmenge (gleicher Aktiv-Vorfilter + `is_card_active_in_month`), denselben
Split-Faktor und dieselben Typ-Vorzeichen aggregieren; `calculate_planned_…`
nutzt `COALESCE(adjusted, planned, 0)`, was für aktive Karten identisch zu
`get_effective_plan_for_month` ist. Die Treiber erklären damit **genau** die
IST/Plan-Differenz, die im selben Tooltip zwei Zeilen darüber steht — und die
Invariante ist zugleich der schärfste Regressions-Wächter für künftige Änderungen.

**Bewusste Entscheidungen:**

- Kein `cards.deleted_at`-Filter — identisch zu den Sparrate-RPCs, deren Kurve die
  Treiber erklären (§2.1). Papierkorb-Karten haben per Lösch-Gate weder Links noch
  States noch Vergangenheits-Plan ⇒ `delta = 0` ⇒ fallen ohnehin aus dem Ranking.
- Keine eigene Betragslogik (§7 Regel 1): ausschließlich Aufrufe der bestehenden
  §4.3-kompletten Basis-RPCs. Transfer-Fragmente sind dadurch transitiv ausgeschlossen.
- Ein Jahres-Call statt 12–62 Einzel-Calls (Konzept Option c) — bewusst gegen den
  RPC-Burst gebaut, der den ECONNRESET-Befund vom 24.07. ausgelöst hat.
- Signatur ohne `p_user_id` (auth.uid()-basiert, Hot-Path-Konvention) **plus**
  expliziter `cards.user_id`-Filter als Defense-in-Depth zusätzlich zu RLS.

---

## 3. Verifikation — Übungs-DB zuerst (V2-Gate)

Slot-Tausch nach Abmachung: „Rennrad-Trainer" tagsüber pausiert → Übungs-DB
`qyjuzzgqxowqiiwqcahd` reaktiviert → gearbeitet → zurückgetauscht + Trainer-Status
`ACTIVE_HEALTHY` verifiziert.

| # | Test | Ergebnis |
|---|---|---|
| T1 | Aufruf ohne Auth | ✅ `28000` |
| T2 | `p_year = 1800` | ✅ `22023` |
| T3 | `p_limit = 0` | ✅ `22023` |
| T4 | Unberührter Seed-Bestand | ✅ 12 Monate, 0 mit Treibern (korrekt — keine Abweichungen vorhanden) |
| T5 | FIXED_COST, Fragment 1.100 vs. Plan 1.000 | ✅ `delta = −100,00` |
| T6 | INCOME, Fragment 250 vs. Plan 200 | ✅ `delta = +50,00` |
| T7 | GEMEINSAM FIXED_COST, 300 vs. 200, Split 0,5 | ✅ `delta = −50,00`, `share = 0,5` |
| T8 | BUDGET abgeschlossen ohne Fragmente, Plan 150 | ✅ `delta = +150,00` |
| T9 | Ranking + Tiebreaker + `p_limit` 1/3/50 | ✅ `|delta|` absteigend; Gleichstand 50/50 alphabetisch (Einnahme vor Gemeinsam); Limits exakt |
| T9b | **Invariante** `Σ delta` vs. `IST − Plan` | ✅ `50,00 = 50,00` |
| T10 | Rückrollung + Anker + Fremd-Nutzer | ✅ 0 Fragmente/Links/States übrig, Anker `2.200,00` unverändert, fremde uid sieht 12 leere Monate |

Alle mutierenden Schritte liefen in **einer** per `RAISE` zurückgerollten
Transaktion (LL-18) — die Übungs-DB steht danach byte-gleich zum Init-2-Zustand.

---

## 4. Verifikation — Prod (streng lesend)

Keine daten-verändernden Tests. Migration additiv, danach:

- **12-Monats-Kurve vor/nach identisch:** 2025-01…12 je `4.037,11` · 2026-01…04
  `1.931,18` · 2026-05 `−86,77` · 2026-06 `4.589,53` · 2026-07…12 `1.931,18`.
- **Invariante in allen 12 Monaten 2026 erfüllt** (`Σ delta = IST − Plan`, jeweils `0,00`).
- **Kein Leerlauf:** der Funktions-Scope erfasst 19–31 aktive Karten pro Monat —
  die Null-Abweichungen sind echte Datenlage, kein stiller Filter-Bug.

**Ehrlicher Daten-Hinweis (deckt sich mit Konzept §5):** live sind derzeit **alle**
Δ = 0 (nur 4 Links, davon 3 delta-neutrale Auto-Absorbs). Der Tooltip zeigt
überall „Keine Abweichungen" — korrektes Verhalten. Die Anzeige wird mit der
Kuratierung von selbst lebendig; ein User-Browser-Smoke ist erst nach dem ersten
kuratierten Monat aussagekräftig.

---

## 5. Frontend-Verifikation

- `tsc --noEmit` → 0 Fehler
- Lint → 0 Fehler / 0 Warnungen (58 Dateien)
- `pnpm build` → 0 Fehler; Route `/` 29,2 kB · First Load 181 kB
- `pnpm test:visual` → 3/3 grün (§9-Pixel-Checks unberührt)
- Modul-Check gegen die **echte** RPC-Antwort aus T5–T9: Labels
  `Seed-Budget +150,00 €` · `Seed-Fixkosten −100,00 €` · `Seed-Einnahme +50,00 €`,
  Leer-Monat → „Keine Abweichungen" (gedimmt), `null` → „Treiber nicht verfügbar",
  Müll-Eingabe → leere Map (defensiver Parser).

**Fehler-Isolation:** der Treiber-Call hat im Loader einen eigenen `catch`. Fällt
er aus, rendert die Welle vollständig weiter und der Tooltip sagt ehrlich
„Treiber nicht verfügbar" — statt die ganze Kurve mitzureißen.

**Umgebungs-Notiz (kein Code-Problem):** im Arbeits-Zweig unter
`.claude/worktrees/` bricht `pnpm lint` mit einem ESLint-Plugin-Konflikt ab, weil
die Eltern-Konfiguration des Hauptordners mitgeladen wird; ohne
Konfigurations-Kaskade läuft derselbe Lauf sauber durch. Auf `main` tritt das
nicht auf.

---

## 6. Akzeptanz gegen das Konzept-Papier

| Punkt | Status |
|---|---|
| E1 Heuristik Δ = displayed − effective_plan, Ranking `|Δ|` | ✅ umgesetzt, Vorzeichen + Anteil per User-Entscheid geschärft (§2) |
| E2 Datenpfad Jahres-RPC Option (c) | ✅ ein Call speist Tooltip + Popup |
| E3 Sequenz: Test-Projekt zuerst, dann Live | ✅ T1–T10 auf der Übungs-DB vor Prod |
| E4 Rohmasse-Pseudo-Treiber | ⊘ bewusst **nicht** umgesetzt — bleibt DD-Frage |
| UI-Kontrakt `DriverEntry` unverändert | ✅ nur Datenquelle getauscht, kein UI-Diff |
| Leer-Wording „Keine Abweichungen" | ✅ als Vorschlag umgesetzt, DD-Feinschliff offen |

---

## 7. Offene Punkte

- **DD-Feinschliff:** Label-Format (`{Karte} {±Betrag} €`), Leer-Wording, und die
  E4-Entscheidung (Rohmasse-Pseudo-Treiber „n € unzugeordnet in M").
- **Karten-Rückdatierung 2025** weiterhin offen (blockiert die 2025-Kuratierung).
- **Kuratierung 2026** beim User — davon hängt ab, wann B2 sichtbar etwas zeigt.
- `net_estimation_brackets`-Seed der Übungs-DB weiterhin leer (unverändert).
