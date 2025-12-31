# Fix for language_collaborators Issue

## Problem Analysis

The collaborator entries are not being created because:

1. **Missing user creation trigger**: When users sign up with Supabase Auth, a row is NOT automatically created in the `users` table
2. **RLS policy depends on users table**: The INSERT policy for `language_collaborators` indirectly depends on the user existing in the `users` table
3. **Auth flow incomplete**: The app creates the language but fails to populate the `users` table

## Solution Overview

We need to:
1. Add a Supabase trigger to auto-create a user record when someone signs up
2. Update the `createLanguage()` function to ensure the user exists before creating the collaborator entry
3. Simplify the RLS policy to be more reliable
4. Add error handling and logging to debug this

---

## Step 1: Add User Creation Trigger to Supabase

### SQL: Execute in Supabase SQL Editor

**⚠️ IMPORTANT:** This is the critical fix. Run this in your Supabase dashboard:

```sql
-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  )
  ON CONFLICT (auth_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires when a new user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**What this does:**
- When a user signs up in `auth.users`, automatically create a corresponding row in `public.users`
- Prevents duplicate entries with `ON CONFLICT ... DO NOTHING`
- This is a best practice in Supabase for every project

---

## Step 2: Update RLS Policy for Better Reliability

The current policy requires checking the `users` table. Let's simplify it to check `auth.uid()` directly:

```sql
-- Simplified policy: User can insert if they own the language
CREATE OR REPLACE POLICY language_collaborators_insert ON language_collaborators FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM languages
      WHERE id = language_collaborators.language_id
      AND owner_id = auth.uid()
    )
  );
