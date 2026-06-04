# Sprint 0 — Review

> **Sprint-Nummer:** 0
> **Komponente:** Projekt-Fundament
> **Status (Self-Assessment):** 🟡 In Progress — Code komplett, In-Browser-Smoke-Test offen
> **Branch:** `sprint/00-setup`
> **Datum:** 10. Mai 2026

---

## 1. Code-Diff — `git status` + Datei-Liste

```
?? .env.example
?? .eslintrc.json
?? .gitignore
?? README.md
?? next.config.mjs
?? package.json
?? pnpm-lock.yaml
?? pnpm-workspace.yaml
?? src/
?? tsconfig.json
```

`.env.local` ist **nicht** in `git status` sichtbar (gitignored über `.env*.local`,
verifiziert mit `git check-ignore -v .env.local` → `.gitignore:29:.env*.local`). ✅

**Neue / geänderte Dateien insgesamt:**

| Datei | Zweck |
|---|---|
| `package.json` | Next 14.2.35 + React 18.3.1 + `@supabase/ssr` 0.10.3 + `@supabase/supabase-js` 2.105.4 |
| `pnpm-lock.yaml` | Lockfile |
| `pnpm-workspace.yaml` | `allowBuilds.unrs-resolver: false` (siehe §10 Stolperfallen) |
| `tsconfig.json` | Standard Next-14-Config, `paths: { "@/*": ["./src/*"] }`, `strict: true` |
| `next.config.mjs` | Empty default |
| `.eslintrc.json` | `next/core-web-vitals` |
| `.gitignore` | Generiert + `/supabase/.temp/` ergänzt |
| `next-env.d.ts` | Auto-generiert (gitignored) |
| `README.md` | Stub gemäß Briefing §3.13 |
| `.env.example` | Template ohne Werte |
| `.env.local` | **gitignored**, enthält URL + Platzhalter `PASTE_PUBLISHABLE_KEY_HERE` |
| `src/app/layout.tsx` | Root Layout mit `lang="de"`, importiert `tokens.css` + `globals.css` |
| `src/app/globals.css` | Body-Reset + Background + System-Font-Stack |
| `src/app/page.tsx` | Dashboard-Skeleton: User-Email + Logout-Button |
| `src/app/page.module.css` | Dashboard-Styling (nur Tokens) |
| `src/app/login/page.tsx` | Server Component, Form mit Server Action `login` |
| `src/app/login/actions.ts` | Server Action für `signInWithPassword` |
| `src/app/login/login.module.css` | Login-Form-Styling (nur Tokens) |
| `src/app/actions/auth.ts` | Server Action `logout` (`signOut` + redirect `/login`) |
| `src/app/favicon.ico` | Default aus create-next-app |
| `src/lib/supabase/client.ts` | Browser-Client via `createBrowserClient` |
| `src/lib/supabase/server.ts` | SSR-Client via `createServerClient`, Cookie-Bridge zu `next/headers` |
| `src/lib/supabase/middleware.ts` | Middleware-Helper: Session-Refresh + Auth-Guard-Logik |
| `src/lib/supabase/types.ts` | Generiert via `supabase gen types typescript --project-id nflkobdfdhncrtjncpmq` (642 Zeilen) |
| `src/middleware.ts` | Edge Middleware mit Matcher (Static Assets ausgeklammert) |
| `src/styles/tokens.css` | 16 Farb-Tokens + 7 Typografie-Blöcke + System-Font-Stack |

---

## 2. `tree src/` (≥ 3 Ebenen)

```
src
├── app
│   ├── actions
│   │   └── auth.ts
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── login
│   │   ├── actions.ts
│   │   ├── login.module.css
│   │   └── page.tsx
│   ├── page.module.css
│   └── page.tsx
├── lib
│   └── supabase
│       ├── client.ts
│       ├── middleware.ts
│       ├── server.ts
│       └── types.ts
├── middleware.ts
└── styles
    └── tokens.css
```

**Abweichungen ggü. CLAUDE.md §3:**

- `src/components/` und `src/lib/rpc.ts` existieren noch nicht — gemäß Briefing §7 ist das
  korrekt (kommt erst mit Sprint 2+). Werden in den jeweiligen Sprints angelegt.
- `src/lib/tokens.ts` (TS-Konstanten-Spiegel) existiert noch nicht — wird erst angelegt,
  wenn Komponenten Tokens in JS brauchen (z. B. SVG-Stroke-Werte für den Singularity Ring,
  Sprint 2). In Sprint 0 reicht `tokens.css` allein, weil noch keine JS-Konsumenten existieren.
  → **Vorschlag an PM:** explizit klären, ob `tokens.ts` Pflicht-Spiegel sein soll oder nur
  bei Bedarf entsteht (siehe §9 Offene Fragen).
