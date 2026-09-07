# Sprint v3-02 — Patch-Vorschlag für CLAUDE.md

> **Nicht angewendet.** Verfahren nach §7 Regel 14 / LL-16 und Fähigkeit
> `claude-md-pflege`: Anker + Patch-Satz je Stelle, jeder Anker per `grep -c` auf
> Eindeutigkeit geprüft (Erwartung `1`), Anwendung erst nach ausdrücklicher Freigabe.
>
> **Umfang:** CLAUDE.md steht bei **1.406** Zeilen (Grenze 1.600, Warnung ab 1.440;
> Regelanteil 53,9 %, Erzählzone 126 von 150). Dieser Patch bringt netto etwa **+13
> Zeilen** — eine Stolperfalle mit ihrem Vorfall und eine Registerzeile; §1/§7/§9
> tauschen Zeilen aus. Danach ~1.419, unter der Warnschwelle.
>
> **Nummern:** Der Patch aus v3-01 (`sprints/sprint_v3-01_claude_md_patch.md`) schlägt
> LL-44 und LL-45 vor und ist ebenfalls nicht angewendet; v2-32 hatte zwei andere als
> 44/45 vorgeschlagen. Die neue Lehre hier heißt deshalb **LL-46 vorbehaltlich** — wer
> zuerst anwendet, vergibt die Nummern lückenlos. Stolperfalle **32** folgt auf 31.

---

## Patch 1 · §1 — die Plattform-Zeile

**Anker (`grep -c` = 1):**

```
**Plattform:** Web-App. Mobile ist NICHT im Scope.
```

**Patch-Satz (ersetzt die Zeile):**

```
**Plattform:** Web-App am Schreibtisch. **Seit v3-02 (07.09.2026) zusätzlich die eigene
Route `/mobil`** (430 px, Zuordnen per Tipp) — kein Responsive-Umbau der
Schreibtisch-Ansicht; Spezifikation: `design-system/handoff/mobile/README.md` und
`V2/design_direktor_2026-09-07_mobil.md`.
```

