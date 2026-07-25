# Sprint v2-06 — Doku-Patches (LL-16)

> **Von:** Zentraler Arbeits-Agent V2 (PM+Architekt) · **Datum:** 25. Juli 2026
> **Betrifft:** `antigravity_finance_schema_summary.md` (v3.3 → v3.4) · `CLAUDE.md`
> **Nicht betroffen:** Design-Doku — das §9-Display (Top-1 Tooltip / Top-3 Popup) ist
> seit v2-02 spezifiziert und unverändert; B2 tauscht nur die Datenquelle hinter dem
> bereits dokumentierten Display. Ein §9-Patch entsteht erst mit dem DD-Feinschliff
> (Label-Format, Leer-Wording, E4-Rohmasse-Pseudo-Treiber).

---

## Patch 1 — Schema-Doku, Header-Block

**Anker:** `**Version:** 3.3`

**Patch-Satz:**

```
**Version:** 3.4
**Status:** Datenbankseitig vollständig implementiert (Sprint 0–9 + Pre-Sprint-10-Patches + Sprint v2-04 Mehrkonten Stufe 1 + Sprint v2-05 Karten-Lebenszyklus + Sprint v2-06 B2-Treiber)
**Datum:** 25. Juli 2026
```

---

## Patch 2 — Schema-Doku, Änderungs-Liste

**Anker:** Ende des Blocks `**Änderungen v3.2 → v3.3 (Sprint v2-05 „Karten-Lebenszyklus"):**`

**Patch-Satz (neuer Block direkt danach einfügen):**

```
**Änderungen v3.3 → v3.4 (Sprint v2-06 „B2 Abweichungs-Treiber"):**

- 1 neue Lese-RPC: `get_year_deviation_drivers(p_year integer, p_limit integer DEFAULT 3)` — Top-N Abweichungs-Treiber je Monat eines Kalenderjahres, EIN Call für Welle-Tooltip (Top-1) und Popup (Top-3). Additiv, read-only, keine Schema- oder Daten-Änderung.
- Keine Tabellen-, Spalten-, Index-, Trigger- oder Enum-Änderung.
```

---

## Patch 3 — Schema-Doku, §4 Funktionen

**Anker:** Ende der Tabelle unter `### Im Hot-Path (bei jedem Render)`
(letzte Zeile `| get_split_factor(user_id, month) | … |`)

**Patch-Satz (neuer Abschnitt direkt nach der Hot-Path-Tabelle):**

```
### Bei der Jahres-Welle (Sprint v2-06)

| Funktion | Wofür | Returns |
|---|---|---|
| `get_year_deviation_drivers(p_year integer, p_limit integer DEFAULT 3)` | B2-Abweichungs-Treiber je Monat — EIN Call speist Welle-Tooltip (Top-1) und Popup-Monatsklick (Top-3). `STABLE`, `SECURITY INVOKER`, `SET search_path TO 'public'`, **ohne** `p_user_id` (auth.uid()-basiert, Hot-Path-Konvention) + expliziter `cards.user_id`-Filter als Defense-in-Depth. Auth-Pflicht 28000; `p_year` außerhalb 1900–2999 und `p_limit` außerhalb 1–50 → 22023 | `jsonb` |

**Return-Form** — immer genau 12 Einträge (auch ohne Treiber), aufsteigend nach Monat:

```jsonc
[{ "month_index": 0, "month": "2026-01-01",
   "drivers": [{ "card_id": "…", "card_name": "Tanken", "card_type": "BUDGET",
                 "attribution": "ICH", "ist": 187.20, "plan": 150.00,
                 "share": 1.000000, "delta": -37.20 }] }, …]
```

**Heuristik (Konzept-Papier E1 + User-Entscheid 25.07.2026):**

```
delta := round( vorzeichen × anteil × ( calculate_card_amount_for_month(karte, M)
                                      − get_effective_plan_for_month(karte, M) ), 2)
         vorzeichen = +1 für INCOME, −1 für FIXED_COST/BUDGET
         anteil     = get_split_factor(M) bei GEMEINSAM, sonst 1
