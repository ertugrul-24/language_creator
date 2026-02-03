# 🎯 IMMEDIATE ACTION PLAN: Fix Grammar Rules PGRST204 Error

## 🚨 Current Issue

**Error:** `Failed to add rule - [PGRST204]`

**Root Cause:** The Supabase `grammar_rules` table doesn't exist or schema doesn't match

**Impact:** Grammar rules feature is completely non-functional (UI loads, but insert fails 100% of time)

---

## ✅ STEP 1: Verify Table Exists in Supabase (5 minutes)

### Action:
1. Go to https://app.supabase.com
2. Select your LinguaFabric project
3. Go to **SQL Editor** (left sidebar)
4. Create new query
5. Copy & paste this diagnostic query:

```sql
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'grammar_rules'
) as table_exists;
```

6. Click **Run** button (or Ctrl+Enter)

### Expected Result:
```
table_exists
true
```

### If Result is FALSE ❌
- ✋ **STOP** - Go to STEP 2
- The table does NOT exist and must be created

### If Result is TRUE ✅
- ✔️ **PROCEED** to STEP 2 (verify schema)

---

## ✅ STEP 2: Verify Table Schema (5 minutes)

### Action:
1. In same SQL Editor, run this query:

```sql
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'grammar_rules'
ORDER BY ordinal_position;
```

2. Click **Run**

### Expected Result (11 rows):
```
id              | uuid   | false
language_id     | uuid   | false
owner_id        | uuid   | false
name            | text   | false
description     | text   | true
category        | text   | false
rule_type       | text   | false
pattern         | text   | true
examples        | jsonb  | true
created_at      | timestamp with time zone | true
updated_at      | timestamp with time zone | true
```

### If Any Column Missing or Wrong Type ❌
- ✋ **STOP** - Go to STEP 3 (recreate table)
- Schema mismatch will cause PGRST204

### If All Columns Match ✅
- ✔️ **PROCEED** to STEP 3 (verify RLS)

---

## ✅ STEP 3: Verify RLS Policies (5 minutes)

### Action:
1. In SQL Editor, run this query:

```sql
SELECT 
  policyname,
  permissive
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'grammar_rules'
ORDER BY policyname;
```

2. Click **Run**

### Expected Result (4 rows):
```
Users can delete their own grammar rules     | PERMISSIVE
Users can insert grammar rules they own      | PERMISSIVE
Users can update their own grammar rules     | PERMISSIVE
Users can view their own grammar rules       | PERMISSIVE
```

### If Policies Missing or Wrong ❌
- ✋ **STOP** - Go to STEP 4 (recreate policies)
- Missing INSERT policy will cause PGRST301 errors

### If All 4 Policies Present ✅
- ✔️ **PROCEED** to STEP 5 (check RLS enabled)

---

## ✅ STEP 4: Verify RLS is Enabled (5 minutes)

### Action:
1. In SQL Editor, run this query:

```sql
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'grammar_rules' AND relnamespace = (
  SELECT oid FROM pg_namespace WHERE nspname = 'public'
);
```

2. Click **Run**

### Expected Result:
```
relname: grammar_rules
relrowsecurity: true
```

### If `relrowsecurity` is FALSE ❌
- Run this to enable:
```sql
ALTER TABLE public.grammar_rules ENABLE ROW LEVEL SECURITY;
```

### If TRUE ✅
- ✔️ **PROCEED** to STEP 5 (backend diagnostics)

---

## ✅ STEP 5: Create/Recreate Table (If Needed - 10 minutes)

### ⚠️ ONLY DO THIS IF STEPS 1-4 SHOW PROBLEMS

### Action:
1. Go to SQL Editor
2. Create new query
3. **Copy entire contents from:**
   ```
   docs/CREATE_GRAMMAR_RULES_TABLE.sql
   ```
4. Paste into SQL Editor
5. Click **Run**

### Expected Success Output:
```
Query completed successfully
```

### If Errors ❌
- **Copy the error message** and share it
- Common errors:
  - `Table already exists`: Drop table first
  - `Syntax error`: Copy/paste issue
  - `Foreign key constraint`: `languages` or `auth.users` table missing

---

## ✅ STEP 6: Test Backend Logging (5 minutes)

### Action:
1. Open your app in browser
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Navigate to a language's Rules tab
5. Click **"+ Add Rule"** button
6. Fill the form:
   - Rule Name: "Test Rule"
   - Category: Morphology
   - Rule Type: Inflection
