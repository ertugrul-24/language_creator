-- ============================================================================
-- LinguaFabric - Supabase Fixes for Language Creation
-- ============================================================================
--
-- This file contains SQL commands to fix the language creation flow.
-- These fixes enable the RLS policies to work correctly.
--
-- CRITICAL FIX #1: User Creation Trigger
-- ============================================================================
-- When a user signs up with Supabase Auth, a row is NOT automatically created
-- in the public.users table. This breaks RLS policies that depend on user.id.
--
-- Solution: Create a trigger that fires when auth.users gets a new row,
-- and automatically creates a corresponding row in public.users.
--
-- USAGE:
-- 1. Copy all SQL from this file
-- 2. Go to Supabase Dashboard → SQL Editor
-- 3. Create a new query and paste all SQL
-- 4. Run the entire script
-- 5. Check that it completes without errors
-- 6. NEW SIGNUPS will automatically populate the users table
--
-- ============================================================================

-- Step 1: Create the function that handles new user signups
-- This function is called by the trigger below
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert a row into public.users whenever a new user signs up via auth
  INSERT INTO public.users (auth_id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  )
  ON CONFLICT (auth_id) DO NOTHING;  -- Prevent duplicate inserts
  
  RETURN NEW;
END;
$$;

-- Step 2: Create the trigger
-- This fires AFTER a new row is inserted into auth.users
-- We use AFTER INSERT (not BEFORE) to ensure the auth.users row is valid
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these AFTER implementing the fixes to verify everything works:

-- Check 1: Verify the function exists
-- Expected output: Should show handle_new_user function
-- SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';

-- Check 2: Verify the trigger exists
-- Expected output: Should show on_auth_user_created trigger
-- SELECT trigger_name FROM information_schema.triggers 
-- WHERE trigger_name = 'on_auth_user_created';

-- Check 3: After a new user signs up, check if they appear in public.users
-- Expected output: New user should have an auth_id value
-- SELECT auth_id, email, display_name, created_at FROM users ORDER BY created_at DESC LIMIT 1;

-- ============================================================================
-- IMPROVED RLS POLICIES FOR LANGUAGE_COLLABORATORS
-- ============================================================================
-- The original policy for INSERT has a subtle issue:
-- It checks if the user is the owner, but doesn't verify the user exists in users table.
-- 
-- This improved version is more robust and handles edge cases better.
--
-- WARNING: These will REPLACE existing policies of the same name
-- ============================================================================

-- Drop the old policies (they will be recreated below)
DROP POLICY IF EXISTS language_collaborators_insert ON language_collaborators CASCADE;
DROP POLICY IF EXISTS language_collaborators_update ON language_collaborators CASCADE;
DROP POLICY IF EXISTS language_collaborators_delete ON language_collaborators CASCADE;

-- New simplified INSERT policy
-- Allow insert if the user inserting is the owner of the language
CREATE POLICY language_collaborators_insert ON language_collaborators FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM languages
      WHERE id = language_collaborators.language_id
      AND owner_id = auth.uid()
    )
  );

-- New UPDATE policy
-- Only allow update if the user is the language owner
CREATE POLICY language_collaborators_update ON language_collaborators FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM languages
      WHERE id = language_collaborators.language_id
      AND owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM languages
      WHERE id = language_collaborators.language_id
      AND owner_id = auth.uid()
    )
  );

-- DELETE policy
-- Only allow delete if the user is the language owner
CREATE POLICY language_collaborators_delete ON language_collaborators FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM languages
      WHERE id = language_collaborators.language_id
      AND owner_id = auth.uid()
    )
  );

-- ============================================================================
-- VERIFY LANGUAGES TABLE OWNER_ID COLUMN
-- ============================================================================
-- Check if owner_id column exists
-- If this query returns no rows, the column needs to be added

-- Note: The owner_id column SHOULD already exist based on the schema.sql
-- But if it doesn't, uncomment and run this:
-- ALTER TABLE languages ADD COLUMN owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE;

-- Verify the column exists:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'languages' AND column_name = 'owner_id';

-- ============================================================================
-- INDEX VERIFICATION
-- ============================================================================
-- These indexes should already exist, but verify they do:

-- Check if indexes exist
-- SELECT indexname FROM pg_indexes 
-- WHERE tablename = 'languages' AND indexname = 'idx_languages_owner_id';

-- SELECT indexname FROM pg_indexes 
-- WHERE tablename = 'language_collaborators' AND indexname LIKE '%user_id%';

-- ============================================================================
-- DEBUGGING QUERIES
-- ============================================================================
-- Use these queries to debug issues:

-- 1. Check all users that have been created
-- SELECT id, auth_id, email, display_name, created_at FROM users ORDER BY created_at DESC;

-- 2. Check all languages created by a user
-- SELECT l.id, l.name, l.owner_id, l.created_at, 
--        (SELECT COUNT(*) FROM language_collaborators WHERE language_id = l.id) as collaborator_count
-- FROM languages l
-- WHERE l.owner_id = 'user-id-here'
-- ORDER BY l.created_at DESC;

-- 3. Check collaborators for a specific language
-- SELECT lc.id, lc.language_id, lc.user_id, lc.role, u.email
-- FROM language_collaborators lc
-- LEFT JOIN users u ON lc.user_id = u.id
-- WHERE lc.language_id = 'language-id-here';

-- 4. Check RLS policy violations (these would fail if there's an issue)
-- SELECT * FROM languages WHERE owner_id = auth.uid() LIMIT 1;
-- SELECT * FROM language_collaborators WHERE user_id = auth.uid() LIMIT 1;

-- ============================================================================
-- IMPLEMENTATION CHECKLIST
-- ============================================================================
-- 
-- After running this SQL, verify the following:
--
-- [ ] The handle_new_user() function exists
--     Verify: SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';
--
-- [ ] The on_auth_user_created trigger exists
--     Verify: SELECT trigger_name FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';
--
-- [ ] The RLS policies have been updated
--     Verify: SELECT policyname FROM pg_policies WHERE tablename = 'language_collaborators';
--
-- [ ] Test with a new user signup:
--     1. Go to app and sign up with a new email
--     2. Check Supabase users table - should see new row in auth.users
--     3. Check Supabase users table - should see new row in public.users
--     4. Create a language in the app
--     5. Verify language row created in languages table
--     6. Verify owner entry created in language_collaborators table
--
-- ============================================================================
-- REFERENCE: LINGUISTIC FLOW
-- ============================================================================
--
-- Before these fixes:
-- 1. User signs up
--    ↓ auth.users gets new row
--    ↓ public.users stays empty ❌
-- 2. User creates language
--    ↓ languages INSERT succeeds (owner_id uses auth.uid())
--    ↓ language_collaborators INSERT fails ❌ (RLS policy fails)
--
-- After these fixes:
-- 1. User signs up
--    ↓ auth.users gets new row
--    ↓ Trigger fires → public.users gets new row ✅
-- 2. User creates language
--    ↓ languages INSERT succeeds ✅
--    ↓ language_collaborators INSERT succeeds ✅
--    ↓ Collaborator role="owner" set ✅
--
-- ============================================================================
