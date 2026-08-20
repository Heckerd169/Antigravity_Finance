# Sprint v2-27 — Review

> **Branch:** `sprint/v2-27-2025-vergleichbar` · **Datum:** 19. August 2026
> **Commits:** `8925bd1` (P1) · `4582d31` (P2) · `f044e2c` (P3) · `cf49790` (P4) ·
> docs (P5) · P6 (Korrektur nach Nutzer-Rückmeldung)
>
> **In einem Satz:** Das Jahr 2025 rechnet erstmals mit den Kosten, die es damals gab —
> die Ist-Sparrate fällt von 48.445,32 € auf **22.567,80 €**, während sich 2026 in keinem
> einzigen Monat bewegt.

---

## 1. Was gebaut wurde

Bis Phase 6 hat dieser Sprint **keine Zeile Anwendungscode** geändert — er bewegt Zahlen
durch **Daten**, und die neun Prüfsummen der Rechenfunktionen sind selbst ein Prüfanker.
**Phase 7 kam nachträglich dazu**, nach einem zweiten Befund des Nutzers, und ist die
einzige Code-Änderung des Sprints.

### Phase 1 — Briefing, Migration, Vorher-Anker (`8925bd1`)

`sprints/sprint_v2-27_briefing.md` · `sprints/sprint_v2-27_anker.md` ·
`supabase/migrations/20260819_v2_27_da1_karten_2025.sql`

Die Briefing-Datei war fällig, weil drei der vier Kriterien aus `sprint-start` §3 zutrafen:
Datenbank berührt, mehr als drei Phasen, und **fünf Entscheidungen**, die sonst nur im
Chat gestanden hätten.

### Phase 2 — `DA-1`: die Karten reichen nach 2025 zurück (`4582d31`)

22 Karten, 27 Plan-Zeilen, 6 Audible-Lücken. Migration `v2_27_da1_karten_2025` auf
Produktion, nach ausdrücklicher Freigabe.

Der Plan wird **gerechnet, nicht abgeschrieben**: Die Migration trägt die gemessene
Jahressumme des eigenen Anteils und teilt bei GEMEINSAM selbst durch `get_split_factor` —
mit dem Faktor des jeweiligen **Startmonats**.

### Phase 3 — der Halt: die Zuordnung messen (`f044e2c`)

`sprints/sprint_v2-27_zuordnung.md`. Rein lesend. Kreuzvalidierung gegen die 411
handverlinkten Zahlungen aus 2026, weil es für 2025 keine Wahrheit gibt.

### Phase 4 — `ZO-3`: 41 Zahlungen rückwirkend verlinkt (`cf49790`)

`supabase/migrations/20260819_v2_27_zo3_rueckwirkend_verlinken.sql`, nach Vorlage der
Messung und eigener Freigabe. `origin = 'AUTO_ABSORBED'`, Link-Monat = Buchungsmonat.

### Phase 6 — die Pläne der GEMEINSAM-Karten korrigiert (`P6`)

`supabase/migrations/20260819_v2_27_p6_gemeinsam_plaene_korrigiert.sql`

**Nach einer Korrektur des Nutzers**, die einen Konstruktionsfehler aus Phase 2 aufdeckte.
Der Plan als *Jahresdurchschnitt ÷ Split-Faktor* erfand Haushaltsbeträge, die es nie gab.
Details in §3 und im Anker-Protokoll §8.

### Phase 7 — das Einkommens-Popup zeigt den richtigen Monat

`src/app/page.tsx` · `tests/e2e/einkommen-monatsbezug.spec.ts` · `playwright.config.ts`

**Nach einem zweiten Befund des Nutzers:** Das Popup zeigte im Januar 2025 ein
Jahresbrutto von 92.400 € — seinen Wert von 2026. Ursache war eine Abfrage ohne
Monatsbezug. Details in §5 ②.

### Phase 5 — Doku

