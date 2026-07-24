-- Generator-Abfragen: erzeugen fertige DDL-Texte aus der Prod-DB (read-only).
-- Ausführung: einzeln gegen nflkobdfdhncrtjncpmq; Output in der Reihenfolge
-- des Runbooks (README.md Schritt 3) per apply_migration aufs Test-Projekt.
-- Stand der Technik: 24.07.2026 (verifiziert gegen Prod-Katalog).

-- Q1: Enum-Typen
SELECT string_agg('CREATE TYPE public.'||t.typname||' AS ENUM ('||
  (SELECT string_agg(quote_literal(e.enumlabel), ', ' ORDER BY e.enumsortorder)
   FROM pg_enum e WHERE e.enumtypid=t.oid)||');', E'\n' ORDER BY t.typname)
FROM pg_type t
WHERE t.typnamespace='public'::regnamespace AND t.typtype='e';

-- Q2: Tabellen (Spalten + Defaults, ohne Constraints)
SELECT string_agg(ddl, E'\n\n' ORDER BY tbl) FROM (
  SELECT c.relname AS tbl,
    'CREATE TABLE public.'||c.relname||' ('||E'\n'||
    string_agg('  '||quote_ident(a.attname)||' '||format_type(a.atttypid,a.atttypmod)||
      CASE WHEN a.attnotnull THEN ' NOT NULL' ELSE '' END||
      CASE WHEN ad.adbin IS NOT NULL THEN ' DEFAULT '||pg_get_expr(ad.adbin,ad.adrelid) ELSE '' END,
      E',\n' ORDER BY a.attnum)||E'\n);' AS ddl
  FROM pg_class c
  JOIN pg_namespace n ON n.oid=c.relnamespace AND n.nspname='public'
  JOIN pg_attribute a ON a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped
  LEFT JOIN pg_attrdef ad ON ad.adrelid=c.oid AND ad.adnum=a.attnum
  WHERE c.relkind='r'
  GROUP BY c.relname
) t;

-- Q3: Constraints (PK -> UNIQUE -> CHECK -> FK)
SELECT string_agg('ALTER TABLE public.'||conrelid::regclass::text||' ADD CONSTRAINT '||conname||' '||pg_get_constraintdef(oid)||';',
  E'\n' ORDER BY CASE contype WHEN 'p' THEN 1 WHEN 'u' THEN 2 WHEN 'c' THEN 3 ELSE 4 END, conrelid::regclass::text, conname)
FROM pg_constraint
WHERE connamespace='public'::regnamespace AND contype IN ('p','u','c','f');

-- Q4: Funktionen (beim Einspielen LANGUAGE-c-Funktionen überspringen!)
SELECT string_agg(pg_get_functiondef(p.oid), E';\n\n' ORDER BY p.proname) || ';'
FROM pg_proc p
WHERE p.pronamespace='public'::regnamespace AND p.prokind='f'
  AND p.prolang <> (SELECT oid FROM pg_language WHERE lanname='c');

-- Q5: Views (inkl. security_invoker)
SELECT string_agg('CREATE OR REPLACE VIEW public.'||c.relname||
  CASE WHEN c.reloptions::text ILIKE '%security_invoker%' THEN ' WITH (security_invoker=true)' ELSE '' END||
  ' AS '||E'\n'||pg_get_viewdef(c.oid, true), E'\n\n')
FROM pg_class c WHERE c.relkind='v' AND c.relnamespace='public'::regnamespace;

-- Q6: Trigger (public + auth.users)
SELECT string_agg(pg_get_triggerdef(t.oid)||';', E'\n' ORDER BY c.relname, t.tgname)
FROM pg_trigger t
JOIN pg_class c ON c.oid=t.tgrelid
JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE NOT t.tgisinternal AND n.nspname IN ('public','auth');

-- Q7: RLS aktivieren + Policies
SELECT string_agg(x, E'\n') FROM (
  SELECT 'ALTER TABLE public.'||relname||' ENABLE ROW LEVEL SECURITY;' AS x
  FROM pg_class WHERE relnamespace='public'::regnamespace AND relkind='r' AND relrowsecurity
  UNION ALL
  SELECT 'CREATE POLICY "'||polname||'" ON public.'||c.relname||
    ' FOR '||CASE p.polcmd WHEN 'r' THEN 'SELECT' WHEN 'a' THEN 'INSERT' WHEN 'w' THEN 'UPDATE' WHEN 'd' THEN 'DELETE' ELSE 'ALL' END||
    ' TO '||COALESCE(NULLIF((SELECT string_agg(quote_ident(rolname), ', ') FROM pg_roles WHERE oid = ANY(p.polroles)), ''), 'public')||
    COALESCE(' USING ('||pg_get_expr(p.polqual, p.polrelid)||')', '')||
    COALESCE(' WITH CHECK ('||pg_get_expr(p.polwithcheck, p.polrelid)||')', '')||';'
  FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid
  WHERE c.relnamespace='public'::regnamespace
) s;

-- Q8: Zusatz-Indizes (Constraint-Indizes kommen über Q3)
SELECT string_agg(pg_get_indexdef(i.indexrelid)||';', E'\n')
FROM pg_index i JOIN pg_class c ON c.oid=i.indrelid
WHERE c.relnamespace='public'::regnamespace
  AND NOT EXISTS (SELECT 1 FROM pg_constraint con WHERE con.conindid=i.indexrelid);

-- Q9: app_config-Seed
SELECT string_agg(format('INSERT INTO public.app_config SELECT * FROM jsonb_populate_record(NULL::public.app_config, %L);', to_jsonb(t)), E'\n')
FROM app_config t;

-- Q10: net_estimation_brackets-Seed (33 Zeilen)
SELECT string_agg(format('INSERT INTO public.net_estimation_brackets SELECT * FROM jsonb_populate_record(NULL::public.net_estimation_brackets, %L);', to_jsonb(t)), E'\n')
FROM net_estimation_brackets t;

-- Q11: Strukturvergleich (auf Prod UND Test ausführen, Ergebnisse diffen)
SELECT
  (SELECT count(*) FROM pg_class WHERE relnamespace='public'::regnamespace AND relkind='r') AS tabellen,
  (SELECT count(*) FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid
    WHERE c.relnamespace='public'::regnamespace AND c.relkind='r' AND a.attnum>0 AND NOT a.attisdropped) AS spalten,
  (SELECT count(*) FROM pg_proc WHERE pronamespace='public'::regnamespace AND prokind='f'
    AND prolang <> (SELECT oid FROM pg_language WHERE lanname='c')) AS funktionen,
  (SELECT count(*) FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid
    WHERE c.relnamespace='public'::regnamespace) AS policies,
  (SELECT count(*) FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid
    JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE NOT t.tgisinternal AND n.nspname IN ('public','auth')) AS trigger,
  (SELECT count(*) FROM pg_constraint WHERE connamespace='public'::regnamespace AND contype IN ('p','u','c','f')) AS constraints,
  (SELECT count(*) FROM pg_index i JOIN pg_class c ON c.oid=i.indrelid
    WHERE c.relnamespace='public'::regnamespace
    AND NOT EXISTS (SELECT 1 FROM pg_constraint con WHERE con.conindid=i.indexrelid)) AS zusatz_indizes,
  (SELECT count(*) FROM pg_type WHERE typnamespace='public'::regnamespace AND typtype='e') AS enums;
