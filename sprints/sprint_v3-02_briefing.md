# Sprint v3-02 — Briefing

> **`/mobil` — Tab „Zuordnen": Zahlungen zuordnen ohne Ziehen**
> Branch `sprint/v3-02-mobil` · Basis `884360c` (Stand von PR #56) · 07. September 2026
> Datenbank: **ja** — eine neue, rein lesende Funktion (Fähigkeit `db-eingriff`, vollständig).
> Rechenfunktionen: **unangetastet.** Plan freigegeben am 07.09.2026.

---

## 1. Warum dieser Sprint

Der Design-Record vom 07.09.2026 (`V2/design_direktor_2026-09-07_mobil.md`, Handoff-Paket
unter `design-system/handoff/mobile/`) ist entschieden: eine eigene Route `/mobil` mit
430 px Breite, vier Tabs, Kern ist **Zuordnen ohne Ziehen** — eine Buchung im Fokus, der
Vorschlag als einziger gefüllter Knopf, der Zweifelsfall als gleichrangige Konturen, die
Konsequenz erst danach im Toast. Vorschlag 1a; Kartenliste (1b) und Wischen (1c) verworfen.

**Zwei Rückfragen, beide beantwortet:**

| Frage | Entscheidung |
|---|---|
| Sprint-Schnitt | **Zuordnen zuerst.** v3-02 = Rahmen + Tab-Leiste + Tab Zuordnen vollständig. Übersicht · Karten · Verlauf folgen als v3-03 |
| Wo entsteht „auf welchen Karten lag dieser Händler bisher von Hand"? | **Lese-Funktion in der Datenbank** — ein Aufruf je Aufbau für den ganzen Stapel |

## 2. Ziel, Nicht-Ziel, Prüfanker

**Ziel (ein Satz):** Auf dem Handy lässt sich jede offene Zahlung eines Monats mit einem
Tipp der vorgeschlagenen Karte zuordnen — im Zweifel aus zwei bis drei Kandidaten, sonst
über ein Karten-Sheet — und der Toast sagt danach, was es mit der Sparrate gemacht hat.

**Nicht-Ziel — ausdrücklich nicht angefasst:**

- kein Responsive-Umbau der Schreibtisch-Ansicht
- keine Kartenanlage auf `/mobil`
- keine Swipe- oder Long-Press-Geste (1c verworfen)
- keine Änderung an einer Rechenfunktion, an `history_match` oder `calculate_match_confidence`
- Übersicht · Karten · Verlauf (v3-03), Light-Mode-Umschalter (`RD-5`), Kartenmenü `M2`

**Prüfanker (regel-basiert, LL-19):**

- **Die Eingriffe bewegen keine Zahl.** Sparrate Ist **und** Plan, 24 Monate 2025 + 2026,
  vorher/nachher der Migration byte-identisch; alle neun Prüfsummen der Rechenfunktionen
  unverändert (die Migration legt nur eine neue Funktion an). Anker 1 und 2 in 24/24.
  Übungs-DB 2.200,00 € vor und nach der Probe. Protokoll: `sprints/sprint_v3-02_anker.md`.
- **Die Benutzung bewegt Zahlen, und zwar genau so:** Toast-Δ = `calculate_sparrate_for_month`
  nachher − vorher (beide Werte aus der RPC, einmal gerundet → exakte Cent). Rückgängig →
  exakt der Vorher-Wert.
- **Eine Zuordnung per `/mobil` ist in der Datenbank von einer Schreibtisch-Zuordnung
  ununterscheidbar:** `origin = MANUAL_DROP`, `month` = angezeigter Monat (§6 Stolperfalle 6).
  Nur so lernt `history_match` daraus.
- **Anker 3:** Anfragen je Aufbau von `/mobil/zuordnen` ≤ 10 (Schreibtisch: ~18).

## 3. Was nachgesehen wurde — die Fakten, die den Plan tragen

| Fakt (07.09.2026) | Folge |
|---|---|
| Produktion, alle Monate 2026: **0 offene Zahlungen** (September: 15 Buchungen, 22 aktive Karten, Sparrate 1.613,11 €, Plan 1.695,09 €) | Auf Produktion ist heute nur der Zustand „leer" sichtbar. Abnahme über S13 (lösen → am Handy zuordnen) |
| **476 offene Zahlungen liegen in 2023–2024** (567 Zeilen, 91 Überträge) — kein Vorschlag, keine Karte aktiv. Bei 121 davon liegt der Händler auf 2–3 Karten | Mehrdeutig ist real (~25 %). Diese Monate liegen **vor** der Navigationsgrenze (früheste Karte 2025-01, `deriveMinNavigableYm`) und sind auf `/mobil` nicht erreichbar — wie am Schreibtisch |
| `history_match` Stufe 1 **ist** die Kandidaten-Regel: `merchant_key`, `origin = MANUAL_DROP`, kein Übertrag, nicht das Fragment selbst. Höchstens 39 manuelle Links je Händler, 1.065 insgesamt | Die neue Funktion formuliert genau diese Regel; die Konsistenz wird im Trockenlauf belegt (T7) |
| Tokens: alle Farb-, Flächen-, Rand-, Radius- und Schrift-Namen aus `design-system/styles.css` existieren in `src/styles/tokens.css`. **Sechs Typo-Namen nicht** (`--typo-label-*`, `--typo-caption-*`; die App nennt sie `label-small`/`label-meta`). `--on-accent` (Text auf Türkis) gibt es nur in der App | Farben, Flächen, Ränder, Radien, Schrift: **ausschließlich Tokens.** Die elf Typo-Stufen des Handoffs (sechs davon ohne Token in **beiden** Dateien) als px in der Modul-CSS, mit Verweis auf die README-Stufe |
| Wiederverwendet | `linkFragmentToCard` / `ejectFragment` (Logik wandert in `src/lib/card-links.ts`, beide Aufrufer nutzen sie) · `istVorschlagSichtbar` (`lib/suggestion.ts`) · `months.ts` · `format.ts` · `getCardsForMonth`, `calculateSparrateForMonth` (`lib/rpc.ts`) · `card-state.ts` · `isLinkedToCard` / `isTransferFragment` |
| **Die View `fragments_with_status` umgeht RLS** — sie gehört `postgres` (BYPASSRLS) und hat kein `security_invoker`. Gemessen am 07.09.2026 als Rolle `authenticated` mit fremder Nutzer-ID: View 2.219 Zeilen, Tabellen 0 | Heute ohne Wirkung (ein Nutzer), aber ein echtes Loch. **Freigegeben am 07.09.2026:** zweite Migration `20260907_v3_02_view_security_invoker.sql` (eine Zeile, `ALTER VIEW … SET (security_invoker = true)`), im selben Slot-Fenster geprobt (Testreihe V1–V4), zusammen mit der Kandidaten-Funktion nach Freigabe auf Produktion |
| CLAUDE.md §1 „Mobile ist NICHT im Scope", §7 „Keine Mobile-Anpassungen" | Widerspruch zum Beschluss. Gebaut wird nach dem Beschluss; Patch von §1/§7/§9 am Sprint-Ende über `claude-md-pflege`, mit Freigabe des Users |

## 4. Zustandsmodell der Zuordnen-Fläche

Je Fokus-Zahlung: **K** = Karten (aktiv im angezeigten Monat), auf denen derselbe Händler
von Hand liegt, jeweils mit Zähler. Reine Funktion in `zustand.ts`, Wächter
`tests/e2e/mobil-zuordnen.spec.ts`.

| Zustand | Bedingung | Anzeige |
|---|---|---|
| **mehrdeutig** | \|K\| ≥ 2 | Konturen ohne Vorbelegung — auch wenn die Datenbank einen Vorschlag trägt (`ZO-8`); Übernehmen gesperrt bis Wahl |
| **normal** | sonst, und Vorschlag sichtbar (`istVorschlagSichtbar`, Schwelle aus `app_config`) | „VORSCHLAG · N × SO ZUGEORDNET" (N = Zähler der Karte in K), **ein** gefüllter Knopf |
| **kein Vorschlag** | sonst | im Handoff nicht definiert → Annahme A1 |
| **leer** | Stapel leer | Forecast (Monat > laufend) → „Noch keine Umsätze"; sonst „Alles zugeordnet" mit Sparrate |
| **offline** | `navigator.onLine === false` | Pille „Stand von HH:MM · offline", Schreibknöpfe Opacity .4 ohne Handler, „Später" bleibt |

Toast-Zeile aus dem echten Δ: Δ < 0 → rot „Sparrate {Monat} −X,XX €" · Δ = 0 → „Sparrate
unverändert · im Plan" (Einnahmen-Karte: „Einnahme · im Plan") · Δ > 0 → Annahme A2.