Review, Historie-Eintrag, Roadmap, CLAUDE.md-Patches für **v2-25, v2-26 und v2-27** —
die Datei stand zwei Sprints zurück.

---

## 2. Prüfstrecke

| | Erwartung | Ergebnis |
|---|---|---|
| `tsc --noEmit` | 0 | **0** ✅ |
| ESLint (kanonisch, `src`) | 0/0 | **0/0** ✅ |
| `pnpm build` | 0 | **0** ✅ · Route `/` **36,9 kB** (unverändert) · First Load JS **189 kB** (v2-26: 188) · geteilt **87,3 kB** unverändert |
| `pnpm test:visual` | steigt nur um eigene Tests | **127/127** ✅ (121 → 127, die sechs neuen) |
| `pnpm test:e2e` | vollständig grün | **136/136** ✅ inkl. Render-Smoke |

**Die Testzahlen steigen um genau die sechs Wächter, die dieser Sprint selbst
geschrieben hat** (`einkommen-monatsbezug.spec.ts`) — die Regel „darf nur steigen" ist
eingehalten. Bis Phase 6 standen sie unverändert bei 121/130, weil bis dahin keine Zeile
Anwendungscode berührt war.

> **Der eine Punkt, der sich bewegt hat, ist First Load JS: 188 → 189 kB.** Es wurde keine
> Zeile Code geändert; die Ursache liegt in der frisch aufgelösten
> Abhängigkeits-Installation des Worktrees, nicht in diesem Sprint. Festgehalten, weil eine
> unerklärte Bundle-Bewegung sonst beim nächsten Mal als Befund gelesen wird.

---

## 3. Anker vorher/nachher

Alles gegen Produktion, **in derselben Sitzung**, vorher und nachher. Vollständiges
Protokoll: `sprints/sprint_v2-27_anker.md`.

| | vorher | nach P2 | nach P4 | nach P6 |
|---|---|---|---|---|
| **2026 Ist, alle zwölf Monate** | Referenz | **identisch** ✅ | **identisch** ✅ | **identisch** ✅ |
| 2025 Jahressumme Ist | 48.445,32 € | 22.461,00 € | 22.462,84 € | **22.567,80 €** |
| Anker 1 (Σ Ordner == Sparrate) | 24/24 | 24/24 ✅ | 24/24 ✅ | **24/24** ✅ |
| Anker 2 (Σ delta == Ist − Plan) | 24/24 | 24/24 ✅ | 24/24 ✅ | **24/24** ✅ |
| Neun Prüfsummen | Referenz | byte-identisch ✅ | byte-identisch ✅ | **byte-identisch** ✅ |

**Jeder einzelne Monatswert traf die vorher aufgeschriebene Erwartung auf den Cent**, in
allen drei Phasen. Der Januar-2026-**Plan** wurde in P6 bewusst korrigiert
(1.465,36 → 1.497,91 €); die Ist-Werte blieben auch dort unberührt.

### 2025 im Einzelnen

| Monat | vorher | nach P2 | nach P4 | | Monat | vorher | nach P2 | nach P4 |
|---|---|---|---|---|---|---|---|---|
| Januar | 4.037,11 | 1.849,12 | 1.854,61 | | Juli | 4.037,11 | 1.849,12 | 1.850,04 |
| Februar | 4.037,11 | 1.890,50 | 1.891,42 | | August | 4.037,11 | 1.890,50 | 1.891,42 |
| März | 4.037,11 | 1.890,50 | 1.891,42 | | September | 4.037,11 | 1.890,50 | 1.888,02 |
| April | 4.037,11 | 1.829,39 | 1.830,31 | | Oktober | 4.037,11 | 1.859,07 | 1.856,59 |
| Mai | 4.037,11 | 1.870,65 | 1.871,57 | | November | 4.037,11 | 1.880,55 | 1.878,07 |
| Juni | 4.037,11 | 1.880,55 | 1.881,47 | | Dezember | 4.037,11 | 1.880,55 | 1.877,90 |

