# 🔧 Grammar Rules Table Setup & Troubleshooting

## PGRST204 Error Diagnosis

**Error:** `Failed to add rule - [PGRST204]`

**Meaning:** PostgREST (Supabase API layer) cannot find the resource you're trying to INSERT into. Usually means:
- ❌ Table `grammar_rules` doesn't exist
- ❌ RLS policies are blocking the insert
- ❌ Authentication token is invalid

---

## ✅ Step 1: Verify Table Exists in Supabase

**Go to:** [https://app.supabase.com](https://app.supabase.com) → Your Project → SQL Editor

**Run this query:**

```sql
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'grammar_rules'
) as table_exists;
```

**Expected Result:**
```
table_exists
true
```

**If Result is `false`:**
- ❌ Table does NOT exist in your database
- **Fix:** Run the migration SQL (see Step 2)

---

## ✅ Step 2: Create the Grammar Rules Table

**If table doesn't exist, run this SQL migration in Supabase:**

1. Go to SQL Editor
2. Create new query
3. Copy entire contents of [CREATE_GRAMMAR_RULES_TABLE.sql](../docs/CREATE_GRAMMAR_RULES_TABLE.sql)
4. Click "Run"
5. Wait for success message (should see 4 policies created)

**Successful output should show:**
```
1 table created
4 indexes created
RLS enabled
4 policies created
```

---

## ✅ Step 3: Verify Table Structure

**Run this diagnostic query:**

```sql
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'grammar_rules'
ORDER BY ordinal_position;
```

**Expected columns (in order):**

| column_name | data_type | is_nullable | column_default |
|-------------|-----------|-------------|----------------|
| id | uuid | false | gen_random_uuid() |
| language_id | uuid | false | (null) |
| owner_id | uuid | false | (null) |
| name | text | false | (null) |
| description | text | true | (null) |
| category | text | false | (null) |
| rule_type | text | false | (null) |
| pattern | text | true | (null) |
| examples | jsonb | true | (null) |
| created_at | timestamp with tz | true | now() |
| updated_at | timestamp with tz | true | now() |

**If any columns are missing or wrong type:**
- ❌ Schema mismatch
- **Fix:** Delete table and re-run migration:
  ```sql
  DROP TABLE IF EXISTS public.grammar_rules CASCADE;
  -- Then run CREATE_GRAMMAR_RULES_TABLE.sql
  ```

---

## ✅ Step 4: Verify RLS Policies

**Run this diagnostic query:**

```sql
SELECT 
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'grammar_rules'
ORDER BY policyname;
```

**Expected: 4 policies**

| policyname | permissive | IMPORTANT |
|------------|-----------|-----------|
| Users can insert grammar rules they own | PERMISSIVE | WITH CHECK: owner_id = auth.uid() |
| Users can view their own grammar rules | PERMISSIVE | USING: owner_id = auth.uid() |
| Users can update their own grammar rules | PERMISSIVE | USING & WITH CHECK: owner_id = auth.uid() |
| Users can delete their own grammar rules | PERMISSIVE | USING: owner_id = auth.uid() |

**If missing policies:**
- ❌ RLS not fully configured
- **Fix:** Run the SQL migration again

---

## ✅ Step 5: Check RLS is Enabled

**Run this query:**

```sql
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'grammar_rules' AND relnamespace = (
  SELECT oid FROM pg_namespace WHERE nspname = 'public'
);
```

**Expected Result:**
```
relname: grammar_rules
relrowsecurity: true
```

**If `relrowsecurity` is `false`:**
- ❌ RLS is disabled!
- **Fix:**
  ```sql
  ALTER TABLE public.grammar_rules ENABLE ROW LEVEL SECURITY;
  ```

---

## ✅ Step 6: Test Manual Insert (Debug Only)

**To verify the table accepts inserts, run this test:**

1. Copy your actual user ID from the `auth.users` table
2. Copy a language ID that exists in your `languages` table
3. Replace both UUIDs in this query:

```sql
-- Find your user ID first:
SELECT id, email FROM auth.users LIMIT 5;

-- Then find a language:
SELECT id, name FROM languages LIMIT 5;

-- Finally, insert test rule (replace UUIDs):
INSERT INTO public.grammar_rules (
  language_id,
  owner_id,
  name,
  description,
  category,
  rule_type,
  pattern,
  examples,
  created_at,
  updated_at
) VALUES (
  'YOUR_LANGUAGE_ID'::uuid,
  'YOUR_USER_ID'::uuid,
  'Test Rule',
  'Test Description',
  'morphology',
  'inflection',
  'test_pattern',
  '[]'::jsonb,
  NOW(),
  NOW()
) RETURNING *;
```

**Expected:** Row inserted successfully, returns the new rule

**If INSERT fails:**
- Check error message carefully
- Verify language_id exists in `languages` table
- Verify user_id exists in `auth.users` table
- Check RLS policies (are they too restrictive?)

---

## 🐛 Backend Verification

### Check ruleService.ts is using correct table name:

```bash
grep -n "from('grammar_rules')" src/services/ruleService.ts
```

Expected output:
```
45: .from('grammar_rules')
122: .from('grammar_rules')
...
```

**All queries should use `.from('grammar_rules')`**

### Check payload matches schema:

Open `src/services/ruleService.ts` line ~110-120, verify payload:

```typescript
const payload = {
  language_id: input.languageId,      ✅ matches column name
  owner_id: user.id,                   ✅ matches column name
  name: input.name,                    ✅ matches column name
  description: input.description,      ✅ matches column name
  category: input.category,            ✅ matches column name
  rule_type: input.ruleType,           ✅ matches column name
  pattern: input.pattern || null,      ✅ matches column name
  examples: input.examples || [],      ✅ matches column name
};
```

All keys must match column names EXACTLY (snake_case).

---

## 🚀 Frontend Verification

### Build to check TypeScript:

```bash
npm run build
```

Should complete with 0 errors.

### Check browser console:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try adding a rule
4. Look for log entries starting with `📝 [ruleService.addRule]`
5. **IMPORTANT:** Look for the line with error details

Example of what to look for:
```
📝 [ruleService.addRule] Adding rule: Plural Formation to language: abc123
✅ [ruleService.addRule] User authenticated: xyz789
📤 [ruleService.addRule] Sending payload: {language_id, owner_id, name, ...}
❌ [ruleService.addRule] Insert error - Full Details:
   Code: PGRST204
   Message: JWT claims do not match RLS policy requirements
   Details: null
   Hint: null
```

**Read the error message carefully** - it will tell you what's wrong!

---

## 📋 Complete Troubleshooting Checklist

- [ ] 1. Table `grammar_rules` exists in Supabase
- [ ] 2. Table has 11 columns (id through updated_at)
- [ ] 3. All column types match (uuid, text, jsonb, timestamp)
- [ ] 4. RLS is enabled on table
- [ ] 5. 4 RLS policies exist (INSERT, SELECT, UPDATE, DELETE)
- [ ] 6. INSERT policy has `WITH CHECK (owner_id = auth.uid())`
- [ ] 7. Test manual INSERT works (with your actual IDs)
- [ ] 8. ruleService.ts uses `.from('grammar_rules')`
- [ ] 9. addRule() payload has snake_case keys
- [ ] 10. `npm run build` has 0 TypeScript errors
- [ ] 11. Browser console shows enhanced error logging
- [ ] 12. User is authenticated (shown in console logs)

---

## 🆘 Still Stuck?

If you've checked all above and still getting PGRST204:

1. **Copy the EXACT error message from browser console**
2. **Check error has all 5 properties:**
   - Code
   - Message
   - Details
   - Hint
   - Status
3. **Search Supabase docs for your specific error code**
4. **Check Supabase status page:** [https://status.supabase.com](https://status.supabase.com)

---

## Reference Files

- [CREATE_GRAMMAR_RULES_TABLE.sql](../docs/CREATE_GRAMMAR_RULES_TABLE.sql) - Table creation SQL
- [DIAGNOSTIC_GRAMMAR_RULES_SCHEMA.sql](../docs/DIAGNOSTIC_GRAMMAR_RULES_SCHEMA.sql) - Diagnostic queries
- [src/services/ruleService.ts](../src/services/ruleService.ts) - Backend service layer
- [src/components/language-detail/AddRuleModal.tsx](../src/components/language-detail/AddRuleModal.tsx) - Frontend form

---

**Last Updated:** February 3, 2026  
**Status:** Debugging in progress

