# Sprint v2-23 — Review

> **Branch:** `sync/v2-21-v2-22-und-historie` (bewusst kein eigener — siehe §5)
> **Commit:** `91ae0c8` · **Datum:** 16. August 2026 · **Thema:** `ZU-1`
>
> **In einem Satz:** Eine automatisch zugeordnete Zahlung zählt wieder an ihrer
> Karte — die Karte sagt „Bezahlt" und zeigt die Zahlung, statt beides zu
> verschweigen.

---

## 1. Was gebaut wurde

### Der Befund kam vom Nutzer, nicht aus der Prüfstrecke

> *„Auf der Spotify-Karte steht trotz automatischer Zuordnung noch offen und es ist
> auch kein Fragment hinterlegt."*

Beide Beobachtungen stimmten — und meine Messung in der Datenbank stimmte auch. Der
Bruch lag dazwischen.

### Die Ursache

`src/app/page.tsx` baute die Liste der verknüpften Zahlungen je Karte mit:

```ts
if (f.status === "ASSIGNED" && f.assigned_card_id && f.assigned_month === targetDbDate)
```

Die View `fragments_with_status` kennt aber **zwei** zugeordnete Zustände:

| Status | Bedeutung |
|---|---|
| `ASSIGNED` | Der Nutzer hat die Zahlung auf die Karte gezogen |
| `AUTO_ABSORBED` | Die App hat ab 95 % Konfidenz beim Import selbst zugeordnet (§11) |

Die Unterscheidung ist für die **Herkunft** gedacht — das Schaufenster schreibt
„automatisch erkannt" —, nicht für die Frage, **ob** verknüpft ist. Der Filter hat sie
als Ob-Frage gelesen.

Folge: `card.linkedFragments` blieb leer, und `card-state.ts:26` entscheidet genau
daran:

```ts
return card.manuallyPaid || hasFragment ? "paid" : "open";
```

### Die Behebung

Ein benanntes Prädikat `isLinkedToCard` in `interaction-zone.types.ts`, direkt neben
dem vorhandenen `isTransferFragment` — **kein zweiter `||`-Vergleich an der
Fundstelle.** Ein Einzelwert-Vergleich ist genau die Bauart, die den Fehler erzeugt
hat; ein Prädikat lässt sich einzeln prüfen und wächst mit, falls je ein dritter
zugeordneter Zustand dazukommt.

**Berührt:** `interaction-zone.types.ts` · `page.tsx` · `tests/e2e/zuordnung.spec.ts`
(neu) · `playwright.config.ts`

---

## 2. Prüfstrecke

| Prüfung | Erwartet | Gemessen |
|---|---|---|
| `tsc --noEmit` | 0 | **0** ✅ |
| ESLint | 0/0 | **0/0** ✅ |
| `pnpm build` | 0 | **0** ✅ · First Load JS 87,3 kB geteilt, unverändert |
| `pnpm test:visual` | steigt nur um eigene Tests | **100/100** ✅ (94 → 100, die sechs neuen) |

**Gegenprobe gefahren.** Mit der alten Bedingung (`=== "ASSIGNED"` allein) fallen
**zwei** Tests um: der direkte Fall und der strukturelle Wächter, der dann bemerkt,
dass `AUTO_ABSORBED` durch alle Raster fällt. Ein Wächter, der auch ohne die Reparatur
grün bliebe, wäre wertlos.

---

## 3. Anker vorher/nachher

**Reines Frontend — kein Datenbank-Eingriff, keine Migration, keine Datenänderung.**
Der Anker *kann* sich strukturell nicht bewegen; gemessen wurde er trotzdem:

| Monat 2026 | Ist | Plan |
|---|---|---|
| Mai | −86,77 | −86,77 |
| Juni | 4.208,76 | 4.220,53 |
| Juli | −8,84 | 23,93 |
| August | 721,24 | 796,23 |

Identisch zu jeder Messung dieser Sitzung.

> **Warum die Sparrate nie betroffen war** — und das ist der beruhigende Teil des
> Befunds: `calculate_sparrate_for_month` liest `card_fragment_links` **direkt**, nicht
> über den Status. Der angezeigte Kartenbetrag kommt ebenfalls aus der Datenbank
> (`calculate_card_amount_for_month`, 12,99 € für Spotify). Falsch war ausschließlich,
> was die Karte **über sich selbst** sagte.

---

## 4. Selbst-Review gegen die Akzeptanzkriterien

