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
  // v2-10 P3 (RM-1): nur die Anzeige wird gekuerzt, siehe displayDescription().
  const descShort = displayDescription(fragment.description);

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
        /* v2-10 P3 (RM-1): dieselbe gekuerzte Fassung wie im sichtbaren Text —
           Vorlesen und Sehen sollen dasselbe ergeben. Der vollstaendige Text
           bleibt im title-Attribut der Beschreibung erreichbar. */
        isTransfer
          ? `${descShort} (Transfer zwischen eigenen Konten)`
          : isLocked
            ? `${descShort} (zugeordnet)`
            : /* v2-29: der Vorschlag gehoert mit vorgelesen — dieselbe Regel wie
                 bei der Beschreibung (RM-1): Vorlesen und Sehen sollen dasselbe
                 ergeben. Er steht am Ende, weil Betrag und Beschreibung die
                 Auskunft sind und der Vorschlag die Vermutung. */
              `${descShort}, ${sign}${formatAmount(abs)} Euro${
                fragment.suggestedCardName
                  ? `, KI-Vorschlag: ${fragment.suggestedCardName}`
                  : ""
              }`
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
      {/* title traegt bewusst weiterhin den VOLLSTAENDIGEN Text (RM-1). */}
      <div className={styles.fragmentDesc} title={fragment.description}>
        {descShort}
      </div>
      {/* v2-29: Der Kartenvorschlag als eigene, leise Zeile — Entscheidungen 1–4
          in V2/design_direktor_2026-08-24_haendler_gedaechtnis.md.

          WARUM HIER UND NICHT NEBEN DEM BETRAG: Gemessen mit dem echten
          Schriftstack bei 194 px Inhaltsbreite passt selbst der KUERZESTE Fall
          nicht — „KI-VORSCHLAG: TANKEN" braucht 121,9 px, neben −129,00 € sind
          119 px frei. Der laengste echte Kartenname hat 105 Zeichen. Gekuerzt
          wird also in jedem Fall; neben dem Betrag kostet das den BETRAG (so ist
          `BF-1` in v2-10 entstanden), auf eigener Zeile nur Text.

          EINE BEDINGUNG, NICHT ZWEI: Ob ueberhaupt ein Vorschlag gilt, entscheidet
          ausschliesslich `istVorschlagSichtbar` in `@/lib/suggestion` — ausgewertet
          server-seitig in `page.tsx` (LL-17). Kommt hier ein Name an, wird er
          gezeigt; kommt null, nicht. Eine zweite Pruefung an dieser Stelle waere
          genau die Fehlerklasse aus LL-26, die dieses Projekt viermal in fuenf
          Tagen getroffen hat. Deshalb steht hier NUR die Null-Pruefung.

          Transfers sind damit automatisch mit abgedeckt: Ihr Status ist nie
          `UNASSIGNED`, also liefert die Regel null (AD5 — Transfer ist Fakt, kein
          Vorschlag). */}
      {fragment.suggestedCardName && (
        <div
          className={styles.fragmentSuggestion}
          /* wie bei der Beschreibung: gekuerzt wird nur die ANZEIGE (RM-1) */
          title={`KI-Vorschlag: ${fragment.suggestedCardName}`}
        >
          KI-Vorschlag: {fragment.suggestedCardName}
        </div>
      )}
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

/** v2-10 P3 (RM-1): Beschreibung auf den Verwendungszweck kuerzen — AUSSCHLIESSLICH
 *  fuer die Anzeige.
 *
 *  Regel: immer den letzten durch `|` getrennten Teil zeigen; ist er leer, auf den
 *  ersten Teil zurueckfallen. Damit sind alle drei Importformate abgedeckt, ohne
 *  ihre Herkunft kennen zu muessen (am 05.08.2026 gegen den Bestand geprueft):
 *
 *    DKB Visa  „SP SCICON SPORTS"                    1 Teil   → unveraendert   469
 *    DKB Giro  „Empfaenger | Zweck"                  2 Teile  → Zweck          973
 *    Cortal    „Sender | Buchungstext | Zweck"       3 Teile  → Zweck          106
 *
 *  Genau ein Fragment im Bestand hat einen leeren Zweck („Burschen- und
 *  Maedchenschaft … | ") — dort greift der Rueckfall auf den ersten Teil.
 *
 *  WICHTIG: Der gespeicherte Text bleibt unangetastet. Er ist Bestandteil des
 *  Duplikat-Hashes, des Trigram-Index der Zuordnung und des Sortier-Tiebreakers
 *  (`page.tsx`, `localeCompare`). Hier wird nichts umgeschrieben, nur weniger
 *  angezeigt; das `title`-Attribut behaelt den vollstaendigen Text. Das Abschneiden
 *  mit „…" macht unveraendert das CSS (`.fragmentDesc`, `text-overflow: ellipsis`). */
function displayDescription(raw: string): string {
  const parts = raw.split("|");
  const last = parts[parts.length - 1].trim();
  return last !== "" ? last : parts[0].trim();
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
