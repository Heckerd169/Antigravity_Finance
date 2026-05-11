import { login } from "./actions";
import styles from "./login.module.css";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const hasError = searchParams.error === "1";

  return (
    <main className={styles.main}>
      <form className={styles.form} action={login}>
        <h1 className={styles.title}>Anmeldung</h1>

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
