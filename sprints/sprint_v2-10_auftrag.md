# Sprint v2-10 — Arbeitsauftrag (unbeaufsichtigter Lauf)

> **Geschrieben am 05.08.2026** am Ende der Ideen-Runde, für einen Lauf von **rund zwei
> Stunden ohne anwesenden User**. Der Umfang ist bewusst so geschnitten, dass **keine
> einzige offene Frage** darin steckt — alles hier ist bereits entschieden.
>
> **Kein `sprint-start` nötig.** Das Nachbohren hat am 04./05.08. stattgefunden; die
> Beschlüsse stehen in `V2/v2_roadmap_konsolidiert.md` und den beiden Befunde-Papieren.
> Fang direkt mit der Vorbereitung an.

---

## Die eiserne Regel

**Halte niemals an. Frage niemals.**

Stößt du auf eine offene Frage, eine Gestaltungsentscheidung, einen Blocker oder einen
Widerspruch:

1. Schreibe ihn nach **`sprints/sprint_v2-10_offene_fragen.md`** — was, wo, warum, und
   welche Entscheidung fehlt.
2. **Gehe zur nächsten Phase.**

Niemals warten. Niemals raten (§7 Regel 3: keine UI-Erfindungen). Eine notierte Frage
ist ein gutes Ergebnis, zwei verlorene Stunden sind keines.

Dasselbe gilt, wenn eine Phase fehlschlägt: notieren, zurückrollen, weiter mit der
nächsten. Die Phasen sind **voneinander unabhängig**.

---

## Was ausdrücklich NICHT passiert

- **Keine Datenbank.** Kein Schema, keine RPC, keine Migration, kein `db-eingriff`.
  Alle vier Phasen sind reine Anzeige. Die Übungs-Datenbank ist pausiert.
- **Kein Merge nach `main`**, kein Deploy. PR anlegen ja, mergen nein.
- **Kein `RM-2`** (Schaufenster-Popup) — dort ist die Rangfolge der Angaben eine offene
  Gestaltungsfrage.
- **Kein `BF-5`, `BF-2`, `BF-4`** — hängen an den Entscheidungen E1/E2/E3.
- **Keine Gestaltungsentscheidung.** Wenn eine auftaucht: notieren, weiter.

---

## Vorbereitung

1. `EnterWorktree` mit dem Namen **`v2-10`** — nicht im Haupt-Checkout arbeiten.
2. Branch: **`sprint/v2-10-fehler-und-lesbarkeit`**.
3. Lege `sprints/sprint_v2-10_offene_fragen.md` sofort an, mit Überschrift und dem Satz
   „Bislang keine." — damit die Datei existiert, auch wenn nichts hineinkommt.

---

## Phase 1 · `BF-3` — Einkommens-Popup reparieren · **+ `RM-4`**

**Problem:** Das Popup öffnet ~80 px schmal und ist unbenutzbar. **Blockiert aktiv das
Eintragen von Gehältern — höchste Dringlichkeit im gesamten Projekt.**

**Ursache (diagnostiziert, nicht mehr zu suchen):** Es wird ohne Portal innerhalb eines
Elements gezeichnet, das `transform` trägt. Ein Vorfahre mit `transform` wird zum
Bezugsrahmen für `position: fixed`, deshalb greift die Zentrierung nicht.

**Ort:** `src/components/income-split/index.tsx` · `income-split.module.css` (Zeile 2–8
tragen bereits `position: fixed; inset: 0; place-items: center` — die sind **richtig**
und bleiben).

**Lösung:** React-Portal, exakt nach dem Muster der acht anderen Overlays. Vorbild:
`src/components/interaction-zone/portal.tsx`, verwendet u. a. in
`interaction-zone/direct-create-overlay.tsx`.

**Prüfkriterium:** Popup öffnet mittig im Bild, in voller Breite, unabhängig davon, wo
der auslösende Klick saß. Vergleiche die Geometrie mit `direct-create-overlay`.

