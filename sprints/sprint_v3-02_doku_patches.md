# Sprint v3-02 — Doku-Patches (Schema-Doku und Design-Doku)

> Verfahren nach **§7 Regel 14 / LL-16**: Anker + Patch-Satz je Stelle, angewendet durch
> den Subagenten `docs-maintainer`. Die Bibeln werden nie direkt editiert. Jeder Anker ist
> per `grep -c` auf Eindeutigkeit geprüft (Erwartung `1`).
>
> **Schema-Doku:** 3.16.0 → **3.17.0** (Minor — eine neue Funktion im RPC-Katalog und
> eine korrigierte Aussage in §8; Präzedenzfall v2-31 → 3.16.0).
> **Design-Doku:** 3.14.1 → **3.14.2** (Patch — nur ein Verweis; keine Regel ändert sich).

---

# Teil A · Schema-Doku (`antigravity_finance_schema_summary.md`)

## Patch A1 · Kopfzeile (Version)

**Anker (Zeile 3):**

```
**Version:** 3.16.0
```

**Patch-Satz (ersetzt die Zeile):**

```
**Version:** 3.17.0
```

## Patch A2 · Changelog-Eintrag (direkt VOR dem Block „Changelog v3.16.0")

**Anker:**

```
> **Changelog v3.16.0 (31.08.2026, Sprint v2-31):** Zwei neue, rein **lesende**
```

**Patch-Satz — davor einfügen, mit einer Leerzeile Abstand:**

```
> **Changelog v3.17.0 (07.09.2026, Sprint v3-02):** Eine neue, rein **lesende** Funktion
> `get_open_fragment_candidates` für `/mobil` (§4) — dieselbe Regel wie `history_match`
> Stufe 1, als Liste mit Zähler statt als Ja/Nein — und **ein Sicherheitsfix an der View**
> `fragments_with_status`: Sie läuft seit dieser Migration mit `security_invoker = true`
> (§8). Gemessen vorher: Ein angemeldeter Fremder bekam über die View alle **2.219**
> Zahlungen, über die Tabellen dahinter **0**. Keine Rechenfunktion geändert — neun
> Prüfsummen unverändert, 24 Sparraten byte-identisch, Anker 1 und 2 in 24/24
> (`sprints/sprint_v3-02_anker.md`).

```

## Patch A3 · §4 — neuer Abschnitt VOR „Netto-Zuordnung"

**Anker:**

```
### Netto-Zuordnung (v2-19, `GE-1`)
```

**Patch-Satz — davor einfügen, mit einer Leerzeile Abstand danach:**

```
### Für `/mobil` (Sprint v3-02 · `MB-2`)

| Funktion | Wofür | Returns |
|---|---|---|
| `get_open_fragment_candidates(p_user_id, p_month)` | **Auf welchen Karten lag derselbe Händler bisher von Hand?** Je offener Zahlung des Monats (`transaction_date` im Monat, Status `UNASSIGNED`, `merchant_key <> ''`) eine Zeile pro Karte mit Zähler `treffer` — **dieselben vier Bedingungen wie `history_match` Stufe 1** (`merchant_key`, `origin = MANUAL_DROP`, `transfer_type IS NULL`, nicht das Fragment selbst), nur als Liste statt als Ja/Nein: Jene schweigt, sobald der Händler auf mehreren Karten liegt, und genau diesen Zweifelsfall zeigt `/mobil` als Kandidaten (gemessen am 07.09.2026: bei 121 von 476 offenen Zahlungen). **Nur Karten, die im angezeigten Monat aktiv sind** (`is_card_active_in_month`, aufgerufen, nicht nachgebaut); der Planer schiebt diese Prüfung an die Verknüpfungs-Zeilen vor — gemessen 4 ms unter der App-Rolle bei 11 offenen Zahlungen und 211 Verknüpfungs-Zeilen, beide Indizes greifen. **Ein Aufruf je Aufbau für den ganzen Stapel**, kein N+1 (LL-28/29). `STABLE`, `SECURITY INVOKER`, `SET search_path`. ⚠️ Wer eine der vier Bedingungen in `history_match` ändert, ändert sie hier mit — sonst zeigt das Handy andere Kandidaten, als die Wiedererkennung kennt (LL-26, Form „Nachbauen"). Probe: `sprints/sprint_v3-02_anker.md`, Testreihe T1–T7 | `TABLE (fragment_id uuid, card_id uuid, treffer integer)` |

```

## Patch A4 · §8 — die View-Zeile in der RLS-Tabelle

**Anker:**

```
| `fragments_with_status` (View) | Erbt von `fragments` + `card_fragment_links` | (View, nicht beschreibbar) |
```

**Patch-Satz (ersetzt die Zeile):**

