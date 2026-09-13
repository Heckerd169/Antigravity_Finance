import type { Metadata, Viewport } from "next";
import styles from "./mobil.module.css";

/* `/mobil` — eigene Route, 430 px, kein Responsive-Umbau der Schreibtisch-
 * Ansicht (Design-Record 07.09.2026, Roadmap Paket 20).
 *
 * `viewportFit: "cover"` und die Apple-Web-App-Angaben machen aus „Zum
 * Home-Bildschirm" die App-Ansicht des Prototyps: Statusleiste über der Seite,
 * Safe Areas über `env()` im CSS. Im normalen Safari-Tab ändert das nichts.
 *
 * ── Warum hier ein Manifest hängt (v3-04, `MB-7`) ───────────────────────────
 *
 * Die Zeilen oben sagen, DASS die App im Vollbild laufen will. Bis zum
 * 13.09.2026 sagte nichts, WELCHE Adressen dazugehören — und ohne diese Aussage
 * entscheidet iOS selbst, anhand der Startadresse. Ein Tipp auf „Zuordnen"
 * führte damit aus der App heraus in einen eingebetteten Browser, **obwohl gar
 * keine Seite neu geladen wird**: Die Zugehörigkeit wird auch bei reiner
 * Client-Navigation geprüft. Gemessen und ausgeschlossen wurde vorher ein
 * harter Seitenwechsel (0 Ladevorgänge auf allen vier Tabs) und ein fehlendes
 * Meta-Tag (alle vier Seiten identisch). Befund:
 * `V2/befunde_2026-09-13_mobil-vollbild.md`.
 *
 * **Der Verweis steht hier und nicht im Wurzel-Layout.** Damit trägt ihn nur
 * `/mobil/*`; die Schreibtisch-Ansicht bleibt unberührt — sie ist kein
 * Handy-Programm und soll auch keines behaupten.
 *
 * ⚠️ **`scope` in der Manifest-Datei hat bewusst KEINEN Schrägstrich am Ende.**
 * Der Vergleich ist ein reiner Zeichen-Präfix: `"/mobil"` deckt `/mobil` **und**
 * `/mobil/zuordnen` ab, `"/mobil/"` deckt `/mobil` **nicht** ab — und `/mobil`
 * ist die `start_url`. Ein Schrägstrich mehr legt den Einstieg der App also nach
 * draußen. `tests/e2e/mobil-vollbild.spec.ts` prüft genau das. */

export const metadata: Metadata = {
  title: "Antigravity Finance · mobil",
  manifest: "/mobil.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Antigravity",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function MobilLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.frame}>{children}</div>;
}
