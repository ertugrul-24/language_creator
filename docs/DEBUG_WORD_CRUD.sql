-- Debug & Fix: Word CRUD Operations Not Working
-- Date: February 3, 2026
-- Purpose: Verify RLS policies are applied and surface any issues

-- ============================================================================
-- STEP 1: Verify RLS is enabled on words table
-- ============================================================================
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'words' AND schemaname = 'public';

-- Expected output: tablename = 'words', rowsecurity = true

-- ============================================================================
-- STEP 2: List all RLS policies on words table
-- ============================================================================
SELECT policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'words'
ORDER BY policyname;

-- Expected: 4 policies:
-- - Users can insert words they own
-- - Users can view their own words
-- - Users can update their own words
-- - Users can delete their own words

-- ============================================================================
-- STEP 3: Check if word exists and belongs to current user
-- ============================================================================
-- Run this as authenticated user:
SELECT id, word, translation, owner_id, created_at
FROM public.words
LIMIT 5;

-- ============================================================================
-- STEP 4: Verify UPDATE works (test as admin if needed)
-- ============================================================================
-- Test UPDATE - change a word:
-- UPDATE public.words
-- SET word = 'updated_word', translation = 'updated_translation'
-- WHERE id = '[word_id]'
-- RETURNING *;

-- ============================================================================
-- STEP 5: Verify DELETE works
-- ============================================================================
-- Test DELETE - remove a word:
-- DELETE FROM public.words
-- WHERE id = '[word_id]'
-- RETURNING *;

-- ============================================================================
-- STEP 6: Count words for language stats
-- ============================================================================
SELECT language_id, COUNT(*) as word_count
FROM public.words
GROUP BY language_id;

-- ============================================================================
-- STEP 7: Verify owner_id is correctly set
-- ============================================================================
SELECT id, word, owner_id, auth.uid() as current_user
FROM public.words
LIMIT 1;

-- ============================================================================
-- Notes:
-- ============================================================================
-- If RLS policies are missing or disabled:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Copy and paste the CREATE_WORDS_TABLE.sql
-- 3. Run the entire script
-- 4. Verify results with this script
-- 
-- If UPDATE/DELETE still don't work:
-- 1. Check browser console for exact error message
-- 2. Verify user ID matches owner_id in database
-- 3. Check that auth.uid() returns the correct user ID
-- 4. Ensure user is authenticated before operations
