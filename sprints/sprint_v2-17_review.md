# Sprint v2-17 — Review

> **Branch:** `sprint/v2-17-kategorien` · **Commits:** 6 (1 Record + 4 Phasen + 1 Doku)
> **Datum:** 08. August 2026 · **Paket 4 vollständig**
>
> **In einem Satz:** Das Karussell zeigt im Juli statt 32 Karten elf Ordner, deren
> Beträge sich in allen zwölf Monaten **exakt** zur Sparrate summieren — und der Weg
> dorthin hat eine Zusicherung der Gestaltungsrunde widerlegt.

---

## 1. Was gebaut wurde

### Phase 1 · `J1` — Datenbank-Grundstand als versionierte Basis

**Absicht:** Befund `D15`. Unter `supabase/migrations/` lagen nur fünf Delta-Dateien ab
v2-04; alles davor (Sprints 1–8: Basistabellen, Lebenszyklus-RPCs, Distiller, RLS)
existierte ausschließlich in den beiden lebenden Datenbanken. Es gab damit keine
versionierte Basis, gegen die ein Eingriff in eine Rechenfunktion diffen könnte, und
die Übungs-Datenbank war aus dem Repo nicht rekonstruierbar.

**Weg:** Kein `pg_dump` — der Supabase-CLI ist zwar angemeldet, `db dump` braucht aber
das Datenbank-Passwort, das nicht im Repo liegt. Stattdessen aus dem `pg_catalog`
rekonstruiert: `pg_get_functiondef`, `pg_get_constraintdef`, `pg_get_triggerdef`,
`pg_get_viewdef`, `pg_indexes`, `pg_policies`. Das ist sogar das ehrlichere Ergebnis —
es bildet den **Live-Stand** ab, nicht die Summe der Delta-Dateien.

**Umfang:** 1.984 Zeilen · 5 Erweiterungen · 6 Aufzählungstypen · 10 Tabellen ·
56 Constraints · 14 Indizes · **31 Funktionen** · 1 View · 5 Trigger · 10× RLS +
10 Policies · `app_config`-Seed.

**Besonderheit:** Die bekannten Fallen stehen als Kommentar **an der Stelle, an der sie
zuschlagen** — `D1` an den Rechenfunktionen, `D7` am Lebenszyklus, `D8` am RLS-Block,
`D9`/`D10`/`D13` an ihren Funktionen. Eine Baseline, die nur Code enthält, hätte den
halben Wert.

**Dateien:** `supabase/migrations/00000000000000_baseline_stand_v2_16.sql`

### Phase 2 · `KAT-1` — Kategorien als eigene Struktur

**Datenbank:** Tabelle `card_categories` (ohne Betrags-Spalte), Spalte
`cards.category_id` mit `ON DELETE SET NULL`, UNIQUE-Index auf `(user_id, lower(name))`,
Owner-Policy **von Hand**, fünf RPCs.

**Drei Fallen, drei bewusste Antworten:**

| Falle | Antwort |
|---|---|
| `D1` — beide Sparrate-RPCs laufen ohne Typ-Filter | Eigene Tabelle. Eine Kategorie ist **nie** eine `cards`-Zeile |
| `D7` — der Papierkorb kann keine Kategorie tragen | **Hart** löschen, Wiederherstellungs-Bausatz zurückgeben, Rücknahme über den 5-Sekunden-Toast. Kein neuer Enum-Wert, keine längere Retention |
| `D8` — `rls_auto_enable` legt keine Policy an und schluckt sein Scheitern | `ENABLE` **und** Policy explizit in der Migration |

**Daten:** Zehn Ordner nach Record §A3 — **nicht elf**. „Einkommen" trägt das
Nettogehalt, und das ist keine Karte; es ist ein Sammelbecken der Anzeige wie „Ohne
Kategorie". 45 von 46 Karten zugeordnet.

**Oberfläche:** Menüpunkt `Kategorie ändern …` auf **jeder** Karte, auch Ghost.
Overlay mit Liste, `Ohne Kategorie` als reguläre Wahl und `Neue Kategorie …`.

