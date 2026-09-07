import type { Metadata, Viewport } from "next";
import styles from "./mobil.module.css";

/* `/mobil` — eigene Route, 430 px, kein Responsive-Umbau der Schreibtisch-
 * Ansicht (Design-Record 07.09.2026, Roadmap Paket 20).
 *
 * `viewportFit: "cover"` und die Apple-Web-App-Angaben machen aus „Zum
 * Home-Bildschirm" die App-Ansicht des Prototyps: Statusleiste über der Seite,
 * Safe Areas über `env()` im CSS. Im normalen Safari-Tab ändert das nichts. */

export const metadata: Metadata = {
  title: "Antigravity Finance · mobil",
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
