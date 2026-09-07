/* Zerlegung eines Buchungstextes in Empfänger und Zweck — für `/mobil`, wo
 * beide getrennt stehen (Fokus-Karte: Empfänger 17 px, Zweck 13 px darunter).
 *
 * Die Bankformate, gemessen am 07.09.2026 über die 687 Zahlungen aus 2026:
 *
 *   DKB Giro   „Empfänger | Zweck"                 444 mit einem Trenner
 *   DKB Visa   „SP SCICON SPORTS"                  243 ohne Trenner
 *   Cortal     „Sender | Buchungstext | Zweck"      52 mit zwei Trennern
 *
 * Empfänger ist der Teil VOR dem ersten „|" (oder der ganze Text); Zweck ist
 * alles danach — leere Teile fallen weg, mehrere werden mit „ · " verbunden.
 * Nichts wird gekürzt: Die Fokus-Karte zeigt beide Teile ungekürzt
 * (`overflow-wrap: anywhere`), gekürzt wird nur in Stapel-Vorschau und Listen,
 * und das macht dort das CSS.
 *
 * Der Schreibtisch zeigt in `fragment-card.tsx` (`displayDescription`) eine
 * EINZEILIGE Kurzform — den LETZTEN Teil. Das beantwortet eine andere Frage
 * („was passt in eine Zeile") und ist seit v2-29 als `ZO-7` offen, weil dort
 * bei Kartenumsätzen das Datum statt des Händlers erscheint. Diese Funktion
 * ersetzt jene nicht; sie liefert beide Teile, damit `/mobil` den Händler
 * zeigt, auf dem der Vorschlag beruht.
 *
 * Keine Importe — damit lässt sich die Datei im Wächter transpilieren
 * (Muster `lib/suggestion.ts`). */

export type BeschreibungTeile = {
  /** Der Teil vor dem ersten „|" — bei Kartenumsätzen der Händler. */
  empfaenger: string;
  /** Alles nach dem ersten „|", oder `null`, wenn es nichts gibt. */
  zweck: string | null;
};

export function splitDescription(raw: string): BeschreibungTeile {
  const parts = raw.split("|").map((p) => p.trim());
  const empfaenger = parts[0] !== "" ? parts[0] : raw.trim();
  const rest = parts.slice(1).filter((p) => p !== "");
  return { empfaenger, zweck: rest.length > 0 ? rest.join(" · ") : null };
}
