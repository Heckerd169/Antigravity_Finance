# Setup-Anweisung Projekt_V2

> **Vom:** PM-Chat Zwischenphase (Opus 4.7)
> **An:** V2-PM-Chat
> **Datum:** 01. Juni 2026
> **Anlass:** Aufsetzen eines neuen Claude-Projekts für V2
> **Status:** Empfehlung, vom User bestätigt, noch nicht umgesetzt.

---

## 0. Ausgangslage und Begründung der Strategie

Nach Abschluss von V1 wird für die zweite Produkt-Phase ein neues Claude-Projekt mit dem Arbeitstitel `Antigravity_Finance_V2` aufgesetzt. Das bestehende V1-Projekt bleibt unverändert als historisches Audit-Artefakt erhalten und wird nicht aufgeräumt. Diese Strategie wurde gegenüber einem Cleanup des bestehenden Projekts aus drei Gründen bevorzugt:

Erstens trennt sie die projektgebundene Past-Chats-Suche sauber zwischen V1- und V2-Kontext. Identische Begriffe aus beiden Phasen liefern damit keine vermischten Treffer mehr. Zweitens erlaubt sie eine eigenständige Weiterentwicklung der Personas und des Master-Regelwerks `CLAUDE.md` ohne Rücksicht auf historische Konsistenz mit V1-Sprints. Drittens ist der einmalige Aufwand zur Übertragung der Dateien gering und steht in keinem Verhältnis zum Mehrwert der sauberen Trennung.

Die Persona-Chats für Architekt und Design-Direktor werden im V2-Projekt frisch eröffnet. Dies entspricht dem im V1→V2-Handover §5 dokumentierten Vorgehen für den Fall einer Persona-Chat-Neueröffnung, mit den Persona-Files als Eintrittspunkt und Verweis auf die aktuellen Doku-Stände.

---

## 1. Initial-Knowledge-Set für Projekt_V2

Folgende Dateien werden beim Aufsetzen von `Antigravity_Finance_V2` aus dem V1-Projekt beziehungsweise aus dem Repo unter `sprints/` in das Knowledge des neuen Projekts hochgeladen. Sie bilden den vollständigen V2-Start-Kontext.

### 1.1 Personas und Master-Regelwerk

| Datei | Funktion |
|---|---|
| `persona_architect.md` | Persona-Definition Architekt |
| `persona_jobs.md` | Persona-Definition Design-Direktor |
| `CLAUDE.md` | Master-Regelwerk inklusive integrierter Sprint-10-Patches |

### 1.2 Aktuelle Architektur- und Design-Doku

| Datei | Funktion |
|---|---|
| `antigravity_finance_schema_summary_v3.md` | Aktueller Schema-Stand (v3.1) |
| `antigravity_finance_design_dokument_v3.md` | Aktueller Design-Stand (v3.0, Sprint-10) |

### 1.3 Aktives Handover

| Datei | Funktion |
|---|---|
| `pm_handover_v1_to_v2.md` | Eintrittspunkt für den V2-PM-Chat |

### 1.4 Stilreferenzen Review

| Datei | Funktion |
|---|---|
| `sprint_08_review.md` | Origin LL-16 und LL-17 |
| `sprint_09_review.md` | Origin LL-18 und LL-19 |
| `sprint_10_review.md` | Origin LL-20, dokumentiert Soft-Delete-UI-Erweiterung |

### 1.5 Stilreferenzen Briefing

| Datei | Funktion |
|---|---|
| `sprint_08_briefing.md` | Briefing-Stilreferenz |
| `sprint_09_briefing.md` | Briefing-Stilreferenz |
| `sprint_10_briefing.md` | Briefing-Stilreferenz, jüngste Spec-Quelle |

### 1.6 Stilreferenz Handover

| Datei | Funktion |
|---|---|
| `pm_handover_sprint_9.md` | Vorlage für Handover-Stil |

### 1.7 Stilreferenz Doku-Patch

| Datei | Funktion |
|---|---|
| `sprint_10_doku_patches.md` | LL-16-konformes Doku-Patch-Artefakt |

### 1.8 Prototypen-Artefakte für Design-Direktor

Die folgenden neun HTML- und PNG-Prototypen-Paare werden ebenfalls in das V2-Projekt-Knowledge übernommen. Der Design-Direktor-Chat im V2-Projekt benötigt diesen direkten Zugriff als visuelle Referenz für UI-Diskussionen.