**Dateien:** `supabase/migrations/20260808_v2_17_kat1_kategorien.sql` ·
`…_kat1_zuordnung.sql` · `src/components/cards/category-overlay.tsx` ·
`card-interactive.tsx` · `actions.ts` · `cards.types.ts` · `cards.module.css` ·
`src/lib/rpc.ts` · `src/app/page.tsx`

### Phase 3 · `KAT-3` — die Ordner-Zahl, server-seitig und restverteilt

**Absicht:** Der vorzeichenrichtige Beitrag der enthaltenen Karten zur Sparrate —
dieselbe Summierung wie im Ring, nur gefiltert. Dadurch erbt der Ordner Vorzeichen,
Partner-Anteil und alle §4.3-Sonderfälle, statt sie nachzubauen; die Befunde `D2` und
`D5` können strukturell nicht auftreten.

**Das war die schwierigste Phase — und nicht aus dem Grund, den das Briefing nannte.**
Siehe §5.1.

**Dateien:** `supabase/migrations/20260808_v2_17_kat3_ordner_summen.sql` ·
`src/lib/rpc.ts`

### Phase 4 · `KAT-2` — das Karussell gruppiert und klappt

**Variante A:** Stapel-Kachel im Kartenformat (136 px), neutraler Grundton, **kein
Status-Icon**, gestapelte Kanten via `box-shadow`, linke Kante rot bei Offenem und
türkis bei Erledigtem.

**Die vier Regeln, die den Sprint tragen:**

| Regel | Umsetzung |
|---|---|
| **Kein Tap-Catcher** (`U3`) | Die Kachel ist ein `<button>`, der aufklappt — und sonst nichts tut |
| **Beim Ziehen öffnet sich alles** (`B4`) | `dragActive` überlagert `openKeys`; die Rückkehr ist automatisch, weil `openKeys` unangetastet bleibt. Damit ist `U1` (BLOCKER) gelöst, ohne dass eine zugeklappte Kategorie je ein Drop-Ziel braucht |
| **Aufklapp-Zustand überlebt den Monatswechsel** (`B7`) | Bewusste Gegenentscheidung zu LL-5. Beim Laden ist alles zu |
| **Zukunftsmonat blass ohne Flagge** (`C3`) | Sonst stünde dort türkis „erledigt", weil null Kinder offen sind |

**Einkommens-Ordner:** Das Netto als Kachel, ein Klick öffnet das **bestehende**
Einkommens-Fenster. Kein zweites Formular.

**Herausgelöst statt nachgebaut:** Die Zustands-Auflösung der Karten liegt jetzt in
`src/components/cards/card-state.ts`. Die Kachel zählt mit **denselben** Regeln, nach
denen die Karte sich färbt — eine zweite Fassung liefe nur so lange synchron, bis
jemand eine der beiden ändert.

**Dateien:** `carousel.tsx` (umgebaut) · `category-groups.ts` (neu, rein) ·
`category-tile.tsx` · `netto-tile.tsx` · `rename-category-overlay.tsx` ·
`card-state.ts` · `interaction-zone/index.tsx` · `interaction-zone.module.css` ·
`tokens.css` · `format.ts` · `tests/e2e/kategorien.spec.ts` · `playwright.config.ts`

---

## 2. Prüfstrecke

| Prüfung | Ergebnis |
|---|---|
| `tsc --noEmit` | **0 Fehler** |
| ESLint (`src`, Worktree-Umweg) | **0 / 0** — Exit 0 gegen `rtk proxy` verifiziert |
| `pnpm build` | **0 Fehler** |
| Bundle · Route `/` | **35 kB** (vorher 33,2 kB) |
| Bundle · First Load JS | **187 kB** (vorher 185 kB) |
| `pnpm test:visual` | **69 / 69** (48 vorher + **21 neu**) |
| `pnpm test:e2e` vollständig | **76 / 76**, inkl. **4 angemeldeter Render-Smokes** gegen Produktion |

**+1,8 kB für ein vollständiges neues Feature** — inklusive zweier Overlays, der
Ordner-Kachel und der Netto-Kachel.

