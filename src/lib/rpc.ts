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

// ── v2-17 (KAT-1): Kategorien ────────────────────────────────────────────────
//
// Eine Kategorie ist KEINE Karte. Beide Sparrate-RPCs schleifen ohne Typ-Filter
// über alle Karten des Monats — eine Kategorie als `cards`-Zeile würde
// zusätzlich zu ihren Kindern summiert und der Prüfanker bräche sofort
// (Befund D1). Deshalb eine eigene Tabelle und ein eigener Anlageweg.
//
// Es gibt bewusst KEIN `createCardCategory(name)` ohne Karte: Eine Kategorie
// entsteht dadurch, dass man ihr eine Karte gibt, damit eine leere Kategorie
// gar nicht erst existieren kann (Record B8).

/** Karte einer bestehenden Kategorie zuordnen — `categoryId: null` löst sie
 *  heraus (sie landet dann in „Ohne Kategorie"). Throw-on-Error (LL-2). */
export async function setCardCategory(
  client: AppSupabaseClient,
  args: { cardId: string; categoryId: string | null },
): Promise<void> {
  const { error } = await client.rpc("set_card_category", {
    p_card_id: args.cardId,
    // Generierter Typ ist non-nullable string; NULL (= Zuordnung aufheben) ist
    // RPC-seitig ausdrücklich erlaubt — daher der Cast, wie bei `endCard`.
    p_category_id: args.categoryId as unknown as string,
  });
  if (error) throw error;
}

/** Neue Kategorie anlegen UND die Karte hineinlegen, in einem Aufruf.
 *
 *  Existiert der Name bereits (ohne Rücksicht auf Groß-/Kleinschreibung), wird
 *  die bestehende Kategorie verwendet statt eines Fehlers — „Wohnen" und
 *  „wohnen" meinen denselben Ordner. Returns die Kategorie-ID. */
export async function createCategoryForCard(
  client: AppSupabaseClient,
  args: { cardId: string; name: string },
): Promise<string> {
  const { data, error } = await client.rpc("create_category_for_card", {
    p_card_id: args.cardId,
    p_name: args.name,
  });
  if (error) throw error;
  if (!data) throw new Error("create_category_for_card returned no category id");
  return data;
}

/** Kategorie umbenennen. Wirkt rückwirkend in allen Monaten (A6) — wie eine
 *  Karten-Umbenennung, und aus demselben Grund unbedenklich: Es ändert sich die
 *  Gliederung, nie eine Zahl, die rechnet. */
export async function renameCardCategory(
  client: AppSupabaseClient,
  args: { categoryId: string; name: string },
): Promise<void> {
  const { error } = await client.rpc("rename_card_category", {
    p_category_id: args.categoryId,
    p_name: args.name,
  });
  if (error) throw error;
}

/** Rückgabe von `delete_card_category` — alles, was die Rücknahme braucht. */
export type DeletedCategoryPayload = {
  category_id: string;
  name: string;
  sort_order: number;
  card_ids: string[];
};

/** Kategorie löschen. Die enthaltenen Karten werden NICHT mitgelöscht, sondern
 *  kategorielos (A7, via `ON DELETE SET NULL`).
 *
 *  Löscht HART und gibt den Wiederherstellungs-Bausatz zurück, statt eine Zeile
 *  in `deleted_entities` anzulegen: Deren Typ-Verzeichnis kennt nur vier Werte,
 *  `cleanup_expired_card_trash` filtert hart auf 'CARD', und 60 Sekunden
 *  Aufbewahrung reichen nicht — eine CATEGORY-Zeile würde nie vollzogen und nie
 *  entfernt (Befund D7). Die Rücknahme läuft deshalb über den bestehenden
 *  5-Sekunden-Toast, nicht über den Papierkorb. */
export async function deleteCardCategory(
  client: AppSupabaseClient,
  args: { categoryId: string },
): Promise<DeletedCategoryPayload> {
  const { data, error } = await client.rpc("delete_card_category", {
    p_category_id: args.categoryId,
  });
  if (error) throw error;
  return data as unknown as DeletedCategoryPayload;
}

