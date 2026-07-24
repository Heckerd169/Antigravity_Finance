import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { fetchWithRetry } from "./fetch-retry";
import type { Database } from "./types";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // ECONNRESET-Robustheit: Einmal-Retry für netzwerk-tote LESE-Requests
      // (Details + Idempotenz-Grenzen in fetch-retry.ts).
      global: { fetch: fetchWithRetry },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — Server Components cannot set
            // cookies. Middleware refreshes sessions, so this is safe to ignore.
          }
        },
      },
    },
  );
}