**Die neue Spec ist in `playwright.config.ts` eingetragen.** Ohne diesen Eintrag wäre
sie stillschweigend nicht mitgelaufen, und die Gesamtzahl hätte den Unterschied nicht
verraten. Der Eintrag trägt jetzt einen Warnhinweis für den nächsten Sprint.

**Zusätzlich optisch geprüft:** Drei Screenshots bei 1440 px / `@2x` gegen die echten
Daten — Juli zugeklappt (11 Ordner in der Reihenfolge aus §A3), Juli mit geöffnetem
„Wohnen" (Klammer sichtbar, Stapel verschwunden, Chevron gedreht) und Dezember
(alle Ordner blass, keine Flagge). Das ersetzt **nicht** den Browser-Smoke des Users.

---

## 3. Anker vorher/nachher

**Produktion, `nflkobdfdhncrtjncpmq`, alle zwölf Monate, `SELECT` only.**

| Monat 2026 | Ist vorher | Ist nachher | Bewegung |
|---|---|---|---|
| Januar–April | 1.931,18 € | 1.931,18 € | **0,00 €** |
| Mai | −86,77 € | −86,77 € | **0,00 €** |
| Juni | 4.208,76 € | 4.208,76 € | **0,00 €** |
| Juli | −322,75 € | −322,75 € | **0,00 €** |
| August | 1.761,08 € | 1.761,08 € | **0,00 €** |
| September–Dezember | 1.824,08 € | 1.824,08 € | **0,00 €** |

**B2-Invariante** (`Σ delta = Ist − Plan`): **0,00 € in allen zwölf Monaten.**

**Prüfsummen-Vergleich Übung ↔ Produktion** (`md5(pg_get_functiondef(...))`): **alle
zehn** geprüften Funktionen identisch — die sechs neuen **und** die vier
Rechenfunktionen, die der Sprint nicht angefasst hat. Damit ist belegt, dass sie
byte-genau denselben Code tragen wie vorher.

**Übungs-Datenbank:** Anker **2.200,00 €** vor der Migration, während der Testreihe und
danach. Rollback vollständig — 0 Ordner, 0 Zuordnungen übrig.

### Der zweite Anker, neu mit diesem Sprint

| Monat 2026 | Sparrate | Summe der Ordner | Differenz |
|---|---|---|---|
| alle zwölf | *(siehe oben)* | **identisch** | **0,00 €** |

Juli im Detail: elf Ordner, Summe **−322,75 €**, deckungsgleich mit
`calculate_sparrate_for_month`.

---

## 4. Selbst-Review gegen die Akzeptanzkriterien

| # | Kriterium | Erfüllt | Beleg |
|---|---|---|---|
| A1 | Keine Kategorie wird eine `cards`-Zeile | ✅ | Eigene Tabelle; Anker 12/12 bei 0,00 € |
| A2 | Ordner-Summe aus ungerundeten Werten, am Ende gerundet | ✅ **und darüber hinaus** | Reichte nicht — siehe §5.1. Gelöst per Restverteilung |
| A3 | Die Kategorie-Kachel hat keinen Tap-Catcher | ✅ | `category-tile.tsx` — ein `<button>` mit `onToggle`, kein `toggleCardTap` |
| A4 | Neue Tabelle hat RLS **und** Policy | ✅ | Probe T1: `relrowsecurity = true`, `pg_policies` = 1 |
| A5 | Sparrate bewegt sich in keinem der zwölf Monate | ✅ | §3 |
| A6 | B2-Invariante in allen zwölf Monaten | ✅ | 0,00 € × 12 |
| A7 | Prüfstrecke grün, neue Spec in `testMatch` | ✅ | §2 |
| A8 | Elf Kategorien aus Record §A3, nichts erfunden | ✅ | Zehn Tabellenzeilen + Einkommens-Behälter; 45/46 Karten |
| A9 | Löschen nimmt die Karten nicht mit | ✅ | Probe T10: 2 Karten überlebt, 2 kategorielos, Ordner weg |
| A10 | Rücknahme stellt Ordner **und** Zuordnung wieder her | ✅ | Probe T11: gleiche ID, 2 Karten zurück |
| A11 | Auth-Guard auf allen neuen RPCs | ✅ | Alle fünf liefern `28000` ohne Session |
| A12 | Entwurfsseiten `rm2` / `pa1` entfernt | ✅ | `design-system/entwuerfe/` existiert nicht mehr |

