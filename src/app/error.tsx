"use client";

import { useEffect } from "react";
import styles from "./error.module.css";

/**
 * Fehlerseite des Dashboards (v2-24 Phase 5).
 *
 * ── Wozu sie da ist ─────────────────────────────────────────────────────────
 *
 * Vor diesem Sprint gab es **kein `error.tsx`**. Scheiterte der Server-Render —
 * etwa weil die Datenbank überlastet war —, sah der Nutzer die Fehlerseite von
 * Vercel: englisch, mit einem Fehlercode, ohne Weg zurück. Genau das zeigt der
 * Screenshot vom 16.08.2026.
 *
 * Diese Seite ist das Sicherheitsnetz unter den Phasen 1 bis 4: Die haben die
 * Ursache abgeräumt, aber „geht schief" bleibt möglich. Jetzt endet es in etwas,
 * aus dem man herausklicken kann.
 *
 * ⚠️ **Der Wortlaut ist neue UI-Copy und gehört nach Design-Doku §12.** Die Doku
 * kennt keine Fehlerseite. Bewusst gewählt:
 *   · **kein Fehlercode und keine Ursache im Text.** Der Grund ist selten der,
 *     den ein Text raten würde, und eine falsche Ursache ist schlimmer als keine.
 *     Die technische Meldung geht in die Server-Logs, nicht auf den Schirm.
 *   · **eine Handlung, nicht zwei.** `reset()` versucht denselben Render erneut —
 *     das ist bei einer Überlast genau das Richtige und braucht kein Neuladen.
 *   · **keine Zahl.** Sparraten-Werte kommen hier nicht vor; eine Fehlerseite,
 *     die Beträge zeigt, zeigt womöglich veraltete.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Der Digest ist die einzige Brücke zwischen dieser Ansicht und dem
    // Server-Log — ohne ihn ist ein gemeldeter Fehler nicht auffindbar.
    console.error("[dashboard] Render fehlgeschlagen", error.digest, error);
  }, [error]);

  return (
    <main className={styles.main}>
      <div className={styles.box}>
        <h1 className={styles.title}>Die Ansicht konnte nicht geladen werden</h1>
        <p className={styles.hint}>
          Deine Daten sind unberührt — es ist nur die Anzeige, die nicht
          zustande kam.
        </p>
        <button className={styles.button} type="button" onClick={reset}>
          Nochmal versuchen
        </button>
      </div>
    </main>
  );
}
