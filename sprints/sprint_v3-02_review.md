# Sprint v3-02 — Review

> Branch `sprint/v3-02-mobil` · sechs Code-Commits (P0–P6) + Doku-Commit · 07. September
> 2026 · **Die Route `/mobil` mit dem Tab „Zuordnen": eine Buchung im Fokus, ein Tipp auf
> den Vorschlag, der Toast sagt danach, was es mit der Sparrate gemacht hat — und die
> Zuordnung ist in der Datenbank von einer vom Schreibtisch ununterscheidbar.**
>
> Briefing: `sprints/sprint_v3-02_briefing.md` · Anker-Protokoll: `sprints/sprint_v3-02_anker.md`
> · Design-Record: `V2/design_direktor_2026-09-07_mobil.md` · Handoff:
> `design-system/handoff/mobile/README.md`.

## 1. Was gebaut wurde

| Phase | Absicht | Lösungsweg | Dateien |
|---|---|---|---|
| **P0** | Der Sprint steht im Repo, bevor er beginnt | Handoff-Paket committet, Design-Record nach `V2/` (Ablage-Regel §3), Roadmap **Paket 20** mit `MB-1`…`MB-6` und drei Hausaufgaben, Briefing mit Ziel · Nicht-Ziel · Prüfanker · Zustandsmodell · Annahmen A1–A9 | `design-system/handoff/mobile/`, `V2/design_direktor_2026-09-07_mobil.md`, `V2/v2_roadmap_konsolidiert.md`, `sprints/sprint_v3-02_briefing.md` |
| **P1** | Die Datenbank sagt, auf welchen Karten ein Händler von Hand lag | Rein lesende Funktion `get_open_fragment_candidates(p_user_id, p_month)` — dieselbe Regel wie `history_match` Stufe 1, als Liste mit Zähler, nur Karten aktiv im Monat (`is_card_active_in_month` **aufgerufen**). Probe auf der Übungs-DB (Testreihe T1–T7, V1–V4), Produktion nach Freigabe, Prüfsumme `c48042ff…` auf beiden Projekten. **Dazu der View-Fix:** `fragments_with_status SET (security_invoker = true)`. Typen neu erzeugt, Wrapper in `lib/rpc.ts` | `supabase/migrations/20260907_v3_02_mobil_kandidaten.sql`, `…_view_security_invoker.sql`, `src/lib/supabase/types.ts`, `src/lib/rpc.ts` |
| **P2** | Die Route und der Tab, lesend | `src/app/mobil/` (Layout mit Safe Areas und Home-Bildschirm-Meta, Umleitung, Server-Lader mit elf Netzrunden), Tab-Leiste mit Badge, Bildschirm mit Kopf · Stapel-Vorschau · Monatsnavigation · Fokus-Karte · Aktionsfläche (normal, leer). Regeln importfrei in `zustand.ts`; Buchungstext → Empfänger/Zweck in `lib/description.ts` | `src/app/mobil/**`, `src/components/mobil/**`, `src/lib/description.ts`, `tests/e2e/mobil-zuordnen.spec.ts`, `tests/e2e/render-smoke-mobil.spec.ts`, `playwright.config.ts` |
| **P3** | Übernehmen schreibt, der Toast sagt die Folge | Gemeinsame Schreibregel `lib/card-links.ts` (Schreibtisch und Handy rufen sie), Server Actions mit Sparrate **vorher/nachher** aus der RPC, Toast mit Rückgängig (5 s), „Später" lokal | `src/lib/card-links.ts`, `src/components/interaction-zone/actions.ts`, `src/app/mobil/zuordnen/actions.ts`, `toast.tsx` |
| **P4 + P5** | Zweifelsfall und Sheet | Kandidaten als Konturen ohne Vorbelegung, Übernehmen gesperrt bis zur Wahl; Sheet „Karte wählen" mit vier Gruppen (`gruppen.ts`, Vollständigkeits-Wächter), rechte Spalte aus `card-state.ts` | `karten-sheet.tsx`, `gruppen.ts`, `index.tsx`, `page.tsx` |
| **P6** | Offline | `navigator.onLine` plus Ereignisse, neutrale Pille mit Uhrzeit des letzten Aufbaus, Schreibknöpfe gesperrt, „Später" bleibt | `use-online.ts`, `index.tsx` |

**Nicht gebaut, wie geplant:** Übersicht · Karten · Verlauf (`MB-6`, Sprint v3-03).
Bis dahin führt `/mobil` auf den Tab Zuordnen; die drei Tabs stehen in der Leiste ohne
Ziel (Briefing A7).

## 2. Prüfstrecke