---

## 5. Architektur-Entscheidungen

### 5.1 Der Cent — eine Zusicherung der Gestaltungsrunde war falsch

**Das ist der wichtigste Punkt dieses Sprints.**

Der Beschluss-Record führte unter „Neuer Fallstrick" eine klare Anweisung:

> *„Die Kategorie-Summe muss aus ungerundeten Kartenwerten gebildet und erst am Ende
> gerundet werden. Andernfalls ergibt die Aufstellung aus A4 −322,74 € statt −322,75 €.
> Die Ursache sitzt in Wohnen: Miete, Strom und Internet sind Split-Anteile mit vielen
> Nachkommastellen."*

**Beides nachgemessen — beides trifft nicht zu:**

1. **Innerhalb von „Wohnen" liefern beide Rundungsreihenfolgen dasselbe** (−1.148,17 €).
   Die genannte Ursache existiert nicht.
2. **Die Anweisung ist notwendig, aber nicht hinreichend.** Auch mit ungerundeter
   Summierung je Ordner ergibt die Spalte −322,74 €.

**Die wirkliche Ursache liegt eine Ebene höher.** `calculate_sparrate_for_month` rundet
**einmal ganz am Schluss über alles**:

```
exakter Kartenwert Juli   −4.487,8556895729755…
Netto                     +4.165,11
                          ─────────────────────
exakt                       −322,74569…  → round() → −322,75   ← die Sparrate
elf gerundete Ordner        −322,74                            ← die Aufstellung
```

Elf unabhängig gerundete Zahlen können diese eine Rundung prinzipiell nicht nachbilden.

**Und die Lücke bestand in allen zwölf Monaten**, nicht nur im Juli — getrieben von den
vier gemeinsamen Karten, die es in jedem Monat gibt.

**Am schärfsten:** Die Aufstellung in Record §A4 summiert sich **selbst** auf −322,74 €,
obwohl darüber −322,75 € steht und der Satz *„Deckt sich exakt mit
`calculate_sparrate_for_month`"* danebensteht. Das ist **LL-22 in Reinform** — eine
Zusicherung über Rechenverhalten, die nie gegen die Funktion geprüft wurde.

**Die Lösung** (vom User am 08.08. entschieden, Record Teil C1): Restverteilung. Alle
Ordner exakt gerechnet und gerundet, der verbleibende Rest wandert auf den
**betragsgrößten** Ordner. Das Ziel wird aus `calculate_sparrate_for_month` **geholt**,
nicht hergeleitet — man könnte zeigen, dass `round(Σ exakt, 2)` dasselbe ergibt, aber
genau solche Herleitungen sind das, wovor LL-22 warnt.

**Bewiesen, nicht behauptet:** Auf der Übungs-Datenbank mit einem Szenario, das den
Cent **erzwingt** (Split-Faktor exakt ⅓, drei Ordner zu je 0,3333…): ohne
Restverteilung 0,01 € daneben, mit ihr exakt auf die Sparrate. Auf Produktion in
12/12 Monaten.

**Bekannter Preis, benannt:** Im Juli zeigt „Wohnen" −1.148,18 € statt −1.148,17 €. Wer
nur diesen einen Ordner gegen seine drei Karten nachrechnet, findet die Abweichung.

### 5.2 Kein Papierkorb für Kategorien — Befund `D7` ohne Schema-Eingriff gelöst

Die naheliegende Antwort wäre ein neuer Enum-Wert `CATEGORY`, eine Anpassung von
`cleanup_expired_card_trash` und eine längere Retention gewesen — drei Eingriffe in
bestehende Lösch-Infrastruktur, mitten in einem Sprint, der die Sparrate nicht bewegen
darf.

**Stattdessen:** `delete_card_category` löscht hart und gibt zurück, was zur
Wiederherstellung nötig ist. Der bestehende 5-Sekunden-Toast hält den Bausatz. Kein
Enum-Wert, keine Retention-Änderung, keine Berührung von `deleted_entities`.

