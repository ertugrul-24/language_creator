-- ============================================================================
-- DIAGNOSTIC: Verify Grammar Rules Table Schema
-- ============================================================================
-- Run this in Supabase SQL Editor to verify table exists and has correct schema

-- Check if table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'grammar_rules'
) as table_exists;

-- Check table structure and columns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'grammar_rules'
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'grammar_rules'
ORDER BY indexname;

-- Check RLS policies
SELECT 
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'grammar_rules'
ORDER BY policyname;

-- Check if RLS is enabled
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'grammar_rules' AND relnamespace = (
  SELECT oid FROM pg_namespace WHERE nspname = 'public'
);

-- ============================================================================
-- TEST: Try inserting a test rule (if you want to debug)
-- ============================================================================
-- Uncomment below to test manual insert as authenticated user
-- Replace YOUR_USER_ID with actual user UUID from auth.users

-- INSERT INTO public.grammar_rules (
--   language_id,
--   owner_id,
--   name,
--   description,
--   category,
--   rule_type,
--   pattern,
--   examples,
--   created_at,
--   updated_at
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000001'::uuid,  -- language_id
--   '00000000-0000-0000-0000-000000000001'::uuid,  -- owner_id (YOUR_USER_ID)
--   'Test Rule',
--   'Test Description',
--   'morphology',
--   'inflection',
--   'test_pattern',
--   '[]'::jsonb,
--   NOW(),
--   NOW()
-- );
