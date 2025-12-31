# Phase 1.3 Testing Checklist - Create Language in Supabase

## Manual Testing Guide

This guide walks you through testing the complete language creation flow with verification at each step.

---

## Prerequisites Check

### ✅ Before You Start

```bash
# 1. Verify .env.local is configured
cat .env.local
# Should show:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-key

# 2. Dev server running
npm run dev
# Should start without errors

# 3. Browser dev tools open
# Press F12 to open Console tab
# You'll see all [createLanguage] logs here
```

---

## Test Flow: End-to-End Language Creation

### Step 1: Navigate to Create Language Page

1. **Open app:** http://localhost:5173
2. **Login** with test account (if not already logged in)
3. **Click:** "Create Language" button (or go to `/new-language`)
4. **Verify:** You see the form with "Basic Info" and "Language Specs" tabs

**Console Check:**
```
✅ No errors on page load
✅ User ID logged in console
```

---

### Step 2: Fill Out Basic Form

1. **Name:** Enter: `Test Language Alpha` (unique name)
2. **Description:** Enter a 10+ character description, e.g.:
   ```
   This is a test language created on Dec 31, 2025
   ```
3. **Icon:** Select emoji (or use default 🌍)
4. **Click:** "Next: Language Specs" button

**Console Check:**
```
✅ No validation errors shown
✅ Form accepts input without errors
```

---

### Step 3: Fill Out Language Specs

1. **Alphabet Script:** Select "Latin"
2. **Writing Direction:** Select "LTR"
3. **Phoneme Set:**
   - Click "Add Phoneme"
   - Add 5+ phonemes (minimum required):
     - Symbol: `a`, IPA: `/a/`
     - Symbol: `e`, IPA: `/ɛ/`
     - Symbol: `i`, IPA: `/i/`
     - Symbol: `o`, IPA: `/o/`
     - Symbol: `u`, IPA: `/u/`
   - (Audio upload optional, skip for now)
4. **Depth Level:** Select "Realistic" (or test warning with "Simplified")
5. **Word Order:** Select "SVO"
6. **Case Sensitive:** Toggle ON or OFF (choose one)
7. **Custom Specs:** Optional, skip for basic test

**Console Check:**
```
✅ Validation passes
✅ Specs logged before submission
```

---

### Step 4: Submit Form

**Click:** "Create Language" button

**Console Watch (Critical):**

Look for this sequence in Console (press F12 → Console tab):

```
✅ [createLanguage] Starting with userId: user-id-here, name: Test Language Alpha
✅ [createLanguage] Checking for duplicate names...
✅ [createLanguage] No duplicates found. Preparing insert data...
✅ [createLanguage] Specs provided: { alphabetScript: "Latin", ... }
✅ [createLanguage] Note: Specs will be stored in Phase 1.2+ database schema
✅ [createLanguage] Inserting language data: { owner_id: "...", name: "Test Language Alpha", ... }
✅ [createLanguage] Language inserted successfully. ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
✅ [createLanguage] Adding user as collaborator...
✅ [createLanguage] Collaborator added successfully
✅ [createLanguage] Initial stats prepared: { totalWords: 0, totalRules: 0, ... }
✅ [createLanguage] Activity logging deferred to Phase 1.3
✅ [createLanguage] Complete! Returning language data
```

**Expected Behavior:**
- ✅ Form disappears
- ✅ Page redirects to `/languages/{languageId}` (language detail page)
- ✅ Language detail page starts loading
- ✅ No error messages shown

---

## Step 5: Verify Database Entries

### Check 1: Language Record in Supabase

1. **Open Supabase Dashboard:** https://supabase.com → Your Project
2. **Go to:** SQL Editor (or Table Editor)
3. **Run Query:**
   ```sql
   SELECT * FROM languages 
   WHERE name = 'Test Language Alpha'
   LIMIT 1;
   ```

4. **Verify These Fields:**
   - ✅ `id`: UUID (auto-generated)
   - ✅ `owner_id`: Matches your user ID
   - ✅ `name`: `Test Language Alpha`
   - ✅ `description`: Your entered description
   - ✅ `icon`: Your selected emoji
   - ✅ `created_at`: Recent timestamp (just now)
   - ✅ `updated_at`: Same as created_at

**Example Result:**
```
id                                   | owner_id | name                  | description                           | icon | created_at
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx | user-id  | Test Language Alpha   | This is a test language created... | 🌍   | 2025-12-31T...
```

### Check 2: Collaborator Entry

1. **Run Query:**
   ```sql
   SELECT * FROM language_collaborators 
   WHERE language_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
   ```
   (Replace with the language ID from above)

2. **Verify:**
   - ✅ One row exists
   - ✅ `language_id`: Matches language from Check 1
   - ✅ `user_id`: Matches your user ID
   - ✅ `role`: `owner`
   - ✅ `joined_at`: Recent timestamp

**Example Result:**
```
language_id                          | user_id | role  | joined_at
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx | user-id | owner | 2025-12-31T...
```

---

## Step 6: Test Error Scenarios

### Error Scenario 1: Duplicate Language Name

**What to do:**
1. Go back and create another language
2. **Fill Form:**
   - Name: `Test Language Alpha` (SAME NAME)
   - Description: Different description
   - Icon: Different emoji
3. **Click:** Create Language
4. **Specs Tab:** Fill any valid specs

**Expected:**
- ❌ Form should NOT submit
- ❌ Error message: "You already have a language with this name"
- ❌ You stay on form page

**Console Check:**
```
[createLanguage] Duplicate check found existing language
[createLanguage] Throwing duplicate name error
```

---

### Error Scenario 2: Empty Required Field

**What to do:**
1. **Try creating with empty name**
2. Leave Name empty
3. Click Create

