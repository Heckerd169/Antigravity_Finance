"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  deleteCardCategoryAction,
  restoreCardCategoryAction,
} from "@/components/cards/actions";
import { useCardActionToast } from "@/components/cards/card-action-toast-provider";
import { RenameCategoryOverlay } from "./rename-category-overlay";
import type { CategoryGroup } from "./category-groups";
import { formatEuroSigned } from "@/lib/format";
import cardStyles from "@/components/cards/cards.module.css";
import styles from "./interaction-zone.module.css";

type CategoryTileProps = {
  group: CategoryGroup;
  isOpen: boolean;
  onToggle: () => void;
};

/** v2-17 (KAT-2): Die Kategorie-Kachel — Variante A aus der Gestaltungsrunde.
 *
 *  Sie behält das Kartenformat (136 px), hebt sich aber in drei Punkten ab:
 *  NEUTRALER Grundton statt roter oder türkiser Tönung, KEIN Status-Icon, und
 *  GESTAPELTE KANTEN darunter, die zeigen, dass mehr dahinter liegt. Die linke
 *  Kante ist rot, solange drinnen etwas offen ist, und türkis, wenn alles
 *  erledigt ist.
 *
 *  ⚠️ KEIN TAP-CATCHER (Befund U3). Über jeder tappbaren KARTE liegt ein
 *  unsichtbarer Vollflächen-Button, der „bezahlt" umschaltet; ein Fehlklick
 *  schreibt `manually_paid` und bewegt die Sparrate — ohne Toast, ohne
 *  Bestätigung. Genau deshalb ist die Kachel neutral getönt und ohne
 *  Status-Icon: Der Klick hier klappt auf und tut sonst nichts. Die
 *  Unterscheidung muss durch Ton, fehlendes Icon und Stapelkante wirklich
 *  tragen — das war der benannte Preis von Variante A.
 *
 *  Die Kachel ist ein echter `<button>`, das ⋯-Menü liegt als Geschwister
 *  daneben im Wrapper. Ein Knopf im Knopf wäre ungültiges HTML und für die
 *  Tastatur eine Sackgasse.
 *
 *  Zukunftsmonat (Record C3): blass, keine farbige Kante, weder `[N] offen`
 *  noch `erledigt`. Ohne diese Regel stünde dort türkis „erledigt", weil null
 *  Kinder offen sind — eine Falschaussage über einen Monat, in dem noch nichts
 *  fällig war.
 *
 *  Anschauung: `design-system/entwuerfe/kat-kategorien.html` §3. */
