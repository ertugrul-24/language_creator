-- ============================================================================
-- LinguaFabric Supabase Row Level Security (RLS) Policies
-- ============================================================================
--
-- This file defines Row Level Security policies for all tables.
-- These policies enforce permissions at the database level.
--
-- Learning Goals:
-- - Understand database-level security (defense in depth)
-- - Learn how RLS policies enforce business logic
-- - Practice writing SQL security rules
-- - Understand the principle of least privilege
--
-- HOW TO USE:
-- 1. Copy all policies from this file
-- 2. Go to Supabase Dashboard → SQL Editor
-- 3. Paste each policy and run
-- 4. Verify each policy created successfully
--
-- IMPORTANT:
-- - RLS must be ENABLED on all tables (done in schema.sql)
-- - These policies work alongside frontend permission checks
-- - Always assume users might bypass frontend validation
--

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY users_view_own_profile ON users FOR SELECT
  USING (auth.uid() = auth_id);

-- Users can view public profiles of others
CREATE POLICY users_view_public_profiles ON users FOR SELECT
  USING (TRUE) -- Relaxed for public profiles; frontend can restrict based on privacy settings

-- Users can update their own profile
CREATE POLICY users_update_own_profile ON users FOR UPDATE
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- ============================================================================
-- LANGUAGES TABLE POLICIES
-- ============================================================================

-- Users can view:
-- 1. Public languages (everyone)
-- 2. Languages they own
-- 3. Languages they collaborate on
-- 4. Languages from friends (if you implement friendship visibility)
CREATE POLICY languages_select ON languages FOR SELECT
  USING (
    visibility = 'public'
    OR owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM language_collaborators
      WHERE language_id = languages.id
      AND user_id = auth.uid()
    )
  );

-- Users can insert languages
CREATE POLICY languages_insert ON languages FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Only owner or editors can update languages
CREATE POLICY languages_update ON languages FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM language_collaborators
      WHERE language_id = languages.id
      AND user_id = auth.uid()
      AND role = 'editor'
    )
  )
  WITH CHECK (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM language_collaborators
      WHERE language_id = languages.id
      AND user_id = auth.uid()
      AND role = 'editor'
    )
  );

-- Only owner can delete languages
CREATE POLICY languages_delete ON languages FOR DELETE
  USING (owner_id = auth.uid());

-- ============================================================================
-- LANGUAGE COLLABORATORS TABLE POLICIES
-- ============================================================================

-- Anyone can view collaborators for public/accessible languages
CREATE POLICY language_collaborators_select ON language_collaborators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM languages
      WHERE id = language_collaborators.language_id
      AND (
        visibility = 'public'
        OR owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM language_collaborators lc
          WHERE lc.language_id = languages.id
          AND lc.user_id = auth.uid()
        )
      )
    )
  );

-- Only language owner can add collaborators
CREATE POLICY language_collaborators_insert ON language_collaborators FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM languages
      WHERE id = language_collaborators.language_id
      AND owner_id = auth.uid()
    )
  );

-- Only language owner can modify/remove collaborators
CREATE POLICY language_collaborators_update ON language_collaborators FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM languages
      WHERE id = language_collaborators.language_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY language_collaborators_delete ON language_collaborators FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM languages
      WHERE id = language_collaborators.language_id
      AND owner_id = auth.uid()
    )
  );

-- ============================================================================
-- DICTIONARY ENTRIES TABLE POLICIES
-- ============================================================================

-- Users can view words in:
-- 1. Public languages
-- 2. Languages they own/collaborate on
CREATE POLICY dictionary_entries_select ON dictionary_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM languages
      WHERE id = dictionary_entries.language_id
      AND (
        visibility = 'public'
        OR owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM language_collaborators
          WHERE language_id = languages.id
          AND user_id = auth.uid()
        )
      )
    )
  );

-- Users can add words to languages they own or edit
CREATE POLICY dictionary_entries_insert ON dictionary_entries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM languages
      WHERE id = dictionary_entries.language_id
      AND (
        owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM language_collaborators
          WHERE language_id = languages.id
          AND user_id = auth.uid()
          AND role = 'editor'
        )
      )
    )
  );

