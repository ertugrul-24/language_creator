# P1.4 Testing Guide - Language Dashboard

**Purpose:** Manual testing checklist for the language detail page  
**Status:** Ready for Testing  
**Test Date:** January 1, 2026

---

## Prerequisites

1. ✅ Project running locally (`npm run dev`)
2. ✅ Supabase connection working
3. ✅ Authentication working (can login)
4. ✅ At least one language created in database
5. ✅ Browser dev tools open for console checking

---

## Test Scenarios

### Scenario 1: Owner Viewing Their Language

**Steps:**
1. Login as user who created a language
2. Navigate to `/languages/{languageId}` (or click language from list)
3. Verify page loads

**Assertions:**
- [ ] Language header displays with correct icon, name, owner
- [ ] Gradient background visible
- [ ] All 4 tabs visible: Overview, Dictionary, Rules, Courses
- [ ] Word/Rule count badges show (if count > 0)
- [ ] "Edit Language" button visible
- [ ] Visibility button visible (e.g., "🔒 Private")
- [ ] Console shows ✅ "Language fetched successfully"

---

### Scenario 2: Overview Tab - Expandable Sections

**Steps:**
1. Click "Overview" tab (should be default)
2. Verify all 4 sections present:
   - Basic Information
   - Phonology & Script
   - Grammar & Syntax
   - Statistics
3. Click on "Basic Information" header
4. Verify section collapses (arrow changes to ▶)
5. Click again to expand
6. Verify section content visible (arrow is ▼)

**Assertions:**
- [ ] Basic Information section:
  - [ ] Language Name displays
  - [ ] Icon emoji shows
  - [ ] Description displays (if present)
- [ ] Phonology & Script section:
  - [ ] Alphabet/Script shows (e.g., "Latin")
  - [ ] Writing Direction shows (e.g., "LTR")
  - [ ] Vowel count displays
  - [ ] Consonant count displays
  - [ ] Phoneme set shows as colored tags with IPA
- [ ] Grammar & Syntax section:
  - [ ] Word Order displays
  - [ ] Case Sensitive shows (✓ Yes or ✗ No)
  - [ ] Depth Level shows (with ⚠️ warning if "simplified")
- [ ] Statistics section:
  - [ ] Total Words card shows (blue background)
  - [ ] Grammar Rules card shows (green background)
  - [ ] Contributors card shows (purple background)
  - [ ] Numbers match language data

---

### Scenario 3: Dictionary Tab

**Steps:**
1. Click "Dictionary" tab
2. Verify table loads with columns: Word | Translation | Part of Speech | Pronunciation
3. Type in search box (search term from a word)
4. Verify results filter (table updates)
5. Clear search, select a Part of Speech from dropdown
6. Verify results filter by POS

**Assertions:**
- [ ] Dictionary header shows "📖 X words in this language"
- [ ] Table displays with correct columns
- [ ] Each row shows: word, translation, POS badge, pronunciation
- [ ] Search filters by word name (case-insensitive)
- [ ] Search filters by translation (case-insensitive)
- [ ] POS dropdown filters by category
- [ ] "All Parts of Speech" option present
- [ ] Result counter shows "Showing X of Y words"
- [ ] Edit/Delete buttons visible (if owner/editor)
- [ ] If no words: message "No words in this language yet"

---

### Scenario 4: Rules Tab

**Steps:**
1. Click "Rules" tab
2. Verify cards display for each rule
3. Select a category from filter dropdown
4. Verify rules filter by category
5. Select "All Categories" from dropdown
6. Verify all rules show again

**Assertions:**
- [ ] Rules header shows "📝 X grammar rules"
- [ ] Category filter dropdown has all unique categories
- [ ] Each rule card shows:
  - [ ] Category icon (🔤 🏗️ 📐 💬)
  - [ ] Rule name
  - [ ] Rule type badge (morphology, phoneme_rule, etc.)
  - [ ] Description
  - [ ] Pattern (if present)
  - [ ] Examples list with input → output
- [ ] Category filter works (cards appear/disappear)
- [ ] Edit/Delete buttons visible (if owner/editor)
- [ ] Result counter at bottom
- [ ] If no rules: message "No grammar rules yet"

---

### Scenario 5: Courses Tab

**Steps:**
1. Click "Courses" tab
2. Verify course cards display (if courses exist)
3. Check each card's information

