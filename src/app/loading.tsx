import styles from "./loading.module.css";

/**
 * Ladezustand des Dashboards (v2-24 Phase 5).
 *
 * ── Was er tut ──────────────────────────────────────────────────────────────
 *
 * Vor diesem Sprint gab es im ganzen Projekt **kein `loading.tsx` und keine
 * einzige Suspense-Grenze** (geprüft: `find src/app -name "loading*"` und
 * `grep -rn "Suspense" src/` — beide null Treffer). Der Seitenaufbau war damit
 * alles-oder-nichts: Bis die letzte Datenbank-Antwort da war, wurde kein
 * einziges Pixel ausgeliefert.
 *
 * Am sichtbarsten ist der Unterschied beim **Monatswechsel**. Der läuft als
 * Soft-Navigation über einen URL-Parameter (`?month=…`); Next.js zeigt jetzt
 * sofort diese Fläche, statt die alte Ansicht einzufrieren, bis der Server
 * fertig ist.
 *
 * ── Warum hier ABSICHTLICH nichts zu sehen ist ──────────────────────────────
 *
 * Eine Skelett-Darstellung — angedeutete Karten, pulsierende Balken, ein
 * Platzhalter-Ring — wäre eine **Gestaltungsentscheidung**, und die Design-Doku
 * trifft sie nicht (§7 Regel 3: einen nicht definierten Zustand melden statt
 * raten). Deshalb steht hier nur die Fläche in der Hintergrundfarbe der App und
 * in der Höhe des Single-Surface-Layouts. Kein erfundenes Bild, aber auch kein
 * weißes Aufblitzen.
 *
 * Sollte sich das nach dem Umbau noch spürbar anfühlen, ist ein Skelett eine
 * eigene Runde mit `design-direktor` — keine Sache, die beim Bauen nebenbei
 * entschieden wird.
 */
export default function Loading() {
  return <main className={styles.main} aria-busy="true" />;
}
