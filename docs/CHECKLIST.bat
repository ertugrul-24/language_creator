@echo off
REM Supabase Fix Implementation Checklist (Windows Version)
REM Use this to track your progress through the implementation

title LinguaFabric - Supabase Language Creation Fix

cls
echo.
echo 🚀 LinguaFabric - Supabase Language Creation Fix
echo ==================================================
echo.
echo This script provides a checklist for implementing the fix.
echo Follow each step carefully and mark completion.
echo.
pause

cls
echo PHASE 1: PREPARATION
echo ====================
echo.
echo [ ] Have you read docs\SUMMARY.md?
echo     - Quick overview of the problem and solution
echo.
echo [ ] Do you have access to Supabase Dashboard?
echo     - Go to https://app.supabase.com
echo.
echo [ ] Is your project running locally?
echo     - npm run dev should be running
echo.
pause

cls
echo PHASE 2: APPLY SQL FIX #1 (User Creation Trigger)
echo ==================================================
echo.
echo Step 1: Open Supabase Dashboard
echo   [ ] Navigate to: SQL Editor
echo.
echo Step 2: Run Trigger SQL
echo   [ ] Click: New Query
echo   [ ] Open file: docs\SUPABASE_FIXES.sql
echo   [ ] Copy entire file content
echo   [ ] Paste into SQL Editor
echo   [ ] Click: Run
echo.
echo Step 3: Verify Success
echo   [ ] No errors in output
echo   [ ] See: 'CREATE FUNCTION created successfully'
echo   [ ] See: 'CREATE TRIGGER created successfully'
echo.
pause

cls
echo PHASE 3: APPLY SQL FIX #2 (RLS Policies)
echo =========================================
echo.
echo Step 1: Open Supabase Dashboard
echo   [ ] Still in SQL Editor
echo.
echo Step 2: Run RLS Policies SQL
echo   [ ] Click: New Query
echo   [ ] Open file: docs\SUPABASE_RLS_IMPROVEMENTS.sql
echo   [ ] Copy entire file content
echo   [ ] Paste into SQL Editor
echo   [ ] Click: Run
echo.
echo Step 3: Verify Success
echo   [ ] No errors in output (DROP warnings are OK)
echo   [ ] See: 'CREATE POLICY created successfully' (4 times)
echo.
pause

cls
echo PHASE 4: VERIFY IMPLEMENTATION
echo ===============================
echo.
echo Run these verification queries in Supabase SQL Editor:
echo.
echo Query 1: Check Trigger Function
echo   [ ] Copy and run this:
echo       SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';
echo   [ ] Expected: 1 row with 'handle_new_user'
echo.
echo Query 2: Check RLS Policies
echo   [ ] Copy and run this:
echo       SELECT policyname FROM pg_policies WHERE tablename = 'language_collaborators';
echo   [ ] Expected: 4 rows (delete, insert, select, update)
echo.
echo Query 3: Check Users Table
echo   [ ] Copy and run this:
echo       SELECT column_name FROM information_schema.columns WHERE table_name = 'users';
echo   [ ] Expected: auth_id, email, display_name, etc.
echo.
pause

cls
echo PHASE 5: TEST IN APPLICATION
echo =============================
echo.
echo Test 1: Sign Up New User
echo   [ ] Go to: http://localhost:5173
echo   [ ] Navigate to: Sign Up page
echo   [ ] Fill form with unique email
echo   [ ] Password: TestPassword123
echo   [ ] Click: Sign Up
echo   [ ] Check: No errors in browser console
echo.
echo Test 2: Verify User in Database
echo   [ ] Supabase Dashboard - Table Editor
echo   [ ] Click: users table
echo   [ ] Look for: Your new user
echo   [ ] Check: auth_id, email, display_name populated
echo.
echo Test 3: Create a Language
echo   [ ] Navigate to: Create New Language
echo   [ ] Fill form with test data
echo   [ ] Click: Create Language
echo   [ ] Check: No errors in browser console
echo   [ ] Look for: Checkmarks in logs
echo.
echo Test 4: Verify in Database
echo   [ ] Supabase Dashboard - Table Editor
echo   [ ] Check: languages table - new language exists
echo   [ ] Check: language_collaborators - owner entry exists
echo.
pause

cls
echo PHASE 6: SUCCESS CRITERIA
echo =========================
echo.
echo All of these must pass:
echo.
echo Database Checks:
echo   [ ] Trigger function exists
echo   [ ] 4 RLS policies exist for language_collaborators
echo   [ ] users table has auth_id column
echo   [ ] languages table has owner_id column
echo.
echo Application Checks:
echo   [ ] New user appears in users table after signup
echo   [ ] No errors in browser console during signup
echo   [ ] Language creation completes without errors
echo   [ ] Console shows checkmarks at each step
echo.
echo Database Consistency:
echo   [ ] Every language has an owner_id
echo   [ ] Every language has at least one collaborator (owner)
echo   [ ] User IDs match between tables
echo.
pause

cls
echo PHASE 7: TROUBLESHOOTING
echo ========================
echo.
echo If something fails, check:
echo.
echo Issue: 'Collaborator insert failed'
echo   [ ] Run in SQL: SELECT * FROM users WHERE auth_id = 'your-id';
echo   [ ] If no result, trigger didn't fire
echo   [ ] Solution: Sign up a new user
echo.
echo Issue: 'RLS policy error'
echo   [ ] Verify policies exist with Query 2
echo   [ ] Re-run: docs\SUPABASE_RLS_IMPROVEMENTS.sql
echo.
echo Issue: 'Language won't create'
echo   [ ] Check browser console for specific error
echo   [ ] Verify name is unique per user
echo   [ ] Verify all required fields filled
echo.
pause

cls
echo PHASE 8: DOCUMENTATION
echo ======================
echo.
echo Reference docs have been created:
echo   - docs\README_SUPABASE_FIX.md - Start here
echo   - docs\SUMMARY.md - Visual overview
echo   - docs\QUICK_REFERENCE.md - 5-minute guide
echo   - docs\IMPLEMENTATION_GUIDE.md - Complete guide
echo   - docs\SUPABASE_FIXES.sql - Trigger SQL
echo   - docs\SUPABASE_RLS_IMPROVEMENTS.sql - Policies SQL
echo.
echo For detailed help:
echo   - See: docs\IMPLEMENTATION_GUIDE.md#troubleshooting
echo   - See: docs\QUICK_REFERENCE.md
echo.
pause

cls
echo.
echo =============================================
echo    IMPLEMENTATION COMPLETE!
echo =============================================
echo.
echo Next steps:
echo   1. Mark all checkboxes above
echo   2. If all pass: You're done! ✓
echo   3. If any fail: Check troubleshooting section
echo   4. Document any issues found
echo.
echo For detailed info:
echo   - Read: docs\IMPLEMENTATION_GUIDE.md
echo   - Quick help: docs\QUICK_REFERENCE.md
echo   - Visual: docs\SUMMARY.md
echo.
pause