## 5. Phasen — ein Commit je Phase, N+1 erst nach grünem N

| # | Was | Dateien | DB |
|---|---|---|---|
| **P0 Rahmen** | Branch · Handoff-Paket committen (ohne `.DS_Store`) · Record nach `V2/` · Roadmap Paket 20 · diese Datei | `design-system/handoff/mobile/`, `V2/`, `sprints/` | nein |
| **P1 Lese-Funktion + View-Fix** | **Zwei Migrationen im selben Slot-Fenster.** ① `get_open_fragment_candidates(p_user_id, p_month)` → `(fragment_id, card_id, treffer)`, nur Karten aktiv im Monat (`is_card_active_in_month` **aufgerufen**), `STABLE`, `SECURITY INVOKER`, `SET search_path`. Dann `types.ts` neu + Namensmengen-Vergleich, Wrapper `getOpenFragmentCandidates`. ② `ALTER VIEW fragments_with_status SET (security_invoker = true)` — Befund aus §3, Testreihe V1–V4 vorher/nachher | `supabase/migrations/20260907_v3_02_mobil_kandidaten.sql`, `supabase/migrations/20260907_v3_02_view_security_invoker.sql`, `src/lib/supabase/types.ts`, `src/lib/rpc.ts` | **ja** |
| **P2 Route + Zuordnen lesen** | `src/app/mobil/layout.tsx` (430 px zentriert, Safe Areas über `env(safe-area-inset-*)`, `viewport-fit=cover`, Meta für „Zum Home-Bildschirm") · `page.tsx` → Umleitung auf `/mobil/zuordnen` (bis v3-03) · `zuordnen/page.tsx` (Server: Wächter wie `app/page.tsx`, Monat aus `?month=`, Sparrate, Stapel, Kandidaten, Karten, Schwelle, Nachbar-Zähler) · Tab-Leiste mit Badge · Kopf, Stapel-Vorschau, Monatsnavigation, Fokus-Karte, Aktionsfläche **normal + leer** · `zustand.ts` · Wächter + Eintrag in `playwright.config.ts` · Render-Smoke 430 × 932 (Preset „iPhone 15 Pro Max", eigenes Projekt) | `src/app/mobil/**`, `src/components/mobil/**`, `tests/e2e/` | nein |
| **P3 Schreiben** | Übernehmen → Server Action (Link `MANUAL_DROP`, Monat = angezeigt; Sparrate vorher/nachher → Δ) · Toast mit Rückgängig (5 s) · „Später" · `revalidatePath("/mobil/zuordnen")`; der Toast lebt in einer Client-Hülle, die den Neuaufbau überlebt (Muster `CardActionToastProvider`) | `src/app/mobil/zuordnen/actions.ts`, `src/lib/card-links.ts` | nein |
| **P4 Mehrdeutig + kein Vorschlag** | Kandidaten-Konturen, Auswahl/Abwahl, gesperrter Knopf, „Übernehmen · {Karte}"; Zustand „kein Vorschlag" nach A1 | `zuordnen/`, `zustand.ts`, Wächter | nein |
| **P5 Sheet** | Scrim, Sheet, Gruppen Fixkosten · Budget · Einmalig · Einnahmen (benanntes Prädikat, Vollständigkeits-Test über alle (Typ, Rhythmus)), rechte Spalte aus `card-state.ts` / `effectivePlan` | `karten-sheet.tsx`, `gruppen.ts` | nein |
| **P6 Offline** | `online`/`offline`-Ereignisse, Pille mit Ladezeit, Sperre, Hinweiszeile | `offline.ts`, `zuordnen/` | nein |
| **P7 Abschluss** | `sprint-abschluss`: Prüfstrecke, Review, Historie, Roadmap, Schema-Doku §4 (neue RPC) + Design-Doku-Verweis (`docs-maintainer`), **CLAUDE.md-Patch §1/§7/§9 als Vorschlag** (`claude-md-pflege`, Datei bei 94 % ihrer Grenze → zeilenneutral), `design-system/SYNC.md`, Push, PR | Doku | nein |

