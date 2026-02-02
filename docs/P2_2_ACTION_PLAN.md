# P2.2 End-to-End Fix Action Plan

## Status: Form submission FAILING - Requires database setup + debugging

---

## Phase 1: Verify & Create Database Table (5 mins)

### 1.1 Check if `words` table exists

**Go to:** Supabase Dashboard → Your Project → **SQL Editor**

**Run this query:**

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'words';
```

**Result will be:**
- ✅ `words` appears in results → Skip to Phase 2
- ❌ Empty result (no rows) → Continue to 1.2

### 1.2 Create the `words` table

**In SQL Editor:**

1. Clear the editor
2. Open this file: `docs/CREATE_WORDS_TABLE.sql`
3. Copy **ALL** the SQL code
4. Paste it into Supabase SQL Editor
5. Click **RUN** button
6. Verify you see "Success" message
7. Re-run the query from 1.1 to confirm table now exists

---

## Phase 2: Verify Table Schema (5 mins)

### 2.1 Check all required columns exist

**In SQL Editor, run:**

```sql
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'words'
ORDER BY ordinal_position;
```

**Expected output (12 columns):**
```
id              | uuid              | NO  | gen_random_uuid()
language_id     | uuid              | NO  | NULL
owner_id        | uuid              | NO  | NULL
word            | text              | NO  | NULL
translation     | text              | NO  | NULL
part_of_speech  | text              | NO  | NULL
pronunciation   | text              | YES | NULL
audio_url       | text              | YES | NULL
etymology       | text              | YES | NULL
examples        | jsonb             | YES | NULL
created_at      | timestamp         | NO  | now()
updated_at      | timestamp         | NO  | now()
```

- ✅ If all 12 columns match exactly → Continue to Phase 3
- ❌ If columns missing or different → Something went wrong with SQL execution, re-do Phase 1.2

---

## Phase 3: Verify RLS Policies (5 mins)

### 3.1 Check if RLS policies exist

**In SQL Editor, run:**

```sql
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename = 'words'
ORDER BY cmd;
```

**Expected output (4 rows):**
```
INSERT: Users can insert their own words    | INSERT | YES
SELECT: Users can select their own words    | SELECT | YES
UPDATE: Users can update their own words    | UPDATE | YES
DELETE: Users can delete their own words    | DELETE | YES
```

- ✅ If 4 policies exist → Continue to Phase 4
- ❌ If fewer than 4 policies → Run Phase 1.2 again (the CREATE_WORDS_TABLE.sql should have created them)

---

## Phase 4: Test the Form (10 mins)

### 4.1 Start the development server

```bash
npm run dev
```

Open http://localhost:5173 in your browser

### 4.2 Navigate to add word form

1. Click on any language (or create one if needed)
2. Click **Dictionary** tab
3. Click **"Add Word"** button (green button at top)

### 4.3 Open DevTools Console

Press **F12** → Click **Console** tab

### 4.4 Fill in test word

In the "Add Word" form, enter:
- **Word:** `test`
- **Translation:** `testing this form`
- **Part of Speech:** `noun`
- Leave other fields empty

### 4.5 Submit and watch console

Click **"Add Word"** button

**You should see logs like:**

```
📝 [wordService.addWord] Adding word: test to language: [some-uuid]
✅ [wordService.addWord] User authenticated: [your-user-id]
📤 [wordService.addWord] Sending payload to Supabase: {
  language_id: "[uuid]",
  owner_id: "[your-id]",
  word: "test",
  translation: "testing this form",
  part_of_speech: "noun",
  pronunciation: null,
  etymology: null,
  examples: []
}
```

**Then you'll see ONE of:**

**✅ SUCCESS:**
```
✅ [wordService.addWord] Word added successfully: [word-id]
```
Toast shows: "✅ Word 'test' added successfully!"
Word appears in the dictionary list at top

**❌ FAILURE:**
You'll see an error message with details, like:
```
❌ [wordService.addWord] Insert error: {
  message: "relation \"words\" does not exist",
  code: "42P01",
  ...
}
```

---

## Phase 5: If Form Failed - Diagnose the Error

### Error: "relation 'words' does not exist"

Table wasn't created. Go back to Phase 1.2 and execute the SQL again.

### Error: "permission denied"

RLS policies are blocking. Check Phase 3.1 - policies should exist.

### Error: "column 'X' does not exist"

Column name mismatch. Verify Phase 2.1 - all 12 columns should exist.

### Error: "violates foreign key constraint"

The `language_id` isn't valid. Make sure you picked a real language. Or the language you're testing with got deleted.

### Error: "User not authenticated"

Not logged in. Make sure you logged in with Supabase auth before testing.

### Other error?

Look at the error message carefully. The code now shows full details including:
- `code`: Postgres error code (e.g., `42P01`)
- `details`: What went wrong
- `hint`: How to fix it

---

## Phase 6: Verify Success (3 mins)

Once form submission succeeds:

### 6.1 Check word appeared in UI

Should see "test" at top of Dictionary word list in the app

### 6.2 Verify in Supabase

**In SQL Editor, run:**

```sql
SELECT word, translation, part_of_speech, owner_id, created_at
FROM public.words
WHERE word = 'test'
ORDER BY created_at DESC
LIMIT 1;
```

Should show your test word!

### 6.3 Try adding more words

Try adding a more complex word with:
- Pronunciation: `tɛst`
- Etymology: `from English test`
- Example: `This is a test`

All should work and appear in both UI and Supabase.

---

## Success Checklist

- [ ] `words` table exists in Supabase
- [ ] All 12 columns exist with correct types
- [ ] 4 RLS policies exist
- [ ] Form submission succeeds with detailed logs
- [ ] Toast notification shows "✅ Word added successfully!"
- [ ] New word appears at top of Dictionary
- [ ] `SELECT * FROM public.words;` in Supabase shows the word
- [ ] Can add multiple words without errors
- [ ] Phone example phrase insertion works

---

## If Everything Works ✅

The P2.2 "Add Word Form" feature is now **COMPLETE and PRODUCTION-READY**:

1. ✅ UI fully implemented (AddWordModal with all fields)
2. ✅ Validation working
3. ✅ Toast notifications working
4. ✅ Database table created with correct schema
5. ✅ RLS policies configured for data security
6. ✅ End-to-end form submission working
7. ✅ Words persisting to Supabase
8. ✅ Error logging provides detailed diagnostics

Mark P2.2 as **DONE** ✅

---

## Need Help?

When reporting issues, collect:
1. Exact error message from console
2. Output of: `SELECT * FROM information_schema.columns WHERE table_name = 'words';`
3. Output of: `SELECT policyname FROM pg_policies WHERE tablename = 'words';`
4. Screenshot of browser console showing the error
