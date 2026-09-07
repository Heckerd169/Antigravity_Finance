"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { calculateSparrateForMonth } from "@/lib/rpc";
import { deleteCardLink, upsertManualCardLink } from "@/lib/card-links";

/* Server Actions des Tabs „Zuordnen" auf /mobil (v3-02 P3).
 *
 * Beide schreiben über `lib/card-links.ts` — dieselbe Funktion wie der
 * Schreibtisch, damit eine Zuordnung vom Handy in der Datenbank von einer
 * per Drag & Drop ununterscheidbar ist (`origin = MANUAL_DROP`, Monat = der
 * angezeigte). Sonst lernte `history_match` nichts daraus.
 *
 * DIE KONSEQUENZ WIRD GEHOLT, NICHT GERECHNET (§7 Regel 1): Der Toast zeigt
 * „Sparrate September −106,13 €" aus `calculate_sparrate_for_month` VORHER
 * und NACHHER — beide Werte einmal am Ende gerundet (LL-25), die Differenz ist
 * damit auf den Cent exakt. Der Prototyp rechnete „−max(0, |Betrag| −
 * Restbudget)"; das war ausdrücklich Modell, nicht Vorlage (Handoff-README).
 *
 * Drei Netzrunden je Zuordnung (Sparrate, Upsert, Sparrate) — bewusst nicht
 * eine: Der Vorher-Wert aus dem Seitenaufbau könnte inzwischen veraltet sein
 * (Schreibtisch parallel offen), und eine falsche Δ-Zeile wäre teurer als eine
 * Netzrunde. Revalidiert wird /mobil/zuordnen UND das Dashboard — beide zeigen
 * denselben Monat, beide müssen den Link sehen. */

export type ZuordnenErgebnis = {
  /** Sparrate des Monats vor dem Link; `null` = kein Wert (LL-20). */
  vorher: number | null;
  /** Sparrate des Monats nach dem Link. */
  nachher: number | null;
};

export async function zuordnenAction(input: {
  fragmentId: string;
  cardId: string;
  /** "YYYY-MM-01" — der angezeigte Monat. */
  month: string;
}): Promise<ZuordnenErgebnis> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht authentifiziert");

  const vorher = await calculateSparrateForMonth(supabase, {
    userId: user.id,
    month: input.month,
  });

  await upsertManualCardLink(supabase, {
    userId: user.id,
    fragmentId: input.fragmentId,
    cardId: input.cardId,
    month: input.month,
  });

  const nachher = await calculateSparrateForMonth(supabase, {
    userId: user.id,
    month: input.month,
  });

  revalidatePath("/mobil/zuordnen", "page");
  revalidatePath("/", "page");

  return { vorher, nachher };
}

/** „Rückgängig" im Toast (5 s): löst den Link wieder. Die Sparrate kehrt damit
 *  exakt auf den Vorher-Wert zurück — geprüft im Browser-Smoke S6, nicht
 *  angenommen. */
export async function rueckgaengigAction(input: {
  fragmentId: string;
  month: string;
}): Promise<{ nachher: number | null }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht authentifiziert");

  await deleteCardLink(supabase, { fragmentId: input.fragmentId });

  const nachher = await calculateSparrateForMonth(supabase, {
    userId: user.id,
    month: input.month,
  });

  revalidatePath("/mobil/zuordnen", "page");
  revalidatePath("/", "page");

  return { nachher };
}