**Der Unterschied zur Karte ist inhaltlich, nicht technisch:** Beim Löschen einer
Kategorie geht nichts verloren, was nicht wiederherstellbar wäre — die Karten überleben
immer. Ein Papierkorb schützt vor Datenverlust; hier gibt es keinen.

### 5.3 Die Gruppierung ist eine reine Funktion, die Beträge kommen von außen

`buildCategoryGroups` ist bewusst ohne React und ohne Datenzugriff. Zwei Gründe:

1. **Prüfbarkeit.** Die Regeln, nach denen ein Ordner erscheint, verschwindet und sich
   einordnet, sind das Herz des Sprints — und sie sind einzeln prüfbar, statt nur im
   Rendern zu existieren. Dasselbe Muster wie `liquidity.ts` (v2-15).
2. **Die Trennung, die Arbeitsregel 1 verlangt.** Die **Gruppierung** entsteht im
   Frontend, aus genau den Karten, die auch gerendert werden — deshalb kann eine Kachel
   nicht behaupten, sie enthalte etwas anderes als das, was darunter steht. Die
   **Beträge** kommen fertig aus der Datenbank und werden nur zugeordnet.

Eine der 21 Prüfungen bewacht genau diese Grenze: Sie gibt einen Ordner-Betrag vor, der
**nicht** die Summe der Kartenbeträge ist, und verlangt, dass er unverändert
durchgereicht wird.

### 5.4 `KAT-3` vor `KAT-2` — Abweichung von der Auftrags-Reihenfolge

Das Briefing nannte `KAT-1 → KAT-2 → KAT-3`. Gebaut wurde `KAT-1 → KAT-3 → KAT-2`.

**Grund:** Die Kategorie-Kachel trägt eine Zahl — das ist der Kern von Variante A. Diese
Zahl darf nach Arbeitsregel 1 nicht im Browser entstehen. `KAT-2` vor `KAT-3` ergäbe
entweder eine Kachel ohne Betrag (nutzlos) oder eine verbotene Frontend-Rechnung.

### 5.5 Ein Sprint statt zwei

Die Datenbank wird dadurch **einmal** angefasst statt zweimal — und die Übungs-Datenbank
nur einmal geholt, was jedes Mal bedeutet, ein fremdes, täglich genutztes Projekt zu
pausieren. Der Rennrad-Trainer war rund zwei Stunden nicht erreichbar und ist auf
`ACTIVE_HEALTHY` zurückgeholt und verifiziert.

---

## 6. Offene Punkte und Fragen

### 6.1 Was der User entscheiden muss

1. **CLAUDE.md-Patches freigeben** (§7 Regel 14). Vier Vorschläge in
   `sprints/sprint_v2-17_doku_patches.md` Teil 3 — darunter die **Korrektur von
   Stolperfalle 4**, die heute schlicht falsch ist und einen Aufruf falsch bauen lässt.
2. **Die eine unzugeordnete Karte.** „Deutschlandticket Mama … | Abo 101627874 zum
   01.05.2026" (ONCE, Mai 2026) steht unter „Ohne Kategorie". Record §A3 ordnet sie
   nicht zu; **Mobilität** (Verkehrsmittel) und **Geschenke & Anlässe** (für Mama) sind
   beide plausibel. Bewusst nicht geraten — zwei Klicks im Mai räumen sie ein.
3. **Merge-Freigabe** nach dem Browser-Smoke.

### 6.2 Bewusst offen gelassen

- **Zwei gleichnamige Karten in einem Ordner.** „Fahrradzubehör" existiert im Juli
  zweimal (34,69 € und 305,45 €). Die Beträge liegen eine Größenordnung auseinander und
  die Statuszeile trägt verschiedene Termine (`am 14.` / `am 21.`) — ein zusätzliches
  Unterscheidungsmerkmal wäre Lärm, und Umbenennen ist Sache des Users.
- **Ob ein Ordner kenntlich macht, dass seine Zahl abgeleitet ist.** Nicht geprüft.
- **`M5`** hat einen Ort bekommen (`sort_order` in der Datenbank), ist aber nicht
  entschieden.
