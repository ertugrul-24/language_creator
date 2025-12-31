# P1.4 Data Persistence Fix - Debugging & Testing Guide

## Problem: Updates Not Persisting

**Symptoms:**
- Update modal closes without error
- Refreshing page shows old data
- Specs remain "Unspecified"

**Root Cause:** UPDATE payload either has wrong column names OR RLS is blocking the operation silently.

---

## Fix Applied: Comprehensive Logging + Reverse Mapper

### 1. **Dedicated Reverse Mapper** ✅

**New Function:** `mapLanguageToDatabaseUpdate()`

Converts Language type → Database UPDATE payload:
```typescript
// Input (TypeScript type)
{
  name: "French",
  description: "A Romance language",
  icon: "🇫🇷",
  visibility: "public"
}

// Output (Database columns - snake_case)
{
  name: "French",
  description: "A Romance language",
  icon_url: "🇫🇷",                    // ← icon → icon_url
  visibility: "public",
  updated_at: "2025-12-31T..."
}
```

**Explicit Mappings:**
```
Frontend (camelCase)  →  Database (snake_case)
─────────────────────────────────────────────
name                  →  name
description           →  description
icon                  →  icon_url
visibility            →  visibility
case_sensitive        →  case_sensitive

specs.alphabetScript      →  alphabet_script
specs.writingDirection    →  writing_direction
specs.wordOrder           →  word_order
specs.depthLevel          →  depth_level
specs.phonemeSet          →  phoneme_set
```

### 2. **Detailed Logging at Every Step** ✅

**Before UPDATE:**
```
[mapLanguageToDatabaseUpdate] Input updates: {name: "French", visibility: "public"}
[mapLanguageToDatabaseUpdate] Mapped name: French
[mapLanguageToDatabaseUpdate] Mapped visibility: public
[mapLanguageToDatabaseUpdate] FINAL OUTPUT (ready for Supabase): {name: "French", visibility: "public", updated_at: "..."}
```

**UPDATE Call:**
```
[updateLanguage] Executing Supabase UPDATE...
[updateLanguage] UPDATE payload keys: ['name', 'visibility', 'updated_at']
[updateLanguage] UPDATE payload values: {name: "French", visibility: "public", updated_at: "..."}
```

**After UPDATE:**
```
[updateLanguage] Raw data returned from database:
  name: French
  visibility: public
  updated_at: 2025-12-31T...
```

---

## Testing the Fix

### **Test 1: Manual Persistence Test (Console)**

Open browser DevTools (F12) → Console, then run:

```javascript
// Import and test
import { testDataPersistence } from '@/services/persistenceTestService';

// Test changing description
await testDataPersistence('your-language-id', {
  description: 'Updated description at ' + new Date().toISOString()
});
```

**Expected Output:**
```
Step 1: Get current data
  description: [old value]

Step 2: Execute UPDATE
  Payload: {description: "Updated..."}

Step 3: Fresh query
  description: Updated...

Step 4: Compare
  ✅ CHANGES PERSISTED:
    description: "old" → "Updated..."
```

**If it fails:**
```
❌ NO CHANGES DETECTED!
The UPDATE executed without error, but the database was not modified!
```

### **Test 2: Check RLS Blocking (Console)**

```javascript
import { checkRLSBlockingUpdate } from '@/services/persistenceTestService';
await checkRLSBlockingUpdate('your-language-id');
```

**Expected:** `✅ UPDATE succeeded` and `✅ Change persisted`

**If RLS is blocking:** `❌ UPDATE failed with error: Code PGRST100...`

### **Test 3: Inspect Raw Database Row (Console)**

```javascript
import { inspectRawRow } from '@/services/persistenceTestService';
const row = await inspectRawRow('your-language-id');
```

Shows exact values in database for ALL columns, helps identify NULL values.

### **Test 4: UI Test - Edit and Refresh**

1. Go to language detail page
2. Click Edit
3. Change description: type `"TEST_" + Date.now()`
4. Click Save
5. **Check console:** Should see detailed logs from `mapLanguageToDatabaseUpdate()` and `updateLanguage()`
6. Refresh page (F5)
7. **Expected:** New description persists
8. **If fails:** Data shows old value after refresh

### **Test 5: UI Test - Visibility and Refresh**

1. Click Visibility button
2. Select "Public"
3. Click Save
4. **Check console:** Look for logs showing `visibility: "public"` in the UPDATE payload
5. Refresh page
6. **Expected:** Language shows "Public" visibility
7. **If fails:** Shows "Private" after refresh

---

## Debugging: Where to Find Clues

### In Browser Console (F12 → Console tab):

**Good signs ✅**
```
[mapLanguageToDatabaseUpdate] FINAL OUTPUT (ready for Supabase): {name: "French", visibility: "public", ...}
[updateLanguage] UPDATE payload keys: ['name', 'visibility', 'updated_at']
[updateLanguage] Raw data returned from database:
  visibility: public
[updateLanguage] ✅ Successfully updated language: xxx
```

**Problem signs ❌**
```
[mapLanguageToDatabaseUpdate] FINAL OUTPUT: {updated_at: "..."}    ← Only timestamp, no other fields!
[updateLanguage] UPDATE payload keys: ['updated_at']               ← Empty update!
[mapLanguageToDatabaseUpdate] No fields to update (only updated_at)  ← Field not mapped!
[updateLanguage] Mapped visibility → visibility_level             ← Wrong column name!
```

**RLS blocking ❌**
```
[updateLanguage] ERROR CODE: PGRST100    ← Permission denied
[updateLanguage] ERROR MESSAGE: new row violates row-level security policy
```

