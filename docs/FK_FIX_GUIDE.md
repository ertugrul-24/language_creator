# Foreign Key Fix - Step-by-Step Guide

## Problem Summary

**Error:** "Failed to create language: insert or update on table languages violates foreign key constraint languages_owner_id_fkey"

**Root Cause:** 
- `languages.owner_id` references `users(id)` (internal table)
- When creating a language, the code was trying to insert with `auth.users.id`
- The `auth.users.id` value doesn't exist in the `users` table
- Foreign key constraint fails because referenced row doesn't exist

## Solution Overview

**Change foreign key target:**
- **FROM:** `languages.owner_id` → `users(id)` ❌ (problematic)
- **TO:** `languages.owner_id` → `auth.users(id)` ✅ (direct, simple)

**Benefits:**
- No separate user record creation needed
- Simpler authentication flow
- Fewer moving parts (less chance of bugs)
- RLS policies already work correctly with this approach
- Faster language creation (no extra DB query)

## Step-by-Step Fix

### Step 1: Apply Database Migration

**Action:** Run the migration SQL in Supabase

1. Open Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy the entire contents of: `docs/MIGRATION_FK_FIX.sql`
4. Click "Run"
5. **Expected output:** Success message, no errors

**What this does:**
- Drops old FK constraint: `languages_owner_id_fkey`
- Creates new FK constraint referencing `auth.users(id)`
- Also updates `language_collaborators.user_id` for consistency

---

### Step 2: Update AuthContext

**File:** `src/context/AuthContext.tsx`

**Changes made:**
1. ✅ Removed `authId` field from `AuthUser` interface
2. ✅ Changed comment: `id` is now directly `auth.users.id`
3. ✅ Updated initialization to use `authUser.id` directly
4. ✅ **Removed entire second useEffect** that created user records
5. ✅ Simplified auth flow (one effect only)

**Why this works:**
- Auth resolves immediately without waiting for user table
- `user.id` is now `auth.users.id` (matches foreign key target)
- Services can use `user.id` directly without translation

**Verification:**
```typescript
// NOW (simplified):
interface AuthUser {
  id: string; // This is auth.users.id
  email: string;
  displayName?: string;
}

// Set directly:
setUser({
  id: authUser.id,           // ← auth.users.id
  email: authUser.email,
  displayName: authUser.user_metadata?.display_name
});
```

---

### Step 3: Service Layer (Already Correct)

**File:** `src/services/languageService.ts`

**Good news:** No changes needed! ✓

**Why:**
- Service already uses `owner_id: userId`
- Service was receiving the wrong ID before (auth.users.id that didn't exist in users table)
- **Now it receives correct ID** (auth.users.id which matches FK target)
- Everything works automatically

---

### Step 4: Verify RLS Policies

**File:** `docs/supabase_rls_policies.sql`

**Status:** Already correct! ✓

**Existing policy for language insert:**
```sql
CREATE POLICY languages_insert ON languages FOR INSERT
  WITH CHECK (auth.uid() = owner_id);
```

**Why this works now:**
- `auth.uid()` returns the authenticated user's ID (from auth.users)
- `owner_id` now references `auth.users(id)` 
- `auth.uid() = owner_id` ✓ Matches perfectly!

---

## Testing the Fix

### Test 1: Verify Database Change
Run in Supabase SQL Editor:
```sql
-- Check the new foreign key exists
SELECT constraint_name, table_name, column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE table_name = 'languages' AND constraint_name = 'languages_owner_id_fkey';

-- Expected: Should show the new constraint
```

### Test 2: Sign Up → Login
1. Sign up with new email/password
2. Verify: App loads immediately (no infinite loading)
3. Check browser console: Should see `[AuthContext] Auth user found: <auth-id>`
4. **No second effect running** (removed the user record creation)

### Test 3: Create Language
1. After login, navigate to "Create Language"
2. Fill form:
   - Name: "Test Language"
   - Description: "Testing the fix"
   - Icon: Select any emoji
3. Click "Submit"
4. **Expected:** Success message appears
5. Language appears in "Languages" list
6. **No FK error!** ✓

### Test 4: Verify Database Record
Check Supabase Dashboard:
1. Go to `languages` table
2. Find newly created language
3. Check `owner_id` column matches your authenticated user ID
4. (Get your auth user ID from Supabase Auth → Users tab)

### Test 5: Console Logging
Open browser DevTools (F12 → Console):
1. Look for logs starting with `[AuthContext]`
2. Should see: `Auth user found: <uuid>`
3. Should NOT see: "Ensuring user exists in DB..."
4. Should NOT see: "Creating user record in DB..."
5. Should see: `[createLanguage] Language inserted successfully`

---

## Rollback (If Needed)

If something goes wrong and you need to revert:

**In Supabase SQL Editor:**
```sql
-- Revert to referencing users table
ALTER TABLE language_collaborators
DROP CONSTRAINT language_collaborators_user_id_fkey;

ALTER TABLE languages 
DROP CONSTRAINT languages_owner_id_fkey;

-- Restore original constraints
ALTER TABLE languages
ADD CONSTRAINT languages_owner_id_fkey 
FOREIGN KEY (owner_id) 
REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE language_collaborators
ADD CONSTRAINT language_collaborators_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES users(id) ON DELETE CASCADE;
```

Then revert `src/context/AuthContext.tsx` changes from Git.

---

## FAQ

**Q: Will this break existing data?**
A: If you already have languages in the database:
- Run a query to check: `SELECT owner_id FROM languages;`
- If owner_id values match auth.users IDs, no problem
- If they're different, you need data cleanup before migration

**Q: Should I delete the users table?**
A: Not yet. Keep it for now. Future phases might use it for extended profiles.

**Q: What about language_collaborators.user_id?**
A: Also changed to reference `auth.users(id)`. Both FK constraints updated together.

**Q: Do I need to update signUp/signIn functions?**
A: No changes needed. They already work correctly.

**Q: What if I have RLS policies I wrote?**
A: They should already use `auth.uid()` which now matches correctly.

---

## Summary of Changes

| Component | Before | After |
|-----------|--------|-------|
| **languages.owner_id FK** | → users(id) ❌ | → auth.users(id) ✅ |
| **AuthContext.user.id** | internal UUID | auth.users.id |
| **User creation** | In AuthContext (complex) | None needed (simple) |
| **Language creation** | Fails FK error | Works perfectly |
| **Auth loading** | Waits for user records | Immediate |

---

## Next Steps

1. **Run migration** in Supabase SQL Editor
2. **Verify** AuthContext changes are applied
3. **Test** by creating a language end-to-end
4. **Check** browser console for correct logs
5. **Verify** language appears in Supabase dashboard
6. **Commit** changes with message: "fix(P1.1): Simplify auth by using auth.users.id directly"

---

**Last Updated:** December 30, 2025
