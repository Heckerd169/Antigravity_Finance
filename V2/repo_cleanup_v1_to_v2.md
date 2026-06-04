# Repo-Cleanup V1 → V2

> **Vom:** PM-Chat Zwischenphase (Opus 4.7)
> **An:** V2-PM-Chat
> **Datum:** 01. Juni 2026
> **Anlass:** Repo-Aufräumen vor V2-Start
> **Status:** Empfehlung, noch nicht umgesetzt — Umsetzung erfolgt auf separatem Branch nach Freigabe.

---

## 0. Ausgangslage

Das Repo `Heckerd169/Antigravity_Finance` enthält nach Abschluss von V1 eine Mischung aus produktivem App-Code, aktueller Doku, historischen Sprint-Artefakten, Doku-Vorgängerversionen sowie versehentlich eingecheckten Build- und Tooling-Caches. Vor dem V2-Start sollen drei Aktionen sauber getrennt werden:

1. **Behalten** — produktive Inhalte und aktuelle Doku.
2. **Nach `archive/` verschieben** — historisch wertvolle Artefakte ohne aktive Nutzung.
3. **Löschen** — generierte oder versehentlich eingecheckte Dateien, die nicht ins Repo gehören.

Die Umsetzung erfolgt auf einem Branch (`chore/repo-cleanup-pre-v2`) und nicht direkt auf `main`.

---

## 1. Root-Ebene

| Datei | Aktion | Begründung |
|---|---|---|
| `.claude/settings.local.json` | Behalten | Claude-Code-Konfiguration, lokal relevant. |
| `.env.example` | Behalten | Dokumentiert die zwei Supabase-Env-Variablen. |
| `.gitignore` | Behalten + erweitern | Siehe Abschnitt 5. |
| `CLAUDE.md` | Behalten | Aktueller Stand mit integrierten Sprint-10-Patches. |
| `CLAUDE_md_sprint_10_patches.md` | Nach `archive/patches/` | Inhalt bereits in `CLAUDE.md` eingepflegt; LL-16-Audit-Trail bleibt erhalten. |
| `README.md` | Behalten | Standard. |
| `antigravity_finance_design_dokument_v3.md` | Behalten | Aktueller Design-Stand (v3.0, Sprint-10). |
| `antigravity_finance_schema_summary_v2.md` | Nach `archive/schema/` | Vorgängerversion; aktive Quelle ist v3.1. |
| `antigravity_finance_schema_summary_v3.md` | Behalten | Aktueller Schema-Stand (v3.1). |
| `architect_handover_v1.md` | Nach `archive/handover/` | V1-spezifisch; V2 erhält ein neu zu erstellendes Architekten-Briefing. |
| `next-env.d.ts`, `next.config.mjs`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `tsconfig.json` | Behalten | Build- und Stack-Essentials. |
| `tsconfig.tsbuildinfo` | **Löschen** + `.gitignore` | Generierte TypeScript-Build-Cache-Datei, gehört nicht ins Repo. |

---

## 2. `public/prototypes/`

Diese Dateien liegen aktuell unter `public/` und werden damit live unter `https://antigravity-finance-sigma.vercel.app/prototypes/*.html` ausgeliefert. Das war nicht beabsichtigt, erhöht die Build-Zeit und stellt interne Design-Artefakte öffentlich zugänglich.

| Aktion | Umsetzung |
|---|---|
| **Aus `public/` entfernen** | Zwingend, um öffentliche Auslieferung zu beenden. |
| **Ziel** | Komplettes Verzeichnis nach `archive/prototypes/` verschieben. Damit bleibt der Inhalt als Referenz für V2-Design-Diskussionen mit dem Design-Direktor verfügbar, ohne im Build-Pfad zu liegen. |
| **Hintergrund** | Die Prototypen sind zusätzlich im Claude-Projekt-Knowledge hinterlegt; das Repo-Archiv ist redundant, aber näher am Code und versioniert. |

---

## 3. `sprints/`

Dieses Verzeichnis bleibt vollständig erhalten. Es enthält den kompletten Audit-Trail über alle elf V1-Sprints: Briefings, Reviews, PM-Handover und Doku-Patches. Der Wert liegt in der Nachvollziehbarkeit von Entscheidungen (OQ-Pattern-Historie, LL-Origin-Stories, LL-16-Doku-Patch-Trennung). Das Verzeichnis ist nicht Teil des Next.js-Build-Pfads und verursacht weder Performance- noch Auslieferungs-Kosten.

Das Handover `pm_handover_v1_to_v2.md` bleibt aus Konsistenzgründen in `sprints/` und wird nicht ins Root dupliziert.