/** Rücknahme aus dem Toast: legt die Kategorie mit derselben ID wieder an und
 *  hängt die Karten zurück, die inzwischen nicht anderweitig zugeordnet wurden. */
export async function restoreCardCategory(
  client: AppSupabaseClient,
  args: DeletedCategoryPayload,
): Promise<void> {
  const { error } = await client.rpc("restore_card_category", {
    p_category_id: args.category_id,
    p_name: args.name,
    p_sort_order: args.sort_order,
    p_card_ids: args.card_ids,
  });
  if (error) throw error;
}

// ── v2-17 (KAT-3): die Zahl eines Ordners ────────────────────────────────────

/** Ein Ordner der Monats-Aufstellung.
 *
 *  `key` unterscheidet die drei Sorten: `CATEGORY` ist ein echter Ordner aus
 *  `card_categories`, `UNCATEGORIZED` das Sammelbecken „Ohne Kategorie", und
 *  `INCOME` der Einkommens-Ordner — der ist KEINE Kartensumme, sondern das
 *  Nettogehalt, das gar keine Karte ist und ohne den die Aufstellung nicht
 *  aufginge (Record A4). */
export type CategoryAmount = {
  key: "INCOME" | "CATEGORY" | "UNCATEGORIZED";
  category_id: string | null;
  name: string;
  sort_order: number;
  amount: number;
  posten: number;
  /** v2-19 (GE-1): Der PLANWERT des Monats — nur beim Einkommens-Ordner
   *  gesetzt, bei Karten-Ordnern `null`.
   *
   *  Er kommt aus derselben Antwort wie `amount`, damit die Netto-Kachel
   *  „geplant 4.165,11 €" zeigen kann, ohne eine zweite Quelle zu befragen.
   *  Der naheliegende Weg wäre `ichLatest` aus `page.tsx` gewesen — der liest
   *  die Zeitreihe aber mit `ORDER BY effective_month DESC LIMIT 1` und liefert
   *  damit den NEUESTEN Eintrag, nicht den des angezeigten Monats. In einem
   *  2025er-Monat stünde dort der 2026er-Plan. */
  planned: number | null;
};

/** Alle Ordner eines Monats mit ihrem vorzeichenrichtigen Beitrag zur Sparrate.
 *
 *  EIN Aufruf für alle Ordner — nicht einer je Ordner. Der Loader feuert bereits
 *  drei Aufrufe pro Karte (Befund D14); eine Runde je Ordner obendrauf wüchse
 *  multiplikativ.
 *
 *  Die Summe aller `amount` ergibt EXAKT die Sparrate des Monats — auch auf den
 *  Cent. Das ist keine Nebenwirkung, sondern in der Funktion erzwungen: Der
 *  Rundungsrest wandert auf den betragsgrößten Ordner, weil elf einzeln
 *  gerundete Zahlen die eine Schlussrundung der Sparrate sonst nicht nachbilden
 *  können (Record C1). Ein Ordner zeigt dadurch bis zu einen Cent neben seinem
 *  eigenen exakten Wert — im Juli 2026 ist das „Wohnen" mit −1.148,18 € statt
 *  −1.148,17 €.
 *
 *  Leeres Array, wenn kein Gehalt hinterlegt ist: Dann gibt es keine Sparrate,
 *  und eine Aufstellung, die sich zu nichts summiert, wäre eine Falschaussage
 *  (LL-20). */
export async function getCategoryAmountsForMonth(
  client: AppSupabaseClient,
  args: { userId: string; month: string },
): Promise<CategoryAmount[]> {
  const { data, error } = await client.rpc("get_category_amounts_for_month", {
    p_user_id: args.userId,
    p_month: args.month,
  });
  if (error) throw error;
  return (data as unknown as CategoryAmount[]) ?? [];
}

