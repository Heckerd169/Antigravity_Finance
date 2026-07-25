import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/supabase/types";

export type AppSupabaseClient = SupabaseClient<Database>;

export async function estimateNetMonthly(
  client: AppSupabaseClient,
  args: { grossAnnual: number; taxClass: number; taxYear: number },
): Promise<number | null> {
  const { data, error } = await client.rpc("estimate_net_monthly", {
    p_gross_annual: args.grossAnnual,
    p_tax_class: args.taxClass,
    p_tax_year: args.taxYear,
  });

  // LL-2-Fix (Sprint 4): Throw-on-Error als Konvention für alle Wrapper.
  // Aufrufer (onboarding-form.tsx) fängt den Fehler und zeigt keinen Schätzwert.
  if (error) throw error;

  return data;
}

export async function calculateSparrateForMonth(
  client: AppSupabaseClient,
  args: { userId: string; month: string },
): Promise<number | null> {
  const { data, error } = await client.rpc("calculate_sparrate_for_month", {
    p_user_id: args.userId,
    p_month: args.month,
  });

  if (error) {
    throw error;
  }

  return data;
}

/** B2 (v2-06): Abweichungs-Treiber je Monat eines Kalenderjahres — EIN Call für
 *  Welle-Tooltip (Top-1) und Popup (Top-3). Signatur ohne p_user_id: die RPC ist
 *  auth.uid()-basiert (Hot-Path-Konvention). Rohes jsonb; das Parsen macht
 *  `components/welle/drivers.ts`. Throws bei DB-Errors (LL-2) — der Welle-Loader
 *  fängt sie ab, damit ein Treiber-Fehler die Kurve nicht mitreißt. */
export async function getYearDeviationDrivers(
  client: AppSupabaseClient,
  args: { year: number; limit?: number },
): Promise<Json> {
  const { data, error } = await client.rpc("get_year_deviation_drivers", {
    p_year: args.year,
    p_limit: args.limit ?? 3,
  });

  if (error) throw error;

  return data ?? null;
}

export async function calculatePlannedSparrateForMonth(
  client: AppSupabaseClient,
  args: { userId: string; month: string },
): Promise<number | null> {
  const { data, error } = await client.rpc("calculate_planned_sparrate_for_month", {
    p_user_id: args.userId,
    p_month: args.month,
  });

  if (error) {
    throw error;
  }

  return data;
}

/** Anzeige-Betrag einer Karte für einen bestimmten Monat (Prioritätskette Realität → Anpassung → Plan).
 *  Returns 0 falls Karte im Monat inaktiv oder kein Plan. Throws bei DB-Errors. */
export async function calculateCardAmountForMonth(
  client: AppSupabaseClient,
  args: { cardId: string; month: string },
): Promise<number> {
  const { data, error } = await client.rpc("calculate_card_amount_for_month", {
    p_card_id: args.cardId,
    p_month: args.month,
  });
  if (error) throw error;
  return data ?? 0;
}

/** Aktivitäts-Filter — soll die Karte im Monat gerendert werden?
 *  Defensive Variante: bei fehlender Session / DB-Error → false (kein Crash, kein UI-Artefakt).
 *  Schluckt Errors bewusst, weil "kein Datum" und "Fehler" für den Aufrufer äquivalent sind. */
export async function isCardActiveInMonth(
  client: AppSupabaseClient,
  args: { cardId: string; month: string },
): Promise<boolean> {
  const { data, error } = await client.rpc("is_card_active_in_month", {
    p_card_id: args.cardId,
    p_month: args.month,
  });
  if (error) return false;
  return data ?? false;
}

/** Roh-Plan aus card_planned_timeline (Forward-Inheritance, ohne Adjustment).
 *  Returns null falls kein Plan-Eintrag für diesen Monat existiert. Throws bei DB-Errors. */
export async function getPlannedAmountForMonth(
  client: AppSupabaseClient,
  args: { cardId: string; month: string },
): Promise<number | null> {
  const { data, error } = await client.rpc("get_planned_amount_for_month", {
    p_card_id: args.cardId,
    p_month: args.month,
  });
  if (error) throw error;
  return (data as number | null) ?? null;
}

/** Sprint 5 K1.4: „Effective Plan" — Vergleichsbasis für Budget-Status und
 *  „Noch X € frei". Auflösungs-Ordnung:
 *    1. 0 falls Karte im Monat inaktiv
 *    2. card_monthly_states.adjusted_amount falls gesetzt
 *    3. get_planned_amount_for_month(...) (Forward-Inheritance)
 *  Returns immer eine Zahl (≥ 0). Throws bei DB-Errors (LL-2). */
export async function getEffectivePlanForMonth(
  client: AppSupabaseClient,
  args: { cardId: string; month: string },
): Promise<number> {
  const { data, error } = await client.rpc("get_effective_plan_for_month", {
    p_card_id: args.cardId,
    p_month: args.month,
  });
  if (error) throw error;
  return Number(data ?? 0);
}

