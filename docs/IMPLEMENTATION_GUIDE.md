# Supabase Language Creation - Complete Implementation Guide

## Overview

This guide walks you through implementing the fixes for the Supabase language creation system. The fixes address three critical issues:

1. **User creation trigger** - Ensures new users automatically appear in the `users` table
2. **Improved RLS policies** - Makes language collaborator permissions more reliable
3. **Enhanced TypeScript function** - Better error handling and debugging

---

## ⚠️ Important: This Fixes a Critical Issue

**THE PROBLEM:**
- When users sign up with Supabase Auth, a row is inserted into `auth.users`
- BUT no row is automatically created in `public.users`
- When you try to create a language and add a collaborator entry, the RLS policy fails because the user doesn't exist in `public.users`
- Result: Language created ✅ but collaborator entry fails ❌

**THE SOLUTION:**
- Add a PostgreSQL trigger that fires when `auth.users` gets a new row
- Automatically create a corresponding row in `public.users`
- This ensures all RLS policies work correctly

---

## Step 1: Run the Trigger SQL

### What This Does

Creates a function and trigger that automatically creates a user entry when someone signs up.

### How to Run

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open this file: `/docs/SUPABASE_FIXES.sql`
5. Copy the entire contents
6. Paste into the SQL Editor
7. Click **Run** button

### Expected Result

```
CREATE FUNCTION created successfully
CREATE TRIGGER created successfully
```

**If you see errors:**
- "Function already exists" → This is OK, it means the function is already there
- "Trigger already exists" → This is OK, it means the trigger is already there

---

## Step 2: Verify the Trigger Works

After running the SQL, verify it was created:

### Query 1: Check Function Exists

In SQL Editor, run this query:

```sql
SELECT proname, prosecdef 
FROM pg_proc 
WHERE proname = 'handle_new_user';
```

**Expected output:**
- One row with `proname = handle_new_user` and `prosecdef = true`

### Query 2: Check Trigger Exists

```sql
SELECT trigger_name, event_object_table, action_timing 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

**Expected output:**
- One row: `on_auth_user_created | users | AFTER`

### Query 3: Verify Users Table Structure

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY column_name;
```

**Expected columns:**
- `id` (UUID)
- `auth_id` (UUID) - Foreign key to auth.users
- `email` (TEXT)
- `display_name` (TEXT)
- `profile_image_url` (TEXT)
- `activity_permissions` (TEXT)
- `theme` (TEXT)
- `default_language_depth` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

---

## Step 3: Update RLS Policies

### What This Does

Improves the RLS policies for `language_collaborators` table to be more reliable and easier to debug.

### How to Run

1. Open **SQL Editor** again
2. Click **New Query**
3. Open this file: `/docs/SUPABASE_RLS_IMPROVEMENTS.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run**

### Expected Result

```
DROP POLICY deleted successfully
CREATE POLICY created successfully
```

Repeat 4 times (once for each policy).

**If you see errors:**
- "Policy does not exist" → This is OK, means the old policy wasn't there
- "Policy already exists" → This is OK, you're replacing it

---

## Step 4: Update the TypeScript Function

### What This Does

- Adds a safety check to ensure user exists before creating language
- Adds comprehensive logging for debugging
- Implements retry logic for transient errors
- Works with both Supabase and Firebase

### How to Run

1. The file has already been updated: `src/services/languageService.ts`
2. The `createLanguage()` function now includes:
   - User existence check (STEP 0)
   - Detailed logging at each step
   - Retry mechanism for collaborator insert
   - Better error messages

### What Changed

**Before:**
```typescript
// Simple insert, no user check
const { error: collabError } = await supabase
  .from('language_collaborators')
  .insert([{ language_id, user_id, role: 'owner' }]);
```

**After:**
```typescript
// Check if user exists first
const { data: userCheck } = await supabase
  .from('users')
  .select('id')
  .eq('auth_id', userId)
  .single();

// If user not found, try to create entry
if (userCheckError?.code === 'PGRST116') {
  // Create user entry...
}

// Insert collaborator with retry logic
const { data: collabData, error: collabError } = await supabase
  .from('language_collaborators')
  .insert([...])
  .select()
  .single();