**Netzrunden je Aufbau (P2):** Anmeldung 1 · `profiles` 1 · Sparrate 1 · Stapel 1 ·
Kandidaten 1 · Karten (Tabelle) 1 · `get_cards_for_month` 1 · `app_config` 1 ·
Nachbar-Zähler 2 = **10**.

### P1 im Detail (Fähigkeit `db-eingriff`)

1. Anker vorher: Produktion 24 Monate Ist + Plan (2025 + 2026), neun Prüfsummen — ins
   Anker-Protokoll.
2. Slot-Tausch **tagsüber**: Rennrad-Trainer pausieren → Übungs-DB restoren → auf
   `ACTIVE_HEALTHY` warten → Anker 2.200,00 € prüfen.
3. Migration wortgleich einspielen. Testreihe in **einer zurückgerollten Transaktion** (der
   Seed hat keine Zahlungen — die Reihe legt sie selbst an), unter
   `SET LOCAL ROLE authenticated` (LL-42):
   **T1** ohne Session → leer, kein Fehler · **T2** Monat ohne offene → 0 Zeilen ·
   **T3** Händler auf einer Karte, 3 manuelle Links → 1 Zeile, `treffer = 3` ·
   **T4** Händler auf zwei Karten; `AUTO_ABSORBED`, Überträge und das Fragment selbst zählen
   **nicht** · **T5** Karte im Monat inaktiv → fällt raus · **T6** Fremd-Nutzer sieht nichts ·
   **T7** Konsistenz: für T3 liefert `history_match` 1,00 für genau diese Karte, für T4
   schweigt Stufe 1 · Anker unverändert. Dazu `EXPLAIN ANALYZE` unter der App-Rolle — der
   Index `idx_fragments_merchant_key_stored` muss greifen.
