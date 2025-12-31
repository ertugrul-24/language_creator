# Fix Schema Cache Error - "Could not find 'icon_url' column"

## Problem

When creating a new language, you get this error:
```
Failed to create language: Could not find the 'icon_url' column of 'languages' in the schema cache.
```

## Root Cause

Supabase maintains a schema cache for performance. When you:
1. Create new tables or add columns via SQL
2. The changes are applied to the database
3. BUT the cache doesn't update immediately
4. Your application queries the old cached schema
5. Error: "Column not found in schema cache"

## Solution (3 Steps)

### Step 1: Ensure Columns Exist (2 minutes)

Run this SQL in Supabase Dashboard → SQL Editor:

```sql
-- Run this file: docs/FIX_SCHEMA_CACHE.sql
```

This will:
- Add `icon_url` column if missing
- Add `cover_image_url` column if missing
- Add other missing columns
- Force schema cache refresh

**How to run:**
1. Open [Supabase Dashboard](https://app.supabase.com)
2. Go to SQL Editor
3. Click New Query
4. Copy the entire contents of `docs/FIX_SCHEMA_CACHE.sql`
5. Paste into the editor
6. Click Run

### Step 2: Refresh Application (1 minute)

After running the SQL:

1. **Hard refresh your browser** (Ctrl+Shift+R or Cmd+Shift+R)
2. This clears your local cache
3. Forces re-fetch of updated schema

### Step 3: Test Language Creation (5 minutes)

1. Sign up a new test user (if needed)
2. Go to "Create New Language"
3. Fill in form:
   - Name: "Test Language"
   - Description: "Testing the fix"
   - Icon: Leave default or choose one
4. Click "Create Language"
5. **Expected result:** ✅ Language created successfully

---

## Verify Fix Worked

### Check 1: Supabase Database

1. Supabase Dashboard → Table Editor
2. Click on `languages` table
3. Look for your test language row
4. Check these columns are populated:
   - `id` ✅
   - `owner_id` ✅
   - `name` ✅
   - `description` ✅
   - `icon_url` ✅

### Check 2: Collaborator Entry

1. Supabase Dashboard → Table Editor
2. Click on `language_collaborators` table
3. Look for entry with:
   - `language_id` = your language's ID
   - `user_id` = your user's ID
   - `role` = 'owner' ✅

### Check 3: Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for logs from `createLanguage()`:
   ```
   [createLanguage] ✅ Language inserted successfully
   [createLanguage] ✅ Collaborator added successfully
   [createLanguage] ✅ COMPLETE!
   ```

---

## If Still Getting Error

### Error: Still says "icon_url" column not found

**Step 1: Verify columns actually exist**

Run this verification query in Supabase SQL Editor:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'languages'
ORDER BY column_name;
```

**Expected output:** Should show `icon_url` and `cover_image_url`

**If not showing:**
- The ALTER TABLE didn't work
- Try running the full schema creation again
- See "Complete Fresh Schema" section below

### Error: Application still using cached schema

**Hard refresh might not be enough:**

1. Close all tabs with your app open
2. Open browser DevTools (F12)
3. Go to Application → Cache Storage
4. Delete all cache entries
5. Close DevTools
6. Reopen your app
7. Try again

### Error: Still failing, database shows columns

**Supabase SDK cache issue:**

The Supabase SDK might be caching the schema. Force re-initialization:

1. Hard refresh browser (Ctrl+Shift+R)
2. Wait 30 seconds
3. Try again

If still failing:

The Supabase SDK sometimes needs to re-fetch the schema. Try:

```typescript
// In browser console, type:
window.location.reload(true);
```

---

## Complete Fresh Schema (Nuclear Option)

If nothing above works, completely recreate the languages table:

⚠️ **WARNING:** This will delete all existing language data!

Only do this if:
- You have no production data
- You're testing/debugging
- Columns are completely missing

**Step 1:** Run this SQL in Supabase (one query at a time):

```sql
-- First, drop dependent tables
DROP TABLE IF EXISTS language_collaborators CASCADE;

-- Then drop the main table
DROP TABLE IF EXISTS languages CASCADE;

-- Then recreate with full schema
CREATE TABLE languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'friends', 'public')),
  
  -- Language Specifications
  alphabet_script TEXT,
  writing_direction TEXT DEFAULT 'ltr' CHECK (writing_direction IN ('ltr', 'rtl', 'boustrophedon')),
  depth_level TEXT DEFAULT 'realistic' CHECK (depth_level IN ('realistic', 'simplified')),
  word_order TEXT,
  case_sensitive BOOLEAN DEFAULT FALSE,
  vowel_count INTEGER,
  consonant_count INTEGER,
  
  -- Metadata
  icon_url TEXT,
  cover_image_url TEXT,
  tags TEXT[],
  
  -- Stats
  total_words INTEGER DEFAULT 0,
  total_rules INTEGER DEFAULT 0,
  total_contributors INTEGER DEFAULT 1,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_languages_owner_id ON languages(owner_id);
