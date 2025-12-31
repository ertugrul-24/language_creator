-- ============================================================================
-- IMPROVED RLS POLICIES FOR LANGUAGE_COLLABORATORS
-- ============================================================================
-- These are simplified, more reliable versions of the RLS policies.
-- They focus on the core permission model and are easier to debug.
--
-- USAGE:
-- 1. Copy all SQL from this file
-- 2. Go to Supabase Dashboard → SQL Editor
-- 3. Create a new query and paste all SQL
-- 4. Run the entire script
-- 5. Verify no errors
--
-- ============================================================================

-- ============================================================================
-- STEP 1: IMPROVED LANGUAGE COLLABORATORS POLICIES
-- ============================================================================
-- These replace the old policies and are more reliable

-- Drop old policies if they exist
DROP POLICY IF EXISTS language_collaborators_insert ON language_collaborators;
DROP POLICY IF EXISTS language_collaborators_update ON language_collaborators;
DROP POLICY IF EXISTS language_collaborators_delete ON language_collaborators;
DROP POLICY IF EXISTS language_collaborators_select ON language_collaborators;

-- SELECT: Anyone can view collaborators for accessible languages
CREATE POLICY language_collaborators_select ON language_collaborators FOR SELECT
  USING (
    -- User can view collaborators if they can view the language
    EXISTS (
      SELECT 1 FROM languages
      WHERE id = language_collaborators.language_id
      AND (
        visibility = 'public'
        OR owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM language_collaborators lc2
          WHERE lc2.language_id = languages.id
          AND lc2.user_id = auth.uid()
        )
      )
    )
  );

-- INSERT: Only language owner can add collaborators
-- This is the most important policy for language creation
CREATE POLICY language_collaborators_insert ON language_collaborators FOR INSERT
  WITH CHECK (
    -- Check if the user doing the insert is the owner of the language
    EXISTS (
      SELECT 1 FROM languages
      WHERE id = language_collaborators.language_id
      AND owner_id = auth.uid()
    )
  );

-- UPDATE: Only language owner can modify collaborators
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

-- DELETE: Only language owner can remove collaborators
CREATE POLICY language_collaborators_delete ON language_collaborators FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM languages
      WHERE id = language_collaborators.language_id
      AND owner_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 2: VERIFY INDEXES EXIST (Performance optimization)
-- ============================================================================
-- These queries check if performance indexes exist
-- Copy and run individually to verify:

-- Check if languages owner_id index exists:
-- SELECT indexname FROM pg_indexes 
-- WHERE tablename = 'languages' AND indexname LIKE '%owner%';
-- Expected output: idx_languages_owner_id

-- Check if language_collaborators indexes exist:
-- SELECT indexname FROM pg_indexes 
-- WHERE tablename = 'language_collaborators' 
-- ORDER BY indexname;
-- Expected output: idx_language_collaborators_language_id, idx_language_collaborators_user_id

-- ============================================================================
-- STEP 3: TRIGGER VERIFICATION QUERIES
-- ============================================================================
-- Copy and run these individually to verify the trigger exists and works:

-- Check if handle_new_user function exists:
-- SELECT proname, prosecdef FROM pg_proc WHERE proname = 'handle_new_user';
-- Expected output: handle_new_user | t (t means SECURITY DEFINER is set)

-- Check if on_auth_user_created trigger exists:
-- SELECT trigger_name, event_object_table, action_timing, action_orientation
-- FROM information_schema.triggers 
-- WHERE trigger_name = 'on_auth_user_created';
-- Expected output: on_auth_user_created | users | AFTER | ROW

-- ============================================================================
-- STEP 4: RLS POLICY VERIFICATION
-- ============================================================================
-- Copy and run this to see all policies on language_collaborators:

-- SELECT policyname, roles, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename = 'language_collaborators'
-- ORDER BY policyname;
-- Expected output: 4 policies (select, insert, update, delete)

-- ============================================================================
-- STEP 5: DEBUGGING QUERIES
-- ============================================================================
-- Use these to debug issues after implementation:

-- Query 1: Check all users in the users table
-- SELECT id, auth_id, email, display_name, created_at 
-- FROM users 
-- ORDER BY created_at DESC;

-- Query 2: Check a specific user's languages
-- SELECT id, owner_id, name, description, created_at 
-- FROM languages 
-- WHERE owner_id = 'REPLACE_WITH_USER_ID'
-- ORDER BY created_at DESC;

-- Query 3: Check collaborators for a specific language
-- SELECT lc.id, lc.language_id, lc.user_id, lc.role, u.email
-- FROM language_collaborators lc
-- LEFT JOIN users u ON lc.user_id = u.id
-- WHERE lc.language_id = 'REPLACE_WITH_LANGUAGE_ID';

-- Query 4: Count operations to verify success
-- SELECT 
--   (SELECT COUNT(*) FROM users) as total_users,
--   (SELECT COUNT(*) FROM languages) as total_languages,
--   (SELECT COUNT(*) FROM language_collaborators) as total_collaborators;

-- ============================================================================
-- END OF IMPROVED RLS POLICIES
-- ============================================================================
