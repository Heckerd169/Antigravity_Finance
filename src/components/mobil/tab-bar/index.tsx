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
 *  **Seit v3-03 haben alle vier Tabs ihr Ziel** (`MB-6`). Bis dahin standen drei
 *  davon ohne Handler in der Leiste (Briefing v3-02, A7) — die Klasse
 *  `tabOhneZiel` und der `<span>`-Zweig unten sind seither ungenutzt, bleiben
 *  aber stehen: Ein Tab ohne Ziel ist ein Zustand, den diese Leiste wieder
 *  braucht, sobald ein fünfter Bereich vorbereitet wird.
 *
 *  Der Monat wandert als `?month=` in JEDEN Link. Ohne ihn spränge ein
 *  Tab-Wechsel zurück auf den laufenden Monat, und der Nutzer verlöre beim
 *  Blättern durch alte Monate seinen Platz. */
export function MobilTabBar({ aktiv, offen, monat }: Props) {
  const tabs: { id: MobilTab; label: string; icon: JSX.Element; href: string | null }[] = [
    { id: "uebersicht", label: "Übersicht", icon: <IconUebersicht />, href: `/mobil/uebersicht?month=${monat}` },
    { id: "zuordnen", label: "Zuordnen", icon: <IconZuordnen />, href: `/mobil/zuordnen?month=${monat}` },
    { id: "karten", label: "Karten", icon: <IconKarten />, href: `/mobil/karten?month=${monat}` },
    { id: "verlauf", label: "Verlauf", icon: <IconVerlauf />, href: `/mobil/verlauf?month=${monat}` },
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
