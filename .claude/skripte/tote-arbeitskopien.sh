#!/usr/bin/env bash
# Tote Arbeitskopien (git worktrees) finden — melden oder entfernen.
#
# ANLASS (Sprint v2-32, 04.09.2026): Unter .claude/worktrees/ lagen NEUN
# Arbeitskopien mit zusammen 4.309 MB. Der Schritt, sie zu entfernen, stand die
# ganze Zeit in `sprint-abschluss` Schritt 9 — als beiläufige Halbzeile am Ende
# eines langen Ablaufs ("Temporäre Dateien und Arbeitskopien entfernen"). Er wurde
# über NEUN Sprints hinweg übersehen.
#
# WARUM EIN SKRIPT UND EIN HOOK STATT EINER ZEHNTEN CHECKLISTEN-ZEILE: Nach LL-40
# ist eine Checklisten-Zeile eine Zusicherung, eine Prüfung ist eine Prüfung. Die
# gemessene Trefferquote der bestehenden Zeile ist NULL. Der Hook wird von der
# Umgebung ausgeführt, nicht vom Agenten — er kann nicht vergessen werden.
#
# WARUM DER HOOK NUR MELDET UND NIE LÖSCHT: Eine laufende Sitzung kann in einer
# Arbeitskopie stehen, deren Branch bereits gemergt ist. Automatisches Löschen
# würde ihr den Boden unter den Füßen wegziehen. Melden ist folgenlos; Löschen ist
# eine Entscheidung und gehört an den Sprint-Abschluss.
#
# Aufruf:
#   tote-arbeitskopien.sh melden      -> JSON für den SessionStart-Hook (still, wenn nichts da ist)
#   tote-arbeitskopien.sh zeigen      -> lesbare Liste für den Menschen
#   tote-arbeitskopien.sh entfernen   -> entfernt AUSSCHLIESSLICH die belegbar sicheren

set -uo pipefail
MODUS="${1:-zeigen}"

GIT=git
command -v /usr/bin/git >/dev/null 2>&1 && GIT=/usr/bin/git

HAUPT=$("$GIT" rev-parse --path-format=absolute --git-common-dir 2>/dev/null) || exit 0
HAUPT=$(dirname "$HAUPT")
[ -d "$HAUPT" ] || exit 0

HIER=$("$GIT" rev-parse --show-toplevel 2>/dev/null || echo "")

# ── Die Prüfung, die vor ALLEM anderen kommt ────────────────────────────────
# `git status` zeigt gitignorierte Dateien NICHT an. Eine saubere Statusmeldung
# ist deshalb kein Beleg, dass in einer Arbeitskopie nichts Wichtiges liegt:
# .env.local und .env.e2e.local sind gitignoriert. Genau so sind sie zwischen
# v2-10 und v2-15 verschwunden (CLAUDE.md §4) — mit der Folge, dass der
# angemeldete Render-Smoke ersatzlos entfiel und `pnpm build` abbrach.
ENV_FEHLT=""
for f in .env.local .env.e2e.local; do
  [ -f "$HAUPT/$f" ] || ENV_FEHLT="$ENV_FEHLT $f"
done

tot=0; lebend=0; mb=0; namen=""
while IFS= read -r p; do
  [ -n "$p" ] || continue
  [ "$p" = "$HAUPT" ] && continue
  [ "$p" = "$HIER" ] && continue          # nie die eigene Arbeitskopie
  [ -d "$p" ] || continue

  dreckig=$("$GIT" -C "$p" status --porcelain 2>/dev/null | wc -l | tr -d ' ')
  stash=$("$GIT" -C "$p" stash list 2>/dev/null | wc -l | tr -d ' ')
  if "$GIT" -C "$p" merge-base --is-ancestor HEAD origin/main 2>/dev/null; then
    drin=ja
  else
    drin=nein
  fi

  if [ "$dreckig" = "0" ] && [ "$stash" = "0" ] && [ "$drin" = "ja" ]; then
    tot=$((tot + 1))
    namen="$namen $(basename "$p")"
    g=$(du -sm "$p" 2>/dev/null | cut -f1); mb=$((mb + ${g:-0}))
    if [ "$MODUS" = "entfernen" ]; then
      if [ -n "$ENV_FEHLT" ]; then
        echo "  ABBRUCH: im Haupt-Checkout fehlt:$ENV_FEHLT" >&2
        echo "  Erst dort wiederherstellen — sonst gehen sie mit der Arbeitskopie verloren." >&2
        exit 1
      fi
      "$GIT" worktree unlock "$p" >/dev/null 2>&1
      if "$GIT" worktree remove "$p" >/dev/null 2>&1; then
        echo "  entfernt: $(basename "$p")  (${g:-?} MB)"
      else
        echo "  FEHLER beim Entfernen: $(basename "$p")" >&2
      fi
    fi
  else
    lebend=$((lebend + 1))
  fi
done < <("$GIT" worktree list --porcelain 2>/dev/null | sed -n 's/^worktree //p')

[ "$MODUS" = "entfernen" ] && "$GIT" worktree prune >/dev/null 2>&1

case "$MODUS" in
  melden)
    # Still bleiben, wenn es nichts zu melden gibt. Eine Meldung, die immer
    # kommt, wird weggelesen — danach ist auch die echte unsichtbar.
    [ "$tot" -eq 0 ] && exit 0
    printf '{"systemMessage":"%d tote Arbeitskopie(n) unter .claude/worktrees/ (~%d MB) — Branch gemergt, nichts Ungesichertes. Entfernen: .claude/skripte/tote-arbeitskopien.sh entfernen"}\n' "$tot" "$mb"
    ;;
  zeigen)
    if [ "$tot" -eq 0 ]; then
      echo "Keine toten Arbeitskopien. (Aktiv: $lebend)"
    else
      echo "Tot (Branch in origin/main, nichts Ungesichertes, ~${mb} MB):$namen"
      echo "Aktiv/ungemergt und deshalb unangetastet: $lebend"
      [ -n "$ENV_FEHLT" ] && echo "⚠️  Im Haupt-Checkout fehlt:$ENV_FEHLT — Entfernen würde abbrechen."
    fi
    ;;
  entfernen)
    echo "Entfernt: $tot  ·  freigegeben: ~${mb} MB  ·  unangetastet: $lebend"
    ;;
esac
exit 0
