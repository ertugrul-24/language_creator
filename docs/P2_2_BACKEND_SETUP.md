# P2.2 Backend Setup Guide - Create Words Table

## Overview

The Add Word form is now complete on the frontend, but requires database setup to persist words. Follow these steps to create the `public.words` table in your Supabase project.

## Step 1: Copy SQL Migration

The SQL migration file is located at: [docs/CREATE_WORDS_TABLE.sql](CREATE_WORDS_TABLE.sql)

## Step 2: Execute in Supabase

1. Go to your Supabase project dashboard: https://app.supabase.com/
2. Navigate to the **SQL Editor** section
3. Create a new query and paste the entire content from [docs/CREATE_WORDS_TABLE.sql](CREATE_WORDS_TABLE.sql)
4. Click **Run** to execute the migration

This will create:
- ✅ `public.words` table with all columns
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) enabled
- ✅ Four RLS policies for access control

## Step 3: Verify Table Creation

After running the SQL, verify the table was created:

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'words'
);

-- Check table structure
\d public.words

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'words';
```

You should see:
- ✅ Table exists: `t` (true)
- ✅ Columns: id, language_id, owner_id, word, translation, part_of_speech, pronunciation, audio_url, etymology, examples, created_at, updated_at
- ✅ 4 RLS policies: INSERT, SELECT, UPDATE, DELETE

## Step 4: Test from Frontend

Once the table is created:

1. Start dev server: `npm run dev`
2. Navigate to a language detail page
3. Click the **Dictionary** tab
4. Click **Add Word** button
5. Fill in the form:
   - **Word**: Enter a word in your constructed language
   - **Translation**: Enter English translation
   - **Part of Speech**: Select from dropdown
   - Other fields are optional
6. Click **Add Word**

### Expected Behavior

✅ **Success:**
- Toast notification appears: "✅ Word '[word]' added successfully!"
- Modal closes after 1.5 seconds
- Word list refreshes with the new word at the top
- Console shows: `✅ [wordService.addWord] Word added successfully: [id]`

❌ **If It Fails:**
- Toast notification shows error message
- Check browser console for detailed error logs
- Verify Supabase table was created correctly
- Ensure you're authenticated (logged in)

## RLS Policies Explained

The table has 4 RLS policies for security:

| Policy | Operation | Condition | Purpose |
|--------|-----------|-----------|---------|
| Users can insert words they own | INSERT | `owner_id = auth.uid()` | Only authenticated users can add words |
| Users can view their own words | SELECT | `owner_id = auth.uid()` | Users only see their own words |
| Users can update their own words | UPDATE | `owner_id = auth.uid()` | Users only edit their own words |
| Users can delete their own words | DELETE | `owner_id = auth.uid()` | Users only delete their own words |

This ensures users can only see/edit/delete their own dictionary entries.

## Table Schema Details

```sql
CREATE TABLE public.words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id UUID NOT NULL,  -- Reference to the language
  owner_id UUID NOT NULL,     -- Reference to auth.users.id (who owns this word)
  word TEXT NOT NULL,          -- Word in constructed language
  translation TEXT NOT NULL,   -- English translation
  part_of_speech TEXT NOT NULL, -- noun, verb, adjective, etc.
  pronunciation TEXT,          -- IPA notation (optional)
  audio_url TEXT,              -- Audio file URL (optional)
  etymology TEXT,              -- Etymology notes (optional)
  examples JSONB,              -- Array of {phrase, translation} (optional)
  created_at TIMESTAMPTZ,      -- When word was created
  updated_at TIMESTAMPTZ       -- When word was last updated
);
```

## Troubleshooting

### Error: "relation 'words' does not exist"

**Cause:** The table was not created successfully

**Solution:**
1. Go to Supabase SQL Editor
2. Run the CREATE_WORDS_TABLE.sql again
3. Check for error messages in the SQL output
4. Verify the table appears in the database schema

### Error: "Failed to add word"

**Cause:** Database error or RLS policy blocking the insert

**Steps to diagnose:**
1. Check browser console for full error message
2. Verify you're logged in (user is authenticated)
3. Check Supabase Activity Logs for error details
4. Verify owner_id is being passed correctly

### Error: "User not authenticated"

**Cause:** User session is not valid

**Solution:**
1. Log out and log back in
2. Check browser console for auth errors
3. Refresh the page
4. Verify localStorage has auth tokens

## What Happens When You Add a Word

1. **Frontend:** User fills form and clicks "Add Word"
2. **Validation:** Form validates all required fields and IPA format
3. **Service:** `wordService.addWord()` is called with form data
4. **Auth Check:** Gets current user ID from `supabase.auth.getUser()`
5. **Insert:** Creates row in `words` table with `owner_id = current_user.id`
6. **RLS:** Row Level Security policy verifies `owner_id = auth.uid()`
7. **Response:** Returns word ID on success
8. **Toast:** Success notification displays
9. **Refresh:** Dictionary tab fetches latest words and displays new word

## Environment Variables

Make sure your `.env.local` has valid Supabase credentials:

```
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
```

These are used to authenticate requests to Supabase.

## Next Steps

After successfully creating words:

- **P2.3**: Implement update/delete operations (Edit Word, Delete Word buttons)
- **P2.4**: Build inline word editing with modal
- **P2.5+**: Grammar rules, courses, and other features

---

**Status:** ✅ Ready to implement  
**Last Updated:** February 2, 2026
