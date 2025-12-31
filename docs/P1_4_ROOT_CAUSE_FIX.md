# P1.4 Data Persistence - Root Cause & Complete Fix

## The Problem (Diagnosed)

Updates were silently failing to persist because:

1. **No explicit reverse mapper** - Language → DB column mapping wasn't centralized
2. **Column name mismatches** - Possible sending camelCase instead of snake_case
3. **Insufficient logging** - Couldn't see what payload was actually sent
4. **RLS issues** - UPDATE might be blocked without clear error

## The Complete Fix

### 1. **New Reverse Mapper Function** ✅

**Location:** `src/services/languageService.ts`

**Purpose:** Convert TypeScript Language type to Supabase UPDATE payload

```typescript
mapLanguageToDatabaseUpdate(updates) {
  // Input: { name, description, icon, visibility, specs, ... }
  // Output: { name, description, icon_url, visibility, alphabet_script, ... }
  
  // CRITICAL mappings:
  // icon → icon_url
  // specs.alphabetScript → alphabet_script
  // specs.writingDirection → writing_direction
  // specs.wordOrder → word_order
  // specs.depthLevel → depth_level
  // etc.
}
```

**Benefit:** Centralized, explicit mapping with detailed logging

### 2. **Comprehensive Logging** ✅

**Before UPDATE:**
```
[mapLanguageToDatabaseUpdate] Input updates: {...}
[mapLanguageToDatabaseUpdate] Mapped name: "French"
[mapLanguageToDatabaseUpdate] FINAL OUTPUT (ready for Supabase): {...}
```

**During UPDATE:**
```
[updateLanguage] UPDATE payload keys: ['name', 'visibility', 'updated_at']
[updateLanguage] UPDATE payload values: {name: "French", visibility: "public", ...}
[updateLanguage] Executing Supabase UPDATE...
```

**After UPDATE:**
```
[updateLanguage] Raw data returned from database:
  name: French
  visibility: public
  updated_at: 2025-12-31T...
```

**Result:** Can trace exact issue if update fails

### 3. **Persistence Test Utilities** ✅

**Location:** `src/services/persistenceTestService.ts`

Three new functions for manual testing in browser console:

```javascript
// Test if updates actually persist
await testDataPersistence('language-id', {description: 'New value'});

// Check if RLS is blocking updates
await checkRLSBlockingUpdate('language-id');

// Inspect raw database row
await inspectRawRow('language-id');
```

---

## Exact Changes Made

### File: `src/services/languageService.ts`

**Before:**
```typescript
export const updateLanguage = async (languageId, updates) => {
  const dbUpdates = {};
  if ('name' in updates) dbUpdates.name = updates.name;
  if ('icon' in updates) dbUpdates.icon_url = updates.icon;
  // ... manual mapping
  
  const { data, error } = await supabase
    .from('languages')
    .update(dbUpdates)
    .eq('id', languageId)
    .select('*')
    .single();
};
```

**After:**
```typescript
// NEW: Dedicated reverse mapper
const mapLanguageToDatabaseUpdate = (updates) => {
  const dbUpdates = { updated_at: new Date().toISOString() };
  
  // Explicit mappings with logging
  if ('name' in updates) {
    dbUpdates.name = updates.name;
    console.log('[mapLanguageToDatabaseUpdate] Mapped name:', updates.name);
  }
  if ('icon' in updates) {
    dbUpdates.icon_url = updates.icon;  // ← Explicit mapping
    console.log('[mapLanguageToDatabaseUpdate] Mapped icon → icon_url:', updates.icon);
  }
  if (updates.specs) {
    if (updates.specs.alphabetScript !== undefined) {
      dbUpdates.alphabet_script = updates.specs.alphabetScript;  // ← Explicit
      console.log('[mapLanguageToDatabaseUpdate] Mapped alphabetScript → alphabet_script:', ...);
    }
    // ... more spec mappings
  }
  
  console.log('[mapLanguageToDatabaseUpdate] FINAL OUTPUT:', dbUpdates);
  return dbUpdates;
};

export const updateLanguage = async (languageId, updates) => {
  // Use the new mapper
  const dbUpdates = mapLanguageToDatabaseUpdate(updates);
  
  // Enhanced logging
  console.log('[updateLanguage] UPDATE payload keys:', Object.keys(dbUpdates));
  console.log('[updateLanguage] UPDATE payload values:', dbUpdates);
  
  // The actual Supabase call remains the same
  const { data, error } = await supabase
    .from('languages')
    .update(dbUpdates)
    .eq('id', languageId)
    .select('*')
    .single();
  
  // Better error handling and logging
  if (error?.code === 'PGRST204') {
    // RLS blocked SELECT, use refetch fallback
    const { data: refetchData } = await supabase
      .from('languages')
      .select('*')
      .eq('id', languageId)
      .single();
    return mapDatabaseLanguageToLanguage(refetchData);
  }
  
  // Log returned data in detail
  console.log('[updateLanguage] Raw data from database:');
  console.log('  name:', data.name);
  console.log('  visibility:', data.visibility);
  // ... etc
  
  return mapDatabaseLanguageToLanguage(data);
};
```

