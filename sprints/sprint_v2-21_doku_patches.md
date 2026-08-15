# Doku-Patches — Sprint v2-21

> Verfahren nach LL-16 / §7 Regel 14: **Anker + Patch-Satz je Stelle**, nie eine
> direkte Bearbeitung der Bibeln. Anker vor der Anwendung einzeln per Suche auf
> Eindeutigkeit geprüft.
>
> Betroffen: **Schema-Doku** (RPC-Katalog §4, Versions-Bump).
> **Nicht betroffen: Design-Doku** — der Sprint ändert keine Formensprache, keine
> Kartenzustände, keine Texte. Die einzige sichtbare Änderung ist, dass ein
> Vorschlag im Schaufenster auch oberhalb von 0,95 erscheint; das ist eine
> Korrektur an einer Sichtbarkeitsgrenze, keine Gestaltungsentscheidung.
>
> **CLAUDE.md** ist seit dem 15.08.2026 enthalten — siehe Patches 5–8. Der User hat
> die Freigabe nach Vorlage des Reviews ausdrücklich erteilt.

---

## Patch 1 · Schema-Doku §4 — die drei Sub-Scores

**Anker** (Zeile 373, eindeutig):

```
| `name_similarity(description, card_name)` | Trigram + Substring-Boost (`0.80`) | `numeric` |
```

**Patch-Satz** — ersetzt die eine Zeile durch drei:

```
| `name_similarity(description, card_name)` | Trigram + Substring-Boost (`0.80`) über die **ganzen** Strings. Seit v2-21 **nicht mehr direkt von `calculate_match_confidence` aufgerufen**, sondern als Untergrenze innerhalb von `name_similarity_scoped` mitgeführt | `numeric` |
| `name_similarity_scoped(description, card_id)` **(v2-21)** | Wortweiser Namensvergleich: Umlaut-/ß-Normalisierung auf beiden Seiten, Zerlegung des Kartennamens in Wörter ab 4 Zeichen, Treffer nur an **echten Wortgrenzen** (`Douglas` trifft nicht mehr `Glas`), unscharfer Fallback über `word_similarity` erst ab `0.7`. **Entwertung mehrdeutiger Wörter:** Ein Kartenwort, das in `n` Kartennamen desselben Nutzers vorkommt, zählt nur `1/n` — das fängt Personennamen wie `Aline` (in 7 Kartennamen) ohne gepflegte Stoppwortliste. Führt `name_similarity` als Untergrenze mit: das Ergebnis kann nie schlechter werden als vorher | `numeric` (0..1) |
| `history_match(fragment_id, card_id)` **(v2-21)** | Wiedererkennung: Wurde eine Zahlung mit **identischer** Beschreibung schon einmal **von Hand** (`origin = 'MANUAL_DROP'`) dieser Karte zugeordnet? Lernt bewusst **nicht** aus `AUTO_ABSORBED` (sonst verstärkt sich ein Automatik-Fehler selbst) und nicht aus Überträgen. Das Fragment selbst ist ausgeschlossen | `numeric` (0 oder 1) |
```

---

## Patch 2 · Schema-Doku §4 — `calculate_match_confidence`

**Anker** (Zeile 372, eindeutig):

```
| `calculate_match_confidence(fragment_id, card_id)` | Best-Match-Score, gewichtete Summe aus den drei Sub-Scores | `numeric` (0..1) |
```

**Patch-Satz:**

```
| `calculate_match_confidence(fragment_id, card_id)` | Best-Match-Score. Gewichtete Summe aus den drei Sub-Scores (Name über `name_similarity_scoped` seit v2-21), danach die **Wiedererkennung als Untergrenze**: Greift `history_match`, wird der Score auf `confidence.history_score` (0,94) **gehoben** — nie gesenkt. Bewusst knapp **unter** der Auto-Absorptions-Schwelle 0,95: Eine wiedererkannte Zahlung erzeugt einen sichtbaren Vorschlag, aber niemals eine automatische Verknüpfung (User-Entscheid 15.08.2026). Der Wert steht in `app_config` und lässt sich ohne Migration anheben. Eine vierte **gewichtete** Komponente wäre falsch gewesen: Sie hätte alle Scores gesenkt, bei denen keine Historie vorliegt — und das sind die meisten | `numeric` (0..1) |
```

---

## Patch 3 · Schema-Doku §4 — neue mutierende RPC

**Anker** (Zeile 375, eindeutig — die Zeile schließt den Import-Block ab):