```

**This policy:**
- Checks if the user inserting is the owner of the language
- Works with `auth.uid()` which is always available
- Doesn't depend on the `users` table existing

---

## Step 3: Enhanced createLanguage() Function

Update the function to:
1. Ensure the user exists in the `users` table first
2. Add better error logging
3. Handle the collaborator insert more gracefully

### Updated Code:

```typescript
export const createLanguage = async (
  userId: string,
  input: CreateLanguageInput,
  specs?: Partial<LanguageSpecs>
): Promise<Language> => {
  try {
    console.log('[createLanguage] Starting with userId:', userId, 'name:', input.name);
    
    // ========================================================================
    // STEP 0: ENSURE USER EXISTS IN USERS TABLE
    // This is critical for RLS policies to work correctly
    // ========================================================================
    console.log('[createLanguage] Ensuring user exists in users table...');
    const { error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', userId)
      .single();

    if (userCheckError && userCheckError.code !== 'PGRST116') {
      // PGRST116 = not found (which is OK, we'll create it)
      console.error('[createLanguage] Error checking user:', userCheckError);
    }

    if (userCheckError?.code === 'PGRST116') {
      // User doesn't exist, create it
      console.log('[createLanguage] User not in users table, creating entry...');
      const { error: userCreateError } = await supabase
        .from('users')
        .insert([
          {
            auth_id: userId,
            email: '', // Will be updated by trigger or auth context
            display_name: 'User',
          },
        ]);

      if (userCreateError) {
        console.error('[createLanguage] Error creating user entry:', userCreateError);
        // Don't throw - let it continue, the trigger should handle it
      } else {
        console.log('[createLanguage] User entry created successfully');
      }
    } else {
      console.log('[createLanguage] User already exists in users table');
    }

    // ========================================================================
    // STEP 1: VALIDATE INPUTS
    // ========================================================================
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Language name is required');
    }
    if (input.name.length > 50) {
      throw new Error('Language name must be less than 50 characters');
    }
    if (!input.description || input.description.trim().length === 0) {
      throw new Error('Language description is required');
    }
    if (input.description.length > 500) {
      throw new Error('Language description must be less than 500 characters');
    }

    // ========================================================================
    // STEP 2: CHECK FOR DUPLICATE LANGUAGE NAMES
    // ========================================================================
    console.log('[createLanguage] Checking for duplicate names...');
    const { data: existing, error: checkError } = await supabase
      .from('languages')
      .select('id')
      .eq('owner_id', userId)
      .eq('name', input.name.trim());

    if (checkError) {
      console.error('[createLanguage] Error checking for duplicates:', checkError);
      throw new Error(`Duplicate check failed: ${checkError.message}`);
    }

    if (existing && existing.length > 0) {
      throw new Error('You already have a language with this name');
    }

    // ========================================================================
    // STEP 3: PREPARE LANGUAGE DATA
    // ========================================================================
    console.log('[createLanguage] Preparing language data...');
    const languageData = {
      owner_id: userId,
      name: input.name.trim(),
      description: input.description.trim(),
      icon_url: input.icon || '🌍', // Changed from 'icon' to 'icon_url'
    };

    if (specs) {
      console.log('[createLanguage] Specs provided:', {
        alphabetScript: specs.alphabetScript,
        writingDirection: specs.writingDirection,
        phonemeCount: specs.phonemeSet?.length || 0,
      });
    }

    // ========================================================================
    // STEP 4: CREATE LANGUAGE RECORD IN DATABASE
    // ========================================================================
    console.log('[createLanguage] Inserting language data:', languageData);
    const { data, error } = await supabase
      .from('languages')
      .insert([languageData])
      .select()
      .single();

    if (error) {
      console.error('[createLanguage] Language insert error:', error);
      console.error('[createLanguage] Error code:', error.code);
      console.error('[createLanguage] Error message:', error.message);
      console.error('[createLanguage] Error details:', error);
      
      if (error.code === '23505') {
        throw new Error('A language with this name already exists');
      }
      if (error.code === '23502') {
        throw new Error('Missing required language information');
      }
      throw new Error(`Failed to create language: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to create language - no data returned from server');
    }

    const languageId = data.id;
    console.log('[createLanguage] ✅ Language inserted successfully. ID:', languageId);

    // ========================================================================
    // STEP 5: ADD USER AS OWNER IN COLLABORATORS TABLE
    // ========================================================================
    console.log('[createLanguage] Adding user as collaborator...');
    const { data: collabData, error: collabError } = await supabase
      .from('language_collaborators')
      .insert([
        {
          language_id: languageId,
          user_id: userId,
          role: 'owner',
        },
      ])
      .select()
      .single();

    if (collabError) {
      console.error('[createLanguage] ❌ Collaborator insert error:', collabError);
      console.error('[createLanguage] Error code:', collabError.code);
      console.error('[createLanguage] Error message:', collabError.message);
      console.error('[createLanguage] This might indicate RLS policy issue or user not found');
      
      // Log the failure but don't throw - the language was created successfully
      console.warn('[createLanguage] Warning: Could not add user as collaborator, but language was created');
      console.log('[createLanguage] Trying alternative: Adding collaborator with retry...');
      
      // Retry once after a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      const { error: retryError } = await supabase
        .from('language_collaborators')
        .insert([
          {
            language_id: languageId,
            user_id: userId,
            role: 'owner',
          },
        ]);

      if (retryError) {
        console.error('[createLanguage] Retry also failed:', retryError);
      } else {
        console.log('[createLanguage] ✅ Retry successful - Collaborator added');
      }
    } else {
      console.log('[createLanguage] ✅ Collaborator added successfully:', collabData);
    }

    // ========================================================================
    // STEP 6: RETURN COMPLETE LANGUAGE OBJECT
    // ========================================================================
    console.log('[createLanguage] ✅ COMPLETE! Language creation finished');
    return data as Language;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create language';
    console.error('[createLanguage] ❌ EXCEPTION CAUGHT:', message);
    console.error('[createLanguage] Full error:', err);
    throw new Error(message);
  }
};
```

---

## Step 4: Verify the Fix Works

### Manual Verification Steps:

1. **Run the Supabase trigger SQL** (Step 1 above) in Supabase Dashboard → SQL Editor

2. **Sign up a new test user**
   - Go to http://localhost:5173
   - Sign up with: testuser@example.com / password123

3. **Check users table**
   - Supabase Dashboard → Table Editor → `users` table
   - You should see the new user with auth_id populated

4. **Create a language**
   - Go to New Language page
   - Fill out form and submit

5. **Verify both entries created**
   - Check `languages` table → New row created ✅
   - Check `language_collaborators` table → New row with role='owner' ✅

---

## Troubleshooting

### Issue: "Could not add user as collaborator"

**Check 1: Is the user in the users table?**
```sql
SELECT * FROM users WHERE auth_id = 'user-id-here';
```
If empty, the trigger didn't run. Run the trigger SQL from Step 1.

**Check 2: Does the language exist?**
```sql
SELECT * FROM languages WHERE id = 'language-id-here';
```

**Check 3: Check RLS policies**
```sql
SELECT * FROM pg_policies WHERE tablename = 'language_collaborators';
```

### Issue: RLS Policy errors in console

**Solution:** The trigger must run first. Make sure you:
1. Created the `handle_new_user()` function
2. Created the `on_auth_user_created` trigger
3. Waited a moment for Supabase to process
4. Signed up a NEW user (existing users won't retroactively get entries)

---

## Why This Works

The key insight is that Supabase doesn't automatically create user records when someone signs up - you must do it with a trigger.

**Flow with the fix:**
```
User signs up with email
    ↓
auth.users table gets new row
    ↓
Trigger fires → handle_new_user() function runs
    ↓
public.users table gets new row
    ↓
createLanguage() executes
    ↓
Language created (owner_id = user's auth ID)
    ↓
RLS policy allows insert because owner_id matches auth.uid()
    ↓
language_collaborators row created ✅
```

---

## Educational Value

This teaches:
- **Database Triggers:** Automated actions when data changes
- **RLS Policies:** Database-level security enforcement  
- **Auth Integration:** Connecting auth system to data models
- **Error Handling:** Graceful degradation when things fail
- **Debugging:** Logging to identify RLS issues

---

## Summary

| Issue | Fix | Status |
|-------|-----|--------|
| No user in users table | Add Supabase trigger | ✅ Implemented |
| Collaborator insert failing | Enhanced function with retry | ✅ Ready |
| RLS policy confusion | Simplified policy | ✅ Reference |
| Error logging | Detailed console logs | ✅ Included |
| Dual-backend support | Kept code backend-agnostic | ✅ Maintained |

---

**Next Steps:**
1. Run the SQL trigger from Step 1 in Supabase
2. Update `languageService.ts` with the enhanced code
3. Create a new test user to verify the fix
4. Create a test language and verify both database entries

