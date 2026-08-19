# Sprint v2-27 — Review

> **Branch:** `sprint/v2-27-2025-vergleichbar` · **Datum:** 19. August 2026
> **Commits:** `8925bd1` (P1) · `4582d31` (P2) · `f044e2c` (P3) · `cf49790` (P4) · docs (P5)
>
> **In einem Satz:** Das Jahr 2025 rechnet erstmals mit den Kosten, die es damals gab —
> die Ist-Sparrate fällt von 48.445,32 € auf 22.462,84 €, während sich 2026 in keinem
> einzigen Monat bewegt.

---

## 1. Was gebaut wurde

Dieser Sprint hat **keine Zeile Anwendungscode** geändert. Er bewegt Zahlen durch
**Daten**, und die neun Prüfsummen der Rechenfunktionen sind selbst ein Prüfanker.

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
| `pnpm test:visual` | steigt nur um eigene Tests | **121/121** ✅ (unverändert) |
| `pnpm test:e2e` | vollständig grün | **130/130** ✅ inkl. Render-Smoke |

**Beide Testzahlen sind unverändert gegenüber v2-26 — und das ist hier das richtige
Ergebnis**, kein vergessener Test: Der Sprint hat keinen Anwendungscode angefasst, also
gibt es nichts Neues zu bewachen. Die Regel „darf nur steigen" ist eingehalten.

> **Der eine Punkt, der sich bewegt hat, ist First Load JS: 188 → 189 kB.** Es wurde keine
> Zeile Code geändert; die Ursache liegt in der frisch aufgelösten
> Abhängigkeits-Installation des Worktrees, nicht in diesem Sprint. Festgehalten, weil eine
> unerklärte Bundle-Bewegung sonst beim nächsten Mal als Befund gelesen wird.

---

## 3. Anker vorher/nachher

Alles gegen Produktion, **in derselben Sitzung**, vorher und nachher. Vollständiges
Protokoll: `sprints/sprint_v2-27_anker.md`.

| | vorher | nach P2 | nach P4 |
|---|---|---|---|
| **2026, alle zwölf Monate, Ist und Plan** | Referenz | **identisch** ✅ | **identisch** ✅ |
| 2025 Jahressumme Ist | 48.445,32 € | 22.461,00 € | **22.462,84 €** |
| Anker 1 (Σ Ordner == Sparrate) | 24/24 | 24/24 ✅ | **24/24** ✅ |
| Anker 2 (Σ delta == Ist − Plan) | 24/24 | 24/24 ✅ | **24/24** ✅ |
| Neun Prüfsummen | Referenz | byte-identisch ✅ | **byte-identisch** ✅ |

**Jeder einzelne Monatswert traf die vorher aufgeschriebene Erwartung auf den Cent**, in
beiden Phasen.

### 2025 im Einzelnen

| Monat | vorher | nach P2 | nach P4 | | Monat | vorher | nach P2 | nach P4 |
|---|---|---|---|---|---|---|---|---|
| Januar | 4.037,11 | 1.849,12 | 1.854,61 | | Juli | 4.037,11 | 1.849,12 | 1.850,04 |
| Februar | 4.037,11 | 1.890,50 | 1.891,42 | | August | 4.037,11 | 1.890,50 | 1.891,42 |
| März | 4.037,11 | 1.890,50 | 1.891,42 | | September | 4.037,11 | 1.890,50 | 1.888,02 |
| April | 4.037,11 | 1.829,39 | 1.830,31 | | Oktober | 4.037,11 | 1.859,07 | 1.856,59 |
| Mai | 4.037,11 | 1.870,65 | 1.871,57 | | November | 4.037,11 | 1.880,55 | 1.878,07 |
| Juni | 4.037,11 | 1.880,55 | 1.881,47 | | Dezember | 4.037,11 | 1.880,55 | 1.877,90 |

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
| **S2** | 2025 trifft die vorher aufgeschriebene Erwartung | ✅ | Summe 22.461,00 nach P2 · 22.462,84 nach P4, jeder Monat exakt |
| **S3** | Anker 1 in 24 Monaten | ✅ | 24/24, beide Phasen |
| **S4** | Anker 2 (B2) in 24 Monaten | ✅ | 0 Abweichungen, beide Phasen |
| **S5** | Neun Prüfsummen byte-identisch | ✅ | jede trifft ihren eigenen Vorher-Wert, einzeln verglichen |
| **S6** | Keine Dubletten je `(card_id, effective_month)` | ✅ | 0 Dubletten · 27 neue 2025-Zeilen · **85 Zeilen ab 2026 unberührt** |
| **S7** | Fälligkeitsmonate 2026 unverändert | ✅ | Privathaftpflicht 04 · DKV 05 · Rundfunkbeitrag 01,04,07,10 — vorher wie nachher |
| **S8** | Audible: 6 × 9,95 €, 6 × 0,00 € | ✅ | exakt in den Monaten, in denen 2025 gezahlt wurde |
| **S9** | Zuordnung mit Richtig **und** Falsch gemessen | ✅ | ab 0,60: 181/49 · ab 0,95: 48/0 · Leave-One-Out eingebaut |
| **S10** | Prüfstrecke | ✅ | §2 |

---

## 5. Architektur-Entscheidungen

**① Der Plan trägt die Jahressumme des Anteils, nicht den fertigen Haushaltsbetrag.**
*Alternative:* die 27 Beträge ausrechnen und als Konstanten eintragen. *Warum nicht:*
Dann stünde der Split-Faktor implizit in einer Zahl, und niemand könnte später prüfen, ob
er richtig angewandt wurde. So steht die **gemessene Größe** in der Migration und die
Umrechnung als Code daneben — nachvollziehbar und gegen genau den Fehler abgesichert, der
in v2-13 einmal passiert ist.

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
