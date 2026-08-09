-- ═══════════════════════════════════════════════════════════════════════════
-- BASELINE — Datenbank-Grundstand von Antigravity Finance
-- Hausaufgabe J1 · erzeugt am 08.08.2026 im Sprint v2-17 · Befund D15
-- ═══════════════════════════════════════════════════════════════════════════
--
-- WAS DAS IST
-- Der vollständige Struktur-Stand der Produktiv-Datenbank
-- `nflkobdfdhncrtjncpmq` NACH Sprint v2-16, ausgelesen aus dem Postgres-
-- Katalog. Damit existiert erstmals eine versionierte Basis, gegen die ein
-- Eingriff in eine Rechenfunktion diffen kann — und aus der sich die
-- Übungs-Datenbank rekonstruieren lässt.
--
-- Bis heute lagen unter `supabase/migrations/` nur fünf Delta-Dateien ab
-- v2-04. Alles davor (Sprints 1–8: Basistabellen, Lebenszyklus-RPCs,
-- Distiller, RLS) existierte ausschließlich in den beiden lebenden
-- Datenbanken. CLAUDE.md §3 sagt „versionierte Migrationen ab v2-04" — das
-- stimmt, meint aber Deltas, nicht eine reproduzierbare Basis (D15).
--
-- WAS DAS NICHT IST
-- · Kein `pg_dump`. Der Supabase-CLI ist zwar angemeldet, `db dump` braucht
--   aber das Datenbank-Passwort, das nicht im Repo liegt. Diese Datei ist aus
--   `pg_catalog` rekonstruiert: pg_get_functiondef, pg_get_constraintdef,
--   pg_get_triggerdef, pg_get_viewdef, pg_indexes, pg_policies.
-- · KEINE Daten. Nur `app_config` ist als Seed enthalten, weil Arbeitsregel 5
--   verlangt, dass Schwellenwerte aus der Datenbank kommen — ohne diese Zeilen
--   ist eine frische Datenbank nicht lauffähig. `net_estimation_brackets`
--   bleibt leer (das ist die offene Hausaufgabe TP-2).
-- · Keine Rollen, Grants oder Supabase-internen Schemata (`auth`, `storage`,
--   `vault`). Die legt die Supabase-Plattform selbst an.
--
-- WIE SIE ZU BENUTZEN IST
-- Auf eine LEERE Supabase-Datenbank anwenden, in der Reihenfolge dieser
-- Datei, danach die Delta-Dateien ab `20260706_v2_04_*` NICHT mehr — die sind
-- hier bereits enthalten. Sie sind ab v2-17 die Historie, nicht der Bauplan.
--
-- ⚠️ NICHT auf Produktion anwenden. Produktion IST dieser Stand.
--
-- Der Event-Trigger `ensure_rls` am Ende schaltet RLS bei jedem künftigen
-- CREATE TABLE automatisch ein — aber er legt KEINE Policy an und schluckt
-- sein eigenes Scheitern (Befund D8). Wer eine Tabelle hinzufügt, schreibt
-- die Policy selbst.
-- ═══════════════════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────────────────
-- 1 · Erweiterungen
-- ───────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


-- ───────────────────────────────────────────────────────────────────────────
-- 2 · Aufzählungstypen
--
-- `deleted_entity_type` hat genau vier Werte. Eine Kategorie kann der
-- Papierkorb deshalb nicht tragen (Befund D7) — v2-17 löst das bewusst ohne
-- neuen Enum-Wert, über eine Rücknahme im Toast statt über `deleted_entities`.
-- ───────────────────────────────────────────────────────────────────────────

CREATE TYPE public.card_attribution AS ENUM ('ICH', 'GEMEINSAM');
CREATE TYPE public.card_frequency AS ENUM ('MONTHLY', 'QUARTERLY', 'SEMIANNUAL', 'ANNUAL', 'ONCE');
CREATE TYPE public.card_type AS ENUM ('FIXED_COST', 'BUDGET', 'INCOME');
CREATE TYPE public.deleted_entity_type AS ENUM ('CARD_END', 'CARD', 'CARD_FRAGMENT_LINK', 'FRAGMENT');
CREATE TYPE public.link_origin AS ENUM ('AUTO_ABSORBED', 'MANUAL_DROP');
CREATE TYPE public.person_role AS ENUM ('ICH', 'PARTNER');


-- ───────────────────────────────────────────────────────────────────────────
-- 3 · Tabellen
--
-- Spalten-Namen ohne `card_`-Präfix auf `cards` (`type`, `attribution`,
-- `frequency`) — CLAUDE.md §6 Stolperfalle 1 / LL-7.
-- `card_monthly_states.closed_at` ist bewusst ungenutzt (Stolperfalle 10).
-- ───────────────────────────────────────────────────────────────────────────

