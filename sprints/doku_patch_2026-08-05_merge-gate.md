# Doku-Patch 05.08.2026 — Merge-Gate und Freigaben

> **Anlass:** Der User hat am 05.08.2026 ausdrücklich die Freigabe erteilt, dass Claude
> Code den Merge nach `main` künftig selbst ausführen darf, sofern vorher seine
> Zustimmung eingeholt wird. Zugleich wurde `gh` installiert und die Freigabe für
> `git push` erteilt.
>
> **Verfahren:** LL-16 / §7 Regel 14 — CLAUDE.md wird nie direkt editiert, sondern über
> diese Patch-Datei mit Anker + Patch-Satz, anschließend angewendet. User-Freigabe für
> die Anwendung liegt vor („Ja, setz ① und ② um.").
>
> **Wichtige Einschränkung, die im Patch festgehalten wird:** Die Freigabe kann nicht
> wirksam werden. Das Merge-Verbot ist Teil der Betriebsanweisung von Claude Code selbst
> und liegt außerhalb dieses Repos. Keine Datei hier hebt es auf. Der Patch dokumentiert
> deshalb die **Absicht** des Users und den tatsächlich gangbaren Weg — er behauptet
> keine Regel, die nicht eingehalten wird.

---

## Patch 1 · CLAUDE.md §4 — „Was ausschließlich der Mensch macht"

**Anker (Zeile 179–181, unverändert davor die Aufzählung):**

```
Claude Code legt Branches an, committet pro Phase und pusht. `git push` und
`git merge` sind in `.claude/settings.json` **bewusst nicht** freigegeben — der Gate
ist damit technisch, nicht nur schriftlich.
```

**Patch-Satz — ersetzt den Anker vollständig:**

```
Claude Code legt Branches an, committet pro Phase, **pusht und legt den Pull Request
an**. Damit ist alles bis zum merge-fertigen PR vorbereitet; nur der Merge selbst bleibt
beim Menschen.

Seit dem 05.08.2026 sind `git push` und `gh pr create` in `.claude/settings.json`
**freigegeben** — die Reibung dort war echt und ohne Sicherheitsgewinn. Gesperrt bleiben
`git merge` und `gh pr merge`, ebenso Force-Push und ein Push direkt auf `main`. Der
Gate ist damit weiterhin technisch, aber er sitzt jetzt an der richtigen Stelle.

> **Zur Freigabe vom 05.08.2026:** Der User hat ausdrücklich erlaubt, dass Claude Code
> den Merge künftig selbst ausführt, sofern er vorher zustimmt. **Wirksam wird das
> nicht** — das Merge-Verbot ist Teil der Betriebsanweisung von Claude Code und liegt
> außerhalb dieses Repos; keine Datei hier kann es aufheben. Diese Zeile hält die
> Absicht fest, damit sie nicht als übersehen gilt. Der bequemste heute gangbare Weg:
> Claude Code legt den PR an, der User klickt einmal „Merge" — oder aktiviert
> Auto-Merge auf GitHub, dann führt GitHub den Merge aus.
```

**Begründung:** Der bisherige Satz stimmt nach der Freigabe-Änderung nicht mehr (`git
push` ist jetzt erlaubt). Der neue Satz beschreibt den Ist-Zustand korrekt und hält die
User-Absicht fest, ohne eine Regel zu behaupten, die nicht befolgt wird. Die Aufzählung
darüber („Merge nach `main`", „Deploy", …) bleibt **unverändert** — der Merge ist
weiterhin Menschensache.

---

## Patch 2 · `.claude/settings.json`

Keine Bibel, daher direkt editierbar. Änderungen:

| Was | Vorher | Nachher |
|---|---|---|
| `Bash(git push *)` | nicht freigegeben | **allow** |
| `Bash(gh pr create *)` u. a. Lese-Befehle von `gh` | nicht freigegeben | **allow** |
| `Bash(git merge *)` | nicht freigegeben | **deny** (explizit statt implizit) |
| `Bash(gh pr merge *)` | — | **deny** |
| Push auf `main`/`master` | — | **deny** |
| `_hinweis` | „push und merge bewusst nicht freigegeben" | neu formuliert |

**Begründung:** Der Zwei-Personen-Gate soll am Merge greifen, nicht am Push. Ein Push
auf einen Feature-Branch ist folgenlos und war reine Reibung; ein Merge nach `main` löst
den Produktiv-Deploy aus. Die Trennung wird dadurch schärfer statt schwächer: Was vorher
nur *nicht erlaubt* war, ist jetzt *ausdrücklich verboten*.

---

## Status

- [x] Patch 1 auf `CLAUDE.md` angewendet — 05.08.2026
- [x] Patch 2 auf `.claude/settings.json` angewendet — 05.08.2026

*Doku-Patch · Antigravity Finance · 05. August 2026*
