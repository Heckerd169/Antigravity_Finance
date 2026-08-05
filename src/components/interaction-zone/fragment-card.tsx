import { isTransferFragment, type FragmentRow } from "./interaction-zone.types";
import { formatAmount } from "@/lib/format";
import { badgeHueIndex } from "./badge-hue";
import { AssetReallocationToggle } from "./asset-reallocation-toggle";
import styles from "./interaction-zone.module.css";

/* v2-07 A1: Reihenfolge entspricht --badge-hue-1..6 in tokens.css. CSS-Module
   erzeugen gehashte Klassennamen, deshalb die Auflösung über eine Tabelle
   statt über einen zusammengesetzten String. Länge = BADGE_HUE_COUNT. */
const BADGE_HUE_CLASSES = [
  styles.fragmentBadgeHue1,
  styles.fragmentBadgeHue2,
  styles.fragmentBadgeHue3,
  styles.fragmentBadgeHue4,
  styles.fragmentBadgeHue5,
  styles.fragmentBadgeHue6,
];

/* v2-10 P2 (BF-1): Die KI-Vorschlags-Kaestchen sind aus der ANZEIGE genommen.
   Berechnet wird der Vorschlag unveraendert weiter — `suggestedCardName` kommt
   nach wie vor am Fragment an, es wird nur nicht mehr gezeichnet. Diese eine
   Konstante auf `true` zu setzen schaltet sie vollstaendig wieder ein; genau
   deshalb bleiben BADGE_HUE_CLASSES und `badgeHueIndex` in Gebrauch statt
   geloescht zu werden (User-Entscheid 04.08.2026, Punkte 1/2/4 in
   V2/befunde_2026-08-04_fehler_und_entscheidungen.md §2).

   Anlass war der Zeilenumbruch des Euro-Zeichens: Kaestchen und Betrag teilten
   sich eine Zeile, das Kaestchen durfte weder schrumpfen noch umbrechen
   (flex-shrink: 0, white-space: nowrap), also wurde der Betrag zusammen-
   gedrueckt. Die automatische Zuordnung ab 95 % Konfidenz ist davon NICHT
   beruehrt — sie ist keine Empfehlung, sondern eine fertige Zuordnung. */
const SHOW_SUGGESTION_BADGES: boolean = false;

/* Server-Component: ein Fragment-Item ohne Event-Handler. Drag-Start wird
   per Event-Delegation in der FragmentStack-Client-Component gefangen
   (Lookup über `data-fragment-id`-Attribut). */

const DATE_FMT = new Intl.DateTimeFormat("de-DE", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

type FragmentCardProps = {
  fragment: FragmentRow;
  isLocked: boolean;
};

export function FragmentCard({ fragment, isLocked }: FragmentCardProps) {
  const isPos = fragment.amount >= 0;
  const sign = isPos ? "+" : "−";
  const abs = Math.abs(fragment.amount);

  // Sprint 9: Transfer-Status schlägt alle anderen Stati (§6.1). Eigenes
  // Dimming (0.45) + TRANSFER-Badge, kein Drag/Tap. Höchste Status-Priorität,
  // daher VOR dem isLocked-Styling und vor dem KI-Vorschlag-Badge geprüft.
  // v2-04 ③: ASSET_REALLOCATION verhält sich UI-seitig identisch zu
  // INTERNAL_TRANSFER (Schema-Doku v3.2 — Interim bis DD-Geste).
  // v2-07 C1: dasselbe Prädikat filtert den Stack — eine Quelle, damit
  // Filter und Darstellung nicht auseinanderlaufen können.
  const isTransfer = isTransferFragment(fragment);
  const stateClass = isTransfer
    ? styles.fragmentCardTransfer
    : isLocked
      ? styles.fragmentCardLocked
      : "";

  return (
    <div
      className={`${styles.fragmentCard} ${stateClass}`}
      draggable={!isLocked && !isTransfer}
      data-fragment-id={fragment.id}
      aria-label={
        isTransfer
          ? `${fragment.description} (Transfer zwischen eigenen Konten)`
          : isLocked
            ? `${fragment.description} (zugeordnet)`
            : `${fragment.description}, ${sign}${formatAmount(abs)} Euro`
      }
    >
      <div className={styles.fragmentTop}>
        <div
          className={`${styles.fragmentAmount} ${
            isPos ? styles.fragmentAmountPos : styles.fragmentAmountNeg
          }`}
        >
          {sign}
          {formatAmount(abs)} €
        </div>
        {isTransfer ? (
          <div className={`${styles.fragmentBadge} ${styles.fragmentBadgeTransfer}`}>
            Transfer
          </div>
        ) : (
          SHOW_SUGGESTION_BADGES && fragment.suggestedCardName && (
            /* v2-07 A1: Farbton deterministisch aus dem Kartennamen — gleiche
               Karte, gleiche Farbe. Fallback auf Hue-1 (den Gold-Ton aus
               Sprint 8), falls die Klassen-Tabelle je aus dem Tritt gerät. */
            <div
              className={`${styles.fragmentBadge} ${
                BADGE_HUE_CLASSES[badgeHueIndex(fragment.suggestedCardName)] ??
                BADGE_HUE_CLASSES[0]
              }`}
            >
              KI-Vorschlag: {fragment.suggestedCardName}
            </div>
          )
        )}
      </div>
      <div className={styles.fragmentDesc} title={fragment.description}>
        {fragment.description}
      </div>
      <div className={styles.fragmentDate}>{formatDateShort(fragment.transaction_date)}</div>
      {/* v2-04 ② Interim: Markier-Auslösung. Setzen aus UNASSIGNED (Broker-
          Eingang, F3) oder INTERNAL_TRANSFER (Scalable-Fall, E2); Rücknahme
          aus ASSET_REALLOCATION. Verlinkte Fragmente (ASSIGNED/AUTO_ABSORBED)
          bekommen keinen Trigger — die RPC würde per OQ-B mit 23514 verweigern
          (Zuordnung zuerst lösen). Finale Geste = DD (Briefing §7). */}
      {fragment.status === "UNASSIGNED" ||
      fragment.status === "INTERNAL_TRANSFER" ? (
        <AssetReallocationToggle fragmentId={fragment.id} set />
      ) : fragment.status === "ASSET_REALLOCATION" ? (
        <AssetReallocationToggle fragmentId={fragment.id} set={false} />
      ) : null}
    </div>
  );
}

function formatDateShort(iso: string): string {
  // "2026-05-15" → "15. Mai 2026"
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return DATE_FMT.format(date);
}