```
| `frequency_match(date, card_id)` | Binär `0/1` basierend auf `is_card_active_in_month` | `numeric` |
```

**Patch-Satz** — hängt zwei Zeilen an:

```
| `frequency_match(date, card_id)` | Binär `0/1` basierend auf `is_card_active_in_month`. ⚠️ **In der Praxis eine Konstante:** Der einzige Aufrufer filtert Karten bereits auf Aktivität im Monat des Fragments, weshalb sie dort ausnahmslos `1.00` liefert — gemessen über alle Score-Klassen (v2-21). 20 % des Gewichts unterscheiden damit nichts, und ohne Namensähnlichkeit ist die Badge-Schwelle 0,60 rechnerisch unerreichbar (Betrag + Frequenz ergeben höchstens 0,50). Offen als Hausaufgabe `ZO-1` | `numeric` |
| `refresh_fragment_suggestions(p_from_month, p_to_month)` **(v2-21)** | Rechnet Kartenvorschläge für **offene** Zahlungen eines Zeitraums neu und schreibt **ausschließlich** `suggested_card_id` und `confidence`. Nötig, weil `calculate_match_confidence` sonst nur beim Einfügen läuft (`process_csv_import`, hinter `IF v_was_inserted`) — wer später eine Karte anlegt, bekam für ältere Zahlungen nie einen Vorschlag. **Verlinkt niemals**, auch nicht ab 0,95: `card_fragment_links` zu schreiben bewegt sofort die Sparrate. Die Zusage ist **erzwungen**, nicht behauptet — die Funktion zählt die Verknüpfungen vor und nach ihrem Lauf und bricht bei jeder Abweichung mit Exception und Rollback ab. Auth über `auth.uid()` (`28000`), Zeitraum validiert (`22023`, höchstens 5 Jahre). Überträge (`transfer_type IS NOT NULL`) bleiben unangetastet | `jsonb` (`{geprueft, vorschlag_gesetzt, vorschlag_geleert, links_unveraendert, badge_threshold}`) |
```

---

## Patch 4 · Schema-Doku — Kopf und Changelog

**Anker** (Zeile 3–5, eindeutig):

```
**Version:** 3.7.0
**Status:** Datenbankseitig vollständig implementiert (Sprint 0–9 + Pre-Sprint-10-Patches + Sprint v2-04 Mehrkonten Stufe 1 + Sprint v2-05 Karten-Lebenszyklus + Sprint v2-06 B2-Treiber + Sprint v2-11 Vorzeichen-Korrektur + Sprint v2-17 Kategorien)
**Datum:** 08. August 2026
```

**Patch-Satz:**

```
**Version:** 3.8.0
**Status:** Datenbankseitig vollständig implementiert (Sprint 0–9 + Pre-Sprint-10-Patches + Sprint v2-04 Mehrkonten Stufe 1 + Sprint v2-05 Karten-Lebenszyklus + Sprint v2-06 B2-Treiber + Sprint v2-11 Vorzeichen-Korrektur + Sprint v2-17 Kategorien + Sprint v2-21 Zuordnung)
**Datum:** 15. August 2026
```

**Zusätzlich** — neuer Changelog-Block **direkt vor** dem bestehenden
`> **Changelog v3.5.0 (08.08.2026, …`:

```
> **Changelog v3.8.0 (15.08.2026, Sprint v2-21 · `M6`):** Die automatische Zuordnung
> rechnet nach und trifft öfter. **Zwei neue Sub-Score-Funktionen** —
> `name_similarity_scoped` (wortweise, umlautfest, mit Entwertung mehrdeutiger
> Kartenwörter) und `history_match` (Wiedererkennung aus den eigenen
> Handzuordnungen). **Eine neue mutierende RPC** `refresh_fragment_suggestions`,
> die Vorschläge für alte Zahlungen nachrechnet und dabei **niemals verlinkt** —
> erzwungen über einen Zähler-Wächter auf `card_fragment_links`.
> **Neuer `app_config`-Schlüssel** `confidence.history_score` (0,94).
>
> Der Befund dahinter: `calculate_match_confidence` lief ausschließlich beim
> Einfügen, weshalb 1.567 von 1.590 Zahlungen gar keinen Konfidenzwert trugen.
> Gemessen an 101 Handzuordnungen aus Juli/August stieg die Zahl richtiger
> Vorschläge über der Badge-Schwelle von **14 auf 42**, die Zahl falscher von
> 1 auf 4. Für den Nutzer: von 9 auf 115 sichtbare Vorschläge bei 283 offenen
> Zahlungen in 2026.
>
> **Ohne Schema-Änderung an Tabellen** — nur Funktionen und ein Konfigurationswert.
> Die Sparrate bewegt sich in keinem der zwölf Monate.
```

