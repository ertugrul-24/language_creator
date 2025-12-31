# 🚀 Complete Fix Guide: Schema Cache Error & Language Creation

## Problem Summary

When creating a new language, you see:
```
Failed to create language: Could not find the 'icon_url' column of 'languages' in the schema cache.
```

## Root Cause

The `icon_url` column exists in your Supabase database, but the **schema cache** hasn't been updated. Supabase caches schema information for performance, and sometimes it doesn't refresh automatically when columns are added.

## Complete Fix (3 Simple Steps)

### Step 1: Run Fix SQL (2 minutes)

**Open Supabase Dashboard:**
1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**

**Run the fix:**
1. Open file: `docs/FIX_SCHEMA_CACHE.sql`
2. Copy **entire file** contents
3. Paste into SQL Editor
4. Click **Run**

**Expected output:**
```
ALTER TABLE languages ADD COLUMN IF NOT EXISTS icon_url TEXT;
-> Success (or column already exists)

ALTER TABLE languages ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
-> Success (or column already exists)

[Additional columns...]
```

### Step 2: Refresh Browser (1 minute)

After running SQL:

1. **Hard refresh** your browser
   - **Windows/Linux:** Ctrl + Shift + R
   - **Mac:** Cmd + Shift + R
   
2. This clears your local cache and forces re-fetch of schema

### Step 3: Test Language Creation (5 minutes)

1. Go to your app (http://localhost:5173)
2. Sign up as a **NEW user** (important - if already logged in, log out first)
3. Navigate to **"Create New Language"**
4. Fill form:
   - **Name:** "Test Language"
   - **Description:** "Testing the fix"
   - **Icon:** Leave default or choose emoji
5. Click **"Create Language"**

**Expected result:**
```
✅ Language created successfully
✅ Console shows green checkmarks
✅ No errors
✅ Language appears in Supabase dashboard
```

---

## Verification (5 minutes)

### Check 1: Verify Column Exists

In Supabase SQL Editor, run:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'languages'
ORDER BY column_name;
```

**Look for:**
- ✅ `cover_image_url` (TEXT)
- ✅ `icon_url` (TEXT)

### Check 2: Verify Language Created

In Supabase Dashboard:
1. Go to **Table Editor**
2. Click **languages** table
3. Look for your "Test Language" row
4. Verify columns populated:
   - ✅ `id` (UUID)
   - ✅ `owner_id` (matches your user ID)
   - ✅ `name` ("Test Language")
   - ✅ `description` ("Testing the fix")
   - ✅ `icon_url` (has value or emoji)

### Check 3: Verify Collaborator Entry

In Supabase Dashboard:
1. Go to **Table Editor**
2. Click **language_collaborators** table
3. Look for entry with:
   - ✅ `language_id` (matches your language)
   - ✅ `user_id` (matches your user)
   - ✅ `role` ("owner")

### Check 4: Browser Console Logs

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for:
```
[createLanguage] ✅ Language inserted successfully
[createLanguage] ✅ Collaborator added successfully
[createLanguage] ✅ COMPLETE!
```

---

## If Still Getting Error

### Scenario 1: Still says "icon_url" column not found

**Solution:**

1. Run verification query again:
```sql
SELECT * FROM information_schema.columns 
WHERE table_name = 'languages' AND column_name = 'icon_url';
```

2. If no result → column doesn't exist
   - Run `docs/FIX_SCHEMA_CACHE.sql` again
   - Run in smaller chunks (one ALTER TABLE at a time)

3. If column exists but still error:
   - Hard refresh browser again
   - Clear browser cache completely:
     - DevTools (F12) → Application → Cache Storage → Delete all

### Scenario 2: Different error appears

**Check the error message:**

- **"owner_id is required"** → Use correct column name: it's `owner_id` not `owner`
- **"languages table not found"** → Run full schema from `docs/supabase_schema.sql`
- **"RLS policy violation"** → Re-run `docs/SUPABASE_RLS_IMPROVEMENTS.sql`

### Scenario 3: Everything looks correct but still fails

**Nuclear option - Recreate tables:**

⚠️ **WARNING: This deletes all data!** Only use for testing.

Run this SQL in Supabase (one statement at a time):

```sql
-- Drop dependent tables
DROP TABLE IF EXISTS language_collaborators CASCADE;
DROP TABLE IF EXISTS languages CASCADE;

-- Recreate languages table
CREATE TABLE languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'friends', 'public')),
  alphabet_script TEXT,
  writing_direction TEXT DEFAULT 'ltr' CHECK (writing_direction IN ('ltr', 'rtl', 'boustrophedon')),
  depth_level TEXT DEFAULT 'realistic' CHECK (depth_level IN ('realistic', 'simplified')),
  word_order TEXT,
  case_sensitive BOOLEAN DEFAULT FALSE,
  vowel_count INTEGER,
  consonant_count INTEGER,
  icon_url TEXT,
  cover_image_url TEXT,
  tags TEXT[],
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

