# Troubleshooting Language Creation - P1.1

## What Was Fixed

This document explains the critical fixes applied to make language creation work end-to-end.

### Root Cause Analysis

**The Problem:** Language creation was failing silently with a generic "Failed to create language" message.

**Why:** Three interconnected issues:
1. **User ID Mismatch**: AuthContext was using `auth.users.id` (Supabase Auth ID), but the database `languages` table expects `users.id` (internal UUID)
2. **Missing User Record**: When users signed up via the auth system, no corresponding record was created in the `users` table
3. **RLS Policy Rejection**: The Row Level Security policy for `languages` table required `auth.uid() = owner_id`, which failed when the owner_id was never set because the user didn't exist

### Changes Made

#### 1. AuthContext.tsx - User ID Management
```typescript
// BEFORE: Used auth.users.id directly
user.id = data.session.user.id  // This was Supabase Auth ID

// AFTER: Uses internal users.id
user.id = internalUserId  // From users table
user.authId = data.session.user.id  // Stored for reference
```

**New Feature:** `ensureUserExists()` function
- Runs on every login
- Checks if user exists in `users` table
- Creates user record if missing
- Returns the internal `users.id` to use for subsequent operations
- Handles the gap between signup (creates auth entry) and first login

#### 2. languageService.ts - Enhanced Error Logging
Added detailed logging at every step:
```typescript
[createLanguage] Starting with userId: {id} name: {name}
[createLanguage] Checking for duplicate names...
[createLanguage] Preparing insert data...
[createLanguage] Inserting language data: {obj}
[createLanguage] Insert error: {detailed error}
[createLanguage] Language inserted successfully. ID: {id}
[createLanguage] Adding user as collaborator...
```

#### 3. NewLanguagePage.tsx - Better Error Display
- Logs user authentication state
- Tracks image conversion progress
- Provides detailed error messages to user
- Helps diagnose where in the flow failures occur

---

## Testing Language Creation

### Step 1: Sign Up / Login
1. Go to `http://localhost:5174/auth/login`
2. Sign up with a new email, or login with existing credentials
3. **Check DevTools Console** for these log lines:
   ```
   [ensureUserExists] Creating new user record for auth_id: {uuid}
   [ensureUserExists] User record created. Internal ID: {uuid}
   ```

### Step 2: Navigate to Create Language
1. Click "New Language" button (any entry point)
2. Should load `/languages/new` page with form
3. Form should be scrollable (previous fix)

### Step 3: Fill Form and Submit
1. Enter Language Name: "Elvish" (or any name)
2. Enter Description: "A beautiful language" (or any description)
3. Select an icon emoji
4. Optionally upload a cover image
5. Click "Create Language"
6. **Check DevTools Console** for these logs:
   ```
   [handleSubmit] User authenticated: {uuid}
   [handleSubmit] Calling createLanguage...
   [createLanguage] Starting with userId: {uuid} name: Elvish
   [createLanguage] Checking for duplicate names...
   [createLanguage] No duplicates found. Preparing insert data...
   [createLanguage] Inserting language data: {...}
   [createLanguage] Language inserted successfully. ID: {uuid}
   [createLanguage] Adding user as collaborator...
   [handleSubmit] Language created successfully: {uuid}
   ```

### Step 4: Verify in Supabase
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run:
   ```sql
   SELECT * FROM users WHERE email = 'your-email@example.com';
   SELECT * FROM languages WHERE name = 'Elvish';
   SELECT * FROM language_collaborators WHERE role = 'owner';
   ```
4. Should see entries in all three queries

---

## If Language Creation Still Fails

### 1. Check Console Errors (Most Important!)
Open DevTools (F12) → Console tab → Look for errors

**Common Errors:**

**Error: "Duplicate check failed"**
- Likely Supabase connection issue
- Check .env.local has valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- Run test query in Supabase SQL Editor to verify connection

**Error: "Invalid INSERT"** or "Failed to insert"**
- Database constraint violation
- Check Supabase Dashboard > languages table > Design
- Verify columns exist: name, description, owner_id, visibility, icon_url, cover_image_url, etc.