CREATE INDEX idx_languages_visibility ON languages(visibility);

-- Recreate language_collaborators
CREATE TABLE language_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(language_id, user_id)
);

CREATE INDEX idx_language_collaborators_language_id ON language_collaborators(language_id);
CREATE INDEX idx_language_collaborators_user_id ON language_collaborators(user_id);

-- Enable RLS
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE language_collaborators ENABLE ROW LEVEL SECURITY;

-- Re-apply RLS policies (from SUPABASE_RLS_IMPROVEMENTS.sql)
-- [Copy and paste RLS policies here if needed]
```

**Step 2:** Hard refresh browser
**Step 3:** Try creating language again

---

## Quick Checklist

- [ ] Run `docs/FIX_SCHEMA_CACHE.sql` in Supabase SQL Editor
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Try creating a test language
- [ ] Check Supabase table for new row
- [ ] Check browser console for ✅ logs
- [ ] Verify collaborator entry created

---

## Schema Column Reference

The `languages` table should have:

| Column | Type | Required | Purpose |
|--------|------|----------|---------|
| id | UUID | Yes | Primary key |
| owner_id | UUID | Yes | Foreign key to users.id |
| name | TEXT | Yes | Language name |
| description | TEXT | No | Language description |
| icon_url | TEXT | No | URL to icon image |
| cover_image_url | TEXT | No | URL to cover image |
| visibility | TEXT | No | private/friends/public |
| alphabet_script | TEXT | No | Latin/Cyrillic/etc |
| writing_direction | TEXT | No | ltr/rtl/boustrophedon |
| depth_level | TEXT | No | realistic/simplified |
| word_order | TEXT | No | SVO/SOV/VSO/etc |
| case_sensitive | BOOLEAN | No | Whether case matters |
| vowel_count | INTEGER | No | Number of vowels |
| consonant_count | INTEGER | No | Number of consonants |
| tags | TEXT[] | No | Array of tags |
| total_words | INTEGER | No | Word count |
| total_rules | INTEGER | No | Rule count |
| total_contributors | INTEGER | No | Contributor count |
| created_at | TIMESTAMP | Yes | Created timestamp |
| updated_at | TIMESTAMP | Yes | Updated timestamp |

---

## Code Reference

The `createLanguage()` function inserts:

```typescript
const languageData = {
  owner_id: userId,           // ← Your user's ID
  name: input.name.trim(),    // ← From form
  description: input.description.trim(), // ← From form
  icon_url: input.icon || '🌍', // ← From form or default emoji
};
```

All other columns are optional and default to NULL or their default values.

---

## Next Steps

After fixing:

1. ✅ Complete P1.3 verification
2. ✅ Document this fix
3. ✅ Move to P1.4: Build language dashboard page
4. ✅ Implement language list page (P1.5)

---

**Status:** Ready to implement  
**Time:** 10 minutes  
**Risk:** Low (non-destructive fix)