---

## 4. `supabase/.temp/`

| Datei | Aktion | Begründung |
|---|---|---|
| `cli-latest` | **Löschen** | Supabase-CLI-Versions-Cache, gehört nicht ins Repo. |
| `linked-project.json` | **Löschen** | Enthält die Supabase-Project-Referenz; je nach CLI-Version mindestens Metadata-Leak, potenziell auch sensiblere Daten. |
| `supabase/.temp/` | `.gitignore` ergänzen | Verhindert erneutes Einchecken. |

**Folgemaßnahme:** Falls `linked-project.json` einen Access-Token oder vergleichbare Credentials enthalten sollte, ist nach der Löschung zusätzlich die Git-History zu bereinigen (`git filter-repo`) und der entsprechende Schlüssel in Supabase zu rotieren. Vor der Löschung muss der Datei-Inhalt einmal geprüft werden.

---

## 5. `.gitignore`-Ergänzungen

Folgende Einträge sind dem `.gitignore` hinzuzufügen:

```
# TypeScript build cache
tsconfig.tsbuildinfo

# Supabase CLI
supabase/.temp/
```

---

## 6. `src/` und übrige Code-Bereiche

Vollständig behalten. Eine Detail-Anmerkung:

| Datei | Hinweis |
|---|---|
| `src/app/dashboard-dev-panel.tsx` | Klingt nach Dev-Werkzeug. Vor V2-Start verifizieren, ob das Panel im Production-Build deaktiviert ist (z. B. via `process.env.NODE_ENV`-Check oder Feature-Flag) oder ob es im Live-UI sichtbar ist. Bei sichtbarem Dev-Panel in Production: V2-Backlog-Eintrag, kein Bestandteil des Cleanups. |

---

## 7. Empfohlene Ziel-Struktur

Nach Umsetzung des Cleanups ergibt sich folgende Top-Level-Struktur:

```
Antigravity_Finance/
├── .claude/
├── archive/
│   ├── handover/        ← architect_handover_v1.md
│   ├── patches/         ← CLAUDE_md_sprint_10_patches.md
│   ├── prototypes/      ← bisheriger Inhalt von public/prototypes/
│   └── schema/          ← antigravity_finance_schema_summary_v2.md
├── public/              (ohne prototypes/)
├── sprints/             (unverändert, vollständig)
├── src/                 (unverändert)
├── supabase/            (ohne .temp/)
├── .env.example
├── .gitignore           (erweitert)
├── CLAUDE.md
├── README.md
├── antigravity_finance_design_dokument_v3.md
├── antigravity_finance_schema_summary_v3.md
├── next-env.d.ts
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── tsconfig.json
```

---

## 8. Umsetzungs-Reihenfolge (vorgeschlagen)

Die Schritte werden auf dem Branch `chore/repo-cleanup-pre-v2` ausgeführt und anschließend per Pull-Request nach `main` gemerged.

1. Branch anlegen: `git checkout -b chore/repo-cleanup-pre-v2`.
2. Inhalt von `supabase/.temp/linked-project.json` einmal sichten, dann Verzeichnis löschen.
3. `tsconfig.tsbuildinfo` löschen.
4. `.gitignore` um die in Abschnitt 5 genannten Einträge erweitern.
5. `archive/`-Struktur anlegen und die in Abschnitten 1 und 2 markierten Dateien dorthin verschieben (`git mv`, damit Git die Verschiebung als Move erkennt).
6. `public/prototypes/` nach `archive/prototypes/` verschieben.
7. Lokalen Build verifizieren: `pnpm install`, `tsc --noEmit`, `next lint`, `next build`.
8. Commit, Push, Vercel-Preview-Deployment prüfen.
9. Falls Preview grün: PR nach `main`, mergen, Production-Deployment beobachten.

---

## 9. Out of Scope für diesen Cleanup

| Punkt | Verschoben nach |
|---|---|
| Dev-Panel-Sichtbarkeit in Production verifizieren und ggf. absichern | V2-Backlog (kein Cleanup-Thema) |
| Eventuelle Git-History-Bereinigung von Credentials | Separater Folge-Schritt, abhängig von Inhalt der `linked-project.json` |
| Strukturänderung Root-Markdown → eigenes `docs/`-Verzeichnis | Bewusst nicht empfohlen, weil bestehendes Tooling und Phase-0-Reading-Order im V1-Handover auf die aktuellen Pfade verweisen |

---

*Repo-Cleanup-Empfehlung · Antigravity Finance · Zwischenphase V1 → V2 · 01. Juni 2026*