**Assertions:**
- [ ] Courses header shows "📚 X course(s)"
- [ ] Each course card shows:
  - [ ] Gradient header with title
  - [ ] Description (if present)
  - [ ] Visibility badge (public/private)
  - [ ] Lesson count (blue card)
  - [ ] Enrolled count (green card)
  - [ ] View button
  - [ ] Edit button (if owner only)
  - [ ] Delete button (if owner only)
- [ ] If no courses: message "No courses for this language yet"
- [ ] Create Course button visible (if owner/editor)

---

### Scenario 6: Edit Language Modal

**Steps:**
1. Owner/Editor: Click "Edit Language" button
2. Modal opens
3. Change name to something different
4. Change description
5. Change icon to different emoji (max 1-2 chars)
6. Click "Save Changes"
7. Verify modal closes and page updates

**Assertions:**
- [ ] Modal displays with title "Edit Language"
- [ ] Form fields pre-fill with current values
- [ ] Name field is required
- [ ] Icon field shows preview emoji
- [ ] Icon input maxLength is 2
- [ ] Save button disabled until changes made
- [ ] Cancel button closes modal without saving
- [ ] Saving state shows "Saving..." on button
- [ ] After save, modal closes
- [ ] Language header updates with new values
- [ ] Console shows ✅ "Language updated successfully"
- [ ] Supabase updated_at timestamp updates

---

### Scenario 7: Visibility Settings Modal

**Steps:**
1. Click visibility button (e.g., "🔒 Private")
2. Modal opens
3. Verify all 3 options present:
   - Private (🔒)
   - Friends Only (👥)
   - Public (🌐)
4. Select "Public"
5. Verify warning message appears
6. Click "Save"
7. Verify modal closes
8. Visibility button updates

**Assertions:**
- [ ] Modal shows "Visibility Settings"
- [ ] Current selection is highlighted with blue border
- [ ] Each option has icon, label, description
- [ ] Private: "Only you can see this language"
- [ ] Friends Only: "Only your friends can see this language"
- [ ] Public: "Anyone can view and learn from this language"
- [ ] Selecting Public shows ⚠️ warning
- [ ] Save button disabled if no change made
- [ ] Cancel button closes without saving
- [ ] After save, header visibility updates
- [ ] Console shows ✅ "Visibility updated to: public"
- [ ] Supabase language.visibility updates

---

### Scenario 8: Viewer Role - Read-Only Access

**Steps:**
1. Share language with another user as "viewer"
2. Login as that viewer
3. Navigate to shared language
4. Verify interface is read-only

**Assertions:**
- [ ] Language loads correctly
- [ ] All tabs accessible
- [ ] "Edit Language" button NOT visible
- [ ] Visibility button visible but disabled
- [ ] "Add Word" button NOT visible
- [ ] "Add Rule" button NOT visible
- [ ] "Create Course" button NOT visible
- [ ] Edit/Delete buttons in tabs NOT visible
- [ ] User can view all data but cannot modify

---

### Scenario 9: Editor Role - Edit Access

**Steps:**
1. Share language with another user as "editor"
2. Login as that editor
3. Navigate to shared language
4. Try editing visibility

**Assertions:**
- [ ] Language loads correctly
- [ ] "Edit Language" button IS visible
- [ ] "Add Word" button IS visible
- [ ] "Add Rule" button IS visible
- [ ] "Create Course" button IS visible
- [ ] Edit/Delete buttons visible in tabs
- [ ] Can click Edit Language button
- [ ] Can click visibility button and save changes
- [ ] Cannot see Delete Language option (owner only)

---

### Scenario 10: Missing Language

**Steps:**
1. Navigate to non-existent language ID: `/languages/nonexistent-id`
2. Wait for page to load

**Assertions:**
- [ ] Shows error message: "Language not found"
- [ ] Shows "Back to Languages" button
- [ ] Back button navigates to `/languages` list
- [ ] Console shows ❌ error message

---

### Scenario 11: Loading State

**Steps:**
1. On slow network (DevTools: Network tab, set to "Slow 3G")
2. Navigate to language page
3. Verify loading spinner shows

**Assertions:**
- [ ] LoadingSpinner displays while fetching
- [ ] Centered on page
- [ ] Spinning animation visible
- [ ] After data loads, content replaces spinner
- [ ] No "Loading..." message in tabs while loading

---

### Scenario 12: Error Handling

**Steps:**
1. Modify database permissions to deny access
2. Try to update language visibility
3. Verify error displays

