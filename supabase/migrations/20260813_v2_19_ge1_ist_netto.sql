-- ============================================================================
-- Sprint v2-19 · GE-1, Teil 1 von 2 — die Ablage für das tatsächliche Netto
--
-- Wozu: Das Netto ist heute GEPLANT, nicht gemessen. Juli 2026 geplant
-- 4.165,11 €, überwiesen 4.149,54 €. Die Differenz sieht die App nicht.
-- Diese Migration legt die Ablage an; sie BEWEGT NOCH KEINE ZAHL — niemand
-- liest sie. Der Eingriff in die Rechenfunktionen folgt in Migration 2
-- (20260813_v2_19_ge2_treiber.sql).
--
-- Warum zwei Migrationen: Zwischen „Ist-Sparrate geändert" und „Ordner-Spalte
-- nachgezogen" ist Prüfanker 1 gebrochen. Dieser Zustand darf auf Produktion
-- nie existieren — deshalb liegen die drei Rechenfunktionen zusammen in
-- EINER zweiten Migration, und diese hier ist für sich folgenlos.
--
-- Entscheidungs-Record: V2/design_direktor_2026-08-13_gehalt.md (A–G)
-- Briefing:             sprints/sprint_v2-19_briefing.md
-- ============================================================================

-- ── 1 · Die Ablage ──────────────────────────────────────────────────────────
--
-- Gebaut wie `card_fragment_links` — bewusst, damit sie sich gleich verhält:
-- `id` als PK, `fragment_id` UNIQUE (ein Fragment hängt an höchstens einer
-- Stelle), `month` auf den Monatsersten festgenagelt.
--
-- ⚠️ SIE SPEICHERT DEN LINK, NICHT DEN BETRAG.
-- Die Summe entsteht aus `fragments.amount`. Damit können Betrag und
-- Zuordnung nicht auseinanderlaufen — und Fachregel G („zwei Gehälter in
-- einem Monat summieren sich", Record) fällt von selbst heraus, statt eine
-- Sonderbehandlung zu brauchen.
--
-- `person` wird angelegt, aber nur `ICH` ist nutzbar: Das Partner-Netto ist
-- ausdrückliches Nicht-Ziel dieses Sprints. Die Spalte kostet nichts und
-- erspart später eine Migration.

create table if not exists public.income_fragment_links (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  fragment_id uuid        not null references public.fragments(id) on delete cascade,
  person      person_role not null default 'ICH',
  month       date        not null,
  created_at  timestamptz not null default now(),
  constraint income_fragment_links_fragment_id_key unique (fragment_id),
  constraint income_month_first_day
    check (month = (date_trunc('month', month::timestamptz))::date)
);

-- Der Lesepfad fragt immer (user_id, person, month) — genau dieser Index.
create index if not exists income_fragment_links_user_person_month_idx
  on public.income_fragment_links (user_id, person, month);

-- ── 2 · RLS — ENABLE *und* Policy von Hand ─────────────────────────────────
--
-- ⚠️ Stolperfalle 15 / Befund D8 (v2-17): Der Event-Trigger `rls_auto_enable`
-- führt NUR `enable row level security` aus und schluckt sein eigenes
-- Scheitern (`EXCEPTION WHEN OTHERS THEN RAISE LOG`). Eine Policy legt er
-- NICHT an. PostgREST liefert dann ein stilles `[]` beim SELECT und `42501`
-- beim INSERT — beim Testen liest sich das wie „noch keine Daten angelegt".
-- Beides gehört deshalb ausdrücklich hierher, nicht in die Automatik.

alter table public.income_fragment_links enable row level security;

drop policy if exists income_fragment_links_owner on public.income_fragment_links;
create policy income_fragment_links_owner
  on public.income_fragment_links
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 3 · Wächter 1: keine Transfers ──────────────────────────────────────────
--
-- §6 Stolperfalle 7: `transfer_type IS NOT NULL` ⇒ nie verlinkbar, weder an
-- eine Karte noch ans Netto. Die bestehende Trigger-Funktion liest
-- ausschließlich `NEW.fragment_id` und ist damit ohne Änderung
-- wiederverwendbar — kein Nachbau, keine zweite Wahrheit.

drop trigger if exists trg_ifl_no_transfer_links on public.income_fragment_links;
create trigger trg_ifl_no_transfer_links
  before insert or update of fragment_id on public.income_fragment_links
  for each row execute function public.enforce_no_transfer_fragment_links();

-- ── 4 · Wächter 2: ein Fragment zählt genau EINMAL ──────────────────────────
--
-- Ohne diese beiden Trigger könnte dasselbe Fragment gleichzeitig an einer
-- Karte UND am Netto hängen — und wäre in der Sparrate doppelt drin, einmal
-- als Kartenbetrag, einmal im Netto. Das fiele nicht auf, weil keine Zahl
-- offensichtlich falsch AUSSIEHT.
--
-- Bewusst als Trigger und nicht im Schreibpfad: So ist auch alles abgedeckt,
-- was NICHT durch die neue RPC läuft — `process_csv_import` mit seiner
-- Auto-Absorption, `create_card_from_fragment` und der direkte UPSERT aus
-- `linkFragmentToCard` (die Server Action schreibt an der RPC vorbei).

create or replace function public.drop_card_link_on_income_link()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  delete from card_fragment_links where fragment_id = NEW.fragment_id;
  return NEW;
end;
$$;

create or replace function public.drop_income_link_on_card_link()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  delete from income_fragment_links where fragment_id = NEW.fragment_id;
  return NEW;
end;
$$;

drop trigger if exists trg_ifl_drop_card_link on public.income_fragment_links;
create trigger trg_ifl_drop_card_link
  before insert or update of fragment_id on public.income_fragment_links
  for each row execute function public.drop_card_link_on_income_link();

drop trigger if exists trg_cfl_drop_income_link on public.card_fragment_links;
create trigger trg_cfl_drop_income_link
  before insert or update of fragment_id on public.card_fragment_links
  for each row execute function public.drop_income_link_on_card_link();

-- ── 5 · Der Lesepfad ────────────────────────────────────────────────────────
--
-- Liefert das tatsächlich überwiesene Netto eines Monats — oder NULL, wenn
-- nichts zugeordnet ist. NULL ist das Signal für „nimm den Plan"; die
-- Rechenfunktionen entscheiden das per COALESCE (Migration 2).
--
-- Kein `round()`: Die Aufrufer runden am Ende über alles. Eine Rundung hier
-- wäre eine Zwischengröße, die die Gegenseite nicht kennt (§7 Regel 24 /
-- LL-24). `fragments.amount` steht ohnehin auf zwei Stellen.

create or replace function public.get_actual_net_for_month(
  p_user_id uuid,
  p_person  person_role,
  p_month   date
)
returns numeric
language sql
stable
set search_path to 'public'
as $$
  select sum(f.amount)
    from income_fragment_links l
    join fragments f on f.id = l.fragment_id
   where l.user_id = p_user_id
     and l.person  = p_person
     and l.month   = (date_trunc('month', p_month::timestamptz))::date
$$;

-- ── 6 · Schreiben ───────────────────────────────────────────────────────────
--
-- Warum eine RPC und nicht ein UPSERT aus der Server Action (wie bei
-- `linkFragmentToCard`): Hier ist etwas zu prüfen, das PostgREST nicht
-- prüfen kann — vor allem das Vorzeichen. Ohne diese Prüfung ließe sich
-- „Aldi −48,22 €" auf die Netto-Kachel ziehen, und das Monats-Netto fiele
-- auf −48,22 €.

create or replace function public.link_fragment_to_income(
  p_fragment_id uuid,
  p_month       date
)
returns jsonb
language plpgsql
volatile
set search_path to 'public'
as $$
declare
  v_user_id uuid := auth.uid();
  v_month   date := (date_trunc('month', p_month::timestamptz))::date;
  v_amount  numeric;
  v_transfer text;
begin
  if v_user_id is null then
    raise exception 'Nicht authentifiziert' using errcode = '28000';
  end if;

  select f.amount, f.transfer_type::text
    into v_amount, v_transfer
    from fragments f
   where f.id = p_fragment_id
     and f.user_id = v_user_id;

  if not found then
    raise exception 'Fragment % nicht gefunden oder nicht im eigenen Bestand', p_fragment_id
      using errcode = '42501';
  end if;

  if v_transfer is not null then
    raise exception 'Fragment % ist als Transfer markiert (%) und kann nicht dem Netto zugeordnet werden',
      p_fragment_id, v_transfer using errcode = '23514';
  end if;

  -- Das Netto ist ein Eingang. Eine Ausgabe hier hereinzulassen hieße, die
  -- Sparrate über ein Vorzeichen zu kippen.
  if v_amount is null or v_amount <= 0 then
    raise exception 'Nur Eingänge können dem Netto zugeordnet werden (Betrag: %)', v_amount
      using errcode = '22023';
  end if;

  insert into income_fragment_links (user_id, fragment_id, person, month)
  values (v_user_id, p_fragment_id, 'ICH', v_month)
  on conflict (fragment_id)
  do update set month = excluded.month, person = excluded.person;

  return jsonb_build_object(
    'fragment_id', p_fragment_id,
    'month',       to_char(v_month, 'YYYY-MM-DD'),
    'actual_net',  get_actual_net_for_month(v_user_id, 'ICH', v_month)
  );
end;
$$;

-- ── 7 · Lösen ───────────────────────────────────────────────────────────────
--
-- Record, Entscheidung E: gelöst wird im Einkommens-Fenster. Nach dem Lösen
-- gilt wieder der Plan, und das Fragment kehrt in die Rohmasse zurück — das
-- ergibt sich von selbst, weil `fragments_with_status` den Zustand aus dem
-- Link ableitet (Abschnitt 8).

create or replace function public.unlink_fragment_from_income(
  p_fragment_id uuid
)
returns jsonb
language plpgsql
volatile
set search_path to 'public'
as $$
declare
  v_user_id uuid := auth.uid();
  v_month   date;
begin
  if v_user_id is null then
    raise exception 'Nicht authentifiziert' using errcode = '28000';
  end if;

  delete from income_fragment_links
   where fragment_id = p_fragment_id
     and user_id     = v_user_id
  returning month into v_month;

  if v_month is null then
    raise exception 'Keine Netto-Zuordnung für Fragment % gefunden', p_fragment_id
      using errcode = '42501';
  end if;

  return jsonb_build_object(
    'fragment_id', p_fragment_id,
    'month',       to_char(v_month, 'YYYY-MM-DD'),
    'actual_net',  get_actual_net_for_month(v_user_id, 'ICH', v_month)
  );
end;
$$;

-- ── 8 · Die Rohmasse erfährt davon ─────────────────────────────────────────
--
-- Ein netto-zugeordnetes Fragment liefert `ASSIGNED` — bewusst KEIN neuer
-- Status-Wert. Dadurch greifen die bestehenden Frontend-Regeln ohne eine
-- Zeile Änderung:
--   · `fragment-stack.tsx`  → `isLocked={f.status !== "UNASSIGNED"}`
--   · `fragment-card.tsx`   → ziehbar nur bei UNASSIGNED / INTERNAL_TRANSFER
--   · `page.tsx`            → sortiert UNASSIGNED nach vorn
-- Die Zahlung bleibt also sichtbar, rutscht nach hinten und ist gesperrt —
-- genau wie eine, die auf einer Karte liegt.
--
-- `assigned_card_id` bleibt NULL: Es gibt keine Karte. Nur `assigned_month`
-- wird mitgeführt, damit ein Gehalt, das am Monatsende für den Folgemonat
-- kommt, über dieselbe Zweitabfrage gefunden wird wie ein Karten-Link
-- (`page.tsx`, linkedRows).
--
-- Spaltenreihenfolge und -namen bleiben identisch — `create or replace view`
-- verlangt das.

create or replace view public.fragments_with_status as
  select
    f.id,
    f.user_id,
    f.amount,
    f.description,
    f.transaction_date,
    f.hash,
    f.confidence,
    f.suggested_card_id,
    f.imported_at,
    f.created_at,
    case
      when f.transfer_type is not null            then f.transfer_type
      when l.origin = 'AUTO_ABSORBED'::link_origin then 'AUTO_ABSORBED'::text
      when l.origin = 'MANUAL_DROP'::link_origin   then 'ASSIGNED'::text
      when il.fragment_id is not null              then 'ASSIGNED'::text
      else 'UNASSIGNED'::text
    end                        as status,
    l.card_id                  as assigned_card_id,
    coalesce(l.month, il.month) as assigned_month,
    f.counterparty_iban,
    f.transfer_type
  from fragments f
  left join card_fragment_links   l  on l.fragment_id  = f.id
  left join income_fragment_links il on il.fragment_id = f.id;