- `src/lib/supabase/middleware.ts` ist zusätzlich zur CLAUDE.md-§3-Liste — entspricht aber
  dem offiziellen Supabase-SSR-Pattern (Cookie-Bridge zwischen Edge Middleware und Auth).
- `src/app/onboarding/` existiert nicht — kommt mit Sprint 1.

---

## 3. `pnpm build` — letzte Zeilen

```
   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types ...
   Collecting page data ...
 ✓ Generating static pages (6/6)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                              Size     First Load JS
┌ ƒ /                                    242 B          87.5 kB
├ ○ /_not-found                          873 B          88.1 kB
└ ƒ /login                               298 B          87.5 kB
+ First Load JS shared by all            87.2 kB
  ├ chunks/2200cc46-8888eb43b3e410d8.js  53.6 kB
  ├ chunks/945-5214ebc016ec4275.js       31.7 kB
  └ other shared chunks (total)          1.87 kB

ƒ Middleware                             81.5 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

`pnpm exec tsc --noEmit` → **No errors found.** ✅

---

## 4. Sanity-Test (curl statt Browser, weil Real-Login Echtschlüssel braucht)

```
=== GET / (no session, expect redirect) ===
HTTP/1.1 307 Temporary Redirect
location: /login

=== GET /login (expect 200) ===
HTTP/1.1 200 OK
```

Middleware-Guard funktioniert auch mit Platzhalter-Key, weil Supabase bei ungültigem Key
`{ user: null, error }` zurückgibt → Redirect-Logik wird trotzdem ausgelöst.

---

## 5. Selbst-Review-Checkliste A1–A14

| # | Kriterium | Status | Anmerkung |
|---|---|---|---|
| A1 | `pnpm install` läuft fehlerfrei | ✅ erledigt | Installation OK; pnpm-11-Warnung zu `unrs-resolver` über `allowBuilds: false` ruhiggestellt |
| A2 | `pnpm dev` startet ohne Console-Errors | ⚠️ teilweise verifiziert | Server läuft (curl `/login` → 200); volle Browser-Console-Inspektion durch User offen |
| A3 | `/` ohne Session → Redirect `/login` | ✅ erledigt | curl `HTTP/1.1 307 Temporary Redirect → location: /login` |
| A4 | Login mit Test-User → Landing `/` | ⏳ offen | Erfordert echten Publishable Key in `.env.local` — User-Test |
| A5 | Email auf `/` sichtbar | ⏳ offen | Komponente schreibt `{user?.email}` in `<p>` — User-Test |
| A6 | Logout → Redirect `/login`, Session weg | ⏳ offen | Server Action `signOut()` + redirect — User-Test |
| A7 | Nach Logout: `/` → Redirect `/login` | ⏳ offen | Mittlerweile durch A3 plausibel — User-Test |
| A8 | `types.ts` enthält Typen für alle 10 Tabellen | ✅ erledigt | `app_config`, `card_fragment_links`, `card_monthly_states`, `card_planned_timeline`, `cards`, `deleted_entities`, `fragments`, `income_timeline`, `net_estimation_brackets`, `profiles` — verifiziert per `grep` |
| A9 | `tokens.css` enthält alle Tokens aus §3 | ✅ erledigt | 16 Farben + System-Font + 7 Typografie-Blöcke — siehe §6 |
| A10 | DevTools → `:root` Custom Properties aktiv | ⏳ offen | User-Test im Browser |
| A11 | `pnpm build` fehlerfrei | ✅ erledigt | Output siehe §3 |
| A12 | `tsc --noEmit` ohne Fehler | ✅ erledigt | „No errors found" |
| A13 | Ordnerstruktur ≈ CLAUDE.md §3 | ⚠️ erledigt mit Vorbehalt | siehe §2 Abweichungen |
| A14 | `.env.local` nicht in `git status` | ✅ erledigt | gitignored, `git check-ignore -v` bestätigt |

**Zusammenfassung:** 8 ✅, 1 ⚠️ (A2 partial), 1 ⚠️ (A13 mit dokumentierten Auslassungen), 5 ⏳ (A4–A7, A10 — Browser-Tests durch User).

---

## 6. Token-Mapping-Tabelle

### Farben (16 Tokens)

| Design-Doku §3 Bezeichnung | CSS-Variable | Wert |
|---|---|---|
| App-Hintergrund | `--bg-primary` | `#0D0D0F` |
| Karten-Hintergrund neutral | `--bg-card` | `#141416` |
| Karte offen / laufend | `--bg-card-open` | `#160D0D` |
| Karte bezahlt / erhalten | `--bg-card-paid` | `#0A140E` |
| Budget überschritten | `--bg-card-over` | `#160A08` |
| Ghost / Forecast | `--bg-card-ghost` | `#181818` |
| Positiv / bezahlt / Plan / Einnahmen | `--color-teal` | `#3ECFAF` |
| Negativ / offen / Defizit | `--color-red` | `#FF453A` |
| Vorjahres-Referenz / Ereignisse | `--color-gold` | `rgba(255,200,60,0.6)` |
| Gemeinsam-Attribution | `--color-blue-dot` | `rgba(100,168,240,0.38)` |
| Aktiver Text | `--text-primary` | `#ffffff` |
| Offene Zustände | `--text-muted` | `rgba(255,255,255,0.45)` |
| Labels / Metadaten | `--text-ghost` | `rgba(255,255,255,0.22)` |
| Standard-Border | `--border-subtle` | `rgba(255,255,255,0.07)` |
| Bezahlt-Border | `--border-teal` | `rgba(62,207,175,0.22)` |
| Offen-Border | `--border-red` | `rgba(255,69,58,0.18)` |

