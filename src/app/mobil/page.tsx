import { redirect } from "next/navigation";

/* Bis v3-03 (Übersicht · Karten · Verlauf) ist „Zuordnen" der einzige Tab —
 * `/mobil` führt deshalb dorthin. Mit der Übersicht wird diese Seite zum
 * Tab 1 (Handoff §4). */
export default function MobilStart() {
  redirect("/mobil/zuordnen");
}
