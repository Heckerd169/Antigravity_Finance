import Link from "next/link";
import { IconKarten, IconUebersicht, IconVerlauf, IconZuordnen } from "./icons";
import styles from "./tab-bar.module.css";

export type MobilTab = "uebersicht" | "zuordnen" | "karten" | "verlauf";

type Props = {
  aktiv: MobilTab;
  /** Offene Buchungen des angezeigten Monats — das Badge auf „Zuordnen";
   *  bei 0 verschwindet es. */
  offen: number;
  /** „YYYY-MM" — wandert als `?month=` in die Tab-Links, damit ein
   *  Tab-Wechsel den Monat behält. */
  monat: string;
};

/** Die Tab-Leiste von `/mobil` (Handoff-README „Rahmen": 49 px Tabs plus
 *  Home-Indikator-Bereich, `--bg-primary`, `border-top --border-subtle`).
 *
 *  Bis v3-03 gibt es nur den Tab „Zuordnen". Die drei anderen stehen sichtbar
 *  in der Leiste, in `--text-tertiary` und ohne Ziel — dasselbe Muster wie die
 *  Monatsnavigation ohne Nachbar („Opacity .3, kein Handler"), Briefing A7. */
export function MobilTabBar({ aktiv, offen, monat }: Props) {
  const tabs: { id: MobilTab; label: string; icon: JSX.Element; href: string | null }[] = [
    { id: "uebersicht", label: "Übersicht", icon: <IconUebersicht />, href: null },
    { id: "zuordnen", label: "Zuordnen", icon: <IconZuordnen />, href: `/mobil/zuordnen?month=${monat}` },
    { id: "karten", label: "Karten", icon: <IconKarten />, href: null },
    { id: "verlauf", label: "Verlauf", icon: <IconVerlauf />, href: null },
  ];

  return (
    <nav className={styles.leiste} aria-label="Bereiche">
      <div className={styles.tabs}>
        {tabs.map((t) => {
          const istAktiv = t.id === aktiv;
          const klasse = `${styles.tab} ${istAktiv ? styles.tabAktiv : ""} ${
            t.href === null ? styles.tabOhneZiel : ""
          }`;
          const inhalt = (
            <>
              <span className={styles.icon}>
                {t.icon}
                {t.id === "zuordnen" && offen > 0 && (
                  <span className={styles.badge} aria-label={`${offen} offen`}>
                    {offen}
                  </span>
                )}
              </span>
              <span className={styles.label}>{t.label}</span>
            </>
          );
          return t.href === null ? (
            <span key={t.id} className={klasse} aria-disabled="true">
              {inhalt}
            </span>
          ) : (
            <Link
              key={t.id}
              href={t.href}
              className={klasse}
              aria-current={istAktiv ? "page" : undefined}
            >
              {inhalt}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