Token-Namen 1:1 aus §3-Tabelle übernommen (sie waren in der Doku bereits als
CSS-Variablen-Namen geschrieben, keine Übersetzung nötig).

### Typografie (7 Blöcke + Numerik + Font-Stack)

| Design-Doku §3 Element | Tokens | Werte |
|---|---|---|
| Primärzahl (Ring) | `--typo-ring-{size,weight,tracking}` | `34px / 200 / -1.8px` |
| Aktiver Monat (Header) | `--typo-month-active-{size,weight,tracking}` | `17px / 600 / -0.5px` |
| Kartenname | `--typo-card-name-{size,weight,tracking}` | `13px / 500 / -0.2px` |
| Kartenbetrag | `--typo-card-amount-{size,weight,tracking}` | `22px / 200 / -1.2px` |
| Flanken-Monat | `--typo-month-flank-{size,weight,tracking}` | `13px / 500 / -0.2px` |
| Labels (klein, 9px) | `--typo-label-small-{size,weight,tracking}` | `9px / 600 / 1.1px` |
| Labels / Meta (10px) | `--typo-label-meta-{size,weight,tracking}` | `10px / 500 / 0.6px` |
| Alle Zahlen | `--typo-numeric-variant` | `tabular-nums` |
| Font-Stack (PM-Klärung) | `--font-stack-system` | `system-ui, -apple-system, "Helvetica Neue", sans-serif` |

Die §3-Range „9–10px / 500–600 / 0.6–1.1px" für Labels habe ich gemäß PM-Klärung in zwei
diskrete Blöcke (`label-small` 9px und `label-meta` 10px) gesplittet.

**NICHT in `tokens.css`** (per PM-Klärung): Radien, Strokes, Spacings, Shadows. Die kommen
mit den Komponenten-Sprints in deren CSS-Module — §3 enthält nur Farben + Typografie.

---

## 7. Smoke-Test-Sequenz für User

Vor dem Test: in `.env.local` den Platzhalter `PASTE_PUBLISHABLE_KEY_HERE` durch den
echten `sb_publishable_…` Key ersetzen. Dev-Server danach **neu starten** (Next.js liest
`.env.local` nur beim Start).

