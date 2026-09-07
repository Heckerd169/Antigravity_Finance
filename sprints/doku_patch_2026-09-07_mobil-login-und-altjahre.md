# Nachzug 07.09.2026 — Altjahre gelöscht, Login merkt sich das Ziel, `/mobile`-Alias

> Zwei Aufträge des Users am Abend nach dem Merge von v3-02 (PR #57), beide ohne eigenen
> Sprint: **① „Lösche alle Datenbankeinträge aus den Jahren 2023 und 2024."** ·
> **② „Ich sehe auf dem iPhone die neue /mobil-Ansicht nicht."**
> Branch `nachzug/2026-09-07-mobil-login-altjahre`. Kein Eingriff in eine Rechenfunktion.

---

## ① Die Zahlungen aus 2023 und 2024 sind gelöscht

**Gemessen vor dem Löschen (07.09.2026, 22:05 Uhr):**

| | 2023 | 2024 | zusammen |
|---|---|---|---|
| Zahlungen (`fragments`) | 384 | 183 | **567** |
| davon Überträge | 42 | 49 | 91 |
| mit Karten-Link · Netto-Link · Vorschlag | 0 · 0 · 0 | 0 · 0 · 0 | **0** |
| Zeitraum | 03.06.–31.12.2023 | 01.01.–30.12.2024 | |

**Keine andere Tabelle** trägt Zeilen aus diesen Jahren (`income_timeline`,
`card_planned_timeline`, `card_monthly_states`, `cards`, beide Link-Tabellen: je 0). Die
Zeilen stammen aus dem Visa-Jahresexport vom 03.09.2026 — CLAUDE.md §9 führte die Altjahre
als „noch nicht importiert"; ein Teil war es doch (Nebenbefund aus v3-02).

**Trockenlauf** (zurückgerollt, LL-18): 567 gelöscht; Sparrate September 2026
1.613,11 € und Januar 2025 −987,21 € vorher wie nachher.

**Freigabe des Users:** 22:10 Uhr („Ja, alle 567 löschen").

**Eingespielt** als dokumentierte Daten-Migration `supabase/migrations/20260907_v3_02_nachzug_altjahre_loeschen.sql`
(`apply_migration`, Name `v3_02_nachzug_altjahre_loeschen`). Die Migration bricht ab, wenn
eine der Zeilen verknüpft ist oder die Zahl nicht 567 beträgt — sie hat nicht abgebrochen.

**Nachher:** `fragments` **1.655** Zeilen, **0** vor 2025, früheste Zahlung 02.01.2025,
Verknüpfungen 1.187 (unverändert durch die Löschung). **Sparrate Ist und Plan, 24 Monate
2025 + 2026: byte-identisch zur Vorher-Messung** (Werte wie in
`sprints/sprint_v3-02_anker.md`, Abschnitt VORHER).

**Was daraus folgt:** Die Duplikat-Hashes dieser Zeilen sind weg; ein Re-Import derselben
Zeilen wäre möglich. Die Hausaufgabe `V1` (Entscheidung über die Altjahre) ist damit durch
Handeln entschieden: **Die Altjahre gehören nicht in die App.** Wer den DKB-Export künftig
zieht, grenzt ihn auf 2025 und 2026 ein.

---

## ② Nach dem Anmelden führt der Weg zum Ziel — nicht mehr aufs Dashboard

**Der Befund:** Beide Produktions-Deploys nach den Merges von #56 und #57 waren erfolgreich
(19:35 und 19:38 UTC), `/mobil` war live. Trotzdem sah der User am iPhone die mobile
Ansicht nicht — weil die Middleware ohne Anmeldung **jede** Adresse auf `/login` leitete
und nach dem Anmelden **immer** auf `/`. Wer `/mobil` aufrief, landete auf dem Dashboard.
Dazu kam `/mobile` als naheliegende Schreibweise, die es nicht gab.

**Gebaut:**

| Stelle | Änderung |
|---|---|
| `src/lib/next-path.ts` | `safeNextPath(raw)` — nur ein **interner** Pfad kommt durch: beginnt mit genau einem `/`, kein `//`, kein Rückstrich, kein `://`, kein Leerraum, nicht `/login`. Alles andere → `null` → Dashboard. Importfrei, läuft in der Edge-Middleware |
| `src/lib/supabase/middleware.ts` | Ohne Anmeldung: `/login?next=<Pfad+Suchanfrage>` (nur bei geprüftem Ziel, nicht für `/`). Angemeldet auf `/login`: zum geprüften Ziel, sonst `/`. Das Zeitlimit aus v2-24 ist unberührt; die unbenutzt gewordene Hilfsfunktion `redirectTo` ist weg |
| `src/app/login/page.tsx` · `actions.ts` | Die Seite reicht das geprüfte Ziel als verstecktes Feld weiter; die Aktion leitet nach dem Anmelden dorthin und behält es bei einem Fehlversuch |
| `next.config.mjs` | `/mobile` und `/mobile/*` → `/mobil` (dauerhaft), greift **vor** der Middleware |

**Warum eine Prüfung und nicht einfach `redirect(next)`:** Ein ungeprüfter `next`-Parameter
ist ein offenes Weiterleitungs-Ziel — `//evil.com` schickte den Nutzer nach dem Anmelden
auf eine fremde Seite. Keine Zahl würde dabei falsch (LL-26); deshalb ein Wächter.

**Wächter:** `tests/e2e/login-ziel.spec.ts` (4 Prüfungen über die echte Datei, in der
festen Liste des `visual`-Projekts), einmal absichtlich gebrochen (`//` erlaubt) → genau
ein Test rot, wiederhergestellt (LL-40). `unauth.spec.ts`: `/mobil/zuordnen?month=2026-08`
→ `next` samt Monat, verstecktes Feld gefüllt · `/` bekommt **kein** `next` · `/mobile` →
`next=/mobil`. `render-smoke-mobil.spec.ts`: angemeldet führt `/login?next=/mobil/zuordnen`
zum Ziel, `/login?next=//evil.com` aufs Dashboard.

**Prüfstrecke:** `tsc` 0 · ESLint 0/0 (roh) · Build 0 · Wächter siehe unten.

**Für den User am iPhone:** einmal `https://antigravity-finance-sigma.vercel.app/mobil`
öffnen, anmelden — die Ansicht erscheint jetzt direkt. Dann Teilen → „Zum Home-Bildschirm";
die App startet danach in `/mobil` mit Statusleiste über der Seite, so wie der Prototyp.

---

## Nebenwirkungen auf die Führungs-Dokumente

- Roadmap: `V1` erledigt (§4), §0 nachgezählt.
- CLAUDE.md-Patch (`sprints/sprint_v3-02_claude_md_patch.md`): die §9-Zeile zu den
  Altjahren sagt jetzt „gelöscht", nicht „liegen in der Datenbank". Weiterhin **nicht
  angewendet**.
- Historie: eigener Nachzug-Eintrag unter v3-02.