export function CategoryTile({ group, isOpen, onToggle }: CategoryTileProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null,
  );
  const [renameOpen, setRenameOpen] = useState(false);
  const iconRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const showToast = useCardActionToast();

  useEffect(() => {
    if (!menuOpen) return;
    function handleMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      const inIcon = iconRef.current?.contains(target) ?? false;
      const inMenu = menuRef.current?.contains(target) ?? false;
      if (!inIcon && !inMenu) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  function handleIconClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.left });
    }
    setMenuOpen(true);
  }

  /** Löschen: HART, mit fünf Sekunden Rücknahme im Toast.
   *
   *  Anders als beim Karten-Löschen gibt es keinen Papierkorb — er kann eine
   *  Kategorie nicht tragen (Befund D7). Die RPC gibt deshalb alles zurück, was
   *  zur Wiederherstellung nötig ist, und dieser Bausatz lebt genau so lange wie
   *  der Toast.
   *
   *  Bewusst ERST löschen, DANN den Toast zeigen — nicht das Löschen in `run`
   *  legen: Sonst könnte der Rückgängig-Knopf gedrückt werden, bevor die Antwort
   *  mit den Karten-IDs da ist, und die Rücknahme liefe ins Leere. */
  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpen(false);
    if (!group.categoryId) return;
    const payload = await deleteCardCategoryAction(group.categoryId);
    showToast({
      text: `Kategorie »${payload.name}« gelöscht · ${payload.card_ids.length === 1 ? "1 Karte ist" : `${payload.card_ids.length} Karten sind`} jetzt ohne Kategorie`,
      run: async () => {},
      undo: () => restoreCardCategoryAction(payload),
    });
  }

  const isCategory = group.kind === "CATEGORY";
  const hasOpen = group.offen !== null && group.offen > 0;
  const allDone = group.offen !== null && group.offen === 0;

  // Der Einkommens-Ordner bekommt keine Zustands-Kante: Das Nettogehalt ist
  // weder „offen" noch „erledigt", und eine Kante behauptete das eine oder das
  // andere. Im Zukunftsmonat gilt dasselbe für alle Ordner (C3).
  const wantsFlag = group.kind !== "INCOME" && !group.isGhost;

  const tileClass = [
    styles.catTile,
    isOpen ? styles.catTileOpen : "",
    group.isGhost ? styles.catTileGhost : "",
    wantsFlag && hasOpen ? styles.catTileHasOpen : "",
    wantsFlag && allDone ? styles.catTileAllDone : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.catWrap}>
      <button
        type="button"
        className={tileClass}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={`${group.name} — ${isOpen ? "zuklappen" : "aufklappen"}`}
      >
        <div className={styles.catTop}>
          <span className={styles.catKicker}>Kategorie</span>
          <span className={styles.catChev} aria-hidden="true">
            ›
          </span>
        </div>

        <div className={styles.catName}>{group.name}</div>

        {/* Der Betrag steht an DERSELBEN Stelle wie auf einer Karte — gleiche
            Größe, gleiche Zeile. Das hält die Reihe homogen (Variante A). */}
        <div
          className={`${styles.catAmount}${
            group.amount !== null && group.amount > 0 ? ` ${styles.catAmountPos}` : ""
          }`}
        >
          {group.amount !== null ? formatEuroSigned(group.amount) : "—"}
        </div>

        {/* Leerzeile an der Stelle, an der die Karte `von X €` trägt. Sie bleibt
            leer, aber sie bleibt DA — sonst wären Kachel und Karte
            verschieden hoch und die Reihe bekäme eine wandernde Unterkante. */}
        <div className={cardStyles.householdAmount} />

        <div className={cardStyles.stateRow}>
          <span className={styles.catCount}>
            {group.posten === 1 ? "1 Posten" : `${group.posten} Posten`}
          </span>
          {wantsFlag && (
            <span className={hasOpen ? styles.catOpenFlag : styles.catCount}>
              {hasOpen ? `${group.offen} offen` : "erledigt"}
            </span>
          )}
        </div>

        <div className={cardStyles.cardMeta}>
          <div className={`${cardStyles.metaDot} ${cardStyles.metaDotIch}`} />
          <div className={cardStyles.metaText}>Ordner</div>
        </div>
      </button>

      {/* Nur echte Ordner haben ein Menü. „Einkommen" und „Ohne Kategorie" sind
          Sammelbecken der Anzeige und keine Zeilen in der Datenbank — es gibt
          dort nichts umzubenennen und nichts zu löschen. */}
      {isCategory && (
        <button
          ref={iconRef}
          type="button"
          className={cardStyles.contextIcon}
          onClick={handleIconClick}
          aria-label={`Optionen für ${group.name}`}
          aria-expanded={menuOpen}
        >
          ···
        </button>
      )}

      {menuOpen &&
        menuPos &&
        createPortal(
          <div
            ref={menuRef}
            className={cardStyles.contextMenu}
            style={{ position: "fixed", top: menuPos.top, left: menuPos.left }}
            role="menu"
          >
            <button
              type="button"
              className={cardStyles.contextMenuItem}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                setRenameOpen(true);
              }}
              role="menuitem"
            >
              Kategorie umbenennen …
            </button>
            <button
              type="button"
              className={cardStyles.contextMenuItem}
              onClick={handleDelete}
              role="menuitem"
            >
              Kategorie löschen
            </button>
            {/* Bewusst KEIN Lösch-Tor wie bei Karten: Eine Kategorie hat keine
                verknüpften Fragmente und keine Monats-Zustände, und ihre Karten
                gehen beim Löschen nicht verloren — sie werden kategorielos
                (Record A7). Es gibt also keinen Grund, der das Löschen
                verbieten würde. */}
          </div>,
          document.body,
        )}

      {renameOpen && group.categoryId && (
        <RenameCategoryOverlay
          categoryId={group.categoryId}
          currentName={group.name}
          onClose={() => setRenameOpen(false)}
        />
      )}
    </div>
  );
}
