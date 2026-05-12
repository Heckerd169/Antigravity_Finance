"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login?error=1");
  }

  // Profile auto-create: idempotenter Upsert.
  // Begruendung: der DB-Trigger on_auth_user_created legt fuer NEUE Auth-User
  // automatisch eine profiles-Zeile an, aber Alt-User aus der Zeit vor dem
  // Trigger haben noch keinen Eintrag. Dieser Upsert ist Belt-and-Suspenders
  // und garantiert, dass nach jedem Login eine profiles-Zeile existiert.
  // PM-Entscheidung Sprint 1 (siehe sprints/sprint_01_briefing.md §3.2).
  if (data.user) {
    await supabase
      .from("profiles")
      .upsert({ user_id: data.user.id }, { onConflict: "user_id", ignoreDuplicates: true });
  }

  redirect("/");
}