| # | Kriterium | Erfüllt | Beleg |
|---|---|---|---|
| A1 | Eine automatisch zugeordnete Zahlung zählt an ihrer Karte | ✅ | `isLinkedToCard` deckt beide Zustände; Test 2 |
| A2 | Eine offene Zahlung zählt **nicht** | ✅ | Test 3 |
| A3 | Überträge zählen nie | ✅ | Test 4 — §6 Stolperfalle 7 |
| A4 | Jeder Status ist genau einer Gruppe zugeordnet | ✅ | Test 5, über alle fünf Werte |
| A5 | Die Status-Liste im Test veraltet nicht unbemerkt | ✅ | Test 6 vergleicht sie gegen den Typ in der Quelldatei |
| A6 | Keine Sparrate bewegt sich | ✅ | §3 |
| A7 | Testzahl steigt nur um eigene Tests | ✅ | 94 → 100 |
| A8 | Neue Spec in `testMatch` | ✅ | `playwright.config.ts` |

---

## 5. Architektur-Entscheidungen

| Entscheidung | Alternative | Warum so |
|---|---|---|
| **Benanntes Prädikat** `isLinkedToCard` | `f.status === "ASSIGNED" \|\| f.status === "AUTO_ABSORBED"` an Ort und Stelle | Der Einzelwert-Vergleich *ist* die Fehlerbauart. Ein Prädikat ist einzeln prüfbar (dieselbe Lehre wie `BF-2` in v2-12 und `ZO-2` in v2-22) und hat genau einen Ort, an dem ein dritter Zustand nachgetragen würde |
| **Struktureller Test** („jeder Status genau einer Gruppe") | nur die drei Einzelfälle prüfen | Die Einzelfälle prüfen, was ich heute weiß. Der strukturelle Test fängt den **nächsten** Status, der dazukommt — genau so ist `AUTO_ABSORBED` in v2-07 durchgerutscht |
| **Test prüft die Status-Liste gegen den Typ** | Liste im Test pflegen | Sonst bleibt der strukturelle Test grün, während er eine veraltete Liste prüft — ein Wächter, der sich selbst blind macht |
| **Kein eigener Branch** | `sprint/v2-23-zuordnung` auf `sync/…` | Genau dieses Muster ist am 16.08. schiefgegangen: Zwei PRs auf ungemergte Feature-Branches sahen nach „merged" aus, ohne in `main` zu landen. Ein zweiter Kettenglied-PR hätte den Fehler wiederholt. v2-23 ist vier Dateien groß — er läuft im selben PR mit |

---

## 6. Offene Punkte und Fragen

**① Der Browser-Smoke steht aus.** Zu prüfen: Die Spotify-Karte zeigt in **Mai bis
August** „Bezahlt" statt „Offen", und im Karten-Overlay steht die Zahlung
(−12,99 €). Die Sparrate darf sich in **keinem** Monat ändern.

**② Eine kleine Nebenwirkung, die richtig ist:** In der Liquiditäts-Anzeige („noch
fällig") fiel Spotify bisher nicht heraus, weil `linkedFragments` leer war. Ab jetzt
tut es das. **Heute ohne Wirkung** — Spotifys Termin ist der 3., der ist längst durch;
am 1. bis 3. eines Monats war die Zahl aber um 12,99 € zu hoch.

**③ Nicht geprüft: ob es weitere Aufzählungen gibt, die einen Wert vergessen.**
Ich habe alle Stellen durchgesehen, die `status` auswerten — die sind richtig. Aber
dieselbe Bauart kann anderswo auftreten (Enums aus `link_origin`, `card_type`,
`transfer_type`). Ein gezielter Durchgang wäre eine eigene Hausaufgabe.

---

## 7. Vorschläge für CLAUDE.md und Roadmap

**Für CLAUDE.md: ein Vorschlag, nicht angewendet** (§7 Regel 14 — braucht Freigabe).

> **§6 Stolperfalle 16 erweitern** (nicht neu anlegen — es ist dieselbe Lehre, jetzt
> in dritter Ausprägung):
>
> **Auch ein Frontend-Filter, der EINEN Wert prüft, wo die Datenbank MEHRERE kennt,
> hebt ihre Entscheidung auf.** `fragments_with_status` unterscheidet `ASSIGNED` und
> `AUTO_ABSORBED`, um die **Herkunft** einer Zuordnung zu zeigen. `page.tsx` las das
> als **Ob**-Frage und filterte auf einen Wert — die vier automatisch zugeordneten
> Zahlungen zählten dadurch an ihrer Karte nicht mit, obwohl sie in jeder Sparrate
> steckten. **Wer einen Status vergleicht, prüft, ob die Menge dahinter größer ist als
> der eine Wert** — und schreibt ein benanntes Prädikat statt eines Vergleichs.
> (v2-23, `ZU-1`)

Die bisherigen zwei Ausprägungen bleiben: v2-19 kürzte eine Antwort (`getTop3Drivers`),
v2-20 baute eine Regel nach (Lösch-Tor), v2-21 verwendete eine Schwelle als
Stellvertreter. **Vier Fälle in fünf Tagen** — das ist kein Zufall mehr, sondern die
teuerste Fehlerklasse dieses Projekts.

**Für die Roadmap: bereits nachgezogen** — `ZU-1` als erledigt in §4.
