# P1.4 Final Fix - UPDATE + RLS + RETURNING Issue Resolution

## Current State Analysis

### What Was Broken
1. **UPDATE succeeds but SELECT returns 0 rows** (PGRST204 error)
2. **RLS UPDATE/SELECT mismatch** - user can UPDATE but can't SELECT the result
3. **Specs columns are NULL** in database, causing "Unspecified" display

### Root Cause
The error "Update succeeded but no data returned" (PGRST204) indicates:
- `.update()` query succeeds (changes saved to database)
- `.select().single()` returns 0 rows
- This happens when RLS allows UPDATE but blocks SELECT on the same row

**Why?** Supabase RLS has:
- **USING clause** (check UPDATE permission) ✅
- **No WITH CHECK clause** (check result visibility)

So UPDATE succeeds but the result doesn't pass the SELECT policy.

---

## Fixes Implemented

### 1. **Updated `updateLanguage()` with Refetch Fallback** ✅

**File:** `src/services/languageService.ts`

**Change:**
```typescript
// Try UPDATE with SELECT first
const { data, error } = await supabase
  .from('languages')
  .update(dbUpdates)
  .eq('id', languageId)
  .select('*')
  .single();

// If PGRST204 (UPDATE succeeded but SELECT blocked):
if (error?.code === 'PGRST204') {
  console.warn('UPDATE likely succeeded but SELECT blocked by RLS');
  
  // Fetch with separate SELECT query
  const { data: refetchData, error: refetchError } = await supabase
    .from('languages')
    .select('*')
    .eq('id', languageId)
    .single();

  if (refetchError) throw new Error(...);
  return mapDatabaseLanguageToLanguage(refetchData);
}
```

**Result:**
- ✅ UPDATE succeeds
- ✅ Even if `.select()` on UPDATE fails, separate SELECT works
- ✅ Returns properly mapped data
- ✅ UI updates correctly

### 2. **Added Comprehensive Logging** ✅

**Files:**
- `src/services/languageService.ts` - mapDatabaseLanguageToLanguage logs input/output
- `src/pages/LanguageDetailPage.tsx` - logs all spec columns when fetching
- `src/services/updateLanguage()` - logs each step with error codes

**Result:** Can trace exact point of failure in browser console

### 3. **Created RLS Debug Service** ✅

**File:** `src/services/rlsDebugService.ts`

Functions:
- `testRLSSelect()` - Can user SELECT?
- `testRLSUpdate()` - Can user UPDATE?
- `inspectDatabaseRow()` - What's actually in the database?
- `testUpdateSelectWorkflow()` - Does UPDATE+SELECT work?
- `populateTestSpecs()` - Populate NULL spec columns with test data
- `runComprehensiveRLSTest()` - Run all tests

**Result:** Can diagnose RLS issues in browser console

---

## The "Unspecified" Problem

### Why Specs Show as "Unspecified"

The `alphabet_script`, `writing_direction`, etc. columns are **NULL** in the database because:
1. `createLanguage()` doesn't populate these columns
2. Only Phase 1.2+ was supposed to support them
3. But the schema was created with the columns

### Solution

To populate specs with test data, open browser console and run:
```javascript
// Import and run from rlsDebugService
import { populateTestSpecs } from '@/services/rlsDebugService';
await populateTestSpecs('your-language-id-here');
```

This will:
1. UPDATE the language with real spec values
2. If PGRST204 error, use refetch fallback
3. Return the updated data
4. Page will refresh to show populated specs

---

## Testing the Full Fix

### Step 1: Verify UPDATE Works

1. Go to language detail page
2. Click Edit button
3. Change description
4. Click Save
5. **Expected:** No error, modal closes, page updates

### Step 2: Check Console Logs

1. Open DevTools (F12)
2. Go to Console tab
3. Look for logs like:
   ```
   [updateLanguage] Starting update for language: xxx
   [updateLanguage] Final database updates: {...}
   [updateLanguage] ✅ Successfully updated language: xxx
   ```

### Step 3: Populate Specs (if NULL)

1. Open Console
2. Run:
   ```javascript
   import { populateTestSpecs } from './src/services/rlsDebugService.ts';
   await populateTestSpecs('your-language-id');
   ```
3. **Expected:** Specs get populated, Overview shows data

### Step 4: Verify Overview Updates

1. After update or populate, go to Overview tab
2. Check that fields show actual values:
   - Alphabet/Script: `Latin` (not "Not specified")
   - Writing Direction: `ltr` (not "Not specified")
   - Case Sensitive: `✓ Yes` (not `✗ No`)

---

## Detailed Data Flow

### Original Fetch (LanguageDetailPage)
```
1. SELECT * FROM languages WHERE id = ?
   ├─ Database returns all columns
   ├─ Logs spec columns
   └─ Map to Language type with specs object ✅

2. UI (OverviewTab) reads language.specs.alphabetScript
   └─ If NULL from DB → displays "Not specified" ✅
```

