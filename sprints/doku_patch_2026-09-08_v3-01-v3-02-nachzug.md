# Doku-Patch 08.09.2026 — CLAUDE.md, Nachzug v3-01 + v3-02

> **Freigabe des Users liegt vor** (Eröffnungsprompt v3-03, P0). Verfahren nach §7
> Regel 14 / LL-16 und Fähigkeit `claude-md-pflege`: Anker + Patch-Satz je Stelle,
> jeder Anker per `grep -c` geprüft — **alle zwölf ergaben `1`**.
>
> **Umfang vor dem Patch:** 1.406 / 1.600 Zeilen · Erzählzone 126 / 150 ·
> Regelanteil 53,9 % (min 45).

---

## Warum dieser Patch die beiden Vorlagen ZUSAMMENFÜHRT statt sie nacheinander anzuwenden

`sprints/sprint_v3-01_claude_md_patch.md` und `sprints/sprint_v3-02_claude_md_patch.md`
sind **beide** gegen den Stand *vor* v3-01 geschrieben. Nacheinander angewendet
kollidieren sie an drei Stellen:

| Stelle | Kollision | Auflösung hier |
|---|---|---|
| §6 neue Stolperfalle | **beide** nennen sich „32" und hängen am selben Anker (Ende SF 31) | v3-01 (Token-Kopien) wird **32**, v3-02 (View/RLS) wird **33** |
| §8 Register | beide fügen nach `LL-43` ein | Reihenfolge **LL-44, LL-45** (v3-01) → **LL-46** (v3-02) |
| §9 Kopf | beide ersetzen `**Letzter Sprint:** **v2-32** …` | v3-02s Anker existiert nach v3-01 nicht mehr → **eine** Fassung auf dem Stand vom 08.09.2026 |

