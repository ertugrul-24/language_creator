# P1.4 Debugging Guide - Common Issues & Solutions

**Reference for fixing similar read/update issues**

---

## Issue Pattern: Data displays as "Not specified" or "Unknown"

### Diagnostic Steps

1. **Check the database schema**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'languages';
   ```
   - Look for column names: `alphabet_script`, `writing_direction`, etc.
   - Verify columns actually exist

2. **Check what's being selected**
   ```typescript
   const { data } = await supabase
     .from('languages')
     .select('*')  // ❌ Risky - unclear what's included
     .single();
   ```
   Better:
   ```typescript
   const { data } = await supabase
     .from('languages')
     .select('id, name, alphabet_script, writing_direction')  // ✅ Explicit
     .single();
   ```

3. **Log the actual response**
   ```typescript
   console.log('Raw DB response:', JSON.stringify(data, null, 2));
   ```
   Look for: are the columns present but just NULL/undefined?

4. **Check TypeScript interface**
   - Is TypeScript type expecting nested object?
   - Is database returning flat columns?
   - Need mapping function to bridge them

### Solution Template

```typescript
// 1. Create mapping function
const mapDatabase = (dbData: any) => ({
  specs: {
    alphabetScript: dbData.alphabet_script,
    writingDirection: dbData.writing_direction,
    // ... map all fields
  },
});

// 2. Use explicit select
const { data } = await supabase
  .from('languages')
  .select('id, alphabet_script, writing_direction, ...')
  .single();

// 3. Map response
const typedData = mapDatabase(data);
```

---

## Issue Pattern: Updates fail silently

### Diagnostic Steps

1. **Check if UPDATE query returns data**
   ```typescript
   const { data, error } = await supabase
     .from('languages')
     .update({ name: 'New Name' })
     .eq('id', id)
     .select();  // ❌ Might be missing columns
   
   console.log('Update response:', data, error);
   ```

2. **Explicitly select required columns**
   ```typescript
   .select('id, name, alphabet_script, writing_direction')
   ```

3. **Check RLS policies block the update**
   - Error will say something like: "new row violates row-level security policy"
   - Check: `SELECT * FROM auth.uid();` in Supabase to verify authenticated

4. **Check callback is receiving correct data**
   ```typescript
   onUpdate(data);  // ❌ Might not be properly typed
   
   // Better:
   const typedData = mapDatabase(data);
   onUpdate(typedData);  // ✅ Properly mapped
   ```

### Solution Template

```typescript
// 1. Map camelCase props to snake_case columns
const dbUpdates = {
  alphabet_script: updates.specs?.alphabetScript,
  writing_direction: updates.specs?.writingDirection,
};

// 2. Explicit select after update
const { data } = await supabase
  .from('languages')
  .update(dbUpdates)
  .eq('id', languageId)
  .select('id, name, alphabet_script, writing_direction, ...')
  .single();

// 3. Map response
const typedData = mapDatabase(data);
onUpdate(typedData);
```

---

## Issue Pattern: Foreign key lookup fails

### Diagnostic Steps

1. **Verify foreign key structure**
   ```sql
   -- Check foreign key definition
   SELECT constraint_name, column_name, foreign_table_name, foreign_column_name
   FROM information_schema.key_column_usage
   WHERE table_name = 'languages' AND column_name = 'owner_id';
   ```

2. **Check what column you're joining on**
   - Are you joining on `id` when should be joining on `auth_id`?
   - Are you joining on `auth_id` when should be `id`?

3. **Verify the reference value exists**
   ```typescript
   // Before lookup
   console.log('Looking up owner_id:', languageData.owner_id);
   console.log('With column:', 'auth_id');  // or 'id'?
   ```

4. **Check if join returns null**
   ```typescript
   const { data, error } = await supabase
     .from('users')
     .select('display_name')
     .eq('auth_id', owner_id)  // or 'id'?
     .single();
   
   if (error?.code === 'PGRST116') {
     console.log('Row not found - wrong join column?');
   }
   ```

### Solution Template

```typescript
// 1. Identify what's stored in foreign key
const owner_id = languageData.owner_id;  // This is auth.uid()

// 2. Find which users table column matches it
// If owner_id = auth.uid(), then join on users.auth_id
const { data: owner } = await supabase
  .from('users')
  .select('display_name')
  .eq('auth_id', owner_id)  // ✅ Correct join
  .single();

if (!owner) {
  // Fallback: use email or display Unknown
  return { display_name: 'Unknown' };
}
```

---

## Checklist for Similar Database Issues

When fixing read/update problems:

- [ ] Database schema has all required columns
- [ ] SELECT query explicitly lists all needed columns
- [ ] Mapping function bridges database (snake_case) ↔ TypeScript (camelCase)
- [ ] UPDATE maps TypeScript object → database columns
- [ ] SELECT after UPDATE includes all returned columns
- [ ] Response is mapped before passing to callback/setState
- [ ] Foreign key joins use correct column names
- [ ] Error messages are logged for debugging
- [ ] RLS policies allow the operation
- [ ] Null/undefined values have sensible fallbacks

---

## Quick Debugging Command

Run in Supabase SQL Editor to verify data:

```sql
-- 1. Check language and specs
SELECT 
  id, 
  name, 
  owner_id,
  alphabet_script,
  writing_direction,
  word_order,
  depth_level,
  case_sensitive
FROM languages
WHERE id = 'YOUR-LANGUAGE-ID'
LIMIT 1;

-- 2. Check owner lookup
SELECT 
  id,
  auth_id,
  display_name,
  email
FROM users
WHERE auth_id = 'OWNER_ID_FROM_ABOVE'
LIMIT 1;

-- 3. Check RLS allows read
SELECT 
  COUNT(*)
FROM languages
WHERE owner_id = auth.uid();
```

---

## Common Error Messages & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Language not found" | Wrong ID or RLS blocks SELECT | Check RLS policy, verify ID exists |
| "Property 'alphabetScript' is undefined" | Database returned snake_case, code expects camelCase | Add mapping function |
| "Cannot find property 'id' of undefined" | SELECT didn't include column | Add explicit select: `.select('id, ...')` |
| "Cannot update language" (silent) | RLS policy blocks UPDATE | Check `owner_id = auth.uid()` |
| "Owner shows as Unknown" | Foreign key join on wrong column | Use `users.auth_id` not `users.id` |
| Modal doesn't close after save | Callback didn't call `onClose()` | Add `onClose()` after success |

---

**Last Updated:** January 1, 2026
