-- Fix PostgREST exposure / role visibility for public.grammar_rules
-- Run this in Supabase SQL Editor (Project -> SQL -> New Query)
-- Safe to run multiple times (guarded where possible)

-- 1) Ensure RLS is enabled (explicit)
ALTER TABLE public.grammar_rules ENABLE ROW LEVEL SECURITY;

-- 2) Create explicit allow policies for authenticated role
--    Drop existing policies with these names if they exist to avoid conflicts
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'grammar_rules' AND policyname = 'allow insert'
  ) THEN
    EXECUTE 'DROP POLICY "allow insert" ON public.grammar_rules';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'grammar_rules' AND policyname = 'allow select'
  ) THEN
    EXECUTE 'DROP POLICY "allow select" ON public.grammar_rules';
  END IF;
END $$;

CREATE POLICY "allow insert" ON public.grammar_rules
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "allow select" ON public.grammar_rules
  FOR SELECT TO authenticated
  USING (true);

-- Optional but recommended: ensure basic privileges exist
-- (RLS controls row access; grants control ability to attempt the action.)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT ON public.grammar_rules TO anon, authenticated;

-- 3) Re-add table to realtime publication (idempotent)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'grammar_rules'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.grammar_rules';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'grammar_rules'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.grammar_rules';
  END IF;
END $$;

-- 4) Force PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';

-- 5) Raw insert test helpers
-- Option A: If you want auth.uid() to work in SQL Editor, set request.jwt.claims
--   Replace <USER_UUID> with an actual user id from your auth.users table
-- SELECT set_config('request.jwt.claims', json_build_object('sub','<USER_UUID>')::text, true);
-- SELECT auth.uid();  -- should now return <USER_UUID>

-- Option B: Insert using a concrete owner_id (service_role bypasses RLS in SQL Editor)
-- Replace <USER_UUID> as needed or keep auth.uid() if you set request.jwt.claims above
-- NOTE: Replace the all-zero language_id with an existing language id in your project
-- BEGIN;
-- INSERT INTO public.grammar_rules
--   (language_id, owner_id, name, description, category, rule_type, pattern, examples)
-- VALUES
--   ('00000000-0000-0000-0000-000000000000',
--    COALESCE(auth.uid(), '<USER_UUID>'),
--    'Test Rule',
--    'Test',
--    'syntax',
--    'word_order',
--    'SVO',
--    '[]'::jsonb);
-- ROLLBACK;  -- Use COMMIT to persist if desired