**Zusätzlich ist der §9-Stand beider Vorlagen überholt.** v3-01 schreibt „v3-02 liegt
als Pull Request vor", v3-02 schreibt „Alles bis einschließlich v3-01 ist in `main`".
Tatsächlich sind **v3-02 und beide Nachzüge vom 07.09.2026 gemergt** (PR #58, #59) —
geprüft gegen den Baum des Worktrees, der von `origin/main` abzweigt:
`src/app/mobil/zuordnen/` und `design-system/handoff/mobile/` liegen darin.

**Folge für spätere Nummern:** `sprints/sprint_v2-32_review.md` §7 schlägt zwei Lehren
als LL-44/LL-45 vor. Diese Nummern sind hiermit vergeben. Werden die Vorschläge später
freigegeben, bekommen sie **LL-47 und LL-48**.

---

## Patch 1 · Vorspann — Datum und Sprint

**Anker (`grep -c` = 1):**
```
> **Letzte Aktualisierung:** 4. September 2026 · **nach:** Sprint **v2-32**
> („Ein sauberer Tisch für das Re-Design").
```
**Patch-Satz:**
```
> **Letzte Aktualisierung:** 8. September 2026 · **nach:** Sprint **v3-02**
> („`/mobil` — Zahlungen zuordnen ohne Ziehen").
```

---

## Patch 2 · §1 — die Plattform-Zeile *(aus v3-02)*

**Anker (`grep -c` = 1):**
```
**Plattform:** Web-App. Mobile ist NICHT im Scope.
```
**Patch-Satz:**
```
**Plattform:** Web-App am Schreibtisch. **Seit v3-02 (07.09.2026) zusätzlich die eigene
Route `/mobil`** (430 px, Zuordnen per Tipp) — kein Responsive-Umbau der
Schreibtisch-Ansicht; Spezifikation: `design-system/handoff/mobile/README.md` und
`V2/design_direktor_2026-09-07_mobil.md`.
```

**Warum:** „Mobile ist NICHT im Scope" war seit dem 07.09.2026 falsch. Eine Verfassung,
die dem Repo widerspricht, ist die Fehlerklasse aus §9.

---

## Patch 3 · §6 Stolperfalle 21 erweitern *(aus v3-01, LL-45)*

**Anker (`grep -c` = 1):**
```
    Gemessen wird mit dem echten Font-Stack, nicht geschätzt. (v2-25, LL-31)
```
**Patch-Satz:** die Zeile bleibt, danach der Absatz „**Und gemessen wird gegen den
ECHTEN Inhalt, nicht gegen den des Entwurfs.**" — Wortlaut wie in
`sprints/sprint_v3-01_claude_md_patch.md` Patch 3, Kennung **(v3-01, LL-45)**.

---

## Patch 4 · §6 — neue Stolperfalle 32 *(aus v3-01, LL-44)*

**Anker (`grep -c` = 1), Ende von Stolperfalle 31:**
```
    Erst beide zusammen ergeben eine benutzbare Regel. (v2-31, LL-43)
```
**Patch-Satz:** danach Stolperfalle **32** („Ein Token wirkt nur dort, wo niemand seinen
Wert ein zweites Mal hingeschrieben hat") — Wortlaut wie
`sprints/sprint_v3-01_claude_md_patch.md` Patch 2, Kennung **(v3-01, LL-44)**.

---

## Patch 5 · §6 — neue Stolperfalle 33 *(aus v3-02, LL-46)*

**Anker:** das Ende der frisch eingefügten Stolperfalle 32.

**Patch-Satz:** Stolperfalle **33** („Eine View läuft mit den Rechten ihres
EIGENTÜMERS — RLS greift nur mit `security_invoker`") — Wortlaut wie
`sprints/sprint_v3-02_claude_md_patch.md` Patch 3, **umnummeriert von 32 auf 33**,
Kennung **(v3-02, LL-46)**.

---

## Patch 6 · §7 „Was Claude Code nie macht" *(aus v3-02)*

**Anker (`grep -c` = 1):**
```
- Keine Mobile-Anpassungen, keine Touch-Gesten / Swipe / Long-Press
```
**Patch-Satz:**
```
- Keine Mobile-Anpassungen der **Schreibtisch**-Ansicht; auf `/mobil` nur Tippen — keine
  Swipe- oder Long-Press-Geste (Record 07.09.2026: Wischen wurde verworfen)
```

---

## Patch 7 · §8 — drei Registerzeilen

**Anker (`grep -c` = 1):** die vollständige Zeile `| LL-43 | …`.

**Patch-Satz — danach einfügen:** LL-44 und LL-45 (v3-01, Wortlaut aus dessen Patch 4),
dann LL-46 (v3-02, Wortlaut aus dessen Patch 4), mit den Verweisen §6 Stolperfalle 32 ·
21 · **33**.

---

## Patch 8 · §9 — Kopf auf den Stand vom 08.09.2026

**Anker (`grep -c` = 1):** der Absatz `**Letzter Sprint:** **v2-32** …` bis
`Request vor.`

**Patch-Satz:**
```
**Letzter Sprint:** **v3-02** („`/mobil` — Zahlungen zuordnen ohne Ziehen", 07.09.2026)
· **davor:** v3-01 (Apple-Redesign, 06.09.2026), v2-32 (Aufräumen), v2-31 (`M7`
`KAT-4`), v2-30 (`PF-6`), v2-29 (`ZO-5`), v2-28 (`DA-3` `ZO-4` `NAV-1`), v2-27
(`DA-1` `ZO-3`).

**Alles bis einschließlich v3-02 ist in `main`**, dazu die beiden Nachzüge vom
07.09.2026 (Login-Ziel und Altjahre-Löschung · Sheet-Kontextzeile) und die beiden Fixes
vom 03.09.2026 (durchgehende Verlaufslinie · blockweiser CSV-Import). Geprüft **gegen
den Baum**, **nicht** gegen den PR-Status — der beantwortet eine andere Frage.
**v3-03 ist dieser Sprint.**
```

---

## Patch 9 · §9 — den v2-31-Kasten ersetzen

**Anker (`grep -c` = 1):** der Block von `> **v2-31 in drei Sätzen.**` bis
`> genommen und bleibt offen.`

**Patch-Satz:** ein Kasten zu **v3-01** (Wortlaut aus dessen Patch 6, gekürzt) und vier
Zeilen zu **v3-02**. Der v2-31-Kasten entfällt — sein Inhalt steht vollständig in
`sprints/projekt_historie.md`.

---

## Patch 10 · §9 — „Nächste Arbeit" *(aus v3-02, auf v3-03 gezogen)*

**Anker (`grep -c` = 1):**
```
| **Nächste Arbeit** | **Das Re-Design der Oberfläche** (Roadmap Paket 19), geplant mit Fable 5.1 in einer eigenen Sitzung. Davor nichts Zwingendes — die Kuratierung ist durch. |
```
**Patch-Satz:**
```
| **Nächste Arbeit** | **v3-03: Übersicht · Karten · Verlauf auf `/mobil`** (Roadmap Paket 20, `MB-6`). Vorher klären: Ring-Bogen 100 % (Prototyp) gegen 200 % (§5) — §5 gewinnt. |
```

---

## Patch 11 · §9 — die 2.031 Altjahres-Zahlungen *(aus v3-02)*

**Anker (`grep -c` = 1):** Zellenanfang `| **Die 2.031 Zahlungen aus 2020–2024** | Der
Visa-Jahresexport enthält sie;`

**Patch-Satz:** Wortlaut aus `sprints/sprint_v3-02_claude_md_patch.md` Patch 5 — die
Entscheidung vom 07.09.2026, die Löschung der 567 Zeilen aus 2023–2024 und der Verweis
auf `sprints/doku_patch_2026-09-07_mobil-login-und-altjahre.md`.

---

## Prüfung nach der Anwendung

1. Nummern lückenlos: Stolperfalle 31 → **32** → **33**; LL-43 → **44** → **45** → **46**.
2. `pnpm test:visual` — `claude-md-umfang.spec.ts` (Gesamt · Erzählzone · Regelanteil ·
   Roadmap-Abschrift) und `doku-vollstaendigkeit.spec.ts` grün.
3. Erwarteter Umfang: ~1.455 Zeilen (91 %), Erzählzone unter 150, Regelanteil ≥ 45 %.