4. Migrationsdatei ablegen · **Freigabe des Users** · auf Produktion einspielen ·
   Prüfsummen Übung ↔ Produktion vergleichen · Anker nachher (identisch) · Rücktausch,
   Rennrad-Trainer auf `ACTIVE_HEALTHY`.

Wartet die Freigabe für Produktion, wird P2 ohne die Verdrahtung des Zählers
weitergebaut — der Kandidaten-Loader ist ohnehin fehlertolerant (fällt er aus, bleibt der
Zähler leer und die Seite steht; dieselbe Haltung wie `categoryAmounts` in `app/page.tsx`).

## 6. Prüfschritte

| # | Schritt | Erwartung | Quelle |
|---|---|---|---|
| S1 | `/mobil/zuordnen` nicht angemeldet | Umleitung auf `/login` (Middleware unverändert) | CLAUDE.md §4 |
| S2 | Monat ohne offene Zahlungen (heute: jeder Monat 2026) | „Alles zugeordnet · Sparrate {Monat} steht bei {Betrag}", Betrag = `calculate_sparrate_for_month` | Handoff §1 leer |
| S3 | Monat > laufend | „Noch keine Umsätze", Pille „Forecast"; Nachbar-Unterzeile zeigt das Pillenwort | Handoff §1 |
| S4 | Zahlung mit sichtbarem Vorschlag, \|K\| ≤ 1 | „VORSCHLAG · N × SO ZUGEORDNET", **ein** gefüllter Knopf mit Kartenname; der 105-Zeichen-Name kürzt mit „…", der Knopf wächst nicht | Handoff §1, Record §2 |
| S5 | Übernehmen | Link `MANUAL_DROP`, `month` = angezeigter Monat; Toast „Zugeordnet · {Karte}" + Zeile aus echtem Δ, **rot nur bei Δ ≠ 0**; Stapel rückt nach, Badge −1, Kopf-Sparrate neu | Handoff §3, v3 Regel 2 |
| S6 | Rückgängig < 5 s | Link gelöscht, Sparrate exakt Vorher-Wert, Zahlung wieder vorn | Handoff §3 |
| S7 | Später | Zahlung ans Stapelende, Toast ohne Rückgängig, Zähler „{i} von {n}" läuft weiter | Handoff Regeln |
| S8 | \|K\| ≥ 2 | Konturen, nichts vorbelegt, Übernehmen Opacity .4 ohne Handler; nach Wahl „Übernehmen · {Karte}", erneutes Tippen hebt auf | Record #2 |
| S9 | Andere Karte … | Sheet: nur im Monat aktive Karten, Gruppen in Reihenfolge, rechte Spalte je Typ; Tap = zuordnen + Toast | Handoff §2, Record #7/#11 |
| S10 | Flugmodus | Pille „Stand von HH:MM · offline", Schreibknöpfe gesperrt, Später bleibt | Record #4 |
| S11 | `data-theme="light"` per DevTools | keine harte Farbe, gleiche Tokennamen | Handoff Light Mode |
| S12 | Edge-Log nach dem Smoke (Ingestion-Verzögerung beachten) | ≤ 10 Anfragen je Aufbau | CLAUDE.md §9 Anker 3 |
| S13 | **User:** drei September-Zahlungen am Schreibtisch lösen, am Handy per Tipp zuordnen | Sparrate danach exakt wie vor dem Lösen; die drei Link-Zeilen bis auf Zeitstempel identisch zu vorher | Prüfanker |

