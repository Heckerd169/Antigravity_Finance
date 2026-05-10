# Sprint 0 — Projekt-Setup

> **Sprint-Nummer:** 0
> **Komponente:** Projekt-Fundament (kein UI-Feature)
> **Dauer-Schätzung:** 1 Session, ~60–90 Minuten Implementierung
> **Modell-Empfehlung:** Opus 4.7
> **Branch:** `sprint/00-setup`
> **Datum erstellt:** 3. Mai 2026

---

## 0. Pflicht-Lese-Reihenfolge für Claude Code

Beim Start dieser Session lese in dieser Reihenfolge:

1. `CLAUDE.md` (Repo-Root) — Status, Tech-Stack, Arbeitsregeln
2. `antigravity_finance_design_dokument_v3.md` (Repo-Root) — **insbesondere §3 (Globale Tokens)**
3. `antigravity_finance_schema_summary_v2.md` (Repo-Root) — Tabellen-Übersicht und §5 Interaktions-Mapping
4. Diese Datei (`sprints/sprint_00_briefing.md`)

---

## 1. Ziel

Am Ende dieses Sprints existiert ein **lauffähiges Next.js-14-Projekt** mit:

- Supabase-Auth-Skeleton (Login, Logout, Session-Schutz)
- Generierten TypeScript-Typen für das vollständige DB-Schema
- Globalen Design-Tokens als CSS Custom Properties (1:1 aus Design-Doku §3)
- Saubere Ordnerstruktur gemäß CLAUDE.md §3
- Einer geschützten leeren Dashboard-Seite, die nach Login erreichbar ist

**Es wird NULL UI-Feature implementiert.** Kein Ring, keine Karten, kein Header, keine Timeline.
Sprint 0 baut nur das Fundament. Wer in diesem Sprint Komponenten baut, bricht den Sprint-Plan.

---

## 2. Voraussetzungen (vor Sprint-Start, durch User zu erledigen)