### Nach Phase 6 — die Korrektur

| Monat 2025 | nach P4 | **nach P6** | | Monat | nach P4 | **nach P6** |
|---|---|---|---|---|---|---|
| Januar | 1.854,61 | **1.853,82** | | Juli | 1.850,04 | **1.866,97** |
| Februar | 1.891,42 | **1.867,34** | | August | 1.891,42 | **1.908,07** |
| März | 1.891,42 | **1.867,34** | | September | 1.888,02 | **1.904,67** |
| April | 1.830,31 | **1.850,46** | | Oktober | 1.856,59 | **1.873,52** |
| Mai | 1.871,57 | **1.888,22** | | November | 1.878,07 | **1.894,72** |
| Juni | 1.881,47 | **1.898,12** | | Dezember | 1.877,90 | **1.894,55** |
| | | | | **Summe** | 22.462,84 | **22.567,80** |

**2026 Ist blieb in allen zwölf Monaten unverändert**, Anker 1 und 2 halten 24/24, alle
neun Prüfsummen treffen weiterhin ihren Vorher-Wert. Der Januar-2026-**Plan** wurde
korrigiert: 1.465,36 → 1.497,91 €.

> **Der eigentliche Gewinn steht nicht in der Summe.** Der Miete-Anteil beträgt ab April
> 2025 jetzt **1.052,65 €** — exakt den Betrag, der tatsächlich überwiesen wurde. Die
> Konstruktion aus Phase 2 lag dort systematisch daneben, ohne dass eine Zahl falsch
> ausgesehen hätte.

> **Ein grüner Anker ist hier schwächer als sonst.** 2025 war vorher gleichförmig und ist
> nachher wieder gleichförmig, nur auf anderem Niveau — Ist = Plan, weil in Phase 2 noch
> nichts verlinkt war. Der inhaltliche Beleg ist die **Split-Rechnung**: Der eigene
> Mietanteil ergibt in allen zwölf Monaten 1.068,44 €, exakt den gemessenen
> Jahresdurchschnitt der echten Zahlungen. Wäre der Anteil doppelt angewandt worden,
> stünden dort rund 604 €.

---

## 4. Selbst-Review gegen die Akzeptanzkriterien

| # | Kriterium | erfüllt | Beleg |
|---|---|---|---|
| **S1** | 2026 bewegt sich in keinem der zwölf Monate | ✅ | Anker-Protokoll §4 und §6; alle 24 Werte identisch |
| **S2** | 2025 trifft die vorher aufgeschriebene Erwartung | ✅ | 22.461,00 (P2) · 22.462,84 (P4) · **22.567,80 (P6)**, jeder Monat exakt |
| **S3** | Anker 1 in 24 Monaten | ✅ | 24/24, beide Phasen |
| **S4** | Anker 2 (B2) in 24 Monaten | ✅ | 0 Abweichungen, beide Phasen |
| **S5** | Neun Prüfsummen byte-identisch | ✅ | jede trifft ihren eigenen Vorher-Wert, einzeln verglichen |
| **S6** | Keine Dubletten je `(card_id, effective_month)` | ✅ | 0 Dubletten · 27 neue 2025-Zeilen · **85 Zeilen ab 2026 unberührt** |
| **S7** | Fälligkeitsmonate 2026 unverändert | ✅ | Privathaftpflicht 04 · DKV 05 · Rundfunkbeitrag 01,04,07,10 — vorher wie nachher |
| **S8** | Audible: 6 × 9,95 €, 6 × 0,00 € | ✅ | exakt in den Monaten, in denen 2025 gezahlt wurde |
| **S9** | Zuordnung mit Richtig **und** Falsch gemessen | ✅ | ab 0,60: 181/49 · ab 0,95: 48/0 · Leave-One-Out eingebaut |
| **S10** | Prüfstrecke | ✅ | §2 |
| **S11** | Einkommens-Popup zeigt die Werte des angezeigten Monats | ✅ | `page.tsx:83-98`, sechs Wächter in `einkommen-monatsbezug.spec.ts` |
| **S12** | Der Wächter fängt den Fehler auch wirklich | ✅ | Gegenprobe: Filter entfernt, Kommentar stehengelassen → Test **rot** |