Wächter (LL-40): jeden neuen Test einmal absichtlich rot sehen, bevor er zählt.
Baseline aus v3-01: `test:visual` 191, `test:e2e` 200.

## 7. Annahmen — gelten, solange der User nicht widerspricht

| # | Lücke | Annahme |
|---|---|---|
| A1 | Zustand **kein Vorschlag** (kein sichtbarer Vorschlag, \|K\| = 0 — künftig z. B. das tote Band 0,50–0,60) fehlt im Handoff | Label „KEIN VORSCHLAG", kein gefüllter Knopf; „Andere Karte …" und „Später" wie sonst |
| A2 | Toast bei **Δ > 0** (Sparrate steigt, z. B. Fixkosten unter Plan) fehlt | dieselbe Zeile „Sparrate {Monat} +X,XX €" in `--color-teal` (v3: Türkis = über Plan) |
| A3 | Label bei **N = 0** (Vorschlag aus Händler-Regel oder Ähnlichkeit, nie von Hand so zugeordnet) | „VORSCHLAG · {Konfidenz} %" — wie das Schaufenster; Record-Offenpunkt „N × vs. %" bleibt offen (`MB-H1`) |
| A4 | „{i} von {n}" | wörtlich: n = alle Buchungen des Monats (ohne Überträge), i = zugeordnete + 1 — stabil über Neuaufbauten, kein Sitzungszustand |
| A5 | Text auf dem Türkis-Knopf | `--on-accent` (in der App vorhanden, in der Design-System-Kopie nicht; `--text-primary` wäre im Light Mode schwarz auf Türkis) |
| A6 | „Einmalig" ist kein Kartentyp | Ausgaben-Karte (Fixkosten/Budget) mit Rhythmus `ONCE`; einmalige Einnahmen bleiben bei „Einnahmen" — wie im Prototyp |
| A7 | Tabs Übersicht · Karten · Verlauf bis v3-03 | sichtbar in der Leiste, `--text-tertiary`, ohne Handler (Muster „ohne Nachbar") |
| A8 | Statusleiste/Signalbalken des Prototyps | wird nicht gezeichnet — das ist die echte iOS-Leiste (Home-Bildschirm-App) |
| A9 | Handoff-Paket inkl. sechs PNG (1,3 MB, Prototyp-Daten = Annahmen) | committet; die Token-Kopie unter `_ds/` liest die App nie (Hinweis bei `RD-2`) |

## 8. Nebenbefunde — nicht Teil des Sprints, kommen ins Review

- **567 Zahlungen aus 2023–2024 liegen in der Datenbank** (476 offen, 91 Überträge).
  CLAUDE.md §9 führt die Altjahre als „noch nicht importiert" — ein Teil ist drin. Gehört
  zu Hausaufgabe `V1`.
- `tests/e2e/doku-vollstaendigkeit.spec.ts` erkennt nur `v2-NN`-Reviews; v3-01 und v3-02
  laufen an ihm vorbei. Eigener Nachzug — die Nummernfolge-Prüfung braucht dabei Sorgfalt.
- Namensdrift `design-system/styles.css` ↔ `src/styles/tokens.css` (sechs Typo-Namen,
  `--on-accent`) — die konkrete Gestalt von `RD-2`.

**Briefing-Datei: ja** — drei der vier Kriterien treffen zu (Datenbank berührt, mehr als
drei Phasen, mehrere Sitzungen).