| # | Aufgabe | Wer | Kontrolle |
|---|---|---|---|
| V1 | Test-User im Supabase Dashboard manuell erstellen (Authentication → Users → Add User → mit Email + Passwort, „Auto Confirm User" aktivieren) | User | Email + Passwort werden lokal notiert, kommen NICHT ins Repo |
| V2 | Supabase Project URL + `anon` Key kopieren (Project Settings → API) | User | Werden in Schritt 4.3 in `.env.local` eingetragen |
| V3 | Node.js ≥ 20 installiert, `pnpm` global installiert | User | `node -v` und `pnpm -v` ausführbar |
| V4 | Supabase CLI installiert (für Type-Generation in Schritt 4.6) | User | `brew install supabase/tap/supabase` (macOS) |
| V5 | `git status` clean auf `main`, neuer Branch `sprint/00-setup` ausgecheckt | User | Vor Claude-Code-Start |

Wenn V1–V5 nicht erfüllt sind, **Sprint nicht starten** — Claude Code hängt sonst beim Login-Test.

---

## 3. Aufgaben (in dieser Reihenfolge ausführen)

### 3.1 Next.js-Projekt initialisieren

```bash
pnpm create next-app@latest . \
  --typescript --app --no-tailwind --no-src-dir --import-alias "@/*" --eslint
```

**Wichtige Flags:**
- `--no-tailwind`: ausgeschlossen per CLAUDE.md §2
- `--app`: App Router (nicht Pages)
- `.` als Pfad: in den bestehenden Ordner installieren (nicht neuen Ordner erzeugen)

> **Achtung:** Der `create next-app`-Generator legt `src/` standardmäßig nicht an, wenn `--no-src-dir` gesetzt ist. **Wir wollen ABER `src/`** gemäß CLAUDE.md §3. Daher: nach dem Init `app/` → `src/app/` verschieben und in `tsconfig.json` Pfad-Aliase entsprechend setzen. Alternative: bei dem Prompt `--src-dir` setzen und `--no-src-dir` weglassen.
>
> **Empfohlen:** `pnpm create next-app@latest . --typescript --app --no-tailwind --src-dir --import-alias "@/*" --eslint`

### 3.2 Pnpm-Lockfile committen, npm-Lockfile löschen

Falls der Generator versehentlich `package-lock.json` erzeugt: löschen. Es bleibt `pnpm-lock.yaml`.

### 3.3 Abhängigkeiten installieren

```bash
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add -D @types/node
```

Keine weiteren Libraries in Sprint 0. Insbesondere kein UI-Framework, kein State-Manager,
keine CSS-Library.

### 3.4 ENV-Variablen einrichten

**`.env.example`** (committen, ohne echte Werte):
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

**`.env.local`** (NICHT committen, von User mit echten Werten gefüllt):
```
NEXT_PUBLIC_SUPABASE_URL=https://nflkobdfdhncrtjncpmq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

In `.gitignore` sicherstellen, dass `.env.local` ignoriert wird (Next.js-Default macht das,
aber doppelt prüfen).

### 3.5 Supabase-Clients erstellen

Drei Dateien gemäß CLAUDE.md §3:

**`src/lib/supabase/client.ts`** — Browser-Client mit `createBrowserClient` aus `@supabase/ssr`
**`src/lib/supabase/server.ts`** — Server-Client mit `createServerClient` aus `@supabase/ssr`, Cookie-Handling über `next/headers`
**`src/lib/supabase/middleware.ts`** — Middleware-Helper, der Session refresht und für Auth-Guard genutzt wird
**`src/lib/supabase/types.ts`** — wird in Schritt 3.6 generiert, leer für jetzt anlegen

> Referenz für Code-Patterns: Supabase Docs „Auth Helpers for Next.js (App Router) with @supabase/ssr". Nutze die offiziellen Patterns, keine eigenen Auth-Wrapper.

### 3.6 TypeScript-Typen generieren

Voraussetzung: `supabase login` einmalig ausgeführt, User authentifiziert.

```bash
supabase gen types typescript --project-id nflkobdfdhncrtjncpmq > src/lib/supabase/types.ts
```

Resultat: vollständige Typen für alle 10 Tabellen + Views + RPC-Signaturen. Diese Datei
wird committet — sie ist die Grundlage für alle Folge-Sprints.

> **Falls `supabase gen types` fehlschlägt** (z. B. weil Login fehlt): in `sprint_00_review.md`
> als offene Frage melden. Sprint 0 NICHT als „done" markieren ohne diese Datei.

### 3.7 Middleware für Auth-Schutz

**`src/middleware.ts`** im Repo-Root von `src/`:

- Refresh der Session via `@supabase/ssr` bei jedem Request
- Wenn User nicht eingeloggt UND Pfad `≠ /login` → Redirect auf `/login`
- Wenn User eingeloggt UND Pfad `= /login` → Redirect auf `/`
- `matcher` in der `config` so setzen, dass Static Assets ausgenommen sind

### 3.8 Login-Seite

**`src/app/login/page.tsx`** — Server Component mit Form:
- Eingabefelder Email + Passwort
- Submit als Server Action (kein `<form>` mit `onSubmit` — Next.js Server Action)
- Bei Erfolg: Redirect auf `/`
- Bei Fehler: Fehlermeldung anzeigen (deutsch — z. B. „Anmeldung fehlgeschlagen")

**Styling:** minimalistisch, gemäß Tokens (`var(--bg-base)`, `var(--text-primary)` usw.).
Diese Seite ist Werkzeug, kein Produkt — keine Design-Polish-Pflicht. Aber **NICHT**
mit einem fremden Look (Tailwind-Default, Material-Style etc.). Plain CSS gemäß
`tokens.css`.

### 3.9 Logout

**`src/app/api/auth/logout/route.ts`** ODER Server Action in `src/app/actions/auth.ts`:
- Session zerstören via Supabase
- Redirect auf `/login`

Aufruf erfolgt von einem simplen „Logout"-Link/Button im Dashboard-Skeleton.

### 3.10 Dashboard-Skeleton

**`src/app/page.tsx`** — Server Component:
- Holt Session via Server-Client
- Zeigt: Email des eingeloggten Users + Logout-Button
- KEIN Ring, KEINE Karten, KEIN Header — nur ein leerer `<main>` mit Logout-Trigger

### 3.11 Globale Tokens als CSS Custom Properties

**`src/styles/tokens.css`** — die zentrale Datei mit allen Design-Tokens.

Inhalt: **1:1 Übernahme aus Design-Doku §3**. Alle Werte aus den Token-Tabellen (Farben,
Typografie, Radien, Strokes, Spacings, Schatten/Glows) als CSS Custom Properties unter
`:root { ... }`. Strikte Naming-Konvention:

```css
:root {
  /* Beispielhafte Struktur — exakte Token-Namen aus Design-Doku §3 übernehmen */
  --color-bg-base: ...;
  --color-fg-primary: ...;
  --color-accent-teal: ...;
  --radius-card: ...;
  --stroke-ring: ...;
  /* etc. */
}
```

**Regel:** Token-Name in `tokens.css` = Token-Name in Design-Doku §3 (in
kebab-case-Übersetzung). Wenn die Design-Doku den Token „Accent / Teal" nennt, wird daraus
`--color-accent-teal`. Keine eigenen Namen erfinden.

`tokens.css` wird in `src/app/layout.tsx` global importiert (`import "@/styles/tokens.css"`).

### 3.12 Globale Layout-Defaults

**`src/app/layout.tsx`** — Root Layout:
- HTML `lang="de"`
- Body bekommt `background: var(--color-bg-base)` und Default-Schrift gemäß §3
- Schriftarten gemäß Design-Doku §3 einbinden (vermutlich Inter — siehe Doku, nicht raten)

**Wichtig:** Wenn die Design-Doku einen Web-Font verlangt, mit `next/font/google` einbinden,
nicht über `<link>`-Tags.

### 3.13 README-Stub

**`README.md`** im Repo-Root: ein kurzer Quickstart-Block.

```markdown
# Antigravity Finance

Setup: pnpm install · cp .env.example .env.local · echte Werte eintragen · pnpm dev

Siehe CLAUDE.md für vollständigen Projektkontext.
```

Mehr nicht. Die echte Doku ist `CLAUDE.md`.

---

## 4. Akzeptanz-Kriterien (alle müssen erfüllt sein für Approval)

| # | Kriterium | Wie geprüft |
|---|---|---|
| A1 | `pnpm install` läuft fehlerfrei durch | Im Sprint-Review als Output dokumentiert |
| A2 | `pnpm dev` startet auf `http://localhost:3000` ohne Console-Errors | Screenshot der Console |
| A3 | Aufruf von `/` ohne Session → Redirect auf `/login` | Screenshot Browser-URL |
| A4 | Login mit Test-User-Credentials erfolgreich → Landing auf `/` | Screenshot Dashboard-Skeleton |
| A5 | Auf `/` ist die Email des Users sichtbar | Screenshot |
| A6 | Logout-Button funktioniert → Redirect auf `/login`, Session weg | Screenshot |
| A7 | Erneuter Aufruf von `/` nach Logout → Redirect auf `/login` | Screenshot |
| A8 | `src/lib/supabase/types.ts` enthält Typen für alle 10 Tabellen | `grep "Tables:" src/lib/supabase/types.ts` zeigt 10 Einträge |
| A9 | `src/styles/tokens.css` enthält ALLE Tokens aus Design-Doku §3 | Manueller Vergleich Token-für-Token |
| A10 | DevTools → Computed Styles auf `<html>`: Custom Properties sind aktiv | Screenshot DevTools |
| A11 | `pnpm build` läuft fehlerfrei durch | Build-Output dokumentiert |
| A12 | `tsc --noEmit` ohne Fehler | Output dokumentiert |
| A13 | Ordnerstruktur stimmt 1:1 mit CLAUDE.md §3 | `tree src/` Output dokumentiert |
| A14 | `.env.local` ist NICHT in `git status` sichtbar | `git status` Output |

---

## 5. Smoke-Test-Sequenz (in dieser Reihenfolge im Browser)

1. `pnpm dev` starten
2. `localhost:3000/` aufrufen → erwartet: Redirect zu `/login`
3. Login mit Test-User → erwartet: Landing auf `/`, Email sichtbar
4. Browser-Tab schließen, neuen Tab → `localhost:3000/` → erwartet: weiter eingeloggt
5. Auf Logout-Button klicken → erwartet: Landing auf `/login`
6. `localhost:3000/` aufrufen → erwartet: Redirect zu `/login`
7. Login mit FALSCHEM Passwort → erwartet: deutsche Fehlermeldung sichtbar

Schritte 1–7 sind Pflicht. Wenn einer scheitert, Sprint NICHT als „done" markieren.

---

## 6. Sprint-Output (`sprints/sprint_00_review.md`)

Folgender Inhalt ist Pflicht:

1. **`git status` + Datei-Liste** der neu erzeugten/geänderten Dateien
2. **Output von `tree src/`** (mind. 3 Ebenen tief)
3. **Output von `pnpm build`** (letzte 20 Zeilen)
4. **Screenshots** zu A2–A7 und A10
5. **Selbst-Review-Checkliste** A1–A14: für jeden Punkt `✅ erledigt` / `⚠️ abgewichen weil…` / `❌ offen weil…`
6. **Token-Mapping-Tabelle:** Welcher Design-Doku-§3-Token wurde zu welcher CSS-Variable.
   Format:
   | Design-Doku §3 Bezeichnung | CSS-Variable | Wert |
   |---|---|---|
   | Background / Base | `--color-bg-base` | `#0A0A0A` |
   | … | … | … |
7. **Offene Fragen** an den PM (falls vorhanden)
8. **CLAUDE.md-Update-Vorschläge** (Lessons Learned, neue Regeln) — als Vorschlag,
   nicht als Ausführung

---

## 7. Nicht-Aufgaben (Anti-Drift — was Sprint 0 EXPLIZIT NICHT macht)

- ❌ Kein Singularity Ring (Sprint 2)
- ❌ Keine Header / Timeline-Navigation (Sprint 3)
- ❌ Keine Karten (Sprint 4)
- ❌ Keine Untere Interaktionszone (Sprint 5)
- ❌ Kein Onboarding-Flow (Sprint 1)
- ❌ Kein Income / Partner-Split-UI (Sprint 1)
- ❌ Keine RPC-Aufrufe (außer für Auth)
- ❌ Keine Sparrate-Logik (Sprint 2/6)
- ❌ Kein CSV-Import (Sprint 7)
- ❌ Keine Soft-Delete-UI (Sprint 8)
- ❌ Keine Sparraten-Treppe (Sprint 9)
- ❌ Kein Vercel-Deployment (kommt später)
- ❌ Keine Tests / kein Jest / kein Playwright (V1 ist manuell getestet)
- ❌ Keine eigene Auth-Logik außerhalb der offiziellen Supabase-SSR-Patterns
- ❌ Keine Schema-Änderungen (Schema ist eingefroren)

Wenn während der Implementation der Drang aufkommt, etwas davon „schon mal vorzubereiten":
**nein**. In Sprint 0 ist „nur die Pflicht" das Ziel.

---

## 8. Bekannte Stolperfallen

- **Cookie-Domain-Issues:** Bei Supabase-SSR muss das Cookie-Setting in `middleware.ts`
  und `server.ts` konsistent sein, sonst klappt der Auth-Refresh nicht. Wenn nach Login
  ein Reload zum Logout führt: Cookie-Setup prüfen (offizielle Doku-Beispiele exakt
  übernehmen).
- **`supabase gen types` ohne Login:** liefert silent leere Datei oder Auth-Error. Vor
  Generation `supabase login` ausführen.
- **`next/font` und CSS-Variablen:** Wenn der Web-Font in `tokens.css` referenziert wird,
  muss der `next/font`-Loader die Schrift als CSS-Variable bereitstellen (`variable: '--font-...'`).
  Sonst gibt's Hydration-Warnings.
- **`--no-src-dir`-Falle:** s. Schritt 3.1.

---

## 9. Falls etwas blockiert

Sprint NICHT „durchwurschteln". Stattdessen:
1. In `sprints/sprint_00_review.md` unter „Offene Fragen" dokumentieren
2. Den Sprint-Status in CLAUDE.md NICHT auf 🟢 setzen — bleibt 🟡
3. Zurück an PM (im PM-Chat) für Eskalation

---

**Ende des Sprint-0-Briefings.**
