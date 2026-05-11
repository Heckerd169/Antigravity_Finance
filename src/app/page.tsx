import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions/auth";
import styles from "./page.module.css";

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className={styles.main}>
      <p className={styles.email}>{user?.email}</p>
      <form action={logout}>
        <button className={styles.logout} type="submit">
          Abmelden
        </button>
      </form>
    </main>
  );
}
