# P1.4 Data Issues - Root Cause Analysis & Fixes

## Problem Statement

P1.4 Language Detail Page had critical data issues:
1. **Overview tab** shows specs as "Unspecified" even when data exists in database
2. **Edit modal** opens with correct data (proving data exists)
3. **UPDATE operations** fail silently with no persisted changes
4. **Visibility settings** fail to save

**Root cause:** Data contract mismatch + query inconsistency + service layer bypass

---

## Root Causes Identified

### 1. **DATA CONTRACT MISMATCH** ❌

**The Problem:**
- Database stores specs in **individual columns** (snake_case):
  - `alphabet_script`
  - `writing_direction`
  - `word_order`
  - `depth_level`
  - `case_sensitive`
  - `vowel_count`
  - `consonant_count`

- Frontend TypeScript expects **nested object** (camelCase):
  ```typescript
  specs: {
    alphabetScript: string
    writingDirection: 'ltr' | 'rtl' | 'boustrophedon'
    wordOrder: string
    depthLevel: 'realistic' | 'simplified'
    phonemeSet: Phoneme[]
  }
  ```

- Components like `OverviewTab` try to read `language.specs.alphabetScript` but the data isn't mapped properly.

**Solution Implemented:**
- `mapDatabaseLanguageToLanguage()` function converts DB columns → nested spec object
- Applied consistently in `getLanguage()`, `updateLanguage()`, and modal responses

---

### 2. **INCONSISTENT DATA FETCHING** ❌

**The Problem:**
- Different parts of the app fetched language data differently:
  - `EditLanguageModal`: Direct Supabase query with explicit column SELECT
  - `VisibilitySettingsModal`: Direct Supabase query
  - `LanguageDetailPage`: Service layer function
  - None of them consistently mapped the response

- Each fetch was using different SELECT columns, increasing chance of:
  - Column name typos
  - Missing fields
  - RLS policy bypasses
  - Data inconsistency

**Solution Implemented:**
- `EditLanguageModal` and `VisibilitySettingsModal` now use `updateLanguage()` service function
- All UPDATEs go through the same service layer
- Consistent response mapping everywhere
- Single point of truth for database column mapping

---

### 3. **MISSING `case_sensitive` IN UPDATE** ❌

**The Problem:**
- Database has `case_sensitive` column for language specs
- `updateLanguage()` function didn't support updating it
- OverviewTab showed "No" even when enabled

**Solution Implemented:**
- Added `case_sensitive?: boolean` to updateLanguage signature
- Maps to/from database correctly

---

### 4. **EXPLICIT SELECT QUERIES ARE FRAGILE** ⚠️

**The Problem:**
```typescript
// This is fragile - easy to have typo or miss a column
.select(`
  id,
  owner_id,
  name,
  description,
  icon_url,
  cover_image_url,
  visibility,
  alphabet_script,  // Easy to typo this
  writing_direction,
  word_order,
  depth_level,
  case_sensitive,
  vowel_count,
  consonant_count,
  total_words,
  total_rules,
  total_contributors,
  created_at,
  updated_at
`)
```

**Solution Implemented:**
- Use `.select('*')` for reliability
- All columns fetched, eliminates typo risk
- Slightly less efficient but FAR more reliable
- Pair with comprehensive logging to debug issues

---

## Fixes Applied

### Fix 1: Enhanced `updateLanguage()` Service

**File:** `src/services/languageService.ts`

Changes:
- Added `case_sensitive?: boolean` to update parameters
- Added detailed logging at EACH mapping step
- Log error codes: `PGRST116`, `PGRST204`, etc.
- Better error messages mentioning permission issues
- Changed from explicit SELECT → `SELECT '*'`

**Benefits:**
- Consistent response mapping
- Comprehensive error diagnostics
- All fields returned
- Clear permission error messages

---

### Fix 2: Unified Modal Update Approach

**Files:**
- `src/components/language-detail/EditLanguageModal.tsx`
- `src/components/language-detail/VisibilitySettingsModal.tsx`

Changes:
- **Before:** Directly called `supabase.from('languages').update()`
- **After:** Call `updateLanguage()` service function
- Removed duplicate response mapping code
- Consistent error handling

**Benefits:**
- Single point of truth for updates
- Response always properly mapped
- Matching error handling
- Modal and page use same data source

---

### Fix 3: Proper Data Mapping

**Function:** `mapDatabaseLanguageToLanguage()`

Maps database columns → TypeScript Language type:
```typescript
const mapDatabaseLanguageToLanguage = (dbData: any): Language => {
  return {
    // ... simple fields ...
    specs: {
      alphabetScript: dbData.alphabet_script,           // ← snake → camel
      writingDirection: dbData.writing_direction,       // ← conversion
      wordOrder: dbData.word_order,
      depthLevel: dbData.depth_level,
      phonemeSet: dbData.phoneme_set || [],
    },
    vowel_count: dbData.vowel_count,                   // ← direct mapping
    consonant_count: dbData.consonant_count,
    case_sensitive: dbData.case_sensitive || false,
    // ... timestamps ...
  };
};
```

**Applied to:**
- ✅ `getLanguage()` return value
- ✅ `updateLanguage()` return value
- ✅ All modal responses

---

## Testing the Fixes

### Method 1: Debug Console Page 🔍

Navigate to: `http://localhost:5173/debug/languages/{languageId}`

This page runs comprehensive diagnostics:

