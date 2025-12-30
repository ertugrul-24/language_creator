-- ============================================================================
-- LinguaFabric Phase 1 RLS Policies - SIMPLIFIED
-- ============================================================================
--
-- Phase 1 uses ONLY:
-- - owner_id (UUID, FK to auth.users)
-- - name (text)
-- - description (text)
-- - icon (text)
--
-- No visibility, collaborators, or public languages in Phase 1
-- Each user can only access their own languages
--
-- To apply these policies:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Copy entire contents of this file
-- 3. Run each policy one by one or all at once
-- 4. Verify: Each policy shows "Success" message
--
-- ============================================================================

-- STEP 1: Drop old Phase 1.2+ policies (if they exist)
-- ============================================================================

DROP POLICY IF EXISTS "languages_select" ON languages;
DROP POLICY IF EXISTS "languages_insert" ON languages;
DROP POLICY IF EXISTS "languages_update" ON languages;
DROP POLICY IF EXISTS "languages_delete" ON languages;

-- ============================================================================
-- STEP 2: Create Phase 1 RLS Policies - Minimal and Secure
-- ============================================================================

-- Phase 1 INSERT Policy
-- Authenticated users can insert a language if owner_id matches their auth ID
CREATE POLICY "languages_phase1_insert" ON languages
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Phase 1 SELECT Policy
-- Authenticated users can only read languages they own
CREATE POLICY "languages_phase1_select" ON languages
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- Phase 1 UPDATE Policy
-- Only the owner can update their own language
CREATE POLICY "languages_phase1_update" ON languages
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Phase 1 DELETE Policy
-- Only the owner can delete their own language
CREATE POLICY "languages_phase1_delete" ON languages
FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- ============================================================================
-- VERIFICATION
-- ============================================================================
--
-- After creating policies, verify they exist:
--
-- SELECT schemaname, tablename, policyname, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'languages'
-- ORDER BY policyname;
--
-- Expected output:
-- - languages_phase1_insert (INSERT)
-- - languages_phase1_select (SELECT)
-- - languages_phase1_update (UPDATE)
-- - languages_phase1_delete (DELETE)
--
-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================
--
-- If you get "RLS violation" errors:
--
-- 1. Verify RLS is ENABLED on languages table:
--    SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'languages';
--    Should show: relrowsecurity = true
--
-- 2. Verify owner_id is being set to auth.uid():
--    The frontend MUST send: owner_id = auth.uid()
--    (NOT a different user ID or internal UUID)
--
-- 3. Verify policies use TO authenticated:
--    All policies should have "TO authenticated"
--    This means only logged-in users can access
--
-- 4. Verify auth context is working:
--    User must be authenticated (user !== null)
--    User must have auth.uid() available
--
-- 5. Test with psql:
--    SET ROLE authenticated;
--    SET app.jwt.claims.sub = '12345678-1234-1234-1234-123456789abc';
--    SELECT * FROM languages;
--
-- ============================================================================
-- NOTES
-- ============================================================================
--
-- Phase 1 Architecture:
-- - Each user owns their own languages
-- - No sharing or collaboration (Phase 3 feature)
-- - No public languages (Phase 1.4 feature)
-- - Simplest possible permissions model
--
-- RLS Policy Names:
-- - Use "languages_phase1_*" naming to clearly indicate Phase 1
-- - Makes it easy to identify and replace in future phases
-- - Can drop "languages_phase1_*" policies when adding Phase 1.2+ features
--
-- Security Principle:
-- - "Closed by default" - users can only access their own data
-- - No "deny" policies needed - positive allowlist only
-- - Auth.uid() is always the source of truth for identity
--
-- ============================================================================