**Assertions:**
- [ ] Error message displays in modal
- [ ] Button still clickable (retry enabled)
- [ ] Console shows ❌ error
- [ ] User-friendly error message shown (not raw error)
- [ ] Modal can be closed with X button

---

### Scenario 13: Role-Based Button Visibility

**Test Owner:**
- [ ] "Edit Language" button visible ✓
- [ ] Visibility button clickable and saveable ✓
- [ ] "Add Word" button visible ✓
- [ ] Edit/Delete on all items visible ✓

**Test Editor:**
- [ ] "Edit Language" button visible ✓
- [ ] Visibility button clickable and saveable ✓
- [ ] "Add Word" button visible ✓
- [ ] Edit/Delete on all items visible ✓

**Test Viewer:**
- [ ] "Edit Language" button NOT visible ✗
- [ ] Visibility button disabled ✗
- [ ] "Add Word" button NOT visible ✗
- [ ] Edit/Delete on all items NOT visible ✗
- [ ] Can view all data ✓

---

### Scenario 14: Responsive Design

**Test on Mobile (375px width):**
1. Open page on mobile device or DevTools
2. Verify layout adapts

**Assertions:**
- [ ] Header content stacks vertically
- [ ] Icon, name, buttons visible without scrolling
- [ ] Tabs remain visible
- [ ] Tables become scrollable horizontally (or collapse)
- [ ] Modals fit screen with scrolling
- [ ] Buttons large enough to tap (44px+ height)

**Test on Tablet (768px width):**
- [ ] Two-column layouts visible
- [ ] Cards display in 2-column grid

**Test on Desktop (1920px width):**
- [ ] Three-column course grid
- [ ] Full width tables
- [ ] Expandable sections all visible

---

### Scenario 15: Dark Mode

**Steps:**
1. Verify application in dark mode
2. Check all components

**Assertions:**
- [ ] Header gradient visible and readable
- [ ] Text colors readable (white/light gray)
- [ ] Input fields have dark background
- [ ] Modals have dark background
- [ ] Badges/badges visible and readable
- [ ] No white text on white background
- [ ] No contrast issues

---

## Console Logging Checklist

Expected console messages (with ✅ or ❌ prefix):

```
✅ Language fetched successfully: {language_object}
✅ Owner fetched: {display_name}
✅ User role determined: owner
✅ Language updated successfully
✅ Visibility updated to: public
❌ Error fetching language: [error_message]
❌ Error updating language: [error_message]
❌ Error fetching dictionary: [error_message]
```

---

## Performance Checks

**Browser DevTools - Network Tab:**
- [ ] Initial page load < 2 seconds
- [ ] Language query returns < 1 second
- [ ] Dictionary query returns < 1 second
- [ ] Modal save completes < 1 second

**Browser DevTools - React Profiler:**
- [ ] No excessive re-renders
- [ ] Components render efficiently
- [ ] No memory leaks

---

## Accessibility Checklist

- [ ] Tab navigation works (keyboard)
- [ ] Buttons keyboard accessible
- [ ] Modals have proper focus management
- [ ] Buttons have visible focus state
- [ ] Color not only indicator (badges have text)
- [ ] Form labels associated with inputs
- [ ] Error messages associated with fields

---

## Final Checklist

Before marking P1.4 as complete:

- [ ] All 15 scenarios pass
- [ ] No console errors (only expected logs)
- [ ] Mobile, tablet, desktop all work
- [ ] Dark mode works
- [ ] Supabase queries work (check in browser DevTools)
- [ ] Modals open/close smoothly
- [ ] Permissions work correctly
- [ ] No broken links
- [ ] Navigation works between tabs
- [ ] Loading states show appropriately
- [ ] Error messages display correctly
- [ ] Documentation updated

---

## Known Limitations / Future Work

- ⏳ "Add Word" button is placeholder (P2.2)
- ⏳ "Add Rule" button is placeholder (P2.6)
- ⏳ "Create Course" button is placeholder (P2.9)
- ⏳ Edit word/rule/course functionality (P2.3+)
- ⏳ Delete confirmation modal
- ⏳ Undo functionality
- ⏳ Real-time collaboration indicators
- ⏳ Activity logging for changes

---

**Test Completion Date:** _______________  
**Tester Name:** _______________  
**Pass/Fail:** _______________  
**Notes:** ___________________________________
