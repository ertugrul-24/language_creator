# RLS Configuration for Phase 1 - Setup Guide

## Problem
Getting "RLS violation" errors when trying to insert languages.

## Root Cause
The existing RLS policies have conditions that don't match Phase 1:
- `visibility = 'public'` (Phase 1 has no visibility column)
- References to `language_collaborators` (Phase 1 has no collaboration)
- References to friends (Phase 3 feature)

## Solution: Replace RLS Policies

### Step 1: Navigate to Supabase
Go to: **Supabase Dashboard → SQL Editor**

### Step 2: Run Migration SQL
Copy the entire contents of: `docs/PHASE1_RLS_POLICIES.sql`

Paste into SQL Editor and click "Run"

This will:
1. Drop old Phase 1.2+ policies
2. Create new Phase 1-specific policies

### Phase 1 RLS Policies (What They Do)

#### INSERT Policy
```sql
CREATE POLICY "languages_phase1_insert" ON languages
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());
```
**Meaning:** Only authenticated users can insert, and only if `owner_id` equals their auth ID

#### SELECT Policy
```sql
CREATE POLICY "languages_phase1_select" ON languages
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());
```
**Meaning:** Only authenticated users can read, and only their own languages

#### UPDATE Policy
```sql
CREATE POLICY "languages_phase1_update" ON languages
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());
```
**Meaning:** Only the owner can update their own language

#### DELETE Policy
```sql
CREATE POLICY "languages_phase1_delete" ON languages
FOR DELETE
TO authenticated
USING (owner_id = auth.uid());
```
**Meaning:** Only the owner can delete their own language

---

## Data Flow Verification

### Frontend (AuthContext)
```
Supabase Auth
    ↓
authUser.id = "abc123..." (auth.users.id)
    ↓
user.id = "abc123..."
```

### Language Creation
```
NewLanguagePage
    ↓
user.id = "abc123..."
    ↓
createLanguage(user.id, {...})
    ↓
Service inserts:
  owner_id: "abc123..."
    ↓
RLS checks:
  owner_id = auth.uid() ?
  "abc123..." = "abc123..." ? ✅ YES
    ↓
Insert succeeds
```

---

## Verification Steps

### 1. Verify RLS is Enabled
**Supabase Dashboard → SQL Editor:**
```sql
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'languages';
```

**Expected:** `relrowsecurity = true`

### 2. Verify Policies Exist
```sql
SELECT policyname, qual, with_check
FROM pg_policies
WHERE tablename = 'languages'
ORDER BY policyname;
```

**Expected to see:**
- `languages_phase1_delete`
- `languages_phase1_insert`
- `languages_phase1_select`
- `languages_phase1_update`

### 3. Verify Auth is Working
**Browser Console (F12):**
```javascript
console.log("User ID:", user.id);
// Should show: User ID: 12345678-1234-1234-1234-123456789abc
```

### 4. Check Supabase Auth User
**Supabase Dashboard → Authentication → Users:**
- Find your user account
- Copy the "User UID" 
- This should match the `owner_id` in languages table

---

## Troubleshooting

### Problem: Still getting RLS violation
**Cause:** Old policies still exist or incorrect policies

**Fix:**
1. Go to **Supabase Dashboard → SQL Editor**
2. Run this to see all policies:
```sql
SELECT policyname FROM pg_policies WHERE tablename = 'languages';
```
3. Manually delete old policies:
```sql
DROP POLICY IF EXISTS "languages_select" ON languages;
DROP POLICY IF EXISTS "languages_insert" ON languages;
DROP POLICY IF EXISTS "languages_update" ON languages;
DROP POLICY IF EXISTS "languages_delete" ON languages;
```
4. Then run `PHASE1_RLS_POLICIES.sql`

### Problem: owner_id mismatch
**Cause:** Service receiving wrong user ID

**Fix:**
1. Check browser console for `[AuthContext]` logs
2. Should show: `Auth user found: <uuid>`
3. If not, authentication isn't resolving
4. Check `.env.local` has correct Supabase credentials

### Problem: Policies exist but still failing
**Cause:** Policies might be checking wrong columns

**Verify columns exist:**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'languages'
ORDER BY column_name;
```

**Must have:**
- `id` (uuid)
- `owner_id` (uuid)
- `name` (text)
- `description` (text)
- `icon` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

---

## After Policies Are Configured

1. ✅ Refresh browser
2. ✅ Sign up or login
3. ✅ Navigate to "Create Language"
4. ✅ Fill form and submit
5. ✅ Should see success (no RLS error)

---

## Key Points

✅ **TO authenticated** - Only logged-in users
✅ **auth.uid()** - Always the source of truth for user identity
✅ **owner_id = auth.uid()** - Only access own languages
✅ **No DENY policies** - Only positive allowlist
✅ **No PUBLIC role** - Phase 1 has no public languages

---

## Next Steps

1. Run `PHASE1_RLS_POLICIES.sql` in Supabase
2. Verify policies were created
3. Test language creation end-to-end
4. Check console for logs
5. Report success or remaining errors
