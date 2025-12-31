-- ============================================================================
-- CRITICAL: Ensure SELECT RLS Policy Exists on languages
-- ============================================================================
--
-- This policy is needed for users to read their own languages
-- If this doesn't exist, SELECT queries return 0 rows (RLS blocks all)
--
-- Problem: Languages exist in DB but aren't visible in UI
-- Cause: Missing or incorrect SELECT RLS policy
-- Solution: Create simple SELECT policy for Phase 1
--
-- ============================================================================

-- VERIFY current policies exist
SELECT policyname, qual, with_check
FROM pg_policies
WHERE tablename = 'languages'
ORDER BY policyname;

-- ============================================================================
-- If languages_phase1_select policy is MISSING, run this:
-- ============================================================================

-- Create the SELECT policy if it doesn't exist
CREATE POLICY IF NOT EXISTS "languages_phase1_select" ON public.languages
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- ============================================================================
-- VERIFY the policy was created
-- ============================================================================

SELECT policyname
FROM pg_policies
WHERE tablename = 'languages' AND policyname LIKE '%select%';

-- Expected: Should show "languages_phase1_select"

-- ============================================================================
-- TROUBLESHOOT: If still not working
-- ============================================================================

-- Check if RLS is actually enabled on the table:
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'languages';

-- Expected: relrowsecurity = true

-- ============================================================================
-- MANUAL TEST: Try to read languages as authenticated user
-- ============================================================================

-- If you know your auth user ID, you can test:
-- Replace '12345678-1234-1234-1234-123456789abc' with your actual auth ID

-- Test 1: Direct query (this would need auth context)
-- SELECT * FROM languages WHERE owner_id = '12345678-1234-1234-1234-123456789abc';

-- Test 2: Check what Supabase sees
-- The frontend will use the authenticated session
-- If it's not working, check browser console for logs

-- ============================================================================