1. `pnpm dev` → erwartet: kein Fehler in Console
2. `localhost:3000/` → erwartet: Redirect `/login`
3. Login mit Test-User → erwartet: Landing `/`, Email sichtbar
4. Tab schließen, neu öffnen → `localhost:3000/` → erwartet: weiter eingeloggt
5. „Abmelden"-Button → erwartet: Redirect `/login`
6. `localhost:3000/` → erwartet: Redirect `/login`
7. Login mit FALSCHEM Passwort → erwartet: deutsche Fehlermeldung („Anmeldung fehlgeschlagen…")

Wenn 1–7 grün → A2/A4–A7/A10 sind erledigt → Sprint kann auf 🟢 gesetzt werden.

---

## 8. Screenshots

**Pflicht laut Briefing §6:** Screenshots zu A2–A7 und A10. Da die volle Smoke-Test-Sequenz
einen echten Schlüssel braucht, sind diese **noch nicht beigebracht**. Sobald der Key
in `.env.local` steht und Schritte 1–7 durchlaufen sind, kann der User die Screenshots
nachliefern (ich kann das Headless-Browser-mäßig nicht für dich übernehmen).

---

## 9. Offene Fragen an den PM

1. **`src/lib/tokens.ts`?** CLAUDE.md §3 listet die Datei explizit. Sprint 0 hat noch keinen
   JS-Konsumenten für Tokens (alles via `tokens.css`). Soll die Datei jetzt schon als
   Pflicht-Spiegel angelegt werden (Single-Source-Quälerei: TS spiegelt CSS), oder darf
   sie erst in dem Sprint entstehen, der einen JS-Konsumenten benötigt (mein Vorschlag —
   Sprint 2 für SVG-Stroke-Werte des Rings)?
2. **Numerik-Token `font-variant-numeric`:** Aktuell als `--typo-numeric-variant: tabular-nums`
   exportiert. CSS-Konsumenten setzen `font-variant-numeric: var(--typo-numeric-variant)`.
   Alternative: globale Default-Regel in `globals.css` (`*, body { font-variant-numeric: tabular-nums }`).
   §3 sagt nur „Alle Zahlen" — ist die globale Default-Variante gewünscht oder explizit
   pro Komponente? **Konservativer Default jetzt:** nur Token, kein globaler Apply
   (Anwendung erfolgt in Komponenten-CSS, sobald Zahlen gerendert werden).
3. **Login-Page-Polish:** Die Seite nutzt nur die Farb-Tokens (kein Glow, keine speziellen
   Spacings — die kommen ja erst aus den Komponenten-Sprints). Ist das OK so, oder
   wird die Login-Page später nochmal aufgehübscht?

---

## 10. Stolperfallen, die im Briefing nicht standen

Diese sind beim Setup aufgetaucht — Vorschläge zur CLAUDE.md-Aktualisierung in §11.

1. **npm naming restriction:** Verzeichnisname `Antigravity_Finance` enthält Großbuchstaben.
   `pnpm create next-app .` schlägt fehl mit „name can no longer contain capital letters".
   Workaround: Init in `mktemp -d` als `antigravity-finance`, anschließend per `rsync` ins
   Repo-Root.
2. **`pnpm 11` strict ignored-builds:** Die neue Default-Behandlung des `unrs-resolver`-Build-Scripts
   bricht jeden `pnpm install` ab (`ERR_PNPM_IGNORED_BUILDS`). Fix: `pnpm-workspace.yaml`
   mit `allowBuilds: { unrs-resolver: false }`. (`ignoredBuiltDependencies` allein reicht
   in pnpm 11 nicht.)
3. **Supabase-Plugin-Hook hängt einen `<claude-code-hint>`-Tag an die generierte `types.ts`.**
   Das macht die Datei zu ungültigem TypeScript (`tsc` 5 Fehler in Zeile 643). Ich habe
   den Tag entfernt; `tsc` ist danach grün. Ursache vermutlich ein MCP-Plugin im
   Claude-Code-Setup, nicht die Supabase-CLI selbst. Empfehlung: nach jedem
   `supabase gen types`-Aufruf prüfen und ggf. die letzte Zeile entfernen.

---

## 11. Vorschläge zur CLAUDE.md-Aktualisierung

> Vorschlag, nicht Ausführung. Du als PM entscheidest.

**§7 „Was Claude Code NIE macht":** Ergänzen um „Keine `eslint`/`react`-Major-Bumps ohne
Sprint-Briefing — wir bleiben in V1 auf Next 14 / React 18 / ESLint 8 (auch wenn
create-next-app 14 deprecation-Warnungen wirft)."

**§7 „Datei-Konventionen":** Klarstellen, ob `src/lib/tokens.ts` Pflicht-Spiegel von
`tokens.css` ist (siehe §9.1).

**§10 „Initial":** Ergänzen um den abgeschlossenen Sprint 0 mit:
- Next 14.2.35 + React 18.3.1 + Supabase-SSR 0.10.3 + Supabase-JS 2.105.4 installiert
- pnpm-Workspace-Config für `unrs-resolver` (siehe §10.2 dieses Reviews)
- Login + Logout via Server Actions, kein Client-State
- Middleware-Auth-Guard liegt in `src/lib/supabase/middleware.ts` (Helper) + `src/middleware.ts` (Edge Wrapper)
- TypeScript-Generierung erfordert manuelles Stripping des `<claude-code-hint>`-Tags (siehe §10.3)

---

**Ende des Sprint-0-Reviews.**
