---
name: db-eingriff
description: Verbindlicher Ablauf für JEDEN Eingriff in die Datenbank von Antigravity Finance — Migration, neue oder geänderte RPC, Änderung an einer Rechenfunktion, daten-mutierender E2E-Lauf. Deckt den Slot-Tausch der Übungs-Datenbank, den RAISE-Rollback-Trockenlauf (LL-18), die Anker-Messung vorher/nachher und den Rücktausch ab. Vor dem ersten SQL-Statement laden, nicht erst bei der Migration. NICHT nötig für reine Lese-Abfragen und reine Frontend-Sprints.
---

# Eingriff in die Datenbank

In der Produktiv-Datenbank liegen **echte Finanzdaten**. Es gibt keine
Rückgängig-Taste und keinen zweiten Nutzer, der einen Fehler bemerkt. Dieser Ablauf
ist deshalb nicht optional.

**Der Ablauf ist zweimal vollständig gefahren worden** (v2-05 Lösch-Umbau, v2-06
B2-Treiber) und beide Male ohne Zwischenfall. Einmal wurde er begründet ausgelassen
(v2-07 war ein reiner Frontend-Sprint). Er ist stabil — nur nirgends verbindlich
aufgeschrieben gewesen, bevor es diese Datei gab.

---

## Brauche ich diesen Ablauf überhaupt?

| Vorhaben | Übungs-DB nötig? |
|---|---|
| Migration (Tabelle, Spalte, Index, Trigger, Enum, Constraint) | **ja** |
| Neue RPC oder Änderung an einer bestehenden | **ja** |
| Änderung an `calculate_card_amount_for_month` / `calculate_sparrate_for_month` | **ja, zwingend** |
| Daten-mutierender E2E-/Testlauf | **ja** |
| Reines Lesen (SELECT, `get_*`-RPC ohne Schreibpfad) | nein |
| Frontend-Sprint ohne DB-Berührung | nein — dann diese Fähigkeit schließen |

Im Zweifel: ja. Der Tausch kostet Minuten, ein stiller Rechenfehler in der Sparrate
kostet Monate Vertrauen in die Zahlen.

---

## Die Projekte