// ── v2-24 (P4): die Jahres-Reihe der Sparrate in EINER Netzrunde ────────────

/** Ist- und Plan-Sparrate eines Monats innerhalb einer Jahres-Reihe.
 *
 *  `null` heißt „kein Wert", nicht „0,00 €" — beide RPCs liefern `null`, wenn für
 *  den Monat kein Gehalt hinterlegt ist. Eine 0 daraus zu machen wäre eine
 *  Falschaussage („nichts gespart" ≠ „keine Daten", LL-20); die Umrechnung auf 0
 *  passiert erst beim Kumulieren im Welle-Loader, genau wie vorher. */
export type SparrateSeriesPoint = {
  /** 0 = Januar … 11 = Dezember. */
  month_index: number;
  ist: number | null;
  plan: number | null;
};

/** Zwölf Monate Ist und Plan in EINEM Aufruf statt in 24.
 *
 *  Gemessen: die Schleife kostet in der Datenbank **50,3 ms** für alle zwölf
 *  Monate. Über die Leitung lagen die 24 Einzelaufrufe in Produktion bei
 *  durchschnittlich 1.298 ms (Ist) bzw. 1.305 ms (Plan) — **je Aufruf**.
 *
 *  Die RPC **ruft** `calculate_sparrate_for_month` und
 *  `calculate_planned_sparrate_for_month` auf und rechnet nicht selbst. Das ist
 *  hier besonders scharf: Beide runden **einmal ganz am Ende über alles** (§6
 *  Stolperfalle 13 / LL-25). Jede eigene Summierung oder Zwischenrundung würde
 *  die Sparrate um Cent-Beträge verschieben — und damit den schärfsten
 *  Regressions-Wächter des Projekts (LL-24). Deshalb wird dort nichts summiert;
 *  die Kumulation bleibt im Loader. */
export async function getSparrateSeries(
  client: AppSupabaseClient,
  args: { userId: string; year: number },
): Promise<SparrateSeriesPoint[]> {
  const { data, error } = await client.rpc("get_sparrate_series", {
    p_user_id: args.userId,
    p_year: args.year,
  });
  if (error) throw error;
  return (data as unknown as SparrateSeriesPoint[]) ?? [];
}

// ── v2-24 (P3): alle Monatswerte aller Karten in EINER Netzrunde ────────────

/** Die Monatswerte einer im Monat aktiven Karte.
 *
 *  Enthält bewusst NUR das, was monatsabhängig ist. Name, Typ, Zuordnung,
 *  Frequenz, Fälligkeitstag und Kategorie sind Eigenschaften der Karte und
 *  kommen weiterhin aus dem `cards`-Select — der ohnehin bleiben muss, weil die
 *  Badge-Auflösung die Namen auch monats-INAKTIVER Karten braucht. */
export type CardMonthValues = {
  card_id: string;
  /** Anzeige-Betrag, Prioritätskette Realität → Anpassung → Plan. Bei GEMEINSAM
   *  bereits der EIGENE Anteil (v2-13/BF-4) — nicht erneut umrechnen. */
  amount: number;
  /** Vergleichsbasis für Budget-Status und „Noch frei": Anpassung > Roh-Plan.
   *  Bleibt die VOLLE Haushaltsrechnung (§7 Regel 1). */
  effective_plan: number;
  manually_paid: boolean;
  /** `null` = keine Anpassung. Das ist etwas anderes als „Anpassung auf 0 €"
   *  (§6 Stolperfalle 3), deshalb bleibt `null` hier `null`. */
  adjusted_amount: number | null;
};

