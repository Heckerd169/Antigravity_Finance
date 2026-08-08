-- ═══════════════════════════════════════════════════════════════════════════
-- v2-17 · KAT-1 — Kategorien als eigene Struktur
-- Record: V2/design_direktor_2026-08-07_kategorien.md (Teil A, B, C)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- WAS SICH ÄNDERT
-- Eine neue Tabelle `card_categories` und eine neue Spalte `cards.category_id`.
-- Keine bestehende Funktion wird angefasst. Die Sparrate darf sich in KEINEM
-- der zwölf Monate bewegen — Anker vorher/nachher messen (Arbeitsregel 21).
--
-- ⚠️ EINE KATEGORIE IST KEINE KARTE (Befund D1, BLOCKER)
-- `calculate_sparrate_for_month` und `calculate_planned_sparrate_for_month`
-- schleifen OHNE Typ-Filter über alle Karten des Monats. Dieselbe ungefilterte
-- Menge nutzen `get_year_deviation_drivers` und der Auto-Absorptions-Loop in
-- `process_csv_import`. Eine Kategorie als `cards`-Zeile würde also zusätzlich
-- zu ihren Kindern summiert UND Fragmente absorbieren. Deshalb die eigene
-- Tabelle — und deshalb hat sie bewusst KEINE Betrags-Spalte: die Zahl der
-- Kategorie ist immer abgeleitet (KAT-3).
--
-- ⚠️ RLS-POLICY VON HAND (Befund D8)
-- Der Event-Trigger `ensure_rls` schaltet RLS bei CREATE TABLE automatisch ein,
-- legt aber KEINE Policy an — und schluckt sein eigenes Scheitern
-- (EXCEPTION WHEN OTHERS THEN RAISE LOG). Ohne die Policy unten lieferte
-- PostgREST ein stilles `[]` beim SELECT und 42501 beim INSERT; beim Testen
-- liest sich das wie „noch keine Daten angelegt". Das ENABLE steht trotzdem
-- explizit da: sich auf einen Trigger zu verlassen, der Fehler verschluckt,
-- ist keine Absicherung.
--
-- ⚠️ KEIN PAPIERKORB (Befund D7)
-- `deleted_entity_type` hat genau vier Werte, `cleanup_expired_card_trash`
-- filtert hart auf 'CARD', und 60 Sekunden Aufbewahrung reichen für eine
-- Kaskade nicht. Eine CATEGORY-Zeile in `deleted_entities` würde nie vollzogen
-- und nie entfernt — eine unsterbliche Waisenzeile.
-- Deshalb löscht `delete_card_category` HART und gibt alles zurück, was zur
-- Wiederherstellung nötig ist; die Rücknahme läuft über den bestehenden
-- 5-Sekunden-Toast (`restore_card_category`). Damit braucht dieser Sprint
-- weder einen neuen Enum-Wert noch eine längere Aufbewahrung.
-- ═══════════════════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────────────────
-- 1 · Tabelle
--
-- Keine Betrags-Spalte, keine Zeitreihe. A6: Die Zuordnung ist eine EINFACHE
-- EIGENSCHAFT der Karte und gilt rückwirkend — bewusst abweichend von Befund
-- D3, der eine `card_category_timeline` nach Forward-Inheritance-Muster
-- empfiehlt. Grund: Eine ab-heute-Zuordnung zerschnitte jede Kategorie-Kurve
-- an jeder Umsortierung. Der Präzedenzfall ist `cards.name` — auch eine
-- Umbenennung wirkt rückwirkend. Die Snapshot-Integrität (§2.1) ist nicht
-- berührt: Sie garantiert Gehalt, Karten-Plan, Karten-Lebensdauer, Fragmente
-- und Sparrate; die Kategorie ist keine davon und bewegt keine Zahl.
-- ───────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.card_categories (
  id         uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id    uuid NOT NULL,
  name       text NOT NULL,
  -- C2: Die Reihenfolge der Ordner steht in der Datenbank, nicht im Code —
  -- damit `M5` später einen Ort hat, ohne dass eine Migration nötig wird.
  sort_order smallint DEFAULT 100 NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.card_categories
  ADD CONSTRAINT card_categories_pkey PRIMARY KEY (id);

ALTER TABLE public.card_categories
  ADD CONSTRAINT card_categories_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.card_categories
  ADD CONSTRAINT card_categories_name_not_empty
  CHECK (length(btrim(name)) > 0);

-- Namensgleichheit ohne Rücksicht auf Groß-/Kleinschreibung: „Wohnen" und
-- „wohnen" wären zwei Ordner, die niemand auseinanderhalten kann.
CREATE UNIQUE INDEX IF NOT EXISTS card_categories_user_name_key
  ON public.card_categories (user_id, lower(name));

CREATE INDEX IF NOT EXISTS idx_card_categories_user_sort
  ON public.card_categories (user_id, sort_order, name);

CREATE TRIGGER card_categories_set_updated_at
  BEFORE UPDATE ON public.card_categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ───────────────────────────────────────────────────────────────────────────
-- 2 · RLS — explizit, nicht dem Event-Trigger überlassen (D8)
-- ───────────────────────────────────────────────────────────────────────────

ALTER TABLE public.card_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY card_categories_owner ON public.card_categories
  AS PERMISSIVE FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ───────────────────────────────────────────────────────────────────────────
-- 3 · Die Zuordnung an der Karte
--
-- NULLABLE, und das ist keine Nachlässigkeit: Befund D12 zeigt, dass der
-- kategorielose Zustand ein ZUFLUSS ist, kein Restbestand. `create_card_direct`
-- und `create_card_from_fragment` sind wegen des DEFERRED-Constraints der
-- einzige legale Anlageweg, und keiner der beiden kennt eine Kategorie — jeder
-- Klick auf den leeren Platz erzeugt also weiterhin eine kategorielose Karte.
-- Ein NOT NULL bräche beide RPC-Signaturen samt generierter types.ts.
--
-- ON DELETE SET NULL setzt A7 um: Eine gelöschte Kategorie nimmt ihre Karten
-- NICHT mit, sie werden kategorielos. Eine Kaskade wäre eine undo-lose
-- Massenaktion (dasselbe Muster, das U9 für „Alle Verknüpfungen lösen"
-- beschreibt).
-- ───────────────────────────────────────────────────────────────────────────

ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS category_id uuid;

ALTER TABLE public.cards
  ADD CONSTRAINT cards_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES public.card_categories(id)
  ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_cards_category
  ON public.cards (category_id) WHERE category_id IS NOT NULL;


-- ───────────────────────────────────────────────────────────────────────────
-- 4 · RPCs
--
-- Alle mit explizitem auth.uid()-Guard und Eigentums-Prüfung. Über MCP läuft
-- die Verbindung als Service-Rolle AN RLS VORBEI — die Prüfungen hier sind
-- deshalb nicht redundant, sondern die einzige Absicherung im Trockenlauf.
--
-- Bewusst KEIN `create_card_category(name)` ohne Karte. B8: „Eine Kategorie
-- entsteht dadurch, dass man ihr eine Karte gibt." Eine leere Kategorie soll
-- gar nicht erst entstehen können — deshalb gibt es nur
-- `create_category_for_card`.
-- ───────────────────────────────────────────────────────────────────────────

/* Karte einer bestehenden Kategorie zuordnen — oder mit NULL herauslösen. */
CREATE OR REPLACE FUNCTION public.set_card_category(
  p_card_id     uuid,
  p_category_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized' USING ERRCODE = '28000';
  END IF;

  IF p_card_id IS NULL THEN
    RAISE EXCEPTION 'p_card_id darf nicht NULL sein' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM cards WHERE id = p_card_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'card not found or not owned: %', p_card_id
      USING ERRCODE = '42704';
  END IF;

  -- Fremde Kategorie ist kein gültiges Ziel. Ohne diese Prüfung ließe sich
  -- über die Service-Rolle eine Karte in eine fremde Kategorie hängen.
  IF p_category_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM card_categories
     WHERE id = p_category_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'category not found or not owned: %', p_category_id
      USING ERRCODE = '42704';
  END IF;

  UPDATE cards SET category_id = p_category_id WHERE id = p_card_id;
END;
$function$;


/* Neue Kategorie anlegen UND die Karte hineinlegen — in einem Aufruf.
 *
 * Existiert der Name bereits (ohne Rücksicht auf Groß-/Kleinschreibung), wird
 * die bestehende Kategorie verwendet statt eines Fehlers. Das ist die
 * freundlichere Antwort auf „Wohnen" vs. „wohnen": Der User wollte offenkundig
 * denselben Ordner.
 *
 * `sort_order` = größter vorhandener Wert + 10. Neue Ordner landen damit
 * hinten, unmittelbar vor „Ohne Kategorie" (das keine Zeile ist, sondern ein
 * Sammelbecken in der Anzeige). */
CREATE OR REPLACE FUNCTION public.create_category_for_card(
  p_card_id uuid,
  p_name    text
)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id     uuid := auth.uid();
  v_name        text;
  v_category_id uuid;
  v_next_sort   smallint;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized' USING ERRCODE = '28000';
  END IF;

  v_name := btrim(coalesce(p_name, ''));
  IF length(v_name) = 0 THEN
    RAISE EXCEPTION 'p_name darf nicht leer sein' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM cards WHERE id = p_card_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'card not found or not owned: %', p_card_id
      USING ERRCODE = '42704';
  END IF;

  SELECT id INTO v_category_id
    FROM card_categories
   WHERE user_id = v_user_id AND lower(name) = lower(v_name);

  IF v_category_id IS NULL THEN
    SELECT COALESCE(max(sort_order), 0) + 10 INTO v_next_sort
      FROM card_categories WHERE user_id = v_user_id;

    INSERT INTO card_categories (user_id, name, sort_order)
    VALUES (v_user_id, v_name, v_next_sort)
    RETURNING id INTO v_category_id;
  END IF;

  UPDATE cards SET category_id = v_category_id WHERE id = p_card_id;

  RETURN v_category_id;
END;
$function$;


/* Kategorie umbenennen. Wirkt rückwirkend auf alle Monate (A6) — genau wie
 * eine Karten-Umbenennung, und aus demselben Grund unproblematisch: Es ändert
 * sich die Gliederung, nie eine Zahl, die rechnet. */
CREATE OR REPLACE FUNCTION public.rename_card_category(
  p_category_id uuid,
  p_name        text
)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_name    text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized' USING ERRCODE = '28000';
  END IF;

  v_name := btrim(coalesce(p_name, ''));
  IF length(v_name) = 0 THEN
    RAISE EXCEPTION 'p_name darf nicht leer sein' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM card_categories
     WHERE id = p_category_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'category not found or not owned: %', p_category_id
      USING ERRCODE = '42704';
  END IF;

  UPDATE card_categories SET name = v_name WHERE id = p_category_id;
END;
$function$;


/* Kategorie löschen. Die enthaltenen Karten werden NICHT mitgelöscht, sondern
 * kategorielos (A7, über ON DELETE SET NULL).
 *
 * Gibt alles zurück, was `restore_card_category` zur vollständigen Rücknahme
 * braucht — inklusive der Karten-IDs, denn die stehen nach dem SET NULL
 * nirgends mehr. Das ist der bewusste Ersatz für den Papierkorb, den
 * `deleted_entities` für diesen Entitätstyp nicht tragen kann (D7). */
CREATE OR REPLACE FUNCTION public.delete_card_category(p_category_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id  uuid := auth.uid();
  v_category card_categories%ROWTYPE;
  v_card_ids uuid[];
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized' USING ERRCODE = '28000';
  END IF;

  SELECT * INTO v_category
    FROM card_categories
   WHERE id = p_category_id AND user_id = v_user_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'category not found or not owned: %', p_category_id
      USING ERRCODE = '42704';
  END IF;

  SELECT COALESCE(array_agg(id ORDER BY id), ARRAY[]::uuid[])
    INTO v_card_ids
    FROM cards
   WHERE category_id = p_category_id AND user_id = v_user_id;

  DELETE FROM card_categories WHERE id = p_category_id;

  RETURN jsonb_build_object(
    'category_id', v_category.id,
    'name',        v_category.name,
    'sort_order',  v_category.sort_order,
    'card_ids',    to_jsonb(v_card_ids)
  );
END;
$function$;


/* Rücknahme eines Löschvorgangs aus dem 5-Sekunden-Toast.
 *
 * Legt die Kategorie mit DERSELBEN id wieder an — möglich, weil nach dem
 * ON DELETE SET NULL keine Zeile mehr auf sie zeigt — und hängt die Karten
 * zurück. Nur Karten, die INZWISCHEN nicht anderweitig zugeordnet wurden:
 * Wer in den fünf Sekunden eine Karte woanders hinlegt, soll das behalten. */
CREATE OR REPLACE FUNCTION public.restore_card_category(
  p_category_id uuid,
  p_name        text,
  p_sort_order  smallint,
  p_card_ids    uuid[]
)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_name    text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized' USING ERRCODE = '28000';
  END IF;

  v_name := btrim(coalesce(p_name, ''));
  IF length(v_name) = 0 THEN
    RAISE EXCEPTION 'p_name darf nicht leer sein' USING ERRCODE = '22023';
  END IF;

  INSERT INTO card_categories (id, user_id, name, sort_order)
  VALUES (
    COALESCE(p_category_id, gen_random_uuid()),
    v_user_id,
    v_name,
    COALESCE(p_sort_order, 100)
  )
  ON CONFLICT (id) DO NOTHING;

  UPDATE cards
     SET category_id = p_category_id
   WHERE user_id = v_user_id
     AND category_id IS NULL
     AND id = ANY(COALESCE(p_card_ids, ARRAY[]::uuid[]));

  RETURN p_category_id;
END;
$function$;