```

- `delta` ist damit die **Wirkung auf die Sparrate**: negativ = der Monat ist um diesen Betrag schlechter als geplant. `ist`/`plan` bleiben die **rohen** Kartenwerte (wie auf der Karte sichtbar), `share` weist den angewandten Anteil aus.
- **Invariante:** `Σ delta(alle aktiven Karten, M) = calculate_sparrate_for_month(M) − calculate_planned_sparrate_for_month(M)`. Beide Sparrate-RPCs aggregieren über exakt dieselbe Kartenmenge, denselben Split-Faktor und dieselben Vorzeichen — die Treiber erklären also genau die IST/Plan-Differenz, die der Tooltip darüber ausweist. Auf der Übungs-DB und auf Prod (alle 12 Monate 2026) verifiziert.
- Ranking `|delta|` absteigend, Tiebreaker Kartenname aufsteigend (deterministisch, analog §11-Mehrfach-Match). `delta = 0` fällt raus; Monat ohne Abweichung → `"drivers": []`.
- **Keine eigene Betragslogik** (§7 Regel 1): ausschließlich Aufrufe der bestehenden §4.3-kompletten Basis-RPCs. Transfer-Fragmente sind dadurch transitiv ausgeschlossen.
- **Snapshot-Integrität §2.1:** KEIN `cards.deleted_at`-Filter — identisch zu den Sparrate-RPCs, deren Kurve die Treiber erklären. Papierkorb-Karten haben per Lösch-Gate weder Links noch States noch Vergangenheits-Plan → `delta = 0` → fallen ohnehin aus dem Ranking.
- **Sichtbarkeits-Grenze (bewusst, Konzept §2):** B2 sieht nur Karten-Realität. Unzugeordnete Rohmasse ist unsichtbar; die Qualität wächst mit der Kuratierung. E4 (Rohmasse-Pseudo-Treiber) bleibt offene DD-Frage und ist **nicht** umgesetzt.
```

---

## Patch 4 — CLAUDE.md §3 Dateistruktur

**Anker:** Zeile `│   ├── components/` … Block `│   │   └── treppe/`

**Patch-Satz:** unter `src/components/welle/` ergänzen (bzw. als Kommentar am Welle-Eintrag):

```
│   │   ├── welle/                                     ← Jahres-Welle §9 (v2-02); drivers.ts = B2-Heuristik-Anbindung (v2-06, ersetzt drivers-stub.ts)
```

**Anker:** Block `supabase/test_projekt/`

**Patch-Satz (Zeile ergänzen):**

```
├── supabase/migrations/                                ← 20260706_v2_04_… · 20260725_v2_06_b2_treiber.sql
```

---

## Patch 5 — CLAUDE.md §6 Schema-Referenz

**Anker:** Ende des Blocks `**Wichtige Schema-Befunde aus Sprint v2-05 (Karten-Lebenszyklus):**`

**Patch-Satz (neuer Block direkt danach):**

```
**Wichtige Schema-Befunde aus Sprint v2-06 (B2 Abweichungs-Treiber):**
- Neue Lese-RPC `get_year_deviation_drivers(p_year integer, p_limit integer DEFAULT 3) RETURNS jsonb` (`STABLE`, `SECURITY INVOKER`, `SET search_path TO 'public'`): Top-N Abweichungs-Treiber je Monat eines Kalenderjahres, **ein** Call für Tooltip (Top-1) und Popup (Top-3). Signatur **ohne** `p_user_id` (auth.uid()-basiert) — erste Nicht-Lebenszyklus-RPC dieser Konvention; zusätzlich expliziter `cards.user_id`-Filter (Defense-in-Depth). Auth-Pflicht 28000, Range-Validierung 22023 (`p_year` 1900–2999, `p_limit` 1–50).
- `delta` = **Wirkung auf die Sparrate** (User-Entscheid 25.07.2026): `round(vorzeichen × anteil × (calculate_card_amount_for_month − get_effective_plan_for_month), 2)`, `vorzeichen` = +1 INCOME / −1 FIXED_COST+BUDGET, `anteil` = `get_split_factor` bei GEMEINSAM sonst 1. `ist`/`plan` im Return bleiben roh (Karten-Sicht), `share` weist den Anteil aus.
- **Invariante (verifiziert Übungs-DB + Prod):** `Σ delta = Ist-Sparrate − Plan-Sparrate` pro Monat — beide Sparrate-RPCs nutzen dieselbe Kartenmenge, denselben Split und dieselben Vorzeichen. Ein Auseinanderlaufen dieser Invariante ist der erste Verdacht bei künftigen Treiber-Bugs.
- Kein Schema-Eingriff: keine Tabelle/Spalte/Index/Trigger/Enum berührt. Migration `v2_06_b2_treiber` zuerst auf der Übungs-DB `qyjuzzgqxowqiiwqcahd` geprobt (T1–T10 grün, Anker 2.200,00 unverändert), dann identisch auf Prod `nflkobdfdhncrtjncpmq` (12-Monats-Kurve 2025+2026 exakt unverändert).
```

---

## Patch 6 — CLAUDE.md §4 Sprint-Protokoll V2

**Anker:** letzte Zeile der Tabelle „Sprint-Protokoll V2" (`| v2-05 | Karten-Lebenszyklus … |`)

**Patch-Satz (neue Zeile):**

```
| v2-06 | B2 Abweichungs-Treiber (Jahres-RPC + Modul-Tausch) | 🟢 Done | V2/architekt_konzept_b2_treiber_heuristik.md (Konzept-Papier = Briefing) | 25.07.2026 |
```

---

## Patch 7 — CLAUDE.md §10 Übergabe-Log

**Anker:** Ende der Datei (nach dem Block „2025er-Import + Einkommens-Historie · 25. Juli 2026")

**Patch-Satz:** siehe eigener Abschnitt „Sprint v2-06" — Volltext im Review
`sprints/sprint_v2-06_review.md` §7, vom PM 1:1 übernehmbar.