### Check What's Actually in Database

Run in Supabase SQL Editor (or psql):
```sql
SELECT id, name, description, visibility, updated_at
FROM languages
WHERE id = 'your-language-id';
```

Confirm column names match schema:
- `visibility` (not `visibility_level`)
- `alphabet_script` (not `alphabetScript`)
- `writing_direction` (not `writingDirection`)

---

## Step-by-Step Debug Workflow

### If Update Appears to Work (No Error) But Data Doesn't Persist

1. **Check Console Logs:**
   ```
   [mapLanguageToDatabaseUpdate] FINAL OUTPUT: ?
   ```
   - If only has `updated_at` → Field mapping broken
   - If has `name: undefined` → Modal not passing value correctly
   - If has `icon_url: null` → Value was null in input

2. **Verify Payload Keys:**
   ```
   [updateLanguage] UPDATE payload keys: ?
   ```
   - Should see: `['name', 'visibility', 'updated_at']` etc
   - Should NOT see: `['updated_at']` (empty)
   - Should NOT see: `['icon', 'alphabetScript']` (camelCase - wrong!)

3. **Check Returned Data:**
   ```
   [updateLanguage] Raw data returned from database:
     visibility: ?
   ```
   - Should show NEW value after update
   - If shows OLD value → Update didn't execute
   - If shows NULL → Column name mismatch

4. **Manual Test:**
   ```javascript
   await testDataPersistence('language-id', {visibility: 'public'});
   ```
   - If says "NO CHANGES DETECTED" → RLS or column name issue
   - Check error code in Supabase

5. **Check RLS:**
   ```javascript
   await checkRLSBlockingUpdate('language-id');
   ```
   - If fails → RLS blocking, check policies
   - If succeeds → RLS OK, problem elsewhere

---

## Common Issues & Solutions

### Issue: "Update succeeded but no data returned" (PGRST204)

**Cause:** RLS UPDATE allowed but SELECT blocked on result

**Solution:** Already handled! Uses refetch fallback.

**Check:** Console should show:
```
[updateLanguage] UPDATE likely succeeded but SELECT blocked by RLS
[updateLanguage] Attempting to fetch updated language separately...
[updateLanguage] ✅ Refetch successful
```

---

### Issue: Update Closes Modal But Specs Still "Unspecified"

**Cause:** Spec columns are NULL in database (data never populated)

**Solution:** Populate with test data
```javascript
import { populateTestSpecs } from '@/services/rlsDebugService';
await populateTestSpecs('language-id');
```

**Then check:** Overview tab should show "Latin", "ltr", "SVO" etc

---

### Issue: Visibility Changes But Then Resets on Refresh

**Cause:** Update didn't persist (UPDATE executed but didn't modify row)

**Check:**
1. Open console during save
2. Look for: `[updateLanguage] visibility: "public"` in payload
3. Run: `await testDataPersistence('id', {visibility: 'public'})`
4. If test shows "NO CHANGES DETECTED" → RLS or permission issue

---

### Issue: Console Shows Error Code PGRST100

**Cause:** RLS policy rejecting UPDATE

**Check:** Look for `ERROR CODE: PGRST100` in console

**Debug:** Run in SQL editor:
```sql
-- Check if you're the owner
SELECT owner_id FROM languages WHERE id = 'xxx';
SELECT auth.uid();  -- Should match

-- Check if you're a collaborator with editor role
SELECT * FROM language_collaborators 
WHERE language_id = 'xxx' AND user_id = auth.uid();
```

---

## Files Modified

✅ `src/services/languageService.ts`
- Added `mapLanguageToDatabaseUpdate()` (new reverse mapper)
- Enhanced `updateLanguage()` with detailed logging
- Logs every step with column names and values

✅ `src/services/persistenceTestService.ts` (NEW)
- `testDataPersistence()` - Verify updates persist
- `checkRLSBlockingUpdate()` - Check if RLS blocks UPDATE
- `inspectRawRow()` - See raw database values

✅ `src/pages/LanguageDetailPage.tsx`
- Already logs spec columns at fetch time

✅ `src/components/language-detail/EditLanguageModal.tsx`
- Already uses updateLanguage() service

✅ `src/components/language-detail/VisibilitySettingsModal.tsx`
- Already uses updateLanguage() service

---

## Expected Final Behavior

### ✅ Edit and Save Works
1. Click Edit
2. Change name: "Klingon"
3. Click Save
4. Refresh page
5. Name persists as "Klingon" ✓

### ✅ Visibility Persists
1. Change to "Public"
2. Refresh
3. Still shows "Public" ✓

### ✅ Specs Display (After Population)
1. Run `populateTestSpecs()`
2. Overview shows "Latin", "ltr", "SVO"
3. Not "Unspecified" ✓

### ✅ Console Logs Clear
```
[mapLanguageToDatabaseUpdate] FINAL OUTPUT: {name: "Klingon", ...}
[updateLanguage] UPDATE payload keys: ['name', 'updated_at']
[updateLanguage] ✅ Successfully updated language
```

---

## Testing Checklist

- [ ] Edit name → save → refresh → persists
- [ ] Change visibility → save → refresh → persists
- [ ] Console shows detailed logs for each step
- [ ] `testDataPersistence()` shows "CHANGES PERSISTED"
- [ ] `checkRLSBlockingUpdate()` shows "UPDATE succeeded"
- [ ] Run `populateTestSpecs()` → specs appear
- [ ] No "Update succeeded but no data returned" errors
- [ ] Page doesn't require hard refresh to show updates

---

**Updated:** December 31, 2025  
**Status:** Ready for Testing ✅

