/* Die EINE Stelle, an der eine Zahlung auf eine Karte gelegt oder von ihr
 * gelöst wird — für den Schreibtisch (Drag & Drop, `interaction-zone/actions.ts`)
 * und für /mobil (Tipp, `app/mobil/zuordnen/actions.ts`).
 *
 * Warum eine gemeinsame Datei (v3-02): Eine Zuordnung vom Handy muss in der
 * Datenbank von einer Zuordnung am Schreibtisch UNUNTERSCHEIDBAR sein —
 * `origin = MANUAL_DROP`, `month` = der angezeigte Monat. Nur dann lernt
 * `history_match` daraus (es liest ausschließlich MANUAL_DROP), und nur dann
 * zählt der Link in der Sparrate des Monats, den der Nutzer gerade ansieht
 * (§6 Stolperfalle 6). Zwei Formulierungen derselben Schreibregel liefen
 * auseinander, sobald jemand eine davon anfasst (LL-26, Form „Nachbauen").
 *
 * Keine Server-Action-Direktive hier: Die Aufrufer sind die Actions, sie
 * prüfen die Anmeldung und rufen `revalidatePath` für IHRE Route. */

import type { AppSupabaseClient } from "@/lib/rpc";

/** UPSERT auf `card_fragment_links`: `ON CONFLICT (fragment_id)` legt die
 *  Zahlung auf die neue Karte um, statt eine zweite Zeile anzulegen. Der
 *  Trigger `trg_oqb_no_transfer_links` weist Überträge ab (§6 Stolperfalle 7);
 *  RLS erzwingt `user_id = auth.uid()`. Throw-on-Error (LL-2). */
export async function upsertManualCardLink(
  client: AppSupabaseClient,
  args: {
    userId: string;
    fragmentId: string;
    cardId: string;
    /** "YYYY-MM-01" — der ANGEZEIGTE Monat, nicht das Buchungsdatum. */
    month: string;
  },
): Promise<void> {
  const { error } = await client.from("card_fragment_links").upsert(
    {
      user_id: args.userId,
      fragment_id: args.fragmentId,
      card_id: args.cardId,
      month: args.month,
      origin: "MANUAL_DROP",
    },
    { onConflict: "fragment_id" },
  );
  if (error) throw error;
}

/** Löst die Zuordnung — die Zahlung wird wieder `UNASSIGNED`, die View leitet
 *  den Status aus dem fehlenden Link ab. Throw-on-Error (LL-2). */
export async function deleteCardLink(
  client: AppSupabaseClient,
  args: { fragmentId: string },
): Promise<void> {
  const { error } = await client
    .from("card_fragment_links")
    .delete()
    .eq("fragment_id", args.fragmentId);
  if (error) throw error;
}