| | Ergebnis |
|---|---|
| `tsc --noEmit` | **0 Fehler** |
| ESLint (Aufruf der Fähigkeit, roh) | **0 Fehler / 0 Warnungen** |
| `pnpm build` | **0 Fehler** · Route `/` **31,9 kB** (unverändert) · `/mobil/zuordnen` **6,28 kB**, First Load **102 kB** · `/mobil` 138 B · Middleware 82,1 kB |
| `pnpm test:visual` | **221 / 221** |
| `pnpm test:e2e` | **234 / 234** — setup 1 · visual 221 · unauth 3 · render-smoke 6 · **render-smoke-mobil 3** |

**Gegen das letzte Review (v3-01: visual 191, e2e 200):** visual **+30**, e2e **+34** — exakt
die 30 Wächter in `mobil-zuordnen.spec.ts`, der Unauth-Wächter für `/mobil/zuordnen` und
die drei Render-Smoke-Prüfungen bei 430 × 932. Keine Zahl ist gesunken.

**LL-40, einmal rot gesehen:** Die Regel „zwei Kandidaten schlagen den Vorschlag" wurde
absichtlich umgedreht — genau ein Test wurde rot (`zwei Kandidaten → mehrdeutig, auch wenn
die Datenbank einen Vorschlag trägt`), 25 blieben grün. Datei wiederhergestellt,
byte-identisch.

> **Ein Werkzeug-Befund am Rande:** Der ESLint-Aufruf der Fähigkeit meldete `exit=1` mit
> „No issues found" — das war der Ausgabefilter (RTK), nicht ESLint. Der Rohlauf
> (`rtk proxy …`) liefert Exit 0 und keine Zeile. Dieselbe Klasse wie
> „PASS (0)" aus v3-01: Der Exit-Code ist vom Filter, das Ergebnis nicht.

## 3. Anker vorher/nachher

Vollständig in `sprints/sprint_v3-02_anker.md`. Kurzfassung:

| Anker | Vorher (17:50) | Nachher (18:48) | Ende des Sprints (21:00) |
|---|---|---|---|
| Sparrate Ist + Plan, 24 Monate | gemessen | **24/24 byte-identisch** | **24/24 byte-identisch** |
| Anker 1 (Σ Ordner = Sparrate) | 0,00 € in 24/24 | 0,00 € in 24/24 | — |
| Anker 2 (Σ delta = Ist − Plan) | 0,00 € in 24/24 | 0,00 € in 24/24 | — |
| neun Prüfsummen der Rechenfunktionen | identisch zu v2-31 | **unverändert** | — |
| `get_open_fragment_candidates` Übung ↔ Prod | — | **`c48042ff…` = `c48042ff…`** | — |
| Übungs-DB, März | 2.200,00 € | 2.200,00 € | — |
| **Anker 3** (Anfragen je Aufbau, Edge-Log) | Schreibtisch ~18 | — | **`/mobil/zuordnen`: 11** — 15 Aufbauten in 45 Minuten, je Pfad nachgerechnet (`calculate_sparrate_for_month` 15 · `get_open_fragment_candidates` 15 · `fragments_with_status` 4 je Aufbau) |

**Der Eingriff hat keine Zahl bewegt.** Die Benutzung wird es tun — genau so, wie es der
Toast anzeigt (Prüfschritt S13).

**Zwei Befunde aus der Probe, beide belegt:**

- **Die View `fragments_with_status` umging RLS.** Als Rolle `authenticated` mit fremder
  Nutzer-ID: View **2.219** Zeilen, Tabellen 0. Nach `security_invoker = true`: 0 / 0, der
  Eigentümer unverändert 2.219. Auf Übungs-DB (V1–V4) und Produktion geprüft.
- **Die Übungs-DB stand bei v2-26.** Sieben Schema-Migrationen fehlten (v2-22, v2-24 P3/P4,
  v2-28 P3a, v2-29, v2-30, v2-31); der erste Testlauf brach an der fehlenden Spalte
  `merchant_key` ab. Wortgleich nachgeholt; danach 8 der 9 Rechenfunktionen byte-gleich mit
  Produktion. **Vier Lesefunktionen bleiben verschieden, obwohl sie aus derselben
  Repo-Datei stammen** (`get_year_deviation_drivers`, `get_cards_for_month`,
  `get_sparrate_series`, `merchant_rule_match`) — die Migrationsdateien im Repo sind für
  diese vier nicht mehr wortgleich mit Produktion. Offen, siehe §6.

## 4. Selbst-Review gegen die Prüfschritte