**Error: "RLS Policy violation"**
- Row Level Security rejected the insert
- Check users table: does your user record exist?
- Check language_collaborators: is the user set as 'owner'?

**Error: "user_id does not exist"**
- The `users` table doesn't have a record for this user
- This should be auto-created by `ensureUserExists()`, but may not have run
- Try logging out and back in to trigger `ensureUserExists()`

### 2. Verify Database Structure
In Supabase SQL Editor, run:
```sql
-- Check users table
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check languages table
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'languages' 
ORDER BY ordinal_position;

-- Check language_collaborators table
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'language_collaborators' 
ORDER BY ordinal_position;
```

Required columns:
- **users**: id (uuid), auth_id (uuid), email (text), display_name (text)
- **languages**: id (uuid), owner_id (uuid), name (text), description (text), icon_url (text), cover_image_url (text nullable), visibility (text), etc.
- **language_collaborators**: language_id (uuid), user_id (uuid), role (text)

### 3. Verify RLS Policies
In Supabase Dashboard:
1. Go to Authentication > Policies
2. For `languages` table:
   - Should have INSERT policy allowing `auth.uid() = owner_id`
   - Should have SELECT policy for owner/collaborators
   - Should have UPDATE policy for owner/editors
3. For `language_collaborators` table:
   - Should have INSERT policy
4. For `users` table:
   - Should have INSERT policy for new signups

### 4. Check Browser Network Tab
1. Open DevTools → Network tab
2. Try creating a language
3. Look for POST request to `/rest/v1/languages` 
4. Check response:
   - **Status 201**: Success - check body for created language
   - **Status 409**: Conflict - likely duplicate name
   - **Status 403**: Forbidden - RLS policy rejected
   - **Status 422**: Unprocessable - validation error
   - Click response to see details

### 5. Test Direct Supabase Query
In Supabase SQL Editor:
```typescript
// Get your user ID
SELECT id, auth_id, email FROM users WHERE email = 'your-email@example.com';

// Try inserting a test language (replace {users_id_uuid} with result above)
INSERT INTO languages (
  owner_id, name, description, visibility, 
  icon_url, cover_image_url,
  total_words, total_rules, total_contributors
) VALUES (
  '{users_id_uuid}'::uuid, 
  'Test Language', 
  'A test language', 
  'private',
  '🌍',
  NULL,
  0, 0, 1
) RETURNING id, name, owner_id;

// If that works, add the collaborator
INSERT INTO language_collaborators (language_id, user_id, role)
VALUES ('{language_id_uuid}'::uuid, '{users_id_uuid}'::uuid, 'owner');
```

If these queries fail, the database structure or permissions are wrong.

---

## Environment Variables to Verify

Check `.env.local`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**To get these:**
1. Go to Supabase Dashboard
2. Project Settings > API
3. Copy "Project URL" and "anon" key
4. Add to `.env.local` (create file if it doesn't exist)
5. Restart dev server

---

## Debug Checklist

- [ ] Browser console shows no JS errors
- [ ] [ensureUserExists] logs appear after login
- [ ] User record visible in Supabase users table
- [ ] [createLanguage] logs appear when submitting form
- [ ] No error logs like "Insert error" or "RLS Policy"
- [ ] Language record appears in Supabase languages table
- [ ] language_collaborators record shows user as 'owner'
- [ ] Success message shown and page redirects

---

## Next Steps

**If everything works:**
1. Languages can be created via any entry point
2. Languages persist in Supabase
3. P1.1 is complete ✅
4. Ready for P1.2 (Language Specs Configuration)

**If creation works but has issues:**
- File an issue with console logs
- Share Supabase query results
- Describe exact failure point

**If still failing:**
1. Check all console logs (see above)
2. Run troubleshooting queries in Supabase SQL Editor
3. Verify network responses (Status code, error message)
4. Verify environment variables are set correctly
5. Check Supabase project settings - especially RLS policies

---

## References

- [Supabase Authentication Docs](https://supabase.com/docs/guides/auth)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL UUID Type](https://www.postgresql.org/docs/current/datatype-uuid.html)
- Project Database Schema: `docs/supabase_schema.sql`
- Project RLS Policies: `docs/supabase_rls_policies.sql`
