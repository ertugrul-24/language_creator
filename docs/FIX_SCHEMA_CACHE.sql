-- ============================================================================
-- Supabase Schema Cache Fix - Add Missing Columns to languages Table
-- ============================================================================
--
-- Error: "Could not find the 'icon_url' column of 'languages' in the schema cache"
--
-- This can happen when:
-- 1. The schema hasn't been deployed to Supabase
-- 2. The schema cache is stale
-- 3. The columns were dropped or not created
--
-- Solution: Run this SQL in Supabase Dashboard → SQL Editor
-- This will add missing columns and refresh the schema
--
-- ============================================================================

-- Step 1: Check existing columns
-- Run this to see what columns currently exist:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'languages' ORDER BY column_name;

-- Step 2: Add missing columns if they don't exist
-- These commands are safe - they only add if the column doesn't exist

-- Add icon_url column if missing
ALTER TABLE languages ADD COLUMN IF NOT EXISTS icon_url TEXT;

-- Add cover_image_url column if missing
ALTER TABLE languages ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Add tags array column if missing
ALTER TABLE languages ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add total_words column if missing
ALTER TABLE languages ADD COLUMN IF NOT EXISTS total_words INTEGER DEFAULT 0;

-- Add total_rules column if missing
ALTER TABLE languages ADD COLUMN IF NOT EXISTS total_rules INTEGER DEFAULT 0;

-- Add total_contributors column if missing
ALTER TABLE languages ADD COLUMN IF NOT EXISTS total_contributors INTEGER DEFAULT 1;

-- Step 3: Refresh schema cache
-- Supabase uses a schema cache for performance. After adding columns, 
-- the cache needs to be refreshed. You can force this by:

-- Option A: Run this query (forces cache refresh)
SELECT pg_sleep(0);

-- Option B: Reconnect to Supabase in your application
-- Option C: Use Supabase Dashboard to refresh (usually automatic)

-- Step 4: Verify columns were created
-- After running this script, run this verification query:
/*
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'languages' 
ORDER BY column_name;

Expected columns:
- alphabet_script: TEXT
- case_sensitive: BOOLEAN
- consonant_count: INTEGER
- cover_image_url: TEXT
- created_at: TIMESTAMP WITH TIME ZONE
- depth_level: TEXT
- description: TEXT
- id: UUID
- icon_url: TEXT
- name: TEXT
- owner_id: UUID
- tags: TEXT[]
- total_contributors: INTEGER
- total_rules: INTEGER
- total_words: INTEGER
- updated_at: TIMESTAMP WITH TIME ZONE
- visibility: TEXT
- vowel_count: INTEGER
- word_order: TEXT
*/

-- Step 5: If all columns exist, verify foreign key relationships
-- SELECT constraint_name, table_name, column_name 
-- FROM information_schema.key_column_usage 
-- WHERE table_name = 'languages';

-- ============================================================================
-- COMPLETE LANGUAGES TABLE SCHEMA (for reference)
-- ============================================================================
-- If you want to completely recreate the table, uncomment below:
-- WARNING: This will DELETE all existing data!
--
-- DROP TABLE IF EXISTS languages CASCADE;
-- CREATE TABLE languages (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--   name TEXT NOT NULL,
--   description TEXT,
--   visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'friends', 'public')),
--   alphabet_script TEXT,
--   writing_direction TEXT DEFAULT 'ltr' CHECK (writing_direction IN ('ltr', 'rtl', 'boustrophedon')),
--   depth_level TEXT DEFAULT 'realistic' CHECK (depth_level IN ('realistic', 'simplified')),
--   word_order TEXT,
--   case_sensitive BOOLEAN DEFAULT FALSE,
--   vowel_count INTEGER,
--   consonant_count INTEGER,
--   icon_url TEXT,
--   cover_image_url TEXT,
--   tags TEXT[],
--   total_words INTEGER DEFAULT 0,
--   total_rules INTEGER DEFAULT 0,
--   total_contributors INTEGER DEFAULT 1,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );
-- CREATE INDEX idx_languages_owner_id ON languages(owner_id);
-- CREATE INDEX idx_languages_visibility ON languages(visibility);

-- ============================================================================
-- TESTING AFTER FIX
-- ============================================================================
-- After running this script:
--
-- 1. Reload your application (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
-- 2. Sign up as a new user (if not already done)
-- 3. Try creating a language via the app
-- 4. Check browser console for logs
-- 5. If successful, check Supabase table for new row
--
-- Expected flow:
-- - Form submission
-- - createLanguage() function called
-- - INSERT into languages with all columns ✅
-- - INSERT into language_collaborators ✅
-- - Language appears in Supabase dashboard ✅