**Warum:** Die Zeile „Mobile ist NICHT im Scope" war seit dem 07.09.2026 falsch; eine
Verfassung, die dem Repo widerspricht, ist die Fehlerklasse aus §9 („Was in `main`
liegt, steht an genau EINER Stelle").

---

## Patch 2 · §7 „Was Claude Code nie macht"

**Anker (`grep -c` = 1):**

```
- Keine Mobile-Anpassungen, keine Touch-Gesten / Swipe / Long-Press
```

**Patch-Satz (ersetzt die Zeile):**

```
- Keine Mobile-Anpassungen der **Schreibtisch**-Ansicht; auf `/mobil` nur Tippen — keine
  Swipe- oder Long-Press-Geste (Record 07.09.2026: Wischen wurde verworfen)
```

---

## Patch 3 · §6 — neue Stolperfalle 32 (nach Stolperfalle 31, vor „### Typen neu erzeugen")

**Anker (`grep -c` = 1) — die letzte Zeile von Stolperfalle 31:**

```
    Erst beide zusammen ergeben eine benutzbare Regel. (v2-31, LL-43)
```

**Patch-Satz (danach einfügen):**

```
32. **Eine View läuft mit den Rechten ihres EIGENTÜMERS — RLS greift nur mit
    `security_invoker`.** `fragments_with_status` gehörte `postgres` (BYPASSRLS): Ein
    angemeldeter Fremder bekam über die View **2.219** Zeilen, über die Tabellen dahinter
    **0**. Die App las Rohmasse, Schaufenster und Nachbar-Zähler ausschließlich über diese
    View. **Mit einem Nutzer sieht die falsche Antwort genauso aus wie die richtige** — das
    ist LL-30 in einer dritten Gestalt. Gefunden am 07.09.2026 beim Bau einer Funktion, die
    die View liest; behoben mit `ALTER VIEW … SET (security_invoker = true)`, vorher/nachher
    auf beiden Projekten gemessen. **Regel:** Wer eine View anlegt oder liest, prüft
    `reloptions` — und misst als Fremder, nicht nur als Eigentümer. (v3-02, LL-46)
```

---

## Patch 4 · §8 — Registerzeile (nach LL-43)

**Anker (`grep -c` = 1, Zeilenanfang):**

```
| LL-43 | Ein **Rundungs-Ausgleich gehört nur dorthin, wo die Summe der Gruppen sichtbar ist**
```

**Patch-Satz (nach dieser Tabellenzeile einfügen):**

```
| LL-46 | Eine **View läuft mit den Rechten ihres Eigentümers** — ohne `security_invoker` umgeht sie RLS, und mit einem Nutzer sieht die falsche Antwort genauso aus wie die richtige. Als Fremder messen, nicht nur als Eigentümer | §6 Stolperfalle 32 | v3-02 |
```

---

## Patch 5 · §9 — Stand

**Anker (`grep -c` = 1):**

```
**Letzter Sprint:** **v2-32** („Ein sauberer Tisch für das Re-Design", 04.09.2026)
```

**Patch-Satz (ersetzt die Zeile):**

```
**Letzter Sprint:** **v3-02** („`/mobil` — Zahlungen zuordnen ohne Ziehen", 07.09.2026)
· **davor:** v3-01 (Apple-Redesign), v2-32 („Ein sauberer Tisch für das Re-Design", 04.09.2026)
```

**Anker (`grep -c` = 1):**

```
**Alles bis einschließlich v2-31 ist in `main`**, dazu die beiden Fixes vom
```

**Patch-Satz (ersetzt die Zeile — der Rest des Absatzes bleibt):**

```
**Alles bis einschließlich v3-01 ist in `main`** (PR #55); v3-02 liegt als Pull Request
vor. Dazu die beiden Fixes vom
```

**Anker (`grep -c` = 1, Tabellenzeile in „Wo das Projekt gerade steht"):**

```
| **Nächste Arbeit** | **Das Re-Design der Oberfläche** (Roadmap Paket 19), geplant mit Fable 5.1 in einer eigenen Sitzung. Davor nichts Zwingendes — die Kuratierung ist durch. |
```

**Patch-Satz (ersetzt die Zeile):**

```
| **Nächste Arbeit** | **v3-03: Übersicht · Karten · Verlauf auf `/mobil`** (Roadmap Paket 20, `MB-6`). Vorher klären: Ring-Bogen 100 % (Prototyp) gegen 200 % (§5) — §5 gewinnt. |
```

**Anker (`grep -c` = 1):**

```
| **Die 2.031 Zahlungen aus 2020–2024** | Der Visa-Jahresexport enthält sie; die App modelliert 2025 und 2026.
```

**Patch-Satz (nur der Anfang der Zelle wird ersetzt; der Rest bleibt):**

```
| **Die 2.031 Zahlungen aus 2020–2024** | **Gemessen am 07.09.2026: 567 davon (2023–2024) liegen bereits in der Datenbank, 476 offen.** Der Visa-Jahresexport enthält den Rest; die App modelliert 2025 und 2026.
```

---

## Prüfung nach der Anwendung

1. `grep -c` je Anker vor dem Patch → jeweils `1`.
2. `pnpm test:visual` — `claude-md-umfang.spec.ts` (Gesamt · Erzählzone · Regelanteil)
   und `doku-vollstaendigkeit.spec.ts` grün. Der Historie-Eintrag zu v3-02 steht bereits
   (`sprints/projekt_historie.md`), damit der LL-Ursprung auffindbar ist — auch wenn der
   Test heute nur `v2-NN` erkennt.
3. Nummern lückenlos: Stolperfalle 31 → 32; LL-43 → (44, 45 aus v3-01) → 46.