/** Split-Faktor ICH-Anteil (0..1) zum Monat M.
 *  1.0 falls Partner unbekannt. Throws bei DB-Errors. */
export async function getSplitFactor(
  client: AppSupabaseClient,
  args: { userId: string; month: string },
): Promise<number> {
  const { data, error } = await client.rpc("get_split_factor", {
    p_user_id: args.userId,
    p_month: args.month,
  });
  if (error) throw error;
  return data ?? 1.0;
}

/** Sprint 7: Idempotenter Toggle für manually_paid auf allen Card-Types.
 *  RPC handelt Ownership-Check, Month-Range-Check und Day-Normalization intern.
 *  Returns den neuen manually_paid-Status. Throw-on-Error per LL-2. */
export async function toggleCardManuallyPaid(
  client: AppSupabaseClient,
  args: { cardId: string; month: string },
): Promise<boolean> {
  const { data, error } = await client.rpc("toggle_card_manually_paid", {
    p_card_id: args.cardId,
    p_month: args.month,
  });
  if (error) throw error;
  return data as boolean;
}

/* ── v2-05: Karten-Lebenszyklus (Beenden / Löschen / Papierkorb) ─────────────
 * Ersetzt das Sprint-10-Verbergen (toggle_card_hidden, ersatzlos gestrichen).
 * deleted_at ist seit v2-05 der Papierkorb-Marker des §2.4-Trash-Flows. */

/** Karten-Ende setzen (last_active_month) bzw. mit lastMonth=null aufheben.
 *  ONCE-Karten werden server-seitig abgelehnt (22023). Throw-on-Error (LL-2). */
export async function endCard(
  client: AppSupabaseClient,
  args: { cardId: string; lastMonth: string | null },
): Promise<void> {
  const { error } = await client.rpc("end_card", {
    p_card_id: args.cardId,
    // Generierter Typ ist non-nullable string; NULL (= Ende aufheben) ist
    // RPC-seitig explizit erlaubt — daher der Cast.
    p_last_month: args.lastMonth as unknown as string,
  });
  if (error) throw error;
}

/** Karte in den Papierkorb (deleted_at + deleted_entities). Nur bei grünem
 *  Lösch-Gate — sonst wirft die RPC 23514 mit Grund-Codes. */
export async function deleteCard(
  client: AppSupabaseClient,
  args: { cardId: string },
): Promise<void> {
  const { error } = await client.rpc("delete_card", { p_card_id: args.cardId });
  if (error) throw error;
}

/** Rückgängig aus dem Papierkorb (innerhalb der Retention). */
export async function restoreCard(
  client: AppSupabaseClient,
  args: { cardId: string },
): Promise<void> {
  const { error } = await client.rpc("restore_card", { p_card_id: args.cardId });
  if (error) throw error;
}

/** Opportunistischer Hard-Delete-Vollzug abgelaufener eigener Papierkorb-
 *  Karten (Beschluss E3, Option b). Returns Anzahl entfernter Karten. */
export async function cleanupExpiredCardTrash(
  client: AppSupabaseClient,
): Promise<number> {
  const { data, error } = await client.rpc("cleanup_expired_card_trash");
  if (error) throw error;
  return (data as number) ?? 0;
}

// ── Sprint 8: CSV-Import / Distiller ─────────────────────────────────────────

/** Eine an `process_csv_import` übergebene Zeile (= Parser-/Router-Ausgabe).
 *  Sprint 9: trägt zusätzlich die Gegen-IBAN (counterparty_iban). */
export type CsvImportRow = {
  transaction_date: string; // ISO "YYYY-MM-DD"
  amount: number;
  description: string; // byte-exakt, Bank-Adapter-Format
  counterparty_iban: string | null; // Sprint 9; null = unbekannt
};

/** p_format_hint-Werte der RPC `process_csv_import` (Sprint 9 + v2-04 ①).
 *  Bei 'DKB_VISA' klassifiziert die RPC zusätzlich per Beschreibungs-Heuristik
 *  (Einzahlung/Ausgleich Kreditkarte, Betrag > 0 → INTERNAL_TRANSFER). */
export type CsvFormatHint = "DKB" | "CORTAL_CONSORS" | "DKB_VISA";

/** Rückgabe von `process_csv_import`. Sprint 9 erweitert um drei Backfill-Counter. */
export type CsvImportResult = {
  inserted_count: number;
  skipped_duplicates_count: number;
  auto_absorbed_count: number;
  fragment_ids: string[];
  /** Bestehende Fragmente, deren counterparty_iban per ON CONFLICT nachgefüllt wurde. */
  iban_backfilled_count: number;
  /** Fragmente, die als INTERNAL_TRANSFER reklassifiziert wurden. */
  internal_transfers_count: number;
  /** Karten-Zuordnungen, die wegen Transfer-Reklassifikation gelöst wurden. */
  links_removed_for_transfers_count: number;
};