| Rolle | Projekt-ID | Zustand im Normalfall |
|---|---|---|
| **Produktion** | `nflkobdfdhncrtjncpmq` | aktiv, Echtdaten |
| **Übung** | `qyjuzzgqxowqiiwqcahd` (`antigravity-finance-test`) | **pausiert** |
| **Fremd — nicht Teil dieses Projekts** | `uyefsjbckqxwxidcpmog` („Rennrad-Trainer") | aktiv |

Der Free-Tarif erlaubt **zwei** aktive Projekte gleichzeitig. Produktion belegt einen
Platz dauerhaft, um den zweiten konkurrieren Übungs-DB und Rennrad-Trainer. Daher
der Tausch.

> **Der Rennrad-Trainer wird täglich morgens und abends benutzt.** Ihn nur
> **tagsüber** pausieren und noch am selben Tag zurückholen. Das Restore-Fenster
> pausierter Free-Projekte liegt bei rund 90 Tagen — es ist keine Deadline, auf die
> man zusteuern sollte.

---

## Ablauf

### 1 · Anker vorher messen — auf **beiden** Seiten

Vor jeder Berührung. Ohne Vorher-Wert ist der Nachher-Wert wertlos.

```sql
-- Produktion, alle 12 Monate des laufenden Jahres
SELECT to_char(m, 'YYYY-MM')                                   AS monat,
       calculate_sparrate_for_month('<user_id>', m::date)      AS ist,
       calculate_planned_sparrate_for_month('<user_id>', m::date) AS plan
FROM generate_series('2026-01-01'::date, '2026-12-01'::date, '1 month') m
ORDER BY 1;
```

Ergebnis **in den Sprint-Review kopieren**, nicht nur ansehen. Die aktuellen
Sollwerte stehen in `CLAUDE.md §9`.

**Anker der Übungs-DB: 2.200,00 €** (März, synthetisch aus 3.000 Netto − 1.000
Fixkosten + 200 Einnahme; Seed: `supabase/test_projekt/init2_seed.sql`).

### 2 · Slot tauschen

1. Rennrad-Trainer `uyefsjbckqxwxidcpmog` **pausieren**.
2. Übungs-DB `qyjuzzgqxowqiiwqcahd` **restoren**, warten bis `ACTIVE_HEALTHY`.
3. Anker der Übungs-DB messen: **2.200,00 €**. Weicht er ab, ist die Übungs-DB nicht
   im erwarteten Zustand — **anhalten**, nicht migrieren.

### 3 · Migration auf der Übungs-DB proben

Die Migration **wortgleich** einspielen, wie sie später auf Produktion laufen soll.
Kein „auf der Übungs-DB reicht die Kurzfassung" — dann prüft man etwas anderes, als
man später ausführt.

Danach eine Testreihe fahren (`T1 … Tn`), und zwar **in einer Transaktion, die am
Ende zurückgerollt wird** (siehe Trockenlauf unten). Erprobter Umfang:

- Auth-Guard: Aufruf ohne Session → erwarteter Fehler (`28000`)
- Bereichs-Validierung der Parameter (`22023`)
- Leerfall: keine Daten → definierte Antwort, kein Absturz
- Fachliche Fälle: je einer pro Verzweigung der neuen Logik
- Fremd-Nutzer sieht nichts (RLS)
- **Anker erneut messen: unverändert 2.200,00 €**

> v2-05 hat auf diesem Weg **einen echten Fehler im Entwurf gefunden** (falscher
> Append-Operator auf `text[]`), bevor er Produktion erreichte. Das ist der ganze
> Zweck des Schritts.

> **Die Reihe zweimal fahren — einmal VOR der Migration.** Der Baseline-Lauf gegen
> die unveränderte Funktion kostet nichts (alles rollt ohnehin zurück) und liefert
> zwei Dinge, die der Nachher-Lauf allein nicht kann: Er belegt, dass die Migration
> **genau** das ändert, was sie ändern soll — und er entlarvt Fehler im Testaufbau.
>
> In v2-11 hat er beides getan: Eine Budget-Testkarte war versehentlich ab Januar
> aktiv und zog den Anker innerhalb der Transaktion von 2.200 auf 2.050. Das sah aus
> wie eine Wirkung der Migration, war aber ein Fehler in der Probe. Ohne den
> Vorher-Lauf wäre er als Migrationsfehler missdeutet worden — oder schlimmer, als
> hinnehmbare Abweichung durchgewinkt.
>
> Faustregel: **Die Zeilen, die sich NICHT bewegen dürfen, sind der eigentliche
> Beweis.** Ohne Vorher-Wert kann man sie nicht zeigen.

### 4 · Der Trockenlauf (LL-18)

So prüft man eine **mutierende** RPC gegen eine echte Datenbank, ohne etwas zu
hinterlassen: die Exception rollt alles zurück und trägt das Ergebnis in ihrer
eigenen Fehlermeldung nach draußen.

```sql
DO $$
DECLARE r jsonb;
BEGIN
  -- setzt auth.uid() für diesen Block
  PERFORM set_config('request.jwt.claims',
                     '{"sub":"<user_id>","role":"authenticated"}', true);

  r := meine_rpc(...);           -- echter Aufruf, echte Parameter

  RAISE EXCEPTION 'RESULT=%', r::text;   -- rollt ALLES zurück
END $$;
```

Das Ergebnis erscheint als Fehlertext `RESULT={…}`. Das ist der Erfolgsfall.

> ### Die teure Falle
>
> **Niemals echte Mutationen in denselben Aufruf packen wie den Trockenlauf.**
> Der `RAISE` rollt den **gesamten** Aufruf zurück — auch alles, was davor
> absichtlich geschrieben wurde.
>
> Am 25.07.2026 ist genau das passiert: eine Korrektur am Partner-Einkommen stand
> im selben Aufruf wie die Verifikation und wurde stillschweigend mit
> zurückgerollt. Gefangen hat es nur die Nachher-Messung — deshalb Schritt 6.
>
> **Regel:** mutieren und verifizieren sind zwei getrennte Aufrufe. Immer.

Hinweis: über MCP läuft die Verbindung als Service-Rolle **an RLS vorbei**.
Ownership-Prüfungen müssen deshalb unabhängig geprüft werden (Fremd-Nutzer-Fall),
sie fallen hier nicht von selbst auf.

### 5 · Produktion — erst nach grüner Probe

1. Migration als Datei unter `supabase/migrations/JJJJMMTT_<thema>.sql` ablegen.
   Seit v2-04 ist das Pflicht; die Altbestände der Sprints 5–8 liegen nur in
   Supabase (Roadmap J1).
2. **Menschliche Freigabe einholen.** Das ist ein Gate, keine Formalie.
3. Migration wortgleich auf `nflkobdfdhncrtjncpmq` anwenden.

### 6 · Anker nachher messen

Dieselbe Abfrage wie in Schritt 1, **alle 12 Monate**. Erwartung, sofern der Eingriff
keine Zahlen bewegen sollte: **jede Zeile identisch**.

Bewegt sich etwas, das sich nicht bewegen sollte → zurückrollen, nicht erklären.

Soll sich etwas bewegen, ist der erwartete Wert **vorher** aufzuschreiben. Beispiel
aus dem Befund vom 04.08.2026: „Ist-Sparrate Juli −1.222,75 € → **−322,75 €**,
exakt +900,00 €, alle anderen Monate unverändert." So sieht ein brauchbarer
Prüfanker aus.

Bei Treiber-Änderungen zusätzlich die Invariante prüfen:
**`Σ delta = Ist-Sparrate − Plan-Sparrate`** für jeden Monat.

### 7 · Zurücktauschen — der Schritt, der vergessen wird

1. Übungs-DB `qyjuzzgqxowqiiwqcahd` **pausieren**.
2. Rennrad-Trainer `uyefsjbckqxwxidcpmog` **restoren**.
3. **Status `ACTIVE_HEALTHY` verifizieren.** Nicht „Restore angestoßen" — den
   Zustand tatsächlich abfragen. Es ist eine fremde, täglich genutzte Anwendung.

---

## Abschluss-Checkliste

- [ ] Anker Produktion **vorher** gemessen und im Review notiert
- [ ] Slot getauscht, Übungs-DB auf 2.200,00 € geprüft
- [ ] Migration wortgleich auf der Übungs-DB geprobt
- [ ] Testreihe `T1 … Tn` grün, in zurückgerollter Transaktion
- [ ] Anker Übungs-DB nach der Probe unverändert
- [ ] Migrationsdatei unter `supabase/migrations/` abgelegt
- [ ] **Menschliche Freigabe für Produktion eingeholt**
- [ ] Migration auf Produktion angewendet
- [ ] Anker Produktion **nachher** gemessen, Abweichung = erwartete Abweichung
- [ ] Übungs-DB pausiert, Rennrad-Trainer zurück auf `ACTIVE_HEALTHY`
- [ ] Schema-Doku-Patch beauftragt (Subagent `docs-maintainer`, LL-16)

---

## Weiterführend

- `supabase/test_projekt/README.md` — Wiederaufbau der Übungs-DB von Null
  (Struktur-Extraktion, Generator-Abfragen, Init-2-Seed)

> **Bekannter Fehler in dieser Datei (Stand 04.08.2026):** Zeile 66 nennt als
> Prod-Anker „Juni 2026 = 4.545,32 €". Der Wert ist seit dem 2025er-Import überholt;
> gültig ist **4.589,53 €**. Maßgeblich ist `CLAUDE.md §9`, nicht das Runbook.