/** Alle im Monat aktiven Karten mit ihren Monatswerten — EIN Aufruf statt 179.
 *
 *  ── Was diese Funktion ersetzt ─────────────────────────────────────────────
 *  Bis v2-24 lud `page.tsx` alle 77 nicht-gelöschten Karten, rief dann
 *  `isCardActiveInMonth` EINZELN für jede davon, warf 43 Antworten weg und
 *  feuerte für die verbleibenden 34 je drei weitere Aufrufe. Zusammen 179 der
 *  233 Netzrunden eines Dashboard-Aufbaus — für gemessene 17 ms Rechenarbeit.
 *  Gebündelt kostet dasselbe **7,99 ms in einem Aufruf** (gemessen, warm).
 *
 *  ── Die Zusicherung, auf der alles ruht ────────────────────────────────────
 *  Die RPC **ruft** `is_card_active_in_month`, `calculate_card_amount_for_month`
 *  und `get_effective_plan_for_month` auf — sie baut sie nicht nach. Belegt über
 *  byte-identische Prüfsummen aller neun Rechenfunktionen vor und nach der
 *  Migration (`sprints/sprint_v2-24_anker.md`). Wer hier etwas ändert, prüft das
 *  erneut: Ein Nachbau der Prioritätskette würde den Split-Anteil ein zweites
 *  Mal anwenden (§6 Stolperfalle 11), und keine Zahl sähe dabei falsch aus.
 *
 *  ── Throw-on-Error, und warum das eine Verhaltensänderung ist ──────────────
 *  `isCardActiveInMonth` schluckt bewusst jeden Fehler und liefert `false`,
 *  damit eine einzelne Karte nicht den ganzen Render blockiert (LL-2). Gebündelt
 *  gibt es diese Vereinzelung nicht mehr: Ein Fehler betrifft alle Karten. Der
 *  Wrapper wirft deshalb wie alle anderen, und der AUFRUFER fängt ihn ab — dann
 *  bleibt das Karussell leer statt die Seite mitzunehmen. */
export async function getCardsForMonth(
  client: AppSupabaseClient,
  args: { userId: string; month: string },
): Promise<CardMonthValues[]> {
  const { data, error } = await client.rpc("get_cards_for_month", {
    p_user_id: args.userId,
    p_month: args.month,
  });
  if (error) throw error;
  return (data as unknown as CardMonthValues[]) ?? [];
}

// ── v2-19 (GE-1): das tatsächlich überwiesene Netto ─────────────────────────

/** Antwort beider Netto-RPCs. `actual_net` ist der Stand NACH der Änderung —
 *  `null`, wenn für den Monat nichts (mehr) zugeordnet ist. */
export type IncomeLinkResult = {
  fragment_id: string;
  month: string;
  actual_net: number | null;
};

/** Ordnet eine Zahlung dem Netto dieses Monats zu.
 *
 *  Warum eine RPC, wo `linkFragmentToCard` einen schlichten UPSERT macht: Hier
 *  ist etwas zu prüfen, das PostgREST nicht prüfen kann — vor allem das
 *  Vorzeichen. Ohne diese Prüfung ließe sich eine Ausgabe auf die Netto-Kachel
 *  ziehen, und das Monats-Netto fiele auf einen negativen Betrag. Die RPC
 *  wirft `22023` (kein Eingang), `23514` (Transfer) und `42501` (fremd). */
export async function linkFragmentToIncome(
  client: AppSupabaseClient,
  args: { fragmentId: string; month: string },
): Promise<IncomeLinkResult> {
  const { data, error } = await client.rpc("link_fragment_to_income", {
    p_fragment_id: args.fragmentId,
    p_month: args.month,
  });
  if (error) throw error;
  return data as unknown as IncomeLinkResult;
}

/** Löst die Zuordnung wieder — danach gilt wieder der Plan, und die Zahlung
 *  kehrt in die Rohmasse zurück (Record, Entscheidung E). */
export async function unlinkFragmentFromIncome(
  client: AppSupabaseClient,
  args: { fragmentId: string },
): Promise<IncomeLinkResult> {
  const { data, error } = await client.rpc("unlink_fragment_from_income", {
    p_fragment_id: args.fragmentId,
  });
  if (error) throw error;
  return data as unknown as IncomeLinkResult;
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
