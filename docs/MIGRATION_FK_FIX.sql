-- ============================================================================
-- MIGRATION: Fix Foreign Key languages.owner_id
-- ============================================================================
--
-- Problem:
-- - languages.owner_id currently references users(id)
-- - This creates a dependency on a separate users table row
-- - AuthContext was trying to create user records, causing complexity
-- - FK error: "insert or update on table languages violates foreign key 
--   constraint languages_owner_id_fkey"
-- - Root cause: languages.owner_id tries to reference users(id) that doesn't exist
--
-- Solution:
-- - Change languages.owner_id to reference auth.users(id) instead
-- - Eliminates need for separate user record creation
-- - Simplifies auth flow (direct use of Supabase auth)
-- - Uses Supabase's built-in authentication user IDs
--
-- Steps to run:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Copy entire contents of this file
-- 3. Click "Run" - executes all statements
-- 4. Verify: "Success. No rows returned" message
-- 5. Update your application code (AuthContext + languageService)
--
-- ============================================================================
-- STEP 1: Drop the old foreign key constraint
-- ============================================================================
-- Current: languages.owner_id REFERENCES users(id) ON DELETE CASCADE
-- This references the internal users table we tried to maintain
--
ALTER TABLE languages 
DROP CONSTRAINT languages_owner_id_fkey;

-- ============================================================================
-- STEP 2: Add new foreign key to auth.users
-- ============================================================================
-- New: languages.owner_id REFERENCES auth.users(id) ON DELETE CASCADE
-- This directly references Supabase's authentication table
-- When a user is deleted from Supabase Auth, their languages are cascade deleted
--
ALTER TABLE languages
ADD CONSTRAINT languages_owner_id_fkey 
FOREIGN KEY (owner_id) 
REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================================
-- STEP 3: Update language_collaborators to reference auth.users
-- ============================================================================
-- This table also needs to reference auth.users, not the internal users table
--
ALTER TABLE language_collaborators
DROP CONSTRAINT language_collaborators_user_id_fkey;

ALTER TABLE language_collaborators
ADD CONSTRAINT language_collaborators_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
--
-- What changed:
-- ✓ languages.owner_id now references auth.users(id)
-- ✓ language_collaborators.user_id now references auth.users(id)
-- ✓ Removed dependency on internal users table for Phase 1
--
-- Impact on application code:
--
-- 1. AuthContext changes:
--    - BEFORE: user.id = internal users.id (from users table)
--    - AFTER:  user.id = auth.users.id (Supabase authentication)
--    - REMOVED: Two-phase initialization with user record creation
--    - SIMPLE: Use auth.users.id directly
--
-- 2. Service layer (languageService):
--    - No changes needed! Already uses user.id as owner_id
--    - Now works correctly with auth.users.id
--
-- 3. RLS Policies:
--    - Already correct! They use auth.uid() which equals auth.users.id
--    - Policy: "auth.uid() = owner_id" ✓ Works perfectly now
--
-- 4. Users table (optional for Phase 1):
--    - Can keep it for extended user profiles
--    - Can drop it if not needed
--    - Not required for language creation anymore
--
-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================
--
-- If migration fails:
-- 1. Check if there are rows in languages/language_collaborators 
--    with invalid owner_id/user_id values
-- 2. Run: SELECT * FROM languages WHERE owner_id NOT IN (
--           SELECT id FROM auth.users);
-- 3. If found, delete those orphaned records first
-- 4. Then retry the migration
--
-- ============================================================================