CREATE TABLE public.app_config (
  key text NOT NULL,
  value jsonb NOT NULL,
  description text,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.profiles (
  user_id uuid NOT NULL,
  display_name text,
  partner_name text,
  tax_class smallint,
  tax_year smallint,
  onboarded_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  own_ibans text[] DEFAULT '{}'::text[] NOT NULL
);

CREATE TABLE public.income_timeline (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  person person_role NOT NULL,
  effective_month date NOT NULL,
  gross_annual numeric(12,2) NOT NULL,
  net_monthly numeric(12,2) NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.cards (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  name text NOT NULL,
  type card_type NOT NULL,
  attribution card_attribution NOT NULL,
  frequency card_frequency NOT NULL,
  first_active_month date NOT NULL,
  last_active_month date,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  due_day smallint
);

CREATE TABLE public.card_planned_timeline (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  card_id uuid NOT NULL,
  effective_month date NOT NULL,
  planned_amount numeric(12,2) NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.card_monthly_states (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  card_id uuid NOT NULL,
  month date NOT NULL,
  manually_paid boolean DEFAULT false NOT NULL,
  adjusted_amount numeric(12,2),
  adjustment_scope text DEFAULT 'THIS_MONTH'::text,
  closed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.fragments (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  amount numeric(12,2) NOT NULL,
  description text NOT NULL,
  transaction_date date NOT NULL,
  hash text NOT NULL,
  confidence numeric(5,4),
  suggested_card_id uuid,
  imported_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  counterparty_iban text,
  transfer_type text
);

CREATE TABLE public.card_fragment_links (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  card_id uuid NOT NULL,
  fragment_id uuid NOT NULL,
  month date NOT NULL,
  origin link_origin NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.deleted_entities (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  entity_type deleted_entity_type NOT NULL,
  entity_id uuid NOT NULL,
  payload jsonb NOT NULL,
  deleted_at timestamp with time zone DEFAULT now() NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  restored_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.net_estimation_brackets (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  tax_class smallint NOT NULL,
  tax_year smallint NOT NULL,
  gross_annual_min numeric(12,2) NOT NULL,
  gross_annual_max numeric(12,2),
  net_factor numeric(5,4) NOT NULL,
  notes text
);


-- ───────────────────────────────────────────────────────────────────────────
-- 4 · Constraints
--
-- `card_fragment_links_fragment_id_key` (UNIQUE) nagelt die Zuordnungs-
-- Hierarchie auf eine Ebene fest — ein Fragment hängt an höchstens einer
-- Karte (Befund D13). `budget_never_shared` schließt GEMEINSAM auf
-- BUDGET-Karten aus; deshalb kann eine Budget-Karte nie einen Split tragen.
-- ───────────────────────────────────────────────────────────────────────────

ALTER TABLE public.app_config ADD CONSTRAINT app_config_pkey PRIMARY KEY (key);

ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (user_id);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.profiles ADD CONSTRAINT tax_class_valid CHECK (((tax_class IS NULL) OR ((tax_class >= 1) AND (tax_class <= 6))));
ALTER TABLE public.profiles ADD CONSTRAINT tax_year_valid CHECK (((tax_year IS NULL) OR ((tax_year >= 2020) AND (tax_year <= 2099))));

ALTER TABLE public.income_timeline ADD CONSTRAINT income_timeline_pkey PRIMARY KEY (id);
ALTER TABLE public.income_timeline ADD CONSTRAINT income_timeline_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.income_timeline ADD CONSTRAINT income_timeline_user_id_person_effective_month_key UNIQUE (user_id, person, effective_month);
ALTER TABLE public.income_timeline ADD CONSTRAINT effective_month_first_day CHECK ((effective_month = (date_trunc('month'::text, (effective_month)::timestamp with time zone))::date));
ALTER TABLE public.income_timeline ADD CONSTRAINT positive_amounts CHECK (((gross_annual >= (0)::numeric) AND (net_monthly >= (0)::numeric)));

ALTER TABLE public.cards ADD CONSTRAINT cards_pkey PRIMARY KEY (id);
ALTER TABLE public.cards ADD CONSTRAINT cards_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.cards ADD CONSTRAINT budget_never_shared CHECK ((NOT ((type = 'BUDGET'::card_type) AND (attribution = 'GEMEINSAM'::card_attribution))));
ALTER TABLE public.cards ADD CONSTRAINT cards_due_day_range CHECK (((due_day IS NULL) OR ((due_day >= 1) AND (due_day <= 31))));
ALTER TABLE public.cards ADD CONSTRAINT first_month_first_day CHECK ((first_active_month = (date_trunc('month'::text, (first_active_month)::timestamp with time zone))::date));
ALTER TABLE public.cards ADD CONSTRAINT last_after_first CHECK (((last_active_month IS NULL) OR (last_active_month >= first_active_month)));
ALTER TABLE public.cards ADD CONSTRAINT last_month_first_day CHECK (((last_active_month IS NULL) OR (last_active_month = (date_trunc('month'::text, (last_active_month)::timestamp with time zone))::date)));
ALTER TABLE public.cards ADD CONSTRAINT name_not_empty CHECK ((length(TRIM(BOTH FROM name)) > 0));
ALTER TABLE public.cards ADD CONSTRAINT once_is_single_month CHECK (((frequency <> 'ONCE'::card_frequency) OR (last_active_month = first_active_month)));

ALTER TABLE public.card_planned_timeline ADD CONSTRAINT card_planned_timeline_pkey PRIMARY KEY (id);
ALTER TABLE public.card_planned_timeline ADD CONSTRAINT card_planned_timeline_card_id_fkey FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE;
ALTER TABLE public.card_planned_timeline ADD CONSTRAINT card_planned_timeline_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.card_planned_timeline ADD CONSTRAINT card_planned_timeline_card_id_effective_month_key UNIQUE (card_id, effective_month);
ALTER TABLE public.card_planned_timeline ADD CONSTRAINT first_day CHECK ((effective_month = (date_trunc('month'::text, (effective_month)::timestamp with time zone))::date));
ALTER TABLE public.card_planned_timeline ADD CONSTRAINT positive_planned CHECK ((planned_amount >= (0)::numeric));

ALTER TABLE public.card_monthly_states ADD CONSTRAINT card_monthly_states_pkey PRIMARY KEY (id);
ALTER TABLE public.card_monthly_states ADD CONSTRAINT card_monthly_states_card_id_fkey FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE;
ALTER TABLE public.card_monthly_states ADD CONSTRAINT card_monthly_states_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.card_monthly_states ADD CONSTRAINT card_monthly_states_card_id_month_key UNIQUE (card_id, month);
ALTER TABLE public.card_monthly_states ADD CONSTRAINT month_first_day CHECK ((month = (date_trunc('month'::text, (month)::timestamp with time zone))::date));
ALTER TABLE public.card_monthly_states ADD CONSTRAINT positive_adjusted CHECK (((adjusted_amount IS NULL) OR (adjusted_amount >= (0)::numeric)));
ALTER TABLE public.card_monthly_states ADD CONSTRAINT scope_valid CHECK ((adjustment_scope = ANY (ARRAY['THIS_MONTH'::text, 'FORWARD'::text])));

ALTER TABLE public.fragments ADD CONSTRAINT fragments_pkey PRIMARY KEY (id);
ALTER TABLE public.fragments ADD CONSTRAINT fragments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.fragments ADD CONSTRAINT fragments_suggested_card_id_fkey FOREIGN KEY (suggested_card_id) REFERENCES cards(id) ON DELETE SET NULL;
ALTER TABLE public.fragments ADD CONSTRAINT fragments_user_id_hash_key UNIQUE (user_id, hash);
ALTER TABLE public.fragments ADD CONSTRAINT confidence_range CHECK (((confidence IS NULL) OR ((confidence >= (0)::numeric) AND (confidence <= (1)::numeric))));
ALTER TABLE public.fragments ADD CONSTRAINT description_not_empty CHECK ((length(TRIM(BOTH FROM description)) > 0));
ALTER TABLE public.fragments ADD CONSTRAINT hash_not_empty CHECK ((length(hash) > 0));
ALTER TABLE public.fragments ADD CONSTRAINT transfer_type_valid CHECK (((transfer_type IS NULL) OR (transfer_type = ANY (ARRAY['INTERNAL_TRANSFER'::text, 'ASSET_REALLOCATION'::text]))));

ALTER TABLE public.card_fragment_links ADD CONSTRAINT card_fragment_links_pkey PRIMARY KEY (id);
ALTER TABLE public.card_fragment_links ADD CONSTRAINT card_fragment_links_card_id_fkey FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE;
ALTER TABLE public.card_fragment_links ADD CONSTRAINT card_fragment_links_fragment_id_fkey FOREIGN KEY (fragment_id) REFERENCES fragments(id) ON DELETE CASCADE;
ALTER TABLE public.card_fragment_links ADD CONSTRAINT card_fragment_links_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.card_fragment_links ADD CONSTRAINT card_fragment_links_fragment_id_key UNIQUE (fragment_id);
ALTER TABLE public.card_fragment_links ADD CONSTRAINT month_first_day CHECK ((month = (date_trunc('month'::text, (month)::timestamp with time zone))::date));

ALTER TABLE public.deleted_entities ADD CONSTRAINT deleted_entities_pkey PRIMARY KEY (id);
ALTER TABLE public.deleted_entities ADD CONSTRAINT deleted_entities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.deleted_entities ADD CONSTRAINT expires_after_deletion CHECK ((expires_at > deleted_at));

ALTER TABLE public.net_estimation_brackets ADD CONSTRAINT net_estimation_brackets_pkey PRIMARY KEY (id);
ALTER TABLE public.net_estimation_brackets ADD CONSTRAINT net_estimation_brackets_tax_class_tax_year_gross_annual_min_key UNIQUE (tax_class, tax_year, gross_annual_min);
ALTER TABLE public.net_estimation_brackets ADD CONSTRAINT factor_valid CHECK (((net_factor > (0)::numeric) AND (net_factor < (1)::numeric)));
ALTER TABLE public.net_estimation_brackets ADD CONSTRAINT range_valid CHECK (((gross_annual_max IS NULL) OR (gross_annual_max > gross_annual_min)));
ALTER TABLE public.net_estimation_brackets ADD CONSTRAINT tax_class_valid CHECK (((tax_class >= 1) AND (tax_class <= 6)));
ALTER TABLE public.net_estimation_brackets ADD CONSTRAINT tax_year_valid CHECK (((tax_year >= 2020) AND (tax_year <= 2099)));


-- ───────────────────────────────────────────────────────────────────────────
-- 5 · Indizes
-- ───────────────────────────────────────────────────────────────────────────

CREATE INDEX idx_cards_active_range ON public.cards USING btree (user_id, first_active_month, last_active_month) WHERE (deleted_at IS NULL);
CREATE INDEX idx_cards_user_active ON public.cards USING btree (user_id) WHERE (deleted_at IS NULL);
CREATE INDEX idx_card_planned_lookup ON public.card_planned_timeline USING btree (card_id, effective_month DESC);
CREATE INDEX idx_states_card_month ON public.card_monthly_states USING btree (card_id, month);
CREATE INDEX idx_states_user_month ON public.card_monthly_states USING btree (user_id, month);
CREATE INDEX idx_links_card_month ON public.card_fragment_links USING btree (card_id, month);
CREATE INDEX idx_links_user_month ON public.card_fragment_links USING btree (user_id, month);
CREATE INDEX idx_fragments_description_trgm ON public.fragments USING gin (description gin_trgm_ops);
CREATE INDEX idx_fragments_transfer_type ON public.fragments USING btree (user_id, transfer_type) WHERE (transfer_type IS NOT NULL);
CREATE INDEX idx_fragments_user_date ON public.fragments USING btree (user_id, transaction_date DESC);
CREATE INDEX idx_income_timeline_lookup ON public.income_timeline USING btree (user_id, person, effective_month DESC);
CREATE INDEX idx_deleted_pending ON public.deleted_entities USING btree (expires_at) WHERE (restored_at IS NULL);
CREATE INDEX idx_deleted_user_pending ON public.deleted_entities USING btree (user_id, expires_at) WHERE (restored_at IS NULL);
CREATE INDEX idx_brackets_lookup ON public.net_estimation_brackets USING btree (tax_class, tax_year, gross_annual_min);


-- ───────────────────────────────────────────────────────────────────────────
-- 6 · Funktionen — Infrastruktur und Nachschlagen
--
-- Reihenfolge ist Abhängigkeits-Reihenfolge: was aufgerufen wird, steht vorher.
-- `is_card_active_in_month` verankert QUARTERLY/SEMIANNUAL/ANNUAL am EIGENEN
-- `first_active_month` jeder Karte — die Phase ist pro Karte, nicht
-- kalendarisch (Befund D10). Es prüft `deleted_at` bewusst NICHT.
-- ───────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id) 
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Befund D8: Dieser Event-Trigger schaltet RLS ein, legt aber KEINE Policy an
-- und schluckt sein eigenes Scheitern (EXCEPTION WHEN OTHERS THEN RAISE LOG).
-- Eine neue Tabelle ohne eigene Policy liefert über PostgREST ein stilles []
-- beim SELECT und 42501 beim INSERT — das liest sich beim Testen wie „noch
-- keine Daten angelegt".
CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;

-- DEFERRABLE INITIALLY DEFERRED — deshalb sind create_card_direct /
-- create_card_from_fragment der einzige legale Anlageweg: zwei sequentielle
-- INSERTs aus dem JS-Client scheitern am zwischenzeitlichen Commit.
CREATE OR REPLACE FUNCTION public.assert_card_has_initial_plan()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Nur prüfen wenn die Karte nicht soft-deleted ist
  IF NEW.deleted_at IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Mindestens ein Plan-Eintrag <= first_active_month muss existieren
  IF NOT EXISTS (
    SELECT 1 FROM card_planned_timeline
    WHERE card_id = NEW.id
      AND effective_month <= NEW.first_active_month
  ) THEN
    RAISE EXCEPTION 
      'Karte % (%) hat keinen Planwert für ihren ersten aktiven Monat %. 
       Bitte INSERT in card_planned_timeline mit effective_month <= % vornehmen.',
      NEW.name, NEW.id, NEW.first_active_month, NEW.first_active_month;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.enforce_no_transfer_fragment_links()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF EXISTS (
    SELECT 1 FROM fragments f
     WHERE f.id = NEW.fragment_id
       AND f.transfer_type IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'OQ-B: Fragment % ist als Transfer markiert (%) und kann keiner Karte zugeordnet werden',
      NEW.fragment_id,
      (SELECT transfer_type FROM fragments WHERE id = NEW.fragment_id)
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_net_monthly_for_month(p_user_id uuid, p_person person_role, p_month date)
 RETURNS numeric
 LANGUAGE sql
 STABLE
AS $function$
  SELECT net_monthly
  FROM income_timeline
  WHERE user_id = p_user_id
    AND person  = p_person
    AND effective_month <= p_month
  ORDER BY effective_month DESC
  LIMIT 1
$function$;

-- Bekannte Ausnahme mit explizitem p_user_id (CLAUDE.md §6 Stolperfalle 4).
CREATE OR REPLACE FUNCTION public.get_split_factor(p_user_id uuid, p_month date)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  v_ich_brutto     numeric;
  v_partner_brutto numeric;
BEGIN
  SELECT gross_annual INTO v_ich_brutto
  FROM income_timeline
  WHERE user_id = p_user_id 
    AND person = 'ICH' 
    AND effective_month <= p_month
  ORDER BY effective_month DESC LIMIT 1;

  SELECT gross_annual INTO v_partner_brutto
  FROM income_timeline
  WHERE user_id = p_user_id 
    AND person = 'PARTNER' 
    AND effective_month <= p_month
  ORDER BY effective_month DESC LIMIT 1;

  -- Edge: ICH-Brutto fehlt → 0.0 (sollte UI-seitig durch Onboarding 
  -- verhindert werden, aber wir machen die Funktion robust)
  IF v_ich_brutto IS NULL THEN
    RETURN 0.0;
  END IF;

  -- Edge: Partner unbekannt oder beide 0 → ICH trägt alles
  IF v_partner_brutto IS NULL OR (v_ich_brutto + v_partner_brutto) = 0 THEN
    RETURN 1.0;
  END IF;

  RETURN v_ich_brutto / (v_ich_brutto + v_partner_brutto);
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_card_active_in_month(p_card_id uuid, p_month date)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  v_card        cards%ROWTYPE;
  v_months_diff int;
BEGIN
  SELECT * INTO v_card FROM cards WHERE id = p_card_id;

  IF NOT FOUND THEN RETURN false; END IF;
  -- KEIN deleted_at-Check mehr:
  -- Hide ist UI-Concern, nicht Active-Concern. Konsumenten, die hidden
  -- Karten ausschließen müssen, filtern explizit über cards.deleted_at
  -- in ihrer eigenen Query.
  IF p_month < v_card.first_active_month THEN RETURN false; END IF;
  IF v_card.last_active_month IS NOT NULL
     AND p_month > v_card.last_active_month THEN
    RETURN false;
  END IF;

  v_months_diff := (
    EXTRACT(YEAR FROM age(p_month, v_card.first_active_month))::int * 12
    + EXTRACT(MONTH FROM age(p_month, v_card.first_active_month))::int
  );

  RETURN CASE v_card.frequency
    WHEN 'MONTHLY'    THEN true
    WHEN 'QUARTERLY'  THEN v_months_diff % 3 = 0
    WHEN 'SEMIANNUAL' THEN v_months_diff % 6 = 0
    WHEN 'ANNUAL'     THEN v_months_diff % 12 = 0
    WHEN 'ONCE'       THEN p_month = v_card.first_active_month
  END;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_planned_amount_for_month(p_card_id uuid, p_month date)
 RETURNS numeric
 LANGUAGE sql
 STABLE
AS $function$
  SELECT planned_amount
  FROM card_planned_timeline
  WHERE card_id = p_card_id
    AND effective_month <= p_month
  ORDER BY effective_month DESC
  LIMIT 1
$function$;

CREATE OR REPLACE FUNCTION public.get_effective_plan_for_month(p_card_id uuid, p_month date)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
DECLARE
  v_adjusted numeric;
  v_planned  numeric;
BEGIN
  IF NOT is_card_active_in_month(p_card_id, p_month) THEN
    RETURN 0;
  END IF;

  SELECT adjusted_amount INTO v_adjusted
    FROM card_monthly_states
   WHERE card_id = p_card_id
     AND month   = p_month;

  IF v_adjusted IS NOT NULL THEN
    RETURN v_adjusted;
  END IF;

  v_planned := get_planned_amount_for_month(p_card_id, p_month);
  RETURN COALESCE(v_planned, 0);
END;
$function$;

CREATE OR REPLACE FUNCTION public.estimate_net_monthly(p_gross_annual numeric, p_tax_class smallint, p_tax_year smallint)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  v_factor numeric;
BEGIN
  -- Edge-Cases
  IF p_gross_annual IS NULL OR p_gross_annual <= 0 THEN
    RETURN NULL;
  END IF;
  IF p_tax_class IS NULL OR p_tax_year IS NULL THEN
    RETURN NULL;
  END IF;

  -- Bracket-Lookup: passende Range finden
  SELECT net_factor INTO v_factor
  FROM net_estimation_brackets
  WHERE tax_class = p_tax_class
    AND tax_year  = p_tax_year
    AND gross_annual_min <= p_gross_annual
    AND (gross_annual_max IS NULL OR p_gross_annual < gross_annual_max)
  LIMIT 1;

  -- Keine passende Bracket gefunden (z.B. Steuerjahr nicht geseedet)
  IF v_factor IS NULL THEN
    RETURN NULL;
  END IF;

  -- Brutto × Faktor / 12 = monatliches Netto, gerundet auf 2 Stellen
  RETURN round(p_gross_annual * v_factor / 12, 2);
END;
$function$;


-- ───────────────────────────────────────────────────────────────────────────
-- 7 · Funktionen — Zuordnungs-Heuristik (Distiller, §11)
--
-- Befund D9: `amount_match` liefert 0.00 sobald der Plan NULL ist, und
-- `frequency_match` ruft `is_card_active_in_month`, das für eine ID außerhalb
-- von `cards` false liefert. Eine Entität ohne Plan und ohne Frequenz erreicht
-- deshalb höchstens 0,50 — unter der Badge-Schwelle. Kategorien können über
-- diese Pipeline strukturell nicht vorgeschlagen werden.
-- ───────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.name_similarity(p_description text, p_card_name text)
 RETURNS numeric
 LANGUAGE sql
 IMMUTABLE
AS $function$
  SELECT GREATEST(
    similarity(lower(p_description), lower(p_card_name)),
    CASE
      WHEN lower(p_description) LIKE '%' || lower(p_card_name) || '%'
      THEN 0.80
      ELSE 0.00
    END
  )::numeric
$function$;

CREATE OR REPLACE FUNCTION public.amount_match(p_fragment_amount numeric, p_planned_amount numeric)
 RETURNS numeric
 LANGUAGE sql
 IMMUTABLE
AS $function$
  SELECT CASE
    WHEN p_planned_amount IS NULL OR p_planned_amount = 0 THEN 0.00
    WHEN ABS(ABS(p_fragment_amount) - p_planned_amount) / p_planned_amount < 0.01 THEN 1.00
    WHEN ABS(ABS(p_fragment_amount) - p_planned_amount) / p_planned_amount < 0.05 THEN 0.85
    WHEN ABS(ABS(p_fragment_amount) - p_planned_amount) / p_planned_amount < 0.15 THEN 0.60
    WHEN ABS(ABS(p_fragment_amount) - p_planned_amount) / p_planned_amount < 0.30 THEN 0.30
    ELSE 0.00
  END::numeric
$function$;

CREATE OR REPLACE FUNCTION public.frequency_match(p_transaction_date date, p_card_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  v_fragment_month date;
BEGIN
  v_fragment_month := date_trunc('month', p_transaction_date)::date;

  IF is_card_active_in_month(p_card_id, v_fragment_month) THEN
    RETURN 1.00;
  ELSE
    RETURN 0.00;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_match_confidence(p_fragment_id uuid, p_card_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  v_fragment    fragments%ROWTYPE;
  v_card        cards%ROWTYPE;
  v_planned     numeric;
  v_w_name      numeric;
  v_w_amount    numeric;
  v_w_freq      numeric;
  v_min_thresh  numeric;
  v_name_sim    numeric;
  v_amount_sim  numeric;
  v_freq_sim    numeric;
  v_score       numeric;
BEGIN
  SELECT * INTO v_fragment FROM fragments WHERE id = p_fragment_id;
  IF NOT FOUND THEN RETURN 0; END IF;

  SELECT * INTO v_card FROM cards WHERE id = p_card_id;
  IF NOT FOUND THEN RETURN 0; END IF;
  IF v_card.deleted_at IS NOT NULL THEN RETURN 0; END IF;

  -- Gewichte aus app_config (mit Fallback auf Defaults)
  SELECT (value::text)::numeric INTO v_w_name
    FROM app_config WHERE key = 'confidence.weight_name';
  SELECT (value::text)::numeric INTO v_w_amount
    FROM app_config WHERE key = 'confidence.weight_amount';
  SELECT (value::text)::numeric INTO v_w_freq
    FROM app_config WHERE key = 'confidence.weight_frequency';
  SELECT (value::text)::numeric INTO v_min_thresh
    FROM app_config WHERE key = 'confidence.minimum_match_threshold';

  v_w_name     := COALESCE(v_w_name,     0.50);
  v_w_amount   := COALESCE(v_w_amount,   0.30);
  v_w_freq     := COALESCE(v_w_freq,     0.20);
  v_min_thresh := COALESCE(v_min_thresh, 0.20);

  -- Karten-Plan zum Zeitpunkt des Fragments
  v_planned := get_planned_amount_for_month(
    p_card_id,
    date_trunc('month', v_fragment.transaction_date)::date
  );

  -- Drei Komponenten berechnen
  v_name_sim   := name_similarity(v_fragment.description, v_card.name);
  v_amount_sim := amount_match(v_fragment.amount, v_planned);
  v_freq_sim   := frequency_match(v_fragment.transaction_date, p_card_id);

  -- Gewichteter Score
  v_score := v_w_name * v_name_sim
           + v_w_amount * v_amount_sim
           + v_w_freq * v_freq_sim;

  -- Cut-Off: schwache Matches auf 0 zurücksetzen
  IF v_score < v_min_thresh THEN
    RETURN 0;
  END IF;

  RETURN round(v_score, 4);
END;
$function$;


-- ───────────────────────────────────────────────────────────────────────────
-- 8 · Funktionen — die Rechenfunktionen (Design-Doku §4)
--
-- ⚠️ HIER LIEGT DER PRÜFANKER. Jeder Eingriff braucht die Fähigkeit
-- `db-eingriff`: Probe auf der Übungs-Datenbank, Anker-Messung vorher und
-- nachher in ALLEN zwölf Monaten (Arbeitsregel 20/21).
--
-- v2-13 (BF-4): Der Split-Anteil wird genau EINMAL angewandt — in
-- `calculate_card_amount_for_month`, und dort nur auf Plan/Anpassung.
-- Fragment-Summen sind bereits der überwiesene Anteil (Stolperfalle 11).
-- `calculate_planned_sparrate_for_month` rechnet auf dem Roh-Plan und wendet
-- ihn deshalb weiterhin selbst an — das ist die einzige Ausnahme.
--
-- BEIDE Sparrate-Funktionen schleifen OHNE Typ-Filter über alle Karten des
-- Monats (Befund D1). Eine Kategorie darf deshalb nie eine `cards`-Zeile
-- werden — sie würde zusätzlich zu ihren Kindern summiert.
--
-- Gerundet wird EINMAL ganz am Schluss über alles. Wer über Teilmengen
-- aggregiert und je Teilmenge rundet, landet daneben (Kategorien-Record
-- Teil C1, LL-24).
-- ───────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.calculate_card_amount_for_month(p_card_id uuid, p_month date)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  v_card           cards%ROWTYPE;
  v_state          card_monthly_states%ROWTYPE;
  v_planned        numeric;
  v_base_amount    numeric;
  v_fragment_net   numeric;   -- v2-11 (BF-5): Summe MIT Vorzeichen
  v_fragment_sum   numeric;   -- daraus abgeleitet: Betrag in Kartenart-Richtung
  v_fragment_count int;
BEGIN
  SELECT * INTO v_card FROM cards WHERE id = p_card_id;
  IF NOT FOUND THEN RETURN 0; END IF;
  IF NOT is_card_active_in_month(p_card_id, p_month) THEN RETURN 0; END IF;

  SELECT * INTO v_state
  FROM card_monthly_states
  WHERE card_id = p_card_id AND month = p_month;

  v_planned := get_planned_amount_for_month(p_card_id, p_month);
  IF v_planned IS NULL THEN
    v_planned := 0;
  END IF;

  -- Fragment-Summe — Transfer-Fragmente jeder Art ausgeschlossen
  -- (v2-04 ③: IS NULL; Defense-in-Depth zusätzlich zu OQ-B + Link-Trigger)
  -- v2-11 (BF-5): SUM(f.amount) statt SUM(ABS(f.amount)). Gutschriften und
  -- Ausgaben werden dadurch verrechnet statt addiert.
  SELECT COALESCE(SUM(f.amount), 0), COUNT(*)
  INTO v_fragment_net, v_fragment_count
  FROM card_fragment_links l
  JOIN fragments f ON f.id = l.fragment_id
  WHERE l.card_id = p_card_id
    AND l.month   = p_month
    AND f.transfer_type IS NULL;

  -- v2-11 (BF-5): Richtung EINMAL je Kartenart. Ergebnis ist der Betrag in der
  -- natürlichen Richtung der Karte (Kosten als positive Zahl) — genau die
  -- Konvention, die calculate_sparrate_for_month erwartet.
  -- Kein GREATEST(…, 0): E2 (05.08.2026) verlangt ausdrücklich KEINE Kappung.
  --
  -- v2-13 (BF-4): Diese Summe bleibt UNANGETASTET. Sie ist der real überwiesene
  -- Betrag und damit bereits der eigene Anteil — ein zweiter Abzug wäre genau
  -- der Fehler, den dieser Sprint behebt.
  v_fragment_sum := CASE v_card.type
    WHEN 'INCOME' THEN  v_fragment_net    -- Netto-Zufluss
    ELSE               -v_fragment_net    -- Netto-Abfluss (FIXED_COST, BUDGET)
  END;

  v_base_amount := COALESCE(v_state.adjusted_amount, v_planned);

  -- v2-13 (BF-4), E1: Plan und Anpassung sind die HAUSHALTS-Rechnung. Genau hier
  -- verlässt der Betrag den Haushalt und wird zur eigenen Zahl — also genau hier
  -- wird der Anteil angewandt, und nirgends sonst.
  --
  -- get_split_factor NUR bei GEMEINSAM aufrufen: die Funktion wird pro Karte und
  -- Monat ausgewertet (get_year_deviation_drivers ruft sie 12 × N mal auf), und
  -- bei ICH-Karten wäre das Ergebnis ohnehin wirkungslos.
  --
  -- get_split_factor ist die bekannte Ausnahme mit explizitem p_user_id
  -- (CLAUDE.md §6 Stolperfalle 4) — der Wert kommt aus der Kartenzeile selbst,
  -- nicht aus auth.uid(), damit die Funktion auch für Service-Rollen-Aufrufe und
  -- im Aggregat über fremde Karten korrekt bleibt.
  IF v_card.attribution = 'GEMEINSAM' THEN
    v_base_amount := v_base_amount * get_split_factor(v_card.user_id, p_month);
  END IF;

  RETURN CASE v_card.type
    WHEN 'FIXED_COST' THEN
      CASE
        WHEN v_fragment_count > 0                    THEN v_fragment_sum
        WHEN COALESCE(v_state.manually_paid, false)  THEN v_base_amount
        ELSE                                              v_base_amount
      END
    WHEN 'INCOME' THEN
      CASE
        WHEN v_fragment_count > 0                    THEN v_fragment_sum
        WHEN COALESCE(v_state.manually_paid, false)  THEN v_base_amount
        ELSE                                              v_base_amount
      END
    -- BUDGET kann per CHECK-Constraint `budget_never_shared` nie GEMEINSAM sein.
    -- Der Vergleich Fragment ↔ Plan bleibt damit faktisch unberührt; wäre es je
    -- anders, stünden nach dem Block oben beide Seiten korrekt im Anteils-Raum.
    WHEN 'BUDGET' THEN
      CASE
        WHEN v_fragment_count > 0 AND v_fragment_sum > v_base_amount
                                                     THEN v_fragment_sum
        WHEN COALESCE(v_state.manually_paid, false) AND v_fragment_count > 0
                                                     THEN v_fragment_sum
        WHEN COALESCE(v_state.manually_paid, false) AND v_fragment_count = 0
                                                     THEN 0
        WHEN v_fragment_count > 0                    THEN v_base_amount
        ELSE                                              v_base_amount
      END
  END;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_sparrate_for_month(p_user_id uuid, p_month date)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  v_net_base           numeric;
  v_sum_income_cards   numeric := 0;
  v_sum_fixed_cards    numeric := 0;
  v_sum_budget_cards   numeric := 0;
  v_card_amount        numeric;
  v_card               cards%ROWTYPE;
BEGIN
  v_net_base := get_net_monthly_for_month(p_user_id, 'ICH', p_month);
  IF v_net_base IS NULL THEN
    RETURN NULL;
  END IF;

  -- Snapshot-Integrität §2.1: Aggregation IGNORIERT cards.deleted_at.
  -- Hide ist UI-Concern, nicht Berechnungs-Concern.
  FOR v_card IN
    SELECT *
    FROM cards
    WHERE user_id = p_user_id
      AND first_active_month <= p_month
      AND (last_active_month IS NULL OR last_active_month >= p_month)
  LOOP
    IF NOT is_card_active_in_month(v_card.id, p_month) THEN
      CONTINUE;
    END IF;

    -- v2-13 (BF-4): liefert bei GEMEINSAM bereits den eigenen Anteil.
    -- KEINE Multiplikation mit dem Split-Faktor mehr — genau die war der Fehler.
    v_card_amount := calculate_card_amount_for_month(v_card.id, p_month);

    IF v_card.type = 'INCOME' THEN
      v_sum_income_cards := v_sum_income_cards + v_card_amount;
    ELSIF v_card.type = 'FIXED_COST' THEN
      v_sum_fixed_cards  := v_sum_fixed_cards + v_card_amount;
    ELSIF v_card.type = 'BUDGET' THEN
      v_sum_budget_cards := v_sum_budget_cards + v_card_amount;
    END IF;
  END LOOP;

  RETURN round(
    (v_net_base + v_sum_income_cards) - v_sum_fixed_cards - v_sum_budget_cards,
    2
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_planned_sparrate_for_month(p_user_id uuid, p_month date)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  v_month              date;
  v_net_base           numeric;
  v_split_factor       numeric;
  v_sum_income_cards   numeric := 0;
  v_sum_fixed_cards    numeric := 0;
  v_sum_budget_cards   numeric := 0;
  v_card_amount        numeric;
  v_adjusted           numeric;
  v_planned            numeric;
  v_card               cards%ROWTYPE;
BEGIN
  v_month := date_trunc('month', p_month)::date;

  v_net_base := get_net_monthly_for_month(p_user_id, 'ICH', v_month);
  IF v_net_base IS NULL THEN
    RETURN NULL;
  END IF;

  v_split_factor := get_split_factor(p_user_id, v_month);

  -- Snapshot-Integrität §2.1: Aggregation IGNORIERT cards.deleted_at.
  FOR v_card IN
    SELECT *
    FROM cards
    WHERE user_id = p_user_id
      AND first_active_month <= v_month
      AND (last_active_month IS NULL OR last_active_month >= v_month)
  LOOP
    IF NOT is_card_active_in_month(v_card.id, v_month) THEN
      CONTINUE;
    END IF;

    SELECT adjusted_amount INTO v_adjusted
    FROM card_monthly_states
    WHERE card_id = v_card.id AND month = v_month;

    v_planned := get_planned_amount_for_month(v_card.id, v_month);

    v_card_amount := COALESCE(v_adjusted, v_planned, 0);

    IF v_card.attribution = 'GEMEINSAM' THEN
      v_card_amount := v_card_amount * v_split_factor;
    END IF;

    IF v_card.type = 'INCOME' THEN
      v_sum_income_cards := v_sum_income_cards + v_card_amount;
    ELSIF v_card.type = 'FIXED_COST' THEN
      v_sum_fixed_cards := v_sum_fixed_cards + v_card_amount;
    ELSIF v_card.type = 'BUDGET' THEN
      v_sum_budget_cards := v_sum_budget_cards + v_card_amount;
    END IF;
  END LOOP;

  RETURN round(
    (v_net_base + v_sum_income_cards) - v_sum_fixed_cards - v_sum_budget_cards,
    2
  );
END;
$function$;


-- ───────────────────────────────────────────────────────────────────────────
-- 9 · Funktionen — Abweichungs-Treiber (B2, v2-06 / v2-13)
--
-- B2-Invariante: Σ delta = Ist-Sparrate − Plan-Sparrate, je Monat. Läuft sie
-- auseinander, ist das der erste Verdacht bei jedem Treiber-Bug.
-- Achtung: rundet `delta` JE KARTE, während die Sparrate erst am Ende rundet
-- (Befund D13) — eine zweite Rundungsstufe auf derselben Invariante.
-- ───────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_year_deviation_drivers(p_year integer, p_limit integer DEFAULT 3)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_result  jsonb;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Nicht authentifiziert' USING ERRCODE = '28000';
  END IF;

  IF p_year IS NULL OR p_year < 1900 OR p_year > 2999 THEN
    RAISE EXCEPTION 'p_year ausserhalb des gueltigen Bereichs: %', p_year
      USING ERRCODE = '22023';
  END IF;

  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 50 THEN
    RAISE EXCEPTION 'p_limit muss zwischen 1 und 50 liegen: %', p_limit
      USING ERRCODE = '22023';
  END IF;

  WITH months AS (
    SELECT gs.i                            AS month_index,
           make_date(p_year, gs.i + 1, 1)  AS month
    FROM generate_series(0, 11) AS gs(i)
  ),
  months_split AS (
    -- Split-Faktor einmal pro Monat (nicht pro Karte) auflösen.
    SELECT m.month_index,
           m.month,
           get_split_factor(v_user_id, m.month) AS split_factor
    FROM months m
  ),
  card_month AS (
    -- Vorfilter über die Aktiv-Fenster-Spalten (Index-freundlich, analog zur
    -- Schleife in calculate_sparrate_for_month), Feinprüfung über die RPC
    -- (Frequenz-Raster QUARTERLY/SEMIANNUAL/ANNUAL/ONCE).
    SELECT m.month_index,
           m.month,
           c.id                AS card_id,
           c.name              AS card_name,
           c.type::text        AS card_type,
           c.attribution::text AS attribution,
           CASE WHEN c.attribution = 'GEMEINSAM' THEN m.split_factor ELSE 1 END AS share,
           CASE WHEN c.type = 'INCOME' THEN 1 ELSE -1 END                       AS sparrate_sign,
           calculate_card_amount_for_month(c.id, m.month) AS ist,
           get_effective_plan_for_month(c.id, m.month)    AS plan
    FROM months_split m
    JOIN cards c
      ON c.user_id = v_user_id                      -- Defense-in-Depth zusätzlich zu RLS
     AND c.first_active_month <= m.month
     AND (c.last_active_month IS NULL OR c.last_active_month >= m.month)
    WHERE is_card_active_in_month(c.id, m.month)
  ),
  scored AS (
    -- v2-13 (BF-4): `share` steht INNEN am Plan-Teil, nicht mehr außen vor der
    -- Klammer. `ist` ist bereits anteilig, `plan` ist der Haushaltsbetrag — eine
    -- gemischte Klammer, die einen Faktor außen nicht mehr verträgt.
    -- Wächter: B2-Invariante Σ delta = Ist-Sparrate − Plan-Sparrate.
    SELECT cm.*,
           round(
             cm.sparrate_sign * (COALESCE(cm.ist, 0) - COALESCE(cm.plan, 0) * cm.share),
             2
           ) AS delta
    FROM card_month cm
  ),
  ranked AS (
    -- Ranking |delta| absteigend; Tiebreaker Kartenname aufsteigend (de-facto
    -- deterministisch, analog zur §11-Mehrfach-Match-Regel aus Sprint 8).
    SELECT s.*,
           row_number() OVER (
             PARTITION BY s.month_index
             ORDER BY abs(s.delta) DESC, s.card_name ASC
           ) AS rn
    FROM scored s
    WHERE s.delta <> 0
  ),
  per_month AS (
    SELECT r.month_index,
           jsonb_agg(
             jsonb_build_object(
               'card_id',     r.card_id,
               'card_name',   r.card_name,
               'card_type',   r.card_type,
               'attribution', r.attribution,
               'ist',         round(COALESCE(r.ist, 0), 2),
               'plan',        round(COALESCE(r.plan, 0), 2),
               'share',       round(r.share, 6),
               'delta',       r.delta
             )
             ORDER BY r.rn
           ) AS drivers
    FROM ranked r
    WHERE r.rn <= p_limit
    GROUP BY r.month_index
  )
  SELECT jsonb_agg(
           jsonb_build_object(
             'month_index', m.month_index,
             'month',       to_char(m.month, 'YYYY-MM-DD'),
             'drivers',     COALESCE(pm.drivers, '[]'::jsonb)
           )
           ORDER BY m.month_index
         )
    INTO v_result
    FROM months m
    LEFT JOIN per_month pm ON pm.month_index = m.month_index;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$function$;


-- ───────────────────────────────────────────────────────────────────────────
-- 10 · Funktionen — Karten-Lebenszyklus (v2-05, Drei-Verben-Modell M1)
--
-- Befund D7: `cleanup_expired_card_trash` filtert hart auf entity_type='CARD'.
-- Ein anderer Entitätstyp im Papierkorb würde nie vollzogen und nie entfernt.
-- Die Aufbewahrung liegt bei 60 Sekunden (app_config, unten).
-- ───────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.schedule_deletion(p_entity_type deleted_entity_type, p_entity_id uuid, p_payload jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_retention_seconds int;
  v_id uuid;
BEGIN
  -- Retention aus app_config holen (Default 60 wenn fehlt)
  SELECT (value::text)::int INTO v_retention_seconds
  FROM app_config
  WHERE key = 'trash.retention_seconds';

  IF v_retention_seconds IS NULL THEN
    v_retention_seconds := 60;
  END IF;

  -- Trash-Zeile anlegen
  INSERT INTO deleted_entities (user_id, entity_type, entity_id, payload, expires_at)
  VALUES (
    auth.uid(),
    p_entity_type,
    p_entity_id,
    p_payload,
    now() + (v_retention_seconds || ' seconds')::interval
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.restore_deletion(p_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_row deleted_entities%ROWTYPE;
BEGIN
  -- Zeile holen mit Row-Lock, damit kein Race mit dem Cleanup-Job
  SELECT * INTO v_row FROM deleted_entities
  WHERE id = p_id AND user_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Trash-Zeile % nicht gefunden oder nicht autorisiert', p_id;
  END IF;

  IF v_row.restored_at IS NOT NULL THEN
    RAISE EXCEPTION 'Trash-Zeile % wurde bereits wiederhergestellt', p_id;
  END IF;

  IF v_row.expires_at < now() THEN
    RAISE EXCEPTION 'Trash-Zeile % ist bereits abgelaufen — Rückgängig nicht mehr möglich', p_id;
  END IF;

  UPDATE deleted_entities
  SET restored_at = now()
  WHERE id = p_id;

  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.card_delete_gate(p_card_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_card    cards%ROWTYPE;
  v_reasons text[] := '{}';
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized' USING ERRCODE = '28000';
  END IF;

  SELECT * INTO v_card FROM cards WHERE id = p_card_id AND user_id = v_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'card not found or not owned: %', p_card_id USING ERRCODE = '42704';
  END IF;

  IF EXISTS (SELECT 1 FROM card_fragment_links WHERE card_id = p_card_id) THEN
    v_reasons := array_append(v_reasons, 'HAS_LINKS');
  END IF;
  IF EXISTS (SELECT 1 FROM card_monthly_states WHERE card_id = p_card_id) THEN
    v_reasons := array_append(v_reasons, 'HAS_STATES');
  END IF;
  IF v_card.first_active_month < date_trunc('month', now())::date THEN
    v_reasons := array_append(v_reasons, 'HAS_PAST_PLAN');
  END IF;

  RETURN jsonb_build_object(
    'deletable', cardinality(v_reasons) = 0,
    'reasons',   to_jsonb(v_reasons)
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_card_direct(p_name text, p_type card_type, p_attribution card_attribution, p_frequency card_frequency, p_first_active_month date, p_last_active_month date DEFAULT NULL::date, p_planned_amount numeric DEFAULT NULL::numeric)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_card_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentifizierung erforderlich' USING ERRCODE = '28000';
  END IF;

  IF p_name IS NULL OR length(trim(p_name)) = 0 THEN
    RAISE EXCEPTION 'p_name darf nicht leer sein' USING ERRCODE = '22023';
  END IF;

  IF p_planned_amount IS NULL OR p_planned_amount <= 0 THEN
    RAISE EXCEPTION 'p_planned_amount muss > 0 sein, war: %', p_planned_amount
      USING ERRCODE = '22023';
  END IF;

  IF p_first_active_month IS NULL
     OR p_first_active_month <> date_trunc('month', p_first_active_month)::date THEN
    RAISE EXCEPTION 'p_first_active_month muss erster des Monats sein, war: %', p_first_active_month
      USING ERRCODE = '22023';
  END IF;

  IF p_last_active_month IS NOT NULL
     AND p_last_active_month <> date_trunc('month', p_last_active_month)::date THEN
    RAISE EXCEPTION 'p_last_active_month muss erster des Monats sein, war: %', p_last_active_month
      USING ERRCODE = '22023';
  END IF;

  IF p_last_active_month IS NOT NULL
     AND p_last_active_month < p_first_active_month THEN
    RAISE EXCEPTION 'p_last_active_month (%) muss >= p_first_active_month (%) sein',
      p_last_active_month, p_first_active_month
      USING ERRCODE = '22023';
  END IF;

  IF p_frequency = 'ONCE'
     AND (p_last_active_month IS NULL OR p_last_active_month <> p_first_active_month) THEN
    RAISE EXCEPTION 'ONCE-Karten verlangen p_last_active_month = p_first_active_month, war: first=%, last=%',
      p_first_active_month, p_last_active_month
      USING ERRCODE = '22023';
  END IF;

  IF p_type = 'BUDGET' AND p_attribution <> 'ICH' THEN
    RAISE EXCEPTION 'BUDGET-Karten verlangen attribution=ICH, war: %', p_attribution
      USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.cards (
    user_id, name, type, attribution, frequency, first_active_month, last_active_month
  )
  VALUES (
    v_user_id, trim(p_name), p_type, p_attribution, p_frequency,
    p_first_active_month, p_last_active_month
  )
  RETURNING id INTO v_card_id;

  INSERT INTO public.card_planned_timeline (
    user_id, card_id, effective_month, planned_amount
  )
  VALUES (
    v_user_id, v_card_id, p_first_active_month, p_planned_amount
  );

  RETURN v_card_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_card_from_fragment(p_name text, p_type card_type, p_attribution card_attribution, p_frequency card_frequency, p_first_active_month date, p_last_active_month date, p_planned_amount numeric, p_fragment_id uuid, p_link_month date)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id          uuid := auth.uid();
  v_card_id          uuid;
  v_fragment_user_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentifizierung erforderlich' USING ERRCODE = '28000';
  END IF;

  IF p_name IS NULL OR length(trim(p_name)) = 0 THEN
    RAISE EXCEPTION 'p_name darf nicht leer sein' USING ERRCODE = '22023';
  END IF;

  IF p_planned_amount IS NULL OR p_planned_amount <= 0 THEN
    RAISE EXCEPTION 'p_planned_amount muss > 0 sein, war: %', p_planned_amount
      USING ERRCODE = '22023';
  END IF;

  IF p_first_active_month IS NULL
     OR p_first_active_month <> date_trunc('month', p_first_active_month)::date THEN
    RAISE EXCEPTION 'p_first_active_month muss erster des Monats sein, war: %', p_first_active_month
      USING ERRCODE = '22023';
  END IF;

  IF p_last_active_month IS NOT NULL
     AND p_last_active_month <> date_trunc('month', p_last_active_month)::date THEN
    RAISE EXCEPTION 'p_last_active_month muss erster des Monats sein, war: %', p_last_active_month
      USING ERRCODE = '22023';
  END IF;

  IF p_last_active_month IS NOT NULL
     AND p_last_active_month < p_first_active_month THEN
    RAISE EXCEPTION 'p_last_active_month (%) muss >= p_first_active_month (%) sein',
      p_last_active_month, p_first_active_month
      USING ERRCODE = '22023';
  END IF;

  IF p_frequency = 'ONCE'
     AND (p_last_active_month IS NULL OR p_last_active_month <> p_first_active_month) THEN
    RAISE EXCEPTION 'ONCE-Karten verlangen p_last_active_month = p_first_active_month, war: first=%, last=%',
      p_first_active_month, p_last_active_month
      USING ERRCODE = '22023';
  END IF;

  IF p_type = 'BUDGET' AND p_attribution <> 'ICH' THEN
    RAISE EXCEPTION 'BUDGET-Karten verlangen attribution=ICH, war: %', p_attribution
      USING ERRCODE = '22023';
  END IF;

  IF p_fragment_id IS NULL THEN
    RAISE EXCEPTION 'p_fragment_id darf nicht NULL sein' USING ERRCODE = '22023';
  END IF;

  IF p_link_month IS NULL
     OR p_link_month <> date_trunc('month', p_link_month)::date THEN
    RAISE EXCEPTION 'p_link_month muss erster des Monats sein, war: %', p_link_month
      USING ERRCODE = '22023';
  END IF;

  SELECT user_id INTO v_fragment_user_id
    FROM public.fragments
   WHERE id = p_fragment_id;

  IF v_fragment_user_id IS NULL THEN
    RAISE EXCEPTION 'Fragment % nicht gefunden oder nicht zugänglich', p_fragment_id
      USING ERRCODE = '42704';
  END IF;

  IF v_fragment_user_id <> v_user_id THEN
    RAISE EXCEPTION 'Fragment % gehört nicht dem aktuellen User', p_fragment_id
      USING ERRCODE = '42501';
  END IF;

  IF EXISTS (SELECT 1 FROM public.card_fragment_links WHERE fragment_id = p_fragment_id) THEN
    RAISE EXCEPTION 'Fragment % ist bereits einer Karte zugeordnet', p_fragment_id
      USING ERRCODE = '23505';
  END IF;

  INSERT INTO public.cards (
    user_id, name, type, attribution, frequency, first_active_month, last_active_month
  )
  VALUES (
    v_user_id, trim(p_name), p_type, p_attribution, p_frequency,
    p_first_active_month, p_last_active_month
  )
  RETURNING id INTO v_card_id;

  INSERT INTO public.card_planned_timeline (
    user_id, card_id, effective_month, planned_amount
  )
  VALUES (
    v_user_id, v_card_id, p_first_active_month, p_planned_amount
  );

  INSERT INTO public.card_fragment_links (
    user_id, card_id, fragment_id, month, origin
  )
  VALUES (
    v_user_id, v_card_id, p_fragment_id, p_link_month, 'MANUAL_DROP'::link_origin
  );

  RETURN v_card_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.end_card(p_card_id uuid, p_last_month date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_card    cards%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized' USING ERRCODE = '28000';
  END IF;
  IF p_card_id IS NULL THEN
    RAISE EXCEPTION 'p_card_id darf nicht NULL sein' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_card
    FROM cards
   WHERE id = p_card_id AND user_id = v_user_id AND deleted_at IS NULL
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'card not found or not owned: %', p_card_id USING ERRCODE = '42704';
  END IF;

  -- ONCE-Karten haben per Constraint first=last — Beenden ist dort sinnlos.
  IF v_card.frequency = 'ONCE' THEN
    RAISE EXCEPTION 'ONCE-Karten haben ein festes Ende (first=last) und können nicht beendet werden'
      USING ERRCODE = '22023';
  END IF;

  -- p_last_month NULL = Ende aufheben (Karte läuft wieder unbefristet).
  IF p_last_month IS NOT NULL THEN
    IF p_last_month <> date_trunc('month', p_last_month)::date THEN
      RAISE EXCEPTION 'p_last_month muss erster des Monats sein, war: %', p_last_month
        USING ERRCODE = '22023';
    END IF;
    IF p_last_month < v_card.first_active_month THEN
      RAISE EXCEPTION 'p_last_month (%) muss >= first_active_month (%) sein',
        p_last_month, v_card.first_active_month USING ERRCODE = '22023';
    END IF;
  END IF;

  UPDATE cards SET last_active_month = p_last_month WHERE id = p_card_id;

  RETURN jsonb_build_object('card_id', p_card_id, 'last_active_month', p_last_month);
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_card(p_card_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id  uuid := auth.uid();
  v_card     cards%ROWTYPE;
  v_gate     jsonb;
  v_trash_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized' USING ERRCODE = '28000';
  END IF;

  SELECT * INTO v_card
    FROM cards
   WHERE id = p_card_id AND user_id = v_user_id AND deleted_at IS NULL
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'card not found, not owned or already im papierkorb: %', p_card_id
      USING ERRCODE = '42704';
  END IF;

  v_gate := card_delete_gate(p_card_id);
  IF NOT (v_gate->>'deletable')::boolean THEN
    RAISE EXCEPTION 'Lösch-Gate verletzt für Karte %: %', v_card.name, v_gate->>'reasons'
      USING ERRCODE = '23514';
  END IF;

  UPDATE cards SET deleted_at = now() WHERE id = p_card_id;
  v_trash_id := schedule_deletion('CARD', p_card_id, to_jsonb(v_card));

  RETURN jsonb_build_object(
    'card_id',    p_card_id,
    'trash_id',   v_trash_id,
    'expires_at', (SELECT expires_at FROM deleted_entities WHERE id = v_trash_id)
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.restore_card(p_card_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id  uuid := auth.uid();
  v_trash_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized' USING ERRCODE = '28000';
  END IF;

  SELECT id INTO v_trash_id
    FROM deleted_entities
   WHERE user_id = v_user_id
     AND entity_type = 'CARD'
     AND entity_id = p_card_id
     AND restored_at IS NULL
   ORDER BY deleted_at DESC
   LIMIT 1;

  IF v_trash_id IS NULL THEN
    RAISE EXCEPTION 'Kein offener Papierkorb-Eintrag für Karte %', p_card_id
      USING ERRCODE = '42704';
  END IF;

  PERFORM restore_deletion(v_trash_id);

  UPDATE cards SET deleted_at = NULL
   WHERE id = p_card_id AND user_id = v_user_id;

  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_card_trash()
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_n       int;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized' USING ERRCODE = '28000';
  END IF;

  WITH expired AS (
    SELECT de.id AS trash_id, de.entity_id
      FROM deleted_entities de
     WHERE de.user_id = v_user_id
       AND de.entity_type = 'CARD'
       AND de.restored_at IS NULL
       AND de.expires_at < now()
  ),
  del_cards AS (
    DELETE FROM cards c
     USING expired e
     WHERE c.id = e.entity_id
       AND c.user_id = v_user_id
       AND c.deleted_at IS NOT NULL
    RETURNING c.id
  ),
  del_trash AS (
    DELETE FROM deleted_entities de
     USING expired e
     WHERE de.id = e.trash_id
    RETURNING de.id
  )
  SELECT count(*) INTO v_n FROM del_cards;

  RETURN v_n;
END;
$function$;

CREATE OR REPLACE FUNCTION public.toggle_card_manually_paid(p_card_id uuid, p_month date)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id          uuid := auth.uid();
  v_card             cards%ROWTYPE;
  v_month_normalized date  := date_trunc('month', p_month)::date;
  v_state            card_monthly_states%ROWTYPE;
  v_new_value        boolean;
BEGIN
  -- Auth ---------------------------------------------------------------
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized' USING ERRCODE = '28000';
  END IF;

  IF p_card_id IS NULL OR p_month IS NULL THEN
    RAISE EXCEPTION 'p_card_id und p_month dürfen nicht NULL sein'
      USING ERRCODE = '22023';
  END IF;

  -- Card-Ownership ----------------------------------------------------
  SELECT * INTO v_card
    FROM cards
   WHERE id = p_card_id
     AND user_id = v_user_id
     AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'card not found or not owned: %', p_card_id
      USING ERRCODE = '42704';
  END IF;

  -- Active-Range-Check (inkl. Frequenz via is_card_active_in_month) ----
  IF NOT is_card_active_in_month(p_card_id, v_month_normalized) THEN
    RAISE EXCEPTION 'month outside card active range: card=% month=%',
      p_card_id, v_month_normalized
      USING ERRCODE = '22023';
  END IF;

  -- Existierende State-Row holen
  SELECT * INTO v_state
    FROM card_monthly_states
   WHERE card_id = p_card_id
     AND month   = v_month_normalized;

  -- Eingefroren-Schutz: closed_at gesetzt → kein Toggle
  IF FOUND AND v_state.closed_at IS NOT NULL THEN
    RAISE EXCEPTION 'month is closed (frozen): card=% month=% closed_at=%',
      p_card_id, v_month_normalized, v_state.closed_at
      USING ERRCODE = '55000';  -- object_not_in_prerequisite_state
  END IF;

  -- Toggle / Insert ---------------------------------------------------
  IF FOUND THEN
    v_new_value := NOT v_state.manually_paid;

    UPDATE card_monthly_states
       SET manually_paid = v_new_value,
           updated_at    = now()
     WHERE card_id = p_card_id
       AND month   = v_month_normalized;
  ELSE
    v_new_value := true;

    INSERT INTO card_monthly_states (user_id, card_id, month, manually_paid)
    VALUES (v_user_id, p_card_id, v_month_normalized, true);
  END IF;

  RETURN v_new_value;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_fragment_asset_reallocation(p_fragment_id uuid, p_set boolean DEFAULT true)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id  uuid := auth.uid();
  v_fragment fragments%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentifizierung erforderlich' USING ERRCODE = '28000';
  END IF;

  IF p_fragment_id IS NULL THEN
    RAISE EXCEPTION 'p_fragment_id darf nicht NULL sein' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_fragment
    FROM fragments
   WHERE id = p_fragment_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Fragment % nicht gefunden oder nicht zugänglich', p_fragment_id
      USING ERRCODE = '42704';
  END IF;

  IF v_fragment.user_id <> v_user_id THEN
    RAISE EXCEPTION 'Fragment % gehört nicht dem aktuellen User', p_fragment_id
      USING ERRCODE = '42501';
  END IF;

  IF p_set THEN
    IF EXISTS (SELECT 1 FROM card_fragment_links WHERE fragment_id = p_fragment_id) THEN
      RAISE EXCEPTION 'Fragment % ist einer Karte zugeordnet — Zuordnung zuerst lösen (OQ-B)',
        p_fragment_id USING ERRCODE = '23514';
    END IF;

    UPDATE fragments
       SET transfer_type     = 'ASSET_REALLOCATION',
           suggested_card_id = NULL,
           confidence        = NULL
     WHERE id = p_fragment_id;
  ELSE
    IF v_fragment.transfer_type IS DISTINCT FROM 'ASSET_REALLOCATION' THEN
      RAISE EXCEPTION 'Fragment % trägt keine ASSET_REALLOCATION-Markierung (aktuell: %)',
        p_fragment_id, COALESCE(v_fragment.transfer_type, 'NULL')
        USING ERRCODE = '22023';
    END IF;

    UPDATE fragments
       SET transfer_type = NULL
     WHERE id = p_fragment_id;
  END IF;

  RETURN jsonb_build_object(
    'fragment_id',   p_fragment_id,
    'transfer_type', (SELECT transfer_type FROM fragments WHERE id = p_fragment_id)
  );
END;
$function$;


-- ───────────────────────────────────────────────────────────────────────────
-- 11 · Funktionen — CSV-Import / Distiller (Sprint 8/9, v2-04)
--
-- Befund D1, zweite Hälfte: Der Auto-Absorptions-Kandidatenloop hat als
-- einzigen Filter `c.deleted_at IS NULL` — ohne Typ-Filter. Eine Kategorie als
-- `cards`-Zeile bekäme also auch Fragmente auto-absorbiert.
-- ───────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.process_csv_import(p_rows jsonb, p_format_hint text DEFAULT 'DKB'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  v_user_id           uuid := auth.uid();
  v_own_ibans         text[];
  v_auto_threshold    numeric;
  v_badge_threshold   numeric;
  v_row               record;
  v_amount_fixed      text;
  v_hash_input        text;
  v_hash              text;
  v_iban              text;
  v_fragment_id       uuid;
  v_was_inserted      boolean;
  v_is_internal       boolean;
  v_is_kk_transfer    boolean;
  v_unlinked_rows     int;
  v_best_card_id      uuid;
  v_best_score        numeric;
  v_inserted          int := 0;
  v_skipped           int := 0;
  v_iban_backfilled   int := 0;
  v_auto_absorbed     int := 0;
  v_internal_transfers int := 0;
  v_links_removed     int := 0;
  v_fragment_ids      uuid[] := ARRAY[]::uuid[];
  v_link_month        date;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized' USING ERRCODE = '28000';
  END IF;

  IF p_rows IS NULL OR jsonb_typeof(p_rows) <> 'array' THEN
    RAISE EXCEPTION 'p_rows muss ein JSONB-Array sein' USING ERRCODE = '22023';
  END IF;

  -- v2-04 ①: 'DKB_VISA' als drittes Format
  IF p_format_hint IS NOT NULL
     AND p_format_hint NOT IN ('DKB', 'CORTAL_CONSORS', 'DKB_VISA') THEN
    RAISE EXCEPTION 'p_format_hint unbekannt: %', p_format_hint
      USING ERRCODE = '22023';
  END IF;

  SELECT (value::text)::numeric INTO v_auto_threshold
    FROM app_config WHERE key = 'confidence.auto_absorption_threshold';
  SELECT (value::text)::numeric INTO v_badge_threshold
    FROM app_config WHERE key = 'confidence.badge_threshold';
  v_auto_threshold  := COALESCE(v_auto_threshold,  0.95);
  v_badge_threshold := COALESCE(v_badge_threshold, 0.60);

  SELECT own_ibans INTO v_own_ibans
    FROM profiles WHERE user_id = v_user_id;
  v_own_ibans := COALESCE(v_own_ibans, ARRAY[]::text[]);

  -- v2-04 ④: Ordinalität + Vorkommens-Index byte-identischer Zeilen
  FOR v_row IN
    SELECT (e.elem->>'transaction_date')::date AS transaction_date,
           (e.elem->>'amount')::numeric        AS amount,
           (e.elem->>'description')            AS description,
           (e.elem->>'counterparty_iban')      AS counterparty_iban,
           row_number() OVER (
             PARTITION BY (e.elem->>'transaction_date')::date,
                          (e.elem->>'amount')::numeric,
                          (e.elem->>'description')
             ORDER BY e.ord
           )                                   AS occurrence_idx
    FROM jsonb_array_elements(p_rows) WITH ORDINALITY AS e(elem, ord)
    ORDER BY e.ord
  LOOP
    IF v_row.transaction_date IS NULL
       OR v_row.amount IS NULL
       OR v_row.description IS NULL THEN
      RAISE EXCEPTION 'Zeile mit NULL-Pflichtfeld: (date=%, amount=%, desc=%)',
        v_row.transaction_date, v_row.amount, v_row.description
        USING ERRCODE = '22023';
    END IF;

    v_iban := NULLIF(trim(v_row.counterparty_iban), '');

    -- Hash: 1. Vorkommen = V2-Formel unverändert; ab 2. Vorkommen '|#N'
    v_amount_fixed := to_char(v_row.amount, 'FM999990.00');
    v_hash_input   := v_row.transaction_date::text
                      || '|' || v_amount_fixed
                      || '|' || v_row.description
                      || CASE WHEN v_row.occurrence_idx > 1
                              THEN '|#' || v_row.occurrence_idx::text
                              ELSE '' END;
    v_hash := encode(digest(v_hash_input, 'sha256'), 'hex');

    v_fragment_id    := NULL;
    v_was_inserted   := NULL;
    v_best_card_id   := NULL;
    v_best_score     := NULL;
    v_is_internal    := false;
    v_is_kk_transfer := false;

    WITH ins AS (
      INSERT INTO fragments (
        user_id, transaction_date, amount, description, hash, counterparty_iban
      ) VALUES (
        v_user_id, v_row.transaction_date, v_row.amount, v_row.description,
        v_hash, v_iban
      )
      ON CONFLICT (user_id, hash) DO UPDATE
        SET counterparty_iban = EXCLUDED.counterparty_iban
        WHERE fragments.counterparty_iban IS NULL
          AND EXCLUDED.counterparty_iban  IS NOT NULL
      RETURNING id, (xmax = 0) AS was_inserted
    )
    SELECT id, was_inserted INTO v_fragment_id, v_was_inserted FROM ins;

    IF v_fragment_id IS NULL THEN
      v_skipped := v_skipped + 1;
      CONTINUE;
    END IF;

    IF v_was_inserted THEN
      v_inserted     := v_inserted + 1;
      v_fragment_ids := v_fragment_ids || v_fragment_id;
    ELSE
      v_iban_backfilled := v_iban_backfilled + 1;
    END IF;

    -- v2-04 ①: KK-Klassifikation (Beschreibung + Vorzeichen, nur DKB_VISA)
    v_is_kk_transfer := (
      p_format_hint = 'DKB_VISA'
      AND v_row.amount > 0
      AND (   v_row.description ILIKE 'Einzahlung%'
           OR v_row.description ILIKE 'Ausgleich Kreditkarte%')
    );

    IF (v_iban IS NOT NULL AND v_iban = ANY(v_own_ibans))
       OR v_is_kk_transfer THEN
      UPDATE fragments
         SET transfer_type = 'INTERNAL_TRANSFER'
       WHERE id = v_fragment_id;

      WITH deleted AS (
        DELETE FROM card_fragment_links
         WHERE fragment_id = v_fragment_id
        RETURNING 1
      )
      SELECT count(*) INTO v_unlinked_rows FROM deleted;
      v_links_removed := v_links_removed + COALESCE(v_unlinked_rows, 0);

      UPDATE fragments
         SET suggested_card_id = NULL,
             confidence        = NULL
       WHERE id = v_fragment_id
         AND (suggested_card_id IS NOT NULL OR confidence IS NOT NULL);

      v_internal_transfers := v_internal_transfers + 1;
      v_is_internal := true;
    END IF;

    IF v_was_inserted AND NOT v_is_internal THEN
      SELECT cm.card_id, cm.score
        INTO v_best_card_id, v_best_score
      FROM (
        SELECT c.id   AS card_id,
               c.name AS card_name,
               calculate_match_confidence(v_fragment_id, c.id) AS score
        FROM cards c
        WHERE c.user_id = v_user_id
          AND c.deleted_at IS NULL
          AND is_card_active_in_month(
                c.id, date_trunc('month', v_row.transaction_date)::date)
      ) cm
      WHERE cm.score > 0
      ORDER BY cm.score DESC, cm.card_name ASC
      LIMIT 1;

      IF v_best_card_id IS NULL THEN
        CONTINUE;
      END IF;

      IF v_best_score >= v_auto_threshold THEN
        v_link_month := date_trunc('month', v_row.transaction_date)::date;
        INSERT INTO card_fragment_links (
          user_id, card_id, fragment_id, month, origin
        ) VALUES (
          v_user_id, v_best_card_id, v_fragment_id, v_link_month,
          'AUTO_ABSORBED'::link_origin
        );
        v_auto_absorbed := v_auto_absorbed + 1;

      ELSIF v_best_score >= v_badge_threshold THEN
        UPDATE fragments
           SET suggested_card_id = v_best_card_id,
               confidence        = v_best_score
         WHERE id = v_fragment_id;
      END IF;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'inserted_count',                  v_inserted,
    'skipped_duplicates_count',        v_skipped,
    'iban_backfilled_count',           v_iban_backfilled,
    'auto_absorbed_count',             v_auto_absorbed,
    'internal_transfers_count',        v_internal_transfers,
    'links_removed_for_transfers_count', v_links_removed,
    'fragment_ids',                    COALESCE(to_jsonb(v_fragment_ids), '[]'::jsonb)
  );
END;
$function$;


-- ───────────────────────────────────────────────────────────────────────────
-- 12 · View
--
-- `status` ist abgeleitet, nicht gespeichert. transfer_type gewinnt vor der
-- Link-Herkunft — ein Übertrag ist nie „zugeordnet" (Stolperfalle 7).
-- ───────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW public.fragments_with_status AS
 SELECT f.id,
    f.user_id,
    f.amount,
    f.description,
    f.transaction_date,
    f.hash,
    f.confidence,
    f.suggested_card_id,
    f.imported_at,
    f.created_at,
        CASE
            WHEN f.transfer_type IS NOT NULL THEN f.transfer_type
            WHEN l.origin = 'AUTO_ABSORBED'::link_origin THEN 'AUTO_ABSORBED'::text
            WHEN l.origin = 'MANUAL_DROP'::link_origin THEN 'ASSIGNED'::text
            ELSE 'UNASSIGNED'::text
        END AS status,
    l.card_id AS assigned_card_id,
    l.month AS assigned_month,
    f.counterparty_iban,
    f.transfer_type
   FROM fragments f
     LEFT JOIN card_fragment_links l ON l.fragment_id = f.id;


-- ───────────────────────────────────────────────────────────────────────────
-- 13 · Trigger
-- ───────────────────────────────────────────────────────────────────────────

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER cards_set_updated_at BEFORE UPDATE ON public.cards FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER card_monthly_states_set_updated_at BEFORE UPDATE ON public.card_monthly_states FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE CONSTRAINT TRIGGER cards_assert_initial_plan AFTER INSERT OR UPDATE OF first_active_month, deleted_at ON public.cards DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION assert_card_has_initial_plan();
CREATE TRIGGER trg_oqb_no_transfer_links BEFORE INSERT OR UPDATE OF fragment_id ON public.card_fragment_links FOR EACH ROW EXECUTE FUNCTION enforce_no_transfer_fragment_links();

-- Der Event-Trigger heißt in Produktion `ensure_rls`. Er wird von der
-- Supabase-Plattform mit angelegt und ist hier nur der Vollständigkeit halber
-- dokumentiert — siehe Befund D8 zum Verhalten.
-- CREATE EVENT TRIGGER ensure_rls ON ddl_command_end EXECUTE FUNCTION rls_auto_enable();

-- Profil-Anlage bei neuem Auth-User. Liegt auf auth.users und wird deshalb
-- getrennt angelegt (das Schema gehört der Plattform).
-- CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ───────────────────────────────────────────────────────────────────────────
-- 14 · Row Level Security
--
-- Owner-Muster durchgehend: auth.uid() = user_id, für ALL, mit WITH CHECK.
-- Zwei Ausnahmen sind reine Lese-Nachschlagetabellen (app_config,
-- net_estimation_brackets) — dort darf jeder Angemeldete lesen.
-- ⚠️ Jede NEUE Tabelle braucht ihre Policy von Hand (D8).
-- ───────────────────────────────────────────────────────────────────────────

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_planned_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_monthly_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fragments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_fragment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deleted_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.net_estimation_brackets ENABLE ROW LEVEL SECURITY;

CREATE POLICY app_config_read_authenticated ON public.app_config AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY brackets_read_authenticated ON public.net_estimation_brackets AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY profiles_owner ON public.profiles AS PERMISSIVE FOR ALL TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY income_timeline_owner ON public.income_timeline AS PERMISSIVE FOR ALL TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY cards_owner ON public.cards AS PERMISSIVE FOR ALL TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY card_planned_timeline_owner ON public.card_planned_timeline AS PERMISSIVE FOR ALL TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY card_monthly_states_owner ON public.card_monthly_states AS PERMISSIVE FOR ALL TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY fragments_owner ON public.fragments AS PERMISSIVE FOR ALL TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY card_fragment_links_owner ON public.card_fragment_links AS PERMISSIVE FOR ALL TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY deleted_entities_owner ON public.deleted_entities AS PERMISSIVE FOR ALL TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


-- ───────────────────────────────────────────────────────────────────────────
-- 15 · Seed — app_config
--
-- Arbeitsregel 5: Diese Werte kommen aus der Datenbank, nie aus dem Code.
-- Ohne sie fällt jede Funktion auf ihren eingebauten Notnagel zurück.
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO public.app_config (key, value, description) VALUES
  ('confidence.weight_name',                '0.50'::jsonb, 'Gewicht Namens-Ähnlichkeit im Match-Score'),
  ('confidence.weight_amount',              '0.30'::jsonb, 'Gewicht Betrags-Übereinstimmung im Match-Score'),
  ('confidence.weight_frequency',           '0.20'::jsonb, 'Gewicht Frequenz-Übereinstimmung im Match-Score'),
  ('confidence.minimum_match_threshold',    '0.20'::jsonb, 'Unterhalb dieses Scores gilt ein Match als nicht vorhanden'),
  ('confidence.badge_threshold',            '0.60'::jsonb, 'Ab hier wird ein Vorschlag gespeichert (§11)'),
  ('confidence.auto_absorption_threshold',  '0.95'::jsonb, 'Ab hier ordnet der Distiller lautlos zu'),
  ('trash.retention_seconds',               '60'::jsonb,   'Aufbewahrung im Papierkorb — reicht für eine Kaskade nicht (D7)')
ON CONFLICT (key) DO NOTHING;

-- `net_estimation_brackets` bleibt bewusst leer: die Werte sind Steuerdaten
-- und liegen nur in Produktion. Hausaufgabe TP-2 füllt sie für die
-- Übungs-Datenbank nach, sobald ein Sprint die Netto-Schätzung berührt.

-- ═══════════════════════════════════════════════════════════════════════════
-- ENDE BASELINE — Stand nach Sprint v2-16 (07.08.2026)
-- ═══════════════════════════════════════════════════════════════════════════