-- Create indexes
CREATE INDEX idx_language_collaborators_language_id ON language_collaborators(language_id);
CREATE INDEX idx_language_collaborators_user_id ON language_collaborators(user_id);

-- Enable RLS
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE language_collaborators ENABLE ROW LEVEL SECURITY;

-- Re-apply policies
-- [Run RLS policies from docs/SUPABASE_RLS_IMPROVEMENTS.sql]
```

After this:
1. Hard refresh browser
2. Try creating language again

---

## TypeScript Function Reference

The `createLanguage()` function in `src/services/languageService.ts` inserts:

```typescript
const languageData = {
  owner_id: userId,                      // Current logged-in user
  name: input.name.trim(),               // From form
  description: input.description.trim(), // From form
  icon_url: input.icon || '🌍',          // From form, default to emoji
};

// INSERT INTO languages (owner_id, name, description, icon_url)
// VALUES (userId, name, description, icon_url)
```

**Notes:**
- `cover_image_url` is optional (can be added later in P1.4)
- All other columns use database defaults
- Function is backend-agnostic (works with Supabase or Firebase)

---

## Database Schema Reference

```
languages table:
├─ id (UUID) - auto-generated
├─ owner_id (UUID) - foreign key to users
├─ name (TEXT) - required
├─ description (TEXT)
├─ icon_url (TEXT) ← This is what was missing
├─ cover_image_url (TEXT)
├─ visibility (TEXT) - default: 'private'
├─ alphabet_script (TEXT)
├─ writing_direction (TEXT)
├─ depth_level (TEXT)
├─ word_order (TEXT)
├─ case_sensitive (BOOLEAN)
├─ vowel_count (INTEGER)
├─ consonant_count (INTEGER)
├─ tags (TEXT[])
├─ total_words (INTEGER)
├─ total_rules (INTEGER)
├─ total_contributors (INTEGER)
├─ created_at (TIMESTAMP)
└─ updated_at (TIMESTAMP)
```

---

## Files Involved

| File | Purpose | Status |
|------|---------|--------|
| `docs/FIX_SCHEMA_CACHE.sql` | SQL to fix cache | ✅ Ready to run |
| `docs/SCHEMA_CACHE_ERROR_FIX.md` | Detailed troubleshooting | ✅ Reference |
| `src/services/languageService.ts` | Function doing insert | ✅ Already correct |
| `docs/supabase_schema.sql` | Original schema | ✅ Reference |

---

## Quick Checklist

- [ ] Run `docs/FIX_SCHEMA_CACHE.sql` in Supabase SQL Editor
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Log out and sign up as NEW user
- [ ] Create a test language
- [ ] Check browser console for ✅ checkmarks
- [ ] Check Supabase `languages` table for new row
- [ ] Check Supabase `language_collaborators` table for owner entry
- [ ] Verify `icon_url` column has value

---

## Success Indicators ✅

After fix works:

```
Browser console shows:
✅ [createLanguage] Ensuring user exists in users table...
✅ [createLanguage] User already exists in users table
✅ [createLanguage] Checking for duplicate names...
✅ [createLanguage] No duplicates found
✅ [createLanguage] Inserting language data...
✅ [createLanguage] Language inserted successfully
✅ [createLanguage] Adding user as collaborator
✅ [createLanguage] Collaborator added successfully
✅ [createLanguage] COMPLETE!

Supabase shows:
✅ languages table: 1 new row
✅ language_collaborators table: 1 new row with role='owner'

No errors 🎉
```

---

## Next Steps

After fixing:

1. **Document the issue** (done ✅)
2. **Complete P1.3 checklist** (verify in progress.md)
3. **Move to P1.4** - Build language dashboard/detail page
4. **P1.5** - Build languages list page
5. **P1.6** - Implement language editing

---

## Help & Support

**Still having issues?**

1. Check [docs/SCHEMA_CACHE_ERROR_FIX.md](SCHEMA_CACHE_ERROR_FIX.md) for detailed troubleshooting
2. Run verification queries to check database state
3. Check browser console for specific error messages
4. Try the "Nuclear option" if all else fails

**All files are in:** `docs/` folder

---

**Last Updated:** January 1, 2026  
**Status:** Ready to implement  
**Time Required:** 10 minutes  
**Risk Level:** Low (non-destructive)  
**Impact:** High (fixes language creation)