---

## 5. Architektur-Entscheidungen

**① Der Plan als „Jahresdurchschnitt ÷ Split-Faktor" — und warum diese Entscheidung
FALSCH war.**

Sie stand hier zunächst als Erfolg: Die Migration trägt die gemessene Jahressumme des
Anteils und rechnet den Haushaltsbetrag selbst aus, statt ihn abzuschreiben. Das schützte
zuverlässig vor der Doppelanwendung des Split-Faktors (§6 Stolperfalle 11).

**Es löste das falsche Problem.** Der Ansatz hielt den *Anteil* über zwölf Monate konstant
— und erfand dafür einen *Haushaltsbetrag*, den es nie gab: 1.817,49 € und 1.888,91 €,
wo in Wirklichkeit 1.820 € und 1.861 € galten. Der Nutzer bemerkte es am selben Tag.

**Die Gegenprobe lag die ganze Zeit bereit und wurde nicht gemacht.** Rechnet man
*Zahlung ÷ Faktor des Monats*, kommen für Mai–Dez 2025 **exakt 1.861,00 €** heraus und
für Feb–Aug 2026 **exakt 1.904,00 €** — also genau der heute gültige Plan. **Eine Methode,
die den bekannten Wert reproduziert, ist der bessere Schätzer für den unbekannten.** Diese
Prüfung hätte in Phase 1 stattfinden können und hätte den Fehler verhindert.

Die korrigierte Fassung trägt die echten Beträge (P6). Der Anteil ergibt sich daraus von
selbst — und trifft ab April 2025 auf den Cent die tatsächliche Zahlung.

**② Rhythmus-Wächter in der Migration statt in der Prüfliste.**
*Alternative:* die betroffenen Karten von Hand prüfen. *Warum nicht:* Es sind sechs
ANNUAL/QUARTERLY-Karten heute, aber die Migration ist wiederholbar und wird eventuell als
Vorlage benutzt. Ein Wächter, der abbricht, ist billiger als eine Zeile in einer Checkliste
— und der Fehler wäre unsichtbar gewesen.

**③ Trockenlauf auf Produktion statt Slot-Tausch.** Begründung im Briefing §7. Die
Übungs-Datenbank hätte den gefährlichsten Fall (GEMEINSAM mit Faktor-Wechsel) mangels
Daten nicht abbilden können. Der Trockenlauf fand dafür einen echten Fehler.

**④ `AUTO_ABSORBED` statt `MANUAL_DROP` beim rückwirkenden Verlinken.** Die Roadmap hatte
diese Frage offen gelassen. `history_match` zählt nur `MANUAL_DROP`; mit der falschen Wahl
hätte die Zuordnung aus ihren eigenen Vermutungen gelernt und einen Irrtum bei jedem
weiteren Lauf verstärkt.

**② Der Wächter für das Einkommens-Popup entfernt Kommentare, bevor er prüft.**
*Alternative:* den Rohtext durchsuchen. *Warum nicht:* Die Fundstelle in `page.tsx` trägt
einen Kommentar, der den gesuchten Ausdruck `.lte("effective_month", …)` zwangsläufig
**nennt** — ein Rohtext-Wächter wäre allein dadurch grün und bliebe es auch, wenn jemand
den Filter entfernte und den Kommentar stehenließe. Genau diese Falle beschreibt LL-32.
**Belegt statt behauptet:** In der Gegenprobe wurde der Filter entfernt und der Kommentar
stehengelassen — der Test wurde rot.

**⑤ Der ADAC bleibt draußen.** *Alternative:* auf 2025-07 zurückdatieren, damit der
Rhythmus passt. *Warum nicht:* Gezahlt wurde im Oktober; ein Plan im Juli wäre eine
Erfindung. 99 € rechtfertigen weder das noch einen Ankerbruch.

