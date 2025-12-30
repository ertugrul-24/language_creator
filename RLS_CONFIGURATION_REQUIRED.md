# Phase 1 RLS Configuration - REQUIRED

## Issue
You're getting RLS (Row Level Security) violation errors when trying to create languages.

## Root Cause
The existing RLS policies reference columns that don't exist in Phase 1:
- `visibility = 'public'` ❌
- `language_collaborators` table ❌
- Friendship logic ❌

These are Phase 1.2+ features, not Phase 1.

## Solution: 3-Step Process

### Step 1: Apply Phase 1 RLS Policies (1 minute)

**Go to:** Supabase Dashboard → SQL Editor

**Copy and paste entire file:** `docs/PHASE1_RLS_POLICIES.sql`

**Click "Run"**

This creates proper Phase 1 policies:
- ✅ INSERT: `owner_id = auth.uid()`
- ✅ SELECT: Only own languages
- ✅ UPDATE: Owner only
- ✅ DELETE: Owner only

### Step 2: Verify Policies Created (1 minute)

In Supabase SQL Editor, run:
```sql
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'languages' 
ORDER BY policyname;
```

**You should see:**
- `languages_phase1_delete`
- `languages_phase1_insert`
- `languages_phase1_select`
- `languages_phase1_update`

### Step 3: Test Language Creation (2 minutes)

1. Refresh browser
2. Sign up or login
3. Navigate to "Create Language"
4. Fill form and submit
5. ✓ Should work (no RLS error)

---

## How Phase 1 RLS Works

```
User authenticates
    ↓
auth.uid() = "abc123..."
    ↓
Try to insert language with owner_id = "abc123..."
    ↓
RLS checks: owner_id = auth.uid() ?
    ↓
"abc123..." = "abc123..." ? ✅ YES
    ↓
INSERT ALLOWED
```

---

## Key Points

✅ **RLS is NOT disabled** - Security is maintained
✅ **TO authenticated only** - Only logged-in users
✅ **auth.uid() is source of truth** - User's real ID
✅ **Each user owns their data** - No sharing in Phase 1
✅ **Simple model** - Easiest to debug

---

## Data Flow (Frontend)

```
1. AuthContext
   authUser.id = "abc123..." (from Supabase Auth)
         ↓
   user.id = "abc123..."

2. NewLanguagePage
   createLanguage(user.id, {...})
         ↓
   user.id = "abc123..."

3. languageService
   owner_id: userId
         ↓
   owner_id = "abc123..."

4. Database Insert
   INSERT INTO languages (owner_id, name, description, icon)
   VALUES ("abc123...", "Test", "...", "🌍")

5. RLS Check
   owner_id = auth.uid() ?
   "abc123..." = "abc123..." ? ✅ YES
   
6. Result
   ✅ INSERT ALLOWED
```

---

## If Still Getting RLS Error

1. **Check policy was applied:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'languages';
   ```
   
2. **Check auth is working:**
   Open browser console (F12)
   Should show: `[AuthContext] Auth user found: 12345678...`

3. **Check your auth ID in Supabase:**
   Dashboard → Authentication → Users
   Copy the "User UID"
   This should match owner_id in database

4. **Manual test in Supabase:**
   - Go to Table Editor
   - Try to insert a row manually
   - If manual insert fails, RLS policy is blocking it
   - If manual insert works, check frontend code

---

## After RLS is Configured

✅ Frontend and database aligned
✅ Auth flow working
✅ RLS policies correct
✅ Ready for Phase 1.1 testing

---

## Files Reference

- **SQL to run:** `docs/PHASE1_RLS_POLICIES.sql`
- **Setup guide:** `docs/PHASE1_RLS_SETUP.md`
- **Code:** `src/context/AuthContext.tsx` (uses auth.uid())
- **Code:** `src/services/languageService.ts` (sets owner_id)

---

## Next: Apply Policies and Test
