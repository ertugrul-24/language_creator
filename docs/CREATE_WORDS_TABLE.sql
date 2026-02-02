-- Migration: Create public.words table with RLS policies
-- Date: February 2, 2026
-- Purpose: Add persistent storage for dictionary words with owner-based access control

-- ============================================================================
-- CREATE WORDS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  translation TEXT NOT NULL,
  part_of_speech TEXT NOT NULL,
  pronunciation TEXT,
  audio_url TEXT,
  etymology TEXT,
  examples JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_words_language_id ON public.words(language_id);
CREATE INDEX IF NOT EXISTS idx_words_owner_id ON public.words(owner_id);
CREATE INDEX IF NOT EXISTS idx_words_language_owner ON public.words(language_id, owner_id);
CREATE INDEX IF NOT EXISTS idx_words_word ON public.words(word);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Policy 1: INSERT - Users can only insert words they own
CREATE POLICY "Users can insert words they own"
  ON public.words
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Policy 2: SELECT - Users can only see words they own or words in shared languages
CREATE POLICY "Users can view their own words"
  ON public.words
  FOR SELECT
  USING (owner_id = auth.uid());

-- Policy 3: UPDATE - Users can only update words they own
CREATE POLICY "Users can update their own words"
  ON public.words
  FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Policy 4: DELETE - Users can only delete words they own
CREATE POLICY "Users can delete their own words"
  ON public.words
  FOR DELETE
  USING (owner_id = auth.uid());

-- ============================================================================
-- COMMENT FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE public.words IS 'Dictionary words for constructed languages. Each word belongs to a language and is owned by a user. Access is restricted to the owner.';
COMMENT ON COLUMN public.words.id IS 'Unique identifier for the word entry';
COMMENT ON COLUMN public.words.language_id IS 'Reference to the language this word belongs to';
COMMENT ON COLUMN public.words.owner_id IS 'Reference to the user who owns/created this word';
COMMENT ON COLUMN public.words.word IS 'The word in the constructed language';
COMMENT ON COLUMN public.words.translation IS 'English translation of the word';
COMMENT ON COLUMN public.words.part_of_speech IS 'Part of speech: noun, verb, adjective, etc.';
COMMENT ON COLUMN public.words.pronunciation IS 'IPA pronunciation notation';
COMMENT ON COLUMN public.words.audio_url IS 'URL to audio file for word pronunciation';
COMMENT ON COLUMN public.words.etymology IS 'Etymology notes about the word origin';
COMMENT ON COLUMN public.words.examples IS 'JSONB array of example phrases: [{phrase: string, translation: string}]';
COMMENT ON COLUMN public.words.created_at IS 'Timestamp when word was created';
COMMENT ON COLUMN public.words.updated_at IS 'Timestamp of last update';