/** Atomare Distiller-RPC: Hash-Dedup + Konfidenz-Matching + IBAN-Backfill +
 *  Cross-Account-Erkennung (Sprint 9). Eine Transaktion, vollständig rollback-
 *  fähig. Throw-on-Error (LL-2). p_format_hint default 'DKB' (DB-seitig). */
export async function processCsvImport(
  client: AppSupabaseClient,
  rows: CsvImportRow[],
  formatHint: CsvFormatHint = "DKB",
): Promise<CsvImportResult> {
  const { data, error } = await client.rpc("process_csv_import", {
    // jsonb-Parameter; generierter Typ ist `Json`, daher Cast über unknown.
    p_rows: rows as unknown as Json,
    p_format_hint: formatHint,
  });
  if (error) throw error;
  return data as unknown as CsvImportResult;
}

// ── Sprint v2-04: ASSET_REALLOCATION-Markierung ──────────────────────────────

/** Return-Shape von `set_fragment_asset_reallocation`. */
export type AssetReallocationResult = {
  fragment_id: string;
  transfer_type: "ASSET_REALLOCATION" | "INTERNAL_TRANSFER" | null;
};

/** v2-04 ②: Manuelle Umschichtungs-Markierung (Beschluss F3). Setzen erlaubt
 *  aus NULL und INTERNAL_TRANSFER (Scalable-Fall); Rücknahme nur aus
 *  ASSET_REALLOCATION → NULL. RPC verweigert bei Karten-Link (23514, OQ-B:
 *  Zuordnung zuerst lösen) und bei Fremd-Owner (42501). Throw-on-Error (LL-2). */
export async function setFragmentAssetReallocation(
  client: AppSupabaseClient,
  args: { fragmentId: string; set: boolean },
): Promise<AssetReallocationResult> {
  const { data, error } = await client.rpc("set_fragment_asset_reallocation", {
    p_fragment_id: args.fragmentId,
    p_set: args.set,
  });
  if (error) throw error;
  return data as unknown as AssetReallocationResult;
}

// ── Sprint 5: Atomic Card-Creation-RPCs ──────────────────────────────────────

export type CreateCardDirectArgs = {
  name: string;
  type: Database["public"]["Enums"]["card_type"];
  attribution: Database["public"]["Enums"]["card_attribution"];
  frequency: Database["public"]["Enums"]["card_frequency"];
  firstActiveMonth: string; // "YYYY-MM-01"
  lastActiveMonth: string | null; // null außer bei ONCE
  plannedAmount: number;
};

/** Atomic: INSERT cards + INSERT card_planned_timeline in einer Transaktion.
 *  Notwendig wegen DEFERRED-Constraint cards_assert_initial_plan. Returns Card-ID.
 *  Wirft bei DB-Validation-Fehlern (Name leer, Betrag ≤ 0, ONCE-Konflikt, etc.). */
export async function createCardDirect(
  client: AppSupabaseClient,
  args: CreateCardDirectArgs,
): Promise<string> {
  // p_last_active_month akzeptiert NULL (offene Laufzeit für nicht-ONCE-Karten).
  // Die generierten Typen markieren ihn als `string`, aber die Funktion hat
  // DEFAULT NULL — Cast zu unknown nötig, um null durchzureichen.
  const rpcArgs = {
    p_name: args.name,
    p_type: args.type,
    p_attribution: args.attribution,
    p_frequency: args.frequency,
    p_first_active_month: args.firstActiveMonth,
    p_last_active_month: args.lastActiveMonth as unknown as string,
    p_planned_amount: args.plannedAmount,
  };
  const { data, error } = await client.rpc("create_card_direct", rpcArgs);
  if (error) throw error;
  if (!data) throw new Error("create_card_direct returned no card id");
  return data;
}

export type CreateCardFromFragmentArgs = CreateCardDirectArgs & {
  fragmentId: string;
  linkMonth: string; // "YYYY-MM-01" — Periodenabgrenzung gemäß Konflikt 4 §7
};

/** Atomic: INSERT cards + INSERT card_planned_timeline + INSERT card_fragment_links. */
export async function createCardFromFragment(
  client: AppSupabaseClient,
  args: CreateCardFromFragmentArgs,
): Promise<string> {
  // Gleiches NULL-Verhalten für p_last_active_month wie in createCardDirect.
  const rpcArgs = {
    p_name: args.name,
    p_type: args.type,
    p_attribution: args.attribution,
    p_frequency: args.frequency,
    p_first_active_month: args.firstActiveMonth,
    p_last_active_month: args.lastActiveMonth as unknown as string,
    p_planned_amount: args.plannedAmount,
    p_fragment_id: args.fragmentId,
    p_link_month: args.linkMonth,
  };
  const { data, error } = await client.rpc("create_card_from_fragment", rpcArgs);
  if (error) throw error;
  if (!data) throw new Error("create_card_from_fragment returned no card id");
  return data;
}
