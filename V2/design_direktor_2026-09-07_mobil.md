# Design-Record · /mobil — Zahlungen zuordnen ohne Ziehen

> **Runde:** 06.–07.09.2026 · **Rolle:** Design-Direktor · **Entscheider:** User
> **Artefakte:** `Mobil Zuordnen.dc.html` (Beschluss-Artboards), `Mobil App.dc.html` (klickbarer Prototyp)
> **Status:** entschieden, bereit für den Bau-Sprint. Kein Ist-Zustand.

## 1. Entscheidungen

| # | Frage | Entscheidung |
|---|---|---|
| 1 | Achse statt Ziehen | **1a „ein Tipp"** — Vorschlag ist der einzige gefüllte Knopf (52 px, Türkis). 1b (Kartenliste) und 1c (Wischen) verworfen. |
| 2 | Zweifelsfall | Kandidaten gleichrangig als Konturen, **nichts vorbelegt**. „Übernehmen" gesperrt (Opacity .4), bis ein Kandidat gewählt ist; dann gefüllt mit Kartennamen. Die alphabetische Vorbelegung (`ORDER BY card_name`) gilt auf /mobil nicht. |
| 3 | Konsequenz | Nur im Danach-Moment: Toast mit „Zugeordnet · Karte" + eine Zeile „Sparrate Monat −X €" (Rot nur bei echter Abweichung; sonst „im Plan" neutral). Rückgängig im Toast, 5 s. |
| 4 | Kein Netz | Neutrale Pille „Stand von 14:32 · offline". Schreiben gesperrt (Knöpfe Opacity .4, kein onClick), „Später" bleibt. Nicht rot. |
| 5 | Monate | Blätterbar in der Daumenzone (28-px-Chevrons, Pille Laufend / Vorbei / Forecast). Forecast-Monat: leerer Stapel, Hinweis statt Karte. |
| 6 | Später | Buchung wandert ans Stapelende, Toast ohne Rückgängig. |
| 7 | Andere Karte … | Sheet auf `--bg-elevated`, Karten nach Typ gruppiert (Fixkosten · Budget · Einmalig · Einnahmen), Zeile 48 px, rechts Restbudget / „unbezahlt" / „bezahlt". |
| 8 | Keine neue Karte auf /mobil | bestätigt. |
| 9 | App-Charakter | Tab-Leiste (49 + 34 px): Übersicht · Zuordnen (Badge = offene Buchungen) · Karten · Verlauf. |
| 10 | Übersicht | Singularity Ring (r 98, Strich 9, Bogen türkis / rot, Zahl weiß im Plan, türkis über Plan) **vor der Jahres-Welle**. Welle nach `v3/komponenten/welle.html`: türkis realisiert, grau Prognose, Deckkraft .80, Nulllinie; **Rot nur zwischen Kurve und Nulllinie**; ohne Marker-Punkt, ohne senkrechten Strich. Ring-Innenfläche deckend (`--bg-primary`, r 94). |
| 11 | Wortlaut Fixkosten | Restbetrag heißt **„unbezahlt"**, nie „frei". Budget: „frei". Einnahmen: „erwartet" / „eingegangen". |

## 2. Messungen

- **Längster Kartenname** (105 Zeichen, `Deutschlandticket Mama … | Abo 101627874 zum 01.05.2026`) im 52-px-Knopf bei 398 px Breite: HTML kollabiert die Leerzeichen, der Rest kürzt mit „…" nach ca. 40 Zeichen. Der Knopf **wächst nicht**, nichts bricht; der entscheidende Teil („Deutschlandticket Mama") steht vorn. Gleiche Regel in Stapel-Vorschau, Sheet und Kartenliste (`nowrap` + `ellipsis`, wie A12 in v2-29).
- **Fokus-Karte**: Empfänger und Zweck ungekürzt (`overflow-wrap:anywhere`), Karte wächst mit dem Text.
- **Kacheln Übersicht**: „1.593 € unbezahlt" bei 11 px passt einzeilig in 105 px.
- **Safe Areas**: 59 px oben, 34 px unten; alle Bedienelemente ≥ 44 px.

## 3. Übergabe an den Bau

**Zustände der Zuordnen-Fläche:** `normal` (1 Vorschlag) · `mehrdeutig` (≥ 2 Kandidaten, `count(DISTINCT card_id) > 1`) · `leer` (Forecast oder alles zugeordnet) · `offline`.

**Sperrlogik:** Schreiben nur online. „Übernehmen" nur mit gewähltem Kandidaten. Rückgängig nur innerhalb des Toasts (5 s), stellt Buchung, Kartenbudget und Sparrate zurück.

**Konsequenz-Rechnung im Prototyp** (Modell, nicht Produktionslogik): Δ Sparrate = −max(0, |Betrag| − Restbudget der Karte). Im Bau: `calculate_match_confidence` / Anker 2 (`Σ delta = Ist − Plan`) unangetastet.

**Daten:** Kartennamen 1:1 aus `supabase/migrations/20260808_v2_17_kat1_zuordnung.sql` (46 Karten). Beträge außer „Privates Budget 150 €" (v2-27) sind Annahmen — vor dem Bau gegen Produktion ziehen. Welle Jan–Jul: Beispielwerte.

**Tokens:** ausschließlich `design-system/styles.css` (v3). Grenze: Schreibtisch-Ansicht bleibt Desktop-only; /mobil ist eine eigene Route.

## 4. Offen

- Wortlaut „N × zuvor" vs. Konfidenz in Prozent (Schaufenster zeigt „· 97 %").
- Tab „Karten" zeigt Restbudget und Buchungen des Monats — Kartenmenü (M2: Beenden / Löschen / Lösen) ist nicht Teil dieser Runde.
- Light Mode ist als Tweak gebaut, aber nicht gegen die v3-Light-Stufen geprüft.