| # | Schritt | erfüllt | Beleg |
|---|---|---|---|
| S1 | unangemeldet → `/login` | ✅ | `unauth.spec.ts`, dritter Test |
| S2 | Monat ohne offene Zahlungen | ✅ | Render-Smoke-Bild `test-results/mobil-zuordnen.png`: „Alles zugeordnet · Sparrate September steht bei 1.613,11 €"; „alle 14 zugeordnet" — 14, nicht 15, weil ein Übertrag richtig nicht zählt |
| S3 | Forecast-Monat | ✅ (Logik) | `leerText`, `nachbarUnterzeile` im Wächter; Nachbar „Oktober · Forecast" im Bild |
| S4 | normal: Label, ein gefüllter Knopf, 105-Zeichen-Name kürzt | ✅ (Logik + CSS) | `vorschlagsLabel`, `.uebernehmenName` `nowrap` + `ellipsis`, Knopf `height: 52px` fest — **kein Produktionsbeleg**: heute keine offene Zahlung in 2026 |
| S5 | Übernehmen → Link `MANUAL_DROP`, Monat = angezeigt, Toast aus echtem Δ | ✅ (Code) | `lib/card-links.ts` (`origin: "MANUAL_DROP"`), `actions.ts` (Sparrate vorher/nachher), `toastZeile` im Wächter — **live erst in S13** |
| S6 | Rückgängig | ✅ (Code) | `rueckgaengigAction` → `deleteCardLink`; live in S13 |
| S7 | Später | ✅ | `stapelReihenfolge` im Wächter (drei Fälle), Toast ohne Rückgängig |
| S8 | Zweifelsfall | ✅ (Logik + Code) | `bestimmeZustand` (fünf Fälle), `aria-pressed`, `uebernehmenGesperrt` bis zur Wahl |
| S9 | Sheet | ✅ (Logik + Code) | `kartenGruppe` (15 Kombinationen), rechte Spalte aus `card-state.ts` |
| S10 | Offline | ✅ (Code) | `use-online.ts`, `offlinePille`/`offlineHinweis` im Wächter; Sperre ohne Handler |
| S11 | Light Mode | 🟡 | keine harte Farbe außer Scrim/Schatten (Deckkraft-Angaben wie am Schreibtisch); **nicht gegen `farben.html` abgenommen** (`MB-H3`, hängt an `RD-5`) |
| S12 | ≤ 10 Anfragen je Aufbau | 🟡 **11** | eine Runde mehr als geplant — die verknüpften Zahlungen des Monats für „Rest frei" (P5), bewusst, siehe §5 |
| S13 | **User:** drei September-Zahlungen lösen, am Handy zuordnen | ⬜ | Abnahme vor dem Merge — die einzige Prüfung, die den Schreibpfad live zeigt |

**Zu S4–S6, S8–S9 in einem Satz:** Die Produktivdaten haben in 2026 **null** offene
Zahlungen. Jeder Zustand außer „leer" ist deshalb nur über die Wächter und den Code belegt,
nicht über ein Bild. Das ist der Grund für S13.

## 5. Architektur-Entscheidungen

| Entscheidung | Alternative | Warum so |
|---|---|---|
| **Kandidaten in der Datenbank** (`get_open_fragment_candidates`) | Abfrage je Fokus-Zahlung aus dem Frontend (heute ≤ 39 Zeilen je Händler) | Die Regel „welche Zuordnungen zählen" stünde sonst ein zweites Mal im Code (LL-26); ein Aufruf je Aufbau für den ganzen Stapel statt einer je Zahlung (LL-28/29). Vom User so entschieden |
| **Eine Schreibregel** in `lib/card-links.ts` | Zweiter Upsert in der /mobil-Action | Handy und Schreibtisch müssen `origin = MANUAL_DROP` und den angezeigten Monat identisch schreiben, sonst lernt `history_match` nichts vom Handy |
| **Δ aus zwei RPC-Aufrufen** (vorher/nachher in der Action) | Vorher-Wert aus dem Seitenaufbau | Drei Netzrunden je Zuordnung, dafür ist der Vorher-Wert nie veraltet (Schreibtisch parallel offen). Beide Werte einmal am Ende gerundet → Cent-exakt (LL-25) |
| **Zweifelsfall schlägt Vorschlag** | Vorschlag der Datenbank vorbelegen | Record #2: `ORDER BY card_name` (`ZO-8`) gilt auf /mobil nicht — der Nutzer wählt |
| **Regeln importfrei in `zustand.ts`** | im JSX | Der Wächter transpiliert die echte Datei; keine dieser Regeln macht eine Zahl falsch, wenn sie bricht |
| **Rechte Spalte des Sheets aus `card-state.ts`** | eigene Bezahlt-Regel | LL-26 „Nachbauen": `resolveFixedCostState` liest `manuallyPaid`, Link, `adjustedAmount === 0` — dieselbe Funktion, gefüttert mit einem schmalen Kartenobjekt |
| **Elfte Netzrunde** (verknüpfte Zahlungen des Monats) | „Rest frei" aus dem Stapel ableiten | Der Stapel schneidet nach Buchungsdatum; ein Cross-Monats-Link fehlte (LL-26 „Monatsbezug") |
| **Vorschlag nur für im Monat aktive Karten** | wie der Schreibtisch: Badge auch für inaktive | Eine Zuordnung an eine inaktive Karte zählte in keiner Sparrate; das Sheet bietet sie auch nicht an |
| **Typo-Stufen als px** | Tokens | Sechs der elf Stufen des Handoffs haben in keiner Token-Datei einen Namen; Farben, Flächen, Ränder, Radien, Schrift bleiben Tokens |
| **`--on-accent` für Text auf Türkis** | `--text-primary` | wäre im Light Mode Schwarz auf Türkis; das Token gibt es in der App seit v3-01 (fehlt in der Design-System-Kopie → `RD-2`) |
| **Fester Rahmen 430 px, zentriert** | volle Breite | Der Prototyp ist bei 430 gemessen; am Schreibtisch lässt sich die Route so ebenfalls prüfen |