// If it fails, retry once after delay
if (collabError) {
  await new Promise(resolve => setTimeout(resolve, 500));
  // Retry insert...
}
```

---

## Step 5: Manual End-to-End Test

### Test Flow

1. **Sign up a new user**
2. **Verify user appears in `users` table**
3. **Create a language**
4. **Verify language created successfully**
5. **Verify collaborator entry created**

### Test Instructions

#### 1. Sign Up New User

```bash
# Go to your app running locally (e.g., http://localhost:5173)
# Navigate to signup page
# Fill in:
#   Email: test-user-123@example.com (use unique email each time)
#   Password: TestPassword123
# Click Sign Up
```

#### 2. Check Users Table in Supabase

```bash
# Open Supabase Dashboard
# Go to Table Editor
# Click on 'users' table
# Look for your new user:
#   auth_id: Should be a UUID
#   email: test-user-123@example.com
#   display_name: Should match email or from metadata
#   created_at: Should be recent
```

**Expected result:** New row appears immediately

#### 3. Create a Language

```bash
# In the app, go to Create New Language page
# Fill in:
#   Name: Test Language 123
#   Description: A test language to verify the fix
#   Icon: 🧪 (or leave default)
# Click Create Language
```

**Expected result in console logs:**
```
[createLanguage] Starting with userId: abc123...
[createLanguage] Ensuring user exists in users table...
[createLanguage] User already exists in users table: xyz789...
[createLanguage] Checking for duplicate names...
[createLanguage] No duplicates found. Preparing insert data...
[createLanguage] Inserting language data: { owner_id, name, description, ... }
[createLanguage] ✅ Language inserted successfully. ID: language123...
[createLanguage] Adding user as collaborator with role="owner"...
[createLanguage] ✅ Collaborator added successfully: { language_id, user_id, role }
[createLanguage] ✅ COMPLETE! Language creation finished successfully
```

#### 4. Verify Language Created in Database

```bash
# Supabase Dashboard → Table Editor → 'languages' table
# Look for your language:
#   name: Test Language 123
#   owner_id: Should match your user's ID
#   description: A test language to verify the fix
#   created_at: Should be recent
```

#### 5. Verify Collaborator Entry Created

```bash
# Supabase Dashboard → Table Editor → 'language_collaborators' table
# Look for an entry:
#   language_id: Should match the language ID from step 4
#   user_id: Should match your user's ID from step 2
#   role: owner
#   joined_at: Should be recent
```

**Success criteria:**
- ✅ All three tables have new rows
- ✅ Console logs show ✅ checkmarks at each step
- ✅ No error messages in console

---

## Step 6: Test Error Scenarios

### Scenario A: Duplicate Language Name

1. Create a language called "Test Language"
2. Try to create another language with the same name
3. **Expected result:** Error message "You already have a language with this name"

### Scenario B: Insufficient Permissions

1. Sign up User A, create Language A
2. Sign up User B
3. Have User B try to edit Language A
4. **Expected result:** Cannot access or edit (RLS policy blocks it)

### Scenario C: Missing Required Fields

1. Try to create a language without a name
2. Try to create a language without a description
3. **Expected result:** Error message about required field

---

## Troubleshooting

### Issue: "Collaborator insert failed" - Error appears in console

**Possible causes:**

1. **User not in `users` table**
   - Check: `SELECT * FROM users WHERE auth_id = 'user-id';`
   - Solution: The trigger may not have fired. Wait a moment and try signing up again.

2. **RLS policy blocking insert**
   - Check: Run the RLS verification queries from `/docs/SUPABASE_RLS_IMPROVEMENTS.sql`
   - Solution: Make sure the policies were updated correctly

3. **Language not created**
   - Check: `SELECT * FROM languages WHERE id = 'language-id';`
   - Solution: The language insert failed. Check for validation errors.

### Issue: Trigger not firing

**Symptoms:**
- User signs up but doesn't appear in `public.users` table
- Only appears in `auth.users` table

**Check:**
1. Verify trigger exists: 
   ```sql
   SELECT trigger_name FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```

2. Check if function exists:
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';
   ```

**Solution:**
1. If trigger doesn't exist, run `/docs/SUPABASE_FIXES.sql` again
2. Check for errors in the SQL Editor

### Issue: Old data still causing problems

**Solution:**
Run this to clean up old test data:

```sql
-- DELETE old test users (be careful!)
DELETE FROM public.users WHERE email LIKE 'test%';

-- DELETE old test languages (be careful!)
DELETE FROM languages WHERE owner_id NOT IN (SELECT id FROM users);
```

---