### UPDATE Flow (EditLanguageModal)
```
1. Call updateLanguage(id, { name, description, icon })
   │
2. Try: UPDATE ... SELECT * SINGLE
   ├─ If succeeds → Map and return ✅
   └─ If PGRST204 error → Use refetch fallback
        │
        └─ Separate SELECT * 
           └─ Map and return ✅

3. Set language state with returned data
   │
4. UI updates automatically ✅
```

### Visibility Update Flow (VisibilitySettingsModal)
```
1. Call updateLanguage(id, { visibility })
   │
2. Same flow as EditLanguageModal
   │
3. Return updated language
   │
4. Set new visibility in state ✅
```

---

## Key Implementation Details

### mapDatabaseLanguageToLanguage()

Converts snake_case database columns → camelCase Language type:
```typescript
specs: {
  alphabetScript: dbData.alphabet_script,           // ← snake to camel
  writingDirection: dbData.writing_direction,
  wordOrder: dbData.word_order,
  depthLevel: dbData.depth_level,
  phonemeSet: dbData.phoneme_set || [],
},
case_sensitive: dbData.case_sensitive || false,
vowel_count: dbData.vowel_count,
consonant_count: dbData.consonant_count,
```

### RLS Policy (Current)

```sql
CREATE POLICY languages_update ON languages FOR UPDATE USING (
  owner_id = auth.uid() OR
  EXISTS (SELECT ... FROM language_collaborators WHERE ... role IN ('owner', 'editor'))
);
```

**Issue:** No `WITH CHECK` clause, so RETURNING/SELECT after UPDATE might fail

**Workaround:** Use separate SELECT if UPDATE SELECT fails

### Error Handling

| Error Code | Meaning | Action |
|-----------|---------|--------|
| PGRST116 | Not found/no permission | Throw error |
| PGRST204 | UPDATE OK but SELECT 0 rows | Use refetch fallback |
| Other | Unexpected error | Throw with code |

---

## Troubleshooting

### Issue: Still showing "Unspecified"
**Cause:** Spec columns are NULL in database
**Fix:** Run `populateTestSpecs()` from console

### Issue: UPDATE still gives error
**Cause:** RLS blocking UPDATE
**Fix:** Check RLS policies, verify user is owner or collaborator

### Issue: Cannot find imported functions
**Cause:** Import path wrong
**Fix:** Use absolute path with `@/services/...`

### Issue: "Update succeeded but no data returned" still shows
**Cause:** Refetch also failing
**Fix:** Check RLS SELECT policy, ensure language is accessible

---

## Expected Final Behavior

### ✅ Update Succeeds
- Edit name/description → Saves without error
- Change visibility → Saves without error
- Modal closes after save

### ✅ Data Displays Correctly
- Overview tab shows all spec values
- No "Unspecified" when data exists
- Updates appear immediately in UI

### ✅ Error Messages Clear
- If error: Shows specific error code (PGRST116, etc.)
- Console logs show exactly where it failed
- Can debug with debug page or RLS test functions

### ✅ RLS Works Properly
- Owner can UPDATE ✓
- Owner can SELECT updated row ✓
- Collaborators with edit role can UPDATE ✓
- Collaborators with edit role can SELECT ✓

---

## Files Changed

### Services
- `src/services/languageService.ts`
  - Enhanced updateLanguage() with refetch fallback
  - Added detailed logging to mapDatabaseLanguageToLanguage()
  
- `src/services/rlsDebugService.ts` *(NEW)*
  - Comprehensive RLS testing utilities
  - Spec population helper

### Pages
- `src/pages/LanguageDetailPage.tsx`
  - Added logging for spec columns

### Components
- `src/components/language-detail/EditLanguageModal.tsx`
  - Already using updateLanguage() service

- `src/components/language-detail/VisibilitySettingsModal.tsx`
  - Already using updateLanguage() service

---

## Next Steps After P1.4 is Fixed

1. **Implement proper spec editing UI**
   - Add form fields for alphabet, writing direction, word order, etc.
   - Populate these when creating/editing language

2. **Add RLS WITH CHECK clause**
   - Optimize UPDATE ... SELECT to work without refetch

3. **Create language specs wizard**
   - Guide users through setting up language specs

4. **Move to P1.5 (Languages List Page)**
   - Build languages list with filtering/searching

---

## Testing Checklist

- [ ] Language detail page loads without error
- [ ] Edit modal opens with pre-filled data
- [ ] Changing description and saving works
- [ ] Visibility settings modal works
- [ ] Browser console shows detailed logs
- [ ] Run `populateTestSpecs()` makes specs appear
- [ ] Overview tab shows populated specs (not "Unspecified")
- [ ] Refreshing page keeps updated values
- [ ] Debug page (/debug/languages/:id) runs tests successfully

---

**Updated:** December 31, 2025  
**Status:** Ready for Testing ✅