-- Users can update words they added or are editors of language
CREATE POLICY dictionary_entries_update ON dictionary_entries FOR UPDATE
  USING (
    auth.uid() = added_by
    OR EXISTS (
      SELECT 1 FROM languages
      WHERE id = dictionary_entries.language_id
      AND (
        owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM language_collaborators
          WHERE language_id = languages.id
          AND user_id = auth.uid()
          AND role = 'editor'
        )
      )
    )
  );

-- Only word author or language owner/editor can delete
CREATE POLICY dictionary_entries_delete ON dictionary_entries FOR DELETE
  USING (
    auth.uid() = added_by
    OR EXISTS (
      SELECT 1 FROM languages
      WHERE id = dictionary_entries.language_id
      AND (
        owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM language_collaborators
          WHERE language_id = languages.id
          AND user_id = auth.uid()
          AND role = 'editor'
        )
      )
    )
  );

-- ============================================================================
-- GRAMMAR RULES TABLE POLICIES
-- ============================================================================

-- Same permissions as dictionary entries
CREATE POLICY grammar_rules_select ON grammar_rules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM languages
      WHERE id = grammar_rules.language_id
      AND (
        visibility = 'public'
        OR owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM language_collaborators
          WHERE language_id = languages.id
          AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY grammar_rules_insert ON grammar_rules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM languages
      WHERE id = grammar_rules.language_id
      AND (
        owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM language_collaborators
          WHERE language_id = languages.id
          AND user_id = auth.uid()
          AND role = 'editor'
        )
      )
    )
  );

CREATE POLICY grammar_rules_update ON grammar_rules FOR UPDATE
  USING (
    auth.uid() = added_by
    OR EXISTS (
      SELECT 1 FROM languages
      WHERE id = grammar_rules.language_id
      AND (
        owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM language_collaborators
          WHERE language_id = languages.id
          AND user_id = auth.uid()
          AND role = 'editor'
        )
      )
    )
  );

CREATE POLICY grammar_rules_delete ON grammar_rules FOR DELETE
  USING (
    auth.uid() = added_by
    OR EXISTS (
      SELECT 1 FROM languages
      WHERE id = grammar_rules.language_id
      AND (
        owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM language_collaborators
          WHERE language_id = languages.id
          AND user_id = auth.uid()
          AND role = 'editor'
        )
      )
    )
  );

-- ============================================================================
-- COURSES TABLE POLICIES
-- ============================================================================

CREATE POLICY courses_select ON courses FOR SELECT
  USING (
    visibility = 'public'
    OR creator_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM course_enrollments
      WHERE course_id = courses.id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY courses_insert ON courses FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY courses_update ON courses FOR UPDATE
  USING (creator_id = auth.uid());

CREATE POLICY courses_delete ON courses FOR DELETE
  USING (creator_id = auth.uid());

-- ============================================================================
-- ACTIVITY TABLE POLICIES
-- ============================================================================

-- Users can view:
-- 1. Their own activity (always)
-- 2. Public activity from others
-- 3. Friends-only activity from friends (future: implement friendship checks)
CREATE POLICY activity_select ON activity FOR SELECT
  USING (
    user_id = auth.uid()
    OR visibility = 'public'
  );

-- Users can insert their own activity
CREATE POLICY activity_insert ON activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update/delete their own activity
CREATE POLICY activity_update ON activity FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY activity_delete ON activity FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FRIENDSHIPS TABLE POLICIES
-- ============================================================================

-- Users can view their own friendships
CREATE POLICY friendships_select ON friendships FOR SELECT
  USING (
    auth.uid() = user_id_1
    OR auth.uid() = user_id_2
  );

-- Users can create friend requests (insert as user_id_1)
CREATE POLICY friendships_insert ON friendships FOR INSERT
  WITH CHECK (auth.uid() = user_id_1);

-- Users can accept/decline requests or block friends
CREATE POLICY friendships_update ON friendships FOR UPDATE
  USING (
    auth.uid() = user_id_1
    OR auth.uid() = user_id_2
  );

CREATE POLICY friendships_delete ON friendships FOR DELETE
  USING (
    auth.uid() = user_id_1
    OR auth.uid() = user_id_2
  );

-- ============================================================================
-- COLLABORATION INVITES TABLE POLICIES
-- ============================================================================

-- Inviter or invitee can view invitation
CREATE POLICY collaboration_invites_select ON collaboration_invites FOR SELECT
  USING (
    auth.uid() = inviter_id
    OR auth.jwt() ->> 'email' = invitee_email -- Match by email (user may not have account yet)
    OR EXISTS (
      SELECT 1 FROM languages
      WHERE id = collaboration_invites.language_id
      AND owner_id = auth.uid()
    )
  );

-- Only language owner can create invitations
CREATE POLICY collaboration_invites_insert ON collaboration_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM languages
      WHERE id = collaboration_invites.language_id
      AND owner_id = auth.uid()
    )
  );

