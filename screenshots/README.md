# screenshots/

Ablage für Bildschirmfotos, die Fehler oder Auffälligkeiten in der App zeigen.

## Wofür

Ein Bild ersetzt beim Melden eines Fehlers meist drei Sätze. Wenn hier ein
Screenshot liegt, kann jede Claude-Code-Sitzung ihn direkt öffnen und
auswerten — ohne dass er erneut in den Chat gezogen werden muss.

## Ablage-Konvention

Ein Unterordner je Melde-Runde, benannt nach dem Datum:

```
screenshots/
└── JJJJ-MM-TT_kurzer-anlass/
    ├── fehler-1_woran-man-es-erkennt.png
    └── fehler-2_woran-man-es-erkennt.png
```

Der Dateiname soll das **Symptom** benennen, nicht die Nummer allein —
`fehler-3_einkommens-popup-zusammengequetscht.png` ist in einem halben Jahr
noch verständlich, `IMG_4711.png` nicht.

## Wichtig: die Bilder liegen NICHT im Git-Repository

Die Dateien sind über `.gitignore` ausgeschlossen, nur diese README ist
versioniert. Grund: Bildschirmfotos der App zeigen echte Kontobewegungen mit
Empfängernamen und Beträgen. Das ist dieselbe Überlegung, aus der auch
`import_data/` ausgeschlossen ist.

Lokal sind die Bilder trotzdem für jede Sitzung lesbar — Claude Code arbeitet
auf dem Dateisystem, nicht auf dem Repository-Inhalt.

Falls ein Bild dauerhaft dokumentiert werden soll, gehört es in ein
Befund-Dokument unter `V2/` — dort aber als **beschriebener Sachverhalt mit
Zahlen**, nicht als Bild.

## Bestand

| Ordner | Inhalt |
|---|---|
| `2026-08-04_fehlerliste/` | Fünf Fehler aus dem Test nach der Juli-Kuratierung. Ausgewertet in `V2/befunde_2026-08-04_fehler_und_entscheidungen.md`. |