```
| `fragments_with_status` (View) | **`security_invoker = true` seit v3-02** — die Zeilenregeln von `fragments` + `card_fragment_links` gelten für den **Aufrufer** (vorher: für den Eigentümer `postgres`, siehe Kasten unten) | (View, nicht beschreibbar) |
```

## Patch A5 · §8 — Kasten nach der Owner-Zeile

**Anker:**

```
**Owner = `auth.uid() = user_id`**. Keine Cross-User-Sichtbarkeit. Service-Role (Migrations, Admin-Tools) umgeht RLS.
```

**Patch-Satz — danach einfügen, mit einer Leerzeile Abstand:**

```
> **⚠️ Eine View läuft mit den Rechten ihres EIGENTÜMERS, nicht des Aufrufers** (Befund
> v3-02, 07.09.2026). `fragments_with_status` gehört `postgres`, und diese Rolle trägt
> `BYPASSRLS` — „erbt von `fragments`" stand in der Tabelle oben bis zum 07.09.2026 und war
> **falsch**: Gemessen als Rolle `authenticated` mit fremder Nutzer-ID lieferte die View
> **2.219** Zeilen, die Tabellen dahinter **0**. Die App las Rohmasse, Schaufenster und
> Nachbar-Zähler ausschließlich über diese View. **Mit einem Nutzer sah die falsche Antwort
> genauso aus wie die richtige.** Seit `20260907_v3_02_view_security_invoker.sql` trägt die
> View `security_invoker = true`; danach 0 / 0 für den Fremden, 2.219 / 2.219 für den
> Eigentümer — auf Übungs-DB und Produktion gemessen. **Regel:** Wer eine View anlegt oder
> liest, setzt `security_invoker` und misst als Fremder, nicht nur als Eigentümer.
```

---

# Teil B · Design-Doku (`antigravity_finance_design_dokument.md`)

## Patch B1 · Kopfzeile (Version)

**Anker (Zeile 3):**

```
**Version:** 3.14.1 (V3 · Sprint v3-01 — Apple-Redesign vollständig nachgezogen)
```

**Patch-Satz (ersetzt die Zeile):**

```
**Version:** 3.14.2 (V3 · Sprint v3-02 — die Route `/mobil` ist per Verweis dokumentiert)
```

## Patch B2 · Changelog-Eintrag (direkt VOR dem Block „Changelog v3.14.1")

**Anker:**

```
> **Changelog v3.14.1 (06.09.2026, Sprint v3-01 · Teil 2 von 2):** Die
```

**Patch-Satz — davor einfügen, mit einer Leerzeile Abstand:**

```
> **Changelog v3.14.2 (07.09.2026, Sprint v3-02):** Die Route **`/mobil`** existiert
> (Tab „Zuordnen", 430 px). Dieses Dokument bleibt die Bibel der **Schreibtisch**-Ansicht;
> die Spezifikation von `/mobil` steht im Handoff-README
> (`design-system/handoff/mobile/README.md`) und im Design-Record
> (`V2/design_direktor_2026-09-07_mobil.md`). Hier nur der Verweis in §13, damit das
> Ein-Screen-Prinzip aus §1 nicht ohne Erklärung neben einer zweiten Route steht. Keine
> Regel dieses Dokuments ändert sich.

```

## Patch B3 · §13 — Verweis auf `/mobil` direkt unter der Überschrift

**Anker:**

```
## 13. Bekannte Limitationen V1
```

**Patch-Satz — danach einfügen, mit einer Leerzeile Abstand davor und danach:**

```
> **`/mobil` (seit v3-02, 07.09.2026):** eine zweite, eigene Route zum Zuordnen per Tipp —
> **kein** Responsive-Umbau dieser Ansicht. Ihre Spezifikation liegt nicht hier, sondern im
> Handoff-README (`design-system/handoff/mobile/README.md`) und im Design-Record
> (`V2/design_direktor_2026-09-07_mobil.md`); bei Widerspruch gilt dort der Record. Was
> beide Ansichten teilen, steht hier: die Tokens (§3), die Sparrate (§4) und die
> Schreibregel für Zuordnungen (§8, Schema-Doku §5) — eine Zuordnung vom Handy ist in der
> Datenbank von einer per Drag & Drop ununterscheidbar (`src/lib/card-links.ts`).
```

---

## Prüfung nach der Anwendung

- `grep -c` je Anker **vor** dem Patch → `1`.
- Danach: Schema-Doku Zeile 3 = `3.17.0`, Design-Doku Zeile 3 = `3.14.2`; §4 der
  Schema-Doku enthält `get_open_fragment_candidates` genau in **einem** Abschnitt.
- `pnpm test:visual` (der Wächter `doku-vollstaendigkeit.spec.ts` läuft mit).
