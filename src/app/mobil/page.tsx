import { redirect } from "next/navigation";

/* `/mobil` ist die Übersicht (Handoff §4, Tab 1).
 *
 * Bis v3-02 führte diese Seite auf „Zuordnen", weil es der einzige Tab war.
 * Seit v3-03 gibt es alle vier; der Einstieg ist der Ring vor der Welle, und
 * von dort führt die Einstiegskarte in den Stapel.
 *
 * Die Umleitung reicht ein `?month=` NICHT durch: Wer `/mobil` ohne Monat
 * aufruft, meint den laufenden — und genau darauf fällt `parseMonthParam` in
 * der Zielseite zurück. */
export default function MobilStart() {
  redirect("/mobil/uebersicht");
}
