# 🔴 CRITICAL: Create the words Table in Supabase

**Current Status:** ❌ Table does NOT exist  
**Why Form Fails:** API cannot find `public.words` table  
**Solution Time:** 2 minutes  

---

## Step-by-Step: Execute the SQL Migration

### Step 1: Open Supabase Dashboard

Go to: https://app.supabase.com/

Log in with your credentials

---

### Step 2: Select Your Project

Click on your project: **language_creator** (or whatever it's named)

---

### Step 3: Go to SQL Editor

In the left sidebar, click: **SQL Editor**

---

### Step 4: Create New Query

Click: **New Query** (or blank area)

Clear any existing text

---

### Step 5: Copy the SQL Migration

Open this file: `docs/CREATE_WORDS_TABLE.sql`

Select ALL the code (Ctrl+A or Cmd+A)

Copy it (Ctrl+C or Cmd+C)

---

### Step 6: Paste in SQL Editor

In Supabase SQL Editor, paste the code (Ctrl+V or Cmd+V)

You should see the full SQL with:
- CREATE TABLE public.words (...)
- CREATE INDEX statements
- CREATE POLICY statements

---

### Step 7: Execute the SQL

Click the **RUN** button (or press Ctrl+Enter)

**Wait for it to complete** (should take 5-10 seconds)

---

### Step 8: Verify Success

You should see:
- ✅ Success message at top
- No red error messages
- Message says "Executed successfully"

---

### Step 9: Verify Table Was Created

In left sidebar under "Database":
- Click: **Tables**
- Scroll down
- Look for: **words** table

**Expected:** You should see `public.words` listed there with columns

---

### Step 10: Verify Columns

Click on the **words** table in the Tables list

Check the columns section:
- id (uuid)
- language_id (uuid)
- owner_id (uuid)
- word (text)
- translation (text)
- part_of_speech (text)
- pronunciation (text)
- audio_url (text)
- etymology (text)
- examples (jsonb)
- created_at (timestamp)
- updated_at (timestamp)

**Expected:** All 12 columns should be present

---

### Step 11: Verify RLS Policies

In left sidebar:
- Click: **Authentication**
- Click: **Policies**
- Filter: Show policies for table **words**

**Expected:** You should see 4 policies:
1. INSERT policy
2. SELECT policy
3. UPDATE policy
4. DELETE policy

---

## Verify It Worked

### In Terminal

```bash
node scripts/verify-words-table.js
```

**Expected output:**
```
✅ VERIFICATION COMPLETE: words table exists and is configured!
```

If you still see error, the table wasn't created. Go back to Step 6.

---

## Now Test the Form

### 1. Start Dev Server

```bash
npm run dev
```

### 2. Open Browser

Go to http://localhost:5173

Navigate to any language → **Dictionary** tab

### 3. Click "Add Word"

Click the green **"Add Word"** button

### 4. Fill Test Form

- **Word:** `test`
- **Translation:** `a test word`
- **Part of Speech:** `noun`

Leave other fields empty

### 5. Submit Form

Click **"Add Word"** button

**Expected:**
- ✅ Green toast shows: "✅ Word 'test' added successfully!"
- ✅ Word appears at top of word list
- ✅ Browser console (F12) shows: `✅ [wordService.addWord] Word added successfully: [uuid]`

### 6. Verify in Supabase

Go back to Supabase Dashboard → **Table Editor**

Click the **words** table

**Expected:** You should see your "test" word in the table with:
- word: "test"
- translation: "a test word"
- part_of_speech: "noun"
- created_at: recent timestamp

---

## If It Still Fails

### Check Table Name

In SQL Editor, run:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

Look for `words` in the results

---

### Check Columns

In SQL Editor, run:

```sql
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'words' ORDER BY ordinal_position;
```

Should show all 12 columns

---

### Check RLS is Enabled

In SQL Editor, run:

```sql
SELECT * FROM pg_tables 
WHERE tablename = 'words' AND schemaname = 'public';
```

Column `rowsecurity` should be `true`

---

### Check Policies Exist

In SQL Editor, run:

```sql
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'words' ORDER BY cmd;
```

Should show 4 rows (INSERT, SELECT, UPDATE, DELETE)

---

## Still Stuck?

Copy this from terminal:

```bash
node scripts/verify-words-table.js
```

And share the output. It will show exactly what's wrong.

---

**⏱️ Total Time:** 2 minutes to execute SQL + 3 minutes to test = **5 minutes**

**After this is done:** P2.2 is COMPLETE! ✅
