# P2.2 Add Word Form - End-to-End Debugging & Fix Guide

## Problem Summary

The Add Word form UI is complete, but form submission fails with "Failed to add word" error. No rows are being inserted into Supabase.

## Debugging Steps (Follow in Order)

### Step 1: Verify Database Table Exists

**In Supabase Dashboard:**

1. Go to your Supabase project → **SQL Editor**
2. Run this query:
   ```sql
   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
   ```
3. **Check:** Do you see `words` in the results?
   - ✅ If YES → Continue to Step 2
   - ❌ If NO → **Skip to "Creating the Table" section below**

### Step 2: Verify Table Schema

**In Supabase Dashboard SQL Editor, run:**

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'words'
ORDER BY ordinal_position;
```

**Expected Columns:**
```
id              | uuid           | not null
language_id     | uuid           | not null
owner_id        | uuid           | not null
word            | text           | not null
translation     | text           | not null
part_of_speech  | text           | not null
pronunciation   | text           | yes
audio_url       | text           | yes
etymology       | text           | yes
examples        | jsonb          | yes
created_at      | timestamp      | not null
updated_at      | timestamp      | not null
```

- ✅ If all columns match → Continue to Step 3
- ❌ If columns missing or different → **See "Table Exists But Schema is Wrong" section**

### Step 3: Check RLS Policies

**In Supabase Dashboard SQL Editor, run:**

```sql
SELECT policyname, qual, with_check, permissive, cmd
FROM pg_policies
WHERE tablename = 'words'
ORDER BY cmd;
```

**Expected Policies:** (You should see 4)
- `INSERT` policy: `with_check` should reference `owner_id = auth.uid()`
- `SELECT` policy: `qual` should reference `owner_id = auth.uid()`
- `UPDATE` policy: `with_check` should reference `owner_id = auth.uid()`
- `DELETE` policy: `qual` should reference `owner_id = auth.uid()`

- ✅ If all 4 policies exist → Continue to Step 4
- ⚠️ If policies missing → **See "Creating RLS Policies" section**

### Step 4: Test Frontend Form Submission

**In your Browser:**

1. Start your app: `npm run dev`
2. Open **DevTools → Console** (F12)
3. Navigate to a language → **Dictionary** tab
4. Click **"Add Word"** button
5. Fill in test data:
   - Word: `test`
   - Translation: `test translation`
   - Part of Speech: `noun`
6. Click **"Add Word"** button
7. **Watch the Console** - You should see logs like:

```
📝 [wordService.addWord] Adding word: test to language: [uuid]
✅ [wordService.addWord] User authenticated: [user-id]
📤 [wordService.addWord] Sending payload to Supabase: {
  language_id: "[uuid]",
  owner_id: "[user-id]",
  word: "test",
  translation: "test translation",
  part_of_speech: "noun",
  pronunciation: null,
  etymology: null,
  examples: []
}
```

**If you see an error message**, read it carefully. Examples:

| Error Message | Meaning | Fix |
|---|---|---|
| `relation "words" does not exist` | Table not created | Execute CREATE_WORDS_TABLE.sql |
| `permission denied for schema public` | RLS policy blocking | Check/update RLS policies |
| `column "pronunciation" does not exist` | Column name mismatch | Verify column names in SQL vs code |
| `violates foreign key constraint` | Invalid language_id or owner_id | Verify language exists and user is logged in |

- ✅ If you see "✅ [wordService.addWord] Word added successfully" → **You're fixed! Skip to "Verification" section**
- ❌ If you see an error → **Note the exact error message and continue debugging**

---

## Solutions by Error Type

### Creating the Table

If `SELECT * FROM information_schema.tables` doesn't show `words`:

**In Supabase SQL Editor:**

1. Open the file: `docs/CREATE_WORDS_TABLE.sql`
2. Copy the entire SQL content
3. In Supabase SQL Editor, paste and run it
4. Verify success - you should see "Success" with row count
5. Re-run Step 2 to confirm schema

### Table Exists But Schema is Wrong

If columns are missing or named differently:

**Option A: Drop and Recreate (if you have no data)**

```sql
DROP TABLE public.words CASCADE;
```

Then execute the SQL from `docs/CREATE_WORDS_TABLE.sql`

**Option B: Add Missing Columns**

Check which columns are missing from the expected list and add them:

```sql
ALTER TABLE public.words ADD COLUMN pronunciation TEXT;
ALTER TABLE public.words ADD COLUMN audio_url TEXT;
-- etc. for other missing columns
```

### RLS Policies Missing

If policies don't exist, they were either not created or dropped.

**Create Policies:**

In Supabase SQL Editor, run:

```sql
-- Allow users to insert only their own words
CREATE POLICY "INSERT: Users can insert their own words"
ON public.words
FOR INSERT
WITH CHECK (owner_id = auth.uid());