```
✅ Step 1: Get Current User
   - Verifies you're authenticated
   
✅ Step 2: Check User in public.users Table
   - Ensures user exists in the database
   
✅ Step 3: SELECT Language (All Columns)
   - Fetches language with SELECT *
   - Should show all spec columns populated
   
✅ Step 4: Spec Fields Check
   - Verifies alphabet_script, writing_direction, etc. have values
   - Shows how many spec fields are populated
   
✅ Step 5: Test UPDATE
   - Attempts to update description
   - Tests if owner has permission
   
✅ Step 6: Verify UPDATE Persisted
   - Re-fetches to confirm changes saved
   
✅ Step 7: Check RLS Context
   - Tests if RLS policies working correctly
   
✅ Step 8: Test Data Mapping
   - Verifies mapDatabaseLanguageToLanguage() works
```

**Expected Results:**
- All tests should pass ✅
- If UPDATE fails: RLS permission issue (see browser console for error code)
- If specs show "Unspecified": Database columns are NULL
- If mapping fails: Check Language interface in types/database.ts

---

### Method 2: Manual Testing

**Test 1: Check if Overview shows specs**
1. Go to language detail page `/languages/{languageId}`
2. Look at Overview tab
3. Should show: Alphabet, Writing Direction, Word Order, Case Sensitive, etc.
4. Should NOT show "Unspecified" if data exists

**Test 2: Edit language name**
1. Click Edit button
2. Modal opens with pre-filled data
3. Change description
4. Click Save
5. Modal closes
6. Page updates without error

**Test 3: Change visibility**
1. Click Visibility button
2. Select different visibility level
3. Click Save
4. Modal closes
5. Language visibility updates

---

## RLS Permission Debugging

If UPDATEs fail, the issue is likely RLS policies.

**Check RLS Policy in database:**
```sql
CREATE POLICY languages_update ON languages FOR UPDATE USING (
  owner_id = auth.uid() OR
  EXISTS (SELECT 1 FROM language_collaborators 
    WHERE language_id = languages.id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'editor'))
);
```

**What This Means:**
- ✅ Owner (`owner_id = auth.uid()`) can UPDATE
- ✅ Collaborators with role `editor` or `owner` can UPDATE
- ❌ Everyone else cannot UPDATE

**If UPDATE fails:**
1. Check error code in browser console
2. Verify you are the owner or have collaborator role
3. Run debug page to see actual error
4. Check Supabase Dashboard → Logs for RLS rejection details

---

## Data Flow Diagram

### Before Fix (Broken)
```
LanguageDetailPage
  ├─ Fetches language (service)
  ├─ BUT specs not mapped correctly ❌
  │
  EditLanguageModal
  ├─ Bypasses service ❌
  ├─ Does own Supabase query
  ├─ Does own response mapping
  ├─ Different from parent ❌
  │
  VisibilitySettingsModal
  ├─ Also bypasses service ❌
  ├─ Different response format
  └─ Inconsistent with page

OverviewTab reads language.specs.alphabetScript
  └─ But it's undefined because not mapped ❌
```

### After Fix (Working)
```
LanguageDetailPage
  └─ Fetches via getLanguage()
       └─ Returns mapDatabaseLanguageToLanguage() ✅
            └─ All specs properly mapped
       
       EditLanguageModal
       ├─ Calls updateLanguage()
       │  └─ Returns mapped data ✅
       └─ Same format as parent ✅
       
       VisibilitySettingsModal
       ├─ Calls updateLanguage()
       │  └─ Returns mapped data ✅
       └─ Same format as parent ✅

OverviewTab reads language.specs.alphabetScript
  └─ Works! Data is properly mapped ✅
```

---

## Files Changed

### Core Service
- `src/services/languageService.ts`
  - Enhanced `updateLanguage()` with logging
  - Added `case_sensitive` support
  - Clarified error messages

### UI Components
- `src/components/language-detail/EditLanguageModal.tsx`
  - Now uses service function
  - Removed direct Supabase query
  - Consistent response handling

- `src/components/language-detail/VisibilitySettingsModal.tsx`
  - Now uses service function
  - Removed direct Supabase query
  - Consistent response handling

### Debug Utilities
- `src/services/debugLanguageService.ts` *(NEW)*
  - Comprehensive diagnostic tests
  - Tests data fetching, specs, permissions, mapping
  
- `src/pages/DebugLanguagePage.tsx` *(NEW)*
  - UI for running diagnostics
  - Shows test results and console output
  - Route: `/debug/languages/:languageId`

### Routing
- `src/App.tsx`
  - Added debug route

---

## How to Verify Fix is Working

### ✅ Verification Checklist

- [ ] Language detail page loads without "Failed to fetch language" error
- [ ] Overview tab shows Alphabet/Script (not "Unspecified")
- [ ] Overview tab shows Writing Direction (not "Unspecified")
- [ ] Overview tab shows Word Order (not "Unspecified")
- [ ] Overview tab shows Case Sensitive correctly (Yes/No)
- [ ] Edit modal opens with pre-filled data
- [ ] Editing language name and description saves successfully
- [ ] Visibility changes save successfully
- [ ] No "Failed to save" errors appear
- [ ] Debug page tests all show ✅ (except maybe mapping which might be noisy)
- [ ] Browser console shows detailed logs (can trace exact failure point)

### If Something Still Fails

1. **Go to debug page**: `http://localhost:5173/debug/languages/{languageId}`
2. **Run All Tests** button
3. **Check console output** (F12 > Console)
4. **Note the error code** (PGRST116, PGRST204, etc.)
5. **Report which step failed** with the error code
6. Agent can then debug the specific issue

---

## Next Steps

Once P1.4 is verified working:
1. Create comprehensive E2E tests
2. Add language specs editing UI
3. Implement collaborator management
4. Move to P1.5 (Languages List)

---

**Updated:** December 31, 2025  
**Status:** Ready for Testing ✅

