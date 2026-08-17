import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "./onboarding-form";
import styles from "./onboarding.module.css";

/**
 * v2-24 Phase 1: Der Wächter ist aus der Middleware hierher gewandert.
 *
 * Vorher hielt die Middleware einen bereits eingerichteten Nutzer von dieser Seite
 * fern — und bezahlte das mit einer `profiles`-Abfrage auf **jeder** Anfrage der
 * ganzen App. Diese Seite wird einmal im Leben aufgerufen; die zwei Abfragen hier
 * sind damit ein Tausch von „einmal" gegen „immer". Begründung in
 * `src/lib/supabase/middleware.ts`.
 *
 * Nebenwirkung, die ausdrücklich erwünscht ist: Durch `cookies()` (via
 * `createClient`) ist diese Seite jetzt dynamisch und wird beim Bauen nicht mehr
 * vorgerendert. Damit entfällt die in CLAUDE.md §4 vermerkte Stolperfalle, dass
 * `pnpm build` ohne `.env.local` genau hier abbricht.
 */
export default async function OnboardingPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Die Middleware prüft das ebenfalls, hat seit v2-24 aber einen Ausweichpfad.
  // Defense-in-Depth: Diese Seite verlässt sich nicht darauf.
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded_at")
    .eq("user_id", user.id)
    .maybeSingle();

  // `maybeSingle()` statt `single()`: Ein fehlender profiles-Eintrag (Alt-Nutzer
  // aus der Zeit vor dem on_auth_user_created-Trigger) ist kein Fehler, sondern
  // bedeutet „noch nicht eingerichtet" — dieselbe Lesart wie vorher.
  if (profile?.onboarded_at) redirect("/");

  return (
    <main className={styles.main}>
      <OnboardingForm />
    </main>
  );
}