| Prototypen-Paar |
|---|
| `einnahmen_karte_alle_zustaende.html` + `.png` |
| `csv_import_drop_distill.html` + `.png` |
| `income_split_final.html` + `.png` |
| `sparrate_treppe_final_v2.html` + `.png` |
| `budget_karte_fragment_drop.html` + `.png` |
| `recurrence_popup_mit_abbrechen.html` + `.png` |
| `untere_interaktionszone.html` (PNG im V1-Projekt nicht vorhanden) |
| `karten_final_v4.html` + `.png` |
| `singularity_ring_v3.html` + `.png` |
| `header_timeline_navigation.html` + `.png` |

---

## 2. Nicht zu übernehmende Dateien

Die folgenden Dokumente bleiben im V1-Projekt-Knowledge erhalten, werden aber nicht in das V2-Projekt übernommen. Sie sind entweder in spätere Versionen integriert, durch nachfolgende Handover abgelöst oder als historische Sprint-Artefakte ausschließlich Audit-relevant. Vollständiger Repo-Zugriff ist über `sprints/` jederzeit gegeben.

### 2.1 Bereits eingearbeitete Doku-Vorgänger

`antigravity_finance_schema_summary_v2.md`, `CLAUDE_md_sprint_08_patches.md`, `sprint_09_doku_patches.md`, `schema_doku_patch_v3_zu_v3_1.md`

### 2.2 Durch späteres Handover abgelöste Dokumente

`pm_handover_to_new_chat.md`, `pm_handover_sprint_3.md`, `pm_handover_sprint_4.md`, `pm_handover_sprint_5.md`, `pm_handover_sprint_6.md`, `pm_handover_sprint_7.md`, `pm_handover_sprint_8.md`, `pm_brief_pre_sprint_10_vollzug.md`

### 2.3 Historische Sprint-Artefakte der Sprints 0 bis 7

Sämtliche Briefings und Reviews der Sprints 0 bis 7, also sechzehn Dateien insgesamt.

---

## 3. Voraussetzungen vor dem Aufsetzen von Projekt_V2

Vor dem Aufsetzen sind zwei Punkte sicherzustellen, damit der Initial-Knowledge-Set vollständig ist.

Erstens müssen `sprint_10_review.md` und `sprint_10_doku_patches.md` als Quell-Dateien vorliegen. Beide existieren bereits im Repo unter `sprints/` und werden vom User von dort entnommen.

Zweitens sollte der Repo-Cleanup gemäß der Schritt-1-Empfehlung idealerweise vorab erfolgt sein oder zumindest auf einem Branch begonnen worden sein. Damit ist sichergestellt, dass alle für die Übernahme relevanten Dateien sowohl im V1-Projekt-Knowledge als auch im versionierten Repo-Stand auffindbar bleiben.

---

## 4. Umsetzungs-Reihenfolge

Das Aufsetzen erfolgt manuell über die Claude-Projekt-Oberfläche und gliedert sich in vier Schritte. Zunächst wird das neue Projekt unter dem Namen `Antigravity_Finance_V2` angelegt. Anschließend werden die in den Abschnitten 1.1 bis 1.8 gelisteten Dateien in das Knowledge des neuen Projekts hochgeladen, idealerweise in der dort angegebenen Reihenfolge, sodass Personas und Master-Regelwerk zuerst vorliegen. Im dritten Schritt wird der V2-PM-Chat im neuen Projekt eröffnet, mit der Phase-0-Reading-Order aus dem V1→V2-Handover §7 als Einstieg. Im vierten Schritt werden die Persona-Chats für Architekt und Design-Direktor nach Bedarf im neuen Projekt eröffnet, sobald sie zum ersten Mal aktiv benötigt werden.

Das V1-Projekt bleibt während des gesamten Vorgangs unverändert und dient ab Abschluss als reines Archiv. Schreibzugriffe auf das V1-Projekt sind nach dem Wechsel nicht mehr vorgesehen.

---

## 5. Ziel-Stand nach Aufsetzen

Nach Abschluss des Setups existieren zwei voneinander getrennte Claude-Projekte. Das bestehende V1-Projekt enthält weiterhin die vollständige Chat-Historie aller drei Personas über elf Sprints sowie das ursprüngliche Knowledge in unverändertem Zustand. Das neue Projekt `Antigravity_Finance_V2` enthält ausschließlich die in Abschnitt 1 gelisteten Dateien und startet ohne Chat-Historie. Die Past-Chats-Suche ist damit pro Projekt sauber auf den jeweiligen Phasen-Kontext eingegrenzt.

---

*Setup-Anweisung Projekt_V2 · Antigravity Finance · Zwischenphase V1 → V2 · 01. Juni 2026*
