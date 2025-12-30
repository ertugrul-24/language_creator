-- LinguaFabric Database Schema for Supabase (PostgreSQL)
-- This schema supports all features from Phase 0-3

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  profile_image_url TEXT,
  activity_permissions TEXT DEFAULT 'friends_only' CHECK (activity_permissions IN ('public', 'friends_only', 'private')),
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  default_language_depth TEXT DEFAULT 'realistic' CHECK (default_language_depth IN ('realistic', 'simplified')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on auth_id for faster lookups
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- LANGUAGES TABLE
-- ============================================================================
CREATE TABLE languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'friends', 'public')),
  
  -- Language Specifications
  alphabet_script TEXT, -- e.g., "Latin", "Cyrillic", "Custom"
  writing_direction TEXT DEFAULT 'ltr' CHECK (writing_direction IN ('ltr', 'rtl', 'boustrophedon')),
  depth_level TEXT DEFAULT 'realistic' CHECK (depth_level IN ('realistic', 'simplified')),
  word_order TEXT, -- e.g., "SVO", "SOV", "VSO"
  case_sensitive BOOLEAN DEFAULT FALSE,
  vowel_count INTEGER,
  consonant_count INTEGER,
  
  -- Metadata
  icon_url TEXT,
  cover_image_url TEXT,
  tags TEXT[], -- Array of tags
  
  -- Stats (denormalized for performance)
  total_words INTEGER DEFAULT 0,
  total_rules INTEGER DEFAULT 0,
  total_contributors INTEGER DEFAULT 1,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_languages_owner_id ON languages(owner_id);
CREATE INDEX idx_languages_visibility ON languages(visibility);

-- ============================================================================
-- LANGUAGE COLLABORATORS (Many-to-Many)
-- ============================================================================
CREATE TABLE language_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(language_id, user_id)
);

CREATE INDEX idx_language_collaborators_language_id ON language_collaborators(language_id);
CREATE INDEX idx_language_collaborators_user_id ON language_collaborators(user_id);

-- ============================================================================
-- PHONEMES TABLE (Language-specific)
-- ============================================================================
CREATE TABLE phonemes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  ipa_notation TEXT, -- International Phonetic Alphabet
  audio_url TEXT, -- URL to audio file
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(language_id, symbol)
);

CREATE INDEX idx_phonemes_language_id ON phonemes(language_id);

-- ============================================================================
-- DICTIONARY TABLE (Words)
-- ============================================================================
CREATE TABLE dictionary_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  translation TEXT NOT NULL,
  part_of_speech TEXT, -- noun, verb, adjective, etc.
  pronunciation_ipa TEXT,
  audio_url TEXT,
  etymology_note TEXT,
  approval_status TEXT DEFAULT 'draft' CHECK (approval_status IN ('draft', 'approved')),
  added_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_dictionary_language_id ON dictionary_entries(language_id);
CREATE INDEX idx_dictionary_word ON dictionary_entries(word);
CREATE INDEX idx_dictionary_added_by ON dictionary_entries(added_by);

-- ============================================================================
-- EXAMPLE PHRASES (for dictionary entries)
-- ============================================================================
CREATE TABLE example_phrases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID NOT NULL REFERENCES dictionary_entries(id) ON DELETE CASCADE,
  phrase TEXT NOT NULL,
  translation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_example_phrases_entry_id ON example_phrases(entry_id);

-- ============================================================================
-- GRAMMAR RULES TABLE
-- ============================================================================
CREATE TABLE grammar_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- morphology, phonology, syntax, pragmatics
  rule_type TEXT, -- phoneme_rule, inflection, word_order, agreement
  pattern TEXT,
  approval_status TEXT DEFAULT 'draft' CHECK (approval_status IN ('draft', 'approved')),
  added_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_grammar_rules_language_id ON grammar_rules(language_id);
CREATE INDEX idx_grammar_rules_category ON grammar_rules(category);
CREATE INDEX idx_grammar_rules_added_by ON grammar_rules(added_by);

-- ============================================================================
-- GRAMMAR RULE EXAMPLES
-- ============================================================================
CREATE TABLE rule_examples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id UUID NOT NULL REFERENCES grammar_rules(id) ON DELETE CASCADE,
  input_text TEXT NOT NULL,
  output_text TEXT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rule_examples_rule_id ON rule_examples(rule_id);