## How It Works: The Complete Flow

### Before Fixes (❌ Broken)

```
1. User signs up with email password
   ↓
2. auth.users table gets new row (auth system's responsibility)
   ↓
3. public.users table remains EMPTY ❌
   ↓
4. User creates language
   ↓
5. languages INSERT: owner_id = auth.uid() (works, uses auth ID)
   ✅ Language created successfully
   ↓
6. language_collaborators INSERT: user_id = userId
   ↓
7. RLS policy checks: Does this user exist in public.users?
   NO ❌ Policy blocks insert
   ↓
8. Error: Collaborator entry failed
```

### After Fixes (✅ Works)

```
1. User signs up with email/password
   ↓
2. auth.users table gets new row
   ↓
3. PostgreSQL TRIGGER fires: on_auth_user_created
   ↓
4. Trigger calls handle_new_user() function
   ↓
5. public.users table gets new row ✅
   (auth_id, email, display_name populated)
   ↓
6. User creates language
   ↓
7. App calls createLanguage()
   ↓
8. createLanguage() checks: Does user exist in users table?
   YES ✅ (Step 0 check passes)
   ↓
9. languages INSERT: owner_id = auth.uid()
   ✅ Language created successfully
   ↓
10. language_collaborators INSERT: user_id = userId
    ↓
11. RLS policy checks: Is user the owner of this language?
    YES ✅ (owner_id = auth.uid() from Step 0)
    ↓
12. ✅ Collaborator entry created with role="owner"
    ↓
13. Complete! Language and collaborator both created successfully
```

---

## Key Concepts

### Why This Matters

**Backend Abstraction:**
- The code is designed to work with both Supabase and Firebase
- Both backends need to handle user creation differently
- Supabase uses PostgreSQL triggers
- Firebase would use Cloud Functions
- Same code, different infrastructure

**RLS Policies:**
- Database-level security (not just frontend)
- Applied automatically to all queries
- Cannot be bypassed by frontend code
- Essential for multi-user safety

**Why the Trigger Matters:**
- Supabase Auth creates rows in `auth.users`
- Your app data lives in `public.users`
- These are separate systems
- The trigger connects them automatically

---

## Testing Checklist

After implementing all fixes, verify:

- [ ] Trigger SQL ran without errors
- [ ] RLS policies SQL ran without errors
- [ ] TypeScript function updated successfully
- [ ] New user signs up and appears in `users` table
- [ ] Console shows no errors when signing up
- [ ] Language created successfully (appears in `languages` table)
- [ ] Collaborator entry created (appears in `language_collaborators` table)
- [ ] owner_id matches the user's ID
- [ ] Collaborator role is "owner"
- [ ] Browser console shows ✅ checkmarks in logs
- [ ] No error messages in browser console
- [ ] Can access the created language
- [ ] Cannot access another user's private language

---

## Files Changed

1. **docs/SUPABASE_FIXES.sql** (NEW)
   - Trigger and function for automatic user creation

2. **docs/SUPABASE_RLS_IMPROVEMENTS.sql** (NEW)
   - Improved RLS policies for reliability

3. **src/services/languageService.ts** (UPDATED)
   - Enhanced createLanguage() function with:
     - User existence check
     - Comprehensive logging
     - Retry logic
     - Better error handling

4. **docs/FIX_LANGUAGE_COLLABORATORS.md** (NEW)
   - High-level summary and troubleshooting

---

## Next Steps

### Immediate (Today)
1. Run SUPABASE_FIXES.sql
2. Run SUPABASE_RLS_IMPROVEMENTS.sql
3. Test with manual end-to-end flow
4. Document any issues encountered

### Short-term (This Week)
1. Add automated tests to verify trigger works
2. Add frontend validation to catch issues early
3. Create error reporting system
4. Update user-facing error messages

### Medium-term (Next Phase)
1. Implement same pattern for Firebase
2. Add audit logging for user creation
3. Add analytics for language creation flow
4. Performance optimization

---

## References

- [Supabase Triggers Documentation](https://supabase.com/docs/guides/database/postgres/triggers)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)
- [LinguaFabric Architecture Guide](./AGENTS.md)

---

**Last Updated:** January 1, 2026  
**Status:** Ready for Implementation  
**Complexity:** High (triggers and RLS policies)  
**Risk Level:** Medium (database-level changes)  
**Rollback:** Easy (can drop trigger and revert policies)
