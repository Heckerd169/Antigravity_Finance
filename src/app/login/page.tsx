import { login } from "./actions";
import { safeNextPath } from "@/lib/next-path";
import styles from "./login.module.css";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; next?: string | string[] };
}) {
  const hasError = searchParams.error === "1";
  // Nachzug 07.09.2026 (v3-02): das Ziel nach dem Anmelden, geprüft — nur ein
  // interner Pfad kommt ins Formular, alles andere fällt still weg.
  const next = safeNextPath(
    typeof searchParams.next === "string" ? searchParams.next : null,
  );

  return (
    <main className={styles.main}>
      <form className={styles.form} action={login}>
        <h1 className={styles.title}>Anmeldung</h1>
        {next !== null && <input type="hidden" name="next" value={next} />}

        <label className={styles.label} htmlFor="email">
          E-Mail
        </label>
        <input
          className={styles.input}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />

        <label className={styles.label} htmlFor="password">
          Passwort
        </label>
        <input
          className={styles.input}
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />

        {hasError && (
          <p className={styles.error} role="alert">
            Anmeldung fehlgeschlagen. Bitte E-Mail und Passwort prüfen.
          </p>
        )}

        <button className={styles.button} type="submit">
          Anmelden
        </button>
      </form>
    </main>
  );
}