- **Der N+1-Ladeweg (`D14`) ist NICHT aufgeräumt.** Die Roadmap stellte das in
  Aussicht. `KAT-3` **fügt** keinen hinzu (ein Aufruf für alle Ordner), aber die
  bestehenden drei Aufrufe pro Karte stehen unverändert. Ein Loader-Umbau im selben
  Sprint hätte den Browser-Smoke mehrdeutig gemacht: Wäre etwas schiefgegangen, wäre
  nicht unterscheidbar gewesen, ob es an den Kategorien oder am Umbau liegt.
- **Das Einkommens-Popup — nachgeprüft, kein offener Punkt.** Der Altbestand aus
  `sprints/sprint_v2-10_offene_fragen.md` §6 („einziges von acht Overlays ohne
  Escape-Handler") ist **mit v2-16 geschlossen**; `income-split/index.tsx:59-66` trägt
  den Handler. Dieser Sprint öffnet dasselbe Popup an einer **zweiten** Stelle
  (Netto-Kachel im Einkommens-Ordner) und erbt ihn damit unverändert. Es war die einzige
  Stelle, an der v2-17 ein bestehendes Overlay wiederverwendet — die Prüfung stand also
  an, und sie ist grün.

### 6.3 Was beim Bauen auffiel und nicht im Auftrag stand

- **Der Kartenbestand ist 46, nicht 45.** Die Zwischenzählung im Sprint lag kurzzeitig
  daneben; nachgezählt gegen `cards` sind es 46, davon 45 zugeordnet.
- **`tests/` hat vier bestehende ESLint-Fehler** (`no-assign-module-variable` in
  `consequence`, `fragment-showcase`, `liquidity`, `ring-subline`). Die kanonische
  Prüfstrecke lintet nur `src`, deshalb fallen sie nicht auf. Die neue
  `kategorien.spec.ts` vermeidet das Muster (`mod` statt `module`). **Kein Handlungs-
  bedarf in diesem Sprint**, aber es ist ein leiser Rückstand.

---

## 7. Vorschläge für CLAUDE.md und Roadmap

**Roadmap: bereits nachgezogen** — Paket 4 auf ✅ und weggefallen, `J1` nach §4,
Zahlen zeilengenau ausgezählt (10 Pakete · 28 Themen · 4 Hausaufgaben · 32 offen ·
41 erledigt), Kennungs-Register aktualisiert, Kette-Abschnitt auf Paket 5 gedreht.

**CLAUDE.md: vier Vorschläge, nicht angewendet** — Volltext in
`sprints/sprint_v2-17_doku_patches.md` Teil 3:

| # | Was | Warum es zählt |
|---|---|---|
| C1 | **§6 Stolperfalle 4 korrigieren** | Sie ist falsch. `calculate_sparrate_for_month` und `calculate_planned_sparrate_for_month` nehmen sehr wohl `p_user_id`. Wer nach der bisherigen Fassung arbeitet, baut den Aufruf falsch |
| C2 | §9 Sprint-Stand nachziehen | v2-17, Doku-Versionen 3.5.0/3.5.0, Paket 4 erledigt, neue Roadmap-Zahlen. Prüfanker unverändert |
| C3 | §6 neue Stolperfalle 13 | Eine Aggregation über Teilmengen bildet die Schlussrundung nicht nach |
| C4 | §8 neuer Eintrag LL-25 | Eigener Eintrag neben LL-24: Dort rundet die Gegenseite **anders**, hier **seltener** — andere Fehlerklasse |

**Zusätzlicher Vorschlag für §9:** Die Ordner-Spalte ist ab jetzt ein **zweiter
Prüfanker** neben der Sparrate. Sie ist in einem Aufruf messbar und schlägt an, sobald
jemand an der Rundung dreht:

```sql
SELECT sum((e->>'amount')::numeric)
  FROM jsonb_array_elements(get_category_amounts_for_month('<user>', '<monat>')) e;
-- muss exakt calculate_sparrate_for_month('<user>', '<monat>') ergeben
```
