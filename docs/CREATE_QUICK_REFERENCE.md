# CREATE ISSUE - QUICK REFERENCE

## 🎯 What Was Wrong

| Problem | Cause | Impact |
|---------|-------|--------|
| Specs = "Unspecified" | alphabet_script NULL | Users can't see language config |
| Visibility resets | visibility NULL | Can't save privacy settings |
| Dashboard = 0 languages | language_collaborators empty | Can't see created languages |
| Collaborators missing | INSERT not happening or RLS blocking | Permission system broken |

---

## ✅ What We Fixed

```
createLanguage() was doing:
  INSERT INTO languages (owner_id, name, description, icon_url)

createLanguage() now does:
  INSERT INTO languages (
    owner_id, name, description, icon_url,
    visibility, alphabet_script, writing_direction,
    case_sensitive, depth_level, word_order,
    vowel_count, consonant_count
  )
```

**Result:** All fields populated instead of NULL

---

## 🧪 Quick Test (30 seconds)

1. Open http://localhost:5174
2. Press F12 → Console
3. Create a language
4. **Watch console for:**
   - `[createLanguage] ✅ Language inserted successfully`
   - `[createLanguage] ✅ Collaborator added successfully`
5. **If you see errors** → Copy them and provide

---

## 🔍 Verify in Supabase

```sql
-- Should show: visibility='private', writing_direction='ltr'
SELECT id, name, visibility, writing_direction, depth_level
FROM languages ORDER BY created_at DESC LIMIT 1;

-- Should show: 1 row with role='owner'
SELECT * FROM language_collaborators 
WHERE language_id = (SELECT id FROM languages ORDER BY created_at DESC LIMIT 1);
```

---

## 📋 Expected After Fix

- [ ] Console shows no errors
- [ ] Specs not showing "Unspecified"
- [ ] Visibility = "Private" persists after refresh
- [ ] Dashboard shows language count = 1+
- [ ] language_collaborators table has rows

---

## 🚨 If Anything Fails

**Error in console?** → Copy full error code and message
**Specs still "Unspecified"?** → Check Supabase SQL query result
**Dashboard still 0?** → Check if collaborators row exists
**Visibility reset?** → Check database visibility column

---

## 📚 Full Documentation

- **Root cause analysis:** [CREATE_FIX_SUMMARY.md](CREATE_FIX_SUMMARY.md)
- **Code changes:** [CREATE_FIX_CODE_CHANGES.md](CREATE_FIX_CODE_CHANGES.md)
- **Step-by-step testing:** [TESTING_CREATE_FIX.md](TESTING_CREATE_FIX.md)
- **Full diagnostics:** [CREATE_ISSUE_DIAGNOSTIC.md](CREATE_ISSUE_DIAGNOSTIC.md)

---

**Status:** Ready for testing ✅
**Dev Server:** http://localhost:5174
**Code Modified:** src/services/languageService.ts