-- ============================================================================
-- COURSES TABLE
-- ============================================================================
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
  total_enrolled INTEGER DEFAULT 0,
  average_completion NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_courses_language_id ON courses(language_id);
CREATE INDEX idx_courses_creator_id ON courses(creator_id);

-- ============================================================================
-- LESSONS TABLE (within courses)
-- ============================================================================
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  lesson_order INTEGER NOT NULL,
  lesson_type TEXT, -- vocab, grammar, pronunciation, mixed
  content TEXT, -- markdown content
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lessons_course_id ON lessons(course_id);

-- ============================================================================
-- FLASHCARDS TABLE (within lessons)
-- ============================================================================
CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  front_text TEXT NOT NULL,
  back_text TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_flashcards_lesson_id ON flashcards(lesson_id);

-- ============================================================================
-- QUIZ QUESTIONS TABLE (within lessons)
-- ============================================================================
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT, -- multiple_choice, fill_blank, true_false
  correct_answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quiz_questions_lesson_id ON quiz_questions(lesson_id);

-- ============================================================================
-- COURSE ENROLLMENTS
-- ============================================================================
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  progress_percentage NUMERIC DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(course_id, user_id)
);

CREATE INDEX idx_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX idx_enrollments_user_id ON course_enrollments(user_id);

-- ============================================================================
-- ACTIVITY LOG TABLE
-- ============================================================================
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- language_created, word_added, rule_added, course_created, course_completed
  language_id UUID REFERENCES languages(id) ON DELETE SET NULL,
  description TEXT,
  visibility TEXT DEFAULT 'friends_only' CHECK (visibility IN ('public', 'friends_only', 'private')),
  metadata JSONB, -- Additional data as needed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_language_id ON activity_log(language_id);
CREATE INDEX idx_activity_created_at ON activity_log(created_at DESC);

-- ============================================================================
-- FRIENDS TABLE
-- ============================================================================
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id_1 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id_2 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  requested_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CHECK (user_id_1 < user_id_2), -- Prevent duplicates
  UNIQUE(user_id_1, user_id_2)
);

CREATE INDEX idx_friendships_user_id_1 ON friendships(user_id_1);
CREATE INDEX idx_friendships_user_id_2 ON friendships(user_id_2);
CREATE INDEX idx_friendships_status ON friendships(status);

-- ============================================================================
-- COLLABORATION INVITES TABLE
-- ============================================================================
CREATE TABLE collaboration_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invited_user_email TEXT NOT NULL,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_invites_language_id ON collaboration_invites(language_id);
CREATE INDEX idx_invites_invited_user_email ON collaboration_invites(invited_user_email);
CREATE INDEX idx_invites_status ON collaboration_invites(status);

-- ============================================================================
-- UPDATE TIMESTAMPS TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_languages_updated_at BEFORE UPDATE ON languages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dictionary_updated_at BEFORE UPDATE ON dictionary_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grammar_rules_updated_at BEFORE UPDATE ON grammar_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invites_updated_at BEFORE UPDATE ON collaboration_invites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS (ROW LEVEL SECURITY) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE language_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE phonemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dictionary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE example_phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammar_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_invites ENABLE ROW LEVEL SECURITY;

-- Users: Can read own profile, can update own profile
CREATE POLICY users_select ON users FOR SELECT USING (auth.uid() = auth_id);
CREATE POLICY users_update ON users FOR UPDATE USING (auth.uid() = auth_id);

-- Languages: Public languages visible to all, private only to owner/collaborators
CREATE POLICY languages_select ON languages FOR SELECT USING (
  visibility = 'public' OR 
  owner_id = auth.uid() OR
  EXISTS (SELECT 1 FROM language_collaborators WHERE language_id = languages.id AND user_id = auth.uid())
);

CREATE POLICY languages_insert ON languages FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY languages_update ON languages FOR UPDATE USING (
  owner_id = auth.uid() OR
  EXISTS (SELECT 1 FROM language_collaborators WHERE language_id = languages.id AND user_id = auth.uid() AND role IN ('owner', 'editor'))
);

-- Add more RLS policies as needed per table

-- ============================================================================
-- REAL-TIME SUBSCRIPTIONS (Supabase feature)
-- ============================================================================
-- Enable real-time for these tables in Supabase Dashboard:
-- - languages
-- - dictionary_entries
-- - grammar_rules
-- - courses
-- - activity_log
