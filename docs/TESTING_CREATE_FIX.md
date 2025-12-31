# CREATE ISSUE - TESTING & VERIFICATION STEPS

## ✅ Fix Applied

The `createLanguage()` function has been updated to:

1. **Persist ALL spec fields** (not NULL):
   - `alphabet_script`
   - `writing_direction` (defaults to 'ltr')
   - `word_order`
   - `case_sensitive` (defaults to false)
   - `depth_level` (defaults to 'realistic')

2. **Persist visibility** (defaults to 'private')

3. **Enhanced error logging** for collaborator insert failures

---

## 🧪 IMMEDIATE TESTING (Right Now)

### Step 1: Open the App

- **URL:** http://localhost:5174
- Open Browser DevTools: **F12**
- Go to **Console tab**
- Keep console visible

### Step 2: Create a Test Language

1. Navigate to Create Language page
2. Fill form:
   - **Name:** `TEST_${Date.now()}`
   - **Description:** "Test description for specs persistence"
   - **Icon:** Keep default or pick emoji
3. Click **Create Language**

### Step 3: Watch Console Logs

**Look for:**
```
[createLanguage] Starting with userId: ...
[createLanguage] Ensuring user exists in users table...
[createLanguage] ✅ User already exists in users table: ...
[createLanguage] No duplicates found. Preparing insert data...

[createLanguage] ⚠️  FULL INSERT PAYLOAD (all fields):
{
  "owner_id": "...",
  "name": "TEST_...",
  "description": "Test description...",
  "icon_url": "🌍",
  "visibility": "private",
  "alphabet_script": null,
  "writing_direction": "ltr",
  "word_order": null,
  "case_sensitive": false,
  "vowel_count": null,
  "consonant_count": null,
  "depth_level": "realistic"
}

[createLanguage] ✅ Language inserted successfully. ID: abc123...
[createLanguage] Adding user as collaborator with role="owner"...
[createLanguage] ✅ Collaborator added successfully
```

### Step 4: Check for Errors

**If you see:**
```
[createLanguage] ❌ Collaborator insert error:
```

**Copy the error details:**
- Error code
- Error message
- Error details
- Error hint

⚠️ **Stop and provide the full error message** - we need to debug RLS

---

## ✅ VERIFICATION IN SUPABASE

Once language is created (no errors in console):

### Query 1: Check Languages Table

Go to **Supabase Dashboard → SQL Editor**

```sql
-- Get the language you just created
SELECT 
  id,
  name,
  owner_id,
  visibility,
  alphabet_script,
  writing_direction,
  depth_level,
  case_sensitive,
  created_at
FROM languages
ORDER BY created_at DESC
LIMIT 5;
```

**Expected Results:**
- `visibility` = `'private'` (NOT NULL)
- `writing_direction` = `'ltr'` (NOT NULL)
- `depth_level` = `'realistic'` (NOT NULL)
- `case_sensitive` = `false`
- All other spec fields can be NULL (OK for now)

**Screenshot this result!**

### Query 2: Check Language Collaborators

```sql
-- Check if owner entry was created
SELECT 
  id,
  language_id,
  user_id,
  role,
  joined_at
FROM language_collaborators
WHERE language_id IN (
  SELECT id FROM languages ORDER BY created_at DESC LIMIT 1
);
```

**Expected Results:**
- **Exactly 1 row**
- `role` = `'owner'`
- `user_id` NOT NULL

**Screenshot this result!**

### Query 3: Verify User Exists

```sql
-- Check that the user is in public.users table
SELECT 
  id,
  auth_id,
  email,
  display_name,
  created_at
FROM users
WHERE id IN (
  SELECT user_id FROM language_collaborators
  WHERE language_id IN (
    SELECT id FROM languages ORDER BY created_at DESC LIMIT 1
  )
);
```

**Expected Results:**
- **Exactly 1 row**
- `auth_id` NOT NULL
- `email` NOT NULL

---

## 🔄 PERSISTENCE TEST

### Test: Visibility Persists After Refresh

1. **In app:** You should be on the language detail page
2. **In console:** Note the language ID
3. **Refresh page:** Press F5
4. **Check:** Does visibility still show "Private"?
   - ✅ YES → Persists correctly
   - ❌ NO → Still resetting (different issue)

### Test: Specs Display Correctly

1. **In app:** Look for specs section (should show something like "English (Latin, LTR, Realistic)")
2. **Check:** Does it show "Unspecified"?
   - ✅ NO "Unspecified" → Fix worked!
   - ❌ Still "Unspecified" → Specs not being read

**Why it might still show "Unspecified":**
- Specs were NULL in old languages (created before fix)
- New languages created now should show properly
- Verify you're viewing a NEW language created after this fix

---

## 📊 DASHBOARD TEST

### Test: Dashboard Shows Language Count

1. Navigate to Dashboard/Home page
2. Look for language count (e.g., "1 language")
3. Check expectations:
   - ✅ Count = 1 (or number of languages you created) → Works!
   - ❌ Count = 0 → language_collaborators table not working

**Why count = 0 happens:**
- Dashboard queries through `language_collaborators` table
- If that table is empty, count = 0
- Our fix ensures new languages get a collaborator row

---

## 🐛 IF ANYTHING FAILS

### Scenario A: "Collaborator insert error" in Console

**Action:**
1. Copy the full error message
2. Note the error code (e.g., 42501)
3. Provide the error details

**Error Code Meanings:**
- `42501` = RLS policy blocking (permission denied)
- `23503` = Foreign key error (user not in users table)
- `23505` = Unique constraint violation

### Scenario B: Visibility still resets after refresh

**Debug:**
1. In Supabase SQL Editor, run Query 1
2. Check that `visibility` = `'private'` (not NULL)
3. If visibility is NULL → Database wasn't updated properly
4. If visibility is 'private' → Issue is in reading/displaying

### Scenario C: Dashboard still shows 0 languages

**Debug:**
1. In Supabase SQL Editor, run Query 2
2. Check if collaborators row exists
3. If row exists → Dashboard query issue
4. If row missing → Collaborator INSERT failed

---

## 📋 CHECKLIST

After completing all tests, verify:

- [ ] Console shows no [createLanguage] errors
- [ ] Console shows "✅ Collaborator added successfully"
- [ ] Supabase Query 1: visibility = 'private', writing_direction = 'ltr'
- [ ] Supabase Query 2: 1 row in language_collaborators
- [ ] Supabase Query 3: user exists in users table
- [ ] App refresh: Visibility still shows "Private"
- [ ] Dashboard: Language count = 1 (or correct number)
- [ ] Language specs: NOT showing "Unspecified"

---

## 🚨 WHAT TO REPORT IF ISSUES PERSIST

If any test fails, provide:

1. **Console error text** (copy-paste entire [createLanguage] error block)
2. **Screenshot of Supabase Query 1 result** (showing spec columns)
3. **Screenshot of Supabase Query 2 result** (showing collaborators)
4. **What you expected vs what you saw**
5. **Language name** (so we can query it)

---

## ⏭️ NEXT PHASE

Once all tests pass ✅:

1. **Phase 1.2:** Update specs during language editing (not just creation)
2. **Phase 1.5:** Languages list page with filtering
3. **Phase 2:** Dictionary entry management

---

**Code Changes Made:**
- [src/services/languageService.ts](src/services/languageService.ts) - Updated createLanguage() to persist specs & visibility
- Enhanced error logging for troubleshooting

**Status:** Ready for testing ✅