**Anschließend `RM-4` — reine Doku, kein Code.** Die Positionsregel in die Design-Doku
schreiben, patch-basiert (§7 Regel 14, Subagent `docs-maintainer`). Wortlaut steht
wörtlich fest:

> „Overlays und Popups erscheinen immer mittig im Bild, an derselben Stelle; sie
> unterscheiden sich in der Größe, nie im Ort. **Kontextmenüs** sind davon ausgenommen —
> sie erscheinen am auslösenden Element, weil sie sonst ihren Bezug verlieren."

Bestandsaufnahme zum Mitschreiben: 7 von 8 Overlays waren bereits zentriert, einzige
bewusste Ausnahme ist das Karten-Kontextmenü (`cards/card-interactive.tsx`, am Icon
verankert). Berührt Design-Doku §7/§8.

**Commit:** `fix: einkommens-popup mit portal, positionsregel dokumentiert (v2-10 p1)`

---

## Phase 2 · `BF-1` — Euro-Zeichen bricht um

**Problem:** Der Betrag auf einer Rohmasse-Karte bricht auf die nächste Zeile, weil das
KI-Vorschlags-Kästchen daneben nicht schrumpft.

**Entscheidung (steht fest):**
1. **Alle KI-Vorschlags-Kästchen entfallen aus der Anzeige.** Die Datenbank rechnet
   weiter — nur das Rendern entfällt, später mit einer Zeile wieder einschaltbar.
   Die sechs Badge-Farbtöne bleiben ungenutzt im Code stehen, nicht löschen.
2. **Zusätzlich Umbruch-Verbot für den Betrag.**

**Ort:** `src/components/interaction-zone/fragment-card.tsx` — der Zweig
`fragment.suggestedCardName && (...)` mit `BADGE_HUE_CLASSES`. Das **Transfer**-Badge
bleibt unangetastet. CSS: `interaction-zone.module.css`, `.fragmentAmount`.

**Prüfkriterium:** Kein Vorschlags-Kästchen mehr sichtbar; Transfer-Badge weiterhin da;
kein Betrag bricht um, auch nicht bei vierstelligen Summen. Schließt zugleich den
Badge-Überlauf aus `sprint_v2-07_review.md` §5.1.

**Commit:** `fix: ki-vorschlags-badges aus der anzeige, betrag ohne umbruch (v2-10 p2)`

---

## Phase 3 · `RM-1` — Beschreibung auf den Verwendungszweck kürzen

**Regel (steht fest):** Zeige **immer den letzten durch `|` getrennten Teil**. Ist er
leer, falle auf den **ersten** Teil zurück.

Deckt alle drei Quellen ab, ohne ihre Herkunft zu kennen:

| Quelle | Aufbau | Anzahl |
|---|---|---|
| DKB Giro | `Empfänger \| Verwendungszweck` | 973 |
| DKB Visa | ein Feld, kein Trennzeichen | 469 |
| Cortal | `Sender \| Buchungstext \| Verwendungszweck` | 106 |

Greift auf **1.547 von 1.548** Fragmenten; genau eines hat einen leeren Zweck.

**Unbedingt beachten:** **Ausschließlich beim Anzeigen.** Der gespeicherte Text ist
Bestandteil des Duplikat-Hashes, des Trigram-Index der Zuordnung und des
Sortier-Tiebreakers. **Nichts in der Datenbank ändern.** Das `title`-Attribut behält den
**vollständigen** Text.

**Ort:** `src/components/interaction-zone/fragment-card.tsx`, `.fragmentDesc`. Das
Abschneiden mit „…" ist bereits gebaut (`text-overflow: ellipsis`) — **nicht anfassen**.
Auch das `aria-label` sinnvoll mitziehen.

