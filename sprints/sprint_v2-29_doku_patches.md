# Sprint v2-29 · Doku-Patches

**Verfahren nach §7 Regel 14 / LL-16:** Anker + Patch-Satz je Stelle, keine direkte
Bearbeitung der Bibeln. Jeder Anker wurde vor der Anwendung einzeln auf
**Eindeutigkeit** geprüft (`grep -c`).

| Datei | von | auf |
|---|---|---|
| `antigravity_finance_schema_summary.md` | 3.13.0 | **3.14.0** |
| `antigravity_finance_design_dokument.md` | 3.11.0 | **3.12.0** |

---

## S1 · Schema-Doku §4 — `history_match` wird zweistufig

**Anker** (Zeilenanfang, eindeutig):
`| \`history_match(fragment_id, card_id)\` **(v2-21)** |`

**Patch:** Die ganze Zeile wird ersetzt. Die alte Fassung beschrieb den Vergleich als
„identische Beschreibung" — das ist seit v2-29 nur noch **Stufe 2**.

---

## S2 · Schema-Doku §4 — `af_merchant_key` ist neu

**Anker:** dieselbe Zeile wie S1; die neue Zeile wird **davor** eingefügt, damit die
Hilfsfunktion vor ihrem Aufrufer steht (wie `af_normalize_text` vor
`name_similarity_scoped`).

---

## S3 · Schema-Doku §4 — `calculate_match_confidence` bleibt inhaltlich, bekommt aber einen Satz

**Anker:** `Beide Untergrenzen benutzen dasselbe \`GREATEST\` und **heben nur an, sie senken nie**; die Reihenfolge ist deshalb ohne Wirkung`

**Patch:** Ein Halbsatz ergänzt, dass die Funktion selbst in v2-29 **byte-identisch**
geblieben ist (Prüfsumme belegt) und sich nur das Verhalten von `history_match`
darunter geändert hat. Wichtig, weil sonst jemand die Änderung hier sucht.

---

## D1 · Design-Doku §11 — die Badge-Tabellenzeile

**Anker:** `| Vorschlag-Badge (nur 0.60–0.95) | \`7.5px\`, \`font-weight: 600\`, uppercase |`

**Patch:** Die Zelle „Seit v2-10 nicht mehr gerendert" bleibt richtig — das **Badge**
wird weiterhin nicht gerendert. Ergänzt wird der Verweis auf die **neue Zeile**, die
seit v2-29 an seiner Stelle steht, damit die Tabelle nicht den Eindruck erweckt, es
gäbe gar keine Anzeige.

---

## D2 · Design-Doku §11 — der Absatz „Nicht mehr gerendert"

**Anker:** `**Nicht mehr gerendert (v2-10, BF-1):**`

**Patch:** Ein neuer Absatz **dahinter**, der die Vorschlagszeile spezifiziert:
Position, Ton, Größe, Kürzung, und die Breitenmessung, die gegen das Badge entschieden
hat. Der bestehende Absatz bleibt **unverändert** — er beschreibt korrekt, warum das
Badge weg ist, und diese Begründung gilt fort.

---

## V · Versions-Bumps und Changelog

Eigene Patch-Stellen, keine Nebensache:

- Schema-Doku Kopfzeile `**Version:** 3.13.0` → `3.14.0` plus Changelog-Absatz
- Design-Doku Kopfzeile `**Version:** 3.11.0 (…)` → `3.12.0 (…)` plus Changelog-Absatz
- Design-Doku Status-Zeile: Schema-Doku-Verweis `v3.13.0` → `v3.14.0`

---

## Was ausdrücklich NICHT gepatcht wird

| Stelle | Warum |
|---|---|
| Schema-Doku `frequency_match` | Unangetastet (`ZO-1` bleibt offen). Der Warnkasten dort gilt unverändert. |
| Schema-Doku `merchant_rule_match` | v2-28, unberührt. |
| Design-Doku §12 UI-Copy | Der Wortlaut `KI-Vorschlag: [Karten-Name]` ist **unverändert** — er stand schon so in §11. Nur Ort und Ton haben sich geändert, nicht der Text. |
| Design-Doku §3 Tokens | `--text-ghost` existiert bereits; kein neuer Token. |
| `design-system/` | Weder Tokens noch Komponenten der Formensprache geändert — die Vorschlagszeile benutzt einen bestehenden Token in einer bestehenden Komponente. |