**Expected:**
- ❌ Validation error shows: "Language name is required"
- ❌ Form doesn't submit

---

### Error Scenario 3: Description Too Short

**What to do:**
1. Name: `Test Language Beta`
2. Description: `Short` (less than 10 chars)
3. Click Create

**Expected:**
- ❌ Error: "Description must be at least 10 characters"

---

### Error Scenario 4: Invalid Specs (Too Few Phonemes)

**What to do:**
1. Basic Info: Fill correctly
2. Language Specs:
   - Add only 2 phonemes (minimum is 5)
   - Leave other fields valid
3. Click Create

**Expected:**
- ❌ Error on Specs tab: "Minimum 5 phonemes recommended"
- ❌ Form auto-advances to Specs tab

---

## Step 7: Verify Form → Database Match

### Create Test Language v2

**Create a second language with specific values:**

Form Data:
```
Name:         MyTestLang_UniqueID_001
Description:  Test language with specific values to verify matching
Icon:         📚
Alphabet:     Cyrillic
Direction:    LTR
Word Order:   SVO
Case Sens:    ON
```

Phonemes (exactly 5):
```
Symbol: ж, IPA: /ʒ/
Symbol: ч, IPA: /tʃ/
Symbol: ш, IPA: /ʃ/
Symbol: щ, IPA: /ʃtʃ/
Symbol: ы, IPA: /ɪ/
```

**After Creation:**

1. **Check Console:**
   ```
   [createLanguage] Specs provided: {
     alphabetScript: "Cyrillic",
     writingDirection: "LTR",
     phonemeCount: 5,
     depthLevel: "realistic",
     wordOrder: "SVO",
     caseSensitive: true,
   }
   ```

2. **Check Database:**
   ```sql
   SELECT * FROM languages 
   WHERE name = 'MyTestLang_UniqueID_001';
   ```

3. **Verify Match:**
   | Field | Form | Database | Match |
   |-------|------|----------|-------|
   | name | MyTestLang_UniqueID_001 | ✅ Same | ✅ |
   | description | Test language with... | ✅ Same | ✅ |
   | icon | 📚 | ✅ Same | ✅ |
   | owner_id | Your user ID | ✅ Same | ✅ |

   ⚠️ **Note:** Specs fields (alphabet, phonemes, etc.) are NOT yet in database (Phase 1.2 feature). Console shows them but they're not persisted.

---

## Step 8: Check Logging Quality

### What Good Logging Looks Like

**Open Console, create a language, watch for:**

✅ **Informative log messages:**
```
[createLanguage] Starting with userId: ...
[createLanguage] No duplicates found.
[createLanguage] Language inserted successfully. ID: ...
```

✅ **Helpful on errors:**
```
[createLanguage] Duplicate check failed: ...
[createLanguage] Exception caught: You already have a language...
```

✅ **Timestamps:** Each log shows when action occurred

### Verify Logging Works

1. **Open DevTools Console**
2. **Filter:** Type `createLanguage` in filter box
3. **Create a language**
4. **See:** All 8+ log messages

---

## Success Criteria Checklist

### ✅ All Tests Must Pass

- [ ] Supabase connection works (no errors on app load)
- [ ] Form validates and accepts input
- [ ] Language record created in database
- [ ] Collaborator entry created with role "owner"
- [ ] Database fields match form data entered
- [ ] Duplicate name error prevents creation
- [ ] Empty field errors work
- [ ] Invalid specs (< 5 phonemes) error works
- [ ] Logs show all 8 steps of createLanguage()
- [ ] Redirect to `/languages/{id}` works
- [ ] No database errors in browser console

### 🎯 Phase 1.3 Complete When:

All items above are ✅ AND:

- [ ] Can create 3+ test languages
- [ ] Each creates database entries
- [ ] Error scenarios handled gracefully
- [ ] Logging is clear and helpful
- [ ] No bugs or crashes

---

## Troubleshooting

### Issue: "Supabase connection failed"

**Solution:**
```bash
# Check environment variables
cat .env.local

# Should have:
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

# If missing, add them from Supabase dashboard
# Project Settings → API → Copy URL and anon key
```

---

### Issue: "Language name is required" (Form won't submit)

**Solution:**
- Make sure name is 2-50 characters
- Make sure description is 10-500 characters
- Make sure specs tab is valid (5+ phonemes)

---

### Issue: "Form redirects but no language visible on detail page"

**Solution:**
- This is expected in Phase 1.3 (detail page not yet built)
- Just verify database entry was created
- Phase 1.4 will build the detail page

---

### Issue: Logs not showing in console

**Solution:**
1. Open DevTools: F12
2. Go to Console tab
3. Refresh page: Ctrl+R
4. Try creating language again
5. Logs should appear (filter by "createLanguage")

---

## Next Steps

After Phase 1.3 Testing Complete:

- ✅ P1.3: Create language in Supabase ← YOU ARE HERE
- 🔄 P1.4: Build language dashboard/detail page
- 🔄 P1.5: Build languages list page
- 🔄 P1.6: Implement language editing
- 🔄 P1.7: Update dashboard home page

---

## Recording Results

After running all tests, document:

```
Test Date: Dec 31, 2025
Tester: [Your Name]

✅ Basic form validation: PASS
✅ Language creation: PASS
✅ Database entry: PASS
✅ Collaborator entry: PASS
✅ Duplicate error: PASS
✅ Invalid specs error: PASS
✅ Form-Database match: PASS
✅ Logging quality: PASS
✅ Redirect to detail page: PASS

Result: PHASE 1.3 ✅ READY FOR PHASE 1.4
```

---

**Version:** 1.0  
**Last Updated:** December 31, 2025  
**Status:** Ready for Testing