---

## 6. Offene Punkte und Fragen

- **710 Zahlungen aus 2025 sind offen**, davon 212 mit Kartenvorschlag. Das ist Handarbeit
  in der App, kein Sprint — das Gegenstück zu `DA-2` für 2025.
- **`ZO-1`** bleibt offen und wird durch diese Messung gestützt: Ohne Namenstreffer ist die
  Badge-Schwelle rechnerisch unerreichbar.
- **`MOBILE SUICA APPLE V`** (15 Zahlungen, 79,45 €) ist die einzige wiederkehrende Ausgabe
  2025 ohne Karte. Eine neue Karte wäre kein Rückdatieren gewesen — bewusst nicht getan.
- **Die drei Budget-Karten tragen 2025 die heutigen Pläne.** Der tatsächliche variable
  Aufwand lag höher (−30.742,53 € außerhalb der Fixkosten-Muster), lässt sich ohne
  Kuratierung aber nicht sauber verteilen.
- **Der Browser-Smoke steht aus.** Er ist der Produktiv-Gate und nur am Desktop möglich.

---

## 7. Vorschläge für CLAUDE.md und Roadmap

**Als Vorschlag formuliert — die Anwendung auf CLAUDE.md braucht die Freigabe.**
Die Patch-Datei liegt vor: `sprints/sprint_v2-27_doku_patches.md`. Sie zieht **drei
Sprints** nach, weil die Datei bei v2-24 stehen geblieben ist.

**① §9 Sprint-Stand und Doku-Versionen** auf v2-27 · Design-Doku **v3.10.0** · Schema-Doku
**v3.12.0** · Roadmap-Zahlen **12 offene Pakete · 35 Themen · 4 Hausaufgaben · 39 offen
gesamt · 61 erledigt**. **Die Momentaufnahme in §9 muss ersetzt werden** — sie stammt vom
13.08.2026 und nennt für 2025 „alle Monate 4.037,11 €". Das ist seit diesem Sprint falsch.

**② §6 neue Stolperfalle — der Rhythmus zählt ab `first_active_month`.** Wer eine
ANNUAL/QUARTERLY-Karte zurückdatiert, verschiebt ihren Fälligkeitsmonat in allen Folgejahren,
sofern der Abstand kein Vielfaches der Periode ist. Kein Wächter fängt das: Jede Zahl bleibt
richtig, sie steht nur im falschen Monat.

**③ §8 neuer Eintrag — wer aus einem Textmuster aggregiert, misst das Muster.** Drei Zahlen
des Auftrags waren falsch, alle drei durch zu grobe Gruppierung (iCloud 11,58 statt 9,99 ·
vier „nicht existierende" Karten · ADAC-Doppelbedeutung). Die Gegenprobe kostet je eine
Abfrage.

**④ §6 Ergänzung — ein Client-Timeout ist kein Rollback.** Nach einem Timeout ist der
Zustand **unbekannt**, nicht zurückgerollt. Wer sofort misst, sieht einen Zwischenstand.
Verwandt mit der Log-Ingestion-Falle aus v2-24.

**⑤ Aus v2-25 und v2-26 offen** (Vorschläge dort jeweils §7): Stolperfalle „Copy gegen
136 px messen" · `pg_get_functiondef` schließt Kommentare ein · LL-31 (Spezifikation kann an
der Physik scheitern) · LL-32 (Wächter auf verschwundenes Konstrukt muss Kommentare
ausschließen) · die zweite Sperre unter der ersten (`HAS_STATES`) · der Vorgabewert als
Falle.

**⑥ Roadmap:** bereits nachgezogen — `DA-1` und `ZO-3` auf ✅, Zahlen neu ausgezählt,
Paket 6 um eine Notiz zur umgekehrten Reihenfolge-Begründung ergänzt.