**Prüfkriterium:** `ALINE NUENNINGHOFF | Geburtstagsgeld Gutschein VS` zeigt
`Geburtstagsgeld Gutschein VS`. Eine Visa-Zeile (`SP SCICON SPORTS`) bleibt unverändert.
Eine Cortal-Zeile zeigt den dritten Teil. Berührt Design-Doku §8 → Patch mitschreiben.

**Commit:** `feat: rohmasse zeigt den verwendungszweck statt des empfaengers (v2-10 p3)`

---

## Phase 4 · `PA-1` — Konsequenz-Anzeige beim Einkommens-Eintrag *(nur falls Zeit)*

**Setzt Phase 1 voraus.** Wenn Phase 1 fehlschlug: überspringen, notieren.

Nach dem Speichern eines Einkommens zeigt das Popup, welche Daueraufträge sich dadurch
ändern — je gemeinsamem Posten **alt → neu → Differenz**.

**Rechenweg existiert bereits:** `get_split_factor(user_id, monat)` liest den jüngsten
Einkommens-Eintrag ≤ Monat. Anteil je Karte = `planned_amount × Faktor`.
**Achtung:** Der Faktor rechnet mit `gross_annual`, **nicht** mit dem Netto.

**Symmetrisch** — greift bei jeder Einkommensänderung, auch bei `ICH`.
**Kein Häkchen „umgestellt".**

**Wird es größer als eine Rechnung plus Liste: abbrechen, notieren, weiter zu Phase 5.**

**Commit:** `feat: einkommens-eintrag zeigt geaenderte dauerauftraege (v2-10 p4)`

---

## Phase 5 · Abschluss

Fähigkeit **`sprint-abschluss`** laden und abarbeiten. Kurzfassung:

**Prüfstrecke** (alles freigegeben, läuft ohne Nachfrage):
```
pnpm lint · npx tsc --noEmit · pnpm build · pnpm test:visual · pnpm test:e2e
```
Rote Prüfung → Ursache beheben, wenn sie in deinem Umfang liegt; sonst notieren und
den betroffenen Phasen-Commit zurücknehmen.

**Optischer Smoke:** Subagent `smoke-agent` (strikt read-only) über die berührten
Zustände — Rohmasse, Einkommens-Popup. Ersetzt **nicht** den Browser-Smoke des Users.

**Dann:**
1. `sprints/sprint_v2-10_review.md` schreiben — was gebaut wurde, was die Prüfstrecke
   sagte, was der Smoke zeigte, was offen blieb.
2. Roadmap fortschreiben: erledigte Punkte aus ihren Paketen nach §4, **§0 nachzählen,
   nicht schätzen.** Ist Paket 2 dadurch leer bis auf `RM-2`, das vermerken.
3. Doku-Patches anwenden (Design-Doku §7/§8 aus Phase 1 und 3), Versions-Bump.
4. Pushen und **PR anlegen** (`gh pr create`, ist freigegeben). **Nicht mergen.**

---

## Prüfanker — Sparrate darf sich NICHT bewegen

Alle vier Phasen sind reine Anzeige. Bewegt sich eine dieser Zahlen, ist etwas falsch:

| Monat 2026 | Ist-Sparrate |
|---|---|
| Jan–Apr, Aug–Dez | 1.931,18 € |
| Mai | −86,77 € |
| Juni | 4.589,53 € |

Vor Phase 1 und nach Phase 5 je einmal lesend prüfen (`calculate_sparrate_for_month`,
nur `SELECT`).

---

## Was am Ende dastehen soll

- Vier (oder drei) Phasen-Commits auf `sprint/v2-10-fehler-und-lesbarkeit`, gepusht
- Ein offener PR gegen `main`
- `sprints/sprint_v2-10_review.md`
- `sprints/sprint_v2-10_offene_fragen.md` — auch wenn nur „Bislang keine." darin steht
- Roadmap fortgeschrieben, §0 nachgezählt

*Arbeitsauftrag · Antigravity Finance · 05. August 2026*
