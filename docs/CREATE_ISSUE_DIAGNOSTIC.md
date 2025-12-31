# CREATE ISSUE - Complete Diagnostic Guide

## Problem Statement

1. **Specs are always "Unspecified"** → Columns are NULL in database
2. **Visibility resets on refresh** → NOT being persisted at creation
3. **Dashboard shows 0 languages** → language_collaborators table is EMPTY
4. **language_collaborators table is EMPTY** → INSERT is not happening OR RLS is blocking it

**Root Cause:** `createLanguage()` was only inserting basic fields, not specs/visibility. Additionally, language_collaborators row may not be created due to RLS issues.

---

## Check Current Database State

### Step 1: Access Supabase SQL Editor

1. Go to Supabase Dashboard
2. Project → SQL Editor
3. Run each query below and screenshot results

### Step 2: Check Languages Table (Specs & Visibility)

**Query:**
```sql
SELECT 
  id,
  name,
  owner_id,
  visibility,
  alphabet_script,
  writing_direction,
  word_order,
  case_sensitive,
  depth_level,
  created_at
FROM languages
LIMIT 10;
```

**Expected:**
- visibility: 'private' (not NULL)
- alphabet_script: value or NULL is OK
- writing_direction: 'ltr' (not NULL)
- depth_level: 'realistic' (not NULL)

**If you see:**
- visibility = NULL → Fix: Run migration in Step 3
- alphabet_script = NULL → Expected for now (specs optional)
- writing_direction = NULL → Fix: Run migration

### Step 3: Check Language Collaborators Table

**Query:**
```sql
SELECT 
  id,
  language_id,
  user_id,
  role,
  joined_at
FROM language_collaborators
LIMIT 10;
```

**Expected:**
- At least 1 row per language (owner entry)
- role = 'owner'

**If you see:**
- 0 rows → CRITICAL: createLanguage() not creating collaborator entry
- Some rows missing → Some languages don't have owner entry

### Step 4: Check User-Language Relationship

**Query:**
```sql
SELECT 
  l.id,
  l.name,
  l.owner_id,
  u.id as user_id,
  u.auth_id,
  lc.id as collab_id,
  lc.role
FROM languages l
LEFT JOIN users u ON l.owner_id = u.id
LEFT JOIN language_collaborators lc ON l.id = lc.language_id AND l.owner_id = lc.user_id
LIMIT 10;
```

**Expected:**
- user_id NOT NULL (owner exists in users table)
- collab_id NOT NULL (collaborator entry exists)
- role = 'owner'

**If you see:**
- user_id = NULL → User not in public.users table
- collab_id = NULL → Collaborator not created

---

## Fix 1: Update createLanguage() to Persist Specs & Visibility

**Status:** ✅ Already implemented in latest code

**What was changed:**
```typescript
// OLD: Only basic fields
const languageData = {
  owner_id, name, description, icon_url
};

// NEW: All spec fields + visibility
const languageData = {
  owner_id,
  name,
  description,
  icon_url,
  visibility: 'private',  // ← NOW PERSISTED
  alphabet_script: specs?.alphabetScript || null,  // ← NOW PERSISTED
  writing_direction: specs?.writingDirection || 'ltr',  // ← NOW PERSISTED
  word_order: specs?.wordOrder || null,
  case_sensitive: specs?.caseSensitive ?? false,
  vowel_count: specs?.vowelCount || null,
  consonant_count: specs?.consonantCount || null,
  depth_level: specs?.depthLevel || 'realistic',
};
```

**Result:** Next language created will have all fields properly populated

---

## Fix 2: Verify Collaborator Insert Works

**Testing in Browser Console:**

1. Open your app at localhost:5173
2. Open Browser DevTools (F12)
3. Open Console tab
4. **Create a test language**

**Watch for logs:**
```
[createLanguage] FULL INSERT PAYLOAD (all fields):
{
  owner_id: "...",
  name: "Test Language",
  visibility: "private",
  alphabet_script: null,
  writing_direction: "ltr",
  depth_level: "realistic",
  ...
}

[createLanguage] ✅ Language inserted successfully. ID: ...

[createLanguage] Adding user as collaborator with role="owner"...
[createLanguage] ✅ Collaborator added successfully
```

### If Collaborator Insert FAILS:

**Error logs to watch for:**
```
[createLanguage] ❌ Collaborator insert error:
Error code: 42501 → RLS policy blocking
Error code: 23503 → Foreign key error (user not in users table)
```

**Troubleshooting:**

#### Scenario A: RLS Error (code 42501)
- **Cause:** RLS policy `language_collaborators_insert` is blocking
- **Verification:**
  ```sql
  -- Check if policy exists
  SELECT * FROM pg_policies 
  WHERE tablename = 'language_collaborators' 
  AND policyname = 'language_collaborators_insert';
  ```