-- Only inviter or language owner can update (accept/decline)
CREATE POLICY collaboration_invites_update ON collaboration_invites FOR UPDATE
  USING (
    auth.uid() = inviter_id
    OR EXISTS (
      SELECT 1 FROM languages
      WHERE id = collaboration_invites.language_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY collaboration_invites_delete ON collaboration_invites FOR DELETE
  USING (
    auth.uid() = inviter_id
    OR EXISTS (
      SELECT 1 FROM languages
      WHERE id = collaboration_invites.language_id
      AND owner_id = auth.uid()
    )
  );

-- ============================================================================
-- LESSONS TABLE POLICIES
-- ============================================================================

CREATE POLICY lessons_select ON lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE id = lessons.course_id
      AND (
        visibility = 'public'
        OR creator_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM course_enrollments
          WHERE course_id = courses.id
          AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY lessons_insert ON lessons FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses
      WHERE id = lessons.course_id
      AND creator_id = auth.uid()
    )
  );

CREATE POLICY lessons_update ON lessons FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE id = lessons.course_id
      AND creator_id = auth.uid()
    )
  );

CREATE POLICY lessons_delete ON lessons FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE id = lessons.course_id
      AND creator_id = auth.uid()
    )
  );

-- ============================================================================
-- COURSE ENROLLMENTS TABLE POLICIES
-- ============================================================================

-- Users can view their own enrollments
CREATE POLICY course_enrollments_select ON course_enrollments FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM courses
      WHERE id = course_enrollments.course_id
      AND creator_id = auth.uid()
    )
  );

-- Users can enroll themselves
CREATE POLICY course_enrollments_insert ON course_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY course_enrollments_update ON course_enrollments FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can unenroll themselves
CREATE POLICY course_enrollments_delete ON course_enrollments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FLASHCARDS TABLE POLICIES
-- ============================================================================

CREATE POLICY flashcards_select ON flashcards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE id = flashcards.lesson_id
      AND EXISTS (
        SELECT 1 FROM courses
        WHERE id = lessons.course_id
        AND (
          visibility = 'public'
          OR creator_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM course_enrollments
            WHERE course_id = courses.id
            AND user_id = auth.uid()
          )
        )
      )
    )
  );

CREATE POLICY flashcards_insert ON flashcards FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE id = flashcards.lesson_id
      AND EXISTS (
        SELECT 1 FROM courses
        WHERE id = lessons.course_id
        AND creator_id = auth.uid()
      )
    )
  );

CREATE POLICY flashcards_update ON flashcards FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE id = flashcards.lesson_id
      AND EXISTS (
        SELECT 1 FROM courses
        WHERE id = lessons.course_id
        AND creator_id = auth.uid()
      )
    )
  );

CREATE POLICY flashcards_delete ON flashcards FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE id = flashcards.lesson_id
      AND EXISTS (
        SELECT 1 FROM courses
        WHERE id = lessons.course_id
        AND creator_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- SECURITY PRINCIPLES APPLIED:
-- 1. **Least Privilege:** Users only see/modify what they should
-- 2. **Multi-level checks:** Uses nested EXISTS for proper permission inheritance
-- 3. **Ownership-based:** Most tables check owner or creator_id
-- 4. **Role-based:** Language collaborators have role-based permissions
-- 5. **Frontend + Backend:** RLS policies are ENFORCED; frontend checks are UX
--
-- TESTING YOUR POLICIES:
-- 1. Create a test user account
-- 2. Create a private language as test user
-- 3. Try to view/edit as different user (should fail)
-- 4. Make language public (should now be visible)
-- 5. Add collaborator (should have edit permissions)
--
-- COMMON ISSUES:
-- - RLS not enabled on table → policies don't work
-- - Using wrong table name → policy creation fails
-- - Circular dependencies → test with sample queries
-- - Performance → consider adding indexes to auth.uid() columns
--