-- Allow users to select only their own words
CREATE POLICY "SELECT: Users can select their own words"
ON public.words
FOR SELECT
USING (owner_id = auth.uid());

-- Allow users to update only their own words
CREATE POLICY "UPDATE: Users can update their own words"
ON public.words
FOR UPDATE
WITH CHECK (owner_id = auth.uid());

-- Allow users to delete only their own words
CREATE POLICY "DELETE: Users can delete their own words"
ON public.words
FOR DELETE
USING (owner_id = auth.uid());
```

### Authentication Issue

If the error is "User not authenticated":

1. Check you're logged in to the app
2. Verify in Console that user ID appears in logs
3. Check Supabase auth status in Dashboard → Authentication

---

## Verification: Proving It Works

Once the form submission succeeds, verify the complete flow:

### 1. Check Browser Console

Should show:
```
📝 [wordService.addWord] Adding word: test to language: [uuid]
✅ [wordService.addWord] User authenticated: [user-id]
📤 [wordService.addWord] Sending payload to Supabase: {...}
✅ [wordService.addWord] Word added successfully: [word-id]
```

Toast notification should show: **"✅ Word 'test' added successfully!"**

### 2. Check UI - Word Appears in Dictionary

The new word should appear at the top of the Dictionary word list immediately after submission.

### 3. Check Supabase Database

In Supabase SQL Editor, run:

```sql
SELECT id, word, translation, part_of_speech, owner_id, created_at
FROM public.words
ORDER BY created_at DESC
LIMIT 5;
```

You should see your test word in the results!

---

## Quick Checklist

- [ ] `SELECT * FROM information_schema.tables WHERE table_schema = 'public';` shows `words`
- [ ] `SELECT column_name FROM information_schema.columns WHERE table_name = 'words';` shows all expected columns
- [ ] `SELECT policyname FROM pg_policies WHERE tablename = 'words';` shows 4 policies
- [ ] Browser console shows detailed error logs (not "Failed to add word")
- [ ] Form submission succeeds with "Word added successfully" toast
- [ ] New word appears in Dictionary UI immediately
- [ ] `SELECT * FROM public.words ORDER BY created_at DESC LIMIT 1;` shows the new word

---

## Still Having Issues?

**Collect these for debugging:**

1. **Exact error message** from browser console (copy the full error, not just "Failed to add word")
2. **Schema check output:**
   ```sql
   SELECT column_name, data_type FROM information_schema.columns 
   WHERE table_name = 'words' ORDER BY ordinal_position;
   ```
3. **RLS policies output:**
   ```sql
   SELECT policyname, cmd FROM pg_policies WHERE tablename = 'words';
   ```
4. **Test table read:**
   ```sql
   SELECT COUNT(*) as word_count FROM public.words;
   ```
5. **Screenshot of the error** from browser DevTools

---

## Enhanced Error Logging in Code

The `wordService.addWord()` function has been updated to log:
- ✅ Payload being sent to Supabase
- ✅ Postgres error code (e.g., `42P01` for "relation does not exist")
- ✅ Error details and hints
- ✅ Full error object for inspection

When debugging, always check the **Console** tab in DevTools for these detailed logs!