7. Click **"Add Rule"** button
8. **WAIT** - do NOT close console

### What to Look For:
The console should show log lines like:

```
📝 [ruleService.addRule] Adding rule: Test Rule to language: abc-123-def
✅ [ruleService.addRule] User authenticated: xyz-789-uvw
[ruleService.addRule] Payload validation:
  language_id: abc-123-def OK
  owner_id: xyz-789-uvw OK
  name: Test Rule OK
  category: morphology OK
  rule_type: inflection OK
  examples (count): 0
📤 [ruleService.addRule] Sending payload to Supabase: {language_id, owner_id, name, ...}
```

### Then You'll See Either:

#### ✅ SUCCESS:
```
📥 [ruleService.addRule] Supabase response: {
  status: 'SUCCESS',
  data: {id: 'uuid-here', name: 'Test Rule', ...},
  error: null
}
✅ [ruleService.addRule] Rule persisted: uuid-here
📊 [ruleService.addRule] Updating language stats...
✅ [ruleService.addRule] Language stats updated
```
**THEN:** Rule appears in list, toast shows "✅ Grammar rule "Test Rule" added successfully!"

#### ❌ FAILURE:
```
📥 [ruleService.addRule] Supabase response: {
  status: 'ERROR',
  data: null,
  error: {
    message: '[ACTUAL ERROR MESSAGE HERE]',
    code: 'PGRST204',
    status: 404,
    details: null,
    hint: null
  }
}
❌ [ruleService.addRule] Insert error: [ACTUAL ERROR MESSAGE HERE]
```

### If FAILURE ❌
- **Copy the exact error message** from console
- Scroll up in console to find all the logs
- Share screenshot or text of the error
- Go back to STEP 1-4 to verify schema

### If SUCCESS ✅
- 🎉 **THE BUG IS FIXED!**
- **Next:** Verify rule appears in Supabase table:
  1. Go to https://app.supabase.com
  2. Go to **Table Editor** (left sidebar)
  3. Click **grammar_rules** table
  4. Should see your "Test Rule" row

---

## 🔍 DEBUGGING CHECKLIST

Use this to systematically find the problem:

- [ ] 1. Table `grammar_rules` exists in Supabase
- [ ] 2. All 11 columns exist with correct types
- [ ] 3. All columns match exactly (no typos, correct order)
- [ ] 4. 4 RLS policies exist
- [ ] 5. RLS is enabled (relrowsecurity = true)
- [ ] 6. INSERT policy allows owner_id = auth.uid()
- [ ] 7. Browser shows authenticated user in console logs
- [ ] 8. Payload validates (no null language_id, no empty name)
- [ ] 9. Error message in console shows Supabase code/message
- [ ] 10. Supabase table shows inserted row after success
- [ ] 11. Language stats increment (total_rules increases by 1)

---

## 📞 If Still Stuck

**Provide this information:**

1. Screenshot of SQL query result showing table exists
2. Screenshot of SQL query result showing all columns
3. Screenshot of console error (F12 → Console tab)
4. Error code from console (e.g., PGRST204, PGRST301)
5. Full error message from console

**Reference Guide:**
- [GRAMMAR_RULES_PGRST204_FIX.md](../docs/GRAMMAR_RULES_PGRST204_FIX.md) - Full troubleshooting guide
- [DIAGNOSTIC_GRAMMAR_RULES_SCHEMA.sql](../docs/DIAGNOSTIC_GRAMMAR_RULES_SCHEMA.sql) - SQL diagnostics
- [CREATE_GRAMMAR_RULES_TABLE.sql](../docs/CREATE_GRAMMAR_RULES_TABLE.sql) - Table creation SQL

---

## 🎯 Expected Timeline

- STEP 1-2: **5 minutes** - Verify table/schema
- STEP 3-4: **5 minutes** - Verify RLS
- STEP 5: **10 minutes** (if needed) - Recreate table
- STEP 6: **5 minutes** - Test and debug

**Total:** 15-30 minutes to fix

---

**Status:** 🔴 BLOCKED - Grammar rules don't insert (PGRST204)  
**Priority:** 🔴 CRITICAL - Feature completely non-functional  
**Next Step:** ⬇️ STEP 1 - Start diagnosing now