---

## Nicht gepatcht, aber geprüft

| Stelle | Warum unverändert |
|---|---|
| Schema-Doku §3 (Sparrate-Wahrheitsquellen) | Der Zuordnungs-Pfad ist von den Rechenfunktionen isoliert — belegt über `pg_proc`: die drei Sub-Scores haben genau einen Aufrufer, und der ist `calculate_match_confidence` |
| Schema-Doku §6 (Lösch-Logik), §7 (Snapshot), §8 (RLS) | nicht berührt; keine neue Tabelle, also auch kein Policy-Thema (Stolperfalle 15) |
| Design-Doku §11 (CSV-Import / Distiller) | beschreibt den Import-Ablauf, der unverändert bleibt. Die Schwellen 0,60 / 0,95 gelten weiter wie dokumentiert |
| Design-Doku §12 (UI-Copy) | kein neuer und kein geänderter Text. Die Zeile „Vorschlag" im Schaufenster existiert seit v2-16 |

---

# Teil B · CLAUDE.md — nach ausdrücklicher Freigabe (15.08.2026)

> §7 Regel 14 verlangt für **diese** Datei zusätzlich zur Patch-Form die Freigabe des
> Users. Sie ist nach Vorlage des Reviews erteilt worden.
>
> **Nummerierung geprüft gegen den v2-20-Stand im Branch:** Stolperfallen enden bei
> **16**, Arbeitsregeln bei **24**, das LL-Register bei **LL-26**. Die neuen Einträge
> sind also 17 · 25 · LL-27 — keine Kollision.

## Patch 5 · §6 — neue Stolperfalle 17

**Anker** (Ende von Stolperfalle 16, eindeutig):

```
    Stelle, die sie kürzt** — `slice`, `LIMIT`, `take`, eine feste Feldliste.
    (v2-19, LL-26)
```

**Patch-Satz:** Der Anker bleibt, danach folgt Stolperfalle 17 (Wortlaut siehe
angewendete Datei — Kern: eine Sub-Score-Funktion, die nicht streuen kann, macht eine
Schwelle rechnerisch unerreichbar; `frequency_match` liefert ausnahmslos `1.00`).

## Patch 6 · §7 — neue Regel 25

**Anker** (Ende von Regel 24, eindeutig):

```
    ohnehin am Ende. (LL-24)
```

**Patch-Satz:** Regel 25 wird angehängt — wer eine Erkennungs- oder
Ähnlichkeitsfunktion ändert, misst gegen echte Entscheidungen, mit Richtig **und**
Falsch, und schließt das geprüfte Element aus seiner eigenen Lernmenge aus.

## Patch 7 · §8 — neuer Eintrag LL-27

**Anker** (LL-26-Zeile, eindeutig):

```
| LL-26 | Ein Frontend-Limit kann eine Datenbank-Entscheidung stillschweigend aufheben — wer eine Antwort erweitert, sucht die Stelle, die sie kürzt | §6 Stolperfalle 16 | v2-19 (GE-2) |
```

**Patch-Satz:** Danach LL-27 einfügen.

## Patch 8 · §9 und Kopfzeile — Stand

**Anker A** (Kopfzeile, eindeutig):

```
> **Letzte Aktualisierung:** 13. August 2026 · **nach:** Sprint **v2-19**
```

**Anker B** (§9, eindeutig):

```
**Letzter Sprint:** v2-19 („Realität gewinnt" auch für das Netto — `GE-1` `GE-2`,
```

> ### ⚠️ Dieser Patch schließt zugleich eine Lücke, die nicht von v2-21 stammt
>
> §9 stand im Branch noch auf **v2-19** — der Nachzug für **v2-20** war nie
> geschrieben worden. Hätte v2-21 sich einfach davorgesetzt, wäre v2-20 aus der
> Verfassung verschwunden, ohne dass es jemandem auffällt.
>
> Der Patch nennt deshalb **beide**. Er schreibt v2-20 nicht nach (das ist Sache des
> dortigen Reviews), sondern verzeichnet es im Stand und markiert die offene
> PR-Kette. **Die Sparraten-Momentaufnahme wird NICHT angefasst** — v2-21 bewegt
> keine Zahl, und §9 warnt selbst davor, sie als Sollwert zu behandeln.