- **Fix:** Check that policy uses `auth.uid()` correctly
  ```sql
  -- Current policy checks:
  -- EXISTS (
  --   SELECT 1 FROM languages
  --   WHERE id = language_collaborators.language_id
  --   AND owner_id = auth.uid()
  -- )
  ```

#### Scenario B: Foreign Key Error (code 23503)
- **Cause:** user_id doesn't exist in users table
- **Verification:**
  ```sql
  -- Get the user_id that failed
  -- Then check:
  SELECT * FROM users WHERE id = 'that-user-id';
  ```
- **Fix:** Ensure auth.users row has corresponding public.users row
  ```sql
  -- Manual fix if needed:
  INSERT INTO users (auth_id, email, display_name)
  VALUES ('auth-user-id', 'email@example.com', 'User');
  ```

---

## Fix 3: RLS Policy Verification

**Verify language_collaborators policies exist:**

```sql
SELECT 
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'language_collaborators'
ORDER BY cmd;
```

**Expected results:**
- language_collaborators_select (SELECT)
- language_collaborators_insert (INSERT)
- language_collaborators_update (UPDATE)
- language_collaborators_delete (DELETE)

**If missing:** Run setup from supabase_rls_policies.sql

---

## Fix 4: Verify User Exists in Public.users

This is CRITICAL. Auth.users doesn't automatically sync to public.users.

**Query:**
```sql
SELECT 
  u.id,
  u.auth_id,
  u.email,
  u.display_name,
  u.created_at
FROM users u
WHERE auth_id IN (
  SELECT id FROM auth.users
);
```

**Expected:** One row per logged-in user

**If empty or missing rows:**

Option A: Check trigger exists
```sql
SELECT trigger_name 
FROM information_schema.triggers 
WHERE event_object_table = 'users';
```

Option B: Manual INSERT
```sql
-- In Supabase dashboard, connect as authenticated user
-- Then run:
INSERT INTO users (auth_id, email, display_name)
VALUES (auth.uid(), 'your-email@example.com', 'Your Name')
ON CONFLICT (auth_id) DO NOTHING;
```

---

## Complete Test Flow

### Test 1: Create Language via UI

1. Navigate to create language page
2. Fill form with:
   - Name: `TEST_1-${Date.now()}`
   - Description: "Test description"
3. Click Create
4. **Check Console:** Look for all [createLanguage] logs
5. **Note the language ID** from logs

### Test 2: Verify in Database

In Supabase SQL Editor:
```sql
-- Replace LANGUAGE_ID with actual ID from logs
SELECT * FROM languages WHERE id = 'LANGUAGE_ID';
SELECT * FROM language_collaborators WHERE language_id = 'LANGUAGE_ID';
```

**Expected:**
- Languages row with visibility='private', writing_direction='ltr'
- language_collaborators row with user_id and role='owner'

### Test 3: Verify in UI

1. Refresh page
2. Go to dashboard/languages list
3. **Expected:** New language appears in list with count = 1
4. Click to view details
5. **Expected:** Visibility shows "Private", specs show "English (Latin, LTR, Realistic)"

### Test 4: Test Persistence After Refresh

1. Edit language visibility → "Public"
2. Click Save
3. **Check console** for update logs
4. **Refresh page** (F5)
5. **Expected:** Visibility still shows "Public" (persisted)

---

## What Each Fix Addresses

| Issue | Fix | Verification |
|-------|-----|--------------|
| Specs = "Unspecified" | Persist all spec columns at CREATE | Run SQL query on languages table |
| Visibility resets | Persist visibility='private' at CREATE | Refresh page after create |
| Dashboard shows 0 | Ensure language_collaborators row created | Check collaborators table in SQL |
| Collaborators table empty | Verify createLanguage() INSERT works | Create test language, check logs |

---

## Rollback if Needed

**If you need to test the OLD behavior:**

```typescript
// OLD code (for reference - DO NOT USE)
const languageData = {
  owner_id,
  name,
  description,
  icon_url
  // No specs, no visibility
};
```

**To revert:** Edit src/services/languageService.ts and remove spec fields from insert

---

## Next Steps After Validation

1. ✅ Confirm specs persist (no more "Unspecified")
2. ✅ Confirm visibility persists (no more reset on refresh)
3. ✅ Confirm dashboard shows language count
4. ✅ Confirm collaborators table has rows
5. → Then move to Phase 1.2: Edit specs UI

---

**Updated:** December 31, 2025  
**Focus:** Root cause is CREATE, not UPDATE