## 6. Offene Punkte und Fragen

- **S13 steht aus** — der einzige Live-Beleg für den Schreibpfad. Vorschlag: drei
  September-Zahlungen am Schreibtisch lösen, am Handy per Tipp zuordnen, Sparrate vorher
  = nachher.
- **Nach dem Anmelden landet man auf `/`**, nicht auf `/mobil` — die Middleware leitet
  nach dem Login immer auf das Dashboard. Am Handy heißt das einmalig: `/mobil` erneut
  öffnen; danach hält die Sitzung. Ein `next`-Parameter wäre ein kleiner Nachzug an der
  Middleware (v2-24, bewusst nicht in diesem Sprint angefasst).
- **Vier Migrationsdateien sind nicht mehr wortgleich mit Produktion** (siehe §3). Wer die
  Übungs-DB als Probe benutzt, prüft künftig zuerst die Prüfsummen — das stand bisher
  nirgends und hat hier eine Viertelstunde gekostet.
- **Die Übungs-DB kann jetzt nur noch mit der nachgeholten Basis proben** — wer das
  Runbook (`supabase/test_projekt/README.md`) neu ausführt, bekommt Prod-Stand inklusive
  `security_invoker`; die nachgeholten sieben stehen im Anker-Protokoll.
- **`doku-vollstaendigkeit.spec.ts` sieht nur `v2-NN`-Reviews.** Dieses Review und das
  von v3-01 laufen an ihm vorbei — die Historie-Einträge sind trotzdem geschrieben.
- **CLAUDE.md §9 nennt die Altjahre als „nicht importiert"** — 567 Zeilen aus 2023–2024
  liegen in der Datenbank (476 offen). Auf `/mobil` unerreichbar (Grenze 2025-01); als
  Nachtrag im CLAUDE.md-Patch vorgeschlagen.
- **Ring-Bogen für v3-03:** Prototyp schließt bei 100 %, `singularity-ring` und §5 bei
  200 %. §5 gewinnt (CLAUDE.md §5); vor dem Bau bestätigen.
- **`MB-H1`** („N × zuvor" gegen Konfidenz in Prozent) bleibt offen; A3 zeigt heute beides,
  je nachdem, ob es Handzuordnungen gibt.
- **Fehler-Toast „Zuordnen fehlgeschlagen"** (A10) ist eine Annahme — ein Wortlaut für die
  Gestaltungsrunde vor v3-03.

> **Nachzug am selben Abend (nach dem Merge):** Der Login-Umweg ist behoben (`?next=`
> mit geprüftem Ziel, `/mobile` → `/mobil`), und die 567 Zahlungen aus 2023/2024 sind auf
> Anweisung des Users gelöscht — `sprints/doku_patch_2026-09-07_mobil-login-und-altjahre.md`.

## 7. Vorschläge für CLAUDE.md und Roadmap

- **CLAUDE.md:** `sprints/sprint_v3-02_claude_md_patch.md` — §1 Plattform (die Route
  existiert), §7 („keine Mobile-Anpassungen der **Schreibtisch**-Ansicht; auf `/mobil` nur
  Tippen"), §9 Stand, und **eine neue Stolperfalle** samt LL-Eintrag: *Eine View läuft mit
  den Rechten ihres Eigentümers — RLS greift nur mit `security_invoker`.* Netto **+13
  Zeilen** (1.406 → ~1.419, Warnung ab 1.440). **Nicht angewendet; braucht deine Freigabe.**
- **Roadmap:** nachgezogen (`MB-1`…`MB-5` ✅, `NB-3` in §4, `V1` mit der 567-Zeilen-Messung,
  §0 nachgezählt).
- **Schema-Doku 3.17.0 und Design-Doku 3.14.2:** Patch-Datei
  `sprints/sprint_v3-02_doku_patches.md`, angewendet über `docs-maintainer`.