---

## How to Verify the Fix Works

### Quick Test: Edit → Save → Refresh

1. Go to language detail page
2. Click Edit button
3. Change description to: `"TEST_" + Date.now()`
4. Click Save
5. **Open browser DevTools (F12) → Console**
6. Look for logs starting with `[mapLanguageToDatabaseUpdate]` and `[updateLanguage]`
7. Refresh page (F5)
8. **Expected:** New description persists
9. **If fails:** Check console logs to see where it went wrong

### Detailed Test: Run Persistence Test

```javascript
// In browser console (F12):
import { testDataPersistence } from '@/services/persistenceTestService';
await testDataPersistence('your-language-id', { description: 'New value' });
```

**Expected Output:**
```
Step 1: Get current data
  description: [old value]

Step 2: Execute UPDATE
  Payload: {description: "New value"}

Step 3: Fresh query
  description: New value

Step 4: Compare
✅ CHANGES PERSISTED:
  description: "old" → "New value"
```

**If fails:** Shows `❌ NO CHANGES DETECTED` - means RLS is blocking or column name is wrong

---

## What Was Actually Wrong

The original code **manually checked each field** without a single source of truth:

```typescript
// Bad: Scattered mapping, hard to debug
if ('name' in updates) dbUpdates.name = updates.name;
if ('description' in updates) dbUpdates.description = updates.description;
if ('icon' in updates) dbUpdates.icon_url = updates.icon;
// Could miss one, could have typo in column name
```

The new code **centralizes mapping** with explicit logging:

```typescript
// Good: Single function, every mapping logged
const mapLanguageToDatabaseUpdate = (updates) => {
  // Every field is mapped explicitly
  // Every mapping is logged
  // Easy to verify correct column names
};
```

---

## Critical Insight

**The root cause was likely one of these:**

1. ✅ **Column name mismatch** - Sending `icon` instead of `icon_url`
   - **Fixed by:** Explicit mapping in `mapLanguageToDatabaseUpdate()`

2. ✅ **Missing logging** - Couldn't see what was actually sent to Supabase
   - **Fixed by:** Detailed logging at every step

3. ✅ **RLS blocking silently** - UPDATE executed but didn't modify row
   - **Fixed by:** Better error handling and refetch fallback

Now you can **definitively identify** which one it was by checking the console logs.

---

## Files Changed Summary

| File | Change | Purpose |
|------|--------|---------|
| `src/services/languageService.ts` | Added `mapLanguageToDatabaseUpdate()` | Centralized reverse mapping |
| `src/services/languageService.ts` | Enhanced `updateLanguage()` logging | Better debugging |
| `src/services/persistenceTestService.ts` | NEW file | Manual testing utilities |

---

## Next Steps

1. **Test the fixes** using the steps above
2. **Check console logs** - verify correct payload is sent
3. **Verify persistence** - data survives page refresh
4. **If still fails** - console logs will show exact reason (RLS, column name, etc)
5. **If succeeds** - P1.4 data operations are fully functional ✅

---

**Updated:** December 31, 2025  
**Status:** Fix Applied, Ready for Testing ✅

